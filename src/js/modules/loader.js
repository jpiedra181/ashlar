/**
 * Loader de la primera visita: «Marca en obra».
 *
 * Los tres sillares del logotipo se colocan uno a uno (el de corten, el
 * último) mientras corren el contador y la línea de progreso; sale el nombre,
 * espera a las fuentes y a la foto principal (con tope) y sube el telón.
 *
 * Lo decide el script de <head> (inc/front.php): html.is-loading solo en la
 * primera página de la sesión y con movimiento. Mientras dura, la intro CSS
 * está en pausa (layout/_loader.scss) y los comportamientos de página esperan:
 * `reveal` (mountAll) se llama al empezar a subir el telón, para que lo que
 * está sobre el pliegue entre a la vista y no debajo del loader.
 */

import { gsap } from '../lib/gsap';
import { MOTION } from '../lib/motion';

const MAX_WAIT = 3000; // ms esperando a fuentes y foto, como mucho
const FAILSAFE = 7000; // ms: pase lo que pase, la página se ve
const SLOW_START = 1200; // ms desde la navegación: más tarde, sin telón

/** Fuentes cargadas y foto principal (la del hero, con fetchpriority) decodificada. */
function pageReady() {
    const photo = document.querySelector('img[fetchpriority="high"]');
    return Promise.race([
        Promise.all([
            document.fonts?.ready,
            photo?.decode?.().catch(() => {}),
        ]),
        new Promise((resolve) => setTimeout(resolve, MAX_WAIT)),
    ]);
}

/**
 * Arranca el loader si toca; si no, llama a `reveal` en el acto.
 *
 * @param {Function} reveal Lo que debe empezar al subir el telón (mountAll).
 */
export function runLoader(reveal) {
    const root = document.documentElement;
    const loader = document.querySelector('[data-loader]');
    let revealed = false;

    const start = () => {
        if (revealed) return;
        revealed = true;
        root.classList.remove('is-loading');
        reveal();
    };

    const done = () => {
        clearTimeout(failsafe);
        start();
        loader?.remove();
    };

    const failsafe = setTimeout(done, FAILSAFE);

    // Si la página ya ha tardado en arrancar (red o CPU lentas) o hay «ahorro
    // de datos», el telón añadiría ~2,4 s más de espera: se salta.
    const slow = performance.now() > SLOW_START || navigator.connection?.saveData;

    if (!loader || !root.classList.contains('is-loading') || slow) {
        done();
        return;
    }

    try {
        const q = gsap.utils.selector(loader);
        const [status] = q('[data-loader-status]');
        const [count] = q('[data-loader-count]');
        const [fill] = q('[data-loader-fill]');
        const blocks = q('.loader__block');
        const steps = JSON.parse(loader.dataset.loaderSteps || '[]');

        const progress = { value: 0 };
        const renderCount = () => {
            count.textContent = String(Math.round(progress.value)).padStart(3, '0');
        };
        const setStatus = (index) => {
            if (steps[index]) status.textContent = steps[index];
        };

        // Obra: los dos sillares de arriba bajan y asientan, como con grúa; el
        // de corten, el último, entra de lado hasta su lecho (si bajara,
        // atravesaría la hilada de arriba). Valores en unidades del viewBox.
        const build = gsap.timeline({ defaults: { ease: 'power4.out', duration: 0.7 } });
        const accent = blocks.length - 1;

        blocks.forEach((block, i) => {
            const at = 0.1 + i * 0.28;
            const from = i === accent ? { opacity: 0, x: -6 } : { opacity: 0, y: -5 };
            build.call(setStatus, [i + 1], at).fromTo(block, from, { opacity: 1, x: 0, y: 0 }, at);
        });

        // El contador se queda en 86 hasta que la página está lista
        build
            .to(progress, { value: 86, duration: 1.2, ease: 'power1.inOut', onUpdate: renderCount }, 0.05)
            .to(fill, { scaleX: 0.86, duration: 1.2, ease: 'power1.inOut' }, 0.05)
            .fromTo(q('.loader__word'), { y: 0, yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: MOTION.ease }, 0.95);

        Promise.all([build.then(), pageReady()]).then(() => {
            gsap.timeline({ onComplete: done })
                .call(setStatus, [steps.length - 1])
                .to(progress, { value: 100, duration: 0.35, ease: 'power2.out', onUpdate: renderCount })
                .to(fill, { scaleX: 1, duration: 0.35, ease: 'power2.out' }, '<')
                // Telón: el panel sube y su contenido va más despacio (profundidad)
                .addLabel('lift', '+=0.1')
                .call(() => loader.classList.add('loader--leaving'), null, 'lift')
                .to(loader, { yPercent: -100, duration: 1.1, ease: MOTION.wipeEase }, 'lift')
                .to(q('.loader__inner'), { yPercent: 35, duration: 1.1, ease: MOTION.wipeEase }, 'lift')
                // Con expo.inOut el telón apenas se ha movido aquí: la intro y los
                // reveal arrancan justo cuando empieza a descubrir la página.
                .call(start, null, 'lift+=0.25');
        });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        done();
    }
}
