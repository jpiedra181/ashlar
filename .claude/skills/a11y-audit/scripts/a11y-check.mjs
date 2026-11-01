#!/usr/bin/env node
// Auditoría de accesibilidad (WCAG 2.2 AA) de una URL con axe-core + checks propios.
//
//   node a11y-check.mjs <url> [--out=dir] [--tags=wcag2a,wcag2aa,wcag21aa,wcag22aa] [--no-mobile] [--wait=3000]
//
// --wait  ms antes de lanzar axe (por defecto 3000): las entradas del tema
//         (data-intro, data-split…) duran ~2 s y, a medio animar, axe mide
//         contrastes con opacidad parcial y da falsos fallos.
//
// Qué hace:
//   1. axe-core (inyectado desde node_modules) en desktop (1440) y móvil (375).
//   2. Recorrido con Tab: detecta elementos enfocables SIN indicador de foco visible.
//   3. Estructura: landmarks, un solo <main>, un solo <h1>, saltos de nivel, skip link,
//      lang, reflow a 320px, prefers-reduced-motion, iframes/vídeos sin título/controles.
//
// Salida: <out>/report.json + resumen en consola. Solo detecta; no cambia nada.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import {
    parseArgs, usage, launchChromium, gotoSafe, contextOptionsFromUrl, stripCredentials,
    writeJson, printSummary, printTop, REPORTS_ROOT, PROJECT_ROOT,
} from '../../../lib/audit-lib.mjs';

const { positional: [url], flags } = parseArgs();
if (!url) usage('Uso: node a11y-check.mjs <url> [--out=dir] [--tags=...] [--no-mobile] [--wait=3000]');
const WAIT = Number(flags.wait ?? 3000);

const OUT = flags.out ? path.resolve(flags.out) : path.join(REPORTS_ROOT, 'a11y');
const TAGS = String(flags.tags || 'wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa,best-practice').split(',');
const VIEWPORTS = [{ name: 'desktop', width: 1440, height: 900 }];
if (!flags['no-mobile']) VIEWPORTS.push({ name: 'mobile', width: 375, height: 812, mobile: true });

// axe-core desde node_modules (llega con @wordpress/scripts; si no, npm i -D axe-core)
let axeSource;
try {
    const require = createRequire(path.join(PROJECT_ROOT, 'package.json'));
    axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
} catch {
    console.error('No se encuentra axe-core. Instálalo: npm install -D axe-core');
    process.exit(1);
}

const IMPACT_TO_SEVERITY = { critical: 'error', serious: 'error', moderate: 'warn', minor: 'info' };

