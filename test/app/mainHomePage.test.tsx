// test/app/mainHomePage.test.tsx
// tests for src/app/page.tsx
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Home - Page", () => {
  it("renders the page heading as an h1", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { level: 1, name: /home page/i })
    ).toBeInTheDocument();
  });

  it("renders exactly one h1", () => {
    render(<Home />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});