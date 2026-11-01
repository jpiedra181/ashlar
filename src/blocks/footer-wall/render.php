<?php

/**
 * Render server-side del Muro del pie.
 *
 * Cuatro hiladas de sillares a soga que cierran la web: cada hilada desplaza
 * las juntas medio sillar respecto a la de abajo (las desplazadas empiezan y
 * acaban en medio sillar, para que el muro tenga los cantos rectos). La de
 * abajo, el zócalo, lleva el nombre del sitio grabado, una letra por sillar;
 * en la de encima hay un sillar de corten, como en la marca.
 *
 * Es decorativo (aria-hidden): el nombre ya lo anuncian el logotipo de la
 * cabecera y el título de la página. Lo anima src/js/modules/footer.js
 * ([data-footer-wall]): los sillares se colocan de abajo arriba.
 *
 * @var array    $attributes Atributos del bloque (sin uso).
 * @var string   $content    Contenido interno (sin uso).
 * @var WP_Block $block      Instancia del bloque.
 */

defined('ABSPATH') || exit;

$name    = (string) preg_replace('/\s+/u', '', ashlar_site_name());
$letters = array_slice(preg_split('//u', mb_strtoupper($name), -1, PREG_SPLIT_NO_EMPTY) ?: [], 0, 10);
$count   = max(4, count($letters)); // sillares por hilada

// De arriba abajo. «offset»: juntas desplazadas medio sillar.
$courses = ['offset', 'aligned', 'offset', 'plinth'];

// Sillar de corten: en la hilada sobre el zócalo, a dos tercios del muro.
$accent_course = 2;
$accent_stone  = (int) floor($count * 2 / 3);

// Tres tonos de piedra repartidos sin patrón aparente (siempre el mismo).
$tones = [0, 1, 0, 2, 1, 0, 2, 0, 1, 1, 0, 2, 0];

$wrapper_attributes = get_block_wrapper_attributes([
    'class'            => 'footer-wall',
    'style'            => sprintf('--stones: %d; --cols: %d;', $count, $count * 2),
    'aria-hidden'      => 'true',
    'data-footer-wall' => '',
]);
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput ?>>
    <?php foreach ($courses as $c => $type) : ?>
        <div class="footer-wall__course footer-wall__course--<?php echo esc_attr($type); ?>">
            <?php
            // Medio sillar (1) o sillar entero (2), en columnas de medio sillar.
            $spans = $type === 'offset'
                ? array_merge([1], array_fill(0, $count - 1, 2), [1])
                : array_fill(0, $count, 2);

            foreach ($spans as $i => $span) :
                $classes = ['footer-wall__stone', 'footer-wall__stone--t' . $tones[($c * 5 + $i) % count($tones)]];
                if ($span === 1) {
                    $classes[] = 'footer-wall__stone--half';
                }
                if ($c === $accent_course && $i === $accent_stone) {
                    $classes[] = 'footer-wall__stone--accent';
                }
                ?>
                <span class="<?php echo esc_attr(implode(' ', $classes)); ?>">
                    <?php if ($type === 'plinth' && isset($letters[$i])) : ?>
                        <span class="footer-wall__letter"><?php echo esc_html($letters[$i]); ?></span>
                    <?php endif; ?>
                </span>
            <?php endforeach; ?>
        </div>
    <?php endforeach; ?>
</div>
