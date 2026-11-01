<?php

/**
 * Peticiones de presupuesto (bloque ashlar/quote)
 *
 * Sin plugins: el formulario envía a admin-post.php (acción ashlar_quote),
 * que valida, guarda la petición como entrada privada (tipo ashlar_message,
 * en el escritorio como «Messages») y avisa por email (Options → Contact).
 *
 * Base: inc/messages.php de Raíz. Cambia el destino: Raíz usaba la API REST,
 * pero ahí el nonce falla con la sesión iniciada (sin la cabecera X-WP-Nonce
 * la API trata la petición como anónima). admin-post.php reconoce al usuario
 * por su cookie, así que el nonce vale con y sin sesión.
 *
 * Defensas: nonce, campo trampa invisible (honeypot), límite de envíos por IP
 * y saneado de todo; las opciones elegidas solo se aceptan si existen en el
 * bloque. Es un formulario público: no hay capability que comprobar.
 * Sin JavaScript también funciona: el envío clásico vuelve a la página con
 * ?sent=1 (o ?sent=0) y el bloque muestra el agradecimiento o el aviso
 * (src/blocks/quote/render.php). Con JavaScript la respuesta es JSON.
 */

defined('ABSPATH') || exit;

const ASHLAR_MESSAGE      = 'ashlar_message';
const ASHLAR_QUOTE_ACTION = 'ashlar_quote';

/**
 * Opciones del formulario: valor → etiqueta, por pregunta.
 *
 * Son las del bloque publicado (se editan en su panel lateral); sin él, las
 * de su block.json.
 *
 * @return array{service: array<string, string>, size: array<string, string>, start: array<string, string>}
 */
function ashlar_quote_choices(): array
{
    static $choices = null;

    if ($choices === null) {
        $defaults = ashlar_quote_block_defaults();
        $saved    = get_option('ashlar_quote_choices');
        $choices  = [];

        foreach (['service', 'size', 'start'] as $key) {
            $choices[$key] = !empty($saved[$key]) ? $saved[$key] : $defaults[$key];
        }
    }

    return $choices;
}

/**
 * Opciones por defecto del bloque (block.json compilado).
 */
function ashlar_quote_block_defaults(): array
{
    $file       = get_theme_file_path('build/blocks/quote/block.json');
    $metadata   = file_exists($file) ? wp_json_file_decode($file, ['associative' => true]) : [];
    $attributes = $metadata['attributes'] ?? [];

    return [
        'service' => ashlar_quote_options_map($attributes['services']['default'] ?? []),
        'size'    => ashlar_quote_options_map($attributes['sizes']['default'] ?? []),
        'start'   => ashlar_quote_options_map($attributes['starts']['default'] ?? []),
    ];
}

/**
 * [{value, label}] → [value => label].
 */
function ashlar_quote_options_map(array $options): array
{
    $map = [];

    foreach ($options as $option) {
        $value = sanitize_key($option['value'] ?? '');
        if ($value !== '') {
            $map[$value] = wp_strip_all_tags(html_entity_decode((string) ($option['label'] ?? $value), ENT_QUOTES, 'UTF-8'));
        }
    }

    return $map;
}

// Al publicar la página con el formulario se guardan sus opciones.
add_action('save_post_page', static function (int $post_id, WP_Post $post): void {
    if ($post->post_status !== 'publish' || wp_is_post_revision($post_id) || !has_block('ashlar/quote', $post)) {
        return;
    }

    foreach (parse_blocks($post->post_content) as $block) {
        if ($block['blockName'] !== 'ashlar/quote') {
            continue;
        }

        // Los atributos que siguen por defecto no se guardan en el bloque.
        $defaults = ashlar_quote_block_defaults();
        $choices  = [];

        foreach (['service' => 'services', 'size' => 'sizes', 'start' => 'starts'] as $key => $attribute) {
            $choices[$key] = isset($block['attrs'][$attribute]) ? ashlar_quote_options_map($block['attrs'][$attribute]) : $defaults[$key];
        }

        update_option('ashlar_quote_choices', $choices, false);

        return;
    }
}, 10, 2);

// --------------------------------------------------
//	Tipo de contenido
// --------------------------------------------------

