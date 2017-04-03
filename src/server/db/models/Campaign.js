const Sequelize = require('sequelize');

module.exports = function(sequelize) {
  return sequelize.define('Campaign', {
    campaignId: {
      type: Sequelize.STRING(30),
      primaryKey: true,
      allowNull: false
    },
    description: {
      allowNull: true,
      type: Sequelize.STRING(50),
    },
    startsOn: {
      allowNull: true,
      type: Sequelize.DATE()
    },
    endsOn: {
      type: Sequelize.DATE(),
      allowNull: true
    },
    status: {
      type: Sequelize.STRING(30),
      allowNull: false
    },
    campaignType: {
      type: Sequelize.STRING(30),
      allowNull: false
    },
    owner: {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    companyId: {
      type: Sequelize.STRING(30),
      allowNull: true
    }
  }, {
    getterMethods: {
      _objectLabel: function() {
        return this.campaignId + this.description ? ' (' + this.description + ')' : ''
      }
    },
    classMethods: {
      associate: function(models) {
        models.Campaign.hasMany(models.CampaignContact, {
          as: 'contacts',
          foreignKey: 'campaignId',
          targetKey: 'campaignId'
        });
      }
    },
    timestamps: false,
    tableName: 'Campaign',
  });
};
