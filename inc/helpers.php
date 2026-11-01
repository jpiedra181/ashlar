<?php

/**
 * Helpers de markup
 *
 * Piezas que se repiten en varios render.php (cabecera, pie, bloques
 * dinámicos). Cada una devuelve HTML ya escapado, listo para imprimir.
 */

defined('ABSPATH') || exit;

/**
 * Flecha del Figma (Icon/Arrow right · Icon/Arrow up-right).
 * Mismo trazo que Arrow en src/components/icons.
 *
 * @param string $direction right | left | up | down | up-right.
 * @param string $class     Clase del <svg>.
 */
function ashlar_arrow(string $direction = 'right', string $class = ''): string
{
    $rotation = [
        'right' => 0,
        'left'  => 180,
        'down'  => 90,
        'up'    => -90,
    ][$direction] ?? 0;

    $path = $direction === 'up-right' ? 'M7 17L17 7M17 15V7H9' : 'M4 12H19M13 18L19 12L13 6';

    return sprintf(
        '<svg class="%s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" aria-hidden="true" focusable="false"%s><path d="%s"/></svg>',
        esc_attr($class),
        $rotation ? sprintf(' style="rotate: %ddeg"', $rotation) : '',
        esc_attr($path)
    );
}

/**
 * Botón del Figma: rectangular, Hanken Grotesk SemiBold y flecha.
 * Mismo markup que el componente src/components/button (bloques en React).
 *
 * @param string $label Texto visible.
 * @param string $url   Destino (admite rutas relativas: /contact).
 * @param array  $args  variant (primary|secondary|outline), arrow (bool), class, attrs.
 */
function ashlar_button(string $label, string $url, array $args = []): string
{
    $args = wp_parse_args($args, [
        'variant' => 'primary',
        'arrow'   => true,
        'class'   => '',
        'attrs'   => [],
    ]);

    $variant = in_array($args['variant'], ['secondary', 'outline'], true) ? 'btn--' . $args['variant'] : '';
    $classes = trim(implode(' ', array_filter(['btn', $variant, $args['class']])));

    $attrs = '';
    foreach ($args['attrs'] as $name => $value) {
        if ($value === null || $value === false) {
            continue;
        }
        $attrs .= sprintf(' %s="%s"', esc_attr($name), esc_attr($value));
    }

    return sprintf(
        '<a href="%1$s" class="%2$s"%3$s><span class="btn__label">%4$s</span>%5$s</a>',
        esc_url(ashlar_url($url)),
        esc_attr($classes),
        $attrs,
        esc_html($label),
        $args['arrow'] ? ashlar_arrow('right', 'btn__icon') : ''
    );
}

/**
 * Convierte una ruta relativa del sitio (/contact) en URL absoluta.
 * Las URL completas, anclas (#…) y esquemas (mailto:, tel:) pasan tal cual.
 */
function ashlar_url(string $url): string
{
    $url = trim($url);

    if ($url !== '' && $url[0] === '/' && !str_starts_with($url, '//')) {
        return home_url($url);
    }

    return $url;
}

/**
 * True si dos URL apuntan a la misma ruta del sitio (ignora dominio y barra final).
 */
function ashlar_same_url(string $a, string $b): bool
{
    $path = static fn(string $url): string => untrailingslashit((string) wp_parse_url(ashlar_url($url), PHP_URL_PATH)) ?: '/';

    return $a !== '' && $b !== '' && $path($a) === $path($b);
}

/**
 * Texto con acento: lo escrito entre asteriscos sale como <em>, que en los
 * titulares de Ashlar es la segunda parte de la frase en el tono apagado.
 * «…the opposite: *one fixed price*» → «…the opposite: <em>one fixed price</em>».
 */
function ashlar_accent(string $text): string
{
    return (string) preg_replace('/\*(.+?)\*/u', '<em>$1</em>', esc_html($text));
}

/**
 * Saludo según la hora del sitio (portada del escritorio y pantalla de
 * acceso). Entre asteriscos, la parte en el tono apagado (ashlar_accent).
 */
function ashlar_time_greeting(): string
{
    $hour = (int) wp_date('G');

    if ($hour >= 5 && $hour < 12) {
        return __('Good *morning*', 'ashlar');
    }

    if ($hour >= 12 && $hour < 18) {
        return __('Good *afternoon*', 'ashlar');
    }

    return __('Good *evening*', 'ashlar');
}

/**
 * Nombre del sitio, sin entidades.
 */
function ashlar_site_name(): string
{
    return trim(wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES));
}

/**
 * La marca del Figma: tres sillares, dos arriba y uno desplazado debajo.
 * Los de arriba toman el color del texto; el de abajo, el corten de la
 * sección (--mark-accent).
 */
function ashlar_logo_mark(): string
{
    return '<svg class="logo__mark" viewBox="0 0 22 14" aria-hidden="true" focusable="false">'
        . '<rect width="10" height="6" fill="currentColor"/>'
        . '<rect x="12" width="10" height="6" fill="currentColor"/>'
        . '<rect class="logo__mark-accent" x="6" y="8" width="10" height="6"/>'
        . '</svg>';
}

