#!/usr/bin/env node
// Auditoría de rendimiento de una URL con Playwright (sin Lighthouse).
//
//   node perf-check.mjs <url> [--out=dir] [--throttle] [--mobile] [--runs=1]
//
// --throttle  emula red "Fast 3G" (1.6 Mbps / 150 ms) y CPU x4 vía CDP. Sin él,
//             mide en condiciones locales (útil para comparar antes/después).
// --mobile    viewport 375x812 con touch. Por defecto 1440x900.
// --runs      número de cargas; se reporta la mediana de las métricas.
//
// Mide: TTFB, FCP, LCP (+ elemento), CLS (+ fuentes de layout shift), Long tasks /
// TBT aprox, peso por tipo de recurso, recursos más pesados, render-blocking,
// imágenes (sin dimensiones, sobredimensionadas, sin lazy, formato antiguo),
// fuentes (font-display, preload), tamaño del DOM, terceros, errores de consola.
// Solo detecta; no cambia nada.

import path from 'node:path';
import {
    parseArgs, usage, launchChromium, contextOptionsFromUrl, stripCredentials,
    writeJson, printSummary, printTop, REPORTS_ROOT, kb,
} from '../../../lib/audit-lib.mjs';

const { positional: [url], flags } = parseArgs();
if (!url) usage('Uso: node perf-check.mjs <url> [--out=dir] [--throttle] [--mobile] [--runs=1]');

const OUT = path.resolve(flags.out || path.join(REPORTS_ROOT, 'perf'));
const RUNS = Math.max(1, Number(flags.runs || 1));
const MOBILE = Boolean(flags.mobile);
const THROTTLE = Boolean(flags.throttle);

// Umbrales (Core Web Vitals "good")
const T = { lcp: 2500, cls: 0.1, fcp: 1800, ttfb: 800, tbt: 200, js: 300 * 1024, css: 100 * 1024, img: 1024 * 1024, fonts: 200 * 1024, dom: 1500 };

const initScript = () => {
    window.__perf = { lcp: null, lcpEl: null, cls: 0, shifts: [], longTasks: [] };
    try {
        new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__perf.lcp = e.startTime; window.__perf.lcpEl = e.element ? (e.element.tagName.toLowerCase() + (e.element.className && typeof e.element.className === 'string' ? '.' + e.element.className.trim().split(/\s+/)[0] : '') + (e.url ? ' ' + e.url.slice(-60) : '')) : null; } }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((l) => { for (const e of l.getEntries()) { if (!e.hadRecentInput) { window.__perf.cls += e.value; if (e.value > 0.01) window.__perf.shifts.push({ value: +e.value.toFixed(4), time: Math.round(e.startTime), sources: (e.sources || []).slice(0, 3).map((s) => s.node ? s.node.tagName?.toLowerCase() + (s.node.className && typeof s.node.className === 'string' ? '.' + s.node.className.trim().split(/\s+/)[0] : '') : '?') }); } } }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__perf.longTasks.push({ start: Math.round(e.startTime), duration: Math.round(e.duration) }); }).observe({ type: 'longtask', buffered: true });
    } catch { /* navegador sin soporte */ }
};

