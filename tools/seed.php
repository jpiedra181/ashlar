<?php

/**
 * Seed de desarrollo — deja un WordPress recién instalado listo para trabajar.
 *
 *   php tools/seed.php            (desde la carpeta del tema)
 *   php tools/seed.php --force    (vuelve a escribir páginas y proyectos)
 *
 * Hace lo mismo que el botón de Options → Demo content en el escritorio: el
 * código está en inc/demo.php (ashlar_demo_import()). Es IDEMPOTENTE y no se
 * ejecuta nunca en producción por sí solo.
 */

if (PHP_SAPI !== 'cli') {
    exit("Command line only.\n");
}

$_SERVER['HTTP_HOST']   = $_SERVER['HTTP_HOST'] ?? 'ashlar.local';
$_SERVER['REQUEST_URI'] = '/';

// wp-load.php: se busca hacia arriba desde el tema (y desde la carpeta actual,
// por si el tema está enlazado con un symlink).
$wp_load = null;
foreach (array_filter([__DIR__, (string) getenv('PWD'), getcwd()]) as $dir) {
    for ($i = 0; $i < 8 && $dir !== dirname($dir); $i++, $dir = dirname($dir)) {
        if (is_file($dir . '/wp-load.php')) {
            $wp_load = $dir . '/wp-load.php';
            break 2;
        }
    }
}
if (!$wp_load) {
    exit("wp-load.php not found. Run this from the theme folder inside WordPress.\n");
}
require $wp_load;

echo "Ashlar seed\n";

// Desde la consola no hay usuario conectado: los mensajes van a la salida.
ashlar_demo_import(
    in_array('--force', $argv ?? [], true),
    static fn(string $message) => fwrite(STDOUT, '  · ' . $message . "\n")
);

echo "Done. Open " . home_url('/') . "\n";
