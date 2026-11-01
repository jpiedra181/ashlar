import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import Button from '../../components/button';
import { BUTTON_VARIANT_OPTIONS } from '../../components/button/variants';
import LinkField from '../../components/link-field';
import SectionTheme, { themeClass } from '../../components/section-theme';

/**
 * Edit de la franja de aviso.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, eyebrow, title, text, buttonLabel, buttonUrl, buttonVariant } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                </PanelBody>
                <PanelBody title={__('Button', 'ashlar')} initialOpen={false}>
                    <LinkField label={__('Button link', 'ashlar')} value={buttonUrl} onChange={set('buttonUrl')} help={__('Leave the button text empty to remove it.', 'ashlar')} />
                    <SelectControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Button style', 'ashlar')} value={buttonVariant} options={BUTTON_VARIANT_OPTIONS} onChange={set('buttonVariant')} />
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: ['callout', themeClass(theme)].filter(Boolean).join(' ') })}>
                <div className="callout__inner wrap">
                    <div className="callout__text">
                        <RichText tagName="p" className="callout__eyebrow" value={eyebrow} onChange={set('eyebrow')} allowedFormats={[]} placeholder={__('Label', 'ashlar')} />
                        <RichText tagName="h2" className="callout__title" value={title} onChange={set('title')} allowedFormats={[]} placeholder={__('One line', 'ashlar')} />
                        <RichText tagName="p" className="callout__detail" value={text} onChange={set('text')} allowedFormats={[]} placeholder={__('Detail (optional)', 'ashlar')} />
                    </div>
                    <Button variant={buttonVariant} className="callout__button">
                        <RichText tagName="span" value={buttonLabel} onChange={set('buttonLabel')} allowedFormats={[]} placeholder={__('Button (optional)', 'ashlar')} />
                    </Button>
                </div>
            </section>
        </>
    );
}
