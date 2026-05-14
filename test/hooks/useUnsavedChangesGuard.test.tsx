import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { useUnsavedChangesGuard } from "../../src/hooks/useUnsavedChangesGuard";

const TestComponent = ({
  hasUnsavedChanges,
  message,
}: {
  hasUnsavedChanges: () => boolean;
  message?: string;
}) => {
  useUnsavedChangesGuard(hasUnsavedChanges, message ? { message } : undefined);

  return (
    <div>
      <a href="/other-page">Other Page</a>
      <a href={window.location.href}>Same Page</a>
      <a href="/new-tab" target="_blank" rel="noreferrer">
        New Tab
      </a>
      <button type="button">Regular Button</button>
    </div>
  );
};

describe("useUnsavedChangesGuard", () => {
  const originalConfirm = window.confirm;
  const originalPushState = window.history.pushState;

  beforeEach(() => {
    jest.restoreAllMocks();

    window.confirm = jest.fn();
    window.history.pushState = jest.fn();
  });

  afterEach(() => {
    window.confirm = originalConfirm;
    window.history.pushState = originalPushState;
  });

  it("adds a history entry when mounted", () => {
    render(<TestComponent hasUnsavedChanges={() => false} />);

    expect(window.history.pushState).toHaveBeenCalledWith(
      null,
      "",
      window.location.href,
    );
  });

  it("does not warn on beforeunload when there are no unsaved changes", () => {
    render(<TestComponent hasUnsavedChanges={() => false} />);

    const event = new Event("beforeunload", {
      cancelable: true,
    }) as BeforeUnloadEvent;

    const preventDefaultSpy = jest.spyOn(event, "preventDefault");

    window.dispatchEvent(event);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("warns on beforeunload when there are unsaved changes", () => {
    render(<TestComponent hasUnsavedChanges={() => true} />);

    const event = new Event("beforeunload", {
      cancelable: true,
    }) as BeforeUnloadEvent;

    const preventDefaultSpy = jest.spyOn(event, "preventDefault");

    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });  

  it("uses custom message for link click confirmation", () => {
    (window.confirm as jest.Mock).mockReturnValue(false);

    render(
      <TestComponent
        hasUnsavedChanges={() => true}
        message="Custom warning message"
      />,
    );

    fireEvent.click(screen.getByRole("link", { name: "Other Page" }));

    expect(window.confirm).toHaveBeenCalledWith("Custom warning message");
  });

  it("does not confirm link click when there are no unsaved changes", () => {
    render(<TestComponent hasUnsavedChanges={() => false} />);

    fireEvent.click(screen.getByRole("link", { name: "Other Page" }));

    expect(window.confirm).not.toHaveBeenCalled();
  });

  it("allows link click when user confirms", () => {
    (window.confirm as jest.Mock).mockReturnValue(true);

    render(<TestComponent hasUnsavedChanges={() => true} />);

    const link = screen.getByRole("link", { name: "Other Page" });

    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });

    const prevented = !link.dispatchEvent(event);

    expect(window.confirm).toHaveBeenCalledWith(
      "You have unsaved changes. Leave this page?",
    );
    expect(prevented).toBe(false);
  });

  it("prevents link click when user cancels", () => {
    (window.confirm as jest.Mock).mockReturnValue(false);

    render(<TestComponent hasUnsavedChanges={() => true} />);

    const link = screen.getByRole("link", { name: "Other Page" });

    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });

    const prevented = !link.dispatchEvent(event);

    expect(window.confirm).toHaveBeenCalledWith(
      "You have unsaved changes. Leave this page?",
    );
    expect(prevented).toBe(true);
  });

  it("does not confirm when clicking same-page link", () => {
    render(<TestComponent hasUnsavedChanges={() => true} />);

    fireEvent.click(screen.getByRole("link", { name: "Same Page" }));

    expect(window.confirm).not.toHaveBeenCalled();
  });

  it("does not confirm when clicking target blank link", () => {
    render(<TestComponent hasUnsavedChanges={() => true} />);

    fireEvent.click(screen.getByRole("link", { name: "New Tab" }));

    expect(window.confirm).not.toHaveBeenCalled();
  });

  it("does not confirm when clicking non-link element", () => {
    render(<TestComponent hasUnsavedChanges={() => true} />);

    fireEvent.click(screen.getByRole("button", { name: "Regular Button" }));

    expect(window.confirm).not.toHaveBeenCalled();
  });

  it("does not confirm popstate when there are no unsaved changes", () => {
    render(<TestComponent hasUnsavedChanges={() => false} />);

    window.dispatchEvent(new Event("popstate"));

    expect(window.confirm).not.toHaveBeenCalled();
  });

  it("allows popstate when user confirms", () => {
    (window.confirm as jest.Mock).mockReturnValue(true);

    render(<TestComponent hasUnsavedChanges={() => true} />);

    window.dispatchEvent(new Event("popstate"));

    expect(window.confirm).toHaveBeenCalledWith(
      "You have unsaved changes. Leave this page?",
    );

    expect(window.history.pushState).toHaveBeenCalledTimes(1);
  });

  it("pushes current URL back onto history when user cancels popstate", () => {
    (window.confirm as jest.Mock).mockReturnValue(false);

    render(<TestComponent hasUnsavedChanges={() => true} />);

    window.dispatchEvent(new Event("popstate"));

    expect(window.confirm).toHaveBeenCalledWith(
      "You have unsaved changes. Leave this page?",
    );

    expect(window.history.pushState).toHaveBeenCalledTimes(2);
    expect(window.history.pushState).toHaveBeenLastCalledWith(
      null,
      "",
      window.location.href,
    );
  });

  it("removes event listeners on unmount", () => {
    const hasUnsavedChanges = jest.fn(() => true);

    const { unmount } = render(
      <TestComponent hasUnsavedChanges={hasUnsavedChanges} />,
    );

    unmount();

    window.dispatchEvent(new Event("popstate"));

    expect(window.confirm).not.toHaveBeenCalled();
  });
});