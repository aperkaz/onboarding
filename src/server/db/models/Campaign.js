"use strict";

module.exports = function(sequelizeInstance, DataTypes) {
    return sequelizeInstance.define('Campaign', {
        campaignId: {
            type: DataTypes.STRING(30),
            primaryKey: true,
            allowNull: false
        },
        description: {
            allowNull: true,
            type: DataTypes.STRING(50),
        },
        startsOn: {
            allowNull: true,
            type: DataTypes.DATE()
        },
        endsOn: {
            allowNull: true,
            type: DataTypes.DATE()
        },
        status: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        campaignType: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        owner: {
            type: DataTypes.STRING(30),
            allowNull: true
        }
    }, {
        getterMethods: {
            _objectLabel: function() {
                return this.campaignId + this.description ? ' (' + this.description + ')' : ''
            }
        },
        classMethods: {
            associate: function(models) {
                models.Campaign.hasMany(models.CampaignContact, {
                    as: 'contacts',
                    foreignKey: 'campaignId',
                    targetKey: 'campaignId'
                });
            }
        },
        updatedAt: 'changedOn',
        createdAt: 'createdOn',
        timestamps: true,
        tableName: 'Campaign',
    });
};


