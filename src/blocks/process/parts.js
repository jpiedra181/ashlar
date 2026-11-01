/**
 * Piezas del bloque Proceso compartidas por edit.js y save.js.
 */

export const stepTag = (format, index, total) => (format || 'Step {n} of {total}').replace('{n}', index + 1).replace('{total}', total);

/** Marcador del paso: número o ✓ (los pasos ya hechos los marca el CSS). */
export function Marker({ index }) {
    return (
        <span className="pstep-marker" aria-hidden="true">
            <span className="pstep-marker__n">{index + 1}</span>
            <svg className="pstep-marker__check" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" focusable="false">
                <path d="M3.5 8.5l3 3 6-7" />
            </svg>
        </span>
    );
}
