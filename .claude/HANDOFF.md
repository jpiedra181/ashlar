# Ashlar — estado del trabajo y próximos pasos

Traspaso del trabajo hecho hasta el 29 oct 2026. Léelo entero antes de tocar
nada. Lo que no esté aquí está en `CLAUDE.md`, `README.md` y `.claude/rules/`.

## Qué es

Pieza de portfolio para Upwork: «Ashlar», constructora ficticia de Londres
(design & build). Diseño completo en Figma (`XRdk3LtiAg84GOAvCgmKCh`) llevado a
un tema FSE con bloques Gutenberg propios. La referencia de arquitectura es el
tema Raíz: `C:\Desarrollo\Javier\Work\Raiz Studio - Wordpress\wp-content\themes\raiz`
(mismo esqueleto; de ahí se adaptan formulario, mensajes, login, etc.).

- Web y editor en **inglés británico**; comentarios y commits en **español**.
- La persona prefiere ir **paso a paso**: explica qué vas a hacer, hazlo y
  comprueba antes de pasar a lo siguiente.
- **No leas `pass.txt`** (en la carpeta Ashlar ni en la de Raíz). No escribas
  contraseñas: si hace falta entrar en wp-admin, que lo haga la persona.

## Plan por fases

| Fase | Contenido | Estado |
|---|---|---|
| 1 | Base del tema: tokens, tipografías, cabecera, menú móvil, pie, ajustes | ✅ |
| 2 | Bloques de la Home | ✅ |
| 3 | Página Projects y ficha de proyecto | ✅ |
| 4 | Services, About, Contact (formulario de presupuesto) y 404 | ✅ (29 oct) |
| 5 | Admin/login con la marca, README, auditorías, limpieza | ⏳ siguiente |

Primer paso recomendado: **comprobar en ashlar.local** lo hecho (ver «Puesta en
marcha») antes de empezar la fase 4.

## Puesta en marcha en local

1. `npm ci` (no hay `node_modules`; `build/` ya está compilado y al día).
2. Contenido de demo, una de dos:
   - wp-admin → **Options → Demo content** → «Import demo content», o
   - `php tools/seed.php` desde la carpeta del tema (PHP de Herd). En Git
     Bash `php` no está en el PATH: `/c/Users/xavi_/.config/herd/bin/php84/php.exe`.
   Monta ajustes (permalinks `/%postname%/`, Londres), páginas, menús, las 27
   fotos/planos, categorías, 10 proyectos con su ficha y el contenido de Home y
   Projects. Es idempotente; `--force` (o la casilla) reescribe páginas y
   proyectos de demo.
3. Revisar `/`, `/projects/`, `/projects/elm-row/` en escritorio y móvil.

## Cómo está hecho (lo imprescindible)

- **Bloques** en `src/blocks/<slug>/`: `block.json`, `index.js`, `edit.js`,
  `save.js` o `render.php`, `style.scss`, `[view.js]`. Se registran solos desde
  `build/blocks/`. Cada `style.scss` necesita su `@forward` en
  `src/scss/blocks/index.scss`.
- **Tipos**: estáticos (save.js), dinámicos (render.php + `ServerSideRender`
  dentro de `<Disabled>`), híbridos (save.js deja un hueco `data-*` que
  render.php rellena: `projects-carousel`, `project-hero`).
- **Nunca `__()` en save.js** (el HTML guardado no puede depender del idioma):
  los textos van en atributos con su valor por defecto en block.json.
- **Tonos de sección** con `SectionTheme` → clases `theme-subtle` / `theme-dark`.
  Solo variables semánticas en SCSS (`--fg`, `--fg-soft`, `--accent`, `--fill`…).
- **Animaciones** por atributo (`data-reveal`, `data-split`, `data-media-reveal`,
  `data-parallax`, `data-intro` + `IntroTitle`), solo bajo `html.motion`.
- **Componentes** en `src/components/`: button, chapter («02 — Label»), media +
  media-field (alt y punto focal), link-field, repeater (ItemActions/AddItem),
  section-theme, intro-title, icons (Arrow), block-icons, editor-assets,
  project-card y chip (solo estilos). Helpers PHP equivalentes en
  `inc/helpers.php` (`ashlar_button`, `ashlar_arrow`…) e `inc/projects.php`
  (`ashlar_media`, `ashlar_project_card`, `ashlar_chapter`…).
- **Contenido de demo**: el marcado de `tools/content/*.html` se genera con
  `createBlock()` + `serialize()` en el editor real (nunca HTML a mano para
  bloques estáticos). Las fotos llevan id `99xxxx` y URL
  `https://seed.ashlar/<nombre>.<ext>` como marcador; `inc/demo.php` las cambia
  por los adjuntos importados. Si cambias un `save.js`, regenera ese HTML
  (abre una página en el editor y serializa los bloques desde la consola).
- **Puntos de partida** («How would you like to start?», menú ⋮ → Starting
  points…) en `src/admin/editor/starters.js`: Home page, Projects page, Blank.
  Añade uno por cada página nueva.
- **Fotos de ejemplo** en `src/assets/images/photos/` (+ `alt.json`). Las 25
  fotos y los 2 planos SVG de Elm Row salen del Figma (nodo 120:2, página Archive).

