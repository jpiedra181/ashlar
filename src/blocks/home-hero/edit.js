import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl, __experimentalNumberControl as NumberControl } from '@wordpress/components';
import Button from '../../components/button';
import Media, { MediaPlaceholder } from '../../components/media';
import MediaField from '../../components/media-field';
import LinkField from '../../components/link-field';
import Survey from './survey';
import SiteBoard from './site-board';

/**
 * Edit del hero de la portada. Los textos (también los del cartel de obra) se
 * escriben encima; la foto, los enlaces, las semanas de la obra y las cotas,
 * en el panel lateral.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { statement, image, headline, primaryLabel, primaryUrl, secondaryLabel, secondaryUrl, capacity, weekCurrent, weekTotal, weekFormat, survey, dimLabel, pointCode, pointLevel } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Photo', 'ashlar')} initialOpen>
                    <MediaField label={__('Site photo', 'ashlar')} value={image} onChange={set('image')} focal />
                </PanelBody>
                <PanelBody title={__('Buttons', 'ashlar')} initialOpen={false}>
                    <LinkField label={__('Main button link', 'ashlar')} value={primaryUrl} onChange={set('primaryUrl')} />
                    <LinkField label={__('Second button link', 'ashlar')} value={secondaryUrl} onChange={set('secondaryUrl')} help={__('Leave a button text empty to remove it.', 'ashlar')} />
                </PanelBody>
                <PanelBody title={__('Site board', 'ashlar')} initialOpen={false}>
                    <NumberControl __next40pxDefaultSize label={__('Current week', 'ashlar')} min={0} value={weekCurrent} onChange={(value) => setAttributes({ weekCurrent: parseInt(value, 10) || 0 })} />
                    <NumberControl __next40pxDefaultSize label={__('Total weeks', 'ashlar')} min={1} value={weekTotal} onChange={(value) => setAttributes({ weekTotal: parseInt(value, 10) || 1 })} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Week text', 'ashlar')} help={__('{current} and {total} are replaced with the weeks.', 'ashlar')} value={weekFormat} onChange={set('weekFormat')} />
                </PanelBody>
                <PanelBody title={__('Survey marks', 'ashlar')} initialOpen={false}>
                    <ToggleControl __nextHasNoMarginBottom label={__('Show survey marks on the photo', 'ashlar')} checked={survey} onChange={set('survey')} />
                    {survey && (
                        <>
                            <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Dimension label', 'ashlar')} value={dimLabel} onChange={set('dimLabel')} />
                            <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Survey point', 'ashlar')} value={pointCode} onChange={set('pointCode')} />
                            <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Level', 'ashlar')} value={pointLevel} onChange={set('pointLevel')} />
                        </>
                    )}
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: 'home-hero theme-dark' })}>
                <Media image={image} className="home-hero__media">
                    <MediaPlaceholder image={image} onChange={set('image')} />
                </Media>
                <span className="home-hero__scrim" aria-hidden="true" />
                {survey && <Survey dimLabel={dimLabel} pointCode={pointCode} pointLevel={pointLevel} />}

                <div className="home-hero__content wrap">
                    <div className="home-hero__main">
                        <RichText tagName="h1" className="home-hero__title" value={headline} onChange={set('headline')} allowedFormats={[]} placeholder={__('Headline (Shift + Enter for a new line)', 'ashlar')} />
                        <RichText tagName="p" className="home-hero__statement" value={statement} onChange={set('statement')} allowedFormats={[]} placeholder={__('Who you are, in one or two sentences', 'ashlar')} />
                        <div className="home-hero__actions">
                            <Button>
                                <RichText tagName="span" value={primaryLabel} onChange={set('primaryLabel')} allowedFormats={[]} placeholder={__('Main button', 'ashlar')} />
                            </Button>
                            <Button variant="outline" arrow={false}>
                                <RichText tagName="span" value={secondaryLabel} onChange={set('secondaryLabel')} allowedFormats={[]} placeholder={__('Second button', 'ashlar')} />
                            </Button>
                        </div>
                        <RichText tagName="p" className="home-hero__capacity" value={capacity} onChange={set('capacity')} allowedFormats={[]} placeholder={__('Availability, e.g. Next start: March 2027', 'ashlar')} />
                    </div>

                    <SiteBoard attributes={attributes} edit setAttributes={setAttributes} />
                </div>
            </section>
        </>
    );
}
