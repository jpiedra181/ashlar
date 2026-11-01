<?php

/**
 * Theme Setup
 * Registers theme supports and nav menus.
 */

defined('ABSPATH') || exit;

add_action('after_setup_theme', 'ashlar_setup');

function ashlar_setup(): void
{
    load_theme_textdomain('ashlar', get_template_directory() . '/languages');

    // Full Site Editing support
    add_theme_support('block-templates');

    // Editor styles.
    // Ruta RELATIVA a la raíz del tema (no URL completa): así WordPress lee el
    // archivo y le asigna un baseURL, necesario para que las url() relativas del
    // CSS (fuentes, máscaras) resuelvan dentro del editor.
    add_theme_support('editor-styles');
    add_editor_style(['build/css/main.css', 'build/css/editor.css']);

    // Fuera los patrones genéricos de WordPress: el cliente solo ve las
    // secciones de su web (y los puntos de partida de src/admin/editor/).
    remove_theme_support('core-block-patterns');

    // Block supports
    add_theme_support('wp-block-styles');
    add_theme_support('align-wide');
    add_theme_support('responsive-embeds');

    // Post thumbnails
    add_theme_support('post-thumbnails');

    // Logo opcional: si se sube uno en Identidad del sitio, el bloque
    // ashlar/logo lo usa; si no, compone el logotipo tipográfico con el nombre.
    add_theme_support('custom-logo', [
        'height'      => 80,
        'width'       => 240,
        'flex-height' => true,
        'flex-width'  => true,
    ]);

    // HTML5 markup
    add_theme_support('html5', [
        'search-form',
        'gallery',
        'caption',
        'style',
        'script',
    ]);

    // Navigation menus.
    // Los pintan los bloques `ashlar/header-menu` (cabecera y menú desplegable)
    // y `ashlar/nav-menu` (columna del pie), no `core/navigation`: así el cliente
    // los gestiona desde Apariencia → Menús sin entrar al Editor del sitio ni
    // poder descuadrar la cabecera.
    register_nav_menus([
        'primary'         => __('Header — main menu', 'ashlar'),
        'footer-services' => __('Footer — services', 'ashlar'),
        'footer'          => __('Footer — company', 'ashlar'),
        // Privacy, cookies and accessibility statement: on every page (legal
        // bar of the footer). Without this menu they could not be reached.
        'legal'           => __('Footer — legal', 'ashlar'),
    ]);
}

// Ni el directorio de patrones de WordPress.org.
add_filter('should_load_remote_block_patterns', '__return_false');

// Tamaños intermedios de las fotos en WebP (~30 % menos que JPG a la misma
// calidad aparente); el original subido se queda como está. WordPress solo
// convierte si el editor de imagen del servidor admite WebP.
add_filter('image_editor_output_format', static function (array $formats): array {
    $formats['image/jpeg'] = 'image/webp';
    return $formats;
});
add_filter('wp_editor_set_quality', static fn(int $quality, string $mime = ''): int => $mime === 'image/webp' ? 75 : $quality, 10, 2);
