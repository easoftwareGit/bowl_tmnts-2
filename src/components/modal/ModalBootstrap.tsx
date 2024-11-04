import React, { useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ModalConfirmProps {
  show: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ModelConfirm: React.FC<ModalConfirmProps> = ({ show, message, onConfirm, onCancel }) => {

  useEffect(() => {
    const cancelBtn = document.getElementById("cancelBtn")
    cancelBtn?.focus();    
  }, [])

  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onConfirm} id="confirmBtn">
          Confirm
        </Button>
        <Button variant="danger" onClick={onCancel} id="cancelBtn">
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModelConfirm;
