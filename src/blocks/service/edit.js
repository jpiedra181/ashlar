import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import {
    PanelBody,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import Button from '../../components/button';
import Media, { MediaPlaceholder } from '../../components/media';
import MediaField from '../../components/media-field';
import LinkField from '../../components/link-field';
import SectionTheme from '../../components/section-theme';
import { Arrow } from '../../components/icons';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';
import { serviceClass } from './save';

/**
 * Edit de un servicio.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, imagePosition, image, number, title, summary, facts, includedLabel, included, noteLabel, note, buttonLabel, buttonUrl, linkLabel, linkUrl } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const setFacts = (next) => setAttributes({ facts: next });
    const setIncluded = (next) => setAttributes({ included: next });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                    <ToggleGroupControl __nextHasNoMarginBottom __next40pxDefaultSize isBlock label={__('Photo position', 'ashlar')} help={__('Alternate left and right down the page. On mobile the photo always sits on top.', 'ashlar')} value={imagePosition} onChange={set('imagePosition')}>
                        <ToggleGroupControlOption value="left" label={__('Left', 'ashlar')} />
                        <ToggleGroupControlOption value="right" label={__('Right', 'ashlar')} />
                    </ToggleGroupControl>
                    <p className="components-base-control__help">{__('To link straight to this service (e.g. /services/#lofts), fill in “HTML anchor” under Advanced.', 'ashlar')}</p>
                </PanelBody>
                <PanelBody title={__('Photo', 'ashlar')} initialOpen={false}>
                    <MediaField label={__('Photo of this kind of job', 'ashlar')} value={image} onChange={set('image')} focal />
                </PanelBody>
                <PanelBody title={__('Links', 'ashlar')} initialOpen={false}>
                    <LinkField label={__('Button link', 'ashlar')} value={buttonUrl} onChange={set('buttonUrl')} help={__('Usually the contact page. Leave the button text empty to remove it.', 'ashlar')} />
                    <LinkField label={__('Project link', 'ashlar')} value={linkUrl} onChange={set('linkUrl')} help={__('A project of this kind. Leave the link text empty to remove it.', 'ashlar')} />
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: serviceClass(attributes) })}>
                <div className="service__inner wrap">
                    <Media image={image} className="service__media">
                        <MediaPlaceholder image={image} onChange={set('image')} />
                    </Media>
                    <div className="service__content">
                        <header className="service__heading">
                            <RichText tagName="p" className="service__number" value={number} onChange={set('number')} allowedFormats={[]} placeholder={__('01 / 05', 'ashlar')} />
                            <RichText tagName="h2" className="service__title" value={title} onChange={set('title')} allowedFormats={[]} placeholder={__('Kind of job', 'ashlar')} />
                            <RichText tagName="p" className="service__summary" value={summary} onChange={set('summary')} allowedFormats={[]} placeholder={__('What it is, in a sentence or two', 'ashlar')} />
                        </header>

                        <dl className="service__facts">
                            {facts.map((fact, index) => (
                                <div className="service__fact ashlar-item" key={index}>
                                    <ItemActions index={index} count={facts.length} min={0} label={__('Fact', 'ashlar')} onMove={(from, to) => setFacts(moveItem(facts, from, to))} onRemove={(i) => setFacts(removeItem(facts, i))} />
                                    <RichText tagName="dt" value={fact.key} onChange={(value) => setFacts(updateItem(facts, index, { key: value }))} allowedFormats={[]} placeholder={__('Typical …', 'ashlar')} />
                                    <RichText tagName="dd" value={fact.value} onChange={(value) => setFacts(updateItem(facts, index, { value }))} allowedFormats={[]} placeholder={__('Value', 'ashlar')} />
                                </div>
                            ))}
                        </dl>
                        <AddItem label={__('Add fact', 'ashlar')} count={facts.length} max={3} onClick={() => setFacts([...facts, { key: '', value: '' }])} />

                        <div className="service__included">
                            <RichText tagName="h3" className="service__label" value={includedLabel} onChange={set('includedLabel')} allowedFormats={[]} placeholder={__('What’s included', 'ashlar')} />
                            <ul className="dash-list service__list">
                                {included.map((item, index) => (
                                    <li className="ashlar-item" key={index}>
                                        <ItemActions index={index} count={included.length} min={0} label={__('Item', 'ashlar')} onMove={(from, to) => setIncluded(moveItem(included, from, to))} onRemove={(i) => setIncluded(removeItem(included, i))} />
                                        <RichText tagName="span" value={item} onChange={(value) => setIncluded(included.map((current, i) => (i === index ? value : current)))} allowedFormats={[]} placeholder={__('Something that’s included', 'ashlar')} />
                                    </li>
                                ))}
                            </ul>
                            <AddItem label={__('Add item', 'ashlar')} count={included.length} max={8} onClick={() => setIncluded([...included, ''])} />
                        </div>

                        <div className="service__note">
                            <RichText tagName="p" className="service__note-label" value={noteLabel} onChange={set('noteLabel')} allowedFormats={[]} placeholder={__('Good to know', 'ashlar')} />
                            <RichText tagName="p" value={note} onChange={set('note')} allowedFormats={[]} placeholder={__('A useful tip (leave empty to remove the box)', 'ashlar')} />
                        </div>

                        <div className="service__actions">
                            <Button variant="secondary" className="service__button">
                                <RichText tagName="span" value={buttonLabel} onChange={set('buttonLabel')} allowedFormats={[]} placeholder={__('Button (optional)', 'ashlar')} />
                            </Button>
                            <span className="link service__link">
                                <RichText tagName="span" value={linkLabel} onChange={set('linkLabel')} allowedFormats={[]} placeholder={__('Project link (optional)', 'ashlar')} />
                                <Arrow />
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
