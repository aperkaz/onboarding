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

  handleDeleteModalOpen(email) {
    this.setState({ deleteModalOpen: true, email: email })
  }

  handleDeleteModalClose() {
    this.setState({ deleteModalOpen: false, email: undefined })
  }

  onDeleteContact(email) {
    this.props.onDeleteContact(this.props.campaignId, email);
    this.handleDeleteModalClose();
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
                key={contact.email}
                selected={!_.isEmpty(selectedContact) && contact.email === selectedContact.email}
                onDelete={() => this.handleDeleteModalOpen(contact.email)}
              />
            );
          })}
        </ListGroup>
        <DeleteModal
          isOpen={this.state.deleteModalOpen}
          onDelete={() => {this.onDeleteContact(this.state.email)}}
          onHide={() => {this.setState({ deleteModalOpen: false })}}
        />
      </div>

    );
  }
}
