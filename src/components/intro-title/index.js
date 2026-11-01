/**
 * IntroTitle — titular sobre el pliegue que entra línea a línea.
 *
 * Cada salto de línea del editor (Mayús + Intro, <br>) es una línea que sube
 * desde su máscara (.intro-mask / .intro-line, elements/_motion.scss). CSS
 * puro: arranca en el primer pintado sin esperar al JavaScript.
 *
 *   <h1 class="t-display"><span class="intro-mask"><span class="intro-line" style="--i:0">…</span></span> …</h1>
 */

import { Fragment } from '@wordpress/element';
import { RichText } from '@wordpress/block-editor';

/**
 * Líneas de un titular en HTML.
 *
 * @param {string} title HTML del titular.
 * @return {string[]} Líneas.
 */
export function titleLines(title = '') {
    return title
        .split(/<br\s*\/?>/i)
        .map((line) => line.trim())
        .filter(Boolean);
}

/**
 * @param {Object} props
 * @param {string} props.value     HTML del titular.
 * @param {string} [props.tagName] Etiqueta (h1 por defecto).
 * @param {string} [props.className]
 * @param {number} [props.start]   Índice de la primera línea (retardo en escalera).
 */
export default function IntroTitle({ value, tagName: Tag = 'h1', className, start = 0 }) {
    return (
        <Tag className={className}>
            {titleLines(value).map((line, index) => (
                <Fragment key={index}>
                    {index > 0 && ' '}
                    <span className="intro-mask">
                        <RichText.Content tagName="span" className="intro-line" value={line} style={{ '--i': start + index }} />
                    </span>
                </Fragment>
            ))}
        </Tag>
    );
}
