// Utilidades compartidas por los scripts de auditoría de .claude/skills/*/scripts/.
// Sin dependencias propias: usa `playwright` (ya presente vía @wordpress/scripts)
// y Node >= 18. Todo en ESM.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Ashlar del proyecto = carpeta que contiene `.claude/`. */
export const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

/** Carpeta por defecto para informes (gitignored vía .claude/reports/.gitignore). */
/** Parámetros del proyecto (.claude/project.json): namespace, text domain, URLs. */
export const PROJECT = (() => {
    try {
        return JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, '.claude', 'project.json'), 'utf8'));
    } catch {
        return {};
    }
})();
export const NS = PROJECT.blockNamespace || 'ashlar';
export const TD = PROJECT.textDomain || NS;

export const REPORTS_ROOT = path.join(PROJECT_ROOT, '.claude', 'reports');

/**
 * Parseo mínimo de argumentos:
 *   node script.mjs <url> [más urls...] [--out dir] [--flag] [--key=value]
 */
export function parseArgs(argv = process.argv.slice(2)) {
    const positional = [];
    const flags = {};
    for (const raw of argv) {
        if (raw.startsWith('--')) {
            const [k, v] = raw.slice(2).split('=');
            flags[k] = v === undefined ? true : v;
        } else {
            positional.push(raw);
        }
    }
    return { positional, flags };
}

export function usage(text) {
    console.error(text);
    process.exit(1);
}

export function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}

export function stamp() {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

/** Carga Playwright con un mensaje claro si no está instalado. */
export async function loadPlaywright() {
    try {
        return await import('playwright');
    } catch {
        console.error(
            'No se encuentra el paquete `playwright`.\n' +
            'Instálalo una vez por máquina:\n' +
            '  npm install -D playwright\n' +
            '  npx playwright install chromium'
        );
        process.exit(1);
    }
}

/**
 * Lanza Chromium. Si el binario de Playwright no está descargado, cae al
 * Chrome o Edge instalados en el sistema (channel), que en Windows casi
 * siempre existen. Así el script funciona sin `npx playwright install`.
 */
export async function launchChromium(opts = {}) {
    const { chromium } = await loadPlaywright();
    const attempts = [
        { label: 'chromium (playwright)', options: {} },
        { label: 'chrome (sistema)', options: { channel: 'chrome' } },
        { label: 'msedge (sistema)', options: { channel: 'msedge' } },
    ];
    let lastErr;
    for (const a of attempts) {
        try {
            return await chromium.launch({ headless: true, ...a.options, ...opts });
        } catch (err) {
            lastErr = err;
        }
    }
    console.error(
        'No se ha podido lanzar ningún navegador Chromium (ni el de Playwright ni Chrome/Edge del sistema).\n' +
        'Descarga el de Playwright con:\n' +
        '  npx playwright install chromium\n\n' + (lastErr?.message || '')
    );
    process.exit(1);
}

/**
 * Navega con `networkidle` y cae a `domcontentloaded` si la página nunca
 * se queda quieta (sitios con polling, vídeos, GSAP tickers...).
 */
export async function gotoSafe(page, url, timeout = 30000) {
    try {
        return await page.goto(url, { waitUntil: 'networkidle', timeout });
    } catch {
        return await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
    }
}

/** Contexto con cabecera Basic Auth si la URL lleva user:pass@host. */
export function contextOptionsFromUrl(url) {
    const u = new URL(url);
    const opts = {};
    if (u.username) {
        opts.httpCredentials = {
            username: decodeURIComponent(u.username),
            password: decodeURIComponent(u.password),
        };
    }
    return opts;
}

export function stripCredentials(url) {
    const u = new URL(url);
    u.username = '';
    u.password = '';
    return u.toString();
}

/** Escribe JSON y devuelve la ruta. */
export function writeJson(dir, name, data) {
    ensureDir(dir);
    const file = path.join(dir, name);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return file;
}

/** Escribe Markdown y devuelve la ruta. */
export function writeText(dir, name, text) {
    ensureDir(dir);
    const file = path.join(dir, name);
    fs.writeFileSync(file, text);
    return file;
}

/** Cuenta issues por severidad. */
export function countBySeverity(issues) {
    const c = { error: 0, warn: 0, info: 0 };
    for (const i of issues) c[i.severity] = (c[i.severity] || 0) + 1;
    return c;
}

/** Resumen de consola homogéneo entre scripts. */
export function printSummary(title, issues, reportFile) {
    const c = countBySeverity(issues);
    console.log(`\n${title}`);
    console.log(`  errores: ${c.error}  avisos: ${c.warn}  info: ${c.info}`);
    if (reportFile) console.log(`  informe: ${reportFile}`);
}

/** Lista con viñetas de los issues más graves (para la consola). */
export function printTop(issues, max = 12) {
    const order = { error: 0, warn: 1, info: 2 };
    const sorted = [...issues].sort((a, b) => order[a.severity] - order[b.severity]);
    for (const i of sorted.slice(0, max)) {
        const where = i.selector || i.file || i.url || '';
        console.log(`  [${i.severity}] ${i.id}: ${i.message}${where ? `  (${where})` : ''}`);
    }
    if (sorted.length > max) console.log(`  ... y ${sorted.length - max} más (ver informe)`);
}

/** Recorre un árbol de ficheros filtrando por extensión. */
export function walk(dir, exts, out = []) {
    if (!fs.existsSync(dir)) return out;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '.git') continue;
            walk(full, exts, out);
        } else if (exts.some((e) => entry.name.endsWith(e))) {
            out.push(full);
        }
    }
    return out;
}

export function rel(file) {
    return path.relative(PROJECT_ROOT, file).replace(/\\/g, '/');
}

export function kb(bytes) {
    return `${(bytes / 1024).toFixed(1)} KB`;
}
