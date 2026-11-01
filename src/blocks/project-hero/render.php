<?php

/**
 * Render de la foto principal del proyecto: mete la imagen destacada en el
 * hueco que guarda save.js.
 *
 * @var array    $attributes Atributos del bloque.
 * @var string   $content    HTML guardado.
 * @var WP_Block $block      Instancia del bloque.
 */

defined('ABSPATH') || exit;

$project = ashlar_block_project($block);
$image   = $project ? $project['image'] : 0;

if (!$image) {
    return;
}

$photo = ashlar_media($image, [
    'class'    => 'project-hero__media',
    'sizes'    => '100vw',
    'priority' => true,
    'intro'    => true,
]);

echo preg_replace( // phpcs:ignore WordPress.Security.EscapeOutput -- HTML del propio bloque y de wp_get_attachment_image()
    '/(<div[^>]*data-project-photo[^>]*>)\s*(<\/div>)/',
    '$1' . str_replace(['\\', '$'], ['\\\\', '\$'], $photo) . '$2',
    $content,
    1
);
