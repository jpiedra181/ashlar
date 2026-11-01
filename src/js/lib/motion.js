/**
 * Preferencia de movimiento y tiempos comunes.
 *
 * Hay movimiento salvo que lo apague el sistema (prefers-reduced-motion) o el
 * interruptor «Animaciones» del pie, que se recuerda en localStorage. El script
 * en línea de <head> (inc/front.php) aplica la preferencia ANTES del primer
 * pintado para que los estados iniciales de las animaciones nunca parpadeen.
 */

const STORAGE_KEY = 'ashlar-motion';
const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Tiempos comunes de las animaciones de scroll: la misma línea de disparo, las
 * mismas duraciones y el mismo escalonado en toda la web. Los usa
 * animations.js y los view.js los leen de `@ashlar/app` (`motion`). Qué
 * animación lleva cada elemento está en la cabecera de animations.js.
 */
export const MOTION = Object.freeze({
    start: 'top 88%', // todo entra cuando su borde superior cruza esta línea
    duration: 1.4, // aparecer y subir, titulares línea a línea
    wipe: 1.6, // cortinilla de las fotos y filetes que se dibujan
    stagger: 0.1, // escalera entre lo que entra a la vez
    ease: 'expo.out', // = --ease-out
    wipeEase: 'expo.inOut', // = --ease-in-out
    scrub: 0.6, // suavizado de lo que va pegado al scroll
    parallax: Object.freeze({ framed: 0.1, bleed: 0.15 }),
    wordsFrom: 0.2, // opacidad deseada de las palabras sin encender de [data-words]; animations.js la sube hasta 4,5:1
});

/** True cuando ni el sistema ni el interruptor de la web piden menos movimiento. */
export function motionAllowed() {
    return !reducedQuery.matches && document.documentElement.dataset.motion !== 'off';
}

export function setMotion(enabled) {
    try {
        localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
    } catch {
        // Sin almacenamiento: la preferencia dura lo que dure esta página.
    }
    const root = document.documentElement;
    if (enabled) delete root.dataset.motion;
    else root.dataset.motion = 'off';
    root.classList.toggle('motion', enabled && !reducedQuery.matches);
}

export function onReducedMotionChange(callback) {
    reducedQuery.addEventListener('change', callback);
}
