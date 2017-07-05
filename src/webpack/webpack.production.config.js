const path = require('path');
const webpack = require('webpack');
const Config = require('webpack-config').default;
const AssetsPlugin = require('assets-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
// var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = new Config().extend('./src/webpack/webpack.base.config.js').merge({
  output: {
    path: path.resolve(__dirname, '../../build/client'),
    filename: "[name].[chunkhash].js",
    chunkFilename: '[name].[chunkhash].js',
    library: '[name]',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },

  devtool: 'source-map',

  plugins: [
    new webpack.ContextReplacementPlugin(
      new RegExp('\\' + path.sep + 'node_modules\\' + path.sep + 'moment\\' + path.sep + 'locale'),
      /en|de/
    ),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.optimize.OccurrenceOrderPlugin(true),
    new webpack.optimize.UglifyJsPlugin({ sourceMap: true }),
    new AssetsPlugin({ filename: 'assets.json', path: path.resolve(__dirname, '../../build/client') }),
    new WebpackMd5Hash(),
    // new BundleAnalyzerPlugin()
  ],
});
