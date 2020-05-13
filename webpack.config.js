const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const tsImportPluginFactory = require('ts-import-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const htmlPlugin = new HtmlWebPackPlugin({
    template: "./src/index.html",
    filename: "./index.html",
    favicon: './favicon.ico'
});

module.exports = function (env) {
    return {
        mode: env.production ? "production" : "development",
        entry: './src/index.tsx',
        devtool: env.production ? false : 'source-map',
        devServer: {
            contentBase: './dist'
        },
        optimization: {
            usedExports: true
        },
        resolve: {
            // Add '.ts' and '.tsx' as resolvable extensions.
            extensions: [".ts", ".tsx", ".js", ".json"]
        },
        module: {
            rules: [
                {
                    test: /\.svg$/,
                    use: ['@svgr/webpack'],
                },
                {
                    test: /\.(png|jpg|cur)/,
                    use: ['file-loader']
                },
                {
                    test: /\.(j|t)sx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            experimentalWatchApi: true,
                            getCustomTransformers: () => ({
                                before: [tsImportPluginFactory({
                                    libraryName: 'antd',
                                    libraryDirectory: 'lib',
                                    style: true
                                })]
                            }),
                            compilerOptions: {
                                module: 'es2015'
                            }
                        }
                    }
                },
                {
                    test: /\.(le|c)ss$/,
                    use: ['style-loader', 'css-loader', {
                        loader: 'less-loader',
                        options: {
                            javascriptEnabled: true
                        }
                    }]
                }
            ]
        },
        output: {
            filename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist')
        },
        plugins: [
            htmlPlugin,
            new ForkTsCheckerWebpackPlugin(),
            ...(process.env.BUNDLE_ANALYZER ? [new BundleAnalyzerPlugin()] : [])
        ]
    }
}