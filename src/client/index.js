import React from 'react';
import { Root } from './containers'
import { render } from 'react-dom';

module.exports = {
  renderCampaignEditor: function(domElement, props) {
    render(
            <Root {...props}/>,
            domElement
        );
  }
};
