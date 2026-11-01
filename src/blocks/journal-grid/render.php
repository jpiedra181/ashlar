<?php

/**
 * Render de «Journal articles» (ashlar/journal-grid).
 *
 * Funciona sin JavaScript, con parámetros en la URL:
 *   ?topic=<tema>  filtra · ?show=13  cuántos se ven
 *
 * Sin filtro, el artículo más reciente sale en grande (foto, pregunta y
 * respuesta corta); el resto, como tarjetas de pregunta (ashlar_article_card()).
 *
 * @var array    $attributes Atributos del bloque.
 * @var string   $content    Vacío (bloque dinámico).
 * @var WP_Block $block      Instancia del bloque.
 */

defined('ABSPATH') || exit;

$attributes = wp_parse_args($attributes, [
    'showFilters'    => true,
    'showCounts'     => true,
    'allLabel'       => 'All',
    'filtersLabel'   => 'Filter articles by topic',
    'showFeatured'   => true,
    'featuredTag'    => 'Latest',
    'answerLabel'    => 'The short answer',
    'featuredButton' => 'Read the full answer',
    'perPage'        => 7,
    'step'           => 6,
    'showingFormat'  => 'Showing {shown} of {total}',
    'moreFormat'     => 'Load {n} more',
    'emptyText'      => 'No articles on this topic yet.',
]);

// --------------------------------------------------
//	Estado (de la URL)
// --------------------------------------------------

// phpcs:disable WordPress.Security.NonceVerification.Recommended -- solo lectura, sin efectos
$terms = $attributes['showFilters'] ? get_terms([
    'taxonomy'   => 'category',
    'hide_empty' => true,
    'exclude'    => [(int) get_option('default_category')],
    'orderby'    => 'term_id',
]) : [];
$terms    = is_wp_error($terms) ? [] : $terms;
$topic    = isset($_GET['topic']) ? sanitize_key(wp_unslash($_GET['topic'])) : '';
$topic    = in_array($topic, wp_list_pluck($terms, 'slug'), true) ? $topic : '';
$per_page = max(1, min(60, (int) $attributes['perPage']));
$step     = max(1, min(60, (int) $attributes['step']));
$show     = isset($_GET['show']) ? max($per_page, min(500, absint($_GET['show']))) : $per_page;
// phpcs:enable

$ids       = ashlar_get_articles($topic ? ['category_name' => $topic] : []);
$all_count = $topic ? count(ashlar_get_articles()) : count($ids);
$total     = count($ids);

$featured = ($attributes['showFeatured'] && !$topic && $ids) ? array_shift($ids) : null;

$shown_ids = array_slice($ids, 0, max(0, $show - ($featured ? 1 : 0)));
$shown     = count($shown_ids) + ($featured ? 1 : 0);
$remaining = $total - $shown;

// --------------------------------------------------
//	URLs (enlaces normales que conservan el estado)
// --------------------------------------------------

$base = remove_query_arg(['topic', 'show'], add_query_arg([]));
if (ashlar_is_editor_preview()) {
    $base = ashlar_journal_page_url();
}
$anchor = '#' . (!empty($attributes['anchor']) ? $attributes['anchor'] : 'articles');
$url    = static function (array $args) use ($base, $anchor, $topic): string {
    $args = array_merge(['topic' => $topic], $args);
    return esc_url(add_query_arg(array_filter($args, static fn($value) => $value !== '' && $value !== null), $base) . $anchor);
};

$format  = static fn(string $text, array $pairs): string => strtr($text, $pairs);
$heading = $featured ? 'h3' : 'h2';

