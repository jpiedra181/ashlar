<?php

/**
 * SEO básico sin plugin: meta description, Open Graph y Twitter Card.
 *
 * Solo actúa si no hay un plugin SEO activo (Yoast, Rank Math, SEOPress,
 * All in One SEO, The SEO Framework, Slim SEO): si se instala uno, el tema
 * se retira solo y no hay etiquetas duplicadas. El <title> y el canonical los
 * sigue poniendo WordPress. Se puede apagar con el filtro `ashlar_seo_enabled`.
 *
 *   Descripción: el extracto de la página, entrada o proyecto (las páginas
 *   tienen el campo «Excerpt» en el editor; en el Journal es la respuesta
 *   corta y en los proyectos el resumen) o, si no hay, el texto del pie
 *   (Options → Footer).
 *   Imagen: la destacada o, si no hay, la foto del hero de la portada.
 */

defined('ABSPATH') || exit;

/**
 * ¿Hay un plugin SEO que ya pinta estas etiquetas?
 */
function ashlar_seo_plugin_active(): bool
{
    return defined('WPSEO_VERSION')              // Yoast
        || class_exists('RankMath')              // Rank Math
        || defined('SEOPRESS_VERSION')           // SEOPress
        || defined('AIOSEO_VERSION')             // All in One SEO
        || defined('THE_SEO_FRAMEWORK_VERSION')  // The SEO Framework
        || defined('SLIM_SEO_VER');              // Slim SEO
}

// Campo «Excerpt» en las páginas: es su meta description
add_action('init', static function (): void {
    add_post_type_support('page', 'excerpt');
});

/**
 * Descripción de la vista actual, en texto plano y a 160 caracteres como mucho.
 */
function ashlar_seo_description(): string
{
    $text = '';

    if (is_singular()) {
        $post = get_queried_object();
        // Con contraseña, el extracto no sale (igual que en el núcleo)
        if ($post instanceof WP_Post && !post_password_required($post) && has_excerpt($post)) {
            $text = $post->post_excerpt;
        }
    }

    if ($text === '') {
        $text = (string) ashlar_get_option('footer_about');
    }

    $text = trim(preg_replace('/\s+/', ' ', wp_strip_all_tags($text)));

    if (mb_strlen($text) > 160) {
        $cut   = mb_substr($text, 0, 157);
        $space = mb_strrpos($cut, ' ');
        $text  = rtrim($space ? mb_substr($cut, 0, $space) : $cut, ' ,;:.') . '…';
    }

    return $text;
}

/**
 * Imagen para compartir: la destacada de la vista o la foto del hero.
 *
 * @return array{url: string, width: int, height: int, alt: string}|null
 */
function ashlar_seo_image(): ?array
{
    // Con contraseña, tampoco la foto destacada
    $id = is_singular() && !post_password_required(get_queried_object()) ? (int) get_post_thumbnail_id(get_queried_object_id()) : 0;

    if (!$id) {
        static $fallback = null;
        if ($fallback === null) {
            $found    = get_posts([
                'post_type'   => 'attachment',
                'post_status' => 'inherit',
                'numberposts' => 1,
                'fields'      => 'ids',
                'meta_key'    => '_ashlar_seed', // phpcs:ignore WordPress.DB.SlowDBQuery
                'meta_value'  => 'hero-mason',   // phpcs:ignore WordPress.DB.SlowDBQuery
            ]);
            $fallback = (int) ($found[0] ?? 0);
        }
        $id = $fallback;
    }

    $src = $id ? wp_get_attachment_image_src($id, 'large') : false;
    if (!$src) {
        return null;
    }

    return [
        'url'    => (string) $src[0],
        'width'  => (int) $src[1],
        'height' => (int) $src[2],
        'alt'    => trim((string) get_post_meta($id, '_wp_attachment_image_alt', true)),
    ];
}

add_action('wp_head', 'ashlar_seo_head', 1);

/**
 * Pinta las etiquetas en el <head>.
 */
function ashlar_seo_head(): void
{
    if (ashlar_seo_plugin_active() || !apply_filters('ashlar_seo_enabled', true) || is_404()) {
        return;
    }

    $description = ashlar_seo_description();
    $image       = ashlar_seo_image();
    $is_article  = is_singular('post');
    $url         = is_singular() ? (string) get_permalink(get_queried_object_id()) : (is_front_page() ? home_url('/') : '');

    $tags = [
        ['name', 'description', $description],
        ['property', 'og:type', $is_article ? 'article' : 'website'],
        ['property', 'og:site_name', get_bloginfo('name')],
        ['property', 'og:locale', get_locale()],
        ['property', 'og:title', wp_get_document_title()],
        ['property', 'og:description', $description],
        ['property', 'og:url', $url],
        ['name', 'twitter:card', $image ? 'summary_large_image' : 'summary'],
    ];

    if ($image) {
        $tags[] = ['property', 'og:image', $image['url']];
        $tags[] = ['property', 'og:image:width', (string) $image['width']];
        $tags[] = ['property', 'og:image:height', (string) $image['height']];
        $tags[] = ['property', 'og:image:alt', $image['alt']];
    }

    if ($is_article) {
        $tags[] = ['property', 'article:published_time', (string) get_the_date('c', get_queried_object())];
        $tags[] = ['property', 'article:modified_time', (string) get_the_modified_date('c', get_queried_object())];
    }

    foreach ($tags as [$attr, $key, $value]) {
        if ($value === '') {
            continue;
        }
        $content = in_array($key, ['og:url', 'og:image'], true) ? esc_url($value) : esc_attr($value);
        printf('<meta %s="%s" content="%s">' . "\n", esc_attr($attr), esc_attr($key), $content); // phpcs:ignore WordPress.Security.EscapeOutput -- escapado justo arriba
    }
}
