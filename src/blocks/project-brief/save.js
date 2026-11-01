import { useBlockProps, RichText } from '@wordpress/block-editor';
import Chapter from '../../components/chapter';
import { themeClass } from '../../components/section-theme';

/**
 * Save de «The brief»: capítulo a la izquierda; a la derecha, la cita del
 * cliente (h2) y las dos listas.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, chapterNum, chapterLabel, quote, cite, foundLabel, found, didLabel, did } = attributes;

    return (
        <section {...useBlockProps.save({ className: ['project-brief', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
            <div className="project-brief__inner wrap">
                <Chapter num={chapterNum} label={chapterLabel} />
                <div className="project-brief__body">
                    <figure className="project-brief__quote">
                        <blockquote>
                            <RichText.Content tagName="h2" value={quote} data-split="" />
                        </blockquote>
                        {cite && <RichText.Content tagName="figcaption" value={cite} />}
                    </figure>
                    <div className="project-brief__lists" data-reveal="">
                        {[
                            [foundLabel, found],
                            [didLabel, did],
                        ].map(([label, items], index) => (
                            <div className="project-brief__list" key={index}>
                                <RichText.Content tagName="h3" className="project-brief__label" value={label} />
                                <ul className="dash-list">
                                    {items.map((item, itemIndex) => (
                                        <RichText.Content tagName="li" value={item} key={itemIndex} />
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
