const Sequelize = require('sequelize');

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
    const name = `${req.opuscapita.userData("firstname")} ${req.opuscapita.userData("lastname")}`;

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
            data.createdBy = name;
            data.createdOn = Sequelize.fn("NOW");
            data.changedBy = name;
            data.changedOn = Sequelize.fn("NOW");

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
    const name = `${req.opuscapita.userData("firstname")} ${req.opuscapita.userData("lastname")}`;

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
                data.changedBy = name;
                data.changedOn = Sequelize.fn("NOW");

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

    const statusesNotContacted = ['new', 'queued', 'generatingInvitation', 'invitationGenerated', 'sending'];  // , 'sent', 'bounced'];
    const statusesDiscussion   = ['read', 'loaded', 'registered', 'needsVoucher', 'generatingVoucher', 'serviceConfig', 'onboarded'];
    const statusesWon          = ['connected'];

    return this.db.models.CampaignContact.findAll({
        raw: true,          // to remove CampaignContact.Id from the result list
        include: {
            model: this.db.models.Campaign,
            required: true,
            where : {
                customerId: customerId
            },
            attributes: []  // to remove Campaign.Id from the result list
        },
        attributes: [
            'Status',
            [this.db.fn('COUNT', 'Status'), 'StatusCount']
        ],
        group: ['Status'],
    })
    .then(function (statuses) {
        // Example for statuses: [ { Status: 'loaded', StatusCount: 4 },\n  { Status: 'registered', StatusCount: 2 }, ... ]

        let data = [];
        let identified = statuses.reduce(function(acc, value) {return acc + value.StatusCount}, 0);
        let contacted = statuses.reduce(function(acc, value) {
            return acc + ((statusesNotContacted.indexOf(value.Status) >= 0) ? 0 : value.StatusCount);
        }, 0);
        let discussion = statuses.reduce(function(acc, value) {
            return acc + ((statusesDiscussion.indexOf(value.Status) >= 0) ? value.StatusCount : 0);
        }, 0);
        let won = statuses.reduce(function(acc, value) {
            return acc + ((statusesWon.indexOf(value.Status) >= 0) ? value.StatusCount : 0);
        }, 0);

        data.push( {"name":"identified", "value": identified});
        data.push( {"name":"contacted", "value": contacted});
        data.push( {"name":"discussion", "value": discussion});
        data.push( {"name":"won", "value": won});

        res.status(200).json(data);
    })
    .catch(e => res.status(400).json({ message : e.message }));
}
