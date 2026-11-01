import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import save from './save';
import { blockIcon } from '../../components/block-icons';
import { exampleImage } from '../../components/editor-assets';

registerBlockType(metadata.name, {
    icon: blockIcon('report'),
    edit: Edit,
    save,
    example: {
        ...metadata.example,
        attributes: {
            image: { ...exampleImage('photos/process-steel.jpg'), width: 1200, height: 896 },
            avatar: { ...exampleImage('photos/team-dan.jpg', { x: 0.6, y: 0.3 }), width: 928, height: 1152 },
        },
    },
});
