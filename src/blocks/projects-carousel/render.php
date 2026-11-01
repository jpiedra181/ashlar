<?php

/**
 * Render de «Selected work»: llena el hueco guardado (save.js) con las
 * tarjetas de los proyectos que tienen «Show on the home page» activado. Si
 * no hay ninguno destacado, los más recientes.
 *
 * @var array    $attributes Atributos del bloque.
 * @var string   $content    HTML guardado por save.js.
 * @var WP_Block $block      Instancia del bloque.
 */

defined('ABSPATH') || exit;

$limit = max(1, min(8, (int) ($attributes['limit'] ?? 4)));
$posts = ashlar_get_projects([
    'posts_per_page' => $limit,
    'meta_query'     => [['key' => '_ashlar_featured', 'value' => '1']], // phpcs:ignore WordPress.DB.SlowDBQuery
]);

if (!$posts) {
    $posts = ashlar_get_projects(['posts_per_page' => $limit]);
}

$cards = '';
foreach ($posts as $index => $post) {
    $cards .= ashlar_project_card(ashlar_project($post), ['attrs' => ['data-carousel-item' => '']]);
}

// Vista previa del editor: solo las tarjetas.
if (($attributes['preview'] ?? '') === 'cards') {
    echo $cards // phpcs:ignore WordPress.Security.EscapeOutput -- tarjetas escapadas en ashlar_project_card()
        ? '<div class="carousel__slot">' . $cards . '</div>'
        : ashlar_editor_notice(__('No projects yet. Create them in Projects → Add project.', 'ashlar'));
    return;
}

echo preg_replace( // phpcs:ignore WordPress.Security.EscapeOutput -- HTML del propio bloque
    '/(<div[^>]*data-projects-slot[^>]*>)\s*(<\/div>)/',
    '$1' . str_replace(['\\', '$'], ['\\\\', '\$'], $cards) . '$2',
    $content,
    1
);
