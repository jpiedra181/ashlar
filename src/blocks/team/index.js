import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import save from './save';
import { blockIcon } from '../../components/block-icons';
import { exampleImage } from '../../components/editor-assets';

const portrait = (name) => ({ ...exampleImage(`photos/${name}.jpg`), width: 928, height: 1152 });

registerBlockType(metadata.name, {
    icon: blockIcon('team'),
    edit: Edit,
    save,
    example: {
        ...metadata.example,
        attributes: {
            people: metadata.attributes.people.default.map((person, index) => ({ ...person, image: portrait(['team-dan', 'team-marta', 'team-sean'][index]) })),
        },
    },
});