/**
 * Logotipo enlazado a la portada.
 *
 * Si hay un logo subido en Identidad del sitio, se usa la imagen; si no, la
 * marca y el nombre del sitio en Archivo (versalitas espaciadas).
 */
function ashlar_logo(string $class = ''): string
{
    $name    = ashlar_site_name();
    $logo_id = (int) get_theme_mod('custom_logo');
    $label   = sprintf(
        /* translators: %s: site name. */
        __('%s, home', 'ashlar'),
        $name
    );

    if ($logo_id) {
        $inner = wp_get_attachment_image($logo_id, 'full', false, ['alt' => '', 'class' => 'logo__image']);
    } else {
        $inner = ashlar_logo_mark() . sprintf('<span class="logo__word" aria-hidden="true">%s</span>', esc_html($name));
    }

    return sprintf(
        '<a href="%s" class="%s" rel="home" aria-label="%s">%s</a>',
        esc_url(home_url('/')),
        esc_attr(trim('logo ' . $class)),
        esc_attr($label),
        $inner
    );
}

/**
 * Elementos de primer nivel de un menú, con su estado «actual» resuelto.
 *
 * Se usa en lugar de wp_nav_menu() cuando el markup es muy específico
 * (numeración y subtítulo del menú móvil, enlaces de la cabecera). Las URL
 * salen igualmente de Apariencia → Menús y se resuelven en cada petición.
 * La «descripción» de cada elemento es el subtítulo del menú móvil
 * («Five kinds of job»).
 *
 * @return array<int, array{title: string, url: string, target: string, description: string, current: ?string}>
 */
function ashlar_menu_items(string $location): array
{
    $locations = get_nav_menu_locations();

    if (empty($locations[$location])) {
        return [];
    }

    $items = wp_get_nav_menu_items($locations[$location], ['update_post_term_cache' => false]);

    if (empty($items)) {
        return [];
    }

    // Marca current-menu-item / current-menu-ancestor como haría wp_nav_menu().
    _wp_menu_item_classes_by_context($items);

    $result = [];

    foreach ($items as $item) {
        if ((int) $item->menu_item_parent !== 0) {
            continue;
        }

        $classes = (array) $item->classes;
        $current = null;

        if (in_array('current-menu-item', $classes, true)) {
            $current = 'page';
        } elseif (array_intersect(['current-menu-ancestor', 'current-menu-parent', 'current-page-ancestor', 'current_page_parent'], $classes)) {
            $current = 'true';
        }

        $result[] = [
            'title'       => $item->title,
            'url'         => $item->url,
            'target'      => $item->target,
            'description' => trim((string) $item->description),
            'current'     => $current,
        ];
    }

    return $result;
}

/**
 * Datos de contacto de la empresa (Options → Contact).
 */
function ashlar_contact(): array
{
    $phone    = trim(ashlar_get_option('contact_phone'));
    $street   = trim(ashlar_get_option('address_street'));
    $city     = trim(ashlar_get_option('address_city'));
    $postcode = trim(ashlar_get_option('address_postal_code'));

    return [
        'email'      => trim(ashlar_get_option('contact_email')),
        'phone'      => $phone,
        // El href de tel: no admite espacios ni paréntesis.
        'phone_href' => $phone !== '' ? 'tel:' . preg_replace('/[^0-9+]/', '', $phone) : '',
        'street'     => $street,
        'city'       => $city,
        'postcode'   => $postcode,
        'country'    => trim(ashlar_get_option('address_country')),
        // Formato británico en una línea: «14 Wharf Road, London N1 7RW».
        'address'    => trim(implode(', ', array_filter([$street, trim($city . ' ' . $postcode)])), ', '),
        'hours'      => trim(ashlar_get_option('contact_hours')),
    ];
}

/**
 * Redes con URL (Options → Social), en orden de pintado.
 *
 * @return array<string, array{label: string, url: string}> Clave = servicio del core (icono).
 */
function ashlar_social_links(): array
{
    $links = [];

    foreach (ashlar_social_networks() as $service => $label) {
        $url = trim(ashlar_get_option('social_' . $service));

        if ($url !== '') {
            $links[$service] = ['label' => $label, 'url' => $url];
        }
    }

    return $links;
}

/**
 * True cuando un render.php se está pintando para la vista previa del editor
 * (ServerSideRender pide el bloque por REST).
 */
function ashlar_is_editor_preview(): bool
{
    return defined('REST_REQUEST') && REST_REQUEST;
}

/**
 * Aviso del editor para bloques que dependen de un dato que falta.
 * En el front no pinta nada: un bloque vacío no debe dejar huella.
 */
function ashlar_editor_notice(string $message): string
{
    if (!ashlar_is_editor_preview()) {
        return '';
    }

    return sprintf('<p class="ashlar-notice">%s</p>', esc_html($message));
}
