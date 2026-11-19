// test/app/results/tmnts/pots/potsSeries.test.tsx
// tests for src/app/results/tmnt/[tmntId]/pots/potsSeries.tsx
import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { cloneDeep } from "lodash";
import PotSeries from "@/app/results/tmnt/[tmntId]/pots/potsSeries";
import { missingDataError } from "@/app/results/tmnt/[tmntId]/brackets/player/[playerId]/playerBrktData";
import { getGameNums } from "@/components/tmnts/games";
import { getPlayerName } from "@/lib/getName";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { getLocaleConfig } from "@/lib/currency/components/utils";
import { initPotPf } from "@/lib/db/initVals";
import { tgrGameKey, tmntGameResult } from "@/lib/types/resultsTypes";
import { divType, playerType, potPfType, potType, tmntFullType } from "@/lib/types/types";
import { FIGURE_SPACE } from "@/lib/validation/constants";
import {
  mockPotPfs,
  mockTmntFullData,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

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

const mockGetGameNums = jest.mocked(getGameNums);
const mockMissingDataError = jest.mocked(missingDataError);

// same money format the component uses (formatValueSymbSep2Dec truncates)
const localConfig = getLocaleConfig({ locale: "en-US" });
localConfig.prefix = "$";
const fmt = (amount: number): string =>
  formatValueSymbSep2Dec(amount.toString(), localConfig);

// index into an array without "possibly undefined" (noUncheckedIndexedAccess)
const getAt = <T,>(arr: T[], index: number, what: string): T => {
  const item = arr[index];
  if (item === undefined) {
    throw new Error(`no ${what} at index ${String(index)}`);
  }
  return item;
};

// matches the whole text of a cell, so "21" does not match "211"
const exact = (text: string | number): RegExp => new RegExp(`^${String(text)}$`);

// ---------------------------------------------------------------------------
// tests
// ---------------------------------------------------------------------------

describe("PotSeries", () => {
  let tmntFullData: tmntFullType;
  let pot: potType; // mock pots[0], entries for players 1-4, Scratch div
  let otherDiv: divType; // mock divs[1], HDCP
  let otherPot: potType; // mock pots[1]
  let potPfs: potPfType[];
  let tmntResults: tmntGameResult[];
  let p1: playerType;
  let p2: playerType;
  let p3: playerType;
  let p4: playerType;
  let outsider: playerType; // mock players[4], not in any pot
  const numGames = 6; // mock squad has 6 games
  const gameNums = [1, 2, 3];

  const nameOf = (player: playerType): string =>
    getPlayerName(tmntFullData.players, player.id);

  // a results row in the pot's div (or div_id) with game scores and,
  // when given, a "total + Hdcp"
  const makeResult = (
    player: playerType,
    games: number[],
    totalWithHdcp?: number,
    div_id: string = pot.div_id
  ): tmntGameResult => {
    const row: Record<string, unknown> = {
      player_id: player.id,
      div_id,
      full_name: `${player.first_name} ${player.last_name}`,
      average: player.average,
    };
    games.forEach((score, i) => {
      row[tgrGameKey(i + 1)] = score;
    });
    if (totalWithHdcp !== undefined) {
      row["total + Hdcp"] = totalWithHdcp;
    }
    return row as unknown as tmntGameResult;
  };

  const makePotPf = (
    id: string,
    pot_id: string,
    position: number,
    amount: number | null
  ): potPfType => ({ ...initPotPf, id, pot_id, position, amount });

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

  const getPlayersTable = () => screen.getByTestId("pot-players");
  const getPlayersCells = () => within(getPlayersTable()).getAllByRole("cell");
  const getGamesTable = () => screen.getByTestId("pot-series-games");
  const getGamesCells = () => within(getGamesTable()).getAllByRole("cell");
  const getTotalsTable = () => screen.getByTestId("pot-series-totals");
  const getTotalsCells = () => within(getTotalsTable()).getAllByRole("cell");
  const getPayoutTable = () => screen.getByTestId("pot-payouts");
  const getPayoutCells = () => within(getPayoutTable()).getAllByRole("cell");

  beforeEach(() => {
    jest.clearAllMocks();

    tmntFullData = cloneDeep(mockTmntFullData);
    pot = getAt(tmntFullData.pots, 0, "pot");
    otherPot = getAt(tmntFullData.pots, 1, "pot");
    p1 = getAt(tmntFullData.players, 0, "player");
    p2 = getAt(tmntFullData.players, 1, "player");
    p3 = getAt(tmntFullData.players, 2, "player");
    p4 = getAt(tmntFullData.players, 3, "player");
    outsider = getAt(tmntFullData.players, 4, "player");
    otherDiv = getAt(tmntFullData.divs, 1, "div");

    // p1 listed first but p2 has the higher total; outsider is not in the pot
    tmntResults = [
      makeResult(p1, [201, 202, 203], 606),
      makeResult(p2, [211, 212, 213], 636),
      makeResult(outsider, [291, 292, 293], 876),
    ];

    // deliberately out of order; includes the other pot's prize funds
    potPfs = [
      makePotPf("ppf_test_low", pot.id, 3, 250),
      makePotPf("ppf_test_high", pot.id, 1, 1000),
      makePotPf("ppf_test_other", otherPot.id, 1, 777),
      makePotPf("ppf_test_mid", pot.id, 2, 500),
    ];

    mockGetGameNums.mockReturnValue(gameNums);
  });

  // -------------------------------------------------------------------------
  it("has test data the tests rely on", () => {
    expect(otherPot.id).not.toBe(pot.id);
    expect(otherDiv.id).not.toBe(pot.div_id);
    expect(tmntFullData.divs.find((d) => d.id === pot.div_id)).toBeDefined();
    const potPlayerIds = tmntFullData.potEntries
      .filter((pe) => pe.pot_id === pot.id)
      .map((pe) => pe.player_id);
    expect(potPlayerIds).toEqual(expect.arrayContaining([p1.id, p2.id, p3.id, p4.id]));
    expect(tmntFullData.potEntries.some((pe) => pe.player_id === outsider.id)).toBe(false);
    expect(nameOf(p1)).not.toBe("");
    expect(nameOf(p2)).not.toBe("");
    expect(nameOf(p1)).not.toBe(nameOf(p2));
  });

  // -------------------------------------------------------------------------
  describe("missing data errors", () => {
    const expectError = (msg: string) => {
      expect(screen.getByTestId("missing-data-error")).toHaveTextContent(msg);
      expect(mockMissingDataError).toHaveBeenCalledTimes(1);
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
      renderPotSeries({ potPfs: [makePotPf("ppf_test_other", otherPot.id, 1, 777)] });
      expectError("No pot prize fund");
    });

    it("returns an error when there are no pot entries", () => {
      tmntFullData.potEntries = [];
      renderPotSeries();
      expectError("No pot players");
    });

    it("returns an error when no pot entries match the pot", () => {
      tmntFullData.potEntries = tmntFullData.potEntries.filter((pe) => pe.pot_id !== pot.id);
      renderPotSeries();
      expectError("No pot players");
    });

    it("returns an error when a prize fund for the pot has no amount", () => {
      potPfs = [
        makePotPf("ppf_test_high", pot.id, 1, 1000),
        makePotPf("ppf_test_null", pot.id, 2, null),
      ];
      renderPotSeries();
      expectError("Pot prize fund has no amount");
    });

    it("ignores a prize fund with no amount for another pot", () => {
      potPfs.push(makePotPf("ppf_test_other_null", otherPot.id, 2, null));
      renderPotSeries();
      expect(mockMissingDataError).not.toHaveBeenCalled();
      expect(getPayoutCells().map((cell) => cell.textContent)).toEqual([
        fmt(1000),
        fmt(500),
        fmt(250),
      ]);
    });

    it("checks for pot players before prize fund amounts", () => {
      tmntFullData.potEntries = [];
      potPfs = [makePotPf("ppf_test_null", pot.id, 1, null)];
      renderPotSeries();
      expectError("No pot players");
    });
  });

  // -------------------------------------------------------------------------
  describe("render layout", () => {
    it("renders the scroll container and columns row", () => {
      renderPotSeries();
      expect(screen.getByTestId("pots-columns-scroll")).toHaveClass("overflow-x-auto");
      expect(screen.getByTestId("pot-columns-row")).toHaveClass(
        "d-flex",
        "flex-nowrap",
        "align-items-start"
      );
      expect(mockMissingDataError).not.toHaveBeenCalled();
    });

    it("renders the players, games, totals and payouts tables in that order", () => {
      renderPotSeries();
      const tables = within(screen.getByTestId("pot-columns-row")).getAllByRole("table");
      expect(tables).toEqual([
        getPlayersTable(),
        getGamesTable(),
        getTotalsTable(),
        getPayoutTable(),
      ]);
    });

    it("renders one row per pot player in the players, games and totals tables", () => {
      renderPotSeries();
      // header row + 2 player rows
      [getPlayersTable(), getGamesTable(), getTotalsTable()].forEach((table) => {
        expect(within(table).getAllByRole("row")).toHaveLength(3);
      });
    });

    it("keeps every table from shrinking (Bootstrap flex-shrink-0)", () => {
      renderPotSeries();
      screen.getAllByRole("table").forEach((table) => {
        expect(table).toHaveClass("table", "table-sm", "w-auto", "flex-shrink-0");
        // Tailwind is not loaded, so its shrink-0 class does nothing
        expect(table).not.toHaveClass("shrink-0");
      });
    });

    it("adds the pots-table class to the games table only", () => {
      renderPotSeries();
      expect(getGamesTable()).toHaveClass("pots-table");
      [getPlayersTable(), getTotalsTable(), getPayoutTable()].forEach((table) => {
        expect(table).not.toHaveClass("pots-table");
      });
    });
  });

  // -------------------------------------------------------------------------
  describe("render players table", () => {
    it("renders the 140px 'Name' header", () => {
      renderPotSeries();
      const header = within(getPlayersTable()).getByRole("columnheader", { name: "Name" });
      expect(header).toHaveStyle({ width: "140px" });
      expect(header).toHaveClass("text-start", "align-middle");
    });

    it("renders player names, highest total first", () => {
      renderPotSeries();
      expect(getPlayersCells().map((cell) => cell.textContent)).toEqual([
        nameOf(p2),
        nameOf(p1),
      ]);
    });

    it("renders each name on one line, cut at 140px, full name on hover", () => {
      renderPotSeries();
      [p2, p1].forEach((player, i) => {
        const cell = getAt(getPlayersCells(), i, "cell");
        expect(cell).toHaveClass("text-start", "align-middle");
        // d-flex on a cell or row breaks the table layout
        expect(cell).not.toHaveClass("d-flex");
        const name = within(cell).getByText(nameOf(player));
        expect(name).toHaveClass("text-truncate");
        expect(name).toHaveStyle({ maxWidth: "140px" });
        expect(name).toHaveAttribute("title", nameOf(player));
      });
      within(getPlayersTable())
        .getAllByRole("row")
        .forEach((row) => {
          expect(row).not.toHaveClass("d-flex");
        });
    });

    it("keeps a long name whole in the title", () => {
      const longName = { ...p1, first_name: "Maximiliano-Alessandro", last_name: "Vanderbilt-Featherstonehaugh" };
      tmntFullData.players = tmntFullData.players.map((pl) => (pl.id === p1.id ? longName : pl));
      renderPotSeries();
      const name = within(getPlayersTable()).getByTitle(
        "Maximiliano-Alessandro Vanderbilt-Featherstonehaugh"
      );
      expect(name).toHaveTextContent("Maximiliano-Alessandro Vanderbilt-Featherstonehaugh");
      expect(name).toHaveClass("text-truncate");
    });

    it("does not render players who are not in the pot", () => {
      renderPotSeries();
      expect(within(getPlayersTable()).queryByText(nameOf(outsider))).not.toBeInTheDocument();
    });

    it("renders the header and no rows when there are no results", () => {
      renderPotSeries({ tmntResults: [] });
      expect(
        within(getPlayersTable()).getByRole("columnheader", { name: "Name" })
      ).toBeInTheDocument();
      expect(within(getPlayersTable()).queryAllByRole("cell")).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  describe("division filter", () => {
    it("does not render results from another division", () => {
      tmntResults.push(makeResult(p3, [299, 299, 299], 897, otherDiv.id));
      renderPotSeries();
      expect(getPlayersCells()).toHaveLength(2);
      expect(within(getPlayersTable()).queryByText(nameOf(p3))).not.toBeInTheDocument();
      expect(within(getGamesTable()).queryByText("299")).not.toBeInTheDocument();
      expect(within(getTotalsTable()).queryByText(/^897/)).not.toBeInTheDocument();
    });

    it("shows a player in two divisions once, with the pot division's scores", () => {
      // p1 also bowls in the HDCP div, with a higher handicap total
      tmntResults.push(makeResult(p1, [201, 202, 203], 900, otherDiv.id));
      renderPotSeries();
      expect(getPlayersCells().map((cell) => cell.textContent)).toEqual([
        nameOf(p2),
        nameOf(p1),
      ]);
      expect(getTotalsCells().map((cell) => cell.textContent)).toEqual([
        `636${FIGURE_SPACE}`,
        `606${FIGURE_SPACE}`,
      ]);
    });

    it("renders no rows when the pot's players only have results in another division", () => {
      tmntResults = [
        makeResult(p1, [201, 202, 203], 606, otherDiv.id),
        makeResult(p2, [211, 212, 213], 636, otherDiv.id),
      ];
      renderPotSeries();
      expect(within(getPlayersTable()).queryAllByRole("cell")).toHaveLength(0);
      expect(within(getGamesTable()).queryAllByRole("cell")).toHaveLength(0);
      expect(within(getTotalsTable()).queryAllByRole("cell")).toHaveLength(0);
      expect(mockMissingDataError).not.toHaveBeenCalled();
    });

    it("uses the pot's division when the pot points at the HDCP div", () => {
      const scratchDivId = pot.div_id;
      pot.div_id = otherDiv.id;
      tmntResults = [
        makeResult(p1, [201, 202, 203], 606, scratchDivId),
        makeResult(p1, [201, 202, 203], 700, otherDiv.id),
      ];
      renderPotSeries();
      expect(getTotalsCells().map((cell) => cell.textContent)).toEqual([`700${FIGURE_SPACE}`]);
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
        const header = getAt(headers, i, "header");
        expect(header).toHaveTextContent(exact(gameNum));
        expect(header).toHaveStyle({ width: "40px" });
        expect(header).toHaveClass("text-end", "align-middle", "game-header-align");
      });
    });

    it("renders only players in the pot, highest total first", () => {
      renderPotSeries();
      const cells = getGamesCells();
      // 2 pot players x 3 games
      expect(cells).toHaveLength(6);
      // p2 (636) before p1 (606)
      ["211", "212", "213", "201", "202", "203"].forEach((score, i) => {
        const cell = getAt(cells, i, "cell");
        expect(cell).toHaveTextContent(exact(score));
        expect(cell).toHaveClass("text-end", "align-middle");
      });
      expect(within(getGamesTable()).queryByText("291")).not.toBeInTheDocument();
    });

    it("renders only the game columns returned by getGameNums", () => {
      mockGetGameNums.mockReturnValue([1, 2]);
      renderPotSeries();
      expect(within(getGamesTable()).getAllByRole("columnheader")).toHaveLength(2);
      expect(getGamesCells()).toHaveLength(4);
      expect(within(getGamesTable()).queryByText("203")).not.toBeInTheDocument();
    });

    it("renders all 6 games of the mock squad", () => {
      const sixGames = [1, 2, 3, 4, 5, 6];
      mockGetGameNums.mockReturnValue(sixGames);
      tmntResults = [makeResult(p1, [201, 202, 203, 204, 205, 206], 1221)];
      renderPotSeries();
      expect(within(getGamesTable()).getAllByRole("columnheader")).toHaveLength(6);
      const cells = getGamesCells();
      sixGames.forEach((gameNum, i) => {
        expect(getAt(cells, i, "cell")).toHaveTextContent(exact(200 + gameNum));
      });
    });

    it("renders an empty cell when a game score is missing", () => {
      tmntResults = [makeResult(p1, [201, 202], 403), makeResult(p2, [211, 212, 213], 636)];
      renderPotSeries();
      const cells = getGamesCells();
      // p2 (636) is the first row, p1 (403) the second; p1's game 3 cell is empty
      expect(getAt(cells, 3, "cell")).toHaveTextContent(/^201$/);
      expect(getAt(cells, 5, "cell")).toBeEmptyDOMElement();
    });

    it("renders headers and no rows when there are no results", () => {
      mockGetGameNums.mockReturnValue([]);
      renderPotSeries({ tmntResults: [] });
      expect(within(getGamesTable()).queryAllByRole("cell")).toHaveLength(0);
      expect(mockMissingDataError).not.toHaveBeenCalled();
    });

    it("renders no rows when no results belong to pot players", () => {
      tmntResults = [makeResult(outsider, [291, 292, 293], 876)];
      renderPotSeries();
      expect(within(getPlayersTable()).queryAllByRole("cell")).toHaveLength(0);
      expect(within(getGamesTable()).queryAllByRole("cell")).toHaveLength(0);
      expect(within(getTotalsTable()).queryAllByRole("cell")).toHaveLength(0);
      // the prize fund is still shown
      expect(getPayoutCells().map((cell) => cell.textContent)).toEqual([
        fmt(1000),
        fmt(500),
        fmt(250),
      ]);
    });
  });

  // -------------------------------------------------------------------------
  describe("render totals table", () => {
    it("renders the 70px 'Total' header", () => {
      renderPotSeries();
      const header = within(getTotalsTable()).getByRole("columnheader", { name: "Total" });
      expect(header).toHaveStyle({ width: "70px" });
      expect(header).toHaveClass("text-center", "align-middle");
    });

    it("renders totals followed by a figure space, highest total first", () => {
      renderPotSeries();
      const cells = getTotalsCells();
      expect(cells.map((cell) => cell.textContent)).toEqual([
        `636${FIGURE_SPACE}`,
        `606${FIGURE_SPACE}`,
      ]);
      cells.forEach((cell) => {
        expect(cell).toHaveClass("text-end", "align-middle", "text-nowrap");
      });
    });

    it("lines up each total with its player's name", () => {
      tmntResults = [
        makeResult(p1, [200, 200, 200], 600),
        makeResult(p2, [150, 150, 150], 450),
        makeResult(p3, [250, 250, 250], 750),
      ];
      renderPotSeries();
      expect(getPlayersCells().map((cell) => cell.textContent)).toEqual([
        nameOf(p3),
        nameOf(p1),
        nameOf(p2),
      ]);
      expect(getTotalsCells().map((cell) => cell.textContent)).toEqual([
        `750${FIGURE_SPACE}`,
        `600${FIGURE_SPACE}`,
        `450${FIGURE_SPACE}`,
      ]);
    });

    it("keeps the results order for tied totals", () => {
      tmntResults = [makeResult(p1, [200, 200, 200], 600), makeResult(p2, [210, 190, 200], 600)];
      renderPotSeries();
      expect(getPlayersCells().map((cell) => cell.textContent)).toEqual([
        nameOf(p1),
        nameOf(p2),
      ]);
    });

    it("renders the header and no rows when there are no results", () => {
      renderPotSeries({ tmntResults: [] });
      expect(
        within(getTotalsTable()).getByRole("columnheader", { name: "Total" })
      ).toBeInTheDocument();
      expect(within(getTotalsTable()).queryAllByRole("cell")).toHaveLength(0);
    });

    it("does not render totals for players who are not in the pot", () => {
      renderPotSeries();
      expect(within(getTotalsTable()).queryByText(/^876/)).not.toBeInTheDocument();
    });

    it("sorts a missing total as 0 and shows only the figure space", () => {
      tmntResults = [makeResult(p1, [100, 100, 100]), makeResult(p2, [50, 50, 50], 150)];
      renderPotSeries();
      expect(getPlayersCells().map((cell) => cell.textContent)).toEqual([
        nameOf(p2),
        nameOf(p1),
      ]);
      expect(getTotalsCells().map((cell) => cell.textContent)).toEqual([
        `150${FIGURE_SPACE}`,
        FIGURE_SPACE,
      ]);
    });

    it("does not change the order of the tmntResults prop", () => {
      const before = tmntResults.map((row) => row.player_id);
      renderPotSeries();
      expect(tmntResults.map((row) => row.player_id)).toEqual(before);
    });
  });

  // -------------------------------------------------------------------------
  describe("render payouts table", () => {
    it("renders the 90px 'Total $' header", () => {
      renderPotSeries();
      const header = within(getPayoutTable()).getByRole("columnheader", { name: "Total $" });
      expect(header).toHaveStyle({ width: "90px" });
      expect(header).toHaveClass("text-end", "align-middle", "pe-3");
    });

    const payoutTexts = () => getPayoutCells().map((cell) => cell.textContent);
    // all 6 games bowled by p1..p4 (all in the pot) with these totals, in this order
    const withTotals = (...totals: number[]) => {
      const players = [p1, p2, p3, p4];
      tmntResults = totals.map((total, i) =>
        makeResult(getAt(players, i, "player"), [100, 100, 100, 100, 100, total - 500], total)
      );
    };

    describe("before the last game is bowled", () => {
      it("shows the prize fund in position order", () => {
        // default results only have games 1-3 of 6
        renderPotSeries();
        expect(payoutTexts()).toEqual([fmt(1000), fmt(500), fmt(250)]);
        expect(within(getPayoutTable()).queryByText(fmt(777))).not.toBeInTheDocument();
      });

      it("does not split the prize fund for tied totals", () => {
        tmntResults = [
          makeResult(p1, [200, 200, 200], 600),
          makeResult(p2, [200, 200, 200], 600),
          makeResult(p3, [200, 200, 200], 600),
        ];
        renderPotSeries();
        expect(payoutTexts()).toEqual([fmt(1000), fmt(500), fmt(250)]);
      });

      it("does not split when every total is missing", () => {
        tmntResults = [makeResult(p1, []), makeResult(p2, []), makeResult(p3, [])];
        renderPotSeries();
        expect(payoutTexts()).toEqual([fmt(1000), fmt(500), fmt(250)]);
      });

      it("shows the prize fund when there are no results", () => {
        renderPotSeries({ tmntResults: [] });
        expect(payoutTexts()).toEqual([fmt(1000), fmt(500), fmt(250)]);
      });

      it("shows only the prize fund rows when there are more players", () => {
        tmntResults = [
          makeResult(p1, [200], 200),
          makeResult(p2, [190], 190),
          makeResult(p3, [180], 180),
          makeResult(p4, [170], 170),
        ];
        renderPotSeries();
        expect(payoutTexts()).toEqual([fmt(1000), fmt(500), fmt(250)]);
      });

      it("uses numGames to find the last game", () => {
        // ties in a 3 game squad are split once game 3 is bowled
        tmntResults = [
          makeResult(p1, [200, 200, 200], 600),
          makeResult(p2, [200, 200, 200], 600),
        ];
        renderPotSeries({ numGames: 3 });
        expect(payoutTexts()).toEqual([fmt(750), fmt(750)]);
      });
    });

    it("splits ties once any player has a last game score", () => {
      // p1 and p2 tie; only p3 has bowled game 6 so far
      tmntResults = [
        makeResult(p1, [200, 200, 200], 600),
        makeResult(p2, [200, 200, 200], 600),
        makeResult(p3, [100, 100, 100, 100, 100, 50], 550),
      ];
      renderPotSeries();
      expect(payoutTexts()).toEqual([fmt(750), fmt(750), fmt(250)]);
    });

    it("pays one prize per player row once the last game is bowled", () => {
      withTotals(800, 700);
      renderPotSeries();
      // 2 players, 3 prizes: 1st and 2nd are paid, 3rd ($250) is not used
      expect(payoutTexts()).toEqual([fmt(1000), fmt(500)]);
      expect(within(getPayoutTable()).queryByText(fmt(250))).not.toBeInTheDocument();
    });

    it("shows no payout row for 0 prize fund amounts", () => {
      potPfs = [
        makePotPf("ppf_test_1", pot.id, 1, 1000),
        makePotPf("ppf_test_2", pot.id, 2, 500),
        makePotPf("ppf_test_3", pot.id, 3, 0),
      ];
      // before the last game
      renderPotSeries();
      expect(payoutTexts()).toEqual([fmt(1000), fmt(500)]);
    });

    it("shows no payout row for a 0 prize after the last game", () => {
      potPfs = [
        makePotPf("ppf_test_1", pot.id, 1, 1000),
        makePotPf("ppf_test_2", pot.id, 2, 500),
        makePotPf("ppf_test_3", pot.id, 3, 0),
      ];
      withTotals(800, 700, 600, 500);
      renderPotSeries();
      expect(payoutTexts()).toEqual([fmt(1000), fmt(500)]);
      expect(within(getPayoutTable()).queryByText("$0.00")).not.toBeInTheDocument();
    });

    it("never renders an empty payout row", () => {
      withTotals(800, 700, 600, 500);
      renderPotSeries();
      getPayoutCells().forEach((cell) => {
        expect(cell).not.toHaveTextContent(/^\s*$/);
      });
    });

    it("shows no payout row for players past the paid positions", () => {
      withTotals(800, 700, 600, 500);
      renderPotSeries();
      expect(payoutTexts()).toEqual([fmt(1000), fmt(500), fmt(250)]);
    });

    it("lines up each payout with its player's name", () => {
      withTotals(500, 800, 600, 700);
      renderPotSeries();
      expect(getPlayersCells().map((cell) => cell.textContent)).toEqual([
        nameOf(p2),
        nameOf(p4),
        nameOf(p3),
        nameOf(p1),
      ]);
      expect(payoutTexts()).toEqual([fmt(1000), fmt(500), fmt(250)]);
    });

    it("splits 1st and 2nd between players tied for 1st", () => {
      withTotals(800, 800, 600, 500);
      renderPotSeries();
      // (1000 + 500) / 2 = 750; 3rd place still gets 250
      expect(payoutTexts()).toEqual([fmt(750), fmt(750), fmt(250)]);
    });

    it("splits 2nd and 3rd between players tied for 2nd", () => {
      withTotals(800, 700, 700, 500);
      renderPotSeries();
      // (500 + 250) / 2 = 375
      expect(payoutTexts()).toEqual([fmt(1000), fmt(375), fmt(375)]);
    });

    it("splits the last paid position with players tied past it", () => {
      withTotals(800, 700, 600, 600);
      renderPotSeries();
      // 3rd (250) is shared by 2 players; there is no 4th prize
      expect(payoutTexts()).toEqual([fmt(1000), fmt(500), fmt(125), fmt(125)]);
    });

    it("splits every prize when all players tie", () => {
      withTotals(700, 700, 700, 700);
      renderPotSeries();
      // (1000 + 500 + 250) / 4 = 437.50
      expect(payoutTexts()).toEqual([fmt(437.5), fmt(437.5), fmt(437.5), fmt(437.5)]);
    });

    it("rounds a split share down to the cent", () => {
      potPfs = [
        makePotPf("ppf_test_a", pot.id, 1, 60),
        makePotPf("ppf_test_b", pot.id, 2, 30),
        makePotPf("ppf_test_c", pot.id, 3, 10),
      ];
      withTotals(700, 700, 700);
      renderPotSeries();
      // 100 / 3 = 33.333... -> $33.33 each
      expect(payoutTexts()).toEqual(["$33.33", "$33.33", "$33.33"]);
    });

    it("sorts the prize fund by amount, highest first, not by potPfs order", () => {
      potPfs = [
        makePotPf("ppf_test_3", pot.id, 3, 250),
        makePotPf("ppf_test_1", pot.id, 1, 1000),
        makePotPf("ppf_test_2", pot.id, 2, 500),
      ];
      withTotals(800, 700, 600);
      renderPotSeries();
      expect(payoutTexts()).toEqual([fmt(1000), fmt(500), fmt(250)]);
    });

    it("pays the mock prize funds for the pot", () => {
      potPfs = cloneDeep(mockPotPfs);
      withTotals(800, 700, 600);
      renderPotSeries();
      // mock pots[0] pays 75 / 35
      expect(payoutTexts()).toEqual(["$75.00", "$35.00"]);
    });

    it("renders amounts with cents", () => {
      potPfs = [makePotPf("ppf_test_a", pot.id, 1, 33.339), makePotPf("ppf_test_b", pot.id, 2, 12.5)];
      renderPotSeries();
      expect(payoutTexts()).toEqual(["$33.33", "$12.50"]);
    });

    it("styles the payout amounts as right aligned success text", () => {
      renderPotSeries();
      getPayoutCells().forEach((cell) => {
        expect(cell).toHaveClass("text-end", "align-middle", "text-success", "pe-3");
      });
    });

    it("does not change the potPfs prop", () => {
      const before = cloneDeep(potPfs);
      renderPotSeries();
      expect(potPfs).toEqual(before);
    });
  });
});