add_action('init', static function (): void {
    register_post_type(ASHLAR_MESSAGE, [
        'labels' => [
            'name'          => __('Messages', 'ashlar'),
            'singular_name' => __('Message', 'ashlar'),
            'edit_item'     => __('Message', 'ashlar'),
            'search_items'  => __('Search messages', 'ashlar'),
            'not_found'     => __('No messages yet.', 'ashlar'),
            'all_items'     => __('All messages', 'ashlar'),
            'menu_name'     => __('Messages', 'ashlar'),
        ],
        'public'          => false,
        'show_ui'         => true,
        'show_in_menu'    => true,
        'show_in_rest'    => false,
        'menu_icon'       => 'dashicons-email-alt',
        'menu_position'   => 7,
        'supports'        => ['title'],
        'capability_type' => 'page',
        'map_meta_cap'    => true,
        // Las peticiones llegan solas: nadie las crea a mano.
        'capabilities'    => ['create_posts' => 'do_not_allow'],
    ]);
});

// --------------------------------------------------
//	Envío
// --------------------------------------------------

add_action('admin_post_nopriv_' . ASHLAR_QUOTE_ACTION, 'ashlar_quote_submit');
add_action('admin_post_' . ASHLAR_QUOTE_ACTION, 'ashlar_quote_submit');

/**
 * Recibe el formulario. Responde JSON al envío con JavaScript y redirige
 * (303) al envío clásico.
 */
function ashlar_quote_submit(): void
{
    $wants_json = str_contains(sanitize_text_field(wp_unslash($_SERVER['HTTP_ACCEPT'] ?? '')), 'application/json');
    $referer    = wp_get_referer() ?: home_url('/');

    $respond = static function (bool $ok, array $data, int $status) use ($wants_json, $referer): void {
        if ($wants_json) {
            wp_send_json(array_merge(['ok' => $ok], $data), $status);
        }

        wp_safe_redirect(add_query_arg('sent', $ok ? '1' : '0', $referer) . '#quote', 303);
        exit;
    };

    // Campo trampa: un humano no lo ve; un robot lo rellena. Se responde «ok»
    // para no darle pistas.
    if (trim(sanitize_text_field(wp_unslash($_POST['qf_hp'] ?? ''))) !== '') {
        $respond(true, [], 200);
    }

    if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['ashlar_nonce'] ?? '')), ASHLAR_QUOTE_ACTION)) {
        $respond(false, ['message' => __('This form has expired. Please reload the page and try again.', 'ashlar')], 403);
    }

    // Máximo 5 envíos por IP cada 10 minutos.
    $ip       = sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'] ?? ''));
    $rate_key = 'ashlar_quote_' . md5($ip);
    $attempts = (int) get_transient($rate_key);

    if ($attempts >= 5) {
        $respond(false, ['message' => __('You’ve sent several enquiries in a row. Please wait a few minutes and try again, or give us a call.', 'ashlar')], 429);
    }

    $choices = ashlar_quote_choices();
    $text    = static fn(string $key): string => sanitize_text_field(wp_unslash($_POST[$key] ?? ''));
    $fields  = [
        'service'  => sanitize_key(wp_unslash($_POST['service'] ?? '')),
        'size'     => sanitize_key(wp_unslash($_POST['size'] ?? '')),
        'start'    => sanitize_key(wp_unslash($_POST['start'] ?? '')),
        'name'     => mb_substr($text('name'), 0, 120),
        'phone'    => mb_substr($text('phone'), 0, 40),
        'email'    => sanitize_email(wp_unslash($_POST['email'] ?? '')),
        'postcode' => strtoupper(mb_substr($text('postcode'), 0, 10)),
        'message'  => mb_substr(sanitize_textarea_field(wp_unslash($_POST['message'] ?? '')), 0, 3000),
        'report'   => !empty($_POST['report']) ? '1' : '0',
    ];

    $errors = [];
    if (!isset($choices['service'][$fields['service']])) {
        $errors['service'] = __('Choose what you’re planning.', 'ashlar');
    }
    if (!isset($choices['size'][$fields['size']])) {
        $errors['size'] = __('Choose roughly how big it is, or “Not sure”.', 'ashlar');
    }
    if (!isset($choices['start'][$fields['start']])) {
        $errors['start'] = __('Choose when you’d like to start.', 'ashlar');
    }
    if ($fields['name'] === '') {
        $errors['name'] = __('Tell us your name.', 'ashlar');
    }
    if (preg_match_all('/\d/', $fields['phone']) < 7) {
        $errors['phone'] = __('Enter a phone number Marta can call, e.g. 07700 900123.', 'ashlar');
    }
    if (!is_email($fields['email'])) {
        $errors['email'] = __('Enter an email address like name@example.com.', 'ashlar');
    }
    if (!preg_match('/^[A-Z0-9 ]{2,10}$/', $fields['postcode'])) {
        $errors['postcode'] = __('Enter your postcode, or just the first part, e.g. NW3.', 'ashlar');
    }

    if ($errors) {
        $respond(false, ['errors' => $errors], 422);
    }

    set_transient($rate_key, $attempts + 1, 10 * MINUTE_IN_SECONDS);

    $message_id = wp_insert_post([
        'post_type'    => ASHLAR_MESSAGE,
        'post_status'  => 'private',
        'post_title'   => sprintf('%s · %s', $fields['name'], $choices['service'][$fields['service']]),
        'post_content' => $fields['message'],
    ], true);

    if (is_wp_error($message_id)) {
        $respond(false, ['message' => __('We couldn’t save your enquiry.', 'ashlar')], 500);
    }

    foreach ($fields as $key => $value) {
        update_post_meta($message_id, '_ashlar_' . $key, $value);
    }
    update_post_meta($message_id, '_ashlar_read', 0);

    ashlar_quote_notify($message_id, $fields, $choices);

    $respond(true, ['id' => $message_id], 200);
}

