import React from "react";
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import ModalErrorMsg, {
  cannotDeleteTitle,
  cannotSaveTitle,
} from "@/components/modal/errorModal";
import { initModalObj, modalObjectType } from "@/components/modal/modalObjType";

describe('ErrorModal - Component', () => {

  const mockCancel = jest.fn();

  const testModalObj: modalObjectType = {
    ...initModalObj,
    show: true,
    title: 'Testing Modal',
    message: 'This is just a testing message',
  }

  const renderModal = (
    overrides: Partial<React.ComponentProps<typeof ModalErrorMsg>> = {}
  ) => {
    return render(
      <ModalErrorMsg
        show={testModalObj.show}
        title={testModalObj.title}
        message={testModalObj.message}
        onCancel={mockCancel}
        {...overrides}
      />
    )
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exported constants', () => {
    it('exports the expected titles', () => {
      expect(cannotDeleteTitle).toBe('Cannot Delete');
      expect(cannotSaveTitle).toBe('Cannot Save');
    })
  })

  describe('render the modal', () => {
    it('renders the dialog with an accessible name of "Error"', () => {
      renderModal();
      expect(screen.getByRole('dialog', { name: 'Error' })).toBeInTheDocument();
    })
    it('renders the title and message', () => {
      renderModal();
      expect(screen.getByText(testModalObj.title)).toBeInTheDocument();
      expect(screen.getByText(testModalObj.message)).toBeInTheDocument();
    })
    it('renders the OK button and the close (X) button', () => {
      renderModal();
      expect(screen.getByRole('button', { name: /ok/i })).toBeInTheDocument();
      // close button is "X" in the upper right corner
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    })
    it('renders the exported titles when used', () => {
      renderModal({ title: cannotDeleteTitle });
      expect(screen.getByText(cannotDeleteTitle)).toBeInTheDocument();
    })
    it('does not render when show is false', () => {
      renderModal({ show: false });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText(testModalObj.title)).not.toBeInTheDocument();
      expect(screen.queryByText(testModalObj.message)).not.toBeInTheDocument();
    })
  })

  describe('closing the modal', () => {
    it('clicking the OK button calls onCancel', async () => {
      const user = userEvent.setup();
      renderModal();
      await user.click(screen.getByRole('button', { name: /ok/i }));
      expect(mockCancel).toHaveBeenCalledTimes(1);
    })
    it('clicking the close (X) button calls onCancel', async () => {
      const user = userEvent.setup();
      renderModal();
      await user.click(screen.getByRole('button', { name: /close/i }));
      expect(mockCancel).toHaveBeenCalledTimes(1);
    })
    it('clicking the backdrop (outside the modal content) calls onCancel', async () => {
      const user = userEvent.setup();
      renderModal();
      // the role="dialog" element is the full-screen wrapper around the content
      await user.click(screen.getByRole('dialog'));
      expect(mockCancel).toHaveBeenCalledTimes(1);
    })
    it('pressing the Escape key calls onCancel', async () => {
      const user = userEvent.setup();
      renderModal();
      await user.keyboard('{Escape}');
      expect(mockCancel).toHaveBeenCalledTimes(1);
    })
    it('clicking inside the modal body does not call onCancel', async () => {
      const user = userEvent.setup();
      renderModal();
      await user.click(screen.getByText(testModalObj.message));
      expect(mockCancel).not.toHaveBeenCalled();
    })
  })

  describe('without onCancel', () => {
    it('renders and clicking OK does not throw', async () => {
      const user = userEvent.setup();
      renderModal({ onCancel: undefined });
      const okBtn = screen.getByRole('button', { name: /ok/i });
      await expect(user.click(okBtn)).resolves.not.toThrow();
      expect(mockCancel).not.toHaveBeenCalled();
    })
  })
})

// import React from "react";
// import { render, screen } from '../../../test-utils'
// import userEvent from "@testing-library/user-event";
// import ModalErrorMsg from "@/components/modal/errorModal";
// import { initModalObj } from "@/components/modal/modalObjType";

// describe('ErrorModal - Component', () => {
  
//   const mockCancel = jest.fn();

//   const testModalObj = {
//     ...initModalObj,
//     show: true,
//     title: 'Tesing Modal',
//     message: "This is just a testing message",
//   } as typeof initModalObj

//   describe('render the modal', () => {

//     beforeEach(() => {
//       jest.clearAllMocks();
//     });

//     it('render the modal', () => {
//       render(
//         <ModalErrorMsg
//           show={testModalObj.show}
//           title={testModalObj.title}
//           message={testModalObj.message}
//           onCancel={mockCancel}
//         />
//       )
//       expect(screen.getByText('Tesing Modal')).toBeTruthy;
//       expect(screen.getByText('This is just a testing message')).toBeTruthy;
//       const okBtn = screen.getByRole('button', { name: /ok/i });
//       expect(okBtn).toBeInTheDocument;
//       // close button is "X" in the upper right corner
//       const closeBtn = screen.getByRole('button', { name: /close/i });
//       expect(closeBtn).toBeInTheDocument;
//     })
//     it('click the ok button', async () => {
//       const user = userEvent.setup()
//       render(
//         <ModalErrorMsg
//           show={testModalObj.show}
//           title={testModalObj.title}
//           message={testModalObj.message}
//           onCancel={mockCancel}
//         />
//       )
//       const okBtn = screen.getByRole('button', { name: /ok/i });
//       await user.click(okBtn);
//       expect(mockCancel).toHaveBeenCalledTimes(1);
//     })
//     it('click outside the modal', async () => {
//       const user = userEvent.setup()
//       render(
//         <ModalErrorMsg
//           show={testModalObj.show}
//           title={testModalObj.title}
//           message={testModalObj.message}
//           onCancel={mockCancel}
//         />
//       )
//       const modal = screen.getByRole('dialog');
//       await user.click(modal);
//       expect(mockCancel).toHaveBeenCalledTimes(1);
//     })
//     it('close the modal', async () => {
//       const user = userEvent.setup()
//       render(
//         <ModalErrorMsg
//           show={testModalObj.show}
//           title={testModalObj.title}
//           message={testModalObj.message}
//           onCancel={mockCancel}
//         />
//       )
//       const closeBtn = screen.getByRole('button', { name: /close/i });
//       await user.click(closeBtn);
//       expect(mockCancel).toHaveBeenCalledTimes(1);
//     })
//     it('press the escape key acts like clicking the close button', async () => {
//       const user = userEvent.setup()
//       render(
//         <ModalErrorMsg
//           show={testModalObj.show}
//           title={testModalObj.title}
//           message={testModalObj.message}
//           onCancel={mockCancel}
//         />
//       )
//       await user.keyboard('{Escape}');
//       expect(mockCancel).toHaveBeenCalledTimes(1);
//     })
//   })
// })

