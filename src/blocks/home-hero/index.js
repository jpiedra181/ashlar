import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import save from './save';
import { blockIcon } from '../../components/block-icons';
import { exampleImage } from '../../components/editor-assets';

registerBlockType(metadata.name, {
    icon: blockIcon('hero'),
    edit: Edit,
    save,
    example: {
        ...metadata.example,
        attributes: {
            image: { ...exampleImage('photos/hero-mason.jpg', { x: 0.62, y: 0.5 }), width: 1376, height: 768 },
        },
    },
});
