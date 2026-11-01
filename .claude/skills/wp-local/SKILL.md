---
name: wp-local
description: >
  Diagnóstico del WordPress que sirve el tema, sin WP-CLI: qué tema está
  activo (el gotcha del "insertador vacío"), qué bloques ashlar/* están
  registrados y cuáles hay en src/ sin compilar, si header/footer se sirven del
  fichero o de una copia en la BD, menús asignados por ubicación, plugins
  activos y con actualización pendiente, usuario "admin", permalinks,
  WP_DEBUG, y en qué páginas se usa un bloque concreto (para saber si cambiar
  su save.js necesita deprecated). Úsala cuando "no veo los bloques", "el
  header no cambia", "¿dónde se usa este bloque?", "¿qué plugins hay?", o
  antes de tocar un save.js.
argument-hint: "[--block=ashlar/<slug>] [--json]"
allowed-tools: Bash(php .claude/skills/wp-local/scripts/*), Bash(php -l:*), Bash(curl -sI:*), Read
---

# Diagnóstico de WordPress (sin WP-CLI)

```bash
php .claude/skills/wp-local/scripts/wp-diagnose.php                 # estado general
php .claude/skills/wp-local/scripts/wp-diagnose.php --block=ashlar/hero   # + uso del bloque
php .claude/skills/wp-local/scripts/wp-diagnose.php --json          # salida para procesar
```

Arranca WordPress con `wp-load.php` (lo busca subiendo desde la carpeta del
tema; si no, `WP_LOAD=/ruta/wp-load.php`). Necesita que el sitio de **Local
esté arrancado** (MySQL). Si `php` no está en el PATH, el binario de Local está
en `%LOCALAPPDATA%\Programs\Local\resources\extraResources\lightning-services\php-*\bin\win64\php.exe`.

## Cómo leer la salida

| Síntoma | Línea que lo explica | Qué hacer |
|---|---|---|
| Insertador vacío / "tu sitio no incluye soporte para este bloque" | `¿este tema está activo? NO` | Apariencia → Temas → activar `ashlar` (WP solo ejecuta el `functions.php` del tema activo) |
| Ídem | `build/blocks existe: NO` | `npm run build` |
| Un bloque nuevo no aparece | `en src/ pero NO registrados` | compilar; si sigue, revisar `block.json` (`name`, JSON válido) |
| El header/footer no refleja `parts/*.html` | `Template parts en BD` con `⚠` | el fichero está sobrescrito por una copia "custom": revertir desde el Editor del sitio (o vía REST `?rest_route=/wp/v2/template-parts/ashlar//header&force=true`) |
| Columna del pie / menú vacío | `Menús: <ubicación> — sin asignar` | Apariencia → Menús → Gestionar ubicaciones |
| Paginación del blog o sitemap fallan | `permalinks: (plain…)` | Ajustes → Enlaces permanentes → "Nombre de la entrada" |
| Voy a cambiar `save.js` | `Uso de ashlar/x` | si está publicado → `/deprecated-save`; las páginas listadas hay que re-guardarlas después |
| Seguridad | `usuario "admin"`, `actualización disponible`, `WP_DEBUG: sí` | renombrar/crear otro admin, actualizar, desactivar debug en producción |

## Para producción

El script solo corre en la máquina donde está WordPress. Para el sitio live, lo
equivalente es la REST API con cookie + nonce (ver memoria del proyecto) o
pedir al responsable que lo ejecute en el servidor.

## Otras consultas ad hoc

Para preguntas que este script no cubre, escribe un PHP temporal en el
scratchpad que haga `require '<ruta>/wp-load.php';` y use la API de WP
(`get_posts`, `get_option`, `WP_Block_Type_Registry`…). Solo lectura salvo que
el usuario pida explícitamente cambiar algo, y entonces con backup previo.
