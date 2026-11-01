import { useBlockProps, RichText } from '@wordpress/block-editor';
import Chapter from '../../components/chapter';
import { themeClass } from '../../components/section-theme';
import { barWidth, countText } from './parts';

/**
 * Save de «Where we build»: cada zona es una fila con su nombre, una barra
 * proporcional (decorativa) y el número de proyectos en texto.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, chapterNum, chapterLabel, title, lede, countFormat, areas } = attributes;

    return (
        <section {...useBlockProps.save({ className: ['boroughs', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
            <div className="boroughs__inner wrap">
                <header className="boroughs__head">
                    <div className="boroughs__heading">
                        <Chapter num={chapterNum} label={chapterLabel} />
                        <RichText.Content tagName="h2" className="boroughs__title" value={title} data-split="" />
                    </div>
                    {lede && <RichText.Content tagName="p" className="boroughs__lede" value={lede} data-reveal="" />}
                </header>
                <ul className="boroughs__list" data-reveal="">
                    {areas.map((area, index) => (
                        <li className="boroughs__row" key={index}>
                            <RichText.Content tagName="span" className="boroughs__name" value={area.name} />
                            <span className="boroughs__bar" aria-hidden="true">
                                <span style={{ width: barWidth(area.count, areas) }} />
                            </span>
                            <span className="boroughs__count">{countText(countFormat, area.count)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
