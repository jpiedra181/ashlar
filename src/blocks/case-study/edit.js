import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import Button from '../../components/button';
import Media, { MediaPlaceholder } from '../../components/media';
import MediaField from '../../components/media-field';
import LinkField from '../../components/link-field';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';

/**
 * Edit del Caso destacado.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { image, eyebrow, title, summary, specs, buttonLabel, buttonUrl } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const setSpecs = (next) => setAttributes({ specs: next });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Photo', 'ashlar')} initialOpen>
                    <MediaField label={__('Project photo', 'ashlar')} value={image} onChange={set('image')} focal />
                </PanelBody>
                <PanelBody title={__('Button', 'ashlar')} initialOpen={false}>
                    <LinkField label={__('Button link', 'ashlar')} value={buttonUrl} onChange={set('buttonUrl')} help={__('Leave the button text empty to remove it.', 'ashlar')} />
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: 'case-study' })}>
                <Media image={image} className="case-study__media">
                    <MediaPlaceholder image={image} onChange={set('image')} />
                </Media>
                <div className="case-study__panel theme-dark">
                    <div className="case-study__heading">
                        <RichText tagName="p" className="case-study__eyebrow" value={eyebrow} onChange={set('eyebrow')} allowedFormats={[]} placeholder={__('Case study · …', 'ashlar')} />
                        <RichText tagName="h2" className="case-study__title" value={title} onChange={set('title')} allowedFormats={[]} placeholder={__('Project name', 'ashlar')} />
                    </div>
                    <RichText tagName="p" className="case-study__summary" value={summary} onChange={set('summary')} allowedFormats={[]} placeholder={__('What the job was, in two sentences', 'ashlar')} />
                    <dl className="case-study__specs">
                        {specs.map((spec, index) => (
                            <div className="case-study__spec ashlar-item" key={index}>
                                <ItemActions index={index} count={specs.length} min={0} label={__('Fact', 'ashlar')} onMove={(from, to) => setSpecs(moveItem(specs, from, to))} onRemove={(i) => setSpecs(removeItem(specs, i))} />
                                <RichText tagName="dt" value={spec.key} onChange={(value) => setSpecs(updateItem(specs, index, { key: value }))} allowedFormats={[]} placeholder={__('Fact', 'ashlar')} />
                                <RichText tagName="dd" value={spec.value} onChange={(value) => setSpecs(updateItem(specs, index, { value }))} allowedFormats={[]} placeholder={__('Value', 'ashlar')} />
                            </div>
                        ))}
                    </dl>
                    <AddItem label={__('Add fact', 'ashlar')} count={specs.length} max={8} onClick={() => setSpecs([...specs, { key: '', value: '' }])} />
                    <Button variant="outline">
                        <RichText tagName="span" value={buttonLabel} onChange={set('buttonLabel')} allowedFormats={[]} placeholder={__('Button (optional)', 'ashlar')} />
                    </Button>
                </div>
            </section>
        </>
    );
}
