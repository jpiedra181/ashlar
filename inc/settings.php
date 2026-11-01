<?php

/**
 * Opciones del tema
 *
 * Datos globales que el cliente edita en un único sitio (contacto, redes,
 * textos de cabecera y pie, pantalla de acceso) y que pintan los bloques
 * dinámicos del tema. Se guardan en una sola opción, `ashlar_options`.
 *
 * TODO sale del esquema de ashlar_settings_schema(): las secciones, los campos,
 * sus valores por defecto, el saneado y el formulario. Añadir un campo es
 * añadir una entrada al array; no hay que tocar nada más.
 */

defined('ABSPATH') || exit;

const ASHLAR_OPTION      = 'ashlar_options';
const ASHLAR_OPTION_PAGE = 'ashlar-settings';

add_action('admin_menu', 'ashlar_add_options_page');
add_action('admin_init', 'ashlar_register_settings');

// options.php pide manage_options por defecto: sin esto, el rol Client (que ve
// el menú con edit_theme_options) no podía guardar las opciones.
add_filter('option_page_capability_ashlar_options_group', static fn(): string => 'edit_theme_options');
add_action('admin_enqueue_scripts', 'ashlar_enqueue_settings_assets');

// --------------------------------------------------
//	Esquema
// --------------------------------------------------

/**
 * Secciones y campos de la página de opciones.
 *
 * Tipos de campo: text, email, url (admite rutas relativas: /contacto),
 * textarea, media (una imagen) y gallery (varias imágenes ordenables).
 *
 * @return array<string, array{title: string, description?: string, icon?: string, fields: array}>
 */
function ashlar_settings_schema(): array
{
    $networks = [];
    foreach (ashlar_social_networks() as $service => $label) {
        $networks['social_' . $service] = [
            'label'       => $label,
            'type'        => 'url',
            'placeholder' => 'https://',
            'default'     => in_array($service, ['instagram', 'linkedin', 'houzz'], true)
                ? 'https://' . $service . '.com'
                : '',
        ];
    }

    return [
        'contact' => [
            'title'       => __('Contact', 'ashlar'),
            'icon'        => 'dashicons-location',
            'description' => __('Shown in the footer, the mobile menu and the contact page. Leave a field empty to hide it.', 'ashlar'),
            'fields'      => [
                'contact_email'       => ['label' => __('Email', 'ashlar'), 'type' => 'email', 'default' => 'hello@ashlar.build'],
                'contact_phone'       => ['label' => __('Phone', 'ashlar'), 'default' => '020 7946 0321', 'description' => __('Shown exactly as you type it; the call link is generated automatically.', 'ashlar')],
                'contact_hours'       => ['label' => __('Opening hours', 'ashlar'), 'default' => 'Monday to Friday, 8am – 6pm'],
                'address_street'      => ['label' => __('Street', 'ashlar'), 'default' => '14 Wharf Road'],
                'address_city'        => ['label' => __('Town or city', 'ashlar'), 'default' => 'London', 'width' => 'short'],
                'address_postal_code' => ['label' => __('Postcode', 'ashlar'), 'default' => 'N1 7RW', 'width' => 'short'],
                'address_country'     => ['label' => __('Country', 'ashlar'), 'default' => 'United Kingdom', 'width' => 'short'],
                'map_lat'             => ['label' => __('Map · latitude', 'ashlar'), 'default' => '51.5323', 'width' => 'short', 'description' => __('For the map on the contact page. In Google Maps, right-click the yard and copy the two numbers.', 'ashlar')],
                'map_lng'             => ['label' => __('Map · longitude', 'ashlar'), 'default' => '-0.0975', 'width' => 'short'],
            ],
        ],
        'social' => [
            'title'       => __('Social', 'ashlar'),
            'icon'        => 'dashicons-share',
            'description' => __('Paste the full address of each profile. Networks without an address are hidden.', 'ashlar'),
            'fields'      => $networks,
        ],
        'header' => [
            'title'  => __('Header', 'ashlar'),
            'icon'   => 'dashicons-align-wide',
            'fields' => [
                'header_cta_label'  => ['label' => __('Button text', 'ashlar'), 'default' => 'Get a rough price'],
                'header_cta_url'    => ['label' => __('Button link', 'ashlar'), 'type' => 'url', 'default' => '/contact', 'description' => __('A page on the site (/contact) or a full address.', 'ashlar')],
                'header_show_phone' => ['label' => __('Phone in the header', 'ashlar'), 'default' => 'no', 'width' => 'short', 'description' => __('Type “yes” to show the phone number next to the button on large screens.', 'ashlar')],
                'menu_live_text'    => ['label' => __('Mobile menu · live line', 'ashlar'), 'default' => 'On site now · Highbury Hill, N5 · wk 9/22', 'description' => __('The small line with the orange dot above the button in the mobile menu. Leave it empty to hide it.', 'ashlar')],
            ],
        ],
        'footer' => [
            'title'  => __('Footer', 'ashlar'),
            'icon'   => 'dashicons-align-full-width',
            'fields' => [
                'footer_cta_eyebrow' => ['label' => __('Eyebrow', 'ashlar'), 'default' => ''],
                'footer_cta_title'   => ['label' => __('Headline', 'ashlar'), 'default' => 'Got a house that needs work?'],
                'footer_cta_label'   => ['label' => __('Button text', 'ashlar'), 'default' => 'Get a rough price'],
                'footer_cta_url'     => ['label' => __('Button link', 'ashlar'), 'type' => 'url', 'default' => '/contact'],
                'footer_about'       => ['label' => __('About text', 'ashlar'), 'type' => 'textarea', 'default' => 'A small building firm in Islington, building and restoring houses across north and east London since 2009.'],
                'footer_copyright'   => ['label' => __('Legal line', 'ashlar'), 'default' => '© {year} Ashlar Construction Ltd · Registered in England & Wales', 'description' => __('{year} is replaced with the current year.', 'ashlar')],
            ],
        ],
        'login' => [
            'title'       => __('Login screen', 'ashlar'),
            'icon'        => 'dashicons-lock',
            'description' => __('The page where you sign in to this dashboard. Without photos of your own, it shows the theme’s project photos.', 'ashlar'),
            'fields'      => [
                'login_images' => ['label' => __('Photos', 'ashlar'), 'type' => 'gallery', 'default' => [], 'description' => __('They change on their own, one after another. Each photo’s title and caption (in Media) are shown under it, e.g. “Elm Row” and “Hampstead, NW3”. Drag to change the order.', 'ashlar')],
                'login_title'  => ['label' => __('Headline', 'ashlar'), 'default' => '', 'placeholder' => 'Good *afternoon*', 'description' => __('Empty: a greeting for the time of day (“Good morning”, “Good afternoon”, “Good evening”). Words between asterisks go in the softer tone.', 'ashlar')],
                'login_text'   => ['label' => __('Text', 'ashlar'), 'type' => 'textarea', 'default' => 'Sign in to edit the pages, the projects and the company details.'],
            ],
        ],
        'analytics' => [
            'title'  => __('Analytics', 'ashlar'),
            'icon'   => 'dashicons-chart-area',
            'fields' => [
                'google_analytics_id' => ['label' => __('Google Analytics ID', 'ashlar'), 'placeholder' => 'G-XXXXXXXXXX', 'default' => ''],
            ],
        ],
    ];
}

