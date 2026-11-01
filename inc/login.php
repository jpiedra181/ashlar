<?php

/**
 * Pantalla de acceso (wp-login.php) · base: inc/login.php de Raíz
 *
 * Pantalla partida: a un lado, fotos de los proyectos pasando solas con su
 * pie (obra y barrio); al otro, un saludo según la hora y el formulario con
 * la tipografía y la paleta de la marca.
 *
 * Colores y fuentes salen de theme.json en tiempo real (variables de estilos
 * globales + @font-face). Las fotos, el titular y el texto se eligen en
 * Options → Login screen; sin fotos elegidas, las de los proyectos del tema.
 *
 * Estilo: src/admin/login.scss · Pase de fotos: src/admin/login.js
 */

defined('ABSPATH') || exit;

add_action('login_enqueue_scripts', 'ashlar_login_assets');
add_action('login_head', 'ashlar_login_head');
add_action('login_header', 'ashlar_login_aside');
add_action('login_footer', 'ashlar_login_footer');

add_filter('login_headerurl', static fn(): string => home_url('/'));
add_filter('login_headertext', static fn(): string => wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES));
add_filter('login_display_language_dropdown', '__return_false');
add_filter('login_body_class', static fn(array $classes): array => array_merge($classes, ['ashlar-login']));
add_filter('login_title', 'ashlar_login_document_title', 10, 2);
add_filter('login_message', 'ashlar_login_message');
add_filter('wp_login_errors', 'ashlar_login_errors');
add_filter('login_redirect', 'ashlar_login_redirect', 10, 3);
add_action('login_init', 'ashlar_login_texts');

// --------------------------------------------------
//	Assets
// --------------------------------------------------

function ashlar_login_assets(): void
{
    $asset = ashlar_asset('admin/login');
    $uri   = get_template_directory_uri() . '/build/admin/';

    wp_enqueue_style('ashlar-login', $uri . 'login.css', ['login'], $asset['version']);
    wp_enqueue_script('ashlar-login', $uri . 'login.js', $asset['dependencies'], $asset['version'], ['in_footer' => true]);

    // Variables de theme.json (colores, tamaños, espaciado, custom): la misma
    // fuente de verdad que la web, sin copiar un solo color a mano.
    wp_add_inline_style('ashlar-login', wp_get_global_stylesheet(['variables']));
}

function ashlar_login_head(): void
{
    // @font-face de las fuentes declaradas en theme.json.
    if (function_exists('wp_print_font_faces')) {
        wp_print_font_faces();
    }

    $slides = ashlar_login_slides();

    if ($slides) {
        printf('<link rel="preload" as="image" href="%s" fetchpriority="high">' . "\n", esc_url($slides[0]['url']));
    }

    printf('<meta name="theme-color" content="%s">' . "\n", esc_attr(ashlar_palette_color('stone-950', '#151311')));
}

// --------------------------------------------------
//	Fotos
// --------------------------------------------------

/**
 * Fotos del panel: las elegidas en Options o, si no hay, las de los
 * proyectos que trae el tema.
 *
 * @return array<int, array{url: string, title: string, place: string}>
 */
function ashlar_login_slides(): array
{
    static $slides = null;

    if ($slides !== null) {
        return $slides;
    }

    $slides = [];

    foreach ((array) ashlar_get_option('login_images') as $attachment_id) {
        $image = wp_get_attachment_image_src((int) $attachment_id, '2048x2048') ?: wp_get_attachment_image_src((int) $attachment_id, 'full');

        if (!$image) {
            continue;
        }

        $slides[] = [
            'url'   => $image[0],
            'title' => get_the_title((int) $attachment_id),
            'place' => (string) wp_get_attachment_caption((int) $attachment_id),
        ];
    }

    if ($slides) {
        return $slides;
    }

    $base = get_template_directory_uri() . '/src/assets/images/photos/';

    $defaults = [
        ['elm-row-after.jpg', 'Elm Row', 'Hampstead, NW3'],
        ['project-stair.jpg', 'Gibson Square', 'Islington, N1'],
        ['project-kitchen.jpg', 'Calder Road', 'Hackney, E8'],
        ['project-wraparound.jpg', 'Ospringe Road', 'Kentish Town, NW5'],
        ['project-loft.jpg', 'Mortimer Road', 'De Beauvoir, N1'],
    ];

    foreach ($defaults as [$file, $title, $place]) {
        $slides[] = ['url' => $base . $file, 'title' => $title, 'place' => $place];
    }

    return $slides;
}

