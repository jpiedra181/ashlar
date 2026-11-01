import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, Disabled } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';
import metadata from './block.json';
import { blockIcon } from '../../components/block-icons';
import SectionTheme from '../../components/section-theme';

/**
 * «Keep reading»: vista previa real. Elige solo tres artículos, primero del
 * mismo tema y luego los más recientes.
 */
function Edit({ attributes, setAttributes, context }) {
    const { theme } = attributes;
    const text = (key, label) => <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={label} value={attributes[key]} onChange={(value) => setAttributes({ [key]: value })} />;

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Keep reading', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={(value) => setAttributes({ theme: value })} />
                    {text('title', __('Title', 'ashlar'))}
                    {text('linkLabel', __('Link to the Journal', 'ashlar'))}
                </PanelBody>
            </InspectorControls>
            <div {...useBlockProps()}>
                <Disabled>
                    <ServerSideRender block={metadata.name} attributes={attributes} urlQueryArgs={context.postId ? { post_id: context.postId } : {}} />
                </Disabled>
            </div>
        </>
    );
}

registerBlockType(metadata.name, {
    icon: blockIcon('next'),
    edit: Edit,
});
