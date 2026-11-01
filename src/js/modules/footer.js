/**
 * Pie: parallax de entrada, el muro que se levanta y sus herramientas (el
 * interruptor «Animaciones» y «Volver arriba», del bloque ashlar/footer-bottom).
 * Markup: template parts `footer` / `footer-short`; estilos en
 * src/scss/layout/_footer.scss.
 */

import { gsap } from '../lib/gsap';
import { onPage, remountAll } from '../lib/lifecycle';
import { motionAllowed, setMotion, MOTION } from '../lib/motion';
import { scrollToTarget } from '../lib/smooth-scroll';

// Parallax: el pie sale de debajo de la página. Su contenido llega un 25 % más
// arriba y en sombra, y se asienta cuando el pie toca el borde superior o se
// acaba el scroll (clamp: con un pie más bajo que la pantalla, también llega).
onPage(() => {
    if (!motionAllowed()) return;

    const footer = document.querySelector('.site-footer');
    const inner = footer?.querySelector('.site-footer__inner');
    if (!inner) return;

    const ctx = gsap.context(() => {
        gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: footer, start: 'clamp(top bottom)', end: 'clamp(top top)', scrub: true },
        })
            .from(inner, { yPercent: -25 })
            .from(footer, { '--footer-shade': 0.5 }, '<');
    });

    return () => ctx.revert();
});

// Muro: al entrar en pantalla, los sillares se colocan de abajo arriba,
// hilada a hilada; el de corten, el último, como en el loader. Se vigila con
// IntersectionObserver porque el muro viaja dentro del pie desplazado por el
// parallax.
onPage(() => {
    const wall = document.querySelector('[data-footer-wall]');
    if (!wall || !motionAllowed()) return;

    const accent = wall.querySelector('.footer-wall__stone--accent');
    const stones = [...wall.children]
        .reverse()
        .flatMap((course) => [...course.children])
        .filter((stone) => stone !== accent);
    let observer;

    const ctx = gsap.context(() => {
        const build = gsap.timeline({
            paused: true,
            defaults: { yPercent: -60, opacity: 0, duration: 0.9, ease: MOTION.ease },
        });
        build.from(stones, { stagger: 0.035 });
        if (accent) build.from(accent, { duration: 1.2 }, '-=0.4');

        observer = new window.IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                build.play();
                observer.disconnect();
            },
            { threshold: 0.4 }
        );
        observer.observe(wall);
    });

    return () => {
        observer?.disconnect();
        ctx.revert();
    };
});

onPage((signal) => {
    const toggle = document.querySelector('[data-motion-toggle]');
    const backToTop = document.querySelector('[data-back-to-top]');

    if (toggle) {
        toggle.setAttribute('aria-pressed', String(motionAllowed()));
        toggle.addEventListener(
            'click',
            () => {
                setMotion(!motionAllowed());
                // Desmonta y vuelve a montar todo con la nueva preferencia
                // (incluidos los view.js de los bloques).
                remountAll();
            },
            { signal }
        );
    }

    backToTop?.addEventListener(
        'click',
        (event) => {
            event.preventDefault();
            scrollToTarget(0);
            document.querySelector('main')?.focus({ preventScroll: true });
        },
        { signal }
    );
});
