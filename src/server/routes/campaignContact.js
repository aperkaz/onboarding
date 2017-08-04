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

    const identified = this.db.dialect.QueryGenerator.selectQuery('CampaignContact', {
        attributes: [ [ this.db.fn('count', this.db.col('id')), 'identified' ] ]
    })
    .slice(0,-1);

    const contacted = this.db.dialect.QueryGenerator.selectQuery('CampaignContact', {
        attributes: [ [ this.db.fn('count', this.db.col('id')), 'contacted' ] ],
        where: {
            status: {
                $notIn: ['new', 'queued', 'generatingInvitation', 'invitationGenerated', 'sending', 'sent', 'bounced']
            }
        }
    })
    .slice(0,-1);

    const discussion = this.db.dialect.QueryGenerator.selectQuery('CampaignContact', {
        attributes: [ [ this.db.fn('count', this.db.col('id')), 'discussion' ] ],
        where: {
            status: {
                $in: ['read', 'loaded', 'registered', 'serviceConfig', 'onboarded', 'needsVoucher', 'generatingVoucher']
            }
        }
    })
    .slice(0,-1);

    const won = this.db.dialect.QueryGenerator.selectQuery('CampaignContact', {
        attributes: [ [ this.db.fn('count', this.db.col('id')), 'won' ] ],
        where: {
            status: 'connected'
        }
    })
    .slice(0,-1);

    this.db.models.CampaignContact.findOne({
        include: {
            model: this.db.models.Campaign, 
            required: true,
            where : {
                customerId: customerId
            },
            attributes: ['id'],
        },
        attributes: [
            [this.db.literal(`(${identified})`), 'identified'],
            [this.db.literal(`(${contacted})`), 'contacted'],
            [this.db.literal(`(${discussion})`), 'discussion'],
            [this.db.literal(`(${won})`), 'won']
        ],
        raw : true,
        group: ['Campaign.id']
    })
    .then(result => {
        delete result['Campaign.id'];
        const data = Object.keys(result).map( (item) => {
            return {name: item, value: result[item]}
        });
        res.status(200).json(data);
    }).catch(e => res.status(400).json({ message : e.message }));
}
