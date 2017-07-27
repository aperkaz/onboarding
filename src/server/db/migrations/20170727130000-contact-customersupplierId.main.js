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
    const customerSupplierId = db.queryInterface.addColumn('CampaignContact', 'customerSupplierId', {
        type: Sequelize.STRING(150),
        allowNull: true
    });

    const zipCode = db.queryInterface.addColumn('CampaignContact', 'zipCode', {
        type: Sequelize.STRING(10),
        allowNull: true
    });

    const pobox = db.queryInterface.addColumn('CampaignContact', 'pobox', {
        type: Sequelize.STRING(10),
        allowNull: true
    });

    return Promise.all([ customerSupplierId, zipCode, pobox ]);
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
    const customerSupplierId = db.queryInterface.removeColumn('CampaignContact', 'customerSupplierId');
    const zipCode = db.queryInterface.removeColumn('CampaignContact', 'zipCode');
    const pobox = db.queryInterface.removeColumn('CampaignContact', 'pobox');

    return Promise.all([ customerSupplierId, zipCode, pobox ]);
}
