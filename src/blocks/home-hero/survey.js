/**
 * Capa topográfica del hero: una cota horizontal y un punto de nivelación
 * sobre la foto, como en el Figma. Es decorativa (aria-hidden): los textos
 * son el guiño al origen del estudio (topografía), no información.
 *
 * Compartida por edit.js y save.js para que el markup sea idéntico.
 */

export default function Survey({ dimLabel, pointCode, pointLevel }) {
    return (
        <div className="home-hero__survey" aria-hidden="true">
            <div className="home-hero__dim">
                <span className="home-hero__dim-label">{dimLabel}</span>
                <svg viewBox="0 0 240 16" preserveAspectRatio="none" focusable="false">
                    <path d="M1 8H239M1 2V14M239 2V14" />
                </svg>
            </div>
            <div className="home-hero__point">
                <svg viewBox="0 0 40 40" focusable="false">
                    <circle cx="20" cy="20" r="9" />
                    <path d="M20 0V14M20 26V40M0 20H14M26 20H40" />
                </svg>
                <span className="home-hero__point-label">
                    <span>{pointCode}</span>
                    <span>{pointLevel}</span>
                </span>
            </div>
        </div>
    );
}
