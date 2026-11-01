/**
 * «How it works»: horizontal scroll, pestañas o acordeón.
 *
 * El HTML guardado trae los cinco pasos completos y legibles sin JS. Aquí se
 * elige el patrón según la pantalla y se ponen los roles ARIA que tocan:
 *
 *  - Horizontal scroll (≥1024 px con ratón, movimiento permitido y solo si el
 *    panel compacto cabe fijo en la ventana): la fila de pestañas y el panel
 *    se quedan fijos y el scroll vertical desliza los cinco paneles en fila,
 *    encajando en cada paso. Mismo patrón ARIA que las pestañas; los paneles
 *    que no se ven quedan inert (ni teclado ni lector de pantalla).
 *  - ≥1024 px → pestañas (WAI-ARIA Tabs, activación automática): tablist /
 *    tab / tabpanel, flechas ← →, Inicio y Fin. Los pasos anteriores al
 *    activo se marcan como hechos (✓).
 *  - <1024 px → acordeón: cada paso tiene su botón con aria-expanded; pueden
 *    abrirse varios a la vez.
 *
 * Los botones «Next: …» y «Previous» (data-process-go) llevan al paso
 * indicado en cualquiera de los modos (en el horizontal, desplazando la página).
 */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { onPage, motionAllowed, motion, getLenis } from '@ashlar/app';

let counter = 0;

