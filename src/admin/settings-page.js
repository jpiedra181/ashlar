/**
 * settings-page.js
 *
 * JS de la página Opciones (solo se carga en esa pantalla, ver inc/settings.php):
 *  - Pestañas por sección, accesibles con teclado, que recuerdan la última abierta.
 *  - Campos de imagen (una o varias) con la biblioteca de medios; en los de
 *    varias, las miniaturas se ordenan arrastrando.
 */

const TAB_KEY = 'ashlar-settings-tab';

function initTabs() {
    const tabs = [...document.querySelectorAll('.ashlar-settings__tab')];
    const panels = [...document.querySelectorAll('.ashlar-settings__panel')];
    if (!tabs.length) return;

    const select = (id, { focus = false } = {}) => {
        tabs.forEach((tab) => {
            const active = tab.dataset.section === id;
            tab.setAttribute('aria-selected', String(active));
            tab.tabIndex = active ? 0 : -1;
            if (active && focus) tab.focus();
        });
        panels.forEach((panel) => {
            panel.hidden = panel.dataset.section !== id;
        });
        try {
            sessionStorage.setItem(TAB_KEY, id);
        } catch {
            // Sin almacenamiento: no pasa nada, se abre la primera.
        }
    };

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => select(tab.dataset.section));
        tab.addEventListener('keydown', (event) => {
            const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
            if (!step) return;
            event.preventDefault();
            const next = tabs[(index + step + tabs.length) % tabs.length];
            select(next.dataset.section, { focus: true });
        });
    });

    let initial = tabs[0].dataset.section;
    try {
        const stored = sessionStorage.getItem(TAB_KEY);
        if (stored && tabs.some((tab) => tab.dataset.section === stored)) initial = stored;
    } catch {
        // Ídem.
    }
    select(initial);
}

function initMediaFields() {
    if (!window.wp?.media) return;

    document.querySelectorAll('.ashlar-media-field').forEach((field) => {
        const input = field.querySelector('input[type="hidden"]');
        const list = field.querySelector('.ashlar-media-field__list');
        const selectButton = field.querySelector('.ashlar-media-field__select');
        const multiple = field.dataset.multiple === '1';
        let frame;

        const sync = () => {
            input.value = [...list.children].map((item) => item.dataset.id).join(',');
        };

        const addItem = (attachment) => {
            const url = attachment.sizes?.medium?.url || attachment.url;
            const item = document.createElement('li');
            item.className = 'ashlar-media-field__item';
            item.dataset.id = attachment.id;

            const img = document.createElement('img');
            img.src = url;
            img.alt = '';

            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'ashlar-media-field__remove';
            remove.setAttribute('aria-label', 'Quitar imagen');
            remove.textContent = '×';

            item.append(img, remove);
            list.append(item);
        };

        selectButton.addEventListener('click', () => {
            if (!frame) {
                frame = window.wp.media({
                    title: multiple ? 'Elige las imágenes' : 'Elige una imagen',
                    button: { text: 'Usar' },
                    library: { type: 'image' },
                    multiple: multiple ? 'add' : false,
                });

                frame.on('select', () => {
                    const selection = frame.state().get('selection').toJSON();
                    if (!multiple) list.innerHTML = '';
                    const current = new Set([...list.children].map((item) => item.dataset.id));
                    selection
                        .filter((attachment) => !current.has(String(attachment.id)))
                        .forEach(addItem);
                    sync();
                });
            }
            frame.open();
        });

        list.addEventListener('click', (event) => {
            const remove = event.target.closest('.ashlar-media-field__remove');
            if (!remove) return;
            remove.closest('.ashlar-media-field__item').remove();
            sync();
        });

        if (multiple && window.jQuery?.fn?.sortable) {
            window.jQuery(list).sortable({
                items: '> .ashlar-media-field__item',
                tolerance: 'pointer',
                update: sync,
            });
        }
    });
}

function init() {
    initTabs();
    initMediaFields();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
