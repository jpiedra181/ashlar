---
name: a11y-audit
description: >
  Auditoría de accesibilidad WCAG 2.2 AA de una URL con axe-core + checks
  propios (Playwright): violaciones axe con impacto, recorrido con Tab para
  detectar foco invisible, landmarks, h1 y jerarquía, skip link, lang, reflow a
  320px, prefers-reduced-motion, vídeos autoplay, iframes sin título, controles
  sin nombre accesible. Desktop (1440) y móvil (375). Úsala cuando se pida
  revisar accesibilidad, WCAG, teclado, lector de pantalla, contraste, foco,
  "aria", o antes de publicar. Solo detecta; corregir es un paso aparte.
argument-hint: "<url> [--no-mobile]"
allowed-tools: Bash(node .claude/skills/a11y-audit/scripts/*), Read, Grep, Glob, mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_press_key, mcp__playwright__browser_evaluate
---

# Auditoría de accesibilidad

## Ejecutar

```bash
node .claude/skills/a11y-audit/scripts/a11y-check.mjs <url> [--no-mobile] [--tags=wcag2a,wcag2aa,wcag21aa,wcag22aa] [--out=dir] [--wait=3000]
```

Informe en `.claude/reports/a11y/report.json`. Requiere `axe-core` en
`node_modules` (llega con `@wordpress/scripts`; si no, `npm i -D axe-core`).

## Lo que el script NO ve (hazlo con el MCP de Playwright)

1. **Menú overlay** (`<dialog>` de `header-menu`): abre el menú,
   `browser_press_key Tab` varias veces → el foco no debe salir del overlay;
   `Escape` cierra y devuelve el foco al botón.
2. **Carrusel de proyectos** (`projects-carousel`) y **antes/después**
   (`before-after`): la pista se mueve con flechas del teclado, las flechas
   `<button>` tienen nombre y se deshabilitan en los extremos; el slider es un
   `<input type="range">` que responde a ← →.
3. **Orden de lectura** con `browser_snapshot` (árbol de accesibilidad): ¿tiene
   sentido sin CSS?
4. **Zoom 200 %** (`browser_resize` a 720 px de ancho equivale a 1440 al 200 %).

## Interpretar y localizar en el código

| Hallazgo | Origen habitual |
|---|---|
| `focus-not-visible` | un bloque anula la regla global de `src/scss/elements/_chrome.scss` (`outline: none` sin alternativa) |
| `axe:color-contrast` | primero descarta una animación de entrada a medias (repite con más espera); si sigue, un color fuera de su tono. Paleta de Ashlar: las parejas de cada tono pasan AA. Decisión de diseño → Figma |
| `axe:image-alt` / `img-empty-alt` | foto de contenido con el `alt` de `MediaField` vacío en la página (contenido), o `decorative` mal marcado |
| `control-no-name` / `axe:link-name` / `axe:button-name` | iconos en `site-social`, flechas de `projects-carousel` (`aria-label` en `save.js`), tarjetas `<a>` sin texto |
| `axe:target-size` | chips (`projects-grid`, «Jump to»), enlaces del pie, iconos: `min-height/min-width: 24px` o padding |
| `reduced-motion-missing` | keyframes en SCSS sin `@media (prefers-reduced-motion)`; las animaciones `data-*` ya dependen de `.motion` |
| `video-*` | (Ashlar no tiene vídeo) `<video autoplay>`: `muted playsinline`, botón de pausa si > 5 s |
| `landmark-*` / `h1-*` | `templates/*.html`, `parts/*.html`; `h1` fijo en `home-hero`, `page-intro`, `project-header`, `not-found` (¿dos en la misma página?) |
| `nav-unlabelled` | `header-menu` y `nav-menu` (`render.php`) sin `aria-label` distinto |
| `axe:region` | contenido fuera de landmarks (bloques antes de `<main>`) |
| `marquee-present` | (Ashlar no tiene marquees; `site-ticker` es una franja fija con la barra de progreso `aria-hidden`) pausa en hover/foco, `aria-hidden` en la copia |

`axeIncomplete` son comprobaciones que axe no pudo decidir (p. ej. contraste
sobre imagen): revísalas a mano.

## Reportar

Tabla: criterio WCAG · hallazgo · dónde en el código · corrección · esfuerzo.
Primero lo bloqueante (no usable con teclado/lector), luego contraste y nombres,
luego mejoras. Cita el criterio (2.4.7, 1.1.1, 2.5.8…). Para una revisión
completa con navegación manual delega en el agente `a11y-auditor`.
