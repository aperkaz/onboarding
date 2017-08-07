import React, { PropTypes, Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { ListGroup } from 'react-bootstrap';
import './campaignContactEditor.css'
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
    campaignId: PropTypes.string.isRequired,
    intl: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      deleteModalOpen: false,
      activePage: 1,
      index: 0,
      allContacts: [],
      slicedContacts: []
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
    if(nextProps.campaignContacts) {
      let contacts = nextProps.campaignContacts.slice(0, COUNT);
      if(!_.isEqual(this.props.campaignContacts, nextProps.campaignContacts)) {
        this.setState({
          allContacts: nextProps.campaignContacts,
          slicedContacts: contacts
        });
      }
    }
  }

// Handles onSelect function for pagination.
  handleSelect(e) {
    let i = (e - 1) * COUNT; //0,5
    let contactArray;
    let end = COUNT + i - 1; //0,10(6)
    //let start = i==1?0:i
    if(end > this.state.allContacts.length - 1) {
      end = this.state.allContacts.length - 1;
    }

    contactArray = this.state.allContacts.slice(i, end + 1);
    this.setState({ activePage: e, index: i, slicedContacts: contactArray });
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

  render() {
    const { campaignContacts, selectedContact, onContactSelect, intl } = this.props;

    if (_.size(this.state.slicedContacts) < 1) {
      return null;
    }

    return (
      <div>
        <div style={{float:'right',marginTop:'-20px'}}>
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
        <BootstrapTable data={this.state.slicedContacts} bordered={false} condenesed striped>
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
        <Pagination
          prev = {true}
          next = {true}
          bsClass='pagination'
          maxButtons = {5}
          items = {Math.ceil(campaignContacts.length/COUNT)}
          activePage = {this.state.activePage}
          onSelect = {(e)=>this.handleSelect(e)}
        />
        <DeleteModal
          isOpen={this.state.deleteModalOpen}
          onDelete={() => {this.onDeleteContact(this.state.id)}}
          onHide={() => {this.setState({ deleteModalOpen: false })}}
        />
      </div>
    );
  }
}
