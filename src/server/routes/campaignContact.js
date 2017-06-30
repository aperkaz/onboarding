module.exports = function(app, epilogue, db) {
  const campaignContactResource = epilogue.resource({
    model: db.models.CampaignContact,
    endpoints: [
      '/campaigns/:campaignId/contacts',
      '/campaigns/:campaignId/contacts/:email'
    ]
  });

  campaignContactResource.use({
    list: {
      fetch: {
        before: function(req, res, context) {
          const userData = req.opuscapita.userData();

          db.models.Campaign.findOne({
            where: {
              campaignId: req.params.campaignId,
              customerId: userData.customerid
            }
          }).then((campaign) => {
            return db.models.CampaignContact.findAll({
              where: {
                campaignId: campaign.id
              }
            })
          }).then((contacts) => {
            // eslint-disable-next-line no-param-reassign
            context.instance = contacts;
            context.skip();
          })
        }
      }
    },
    create: {
      fetch: function(req, res, context) {
        const userData = req.opuscapita.userData();
        if (!userData || !userData.customerid) {
          throw ForbiddenError;
        } else {
          return new Promise(
            function(resolve, reject) {
              db.models.Campaign.findOne({
              where: {
                campaignId: req.params.campaignId,
                customerId: userData.customerid
              }
            }).then((campaign) => {
              req.body.campaignId = campaign.id;
              resolve(context.continue);
            })
          });
        }
      }
    }
  });

  app.get('/api/stats/transition', (req, res) => {
    const userData = req.opuscapita.userData();
    let idsOfAllCampaigns;
    let transitionStats = [];
    db.models.Campaign.findAll({
      attributes: ['id'],
      where: {
        customerId: userData.customerid
      }
    }).then((result) => {
      idsOfAllCampaigns = result.map((value) => {
        return value.id;
      });
      return db.models.CampaignContact.findOne({
        attributes: [[db.fn('count', db.col('id')), 'identified']],
        where: {
          campaignId: {
            $in: idsOfAllCampaigns
          }
        }
      });
    }).then((result) => {
      transitionStats.push({name: 'identified', value: result.toJSON().identified});
      return db.models.CampaignContact.findOne({
        attributes: [[db.fn('count', db.col('id')), 'contacted']],
        where: {
          campaignId: {
            $in: idsOfAllCampaigns
          },
          status: {
            $notIn: ['new', 'queued', 'generatingInvitation', 'invitationGenerated', 'sending', 'sent', 'bounced']
          }
        }
      });
    }).then((result) => {
      transitionStats.push({name: 'contacted', value: result.toJSON().contacted});
      return db.models.CampaignContact.findOne({
        attributes: [[db.fn('count', db.col('id')), 'discussion']],
        where: {
          campaignId: {
            $in: idsOfAllCampaigns
          },
          status: {
            $in: ['read', 'loaded', 'registered', 'serviceConfig', 'onboarded', 'voucherCode', 'needsVoucher', 'generatingVoucher']
          }
        }
      });
    }).then((result) => {
      transitionStats.push({name: 'discussion', value: result.toJSON().discussion});
      return db.models.CampaignContact.findOne({
        attributes: [[db.fn('count', db.col('id')), 'won']],
        where: {
          campaignId: {
            $in: idsOfAllCampaigns
          },
          status: 'connected'
        }
      });
    }).then((result) => {
      transitionStats.push({name: 'won', value: result.toJSON().won});
      res.status(200).json(transitionStats);
    });
  });
};
