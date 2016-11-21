import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import {
  loadCampaignContacts,
  createContact,
  updateContact,
  selectContact,
  removeSelection,
  deleteContact
} from '../actions/campaignContacts';
import CampaignContactEditor from '../components/CampaignContacts/CampaignContactEditor.react'
import {goBack} from 'redux-router';

@connect(
  state => ({
    campaignId: state.router.params.campaignId,
    campaignContactsData: state.campaignContactList
  }),
  (dispatch) => {
    return {
      handleLoadCampaignContacts: (campaignId) => {
        dispatch(loadCampaignContacts(campaignId));
      },
      handleSelectContact: (campaignId, email) => {
        dispatch(selectContact(campaignId, email));
      },
      handleRemoveSelection: () => {
        dispatch(removeSelection())
      },
      handleGoBackToCampaigns: () => {
        dispatch(goBack());
      },
      handleUpdateContact: (campaignId, email) => {
        dispatch(updateContact(campaignId, email));
      },
      handleCreateContact: (campaignId) => {
        dispatch(createContact(campaignId));
      },
      handleDeleteContact: (campaignId, email) => {
        dispatch(deleteContact(campaignId, email));
      }
    }
  }
)
export default class CampaignContacts extends Component {

  static propTypes = {
    campaignId: PropTypes.string.isRequired,
    handleLoadCampaignContacts: PropTypes.func.isRequired,
    handleGoBackToCampaigns: PropTypes.func.isRequired,
    handleSelectContact: PropTypes.func.isRequired,
    handleRemoveSelection: PropTypes.func.isRequired,
    handleUpdateContact: PropTypes.func.isRequired,
    handleCreateContact: PropTypes.func.isRequired,
    handleDeleteContact: PropTypes.func.isRequired,
    campaignContactsData: PropTypes.object,
  };

  /**
   * Start loading campaign contacts on mounting the component
   */
  componentDidMount() {
    this.props.handleLoadCampaignContacts(this.props.campaignId);
  }

  render() {
    const {
      campaignId,
      campaignContactsData,
      handleSelectContact,
      handleGoBackToCampaigns,
      handleRemoveSelection,
      handleCreateContact,
      handleUpdateContact,
      handleDeleteContact
    } = this.props;
    return(
      <CampaignContactEditor
        campaignId={campaignId}
        campaignContacts={campaignContactsData.campaignContacts}
        selectedContact={campaignContactsData.selectedContact}
        onContactSelect={handleSelectContact}
        onGoBackToCampaigns={handleGoBackToCampaigns}
        onRemoveSelection={handleRemoveSelection}
        onUpdateContact={handleUpdateContact}
        onCreateContact={handleCreateContact}
        onDeleteContact={handleDeleteContact}
      />
    );
  }
}
