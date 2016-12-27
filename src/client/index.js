import React from 'react';
import { CampaignsApplication } from './containers'
import { render } from 'react-dom';
import campaignRoutes from './routes';
import campaignsReducer from './reducers';
import { CAMPAIGN_SERVICE_NAME } from './constants/services';

module.exports = {
  renderCampaignEditor: function(domElement, props) {
    render(
            <CampaignsApplication {...props}/>,
            domElement
        );
  },

  campaignsRoutes: campaignRoutes,

  campaignsReducer: campaignsReducer,

  initCampaignsState: (campaignServiceUrl) => {
    return {
      serviceRegistry: (serviceName) => {
        return {
          url: {
            [CAMPAIGN_SERVICE_NAME]: campaignServiceUrl,
          }[serviceName]
        }
      }
    }
  }
};
