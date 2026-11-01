<?php

/**
 * Render server-side del bloque Menú de cabecera.
 *
 * Emite, a partir de la ubicación «Header — main menu» de Apariencia → Menús
 * y de Options → Header / Contact:
 *
 *  - la navegación de escritorio (≥1024 px), sin el enlace del botón;
 *  - el teléfono (≥1024 px) y el botón «Get a rough price» (≥768 px);
 *  - el botón de menú (<1024 px) y el menú móvil (<dialog>) con la lista
 *    numerada (título + descripción del elemento como subtítulo), la línea
 *    «On site now», el botón y el contacto.
 *
 * El wrapper usa `display: contents`: sus piezas son hijas directas de la fila
 * de la cabecera, que las reparte (logo · navegación · acciones).
 * El estado del diálogo lo lleva src/js/modules/menu.js; el estilo,
 * src/scss/layout/_header.scss.
 *
 * @var array    $attributes Atributos del bloque (location, ariaLabel).
 * @var string   $content    Contenido interno (sin uso).
 * @var WP_Block $block      Instancia del bloque.
 */

defined('ABSPATH') || exit;

$menu_location = $attributes['location'] ?? 'primary';
$menu_label    = $attributes['ariaLabel'] ?: __('Main', 'ashlar');
$items         = ashlar_menu_items($menu_location);

$cta_label  = trim(ashlar_get_option('header_cta_label'));
$cta_url    = trim(ashlar_get_option('header_cta_url'));
$has_cta    = $cta_label !== '' && $cta_url !== '';
$show_phone = strtolower(trim(ashlar_get_option('header_show_phone'))) === 'yes';
$live_text  = trim(ashlar_get_option('menu_live_text'));
$contact    = ashlar_contact();

if (!$items) {
    echo ashlar_editor_notice( // phpcs:ignore WordPress.Security.EscapeOutput
        sprintf(
            /* translators: %s: menu location name. */
            __('No menu is assigned to “%s”. Create it and assign it in Appearance → Menus.', 'ashlar'),
            get_registered_nav_menus()[$menu_location] ?? $menu_location
        )
    );
}

// En escritorio el botón ya lleva a esa página: no se repite en la navegación.
$desktop_items = array_filter(
    $items,
    static fn(array $item): bool => !($has_cta && ashlar_same_url($item['url'], $cta_url))
);

$is_cta_current = $has_cta && ashlar_same_url($cta_url, (string) ($_SERVER['REQUEST_URI'] ?? '')); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput

$wrapper_attributes = get_block_wrapper_attributes(['class' => 'site-header__menu']);

/**
 * Atributos de un enlace de menú (destino y estado actual).
 */
$link_attrs = static function (array $item): string {
    $attrs = sprintf(' href="%s"', esc_url($item['url']));

    if ($item['current']) {
        $attrs .= sprintf(' aria-current="%s"', esc_attr($item['current']));
    }

    if ($item['target'] === '_blank') {
        $attrs .= ' target="_blank" rel="noopener noreferrer"';
    }

    return $attrs;
};

$icon_menu  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><path d="M3 8h18M3 16h18"/></svg>';
$icon_close = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>';
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput ?>>

    <?php if ($desktop_items) : ?>
        <nav class="site-nav" aria-label="<?php echo esc_attr($menu_label); ?>">
            <ul class="site-nav__list">
                <?php foreach ($desktop_items as $item) : ?>
                    <li><a class="site-nav__link"<?php echo $link_attrs($item); // phpcs:ignore WordPress.Security.EscapeOutput ?>><?php echo esc_html($item['title']); ?></a></li>
                <?php endforeach; ?>
            </ul>
        </nav>
    <?php endif; ?>

    <div class="site-header__actions">
        <?php if ($show_phone && $contact['phone'] !== '') : ?>
            <a class="site-header__phone" href="<?php echo esc_url($contact['phone_href']); ?>"><?php echo esc_html($contact['phone']); ?></a>
        <?php endif; ?>

        <?php
        if ($has_cta) {
            echo ashlar_button($cta_label, $cta_url, [ // phpcs:ignore WordPress.Security.EscapeOutput
                'class' => 'site-header__cta',
                'attrs' => ['aria-current' => $is_cta_current ? 'page' : null],
            ]);
        }
        ?>

        <?php if ($items) : ?>
            <button type="button" class="menu-toggle" aria-haspopup="dialog" aria-controls="site-menu" aria-expanded="false" aria-label="<?php esc_attr_e('Menu', 'ashlar'); ?>" data-menu-open>
                <?php echo $icon_menu; // phpcs:ignore WordPress.Security.EscapeOutput ?>
            </button>
        <?php endif; ?>
    </div>

    <?php if ($items) : ?>
        <dialog id="site-menu" class="menu theme-dark" aria-label="<?php esc_attr_e('Menu', 'ashlar'); ?>" data-menu data-lenis-prevent>
            <div class="menu__inner wrap">
                <div class="menu__top">
                    <?php echo ashlar_logo(); // phpcs:ignore WordPress.Security.EscapeOutput ?>
                    <button type="button" class="menu-close" aria-label="<?php esc_attr_e('Close menu', 'ashlar'); ?>" data-menu-close>
                        <?php echo $icon_close; // phpcs:ignore WordPress.Security.EscapeOutput ?>
                    </button>
                </div>

                <nav class="menu__nav" aria-label="<?php echo esc_attr($menu_label); ?>">
                    <ol class="menu__list">
                        <?php foreach (array_values($desktop_items) as $index => $item) : ?>
                            <li class="menu__item">
                                <a class="menu__link"<?php echo $link_attrs($item); // phpcs:ignore WordPress.Security.EscapeOutput ?> data-menu-link>
                                    <span class="menu__num" aria-hidden="true"><?php echo esc_html(str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT)); ?></span>
                                    <span class="menu__text">
                                        <span class="menu__label"><?php echo esc_html($item['title']); ?></span>
                                        <?php if ($item['description'] !== '') : ?>
                                            <span class="menu__sub"><?php echo esc_html($item['description']); ?></span>
                                        <?php endif; ?>
                                    </span>
                                    <?php echo ashlar_arrow('right', 'menu__arrow'); // phpcs:ignore WordPress.Security.EscapeOutput ?>
                                </a>
                            </li>
                        <?php endforeach; ?>
                    </ol>
                </nav>

                <div class="menu__footer" data-menu-footer>
                    <?php if ($live_text !== '') : ?>
                        <p class="menu__live"><?php echo esc_html($live_text); ?></p>
                    <?php endif; ?>

                    <?php
                    if ($has_cta) {
                        echo ashlar_button($cta_label, $cta_url, ['class' => 'menu__cta']); // phpcs:ignore WordPress.Security.EscapeOutput
                    }
                    ?>

                    <?php if ($contact['phone'] !== '' || $contact['email'] !== '') : ?>
                        <p class="menu__contact">
                            <?php if ($contact['phone'] !== '') : ?>
                                <a href="<?php echo esc_url($contact['phone_href']); ?>"><?php echo esc_html($contact['phone']); ?></a>
                            <?php endif; ?>
                            <?php if ($contact['email'] !== '') : ?>
                                <a href="<?php echo esc_url('mailto:' . $contact['email']); ?>"><?php echo esc_html($contact['email']); ?></a>
                            <?php endif; ?>
                        </p>
                    <?php endif; ?>
                </div>
            </div>
        </dialog>
    <?php endif; ?>

</div>
