<?php

/**
 * Escritorio con la identidad de la marca (base: inc/admin.php de Raíz)
 *
 *  1. Esquema de color «Ashlar» para todos (menú, botones, editor de bloques).
 *  2. «Home»: portada propia del escritorio en lugar de la de WordPress.
 *  3. Rol «Client»: edita todo el contenido y los datos de la web, pero ve un
 *     menú corto y no puede romper plantillas ni ajustes técnicos.
 *  4. Menú, barra superior y pie limpios.
 *  5. Tipografía y tokens de la marca en el escritorio (src/admin/admin.scss).
 *
 * Los textos van en inglés, como el resto de la interfaz del editor (cliente
 * británico). Nada de esto toca la web pública.
 */

defined('ABSPATH') || exit;

const ASHLAR_HOME_PAGE   = 'ashlar-home';
const ASHLAR_CLIENT_ROLE = 'ashlar_client';

/**
 * Las entradas son los artículos del Journal (inc/journal.php): se ven en el
 * escritorio como «Journal». Sin Journal, devolver false y se ocultan.
 */
function ashlar_has_blog(): bool
{
    return (bool) apply_filters('ashlar_has_blog', true);
}

/**
 * La web no tiene comentarios: se ocultan en todo el escritorio y se cierran
 * en todo el contenido. Con comentarios, devolver true.
 */
function ashlar_has_comments(): bool
{
    return (bool) apply_filters('ashlar_has_comments', false);
}

/**
 * True para quien gestiona la web a nivel técnico (ve el escritorio completo).
 */
function ashlar_is_admin_user(): bool
{
    return current_user_can('manage_options');
}

// --------------------------------------------------
//	1. Esquema de color
// --------------------------------------------------

add_action('admin_init', 'ashlar_register_admin_color');

function ashlar_register_admin_color(): void
{
    $file = get_template_directory() . '/build/admin/admin-colors.css';

    if (!file_exists($file)) {
        return;
    }

    wp_admin_css_color(
        'ashlar',
        __('Ashlar', 'ashlar'),
        // «v» y no «ver»: WordPress sustituye «ver» por su propia versión y el
        // navegador seguiría sirviendo la copia antigua tras cada compilación.
        get_template_directory_uri() . '/build/admin/admin-colors.css?v=' . filemtime($file),
        // Muestra del selector: stone-950, stone-900, corten-500, corten-300.
        ['#151311', '#221f1c', '#b85a28', '#e1966a'],
        // Iconos SVG del menú: reposo, foco y actual.
        ['base' => '#a89d8c', 'focus' => '#f7f5f1', 'current' => '#f7f5f1']
    );
}

// Todos usan el esquema de la marca y desaparece el selector del perfil.
add_filter('get_user_option_admin_color', static fn(): string => 'ashlar');
remove_action('admin_color_scheme_picker', 'admin_color_scheme_picker');

// --------------------------------------------------
//	Estilos y tokens del escritorio
// --------------------------------------------------

add_action('admin_enqueue_scripts', 'ashlar_admin_assets');

function ashlar_admin_assets(): void
{
    // El editor de bloques conserva su interfaz nativa (solo hereda el color
    // de acento del esquema): estos estilos son para el resto del escritorio.
    $screen = get_current_screen();
    if ($screen && $screen->is_block_editor()) {
        return;
    }

    $asset = ashlar_asset('admin/admin');

    wp_enqueue_style('ashlar-admin', get_template_directory_uri() . '/build/admin/admin.css', [], $asset['version']);

    // Variables de theme.json: el escritorio usa los mismos tokens que la web.
    wp_add_inline_style('ashlar-admin', wp_get_global_stylesheet(['variables']));
}

add_action('admin_head', static function (): void {
    if (function_exists('wp_print_font_faces')) {
        wp_print_font_faces();
    }
});

// --------------------------------------------------
//	2. Home
// --------------------------------------------------

add_action('admin_menu', 'ashlar_admin_home_menu', 5);

function ashlar_admin_home_menu(): void
{
    add_menu_page(
        __('Home', 'ashlar'),
        __('Home', 'ashlar'),
        'read',
        ASHLAR_HOME_PAGE,
        'ashlar_render_admin_home',
        'dashicons-admin-home',
        1
    );

    // El escritorio de WordPress sigue disponible para la administración técnica.
    if (ashlar_is_admin_user()) {
        add_submenu_page(ASHLAR_HOME_PAGE, __('Home', 'ashlar'), __('Home', 'ashlar'), 'read', ASHLAR_HOME_PAGE);
        add_submenu_page(ASHLAR_HOME_PAGE, __('WordPress dashboard', 'ashlar'), __('WordPress dashboard', 'ashlar'), 'manage_options', 'index.php?wp-dashboard=1');
        add_submenu_page(ASHLAR_HOME_PAGE, __('Updates', 'ashlar'), __('Updates', 'ashlar'), 'update_core', 'update-core.php');
    }
}

