<?php

/**
 * Gutenberg Editor Customization
 * - Registers a custom block category for theme blocks.
 * - Enqueues the editor config JS (disables unwanted blocks, etc.).
 */

defined('ABSPATH') || exit;

/**
 * Categoría propia, la primera del insertador, con el nombre del sitio:
 * el cliente ve «Ashlar» y debajo solo las secciones de su web.
 */
add_filter('block_categories_all', 'ashlar_block_categories', 10, 2);

function ashlar_block_categories(array $categories): array
{
    return array_merge(
        [
            [
                'slug'  => 'ashlar',
                'title' => wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES) ?: __('Sections', 'ashlar'),
                'icon'  => null,
            ],
        ],
        $categories
    );
}

/**
 * Restrict the available blocks per context.
 *
 * - Páginas (landing): solo los bloques custom del tema (ashlar/*).
 * - Páginas con la plantilla «Página legal» (aviso legal, privacidad,
 *   cookies…): editor completo, para poder escribir el texto a mano.
 * - Entradas (posts) y resto de contextos (editor de plantillas, etc.):
 *   todos los bloques disponibles, para tener la experiencia de escritura
 *   completa (párrafos, imágenes, listas, citas…).
 */
add_filter('allowed_block_types_all', 'ashlar_allowed_block_types', 10, 2);

function ashlar_allowed_block_types(bool|array $allowed_block_types, object $block_editor_context): bool|array
{
    $post      = $block_editor_context->post ?? null;
    $post_type = ($post instanceof WP_Post) ? $post->post_type : '';

    // En páginas restringimos a los bloques custom (construcción de landings).
    if ($post_type === 'page') {
        // Excepción: las páginas legales. La maqueta base (título, columna de
        // lectura de 960px, padding bajo el header fijo) la pone
        // templates/page-legal.html; aquí solo se abre el insertador entero.
        if (get_page_template_slug($post) === 'page-legal') {
            return true;
        }

        // La lista de bloques del tema NO se escribe a mano: sale del registro,
        // que a su vez se llena solo desde `build/blocks/*/block.json` (ver
        // blocks.php). Así, crear un bloque nuevo basta para que aparezca en el
        // editor, sin tener que acordarse de tocar esta lista.
        return ashlar_registered_theme_blocks();
    }

    // Proyectos: las secciones de la ficha (ashlar/project-*) y las de página
    // que también encajan en un proyecto (antes/después, cita del cliente).
    if (defined('ASHLAR_PROJECT') && $post_type === ASHLAR_PROJECT) {
        return ashlar_project_blocks();
    }

    // Entradas y demás contextos: todos los bloques.
    return true;
}

/**
 * Bloques del tema que NO son secciones de página: piezas que solo tienen
 * sentido dentro de los template parts (header/footer) o de la plantilla de
 * la ficha de proyecto. Se excluyen de los insertadores de páginas y proyectos.
 */
const ASHLAR_NON_PAGE_BLOCKS = [
    'ashlar/logo',
    'ashlar/header-menu',
    'ashlar/nav-menu',
    'ashlar/site-contact',
    'ashlar/site-social',
    'ashlar/footer-cta',
    'ashlar/footer-brand',
    'ashlar/footer-bottom',
    'ashlar/footer-wall',
    // Plantilla de la ficha de proyecto (templates/single-project.html).
    'ashlar/project-header',
    'ashlar/project-next',
    // Plantilla del artículo del Journal (templates/single.html).
    'ashlar/article-header',
    'ashlar/article-toc',
    'ashlar/article-next',
    // Plantilla de la página de error (templates/404.html).
    'ashlar/not-found',
];

/**
 * Secciones de página que también se pueden usar dentro de un proyecto.
 */
const ASHLAR_PROJECT_SHARED_BLOCKS = [
    'ashlar/before-after',
    'ashlar/client-story',
    'ashlar/manifesto',
];

/** ¿Es una sección de la ficha de proyecto (ashlar/project-*)? */
function ashlar_is_project_block(string $name): bool
{
    return str_starts_with($name, 'ashlar/project-');
}

/**
 * Nombres de los bloques de sección del tema que hay registrados.
 *
 * El filtro `allowed_block_types_all` corre después de `init`, así que para
 * cuando se llama a esto el registro ya tiene los bloques que `blocks.php`
 * descubrió en `build/blocks/`.
 *
 * @return string[] Ej. ['ashlar/banner', 'ashlar/hero', …].
 */
function ashlar_registered_theme_blocks(): array
{
    $registered = WP_Block_Type_Registry::get_instance()->get_all_registered();

    $names = array_filter(
        array_keys($registered),
        static fn(string $name): bool => str_starts_with($name, 'ashlar/')
            && !in_array($name, ASHLAR_NON_PAGE_BLOCKS, true)
            && !ashlar_is_project_block($name)
    );

    sort($names);

    return array_values($names);
}

/**
 * Bloques del editor de un proyecto: las secciones ashlar/project-* (salvo
 * las de la plantilla) y las compartidas con las páginas. Igual que en las
 * páginas, la lista sale del registro.
 *
 * @return string[]
 */
function ashlar_project_blocks(): array
{
    $registered = WP_Block_Type_Registry::get_instance()->get_all_registered();

    $names = array_filter(
        array_keys($registered),
        static fn(string $name): bool => (ashlar_is_project_block($name) || in_array($name, ASHLAR_PROJECT_SHARED_BLOCKS, true))
            && !in_array($name, ASHLAR_NON_PAGE_BLOCKS, true)
    );

    sort($names);

    return array_values($names);
}

/**
 * Enqueue editor configuration script.
 * Loaded only in the block editor context.
 */
add_action('enqueue_block_editor_assets', 'ashlar_enqueue_editor_assets');

function ashlar_enqueue_editor_assets(): void
{
    $build_dir = get_template_directory()     . '/build';
    $build_uri = get_template_directory_uri() . '/build';

    $asset_file = $build_dir . '/admin/editor-config.asset.php';
    $asset      = file_exists($asset_file)
        ? require $asset_file
        : ['dependencies' => [], 'version' => '1.0.0'];

    wp_enqueue_script(
        'ashlar-editor-config',
        $build_uri . '/admin/editor-config.js',
        $asset['dependencies'],
        $asset['version'],
        true
    );

    // Estilos de la interfaz del editor (campo de foto, guía, punto de partida).
    if (file_exists($build_dir . '/admin/editor-config.css')) {
        wp_enqueue_style('ashlar-editor-ui', $build_uri . '/admin/editor-config.css', ['wp-components'], $asset['version']);
    }

    // Datos para los scripts de bloque: se imprimen antes que cualquiera de
    // ellos (todos dependen de wp-blocks). Las vistas previas del insertador y
    // los puntos de partida usan las fotos del tema.
    wp_add_inline_script(
        'wp-blocks',
        'window.ashlarEditor = ' . wp_json_encode([
            'assets'   => get_template_directory_uri() . '/src/assets/images/',
            'settings' => current_user_can('edit_theme_options') ? admin_url('admin.php?page=' . ASHLAR_OPTION_PAGE) : '',
            'projects' => defined('ASHLAR_PROJECT') ? admin_url('edit.php?post_type=' . ASHLAR_PROJECT) : '',
        ]) . ';',
        'before'
    );
}

/**
 * Sin la pestaña de Openverse (bancos de imágenes externos) en el insertador:
 * las fotos de la web salen de la biblioteca de medios del estudio.
 */
add_filter('block_editor_settings_all', static function (array $settings): array {
    $settings['enableOpenverseMediaCategory'] = false;

    return $settings;
});
