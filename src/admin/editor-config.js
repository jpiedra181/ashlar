/**
 * editor-config.js
 *
 * Se ejecuta dentro del editor de bloques (encolado en inc/gutenberg.php).
 * Ajustes CENTRALIZADOS que afectan a todos los bloques del tema sin tocar
 * cada uno:
 *
 *  0. Quita los formatos de texto que el tema no usa.
 *  1. Padding superior/inferior por sección con la escala de espaciado del tema.
 *  2. Guía de bienvenida propia y «¿Cómo quieres empezar?» en páginas nuevas
 *     (src/admin/editor/). Sustituyen a la guía genérica de WordPress.
 *  3. En los artículos del Journal, el extracto se presenta como lo que es:
 *     la respuesta corta (inc/journal.php).
 */

import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { InspectorControls, useSettings } from '@wordpress/block-editor';
import { hasBlockSupport } from '@wordpress/blocks';
import { PanelBody, SelectControl } from '@wordpress/components';
import { dispatch, select } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';
import { store as preferencesStore } from '@wordpress/preferences';
import { unregisterFormatType } from '@wordpress/rich-text';
import domReady from '@wordpress/dom-ready';
import { __ } from '@wordpress/i18n';
import { WelcomeGuide, WelcomeGuideMenuItem } from './editor/welcome-guide';
import { StarterChooser, StarterMenuItem } from './editor/starter-chooser';
import './editor-ui.scss';

// --------------------------------------------------
//  0. Quitar formatos de RichText que el tema no usa.
//     'core/code' se cuela aunque el campo tenga allowedFormats restringido:
//     su autoformato (escribir `texto` entre backticks, o pegar markdown)
//     NO respeta allowedFormats. Al des-registrar el formato desaparecen el
//     botón de la barra Y ese autoformato, en todo el editor.
// --------------------------------------------------

domReady(() => {
    ['core/code', 'core/keyboard'].forEach((format) => {
        unregisterFormatType(format);
    });
});

// --------------------------------------------------
//  1. Padding superior/inferior por bloque — DESPLEGABLE con la escala de
//     spacing del tema (como el selector de tamaños de fuente). Escribe en el
//     atributo nativo style.spacing.padding (WordPress lo aplica al bloque en
//     editor y front vía su soporte spacing, registrado en inc/blocks.php).
//     Aplica a TODOS los bloques del tema (ashlar/*).
// --------------------------------------------------

const SPACING_PREFIX = 'var:preset|spacing|';
const paddingSlug = (v) =>
    typeof v === 'string' && v.startsWith(SPACING_PREFIX) ? v.slice(SPACING_PREFIX.length) : '';

const withPaddingControls = createHigherOrderComponent(
    (BlockEdit) => (props) => {
        // Solo las secciones del tema (las piezas de cabecera y pie no tienen
        // el soporte de espaciado, ver inc/blocks.php).
        if (!props.name || props.name.indexOf('ashlar/') !== 0 || !hasBlockSupport(props.name, 'spacing')) {
            return <BlockEdit {...props} />;
        }
        const { attributes, setAttributes } = props;
        const [spacingSizes = []] = useSettings('spacing.spacingSizes');
        const padding = attributes.style?.spacing?.padding || {};

        const options = [
            { label: __('Default', 'ashlar'), value: '' },
            ...spacingSizes.map((s) => ({ label: s.name, value: s.slug })),
        ];

        const setPad = (side, slug) => {
            const nextPad = { ...padding };
            if (slug) nextPad[side] = `${SPACING_PREFIX}${slug}`;
            else delete nextPad[side];

            const nextSpacing = { ...(attributes.style?.spacing || {}) };
            if (Object.keys(nextPad).length) nextSpacing.padding = nextPad;
            else delete nextSpacing.padding;

            const nextStyle = { ...(attributes.style || {}) };
            if (Object.keys(nextSpacing).length) nextStyle.spacing = nextSpacing;
            else delete nextStyle.spacing;

            setAttributes({ style: Object.keys(nextStyle).length ? nextStyle : undefined });
        };

        return (
            <Fragment>
                <BlockEdit {...props} />
                <InspectorControls>
                    <PanelBody title={__('Block spacing', 'ashlar')} initialOpen={false}>
                        <SelectControl
                            label={__('Top padding', 'ashlar')}
                            value={paddingSlug(padding.top)}
                            options={options}
                            onChange={(v) => setPad('top', v)}
                        />
                        <SelectControl
                            label={__('Bottom padding', 'ashlar')}
                            value={paddingSlug(padding.bottom)}
                            options={options}
                            onChange={(v) => setPad('bottom', v)}
                        />
                    </PanelBody>
                </InspectorControls>
            </Fragment>
        );
    },
    'withPaddingControls'
);
addFilter('editor.BlockEdit', 'ashlar/block-padding', withPaddingControls);

// --------------------------------------------------
//  2. Guía de bienvenida y punto de partida de las páginas nuevas
// --------------------------------------------------

domReady(() => {
    // Fuera la guía genérica de WordPress: la nuestra habla de esta web.
    const preferences = dispatch(preferencesStore);
    preferences.set('core/edit-post', 'welcomeGuide', false);
    preferences.set('core/edit-post', 'welcomeGuideTemplate', false);
});

registerPlugin('ashlar-editor-experience', {
    render: () => (
        <>
            <WelcomeGuide />
            <WelcomeGuideMenuItem />
            <StarterChooser />
            <StarterMenuItem />
        </>
    ),
});

// --------------------------------------------------
//  3. Artículos del Journal: el extracto es la respuesta corta
//     Sale en las tarjetas y en el recuadro «The short answer» del artículo.
// --------------------------------------------------

const SHORT_ANSWER = {
    Excerpt: __('Short answer', 'ashlar'),
    'Add an excerpt…': __('Add the short answer…', 'ashlar'),
    'Edit excerpt': __('Edit the short answer', 'ashlar'),
    'Write an excerpt (optional)': __('The short answer, in one or two sentences', 'ashlar'),
};

addFilter('i18n.gettext', 'ashlar/short-answer', (translation, text) => {
    if (!SHORT_ANSWER[text] || select('core/editor')?.getCurrentPostType?.() !== 'post') {
        return translation;
    }
    return SHORT_ANSWER[text];
});
