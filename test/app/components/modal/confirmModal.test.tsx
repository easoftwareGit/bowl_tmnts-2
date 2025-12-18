import React from "react";
import { render, screen } from '../../../test-utils'
import userEvent from "@testing-library/user-event";
import ModalConfirm from "@/components/modal/confirmModal";
import { initModalObj } from "@/components/modal/modalObjType";

describe('ConfirmModal - Component', () => { 

  const mockConfirm = jest.fn();
  const mockCancel = jest.fn();

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
        <ModalConfirm
          show={testModalObj.show}
          title={testModalObj.title}
          message={testModalObj.message}
          onConfirm={mockConfirm}
          onCancel={mockCancel}
        />
      )
      expect(screen.getByText('Tesing Modal')).toBeTruthy;
      expect(screen.getByText('This is just a testing message')).toBeTruthy;            
      const yesBtn = screen.getByRole('button', { name: /yes/i });
      expect(yesBtn).toBeInTheDocument;
      const noBtn = screen.getByRole('button', { name: /no/i });
      expect(noBtn).toBeInTheDocument;
      // close button is "X" in the upper right corner
      const closeBtn = screen.getByRole('button', { name: /close/i });
      expect(closeBtn).toBeInTheDocument;
    })
    it('click the yes button', async () => { 
      const user = userEvent.setup()
      render(
        <ModalConfirm
          show={testModalObj.show}
          title={testModalObj.title}
          message={testModalObj.message}
          onConfirm={mockConfirm}
          onCancel={mockCancel}
        />
      )
      const yesBtn = screen.getByRole('button', { name: /yes/i });
      await user.click(yesBtn);
      expect(mockConfirm).toHaveBeenCalledTimes(1);
      expect(mockCancel).not.toHaveBeenCalled();
    })
    it('click the no button', async () => { 
      const user = userEvent.setup()
      render(
        <ModalConfirm
          show={testModalObj.show}
          title={testModalObj.title}
          message={testModalObj.message}
          onConfirm={mockConfirm}
          onCancel={mockCancel}
        />
      )
      const noBtn = screen.getByRole('button', { name: /no/i });
      await user.click(noBtn);
      expect(mockCancel).toHaveBeenCalledTimes(1);
      expect(mockConfirm).not.toHaveBeenCalled();
    })
    it('should close the modal when click outside the modal', async () => { 
      const user = userEvent.setup()
      render(
        <ModalConfirm
          show={testModalObj.show}
          title={testModalObj.title}
          message={testModalObj.message}
          onConfirm={mockConfirm}
          onCancel={mockCancel}
        />
      )
      const modal = screen.getByRole('dialog');
      await user.click(modal);
      expect(mockCancel).toHaveBeenCalled();
      expect(mockConfirm).not.toHaveBeenCalled();
    })
    it('close the modal', async () => {
      const user = userEvent.setup()
      render(
        <ModalConfirm
          show={testModalObj.show}
          title={testModalObj.title}
          message={testModalObj.message}
          onConfirm={mockConfirm}
          onCancel={mockCancel}
        />
      )
      const closeBtn = screen.getByRole('button', { name: /close/i });
      await user.click(closeBtn);
      expect(mockCancel).toHaveBeenCalled();
      expect(mockConfirm).not.toHaveBeenCalled();
    })
    it('press the escape key acts like clicking the close button', async () => { 
      const user = userEvent.setup()
      render(
        <ModalConfirm
          show={testModalObj.show}
          title={testModalObj.title}
          message={testModalObj.message}
          onConfirm={mockConfirm}
          onCancel={mockCancel}
        />
      )
      await user.keyboard('{Escape}');
      expect(mockCancel).toHaveBeenCalled();
      expect(mockConfirm).not.toHaveBeenCalled();
    })
  })
})