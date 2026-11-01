<?php

/**
 * Render server-side del bloque Redes sociales.
 *
 * Una entrada por cada red con dirección en Opciones → Redes sociales.
 * - text:  el nombre de la red con subrayado animado (el pie de Ashlar).
 * - icons: el icono de la red. Los iconos se piden a WordPress
 *          (block_core_social_link_get_icon) en vez de copiarlos aquí.
 *
 * @var array    $attributes Atributos del bloque (title, variant, ariaLabel).
 * @var string   $content    Contenido interno (sin uso).
 * @var WP_Block $block      Instancia del bloque.
 */

defined('ABSPATH') || exit;

$title      = trim($attributes['title'] ?? '');
$variant    = ($attributes['variant'] ?? 'text') === 'icons' ? 'icons' : 'text';
$aria_label = trim($attributes['ariaLabel'] ?? '') ?: ($title ?: __('Social media', 'ashlar'));
$links      = ashlar_social_links();

if (!$links) {
    echo ashlar_editor_notice(__('No network has an address. Add them in Options → Social.', 'ashlar')); // phpcs:ignore WordPress.Security.EscapeOutput
    return;
}

$wrapper_attributes = get_block_wrapper_attributes(['class' => 'site-social site-social--' . $variant]);
$new_tab            = esc_html__('(opens in a new tab)', 'ashlar');
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput ?>>
    <?php if ($title !== '') : ?>
        <h2 class="site-social__title eyebrow t-soft"><?php echo esc_html($title); ?></h2>
    <?php endif; ?>
    <ul class="site-social__list" aria-label="<?php echo esc_attr($aria_label); ?>">
        <?php foreach ($links as $service => $network) : ?>
            <li class="site-social__item">
                <a class="site-social__link" href="<?php echo esc_url($network['url']); ?>" target="_blank" rel="noopener noreferrer">
                    <?php if ($variant === 'icons' && function_exists('block_core_social_link_get_icon')) : ?>
                        <?php echo block_core_social_link_get_icon($service); // phpcs:ignore WordPress.Security.EscapeOutput -- SVG del propio WordPress ?>
                        <span class="visually-hidden"><?php echo esc_html($network['label']) . ' ' . $new_tab; // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
                    <?php else : ?>
                        <?php echo esc_html($network['label']); ?>
                        <span class="visually-hidden"><?php echo $new_tab; // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
                    <?php endif; ?>
                </a>
            </li>
        <?php endforeach; ?>
    </ul>
</div>
