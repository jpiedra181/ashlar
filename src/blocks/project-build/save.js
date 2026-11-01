import { useBlockProps, RichText } from '@wordpress/block-editor';
import Chapter from '../../components/chapter';
import Media from '../../components/media';
import { themeClass } from '../../components/section-theme';
import Programme from './programme';

/**
 * Save de «On site»: cabecera, mosaico de cuatro fotos con pie (una alta, una
 * ancha y dos pequeñas) y el programa de obra.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, chapterNum, chapterLabel, title, lede, photos, showProgramme } = attributes;

    return (
        <section {...useBlockProps.save({ className: ['project-build', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
            <div className="project-build__inner wrap">
                <header className="project-build__head">
                    <div className="project-build__heading">
                        <Chapter num={chapterNum} label={chapterLabel} />
                        <RichText.Content tagName="h2" className="project-build__title" value={title} data-split="" />
                    </div>
                    {lede && <RichText.Content tagName="p" className="project-build__lede" value={lede} data-reveal="" />}
                </header>

                {photos.length > 0 && (
                    <div className="project-build__photos">
                        {photos.map((photo, index) => (
                            <figure className={`project-build__photo project-build__photo--${index + 1}`} key={index} data-reveal="">
                                <Media image={photo.image} className="project-build__media" sizes={index === 1 ? '(min-width: 1024px) 844px, 100vw' : '(min-width: 1024px) 420px, 100vw'} />
                                {photo.caption && <RichText.Content tagName="figcaption" value={photo.caption} />}
                            </figure>
                        ))}
                    </div>
                )}

                {showProgramme && (
                    <div data-reveal="">
                        <Programme attributes={attributes} />
                    </div>
                )}
            </div>
        </section>
    );
}
