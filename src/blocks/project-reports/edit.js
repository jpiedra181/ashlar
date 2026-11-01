import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import Chapter from '../../components/chapter';
import Media, { MediaPlaceholder } from '../../components/media';
import MediaField from '../../components/media-field';
import SectionTheme, { themeClass } from '../../components/section-theme';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';

const NEW_REPORT = { date: '', status: '', late: false, image: {}, text: '', decision: '', signature: '' };

/**
 * Edit de «From the Friday reports».
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, chapterNum, chapterLabel, title, lede, decisionLabel, reports } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const setReports = (next) => setAttributes({ reports: next });
    const field = (index, key, tagName, className, placeholder) => (
        <RichText tagName={tagName} className={className} value={reports[index][key]} onChange={(value) => setReports(updateItem(reports, index, { [key]: value }))} allowedFormats={[]} placeholder={placeholder} />
    );

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                </PanelBody>
                <PanelBody title={__('Reports', 'ashlar')} initialOpen>
                    {reports.map((report, index) => (
                        <div className="ashlar-fieldset" key={index}>
                            <p className="ashlar-fieldset__label">{(report.date || `${__('Report', 'ashlar')} ${index + 1}`).replace(/<[^>]+>/g, '')}</p>
                            <ToggleControl __nextHasNoMarginBottom label={__('Behind programme', 'ashlar')} help={__('Shows the status in orange instead of green.', 'ashlar')} checked={Boolean(report.late)} onChange={(late) => setReports(updateItem(reports, index, { late }))} />
                            <MediaField label={__('Photo', 'ashlar')} value={report.image} onChange={(image) => setReports(updateItem(reports, index, { image }))} focal />
                        </div>
                    ))}
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: ['project-reports', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
                <div className="project-reports__inner wrap">
                    <header className="project-reports__head">
                        <div className="project-reports__heading">
                            <Chapter edit num={chapterNum} label={chapterLabel} onChange={({ num, label }) => setAttributes({ ...(num !== undefined && { chapterNum: num }), ...(label !== undefined && { chapterLabel: label }) })} />
                            <RichText tagName="h2" className="project-reports__title" value={title} onChange={set('title')} allowedFormats={[]} placeholder={__('Section headline', 'ashlar')} />
                        </div>
                        <RichText tagName="p" className="project-reports__lede" value={lede} onChange={set('lede')} allowedFormats={[]} placeholder={__('Short introduction (optional)', 'ashlar')} />
                    </header>

                    <ul className="project-reports__list">
                        {reports.map((report, index) => (
                            <li className="report ashlar-item" key={index}>
                                <ItemActions index={index} count={reports.length} label={__('Report', 'ashlar')} onMove={(from, to) => setReports(moveItem(reports, from, to))} onRemove={(i) => setReports(removeItem(reports, i))} />
                                <article className="report__card">
                                    <header className="report__head">
                                        {field(index, 'date', 'h3', 'report__date', __('Week 3 · Fri 7 Mar', 'ashlar'))}
                                        {field(index, 'status', 'p', ['report__status', report.late && 'is-late'].filter(Boolean).join(' '), __('On programme', 'ashlar'))}
                                    </header>
                                    <Media image={report.image} className="report__media">
                                        <MediaPlaceholder image={report.image} onChange={(image) => setReports(updateItem(reports, index, { image }))} />
                                    </Media>
                                    {field(index, 'text', 'p', 'report__text', __('What happened this week', 'ashlar'))}
                                    <div className={['report__decision', !report.decision && 'is-empty'].filter(Boolean).join(' ')}>
                                        <RichText tagName="p" className="report__decision-label" value={decisionLabel} onChange={set('decisionLabel')} allowedFormats={[]} />
                                        {field(index, 'decision', 'p', 'report__decision-text', __('Decision needed from the client (optional)', 'ashlar'))}
                                    </div>
                                    {field(index, 'signature', 'p', 'report__signature', __('— Name, role', 'ashlar'))}
                                </article>
                            </li>
                        ))}
                    </ul>
                    <AddItem label={__('Add report', 'ashlar')} count={reports.length} max={6} onClick={() => setReports([...reports, { ...NEW_REPORT }])} />
                </div>
            </section>
        </>
    );
}
