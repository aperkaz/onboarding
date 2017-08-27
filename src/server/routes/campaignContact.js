module.exports = function(app, db)
{
    const webApi = new ContactsWebApi(db);

    app.get('/api/campaigns/:campaignId/contacts', (req, res) => webApi.sendContacts(req, res));
    app.get('/api/campaigns/:campaignId/contacts/:id', (req, res) => webApi.sendContact(req, res));
    app.post('/api/campaigns/:campaignId/contacts', (req, res) => webApi.createContact(req, res));
    app.put('/api/campaigns/:campaignId/contacts/:id', (req, res) => webApi.updateContact(req, res));
    app.delete('/api/campaigns/:campaignId/contacts/:id', (req, res) => webApi.deleteContact(req, res));
    app.get('/api/stats/transition', (req, res) => webApi.sendTransitionStats(req, res));
}

function ContactsWebApi(db)
{
    this.db = db;
}

ContactsWebApi.prototype.sendContacts = function(req, res)
{
    const customerId = req.opuscapita.userData('customerId');

    this.db.models.CampaignContact.findAll({
        include : {
            model : this.db.models.Campaign,
            required : true,
            where : {
                campaignId : req.params.campaignId,
                customerId : customerId
            }
        },
        where : {
            campaignId : this.db.literal('Campaign.id')
        }
    })
    .map(contact =>
    {
        contact = contact.dataValues;
        delete contact.Campaign;

        return contact;
    })
    .then(contacts =>
    {
        res.json(contacts);
    })
    .catch(e => res.status(400).json({ message : e.message }));
}

ContactsWebApi.prototype.sendContact = function(req, res)
{
    const customerId = req.opuscapita.userData('customerId');

    if(customerId)
    {
        this.db.models.CampaignContact.findOne({
            include : {
                model : this.db.models.Campaign,
                required : true,
                where : {
                    campaignId : req.params.campaignId,
                    customerId : customerId
                }
            },
            where : {
                id : req.params.id,
                campaignId : this.db.literal('Campaign.id')
            }
        })
        .then(contact =>
        {
            if(contact)
            {
                contact = contact.dataValues;
                delete contact.Campaign;

                res.json(contact);
            }
            else
            {
                res.status(404).json({ message : 'The requested contact could not be found.' });
            }
        })
        .catch(e => res.status(400).json({ message : e.message }));
    }
    else
    {
        res.status(400).json({ message : 'You are not allowed to take this action.' });
    }
}

ContactsWebApi.prototype.createContact = function(req, res)
{
    const customerId = req.opuscapita.userData('customerId');

    if(customerId)
    {
        this.db.models.Campaign.findOne({
            where : {
                campaignId : req.params.campaignId
            }
        })
        .then(campaign =>
        {
            const data = req.body;
            data.campaignId = campaign.id;

            return this.db.models.CampaignContact.create(data).then(item =>
            {
                item.campaignId = req.params.campaignId;
                res.status(202).json(item)
            });
        })
        .catch(e => res.status(400).json({ message : e.message }));
    }
    else
    {
        res.status(400).json({ message : 'You are not allowed to take this action.' });
    }
}

ContactsWebApi.prototype.updateContact = function(req, res)
{
    const customerId = req.opuscapita.userData('customerId');

    if(customerId)
    {
        this.db.models.CampaignContact.findOne({
            include : {
                model : this.db.models.Campaign,
                required : true,
                where : {
                    campaignId : req.params.campaignId,
                    customerId : customerId
                }
            },
            where : {
                id : req.params.id,
                campaignId : this.db.literal('Campaign.id')
            }
        })
        .then(contact =>
        {
            if(contact)
            {
                const data = req.body;
                data.campaignId = contact.Campaign.id;

                return contact.updateAttributes(data).then(item =>
                {
                    item.campaignId = req.params.campaignId;
                    res.status(202).json(item)
                });
            }
            else
            {
                res.status(404).json({ message : 'The requested contact could not be found.' });
            }
        })
        .catch(e => res.status(400).json({ message : e.message }));
    }
    else
    {
        res.status(400).json({ message : 'You are not allowed to take this action.' });
    }
}

ContactsWebApi.prototype.deleteContact = function(req, res)
{
    const customerId = req.opuscapita.userData('customerId');

    if(customerId)
    {
        this.db.models.Campaign.findOne({
            where : {
                campaignId : req.params.campaignId,
                customerId : customerId
            }
        })
        .then(campaign =>
        {
            if(campaign)
            {
                return this.db.models.CampaignContact.destroy({
                    where : {
                        id : req.params.id
                    }
                })
                .then(() => res.status(200).json(true));
            }
            else
            {
                res.status(404).json({ message : 'The requested campaign could not be found.' });
            }
        })
        .catch(e => res.status(400).json({ message : e.message }));
    }
    else
    {
        res.status(400).json({ message : 'You are not allowed to take this action.' });
    }
}

ContactsWebApi.prototype.sendTransitionStats = function(req, res)
{
    const customerId = req.opuscapita.userData('customerId');

    this.db.models.Campaign.findAll({
      where : {
        customerId: customerId
      },
      attributes: ['id']
      // FIXME: include does not import all related records. Maybe due indexing?
      // For now let's use manual filtering.
      // include: {
      //   model: this.db.models.CampaignContact,
      //   required: true
      // }
    }).then(rows => {
      return rows.map(row => {return row.id});
    }).then(campaignIds => {

      let identified = this.db.dialect.QueryGenerator.selectQuery('CampaignContact', {
        attributes: [ [ this.db.fn('count', this.db.col('id')), 'identified' ] ],
        where: {
          campaignId: {
            $in: campaignIds
          }
        }
      }).slice(0,-1);

      let contacted = this.db.dialect.QueryGenerator.selectQuery('CampaignContact', {
        attributes: [ [ this.db.fn('count', this.db.col('id')), 'contacted' ] ],
        where: {
          status: {
            $notIn: ['new', 'queued', 'generatingInvitation', 'invitationGenerated', 'sending', 'sent', 'bounced']
          },
          campaignId: {
            $in: campaignIds
          }
        }
      }).slice(0,-1);

      let discussion = this.db.dialect.QueryGenerator.selectQuery('CampaignContact', {
        attributes: [ [ this.db.fn('count', this.db.col('id')), 'discussion' ] ],
        where: {
          status: {
            $in: ['read', 'loaded', 'registered', 'serviceConfig', 'onboarded', 'needsVoucher', 'generatingVoucher']
          },
          campaignId: {
            $in: campaignIds
          }
        }
      }).slice(0,-1);

      let won = this.db.dialect.QueryGenerator.selectQuery('CampaignContact', {
        attributes: [ [ this.db.fn('count', this.db.col('id')), 'won' ] ],
        where: {
          status: 'connected',
          campaignId: {
            $in: campaignIds
          }
        }
      }).slice(0,-1);

      return this.db.models.CampaignContact.findOne({
        group: ['CampaignContact.id'],
        raw: true,
        attributes: [
          [this.db.literal(`(${identified})`), 'identified'],
          [this.db.literal(`(${contacted})`), 'contacted'],
          [this.db.literal(`(${discussion})`), 'discussion'],
          [this.db.literal(`(${won})`), 'won']
        ]
      })
    }).then(contactStatuses => {
      const data = Object.keys(contactStatuses).map( (item) => {
        return {name: item, value: contactStatuses[item].toString()}
      });
      res.status(200).json(data);
    }).catch(e => res.status(400).json({ message : e.message }));
}
