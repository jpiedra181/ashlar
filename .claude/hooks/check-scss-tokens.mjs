#!/usr/bin/env node
// PostToolUse (Edit|Write|MultiEdit) sobre src/**/*.scss.
// Avisa (no bloquea) si el fichero recién editado contiene valores de marca a
// mano en lugar de tokens de theme.json: colores hex/rgb, font-size en px,
// font-family literal, !important, o media queries max-width en un tema
// mobile-first (`@include up()`). Añade el aviso como contexto para Claude.
// Excepciones: src/scss/config/ (define los tokens) y src/scss/vendor/.

import fs from 'node:fs';
import { readStdin, context, normalize } from './_hook-lib.mjs';

const input = await readStdin();
const file = normalize(input?.tool_input?.file_path || '');
if (!/\.scss$/.test(file) || !/\/src\//.test(file)) process.exit(0);
if (/\/src\/scss\/(config|vendor)\//.test(file)) process.exit(0);
if (!fs.existsSync(file)) process.exit(0);

const src = fs.readFileSync(file, 'utf8');
const lines = src.split(/\r?\n/);
const findings = [];
const add = (id, n, line) => findings.push(`${id} (línea ${n}): ${line.trim().slice(0, 80)}`);

lines.forEach((line, i) => {
    const n = i + 1;
    const code = line.replace(/\/\/.*$/, '');
    if (!code.trim()) return;
    if (/#[0-9a-fA-F]{3,8}\b/.test(code) && !/url\(|\$|@use|@forward/.test(code)) add('color-hex', n, line);
    if (/\brgba?\(|\bhsla?\(/.test(code) && !/var\(--/.test(code)) add('color-rgb', n, line);
    if (/font-size\s*:\s*[0-9.]+(px|rem|em)/.test(code)) add('font-size-literal', n, line);
    if (/font-family\s*:\s*["']?[A-Za-z]/.test(code) && !/var\(--|\$font/.test(code)) add('font-family-literal', n, line);
    if (/!important/.test(code)) add('important', n, line);
    if (/@media\s*\(\s*max-width|@include\s+down\(/.test(code)) add('max-width-query', n, line);
    if (/border-radius\s*:\s*[0-9.]+px/.test(code)) add('radius-literal', n, line);
});

if (!findings.length) process.exit(0);

context(
    'PostToolUse',
    `Revisión de tokens en ${file.split('/src/')[1]}: ${findings.length} posible(s) valor(es) hardcoded.\n` +
    findings.slice(0, 12).map((f) => `- ${f}`).join('\n') +
    (findings.length > 12 ? `\n- … y ${findings.length - 12} más` : '') +
    `\nConvención del tema: colores → variables del tono (var(--fg), var(--accent), var(--line)…) o var(--color-*), tipografía → mixins t-* o var(--font-size-*), radios → var(--radius-*), espaciado → var(--space-*); mobile-first con @include up(bp). ` +
    `Si el valor es estructural (width/gap en px) o una excepción justificada (p. ej. !important en el bloque de movimiento reducido, o la escala de wp-admin en src/admin/), déjalo y sigue.`
);
