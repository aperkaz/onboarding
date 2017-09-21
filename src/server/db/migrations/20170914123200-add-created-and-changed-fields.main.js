const Sequelize = require('sequelize');

module.exports.up =  function(db)
{
	const one = db.queryInterface.addColumn("CampaignContact", "createdBy", {
		type: Sequelize.STRING(60),
		allowNull: false
	});

	const two = db.queryInterface.addColumn("CampaignContact", "createdOn", {
		type: Sequelize.DATE,
		allowNull: false,
        defaultValue: Sequelize.NOW
	});

	const three = db.queryInterface.addColumn("CampaignContact", "changedBy", {
		type: Sequelize.STRING(60),
		allowNull: true
	});

	const four = db.queryInterface.addColumn("CampaignContact", "changedOn", {
		type: Sequelize.DATE,
		allowNull: true
	});

	const five = db.queryInterface.addColumn("Campaign", "createdBy", {
		type: Sequelize.STRING(60),
		allowNull: false
	});

	const six = db.queryInterface.addColumn("Campaign", "createdOn", {
		type: Sequelize.DATE,
		allowNull: false,
        defaultValue: Sequelize.NOW
	});

	const seven = db.queryInterface.addColumn("Campaign", "changedBy", {
		type: Sequelize.STRING(60),
		allowNull: true
	});

	const eight = db.queryInterface.addColumn("Campaign", "changedOn", {
		type: Sequelize.DATE,
		allowNull: true
	});

    return Promise.all([ one, two, three, four, five, six, seven, eight ]);
}

module.exports.down = function(db)
{
	const one = db.queryInterface.removeColumn("CampaignContact", "createdBy");
	const two = db.queryInterface.removeColumn("CampaignContact", "createdOn");
	const three = db.queryInterface.removeColumn("CampaignContact", "changedBy");
	const four = db.queryInterface.removeColumn("CampaignContact", "changedOn");
	const five = db.queryInterface.removeColumn("Campaign", "createdBy");
	const six = db.queryInterface.removeColumn("Campaign", "createdOn");
	const seven = db.queryInterface.removeColumn("Campaign", "changedBy");
	const eight = db.queryInterface.removeColumn("Campaign", "changedOn");

    return Promise.all([ one, two, three, four, five, six, seven, eight ]);
}
