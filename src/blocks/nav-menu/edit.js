import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl, ToggleControl } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';

/**
 * Edit del bloque Menú.
 *
 * No hay nada que editar en línea a propósito: los enlaces viven en Apariencia
 * → Menús, así que desde aquí solo se elige QUÉ menú va en esta columna y,
 * si hace falta, un título distinto del nombre del menú. La vista previa sale del mismo render.php que
 * el front, vía ServerSideRender.
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
                        help={__(
                            'Links and the name of each location are managed in Appearance → Menus.',
                            'ashlar'
                        )}
                        value={attributes.location}
                        options={options}
                        onChange={(value) => setAttributes({ location: value })}
                    />
                    <TextControl
                        label={__('Title', 'ashlar')}
                        help={__(
                            'Leave it empty to use the name of the menu assigned to this location.',
                            'ashlar'
                        )}
                        value={attributes.title}
                        onChange={(value) => setAttributes({ title: value })}
                    />
                    <ToggleControl
                        label={__('Show title', 'ashlar')}
                        checked={attributes.showTitle !== false}
                        onChange={(value) => setAttributes({ showTitle: value })}
                    />
                    <TextControl
                        label={__('Accessible label', 'ashlar')}
                        help={__(
                            'Name announced by screen readers. Leave it empty to use the menu name.',
                            'ashlar'
                        )}
                        value={attributes.ariaLabel}
                        onChange={(value) => setAttributes({ ariaLabel: value })}
                    />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <ServerSideRender
                    block="ashlar/nav-menu"
                    attributes={attributes}
                />
            </div>
        </>
    );
}
