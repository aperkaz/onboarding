import { Modal } from 'react-bootstrap';
import { PropTypes } from 'react';
import {injectIntl, intlShape} from 'react-intl';

const CampaignDeleteModal = ({ isOpen, onDelete, onHide, intl }) => {
  return (
    <Modal show={isOpen} keyboard={true} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {intl.formatMessage({id: 'campaignEditor.deleteModal.header'})}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {intl.formatMessage({id: 'campaignEditor.deleteModal.body'})}
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-link" onClick={onHide}>
          {intl.formatMessage({id: 'campaignEditor.deleteModal.button.cancel'})}
        </button>
        <button className="btn btn-primary" onClick={() => {
          onDelete();
          onHide();
        }}>
          {intl.formatMessage({id: 'campaignEditor.deleteModal.button.ok'})}
        </button>
      </Modal.Footer>
    </Modal>
  );

};

CampaignDeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

export default injectIntl(CampaignDeleteModal);
