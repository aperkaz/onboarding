const Sequelize = require('sequelize');

module.exports = {
  up(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.removeConstraint('Campaign', 'PRIMARY')
    .then( () => {
        return queryInterface.addColumn('Campaign', 'id', {
            type: Sequelize.BIGINT(20),
            primaryKey: true,
            autoIncrement: true
        });
    })
    .then( () => {
        return queryInterface.renameColumn('Campaign', 'campaignId', 'name');
    })
    .then( () => {
        return queryInterface.changeColumn('Campaign', 'name', {
            type:Sequelize.STRING(30),
            allowNull: false,
        });
    })
    .then( () => {
        return queryInterface.addIndex('Campaign', ['name', 'customerId'], {
            indexName: 'nameAndCustomerId',
            indicesType: 'UNIQUE'
        });
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
