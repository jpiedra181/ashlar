import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, Disabled } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';
import metadata from './block.json';
import { blockIcon } from '../../components/block-icons';
import SectionTheme from '../../components/section-theme';

/**
 * Proyecto siguiente: vista previa real. El orden es el de la lista de
 * Projects («Order» en cada proyecto).
 */
function Edit({ attributes, setAttributes, context }) {
    const { theme, label, linkLabel } = attributes;

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Next project', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={(value) => setAttributes({ theme: value })} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Label', 'ashlar')} value={label} onChange={(value) => setAttributes({ label: value })} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Link text', 'ashlar')} value={linkLabel} onChange={(value) => setAttributes({ linkLabel: value })} />
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
