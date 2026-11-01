import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, CheckboxControl, ExternalLink } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';

const FIELDS = [
    { value: 'address', label: __('Address', 'ashlar') },
    { value: 'hours', label: __('Opening hours', 'ashlar') },
    { value: 'email', label: __('Email', 'ashlar') },
    { value: 'phone', label: __('Phone', 'ashlar') },
];

/**
 * Edit del bloque Datos de contacto.
 *
 * Los valores viven en Opciones → Contacto para que el cliente los cambie en
 * un solo sitio; aquí solo se elige el título y QUÉ datos muestra la columna.
 * La vista previa sale del mismo render.php que el front.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps();
    const fields = attributes.fields || [];

    const toggle = (value, checked) => {
        const next = checked ? [...fields, value] : fields.filter((field) => field !== value);
        // Se conserva el orden canónico (dirección, horario, email, teléfono).
        setAttributes({ fields: FIELDS.map((f) => f.value).filter((f) => next.includes(f)) });
    };

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Settings', 'ashlar')} initialOpen>
                    <TextControl
                        label={__('Title', 'ashlar')}
                        value={attributes.title}
                        onChange={(value) => setAttributes({ title: value })}
                    />
                    <fieldset>
                        <legend style={{ marginBottom: '8px', fontWeight: 600 }}>
                            {__('Details shown', 'ashlar')}
                        </legend>
                        {FIELDS.map((field) => (
                            <CheckboxControl
                                key={field.value}
                                label={field.label}
                                checked={fields.includes(field.value)}
                                onChange={(checked) => toggle(field.value, checked)}
                            />
                        ))}
                    </fieldset>
                    {window.ashlarSettingsUrl && (
                        <p>
                            <ExternalLink href={window.ashlarSettingsUrl}>
                                {__('Edit the details in Options → Contact', 'ashlar')}
                            </ExternalLink>
                        </p>
                    )}
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <ServerSideRender block="ashlar/site-contact" attributes={attributes} />
            </div>
        </>
    );
}
