const webpack = require('webpack');

module.exports = {
  entry: {
    main: './src/client/index',
    funnelChart: './src/sharedComponents/funnelChart/component',
    recentCampaigns: './src/sharedComponents/recentCampaigns/component'
  },

  output: {
    library: '[name]',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    sourceMapFilename: '[name].map'
  },

  // exclude empty dependencies, require for Joi
  node: {
    net: 'empty',
    tls: 'empty',
    dns: 'empty'
  },

  externals: {
    // require("jquery") is external and available
    //  on the global var jQuery
    "jquery": "jQuery"
  },

  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      jquery:"jquery"
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "funnelChart",
      filename: "components/funnelChart.js",
      chunks: [
         "funnelChart"
      ],
      minChunks: function (module) {
        return module.context && module.context.indexOf("node_modules") !== -1;
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "recentCampaigns",
      filename: "components/recentCampaigns.js",
      chunks: [
         "recentCampaigns"
      ],
      minChunks: function (module) {
        return module.context && module.context.indexOf("node_modules") !== -1;
      }
    })
  ],

  module: {
    rules: [
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.less$/,
        loader: 'style-loader!css-loader!less-loader'
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'url-loader?limit=8192'
      },
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          compact: false,
          babelrc: false,
          presets: [
            ['env', { 'targets': { 'node': 8, 'uglify': true }, 'modules': false }],
            'stage-0',
            'react'
          ],
          plugins: ['lodash', 'transform-decorators-legacy']
        }
      }
    ]
  }
};
