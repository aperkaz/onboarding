import React, { Component, PropTypes } from 'react';
import CampaignEditForm from '../components/CampaignEditor/CampaignEditForm.react'
import { connect } from 'react-redux';
import { createCampaign } from '../actions/campaign';

@connect(
  state => ({}),
  (dispatch) => {
    return {
      handleCreateCampaign: () => {
        dispatch(createCampaign())
      }
    }
  }
)
export default class CampaignEdit extends Component {
  render() {
    return (
      <CampaignEditForm onCreateCampaign={this.props.handleCreateCampaign}/>
    );
  }
}
