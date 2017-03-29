"use strict";
module.exports = function(sequelizeInstance, DataTypes) {
  /**
     * Data model representing information of Campaign Contact.
     * @class CampaignContact
     */
  return sequelizeInstance.define('CampaignContact', 
    /** @lends CampaignContact */
  {
    /** ISO 3166-1 alpha2 campaign code. */
    id: {
      type: DataTypes.BIGINT(),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    /** Contact's email address. */
    email: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: 'CampaignCampaignContactUK',
      validate: {
        isEmail: true
      }
    },
    /** ISO 3166-1 alpha2 Contacts Campaign code. */
    campaignId: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: 'CampaignCampaignContactUK'
    },
    /** Contact's tansition status. */
    status: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    /** Contact's company Name. */
    companyName: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    /** First name of contact. */
    contactFirstName: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    /** Last name of contact. */
    contactLastName: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    /** Constacts address. */
    address: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    /** ISO 3166-1 alpha2 campaign code. */
    dunsNo: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    /** Contacts phone number. */
    telephone: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    /** cell. */
    cell: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    /** ISO 3166-1 alpha2 supplier code. */
    supplierId: {
      type: DataTypes.STRING(30),
      allowNull: true,
      validate: {
        notEmpty: true,
        is: ["[a-zA-Z_\\-0-9]+"]
      }
    },
    /** Contacts city name. */
    city: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    /** Contact's country code. */
    country: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    /** Commercial Registerartion number. */
    commercialRegisterNo: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    /** Tax identification number. */
    taxIdentNo: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    /** vat Identification nuber. */
    vatIdentNo: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    /** Last transition status update time. */
    lastStatusChange: {
      type: DataTypes.DATE()
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
