import { useBlockProps, RichText } from '@wordpress/block-editor';
import { themeClass } from '../../components/section-theme';

/**
 * Save de Colaboradores: rótulo y fila de nombres (lista real).
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, label, names } = attributes;

    return (
        <section {...useBlockProps.save({ className: ['partners', themeClass(theme)].filter(Boolean).join(' ') })}>
            <div className="partners__inner wrap" data-reveal="">
                <RichText.Content tagName="h2" className="partners__label" value={label} />
                <ul className="partners__list">
                    {names.map((item, index) => (
                        <RichText.Content tagName="li" className="partners__name" value={item.name} key={index} />
                    ))}
                </ul>
            </div>
        </section>
    );
}
