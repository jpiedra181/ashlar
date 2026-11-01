import { useBlockProps, RichText } from '@wordpress/block-editor';
import Chapter from '../../components/chapter';
import { themeClass } from '../../components/section-theme';
import ReportDoc from './report-doc';

/**
 * Save del parte del viernes: a la izquierda (fija al hacer scroll en
 * escritorio) el capítulo, el titular, la entradilla y la nota de la
 * cláusula; a la derecha, el parte tal cual lo recibió el cliente.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, chapterNum, chapterLabel, title, lede, note } = attributes;

    return (
        <section {...useBlockProps.save({ className: ['friday-report', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
            <div className="friday-report__inner wrap">
                <header className="friday-report__head">
                    <Chapter num={chapterNum} label={chapterLabel} />
                    <RichText.Content tagName="h2" className="friday-report__title" value={title} data-split="" />
                    {lede && <RichText.Content tagName="p" className="friday-report__lede" value={lede} data-reveal="" />}
                    {note && <RichText.Content tagName="p" className="friday-report__note" value={note} data-reveal="" />}
                </header>
                <ReportDoc attributes={attributes} />
            </div>
        </section>
    );
}
