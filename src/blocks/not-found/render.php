<?php

/**
 * Render de «Page not found» (templates/404.html).
 *
 * Izquierda, el plano: una habitación tachada del plano con «404» dentro,
 * cotas, la etiqueta «Removed» y el punto de replanteo. Es decorativo
 * (aria-hidden): el mensaje lo da el <h1>. Derecha, el mensaje, los enlaces
 * a las páginas principales y el teléfono de Options → Contact.
 *
 * @var array    $attributes Atributos del bloque.
 * @var string   $content    Vacío (bloque dinámico).
 * @var WP_Block $block      Instancia del bloque.
 */

defined('ABSPATH') || exit;

$text    = static fn(string $key): string => trim((string) ($attributes[$key] ?? ''));
$contact = ashlar_contact();

$links = '';
foreach ((array) ($attributes['links'] ?? []) as $link) {
    $label = trim(wp_strip_all_tags((string) ($link['label'] ?? '')));
    if ($label === '') {
        continue;
    }

    $sub    = trim(wp_strip_all_tags((string) ($link['sub'] ?? '')));
    $links .= sprintf(
        '<li><a class="not-found__link%s" href="%s"><span class="not-found__link-text"><span class="not-found__link-label">%s</span>%s</span>%s</a></li>',
        !empty($link['accent']) ? ' is-accent' : '',
        esc_url(ashlar_url((string) ($link['url'] ?? '/'))),
        esc_html($label),
        $sub !== '' ? '<span class="not-found__link-sub">' . esc_html($sub) . '</span>' : '',
        ashlar_arrow('right', 'not-found__arrow')
    );
}

// Punto de replanteo: círculo con cruz (Figma «survey-point»).
$survey_mark = '<svg class="not-found__mark" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true" focusable="false"><circle cx="16" cy="16" r="6"/><path d="M16 2v10M16 20v10M2 16h10M20 16h10"/></svg>';
?>
<section <?php echo get_block_wrapper_attributes(['class' => 'not-found']); // phpcs:ignore WordPress.Security.EscapeOutput ?>>
    <div class="not-found__inner wrap">
        <div class="not-found__plan" aria-hidden="true">
            <div class="not-found__room">
                <span class="not-found__code">404</span>
                <?php if ($text('tag') !== '') : ?>
                    <span class="not-found__tag"><span class="not-found__dash"></span><?php echo esc_html($text('tag')); ?></span>
                <?php endif; ?>
                <?php if ($text('point') !== '') : ?>
                    <span class="not-found__point"><?php echo $survey_mark; // phpcs:ignore WordPress.Security.EscapeOutput -- SVG fijo ?><?php echo esc_html($text('point')); ?></span>
                <?php endif; ?>
                <?php if ($text('width') !== '') : ?>
                    <span class="not-found__dim not-found__dim--w"><span><?php echo esc_html($text('width')); ?></span></span>
                <?php endif; ?>
                <?php if ($text('height') !== '') : ?>
                    <span class="not-found__dim not-found__dim--h"><span><?php echo esc_html($text('height')); ?></span></span>
                <?php endif; ?>
            </div>
        </div>

        <div class="not-found__message">
            <?php if ($text('eyebrow') !== '') : ?>
                <p class="not-found__eyebrow"><?php echo esc_html($text('eyebrow')); ?></p>
            <?php endif; ?>
            <h1 class="not-found__title"><?php echo wp_kses($text('title'), ['br' => []]); ?></h1>
            <?php if ($text('text') !== '') : ?>
                <p class="not-found__text"><?php echo esc_html($text('text')); ?></p>
            <?php endif; ?>
            <?php if ($links !== '') : ?>
                <ul class="not-found__links"><?php echo $links; // phpcs:ignore WordPress.Security.EscapeOutput -- escapado al construirlo ?></ul>
            <?php endif; ?>
            <?php if ($contact['phone'] !== '' && $text('callText') !== '') : ?>
                <p class="not-found__call">
                    <?php echo esc_html($text('callText')); ?>
                    <a href="<?php echo esc_url($contact['phone_href']); ?>"><?php echo esc_html($contact['phone']); ?></a>
                </p>
            <?php endif; ?>
        </div>
    </div>
</section>
