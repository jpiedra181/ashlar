/**
 * Cálculos de «Where we build» compartidos por edit.js y save.js.
 */

/** Ancho de cada barra en % respecto a la zona con más proyectos. */
export function barWidth(count, areas) {
    const max = Math.max(1, ...areas.map((area) => Number(area.count) || 0));
    return `${Math.round(((Number(count) || 0) / max) * 1000) / 10}%`;
}

export const countText = (format, count) => (format || '{n} projects').replace('{n}', Number(count) || 0);
