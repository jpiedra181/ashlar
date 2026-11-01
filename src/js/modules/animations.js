/**
 * Animaciones de scroll declarativas, por atributos data-*. Los bloques solo
 * ponen el atributo en su markup; los tiempos son los de MOTION (lib/motion.js).
 *
 * Criterio: cada elemento se anima según su PAPEL, no según el bloque en el
 * que está, para que la web se mueva igual de principio a fin.
 *
 *  Papel                               Atributo              Efecto
 *  Capítulo «01 / …»                   data-reveal="fade"    aparece (lo pone <Chapter>)
 *  Titular que abre una sección o un   data-split            entra línea a línea tras
 *    tramo a todo el ancho                                   una máscara
 *  Frase para leer (t-lead)            data-words            las palabras se encienden
 *                                                            con el scroll
 *  Texto, botones, pies, filtros       data-reveal           aparece y sube
 *  Ítem de una lista (fila, tarjeta,   data-reveal           en el ítem entero, en
 *    paso, pregunta, cifra)                                  escalera; si lleva foto,
 *                                                            solo en su texto
 *  Foto enmarcada                      data-media-reveal     se descubre desde abajo
 *                                      + data-parallax 0.1   y se desplaza un poco
 *  Foto a sangre (banda, fondo)        data-parallax 0.15    solo se desplaza
 *  Filete                              data-draw             se dibuja desde la izquierda
 *  Firma gigante del pie               data-rise             sus palabras suben desde la
 *                                                            línea base, en escalera
 *  Hero (sobre el pliegue)             CSS (_motion.scss)    entra al cargar, sin esperar
 *                                      data-hero-bg/content  al JS; al salir, la foto va
 *                                                            más despacio y el texto se aleja
 *
 *  [data-delay]  retardo opcional (s) para los reveal.
 */

import { gsap, ScrollTrigger, SplitText } from '../lib/gsap';
import { onPage } from '../lib/lifecycle';
import { motionAllowed, MOTION } from '../lib/motion';

const fontsReady = () =>
    Promise.race([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise((resolve) => setTimeout(resolve, 1200)),
    ]);

// Dos intensidades de parallax: cualquier otro valor va a la más cercana.
const parallaxLevel = (frame) => {
    const { framed, bleed } = MOTION.parallax;
    return Number(frame.dataset.parallax) > (framed + bleed) / 2 ? bleed : framed;
};

// Contraste WCAG entre dos colores [r, g, b].
const luminance = (rgb) =>
    rgb
        .map((v) => {
            const c = v / 255;
            return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        })
        .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
};

// Primer fondo opaco por encima del elemento (el de su sección).
const backdrop = (el) => {
    for (let node = el; node; node = node.parentElement) {
        const [r, g, b, a = 1] = gsap.utils.splitColor(getComputedStyle(node).backgroundColor);
        if (a > 0.95) return [r, g, b];
    }
    return [255, 255, 255];
};

// Una palabra parte de su propio color atenuado: se ve el texto que falta por
// leer y la diferencia con lo ya leído salta a la vista. La atenuación se
// detiene donde el texto aún se lee (4,5:1 contra el fondo): una palabra sin
// encender también es texto que alguien está leyendo.
const MIN_CONTRAST = 4.5;
const faded = (color, bg) => {
    const [r, g, b] = gsap.utils.splitColor(color);
    const mix = (alpha) => [r, g, b].map((v, i) => v * alpha + bg[i] * (1 - alpha));
    let alpha = MOTION.wordsFrom;
    while (alpha < 1 && contrast(mix(alpha), bg) < MIN_CONTRAST) alpha += 0.02;
    return `rgba(${r}, ${g}, ${b}, ${Math.min(1, alpha).toFixed(2)})`;
};

