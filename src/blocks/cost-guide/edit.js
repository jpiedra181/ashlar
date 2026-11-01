import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import Button from '../../components/button';
import LinkField from '../../components/link-field';
import SectionTheme, { themeClass } from '../../components/section-theme';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';

/**
 * Edit de la guía de precios.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, eyebrow, title, lede, workLabel, sizeLabel, timeLabel, priceLabel, rows, note, buttonLabel, buttonUrl } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const setRows = (next) => setAttributes({ rows: next });
    const cell = (index, key) => (value) => setRows(updateItem(rows, index, { [key]: value }));

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                </PanelBody>
                <PanelBody title={__('Button', 'ashlar')} initialOpen={false}>
                    <LinkField label={__('Button link', 'ashlar')} value={buttonUrl} onChange={set('buttonUrl')} help={__('Leave the button text empty to remove it.', 'ashlar')} />
                </PanelBody>
                <PanelBody title={__('Column headings', 'ashlar')} initialOpen={false}>
                    <p className="components-base-control__help">{__('Not shown on the page: screen readers announce them with each figure.', 'ashlar')}</p>
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Type of work', 'ashlar')} value={workLabel} onChange={set('workLabel')} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Size', 'ashlar')} value={sizeLabel} onChange={set('sizeLabel')} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Time', 'ashlar')} value={timeLabel} onChange={set('timeLabel')} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Price', 'ashlar')} value={priceLabel} onChange={set('priceLabel')} />
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: ['cost-guide', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
                <div className="cost-guide__inner wrap">
                    <header className="cost-guide__head">
                        <div className="cost-guide__heading">
                            <RichText tagName="p" className="cost-guide__eyebrow" value={eyebrow} onChange={set('eyebrow')} allowedFormats={[]} placeholder={__('Label', 'ashlar')} />
                            <RichText tagName="h2" className="cost-guide__title" value={title} onChange={set('title')} allowedFormats={[]} placeholder={__('Section headline', 'ashlar')} />
                        </div>
                        <RichText tagName="p" className="cost-guide__lede" value={lede} onChange={set('lede')} allowedFormats={[]} placeholder={__('Short introduction (optional)', 'ashlar')} />
                    </header>

                    <table className="cost-guide__table" role="table">
                        <thead className="visually-hidden" role="rowgroup">
                            <tr role="row">
                                <th scope="col" role="columnheader">{workLabel}</th>
                                <th scope="col" role="columnheader">{sizeLabel}</th>
                                <th scope="col" role="columnheader">{timeLabel}</th>
                                <th scope="col" role="columnheader">{priceLabel}</th>
                            </tr>
                        </thead>
                        <tbody role="rowgroup">
                            {rows.map((row, index) => (
                                <tr className="cost-guide__row" role="row" key={index}>
                                    <th scope="row" role="rowheader" className="cost-guide__work ashlar-item">
                                        <ItemActions index={index} count={rows.length} label={__('Row', 'ashlar')} onMove={(from, to) => setRows(moveItem(rows, from, to))} onRemove={(i) => setRows(removeItem(rows, i))} />
                                        <RichText tagName="span" value={row.work} onChange={cell(index, 'work')} allowedFormats={[]} placeholder={__('Type of work', 'ashlar')} />
                                    </th>
                                    <RichText tagName="td" className="cost-guide__size" value={row.size} onChange={cell(index, 'size')} allowedFormats={[]} placeholder={__('Size', 'ashlar')} />
                                    <RichText tagName="td" className="cost-guide__time" value={row.time} onChange={cell(index, 'time')} allowedFormats={[]} placeholder={__('Time', 'ashlar')} />
                                    <RichText tagName="td" className="cost-guide__price" value={row.price} onChange={cell(index, 'price')} allowedFormats={[]} placeholder={__('£… – £…', 'ashlar')} />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <AddItem label={__('Add row', 'ashlar')} count={rows.length} max={12} onClick={() => setRows([...rows, { work: '', size: '', time: '', price: '' }])} />

                    <div className="cost-guide__foot">
                        <RichText tagName="p" className="cost-guide__note" value={note} onChange={set('note')} allowedFormats={[]} placeholder={__('What isn’t included (optional)', 'ashlar')} />
                        <Button className="cost-guide__button">
                            <RichText tagName="span" value={buttonLabel} onChange={set('buttonLabel')} allowedFormats={[]} placeholder={__('Button (optional)', 'ashlar')} />
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
