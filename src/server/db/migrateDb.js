const Umzug = require('umzug');
const Promise = require('bluebird');

/**
 * Executed db-migrations to keep the database up to data
 * - migration info is kept in SequelizeMeta table
 * - migration info is stored in src/server/db/migrations folder
 *
 * @param db
 * @return {Promise.<db>}
 */
module.exports = function(db) {
  return new Umzug({
    storage: 'sequelize',
    storageOptions: {
      sequelize: db.sequelize
    },
    logging: (migration) => {
      console.log(migration);
    },
    migrations: {
      params: [db.sequelize.getQueryInterface(), db.Sequelize],
      path: 'src/server/db/migrations'
    }
  })
  .up()
  .then(function() {
    return Promise.resolve(db);
  })
  .catch(console.log);
};
