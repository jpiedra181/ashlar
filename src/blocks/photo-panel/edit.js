import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import {
    PanelBody,
    SelectControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import Button from '../../components/button';
import { BUTTON_VARIANT_OPTIONS } from '../../components/button/variants';
import Media, { MediaPlaceholder } from '../../components/media';
import MediaField from '../../components/media-field';
import LinkField from '../../components/link-field';
import SectionTheme from '../../components/section-theme';
import { panelClass } from './save';

/**
 * Edit de «Photo and panel».
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, imagePosition, image, eyebrow, title, text, buttonLabel, buttonUrl, buttonVariant, note } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                    <ToggleGroupControl __nextHasNoMarginBottom __next40pxDefaultSize isBlock label={__('Photo position', 'ashlar')} help={__('On mobile the photo always sits on top.', 'ashlar')} value={imagePosition} onChange={set('imagePosition')}>
                        <ToggleGroupControlOption value="left" label={__('Left', 'ashlar')} />
                        <ToggleGroupControlOption value="right" label={__('Right', 'ashlar')} />
                    </ToggleGroupControl>
                </PanelBody>
                <PanelBody title={__('Photo', 'ashlar')} initialOpen={false}>
                    <MediaField label={__('Photo', 'ashlar')} value={image} onChange={set('image')} focal />
                </PanelBody>
                <PanelBody title={__('Button', 'ashlar')} initialOpen={false}>
                    <LinkField label={__('Button link', 'ashlar')} value={buttonUrl} onChange={set('buttonUrl')} help={__('Leave the button text empty to remove it.', 'ashlar')} />
                    <SelectControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Button style', 'ashlar')} value={buttonVariant} options={BUTTON_VARIANT_OPTIONS} onChange={set('buttonVariant')} />
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: panelClass(attributes) })}>
                <Media image={image} className="photo-panel__media">
                    <MediaPlaceholder image={image} onChange={set('image')} />
                </Media>
                <div className="photo-panel__panel">
                    <div className="photo-panel__heading">
                        <RichText tagName="p" className="photo-panel__eyebrow" value={eyebrow} onChange={set('eyebrow')} allowedFormats={[]} placeholder={__('Label', 'ashlar')} />
                        <RichText tagName="h2" className="photo-panel__title" value={title} onChange={set('title')} allowedFormats={[]} placeholder={__('Headline', 'ashlar')} />
                    </div>
                    <RichText tagName="p" className="photo-panel__text" value={text} onChange={set('text')} allowedFormats={[]} placeholder={__('A short text (optional)', 'ashlar')} />
                    <div className="photo-panel__actions">
                        <Button variant={buttonVariant} className="photo-panel__button">
                            <RichText tagName="span" value={buttonLabel} onChange={set('buttonLabel')} allowedFormats={[]} placeholder={__('Button (optional)', 'ashlar')} />
                        </Button>
                        <RichText tagName="p" className="photo-panel__note" value={note} onChange={set('note')} allowedFormats={[]} placeholder={__('Note beside the button (optional)', 'ashlar')} />
                    </div>
                </div>
            </section>
        </>
    );
}
