---
name: bloque-responsive
description: >
  Convierte un bloque ya maquetado (Gutenberg con block.json / edit.js / save.js
  / style.scss, u otro componente) en un bloque totalmente responsive, partiendo
  de sus frames de Figma (en Ashlar: Desktop 1440 y Mobile 390) leídos con el
  MCP de Figma. Hace tres cosas: (1) reconcilia el código existente con el
  diseño ya corregido en Figma, (2) añade el CSS responsive mobile-first con
  `@include up()`, y (3) cuando el diseño de Figma cambió de
  ESTRUCTURA (no solo de valores), propaga ese cambio al markup (edit.js + save.js)
  para que los estilos apliquen. Úsalo SIEMPRE que haya que hacer responsive un
  bloque a partir de diseños de Figma, ajustar un bloque desktop a sus variantes de
  breakpoint, traducir modos de variables de Figma a media queries, o sincronizar un
  bloque con un diseño de Figma corregido — aunque no se diga "skill" ni "responsive"
  explícitamente. Si hay node URLs de Figma de un mismo bloque a varios anchos, esta
  skill aplica.
---

# Bloque responsive desde Figma

Traduce los frames de Figma de un mismo bloque (a varios anchos) a un único
bloque responsive en código. El valor está en no reexplicar las reglas cada vez y
en no caer en los errores típicos de traducir Figma a CSS de forma literal.

## Parámetros del proyecto (Ashlar)

Ya resueltos para este tema; confírmalos solo si algo no cuadra:

- **Ruta del bloque:** `src/blocks/<slug>/` con `block.json`, `index.js`,
  `edit.js`, `save.js` (o `render.php`) y `style.scss`.
- **Frames de Figma** (archivo `XRdk3LtiAg84GOAvCgmKCh`): la sección en la
  página **Desktop** (1440) y en la página **Mobile** (390). No hay frames de
  laptop ni tablet: los anchos intermedios se deciden con el breakpoint (ver
  más abajo) y se comprueban renderizando.
- **Ancho de contenido y gutter:** el interior del bloque lleva la clase
  `.wrap` (`@include container`): `max-width: var(--max)` (90rem) con el
  gutter fluido `--gutter` dentro. El fondo a sangre va en la `<section>`. El
  bloque no añade padding lateral propio.
- **Breakpoints:** `src/scss/config/_config.scss` (xs 400 · sm 640 · md 768 ·
  ml 900 · lg 1024 · xl 1200 · xxl 1440 · xxxl 1600) con el mixin `up()`.
  Mobile-first: nunca `down()` ni `max-width` (el hook lo avisa).
- **Tipografía fluida:** los presets de `theme.json` escalan con `clamp()` de
  390 a 1440 y se usan con los mixins `t-*`: no se les añaden media queries
  (ver Principio 3).

## Principios universales (no romper)

Estas reglas son el motivo por el que el resultado sale bien. Si las saltas,
reproduces los errores clásicos de "Figma a CSS literal".

1. **Patrón de ancho.** El bloque es el *interior*: `max-width: <token>` +
   `margin-inline: auto`. El gutter lateral lo pone el contenedor de layout; el
   bloque NO gestiona padding lateral propio.
   - **Nunca** codifiques el hueco de centrado como padding fijo. Un frame de 1920
     con contenido de 1530 muestra 195px a cada lado: eso es centrado automático, no
     padding. Escrito como `padding-inline: 195px` rompe en cualquier ancho que no
     sea 1920 (encoge en portátiles de 1440/1536, se aplasta en tablet/mobile). El
     `max-width` capa; el centrado reparte el resto solo.

2. **Responsive = CSS por defecto, markup solo si la estructura cambió.** Si la
   estructura de Figma sigue siendo la misma, todo el responsive es CSS (un solo
   DOM). Solo tocas markup cuando el diseño cambió de estructura y el CSS no puede
   aplicar a una jerarquía que no existe (ver "Alcance por archivo").

3. **Tokens, no px sueltos; y distingue fluido de escalonado.**
   - **Fluido** (presets fluidos de theme.json, `clamped()`): tipografía y
     dimensiones que interpolan con `clamp()`. El responsive YA está resuelto por el
     clamp — NO añadas media queries de font-size/dimension para esos; duplicarlo
     crea conflictos.
   - **Escalonado** (media queries por breakpoint): se reserva para cambios de
     **layout** (dirección flex, nº de columnas, gaps que saltan, mostrar/ocultar,
     alineación). Usa siempre el valor del modo/token correspondiente, no el px que
     lees del frame.

4. **Ajuste quirúrgico, no reescritura.** Preserva clases y arquitectura del bloque.
   Cambias valores, reglas responsive y, si hace falta, estructura — pero no
   reescribes lo que ya funciona.

## Alcance por archivo

Qué se toca, cuándo y con qué cuidado:

- **style.scss** — el core. Casi todo el responsive de layout vive aquí. Por
  defecto, la skill solo toca esto.
- **edit.js + save.js** — el markup/estructura. Tócalos SOLO si la estructura de
  Figma cambió respecto al código. Y cámbialos **a la vez y de forma idéntica**: en
  Gutenberg el markup de `edit` y `save` debe coincidir o salta "block validation
  failed".
- **save.js (bloques estáticos), aviso crítico** — el markup se guarda en el
  contenido del post. Cambiarlo rompe el contenido YA publicado salvo que añadas un
  `deprecated` con el markup anterior. Antes de cambiarlo, comprueba si el bloque
  está en uso; si lo está, añade la deprecation.
