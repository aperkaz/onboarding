const Sequelize = require('sequelize');

module.exports.up =  function(db)
{
    return db.queryInterface.addColumn('Campaign', 'invitationCode', {
        type: Sequelize.UUID,
        allowNull: true
    });
}

module.exports.down = function(db)
{
    return db.queryInterface.removeColumn('Campaign', 'invitationCode');
}
