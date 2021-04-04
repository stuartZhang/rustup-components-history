module.exports = function(api){
    api.cache(true);
    const corejsVersion = 3;
    /**
     * @type {import('@babel/core').TransformOptions}
     */
    const config = {
        sourceType: 'unambiguous',
        presets: [
            ['@babel/preset-env', {
                corejs: corejsVersion,
                useBuiltIns: 'usage',
                modules: false
            }],
            ['@babel/preset-typescript', {
                allowDeclareFields: true
            }]
        ],
        plugins: [
            'macros',
            '@vue/babel-plugin-transform-vue-jsx',
            '@babel/plugin-syntax-jsx',
            ['@babel/plugin-transform-runtime', {
                corejs: corejsVersion,
                helpers: true,
                regenerator: true,
                useESModules: false
            }],
            '@babel/plugin-syntax-import-meta',
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-json-strings',
            ['@babel/plugin-proposal-decorators', {
                legacy: true
            }],
            '@babel/plugin-proposal-function-sent',
            '@babel/plugin-proposal-export-namespace-from',
            '@babel/plugin-proposal-numeric-separator',
            '@babel/plugin-proposal-throw-expressions'
        ]
    };
    return config;
};
