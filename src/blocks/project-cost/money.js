/**
 * Cuentas de «The money», compartidas por edit.js y save.js.
 */

/** «£44,920» (sin decimales, formato británico). */
export const pounds = (amount) => `£${new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(Math.round(Number(amount) || 0))}`;

/**
 * Totales y porcentajes. Precio cerrado = partidas que no son cambios del
 * cliente; liquidación = todas.
 */
export function totals(items) {
    const amount = (item) => Math.max(0, Number(item.amount) || 0);
    const final = items.reduce((sum, item) => sum + amount(item), 0);
    const changes = items.filter((item) => item.change).reduce((sum, item) => sum + amount(item), 0);

    return {
        final,
        changes,
        fixed: final - changes,
        share: (item) => (final ? (amount(item) / final) * 100 : 0),
    };
}

/** Color de cada partida: la paleta de la marca, en orden (los cambios, en corten oscuro). */
export const SWATCHES = ['corten-600', 'corten-500', 'corten-300', 'stone-700', 'stone-500', 'stone-300', 'stone-400', 'corten-400'];

export function swatch(items, index) {
    if (items[index].change) return 'change';
    const position = items.slice(0, index).filter((item) => !item.change).length;
    return SWATCHES[position % SWATCHES.length];
}
