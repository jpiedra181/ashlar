/**
 * Save del bloque Menú de cabecera.
 *
 * Devuelve null porque es un bloque dinámico: el markup lo genera render.php
 * (botón, overlay, logo y wp_nav_menu). No se guarda nada en el template part,
 * que es justo el objetivo: el cliente gestiona los enlaces desde Apariencia →
 * Menús sin poder descuadrar la cabecera.
 */
export default function save() {
    return null;
}
