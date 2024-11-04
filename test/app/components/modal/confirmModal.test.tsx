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
      const okBtn = screen.getByRole('button', { name: /ok/i });
      expect(okBtn).toBeInTheDocument;
      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      expect(cancelBtn).toBeInTheDocument;
      // close button is "X" in the upper right corner
      const closeBtn = screen.getByRole('button', { name: /close/i });
      expect(closeBtn).toBeInTheDocument;
    })
    it('click the ok button', async () => { 
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
      const okBtn = screen.getByRole('button', { name: /ok/i });
      await userEvent.click(okBtn);
      expect(mockConfirm).toHaveBeenCalled();
    })
    it('click the cancel button', async () => { 
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
      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelBtn);
      expect(mockCancel).toHaveBeenCalled();
    })
    it('click outside the modal', async () => { 
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
      await userEvent.click(modal);
      expect(mockCancel).toHaveBeenCalled();
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
      await userEvent.click(closeBtn);
      expect(mockCancel).toHaveBeenCalled();
    })
  })
})