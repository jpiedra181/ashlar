/**
 * Script global del tema (handle `ashlar-app`, ver inc/enqueue.php).
 *
 * Monta los comportamientos comunes a todas las páginas y publica la API
 * `window.ashlar`, que los view.js de los bloques importan como `@ashlar/app`:
 *
 *   import { onPage, motionAllowed } from '@ashlar/app';
 *
 * Así un bloque registra su animación en el mismo ciclo de vida (se remonta con
 * el interruptor «Animaciones») y WordPress carga este script antes que el suyo
 * sin que nadie tenga que declarar la dependencia a mano.
 */

import { onPage, mountAll, remountAll } from './lib/lifecycle';
import { motionAllowed, setMotion, MOTION } from './lib/motion';
import { getLenis, lockScroll, scrollToTarget } from './lib/smooth-scroll';
import { ScrollTrigger } from './lib/gsap';

import { runLoader } from './modules/loader';
import './modules/animations';
import './modules/buttons';
import './modules/header';
import './modules/menu';
import './modules/footer';
import './modules/article';

window.ashlar = {
    onPage,
    remountAll,
    motionAllowed,
    setMotion,
    motion: MOTION,
    lockScroll,
    scrollToTarget,
    getLenis,
    refreshScroll: () => ScrollTrigger.refresh(),
};

// Avisa a la red de seguridad de <head> (inc/front.php) de que el JS arrancó:
// si no llega a hacerlo, quita los estados iniciales y todo queda visible.
window.__ashlarReady = true;

// En la primera visita, el loader decide cuándo se montan los comportamientos
// (al subir el telón); en el resto, runLoader monta en el acto.
const start = () => runLoader(mountAll);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
} else {
    start();
}
