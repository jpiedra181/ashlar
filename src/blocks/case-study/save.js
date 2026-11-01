import { useBlockProps, RichText } from '@wordpress/block-editor';
import Button from '../../components/button';
import Media from '../../components/media';

/**
 * Save del Caso destacado: foto a sangre a la izquierda (760 de 1440) y panel
 * oscuro con el nombre, el resumen, los datos (lista de definiciones) y el
 * enlace.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { image, eyebrow, title, summary, specs, buttonLabel, buttonUrl } = attributes;

    return (
        <section {...useBlockProps.save({ className: 'case-study' })}>
            <Media image={image} className="case-study__media" parallax={0.15} sizes="(min-width: 1024px) 53vw, 100vw" />
            <div className="case-study__panel theme-dark">
                <div className="case-study__heading">
                    <RichText.Content tagName="p" className="case-study__eyebrow" value={eyebrow} data-reveal="" />
                    <RichText.Content tagName="h2" className="case-study__title" value={title} data-split="" />
                </div>
                <RichText.Content tagName="p" className="case-study__summary" value={summary} data-reveal="" />
                {specs.length > 0 && (
                    <dl className="case-study__specs">
                        {specs.map((spec, index) => (
                            <div className="case-study__spec" key={index} data-reveal="">
                                <RichText.Content tagName="dt" value={spec.key} />
                                <RichText.Content tagName="dd" value={spec.value} />
                            </div>
                        ))}
                    </dl>
                )}
                {buttonLabel && (
                    <div data-reveal="">
                        <Button url={buttonUrl} variant="outline">
                            <RichText.Content value={buttonLabel} />
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
