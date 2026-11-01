<?php

/**
 * Render server-side de la Marca del pie: la frase de Options → Footer. Sin
 * logotipo: el nombre ya va grabado en el muro que cierra el pie
 * (ashlar/footer-wall).
 *
 * @var array    $attributes Atributos del bloque (sin uso).
 * @var string   $content    Contenido interno (sin uso).
 * @var WP_Block $block      Instancia del bloque.
 */

defined('ABSPATH') || exit;

$about = trim(ashlar_get_option('footer_about'));

$wrapper_attributes = get_block_wrapper_attributes(['class' => 'footer-brand']);
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput ?>>
    <?php if ($about !== '') : ?>
        <p class="footer-brand__text"><?php echo esc_html($about); ?></p>
    <?php endif; ?>
</div>
