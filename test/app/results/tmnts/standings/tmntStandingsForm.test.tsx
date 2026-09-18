import { fireEvent, render, screen, within } from "@testing-library/react";
import TmntStandingsForm from "@/app/results/tmnt/[tmntId]/standings/tmntStandingsForm";
import { populateStandingsRows } from "@/app/results/tmnt/[tmntId]/standings/populateStandingsRows";
import { getGameNums } from "@/components/tmnts/games";
import type {
  TmntGameResult,
  TmntStandingsTableRow,
} from "@/lib/types/resultsTypes";
import type { divPfType } from "@/lib/types/types";
import {
  divId1,
  divId2,
  mockDivPfs,
  mockTmntFullData,
  playerId1,
  playerId2,
  playerId3,
  tmntId,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

jest.mock(
  "@/app/results/tmnt/[tmntId]/standings/populateStandingsRows",
  () => ({
    populateStandingsRows: jest.fn(),
  }),
);

jest.mock("@/components/tmnts/games", () => ({
  getGameNums: jest.fn(),
}));

const mockPopulateStandingsRows =
  populateStandingsRows as jest.MockedFunction<typeof populateStandingsRows>;

const mockGetGameNums =
  getGameNums as jest.MockedFunction<typeof getGameNums>;

const scratchDiv = mockTmntFullData.divs.find(
  (div) => div.id === divId1,
)!;

const hdcpDiv = mockTmntFullData.divs.find(
  (div) => div.id === divId2,
)!;

/*
 * TmntStandingsForm only uses div_id directly from tmntResults.
 *
 * getGameNums() and populateStandingsRows() are mocked in these tests,
 * so the remaining TmntGameResult properties are not important to this
 * component test.
 */
const makeTmntResult = (
  playerId: string,
  divId: string,
  fullName: string,
): TmntGameResult =>
  ({
    player_id: playerId,
    div_id: divId,
    full_name: fullName,
  }) as TmntGameResult;

const mockTmntResults: TmntGameResult[] = [
  makeTmntResult(playerId1, divId1, "John Doe"),
  makeTmntResult(playerId2, divId1, "Jane Doe"),
  makeTmntResult(playerId3, divId2, "Joe Doe"),
];

const standingsRows: TmntStandingsTableRow[] = [
  {
    id: playerId1,
    player_id: playerId1,
    full_name: "John Doe",
    average: 200,
    hdcp: 0,
    position: 2,
    total: 604,
    total_hdcp: 0,
    total_plus_total_hdcp: 604,
    plus_minus: "+4",
    prize: "$120.00",
    "Game 1": 200,
    "Game 2": 201,
    "Game 3": 203,
  },
  {
    id: playerId2,
    player_id: playerId2,
    full_name: "Jane Doe",
    average: 210,
    hdcp: 0,
    position: 1,
    total: 633,
    total_hdcp: 0,
    total_plus_total_hdcp: 633,
    plus_minus: "+33",
    prize: "$212.00",
    "Game 1": 210,
    "Game 2": 211,
    "Game 3": 212,
  },
];

const hdcpStandingsRows: TmntStandingsTableRow[] = [
  {
    id: playerId1,
    player_id: playerId1,
    full_name: "John Doe",
    average: 200,
    hdcp: 25,
    position: 1,
    total: 675,
    total_hdcp: 75,
    total_plus_total_hdcp: 750,
    plus_minus: "+75",
    prize: "",
    "Game 1": 220,
    "Game 2": 225,
    "Game 3": 230,
  },
  {
    id: playerId2,
    player_id: playerId2,
    full_name: "Jane Doe",
    average: 210,
    hdcp: 40,
    position: 2,
    total: 645,
    total_hdcp: 120,
    total_plus_total_hdcp: 765,
    plus_minus: "+45",
    prize: "",
    "Game 1": 210,
    "Game 2": 215,
    "Game 3": 220,
  },
];

const getBodyRows = () => {
  const table = screen.getByRole("table");
  const rows = within(table).getAllByRole("row");

  // First row is the table header.
  return rows.slice(1);
};

const getPlayerNames = (): string[] => {
  return getBodyRows().map((row) => {
    const cells = within(row).getAllByRole("cell");

    // Player name is the second column.
    return cells[1].textContent ?? "";
  });
};

const setupScratch = (
  rows: TmntStandingsTableRow[] = standingsRows,
  divPfs: divPfType[] = mockDivPfs,
) => {
  mockGetGameNums.mockReturnValue([1, 2, 3]);
  mockPopulateStandingsRows.mockReturnValue(rows);

  return render(
    <TmntStandingsForm
      tmntId={tmntId}
      div={scratchDiv}
      tmntResults={mockTmntResults}
      divPfs={divPfs}
    />,
  );
};

const setupHdcp = (
  rows: TmntStandingsTableRow[] = hdcpStandingsRows,
) => {
  mockGetGameNums.mockReturnValue([1, 2, 3]);
  mockPopulateStandingsRows.mockReturnValue(rows);

  return render(
    <TmntStandingsForm
      tmntId={tmntId}
      div={hdcpDiv}
      tmntResults={mockTmntResults}
      divPfs={mockDivPfs}
    />,
  );
};

describe("TmntStandingsForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("data filtering", () => {
    it("passes only the selected division results to populateStandingsRows", () => {
      setupScratch();

      expect(mockPopulateStandingsRows).toHaveBeenCalledTimes(1);

      const [justDiv] = mockPopulateStandingsRows.mock.calls[0];

      expect(justDiv).toHaveLength(2);

      expect(
        justDiv.every((result) => result.div_id === divId1),
      ).toBe(true);

      expect(justDiv.map((result) => result.player_id)).toEqual([
        playerId1,
        playerId2,
      ]);
    });

    it("passes only the selected division prize funds to populateStandingsRows", () => {
      const otherDivPf: divPfType = {
        ...mockDivPfs[0],
        id: "dpf_other_division",
        div_id: divId2,
      };

      setupScratch(standingsRows, [
        ...mockDivPfs,
        otherDivPf,
      ]);

      const [, justDivPfs] =
        mockPopulateStandingsRows.mock.calls[0];

      expect(justDivPfs).toHaveLength(2);

      expect(
        justDivPfs.every((pf) => pf.div_id === divId1),
      ).toBe(true);
    });
  });

  describe("table headings", () => {
    it("renders the player, game, total, plus-minus, and prize headings for a scratch division", () => {
      setupScratch();

      expect(
        screen.getByRole("button", { name: "Player" }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: "Total" }),
      ).toBeInTheDocument();

      expect(screen.getByText("+/-")).toBeInTheDocument();
      expect(screen.getByText("Prize")).toBeInTheDocument();

      expect(
        screen.queryByRole("button", { name: "Scratch" }),
      ).not.toBeInTheDocument();
    });

    it("renders the Scratch column for a handicap division", () => {
      setupHdcp();

      expect(
        screen.getByRole("button", { name: "Scratch" }),
      ).toBeInTheDocument();

      expect(
        screen.queryByText("+/-"),
      ).not.toBeInTheDocument();
    });

    it("renders a heading for each game returned by getGameNums", () => {
      setupScratch();

      const table = screen.getByRole("table");
      const headers = within(table).getAllByRole("columnheader");

      expect(
        headers.some((header) => header.textContent === "1"),
      ).toBe(true);

      expect(
        headers.some((header) => header.textContent === "2"),
      ).toBe(true);

      expect(
        headers.some((header) => header.textContent === "3"),
      ).toBe(true);
    });
  });

  describe("standings rows", () => {
    it("renders the standings player names", () => {
      setupScratch();

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    });

    it("renders the game scores", () => {
      setupScratch();

      expect(screen.getByText("200")).toBeInTheDocument();
      expect(screen.getByText("201")).toBeInTheDocument();
      expect(screen.getByText("203")).toBeInTheDocument();

      expect(screen.getByText("210")).toBeInTheDocument();
      expect(screen.getByText("211")).toBeInTheDocument();
      expect(screen.getByText("212")).toBeInTheDocument();
    });

    it("renders plus-minus for a scratch division", () => {
      setupScratch();

      expect(screen.getByText("+33")).toBeInTheDocument();
      expect(screen.getByText("+4")).toBeInTheDocument();
    });

    it("renders prize amounts", () => {
      setupScratch();

      expect(screen.getByText("$212.00")).toBeInTheDocument();
      expect(screen.getByText("$120.00")).toBeInTheDocument();
    });

    it("does not render plus-minus cells for a handicap division", () => {
      setupHdcp();

      expect(screen.queryByText("+75")).not.toBeInTheDocument();
      expect(screen.queryByText("+15")).not.toBeInTheDocument();
    });

    it("renders scratch totals for a handicap division", () => {
      setupHdcp();

      expect(screen.getByText("645")).toBeInTheDocument();
      expect(screen.getByText("675")).toBeInTheDocument();
    });
  });

  describe("player result links", () => {
    it("links the total to the player's standings page", () => {
      setupScratch();

      const link = screen.getByRole("link", {
        name: "633",
      });

      expect(link).toHaveAttribute(
        "href",
        `/results/tmnt/${tmntId}/standings/div/${divId1}/player/${playerId2}`,
      );
    });
  });

  describe("sorting", () => {
    it("initially sorts by total descending", () => {
      setupScratch();

      expect(getPlayerNames()).toEqual([
        "Jane Doe",
        "John Doe",
      ]);
    });

    it("sorts by player name when Player is clicked", () => {
      setupScratch();

      fireEvent.click(
        screen.getByRole("button", { name: "Player" }),
      );

      expect(getPlayerNames()).toEqual([
        "Jane Doe",
        "John Doe",
      ]);
    });

    it("sorts by scratch total when Scratch is clicked", () => {
      setupHdcp();

      /*
       * Handicap total order:
       *
       * Jane = 765
       * John = 750
       *
       * Initial order should therefore be Jane, John.
       */
      expect(getPlayerNames()).toEqual([
        "Jane Doe",
        "John Doe",        
      ]);

      fireEvent.click(
        screen.getByRole("button", { name: "Scratch" }),
      );

      /*
       * Scratch total order:
       *
       * Jane = 645
       * John = 675
       */
      expect(getPlayerNames()).toEqual([        
        "John Doe",
        "Jane Doe",
      ]);
    });

    it("sorts by total when Total is clicked", () => {
      setupHdcp();

      fireEvent.click(
        screen.getByRole("button", { name: "Scratch" }),
      );

      expect(getPlayerNames()).toEqual([
        "John Doe",
        "Jane Doe",        
      ]);

      fireEvent.click(
        screen.getByRole("button", { name: "Total" }),
      );

      expect(getPlayerNames()).toEqual([
        "Jane Doe",
        "John Doe",        
      ]);
    });
  });

  describe("cash line", () => {
    it("adds cut-row to the last cashing row", () => {
      setupScratch();

      /*
       * mockDivPfs contains two prize positions.
       *
       * lastCashRow = 2 - 1 = 1.
       *
       * Therefore the second displayed row gets cut-row.
       */
      const rows = getBodyRows();

      expect(rows).toHaveLength(2);

      expect(rows[0]).not.toHaveClass("cut-row");
      expect(rows[1]).toHaveClass("cut-row");
    });
  });

  describe("column widths", () => {
    it("uses a 90px prize column when first prize is less than $1,000", () => {
      setupScratch();

      const prizeHeader = screen.getByText("Prize");

      expect(prizeHeader).toHaveStyle({
        width: "90px",
      });
    });

    it("uses a 130px prize column when first prize is at least $1,000 and less than $10,000", () => {
      const divPfs: divPfType[] = [
        {
          ...mockDivPfs[0],
          amount: 1500,
        },
      ];

      setupScratch(standingsRows, divPfs);

      expect(screen.getByText("Prize")).toHaveStyle({
        width: "130px",
      });
    });

    it("uses a 180px prize column when first prize is at least $10,000", () => {
      const divPfs: divPfType[] = [
        {
          ...mockDivPfs[0],
          amount: 10000,
        },
      ];

      setupScratch(standingsRows, divPfs);

      expect(screen.getByText("Prize")).toHaveStyle({
        width: "180px",
      });
    });

    it("uses a 90px prize column when there are no prize funds", () => {
      setupScratch(standingsRows, []);

      expect(screen.getByText("Prize")).toHaveStyle({
        width: "90px",
      });
    });
  });
});