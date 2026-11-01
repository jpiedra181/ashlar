---
name: deprecated-save
description: >
  Aplica "la regla del deprecated.js" del README: antes de cambiar el markup de
  un save.js de un bloque estático ya publicado, congela la versión actual (git
  HEAD) como entrada de deprecated.js con sus attributes/supports de ese
  momento, para que WordPress migre el contenido guardado sin "Este bloque
  contiene contenido inesperado". Úsala SIEMPRE que se vaya a tocar un save.js
  existente, cuando el hook guard-save-js pregunte, cuando aparezca el error de
  contenido inesperado, o cuando se cambie el HTML de un componente compartido
  de src/components/ (invalida los deprecated que lo importan).
argument-hint: "<slug> [--write]"
allowed-tools: Bash(node .claude/skills/deprecated-save/scripts/*), Bash(php .claude/skills/wp-local/scripts/*), Bash(git diff:*), Bash(git log:*), Bash(git show:*), Read, Edit, Write
---

# Congelar `save.js` en `deprecated.js`

## 1. ¿Hace falta?

```bash
php .claude/skills/wp-local/scripts/wp-diagnose.php --block=ashlar/<slug>
```

Si el bloque **no está en ningún contenido** (ni páginas, ni entradas, ni
plantillas en BD), puedes cambiar `save.js` sin deprecated. Si el sitio local
no está levantado o el contenido de producción difiere, asume que **sí** está
publicado.

También hace falta si cambias el HTML de un componente de `src/components/`
que importe algún `deprecated.js` existente: ese deprecated deja de coincidir
y hay que escribir su markup a mano dentro del fichero.

## 2. Congelar

```bash
node .claude/skills/deprecated-save/scripts/freeze-save.mjs <slug>          # solo muestra
node .claude/skills/deprecated-save/scripts/freeze-save.mjs <slug> --write  # crea deprecated.js si no existe
```

- Congela la versión de **git HEAD** (`--ref=<commit>` para otra), no la del
  disco: así funciona aunque ya hayas empezado a editar `save.js`.
- Si `deprecated.js` ya existe, imprime el snippet: añádelo **al principio**
  del array (de más reciente a más antigua) y renombra la función si choca.
- Conéctalo en `index.js`:
  ```js
  import deprecated from './deprecated';
  registerBlockType(metadata.name, { edit: Edit, save, deprecated });
  ```

## 3. `migrate()` cuando cambian atributos

Si un atributo se renombra o desaparece, añade a la entrada:

```js
migrate: (attributes) => {
    const { oldName, ...rest } = attributes;
    return { ...rest, newName: oldName };
},
```

Si solo cambia el markup y los atributos son los mismos, no hace falta.

## 4. Ahora sí: cambia `save.js` y verifica

```bash
npm run build
```

Abre en el editor una página que use el bloque: debe cargar **sin aviso** y,
al guardar, escribir el markup nuevo. Recuerda (README): el deprecated evita el
error, pero el frontend sigue sirviendo el HTML viejo hasta que se **vuelva a
guardar cada página**. Lista las páginas afectadas con `wp-diagnose.php
--block=…` y dáselas al usuario.

Ejemplo real y comentado: `src/blocks/hero/deprecated.js`.