### Bloques que existen

- Cabecera/pie (solo en parts): logo, header-menu, nav-menu, site-contact,
  site-social, footer-cta, footer-brand (solo la frase), footer-bottom,
  footer-wall (muro de sillares con el nombre; se levanta al entrar, en
  `src/js/modules/footer.js`, junto al parallax de entrada del pie).
- Home: home-hero, site-ticker, manifesto, standard, services-list,
  before-after (con nota lateral opcional), projects-carousel, case-study,
  process (pestañas ≥1024 / acordeón), client-story (variante «bleed»). Partners existe pero salió de la Home
  (29 oct: no aportaba; la persona no quiso ni filas ni citas).
- Journal (29 oct, sin diseño en Figma): página con page-intro + journal-grid
  (temas `?topic=`, el último en grande, tarjetas de pregunta `.qcard`,
  `?show=`). Artículos = entradas (`inc/journal.php`): pregunta = título,
  respuesta corta = extracto. `templates/single.html` con article-header,
  article-toc (índice pegado; `modules/article.js` marca el apartado) y
  article-next. URL `/journal/%postname%/`; archivos → página Journal.
- Projects: page-intro (reutilizable: enlaces «Jump to» y foto ancha
  opcionales), projects-grid (filtros por categoría, orden, «Load more»; funciona
  sin JS por URL `?type=&sort=&show=`), boroughs.
- Ficha (`templates/single-project.html`): project-header y project-next en la
  plantilla; en el contenido project-hero, project-facts, project-brief,
  before-after, project-plan, project-build (fotos + programa de obra),
  project-reports, project-cost, client-story, project-team. El CPT `project`
  arranca con esas secciones (`ashlar_project_template()`); en proyectos solo se
  permiten esas y las compartidas (`ASHLAR_PROJECT_SHARED_BLOCKS`).
- Services: page-intro (con «Jump to»), service (uno por tipo de obra, ancla
  en «HTML anchor», foto izquierda/derecha) dentro de service-stack («Pinned
  services», 30 oct: contenedor con el efecto «Sticky Features» de Osmo en
  escritorio; ver README), numbered-grid («Every job»),
  cost-guide (tabla real con roles ARIA; en móvil, flex en dos líneas) y faq
  (`<details>`; reutilizable en Contact, tono claro).
- About: page-intro (foto ancha con pie; en móvil la foto va a sangre), stats
  («In numbers», `attached` para pegarse a la intro, `<h2>` solo para lectores
  de pantalla), timeline (eje horizontal dibujado con CSS desde lg y carril
  vertical por debajo; `--count` = nº de hitos), numbered-grid en variante
  `cards` con `stat`, photo-panel («The yard»; foto izquierda/derecha y nota
  junto al botón: sirve para «Open house» de Contact), team (retratos + tarjeta
  «+ 21 more») y callout («We’re hiring»).
- Contact: quote (híbrido: save.js + render.php + view.js; preguntas de radios
  en forma de chip, horquilla en vivo con cifras editables por tipo de obra y
  tamaño, canales de Options → Contact, «Prefer to talk?» debajo en móvil),
  photo-panel («Open house», foto a la derecha) y faq (tono claro). Plantilla
  `page-contact.html` con el pie completo (31 oct: la persona quiso la
  llamada también aquí, aunque el Figma usa el pie corto; el pie corto,
  `parts/footer-short.html` + `.site-footer--short`, queda sin uso).
- 404: bloque dinámico `ashlar/not-found` (render.php) en `templates/404.html`
  con el pie completo (como Contact): el plano (decorativo, aria-hidden: rejilla, habitación
  tachada con «404» que escala con `cqi`, cotas, etiqueta y punto de
  replanteo) y el mensaje con enlaces y el teléfono de Options. Textos y
  enlaces son atributos, editables en el Editor del sitio. Fuera de los
  insertadores de páginas (`ASHLAR_NON_PAGE_BLOCKS`).
- Peticiones: `inc/messages.php` → tipo privado `ashlar_message` («Messages»
  en el escritorio), envío a admin-post.php (acción `ashlar_quote`) con nonce,
  honeypot, 5 envíos/10 min por IP, validación contra las opciones guardadas
  del bloque (`ashlar_quote_choices`, se actualiza al publicar la página) y
  aviso por email.
- Datos del proyecto: panel «Project details» (`src/admin/project-panel.js`,
  meta `_ashlar_*`) + taxonomía `project_category` (filtros).

## Fase 4 — qué hay que hacer

Mira cada sección en Figma (desktop y mobile) antes de escribirla y reutiliza
bloques/componentes que ya existan (page-intro, chapter, chip, before-after,
client-story, process, project-team…). Nodos:

- ✅ **02 Services** `4:130` (mobile `4:138`): hecha el 29 oct. Punto de
  partida «Services page», `tools/content/services.html` e importada por
  `inc/demo.php`. Validada en el editor (9 bloques válidos), sin overflow en
  320–1920 y axe sin violaciones. Decisiones: en móvil se mantienen la
  entradilla de «Every job» y la nota de la guía de precios (Figma las
  oculta) y se usan los textos de escritorio (Figma acorta algunos en móvil).
  Nueva variable de tono `--fill-contrast` (caja «Good to know»).
  `page-intro` con enlaces: en móvil entradilla antes de las píldoras y
  píldoras deslizables (solo CSS).
