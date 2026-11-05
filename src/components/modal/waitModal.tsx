"use client";

import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";

interface WaitModalProps {
  show: boolean;
  message: string;
}

const WaitModal: React.FC<WaitModalProps> = ({ show, message }) => (
  <Modal
    show={show}
    backdrop="static"
    keyboard={false}
    data-testid="modalWait"
    aria-label={message}
  >
    <Modal.Body>
      <div
        className="d-flex justify-content-center align-items-center gap-2"
        role="status"
      >
        <span>{message}</span>
        <Spinner animation="border" variant="primary" aria-hidden="true" />
      </div>
    </Modal.Body>
  </Modal>
);

export default WaitModal;