import { Modal } from 'react-bootstrap';
import { PropTypes } from 'react';
import {injectIntl, intlShape} from 'react-intl';

const DeleteModal = ({ isOpen, onDelete, onHide, intl }) => {
  return (
    <Modal show={isOpen} keyboard={true} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {intl.formatMessage({id: 'modal.delete.header'})}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {intl.formatMessage({id: 'modal.delete.body'})}
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-link" onClick={onHide}>
          {intl.formatMessage({id: 'modal.delete.button.cancel'})}
        </button>
        <button className="btn btn-primary" onClick={() => {
          onDelete();
          onHide();
        }}>
          {intl.formatMessage({id: 'modal.delete.button.ok'})}
        </button>
      </Modal.Footer>
    </Modal>
  );

};

DeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

export default injectIntl(DeleteModal);
