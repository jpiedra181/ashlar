import { __, sprintf } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import Chapter from '../../components/chapter';
import Media, { MediaPlaceholder } from '../../components/media';
import MediaField from '../../components/media-field';
import LinkField from '../../components/link-field';
import { Arrow } from '../../components/icons';
import SectionTheme, { themeClass } from '../../components/section-theme';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';
import { serviceNumber } from './save';

/**
 * Edit de la lista de servicios. Nombres, plazos y precios se escriben
 * encima; el enlace y la foto de cada fila, en el panel lateral (un panel
 * por servicio). En el lienzo la foto se ve siempre, para poder elegirla.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, chapterNum, chapterLabel, title, note, services } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });
    const setServices = (next) => setAttributes({ services: next });
    const update = (index, data) => setServices(updateItem(services, index, data));

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={set('theme')} />
                </PanelBody>
                {services.map((service, index) => (
                    <PanelBody
                        key={index}
                        /* translators: 1: number, 2: service name. */
                        title={sprintf(__('%1$s · %2$s', 'ashlar'), serviceNumber(index), (service.name || __('Service', 'ashlar')).replace(/<[^>]+>/g, '').replace('&amp;', '&'))}
                        initialOpen={false}
                    >
                        <LinkField label={__('Link', 'ashlar')} value={service.url} onChange={(value) => update(index, { url: value })} />
                        <MediaField label={__('Photo on hover', 'ashlar')} help={__('Decorative: it only appears when the pointer is over the row.', 'ashlar')} value={service.image} onChange={(value) => update(index, { image: value })} decorative />
                    </PanelBody>
                ))}
            </InspectorControls>

            <section {...useBlockProps({ className: ['services', 'section', 'is-editing', themeClass(theme)].filter(Boolean).join(' ') })}>
                <div className="services__inner wrap">
                    <header className="services__head">
                        <div className="services__heading">
                            <Chapter edit num={chapterNum} label={chapterLabel} onChange={({ num, label }) => setAttributes({ ...(num !== undefined && { chapterNum: num }), ...(label !== undefined && { chapterLabel: label }) })} />
                            <RichText tagName="h2" className="services__title" value={title} onChange={set('title')} allowedFormats={[]} placeholder={__('Section headline', 'ashlar')} />
                        </div>
                        <RichText tagName="p" className="services__note" value={note} onChange={set('note')} allowedFormats={[]} placeholder={__('Note (optional)', 'ashlar')} />
                    </header>

                    <ul className="services__list">
                        {services.map((service, index) => (
                            <li className="srow ashlar-item" key={index}>
                                <ItemActions index={index} count={services.length} label={__('Service', 'ashlar')} onMove={(from, to) => setServices(moveItem(services, from, to))} onRemove={(i) => setServices(removeItem(services, i))} />
                                <div className="srow__link">
                                    <span className="srow__num" aria-hidden="true">
                                        {serviceNumber(index)}
                                    </span>
                                    <RichText tagName="h3" className="srow__name" value={service.name} onChange={(value) => update(index, { name: value })} allowedFormats={[]} placeholder={__('Kind of job', 'ashlar')} />
                                    <Media image={service.image} className="srow__thumb">
                                        <MediaPlaceholder image={service.image} onChange={(value) => update(index, { image: value })} label={__('Photo', 'ashlar')} />
                                    </Media>
                                    <span className="srow__meta">
                                        <RichText tagName="span" className="srow__duration" value={service.duration} onChange={(value) => update(index, { duration: value })} allowedFormats={[]} placeholder="14–24 weeks" />
                                        <RichText tagName="span" className="srow__price" value={service.price} onChange={(value) => update(index, { price: value })} allowedFormats={[]} placeholder="From £95k" />
                                    </span>
                                    <Arrow direction="up-right" className="srow__arrow" />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <AddItem label={__('Add service', 'ashlar')} count={services.length} max={8} onClick={() => setServices([...services, { name: '', duration: '', price: '', url: '', image: {} }])} />
                </div>
            </section>
        </>
    );
}
