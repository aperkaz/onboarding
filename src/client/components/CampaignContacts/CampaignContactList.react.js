import React, { PropTypes, Component } from 'react';
import { ListGroup } from 'react-bootstrap';
import './campaignContactEditor.css'
import ContactListItem from './ContactListItem.react';
import DeleteModal from '../common/DeleteModal.react';
import _ from 'lodash';
import { Pagination } from 'react-bootstrap';
import { COUNT } from './../../constants/pagination';

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
      deleteModalOpen: false,
      activePage:1,
      index:0,
      allContacts:[],
      slicedContacts:[]
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
// Handles onSelect function for pagination.
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
    const divStyle = {float:'right',marginTop:'-60px'}
    return (
      <div>
        <div style={divStyle}>
          <Pagination
          prev = {true}
          next = {true}
          bsClass='pagination'
          maxButtons = {5}
          items = {Math.ceil(campaignContacts.length/COUNT)}
          activePage = {this.state.activePage}
          onSelect = {(e)=>this.handleSelect(e)}
          />
        </div>
        <div>
          <ListGroup bsClass="campaignContactList">
          {_.map(this.state.slicedContacts, (contact, i) => {
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
          <Pagination
          prev = {true}
          next = {true}
          bsClass='pagination'
          maxButtons = {5}
          items = {Math.ceil(campaignContacts.length/COUNT)}
          activePage = {this.state.activePage}
          onSelect = {(e)=>this.handleSelect(e)}
          />
        </ListGroup>
        <DeleteModal
          isOpen={this.state.deleteModalOpen}
          onDelete={() => {this.onDeleteContact(this.state.id)}}
          onHide={() => {this.setState({ deleteModalOpen: false })}}
        />
        </div>
      </div>

    );
  }
}
