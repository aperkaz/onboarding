const Sequelize = require('sequelize');

module.exports = {
  up(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.addColumn('Campaign', 'emailTemplate', {
      type:Sequelize.STRING,
      allowNull: true
    });
  },

  down(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.removeColumn('Campaign', 'emailTemplate');
  }
};