function collectInPage() {
    const nav = performance.getEntriesByType('navigation')[0];
    const paint = Object.fromEntries(performance.getEntriesByType('paint').map((p) => [p.name, Math.round(p.startTime)]));
    const res = performance.getEntriesByType('resource');
    const typeOf = (r) => {
        const n = r.name.split('?')[0].toLowerCase();
        if (r.initiatorType === 'script' || /\.m?js$/.test(n)) return 'script';
        if (r.initiatorType === 'css' || r.initiatorType === 'link' && /\.css$/.test(n) || /\.css$/.test(n)) return 'css';
        if (/\.(png|jpe?g|gif|webp|avif|svg|ico)$/.test(n) || r.initiatorType === 'img') return 'image';
        if (/\.(woff2?|ttf|otf|eot)$/.test(n)) return 'font';
        if (/\.(mp4|webm|mp3|ogg)$/.test(n) || r.initiatorType === 'video') return 'media';
        if (r.initiatorType === 'fetch' || r.initiatorType === 'xmlhttprequest') return 'xhr';
        return 'other';
    };
    const byType = {};
    const list = res.map((r) => {
        const t = typeOf(r);
        const size = r.transferSize || r.encodedBodySize || 0;
        byType[t] = byType[t] || { count: 0, bytes: 0 };
        byType[t].count++; byType[t].bytes += size;
        return { url: r.name, type: t, bytes: size, duration: Math.round(r.duration), cached: r.transferSize === 0 && r.decodedBodySize > 0, thirdParty: !r.name.startsWith(location.origin) };
    });

    // Render blocking en <head>
    const headScripts = [...document.head.querySelectorAll('script[src]')].filter((s) => !s.async && !s.defer && s.type !== 'module').map((s) => s.src.slice(-80));
    const headStyles = [...document.head.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href.slice(-80));
    const inlineStyleBytes = [...document.querySelectorAll('style')].reduce((n, s) => n + (s.textContent || '').length, 0);

    // Imágenes
    const vh = window.innerHeight;
    const imgs = [...document.images].map((img) => {
        const r = img.getBoundingClientRect();
        const src = (img.currentSrc || img.src || '').split('?')[0];
        return {
            src: src.slice(-80), aboveFold: r.top < vh, rendered: { w: Math.round(r.width), h: Math.round(r.height) }, natural: { w: img.naturalWidth, h: img.naturalHeight },
            hasDims: img.hasAttribute('width') && img.hasAttribute('height'), lazy: img.loading === 'lazy', srcset: Boolean(img.srcset), fetchpriority: img.getAttribute('fetchpriority'), format: (src.match(/\.(\w+)$/) || [])[1]?.toLowerCase(),
        };
    }).filter((i) => i.rendered.w > 0);

    // Fuentes
    const faces = [];
    let preloadFonts = [...document.querySelectorAll('link[rel="preload"][as="font"]')].length;
    for (const sheet of document.styleSheets) { let rules; try { rules = sheet.cssRules; } catch { continue; } for (const r of rules) if (r.type === CSSRule.FONT_FACE_RULE) faces.push({ family: r.style.getPropertyValue('font-family'), display: r.style.getPropertyValue('font-display') || 'auto' }); }

    // DOM
    const all = document.querySelectorAll('*');
    let depth = 0; for (const el of all) { let d = 0, n = el; while (n.parentElement) { d++; n = n.parentElement; } if (d > depth) depth = d; }

    return {
        timing: { ttfb: Math.round(nav?.responseStart || 0), domContentLoaded: Math.round(nav?.domContentLoadedEventEnd || 0), load: Math.round(nav?.loadEventEnd || 0), fcp: paint['first-contentful-paint'] ?? null, lcp: window.__perf?.lcp != null ? Math.round(window.__perf.lcp) : null, lcpElement: window.__perf?.lcpEl, cls: +(window.__perf?.cls || 0).toFixed(4), shifts: window.__perf?.shifts || [], longTasks: window.__perf?.longTasks || [] },
        transfer: { html: nav?.transferSize || 0, byType, total: list.reduce((n, r) => n + r.bytes, 0) + (nav?.transferSize || 0) },
        resources: list, headScripts, headStyles, inlineStyleBytes, images: imgs, fonts: { faces, preloadFonts }, dom: { nodes: all.length, depth },
    };
}

const median = (arr) => { const a = [...arr].filter((v) => v != null).sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : null; };

