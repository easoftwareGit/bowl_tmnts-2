import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { cloneDeep } from "lodash";
import PotSeries from "@/app/results/tmnt/[tmntId]/pots/potsSeries";
import { missingDataError } from "@/app/results/tmnt/[tmntId]/brackets/player/[playerId]/playerBrktData";
import { getGameNums } from "@/components/tmnts/games";
import { getPlayerName } from "@/lib/getName";
import { tmntGameResult } from "@/lib/types/resultsTypes";
import { potPfType, potType, tmntFullType } from "@/lib/types/types";
import { mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// ---------------------------------------------------------------------------
// mocks
// ---------------------------------------------------------------------------

// control which game columns are shown
jest.mock("@/components/tmnts/games", () => ({
  getGameNums: jest.fn(),
}));

// render error messages in a known element
jest.mock("@/app/results/tmnt/[tmntId]/brackets/player/[playerId]/playerBrktData", () => {
  const { createElement } = jest.requireActual<typeof import("react")>("react");
  return {
    missingDataError: jest.fn((msg: string) =>
      createElement("div", { "data-testid": "missing-data-error" }, msg)
    ),
  };
});

const mockGetGameNums = getGameNums as jest.MockedFunction<typeof getGameNums>;
const mockMissingDataError = missingDataError as jest.MockedFunction<typeof missingDataError>;

type potEntryRowType = tmntFullType["potEntries"][number];

// ---------------------------------------------------------------------------
// test data
// ---------------------------------------------------------------------------

describe("PotSeries", () => {
  let tmntFullData: tmntFullType;
  let pot: potType;
  let otherPot: potType;
  let potPfs: potPfType[];
  let tmntResults: tmntGameResult[];
  let p1: string;
  let p2: string;
  let p1Name: string;
  let p2Name: string;
  const outsiderId = "ply_99999999999999999999999999999999";
  const numGames = 3;
  const gameNums = [1, 2, 3];

  const makeResult = (
    player_id: string,
    games: number[],
    totalWithHdcp: number | null
  ): tmntGameResult => {
    const row: Record<string, unknown> = { player_id };
    games.forEach((score, i) => {
      row[`Game ${i + 1}`] = score;
    });
    row["total + Hdcp"] = totalWithHdcp;
    return row as unknown as tmntGameResult;
  };

  const makePotPf = (id: string, pot_id: string, amount: number): potPfType =>
    ({ id, pot_id, amount } as potPfType);

  const makePotEntry = (id: string, pot_id: string, player_id: string): potEntryRowType =>
    ({ id, pot_id, player_id } as potEntryRowType);

  const getGamesTable = () => screen.getByTestId("pot-series-games");
  const getTotalsTable = () => screen.getByTestId("pot-series-totals");
  // the prizes table has no test id; it is always the last of the 3 tables
  const getPrizesTable = () => screen.getAllByRole("table")[2];

  const renderPotSeries = (
    overrides: Partial<React.ComponentProps<typeof PotSeries>> = {}
  ) =>
    render(
      <PotSeries
        pot_id={pot.id}
        tmntFullData={tmntFullData}
        tmntResults={tmntResults}
        potPfs={potPfs}
        numGames={numGames}
        {...overrides}
      />
    );

  beforeEach(() => {
    jest.clearAllMocks();

    tmntFullData = cloneDeep(mockTmntFullData);
    pot = tmntFullData.pots[0];
    otherPot = tmntFullData.pots[1];

    p1 = tmntFullData.players[0].id;
    p2 = tmntFullData.players[1].id;
    p1Name = getPlayerName(tmntFullData.players, p1);
    p2Name = getPlayerName(tmntFullData.players, p2);

    // p1 and p2 are in this pot; outsider is only in the other pot
    tmntFullData.potEntries = [
      makePotEntry("pen_test_1", pot.id, p1),
      makePotEntry("pen_test_2", pot.id, p2),
      makePotEntry("pen_test_3", otherPot.id, outsiderId),
    ];

    // p1 listed first but p2 has the higher total
    tmntResults = [
      makeResult(p1, [201, 202, 203], 606),
      makeResult(p2, [211, 212, 213], 636),
      makeResult(outsiderId, [291, 292, 293], 876),
    ];

    // deliberately out of order; includes a prize fund for another pot
    potPfs = [
      makePotPf("ppf_test_low", pot.id, 250),
      makePotPf("ppf_test_high", pot.id, 1000),
      makePotPf("ppf_test_other", otherPot.id, 777),
      makePotPf("ppf_test_mid", pot.id, 500),
    ];

    mockGetGameNums.mockReturnValue(gameNums);
  });

  // -------------------------------------------------------------------------
  it("has test data the tests rely on", () => {
    expect(otherPot.id).not.toBe(pot.id);
    expect(tmntFullData.divs.find((d) => d.id === pot.div_id)).toBeDefined();
    expect(p1Name).not.toBe("");
    expect(p2Name).not.toBe("");
  });

  // -------------------------------------------------------------------------
  describe("missing data errors", () => {
    const expectError = (msg: string) => {
      expect(screen.getByTestId("missing-data-error")).toHaveTextContent(msg);
      expect(mockMissingDataError).toHaveBeenCalledWith(msg);
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    };

    it("returns an error when pot_id is missing", () => {
      renderPotSeries({ pot_id: "" });
      expectError("No pot id");
    });

    it("returns an error when tmntFullData is missing", () => {
      renderPotSeries({ tmntFullData: null as unknown as tmntFullType });
      expectError("No tournament data");
    });

    it("returns an error when tmntResults is missing", () => {
      renderPotSeries({ tmntResults: null as unknown as tmntGameResult[] });
      expectError("No pot results rows");
    });

    it("returns an error when potPfs is missing", () => {
      renderPotSeries({ potPfs: null as unknown as potPfType[] });
      expectError("No pot prize funds");
    });

    it("returns an error when numGames is 0", () => {
      renderPotSeries({ numGames: 0 });
      expectError("No number of games");
    });

    it("returns an error when the pot is not found", () => {
      const badId = "pot_00000000000000000000000000000000";
      renderPotSeries({ pot_id: badId });
      expectError("Could not find pot. Id: " + badId);
    });

    it("returns an error when the pot's div is not found", () => {
      tmntFullData.divs = tmntFullData.divs.filter((d) => d.id !== pot.div_id);
      renderPotSeries();
      expectError("Could not find div. Id: " + pot.div_id);
    });

    it("returns an error when potPfs is empty", () => {
      renderPotSeries({ potPfs: [] });
      expectError("No pot prize fund");
    });

    it("returns an error when no prize funds match the pot", () => {
      renderPotSeries({ potPfs: [makePotPf("ppf_test_other", otherPot.id, 777)] });
      expectError("No pot prize fund");
    });

    it("returns an error when there are no pot entries", () => {
      tmntFullData.potEntries = [];
      renderPotSeries();
      expectError("No pot players");
    });

    it("returns an error when no pot entries match the pot", () => {
      tmntFullData.potEntries = [makePotEntry("pen_test_3", otherPot.id, outsiderId)];
      renderPotSeries();
      expectError("No pot players");
    });
  });

  // -------------------------------------------------------------------------
  describe("render layout", () => {
    it("renders the wrappers, scroll container and columns row", () => {
      renderPotSeries();
      expect(screen.getByTestId("PotsOuterWrapper")).toHaveClass("pots-outer");
      expect(screen.getByTestId("PotsInnerWrapper")).toHaveClass("pots-inner");
      expect(screen.getByTestId("brkt-columns-scroll")).toHaveClass("overflow-x-auto");
      expect(screen.getByTestId("pot-columns-row")).toHaveClass(
        "d-flex",
        "flex-nowrap",
        "align-items-start"
      );
    });

    it("renders the games, totals and prizes tables", () => {
      renderPotSeries();
      expect(screen.getAllByRole("table")).toHaveLength(3);
      expect(mockMissingDataError).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  describe("render games table", () => {
    it("calls getGameNums with tmntResults", () => {
      renderPotSeries();
      expect(mockGetGameNums).toHaveBeenCalledWith(tmntResults);
    });

    it("renders a 40px header for each game number", () => {
      renderPotSeries();
      const headers = within(getGamesTable()).getAllByRole("columnheader");
      expect(headers).toHaveLength(gameNums.length);
      gameNums.forEach((gameNum, i) => {
        expect(headers[i]).toHaveTextContent(new RegExp(`^${gameNum}$`));
        expect(headers[i]).toHaveStyle({ width: "40px" });
        expect(headers[i]).toHaveClass("text-end", "align-middle", "game-header-align");
      });
    });

    it("renders only players in the pot, highest total first", () => {
      renderPotSeries();
      const cells = within(getGamesTable()).getAllByRole("cell");
      // 2 pot players x 3 games
      expect(cells).toHaveLength(6);
      // p2 (636) before p1 (606)
      ["211", "212", "213", "201", "202", "203"].forEach((score, i) => {
        expect(cells[i]).toHaveTextContent(new RegExp(`^${score}$`));
        expect(cells[i]).toHaveClass("text-end", "align-middle");
      });
      expect(within(getGamesTable()).queryByText("291")).not.toBeInTheDocument();
    });

    it("renders only the game columns returned by getGameNums", () => {
      mockGetGameNums.mockReturnValue([1, 2]);
      renderPotSeries();
      expect(within(getGamesTable()).getAllByRole("columnheader")).toHaveLength(2);
      expect(within(getGamesTable()).getAllByRole("cell")).toHaveLength(4);
      expect(within(getGamesTable()).queryByText("203")).not.toBeInTheDocument();
    });

    it("renders an empty cell when a game score is missing", () => {
      tmntResults = [makeResult(p1, [201, 202], 403), makeResult(p2, [211, 212, 213], 636)];
      renderPotSeries();
      const cells = within(getGamesTable()).getAllByRole("cell");
      // p2 (636) is the first row, p1 (403) the second; p1's game 3 cell is empty
      expect(cells[3]).toHaveTextContent(/^201$/);
      expect(cells[5]).toBeEmptyDOMElement();
    });

    it("renders headers and no rows when there are no results", () => {
      mockGetGameNums.mockReturnValue([]);
      renderPotSeries({ tmntResults: [] });
      expect(within(getGamesTable()).queryAllByRole("cell")).toHaveLength(0);
      expect(mockMissingDataError).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  describe("render totals table", () => {
    it("renders the 'Total' header", () => {
      renderPotSeries();
      const header = within(getTotalsTable()).getByRole("columnheader", { name: "Total" });
      expect(header).toHaveClass("text-center", "align-middle");
    });

    it("renders player names and totals, highest total first", () => {
      renderPotSeries();
      const cells = within(getTotalsTable()).getAllByRole("cell");
      expect(cells).toHaveLength(2);
      expect(cells[0]).toHaveClass("align-middle");
      expect(within(cells[0]).getByText(p2Name)).toBeInTheDocument();
      expect(within(cells[0]).getByText("636")).toHaveClass("ms-auto", "ps-2", "text-nowrap");
      expect(within(cells[1]).getByText(p1Name)).toBeInTheDocument();
      expect(within(cells[1]).getByText("606")).toBeInTheDocument();
    });

    it("renders headers and no rows when there are no results", () => {
      renderPotSeries({ tmntResults: [] });
      expect(
        within(getTotalsTable()).getByRole("columnheader", { name: "Total" })
      ).toBeInTheDocument();
      expect(within(getTotalsTable()).queryAllByRole("cell")).toHaveLength(0);
    });

    it("does not render players who are not in the pot", () => {
      renderPotSeries();
      expect(within(getTotalsTable()).queryByText("876")).not.toBeInTheDocument();
    });

    it("sorts a null total as 0", () => {
      tmntResults = [makeResult(p1, [100, 100, 100], null), makeResult(p2, [50, 50, 50], 150)];
      renderPotSeries();
      const cells = within(getTotalsTable()).getAllByRole("cell");
      expect(within(cells[0]).getByText(p2Name)).toBeInTheDocument();
      expect(within(cells[1]).getByText(p1Name)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  describe("render prizes table", () => {
    it("renders the 'Total $' header with a 100px width", () => {
      renderPotSeries();
      const header = screen.getByRole("columnheader", { name: "Total $" });
      expect(header).toHaveStyle({ width: "100px" });
      expect(header).toHaveClass("text-center", "align-middle");
    });

    it("renders only the prize funds for this pot, highest to lowest", () => {
      renderPotSeries();
      const cells = within(getPrizesTable()).getAllByRole("cell");
      expect(cells).toHaveLength(3);
      expect(cells[0]).toHaveTextContent("$1,000.00");
      expect(cells[1]).toHaveTextContent("$500.00");
      expect(cells[2]).toHaveTextContent("$250.00");
      expect(within(getPrizesTable()).queryByText("$777.00")).not.toBeInTheDocument();
    });

    it("styles the payout amounts as success text", () => {
      renderPotSeries();
      within(getPrizesTable())
        .getAllByRole("cell")
        .forEach((cell) => {
          expect(cell).toHaveClass("text-center", "align-middle", "text-success");
        });
    });

    it("does not change the order of the potPfs prop", () => {
      const before = potPfs.map((pf) => pf.id);
      renderPotSeries();
      expect(potPfs.map((pf) => pf.id)).toEqual(before);
    });
  });
});