/**
 * Panel de fotos (antes de #login). Solo la primera imagen se descarga al
 * entrar; el resto la pide login.js justo antes de mostrarla.
 */
function ashlar_login_aside(): void
{
    $slides = ashlar_login_slides();
    $count  = count($slides);

    if (!$count) {
        return;
    }

    $first = $slides[0];
?>
    <aside class="ashlar-login__aside" aria-label="<?php esc_attr_e('Our projects', 'ashlar'); ?>" data-login-slides>
        <div class="ashlar-login__slides">
            <?php foreach ($slides as $index => $slide) : ?>
                <figure class="ashlar-login__slide<?php echo $index === 0 ? ' is-active' : ''; ?>" data-title="<?php echo esc_attr($slide['title']); ?>" data-place="<?php echo esc_attr($slide['place']); ?>">
                    <img alt="" decoding="async" <?php echo $index === 0 ? 'src="' . esc_url($slide['url']) . '" fetchpriority="high"' : 'data-src="' . esc_url($slide['url']) . '"'; ?>>
                </figure>
            <?php endforeach; ?>
        </div>

        <div class="ashlar-login__veil" aria-hidden="true"></div>

        <div class="ashlar-login__brand theme-dark"><?php echo ashlar_logo(); // phpcs:ignore WordPress.Security.EscapeOutput -- escapado en ashlar_logo() ?></div>

        <div class="ashlar-login__caption">
            <p class="ashlar-login__eyebrow"><?php esc_html_e('Project', 'ashlar'); ?></p>
            <p class="ashlar-login__project" data-caption-title><?php echo esc_html($first['title']); ?></p>
            <p class="ashlar-login__place" data-caption-place><?php echo esc_html($first['place']); ?></p>
        </div>

        <?php if ($count > 1) : ?>
            <div class="ashlar-login__progress" aria-hidden="true">
                <span class="ashlar-login__count"><span data-slide-index>01</span> / <?php echo esc_html(str_pad((string) $count, 2, '0', STR_PAD_LEFT)); ?></span>
                <span class="ashlar-login__bar"><i data-slide-bar></i></span>
            </div>
        <?php endif; ?>
    </aside>
<?php
}

// --------------------------------------------------
//	Textos
// --------------------------------------------------

/**
 * Titular de la pantalla: el de Options o el saludo según la hora.
 */
function ashlar_login_greeting(): string
{
    $custom = trim((string) ashlar_get_option('login_title'));

    return $custom !== '' ? $custom : ashlar_time_greeting();
}

/**
 * Cabecera de cada pantalla de acceso (titular + texto) encima del formulario.
 * WordPress imprime aquí también sus propios avisos, que se conservan debajo.
 */
function ashlar_login_message(string $message): string
{
    $action = isset($_REQUEST['action']) ? sanitize_key(wp_unslash($_REQUEST['action'])) : 'login'; // phpcs:ignore WordPress.Security.NonceVerification -- solo elige textos

    if (isset($_GET['loggedout'])) { // phpcs:ignore WordPress.Security.NonceVerification -- solo elige textos
        $title = __('See you *soon*', 'ashlar');
        $text  = __('You’ve signed out. Sign back in whenever you like.', 'ashlar');
    } elseif (in_array($action, ['lostpassword', 'retrievepassword'], true)) {
        $title   = __('Forgotten your *password*?', 'ashlar');
        $text    = __('Type your email or username and we’ll send you a link to choose a new one.', 'ashlar');
        $message = ''; // Nuestro texto sustituye al aviso genérico de WordPress.
    } elseif (in_array($action, ['rp', 'resetpass'], true)) {
        $title   = __('Choose a *new password*', 'ashlar');
        $text    = __('Make it long and hard to guess. The bar below tells you how strong it is.', 'ashlar');
        $message = '';
    } elseif ($action === 'checkemail' || isset($_GET['checkemail'])) { // phpcs:ignore WordPress.Security.NonceVerification -- solo elige textos
        $title = __('Check your *email*', 'ashlar');
        $text  = '';
    } else {
        $title = ashlar_login_greeting();
        $text  = trim((string) ashlar_get_option('login_text'));
    }

    $intro = '<header class="ashlar-login__intro">'
        . '<p class="ashlar-login__kicker">' . esc_html__('Dashboard', 'ashlar') . '</p>'
        . '<h2 class="ashlar-login__title">' . ashlar_accent($title) . '</h2>'
        . ($text !== '' ? '<p class="ashlar-login__text">' . esc_html($text) . '</p>' : '')
        . '</header>';

    return $intro . $message;
}

