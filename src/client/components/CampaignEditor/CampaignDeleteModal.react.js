import { Modal } from 'react-bootstrap';
import { PropTypes } from 'react';

const CampaignDeleteModal = ({ isOpen, onDelete, onHide }) => {
    return (
        <Modal show={isOpen} keyboard={true} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Are you sure?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Do you really want to delete this entry?
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-link" onClick={onHide}>
                    Cancel
                </button>
                <button className="btn btn-primary" onClick={() => {
                    onDelete();
                    onHide();
                }}>
                    OK
                </button>
            </Modal.Footer>
        </Modal>
    );

};

CampaignDeleteModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onDelete: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
};

export default CampaignDeleteModal;