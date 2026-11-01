import { useBlockProps, RichText } from '@wordpress/block-editor';
import Chapter from '../../components/chapter';
import Media from '../../components/media';
import { themeClass } from '../../components/section-theme';

/**
 * Save de «From the Friday reports»: tarjetas con fecha y estado (verde si va
 * en plazo, corten si va con retraso), foto, texto, decisión pendiente
 * (opcional) y firma.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, chapterNum, chapterLabel, title, lede, decisionLabel, reports } = attributes;

    return (
        <section {...useBlockProps.save({ className: ['project-reports', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
            <div className="project-reports__inner wrap">
                <header className="project-reports__head">
                    <div className="project-reports__heading">
                        <Chapter num={chapterNum} label={chapterLabel} />
                        <RichText.Content tagName="h2" className="project-reports__title" value={title} data-split="" />
                    </div>
                    {lede && <RichText.Content tagName="p" className="project-reports__lede" value={lede} data-reveal="" />}
                </header>

                <ul className="project-reports__list">
                    {reports.map((report, index) => (
                        <li className="report" key={index} data-reveal="">
                            <article className="report__card">
                                <header className="report__head">
                                    <RichText.Content tagName="h3" className="report__date" value={report.date} />
                                    <RichText.Content tagName="p" className={['report__status', report.late && 'is-late'].filter(Boolean).join(' ')} value={report.status} />
                                </header>
                                <Media image={report.image} className="report__media" sizes="(min-width: 1024px) 360px, 100vw" />
                                <RichText.Content tagName="p" className="report__text" value={report.text} />
                                {report.decision && (
                                    <div className="report__decision">
                                        <RichText.Content tagName="p" className="report__decision-label" value={decisionLabel} />
                                        <RichText.Content tagName="p" className="report__decision-text" value={report.decision} />
                                    </div>
                                )}
                                {report.signature && <RichText.Content tagName="p" className="report__signature" value={report.signature} />}
                            </article>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
