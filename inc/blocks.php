<?php

/**
 * Block Registration
 * Auto-discovers all block.json files inside build/blocks/
 * and registers each one with register_block_type().
 * WordPress reads the asset.php manifest for dependency handling.
 */

defined('ABSPATH') || exit;

/**
 * Da SOPORTE de spacing.padding (arriba/abajo) a TODOS los bloques del tema
 * (ashlar/*), de forma centralizada. Esto hace que WordPress registre el
 * atributo `style` y APLIQUE el padding (editor y front) al bloque. El control
 * de usuario NO es el nativo de "Dimensiones" (oculto: theme.json no habilita
 * settings.spacing.padding), sino un DESPLEGABLE custom con la escala de
 * spacing del tema, en src/admin/editor-config.js (panel "Espaciado del
 * bloque"), que escribe en style.spacing.padding. Si el cliente no lo fija,
 * manda el padding-block del SCSS del bloque; si lo fija, gana el inline.
 */
add_filter('register_block_type_args', 'ashlar_block_padding_support');

function ashlar_block_padding_support(array $args): array
{
    $name = $args['name'] ?? '';

    // Solo las secciones de página: las piezas de cabecera y pie no lo necesitan.
    // Tampoco «Pinned services»: es un contenedor (el aire lo ponen sus
    // servicios) y en el modo fijo un padding en línea taparía el hueco de la
    // cabecera.
    if (strpos($name, 'ashlar/') !== 0 || in_array($name, ASHLAR_NON_PAGE_BLOCKS, true) || $name === 'ashlar/service-stack') {
        return $args;
    }

    $supports = $args['supports'] ?? [];
    $spacing  = $supports['spacing'] ?? [];
    $spacing['padding'] = ['top', 'bottom'];
    $supports['spacing'] = $spacing;
    $args['supports'] = $supports;

    return $args;
}

add_action('init', 'ashlar_register_blocks');

function ashlar_register_blocks(): void
{
    $build_dir   = get_template_directory() . '/build/blocks';
    $block_files = glob($build_dir . '/*/block.json');

    if (empty($block_files)) {
        return;
    }

    foreach ($block_files as $block_json) {
        register_block_type(dirname($block_json));
    }
}
