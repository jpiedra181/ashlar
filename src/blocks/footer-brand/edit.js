import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ExternalLink } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';

/**
 * Edit de la Marca del pie. La frase vive en Options → Footer; la vista previa
 * sale del mismo render.php que el front.
 */
export default function Edit() {
    const blockProps = useBlockProps();

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Settings', 'ashlar')} initialOpen>
                    <p>{__('The sentence is edited in Options → Footer.', 'ashlar')}</p>
                    {window.ashlarSettingsUrl && (
                        <p>
                            <ExternalLink href={window.ashlarSettingsUrl}>{__('Open Options', 'ashlar')}</ExternalLink>
                        </p>
                    )}
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <ServerSideRender block="ashlar/footer-brand" />
            </div>
        </>
    );
}
