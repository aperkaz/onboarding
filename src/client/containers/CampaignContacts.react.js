import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadCampaignContacts } from '../actions/campaignContacts/load';
import { updateContact } from '../actions/campaignContacts/update';
import { createContact } from '../actions/campaignContacts/create';
import { deleteContact } from '../actions/campaignContacts/delete';
import { selectContact, removeSelection } from '../actions/campaignContacts/selection';
import { importCampaignContacts } from '../actions/campaignContacts/import';
import { resetImportInfo } from '../actions/campaignContacts/import';
import CampaignContactEditor from '../components/CampaignContacts/CampaignContactEditor.react'
import { goBack } from 'redux-router';

@connect(
  state => ({
    campaignId: state.router.params.campaignId,
    campaignContactsData: state.campaignContactList,
    importInProgress: state.campaignContactList.importInProgress,
    importResult: state.campaignContactList.importResult
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
      },
      handleUploadCampaignContacts: (campaignId, file) => {
        dispatch(importCampaignContacts(campaignId, file));
      },
      handleResetImportInfo: () => {
        dispatch(resetImportInfo())
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
    handleResetImportInfo: PropTypes.func.isRequired,
    handleUploadCampaignContacts: PropTypes.func.isRequired,
    campaignContactsData: PropTypes.object
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
      importResult,
      importInProgress,
      handleSelectContact,
      handleGoBackToCampaigns,
      handleRemoveSelection,
      handleCreateContact,
      handleUpdateContact,
      handleDeleteContact,
      handleUploadCampaignContacts,
      handleResetImportInfo
    } = this.props;
    return (
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
        onUploadCampaignContacts={handleUploadCampaignContacts}
        onResetImportInfo={handleResetImportInfo}
        importInProgress={importInProgress}
        importResult={importResult}
      />
    );
  }
}