- **03 Service detail** `4:131` (mobile `4:139`): revisado el 29 oct. Son
  marcos vacíos (sin capas, solo el fondo stone-50, tamaño por defecto de
  Figma) y no hay versión en Explorations ni en Prototype. Services ya cubre
  cada servicio con su ancla (`/services/#lofts`…), que es adonde apuntan el
  menú y services-list. **Decidido: no se hace** (no hay páginas por servicio).
- ✅ **06 About** `4:134` (mobile `4:142`): hecha el 29 oct. Punto de partida
  «About page», `tools/content/about.html` e importada por `inc/demo.php`.
  Validada en el editor (7 bloques válidos, y Services sigue válida tras
  ampliar numbered-grid), alturas por sección iguales al Figma en 1440, sin
  overflow en 320–1920 y axe sin violaciones. Como en Services, en móvil se
  mantiene el contenido que el Figma recorta (5.ª cifra, entradillas, textos
  completos). Ojo: `alt.json` llama a Marta «office manager», pero en About es
  «Project lead» (en el punto de partida va el texto correcto).
- ✅ **07 Contact · Quote** `4:135` (mobile `4:143`): hecha el 29 oct. Punto de
  partida «Contact page», `tools/content/contact.html` e importada. Validada
  en el editor (3 bloques), sin overflow en 320–1920 y probada de punta a
  punta: con JS (horquilla, errores, envío y agradecimiento), sin JS y sin
  sesión (curl: 303 a ?sent=1 / ?sent=0, nonce falso 403, honeypot). Se usa
  admin-post.php y no la API REST de Raíz: con la sesión iniciada la API trata
  la petición como anónima y el nonce no cuadraba. Decisiones: las cifras de
  la horquilla (salvo Rear extension 20–40 m², que es la del Figma) son
  valores por defecto coherentes con la guía de precios, editables en el
  bloque; todo es obligatorio salvo lo marcado «(optional)»; la casilla del
  Friday report empieza sin marcar; 24 px en vez de 22 (objetivo WCAG 2.2).
  Quedan en «Messages» dos peticiones de prueba (Test Enquiry / No JS Test):
  se pueden borrar.
- ✅ **08 404** `4:136` (mobile `4:144`): hecha el 29 oct (bloque
  `ashlar/not-found`). Validada en el Editor del sitio, sin overflow en
  320–1920 y axe sin violaciones. En móvil la etiqueta del plano puede partirse
  en dos líneas y «SP-404» empieza en el borde de la habitación (en el Figma,
  30 px antes) para que no choquen a 320 px; el enlace del teléfono tiene
  28 px de alto (objetivo táctil).

Al acabar cada página: punto de partida en `starters.js`, su marcado de demo en
`tools/content/` y añadirla a `inc/demo.php`; compilar, comprobar en
ashlar.local en escritorio y móvil, y validar en el editor que no sale
«contenido inesperado».

## Fase 5 — en curso

- ✅ **Idioma del sitio** (29 oct): estaba en `es_ES` y todas las páginas
  salían con `<html lang="es">`. Ahora el sitio está en English (UK) (`en_GB`,
  `<html lang="en-GB">`) y el usuario ff_admin tiene Español en su perfil, así
  que wp-admin sigue en español. `inc/demo.php` (ashlar_demo_language) lo deja
  así en cualquier instalación: descarga en_GB si falta y guarda a cada
  administrador el idioma que tenía antes de cambiar el del sitio.
- ✅ **Pie cortado en Contact** (31 oct): si la página cambiaba de alto tras
  cargar (formulario enviado, FAQ), ScrollTrigger no se recalculaba y el
  parallax del pie se quedaba a medias (contenido subido y en sombra). Ahora
  `src/js/lib/smooth-scroll.js` hace `ScrollTrigger.refresh()` al cambiar el
  alto del body (ResizeObserver, con espera de 150 ms).
