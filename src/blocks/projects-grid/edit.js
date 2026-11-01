import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, TextControl, ToggleControl, SelectControl, ExternalLink, Disabled } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import ServerSideRender from '@wordpress/server-side-render';

/**
 * Edit de «All projects»: vista previa real (ServerSideRender). Los proyectos
 * se crean y ordenan en el menú Projects; aquí solo se ajustan los rótulos,
 * cuántos se ven y qué proyecto sale en grande.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { showFilters, showCounts, showFeatured, featuredId, perPage, step } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const projectsUrl = window.ashlarEditor?.projects;
    const projects = useSelect((select) => select(coreStore).getEntityRecords('postType', 'project', { per_page: 100, status: 'publish', _fields: 'id,title' }) || [], []);
    const text = (key, label, help) => <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={label} help={help} value={attributes[key]} onChange={set(key)} />;

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Projects', 'ashlar')} initialOpen>
                    <p>{__('The grid fills itself with every published project. Create, edit and order them in the Projects menu.', 'ashlar')}</p>
                    {projectsUrl && <ExternalLink href={projectsUrl}>{__('Go to Projects', 'ashlar')}</ExternalLink>}
                    <RangeControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Shown at first', 'ashlar')} value={perPage} onChange={(value) => setAttributes({ perPage: value ?? 10 })} min={4} max={30} />
                    <RangeControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Added by “Load more”', 'ashlar')} value={step} onChange={(value) => setAttributes({ step: value ?? 12 })} min={3} max={30} />
                </PanelBody>
                <PanelBody title={__('Featured project', 'ashlar')} initialOpen={false}>
                    <ToggleControl __nextHasNoMarginBottom label={__('Show one project in large', 'ashlar')} help={__('Only when no filter is selected.', 'ashlar')} checked={showFeatured} onChange={set('showFeatured')} />
                    {showFeatured && (
                        <>
                            <SelectControl
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                                label={__('Which project', 'ashlar')}
                                value={String(featuredId)}
                                options={[{ label: __('The most recent', 'ashlar'), value: '0' }, ...projects.map((project) => ({ label: project.title?.rendered || `#${project.id}`, value: String(project.id) }))]}
                                onChange={(value) => setAttributes({ featuredId: Number(value) })}
                            />
                            {text('featuredTag', __('Label on the photo', 'ashlar'))}
                            {text('featuredButton', __('Button', 'ashlar'))}
                        </>
                    )}
                </PanelBody>
                <PanelBody title={__('Filters and sorting', 'ashlar')} initialOpen={false}>
                    <ToggleControl __nextHasNoMarginBottom label={__('Show the category filters', 'ashlar')} help={__('One button per category (Projects → Categories).', 'ashlar')} checked={showFilters} onChange={set('showFilters')} />
                    <ToggleControl __nextHasNoMarginBottom label={__('Show how many projects each one has', 'ashlar')} checked={showCounts} onChange={set('showCounts')} />
                    {text('allLabel', __('“All” button', 'ashlar'))}
                    {text('filtersLabel', __('Name of the filters (screen readers)', 'ashlar'))}
                    {text('sortLabel', __('Sort label', 'ashlar'))}
                    {text('newestLabel', __('Newest first', 'ashlar'))}
                    {text('oldestLabel', __('Oldest first', 'ashlar'))}
                </PanelBody>
                <PanelBody title={__('Small print', 'ashlar')} initialOpen={false}>
                    {text('showingFormat', __('Counter', 'ashlar'), __('{shown} and {total} are replaced with the numbers.', 'ashlar'))}
                    {text('moreFormat', __('“Load more” button', 'ashlar'), __('{n} is how many more will appear.', 'ashlar'))}
                    {text('emptyText', __('When a category has no projects', 'ashlar'))}
                </PanelBody>
            </InspectorControls>

            <div {...useBlockProps()}>
                <Disabled>
                    <ServerSideRender block="ashlar/projects-grid" attributes={attributes} />
                </Disabled>
            </div>
        </>
    );
}
