const Sequelize = require('sequelize');

module.exports.up =  function(db)
{
    return db.queryInterface.changeColumn('CampaignContact', 'companyName', {
        type: Sequelize.STRING(30),
        allowNull: true
    });
}

module.exports.down = function(db)
{
    return db.queryInterface.changeColumn('CampaignContact', 'companyName', {
        type: Sequelize.STRING(30),
        allowNull: false
    });
}