- **Textos con voz propia** (31 oct, en curso): la web olía a IA (titulares
  de dos golpes, «Not X. Y.», cifras en cada frase, capítulos numerados).
  Persona y voz validadas en `.claude/PERSONA.md` (Tom narra; Priya, Marta y
  Dan en sus sitios; lector tipo: los Whitfield) + regla `rules/voz.md`.
  - ✅ **Home** (31 oct): textos de `.claude/copy/home.md` en los valores por
    defecto de sus `block.json` (de ahí salen la Home y su punto de partida),
    capítulos sin número y proceso sin cifras. Home (#7) regenerada en el
    editor (10 bloques válidos tras recargar) y `tools/content/home.html`
    regenerado desde el propio fichero (marcadores `seed.ashlar` intactos).
    Ojo: client-story mantiene «07» por defecto porque Elm Row depende de él;
    en la Home va `chapterNum: ""` explícito.
  - ✅ **Botón «Get a rough price»** en lugar de «Request a quote»: cabecera,
    menú móvil y pie (`inc/settings.php`; no había opciones guardadas en la
    BD), hero y 404 (`not-found`). Pie: sin antetítulo y «Got a house that
    needs work?». Línea «en obra» del menú móvil: Highbury Hill, como el
    ticker. Queda «Contact · Request a quote» (antetítulo del bloque quote)
    para la pasada de Contact.
  - ✅ **«Hale Reid Architects» → «Reid Architects»**: case-study, partners,
    `tools/content/projects.php` y el meta `_ashlar_architect` de Lansdowne
    Drive, Gibson Square y Ospringe Road.
  - **Diseño de la Home** (31 oct, en curso; directamente en código, sin
    Figma, por decisión de la persona). Concepto: «el expediente de obra».
    Pasos: 1 hero con cartel de obra · 2 el parte del viernes como pieza
    central · 3 quitar standard y case-study de la Home · 4 rótulos mono solo
    para datos · 5 nota de Tom en el manifiesto.
    1. ✅ **Hero con cartel de obra**: fuera el logotipo gigante y la franja de
       intro (el `<h1>` ya se ve en la primera pantalla). El cartel
       (`home-hero/site-board.js`, compartido por edit y save; tono light dentro
       del hero oscuro, cabecera negra con la marca, tornillos en las
       esquinas) absorbe el ticker: `site-ticker` sale de la Home y del punto
       de partida (el bloque sigue existiendo; su `tickerProgress` se
       reutiliza). Móvil: foto en bloque arriba (`--photo-h`) fundida con el
       fondo y el titular montado encima. Cotas ocultas en ≥ 1024 con menos de
       840 px de alto (el cartel ocupa su sitio). Home regenerada y válida,
       `home.html` regenerado, responsive-check 0 issues en 7 anchos, axe 0.
    2. ✅ **Parte del viernes** (bloque nuevo `ashlar/friday-report`, estático;
       el documento en `report-doc.js`, compartido por edit y save): cabecera
       de sección fija a la izquierda desde 1024 (titular «This one went to the
       Barkers at 4.52pm.», nota de la cláusula de los 100 £) y la hoja blanca
       (tono light dentro de cualquier tono) con rótulo, estado, obra,
       remitente con retrato, foto, This week, Next week, decisión pendiente,
       precio y despedida de Dan. Icono `report` en block-icons.
       La obra en curso pasa a **Highbury Hill, ampliación trasera, semana 9 de
       22** (cartel, ticker, menú móvil y parte), para que cuadre con las fotos
       (hero-mason, process-steel, team-dan). El paso 3 del proceso usa
       `elm-row-detail` para no repetir process-steel.
    3. ✅ **Fuera de la Home** standard y case-study (siguen como bloques). Tonos
       alternos: proceso en beige y client-story en claro (explícitos en la
       Home y en el punto de partida; el client-story de Elm Row depende del
       beige por defecto).
    4. ✅ **Antetítulos** (`.chapter`, global): Hanken en tono suave tras un
       sillar de corten (`--mark-accent`) en línea, en vez de mono en
       mayúsculas. El mono queda para datos y rótulos de documento.
    5. ✅ **Manifiesto firmado con retrato**: atributo `portrait` (decorativo),
       la firma pasa de `<p>` a `<div>`. Retrato nuevo `team-tom.jpg` (330 px,
       recortado de team-founders con GD) en `src/assets/images/photos` +
       `alt.json`; importado como adjunto 99 (seed 990027 en `home.html`).
    Comprobado: Home (#7) válida tras recargar, `home.html` regenerado (8
    bloques, marcadores intactos), responsive-check 0 issues en 7 anchos, axe 0
    violaciones (1440 y 375), con animaciones sin errores ni elementos ocultos.
    Pendiente de fotos: la cocina de los Whitfield no es la de Elm Row.
  - ✅ **About** (31 oct): entradilla de Tom en primera persona y firmada
    (Clerkenwell, las facturas), pie de foto fiel a la foto; fuera la fila de
    cifras (stats); línea de tiempo en su voz y con Elm Row en **2025**;
    «Three rules we don’t bend» → **«Jobs we said no to this year.»**
    (numbered-grid `ruled`: el sótano de Barnet, la cocina para Navidad, la
    buhardilla sin building control); patio con Nelson, el perro; equipo con
    «since 2011/2013» en vez de los «18 years» imposibles y sin «No account
    managers». Textos en los `block.json` de timeline, team y photo-panel
    (Contact tiene los suyos explícitos) y en el punto de partida.
  - ✅ **Contact** (31 oct): el formulario (bloque quote, solo en Contact) habla
    Marta en primera persona: entradilla firmada, «Where should I reach
    you?», «I’ll give you a ballpark when I ring», confirmación «Thanks. I’ve
    got it.», privacidad sin la letanía de «No…»; antetítulo «Contact».
    Contact (#13) y `contact.html` regenerados y válidos.
  - ✅ **Revisión del block-reviewer aplicada** (friday-report, home-hero,
    manifesto): clase `ashlar-item` en las filas del cartel y del parte (los
    botones de mover/quitar no se veían en el editor); retratos decorativos
    con `alt=""` forzado y el avatar del parte solo desde el panel; filas y
    puntos vacíos no se guardan; variable semántica nueva `--success` en
    `_themes.scss`; sin `rgb()` en el hero (color-mix con `--bg`/`--fg`);
    `pointer-events: none` en el degradado (se podía pulsar «Choose photo»);
    `siteProgress` en `src/components/site-progress` (site-ticker lo
    re-exporta como `tickerProgress`) y `@keyframes ticker-pulse` en
    `elements/_motion.scss`, para que el hero no dependa del ticker. Quedan
    como sugerencias: el `<span>` de los puntos de Next week solo en edit, el
    helper `text()` repetido en dos bloques (extraer si sale un tercero) y la
    sección del manifiesto sin encabezado (ya era así).
  - ✅ **Services** (31 oct): titular «We only take on five kinds of job.» y
    entradilla nueva (punto de partida + página); buhardillas sin «not a
    cramped box room»; guía de precios firmada por Priya y botón «Get a rough
    price in two minutes» (defaults de cost-guide); respuesta de las partidas
    abiertas coherente con Priya (default de faq; Contact tiene las suyas).
  - ✅ **Projects y Journal**: barrios «Five boroughs, close to the yard.»
    (default de boroughs); entradilla del Journal sin la letanía de «No…».
    Nota del jefe de obra de Elm Row «With us since 2011» (meta
    `_ashlar_manager_note` del #60, `tools/content/projects.php` y el ejemplo
    del panel). Pie (`footer_about`): «A small building firm in Islington,
    building and restoring houses across north and east London since 2009.»
  - ✅ **Foto de los Whitfield**: ahora es «the front kitchen they kept using
    during the build» (la ficha dice que vivieron en la parte delantera las 22
    semanas). Alt cambiado en `alt.json`, adjunto #34, Home, Elm Row,
    `home.html`, `project-elm-row.html` y el punto de partida.
  - ✅ **Elm Row responsive** (lo destapó responsive-check; ya estaba así):
    resumen del coste en flex con salto (a 320 px desbordaba 10 px), migas de
    pan con 24 px de alto táctil, notas del programa con `max-width` según su
    posición en la pista (a 1024 se salían). 0 issues en 7 anchos (Elm Row y
    Gibson Square).
  - ✅ **Careers** tenía la página vacía (enlazada desde el pie y desde «See
    the role»): page-intro de Tom, el puesto (numbered-grid) y cómo
    presentarse (callout a Priya por email). Página #12, `careers.html` (el
    importador ya la cargaba si existía) y punto de partida «Careers page».
  - Escáner de tics sobre las 26 URL del sitio: limpio salvo «bespoke» en un
    artículo, donde es el uso técnico (acristalamiento a medida).
  - ✅ **SEO sin plugin** (`inc/seo.php`, decisión de la persona): meta
    description, Open Graph y Twitter Card desde el extracto (páginas con
    campo «Excerpt»; Journal = respuesta corta; proyectos = resumen), con el
    texto del pie como reserva e imagen destacada o, si no, la del hero. Se
    retira solo si hay Yoast, Rank Math, SEOPress, AIOSEO, The SEO Framework o
    Slim SEO (filtro `ashlar_seo_enabled`). Extractos de las 7 páginas en la BD
    y en `inc/demo.php`, que además ahora importa `careers.html` (no estaba en
    la lista). seo-check --crawl: de 21 errores a 0; quedan avisos de títulos
    cortos e imágenes decorativas.
  - ✅ **Accessibility statement** (página #16, plantilla page-legal, bloques del
    core como Privacy/Cookies, con el aviso `legal-notice`): objetivo WCAG 2.2
    AA, lo que se puede esperar (todo verificado en el código: skip link,
    menú `<dialog>`, carrusel/antes-después/pestañas con teclado, contraste,
    reflow a 320, objetivos de 24 px, alt, movimiento reducido, formulario
    accesible sin CAPTCHA, sin JS), limitaciones honestas (texto sobre fotos
    revisado a ojo; sin pruebas con usuarios con discapacidad), contacto,
    cómo se probó y revisión en abril de 2027. `accessibility-statement.html`
    + añadida al bucle de contenido de `inc/demo.php`.
  - Git: lo inicializa y gestiona la persona.
  - ✅ **Seguridad** (wp-security-reviewer, 31 oct; nada explotable en el código
    nuevo). Aplicado: `.htaccess` del tema que da 404 a rutas con punto
    (`.claude/`, `.playwright-mcp/` con el perfil y la sesión del navegador de
    pruebas, `.git*`) y a `node_modules/`; `.distignore`; en `inc/front.php`,
    sin enumeración de usuarios (REST `/wp/v2/users` sin sesión, `?author=` sin
    redirección, oEmbed sin autor, autor del feed = nombre del sitio) y sin
    XML-RPC/pingback; `inc/seo.php` no expone extracto ni imagen de contenido
    con contraseña y usa `esc_url` en URLs; panel de páginas del escritorio con
    `perm => readable`; `option_page_capability_ashlar_options_group` →
    `edit_theme_options` (el rol Client no podía guardar Opciones); Reply-To
    solo con el email; `wp-diagnose.php` solo por CLI.
    Pendiente de la persona: mover `userDataDir`/`outputDir` de
    `.claude/playwright-mcp.config.json` fuera del tema; el servidor local es
    Apache 2.4.33 (no Herd) escuchando en `0.0.0.0:80` con listados de
    directorios. Pendiente (toca marcado): honeypot `name="company"` del
    formulario, que el autorrelleno puede rellenar → nombre no semántico.
  - ⚠️ **Incidente KSES** (31 oct, corregido): un script de consola puso los
    extractos con `wp_update_post` sin usuario y KSES borró de Home, Services,
    About, Careers y Contact todos los `<svg>`, el range del antes/después, el
    `<form>` del presupuesto y `sizes`/`fetchpriority`. Restaurado desde
    `tools/content/*.html` (mismo mapeo de fotos que el importador) como
    administrador; las 10 páginas coinciden con sus ficheros. Regla: por
    consola, `wp_set_current_user(admin)` antes de escribir contenido.
  - **Rendimiento** (perf-auditor, 31 oct). Bien: JS ~57 KB gzip sin
    duplicados, fuentes, hero LCP = FCP en escritorio, CLS de carga 0,
    friday-report sin JS. Por hacer: (1) `pinType: 'transform'` en los pins de
    projects-carousel y process (CLS con scroll 3,5–5,0 → 0); (3) `strategy:
    defer` en los scripts compartidos de `inc/enqueue.php` (bloquean en
    <head>); (4) loader: saltarlo o acortarlo con red/CPU lentas (añade ~2,4 s
    en la primera visita); (5) sin zoom ni cortinilla en fotos ya visibles al
    montar (LCP de Services 2,8 s); (6) WebP; (7) fotos 2–5 de service-stack
    con prioridad baja; (8) ceder el hilo en `mountAll`. Entorno local (no del
    tema): Apache sin gzip ni caché, HTTP/1.1, TTFB 0,3–0,5 s.
  - ✅ **Correcciones de las auditorías aplicadas** (31 oct):
    - Responsive (responsive-auditor: 0 overflow en 108 combinaciones):
      hero de la Home con `--photo-h: clamp(13rem, 55svh, 30rem)` (en móvil
      apaisado el `h1` quedaba fuera); «How it works» en pestañas con columnas
      2fr/3fr hasta 1440 y la foto con proporción 4/5 fija (sticky) en vez de
      estirada (salía ×2 pixelada a 1024×768 y 1366×768); 404 con la habitación
      ≤ 60svh de alto; barra del menú móvil sticky; filas del cartel apiladas
      hasta xs; importes del coste sin ancho fijo hasta md; datos de servicio
      alineados; notas del programa con fondo; `max-width: 62ch` en callout,
      FAQ y photo-panel; `--section` acotado con `min(…, 14svh)` en theme.json.
      Pendiente: 404 en apaisado aún pide un scroll; fotos a sangre con
      originales de ≤ 1376 px (se ven blandas a 1920 y en retina).
    - Rendimiento: `pinType: 'transform'` en los pins (CLS con scroll de la
      Home 4,74 → 0); `strategy: defer` en los scripts compartidos (ninguno
      bloquea); loader saltado si la app arranca después de 1,2 s o con
      `saveData`; fotos `data-media-reveal` ya visibles al montar sin
      cortinilla (LCP de Services en visita repetida 0,58 s; en la primera
      visita manda el loader, 2,9 s). Pendiente: WebP, prioridad baja en fotos
      2–5 de service-stack, ceder el hilo en `mountAll`.
    - Formulario: campo trampa `qf_hp` (antes `company`, que el autorrelleno
      podía rellenar) y ejemplo de código postal «e.g. NW3 2AB». Contact
      regenerada; probado: con la trampa rellena responde 303 y no guarda.
    - `responsive-check` aplica ya la excepción «inline» de WCAG 2.5.8 a los
      enlaces dentro de un párrafo (daba falsos positivos en las legales).
    - **Loader**: no sale en táctil (`hover: none`) ni con `saveData`; en
      escritorio con ratón, igual que antes (decisión en el script de <head>
      de `inc/front.php`). OJO: Chromium headless se declara `hover: none`,
      así que las herramientas headless (perf-check, responsive-check) ya no
      ven el loader; para revisarlo, `?loader` o el navegador de Playwright.
    - **WebP** (`inc/theme-setup.php`: `image_editor_output_format` jpeg→webp,
      calidad 75). En WordPress 7 convierte TAMBIÉN el original: el adjunto
      pasa a apuntar a `<nombre>.webp`. Se regeneraron las 26 fotos importadas
      (intermedios de 8,1 a 4,9 MB, −40 %) y se cambiaron en `post_content`
      las URL .jpg por .webp (Home, Services, About, Contact, Elm Row; con
      `$wpdb`, sin KSES): sin ese cambio el contenido se quedaba sin srcset
      (el nombre del src no coincidía con los metadatos). En una importación
      nueva cuadra solo (el importador usa `wp_get_attachment_url`). Home
      móvil: 797 → 689 KB.
  - Nota de pruebas: en la Home, `a11y-check` con la espera por defecto (3 s)
    puede medir el cartel a medio entrar (fondo #bbb9b6, contraste 4,39) en
    la primera visita; con `--wait=7000` da 0 violaciones.
  - ✅ **Antetítulos de sección** (global, solo CSS): mixin `t-chapter` en
    `tools/_text.scss`, usado por `.chapter` y por los `__eyebrow` de
    callout, case-study, cost-guide, faq, numbered-grid, page-intro,
    photo-panel, quote, team y timeline. Siguen en mono los rótulos que son
    datos (project-header, projects-grid, fin del carrusel, not-found).
  - Siguiente: About, Services, Contact, Projects/fichas y Journal, una a una
    con su propuesta en `.claude/copy/<página>.md`. Antes de cambiar valores
    por defecto de un bloque, comprobar qué contenidos dependen de ellos
    (también proyectos: `wp-diagnose --block` no mira el tipo `project`). El
    diseño (menos rótulos mono) va después de los textos.
- `build/css/main.css` pesa 122 KB (18,7 KB gzip) y webpack avisa del límite
  de 244 KB porque suma también main-rtl.css. Valorar CSS por bloque
  (solo donde se usa) en la auditoría de rendimiento.

- ✅ **Escritorio y login con la marca** (29 oct), adaptados de Raíz:
  - `inc/admin.php`: portada propia (Ashlar → Home, a la que redirige
    `index.php` salvo con `?wp-dashboard=1`), accesos rápidos, lista de
    páginas, guía corta, rol Client, menú y barra superior limpios,
    comentarios desactivados. La portada se pinta en el idioma del sitio
    (`switch_to_locale`) para que la fecha y «2 hours ago» casen con los textos
    del tema, que solo están en inglés; el resto de wp-admin sigue en el idioma
    del perfil.
  - `inc/login.php` + `src/admin/login.{js,scss}`: fotos de proyectos con su
    nombre y barrio (o las de Opciones → Login screen), saludo según la hora,
    error de acceso unificado, redirección a Home.
  - `src/admin/admin-colors.scss` (esquema «Ashlar») y `admin.scss` con el
    vocabulario del tema: Archivo 600, `<em>` en tono apagado sin cursiva,
    botones rectangulares Hanken 600, rótulos IBM Plex Mono (`t-label`).
    Los `font-size` en rem de `admin.scss` siguen la escala de wp-admin
    (13 px), no la fluida de la web: excepción aceptada.
  - Playwright saca en blanco la captura de página entera del login (las
    fotos en fundido); la del viewport es la buena.
- ✅ **`.claude/` alineado con Ashlar** (29 oct):
  - `scaffold-block.mjs`: tonos light/subtle/dark, textos en inglés, `t-lead`,
    foto de Ashlar, sin `style-vars.js` ni `--prefix`. Probado: genera un
    bloque estático y uno dinámico que compilan, se registran y validan.
  - `rules/bloques.md`, `rules/php.md`, `rules/scss.md`, `calidad-web.md` y
    CLAUDE.md describen los bloques reales (SectionTheme, RichText en el
    lienzo, etiquetas fijas, `ASHLAR_NON_PAGE_BLOCKS`, prefijo `ashlar_`).
  - Skill `figma-gutenberg-block` reescrita (era de Kanat: controles por
    texto); `bloque-responsive` pasa a mobile-first con `up()` y los dos
    frames de Figma (390/1440).
  - Agentes y skills de auditoría con los puntos calientes de Ashlar (menú
    `<dialog>`, carrusel, antes/después, quote, paleta corten) en vez de los
    de Raíz (Splide, CF7/MailerLite, bronce/arena, GSAP duplicado).
  - `bundle-report`: firmas internas de GSAP/ScrollTrigger/Lenis y
    `build/vendor/` como copia compartida (antes daba vendor-duplicated falso).
  - `responsive-check`: ignora lo que desborda dentro de un padre que lo
    recorta o desplaza (chips, carrusel, visually-hidden); informe en
    `.claude/reports/responsive/`.
  - `a11y-check`: espera 3 s antes de axe (`--wait`); Contact ya sin el falso
    contraste.
  - Hook `check-scss-tokens`: sin la excepción de MailerLite y con los tokens
    reales (`--radius-*`, variables del tono, mixins `t-*`).
  - Borrado `src/scss/tools/_form-controls.scss` (0 usos) y su `@forward`.
- ✅ **Projects, tarjeta destacada a 1024–1300** (29 oct; lo destapó el
  `responsive-check` corregido): la foto iba fija a `50rem` y la ficha se
  quedaba en 16 px (la página desbordaba 72 px a 1024). Ahora
  `minmax(0, 25fr) minmax(0, 12fr)` (800 : 384 del Figma): a 1440 igual que
  antes; a 1024, 551 + 265. 0 issues en los 7 anchos.
- `projects-grid/style.scss` aún usa `@include down(md)` en tres sitios
  (el tema es mobile-first): revisarlo en la auditoría responsive.
- ✅ **README del tema reescrito para Ashlar** (29 oct): misma estructura
  que el de Raíz, con el contenido real (Figma, fuentes, tonos, 43 bloques
  por página, seed/Demo content, formulario por admin-post, Options, rol
  Client). Las referencias «Ashlar → Demo content» pasan a «Options → Demo
  content», que es donde cuelga en el menú.
- **Animaciones GSAP** (29 oct, en curso; el usuario las pasa una a una),
  antes de las auditorías:
  1. ✅ **Loader «Marca en obra»**, solo en la primera página de la sesión:
     `inc/front.php` (decisión en el script de `<head>` + markup en
     `wp_body_open`), `src/scss/layout/_loader.scss`,
     `src/js/modules/loader.js` y `app.js` (`runLoader(mountAll)`). `?loader`
     lo fuerza para revisarlo. Probado: secuencia y tiempos (~3 s hasta
     descubrir), sin salto al aparecer la barra de scroll (ancho 100vw),
     intro y reveal sincronizados con el telón, sesión, movimiento reducido,
     sin app.js (red de seguridad a 4 s), 390 px, sin errores de JS.
  2. ✅ **Botones: relleno direccional** (recurso de Osmo «Directional Button
     Hover»), mismas curvas, tiempos y fórmula. Adaptado sin cambiar el
     markup guardado: el círculo es `.btn::before` (color `--b-bg-hover` de
     cada variante) y `src/js/modules/buttons.js` pone `--btn-x/y/size` con
     eventos delegados en `document` (sirve también para los botones de
     PHP). Teclado y sin JS: desde el centro. Curva nueva en `theme.json`
     (`ease.fill` → `--ease-fill`). En el editor el relleno está oculto
     (`editor/index.scss`). Radio: se mantiene `--radius-sm` (2 px, Figma).
     El usuario prefiere el relleno sutil del Figma (corten-500 → 600).
  3. ✅ **Horizontal scroll en projects-carousel** (solo `view.js` y
     `style.scss`; save.js intacto). ≥ 1024 px con hover y movimiento: pin
     centrado + `scrub` (`motion.scrub`), recorrido 1:1, `.is-pinned` quita el
     overflow de la pista (con `min-width: 0`, si no la rejilla la ensancha) y
     encoge la tarjeta en pantallas bajas (`(100svh - 26rem) * 1.27`).
     Contador y barra desde el `onUpdate` del tween (el del ScrollTrigger va
     adelantado con scrub). Flechas, ← →, arrastre y foco con tabulador
     mueven la página. `ScrollTrigger.sort()` + `refresh()` para que lo de
     debajo cuente con el pin (comprobado). Arreglado de paso: el arrastre
     nativo del enlace/foto cortaba el arrastre del carrusel (`dragstart`).
  4. ✅ **Horizontal scroll en process** (decidido: «compacto donde quepa»).
     Tercer modo `hscroll` en `view.js` (además de pestañas y acordeón) si
     `fits()`: pestañas + panel compacto (`.is-hscroll` en style.scss) ≤ alto
     de la ventana − barra de admin − cabecera − 32 px. Cabe a 1440×900
     (incluso conectado: 746 de 756) y 1920×1080; a 1280×800 y 1024×768 se
     queda en pestañas. Paneles apilados en la misma celda (`grid-area: 2/1`)
     y movidos con `x`; pin `top top+=cabecera`. El snap de ScrollTrigger
     falla con Lenis (encaja a mitad del suavizado): encaje propio con
     `lenis.on('scroll')` + espera de 160 ms y umbral del 20 %. Pestañas
     ARIA intactas; paneles fuera de vista `inert`. Se reevalúa al
     redimensionar, con las fuentes y con el interruptor de animaciones.
     axe y responsive-check de la portada limpios.
- Auditorías con las skills (al final, para que cubran también las
  animaciones): `/a11y-audit`, `/seo-audit`, `/perf-audit`,
  `/responsive-check`, `/security-audit` sobre ashlar.local.
- `git init` y primer commit cuando el tema esté estable.
- Borrar `C:\Desarrollo\Javier\Work\Ashlar\.ashlar-theme-sync.tgz` (paquete de
  sincronización de la sesión anterior; ya no hace falta).

## Detalles que conviene saber

- `theme.json` no tiene generador: se edita a mano con los tokens del Figma.
- El minificador de CSS reescribe mal los `calc()` anidados con división
  (`100% / (4 * (n - 1))` salía como `100%/(n - 1)*4`): precalcula el divisor
  en una custom property (ver `timeline/style.scss`) y revisa `build/css/main.css`.
- En rejillas de tarjetas, si cada tarjeta es a su vez `display: grid`, pon
  `align-content: start`: si no, el alto sobrante de la fila se reparte entre
  sus filas y los textos quedan descolgados (pasó en numbered-grid y team).
- Contenedor 90rem, gutter fluido 16→80; tipografía fluida 390→1440.
- Los textos de cabecera/pie y datos de contacto están en Ashlar (ajustes,
  `inc/settings.php`); los menús en Apariencia → Menús.
- `project-cost` calcula porcentajes y totales; el titular «Where the £… went»
  es texto: si cambian las cifras, cambia también el titular.
- `project-header`: «Project 010 of 10» es la posición por fecha
  (el más antiguo es el 1).
- Páginas legales (31 oct): Privacy y Cookies llevan texto de demo que deja
  claro en todo momento que Ashlar es ficticia (`tools/content/privacy.html` y
  `cookies.html`, importadas por `inc/demo.php`; bloques del core, el aviso
  inicial con la clase `legal-notice`). Describen lo que hace el sitio de
  verdad: sin cookies para visitantes, solo `ashlar-loaded` en sessionStorage,
  formulario → Messages + email, IP en hash 10 min. Si se añade analytics o se
  pinta el interruptor de animaciones (`ashlar-motion` en localStorage; hoy
  no hay ningún `[data-motion-toggle]` en el HTML), actualiza Cookies.
  Accessibility statement sigue vacía.