/**
 * Redes sociales disponibles: servicio del core (de ahí sale el icono) → nombre.
 * Para añadir una red basta con una línea aquí.
 *
 * @return array<string, string>
 */
function ashlar_social_networks(): array
{
    return [
        'instagram' => 'Instagram',
        'linkedin'  => 'LinkedIn',
        'houzz'     => 'Houzz',
        'facebook'  => 'Facebook',
        'youtube'   => 'YouTube',
        'pinterest' => 'Pinterest',
    ];
}

/**
 * Campos del esquema aplanados: clave → definición (con su tipo resuelto).
 */
function ashlar_settings_fields(): array
{
    static $fields = null;

    if ($fields === null) {
        $fields = [];
        foreach (ashlar_settings_schema() as $section) {
            foreach ($section['fields'] as $key => $field) {
                $fields[$key] = wp_parse_args($field, ['type' => 'text', 'default' => '']);
            }
        }
    }

    return $fields;
}

// --------------------------------------------------
//	Lectura
// --------------------------------------------------

/**
 * Valor de una opción, con el valor por defecto del esquema si nunca se guardó.
 *
 * Un campo guardado vacío devuelve vacío (el cliente lo quitó a propósito);
 * solo los que no existen todavía caen al valor por defecto.
 *
 * @return mixed String para los campos de texto, array de IDs para gallery.
 */
function ashlar_get_option(string $key, $fallback = '')
{
    $options = get_option(ASHLAR_OPTION, []);

    if (is_array($options) && array_key_exists($key, $options)) {
        return $options[$key];
    }

    $fields = ashlar_settings_fields();

    return $fields[$key]['default'] ?? $fallback;
}

// --------------------------------------------------
//	Registro
// --------------------------------------------------

function ashlar_add_options_page(): void
{
    add_menu_page(
        __('Site options', 'ashlar'),
        __('Options', 'ashlar'),
        'edit_theme_options',
        ASHLAR_OPTION_PAGE,
        'ashlar_render_options_page',
        'dashicons-admin-generic',
        59
    );
}

