import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import SectionTheme, { themeClass } from '../../components/section-theme';
import { ItemActions, AddItem, moveItem, removeItem, updateItem } from '../../components/repeater';

/**
 * Edit de Colaboradores.
 *
 * @param {Object} props Props del bloque.
 */
export default function Edit({ attributes, setAttributes }) {
    const { theme, label, names } = attributes;
    const setNames = (next) => setAttributes({ names: next });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Section', 'ashlar')} initialOpen>
                    <SectionTheme value={theme} onChange={(value) => setAttributes({ theme: value })} />
                </PanelBody>
            </InspectorControls>

            <section {...useBlockProps({ className: ['partners', themeClass(theme)].filter(Boolean).join(' ') })}>
                <div className="partners__inner wrap">
                    <RichText tagName="h2" className="partners__label" value={label} onChange={(value) => setAttributes({ label: value })} allowedFormats={[]} placeholder={__('Label', 'ashlar')} />
                    <ul className="partners__list">
                        {names.map((item, index) => (
                            <li className="partners__name ashlar-item" key={index}>
                                <ItemActions index={index} count={names.length} label={__('Name', 'ashlar')} onMove={(from, to) => setNames(moveItem(names, from, to))} onRemove={(i) => setNames(removeItem(names, i))} />
                                <RichText tagName="span" value={item.name} onChange={(value) => setNames(updateItem(names, index, { name: value }))} allowedFormats={[]} placeholder={__('Studio or maker', 'ashlar')} />
                            </li>
                        ))}
                    </ul>
                    <AddItem label={__('Add name', 'ashlar')} count={names.length} max={8} onClick={() => setNames([...names, { name: '' }])} />
                </div>
            </section>
        </>
    );
}
