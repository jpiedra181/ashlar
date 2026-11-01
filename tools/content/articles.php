<?php

/**
 * Artículos de demostración del Journal («Straight answers») para
 * tools/seed.php.
 *
 * Cada artículo es una pregunta (title) con su respuesta corta (answer, que
 * va al extracto). `topic` es el tema (categoría); `image`, la foto destacada
 * por el nombre del fichero de src/assets/images/photos (sin extensión). El
 * texto sale de tools/content/article-<slug>.html (bloques del core
 * generados en el editor con createBlock + serialize).
 */

defined('ABSPATH') || exit;

return [
    [
        'slug'   => 'what-does-a-rear-extension-cost',
        'title'  => 'What does a rear extension in London actually cost?',
        'date'   => '2026-10-14 09:00:00',
        'topic'  => 'Costs',
        'image'  => 'project-wraparound',
        'answer' => 'Budget £3,200–£4,200 per square metre for the build. With VAT and fees, a typical 25 m² extension comes to £110,000–£145,000, before the kitchen.',
    ],
    [
        'slug'   => 'loft-conversion-planning-permission',
        'title'  => 'Do I need planning permission for a loft conversion?',
        'date'   => '2026-09-23 09:00:00',
        'topic'  => 'Planning',
        'image'  => 'project-dormer',
        'answer' => 'Usually not. Most house lofts are permitted development: up to 40 m³ of new space on a terrace, 50 m³ on a semi or detached. Flats, conservation areas and Article 4 streets are the exceptions.',
    ],
    [
        'slug'   => 'party-wall-agreements-explained',
        'title'  => 'Party wall agreements, explained without the jargon',
        'date'   => '2026-08-27 09:00:00',
        'topic'  => 'Planning',
        'image'  => 'project-side-return',
        'answer' => 'If you build on, cut into or dig near a wall you share, you must give your neighbour notice: two months for work on the wall, one month for digging. No written reply in 14 days means surveyors and an award.',
    ],
    [
        'slug'   => 'how-long-does-a-basement-take',
        'title'  => 'How long does a basement take?',
        'date'   => '2026-07-15 09:00:00',
        'topic'  => 'On site',
        'image'  => 'project-basement',
        'answer' => 'Allow 12 to 18 months from first drawings to moving back down: around six for design and approvals, then 30 to 40 weeks on site. The digging is the quick part.',
    ],
    [
        'slug'   => 'living-through-a-build',
        'title'  => 'What is it really like to live through a build?',
        'date'   => '2026-06-03 09:00:00',
        'topic'  => 'On site',
        'image'  => 'process-steel',
        'answer' => 'Louder than you expect for six weeks, quieter than you fear after that. Plan on losing the kitchen for 10 to 14 weeks, keeping one bathroom, and a written report from us every Friday.',
    ],
    [
        'slug'   => 'fixed-price-or-cost-plus',
        'title'  => 'Fixed price or cost plus: which contract protects you?',
        'date'   => '2026-04-22 09:00:00',
        'topic'  => 'Costs',
        'image'  => 'process-plans',
        'answer' => 'A fixed price on full drawings and an itemised schedule protects you best. Cost plus only makes sense when nobody can know what is behind the walls, and even then it should be capped.',
    ],
];
