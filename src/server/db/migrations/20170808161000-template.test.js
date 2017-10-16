'use strict'

const Sequelize = require('sequelize');
const Promise = require('bluebird');
const fs = require('fs');

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
    const items = [{
        id : 1,
        customerId : null,
        name : 'default',
        languageId : 'en',
        type : 'landingpage',
        content : fs.readFileSync(__dirname + '/../data/20170808161000.landingpage.en.html', 'utf-8')
    }, {
        id : 2,
        customerId : null,
        name : 'standard',
        languageId : 'de',
        type : 'landingpage',
        content : fs.readFileSync(__dirname + '/../data/20170808161000.landingpage.de.html', 'utf-8')
    }, {
        id : 3,
        customerId : null,
        name : 'default',
        languageId : 'en',
        type : 'email',
        content : fs.readFileSync(__dirname + '/../data/20170808161000.email.en.html', 'utf-8')
    }];

    return db.queryInterface.bulkInsert('Template', items);
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
    const items = [{ id : 1 }, { id : 2 }];
    return db.queryInterface.bulkDelete('Template', items);
}
