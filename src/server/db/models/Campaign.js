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
    companyId: {
      type: Sequelize.BIGINT(20),
      allowNull: false
    },
    campaignId: {
      type: Sequelize.STRING(30),
      allowNull: false
    }
  }, {
    getterMethods: {
      _objectLabel: function() {
        return this.id + this.description ? ' (' + this.description + ')' : ''
      }
    },
    timestamps: false,
    tableName: 'Campaign',
  });
};
