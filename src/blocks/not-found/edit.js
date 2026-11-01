import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, TextareaControl, ToggleControl, Disabled } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';
import LinkField from '../../components/link-field';
import { updateItem } from '../../components/repeater';

/**
 * Edit de «Page not found»: se edita en el panel lateral y la vista previa
 * sale del mismo render.php que el front. Solo vive en templates/404.html.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { tag, point, width, height, eyebrow, title, text, links, callText } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Message', 'ashlar')} initialOpen>
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Label', 'ashlar')} value={eyebrow} onChange={set('eyebrow')} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Headline', 'ashlar')} help={__('Use <br> for a line break.', 'ashlar')} value={title} onChange={set('title')} />
                    <TextareaControl __nextHasNoMarginBottom label={__('Text', 'ashlar')} value={text} onChange={set('text')} rows={3} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Before the phone number', 'ashlar')} help={__('The number comes from Options → Contact.', 'ashlar')} value={callText} onChange={set('callText')} />
                </PanelBody>
                <PanelBody title={__('Links', 'ashlar')} initialOpen={false}>
                    {links.map((link, index) => (
                        <fieldset key={index}>
                            <legend>{link.label || __('Link', 'ashlar')}</legend>
                            <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Text', 'ashlar')} value={link.label} onChange={(label) => setAttributes({ links: updateItem(links, index, { label }) })} />
                            <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Line under it', 'ashlar')} value={link.sub} onChange={(sub) => setAttributes({ links: updateItem(links, index, { sub }) })} />
                            <LinkField label={__('Link', 'ashlar')} value={link.url} onChange={(url) => setAttributes({ links: updateItem(links, index, { url }) })} />
                            <ToggleControl __nextHasNoMarginBottom label={__('Highlight in corten', 'ashlar')} checked={!!link.accent} onChange={(accent) => setAttributes({ links: updateItem(links, index, { accent }) })} />
                        </fieldset>
                    ))}
                </PanelBody>
                <PanelBody title={__('Plan drawing', 'ashlar')} initialOpen={false}>
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Tag on the room', 'ashlar')} value={tag} onChange={set('tag')} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Survey point', 'ashlar')} value={point} onChange={set('point')} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Width', 'ashlar')} value={width} onChange={set('width')} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Height', 'ashlar')} value={height} onChange={set('height')} />
                </PanelBody>
            </InspectorControls>

            <div {...useBlockProps()}>
                <Disabled>
                    <ServerSideRender block="ashlar/not-found" attributes={attributes} httpMethod="POST" />
                </Disabled>
            </div>
        </>
    );
}
