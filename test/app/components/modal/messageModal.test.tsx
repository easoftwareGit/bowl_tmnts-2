// test/app/components/modal/messageModal.test.tsx
// tests src/app/components/modal/messageModal.tsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import MessageModal from "@/components/modal/messageModal";

const title = "Testing Modal";
const message = "This is just a testing message";

describe("MessageModal", () => {
  describe("rendering", () => {
    it("renders the title and message in a visible dialog when show is true", () => {
      render(<MessageModal show={true} title={title} message={message} />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeVisible();
      expect(dialog).toContainElement(screen.getByTestId("modalMessage"));
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it("labels the dialog with the title", () => {
      render(<MessageModal show={true} title={title} message={message} />);

      expect(screen.getByRole("dialog", { name: title })).toBeInTheDocument();
    });

    it("renders nothing when show is false", () => {
      render(<MessageModal show={false} title={title} message={message} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.queryByTestId("modalMessage")).not.toBeInTheDocument();
    });

    it("appears when show changes from false to true", () => {
      const { rerender } = render(
        <MessageModal show={false} title={title} message={message} />
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      rerender(<MessageModal show={true} title={title} message={message} />);
      expect(screen.getByRole("dialog")).toBeVisible();
    });

    it("closes when show changes from true to false", async () => {
      const { rerender } = render(
        <MessageModal show={true} title={title} message={message} />
      );
      expect(screen.getByRole("dialog")).toBeVisible();

      rerender(<MessageModal show={false} title={title} message={message} />);

      // react-bootstrap removes the dialog after its fade-out transition
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      );
    });
  });

  describe("without onClose", () => {
    it("does not show a close button", () => {
      render(<MessageModal show={true} title={title} message={message} />);

      expect(
        screen.queryByRole("button", { name: /close/i })
      ).not.toBeInTheDocument();
    });

    it("cannot be dismissed by clicking outside or pressing Escape", async () => {
      const user = userEvent.setup();
      render(<MessageModal show={true} title={title} message={message} />);

      // Clicking the dialog container itself (outside the content) is a backdrop click
      await user.click(screen.getByRole("dialog"));
      expect(screen.getByRole("dialog")).toBeVisible();

      await user.keyboard("{Escape}");
      expect(screen.getByRole("dialog")).toBeVisible();
    });
  });

  describe("with onClose", () => {
    it("shows a close button that calls onClose", async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(
        <MessageModal show={true} title={title} message={message} onClose={onClose} />
      );

      await user.click(screen.getByRole("button", { name: /close/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("pressing Escape calls onClose", async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(
        <MessageModal show={true} title={title} message={message} onClose={onClose} />
      );

      await user.keyboard("{Escape}");
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("clicking outside the content calls onClose", async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(
        <MessageModal show={true} title={title} message={message} onClose={onClose} />
      );

      await user.click(screen.getByRole("dialog"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
