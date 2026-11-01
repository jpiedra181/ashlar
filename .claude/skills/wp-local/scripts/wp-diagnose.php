<?php
/**
 * Diagnóstico del WordPress que sirve este tema, sin WP-CLI.
 *
 *   php .claude/skills/wp-local/scripts/wp-diagnose.php [--block=ashlar/hero] [--json]
 *
 * Arranca WordPress con wp-load.php (lo busca subiendo desde la carpeta del
 * tema) y responde a las preguntas que más tiempo han costado en este
 * proyecto:
 *   - ¿Qué tema está ACTIVO? (el gotcha del insertador vacío)
 *   - ¿Qué bloques del tema (namespace de .claude/project.json) están registrados? ¿Falta build/?
 *   - ¿Las template parts (header/footer) se sirven del fichero o de la BD?
 *   - ¿Qué páginas usan un bloque concreto? (para saber si cambiar su save.js
 *     necesita deprecated.js)
 *   - Plugins activos, versión de WP/PHP, WP_DEBUG, permalinks.
 *
 * Solo lee. No cambia nada.
 */

declare(strict_types=1);

// Solo por consola: si el servidor lo ejecuta por HTTP, no expone nada
if (PHP_SAPI !== 'cli') {
    exit("Command line only.
");
}

$args = [];
foreach (array_slice($argv, 1) as $a) {
    if (preg_match('/^--([^=]+)(?:=(.*))?$/', $a, $m)) {
        $args[$m[1]] = $m[2] ?? true;
    }
}
$asJson = isset($args['json']);

// Namespace de los bloques del tema (.claude/project.json).
$project = json_decode((string) @file_get_contents(dirname(__DIR__, 3) . '/project.json'), true) ?: [];
$ns      = $project['blockNamespace'] ?? 'ashlar';

// Localizar wp-load.php subiendo desde la carpeta del tema.
$dir = realpath(__DIR__ . '/../../../..'); // raíz del tema
$wpLoad = null;
for ($i = 0; $i < 6 && $dir; $i++) {
    if (file_exists($dir . '/wp-load.php')) {
        $wpLoad = $dir . '/wp-load.php';
        break;
    }
    $dir = dirname($dir);
}
if (!$wpLoad) {
    fwrite(STDERR, "No encuentro wp-load.php subiendo desde el tema. Pásalo con la variable de entorno WP_LOAD.\n");
    $wpLoad = getenv('WP_LOAD') ?: null;
    if (!$wpLoad || !file_exists($wpLoad)) {
        exit(1);
    }
}

// Evitar que WP intente redirigir o servir una página.
define('WP_USE_THEMES', false);
$_SERVER['HTTP_HOST'] = $_SERVER['HTTP_HOST'] ?? 'localhost';
$_SERVER['REQUEST_URI'] = '/';
$_SERVER['SERVER_NAME'] = 'localhost';

try {
    require_once $wpLoad;
} catch (Throwable $e) {
    fwrite(STDERR, "WordPress no arranca: " . $e->getMessage() . "\n¿Está levantado el sitio en Local (MySQL)?\n");
    exit(1);
}

$out = [];
$out['wp_load'] = $wpLoad;
$out['wordpress'] = get_bloginfo('version');
$out['php'] = PHP_VERSION;
$out['home_url'] = home_url('/');
$out['wp_debug'] = defined('WP_DEBUG') && WP_DEBUG;
$out['permalink_structure'] = get_option('permalink_structure') ?: '(plain: ?p=N — los bloques con paginación y el sitemap lo necesitan "bonito")';

$themeDir = basename(realpath(__DIR__ . '/../../../..'));
$out['theme'] = [
    'this_theme_folder' => $themeDir,
    'active_stylesheet' => get_option('stylesheet'),
    'active_template'   => get_option('template'),
    'is_this_theme_active' => get_option('stylesheet') === $themeDir,
];

// Bloques del tema
$registry = WP_Block_Type_Registry::get_instance()->get_all_registered();
$themeBlocks = array_values(array_filter(array_keys($registry), fn($n) => str_starts_with($n, $ns . '/')));
sort($themeBlocks);
$out['blocks'] = [
    'registered_count' => count($themeBlocks),
    'registered' => $themeBlocks,
    'build_dir_exists' => is_dir(get_template_directory() . '/build/blocks'),
    'src_blocks' => array_map('basename', glob(get_template_directory() . '/src/blocks/*', GLOB_ONLYDIR) ?: []),
];
$srcOnly = array_diff(array_map(fn($s) => $ns . '/' . $s, $out['blocks']['src_blocks']), $themeBlocks);
$out['blocks']['in_src_but_not_registered'] = array_values($srcOnly);

// Template parts: ¿fichero o BD?
$parts = get_posts(['post_type' => 'wp_template_part', 'numberposts' => -1, 'post_status' => 'any']);
$out['template_parts_overridden_in_db'] = array_map(fn($p) => ['slug' => $p->post_name, 'id' => $p->ID, 'modified' => $p->post_modified], $parts);
$templates = get_posts(['post_type' => 'wp_template', 'numberposts' => -1, 'post_status' => 'any']);
$out['templates_overridden_in_db'] = array_map(fn($p) => ['slug' => $p->post_name, 'id' => $p->ID], $templates);

// Menús
$locations = get_nav_menu_locations();
$out['menus'] = [];
foreach (get_registered_nav_menus() as $loc => $label) {
    $menuId = $locations[$loc] ?? 0;
    $menu = $menuId ? wp_get_nav_menu_object($menuId) : null;
    $out['menus'][$loc] = $menu ? $menu->name . ' (' . $menu->count . ' items)' : '— sin asignar';
}

// Plugins
$active = (array) get_option('active_plugins', []);
$out['plugins_active'] = $active;
$out['plugins_updates_available'] = [];
if (function_exists('get_plugin_updates')) {
    require_once ABSPATH . 'wp-admin/includes/update.php';
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
    foreach (get_plugin_updates() as $file => $p) {
        $out['plugins_updates_available'][] = $file . ' → ' . ($p->update->new_version ?? '?');
    }
}
$out['users_with_admin'] = count(get_users(['role' => 'administrator', 'fields' => 'ID']));
$out['users_named_admin'] = (bool) get_user_by('login', 'admin');

// Uso de un bloque concreto
if (!empty($args['block'])) {
    $block = (string) $args['block'];
    $pages = get_posts(['post_type' => ['page', 'post', 'wp_template', 'wp_template_part'], 'numberposts' => -1, 'post_status' => 'any', 's' => '<!-- wp:' . $block]);
    $uses = [];
    foreach ($pages as $p) {
        $n = substr_count($p->post_content, '<!-- wp:' . $block . ' ') + substr_count($p->post_content, '<!-- wp:' . $block . ' /-->') + substr_count($p->post_content, '<!-- wp:' . $block . ' -->');
        if ($n === 0 && str_contains($p->post_content, '<!-- wp:' . $block)) {
            $n = 1;
        }
        if ($n > 0) {
            $uses[] = ['id' => $p->ID, 'type' => $p->post_type, 'status' => $p->post_status, 'title' => $p->post_title, 'instances' => $n, 'edit' => admin_url('post.php?post=' . $p->ID . '&action=edit')];
        }
    }
    $out['block_usage'] = ['block' => $block, 'used_in' => $uses, 'needs_deprecated_if_save_changes' => count($uses) > 0];
}

if ($asJson) {
    echo json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), "\n";
    exit(0);
}

