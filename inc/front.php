<?php

/**
 * Front
 *
 * Lo que la web pública necesita fuera de los bloques: la preferencia de
 * movimiento antes del primer pintado, el preload de las fuentes, el
 * grano, las clases de <body> y un <head> sin lastre.
 */

defined('ABSPATH') || exit;

// --------------------------------------------------
//	<head>
// --------------------------------------------------

add_action('wp_head', 'ashlar_head_early', 1);

function ashlar_head_early(): void
{
    // Se aplica antes de pintar para que los estados iniciales de las
    // animaciones (src/scss/elements/_motion.scss) nunca parpadeen y se
    // respete la preferencia guardada. Red de seguridad: si el JS del tema no
    // llega a arrancar en 4 s, se quita .motion y todo queda visible.
    //
    // Loader (ashlar_loader_markup): .is-loading solo en la primera página de
    // la sesión, con movimiento y en escritorio; ?loader lo fuerza para
    // revisarlo. En táctil y con «ahorro de datos» no sale: en móvil retrasaba
    // ~2,4 s el contenido (hasta ~6 s con red lenta).
    $script = <<<'JS'
(function () {
    var root = document.documentElement, off = false, seen = true;
    try { off = localStorage.getItem('ashlar-motion') === 'off'; } catch (e) {}
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var motion = !off && !reduced;
    var light = window.matchMedia('(hover: none)').matches || !!(navigator.connection && navigator.connection.saveData);
    root.classList.add('js');
    if (off) root.setAttribute('data-motion', 'off');
    root.classList.toggle('motion', motion);
    try { seen = sessionStorage.getItem('ashlar-loaded') === '1'; sessionStorage.setItem('ashlar-loaded', '1'); } catch (e) {}
    if (__LOADER__ && motion && ((!seen && !light) || /[?&]loader(=|&|$)/.test(location.search))) root.classList.add('is-loading');
    setTimeout(function () { if (!window.__ashlarReady) root.classList.remove('motion', 'is-loading'); }, 4000);
})();
JS;

    wp_print_inline_script_tag(str_replace('__LOADER__', ashlar_loader_enabled() ? 'true' : 'false', $script));

    printf('<meta name="theme-color" content="%s">' . "\n", esc_attr(ashlar_palette_color('stone-50', '#f7f5f1')));

    // Las tres fuentes se usan sobre el pliegue (titular en Archivo, texto en
    // Hanken Grotesk y rótulos en Plex Mono 500): precargarlas evita el salto.
    $fonts = [
        'archivo.woff2',
        'hanken-grotesk.woff2',
        'ibm-plex-mono-500.woff2',
    ];

    foreach ($fonts as $font) {
        printf(
            '<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin>' . "\n",
            esc_url(get_template_directory_uri() . '/src/assets/fonts/' . $font)
        );
    }
}

// --------------------------------------------------
//	Loader de la primera visita
// --------------------------------------------------

/**
 * ¿Hay loader en esta petición? No en vistas previas ni en el personalizador.
 * Filtro `ashlar_loader` para quitarlo.
 */
function ashlar_loader_enabled(): bool
{
    return !is_admin() && !is_preview() && !is_customize_preview() && apply_filters('ashlar_loader', true);
}

add_action('wp_body_open', 'ashlar_loader_markup', 1);

/**
 * «Marca en obra»: los tres sillares del logotipo se colocan uno a uno, sale
 * el nombre y sube el telón (src/js/modules/loader.js). Solo se ve con
 * html.is-loading (script de <head>); si no, el JS lo quita del DOM. Es
 * decorativo: aria-hidden, la página de debajo se lee igual.
 */
function ashlar_loader_markup(): void
{
    if (!ashlar_loader_enabled()) {
        return;
    }

    $name     = ashlar_site_name();
    $postcode = trim((string) ashlar_get_option('address_postal_code'));
    $place    = trim(ashlar_get_option('address_city') . ' ' . strtok($postcode, ' '));
    $steps    = [__('Setting out', 'ashlar')];

    foreach (['01', '02', '03'] as $n) {
        /* translators: %s: number of the block being laid (01, 02, 03). */
        $steps[] = sprintf(__('Laying %s / 03', 'ashlar'), $n);
    }

    $steps[] = __('Ready', 'ashlar');
?>
    <div class="loader theme-dark" aria-hidden="true" data-loader data-loader-steps="<?php echo esc_attr(wp_json_encode($steps)); ?>">
        <div class="loader__inner wrap">
            <p class="loader__top">
                <span><?php echo esc_html($name . ' · ' . __('Design & build', 'ashlar')); ?></span>
                <span><?php echo esc_html($place); ?></span>
            </p>
            <div class="loader__brand">
                <svg class="loader__mark" viewBox="0 0 22 14" focusable="false">
                    <rect class="loader__block" width="10" height="6" />
                    <rect class="loader__block" x="12" width="10" height="6" />
                    <rect class="loader__block loader__block--accent" x="6" y="8" width="10" height="6" />
                </svg>
                <span class="loader__word-mask"><span class="loader__word"><?php echo esc_html($name); ?></span></span>
            </div>
            <div class="loader__foot">
                <p class="loader__status">
                    <span data-loader-status><?php echo esc_html($steps[0]); ?></span>
                    <span class="loader__count" data-loader-count>000</span>
                </p>
                <span class="loader__track"><span class="loader__fill" data-loader-fill></span></span>
            </div>
        </div>
    </div>
<?php
}

