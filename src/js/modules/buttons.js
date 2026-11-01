/**
 * Relleno direccional de los botones (.btn): Osmo «Directional Button Hover».
 *
 * Al entrar o salir el ratón, coloca el círculo de relleno (::before, ver
 * components/button/style.scss) en ese punto y lo agranda cuanto más lejos
 * del centro esté, para que siempre cubra el botón entero. La animación es la
 * transición CSS; aquí solo se calculan --btn-x, --btn-y y --btn-size, con la
 * misma fórmula que el recurso original.
 *
 * Delegado en document (pointerover/pointerout hacen de mouseenter/leave):
 * vale para los botones de los bloques, los de PHP (cabecera, pie, «Load
 * more») y los que se añadan después, sin tocar su markup.
 */

import { onPage } from '../lib/lifecycle';

function place(button, event) {
    const rect = button.getBoundingClientRect();

    // Desplazamiento desde la esquina superior izquierda, en %
    const offsetXFromLeft = ((event.clientX - rect.left) / rect.width) * 100;
    const offsetYFromTop = ((event.clientY - rect.top) / rect.height) * 100;

    // Distancia horizontal al centro, en % (0 en el centro, 50 en un borde)
    const centerX = rect.left + rect.width / 2;
    const offsetXFromCenter = Math.abs(((event.clientX - centerX) / (rect.width / 2)) * 50);

    button.style.setProperty('--btn-x', `${offsetXFromLeft.toFixed(1)}%`);
    button.style.setProperty('--btn-y', `${offsetYFromTop.toFixed(1)}%`);
    button.style.setProperty('--btn-size', `${(115 + offsetXFromCenter * 2).toFixed(1)}%`);
}

function handlePointer(event) {
    // Solo ratón: en táctil no hay hover (y el CSS lo limita a hover: hover)
    if (event.pointerType && event.pointerType !== 'mouse') return;

    const button = event.target.closest?.('.btn');

    // Movimiento entre el rótulo y la flecha: sigue dentro del mismo botón
    if (!button || button.contains(event.relatedTarget)) return;

    place(button, event);
}

// Con el teclado no hay punto de entrada: el relleno crece desde el centro
// (los valores por defecto del CSS), no desde donde salió el ratón la última vez.
function handleFocus(event) {
    const button = event.target.closest?.('.btn');
    if (!button?.matches(':focus-visible')) return;

    ['--btn-x', '--btn-y', '--btn-size'].forEach((name) => button.style.removeProperty(name));
}

onPage((signal) => {
    document.addEventListener('pointerover', handlePointer, { signal });
    document.addEventListener('pointerout', handlePointer, { signal });
    document.addEventListener('focusin', handleFocus, { signal });
});
