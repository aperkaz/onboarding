const { ApiBase } = require('./ApiBase');

class Campaigns extends ApiBase
{
    getCampaign(campaignId)
    {
        return this.ajax.get(`/onboarding/api/campaigns/${campaignId}`).
            then(res => res && res.body).catch(this.getErrorFromResponse);
    }

    addCampaign(campaign)
    {
        return this.ajax.post(`/onboarding/api/campaigns`).send(campaign)
            .then(res => res && res.body).catch(this.getErrorFromResponse);
    }

    updateCampaign(campaignId, campaign)
    {
        return this.ajax.put(`/onboarding/api/campaigns/${campaignId}`).send(campaign)
            .then(res => res && res.body).catch(this.getErrorFromResponse);
    }

    startCampaign(campaignId)
    {
        return this.ajax.put(`/onboarding/api/campaigns/start/${campaignId}`).set('Content-Type', 'application/json')
          .then(res => res && res.body).catch(this.getErrorFromResponse);
    }

    getInvitationCode()
    {
        return this.ajax.get('/onboarding/api/campaigns/create/getInvitationCode').
            then(res => res && res.body && res.body.invitationCode).catch(this.getErrorFromResponse);
    }

    importItems(campaignId, items)
    {
        return this.ajax.post(`/onboarding/api/campaigns/${campaignId}/contacts/import`).send({ contacts : items })
            .then(res => res && res.body).catch(this.getErrorFromResponse);
    }
}

export default Campaigns;
