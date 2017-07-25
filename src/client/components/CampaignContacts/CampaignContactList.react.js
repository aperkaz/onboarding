import React, { PropTypes, Component } from 'react';
import { ListGroup } from 'react-bootstrap';
import './campaignContactEditor.css'
import ContactListItem from './ContactListItem.react';
import DeleteModal from '../common/DeleteModal.react';
import _ from 'lodash';

export default class CampaignContactList extends Component {
  static propTypes = {
    campaignContacts: PropTypes.array,
    onContactSelect: PropTypes.func.isRequired,
    onDeleteContact: PropTypes.func.isRequired,
    selectedContact: PropTypes.object,
    campaignId: PropTypes.string.isRequired
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
    const { campaignContacts, selectedContact, onContactSelect } = this.props;

    if (_.size(campaignContacts) < 1) {
      return null;
    }

    return (
      <div>
        <ListGroup bsClass="campaignContactList">
          {_.map(campaignContacts, (contact) => {
            return (
              <ContactListItem
                onContactSelect={onContactSelect}
                contact={contact}
                key={contact.email ? contact.email : contact.companyName + contact.contactFirstName + contact.contactLastName}
                selected={!_.isEmpty(selectedContact) && this.isSelected(contact)}
                onDelete={() => this.handleDeleteModalOpen(contact.id)}
              />
            );
          })}
        </ListGroup>
        <DeleteModal
          isOpen={this.state.deleteModalOpen}
          onDelete={() => {this.onDeleteContact(this.state.id)}}
          onHide={() => {this.setState({ deleteModalOpen: false })}}
        />
      </div>

    );
  }
}
