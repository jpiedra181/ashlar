<?php

/**
 * Contenido de demostración
 *
 * Deja un WordPress recién instalado como la web del Figma: ajustes,
 * páginas, menús, fotos, categorías, proyectos y el contenido de Home y
 * Projects. Es IDEMPOTENTE: lo que ya existe no se duplica ni se pisa (salvo
 * con «force», que vuelve a escribir el contenido de páginas y proyectos).
 *
 * Se lanza de dos formas, con el mismo código:
 *  - Desde el escritorio: Options → Demo content → «Import demo content».
 *  - Desde la consola: php tools/seed.php [--force].
 *
 * El marcado de las páginas (tools/content/*.html) lo generan los propios
 * bloques (createBlock + serialize en el editor), así que nunca da
 * «contenido inesperado».
 */

defined('ABSPATH') || exit;

const ASHLAR_DEMO_DIR = __DIR__ . '/../tools/content';

/**
 * Importa el contenido de demostración.
 *
 * @param bool     $force Volver a escribir el contenido de páginas y proyectos.
 * @param callable $log   Recibe cada mensaje («Photo imported: …»).
 */
/**
 * Idioma del sitio: inglés británico (textos del núcleo y <html lang="en-GB">).
 * Los administradores conservan el idioma que tenían en el escritorio: antes
 * de cambiar el del sitio se les guarda en su perfil (meta «locale»).
 *
 * @param callable $log Recibe cada mensaje.
 */
function ashlar_demo_language(callable $log): void
{
    if (get_option('WPLANG') === 'en_GB') {
        return;
    }

    // Desde la consola no están cargadas las funciones del instalador
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/misc.php';
    require_once ABSPATH . 'wp-admin/includes/translation-install.php';
    $admins = array_map('intval', get_users(['role' => 'administrator', 'fields' => 'ID']));

    if (!in_array('en_GB', get_available_languages(), true)) {
        // Instalar idiomas exige permiso; desde la consola no hay usuario, así
        // que se hace como el primer administrador.
        $user = get_current_user_id();
        if (!$user && $admins) {
            wp_set_current_user($admins[0]);
        }

        $installed = wp_download_language_pack('en_GB');
        wp_set_current_user($user);

        if (!$installed) {
            $log('Site language NOT changed: English (UK) could not be downloaded');
            return;
        }
    }

    $previous = (string) get_option('WPLANG');
    foreach ($admins as $id) {
        if ($previous !== '' && get_user_meta($id, 'locale', true) === '') {
            update_user_meta($id, 'locale', $previous);
        }
    }

    update_option('WPLANG', 'en_GB');
    $log('Site language: English (UK). Administrators keep their dashboard language');
}

