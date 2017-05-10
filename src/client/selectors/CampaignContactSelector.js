import { createSelector } from 'reselect';
import _ from 'lodash';

const campaignListIds = state => state.campaignList.campaigns.map(campaign => campaign.campaignId );
const campaignContactData = state => state.campaignContactData.campaignContracts;

const computeRecentCampaignsChartData = (campaignListIds, campaignContactData) => {
    const computedData = _.filter(
        campaignContactData,
        contact => _.contains(campaignList, contact.campaignId)
    )

    return computedData;
}

const matchCampaignWithContact = createSelector(
    campaignList,
    campaignContactData,
    computeRecentCampaignsChartData
)