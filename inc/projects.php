<?php

/**
 * Projects
 *
 * Tipo de contenido `project` y su ficha. Cada proyecto se edita como una
 * página: título (la calle: «Elm Row»), foto principal (imagen destacada),
 * resumen, categoría (Extensions, Lofts…) y, en el panel «Project details»
 * (src/admin/project-panel.js), los datos de obra: tipo, año, m² antes y
 * después, barrio, semanas, precio cerrado, liquidación final, arquitecto,
 * jefe de obra y si sale en la portada.
 *
 * El cuerpo de la página (las secciones «The brief», «The plan», «On site»…)
 * son bloques ashlar/project-* dentro del contenido del proyecto; la
 * plantilla templates/single-project.html pone alrededor la cabecera
 * (ashlar/project-header) y el proyecto siguiente (ashlar/project-next).
 *
 * Los datos los usan el carrusel de la portada, el listado de Projects
 * (destacado y rejilla) y la ficha.
 */

defined('ABSPATH') || exit;

const ASHLAR_PROJECT = 'project';
const ASHLAR_PROJECT_CATEGORY = 'project_category';

add_action('init', 'ashlar_register_project_type');

function ashlar_register_project_type(): void
{
    register_post_type(ASHLAR_PROJECT, [
        'labels' => [
            'name'               => __('Projects', 'ashlar'),
            'singular_name'      => __('Project', 'ashlar'),
            'add_new'            => __('Add project', 'ashlar'),
            'add_new_item'       => __('Add project', 'ashlar'),
            'edit_item'          => __('Edit project', 'ashlar'),
            'new_item'           => __('New project', 'ashlar'),
            'view_item'          => __('View project', 'ashlar'),
            'search_items'       => __('Search projects', 'ashlar'),
            'not_found'          => __('No projects yet.', 'ashlar'),
            'not_found_in_trash' => __('No projects in the trash.', 'ashlar'),
            'all_items'          => __('All projects', 'ashlar'),
            'menu_name'          => __('Projects', 'ashlar'),
            'featured_image'     => __('Main photo', 'ashlar'),
            'set_featured_image' => __('Choose the main photo', 'ashlar'),
        ],
        'public'        => true,
        // El listado lo pinta un bloque en la página Projects: un archivo
        // nativo duplicaría contenido.
        'has_archive'   => false,
        'menu_icon'     => 'dashicons-building',
        'menu_position' => 6,
        'show_in_rest'  => true,
        'rewrite'       => ['slug' => 'projects', 'with_front' => false],
        // page-attributes da el orden manual; custom-fields hace que la REST
        // acepte los meta registrados abajo (si no, se descartan en silencio).
        'supports'      => ['title', 'editor', 'thumbnail', 'excerpt', 'page-attributes', 'revisions', 'custom-fields'],
        // Un proyecto nuevo arranca con todas las secciones de la ficha (con
        // los textos de ejemplo de cada bloque); se quitan las que no hagan falta.
        'template'      => ashlar_project_template(),
        'template_lock' => false,
    ]);

    $auth = static fn(): bool => current_user_can('edit_posts');

    $meta = [
        '_ashlar_type'           => ['type' => 'string', 'default' => ''],
        '_ashlar_year'           => ['type' => 'integer', 'default' => 0],
        '_ashlar_sqm'            => ['type' => 'integer', 'default' => 0],
        '_ashlar_sqm_before'     => ['type' => 'integer', 'default' => 0],
        '_ashlar_area_label'     => ['type' => 'string', 'default' => ''],
        '_ashlar_borough'        => ['type' => 'string', 'default' => ''],
        '_ashlar_postcode'       => ['type' => 'string', 'default' => ''],
        '_ashlar_weeks'          => ['type' => 'integer', 'default' => 0],
        '_ashlar_schedule_note'  => ['type' => 'string', 'default' => ''],
        '_ashlar_price'          => ['type' => 'integer', 'default' => 0],
        '_ashlar_price_note'     => ['type' => 'string', 'default' => ''],
        '_ashlar_final'          => ['type' => 'integer', 'default' => 0],
        '_ashlar_final_note'     => ['type' => 'string', 'default' => ''],
        '_ashlar_architect'      => ['type' => 'string', 'default' => ''],
        '_ashlar_architect_note' => ['type' => 'string', 'default' => ''],
        '_ashlar_manager'        => ['type' => 'string', 'default' => ''],
        '_ashlar_manager_note'   => ['type' => 'string', 'default' => ''],
        '_ashlar_featured'       => ['type' => 'boolean', 'default' => false],
    ];

    foreach ($meta as $key => $args) {
        register_post_meta(ASHLAR_PROJECT, $key, array_merge($args, [
            'single'        => true,
            'show_in_rest'  => true,
            'auth_callback' => $auth,
        ]));
    }

    // Categoría de obra: los filtros del listado («Extensions 41»). Jerárquica
    // solo para que el editor muestre casillas en lugar de un campo de etiquetas.
    register_taxonomy(ASHLAR_PROJECT_CATEGORY, ASHLAR_PROJECT, [
        'labels' => [
            'name'          => __('Categories', 'ashlar'),
            'singular_name' => __('Category', 'ashlar'),
            'menu_name'     => __('Categories', 'ashlar'),
            'all_items'     => __('All categories', 'ashlar'),
            'edit_item'     => __('Edit category', 'ashlar'),
            'add_new_item'  => __('Add category', 'ashlar'),
            'search_items'  => __('Search categories', 'ashlar'),
            'not_found'     => __('No categories yet.', 'ashlar'),
        ],
        'description'       => __('Type of job, used for the filters on the Projects page.', 'ashlar'),
        'hierarchical'      => true,
        'public'            => false,
        'show_ui'           => true,
        'show_in_rest'      => true,
        'show_admin_column' => true,
        'rewrite'           => false,
    ]);
}

