import React, { Component, PropTypes, createElement } from 'react';
import { Tabs, Tab,Pagination } from 'react-bootstrap';
import CampaignContactList from './CampaignContactList.react'
import ContactForm from './ContactForm.react'
import { EDIT_CAMPAIGN_CONTACT_FORM, CREATE_CAMPAIGN_CONTACT_FORM } from '../../constants/forms';
import './campaignContactEditor.css';
import { reduxForm } from 'redux-form';
import _ from 'lodash';
import { injectIntl, intlShape } from 'react-intl';
import { validateCampaignContact } from '../common/campaignContactValidator';
import CampaignContactsImport from './import/CampaignContactsImport.react'
import { COUNT } from './../../constants/pagination';
class CampaignContactEditor extends Component {
  constructor(props) {
    super(props);
    this.state={
      activePage:1,
      index:0,
      allContacts:[],
      slicedContacts:[]
    }
  }
  static propTypes = {
    campaignId: PropTypes.string.isRequired,
    campaignContacts: PropTypes.array,
    importInProgress: PropTypes.bool,
    importResult: PropTypes.object,
    selectedContact: PropTypes.object,
    onContactSelect: PropTypes.func.isRequired,
    onGoBackToCampaigns: PropTypes.func.isRequired,
    onGoNext: PropTypes.func.isRequired,
    onRemoveSelection: PropTypes.func.isRequired,
    onUpdateContact: PropTypes.func.isRequired,
    onCreateContact: PropTypes.func.isRequired,
    onDeleteContact: PropTypes.func.isRequired,
    onUploadCampaignContacts: PropTypes.func.isRequired,
    onResetImportInfo: PropTypes.func.isRequired,
    loadContacts: PropTypes.func.isRequired,
    onExportCampaignContacts: PropTypes.func.isRequired,
    disableNext: PropTypes.bool.isRequired,
    intl: intlShape.isRequired
  };

