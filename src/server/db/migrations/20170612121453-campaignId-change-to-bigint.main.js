const Sequelize = require('sequelize');

module.exports = {
  up(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.changeColumn('CampaignContact', 'campaignId', {
        type:Sequelize.BIGINT(20),
    });
  },

  down(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.changeColumn('CampaignContact', 'campaignId', {
        type:Sequelize.STRING(30),
    });
  }
};
