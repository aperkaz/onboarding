import React from 'react';
import { CampaignsApplication } from './containers'
import { render } from 'react-dom';
import campaignRoutes from './routes';
import campaignsReducer from './reducers';

module.exports = {
  renderCampaignEditor: function(domElement, props) {
    render(
            <CampaignsApplication {...props}/>,
            domElement
        );
  },

  campaignsRoutes: campaignRoutes,

  campaignsReducer: campaignsReducer,
};
