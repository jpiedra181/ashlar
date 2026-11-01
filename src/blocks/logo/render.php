<?php

/**
 * Render server-side del bloque Logotipo: la marca y el nombre del sitio
 * enlazados a la portada (ashlar_logo(), inc/helpers.php).
 *
 * @var array    $attributes Atributos del bloque (sin uso).
 * @var string   $content    Contenido interno (sin uso).
 * @var WP_Block $block      Instancia del bloque.
 */

defined('ABSPATH') || exit;

printf(
    '<div %s>%s</div>',
    get_block_wrapper_attributes(), // phpcs:ignore WordPress.Security.EscapeOutput
    ashlar_logo() // phpcs:ignore WordPress.Security.EscapeOutput -- escapado en el helper
);
