import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// mock react-redux useSelector
let mockState: any = {};

jest.mock("react-redux", () => {
  const actual = jest.requireActual("react-redux");
  return {
    ...actual,
    useSelector: (selector: any) => selector(mockState),
  };
});

// mock selectors from slice
const mockGetStatus = jest.fn();
const mockGetError = jest.fn();

jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => ({
  getTmntFullDataLoadStatus: (state: any) => mockGetStatus(state),
  getTmntFullDataError: (state: any) => mockGetError(state),
}));

// mock sfCreatePlayerColumns helpers
jest.mock("@/app/dataEntry/playersForm/sfCreatePlayerColumns", () => ({
  feeColNameEnd: "_fee",
  entryFeeColName: (id: string) => `${id}_fee`,
  entryNumBrktsColName: (id: string) => `${id}_num_brkts`,  
  playerEntryData: {},
}));

// mock getName helpers
jest.mock("@/lib/getName", () => ({
  getPotName: (pot: any) => `POT:${pot.pot_type ?? pot.id}`,
  getBrktOrElimName: (obj: any) => `NAME:${obj.brkt_name ?? obj.elim_name ?? obj.id}`,
}));

// mock populatePlayerRows (controls "rows" used by the page)
const mockPopulatePlayerRows = jest.fn();
jest.mock("@/app/dataEntry/playersForm/populatePlayerRows", () => ({
  populatePlayerRows: (tmntFullData: any) =>
    mockPopulatePlayerRows(tmntFullData),
}));

/**
 * PlayersEntryForm mock:
 * - stores last props so tests can call findCountError() directly
 * - provides buttons to call setRows() to simulate user edits
 */
let lastPlayersEntryFormProps: any = null;

jest.mock("@/app/dataEntry/playersForm/playersForm", () => ({
  __esModule: true,
  default: (props: any) => {
    lastPlayersEntryFormProps = props;

    return (
      <div data-testid="PlayersEntryFormMock">
        <div data-testid="rowsLen">
          {props.rows?.length ?? -1}
        </div>

        <div data-testid="enableEditing">
          {String(props.enableEditing)}
        </div>

        <button
          type="button"
          onClick={() =>
            props.onNavigateAfterSave?.()
          }
        >
          Trigger Navigate After Save
        </button>

        <button
          type="button"
          onClick={() =>
            props.setRows([
              ...(props.rows ?? []),
              { id: "new_row" },
            ])
          }
        >
          Add Row
        </button>

        <button
          type="button"
          onClick={() =>
            props.setRows([{ id: "edited_only" }])
          }
        >
          Replace Rows
        </button>
      </div>
    );
  },
}));

// mock createByePlayer
jest.mock("@/components/brackets/byePlayer", () => ({
  __esModule: true,
  createByePlayer: (squadId: string) => ({ id: "bye", squad_id: squadId }),
}));

// mock WaitModal
jest.mock("@/components/modal/waitModal", () => ({
  __esModule: true,
  default: ({ show, message }: { show: boolean; message: string }) =>
    show ? <div data-testid="WaitModalMock">{message}</div> : null,
}));

// mock usePreventUnload (side-effect hook)
const mockUseUnsavedChangesGuard = jest.fn();

jest.mock("@/hooks/useUnsavedChangesGuard", () => ({
  useUnsavedChangesGuard: (...args: any[]) =>
    mockUseUnsavedChangesGuard(...args),
}));

// mock BracketList class
// buildBrktList constructs these and calls calcTotalBrkts(rows)
jest.mock("@/components/brackets/bracketListClass", () => {
  class BracketList {
    id: string;
    brackets: any[];
    brktEntries: any[];
    fullCount: number;
    oneByeCount: number;
    playersWithRefunds: boolean;

    constructor(id: string) {
      this.id = id;
      this.brackets = [];
      this.brktEntries = [];
      this.fullCount = 0;
      this.oneByeCount = 0;
      this.playersWithRefunds = false;
    }

    calcTotalBrkts(rows: any[]) {
      // deterministically set values based on rows length
      this.brktEntries = new Array(rows?.length ?? 0).fill({});

      // deterministic “counts”
      this.fullCount = Math.max(0, (rows?.length ?? 0) - 1);
      this.oneByeCount = rows?.length ? 1 : 0;

      // make refunds show for bracket id "brk_1"
      this.playersWithRefunds = this.id === "brk_1";
    }
  }

  return { BracketList };
});

// mock initVals used by buildBrktList ctor args
jest.mock("@/lib/db/initVals", () => ({
  defaultBrktGames: 3,
  defaultPlayersPerMatch: 2,
}));

/**
 * react-bootstrap mock:
 * - renders children
 * - exposes current activeKey in DOM
 * - provides a button to invoke onSelect for tab switching test
 */
