/**
 * El programa de obra (diagrama de Gantt) de «On site», compartido por
 * edit.js y save.js.
 *
 * Cada tarea es una fila: nombre, una pista con la barra planificada (hueca)
 * y la real (corten) y, si la hay, la nota del retraso. Las barras son
 * decorativas: el texto oculto de cada fila dice lo mismo en palabras
 * («Planned weeks 4–7, actual weeks 4–8»).
 */

import { RichText } from '@wordpress/block-editor';

const clampWeek = (value, weeks) => Math.min(weeks, Math.max(1, Number(value) || 1));

/** left / width en % de una barra de la semana a a la b (incluidas). */
export function barStyle(start, end, weeks) {
    const a = clampWeek(start, weeks);
    const b = Math.max(a, clampWeek(end, weeks));
    const round = (n) => Math.round(n * 1000) / 1000;
    return { left: `${round(((a - 1) / weeks) * 100)}%`, width: `${round(((b - a + 1) / weeks) * 100)}%` };
}

/** Posición (en %) del final de la barra real: ahí empieza su nota. */
function noteStyle(start, end, weeks) {
    const b = Math.max(clampWeek(start, weeks), clampWeek(end, weeks));
    return { '--note-left': `${Math.round((b / weeks) * 100000) / 1000}%` };
}

/** «4–8» o «22». */
export const span = (start, end) => (Number(end) > Number(start) ? `${start}–${end}` : `${start}`);

/** Marcas del eje: semanas impares (1, 3, 5…). */
export const ticks = (weeks) => Array.from({ length: Math.ceil(weeks / 2) }, (_, i) => i * 2 + 1).filter((w) => w <= weeks);

export default function Programme({ attributes, edit = false, onChange, actions }) {
    const { programmeTitle, programmeSummary, plannedLabel, actualLabel, weekLabel, weekShort, weeks, tasks } = attributes;
    const total = Math.max(1, Number(weeks) || 1);
    const text = (key, tagName, className, placeholder) =>
        edit ? (
            <RichText tagName={tagName} className={className} value={attributes[key]} onChange={(value) => onChange({ [key]: value })} allowedFormats={[]} placeholder={placeholder} />
        ) : (
            <RichText.Content tagName={tagName} className={className} value={attributes[key]} />
        );

    return (
        <div className="programme" style={{ '--weeks': total }}>
            <div className="programme__head">
                <div className="programme__heading">
                    {text('programmeTitle', 'h3', 'programme__title', 'Site programme')}
                    {text('programmeSummary', 'p', 'programme__summary', 'Planned 22 weeks · Delivered in 22')}
                </div>
                <p className="programme__key" aria-hidden="true">
                    <span className="programme__key-item">
                        <span className="programme__swatch programme__swatch--plan" />
                        {edit ? text('plannedLabel', 'span', '', 'Planned') : <RichText.Content value={plannedLabel} />}
                    </span>
                    <span className="programme__key-item">
                        <span className="programme__swatch programme__swatch--actual" />
                        {edit ? text('actualLabel', 'span', '', 'Actual') : <RichText.Content value={actualLabel} />}
                    </span>
                </p>
            </div>

            <div className="programme__axis" aria-hidden="true">
                {edit ? text('weekLabel', 'span', 'programme__axis-label', 'Week') : <RichText.Content tagName="span" className="programme__axis-label" value={weekLabel} />}
                <span className="programme__ticks">
                    {ticks(total).map((week) => (
                        <span key={week} style={{ left: `${((week - 0.5) / total) * 100}%` }}>
                            {week}
                        </span>
                    ))}
                </span>
            </div>

            <ol className="programme__rows">
                {tasks.map((task, index) => {
                    const late = Number(task.actualEnd) > Number(task.planEnd);
                    return (
                        <li className={['programme__row', task.note && 'has-note', edit && 'ashlar-item'].filter(Boolean).join(' ')} key={index}>
                            {edit && actions?.(index)}
                            <span className="programme__task">
                                {edit ? (
                                    <RichText tagName="span" value={task.name} onChange={(name) => onChange({ tasks: tasks.map((t, i) => (i === index ? { ...t, name } : t)) })} allowedFormats={[]} placeholder="Task" />
                                ) : (
                                    <RichText.Content value={task.name} />
                                )}
                                <span className={['programme__weeks', late && 'is-late'].filter(Boolean).join(' ')} aria-hidden="true">
                                    {`${(weekShort || 'Wk').toUpperCase()} ${span(task.actualStart, task.actualEnd)}`}
                                </span>
                            </span>
                            <span className="programme__track" aria-hidden="true">
                                <span className="programme__bar programme__bar--plan" style={barStyle(task.planStart, task.planEnd, total)} />
                                <span className="programme__bar programme__bar--actual" style={barStyle(task.actualStart, task.actualEnd, total)} />
                                {(task.note || edit) && (
                                    <span className={['programme__note', Number(task.actualEnd) / total > 0.75 && 'is-flipped'].filter(Boolean).join(' ')} style={noteStyle(task.actualStart, task.actualEnd, total)}>
                                        {edit ? (
                                            <RichText tagName="span" value={task.note} onChange={(note) => onChange({ tasks: tasks.map((t, i) => (i === index ? { ...t, note } : t)) })} allowedFormats={[]} placeholder="+ note" />
                                        ) : (
                                            <RichText.Content value={task.note} />
                                        )}
                                    </span>
                                )}
                            </span>
                            {!edit && (
                                <span className="screen-reader-text">
                                    {`${plannedLabel} ${weekLabel.toLowerCase()} ${span(task.planStart, task.planEnd)}, ${actualLabel.toLowerCase()} ${weekLabel.toLowerCase()} ${span(task.actualStart, task.actualEnd)}.`}
                                    {task.note && <RichText.Content value={` ${task.note}`} />}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