/**
 * Rótulos más cortos y cercanos en el formulario. Solo en wp-login.php y solo
 * para los textos del núcleo (dominio «default»).
 */
function ashlar_login_texts(): void
{
    $texts = [
        'Username or Email Address' => __('Email or username', 'ashlar'),
        'Remember Me'               => __('Remember me on this device', 'ashlar'),
        'Log In'                    => __('Sign in', 'ashlar'),
        'Log in'                    => __('Sign in again', 'ashlar'),
        'Lost your password?'       => __('Forgotten your password?', 'ashlar'),
        'Get New Password'          => __('Send the link', 'ashlar'),
        'Save Password'             => __('Save password', 'ashlar'),
        'Generate Password'         => __('Generate a strong one', 'ashlar'),
    ];

    add_filter('gettext', static function (string $translation, string $text, string $domain) use ($texts): string {
        return ($domain === 'default' && isset($texts[$text])) ? $texts[$text] : $translation;
    }, 10, 3);

    // «← Go to Ashlar» del pie: lo pinta login_footer con nuestro estilo.
    add_filter('login_site_html_link', static fn(): string => '');
}

/**
 * Error de acceso genérico y amable. WordPress distingue «ese usuario no
 * existe» de «contraseña incorrecta», lo que regala pistas a quien prueba
 * usuarios; aquí se unifican en un solo mensaje.
 */
function ashlar_login_errors(WP_Error $errors): WP_Error
{
    // «See you soon» ya dice que se ha cerrado la sesión.
    $errors->remove('loggedout');

    $codes = ['invalid_username', 'invalid_email', 'incorrect_password'];

    if (!array_intersect($codes, $errors->get_error_codes())) {
        return $errors;
    }

    foreach ($codes as $code) {
        $errors->remove($code);
    }

    $errors->add(
        'ashlar_login_failed',
        sprintf(
            '<strong>%s</strong> %s <a href="%s">%s</a>',
            esc_html__('We couldn’t sign you in.', 'ashlar'),
            esc_html__('Check the email or username and the password.', 'ashlar'),
            esc_url(wp_lostpassword_url()),
            esc_html__('Forgotten it?', 'ashlar')
        )
    );

    return $errors;
}

function ashlar_login_document_title(string $title, string $login_title): string
{
    return $login_title . ' · ' . wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES);
}

/**
 * Tras entrar, a Home (portada del escritorio) en lugar del escritorio de
 * WordPress, salvo que se viniera de otra pantalla concreta.
 */
function ashlar_login_redirect(string $redirect_to, string $requested, $user): string
{
    if ($user instanceof WP_User && ($requested === '' || $requested === admin_url()) && defined('ASHLAR_HOME_PAGE')) {
        return admin_url('admin.php?page=' . ASHLAR_HOME_PAGE);
    }

    return $redirect_to;
}

function ashlar_login_footer(): void
{
?>
    <footer class="ashlar-login__footer">
        <a class="ashlar-login__back" href="<?php echo esc_url(home_url('/')); ?>">
            <?php echo ashlar_arrow('left', 'ashlar-login__back-icon'); // phpcs:ignore WordPress.Security.EscapeOutput -- SVG fijo ?>
            <?php
            /* translators: %s: site name. */
            printf(esc_html__('Back to %s', 'ashlar'), esc_html(wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES)));
            ?>
        </a>
        <p class="ashlar-login__credit">
            <?php
            echo get_the_privacy_policy_link(); // phpcs:ignore WordPress.Security.EscapeOutput -- lo escapa WordPress

            printf(
                /* translators: %s: link to the theme author. */
                esc_html__('Made to measure by %s', 'ashlar'),
                '<a href="https://jpiedra.com" target="_blank" rel="noopener">Javier Piedra</a>'
            );
            ?>
        </p>
    </footer>
<?php
}