/**
 * Secciones con las que empieza un proyecto nuevo.
 */
function ashlar_project_template(): array
{
    return [
        ['ashlar/project-hero'],
        ['ashlar/project-facts'],
        ['ashlar/project-brief'],
        ['ashlar/before-after', ['theme' => 'light', 'chapterNum' => '02', 'title' => 'Same garden, eight months apart.', 'buttonLabel' => '', 'aside' => 'March 2025 → November 2025', 'changes' => []]],
        ['ashlar/project-plan'],
        ['ashlar/project-build'],
        ['ashlar/project-reports'],
        ['ashlar/project-cost'],
        ['ashlar/client-story', ['layout' => 'bleed', 'videoLabel' => 'Watch Hannah and James · 2:14', 'quote' => '“The Friday reports meant we never had to chase anyone. In 22 weeks I made exactly zero angry phone calls.”', 'project' => 'Elm Row, NW3 · moved back into the whole house in week 22', 'linkLabel' => '']],
        ['ashlar/project-team'],
    ];
}

// --------------------------------------------------
//	Editor del proyecto
// --------------------------------------------------

add_action('enqueue_block_editor_assets', 'ashlar_project_editor_assets');

function ashlar_project_editor_assets(): void
{
    $screen = get_current_screen();
    if (!$screen || $screen->post_type !== ASHLAR_PROJECT) {
        return;
    }

    $asset = ashlar_asset('admin/project-panel');
    wp_enqueue_script(
        'ashlar-project-panel',
        get_template_directory_uri() . '/build/admin/project-panel.js',
        $asset['dependencies'],
        $asset['version'],
        true
    );

    if (file_exists(get_template_directory() . '/build/admin/project-panel.css')) {
        wp_enqueue_style('ashlar-project-panel', get_template_directory_uri() . '/build/admin/project-panel.css', ['wp-components'], $asset['version']);
    }
}

