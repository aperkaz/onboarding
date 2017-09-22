const ApiBase = require('./ApiBase');
const ajax = require('superagent-bluebird-promise');

class Contacts : ApiBase
{
    getContacts(campaignId)
    {
        return ajax.get(`/api/campaigns/${campaignId}/contacts`)
            .then(res => res && res.body).catch(this.getErrorFromResponse);
    }
}

export default Contacts;
