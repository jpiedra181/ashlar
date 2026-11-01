import { useBlockProps, RichText } from '@wordpress/block-editor';
import { themeClass } from '../../components/section-theme';

/**
 * Save de la línea de tiempo (About: «How we got here.»).
 *
 * Cabecera y una lista ordenada de hitos (año, <h3> y una línea). El eje de
 * escritorio (línea, puntos, marcas y flecha) es un único elemento
 * decorativo dibujado con CSS; --count le dice cuántas columnas hay para que
 * cada punto caiga al principio de la suya. En móvil cada hito pinta su
 * propio punto y su tramo de carril.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, eyebrow, title, lede, items } = attributes;

    return (
        <section {...useBlockProps.save({ className: ['timeline', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
            <div className="timeline__inner wrap">
                <header className="timeline__head">
                    <div className="timeline__heading">
                        {eyebrow && <RichText.Content tagName="p" className="timeline__eyebrow" value={eyebrow} data-reveal="" />}
                        <RichText.Content tagName="h2" className="timeline__title" value={title} data-split="" />
                    </div>
                    {lede && <RichText.Content tagName="p" className="timeline__lede" value={lede} data-reveal="" />}
                </header>

                <div className="timeline__body" style={{ '--count': items.length }}>
                    <div className="timeline__axis" aria-hidden="true" />
                    <ol className="timeline__list">
                        {items.map((item, index) => (
                            <li className="timeline__item" key={index} data-reveal="">
                                <RichText.Content tagName="p" className="timeline__year" value={item.year} />
                                <RichText.Content tagName="h3" className="timeline__item-title" value={item.title} />
                                <RichText.Content tagName="p" className="timeline__text" value={item.text} />
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}
