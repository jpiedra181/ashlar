import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import save from './save';
import { blockIcon } from '../../components/block-icons';

registerBlockType(metadata.name, {
    icon: blockIcon('story'),
    edit: Edit,
    save,
    example: metadata.example,
});
