import { useBlockProps, RichText } from '@wordpress/block-editor';
import Chapter from '../../components/chapter';
import Media from '../../components/media';
import { themeClass } from '../../components/section-theme';

/**
 * Save de «Who built it»: personas (foto 96 × 120, cargo, nombre, una línea)
 * y, debajo de un filete, los demás profesionales de la obra.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, chapterNum, chapterLabel, title, people, credits } = attributes;

    return (
        <section {...useBlockProps.save({ className: ['project-team', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
            <div className="project-team__inner wrap">
                <div className="project-team__heading">
                    <Chapter num={chapterNum} label={chapterLabel} />
                    <RichText.Content tagName="h2" className="project-team__title" value={title} data-split="" />
                </div>
                <ul className="project-team__list">
                    {people.map((person, index) => (
                        <li className="project-team__person" key={index} data-reveal="">
                            <Media image={person.image} className="project-team__photo" sizes="96px" />
                            <div className="project-team__info">
                                <RichText.Content tagName="p" className="project-team__role" value={person.role} />
                                <RichText.Content tagName="h3" className="project-team__name" value={person.name} />
                                {person.note && <RichText.Content tagName="p" className="project-team__note" value={person.note} />}
                            </div>
                        </li>
                    ))}
                </ul>
                {credits && <RichText.Content tagName="p" className="project-team__credits" value={credits} data-reveal="" />}
            </div>
        </section>
    );
}
