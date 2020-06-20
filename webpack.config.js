const path = require('path')

module.exports = {
    mode: 'development',
    // devtool: 'cheap-module-source-map',
    devtool: 'eval-source-map', // remove eval permissions from manifesto when production!
    entry: {
        'unpacked/content-script': './src/content/index.js',
        'unpacked/background': './src/background/main.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.(scss|css)$/,
                use: [
                    'style-loader', // creates style nodes from JS strings
                    'css-loader', // translates CSS into CommonJS
                    'sass-loader', // compiles Sass to CSS, using Node Sass by default
                ],
            }
        ]
    },
    // resolve: {
    //     alias: {
    //         'react': 'preact/compat',
    //         'react-dom/test-utils': 'preact/test-utils',
    //         'react-dom': 'preact/compat', // Must be below test-utils
    //     }
    // }
}
