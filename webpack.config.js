const path = require('path')

module.exports = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: {
        'unpacked/content-script': './src/content/index.js',
        'unpacked/background': './src/background/main.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    }
}
