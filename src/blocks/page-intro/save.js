import { useBlockProps, RichText } from '@wordpress/block-editor';
import Media from '../../components/media';
import IntroTitle from '../../components/intro-title';
import { themeClass } from '../../components/section-theme';

/**
 * Save de la cabecera de página interior (Projects, Services, About…).
 *
 * El titular es el <h1> de la página y entra línea a línea (IntroTitle).
 * Los enlaces rápidos («Jump to») y la foto con pie solo salen si se rellenan.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, eyebrow, title, lede, ledeAlign, linksLabel, links, image, caption } = attributes;
    const classes = ['page-intro', ledeAlign === 'top' && 'page-intro--top', themeClass(theme)].filter(Boolean).join(' ');

    return (
        <section {...useBlockProps.save({ className: classes })}>
            <div className="page-intro__inner wrap">
                <div className="page-intro__heading">
                    {eyebrow && <RichText.Content tagName="p" className="page-intro__eyebrow" value={eyebrow} data-intro="" style={{ '--i': 0 }} />}
                    <IntroTitle value={title} className="page-intro__title" start={1} />
                    {links.length > 0 && (
                        <nav className="page-intro__links" aria-label={linksLabel ? linksLabel.replace(/<[^>]+>/g, '') : 'Sections'} data-intro="" style={{ '--i': 3 }}>
                            {linksLabel && <RichText.Content tagName="span" className="page-intro__links-label" value={linksLabel} />}
                            <ul>
                                {links.map((link, index) => (
                                    <li key={index}>
                                        <a className="chip" href={link.url || undefined}>
                                            <RichText.Content value={link.label} />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}
                </div>
                {lede && <RichText.Content tagName="p" className="page-intro__lede" value={lede} data-intro="" style={{ '--i': 2 }} />}
                {image?.url && (
                    <figure className="page-intro__figure">
                        <Media image={image} className="page-intro__media" priority intro sizes="(min-width: 1440px) 1280px, 100vw" />
                        {caption && <RichText.Content tagName="figcaption" className="page-intro__caption" value={caption} />}
                    </figure>
                )}
            </div>
        </section>
    );
}
