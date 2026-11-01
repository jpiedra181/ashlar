---
paths:
  - "src/scss/**"
  - "src/**/*.scss"
  - "theme.json"
---

# Reglas de estilos (SCSS y theme.json)

## Fuente única de verdad: `theme.json`

Colores, tamaños de fuente (fluidos con `clamp()`), espaciados y radios viven
en `theme.json`. WordPress genera `--wp--preset--*` y `--wp--custom--*`;
`src/scss/config/_aliases.scss` los renombra a `--color-*`, `--font-size-*`,
`--space-*`, `--radius-*`, `--gutter`, `--ease-*`… Si necesitas un valor que no
existe, **añádelo a `theme.json`**, no lo escribas a mano.

⚠️ WordPress pasa los slugs a kebab-case y separa letras de números
(`h1` → `--wp--preset--font-size--h-1`, `2xs` → `2-xs`). Usa siempre los alias.

```scss
// ✅
color: var(--fg);
padding-block: var(--section);
font-size: var(--font-size-h2);

// ❌
color: #1d1915;
padding: 80px;
font-size: 42px;
```

Excepciones aceptadas: px **estructurales** (width, border 1px), `clamp()` en
rem de una medida de componente que no se repite, `src/scss/config/` (define los
tokens) y `src/scss/vendor/`. El hook `check-scss-tokens` avisa tras cada
edición; si es una excepción justificada, sigue adelante.

## Temas de sección

Ashlar alterna secciones claras (stone-50), beige (stone-100) y oscuras
(stone-950). Dentro de un bloque se usan las variables SEMÁNTICAS, que cada
tono redefine (`src/scss/elements/_themes.scss`):

`--bg` · `--surface` · `--fill` · `--fill-contrast` (caja en el tono contrario:
beige sobre claro, claro sobre beige) · `--fg` · `--fg-soft` · `--fg-muted` · `--accent` ·
`--line` · `--line-strong` · `--btn-*` · `--btn2-*` · `--focus` · `--mark-accent` · `--error`

La sección lleva la clase (`theme-subtle`, `theme-dark`; el claro no lleva
clase) y todo lo de dentro (texto, filetes, botones) se adapta solo. Nunca
`var(--color-stone-950)` para un texto: `var(--fg)`.

## Tipografía

Recetas en `tools/_text.scss` (mixins) y `elements/_text-styles.scss` (clases):
`t-display`, `t-h1`…`t-h4`, `t-lead`, `t-small`, `t-nav`, `t-label` (IBM Plex
Mono en mayúsculas: rótulos, capítulos «02 — The Ashlar standard», datos).
La cursiva dentro de un titular (`<em>`) NO va en cursiva: es la parte del
texto en el tono apagado (`--fg-muted`).

## Mobile-first

`@include up(bp)` para ampliar, no `down()`. Breakpoints en
`src/scss/config/_config.scss`: xs 400 · sm 640 · md 768 · ml 900 · lg 1024 ·
xl 1200 · xxl 1440 · xxxl 1600 (el Figma dibuja a 390 y a 1440). La
tipografía fluida ya escala con `clamp()`: no añadas media queries de
`font-size` sobre presets.

## Layout

- Contenedor: `@include container` (= `.wrap`): `max-width: var(--max)`
  (90rem) con el gutter fluido `--gutter` dentro. Va en el wrapper interior
  del bloque; el fondo a sangre va en la sección.
- Separación vertical de sección: `padding-block: var(--section)`.
- Rejilla: 12 columnas con `column-gap: var(--gap)` (clase `.grid`).

## Accesibilidad en CSS

- `:focus-visible` con `outline` visible (2px + offset) en todo interactivo; el
  global de `elements/_chrome.scss` ya lo da, no lo anules.
- Las animaciones de entrada solo existen bajo `.motion` (la pone el JS si se
  permite movimiento). Sin JS o con movimiento reducido todo se ve.
- Contraste ≥ 4.5:1 en texto (3:1 en texto grande y bordes de controles). La
  paleta está calibrada para AA en su tema; no saques un color de su tema.
- No uses `display: none` para contenido que deba leer un lector de pantalla;
  usa `.visually-hidden`.

## Rendimiento en CSS

- Todo el SCSS de bloques se agrega en `build/css/main.css` (editor + front).
  Evita duplicar reglas entre bloque y componente: el componente manda.
- `!important` solo para ganar a CSS inyectado por terceros (WordPress core,
  wp-admin) o en el bloque de movimiento reducido; documenta el porqué en un
  comentario.
- El minificador estropea `calc()` anidados con división
  (`calc(100% / (4 * (var(--n) - 1)))`): precalcula el divisor en una custom
  property.
- `content-visibility: auto` en secciones largas bajo el pliegue es una mejora
  barata; `will-change` solo durante la animación.

## Proceso

Cambios en SCSS requieren `npm run build` (o `npm start` en marcha) y se ven en
el frontend sin re-guardar páginas. Verifica en los 7 breakpoints con
`node .claude/skills/responsive-check/scripts/check.mjs <url>`.
