const epilogue = require('epilogue');
const campaignRoutes = require('./campaign');
const campaignContactRoutes = require('./campaignContact');
const campaignContactImport = require('./campaignContactImport');
const workflow = require('../workflow/workflow');

module.exports = function(app, db) {
  epilogue.initialize({
    app: app,
    sequelize: db.sequelize,
    base: '/api'
  });

  campaignContactImport(app, db);
  campaignRoutes(epilogue, db);
  campaignContactRoutes(epilogue, db);
  workflow(app, db);
};
