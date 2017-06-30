const Sequelize = require('sequelize');

module.exports = {
  up(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.sequelize.query(
      "UPDATE `CampaignContact` JOIN `Campaign` on `CampaignContact`.`campaignId` = `Campaign`.`campaignId` SET `CampaignContact`.`campaignId` = `Campaign`.`id`"
    )
    .then( () => {
      return queryInterface.changeColumn('CampaignContact', 'campaignId', {
        type:Sequelize.BIGINT(20),
      })
    })
  },

  down(db) {
    const queryInterface = db.getQueryInterface();
    
    return queryInterface.changeColumn('CampaignContact', 'campaignId', {
      type:Sequelize.STRING(30),
    })
    .then( () => {
      return queryInterface.sequelize.query(
        "UPDATE `CampaignContact` JOIN `Campaign` on `CampaignContact`.`campaignId` = `Campaign`.`id` SET `CampaignContact`.`campaignId` = `Campaign`.`campaignId`"
      )
    });
  }
};
