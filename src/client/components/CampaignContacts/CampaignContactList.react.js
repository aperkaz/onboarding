import React, { PropTypes, Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { ListGroup } from 'react-bootstrap';
import './campaignContactEditor.css'
import DeleteModal from '../common/DeleteModal.react';
import _ from 'lodash';

export default class CampaignContactList extends Component {
  static propTypes = {
    campaignContacts: PropTypes.array,
    onContactSelect: PropTypes.func.isRequired,
    onDeleteContact: PropTypes.func.isRequired,
    selectedContact: PropTypes.object,
    campaignId: PropTypes.string.isRequired,
    intl: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      deleteModalOpen: false
    }
  }

  handleDeleteModalOpen(id) {
    this.setState({ deleteModalOpen: true, id: id })
  }

  handleDeleteModalClose() {
    this.setState({ deleteModalOpen: false, id: undefined })
  }

  onDeleteContact(id) {
    this.props.onDeleteContact(this.props.campaignId, id);
    this.handleDeleteModalClose();
  }

  renderActionPanel(cell, row) {
    const { onContactSelect, intl } = this.props;
    return (
      <div className="btn-group">
        <button className="btn btn-sm btn-default" onClick={() => onContactSelect(row.campaignId, row.id)}>
          <span className="glyphicon glyphicon-edit" />
          {intl.formatMessage({ id: 'campaignContactEditor.contactForm.button.edit' })}
        </button>

        <button className="btn btn-sm btn-default" onClick={() => this.handleDeleteModalOpen(row.id)}
        >
          <span className="glyphicon glyphicon-trash" />
          {intl.formatMessage({ id: 'campaignContactEditor.contactForm.button.delete' })}
        </button>
      </div>
    );
  }

  isSelected = (contact) => {
    let { selectedContact } = this.props;

    if (contact.id && contact.id === selectedContact.id)
      return true;

    if (contact.email && contact.email === selectedContact.email)
      return true;

    if ((contact.companyName + contact.contactFirstName + contact.contactLastName) == (selectedContact.companyName + selectedContact.contactFirstName + selectedContact.contactLastName))
      return true;

    return false;
  }

  render() {
    const { campaignContacts, selectedContact, onContactSelect, intl } = this.props;

    if (_.size(campaignContacts) < 1) {
      return null;
    }

    return (
      <div>
        <BootstrapTable data={campaignContacts} bordered={false} condenesed striped>
          <TableHeaderColumn width='150' dataField="email" isKey={true} dataSort={true}>
            {intl.formatMessage({id:'campaignContactEditor.contactForm.email.label'})}
          </TableHeaderColumn>

          <TableHeaderColumn width='150' dataField="companyName" dataSort={true}>
            {intl.formatMessage({id:'campaignContactEditor.contactForm.companyName.label'})}
          </TableHeaderColumn>

          <TableHeaderColumn width='150' dataField="supplierId">
            {intl.formatMessage({id:'campaignContactEditor.contactForm.supplierId.label'})}
          </TableHeaderColumn>

          <TableHeaderColumn width='150' dataField="status" dataSort={true}>
            {intl.formatMessage({id:'campaignContactEditor.contactForm.status.label'})}
          </TableHeaderColumn>
          <TableHeaderColumn width='150' dataAlign="right" dataFormat={::this.renderActionPanel}/>
        </BootstrapTable>
        <DeleteModal
          isOpen={this.state.deleteModalOpen}
          onDelete={() => {this.onDeleteContact(this.state.id)}}
          onHide={() => {this.setState({ deleteModalOpen: false })}}
        />
      </div>

    );
  }
}
