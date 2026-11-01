import { useBlockProps, RichText } from '@wordpress/block-editor';
import Button from '../../components/button';
import Media from '../../components/media';
import { Arrow } from '../../components/icons';
import { themeClass } from '../../components/section-theme';

/** Clases de la sección (compartidas con edit.js). */
export const serviceClass = ({ theme, imagePosition }) =>
    ['service', 'section', imagePosition === 'right' && 'service--right', themeClass(theme)].filter(Boolean).join(' ');

/**
 * Save de un servicio (Services: Extensions, Lofts…).
 *
 * Foto 600×620 a un lado y el contenido al otro: número («01 / 05»), <h2>,
 * resumen, tres datos (lista de definiciones), «What’s included», la nota
 * «Good to know» y las acciones (botón + enlace a un proyecto). En móvil la
 * foto va siempre arriba. El ancla (#extensions…) es el «HTML anchor» del
 * bloque, al que apuntan el menú y services-list.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { image, number, title, summary, facts, includedLabel, included, noteLabel, note, buttonLabel, buttonUrl, linkLabel, linkUrl } = attributes;

    return (
        <section {...useBlockProps.save({ className: serviceClass(attributes) })}>
            <div className="service__inner wrap">
                <Media image={image} className="service__media" reveal sizes="(min-width: 1440px) 600px, (min-width: 1024px) 42vw, 100vw" />
                <div className="service__content">
                    <header className="service__heading">
                        {number && <RichText.Content tagName="p" className="service__number" value={number} data-reveal="" />}
                        <RichText.Content tagName="h2" className="service__title" value={title} data-split="" />
                        {summary && <RichText.Content tagName="p" className="service__summary" value={summary} data-reveal="" />}
                    </header>

                    {facts.length > 0 && (
                        <dl className="service__facts" data-reveal="">
                            {facts.map((fact, index) => (
                                <div className="service__fact" key={index}>
                                    <RichText.Content tagName="dt" value={fact.key} />
                                    <RichText.Content tagName="dd" value={fact.value} />
                                </div>
                            ))}
                        </dl>
                    )}

                    {included.length > 0 && (
                        <div className="service__included" data-reveal="">
                            <RichText.Content tagName="h3" className="service__label" value={includedLabel} />
                            <ul className="dash-list service__list">
                                {included.map((item, index) => (
                                    <RichText.Content tagName="li" value={item} key={index} />
                                ))}
                            </ul>
                        </div>
                    )}

                    {note && (
                        <div className="service__note" data-reveal="">
                            <RichText.Content tagName="p" className="service__note-label" value={noteLabel} />
                            <RichText.Content tagName="p" value={note} />
                        </div>
                    )}

                    {(buttonLabel || linkLabel) && (
                        <div className="service__actions" data-reveal="">
                            {buttonLabel && (
                                <Button url={buttonUrl} variant="secondary" className="service__button">
                                    <RichText.Content value={buttonLabel} />
                                </Button>
                            )}
                            {linkLabel && (
                                <a className="link service__link" href={linkUrl || undefined}>
                                    <RichText.Content value={linkLabel} />
                                    <Arrow />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