// Columnas del listado: foto, tipo, año y si sale en la portada.
add_filter('manage_' . ASHLAR_PROJECT . '_posts_columns', static function (array $columns): array {
    return [
        'cb'              => $columns['cb'],
        'ashlar_photo'    => '<span class="screen-reader-text">' . esc_html__('Photo', 'ashlar') . '</span>',
        'title'           => __('Project', 'ashlar'),
        'ashlar_type'     => __('Type', 'ashlar'),
        'ashlar_year'     => __('Year', 'ashlar'),
        'ashlar_featured' => __('Home page', 'ashlar'),
        'date'            => $columns['date'],
    ];
});

add_action('manage_' . ASHLAR_PROJECT . '_posts_custom_column', static function (string $column, int $post_id): void {
    switch ($column) {
        case 'ashlar_photo':
            echo get_the_post_thumbnail($post_id, [64, 64], ['class' => 'ashlar-list-thumb', 'alt' => '']);
            break;
        case 'ashlar_type':
            echo esc_html(get_post_meta($post_id, '_ashlar_type', true));
            break;
        case 'ashlar_year':
            echo esc_html((string) (get_post_meta($post_id, '_ashlar_year', true) ?: ''));
            break;
        case 'ashlar_featured':
            echo get_post_meta($post_id, '_ashlar_featured', true) ? '<span class="ashlar-badge">' . esc_html__('Featured', 'ashlar') . '</span>' : '';
            break;
    }
}, 10, 2);

// --------------------------------------------------
//	Datos y markup compartidos por los bloques
// --------------------------------------------------

/**
 * Proyectos publicados, en el orden manual (y luego por fecha).
 *
 * @param array $args Argumentos extra de get_posts (p. ej. solo destacados).
 * @return WP_Post[]
 */
function ashlar_get_projects(array $args = []): array
{
    return get_posts(array_merge([
        'post_type'      => ASHLAR_PROJECT,
        'post_status'    => 'publish',
        'posts_per_page' => 50,
        'orderby'        => ['menu_order' => 'ASC', 'date' => 'DESC'],
    ], $args));
}

/**
 * Ficha de un proyecto lista para pintar.
 */
function ashlar_project(WP_Post|int $post): array
{
    $post  = get_post($post);
    $get   = static fn(string $key) => get_post_meta($post->ID, '_ashlar_' . $key, true);
    $price = (int) $get('price');
    $final = (int) $get('final');
    $terms = get_the_terms($post, ASHLAR_PROJECT_CATEGORY);
    $term  = ($terms && !is_wp_error($terms)) ? $terms[0] : null;

    return [
        'id'             => $post->ID,
        'title'          => get_the_title($post),
        'url'            => get_permalink($post),
        // Solo el resumen escrito a mano: el automático repetiría el texto.
        'summary'        => trim(wp_strip_all_tags($post->post_excerpt)),
        'type'           => (string) $get('type'),
        'category'       => $term ? $term->name : '',
        'category_slug'  => $term ? $term->slug : '',
        'year'           => (int) $get('year'),
        'sqm'            => (int) $get('sqm'),
        'sqm_before'     => (int) $get('sqm_before'),
        'area_label'     => (string) $get('area_label'),
        'borough'        => (string) $get('borough'),
        'postcode'       => (string) $get('postcode'),
        'weeks'          => (int) $get('weeks'),
        'schedule_note'  => (string) $get('schedule_note'),
        'price'          => $price,
        'price_note'     => (string) $get('price_note'),
        'final'          => $final,
        'final_note'     => (string) $get('final_note'),
        // Desviación sobre el precio cerrado, en %, con un decimal.
        'delta'          => ($price && $final) ? round(($final - $price) / $price * 100, 1) : null,
        'architect'      => (string) $get('architect'),
        'architect_note' => (string) $get('architect_note'),
        'manager'        => (string) $get('manager'),
        'manager_note'   => (string) $get('manager_note'),
        'featured'       => (bool) $get('featured'),
        'image'          => (int) get_post_thumbnail_id($post),
    ];
}

