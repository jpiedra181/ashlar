/**
 * Puntos de partida para una página nueva («How would you like to start?»).
 *
 * Cada uno es una lista de [nombre del bloque, atributos, bloques internos
 * (opcional, mismo formato; p. ej. los servicios de ashlar/service-stack)]. Se construyen en el
 * propio editor con createBlock(), así que el HTML guardado siempre es el que
 * genera el save.js actual de cada bloque (nunca hay «contenido inesperado»,
 * algo que no garantizan los patrones escritos a mano para bloques estáticos).
 *
 * Los textos por defecto de cada bloque (block.json) ya son los de la Home;
 * aquí solo se ponen las fotos de ejemplo del tema (src/assets/images/photos),
 * que el cliente cambia por las suyas. Se irán añadiendo las páginas de las
 * fases siguientes (Services, About, Contact).
 */

import { __ } from '@wordpress/i18n';
import { exampleImage } from '../../components/editor-assets';
import processMeta from '../../blocks/process/block.json';
import servicesMeta from '../../blocks/services-list/block.json';
import teamMeta from '../../blocks/team/block.json';

/** Tamaño real de cada foto de ejemplo (evita saltos de maquetación). */
const SIZES = {
    landscape: [1200, 896],
    portrait: [928, 1152],
    'hero-mason': [1376, 768],
    'project-kitchen': [928, 1152],
    'about-yard': [1264, 848],
    'elm-row-detail': [928, 1152],
    'team-tom': [330, 330],
    'team-dan': [928, 1152],
    'team-marta': [928, 1152],
    'team-sean': [928, 1152],
};

const photo = (name, alt = '', focal, size = 'landscape') => {
    const [width, height] = SIZES[name] || SIZES[size];
    return { ...exampleImage(`photos/${name}.jpg`, focal), alt, width, height };
};

const withImages = (items, names) => items.map((item, index) => ({ ...item, image: names[index] ? photo(names[index]) : {} }));

/** Los tres datos de un servicio (ashlar/service). */
const serviceFacts = (time, price, size) => [
    { key: __('Typical time', 'ashlar'), value: time },
    { key: __('Typical price', 'ashlar'), value: price },
    { key: __('Typical size', 'ashlar'), value: size },
];

