#!/usr/bin/env node
// Comprobación pasiva de seguridad de un sitio WordPress en ejecución.
//
//   node site-headers.mjs <url> [--out=dir]
//
// SOLO peticiones GET/HEAD de lectura a rutas públicas conocidas; no explota
// nada. Úsalo únicamente sobre sitios propios o con autorización.
//
// Revisa: cabeceras de seguridad (CSP, HSTS, X-Content-Type-Options,
// X-Frame-Options, Referrer-Policy, Permissions-Policy), exposición de versión
// (generator, Server, X-Powered-By, readme.html), enumeración de usuarios
// (REST /wp/v2/users, ?author=1), xmlrpc.php, listado de directorios en
// uploads, ficheros de backup típicos, cookies sin flags, mixed content,
// login sin HTTPS. Solo detecta; no cambia nada.

import path from 'node:path';
import { parseArgs, usage, launchChromium, contextOptionsFromUrl, stripCredentials, writeJson, printSummary, printTop, REPORTS_ROOT } from '../../../lib/audit-lib.mjs';

const { positional: [url], flags } = parseArgs();
if (!url) usage('Uso: node site-headers.mjs <url> [--out=dir]');
const OUT = path.resolve(flags.out || path.join(REPORTS_ROOT, 'security'));
const origin = new URL(url).origin;
const isProd = !/localhost|\.local\b|127\.0\.0\.1/.test(origin);

const issues = [];
const push = (severity, id, message, extra = {}) => issues.push({ severity, id, message, ...extra });

