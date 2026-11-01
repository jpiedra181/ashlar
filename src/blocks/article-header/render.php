<?php

/**
 * Render de la cabecera del artículo (templates/single.html).
 *
 * Migas (Journal / tema) · minutos y fecha · la pregunta (h1) · el recuadro
 * «The short answer» (el extracto) a la derecha · la foto destacada a lo
 * ancho. Entra con la intro CSS (data-intro), como las demás cabeceras.
 *
 * @var array    $attributes Atributos del bloque.
 * @var WP_Block $block      Instancia del bloque.
 */

defined('ABSPATH') || exit;

$article = ashlar_block_article($block);

if (!$article) {
    return;
}

$journal_url = ashlar_journal_page_url();
$topic_url   = $article['topic_slug'] ? add_query_arg('topic', $article['topic_slug'], $journal_url) . '#articles' : '';

$wrapper = get_block_wrapper_attributes(['class' => 'article-header']);
?>
<header <?php echo $wrapper; // phpcs:ignore WordPress.Security.EscapeOutput ?>>
    <div class="article-header__inner wrap">
        <nav class="article-header__crumbs" aria-label="<?php echo esc_attr(wp_strip_all_tags($attributes['breadcrumbLabel'] ?? 'Breadcrumb')); ?>" data-intro style="--i:0">
            <ol>
                <li><a href="<?php echo esc_url($journal_url); ?>"><?php echo esc_html(wp_strip_all_tags($attributes['journalLabel'] ?? 'Journal')); ?></a></li>
                <?php if ($topic_url) : ?>
                    <li><a href="<?php echo esc_url($topic_url); ?>"><?php echo esc_html($article['topic']); ?></a></li>
                <?php endif; ?>
            </ol>
        </nav>

        <div class="article-header__main">
            <div class="article-header__heading">
                <p class="article-header__meta" data-intro style="--i:1">
                    <span><?php echo esc_html(ashlar_article_minutes($article)); ?></span>
                    <time datetime="<?php echo esc_attr($article['datetime']); ?>"><?php echo esc_html($article['date']); ?></time>
                </p>
                <h1 class="article-header__title"><span class="intro-mask"><span class="intro-line" style="--i:1"><?php echo esc_html($article['title']); ?></span></span></h1>
            </div>

            <?php if ($article['answer'] !== '') : ?>
                <div class="article-header__answer" data-intro style="--i:2">
                    <p class="article-header__label"><?php echo esc_html(wp_strip_all_tags($attributes['answerLabel'] ?? 'The short answer')); ?></p>
                    <p class="article-header__text"><?php echo esc_html($article['answer']); ?></p>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <?php if ($article['image']) : ?>
        <div class="article-header__photo wrap">
            <?php
            echo ashlar_media($article['image'], [ // phpcs:ignore WordPress.Security.EscapeOutput
                'class'    => 'article-header__media',
                'sizes'    => '(min-width: 1440px) 1280px, 100vw',
                'priority' => true,
                'intro'    => true,
            ]);
            ?>
        </div>
    <?php endif; ?>
</header>
