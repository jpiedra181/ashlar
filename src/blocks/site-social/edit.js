import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl, ExternalLink } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';

/**
 * Edit del bloque Redes sociales.
 *
 * Las direcciones viven en Opciones → Redes sociales para que el cliente las
 * cambie en un solo sitio; aquí solo se elige el título y el formato. La vista
 * previa sale del mismo render.php que el front.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps();

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Settings', 'ashlar')} initialOpen>
                    <TextControl
                        label={__('Title', 'ashlar')}
                        value={attributes.title}
                        onChange={(value) => setAttributes({ title: value })}
                    />
                    <SelectControl
                        label={__('Format', 'ashlar')}
                        value={attributes.variant}
                        options={[
                            { label: __('Text', 'ashlar'), value: 'text' },
                            { label: __('Icons', 'ashlar'), value: 'icons' },
                        ]}
                        onChange={(value) => setAttributes({ variant: value })}
                    />
                    <TextControl
                        label={__('Accessible label', 'ashlar')}
                        help={__('Name announced by screen readers for the list of networks.', 'ashlar')}
                        value={attributes.ariaLabel}
                        onChange={(value) => setAttributes({ ariaLabel: value })}
                    />
                    {window.ashlarSettingsUrl && (
                        <p>
                            <ExternalLink href={window.ashlarSettingsUrl}>
                                {__('Edit the addresses in Options → Social', 'ashlar')}
                            </ExternalLink>
                        </p>
                    )}
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <ServerSideRender block="ashlar/site-social" attributes={attributes} />
            </div>
        </>
    );
}
