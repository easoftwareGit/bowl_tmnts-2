import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import styles from "./model.module.css";

export const cannotDeleteTitle = 'Cannot Delete'
export const cannotSaveTitle = 'Cannot Save'

interface ChildProps {
  show: boolean,
  title: string,
  message: string, 
  onCancel?: () => void;
}

const ModalErrorMsg: React.FC<ChildProps> = ({
  show,
  title: heading,
  message,  
  onCancel
}) => { 

  return (
    <>
      <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
          <Modal.Title>{heading}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>{message}</Modal.Body>
        <Modal.Footer>
          <Button className='me-2' variant="success" onClick={onCancel}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default ModalErrorMsg;