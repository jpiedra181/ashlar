import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import {
    PanelBody,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import SectionTheme from '../../components/section-theme';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';
import { pointNumber, gridClass } from './save';

/**
 * Edit de «Numbered points».
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, variant, eyebrow, title, lede, items } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const setItems = (next) => setAttributes({ items: next });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                    <ToggleGroupControl __nextHasNoMarginBottom __next40pxDefaultSize isBlock label={__('Style', 'ashlar')} help={__('Cards can show a big figure next to each number.', 'ashlar')} value={variant} onChange={set('variant')}>
                        <ToggleGroupControlOption value="ruled" label={__('Ruled', 'ashlar')} />
                        <ToggleGroupControlOption value="cards" label={__('Cards', 'ashlar')} />
                    </ToggleGroupControl>
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: gridClass(attributes) })}>
                <div className="numbered-grid__inner wrap">
                    <header className="numbered-grid__head">
                        <div className="numbered-grid__heading">
                            <RichText tagName="p" className="numbered-grid__eyebrow" value={eyebrow} onChange={set('eyebrow')} allowedFormats={[]} placeholder={__('Label', 'ashlar')} />
                            <RichText tagName="h2" className="numbered-grid__title" value={title} onChange={set('title')} allowedFormats={[]} placeholder={__('Section headline', 'ashlar')} />
                        </div>
                        <RichText tagName="p" className="numbered-grid__lede" value={lede} onChange={set('lede')} allowedFormats={[]} placeholder={__('Short introduction (optional)', 'ashlar')} />
                    </header>

                    <ol className="numbered-grid__list">
                        {items.map((item, index) => (
                            <li className="numbered-grid__item ashlar-item" key={index}>
                                <ItemActions index={index} count={items.length} label={__('Point', 'ashlar')} onMove={(from, to) => setItems(moveItem(items, from, to))} onRemove={(i) => setItems(removeItem(items, i))} />
                                <span className="numbered-grid__num" aria-hidden="true">
                                    {pointNumber(index)}
                                </span>
                                <div className="numbered-grid__text">
                                    <RichText tagName="h3" className="numbered-grid__item-title" value={item.title} onChange={(value) => setItems(updateItem(items, index, { title: value }))} allowedFormats={[]} placeholder={__('Point', 'ashlar')} />
                                    <RichText tagName="p" className="numbered-grid__item-text" value={item.text} onChange={(value) => setItems(updateItem(items, index, { text: value }))} allowedFormats={[]} placeholder={__('One line on what it means', 'ashlar')} />
                                </div>
                                {variant === 'cards' && <RichText tagName="span" className="numbered-grid__stat" value={item.stat} onChange={(value) => setItems(updateItem(items, index, { stat: value }))} allowedFormats={[]} placeholder={__('Figure', 'ashlar')} />}
                            </li>
                        ))}
                    </ol>
                    <AddItem label={__('Add point', 'ashlar')} count={items.length} max={12} onClick={() => setItems([...items, { title: '', text: '' }])} />
                </div>
            </section>
        </>
    );
}
