const Sequelize = require('sequelize');
const validator = require('validator');

/**
 * hook to mutate the email of the
 * @param {Object} contacts
 * @param {Object} options
 */
const mutateEmail = function(contacts, options) {
  contacts.email = contacts.email ? contacts.email : null;
}

module.exports.init = function(sequelize)
{
  const Campaign = sequelize.define('Campaign',
  {
    id:
    {
      type: Sequelize.BIGINT(20),
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    /** Campaign description. */
    description:
    {
      allowNull: true,
      type: Sequelize.STRING(50),
    },
    /** Campaign Start Date. */
    startsOn:
    {
      allowNull: true,
      type: Sequelize.DATE()
    },
    /** Campaign end date. */
    endsOn:
    {
      type: Sequelize.DATE(),
      allowNull: true
    },
    /** Current status of Campaign. */
    status:
    {
      type: Sequelize.STRING(30),
      allowNull: false
    },
    /** Type of Campaign. */
    campaignType:
    {
      type: Sequelize.STRING(30),
      allowNull: false
    },
    /** Owner of the Campaign */
    customerId:
    {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    campaignId:
    {
      type: Sequelize.STRING(30),
      allowNull: false
    },
    /** Path to email template on blob storage */
    emailTemplate:
    {
      type: Sequelize.STRING(150),
      allowNull: true
    },
    landingpageTemplate:
    {
      type: Sequelize.STRING(150),
      allowNull: true
    },
    languageId:
    {
      type:Sequelize.STRING(3),
      allowNull: true
    },
    countryId:
    {
      type:Sequelize.STRING(2),
    },
    invitationCode:
    {
      type: Sequelize.UUID,
      allowNull: true
    }
  },
  {
    freezeTableName: true
  });

  const CampaignContact = sequelize.define('CampaignContact',
  {
    id:
    {
      type: Sequelize.BIGINT(),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    /**
     * Unique invitation code
     */
    invitationCode:
    {
      type: Sequelize.UUID,
      allowNull: true
    },
    /** Contact's email address. */
    email:
    {
      type: Sequelize.STRING,
      unique: 'CampaignCampaignContactUK',
      defaultValue: null,
      validate:
      {
        isValid: function(value, next) {
          if (value && !validator.isEmail(value)) {
            return next('Invalid Email');
          }
          next();
        }
      }
    },
    /** Updated with userId after registration. */
    userId:
    {
      type: Sequelize.STRING,
      allowNull: true
    },
    campaignId:
    {
      type: Sequelize.BIGINT(20),
      allowNull: false,
      unique: 'CampaignCampaignContactUK'
    },
    /** Contact's current transition status. */
    status:
    {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    /** Contact's company Name. */
    companyName:
    {
      type: Sequelize.STRING(30),
      allowNull: false
    },
    /** First name of contact. */
    contactFirstName:
    {
      type: Sequelize.STRING(30),
      allowNull: false
    },
    /** Last name of contact. */
    contactLastName:
    {
      type: Sequelize.STRING(30),
      allowNull: false
    },
    /** Contact's address. */
    address:
    {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    /** ISO 3166-1 alpha2 Campaign code. */
    dunsNo:
    {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    /** Contacts phone number. */
    telephone:
    {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    /** cell. */
    cell:
    {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    /** ISO 3166-1 alpha2 supplier code. */
    supplierId:
    {
      type: Sequelize.STRING(30),
      allowNull: true,
      validate:
      {
        notEmpty: true,
        is: ["[a-zA-Z_\\-0-9]+"]
      }
    },
    customerSupplierId:
    {
        type: Sequelize.STRING(30),
        allowNull: true,
    },
    zipCode:
    {
      type: Sequelize.STRING(10),
      allowNull: true
    },
    /** Contact's city name. */
    city:
    {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    /** Contact's country code. */
    country:
    {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    pobox: {
      type: Sequelize.STRING(10),
      allowNull: true
    },
    /** Commercial registration number. */
    commercialRegisterNo:
    {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    /** Tax identification number. */
    taxIdentNo:
    {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    /** vat identification number. */
    vatIdentNo:
    {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    /** Last transition status update time. */
    lastStatusChange:
    {
      type: Sequelize.DATE()
    },
    /** This is a voucher issues by campaign owner for supplier
        used for identifying this contact with a service config
        status, but also later to allow setting billing options
        on campaign level (e.g. customer pays for supplier transactions */
    serviceVoucherId:
    {
      type: Sequelize.STRING(100)
    }
  },
  {
    freezeTableName: true
  });

  Campaign.hasMany(CampaignContact,
  {
      foreignKey : 'id',
      targetKey: 'campaignId'
  });

  CampaignContact.belongsTo(Campaign,
  {
     foreignKey : 'campaignId',
     targetKey: 'id'
  });

  CampaignContact.beforeCreate(mutateEmail);
  CampaignContact.beforeUpdate(mutateEmail);

  return Promise.resolve();
};
