const path = require('path');

module.exports = {
  entry: './src/client/index',
  output: {
    path: '/',
    filename: 'bundle.js',
    publicPath: '/static/',
    library: 'onboarding',
    libraryTarget: 'umd'
  },
  resolve: {
    alias: {
      jszip: 'xlsx/jszip.js'
    },
  },
  watch: true,
  externals: {
    "./cptable": "var cptable"
  },
  module: {
    noParse: [/jszip.js$/],
    rules: [
      {
        test: /.js$/,
        loader: 'babel-loader',
        include: [
          path.join(__dirname, '../../src')
        ],
        query: {
          presets: ['es2015', 'react', 'stage-0'],
          plugins: ['transform-object-assign', 'transform-decorators-legacy']
        }
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg)$/,
        loader: 'url-loader?limit=30000&name=[name]-[hash].[ext]'
      },
      {
        include: /\.json$/,
        loaders: ["json-loader"]
      }
    ]
  },
}
