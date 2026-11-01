---
name: pre-release
description: >
  Checklist de entrega del tema antes de subir a producción o abrir el PR
  final: build de producción limpio, lint, git limpio sin build/, save.js
  cambiados con su deprecated.js, auditoría completa (SEO, a11y, perf,
  seguridad, responsive) sobre la URL local, revisión de bloques del diff, y
  lista de páginas que hay que re-guardar. Úsala cuando se diga "vamos a
  subir", "release", "entregar", "deploy", "¿está listo?", "checklist final".
  No despliega nada; produce un informe de listo/no listo.
argument-hint: "[url-local]"
allowed-tools: Bash(npm run build), Bash(npm run lint:*), Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(node .claude/skills/*), Bash(php .claude/skills/wp-local/scripts/*), Read, Glob, Grep
---

# Checklist de entrega

Ejecuta en orden. Cada paso tiene un veredicto ✔/✘; al final, un resumen
**LISTO / NO LISTO** con lo que bloquea.

## 1. Código

```bash
git status --porcelain          # nada de build/ ni ficheros sueltos sin decidir
git log --oneline main..HEAD    # commits descriptivos (feat:/fix:), sin "update"/"cambios"
git diff --name-only main -- src/blocks   # ¿save.js sin deprecated.js?
```

- ✘ si aparece `build/` en el status (revisar `.gitignore`).
- Para cada `src/blocks/<x>/save.js` cambiado sin cambio en su `deprecated.js`:
  `php .claude/skills/wp-local/scripts/wp-diagnose.php --block=ashlar/<x>`;
  si está publicado → **bloqueante**, usar `/deprecated-save`.

## 2. Build

```bash
npm run build     # producción: sin .map, sin errores
npm run lint:js   # informativos hoy (README/CI): anotar solo errores nuevos
npm run lint:css
node .claude/skills/perf-audit/scripts/bundle-report.mjs
```

- ✘ si `bundle-report` marca `dev-build`.
- Anotar `vendor-duplicated` como deuda conocida (no bloquea salvo que haya
  empeorado respecto al informe anterior).

## 3. WordPress local

```bash
php .claude/skills/wp-local/scripts/wp-diagnose.php
```

- ✘ si el tema activo no es este, faltan bloques de `src/` en el registro, o
  header/footer están sobrescritos en la BD sin intención.

## 4. Auditoría del sitio

```bash
node .claude/skills/site-audit/scripts/run-all.mjs <url-local>
```

Lee `summary.md`. Bloquean la entrega: errores de accesibilidad de teclado/
nombres, `h1` ausente, imágenes de contenido sin `alt`, overflow horizontal en
cualquier breakpoint, errores de consola del propio tema, hallazgos de
seguridad "alta" en código. El resto se lista como deuda.

## 5. Revisión de bloques

Lanza el agente `block-reviewer` sobre `git diff main` (paridad edit/save,
tokens, controles, a11y del markup, `render.php`).

## 6. Producción (si hay acceso)

```bash
node .claude/skills/security-audit/scripts/site-headers.mjs https://user:pass@host/
node .claude/skills/seo-audit/scripts/seo-check.mjs https://user:pass@host/
```

- Comprobar que `noindex`/`Disallow: /` están **quitados** si ya es público.
- Comprobar cabeceras de seguridad y que `WP_DEBUG` está desactivado.
- Enviar una petición de prueba con el formulario de Contact (bloque `quote`):
  llega a Messages y el aviso por email sale con el SMTP del servidor.

## 7. Post-deploy (recordatorio para el usuario)

- Re-guardar las páginas listadas por `wp-diagnose --block=…` para cada bloque
  cuyo `save.js` cambió (el deprecated evita el error, no actualiza el HTML).
- Purgar caché de página/CDN.
- Si cambiaron `parts/*.html`, verificar que la BD no tiene copia "custom".

## Informe final

```
LISTO / NO LISTO
Bloqueantes: …
Deuda anotada: …
Páginas a re-guardar tras el deploy: …
```
