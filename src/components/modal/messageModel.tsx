import Modal from 'react-bootstrap/Modal';

interface ChildProps {
  show: boolean,
  title: string,
  message: string,
}

const ModalMessage: React.FC<ChildProps> = ({ 
  show,
  title: heading,
  message,
}) => { 

  return (
    <>
      <Modal show={show} data-testid="modalMessage">
        <Modal.Header>
          <Modal.Title>{heading}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
      </Modal>
    </>
  )
}

export default ModalMessage;
