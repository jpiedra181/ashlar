#!/usr/bin/env node
// SessionStart: inyecta un "estado del entorno" breve al empezar la sesión,
// para que Claude no tenga que redescubrirlo: rama, build/ (existe / es de
// desarrollo / está desactualizado respecto a src/), Node vs .nvmrc, si el
// sitio local responde, y qué save.js han cambiado respecto a main sin tocar
// su deprecated.js.

import fs from 'node:fs';
import path from 'node:path';
import { readStdin, context, git } from './_hook-lib.mjs';

const input = await readStdin();
const cwd = input?.cwd || process.cwd();
const lines = [];

// Rama y estado
const branch = git('rev-parse --abbrev-ref HEAD', cwd);
const dirty = git('status --porcelain', cwd);
if (branch) lines.push(`Rama: ${branch}${dirty ? ` (${dirty.split('\n').length} fichero/s con cambios)` : ' (limpia)'}`);

// build/
const build = path.join(cwd, 'build');
if (!fs.existsSync(path.join(build, 'blocks'))) {
    lines.push('build/: NO existe → WordPress no verá ningún bloque hasta `npm run build`.');
} else {
    const maps = fs.readdirSync(path.join(build, 'css')).some((f) => f.endsWith('.map'));
    let newest = 0;
    const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else { const t = fs.statSync(p).mtimeMs; if (t > newest) newest = t; } } };
    try { walk(path.join(cwd, 'src')); } catch { /* noop */ }
    const buildTime = fs.statSync(path.join(build, 'css', 'main.css')).mtimeMs;
    const stale = newest > buildTime;
    lines.push(`build/: ${maps ? 'compilado en modo DESARROLLO (npm start, con sourcemaps)' : 'compilado en modo producción'}${stale ? ' · DESACTUALIZADO: hay ficheros en src/ más nuevos que build/css/main.css' : ' · al día con src/'}.`);
}

// Node
try {
    const want = fs.readFileSync(path.join(cwd, '.nvmrc'), 'utf8').trim().replace(/^v/, '');
    const have = process.versions.node;
    if (!have.startsWith(want.split('.')[0])) lines.push(`Node: ${have} pero .nvmrc pide ${want}.`);
} catch { /* sin .nvmrc */ }

// Sitio local (lee la URL de .claude/project.json si existe; si no, no comprueba)
let localUrl = null;
try { localUrl = JSON.parse(fs.readFileSync(path.join(cwd, '.claude', 'project.json'), 'utf8')).localUrl || null; } catch { /* noop */ }
if (localUrl) {
    try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 2500);
        const r = await fetch(localUrl, { signal: ctrl.signal, redirect: 'manual' });
        clearTimeout(t);
        lines.push(`Sitio local ${localUrl}: responde ${r.status}.`);
    } catch {
        lines.push(`Sitio local ${localUrl}: NO responde (arranca el sitio en Local antes de auditar o usar Playwright).`);
    }
}

// save.js cambiados respecto a main sin deprecated.js tocado
const base = git('merge-base HEAD main', cwd) || git('merge-base HEAD origin/main', cwd);
if (base) {
    const changed = (git(`diff --name-only ${base} -- src/blocks`, cwd) || '').split('\n').filter(Boolean);
    const saves = changed.filter((f) => /\/save\.js$/.test(f));
    const risky = saves.filter((f) => !changed.includes(f.replace(/save\.js$/, 'deprecated.js')));
    if (risky.length) lines.push(`⚠ save.js modificados respecto a main SIN cambio en su deprecated.js: ${risky.map((f) => f.split('/')[2]).join(', ')}. Si esos bloques están publicados, congela el markup anterior (skill deprecated-save).`);
}

if (!lines.length) process.exit(0);
context('SessionStart', `Estado del entorno (hook session-context):\n- ${lines.join('\n- ')}`);
