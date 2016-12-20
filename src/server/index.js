"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const webpack = require('webpack');
const configureDatabase = require('./db');
const registerRestRoutes = require('./routes');
const path = require('path');

const app = express();
const mode = process.env.NODE_ENV || 'development';
const port = process.env.PORT ? process.env.PORT : 3001;
const host = process.env.HOST ? process.env.HOST : 'localhost';

const webpackConfig = require('../../webpack.config.js');
const compiler = webpack([webpackConfig]);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// register rest routes implemented using epilogues+sequelize only after connecting to db
configureDatabase().then((db) => {
  registerRestRoutes(app, db);
}).catch((err) => {
  console.log(err);
});

console.log(`Starting application in '${mode}' mode...`);
if (mode === 'production' || mode === 'staging') {
  // in case of production env - we build bundle and add it a static resource
  compiler.run(function(err, stats) {
    console.log(stats.toJson("errors-only"));
    app.use('/static', express.static(__dirname + '/../../build'));
  });
} else { //the other means env = 'development'
  const exphbs = require('express-handlebars');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');

  app.engine('handlebars', exphbs());
  app.set('view engine', 'handlebars');
  app.set('views', path.resolve(__dirname + '/templates'));
  app.use(express.static(__dirname + '/public'));
  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    noInfo: true
  }));
  app.use(webpackHotMiddleware(compiler));
  app.get(
    [
      '/',
      '/create',
      '/edit/:campaignId',
      '/edit/:campaignId/contacts',
    ],
    (req, res) => {
      res.render('index', {
        campaignServiceUrl: req.protocol + '://' + req.get('Host')
      });
    });
}

// launch application
app.listen(port, host, (err) => {
  if (err) {
    console.log(err);
  }
  console.log(`The server is running at http://${host}:${port}/`);
});
