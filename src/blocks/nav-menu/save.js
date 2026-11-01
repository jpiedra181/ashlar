/**
 * Save del bloque Menú.
 *
 * Devuelve null porque es un bloque dinámico: el markup lo genera render.php
 * (que llama a wp_nav_menu). En el contenido no se guarda nada — que es
 * justo el objetivo: el cliente gestiona los enlaces desde Apariencia → Menús
 * sin tocar el template part.
 */
export default function save() {
    return null;
}
