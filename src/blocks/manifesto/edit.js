import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import Chapter from '../../components/chapter';
import Media from '../../components/media';
import MediaField from '../../components/media-field';
import SectionTheme, { themeClass } from '../../components/section-theme';

/**
 * Edit del Manifiesto.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, chapterNum, chapterLabel, text, signature, portrait } = attributes;

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={(value) => setAttributes({ theme: value })} />
                    <p>{__('Select part of the statement and press Italic to show it in the softer tone.', 'ashlar')}</p>
                </PanelBody>
                <PanelBody title={__('Portrait', 'ashlar')} initialOpen={false}>
                    <MediaField label={__('Small portrait next to the signature', 'ashlar')} help={__('Optional. Without it, a short line goes before the name.', 'ashlar')} value={portrait} onChange={(value) => setAttributes({ portrait: value })} focal decorative />
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: ['manifesto', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
                <div className="manifesto__inner wrap">
                    <Chapter edit num={chapterNum} label={chapterLabel} onChange={({ num, label }) => setAttributes({ ...(num !== undefined && { chapterNum: num }), ...(label !== undefined && { chapterLabel: label }) })} />
                    <div className="manifesto__body">
                        <RichText tagName="p" className="manifesto__text" value={text} onChange={(value) => setAttributes({ text: value })} allowedFormats={['core/italic']} placeholder={__('The statement', 'ashlar')} />
                        <div className="manifesto__signature">
                            {portrait?.url ? <Media image={{ ...portrait, alt: '' }} className="manifesto__portrait" ratio="1 / 1" sizes="56px" extra={{ 'aria-hidden': 'true' }} /> : <span className="manifesto__rule" aria-hidden="true" />}
                            <RichText tagName="p" className="manifesto__name" value={signature} onChange={(value) => setAttributes({ signature: value })} allowedFormats={[]} placeholder={__('Signature (optional)', 'ashlar')} />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
