"use client";

import Modal from "react-bootstrap/Modal";
import styles from "./modal.module.css";

interface MessageModalProps {
  show: boolean;
  title: string;
  message: string;
  /** When provided, shows an X button and lets Escape / backdrop click close the modal. */
  onClose?: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({
  show,
  title,
  message,
  onClose,
}) => (
  <Modal
    show={show}
    onHide={onClose}
    data-testid="modalMessage"
    aria-label={title}
  >
    <Modal.Header closeButton={!!onClose}>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body className={styles.modalBody}>{message}</Modal.Body>
  </Modal>
);

export default MessageModal;
