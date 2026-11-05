// test/app/components/modal/confirmModal.test.tsx
// tests src/app/components/modal/confirmModal.tsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ConfirmModal, {
  delConfTitle,
  cancelConfTitle,
} from "@/components/modal/confirmModal";

const title = "Testing Modal";
const message = "This is just a testing message";

describe("ConfirmModal - Component", () => {
  const mockConfirm = jest.fn();
  const mockCancel = jest.fn();

  const renderModal = (
    overrides: Partial<React.ComponentProps<typeof ConfirmModal>> = {}
  ) =>
    render(
      <ConfirmModal
        show={true}
        title={title}
        message={message}
        onConfirm={mockConfirm}
        onCancel={mockCancel}
        {...overrides}
      />
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("exported constants", () => {
    it("exports the expected titles", () => {
      expect(delConfTitle).toBe("Confirm Delete");
      expect(cancelConfTitle).toBe("Confirm Cancel");
    });
  });

  describe("render the modal", () => {
    it("renders a visible dialog labeled with the title", () => {
      renderModal();
      const dialog = screen.getByRole("dialog", { name: title });
      expect(dialog).toBeVisible();
      expect(dialog).toContainElement(screen.getByTestId("modalConfirm"));
    });

    it("renders the title and message", () => {
      renderModal();
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it("renders the Yes, No and close (X) buttons", () => {
      renderModal();
      expect(screen.getByRole("button", { name: /^yes$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^no$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
    });

    it("renders and labels the dialog with an exported title", () => {
      renderModal({ title: delConfTitle });
      expect(screen.getByRole("dialog", { name: delConfTitle })).toBeInTheDocument();
    });

    it("does not render when show is false", () => {
      renderModal({ show: false });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.queryByTestId("modalConfirm")).not.toBeInTheDocument();
    });

    it("appears when show changes from false to true", () => {
      const { rerender } = renderModal({ show: false });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      rerender(
        <ConfirmModal
          show={true}
          title={title}
          message={message}
          onConfirm={mockConfirm}
          onCancel={mockCancel}
        />
      );
      expect(screen.getByRole("dialog")).toBeVisible();
    });

    it("closes when show changes from true to false", async () => {
      const { rerender } = renderModal();
      expect(screen.getByRole("dialog")).toBeVisible();

      rerender(
        <ConfirmModal
          show={false}
          title={title}
          message={message}
          onConfirm={mockConfirm}
          onCancel={mockCancel}
        />
      );

      // react-bootstrap removes the dialog after its fade-out transition
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      );
    });
  });

  describe("confirming", () => {
    it("clicking Yes calls onConfirm once and not onCancel", async () => {
      const user = userEvent.setup();
      renderModal();
      await user.click(screen.getByRole("button", { name: /^yes$/i }));
      expect(mockConfirm).toHaveBeenCalledTimes(1);
      expect(mockCancel).not.toHaveBeenCalled();
    });
  });

  describe("cancelling", () => {
    it("clicking No calls onCancel once and not onConfirm", async () => {
      const user = userEvent.setup();
      renderModal();
      await user.click(screen.getByRole("button", { name: /^no$/i }));
      expect(mockCancel).toHaveBeenCalledTimes(1);
      expect(mockConfirm).not.toHaveBeenCalled();
    });

    it("clicking the close (X) button calls onCancel once", async () => {
      const user = userEvent.setup();
      renderModal();
      await user.click(screen.getByRole("button", { name: /close/i }));
      expect(mockCancel).toHaveBeenCalledTimes(1);
      expect(mockConfirm).not.toHaveBeenCalled();
    });

    it("clicking the backdrop (outside the modal content) calls onCancel once", async () => {
      const user = userEvent.setup();
      renderModal();
      // the role="dialog" element is the full-screen wrapper around the content
      await user.click(screen.getByRole("dialog"));
      expect(mockCancel).toHaveBeenCalledTimes(1);
      expect(mockConfirm).not.toHaveBeenCalled();
    });

    it("pressing Escape calls onCancel once", async () => {
      const user = userEvent.setup();
      renderModal();
      await user.keyboard("{Escape}");
      expect(mockCancel).toHaveBeenCalledTimes(1);
      expect(mockConfirm).not.toHaveBeenCalled();
    });

    it("clicking inside the modal body calls neither handler", async () => {
      const user = userEvent.setup();
      renderModal();
      await user.click(screen.getByText(message));
      expect(mockCancel).not.toHaveBeenCalled();
      expect(mockConfirm).not.toHaveBeenCalled();
    });
  });
});

// import React from "react";
// import { render, screen } from '../../../test-utils'
// import userEvent from "@testing-library/user-event";
// import ConfirmModal from "@/components/modal/confirmModal";
// import { initModalObj } from "@/components/modal/modalObjType";

// describe('ConfirmModal - Component', () => {

//   const mockConfirm = jest.fn();
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
//         <ConfirmModal
//           show={testModalObj.show}
//           title={testModalObj.title}
//           message={testModalObj.message}
//           onConfirm={mockConfirm}
//           onCancel={mockCancel}
//         />
//       )
//       expect(screen.getByText('Tesing Modal')).toBeTruthy;
//       expect(screen.getByText('This is just a testing message')).toBeTruthy;
//       const yesBtn = screen.getByRole('button', { name: /yes/i });
//       expect(yesBtn).toBeInTheDocument;
//       const noBtn = screen.getByRole('button', { name: /no/i });
//       expect(noBtn).toBeInTheDocument;
//       // close button is "X" in the upper right corner
//       const closeBtn = screen.getByRole('button', { name: /close/i });
//       expect(closeBtn).toBeInTheDocument;
//     })
//     it('click the yes button', async () => {
//       const user = userEvent.setup()
//       render(
//         <ConfirmModal
//           show={testModalObj.show}
//           title={testModalObj.title}
//           message={testModalObj.message}
//           onConfirm={mockConfirm}
//           onCancel={mockCancel}
//         />
//       )
//       const yesBtn = screen.getByRole('button', { name: /yes/i });
//       await user.click(yesBtn);
//       expect(mockConfirm).toHaveBeenCalledTimes(1);
//       expect(mockCancel).not.toHaveBeenCalled();
//     })
//     it('click the no button', async () => {
//       const user = userEvent.setup()
//       render(
//         <ConfirmModal
//           show={testModalObj.show}
//           title={testModalObj.title}
//           message={testModalObj.message}
//           onConfirm={mockConfirm}
//           onCancel={mockCancel}
//         />
//       )
//       const noBtn = screen.getByRole('button', { name: /no/i });
//       await user.click(noBtn);
//       expect(mockCancel).toHaveBeenCalledTimes(1);
//       expect(mockConfirm).not.toHaveBeenCalled();
//     })
//     it('should close the modal when click outside the modal', async () => {
//       const user = userEvent.setup()
//       render(
//         <ConfirmModal
//           show={testModalObj.show}
//           title={testModalObj.title}
//           message={testModalObj.message}
//           onConfirm={mockConfirm}
//           onCancel={mockCancel}
//         />
//       )
//       const modal = screen.getByRole('dialog');
//       await user.click(modal);
//       expect(mockCancel).toHaveBeenCalled();
//       expect(mockConfirm).not.toHaveBeenCalled();
//     })
//     it('close the modal', async () => {
//       const user = userEvent.setup()
//       render(
//         <ConfirmModal
//           show={testModalObj.show}
//           title={testModalObj.title}
//           message={testModalObj.message}
//           onConfirm={mockConfirm}
//           onCancel={mockCancel}
//         />
//       )
//       const closeBtn = screen.getByRole('button', { name: /close/i });
//       await user.click(closeBtn);
//       expect(mockCancel).toHaveBeenCalled();
//       expect(mockConfirm).not.toHaveBeenCalled();
//     })
//     it('press the escape key acts like clicking the close button', async () => {
//       const user = userEvent.setup()
//       render(
//         <ConfirmModal
//           show={testModalObj.show}
//           title={testModalObj.title}
//           message={testModalObj.message}
//           onConfirm={mockConfirm}
//           onCancel={mockCancel}
//         />
//       )
//       await user.keyboard('{Escape}');
//       expect(mockCancel).toHaveBeenCalled();
//       expect(mockConfirm).not.toHaveBeenCalled();
//     })
//   })
// })

