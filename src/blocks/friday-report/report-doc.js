import { __ } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';
import Media, { MediaPlaceholder } from '../../components/media';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';

/**
 * El parte como documento: hoja blanca con el rótulo y el estado, la obra,
 * quién lo manda (con su foto), a quién y cuándo, una foto de la semana con
 * su pie, «This week», «Next week», la decisión pendiente, el precio y la
 * despedida de quien lo firma.
 *
 * Mismo componente en edit (`edit` + `setAttributes`: textos en el lienzo,
 * listas con el repeater) y en save (RichText.Content, animación de la foto).
 * Al guardar se omiten los campos y apartados vacíos.
 *
 * @param {Object}   props               Props.
 * @param {Object}   props.attributes    Atributos del bloque.
 * @param {boolean}  props.edit          Si se pinta en el editor.
 * @param {Function} props.setAttributes Setter del bloque (solo en edit).
 */
export default function ReportDoc({ attributes, edit = false, setAttributes }) {
    const { late, avatar, meta, image, next, weekText, decision, price } = attributes;
    const setList = (key) => (value) => setAttributes({ [key]: value });

    // Función y no componente, para que el RichText no pierda el foco.
    const text = (key, tagName, className, placeholder) => {
        if (edit) {
            return <RichText tagName={tagName} className={className} value={attributes[key]} onChange={(value) => setAttributes({ [key]: value })} allowedFormats={[]} placeholder={placeholder} />;
        }
        return attributes[key] ? <RichText.Content tagName={tagName} className={className} value={attributes[key]} /> : null;
    };

    return (
        <article className="friday-report__doc report-doc theme-light" {...(edit ? {} : { 'data-reveal': '' })}>
            <header className="report-doc__head">
                {text('docLabel', 'p', 'report-doc__label', __('Friday report · Week 1 of 12', 'ashlar'))}
                {text('status', 'p', ['report-doc__status', late && 'is-late'].filter(Boolean).join(' '), __('On programme', 'ashlar'))}
            </header>

            {text('docTitle', 'h3', 'report-doc__title', __('Street, postcode · Kind of job', 'ashlar'))}

            <div className="report-doc__from">
                {/* Retrato decorativo (el nombre va al lado): alt vacío siempre. Se elige en el panel. */}
                {avatar?.url && <Media image={{ ...avatar, alt: '' }} className="report-doc__avatar" ratio="1 / 1" sizes="48px" extra={{ 'aria-hidden': 'true' }} />}
                <dl className="report-doc__meta">
                    {meta.map((row, index) => (edit || row.key || row.value) ? (
                        <div className={['report-doc__meta-row', edit && 'ashlar-item'].filter(Boolean).join(' ')} key={index}>
                            {edit && <ItemActions index={index} count={meta.length} min={0} label={__('Line', 'ashlar')} onMove={(from, to) => setAttributes({ meta: moveItem(meta, from, to) })} onRemove={(i) => setAttributes({ meta: removeItem(meta, i) })} />}
                            {edit ? (
                                <>
                                    <RichText tagName="dt" value={row.key} onChange={(value) => setAttributes({ meta: updateItem(meta, index, { key: value }) })} allowedFormats={[]} placeholder={__('From', 'ashlar')} />
                                    <RichText tagName="dd" value={row.value} onChange={(value) => setAttributes({ meta: updateItem(meta, index, { value }) })} allowedFormats={[]} placeholder={__('Name', 'ashlar')} />
                                </>
                            ) : (
                                <>
                                    <RichText.Content tagName="dt" value={row.key} />
                                    <RichText.Content tagName="dd" value={row.value} />
                                </>
                            )}
                        </div>
                    ) : null)}
                </dl>
                {edit && <AddItem label={__('Add line', 'ashlar')} count={meta.length} max={4} onClick={() => setAttributes({ meta: [...meta, { key: '', value: '' }] })} />}
            </div>

            {(edit || image?.url) && (
                <figure className="report-doc__figure">
                    <Media image={image} className="report-doc__media" ratio="4 / 3" reveal={!edit} sizes="(min-width: 1024px) 40rem, 100vw">
                        {edit && <MediaPlaceholder image={image} onChange={setList('image')} />}
                    </Media>
                    {text('caption', 'figcaption', 'report-doc__caption', __('Day · what the photo shows', 'ashlar'))}
                </figure>
            )}

            {(edit || weekText) && (
                <div className="report-doc__part">
                    {text('weekLabel', 'h4', 'report-doc__part-label', __('This week', 'ashlar'))}
                    {text('weekText', 'p', 'report-doc__text', __('What happened on site this week', 'ashlar'))}
                </div>
            )}

            {(edit || next.some(Boolean)) && (
                <div className="report-doc__part">
                    {text('nextLabel', 'h4', 'report-doc__part-label', __('Next week', 'ashlar'))}
                    <ul className="report-doc__list">
                        {next.map((item, index) => (edit || item) ? (
                            <li className={edit ? 'ashlar-item' : undefined} key={index}>
                                {edit && <ItemActions index={index} count={next.length} min={0} label={__('Item', 'ashlar')} onMove={(from, to) => setAttributes({ next: moveItem(next, from, to) })} onRemove={(i) => setAttributes({ next: removeItem(next, i) })} />}
                                {edit ? <RichText tagName="span" value={item} onChange={(value) => setAttributes({ next: next.map((old, i) => (i === index ? value : old)) })} allowedFormats={[]} placeholder={__('What happens next', 'ashlar')} /> : <RichText.Content value={item} />}
                            </li>
                        ) : null)}
                    </ul>
                    {edit && <AddItem label={__('Add item', 'ashlar')} count={next.length} max={6} onClick={() => setAttributes({ next: [...next, ''] })} />}
                </div>
            )}

            {(edit || decision) && (
                <div className="report-doc__decision">
                    {text('decisionLabel', 'h4', 'report-doc__decision-label', __('Decision needed by…', 'ashlar'))}
                    {text('decision', 'p', 'report-doc__text', __('What you need from the client, and by when', 'ashlar'))}
                </div>
            )}

            {(edit || price) && (
                <div className="report-doc__price">
                    {text('priceLabel', 'p', 'report-doc__price-label', __('Your price', 'ashlar'))}
                    {text('price', 'p', 'report-doc__price-value', __('£0, unchanged', 'ashlar'))}
                </div>
            )}

            {text('signoff', 'p', 'report-doc__signoff', __('Sign-off', 'ashlar'))}
        </article>
    );
}
