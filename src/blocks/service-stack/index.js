import { registerBlockType, createBlock } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import save from './save';
import { blockIcon } from '../../components/block-icons';
import { exampleImage } from '../../components/editor-assets';

registerBlockType(metadata.name, {
    icon: blockIcon('service-stack'),
    edit: Edit,
    save,
    transforms: {
        // Varios Service seleccionados → Transformar en «Pinned services»
        from: [
            {
                type: 'block',
                isMultiBlock: true,
                blocks: ['ashlar/service'],
                transform: (services) => createBlock(metadata.name, {}, services.map((attributes) => createBlock('ashlar/service', attributes))),
            },
        ],
        // «Desagrupar»: los servicios vuelven a la página, uno tras otro
        ungroup: (attributes, innerBlocks) => innerBlocks,
    },
    example: {
        ...metadata.example,
        innerBlocks: [
            {
                name: 'ashlar/service',
                attributes: { image: { ...exampleImage('photos/elm-row-after.jpg'), width: 1200, height: 896 } },
            },
        ],
    },
});
