# Calidad web: SEO, accesibilidad, rendimiento, seguridad y responsive

Se carga en todas las sesiones. Son los mínimos que cualquier cambio en este
tema debe respetar, y qué herramienta de `.claude/` usar para comprobarlo.

| Área | Mínimo exigible | Cómo se comprueba |
|---|---|---|
| **SEO** | 1 `<h1>`/página, jerarquía sin saltos, `alt` en imágenes de contenido, enlaces descriptivos, sin `href="#"` en producción, canonical lo pone WP; description/OG, `inc/seo.php` desde el extracto (se retira si hay plugin SEO) | `/seo-audit <url>` · agente `seo-auditor` |
| **Accesibilidad** | WCAG 2.2 AA: foco visible, teclado completo (menú overlay, carruseles), nombres accesibles, contraste 4.5:1, `prefers-reduced-motion`, objetivos ≥ 24 px, reflow a 320 px | `/a11y-audit <url>` · agente `a11y-auditor` |
| **Rendimiento** | LCP < 2,5 s · CLS < 0,1 · sin librerías duplicadas en `build/` · imágenes con dimensiones y lazy (salvo LCP) · fuentes WOFF2 + `swap` · build de producción | `/perf-audit <url>` · agente `perf-auditor` |
| **Seguridad** | Escapar salida, sanear entrada, nonce + capability, `prepare`, ABSPATH, sin secretos; en sitio: cabeceras, sin generator/xmlrpc/REST users público | `/security-audit [url]` · agente `wp-security-reviewer` |
| **Responsive** | Mobile-first con `up()`, sin overflow en 320–1920, gutter único, `max-width` + `margin auto`, tipografía fluida sin media queries | `/responsive-check <url>` · `/bloque-responsive` · agente `responsive-auditor` |
| **Bloques** | Regla del `deprecated.js`, paridad edit/save, tokens, controles por elemento, `alt` editable | `/deprecated-save` · `/nuevo-bloque` · agente `block-reviewer` |

Todo junto: `/site-audit <url>` genera `.claude/reports/site-audit-<fecha>/summary.md`.
Antes de entregar: `/pre-release`.

## Cómo se aplica en el día a día

- Al **crear un bloque**: scaffold con `/nuevo-bloque`; ya trae `alt` editable,
  `SectionTheme`, `RichText` en el lienzo, tokens y textos en inglés.
- Al **cambiar un `save.js`**: primero `/deprecated-save <slug>`.
- Al **cambiar SCSS**: el hook avisa de valores hardcoded; verifica breakpoints.
- Al **cambiar PHP**: escáner de seguridad + revisar escapado línea a línea.
- Al **cerrar una funcionalidad**: agente correspondiente sobre la URL local, y
  el `block-reviewer` sobre el diff.
- Los informes de auditoría **detectan**; corregir es un paso aparte que
  decide la persona. No "arregles" hallazgos de diseño (contraste de la
  primaria) en CSS: se devuelven a Figma.

## Entornos

- Local: `http://ashlar.local` (Laravel Herd en Windows; debe estar arrancado).
  El formulario de presupuesto (fase 4) se prueba aquí: los envíos se guardan
  en el escritorio (Messages) y el correo depende de la configuración de Herd.
- No hay producción: es un proyecto de portfolio. Las cabeceras de seguridad y
  caché dependen del servidor; en local solo se comprueban las del tema.
