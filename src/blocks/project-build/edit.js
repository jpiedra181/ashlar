import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl, RangeControl, __experimentalNumberControl as NumberControl } from '@wordpress/components';
import Chapter from '../../components/chapter';
import Media, { MediaPlaceholder } from '../../components/media';
import MediaField from '../../components/media-field';
import SectionTheme, { themeClass } from '../../components/section-theme';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';
import Programme from './programme';

const NEW_TASK = { name: '', planStart: 1, planEnd: 2, actualStart: 1, actualEnd: 2, note: '' };

/**
 * Edit de «On site»: pies de foto, nombres de tarea y notas se escriben en
 * el lienzo; las semanas de cada tarea, en el panel «Programme».
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, chapterNum, chapterLabel, title, lede, photos, showProgramme, weeks, tasks } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const setPhotos = (next) => setAttributes({ photos: next });
    const setTasks = (next) => setAttributes({ tasks: next });
    const week = (index, key) => (
        <NumberControl __next40pxDefaultSize label={key.includes('Start') ? __('From week', 'ashlar') : __('To week', 'ashlar')} min={1} max={weeks} value={tasks[index][key]} onChange={(value) => setTasks(updateItem(tasks, index, { [key]: parseInt(value, 10) || 1 }))} />
    );

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                </PanelBody>
                <PanelBody title={__('Photos', 'ashlar')} initialOpen={false}>
                    {photos.map((photo, index) => (
                        <MediaField key={index} label={`${__('Photo', 'ashlar')} ${index + 1}`} value={photo.image} onChange={(image) => setPhotos(updateItem(photos, index, { image }))} focal />
                    ))}
                </PanelBody>
                <PanelBody title={__('Programme', 'ashlar')} initialOpen={false}>
                    <ToggleControl __nextHasNoMarginBottom label={__('Show the programme', 'ashlar')} checked={showProgramme} onChange={set('showProgramme')} />
                    <RangeControl __nextHasNoMarginBottom __next40pxDefaultSize label={__('Length of the job (weeks)', 'ashlar')} value={weeks} onChange={(value) => setAttributes({ weeks: value ?? 22 })} min={2} max={60} />
                    {tasks.map((task, index) => (
                        <fieldset className="ashlar-fieldset" key={index}>
                            <legend>{(task.name || `${__('Task', 'ashlar')} ${index + 1}`).replace(/<[^>]+>/g, '').replace('&amp;', '&')}</legend>
                            <p className="ashlar-fieldset__label">{__('Planned', 'ashlar')}</p>
                            <div className="ashlar-fieldset__row">
                                {week(index, 'planStart')}
                                {week(index, 'planEnd')}
                            </div>
                            <p className="ashlar-fieldset__label">{__('Actual', 'ashlar')}</p>
                            <div className="ashlar-fieldset__row">
                                {week(index, 'actualStart')}
                                {week(index, 'actualEnd')}
                            </div>
                        </fieldset>
                    ))}
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: ['project-build', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
                <div className="project-build__inner wrap">
                    <header className="project-build__head">
                        <div className="project-build__heading">
                            <Chapter edit num={chapterNum} label={chapterLabel} onChange={({ num, label }) => setAttributes({ ...(num !== undefined && { chapterNum: num }), ...(label !== undefined && { chapterLabel: label }) })} />
                            <RichText tagName="h2" className="project-build__title" value={title} onChange={set('title')} allowedFormats={[]} placeholder={__('Section headline', 'ashlar')} />
                        </div>
                        <RichText tagName="p" className="project-build__lede" value={lede} onChange={set('lede')} allowedFormats={[]} placeholder={__('Short introduction (optional)', 'ashlar')} />
                    </header>

                    <div className="project-build__photos">
                        {photos.map((photo, index) => (
                            <figure className={`project-build__photo project-build__photo--${index + 1}`} key={index}>
                                <Media image={photo.image} className="project-build__media">
                                    <MediaPlaceholder image={photo.image} onChange={(image) => setPhotos(updateItem(photos, index, { image }))} />
                                </Media>
                                <RichText tagName="figcaption" value={photo.caption} onChange={(caption) => setPhotos(updateItem(photos, index, { caption }))} allowedFormats={[]} placeholder={__('Week — what it shows', 'ashlar')} />
                            </figure>
                        ))}
                    </div>

                    {showProgramme && (
                        <div className="project-build__programme-edit">
                            <Programme
                                attributes={attributes}
                                edit
                                onChange={setAttributes}
                                actions={(index) => <ItemActions index={index} count={tasks.length} label={__('Task', 'ashlar')} onMove={(from, to) => setTasks(moveItem(tasks, from, to))} onRemove={(i) => setTasks(removeItem(tasks, i))} />}
                            />
                            <AddItem label={__('Add task', 'ashlar')} count={tasks.length} max={14} onClick={() => setTasks([...tasks, { ...NEW_TASK }])} />
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