- **style-vars.js (helper compartido), si el bloque lo tiene** (en Ashlar,
  solo `site-ticker`) — las CSS vars por instancia se construyen en una única
  función que importan edit y save. Si hay que añadir o cambiar una, hazlo
  SOLO ahí. No inyectes estilos inline por separado en edit/save.
- **block.json** — solo si hace falta un atributo o `support` nuevo. Para puro
  responsive, casi nunca.
- **index.js** — registro. No se toca para responsive ni reflow.

**Antes de tocar markup o JS, justifica por qué el CSS no basta.** Esa es la
disciplina que evita que la skill sobre-reescriba bloques que solo necesitaban tres
media queries.

## Mapeo modos → breakpoints

Mobile-first (regla del tema). El frame Mobile es la base (sin media query);
cada salto hacia arriba es un `@include up(bp)`, **ordenados de menor a mayor**
para que la cascada funcione (el más ancho va después y pisa al anterior).

Mapeo habitual en Ashlar (ajústalo al contenido de cada bloque):

```
mobile (390)    → base (sin media query)
paso intermedio → @include up(sm) / up(md)   // ≥ 640 / ≥ 768: 2 columnas, botones en fila
desktop         → @include up(ml) / up(lg)   // ≥ 900 / ≥ 1024: rejilla de 12, columnas lado a lado
ancho completo  → @include up(xxl)           // ≥ 1440: solo si el diseño cambia ahí
```

El **ancho de diseño no es el breakpoint**: 1440 es el tamaño al que se dibujó
el desktop; el breakpoint es el ancho mínimo al que el layout de escritorio
cabe sin apretarse. Con solo dos frames, decide ese punto mirando el contenido
(longitud de titulares, nº de columnas) y verifícalo a 768, 1024 y 1280.

## Mapeo Figma → CSS (resizing)

Traducir bien las propiedades de resize de Auto Layout evita el 90% de los bugs de
altura/ancho:

| Figma (Auto Layout) | CSS (flex) |
|---|---|
| Fill en el eje cruzado (p. ej. vertical dentro de una fila) | `align-self: stretch` (o `align-items: stretch` en el padre) |
| Hug | tamaño de contenido (sin estirar) |
| Fill en el eje principal | `flex: 1 1 0` (`min-width: 0` si hay overflow) |
| Fixed | ancho/alto fijo |
| Fill con Max width = N | `width: 100%; max-width: N; margin-inline: auto` |

Síntoma típico: en una fila, una columna queda más baja que la otra. Causa: esa
columna está en **Hug** (o el padre en `flex-start`). Fix: ponla en **Fill**
(`align-self: stretch`) y cambia también el resize a Fill en Figma — si lo dejas en
Hug, la próxima regeneración reintroduce el bug.

## Flujo en dos fases

### Fase 1 — Reconciliar con Figma

El código suele ir por detrás del Figma corregido.

1. Lee los nodos Desktop y Mobile con el MCP (design context + variable defs +
   screenshot).
2. Compáralos con el código actual del bloque.
3. Aplica los cambios preservando clases. Cambios típicos de **valor/estilo**:
   interior con `.wrap`; quitar padding lateral fijo (tipo "195"); tokens en
   vez de px.
4. Si la **estructura** de Figma cambió (nuevo wrapper, anidamiento o reorden que el
   CSS no cubre), propágala a `edit.js` + `save.js` a la vez (y deprecation si el
   bloque está publicado). Justifica el cambio.

### Fase 2 — Responsive

5. Escribe la base con el frame Mobile.
6. Para tipografía/dimensiones fluidas: usa el preset/clamp, sin media queries.
   Para layout: genera las reglas `up()` diffeando Desktop contra Mobile.
7. Elige los breakpoints (mapeo de arriba), de menor a mayor.
8. Verifica a 320, 390, 768, 1024, 1440 y 1920 con
   `node .claude/skills/responsive-check/scripts/check.mjs <url>` y compara
   con Figma en Desktop y Mobile.

## Errores a vigilar (aprendidos en producción)

- **Hueco de centrado como padding** (Principio 1). El error más caro.
- **Doble-tratar tipografía fluida** con media queries de font-size: si ya es
  `clamp()` vía preset, no la toques (Principio 3).
- **edit.js y save.js desincronizados** → "block validation failed". Si tocas uno,
  toca el otro idéntico.
- **Cambiar save.js de un bloque estático publicado** sin `deprecated` → rompe el
  contenido existente.
- **Columnas de distinta altura** en una fila → `align-self: stretch` en la columna
  que debe rellenar (ver mapeo Figma→CSS).
- **Rejillas cuyos hijos también son rejilla**: sin `align-content: start` en
  los hijos, las filas se estiran y las columnas quedan descolgadas.
- **`calc()` anidado con división** (`calc(100% / (4 * (n - 1)))`): el
  minificador lo rompe; precalcula el divisor en una custom property.
- **Overflow a 320**: hijos flex/grid sin `min-width: 0` con textos largos o
  filas de chips.
- **Variables con modo mal copiado**: revisa que los valores de Mobile no estén
  pegados en Desktop (o al revés) antes de generar nada.

## Salida

Al terminar, reporta:

- Qué cambiaste en la Fase 1 (sincronización del desktop), separando estilo de
  estructura.
- Qué media queries añadiste en la Fase 2 y con qué breakpoints.
- Si tocaste markup/JS, por qué el CSS no bastaba, y si añadiste deprecation.
- Cualquier decisión de layout ambigua que convenga que revise el usuario.

No reescribas el bloque entero ni "mejores" cosas no pedidas: es un ajuste sobre una
base que ya funciona en desktop.

Para validar: `/responsive-check <url>` (detecta overflow y objetivos táctiles)
y el agente `responsive-auditor` (compara con los frames de Figma).
