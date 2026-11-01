import { RichText } from '@wordpress/block-editor';
import Media from '../../components/media';

/**
 * Rótulo de la etiqueta partido en dos: «Before» y « · March 2025». En móvil
 * solo se ve la primera parte (no caben las dos etiquetas enteras).
 */
function TagLabel({ value = '' }) {
    const at = value.indexOf(' · ');
    if (at < 0) return <RichText.Content value={value} />;

    return (
        <>
            <RichText.Content tagName="span" className="compare__tag-main" value={value.slice(0, at)} />
            <RichText.Content tagName="span" className="compare__tag-more" value={value.slice(at)} />
        </>
    );
}

/**
 * El comparador: la foto «después» debajo y la «antes» encima, recortada por
 * la variable --pos (lo que queda a la izquierda del tirador es el antes).
 *
 *   <div class="compare" data-compare style="--pos: 50%">
 *     after · before · línea · tirador · etiquetas (botones) · range · pista
 *   </div>
 *
 * El control real es un <input type="range"> transparente que cubre la foto:
 * arrastrar, pulsar, flechas del teclado y lectores de pantalla funcionan de
 * serie. view.js solo traduce su valor a --pos y conecta las etiquetas.
 * Sin JavaScript se ven las dos mitades, al 50 %.
 *
 * @param {Object}  props
 * @param {boolean} [props.edit] En el editor las etiquetas y la pista se escriben encima.
 */
export default function Compare({ attributes, edit = false, onChange, beforeSlot, afterSlot }) {
    const { before, after, beforeLabel, afterLabel, hint, sliderLabel } = attributes;
    const text = (key, className, placeholder) =>
        edit ? (
            <RichText tagName="span" className={className} value={attributes[key]} onChange={(value) => onChange({ [key]: value })} allowedFormats={[]} placeholder={placeholder} />
        ) : (
            <RichText.Content tagName="span" className={className} value={attributes[key]} />
        );

    return (
        <div className="compare" data-compare="" style={{ '--pos': '50%' }}>
            <Media image={after} className="compare__after" sizes="(min-width: 1440px) 1280px, 100vw">
                {afterSlot}
            </Media>
            <Media image={before} className="compare__before" sizes="(min-width: 1440px) 1280px, 100vw">
                {beforeSlot}
            </Media>
            <span className="compare__line" aria-hidden="true" />
            <span className="compare__handle" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" focusable="false">
                    <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />
                </svg>
            </span>
            {edit ? (
                <>
                    <span className="compare__tag compare__tag--before">{text('beforeLabel', '', 'Before')}</span>
                    <span className="compare__tag compare__tag--after">{text('afterLabel', '', 'After')}</span>
                </>
            ) : (
                <>
                    <button type="button" className="compare__tag compare__tag--before" data-compare-to="100">
                        <TagLabel value={beforeLabel} />
                    </button>
                    <button type="button" className="compare__tag compare__tag--after" data-compare-to="0">
                        <TagLabel value={afterLabel} />
                    </button>
                    <input className="compare__range" type="range" min="0" max="100" step="1" value="50" aria-label={sliderLabel} />
                </>
            )}
            {(edit || hint) && <span className="compare__hint">{text('hint', '', 'Drag or tap to compare')}</span>}
        </div>
    );
}