jest.mock("react-bootstrap", () => ({
  OverlayTrigger: ({ children }: any) => (
    <span data-testid="OverlayTriggerMock">{children}</span>
  ),
  Tooltip: ({ children }: any) => (
    <span data-testid="TooltipMock">{children}</span>
  ),
  Tabs: ({ children, activeKey, onSelect }: any) => (
    <div data-testid="TabsMock">
      <div data-testid="ActiveTabKey">{String(activeKey)}</div>
      <button type="button" onClick={() => onSelect?.("pots")}>
        Select Pots
      </button>
      {children}
    </div>
  ),
  Tab: ({ children, eventKey, title }: any) => (
    <section data-testid={`Tab-${eventKey}`}>
      <h3>{title}</h3>
      {children}
    </section>
  ),
}));

const mockGetSquadStage = jest.fn();

jest.mock("@/app/dataEntry/tmntForm/tmntTools", () => ({
  getSquadStage: (...args: any[]) =>
    mockGetSquadStage(...args),
}));

import EditPlayersPage from "@/app/dataEntry/editPlayers/[tmntId]/page";
import { SquadStage } from "@prisma/client";

// test fixtures
const makeTmntFullData = (overrides: Partial<any> = {}) => ({
  squads: [{ id: "sqd_1" }],
  divs: [{ id: "div_1", div_name: "Scratch" }],
  pots: [{ id: "pot_1", pot_type: "Game" }],
  brkts: [{ id: "brk_1", brkt_name: "A Bracket" }],
  elims: [{ id: "elm_1", elim_name: "Elim A" }],
  ...overrides,
});

