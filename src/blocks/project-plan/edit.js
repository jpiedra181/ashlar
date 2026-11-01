import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';
import Chapter from '../../components/chapter';
import Media, { MediaPlaceholder } from '../../components/media';
import MediaField from '../../components/media-field';
import SectionTheme, { themeClass } from '../../components/section-theme';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';

const LINE_TYPES = [
    { label: __('Solid dark line (existing)', 'ashlar'), value: 'existing' },
    { label: __('Thick orange line (new)', 'ashlar'), value: 'new' },
    { label: __('Dashed grey line (removed)', 'ashlar'), value: 'removed' },
    { label: __('Dashed orange line (rooflight)', 'ashlar'), value: 'rooflight' },
];

/**
 * Edit de «The plan»: rótulos y leyenda encima; los planos se eligen en el
 * lienzo o en el panel (con su texto alternativo, que describe el plano).
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, chapterNum, chapterLabel, title, lede, plans, legend, scale } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const setPlans = (next) => setAttributes({ plans: next });
    const setLegend = (next) => setAttributes({ legend: next });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                </PanelBody>
                <PanelBody title={__('Plans', 'ashlar')} initialOpen>
                    {plans.map((plan, index) => (
                        <MediaField
                            key={index}
                            label={(plan.title || __('Plan', 'ashlar')).replace(/<[^>]+>/g, '')}
                            help={__('Describe what the plan shows in the alternative text (rooms and sizes).', 'ashlar')}
                            value={plan.image}
                            onChange={(image) => setPlans(updateItem(plans, index, { image }))}
                        />
                    ))}
                </PanelBody>
                <PanelBody title={__('Key', 'ashlar')} initialOpen={false}>
                    {legend.map((item, index) => (
                        <SelectControl
                            key={index}
                            __nextHasNoMarginBottom
                            __next40pxDefaultSize
                            label={(item.label || __('Line', 'ashlar')).replace(/<[^>]+>/g, '')}
                            value={item.type}
                            options={LINE_TYPES}
                            onChange={(type) => setLegend(updateItem(legend, index, { type }))}
                        />
                    ))}
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: ['project-plan', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
                <div className="project-plan__inner wrap">
                    <header className="project-plan__head">
                        <div className="project-plan__heading">
                            <Chapter edit num={chapterNum} label={chapterLabel} onChange={({ num, label }) => setAttributes({ ...(num !== undefined && { chapterNum: num }), ...(label !== undefined && { chapterLabel: label }) })} />
                            <RichText tagName="h2" className="project-plan__title" value={title} onChange={set('title')} allowedFormats={['core/superscript']} placeholder={__('Section headline', 'ashlar')} />
                        </div>
                        <RichText tagName="p" className="project-plan__lede" value={lede} onChange={set('lede')} allowedFormats={[]} placeholder={__('Short introduction (optional)', 'ashlar')} />
                    </header>

                    <div className="project-plan__sheets">
                        {plans.map((plan, index) => (
                            <figure className={['project-plan__sheet', index > 0 && 'is-result'].filter(Boolean).join(' ')} key={index}>
                                <figcaption className="project-plan__sheet-head">
                                    <RichText tagName="span" className="project-plan__sheet-title" value={plan.title} onChange={(value) => setPlans(updateItem(plans, index, { title: value }))} allowedFormats={[]} placeholder={__('Before', 'ashlar')} />
                                    <RichText tagName="span" className="project-plan__sheet-label" value={plan.label} onChange={(value) => setPlans(updateItem(plans, index, { label: value }))} allowedFormats={[]} placeholder={__('Floor · m²', 'ashlar')} />
                                </figcaption>
                                <Media image={plan.image} className="project-plan__drawing">
                                    <MediaPlaceholder image={plan.image} onChange={(image) => setPlans(updateItem(plans, index, { image }))} label={__('Choose plan', 'ashlar')} />
                                </Media>
                            </figure>
                        ))}
                    </div>

                    <ul className="project-plan__legend">
                        {legend.map((item, index) => (
                            <li className="ashlar-item" key={index}>
                                <ItemActions index={index} count={legend.length} min={0} label={__('Key item', 'ashlar')} onMove={(from, to) => setLegend(moveItem(legend, from, to))} onRemove={(i) => setLegend(removeItem(legend, i))} />
                                <span className={`project-plan__swatch project-plan__swatch--${item.type}`} aria-hidden="true" />
                                <RichText tagName="span" value={item.label} onChange={(value) => setLegend(updateItem(legend, index, { label: value }))} allowedFormats={[]} placeholder={__('What the line means', 'ashlar')} />
                            </li>
                        ))}
                        <RichText tagName="li" className="project-plan__scale" value={scale} onChange={set('scale')} allowedFormats={[]} placeholder={__('Scale (optional)', 'ashlar')} />
                    </ul>
                    <AddItem label={__('Add key item', 'ashlar')} count={legend.length} max={6} onClick={() => setLegend([...legend, { type: 'existing', label: '' }])} />
                </div>
            </section>
        </>
    );
}