// --- Checks propios (en la página) ----------------------------------------
function structuralChecks() {
    const issues = [];
    const push = (severity, id, message, extra = {}) => issues.push({ severity, id, message, ...extra });
    const txt = (el) => (el?.textContent || '').trim();
    const sel = (el) => { const c = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : ''; return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${c}`; };

    if (!document.documentElement.lang) push('error', 'html-lang', '<html> sin lang.');

    const mains = document.querySelectorAll('main, [role="main"]');
    if (mains.length === 0) push('error', 'landmark-main-missing', 'No hay <main>.');
    if (mains.length > 1) push('warn', 'landmark-main-multiple', `Hay ${mains.length} <main>.`);
    if (!document.querySelector('header, [role="banner"]')) push('warn', 'landmark-header-missing', 'No hay <header> (banner).');
    if (!document.querySelector('footer, [role="contentinfo"]')) push('warn', 'landmark-footer-missing', 'No hay <footer> (contentinfo).');
    if (!document.querySelector('nav, [role="navigation"]')) push('warn', 'landmark-nav-missing', 'No hay <nav>.');
    const navs = [...document.querySelectorAll('nav')];
    if (navs.length > 1 && navs.some((n) => !n.getAttribute('aria-label') && !n.getAttribute('aria-labelledby'))) push('warn', 'nav-unlabelled', `Hay ${navs.length} <nav>; cada uno debería llevar aria-label distinto.`);

    const h1s = document.querySelectorAll('h1');
    if (h1s.length === 0) push('error', 'h1-missing', 'La página no tiene <h1>.');
    if (h1s.length > 1) push('warn', 'h1-multiple', `Hay ${h1s.length} <h1>.`);
    let prev = 0;
    for (const h of document.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
        const lvl = Number(h.tagName[1]);
        if (prev && lvl > prev + 1) push('warn', 'heading-skip', `Salto h${prev} → h${lvl}: "${txt(h).slice(0, 50)}"`, { selector: sel(h) });
        prev = lvl;
    }

    // Skip link: primer enlace enfocable apuntando a un ancla
    const firstLink = document.querySelector('a[href]');
    const skipHref = firstLink?.getAttribute('href') || '';
    const skip = /^#.+/.test(skipHref) ? firstLink : null;
    if (!skip) push('info', 'skip-link-missing', 'No hay enlace "Saltar al contenido" como primer enlace de la página.');
    else {
        let target = null;
        try { target = document.getElementById(skipHref.slice(1)) || document.querySelector(`[name="${skipHref.slice(1)}"]`); } catch { /* selector inválido */ }
        if (!target) push('warn', 'skip-link-broken', `El skip link apunta a ${skipHref} y no existe.`);
    }

    // Reflow (se evalúa con viewport 320 desde fuera; aquí solo scrollWidth)
    const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    if (overflow > 2) push('warn', 'reflow-overflow', `Scroll horizontal de ${overflow}px a ${document.documentElement.clientWidth}px de ancho (WCAG 1.4.10).`);

    // prefers-reduced-motion en el CSS
    let reducedMotion = false;
    let animations = 0;
    for (const sheet of document.styleSheets) {
        let rules; try { rules = sheet.cssRules; } catch { continue; }
        for (const r of rules) {
            if (r.media && /prefers-reduced-motion/.test(r.media.mediaText)) reducedMotion = true;
            if (r.type === CSSRule.KEYFRAMES_RULE) animations++;
        }
    }
    if (animations && !reducedMotion) push('warn', 'reduced-motion-missing', `Hay ${animations} @keyframes y ningún bloque @media (prefers-reduced-motion: reduce).`);

    // Vídeos / iframes
    for (const v of document.querySelectorAll('video')) {
        if (v.autoplay && !v.muted) push('error', 'video-autoplay-sound', 'Vídeo autoplay con sonido.', { selector: sel(v) });
        if (!v.controls && !v.muted) push('warn', 'video-no-controls', 'Vídeo sin controls.', { selector: sel(v) });
        if (v.autoplay && v.loop && !v.hasAttribute('aria-hidden') && v.duration > 5) push('info', 'video-motion', 'Vídeo autoplay en bucle > 5s: necesita forma de pausarlo (WCAG 2.2.2).', { selector: sel(v) });
    }
    for (const f of document.querySelectorAll('iframe')) if (!f.title) push('warn', 'iframe-no-title', 'iframe sin title.', { selector: sel(f), src: (f.src || '').slice(0, 80) });

    // Botones / enlaces solo icono
    const iconOnly = [...document.querySelectorAll('a[href], button')].filter((el) => !txt(el) && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby') && !el.querySelector('img[alt]:not([alt=""])') && !el.title);
    if (iconOnly.length) push('error', 'control-no-name', `${iconOnly.length} enlaces/botones sin nombre accesible (icono sin aria-label).`, { samples: iconOnly.slice(0, 6).map(sel) });

    // Listas de tags/pills que son <div> en lugar de <ul>
    const marquee = document.querySelectorAll('[class*="marquee"]');
    if (marquee.length) push('info', 'marquee-present', `${marquee.length} elementos marquee: comprueba pausa al hover/foco y aria-hidden en las copias duplicadas.`);

    return issues;
}

// Recorre con Tab y comprueba que el foco se ve. Devuelve elementos sin indicador.
async function focusVisibleCheck(page, maxSteps = 120) {
    const missing = [];
    const seen = new Set();
    await page.evaluate(() => { document.activeElement?.blur?.(); window.scrollTo(0, 0); });
    for (let i = 0; i < maxSteps; i++) {
        await page.keyboard.press('Tab');
        const info = await page.evaluate(() => {
            const el = document.activeElement;
            if (!el || el === document.body) return null;
            const key = el.tagName + '|' + (el.id || '') + '|' + (typeof el.className === 'string' ? el.className : '') + '|' + (el.getAttribute('href') || '') + '|' + (el.textContent || '').trim().slice(0, 20);
            const cs = getComputedStyle(el);
            const focused = { outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 ? cs.outline : '', boxShadow: cs.boxShadow, border: cs.borderColor + cs.borderWidth, bg: cs.backgroundColor, color: cs.color, textDecoration: cs.textDecorationLine };
            // Comparar contra el estado sin foco: clonamos estilos quitando el foco momentáneamente.
            el.blur();
            const cb = getComputedStyle(el);
            const blurred = { outline: cb.outlineStyle !== 'none' && parseFloat(cb.outlineWidth) > 0 ? cb.outline : '', boxShadow: cb.boxShadow, border: cb.borderColor + cb.borderWidth, bg: cb.backgroundColor, color: cb.color, textDecoration: cb.textDecorationLine };
            el.focus({ preventScroll: true });
            const visible = Object.keys(focused).some((k) => focused[k] !== blurred[k]);
            const r = el.getBoundingClientRect();
            const c = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '';
            return { key, visible, selector: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${c}`, text: (el.textContent || '').trim().slice(0, 30), offscreen: r.width === 0 || r.height === 0 };
        });
        if (!info) break;
        if (seen.has(info.key)) break; // hemos dado la vuelta
        seen.add(info.key);
        if (!info.visible && !info.offscreen) missing.push({ selector: info.selector, text: info.text });
    }
    return { steps: seen.size, missing };
}