const browser = await launchChromium();
const findings = { url: stripCredentials(url), origin, isProd, headers: {}, checks: {} };
try {
    const context = await browser.newContext({ ...contextOptionsFromUrl(url) });
    const req = context.request;
    const get = async (u, opts = {}) => { try { const r = await req.get(u, { maxRedirects: 0, timeout: 15000, ...opts }); return { status: r.status(), headers: r.headers(), body: r.status() < 400 ? await r.text().catch(() => '') : '' }; } catch { return { status: 0, headers: {}, body: '' }; } };

    // --- Página principal: cabeceras --------------------------------------
    const home = await get(url, { maxRedirects: 3 });
    findings.headers = home.headers;
    const h = (k) => home.headers[k.toLowerCase()];
    if (home.status === 0) { push('error', 'unreachable', `No se pudo cargar ${origin}.`); }
    const https = origin.startsWith('https://');
    if (!https && isProd) push('error', 'no-https', 'El sitio se sirve por HTTP.');
    if (https && !h('strict-transport-security')) push('warn', 'hsts-missing', 'Falta Strict-Transport-Security (HSTS).');
    if (!h('content-security-policy') && !h('content-security-policy-report-only')) push('warn', 'csp-missing', 'Sin Content-Security-Policy. En WordPress empieza con una política report-only y ve cerrándola.');
    else if (/unsafe-inline/.test(h('content-security-policy') || '') && /unsafe-eval/.test(h('content-security-policy') || '')) push('info', 'csp-weak', 'CSP con unsafe-inline y unsafe-eval: protege poco frente a XSS.');
    if ((h('x-content-type-options') || '').toLowerCase() !== 'nosniff') push('warn', 'nosniff-missing', 'Falta X-Content-Type-Options: nosniff.');
    if (!h('x-frame-options') && !/frame-ancestors/.test(h('content-security-policy') || '')) push('warn', 'frame-options-missing', 'Falta X-Frame-Options / frame-ancestors (clickjacking).');
    if (!h('referrer-policy')) push('info', 'referrer-policy-missing', 'Falta Referrer-Policy (recomendado strict-origin-when-cross-origin).');
    if (!h('permissions-policy')) push('info', 'permissions-policy-missing', 'Falta Permissions-Policy (camera=(), microphone=(), geolocation=()...).');
    if (h('server') && /\d/.test(h('server'))) push('info', 'server-version-exposed', `Server: ${h('server')} expone versión.`);
    if (h('x-powered-by')) push('info', 'x-powered-by', `X-Powered-By: ${h('x-powered-by')} expone la versión de PHP.`);
    for (const c of (home.headers['set-cookie'] || '').split(/\n|, (?=[^ ;]+=)/).filter(Boolean)) {
        if (/wordpress|wp-/i.test(c) && !/httponly/i.test(c)) push('warn', 'cookie-no-httponly', `Cookie sin HttpOnly: ${c.split(';')[0].slice(0, 40)}`);
        if (https && /wordpress|wp-/i.test(c) && !/secure/i.test(c)) push('warn', 'cookie-no-secure', `Cookie sin Secure: ${c.split(';')[0].slice(0, 40)}`);
    }
    const gen = home.body.match(/<meta name="generator" content="([^"]+)"/i);
    if (gen) push('info', 'generator-meta', `Meta generator: ${gen[1]}. Quitar con remove_action('wp_head','wp_generator').`);
    if (/\?ver=\d+\.\d+/.test(home.body) && /wp-includes\/(js|css)\/[^"']+\?ver=(\d+\.\d+(\.\d+)?)/.test(home.body)) push('info', 'core-version-in-assets', 'La versión de WP aparece en ?ver= de assets de core.');
    if (https && /(src|href)=["']http:\/\//.test(home.body)) push('warn', 'mixed-content', 'Recursos http:// en una página https (mixed content).');
    if (/\/wp-content\/debug\.log|WP_DEBUG|Notice: |Warning: /.test(home.body)) push('error', 'debug-output', 'La página muestra avisos/errores de PHP o referencias a debug (WP_DEBUG activo en producción).');
    if (/xmlrpc\.php/.test(home.body)) push('info', 'xmlrpc-link', 'La página anuncia xmlrpc.php (<link rel="pingback">).');

    // --- Endpoints de exposición ------------------------------------------
    const users = await get(`${origin}/wp-json/wp/v2/users`);
    findings.checks.restUsers = users.status;
    if (users.status === 200 && /"slug"/.test(users.body)) push('warn', 'user-enumeration-rest', '/wp-json/wp/v2/users lista los usuarios (nombres de login para fuerza bruta). Restringir a usuarios autenticados.');
    const author = await get(`${origin}/?author=1`);
    findings.checks.authorRedirect = { status: author.status, location: author.headers.location };
    if ([301, 302].includes(author.status) && /\/author\//.test(author.headers.location || '')) push('info', 'user-enumeration-author', `?author=1 redirige a ${author.headers.location} (revela el login del usuario 1).`);
    const xmlrpc = await get(`${origin}/xmlrpc.php`);
    findings.checks.xmlrpc = xmlrpc.status;
    if (xmlrpc.status === 405 || (xmlrpc.status === 200 && /XML-RPC server accepts POST/.test(xmlrpc.body))) push('warn', 'xmlrpc-enabled', 'xmlrpc.php está activo (amplificación de fuerza bruta y pingback DDoS). Desactivar si no se usa Jetpack/app móvil.');
    const readme = await get(`${origin}/readme.html`);
    if (readme.status === 200 && /WordPress/.test(readme.body)) push('info', 'readme-exposed', '/readme.html accesible (versión de WordPress).');
    const license = await get(`${origin}/license.txt`);
    if (license.status === 200 && /WordPress/.test(license.body)) push('info', 'license-exposed', '/license.txt accesible.');
    const uploads = await get(`${origin}/wp-content/uploads/`);
    if (uploads.status === 200 && /Index of/.test(uploads.body)) push('warn', 'directory-listing', 'Listado de directorios activo en /wp-content/uploads/.');
    const themeDir = await get(`${origin}/wp-content/themes/`);
    if (themeDir.status === 200 && /Index of/.test(themeDir.body)) push('warn', 'directory-listing-themes', 'Listado de directorios activo en /wp-content/themes/.');
    for (const f of ['/wp-config.php.bak', '/wp-config.php.old', '/wp-config.txt', '/.env', '/.git/HEAD', '/backup.zip', '/wp-content/debug.log', '/phpinfo.php', '/info.php']) {
        const r = await get(`${origin}${f}`);
        if (r.status === 200 && r.body.length > 0 && !/<!DOCTYPE html/i.test(r.body.slice(0, 200))) push('error', 'sensitive-file-exposed', `${f} responde 200.`);
    }
    const login = await get(`${origin}/wp-login.php`);
    findings.checks.login = login.status;
    if (login.status === 200 && !https && isProd) push('error', 'login-over-http', 'wp-login.php servido por HTTP.');
    const install = await get(`${origin}/wp-admin/install.php`);
    // Solo es un problema si muestra el FORMULARIO de instalación (WP ya
    // instalado responde con un aviso "ya instalado", en cualquier idioma).
    if (install.status === 200 && /name="(weblog_title|user_name|admin_password)"/.test(install.body)) push('error', 'install-exposed', 'wp-admin/install.php muestra el formulario de instalación.');
    const cron = await get(`${origin}/wp-cron.php`);
    findings.checks.cron = cron.status;

    // Plugins visibles en el HTML (informativo, para revisar actualizaciones)
    const plugins = [...new Set([...home.body.matchAll(/wp-content\/plugins\/([^/"']+)/g)].map((m) => m[1]))];
    findings.checks.pluginsInHtml = plugins;
    if (plugins.length) push('info', 'plugins-visible', `Plugins detectables en el HTML: ${plugins.join(', ')}. Mantenerlos actualizados; los abandonados son el vector nº 1.`);

    // Cabeceras de caché en assets estáticos (rendimiento, pero también evita re-servir builds viejos)
    const css = home.body.match(/href=["']([^"']+\/build\/css\/main\.css[^"']*)["']/);
    if (css) {
        const asset = await get(new URL(css[1], origin).toString());
        if (asset.status === 200 && !asset.headers['cache-control']) push('info', 'static-no-cache-control', 'main.css sin Cache-Control (configurar en el servidor: 1 año + versión por ?ver=).');
    }
} finally {
    await browser.close();
}

if (!isProd) push('info', 'local-env', 'Entorno local: las cabeceras las pone el servidor de producción; repite esta comprobación contra la URL pública.');

const report = { ...findings, generatedAt: new Date().toISOString(), issues, summary: { errors: issues.filter((i) => i.severity === 'error').length, warnings: issues.filter((i) => i.severity === 'warn').length, info: issues.filter((i) => i.severity === 'info').length } };
const file = writeJson(OUT, 'site-report.json', report);
printSummary('Seguridad (sitio)', issues, file);
printTop(issues, 25);
