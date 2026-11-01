import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ExternalLink } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';

/**
 * Edit de la Barra inferior del pie.
 *
 * El texto legal vive en Opciones → Pie de página; la vista previa sale del
 * mismo render.php que el front.
 */
export default function Edit() {
    const blockProps = useBlockProps();

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Settings', 'ashlar')} initialOpen>
                    <p>{__('The legal line is edited in Options → Footer. {year} is replaced with the current year.', 'ashlar')}</p>
                    {window.ashlarSettingsUrl && (
                        <p>
                            <ExternalLink href={window.ashlarSettingsUrl}>
                                {__('Open Options', 'ashlar')}
                            </ExternalLink>
                        </p>
                    )}
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <ServerSideRender block="ashlar/footer-bottom" />
            </div>
        </>
    );
}