export const STARTERS = [
    {
        id: 'home',
        title: __('Home page', 'ashlar'),
        description: __('Hero with the site board of the live job, the founder’s note, this week’s Friday report, services, before & after, recent projects, how it works and a client story.', 'ashlar'),
        blocks: () => [
            ['ashlar/home-hero', { image: photo('hero-mason', __('Mason laying a stone course on a rear extension, terraced back gardens behind', 'ashlar'), { x: 0.62, y: 0.5 }) }],
            ['ashlar/manifesto', { portrait: photo('team-tom') }],
            [
                'ashlar/friday-report',
                {
                    image: photo('process-steel', __('Site team lifting a steel beam into the new rear wall opening', 'ashlar')),
                    avatar: photo('team-dan', '', { x: 0.6, y: 0.25 }),
                },
            ],
            ['ashlar/services-list', { services: withImages(servicesMeta.attributes.services.default, ['project-wraparound', 'project-dormer', 'project-kitchen', 'project-basement', 'project-front']) }],
            [
                'ashlar/before-after',
                {
                    before: photo('elm-row-before', __('Elm Row before the build: a 1970s lean-to and an overgrown garden', 'ashlar')),
                    after: photo('elm-row-after', __('Elm Row after the build: a brick rear extension with black steel glazing', 'ashlar')),
                },
            ],
            ['ashlar/projects-carousel', {}],
            // El paso 3 no usa process-steel: esa foto ya va en el parte del viernes.
            // Tonos alternos: proceso en beige y la historia del cliente en claro.
            ['ashlar/process', { theme: 'subtle', steps: withImages(processMeta.attributes.steps.default, ['process-survey', 'process-plans', 'elm-row-detail', 'process-handover', 'process-aftercare']) }],
            ['ashlar/client-story', { theme: 'light', image: photo('client-couple', __('Hannah and James Whitfield in the front kitchen they kept using during the build', 'ashlar'), undefined, 'portrait') }],
        ],
    },
    {
        id: 'projects',
        title: __('Projects page', 'ashlar'),
        description: __('Page intro, every project (filters, the latest one in large and a grid with “Load more”) and the areas you build in.', 'ashlar'),
        blocks: () => [
            ['ashlar/page-intro', {}],
            ['ashlar/projects-grid', {}],
            ['ashlar/boroughs', {}],
        ],
    },
    {
        id: 'journal',
        title: __('Journal page', 'ashlar'),
        description: __('Page intro and every article: topic filters, the latest one in large and the rest as question cards with their short answer.', 'ashlar'),
        blocks: () => [
            [
                'ashlar/page-intro',
                {
                    eyebrow: __('Journal', 'ashlar'),
                    title: __('Straight<br>answers.', 'ashlar'),
                    lede: __('The questions people ask us at the first visit, answered properly by the people who do the work. If the answer is “it depends”, we tell you on what.', 'ashlar'),
                },
            ],
            ['ashlar/journal-grid', {}],
        ],
    },
    {
        id: 'services',
        title: __('Services page', 'ashlar'),
        description: __('Page intro with quick links, the kinds of job one at a time (pinned on desktop, each with its own anchor), what every job includes, the cost guide and questions.', 'ashlar'),
        blocks: () => [
            [
                'ashlar/page-intro',
                {
                    eyebrow: __('Services', 'ashlar'),
                    title: __('We only take on<br>five kinds of job.', 'ashlar'),
                    lede: __('They’re the jobs we do every week, which is why our prices hold and our programmes don’t slip. If yours isn’t one of them, we’ll say so, and usually tell you who to call.', 'ashlar'),
                    links: [
                        { label: __('Extensions', 'ashlar'), url: '#extensions' },
                        { label: __('Lofts', 'ashlar'), url: '#lofts' },
                        { label: __('Kitchens', 'ashlar'), url: '#kitchens' },
                        { label: __('Basements', 'ashlar'), url: '#basements' },
                        { label: __('Whole house', 'ashlar'), url: '#restoration' },
                    ],
                },
            ],
            // Los servicios, dentro de «Pinned services» (fijos en escritorio, de uno en uno)
            [
                'ashlar/service-stack',
                {},
                [
                    // El primero usa los textos por defecto del bloque (Extensions)
                    ['ashlar/service', { anchor: 'extensions', image: photo('elm-row-after', __('Elm Row after the build: a brick rear extension with black steel glazing', 'ashlar')) }],
                    [
                        'ashlar/service',
                        {
                            anchor: 'lofts',
                            theme: 'light',
                            imagePosition: 'right',
                            image: photo('project-loft', __('Loft bedroom under a gable dormer, looking over London rooftops', 'ashlar')),
                            number: '02 / 05',
                            title: __('Loft conversions', 'ashlar'),
                            summary: __('Dormer and mansard lofts that give you a proper bedroom and bathroom, with room to stand up and somewhere to put the wardrobe.', 'ashlar'),
                            facts: serviceFacts(__('10–14 weeks', 'ashlar'), __('From £70k', 'ashlar'), '25–35 m²'),
                            included: [__('Structural steels and a new staircase', 'ashlar'), __('Building control and fire safety sign-off', 'ashlar'), __('Bathroom with plumbing and ventilation', 'ashlar'), __('Built-in storage in the eaves', 'ashlar')],
                            note: __('You can usually stay at home: we work from scaffolding outside until we break through in week 6.', 'ashlar'),
                            buttonLabel: __('Ask about a loft', 'ashlar'),
                            linkLabel: __('See Mortimer Road, N1', 'ashlar'),
                            linkUrl: '/projects/mortimer-road/',
                        },
                    ],
                    [
                        'ashlar/service',
                        {
                            anchor: 'kitchens',
                            image: photo('project-kitchen', __('Galley kitchen with oak units and an exposed brick wall', 'ashlar')),
                            number: '03 / 05',
                            title: __('Kitchens &amp; refurbishment', 'ashlar'),
                            summary: __('Kitchens, bathrooms and whole floors, done without moving walls you don’t need to move.', 'ashlar'),
                            facts: serviceFacts(__('8–20 weeks', 'ashlar'), __('From £45k', 'ashlar'), __('Any size', 'ashlar')),
                            included: [__('Rewiring and replumbing', 'ashlar'), __('Joinery and fitting', 'ashlar'), __('Plastering, flooring and decoration', 'ashlar'), __('Taking away the old fittings', 'ashlar')],
                            note: __('Buying your kitchen elsewhere? We coordinate with the supplier and fit it.', 'ashlar'),
                            buttonLabel: __('Ask about a refurbishment', 'ashlar'),
                            linkLabel: __('See Calder Road, E8', 'ashlar'),
                            linkUrl: '/projects/calder-road/',
                        },
                    ],
                    [
                        'ashlar/service',
                        {
                            anchor: 'basements',
                            theme: 'light',
                            imagePosition: 'right',
                            image: photo('project-basement', __('Basement family room opening onto a planted lightwell', 'ashlar')),
                            number: '04 / 05',
                            title: __('Basements', 'ashlar'),
                            summary: __('Full basements under terraced houses, with lightwells that bring real daylight down.', 'ashlar'),
                            facts: serviceFacts(__('24–36 weeks', 'ashlar'), __('From £250k', 'ashlar'), '40–70 m²'),
                            included: [__('Structural engineering and underpinning', 'ashlar'), __('Waterproofing with a 10-year guarantee', 'ashlar'), __('Lightwells and glazing', 'ashlar'), __('Pumps, ventilation and fire escape', 'ashlar')],
                            note: __('Basements always need planning permission and a party wall award. Allow 3–6 months before we start.', 'ashlar'),
                            buttonLabel: __('Ask about a basement', 'ashlar'),
                            linkLabel: __('See Lansdowne Drive, E8', 'ashlar'),
                            linkUrl: '/projects/lansdowne-drive/',
                        },
                    ],
                    [
                        'ashlar/service',
                        {
                            anchor: 'restoration',
                            image: photo('project-stair', __('Restored Georgian stair and stone-flagged hall at Gibson Square', 'ashlar')),
                            number: '05 / 05',
                            title: __('Whole-house restoration', 'ashlar'),
                            summary: __('Period houses taken back to their bones and put back together, often in conservation areas.', 'ashlar'),
                            facts: serviceFacts(__('30–50 weeks', 'ashlar'), __('Priced after survey', 'ashlar'), '120–250 m²'),
                            included: [__('Structural repairs and new services throughout', 'ashlar'), __('Lime plaster, sash windows and original details repaired', 'ashlar'), __('Conservation and listed building consent', 'ashlar'), __('Phased work if you need to stay in', 'ashlar')],
                            note: __('Listed? We’ve worked on 14 Grade II houses with the Islington and Hackney conservation officers.', 'ashlar'),
                            buttonLabel: __('Ask about a restoration', 'ashlar'),
                            linkLabel: __('See Gibson Square, N1', 'ashlar'),
                            linkUrl: '/projects/gibson-square/',
                        },
                    ],
                ],
            ],
            ['ashlar/numbered-grid', {}],
            ['ashlar/cost-guide', {}],
            ['ashlar/faq', {}],
        ],
    },
    {
        id: 'about',
        title: __('About page', 'ashlar'),
        description: __('Page intro in the founder’s words, the story in dates, the jobs you turned down, the yard, the team and a job opening.', 'ashlar'),
        blocks: () => [
            [
                'ashlar/page-intro',
                {
                    eyebrow: __('About', 'ashlar'),
                    title: __('A builder you don’t<br>have to chase.', 'ashlar'),
                    lede: __('Priya and I met in 2007 on an office job in Clerkenwell. I was the carpenter, she was the surveyor checking my invoices, and she rang to tell me I’d undercharged them by four hundred quid. Nobody had ever done that before. Two years later we started Ashlar together. She still checks my invoices. — Tom', 'ashlar'),
                    image: photo('team-founders', __('Tom Hale and Priya Nair, founders, on the tailgate of the van', 'ashlar')),
                    caption: __('Tom and Priya on the back of the van, lunch on a Hackney job', 'ashlar'),
                },
            ],
            ['ashlar/timeline', {}],
            [
                'ashlar/numbered-grid',
                {
                    theme: 'light',
                    variant: 'ruled',
                    eyebrow: __('How we work', 'ashlar'),
                    title: __('Jobs we said no to this year.', 'ashlar'),
                    lede: __('We’d rather lose a job than do it badly. Three from 2026, with the clients’ details left out.', 'ashlar'),
                    items: [
                        { title: __('A basement in Barnet', 'ashlar'), text: __('Good family, sensible budget, forty minutes from the yard. Our site manager would have spent the job in traffic, so we passed it to a firm in Finchley we trust.', 'ashlar') },
                        { title: __('A kitchen by Christmas', 'ashlar'), text: __('Six weeks, starting in mid-November. It can be done, but not properly, and we’d rather lose the job than rush the plaster.', 'ashlar') },
                        { title: __('A loft without building control', 'ashlar'), text: __('Their last builder told them they could skip it. They can’t, and it would have caught up with them the day they sold.', 'ashlar') },
                    ],
                },
            ],
            ['ashlar/photo-panel', { image: photo('about-yard', __('The Ashlar yard under a railway arch, with stacked bricks, timber racks and the van', 'ashlar')) }],
            [
                'ashlar/team',
                {
                    people: teamMeta.attributes.people.default.map((person, index) => ({
                        ...person,
                        image: photo(
                            ['team-dan', 'team-marta', 'team-sean'][index],
                            [__('Dan Okafor, site manager, on the phone on site', 'ashlar'), __('Marta Kowalska, project lead, at her desk in the yard office', 'ashlar'), __('Sean Byrne, head carpenter, planing an oak board in the workshop', 'ashlar')][index]
                        ),
                    })),
                },
            ],
            ['ashlar/callout', {}],
        ],
    },
    {
        id: 'careers',
        title: __('Careers page', 'ashlar'),
        description: __('Page intro in the founder’s words, the open role and how to apply.', 'ashlar'),
        blocks: () => [
            [
                'ashlar/page-intro',
                {
                    eyebrow: __('Careers', 'ashlar'),
                    title: __('Come and build<br>with us.', 'ashlar'),
                    lede: __('We’re 24 people, nearly all on the payroll, and most have been here more than five years. We don’t grow fast. When we take someone on, it’s because we want them to stay. — Tom', 'ashlar'),
                },
            ],
            [
                'ashlar/numbered-grid',
                {
                    theme: 'subtle',
                    variant: 'ruled',
                    eyebrow: __('Open now', 'ashlar'),
                    title: __('Site manager, north London.', 'ashlar'),
                    lede: __('Full-time · £58k–£65k · van and tools included', 'ashlar'),
                    items: [
                        { title: __('What you’d do', 'ashlar'), text: __('Run one or two of our jobs from the first day to handover: the programme, the trades, the client, and a report to them every Friday.', 'ashlar') },
                        { title: __('Who we’re after', 'ashlar'), text: __('Someone who has run residential jobs in London for a few years and would rather do six good ones than twelve rushed ones.', 'ashlar') },
                        { title: __('What you get', 'ashlar'), text: __('A van, your own tools, a pension worth having, and Fridays that finish once the report has gone out.', 'ashlar') },
                    ],
                },
            ],
            [
                'ashlar/callout',
                {
                    theme: 'light',
                    eyebrow: __('How to apply', 'ashlar'),
                    title: __('Send Priya a few lines about the last job you ran.', 'ashlar'),
                    text: __('You don’t need a CV template. We reply to everyone within a week, and we take on apprentices every September if you know someone starting out.', 'ashlar'),
                    buttonLabel: __('Email Priya', 'ashlar'),
                    buttonUrl: 'mailto:hello@ashlar.build?subject=Site%20manager',
                },
            ],
        ],
    },
    {
        id: 'contact',
        title: __('Contact page', 'ashlar'),
        description: __('The quote form with a live ballpark, who answers and how to reach you, an open house invitation and questions about the first visit.', 'ashlar'),
        blocks: () => [
            ['ashlar/quote', { portrait: photo('team-marta', __('Marta Kowalska, project lead, at her desk in the yard office', 'ashlar'), { x: 0.45, y: 0.4 }) }],
            [
                'ashlar/photo-panel',
                {
                    imagePosition: 'right',
                    image: photo('project-stair', __('Restored Georgian stair and stone-flagged hall at Gibson Square', 'ashlar')),
                    eyebrow: __('Not ready to talk yet? · Sat 14 Nov · 10:00–14:00', 'ashlar'),
                    title: __('Walk round a finished<br>house first.', 'ashlar'),
                    text: __('Open house at Gibson Square, N1. Stand on the stair Sean rebuilt, open the cupboards, ask Marta what it cost and why. Coffee from the place on the corner.', 'ashlar'),
                    buttonLabel: __('Book a slot', 'ashlar'),
                    buttonUrl: '#quote',
                    buttonVariant: 'primary',
                    note: __('12 of 40 places left', 'ashlar'),
                },
            ],
            [
                'ashlar/faq',
                {
                    theme: 'light',
                    eyebrow: __('About the first visit', 'ashlar'),
                    title: __('Before you<br>hit send.', 'ashlar'),
                    items: [
                        { question: __('Is the first visit really free?', 'ashlar'), answer: __('Yes. It’s an hour at your house to understand what you want and whether we’re the right builder. The measured survey that follows costs £950, and we take it off your build if you go ahead.', 'ashlar') },
                        { question: __('Do I need drawings before you can quote?', 'ashlar'), answer: __('No. Many clients come to us with an idea and a Pinterest board. We work with your architect, or introduce one we trust.', 'ashlar') },
                        { question: __('What if you’re not the right fit?', 'ashlar'), answer: __('We’ll say so at the first visit, and usually recommend someone who is. It saves everyone months.', 'ashlar') },
                    ],
                },
            ],
        ],
    },
    {
        id: 'blank',
        title: __('Blank page', 'ashlar'),
        description: __('Start from nothing and add the sections you need with the + button.', 'ashlar'),
        blocks: () => [],
    },
];
