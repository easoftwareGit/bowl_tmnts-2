"use client";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import styles from "./modal.module.css";

export const delConfTitle = "Confirm Delete";
export const cancelConfTitle = "Confirm Cancel";

interface ConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  show,
  title,
  message,
  onConfirm,
  onCancel,
}) => (
  <Modal
    show={show}
    onHide={onCancel}
    data-testid="modalConfirm"
    aria-label={title}
  >
    <Modal.Header closeButton>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body className={styles.modalBody}>{message}</Modal.Body>
    <Modal.Footer>
      <Button className="me-2" variant="success" onClick={onConfirm}>
        Yes
      </Button>
      <Button variant="danger" onClick={onCancel}>
        No
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ConfirmModal;