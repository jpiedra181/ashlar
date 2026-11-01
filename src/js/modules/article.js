/**
 * Artículo del Journal: el índice («In this article», bloque
 * ashlar/article-toc) marca con aria-current el apartado que se está leyendo.
 * No es una animación: funciona también con el movimiento apagado.
 */

import { onPage } from '../lib/lifecycle';

onPage(() => {
    const toc = document.querySelector('[data-article-toc]');
    if (!toc) return;

    const links = new Map();
    toc.querySelectorAll('a[href^="#"]').forEach((link) => {
        const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));
        if (heading) links.set(heading, link);
    });
    if (!links.size) return;

    const visible = new Set();
    const mark = () => {
        // El apartado actual: el primero visible en pantalla o, si no hay
        // ninguno, el último que ya quedó por encima.
        const headings = [...links.keys()];
        const current =
            headings.find((heading) => visible.has(heading)) ||
            headings.filter((heading) => heading.getBoundingClientRect().top < 0).pop();
        links.forEach((link, heading) => {
            if (heading === current) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    };

    const observer = new window.IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)));
            mark();
        },
        { rootMargin: '0px 0px -55% 0px' }
    );
    links.forEach((_, heading) => observer.observe(heading));

    return () => observer.disconnect();
});
