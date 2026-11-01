<?php

/**
 * Render de la franja de datos del proyecto: hasta seis columnas
 * (Programme, Ground floor, Fixed price, Final account, Architect, Site manager).
 *
 * @var array    $attributes Atributos del bloque.
 * @var WP_Block $block      Instancia del bloque.
 */

defined('ABSPATH') || exit;

$project = ashlar_block_project($block);
$facts   = $project ? ashlar_project_facts($project) : [];

if (!$facts) {
    echo ashlar_editor_notice(__('Fill in the Project details panel to show the facts here.', 'ashlar')); // phpcs:ignore WordPress.Security.EscapeOutput
    return;
}

$wrapper = get_block_wrapper_attributes(['class' => 'project-facts']);
?>
<section <?php echo $wrapper; // phpcs:ignore WordPress.Security.EscapeOutput ?>>
    <dl class="project-facts__list wrap">
        <?php foreach ($facts as $key => $fact) : ?>
            <div class="project-facts__item project-facts__item--<?php echo esc_attr($key); ?>">
                <dt><?php echo esc_html($fact['label']); ?></dt>
                <dd>
                    <span class="project-facts__value<?php echo !empty($fact['accent']) ? ' is-accent' : ''; ?>"><?php echo esc_html($fact['value']); ?></span>
                    <?php if ($fact['note'] !== '') : ?>
                        <span class="project-facts__note"><?php echo esc_html($fact['note']); ?></span>
                    <?php endif; ?>
                </dd>
            </div>
        <?php endforeach; ?>
    </dl>
</section>
