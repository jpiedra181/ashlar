<?php

/**
 * Ashlar: functions.php
 * Punto de entrada — solo carga los ficheros de inc/.
 */

defined('ABSPATH') || exit;

require_once get_template_directory() . '/inc/helpers.php';
require_once get_template_directory() . '/inc/settings.php';
require_once get_template_directory() . '/inc/projects.php';
require_once get_template_directory() . '/inc/journal.php';
require_once get_template_directory() . '/inc/messages.php';
require_once get_template_directory() . '/inc/theme-setup.php';
require_once get_template_directory() . '/inc/menus.php';
require_once get_template_directory() . '/inc/enqueue.php';
require_once get_template_directory() . '/inc/front.php';
require_once get_template_directory() . '/inc/seo.php';
require_once get_template_directory() . '/inc/blocks.php';
require_once get_template_directory() . '/inc/gutenberg.php';
require_once get_template_directory() . '/inc/svg.php';
require_once get_template_directory() . '/inc/admin.php';
require_once get_template_directory() . '/inc/login.php';
require_once get_template_directory() . '/inc/demo.php';
