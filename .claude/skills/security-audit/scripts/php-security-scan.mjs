#!/usr/bin/env node
// Escáner estático de seguridad para el código PHP/JS del tema.
//
//   node php-security-scan.mjs [--out=dir] [--paths=inc,src/blocks,functions.php]
//
// Heurísticas (no sustituye a PHPCS + WordPress-Coding-Standards, pero no
// necesita Composer): salida sin escapar, input sin sanear, nonces y
// capabilities en handlers, SQL sin prepare, funciones peligrosas, ABSPATH,
// innerHTML/dangerouslySetInnerHTML en JS. Cada hallazgo lleva fichero:línea.
// Solo lee; no cambia nada.

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, writeJson, PROJECT_ROOT, REPORTS_ROOT, walk, rel, printSummary, printTop } from '../../../lib/audit-lib.mjs';

const { flags } = parseArgs();
const OUT = path.resolve(flags.out || path.join(REPORTS_ROOT, 'security'));
const PATHS = String(flags.paths || 'functions.php,inc,src,parts,templates').split(',').map((p) => path.join(PROJECT_ROOT, p.trim()));

const phpFiles = [];
const jsFiles = [];
for (const p of PATHS) {
    if (!fs.existsSync(p)) continue;
    if (fs.statSync(p).isFile()) { (p.endsWith('.php') ? phpFiles : jsFiles).push(p); continue; }
    phpFiles.push(...walk(p, ['.php']));
    jsFiles.push(...walk(p, ['.js', '.jsx', '.mjs']).filter((f) => !/\/build\//.test(f)));
}

const issues = [];
const push = (severity, id, message, file, line, snippet) => issues.push({ severity, id, message, file: rel(file), line, snippet: snippet?.trim().slice(0, 160) });

const ESCAPERS = /\b(esc_html|esc_attr|esc_url|esc_js|esc_textarea|esc_html__|esc_attr__|esc_html_e|esc_attr_e|wp_kses|wp_kses_post|wp_kses_data|wp_json_encode|absint|intval|number_format|sanitize_\w+|get_block_wrapper_attributes|wp_get_attachment_image|the_title|the_content|the_excerpt|the_permalink|the_post_thumbnail|paginate_links|wp_nav_menu|get_search_form|bloginfo|body_class|post_class|wp_head|wp_footer|do_shortcode|__return|checked|selected|disabled|wp_nonce_field|settings_fields|do_settings_sections|submit_button|esc_html_x|_e|_x)\s*\(/;
const SANITIZERS = /\b(sanitize_\w+|absint|intval|wp_unslash|esc_url_raw|wp_kses\w*|\(int\)|\(bool\)|\(float\)|filter_input|filter_var|in_array|array_map|wp_verify_nonce|check_admin_referer|check_ajax_referer|isset|empty|max\(|min\()/;

for (const file of phpFiles) {
    const src = fs.readFileSync(file, 'utf8');
    const lines = src.split(/\r?\n/);
    const isTemplateHtml = /\.html$/.test(file);
    if (!isTemplateHtml && !/defined\(\s*['"]ABSPATH['"]\s*\)/.test(src) && !/\bABSPATH\b/.test(src)) push('warn', 'abspath-missing', 'Fichero PHP sin guard `defined(\'ABSPATH\') || exit;` (acceso directo por URL).', file, 1, lines[0]);

    const hasNonce = /wp_verify_nonce|check_admin_referer|check_ajax_referer|wp_nonce_field|settings_fields/.test(src);
    const hasCapCheck = /current_user_can\s*\(/.test(src);
    const registersHandler = /add_action\(\s*['"](wp_ajax_|admin_post_|rest_api_init)/.test(src);
    if (registersHandler && !hasNonce) push('error', 'handler-no-nonce', 'Registra un handler AJAX/admin_post/REST y el fichero no verifica nonce (CSRF).', file, 1, '');
    if (registersHandler && !hasCapCheck) push('warn', 'handler-no-capability', 'Registra un handler y el fichero no comprueba current_user_can().', file, 1, '');
    if (/register_rest_route\s*\(/.test(src) && !/permission_callback/.test(src)) push('error', 'rest-no-permission', 'register_rest_route sin permission_callback.', file, 1, '');

    lines.forEach((line, idx) => {
        const n = idx + 1;
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('#')) return;
        if (/phpcs:ignore/.test(line)) return;

        // Salida sin escapar: echo/print/<?= con variable o llamada no escapada
        const outputMatch = line.match(/(?:\becho\b|\bprint\b|<\?=)\s*(.+?)(?:;|\?>|$)/);
        // Etiqueta dinámica (`<<?php echo $tag ?>`) con lista blanca en el fichero:
        // la cubre el check dynamic-tag-no-whitelist, no este.
        const dynamicTagWhitelisted = /<\/?<\?php\s+echo\s+\$\w*/.test(line) && /in_array\(/.test(src);
        if (outputMatch && !dynamicTagWhitelisted) {
            const expr = outputMatch[1];
            const literalOnly = /^\s*(['"]).*\1\s*$/.test(expr) && !/\$/.test(expr);
            if (!literalOnly && /\$|\bget_\w+\(|\bthe_\w+\(/.test(expr) && !ESCAPERS.test(expr)) {
                push('warn', 'output-unescaped', 'Salida con variable/función sin esc_*()/wp_kses. Si el valor es HTML de confianza, anótalo con `// phpcs:ignore WordPress.Security.EscapeOutput`.', file, n, line);
            }
        }
        // Tag dinámico `<<?php echo $tag ?>` sin whitelist visible en el fichero
        if (/<<\?php\s+echo\s+\$/.test(line) && !/in_array\(/.test(src)) push('warn', 'dynamic-tag-no-whitelist', 'Etiqueta HTML dinámica sin lista blanca (in_array) en el fichero.', file, n, line);

        // Superglobales sin sanear
        const sg = line.match(/\$_(GET|POST|REQUEST|COOKIE|SERVER|FILES)\s*\[/);
        if (sg && !SANITIZERS.test(line)) push('error', 'input-unsanitized', `$_${sg[1]} leído sin sanear en la misma línea (sanitize_*, absint, (int), wp_unslash...).`, file, n, line);
        if (/\$_SERVER\s*\[\s*['"]HTTP_HOST['"]/.test(line)) push('info', 'http-host-trusted', 'HTTP_HOST es controlable por el cliente; usa home_url()/site_url().', file, n, line);

        // SQL
        if (/\$wpdb->(query|get_results|get_var|get_row|get_col)\s*\(/.test(line) && !/prepare\s*\(/.test(line) && /\$|\{/.test(line.replace(/\$wpdb/g, ''))) push('error', 'sql-no-prepare', '$wpdb con variables interpoladas sin $wpdb->prepare().', file, n, line);
        if (/\$wpdb->prepare\s*\(\s*["'][^"']*\$/.test(line)) push('error', 'sql-prepare-interpolated', 'Variables interpoladas DENTRO de la cadena de prepare() (anula la protección).', file, n, line);

        // Funciones peligrosas
        const danger = line.match(/\b(eval|exec|shell_exec|system|passthru|proc_open|popen|unserialize|create_function|assert|extract|parse_str)\s*\(/);
        if (danger) push(danger[1] === 'extract' || danger[1] === 'parse_str' ? 'warn' : 'error', `dangerous-function:${danger[1]}`, `Uso de ${danger[1]}().`, file, n, line);
        if (/base64_decode\s*\(/.test(line)) push('warn', 'base64-decode', 'base64_decode(): típico de código ofuscado; revisa el motivo.', file, n, line);
        if (/\b(include|require)(_once)?\s*\(?\s*\$/.test(line) && !/get_template_directory|get_stylesheet_directory|__DIR__|plugin_dir_path|\$build_dir|\$header_asset|\$buttons_asset|\$asset_file/.test(line)) push('warn', 'include-variable', 'include/require con ruta variable (LFI si viene de input).', file, n, line);
        if (/file_get_contents\s*\(\s*\$_(GET|POST|REQUEST)/.test(line) || /file_get_contents\s*\(\s*['"]https?:/.test(line)) push('warn', 'file-get-contents-remote', 'file_get_contents con URL/input: usa wp_remote_get() con validación.', file, n, line);
        if (/['"]sslverify['"]\s*=>\s*false/.test(line)) push('error', 'sslverify-false', 'wp_remote_* con sslverify => false.', file, n, line);
        if (/move_uploaded_file\s*\(/.test(line)) push('warn', 'raw-upload', 'move_uploaded_file(): usa wp_handle_upload() para validar tipo y ruta.', file, n, line);
        if (/\bcurl_exec\s*\(/.test(line)) push('info', 'curl-direct', 'cURL directo: prefiere la HTTP API de WordPress (wp_remote_*).', file, n, line);
        if (/\bunlink\s*\(|\brmdir\s*\(/.test(line)) push('info', 'file-delete', 'Borrado de ficheros: asegura que la ruta no viene de input.', file, n, line);

        // Settings / capacidades
        if (/register_setting\s*\(/.test(line) && !/sanitize_callback/.test(lines.slice(idx, idx + 6).join(' '))) push('error', 'register-setting-no-sanitize', 'register_setting() sin sanitize_callback en las 6 líneas siguientes.', file, n, line);
        if (/add_(menu|submenu|options|theme)_page\s*\(/.test(line)) {
            const block = lines.slice(idx, idx + 8).join(' ');
            if (/['"](read|edit_posts|publish_posts)['"]/.test(block)) push('warn', 'weak-capability', 'Página de admin con capability débil (read/edit_posts). Normalmente manage_options.', file, n, line);
        }
        if (/update_option\s*\(/.test(line) && !hasCapCheck && !/register_setting|sanitize/.test(src)) push('warn', 'update-option-no-cap', 'update_option() en un fichero sin current_user_can().', file, n, line);

        // Cabeceras / debug
        if (/\bvar_dump\s*\(|\bprint_r\s*\(|\berror_log\s*\(\s*print_r/.test(line)) push('warn', 'debug-output', 'var_dump/print_r en código de tema.', file, n, line);
        if (/header\s*\(\s*['"]Location:/.test(line)) push('info', 'raw-redirect', 'header(Location) manual: usa wp_safe_redirect() + exit.', file, n, line);
        if (/wp_redirect\s*\(/.test(line) && !/wp_safe_redirect/.test(line)) push('info', 'wp-redirect', 'wp_redirect(): si la URL puede venir de input, wp_safe_redirect().', file, n, line);
        if (/\$wpdb->\w+\s*\(.*\$_(GET|POST|REQUEST)/.test(line)) push('error', 'sql-from-input', 'Input del usuario directo en una consulta.', file, n, line);

        // i18n
        if (/\b(__|_e|esc_html__|esc_attr__|esc_html_e|esc_attr_e)\s*\(\s*['"][^'"]*['"]\s*\)/.test(line)) push('info', 'i18n-no-domain', 'Cadena traducible sin text domain (debería ser \'template\').', file, n, line);
        if (/\b(__|_e|esc_html__|esc_attr__)\s*\(\s*\$/.test(line)) push('warn', 'i18n-variable', 'Cadena traducible pasada como variable (no se extrae al .pot).', file, n, line);
    });
}

// JS del frontend/editor
for (const file of jsFiles) {
    const src = fs.readFileSync(file, 'utf8');
    src.split(/\r?\n/).forEach((line, idx) => {
        const n = idx + 1;
        if (/dangerouslySetInnerHTML/.test(line)) push('warn', 'js-dangerously-set-inner-html', 'dangerouslySetInnerHTML: asegúrate de que el HTML viene de RichText/atributos saneados, no de input libre.', file, n, line);
        if (/\.innerHTML\s*=(?!=)/.test(line) && !/['"`]\s*$/.test(line.trim()) && /\+|\$\{/.test(line)) push('warn', 'js-innerhtml-concat', 'innerHTML con concatenación/template: riesgo de XSS si incluye datos externos.', file, n, line);
        if (/\beval\s*\(|new Function\s*\(/.test(line)) push('error', 'js-eval', 'eval()/new Function().', file, n, line);
        if (/document\.write\s*\(/.test(line)) push('warn', 'js-document-write', 'document.write().', file, n, line);
        if (/(https?:)?\/\/(cdn\.|unpkg\.com|cdnjs\.|jsdelivr)/.test(line) && /<script|src=|import\(|addScriptTag/.test(line)) push('info', 'js-external-cdn', 'Script externo desde CDN: añade integrity (SRI) o empaquétalo.', file, n, line);
        if (/localStorage\.setItem\([^)]*(token|password|secret|key)/i.test(line)) push('warn', 'js-secret-storage', 'Posible secreto en localStorage.', file, n, line);
        if (/target\s*=\s*["']_blank["']/.test(line) && !/noopener|noreferrer/.test(line)) push('info', 'js-blank-no-noopener', 'target="_blank" sin rel="noopener".', file, n, line);
        if (/(api[_-]?key|secret|password|token)\s*[:=]\s*['"][A-Za-z0-9_\-]{12,}['"]/i.test(line)) push('error', 'js-hardcoded-secret', 'Posible credencial hardcoded.', file, n, line);
    });
}

// Ficheros que no deberían estar en el tema
for (const f of walk(PROJECT_ROOT, ['.env', '.sql', '.bak', '.orig', '.log', 'wp-config.php'])) {
    const norm = f.replace(/\\/g, '/') + '/';
    if (/\/(node_modules|\.git|\.claude|\.playwright-mcp|build)\//.test(norm)) continue;
    push('warn', 'sensitive-file', 'Fichero sensible dentro del tema (llegaría al servidor si no está en .gitignore / .distignore).', f, 1, '');
}

const report = { generatedAt: new Date().toISOString(), scanned: { php: phpFiles.length, js: jsFiles.length }, issues, summary: { errors: issues.filter((i) => i.severity === 'error').length, warnings: issues.filter((i) => i.severity === 'warn').length, info: issues.filter((i) => i.severity === 'info').length } };
const file = writeJson(OUT, 'php-scan.json', report);
console.log(`Escaneados ${phpFiles.length} PHP y ${jsFiles.length} JS.`);
printSummary('Seguridad (estático)', issues, file);
const order = { error: 0, warn: 1, info: 2 };
for (const i of [...issues].sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 40)) console.log(`  [${i.severity}] ${i.file}:${i.line}  ${i.id}  ${i.snippet ? '→ ' + i.snippet.slice(0, 90) : ''}`);
if (issues.length > 40) console.log(`  ... y ${issues.length - 40} más en el informe`);
