import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';

const ALLOWED_BLOCKS = ['ashlar/service'];

// Al insertarlo: dos servicios, alternando tono y lado de la foto
const TEMPLATE = [['ashlar/service'], ['ashlar/service', { theme: 'light', imagePosition: 'right', number: '02 / 05' }]];

/**
 * Edit de «Pinned services». En el lienzo los servicios se ven uno tras otro,
 * como en móvil; el efecto fijo solo existe en la web.
 */
export default function Edit() {
    const innerBlocksProps = useInnerBlocksProps(useBlockProps({ className: 'service-stack' }), {
        allowedBlocks: ALLOWED_BLOCKS,
        template: TEMPLATE,
    });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('How it works', 'ashlar')} initialOpen>
                    <p>{__('On desktop this section stays on screen while visitors scroll and shows one service at a time: the next photo opens over the last one and its text slides in. It takes the background and photo side of the first service.', 'ashlar')}</p>
                    <p>{__('On phones, on screens too short to fit a service, and for visitors who prefer less motion, the services show one after another, as they do here.', 'ashlar')}</p>
                    <p className="components-base-control__help">{__('Add, reorder or remove services inside it. Links to a service’s HTML anchor (e.g. /services/#lofts) go straight to that service.', 'ashlar')}</p>
                </PanelBody>
            </InspectorControls>
            <div {...innerBlocksProps} />
        </>
    );
}
