import { useBlockProps, RichText } from '@wordpress/block-editor';
import Media from '../../components/media';
import { themeClass } from '../../components/section-theme';

/** Clases de la sección (compartidas con edit.js). */
export const teamClass = ({ theme, moreTitle }) => ['team', 'section', moreTitle && 'team--more', themeClass(theme)].filter(Boolean).join(' ');

/**
 * Save del equipo (About: «The people you’ll actually meet.»).
 *
 * Cabecera, la lista de personas (retrato, rol y años, nombre y una línea) y,
 * si tiene título, la tarjeta «+ 21 more» con los oficios. En el HTML el
 * nombre (<h3>) va antes que el rol para que, navegando por encabezados, se
 * llegue al nombre; el CSS sube el rol encima.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { eyebrow, title, lede, people, moreTitle, moreText, roles } = attributes;

    return (
        <section {...useBlockProps.save({ className: teamClass(attributes) })}>
            <div className="team__inner wrap">
                <header className="team__head">
                    <div className="team__heading">
                        {eyebrow && <RichText.Content tagName="p" className="team__eyebrow" value={eyebrow} data-reveal="" />}
                        <RichText.Content tagName="h2" className="team__title" value={title} data-split="" />
                    </div>
                    {lede && <RichText.Content tagName="p" className="team__lede" value={lede} data-reveal="" />}
                </header>

                <div className="team__grid">
                    <ul className="team__people">
                        {people.map((person, index) => (
                            <li className="team__person" key={index} data-reveal="">
                                <Media image={person.image} className="team__portrait" sizes="(min-width: 1024px) 288px, 96px" />
                                <div className="team__meta">
                                    <RichText.Content tagName="h3" className="team__name" value={person.name} />
                                    <RichText.Content tagName="p" className="team__role" value={person.role} />
                                    <RichText.Content tagName="p" className="team__fact" value={person.fact} />
                                </div>
                            </li>
                        ))}
                    </ul>

                    {moreTitle && (
                        <div className="team__more" data-reveal="">
                            <RichText.Content tagName="p" className="team__more-title" value={moreTitle} />
                            {moreText && <RichText.Content tagName="p" className="team__more-text" value={moreText} />}
                            {roles.length > 0 && (
                                <ul className="team__roles">
                                    {roles.map((role, index) => (
                                        <li key={index}>
                                            <RichText.Content tagName="span" className="team__trade" value={role.label} />{' '}
                                            <RichText.Content tagName="span" className="team__count" value={role.count} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
