const path = require('path');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { DefinePlugin } = require('webpack');

module.exports = {
    mode: 'development',
    entry: './src/index.ts',
    devtool: 'source-map',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [{
            test: /\.js$/,
            enforce: 'pre',
            use: ['source-map-loader'],
        },{
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader'
            ]
        }, {
            test: /\.scss$/,
            use: [
                "style-loader",
                "css-loader", 
                "sass-loader" 
            ]
        }, {
            test: /\.(png|svg|jpg|gif)$/,
            use: [
                'file-loader'
            ]
        }, {
            test: /\.(woff|woff2|eot|ttf|otf)$/,
            use: [
                'file-loader'
            ]
        }, {
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
            resolve: {
                extensions: ['.ts', '.tsx', '.wasm', '.mjs', '.js', '.json']
            },
            options: {
                // disable type checker - we will use it in fork plugin
                transpileOnly: true
              }
        }]
    },
    watchOptions: {
        poll: true
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            Popper: ['popper.js', 'default']
        }),
        new ForkTsCheckerWebpackPlugin(),
        new DefinePlugin({
          'process.env.COUCH_DB_ADDRESS': JSON.stringify('http://couchdb.home.agrzes.pl:5984')
        })
    ],
    resolve: {
        symlinks: false,
        alias: {
            'vue$': path.resolve('../node_modules/vue/dist/vue.esm-browser.js'),
            'vuex': path.resolve('../node_modules/vuex/dist/vuex.esm-browser.js'),
            'vue-router': path.resolve('../node_modules/vue-router/dist/vue-router.esm-browser.js'),
            'jquery': path.resolve('node_modules/jquery/dist/jquery.min.js'),
            'bootstrap': path.resolve('node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'),
            'lodash': path.resolve('node_modules/lodash'),
            '@agrzes/yellow-2020-web-vue-books': path.resolve('../books'),
            '@agrzes/yellow-2020-common-books': path.resolve('../../../common/books'),
            '@agrzes/yellow-2020-common-indexer': path.resolve('../../../common/indexer'),
            '@agrzes/yellow-2020-web-vue-components': path.resolve('../components'),
            '@agrzes/yellow-2020-web-vue-router': path.resolve('../router'),
            '@agrzes/yellow-2020-web-vue-state': path.resolve('../state'),
        }
    }
}
