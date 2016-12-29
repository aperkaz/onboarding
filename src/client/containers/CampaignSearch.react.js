import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { deleteCampaign } from '../actions/campaigns/delete';
import { searchCampaigns } from '../actions/campaigns/search';
import CampaignSearchForm from '../components/CampaignEditor/CampaignSearchForm.react';
import CampaignSearchResult from '../components/CampaignEditor/CampaignSearchResult.react';

@connect(
  state => ({ campaignData: state.campaignList }),
  (dispatch) => {
    return {
      handleSearchCampaigns: () => {
        dispatch(searchCampaigns())
      },
      handleDeleteCampaign: (campaignId) => {
        dispatch(deleteCampaign(campaignId))
      }
    }
  }
)
export default class CampaignSearch extends Component {
  static propTypes = {
    handleSearchCampaigns: PropTypes.func.isRequired,
    handleDeleteCampaign: PropTypes.func.isRequired,
    campaignData: PropTypes.object
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

  handleCreate() {
    this.context.router.push('/campaigns/create')
  }

  handleEdit(campaignId){
    this.context.router.push(`/campaigns/edit/${campaignId}`);
  }

  handleGoToContacts(campaignId) {
    this.context.router.push(`/campaigns/edit/${campaignId}/contacts`);
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
        <CampaignSearchForm onSearch={this.props.handleSearchCampaigns} onCreate={::this.handleCreate}/>
        <CampaignSearchResult
          campaigns={this.props.campaignData.campaigns}
          onDeleteCampaign={this.props.handleDeleteCampaign}
          onEdit={::this.handleEdit}
          onGoToContacts={::this.handleGoToContacts}
        />
      </div>
    );
  }
}
