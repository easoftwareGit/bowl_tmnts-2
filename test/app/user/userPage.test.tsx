import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock the child form so this test is only about page layout + composition
jest.mock("@/app/user/acctInfo/form", () => ({
  __esModule: true,
  default: () => <div data-testid="AcctInfoFormMock" />,
}));

import AcctInfoPage from "@/app/user/acctInfo/page";

describe("AcctInfoPage (page.tsx)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the AcctInfoForm inside the page", () => {
    render(<AcctInfoPage />);

    const page = screen.getByTestId("acct-info-page");
    expect(page).toBeInTheDocument();
    expect(page).toHaveClass("d-flex", "flex-column", "align-items-center");

    const card = screen.getByTestId("acct-info-form");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("shadow", "p-3", "m-5", "rounded-3");

    expect(within(card).getByTestId("AcctInfoFormMock")).toBeInTheDocument();
  });
});
