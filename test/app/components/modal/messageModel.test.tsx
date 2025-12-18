import React from "react";
import { render, screen, fireEvent } from '../../../test-utils'
import userEvent from "@testing-library/user-event";
import ModalMessage from "@/components/modal/messageModel";
import { initModalObj } from "@/components/modal/modalObjType";

describe('MessageModal - Component', () => { 
  
  const testModalObj = {
    ...initModalObj,
    show: true,
    title: 'Tesing Modal',
    message: "This is just a testing message",
  } as typeof initModalObj

  describe('render the modal', () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('render the modal', () => { 
      render(
        <ModalMessage
          show={testModalObj.show}
          title={testModalObj.title}
          message={testModalObj.message}
        />
      )
      expect(screen.getByText('Tesing Modal')).toBeTruthy;
      expect(screen.getByText('This is just a testing message')).toBeTruthy;            
      // close button is "X" in the upper right corner is not shown
      const closeBtn = screen.queryByRole('button', { name: /close/i });
      expect(closeBtn).toBeNull;
      expect(closeBtn).not.toBeInTheDocument;
    })
    it('should not render the modal when show is false', () => {
      render(<ModalMessage show={false} title="Test Title" message="Test Message" />);      
      expect(screen.queryByTestId('modalMessage')).toBeNull;
    });  
    it('should not close the modal when clicking outside the modal', () => {
      render(<ModalMessage show={true} title="Test Title" message="Test Message" />);
      
      // Click outside the modal
      fireEvent.mouseDown(document);
      
      // Verify the modal is still open
      expect(screen.getByTestId('modalMessage')).toBeInTheDocument();
    });    
    it('press the escape key acts like clicking the close button', async () => { 
      const user = userEvent.setup()
      render(
        <ModalMessage
          show={testModalObj.show}
          title={testModalObj.title}
          message={testModalObj.message}
        />
      )
      await user.keyboard('{Escape}');
    })
  })
})