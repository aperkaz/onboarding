"use strict";

module.exports = function(sequelizeInstance, DataTypes) {
    return sequelizeInstance.define('CampaignContact', {
        email: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: 'CampaignCampaignContactUK',
            primaryKey: true
        },
        campaignId: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: 'CampaignCampaignContactUK'
        },
        status: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        companyName: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        contactFirstName: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        contactLastName: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        address: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        dunsNo: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        telephone: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        cell: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        supplierId: {
            type: DataTypes.STRING(30),
            allowNull: true,
            validate: {
                notEmpty: true,
                is: ["[a-zA-Z_\\-0-9]+"]
            }
        },
        customerSupplierId: {
            type: DataTypes.STRING(30),
            allowNull: true,
            validate: {
                notEmpty: true,
                is: ["[a-zA-Z_\\-0-9]+"]
            }
        },
        supplierCustomerId: {
            type: DataTypes.STRING(30),
            allowNull: true,
            validate: {
                notEmpty: true,
                is: ["[a-zA-Z_\\-0-9]+"]
            }
        }
    }, {
        getterMethods: {
            _objectLabel: function() {
                return this.email + " " + this.campaignId
            }
        },
        classMethods: {
            associate: function(models) {
                models.CampaignContact.belongsTo(models.CampaignContact, {
                    as: 'campaign',
                    foreignKey: 'campaignId',
                    targetKey: 'campaignId',
                    onDelete: 'cascade'
                });
            }
        },
        updatedAt: 'changedOn',
        createdAt: 'createdOn',
        timestamps: true,
        tableName: 'CampaignContact'
    });
};


