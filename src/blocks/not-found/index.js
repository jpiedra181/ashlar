import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import { blockIcon } from '../../components/block-icons';

registerBlockType(metadata.name, {
    icon: blockIcon('section'),
    edit: Edit,
    save: () => null,
});
