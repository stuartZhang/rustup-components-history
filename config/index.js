'use strict';
/* eslint-disable no-console, no-sync */
/*
  Template version: 1.3.1
  see http://vuejs-templates.github.io/webpack for documentation.
 */
const path = require('path');
const webpack = require('webpack');
const ip = require('quick-local-ip-stzhang');
const {extractBuildArg, getGitInfo, resolve} = require('../build/utils');
const useMock = extractBuildArg('--mock-data', 'MOCK_DATA', 'boolean');
const sentryErrTrace = extractBuildArg('--sentry-err-trace', 'SENTRY_ERR_TRACE', 'boolean');
const tunnelEnabled = extractBuildArg('--tunnel-enabled', 'SSO_PROXY_TUNNEL_ENABLED', 'boolean');

const ssoproxy = require('webpack-dev-server-ssoproxy')({
    // logServer: 'https://www.minxing365.com',
    webpack,
    protocol: process.env.SSO_PROXY_PROTOCOL,
    host: process.env.SSO_PROXY_HOST,
    port: process.env.SSO_PROXY_PORT,
    userName: process.env.SSO_PROXY_USERNAME,
    password: process.env.SSO_PROXY_PASSWORD,
    tunnelEnabled,
    redirectPath: `/dehuinet/apps/sso_redirect?url=${encodeURIComponent('/mxapproval/admin.html')}`,
    outputDir: 'dist',
    dbgJsSuffix: '-dev_dbg.js',
    mappers: new Map([ // 指向文件目录的其它位置。
        [/^\/favicon.ico/, 'src/assets/images/favicon.ico']
    ]),
    mockData: useMock ? require('./mock') : undefined,
    context: []
});
const checknum = {
    timestamp: new Date().getTime(),
    git: getGitInfo()
};
const entries = ['admin', 'admin2'];
const DIST_PREFIX = resolve('dist');
const BUILD_ASSETS_PUBLIC_ROOT = '';
const BUILD_ASSETS_SUB_DIRECTORY = 'bundle/admin';
const templates = entries.reduce((templates, entry) => {
    templates[entry] = `${entry}.html`;
    return templates;
}, {});
const indexPages = entries.reduce((indexPages, entry) => {
    indexPages[entry] = `${entry.replace(/^admin$/, 'index')}.html`;
    return indexPages;
}, {});
const hostname = process.env.HOST || ip.getLocalIP4({
    excludes: [
        'VMware Network Adapter',
        'Pseudo-Interface',
        '本地连接'
    ]
});
const port = process.env.PORT || 9000;
const baseURL = `http://${hostname}:${port}`;
module.exports = {
    entries,
    chunkSuffix: entries.join('~'),
    common: {
        checknum,
        sentryErrTrace
    },
    dev: {
        useMock,
        index: indexPages,
        template: templates,
        baseURL,
        // Paths
        assetsRoot: path.join(DIST_PREFIX, '.tmp-dev'),
        assetsSubDirectory: BUILD_ASSETS_SUB_DIRECTORY,
        assetsPublicPath: `${baseURL}/web_apps/diagonal-demo7/`,
        contentBase: [...ssoproxy.mockDataConf, DIST_PREFIX],
        before(app, server, compiler){
            const middleware = ['inject-token'];
            if (useMock) {
                middleware.unshift('mock', 'parse-body');
            }
            ssoproxy.beforeBuilder(middleware).bind(this)(app, server, compiler);
        },
        proxyTable: ssoproxy.contextTable({
            config: {
                target: ssoproxy.targetUrl,
                onProxyReq: ssoproxy.proxy.onProxyReq,
                onProxyRes: ssoproxy.proxy.onProxyRes,
                onError: ssoproxy.proxy.onError,
                secure: false,
                pathRewrite(path){
                    return `${BUILD_ASSETS_PUBLIC_ROOT}${path}`;
                }
            },
            httpMore: ['/dist/']
        }),
        after: ssoproxy.after,
        // Various Dev Server settings
        host: hostname,
        port,
        autoOpenBrowser: true,
        errorOverlay: true,
        useLocalIp: true,
        notifyOnErrors: true,
        /**
         * Source Maps
         * https://webpack.js.org/configuration/devtool/#development
         */
        devtool: '#source-map',
        /*
          If you have problems debugging vue-files in devtools,
          set this to false - it *may* help
          https://vue-loader.vuejs.org/en/options.html#cachebusting
         */
        cacheBusting: true,
        /*
          CSS Sourcemaps off by default because relative paths are "buggy"
          with this option, according to the CSS-Loader README
          (https://github.com/webpack/css-loader#sourcemaps)
          In our experience, they generally work as expected,
          just be aware of this issue when enabling this option.
         */
        cssSourceMap: true
    },
    build: {
        // Template for index.html, relative to ${build.assetsRoot}
        index: indexPages,
        template: templates,
        baseURL: BUILD_ASSETS_PUBLIC_ROOT,
        // Paths
        assetsRoot: DIST_PREFIX,
        assetsSubDirectory: BUILD_ASSETS_SUB_DIRECTORY,
        assetsPublicPath: '',
        /*
          Run the build command with an extra argument to
          View the bundle analyzer report after build finishes:
          `npm run build --report`
          Set to `true` or `false` to always turn it on or off
         */
        bundleAnalyzerReport: true,
        // https://webpack.js.org/configuration/devtool/#production
        devtool: sentryErrTrace ? '#source-map' : 'none',
        /*
          ESlint 失败即构建失败。
         */
        failOnEslintErr: false,
        /**
         * Source Maps
         */
        productionSourceMap: true,
        /*
          Gzip off by default as many popular static hosts such as
          Surge or Netlify already gzip all static assets for you.
          Before setting to `true`, make sure to:
          npm install --save-dev compression-webpack-plugin
         */
        productionGzip: false,
        productionGzipExtensions: ['js', 'css']
    }
};
