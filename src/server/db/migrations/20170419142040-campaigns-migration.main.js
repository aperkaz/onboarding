const Promise = require('bluebird');
const Sequelize = require('sequelize');

module.exports = {
  up: function(db) {
    const queryInterface = db.getQueryInterface();

    return Promise.all([
      queryInterface.createTable('Campaign', {
        campaignId: {
          type: Sequelize.STRING(30),
          primaryKey: true,
          allowNull: false
        },
        description: {
          allowNull: true,
          type: Sequelize.STRING(50),
        },
        startsOn: {
          allowNull: true,
          type: Sequelize.DATE()
        },
        endsOn: {
          allowNull: true,
          type: Sequelize.DATE()
        },
        status: {
          type: Sequelize.STRING(30),
          allowNull: false
        },
        campaignType: {
          type: Sequelize.STRING(30),
          allowNull: false
        },
        owner: {
          type: Sequelize.STRING(30),
          allowNull: true
        },
        companyId: {
          type: Sequelize.STRING(30),
          allowNull: true
        }
      }),
      queryInterface.createTable('CampaignContact', {
        id: {
          type: Sequelize.BIGINT(),
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        uuid: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        email: {
          type: Sequelize.STRING(30),
          allowNull: false,
          unique: 'CampaignCampaignContactUK',
          validate: {
            isEmail: true
          }
        },
        campaignId: {
          type: Sequelize.STRING(30),
          allowNull: false,
          unique: 'CampaignCampaignContactUK'
        },
        status: {
          type: Sequelize.STRING(30),
          allowNull: true
        },
        companyName: {
          type: Sequelize.STRING(30),
          allowNull: false
        },
        contactFirstName: {
          type: Sequelize.STRING(30),
          allowNull: false
        },
        contactLastName: {
          type: Sequelize.STRING(30),
          allowNull: false
        },
        address: {
          type: Sequelize.STRING(30),
          allowNull: true
        },
        dunsNo: {
          type: Sequelize.STRING(30),
          allowNull: true
        },
        telephone: {
          type: Sequelize.STRING(30),
          allowNull: true
        },
        cell: {
          type: Sequelize.STRING(30),
          allowNull: true
        },
        supplierId: {
          type: Sequelize.STRING(30),
          allowNull: true,
          validate: {
            notEmpty: true,
            is: ["[a-zA-Z_\\-0-9]+"]
          }
        },
        city: {
          type: Sequelize.STRING(30),
          allowNull: true
        },
        country: {
          type: Sequelize.STRING(30),
          allowNull: true
        },
        commercialRegisterNo: {
          type: Sequelize.STRING(30),
          allowNull: true
        },
        taxIdentNo: {
          type: Sequelize.STRING(30),
          allowNull: true
        },
        vatIdentNo: {
          type: Sequelize.STRING(30),
          allowNull: true
        },
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
      }).then(() => {
        return queryInterface.addIndex(
          'CampaignContact',
          ['email', 'campaignId'],
          {
            indexName: 'CampaignCampaignContactUK',
            indicesType: 'UNIQUE'
          }
        );
      })
    ]);
  },

  down: function(db) {
    const queryInterface = db.getQueryInterface();

    return Promise.all([
      queryInterface.dropTable('Campaign'),
      queryInterface.dropTable('CampaignContact'),
    ]);
  }
};
