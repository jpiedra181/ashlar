import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl, Disabled } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';
import metadata from './block.json';
import { blockIcon } from '../../components/block-icons';

/**
 * Cabecera del proyecto: vista previa real del proyecto que se edita (en el
 * editor de plantillas, del primero de la lista). Todo sale de la ficha.
 */
function Edit({ attributes, setAttributes, context }) {
    const { showPosition, positionFormat, projectsLabel } = attributes;

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Header', 'ashlar')} initialOpen>
                    <p>{__('Title, type of job, area, year and summary come from the project itself (Project details panel).', 'ashlar')}</p>
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('First link of the breadcrumb', 'ashlar')} value={projectsLabel} onChange={(value) => setAttributes({ projectsLabel: value })} />
                    <ToggleControl __nextHasNoMarginBottom label={__('Show the project number', 'ashlar')} checked={showPosition} onChange={(value) => setAttributes({ showPosition: value })} />
                    {showPosition && (
                        <TextControl
                            __nextHasNoMarginBottom
                            __next40pxDefaultSize
                            label={__('Project number text', 'ashlar')}
                            help={__('{n} is its number (oldest first) and {total} how many there are.', 'ashlar')}
                            value={positionFormat}
                            onChange={(value) => setAttributes({ positionFormat: value })}
                        />
                    )}
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
    icon: blockIcon('hero'),
    edit: Edit,
});
