/**
 * Repeater — piezas para editar listas (cifras, servicios, testimonios…)
 * directamente en el lienzo, sin formularios aparte.
 *
 *  - ItemActions: botonera flotante de cada elemento (subir, bajar, quitar).
 *    Solo existe en el editor; aparece al pasar el ratón o al enfocar.
 *  - AddItem: botón «+ Añadir …» al final de la lista.
 *  - moveItem / removeItem / updateItem: utilidades inmutables para los arrays
 *    de atributos.
 */

import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { IconUp, IconDown, IconTrash, IconPlus } from '../icons';

export const updateItem = (items, index, data) =>
    items.map((item, i) => (i === index ? { ...item, ...data } : item));

export const removeItem = (items, index) => items.filter((_, i) => i !== index);

export function moveItem(items, from, to) {
    if (to < 0 || to >= items.length) return items;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
}

export function ItemActions({ index, count, onMove, onRemove, label, min = 1 }) {
    return (
        <div className="ashlar-item-actions" role="group" aria-label={label}>
            <Button
                size="small"
                icon={IconUp}
                label={__('Move up', 'ashlar')}
                disabled={index === 0}
                onClick={() => onMove(index, index - 1)}
            />
            <Button
                size="small"
                icon={IconDown}
                label={__('Move down', 'ashlar')}
                disabled={index === count - 1}
                onClick={() => onMove(index, index + 1)}
            />
            <Button
                size="small"
                icon={IconTrash}
                label={__('Remove', 'ashlar')}
                isDestructive
                disabled={count <= min}
                onClick={() => onRemove(index)}
            />
        </div>
    );
}

export function AddItem({ label, onClick, max, count }) {
    if (max && count >= max) return null;

    return (
        <div className="ashlar-add-item">
            <Button variant="secondary" icon={IconPlus} onClick={onClick}>
                {label}
            </Button>
        </div>
    );
}
