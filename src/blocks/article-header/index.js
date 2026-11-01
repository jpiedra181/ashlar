import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, Disabled } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';
import metadata from './block.json';
import { blockIcon } from '../../components/block-icons';

/**
 * Cabecera del artículo: vista previa real. La pregunta es el título del
 * artículo y la respuesta corta, su extracto.
 */
function Edit({ attributes, setAttributes, context }) {
    const text = (key, label) => <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={label} value={attributes[key]} onChange={(value) => setAttributes({ [key]: value })} />;

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Article header', 'ashlar')} initialOpen>
                    {text('journalLabel', __('Journal link', 'ashlar'))}
                    {text('answerLabel', __('Short answer label', 'ashlar'))}
                    {text('breadcrumbLabel', __('Name of the breadcrumb (screen readers)', 'ashlar'))}
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
    icon: blockIcon('page-hero'),
    edit: Edit,
});
