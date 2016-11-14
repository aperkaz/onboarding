import React from 'react';
import { connect } from 'react-redux';
import { searchCampaigns, deleteCampaign } from '../actions/campaign'
import CampaignSearchForm from '../components/CampaignEditor/CampaignSearchForm.react';
import CampaignSearchResult from '../components/CampaignEditor/CampaignSearchResult.react';
import { push } from 'redux-router';

@connect(
  state => ({ campaignData: state.campaign }),
  (dispatch) => {
    return {
      handleSearchCampaigns: () => {
        dispatch(searchCampaigns())
      },
      handleDeleteCampaign: (campaignId) => {
        dispatch(deleteCampaign(campaignId))
      },
      handleCreate: () => {
        dispatch(push({ pathname: '/create' }))
      }
    }
  }
)
export default class CampaignSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deleteModalOpen: false
    }
  }

  componentDidMount() {
    this.props.handleSearchCampaigns();
  }

  handleDeleteCampaign(campaignId) {
    this.setState({ deleteModalOpen: true })
  }

  render() {
    return (
      <div>
        <CampaignSearchForm onSearch={this.props.handleSearchCampaigns} onCreate={this.props.handleCreate}/>
        <CampaignSearchResult
          campaigns={this.props.campaignData.campaigns}
          onDeleteCampaign={this.props.handleDeleteCampaign}
        />
      </div>
    );
  }
}
