import { createSelector } from 'reselect';
import _ from 'lodash';

const campaignListIds = state => {
    if (state.campaignList.campaigns) {
        return state.campaignList.campaigns.map(campaign => campaign.campaignId );
    }
    else {
        return []
    }
}
const campaignContactData = state => {
    if (state.campaignContactList.campaignContacts) {
        return state.campaignContactList.campaignContacts;
    }
    else {
        return []
    }
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