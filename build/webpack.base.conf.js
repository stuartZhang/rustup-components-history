'use strict';
const path = require('path');
const webpack = require('webpack');
const {VueLoaderPlugin} = require('vue-loader');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const AlertAssetMount = require('html_webpack_plugin_alter_asset_mount-stzhang');
//
const {assetsPath, resolve} = require('./utils');
const config = require('../config');
const vueLoaderConfig = require('./vue-loader.conf');
/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
    context: path.resolve(__dirname, '../'),
    entry: config.entries.reduce((entries, entry, index) => {
        const suffix = index > 0 ? index + 1 : '';
        entries[entry] = [
            'core-js/es/string/repeat.js',
            'core-js/es/array/includes.js',
            'core-js/es/number/is-nan.js',
            'eligrey-classlist-js-polyfill/classList.js',
            'lib-flexible-stzhang',
            './src/App.less',
            './src/sentry.ts',
            `./src/logger${suffix}.ts`,
            
            `./src/${entry}.ts`
        ];
        return entries;
    }, {}),
    optimization: {
        removeAvailableModules: true,
        removeEmptyChunks: true,
        mergeDuplicateChunks: true,
        providedExports: true,
        splitChunks: {
            cacheGroups: {
                px2rem: {
                    test: resolve('node_modules/lib-flexible-stzhang'),
                    chunks: 'initial',
                    priority: 10,
                    minSize: 1
                },
                sentry: {
                    test: resolve('src/sentry.ts'),
                    chunks: 'initial',
                    priority: 9,
                    minSize: 1
                }
            }
        }
    },
    resolve: {
        mainFields: ['jsnext:main', 'module', 'browser', 'main'],
        extensions: ['.ts', '.tsx', '.vue', '.json', '.js', '.jsx'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            'moment$': 'moment/moment.js',
            '@': resolve('src'),
            'assets': resolve('src/assets')
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            '$': 'jquery',
            'jQuery': 'jquery',
            'windows.jQuery': 'jquery'
        }),
        // make sure to include the plugin for the magic
        new VueLoaderPlugin(),
        new MomentLocalesPlugin({
            localesToKeep: ['zh-cn']
        }),
        new HardSourceWebpackPlugin({
            environmentHash: {
                root: path.resolve(__dirname, '..'),
                directories: [],
                files: [
                    'package.json',
                    'package-lock.json',
                    'package_build.json',
                    'babel.config.js',
                    'build/build.js',
                    'build/merge-build-pkg.js',
                    '.browserslistrc',
                    '.postcssrc.js'
                ]
            },
            info: {
                mode: 'none',
                level: 'info'
            }
        }),
        new HardSourceWebpackPlugin.ExcludeModulePlugin([{
            test: /mini-css-extract-plugin[\\/]dist[\\/]loader/
        }]),
        new AlertAssetMount(),
        new FilterWarningsPlugin({
            exclude: [
                /Failed to parse source map/,
                /Critical dependency: the request of a dependency is an expression/
            ]
        })
    ],
    module: {
        rules: [{
            test: /\.vue$/,
            use: [{
                loader: 'vue-loader',
                options: vueLoaderConfig
            }]
        }, {
            test: /\.js$/,
            loader: 'source-map-loader',
            enforce: 'pre'
        }, {
            test: /\.(jsx?|tsx?)$/,
            loader: 'babel-loader',
            options: {
                cacheDirectory: process.env.NODE_ENV === 'development',
                configFile: resolve('babel.config.js')
            },
            include: [
                resolve('src'),
                resolve('test'),
                resolve('node_modules/webpack-dev-server/client')
            ]
        }, {
            test: /\.(png|ico|jpe?g|gif|svg)(\?.*)?$/,
            loader: 'url-loader',
            options: {
                limit: 10000,
                name: assetsPath('img/[name].[contenthash:8].[ext]')
            }
        }, {
            test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
            loader: 'url-loader',
            options: {
                limit: 10000,
                name: assetsPath('media/[name].[contenthash:8].[ext]')
            }
        }, {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            loader: 'url-loader',
            options: {
                limit: 10000,
                name: assetsPath('fonts/[name].[contenthash:8].[ext]')
            }
        }]
    },
    performance: {// 配置webpack执行相关
        maxEntrypointSize: 1000000, // 最大入口文件大小1M
        maxAssetSize: 1000000 // 最大资源文件大小1M
    },
    node: {
        /*
          prevent webpack from injecting useless setImmediate polyfill because Vue
          source contains it (although only uses it if it's native).
         */
        setImmediate: false,
        process: false,
        Buffer: false,
        /*
          prevent webpack from injecting mocks to Node native modules
          that does not make sense for the client
         */
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty'
    }
};
