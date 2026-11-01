import { useBlockProps, RichText } from '@wordpress/block-editor';
import Button from '../../components/button';
import Chapter from '../../components/chapter';
import Media from '../../components/media';
import { Arrow } from '../../components/icons';
import { themeClass } from '../../components/section-theme';
import { stepTag, Marker } from './parts';

/**
 * Save de «How it works».
 *
 * Se guarda un markup neutro y completo: la cabecera, una fila de pestañas
 * (oculta hasta que llega el JS) y TODOS los pasos, cada uno con su botón de
 * acordeón (también oculto sin JS). view.js decide el patrón según el ancho:
 *
 *  - ≥1024 px: pestañas ARIA (tablist / tab / tabpanel, flechas del teclado);
 *  - <1024 px: acordeón (botones con aria-expanded).
 *
 * Sin JavaScript se leen los cinco pasos seguidos, sin perder nada. Los id
 * y los roles ARIA los pone view.js (así un bloque duplicado no repite id).
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, chapterNum, chapterLabel, title, lede, stats, youDoLabel, weDoLabel, youGetLabel, youPayLabel, stepTagFormat, footnote, prevLabel, lastUrl, helpText, helpLink, helpUrl, steps } = attributes;
    const total = steps.length;

    return (
        <section {...useBlockProps.save({ className: ['process', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
            <div className="process__inner wrap">
                <header className="process__head">
                    <div className="process__heading">
                        <Chapter num={chapterNum} label={chapterLabel} />
                        <RichText.Content tagName="h2" className="process__title" value={title} data-split="" />
                    </div>
                    <div className="process__intro" data-reveal="">
                        <RichText.Content tagName="p" className="process__lede" value={lede} />
                        {stats.length > 0 && (
                            <ul className="process__stats">
                                {stats.map((stat, index) => (
                                    <li key={index}>
                                        <RichText.Content tagName="span" className="process__stat-value" value={stat.value} /> <RichText.Content tagName="span" className="process__stat-label" value={stat.label} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </header>

                <div className="process__steps" data-process="">
                    <div className="process__tabs" data-process-tabs="">
                        {steps.map((step, index) => (
                            <button type="button" className="process__tab" data-process-tab={index} key={index}>
                                <span className="process__tab-top">
                                    <Marker index={index} />
                                    <RichText.Content tagName="span" className="process__tab-when" value={step.when} />
                                </span>
                                <RichText.Content tagName="span" className="process__tab-label" value={step.label} />
                            </button>
                        ))}
                    </div>

                    {steps.map((step, index) => {
                        const isLast = index === total - 1;

                        return (
                            <div className="pstep" data-process-step={index} key={index}>
                                <button type="button" className="pstep__toggle" data-process-toggle={index}>
                                    <Marker index={index} />
                                    <span className="pstep__toggle-text">
                                        <RichText.Content tagName="span" className="pstep__toggle-when" value={step.when} />
                                        <RichText.Content tagName="span" className="pstep__toggle-label" value={step.label} />
                                        <RichText.Content tagName="span" className="pstep__toggle-title" value={step.title} />
                                    </span>
                                    <svg className="pstep__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false">
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </button>

                                <div className="pstep__body" data-process-body="">
                                    <Media image={step.image} className="pstep__media" sizes="(min-width: 1024px) 500px, 100vw">
                                        <span className="pstep__media-empty" />
                                    </Media>
                                    <span className="pstep__tag" aria-hidden="true">
                                        {stepTag(stepTagFormat, index, total)}
                                    </span>

                                    <div className="pstep__content">
                                        <div className="pstep__heading">
                                            <RichText.Content tagName="p" className="pstep__when" value={step.when} />
                                            <RichText.Content tagName="h3" className="pstep__title" value={step.title} />
                                            <RichText.Content tagName="p" className="pstep__lede" value={step.lede} />
                                        </div>

                                        <div className="pstep__roles">
                                            {[
                                                [youDoLabel, step.youDo],
                                                [weDoLabel, step.weDo],
                                            ].map(([label, items], roleIndex) => (
                                                <div className="pstep__role" key={roleIndex}>
                                                    <RichText.Content tagName="p" className="pstep__role-label" value={label} />
                                                    <ul>
                                                        {(items || []).map((item, itemIndex) => (
                                                            <RichText.Content tagName="li" value={item} key={itemIndex} />
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>

                                        <dl className="pstep__outcome">
                                            <div className="pstep__box">
                                                <RichText.Content tagName="dt" value={youGetLabel} />
                                                <RichText.Content tagName="dd" value={step.youGet} />
                                            </div>
                                            <div className="pstep__box pstep__box--pay">
                                                <RichText.Content tagName="dt" value={youPayLabel} />
                                                <RichText.Content tagName="dd" value={step.youPay} />
                                            </div>
                                        </dl>

                                        <div className="pstep__nav">
                                            {index === 0 ? (
                                                <RichText.Content tagName="p" className="pstep__footnote" value={footnote} />
                                            ) : (
                                                <button type="button" className="pstep__prev" data-process-go={index - 1}>
                                                    <Arrow direction="left" />
                                                    <RichText.Content value={prevLabel} />
                                                </button>
                                            )}
                                            {isLast ? (
                                                <Button url={lastUrl} variant="secondary">
                                                    <RichText.Content value={step.next} />
                                                </Button>
                                            ) : (
                                                <button type="button" className="btn btn--secondary pstep__next" data-process-go={index + 1}>
                                                    <RichText.Content tagName="span" className="btn__label" value={step.next} />
                                                    <Arrow className="btn__icon" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {(helpText || helpLink) && (
                    <p className="process__help" data-reveal="">
                        <RichText.Content value={helpText} />{' '}
                        {helpLink && (
                            <a className="link" href={helpUrl || undefined}>
                                <RichText.Content value={helpLink} />
                                <Arrow />
                            </a>
                        )}
                    </p>
                )}
            </div>
        </section>
    );
}
