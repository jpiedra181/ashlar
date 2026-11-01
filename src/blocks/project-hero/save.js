import { useBlockProps, RichText } from '@wordpress/block-editor';

/**
 * Save de la foto principal del proyecto (bloque híbrido).
 *
 * Se guardan las dos notas; la foto es la imagen destacada del proyecto y la
 * pone render.php en el hueco data-project-photo (así solo se elige en un
 * sitio y sirve también para las tarjetas).
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { dimension, caption } = attributes;

    return (
        <figure {...useBlockProps.save({ className: 'project-hero theme-dark' })}>
            <div className="project-hero__photo" data-project-photo="" />
            {dimension && (
                <p className="project-hero__dim" aria-hidden="true">
                    <RichText.Content tagName="span" className="project-hero__note" value={dimension} />
                    <span className="project-hero__dim-line" />
                </p>
            )}
            {caption && <RichText.Content tagName="figcaption" className="project-hero__note project-hero__caption" value={caption} />}
        </figure>
    );
}
