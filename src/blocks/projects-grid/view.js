/**
 * «All projects»: filtros, orden y «Load more» sin recargar la página.
 *
 * El bloque ya funciona solo con enlaces y un formulario (parámetros en la
 * URL). Aquí se pide esa misma URL con fetch(), se cambia el bloque por el de
 * la respuesta y se actualiza la dirección (con historial para los filtros).
 * Tras «Load more», el foco pasa a la primera tarjeta nueva.
 */

import { onPage } from '@ashlar/app';

const SELECTOR = '[data-projects-grid]';

async function swap(root, url, { push = false, focusFrom = null } = {}) {
    root.setAttribute('aria-busy', 'true');
    root.classList.add('is-loading');

    try {
        const response = await fetch(url, { credentials: 'same-origin', headers: { 'X-Requested-With': 'fetch' } });
        if (!response.ok) throw new Error(String(response.status));
        const doc = new window.DOMParser().parseFromString(await response.text(), 'text/html');
        const fresh = doc.getElementById(root.id) || doc.querySelector(SELECTOR);
        if (!fresh) throw new Error('missing');

        root.replaceWith(fresh);
        window.history[push ? 'pushState' : 'replaceState']({ ashlarProjects: true }, '', url);

        if (focusFrom !== null) {
            const card = fresh.querySelectorAll('[data-projects-item]')[focusFrom]?.querySelector('a');
            card?.focus({ preventScroll: false });
        }
        fresh.dispatchEvent(new window.CustomEvent('ashlar:projects-updated', { bubbles: true }));
        return fresh;
    } catch {
        // Si algo falla, navegación normal: el bloque funciona sin JS.
        window.location.href = url;
        return null;
    }
}

onPage((signal) => {
    document.addEventListener(
        'click',
        (event) => {
            const link = event.target.closest(`${SELECTOR} [data-projects-link], ${SELECTOR} [data-projects-more]`);
            if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
            const root = link.closest(SELECTOR);
            event.preventDefault();

            if (link.hasAttribute('data-projects-more')) {
                const count = root.querySelectorAll('[data-projects-item]').length;
                swap(root, link.href, { focusFrom: count });
            } else {
                swap(root, link.href, { push: true });
            }
        },
        { signal }
    );

    document.addEventListener(
        'change',
        (event) => {
            const select = event.target.closest(`${SELECTOR} [data-projects-sort] select`);
            if (!select) return;
            const form = select.form;
            const url = new URL(form.action, window.location.href);
            new window.FormData(form).forEach((value, key) => value && url.searchParams.set(key, value));
            if (url.searchParams.get('sort') === 'newest') url.searchParams.delete('sort');
            swap(select.closest(SELECTOR), url.toString(), { push: true });
        },
        { signal }
    );

    // Atrás / adelante del navegador entre filtros.
    window.addEventListener(
        'popstate',
        () => {
            const root = document.querySelector(SELECTOR);
            if (root) swap(root, window.location.href);
        },
        { signal }
    );
});