// El escritorio de siempre lleva a Home (salvo que se pida expresamente).
add_action('load-index.php', static function (): void {
    if (!isset($_GET['wp-dashboard'])) { // phpcs:ignore WordPress.Security.NonceVerification -- solo elige pantalla
        wp_safe_redirect(admin_url('admin.php?page=' . ASHLAR_HOME_PAGE));
        exit;
    }
});

/**
 * Accesos rápidos de Home. Cada uno solo aparece si quien entra puede usarlo
 * y si lo que enlaza existe.
 *
 * @return array<int, array{title: string, text: string, url: string, icon: string, badge?: int}>
 */
function ashlar_admin_shortcuts(): array
{
    $shortcuts = [
        [
            'title' => __('Pages', 'ashlar'),
            'text'  => __('The words and photos on every page of the website.', 'ashlar'),
            'url'   => admin_url('edit.php?post_type=page'),
            'icon'  => 'dashicons-admin-page',
            'cap'   => 'edit_pages',
        ],
    ];

    if (post_type_exists(ASHLAR_PROJECT)) {
        $shortcuts[] = [
            'title' => __('Projects', 'ashlar'),
            'text'  => __('Add a finished job or update the ones already there.', 'ashlar'),
            'url'   => admin_url('edit.php?post_type=' . ASHLAR_PROJECT),
            'icon'  => 'dashicons-building',
            'cap'   => 'edit_posts',
        ];
    }

    if (post_type_exists(ASHLAR_MESSAGE)) {
        $unread      = ashlar_unread_messages();
        $shortcuts[] = [
            'title' => __('Messages', 'ashlar'),
            'text'  => $unread
                /* translators: %d: number of unread enquiries. */
                ? sprintf(_n('You have %d new enquiry from the quote form.', 'You have %d new enquiries from the quote form.', $unread, 'ashlar'), $unread)
                : __('Enquiries from the quote form.', 'ashlar'),
            'url'   => admin_url('edit.php?post_type=' . ASHLAR_MESSAGE),
            'icon'  => 'dashicons-email-alt',
            'cap'   => 'edit_pages',
            'badge' => $unread,
        ];
    }

    $shortcuts[] = [
        'title' => __('Photos and files', 'ashlar'),
        'text'  => __('Upload new photos or change their description.', 'ashlar'),
        'url'   => admin_url('upload.php'),
        'icon'  => 'dashicons-format-image',
        'cap'   => 'upload_files',
    ];

    $shortcuts[] = [
        'title' => __('Menus', 'ashlar'),
        'text'  => __('The links in the header and the footer.', 'ashlar'),
        'url'   => admin_url('nav-menus.php'),
        'icon'  => 'dashicons-menu',
        'cap'   => 'edit_theme_options',
    ];

    $shortcuts[] = [
        'title' => __('Options', 'ashlar'),
        'text'  => __('Phone, email, address and the texts shown across the site.', 'ashlar'),
        'url'   => admin_url('admin.php?page=' . ASHLAR_OPTION_PAGE),
        'icon'  => 'dashicons-admin-generic',
        'cap'   => 'edit_theme_options',
    ];

    return array_values(array_filter($shortcuts, static fn(array $item): bool => current_user_can($item['cap'])));
}

function ashlar_render_admin_home(): void
{
    // Toda la portada, en el idioma del sitio y no en el del perfil: fechas y
    // «hace 2 horas» casan así con los textos del tema, que solo existen en inglés.
    $switched = switch_to_locale(get_locale());

    $user      = wp_get_current_user();
    $name      = $user->first_name ?: $user->display_name;
    $front_id  = (int) get_option('page_on_front');
    $slides    = function_exists('ashlar_login_slides') ? ashlar_login_slides() : [];
    $photo     = $slides[0] ?? null;
    $site_name = wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES);

    $pages = get_posts([
        'post_type'      => 'page',
        'post_status'    => ['publish', 'draft', 'pending', 'private'],
        'posts_per_page' => 8,
        'perm'           => 'readable', // borradores y privadas, solo a quien puede verlos
        'orderby'        => 'modified',
        'order'          => 'DESC',
    ]);
