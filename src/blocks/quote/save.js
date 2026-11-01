import { useBlockProps, RichText } from '@wordpress/block-editor';
import Media from '../../components/media';
import IntroTitle from '../../components/intro-title';
import { Arrow } from '../../components/icons';

/** Campos de contacto (rótulos y errores fijos: son parte de la accesibilidad del formulario). */
export const FIELDS = [
    { name: 'name', label: 'Name', type: 'text', autoComplete: 'name', placeholder: 'Your name', error: 'Tell us your name.' },
    { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel', placeholder: '07…', error: 'Enter a phone number Marta can call, e.g. 07700 900123.' },
    { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'you@example.com', error: 'Enter an email address like name@example.com.' },
    { name: 'postcode', label: 'Postcode', type: 'text', autoComplete: 'postal-code', placeholder: 'e.g. NW3 2AB', error: 'Enter your postcode, or just the first part, e.g. NW3.' },
];

/** Las tres preguntas de opciones: atributo de opciones, rótulo y error. */
export const QUESTIONS = [
    { name: 'service', options: 'services', label: 'serviceLabel', error: 'Choose what you’re planning.' },
    { name: 'size', options: 'sizes', label: 'sizeLabel', error: 'Choose roughly how big it is, or “Not sure”.' },
    { name: 'start', options: 'starts', label: 'startLabel', error: 'Choose when you’d like to start.' },
];

/**
 * Save del formulario de presupuesto (Contact).
 *
 * Bloque híbrido: este HTML lleva los textos y el formulario; render.php lo
 * completa con lo que vive fuera del bloque (teléfono, email y dirección de
 * Options → Contact en <dl data-quote-channels>, el nonce, la dirección de
 * envío, las cifras de la horquilla y, tras un envío sin JavaScript, el
 * agradecimiento o el aviso). view.js valida, calcula la horquilla y envía
 * sin recargar (inc/messages.php).
 *
 * Orden del HTML = orden de lectura en móvil: intro, formulario y «Prefer to
 * talk?»; en escritorio la rejilla sube los canales a la columna izquierda.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const a = attributes;

    return (
        <section {...useBlockProps.save({ className: 'quote' })}>
            <div className="quote__inner wrap">
                <div className="quote__intro">
                    {a.eyebrow && <RichText.Content tagName="p" className="quote__eyebrow" value={a.eyebrow} data-intro="" style={{ '--i': 0 }} />}
                    <IntroTitle value={a.title} className="quote__title" start={1} />
                    {a.lede && <RichText.Content tagName="p" className="quote__lede" value={a.lede} data-intro="" style={{ '--i': 2 }} />}
                    {(a.whoName || a.portrait?.url) && (
                        <div className="quote__who" data-intro="" style={{ '--i': 3 }}>
                            {a.portrait?.url && <Media image={a.portrait} className="quote__portrait" sizes="64px" />}
                            <div className="quote__who-text">
                                <RichText.Content tagName="p" className="quote__who-name" value={a.whoName} />
                                {a.whoText && <RichText.Content tagName="p" className="quote__who-role" value={a.whoText} />}
                            </div>
                        </div>
                    )}
                </div>

                <div className="quote__card" id="quote" data-intro="" style={{ '--i': 3 }}>
                    <form className="qform" action="#" method="post" data-quote-form="">
                        <div className="qform__head">
                            <RichText.Content tagName="h2" className="qform__title" value={a.formTitle} />
                            {a.formNote && <RichText.Content tagName="p" className="qform__note" value={a.formNote} />}
                        </div>
                        <p className="visually-hidden">All fields are required unless marked optional.</p>

                        {QUESTIONS.map((question) => (
                            <fieldset className="qform__question" key={question.name} data-quote-group={question.name}>
                                <RichText.Content tagName="legend" className="qform__legend" value={a[question.label]} />
                                <div className="qform__options">
                                    {a[question.options].map((option) => (
                                        <label className="qform__option" key={option.value}>
                                            <input type="radio" name={question.name} value={option.value} required />
                                            <RichText.Content tagName="span" className="chip" value={option.label} />
                                        </label>
                                    ))}
                                </div>
                                <p id={`quote-${question.name}-error`} className="qform__error" hidden>
                                    {question.error}
                                </p>
                            </fieldset>
                        ))}

                        <div className="qform__ballpark" data-quote-ballpark="" hidden>
                            <RichText.Content tagName="p" className="qform__ballpark-label" value={a.ballparkLabel} />
                            <div aria-live="polite" aria-atomic="true">
                                <p className="qform__figure" data-quote-figure="" hidden>
                                    <span data-quote-price="" /> <span className="qform__time" data-quote-time="" />
                                </p>
                                <RichText.Content tagName="p" className="qform__basis" value={a.ballparkPrompt} data-quote-basis="" />
                            </div>
                        </div>

                        <fieldset className="qform__question qform__contact">
                            <RichText.Content tagName="legend" className="qform__legend" value={a.contactLabel} />
                            <div className="qform__fields">
                                {FIELDS.map((field) => (
                                    <div className="field" key={field.name}>
                                        <label htmlFor={`quote-${field.name}`} className="field__label">
                                            {field.label}
                                        </label>
                                        <input id={`quote-${field.name}`} name={field.name} type={field.type} className="field__input" autoComplete={field.autoComplete} placeholder={field.placeholder} required />
                                        <p id={`quote-${field.name}-error`} className="field__error" hidden>
                                            {field.error}
                                        </p>
                                    </div>
                                ))}
                                <div className="field field--wide">
                                    <label htmlFor="quote-message" className="field__label">
                                        <RichText.Content value={a.messageLabel} />
                                    </label>
                                    <textarea id="quote-message" name="message" rows="4" className="field__input" placeholder={a.messagePlaceholder} />
                                </div>
                            </div>
                        </fieldset>

                        <label className="qform__check">
                            <input type="checkbox" name="report" value="1" />
                            <RichText.Content tagName="span" value={a.reportLabel} />
                        </label>

                        <div className="qform__trap" aria-hidden="true">
                            <label htmlFor="quote-qf-hp">Leave this field empty</label>
                            <input id="quote-qf-hp" name="qf_hp" type="text" tabIndex="-1" autoComplete="off" />
                        </div>
                        <input type="hidden" name="action" value="ashlar_quote" />
                        <input type="hidden" name="ashlar_nonce" value="" data-quote-nonce="" />

                        <button type="submit" className="btn qform__submit">
                            <RichText.Content tagName="span" className="btn__label" value={a.submitLabel} />
                            <Arrow className="btn__icon" />
                        </button>
                        {a.privacy && <RichText.Content tagName="p" className="qform__privacy" value={a.privacy} />}
                        <p className="qform__status" role="status" data-quote-status="" />
                    </form>

                    <div className="qform__success" tabIndex="-1" hidden data-quote-success="">
                        <RichText.Content tagName="p" className="qform__success-eyebrow" value={a.successEyebrow} />
                        <RichText.Content tagName="h2" className="qform__success-title" value={a.successTitle} />
                        <RichText.Content tagName="p" className="qform__success-text" value={a.successText} />
                    </div>
                </div>

                <div className="quote__talk">
                    <RichText.Content tagName="h2" className="quote__talk-title" value={a.talkTitle} />
                    <dl className="quote__channels" data-quote-channels="" />
                    {a.steps.length > 0 && (
                        <div className="quote__next">
                            <RichText.Content tagName="h3" className="quote__label" value={a.nextLabel} />
                            <ol className="quote__steps">
                                {a.steps.map((step, index) => (
                                    <li key={index}>
                                        <span className="quote__step-num" aria-hidden="true">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <RichText.Content tagName="p" className="quote__step-title" value={step.title} />
                                            <RichText.Content tagName="p" className="quote__step-text" value={step.text} />
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
