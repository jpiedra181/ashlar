#!/usr/bin/env node
// PreToolUse (Edit|Write|MultiEdit): bloquea ediciones dentro de build/ y
// node_modules/. build/ se regenera con cada compilación ("Regla de oro" del
// README): cualquier cambio ahí se pierde. Devuelve permissionDecision=deny.

import { readStdin, decide, normalize } from './_hook-lib.mjs';

const input = await readStdin();
const file = normalize(input?.tool_input?.file_path || input?.tool_input?.path || '');
if (!file) process.exit(0);

const cwd = normalize(input.cwd || process.cwd());
const relative = file.startsWith(cwd) ? file.slice(cwd.length).replace(/^\//, '') : file;

if (/^(|.*\/)build\//.test(relative)) {
    decide('deny', `Bloqueado: "${relative}" está dentro de build/, que es GENERADO por "npm run build" y no está en Git. Edita el origen en src/ (SCSS → src/scss o src/blocks/*/style.scss; JS → src/blocks/*/ o src/js/) y recompila.`);
}
if (/(^|\/)node_modules\//.test(relative)) {
    decide('deny', `Bloqueado: "${relative}" está en node_modules/. Si hace falta parchear una dependencia, hazlo vía package.json (overrides/patch-package), no editando el paquete.`);
}
process.exit(0);
