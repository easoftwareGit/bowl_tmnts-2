import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';

interface ChildProps {
  show: boolean; 
  message: string;
}

const WaitModal: React.FC<ChildProps> = ({
  show,
  message,
}) => {

  return (
    <>
      <Modal show={show} data-testid="modalWait">
        <Modal.Body>
          <div className="d-flex justify-content-center align-items-center">            
            <span>{message}&nbsp;&nbsp;</span>
            <Spinner animation="border" role="status" variant='primary'>              
            </Spinner>
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default WaitModal