"use strict";

const express = require('express');
const bodyParser = require('body-parser');
var webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const db = require('./db');
const registerRestRoutes = require('./routes');

const app = express();
const port = process.env.PORT ? process.env.PORT : 3001;
const host = process.env.HOST ? process.env.HOST : 'localhost';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//register rest routes implemented using epilogues+sequelize
registerRestRoutes(app, db);

if(process.env.NODE_ENV == 'production') {
    //in case of production env - we push out only compiled bundle with externalized react, react-dom, etc
    app.use('/static', express.static(__dirname + '/../../../build'));
} else {
    app.use(express.static(__dirname + '/public'));
    require('../../webpack.dev.config.js').forEach(config => {
        var compiler = webpack(config);
        app.use(webpackDevMiddleware(compiler, {
            publicPath: config.output.publicPath,
            noInfo: true
        }));
        app.use(webpackHotMiddleware(compiler));

    });
    app.get('*', (req, res) => {
        res.sendFile(__dirname + '/public/index.html');
    });
}

// launch application
app.listen(port, host, (err) => {
    if (err) {
        console.log(err);
    }
    console.log(`The server is running at http://${host}:${port}/`);
});