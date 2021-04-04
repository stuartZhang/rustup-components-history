'use strict';

const del = require('del');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SentryCliPlugin = require('@sentry/webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin-stzhang');
const StylelintPlugin = require('stylelint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const ModernModePlugin = require('@vue/cli-service/lib/webpack/ModernModePlugin');
const DeleteSourceMapWebpackPlugin = require('delete-sourcemap-webpack-plugin-stzhang');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
//
const config = require('../config');
const baseWebpackConfig = require('./webpack.base.conf');
const {assetsPath, eslintFormatter, getPreloadPlugins, manifestGenerator, resolve, stylelintFormatter, styleLoaders} = require('./utils');
//
module.exports = cliEnv => { // eslint-disable-line max-lines-per-function
    const configEnv = require(`../config/${cliEnv.NODE_ENV === 'testing' ? 'test' : 'prod'}.env`);
    const isAllFeatures = !cliEnv.MODERN_BUILD_MODE || cliEnv.MODERN_BUILD_MODE === 'modern';
    /**
     * @type {import('webpack').Configuration}
     */
    let webpackConfig = {
        mode: 'production',
        module: {
            rules: [
                ...isAllFeatures ?
                    [{
                        test: /\.(jsx?|tsx?|vue)$/,
                        loader: 'eslint-loader',
                        enforce: 'pre',
                        exclude: ['node_modules', 'static', 'dist'].map(resolve),
                        options: {
                            formatter: eslintFormatter,
                            emitWarning: !config.build.failOnEslintErr
                        }
                    }] :
                    [],
                ...styleLoaders({
                    sourceMap: config.build.productionSourceMap,
                    extract: true,
                    usePostCSS: true
                })
            ]
        },
        devtool: config.build.productionSourceMap ? config.build.devtool : false,
        output: {
            path: config.build.assetsRoot,
            filename: assetsPath('js/[name].[contenthash].js'),
            chunkFilename: assetsPath('js/[id].[contenthash].js'),
            publicPath: config.build.assetsPublicPath
        },
        optimization: {
            concatenateModules: true,
            flagIncludedChunks: true,
            mangleWasmImports: false,
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    sourceMap: config.build.productionSourceMap,
                    parallel: true,
                    cache: true,
                    terserOptions: {
                        warnings: false
                    }
                }),
                /*
                    Compress extracted CSS. We are using this plugin so that possible
                    duplicated CSS from different components can be deduped.
                */
                new OptimizeCSSPlugin({
                    cssProcessorOptions: config.build.productionSourceMap
                        ? {safe: true, map: {inline: false}}
                        : {safe: true}
                })
            ],
            moduleIds: 'hashed',
            nodeEnv: 'production',
            occurrenceOrder: true,
            /*
                extract webpack runtime and module manifest to its own file in order to
                prevent vendor hash from being updated whenever app bundle is updated
            */
            runtimeChunk: {
                name: 'single'
            },
            sideEffects: true,
            splitChunks: {
                chunks: 'async', // initial | async | all
                minSize: 30000, // 被独立切分出来的块至少得有多大。
                maxSize: 0, // 当被独立切分出来的块大于此值时，会被进一步切分为多个`minSize`大小的块。
                minChunks: 1, // 被独立切分出来的块至少同时得被几个其它块分享
                maxAsyncRequests: 5, // 异步加载时，并行最大请求数
                maxInitialRequests: 3, // 应用初始化时，并行最大请求数
                automaticNameDelimiter: '~',
                name: true,
                cacheGroups: {
                    vendors: { // split vendor js into its own file
                        test: /[\\/]node_modules[\\/]/, // 仅缓存组配置项
                        priority: 8 // 仅缓存组配置项，未采用默认优先级`0`。
                    },
                    /*
                        This instance extracts shared chunks from code splited chunks and bundles them
                        in a separate chunk, similar to the vendor chunk
                        see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
                    */
                    default: { // 若没有`test`此缓存组将包括所有chunk。然后，再根据缓存组的优先级，确定最终一个chunk属于哪个缓存组。
                        minChunks: 2,
                        priority: 7,
                        reuseExistingChunk: true // 仅缓存组配置项
                    }
                }
            },
            usedExports: true
        },
        plugins: [
            new webpack.DefinePlugin({'process.env': configEnv}), // http://vuejs.github.io/vue-loader/en/workflow/production.html
            new MiniCssExtractPlugin({ // extract css into its own file
                filename: assetsPath('css/[name].[contenthash].css'),
                chunkFilename: assetsPath('css/[id].[contenthash].css'),
                ignoreOrder: true
            }),
            /*
            generate dist index.html with correct asset hash for caching.
            you can customize output by editing /index.html
            see https://github.com/ampedandwired/html-webpack-plugin
            */
            ...config.entries.map(entry => new HtmlWebpackPlugin({
                inject: true,
                chunksSortMode: 'dependency', // necessary to consistently work with multiple chunks via CommonsChunkPlugin
                favicon: config.common.favicon,
                filename: cliEnv.NODE_ENV === 'testing' ? config.build.template[entry] : config.build.index[entry],
                template: config.build.template[entry],
                assetsSubDirectory: config.build.assetsSubDirectory,
                chunks: [ `px2rem~${config.chunkSuffix}`,  `sentry~${config.chunkSuffix}`, entry, 'single'],
                mount: {
                    [`px2rem~${config.chunkSuffix}`]: {
                        js: 'head'
                    }
                },
                minify: {
                    collapseWhitespace: true,
                    collapseInlineTagWhitespace: true,
                    conservativeCollapse: true,
                    minifyCSS: true,
                    minifyJS: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    trimCustomFragments: true
                    /*
                        more options:
                        https://github.com/kangax/html-minifier#options-quick-reference
                    */
                }
            })),
            // keep module.id stable when vendor modules does not change
            new webpack.HashedModuleIdsPlugin(),
            // copy custom static assets
            new CopyWebpackPlugin({
                patterns: [{
                    from: path.resolve(__dirname, '../static'),
                    to: config.build.assetsSubDirectory,
                    noErrorOnMissing: true,
                    globOptions: {
                        ignore: ['**/.*']
                    }
                }]
            }),
            ...config.common.sentryErrTrace ?
                [new DeleteSourceMapWebpackPlugin()] :
                [],
            ...config.common.sentryErrTrace && isAllFeatures ?
                [new SentryCliPlugin({
                    include: config.build.assetsRoot,
                    release: JSON.parse(configEnv.RELEASE_VERSION),
                    urlPrefix: '~/web_apps/diagonal-demo7'
                })] :
                [],
            ...config.build.productionGzip && isAllFeatures ?
                [(CompressionWebpackPlugin => new CompressionWebpackPlugin({
                    asset: '[path].gz[query]',
                    algorithm: 'gzip',
                    test: new RegExp(`\\.(${config.build.productionGzipExtensions.join('|')})$`),
                    threshold: 10240,
                    minRatio: 0.8
                }))(require('compression-webpack-plugin'))] :
                [],
            ...isAllFeatures ?
                [
                    new ManifestPlugin({generate: manifestGenerator}),
                    new DuplicatePackageCheckerPlugin({
                        verbose: true
                    }),
                    new BundleAnalyzerPlugin({
                        analyzerMode: 'static',
                        reportFilename: 'bundle-report.html',
                        openAnalyzer: config.build.bundleAnalyzerReport
                    }),
                    new StylelintPlugin({
                        files: [
                            'src/**/*.{vue,htm,html,css,sss,less,scss,sass}',
                            'static/**/*.{vue,htm,html,css,sss,less,scss,sass}'
                        ],
                        emitWarning: !config.build.failOnEslintErr,
                        formatter: stylelintFormatter
                    })
                ] :
                []
        ]
    };
    webpackConfig = merge(baseWebpackConfig, webpackConfig);
    if (isAllFeatures) { // 默认 或 modern
        webpackConfig.plugins.push(...getPreloadPlugins());
        if (cliEnv.MODERN_BUILD_MODE === 'modern') {
            const {filename, chunkFilename} = webpackConfig.output;
            webpackConfig.output.filename = filename.replace(/(\.[a-z]+)$/, '-modern$1');
            webpackConfig.output.chunkFilename = chunkFilename.replace(/(\.[a-z]+)$/, '-modern$1');
            webpackConfig.plugins.push(new ModernModePlugin({
                targetDir: config.build.assetsRoot,
                isModernBuild: true,
                unsafeInline: true,
                jsDirectory: 'js'
            }));
        }
    } else { // legacy
        const {filename, chunkFilename} = webpackConfig.output;
        webpackConfig.output.filename = filename.replace(/(\.[a-z]+)$/, '-legacy$1');
        webpackConfig.output.chunkFilename = chunkFilename.replace(/(\.[a-z]+)$/, '-legacy$1');
        webpackConfig.plugins.push(new ModernModePlugin({
            targetDir: config.build.assetsRoot,
            isModernBuild: false,
            unsafeInline: true,
            jsDirectory: undefined
        }));
    }
    if (cliEnv.MODERN_BUILD_MODE === 'modern') {
        return webpackConfig;
    } // 默认 或 legacy
    return del([
        config.build.assetsSubDirectory,
        ...config.entries.map(entry => config.build.index[entry]),
        path.relative(webpackConfig.output.path, config.dev.assetsRoot),
        path.relative(webpackConfig.output.path, resolve('node_modules/.cache'))
    ], {
        force: true,
        dryRun: false,
        cwd: webpackConfig.output.path,
        dot: true,
        ignore: []
    }).then(() => webpackConfig);
};
