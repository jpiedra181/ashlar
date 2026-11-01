import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import Media, { MediaPlaceholder } from '../../components/media';
import MediaField from '../../components/media-field';
import LinkField from '../../components/link-field';
import SectionTheme, { themeClass } from '../../components/section-theme';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';

/**
 * Edit de la cabecera de página interior.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, eyebrow, title, lede, ledeAlign, linksLabel, links, image, caption } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const setLinks = (next) => setAttributes({ links: next });
    const classes = ['page-intro', ledeAlign === 'top' && 'page-intro--top', themeClass(theme)].filter(Boolean).join(' ');

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                    <SelectControl
                        __nextHasNoMarginBottom
                        __next40pxDefaultSize
                        label={__('Introduction position', 'ashlar')}
                        value={ledeAlign}
                        options={[
                            { label: __('Level with the bottom of the headline', 'ashlar'), value: 'bottom' },
                            { label: __('Level with the top of the headline', 'ashlar'), value: 'top' },
                        ]}
                        onChange={set('ledeAlign')}
                    />
                </PanelBody>
                <PanelBody title={__('Quick links', 'ashlar')} initialOpen={false}>
                    {links.map((link, index) => (
                        <LinkField key={index} label={`${link.label || __('Link', 'ashlar')} · ${__('link', 'ashlar')}`} value={link.url} onChange={(url) => setLinks(updateItem(links, index, { url }))} />
                    ))}
                    <p className="components-base-control__help">{__('Short links to sections further down the page, e.g. /services/#lofts.', 'ashlar')}</p>
                </PanelBody>
                <PanelBody title={__('Photo', 'ashlar')} initialOpen={false}>
                    <MediaField label={__('Wide photo (optional)', 'ashlar')} value={image} onChange={set('image')} focal />
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: classes })}>
                <div className="page-intro__inner wrap">
                    <div className="page-intro__heading">
                        <RichText tagName="p" className="page-intro__eyebrow" value={eyebrow} onChange={set('eyebrow')} allowedFormats={[]} placeholder={__('Label', 'ashlar')} />
                        <RichText tagName="h1" className="page-intro__title" value={title} onChange={set('title')} allowedFormats={[]} placeholder={__('Page headline', 'ashlar')} />
                        <div className="page-intro__links">
                            {links.length > 0 && <RichText tagName="span" className="page-intro__links-label" value={linksLabel} onChange={set('linksLabel')} allowedFormats={[]} placeholder={__('Jump to', 'ashlar')} />}
                            <ul>
                                {links.map((link, index) => (
                                    <li className="ashlar-item" key={index}>
                                        <ItemActions index={index} count={links.length} min={0} label={__('Link', 'ashlar')} onMove={(from, to) => setLinks(moveItem(links, from, to))} onRemove={(i) => setLinks(removeItem(links, i))} />
                                        <span className="chip">
                                            <RichText tagName="span" value={link.label} onChange={(label) => setLinks(updateItem(links, index, { label }))} allowedFormats={[]} placeholder={__('Section', 'ashlar')} />
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <AddItem label={__('Add quick link', 'ashlar')} count={links.length} max={8} onClick={() => setLinks([...links, { label: '', url: '' }])} />
                        </div>
                    </div>
                    <RichText tagName="p" className="page-intro__lede" value={lede} onChange={set('lede')} allowedFormats={[]} placeholder={__('Short introduction', 'ashlar')} />
                    {image?.url ? (
                        <figure className="page-intro__figure">
                            <Media image={image} className="page-intro__media" />
                            <RichText tagName="figcaption" className="page-intro__caption" value={caption} onChange={set('caption')} allowedFormats={[]} placeholder={__('Caption (optional)', 'ashlar')} />
                        </figure>
                    ) : (
                        <div className="page-intro__add-photo">
                            <MediaPlaceholder image={image} onChange={set('image')} label={__('Add a wide photo (optional)', 'ashlar')} />
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
