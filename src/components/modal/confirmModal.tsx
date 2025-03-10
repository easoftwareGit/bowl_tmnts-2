import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export const delConfTitle = 'Confirm Delete'
export const cancelConfTitle = 'Confirm Cancel'

interface ChildProps {
  show: boolean,
  title: string,
  message: string,
  onConfirm: () => void;
  onCancel?: () => void;
}

const ModalConfirm: React.FC<ChildProps> = ({ 
  show,
  title: heading,
  message,
  onConfirm,
  onCancel
}) => { 

  return (
    <>
      <Modal show={show} onHide={onCancel} data-testid="modalConfirm">
        <Modal.Header closeButton>
          <Modal.Title>{heading}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button className='me-2' variant="success" onClick={onConfirm}>
            Yes
          </Button>
          <Button variant="danger" onClick={onCancel}>
            No
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default ModalConfirm;
