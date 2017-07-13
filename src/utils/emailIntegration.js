const RedisEvents = require('ocbesbn-redis-events');
const config = require('ocbesbn-config');
const Promise = require('bluebird');
const Handlebars = require('handlebars');

const events = new RedisEvents({ consul : { host : 'consul', redisServiceName: 'redis', redisPasswordKey: 'redis-auth' } });

const sendInvitation = (template, customer, campaignContact, updateTransitionState, callback) =>
{
    return config.get(["ext-url/scheme", "ext-url/host", "ext-url/port"]).spread((scheme, host, port) =>
    {
        const url = `${scheme}://${host}:${port}/onboarding`;
        const blobUrl = `${scheme}://${host}:${port}/blob`;
        const emailOpenTrack = `${url}/public/transition/c_${campaignContact.Campaign.customerId}/${campaignContact.Campaign.campaignId}/${campaignContact.id}?transition=read`;

        const html = Handlebars.compile(template)({
            customer: customer,
            campaignContact: campaignContact,
            url: url,
            blobUrl: blobUrl,
            emailOpenTrack: emailOpenTrack
        });

        let data = {
            to: campaignContact.email,
            subject: `${customer.customerName} asking you to connect eInvoicing`,
            html: html
        };

        return events.emit(data, 'email')
            .then(() => updateTransitionState(campaignContact.Campaign.campaignId, campaignContact.id, 'sent'))
            .catch(error =>
            {
                console.log('----Not able to send mail', error);
                return updateTransitionState(campaignContact.Campaign.campaignId, campaignContact.id, 'bounced');
            })
            .finally(callback);
    });
}

module.exports = sendInvitation;
