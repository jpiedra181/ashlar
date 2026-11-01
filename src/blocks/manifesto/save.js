import { useBlockProps, RichText } from '@wordpress/block-editor';
import Chapter from '../../components/chapter';
import Media from '../../components/media';
import { themeClass } from '../../components/section-theme';

/**
 * Save del Manifiesto: capítulo a la izquierda, frase grande a la derecha
 * (lo que va en cursiva sale en el tono apagado) y la firma, con el retrato
 * pequeño de quien lo escribe (decorativo: su nombre va al lado) o, si no hay
 * retrato, la raya.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, chapterNum, chapterLabel, text, signature, portrait } = attributes;

    return (
        <section {...useBlockProps.save({ className: ['manifesto', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
            <div className="manifesto__inner wrap">
                <Chapter num={chapterNum} label={chapterLabel} />
                <div className="manifesto__body">
                    <RichText.Content tagName="p" className="manifesto__text" value={text} data-split="" />
                    {signature && (
                        <div className="manifesto__signature" data-reveal="">
                            {portrait?.url ? <Media image={{ ...portrait, alt: '' }} className="manifesto__portrait" ratio="1 / 1" sizes="56px" extra={{ 'aria-hidden': 'true' }} /> : <span className="manifesto__rule" aria-hidden="true" />}
                            <RichText.Content tagName="p" className="manifesto__name" value={signature} />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