// --- Main ----------------------------------------------------------------
const browser = await launchChromium();
const report = { url: stripCredentials(url), generatedAt: new Date().toISOString(), tags: TAGS, viewports: [] };

try {
    for (const vp of VIEWPORTS) {
        const context = await browser.newContext({
            viewport: { width: vp.width, height: vp.height },
            isMobile: Boolean(vp.mobile), hasTouch: Boolean(vp.mobile),
            ...contextOptionsFromUrl(url),
        });
        const page = await context.newPage();
        await gotoSafe(page, url);
        await page.waitForTimeout(WAIT);

        await page.addScriptTag({ content: axeSource });
        const axe = await page.evaluate(async (tags) => {
            const res = await window.axe.run(document, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations', 'incomplete'] });
            const slim = (arr) => arr.map((v) => ({
                id: v.id, impact: v.impact, help: v.help, helpUrl: v.helpUrl, tags: v.tags.filter((t) => /wcag|best/.test(t)),
                nodes: v.nodes.slice(0, 8).map((n) => ({ target: n.target.join(' '), html: n.html.slice(0, 200), failureSummary: (n.failureSummary || '').slice(0, 300) })),
                nodeCount: v.nodes.length,
            }));
            return { violations: slim(res.violations), incomplete: slim(res.incomplete) };
        }, TAGS);

        const structural = await page.evaluate(structuralChecks);
        const focus = vp.mobile ? { steps: 0, missing: [] } : await focusVisibleCheck(page);

        // Reflow a 320 (solo en el contexto desktop, cambiando el viewport)
        let reflow = null;
        if (!vp.mobile) {
            await page.setViewportSize({ width: 320, height: 900 });
            await page.waitForTimeout(400);
            reflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth - 320 }));
            await page.setViewportSize({ width: vp.width, height: vp.height });
        }

        const issues = [
            ...axe.violations.map((v) => ({ severity: IMPACT_TO_SEVERITY[v.impact] || 'warn', id: `axe:${v.id}`, message: `${v.help} (${v.nodeCount} nodo/s)`, helpUrl: v.helpUrl, selector: v.nodes[0]?.target, nodes: v.nodes })),
            ...structural,
        ];
        if (focus.missing.length) issues.push({ severity: 'error', id: 'focus-not-visible', message: `${focus.missing.length} de ${focus.steps} elementos enfocables sin indicador de foco visible (WCAG 2.4.7).`, samples: focus.missing.slice(0, 15) });
        if (reflow && reflow.overflow > 2) issues.push({ severity: 'warn', id: 'reflow-320', message: `A 320px la página desborda ${reflow.overflow}px (WCAG 1.4.10).` });
        issues.forEach((i) => (i.viewport = vp.name));

        report.viewports.push({ ...vp, issues, axeIncomplete: axe.incomplete.map((v) => ({ id: v.id, help: v.help, nodeCount: v.nodeCount })), focus: { steps: focus.steps, missing: focus.missing.length }, reflow });
        console.log(`  ${vp.name} ${vp.width}px  →  ${issues.length} issue(s)  (axe: ${axe.violations.length} violaciones, ${axe.incomplete.length} por revisar)`);
        await context.close();
    }
} finally {
    await browser.close();
}

const all = report.viewports.flatMap((v) => v.issues);
report.summary = { errors: all.filter((i) => i.severity === 'error').length, warnings: all.filter((i) => i.severity === 'warn').length, info: all.filter((i) => i.severity === 'info').length };
const file = writeJson(OUT, 'report.json', report);
printSummary('Accesibilidad', all, file);
printTop(all);
