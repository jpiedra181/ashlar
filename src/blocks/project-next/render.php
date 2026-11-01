<?php

/**
 * Render del proyecto siguiente (templates/single-project.html).
 *
 * Toda la franja es un único enlace (el texto visible le da nombre): la foto
 * es decorativa.
 *
 * @var array    $attributes Atributos del bloque.
 * @var WP_Block $block      Instancia del bloque.
 */

defined('ABSPATH') || exit;

$current = ashlar_block_project($block);
$next    = $current ? ashlar_next_project($current['id']) : null;

if (!$next) {
    return;
}

$theme   = in_array($attributes['theme'] ?? 'subtle', ['subtle', 'dark'], true) ? 'theme-' . $attributes['theme'] : '';
$meta    = implode(' · ', array_filter([$next['type'], ashlar_project_outcome($next)]));
$wrapper = get_block_wrapper_attributes(['class' => trim('project-next ' . $theme)]);
?>
<section <?php echo $wrapper; // phpcs:ignore WordPress.Security.EscapeOutput ?>>
    <a class="project-next__link" href="<?php echo esc_url($next['url']); ?>">
        <span class="project-next__body">
            <span class="project-next__label"><?php echo esc_html(wp_strip_all_tags($attributes['label'] ?? 'Next project')); ?></span>
            <span class="project-next__title"><?php echo esc_html(ashlar_project_name($next)); ?></span>
            <?php if ($meta) : ?>
                <span class="project-next__meta"><?php echo esc_html($meta); ?></span>
            <?php endif; ?>
            <span class="project-next__cta link"><?php echo esc_html(wp_strip_all_tags($attributes['linkLabel'] ?? 'See the project')); ?><?php echo ashlar_arrow(); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
        </span>
        <?php
        echo ashlar_media($next['image'], [ // phpcs:ignore WordPress.Security.EscapeOutput
            'class' => 'project-next__media',
            'sizes' => '(min-width: 1024px) 45vw, 100vw',
            'alt'   => '',
        ]);
        ?>
    </a>
</section>
