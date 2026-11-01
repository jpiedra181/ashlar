#!/usr/bin/env node
// Auditoría SEO on-page de una o varias URLs con Playwright.
//
//   node seo-check.mjs <url> [url2 ...] [--crawl] [--max=20] [--out=dir]
//
// --crawl   además de las URLs dadas, sigue los enlaces internos (mismo origen)
//           hasta --max páginas. Útil para detectar títulos duplicados.
// --out     carpeta del informe. Por defecto .claude/reports/seo/.
//
// Salida: <out>/report.json + resumen en consola. Solo detecta; no cambia nada.

import path from 'node:path';
import {
    parseArgs, usage, launchChromium, gotoSafe, contextOptionsFromUrl,
    stripCredentials, writeJson, printSummary, printTop, REPORTS_ROOT,
} from '../../../lib/audit-lib.mjs';

const { positional: urls, flags } = parseArgs();
if (!urls.length) usage('Uso: node seo-check.mjs <url> [url2 ...] [--crawl] [--max=20] [--out=dir]');

const OUT = flags.out ? path.resolve(flags.out) : path.join(REPORTS_ROOT, 'seo');
const MAX_PAGES = Number(flags.max || 20);
const CRAWL = Boolean(flags.crawl);

const GENERIC_ANCHORS = ['click here', 'haz clic aquí', 'aquí', 'leer más', 'read more', 'más', 'more', 'link', 'enlace', 'ver'];

