/**
 * Chapter — antetítulo de sección «Why we started» (o «02 — The brief» con número): texto en tono suave tras un sillar de corten (mixin t-chapter).
 *
 * Mismo markup que la clase .chapter (elements/_text-styles.scss):
 *   <p class="chapter" data-reveal="fade">
 *     <span class="chapter__num">02</span><span aria-hidden="true"> — </span><span>The Ashlar standard</span>
 *   </p>
 *
 * `edit` muestra los dos textos editables en línea; sin él, el markup guardado.
 * Si el número está vacío, solo se pinta el texto (sin raya).
 */

import { __ } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';

export default function Chapter({ num, label, className, edit = false, onChange }) {
    const classes = ['chapter', className].filter(Boolean).join(' ');

    if (edit) {
        return (
            <p className={classes}>
                <RichText
                    tagName="span"
                    className="chapter__num"
                    value={num}
                    onChange={(value) => onChange({ num: value })}
                    allowedFormats={[]}
                    placeholder="01"
                    aria-label={__('Section number', 'ashlar')}
                />
                <span aria-hidden="true"> — </span>
                <RichText
                    tagName="span"
                    value={label}
                    onChange={(value) => onChange({ label: value })}
                    allowedFormats={[]}
                    placeholder={__('Section', 'ashlar')}
                    aria-label={__('Section name', 'ashlar')}
                />
            </p>
        );
    }

    return (
        <p className={classes} data-reveal="fade">
            {num && (
                <>
                    <RichText.Content tagName="span" className="chapter__num" value={num} />
                    <span aria-hidden="true"> — </span>
                </>
            )}
            <RichText.Content tagName="span" value={label} />
        </p>
    );
}