/**
 * Filas legibles de una petición (aviso por email y ficha del escritorio).
 *
 * @return array<string, string> Etiqueta → valor (texto plano).
 */
function ashlar_quote_rows(array $fields, array $choices): array
{
    return [
        __('Name', 'ashlar')          => $fields['name'],
        __('Phone', 'ashlar')         => $fields['phone'],
        __('Email', 'ashlar')         => $fields['email'],
        __('Postcode', 'ashlar')      => $fields['postcode'],
        __('Planning', 'ashlar')      => $choices['service'][$fields['service']] ?? $fields['service'],
        __('Size', 'ashlar')          => $choices['size'][$fields['size']] ?? $fields['size'],
        __('Start', 'ashlar')         => $choices['start'][$fields['start']] ?? $fields['start'],
        __('Friday report', 'ashlar') => $fields['report'] === '1' ? __('Yes, send one', 'ashlar') : __('No', 'ashlar'),
    ];
}

/**
 * Aviso por email (Options → Contact → Email), con «Responder» dirigido a
 * quien escribe.
 */
function ashlar_quote_notify(int $message_id, array $fields, array $choices): void
{
    $to    = ashlar_get_option('contact_email') ?: get_option('admin_email');
    $lines = [];

    foreach (ashlar_quote_rows($fields, $choices) as $label => $value) {
        $lines[] = $label . ': ' . ($value !== '' ? $value : '—');
    }

    $lines[] = '';
    $lines[] = $fields['message'] !== '' ? $fields['message'] : __('(No extra notes.)', 'ashlar');
    $lines[] = '';
    $lines[] = __('Open in the dashboard:', 'ashlar') . ' ' . admin_url('post.php?post=' . $message_id . '&action=edit');

    wp_mail(
        $to,
        /* translators: 1: name of the person, 2: kind of job. */
        sprintf(__('New enquiry from %1$s: %2$s', 'ashlar'), $fields['name'], $choices['service'][$fields['service']] ?? ''),
        implode("\n", $lines),
        // Solo el email: el nombre podía colar una segunda dirección con una coma
        ['Reply-To: ' . $fields['email']]
    );
}

// --------------------------------------------------
//	Escritorio: listado y lectura
// --------------------------------------------------

add_filter('manage_' . ASHLAR_MESSAGE . '_posts_columns', static fn(array $columns): array => [
    'cb'             => $columns['cb'],
    'title'          => __('From', 'ashlar'),
    'ashlar_contact' => __('Contact', 'ashlar'),
    'ashlar_job'     => __('Job', 'ashlar'),
    'date'           => __('Received', 'ashlar'),
]);

// En la columna «Received» basta la fecha (WordPress añade «Last modified»
// encima por ser entradas privadas).
add_filter('post_date_column_status', static fn(string $status, WP_Post $post): string => $post->post_type === ASHLAR_MESSAGE ? '' : $status, 10, 2);

add_action('manage_' . ASHLAR_MESSAGE . '_posts_custom_column', static function (string $column, int $post_id): void {
    $get     = static fn(string $key): string => (string) get_post_meta($post_id, '_ashlar_' . $key, true);
    $choices = ashlar_quote_choices();

    if ($column === 'ashlar_contact') {
        printf('<a href="%s">%s</a><br>', esc_url('mailto:' . $get('email')), esc_html($get('email')));
        printf('<a href="%s">%s</a>', esc_url('tel:' . preg_replace('/[^0-9+]/', '', $get('phone'))), esc_html($get('phone')));
    }

    if ($column === 'ashlar_job') {
        echo esc_html(implode(' · ', array_filter([
            $choices['service'][$get('service')] ?? $get('service'),
            $choices['size'][$get('size')] ?? '',
            $choices['start'][$get('start')] ?? '',
        ])));

        if (!get_post_meta($post_id, '_ashlar_read', true)) {
            echo ' <span class="ashlar-badge">' . esc_html__('New', 'ashlar') . '</span>';
        }
    }
}, 10, 2);

