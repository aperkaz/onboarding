const Sequelize = require('sequelize');

module.exports = function(sequelize) {
  return sequelize.define('Campaign', {
    id: {
      type: Sequelize.BIGINT(20),
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
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
    campaignId: {
      type: Sequelize.STRING(30),
      allowNull: false
    },
    /** Path to email template on blob storage */
    emailTemplate: {
      type: Sequelize.STRING,
      allowNull: true
    }
  }, {
    getterMethods: {
      _objectLabel: function() {
        return this.id + this.description ? ' (' + this.description + ')' : ''
      }
    },
    classMethods: {
      associate: function(models) {
        Campaign.hasMany(models.CampaignContact);
      }
    },
    timestamps: false,
    freezeTableName: true,
    tableName: 'Campaign',
  });
};
