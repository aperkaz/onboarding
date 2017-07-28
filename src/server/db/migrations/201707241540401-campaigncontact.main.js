const Sequelize = require('sequelize');

module.exports.up =  function(db)
{
    return db.queryInterface.changeColumn('CampaignContact', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: 'CampaignCampaignContactUK',
      validate:
      {
        isEmail: true
      }
    });
}

module.exports.down = function(db)
{
    return db.queryInterface.changeColumn('CampaignContact', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: 'CampaignCampaignContactUK',
      validate:
      {
        isEmail: true
      }
    });
}
