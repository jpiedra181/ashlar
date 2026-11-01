<?php

/**
 * Render server-side del bloque Datos de contacto.
 *
 * Pinta, en el orden elegido, los datos de Opciones → Contacto que pida el
 * bloque: dirección, horario, email y teléfono. Los datos viven en un único
 * sitio aunque aparezcan en el pie, en el menú y en la página de contacto.
 *
 * @var array    $attributes Atributos del bloque (title, fields).
 * @var string   $content    Contenido interno (sin uso).
 * @var WP_Block $block      Instancia del bloque.
 */

defined('ABSPATH') || exit;

$title   = trim($attributes['title'] ?? '');
$fields  = (array) ($attributes['fields'] ?? ['email', 'phone']);
$contact = ashlar_contact();

$parts = [];
$links = [];

foreach ($fields as $field) {
    switch ($field) {
        case 'address':
            // Una sola línea, formato británico: «14 Wharf Road, London N1 7RW».
            if ($contact['address'] !== '') {
                $links[] = sprintf('<li><address class="site-contact__text">%s</address></li>', esc_html($contact['address']));
            }
            break;

        case 'hours':
            if ($contact['hours'] !== '') {
                $parts[] = sprintf('<p class="site-contact__text site-contact__text--soft">%s</p>', esc_html($contact['hours']));
            }
            break;

        case 'email':
            if ($contact['email'] !== '') {
                $links[] = sprintf('<li><a class="site-contact__link" href="%s">%s</a></li>', esc_url('mailto:' . $contact['email']), esc_html($contact['email']));
            }
            break;

        case 'phone':
            if ($contact['phone'] !== '') {
                $links[] = sprintf('<li><a class="site-contact__link" href="%s">%s</a></li>', esc_url($contact['phone_href']), esc_html($contact['phone']));
            }
            break;
    }
}

if ($links) {
    $parts[] = '<ul class="site-contact__list">' . implode('', $links) . '</ul>';
}

if (!$parts) {
    echo ashlar_editor_notice(__('The contact details are missing. Fill them in under Options → Contact.', 'ashlar')); // phpcs:ignore WordPress.Security.EscapeOutput
    return;
}

$wrapper_attributes = get_block_wrapper_attributes(['class' => 'site-contact']);
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput ?>>
    <?php if ($title !== '') : ?>
        <h2 class="site-contact__title eyebrow t-soft"><?php echo esc_html($title); ?></h2>
    <?php endif; ?>
    <?php echo implode('', $parts); // phpcs:ignore WordPress.Security.EscapeOutput -- escapado arriba ?>
</div>
