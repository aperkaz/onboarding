const Sequelize = require('sequelize');

module.exports = {
  up(db) {

    const one = db.queryInterface.addColumn('Campaign', 'languageId', {
        type:Sequelize.STRING(3),
        allowNull: true
    });
    const two = db.queryInterface.addColumn('Campaign', 'countryId', {
        type:Sequelize.STRING(2),
        allowNull: true
    });

    return Promise.all([ one, two ]);
  },

  down(db) {

    const one = db.queryInterface.removeColumn('Campaign', 'languageId');
    const two = db.queryInterface.removeColumn('Campaign', 'countryId');

    return Promise.all([ one, two ]);
  }
};