// --- Comprobaciones dentro de la página -----------------------------------
function auditInPage({ genericAnchors }) {
    const issues = [];
    const push = (severity, id, message, extra = {}) => issues.push({ severity, id, message, ...extra });
    const txt = (el) => (el?.textContent || '').trim();
    const meta = (name) => document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') || '';
    const prop = (p) => document.querySelector(`meta[property="${p}"]`)?.getAttribute('content') || '';

    // Title
    const title = document.title.trim();
    if (!title) push('error', 'title-missing', 'La página no tiene <title>.');
    else if (title.length < 30) push('warn', 'title-short', `<title> corto (${title.length} car.): "${title}"`);
    else if (title.length > 60) push('warn', 'title-long', `<title> largo (${title.length} car.), se truncará en SERP: "${title}"`);

    // Meta description
    const desc = meta('description');
    if (!desc) push('error', 'description-missing', 'Falta <meta name="description">.');
    else if (desc.length < 70) push('warn', 'description-short', `Meta description corta (${desc.length} car.).`);
    else if (desc.length > 160) push('warn', 'description-long', `Meta description larga (${desc.length} car.), se truncará.`);

    // Canonical
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
    if (!canonical) push('warn', 'canonical-missing', 'Falta <link rel="canonical">.');
    else {
        let abs = '';
        try { abs = new URL(canonical, location.href).toString(); } catch { /* noop */ }
        if (!/^https?:\/\//.test(canonical)) push('warn', 'canonical-relative', `Canonical relativo: ${canonical}`);
        const here = location.href.replace(/#.*$/, '').replace(/\/$/, '');
        if (abs && abs.replace(/\/$/, '') !== here) push('info', 'canonical-differs', `Canonical (${abs}) no apunta a esta URL (${here}). Correcto si es intencionado.`);
    }

    // Robots
    const robots = meta('robots').toLowerCase();
    if (robots.includes('noindex')) push('warn', 'noindex', `La página lleva robots=${robots}. Correcto en staging; fatal en producción.`);

    // lang / viewport / charset
    const lang = document.documentElement.getAttribute('lang');
    if (!lang) push('error', 'html-lang-missing', '<html> sin atributo lang.');
    if (!document.querySelector('meta[name="viewport"]')) push('error', 'viewport-missing', 'Falta <meta name="viewport">.');
    if (!document.querySelector('meta[charset], meta[http-equiv="Content-Type"]')) push('warn', 'charset-missing', 'Falta <meta charset>.');

    // Headings
    const h1s = [...document.querySelectorAll('h1')];
    if (h1s.length === 0) push('error', 'h1-missing', 'La página no tiene <h1>.');
    if (h1s.length > 1) push('warn', 'h1-multiple', `Hay ${h1s.length} <h1>: ${h1s.map((h) => `"${txt(h).slice(0, 40)}"`).join(' | ')}`);
    const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')];
    let prev = 0;
    for (const h of hs) {
        const lvl = Number(h.tagName[1]);
        if (prev && lvl > prev + 1) {
            push('warn', 'heading-skip', `Salto de nivel h${prev} → h${lvl}: "${txt(h).slice(0, 50)}"`, { selector: h.className ? `${h.tagName.toLowerCase()}.${h.className.split(/\s+/)[0]}` : h.tagName.toLowerCase() });
        }
        if (!txt(h)) push('warn', 'heading-empty', `<${h.tagName.toLowerCase()}> vacío.`);
        prev = lvl;
    }

    // Open Graph / Twitter
    const og = { title: prop('og:title'), description: prop('og:description'), image: prop('og:image'), url: prop('og:url'), type: prop('og:type') };
    const missingOg = Object.entries(og).filter(([, v]) => !v).map(([k]) => `og:${k}`);
    if (missingOg.length === 5) push('warn', 'og-missing', 'Sin etiquetas Open Graph (las comparticiones en redes saldrán sin imagen ni título).');
    else if (missingOg.length) push('info', 'og-incomplete', `Faltan: ${missingOg.join(', ')}`);
    if (!meta('twitter:card')) push('info', 'twitter-card-missing', 'Falta <meta name="twitter:card">.');

    // Imágenes
    const imgs = [...document.querySelectorAll('img')];
    const noAlt = imgs.filter((i) => !i.hasAttribute('alt'));
    const emptyAlt = imgs.filter((i) => i.hasAttribute('alt') && i.getAttribute('alt').trim() === '' && !i.closest('[aria-hidden="true"]') && i.getAttribute('role') !== 'presentation');
    const noDims = imgs.filter((i) => !i.getAttribute('width') || !i.getAttribute('height'));
    if (noAlt.length) push('error', 'img-no-alt', `${noAlt.length} <img> sin atributo alt.`, { samples: noAlt.slice(0, 5).map((i) => i.getAttribute('src')?.slice(-60)) });
    if (emptyAlt.length) push('warn', 'img-empty-alt', `${emptyAlt.length} <img> con alt="" fuera de contexto decorativo. Si son de contenido, necesitan texto alternativo (y el bloque debe permitir editarlo).`, { samples: emptyAlt.slice(0, 5).map((i) => i.getAttribute('src')?.slice(-60)) });
    if (noDims.length) push('info', 'img-no-dimensions', `${noDims.length} <img> sin width/height (afecta a CLS, ver perf-audit).`);

    // Enlaces
    const links = [...document.querySelectorAll('a[href]')];
    const empty = links.filter((a) => !txt(a) && !a.getAttribute('aria-label') && !a.querySelector('img[alt]:not([alt=""])') && !a.getAttribute('title'));
    if (empty.length) push('error', 'link-no-text', `${empty.length} enlaces sin texto accesible (ni aria-label).`, { samples: empty.slice(0, 5).map((a) => a.getAttribute('href')) });
    const generic = links.filter((a) => genericAnchors.includes(txt(a).toLowerCase()));
    if (generic.length) push('warn', 'link-generic-text', `${generic.length} enlaces con texto genérico ("${[...new Set(generic.map((a) => txt(a)))].join('", "')}").`);
    const insecure = links.filter((a) => location.protocol === 'https:' && a.href.startsWith('http://') && !a.href.includes('localhost'));
    if (insecure.length) push('warn', 'link-http-on-https', `${insecure.length} enlaces http:// en una página https.`, { samples: insecure.slice(0, 5).map((a) => a.href) });
    const blankNoRel = links.filter((a) => a.target === '_blank' && !/noopener|noreferrer/.test(a.rel || ''));
    if (blankNoRel.length) push('info', 'link-blank-no-noopener', `${blankNoRel.length} enlaces target=_blank sin rel="noopener".`);
    const hashOnly = links.filter((a) => a.getAttribute('href') === '#');
    if (hashOnly.length) push('warn', 'link-hash-only', `${hashOnly.length} enlaces con href="#" (placeholders sin URL real).`, { samples: hashOnly.slice(0, 5).map((a) => txt(a).slice(0, 30)) });

    // Datos estructurados
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')];
    const types = [];
    for (const s of ld) {
        try {
            const j = JSON.parse(s.textContent);
            const arr = Array.isArray(j) ? j : j['@graph'] ? j['@graph'] : [j];
            arr.forEach((o) => o && o['@type'] && types.push(String(o['@type'])));
        } catch {
            push('error', 'jsonld-invalid', 'Un bloque JSON-LD no es JSON válido.');
        }
    }
    if (!ld.length) push('info', 'jsonld-missing', 'Sin datos estructurados (JSON-LD). Recomendado: Organization/WebSite en home, Article en entradas, BreadcrumbList.');

    // WordPress: exposición del generador
    const gen = meta('generator');
    if (gen) push('info', 'generator-exposed', `<meta name="generator" content="${gen}"> expone la versión de WordPress (ver security-audit).`);

    // Texto
    const words = (document.body?.innerText || '').split(/\s+/).filter(Boolean).length;
    if (words < 150) push('info', 'thin-content', `Poco texto visible (${words} palabras).`);

    // Favicon
    if (!document.querySelector('link[rel~="icon"], link[rel="apple-touch-icon"]')) push('info', 'favicon-missing', 'Sin <link rel="icon">.');

    // hreflang
    const hreflang = [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => l.getAttribute('hreflang'));

    // Enlaces internos para el crawl
    const internal = [...new Set(links.map((a) => a.href).filter((h) => h.startsWith(location.origin) && !h.includes('#') && !/\.(pdf|jpg|jpeg|png|gif|svg|webp|zip|mp4)(\?|$)/i.test(h) && !/\/wp-(admin|login|json)/.test(h)))];

    return {
        title, description: desc, canonical, robots, lang, h1: h1s.map(txt), og, jsonLdTypes: types, hreflang,
        counts: { images: imgs.length, links: links.length, words, headings: hs.length },
        issues, internal,
    };
}

// --- Comprobaciones a nivel de sitio (robots.txt, sitemap) ----------------
async function siteChecks(context, origin) {
    const issues = [];
    const fetchStatus = async (u) => {
        try {
            const r = await context.request.get(u, { maxRedirects: 3, timeout: 15000 });
            return { status: r.status(), body: r.ok() ? await r.text() : '' };
        } catch { return { status: 0, body: '' }; }
    };
    const robots = await fetchStatus(`${origin}/robots.txt`);
    if (robots.status !== 200) issues.push({ severity: 'warn', id: 'robots-txt-missing', message: `${origin}/robots.txt responde ${robots.status}.` });
    else {
        if (/Disallow:\s*\/\s*$/m.test(robots.body)) issues.push({ severity: 'warn', id: 'robots-disallow-all', message: 'robots.txt bloquea todo el sitio (Disallow: /). Correcto en staging; fatal en producción.' });
        if (!/Sitemap:/i.test(robots.body)) issues.push({ severity: 'info', id: 'robots-no-sitemap', message: 'robots.txt no declara la URL del sitemap.' });
    }
    let sitemapOk = false;
    for (const p of ['/sitemap.xml', '/wp-sitemap.xml', '/sitemap_index.xml']) {
        const s = await fetchStatus(`${origin}${p}`);
        if (s.status === 200 && /<(urlset|sitemapindex)/.test(s.body)) { sitemapOk = p; break; }
    }
    if (!sitemapOk) issues.push({ severity: 'warn', id: 'sitemap-missing', message: 'No se encuentra sitemap (/sitemap.xml, /wp-sitemap.xml, /sitemap_index.xml).' });
    return { issues, sitemap: sitemapOk || null, robotsStatus: robots.status };
}

// --- Main ----------------------------------------------------------------
const browser = await launchChromium();
const report = { generatedAt: new Date().toISOString(), pages: [], site: null, crossPage: [] };
const queue = [...urls];
const seen = new Set();
const origin = new URL(urls[0]).origin;

try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, ...contextOptionsFromUrl(urls[0]) });
    report.site = await siteChecks(context, origin);

    while (queue.length && report.pages.length < MAX_PAGES) {
        const url = queue.shift();
        const key = stripCredentials(url).replace(/\/$/, '');
        if (seen.has(key)) continue;
        seen.add(key);

        const page = await context.newPage();
        const resp = await gotoSafe(page, url).catch(() => null);
        const status = resp?.status() ?? 0;
        const result = await page.evaluate(auditInPage, { genericAnchors: GENERIC_ANCHORS }).catch((e) => ({ issues: [{ severity: 'error', id: 'evaluate-failed', message: e.message }], internal: [] }));
        if (status >= 400 || status === 0) result.issues.unshift({ severity: 'error', id: 'http-status', message: `La URL responde ${status}.` });

        // Enlaces internos rotos (muestra de 40, HEAD)
        const broken = [];
        for (const l of (result.internal || []).slice(0, 40)) {
            try {
                const r = await context.request.head(l, { timeout: 10000, maxRedirects: 3 });
                if (r.status() >= 400) broken.push({ url: l, status: r.status() });
            } catch { broken.push({ url: l, status: 0 }); }
        }
        if (broken.length) result.issues.push({ severity: 'error', id: 'broken-internal-links', message: `${broken.length} enlaces internos rotos.`, samples: broken.slice(0, 8) });

        result.issues.forEach((i) => (i.url = stripCredentials(url)));
        report.pages.push({ url: stripCredentials(url), status, ...result, internal: undefined });
        console.log(`  ${stripCredentials(url)}  →  ${result.issues.length} issue(s)`);

        if (CRAWL) for (const l of result.internal || []) if (!seen.has(l.replace(/\/$/, ''))) queue.push(l);
        await page.close();
    }
} finally {
    await browser.close();
}

// Duplicados entre páginas
const byTitle = new Map();
const byDesc = new Map();
for (const p of report.pages) {
    if (p.title) byTitle.set(p.title, [...(byTitle.get(p.title) || []), p.url]);
    if (p.description) byDesc.set(p.description, [...(byDesc.get(p.description) || []), p.url]);
}
for (const [t, us] of byTitle) if (us.length > 1) report.crossPage.push({ severity: 'warn', id: 'title-duplicate', message: `<title> duplicado en ${us.length} páginas: "${t}"`, urls: us });
for (const [d, us] of byDesc) if (us.length > 1) report.crossPage.push({ severity: 'warn', id: 'description-duplicate', message: `Meta description duplicada en ${us.length} páginas.`, urls: us });

const all = [...report.site.issues, ...report.pages.flatMap((p) => p.issues), ...report.crossPage];
report.summary = { pages: report.pages.length, errors: all.filter((i) => i.severity === 'error').length, warnings: all.filter((i) => i.severity === 'warn').length, info: all.filter((i) => i.severity === 'info').length };
const file = writeJson(OUT, 'report.json', report);
printSummary('SEO', all, file);
printTop(all);
