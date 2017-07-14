const Sequelize = require('sequelize');

module.exports.up =  function(db)
{
    const one = db.queryInterface.changeColumn('Campaign', 'emailTemplate', {
        type: Sequelize.STRING(150),
        allowNull: true
    });

    const two = db.queryInterface.addColumn('Campaign', 'landingpageTemplate', {
        type: Sequelize.STRING(150),
        allowNull: true
    });

    return Promise.all([ one, two ]);
}

module.exports.down = function(db)
{
    const one = db.queryInterface.changeColumn('Campaign', 'campaignId', {
        type: Sequelize.STRING,
        allowNull: true
    });

    const two = db.queryInterface.removeColumn('Campaign', 'landingpageTemplate');

    return Promise.all([ one, two ]);
}
