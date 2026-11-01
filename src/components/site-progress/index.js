/**
 * Progreso de una obra en curso («Week 9 of 22», barra y porcentaje).
 * Lo comparten el ticker (site-ticker) y el cartel de obra del hero
 * (home-hero/site-board.js), en edit y en save.
 *
 * @param {Object} attributes Atributos del bloque (weekCurrent, weekTotal, weekFormat).
 * @return {{ percent: number, week: string, style: Object }} Porcentaje, texto de la semana y variable CSS de la barra.
 */
export function siteProgress({ weekCurrent = 0, weekTotal = 0, weekFormat = 'Week {current} of {total}' }) {
    const total = Math.max(1, weekTotal);
    const current = Math.min(Math.max(0, weekCurrent), total);
    const percent = Math.floor((current / total) * 100);

    return {
        percent,
        // Sin __() a propósito: lo que se guarda en la página no puede depender
        // del idioma del panel (rompería la validación del bloque).
        week: weekFormat.replace('{current}', current).replace('{total}', total),
        style: { '--ticker-progress': `${percent}%` },
    };
}
