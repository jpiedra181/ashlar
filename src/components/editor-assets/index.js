/**
 * Rutas a los assets del tema dentro del editor.
 *
 * inc/gutenberg.php publica window.ashlarEditor.assets (URL de src/assets/images/)
 * antes que cualquier script de bloque. Sirve para las vistas previas del
 * insertador, que enseñan cada bloque con fotos reales del estudio.
 */

export const assetsUrl = () => window.ashlarEditor?.assets || '';

/**
 * Imagen de ejemplo con la forma del atributo de imagen.
 *
 * @param {string} path  Ruta dentro de src/assets/images/.
 * @param {Object} focal Punto focal opcional.
 */
export function exampleImage(path, focal) {
    return { url: assetsUrl() + path, alt: '', focal };
}
