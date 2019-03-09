const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require('webpack');

const htmlPlugin = new HtmlWebPackPlugin({
    template: "./src/index.html",
    filename: "./index.html"
});

module.exports = {
    mode: 'development',
    entry: './src/index.tsx',
    devtool: 'source-map',
    devServer: {
        contentBase: './dist'
    },
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    module: {
        rules: [
            {
                test: /\.(j|t)sx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        babelrc: false,
                        presets: [
                            [
                                '@babel/preset-env',
                                { targets: { browsers: 'last 2 versions' } }, // or whatever your project requires
                            ],
                            '@babel/preset-typescript',
                            '@babel/preset-react',
                        ],
                        plugins: [
                            // plugin-proposal-decorators is only needed if you're using experimental decorators in TypeScript
                            ['@babel/plugin-proposal-decorators', { legacy: true }],
                            ['@babel/plugin-proposal-class-properties', { loose: true }],
                            'react-hot-loader/babel',
                        ],
                    },
                },
            },
            {
                test: /\.(le|c)ss$/,
                use: ['style-loader', 'css-loader', 'less-loader']
            }
        ]
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
        htmlPlugin
    ]
};