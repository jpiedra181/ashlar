---
name: figma-gutenberg-block
description: Normaliza a las convenciones del tema Ashlar un bloque Gutenberg YA EXISTENTE que aporta el usuario (normalmente exportado por una herramienta externa desde Figma). NO crea el bloque desde cero. Su trabajo es dejarlo como los demás bloques de Ashlar - hardcodes de SCSS → tokens de theme.json y variables semánticas del tono, color por tono de sección (SectionTheme), textos con RichText en el lienzo, fotos con Media + MediaField, enlaces con LinkField, listas con el repeater, textos en inglés y registro correcto. Úsala cuando el usuario diga "aplica los estilos/convenciones a este bloque", "quita los hardcoded", "déjalo como los demás", o tras pegar/generar un bloque nuevo en src/blocks/.
---

# Aplicar las convenciones de Ashlar a un bloque dado

El usuario **aporta el bloque** (ya existe en `src/blocks/<slug>/`). Esta skill
**no lo crea** (para eso, `/nuevo-bloque`): lo **normaliza**. No cambies el
diseño visual; cambia cómo se aplican los estilos y qué puede editar el
cliente. La referencia de cómo debe quedar es cualquier bloque reciente, por
ejemplo `src/blocks/callout/` (sencillo) o `src/blocks/numbered-grid/` (con
lista y variantes).

## Antes de empezar

1. **Lee el bloque dado**: `block.json`, `edit.js`, `save.js` (o
   `render.php`), `style.scss`.
2. **Lee** `.claude/rules/bloques.md` y `.claude/rules/scss.md`: ahí están las
   reglas completas.
3. **Si hay Figma**, compara con el frame (`get_design_context`) para saber
   qué token corresponde a cada valor.
4. **Inventaría**: cada texto (¿es título de sección, de tarjeta, rótulo,
   párrafo?), cada foto, cada enlace o botón y cada lista repetible.

## Qué aplicar (no negociable)

- **SCSS sin valores de marca a mano**: `#hex` → variable semántica del tono
  (`var(--fg)`, `var(--fg-soft)`, `var(--accent)`, `var(--line)`…), nunca un
  color de paleta directo; tipografía → mixins `t-h1…t-h4`, `t-lead`,
  `t-small`, `t-label`; espaciado → `var(--space-*)` / `var(--section)`;
  radios → `var(--radius-*)`. Px estructurales (border 1px, width) se quedan.
  Mobile-first con `@include up(bp)`; contenedor `.wrap`. Si un color no está
  en la paleta, **pregunta** (se devuelve a Figma), no inventes.
- **Color = tono de sección**: atributo `theme` (`light` · `subtle` · `dark`)
  con `SectionTheme` en el panel y `themeClass(theme)` en el wrapper. Nada de
  `PanelColorSettings` ni `FontSizePicker` por texto.
- **Textos con `RichText` en el lienzo**, etiqueta fija según la jerarquía
  (`h2` título de sección, `h3` tarjeta; `h1` solo en cabeceras de página).
  `<em>` en titulares = tramo apagado (`allowedFormats={['core/italic']}`).
  Opcionales vacíos no se pintan en `save.js`.
- **Fotos**: atributo objeto `{ id, url, alt, width, height, focal }`, `Media`
  + `MediaPlaceholder` en el lienzo, `MediaField` en el panel (alt editable,
  punto focal; `decorative` si es ornamental).
- **Enlaces** con `LinkField`; botones con `components/button`
  (`BUTTON_VARIANT_OPTIONS`); listas con `components/repeater`.
- **`edit.js` y `save.js` con el mismo árbol y clases**; las animaciones van
  como atributos `data-reveal`, `data-split`… solo en `save.js`.
- **Textos de la web y del editor en inglés** (`__('…', 'ashlar')`),
  comentarios del código en español. Textos por defecto de `block.json` = los
  del Figma.
- **Registro**: `name: ashlar/<kebab>`, `category` y `textdomain` `ashlar`,
  `apiVersion: 3`, icono de `components/block-icons` y `example` con foto de
  `src/assets/images/photos/` (`exampleImage()`). No hay allowlist: basta el
  `@forward` en `src/scss/blocks/index.scss` y compilar.

## Pasos

1. `style.scss`: hardcodes → tokens, mixins y variables semánticas; revisa
   breakpoints y `align-content: start` en rejillas de rejillas.
2. `block.json`: atributos reales (`theme`, textos, imagen como objeto),
   `supports: { html: false, align: ['full'], anchor: true }`.
3. `edit.js`: `SectionTheme`, `RichText`, `Media`/`MediaField`, `LinkField`,
   repeater.
4. `save.js`: el mismo markup con `RichText.Content` y los `data-*`.
5. `index.js`: icono y vista previa.
6. `npm run build`.

## Verificación (Definition of Done)

- [ ] `grep -nE '#[0-9a-fA-F]{3,6}' src/blocks/<slug>/style.scss` → nada; el
      hook `check-scss-tokens` no avisa de nada injustificado.
- [ ] El bloque se ve bien en los tres tonos (claro, subtle, dark).
- [ ] Insertar → guardar → recargar: sin «contenido inesperado».
- [ ] Todos los textos se editan en el lienzo; alt y punto focal en el panel.
- [ ] `node .claude/skills/responsive-check/scripts/check.mjs <url>` y
      `node .claude/skills/a11y-audit/scripts/a11y-check.mjs <url>` limpios.
- [ ] Revisión del agente `block-reviewer`.

## Notas

- Respeta los valores del diseño como **valores por defecto**.
- Cambios en `inc/*.php` no requieren build; JS/SCSS/`block.json` sí.
- Si el bloque ya estaba insertado en contenido real y cambias el markup de
  `save.js`, primero `/deprecated-save <slug>`.