?>
    <div class="wrap ashlar-home">
        <h1 class="screen-reader-text"><?php esc_html_e('Home', 'ashlar'); ?></h1>

        <section class="ashlar-home__hero">
            <div class="ashlar-home__hero-text">
                <p class="ashlar-home__date"><?php echo esc_html(wp_date('l j F')); ?></p>
                <p class="ashlar-home__title">
                    <?php
                    // «Good afternoon, *Marta*»: el nombre va en el tono apagado.
                    echo ashlar_accent(str_replace('*', '', ashlar_time_greeting()) . ', *' . $name . '*'); // phpcs:ignore WordPress.Security.EscapeOutput -- ashlar_accent escapa
                    ?>
                </p>
                <p class="ashlar-home__lead">
                    <?php
                    printf(
                        /* translators: %s: site name. */
                        esc_html__('This is the %s dashboard. From here you change the words, photos and projects on the website, without touching anything technical.', 'ashlar'),
                        esc_html($site_name)
                    );
                    ?>
                </p>
                <div class="ashlar-home__actions">
                    <a class="button button-primary button-hero" href="<?php echo esc_url(home_url('/')); ?>" target="_blank" rel="noopener">
                        <?php esc_html_e('View the website', 'ashlar'); ?>
                        <span class="screen-reader-text"><?php esc_html_e('(opens in a new tab)', 'ashlar'); ?></span>
                    </a>
                    <?php if ($front_id && current_user_can('edit_page', $front_id)) : ?>
                        <a class="button button-hero ashlar-button-ghost" href="<?php echo esc_url(get_edit_post_link($front_id)); ?>">
                            <?php esc_html_e('Edit the home page', 'ashlar'); ?>
                        </a>
                    <?php endif; ?>
                </div>
            </div>
            <?php if ($photo) : ?>
                <figure class="ashlar-home__photo">
                    <img src="<?php echo esc_url($photo['url']); ?>" alt="">
                    <figcaption>
                        <span><?php echo esc_html($photo['title']); ?></span>
                        <?php echo esc_html($photo['place']); ?>
                    </figcaption>
                </figure>
            <?php endif; ?>
        </section>

        <section class="ashlar-home__section" aria-labelledby="ashlar-home-shortcuts">
            <h2 class="ashlar-home__heading" id="ashlar-home-shortcuts"><?php esc_html_e('What would you like to do?', 'ashlar'); ?></h2>
            <ul class="ashlar-home__cards">
                <?php foreach (ashlar_admin_shortcuts() as $shortcut) : ?>
                    <li>
                        <a class="ashlar-card" href="<?php echo esc_url($shortcut['url']); ?>">
                            <span class="ashlar-card__icon dashicons <?php echo esc_attr($shortcut['icon']); ?>" aria-hidden="true"></span>
                            <span class="ashlar-card__title">
                                <?php echo esc_html($shortcut['title']); ?>
                                <?php if (!empty($shortcut['badge'])) : ?>
                                    <span class="ashlar-badge"><?php echo esc_html((string) $shortcut['badge']); ?></span>
                                <?php endif; ?>
                            </span>
                            <span class="ashlar-card__text"><?php echo esc_html($shortcut['text']); ?></span>
                            <?php echo ashlar_arrow('right', 'ashlar-card__arrow'); // phpcs:ignore WordPress.Security.EscapeOutput -- SVG fijo ?>
                        </a>
                    </li>
                <?php endforeach; ?>
            </ul>
        </section>

        <div class="ashlar-home__columns">
            <section class="ashlar-panel" aria-labelledby="ashlar-home-pages">
                <h2 class="ashlar-home__heading" id="ashlar-home-pages"><?php esc_html_e('Your pages', 'ashlar'); ?></h2>
                <?php if ($pages) : ?>
                    <ul class="ashlar-pages">
                        <?php foreach ($pages as $page) : ?>
                            <li class="ashlar-pages__item">
                                <div class="ashlar-pages__main">
                                    <span class="ashlar-pages__title">
                                        <?php echo esc_html(get_the_title($page) ?: __('(no title)', 'ashlar')); ?>
                                        <?php if ($page->ID === $front_id) : ?>
                                            <span class="ashlar-badge"><?php esc_html_e('Home page', 'ashlar'); ?></span>
                                        <?php elseif ($page->post_status !== 'publish') : ?>
                                            <span class="ashlar-badge ashlar-badge--muted"><?php echo esc_html(get_post_status_object($page->post_status)->label); ?></span>
                                        <?php endif; ?>
                                    </span>
                                    <span class="ashlar-pages__meta">
                                        <?php
                                        printf(
                                            /* translators: %s: time since the change, e.g. "2 hours". */
                                            esc_html__('Changed %s ago', 'ashlar'),
                                            esc_html(human_time_diff((int) get_post_modified_time('U', true, $page), time()))
                                        );
                                        ?>
                                    </span>
                                </div>
                                <div class="ashlar-pages__links">
                                    <?php if (current_user_can('edit_page', $page->ID)) : ?>
                                        <a href="<?php echo esc_url(get_edit_post_link($page->ID)); ?>"><?php esc_html_e('Edit', 'ashlar'); ?><span class="screen-reader-text"> <?php echo esc_html(get_the_title($page)); ?></span></a>
                                    <?php endif; ?>
                                    <?php if ($page->post_status === 'publish') : ?>
                                        <a href="<?php echo esc_url(get_permalink($page)); ?>" target="_blank" rel="noopener"><?php esc_html_e('View', 'ashlar'); ?><span class="screen-reader-text"> <?php echo esc_html(get_the_title($page)); ?> <?php esc_html_e('(opens in a new tab)', 'ashlar'); ?></span></a>
                                    <?php endif; ?>
                                </div>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                <?php else : ?>
                    <p><?php esc_html_e('No pages yet.', 'ashlar'); ?></p>
                <?php endif; ?>
            </section>

            <section class="ashlar-panel ashlar-panel--dark" aria-labelledby="ashlar-home-help">
                <h2 class="ashlar-home__heading" id="ashlar-home-help"><?php esc_html_e('A short guide', 'ashlar'); ?></h2>
                <ol class="ashlar-tips">
                    <li><?php esc_html_e('To change a text, open the page and type straight over it: what you see is what gets published.', 'ashlar'); ?></li>
                    <li><?php esc_html_e('Each section’s photos and settings are in the panel on the right when you click on it.', 'ashlar'); ?></li>
                    <li><?php esc_html_e('Phone, email and address live in Options: change them once and they update across the site.', 'ashlar'); ?></li>
                    <li><?php esc_html_e('Press “Save” to publish. If you make a mistake, “Revisions” takes you back to an earlier version.', 'ashlar'); ?></li>
                </ol>
                <p class="ashlar-panel__note">
                    <?php
                    printf(
                        /* translators: %s: link to the theme author. */
                        esc_html__('Something not working as expected? %s.', 'ashlar'),
                        '<a href="https://jpiedra.com" target="_blank" rel="noopener">' . esc_html__('Get in touch', 'ashlar') . '</a>'
                    );
                    ?>
                </p>
            </section>
        </div>
    </div>
