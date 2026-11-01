# Tema Ashlar

Tema de WordPress **FSE** (Full Site Editing) hecho a medida para **Ashlar**, una empresa de diseño y obra (*design & build*) de Londres: ampliaciones, buhardillas, cocinas, sótanos y reformas integrales. Bloques Gutenberg nativos en React, sistema de diseño en `theme.json` y un panel de administración con la identidad de la marca, desde la pantalla de acceso hasta el editor.

El diseño es el Figma de Ashlar (`XRdk3LtiAg84GOAvCgmKCh`: páginas Desktop y Mobile, componentes y variables en Foundations). La web y la interfaz del editor están en inglés británico; el código se comenta en español. La arquitectura viene del tema Raíz.

> **¿Primera vez aquí?** Ve a [Puesta en marcha](#puesta-en-marcha).
> **¿Vas a tocar un `save.js`?** Lee antes [La regla del `deprecated.js`](#la-regla-del-deprecatedjs).

---

## Qué tiene de especial

- **Pantalla de acceso con la marca.** Fotos de los proyectos que pasan solas con su nombre y barrio («Elm Row · Hampstead, NW3»), un saludo según la hora y un formulario con la tipografía y la paleta de la web. Los colores salen de `theme.json` en tiempo real.
- **Admin con identidad.** Esquema de color «Ashlar» propio (menú, botones, enlaces y el acento del editor de bloques), tipografía de la marca y una portada **Home** en lugar del escritorio de WordPress: saludo, accesos directos y las páginas recientes.
- **Rol Client.** Puede editar todo el contenido, los menús y los datos de la web, pero ve un menú corto y no puede entrar donde se rompen cosas (Editor del sitio, Personalizar, Temas, Widgets, Ajustes, Herramientas).
- **Opciones declarativas.** Contacto, redes, cabecera, pie, pantalla de acceso y analítica: todo en un esquema PHP del que salen el formulario, el saneado y los valores por defecto.
- **Librerías compartidas de verdad.** GSAP, ScrollTrigger, SplitText y Lenis se cargan una vez como scripts de WordPress; ningún bundle las lleva dentro.
- **Loader de marca en la primera visita.** Los tres sillares del logotipo se colocan uno a uno, sale el nombre y sube el telón, que da paso a la intro de la página. Solo una vez por sesión, nunca con movimiento reducido.
- **Animaciones por atributos.** Un bloque solo tiene que poner `data-reveal`, `data-split`, `data-parallax`… en su markup. Con movimiento reducido o el interruptor de animaciones del pie apagado, todo se ve desde el primer pintado.
- **Proyectos como contenido de verdad.** Un tipo de contenido con su categoría (tipo de obra) y su ficha (resumen, año, superficie antes y después, barrio, plazo, precio cerrado y cuenta final, arquitecto…) en un panel lateral. La portada, la rejilla con filtros y la página de cada proyecto se llenan solas.
- **Formulario de presupuesto sin plugins.** Horquilla de precio orientativa según el tipo y el tamaño de la obra, validación accesible, envío sin recargar (y también sin JavaScript), aviso por email y bandeja **Messages** en el admin con contador de no leídos.
- **Rendimiento:** imágenes con `srcset` de la biblioteca de medios, carga diferida fuera del primer pantallazo, prioridad para la foto de cabecera, fuentes WOFF2 precargadas y un único CSS de ~19 KB con gzip.

---

## Requisitos

| Herramienta | Versión | Para qué |
|---|---|---|
| **Node.js** | 20 o superior (ver [`.nvmrc`](.nvmrc)) | Compila los bloques y estilos |
| **WordPress** | 6.5 o superior (probado en 7.1) | Temas de bloques |
| **PHP** | 8.1 o superior | Sintaxis moderna |

---

## Puesta en marcha

El tema va en `wp-content/themes/ashlar/`.

```bash
npm ci               # dependencias, versiones exactas
npm run build        # compila → build/
php tools/seed.php   # contenido de demostración (idempotente; --force lo vuelve a escribir)
```

El seed hace lo mismo que el botón de **Options → Demo content** en el escritorio (el código está en `inc/demo.php`) y deja la web como en el Figma:

- Sitio en inglés británico (`en_GB`, se descarga si falta). Los administradores conservan en el escritorio el idioma que tenían.
- Páginas (Home, Projects, Services, About, Contact, Journal y las legales), portada, enlaces permanentes y los menús en sus ubicaciones.
- Las fotos de `src/assets/images/photos/` en Medios, sin duplicarlas.
- Las categorías y los diez proyectos de demostración con su ficha (`tools/content/projects.php`).
- Los temas y los seis artículos del Journal (`tools/content/articles.php` + `article-<slug>.html`).
- El contenido de Home, Projects, Services, About, Contact, Journal y de los proyectos, desde `tools/content/*.html`.

**Ese HTML no se escribe a mano.** Lo generan los propios bloques en el editor (`createBlock()` + `serialize()`), así que coincide exactamente con su `save.js` y nunca da «contenido inesperado» (ver [la regla del `deprecated.js`](#la-regla-del-deprecatedjs)). Las fotos van como marcadores (`https://seed.ashlar/<nombre>.jpg`) que el importador sustituye por los adjuntos reales.

Una página vacía se rellena también desde el editor: al abrirla aparece «How would you like to start?» con un punto de partida por página.

### Por qué hay que compilar

> **`src/` es lo que escribimos las personas. `build/` es lo que genera la máquina.**
> WordPress **solo lee `build/`**, que no está en Git: se regenera entero desde `src/`.

| Comando | Qué hace |
|---|---|
| `npm ci` | Instala con las versiones exactas del `package-lock.json`. |
| `npm start` | Compila en desarrollo y vigila los ficheros. **Nunca subas ese build a producción.** |
| `npm run build` | Compila una vez, minificado. Es lo que va al servidor. |
| `npm run lint:js` / `lint:css` | Revisan el estilo del código. |

---

## Estructura

```
ashlar/
├── theme.json            ← Sistema de diseño: la fuente única de verdad
├── functions.php         ← Solo carga los ficheros de inc/
│
├── inc/
│   ├── helpers.php         Markup compartido (botón, <em> con asteriscos, saludo)
│   ├── settings.php        Opciones (esquema declarativo)
│   ├── projects.php        Tipo «Project», su categoría, su ficha (meta) y el markup de tarjetas y fotos
│   ├── messages.php        Formulario de presupuesto: envío, «Messages» y aviso por email
│   ├── theme-setup.php     Soportes del tema y ubicaciones de menú
│   ├── menus.php           Puente entre Apariencia → Menús y los bloques de cabecera y pie
│   ├── enqueue.php         CSS, JS global y librerías compartidas
│   ├── front.php           Movimiento antes del primer pintado, precarga de fuentes, limpieza del <head>
│   ├── seo.php             Meta description, Open Graph y Twitter Card desde el extracto (se retira si hay un plugin SEO)
│   ├── blocks.php          Registro automático de build/blocks/*
│   ├── gutenberg.php       Categoría y bloques permitidos
│   ├── svg.php             Subida de SVG saneada (solo administradores)
│   ├── admin.php           Esquema de color, Home, rol Client, menú y barra
│   ├── login.php           Pantalla de acceso
│   └── demo.php            Importador del contenido de demostración
│
├── templates/  parts/    ← Plantillas FSE, cabecera y pies (completo y corto)
├── tools/seed.php        ← Lanza el importador desde la consola
├── tools/content/        ← Proyectos y marcado de las páginas de demostración
├── .claude/              ← Kit de Claude Code: reglas, skills, agentes y hooks
│
└── src/                  ← 👈 AQUÍ SE TRABAJA
    ├── blocks/             Un bloque por carpeta
    ├── components/         Piezas compartidas en React (ver «Componentes compartidos»)
    ├── js/                 app.js (global) · lib/ (ciclo de vida, motion, GSAP, Lenis) · modules/
    ├── scss/               config (tokens) · tools · elements · layout · components · parts · templates · blocks · editor
    ├── admin/              Acceso, admin, esquema de color, opciones, ficha del proyecto, editor
    └── assets/             Fuentes y fotos
```

---

## Sistema de diseño

**`theme.json` es la fuente única de verdad**: 22 colores (la escala `stone`, el acento `corten` y los estados), 9 tamaños de fuente fluidos (de 390 a 1440 px), 9 espaciados, y los tokens de layout, tipo, radios y movimiento en `settings.custom`. `src/scss/config/_aliases.scss` los expone con nombres cortos:

```scss
// ✅ Bien
color: var(--fg);
padding-block: var(--section);
font-size: var(--font-size-h2);

// ❌ Mal
color: #151311;
padding: 80px;
```

> ⚠️ WordPress pasa los slugs a kebab-case: el tamaño `h1` se publica como `--wp--preset--font-size--h-1`. Los alias ya lo resuelven; usa siempre `--font-size-h1`.

### Tonos de sección

Ashlar alterna secciones claras (stone-50), beige (stone-100) y oscuras (stone-950). Cada tono (`.theme-subtle`, `.theme-dark`; el claro no lleva clase) redefine las mismas variables semánticas: `--bg`, `--surface`, `--fill`, `--fill-contrast`, `--fg`, `--fg-soft`, `--fg-muted`, `--accent`, `--line`, `--line-strong`, `--btn-*`, `--focus`… Dentro de un bloque se usan siempre esas, nunca un color de la paleta directamente, y el bloque funciona en los tres tonos sin variantes.

### Tipografía

Archivo (titulares), Hanken Grotesk (texto e interfaz) e IBM Plex Mono (solo datos: fechas, medidas, cifras, rótulos de documento; los antetítulos de sección van en Hanken tras un sillar de corten), autoalojadas en WOFF2, precargadas y con fuentes de reserva de métricas ajustadas para que el texto no salte al cargar. Recetas en `tools/_text.scss` (`t-h1`, `t-lead`, `t-label`…). El `<em>` de un titular no va en cursiva: es el tramo en tono apagado.

Mobile-first con `@include up(bp)`. Cortes: `xs 400 · sm 640 · md 768 · ml 900 · lg 1024 · xl 1200 · xxl 1440 · xxxl 1600`. El Figma dibuja a 390 y a 1440; los anchos intermedios se resuelven con el corte y se comprueban renderizando.

---

## La experiencia de edición

Lo que ve quien edita la web, pensado para alguien que no sabe (ni tiene por qué saber) de WordPress:

- **Guía de bienvenida propia** la primera vez que se abre el editor: secciones, escribir encima, panel lateral y publicar. Se reabre desde ⋮ → «Editor guide». (`src/admin/editor/welcome-guide.js`)
- **«How would you like to start?»** al abrir una página vacía: un punto de partida por página (Home, Projects, Services, About, Contact), con vista previa real y un clic para rellenarla. También desde ⋮ → «Starting points…» (avisa si va a sustituir secciones). Se construyen con `createBlock()`, así que el HTML guardado siempre coincide con el `save.js` actual. (`src/admin/editor/starters.js`)
- **Insertador limpio:** solo las secciones del sitio, en su categoría, con iconos dibujados para la marca y vista previa con fotos reales; sin patrones ni bancos de imágenes genéricos.
- **Todo se escribe encima.** Los textos son `RichText` en el lienzo; las listas (cifras, servicios, preguntas…) se reordenan, añaden y quitan ahí mismo.
- **Fotos sin sorpresas:** punto focal (el recorte respeta lo importante en cualquier pantalla), texto alternativo editable con aviso si falta, y `srcset` automático de la biblioteca de medios.
- **Tono de sección** (claro, beige u oscuro) en lugar de selectores de color sueltos: imposible romper el contraste o la paleta.
- **El título de la página** aparece como una barra discreta que explica para qué sirve (menú, pestaña, Google), no como parte del diseño.
- **El editor con los colores de la marca:** el acento corten llega también al lienzo y a las ventanas de WordPress.
- **Lo que viene de otro sitio se ve de verdad:** los proyectos, la rejilla, la cabecera, el pie o los datos de contacto se muestran en el lienzo tal como saldrán (vista previa del servidor), con una nota de dónde se cambian (Options, Apariencia → Menús, la ficha del proyecto).
- **Ficha del proyecto** en el panel lateral «Project details». En el lienzo quedan las secciones del relato (The brief, The plan, On site, Friday reports, The money, Who built it), que son bloques normales.
- **Presupuesto:** los rótulos y errores del formulario son fijos (accesibilidad); lo editable es lo de alrededor, las opciones y el mensaje de agradecimiento, que se ve en el lienzo con «Show the thank-you message».

### Componentes compartidos (`src/components/`)

| Componente | Para qué |
|---|---|
| `button` | El botón de Ashlar: rectangular, Hanken SemiBold y flecha (mismo markup que `ashlar_button()` en PHP). Al pasar el ratón, relleno direccional: un círculo entra por donde entra el ratón y sale por donde sale (`::before` + `src/js/modules/buttons.js`, sin tocar el markup) |
| `media` | Marco de foto: `wp-image-{id}`, punto focal, reveal y parallax; hueco para elegir foto en el lienzo |
| `media-field` | Campo de foto del panel: elegir, cambiar, punto focal, texto alternativo |
| `link-field` | Enlace con buscador de páginas |
| `chapter` | Marcador «01 — Capítulo» |
| `intro-title` | Titular sobre el pliegue que entra línea a línea |
| `repeater` | Botonera de cada elemento de una lista y «+ Add» |
| `section-theme` | Selector de tono de sección |
| `chip` · `project-card` | Solo estilos: píldoras de filtro y tarjeta de proyecto (markup en `ashlar_project_card()`) |
| `block-icons` · `icons` · `editor-assets` | Iconos del insertador, flechas y fotos de las vistas previas |

---

## Bloques

| Página | Bloques |
|---|---|
| **Home** | Home hero (con el cartel de la obra en curso) · Manifesto (firmado, con retrato) · Friday report (un parte real como documento) · Services list · Before & after · Selected work (carrusel; en escritorio, *horizontal scroll*) · How it works (pestañas, acordeón en móvil y *horizontal scroll* si cabe) · Client story. Siguen disponibles, fuera de la Home: On site now, Commitments table, Case study y Partners |
| **Projects** | Page intro · All projects (rejilla con filtros) · Where we build |
| **Journal** | Page intro · Journal articles (temas, el último en grande y tarjetas de pregunta) |
| **Artículo del Journal** | Article · Header · Article · Contents · Article · Keep reading (los tres en `templates/single.html`; el texto, con los bloques del core) |
| **Services** | Page intro · Service · Numbered points · Cost guide · Questions |
| **About** | Page intro · Key figures · Timeline · Numbered points · Photo and panel · Team · Callout strip |
| **Contact** | Quote form · Photo and panel · Questions |
| **Ficha del proyecto** («Project · …») | Header · Main photo · Facts · The brief · The plan · On site · Friday reports · The money · Who built it · Next project (Header y Next project van en `templates/single-project.html`; en el contenido, además, Before & after y Client story) |
| **Cabecera y pie** | Logo · Header menu · Menu column · Contact details · Social links · Footer call to action · Footer brand · Footer legal bar · Footer wall |
| **404** | Page not found (`templates/404.html`) |

---

## Cómo funciona un bloque

| Fichero | Qué es |
|---|---|
| `block.json` | Ficha técnica: nombre, icono y **atributos**. |
| `index.js` | Registra el bloque. |
| `edit.js` | Lo que se ve **en el editor**. |
| `save.js` | El HTML que se **guarda en la base de datos**. ⚠️ Ver [la regla del deprecated](#la-regla-del-deprecatedjs). |
| `style.scss` | Estilos del bloque (se agregan en `build/css/main.css`, editor y front). |
| `view.js` | *(opcional)* JavaScript en la web publicada. |
| `render.php` | *(opcional)* Bloques **dinámicos** e híbridos. |
| `style-vars.js` | *(opcional)* Variables CSS por instancia compartidas por edit y save (hoy solo `site-ticker`). |

Tres tipos, según de dónde sale el contenido:

- **Estáticos** (la mayoría): todo lo escribe el cliente en el bloque; `save.js` guarda el HTML.
- **Dinámicos** (cabecera, pie, rejilla de proyectos, datos de la ficha, 404): el contenido vive en otro sitio (Opciones, menús, la ficha del proyecto); `render.php` lo pinta en cada visita y el editor lo muestra con `ServerSideRender`.
- **Híbridos** (Selected work, Main photo, Quote form): `save.js` guarda lo que escribe el cliente con un hueco vacío (`data-projects-slot`, `data-project-photo`, `data-quote-channels`) y `render.php` lo rellena al pintar. Así los textos se editan encima y lo demás está siempre al día.

**Añadir un bloque no requiere tocar PHP**: `inc/blocks.php` registra todo lo que encuentre en `build/blocks/*/block.json`. Basta con crear la carpeta (o `node .claude/skills/nuevo-bloque/scripts/scaffold-block.mjs <slug> "Title"`), añadir su SCSS a `src/scss/blocks/index.scss` y compilar. Los que no van en páginas (cabecera, pie, ficha, 404) se listan en `ASHLAR_NON_PAGE_BLOCKS` (`inc/gutenberg.php`).

### JavaScript de un bloque

GSAP, ScrollTrigger, SplitText, Lenis y la API del tema **no se empaquetan**: `webpack.config.js` los convierte en dependencias de WordPress (`ashlar-gsap`, `ashlar-lenis`, `ashlar-app`…) que se cargan una sola vez.

```js
// view.js
import gsap from 'gsap';                         // por defecto, sin llaves
import { onPage, motionAllowed } from '@ashlar/app';

onPage((signal) => {
    if (!motionAllowed()) return;
    // …tu animación; devuelve una función de limpieza si hace falta
});
```

`onPage` engancha el bloque al ciclo de vida del tema: se monta al cargar y se desmonta y vuelve a montar con el interruptor de animaciones del pie.

Si un view.js anima algo con el scroll, usa los tiempos comunes de `motion` (`import { motion } from '@ashlar/app'`: `motion.start`, `motion.duration`, `motion.stagger`, `motion.scrub`…; definidos en `src/js/lib/motion.js`) en vez de números propios.

> Si un formulario tiene un campo `name="action"`, `form.action` devuelve ese campo y no la URL: usa `form.getAttribute('action')`.

### Animaciones sin JavaScript propio

| Atributo | Efecto |
|---|---|
| `data-reveal` | Aparece y sube (en escalera si entran varios a la vez) |
| `data-split` | Titular que entra línea a línea tras una máscara |
| `data-rise` | Sus hijos (palabras) suben uno tras otro desde la línea base |
| `data-words` | Las palabras se encienden al pasar por la pantalla (parten de su color atenuado, nunca por debajo de 4,5:1 contra el fondo) |
| `data-media-reveal` | El marco de la imagen se descubre desde abajo |
| `data-parallax` | La imagen interior se desplaza contra el scroll: `0.1` enmarcada, `0.15` a sangre |
| `data-draw` | Un filete se dibuja desde la izquierda |

### Criterio: qué animación lleva cada elemento

Se elige por el **papel** del elemento, nunca por el bloque, para que toda la web se mueva igual. Todo lo que entra lo hace al cruzar la misma línea (88 % de la pantalla), con la misma duración y el mismo escalonado.

| Papel | Atributo |
|---|---|
| Capítulo «01 — …» | `data-reveal="fade"` (lo pone `<Chapter>`) |
| Titular que abre una sección o un tramo a todo el ancho | `data-split` |
| Frase para leer, en `t-lead` | `data-words` |
| Texto, botones, pies, filtros | `data-reveal` |
| Ítem de una lista (fila, tarjeta, paso, pregunta, cifra) | `data-reveal` en el ítem entero; si lleva foto, solo en su texto |
| Foto enmarcada | `reveal` + `parallax={0.1}` en `<Media>` |
| Foto a sangre (banda, fondo) | solo `parallax={0.15}` |
| Filete | `data-draw` |
| Hero sobre el pliegue | CSS al cargar (`IntroTitle`, `data-intro`) + `data-hero-bg` / `data-hero-content` |

Ningún elemento de una sección se queda quieto si los de al lado se mueven.

### Horizontal scroll en «Selected work»

En escritorio con ratón (≥ 1024 px, movimiento permitido) la sección se queda fija en el centro de la pantalla y el scroll vertical desplaza las tarjetas, 1 px por 1 px (`projects-carousel/view.js`, `gsap.matchMedia` + ScrollTrigger con `pin` y `scrub`). Flechas, ← →, arrastrar y el tabulador llevan la página a la tarjeta que toca; en pantallas bajas las tarjetas encogen para que la sección quepa entera. En móvil, táctil o con movimiento reducido es un carrusel nativo con scroll-snap. El markup es el mismo en los dos modos (el fijo añade `.is-pinned`).

### Horizontal scroll en «How it works»

`process/view.js` elige entre tres modos: acordeón (< 1024 px), pestañas, y *horizontal scroll* (escritorio con ratón y movimiento permitido) **solo si** la fila de pestañas y el panel compacto (`.is-hscroll`: menos aire, titular H3, foto más estrecha) caben fijos bajo la cabecera; lo mide al cargar, al cambiar el tamaño y cuando llegan las fuentes. Los cinco paneles se apilan en la misma celda de la rejilla y GSAP los desliza en fila con el scroll; cada paso encaja (regla propia sobre Lenis: más de un 20 % de paso en un sentido lleva al siguiente). Sigue siendo el patrón de pestañas ARIA: las pestañas, ← →, Inicio/Fin y «Next / Previous» llevan la página al paso, y los paneles que no se ven quedan `inert`.

### Servicios fijos en «Services» (Pinned services)

El bloque contenedor `ashlar/service-stack` agrupa los `ashlar/service` (en el editor: seleccionar los servicios → Transformar en «Pinned services»; «Desagrupar» los devuelve). `service-stack/view.js` adapta «Sticky Features» de Osmo: en escritorio con ratón y movimiento permitido, **solo si** el servicio más largo cabe bajo la cabecera en modo compacto (`.is-pinned`: menos aire y la foto, como mucho, del alto libre; cabe en 1366×768), la sección ocupa la pantalla y se queda fija 100 vh por paso. La foto nueva se abre desde el centro sobre la anterior y los textos salen y entran en escalera; una barra sobre la foto marca el avance. Los servicios se apilan en la misma celda con el tono y el lado de foto del primero. Las #anclas de cada servicio (menú, services-list, «Jump to», al cargar la página o con Atrás / Adelante) y el tabulador llevan al paso que toca; los servicios que no se ven solo son transparentes (siguen en el orden del tabulador). En móvil, pantallas bajas o con movimiento reducido no hace nada: los servicios van uno tras otro.

### Loader de la primera visita

«Marca en obra»: los sillares del logotipo se colocan uno a uno (el de corten, el último, entra de lado), corren un contador y la línea de progreso del ticker, sale el nombre y sube el telón. Unos 3 s, y espera como mucho 3 s a las fuentes y a la foto principal.

| Pieza | Dónde |
|---|---|
| Decide si sale (antes del primer pintado) y red de seguridad | script de `<head>` en `inc/front.php` |
| Markup (`aria-hidden`), en `wp_body_open` | `ashlar_loader_markup()` en `inc/front.php` |
| Estilos; pausa la intro CSS y el scroll mientras dura | `src/scss/layout/_loader.scss` |
| Animación (GSAP) | `src/js/modules/loader.js` |

- Sale solo en la **primera página de la sesión** (`sessionStorage`), con movimiento permitido y con JavaScript. Para revisarlo, añade `?loader` a cualquier URL. Para quitarlo: `add_filter('ashlar_loader', '__return_false')`.
- Mientras dura, `html.is-loading` pausa la intro CSS y `mountAll()` espera: los comportamientos de página arrancan al subir el telón, para que lo que está sobre el pliegue entre a la vista.
- Si el JS no llega, el script de `<head>` lo quita a los 4 s; si algo falla dentro de `loader.js`, la página se muestra igualmente (como mucho a los 7 s).

---

## La regla del `deprecated.js`

Los bloques estáticos guardan su HTML **dentro del contenido de la página**. Al abrirla, WordPress ejecuta el `save.js` actual y lo compara con lo guardado; si no coincide exactamente aparece **«Este bloque contiene contenido inesperado»** y hay que recuperarlo a mano, página por página.

> **Antes de modificar un `save.js` publicado, congela la versión actual en `deprecated.js`:**
> `node .claude/skills/deprecated-save/scripts/freeze-save.mjs <slug> --write`

El script compara con el último commit de Git. Mientras un bloque no esté publicado (como ahora: aún no hay producción) no hace falta.

El `deprecated.js` es una lista de versiones antiguas del markup: WordPress las prueba cuando el `save` actual no coincide y, si una encaja, migra el bloque sin avisos. **No actualiza el frontend**: para que un visitante vea el markup nuevo hay que volver a guardar cada página.

| Qué tocas | ¿Se ve en el frontend sin más? |
|---|---|
| `style.scss` | **Sí.** El CSS va aparte, en `main.css`. |
| `edit.js` | **Sí**, pero solo afecta al editor. |
| `save.js` | **No.** Hay que volver a guardar cada página. |
| `render.php` | **Sí.** Los bloques dinámicos se pintan en cada visita. |

---

## Menús y Opciones

**El cliente no entra al Editor del sitio para cambiar un enlace.**

| Dónde se edita | Qué controla |
|---|---|
| Apariencia → Menús · *Header — main menu* | Navegación de la cabecera y menú desplegable |
| Apariencia → Menús · *Footer — services* / *Footer — company* | Columnas de enlaces del pie |
| Apariencia → Menús · *Footer — legal* | Privacidad, cookies y accesibilidad, en la barra inferior del pie |
| Options → Contact | Email, teléfono, horario y dirección (pie, menú, presupuesto) |
| Options → Social | Enlaces a redes del pie y del menú |
| Options → Header | Botón «Get a rough price», teléfono en la cabecera, línea del menú móvil |
| Options → Footer | Llamada del pie, texto de la marca, línea legal (`{year}` = año actual) |
| Options → Login screen | Fotos, titular y texto del login |
| Options → Analytics | ID de Google Analytics |
| Ajustes → Generales | Nombre del sitio (compone el logotipo) |

Los campos se definen en `ashlar_settings_schema()` (`inc/settings.php`). Tipos: `text`, `email`, `url` (acepta `/contact/`), `textarea`, `media` y `gallery` (ordenable arrastrando). En los titulares, lo escrito **entre asteriscos** sale en el tono apagado: `Let's build *something that lasts.*`

---

## Proyectos y mensajes

| Qué | Dónde |
|---|---|
| Tipo de contenido «Project», su categoría y su ficha (meta en REST) | `inc/projects.php` |
| Panel «Project details» | `src/admin/project-panel.js` |
| Plantilla de cada proyecto | `templates/single-project.html` |
| Formulario de presupuesto | `src/blocks/quote/` · `inc/messages.php` |

- **Qué sale dónde:** el carrusel «Selected work» de la portada saca los marcados con «Show on the home page» (o los primeros, si no hay ninguno). La rejilla de Projects los saca todos, del más reciente al más antiguo (`?sort=oldest` al revés), con un proyecto destacado arriba y un filtro por cada categoría (`?type=<categoría>`).
- **El formulario** envía a `admin-post.php` (acción `ashlar_quote`), con nonce, campo trampa y un límite de 5 envíos cada 10 minutos por IP. Valida en el navegador y en el servidor (solo acepta las opciones del bloque publicado, que se guardan al guardar la página). Cada mensaje se guarda en **Messages** y se avisa por email a Options → Contact → Email (o al email del administrador). Con JavaScript se envía sin recargar; sin él, el envío clásico vuelve a la página con `?sent=1` (o `?sent=0` si falla) y muestra el mensaje que toca.
- `/contact/?service=<valor>` deja elegido ese tipo de obra en el formulario (para enlazar desde un servicio concreto).

---

## Admin y pantalla de acceso

| Pieza | Dónde |
|---|---|
| Pantalla de acceso | `inc/login.php` · `src/admin/login.scss` · `src/admin/login.js` |
| Esquema de color «Ashlar» | `src/admin/admin-colors.scss` (compilado con los SCSS de esquemas de WordPress) |
| Home, rol Client, menú, barra, pie | `inc/admin.php` · `src/admin/admin.scss` |

- La pantalla de acceso y el admin leen los colores y fuentes de `theme.json` (variables de estilos globales + `wp_print_font_faces()`).
- El esquema de color se compila en hexadecimal porque WordPress calcula tonos en compilación: es un **espejo** de la paleta y hay que actualizarlo si cambia la marca.
- WordPress 7 envuelve el editor en un *ThemeProvider* con un mapa fijo de colores por esquema. `admin-colors.scss` sobrescribe sus tokens de marca para que el editor también use el corten.
- La portada Home se pinta en el idioma del sitio (fecha y «2 hours ago» en inglés, como los textos del tema); el resto del escritorio sigue el idioma del perfil. `wp-admin/?wp-dashboard=1` abre el escritorio de WordPress.
- Las entradas son el **Journal** (`inc/journal.php`): en el escritorio se llaman «Journal» y «Article», las categorías son los temas («Topics») y no hay etiquetas. Cada artículo es una pregunta (título) con su respuesta corta (extracto). Las URL cuelgan de `/journal/` y los archivos de tema, etiqueta y fecha redirigen a la página Journal (`?topic=`). Sin Journal, devolver `false` en el filtro `ashlar_has_blog`.
- La web no tiene comentarios: `ashlar_has_comments()` los oculta en todo el admin y los cierra en todo el contenido (filtro `ashlar_has_comments`).

---

## Reutilizar el tema en otro proyecto

1. **Identidad:** paleta, fuentes y escalas en `theme.json`; el espejo de colores en `src/admin/admin-colors.scss`; fuentes y fotos en `src/assets/`.
2. **Datos:** valores por defecto en `ashlar_settings_schema()` y las fotos de acceso en `ashlar_login_slides()`.
3. **Nombre:** `style.css` y `.claude/project.json` (namespace y text domain que usan los scripts del kit).
4. **Bloques:** sustituye los de `src/blocks/` manteniendo los de cabecera y pie si encajan; el contenido de demostración, en `inc/demo.php` y `tools/content/`.

---

## Problemas frecuentes

**El tema se ve sin estilos o los bloques no aparecen** → No has compilado (`npm run build`) o el tema activo no es Ashlar.

**«Este bloque contiene contenido inesperado»** → El `save.js` cambió sin `deprecated.js`. Pulsa «Intentar recuperación» (nunca «Convertir en HTML») y añade el deprecated que faltaba.

**Cambio un `save.js` y el frontend sigue igual** → Hay que volver a guardar cada página que use ese bloque.

**La cabecera o el pie no reflejan `parts/*.html`** → Hay una copia guardada en la base de datos. Revísalo con `php .claude/skills/wp-local/scripts/wp-diagnose.php`.

**«Contenido inesperado» en el Editor del sitio** → No dejes comentarios HTML (`<!-- … -->` que no sean de bloque) dentro de un grupo en `templates/` o `parts/`: el editor los compara con el `save` del grupo. Para documentar, usa el nombre del bloque (`"metadata":{"name":"…"}`), que además se ve en la vista de lista.

**Un `calc()` funciona en desarrollo y se rompe en producción** → El minificador estropea los `calc()` anidados con división. Precalcula el divisor en una custom property.

**`php` no se encuentra** (Laravel Herd en Windows) → Usa el PHP de Herd con su ruta completa, o añádelo al `PATH`.

---

Hecho por [Javier Piedra](https://jpiedra.com).
