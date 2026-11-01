---
name: site-audit
description: >
  Auditoría completa de una URL en un solo comando: SEO, accesibilidad,
  rendimiento (página + bundles de build/), seguridad (sitio + código) y
  responsive en 7 breakpoints. Consolida todos los informes en un summary.md
  con los errores de todas las áreas arriba. Úsala cuando se pida "revisa la
  web", "auditoría", "qué hay que mejorar", "antes de entregar", "checklist de
  calidad", o cuando el usuario quiera una foto global sin ir skill por skill.
  Solo detecta; corregir es un paso aparte.
argument-hint: "<url> [--mobile --throttle --crawl --skip=perf,php]"
allowed-tools: Bash(node .claude/skills/site-audit/scripts/*), Read, Glob
---

# Auditoría completa del sitio

## Ejecutar

```bash
node .claude/skills/site-audit/scripts/run-all.mjs <url> [--mobile] [--throttle] [--crawl] [--skip=a,b] [--out=dir]
```

- Sin URL: usa `localUrl` de `.claude/project.json`; comprueba antes que
  responde. Para producción con Basic Auth: `https://user:pass@host/`.
- Tarda 2–4 minutos (7 breakpoints + 2 viewports de a11y + N runs de perf).
- Salida: `.claude/reports/site-audit-<fecha>/summary.md` + un JSON por área.
- `--skip` acepta: `seo`, `a11y`, `perf`, `bundle`, `security`, `php`, `responsive`.

## Después de ejecutar

1. Lee `summary.md` (no los JSON, salvo para profundizar en un área).
2. Presenta al usuario:
   - la tabla resumen por área;
   - los **5–10 hallazgos más importantes** de todo el sitio, cada uno con su
     origen en el código (usa las tablas "Interpretar" de cada skill:
     `seo-audit`, `a11y-audit`, `perf-audit`, `security-audit`,
     `responsive-check`);
   - qué es del tema, qué del contenido y qué del servidor/plugins;
   - una propuesta de orden de trabajo (impacto × esfuerzo).
3. **No corrijas nada** hasta que el usuario elija por dónde empezar. Cuando lo
   haga, usa la skill específica del área y, para cambios en bloques, recuerda
   la regla del `deprecated.js`.
4. Para un análisis profundo de un área concreta, lanza el agente
   correspondiente (`seo-auditor`, `a11y-auditor`, `perf-auditor`,
   `wp-security-reviewer`, `responsive-auditor`) en paralelo si son varias.

## Cuándo repetir

Tras cada tanda de correcciones, vuelve a ejecutar sobre la misma URL y compara
`summary.md` con el anterior (los informes se guardan con fecha). Antes de
entregar, `/pre-release` la ejecuta como parte del checklist.
