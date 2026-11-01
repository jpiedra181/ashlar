---
paths:
  - "inc/**"
  - "functions.php"
  - "src/blocks/**/render.php"
  - "templates/**"
  - "parts/**"
---

# Reglas de PHP y plantillas (seguridad y convenciones WordPress)

## Seguridad (siempre)

- `defined('ABSPATH') || exit;` al principio de cada fichero PHP.
- **Escapa en la salida**: `esc_html()` texto · `esc_attr()` atributos ·
  `esc_url()` href/src · `wp_kses_post()` HTML de RichText · `esc_html_e()` /
  `esc_attr_e()` para cadenas traducidas. `$attributes` de bloque y opciones del
  tema NO son de confianza.
- **Sanea en la entrada**: `sanitize_text_field`, `sanitize_key`, `absint`,
  `esc_url_raw`, `wp_unslash` sobre `$_GET/$_POST`. Tope y default siempre
  (`min(12, max(1, (int) $x))`).
- Etiquetas HTML dinámicas → lista blanca `in_array($tag, ['p','h1',…], true)`.
- Handlers (`wp_ajax_*`, `admin_post_*`, REST): nonce
  (`check_ajax_referer` / `wp_verify_nonce`) + `current_user_can()`; REST con
  `permission_callback`. Settings API: `register_setting` con
  `sanitize_callback` y `manage_options`.
- SQL solo con `$wpdb->prepare()`; nunca variables dentro de la cadena.
- Redirecciones con `wp_safe_redirect()` + `exit`.
- Subidas con `wp_handle_upload`; SVG solo admins y saneado (`inc/svg.php`).
- Nada de `eval`, `unserialize` de input, `sslverify => false`,
  `file_get_contents` de URLs (usa `wp_remote_get`).
- Escáner rápido: `node .claude/skills/security-audit/scripts/php-security-scan.mjs`.

## Convenciones del tema

- Prefijo de funciones y constantes `ashlar_*` / `ASHLAR_*`, text domain
  `'ashlar'`, PHP ≥ 8.1 (tipos en firmas, `str_starts_with`, arrow functions).
- `functions.php` solo carga `inc/*.php`. Cada fichero de `inc/` tiene una
  responsabilidad: `helpers` (botón, medios, `<em>`, saludo), `settings`
  (Opciones, esquema declarativo), `projects` (tipo Project y su ficha),
  `messages` (formulario de presupuesto → Messages), `theme-setup` (supports,
  menús), `menus` (puente Apariencia → Menús ↔ bloques), `enqueue` (main.css,
  app.js y librerías compartidas), `front` (head, preload, limpieza),
  `blocks` (auto-registro), `gutenberg` (categoría + bloques por contexto),
  `svg`, `admin` (escritorio con la marca, rol Client), `login`, `demo`
  (importador de contenido).
- Cambios en PHP **no** requieren build; en JS/SCSS/`block.json`, sí.
- Los bloques `ashlar/*` se auto-registran desde `build/blocks/*/block.json`;
  la lista permitida en páginas se deriva del registro (menos
  `ASHLAR_NON_PAGE_BLOCKS`). No escribas allowlists a mano.
- Assets: `wp_enqueue_*` con el `.asset.php` generado (dependencias + versión).
  Las librerías compartidas (GSAP, ScrollTrigger, SplitText, Lenis) se
  registran **una vez** en `enqueue.php` y los bundles las declaran como
  dependencia (`webpack.config.js`); nunca embebidas por bloque.
- Para quitar ruido de WordPress en el front (emojis, `wp_generator`, xmlrpc,
  REST users público) el sitio está en `inc/`; hazlo con filtros, documentado.

## Plantillas FSE (`templates/`, `parts/`)

- Un `<!-- wp:ashlar/<bloque> /-->` estático suelto en una plantilla renderiza
  **vacío** (el HTML vive en el comentario). Para usar un bloque estático en una
  plantilla, pega su markup `save` completo o hazlo dinámico.
- Header y footer se componen de bloques server-rendered (`header-menu`,
  `nav-menu`, `site-contact`, `site-social`); los menús se editan en
  Apariencia → Menús. Si la BD tiene una copia "custom" de la part, el fichero
  no se usa: `php .claude/skills/wp-local/scripts/wp-diagnose.php` lo detecta.
- Cada plantilla: un `<main>` (con `padding-inline: var(--gutter)` si es de
  lectura), un `<h1>` (post-title / site-title), landmarks `header`/`footer`.
- SEO/a11y: `lang` y `title` los pone WordPress. Meta description, Open
  Graph y Twitter Card, `inc/seo.php` (desde el extracto), solo si no hay un
  plugin SEO activo: si se instala uno, el tema se retira y no duplica.