const browser = await launchChromium();
const runs = [];
let consoleErrors = [];
try {
    for (let i = 0; i < RUNS; i++) {
        const context = await browser.newContext({ viewport: MOBILE ? { width: 375, height: 812 } : { width: 1440, height: 900 }, isMobile: MOBILE, hasTouch: MOBILE, ...contextOptionsFromUrl(url) });
        const page = await context.newPage();
        consoleErrors = [];
        page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
        page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message.slice(0, 200)}`));
        if (THROTTLE) {
            const cdp = await context.newCDPSession(page);
            await cdp.send('Network.enable');
            await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
            await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
        }
        await page.addInitScript(initScript);
        try { await page.goto(url, { waitUntil: 'load', timeout: 60000 }); } catch { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); }
        await page.waitForTimeout(1500);
        // Scroll suave para forzar lazy-loads y capturar shifts tardíos; luego volver arriba.
        await page.evaluate(async () => { const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += 800) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo(0, 0); });
        await page.waitForTimeout(800);
        const data = await page.evaluate(collectInPage);
        data.consoleErrors = consoleErrors;
        runs.push(data);
        console.log(`  run ${i + 1}: TTFB ${data.timing.ttfb}ms · FCP ${data.timing.fcp}ms · LCP ${data.timing.lcp}ms · CLS ${data.timing.cls} · ${kb(data.transfer.total)}`);
        await context.close();
    }
} finally {
    await browser.close();
}

// Métricas = mediana; detalle = última ejecución
const last = runs[runs.length - 1];
const metrics = {
    ttfb: median(runs.map((r) => r.timing.ttfb)), fcp: median(runs.map((r) => r.timing.fcp)), lcp: median(runs.map((r) => r.timing.lcp)), cls: median(runs.map((r) => r.timing.cls)),
    lcpElement: last.timing.lcpElement, tbtApprox: last.timing.longTasks.reduce((n, t) => n + Math.max(0, t.duration - 50), 0), longTasks: last.timing.longTasks.length, load: median(runs.map((r) => r.timing.load)),
};

const issues = [];
const push = (severity, id, message, extra = {}) => issues.push({ severity, id, message, ...extra });

if (metrics.lcp == null) push('info', 'lcp-unavailable', 'No se pudo medir LCP (sin PerformanceObserver o sin contenido pintado).');
else if (metrics.lcp > T.lcp * 1.6) push('error', 'lcp-poor', `LCP ${metrics.lcp} ms (objetivo < ${T.lcp}). Elemento: ${metrics.lcpElement || '?'}`);
else if (metrics.lcp > T.lcp) push('warn', 'lcp-needs-improvement', `LCP ${metrics.lcp} ms (objetivo < ${T.lcp}). Elemento: ${metrics.lcpElement || '?'}`);
if (metrics.cls > T.cls * 2.5) push('error', 'cls-poor', `CLS ${metrics.cls} (objetivo < ${T.cls}).`, { shifts: last.timing.shifts.slice(0, 6) });
else if (metrics.cls > T.cls) push('warn', 'cls-needs-improvement', `CLS ${metrics.cls} (objetivo < ${T.cls}).`, { shifts: last.timing.shifts.slice(0, 6) });
if (metrics.fcp > T.fcp) push('warn', 'fcp-slow', `FCP ${metrics.fcp} ms (objetivo < ${T.fcp}).`);
if (metrics.ttfb > T.ttfb) push('warn', 'ttfb-slow', `TTFB ${metrics.ttfb} ms (objetivo < ${T.ttfb}). En Local suele ser PHP sin caché de objetos; en producción, revisar caché de página.`);
if (metrics.tbtApprox > T.tbt) push('warn', 'tbt-high', `Tiempo de bloqueo aprox. ${metrics.tbtApprox} ms en ${metrics.longTasks} tareas largas (objetivo < ${T.tbt}).`, { longTasks: last.timing.longTasks.slice(0, 8) });

const bt = last.transfer.byType;
if ((bt.script?.bytes || 0) > T.js) push('warn', 'js-heavy', `JavaScript: ${kb(bt.script.bytes)} en ${bt.script.count} ficheros (objetivo < ${kb(T.js)}). Ver bundle-report.mjs para librerías embebidas por error.`);
if ((bt.css?.bytes || 0) > T.css) push('warn', 'css-heavy', `CSS: ${kb(bt.css.bytes)} en ${bt.css.count} ficheros (objetivo < ${kb(T.css)}).`);
if ((bt.image?.bytes || 0) > T.img) push('warn', 'images-heavy', `Imágenes: ${kb(bt.image.bytes)} en ${bt.image.count} ficheros (objetivo < ${kb(T.img)}).`);
if ((bt.font?.bytes || 0) > T.fonts) push('warn', 'fonts-heavy', `Fuentes: ${kb(bt.font.bytes)} en ${bt.font.count} ficheros (objetivo < ${kb(T.fonts)}).`);
const failedFonts = last.resources.filter((r) => r.type === 'font' && r.bytes === 0 && !r.cached);
if (failedFonts.length) push('info', 'fonts-maybe-404', `${failedFonts.length} fuentes con 0 bytes transferidos (¿404? el README avisa de @font-face que no existen).`, { samples: failedFonts.slice(0, 5).map((f) => f.url.slice(-70)) });

if (last.headScripts.length) push('warn', 'render-blocking-scripts', `${last.headScripts.length} <script> síncronos en <head> (sin defer/async).`, { samples: last.headScripts.slice(0, 6) });
if (last.headStyles.length > 4) push('info', 'many-stylesheets', `${last.headStyles.length} hojas de estilo en <head>. WordPress añade varias de core; considera desregistrar las que no se usen.`, { samples: last.headStyles.slice(0, 10) });
if (last.inlineStyleBytes > 50 * 1024) push('info', 'inline-css-heavy', `${kb(last.inlineStyleBytes)} de CSS inline (theme.json global styles + bloques). Normal en FSE, pero vigilar.`);

const imgs = last.images;
const noDims = imgs.filter((i) => !i.hasDims);
if (noDims.length) push('warn', 'img-no-dimensions', `${noDims.length} imágenes sin width/height explícitos (fuente típica de CLS).`, { samples: noDims.slice(0, 6).map((i) => i.src) });
const oversized = imgs.filter((i) => i.natural.w > 0 && i.natural.w >= i.rendered.w * 2 && i.natural.w - i.rendered.w > 300 && !i.srcset);
if (oversized.length) push('warn', 'img-oversized', `${oversized.length} imágenes servidas a más del doble de su tamaño renderizado y sin srcset.`, { samples: oversized.slice(0, 6).map((i) => `${i.src} natural ${i.natural.w}px → render ${i.rendered.w}px`) });
const belowNotLazy = imgs.filter((i) => !i.aboveFold && !i.lazy);
if (belowNotLazy.length) push('info', 'img-not-lazy', `${belowNotLazy.length} imágenes bajo el pliegue sin loading="lazy".`, { samples: belowNotLazy.slice(0, 5).map((i) => i.src) });
const aboveLazy = imgs.filter((i) => i.aboveFold && i.lazy);
if (aboveLazy.length) push('warn', 'img-lazy-above-fold', `${aboveLazy.length} imágenes en el primer pantallazo con loading="lazy" (retrasa el LCP). Quitar lazy o añadir fetchpriority="high" a la del hero.`, { samples: aboveLazy.slice(0, 5).map((i) => i.src) });
const oldFormat = last.resources.filter((r) => r.type === 'image' && /\.(png|jpe?g)$/i.test(r.url.split('?')[0]) && r.bytes > 100 * 1024);
if (oldFormat.length) push('info', 'img-legacy-format', `${oldFormat.length} imágenes JPG/PNG > 100 KB: WebP/AVIF ahorrarían ~30-50 %.`, { samples: oldFormat.slice(0, 5).map((r) => `${r.url.slice(-60)} ${kb(r.bytes)}`) });

const badDisplay = last.fonts.faces.filter((f) => !/swap|optional|fallback/.test(f.display));
if (badDisplay.length) push('warn', 'font-display', `${badDisplay.length} @font-face sin font-display: swap/optional (texto invisible mientras carga).`, { samples: [...new Set(badDisplay.map((f) => f.family))].slice(0, 6) });
if (last.fonts.faces.length && !last.fonts.preloadFonts) push('info', 'font-no-preload', 'Ninguna fuente con <link rel="preload" as="font">. Precarga la de los títulos (heading) para mejorar LCP.');

if (last.dom.nodes > T.dom) push('warn', 'dom-large', `DOM con ${last.dom.nodes} nodos (profundidad ${last.dom.depth}); objetivo < ${T.dom}.`);
const third = [...new Set(last.resources.filter((r) => r.thirdParty).map((r) => new URL(r.url).host))];
if (third.length) push('info', 'third-parties', `${third.length} dominios de terceros: ${third.slice(0, 8).join(', ')}`);
if (last.consoleErrors.length) push('warn', 'console-errors', `${last.consoleErrors.length} errores en consola.`, { samples: [...new Set(last.consoleErrors)].slice(0, 6) });

const top = [...last.resources].sort((a, b) => b.bytes - a.bytes).slice(0, 12).map((r) => ({ url: r.url.slice(-90), type: r.type, kb: +(r.bytes / 1024).toFixed(1) }));

const report = { url: stripCredentials(url), generatedAt: new Date().toISOString(), conditions: { mobile: MOBILE, throttle: THROTTLE, runs: RUNS }, metrics, transfer: { total: last.transfer.total, html: last.transfer.html, byType: bt }, topResources: top, issues, summary: { errors: issues.filter((i) => i.severity === 'error').length, warnings: issues.filter((i) => i.severity === 'warn').length, info: issues.filter((i) => i.severity === 'info').length } };
const file = writeJson(OUT, 'report.json', report);
console.log(`\n  Peso total: ${kb(last.transfer.total)}  ·  ${Object.entries(bt).map(([k, v]) => `${k} ${kb(v.bytes)}`).join(' · ')}`);
printSummary('Rendimiento', issues, file);
printTop(issues);
