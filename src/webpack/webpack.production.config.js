const path = require('path');
const webpack = require('webpack');
const Config = require('webpack-config').default;
const AssetsPlugin = require('assets-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
// var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = new Config().extend('./src/webpack/webpack.base.config.js').merge({
  output: {
    path: path.resolve(__dirname, '../../build/client'),
    filename: "bundle.[chunkhash].js",
    chunkFilename: '[id].chunk.[chunkhash].js'
  },

  plugins: [
    new webpack.ContextReplacementPlugin(
      new RegExp('\\' + path.sep + 'node_modules\\' + path.sep + 'moment\\' + path.sep + 'locale'),
      /en|de/
    ),
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
    new AssetsPlugin({ filename: 'assets.json', path: path.resolve(__dirname, '../../build/client') }),
    new WebpackMd5Hash(),
    new LodashModuleReplacementPlugin()
    // new BundleAnalyzerPlugin()
  ],
});
