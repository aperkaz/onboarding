const Sequelize = require('sequelize');

module.exports = {
  up(db) {
    const queryInterface = db.getQueryInterface();

    return Promise.all([
      queryInterface.removeColumn('Campaign', 'owner'),
      queryInterface.addColumn('Campaign', 'customerId', {
        type: Sequelize.STRING(30),
        allowNull: true
      })
    ]);
  },

  down(db) {
    const queryInterface = db.getQueryInterface();

    return Promise.all([
      queryInterface.addColumn('Campaign', 'owner', {
        type: Sequelize.STRING(30),
        allowNull: true
      }),
      queryInterface.removeColumn('Campaign', 'customerId')
    ]);
  }
};
