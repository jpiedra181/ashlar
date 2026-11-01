/**
 * Iconos de Ashlar para los bloques en React.
 * Mismo trazo que ashlar_arrow() en inc/helpers.php.
 */

const PATHS = {
    right: 'M4 12H19M13 18L19 12L13 6',
    'up-right': 'M7 17L17 7M17 15V7H9',
};
const ROTATION = { right: 0, left: 180, down: 90, up: -90, 'up-right': 0 };

/**
 * Flecha del Figma (Icon/Arrow right · Icon/Arrow up-right): trazo 1.5, puntas rectas.
 *
 * @param {Object} props
 * @param {string} [props.direction] right | left | up | down | up-right.
 * @param {string} [props.className] Clase del <svg>.
 */
export function Arrow({ direction = 'right', className }) {
    const rotation = ROTATION[direction] ?? 0;
    const d = PATHS[direction === 'up-right' ? 'up-right' : 'right'];

    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
            aria-hidden="true"
            focusable="false"
            style={rotation ? { rotate: `${rotation}deg` } : undefined}
        >
            <path d={d} />
        </svg>
    );
}

/**
 * Iconos de interfaz para controles que viven DENTRO del lienzo del editor.
 * El iframe del lienzo no carga la fuente Dashicons, así que los botones de
 * los bloques (mover, quitar, añadir, elegir foto) usan estos SVG.
 */
const ui = (path) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const IconUp = ui('M6 14l6-6 6 6');
export const IconDown = ui('M6 10l6 6 6-6');
export const IconTrash = ui('M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10.5 10.5v5M13.5 10.5v5');
export const IconPlus = ui('M12 5v14M5 12h14');
export const IconImage = ui('M4 6h16v12H4zM4 15l4.5-4.5 4 4 2.5-2.5L20 17M15.5 9.5h.01');