function ashlar_register_settings(): void
{
    register_setting('ashlar_options_group', ASHLAR_OPTION, [
        'type'              => 'array',
        'sanitize_callback' => 'ashlar_sanitize_options',
        'default'           => [],
    ]);

    foreach (ashlar_settings_schema() as $section_id => $section) {
        add_settings_section(
            'ashlar_' . $section_id,
            $section['title'],
            static function () use ($section): void {
                if (!empty($section['description'])) {
                    printf('<p class="ashlar-settings__intro">%s</p>', esc_html($section['description']));
                }
            },
            ASHLAR_OPTION_PAGE
        );

        foreach ($section['fields'] as $key => $field) {
            add_settings_field(
                $key,
                $field['label'],
                'ashlar_render_field',
                ASHLAR_OPTION_PAGE,
                'ashlar_' . $section_id,
                ['key' => $key, 'label_for' => 'ashlar-' . $key]
            );
        }
    }
}

// --------------------------------------------------
//	Saneado
// --------------------------------------------------

function ashlar_sanitize_options($input): array
{
    $input = is_array($input) ? $input : [];
    $clean = [];

    foreach (ashlar_settings_fields() as $key => $field) {
        if (!array_key_exists($key, $input)) {
            continue;
        }

        $value = $input[$key];

        switch ($field['type']) {
            case 'email':
                $clean[$key] = sanitize_email((string) $value);
                break;

            case 'url':
                // Un campo vacío se guarda vacío, no como la URL que
                // esc_url_raw devolvería para una cadena en blanco.
                $value       = trim((string) $value);
                $clean[$key] = $value === '' ? '' : esc_url_raw($value);
                break;

            case 'textarea':
                $clean[$key] = sanitize_textarea_field((string) $value);
                break;

            case 'media':
                $clean[$key] = absint($value);
                break;

            case 'gallery':
                $ids         = is_array($value) ? $value : explode(',', (string) $value);
                $clean[$key] = array_values(array_filter(array_map('absint', $ids)));
                break;

            default:
                $clean[$key] = sanitize_text_field((string) $value);
        }
    }

    return $clean;
}

// --------------------------------------------------
//	Campos
// --------------------------------------------------

function ashlar_render_field(array $args): void
{
    $key   = $args['key'];
    $field = ashlar_settings_fields()[$key];
    $id    = 'ashlar-' . $key;
    $name  = ASHLAR_OPTION . '[' . $key . ']';
    $value = ashlar_get_option($key);

    switch ($field['type']) {
        case 'textarea':
            printf(
                '<textarea id="%s" name="%s" rows="3" class="large-text" placeholder="%s">%s</textarea>',
                esc_attr($id),
                esc_attr($name),
                esc_attr($field['placeholder'] ?? ''),
                esc_textarea((string) $value)
            );
            break;

        case 'media':
        case 'gallery':
            ashlar_render_media_field($id, $name, $field['type'], $value);
            break;

        default:
            printf(
                '<input type="%s" id="%s" name="%s" value="%s" placeholder="%s" class="%s">',
                esc_attr($field['type'] === 'url' ? 'text' : $field['type']),
                esc_attr($id),
                esc_attr($name),
                esc_attr((string) $value),
                esc_attr($field['placeholder'] ?? ''),
                esc_attr(($field['width'] ?? '') === 'short' ? 'regular-text ashlar-field--short' : 'regular-text')
            );
    }

    if (!empty($field['description'])) {
        printf('<p class="description">%s</p>', esc_html($field['description']));
    }
}

/**
 * Selector de imágenes (una o varias) con la biblioteca de medios.
 * La lógica vive en src/admin/settings-page.js.
 */
function ashlar_render_media_field(string $id, string $name, string $type, $value): void
{
    $ids      = array_filter(array_map('absint', (array) $value));
    $multiple = $type === 'gallery';
?>
    <div class="ashlar-media-field" data-multiple="<?php echo $multiple ? '1' : '0'; ?>">
        <ul class="ashlar-media-field__list">
            <?php foreach ($ids as $attachment_id) : ?>
                <li class="ashlar-media-field__item" data-id="<?php echo esc_attr($attachment_id); ?>">
                    <?php echo wp_get_attachment_image($attachment_id, 'medium'); ?>
                    <button type="button" class="ashlar-media-field__remove" aria-label="<?php esc_attr_e('Remove image', 'ashlar'); ?>">×</button>
                </li>
            <?php endforeach; ?>
        </ul>
        <input type="hidden" id="<?php echo esc_attr($id); ?>" name="<?php echo esc_attr($name); ?>" value="<?php echo esc_attr(implode(',', $ids)); ?>">
        <button type="button" class="button ashlar-media-field__select">
            <?php echo $multiple ? esc_html__('Add images', 'ashlar') : esc_html__('Choose image', 'ashlar'); ?>
        </button>
    </div>
<?php
}

