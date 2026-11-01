import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, Disabled } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';
import metadata from './block.json';
import { blockIcon } from '../../components/block-icons';

/**
 * Franja de datos: vista previa real. Se rellena en el panel «Project
 * details»; la vista previa enseña los datos guardados (se actualiza al guardar).
 */
function Edit({ attributes, context }) {
    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Facts', 'ashlar')} initialOpen>
                    <p>{__('These numbers come from the Project details panel (Project tab). Empty ones are not shown. The preview updates when you save.', 'ashlar')}</p>
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
    icon: blockIcon('table'),
    edit: Edit,
});
