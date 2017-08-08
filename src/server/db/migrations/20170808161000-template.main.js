'use strict'

const Sequelize = require('sequelize');
const Promise = require('bluebird');

/**
 * Applies migrations for databse tables and data.
 * If all migrations were successul, this method will never be executed again.
 * To identify which migrations have successfully been processed, a migration's filename is used.
 *
 * @param {object} data - [Sequelize]{@link https://github.com/sequelize/sequelize} instance.
 * @param {object} config - A model property for database models and everything from [config.data]{@link https://github.com/OpusCapitaBusinessNetwork/db-init} passed when running the db-initialization.
 * @returns {Promise} [Promise]{@link http://bluebirdjs.com/docs/api-reference.html}
 * @see [Applying data migrations]{@link https://github.com/OpusCapitaBusinessNetwork/db-init#applying-data-migrations}
 */
module.exports.up = function(db, config)
{
    return db.queryInterface.createTable('Template', {
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
        files: {
            type: Sequelize.TEXT('medium'),
            allowNull: true
        }
    }, {
        freezeTableName: true
    });
}


/**
 * Reverts all migrations for databse tables and data.
 * If the migration process throws an error, this method is called in order to revert all changes made by the up() method.
 *
 * @param {object} data - [Sequelize]{@link https://github.com/sequelize/sequelize} instance.
 * @param {object} config - A model property for database models and everything from [config.data]{@link https://github.com/OpusCapitaBusinessNetwork/db-init} passed when running the db-initialization.
 * @returns {Promise} [Promise]{@link http://bluebirdjs.com/docs/api-reference.html}
 * @see [Applying data migrations]{@link https://github.com/OpusCapitaBusinessNetwork/db-init#applying-data-migrations}
 */
module.exports.down = function(db, config)
{
    return db.queryInterface.dropTable('Template');
}
