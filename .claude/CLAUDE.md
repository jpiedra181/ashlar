# Tema Ashlar — contexto para Claude Code

Tema WordPress **FSE** a medida para Ashlar (design & build en Londres), con
bloques Gutenberg propios en React (namespace `ashlar/`), compilado con
`@wordpress/scripts`. Nace del tema Raíz (misma arquitectura). La
documentación completa está en @README.md. Aquí, solo lo que Claude necesita
para no equivocarse.

**La referencia de diseño es el Figma de Ashlar**
(`XRdk3LtiAg84GOAvCgmKCh`): páginas Desktop y Mobile, componentes en
Components y variables en Foundations. `theme.json` recoge esos tokens
(paleta stone/corten, tipos Archivo · Hanken Grotesk · IBM Plex Mono, tamaños
fluidos 390→1440, espaciados); si cambia un token en Figma, se cambia allí.

**Estado del trabajo y próximos pasos:** @.claude/HANDOFF.md

**Textos de la web:** antes de escribir cualquier texto que lea un visitante,
lee `.claude/PERSONA.md` (quién habla, a quién, tics prohibidos). La regla
`.claude/rules/voz.md` lo recuerda en los ficheros con texto.

**Idiomas:** la web y la interfaz del editor, en inglés (cliente británico);
comentarios de código y commits, en español.

## Comandos

```bash
npm ci            # instalar (versiones exactas)
npm run build     # compilar producción → build/ (lo que WordPress lee)
npm start         # compilar desarrollo con watch (NUNCA subir ese build)
npm run lint:js   # / lint:css (informativos)
php tools/seed.php  # contenido de demo (= Options → Demo content en wp-admin)
```

## Reglas que rompen cosas si se ignoran

1. **`build/` es generado.** No se edita (hook lo bloquea), no está en Git.
   Cambios en JS/SCSS/`block.json` → `npm run build`. Cambios en PHP → no.
2. **Antes de cambiar un `save.js` publicado, congela el markup en
   `deprecated.js`**: `node .claude/skills/deprecated-save/scripts/freeze-save.mjs <slug> --write`.
   Si no, "Este bloque contiene contenido inesperado" en cada página.
3. **`edit.js` y `save.js` deben generar el mismo markup** (mismos
   componentes y clases; los `data-*` de animación, solo en `save.js`).
4. **Sin valores de marca a mano en SCSS**: tokens de `theme.json` vía
   `var(--color-*)`, `var(--font-size-*)`, `var(--space-*)`, `var(--radius-*)`.
   OJO: WordPress pasa los slugs a kebab-case (`h1` → `--wp--preset--font-size--h-1`);
   los alias de `src/scss/config/_aliases.scss` ya lo resuelven.
   Mobile-first con `@include up(bp)`. Contenedor: `@include container` (= `.wrap`).
5. **Tonos de sección**: claro (por defecto), `.theme-subtle` y `.theme-dark`
   redefinen `--bg --surface --fg --fg-soft --fg-muted --accent --line --line-strong --btn-*`. Dentro de un
   bloque se usan SIEMPRE esas variables semánticas, nunca un color de paleta
   directo, para que funcione en los tres temas.
6. **Librerías compartidas**: `import gsap from 'gsap'`, `ScrollTrigger`,
   `SplitText`, `Lenis` y `@ashlar/app` (window.ashlar) NO se empaquetan: son
   scripts de WordPress registrados una vez (webpack.config.js +
   inc/enqueue.php). Importa por defecto (`import gsap from 'gsap'`), no con
   llaves.
7. **Animaciones**: con atributos (`data-reveal`, `data-split`, `data-rise`, `data-media-reveal`,
   `data-parallax`, `data-draw`, `data-words`) basta; las monta
   `src/js/modules/animations.js`. Un view.js propio registra su lógica con
   `onPage()` de `@ashlar/app` para respetar el interruptor «Animaciones».
8. **No hay allowlist manual de bloques**: `inc/blocks.php` auto-registra
   `build/blocks/*/block.json` e `inc/gutenberg.php` deriva la lista.
