const Sequelize = require('sequelize');

module.exports = {
  up(db) {
    const queryInterface = db.getQueryInterface();

    return queryInterface.sequelize.query('ALTER TABLE `Campaign` CHANGE COLUMN `campaignId` `campaignId` BIGINT(20) NOT NULL, DROP PRIMARY KEY;')
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

    return queryInterface.removeIndex('Person', ['name', 'customerId'])
    .then( () => {
        return queryInterface.changeColumn('Campaign', 'name', {
            type:Sequelize.BIGINT(20),
            allowNull: false,
        });
    })
    .then( () => {
        return queryInterface.renameColumn('Campaign', 'name', 'campaignId');
    })
    .then( () => {
        return queryInterface.removeColumn('Campaign', 'id')
    })
    .then( () => {
        return queryInterface.sequelize.query('ALTER TABLE `Campaign` CHANGE COLUMN `campaignId` `campaignId` BIGINT(20) NOT NULL AUTO_INCREMENT, ADD PRIMARY KEY (`campaignId`);')    
    })
  }
};
