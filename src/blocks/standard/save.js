import { useBlockProps, RichText } from '@wordpress/block-editor';
import Chapter from '../../components/chapter';
import { themeClass } from '../../components/section-theme';

/**
 * Save de la tabla de compromisos.
 *
 * Es una tabla de verdad (<table>): cada fila tiene sus cuatro datos con su
 * cabecera, y los lectores de pantalla la recorren como tal. En móvil cada
 * fila se apila como una ficha; el nombre de cada dato se repite con
 * data-label (lo pinta el CSS) para que no se pierda el contexto.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, chapterNum, chapterLabel, title, lede, headClause, headCommitment, headDetail, headMeasure, rows, footnote } = attributes;

    return (
        <section {...useBlockProps.save({ className: ['standard', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
            <div className="standard__inner wrap">
                <header className="standard__head">
                    <div className="standard__heading">
                        <Chapter num={chapterNum} label={chapterLabel} />
                        <RichText.Content tagName="h2" className="standard__title" value={title} data-split="" />
                    </div>
                    {lede && <RichText.Content tagName="p" className="standard__lede" value={lede} data-reveal="" />}
                </header>

                <table className="standard__table">
                    <thead>
                        <tr>
                            <RichText.Content tagName="th" scope="col" className="standard__col standard__col--clause" value={headClause} />
                            <RichText.Content tagName="th" scope="col" className="standard__col standard__col--commitment" value={headCommitment} />
                            <RichText.Content tagName="th" scope="col" className="standard__col standard__col--detail" value={headDetail} />
                            <RichText.Content tagName="th" scope="col" className="standard__col standard__col--measure" value={headMeasure} />
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr className="standard__row" key={index} data-reveal="">
                                <RichText.Content tagName="td" className="standard__clause" value={row.clause} />
                                <RichText.Content tagName="th" scope="row" className="standard__commitment" value={row.commitment} />
                                <RichText.Content tagName="td" className="standard__detail" value={row.detail} data-label={headDetail} />
                                <RichText.Content tagName="td" className="standard__measure" value={row.measure} data-label={headMeasure} />
                            </tr>
                        ))}
                    </tbody>
                </table>

                {footnote && <RichText.Content tagName="p" className="standard__footnote" value={footnote} data-reveal="" />}
            </div>
        </section>
    );
}
