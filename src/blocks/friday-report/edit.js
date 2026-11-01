import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import MediaField from '../../components/media-field';
import Chapter from '../../components/chapter';
import SectionTheme, { themeClass } from '../../components/section-theme';
import ReportDoc from './report-doc';

/**
 * Edit del parte del viernes. Todos los textos, también los del parte, se
 * escriben encima; el tono, las fotos y si va con retraso, en el panel.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, chapterNum, chapterLabel, title, lede, note, late, avatar, image } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                    <ToggleControl __nextHasNoMarginBottom label={__('Behind programme', 'ashlar')} help={__('Shows the status in corten instead of green. Change the status text too, e.g. “1 week behind”.', 'ashlar')} checked={late} onChange={set('late')} />
                </PanelBody>
                <PanelBody title={__('Photos', 'ashlar')} initialOpen={false}>
                    <MediaField label={__('Site photo', 'ashlar')} value={image} onChange={set('image')} focal />
                    <MediaField label={__('Portrait of who sends it', 'ashlar')} value={avatar} onChange={set('avatar')} focal decorative />
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: ['friday-report', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
                <div className="friday-report__inner wrap">
                    <header className="friday-report__head">
                        <Chapter
                            edit
                            num={chapterNum}
                            label={chapterLabel}
                            onChange={({ num, label }) =>
                                setAttributes({
                                    ...(num !== undefined && { chapterNum: num }),
                                    ...(label !== undefined && { chapterLabel: label }),
                                })
                            }
                        />
                        <RichText tagName="h2" className="friday-report__title" value={title} onChange={set('title')} allowedFormats={[]} placeholder={__('Headline', 'ashlar')} />
                        <RichText tagName="p" className="friday-report__lede" value={lede} onChange={set('lede')} allowedFormats={[]} placeholder={__('Which job, and whose report', 'ashlar')} />
                        <RichText tagName="p" className="friday-report__note" value={note} onChange={set('note')} allowedFormats={[]} placeholder={__('Note, e.g. what the contract says if it’s late', 'ashlar')} />
                    </header>
                    <ReportDoc attributes={attributes} edit setAttributes={setAttributes} />
                </div>
            </section>
        </>
    );
}
