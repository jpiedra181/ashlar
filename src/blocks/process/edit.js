import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import Button from '../../components/button';
import Chapter from '../../components/chapter';
import Media, { MediaPlaceholder } from '../../components/media';
import MediaField from '../../components/media-field';
import LinkField from '../../components/link-field';
import SectionTheme, { themeClass } from '../../components/section-theme';
import { Arrow } from '../../components/icons';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';
import { stepTag, Marker } from './parts';

const EMPTY_STEP = { when: '', label: '', title: '', lede: '', youDo: [''], weDo: [''], youGet: '', youPay: '', next: '', image: {} };

/**
 * Edit de «How it works».
 *
 * En el lienzo se ve siempre el modo pestañas: se pulsa una pestaña para
 * editar ese paso. Todo se escribe encima; los pasos, las cifras y los puntos
 * de cada lista se añaden, quitan y reordenan en el propio lienzo.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, chapterNum, chapterLabel, title, lede, stats, youDoLabel, weDoLabel, youGetLabel, youPayLabel, stepTagFormat, footnote, prevLabel, lastUrl, helpText, helpLink, helpUrl, steps } = attributes;
    const [current, setCurrent] = useState(0);
    const active = Math.min(current, steps.length - 1);
    const step = steps[active];
    const total = steps.length;
    const isLast = active === total - 1;

    const set = (key) => (value) => setAttributes({ [key]: value });
    const setStats = (next) => setAttributes({ stats: next });
    const setSteps = (next) => setAttributes({ steps: next });
    const setStep = (data) => setSteps(updateItem(steps, active, data));

    const list = (key, label) => {
        const items = step[key] || [];
        const setItems = (next) => setStep({ [key]: next });

        return (
            <div className="pstep__role">
                <RichText tagName="p" className="pstep__role-label" value={label} onChange={set(key === 'youDo' ? 'youDoLabel' : 'weDoLabel')} allowedFormats={[]} />
                <ul>
                    {items.map((item, index) => (
                        <li className="ashlar-item" key={index}>
                            <ItemActions index={index} count={items.length} label={__('Point', 'ashlar')} onMove={(from, to) => setItems(moveItem(items, from, to))} onRemove={(i) => setItems(removeItem(items, i))} />
                            <RichText tagName="span" value={item} onChange={(value) => setItems(items.map((v, i) => (i === index ? value : v)))} allowedFormats={[]} placeholder={__('One short point', 'ashlar')} />
                        </li>
                    ))}
                </ul>
                <AddItem label={__('Add point', 'ashlar')} count={items.length} max={4} onClick={() => setItems([...items, ''])} />
            </div>
        );
    };

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                </PanelBody>
                <PanelBody title={__('Step photo', 'ashlar')} initialOpen>
                    <MediaField label={`${step.label || __('Step', 'ashlar')} · ${__('photo', 'ashlar')}`} value={step.image} onChange={(image) => setStep({ image })} focal />
                </PanelBody>
                <PanelBody title={__('Links', 'ashlar')} initialOpen={false}>
                    <LinkField label={__('Last step button', 'ashlar')} value={lastUrl} onChange={set('lastUrl')} />
                    <LinkField label={__('Help link', 'ashlar')} value={helpUrl} onChange={set('helpUrl')} help={__('For a phone number use tel:02079460321.', 'ashlar')} />
                </PanelBody>
                <PanelBody title={__('Small print', 'ashlar')} initialOpen={false}>
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Step tag', 'ashlar')} value={stepTagFormat} onChange={set('stepTagFormat')} help={__('{n} is the step number and {total} the number of steps.', 'ashlar')} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('“Previous” button', 'ashlar')} value={prevLabel} onChange={set('prevLabel')} />
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: ['process', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
                <div className="process__inner wrap">
                    <header className="process__head">
                        <div className="process__heading">
                            <Chapter edit num={chapterNum} label={chapterLabel} onChange={({ num, label }) => setAttributes({ ...(num !== undefined && { chapterNum: num }), ...(label !== undefined && { chapterLabel: label }) })} />
                            <RichText tagName="h2" className="process__title" value={title} onChange={set('title')} allowedFormats={[]} placeholder={__('Section headline', 'ashlar')} />
                        </div>
                        <div className="process__intro">
                            <RichText tagName="p" className="process__lede" value={lede} onChange={set('lede')} allowedFormats={[]} placeholder={__('Short introduction', 'ashlar')} />
                            <ul className="process__stats">
                                {stats.map((stat, index) => (
                                    <li className="ashlar-item" key={index}>
                                        <ItemActions index={index} count={stats.length} min={0} label={__('Figure', 'ashlar')} onMove={(from, to) => setStats(moveItem(stats, from, to))} onRemove={(i) => setStats(removeItem(stats, i))} />
                                        <RichText tagName="span" className="process__stat-value" value={stat.value} onChange={(value) => setStats(updateItem(stats, index, { value }))} allowedFormats={[]} placeholder="5" />{' '}
                                        <RichText tagName="span" className="process__stat-label" value={stat.label} onChange={(value) => setStats(updateItem(stats, index, { label: value }))} allowedFormats={[]} placeholder={__('Label', 'ashlar')} />
                                    </li>
                                ))}
                            </ul>
                            <AddItem label={__('Add figure', 'ashlar')} count={stats.length} max={4} onClick={() => setStats([...stats, { value: '', label: '' }])} />
                        </div>
                    </header>

                    <div className="process__steps is-ready is-tabs">
                        <div className="process__tabs">
                            {steps.map((item, index) => (
                                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                                <div className={['process__tab', 'ashlar-item', index === active && 'is-active', index < active && 'is-done'].filter(Boolean).join(' ')} key={index} onClick={() => setCurrent(index)}>
                                    {index === active && (
                                        <ItemActions
                                            index={index}
                                            count={steps.length}
                                            min={2}
                                            label={__('Step', 'ashlar')}
                                            onMove={(from, to) => {
                                                setSteps(moveItem(steps, from, to));
                                                setCurrent(to);
                                            }}
                                            onRemove={(i) => {
                                                setSteps(removeItem(steps, i));
                                                setCurrent(Math.max(0, i - 1));
                                            }}
                                        />
                                    )}
                                    <span className="process__tab-top">
                                        <Marker index={index} />
                                        <RichText tagName="span" className="process__tab-when" value={item.when} onChange={(value) => setSteps(updateItem(steps, index, { when: value }))} allowedFormats={[]} placeholder={__('Weeks 0–2', 'ashlar')} />
                                    </span>
                                    <RichText tagName="span" className="process__tab-label" value={item.label} onChange={(value) => setSteps(updateItem(steps, index, { label: value }))} allowedFormats={[]} placeholder={__('Short name', 'ashlar')} />
                                </div>
                            ))}
                        </div>
                        <AddItem
                            label={__('Add step', 'ashlar')}
                            count={steps.length}
                            max={7}
                            onClick={() => {
                                setSteps([...steps, { ...EMPTY_STEP }]);
                                setCurrent(steps.length);
                            }}
                        />

                        <div className="pstep">
                            <div className="pstep__body">
                                <Media image={step.image} className="pstep__media">
                                    <MediaPlaceholder image={step.image} onChange={(image) => setStep({ image })} />
                                </Media>
                                <span className="pstep__tag">{stepTag(stepTagFormat, active, total)}</span>

                                <div className="pstep__content">
                                    <div className="pstep__heading">
                                        <p className="pstep__when">{step.when}</p>
                                        <RichText tagName="h3" className="pstep__title" value={step.title} onChange={(value) => setStep({ title: value })} allowedFormats={[]} placeholder={__('What happens, in one line', 'ashlar')} />
                                        <RichText tagName="p" className="pstep__lede" value={step.lede} onChange={(value) => setStep({ lede: value })} allowedFormats={[]} placeholder={__('Two sentences in plain English', 'ashlar')} />
                                    </div>

                                    <div className="pstep__roles">
                                        {list('youDo', youDoLabel)}
                                        {list('weDo', weDoLabel)}
                                    </div>

                                    <dl className="pstep__outcome">
                                        <div className="pstep__box">
                                            <RichText tagName="dt" value={youGetLabel} onChange={set('youGetLabel')} allowedFormats={[]} />
                                            <RichText tagName="dd" value={step.youGet} onChange={(value) => setStep({ youGet: value })} allowedFormats={[]} placeholder={__('What the client gets', 'ashlar')} />
                                        </div>
                                        <div className="pstep__box pstep__box--pay">
                                            <RichText tagName="dt" value={youPayLabel} onChange={set('youPayLabel')} allowedFormats={[]} />
                                            <RichText tagName="dd" value={step.youPay} onChange={(value) => setStep({ youPay: value })} allowedFormats={[]} placeholder={__('What the client pays, and when', 'ashlar')} />
                                        </div>
                                    </dl>

                                    <div className="pstep__nav">
                                        {active === 0 ? (
                                            <RichText tagName="p" className="pstep__footnote" value={footnote} onChange={set('footnote')} allowedFormats={[]} placeholder={__('Footnote (optional)', 'ashlar')} />
                                        ) : (
                                            <span className="pstep__prev">
                                                <Arrow direction="left" />
                                                {prevLabel}
                                            </span>
                                        )}
                                        <Button variant="secondary">
                                            <RichText tagName="span" value={step.next} onChange={(value) => setStep({ next: value })} allowedFormats={[]} placeholder={isLast ? __('Last button', 'ashlar') : __('Next: …', 'ashlar')} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="process__help">
                        <RichText tagName="span" value={helpText} onChange={set('helpText')} allowedFormats={[]} placeholder={__('Help line (optional)', 'ashlar')} />{' '}
                        <span className="link">
                            <RichText tagName="span" value={helpLink} onChange={set('helpLink')} allowedFormats={[]} placeholder={__('Link text', 'ashlar')} />
                            <Arrow />
                        </span>
                    </p>
                </div>
            </section>
        </>
    );
}
