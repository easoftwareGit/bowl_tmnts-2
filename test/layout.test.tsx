import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// ---------- mocks ----------

// next/font/google -> Inter() normally runs Next font loader logic.
// We just need a stable className string.
jest.mock("next/font/google", () => ({
  Inter: () => ({ className: "inter-mock-class" }),
}));

// Providers wrappers: make them transparent (render children)
jest.mock("@/app/providers", () => ({
  __esModule: true,
  Providers: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="ProvidersMock">{children}</div>
  ),
}));

jest.mock("@/redux/provider", () => ({
  __esModule: true,
  ReduxProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="ReduxProviderMock">{children}</div>
  ),
}));

// Navbar: don’t pull in next-auth, routing, etc. for layout test
jest.mock("@/components/navBar/eaNavbar", () => ({
  __esModule: true,
  default: () => <nav data-testid="EaNavbarMock">EaNavbar</nav>,
}));

// Your bootstrap Container wrapper
jest.mock("@/components/boostrap", () => ({
  __esModule: true,
  Container: ({
    children,
    fluid,
    className,
  }: {
    children: React.ReactNode;
    fluid?: boolean;
    className?: string;
  }) => (
    <div
      data-testid="ContainerMock"
      data-fluid={String(!!fluid)}
      className={className}
    >
      {children}
    </div>
  ),
}));

// Import AFTER mocks, so it uses the mocks, not the real components
import RootLayout, { metadata } from "@/app/layout";

describe("RootLayout (src/app/layout.tsx)", () => {
  it("exports expected metadata", () => {
    expect(metadata.title).toBe("Bowl Tmnts DB");
    expect(metadata.description).toBe("Bowling Tournaments Database");
  });

  it("renders html/lang, body class, providers, navbar, and children inside Container", () => {
    render(
      <RootLayout>
        <div data-testid="ChildContent">Hello</div>
      </RootLayout>
    );

    // Providers + ReduxProvider wrap everything
    expect(screen.getByTestId("ProvidersMock")).toBeInTheDocument();
    expect(screen.getByTestId("ReduxProviderMock")).toBeInTheDocument();

    // Navbar is present
    expect(screen.getByTestId("EaNavbarMock")).toBeInTheDocument();

    // Child content rendered
    expect(screen.getByTestId("ChildContent")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();

    // Child is inside Container with correct props
    const container = screen.getByTestId("ContainerMock");
    expect(container).toHaveAttribute("data-fluid", "true");
    expect(container).toHaveClass("py-3");
    expect(container).toContainElement(screen.getByTestId("ChildContent"));

    // main element exists
    const main = screen.getByTestId("main");
    expect(main).toBeInTheDocument();

    // Root layout returns <html lang="en"> and <body className=inter.className>
    expect(document.documentElement).toHaveAttribute("lang", "en");
    expect(document.body).toHaveClass("inter-mock-class");
  });
});
