const Sequelize = require('sequelize');

module.exports = function(sequelize) {
  return sequelize.define('CampaignContact', {
    id: {
      type: Sequelize.BIGINT(),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    /**
     * Unique invitation code
     */
    invitationCode: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: true
    },
    /** Contact's email address. */
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'CampaignCampaignContactUK',
      validate: {
        isEmail: true
      }
    },
    /** Updated with userId after registration. */
    userId: {
      type: Sequelize.STRING,
      allowNull: true
    },
    /** ISO 3166-1 alpha2 Contacts Campaign code. */
    campaignId: {
      type: Sequelize.STRING(30),
      allowNull: false,
      unique: 'CampaignCampaignContactUK'
    },
    /** Contact's current transition status. */
    status: {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    /** Contact's company Name. */
    companyName: {
      type: Sequelize.STRING(30),
      allowNull: false
    },
    /** First name of contact. */
    contactFirstName: {
      type: Sequelize.STRING(30),
      allowNull: false
    },
    /** Last name of contact. */
    contactLastName: {
      type: Sequelize.STRING(30),
      allowNull: false
    },
    /** Contact's address. */
    address: {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    /** ISO 3166-1 alpha2 Campaign code. */
    dunsNo: {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    /** Contacts phone number. */
    telephone: {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    /** cell. */
    cell: {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    /** ISO 3166-1 alpha2 supplier code. */
    supplierId: {
      type: Sequelize.STRING(30),
      allowNull: true,
      validate: {
        notEmpty: true,
        is: ["[a-zA-Z_\\-0-9]+"]
      }
    },
    /** Contact's city name. */
    city: {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    /** Contact's country code. */
    country: {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    /** Commercial registration number. */
    commercialRegisterNo: {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    /** Tax identification number. */
    taxIdentNo: {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    /** vat identification number. */
    vatIdentNo: {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    /** Last transition status update time. */
    lastStatusChange: {
      type: Sequelize.DATE()
    }
    /* customerSupplierId: {
      type: Sequelize.STRING(30),
      allowNull: true,
      validate: {
        notEmpty: true,
        is: ["[a-zA-Z_\\-0-9]+"]
      }
    },
    supplierCustomerId: {
      type: Sequelize.STRING(30),
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
