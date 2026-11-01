#!/usr/bin/env node
// Responsive detection script.
// Usage: node check.mjs <url> [outDir]
// Output: <outDir>/report.json + one full-page screenshot per breakpoint.

import fs from 'node:fs';
import path from 'node:path';
// Lanzador compartido: usa el Chromium de Playwright y, si no está descargado,
// cae al Chrome/Edge del sistema. Ver .claude/lib/audit-lib.mjs.
import { launchChromium, contextOptionsFromUrl, REPORTS_ROOT } from '../../../lib/audit-lib.mjs';

const url = process.argv[2];
// Por defecto, junto a los demás informes (.claude/reports/, fuera de Git).
const outDir = process.argv[3] || path.join(REPORTS_ROOT, 'responsive');

if (!url) {
  console.error('Usage: node check.mjs <url> [outDir]');
  process.exit(1);
}

// Common breakpoints. 320 also covers the WCAG 1.4.10 reflow width.
// 1920 verifies the desktop layout and the max-width centering on wide screens.
const BREAKPOINTS = [320, 375, 768, 1024, 1280, 1440, 1920];
const VIEWPORT_HEIGHT = 900;
const TAP_MIN = 24; // WCAG 2.5.8 (AA) minimum target size in CSS px.
const NAV_TIMEOUT = 30000;

fs.mkdirSync(outDir, { recursive: true });

// Runs inside the page. Returns the list of issues for the current viewport.
function detectInPage({ tapMin }) {
  const TOL = 2; // px tolerance to avoid noise from sub-pixel rounding.
  const vw = document.documentElement.clientWidth;
  const issues = [];

  const round = (n) => Math.round(n);

  const isVisible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const s = window.getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return false;
    return true;
  };

  // Build a readable description of an element for mapping back to source.
  const describe = (el) => {
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const cls = typeof el.className === 'string' ? el.className.trim() : '';
    const firstCls = cls ? '.' + cls.split(/\s+/)[0] : '';

    // nth-of-type to disambiguate among siblings of the same tag.
    let nth = '';
    if (el.parentElement) {
      const sameTag = Array.from(el.parentElement.children).filter(
        (c) => c.tagName === el.tagName
      );
      if (sameTag.length > 1) nth = `:nth-of-type(${sameTag.indexOf(el) + 1})`;
    }

    const selfSel = `${tag}${id}${firstCls}${nth}`;

    // A short, 2-level selector (parent > self) for orientation.
    let selector = selfSel;
    const parent = el.parentElement;
    if (parent) {
      const pTag = parent.tagName.toLowerCase();
      const pId = parent.id ? `#${parent.id}` : '';
      const pClsRaw = typeof parent.className === 'string' ? parent.className.trim() : '';
      const pCls = pClsRaw ? '.' + pClsRaw.split(/\s+/)[0] : '';
      selector = `${pTag}${pId}${pCls} > ${selfSel}`;
    }

    // Full DOM path (ids where available) for context.
    const pathParts = [];
    let node = el;
    while (node && node.nodeType === 1) {
      const t = node.tagName.toLowerCase();
      pathParts.unshift(node.id ? `${t}#${node.id}` : t);
      node = node.parentElement;
    }

    return {
      selector,
      domPath: pathParts.join(' > '),
      classes: cls,
      text: (el.textContent || '').trim().slice(0, 40),
    };
  };

  // --- horizontal_overflow ------------------------------------------------
  // Lo que desborda dentro de un ancestro que lo recorta o lo desplaza (pista
  // de carrusel, fila de chips deslizable, .visually-hidden) no ensancha la
  // página: no es un fallo. html y body no cuentan, para no esconder contenido
  // cortado por un overflow-x global.
  const isContained = (el) => {
    for (let anc = el.parentElement; anc && anc !== document.body && anc !== document.documentElement; anc = anc.parentElement) {
      if (window.getComputedStyle(anc).overflowX !== 'visible' && anc.getBoundingClientRect().right <= vw + TOL) return true;
    }
    return false;
  };

  // Every visible element whose right edge passes the viewport.
  const overflowing = [];
  for (const el of document.querySelectorAll('*')) {
    if (!isVisible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.right > vw + TOL && !isContained(el)) overflowing.push(el);
  }
  // Report only the outermost offender of each chain: drop any element that has
  // an ancestor already in the set (its overflow is caused upstream, not by it).
  const overflowSet = new Set(overflowing);
  for (const el of overflowing) {
    let anc = el.parentElement;
    let nested = false;
    while (anc) {
      if (overflowSet.has(anc)) { nested = true; break; }
      anc = anc.parentElement;
    }
    if (nested) continue;
    const r = el.getBoundingClientRect();
    issues.push({
      type: 'horizontal_overflow',
      ...describe(el),
      measured: {
        elementWidth: round(r.width),
        elementRight: round(r.right),
        viewportWidth: vw,
        overflowPx: round(r.right - vw),
      },
    });
  }

  // --- small_tap_target ---------------------------------------------------
  const tappables = Array.from(
    document.querySelectorAll('a[href], button, input, select, textarea, [role="button"], [role="link"]')
  ).filter(isVisible);
  for (const el of tappables) {
    const r = el.getBoundingClientRect();
    const min = Math.min(r.width, r.height);
    // Elementos visualmente ocultos (skip links, labels "screen-reader-text"
    // con clip 1x1) no son objetivos táctiles: se saltan.
    const cs = window.getComputedStyle(el);
    const clipped = (r.width <= 1 && r.height <= 1) || (cs.clipPath && cs.clipPath !== 'none') || /rect\(/.test(cs.clip || '');
    if (clipped) continue;
    // Excepción «inline» de WCAG 2.5.8: un enlace dentro de una frase (en línea,
    // en un párrafo, elemento de lista o celda con más texto) no tiene que
    // medir 24 px; su tamaño lo fija el interlineado del texto.
    const block = el.closest('p, li, td, dd, blockquote, figcaption');
    const inSentence = cs.display === 'inline' && block && block.textContent.trim().length > el.textContent.trim().length;
    if (inSentence) continue;
    if (min < tapMin) {
      issues.push({
        type: 'small_tap_target',
        ...describe(el),
        measured: { width: round(r.width), height: round(r.height), minSide: round(min), required: tapMin },
      });
    }
  }

  return {
    pageOverflow: document.documentElement.scrollWidth > vw + TOL,
    scrollWidth: document.documentElement.scrollWidth,
    issues,
  };
}

