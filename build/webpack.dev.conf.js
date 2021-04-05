'use strict';

process.env.NODE_ENV = 'development';

const del = require('del');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const portfinder = require('portfinder');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
//
const utils = require('./utils');
const config = require('../config');
const baseWebpackConfig = require('./webpack.base.conf');
//
const HOST = process.env.HOST || config.dev.host;
const PORT = process.env.PORT && Number(process.env.PORT);
/**
 * @type {import('webpack').Configuration}
 */
let devWebpackConfig = {
    mode: 'development',
    module: {
        rules: utils.styleLoaders({
            sourceMap: config.dev.cssSourceMap,
            usePostCSS: true
        })
    },
    // cheap-module-eval-source-map is faster for development
    devtool: config.dev.devtool,
    output: {
        path: config.dev.assetsRoot,
        filename: utils.assetsPath('[name]-dev_dbg.js'),
        chunkFilename: utils.assetsPath('[name]-dev_dbg.js'),
        publicPath: config.dev.assetsPublicPath
    },
    optimization: {
        moduleIds: 'named',
        namedModules: true,
        namedChunks: true,
        nodeEnv: 'development',
        noEmitOnErrors: true
    },
    // these devServer options should be customized in /config/index.js
    devServer: {
        clientLogLevel: 'warning',
        historyApiFallback: false,
        hot: true,
        contentBase: config.dev.contentBase.length > 0 ? config.dev.contentBase : false,
        compress: true,
        host: '0.0.0.0',
        port: PORT || config.dev.port,
        open: config.dev.autoOpenBrowser,
        openPage: `${config.dev.assetsPublicPath}${config.dev.index[config.entries[0]]}`,
        overlay: config.dev.errorOverlay ? {warnings: false, errors: true} : false,
        publicPath: config.dev.assetsPublicPath,
        proxy: config.dev.proxyTable,
        index: config.dev.index[config.entries[0]],
        before: config.dev.before,
        after: config.dev.after,
        useLocalIp: config.dev.useLocalIp,
        quiet: true, // necessary for FriendlyErrorsPlugin
        watchContentBase: config.dev.contentBase.length > 0,
        writeToDisk: true, // 输出临时编译结果至硬盘
        transportMode: 'ws',
        headers: {
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
            'Access-Control-Allow-Origin': '*'
        },
        watchOptions: {
            poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-
            ignored: /\bdist\b/
        }
    },
    plugins: [
        new CaseSensitivePathsPlugin(),
        new webpack.DefinePlugin({
            'process.env': require('../config/dev.env')
        }),
        new MiniCssExtractPlugin({ // extract css into its own file
            filename: utils.assetsPath('[name]-dev_dbg.css'),
            chunkFilename: utils.assetsPath('[name]-dev_dbg.css'),
            ignoreOrder: true
        }),
        new webpack.HotModuleReplacementPlugin(),
        ...config.entries.map(entry => new HtmlWebpackPlugin({ // https://github.com/ampedandwired/html-webpack-plugin
            inject: true,
            favicon: config.common.favicon,
            filename: config.dev.index[entry],
            template: config.dev.template[entry],
            assetsSubDirectory: config.dev.assetsSubDirectory,
            chunks: [`px2rem~${config.chunkSuffix}`, `sentry~${config.chunkSuffix}`, entry],
            mount: {
                [`px2rem~${config.chunkSuffix}`]: {
                    js: 'head'
                }
            }
        })),
        ...utils.getPreloadPlugins(),
        // copy custom static assets
        new CopyWebpackPlugin({
            patterns: [{
                from: path.resolve(__dirname, '../static'),
                to: config.dev.assetsSubDirectory,
                noErrorOnMissing: true,
                globOptions: {
                    ignore: ['**/.*']
                }
            }]
        })
    ]
};
devWebpackConfig = merge(baseWebpackConfig, devWebpackConfig);

if (/^eslint(?:Server)?\.js$/i.test(path.basename(require.main.filename)) ||
    require.main.filename === path.resolve(__dirname, 'build.js')) {
    module.exports = devWebpackConfig; // eslint-import-resolver-webpack 不能处理 Promise<WebpackConfig> 的返回值。
} else {
    module.exports = del([
        config.dev.assetsRoot,
        'node_modules/.cache'
    ], {
        force: true,
        dryRun: false,
        dot: true,
        ignore: []
    }).then(() => new Promise((resolve, reject) => {
        portfinder.basePort = process.env.PORT || config.dev.port;
        portfinder.getPort((err, port) => {
            if (err) {
                reject(err);
            } else {
                resolve(port);
            }
        });
    })).then(port => {
        process.env.PORT = port; // publish the new Port, necessary for e2e tests
        devWebpackConfig.devServer.port = port; // add port to devServer config
        devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({ // Add FriendlyErrorsPlugin
            compilationSuccessInfo: {
                messages: [
                    `Your application is running here: http://${HOST}:${port}/${config.dev.index[config.entries[0]]}`,
                    `Inspect the online directory structure of the application here: http://${HOST}:${port}/webpack-dev-server`,
                    `敏行开发服务器管理界面：http://${HOST}:${port}/minxing-dev-server`
                ]
            },
            onErrors: config.dev.notifyOnErrors
                ? utils.createNotifierCallback
                : undefined
        }));
        return devWebpackConfig;
    });
}
