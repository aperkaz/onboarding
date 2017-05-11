import { createSelector } from 'reselect';
import _ from 'lodash';

const campaignListIds = state => {
    const { campaigns = [] } = state.campaignList;
    return campaigns.map(campaign => campaign.campaignId );
}
const campaignContactData = state => {
    const { campaignContacts = [] } = state.campaignContactList;
    return campaignContacts;
}


const computeRecentCampaignsChartData = (campaignListIds, campaignContactData) => {
    const computedData = _(campaignContactData)
        .filter(
            contact => _.includes(campaignListIds, contact.campaignId)
        )
        .groupBy('campaignId').map( (value, key) => {
            const stats = _.countBy(value, 'status');
            stats.name = key;
            return stats;
        })
        .value();
    

    return computedData;
}

const CampaignContactSelector = createSelector(
    campaignListIds,
    campaignContactData,
    computeRecentCampaignsChartData
)

export default CampaignContactSelector;