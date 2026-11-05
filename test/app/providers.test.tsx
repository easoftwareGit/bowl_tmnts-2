// test/app/providers.test.tsx
// tests src/app/providers.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// ---------- mocks ----------

// Capture the props Providers passes to SessionProvider.
// The wrapper defers the lookup, so mockSessionProvider is initialized by the time it's called.
const mockSessionProvider = jest.fn(
  ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="SessionProviderMock">{children}</div>
  )
);

jest.mock("next-auth/react", () => ({
  __esModule: true,
  SessionProvider: (props: { children?: React.ReactNode }) =>
    mockSessionProvider(props),
}));

// Import AFTER mocks
import { Providers } from "@/app/providers";

describe("Providers (src/app/providers.tsx)", () => {
  beforeEach(() => {
    mockSessionProvider.mockClear();
  });

  it("renders its children", () => {
    render(
      <Providers>
        <div data-testid="ChildContent">Hello</div>
      </Providers>
    );
    expect(screen.getByTestId("ChildContent")).toHaveTextContent("Hello");
  });

  it("wraps children in SessionProvider", () => {
    render(
      <Providers>
        <div data-testid="ChildContent">Hello</div>
      </Providers>
    );
    expect(mockSessionProvider).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("SessionProviderMock")).toContainElement(
      screen.getByTestId("ChildContent")
    );
  });

  it("does not pass a session prop, so the session is fetched on the client", () => {
    render(
      <Providers>
        <div>Hello</div>
      </Providers>
    );
    const props = mockSessionProvider.mock.calls[0][0];
    expect(props).not.toHaveProperty("session");
  });

  it("renders multiple children in order", () => {
    render(
      <Providers>
        <div data-testid="First">First</div>
        <div data-testid="Second">Second</div>
      </Providers>
    );
    const wrapper = screen.getByTestId("SessionProviderMock");
    expect(wrapper).toContainElement(screen.getByTestId("First"));
    expect(wrapper).toContainElement(screen.getByTestId("Second"));

    const texts = screen
      .getAllByText(/^(First|Second)$/)
      .map((el) => el.textContent);
    expect(texts).toEqual(["First", "Second"]);
  });
});