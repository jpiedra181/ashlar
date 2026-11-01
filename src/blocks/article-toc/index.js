import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, Disabled } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';
import metadata from './block.json';
import { blockIcon } from '../../components/block-icons';

/**
 * Índice del artículo: vista previa real. Los apartados salen solos de los
 * encabezados (H2) del texto; el botón es el de la cabecera (Options → Header).
 */
function Edit({ attributes, setAttributes, context }) {
    const text = (key, label) => <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={label} value={attributes[key]} onChange={(value) => setAttributes({ [key]: value })} />;

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Contents', 'ashlar')} initialOpen>
                    <p>{__('One link per heading (H2) of the article. The button is the one in the header (Options → Header).', 'ashlar')}</p>
                    {text('title', __('Title', 'ashlar'))}
                    {text('ctaText', __('Text above the button', 'ashlar'))}
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
    icon: blockIcon('steps'),
    edit: Edit,
});
