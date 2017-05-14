const Sequelize = require('sequelize');

module.exports = {
  up(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.addColumn('CampaignContact', 'userId', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.removeColumn('CampaignContact', 'userId');
  }
};
