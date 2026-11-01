import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import Chapter from '../../components/chapter';
import SectionTheme, { themeClass } from '../../components/section-theme';
import { ItemActions, AddItem, moveItem, removeItem } from '../../components/repeater';

/**
 * Edit de «The brief».
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, chapterNum, chapterLabel, quote, cite, foundLabel, found, didLabel, did } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });

    const list = (labelKey, key) => {
        const items = attributes[key];
        const setItems = (next) => setAttributes({ [key]: next });

        return (
            <div className="project-brief__list">
                <RichText tagName="h3" className="project-brief__label" value={attributes[labelKey]} onChange={set(labelKey)} allowedFormats={[]} />
                <ul className="dash-list">
                    {items.map((item, index) => (
                        <li className="ashlar-item" key={index}>
                            <ItemActions index={index} count={items.length} label={__('Point', 'ashlar')} onMove={(from, to) => setItems(moveItem(items, from, to))} onRemove={(i) => setItems(removeItem(items, i))} />
                            <RichText tagName="span" value={item} onChange={(value) => setItems(items.map((v, i) => (i === index ? value : v)))} allowedFormats={[]} placeholder={__('One short point', 'ashlar')} />
                        </li>
                    ))}
                </ul>
                <AddItem label={__('Add point', 'ashlar')} count={items.length} max={8} onClick={() => setItems([...items, ''])} />
            </div>
        );
    };

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: ['project-brief', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
                <div className="project-brief__inner wrap">
                    <Chapter edit num={chapterNum} label={chapterLabel} onChange={({ num, label }) => setAttributes({ ...(num !== undefined && { chapterNum: num }), ...(label !== undefined && { chapterLabel: label }) })} />
                    <div className="project-brief__body">
                        <figure className="project-brief__quote">
                            <blockquote>
                                <RichText tagName="h2" value={quote} onChange={set('quote')} allowedFormats={[]} placeholder={__('“What the client asked for, in their words.”', 'ashlar')} />
                            </blockquote>
                            <RichText tagName="figcaption" value={cite} onChange={set('cite')} allowedFormats={[]} placeholder={__('Who said it, and when', 'ashlar')} />
                        </figure>
                        <div className="project-brief__lists">
                            {list('foundLabel', 'found')}
                            {list('didLabel', 'did')}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
