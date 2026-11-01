import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { Disabled, PanelBody } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';

/**
 * Edit del Muro del pie. No tiene ajustes: el nombre grabado es el del sitio
 * (Ajustes → Generales); la vista previa sale del mismo render.php que el front.
 */
export default function Edit() {
    const blockProps = useBlockProps();

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Settings', 'ashlar')} initialOpen>
                    <p>{__('The name cut into the wall is the site title, from Settings → General.', 'ashlar')}</p>
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <Disabled>
                    <ServerSideRender block="ashlar/footer-wall" />
                </Disabled>
            </div>
        </>
    );
}
