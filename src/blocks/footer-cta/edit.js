import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ExternalLink } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';

/**
 * Edit de la Llamada del pie.
 *
 * Los textos y el botón viven en Options → Footer; la vista previa sale del
 * mismo render.php que el front.
 */
export default function Edit() {
    const blockProps = useBlockProps();

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Settings', 'ashlar')} initialOpen>
                    <p>{__('The eyebrow, headline and button are edited in Options → Footer.', 'ashlar')}</p>
                    {window.ashlarSettingsUrl && (
                        <p>
                            <ExternalLink href={window.ashlarSettingsUrl}>{__('Open Options', 'ashlar')}</ExternalLink>
                        </p>
                    )}
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <ServerSideRender block="ashlar/footer-cta" />
            </div>
        </>
    );
}
