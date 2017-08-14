const Sequelize = require('sequelize');

module.exports.up =  function(db)
{
    const f1 = db.queryInterface.changeColumn('CampaignContact', 'companyName', {
        type: Sequelize.STRING(100),
        allowNull: true
    });

    const f2 = db.queryInterface.changeColumn('CampaignContact', 'address', {
        type: Sequelize.STRING(100),
        allowNull: true
    });

    return Promise.all([ f1, f2 ]);
}

module.exports.down = function(db)
{
    const f1 = db.queryInterface.changeColumn('CampaignContact', 'companyName', {
        type: Sequelize.STRING(30),
        allowNull: true
    });

    const f2 = db.queryInterface.changeColumn('CampaignContact', 'address', {
        type: Sequelize.STRING(30),
        allowNull: true
    });

    return Promise.all([ f1, f2 ]);
}
