"use strict";
module.exports = function(sequelizeInstance, DataTypes) {
  /**
     * Data model representing Campaign information.
     * @class Campaign
     */
  return sequelizeInstance.define('Campaign', 
  {
    /** ISO 3166-1 alpha2 campaign code. */
    campaignId: {
      type: DataTypes.STRING(30),
      primaryKey: true,
      allowNull: false
    },
    /** Campaign description. */
    description: {
      allowNull: true,
      type: DataTypes.STRING(50),
    },
    /** Camapign Start Date. */
    startsOn: {
      allowNull: true,
      type: DataTypes.DATE()
    },
    /** Campaign end date. */
    endsOn: {
      type: DataTypes.DATE(),
      allowNull: true
    },
    /** Current status of Campaign. */
    status: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    /** Type of Camapign. */
    campaignType: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    /** Owner of Campaign. */
    owner: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    /** ISO 3166-1 company code. */
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
