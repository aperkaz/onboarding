const webpack = require('webpack');
const Merge = require('webpack-merge');
const BaseConfig = require('./webpack.base.config.js');

module.exports = Merge(BaseConfig, {
  output: {
    path: '/', // with 'webpack-dev-middleware' this value is ignored.
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  devtool: 'eval-source-map'
});
