'use strict';
const merge = require('webpack-merge');
const prodEnv = require('./prod.env');
const {dev: {assetsSubDirectory, baseURL}} = require('./index');

module.exports = merge(prodEnv, {
    STATIC: JSON.stringify(assetsSubDirectory),
    baseURL: `"${baseURL}"`
});
