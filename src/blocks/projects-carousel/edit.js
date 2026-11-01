import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, TextControl, ExternalLink } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';
import Button from '../../components/button';
import Chapter from '../../components/chapter';
import LinkField from '../../components/link-field';
import { Arrow } from '../../components/icons';
import SectionTheme, { themeClass } from '../../components/section-theme';

/**
 * Edit de «Selected work»: cabecera y tarjeta final se escriben encima; las
 * tarjetas de proyecto son la vista previa real (ServerSideRender) de los
 * proyectos destacados.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, chapterNum, chapterLabel, title, hint, prevLabel, nextLabel, trackLabel, endEyebrow, endCount, endText, endLabel, endUrl, limit } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const projectsUrl = window.ashlarEditor?.projects;

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                </PanelBody>
                <PanelBody title={__('Projects', 'ashlar')} initialOpen>
                    <RangeControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('How many to show', 'ashlar')} value={limit} onChange={(value) => setAttributes({ limit: value ?? 4 })} min={2} max={8} />
                    <p>{__('The carousel shows the projects with “Show on the home page” switched on, in the order of the Projects list.', 'ashlar')}</p>
                    {projectsUrl && <ExternalLink href={projectsUrl}>{__('Go to Projects', 'ashlar')}</ExternalLink>}
                </PanelBody>
                <PanelBody title={__('Last card', 'ashlar')} initialOpen={false}>
                    <LinkField label={__('Button link', 'ashlar')} value={endUrl} onChange={set('endUrl')} />
                </PanelBody>
                <PanelBody title={__('Accessibility', 'ashlar')} initialOpen={false}>
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Carousel name', 'ashlar')} value={trackLabel} onChange={set('trackLabel')} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('“Previous” button', 'ashlar')} value={prevLabel} onChange={set('prevLabel')} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('“Next” button', 'ashlar')} value={nextLabel} onChange={set('nextLabel')} />
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: ['carousel', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
                <header className="carousel__head wrap">
                    <div className="carousel__heading">
                        <Chapter edit num={chapterNum} label={chapterLabel} onChange={({ num, label }) => setAttributes({ ...(num !== undefined && { chapterNum: num }), ...(label !== undefined && { chapterLabel: label }) })} />
                        <RichText tagName="h2" className="carousel__title" value={title} onChange={set('title')} allowedFormats={[]} placeholder={__('Section headline', 'ashlar')} />
                    </div>
                    <div className="carousel__controls">
                        <RichText tagName="p" className="carousel__hint" value={hint} onChange={set('hint')} allowedFormats={[]} placeholder={__('Hint (optional)', 'ashlar')} />
                        <span className="carousel__btn" aria-hidden="true">
                            <Arrow direction="left" />
                        </span>
                        <span className="carousel__btn" aria-hidden="true">
                            <Arrow />
                        </span>
                    </div>
                </header>

                <div className="carousel__track">
                    <ServerSideRender block="ashlar/projects-carousel" attributes={{ limit, preview: 'cards' }} />
                    <div className="carousel__end theme-dark">
                        <div className="carousel__end-text">
                            <RichText tagName="p" className="carousel__end-eyebrow" value={endEyebrow} onChange={set('endEyebrow')} allowedFormats={[]} placeholder={__('Since 2009', 'ashlar')} />
                            <RichText tagName="p" className="carousel__end-count" value={endCount} onChange={set('endCount')} allowedFormats={[]} placeholder="118" />
                            <RichText tagName="p" className="carousel__end-desc" value={endText} onChange={set('endText')} allowedFormats={[]} placeholder={__('What the number means', 'ashlar')} />
                        </div>
                        <Button className="carousel__end-btn">
                            <RichText tagName="span" value={endLabel} onChange={set('endLabel')} allowedFormats={[]} placeholder={__('Button', 'ashlar')} />
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
