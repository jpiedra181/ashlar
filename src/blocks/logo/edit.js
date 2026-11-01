import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';

/**
 * Edit del bloque Logotipo.
 *
 * El nombre sale de Ajustes → Generales (o la imagen de Identidad del sitio);
 * no hay nada que elegir. La vista previa es el mismo render.php del front.
 */
export default function Edit() {
    const blockProps = useBlockProps();

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Settings', 'ashlar')} initialOpen>
                    <p>{__('The text is the site name (Settings → General). Upload an image in Site Identity to replace it.', 'ashlar')}</p>
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <ServerSideRender block="ashlar/logo" />
            </div>
        </>
    );
}
