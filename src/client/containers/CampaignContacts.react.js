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

@connect(
  state => ({
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
    handleLoadCampaignContacts: PropTypes.func.isRequired,
    handleSelectContact: PropTypes.func.isRequired,
    handleRemoveSelection: PropTypes.func.isRequired,
    handleUpdateContact: PropTypes.func.isRequired,
    handleCreateContact: PropTypes.func.isRequired,
    handleDeleteContact: PropTypes.func.isRequired,
    handleResetImportInfo: PropTypes.func.isRequired,
    handleUploadCampaignContacts: PropTypes.func.isRequired,
    campaignContactsData: PropTypes.object,
    importResult: PropTypes.object,
    importInProgress: PropTypes.bool,
    params: PropTypes.object
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  /**
   * Start loading campaign contacts on mounting the component
   */
  componentDidMount() {
    this.props.handleLoadCampaignContacts(this.props.params.campaignId);
  }

  handleGoBackToCampaigns() {
    this.props.handleRemoveSelection();
    this.context.router.goBack();
  }

  render() {
    const campaignId = this.props.params.campaignId;
    const {
      campaignContactsData,
      importResult,
      importInProgress,
      handleSelectContact,
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
        onGoBackToCampaigns={::this.handleGoBackToCampaigns}
        onRemoveSelection={handleRemoveSelection}
        onUpdateContact={handleUpdateContact}
        onCreateContact={handleCreateContact}
        onDeleteContact={handleDeleteContact}
        onUploadCampaignContacts={handleUploadCampaignContacts}
        onResetImportInfo={handleResetImportInfo}
        importInProgress={importInProgress}
        importResult={importResult}
        loadContacts = {this.props.handleLoadCampaignContacts}
      />
    );
  }
}
