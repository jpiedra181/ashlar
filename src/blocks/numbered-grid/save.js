import { useBlockProps, RichText } from '@wordpress/block-editor';
import { themeClass } from '../../components/section-theme';

/** Número de cada punto: «01», «02»… (el orden lo da la lista). */
export const pointNumber = (index) => String(index + 1).padStart(2, '0');

/** Clases de la sección (compartidas con edit.js). */
export const gridClass = ({ theme, variant }) => ['numbered-grid', 'section', variant === 'cards' && 'numbered-grid--cards', themeClass(theme)].filter(Boolean).join(' ');

/**
 * Save de «Numbered points» (Services: «Every job comes with these.»;
 * About: «Three rules we don’t bend.» en tarjetas).
 *
 * Cabecera (rótulo, <h2> y entradilla a la derecha) y una lista ordenada:
 *  - ruled (por defecto): filetes, tres columnas en escritorio, dos en
 *    tableta y una en móvil (el número a la izquierda);
 *  - cards: tarjetas con fondo y una cifra grande opcional arriba a la
 *    derecha (stat). La cifra va detrás del texto en el HTML para que se lea
 *    después del título; la rejilla la coloca arriba.
 * El número es decorativo: el orden ya lo anuncia el <ol>.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { eyebrow, title, lede, items } = attributes;

    return (
        <section {...useBlockProps.save({ className: gridClass(attributes) })}>
            <div className="numbered-grid__inner wrap">
                <header className="numbered-grid__head">
                    <div className="numbered-grid__heading">
                        {eyebrow && <RichText.Content tagName="p" className="numbered-grid__eyebrow" value={eyebrow} data-reveal="" />}
                        <RichText.Content tagName="h2" className="numbered-grid__title" value={title} data-split="" />
                    </div>
                    {lede && <RichText.Content tagName="p" className="numbered-grid__lede" value={lede} data-reveal="" />}
                </header>

                <ol className="numbered-grid__list">
                    {items.map((item, index) => (
                        <li className="numbered-grid__item" key={index} data-reveal="">
                            <span className="numbered-grid__num" aria-hidden="true">
                                {pointNumber(index)}
                            </span>
                            <div className="numbered-grid__text">
                                <RichText.Content tagName="h3" className="numbered-grid__item-title" value={item.title} />
                                <RichText.Content tagName="p" className="numbered-grid__item-text" value={item.text} />
                            </div>
                            {item.stat && <RichText.Content tagName="span" className="numbered-grid__stat" value={item.stat} />}
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
