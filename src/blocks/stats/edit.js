import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';
import SectionTheme from '../../components/section-theme';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';
import { statsClass } from './save';

/**
 * Edit de las cifras.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, attached, heading, items } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const setItems = (next) => setAttributes({ items: next });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                    <ToggleControl __nextHasNoMarginBottom label={__('Sit right under the section above', 'ashlar')} help={__('Removes the space above, e.g. under the page intro. Use the same tone as that section.', 'ashlar')} checked={attached} onChange={set('attached')} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Heading for screen readers', 'ashlar')} help={__('Not shown on the page: it lets people who use a screen reader jump to this section.', 'ashlar')} value={heading} onChange={set('heading')} />
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: statsClass(attributes) })}>
                <div className="stats__inner wrap">
                    <ul className="stats__list">
                        {items.map((item, index) => (
                            <li className="stats__item ashlar-item" key={index}>
                                <ItemActions index={index} count={items.length} label={__('Figure', 'ashlar')} onMove={(from, to) => setItems(moveItem(items, from, to))} onRemove={(i) => setItems(removeItem(items, i))} />
                                <RichText tagName="span" className="stats__value" value={item.value} onChange={(value) => setItems(updateItem(items, index, { value }))} allowedFormats={[]} placeholder="118" />
                                <RichText tagName="span" className="stats__label" value={item.label} onChange={(label) => setItems(updateItem(items, index, { label }))} allowedFormats={[]} placeholder={__('what the number is', 'ashlar')} />
                            </li>
                        ))}
                    </ul>
                    <AddItem label={__('Add figure', 'ashlar')} count={items.length} max={6} onClick={() => setItems([...items, { value: '', label: '' }])} />
                </div>
            </section>
        </>
    );
}
