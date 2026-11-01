<?php

/**
 * Journal («Straight answers»): las entradas de WordPress son los artículos.
 *
 * Cada artículo es una pregunta (el título) con su respuesta corta (el
 * extracto), que sale en las tarjetas y arriba del artículo.
 *
 * - En el escritorio, «Posts» se llama «Journal» (y «Post», «Article»);
 *   las categorías son los temas (Topics). Sin etiquetas ni comentarios.
 * - Las URL cuelgan de /journal/ (enlaces permanentes /journal/%postname%/,
 *   ver inc/demo.php). Los archivos de tema, etiqueta y fecha no existen como
 *   páginas: redirigen a la página Journal, filtrada por tema (?topic=).
 * - Bloques: ashlar/journal-grid (página Journal) y, en
 *   templates/single.html, ashlar/article-header, ashlar/article-toc y
 *   ashlar/article-next.
 */

defined('ABSPATH') || exit;

// --------------------------------------------------
//	Nombres en el escritorio
// --------------------------------------------------

add_filter('register_post_type_args', static function (array $args, string $post_type): array {
    if ($post_type !== 'post') {
        return $args;
    }

    $args['menu_icon'] = 'dashicons-welcome-write-blog';
    $args['labels']    = [
        'name'                  => __('Journal', 'ashlar'),
        'singular_name'         => __('Article', 'ashlar'),
        'menu_name'             => __('Journal', 'ashlar'),
        'name_admin_bar'        => __('Article', 'ashlar'),
        'all_items'             => __('All articles', 'ashlar'),
        'add_new'               => __('Add article', 'ashlar'),
        'add_new_item'          => __('Add article', 'ashlar'),
        'edit_item'             => __('Edit article', 'ashlar'),
        'new_item'              => __('New article', 'ashlar'),
        'view_item'             => __('View article', 'ashlar'),
        'view_items'            => __('View articles', 'ashlar'),
        'search_items'          => __('Search articles', 'ashlar'),
        'not_found'             => __('No articles found.', 'ashlar'),
        'not_found_in_trash'    => __('No articles found in the bin.', 'ashlar'),
        'item_published'        => __('Article published.', 'ashlar'),
        'item_updated'          => __('Article updated.', 'ashlar'),
        'item_scheduled'        => __('Article scheduled.', 'ashlar'),
        'item_reverted_to_draft' => __('Article reverted to draft.', 'ashlar'),
    ];

    return $args;
}, 10, 2);

add_filter('register_taxonomy_args', static function (array $args, string $taxonomy): array {
    if ($taxonomy !== 'category') {
        return $args;
    }

    $args['labels'] = [
        'name'          => __('Topics', 'ashlar'),
        'singular_name' => __('Topic', 'ashlar'),
        'menu_name'     => __('Topics', 'ashlar'),
        'all_items'     => __('All topics', 'ashlar'),
        'edit_item'     => __('Edit topic', 'ashlar'),
        'add_new_item'  => __('Add topic', 'ashlar'),
        'search_items'  => __('Search topics', 'ashlar'),
        'not_found'     => __('No topics found.', 'ashlar'),
    ];

    return $args;
}, 10, 2);

// Sin etiquetas: el tema basta para ordenar y filtrar.
add_action('init', static function (): void {
    unregister_taxonomy_for_object_type('post_tag', 'post');
});

// --------------------------------------------------
//	URL: archivos → página Journal
// --------------------------------------------------

function ashlar_journal_page_url(): string
{
    $page = get_page_by_path('journal');

    return $page ? get_permalink($page) : home_url('/journal/');
}

add_action('template_redirect', static function (): void {
    if (is_admin() || !(is_category() || is_tag() || is_date())) {
        return;
    }

    $url  = ashlar_journal_page_url();
    $term = is_category() ? get_queried_object() : null;

    if ($term instanceof WP_Term) {
        $url = add_query_arg('topic', $term->slug, $url);
    }

    wp_safe_redirect($url, 301);
    exit;
});

// Del sitemap salen los archivos que redirigen.
add_filter('wp_sitemaps_taxonomies', static function (array $taxonomies): array {
    unset($taxonomies['category'], $taxonomies['post_tag']);

    return $taxonomies;
});

// --------------------------------------------------
//	Datos de un artículo
// --------------------------------------------------

/**
 * Tema del artículo: su primera categoría que no sea la de por defecto.
 */
function ashlar_article_topic(int $post_id): ?WP_Term
{
    $default = (int) get_option('default_category');

    foreach (get_the_category($post_id) as $term) {
        if ($term->term_id !== $default) {
            return $term;
        }
    }

    return null;
}

/**
 * Minutos de lectura (200 palabras por minuto, hacia arriba). Se cuentan
 * palabras separadas por espacios: str_word_count() se salta cifras y precios
 * («£3,200»), que en estos artículos son buena parte del texto.
 */
function ashlar_reading_time(int $post_id): int
{
    $text  = wp_strip_all_tags(strip_shortcodes((string) get_post_field('post_content', $post_id)));
    $words = count(preg_split('/\s+/u', trim($text), -1, PREG_SPLIT_NO_EMPTY) ?: []);

    return max(1, (int) ceil($words / 200));
}

/**
 * Todo lo que pintan las tarjetas y la cabecera de un artículo.
 *
 * @return array{id: int, title: string, url: string, answer: string, image: int, topic: string, topic_slug: string, date: string, datetime: string, minutes: int}
 */