$wrapper = get_block_wrapper_attributes([
    'class' => 'journal-grid',
    'id'    => ltrim($anchor, '#'),
]);
?>
<section <?php echo $wrapper; // phpcs:ignore WordPress.Security.EscapeOutput ?>>
    <div class="journal-grid__inner wrap">
        <?php if ($terms) : ?>
            <nav class="journal-grid__filters" aria-label="<?php echo esc_attr(wp_strip_all_tags($attributes['filtersLabel'])); ?>">
                <ul>
                    <li>
                        <a class="chip" href="<?php echo $url(['topic' => '', 'show' => '']); // phpcs:ignore WordPress.Security.EscapeOutput ?>"<?php echo $topic ? '' : ' aria-current="true"'; ?>>
                            <?php echo esc_html(wp_strip_all_tags($attributes['allLabel'])); ?>
                            <?php if ($attributes['showCounts']) : ?><span class="chip__count"><?php echo esc_html((string) $all_count); ?></span><?php endif; ?>
                        </a>
                    </li>
                    <?php foreach ($terms as $term) : ?>
                        <li>
                            <a class="chip" href="<?php echo $url(['topic' => $term->slug, 'show' => '']); // phpcs:ignore WordPress.Security.EscapeOutput ?>"<?php echo $topic === $term->slug ? ' aria-current="true"' : ''; ?>>
                                <?php echo esc_html($term->name); ?>
                                <?php if ($attributes['showCounts']) : ?><span class="chip__count"><?php echo esc_html((string) $term->count); ?></span><?php endif; ?>
                            </a>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </nav>
        <?php endif; ?>

        <?php if ($featured) : ?>
            <?php $article = ashlar_article($featured); ?>
            <article class="journal-feature">
                <a class="journal-feature__media-link" href="<?php echo esc_url($article['url']); ?>" tabindex="-1" aria-hidden="true">
                    <?php
                    echo ashlar_media($article['image'], [ // phpcs:ignore WordPress.Security.EscapeOutput
                        'class'    => 'journal-feature__media',
                        'sizes'    => '(min-width: 1440px) 720px, (min-width: 1024px) 50vw, 100vw',
                        'alt'      => '',
                        'priority' => true,
                    ]);
                    ?>
                    <?php if ($attributes['featuredTag']) : ?>
                        <span class="journal-feature__tag"><?php echo esc_html(wp_strip_all_tags($attributes['featuredTag'])); ?></span>
                    <?php endif; ?>
                </a>
                <div class="journal-feature__body">
                    <p class="journal-feature__meta">
                        <?php if ($article['topic']) : ?>
                            <span class="journal-feature__topic"><?php echo esc_html($article['topic']); ?></span>
                        <?php endif; ?>
                        <span><?php echo esc_html(ashlar_article_minutes($article)); ?></span>
                        <time datetime="<?php echo esc_attr($article['datetime']); ?>"><?php echo esc_html($article['date']); ?></time>
                    </p>
                    <h2 class="journal-feature__title"><a href="<?php echo esc_url($article['url']); ?>"><?php echo esc_html($article['title']); ?></a></h2>
                    <?php if ($article['answer'] !== '') : ?>
                        <div class="journal-feature__answer">
                            <p class="journal-feature__label"><?php echo esc_html(wp_strip_all_tags($attributes['answerLabel'])); ?></p>
                            <p class="journal-feature__text"><?php echo esc_html($article['answer']); ?></p>
                        </div>
                    <?php endif; ?>
                    <?php if ($attributes['featuredButton']) : ?>
                        <?php
                        echo ashlar_button( // phpcs:ignore WordPress.Security.EscapeOutput
                            wp_strip_all_tags($attributes['featuredButton']),
                            $article['url'],
                            ['variant' => 'secondary', 'attrs' => ['aria-label' => sprintf('%s: %s', wp_strip_all_tags($attributes['featuredButton']), $article['title'])]]
                        );
                        ?>
                    <?php endif; ?>
                </div>
            </article>
        <?php endif; ?>

        <?php if ($shown_ids) : ?>
            <ul class="journal-grid__list">
                <?php foreach ($shown_ids as $id) : ?>
                    <li class="journal-grid__item">
                        <?php echo ashlar_article_card(ashlar_article($id), ['heading' => $heading]); // phpcs:ignore WordPress.Security.EscapeOutput ?>
                    </li>
                <?php endforeach; ?>
            </ul>
        <?php elseif (!$featured) : ?>
            <p class="journal-grid__empty"><?php echo esc_html(wp_strip_all_tags($attributes['emptyText'])); ?></p>
        <?php endif; ?>

        <?php if ($total > $per_page || $remaining > 0) : ?>
            <div class="journal-grid__more">
                <span class="journal-grid__progress" aria-hidden="true"><span style="width: <?php echo esc_attr((string) round($shown / $total * 100, 2)); ?>%"></span></span>
                <p class="journal-grid__count" role="status"><?php echo esc_html($format(wp_strip_all_tags($attributes['showingFormat']), ['{shown}' => $shown, '{total}' => $total])); ?></p>
                <?php if ($remaining > 0) : ?>
                    <a class="btn btn--outline journal-grid__more-btn" href="<?php echo $url(['show' => $show + $step]); // phpcs:ignore WordPress.Security.EscapeOutput ?>">
                        <span class="btn__label"><?php echo esc_html($format(wp_strip_all_tags($attributes['moreFormat']), ['{n}' => min($step, $remaining)])); ?></span>
                    </a>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    </div>
</section>
