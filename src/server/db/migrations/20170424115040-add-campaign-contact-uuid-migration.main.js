const Sequelize = require('sequelize');

module.exports = {
  up(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.addColumn('CampaignContact', 'uuid', {
      type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
    });
  },

  down(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.removeColumn('CampaignContact', 'uuid');
  }
};