/** «Elm Row, Hampstead»: el nombre con el que sale en tarjetas y enlaces. */
function ashlar_project_name(array $project): string
{
    return implode(', ', array_filter([$project['title'], $project['borough']]));
}

/** «Rear extension · Hampstead NW3 · 2025». */
function ashlar_project_eyebrow(array $project): string
{
    $place = trim($project['borough'] . ' ' . $project['postcode']);

    return implode(' · ', array_filter([$project['type'], $place, $project['year'] ?: '']));
}

/** «+0.8%» / «−2.1%» (null si no hay precio y liquidación). */
function ashlar_project_delta(array $project): string
{
    if ($project['delta'] === null) {
        return '';
    }

    return ($project['delta'] > 0 ? '+' : ($project['delta'] < 0 ? '−' : '')) . number_format_i18n(abs($project['delta']), 1) . '%';
}

/** Libras sin decimales: «£148,500». */
function ashlar_money(int $amount): string
{
    return '£' . number_format_i18n($amount);
}

/**
 * «22 weeks · +0.8% on fixed price» / «12 weeks · on fixed price».
 * Con $short, la desviación va sola: «34 weeks · +1.6%» (rejilla).
 */
function ashlar_project_outcome(array $project, bool $short = false): string
{
    $parts = [];

    if ($project['weeks']) {
        /* translators: %d: number of weeks. */
        $parts[] = sprintf(_n('%d week', '%d weeks', $project['weeks'], 'ashlar'), $project['weeks']);
    }

    if ($project['delta'] !== null) {
        if (abs($project['delta']) < 0.05) {
            $parts[] = __('on fixed price', 'ashlar');
        } else {
            /* translators: %s: deviation from the fixed price, e.g. +0.8%. */
            $parts[] = $short ? ashlar_project_delta($project) : sprintf(__('%s on fixed price', 'ashlar'), ashlar_project_delta($project));
        }
    }

    return implode(' · ', $parts);
}

/**
 * Datos de la ficha técnica (franja bajo la foto y proyecto destacado).
 * Cada uno: label, value, note y, si toca, accent. Los vacíos no salen.
 *
 * @return array<string, array{label: string, value: string, note: string, accent?: bool}>
 */
function ashlar_project_facts(array $project): array
{
    $facts = [];

    if ($project['weeks']) {
        $facts['programme'] = [
            'label' => __('Programme', 'ashlar'),
            /* translators: %d: number of weeks. */
            'value' => sprintf(_n('%d week', '%d weeks', $project['weeks'], 'ashlar'), $project['weeks']),
            'note'  => $project['schedule_note'],
        ];
    }

    if ($project['sqm']) {
        $grew = $project['sqm_before'] && $project['sqm_before'] !== $project['sqm'];
        $facts['area'] = [
            'label' => $project['area_label'] ?: __('Area', 'ashlar'),
            'value' => $grew ? sprintf('%d → %d m²', $project['sqm_before'], $project['sqm']) : sprintf('%d m²', $project['sqm']),
            'note'  => $grew ? sprintf('%+d m²', $project['sqm'] - $project['sqm_before']) : '',
        ];
    }

    if ($project['price']) {
        $facts['price'] = [
            'label' => __('Fixed price', 'ashlar'),
            'value' => ashlar_money($project['price']),
            'note'  => $project['price_note'],
        ];
    }

    if ($project['final']) {
        $delta = abs((float) $project['delta']) < 0.05 ? __('On fixed price', 'ashlar') : ashlar_project_delta($project);
        $facts['final'] = [
            'label'  => __('Final account', 'ashlar'),
            'value'  => ashlar_money($project['final']),
            'note'   => implode(', ', array_filter([$delta, $project['final_note']])),
            'accent' => true,
        ];
    }

    if ($project['architect']) {
        $facts['architect'] = ['label' => __('Architect', 'ashlar'), 'value' => $project['architect'], 'note' => $project['architect_note']];
    }

    if ($project['manager']) {
        $facts['manager'] = ['label' => __('Site manager', 'ashlar'), 'value' => $project['manager'], 'note' => $project['manager_note']];
    }

    return $facts;
}

