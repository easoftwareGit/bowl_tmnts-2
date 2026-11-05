// test/app/layout.test.tsx
// tests src/app/layout.tsx
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

// Navbar: don't pull in next-auth, routing, etc. for layout test
jest.mock("@/components/navBar/eaNavbar", () => ({
  __esModule: true,
  default: () => <nav data-testid="EaNavbarMock">EaNavbar</nav>,
}));

// Bootstrap Container wrapper
jest.mock("@/components/bootstrap", () => ({
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

function renderLayout(
  children: React.ReactNode = <div data-testid="ChildContent">Hello</div>
) {
  return render(<RootLayout>{children}</RootLayout>);
}

describe("RootLayout (src/app/layout.tsx)", () => {
  it("exports expected metadata", () => {
    expect(metadata.title).toBe("Bowl Tmnts DB");
    expect(metadata.description).toBe("Bowling Tournaments Database");
  });

  it("is synchronous, so public pages can be statically rendered", () => {
    // If auth() (or anything awaited) is added back, RootLayout returns a Promise
    // and every route becomes dynamic.
    const result = RootLayout({ children: <div /> });
    expect(result).not.toBeInstanceOf(Promise);
  });

  it("sets html lang and the Inter font class on body", () => {
    renderLayout();
    expect(document.documentElement).toHaveAttribute("lang", "en");
    expect(document.body).toHaveClass("inter-mock-class");
  });

  it("nests Providers > ReduxProvider > (navbar + main)", () => {
    renderLayout();
    const providers = screen.getByTestId("ProvidersMock");
    const redux = screen.getByTestId("ReduxProviderMock");
    const navbar = screen.getByTestId("EaNavbarMock");
    const main = screen.getByRole("main");

    expect(providers).toContainElement(redux);
    expect(redux).toContainElement(navbar);
    expect(redux).toContainElement(main);
    // Navbar sits outside main
    expect(main).not.toContainElement(navbar);
  });

  it("renders a single main landmark with the expected test id", () => {
    renderLayout();
    const main = screen.getByRole("main");
    expect(main).toBe(screen.getByTestId("main"));
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  it("renders children inside a fluid Container with py-3, inside main", () => {
    renderLayout();
    const main = screen.getByRole("main");
    const container = screen.getByTestId("ContainerMock");
    const child = screen.getByTestId("ChildContent");

    expect(main).toContainElement(container);
    expect(container).toHaveAttribute("data-fluid", "true");
    expect(container).toHaveClass("py-3");
    expect(container).toContainElement(child);
    expect(child).toHaveTextContent("Hello");
  });

  it("renders multiple children in order", () => {
    renderLayout(
      <>
        <div data-testid="First">First</div>
        <div data-testid="Second">Second</div>
      </>
    );
    const container = screen.getByTestId("ContainerMock");
    expect(container).toContainElement(screen.getByTestId("First"));
    expect(container).toContainElement(screen.getByTestId("Second"));

    const texts = screen
      .getAllByText(/^(First|Second)$/)
      .map((el) => el.textContent);
    expect(texts).toEqual(["First", "Second"]);
  });
});

// import React from "react";
// import { render, screen } from "@testing-library/react";
// import "@testing-library/jest-dom";

// // ---------- mocks ----------

// // next/font/google -> Inter() normally runs Next font loader logic.
// // We just need a stable className string.
// jest.mock("next/font/google", () => ({
//   Inter: () => ({ className: "inter-mock-class" }),
// }));

// // Providers wrappers: make them transparent (render children)
// jest.mock("@/app/providers", () => ({
//   __esModule: true,
//   Providers: ({ children }: { children: React.ReactNode }) => (
//     <div data-testid="ProvidersMock">{children}</div>
//   ),
// }));

// jest.mock("@/redux/provider", () => ({
//   __esModule: true,
//   ReduxProvider: ({ children }: { children: React.ReactNode }) => (
//     <div data-testid="ReduxProviderMock">{children}</div>
//   ),
// }));

// // Navbar: don’t pull in next-auth, routing, etc. for layout test
// jest.mock("@/components/navBar/eaNavbar", () => ({
//   __esModule: true,
//   default: () => <nav data-testid="EaNavbarMock">EaNavbar</nav>,
// }));

// // Your bootstrap Container wrapper
// jest.mock("@/components/bootstrap", () => ({
//   __esModule: true,
//   Container: ({
//     children,
//     fluid,
//     className,
//   }: {
//     children: React.ReactNode;
//     fluid?: boolean;
//     className?: string;
//   }) => (
//     <div
//       data-testid="ContainerMock"
//       data-fluid={String(!!fluid)}
//       className={className}
//     >
//       {children}
//     </div>
//   ),
// }));

// // Import AFTER mocks, so it uses the mocks, not the real components
// import RootLayout, { metadata } from "@/app/layout";

// describe("RootLayout (src/app/layout.tsx)", () => {
//   it("exports expected metadata", () => {
//     expect(metadata.title).toBe("Bowl Tmnts DB");
//     expect(metadata.description).toBe("Bowling Tournaments Database");
//   });

//   it("renders html/lang, body class, providers, navbar, and children inside Container", () => {
//     render(
//       <RootLayout>
//         <div data-testid="ChildContent">Hello</div>
//       </RootLayout>
//     );

//     // Providers + ReduxProvider wrap everything
//     expect(screen.getByTestId("ProvidersMock")).toBeInTheDocument();
//     expect(screen.getByTestId("ReduxProviderMock")).toBeInTheDocument();

//     // Navbar is present
//     expect(screen.getByTestId("EaNavbarMock")).toBeInTheDocument();

//     // Child content rendered
//     expect(screen.getByTestId("ChildContent")).toBeInTheDocument();
//     expect(screen.getByText("Hello")).toBeInTheDocument();

//     // Child is inside Container with correct props
//     const container = screen.getByTestId("ContainerMock");
//     expect(container).toHaveAttribute("data-fluid", "true");
//     expect(container).toHaveClass("py-3");
//     expect(container).toContainElement(screen.getByTestId("ChildContent"));

//     // main element exists
//     const main = screen.getByTestId("main");
//     expect(main).toBeInTheDocument();

//     // Root layout returns <html lang="en"> and <body className=inter.className>
//     expect(document.documentElement).toHaveAttribute("lang", "en");
//     expect(document.body).toHaveClass("inter-mock-class");
//   });
// });
