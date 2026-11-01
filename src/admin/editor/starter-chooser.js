/**
 * «¿Cómo quieres empezar?» — el cliente elige un punto de partida viendo una
 * vista previa REAL (los propios bloques renderizados en miniatura) y la
 * página se rellena con un clic.
 *
 *  - Se abre sola al abrir una página vacía (nueva o guardada sin secciones),
 *    después de la guía de bienvenida para no abrir dos ventanas.
 *  - Siempre está a mano en el menú ⋮ → «Puntos de partida…». Si la página ya
 *    tiene secciones, avisa de que se sustituyen (y Deshacer las recupera).
 */

import { __ } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { BlockPreview, store as blockEditorStore } from '@wordpress/block-editor';
import { Modal, Notice } from '@wordpress/components';
import { PluginMoreMenuItem, store as editorStore } from '@wordpress/editor';
import { store as preferencesStore } from '@wordpress/preferences';
import { STARTERS } from './starters';

const OPEN_EVENT = 'ashlar:open-starters';

// [nombre, atributos, bloques internos (opcional, mismo formato)]
const toBlock = ([name, attributes, inner = []]) => createBlock(name, attributes, inner.map(toBlock));
const build = (starter) => starter.blocks().map(toBlock);

// Estilos extra para las miniaturas (ninguna sección de Ashlar usa alturas en
// vh, así que de momento no hace falta ninguno).
const PREVIEW_STYLES = [];

function StarterCard({ starter, onChoose }) {
    const blocks = useMemo(() => build(starter), [starter]);

    return (
        <li>
            <button type="button" className="ashlar-starter__card" onClick={() => onChoose(starter)}>
                <span className="ashlar-starter__preview" aria-hidden="true">
                    {blocks.length ? (
                        <BlockPreview blocks={blocks} viewportWidth={1440} additionalStyles={PREVIEW_STYLES} />
                    ) : (
                        <span className="ashlar-starter__blank">+</span>
                    )}
                </span>
                <span className="ashlar-starter__title">{starter.title}</span>
                <span className="ashlar-starter__text">{starter.description}</span>
            </button>
        </li>
    );
}

export function StarterChooser() {
    const { isPage, isEmpty, guideSeen } = useSelect((select) => {
        const editor = select(editorStore);
        return {
            isPage: editor.getCurrentPostType() === 'page',
            // Contenido GUARDADO (no el que se edita): borrar todas las
            // secciones a mitad de sesión no vuelve a abrir la ventana.
            isEmpty: editor.isEditedPostNew() || !editor.getCurrentPostAttribute('content'),
            guideSeen: Boolean(select(preferencesStore).get('ashlar', 'welcomeGuideSeen')),
        };
    }, []);
    const hasBlocks = useSelect((select) => select(blockEditorStore).getBlockCount() > 0, []);

    const [isOpen, setOpen] = useState(false);
    const [autoOpened, setAutoOpened] = useState(false);

    // Apertura automática, una vez, en páginas vacías.
    useEffect(() => {
        if (STARTERS.length && !autoOpened && isPage && isEmpty && guideSeen && !hasBlocks) {
            setOpen(true);
            setAutoOpened(true);
        }
    }, [autoOpened, isPage, isEmpty, guideSeen, hasBlocks]);

    // Apertura desde el menú ⋮.
    useEffect(() => {
        const open = () => setOpen(true);
        window.addEventListener(OPEN_EVENT, open);
        return () => window.removeEventListener(OPEN_EVENT, open);
    }, []);

    const { resetBlocks } = useDispatch(blockEditorStore);

    if (!isOpen) return null;

    const choose = (starter) => {
        const blocks = build(starter);
        if (blocks.length || hasBlocks) resetBlocks(blocks);
        setOpen(false);
    };

    return (
        <Modal title={__('How would you like to start?', 'ashlar')} className="ashlar-starter" onRequestClose={() => setOpen(false)} size="large">
            <p className="ashlar-starter__intro">
                {__('Pick a starting point. You can then change every text and photo, and add, move or remove sections.', 'ashlar')}
            </p>
            {hasBlocks && (
                <Notice status="warning" isDismissible={false} className="ashlar-starter__notice">
                    {__('This page already has sections: the starting point you choose will replace them. If you change your mind, press Undo (Ctrl + Z) before saving.', 'ashlar')}
                </Notice>
            )}
            <ul className="ashlar-starter__grid">
                {STARTERS.map((starter) => (
                    <StarterCard key={starter.id} starter={starter} onChoose={choose} />
                ))}
            </ul>
        </Modal>
    );
}

/** Menú ⋮ → «Puntos de partida…» (solo en páginas). */
export function StarterMenuItem() {
    const isPage = useSelect((select) => select(editorStore).getCurrentPostType() === 'page', []);

    if (!isPage) return null;

    return (
        <PluginMoreMenuItem icon="layout" onClick={() => window.dispatchEvent(new window.CustomEvent(OPEN_EVENT))}>
            {__('Starting points…', 'ashlar')}
        </PluginMoreMenuItem>
    );
}