// --------------------------------------------------
//	Página
// --------------------------------------------------

function ashlar_render_options_page(): void
{
    if (!current_user_can('edit_theme_options')) {
        return;
    }

    $schema = ashlar_settings_schema();
?>
    <div class="wrap ashlar-settings">
        <header class="ashlar-settings__header">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            <p><?php esc_html_e('The details that repeat across the website. Change them here once and every page updates.', 'ashlar'); ?></p>
        </header>

        <?php settings_errors(); ?>

        <nav class="ashlar-settings__tabs" role="tablist" aria-label="<?php esc_attr_e('Sections', 'ashlar'); ?>">
            <?php foreach ($schema as $section_id => $section) : ?>
                <button type="button" role="tab" class="ashlar-settings__tab" id="ashlar-tab-<?php echo esc_attr($section_id); ?>" aria-controls="ashlar-panel-<?php echo esc_attr($section_id); ?>" data-section="<?php echo esc_attr($section_id); ?>">
                    <span class="dashicons <?php echo esc_attr($section['icon'] ?? 'dashicons-admin-generic'); ?>" aria-hidden="true"></span>
                    <?php echo esc_html($section['title']); ?>
                </button>
            <?php endforeach; ?>
        </nav>

        <form action="options.php" method="post" class="ashlar-settings__form">
            <?php settings_fields('ashlar_options_group'); ?>

            <?php foreach ($schema as $section_id => $section) : ?>
                <section class="ashlar-settings__panel" role="tabpanel" id="ashlar-panel-<?php echo esc_attr($section_id); ?>" aria-labelledby="ashlar-tab-<?php echo esc_attr($section_id); ?>" data-section="<?php echo esc_attr($section_id); ?>">
                    <h2><?php echo esc_html($section['title']); ?></h2>
                    <?php if (!empty($section['description'])) : ?>
                        <p class="ashlar-settings__intro"><?php echo esc_html($section['description']); ?></p>
                    <?php endif; ?>
                    <table class="form-table" role="presentation">
                        <?php do_settings_fields(ASHLAR_OPTION_PAGE, 'ashlar_' . $section_id); ?>
                    </table>
                </section>
            <?php endforeach; ?>

            <div class="ashlar-settings__actions">
                <?php submit_button(__('Save changes', 'ashlar'), 'primary', 'submit', false); ?>
            </div>
        </form>
    </div>
<?php
}

function ashlar_enqueue_settings_assets(string $hook): void
{
    if ('toplevel_page_' . ASHLAR_OPTION_PAGE !== $hook) {
        return;
    }

    // Selector de imágenes (wp.media) de los campos media y gallery.
    wp_enqueue_media();

    // Pestañas y campos de la página. Mientras inc/admin.php no esté cargado
    // (fase 5), la hoja del admin se encola solo aquí.
    if (!function_exists('ashlar_admin_assets') && file_exists(get_template_directory() . '/build/admin/admin.css')) {
        $admin = ashlar_asset('admin/admin');
        wp_enqueue_style('ashlar-admin', get_template_directory_uri() . '/build/admin/admin.css', [], $admin['version']);
    }

    $build_dir  = get_template_directory() . '/build';
    $build_uri  = get_template_directory_uri() . '/build';
    $asset_file = $build_dir . '/admin/settings-page.asset.php';
    $asset      = file_exists($asset_file)
        ? require $asset_file
        : ['dependencies' => [], 'version' => '1.0.0'];

    wp_enqueue_script(
        'ashlar-settings-page',
        $build_uri . '/admin/settings-page.js',
        array_merge($asset['dependencies'], ['jquery-ui-sortable']),
        $asset['version'],
        true
    );
}

// --------------------------------------------------
//	Enlace a esta página desde el editor de bloques
//	Los bloques que se alimentan de estas opciones no tienen nada que editar en
//	el inspector, así que muestran un enlace aquí.
// --------------------------------------------------

add_action('enqueue_block_editor_assets', 'ashlar_settings_editor_data', 20);

function ashlar_settings_editor_data(): void
{
    wp_add_inline_script(
        'ashlar-editor-config',
        'window.ashlarSettingsUrl = ' . wp_json_encode(admin_url('admin.php?page=' . ASHLAR_OPTION_PAGE)) . ';',
        'before'
    );
}
