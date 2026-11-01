import { useBlockProps, RichText } from '@wordpress/block-editor';
import Chapter from '../../components/chapter';
import Media from '../../components/media';
import { themeClass } from '../../components/section-theme';

/**
 * Save de «The plan»: dos láminas (antes / después) con su plano y la leyenda.
 * La segunda lámina lleva el rótulo en corten (es el resultado).
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, chapterNum, chapterLabel, title, lede, plans, legend, scale } = attributes;

    return (
        <section {...useBlockProps.save({ className: ['project-plan', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
            <div className="project-plan__inner wrap">
                <header className="project-plan__head">
                    <div className="project-plan__heading">
                        <Chapter num={chapterNum} label={chapterLabel} />
                        <RichText.Content tagName="h2" className="project-plan__title" value={title} data-split="" />
                    </div>
                    {lede && <RichText.Content tagName="p" className="project-plan__lede" value={lede} data-reveal="" />}
                </header>

                <div className="project-plan__sheets">
                    {plans.map((plan, index) => (
                        <figure className={['project-plan__sheet', index > 0 && 'is-result'].filter(Boolean).join(' ')} key={index} data-reveal="">
                            <figcaption className="project-plan__sheet-head">
                                <RichText.Content tagName="span" className="project-plan__sheet-title" value={plan.title} />
                                <RichText.Content tagName="span" className="project-plan__sheet-label" value={plan.label} />
                            </figcaption>
                            <Media image={plan.image} className="project-plan__drawing" sizes="(min-width: 1024px) 562px, 100vw" />
                        </figure>
                    ))}
                </div>

                {(legend.length > 0 || scale) && (
                    <ul className="project-plan__legend" data-reveal="">
                        {legend.map((item, index) => (
                            <li key={index}>
                                <span className={`project-plan__swatch project-plan__swatch--${item.type}`} aria-hidden="true" />
                                <RichText.Content value={item.label} />
                            </li>
                        ))}
                        {scale && <RichText.Content tagName="li" className="project-plan__scale" value={scale} />}
                    </ul>
                )}
            </div>
        </section>
    );
}
