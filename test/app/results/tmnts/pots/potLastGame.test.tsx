// test/app/results/tmnts/pots/potLastGame.test.tsx
// tests for src/app/results/tmnt/[tmntId]/pots/potLastGame.tsx
import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { cloneDeep } from "lodash";
import PotLastGame from "@/app/results/tmnt/[tmntId]/pots/potLastGame";
import PlayerNameWithScore from "@/app/results/tmnt/[tmntId]/pots/playerNameWithScore";
import {
  potHdcpGameWidth,
  potNoHdcpGameWidth,
  potPayoutWidth,
} from "@/app/results/tmnt/[tmntId]/pots/potGames";
import { missingDataError } from "@/app/results/tmnt/[tmntId]/brackets/player/[playerId]/playerBrktData";
import { potLastGameResults, potResultsRowType } from "@/lib/results/pots/potResults";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { getLocaleConfig } from "@/lib/currency/components/utils";
import { initPotPf } from "@/lib/db/initVals";
import { divType, potPfType, potType, tmntFullType } from "@/lib/types/types";
import {
  mockPotPfs,
  mockTmntFullData,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// ---------------------------------------------------------------------------
// mocks
// ---------------------------------------------------------------------------

// control the last game results so the tests do not depend on scoring logic.
// calcPrizes is NOT mocked: the tie tests check the real split amounts
jest.mock("@/lib/results/pots/potResults", () => ({
  potLastGameResults: jest.fn(),
}));

// simple stand in for the player name + score cell (tested on its own)
jest.mock("@/app/results/tmnt/[tmntId]/pots/playerNameWithScore", () => {
  const { createElement } = jest.requireActual<typeof import("react")>("react");
  return {
    __esModule: true,
    default: jest.fn((props: { row: { player_id: string } }) =>
      createElement("span", { "data-testid": "player-name-with-score" }, props.row.player_id)
    ),
  };
});

// render error messages in a known element
jest.mock("@/app/results/tmnt/[tmntId]/brackets/player/[playerId]/playerBrktData", () => {
  const { createElement } = jest.requireActual<typeof import("react")>("react");
  return {
    missingDataError: jest.fn((msg: string) =>
      createElement("div", { "data-testid": "missing-data-error" }, msg)
    ),
  };
});

const mockPotLastGameResults = jest.mocked(potLastGameResults);
const mockPlayerNameWithScore = jest.mocked(PlayerNameWithScore);
const mockMissingDataError = jest.mocked(missingDataError);

type lastGameResultsType = ReturnType<typeof potLastGameResults>;

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

// ---------------------------------------------------------------------------
// tests
// ---------------------------------------------------------------------------

describe("PotLastGame", () => {
  let tmntFullData: tmntFullType;
  let pot: potType; // mock pots[1]: last game pot, Scratch div
  let otherPot: potType; // mock pots[0]: game pot, Scratch div
  let scratchDiv: divType; // mock divs[0]: hdcp_per 0
  let hdcpDiv: divType; // mock divs[1]: hdcp_per 0.9
  let potPfs: potPfType[];
  let potResultsRows: potResultsRowType[];
  let lastGameResults: lastGameResultsType;
  let p1: string;
  let p2: string;
  let p3: string;
  let p4: string;
  const numGames = 6; // mock squad has 6 games

  const makeRow = (
    player_id: string,
    gameNum: number,
    score: number | null,
    hdcp: number | null
  ): potResultsRowType => ({
    player_id,
    div_id: pot.div_id,
    gameNum,
    score,
    hdcp,
    scoreWithHdcp: score === null || hdcp === null ? null : score + hdcp,
    prizeMoney: null,
  });

  // a last game row; scratch pot, so hdcp 0 and scoreWithHdcp === score
  const lastRow = (player_id: string, score: number | null): potResultsRowType =>
    makeRow(player_id, numGames, score, score === null ? null : 0);

  const makePotPf = (
    id: string,
    pot_id: string,
    position: number,
    amount: number
  ): potPfType => ({ ...initPotPf, id, pot_id, position, amount });

  // points the pot at another div
  const setPotDiv = (div: divType) => {
    pot.div_id = div.id;
  };

  const renderPotLastGame = (
    overrides: Partial<React.ComponentProps<typeof PotLastGame>> = {}
  ) =>
    render(
      <PotLastGame
        pot_id={pot.id}
        tmntFullData={tmntFullData}
        potResultsRows={potResultsRows}
        potPfs={potPfs}
        numGames={numGames}
        {...overrides}
      />
    );

  const getPayoutTable = () => screen.getByTestId("pot-payouts");
  const getPayoutCells = () => within(getPayoutTable()).getAllByRole("cell");
  // the exact text of every payout cell, top to bottom
  const getPayoutTexts = () => getPayoutCells().map((cell) => cell.textContent);
  const getLastGameTable = () => screen.getByTestId("pot-last-game");
  const getLastGameCells = () => within(getLastGameTable()).getAllByRole("cell");

  beforeEach(() => {
    jest.clearAllMocks();

    tmntFullData = cloneDeep(mockTmntFullData);
    pot = getAt(tmntFullData.pots, 1, "pot");
    otherPot = getAt(tmntFullData.pots, 0, "pot");
    scratchDiv = getAt(tmntFullData.divs, 0, "div");
    hdcpDiv = getAt(tmntFullData.divs, 1, "div");
    p1 = getAt(tmntFullData.players, 0, "player").id;
    p2 = getAt(tmntFullData.players, 1, "player").id;
    p3 = getAt(tmntFullData.players, 2, "player").id;
    p4 = getAt(tmntFullData.players, 3, "player").id;

    // mock: pots[1] pays 200 and 75, pots[0] pays 75 and 35
    potPfs = cloneDeep(mockPotPfs);

    potResultsRows = [makeRow(p1, 1, 200, 15), makeRow(p2, 1, 190, 20)];

    lastGameResults = [
      makeRow(p1, numGames, 230, 15),
      makeRow(p2, numGames, 180, 20),
    ];

    mockPotLastGameResults.mockReturnValue(lastGameResults);
  });

  // -------------------------------------------------------------------------
  it("has test data the tests rely on", () => {
    expect(pot.div_id).toBe(scratchDiv.id);
    expect(scratchDiv.hdcp_per).toBe(0);
    expect(hdcpDiv.hdcp_per).toBeGreaterThan(0);
    expect(otherPot.id).not.toBe(pot.id);
    expect(new Set([p1, p2, p3, p4]).size).toBe(4);
    expect(potPfs.filter((pf) => pf.pot_id === pot.id)).toHaveLength(2);
    expect(potPfs.filter((pf) => pf.pot_id === otherPot.id)).toHaveLength(2);
  });

  // -------------------------------------------------------------------------
  describe("missing data errors", () => {
    const expectError = (msg: string) => {
      expect(screen.getByTestId("missing-data-error")).toHaveTextContent(msg);
      expect(mockMissingDataError).toHaveBeenCalledWith(msg);
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(mockPotLastGameResults).not.toHaveBeenCalled();
      expect(mockPlayerNameWithScore).not.toHaveBeenCalled();
    };

    it("returns an error when pot_id is missing", () => {
      renderPotLastGame({ pot_id: "" });
      expectError("No pot id");
    });

    // the next three props are typed non-null; the guards are kept for
    // callers that pass bad data, so the tests force a null in
    it("returns an error when tmntFullData is missing", () => {
      renderPotLastGame({ tmntFullData: null as unknown as tmntFullType });
      expectError("No tournament data");
    });

    it("returns an error when potResultsRows is missing", () => {
      renderPotLastGame({ potResultsRows: null as unknown as potResultsRowType[] });
      expectError("No pot results rows");
    });

    it("returns an error when potPfs is missing", () => {
      renderPotLastGame({ potPfs: null as unknown as potPfType[] });
      expectError("No pot prize funds");
    });

    it("returns an error when numGames is 0", () => {
      renderPotLastGame({ numGames: 0 });
      expectError("No number of games");
    });

    it("returns an error when the pot is not found", () => {
      const badId = "pot_00000000000000000000000000000000";
      renderPotLastGame({ pot_id: badId });
      expectError("Could not find pot. Id: " + badId);
    });

    it("returns an error when the pot's div is not found", () => {
      tmntFullData.divs = tmntFullData.divs.filter((d) => d.id !== pot.div_id);
      renderPotLastGame();
      expectError("Could not find div. Id: " + pot.div_id);
    });

    it("returns an error when potPfs is empty", () => {
      renderPotLastGame({ potPfs: [] });
      expectError("No pot prize fund");
    });

    it("returns an error when no prize funds match the pot", () => {
      renderPotLastGame({
        potPfs: potPfs.filter((pf) => pf.pot_id !== pot.id),
      });
      expectError("No pot prize fund");
    });

    it("returns an error when a prize fund for the pot has no amount", () => {
      renderPotLastGame({
        potPfs: [
          makePotPf("ppf_test_1", pot.id, 1, 200),
          { ...makePotPf("ppf_test_2", pot.id, 2, 0), amount: null },
        ],
      });
      expectError("Pot prize fund has no amount");
    });

    it("ignores a prize fund with no amount when it is for another pot", () => {
      renderPotLastGame({
        potPfs: [
          ...potPfs,
          { ...makePotPf("ppf_test_other", otherPot.id, 3, 0), amount: null },
        ],
      });
      expect(mockMissingDataError).not.toHaveBeenCalled();
      expect(getPayoutCells()).toHaveLength(2);
    });
  });

  // -------------------------------------------------------------------------
  describe("render layout", () => {
    it("renders the scroll container and the columns row", () => {
      renderPotLastGame();
      expect(screen.getByTestId("pots-columns-scroll")).toHaveClass("overflow-x-auto");
      expect(screen.getByTestId("pot-columns-row")).toHaveClass(
        "d-flex",
        "flex-nowrap",
        "align-items-start"
      );
    });

    it("keeps both tables from shrinking so the row scrolls sideways", () => {
      renderPotLastGame();
      screen.getAllByRole("table").forEach((table) => {
        expect(table).toHaveClass("flex-shrink-0", "w-auto");
      });
    });

    it("renders the payout table first and the last game table second", () => {
      renderPotLastGame();
      const tables = screen.getAllByRole("table");
      expect(tables).toHaveLength(2);
      expect(tables[0]).toBe(getPayoutTable());
      expect(tables[1]).toBe(getLastGameTable());
      expect(mockMissingDataError).not.toHaveBeenCalled();
    });

    it("renders payout rows only for paid places, not one per player", () => {
      mockPotLastGameResults.mockReturnValue([
        lastRow(p1, 250),
        lastRow(p2, 240),
        lastRow(p3, 230),
        lastRow(p4, 220),
      ]);
      renderPotLastGame();
      expect(getLastGameCells()).toHaveLength(4);
      expect(getPayoutCells()).toHaveLength(2);
    });
  });

  // -------------------------------------------------------------------------
  describe("render payout table", () => {
    it("renders the 'Game $' header with the payout width", () => {
      renderPotLastGame();
      const header = within(getPayoutTable()).getByRole("columnheader", { name: "Game $" });
      expect(header).toHaveStyle({ width: `${potPayoutWidth}px` });
      expect(header).toHaveClass("text-center", "align-middle");
    });

    it("renders the mock prize funds for the pot", () => {
      renderPotLastGame();
      expect(getPayoutTexts()).toEqual([fmt(200), fmt(75)]);
    });

    it("does not render prize funds for other pots", () => {
      renderPotLastGame();
      // pots[0] pays $75 and $35; $75 is also in pots[1], so check $35
      expect(within(getPayoutTable()).queryByText(fmt(35))).not.toBeInTheDocument();
    });

    it("renders the other pot's prize funds when given its id", () => {
      renderPotLastGame({ pot_id: otherPot.id });
      expect(getPayoutTexts()).toEqual([fmt(75), fmt(35)]);
      expect(mockPotLastGameResults).toHaveBeenCalledWith(
        otherPot.id,
        tmntFullData,
        potResultsRows,
        numGames
      );
    });

    it("sorts the prize funds highest to lowest", () => {
      mockPotLastGameResults.mockReturnValue([
        lastRow(p1, 250),
        lastRow(p2, 240),
        lastRow(p3, 230),
      ]);
      // deliberately out of order; includes a prize fund for another pot
      renderPotLastGame({
        potPfs: [
          makePotPf("ppf_test_low", pot.id, 3, 250),
          makePotPf("ppf_test_high", pot.id, 1, 1000),
          makePotPf("ppf_test_other", otherPot.id, 1, 777),
          makePotPf("ppf_test_mid", pot.id, 2, 500),
        ],
      });
      expect(getPayoutTexts()).toEqual(["$1,000.00", "$500.00", "$250.00"]);
      expect(within(getPayoutTable()).queryByText(fmt(777))).not.toBeInTheDocument();
    });

    it("formats amounts with cents", () => {
      renderPotLastGame({
        potPfs: [
          makePotPf("ppf_test_1", pot.id, 1, 36.5),
          makePotPf("ppf_test_2", pot.id, 2, 18.25),
        ],
      });
      expect(getPayoutTexts()).toEqual(["$36.50", "$18.25"]);
    });

    it("styles the payout amounts as success text", () => {
      renderPotLastGame();
      getPayoutCells().forEach((cell) => {
        expect(cell).toHaveClass("text-center", "align-middle", "text-success");
      });
    });

    it("renders a single prize fund, and no row for the unpaid player", () => {
      renderPotLastGame({ potPfs: [makePotPf("ppf_test_one", pot.id, 1, 125)] });
      expect(getPayoutTexts()).toEqual(["$125.00"]);
    });

    it("does not change the potPfs prop", () => {
      const unsorted = [
        makePotPf("ppf_test_low", pot.id, 2, 75),
        makePotPf("ppf_test_high", pot.id, 1, 200),
      ];
      const before = cloneDeep(unsorted);
      renderPotLastGame({ potPfs: unsorted });
      expect(unsorted).toEqual(before);
    });

    it("does not change the last game results when splitting a tie", () => {
      const tied = [lastRow(p1, 230), lastRow(p2, 230)];
      const before = cloneDeep(tied);
      mockPotLastGameResults.mockReturnValue(tied);
      renderPotLastGame();
      expect(tied).toEqual(before);
    });
  });

  // -------------------------------------------------------------------------
  describe("ties before the last game is bowled", () => {
    // no last game scores yet: show the prize fund in position order, no splits

    it("shows the prize fund in position order", () => {
      mockPotLastGameResults.mockReturnValue([lastRow(p1, null), lastRow(p2, null)]);
      renderPotLastGame();
      expect(getPayoutTexts()).toEqual([fmt(200), fmt(75)]);
    });

    it("does not split the prize fund even though every blank score is equal", () => {
      mockPotLastGameResults.mockReturnValue([
        lastRow(p1, null),
        lastRow(p2, null),
        lastRow(p3, null),
      ]);
      renderPotLastGame();
      // a split would be 275 / 3 = $91.66 for every player
      expect(getPayoutTexts()).toEqual([fmt(200), fmt(75)]);
      expect(within(getPayoutTable()).queryByText(fmt(275 / 3))).not.toBeInTheDocument();
    });

    it("shows the whole prize fund when there are fewer players than prizes", () => {
      mockPotLastGameResults.mockReturnValue([lastRow(p1, null)]);
      renderPotLastGame();
      expect(getPayoutTexts()).toEqual([fmt(200), fmt(75)]);
    });

    it("shows the prize fund when there are no last game results", () => {
      mockPotLastGameResults.mockReturnValue([]);
      renderPotLastGame();
      expect(getPayoutTexts()).toEqual([fmt(200), fmt(75)]);
    });
  });

  // -------------------------------------------------------------------------
  describe("ties after the last game is bowled", () => {
    it("pays each position in full when there are no ties", () => {
      mockPotLastGameResults.mockReturnValue([lastRow(p1, 230), lastRow(p2, 220)]);
      renderPotLastGame();
      expect(getPayoutTexts()).toEqual([fmt(200), fmt(75)]);
    });

    it("splits 1st and 2nd for a tie for 1st", () => {
      mockPotLastGameResults.mockReturnValue([lastRow(p1, 230), lastRow(p2, 230)]);
      renderPotLastGame();
      // (200 + 75) / 2
      expect(getPayoutTexts()).toEqual(["$137.50", "$137.50"]);
    });

    it("splits only the last paid position for a tie for 2nd", () => {
      mockPotLastGameResults.mockReturnValue([
        lastRow(p1, 250),
        lastRow(p2, 230),
        lastRow(p3, 230),
      ]);
      renderPotLastGame();
      // 2nd place (75) split by two; there is no 3rd prize to add
      expect(getPayoutTexts()).toEqual(["$200.00", "$37.50", "$37.50"]);
    });

    it("rounds a split down to the cent (3-way tie for 1st)", () => {
      mockPotLastGameResults.mockReturnValue([
        lastRow(p1, 230),
        lastRow(p2, 230),
        lastRow(p3, 230),
      ]);
      renderPotLastGame();
      // 275 / 3 = 91.666... -> $91.66
      expect(getPayoutTexts()).toEqual(["$91.66", "$91.66", "$91.66"]);
    });

    it("splits a tie in the middle of the paid positions", () => {
      mockPotLastGameResults.mockReturnValue([
        lastRow(p1, 260),
        lastRow(p2, 240),
        lastRow(p3, 240),
        lastRow(p4, 220),
      ]);
      renderPotLastGame({
        potPfs: [
          makePotPf("ppf_test_1", pot.id, 1, 100),
          makePotPf("ppf_test_2", pot.id, 2, 60),
          makePotPf("ppf_test_3", pot.id, 3, 40),
          makePotPf("ppf_test_4", pot.id, 4, 20),
        ],
      });
      // 2nd + 3rd = 100, split by two
      expect(getPayoutTexts()).toEqual(["$100.00", "$50.00", "$50.00", "$20.00"]);
    });

    it("renders no rows for players past the last paid position", () => {
      mockPotLastGameResults.mockReturnValue([
        lastRow(p1, 250),
        lastRow(p2, 240),
        lastRow(p3, 230),
        lastRow(p4, 220),
      ]);
      renderPotLastGame();
      expect(getPayoutTexts()).toEqual([fmt(200), fmt(75)]);
    });

    it("renders no row for a prize fund amount of 0", () => {
      mockPotLastGameResults.mockReturnValue([
        lastRow(p1, 250),
        lastRow(p2, 240),
        lastRow(p3, 230),
      ]);
      renderPotLastGame({
        potPfs: [
          makePotPf("ppf_test_1", pot.id, 1, 100),
          makePotPf("ppf_test_2", pot.id, 2, 50),
          makePotPf("ppf_test_3", pot.id, 3, 0),
        ],
      });
      expect(getPayoutTexts()).toEqual(["$100.00", "$50.00"]);
      expect(within(getPayoutTable()).queryByText("$0.00")).not.toBeInTheDocument();
    });

    it("renders no row for a prize fund amount of 0 before the last game", () => {
      mockPotLastGameResults.mockReturnValue([lastRow(p1, null), lastRow(p2, null)]);
      renderPotLastGame({
        potPfs: [
          makePotPf("ppf_test_1", pot.id, 1, 100),
          makePotPf("ppf_test_2", pot.id, 2, 0),
        ],
      });
      expect(getPayoutTexts()).toEqual(["$100.00"]);
    });

    it("compares scores with handicap, not scratch scores", () => {
      setPotDiv(hdcpDiv);
      // same scratch score, different handicap: not a tie
      mockPotLastGameResults.mockReturnValue([
        makeRow(p2, numGames, 220, 20),
        makeRow(p1, numGames, 220, 10),
      ]);
      renderPotLastGame();
      expect(getPayoutTexts()).toEqual([fmt(200), fmt(75)]);
    });

    it("splits a tie on score with handicap", () => {
      setPotDiv(hdcpDiv);
      // 210 + 20 and 220 + 10 are both 230
      mockPotLastGameResults.mockReturnValue([
        makeRow(p1, numGames, 210, 20),
        makeRow(p2, numGames, 220, 10),
      ]);
      renderPotLastGame();
      expect(getPayoutTexts()).toEqual(["$137.50", "$137.50"]);
    });

    it("splits once any player has a last game score", () => {
      mockPotLastGameResults.mockReturnValue([
        lastRow(p1, 230),
        lastRow(p2, 230),
        lastRow(p3, null),
      ]);
      renderPotLastGame();
      expect(getPayoutTexts()).toEqual(["$137.50", "$137.50"]);
    });

    it("splits the other pot's prize fund for a tie", () => {
      mockPotLastGameResults.mockReturnValue([lastRow(p1, 230), lastRow(p2, 230)]);
      renderPotLastGame({ pot_id: otherPot.id });
      // (75 + 35) / 2
      expect(getPayoutTexts()).toEqual(["$55.00", "$55.00"]);
    });

    it("lines up each split with its player's row", () => {
      mockPotLastGameResults.mockReturnValue([
        lastRow(p1, 250),
        lastRow(p2, 230),
        lastRow(p3, 230),
      ]);
      renderPotLastGame();
      const rows = getLastGameCells().map((cell, i) => [
        cell.textContent,
        getPayoutTexts()[i],
      ]);
      expect(rows).toEqual([
        [p1, "$200.00"],
        [p2, "$37.50"],
        [p3, "$37.50"],
      ]);
    });
  });

  // -------------------------------------------------------------------------
  describe("render last game table", () => {
    it("calls potLastGameResults with the props", () => {
      renderPotLastGame();
      expect(mockPotLastGameResults).toHaveBeenCalledTimes(1);
      expect(mockPotLastGameResults).toHaveBeenCalledWith(
        pot.id,
        tmntFullData,
        potResultsRows,
        numGames
      );
    });

    it("renders the header for the last game number", () => {
      renderPotLastGame();
      expect(
        within(getLastGameTable()).getByRole("columnheader", { name: `Game ${String(numGames)}` })
      ).toBeInTheDocument();
    });

    it("uses numGames in the header", () => {
      renderPotLastGame({ numGames: 3 });
      expect(
        within(getLastGameTable()).getByRole("columnheader", { name: "Game 3" })
      ).toBeInTheDocument();
      expect(mockPotLastGameResults).toHaveBeenCalledWith(
        pot.id,
        tmntFullData,
        potResultsRows,
        3
      );
    });

    it("renders one row per last game result, in order", () => {
      renderPotLastGame();
      const cells = getLastGameCells();
      expect(cells).toHaveLength(lastGameResults.length);
      lastGameResults.forEach((row, i) => {
        expect(cells[i]).toHaveTextContent(row.player_id);
      });
    });

    it("keeps the order returned by potLastGameResults", () => {
      mockPotLastGameResults.mockReturnValue([
        makeRow(p2, numGames, 180, 20),
        makeRow(p1, numGames, 230, 15),
      ]);
      renderPotLastGame();
      const cells = getLastGameCells();
      expect(cells[0]).toHaveTextContent(p2);
      expect(cells[1]).toHaveTextContent(p1);
    });

    it("renders a header and no rows when there are no last game results", () => {
      mockPotLastGameResults.mockReturnValue([]);
      renderPotLastGame();
      const table = getLastGameTable();
      expect(
        within(table).getByRole("columnheader", { name: `Game ${String(numGames)}` })
      ).toBeInTheDocument();
      expect(within(table).queryAllByRole("cell")).toHaveLength(0);
      expect(getPayoutCells()).toHaveLength(2);
      expect(mockPlayerNameWithScore).not.toHaveBeenCalled();
    });

    it("renders rows for a last game whose scores are not entered yet", () => {
      mockPotLastGameResults.mockReturnValue([
        makeRow(p1, numGames, null, null),
        makeRow(p2, numGames, null, null),
      ]);
      renderPotLastGame();
      expect(getLastGameCells()).toHaveLength(2);
      expect(mockPlayerNameWithScore.mock.calls[0]?.[0].row.scoreWithHdcp).toBeNull();
    });

    it("renders a PlayerNameWithScore for every row", () => {
      renderPotLastGame();
      expect(screen.getAllByTestId("player-name-with-score")).toHaveLength(
        lastGameResults.length
      );
      expect(mockPlayerNameWithScore).toHaveBeenCalledTimes(lastGameResults.length);
    });

    it("passes row, tmntFullData and the pot's div to PlayerNameWithScore", () => {
      renderPotLastGame();
      lastGameResults.forEach((row, i) => {
        const props = mockPlayerNameWithScore.mock.calls[i]?.[0];
        expect(props?.row).toBe(row);
        expect(props?.tmntFullData).toBe(tmntFullData);
        expect(props?.div).toBe(scratchDiv);
      });
    });

    it("passes the handicap div when the pot is in a handicap division", () => {
      setPotDiv(hdcpDiv);
      renderPotLastGame();
      expect(mockPlayerNameWithScore.mock.lastCall?.[0].div).toBe(hdcpDiv);
    });

    it("uses the handicap game width when the div has a handicap", () => {
      setPotDiv(hdcpDiv);
      renderPotLastGame();
      getLastGameCells().forEach((cell) => {
        expect(cell).toHaveStyle({ width: `${potHdcpGameWidth}px` });
        expect(cell).toHaveClass("align-middle");
      });
    });

    it("uses the scratch game width when the div is scratch", () => {
      renderPotLastGame();
      getLastGameCells().forEach((cell) => {
        expect(cell).toHaveStyle({ width: `${potNoHdcpGameWidth}px` });
        expect(cell).toHaveClass("align-middle");
      });
    });
  });
});
