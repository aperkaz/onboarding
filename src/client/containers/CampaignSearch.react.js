import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { deleteCampaign } from '../actions/campaigns/delete';
import { searchCampaigns } from '../actions/campaigns/search';
import CampaignSearchForm from '../components/CampaignEditor/CampaignSearchForm.react';
import CampaignSearchResult from '../components/CampaignEditor/CampaignSearchResult.react';
import browserHistory from 'react-router/lib/browserHistory';

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
        browserHistory.push('/campaigns/create');
      },
      handleEdit: (campaignId) => {
        browserHistory.push(`/campaigns/edit/${campaignId}`);
      },
      handleGoToContacts: (campaignId) => {
        browserHistory.push(`/campaigns/edit/${campaignId}/contacts`);
      }
    }
  }
)
export default class CampaignSearch extends Component {
  static propTypes = {
    handleSearchCampaigns: PropTypes.func.isRequired,
    handleDeleteCampaign: PropTypes.func.isRequired,
    handleEdit: PropTypes.func.isRequired,
    handleGoToContacts: PropTypes.func.isRequired,
    handleCreate: PropTypes.func.isRequired,
    campaignData: PropTypes.object
  };

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
