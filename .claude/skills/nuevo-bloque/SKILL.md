---
name: nuevo-bloque
description: >
  Crea un bloque Gutenberg NUEVO desde cero siguiendo las convenciones del tema.
  Genera src/blocks/<slug>/ con block.json (namespace del proyecto, apiVersion 3),
  index.js con icono de marca y vista previa con foto real, edit.js con los
  componentes compartidos (SectionTheme, Chapter, Media, MediaField), save.js con
  el mismo markup (o render.php si es dinámico), style.scss con tokens, y
  añade el @forward en src/scss/blocks/index.scss. Úsala cuando el usuario
  diga "crea un bloque", "nuevo bloque", "añade una sección X", "necesito un
  bloque para…", o al maquetar una sección del Figma de Ashlar.
argument-hint: "<slug> \"Title\" [--dynamic]"
allowed-tools: Bash(node .claude/skills/nuevo-bloque/scripts/*), Bash(npm run build), Read, Edit, Write, Glob, Grep
---

# Bloque nuevo

## 0. Antes de generar nada

1. **¿Ya existe algo parecido?** Mira `src/blocks/` y `src/components/`
   (button, media, media-field, link-field, chapter, repeater, section-theme,
   intro-title, block-icons, icons; estilos de chip y project-card).
   Reutiliza antes que crear.
2. **¿Estático o dinámico?** Contenido que edita el cliente en la página →
   estático (`save.js`). Contenido que sale de la BD (posts, opciones, menús)
   → dinámico (`--dynamic`, `render.php`, `save: () => null`).
3. **Fuente del diseño:** el Figma de Ashlar (`XRdk3LtiAg84GOAvCgmKCh`),
   frames Desktop y Mobile de la página: `get_design_context` y
   `get_screenshot`. Textos por defecto = los del Figma.

## 1. Generar

```bash
node .claude/skills/nuevo-bloque/scripts/scaffold-block.mjs <slug-kebab> "Title" [--dynamic] [--dry]
```

`--dry` muestra los ficheros sin escribir.

## 2. Completar

- `block.json`: atributos reales; textos por defecto = los del diseño; imágenes
  como objeto `{ id, url, alt, width, height, focal }`; `multiple: false` si la
  sección solo tiene sentido una vez por página.
- `edit.js` / `save.js`: markup **idéntico** (comparten componentes; las
  animaciones `data-*` solo en `save.js`). Textos con `RichText` en línea; fotos con `Media` +
  `MediaPlaceholder` en el lienzo y `MediaField` en el panel (alt y punto
  focal; `decorative` si es ornamental); enlaces con `LinkField`; listas con
  `ItemActions` / `AddItem` / `moveItem…` de `components/repeater`.
- Color: **tono de sección** (`SectionTheme` + variables semánticas `--fg`,
  `--accent`, `--line`…), no selectores de color por elemento.
- Animación: atributos `data-reveal`, `data-split`, `data-media-reveal`,
  `data-parallax`… en `save.js`. JS propio en `view.js` con `onPage()` de
  `@ashlar/app` e `import gsap from 'gsap'` (sin llaves).
- `style.scss`: tokens; mobile-first con `up()`; contenedor `.wrap`.
- Icono: dibújalo en `src/components/block-icons` (trazo 1.25, 24×24).
- Si sirve como punto de partida de una página, añádelo en
  `src/admin/editor/starters.js`.
- Textos de UI con `__('…', 'ashlar')`.

## 3. Verificar

```bash
npm run build
```

- Aparece en el insertador, con su icono y su vista previa.
- Inserta, edita, guarda, recarga: sin "contenido inesperado".
- Front: `node .claude/skills/responsive-check/scripts/check.mjs <url>` y
  `node .claude/skills/a11y-audit/scripts/a11y-check.mjs <url>`.

Un bloque nuevo **no** necesita `deprecated.js` hasta su primer cambio de
markup tras publicarse (`/deprecated-save`).
