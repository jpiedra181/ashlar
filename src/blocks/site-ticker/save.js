import { useBlockProps, RichText } from '@wordpress/block-editor';
import { tickerProgress } from './style-vars';

/**
 * Save de «On site now». La barra es decorativa: la información ya va en el
 * texto («Week 14 of 22»), así que se oculta a los lectores de pantalla.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { label, site, capacity } = attributes;
    const progress = tickerProgress(attributes);

    return (
        <section {...useBlockProps.save({ className: 'ticker theme-dark', style: progress.style })}>
            <div className="ticker__inner wrap">
                <p className="ticker__live">
                    <RichText.Content tagName="span" className="ticker__tag" value={label} />
                    <span className="ticker__site">
                        <RichText.Content value={site} /> · {progress.week}
                    </span>
                    <span className="ticker__progress" aria-hidden="true">
                        <span className="ticker__track">
                            <span className="ticker__fill" />
                        </span>
                        <span className="ticker__pct">{progress.percent}%</span>
                    </span>
                </p>
                {capacity && <RichText.Content tagName="p" className="ticker__capacity" value={capacity} />}
            </div>
        </section>
    );
}
