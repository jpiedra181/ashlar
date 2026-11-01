/**
 * project-panel.js — panel «Project details» en el editor de Projects.
 *
 * Los datos de obra viven aquí, en campos claros, y los bloques de la ficha
 * (cabecera, franja de datos, tarjetas, destacado) los leen solos: resumen,
 * tipo de obra, año, m² antes y después, barrio, semanas, precio cerrado y
 * liquidación final (con su nota), arquitecto, jefe de obra y si sale en la
 * portada. Guarda en los meta registrados en inc/projects.php.
 */

import { __, sprintf } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel, store as editorStore } from '@wordpress/editor';
import { useSelect, dispatch, select } from '@wordpress/data';
import { store as preferencesStore } from '@wordpress/preferences';
import { useEntityProp, store as coreStore } from '@wordpress/core-data';
import {
    Button,
    TextControl,
    TextareaControl,
    ToggleControl,
    __experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import domReady from '@wordpress/dom-ready';
import './project-panel.scss';

const TYPE = 'project';

function useMeta() {
    const [meta = {}, setMeta] = useEntityProp('postType', TYPE, 'meta');
    const set = (key, value) => setMeta({ ...meta, [key]: value });
    return [meta, set];
}

/** Valores ya usados en otros proyectos (tipos, distritos): atajos para escribir siempre igual. */
function useUsedValues(key, current) {
    return useSelect(
        (sel) => {
            const projects = sel(coreStore).getEntityRecords('postType', TYPE, { per_page: 100, status: 'publish,draft', _fields: 'id,meta' }) || [];
            const values = projects.map((project) => project.meta?.[key]).filter(Boolean);
            return [...new Set(values)].filter((value) => value !== current);
        },
        [key, current]
    );
}

function Shortcuts({ values, onPick }) {
    if (!values.length) return null;
    return (
        <p className="ashlar-project-panel__chips">
            <span>{__('Used:', 'ashlar')}</span>
            {values.map((value) => (
                <Button key={value} size="small" variant="tertiary" onClick={() => onPick(value)}>
                    {value}
                </Button>
            ))}
        </p>
    );
}

const int = (value) => parseInt(String(value).replace(/[^0-9]/g, ''), 10) || 0;

function ProjectPanel() {
    const postType = useSelect((sel) => sel(editorStore).getCurrentPostType(), []);
    const [meta, setMeta] = useMeta();
    const [excerpt, setExcerpt] = useEntityProp('postType', TYPE, 'excerpt');
    const usedTypes = useUsedValues('_ashlar_type', meta._ashlar_type);
    const usedBoroughs = useUsedValues('_ashlar_borough', meta._ashlar_borough);

    if (postType !== TYPE) return null;

    const price = meta._ashlar_price || 0;
    const final = meta._ashlar_final || 0;
    const delta = price && final ? Math.round(((final - price) / price) * 1000) / 10 : null;

    return (
        <PluginDocumentSettingPanel name="ashlar-project" title={__('Project details', 'ashlar')} className="ashlar-project-panel">
            <p className="ashlar-project-panel__note">{__('Write the title as the street only (“Elm Row”): cards add the borough.', 'ashlar')}</p>
            <TextareaControl
                __nextHasNoMarginBottom
                label={__('Summary', 'ashlar')}
                help={__('One sentence about the job. It is the lead text of the project page and what Google shows.', 'ashlar')}
                value={excerpt || ''}
                onChange={setExcerpt}
                rows={3}
            />
            <TextControl
                __nextHasNoMarginBottom
                __next40pxDefaultSize
                label={__('Type of job', 'ashlar')}
                placeholder={__('Rear extension', 'ashlar')}
                value={meta._ashlar_type || ''}
                onChange={(value) => setMeta('_ashlar_type', value)}
            />
            <Shortcuts values={usedTypes} onPick={(value) => setMeta('_ashlar_type', value)} />
            <NumberControl __next40pxDefaultSize label={__('Year', 'ashlar')} min={1990} max={2100} value={meta._ashlar_year || ''} onChange={(value) => setMeta('_ashlar_year', int(value))} />
            <div className="ashlar-project-panel__row">
                <NumberControl __next40pxDefaultSize label={__('Area before (m²)', 'ashlar')} min={0} value={meta._ashlar_sqm_before || ''} onChange={(value) => setMeta('_ashlar_sqm_before', int(value))} />
                <NumberControl __next40pxDefaultSize label={__('Area after (m²)', 'ashlar')} min={0} value={meta._ashlar_sqm || ''} onChange={(value) => setMeta('_ashlar_sqm', int(value))} />
            </div>
            <TextControl
                __nextHasNoMarginBottom
                __next40pxDefaultSize
                label={__('Which area', 'ashlar')}
                placeholder={__('Ground floor', 'ashlar')}
                help={__('Leave “Area before” empty if it is a new space (it then shows only the final m²).', 'ashlar')}
                value={meta._ashlar_area_label || ''}
                onChange={(value) => setMeta('_ashlar_area_label', value)}
            />
            <div className="ashlar-project-panel__row">
                <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Borough', 'ashlar')} placeholder="Hackney" value={meta._ashlar_borough || ''} onChange={(value) => setMeta('_ashlar_borough', value)} />
                <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Postcode area', 'ashlar')} placeholder="NW3" value={meta._ashlar_postcode || ''} onChange={(value) => setMeta('_ashlar_postcode', value.toUpperCase())} />
            </div>
            <Shortcuts values={usedBoroughs} onPick={(value) => setMeta('_ashlar_borough', value)} />
            <div className="ashlar-project-panel__row">
                <NumberControl __next40pxDefaultSize label={__('Programme (weeks)', 'ashlar')} min={0} value={meta._ashlar_weeks || ''} onChange={(value) => setMeta('_ashlar_weeks', int(value))} />
                <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Note', 'ashlar')} placeholder={__('On schedule', 'ashlar')} value={meta._ashlar_schedule_note || ''} onChange={(value) => setMeta('_ashlar_schedule_note', value)} />
            </div>
            <div className="ashlar-project-panel__row">
                <NumberControl __next40pxDefaultSize label={__('Fixed price (£)', 'ashlar')} min={0} value={price || ''} onChange={(value) => setMeta('_ashlar_price', int(value))} />
                <NumberControl __next40pxDefaultSize label={__('Final account (£)', 'ashlar')} min={0} value={final || ''} onChange={(value) => setMeta('_ashlar_final', int(value))} />
            </div>
            <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Fixed price note', 'ashlar')} placeholder={__('Signed Feb 2025', 'ashlar')} value={meta._ashlar_price_note || ''} onChange={(value) => setMeta('_ashlar_price_note', value)} />
            {delta !== null && (
                <p className="ashlar-project-panel__note">
                    {Math.abs(delta) < 0.05
                        ? __('Shown as: “on fixed price”.', 'ashlar')
                        : sprintf(
                              /* translators: %s: deviation, e.g. +0.8%. */
                              __('Shown as: “%s on fixed price”.', 'ashlar'),
                              `${delta > 0 ? '+' : ''}${delta}%`
                          )}
                </p>
            )}
            <TextControl
                __nextHasNoMarginBottom
                __next40pxDefaultSize
                label={__('Why the final account changed', 'ashlar')}
                placeholder={__('one client change', 'ashlar')}
                value={meta._ashlar_final_note || ''}
                onChange={(value) => setMeta('_ashlar_final_note', value)}
            />
            <div className="ashlar-project-panel__row">
                <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Architect', 'ashlar')} value={meta._ashlar_architect || ''} onChange={(value) => setMeta('_ashlar_architect', value)} />
                <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Note', 'ashlar')} placeholder={__('Planning & drawings', 'ashlar')} value={meta._ashlar_architect_note || ''} onChange={(value) => setMeta('_ashlar_architect_note', value)} />
            </div>
            <div className="ashlar-project-panel__row">
                <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Site manager', 'ashlar')} value={meta._ashlar_manager || ''} onChange={(value) => setMeta('_ashlar_manager', value)} />
                <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Note', 'ashlar')} placeholder={__('With us since 2011', 'ashlar')} value={meta._ashlar_manager_note || ''} onChange={(value) => setMeta('_ashlar_manager_note', value)} />
            </div>
            <ToggleControl
                __nextHasNoMarginBottom
                label={__('Show on the home page', 'ashlar')}
                help={meta._ashlar_featured ? __('Appears in the “Selected work” carousel.', 'ashlar') : __('Only appears on the Projects page.', 'ashlar')}
                checked={Boolean(meta._ashlar_featured)}
                onChange={(value) => setMeta('_ashlar_featured', value)}
            />
            <p className="ashlar-project-panel__note">
                {sprintf(
                    /* translators: %s: name of the featured image panel. */
                    __('The main photo (card, featured project and next project) is chosen in “%s”; the category (for the Projects filters) in “Categories”.', 'ashlar'),
                    __('Main photo', 'ashlar')
                )}
            </p>
        </PluginDocumentSettingPanel>
    );
}

registerPlugin('ashlar-project-panel', { render: ProjectPanel });

// El resumen ya está en la ficha: fuera el panel «Extracto» duplicado.
// La ficha se abre sola la primera vez (luego se respeta si se cierra).
domReady(() => {
    const editor = dispatch(editorStore);
    editor.removeEditorPanel?.('post-excerpt');

    const panel = 'ashlar-project-panel/ashlar-project';
    const preferences = dispatch(preferencesStore);
    if (!select(preferencesStore).get('ashlar', 'projectPanelShown')) {
        if (!select(editorStore).isEditorPanelOpened(panel)) editor.toggleEditorPanelOpened(panel);
        preferences.set('ashlar', 'projectPanelShown', true);
    }
});