function ashlar_demo_import(bool $force = false, ?callable $log = null): void
{
    $log = $log ?: static function (string $message): void {};

    if (function_exists('set_time_limit')) {
        set_time_limit(600); // 30 fotos con sus tamaños: puede tardar un minuto
    }
    wp_raise_memory_limit('admin');

    // --------------------------------------------------
    //	Sitio
    // --------------------------------------------------

    if (get_stylesheet() !== 'ashlar') {
        switch_theme('ashlar');
        $log('Theme activated: Ashlar');
    }

    update_option('blogname', 'Ashlar');
    update_option('blogdescription', 'Design & build contractor in north and east London');
    update_option('timezone_string', 'Europe/London');
    update_option('date_format', 'j F Y');
    update_option('time_format', 'g:i a');
    update_option('start_of_week', 1);
    update_option('default_comment_status', 'closed');
    update_option('default_ping_status', 'closed');
    // Los artículos del Journal cuelgan de /journal/; páginas y proyectos no
    // llevan ese prefijo (los proyectos, rewrite with_front = false). Con
    // set_permalink_structure() y no update_option(): así el flush del final
    // regenera las reglas con la estructura nueva.
    global $wp_rewrite;
    $wp_rewrite->set_permalink_structure('/journal/%postname%/');
    $log('Name, time zone, date formats and permalinks');

    ashlar_demo_language($log);

    // --------------------------------------------------
    //	Páginas
    // --------------------------------------------------

    $pages = [
        'home'                    => ['title' => 'Home', 'excerpt' => 'A small design and build firm in Islington. Extensions, lofts, basements and restorations in north and east London, with a written report every Friday.'],
        'services'                => ['title' => 'Services', 'excerpt' => 'Extensions, loft conversions, kitchens, basements and whole-house restorations, with typical London prices, timings and what every job includes.'],
        'projects'                => ['title' => 'Projects', 'excerpt' => '118 houses in north and east London, each listed with its street, how long it took and what it finally cost against the fixed price.'],
        'about'                   => ['title' => 'About', 'excerpt' => 'Tom and Priya started Ashlar in 2009 so nobody would have to chase their builder. Meet the team, the yard and the jobs we turned down.'],
        'journal'                 => ['title' => 'Journal', 'excerpt' => 'Straight answers on what building work in London costs, how long it takes and what can go wrong, from the people who do it.'],
        'careers'                 => ['title' => 'Careers', 'excerpt' => 'We’re hiring a site manager in north London: £58k–£65k, van and tools included, and never more than six sites at a time.'],
        'contact'                 => ['title' => 'Contact', 'excerpt' => 'Tell us about your house and get a rough price straight away. Marta rings back the next working day to book a free first visit.'],
        'privacy'                 => ['title' => 'Privacy', 'template' => 'page-legal'],
        'cookies'                 => ['title' => 'Cookies', 'template' => 'page-legal'],
        'accessibility-statement' => ['title' => 'Accessibility statement', 'template' => 'page-legal'],
    ];

    // Autor de las páginas: el primer administrador (desde la línea de comandos no
    // hay usuario conectado y quedarían «sin autor»).
    $admins = get_users(['role' => 'administrator', 'number' => 1, 'orderby' => 'ID', 'fields' => 'ID']);
    $author = (int) ($admins[0] ?? 0);

    // Sin usuario (línea de comandos) se trabaja como ese administrador: si no,
    // wp_insert_post() pasa el contenido por kses y se come los <svg> de los
    // bloques (flechas, iconos).
    if (!current_user_can('unfiltered_html')) {
        wp_set_current_user($author);
    }

    $ids = [];

    foreach ($pages as $slug => $page) {
        $existing = get_page_by_path($slug, OBJECT, 'page');

        if ($existing) {
            $ids[$slug] = $existing->ID;
            continue;
        }

        $ids[$slug] = wp_insert_post([
            'post_type'     => 'page',
            'post_status'   => 'publish',
            'post_title'    => $page['title'],
            'post_name'     => $slug,
            'post_author'   => $author,
            'post_content'  => '',
            'page_template' => $page['template'] ?? '',
        ]);
        $log('Page created: ' . $page['title']);
    }

    update_option('show_on_front', 'page');
    update_option('page_on_front', $ids['home']);
    update_option('wp_page_for_privacy_policy', $ids['privacy']);

    // --------------------------------------------------
    //	Menús
    //	Cada elemento: [título, página (slug) o URL, descripción].
    //	La descripción es el subtítulo del menú móvil («Five kinds of job»).
    // --------------------------------------------------

    $menus = [
        'primary' => [
            'name'  => 'Main',
            'items' => [
                ['Services', 'services', 'Five kinds of job'],
                ['Projects', 'projects', '118 houses, by street'],
                ['About', 'about', 'Who we are'],
                ['Journal', 'journal', 'Straight answers'],
            ],
        ],
        'footer-services' => [
            'name'  => 'Services',
            'items' => [
                ['Extensions', '/services/#extensions', ''],
                ['Loft conversions', '/services/#lofts', ''],
                ['Kitchens & refurbishment', '/services/#kitchens', ''],
                ['Basements', '/services/#basements', ''],
                ['Whole-house restoration', '/services/#restoration', ''],
            ],
        ],
        'footer' => [
            'name'  => 'Company',
            'items' => [
                ['About', 'about', ''],
                ['Projects', 'projects', ''],
                ['Journal', 'journal', ''],
                ['Careers', 'careers', ''],
            ],
        ],
        'legal' => [
            'name'  => 'Legal',
            'items' => [
                ['Privacy', 'privacy', ''],
                ['Cookies', 'cookies', ''],
                ['Accessibility statement', 'accessibility-statement', ''],
            ],
        ],
    ];

    $locations = get_theme_mod('nav_menu_locations', []);

    foreach ($menus as $location => $menu) {
        $menu_obj = wp_get_nav_menu_object($menu['name']);

        if (!$menu_obj) {
            $menu_id = wp_create_nav_menu($menu['name']);

            foreach ($menu['items'] as $position => [$title, $target, $description]) {
                $is_page = isset($ids[$target]);
                $args    = [
                    'menu-item-title'       => $title,
                    'menu-item-description' => $description,
                    'menu-item-status'      => 'publish',
                    'menu-item-position'    => $position + 1,
                ];

                if ($is_page) {
                    $args += ['menu-item-object' => 'page', 'menu-item-object-id' => $ids[$target], 'menu-item-type' => 'post_type'];
                } else {
                    $args += ['menu-item-type' => 'custom', 'menu-item-url' => home_url($target)];
                }

                wp_update_nav_menu_item($menu_id, 0, $args);
            }

            $log('Menu created: ' . $menu['name']);
        } else {
            $menu_id = $menu_obj->term_id;
        }

        $locations[$location] = $menu_id;
    }

    set_theme_mod('nav_menu_locations', $locations);
    $log('Menus assigned to their locations');

    // El campo «Descripción» de los elementos de menú viene oculto por defecto en
    // Apariencia → Menús: se muestra para que se vea el subtítulo del menú móvil.
    if ($author) {
        update_user_meta($author, 'managenav-menuscolumnshidden', ['link-target', 'css-classes', 'xfn', 'title-attribute']);
    }

    // --------------------------------------------------
    //	Fotos → biblioteca de medios
    // --------------------------------------------------

    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';

    $image_dir = get_template_directory() . '/src/assets/images/photos';
    $alts      = json_decode((string) file_get_contents($image_dir . '/alt.json'), true) ?: [];
    $photos    = [];

    foreach (array_merge((array) glob($image_dir . '/*.jpg'), (array) glob($image_dir . '/*.svg')) as $file) {
        $ext      = pathinfo($file, PATHINFO_EXTENSION);
        $name     = basename($file, '.' . $ext);
        $existing = get_posts([
            'post_type'   => 'attachment',
            'post_status' => 'inherit',
            'numberposts' => 1,
            'fields'      => 'ids',
            'meta_key'    => '_ashlar_seed', // phpcs:ignore WordPress.DB.SlowDBQuery
            'meta_value'  => $name,          // phpcs:ignore WordPress.DB.SlowDBQuery
        ]);

        if ($existing) {
            $photos[$name] = (int) $existing[0];
            continue;
        }

        // media_handle_sideload() mueve el fichero: se le pasa una copia.
        $tmp = wp_tempnam($name . '.' . $ext);
        copy($file, $tmp);
        $id = media_handle_sideload(['name' => $name . '.' . $ext, 'tmp_name' => $tmp], 0, ucfirst(str_replace('-', ' ', $name)));

        if (is_wp_error($id)) {
            $log('Photo NOT imported: ' . $name . ' (' . $id->get_error_message() . ')');
            @unlink($tmp); // phpcs:ignore WordPress.PHP.NoSilencedErrors
            continue;
        }

        update_post_meta($id, '_ashlar_seed', $name);
        update_post_meta($id, '_wp_attachment_image_alt', $alts[$name] ?? '');
        $photos[$name] = (int) $id;
        $log('Photo imported: ' . $name);
    }

    /**
     * Cambia las fotos de marcador del marcado generado (id 99xxxx y URL
     * https://seed.ashlar/<nombre>.<ext>) por los adjuntos importados.
     */
    $with_photos = static function (string $markup) use ($photos): string {
        preg_match_all('#"id":(99\d{4}),"url":"https://seed\.ashlar/([a-z0-9-]+)\.(jpg|svg)"#', $markup, $found, PREG_SET_ORDER);

        foreach ($found as [, $placeholder, $name, $ext]) {
            $id     = $photos[$name] ?? 0;
            $url    = $id ? (string) wp_get_attachment_url($id) : '';
            $markup = str_replace(
                ['"id":' . $placeholder . ',', 'wp-image-' . $placeholder . '"', 'https://seed.ashlar/' . $name . '.' . $ext],
                ['"id":' . $id . ',', 'wp-image-' . $id . '"', $url],
                $markup
            );
        }

        return $markup;
    };

    $content = static fn(string $name): string => is_file(ASHLAR_DEMO_DIR . '/' . $name . '.html') ? (string) file_get_contents(ASHLAR_DEMO_DIR . '/' . $name . '.html') : '';

    // --------------------------------------------------
    //	Categorías de obra y proyectos de demostración
    // --------------------------------------------------

    foreach (['Extensions', 'Lofts', 'Kitchens', 'Basements', 'Whole house'] as $order => $term) {
        if (!term_exists($term, ASHLAR_PROJECT_CATEGORY)) {
            wp_insert_term($term, ASHLAR_PROJECT_CATEGORY);
            $log('Category created: ' . $term);
        }
    }

    $projects = require ASHLAR_DEMO_DIR . '/projects.php';

    foreach ($projects as $order => $project) {
        $existing = get_page_by_path($project['slug'], OBJECT, ASHLAR_PROJECT);

        if ($existing && !$force) {
            continue;
        }

        $markup = $with_photos($content('project-' . $project['slug']) ?: $content('project-basic'));
        $data   = [
            'post_type'     => ASHLAR_PROJECT,
            'post_status'   => 'publish',
            'post_title'    => $project['title'],
            'post_name'     => $project['slug'],
            'post_excerpt'  => $project['summary'],
            'post_content'  => wp_slash($markup),
            'post_author'   => $author,
            'post_date'     => $project['date'],
            'post_date_gmt' => get_gmt_from_date($project['date']),
            'menu_order'    => $order,
        ];

        if ($existing) {
            $data['ID'] = $existing->ID;
        }

        $id = $existing ? wp_update_post($data) : wp_insert_post($data);

        foreach ($project['meta'] as $key => $value) {
            update_post_meta($id, '_ashlar_' . $key, $value);
        }

        wp_set_object_terms($id, $project['category'], ASHLAR_PROJECT_CATEGORY);

        if (isset($photos[$project['image']])) {
            set_post_thumbnail($id, $photos[$project['image']]);
        }

        $log(($existing ? 'Project updated: ' : 'Project created: ') . $project['title']);
    }

    // --------------------------------------------------
    //	Journal: temas y artículos de demostración
    //	La pregunta es el título y la respuesta corta, el extracto.
    // --------------------------------------------------

    $articles = require ASHLAR_DEMO_DIR . '/articles.php';

    foreach (array_unique(array_column($articles, 'topic')) as $topic) {
        if (!term_exists($topic, 'category')) {
            wp_insert_term($topic, 'category');
            $log('Topic created: ' . $topic);
        }
    }

    foreach ($articles as $article) {
        $existing = get_page_by_path($article['slug'], OBJECT, 'post');

        if ($existing && !$force) {
            continue;
        }

        $data = [
            'post_type'     => 'post',
            'post_status'   => 'publish',
            'post_title'    => $article['title'],
            'post_name'     => $article['slug'],
            'post_excerpt'  => $article['answer'],
            'post_content'  => wp_slash($content('article-' . $article['slug'])),
            'post_author'   => $author,
            'post_date'     => $article['date'],
            'post_date_gmt' => get_gmt_from_date($article['date']),
        ];

        if ($existing) {
            $data['ID'] = $existing->ID;
        }

        $id   = $existing ? wp_update_post($data) : wp_insert_post($data);
        $term = get_term_by('name', $article['topic'], 'category');

        if ($term) {
            wp_set_post_categories($id, [$term->term_id]);
        }

        if (isset($photos[$article['image']])) {
            set_post_thumbnail($id, $photos[$article['image']]);
        }

        $log(($existing ? 'Article updated: ' : 'Article created: ') . $article['title']);
    }

    // --------------------------------------------------
    //	Contenido de las páginas
    //	tools/content/<slug>.html lo generan los bloques (createBlock + serialize
    //	en el editor).
    // --------------------------------------------------

    foreach (['home', 'projects', 'services', 'about', 'careers', 'contact', 'journal', 'privacy', 'cookies', 'accessibility-statement'] as $slug) {
        $page   = get_post($ids[$slug]);
        $markup = $content($slug);
        $data   = [];

        if (!$page) {
            continue;
        }

        if ($markup !== '' && ($force || trim($page->post_content) === '')) {
            $data['post_content'] = wp_slash($with_photos($markup));
            $log(ucfirst($slug) . ' page content ' . ($force ? 'replaced' : 'added'));
        }

        // Extracto = meta description y Open Graph de la página (inc/seo.php)
        if (!empty($pages[$slug]['excerpt']) && ($force || trim($page->post_excerpt) === '')) {
            $data['post_excerpt'] = $pages[$slug]['excerpt'];
        }

        if ($data) {
            wp_update_post(['ID' => $page->ID] + $data);
        }
    }

    // --------------------------------------------------
    //	Contenido de ejemplo de WordPress → papelera (recuperable)
    // --------------------------------------------------

    // También los de una instalación en español (si se instaló así).
    foreach ([['hello-world', 'post'], ['hola-mundo', 'post'], ['sample-page', 'page'], ['pagina-ejemplo', 'page']] as [$slug, $type]) {
        $sample = get_page_by_path($slug, OBJECT, $type);
        if ($sample && $sample->post_status !== 'trash') {
            wp_trash_post($sample->ID);
            $log('Moved to trash: ' . $sample->post_title);
        }
    }

    flush_rewrite_rules();
}

