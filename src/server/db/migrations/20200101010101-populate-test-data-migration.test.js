'use strict'

const Promise = require('bluebird');
const pathjs = require('path');

/**
 * Inserts test data into existing database structures.
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
    const path = pathjs.resolve(__dirname + '/../data');

    // Load data.
    const campaignsData = require(path + '/campaigns.json');
    // Get database models.
    const Campaign = db.models.Campaign;

    // -----

    // Load data.
    const campaignContactsData = require(path + '/campaignContacts.json');
    // Get database models.
    const CampaignContact = db.models.CampaignContact;

    // -----

    return Promise.all(campaignsData.map(cur => Campaign.upsert(cur)))
      .then(() => Promise.all(campaignContactsData.map(cur => CampaignContact.upsert(cur))));
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
    return Promise.all([
        db.models.CampaignContact.destroy({ truncate: true }),
    ]).then(() => Promise.all([
        db.models.Campaign.destroy({ truncate: true }),
    ]));
}
