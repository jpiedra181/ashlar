/**
 * Guía de bienvenida del editor (sustituye a la genérica de WordPress).
 *
 * Cuatro pasos en el idioma del cliente: secciones, escribir encima, panel
 * lateral y publicar. Aparece la primera vez que cada persona abre el editor
 * (preferencia «ashlar / welcomeGuideSeen», que WordPress guarda por usuario) y
 * se puede volver a abrir desde el menú ⋮ → «Guía del editor».
 */

import { __ } from '@wordpress/i18n';
import { Guide } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { PluginMoreMenuItem } from '@wordpress/editor';
import { store as preferencesStore } from '@wordpress/preferences';

const SCOPE = 'ashlar';
const KEY = 'welcomeGuideSeen';

const C = {
    night: '#151311',
    night2: '#221f1c',
    bone: '#f7f5f1',
    linen: '#efebe4',
    sand: '#e1966a',
    bronze: '#b85a28',
    paper: '#f7f5f1',
};

function Frame({ children }) {
    return (
        <svg className="ashlar-guide__art" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" role="presentation" aria-hidden="true">
            <rect width="320" height="200" fill={C.night} />
            {children}
        </svg>
    );
}

// 1 · Una página hecha de secciones apiladas
const ArtSections = () => (
    <Frame>
        <rect x="90" y="24" width="140" height="152" rx="3" fill={C.bone} />
        <rect x="98" y="32" width="124" height="48" fill={C.night2} />
        <rect x="104" y="64" width="54" height="5" fill={C.paper} />
        <rect x="104" y="72" width="34" height="4" fill={C.sand} />
        <rect x="98" y="86" width="124" height="36" fill={C.linen} />
        <rect x="104" y="94" width="80" height="4" fill={C.bronze} />
        <rect x="104" y="102" width="100" height="3" fill={C.sand} opacity="0.7" />
        <rect x="98" y="128" width="124" height="40" fill={C.bone} stroke={C.sand} strokeWidth="1" />
        <rect x="104" y="136" width="18" height="18" fill={C.linen} />
        <rect x="128" y="138" width="60" height="4" fill={C.bronze} />
        <path d="M236 98h28M258 92l6 6-6 6" stroke={C.sand} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </Frame>
);

// 2 · Escribir encima: cursor sobre un titular
const ArtWrite = () => (
    <Frame>
        <text x="48" y="96" fill={C.paper} fontFamily="Georgia, serif" fontSize="34" fontWeight="300">Tu casa,</text>
        <text x="48" y="136" fill={C.sand} fontFamily="Georgia, serif" fontSize="34" fontStyle="italic" fontWeight="300">tu web</text>
        <rect x="160" y="110" width="2" height="34" fill={C.sand}>
            <animate attributeName="opacity" values="1;0;1" dur="1.1s" repeatCount="indefinite" />
        </rect>
        <rect x="48" y="156" width="150" height="1" fill={C.sand} opacity="0.5" />
    </Frame>
);

// 3 · Panel lateral con foto y punto focal
const ArtSidebar = () => (
    <Frame>
        <rect x="36" y="28" width="150" height="144" rx="3" fill={C.bone} />
        <rect x="44" y="36" width="134" height="80" fill={C.night2} />
        <rect x="196" y="28" width="88" height="144" rx="3" fill={C.paper} />
        <rect x="204" y="38" width="44" height="4" fill={C.bronze} />
        <rect x="204" y="50" width="72" height="48" fill={C.linen} />
        <circle cx="236" cy="70" r="7" fill="none" stroke={C.bronze} strokeWidth="1.5" />
        <circle cx="236" cy="70" r="2" fill={C.bronze} />
        <rect x="204" y="108" width="72" height="14" rx="7" fill="none" stroke={C.sand} />
        <rect x="204" y="130" width="50" height="3" fill={C.sand} />
        <rect x="204" y="138" width="64" height="3" fill={C.sand} opacity="0.6" />
    </Frame>
);

// 4 · Publicar: botón y revisiones
const ArtPublish = () => (
    <Frame>
        <rect x="98" y="78" width="124" height="40" rx="20" fill={C.bronze} />
        <text x="160" y="103" fill={C.paper} fontFamily="Arial, sans-serif" fontSize="11" letterSpacing="2" textAnchor="middle">GUARDAR</text>
        <path d="M96 150c20-12 44-12 64 0s44 12 64 0" stroke={C.sand} strokeWidth="1.25" fill="none" opacity="0.6" />
        <circle cx="96" cy="150" r="3" fill={C.sand} />
        <circle cx="160" cy="150" r="3" fill={C.sand} />
        <circle cx="224" cy="150" r="4" fill={C.paper} />
    </Frame>
);

function GuidePage({ title, children }) {
    return (
        <div className="ashlar-guide__page">
            <h2 className="ashlar-guide__title">{title}</h2>
            <p className="ashlar-guide__text">{children}</p>
        </div>
    );
}

export function WelcomeGuide() {
    const isSeen = useSelect((select) => select(preferencesStore).get(SCOPE, KEY), []);
    const { set } = useDispatch(preferencesStore);

    if (isSeen) return null;

    return (
        <Guide
            className="ashlar-guide"
            contentLabel={__('Editor guide', 'ashlar')}
            finishButtonText={__('Get started', 'ashlar')}
            onFinish={() => set(SCOPE, KEY, true)}
            pages={[
                {
                    image: <ArtSections />,
                    content: (
                        <GuidePage title={__('Your site, section by section', 'ashlar')}>
                            {__('Every page is made of sections in the Ashlar design: the hero, the promises, the services… You can add, move or remove them without breaking the layout.', 'ashlar')}
                        </GuidePage>
                    ),
                },
                {
                    image: <ArtWrite />,
                    content: (
                        <GuidePage title={__('Type straight onto the page', 'ashlar')}>
                            {__('Click any text and type: what you see here is what gets published. Shift + Enter adds a line break, and italics soften part of a headline.', 'ashlar')}
                        </GuidePage>
                    ),
                },
                {
                    image: <ArtSidebar />,
                    content: (
                        <GuidePage title={__('Photos and settings, on the right', 'ashlar')}>
                            {__('Select a section and the panel on the right shows its photos (with their focal point and description), its links and its tone: light, stone or dark.', 'ashlar')}
                        </GuidePage>
                    ),
                },
                {
                    image: <ArtPublish />,
                    content: (
                        <GuidePage title={__('Publish without worry', 'ashlar')}>
                            {__('Press “Save” to publish your changes. If something isn’t right, “Revisions” takes you back to any earlier version.', 'ashlar')}
                        </GuidePage>
                    ),
                },
            ]}
        />
    );
}

/** Entrada en el menú ⋮ del editor para volver a ver la guía. */
export function WelcomeGuideMenuItem() {
    const { set } = useDispatch(preferencesStore);

    return (
        <PluginMoreMenuItem icon="welcome-learn-more" onClick={() => set(SCOPE, KEY, false)}>
            {__('Editor guide', 'ashlar')}
        </PluginMoreMenuItem>
    );
}
