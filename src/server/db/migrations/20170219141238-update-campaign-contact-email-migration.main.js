const Sequelize = require('sequelize');

module.exports = {
  up(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.changeColumn('CampaignContact', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'CampaignCampaignContactUK',
      validate: {
        isEmail: true
      }
    });
  },

  down(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.changeColumn('CampaignContact', 'email', {
      type: Sequelize.STRING(30),
      allowNull: false,
      unique: 'CampaignCampaignContactUK',
      validate: {
        isEmail: true
      }
    });
  }
};
