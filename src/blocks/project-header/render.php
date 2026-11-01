<?php

/**
 * Render de la cabecera del proyecto (templates/single-project.html).
 *
 *   Projects / Extensions / Elm Row                    Project 014 of 118
 *   REAR EXTENSION · HAMPSTEAD NW3 · 2025
 *   Elm Row (h1)                                       resumen
 *
 * @var array    $attributes Atributos del bloque.
 * @var WP_Block $block      Instancia del bloque.
 */

defined('ABSPATH') || exit;

$project = ashlar_block_project($block);

if (!$project) {
    echo ashlar_editor_notice(__('This block shows the project being viewed. Add projects in Projects → Add project.', 'ashlar')); // phpcs:ignore WordPress.Security.EscapeOutput
    return;
}

$projects_url = ashlar_projects_page_url();
[$position, $total] = ashlar_project_position($project['id']);
$anchor = '#projects-grid';

$wrapper = get_block_wrapper_attributes(['class' => 'project-header']);
?>
<section <?php echo $wrapper; // phpcs:ignore WordPress.Security.EscapeOutput ?>>
    <div class="project-header__inner wrap">
        <div class="project-header__top" data-intro style="--i:0">
            <nav class="project-header__crumbs" aria-label="<?php echo esc_attr(wp_strip_all_tags($attributes['breadcrumbLabel'] ?? 'Breadcrumb')); ?>">
                <ol>
                    <li><a href="<?php echo esc_url($projects_url); ?>"><?php echo esc_html(wp_strip_all_tags($attributes['projectsLabel'] ?? 'Projects')); ?></a></li>
                    <?php if ($project['category']) : ?>
                        <li><a href="<?php echo esc_url(add_query_arg('type', $project['category_slug'], $projects_url) . $anchor); ?>"><?php echo esc_html($project['category']); ?></a></li>
                    <?php endif; ?>
                    <li><a href="<?php echo esc_url($project['url']); ?>" aria-current="page"><?php echo esc_html($project['title']); ?></a></li>
                </ol>
            </nav>
            <?php if (!empty($attributes['showPosition']) && $position) : ?>
                <p class="project-header__position"><?php echo esc_html(strtr(wp_strip_all_tags($attributes['positionFormat'] ?? 'Project {n} of {total}'), ['{n}' => sprintf('%03d', $position), '{total}' => (string) $total])); ?></p>
            <?php endif; ?>
        </div>

        <div class="project-header__main">
            <div class="project-header__heading">
                <p class="project-header__eyebrow" data-intro style="--i:1"><?php echo esc_html(ashlar_project_eyebrow($project)); ?></p>
                <h1 class="project-header__title"><span class="intro-mask"><span class="intro-line" style="--i:1"><?php echo esc_html($project['title']); ?></span></span></h1>
            </div>
            <?php if ($project['summary']) : ?>
                <p class="project-header__summary" data-intro style="--i:2"><?php echo esc_html($project['summary']); ?></p>
            <?php endif; ?>
        </div>
    </div>
</section>
