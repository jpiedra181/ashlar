import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, TextControl, ToggleControl, Disabled } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';

/**
 * Edit de «Journal articles»: vista previa real (ServerSideRender). Los
 * artículos se escriben en el menú Journal; aquí solo se ajustan los rótulos
 * y cuántos se ven.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { showFilters, showCounts, showFeatured, perPage, step } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const text = (key, label, help) => <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={label} help={help} value={attributes[key]} onChange={set(key)} />;

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Articles', 'ashlar')} initialOpen>
                    <p>{__('The list fills itself with every published article, newest first. Write them in the Journal menu; the short answer of each card is the article’s excerpt.', 'ashlar')}</p>
                    <RangeControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Shown at first', 'ashlar')} value={perPage} onChange={(value) => setAttributes({ perPage: value ?? 7 })} min={3} max={30} />
                    <RangeControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Added by “Load more”', 'ashlar')} value={step} onChange={(value) => setAttributes({ step: value ?? 6 })} min={3} max={30} />
                </PanelBody>
                <PanelBody title={__('Latest article', 'ashlar')} initialOpen={false}>
                    <ToggleControl __nextHasNoMarginBottom label={__('Show the latest article in large', 'ashlar')} help={__('Only when no topic is selected.', 'ashlar')} checked={showFeatured} onChange={set('showFeatured')} />
                    {showFeatured && (
                        <>
                            {text('featuredTag', __('Label on the photo', 'ashlar'))}
                            {text('answerLabel', __('Short answer label', 'ashlar'))}
                            {text('featuredButton', __('Button', 'ashlar'))}
                        </>
                    )}
                </PanelBody>
                <PanelBody title={__('Topic filters', 'ashlar')} initialOpen={false}>
                    <ToggleControl __nextHasNoMarginBottom label={__('Show the topic filters', 'ashlar')} help={__('One button per topic (Journal → Topics).', 'ashlar')} checked={showFilters} onChange={set('showFilters')} />
                    <ToggleControl __nextHasNoMarginBottom label={__('Show how many articles each one has', 'ashlar')} checked={showCounts} onChange={set('showCounts')} />
                    {text('allLabel', __('“All” button', 'ashlar'))}
                    {text('filtersLabel', __('Name of the filters (screen readers)', 'ashlar'))}
                </PanelBody>
                <PanelBody title={__('Small print', 'ashlar')} initialOpen={false}>
                    {text('showingFormat', __('Counter', 'ashlar'), __('{shown} and {total} are replaced with the numbers.', 'ashlar'))}
                    {text('moreFormat', __('“Load more” button', 'ashlar'), __('{n} is how many more will appear.', 'ashlar'))}
                    {text('emptyText', __('When a topic has no articles', 'ashlar'))}
                </PanelBody>
            </InspectorControls>

            <div {...useBlockProps()}>
                <Disabled>
                    <ServerSideRender block="ashlar/journal-grid" attributes={attributes} />
                </Disabled>
            </div>
        </>
    );
}
