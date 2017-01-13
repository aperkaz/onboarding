import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { deleteCampaign } from '../actions/campaigns/delete';
import { searchCampaigns } from '../actions/campaigns/search';
import CampaignSearchForm from '../components/CampaignEditor/CampaignSearchForm.react';
import CampaignSearchResult from '../components/CampaignEditor/CampaignSearchResult.react';
import { push } from 'redux-router';
//import { startCampaign } from '../actions/campaigns/start';

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
      },
      handleStartCampaign: (campaignId) => {
        alert('here');
        //dispatch(startCampaign(campaignId))
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
    campaignData: PropTypes.object,
    handleStartCampaign: PropTypes.func.isRequired
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
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

  handleCreate() {
    this.context.router.push('/campaigns/create')
  }

  handleEdit(campaignId) {
    this.context.router.push(`/campaigns/edit/${campaignId}`);
  }

  handleGoToContacts(campaignId) {
    this.context.router.push(`/campaigns/edit/${campaignId}/contacts`);
  }

  handleDeleteCampaign(campaignId) {
    this.setState({ deleteModalOpen: true })
  }

  render() {
    return (
      <div>
        <CampaignSearchForm onSearch={this.props.handleSearchCampaigns} onCreate={::this.handleCreate}/>
        <CampaignSearchResult
          campaigns={this.props.campaignData.campaigns}
          onDeleteCampaign={this.props.handleDeleteCampaign}
          onEdit={this.props.handleEdit}
          onGoToContacts={this.props.handleGoToContacts}
          onStartCampaign={this.props.handleStartCampaign}
        />
      </div>
    );
  }
}
