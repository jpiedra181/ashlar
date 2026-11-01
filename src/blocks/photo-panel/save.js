import { useBlockProps, RichText } from '@wordpress/block-editor';
import Button from '../../components/button';
import Media from '../../components/media';
import { themeClass } from '../../components/section-theme';

/** Clases de la sección (compartidas con edit.js). */
export const panelClass = ({ theme, imagePosition }) =>
    ['photo-panel', imagePosition === 'right' && 'photo-panel--right', themeClass(theme)].filter(Boolean).join(' ');

/**
 * Save de «Photo and panel» (About: «The yard»; Contact: «Open house»).
 *
 * Foto a sangre a un lado y, en el panel del tono elegido, rótulo, <h2>,
 * texto y botón con una nota opcional al lado («12 of 40 places left»).
 * En móvil la foto va arriba.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { image, eyebrow, title, text, buttonLabel, buttonUrl, buttonVariant, note } = attributes;

    return (
        <section {...useBlockProps.save({ className: panelClass(attributes) })}>
            <Media image={image} className="photo-panel__media" parallax={0.15} sizes="(min-width: 1024px) 55vw, 100vw" />
            <div className="photo-panel__panel">
                <div className="photo-panel__heading">
                    {eyebrow && <RichText.Content tagName="p" className="photo-panel__eyebrow" value={eyebrow} data-reveal="" />}
                    <RichText.Content tagName="h2" className="photo-panel__title" value={title} data-split="" />
                </div>
                {text && <RichText.Content tagName="p" className="photo-panel__text" value={text} data-reveal="" />}
                {(buttonLabel || note) && (
                    <div className="photo-panel__actions" data-reveal="">
                        {buttonLabel && (
                            <Button url={buttonUrl} variant={buttonVariant} className="photo-panel__button">
                                <RichText.Content value={buttonLabel} />
                            </Button>
                        )}
                        {note && <RichText.Content tagName="p" className="photo-panel__note" value={note} />}
                    </div>
                )}
            </div>
        </section>
    );
}
