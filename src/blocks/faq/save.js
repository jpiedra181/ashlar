import { useBlockProps, RichText } from '@wordpress/block-editor';
import { themeClass } from '../../components/section-theme';

/**
 * Save de las preguntas frecuentes (Services, Contact).
 *
 * <details>/<summary> nativos: teclado, lector de pantalla y sin JS (base: el
 * bloque faq de Raíz). La primera puede salir abierta (openFirst), como en el
 * Figma. La apertura suave es CSS (interpolate-size) donde el navegador lo
 * permite.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, eyebrow, title, openFirst, items } = attributes;

    return (
        <section {...useBlockProps.save({ className: ['faq', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
            <div className="faq__inner wrap">
                <header className="faq__heading">
                    {eyebrow && <RichText.Content tagName="p" className="faq__eyebrow" value={eyebrow} data-reveal="" />}
                    <RichText.Content tagName="h2" className="faq__title" value={title} data-split="" />
                </header>

                <div className="faq__list">
                    {items.map((item, index) => (
                        <details className="faq__item" open={openFirst && index === 0 ? true : undefined} key={index} data-reveal="">
                            <summary className="faq__summary">
                                <RichText.Content tagName="span" className="faq__question" value={item.question} />
                                <span className="faq__icon" aria-hidden="true" />
                            </summary>
                            <div className="faq__answer">
                                <RichText.Content tagName="p" value={item.answer} />
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
