import { useBlockProps, RichText } from '@wordpress/block-editor';
import Chapter from '../../components/chapter';
import { themeClass } from '../../components/section-theme';
import { pounds, totals, swatch } from './money';

/**
 * Save de «The money»: barra apilada (decorativa), tabla de partidas con su
 * porcentaje e importe, y el resumen calculado (precio cerrado + cambios =
 * liquidación final).
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, chapterNum, chapterLabel, title, lede, items, fixedLabel, changesLabel, finalLabel, footnote } = attributes;
    const sums = totals(items);

    return (
        <section {...useBlockProps.save({ className: ['project-cost', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
            <div className="project-cost__inner wrap">
                <header className="project-cost__head">
                    <div className="project-cost__heading">
                        <Chapter num={chapterNum} label={chapterLabel} />
                        <RichText.Content tagName="h2" className="project-cost__title" value={title} data-split="" />
                    </div>
                    {lede && <RichText.Content tagName="p" className="project-cost__lede" value={lede} data-reveal="" />}
                </header>

                <div className="project-cost__bar" aria-hidden="true" data-reveal="">
                    {items.map((item, index) => (
                        <span className={`project-cost__segment is-${swatch(items, index)}`} style={{ flexGrow: Math.max(0, Number(item.amount) || 0) }} key={index} />
                    ))}
                </div>

                <table className="project-cost__table">
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <th scope="row">
                                    <span className={`project-cost__swatch is-${swatch(items, index)}`} aria-hidden="true" />
                                    <RichText.Content value={item.label} />
                                </th>
                                <td className="project-cost__share">{`${Math.round(sums.share(item))}%`}</td>
                                <td className="project-cost__amount">{pounds(item.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <dl className="project-cost__summary">
                    <div>
                        <RichText.Content tagName="dt" value={fixedLabel} />
                        <dd>{pounds(sums.fixed)}</dd>
                    </div>
                    {sums.changes > 0 && (
                        <div>
                            <RichText.Content tagName="dt" value={changesLabel} />
                            <dd>{`+${pounds(sums.changes)}`}</dd>
                        </div>
                    )}
                    <div className="is-final">
                        <RichText.Content tagName="dt" value={finalLabel} />
                        <dd>{pounds(sums.final)}</dd>
                    </div>
                </dl>

                {footnote && <RichText.Content tagName="p" className="project-cost__footnote" value={footnote} />}
            </div>
        </section>
    );
}
