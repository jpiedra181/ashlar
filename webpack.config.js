const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

/**
 * Extend sass-loader rules to add loadPaths for the shared SCSS.
 * This allows any block's style.scss to @use 'config/config' as *
 * without needing a relative path or a tilde prefix.
 */
const rules = (defaultConfig.module?.rules || []).map((rule) => {
    if (!rule.use) return rule;

    const uses = (Array.isArray(rule.use) ? rule.use : [rule.use]).map(
        (loader) => {
            if (
                typeof loader === 'object' &&
                loader.loader?.includes('sass-loader')
            ) {
                return {
                    ...loader,
                    options: {
                        ...loader.options,
                        sassOptions: {
                            ...(loader.options?.sassOptions || {}),
                            loadPaths: [path.resolve(__dirname, 'src/scss')],
                        },
                    },
                };
            }
            return loader;
        }
    );

    return { ...rule, use: uses };
});

// defaultConfig.entry is getWebpackEntryPoints('script') — a sync function.
// Call it to get the auto-discovered block entries, then merge our extras.
const extraEntries = {
    'css/main': path.resolve(__dirname, 'src/scss/main.scss'),
    'css/editor': path.resolve(__dirname, 'src/scss/editor/index.scss'),
    'js/app': path.resolve(__dirname, 'src/js/app.js'),
    'admin/editor-config': path.resolve(__dirname, 'src/admin/editor-config.js'),
    'admin/settings-page': path.resolve(__dirname, 'src/admin/settings-page.js'),
    'admin/admin': path.resolve(__dirname, 'src/admin/admin.scss'),
    'admin/admin-colors': path.resolve(__dirname, 'src/admin/admin-colors.scss'),
    'admin/login': path.resolve(__dirname, 'src/admin/login.js'),
    'admin/project-panel': path.resolve(__dirname, 'src/admin/project-panel.js'),
};

/**
 * Librerías compartidas: se cargan UNA vez como scripts de WordPress y ningún
 * bundle las lleva dentro.
 *
 * Cuando un fichero hace `import { gsap } from 'gsap'`, webpack no empaqueta
 * GSAP: lo sustituye por el global `window.gsap` y el plugin de dependencias
 * apunta el handle (`ashlar-gsap`) en el `.asset.php` del bundle. WordPress
 * resuelve el orden de carga y, aunque cinco bloques usen GSAP, se descarga
 * una sola vez. Los ficheros salen tal cual de node_modules a build/vendor/
 * (CopyWebpackPlugin, abajo) y se registran en inc/enqueue.php.
 *
 * `@ashlar/app` es la API global del tema (window.ashlar: ciclo de vida, motion,
 * scroll): los view.js de los bloques la importan igual que una librería.
 */
const SHARED = {
    gsap: { global: 'gsap', handle: 'ashlar-gsap', file: 'gsap/dist/gsap.min.js' },
    'gsap/ScrollTrigger': { global: 'ScrollTrigger', handle: 'ashlar-gsap-scrolltrigger', file: 'gsap/dist/ScrollTrigger.min.js' },
    'gsap/SplitText': { global: 'SplitText', handle: 'ashlar-gsap-splittext', file: 'gsap/dist/SplitText.min.js' },
    lenis: { global: 'Lenis', handle: 'ashlar-lenis', file: 'lenis/dist/lenis.min.js' },
    '@ashlar/app': { global: 'ashlar', handle: 'ashlar-app' },
};

const plugins = defaultConfig.plugins.filter(
    (plugin) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
);

module.exports = {
    ...defaultConfig,

    entry: {
        ...defaultConfig.entry(),
        ...extraEntries,
    },

    module: {
        ...defaultConfig.module,
        rules,
    },

    plugins: [
        ...plugins,
        new DependencyExtractionWebpackPlugin({
            requestToExternal: (request) => SHARED[request]?.global,
            requestToHandle: (request) => SHARED[request]?.handle,
        }),
        new CopyWebpackPlugin({
            patterns: [
                ...Object.values(SHARED)
                    .filter((lib) => lib.file)
                    .map((lib) => ({
                        from: require.resolve(lib.file),
                        to: `vendor/${path.basename(lib.file)}`,
                    })),
            ],
        }),
    ],

    // Alias '@assets' → src/assets. Permite referenciar assets desde cualquier
    // bloque sin rutas relativas frágiles: url("~@assets/icons/...") en SCSS.
    resolve: {
        ...defaultConfig.resolve,
        alias: {
            ...(defaultConfig.resolve?.alias || {}),
            '@assets': path.resolve(__dirname, 'src/assets'),
        },
    },
};