// La ficha de la petición: solo lectura, con «Reply by email».
add_action('add_meta_boxes_' . ASHLAR_MESSAGE, static function (WP_Post $post): void {
    remove_meta_box('submitdiv', ASHLAR_MESSAGE, 'side');
    add_meta_box('ashlar-message', __('Enquiry', 'ashlar'), 'ashlar_render_message_box', ASHLAR_MESSAGE, 'normal', 'high');

    // Al abrirla, queda leída.
    update_post_meta($post->ID, '_ashlar_read', 1);
});

function ashlar_render_message_box(WP_Post $post): void
{
    $get    = static fn(string $key): string => (string) get_post_meta($post->ID, '_ashlar_' . $key, true);
    $fields = [];

    foreach (['service', 'size', 'start', 'name', 'phone', 'email', 'postcode', 'report'] as $key) {
        $fields[$key] = $get($key);
    }

    $rows = ashlar_quote_rows($fields, ashlar_quote_choices());
    ?>
    <div class="ashlar-message">
        <dl class="ashlar-message__data">
            <?php foreach ($rows as $label => $value) : ?>
                <dt><?php echo esc_html($label); ?></dt>
                <dd>
                    <?php
                    if ($label === __('Email', 'ashlar') && $value !== '') {
                        printf('<a href="%s">%s</a>', esc_url('mailto:' . $value), esc_html($value));
                    } elseif ($label === __('Phone', 'ashlar') && $value !== '') {
                        printf('<a href="%s">%s</a>', esc_url('tel:' . preg_replace('/[^0-9+]/', '', $value)), esc_html($value));
                    } else {
                        echo esc_html($value !== '' ? $value : '—');
                    }
                    ?>
                </dd>
            <?php endforeach; ?>
            <dt><?php esc_html_e('Received', 'ashlar'); ?></dt>
            <dd><?php echo esc_html(get_the_date('j F Y, H:i', $post)); ?></dd>
        </dl>
        <?php if (trim($post->post_content) !== '') : ?>
            <div class="ashlar-message__body"><?php echo wp_kses_post(wpautop(esc_html($post->post_content))); ?></div>
        <?php endif; ?>
        <p>
            <a class="button button-primary" href="<?php echo esc_url('mailto:' . $get('email') . '?subject=' . rawurlencode(__('Your enquiry to Ashlar', 'ashlar'))); ?>">
                <?php esc_html_e('Reply by email', 'ashlar'); ?>
            </a>
        </p>
    </div>
    <?php
}

// Estilos mínimos del listado y la ficha (el título no se edita).
add_action('admin_head', static function (): void {
    if (get_current_screen()?->post_type !== ASHLAR_MESSAGE) {
        return;
    }
    ?>
    <style>
        #titlediv #title { pointer-events: none; background: transparent; border-color: transparent; box-shadow: none; }
        #edit-slug-box { display: none; }
        .ashlar-badge { display: inline-block; margin-left: 4px; padding: 1px 8px; border-radius: 999px; background: #b85a28; color: #fff; font-size: 11px; font-weight: 600; line-height: 18px; vertical-align: middle; }
        .ashlar-message__data { display: grid; grid-template-columns: max-content 1fr; gap: 8px 24px; margin: 8px 0 16px; }
        .ashlar-message__data dt { color: #50575e; font-weight: 600; }
        .ashlar-message__data dd { margin: 0; }
        .ashlar-message__body { padding: 12px 16px; border-left: 3px solid #b85a28; background: #f6f7f7; }
    </style>
    <?php
});

/**
 * Peticiones sin leer (contador del menú).
 */
function ashlar_unread_messages(): int
{
    $ids = get_posts([
        'post_type'   => ASHLAR_MESSAGE,
        'post_status' => 'private',
        'numberposts' => -1,
        'fields'      => 'ids',
        'meta_query'  => [['key' => '_ashlar_read', 'value' => '0']], // phpcs:ignore WordPress.DB.SlowDBQuery
    ]);

    return count($ids);
}

// Contador de no leídas en el menú lateral.
add_action('admin_menu', static function (): void {
    global $menu;

    $unread = ashlar_unread_messages();
    if (!$unread) {
        return;
    }

    foreach ($menu as $index => $item) {
        if (($item[2] ?? '') === 'edit.php?post_type=' . ASHLAR_MESSAGE) {
            $menu[$index][0] .= sprintf(' <span class="awaiting-mod"><span class="pending-count">%d</span></span>', $unread);
        }
    }
}, 1000);
