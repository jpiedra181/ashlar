<?php

/**
 * Enqueue Assets
 *
 * - Librerías compartidas (GSAP, ScrollTrigger, SplitText, Lenis): se REGISTRAN
 *   una vez y cada bundle que las importa las declara como dependencia en su
 *   .asset.php (ver webpack.config.js). Nunca van duplicadas dentro de un bundle.
 * - `ashlar-app`: el JS global del tema (cabecera, menú, animaciones…) y
 *   la API window.ashlar que usan los view.js de los bloques.
 * - `ashlar-main`: todo el CSS del tema (front y editor).
 *
 * Los view.js de cada bloque los encola WordPress solo en las páginas donde
 * aparece el bloque (campo "viewScript" de su block.json).
 */

defined('ABSPATH') || exit;

/**
 * Manifiesto de un bundle de build/ (dependencias + versión por contenido).
 */
function ashlar_asset(string $name): array
{
    $file = get_template_directory() . '/build/' . $name . '.asset.php';

    return file_exists($file)
        ? require $file
        : ['dependencies' => [], 'version' => wp_get_theme()->get('Version')];
}

// Se registran en `init` (no en wp_enqueue_scripts) porque los view.js de los
// bloques se resuelven al registrar los bloques y tienen que encontrar ya sus
// dependencias.
add_action('init', 'ashlar_register_scripts', 5);

function ashlar_register_scripts(): void
{
    $vendor_dir = get_template_directory() . '/build/vendor/';
    $vendor_uri = get_template_directory_uri() . '/build/vendor/';

    $shared = [
        'ashlar-gsap'               => ['gsap.min.js', []],
        'ashlar-gsap-scrolltrigger' => ['ScrollTrigger.min.js', ['ashlar-gsap']],
        'ashlar-gsap-splittext'     => ['SplitText.min.js', ['ashlar-gsap']],
        'ashlar-lenis'              => ['lenis.min.js', []],
    ];

    foreach ($shared as $handle => [$file, $deps]) {
        if (!file_exists($vendor_dir . $file)) {
            continue;
        }

        wp_register_script($handle, $vendor_uri . $file, $deps, (string) filemtime($vendor_dir . $file), ['in_footer' => true, 'strategy' => 'defer']);
    }

    $app = ashlar_asset('js/app');
    wp_register_script(
        'ashlar-app',
        get_template_directory_uri() . '/build/js/app.js',
        $app['dependencies'],
        $app['version'],
        // defer: WordPress sube estos scripts al <head> (los view.js de los
        // bloques dependen de ellos) y sin estrategia bloqueaban el render
        ['in_footer' => true, 'strategy' => 'defer']
    );
}

add_action('wp_enqueue_scripts', 'ashlar_enqueue_assets');

function ashlar_enqueue_assets(): void
{
    $main_css = get_template_directory() . '/build/css/main.css';

    if (file_exists($main_css)) {
        wp_enqueue_style(
            'ashlar-main',
            get_template_directory_uri() . '/build/css/main.css',
            [],
            (string) filemtime($main_css)
        );
    }

    wp_enqueue_script('ashlar-app');
}