/**
 * Posición del proyecto en la historia de la empresa: «Project 014 of 118»
 * (por fecha de publicación, el más antiguo es el 1).
 *
 * @return array{0: int, 1: int} [posición, total]
 */
function ashlar_project_position(int $post_id): array
{
    $ids = get_posts([
        'post_type'      => ASHLAR_PROJECT,
        'post_status'    => 'publish',
        'posts_per_page' => 500,
        'orderby'        => ['date' => 'ASC', 'ID' => 'ASC'],
        'fields'         => 'ids',
    ]);

    $index = array_search($post_id, $ids, true);

    return [$index === false ? 0 : $index + 1, count($ids)];
}

/**
 * Proyecto que pinta un bloque de la ficha (ashlar/project-*).
 *
 * El de la página que se está viendo (contexto postId). En el editor de
 * plantillas no hay proyecto: se ilustra con el primero de la lista.
 */
function ashlar_block_project(WP_Block $block): ?array
{
    $post_id = (int) ($block->context['postId'] ?? 0) ?: (int) get_the_ID();

    if ($post_id && get_post_type($post_id) === ASHLAR_PROJECT) {
        return ashlar_project($post_id);
    }

    if (ashlar_is_editor_preview()) {
        $first = ashlar_get_projects(['posts_per_page' => 1]);

        return $first ? ashlar_project($first[0]) : null;
    }

    return null;
}

/**
 * Proyecto siguiente en el orden de la lista (el último enlaza con el primero).
 */
function ashlar_next_project(int $post_id): ?array
{
    $ids = ashlar_get_projects(['fields' => 'ids']);

    if (count($ids) < 2) {
        return null;
    }

    $index = array_search($post_id, $ids, true);
    $next  = $ids[$index === false ? 0 : ($index + 1) % count($ids)];

    return ashlar_project($next);
}

/**
 * Marco de foto de Ashlar desde PHP (mismo markup que src/components/media).
 *
 * @param int   $attachment_id Adjunto.
 * @param array $args          class, ratio, reveal, parallax, sizes, alt, priority, size.
 */
function ashlar_media(int $attachment_id, array $args = []): string
{
    $args = wp_parse_args($args, [
        'class'    => '',
        'ratio'    => '',
        'reveal'   => false,
        'parallax' => 0,
        'sizes'    => '100vw',
        'alt'      => null,
        'priority' => false,
        'size'     => 'full',
        'intro'    => false,
        'attrs'    => [],
    ]);

    $classes = trim('media ' . ($args['parallax'] ? 'media--parallax ' : '') . $args['class']);
    $attrs   = sprintf(' class="%s"', esc_attr($classes));

    if ($args['ratio']) {
        $attrs .= sprintf(' style="aspect-ratio: %s"', esc_attr($args['ratio']));
    }
    if ($args['reveal']) {
        $attrs .= ' data-media-reveal';
    }
    if ($args['parallax']) {
        $attrs .= sprintf(' data-parallax="%s"', esc_attr((string) $args['parallax']));
    }
    if ($args['intro']) {
        $attrs .= ' data-intro-zoom';
    }
    foreach ($args['attrs'] as $name => $value) {
        $attrs .= sprintf(' %s="%s"', esc_attr($name), esc_attr((string) $value));
    }

    $image = '';
    if ($attachment_id) {
        $image_attrs = [
            'sizes'    => $args['sizes'],
            'loading'  => $args['priority'] ? 'eager' : 'lazy',
            'decoding' => $args['priority'] ? 'sync' : 'async',
        ];
        if ($args['priority']) {
            $image_attrs['fetchpriority'] = 'high';
        }
        if ($args['alt'] !== null) {
            $image_attrs['alt'] = $args['alt'];
        }
        $image = wp_get_attachment_image($attachment_id, $args['size'], false, $image_attrs);
    }

    return sprintf('<div%s>%s</div>', $attrs, $image);
}

