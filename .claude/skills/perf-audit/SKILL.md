---
name: perf-audit
description: >
  Auditoría de rendimiento: (1) perf-check mide en una URL con Playwright TTFB,
  FCP, LCP y su elemento, CLS y sus fuentes, tareas largas, peso por tipo de
  recurso, scripts bloqueantes, imágenes sin dimensiones/sobredimensionadas/
  lazy mal puesto, font-display y preload, tamaño del DOM, terceros y errores
  de consola, con opción de emular móvil y red 3G; (2) bundle-report analiza
  build/ (raw + gzip por fichero) y detecta GSAP/Lenis embebidos en un
  view.js (además de la copia compartida de build/vendor/) y builds de
  desarrollo. Úsala cuando se hable de velocidad, Core Web
  Vitals, Lighthouse, PageSpeed, peso, "va lento", bundles o antes de publicar.
  Solo detecta; corregir es un paso aparte.
argument-hint: "<url> [--mobile --throttle --runs=3]"
allowed-tools: Bash(node .claude/skills/perf-audit/scripts/*), Bash(npm run build), Read, Grep, Glob
---

# Auditoría de rendimiento

## Ejecutar

```bash
# Página (mediana de N cargas; --mobile --throttle para el escenario realista)
node .claude/skills/perf-audit/scripts/perf-check.mjs <url> [--runs=3] [--mobile] [--throttle] [--out=dir]

# build/ (no necesita navegador; compila antes si no existe)
node .claude/skills/perf-audit/scripts/bundle-report.mjs [--top=15]
```

Informes en `.claude/reports/perf/report.json` y `bundle-report.json`.
Ejecuta los dos: la página dice **qué** va lento; el bundle dice **por qué**.

## Interpretar

Objetivos: LCP < 2,5 s · CLS < 0,1 · FCP < 1,8 s · TBT < 200 ms · JS < 300 KB ·
CSS < 100 KB · imágenes < 1 MB · fuentes < 200 KB · DOM < 1500 nodos.

| Hallazgo | Origen habitual en este tema | Corrección canónica |
|---|---|---|
| `vendor-duplicated:gsap` / `:scrolltrigger` / `:lenis` | un `view.js` importó la librería por otra ruta (`gsap/dist/…`, con llaves…) y webpack la embebió | importar por defecto desde el nombre compartido (`import gsap from 'gsap'`); `SHARED` en `webpack.config.js` la sustituye por la externa de `inc/enqueue.php` |
| `dev-build` | `build/` viene de `npm start` | `npm run build` antes de subir |
| `lcp-*` con la foto de cabecera (`home-hero`, `project-hero`, `page-intro`) | `Media` sin `priority` → `loading="lazy"` | `priority` en esa foto (`eager` + `fetchpriority="high"`) |
| `cls-*` / `img-no-dimensions` | foto guardada sin `width/height` (contenido antiguo o de demo); fuentes con `swap` sin `size-adjust` | volver a elegir la foto en `MediaField` (guarda las dimensiones); `aspect-ratio` en el contenedor |
| `fonts-maybe-404` / `font-display` | ruta de `src/assets/fonts/` en `theme.json` o en el preload de `inc/front.php` que no coincide | WOFF2 en `src/assets/fonts/`, `fontDisplay: swap`, preload solo de lo que pinta el primer pantallazo |
| `render-blocking-scripts` | scripts de plugins o `wp_enqueue_script` sin `in_footer` / `strategy: defer` | `wp_enqueue_script(..., ['strategy' => 'defer'])` |
| `many-stylesheets` / `inline-css-heavy` | core de WP (`wp-block-library`, global styles, `classic-theme-styles`, emojis) | desregistrar en `inc/enqueue.php` lo que no se use |
| `img-oversized` / `img-legacy-format` | imágenes subidas a tamaño original sin `srcset` | `wp_get_attachment_image` con `sizes`; WebP/AVIF en subida |
| `ttfb-slow` en local | Herd sin caché de objetos | ignorar; comparar con un servidor real |
| `console-errors` | `view.js` fallando (GSAP sin target, `onPage()` sin el contenedor del bloque) | ver `browser_console_messages` |

## Reportar

1. Métricas medidas (tabla métrica · valor · objetivo · veredicto).
2. Hallazgos ordenados por **KB o ms ahorrados por hora de trabajo**, con origen
   y corrección concreta.
3. Plan en 3 pasos.
4. Lo que no es del tema (hosting, caché, CDN).

No recomiendes plugins de optimización como primera opción cuando la causa está
en el tema. Delegar en el agente `perf-auditor` para un análisis completo.
