---
paths:
  - "src/blocks/**"
  - "src/components/**"
---

# Reglas al tocar bloques y componentes

Se cargan solo cuando lees o editas `src/blocks/**` o `src/components/**`.

## 1. La regla del `deprecated.js` (la más importante del proyecto)

Antes de cambiar el markup de un `save.js` de un bloque **ya commiteado**:

```bash
node .claude/skills/deprecated-save/scripts/freeze-save.mjs <slug> --write
```

Congela el `save` de HEAD y los `attributes/supports` de ese momento como
entrada de `deprecated.js`, y lo conectas en `index.js`. Sin esto, cada página
que use el bloque muestra "Este bloque contiene contenido inesperado". El hook
`guard-save-js` te lo recuerda; es un `ask`, no un bloqueo, porque un bloque no
publicado no lo necesita (compruébalo con `wp-diagnose.php --block=ashlar/<slug>`).

Cambiar el HTML que emite un componente de `src/components/` invalida todos los
`deprecated.js` que lo importan: en ese caso, congela su markup a mano.

## 2. Paridad `edit.js` / `save.js`

Mismo árbol y mismas clases en `useBlockProps` / `useBlockProps.save`, para
que el lienzo se vea como la web. `save.js` añade además los atributos de
animación (`data-reveal`, `data-split`…), que el editor no necesita. Los
componentes de `src/components/` son presentacionales para poder usarse en
ambos lados. Si un bloque necesita variables CSS por instancia, edit y save las
sacan de la misma función (`style-vars.js`; hoy solo `site-ticker`).

## 3. Controles y atributos (experiencia de cliente)

- **Color = tono de sección**: `SectionTheme` (atributo `theme`:
  `light` · `subtle` · `dark`) añade `theme-subtle` / `theme-dark` y el SCSS
  usa las variables semánticas. Nada de selectores de color ni de tamaño por
  texto: la tipografía la fija el diseño (mixins `t-*`).
- **Textos con `RichText` en el lienzo**, con etiqueta fija según la
  jerarquía: `h1` solo en las cabeceras de página (`home-hero`, `page-intro`,
  `project-header`, `not-found`); `h2` en el título de cada sección; `h3` en
  tarjetas y elementos de lista. El `<em>` de un titular (`core/italic`) es el
  tramo en tono apagado, no cursiva.
- Un texto opcional vacío no se pinta (`{text && …}` en `save.js`).
- **Fotos**: atributo objeto `{ id, url, alt, width, height, focal }`;
  `Media` + `MediaPlaceholder` en el lienzo y `MediaField` en el panel
  (`focal`, y `decorative` si es ornamental).
- **Enlaces** con `LinkField`; **botones** con `components/button` y sus
  variantes (`BUTTON_VARIANT_OPTIONS`); **listas** con `components/repeater`
  (`ItemActions`, `AddItem`, `moveItem`, `removeItem`, `updateItem`);
  **capítulos** «01 — Label» con `components/chapter`.
- Textos por defecto en `block.json` = los del Figma, en inglés británico.

## 4. Accesibilidad y SEO en el markup (no negociable en bloques nuevos)

- Imagen de contenido → `alt` **editable** desde el editor (campo de
  `MediaField`, dentro del objeto de la imagen), guardado en `save.js`.
  Decorativa → `alt=""` y wrapper con `aria-hidden="true"`.
- Botones/enlaces solo icono → `aria-label` traducible.
- Todo interactivo con `:focus-visible` visible en su SCSS.
- Animaciones (GSAP, keyframes) respetan `prefers-reduced-motion`.
- Listas de tarjetas/tags como `<ul><li>`; secciones con encabezado; `<nav>`
  con `aria-label` si hay más de uno.
- Enlaces con texto descriptivo; `target="_blank"` con `rel="noopener"`.
- Imágenes con `width`/`height` cuando se conozcan (CLS) y `loading="lazy"`
  salvo la del hero (`fetchpriority="high"`).

## 5. Bloques dinámicos (`render.php`)

`defined('ABSPATH') || exit;` · whitelist de etiquetas con `in_array` ·
`esc_html` / `esc_attr` / `esc_url` / `wp_kses_post` en TODA salida ·
`get_block_wrapper_attributes()` · `wp_reset_postdata()` · tope de
`posts_per_page`. Helpers de `inc/`: `ashlar_button()`, `ashlar_media()`,
`ashlar_accent()` (los `*asteriscos*` → `<em>`) y, en la ficha de proyecto,
`ashlar_block_project($block)`.

En el editor, `save: () => null` y `ServerSideRender` dentro de `Disabled`.
Con muchos atributos, `httpMethod="POST"` (por GET da 414). Los dinámicos de
la ficha pasan `urlQueryArgs: { post_id }`.

**Híbridos** (`projects-carousel`, `project-hero`, `quote`): `save.js` guarda
los textos y un hueco vacío con `data-*`; `render.php` lo rellena sobre
`$content` (`preg_replace` del hueco, o `WP_HTML_Tag_Processor` para
atributos, como en `quote`).

## 6. Registro y build

- `block.json`: `name: ashlar/<kebab>`, `apiVersion: 3`,
  `textdomain: ashlar`, `category: ashlar`.
- `@forward "../../blocks/<slug>/style";` en `src/scss/blocks/index.scss`.
- No hay allowlist manual: `inc/gutenberg.php` la deriva del registro y
  `inc/blocks.php` auto-registra `build/blocks/*/block.json`. Basta `npm run build`.
  Los bloques que no van en páginas (cabecera, pie, 404, ficha de proyecto) se
  listan en `ASHLAR_NON_PAGE_BLOCKS`.
- Bloques nuevos: `node .claude/skills/nuevo-bloque/scripts/scaffold-block.mjs <slug> "Title"`.
- Antes de escribir un elemento nuevo, mira si ya existe en `src/components/`
  (button, media, media-field, link-field, chapter, repeater, section-theme,
  intro-title, block-icons, icons, editor-assets; y solo estilos: chip,
  project-card). Si lo repites en un tercer bloque, extráelo.

## 7. i18n

Todas las cadenas de UI con `__('…', 'ashlar')`. Nunca variables dentro de `__()`.
