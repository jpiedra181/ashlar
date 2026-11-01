<?php

/**
 * Render server-side del bloque Menú (columna del pie).
 *
 * Pinta los enlaces de primer nivel de una ubicación de Apariencia → Menús.
 * Ser dinámico es justo la gracia: las URL se resuelven en cada petición desde
 * la página a la que apunta cada elemento, así que renombrar el slug de una
 * página nunca deja un enlace muerto en el pie.
 *
 * Título de la columna: el del bloque si lo tiene; si no, el nombre del menú.
 *
 * @var array    $attributes Atributos del bloque (location, title, showTitle, ariaLabel).
 * @var string   $content    Contenido interno (sin uso).
 * @var WP_Block $block      Instancia del bloque.
 */

defined('ABSPATH') || exit;

$menu_location = $attributes['location'] ?? 'footer';
$show_title    = $attributes['showTitle'] ?? true;
$title         = trim($attributes['title'] ?? '') ?: ashlar_nav_menu_name($menu_location);
$menu_label    = trim($attributes['ariaLabel'] ?? '') ?: ($title ?: __('Menu', 'ashlar'));
$items         = ashlar_menu_items($menu_location);

if (!$items) {
    echo ashlar_editor_notice( // phpcs:ignore WordPress.Security.EscapeOutput
        sprintf(
            /* translators: %s: nombre de la ubicación de menú. */
            __('No menu is assigned to “%s”. Create it and assign it in Appearance → Menus.', 'ashlar'),
            get_registered_nav_menus()[$menu_location] ?? $menu_location
        )
    );

    return;
}

$wrapper_attributes = get_block_wrapper_attributes(['class' => 'nav-menu']);
?>
<nav <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput ?> aria-label="<?php echo esc_attr($menu_label); ?>">
    <?php if ($show_title && $title !== '') : ?>
        <h2 class="nav-menu__title eyebrow t-soft"><?php echo esc_html($title); ?></h2>
    <?php endif; ?>
    <ul class="nav-menu__list">
        <?php foreach ($items as $item) : ?>
            <li>
                <a class="nav-menu__link" href="<?php echo esc_url($item['url']); ?>"<?php echo $item['current'] ? ' aria-current="' . esc_attr($item['current']) . '"' : ''; ?><?php echo $item['target'] === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : ''; ?>>
                    <?php echo esc_html($item['title']); ?>
                </a>
            </li>
        <?php endforeach; ?>
    </ul>
</nav>
