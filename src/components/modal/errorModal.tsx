"use client";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import styles from "./modal.module.css";

export const cannotDeleteTitle = "Cannot Delete";
export const cannotSaveTitle = "Cannot Save";

interface ErrorModalProps {
  show: boolean;
  title: string;
  message: string;
  onCancel: () => void;
}

const ErrorModalMsg: React.FC<ErrorModalProps> = ({
  show,
  title,
  message,
  onCancel,
}) => (
  <Modal show={show} onHide={onCancel} aria-label={title}>
    <Modal.Header closeButton>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body className={styles.modalBody}>{message}</Modal.Body>
    <Modal.Footer>
      <Button className="me-2" variant="success" onClick={onCancel}>
        OK
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ErrorModalMsg;