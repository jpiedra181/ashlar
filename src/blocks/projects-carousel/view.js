/**
 * Carrusel «Selected work».
 *
 * Dos modos, según pantalla y preferencia (gsap.matchMedia):
 *
 *  - Horizontal scroll (escritorio con ratón y movimiento permitido): la
 *    sección se queda fija en el centro de la pantalla y el scroll vertical
 *    desplaza las tarjetas (1 px de scroll = 1 px de recorrido). Las flechas
 *    y las teclas ← → llevan la página hasta la tarjeta siguiente; al llegar
 *    a una tarjeta con el tabulador, la página se desplaza hasta que se ve.
 *
 *  - Nativo (móvil, táctil, movimiento reducido o interruptor apagado): la
 *    pista es un scroll horizontal con scroll-snap; teclado, trackpad y dedo
 *    ya funcionan. Se añaden las flechas y arrastrar con el ratón.
 *
 * En los dos: barra de progreso, contador «01 / 05» y flechas desactivadas en
 * los extremos. El markup es el mismo (save.js); el modo fijo solo añade la
 * clase .is-pinned (style.scss).
 */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { onPage, motionAllowed, motion, scrollToTarget, getLenis } from '@ashlar/app';

const PINNED_QUERY = '(min-width: 1024px) and (hover: hover)';

