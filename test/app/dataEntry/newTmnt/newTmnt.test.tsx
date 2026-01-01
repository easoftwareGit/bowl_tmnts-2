import React from "react";
import { render, screen } from "@testing-library/react";
import NewTmntPage from "@/app/dataEntry/newTmnt/page";
import { tmntActions } from "@/lib/types/types";

// ---- Mocks ----
jest.mock("next-auth/react", () => ({
  __esModule: true,
  useSession: jest.fn(),
}));

jest.mock("@/app/dataEntry/tmntForm/tmntTools", () => ({
  __esModule: true,
  getBlankTmntFullData: jest.fn(),
}));

jest.mock("@/app/dataEntry/tmntForm/tmntForm", () => ({
  __esModule: true,
  default: jest.fn(({ tmntProps }: any) => (
    <div data-testid="TmntDataFormMock">
      {/* expose what the page passes down */}
      <pre data-testid="tmntPropsJson">{JSON.stringify(tmntProps)}</pre>
    </div>
  )),
}));

// import AFETR mocks so jest can replace the real imports with the mocks
import { useSession } from "next-auth/react";
import { getBlankTmntFullData } from "@/app/dataEntry/tmntForm/tmntTools";
import TmntDataForm from "@/app/dataEntry/tmntForm/tmntForm";

const mockUseSession = useSession as jest.Mock;
const mockGetBlank = getBlankTmntFullData as jest.Mock;
const mockTmntDataForm = TmntDataForm as unknown as jest.Mock;

describe("NewTmntPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const makeBlankTmnt = () => ({
    tmnt: { id: "tmt_1", user_id: "ORIG" },
    brktEntries: [],
    brktSeeds: [],
    brkts: [],
    divs: [],
    divEntries: [],
    elimEntries: [],
    elims: [],
    events: [],
    lanes: [],
    pots: [],
    potEntries: [],
    squads: [],
    players: [],
  });

  it('renders the heading "New Tournament"', () => {
    mockUseSession.mockReturnValue({ status: "unauthenticated", data: null });
    mockGetBlank.mockReturnValue(makeBlankTmnt());

    render(<NewTmntPage />);

    expect(
      screen.getByRole("heading", { name: /new tournament/i, level: 2 })
    ).toBeInTheDocument();
  });

  it("calls getBlankTmntFullData once", () => {
    mockUseSession.mockReturnValue({ status: "unauthenticated", data: null });
    mockGetBlank.mockReturnValue(makeBlankTmnt());

    render(<NewTmntPage />);

    expect(mockGetBlank).toHaveBeenCalledTimes(1);
  });

  it("passes tmntAction=New and sets user_id from the session user id", () => {
    mockUseSession.mockReturnValue({
      status: "authenticated",
      data: { user: { id: "usr_123" } },
    });

    const blank = makeBlankTmnt();
    mockGetBlank.mockReturnValue(blank);

    render(<NewTmntPage />);

    expect(mockTmntDataForm).toHaveBeenCalledTimes(1);

    // Inspect props passed to TmntDataForm
    const callArg = mockTmntDataForm.mock.calls[0][0];
    expect(callArg).toHaveProperty("tmntProps");

    const { tmntProps } = callArg;
    expect(tmntProps.tmntAction).toBe(tmntActions.New);
    expect(tmntProps.tmntFullData.tmnt.user_id).toBe("usr_123");
  });

});
