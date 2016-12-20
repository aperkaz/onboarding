"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const webpack = require('webpack');
const exphbs = require('express-handlebars');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const configureDatabase = require('./db');
const registerRestRoutes = require('./routes');
const path = require('path');

const app = express();
const port = process.env.PORT ? process.env.PORT : 3001;
const host = process.env.HOST ? process.env.HOST : 'localhost';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// register rest routes implemented using epilogues+sequelize only after connecting to db
configureDatabase().then((db) => {
  registerRestRoutes(app, db);
}).catch((err) => {
  console.log(err);
});

const initTemplateEngine = (expressInstance) => {
  expressInstance.engine('handlebars', exphbs());
  expressInstance.set('view engine', 'handlebars');
  expressInstance.set('views', path.resolve(__dirname + '/templates'));
};

if (process.env.NODE_ENV === 'production') {
  // in case of production env - we push out only compiled bundle with externalized react, react-dom, etc
  app.use('/static', express.static(__dirname + '/../../../build'));
} else {
  initTemplateEngine(app);
  app.use(express.static(__dirname + '/public'));
  require('../../webpack.dev.config.js').forEach(config => {
    let compiler = webpack(config);
    app.use(webpackDevMiddleware(compiler, {
      publicPath: config.output.publicPath,
      noInfo: true
    }));
    app.use(webpackHotMiddleware(compiler));
  });
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
