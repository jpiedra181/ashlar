import { __ } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';
import { siteProgress } from '../../components/site-progress';

/**
 * Cartel de obra del hero: el que Ashlar cuelga en la valla de cada obra.
 * Cabecera oscura con la marca, obra en curso con su semana y barra, datos de
 * contacto y una nota para los vecinos. Sustituye al ticker «On site now».
 *
 * Mismo componente en edit (`edit` + `setAttributes`: textos editables en el
 * lienzo, filas con el repeater) y en save (RichText.Content). Los campos
 * vacíos se omiten al guardar.
 *
 * @param {Object}   props               Props.
 * @param {Object}   props.attributes    Atributos del bloque home-hero.
 * @param {boolean}  props.edit          Si se pinta en el editor.
 * @param {Function} props.setAttributes Setter del bloque (solo en edit).
 */
export default function SiteBoard({ attributes, edit = false, setAttributes }) {
    const { boardBrand, metaTop, metaBottom, boardTag, boardSite, boardJob, boardRows, boardNote } = attributes;
    const progress = siteProgress(attributes);
    const setRows = (next) => setAttributes({ boardRows: next });

    // Función y no componente: un componente definido aquí se remontaría en
    // cada pulsación y el RichText perdería el foco.
    const text = (key, tagName, className, placeholder) => {
        if (edit) {
            return <RichText tagName={tagName} className={className} value={attributes[key]} onChange={(value) => setAttributes({ [key]: value })} allowedFormats={[]} placeholder={placeholder} />;
        }
        return attributes[key] ? <RichText.Content tagName={tagName} className={className} value={attributes[key]} /> : null;
    };

    return (
        <div className="home-hero__board site-board theme-light" {...(edit ? {} : { 'data-intro': '', style: { '--i': 5 } })}>
            <div className="site-board__head">
                <p className="site-board__brand">
                    <svg className="site-board__mark" viewBox="0 0 22 14" aria-hidden="true" focusable="false">
                        <rect width="10" height="6" fill="currentColor" />
                        <rect x="12" width="10" height="6" fill="currentColor" />
                        <rect className="site-board__mark-accent" x="6" y="8" width="10" height="6" />
                    </svg>
                    {text('boardBrand', 'span', 'site-board__brand-name', __('Company name', 'ashlar'))}
                </p>
                {(edit || metaTop || metaBottom) && (
                    <p className="site-board__meta">
                        {text('metaTop', 'span', undefined, __('Design & build', 'ashlar'))}
                        {text('metaBottom', 'span', undefined, __('London N1 · Since 2009', 'ashlar'))}
                    </p>
                )}
            </div>

            <div className="site-board__body">
                {text('boardTag', 'p', 'site-board__tag', __('On site now', 'ashlar'))}
                {(edit || boardSite || boardJob) && (
                    <div className="site-board__where">
                        {text('boardSite', 'p', 'site-board__site', __('Street, postcode', 'ashlar'))}
                        {text('boardJob', 'p', 'site-board__job', __('Kind of job', 'ashlar'))}
                    </div>
                )}
                <div className="site-board__progress" style={progress.style}>
                    <span className="site-board__week">{progress.week}</span>
                    <span className="site-board__track" aria-hidden="true">
                        <span className="site-board__fill" />
                    </span>
                    <span className="site-board__pct" aria-hidden="true">
                        {progress.percent}%
                    </span>
                </div>
                {(edit || boardRows.length > 0) && (
                    <dl className="site-board__rows">
                        {boardRows.map((row, index) => (
                            <div className={['site-board__row', edit && 'ashlar-item'].filter(Boolean).join(' ')} key={index}>
                                {edit && <ItemActions index={index} count={boardRows.length} min={0} label={__('Line', 'ashlar')} onMove={(from, to) => setRows(moveItem(boardRows, from, to))} onRemove={(i) => setRows(removeItem(boardRows, i))} />}
                                {edit ? (
                                    <>
                                        <RichText tagName="dt" value={row.key} onChange={(value) => setRows(updateItem(boardRows, index, { key: value }))} allowedFormats={[]} placeholder={__('Label', 'ashlar')} />
                                        <RichText tagName="dd" value={row.value} onChange={(value) => setRows(updateItem(boardRows, index, { value }))} allowedFormats={[]} placeholder={__('Value', 'ashlar')} />
                                    </>
                                ) : (
                                    <>
                                        <RichText.Content tagName="dt" value={row.key} />
                                        <RichText.Content tagName="dd" value={row.value} />
                                    </>
                                )}
                            </div>
                        ))}
                    </dl>
                )}
                {edit && <AddItem label={__('Add line', 'ashlar')} count={boardRows.length} max={5} onClick={() => setRows([...boardRows, { key: '', value: '' }])} />}
                {(edit || boardNote) && text('boardNote', 'p', 'site-board__note', __('A word for the neighbours', 'ashlar'))}
            </div>
        </div>
    );
}
