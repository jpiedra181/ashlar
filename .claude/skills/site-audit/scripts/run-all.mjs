#!/usr/bin/env node
// Orquestador: ejecuta todas las auditorías contra una URL y consolida un
// informe Markdown con lo más grave arriba.
//
//   node run-all.mjs <url> [--out=dir] [--skip=perf,security] [--mobile] [--throttle] [--crawl]
//
// Ejecuta en orden: seo-check, a11y-check, perf-check (+ bundle-report si hay
// build/), site-headers, php-security-scan, responsive-check. Cada uno escribe
// su JSON en <out>/<área>/ y aquí se genera <out>/summary.md.
// Solo detecta; no cambia nada.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs, usage, ensureDir, writeText, stripCredentials, REPORTS_ROOT, PROJECT_ROOT, stamp } from '../../../lib/audit-lib.mjs';

const { positional: [url], flags } = parseArgs();
if (!url) usage('Uso: node run-all.mjs <url> [--out=dir] [--skip=a,b] [--mobile] [--throttle] [--crawl]');

const OUT = path.resolve(flags.out || path.join(REPORTS_ROOT, `site-audit-${stamp()}`));
const SKIP = new Set(String(flags.skip || '').split(',').filter(Boolean));
const SKILLS = path.join(PROJECT_ROOT, '.claude', 'skills');
ensureDir(OUT);

const steps = [
    { key: 'seo', title: 'SEO', script: 'seo-audit/scripts/seo-check.mjs', args: [url, ...(flags.crawl ? ['--crawl'] : [])], json: 'report.json', pick: (r) => [...(r.site?.issues || []), ...(r.pages || []).flatMap((p) => p.issues), ...(r.crossPage || [])] },
    { key: 'a11y', title: 'Accesibilidad', script: 'a11y-audit/scripts/a11y-check.mjs', args: [url], json: 'report.json', pick: (r) => (r.viewports || []).flatMap((v) => v.issues) },
    { key: 'perf', title: 'Rendimiento', script: 'perf-audit/scripts/perf-check.mjs', args: [url, ...(flags.mobile ? ['--mobile'] : []), ...(flags.throttle ? ['--throttle'] : [])], json: 'report.json', pick: (r) => r.issues || [] },
    { key: 'bundle', title: 'Bundles (build/)', script: 'perf-audit/scripts/bundle-report.mjs', args: [], json: 'bundle-report.json', pick: (r) => r.issues || [], skipIf: () => !fs.existsSync(path.join(PROJECT_ROOT, 'build')) },
    { key: 'security', title: 'Seguridad (sitio)', script: 'security-audit/scripts/site-headers.mjs', args: [url], json: 'site-report.json', pick: (r) => r.issues || [] },
    { key: 'php', title: 'Seguridad (código)', script: 'security-audit/scripts/php-security-scan.mjs', args: [], json: 'php-scan.json', pick: (r) => r.issues || [] },
    { key: 'responsive', title: 'Responsive', script: 'responsive-check/scripts/check.mjs', args: [url], json: 'report.json', outArg: 'positional', pick: (r) => (r.breakpoints || []).flatMap((b) => b.issues.map((i) => ({ severity: i.type === 'horizontal_overflow' ? 'error' : 'warn', id: i.type, message: `${b.width}px: ${i.selector} (${JSON.stringify(i.measured)})` }))) },
];

const results = [];
for (const s of steps) {
    if (SKIP.has(s.key) || s.skipIf?.()) { console.log(`\n── ${s.title}: omitido`); continue; }
    const outDir = path.join(OUT, s.key);
    const args = [path.join(SKILLS, s.script), ...s.args, ...(s.outArg === 'positional' ? [outDir] : [`--out=${outDir}`])];
    console.log(`\n── ${s.title}`);
    const run = spawnSync(process.execPath, args, { stdio: 'inherit', cwd: PROJECT_ROOT });
    let issues = [];
    const jsonFile = path.join(outDir, s.json);
    if (fs.existsSync(jsonFile)) {
        try { issues = s.pick(JSON.parse(fs.readFileSync(jsonFile, 'utf8'))); } catch (e) { issues = [{ severity: 'error', id: 'report-unreadable', message: e.message }]; }
    } else {
        issues = [{ severity: 'error', id: 'script-failed', message: `${s.script} no generó ${s.json} (exit ${run.status}).` }];
    }
    results.push({ ...s, issues, jsonFile });
}

// --- Markdown -------------------------------------------------------------
const order = { error: 0, warn: 1, info: 2 };
const icon = { error: '🔴', warn: '🟠', info: '🔵' };
const lines = [];
lines.push(`# Auditoría del sitio`, ``, `- **URL:** ${stripCredentials(url)}`, `- **Fecha:** ${new Date().toISOString()}`, `- **Informes JSON:** \`${path.relative(PROJECT_ROOT, OUT).replace(/\\/g, '/')}/\``, ``);
lines.push(`## Resumen`, ``, `| Área | 🔴 Errores | 🟠 Avisos | 🔵 Info |`, `|---|---:|---:|---:|`);
for (const r of results) {
    const c = { error: 0, warn: 0, info: 0 };
    r.issues.forEach((i) => c[i.severity]++);
    lines.push(`| ${r.title} | ${c.error} | ${c.warn} | ${c.info} |`);
}
lines.push(``, `## Prioridades (errores de todas las áreas)`, ``);
const errors = results.flatMap((r) => r.issues.filter((i) => i.severity === 'error').map((i) => ({ ...i, area: r.title })));
if (!errors.length) lines.push(`Sin errores. 🎉`);
for (const e of errors.slice(0, 40)) lines.push(`- 🔴 **${e.area}** · \`${e.id}\` — ${e.message}${e.file ? ` (\`${e.file}:${e.line}\`)` : ''}`);
for (const r of results) {
    lines.push(``, `## ${r.title}`, ``);
    if (!r.issues.length) { lines.push(`Sin hallazgos.`); continue; }
    const sorted = [...r.issues].sort((a, b) => order[a.severity] - order[b.severity]);
    // Agrupar por id para no repetir 30 veces lo mismo
    const groups = new Map();
    for (const i of sorted) { const g = groups.get(i.id) || { ...i, count: 0, samples: [] }; g.count++; if (g.samples.length < 4 && (i.file || i.selector || i.url)) g.samples.push(i.file ? `${i.file}:${i.line}` : i.selector || i.url); groups.set(i.id, g); }
    for (const g of groups.values()) lines.push(`- ${icon[g.severity]} \`${g.id}\`${g.count > 1 ? ` ×${g.count}` : ''} — ${g.message}${g.samples.length ? `\n  - ${g.samples.join('\n  - ')}` : ''}`);
}
lines.push(``, `---`, `Generado por \`.claude/skills/site-audit/scripts/run-all.mjs\`. Cada área tiene su skill con el detalle de cómo corregir.`);
const md = writeText(OUT, 'summary.md', lines.join('\n'));
console.log(`\n══ Resumen: ${md}`);
console.log(`   errores totales: ${errors.length}`);
