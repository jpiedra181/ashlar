/**
 * login.js — pase de fotos de la pantalla de acceso (inc/login.php; base: login.js de Raíz).
 *
 * - Cambia de foto cada SLIDE_MS con fundido y un leve acercamiento (CSS).
 * - Solo la primera foto se descarga al entrar: cada siguiente se pide antes de
 *   mostrarse y no se cambia hasta que ha llegado (nunca se ve un hueco).
 * - El pie de foto (proyecto y lugar) se funde con la foto.
 * - Con movimiento reducido no pasa solo: se queda en la primera.
 * - Se pausa con la pestaña oculta para no gastar datos ni batería.
 */

import './login.scss';

const SLIDE_MS = 7000; // Debe coincidir con $slide-duration en login.scss

function load(img) {
    return new Promise((resolve) => {
        if (!img.dataset.src) {
            resolve();
            return;
        }
        img.onload = img.onerror = () => resolve();
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
    });
}

function initSlides() {
    const aside = document.querySelector('[data-login-slides]');
    if (!aside) return;

    const slides = [...aside.querySelectorAll('.ashlar-login__slide')];
    const title = aside.querySelector('[data-caption-title]');
    const place = aside.querySelector('[data-caption-place]');
    const counter = aside.querySelector('[data-slide-index]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (slides.length < 2 || reduced) return;

    let current = 0;
    let timer;

    const restartProgress = () => {
        aside.classList.remove('is-playing');
        // Fuerza un reflow para que la animación de la barra arranque de cero.
        void aside.offsetWidth;
        aside.classList.add('is-playing');
    };

    const show = async (index) => {
        const next = slides[index];
        await load(next.querySelector('img'));

        aside.classList.add('is-changing');
        slides[current].classList.remove('is-active');
        next.classList.add('is-active');
        current = index;

        window.setTimeout(() => {
            if (title) title.textContent = next.dataset.title || '';
            if (place) place.textContent = next.dataset.place || '';
            if (counter) counter.textContent = String(index + 1).padStart(2, '0');
            aside.classList.remove('is-changing');
        }, 600);

        restartProgress();
        schedule();
    };

    const schedule = () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => show((current + 1) % slides.length), SLIDE_MS);
        // Adelanta la descarga de la siguiente mientras se ve esta.
        load(slides[(current + 1) % slides.length].querySelector('img'));
    };

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            window.clearTimeout(timer);
            aside.classList.remove('is-playing');
        } else {
            restartProgress();
            schedule();
        }
    });

    restartProgress();
    schedule();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlides);
} else {
    initSlides();
}
