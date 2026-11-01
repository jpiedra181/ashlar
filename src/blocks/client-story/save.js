import { useBlockProps, RichText } from '@wordpress/block-editor';
import Chapter from '../../components/chapter';
import Media from '../../components/media';
import { Arrow } from '../../components/icons';
import { themeClass } from '../../components/section-theme';

/** Triángulo de «play» de la píldora de vídeo. */
export const PlayIcon = () => (
    <svg className="client-story__play" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
    </svg>
);

/**
 * Save de «In their words»: foto de los clientes (con la píldora del vídeo si
 * hay enlace) y la cita grande con nombre, obra y enlace a más historias.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, layout, image, videoLabel, videoUrl, chapterNum, chapterLabel, quote, name, project, linkLabel, linkUrl } = attributes;

    return (
        <section {...useBlockProps.save({ className: ['client-story', layout === 'bleed' ? 'client-story--bleed' : 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
            <div className="client-story__inner wrap">
                <div className="client-story__visual">
                    <Media image={image} className="client-story__media" reveal parallax={0.1} sizes="(min-width: 1024px) 520px, 100vw" />
                    {videoUrl && videoLabel && (
                        <a className="client-story__video" href={videoUrl}>
                            <PlayIcon />
                            <RichText.Content value={videoLabel} />
                        </a>
                    )}
                </div>

                <figure className="client-story__body">
                    <Chapter num={chapterNum} label={chapterLabel} />
                    <blockquote className="client-story__quote">
                        <RichText.Content tagName="p" value={quote} data-split="" />
                    </blockquote>
                    <figcaption className="client-story__caption" data-reveal="">
                        <RichText.Content tagName="span" className="client-story__name" value={name} />
                        <RichText.Content tagName="span" className="client-story__project" value={project} />
                    </figcaption>
                    {linkLabel && linkUrl && (
                        <p className="client-story__more" data-reveal="">
                            <a className="link" href={linkUrl}>
                                <RichText.Content value={linkLabel} />
                                <Arrow />
                            </a>
                        </p>
                    )}
                </figure>
            </div>
        </section>
    );
}