onPage((signal) => {
    const cleanups = [];

    document.querySelectorAll('.carousel').forEach((root) => {
        const track = root.querySelector('[data-carousel-track]');
        if (!track) return;

        const prev = root.querySelector('[data-carousel-prev]');
        const next = root.querySelector('[data-carousel-next]');
        const thumb = root.querySelector('[data-carousel-thumb]');
        const counter = root.querySelector('[data-carousel-counter]');
        const items = () => [...track.querySelectorAll('[data-carousel-item], .carousel__end')];
        const pad = (n) => String(n).padStart(2, '0');
        const insetOf = (side) => parseFloat(getComputedStyle(track)[`padding${side}`]) || 0;

        // Modo fijo activo, y su ScrollTrigger (existe un poco después que el modo)
        let isPinned = false;
        let pinned = null;

        // Recorrido total y avance actual, en px, en cualquiera de los dos modos
        const maxOffset = () => {
            if (!isPinned) return track.scrollWidth - track.clientWidth;
            const last = items().at(-1);
            if (!last) return 0;
            // Con la pista sin overflow, scrollWidth no cuenta el padding final:
            // se mide hasta el borde de la última tarjeta.
            const end = last.getBoundingClientRect().right - track.getBoundingClientRect().left;
            return Math.max(0, end + insetOf('Right') - track.clientWidth);
        };
        const offset = () => (isPinned ? -gsap.getProperty(track, 'x') : track.scrollLeft);

        // Desplazamiento que deja una tarjeta en el margen izquierdo de la pista
        const offsetOf = (item) =>
            item.getBoundingClientRect().left - track.getBoundingClientRect().left - insetOf('Left');

        const update = () => {
            const max = maxOffset();
            const current = offset();
            const progress = max > 0 ? current / max : 0;
            const visible = max > 0 ? track.clientWidth / (max + track.clientWidth) : 1;

            if (thumb) {
                thumb.style.width = `${visible * 100}%`;
                thumb.style.transform = `translateX(${((progress * (1 - visible)) / visible) * 100}%)`;
            }

            // Tarjeta «actual»: la primera cuyo borde derecho está dentro de la
            // vista (en el modo fijo la pista está desplazada `current` px)
            const list = items();
            const start = track.getBoundingClientRect().left + (isPinned ? current : 0) + insetOf('Left');
            let index = list.findIndex((item) => item.getBoundingClientRect().right > start + 24);
            if (progress > 0.995) index = list.length - 1;
            if (counter) counter.textContent = `${pad(Math.max(0, index) + 1)} / ${pad(list.length)}`;

            if (prev) prev.disabled = current <= 2;
            if (next) next.disabled = current >= max - 2;
        };

        // Modo fijo: llevar la página al punto del scroll que deja `target` px de recorrido
        const goTo = (target) => {
            const max = maxOffset();
            const clamped = gsap.utils.clamp(0, max, target);
            scrollToTarget(pinned.start + (max > 0 ? clamped / max : 0) * (pinned.end - pinned.start));
        };

        const step = (direction) => {
            if (isPinned && pinned) {
                // La tarjeta siguiente (o anterior) a la que está en el margen
                const current = offset();
                const stops = items().map(offsetOf);
                const target =
                    direction > 0
                        ? stops.find((stop) => stop > current + 4)
                        : [...stops].reverse().find((stop) => stop < current - 4);
                goTo(target ?? (direction > 0 ? maxOffset() : 0));
                return;
            }

            const list = items();
            const gap = parseFloat(getComputedStyle(track).columnGap || 0);
            const width = (list[0]?.getBoundingClientRect().width || track.clientWidth) + gap;
            track.scrollBy({ left: direction * width, behavior: motionAllowed() ? 'smooth' : 'auto' });
        };

        prev?.addEventListener('click', () => step(-1), { signal });
        next?.addEventListener('click', () => step(1), { signal });
        track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true, signal });
        window.addEventListener('resize', update, { signal });

        // Modo fijo: ← → en la pista y foco con el tabulador
        track.addEventListener(
            'keydown',
            (event) => {
                if (!isPinned || event.target !== track) return;
                if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
                event.preventDefault();
                step(event.key === 'ArrowRight' ? 1 : -1);
            },
            { signal }
        );

        track.addEventListener(
            'focusin',
            (event) => {
                if (!isPinned || !pinned) return;
                const item = items().find((el) => el.contains(event.target));
                if (!item) return;
                // La pista está desplazada: lo visible es el ancho de la sección
                const rect = item.getBoundingClientRect();
                const view = root.getBoundingClientRect();
                if (rect.left < view.left || rect.right > view.right) goTo(offsetOf(item));
            },
            { signal }
        );

        // Arrastrar con el ratón: en el modo nativo mueve la pista; en el fijo,
        // la página (1 px de arrastre = 1 px de recorrido, como el scroll).
        let dragging = false;
        let startX = 0;
        let startScroll = 0;
        let moved = false;

        track.addEventListener(
            'pointerdown',
            (event) => {
                if (event.pointerType !== 'mouse' || event.button !== 0) return;
                if (isPinned && !pinned) return;
                dragging = true;
                moved = false;
                startX = event.clientX;
                startScroll = isPinned ? window.scrollY : track.scrollLeft;
                track.classList.add('is-dragging');
            },
            { signal }
        );

        window.addEventListener(
            'pointermove',
            (event) => {
                if (!dragging) return;
                const dx = event.clientX - startX;
                if (Math.abs(dx) > 4) moved = true;

                if (!isPinned) {
                    track.scrollLeft = startScroll - dx;
                    return;
                }

                const y = gsap.utils.clamp(pinned.start, pinned.end, startScroll - dx);
                const lenis = getLenis();
                if (lenis) lenis.scrollTo(y, { immediate: true });
                else window.scrollTo(0, y);
            },
            { signal }
        );

        window.addEventListener(
            'pointerup',
            () => {
                if (!dragging) return;
                dragging = false;
                track.classList.remove('is-dragging');
            },
            { signal }
        );

        // Sin esto, a los pocos px el navegador empieza a arrastrar el enlace o
        // la foto de la tarjeta (drag & drop nativo) y deja de mandar pointermove.
        track.addEventListener('dragstart', (event) => event.preventDefault(), { signal });

        // Un arrastre no debe abrir la tarjeta sobre la que se suelta
        track.addEventListener(
            'click',
            (event) => {
                if (moved) {
                    event.preventDefault();
                    moved = false;
                }
            },
            { capture: true, signal }
        );

        // Horizontal scroll: la sección fija y la pista movida por el scroll
        const mm = gsap.matchMedia();

        if (motionAllowed()) {
            mm.add(PINNED_QUERY, () => {
                track.scrollLeft = 0;
                isPinned = true;
                root.classList.add('is-pinned');

                // onUpdate en el tween, no en el ScrollTrigger: con scrub la pista
                // va con retraso y el contador tiene que seguir a la pista.
                const tween = gsap.to(track, {
                    x: () => -maxOffset(),
                    ease: 'none',
                    onUpdate: update,
                    scrollTrigger: {
                        trigger: root,
                        start: 'center center',
                        end: () => `+=${maxOffset()}`,
                        pin: true,
                        pinType: 'transform', // sin saltos de maquetación (CLS) al fijar
                        scrub: motion.scrub,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                        onRefresh: update,
                    },
                });

                pinned = tween.scrollTrigger;

                // Lo que va debajo tiene que contar con el espacio del pin
                ScrollTrigger.sort();
                ScrollTrigger.refresh();

                return () => {
                    isPinned = false;
                    pinned = null;
                    root.classList.remove('is-pinned');
                    requestAnimationFrame(update);
                };
            });
        }

        cleanups.push(() => mm.revert());
        update();
    });

    return () => cleanups.forEach((cleanup) => cleanup());
});