/**
 * Tarjeta de proyecto del Figma (Project card): foto, «Rear extension · 2025»
 * y m², título con flecha y «22 weeks · +0.8% on fixed price».
 *
 * @param array $project Ficha (ashlar_project()).
 * @param array $args    ratio, sizes, heading (h2|h3), eager, short (desviación sin «on fixed price»),
 *                       attrs (atributos del <article>).
 */
function ashlar_project_card(array $project, array $args = []): string
{
    $args = wp_parse_args($args, [
        'ratio'   => '14 / 11',
        'sizes'   => '(min-width: 1024px) 560px, 85vw',
        'heading' => 'h3',
        'eager'   => false,
        'short'   => false,
        'attrs'   => [],
    ]);

    $heading = in_array($args['heading'], ['h2', 'h3'], true) ? $args['heading'] : 'h3';
    $meta    = implode(' · ', array_filter([$project['type'], $project['year'] ?: '']));
    $outcome = ashlar_project_outcome($project, $args['short']);

    $attrs = '';
    foreach ($args['attrs'] as $name => $value) {
        $attrs .= sprintf(' %s="%s"', esc_attr($name), esc_attr((string) $value));
    }

    ob_start();
    ?>
    <article class="pcard"<?php echo $attrs; // phpcs:ignore WordPress.Security.EscapeOutput ?>>
        <a href="<?php echo esc_url($project['url']); ?>" class="pcard__link">
            <?php
            echo ashlar_media($project['image'], [ // phpcs:ignore WordPress.Security.EscapeOutput
                'class'    => 'pcard__media',
                'ratio'    => $args['ratio'],
                'sizes'    => $args['sizes'],
                'alt'      => '',
                'priority' => $args['eager'],
            ]);
            ?>
            <div class="pcard__info">
                <?php if ($meta !== '' || $project['sqm']) : ?>
                    <p class="pcard__meta">
                        <span><?php echo esc_html($meta); ?></span>
                        <?php if ($project['sqm']) : ?>
                            <span class="num"><?php echo esc_html($project['sqm'] . ' m²'); ?></span>
                        <?php endif; ?>
                    </p>
                <?php endif; ?>
                <<?php echo $heading; ?> class="pcard__title"><?php echo esc_html(ashlar_project_name($project)); ?><?php echo ashlar_arrow('up-right', 'pcard__arrow'); // phpcs:ignore WordPress.Security.EscapeOutput ?></<?php echo $heading; ?>>
                <?php if ($outcome !== '') : ?>
                    <p class="pcard__outcome"><?php echo esc_html($outcome); ?></p>
                <?php endif; ?>
            </div>
        </a>
    </article>
    <?php
    return (string) ob_get_clean();
}

/**
 * URL de la página Projects (la que lista los proyectos), para los enlaces
 * «View all projects».
 */
function ashlar_projects_page_url(): string
{
    $page = get_page_by_path('projects');

    return $page ? get_permalink($page) : home_url('/projects/');
}

/**
 * Marcador de capítulo «02 — The Ashlar standard» (mismo markup que Chapter en JS).
 */
function ashlar_chapter(string $num, string $label, string $class = ''): string
{
    if ($num === '' && $label === '') {
        return '';
    }

    return sprintf(
        '<p class="%s" data-reveal="fade">%s<span>%s</span></p>',
        esc_attr(trim('chapter ' . $class)),
        $num !== '' ? sprintf('<span class="chapter__num">%s</span><span aria-hidden="true"> — </span>', esc_html($num)) : '',
        esc_html($label)
    );
}
