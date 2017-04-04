const Sequelize = require('sequelize');

module.exports = {
  up: function (db) {
    const queryInterface = db.getQueryInterface();
    
    return [
      queryInterface.addColumn('CampaignContact', 'city', {
        type: Sequelize.STRING(30),
        allowNull: true
      }),
      queryInterface.addColumn('CampaignContact', 'country', {
        type: Sequelize.STRING(30),
        allowNull: true
      }),
      queryInterface.addColumn('CampaignContact', 'commercialRegisterNo', {
        type: Sequelize.STRING(30),
        allowNull: true
      }),
      queryInterface.addColumn('CampaignContact', 'taxIdentNo', {
        type: Sequelize.STRING(30),
        allowNull: true
      }),
      queryInterface.addColumn('CampaignContact', 'vatIdentNo', {
        type: Sequelize.STRING(30),
        allowNull: true
      }),
      queryInterface.addColumn('CampaignContact', 'lastStatusChange', {
        type: Sequelize.DATE()
      })
    ];
  },

  down: function (db) {
    const queryInterface = db.getQueryInterface();
    
    return [
      queryInterface.removeColumn('CampaignContact', 'city'),
      queryInterface.removeColumn('CampaignContact', 'country'),
      queryInterface.removeColumn('CampaignContact', 'commercialRegisterNo'),
      queryInterface.removeColumn('CampaignContact', 'taxIdentNo'),
      queryInterface.removeColumn('CampaignContact', 'vatIdentNo'),
      queryInterface.removeColumn('CampaignContact', 'lastStatusChange')
    ];
  }
};
