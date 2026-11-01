import { __ } from '@wordpress/i18n';

/**
 * Estilos de botón para los SelectControl del editor.
 * Los valores coinciden con el prop `variant` del componente Button.
 */
export const BUTTON_VARIANT_OPTIONS = [
    { label: __('Primary', 'ashlar'), value: 'primary' },
    { label: __('Secondary', 'ashlar'), value: 'secondary' },
    { label: __('Outline', 'ashlar'), value: 'outline' },
];
