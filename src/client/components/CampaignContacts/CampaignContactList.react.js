import React, { PropTypes, Component } from 'react';
import { ListGroup } from 'react-bootstrap';
import './campaignContactEditor.css'
import DeleteModal from '../common/DeleteModal.react';
import _ from 'lodash';
import { Pagination } from 'react-bootstrap';
import { COUNT } from './../../constants/pagination';
import ReactTable from 'react-table';
import "react-table/react-table.css";

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

  renderActionPanel(row) {
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
    const { campaignContacts, intl } = this.props;

    if (_.size(campaignContacts) < 1) {
      return null;
    }

    const columns = [{
      Header: intl.formatMessage({id:'campaignContactEditor.contactForm.email.label'}),
      accessor: 'email' // String-based value accessors!
    }, {
      Header: intl.formatMessage({id:'campaignContactEditor.contactForm.companyName.label'}),
      accessor: 'companyName'
    }, {
      Header: intl.formatMessage({id:'campaignContactEditor.contactForm.supplierId.label'}),
      accessor: 'supplierId'
    }, {
      Header: intl.formatMessage({id:'campaignContactEditor.contactForm.status.label'}),
      accessor: 'status'
    }, {
      sortable: false,
      filterable: false,
      Cell: row => (
        this.renderActionPanel(row.original)
      )
    }]

    return (
      <div>
        <ReactTable
          data={campaignContacts}
          columns={columns}
          minRows={1}
          defaultPageSize={10}
          showPagination={true}
          showPaginationTop
          showPaginationBottom
          filterable
          showPageSizeOptions={false}
          showPageJump={false}
          className="-striped -highlight ocbn table"
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
