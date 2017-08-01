const Sequelize = require('sequelize');
const Promise = require('bluebird');
module.exports.up = function up(db,config) {
	const queryInterface = db.getQueryInterface();
    const one = queryInterface.changeColumn('CampaignContact', 'contactFirstName', {
        type:Sequelize.STRING(30),
        allowNull: true
    });
    const two = db.queryInterface.changeColumn('CampaignContact', 'contactLastName', {
        type:Sequelize.STRING(30),
        allowNull: true
    });

    return Promise.all([ one, two ]);
};

  module.exports.down = function down(db,config) {
  	const queryInterface = db.getQueryInterface();

    const one = queryInterface.changeColumn('CampaignContact', 'contactFirstName',{
    	type:Sequelize.STRING(30),
        allowNull: false
    });
    const two = queryInterface.changeColumn('CampaignContact', 'contactLastName',{
    	type:Sequelize.STRING(30),
        allowNull: false
    });

    return Promise.all([ one, two ]);
};