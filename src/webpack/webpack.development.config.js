const webpack = require('webpack');
const Config = require('webpack-config').default;

module.exports = new Config().extend('./src/webpack/webpack.base.config.js').merge({
  output: {
    path: '/', // with 'webpack-dev-middleware' this value is ignored.
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  devtool: 'eval-source-map'
});
