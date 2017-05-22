const Sequelize = require('sequelize');

module.exports = {
  up(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.changeColumn('Campaign', 'companyId', {
        type: Sequelize.BIGINT(20),
        allowNull: false
    });
  },

  down(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.changeColumn('Campaign', 'companyId', {
        type:Sequelize.STRING(30),
        allowNull: true,
    });
  }
};