<?php
    if ($switched) {
        restore_previous_locale();
    }
}

// --------------------------------------------------
//	3. Rol «Client»
// --------------------------------------------------

add_action('init', 'ashlar_register_client_role');

/**
 * Client = Editor (todo el contenido, medios) + edit_theme_options (Menús y
 * Opciones). Lo que esa capacidad abriría de más (Editor del sitio,
 * Personalizar, Widgets, Temas) se oculta y se bloquea más abajo.
 */
function ashlar_register_client_role(): void
{
    if (get_role(ASHLAR_CLIENT_ROLE)) {
        return;
    }

    $editor = get_role('editor');

    add_role(
        ASHLAR_CLIENT_ROLE,
        __('Client', 'ashlar'),
        array_merge($editor ? $editor->capabilities : ['read' => true], ['edit_theme_options' => true])
    );
}

/**
 * Pantallas que el cliente no necesita y desde las que podría descuadrar la
 * web. Se quitan del menú y, si se llega por URL, se redirige a Home.
 */
function ashlar_client_blocked_screens(): array
{
    $screens = ['site-editor.php', 'customize.php', 'themes.php', 'theme-editor.php', 'widgets.php', 'tools.php', 'import.php', 'export.php', 'options-general.php'];

    if (!ashlar_has_comments()) {
        $screens[] = 'edit-comments.php';
    }

    return $screens;
}

add_action('admin_menu', 'ashlar_admin_menu_cleanup', 999);

