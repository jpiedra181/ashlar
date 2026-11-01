import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import Chapter from '../../components/chapter';
import SectionTheme, { themeClass } from '../../components/section-theme';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';

/**
 * Edit de la tabla de compromisos: todo se escribe encima, las filas se
 * reordenan, añaden y quitan en el propio lienzo.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, chapterNum, chapterLabel, title, lede, headClause, headCommitment, headDetail, headMeasure, rows, footnote } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const setRows = (next) => setAttributes({ rows: next });
    const cell = (index, key, placeholder, tagName = 'td', className) => (
        <RichText
            tagName={tagName}
            className={className}
            value={rows[index][key]}
            onChange={(value) => setRows(updateItem(rows, index, { [key]: value }))}
            allowedFormats={[]}
            placeholder={placeholder}
        />
    );

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: ['standard', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
                <div className="standard__inner wrap">
                    <header className="standard__head">
                        <div className="standard__heading">
                            <Chapter edit num={chapterNum} label={chapterLabel} onChange={({ num, label }) => setAttributes({ ...(num !== undefined && { chapterNum: num }), ...(label !== undefined && { chapterLabel: label }) })} />
                            <RichText tagName="h2" className="standard__title" value={title} onChange={set('title')} allowedFormats={[]} placeholder={__('Section headline', 'ashlar')} />
                        </div>
                        <RichText tagName="p" className="standard__lede" value={lede} onChange={set('lede')} allowedFormats={[]} placeholder={__('Short introduction (optional)', 'ashlar')} />
                    </header>

                    <table className="standard__table">
                        <thead>
                            <tr>
                                <RichText tagName="th" className="standard__col standard__col--clause" value={headClause} onChange={set('headClause')} allowedFormats={[]} />
                                <RichText tagName="th" className="standard__col standard__col--commitment" value={headCommitment} onChange={set('headCommitment')} allowedFormats={[]} />
                                <RichText tagName="th" className="standard__col standard__col--detail" value={headDetail} onChange={set('headDetail')} allowedFormats={[]} />
                                <RichText tagName="th" className="standard__col standard__col--measure" value={headMeasure} onChange={set('headMeasure')} allowedFormats={[]} />
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr className="standard__row ashlar-item" key={index}>
                                    {cell(index, 'clause', '§ 01', 'td', 'standard__clause')}
                                    {cell(index, 'commitment', __('Commitment', 'ashlar'), 'th', 'standard__commitment')}
                                    {cell(index, 'detail', __('What it means in practice', 'ashlar'), 'td', 'standard__detail')}
                                    <td className="standard__measure-cell">
                                        <ItemActions index={index} count={rows.length} label={__('Row', 'ashlar')} onMove={(from, to) => setRows(moveItem(rows, from, to))} onRemove={(i) => setRows(removeItem(rows, i))} />
                                        <RichText tagName="span" className="standard__measure" value={row.measure} onChange={(value) => setRows(updateItem(rows, index, { measure: value }))} allowedFormats={[]} placeholder="10 days" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <AddItem label={__('Add row', 'ashlar')} count={rows.length} max={8} onClick={() => setRows([...rows, { clause: `§ ${String(rows.length + 1).padStart(2, '0')}`, commitment: '', detail: '', measure: '' }])} />

                    <RichText tagName="p" className="standard__footnote" value={footnote} onChange={set('footnote')} allowedFormats={[]} placeholder={__('Footnote (optional)', 'ashlar')} />
                </div>
            </section>
        </>
    );
}
