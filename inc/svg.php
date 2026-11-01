<?php

/**
 * SVG upload support.
 * Restricted to administrators. Sanitised if enshrined/svg-sanitize is available.
 */

defined('ABSPATH') || exit;

/**
 * Allow the SVG mime type for administrators only.
 */
add_filter('upload_mimes', function (array $mimes): array {
    if (!current_user_can('manage_options')) {
        return $mimes;
    }

    $mimes['svg']  = 'image/svg+xml';
    $mimes['svgz'] = 'image/svg+xml';

    return $mimes;
});

/**
 * WP sniffs the real file contents since 4.7.1 and SVG is plain text,
 * so the detected type never matches. Trust the extension for SVG only.
 */
add_filter('wp_check_filetype_and_ext', function ($data, $file, $filename, $mimes) {
    if (!empty($data['ext']) && !empty($data['type'])) {
        return $data;
    }

    $filetype = wp_check_filetype($filename, $mimes);

    if (in_array($filetype['ext'], ['svg', 'svgz'], true)) {
        $data['ext']  = $filetype['ext'];
        $data['type'] = $filetype['type'];
    }

    return $data;
}, 10, 4);

/**
 * Sanitise the file before it lands in uploads/.
 * Uses enshrined/svg-sanitize when present; otherwise rejects files
 * containing the most obvious script vectors.
 */
add_filter('wp_handle_upload_prefilter', function (array $file): array {
    if (($file['type'] ?? '') !== 'image/svg+xml') {
        return $file;
    }

    $contents = file_get_contents($file['tmp_name']);

    if ($contents === false || stripos($contents, '<svg') === false) {
        $file['error'] = __('The file does not look like a valid SVG.', 'ashlar');
        return $file;
    }

    if (class_exists('\enshrined\svgSanitize\Sanitizer')) {
        $sanitizer = new \enshrined\svgSanitize\Sanitizer();
        $sanitizer->removeRemoteReferences(true);

        $clean = $sanitizer->sanitize($contents);

        if ($clean === false) {
            $file['error'] = __('The SVG could not be cleaned.', 'ashlar');
            return $file;
        }

        file_put_contents($file['tmp_name'], $clean);

        return $file;
    }

    // Fallback: no sanitiser available, block the obvious vectors.
    $patterns = [
        '/<script\b/i',
        '/\son\w+\s*=/i',
        '/javascript\s*:/i',
        '/<foreignObject\b/i',
        '/<!ENTITY\b/i',
    ];

    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $contents)) {
            $file['error'] = __('The SVG contains potentially unsafe code.', 'ashlar');
            return $file;
        }
    }

    return $file;
});

/**
 * SVGs have no intrinsic dimensions, so they render collapsed or oversized
 * in the media library grid.
 */
add_action('admin_head', function (): void {
    echo '<style>
        .attachment .thumbnail img[src$=".svg"],
        .media-icon img[src$=".svg"],
        .attachment-266x266[src$=".svg"] {
            width: 100%;
            height: auto;
        }
    </style>';
});