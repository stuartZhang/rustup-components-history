'use strict';
const path = require('path');
const notifier = require('node-notifier');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {cssPublicPath, eslintFormatterBuild, extractBuildArg, getGitInfo, manifestGenerator, preloadPluginBuild, printStats, stylelintFormatterBuild} = require('webpack-minxing-utils');

exports.assetsPath = function(_path){
    const config = require('../config');
    const assetsSubDirectory = process.env.NODE_ENV === 'production'
        ? config.build.assetsSubDirectory
        : config.dev.assetsSubDirectory;

    return path.posix.join(assetsSubDirectory, _path);
};
exports.cssLoaders = function(options){
    options = options || {};

    const cssLoader = {
        loader: 'css-loader',
        options: {
            sourceMap: options.sourceMap
        }
    };
    // 多【基准宽度】配置，请参考：https://www.npmjs.com/package/px2rem-loader-stzhang#%E5%A4%9A-remunit-%E9%85%8D%E7%BD%AE%E9%A1%B9%E6%A8%A1%E5%BC%8F
    const px2remLoader = {
        loader: 'px2rem-loader-stzhang',
        options: {
            multiRemUnits: [{ // iframe 切签页
                include: ['src'],
                remUnit: Math.sqrt(Math.pow(784, 2) + Math.pow(542, 2)) / 10, // 设计稿中被绘制区域对角线长度 除以 10。
                baseDpr: 1,
                minPixelValue: 1
            }]
        }
    };
    const postcssLoader = {
        loader: 'postcss-loader',
        options: {
            sourceMap: options.sourceMap
        }
    };
    // generate loader string to be used with extract text plugin
    function generateLoaders(loader, loaderOptions){
        const config = require('../config');
        const loaders = [cssLoader , px2remLoader ];
        if (options.usePostCSS) {
            loaders.push(postcssLoader);
        }
        if (loader) {
            loaders.push({
                loader: `${loader}-loader`,
                options: Object.assign({}, loaderOptions, {
                    sourceMap: options.sourceMap
                })
            });
        }
        return ['css-hot-loader', {
            /*
            Extract CSS when that option is specified
            (which is the case during production build)
            */
            loader: MiniCssExtractPlugin.loader,
            options: {
                /*
                    you can specify a publicPath here
                    by default it use publicPath in webpackOptions.output
                */
                publicPath: process.env.NODE_ENV === 'production'
                    ? cssPublicPath(config.build.assetsPublicPath, config.build.assetsSubDirectory)
                    : cssPublicPath(config.dev.assetsPublicPath, config.dev.assetsSubDirectory),
                // 仅在产品模式下，`extract`才会被设置为`true`。
                ...options.extract ?
                    {} :
                    {// 为了兼容 IE 9，并没有使用 ['vue-style-loader'] 的内联样式。
                        hmr: true,
                        reloadAll: true
                    }
            }
        }, ...loaders];
    }
    // https://vue-loader.vuejs.org/en/configurations/extract-css.html
    return {
        css: generateLoaders(),
        postcss: generateLoaders(),
        less: generateLoaders('less'),
        sass: generateLoaders('sass', {indentedSyntax: true}),
        scss: generateLoaders('sass'),
        stylus: generateLoaders('stylus'),
        styl: generateLoaders('stylus')
    };
};
// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function(options){
    const output = [];
    const loaders = exports.cssLoaders(options);

    for (const extension of Object.keys(loaders)) {
        output.push({
            test: new RegExp(`\\.${extension}$`),
            use: loaders[extension]
        });
    }

    return output;
};
exports.createNotifierCallback = function(severity, errors){
    if (severity !== 'error') {
        return;
    }
    const error = errors[0];
    const filename = error.file && error.file.split('!').pop();
    notifier.notify({
        title: process.env.npm_package_name,
        message: `${severity}: ${error.name}`,
        subtitle: filename || '',
        icon: path.join(__dirname, '../src/assets/images/favicon.ico')
    });
};
exports.resolve = function(dir){
    return path.join(__dirname, '..', dir);
};
exports.resolveFlavor = function(){
    const config = require('../config');
    let filePath;
    if (config.common.flavor && config.common.flavor !== 'normal') {
        filePath = `flavor/${config.common.flavor}/config.json`;
    } else {
        filePath = 'src/config.json';
    }
    filePath = path.join(__dirname, '..', filePath);
    console.log('选择 Flavor：', path.relative('.', filePath)); // eslint-disable-line no-console
    return filePath;
};
exports.printStats = printStats;
exports.getGitInfo = getGitInfo;
exports.extractBuildArg = extractBuildArg;
exports.manifestGenerator = manifestGenerator;
exports.getPreloadPlugins = function(){
    const config = require('../config');
    const devBuildKey = /^(testing|production)$/.test(process.env.NODE_ENV) ? 'build' : 'dev';
    return config.entries.reduce(preloadPluginBuild(config[devBuildKey].index), []);
};
exports.eslintFormatter = function(results){
    const config = require('../config');
    return eslintFormatterBuild(config.build.assetsRoot)(results);
};
exports.stylelintFormatter = function(result){
    const config = require('../config');
    return stylelintFormatterBuild(config.build.assetsRoot)(result);
};
