import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl, __experimentalNumberControl as NumberControl } from '@wordpress/components';
import Chapter from '../../components/chapter';
import SectionTheme, { themeClass } from '../../components/section-theme';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';
import { pounds, totals, swatch } from './money';

/**
 * Edit de «The money»: los nombres de las partidas se escriben encima; los
 * importes (y si son cambios del cliente), en el panel. Porcentajes y totales
 * se calculan solos.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, chapterNum, chapterLabel, title, lede, items, fixedLabel, changesLabel, finalLabel, footnote } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const setItems = (next) => setAttributes({ items: next });
    const sums = totals(items);

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                </PanelBody>
                <PanelBody title={__('Amounts (£, ex VAT)', 'ashlar')} initialOpen>
                    {items.map((item, index) => (
                        <div className="ashlar-fieldset" key={index}>
                            <NumberControl
                                __next40pxDefaultSize
                                label={(item.label || `${__('Item', 'ashlar')} ${index + 1}`).replace(/<[^>]+>/g, '').replace('&amp;', '&')}
                                min={0}
                                value={item.amount}
                                onChange={(value) => setItems(updateItem(items, index, { amount: parseInt(String(value).replace(/[^0-9]/g, ''), 10) || 0 }))}
                            />
                            <ToggleControl __nextHasNoMarginBottom label={__('Change asked for by the client', 'ashlar')} checked={Boolean(item.change)} onChange={(change) => setItems(updateItem(items, index, { change }))} />
                        </div>
                    ))}
                    <p className="components-base-control__help">{__('The fixed price is the total without the client changes; the final account, the total with them. Remember to update the headline if the figures change.', 'ashlar')}</p>
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: ['project-cost', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
                <div className="project-cost__inner wrap">
                    <header className="project-cost__head">
                        <div className="project-cost__heading">
                            <Chapter edit num={chapterNum} label={chapterLabel} onChange={({ num, label }) => setAttributes({ ...(num !== undefined && { chapterNum: num }), ...(label !== undefined && { chapterLabel: label }) })} />
                            <RichText tagName="h2" className="project-cost__title" value={title} onChange={set('title')} allowedFormats={[]} placeholder={__('Section headline', 'ashlar')} />
                        </div>
                        <RichText tagName="p" className="project-cost__lede" value={lede} onChange={set('lede')} allowedFormats={[]} placeholder={__('Short introduction (optional)', 'ashlar')} />
                    </header>

                    <div className="project-cost__bar" aria-hidden="true">
                        {items.map((item, index) => (
                            <span className={`project-cost__segment is-${swatch(items, index)}`} style={{ flexGrow: Math.max(0, Number(item.amount) || 0) }} key={index} />
                        ))}
                    </div>

                    <table className="project-cost__table">
                        <tbody>
                            {items.map((item, index) => (
                                <tr className="ashlar-item" key={index}>
                                    <th scope="row">
                                        <ItemActions index={index} count={items.length} label={__('Item', 'ashlar')} onMove={(from, to) => setItems(moveItem(items, from, to))} onRemove={(i) => setItems(removeItem(items, i))} />
                                        <span className={`project-cost__swatch is-${swatch(items, index)}`} aria-hidden="true" />
                                        <RichText tagName="span" value={item.label} onChange={(label) => setItems(updateItem(items, index, { label }))} allowedFormats={[]} placeholder={__('What the money was for', 'ashlar')} />
                                    </th>
                                    <td className="project-cost__share">{`${Math.round(sums.share(item))}%`}</td>
                                    <td className="project-cost__amount">{pounds(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <AddItem label={__('Add item', 'ashlar')} count={items.length} max={12} onClick={() => setItems([...items, { label: '', amount: 0, change: false }])} />

                    <dl className="project-cost__summary">
                        <div>
                            <RichText tagName="dt" value={fixedLabel} onChange={set('fixedLabel')} allowedFormats={[]} />
                            <dd>{pounds(sums.fixed)}</dd>
                        </div>
                        <div>
                            <RichText tagName="dt" value={changesLabel} onChange={set('changesLabel')} allowedFormats={[]} />
                            <dd>{`+${pounds(sums.changes)}`}</dd>
                        </div>
                        <div className="is-final">
                            <RichText tagName="dt" value={finalLabel} onChange={set('finalLabel')} allowedFormats={[]} />
                            <dd>{pounds(sums.final)}</dd>
                        </div>
                    </dl>

                    <RichText tagName="p" className="project-cost__footnote" value={footnote} onChange={set('footnote')} allowedFormats={[]} placeholder={__('Footnote (optional)', 'ashlar')} />
                </div>
            </section>
        </>
    );
}
