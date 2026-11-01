import { useBlockProps, RichText } from '@wordpress/block-editor';
import Button from '../../components/button';
import Media from '../../components/media';
import IntroTitle from '../../components/intro-title';
import Survey from './survey';
import SiteBoard from './site-board';

/**
 * Save del hero de la portada.
 *
 * La foto a sangre en tono oscuro con las cotas, el titular (el <h1> de la
 * página), la frase, los botones y la disponibilidad a la izquierda, y el
 * cartel de obra a la derecha (debajo en móvil). Todo lo que se ve sin hacer
 * scroll entra con CSS (IntroTitle, data-intro): nunca espera al JavaScript
 * ni retrasa el LCP.
 *
 * @param {Object} props Props del bloque.
 */
export default function save({ attributes }) {
    const { statement, image, headline, primaryLabel, primaryUrl, secondaryLabel, secondaryUrl, capacity, survey, dimLabel, pointCode, pointLevel } = attributes;

    return (
        <section {...useBlockProps.save({ className: 'home-hero theme-dark' })}>
            <Media image={image} className="home-hero__media" priority intro sizes="100vw" />
            <span className="home-hero__scrim" aria-hidden="true" />
            {survey && <Survey dimLabel={dimLabel} pointCode={pointCode} pointLevel={pointLevel} />}

            <div className="home-hero__content wrap">
                <div className="home-hero__main">
                    <IntroTitle tagName="h1" className="home-hero__title" value={headline} start={1} />
                    {statement && <RichText.Content tagName="p" className="home-hero__statement" value={statement} data-intro="" style={{ '--i': 4 }} />}
                    {(primaryLabel || secondaryLabel) && (
                        <div className="home-hero__actions" data-intro="" style={{ '--i': 5 }}>
                            {primaryLabel && (
                                <Button url={primaryUrl}>
                                    <RichText.Content value={primaryLabel} />
                                </Button>
                            )}
                            {secondaryLabel && (
                                <Button url={secondaryUrl} variant="outline" arrow={false}>
                                    <RichText.Content value={secondaryLabel} />
                                </Button>
                            )}
                        </div>
                    )}
                    {capacity && <RichText.Content tagName="p" className="home-hero__capacity" value={capacity} data-intro="" style={{ '--i': 6 }} />}
                </div>

                <SiteBoard attributes={attributes} />
            </div>
        </section>
    );
}
