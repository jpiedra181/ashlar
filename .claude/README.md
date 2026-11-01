# `.claude/` — kit de trabajo con Claude Code para temas WordPress FSE

Esta carpeta es **reutilizable**: cópiala entera a otro tema con la misma
arquitectura (bloques Gutenberg en `src/blocks/`, `@wordpress/scripts`,
`theme.json` como fuente de verdad), cambia `project.json` y ya funciona.

```
.claude/
├── CLAUDE.md                 Contexto del proyecto que Claude lee al arrancar (importa @README.md)
├── project.json              ← LO ÚNICO que se cambia al copiar a otro proyecto (URLs, nombre, textdomain)
├── settings.json             Permisos (allow/ask/deny) + hooks
├── playwright-mcp.config.json  Config del MCP de Playwright (la carga /.mcp.json de la raíz)
├── rules/                    Instrucciones por ruta (se cargan solo al tocar esos ficheros)
│   ├── calidad-web.md        Siempre: mínimos de SEO/a11y/perf/seguridad/responsive y qué herramienta usar
│   ├── bloques.md            src/blocks/**, src/components/**  (deprecated, paridad, controles, a11y del markup)
│   ├── scss.md               src/scss/**, *.scss, theme.json   (tokens, mobile-first, gutter, focus, reduced-motion)
│   └── php.md                inc/**, render.php, templates/, parts/  (escapado, nonces, convenciones WP)
├── hooks/                    Scripts Node (multiplataforma) que ejecuta Claude Code
│   ├── guard-build-dir.mjs   PreToolUse: DENIEGA editar build/ y node_modules/
│   ├── guard-save-js.mjs     PreToolUse: PREGUNTA al editar un save.js publicado sin tocar deprecated.js
│   ├── check-scss-tokens.mjs PostToolUse: AVISA de hex/px/!important/max-width en SCSS
│   └── session-context.mjs   SessionStart: rama, estado de build/, sitio local, save.js en riesgo
├── agents/                   Subagentes especializados (solo auditan; no editan)
│   ├── seo-auditor.md · a11y-auditor.md · perf-auditor.md
│   ├── wp-security-reviewer.md · responsive-auditor.md · block-reviewer.md
├── skills/                   Procedimientos invocables con /nombre (o automáticamente por contexto)
│   ├── site-audit/           Todo en uno → summary.md                      scripts/run-all.mjs
│   ├── seo-audit/            Title/desc/canonical/h1/OG/alt/enlaces/sitemap  scripts/seo-check.mjs
│   ├── a11y-audit/           axe-core + Tab + estructura, desktop y móvil   scripts/a11y-check.mjs
│   ├── perf-audit/           Web Vitals + recursos + build/                 scripts/perf-check.mjs, bundle-report.mjs
│   ├── security-audit/       Escáner PHP/JS + cabeceras/exposición del sitio scripts/php-security-scan.mjs, site-headers.mjs
│   ├── responsive-check/     7 breakpoints, overflow y tap targets          scripts/check.mjs
│   ├── bloque-responsive/    Figma (4 modos) → CSS responsive de un bloque
│   ├── figma-gutenberg-block/ Normaliza un bloque existente a las convenciones
│   ├── nuevo-bloque/         Scaffold de bloque nuevo                       scripts/scaffold-block.mjs
│   ├── deprecated-save/      Congela save.js en deprecated.js               scripts/freeze-save.mjs
│   ├── wp-local/             Diagnóstico de WP sin WP-CLI                   scripts/wp-diagnose.php
│   └── pre-release/          Checklist de entrega
├── lib/audit-lib.mjs         Utilidades comunes de los scripts (Playwright con fallback a Chrome/Edge)
└── reports/                  Salida de las auditorías (gitignored)
```

## Uso rápido

| Quiero… | Hago |
|---|---|
| Una foto global del sitio | `/site-audit http://ashlar.local` → `.claude/reports/site-audit-<fecha>/summary.md` |
| Revisar solo un área | `/seo-audit <url>` · `/a11y-audit <url>` · `/perf-audit <url>` · `/security-audit [url]` · `/responsive-check <url>` |
| Un análisis profundo con criterio experto | "lanza el agente `a11y-auditor` sobre <url>" (o cualquiera de los seis) |
| Crear un bloque | `/nuevo-bloque <slug> "Título"` |
| Cambiar el markup de un bloque publicado | `/deprecated-save <slug>` **antes** de tocar `save.js` |
| Hacer responsive un bloque desde Figma | `/bloque-responsive` con las 4 node URLs |
| Saber por qué no veo bloques / dónde se usa uno | `/wp-local` (`--block=ashlar/<slug>`) |
| Entregar | `/pre-release` |

Los scripts también se ejecutan a mano:
`node .claude/skills/<skill>/scripts/<script>.mjs <url> [--out=dir]`.

## Requisitos

- Node ≥ 20 (`.nvmrc`) y `npm ci` hechos. `playwright` y `axe-core` llegan
  como dependencias transitivas de `@wordpress/scripts`; si faltan:
  `npm i -D playwright axe-core`.
- Navegador: los scripts usan el Chromium de Playwright y, si no está
  descargado, el **Chrome o Edge del sistema**. Para tener el de Playwright:
  `npx playwright install chromium`.
- PHP en el PATH para `wp-diagnose.php` (Local lo trae; ver la skill `wp-local`).
- El sitio de Local arrancado para auditar en local.

## MCP de Playwright

Configurado en `/.mcp.json` (raíz del tema) con `--config
.claude/playwright-mcp.config.json`: viewport 1440×900, `ignoreHTTPSErrors`,
`locale es-ES`, capacidad `vision`, y **perfil persistente** en
`.playwright-mcp/profile` (la sesión de wp-admin sobrevive entre sesiones de
Claude). Salidas en `.playwright-mcp/` (gitignored). Para modo headless,
cambia `launchOptions.headless` a `true`.

`settings.json` aprueba el servidor (`enabledMcpjsonServers`) y pre-autoriza
las herramientas de solo lectura (navegar, snapshot, captura, evaluar);
rellenar formularios, escribir texto, subir ficheros y `run_code_unsafe`
piden confirmación.

## Copiar a otro proyecto

1. Copia `.claude/` y `/.mcp.json`.
2. Edita `.claude/project.json` (nombre, carpeta del tema, textdomain,
   namespace de bloques, URLs local y producción).
3. Revisa `CLAUDE.md` (URLs, nombres de menú, particularidades) y, si el
   proyecto usa otro namespace que `ashlar/`, búscalo en `rules/`,
   `hooks/guard-save-js.mjs` y `skills/nuevo-bloque/scripts/scaffold-block.mjs`.
4. Si el tema no tiene `README.md` en la raíz, quita el `@README.md` de
   `CLAUDE.md` o crea uno.
5. `.claude/` está en `.gitignore` en este proyecto (decisión del equipo:
   documentación interna fuera del repo). Si en el nuevo proyecto se quiere
   versionar, quita esa línea; `reports/` sigue ignorado por su propio
   `.gitignore`.

## Principios de diseño de este kit

- **Detectar ≠ corregir.** Todos los scripts y agentes solo miden y reportan;
  cambiar código es una decisión de la persona, y se hace con la skill del
  área.
- **Cada hallazgo apunta a su origen en el código**, no solo al DOM.
- **Los hooks avisan, no estorban:** solo `build/` está bloqueado de verdad;
  lo demás es `ask` o contexto.
- **Nada de dependencias nuevas:** Node, Playwright (ya presente), axe-core (ya
  presente) y PHP.
- **Todo en español**, como el resto del proyecto.
