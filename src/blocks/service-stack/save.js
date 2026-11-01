import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

/**
 * Save de «Pinned services»: solo el contenedor de los bloques Service.
 *
 * Sin JS, en móvil o con movimiento reducido no añade nada (los servicios van
 * uno tras otro); el modo fijo lo monta view.js.
 */
export default function save() {
    return <div {...useInnerBlocksProps.save(useBlockProps.save({ className: 'service-stack', 'data-service-stack': '' }))} />;
}
