/**
 * Formulario de presupuesto en la web: horquilla en vivo, validación
 * accesible y envío sin recargar (base: view.js del bloque contact de Raíz).
 *
 *  - La caja «Your ballpark» solo aparece con JS: se recalcula al elegir tipo
 *    de obra y tamaño (cifras en data-quote-config, render.php) y se anuncia
 *    con aria-live.
 *  - Errores al salir de cada campo (y se corrigen mientras se escribe), con
 *    aria-invalid y su mensaje enlazado (aria-describedby). En las preguntas
 *    de opciones el error va en el grupo (aria-describedby del fieldset) y en
 *    sus radios (aria-invalid).
 *  - Al enviar: foco al primer error y resumen en el estado; los errores del
 *    servidor (422) se pintan en sus campos; el botón no se desactiva (con el
 *    foco dentro se perdería), solo se ignora el doble envío.
 *  - ?service=loft (enlaces de Services) preselecciona el tipo de obra.
 *  - Sin JS el formulario se envía a admin-post.php y valida el navegador:
 *    por eso noValidate se pone aquí y no en el HTML.
 */

import { onPage } from '@ashlar/app';

const AFTER_FOCUS_MS = 600;

onPage((signal) => {
    const form = document.querySelector('[data-quote-form]');
    if (!form) return;

    form.noValidate = true;

    let config = {};
    try {
        config = JSON.parse(form.dataset.quoteConfig || '{}');
    } catch {
        config = {};
    }

    const success = document.querySelector('[data-quote-success]');
    const status = form.querySelector('[data-quote-status]');
    const submit = form.querySelector('[type="submit"]');
    const groups = [...form.querySelectorAll('[data-quote-group]')];
    const inputs = [...form.querySelectorAll('.field__input[required]')];

    /* ---------- Horquilla ---------- */

    const ballpark = form.querySelector('[data-quote-ballpark]');
    const figure = form.querySelector('[data-quote-figure]');
    const price = form.querySelector('[data-quote-price]');
    const time = form.querySelector('[data-quote-time]');
    const basis = form.querySelector('[data-quote-basis]');
    const fill = (template = '', values) => template.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
    const checked = (name) => form.querySelector(`[name="${name}"]:checked`)?.value || '';

    const updateBallpark = () => {
        if (!ballpark) return;
        const service = checked('service');
        const size = checked('size');
        const rows = (config.estimates || []).filter((row) => row.service === service);
        const row = rows.find((item) => item.size === size) || rows.find((item) => item.size === 'any');

        if (!service || !row) {
            figure.hidden = true;
            basis.textContent = service ? config.unsure : config.prompt;
            return;
        }

        const work = config.work?.[service] || '';
        price.textContent = row.price;
        time.textContent = row.time;
        figure.hidden = false;
        basis.textContent = row.size === 'any' ? fill(config.basisAny, { jobs: row.jobs, work }) : fill(config.basis, { jobs: row.jobs, work, size: config.sizes?.[size] || '' });
    };

    if (ballpark) {
        ballpark.hidden = false;
        form.addEventListener('change', (event) => event.target.matches('[name="service"], [name="size"]') && updateBallpark(), { signal });
    }

    const preset = new URLSearchParams(window.location.search).get('service');
    if (preset) {
        const radio = form.querySelector(`[name="service"][value="${CSS.escape(preset)}"]`);
        if (radio) radio.checked = true;
    }
    updateBallpark();

    /* ---------- Errores ---------- */

    // Enlaza (o desenlaza) el mensaje de error sin tocar otras descripciones.
    const describe = (element, id, show) => {
        const ids = (element.getAttribute('aria-describedby') || '').split(/\s+/).filter((item) => item && item !== id);
        if (show) ids.push(id);
        if (ids.length) element.setAttribute('aria-describedby', ids.join(' '));
        else element.removeAttribute('aria-describedby');
    };

    const errorFor = (name) => document.getElementById(`quote-${name}-error`);

    const setError = (name, message) => {
        const error = errorFor(name);
        if (error) {
            if (typeof message === 'string' && message) error.textContent = message;
            error.hidden = !message;
        }

        const group = form.querySelector(`[data-quote-group="${name}"]`);
        if (group) {
            group.classList.toggle('is-invalid', !!message);
            describe(group, `quote-${name}-error`, !!message);
            group.querySelectorAll('input').forEach((radio) => radio.setAttribute('aria-invalid', message ? 'true' : 'false'));
            return;
        }

        const field = form.querySelector(`[name="${name}"]`);
        if (field) {
            field.setAttribute('aria-invalid', message ? 'true' : 'false');
            describe(field, `quote-${name}-error`, !!message);
        }
    };

    // Comprobaciones que el navegador no hace solo (mismo criterio que el servidor).
    const extra = {
        phone: (value) => (value.match(/\d/g) || []).length >= 7,
        postcode: (value) => /^[A-Za-z0-9 ]{2,10}$/.test(value.trim()),
    };

    const validateInput = (field) => {
        const value = field.value.trim();
        const valid = field.checkValidity() && value !== '' && (!extra[field.name] || extra[field.name](value));
        setError(field.name, !valid);
        return valid;
    };

    const validateGroup = (group) => {
        const name = group.dataset.quoteGroup;
        const valid = !!checked(name);
        setError(name, !valid);
        return valid;
    };

    inputs.forEach((field) => {
        field.setAttribute('aria-invalid', 'false');
        field.addEventListener('blur', () => field.value && validateInput(field), { signal });
        field.addEventListener('input', () => field.getAttribute('aria-invalid') === 'true' && validateInput(field), { signal });
    });

    groups.forEach((group) => {
        group.addEventListener('change', () => group.classList.contains('is-invalid') && validateGroup(group), { signal });
    });

    /* ---------- Estado y envío ---------- */

    // Se vacía y se vuelve a escribir para que se anuncie aunque se repita;
    // tras mover el foco, un poco después (NVDA cortaba el aviso).
    let statusTimer = 0;
    const announce = (message, delay = 50, isError = false) => {
        if (!status) return;
        window.clearTimeout(statusTimer);
        status.textContent = '';
        status.toggleAttribute('data-error', isError);
        statusTimer = window.setTimeout(() => {
            status.textContent = message;
        }, delay);
    };

    const firstControl = (name) => form.querySelector(`[data-quote-group="${name}"] input`) || form.querySelector(`[name="${name}"]`);

    let busy = false;
    const setBusy = (value) => {
        busy = value;
        submit?.setAttribute('aria-disabled', String(value));
    };

    form.addEventListener(
        'submit',
        async (event) => {
            event.preventDefault();
            if (busy) return;

            const invalid = [...groups.filter((group) => !validateGroup(group)).map((group) => group.dataset.quoteGroup), ...inputs.filter((field) => !validateInput(field)).map((field) => field.name)];

            if (invalid.length) {
                firstControl(invalid[0])?.focus();
                announce(invalid.length === 1 ? 'Please check the highlighted answer.' : `Please check the ${invalid.length} highlighted answers.`, AFTER_FOCUS_MS, true);
                return;
            }

            const data = new FormData(form);
            if (data.get('qf_hp')) return; // campo trampa

            setBusy(true);
            announce('Sending…');

            try {
                // getAttribute: form.action devolvería el <input name="action"> que pide admin-post.php
                const response = await fetch(form.getAttribute('action'), {
                    method: 'POST',
                    body: data,
                    credentials: 'same-origin',
                    headers: { Accept: 'application/json' },
                });
                const result = await response.json().catch(() => ({}));

                if (response.status === 422 && result.errors) {
                    const names = Object.keys(result.errors);
                    names.forEach((name) => setError(name, result.errors[name]));
                    firstControl(names[0])?.focus();
                    announce('Please check the highlighted answers.', AFTER_FOCUS_MS, true);
                    setBusy(false);
                    return;
                }

                if (!response.ok || !result.ok) throw new Error(result.message || String(response.status));

                form.hidden = true;
                if (success) {
                    success.hidden = false;
                    success.focus();
                }
            } catch (error) {
                const phone = document.querySelector('.quote__channel-link[href^="tel:"]')?.textContent;
                announce(
                    error.message && !/^\d+$/.test(error.message) ? error.message : `We couldn’t send your enquiry. Please try again${phone ? ` or call us on ${phone}` : ''}.`,
                    50,
                    true
                );
                setBusy(false);
            }
        },
        { signal }
    );
});
