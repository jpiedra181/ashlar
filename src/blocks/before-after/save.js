import { useBlockProps, RichText } from '@wordpress/block-editor';
import Button from '../../components/button';
import Chapter from '../../components/chapter';
import { themeClass } from '../../components/section-theme';
import Compare from './compare';

export const changeNumber = (index) => String(index + 1).padStart(2, '0');

/**
 * Save de Antes y después.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { theme, chapterNum, chapterLabel, title, buttonLabel, buttonUrl, aside, changes } = attributes;

    return (
        <section {...useBlockProps.save({ className: ['before-after', 'section', themeClass(theme)].filter(Boolean).join(' ') })}>
            <div className="before-after__inner wrap">
                <header className="before-after__head">
                    <div className="before-after__heading">
                        <Chapter num={chapterNum} label={chapterLabel} />
                        <RichText.Content tagName="h2" className="before-after__title" value={title} data-split="" />
                    </div>
                    {buttonLabel ? (
                        <div className="before-after__action" data-reveal="">
                            <Button url={buttonUrl} variant="outline">
                                <RichText.Content value={buttonLabel} />
                            </Button>
                        </div>
                    ) : (
                        aside && <RichText.Content tagName="p" className="before-after__aside" value={aside} data-reveal="" />
                    )}
                </header>

                <div data-media-reveal="">
                    <Compare attributes={attributes} />
                </div>

                {changes.length > 0 && (
                    <ol className="before-after__changes">
                        {changes.map((change, index) => (
                            <li className="before-after__change" key={index} data-reveal="">
                                <span className="before-after__num" aria-hidden="true">
                                    {changeNumber(index)}
                                </span>
                                <RichText.Content tagName="p" value={change.text} />
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        </section>
    );
}
