const path = require('path');
const webpack = require('webpack');
const Config = require('webpack-config').default;
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');

module.exports = new Config().extend('webpack.base.config.js').merge({
  output: {
    path: path.resolve(__dirname, 'src/server/static'),
    filename: "bundle.[chunkhash].js",
    chunkFilename: '[id].chunk.[chunkhash].js'
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.optimize.OccurrenceOrderPlugin(true),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false,
        drop_console: true,
        unsafe: true,
        pure_getters: true,
        dead_code: true,
        unsafe_comps: true,
        screw_ie8: true
      }
    }),
    new ExtractTextPlugin({
      filename: 'main.css'
    }),
    new AssetsPlugin({ filename: 'assets.json', path: path.resolve(__dirname, 'build/client') }),
    new ChunkManifestPlugin({
      filename: "chunk-manifest.json",
      manifestVariable: "webpackManifest"
    }),
    new WebpackMd5Hash()
  ],
});
