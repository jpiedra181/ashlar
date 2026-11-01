---
name: security-audit
description: >
  Revisión de seguridad del tema WordPress en dos capas: (1) escáner estático
  del código PHP/JS (salida sin escapar, input sin sanear, handlers sin nonce o
  capability, SQL sin prepare, funciones peligrosas, ABSPATH, register_setting
  sin sanitize, secretos, innerHTML/eval en JS, ficheros sensibles) y (2)
  comprobación pasiva del sitio en ejecución (cabeceras CSP/HSTS/nosniff/
  frame-options/referrer/permissions, generator y versiones expuestas,
  enumeración de usuarios por REST y ?author=, xmlrpc, readme/license,
  listados de directorios, backups y .env accesibles, cookies sin flags, mixed
  content, WP_DEBUG en producción). Úsala antes de un release, al añadir
  opciones/handlers/render.php, o cuando se hable de seguridad, XSS, nonce,
  escapado, hardening o "nos han hackeado". Solo lectura; no explota nada.
argument-hint: "[url]"
allowed-tools: Bash(node .claude/skills/security-audit/scripts/*), Bash(php -l:*), Read, Grep, Glob, Bash(git diff:*)
---

# Auditoría de seguridad

Solo sobre sitios propios o con autorización. Ambos scripts son de lectura.

## Ejecutar

```bash
# 1. Código (siempre)
node .claude/skills/security-audit/scripts/php-security-scan.mjs [--paths=inc,src,functions.php]

# 2. Sitio en ejecución (mejor contra producción: las cabeceras las pone el servidor)
node .claude/skills/security-audit/scripts/site-headers.mjs <url>
```

Informes en `.claude/reports/security/php-scan.json` y `site-report.json`.

## Interpretar el escáner de código

Es **heurístico**: confirma cada hallazgo leyendo el fichero. Falsos positivos
típicos que ya se descartan o debes descartar tú:

- `output-unescaped` en `echo $wrapper_attributes` con `phpcs:ignore` → correcto
  (`get_block_wrapper_attributes` ya escapa).
- Etiqueta dinámica `<<?php echo $tag ?>` con `in_array` whitelist arriba → correcto.
- `echo $id` / `echo $option` en `inc/settings.php` (campos del formulario de
  opciones) → **sí** deben ir con `esc_attr()`: hallazgo real aunque el valor
  venga de código.

Correcciones por tipo (función de WordPress que toca):

| id | Corrección |
|---|---|
| `output-unescaped` | `esc_html()` texto · `esc_attr()` atributos · `esc_url()` URLs · `wp_kses_post()` HTML |
| `input-unsanitized` | `sanitize_text_field(wp_unslash($_GET['x']))`, `absint`, `sanitize_key` + default y tope |
| `handler-no-nonce` / `handler-no-capability` | `check_ajax_referer('accion', 'nonce')` + `current_user_can('manage_options')` |
| `rest-no-permission` | `'permission_callback' => fn() => current_user_can(...)` |
| `sql-*` | `$wpdb->prepare("... %d %s", $a, $b)` |
| `register-setting-no-sanitize` | `'sanitize_callback' => 'ashlar_sanitize_options'` con sanitizado por campo |
| `abspath-missing` | `defined('ABSPATH') \|\| exit;` |
| `include-variable` / `file-get-contents-remote` | rutas fijas con `get_template_directory()`; `wp_remote_get()` |
| `sslverify-false` | quitar; arreglar el certificado |
| `js-innerhtml-concat` / `js-dangerously-set-inner-html` | `textContent`, o sanear con `wp_kses_post` en servidor |
| `sensitive-file` | borrar del tema o añadir a `.gitignore` y `.distignore` |

## Interpretar la comprobación del sitio

| id | Dónde se arregla |
|---|---|
| `csp-missing`, `hsts-missing`, `nosniff-missing`, `frame-options-missing`, `referrer-policy-missing`, `permissions-policy-missing` | servidor (nginx/Apache/hosting) o plugin; el tema puede añadir `send_headers` como último recurso |
| `generator-meta` | `remove_action('wp_head', 'wp_generator')` en `inc/theme-setup.php` |
| `user-enumeration-rest` | filtro `rest_endpoints` para quitar `/wp/v2/users` a no autenticados |
| `user-enumeration-author` | redirigir `?author=N` en `template_redirect` si no es admin |
| `xmlrpc-enabled` | `add_filter('xmlrpc_enabled', '__return_false')` (si no se usa Jetpack/app) |
| `readme-exposed`, `license-exposed`, `directory-listing*`, `sensitive-file-exposed` | servidor: bloquear rutas, `Options -Indexes` |
| `cookie-no-*` | `FORCE_SSL_ADMIN`, HTTPS completo |
| `debug-output` | `WP_DEBUG false` y `WP_DEBUG_DISPLAY false` en producción |
| `plugins-visible` | mantenerlos actualizados; `wp-diagnose.php` lista actualizaciones pendientes |

## Reportar

1. Veredicto: ¿hay algo explotable? sí/no y dónde.
2. Tabla: severidad (alta/media/baja) · vector · fichero:línea o endpoint ·
   corrección concreta.
3. Falsos positivos descartados y por qué.
4. Hardening recomendado para producción.

Para una revisión completa con lectura línea a línea del diff, delega en el
agente `wp-security-reviewer`.