/**
 * Color de la paleta de theme.json por slug (para metas y CSS en línea).
 */
function ashlar_palette_color(string $slug, string $fallback = ''): string
{
    $palette = wp_get_global_settings(['color', 'palette', 'theme']);

    foreach ((array) $palette as $color) {
        if (($color['slug'] ?? '') === $slug) {
            return $color['color'];
        }
    }

    return $fallback;
}

// <html id="top">: destino del enlace «Volver arriba» cuando no hay JS.
add_filter('language_attributes', static fn(string $output): string => is_admin() ? $output : $output . ' id="top"');

// Fuera emojis y oEmbed del <head>: Ashlar no los usa y son peticiones de más.
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('wp_print_styles', 'print_emoji_styles');
remove_action('wp_head', 'wp_oembed_add_discovery_links');
remove_action('wp_head', 'wp_generator');

// --------------------------------------------------
//	<body>
// --------------------------------------------------

// Sin archivo de autor ni resultados de búsqueda: la web no los enlaza, salían
// con el contenido vacío (sin titular) y el de autor publicaba el nombre de
// usuario del administrador. Responden 404 y el sitemap deja de listar autores.
add_filter('wp_sitemaps_add_provider', static fn($provider, string $name) => $name === 'users' ? false : $provider, 10, 2);

add_action('template_redirect', static function (): void {
    if (is_admin() || !(is_author() || is_search())) {
        return;
    }

    global $wp_query;
    $wp_query->set_404();
    status_header(404);
    nocache_headers();
});

// --------------------------------------------------
//	Usuarios y XML-RPC: que no se pueda averiguar el usuario del administrador
// --------------------------------------------------

// ?author=1 redirigía (301) a /journal/author/<usuario>/ antes del 404 de
// arriba, y la URL ya delataba el nombre: sin esa redirección, 404 directo.
add_filter('redirect_canonical', static fn($redirect) => is_author() ? false : $redirect);

// La API REST no lista usuarios a quien no ha iniciado sesión (el editor sí
// los usa, y con sesión los sigue teniendo).
add_filter('rest_endpoints', static function (array $endpoints): array {
    if (!is_user_logged_in()) {
        unset($endpoints['/wp/v2/users'], $endpoints['/wp/v2/users/(?P<id>[\d]+)']);
    }
    return $endpoints;
});

// En los feeds, el autor es la empresa: <dc:creator> publicaba el nombre del
// administrador.
add_filter('the_author', static fn($name) => is_feed() ? get_bloginfo('name') : $name);

// oEmbed sin el nombre ni el enlace del autor.
add_filter('oembed_response_data', static function (array $data): array {
    unset($data['author_name'], $data['author_url']);
    return $data;
});

// Sin XML-RPC ni pingbacks: la web no los usa y son una vía de fuerza bruta
// (system.multicall) y de ataques por pingback.
add_filter('xmlrpc_enabled', '__return_false');
add_filter('xmlrpc_methods', static function (array $methods): array {
    unset($methods['pingback.ping'], $methods['pingback.extensions.getPingbacks']);
    return $methods;
});
add_filter('wp_headers', static function (array $headers): array {
    unset($headers['X-Pingback']);
    return $headers;
});
remove_action('wp_head', 'rsd_link');

add_filter('body_class', 'ashlar_body_classes');

/**
 * `has-dark-hero`: la página abre con un hero oscuro a sangre, así que la
 * cabecera arranca en claro (texto papel) hasta que se hace scroll.
 *
 * Se detecta solo, mirando el PRIMER bloque del contenido: el cliente no tiene
 * que acordarse de marcar nada. La lista de heroes oscuros es filtrable.
 */
function ashlar_body_classes(array $classes): array
{
    if (!is_singular()) {
        return $classes;
    }

    // La ficha de proyecto siempre abre con su foto a sangre (fase 3).
    if (defined('ASHLAR_PROJECT') && is_singular(ASHLAR_PROJECT)) {
        $classes[] = 'has-dark-hero';
        return $classes;
    }

    $blocks = parse_blocks((string) get_post_field('post_content', get_queried_object_id()));
    $blocks = array_values(array_filter($blocks, static fn(array $block): bool => !empty($block['blockName'])));
    $first  = $blocks[0] ?? null;

    if ($first && ashlar_is_dark_hero($first)) {
        $classes[] = 'has-dark-hero';
    }

    return $classes;
}

/**
 * ¿Este bloque es un hero oscuro a sangre? (la cabecera arranca en claro).
 * Filtrable: ashlar_dark_hero_blocks recibe la lista de nombres.
 */
function ashlar_is_dark_hero(array $block): bool
{
    $name = $block['blockName'] ?? '';

    if ($name === 'ashlar/page-hero') {
        return ($block['attrs']['variant'] ?? 'text') === 'image';
    }

    return in_array($name, apply_filters('ashlar_dark_hero_blocks', []), true);
}
