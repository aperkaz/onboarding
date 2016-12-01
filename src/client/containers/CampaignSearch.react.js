import React from 'react';
import { connect } from 'react-redux';
import { deleteCampaign } from '../actions/campaigns/delete';
import { searchCampaigns } from '../actions/campaigns/search';
import CampaignSearchForm from '../components/CampaignEditor/CampaignSearchForm.react';
import CampaignSearchResult from '../components/CampaignEditor/CampaignSearchResult.react';
import { push } from 'redux-router';

@connect(
  state => ({ campaignData: state.campaignList }),
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
      },
      handleEdit: (campaignId) => {
        dispatch(push({ pathname: `/edit/${campaignId}` }));
      },
      handleGoToContacts: (campaignId) => {
        dispatch(push({ pathname: `/edit/${campaignId}/contacts` }));
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
          onEdit={this.props.handleEdit}
          onGoToContacts={this.props.handleGoToContacts}
        />
      </div>
    );
  }
}
