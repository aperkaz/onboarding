const path = require('path');
const webpack = require('webpack');
const Merge = require('webpack-merge');
const BaseConfig = require('./webpack.base.config.js');
const AssetsPlugin = require('assets-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');


module.exports = Merge(BaseConfig, {
  output: {
    path: path.resolve(__dirname, '../../build/client'),
    filename: "[name].[chunkhash].js",
    chunkFilename: '[name].[chunkhash].js',
    library: '[name]',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },

  plugins: [
    new webpack.ContextReplacementPlugin(
      new RegExp('\\' + path.sep + 'node_modules\\' + path.sep + 'moment\\' + path.sep + 'locale'),
      /en|de/
    ),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.optimize.OccurrenceOrderPlugin(true),
    /*new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      mangle: {
        screw_ie8: true,
        keep_fnames: true
      },
      compress: {
        screw_ie8: true,
	warnings: false
      },
      comments: true
  }),*/ // Destroys the application with "n is not a function"
    new AssetsPlugin({ filename: 'assets.json', path: path.resolve(__dirname, '../../build/client') }),
    new WebpackMd5Hash()
  ],
});
