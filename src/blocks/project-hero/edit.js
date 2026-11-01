import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { store as editorStore } from '@wordpress/editor';

/**
 * Edit de la foto principal: enseña la imagen destacada del proyecto y deja
 * escribir las dos notas encima.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes, context }) {
    const { dimension, caption } = attributes;
    const set = (key) => (value) => setAttributes({ [key]: value });

    const src = useSelect(
        (select) => {
            const editor = select(editorStore);
            const id = context.postId && editor.getCurrentPostId() === context.postId ? editor.getEditedPostAttribute('featured_media') : select(coreStore).getEntityRecord('postType', context.postType || 'project', context.postId)?.featured_media;
            const media = id ? select(coreStore).getMedia(id) : null;
            return media?.media_details?.sizes?.['2048x2048']?.source_url || media?.media_details?.sizes?.large?.source_url || media?.source_url || '';
        },
        [context.postId, context.postType]
    );

    return (
        <figure {...useBlockProps({ className: 'project-hero theme-dark' })}>
            <div className="project-hero__photo">
                <div className="media project-hero__media">
                    {src ? <img src={src} alt="" /> : <p className="project-hero__empty">{__('The main photo of the project goes here. Choose it in the sidebar: Project → Main photo.', 'ashlar')}</p>}
                </div>
            </div>
            <p className="project-hero__dim">
                <RichText tagName="span" className="project-hero__note" value={dimension} onChange={set('dimension')} allowedFormats={[]} placeholder={__('Dimension note (optional)', 'ashlar')} />
                <span className="project-hero__dim-line" />
            </p>
            <RichText tagName="figcaption" className="project-hero__note project-hero__caption" value={caption} onChange={set('caption')} allowedFormats={[]} placeholder={__('Room and size (optional)', 'ashlar')} />
        </figure>
    );
}
