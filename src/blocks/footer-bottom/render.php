<?php

/**
 * Render server-side de la Barra legal del pie.
 *
 * - Línea legal de Options → Footer ({year} = año en curso).
 * - Menú «Footer — legal» de Apariencia → Menús (privacy, cookies,
 *   accessibility statement): el único camino a esas páginas desde cualquier otra.
 *
 * @var array    $attributes Atributos del bloque (sin uso).
 * @var string   $content    Contenido interno (sin uso).
 * @var WP_Block $block      Instancia del bloque.
 */

defined('ABSPATH') || exit;

$legal       = str_replace('{year}', wp_date('Y'), trim(ashlar_get_option('footer_copyright')));
$legal_items = ashlar_menu_items('legal');

$wrapper_attributes = get_block_wrapper_attributes(['class' => 'footer-bottom']);
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput ?>>
    <?php if ($legal !== '') : ?>
        <p class="footer-bottom__legal"><?php echo esc_html($legal); ?></p>
    <?php endif; ?>

    <?php if ($legal_items) : ?>
        <nav class="footer-bottom__nav" aria-label="<?php esc_attr_e('Legal', 'ashlar'); ?>">
            <ul class="footer-bottom__links">
                <?php foreach ($legal_items as $item) : ?>
                    <li>
                        <a class="footer-bottom__link" href="<?php echo esc_url($item['url']); ?>"<?php echo $item['current'] ? ' aria-current="' . esc_attr($item['current']) . '"' : ''; ?>><?php echo esc_html($item['title']); ?></a>
                    </li>
                <?php endforeach; ?>
            </ul>
        </nav>
    <?php endif; ?>
</div>
