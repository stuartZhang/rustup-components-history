const fs = require('fs');
const path = require('path');
const BLACKLIST = [
    'chromedriver',
    'co',
    /^cross-(env|spawn)$/,
    /^element-theme(-.+)?$/,
    /^karma(-.+)?$/,
    'mocha',
    'nightwatch',
    /^phantomjs(-.+)?$/,
    /^selenium(-.+)?$/,
    /^sinon(-.+)?$/
];

new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname, '../package.json'), (err, content) => {
        if (err) {
            reject(err);
        } else {
            resolve(JSON.parse(content));
        }
    });
}).then(pkg => {
    delete pkg['iset-env'];
    pkg.scripts = {
        build: pkg.scripts.build.replace(/^iset-env\s+_\d+_\s+/g, '')
    };
    pkg.devDependencies = Object.keys(pkg.devDependencies).filter(depName => !BLACKLIST.some(pattern => {
        if (pattern instanceof RegExp) {
            return pattern.test(depName);
        }
        return pattern === depName;
    })).reduce((devDependencies, depName) => {
        devDependencies[depName] = pkg.devDependencies[depName];
        return devDependencies;
    }, {});
    return pkg;
}).then(pkg => new Promise((resolve, reject) => {
    fs.writeFile(path.resolve(__dirname, '../package_build.json'), `${JSON.stringify(pkg, null, 4)}\n`, err => {
        if (err) {
            reject(err);
        } else {
            resolve();
        }
    });
})).then(() => {
    console.log('package_build.json 被修改。'); // eslint-disable-line no-console
});
