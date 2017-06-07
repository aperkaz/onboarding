const Sequelize = require('sequelize');

module.exports = {
  up(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.removeColumn('Campaign', 'companyId');
  },

  down(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.addColumn('Campaign', 'companyId', {
        type:Sequelize.STRING(30),
        allowNull: true,
    });
  }
};
