#!/usr/bin/env node
// Congela la versión ACTUAL (git HEAD) del save.js de un bloque como entrada de
// deprecated.js, antes de cambiar el markup. Implementa "la regla del
// deprecated.js" del README.
//
//   node freeze-save.mjs <slug> [--ref=HEAD] [--write]
//
// Sin --write: imprime el snippet listo para pegar y el diagnóstico.
// Con --write:
//   - si NO existe deprecated.js, lo crea con la entrada v1 (imports + save
//     renombrado + attributes/supports del block.json de ese ref) y recuerda
//     conectarlo en index.js;
//   - si YA existe, NO lo toca: imprime el snippet para añadirlo AL PRINCIPIO
//     del array (las versiones van de más reciente a más antigua).
//
// Limitación conocida (README): si el save importa componentes de
// src/components, el deprecated queda atado a su HTML actual. Cuando cambien,
// hay que escribir ese markup a mano dentro del deprecated.

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { parseArgs, usage, PROJECT_ROOT } from '../../../lib/audit-lib.mjs';

const { positional: [slug], flags } = parseArgs();
if (!slug) usage('Uso: node freeze-save.mjs <slug-del-bloque> [--ref=HEAD] [--write]');

const REF = String(flags.ref || 'HEAD');
const blockDir = path.join(PROJECT_ROOT, 'src', 'blocks', slug);
const savePath = `src/blocks/${slug}/save.js`;
const jsonPath = `src/blocks/${slug}/block.json`;
const deprecatedFile = path.join(blockDir, 'deprecated.js');
const indexFile = path.join(blockDir, 'index.js');

if (!fs.existsSync(blockDir)) usage(`No existe ${blockDir}`);

const git = (cmd) => execSync(cmd, { cwd: PROJECT_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
let saveSrc, blockJson;
try {
    saveSrc = git(`git show ${REF}:${savePath}`);
    blockJson = JSON.parse(git(`git show ${REF}:${jsonPath}`));
} catch {
    console.error(`No se pudo leer ${savePath} o ${jsonPath} en ${REF}. ¿Bloque nuevo sin commit? Entonces no hay nada publicado que proteger.`);
    process.exit(1);
}

// ¿El save.js del working tree difiere ya del ref? (el usuario ya lo tocó)
let alreadyChanged = false;
try { git(`git diff --quiet ${REF} -- ${savePath}`); } catch { alreadyChanged = true; }

// Nº de versión = entradas existentes + 1
let existing = 0;
if (fs.existsSync(deprecatedFile)) {
    const cur = fs.readFileSync(deprecatedFile, 'utf8');
    existing = (cur.match(/\bsave\s*:/g) || []).length;
}
const version = existing + 1;
const fnName = `saveV${version}`;

// Separar imports del cuerpo y renombrar la función exportada
const importLines = [];
const bodyLines = [];
for (const line of saveSrc.split(/\r?\n/)) (/^\s*import\b/.test(line) ? importLines : bodyLines).push(line);
let body = bodyLines.join('\n').trim();
body = body.replace(/export\s+default\s+function\s+\w*\s*\(/, `function ${fnName}(`);
body = body.replace(/export\s+default\s+(\(|function)/, `const ${fnName} = $1`);

const attrs = JSON.stringify(blockJson.attributes || {}, null, 4).replace(/\n/g, '\n');
const supports = JSON.stringify(blockJson.supports || {}, null, 4).replace(/\n/g, '\n');

const entry = `    {
        // v${version} — markup vigente en ${REF} (${new Date().toISOString().slice(0, 10)}).
        // attributes/supports copiados del block.json de ese momento, NO los actuales.
        attributes: ${attrs.replace(/\n/g, '\n        ')},
        supports: ${supports.replace(/\n/g, '\n        ')},
        // migrate: (attributes) => ({ ...attributes }), // solo si algún atributo cambió de nombre
        save: ${fnName},
    },`;

const fileContent = `/**
 * Versiones antiguas del markup del bloque "${slug}".
 * Orden: de más reciente a más antigua. WordPress prueba cada una cuando el
 * save actual no coincide con el HTML guardado; si encaja, migra sin avisos.
 * Ver README → "La regla del deprecated.js".
 */
${importLines.join('\n')}

${body}

const deprecated = [
${entry}
];

export default deprecated;
`;

console.log(`Bloque: ${slug}   ref: ${REF}   versión a congelar: v${version}`);
console.log(`save.js ya modificado respecto a ${REF}: ${alreadyChanged ? 'SÍ (se congela la versión de ' + REF + ', no la del disco)' : 'no'}`);
console.log(`deprecated.js existente: ${existing ? `sí (${existing} entrada/s)` : 'no'}`);
const usesComponents = importLines.some((l) => /components\//.test(l));
if (usesComponents) console.log('⚠ El save importa componentes compartidos: el deprecated queda atado a su HTML. Si cambian, escribe el markup a mano.');

if (!flags.write) {
    console.log('\n──── Snippet (añadir AL PRINCIPIO del array `deprecated`) ────\n');
    console.log(importLines.join('\n') + '\n\n' + body + '\n\n' + entry);
    console.log('\nUsa --write para crear deprecated.js (solo si no existe).');
    process.exit(0);
}

if (fs.existsSync(deprecatedFile)) {
    console.log('\ndeprecated.js ya existe: no lo sobrescribo. Añade esta entrada al principio del array y las funciones/imports que falten:\n');
    console.log(body + '\n\n' + entry);
    process.exit(0);
}

fs.writeFileSync(deprecatedFile, fileContent);
console.log(`\n✔ Creado ${path.relative(PROJECT_ROOT, deprecatedFile)}`);
const idx = fs.existsSync(indexFile) ? fs.readFileSync(indexFile, 'utf8') : '';
if (!/deprecated/.test(idx)) {
    console.log(`\nFalta conectarlo en ${path.relative(PROJECT_ROOT, indexFile)}:\n  import deprecated from './deprecated';\n  registerBlockType(metadata.name, { edit: Edit, save, deprecated });`);
}
console.log('\nSiguiente: ahora sí, cambia save.js. Luego npm run build y abre una página que use el bloque: no debe aparecer "contenido inesperado".');
