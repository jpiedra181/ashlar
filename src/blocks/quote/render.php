<?php

/**
 * Render del formulario de presupuesto: completa el HTML guardado (save.js)
 * con lo que vive fuera del bloque.
 *
 *  - Teléfono, email y dirección de Options → Contact en <dl data-quote-channels>.
 *  - Envío a admin-post.php (acción ashlar_quote, inc/messages.php) con su
 *    nonce: sin JavaScript el envío clásico también funciona.
 *  - Cifras y frases de la horquilla en data-quote-config (las usa view.js).
 *  - ?sent=1 / ?sent=0 (vuelta de un envío sin JavaScript): agradecimiento o
 *    aviso.
 *
 * En el editor, preview = 'channels' devuelve solo los canales para la vista
 * previa (ServerSideRender).
 *
 * @var array    $attributes Atributos del bloque.
 * @var string   $content    HTML guardado por save.js.
 * @var WP_Block $block      Instancia del bloque.
 */

defined('ABSPATH') || exit;

$contact = ashlar_contact();
$plain   = static fn(string $key): string => wp_strip_all_tags(html_entity_decode((string) ($attributes[$key] ?? ''), ENT_QUOTES, 'UTF-8'));

$channels = [];

if ($contact['phone'] !== '') {
    $channels[] = [
        'label' => $plain('phoneLabel'),
        'value' => sprintf('<a class="quote__channel-link" href="%s">%s</a>', esc_url($contact['phone_href']), esc_html($contact['phone'])),
        'note'  => $contact['hours'],
    ];
}

if ($contact['email'] !== '') {
    $channels[] = [
        'label' => $plain('emailLabel'),
        'value' => sprintf('<a class="quote__channel-link" href="%s">%s</a>', esc_url('mailto:' . $contact['email']), esc_html($contact['email'])),
        'note'  => $plain('emailNote'),
    ];
}

if ($contact['address'] !== '') {
    $channels[] = [
        'label' => $plain('addressLabel'),
        'value' => esc_html($contact['address']),
        'note'  => $plain('addressNote'),
    ];
}

$items = '';
foreach ($channels as $channel) {
    $items .= sprintf(
        '<div class="quote__channel"><dt class="quote__channel-label">%s</dt><dd class="quote__channel-value">%s%s</dd></div>',
        esc_html($channel['label']),
        $channel['value'], // Escapado arriba.
        $channel['note'] !== '' ? '<span class="quote__channel-note">' . esc_html($channel['note']) . '</span>' : ''
    );
}

// Vista previa del editor: solo los canales.
if (($attributes['preview'] ?? '') === 'channels') {
    echo $items // phpcs:ignore WordPress.Security.EscapeOutput -- escapado al construirlo
        ? '<dl class="quote__channels">' . $items . '</dl>'
        : ashlar_editor_notice(__('Add the phone, email or address in Options → Contact.', 'ashlar'));
    return;
}

$html = (string) preg_replace(
    '/(<dl[^>]*data-quote-channels[^>]*>)\s*(<\/dl>)/',
    '$1' . str_replace(['\\', '$'], ['\\\\', '\$'], $items) . '$2',
    $content,
    1
);

// Lo que necesita view.js para la horquilla: cifras por tipo de obra y tamaño,
// y las palabras de la frase «Based on 18 rear extensions of 20–40 m²…».
$config = [
    'estimates' => array_values(array_map(static fn($row): array => [
        'service' => sanitize_key($row['service'] ?? ''),
        'size'    => sanitize_key($row['size'] ?? ''),
        'price'   => wp_strip_all_tags((string) ($row['price'] ?? '')),
        'time'    => wp_strip_all_tags((string) ($row['time'] ?? '')),
        'jobs'    => wp_strip_all_tags((string) ($row['jobs'] ?? '')),
    ], (array) ($attributes['estimates'] ?? []))),
    'work'      => array_column(array_map(static fn($row): array => [sanitize_key($row['value'] ?? ''), wp_strip_all_tags((string) ($row['plural'] ?? ''))], (array) ($attributes['services'] ?? [])), 1, 0),
    'sizes'     => array_column(array_map(static fn($row): array => [sanitize_key($row['value'] ?? ''), wp_strip_all_tags((string) ($row['phrase'] ?? ''))], (array) ($attributes['sizes'] ?? [])), 1, 0),
    'basis'     => $plain('ballparkBasis'),
    'basisAny'  => $plain('ballparkBasisAny'),
    'unsure'    => $plain('ballparkUnsure'),
    'prompt'    => $plain('ballparkPrompt'),
];

$sent      = isset($_GET['sent']) ? sanitize_key(wp_unslash($_GET['sent'])) : ''; // phpcs:ignore WordPress.Security.NonceVerification -- solo elige qué mensaje enseñar
$processor = new WP_HTML_Tag_Processor($html);

if ($processor->next_tag(['tag_name' => 'form', 'class_name' => 'qform'])) {
    $processor->set_attribute('action', admin_url('admin-post.php'));
    $processor->set_attribute('data-quote-config', (string) wp_json_encode($config));

    if ($sent === '1') {
        $processor->set_attribute('hidden', true);
    }
}

// Avanza por los campos hasta el del nonce.
while ($processor->next_tag(['tag_name' => 'input'])) {
    if ($processor->get_attribute('data-quote-nonce') !== null) {
        $processor->set_attribute('value', wp_create_nonce(ASHLAR_QUOTE_ACTION));
        break;
    }
}

if ($sent === '1' && $processor->next_tag(['class_name' => 'qform__success'])) {
    $processor->remove_attribute('hidden');
}

$html = $processor->get_updated_html();

// Vuelta de un envío sin JavaScript que no se pudo guardar.
if ($sent === '0') {
    $html = (string) preg_replace(
        '/(<p[^>]*data-quote-status[^>]*)>\s*<\/p>/',
        '$1 data-error="">' . esc_html__('Something was missing or the form had expired. Please check your details and send it again, or give us a call.', 'ashlar') . '</p>',
        $html,
        1
    );
}

echo $html; // phpcs:ignore WordPress.Security.EscapeOutput -- HTML del propio bloque, con lo añadido escapado
