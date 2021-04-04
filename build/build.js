'use strict';
require('./check-versions')();

process.env.NODE_ENV = 'production';

const co = require('co');
const del = require('del');
const util = require('util');
const chalk = require('chalk');
const webpack = util.promisify(require('webpack'));
const {done, error, info, logWithSpinner, stopSpinner} = require('@vue/cli-shared-utils');
//
const config = require('../config');
const webpackConfig = require('./webpack.prod.conf');
const {extractBuildArg, printStats} = require('./utils');

(extractBuildArg('--modern', 'MODERN_BUILD', 'boolean') ?
    co(function *(){
        logWithSpinner('Building legacy bundle for production...');
        process.env.MODERN_BUILD_MODE = 'legacy';
        let stats = yield webpack(yield webpackConfig(process.env, process.argv));
        printStats(stats);
        //
        logWithSpinner('Building modern bundle for production...');
        process.env.MODERN_BUILD_MODE = 'modern'; // eslint-disable-line require-atomic-updates
        stats = yield webpack(webpackConfig(process.env, process.argv));
        printStats(stats);
    }) :
    co(function *(){
        logWithSpinner('Building bundle for production...');
        const stats = yield webpack(yield webpackConfig(process.env, process.argv));
        printStats(stats);
    })
).then(() => del([config.dev.assetsRoot], {
    force: true,
    dryRun: false,
    dot: true,
    ignore: []
})).then(() => {
    stopSpinner(false);
    info(chalk.cyan('  Build complete.\n'));
    done(chalk.yellow(
        '  Tip: built files are meant to be served over an HTTP server.\n' +
        '  Opening index.html over file:// won\'t work.\n'
    ));
}, err => {
    stopSpinner(false);
    error(err);
});
