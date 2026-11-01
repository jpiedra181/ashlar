import { useBlockProps, RichText } from '@wordpress/block-editor';
import Button from '../../components/button';
import { themeClass } from '../../components/section-theme';

/**
 * Save de la guía de precios (Services: «What things really cost.»).
 *
 * Los datos son una tabla de verdad: tipo de obra (cabecera de fila), medida,
 * plazo y precio. La fila de cabeceras de columna está oculta a la vista pero
 * la leen los lectores de pantalla. En móvil cada fila se reordena con CSS:
 * obra y precio arriba, medida · plazo debajo.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, eyebrow, title, lede, workLabel, sizeLabel, timeLabel, priceLabel, rows, note, buttonLabel, buttonUrl } = attributes;

    return (
        <section {...useBlockProps.save({ className: ['cost-guide', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
            <div className="cost-guide__inner wrap">
                <header className="cost-guide__head">
                    <div className="cost-guide__heading">
                        {eyebrow && <RichText.Content tagName="p" className="cost-guide__eyebrow" value={eyebrow} data-reveal="" />}
                        <RichText.Content tagName="h2" className="cost-guide__title" value={title} data-split="" />
                    </div>
                    {lede && <RichText.Content tagName="p" className="cost-guide__lede" value={lede} data-reveal="" />}
                </header>

                <table className="cost-guide__table" role="table" data-reveal="">
                    <thead className="visually-hidden" role="rowgroup">
                        <tr role="row">
                            <th scope="col" role="columnheader">{workLabel}</th>
                            <th scope="col" role="columnheader">{sizeLabel}</th>
                            <th scope="col" role="columnheader">{timeLabel}</th>
                            <th scope="col" role="columnheader">{priceLabel}</th>
                        </tr>
                    </thead>
                    <tbody role="rowgroup">
                        {rows.map((row, index) => (
                            <tr className="cost-guide__row" role="row" key={index}>
                                <RichText.Content tagName="th" scope="row" role="rowheader" className="cost-guide__work" value={row.work} />
                                <RichText.Content tagName="td" role="cell" className="cost-guide__size" value={row.size} />
                                <RichText.Content tagName="td" role="cell" className="cost-guide__time" value={row.time} />
                                <RichText.Content tagName="td" role="cell" className="cost-guide__price" value={row.price} />
                            </tr>
                        ))}
                    </tbody>
                </table>

                {(note || buttonLabel) && (
                    <div className="cost-guide__foot" data-reveal="">
                        {note && <RichText.Content tagName="p" className="cost-guide__note" value={note} />}
                        {buttonLabel && (
                            <Button url={buttonUrl} className="cost-guide__button">
                                <RichText.Content value={buttonLabel} />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