function ashlar_article(int $post_id): array
{
    $topic = ashlar_article_topic($post_id);

    return [
        'id'         => $post_id,
        'title'      => html_entity_decode(get_the_title($post_id), ENT_QUOTES, 'UTF-8'),
        'url'        => (string) get_permalink($post_id),
        'answer'     => has_excerpt($post_id) ? trim((string) get_post_field('post_excerpt', $post_id)) : '',
        'image'      => (int) get_post_thumbnail_id($post_id),
        'topic'      => $topic ? $topic->name : '',
        'topic_slug' => $topic ? $topic->slug : '',
        'date'       => (string) get_the_date('j M Y', $post_id),
        'datetime'   => (string) get_the_date('c', $post_id),
        'minutes'    => ashlar_reading_time($post_id),
    ];
}

/** «6 min read». */
function ashlar_article_minutes(array $article): string
{
    return sprintf(
        /* translators: %d: minutes. */
        _n('%d min read', '%d min read', $article['minutes'], 'ashlar'),
        $article['minutes']
    );
}

/**
 * IDs de los artículos publicados (más recientes primero).
 *
 * @param array $args Argumentos extra de WP_Query.
 * @return int[]
 */
function ashlar_get_articles(array $args = []): array
{
    return array_map('intval', get_posts(array_merge([
        'post_type'        => 'post',
        'post_status'      => 'publish',
        'posts_per_page'   => 200,
        'fields'           => 'ids',
        'orderby'          => ['date' => 'DESC', 'ID' => 'DESC'],
        'ignore_sticky_posts' => true,
        'suppress_filters' => false,
    ], $args)));
}

/**
 * Artículo de un bloque de la plantilla del artículo. En la vista previa del
 * editor de plantillas (sin artículo), el más reciente.
 */
function ashlar_block_article(WP_Block $block): ?array
{
    $post_id = (int) ($block->context['postId'] ?? 0) ?: (int) get_the_ID();

    if ($post_id && get_post_type($post_id) === 'post') {
        return ashlar_article($post_id);
    }

    if (ashlar_is_editor_preview()) {
        $first = ashlar_get_articles(['posts_per_page' => 1]);

        return $first ? ashlar_article($first[0]) : null;
    }

    return null;
}

// --------------------------------------------------
//	Tarjeta de pregunta
// --------------------------------------------------

/**
 * Tarjeta de un artículo: tema y minutos, la pregunta y la respuesta corta.
 * Sin foto a propósito: el Journal se lee, no se mira.
 *
 * @param array $article Datos (ashlar_article()).
 * @param array $args    heading (h2|h3), attrs (atributos del <article>).
 */
function ashlar_article_card(array $article, array $args = []): string
{
    $args    = wp_parse_args($args, ['heading' => 'h3', 'attrs' => []]);
    $heading = in_array($args['heading'], ['h2', 'h3'], true) ? $args['heading'] : 'h3';

    $attrs = '';
    foreach ($args['attrs'] as $name => $value) {
        $attrs .= sprintf(' %s="%s"', esc_attr($name), esc_attr((string) $value));
    }

    ob_start();
    ?>
    <article class="qcard"<?php echo $attrs; // phpcs:ignore WordPress.Security.EscapeOutput ?>>
        <a class="qcard__link" href="<?php echo esc_url($article['url']); ?>">
            <span class="qcard__meta">
                <span><?php echo esc_html($article['topic']); ?></span>
                <span><?php echo esc_html(ashlar_article_minutes($article)); ?></span>
            </span>
            <<?php echo $heading; ?> class="qcard__title"><?php echo esc_html($article['title']); ?></<?php echo $heading; ?>>
            <?php if ($article['answer'] !== '') : ?>
                <span class="qcard__answer"><?php echo esc_html($article['answer']); ?></span>
            <?php endif; ?>
            <?php echo ashlar_arrow('right', 'qcard__arrow'); // phpcs:ignore WordPress.Security.EscapeOutput ?>
        </a>
    </article>
    <?php
    return (string) ob_get_clean();
}

// --------------------------------------------------
//	Apartados (índice «In this article»)
// --------------------------------------------------

/** Ancla de un apartado a partir de su texto. */
function ashlar_heading_id(string $text): string
{
    return sanitize_title(wp_strip_all_tags($text));
}

/**
 * Apartados (h2) de un artículo: [ancla => texto]. Si el apartado tiene un
 * ancla puesta a mano («HTML anchor»), se usa esa.
 *
 * @return array<string, string>
 */
function ashlar_article_sections(int $post_id): array
{
    $sections = [];

    foreach (parse_blocks((string) get_post_field('post_content', $post_id)) as $block) {
        if ($block['blockName'] !== 'core/heading' || (int) ($block['attrs']['level'] ?? 2) !== 2) {
            continue;
        }

        $text = trim(wp_strip_all_tags($block['innerHTML']));
        if ($text === '') {
            continue;
        }

        $id            = preg_match('/\bid="([^"]+)"/', $block['innerHTML'], $match) ? $match[1] : ashlar_heading_id($text);
        $sections[$id] = $text;
    }

    return $sections;
}

// Los h2 del artículo llevan su ancla, para que el índice pueda enlazarlos.
add_filter('render_block_core/heading', static function (string $html): string {
    if (!is_singular('post')) {
        return $html;
    }

    $tags = new WP_HTML_Tag_Processor($html);

    if ($tags->next_tag(['tag_name' => 'H2']) && $tags->get_attribute('id') === null) {
        $tags->set_attribute('id', ashlar_heading_id($html));
    }

    return $tags->get_updated_html();
});
