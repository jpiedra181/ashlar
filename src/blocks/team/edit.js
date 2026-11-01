import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import Media, { MediaPlaceholder } from '../../components/media';
import MediaField from '../../components/media-field';
import SectionTheme from '../../components/section-theme';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';
import { teamClass } from './save';

/**
 * Edit del equipo.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, eyebrow, title, lede, people, moreTitle, moreText, roles } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const setPeople = (next) => setAttributes({ people: next });
    const setRoles = (next) => setAttributes({ roles: next });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                    <p className="components-base-control__help">{__('Leave the “+ more” title empty to remove that card.', 'ashlar')}</p>
                </PanelBody>
                <PanelBody title={__('Portraits', 'ashlar')} initialOpen={false}>
                    {people.map((person, index) => (
                        <MediaField key={index} label={person.name || __('Person', 'ashlar')} value={person.image} onChange={(image) => setPeople(updateItem(people, index, { image }))} focal />
                    ))}
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: teamClass(attributes) })}>
                <div className="team__inner wrap">
                    <header className="team__head">
                        <div className="team__heading">
                            <RichText tagName="p" className="team__eyebrow" value={eyebrow} onChange={set('eyebrow')} allowedFormats={[]} placeholder={__('Label', 'ashlar')} />
                            <RichText tagName="h2" className="team__title" value={title} onChange={set('title')} allowedFormats={[]} placeholder={__('Section headline', 'ashlar')} />
                        </div>
                        <RichText tagName="p" className="team__lede" value={lede} onChange={set('lede')} allowedFormats={[]} placeholder={__('Short introduction (optional)', 'ashlar')} />
                    </header>

                    <div className="team__grid">
                        <ul className="team__people">
                            {people.map((person, index) => (
                                <li className="team__person ashlar-item" key={index}>
                                    <ItemActions index={index} count={people.length} label={__('Person', 'ashlar')} onMove={(from, to) => setPeople(moveItem(people, from, to))} onRemove={(i) => setPeople(removeItem(people, i))} />
                                    <Media image={person.image} className="team__portrait">
                                        <MediaPlaceholder image={person.image} onChange={(image) => setPeople(updateItem(people, index, { image }))} label={__('Choose portrait', 'ashlar')} />
                                    </Media>
                                    <div className="team__meta">
                                        <RichText tagName="h3" className="team__name" value={person.name} onChange={(name) => setPeople(updateItem(people, index, { name }))} allowedFormats={[]} placeholder={__('Name', 'ashlar')} />
                                        <RichText tagName="p" className="team__role" value={person.role} onChange={(role) => setPeople(updateItem(people, index, { role }))} allowedFormats={[]} placeholder={__('Role · years', 'ashlar')} />
                                        <RichText tagName="p" className="team__fact" value={person.fact} onChange={(fact) => setPeople(updateItem(people, index, { fact }))} allowedFormats={[]} placeholder={__('One line about them', 'ashlar')} />
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="team__more">
                            <RichText tagName="p" className="team__more-title" value={moreTitle} onChange={set('moreTitle')} allowedFormats={[]} placeholder={__('+ 21 more (optional)', 'ashlar')} />
                            <RichText tagName="p" className="team__more-text" value={moreText} onChange={set('moreText')} allowedFormats={[]} placeholder={__('A line about the rest of the team', 'ashlar')} />
                            <ul className="team__roles">
                                {roles.map((role, index) => (
                                    <li className="ashlar-item" key={index}>
                                        <ItemActions index={index} count={roles.length} min={0} label={__('Trade', 'ashlar')} onMove={(from, to) => setRoles(moveItem(roles, from, to))} onRemove={(i) => setRoles(removeItem(roles, i))} />
                                        <RichText tagName="span" className="team__trade" value={role.label} onChange={(label) => setRoles(updateItem(roles, index, { label }))} allowedFormats={[]} placeholder={__('Trade', 'ashlar')} />
                                        <RichText tagName="span" className="team__count" value={role.count} onChange={(count) => setRoles(updateItem(roles, index, { count }))} allowedFormats={[]} placeholder="0" />
                                    </li>
                                ))}
                            </ul>
                            <AddItem label={__('Add trade', 'ashlar')} count={roles.length} max={10} onClick={() => setRoles([...roles, { label: '', count: '' }])} />
                        </div>
                    </div>
                    <AddItem label={__('Add person', 'ashlar')} count={people.length} max={6} onClick={() => setPeople([...people, { image: {}, role: '', name: '', fact: '' }])} />
                </div>
            </section>
        </>
    );
}
