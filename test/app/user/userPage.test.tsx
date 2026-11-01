import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import AcctInfoPage from "@/app/user/acctInfo/page";

// Mock the child form so this test is only about page layout + composition.
// The path must match the page's import ("./acctInfoForm"); the real form
// calls useSession and getAcctUserById, which have their own tests.
const acctInfoFormSpy = jest.fn();
jest.mock("@/app/user/acctInfo/acctInfoForm", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    acctInfoFormSpy(props);
    return <div data-testid="AcctInfoFormMock" />;
  },
}));

describe("AcctInfoPage (page.tsx)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the page container with its layout classes", () => {
    render(<AcctInfoPage />);

    const page = screen.getByTestId("acct-info-page");
    expect(page).toBeInTheDocument();
    expect(page).toHaveClass("d-flex", "flex-column", "align-items-center");
  });

  it("renders the form card inside the page", () => {
    render(<AcctInfoPage />);

    const page = screen.getByTestId("acct-info-page");
    const card = within(page).getByTestId("acct-info-form");
    expect(card).toHaveClass("shadow", "p-3", "m-5", "rounded-3");
  });

  it("renders the AcctInfoForm inside the card", () => {
    render(<AcctInfoPage />);

    const card = screen.getByTestId("acct-info-form");
    expect(within(card).getByTestId("AcctInfoFormMock")).toBeInTheDocument();
  });

  it("renders the AcctInfoForm once, with no props", () => {
    // the form gets the user id from the session itself
    render(<AcctInfoPage />);

    expect(screen.getAllByTestId("AcctInfoFormMock")).toHaveLength(1);
    expect(acctInfoFormSpy).toHaveBeenCalled();
    expect(acctInfoFormSpy.mock.calls[0][0]).toEqual({});
  });
});
