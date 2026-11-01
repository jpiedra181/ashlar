<?php

/**
 * Render de «All projects» (ashlar/projects-grid).
 *
 * Funciona entero sin JavaScript, con parámetros en la URL:
 *   ?type=<categoría>  filtra · ?sort=oldest  ordena · ?show=22  cuántos se ven
 * view.js solo evita recargar la página: pide la misma URL y cambia el bloque.
 *
 * Sin filtro, el primer proyecto (el más reciente, o el elegido) sale en
 * grande y cuenta en «Showing 10 of 118».
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
    'filtersLabel'   => 'Filter projects by type of job',
    'sortLabel'      => 'Sort',
    'newestLabel'    => 'Newest first',
    'oldestLabel'    => 'Oldest first',
    'showFeatured'   => true,
    'featuredId'     => 0,
    'featuredTag'    => 'Latest project',
    'featuredButton' => 'Read the project',
    'perPage'        => 10,
    'step'           => 12,
    'showingFormat'  => 'Showing {shown} of {total}',
    'moreFormat'     => 'Load {n} more',
    'emptyText'      => 'No projects of this type yet.',
]);

// --------------------------------------------------
//	Estado (de la URL)
// --------------------------------------------------

// phpcs:disable WordPress.Security.NonceVerification.Recommended -- solo lectura, sin efectos
$terms    = $attributes['showFilters'] ? get_terms(['taxonomy' => ASHLAR_PROJECT_CATEGORY, 'hide_empty' => true, 'orderby' => 'term_id']) : [];
$terms    = is_wp_error($terms) ? [] : $terms;
$slugs    = wp_list_pluck($terms, 'slug');
$type     = isset($_GET['type']) ? sanitize_key(wp_unslash($_GET['type'])) : '';
$type     = in_array($type, $slugs, true) ? $type : '';
$sort     = (isset($_GET['sort']) && $_GET['sort'] === 'oldest') ? 'oldest' : 'newest';
$per_page = max(1, min(60, (int) $attributes['perPage']));
$step     = max(1, min(60, (int) $attributes['step']));
$show     = isset($_GET['show']) ? max($per_page, min(500, absint($_GET['show']))) : $per_page;
// phpcs:enable

$query_args = [
    'posts_per_page' => 500,
    'fields'         => 'ids',
    'orderby'        => ['date' => $sort === 'oldest' ? 'ASC' : 'DESC', 'ID' => 'DESC'],
];
if ($type) {
    $query_args['tax_query'] = [['taxonomy' => ASHLAR_PROJECT_CATEGORY, 'field' => 'slug', 'terms' => $type]]; // phpcs:ignore WordPress.DB.SlowDBQuery
}

$ids       = ashlar_get_projects($query_args);
$all_count = $type ? count(ashlar_get_projects(['posts_per_page' => 500, 'fields' => 'ids'])) : count($ids);
$total     = count($ids);

// Proyecto destacado: solo sin filtro y ordenado por lo más reciente.
$featured = null;
if ($attributes['showFeatured'] && !$type && $sort === 'newest' && $ids) {
    $chosen   = (int) $attributes['featuredId'];
    $featured = ($chosen && in_array($chosen, $ids, true)) ? $chosen : $ids[0];
    $ids      = array_values(array_diff($ids, [$featured]));
}

$shown_ids = array_slice($ids, 0, max(0, $show - ($featured ? 1 : 0)));
$shown     = count($shown_ids) + ($featured ? 1 : 0);
$remaining = $total - $shown;

// --------------------------------------------------
//	URLs (sin JS: enlaces normales que conservan el estado)
// --------------------------------------------------

$base = remove_query_arg(['type', 'sort', 'show'], add_query_arg([]));
if (defined('REST_REQUEST') && REST_REQUEST) {
    // Vista previa del editor: los enlaces no navegan, pero que apunten a la página.
    $base = ashlar_projects_page_url();
}
$anchor = '#' . (!empty($attributes['anchor']) ? $attributes['anchor'] : 'projects-grid');
$url    = static function (array $args) use ($base, $anchor, $type, $sort): string {
    $args = array_merge(['type' => $type, 'sort' => $sort === 'oldest' ? 'oldest' : ''], $args);
    return esc_url(add_query_arg(array_filter($args, static fn($value) => $value !== '' && $value !== null), $base) . $anchor);
};

$format = static fn(string $text, array $pairs): string => strtr($text, $pairs);

$wrapper = get_block_wrapper_attributes([
    'class'              => 'projects-grid',
    'id'                 => ltrim($anchor, '#'),
    'data-projects-grid' => '',
]);
?>
<section <?php echo $wrapper; // phpcs:ignore WordPress.Security.EscapeOutput ?>>
    <div class="projects-grid__inner wrap">
        <div class="projects-grid__bar">
            <?php if ($terms) : ?>
                <nav class="projects-grid__filters" aria-label="<?php echo esc_attr(wp_strip_all_tags($attributes['filtersLabel'])); ?>">
                    <ul>
                        <li>
                            <a class="chip" href="<?php echo $url(['type' => '', 'show' => '']); // phpcs:ignore WordPress.Security.EscapeOutput ?>" data-projects-link<?php echo $type ? '' : ' aria-current="true"'; ?>>
                                <?php echo esc_html(wp_strip_all_tags($attributes['allLabel'])); ?>
                                <?php if ($attributes['showCounts']) : ?><span class="chip__count"><?php echo esc_html((string) $all_count); ?></span><?php endif; ?>
                            </a>
                        </li>
                        <?php foreach ($terms as $term) : ?>
                            <li>
                                <a class="chip" href="<?php echo $url(['type' => $term->slug, 'show' => '']); // phpcs:ignore WordPress.Security.EscapeOutput ?>" data-projects-link<?php echo $type === $term->slug ? ' aria-current="true"' : ''; ?>>
                                    <?php echo esc_html($term->name); ?>
                                    <?php if ($attributes['showCounts']) : ?><span class="chip__count"><?php echo esc_html((string) $term->count); ?></span><?php endif; ?>
                                </a>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                </nav>
            <?php endif; ?>

            <form class="projects-grid__sort" method="get" action="<?php echo esc_url($base . $anchor); ?>" data-projects-sort>
                <?php if ($type) : ?>
                    <input type="hidden" name="type" value="<?php echo esc_attr($type); ?>">
                <?php endif; ?>
                <label for="<?php echo esc_attr(ltrim($anchor, '#') . '-sort'); ?>"><?php echo esc_html(wp_strip_all_tags($attributes['sortLabel'])); ?></label>
                <span class="projects-grid__select">
                    <select id="<?php echo esc_attr(ltrim($anchor, '#') . '-sort'); ?>" name="sort">
                        <option value="newest"<?php selected($sort, 'newest'); ?>><?php echo esc_html(wp_strip_all_tags($attributes['newestLabel'])); ?></option>
                        <option value="oldest"<?php selected($sort, 'oldest'); ?>><?php echo esc_html(wp_strip_all_tags($attributes['oldestLabel'])); ?></option>
                    </select>
                    <?php echo ashlar_arrow('down', 'projects-grid__select-icon'); // phpcs:ignore WordPress.Security.EscapeOutput ?>
                </span>
                <noscript><button type="submit" class="chip"><?php esc_html_e('Apply', 'ashlar'); ?></button></noscript>
            </form>
        </div>

        <?php if ($featured) : ?>
            <?php
            $project = ashlar_project($featured);
            $facts   = ashlar_project_facts($project);
            $lines   = [];
            if (isset($facts['programme'])) {
                $lines[] = [$facts['programme']['label'], implode(', ', array_filter([$facts['programme']['value'], $project['schedule_note'] ? mb_strtolower($project['schedule_note']) : '']))];
            }
            if (isset($facts['area'])) {
                $lines[] = [$facts['area']['label'], $facts['area']['value']];
            }
            if ($project['delta'] !== null) {
                $lines[] = [__('Final account', 'ashlar'), abs($project['delta']) < 0.05 ? __('On fixed price', 'ashlar') : sprintf(/* translators: %s: deviation, e.g. +0.8%. */ __('%s on fixed price', 'ashlar'), ashlar_project_delta($project))];
            }
            ?>
            <article class="projects-feature">
                <a class="projects-feature__media-link" href="<?php echo esc_url($project['url']); ?>" tabindex="-1" aria-hidden="true">
                    <?php
                    echo ashlar_media($project['image'], [ // phpcs:ignore WordPress.Security.EscapeOutput
                        'class'    => 'projects-feature__media',
                        'sizes'    => '(min-width: 1440px) 800px, (min-width: 1024px) 55vw, 100vw',
                        'alt'      => '',
                        'priority' => true,
                    ]);
                    ?>
                    <?php if ($attributes['featuredTag']) : ?>
                        <span class="projects-feature__tag"><?php echo esc_html(wp_strip_all_tags($attributes['featuredTag'])); ?></span>
                    <?php endif; ?>
                </a>
                <div class="projects-feature__body">
                    <p class="projects-feature__eyebrow"><?php echo esc_html(ashlar_project_eyebrow($project)); ?></p>
                    <h2 class="projects-feature__title"><a href="<?php echo esc_url($project['url']); ?>"><?php echo esc_html($project['title']); ?></a></h2>
                    <?php if ($project['summary']) : ?>
                        <p class="projects-feature__summary"><?php echo esc_html($project['summary']); ?></p>
                    <?php endif; ?>
                    <?php if ($lines) : ?>
                        <dl class="projects-feature__facts">
                            <?php foreach ($lines as [$label, $value]) : ?>
                                <div>
                                    <dt><?php echo esc_html($label); ?></dt>
                                    <dd><?php echo esc_html($value); ?></dd>
                                </div>
                            <?php endforeach; ?>
                        </dl>
                    <?php endif; ?>
                    <?php if ($attributes['featuredButton']) : ?>
                        <?php
                        echo ashlar_button( // phpcs:ignore WordPress.Security.EscapeOutput
                            wp_strip_all_tags($attributes['featuredButton']),
                            $project['url'],
                            ['variant' => 'secondary', 'attrs' => ['aria-label' => sprintf('%s: %s', wp_strip_all_tags($attributes['featuredButton']), $project['title'])]]
                        );
                        ?>
                    <?php endif; ?>
                </div>
            </article>
        <?php endif; ?>

        <?php if ($shown_ids) : ?>
            <ul class="projects-grid__list">
                <?php foreach ($shown_ids as $index => $id) : ?>
                    <li class="projects-grid__item" data-projects-item>
                        <?php
                        echo ashlar_project_card(ashlar_project($id), [ // phpcs:ignore WordPress.Security.EscapeOutput
                            'ratio'   => '',
                            'sizes'   => '(min-width: 1024px) 400px, 100vw',
                            'heading' => 'h3',
                            'short'   => true,
                        ]);
                        ?>
                    </li>
                <?php endforeach; ?>
            </ul>
        <?php elseif (!$featured) : ?>
            <p class="projects-grid__empty"><?php echo esc_html(wp_strip_all_tags($attributes['emptyText'])); ?></p>
        <?php endif; ?>

        <?php if ($total) : ?>
            <div class="projects-grid__more">
                <span class="projects-grid__progress" aria-hidden="true"><span style="width: <?php echo esc_attr((string) round($shown / $total * 100, 2)); ?>%"></span></span>
                <p class="projects-grid__count" role="status"><?php echo esc_html($format(wp_strip_all_tags($attributes['showingFormat']), ['{shown}' => $shown, '{total}' => $total])); ?></p>
                <?php if ($remaining > 0) : ?>
                    <a class="btn btn--outline projects-grid__more-btn" href="<?php echo $url(['show' => $show + $step]); // phpcs:ignore WordPress.Security.EscapeOutput ?>" data-projects-more>
                        <span class="btn__label"><?php echo esc_html($format(wp_strip_all_tags($attributes['moreFormat']), ['{n}' => min($step, $remaining)])); ?></span>
                    </a>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    </div>
</section>
