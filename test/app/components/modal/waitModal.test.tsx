// test/app/components/modal/waitModal.test.tsx
// tests src/app/components/modal/waitModal.tsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import WaitModal from "@/components/modal/waitModal";

describe("WaitModal", () => {
  it("renders a visible dialog when show is true", () => {
    render(<WaitModal show={true} message="Loading..." />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeVisible();
    expect(dialog).toContainElement(screen.getByTestId("modalWait"));
  });

  it("renders nothing when show is false", () => {
    render(<WaitModal show={false} message="Loading..." />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("modalWait")).not.toBeInTheDocument();
  });

  it("shows the message inside a status region", () => {
    render(<WaitModal show={true} message="Saving tournament..." />);

    expect(screen.getByRole("status")).toHaveTextContent("Saving tournament...");
  });

  it("labels the dialog with the message", () => {
    render(<WaitModal show={true} message="Saving tournament..." />);

    expect(
      screen.getByRole("dialog", { name: "Saving tournament..." })
    ).toBeInTheDocument();
  });

  it("appears when show changes from false to true", () => {
    const { rerender } = render(<WaitModal show={false} message="Loading..." />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(<WaitModal show={true} message="Loading..." />);
    expect(screen.getByRole("dialog")).toBeVisible();
  });

  it("closes when show changes from true to false", async () => {
    const { rerender } = render(<WaitModal show={true} message="Loading..." />);
    expect(screen.getByRole("dialog")).toBeVisible();

    rerender(<WaitModal show={false} message="Loading..." />);

    // react-bootstrap removes the dialog after its fade-out transition
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });

  it("cannot be dismissed by clicking outside or pressing Escape", async () => {
    const user = userEvent.setup();
    render(<WaitModal show={true} message="Loading..." />);

    // Clicking the dialog container itself (outside the body content) is a backdrop click
    await user.click(screen.getByRole("dialog"));
    expect(screen.getByRole("dialog")).toBeVisible();

    await user.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeVisible();
  });
});

// import React from 'react';
// import { render, screen } from '@testing-library/react';
// import userEvent from "@testing-library/user-event";
// import '@testing-library/jest-dom/extend-expect';
// import WaitModal from '@/components/modal/waitModal';

// describe('WaitModal Component', () => {
//   it('renders the modal when show is true', () => {
//     render(<WaitModal show={true} message="Loading..." />);
//     const modalElement = screen.getByTestId('modalWait');
//     expect(modalElement).toBeVisible();
//   });
//   it('does not render the modal when show is false', () => {
//     render(<WaitModal show={false} message="Loading..." />);
//     const modalElement = screen.queryByTestId('modalWait');
//     expect(modalElement).not.toBeInTheDocument();
//   });
//   it('displays the correct message in the spinner', () => {
//     const message = "Please wait...";
//     render(<WaitModal show={true} message={message} />);
//     const modalElement = screen.queryByTestId('modalWait');
//     expect(modalElement).toHaveTextContent(message);
//   });
//   it('clicking outside the modal does nothing (modal stays visible)', async () => {
//     const user = userEvent.setup();
//     render(<WaitModal show={true} message="Loading..." />);

//     // modal is shown
//     expect(screen.getByTestId('modalWait')).toBeVisible();

//     const modal = screen.getByRole('dialog');
//     expect(modal).toBeVisible();

//     // Click on the dialog container (outside body content)
//     await user.click(modal);

//     // Modal should still be visible
//     expect(screen.getByRole('dialog')).toBeVisible();
//   });
//   it('pressing ESC does nothing (modal stays visible)', async () => {
//     const user = userEvent.setup();
//     render(<WaitModal show={true} message="Loading..." />);

//     // modal is shown
//     expect(screen.getByTestId('modalWait')).toBeVisible();

//     await user.keyboard('{Escape}');

//     // should still be visible
//     expect(screen.getByTestId('modalWait')).toBeVisible();
//   });

// });
