const Sequelize = require('sequelize');

module.exports = {
  up(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.addColumn('CampaignContact', 'invitationCode', {
      type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
    });
    return queryInterface.removeColumn('CampaignContact', 'uuid');
  },

  down(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.removeColumn('CampaignContact', 'invitationCode');
    return queryInterface.addColumn('CampaignContact', 'uuid', {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    });
  }
};
