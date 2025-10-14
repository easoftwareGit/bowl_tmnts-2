import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SamplePage from "@/app/sample/page";

// Mock react-bootstrap Modal to render its children directly
// because Bootstrap's Modal uses Portals and animation wrappers that complicate testing.
jest.mock("react-bootstrap/Modal", () => {
  const MockModal = ({ show, children }: { show: boolean; children: React.ReactNode }) => {
    return show ? <div role="dialog">{children}</div> : null;
  };
  const Header = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  Header.displayName = "MockModalHeader";

  const Title = ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>;
  Title.displayName = "MockModalTitle";

  const Body = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  Body.displayName = "MockModalBody";

  const Footer = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  Footer.displayName = "MockModalFooter";

  MockModal.Header = Header;
  MockModal.Title = Title;
  MockModal.Body = Body;
  MockModal.Footer = Footer;

  MockModal.displayName = "MockModal";

  return MockModal;
});

describe("SamplePage Modal integration", () => {
  it("shows the error modal when cancel is clicked and displays correct title and message", async () => {
    const user = userEvent.setup();
    render(<SamplePage />);

    // 1 Verify modal is not visible initially
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // 2 Click the Cancel button
    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelBtn);

    // 3 Modal should now be visible
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // 4 Check the modal title and message
    expect(screen.getByText("Cancel Test")).toBeInTheDocument();
    expect(screen.getByText("Do you want to cancel?")).toBeInTheDocument();

    // 5 Optional: verify OK button is present
    const okBtn = screen.getByRole("button", { name: /ok/i });
    expect(okBtn).toBeInTheDocument();
  });
});