/**
 * Comparador antes / después.
 *
 * El <input type="range"> hace todo el trabajo de interacción (ratón, dedo,
 * teclado, lectores de pantalla); aquí solo:
 *  - se traduce su valor a --pos (ancho visible de la foto «antes»);
 *  - las etiquetas Before / After llevan el tirador al extremo (con una
 *    transición de 450 ms, la del Smart Animate del prototipo);
 *  - se anuncia qué se ve (aria-valuetext) y se marca la etiqueta activa.
 */

import { onPage } from '@ashlar/app';

onPage((signal) => {
    document.querySelectorAll('[data-compare]').forEach((root) => {
        const range = root.querySelector('.compare__range');
        if (!range) return;

        const tags = root.querySelectorAll('[data-compare-to]');
        const beforeText = root.querySelector('.compare__tag--before')?.textContent.trim() || 'Before';
        const afterText = root.querySelector('.compare__tag--after')?.textContent.trim() || 'After';

        const update = (value) => {
            const pos = Math.min(100, Math.max(0, Number(value)));
            root.style.setProperty('--pos', `${pos}%`);
            range.setAttribute('aria-valuetext', `${beforeText} ${pos}% · ${afterText} ${100 - pos}%`);
            tags.forEach((tag) => tag.setAttribute('aria-pressed', String(Number(tag.dataset.compareTo) === pos)));
            root.classList.toggle('is-touched', pos !== 50);
        };

        range.addEventListener('input', () => update(range.value), { signal });

        tags.forEach((tag) => {
            tag.addEventListener(
                'click',
                () => {
                    root.classList.add('is-animating');
                    range.value = tag.dataset.compareTo;
                    update(range.value);
                    window.setTimeout(() => root.classList.remove('is-animating'), 450);
                },
                { signal }
            );
        });

        update(range.value);
    });
});
