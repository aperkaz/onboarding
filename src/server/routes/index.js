const epilogue = require('epilogue');
const campaignRoutes = require('./campaign');
const campaignContactRoutes = require('./campaignContact');

module.exports = function(app, db) {
  epilogue.initialize({
    app: app,
    sequelize: db.sequelize,
    base: '/api'
  });

  campaignRoutes(epilogue, db);
  campaignContactRoutes(epilogue, db);
};




