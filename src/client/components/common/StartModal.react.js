import { Modal } from 'react-bootstrap';
import React, { PropTypes } from 'react';
import { injectIntl, intlShape } from 'react-intl';

const StartModal = ({ isOpen, onStart, onHide, maillist, intl }) => {
  return (
    <Modal show={isOpen} keyboard={true} onHide={onHide}>
      <Modal.Header closeButton={true}>
        <Modal.Title>
          {intl.formatMessage({ id: 'modal.start.header' })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {intl.formatMessage({ id: 'modal.start.body' })}
        <br />
        <br />
        {intl.formatMessage({id: 'modal.start.info'})}
        <br />
        {maillist}
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
  isOpen: PropTypes.bool.isRequired,
  onStart: PropTypes.func.isRequired,
  maillist:  PropTypes.oneOfType([PropTypes.element, PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  onHide: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

export default injectIntl(StartModal);