  getMode() {
    if (_.isEmpty(this.props.selectedContact)) {
      return undefined;
    } else if (_.isEmpty(this.props.selectedContact.companyName)) {
      return 'create';
    } else {
      return 'update';
    }
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.campaignContacts ) {
      let contacts = nextProps.campaignContacts.slice(0,COUNT)
      if(!this.props.campaignContacts || nextProps.campaignContacts !== this.props.campaignContacts) {
        this.setState({
          allContacts:nextProps.campaignContacts,
          slicedContacts:contacts,
        })
      }
    }
    this.props = nextProps
  }

  handleSelect(e) {
    let i = (e - 1)*COUNT //0,5
    let contactArray
    let end = COUNT + i -1 //0,10(6)
    //let start = i==1?0:i
    if(end > this.state.allContacts.length - 1) {
      end = this.state.allContacts.length - 1
    }

    contactArray = this.state.allContacts.slice(i,end+1)   
    console.log(contactArray)
    this.setState({
      activePage:e,
      index:i,
      slicedContacts:contactArray
    })
  }

  renderUpdateForm() {
    const {
      selectedContact,
      onRemoveSelection,
      onUpdateContact,
      intl
    } = this.props;
    return createElement(reduxForm({
      form: EDIT_CAMPAIGN_CONTACT_FORM,
      mode: "update",
      formLabel: intl.formatMessage({ id: 'campaignContactEditor.contactForm.update.header' }, {
        email: selectedContact.email
      }),
      submitButtonLabel: intl.formatMessage({ id: 'campaignContactEditor.contactForm.button.update' }),
      closeButtonLabel: intl.formatMessage({ id: 'campaignContactEditor.contactForm.button.close' }),
      initialValues: selectedContact,
      onSave: () => {
        onUpdateContact(selectedContact.campaignId, selectedContact.id)
      },
      onCancel: onRemoveSelection,
      validate: validateCampaignContact
    })(ContactForm))
  }

  renderCreateForm() {
    const {
      selectedContact,
      onRemoveSelection,
      onCreateContact,
      intl
    } = this.props;

    selectedContact.status = "new";

    return createElement(reduxForm({
      form: CREATE_CAMPAIGN_CONTACT_FORM,
      mode: "create",
      formLabel: intl.formatMessage({ id: 'campaignContactEditor.contactForm.create.header' }),
      submitButtonLabel: intl.formatMessage({ id: 'campaignContactEditor.contactForm.button.create' }),
      closeButtonLabel: intl.formatMessage({ id: 'campaignContactEditor.contactForm.button.close' }),
      initialValues: selectedContact,
      onSave: () => {
        onCreateContact(selectedContact.campaignId)
      },
      onCancel: onRemoveSelection,
      validate: validateCampaignContact
    })(ContactForm))
  }

  renderUpdateOrEditForm() {
    let mode = this.getMode();
    if (mode === 'create') {
      return this.renderCreateForm();
    }

    if (mode === 'update') {
      return this.renderUpdateForm();
    }

    return null;
  }

  render() {
    const {
      campaignId,
      campaignContacts,
      disableNext,
      selectedContact,
      onContactSelect,
      onDeleteContact,
      onGoBackToCampaigns,
      onGoNext,
      onResetImportInfo,
      onRemoveSelection,
      onUploadCampaignContacts,
      intl,
      importInProgress,
      importResult,
      loadContacts,
      onExportCampaignContacts
    } = this.props;
    const divStyle = {float:'right'}
    return (
      <div>
        <h1>
          {intl.formatMessage({ id: 'campaignContactEditor.header' })}
        </h1>

        <Tabs defaultActiveKey={1} id="campaignContacts" onSelect={onRemoveSelection}>
          <Tab eventKey={1} title={intl.formatMessage({ id: 'campaignContactEditor.tabs.contactList' })}>
            <div className="row campaignContactListContainer">
              <div className="col-md-6">
                <button className="btn btn-default pull-left" onClick={() => onContactSelect(campaignId)}>
                  <span className="glyphicon glyphicon-plus" />
                  {intl.formatMessage({ id: 'campaignContactEditor.button.add' })}
                </button>
                <button className="btn btn-default pull-left" onClick={() => loadContacts(campaignId)}>
                <span className="glyphicon glyphicon-refresh" />
                 {intl.formatMessage({ id: 'campaignContactEditor.button.refresh' })}
                </button>
                <button className="btn btn-success pull-left" onClick={() => onExportCampaignContacts(campaignContacts)}>
                <span className="glyphicon glyphicon-export" />
                 {intl.formatMessage({ id: 'campaignContactEditor.button.export' })}
                </button>
                <div style={divStyle}>
                  <Pagination
                    prev={true}
                    next={true}
                    maxButtons = {5}
                    className="pull-right"
                    items = {Math.ceil(this.state.allContacts.length/COUNT)}
                    activePage = {this.state.activePage}
                    onSelect = {(e)=>this.handleSelect(e)}
                  />
                </div>
                <CampaignContactList
                  onContactSelect={onContactSelect}
                  slicedContacts={this.state.slicedContacts}
                  selectedContact={selectedContact}
                  campaignId={campaignId}
                  onDeleteContact={onDeleteContact}
                  activePage={this.state.activePage}
                  handleSelect={(e)=>this.handleSelect(e)}
                  allContacts={this.state.allContacts}
                />
              </div>
              <div className="col-md-6">
                {this.renderUpdateOrEditForm()}
              </div>
            </div>
          </Tab>
          <Tab
            eventKey={2}
            title={intl.formatMessage({ id: 'campaignContactEditor.tabs.import' })}
            onEnter={onResetImportInfo}
            onExit={onResetImportInfo}
          >
            <CampaignContactsImport
              campaignId={campaignId}
              onUploadCampaignContacts={onUploadCampaignContacts}
              importInProgress={importInProgress}
              importResult={importResult}
            />
          </Tab>
        </Tabs>
        <div className="form-submit text-right">
          <button className="btn btn-link" onClick={onGoBackToCampaigns}>
            {intl.formatMessage({ id: 'campaignEditor.steps.button.previous' })}
          </button>
          <button className="btn btn-primary" disabled={disableNext} onClick={onGoNext}>
            {intl.formatMessage({ id: 'campaignEditor.steps.button.savenext' }) }
          </button>
        </div>
      </div>
    );
  }
}

export default injectIntl(CampaignContactEditor);
