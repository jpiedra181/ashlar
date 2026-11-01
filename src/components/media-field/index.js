/**
 * MediaField — campo de foto para el panel lateral del editor.
 *
 *  - Elegir, cambiar o quitar la foto desde la biblioteca de medios.
 *  - Punto focal (opcional): el cliente pincha en la foto dónde está lo
 *    importante y el recorte lo respeta en todos los tamaños de pantalla.
 *  - Texto alternativo editable aquí mismo, con aviso si falta. Las fotos
 *    decorativas (decorative) no lo piden: se pintan con alt="".
 *
 * El texto alternativo se guarda en el bloque (para este uso concreto de la
 * foto); al elegir una foto se propone el que tenga en la biblioteca.
 */

import { __ } from '@wordpress/i18n';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { BaseControl, Button, FocalPointPicker, Notice, TextareaControl } from '@wordpress/components';
import { imageFromMedia } from '../media';

export default function MediaField({ label, help, value = {}, onChange, focal = false, decorative = false }) {
    const hasImage = Boolean(value.url);

    return (
        <BaseControl label={label} help={help} className="ashlar-media-field" __nextHasNoMarginBottom>
            <MediaUploadCheck>
                <MediaUpload
                    allowedTypes={['image']}
                    value={value.id}
                    onSelect={(media) => onChange(imageFromMedia(media, value))}
                    render={({ open }) => (
                        <div className="ashlar-media-field__body">
                            {hasImage && focal && (
                                <FocalPointPicker
                                    __nextHasNoMarginBottom
                                    url={value.url}
                                    value={value.focal || { x: 0.5, y: 0.5 }}
                                    onChange={(point) => onChange({ ...value, focal: point })}
                                    help={__('Click where the important part of the photo is: the crop will keep it in view.', 'ashlar')}
                                />
                            )}

                            {hasImage && !focal && (
                                <button type="button" className="ashlar-media-field__preview" onClick={open}>
                                    <img src={value.url} alt="" />
                                    <span className="screen-reader-text">{__('Change photo', 'ashlar')}</span>
                                </button>
                            )}

                            <div className="ashlar-media-field__actions">
                                <Button variant="secondary" onClick={open} __next40pxDefaultSize>
                                    {hasImage ? __('Change photo', 'ashlar') : __('Choose photo', 'ashlar')}
                                </Button>
                                {hasImage && (
                                    <Button variant="tertiary" isDestructive onClick={() => onChange({})} __next40pxDefaultSize>
                                        {__('Remove', 'ashlar')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                />
            </MediaUploadCheck>

            {hasImage && !decorative && (
                <>
                    <TextareaControl
                        __nextHasNoMarginBottom
                        className="ashlar-media-field__alt"
                        label={__('Alternative text', 'ashlar')}
                        help={__('Describe the photo for people who cannot see it and for search engines. E.g. “Rear extension with steel-framed doors onto the garden”.', 'ashlar')}
                        value={value.alt || ''}
                        onChange={(alt) => onChange({ ...value, alt })}
                        rows={2}
                    />
                    {!value.alt?.trim() && (
                        <Notice status="warning" isDismissible={false} className="ashlar-media-field__notice">
                            {__('This photo has no alternative text.', 'ashlar')}
                        </Notice>
                    )}
                </>
            )}
        </BaseControl>
    );
}
