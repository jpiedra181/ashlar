import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import SectionTheme, { themeClass } from '../../components/section-theme';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';

/**
 * Edit de las preguntas frecuentes: en el editor todas las respuestas se ven
 * abiertas (<div> en lugar de <details>) para escribirlas directamente; si no,
 * cada clic en la pregunta la plegaría.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, eyebrow, title, openFirst, items } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const setItems = (next) => setAttributes({ items: next });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                    <ToggleControl __nextHasNoMarginBottom label={__('Show the first answer open', 'ashlar')} help={__('In the editor every answer is shown open so you can write it.', 'ashlar')} checked={openFirst} onChange={set('openFirst')} />
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: ['faq', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
                <div className="faq__inner wrap">
                    <header className="faq__heading">
                        <RichText tagName="p" className="faq__eyebrow" value={eyebrow} onChange={set('eyebrow')} allowedFormats={[]} placeholder={__('Label', 'ashlar')} />
                        <RichText tagName="h2" className="faq__title" value={title} onChange={set('title')} allowedFormats={[]} placeholder={__('Section headline', 'ashlar')} />
                    </header>

                    <div className="faq__list">
                        {items.map((item, index) => (
                            <div className={['faq__item', 'ashlar-item', openFirst && index === 0 && 'is-open'].filter(Boolean).join(' ')} key={index}>
                                <ItemActions index={index} count={items.length} label={__('Question', 'ashlar')} onMove={(from, to) => setItems(moveItem(items, from, to))} onRemove={(i) => setItems(removeItem(items, i))} />
                                <div className="faq__summary">
                                    <RichText tagName="span" className="faq__question" value={item.question} onChange={(value) => setItems(updateItem(items, index, { question: value }))} allowedFormats={[]} placeholder={__('Question', 'ashlar')} />
                                    <span className="faq__icon" aria-hidden="true" />
                                </div>
                                <div className="faq__answer">
                                    <RichText tagName="p" value={item.answer} onChange={(value) => setItems(updateItem(items, index, { answer: value }))} allowedFormats={['core/bold', 'core/link']} placeholder={__('Answer', 'ashlar')} />
                                </div>
                            </div>
                        ))}
                        <AddItem label={__('Add question', 'ashlar')} count={items.length} max={20} onClick={() => setItems([...items, { question: '', answer: '' }])} />
                    </div>
                </div>
            </section>
        </>
    );
}
