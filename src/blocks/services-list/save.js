import { useBlockProps, RichText } from '@wordpress/block-editor';
import Chapter from '../../components/chapter';
import Media from '../../components/media';
import { Arrow } from '../../components/icons';
import { themeClass } from '../../components/section-theme';

export const serviceNumber = (index) => String(index + 1).padStart(2, '0');

/**
 * Save de la lista de servicios. Cada fila es un enlace entero (al servicio
 * en la página Services). La foto de la fila es decorativa (alt vacío): solo
 * acompaña al pasar el ratón y el nombre ya dice qué es.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, chapterNum, chapterLabel, title, note, services } = attributes;

    return (
        <section {...useBlockProps.save({ className: ['services', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
            <div className="services__inner wrap">
                <header className="services__head">
                    <div className="services__heading">
                        <Chapter num={chapterNum} label={chapterLabel} />
                        <RichText.Content tagName="h2" className="services__title" value={title} data-split="" />
                    </div>
                    {note && <RichText.Content tagName="p" className="services__note" value={note} data-reveal="" />}
                </header>

                <ul className="services__list">
                    {services.map((service, index) => (
                        <li className="srow" key={index} data-reveal="">
                            <a className="srow__link" href={service.url || undefined}>
                                <span className="srow__num" aria-hidden="true">
                                    {serviceNumber(index)}
                                </span>
                                <RichText.Content tagName="h3" className="srow__name" value={service.name} />
                                {service.image?.url && <Media image={{ ...service.image, alt: '' }} className="srow__thumb" sizes="200px" />}
                                <span className="srow__meta">
                                    <RichText.Content tagName="span" className="srow__duration" value={service.duration} />
                                    <RichText.Content tagName="span" className="srow__price" value={service.price} />
                                </span>
                                <Arrow direction="up-right" className="srow__arrow" />
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
