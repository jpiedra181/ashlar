<?php

/**
 * Proyectos de demostración para tools/seed.php (los de la página Projects
 * del Figma).
 *
 * El orden de la lista es el orden manual (menu_order: el del carrusel de la
 * portada); `date` fija «Newest first» en la rejilla. Las fotos se indican por
 * el nombre del fichero de src/assets/images/photos (sin extensión). El
 * contenido de la ficha sale de tools/content/project-<slug>.html o, si no
 * existe, de project-basic.html (foto principal y franja de datos).
 */

defined('ABSPATH') || exit;

return [
    [
        'slug'     => 'elm-row',
        'title'    => 'Elm Row',
        'date'     => '2025-11-20 10:00:00',
        'category' => 'Extensions',
        'summary'  => 'A dark galley kitchen and a 1970s lean-to, replaced by a light-filled kitchen-dining room across the full width of the house. The family stayed living at the front for all 22 weeks.',
        'image'    => 'elm-row-interior',
        'meta'     => [
            'type' => 'Rear extension', 'year' => 2025, 'sqm' => 64, 'sqm_before' => 41, 'area_label' => 'Ground floor',
            'borough' => 'Hampstead', 'postcode' => 'NW3', 'weeks' => 22, 'schedule_note' => 'On schedule',
            'price' => 148500, 'price_note' => 'Signed Feb 2025', 'final' => 149740, 'final_note' => 'one client change',
            'architect' => 'Studio Norland', 'architect_note' => 'Planning & drawings',
            'manager' => 'Dan Okafor', 'manager_note' => 'With us since 2011', 'featured' => true,
        ],
    ],
    [
        'slug'     => 'calder-road',
        'title'    => 'Calder Road',
        'date'     => '2024-11-14 10:00:00',
        'category' => 'Kitchens',
        'summary'  => 'A dark galley kitchen opened up to the garden, with oak units made in our own workshop.',
        'image'    => 'project-kitchen',
        'meta'     => [
            'type' => 'Kitchen & refurbishment', 'year' => 2024, 'sqm' => 38, 'borough' => 'Hackney', 'postcode' => 'E8',
            'weeks' => 12, 'schedule_note' => 'On schedule', 'price' => 68400, 'final' => 68400,
            'architect' => 'Fenwick & Ash', 'manager' => 'Dan Okafor', 'featured' => true,
        ],
    ],
    [
        'slug'     => 'mortimer-road',
        'title'    => 'Mortimer Road',
        'date'     => '2025-08-21 10:00:00',
        'category' => 'Lofts',
        'summary'  => 'A rear dormer loft conversion that added a main bedroom and a shower room under the roof.',
        'image'    => 'project-loft',
        'meta'     => [
            'type' => 'Loft conversion', 'year' => 2025, 'sqm' => 31, 'borough' => 'De Beauvoir', 'postcode' => 'N1',
            'weeks' => 11, 'schedule_note' => 'On schedule', 'price' => 82000, 'final' => 82000,
            'architect' => 'Studio Norland', 'manager' => 'Ruth Bell', 'featured' => true,
        ],
    ],
    [
        'slug'     => 'lansdowne-drive',
        'title'    => 'Lansdowne Drive',
        'date'     => '2024-03-28 10:00:00',
        'category' => 'Basements',
        'summary'  => 'A full-depth basement under a Victorian terrace: a family room, a lightwell and a utility room.',
        'image'    => 'project-basement',
        'meta'     => [
            'type' => 'Basement', 'year' => 2024, 'sqm' => 58, 'borough' => 'Hackney', 'postcode' => 'E8',
            'weeks' => 33, 'schedule_note' => '1 week late', 'price' => 296000, 'final' => 302216, 'final_note' => 'extra underpinning on the party wall',
            'architect' => 'Reid Architects', 'manager' => 'Ruth Bell', 'featured' => true,
        ],
    ],
    [
        'slug'     => 'albion-drive',
        'title'    => 'Albion Drive',
        'date'     => '2025-10-09 10:00:00',
        'category' => 'Extensions',
        'summary'  => 'A glazed side-return extension that doubled the width of a narrow kitchen.',
        'image'    => 'project-side-return',
        'meta'     => [
            'type' => 'Side-return extension', 'year' => 2025, 'sqm' => 22, 'borough' => 'Dalston', 'postcode' => 'E8',
            'weeks' => 15, 'schedule_note' => 'On schedule', 'price' => 96500, 'final' => 96500,
            'architect' => 'Studio Norland', 'manager' => 'Dan Okafor',
        ],
    ],
    [
        'slug'     => 'gibson-square',
        'title'    => 'Gibson Square',
        'date'     => '2025-06-12 10:00:00',
        'category' => 'Whole house',
        'summary'  => 'A Grade II listed Georgian townhouse, split into bedsits in the 1970s, put back together as one family home.',
        'image'    => 'project-stair',
        'meta'     => [
            'type' => 'Whole-house restoration', 'year' => 2025, 'sqm' => 210, 'borough' => 'Islington', 'postcode' => 'N1',
            'weeks' => 34, 'schedule_note' => 'On schedule', 'price' => 612000, 'final' => 621792, 'final_note' => 'client changes',
            'architect' => 'Reid Architects', 'manager' => 'Dan Okafor',
        ],
    ],
    [
        'slug'     => 'ferntower-road',
        'title'    => 'Ferntower Road',
        'date'     => '2024-09-19 10:00:00',
        'category' => 'Lofts',
        'summary'  => 'A zinc-clad rear dormer with a new bedroom, a study and a staircase to match the original.',
        'image'    => 'project-dormer',
        'meta'     => [
            'type' => 'Dormer loft', 'year' => 2024, 'sqm' => 28, 'borough' => 'Highbury', 'postcode' => 'N5',
            'weeks' => 12, 'schedule_note' => 'On schedule', 'price' => 78000, 'final' => 78312, 'final_note' => 'one client change',
            'architect' => 'Studio Norland', 'manager' => 'Ruth Bell',
        ],
    ],
    [
        'slug'     => 'canonbury-park-north',
        'title'    => 'Canonbury Park North',
        'date'     => '2024-06-06 10:00:00',
        'category' => 'Kitchens',
        'summary'  => 'A small family bathroom rebuilt from the joists up, with lime plaster and a terrazzo floor.',
        'image'    => 'project-bathroom',
        'meta'     => [
            'type' => 'Bathroom & refurbishment', 'year' => 2024, 'sqm' => 14, 'postcode' => 'N1',
            'weeks' => 8, 'schedule_note' => 'On schedule', 'price' => 32500, 'final' => 32500,
            'manager' => 'Ruth Bell',
        ],
    ],
    [
        'slug'     => 'navarino-road',
        'title'    => 'Navarino Road',
        'date'     => '2023-10-12 10:00:00',
        'category' => 'Whole house',
        'summary'  => 'A Victorian front put back as it was: bay windows, stone sills, railings and a tiled path.',
        'image'    => 'project-front',
        'meta'     => [
            'type' => 'Front restoration', 'year' => 2023, 'borough' => 'Hackney', 'postcode' => 'E8',
            'weeks' => 10, 'schedule_note' => 'On schedule', 'price' => 54000, 'final' => 54000,
            'manager' => 'Dan Okafor',
        ],
    ],
    [
        'slug'     => 'ospringe-road',
        'title'    => 'Ospringe Road',
        'date'     => '2023-05-18 10:00:00',
        'category' => 'Extensions',
        'summary'  => 'A timber-clad wraparound extension with a green roof and a corner window onto the garden.',
        'image'    => 'project-wraparound',
        'meta'     => [
            'type' => 'Wraparound extension', 'year' => 2023, 'sqm' => 46, 'borough' => 'Kentish Town', 'postcode' => 'NW5',
            'weeks' => 21, 'schedule_note' => 'On schedule', 'price' => 165000, 'final' => 166815, 'final_note' => 'one client change',
            'architect' => 'Reid Architects', 'manager' => 'Dan Okafor',
        ],
    ],
];
