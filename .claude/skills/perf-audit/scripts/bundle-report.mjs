#!/usr/bin/env node
// Informe de peso de la carpeta build/ (lo que WordPress sirve de verdad).
//
//   node bundle-report.mjs [--out=dir] [--top=15]
//
// Reporta: tamaño raw y gzip de main.css, js/*.js y de cada bloque (index.js
// del editor y view.js del frontend), y qué bundles llevan EMBEBIDAS librerías
// de terceros. En este tema GSAP, ScrollTrigger, SplitText y Lenis viven una
// sola vez en build/vendor/ (webpack.config.js → SHARED); si además aparecen
// dentro de un bundle, alguien las importó sin pasar por la externa.
// No requiere navegador. Solo lee; no cambia nada.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { parseArgs, writeJson, PROJECT_ROOT, REPORTS_ROOT, walk, rel, kb } from '../../../lib/audit-lib.mjs';

const { flags } = parseArgs();
const OUT = path.resolve(flags.out || path.join(REPORTS_ROOT, 'perf'));
const TOP = Number(flags.top || 15);
const BUILD = path.join(PROJECT_ROOT, 'build');

if (!fs.existsSync(BUILD)) {
    console.error('No existe build/. Compila primero: npm run build');
    process.exit(1);
}

// Firmas de librerías que delatan un vendor embebido en un bundle. Son cadenas
// internas de cada librería: un bundle que solo la usa como externa
// (window.gsap) no las contiene.
const VENDORS = {
    gsap: [/\b_gsap\b/, /GreenSock/],
    scrolltrigger: [/_scrollers/],
    lenis: [/lenis-smooth/, /VirtualScroll/],
    splide: [/splide/i],
    lottie: [/lottie/i],
    swiper: [/\bSwiper\b/],
};

const files = walk(BUILD, ['.js', '.css']).filter((f) => !f.endsWith('.map') && !/\.asset\.php$/.test(f));
const entries = files.map((f) => {
    const buf = fs.readFileSync(f);
    const text = buf.toString('utf8');
    const vendors = Object.entries(VENDORS).filter(([, sigs]) => sigs.some((s) => s.test(text))).map(([n]) => n);
    const relPath = rel(f);
    const m = relPath.match(/^build\/blocks\/([^/]+)\/(index|view|style|editor)/);
    return {
        file: relPath, block: m ? m[1] : null, kind: m ? m[2] : relPath.startsWith('build/css') ? 'css' : relPath.startsWith('build/js') ? 'global-js' : relPath.startsWith('build/vendor') ? 'vendor' : 'other',
        bytes: buf.length, gzip: zlib.gzipSync(buf, { level: 9 }).length, vendors, sourcemap: fs.existsSync(f + '.map'),
    };
});

const total = entries.reduce((n, e) => n + e.bytes, 0);
const totalGzip = entries.reduce((n, e) => n + e.gzip, 0);
const frontend = entries.filter((e) => e.kind === 'view' || e.kind === 'css' || e.kind === 'global-js');
const frontendBytes = frontend.reduce((n, e) => n + e.bytes, 0);

const issues = [];
const push = (severity, id, message, extra = {}) => issues.push({ severity, id, message, ...extra });

// Vendors duplicados
for (const vendor of Object.keys(VENDORS)) {
    // Solo JS del frontend: el CSS del vendor en main.css es normal (una sola vez)
    // y el index.js del editor no lo descarga el visitante. build/vendor/ es la
    // copia compartida: no cuenta como portador, pero si existe, un solo bundle
    // que la lleve dentro ya es una descarga duplicada.
    const carriers = entries.filter((e) => e.vendors.includes(vendor) && e.file.endsWith('.js') && e.kind !== 'index' && e.kind !== 'vendor');
    const shared = entries.some((e) => e.kind === 'vendor' && e.vendors.includes(vendor));
    if (carriers.length > 1 || (shared && carriers.length)) {
        const dup = carriers.reduce((n, e) => n + e.bytes, 0);
        push('warn', `vendor-duplicated:${vendor}`, `${vendor} viene embebido en ${carriers.length} bundle(s) del frontend (${kb(dup)} en total)${shared ? ', además de la copia compartida de build/vendor/' : ''}. Impórtalo por defecto desde el nombre compartido (import gsap from 'gsap') para que webpack.config.js lo sustituya por la externa registrada una vez en inc/enqueue.php.`, { files: carriers.map((c) => `${c.file} ${kb(c.bytes)}`) });
    }
}
// Bundles grandes
for (const e of entries) {
    if (e.kind === 'view' && e.bytes > 60 * 1024) push('warn', 'view-heavy', `${e.file} pesa ${kb(e.bytes)} (gzip ${kb(e.gzip)}). Un view.js debería ser pequeño; el peso suele ser una librería embebida.`, { file: e.file });
    if (e.kind === 'css' && e.bytes > 250 * 1024) push('warn', 'css-heavy', `${e.file} pesa ${kb(e.bytes)} (gzip ${kb(e.gzip)}). Revisa SCSS duplicado o vendor CSS sin usar.`, { file: e.file });
}
// Sourcemaps en build (= build de desarrollo)
const maps = entries.filter((e) => e.sourcemap);
if (maps.length) push('error', 'dev-build', `${maps.length} ficheros con .map: build/ se generó con "npm start" (desarrollo). Para producción: npm run build.`, { samples: maps.slice(0, 5).map((m) => m.file) });
// Bloques sin view.js pero con dependencias de frontend, etc. — info general
const viewCount = entries.filter((e) => e.kind === 'view').length;
push('info', 'frontend-weight', `Frontend (css + js globales + ${viewCount} view.js): ${kb(frontendBytes)} raw. WordPress solo carga el view.js de los bloques presentes en la página.`);

const sorted = [...entries].sort((a, b) => b.bytes - a.bytes);
const report = { generatedAt: new Date().toISOString(), totals: { files: entries.length, bytes: total, gzip: totalGzip, frontendBytes }, top: sorted.slice(0, TOP).map((e) => ({ file: e.file, kb: +(e.bytes / 1024).toFixed(1), gzipKb: +(e.gzip / 1024).toFixed(1), vendors: e.vendors })), files: entries, issues, summary: { errors: issues.filter((i) => i.severity === 'error').length, warnings: issues.filter((i) => i.severity === 'warn').length, info: issues.filter((i) => i.severity === 'info').length } };
const file = writeJson(OUT, 'bundle-report.json', report);

console.log(`build/: ${entries.length} ficheros · ${kb(total)} raw · ${kb(totalGzip)} gzip\n`);
console.log('  Los más pesados:');
for (const e of report.top) console.log(`   ${String(e.kb).padStart(7)} KB  (gz ${String(e.gzipKb).padStart(6)})  ${e.file}${e.vendors.length ? '   ← ' + e.vendors.join(', ') : ''}`);
console.log(`\nInforme: ${file}`);
for (const i of issues) console.log(`  [${i.severity}] ${i.id}: ${i.message}`);
