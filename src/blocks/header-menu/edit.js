import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl, ExternalLink } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';

/**
 * Edit del bloque Menú de cabecera.
 *
 * No hay nada que editar en línea a propósito: los enlaces viven en Apariencia
 * → Menús y el botón de llamada en Opciones → Cabecera. La vista previa sale
 * del mismo render.php que el front (vía ServerSideRender); en el editor no
 * corre el JS que abre el menú desplegable.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps();

    // Las ubicaciones se inyectan desde PHP (ver inc/menus.php) en vez de
    // duplicar aquí la lista: registrar una nueva en theme-setup.php basta para
    // que aparezca en este desplegable.
    const locations = window.ashlarNavMenuLocations || {};
    const options = Object.entries(locations).map(([value, label]) => ({
        value,
        label,
    }));

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Settings', 'ashlar')} initialOpen>
                    <SelectControl
                        label={__('Menu location', 'ashlar')}
                        help={__('Links are managed in Appearance → Menus.', 'ashlar')}
                        value={attributes.location}
                        options={options}
                        onChange={(value) => setAttributes({ location: value })}
                    />
                    <TextControl
                        label={__('Accessible label', 'ashlar')}
                        help={__(
                            'Name announced by screen readers for the navigation. Default: “Main”.',
                            'ashlar'
                        )}
                        value={attributes.ariaLabel}
                        onChange={(value) => setAttributes({ ariaLabel: value })}
                    />
                    {window.ashlarSettingsUrl && (
                        <p>
                            <ExternalLink href={window.ashlarSettingsUrl}>
                                {__('Button and contact details (Options)', 'ashlar')}
                            </ExternalLink>
                        </p>
                    )}
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <ServerSideRender block="ashlar/header-menu" attributes={attributes} />
            </div>
        </>
    );
}
