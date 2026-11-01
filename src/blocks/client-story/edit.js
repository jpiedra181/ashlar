import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import Chapter from '../../components/chapter';
import Media, { MediaPlaceholder } from '../../components/media';
import MediaField from '../../components/media-field';
import LinkField from '../../components/link-field';
import SectionTheme, { themeClass } from '../../components/section-theme';
import { Arrow } from '../../components/icons';
import { PlayIcon } from './save';

/**
 * Edit de «In their words».
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, layout, image, videoLabel, videoUrl, chapterNum, chapterLabel, quote, name, project, linkLabel, linkUrl } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                    <ToggleControl
                        __nextHasNoMarginBottom
                        label={__('Photo to the edge of the screen', 'ashlar')}
                        help={__('The photo fills the left side, top to bottom (as on the project pages).', 'ashlar')}
                        checked={layout === 'bleed'}
                        onChange={(value) => setAttributes({ layout: value ? 'bleed' : 'framed' })}
                    />
                </PanelBody>
                <PanelBody title={__('Photo', 'ashlar')} initialOpen>
                    <MediaField label={__('Client photo', 'ashlar')} value={image} onChange={set('image')} focal />
                </PanelBody>
                <PanelBody title={__('Links', 'ashlar')} initialOpen={false}>
                    <LinkField label={__('Video link', 'ashlar')} value={videoUrl} onChange={set('videoUrl')} help={__('The “Watch their story” label only shows on the site when there is a video link.', 'ashlar')} />
                    <LinkField label={__('More stories link', 'ashlar')} value={linkUrl} onChange={set('linkUrl')} />
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: ['client-story', layout === 'bleed' ? 'client-story--bleed' : 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
                <div className="client-story__inner wrap">
                    <div className="client-story__visual">
                        <Media image={image} className="client-story__media">
                            <MediaPlaceholder image={image} onChange={set('image')} />
                        </Media>
                        <span className={['client-story__video', !videoUrl && 'is-inactive'].filter(Boolean).join(' ')}>
                            <PlayIcon />
                            <RichText tagName="span" value={videoLabel} onChange={set('videoLabel')} allowedFormats={[]} placeholder={__('Video label (optional)', 'ashlar')} />
                        </span>
                    </div>

                    <figure className="client-story__body">
                        <Chapter edit num={chapterNum} label={chapterLabel} onChange={({ num, label }) => setAttributes({ ...(num !== undefined && { chapterNum: num }), ...(label !== undefined && { chapterLabel: label }) })} />
                        <blockquote className="client-story__quote">
                            <RichText tagName="p" value={quote} onChange={set('quote')} allowedFormats={[]} placeholder={__('“What the client said, in their words.”', 'ashlar')} />
                        </blockquote>
                        <figcaption className="client-story__caption">
                            <RichText tagName="span" className="client-story__name" value={name} onChange={set('name')} allowedFormats={[]} placeholder={__('Client names', 'ashlar')} />
                            <RichText tagName="span" className="client-story__project" value={project} onChange={set('project')} allowedFormats={[]} placeholder={__('Street · Type of job · Year', 'ashlar')} />
                        </figcaption>
                        <p className="client-story__more">
                            <span className="link">
                                <RichText tagName="span" value={linkLabel} onChange={set('linkLabel')} allowedFormats={[]} placeholder={__('Link (optional)', 'ashlar')} />
                                <Arrow />
                            </span>
                        </p>
                    </figure>
                </div>
            </section>
        </>
    );
}
