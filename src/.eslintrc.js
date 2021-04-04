'use strict';

module.exports = {
    root: true,
    globals: {
        alertAsync: false,
        confirmAsync: false,
        axios: false,
        elastic: false,
        MXCommon: false,
        process: false,
        require: false,
        $: false
    },
    extends: [
        
        'minxing/eslint-config-vue-ts.js'
    ],
    rules: {
        '@typescript-eslint/no-floating-promises': 'off'
    }
};
