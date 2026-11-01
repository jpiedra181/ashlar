import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, __experimentalNumberControl as NumberControl } from '@wordpress/components';
import { tickerProgress } from './style-vars';

/**
 * Edit de «On site now». Los textos se escriben encima; las semanas, en el
 * panel (la barra y el porcentaje se calculan solos).
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { label, site, weekCurrent, weekTotal, capacity } = attributes;
    const progress = tickerProgress(attributes);
    const set = (key) => (value) => setAttributes({ [key]: value });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Progress', 'ashlar')} initialOpen>
                    <NumberControl __next40pxDefaultSize label={__('Current week', 'ashlar')} min={0} value={weekCurrent} onChange={(value) => setAttributes({ weekCurrent: parseInt(value, 10) || 0 })} />
                    <NumberControl __next40pxDefaultSize label={__('Total weeks', 'ashlar')} min={1} value={weekTotal} onChange={(value) => setAttributes({ weekTotal: parseInt(value, 10) || 1 })} />
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Week text', 'ashlar')} help={__('{current} and {total} are replaced with the weeks.', 'ashlar')} value={attributes.weekFormat} onChange={(value) => setAttributes({ weekFormat: value })} />
                    <p>{__('The bar and the percentage are calculated from the weeks.', 'ashlar')}</p>
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: 'ticker theme-dark', style: progress.style })}>
                <div className="ticker__inner wrap">
                    <p className="ticker__live">
                        <RichText tagName="span" className="ticker__tag" value={label} onChange={set('label')} allowedFormats={[]} placeholder={__('On site now', 'ashlar')} />
                        <span className="ticker__site">
                            <RichText tagName="span" value={site} onChange={set('site')} allowedFormats={[]} placeholder={__('Street, postcode — type of job', 'ashlar')} /> · {progress.week}
                        </span>
                        <span className="ticker__progress" aria-hidden="true">
                            <span className="ticker__track">
                                <span className="ticker__fill" />
                            </span>
                            <span className="ticker__pct">{progress.percent}%</span>
                        </span>
                    </p>
                    <RichText tagName="p" className="ticker__capacity" value={capacity} onChange={set('capacity')} allowedFormats={[]} placeholder={__('Live sites · next start (optional)', 'ashlar')} />
                </div>
            </section>
        </>
    );
}
