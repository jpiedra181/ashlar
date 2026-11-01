/**
 * «Pinned services»: los bloques Service de dentro, de uno en uno.
 *
 * Modo fijo (escritorio con ratón, movimiento permitido y solo si el servicio
 * más largo cabe bajo la cabecera): la sección ocupa la pantalla y se queda
 * fija mientras el scroll avanza de un servicio al siguiente. La foto nueva se
 * abre desde el centro sobre la anterior (al volver, se cierra) y los textos
 * salen hacia arriba y entran desde abajo, en escalera. Una barra sobre la
 * foto marca el avance. Los servicios se apilan en la misma celda con el tono
 * y el lado de foto del primero (style.scss).
 *
 * En el resto de casos no se toca nada: los servicios van uno tras otro, con
 * sus propias animaciones de entrada.
 *
 * Accesibilidad: los servicios que no se ven solo se vuelven transparentes
 * (siguen en el árbol de accesibilidad y en el orden del tabulador); al llegar
 * con el tabulador a uno de ellos, la página se desplaza hasta su paso. Los
 * enlaces a la #ancla de un servicio (menú, services-list, «Jump to») llevan a
 * su paso, y al cargar la página con #ancla (o al volver con Atrás) se salta
 * directamente a él.
 *
 * Tiempos del recurso original («Sticky Features» de Osmo): foto en 0,75 s
 * power4.inOut; textos fuera en 0,4 s y dentro en 0,75 s power4.out con 0,1 s
 * de escalera; el 90 % del recorrido para cambiar de paso (el 10 % final deja
 * leer el último antes de soltar la sección).
 */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { onPage, motionAllowed, scrollToTarget, getLenis } from '@ashlar/app';

const PINNED_QUERY = '(min-width: 64em) and (hover: hover)';
const DURATION = 0.75;
const EASE = 'power4.inOut';
const SCROLL_AMOUNT = 0.9; // parte del recorrido que cambia de paso
const TONES = ['theme-light', 'theme-subtle', 'theme-dark'];

// La barra de administración (sesión iniciada) tapa la parte de arriba
const adminBar = () => document.getElementById('wpadminbar')?.offsetHeight || 0;

// La #ancla de la URL solo se corrige al cargar la página: no al remontar
// (interruptor «Animaciones») ni si el modo fijo llega después (la ventana
// crece), cuando el visitante ya está en otro sitio.
let pageLoad = true;

