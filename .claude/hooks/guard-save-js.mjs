#!/usr/bin/env node
// PreToolUse (Edit|Write|MultiEdit) sobre src/blocks/<bloque>/save.js.
// Implementa "la regla del deprecated.js" del README: cambiar el markup de un
// bloque estático ya publicado sin congelar antes la versión actual en
// deprecated.js rompe el contenido guardado ("Este bloque contiene contenido
// inesperado").
//
// Lógica:
//   - save.js NO está en git (bloque nuevo)            → allow, sin ruido.
//   - deprecated.js ya tiene cambios sin commitear      → allow (se congeló).
//   - en otro caso                                      → ask, con el motivo y
//     el comando para congelar. El usuario decide (p. ej. un bloque que sabe
//     que no está en ninguna página).

import fs from 'node:fs';
import path from 'node:path';
import { readStdin, decide, normalize, git } from './_hook-lib.mjs';

const input = await readStdin();
const file = normalize(input?.tool_input?.file_path || '');
const m = file.match(/src\/blocks\/([^/]+)\/save\.js$/);
if (!m) process.exit(0);

const slug = m[1];
const cwd = input.cwd || process.cwd();
const savePath = `src/blocks/${slug}/save.js`;
const depPath = `src/blocks/${slug}/deprecated.js`;

// ¿save.js está versionado? Si no, es un bloque nuevo: nada publicado que proteger.
const tracked = git(`ls-files --error-unmatch ${savePath}`, cwd);
if (tracked === null) process.exit(0);

// ¿deprecated.js tiene cambios locales (o es nuevo sin commitear)? → ya se congeló.
const depStatus = git(`status --porcelain -- ${depPath}`, cwd);
if (depStatus) process.exit(0);

// ¿save.js ya tiene cambios locales? Entonces ya avisamos antes; no repetir.
const saveStatus = git(`status --porcelain -- ${savePath}`, cwd);
if (saveStatus) process.exit(0);

let ns = 'ashlar';
try { ns = JSON.parse(fs.readFileSync(path.join(cwd, '.claude', 'project.json'), 'utf8')).blockNamespace || ns; } catch { /* noop */ }

decide(
    'ask',
    `Vas a modificar ${savePath} y deprecated.js no ha cambiado. Si el bloque "${slug}" está en alguna página publicada, su HTML guardado dejará de coincidir. ` +
    `Congela primero la versión actual: node .claude/skills/deprecated-save/scripts/freeze-save.mjs ${slug} --write ` +
    `(o comprueba dónde se usa: php .claude/skills/wp-local/scripts/wp-diagnose.php --block=${ns}/${slug}). ` +
    `Aprueba solo si sabes que el bloque no está publicado o que el cambio no altera el markup.`
);
