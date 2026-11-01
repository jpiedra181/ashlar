<?php

/**
 * Menus
 * Puente entre los menús clásicos (Apariencia → Menús) y los bloques que los
 * pintan: `ashlar/header-menu` en la cabecera y `ashlar/nav-menu` en las
 * columnas del pie.
 *
 * Las ubicaciones se registran en theme-setup.php.
 */

defined('ABSPATH') || exit;

/**
 * Publica las ubicaciones de menú registradas en el editor de bloques.
 *
 * Los desplegables del inspector de cada bloque las leen de aquí en lugar de
 * llevar cada uno su propia copia: registrar una ubicación nueva en
 * theme-setup.php basta para que aparezca en el editor, sin tocar el JS ni
 * recompilar.
 *
 * Se cuelga del script de configuración del editor porque ese handle se encola
 * siempre (ver gutenberg.php) y no depende de cómo WordPress derive el handle
 * del `editorScript` de un bloque.
 */
add_action('enqueue_block_editor_assets', 'ashlar_nav_menu_editor_data', 20);

function ashlar_nav_menu_editor_data(): void
{
    wp_add_inline_script(
        'ashlar-editor-config',
        'window.ashlarNavMenuLocations = ' . wp_json_encode(get_registered_nav_menus()) . ';',
        'before'
    );
}

/**
 * Nombre del menú asignado a una ubicación.
 *
 * Es el título que pintan las columnas del pie: así el cliente cambia el
 * rótulo y los enlaces en el mismo sitio (Apariencia → Menús) sin pisar el
 * Editor del sitio.
 *
 * @param string $location Ubicación registrada.
 * @return string Nombre del menú, o cadena vacía si la ubicación está libre.
 */
function ashlar_nav_menu_name(string $location): string
{
    $locations = get_nav_menu_locations();
    $menu      = wp_get_nav_menu_object($locations[$location] ?? 0);

    return $menu ? $menu->name : '';
}