// Salida legible
$line = fn(string $k, $v) => printf("  %-32s %s\n", $k, is_bool($v) ? ($v ? 'sí' : 'NO') : (is_array($v) ? json_encode($v, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) : (string) $v));
echo "WordPress\n";
$line('versión', $out['wordpress'] . ' · PHP ' . $out['php']);
$line('home', $out['home_url']);
$line('WP_DEBUG', $out['wp_debug']);
$line('permalinks', $out['permalink_structure']);
echo "\nTema\n";
$line('carpeta de este tema', $out['theme']['this_theme_folder']);
$line('tema activo (stylesheet)', $out['theme']['active_stylesheet']);
$line('¿este tema está activo?', $out['theme']['is_this_theme_active']);
if (!$out['theme']['is_this_theme_active']) {
    echo "  ⚠ El insertador saldrá VACÍO: WP solo ejecuta el functions.php del tema activo. Actívalo en Apariencia → Temas.\n";
}
echo "\nBloques\n";
$line('registrados ' . $ns . '/*', $out['blocks']['registered_count']);
$line('build/blocks existe', $out['blocks']['build_dir_exists']);
if (!$out['blocks']['build_dir_exists']) {
    echo "  ⚠ Sin build/: npm run build\n";
}
if ($out['blocks']['in_src_but_not_registered']) {
    $line('en src/ pero NO registrados', $out['blocks']['in_src_but_not_registered']);
}
echo "\nTemplate parts en BD (override del fichero)\n";
if (!$out['template_parts_overridden_in_db']) {
    echo "  ninguna: header/footer se sirven de parts/*.html ✔\n";
}
foreach ($out['template_parts_overridden_in_db'] as $p) {
    echo "  ⚠ {$p['slug']} (ID {$p['id']}, modificado {$p['modified']}) — el fichero parts/{$p['slug']}.html NO se usa; revertir desde el Editor del sitio si se quiere el del fichero.\n";
}
echo "\nMenús\n";
foreach ($out['menus'] as $loc => $v) {
    $line($loc, $v);
}
echo "\nPlugins activos\n";
foreach ($out['plugins_active'] as $p) {
    echo "  · $p\n";
}
foreach ($out['plugins_updates_available'] as $p) {
    echo "  ⚠ actualización disponible: $p\n";
}
$line('usuarios administradores', $out['users_with_admin']);
if ($out['users_named_admin']) {
    echo "  ⚠ Existe un usuario con login \"admin\" (objetivo nº 1 de fuerza bruta).\n";
}
if (isset($out['block_usage'])) {
    echo "\nUso de {$out['block_usage']['block']}\n";
    if (!$out['block_usage']['used_in']) {
        echo "  No se usa en ningún contenido: puedes cambiar save.js sin deprecated.\n";
    }
    foreach ($out['block_usage']['used_in'] as $u) {
        echo "  · [{$u['type']} {$u['status']}] #{$u['id']} \"{$u['title']}\" ×{$u['instances']}  {$u['edit']}\n";
    }
    if ($out['block_usage']['needs_deprecated_if_save_changes']) {
        echo "  ⚠ Está publicado: antes de tocar save.js, congela la versión actual (skill deprecated-save).\n";
    }
}
