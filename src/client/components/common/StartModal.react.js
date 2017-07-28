import React, { PropTypes } from 'react';
import _ from 'lodash';
import { Modal } from 'react-bootstrap';
import { injectIntl, intlShape } from 'react-intl';

const StartModal = ({ isOpen, onStart, onHide, intl, contacts }) => {
  const contactsLength = _.size(contacts);
  const newContactsLength = _.filter(contacts, { status: 'new' }).length;
  const isNewCampaign = contactsLength === newContactsLength;
  const campaignFormType = isNewCampaign ? 'start' : 'update';

  return (
    <Modal show={isOpen} keyboard={true} onHide={onHide}>
      <Modal.Header closeButton={true}>
        <Modal.Title>
          {intl.formatMessage({ id: `modal.${campaignFormType}.header` })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {intl.formatMessage({ id: `modal.${campaignFormType}.body` })}
        {' '}
        {intl.formatMessage({ id: `modal.${campaignFormType}.info` }, { length: `${newContactsLength}` })}
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-link" onClick={onHide}>
          {intl.formatMessage({ id: `modal.${campaignFormType}.button.cancel` })}
        </button>
        <button className="btn btn-primary" onClick={() => {
          onStart();
          onHide();
        }}>
          {intl.formatMessage({ id: `modal.${campaignFormType}.button.ok` })}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

StartModal.propTypes = {
  contacts: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onStart: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

export default injectIntl(StartModal);
