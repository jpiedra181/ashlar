/**
 * SectionTheme — tono de la sección: claro, beige u oscuro.
 *
 * En lugar de un selector de color por cada texto (que permite combinaciones
 * que rompen el diseño o el contraste), el cliente elige uno de los tres
 * tonos del Figma y todo lo de dentro se adapta: texto, filetes, acentos y
 * botones (variables semánticas, elements/_themes.scss).
 */

import { __ } from '@wordpress/i18n';
import {
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

export const THEMES = ['light', 'subtle', 'dark'];

/** Clase de la sección para un tono ('light' no necesita clase). */
export const themeClass = (theme) => (theme && theme !== 'light' ? `theme-${theme}` : undefined);

export default function SectionTheme({ value = 'light', onChange }) {
    return (
        <ToggleGroupControl
            __nextHasNoMarginBottom
            __next40pxDefaultSize
            isBlock
            label={__('Section tone', 'ashlar')}
            help={__('Text, rules and buttons adapt to the tone automatically.', 'ashlar')}
            value={value}
            onChange={onChange}
        >
            <ToggleGroupControlOption value="light" label={__('Light', 'ashlar')} />
            <ToggleGroupControlOption value="subtle" label={__('Stone', 'ashlar')} />
            <ToggleGroupControlOption value="dark" label={__('Dark', 'ashlar')} />
        </ToggleGroupControl>
    );
}
