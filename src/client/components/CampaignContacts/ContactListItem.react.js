import { ListGroupItem } from 'react-bootstrap';
import React, { PropTypes } from 'react';

const ContactListItem = ({ contact, onContactSelect, onDelete, selected }) => {
  let listItemAdditionalProps = selected ? { bsStyle: "info" } : {};
  return (
    <ListGroupItem key={contact.email} {...listItemAdditionalProps}>
      <div className="form-horizontal">
        <div className="row">
          <div className="col-md-5">
            <div className="form-group">
              <label className="col-sm-4 control-label">Email</label>
              <div className="col-sm-6 ">
                <p className="form-control-static">{contact.email}</p>
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-4 control-label">Company</label>
              <div className="col-sm-6">
                <p className="form-control-static">{contact.companyName}</p>
              </div>
            </div>
          </div>
          <div className="col-md-5">
            <div className="form-group">
              <label className="col-sm-6 control-label">Supplier Id</label>
              <div className="col-sm-6">
                <p className="form-control-static">{contact.supplierId}</p>
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-6 control-label">Status</label>
              <div className="col-sm-6">
                <p className="form-control-static">{contact.status}</p>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="form-group">
              <button className="btn btn-default" onClick={() => {onContactSelect(contact.campaignId, contact.email)}}>
                <span className="glyphicon glyphicon-pencil" />
              </button>
            </div>
            <div className="form-group">
              <button className="btn btn-default" onClick={onDelete} disabled={contact.status !== 'new'}>
                <span className="glyphicon glyphicon-trash" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </ListGroupItem>
  );
};

ContactListItem.propTypes = {
  contact: PropTypes.object.isRequired,
  onContactSelect: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  selected: PropTypes.bool
};

ContactListItem.defaultProps = {
  selected: false
};

export default ContactListItem;
