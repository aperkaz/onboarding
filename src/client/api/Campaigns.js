const ApiBase = require('./ApiBase');
const ajax = require('superagent-bluebird-agent');

class Campaigns extends ApiBase
{
    startCampaign(campaignId)
    {
        return ajax.put(`/api/campaigns/start/${campaignId}`).set('Content-Type', 'application/json')
          .then(res => res && res.body).catch(this.getErrorFromResponse);
    }
}

export default Campaigns;
