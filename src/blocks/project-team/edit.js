import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import Chapter from '../../components/chapter';
import Media, { MediaPlaceholder } from '../../components/media';
import MediaField from '../../components/media-field';
import SectionTheme, { themeClass } from '../../components/section-theme';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';

/**
 * Edit de «Who built it».
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, chapterNum, chapterLabel, title, people, credits } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const setPeople = (next) => setAttributes({ people: next });
    const field = (index, key, tagName, className, placeholder) => (
        <RichText tagName={tagName} className={className} value={people[index][key]} onChange={(value) => setPeople(updateItem(people, index, { [key]: value }))} allowedFormats={[]} placeholder={placeholder} />
    );

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                </PanelBody>
                <PanelBody title={__('Photos', 'ashlar')} initialOpen={false}>
                    {people.map((person, index) => (
                        <MediaField key={index} label={(person.name || `${__('Person', 'ashlar')} ${index + 1}`).replace(/<[^>]+>/g, '')} value={person.image} onChange={(image) => setPeople(updateItem(people, index, { image }))} focal />
                    ))}
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: ['project-team', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
                <div className="project-team__inner wrap">
                    <div className="project-team__heading">
                        <Chapter edit num={chapterNum} label={chapterLabel} onChange={({ num, label }) => setAttributes({ ...(num !== undefined && { chapterNum: num }), ...(label !== undefined && { chapterLabel: label }) })} />
                        <RichText tagName="h2" className="project-team__title" value={title} onChange={set('title')} allowedFormats={[]} placeholder={__('Section headline', 'ashlar')} />
                    </div>
                    <ul className="project-team__list">
                        {people.map((person, index) => (
                            <li className="project-team__person ashlar-item" key={index}>
                                <ItemActions index={index} count={people.length} min={0} label={__('Person', 'ashlar')} onMove={(from, to) => setPeople(moveItem(people, from, to))} onRemove={(i) => setPeople(removeItem(people, i))} />
                                <Media image={person.image} className="project-team__photo">
                                    <MediaPlaceholder image={person.image} onChange={(image) => setPeople(updateItem(people, index, { image }))} label={__('Photo', 'ashlar')} />
                                </Media>
                                <div className="project-team__info">
                                    {field(index, 'role', 'p', 'project-team__role', __('Role', 'ashlar'))}
                                    {field(index, 'name', 'h3', 'project-team__name', __('Name', 'ashlar'))}
                                    {field(index, 'note', 'p', 'project-team__note', __('What they did on this job', 'ashlar'))}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <AddItem label={__('Add person', 'ashlar')} count={people.length} max={6} onClick={() => setPeople([...people, { image: {}, role: '', name: '', note: '' }])} />
                    <RichText tagName="p" className="project-team__credits" value={credits} onChange={set('credits')} allowedFormats={[]} placeholder={__('Other firms on the job (optional)', 'ashlar')} />
                </div>
            </section>
        </>
    );
}
