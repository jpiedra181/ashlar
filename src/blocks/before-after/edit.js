import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import Button from '../../components/button';
import Chapter from '../../components/chapter';
import { MediaPlaceholder } from '../../components/media';
import MediaField from '../../components/media-field';
import LinkField from '../../components/link-field';
import SectionTheme, { themeClass } from '../../components/section-theme';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';
import Compare from './compare';
import { changeNumber } from './save';

/**
 * Edit de Antes y después. En el lienzo las dos fotos se ven partidas al
 * 50 %; las fotos (con su texto alternativo) se eligen en el panel.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, chapterNum, chapterLabel, title, buttonLabel, buttonUrl, aside, before, after, sliderLabel, changes } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const setChanges = (next) => setAttributes({ changes: next });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                    <LinkField label={__('Button link', 'ashlar')} value={buttonUrl} onChange={set('buttonUrl')} help={__('Leave the button text empty to remove it.', 'ashlar')} />
                </PanelBody>
                <PanelBody title={__('Photos', 'ashlar')} initialOpen>
                    <MediaField label={__('Before', 'ashlar')} value={before} onChange={set('before')} focal />
                    <MediaField label={__('After', 'ashlar')} help={__('Taken from the same spot as the “before” photo, so the comparison lines up.', 'ashlar')} value={after} onChange={set('after')} focal />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Slider name for screen readers', 'ashlar')} value={sliderLabel} onChange={set('sliderLabel')} />
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: ['before-after', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
                <div className="before-after__inner wrap">
                    <header className="before-after__head">
                        <div className="before-after__heading">
                            <Chapter edit num={chapterNum} label={chapterLabel} onChange={({ num, label }) => setAttributes({ ...(num !== undefined && { chapterNum: num }), ...(label !== undefined && { chapterLabel: label }) })} />
                            <RichText tagName="h2" className="before-after__title" value={title} onChange={set('title')} allowedFormats={[]} placeholder={__('Section headline', 'ashlar')} />
                        </div>
                        <div className="before-after__action">
                            <Button variant="outline">
                                <RichText tagName="span" value={buttonLabel} onChange={set('buttonLabel')} allowedFormats={[]} placeholder={__('Button (optional)', 'ashlar')} />
                            </Button>
                            {!buttonLabel && <RichText tagName="p" className="before-after__aside" value={aside} onChange={set('aside')} allowedFormats={[]} placeholder={__('Or a short note, e.g. dates (optional)', 'ashlar')} />}
                        </div>
                    </header>

                    <Compare
                        attributes={attributes}
                        edit
                        onChange={setAttributes}
                        beforeSlot={<MediaPlaceholder image={before} onChange={set('before')} label={__('Choose “before” photo', 'ashlar')} />}
                        afterSlot={<MediaPlaceholder image={after} onChange={set('after')} label={__('Choose “after” photo', 'ashlar')} />}
                    />

                    <ol className="before-after__changes">
                        {changes.map((change, index) => (
                            <li className="before-after__change ashlar-item" key={index}>
                                <ItemActions index={index} count={changes.length} min={0} label={__('Note', 'ashlar')} onMove={(from, to) => setChanges(moveItem(changes, from, to))} onRemove={(i) => setChanges(removeItem(changes, i))} />
                                <span className="before-after__num" aria-hidden="true">
                                    {changeNumber(index)}
                                </span>
                                <RichText tagName="p" value={change.text} onChange={(value) => setChanges(updateItem(changes, index, { text: value }))} allowedFormats={[]} placeholder={__('What changed', 'ashlar')} />
                            </li>
                        ))}
                    </ol>
                    <AddItem label={__('Add note', 'ashlar')} count={changes.length} max={3} onClick={() => setChanges([...changes, { text: '' }])} />
                </div>
            </section>
        </>
    );
}
