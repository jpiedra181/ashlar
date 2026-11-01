import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import save from './save';
import { blockIcon } from '../../components/block-icons';
import { exampleImage } from '../../components/editor-assets';

registerBlockType(metadata.name, {
    icon: blockIcon('service'),
    edit: Edit,
    save,
    example: {
        ...metadata.example,
        attributes: {
            image: { ...exampleImage('photos/elm-row-after.jpg'), width: 1200, height: 896 },
        },
    },
});
