---
name: seo-audit
description: >
  Auditoría SEO técnica y on-page de una o varias URLs (o de todo el sitio con
  --crawl) con Playwright: title/description (longitud y duplicados), canonical,
  robots/noindex, lang, viewport, h1 único y jerarquía de encabezados, Open
  Graph/Twitter, alt de imágenes, enlaces (sin texto, genéricos, href="#",
  rotos, http en https, _blank sin noopener), JSON-LD válido, robots.txt y
  sitemap, generator expuesto. Úsala cuando se pida revisar SEO, posicionamiento,
  metadatos, encabezados, "por qué Google no indexa", o antes de publicar.
  Solo detecta y prioriza; corregir es un paso aparte.
argument-hint: "<url> [--crawl] [--max=20]"
allowed-tools: Bash(node .claude/skills/seo-audit/scripts/*), Read, Grep, Glob
---

# Auditoría SEO

## Ejecutar

```bash
node .claude/skills/seo-audit/scripts/seo-check.mjs <url> [url2 …] [--crawl] [--max=20] [--out=dir]
```

- URL con credenciales si hay Basic Auth: `https://user:pass@host/`.
- `--crawl` sigue enlaces internos (hasta `--max`) para detectar títulos y
  descriptions duplicados.
- Informe en `.claude/reports/seo/report.json` (o `--out`).

Si el usuario no da URL: usa `localUrl` de `.claude/project.json` y comprueba
antes que responde (`curl -sI`). Si tampoco responde, audita el código
(plantillas, `save.js`, `render.php`) sin script.

## Interpretar

Severidades: `error` (bloquea indexación o accesibilidad básica), `warn`
(pierde posiciones o CTR), `info` (mejora). Para cada hallazgo, localiza el
**origen en el código** antes de proponer nada:

| Hallazgo | Dónde mirar |
|---|---|
| `h1-multiple` / `heading-skip` | etiqueta fija en el `save.js` / `render.php` del bloque (`h1` solo en `home-hero`, `page-intro`, `project-header`, `not-found`); `templates/*.html` (`core/post-title`) |
| `img-no-alt` / `img-empty-alt` | foto de contenido con el `alt` de `MediaField` vacío en la página (contenido, no código), o `alt` fijo en un `render.php` |
| `link-hash-only` | URLs por defecto vacías en `block.json` (`primaryUrl: ""`) → contenido sin rellenar en el editor |
| `link-no-text` | iconos sociales (`site-social`), flechas de carrusel, tarjetas enteras como `<a>` |
| `title-*` / `description-*` / `og-*` / `canonical-*` | los pone WordPress o el plugin SEO (Yoast/RankMath), no el tema. Comprueba que `wp_head()` está en la plantilla y que no hay plugin desactivado |
| `noindex` / `robots-disallow-all` | Ajustes → Lectura ("Disuadir a los motores"). Correcto en staging |
| `sitemap-missing` | Permalinks "plain" desactivan `/wp-sitemap.xml`; o el plugin SEO lo mueve |
| `jsonld-*` | plugin SEO o `inc/` con `wp_head` |
| `generator-exposed` | `remove_action('wp_head', 'wp_generator')` en `inc/theme-setup.php` |
| `broken-internal-links` | contenido del cliente o menús (Apariencia → Menús) |

## Reportar

1. Resumen en tres líneas (estado, lo más grave, lo más fácil).
2. Tabla priorizada: prioridad · hallazgo · origen · corrección · esfuerzo.
3. Separar **tema** / **contenido del cliente** / **plugin o servidor**.
4. Quick wins.

No cambies `save.js` sin la regla del `deprecated.js`. Para una revisión
más profunda o comparativa entre páginas, delega en el agente `seo-auditor`.
