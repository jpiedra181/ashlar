/**
 * Iconos de los bloques en el insertador: trazo fino, en corten, dibujados
 * para Ashlar (en lugar de los Dashicons genéricos). Cada uno insinúa la
 * composición de la sección.
 *
 *   registerBlockType(metadata.name, { icon: blockIcon('hero'), … })
 */

const CORTEN = '#b85a28';

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.25, strokeLinecap: 'round', strokeLinejoin: 'round' };

const ICONS = {
    // Foto a sangre con el titular abajo a la izquierda
    hero: (
        <>
            <rect x="3" y="4" width="18" height="16" rx="1" {...stroke} />
            <path d="M6 14.5h7M6 17h4.5" {...stroke} />
            <path d="M15 17h3" {...stroke} />
        </>
    ),
    // Frase grande + tres cifras
    intro: (
        <>
            <path d="M4 5.5h16M4 8.5h11" {...stroke} />
            <path d="M4 13h4M10 13h4M16 13h4" {...stroke} />
            <path d="M4 16.5h3M10 16.5h3M16 16.5h3" {...stroke} />
        </>
    ),
    // Filas numeradas con flecha
    services: (
        <>
            <path d="M4 7h16M4 12h16M4 17h16" {...stroke} />
            <path d="M15.5 9.5l2-1.25-2-1.25M15.5 14.5l2-1.25-2-1.25" {...stroke} />
        </>
    ),
    // Cabecera de página: antetítulo, titular en dos líneas y entradilla
    'page-hero': (
        <>
            <path d="M4 5.5h4" {...stroke} />
            <path d="M4 9.5h14M4 13h10" {...stroke} />
            <path d="M4 17.5h8" {...stroke} />
        </>
    ),
    // Comillas: manifiesto / frase grande
    quote: (
        <>
            <path d="M5 10.5c0-2.5 1.5-4 3.5-4.5M5 10.5h3v3.5H5zM12 10.5c0-2.5 1.5-4 3.5-4.5M12 10.5h3v3.5h-3z" {...stroke} />
            <path d="M5 18h14" {...stroke} />
        </>
    ),
    // Pasos numerados en fila
    steps: (
        <>
            <circle cx="5.5" cy="8" r="1.75" {...stroke} />
            <circle cx="12" cy="8" r="1.75" {...stroke} />
            <circle cx="18.5" cy="8" r="1.75" {...stroke} />
            <path d="M3.5 13h4M10 13h4M16.5 13h4M3.5 16h3M10 16h3M16.5 16h3" {...stroke} />
        </>
    ),
    // Bocadillo: testimonios
    testimonials: (
        <>
            <path d="M4 5h16v10H10l-4 3.5V15H4z" {...stroke} />
            <path d="M7.5 9h9M7.5 11.5h6" {...stroke} />
        </>
    ),
    // Cinta que corre
    marquee: (
        <>
            <path d="M3 9h18M3 15h18" {...stroke} />
            <path d="M5 12h3M10.5 12h3M16 12h3" {...stroke} />
        </>
    ),
    // Preguntas desplegables
    faq: (
        <>
            <path d="M4 6.5h12M4 12h12M4 17.5h12" {...stroke} />
            <path d="M18.5 5.5v2M17.5 6.5h2M17.5 12h2M17.5 17.5h2M18.5 16.5v2" {...stroke} />
        </>
    ),
    // Foto + texto a dos columnas
    story: (
        <>
            <rect x="3" y="5" width="8" height="14" rx="1" {...stroke} />
            <path d="M14 8h7M14 11h7M14 14h5" {...stroke} />
        </>
    ),
    // Retratos del equipo
    team: (
        <>
            <circle cx="8" cy="9" r="2.5" {...stroke} />
            <circle cx="16" cy="9" r="2.5" {...stroke} />
            <path d="M3.5 18c.6-2.6 2.3-4 4.5-4s3.9 1.4 4.5 4M11.5 18c.6-2.6 2.3-4 4.5-4s3.9 1.4 4.5 4" {...stroke} />
        </>
    ),
    // Valores: rejilla de tres
    values: (
        <>
            <path d="M4 6h4M10 6h4M16 6h4" {...stroke} />
            <path d="M4 10h4M10 10h4M16 10h4M4 13h3M10 13h3M16 13h3" {...stroke} />
            <path d="M4 18h16" {...stroke} />
        </>
    ),
    // Foto ancha (franja)
    image: (
        <>
            <rect x="2.5" y="7" width="19" height="10" rx="1" {...stroke} />
            <path d="M2.5 15l5-4 4 3 3-2 7 4" {...stroke} />
        </>
    ),
    // Servicio a fondo: foto y lista
    service: (
        <>
            <rect x="3" y="5" width="9" height="11" rx="1" {...stroke} />
            <path d="M15 6.5h6M15 10h6M15 13.5h4" {...stroke} />
            <path d="M3 19.5h18" {...stroke} />
        </>
    ),
    // Servicios apilados: una foto sobre otra, el texto al lado y la barra de avance
    'service-stack': (
        <>
            <rect x="5.5" y="3.5" width="8" height="11" rx="1" {...stroke} />
            <path d="M3 6.5V16a1 1 0 0 0 1 1h7" {...stroke} />
            <path d="M16.5 6h4.5M16.5 9.5h4.5M16.5 13h3" {...stroke} />
            <path d="M3 20.5h18" {...stroke} />
        </>
    ),
    // Tarifas: tres columnas, la central destacada
    plans: (
        <>
            <rect x="2.5" y="7" width="5.5" height="11" rx="1" {...stroke} />
            <rect x="9.25" y="4.5" width="5.5" height="15" rx="1" {...stroke} />
            <rect x="16" y="7" width="5.5" height="11" rx="1" {...stroke} />
        </>
    ),
    // Línea de tiempo vertical con hitos
    timeline: (
        <>
            <path d="M7 3.5v17" {...stroke} />
            <circle cx="7" cy="7" r="1.5" {...stroke} />
            <circle cx="7" cy="13" r="1.5" {...stroke} />
            <path d="M10.5 7h9M10.5 13h7M10.5 18h8" {...stroke} />
        </>
    ),
    // Formulario
    contact: (
        <>
            <path d="M4 7h16M4 11.5h16M4 16h9" {...stroke} />
            <path d="M15.5 16h4.5" {...stroke} />
            <path d="M18 14.25l1.75 1.75L18 17.75" {...stroke} />
        </>
    ),
    // Chincheta de mapa
    map: (
        <>
            <path d="M12 20s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.8-6 10-6 10z" {...stroke} />
            <circle cx="12" cy="10" r="2.25" {...stroke} />
        </>
    ),
    // Proyectos destacados: composición escalonada
    projects: (
        <>
            <rect x="3" y="4" width="10" height="8" rx="1" {...stroke} />
            <rect x="15" y="8" width="6" height="8" rx="1" {...stroke} />
            <rect x="5" y="14.5" width="6" height="5.5" rx="1" {...stroke} />
        </>
    ),
    // Rejilla de proyectos en dos columnas
    grid: (
        <>
            <rect x="3.5" y="3.5" width="7" height="8" rx="1" {...stroke} />
            <rect x="13.5" y="6.5" width="7" height="8" rx="1" {...stroke} />
            <rect x="3.5" y="14" width="7" height="6.5" rx="1" {...stroke} />
        </>
    ),
    // Galería: foto grande y dos pequeñas
    gallery: (
        <>
            <rect x="3" y="3.5" width="18" height="8" rx="1" {...stroke} />
            <rect x="3" y="13.5" width="8" height="7" rx="1" {...stroke} />
            <rect x="13" y="15" width="8" height="5.5" rx="1" {...stroke} />
        </>
    ),
    // Muestras de color
    palette: (
        <>
            <rect x="3" y="5" width="4.5" height="9" rx="0.5" {...stroke} />
            <rect x="9.75" y="5" width="4.5" height="9" rx="0.5" {...stroke} />
            <rect x="16.5" y="5" width="4.5" height="9" rx="0.5" {...stroke} />
            <path d="M3 17.5h4M9.75 17.5h4M16.5 17.5h4" {...stroke} />
        </>
    ),
    // Siguiente: foto con flecha
    next: (
        <>
            <rect x="3" y="4" width="18" height="16" rx="1" {...stroke} />
            <path d="M7 15h9M13 12l3 3-3 3" {...stroke} />
        </>
    ),
    // Tabla de compromisos
    table: (
        <>
            <path d="M3 5.5h18M3 10h18M3 14.5h18M3 19h18" {...stroke} />
            <path d="M7.5 5.5v13.5M16 5.5v13.5" {...stroke} />
        </>
    ),
    // Antes y después: foto partida con tirador
    compare: (
        <>
            <rect x="3" y="5" width="18" height="14" rx="1" {...stroke} />
            <path d="M12 5v14" {...stroke} />
            <circle cx="12" cy="12" r="2" {...stroke} />
        </>
    ),
    // Carrusel: tarjetas en fila que se salen por la derecha
    carousel: (
        <>
            <rect x="2.5" y="6" width="7" height="9" rx="1" {...stroke} />
            <rect x="11.5" y="6" width="7" height="9" rx="1" {...stroke} />
            <path d="M20.5 6v9M2.5 19h9" {...stroke} />
        </>
    ),
    // Pestañas del proceso
    tabs: (
        <>
            <path d="M3 6h4M10 6h4M17 6h4" {...stroke} />
            <path d="M3 8.5h4" {...stroke} />
            <rect x="3" y="11" width="18" height="9" rx="1" {...stroke} />
        </>
    ),
    // Cinta con punto de obra en marcha
    ticker: (
        <>
            <rect x="2.5" y="9" width="19" height="6" rx="1" {...stroke} />
            <circle cx="5.5" cy="12" r="1" {...stroke} />
            <path d="M8.5 12h5M15.5 12h3.5" {...stroke} />
        </>
    ),
    // Nombres en fila
    names: (
        <>
            <path d="M3 9h18" {...stroke} />
            <path d="M3 14h4M9 14h4M15 14h6" {...stroke} />
        </>
    ),
    // Parte del viernes: hoja con cabecera, foto y líneas de texto
    report: (
        <>
            <rect x="5" y="2.5" width="14" height="19" rx="1" {...stroke} />
            <path d="M8 6h5" {...stroke} />
            <rect x="8" y="8.5" width="8" height="5" {...stroke} />
            <path d="M8 16.5h8M8 19h5" {...stroke} />
        </>
    ),
    // Genérico: sección
    section: (
        <>
            <rect x="3" y="5" width="18" height="14" rx="1" {...stroke} />
            <path d="M6 9h8M6 12h12M6 15h6" {...stroke} />
        </>
    ),
};

export function blockIcon(name) {
    return {
        foreground: CORTEN,
        src: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
                {ICONS[name] || ICONS.section}
            </svg>
        ),
    };
}
