/**
 * Ciclo de vida de los comportamientos de página.
 *
 * Cada módulo registra un `setup(signal)` con `onPage()` y puede devolver una
 * función de limpieza. Todos se montan cuando el DOM está listo y se pueden
 * desmontar y volver a montar en bloque: es lo que hace el interruptor
 * «Animaciones» del pie para activar o desactivar el movimiento sin recargar.
 *
 * El `AbortSignal` que recibe cada setup se aborta al desmontar, así que los
 * listeners registrados con `{ signal }` se limpian solos.
 *
 * Los view.js de los bloques usan la misma API a través de `@ashlar/app`
 * (window.ashlar), de modo que también se remontan con el interruptor.
 */

const registry = new Set();
const active = new Map();
let isMounted = false;

function mount(setup) {
    const controller = new AbortController();
    try {
        active.set(setup, { controller, teardown: setup(controller.signal) });
    } catch (error) {
        // Un módulo roto no debe tumbar al resto.
        // eslint-disable-next-line no-console
        console.error(error);
    }
}

function unmount(setup) {
    const entry = active.get(setup);
    if (!entry) return;
    entry.controller.abort();
    try {
        entry.teardown?.();
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
    }
    active.delete(setup);
}

/**
 * Registra un comportamiento de página.
 *
 * @param {(signal: AbortSignal) => (void|Function)} setup Devuelve, si hace falta, su limpieza.
 */
export function onPage(setup) {
    registry.add(setup);
    if (isMounted) mount(setup);
}

export function mountAll() {
    if (isMounted) return;
    isMounted = true;
    registry.forEach(mount);
}

export function unmountAll() {
    if (!isMounted) return;
    isMounted = false;
    [...registry].reverse().forEach(unmount);
}

export function remountAll() {
    unmountAll();
    mountAll();
}
