/**
 * LinkField — enlace con buscador de páginas para el panel lateral.
 *
 * Se escribe una dirección o se busca una página de la web por su nombre
 * («Contacto») y se elige de la lista: el cliente no tiene que saber URLs.
 */

import { __ } from '@wordpress/i18n';
import { URLInput } from '@wordpress/block-editor';
import { BaseControl } from '@wordpress/components';

export default function LinkField({ label, value, onChange, help }) {
    return (
        <BaseControl
            label={label}
            help={help || __('Type to search for a page on the site or paste an address.', 'ashlar')}
            className="ashlar-link-field"
            __nextHasNoMarginBottom
        >
            <URLInput
                __nextHasNoMarginBottom
                value={value || ''}
                onChange={(url) => onChange(url)}
                placeholder={__('Search a page or paste a link', 'ashlar')}
            />
        </BaseControl>
    );
}
