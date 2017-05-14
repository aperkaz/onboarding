const Sequelize = require('sequelize');

module.exports = function(sequelize) {
  return sequelize.define('Campaign', {
    campaignId: {
      type: Sequelize.STRING(30),
      primaryKey: true,
      allowNull: false
    },
    /** Campaign description. */
    description: {
      allowNull: true,
      type: Sequelize.STRING(50),
    },
    /** Campaign Start Date. */
    startsOn: {
      allowNull: true,
      type: Sequelize.DATE()
    },
    /** Campaign end date. */
    endsOn: {
      type: Sequelize.DATE(),
      allowNull: true
    },
    /** Current status of Campaign. */
    status: {
      type: Sequelize.STRING(30),
      allowNull: false
    },
    /** Type of Campaign. */
    campaignType: {
      type: Sequelize.STRING(30),
      allowNull: false
    },
    /** Owner of the Campaign */
    customerId : {
      type : Sequelize.STRING(30),
      allowNull : true
    },
    /** ISO 3166-1 company code. */
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
