import { useBlockProps, RichText } from '@wordpress/block-editor';
import Button from '../../components/button';
import Chapter from '../../components/chapter';
import { Arrow } from '../../components/icons';
import { themeClass } from '../../components/section-theme';

/**
 * Save de «Selected work» (bloque híbrido).
 *
 * Se guarda lo que escribe el cliente: cabecera, controles y la tarjeta
 * final. El hueco <div data-projects-slot> va vacío: render.php lo llena con
 * los proyectos destacados al pintar la página, así que un proyecto nuevo
 * aparece solo, sin tocar la portada.
 *
 * La pista es un scroll horizontal nativo (región enfocable: se recorre con
 * las flechas del teclado, el trackpad o el dedo). view.js añade los botones,
 * la barra de progreso, el contador y arrastrar con el ratón.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, chapterNum, chapterLabel, title, hint, prevLabel, nextLabel, trackLabel, endEyebrow, endCount, endText, endLabel, endUrl } = attributes;

    return (
        <section {...useBlockProps.save({ className: ['carousel', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
            <header className="carousel__head wrap">
                <div className="carousel__heading">
                    <Chapter num={chapterNum} label={chapterLabel} />
                    <RichText.Content tagName="h2" className="carousel__title" value={title} data-split="" />
                </div>
                <div className="carousel__controls" data-reveal="">
                    {hint && <RichText.Content tagName="p" className="carousel__hint" value={hint} />}
                    <button type="button" className="carousel__btn" data-carousel-prev="" aria-label={prevLabel} disabled="">
                        <Arrow direction="left" />
                    </button>
                    <button type="button" className="carousel__btn" data-carousel-next="" aria-label={nextLabel}>
                        <Arrow />
                    </button>
                </div>
            </header>

            <div className="carousel__track" data-carousel-track="" role="region" aria-label={trackLabel} tabIndex="0">
                <div className="carousel__slot" data-projects-slot="" />
                <div className="carousel__end theme-dark">
                    <div className="carousel__end-text">
                        <RichText.Content tagName="p" className="carousel__end-eyebrow" value={endEyebrow} />
                        <RichText.Content tagName="p" className="carousel__end-count" value={endCount} />
                        <RichText.Content tagName="p" className="carousel__end-desc" value={endText} />
                    </div>
                    {endLabel && (
                        <Button url={endUrl} className="carousel__end-btn">
                            <RichText.Content value={endLabel} />
                        </Button>
                    )}
                </div>
            </div>

            <div className="carousel__progress wrap" aria-hidden="true">
                <span className="carousel__bar">
                    <span className="carousel__thumb" data-carousel-thumb="" />
                </span>
                <span className="carousel__counter" data-carousel-counter="" />
            </div>
        </section>
    );
}
