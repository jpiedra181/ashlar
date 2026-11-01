#!/usr/bin/env node
// Crea el esqueleto de un bloque nuevo siguiendo las convenciones del tema:
// block.json (apiVersion 3, namespace y textdomain de .claude/project.json),
// index.js con icono de marca y vista previa con foto real, edit.js con los
// componentes compartidos (SectionTheme, Chapter, Media, MediaField), save.js
// con el MISMO markup, style.scss con tokens y el @forward en
// src/scss/blocks/index.scss. Textos de la web y del editor en inglés.
//
//   node scaffold-block.mjs <slug> "Title" [--dynamic] [--dry]
//
// --dynamic  bloque server-rendered: render.php + save: () => null.
// --dry      muestra los ficheros sin escribir nada.
//
// No registra nada en PHP: inc/blocks.php auto-descubre build/blocks/*/block.json
// e inc/gutenberg.php deriva la lista permitida del registro. Basta compilar.

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, usage, PROJECT_ROOT, NS, TD } from '../../../lib/audit-lib.mjs';

const { positional: [slug, titleArg], flags } = parseArgs();
if (!slug || !/^[a-z][a-z0-9-]*$/.test(slug)) usage('Uso: node scaffold-block.mjs <slug-kebab> "Title" [--dynamic] [--dry]');

const title = titleArg || slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
const cls = slug; // clase BEM del bloque = slug (convención del tema)
const dynamic = Boolean(flags.dynamic);
const dir = path.join(PROJECT_ROOT, 'src', 'blocks', slug);
const scssIndex = path.join(PROJECT_ROOT, 'src', 'scss', 'blocks', 'index.scss');

if (fs.existsSync(dir)) usage(`Ya existe ${dir}`);

const files = {};

const attributes = {
    align: { type: 'string', default: 'full' },
    theme: { type: 'string', enum: ['light', 'subtle', 'dark'], default: 'light' },
    chapterNum: { type: 'string', default: '01' },
    chapterLabel: { type: 'string', default: 'Chapter' },
    // <em> = el tramo en tono apagado (no va en cursiva)
    title: { type: 'string', default: `${title}, <em>with a softer half</em>` },
    body: { type: 'string', default: '' },
    ...(dynamic ? {} : { image: { type: 'object', default: { alt: '' } } }),
};

files['block.json'] = JSON.stringify({
    $schema: 'https://schemas.wp.org/trunk/block.json',
    apiVersion: 3,
    name: `${NS}/${slug}`,
    version: '1.0.0',
    title,
    category: NS,
    description: `${title} section.`,
    keywords: [slug],
    textdomain: TD,
    attributes,
    supports: { html: false, align: ['full'], anchor: true },
    example: { viewportWidth: 1440 },
    editorScript: 'file:./index.js',
    ...(dynamic ? { render: 'file:./render.php' } : {}),
}, null, 4) + '\n';

files['index.js'] = `import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
${dynamic ? '' : "import save from './save';\n"}import { blockIcon } from '../../components/block-icons';
import { exampleImage } from '../../components/editor-assets';

registerBlockType(metadata.name, {
    icon: blockIcon('section'),
    edit: Edit,
    save: ${dynamic ? '() => null' : 'save'},
    example: {
        ...metadata.example,
        attributes: {${dynamic ? '' : `
            image: { ...exampleImage('photos/elm-row-after.jpg'), width: 1200, height: 896 },`}
        },
    },
});
`;

files['edit.js'] = `import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
${dynamic ? "import ServerSideRender from '@wordpress/server-side-render';\n" : "import Media, { MediaPlaceholder } from '../../components/media';\nimport MediaField from '../../components/media-field';\n"}import Chapter from '../../components/chapter';
import SectionTheme, { themeClass } from '../../components/section-theme';

/**
 * Edit de ${title}.
 * Textos en línea; tono${dynamic ? '' : ', foto (punto focal + texto alternativo)'} en el panel lateral.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, chapterNum, chapterLabel, title, body${dynamic ? '' : ', image'} } = attributes;

    const blockProps = useBlockProps({
        className: ['${cls}', 'section', themeClass(theme)].filter(Boolean).join(' '),
    });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', '${TD}')} initialOpen>
                    <SectionTheme value={theme} onChange={(value) => setAttributes({ theme: value })} />
                </PanelBody>${dynamic ? '' : `
                <PanelBody title={__('Photo', '${TD}')} initialOpen={false}>
                    <MediaField value={image} onChange={(value) => setAttributes({ image: value })} focal />
                </PanelBody>`}
            </InspectorControls>

            <section {...blockProps}>
                <div className="wrap">
                    <header className="${cls}__head">
                        <Chapter
                            edit
                            num={chapterNum}
                            label={chapterLabel}
                            onChange={({ num, label }) =>
                                setAttributes({
                                    ...(num !== undefined && { chapterNum: num }),
                                    ...(label !== undefined && { chapterLabel: label }),
                                })
                            }
                        />
                        <RichText
                            tagName="h2"
                            className="t-h2 ${cls}__title"
                            value={title}
                            onChange={(value) => setAttributes({ title: value })}
                            allowedFormats={['core/italic']}
                            placeholder={__('Headline', '${TD}')}
                        />
                    </header>
                    <RichText
                        tagName="p"
                        className="t-lead ${cls}__body"
                        value={body}
                        onChange={(value) => setAttributes({ body: value })}
                        allowedFormats={['core/bold', 'core/italic', 'core/link']}
                        placeholder={__('Text', '${TD}')}
                    />${dynamic ? `
                    <ServerSideRender block="${NS}/${slug}" attributes={attributes} />` : `
                    <Media image={image} className="${cls}__media" ratio="4 / 5">
                        <MediaPlaceholder image={image} onChange={(value) => setAttributes({ image: value })} />
                    </Media>`}
                </div>
            </section>
        </>
    );
}
`;