onPage(() => {
    if (!motionAllowed()) return;

    const splits = [];
    let disposed = false;

    // Un bloque puede dar una entrada por hecha (.is-in) mientras su lote
    // espera: ScrollTrigger.batch agrupa los onEnter en un delayedCall que
    // matar el ScrollTrigger no cancela. Esos ya no se animan.
    const pending = (batch) => batch.filter((el) => !el.classList.contains('is-in'));
    const mountedAt = performance.now();

    const ctx = gsap.context(() => {
        ScrollTrigger.batch('[data-reveal]', {
            start: MOTION.start,
            once: true,
            onEnter: (entered) => {
                const batch = pending(entered);
                if (!batch.length) return;
                gsap.to(batch, {
                    opacity: 1,
                    y: 0,
                    duration: MOTION.duration,
                    stagger: MOTION.stagger,
                    delay: (_, el) => Number(el.dataset.delay ?? 0),
                    // Al terminar no deja estilos en línea: un transform
                    // residual crearía una capa por elemento (la foto que sigue
                    // al cursor en Servicios quedaría debajo de la fila
                    // siguiente) y anularía los hover de CSS.
                    onComplete: () => {
                        batch.forEach((el) => el.classList.add('is-in'));
                        gsap.set(batch, { clearProps: 'opacity,transform' });
                    },
                });
            },
        });

        ScrollTrigger.batch('[data-draw]', {
            start: MOTION.start,
            once: true,
            onEnter: (batch) =>
                gsap.to(batch, { scaleX: 1, duration: MOTION.wipe, ease: MOTION.wipeEase, stagger: MOTION.stagger }),
        });

        ScrollTrigger.batch('[data-media-reveal]', {
            start: MOTION.start,
            once: true,
            onEnter: (batch) =>
                pending(batch).forEach((frame, i) => {
                    // Ya en pantalla al cargar: se ve sin más (la cortinilla y el
                    // zoom retrasaban el LCP hasta ~2,8 s)
                    if (performance.now() - mountedAt < 400) {
                        gsap.set(frame, { clipPath: 'inset(0% 0% 0% 0%)' });
                        return;
                    }
                    const img = frame.querySelector('img');
                    const delay = i * MOTION.stagger + Number(frame.dataset.delay ?? 0);
                    gsap.fromTo(
                        frame,
                        { clipPath: 'inset(100% 0% 0% 0%)' },
                        { clipPath: 'inset(0% 0% 0% 0%)', duration: MOTION.wipe, ease: MOTION.wipeEase, delay }
                    );
                    if (img) {
                        gsap.from(img, { scale: 1.3, duration: 2.2, ease: MOTION.ease, delay: delay + 0.1 });
                    }
                }),
        });

        // El recorte solo deja fuera lo que está bajo la línea base y se quita
        // al terminar, para no cortar descendentes (g, p, y) en reposo.
        gsap.utils.toArray('[data-rise]').forEach((el) => {
            gsap.set(el, { opacity: 1, clipPath: 'inset(-50% -5% 0% -5%)' });
            gsap.from(el.children, {
                yPercent: 125,
                duration: MOTION.duration,
                stagger: MOTION.stagger,
                scrollTrigger: { trigger: el, start: MOTION.start, once: true },
                onComplete: () => gsap.set(el, { clearProps: 'clipPath' }),
            });
        });

        // Heros a sangre (portada, páginas, ficha de proyecto)
        gsap.utils.toArray('[data-hero-bg]').forEach((bg) => {
            const section = bg.closest('section');
            if (!section) return;
            const scrollTrigger = { trigger: section, start: 'top top', end: 'bottom top', scrub: true };
            gsap.to(bg, { yPercent: 16, ease: 'none', scrollTrigger });
            // El texto se aleja, pero no se apaga: mientras se ve, se lee.
            const content = section.querySelector('[data-hero-content]');
            if (content) gsap.to(content, { yPercent: -12, ease: 'none', scrollTrigger });
        });

        gsap.utils.toArray('[data-parallax]').forEach((frame) => {
            const img = frame.querySelector('img');
            if (!img) return;
            const amount = parallaxLevel(frame) * 50;
            gsap.fromTo(
                img,
                { yPercent: -amount },
                {
                    yPercent: amount,
                    ease: 'none',
                    scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
                }
            );
        });
    });

    // El troceado de texto espera a las webfonts para que los saltos de línea
    // sean los definitivos.
    fontsReady().then(() => {
        if (disposed) return;
        ctx.add(() => {
            gsap.utils.toArray('[data-split]').forEach((el) => {
                splits.push(
                    SplitText.create(el, {
                        type: 'lines',
                        mask: 'lines',
                        linesClass: 'split-line',
                        aria: 'none',
                        autoSplit: true,
                        onSplit(self) {
                            gsap.set(el, { opacity: 1 });
                            return gsap.from(self.lines, {
                                yPercent: 115,
                                duration: MOTION.duration,
                                stagger: MOTION.stagger,
                                scrollTrigger: { trigger: el, start: MOTION.start, once: true },
                            });
                        },
                    })
                );
            });

            gsap.utils.toArray('[data-words]').forEach((el) => {
                splits.push(
                    SplitText.create(el, {
                        type: 'words',
                        aria: 'none',
                        autoSplit: true,
                        onSplit(self) {
                            // Cada palabra vuelve a SU color: las cursivas de
                            // un titular van en el de acento.
                            const colors = self.words.map((word) => getComputedStyle(word).color);
                            const bg = backdrop(el);
                            return gsap.fromTo(
                                self.words,
                                { color: (i) => faded(colors[i], bg) },
                                {
                                    color: (i) => colors[i],
                                    ease: 'none',
                                    // Duración corta frente al escalonado: se
                                    // encienden de tres en tres y se ve avanzar
                                    // el frente de lectura. Todo el texto está
                                    // encendido antes de llegar a media pantalla.
                                    duration: 0.3,
                                    stagger: 0.1,
                                    scrollTrigger: { trigger: el, start: MOTION.start, end: 'bottom 50%', scrub: MOTION.scrub },
                                }
                            );
                        },
                    })
                );
            });
        });
        ScrollTrigger.refresh();
    });

    return () => {
        disposed = true;
        ctx.revert();
        splits.forEach((split) => split.revert());
        document.querySelectorAll('[data-reveal].is-in, [data-media-reveal].is-in').forEach((el) => el.classList.remove('is-in'));
    };
});
