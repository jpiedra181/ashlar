import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, __experimentalNumberControl as NumberControl } from '@wordpress/components';
import Chapter from '../../components/chapter';
import SectionTheme, { themeClass } from '../../components/section-theme';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';
import { barWidth, countText } from './parts';

/**
 * Edit de «Where we build»: los nombres se escriben encima; el número de
 * proyectos de cada zona, en el panel lateral (las barras se recalculan solas).
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, chapterNum, chapterLabel, title, lede, countFormat, areas } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const setAreas = (next) => setAttributes({ areas: next });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                </PanelBody>
                <PanelBody title={__('Projects per area', 'ashlar')} initialOpen>
                    {areas.map((area, index) => (
                        <NumberControl
                            key={index}
                            __next40pxDefaultSize
                            label={(area.name || __('Area', 'ashlar')).replace(/<[^>]+>/g, '')}
                            min={0}
                            value={area.count}
                            onChange={(value) => setAreas(updateItem(areas, index, { count: parseInt(value, 10) || 0 }))}
                        />
                    ))}
                    <TextControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Count text', 'ashlar')} help={__('{n} is replaced with the number.', 'ashlar')} value={countFormat} onChange={set('countFormat')} />
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: ['boroughs', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
                <div className="boroughs__inner wrap">
                    <header className="boroughs__head">
                        <div className="boroughs__heading">
                            <Chapter edit num={chapterNum} label={chapterLabel} onChange={({ num, label }) => setAttributes({ ...(num !== undefined && { chapterNum: num }), ...(label !== undefined && { chapterLabel: label }) })} />
                            <RichText tagName="h2" className="boroughs__title" value={title} onChange={set('title')} allowedFormats={[]} placeholder={__('Section headline', 'ashlar')} />
                        </div>
                        <RichText tagName="p" className="boroughs__lede" value={lede} onChange={set('lede')} allowedFormats={[]} placeholder={__('Short introduction (optional)', 'ashlar')} />
                    </header>
                    <ul className="boroughs__list">
                        {areas.map((area, index) => (
                            <li className="boroughs__row ashlar-item" key={index}>
                                <ItemActions index={index} count={areas.length} label={__('Area', 'ashlar')} onMove={(from, to) => setAreas(moveItem(areas, from, to))} onRemove={(i) => setAreas(removeItem(areas, i))} />
                                <RichText tagName="span" className="boroughs__name" value={area.name} onChange={(name) => setAreas(updateItem(areas, index, { name }))} allowedFormats={[]} placeholder={__('Area', 'ashlar')} />
                                <span className="boroughs__bar" aria-hidden="true">
                                    <span style={{ width: barWidth(area.count, areas) }} />
                                </span>
                                <span className="boroughs__count">{countText(countFormat, area.count)}</span>
                            </li>
                        ))}
                    </ul>
                    <AddItem label={__('Add area', 'ashlar')} count={areas.length} max={10} onClick={() => setAreas([...areas, { name: '', count: 0 }])} />
                </div>
            </section>
        </>
    );
}
