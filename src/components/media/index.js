/**
 * Media — el marco de foto de Ashlar (edit y save comparten el markup).
 *
 *   <div class="media [media--parallax] …" data-media-reveal data-parallax="0.12">
 *     <img class="wp-image-123" src alt width height style="object-position: …">
 *   </div>
 *
 * La clase wp-image-{id} hace que WordPress añada en el front el srcset y los
 * sizes de la biblioteca de medios (wp_filter_content_tags): la foto se sirve
 * al tamaño justo sin que el bloque tenga que calcularlo.
 *
 * Valor de imagen (atributo de tipo object):
 *   { id, url, alt, width, height, focal: { x, y } }
 */

import { __ } from '@wordpress/i18n';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { IconImage } from '../icons';

/** Posición CSS del punto focal ({ x: 0.5, y: 0.58 } → "50% 58%"). */
export function focalPosition(image) {
    const focal = image?.focal;
    if (!focal) return undefined;
    return `${Math.round(focal.x * 100)}% ${Math.round(focal.y * 100)}%`;
}

/** Normaliza lo que devuelve la biblioteca de medios al valor del atributo. */
export function imageFromMedia(media, previous = {}) {
    return {
        id: media.id,
        url: media.url,
        alt: media.alt || previous.alt || '',
        width: media.width,
        height: media.height,
        focal: previous.focal,
    };
}

/**
 * Marco de foto.
 *
 * @param {Object}  props
 * @param {Object}  props.image       Valor del atributo de imagen.
 * @param {string}  [props.className] Clases extra del marco.
 * @param {string}  [props.ratio]     aspect-ratio del marco ("4 / 5").
 * @param {boolean} [props.reveal]    El marco se descubre al entrar en pantalla.
 * @param {number}  [props.parallax]  Desplazamiento interior con el scroll: 0.1 enmarcada, 0.15 a sangre
 *                                    (animations.js lleva cualquier otro valor al más cercano).
 * @param {boolean} [props.intro]     Leve zoom de entrada (fotos sobre el pliegue).
 * @param {boolean} [props.priority]  Foto principal: carga inmediata y prioritaria.
 * @param {string}  [props.sizes]     Ancho de pintado para el srcset.
 * @param {Object}  [props.extra]     Atributos extra del marco (data-*).
 * @param {*}       [props.children]  Contenido si no hay foto (placeholder del editor).
 */
export default function Media({ image = {}, className, ratio, reveal, parallax, intro, priority, sizes, extra = {}, children }) {
    const classes = ['media', parallax && 'media--parallax', className].filter(Boolean).join(' ');
    const position = focalPosition(image);

    return (
        <div
            className={classes}
            style={ratio ? { aspectRatio: ratio } : undefined}
            data-media-reveal={reveal ? '' : undefined}
            data-parallax={parallax || undefined}
            data-intro-zoom={intro ? '' : undefined}
            {...extra}
        >
            {image.url ? (
                <img
                    className={image.id ? `wp-image-${image.id}` : undefined}
                    src={image.url}
                    alt={image.alt || ''}
                    width={image.width || undefined}
                    height={image.height || undefined}
                    sizes={sizes}
                    style={position ? { objectPosition: position } : undefined}
                    // Explícito: WordPress no marca como lazy las tres primeras
                    // imágenes del contenido, aunque estén bajo el pliegue.
                    loading={priority ? 'eager' : 'lazy'}
                    fetchpriority={priority ? 'high' : undefined}
                    decoding={priority ? 'sync' : undefined}
                />
            ) : (
                children
            )}
        </div>
    );
}

/**
 * Hueco para elegir foto directamente en el lienzo del editor.
 */
export function MediaPlaceholder({ image = {}, onChange, label = __('Choose photo', 'ashlar') }) {
    return (
        <MediaUploadCheck>
            <MediaUpload
                allowedTypes={['image']}
                onSelect={(media) => onChange(imageFromMedia(media, image))}
                render={({ open }) => (
                    <div className="ashlar-media-placeholder">
                        <Button variant="secondary" onClick={open} icon={IconImage}>
                            {label}
                        </Button>
                    </div>
                )}
            />
        </MediaUploadCheck>
    );
}
