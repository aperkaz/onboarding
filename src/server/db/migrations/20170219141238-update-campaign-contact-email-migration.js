'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.changeColumn('CampaignContact', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'CampaignCampaignContactUK',
      validate: {
        isEmail: true
      }
    });
  },

  down: function(queryInterface, Sequelize) {
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
