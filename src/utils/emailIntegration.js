const RedisEvents = require('ocbesbn-redis-events');
const config = require('ocbesbn-config');
const Promise = require('bluebird');
const Handlebars = require('handlebars');
const Logger = require('ocbesbn-logger');

let logger = new Logger({});

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

        const sendMail = () => {
          if (!campaignContact.email) {
            logger.warn('No email is going to be sent, you have to send the invitation by external means')
            return Promise.resolve();
          }

          return events.emit(data, 'email');
        }

        return sendMail()
            .then(() => updateTransitionState(campaignContact.Campaign.campaignId, campaignContact.id, 'sent'))
            .catch(error =>
            {
                logger.warn(`Sending mail failed for ${data.to}`, error);
                return updateTransitionState(campaignContact.Campaign.campaignId, campaignContact.id, 'bounced');
            })
            .finally(callback);
    });
}

module.exports = sendInvitation;