describe("EditPlayersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockState = {
      tmntFullData: {
        tmntFullData: null,
      },
    };

    mockPopulatePlayerRows.mockReturnValue([]);
    mockGetStatus.mockReturnValue("idle");
    mockGetError.mockReturnValue(null);
    mockGetSquadStage.mockResolvedValue(SquadStage.SCORES);
  });

  it("shows WaitModal when load status is loading", () => {
    mockGetStatus.mockReturnValue("loading");
    mockGetError.mockReturnValue(null);

    render(<EditPlayersPage />);

    expect(screen.getByTestId("WaitModalMock")).toHaveTextContent(
      "Loading Tournament configuration..."
    );
  });

  it("shows error message when not loading/succeeded and tmntError is present", () => {
    mockGetStatus.mockReturnValue("failed");
    mockGetError.mockReturnValue("boom");

    render(<EditPlayersPage />);

    expect(screen.getByText("Tmnt Error: boom")).toBeInTheDocument();
  });

  it("when succeeded: renders PlayersEntryForm and computed Div/Pot/Brkt/Elim counts", async () => {
    const tmntFullData = makeTmntFullData();

    mockState = {
      tmntFullData: {
        tmntFullData,
      },
    };

    mockGetStatus.mockReturnValue("succeeded");
    mockGetError.mockReturnValue(null);

    // rows used to compute counts:
    // - fee columns: count rows where value > 0
    // - num_brkts columns: sum values across rows
    mockPopulatePlayerRows.mockReturnValue([
      { id: "r1",  div_1_fee: 10, pot_1_fee: 0, elm_1_fee: 5, brk_1_num_brkts: 2 },
      { id: "r2", div_1_fee: 0, pot_1_fee: 20, elm_1_fee: 0, brk_1_num_brkts: 1 },
      { id: "r3", div_1_fee: 10, pot_1_fee: 20, elm_1_fee: 0, brk_1_num_brkts: 0 },
    ]);

    render(<EditPlayersPage />);

    // succeeded UI
    expect(await screen.findByRole("heading", { name: "Bowlers" })).toBeInTheDocument();
    expect(screen.getByTestId("PlayersEntryFormMock")).toBeInTheDocument();

    // PlayersEntryForm got rows
    expect(screen.getByTestId("rowsLen")).toHaveTextContent("3");
    
    // Wait for the rows-driven effect to compute counts and render into inputs
    // Div fee count: div_1_fee has >0 in r1 and r3 => 2
    await waitFor(() => {                               
      expect(screen.getByTestId("inputDivEntryCountdiv_1")).toBeInTheDocument();      
    });
    expect(screen.getByTestId("inputDivEntryCountdiv_1")).toHaveValue("2");

    // Pot fee count: pot_1_fee has >0 in r2 and r3 => 2
    await waitFor(() => {
      expect(screen.getByTestId("inputPotEntryCountpot_1")).toBeInTheDocument();
    });
    expect(screen.getByTestId("inputPotEntryCountpot_1")).toHaveValue("2");

    // Elim fee count: elm_1_fee has >0 only in r1 => 1
    await waitFor(() => {
      expect(screen.getByTestId("inputElimEntryCountelm_1")).toBeInTheDocument();
    });
    expect(screen.getByTestId("inputElimEntryCountelm_1")).toHaveValue("1");

    // Bracket counts come from BracketList mock:
    // brktEntries.length === rows.length => 3
    // fullCount === rows.length - 1 => 2
    // oneByeCount === 1
    // total === 3
    // Wait until the Brackets tab content is rendered (since Tabs is mocked to always render children)
    await screen.findByText("Brackets");

    // Now query the specific inputs by label + displayed value   
    expect(screen.getByTestId("inputPlayersCountbrk_1")).toHaveValue("3");
    expect(screen.getByTestId("inputFullCountbrk_1")).toHaveValue("2");
    expect(screen.getByTestId("inputOneByeCountbrk_1")).toHaveValue("1");
    expect(screen.getByTestId("inputTotalCountbrk_1")).toHaveValue("3");
    
    // refunds marker should appear for bracket brk_1 (per our mock BracketList)
    // In your code it renders: <span className="popup-help">&nbsp;*&nbsp;</span>
    const brkTab = screen.getByTestId("Tab-brkts");    
    expect(within(brkTab).getByText(/\*/)).toBeInTheDocument();

    // usePreventUnload should be wired up with a boolean
    expect(mockUseUnsavedChangesGuard)
      .toHaveBeenCalled();

    expect(
      typeof mockUseUnsavedChangesGuard.mock.calls[0]?.[0]
    ).toBe("boolean");
  });

  it("when fetchTmntFullData fails: renders error message and no main UI", () => {
    // Simulate thunk failure state
    mockGetStatus.mockReturnValue("failed");
    mockGetError.mockReturnValue("Tournament not found");

    // Redux state content does not matter in failed state,
    // but we keep it realistic
    mockState = {
      tmntFullData: {
        tmntFullData: null,
      },
    };

    render(<EditPlayersPage />);

    // Error message should be shown
    expect(
      screen.getByText("Tmnt Error: Tournament not found")
    ).toBeInTheDocument();

    // Loading modal should NOT be shown
    expect(screen.queryByTestId("WaitModalMock")).not.toBeInTheDocument();

    // Main succeeded UI should NOT render
    expect(
      screen.queryByRole("heading", { name: "Bowlers" })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId("PlayersEntryFormMock")
    ).not.toBeInTheDocument();
  });

  it("does not render refund asterisk when BracketList.playersWithRefunds is false", async () => {
    const tmntFullData = makeTmntFullData();
    tmntFullData.brkts = [{ id: "brk_2", brkt_name: "No Refund Bracket" }];

    mockState = { tmntFullData: { tmntFullData } };
    mockGetStatus.mockReturnValue("succeeded");
    mockGetError.mockReturnValue(null);

    mockPopulatePlayerRows.mockReturnValue([
      { id: "r1", div_1_fee: 10, pot_1_fee: 0, elm_1_fee: 0, brk_2_num_brkts: 1 },
    ]);

    render(<EditPlayersPage />);

    await screen.findByText("Brackets");
    const brkTab = screen.getByTestId("Tab-brkts");

    expect(within(brkTab).queryByText(/\*/)).not.toBeInTheDocument();
  });

  it("calls useUnsavedChangesGuard with a boolean hasUnsavedChanges value", async () => {
    const user = userEvent.setup();

    const tmntFullData = makeTmntFullData();

    mockState = {
      tmntFullData: {
        tmntFullData,
      },
    };

    mockGetStatus.mockReturnValue("succeeded");
    mockGetError.mockReturnValue(null);

    mockPopulatePlayerRows.mockReturnValue([
      {
        id: "r1",
        div_1_fee: 10,
        pot_1_fee: 0,
        elm_1_fee: 0,
        brk_1_num_brkts: 1,
      },
    ]);

    render(<EditPlayersPage />);

    await screen.findByTestId("PlayersEntryFormMock");

    await waitFor(() => {
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(false);
    });

    await user.click(
      screen.getByRole("button", { name: "Add Row" }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("rowsLen")).toHaveTextContent("2");
    });

    await waitFor(() => {
      expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith(true);
    });
  });
  
  it("does not overwrite user-edited rows if redux tmntFullData changes after initialization", async () => {
    const user = userEvent.setup();

    // first load
    const tmntFullDataV1 = makeTmntFullData();
    mockState = { tmntFullData: { tmntFullData: tmntFullDataV1 } };
    mockGetStatus.mockReturnValue("succeeded");
    mockGetError.mockReturnValue(null);

    // initial populateRows gives 1 row
    mockPopulatePlayerRows.mockReturnValue([{ id: "r1" }]);

    const { rerender } = render(<EditPlayersPage />);

    await screen.findByTestId("PlayersEntryFormMock");
    await waitFor(() => {
      expect(screen.getByTestId("rowsLen")).toHaveTextContent("1");
    });

    // user edits rows locally -> now length 2
    await user.click(screen.getByRole("button", { name: "Add Row" }));

    await waitFor(() => {
      expect(screen.getByTestId("rowsLen")).toHaveTextContent("2");
    });

    // now simulate redux update (new object reference)
    const tmntFullDataV2 = makeTmntFullData({
      divs: [{ id: "div_1", div_name: "Updated" }],
    });
    mockState = { tmntFullData: { tmntFullData: tmntFullDataV2 } };

    // populateRows would try to reset to 1 row (or anything different)
    mockPopulatePlayerRows.mockReturnValue([{ id: "rA" }]);

    rerender(<EditPlayersPage />);

    // should still be the user-edited rows (length 2), not overwritten
    await waitFor(() => {
      expect(screen.getByTestId("rowsLen")).toHaveTextContent("2");
    });
  });

  it("updates tabKey when Tabs onSelect fires", async () => {
    const tmntFullData = makeTmntFullData();
    mockState = { tmntFullData: { tmntFullData } };
    mockGetStatus.mockReturnValue("succeeded");
    mockGetError.mockReturnValue(null);

    mockPopulatePlayerRows.mockReturnValue([{ id: "r1" }]);

    render(<EditPlayersPage />);

    await screen.findByTestId("TabsMock");

    // default
    expect(screen.getByTestId("ActiveTabKey")).toHaveTextContent("divs");

    // trigger onSelect("pots") via Tabs mock
    screen.getByRole("button", { name: "Select Pots" }).click();

    await waitFor(() => {
      expect(screen.getByTestId("ActiveTabKey")).toHaveTextContent("pots");
    });
  });  

  it("throws when succeeded but tmntFullData is null", () => {
    mockState = {
      tmntFullData: {
        tmntFullData: null,
      },
    };

    mockGetStatus.mockReturnValue("succeeded");
    mockGetError.mockReturnValue(null);

    expect(() => render(<EditPlayersPage />)).toThrow(
      "EditPlayersPage: tournament data is required",
    );
  });  

  it("throws when tournament squads data is missing", () => {
    mockState = {
      tmntFullData: {
        tmntFullData: makeTmntFullData({
          squads: undefined,
        }),
      },
    };

    mockGetStatus.mockReturnValue("succeeded");
    mockGetError.mockReturnValue(null);

    expect(() => render(<EditPlayersPage />)).toThrow(
      "EditPlayersPage: squads data is required",
    );
  });  

  it("throws when tournament has no squads", () => {
    mockState = {
      tmntFullData: {
        tmntFullData: makeTmntFullData({
          squads: [],
        }),
      },
    };

    mockGetStatus.mockReturnValue("succeeded");
    mockGetError.mockReturnValue(null);

    expect(() => render(<EditPlayersPage />)).toThrow(
      "EditPlayersPage: tournament must contain at least one squad",
    );
  });
    
  it("throws when first squad has no id", () => {
    mockState = {
      tmntFullData: {
        tmntFullData: makeTmntFullData({
          squads: [{}],
        }),
      },
    };

    mockGetStatus.mockReturnValue("succeeded");
    mockGetError.mockReturnValue(null);

    expect(() => render(<EditPlayersPage />)).toThrow(
      "EditPlayersPage: first squad must contain an id",
    );
  });  

  it("keeps enableEditing true during navigate-after-save transition", async () => {
    const user = userEvent.setup();

    const tmntFullData = makeTmntFullData({
      squads: [{ id: "sqd_1" }],
    });

    mockState = {
      tmntFullData: {
        tmntFullData,
      },
    };

    mockGetStatus.mockReturnValue("succeeded");
    mockGetError.mockReturnValue(null);

    // readonly stage
    mockGetSquadStage.mockResolvedValue(SquadStage.SCORES);

    mockPopulatePlayerRows.mockReturnValue([{ id: "r1" }]);

    render(<EditPlayersPage />);

    await screen.findByTestId("PlayersEntryFormMock");

    // initially readonly because stage === SCORES
    await waitFor(() => {
      expect(screen.getByTestId("enableEditing"))
        .toHaveTextContent("false");
    });

    // simulate child callback
    await user.click(
      screen.getByRole("button", {
        name: "Trigger Navigate After Save",
      })
    );

    // should temporarily force enableEditing=true
    await waitFor(() => {
      expect(screen.getByTestId("enableEditing"))
        .toHaveTextContent("true");
    });
  });  

});