/**
 * Scroll suave (Lenis), sincronizado con el ticker de GSAP para que
 * ScrollTrigger y el scroll vayan en el mismo fotograma, y ScrollTrigger
 * recalculado cuando la página cambia de alto.
 */

import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';
import { onPage } from './lifecycle';
import { motionAllowed } from './motion';

let lenis = null;

export const getLenis = () => lenis;

/** Pausa el scroll de la página (menús, diálogos) con o sin Lenis. */
export function lockScroll(locked) {
    if (lenis) {
        if (locked) lenis.stop();
        else lenis.start();
    }
    document.documentElement.style.overflow = locked ? 'hidden' : '';
}

/** Desplaza suavemente hasta un elemento o una posición, con caída al nativo. */
export function scrollToTarget(target, offset = 0) {
    if (lenis) {
        lenis.scrollTo(target, { offset, duration: 1.4 });
        return;
    }
    const top =
        typeof target === 'number'
            ? target
            : target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: motionAllowed() ? 'smooth' : 'auto' });
}

const raf = (time) => lenis?.raf(time * 1000);

onPage(() => {
    if (!motionAllowed()) return;

    lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        anchors: { offset: -80 },
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
        gsap.ticker.remove(raf);
        lenis?.destroy();
        lenis = null;
        document.documentElement.style.overflow = '';
    };
});

// Lenis ajusta su límite solo cuando la página cambia de alto; ScrollTrigger
// solo se recalcula al cargar y al redimensionar la ventana. Si después el
// contenido encoge o crece (el formulario de Contact al enviarse, preguntas
// del FAQ, acordeones), sus inicios y finales quedan desfasados: el parallax
// del pie no llegaba a asentarse y lo dejaba cortado. Se recalcula al cambiar
// el alto del body, con un respiro para no hacerlo en cada fotograma de una
// transición. Los cambios de ancho los cubre ya el propio ScrollTrigger.
onPage(() => {
    let width = window.innerWidth;
    let height = document.body.offsetHeight;
    let timer = 0;

    const observer = new window.ResizeObserver(() => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
            if (window.innerWidth === width && document.body.offsetHeight !== height) ScrollTrigger.refresh();
            width = window.innerWidth;
            height = document.body.offsetHeight;
        }, 150);
    });
    observer.observe(document.body);

    return () => {
        window.clearTimeout(timer);
        observer.disconnect();
    };
});
