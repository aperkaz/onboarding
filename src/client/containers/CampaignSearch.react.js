import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { deleteCampaign } from '../actions/campaigns/delete';
import { searchCampaigns } from '../actions/campaigns/search';
import { loadCampaignContacts } from '../actions/campaignContacts/load';
import CampaignSearchForm from '../components/CampaignEditor/CampaignSearchForm.react';
import CampaignSearchResult from '../components/CampaignEditor/CampaignSearchResult.react';
import { push } from 'redux-router';
import { startCampaign } from '../actions/campaigns/start';

@connect(
  state => ({ campaignData: state.campaignList, contectList: state.campaignContactList }),
  (dispatch) => {
    return {
      handleSearchCampaigns: () => {
        dispatch(searchCampaigns())
      },
      handleDeleteCampaign: (campaignId) => {
        dispatch(deleteCampaign(campaignId))
      },
      handleStartCampaign: (campaignId) => {
        dispatch(startCampaign(campaignId))
      },
      handleLoadCampaignContacts: (campaignId) => {
        dispatch(loadCampaignContacts(campaignId));
      },
    }
  }
)
export default class CampaignSearch extends Component {
  static propTypes = {
    handleLoadCampaignContacts: PropTypes.func.isRequired,
    handleSearchCampaigns: PropTypes.func.isRequired,
    handleDeleteCampaign: PropTypes.func.isRequired,
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

  handleLoadCampaignContacts(campaignId){
    this.props.handleLoadCampaignContacts(campaignId);
  }
  
  render() {
    return (
      <div>
        <CampaignSearchForm onSearch={this.props.handleSearchCampaigns} onCreate={::this.handleCreate}/>
        <CampaignSearchResult
          campaigns={this.props.campaignData.campaigns}
          contacts={this.props.contectList.campaignContacts}
          onDeleteCampaign={this.props.handleDeleteCampaign}
          onEdit={::this.handleEdit}
          onGoToContacts={::this.handleGoToContacts}
          onStartCampaign={this.props.handleStartCampaign}
          loadCampaignContacts = {this.props.handleLoadCampaignContacts}
        />
      </div>
    );
  }
}
