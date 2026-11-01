import { __, sprintf } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl, Disabled, ExternalLink } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';
import Media, { MediaPlaceholder } from '../../components/media';
import MediaField from '../../components/media-field';
import { Arrow } from '../../components/icons';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';
import { FIELDS, QUESTIONS } from './save';

/** Texto plano de un valor de RichText (para las frases de ejemplo). */
const plain = (html = '') => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');

/** Frase de la horquilla con sus huecos rellenos. */
const fill = (template, values) => template.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);

/**
 * Edit del formulario de presupuesto.
 *
 * El formulario no funciona en el editor (los campos van desactivados): aquí
 * se escriben los textos, las opciones y las cifras. Teléfono, email y
 * dirección salen de Options → Contact (vista previa con ServerSideRender).
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const a = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const [showSuccess, setShowSuccess] = useState(false);

    // Cifras: una fila por tipo de obra y tamaño («any» = sin tamaño o «Not sure»).
    const estimate = (service, size) => a.estimates.find((row) => row.service === service && row.size === size) || {};
    const setEstimate = (service, size, data) => {
        const current = estimate(service, size);
        const next = { service, size, price: '', time: '', jobs: '', ...current, ...data };
        const rest = a.estimates.filter((row) => !(row.service === service && row.size === size));
        setAttributes({ estimates: next.price || next.time || next.jobs ? [...rest, next] : rest });
    };
    const estimateSizes = [...a.sizes.filter((size) => size.value !== 'not-sure'), { value: 'any', label: __('Any size, or “Not sure”', 'ashlar') }];

    // Ejemplo de la caja de la horquilla en el lienzo: la primera combinación con tamaño.
    const sample = a.estimates.find((row) => row.size !== 'any') || a.estimates[0];
    const sampleBasis = sample
        ? fill(a.ballparkBasis, {
              jobs: sample.jobs,
              work: a.services.find((service) => service.value === sample.service)?.plural || '',
              size: a.sizes.find((size) => size.value === sample.size)?.phrase || '',
          })
        : a.ballparkPrompt;

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Who answers', 'ashlar')} initialOpen>
                    <MediaField label={__('Portrait', 'ashlar')} value={a.portrait} onChange={set('portrait')} focal />
                </PanelBody>
                <PanelBody title={__('Phone, email and address', 'ashlar')} initialOpen={false}>
                    <p className="components-base-control__help">
                        {__('The details themselves come from Options → Contact, so they match the footer.', 'ashlar')}{' '}
                        {window.ashlarSettingsUrl && <ExternalLink href={window.ashlarSettingsUrl}>{__('Open Options', 'ashlar')}</ExternalLink>}
                    </p>
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Phone label', 'ashlar')} value={a.phoneLabel} onChange={set('phoneLabel')} help={__('Under the number: the opening hours from Options.', 'ashlar')} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Email label', 'ashlar')} value={a.emailLabel} onChange={set('emailLabel')} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Under the email', 'ashlar')} value={a.emailNote} onChange={set('emailNote')} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Address label', 'ashlar')} value={a.addressLabel} onChange={set('addressLabel')} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Under the address', 'ashlar')} value={a.addressNote} onChange={set('addressNote')} />
                </PanelBody>
                <PanelBody title={__('Ballpark sentences', 'ashlar')} initialOpen={false}>
                    <p className="components-base-control__help">{__('{jobs}, {work} and {size} are filled in from the figures below.', 'ashlar')}</p>
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Before choosing', 'ashlar')} value={a.ballparkPrompt} onChange={set('ballparkPrompt')} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('With a size', 'ashlar')} value={a.ballparkBasis} onChange={set('ballparkBasis')} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Without a size', 'ashlar')} value={a.ballparkBasisAny} onChange={set('ballparkBasisAny')} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('When there are no figures (e.g. “Not sure yet”)', 'ashlar')} value={a.ballparkUnsure} onChange={set('ballparkUnsure')} />
                    {a.sizes
                        .filter((size) => size.value !== 'not-sure')
                        .map((size, index) => (
                            <TextControl
                                key={size.value}
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                                /* translators: %s: size option, e.g. "Under 20 m²". */
                                label={sprintf(__('“%s” in the sentence', 'ashlar'), plain(size.label))}
                                value={size.phrase || ''}
                                onChange={(phrase) => setAttributes({ sizes: updateItem(a.sizes, a.sizes.indexOf(size), { phrase }) })}
                                help={index === 0 ? __('E.g. “under 20 m²”.', 'ashlar') : undefined}
                            />
                        ))}
                </PanelBody>
                {a.services
                    .filter((service) => service.value !== 'not-sure')
                    .map((service) => (
                        /* translators: %s: kind of job. */
                        <PanelBody key={service.value} title={sprintf(__('Figures: %s', 'ashlar'), plain(service.label))} initialOpen={false}>
                            <TextControl
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                                label={__('In the sentence (plural)', 'ashlar')}
                                help={__('“Based on 18 rear extensions…”', 'ashlar')}
                                value={service.plural || ''}
                                onChange={(plural) => setAttributes({ services: updateItem(a.services, a.services.indexOf(service), { plural }) })}
                            />
                            {estimateSizes.map((size) => {
                                const row = estimate(service.value, size.value);
                                return (
                                    <fieldset className="ashlar-quote-figures" key={size.value}>
                                        <legend>{plain(size.label)}</legend>
                                        <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Price', 'ashlar')} value={row.price || ''} onChange={(price) => setEstimate(service.value, size.value, { price })} placeholder="£95k – £160k" />
                                        <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Time', 'ashlar')} value={row.time || ''} onChange={(time) => setEstimate(service.value, size.value, { time })} placeholder="14–24 weeks" />
                                        <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Jobs built', 'ashlar')} value={row.jobs || ''} onChange={(jobs) => setEstimate(service.value, size.value, { jobs })} placeholder="18" />
                                    </fieldset>
                                );
                            })}
                            <p className="components-base-control__help">{__('Leave a size empty to use the “Any size” figures for it.', 'ashlar')}</p>
                        </PanelBody>
                    ))}
                <PanelBody title={__('Form', 'ashlar')} initialOpen={false}>
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Example text in the notes box', 'ashlar')} value={a.messagePlaceholder} onChange={set('messagePlaceholder')} />
                    <ToggleControl __nextHasNoMarginBottom label={__('Show the thank-you message', 'ashlar')} help={__('What people see after sending. Only to edit it: the form comes back when you switch this off.', 'ashlar')} checked={showSuccess} onChange={setShowSuccess} />
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: 'quote' })}>
                <div className="quote__inner wrap">
                    <div className="quote__intro">
                        <RichText tagName="p" className="quote__eyebrow" value={a.eyebrow} onChange={set('eyebrow')} allowedFormats={[]} placeholder={__('Label', 'ashlar')} />
                        <RichText tagName="h1" className="quote__title" value={a.title} onChange={set('title')} allowedFormats={[]} placeholder={__('Page headline', 'ashlar')} />
                        <RichText tagName="p" className="quote__lede" value={a.lede} onChange={set('lede')} allowedFormats={[]} placeholder={__('Short introduction', 'ashlar')} />
                        <div className="quote__who">
                            <Media image={a.portrait} className="quote__portrait">
                                <MediaPlaceholder image={a.portrait} onChange={set('portrait')} label={__('Portrait', 'ashlar')} />
                            </Media>
                            <div className="quote__who-text">
                                <RichText tagName="p" className="quote__who-name" value={a.whoName} onChange={set('whoName')} allowedFormats={[]} placeholder={__('Name, role', 'ashlar')} />
                                <RichText tagName="p" className="quote__who-role" value={a.whoText} onChange={set('whoText')} allowedFormats={[]} placeholder={__('One line about them', 'ashlar')} />
                            </div>
                        </div>
                    </div>

                    <div className="quote__card">
                        {showSuccess ? (
                            <div className="qform__success">
                                <RichText tagName="p" className="qform__success-eyebrow" value={a.successEyebrow} onChange={set('successEyebrow')} allowedFormats={[]} placeholder={__('Label', 'ashlar')} />
                                <RichText tagName="h2" className="qform__success-title" value={a.successTitle} onChange={set('successTitle')} allowedFormats={[]} placeholder={__('Thank you', 'ashlar')} />
                                <RichText tagName="p" className="qform__success-text" value={a.successText} onChange={set('successText')} allowedFormats={[]} placeholder={__('What happens now', 'ashlar')} />
                            </div>
                        ) : (
                            <div className="qform">
                                <div className="qform__head">
                                    <RichText tagName="h2" className="qform__title" value={a.formTitle} onChange={set('formTitle')} allowedFormats={[]} placeholder={__('Form title', 'ashlar')} />
                                    <RichText tagName="p" className="qform__note" value={a.formNote} onChange={set('formNote')} allowedFormats={[]} placeholder={__('Note (optional)', 'ashlar')} />
                                </div>

                                {QUESTIONS.map((question) => {
                                    const options = a[question.options];
                                    const setOptions = (next) => setAttributes({ [question.options]: next });
                                    return (
                                        <div className="qform__question" key={question.name}>
                                            <RichText tagName="p" className="qform__legend" value={a[question.label]} onChange={set(question.label)} allowedFormats={[]} placeholder={__('Question', 'ashlar')} />
                                            <div className="qform__options">
                                                {options.map((option, index) => (
                                                    <span className="qform__option ashlar-item" key={option.value}>
                                                        <ItemActions index={index} count={options.length} label={__('Option', 'ashlar')} onMove={(from, to) => setOptions(moveItem(options, from, to))} onRemove={(i) => setOptions(removeItem(options, i))} />
                                                        <RichText tagName="span" className="chip" value={option.label} onChange={(label) => setOptions(updateItem(options, index, { label }))} allowedFormats={[]} placeholder={__('Option', 'ashlar')} />
                                                    </span>
                                                ))}
                                            </div>
                                            <AddItem label={__('Add option', 'ashlar')} count={options.length} max={8} onClick={() => setOptions([...options, { value: `option-${Date.now().toString(36)}`, label: '' }])} />
                                        </div>
                                    );
                                })}

                                <div className="qform__ballpark">
                                    <RichText tagName="p" className="qform__ballpark-label" value={a.ballparkLabel} onChange={set('ballparkLabel')} allowedFormats={[]} placeholder={__('Your ballpark', 'ashlar')} />
                                    {sample && (
                                        <p className="qform__figure">
                                            <span>{sample.price}</span> <span className="qform__time">{sample.time}</span>
                                        </p>
                                    )}
                                    <p className="qform__basis">{sampleBasis}</p>
                                </div>

                                <div className="qform__question qform__contact">
                                    <RichText tagName="p" className="qform__legend" value={a.contactLabel} onChange={set('contactLabel')} allowedFormats={[]} placeholder={__('Question', 'ashlar')} />
                                    <Disabled>
                                        <div className="qform__fields">
                                            {FIELDS.map((field) => (
                                                <div className="field" key={field.name}>
                                                    <span className="field__label">{field.label}</span>
                                                    <input className="field__input" type={field.type} placeholder={field.placeholder} readOnly tabIndex={-1} />
                                                </div>
                                            ))}
                                        </div>
                                    </Disabled>
                                    <div className="field field--wide">
                                        <RichText tagName="span" className="field__label" value={a.messageLabel} onChange={set('messageLabel')} allowedFormats={[]} placeholder={__('Notes label', 'ashlar')} />
                                        <Disabled>
                                            <textarea className="field__input" rows="4" placeholder={a.messagePlaceholder} readOnly tabIndex={-1} />
                                        </Disabled>
                                    </div>
                                </div>

                                <div className="qform__check">
                                    <Disabled>
                                        <input type="checkbox" readOnly tabIndex={-1} />
                                    </Disabled>
                                    <RichText tagName="span" value={a.reportLabel} onChange={set('reportLabel')} allowedFormats={[]} placeholder={__('Checkbox text', 'ashlar')} />
                                </div>

                                <span className="btn qform__submit">
                                    <RichText tagName="span" className="btn__label" value={a.submitLabel} onChange={set('submitLabel')} allowedFormats={[]} placeholder={__('Button', 'ashlar')} />
                                    <Arrow className="btn__icon" />
                                </span>
                                <RichText tagName="p" className="qform__privacy" value={a.privacy} onChange={set('privacy')} allowedFormats={[]} placeholder={__('Privacy note (optional)', 'ashlar')} />
                            </div>
                        )}
                    </div>

                    <div className="quote__talk">
                        <RichText tagName="h2" className="quote__talk-title" value={a.talkTitle} onChange={set('talkTitle')} allowedFormats={[]} placeholder={__('Prefer to talk?', 'ashlar')} />
                        {/* POST: ServerSideRender manda también los atributos por defecto (las cifras) y por GET la URL pasaba del límite (414). */}
                        <Disabled>
                            <ServerSideRender block="ashlar/quote" httpMethod="POST" attributes={{ phoneLabel: a.phoneLabel, emailLabel: a.emailLabel, emailNote: a.emailNote, addressLabel: a.addressLabel, addressNote: a.addressNote, preview: 'channels' }} />
                        </Disabled>
                        <div className="quote__next">
                            <RichText tagName="h3" className="quote__label" value={a.nextLabel} onChange={set('nextLabel')} allowedFormats={[]} placeholder={__('What happens next', 'ashlar')} />
                            <ol className="quote__steps">
                                {a.steps.map((step, index) => (
                                    <li className="ashlar-item" key={index}>
                                        <ItemActions index={index} count={a.steps.length} min={0} label={__('Step', 'ashlar')} onMove={(from, to) => setAttributes({ steps: moveItem(a.steps, from, to) })} onRemove={(i) => setAttributes({ steps: removeItem(a.steps, i) })} />
                                        <span className="quote__step-num" aria-hidden="true">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <RichText tagName="p" className="quote__step-title" value={step.title} onChange={(title) => setAttributes({ steps: updateItem(a.steps, index, { title }) })} allowedFormats={[]} placeholder={__('Step', 'ashlar')} />
                                            <RichText tagName="p" className="quote__step-text" value={step.text} onChange={(text) => setAttributes({ steps: updateItem(a.steps, index, { text }) })} allowedFormats={[]} placeholder={__('One line about it', 'ashlar')} />
                                        </div>
                                    </li>
                                ))}
                            </ol>
                            <AddItem label={__('Add step', 'ashlar')} count={a.steps.length} max={5} onClick={() => setAttributes({ steps: [...a.steps, { title: '', text: '' }] })} />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
