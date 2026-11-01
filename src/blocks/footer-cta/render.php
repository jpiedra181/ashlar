<?php

/**
 * Render server-side de la Llamada del pie.
 *
 * Antetítulo + titular («Let's build something that lasts.») a la izquierda y
 * botón a la derecha. Todo sale de Options → Footer. El titular entra línea a
 * línea ([data-split]).
 *
 * @var array    $attributes Atributos del bloque (sin uso).
 * @var string   $content    Contenido interno (sin uso).
 * @var WP_Block $block      Instancia del bloque.
 */

defined('ABSPATH') || exit;

$eyebrow = trim(ashlar_get_option('footer_cta_eyebrow'));
$title   = trim(ashlar_get_option('footer_cta_title'));
$label   = trim(ashlar_get_option('footer_cta_label'));
$url     = trim(ashlar_get_option('footer_cta_url'));

if ($title === '') {
    echo ashlar_editor_notice(__('The headline is empty. Write it in Options → Footer.', 'ashlar')); // phpcs:ignore WordPress.Security.EscapeOutput
    return;
}

$wrapper_attributes = get_block_wrapper_attributes(['class' => 'footer-cta']);
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput ?>>
    <div class="footer-cta__heading">
        <?php if ($eyebrow !== '') : ?>
            <p class="footer-cta__eyebrow eyebrow" data-reveal><?php echo esc_html($eyebrow); ?></p>
        <?php endif; ?>
        <h2 class="footer-cta__title" data-split><?php echo ashlar_accent($title); // phpcs:ignore WordPress.Security.EscapeOutput -- escapado en el helper ?></h2>
    </div>

    <?php if ($label !== '' && $url !== '') : ?>
        <div class="footer-cta__action" data-reveal><?php echo ashlar_button($label, $url); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
    <?php endif; ?>
</div>
