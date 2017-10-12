const Promise = require('bluebird');
const ServiceClient = require('ocbesbn-service-client');
const Handlebars = require('handlebars');
const extend = require('extend');
const templatePreviewData = require('./template-preview-data.json');
const allowedTransitions = require('./allowedTransitions');

class Templates
{
    constructor(db, serviceClient = null)
    {
        this.db = db;
        this.serviceClient = serviceClient || new ServiceClient();
    }

    renderTemplatePreview({ templateId, customerId, baseUrl })
    {
        const where = {
            id : templateId,
            '$or' : [{ customerId }, { customerId : null }]
        };

        return Promise.all([
            this.db.models.Template.findOne({ where }),
            this.serviceClient.get('customer', `/api/customers/${customerId}`).spread(c => c)
        ])
        .spread((template, customer) =>
        {
            if(!template)
                throw new Error('The template requested could not be found.');

            const templateValues = extend(true, { }, templatePreviewData);
            templateValues.customer = customer;
            templateValues.externalUrl = `${baseUrl}/onboarding`;
            templateValues.blobUrl = `${baseUrl}/blob`

            const compiled = template.content && Handlebars.compile(template.content);
            const result = (compiled && compiled(templateValues)) || '';

            return { result, templateValues };
        })
        .catch(console.error);
    }

    renderPublicTemplate({ type, customerId, campaignId, contactId, transition, baseUrl, invitationCode, language })
    {
        const templateType = type === 'email' ? 'emailTemplate'
            : (type === 'landingpage' ? 'landingpageTemplate' : null);

        if(!templateType)
            return Promise.reject(Error('The requested template type is invalid.'));

        const { Campaign, CampaignContact, Template } = this.db.models;

        const campaignPromise = Campaign.findOne({ where : { customerId, campaignId } });
        const customerPromise = this.serviceClient.get('customer', `/api/customers/${customerId}`, true).spread(c => c);
        const contactPromise = contactId ? CampaignContact.findById(contactId) : Promise.resolve({ });

        return Promise.all([ campaignPromise, customerPromise, contactPromise ]).spread((campaign, customer, contact) =>
        {
            if(!campaign)
                throw new Error('The requested campaign does not exist.');
            if(!customer)
                throw new Error('The requested customer does not exist.');

            const templateWhere = { id : campaign[templateType] };

            return Template.findOne({ where : templateWhere })
                .then(template => [ template, campaign, customer, contact ]);
        })
        .spread((template, campaign, customer, contact) =>
        {
            if(!template)
                throw new Error('The template required by the requested campaign could not be found.');

            const externalUrl = `${baseUrl}/onboarding`;
            const blobUrl = `${baseUrl}/blob`

            language = language || campaign.languageId || 'en';
            invitationCode = invitationCode || campaign.invitationCode || (contact && contact.invitationCode);

            const templateValues = { campaign, customer, contact, transition, invitationCode, externalUrl, blobUrl, language };
            const compiled = template.content && Handlebars.compile(template.content);
            const result = compiled(templateValues);

            if(transition && contact.status != transition)
            {
                const allowed = allowedTransitions.eInvoiceSupplierOnboarding[contact.status];
                const applyTransition = allowed && allowed.indexOf(transition) ? transition : null;

                if(applyTransition)
                {
                    return contact.updateAttributes({
                        status : transition,
                        lastStatusChange : new Date()
                    })
                    .then(() => ({ result, templateValues }));
                }
            }

            return { result, templateValues };
        });
    }
}

module.exports = Templates;