// --------------------------------------------------
//	Pantalla «Demo content» (Options → Demo content)
// --------------------------------------------------

add_action('admin_menu', static function (): void {
    add_submenu_page(
        ASHLAR_OPTION_PAGE,
        __('Demo content', 'ashlar'),
        __('Demo content', 'ashlar'),
        'manage_options',
        'ashlar-demo',
        'ashlar_demo_screen'
    );
}, 20);

/**
 * Pantalla con un botón: importa y enseña lo que ha hecho.
 */
function ashlar_demo_screen(): void
{
    if (!current_user_can('manage_options')) {
        return;
    }

    $done = [];

    if (isset($_POST['ashlar_demo']) && check_admin_referer('ashlar_demo_import')) {
        $force = !empty($_POST['ashlar_demo_force']);
        ashlar_demo_import($force, static function (string $message) use (&$done): void {
            $done[] = $message;
        });
    }
    ?>
    <div class="wrap ashlar-demo">
        <h1><?php esc_html_e('Demo content', 'ashlar'); ?></h1>
        <p><?php esc_html_e('Sets the site up like the design: settings, pages, menus, photos, project categories, ten demo projects with their pages, and the content of the Home and Projects pages.', 'ashlar'); ?></p>
        <p><?php esc_html_e('It can be run more than once: whatever already exists is left as it is.', 'ashlar'); ?></p>

        <?php if ($done) : ?>
            <div class="notice notice-success"><p><strong><?php esc_html_e('Done.', 'ashlar'); ?></strong> <a href="<?php echo esc_url(home_url('/')); ?>"><?php esc_html_e('View the site', 'ashlar'); ?></a></p></div>
            <ul class="ashlar-demo__log">
                <?php foreach ($done as $message) : ?>
                    <li><?php echo esc_html($message); ?></li>
                <?php endforeach; ?>
            </ul>
        <?php endif; ?>

        <form method="post">
            <?php wp_nonce_field('ashlar_demo_import'); ?>
            <p>
                <label>
                    <input type="checkbox" name="ashlar_demo_force" value="1">
                    <?php esc_html_e('Overwrite the content of the Home and Projects pages and of the demo projects', 'ashlar'); ?>
                </label>
            </p>
            <p class="description"><?php esc_html_e('Importing the photos can take a minute. Keep this page open until it finishes.', 'ashlar'); ?></p>
            <?php submit_button(__('Import demo content', 'ashlar'), 'primary', 'ashlar_demo'); ?>
        </form>
    </div>
    <?php
}
