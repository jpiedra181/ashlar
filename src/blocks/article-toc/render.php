<?php

/**
 * Render del índice del artículo (templates/single.html).
 *
 * Un enlace por apartado (H2) del texto, numerado como los capítulos de la
 * web, y debajo una llamada corta con el botón de la cabecera. En escritorio
 * va pegado al lado del texto (templates/_article.scss); src/js/modules/
 * article.js marca el apartado que se está leyendo.
 *
 * @var array    $attributes Atributos del bloque.
 * @var WP_Block $block      Instancia del bloque.
 */

defined('ABSPATH') || exit;

$article = ashlar_block_article($block);

if (!$article) {
    return;
}

$sections  = ashlar_article_sections($article['id']);
$cta_label = trim(ashlar_get_option('header_cta_label'));
$cta_url   = trim(ashlar_get_option('header_cta_url'));
$title     = wp_strip_all_tags($attributes['title'] ?? 'In this article');
$cta_text  = wp_strip_all_tags($attributes['ctaText'] ?? '');

if (!$sections && ($cta_label === '' || $cta_url === '')) {
    return;
}

$wrapper = get_block_wrapper_attributes(['class' => 'article-toc']);
?>
<aside <?php echo $wrapper; // phpcs:ignore WordPress.Security.EscapeOutput ?>>
    <?php if (count($sections) > 1) : ?>
        <nav class="article-toc__nav" aria-label="<?php echo esc_attr($title); ?>" data-article-toc>
            <p class="article-toc__title" aria-hidden="true"><?php echo esc_html($title); ?></p>
            <ol class="article-toc__list">
                <?php foreach (array_keys($sections) as $index => $id) : ?>
                    <li>
                        <a class="article-toc__link" href="#<?php echo esc_attr($id); ?>">
                            <span class="article-toc__num" aria-hidden="true"><?php echo esc_html(sprintf('%02d', $index + 1)); ?></span>
                            <span><?php echo esc_html($sections[$id]); ?></span>
                        </a>
                    </li>
                <?php endforeach; ?>
            </ol>
        </nav>
    <?php endif; ?>

    <?php if ($cta_label !== '' && $cta_url !== '') : ?>
        <div class="article-toc__cta">
            <?php if ($cta_text !== '') : ?>
                <p class="article-toc__cta-text"><?php echo esc_html($cta_text); ?></p>
            <?php endif; ?>
            <a class="link" href="<?php echo esc_url(ashlar_url($cta_url)); ?>"><?php echo esc_html($cta_label); ?><?php echo ashlar_arrow(); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
        </div>
    <?php endif; ?>
</aside>
