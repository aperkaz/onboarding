import { Modal } from 'react-bootstrap';
import React, { PropTypes } from 'react';
import { injectIntl, intlShape } from 'react-intl';

const StartModal = ({ isOpen, onStart, onHide, intl, contacts }) => {
  let contactsLength = (isOpen && contacts && contacts.length > 0 ? contacts.length : 0);

  return (
    <Modal show={isOpen} keyboard={true} onHide={onHide}>
      <Modal.Header closeButton={true}>
        <Modal.Title>
          {intl.formatMessage({ id: 'modal.start.header' })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {intl.formatMessage({ id: 'modal.start.body' })}
        It will send mail to {contactsLength} contacts.
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-link" onClick={onHide}>
          {intl.formatMessage({ id: 'modal.start.button.cancel' })}
        </button>
        <button className="btn btn-primary" onClick={() => {
          onStart();
          onHide();
        }}
        >
          {intl.formatMessage({ id: 'modal.start.button.ok' })}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

StartModal.propTypes = {
  contacts: PropTypes.array,
  isOpen: PropTypes.bool.isRequired,
  onStart: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

export default injectIntl(StartModal);
