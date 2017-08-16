const Sequelize = require('sequelize');
const Promise = require('bluebird');

module.exports.init = function(db)
{
    db.define('Template', {
        id: {
            type: Sequelize.BIGINT(20),
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        customerId: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        name: {
            type: Sequelize.STRING(128),
            allowNull: false
        },
        content: {
            type: Sequelize.TEXT('medium'),
            allowNull: false
        },
        languageId: {
            type: Sequelize.STRING(3),
            allowNull: true
        },
        countryId: {
            type: Sequelize.STRING(2),
            allowNull: true
        },
        type: {
            type: Sequelize.STRING(15),
            allowNull: false
        }
    }, {
        freezeTableName: true
    });

    return Promise.resolve();
}