if (!dynamic) {
    files['save.js'] = `import { useBlockProps, RichText } from '@wordpress/block-editor';
import Media from '../../components/media';
import Chapter from '../../components/chapter';
import { themeClass } from '../../components/section-theme';

/**
 * Save de ${title}: el mismo markup que edit.js, con las animaciones por
 * atributos (data-split, data-reveal, data-media-reveal…).
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, chapterNum, chapterLabel, title, body, image } = attributes;

    const blockProps = useBlockProps.save({
        className: ['${cls}', 'section', themeClass(theme)].filter(Boolean).join(' '),
    });

    return (
        <section {...blockProps}>
            <div className="wrap">
                <header className="${cls}__head">
                    <Chapter num={chapterNum} label={chapterLabel} />
                    <RichText.Content tagName="h2" className="t-h2 ${cls}__title" value={title} data-split="" />
                </header>
                {body && <RichText.Content tagName="p" className="t-lead ${cls}__body" value={body} data-reveal="" />}
                <Media image={image} className="${cls}__media" ratio="4 / 5" reveal parallax={0.1} sizes="(min-width: 900px) 50vw, 100vw" />
            </div>
        </section>
    );
}
`;
} else {
    files['render.php'] = `<?php

/**
 * Render server-side de ${title} (${NS}/${slug}).
 * El editor muestra el mismo render vía ServerSideRender.
 *
 * @var array    $attributes Atributos del bloque.
 * @var string   $content    Contenido interno (sin uso).
 * @var WP_Block $block      Instancia del bloque.
 */

defined('ABSPATH') || exit;

$theme = in_array($attributes['theme'] ?? 'light', ['subtle', 'dark'], true) ? 'theme-' . $attributes['theme'] : '';

$wrapper_attributes = get_block_wrapper_attributes(['class' => trim('${cls} section ' . $theme)]);
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput ?>>
    <div class="wrap">
        <?php // Contenido dinámico (WP_Query, ashlar_get_option()…). Escapa SIEMPRE: esc_html, esc_url, wp_kses_post. ?>
    </div>
</section>
`;
}

files['style.scss'] = `// --------------------------------------------------
//      Block: ${title} (${NS}/${slug})
// --------------------------------------------------
// Tokens del tema y variables semánticas (--fg, --accent, --line…): el bloque
// funciona en los tres tonos de sección. Mobile-first con @include up().

@use "config" as *;
@use "tools" as *;

.${cls} {
    &__head {
        display: grid;
        gap: 2rem;
        margin-bottom: var(--space-70);
    }

    &__body {
        max-width: 34rem;
        color: var(--fg-soft);
    }

    &__media {
        margin-top: var(--space-60);
    }

    @include up(ml) {
        &__head {
            grid-template-columns: repeat(12, minmax(0, 1fr));
            column-gap: var(--gap);

            .chapter {
                grid-column: 1 / 4;
                align-self: start;
                padding-top: 1.1em;
            }
        }

        &__title {
            grid-column: 4 / 13;
        }
    }
}
`;

// --- Escritura ------------------------------------------------------------
console.log(`Bloque: ${NS}/${slug}  ·  clase: .${cls}  ·  ${dynamic ? 'dinámico (render.php)' : 'estático (save.js)'}`);
for (const [name, content] of Object.entries(files)) {
    const target = path.join(dir, name);
    if (flags.dry) { console.log(`\n───── ${path.relative(PROJECT_ROOT, target)}\n${content}`); continue; }
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(target, content);
    console.log(`  ✔ ${path.relative(PROJECT_ROOT, target)}`);
}

const forward = `@forward "../../blocks/${slug}/style";`;
if (fs.existsSync(scssIndex)) {
    const cur = fs.readFileSync(scssIndex, 'utf8');
    if (cur.includes(forward)) console.log(`  = ${path.relative(PROJECT_ROOT, scssIndex)} ya tenía el @forward`);
    else if (flags.dry) console.log(`\n───── ${path.relative(PROJECT_ROOT, scssIndex)} (+)\n${forward}`);
    else { fs.writeFileSync(scssIndex, cur.replace(/\s*$/, '\n') + forward + '\n'); console.log(`  ✔ ${path.relative(PROJECT_ROOT, scssIndex)} (+ @forward)`); }
} else {
    console.log(`  ! No existe ${scssIndex}: añade ${forward} donde corresponda.`);
}

if (!flags.dry) console.log(`\nSiguiente: dibuja su icono en src/components/block-icons, ajusta los atributos al diseño y npm run build.\nSi la sección se puede usar como punto de partida, añádela en src/admin/editor/starters.js.`);
