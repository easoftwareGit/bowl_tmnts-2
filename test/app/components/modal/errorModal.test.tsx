import React from "react";
import { render, screen } from '../../../test-utils'
import userEvent from "@testing-library/user-event";
import ModalErrorMsg from "@/components/modal/errorModal";
import { initModalObj } from "@/components/modal/modalObjType";

describe('ConfirmModal - Component', () => { 
  
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
        <ModalErrorMsg
          show={testModalObj.show}
          title={testModalObj.title}
          message={testModalObj.message}          
          onCancel={mockCancel}
        />
      )
      expect(screen.getByText('Tesing Modal')).toBeTruthy;
      expect(screen.getByText('This is just a testing message')).toBeTruthy;
      const okBtn = screen.getByRole('button', { name: /ok/i });
      expect(okBtn).toBeInTheDocument;
      // close button is "X" in the upper right corner
      const closeBtn = screen.getByRole('button', { name: /close/i });
      expect(closeBtn).toBeInTheDocument;
    })
    it('click the ok button', async () => { 
      const user = userEvent.setup()
      render(
        <ModalErrorMsg
          show={testModalObj.show}
          title={testModalObj.title}
          message={testModalObj.message}          
          onCancel={mockCancel}
        />
      )
      const okBtn = screen.getByRole('button', { name: /ok/i });
      await userEvent.click(okBtn);
      expect(mockCancel).toHaveBeenCalled();
    })
    it('click outside the modal', async () => { 
      const user = userEvent.setup()
      render(
        <ModalErrorMsg
          show={testModalObj.show}
          title={testModalObj.title}
          message={testModalObj.message}          
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
        <ModalErrorMsg
          show={testModalObj.show}
          title={testModalObj.title}
          message={testModalObj.message}          
          onCancel={mockCancel}
        />
      )
      const closeBtn = screen.getByRole('button', { name: /close/i });
      await userEvent.click(closeBtn);
      expect(mockCancel).toHaveBeenCalled();
    })
  })
})