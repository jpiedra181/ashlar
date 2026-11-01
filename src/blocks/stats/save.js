import { useBlockProps, RichText } from '@wordpress/block-editor';
import { themeClass } from '../../components/section-theme';

/** Clases de la sección (compartidas con edit.js). */
export const statsClass = ({ theme, attached }) => ['stats', 'section', attached && 'stats--attached', themeClass(theme)].filter(Boolean).join(' ');

/**
 * Save de las cifras (About: «In numbers»).
 *
 * Lista de cifras grandes con su línea debajo y un filete oscuro encima. El
 * <h2> solo lo leen los lectores de pantalla: la sección no tiene titular a
 * la vista, pero así se puede llegar a ella navegando por encabezados.
 * Con «attached» se pega a la sección de arriba (sin espacio superior).
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { heading, items } = attributes;

    return (
        <section {...useBlockProps.save({ className: statsClass(attributes) })}>
            <div className="stats__inner wrap">
                {heading && <RichText.Content tagName="h2" className="visually-hidden" value={heading} />}
                <ul className="stats__list">
                    {items.map((item, index) => (
                        <li className="stats__item" key={index} data-reveal="">
                            <RichText.Content tagName="span" className="stats__value" value={item.value} />{' '}
                            <RichText.Content tagName="span" className="stats__label" value={item.label} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