onPage((signal) => {
    const atLoad = pageLoad;
    pageLoad = false;
    if (!motionAllowed()) return;

    const query = window.matchMedia(PINNED_QUERY);
    const cleanups = [];

    document.querySelectorAll('[data-service-stack]').forEach((root) => {
        const services = [...root.children].filter((el) => el.classList.contains('service'));
        if (services.length < 2) return;

        const contents = services.map((service) => service.querySelector('.service__content'));
        const frames = services.map((service) => service.querySelector('.service__media'));
        const texts = contents.map((content) => [
            ...content.querySelectorAll(':scope > .service__heading > *, :scope > :not(.service__heading)'),
        ]);
        const steps = services.length - 1;

        // Tono y lado de foto que trae cada servicio (se restauran al salir)
        const original = services.map((service) => ({
            tones: TONES.filter((tone) => service.classList.contains(tone)),
            right: service.classList.contains('service--right'),
        }));

        let active = 0;
        let trigger = null;
        let leave = null;
        let renderStep = null; // estado de un paso sin transición (lo define enter)
        let hashDone = !atLoad;

        // Paso que corresponde a un avance del ScrollTrigger (0–1)
        const stepAt = (progress) =>
            gsap.utils.clamp(0, steps, Math.floor((Math.min(progress, SCROLL_AMOUNT) / SCROLL_AMOUNT) * steps + 1e-6));

        // Punto del scroll en el que se ve un paso: un poco dentro de su tramo
        // para que no cambie al mínimo roce (el último, en el 10 % final).
        const positionOf = (index) => {
            let progress = 0;
            if (index === steps) progress = (SCROLL_AMOUNT + 1) / 2;
            else if (index > 0) progress = ((index + 0.2) / steps) * SCROLL_AMOUNT;
            return trigger.start + progress * (trigger.end - trigger.start);
        };

        const goTo = (index, immediate = false) => {
            if (!trigger) return;
            const y = positionOf(index);
            if (!immediate) {
                scrollToTarget(y);
                return;
            }
            const lenis = getLenis();
            if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
            else window.scrollTo(0, y);
        };

        // ¿Un #ancla de esta sección? Índice del servicio (la de la sección = el primero)
        const indexOfHash = (hash) => {
            let id = '';
            try {
                id = decodeURIComponent(hash.slice(1));
            } catch {
                return -1; // #ancla mal formada (p. ej. «#10%»)
            }
            if (!id) return -1;
            if (root.id === id) return 0;
            return services.findIndex((service) => service.id === id);
        };

        const fromHash = () => {
            const index = indexOfHash(window.location.hash);
            if (!trigger || index <= 0) return;
            renderStep(index);
            goTo(index, true);
        };

        // Las entradas de animations.js de un servicio (data-reveal, la
        // cortinilla de la foto, el titular línea a línea) se dan por hechas:
        // en el modo fijo los pasos se encargan del movimiento. El .is-in
        // («ya entró») hace que animations.js tampoco anime las que su
        // ScrollTrigger.batch ya tenía en cola.
        const settled = new Set();
        const settle = (service) => {
            if (settled.has(service)) return;
            settled.add(service);
            ScrollTrigger.getAll().forEach((st) => {
                if (st.trigger && service.contains(st.trigger)) {
                    st.animation?.progress(1);
                    st.kill();
                }
            });
            const media = [...service.querySelectorAll('[data-media-reveal], [data-media-reveal] img')];
            gsap.getTweensOf([...service.querySelectorAll('[data-reveal]'), ...media]).forEach((tween) => tween.progress(1));
            service.querySelectorAll('[data-reveal], [data-media-reveal]').forEach((el) => el.classList.add('is-in'));
            gsap.set(service.querySelectorAll('[data-media-reveal] img'), { clearProps: 'transform' });
        };

        // Textos que mueven los pasos: los del primero, solo cuando ya entró
        const freeTexts = () => texts.slice(settled.has(services[0]) ? 0 : 1).flat();

        // ¿Cabe fijo? Se mide con el modo compacto puesto y se deja como estaba.
        const fits = () => {
            const was = root.classList.contains('is-pinned');
            root.classList.add('is-pinned');
            const style = getComputedStyle(root);
            const room = window.innerHeight - adminBar() - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
            const ok = services.every((service) => service.offsetHeight <= room);
            if (!was) root.classList.remove('is-pinned');
            return ok;
        };

        const enter = () => {
            const first = original[0];
            services.forEach((service) => {
                service.classList.remove(...TONES);
                service.classList.toggle('service--right', first.right);
            });
            root.classList.add('is-pinned', ...first.tones);

            // El primero entra como cualquier sección (hasta el primer cambio
            // de paso); los demás no se ven al entrar, así que sus entradas se
            // dan por hechas desde el principio.
            services.slice(1).forEach(settle);

            const radius = getComputedStyle(frames[0]).borderRadius;
            const clipOpen = `inset(0% round ${radius})`;
            const clipClosed = `inset(50% round ${radius})`;

            // Barra de avance sobre el borde inferior de la foto
            const bar = document.createElement('div');
            bar.className = 'service-stack__progress';
            bar.setAttribute('aria-hidden', 'true');
            const fill = document.createElement('div');
            fill.className = 'service-stack__bar';
            bar.append(fill);
            root.append(bar);
            const setBar = gsap.quickTo(fill, 'scaleX', { duration: 0.5, ease: 'none' });

            // Todas las fotos ocupan el mismo sitio: se mide la primera
            const placeBar = () => {
                const frame = frames[0].getBoundingClientRect();
                const box = root.getBoundingClientRect();
                gsap.set(bar, { left: frame.left - box.left, top: frame.bottom - box.top, width: frame.width });
            };

            // Estado de un paso, sin transición. La foto del primero siempre
            // está abierta (debajo de todas) y es de su cortinilla de entrada;
            // sus textos, mientras no haya entrado, también.
            const render = (index) => {
                if (index > 0) settle(services[0]);
                active = index;
                const free = freeTexts();
                gsap.killTweensOf([...frames.slice(1), ...contents, ...free]);
                services.forEach((service, i) => service.classList.toggle('is-active', i === index));
                gsap.set(contents, { opacity: (i) => (i === index ? 1 : 0) });
                gsap.set(free, { opacity: 1, y: 0 });
                gsap.set(frames.slice(1), { clipPath: (i) => (i + 1 <= index ? clipOpen : clipClosed) });
            };

            const hide = (index) =>
                gsap.to(texts[index], {
                    opacity: 0,
                    y: -30,
                    ease: 'power4.out',
                    duration: 0.4,
                    overwrite: 'auto',
                    // Si mientras salía se ha vuelto a él, no se esconde
                    onComplete: () => index !== active && gsap.set(contents[index], { opacity: 0 }),
                });

            const show = (index) => {
                gsap.set(contents[index], { opacity: 1 });
                gsap.fromTo(
                    texts[index],
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, ease: 'power4.out', duration: DURATION, stagger: 0.1, overwrite: 'auto' }
                );
            };

            // Cambio de paso. Cada foto se abre o se cierra según quede por
            // debajo o por encima del paso nuevo, así que un salto de varios
            // pasos (un enlace, el tabulador) deja siempre la foto que toca.
            const change = (to) => {
                const from = active;
                if (to === from) return;
                settle(services[0]);
                active = to;
                services.forEach((service, i) => service.classList.toggle('is-active', i === to));
                gsap.to(frames.slice(Math.min(from, to) + 1, Math.max(from, to) + 1), {
                    clipPath: to > from ? clipOpen : clipClosed,
                    duration: DURATION,
                    ease: EASE,
                    overwrite: 'auto',
                });
                hide(from);
                show(to);
            };

            render(0);

            trigger = ScrollTrigger.create({
                trigger: root,
                start: () => `top top+=${adminBar()}`,
                end: () => `+=${steps * window.innerHeight}`,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    setBar(Math.min(self.progress, SCROLL_AMOUNT) / SCROLL_AMOUNT);
                    change(stepAt(self.progress));
                },
                onRefresh: placeBar,
            });

            // Lo que va debajo tiene que contar con el espacio del pin
            ScrollTrigger.sort();
            ScrollTrigger.refresh();

            // Al entrar con la página ya a media sección (recarga, cambio de
            // tamaño), el paso que toca sin transición
            render(stepAt(trigger.progress));
            gsap.set(fill, { scaleX: Math.min(trigger.progress, SCROLL_AMOUNT) / SCROLL_AMOUNT });
            placeBar();

            renderStep = render;

            // Página cargada con #ancla de un servicio: el navegador salta a
            // ella (y lo repite al terminar de cargar), y en el modo fijo el
            // ancla está al principio de la sección. Se corrige al paso de ese
            // servicio, también después del load.
            if (!hashDone) {
                hashDone = true;
                fromHash();
                if (document.readyState !== 'complete') {
                    window.addEventListener('load', () => requestAnimationFrame(fromHash), { once: true, signal });
                }
            }

            return () => {
                renderStep = null;
                trigger.kill();
                trigger = null;
                const free = freeTexts();
                gsap.killTweensOf([...frames.slice(1), ...contents, ...free, fill]);
                gsap.set([...contents, ...free], { clearProps: 'opacity,transform' });
                // Como lo deja SplitText tras partir el titular
                gsap.set(free.filter((el) => el.matches('[data-split]')), { opacity: 1 });
                // Estas ya entraron (.is-in): sin recorte. La del primero es de
                // su cortinilla de entrada, esté hecha o por llegar.
                gsap.set(frames.slice(1), { clearProps: 'clipPath' });
                bar.remove();
                services.forEach((service, i) => {
                    service.classList.remove('is-active');
                    service.classList.add(...original[i].tones);
                    service.classList.toggle('service--right', original[i].right);
                });
                root.classList.remove('is-pinned', ...first.tones);
                ScrollTrigger.sort();
                ScrollTrigger.refresh();
            };
        };

        const setMode = () => {
            const pinned = query.matches && fits();
            if (pinned === Boolean(leave)) return;
            if (pinned) {
                leave = enter();
            } else {
                leave();
                leave = null;
            }
        };

        // Tabulador: llegar a un servicio que no se ve lleva la página a su paso
        root.addEventListener(
            'focusin',
            (event) => {
                if (!trigger) return;
                const index = services.findIndex((service) => service.contains(event.target));
                if (index >= 0 && index !== active) goTo(index);
            },
            { signal }
        );

        // Enlaces a la #ancla de un servicio de esta sección: a su paso, no al
        // principio de la sección. Fase de captura: corre antes que Lenis, que
        // lanza su propio desplazamiento con el mismo clic; el de aquí lo
        // sustituye en el fotograma siguiente.
        document.addEventListener(
            'click',
            (event) => {
                if (!trigger || event.defaultPrevented || event.button !== 0) return;
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                const link = event.target.closest?.('a[href]');
                if (!link || (link.target && link.target !== '_self')) return;
                const url = new URL(link.href, window.location.href);
                const here = window.location;
                if (url.origin !== here.origin || url.pathname !== here.pathname || url.search !== here.search) return;
                const index = indexOfHash(url.hash);
                if (index < 0) return;
                event.preventDefault();
                // Como el navegador: la misma #ancla otra vez no añade historial
                if (url.hash !== here.hash) window.history.pushState(null, '', url.hash);
                requestAnimationFrame(() => goTo(index));
            },
            { capture: true, signal }
        );

        // Atrás / Adelante entre #anclas, o una #ancla escrita a mano
        window.addEventListener(
            'hashchange',
            () => {
                const index = indexOfHash(window.location.hash);
                if (trigger && index >= 0) goTo(index);
            },
            { signal }
        );

        // El modo se revisa al cambiar de ancho o de puntero, al cambiar el
        // alto (¿sigue cabiendo?) y cuando llegan las fuentes (cambian lo que mide).
        let resizeTimer = 0;
        const onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(setMode, 200);
        };

        query.addEventListener('change', setMode, { signal });
        window.addEventListener('resize', onResize, { signal });
        document.fonts?.ready.then(() => !signal.aborted && setMode());

        setMode();

        cleanups.push(() => {
            clearTimeout(resizeTimer);
            leave?.();
            leave = null;
        });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
});