const report = {
  url,
  generatedAt: new Date().toISOString(),
  breakpoints: [],
};

const browser = await launchChromium();
try {
  for (const width of BREAKPOINTS) {
    const context = await browser.newContext({
      viewport: { width, height: VIEWPORT_HEIGHT },
      deviceScaleFactor: 1,
      ...contextOptionsFromUrl(url),
    });
    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT });
    } catch {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    }
    await page.waitForTimeout(500);

    const shotName = `${width}.png`;
    await page.screenshot({ path: path.join(outDir, shotName), fullPage: true });

    const result = await page.evaluate(detectInPage, { tapMin: TAP_MIN });
    result.issues.forEach((i) => (i.screenshot = shotName));

    report.breakpoints.push({
      width,
      viewport: { width, height: VIEWPORT_HEIGHT },
      screenshot: shotName,
      pageOverflow: result.pageOverflow,
      scrollWidth: result.scrollWidth,
      issueCount: result.issues.length,
      issues: result.issues,
    });

    console.log(`  ${width}px  →  ${result.issues.length} issue(s)${result.pageOverflow ? ' (page overflows)' : ''}`);
    await context.close();
  }
} finally {
  await browser.close();
}

fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));

const total = report.breakpoints.reduce((n, b) => n + b.issueCount, 0);
console.log(`\nDone. ${total} issue(s) across ${BREAKPOINTS.length} breakpoints.`);
console.log(`Report: ${path.join(outDir, 'report.json')}`);
