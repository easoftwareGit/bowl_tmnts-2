// test/app/components/modal/errorModal.test.tsx
// tests src/app/components/modal/errorModal.tsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ErrorModalMsg, {
  cannotDeleteTitle,
  cannotSaveTitle,
} from "@/components/modal/errorModal";

const title = "Testing Modal";
const message = "This is just a testing message";

describe("ErrorModal - Component", () => {
  const mockCancel = jest.fn();

  const renderModal = (
    overrides: Partial<React.ComponentProps<typeof ErrorModalMsg>> = {}
  ) =>
    render(
      <ErrorModalMsg
        show={true}
        title={title}
        message={message}
        onCancel={mockCancel}
        {...overrides}
      />
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("exported constants", () => {
    it("exports the expected titles", () => {
      expect(cannotDeleteTitle).toBe("Cannot Delete");
      expect(cannotSaveTitle).toBe("Cannot Save");
    });
  });

  describe("render the modal", () => {
    it("renders a visible dialog labeled with the title", () => {
      renderModal();
      expect(screen.getByRole("dialog", { name: title })).toBeVisible();
    });

    it("renders the title and message", () => {
      renderModal();
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it("renders the OK button and the close (X) button", () => {
      renderModal();
      expect(screen.getByRole("button", { name: /^ok$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
    });

    it("renders and labels the dialog with an exported title", () => {
      renderModal({ title: cannotSaveTitle });
      expect(
        screen.getByRole("dialog", { name: cannotSaveTitle })
      ).toBeInTheDocument();
    });

    it("does not render when show is false", () => {
      renderModal({ show: false });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.queryByText(title)).not.toBeInTheDocument();
      expect(screen.queryByText(message)).not.toBeInTheDocument();
    });

    it("appears when show changes from false to true", () => {
      const { rerender } = renderModal({ show: false });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      rerender(
        <ErrorModalMsg show={true} title={title} message={message} onCancel={mockCancel} />
      );
      expect(screen.getByRole("dialog")).toBeVisible();
    });

    it("closes when show changes from true to false", async () => {
      const { rerender } = renderModal();
      expect(screen.getByRole("dialog")).toBeVisible();

      rerender(
        <ErrorModalMsg show={false} title={title} message={message} onCancel={mockCancel} />
      );

      // react-bootstrap removes the dialog after its fade-out transition
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      );
    });
  });

  describe("closing the modal", () => {
    it("clicking the OK button calls onCancel", async () => {
      const user = userEvent.setup();
      renderModal();
      await user.click(screen.getByRole("button", { name: /^ok$/i }));
      expect(mockCancel).toHaveBeenCalledTimes(1);
    });

    it("clicking the close (X) button calls onCancel", async () => {
      const user = userEvent.setup();
      renderModal();
      await user.click(screen.getByRole("button", { name: /close/i }));
      expect(mockCancel).toHaveBeenCalledTimes(1);
    });

    it("clicking the backdrop (outside the modal content) calls onCancel", async () => {
      const user = userEvent.setup();
      renderModal();
      // the role="dialog" element is the full-screen wrapper around the content
      await user.click(screen.getByRole("dialog"));
      expect(mockCancel).toHaveBeenCalledTimes(1);
    });

    it("pressing the Escape key calls onCancel", async () => {
      const user = userEvent.setup();
      renderModal();
      await user.keyboard("{Escape}");
      expect(mockCancel).toHaveBeenCalledTimes(1);
    });

    it("clicking inside the modal body does not call onCancel", async () => {
      const user = userEvent.setup();
      renderModal();
      await user.click(screen.getByText(message));
      expect(mockCancel).not.toHaveBeenCalled();
    });
  });
});

// import React from "react";
// import { render, screen } from '@testing-library/react';
// import userEvent from "@testing-library/user-event";
// import ErrorModalMsg, {
//   cannotDeleteTitle,
//   cannotSaveTitle,
// } from "@/components/modal/errorModal";
// import { initModalObj, modalObjectType } from "@/components/modal/modalObjType";

// describe('ErrorModal - Component', () => {

//   const mockCancel = jest.fn();

//   const testModalObj: modalObjectType = {
//     ...initModalObj,
//     show: true,
//     title: 'Testing Modal',
//     message: 'This is just a testing message',
//   }

//   const renderModal = (
//     overrides: Partial<React.ComponentProps<typeof ErrorModalMsg>> = {}
//   ) => {
//     return render(
//       <ErrorModalMsg
//         show={testModalObj.show}
//         title={testModalObj.title}
//         message={testModalObj.message}
//         onCancel={mockCancel}
//         {...overrides}
//       />
//     )
//   }

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('exported constants', () => {
//     it('exports the expected titles', () => {
//       expect(cannotDeleteTitle).toBe('Cannot Delete');
//       expect(cannotSaveTitle).toBe('Cannot Save');
//     })
//   })

//   describe('render the modal', () => {
//     it('renders the dialog with an accessible name of "Error"', () => {
//       renderModal();
//       expect(screen.getByRole('dialog', { name: 'Error' })).toBeInTheDocument();
//     })
//     it('renders the title and message', () => {
//       renderModal();
//       expect(screen.getByText(testModalObj.title)).toBeInTheDocument();
//       expect(screen.getByText(testModalObj.message)).toBeInTheDocument();
//     })
//     it('renders the OK button and the close (X) button', () => {
//       renderModal();
//       expect(screen.getByRole('button', { name: /ok/i })).toBeInTheDocument();
//       // close button is "X" in the upper right corner
//       expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
//     })
//     it('renders the exported titles when used', () => {
//       renderModal({ title: cannotDeleteTitle });
//       expect(screen.getByText(cannotDeleteTitle)).toBeInTheDocument();
//     })
//     it('does not render when show is false', () => {
//       renderModal({ show: false });
//       expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
//       expect(screen.queryByText(testModalObj.title)).not.toBeInTheDocument();
//       expect(screen.queryByText(testModalObj.message)).not.toBeInTheDocument();
//     })
//   })

//   describe('closing the modal', () => {
//     it('clicking the OK button calls onCancel', async () => {
//       const user = userEvent.setup();
//       renderModal();
//       await user.click(screen.getByRole('button', { name: /ok/i }));
//       expect(mockCancel).toHaveBeenCalledTimes(1);
//     })
//     it('clicking the close (X) button calls onCancel', async () => {
//       const user = userEvent.setup();
//       renderModal();
//       await user.click(screen.getByRole('button', { name: /close/i }));
//       expect(mockCancel).toHaveBeenCalledTimes(1);
//     })
//     it('clicking the backdrop (outside the modal content) calls onCancel', async () => {
//       const user = userEvent.setup();
//       renderModal();
//       // the role="dialog" element is the full-screen wrapper around the content
//       await user.click(screen.getByRole('dialog'));
//       expect(mockCancel).toHaveBeenCalledTimes(1);
//     })
//     it('pressing the Escape key calls onCancel', async () => {
//       const user = userEvent.setup();
//       renderModal();
//       await user.keyboard('{Escape}');
//       expect(mockCancel).toHaveBeenCalledTimes(1);
//     })
//     it('clicking inside the modal body does not call onCancel', async () => {
//       const user = userEvent.setup();
//       renderModal();
//       await user.click(screen.getByText(testModalObj.message));
//       expect(mockCancel).not.toHaveBeenCalled();
//     })
//   })

//   describe('without onCancel', () => {
//     it('renders and clicking OK does not throw', async () => {
//       const user = userEvent.setup();
//       renderModal({ onCancel: undefined });
//       const okBtn = screen.getByRole('button', { name: /ok/i });
//       await expect(user.click(okBtn)).resolves.not.toThrow();
//       expect(mockCancel).not.toHaveBeenCalled();
//     })
//   })
// })

