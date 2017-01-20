"use strict";

module.exports = function(sequelizeInstance, DataTypes) {
  return sequelizeInstance.define('CampaignContact', {
    id: {
      type: DataTypes.BIGINT(),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: 'CampaignCampaignContactUK',
      validate: {
        isEmail: true
      }
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
      allowNull: false
    },
    contactFirstName: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    contactLastName: {
      type: DataTypes.STRING(30),
      allowNull: false
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
    }
    /*customerSupplierId: {
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
    }*/
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
    timestamps: false,
    tableName: 'CampaignContact'
  });
};
