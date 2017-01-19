"use strict";

module.exports = function(sequelizeInstance, DataTypes) {
  return sequelizeInstance.define('Campaign', {
    campaignId: {
      type: DataTypes.STRING(30),
      primaryKey: true,
      allowNull: false
    },
    description: {
      allowNull: true,
      type: DataTypes.STRING(50),
    },
    startsOn: {
      allowNull: true,
      type: DataTypes.DATE()
    },
    endsOn: {
      type: DataTypes.DATE(),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    campaignType: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    owner: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    companyId: {
      type: DataTypes.STRING(30),
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
