const Sequelize = require('sequelize');

module.exports = {
  up(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.renameColumn('Campaign', 'name', 'campaignId');
  },

  down(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.renameColumn('Campaign', 'campaignId', 'name');
  }
};