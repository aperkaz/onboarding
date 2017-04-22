import React from 'react';
import { CampaignsApplication } from './containers'
import { render } from 'react-dom';

export default {
  renderCampaignEditor: function(domElement, props) {
    render(
      <CampaignsApplication {...props}/>,
      domElement
    );
  }
};
