import { useBlockProps, RichText } from '@wordpress/block-editor';
import Button from '../../components/button';
import { themeClass } from '../../components/section-theme';

/**
 * Save de la franja de aviso (About: «We’re hiring»).
 *
 * Rótulo, <h2> (con el estilo H3 del Figma), una línea de detalle y el botón
 * a la derecha; en móvil, todo apilado y el botón a todo el ancho.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, eyebrow, title, text, buttonLabel, buttonUrl, buttonVariant } = attributes;

    return (
        <section {...useBlockProps.save({ className: ['callout', themeClass(theme)].filter(Boolean).join(' ') })}>
            <div className="callout__inner wrap" data-reveal="">
                <div className="callout__text">
                    {eyebrow && <RichText.Content tagName="p" className="callout__eyebrow" value={eyebrow} />}
                    <RichText.Content tagName="h2" className="callout__title" value={title} />
                    {text && <RichText.Content tagName="p" className="callout__detail" value={text} />}
                </div>
                {buttonLabel && (
                    <Button url={buttonUrl} variant={buttonVariant} className="callout__button">
                        <RichText.Content value={buttonLabel} />
                    </Button>
                )}
            </div>
        </section>
    );
}