onPage((signal) => {
    const desktop = window.matchMedia('(min-width: 64em)');
    const hover = window.matchMedia('(hover: hover)');
    const cleanups = [];

    document.querySelectorAll('[data-process]').forEach((root) => {
        const tabList = root.querySelector('[data-process-tabs]');
        const tabs = [...root.querySelectorAll('[data-process-tab]')];
        const steps = [...root.querySelectorAll('[data-process-step]')];
        const toggles = steps.map((step) => step.querySelector('[data-process-toggle]'));
        const bodies = steps.map((step) => step.querySelector('[data-process-body]'));
        if (!tabList || !steps.length) return;

        const base = `process-${++counter}`;
        steps.forEach((step, i) => {
            step.id = `${base}-panel-${i + 1}`;
            tabs[i].id = `${base}-tab-${i + 1}`;
            toggles[i].id = `${base}-toggle-${i + 1}`;
            bodies[i].id = `${base}-body-${i + 1}`;
        });

        const last = steps.length - 1;
        const clampStep = (index) => Math.max(0, Math.min(last, index));

        let active = 0;
        const open = new Set([0]);
        let mode = '';
        let leave = null; // deshace el modo horizontal
        let scroller = null; // su ScrollTrigger

        /* ---------- Pestañas ---------- */

        const renderTabs = (focusTab = false) => {
            tabs.forEach((tab, i) => {
                const selected = i === active;
                tab.setAttribute('aria-selected', String(selected));
                tab.tabIndex = selected ? 0 : -1;
                tab.classList.toggle('is-active', selected);
                tab.classList.toggle('is-done', i < active);
            });
            steps.forEach((step, i) => {
                // En el horizontal se ven todos (se deslizan): los demás, inert
                if (mode === 'hscroll') step.inert = i !== active;
                else step.hidden = i !== active;
            });
            if (focusTab) tabs[active].focus();
        };

        const enterTabs = () => {
            tabList.setAttribute('role', 'tablist');
            tabs.forEach((tab, i) => {
                tab.setAttribute('role', 'tab');
                tab.setAttribute('aria-controls', steps[i].id);
            });
            steps.forEach((step, i) => {
                step.setAttribute('role', 'tabpanel');
                step.setAttribute('aria-labelledby', tabs[i].id);
                step.tabIndex = 0;
            });
            toggles.forEach((toggle) => {
                toggle.removeAttribute('aria-expanded');
                toggle.removeAttribute('aria-controls');
            });
            bodies.forEach((body) => (body.hidden = false));
            renderTabs();
        };

        /* ---------- Horizontal scroll ---------- */

        // Lo que tapa por arriba: barra de administración y cabecera, más aire
        const topOffset = () =>
            (document.getElementById('wpadminbar')?.offsetHeight || 0) +
            (document.querySelector('.site-header')?.offsetHeight || 0) +
            16;
        const stride = () => root.clientWidth + (parseFloat(getComputedStyle(root).columnGap) || 0);

        // ¿Cabe fijo? Se mide con el panel compacto puesto y se deja todo como estaba.
        const fits = () => {
            const classes = ['is-tabs', 'is-hscroll'].map((name) => root.classList.contains(name));
            const hidden = steps.map((step) => step.hidden);
            root.classList.add('is-tabs', 'is-hscroll');
            steps.forEach((step) => (step.hidden = false));
            const ok = root.offsetHeight <= window.innerHeight - topOffset() - 16;
            ['is-tabs', 'is-hscroll'].forEach((name, i) => root.classList.toggle(name, classes[i]));
            steps.forEach((step, i) => (step.hidden = hidden[i]));
            return ok;
        };

        const enterHScroll = () => {
            steps.forEach((step) => (step.hidden = false));
            root.classList.add('is-hscroll');
            active = 0;
            enterTabs();

            const state = { p: 0 };
            const place = () => {
                const width = stride();
                steps.forEach((step, i) => gsap.set(step, { x: (i - state.p) * width }));
                const current = Math.round(state.p);
                if (current !== active) {
                    active = current;
                    renderTabs();
                }
            };

            const tween = gsap.to(state, {
                p: last,
                ease: 'none',
                onUpdate: place,
                scrollTrigger: {
                    trigger: root,
                    start: () => `top top+=${topOffset()}`,
                    end: () => `+=${last * stride()}`,
                    pin: true,
                    pinType: 'transform', // sin saltos de maquetación (CLS) al fijar
                    scrub: motion.scrub,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onRefresh: place,
                },
            });

            scroller = tween.scrollTrigger;
            place();

            // Lo que va debajo tiene que contar con el espacio del pin
            ScrollTrigger.sort();
            ScrollTrigger.refresh();

            // Encaje en cada paso, sobre Lenis (el snap de ScrollTrigger cree que
            // el scroll ha terminado mientras Lenis aún lo suaviza). Cuando el
            // scroll se para dentro de la sección: si el gesto movió más de un
            // 20 % de paso, al paso siguiente en ese sentido (o al más cercano si
            // fueron varios); si no, vuelta al paso en el que empezó.
            const lenis = getLenis();
            let anchor = null;
            let idle = 0;

            const settle = () => {
                const from = anchor;
                anchor = null;
                if (!scroller?.isActive || from === null) return;
                const raw = scroller.progress * last;
                const delta = raw - from;
                let target = from;
                if (Math.abs(delta) > 0.2) target = Math.abs(delta) < 1 ? from + Math.sign(delta) : Math.round(raw);
                target = clampStep(target);
                if (Math.abs(raw - target) > 0.01) toStep(target);
            };

            const onLenisScroll = () => {
                if (anchor === null && scroller) anchor = Math.round(scroller.progress * last);
                clearTimeout(idle);
                idle = setTimeout(settle, 160);
            };

            lenis?.on('scroll', onLenisScroll);

            leave = () => {
                clearTimeout(idle);
                lenis?.off('scroll', onLenisScroll);
                scroller?.kill(true);
                tween.kill();
                scroller = null;
                gsap.set(steps, { clearProps: 'transform' });
                steps.forEach((step) => (step.inert = false));
                root.classList.remove('is-hscroll');
            };
        };

        // Lleva la página al punto del scroll en el que se ve ese paso
        const toStep = (index, focusPanel = false) => {
            if (!scroller) return;
            const y = scroller.start + (index / last) * (scroller.end - scroller.start);
            const done = () => focusPanel && steps[index].focus({ preventScroll: true });
            const lenis = getLenis();
            if (lenis) {
                lenis.scrollTo(y, { duration: 1.2, onComplete: done });
            } else {
                window.scrollTo(0, y);
                done();
            }
        };

        /* ---------- Acordeón ---------- */

        const renderAccordion = () => {
            toggles.forEach((toggle, i) => {
                const expanded = open.has(i);
                toggle.setAttribute('aria-expanded', String(expanded));
                steps[i].classList.toggle('is-open', expanded);
                bodies[i].hidden = !expanded;
            });
        };

        const enterAccordion = () => {
            tabList.removeAttribute('role');
            tabs.forEach((tab) => {
                ['role', 'aria-selected', 'aria-controls'].forEach((attr) => tab.removeAttribute(attr));
                tab.removeAttribute('tabindex');
            });
            steps.forEach((step, i) => {
                ['role', 'aria-labelledby', 'tabindex'].forEach((attr) => step.removeAttribute(attr));
                step.hidden = false;
                toggles[i].setAttribute('aria-controls', bodies[i].id);
            });
            open.clear();
            open.add(active);
            renderAccordion();
        };

        /* ---------- Modo según la pantalla ---------- */

        const setMode = () => {
            let next = desktop.matches ? 'tabs' : 'accordion';
            if (next === 'tabs' && hover.matches && motionAllowed() && fits()) next = 'hscroll';
            if (next === mode) return;

            leave?.();
            leave = null;
            mode = next;
            root.classList.toggle('is-tabs', mode !== 'accordion');
            root.classList.toggle('is-accordion', mode === 'accordion');

            if (mode === 'hscroll') enterHScroll();
            else if (mode === 'tabs') enterTabs();
            else enterAccordion();
        };

        const go = (index) => {
            const target = clampStep(index);

            if (mode === 'hscroll') {
                toStep(target, true);
                return;
            }

            active = target;

            if (mode === 'tabs') {
                renderTabs();
                // El foco va al panel nuevo: el lector de pantalla lo anuncia.
                steps[active].focus({ preventScroll: true });
                const top = tabList.getBoundingClientRect().top;
                if (top < 0) tabList.scrollIntoView({ block: 'start', behavior: 'smooth' });
                return;
            }

            open.clear();
            open.add(active);
            renderAccordion();
            toggles[active].focus({ preventScroll: true });
            toggles[active].scrollIntoView({ block: 'start', behavior: 'smooth' });
        };

        tabs.forEach((tab, i) => {
            tab.addEventListener(
                'click',
                () => {
                    if (mode === 'hscroll') {
                        toStep(i);
                        return;
                    }
                    if (mode !== 'tabs') return;
                    active = i;
                    renderTabs();
                },
                { signal }
            );
        });

        tabList.addEventListener(
            'keydown',
            (event) => {
                if (mode !== 'tabs' && mode !== 'hscroll') return;
                const keys = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: tabs.length - 1 };
                if (!(event.key in keys)) return;
                event.preventDefault();
                const target = (keys[event.key] + tabs.length) % tabs.length;

                if (mode === 'hscroll') {
                    tabs[target].focus();
                    toStep(target);
                    return;
                }

                active = target;
                renderTabs(true);
            },
            { signal }
        );

        toggles.forEach((toggle, i) => {
            toggle.addEventListener(
                'click',
                () => {
                    if (mode !== 'accordion') return;
                    if (open.has(i)) open.delete(i);
                    else open.add(i);
                    active = i;
                    renderAccordion();
                },
                { signal }
            );
        });

        root.querySelectorAll('[data-process-go]').forEach((button) => {
            button.addEventListener('click', () => go(Number(button.dataset.processGo)), { signal });
        });

        // El modo se revisa al cambiar de ancho, de puntero, de alto (¿sigue
        // cabiendo?) y cuando llegan las fuentes (cambian lo que mide el panel).
        let resizeTimer = 0;
        const onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(setMode, 200);
        };

        desktop.addEventListener('change', setMode, { signal });
        hover.addEventListener('change', setMode, { signal });
        window.addEventListener('resize', onResize, { signal });
        document.fonts?.ready.then(() => !signal.aborted && setMode());

        root.classList.add('is-ready');
        setMode();

        cleanups.push(() => {
            clearTimeout(resizeTimer);
            leave?.();
        });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
});