9. **Bloques de sección = experiencia de cliente.** Textos con RichText en el
   lienzo, fotos con `Media` + `MediaField` (alt + punto focal), enlaces con
   `LinkField`, listas con `components/repeater`, color con `SectionTheme`.
   Contenido de prueba: créalo en el editor con `createBlock()` (nunca HTML a
   mano para bloques estáticos).
10. **Los menús se editan en Apariencia → Menús** y los datos globales en
   Opciones (`inc/settings.php`, esquema declarativo); `parts/*.html` solo
   colocan bloques dinámicos. Si la BD tiene una copia "custom" de la part, el
   fichero no se usa.
11. **Nada de comentarios HTML dentro de grupos en `templates/` y `parts/`**:
   el Editor del sitio los compara con el `save` del grupo y marca
   «contenido inesperado». Documenta con `"metadata":{"name":"…"}`.
12. **Bloques híbridos** (projects-carousel, project-hero): `save.js` guarda los
   textos y un hueco vacío con `data-*`; `render.php` lo rellena (`$content`).
   Los dinámicos de la ficha del proyecto usan `ashlar_block_project($block)` y,
   en el editor, `ServerSideRender` con `urlQueryArgs: { post_id }`.

## Estructura mínima

```
src/blocks/<slug>/     block.json · index.js · edit.js · save.js (o render.php) ·
                       style.scss · [view.js] · [deprecated.js] · [style-vars.js]
src/components/        button · media · media-field · link-field · chapter · repeater ·
                       section-theme · block-icons · icons · editor-assets ·
                       intro-title · project-card (solo estilos)
src/admin/editor/      guía de bienvenida y puntos de partida («¿Cómo quieres empezar?»)
src/js/                app.js (global, window.ashlar) · lib/ · modules/
src/scss/              config (tokens) · tools (mixins) · elements · layout · blocks/index.scss
inc/                   helpers · settings · projects · messages · theme-setup · menus ·
                       enqueue · front · seo · blocks · gutenberg · admin · login · svg
templates/ parts/      plantillas FSE y header/footer
inc/demo.php           importador de demo (Options → Demo content); tools/seed.php lo lanza por consola
tools/content/         proyectos de demo (projects.php) y marcado de páginas generado por los bloques (*.html)
theme.json             tokens del diseño (Figma → Foundations)
```

## Entorno

- Local: `http://ashlar.local` (Laravel Herd en Windows; PHP de Herd, sin WP-CLI).
  Diagnóstico sin WP-CLI: `php .claude/skills/wp-local/scripts/wp-diagnose.php`.
- La carpeta del tema NO es todavía un repositorio Git: la regla del
  `deprecated.js` (freeze-save.mjs compara con HEAD) no aplica hasta el primer
  commit. Ningún bloque está publicado en producción.
- Si el insertador sale vacío: casi siempre el tema activo no es `ashlar` o
  falta `build/`.

## Herramientas de `.claude/` (ver @.claude/README.md)

- **Skills:** `/site-audit`, `/seo-audit`, `/a11y-audit`, `/perf-audit`,
  `/security-audit`, `/responsive-check`, `/bloque-responsive`,
  `/figma-gutenberg-block`, `/nuevo-bloque`, `/deprecated-save`, `/wp-local`,
  `/pre-release`.
- **Agentes:** `seo-auditor`, `a11y-auditor`, `perf-auditor`,
  `wp-security-reviewer`, `responsive-auditor`, `block-reviewer`. Solo auditan;
  las correcciones se hacen en la sesión principal.
- **Hooks:** bloqueo de `build/`, aviso al tocar `save.js` sin `deprecated.js`,
  aviso de hardcodes en SCSS, estado del entorno al arrancar.
- **Reglas por ruta:** `.claude/rules/` (bloques, scss, php, calidad-web).

## Cómo trabajar

- Ajuste quirúrgico sobre lo que ya funciona; no reescribas bloques enteros ni
  "mejores" cosas no pedidas.
- Las auditorías detectan; corregir es un paso aparte que decide la persona.
- Español en comentarios y commits (`feat: …`, `fix: …`); textos de la web y
  de la interfaz del editor, en inglés (`__('…', 'ashlar')`).
