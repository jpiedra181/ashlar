import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import SectionTheme, { themeClass } from '../../components/section-theme';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';

/**
 * Edit de la línea de tiempo.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, eyebrow, title, lede, items } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const setItems = (next) => setAttributes({ items: next });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                    <p className="components-base-control__help">{__('Up to eight milestones, oldest first. On desktop they sit side by side, so keep each line short.', 'ashlar')}</p>
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: ['timeline', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
                <div className="timeline__inner wrap">
                    <header className="timeline__head">
                        <div className="timeline__heading">
                            <RichText tagName="p" className="timeline__eyebrow" value={eyebrow} onChange={set('eyebrow')} allowedFormats={[]} placeholder={__('Label', 'ashlar')} />
                            <RichText tagName="h2" className="timeline__title" value={title} onChange={set('title')} allowedFormats={[]} placeholder={__('Section headline', 'ashlar')} />
                        </div>
                        <RichText tagName="p" className="timeline__lede" value={lede} onChange={set('lede')} allowedFormats={[]} placeholder={__('Short introduction (optional)', 'ashlar')} />
                    </header>

                    <div className="timeline__body" style={{ '--count': items.length }}>
                        <div className="timeline__axis" aria-hidden="true" />
                        <ol className="timeline__list">
                            {items.map((item, index) => (
                                <li className="timeline__item ashlar-item" key={index}>
                                    <ItemActions index={index} count={items.length} label={__('Milestone', 'ashlar')} onMove={(from, to) => setItems(moveItem(items, from, to))} onRemove={(i) => setItems(removeItem(items, i))} />
                                    <RichText tagName="p" className="timeline__year" value={item.year} onChange={(year) => setItems(updateItem(items, index, { year }))} allowedFormats={[]} placeholder="2009" />
                                    <RichText tagName="h3" className="timeline__item-title" value={item.title} onChange={(value) => setItems(updateItem(items, index, { title: value }))} allowedFormats={[]} placeholder={__('What happened', 'ashlar')} />
                                    <RichText tagName="p" className="timeline__text" value={item.text} onChange={(text) => setItems(updateItem(items, index, { text }))} allowedFormats={[]} placeholder={__('One line about it', 'ashlar')} />
                                </li>
                            ))}
                        </ol>
                    </div>
                    <AddItem label={__('Add milestone', 'ashlar')} count={items.length} max={8} onClick={() => setItems([...items, { year: '', title: '', text: '' }])} />
                </div>
            </section>
        </>
    );
}
