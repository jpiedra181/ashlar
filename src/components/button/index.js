/**
 * Button — el botón del Figma de Ashlar.
 *
 * Mismo markup que ashlar_button() (inc/helpers.php). El estilado vive en
 * style.scss y toma los colores del tono de la sección.
 *
 * Renderiza un <a> cuando hay `url`; si no, un <span> (para poder editar el
 * rótulo en línea en el editor sin que el clic navegue).
 *
 * @param {Object}      props
 * @param {string}      [props.url]       Destino. Sin él renderiza un <span>.
 * @param {string}      [props.variant]   "primary" (por defecto) | "secondary" | "outline".
 * @param {boolean}     [props.arrow]     Muestra la flecha (por defecto true).
 * @param {string}      [props.className] Clases extra.
 * @param {JSX.Element} props.children    Rótulo (RichText en edit, RichText.Content en save).
 */
import { Arrow } from '../icons';

export default function Button({ url, variant = 'primary', arrow = true, className = '', children }) {
    const classes = ['btn', variant !== 'primary' && `btn--${variant}`, className].filter(Boolean).join(' ');

    const inner = (
        <>
            <span className="btn__label">{children}</span>
            {arrow && <Arrow className="btn__icon" />}
        </>
    );

    if (url) {
        return (
            <a className={classes} href={url}>
                {inner}
            </a>
        );
    }

    return <span className={classes}>{inner}</span>;
}
