<?php

/**
 * Render de «Keep reading» (templates/single.html).
 *
 * Tres tarjetas de pregunta: primero las del mismo tema, luego las más
 * recientes. Sin otros artículos, no pinta nada.
 *
 * @var array    $attributes Atributos del bloque.
 * @var WP_Block $block      Instancia del bloque.
 */

defined('ABSPATH') || exit;

$current = ashlar_block_article($block);

if (!$current) {
    return;
}

$same_topic = $current['topic_slug']
    ? ashlar_get_articles(['category_name' => $current['topic_slug'], 'post__not_in' => [$current['id']], 'posts_per_page' => 3])
    : [];
$latest = ashlar_get_articles(['post__not_in' => array_merge([$current['id']], $same_topic), 'posts_per_page' => 3]);
$ids    = array_slice(array_merge($same_topic, $latest), 0, 3);

if (!$ids) {
    return;
}

$theme   = in_array($attributes['theme'] ?? 'subtle', ['subtle', 'dark'], true) ? 'theme-' . $attributes['theme'] : '';
$wrapper = get_block_wrapper_attributes(['class' => trim('article-next ' . $theme)]);
?>
<section <?php echo $wrapper; // phpcs:ignore WordPress.Security.EscapeOutput ?>>
    <div class="article-next__inner wrap">
        <div class="article-next__head">
            <h2 class="article-next__title" data-reveal><?php echo esc_html(wp_strip_all_tags($attributes['title'] ?? 'Keep reading')); ?></h2>
            <a class="link" href="<?php echo esc_url(ashlar_journal_page_url()); ?>" data-reveal><?php echo esc_html(wp_strip_all_tags($attributes['linkLabel'] ?? 'All the answers')); ?><?php echo ashlar_arrow(); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
        </div>
        <ul class="article-next__list">
            <?php foreach ($ids as $id) : ?>
                <li class="article-next__item" data-reveal>
                    <?php echo ashlar_article_card(ashlar_article($id)); // phpcs:ignore WordPress.Security.EscapeOutput ?>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>
</section>