function ashlar_admin_menu_cleanup(): void
{
    // Home sustituye al Escritorio (que sigue en Home → WordPress dashboard).
    remove_menu_page('index.php');

    if (!ashlar_has_blog()) {
        remove_menu_page('edit.php');
    }

    if (!ashlar_has_comments()) {
        remove_menu_page('edit-comments.php');
    }

    if (ashlar_is_admin_user()) {
        return;
    }

    remove_menu_page('themes.php');
    remove_menu_page('tools.php');
    remove_menu_page('options-general.php');

    // Menús sale de Apariencia y se queda como entrada propia.
    add_menu_page(__('Menus', 'ashlar'), __('Menus', 'ashlar'), 'edit_theme_options', 'nav-menus.php', '', 'dashicons-menu', 58);
}

add_action('admin_init', 'ashlar_admin_guard_screens');

function ashlar_admin_guard_screens(): void
{
    global $pagenow;

    if (wp_doing_ajax()) {
        return;
    }

    $blocked = false;

    // Sin blog: fuera la lista de entradas para todos.
    if (!ashlar_has_blog() && $pagenow === 'edit.php' && (empty($_GET['post_type']) || $_GET['post_type'] === 'post')) { // phpcs:ignore WordPress.Security.NonceVerification -- solo elige pantalla
        $blocked = true;
    }

    if (!ashlar_is_admin_user() && in_array($pagenow, ashlar_client_blocked_screens(), true)) {
        $blocked = true;
    }

    if ($blocked) {
        wp_safe_redirect(admin_url('admin.php?page=' . ASHLAR_HOME_PAGE));
        exit;
    }
}

// Orden del menú: Home, contenido, datos de la web y lo técnico al final.
add_filter('custom_menu_order', '__return_true');
add_filter('menu_order', static function (array $order): array {
    $first = [
        ASHLAR_HOME_PAGE,
        'separator1',
        'edit.php?post_type=page',
        'edit.php?post_type=' . ASHLAR_PROJECT,
        'edit.php',
        'edit.php?post_type=' . ASHLAR_MESSAGE,
        'upload.php',
        'nav-menus.php',
        ASHLAR_OPTION_PAGE,
        'separator2',
    ];

    $first = array_values(array_intersect($first, $order));

    return array_merge($first, array_values(array_diff($order, $first)));
});

// --------------------------------------------------
//	4. Barra superior, pie y avisos
// --------------------------------------------------

add_action('admin_bar_menu', 'ashlar_admin_bar', 999);

function ashlar_admin_bar(WP_Admin_Bar $bar): void
{
    $bar->remove_node('wp-logo');
    $bar->remove_node('search');
    $bar->remove_node('customize');

    if (!ashlar_has_comments()) {
        $bar->remove_node('comments');
    }

    if (!ashlar_has_blog()) {
        $bar->remove_node('new-post');
    }

    if (!ashlar_is_admin_user()) {
        $bar->remove_node('site-editor');
        $bar->remove_node('updates');
        $bar->remove_node('new-user');
        $bar->remove_node('themes');
        $bar->remove_node('widgets');
        $bar->remove_node('menus');
    }

    // «Dashboard» del desplegable del nombre del sitio → Home.
    if ($bar->get_node('dashboard')) {
        $bar->add_node(['id' => 'dashboard', 'title' => __('Dashboard home', 'ashlar'), 'href' => admin_url('admin.php?page=' . ASHLAR_HOME_PAGE)]);
    }
}

add_filter('admin_footer_text', static function (): string {
    return sprintf(
        '<span class="ashlar-admin-footer">%s · %s</span>',
        esc_html(wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES)),
        sprintf(
            /* translators: %s: link to the theme author. */
            esc_html__('Dashboard made to measure by %s', 'ashlar'),
            '<a href="https://jpiedra.com" target="_blank" rel="noopener">Javier Piedra</a>'
        )
    );
});

add_filter('update_footer', static fn($content) => ashlar_is_admin_user() ? $content : '', 11);

add_action('admin_head', static function (): void {
    if (ashlar_is_admin_user()) {
        return;
    }

    // Ni avisos de actualización ni la pestaña de ayuda genérica de WordPress.
    remove_action('admin_notices', 'update_nag', 3);
    remove_action('admin_notices', 'maintenance_nag', 10);

    $screen = get_current_screen();
    if ($screen) {
        $screen->remove_help_tabs();
    }
});

// Sin comentarios ni pings en ningún contenido nuevo (la web no los usa).
add_action('init', static function (): void {
    if (ashlar_has_comments()) {
        return;
    }

    foreach (['page', 'post'] as $post_type) {
        remove_post_type_support($post_type, 'comments');
        remove_post_type_support($post_type, 'trackbacks');
    }
    add_filter('comments_open', '__return_false', 20);
    add_filter('pings_open', '__return_false', 20);
});
