import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import save from './save';
import { blockIcon } from '../../components/block-icons';
import { exampleImage } from '../../components/editor-assets';

registerBlockType(metadata.name, {
    icon: blockIcon('contact'),
    edit: Edit,
    save,
    example: {
        ...metadata.example,
        attributes: {
            portrait: { ...exampleImage('photos/team-marta.jpg', { x: 0.45, y: 0.4 }), width: 928, height: 1152 },
        },
    },
});
