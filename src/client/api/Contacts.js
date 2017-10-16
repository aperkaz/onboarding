const { ApiBase } = require('./ApiBase');

class Contacts extends ApiBase
{
    getContact(campaignId, contactId)
    {
        return this.ajax.get(`/onboarding/api/campaigns/${campaignId}/contacts/${contactId}`)
            .then(res => res && res.body).catch(this.getErrorFromResponse);
    }

    getContacts(campaignId)
    {
        return this.ajax.get(`/onboarding/api/campaigns/${campaignId}/contacts`)
            .then(res => res && res.body).catch(this.getErrorFromResponse);
    }

    addContact(campaignId, contact)
    {
        return this.ajax.post(`/onboarding/api/campaigns/${campaignId}/contacts`).send(contact)
            .then(res => res && res.body).catch(this.getErrorFromResponse);
    }

    updateContact(campaignId, contactId, contact)
    {
        return this.ajax.put(`/onboarding/api/campaigns/${campaignId}/contacts/${contactId}`).send(contact)
            .then(res => res && res.body).catch(this.getErrorFromResponse);
    }

    deleteContact(campaignId, contactId)
    {
        return this.ajax.delete(`/onboarding/api/campaigns/${campaignId}/contacts/${contactId}`)
            .then(res => res && res.body).catch(this.getErrorFromResponse);
    }
}

export default Contacts;
