// test/app/results/tmnts/standings/tmntStandingsForm.test.tsx
// test for src/app/results/tmnt/[tmntId]/standings/tmntStandingsForm.tsx
import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import TmntStandingsForm from "@/app/results/tmnt/[tmntId]/standings/tmntStandingsForm";
import { populateStandingsRows } from "@/app/results/tmnt/[tmntId]/standings/populateStandingsRows";
import { getGameNums } from "@/components/tmnts/games";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { localConfig } from "@/lib/currency/const";
import { PAR } from "@/lib/validation/constants";
import {
  tgrGameKey,
  tgrHdcpKey,
  type tmntGameResult,
  type tmntStandingsTableRow,
} from "@/lib/types/resultsTypes";
import type { divDataType, divPfType, playerType } from "@/lib/types/types";
import {
  mockTmntFullData,
  mockGames,
  mockDivPfs,
  tmntId,
  divPfId3,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

/*************************/
/* mocks for dependencies */
/*************************/
// populateStandingsRows and getGameNums have their own tests. The money
// formatter is NOT mocked, so prizes look like they do on the page.
jest.mock(
  "@/app/results/tmnt/[tmntId]/standings/populateStandingsRows",
  () => ({
    populateStandingsRows: jest.fn(),
  })
);

jest.mock("@/components/tmnts/games", () => ({
  getGameNums: jest.fn(),
}));

const mockedPopulate = jest.mocked(populateStandingsRows);
const mockedGetGameNums = jest.mocked(getGameNums);

/********************************************/
/* helpers                                  */
/********************************************/

/** array item that must exist (keeps noUncheckedIndexedAccess happy) */
const at = <T,>(arr: readonly T[], index: number): T => {
  const item = arr[index];
  if (item === undefined) {
    throw new Error(`no item at index ${String(index)}`);
  }
  return item;
};

const money = (amount: number) =>
  formatValueSymbSep2Dec(amount.toString(), localConfig);

/********************************************/
/* fixtures built from mockTmntFullData     */
/********************************************/
const { players } = mockTmntFullData;
const scratchDiv: divDataType = at(mockTmntFullData.divs, 0);
const hdcpDiv: divDataType = at(mockTmntFullData.divs, 1);
const GAME_NUMS = [1, 2, 3, 4, 5, 6];

// player number (1-8) -> player id from the mock
const pid = (n: number) => at(players, n - 1).id;
// expected display order, written as player numbers
const order = (...nums: number[]) => nums.map(pid);

const fullName = (p: playerType) => `${p.first_name} ${p.last_name}`;

const scoresFor = (playerId: string): number[] =>
  mockGames
    .filter((g) => g.player_id === playerId)
    .sort((a, b) => a.game_num - b.game_num)
    .map((g) => g.score);

// handicap per game for the mock handicap division
const hdcpPerGame = (average: number) =>
  Math.floor(hdcpDiv.hdcp_per * (hdcpDiv.hdcp_from - average));

// same rule as populateStandingsRows: scratch pins over PAR per game
const plusMinus = (scores: number[]) => {
  const diff = scores.reduce((sum, s) => sum + (s - PAR), 0);
  return diff > 0 ? `+${String(diff)}` : String(diff);
};

type RowOverrides = Record<number, Partial<tmntStandingsTableRow>>;

/**
 * Builds standings rows (one per mock player, in mock player order) from
 * the mock players and mock game scores, shaped like populateStandingsRows'
 * output. For a scratch division total_plus_total_hdcp equals total.
 *
 * @param gotHdcp - true for the handicap division
 * @param prizeAmounts - prize amounts in finishing order (1st, 2nd, ...)
 * @param overrides - fields to change, by player number (1-8)
 */
const buildRows = (
  gotHdcp: boolean,
  prizeAmounts: number[],
  overrides: RowOverrides = {}
): tmntStandingsTableRow[] => {
  const rows = players.map((p) => {
    const scores = scoresFor(p.id);
    const hdcp = gotHdcp ? hdcpPerGame(p.average) : 0;
    const total = scores.reduce((sum, s) => sum + s, 0);
    const totalHdcp = hdcp * scores.length;
    const row: tmntStandingsTableRow = {
      id: p.id,
      position: 0,
      player_id: p.id,
      full_name: fullName(p),
      average: p.average,
      hdcp,
      total,
      total_hdcp: totalHdcp,
      total_plus_total_hdcp: total + totalHdcp,
      plus_minus: plusMinus(scores),
      prize: "",
    };
    scores.forEach((score, i) => {
      row[tgrGameKey(i + 1)] = score;
      row[tgrHdcpKey(i + 1)] = score + hdcp;
    });
    return row;
  });

  // position and prize come from the ranking by total_plus_total_hdcp
  // (no ties in the mock data)
  [...rows]
    .sort((a, b) => b.total_plus_total_hdcp - a.total_plus_total_hdcp)
    .forEach((row, rank) => {
      const amount = prizeAmounts[rank];
      row.position = rank + 1;
      row.prize = amount === undefined ? "" : money(amount);
    });

  // apply overrides after ranking so the displayed position/prize stay put
  rows.forEach((row, i) => {
    Object.assign(row, overrides[i + 1]);
  });
  return rows;
};

const makeResult = (playerId: string, divId: string) =>
  ({ player_id: playerId, div_id: divId }) as unknown as tmntGameResult;

const makePf = (
  id: string,
  divId: string,
  position: number,
  amount: number
): divPfType => ({ id, div_id: divId, position, amount });

const scratchResults = players.map((p) => makeResult(p.id, scratchDiv.id));
const hdcpResults = players.map((p) => makeResult(p.id, hdcpDiv.id));
const allResults = [...scratchResults, ...hdcpResults];

// scratch division prize funds come straight from the mock (212, 120)
const scratchPfs = mockDivPfs.filter((pf) => pf.div_id === scratchDiv.id);
// the mock has no prize funds for the handicap division
const hdcpPfs = [makePf(divPfId3, hdcpDiv.id, 1, 5000)];
const allPfs = [...mockDivPfs, ...hdcpPfs];

const amountsOf = (pfs: divPfType[]) => pfs.map((pf) => pf.amount ?? 0);

type RenderOpts = {
  div?: divDataType;
  results?: tmntGameResult[];
  divPfs?: divPfType[];
  rows?: tmntStandingsTableRow[];
};

const renderForm = ({
  div = scratchDiv,
  results = allResults,
  divPfs = allPfs,
  rows,
}: RenderOpts = {}) => {
  const isHdcp = div.hdcp_per > 0;
  const standingsRows =
    rows ?? buildRows(isHdcp, amountsOf(isHdcp ? hdcpPfs : scratchPfs));

  // fresh copies each call: the component sorts the returned array in place
  mockedPopulate.mockImplementation(() => [...standingsRows]);

  return render(
    <TmntStandingsForm
      tmntId={tmntId}
      div={div}
      tmntResults={results}
      divPfs={divPfs}
    />
  );
};

// handicap-division rows with overrides, for sort tests
const hdcpRows = (overrides: RowOverrides = {}) =>
  buildRows(true, amountsOf(hdcpPfs), overrides);

const getBodyRows = () => screen.getAllByRole("row").slice(1);
const getBodyRow = (index: number) => at(getBodyRows(), index);

const cellTexts = (row: HTMLElement) =>
  within(row)
    .getAllByRole("cell")
    .map((cell) => cell.textContent);

const headerTexts = () =>
  screen.getAllByRole("columnheader").map((th) => th.textContent);

// player ids in displayed order, read from each row's player link
const getPlayerOrder = () =>
  getBodyRows().map((row) => {
    const href = within(row).getByRole("link").getAttribute("href") ?? "";
    return href.split("/").pop();
  });

describe("TmntStandingsForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetGameNums.mockReturnValue(GAME_NUMS);
  });

  describe("fixture sanity check", () => {
    it("mock divisions are one scratch (hdcp_per 0) and one handicap (hdcp_per > 0)", () => {
      expect(scratchDiv.hdcp_per).toBe(0);
      expect(hdcpDiv.hdcp_per).toBeGreaterThan(0);
    });

    it("every mock player has six game scores and none is above 300", () => {
      players.forEach((p) => {
        const scores = scoresFor(p.id);
        expect(scores).toHaveLength(6);
        scores.forEach((s) => {
          expect(s).toBeLessThanOrEqual(300);
        });
      });
    });

    it("builds the expected totals from the mock games", () => {
      const rows = buildRows(true, []);
      const byId = (n: number) => {
        const row = rows.find((r) => r.player_id === pid(n));
        if (!row) throw new Error(`no row for player ${String(n)}`);
        return row;
      };

      // player 8: 230 + 231 + 232 + 263 + 261 + 239
      expect(byId(8).total).toBe(1456);
      // player 8 average 191 -> (230 - 191) * 0.9 = 35 per game
      expect(byId(8).total_plus_total_hdcp).toBe(1456 + 35 * 6);
      // 1456 - (200 * 6), scratch pins only
      expect(byId(8).plus_minus).toBe("+256");
      // player 1: 201 + 202 + 203 + 252 + 182 + 185, average 220 -> 9 per game
      expect(byId(1).total).toBe(1225);
      expect(byId(1).total_plus_total_hdcp).toBe(1225 + 9 * 6);
    });
  });

  describe("data preparation", () => {
    it("passes only this division's results and prize funds to populateStandingsRows", () => {
      renderForm({ div: scratchDiv });

      expect(mockedPopulate).toHaveBeenCalledWith(scratchResults, scratchPfs);
    });

    it("uses the other division's data when rendering the other division", () => {
      renderForm({ div: hdcpDiv });

      expect(mockedPopulate).toHaveBeenCalledWith(hdcpResults, hdcpPfs);
    });

    it("gets the game numbers from all of the tournament results", () => {
      renderForm();

      expect(mockedGetGameNums).toHaveBeenCalledWith(allResults);
    });
  });

  describe("table headers (scratch division)", () => {
    it("renders the headers in order: blank, Player, games, Total, +/-, Prize", () => {
      renderForm({ div: scratchDiv });

      expect(headerTexts()).toEqual([
        " ",
        "Player",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "Total",
        "+/-",
        "Prize",
      ]);
    });

    it("makes Player and Total sort buttons, but not +/- or Prize", () => {
      renderForm({ div: scratchDiv });

      expect(screen.getByRole("button", { name: "Player" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Total" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "+/-" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Prize" })).not.toBeInTheDocument();
    });

    it("does not render the Scratch header", () => {
      renderForm({ div: scratchDiv });

      expect(screen.queryByRole("button", { name: "Scratch" })).not.toBeInTheDocument();
      expect(screen.queryByRole("columnheader", { name: "Scratch" })).not.toBeInTheDocument();
    });

    it("renders headers only for the game numbers returned by getGameNums", () => {
      mockedGetGameNums.mockReturnValue([1, 2, 3]);
      renderForm({ div: scratchDiv });

      [1, 2, 3].forEach((n) => {
        expect(
          screen.getByRole("columnheader", { name: String(n) })
        ).toBeInTheDocument();
      });
      expect(screen.queryByRole("columnheader", { name: "4" })).not.toBeInTheDocument();
    });
  });

  describe("table headers (handicap division)", () => {
    it("renders the headers in order: blank, Player, games, Scratch, Total, Prize (no +/-)", () => {
      renderForm({ div: hdcpDiv });

      expect(headerTexts()).toEqual([
        " ",
        "Player",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "Scratch",
        "Total",
        "Prize",
      ]);
      expect(screen.getByRole("button", { name: "Scratch" })).toBeInTheDocument();
    });
  });

  describe("table rows", () => {
    it("renders one body row per standings row", () => {
      renderForm();
      expect(getBodyRows()).toHaveLength(players.length);
    });

    it("renders position, name, games, total link, plus/minus and prize for a scratch division", () => {
      renderForm({ div: scratchDiv });

      // default sort puts player 8 (Terri Smith, 1456) first
      expect(cellTexts(getBodyRow(0))).toEqual([
        "1",
        "Terri Smith",
        "230",
        "231",
        "232",
        "263",
        "261",
        "239",
        "1456", // total_plus_total_hdcp, same as total for scratch
        "+256", // 1456 - (200 * 6)
        money(212),
      ]);
    });

    it("renders the scratch total, then the handicap total, and no plus/minus for a handicap division", () => {
      renderForm({ div: hdcpDiv });

      expect(cellTexts(getBodyRow(0))).toEqual([
        "1",
        "Terri Smith",
        "230",
        "231",
        "232",
        "263",
        "261",
        "239",
        "1456", // scratch total
        "1666", // 1456 + (35 * 6)
        money(5000),
      ]);
    });

    it("shows the formatted prize for paid places and a blank prize for the rest", () => {
      renderForm({ div: scratchDiv });

      // scratch division pays 2 places: 212 and 120
      const prizeOf = (index: number) => cellTexts(getBodyRow(index)).at(-1);
      expect(prizeOf(0)).toBe("$212.00");
      expect(prizeOf(1)).toBe("$120.00");
      expect(prizeOf(2)).toBe("");
      expect(prizeOf(7)).toBe("");
    });

    it("shows the prize text exactly as populateStandingsRows built it", () => {
      // a 3-way tie split: 1/3 of 332 truncated to cents
      renderForm({
        div: scratchDiv,
        rows: buildRows(false, [], { 8: { prize: "$110.66" } }),
      });

      expect(cellTexts(getBodyRow(0)).at(-1)).toBe("$110.66");
    });

    it("renders a blank cell for a game that has not been bowled", () => {
      renderForm({
        div: scratchDiv,
        // game columns are typed number, so a game not bowled has no value
        rows: buildRows(false, amountsOf(scratchPfs), {
          8: { [tgrGameKey(6)]: undefined },
        }),
      });

      const cells = cellTexts(getBodyRow(0));
      expect(cells[6]).toBe("261"); // game 5
      expect(cells[7]).toBe(""); // game 6
    });

    it("renders one game cell per game number returned by getGameNums", () => {
      mockedGetGameNums.mockReturnValue([1, 2, 3]);
      renderForm({ div: scratchDiv });

      // position, name, 3 games, total, +/-, prize
      expect(cellTexts(getBodyRow(0))).toEqual([
        "1",
        "Terri Smith",
        "230",
        "231",
        "232",
        "1456",
        "+256",
        money(212),
      ]);
    });

    it("links each total to the player's detail page", () => {
      renderForm({ div: scratchDiv });

      expect(within(getBodyRow(0)).getByRole("link", { name: "1456" })).toHaveAttribute(
        "href",
        `/results/tmnt/${tmntId}/standings/div/${scratchDiv.id}/player/${pid(8)}`
      );
    });

    it("uses the division id of the rendered division in the player links", () => {
      renderForm({ div: hdcpDiv });

      expect(within(getBodyRow(0)).getByRole("link")).toHaveAttribute(
        "href",
        `/results/tmnt/${tmntId}/standings/div/${hdcpDiv.id}/player/${pid(8)}`
      );
    });

    it("renders only the header row when there are no standings rows", () => {
      renderForm({ rows: [] });

      expect(getBodyRows()).toHaveLength(0);
      expect(screen.getByRole("columnheader", { name: "Prize" })).toBeInTheDocument();
    });
  });

  describe("sorting", () => {
    // handicap division totals (scratch / scratch + handicap):
    //   p1 1225/1279  p2 1286/1394  p3 1301/1463  p4 1182/1398
    //   p5 1312/1360  p6 1280/1382  p7 1193/1349  p8 1456/1666

    it("sorts by total_plus_total_hdcp by default", () => {
      renderForm({ div: hdcpDiv, rows: hdcpRows() });
      expect(getPlayerOrder()).toEqual(order(8, 3, 4, 2, 6, 5, 7, 1));
    });

    it("sorts by total even when populateStandingsRows returns another order", () => {
      // rows built in mock player order (1-8), not ranking order
      renderForm({ div: hdcpDiv, rows: hdcpRows() });
      expect(getPlayerOrder()).not.toEqual(order(1, 2, 3, 4, 5, 6, 7, 8));
      expect(at(getPlayerOrder(), 0)).toBe(pid(8));
    });

    it("breaks total_plus_total_hdcp ties by name", () => {
      // player 1 (John Doe) ties player 3 (Joe Doe), who sorts first by name
      renderForm({
        div: hdcpDiv,
        rows: hdcpRows({ 1: { total_plus_total_hdcp: 1463 } }),
      });
      expect(getPlayerOrder()).toEqual(order(8, 3, 1, 4, 2, 6, 5, 7));
    });

    it("sorts by player name when Player is clicked", () => {
      renderForm({ div: hdcpDiv, rows: hdcpRows() });

      fireEvent.click(screen.getByRole("button", { name: "Player" }));
      // Jane, Jill, Joe, John Doe, then Terri, Tina, Tom, Tony Smith
      expect(getPlayerOrder()).toEqual(order(2, 4, 3, 1, 8, 7, 5, 6));
    });

    it("ignores case when sorting by player name", () => {
      // "jill doe" in lower case still sorts between Jane and Joe
      renderForm({
        div: hdcpDiv,
        rows: hdcpRows({ 4: { full_name: "jill doe" } }),
      });

      fireEvent.click(screen.getByRole("button", { name: "Player" }));
      expect(getPlayerOrder()).toEqual(order(2, 4, 3, 1, 8, 7, 5, 6));
    });

    it("keeps each player's position when sorted by player", () => {
      renderForm({ div: hdcpDiv, rows: hdcpRows() });

      fireEvent.click(screen.getByRole("button", { name: "Player" }));
      // Jane Doe (player 2) is 4th by total + handicap
      expect(at(cellTexts(getBodyRow(0)), 0)).toBe("4");
      expect(at(cellTexts(getBodyRow(0)), 1)).toBe("Jane Doe");
      // Terri Smith (player 8) is still 1st and keeps the prize
      expect(cellTexts(getBodyRow(4))).toEqual(
        expect.arrayContaining(["1", "Terri Smith", money(5000)])
      );
    });

    it("breaks name ties by total_plus_total_hdcp when sorting by player", () => {
      // players 2 and 4 now share a name; player 4 has the higher total
      renderForm({
        div: hdcpDiv,
        rows: hdcpRows({ 4: { full_name: fullName(at(players, 1)) } }),
      });

      fireEvent.click(screen.getByRole("button", { name: "Player" }));
      expect(getPlayerOrder()).toEqual(order(4, 2, 3, 1, 8, 7, 5, 6));
    });

    it("sorts by scratch total when Scratch is clicked", () => {
      renderForm({ div: hdcpDiv, rows: hdcpRows() });

      fireEvent.click(screen.getByRole("button", { name: "Scratch" }));
      expect(getPlayerOrder()).toEqual(order(8, 5, 3, 2, 6, 1, 7, 4));
    });

    it("breaks scratch total ties by total_plus_total_hdcp", () => {
      // players 2 and 3 tie on scratch total; player 3 has the higher
      // total_plus_total_hdcp even though player 2 comes first in the data
      renderForm({
        div: hdcpDiv,
        rows: hdcpRows({ 2: { total: 1301 } }),
      });

      fireEvent.click(screen.getByRole("button", { name: "Scratch" }));
      expect(getPlayerOrder()).toEqual(order(8, 5, 3, 2, 6, 1, 7, 4));
    });

    it("breaks full ties on scratch by name", () => {
      // player 1 (John Doe) ties player 3 (Joe Doe) on both totals
      renderForm({
        div: hdcpDiv,
        rows: hdcpRows({ 1: { total: 1301, total_plus_total_hdcp: 1463 } }),
      });

      fireEvent.click(screen.getByRole("button", { name: "Scratch" }));
      expect(getPlayerOrder()).toEqual(order(8, 5, 3, 1, 2, 6, 7, 4));
    });

    it("sorts a player with no games bowled (total 0) last when sorting by scratch", () => {
      // the API returns total 0 for a player with no game entries; player 8
      // keeps the highest total_plus_total_hdcp so only the scratch sort moves them
      renderForm({
        div: hdcpDiv,
        rows: hdcpRows({ 8: { total: 0 } }),
      });

      fireEvent.click(screen.getByRole("button", { name: "Scratch" }));
      expect(getPlayerOrder().at(-1)).toBe(pid(8));
    });

    it("returns to the total sort when Total is clicked after another sort", () => {
      renderForm({ div: hdcpDiv, rows: hdcpRows() });

      fireEvent.click(screen.getByRole("button", { name: "Scratch" }));
      expect(getPlayerOrder()).toEqual(order(8, 5, 3, 2, 6, 1, 7, 4));

      fireEvent.click(screen.getByRole("button", { name: "Total" }));
      expect(getPlayerOrder()).toEqual(order(8, 3, 4, 2, 6, 5, 7, 1));
    });

    it("can switch straight from the player sort to the scratch sort", () => {
      renderForm({ div: hdcpDiv, rows: hdcpRows() });

      fireEvent.click(screen.getByRole("button", { name: "Player" }));
      fireEvent.click(screen.getByRole("button", { name: "Scratch" }));
      expect(getPlayerOrder()).toEqual(order(8, 5, 3, 2, 6, 1, 7, 4));
    });

    it("sorts a scratch division by total by default", () => {
      renderForm({ div: scratchDiv });
      expect(getPlayerOrder()).toEqual(order(8, 5, 3, 2, 6, 1, 7, 4));
    });

    it("sorts a scratch division by player name when Player is clicked", () => {
      renderForm({ div: scratchDiv });

      fireEvent.click(screen.getByRole("button", { name: "Player" }));
      expect(getPlayerOrder()).toEqual(order(2, 4, 3, 1, 8, 7, 5, 6));
    });
  });

  describe("cut row", () => {
    it("marks the last paid row with the cut-row class", () => {
      renderForm({ div: scratchDiv });

      // 2 prize funds for the scratch division: the cut line is under the 2nd row
      const rows = getBodyRows();
      expect(rows[0]).not.toHaveClass("cut-row");
      expect(rows[1]).toHaveClass("cut-row");
      expect(rows[2]).not.toHaveClass("cut-row");
      expect(rows[7]).not.toHaveClass("cut-row");
    });

    it("marks only one row", () => {
      renderForm({ div: scratchDiv });

      const cutRows = getBodyRows().filter((row) =>
        row.classList.contains("cut-row")
      );
      expect(cutRows).toHaveLength(1);
    });

    it("bases the cut row on the rendered division's prize funds only", () => {
      renderForm({ div: hdcpDiv });

      // 1 prize fund for the handicap division: the cut line is under the 1st row
      const rows = getBodyRows();
      expect(rows[0]).toHaveClass("cut-row");
      expect(rows[1]).not.toHaveClass("cut-row");
    });

    it("keeps the cut line under place N when places N and N+1 tie", () => {
      // players 5 and 3 tie for 2nd of 2 paid places and split the prize;
      // the line still shows that 2 places are paid
      renderForm({
        div: scratchDiv,
        rows: buildRows(false, amountsOf(scratchPfs), {
          3: { total_plus_total_hdcp: 1312, position: 2, prize: money(60) },
          5: { prize: money(60) },
        }),
      });

      const rows = getBodyRows();
      expect(rows[1]).toHaveClass("cut-row");
      expect(rows[2]).not.toHaveClass("cut-row");
      expect(cellTexts(getBodyRow(2)).at(-1)).toBe(money(60));
    });

    it.each(["Player", "Scratch"])(
      "does not draw the cut line when sorted by %s",
      (buttonName) => {
        renderForm({ div: hdcpDiv, rows: hdcpRows() });

        fireEvent.click(screen.getByRole("button", { name: buttonName }));
        getBodyRows().forEach((row) => {
          expect(row).not.toHaveClass("cut-row");
        });
      }
    );

    it("draws the cut line again when Total is clicked", () => {
      renderForm({ div: scratchDiv });

      fireEvent.click(screen.getByRole("button", { name: "Player" }));
      expect(getBodyRow(1)).not.toHaveClass("cut-row");

      fireEvent.click(screen.getByRole("button", { name: "Total" }));
      expect(getBodyRow(1)).toHaveClass("cut-row");
    });

    it("does not mark any row when the division has no prize funds", () => {
      renderForm({ div: scratchDiv, divPfs: hdcpPfs });

      getBodyRows().forEach((row) => {
        expect(row).not.toHaveClass("cut-row");
      });
    });
  });

  describe("column widths", () => {
    it.each([
      [0, "85px"],
      [999, "85px"],
      [1000, "125px"],
      [9999, "125px"],
      [10000, "170px"],
    ])("sets the Prize column width for a first prize of %i to %s", (amount, width) => {
      renderForm({
        div: scratchDiv,
        divPfs: [makePf(divPfId3, scratchDiv.id, 1, amount)],
      });

      expect(screen.getByRole("columnheader", { name: "Prize" })).toHaveStyle({ width });
    });

    it("ignores other divisions' prize funds when sizing the Prize column", () => {
      // the handicap division's 5000 prize comes first in the list
      renderForm({ div: scratchDiv, divPfs: [...hdcpPfs, ...mockDivPfs] });

      expect(screen.getByRole("columnheader", { name: "Prize" })).toHaveStyle({
        width: "85px",
      });
    });

    it("uses the default Prize column width when the division has no prize funds", () => {
      renderForm({ div: scratchDiv, divPfs: [] });

      expect(screen.getByRole("columnheader", { name: "Prize" })).toHaveStyle({
        width: "85px",
      });
    });

    it("uses fixed widths for the Player, game, Total and +/- columns", () => {
      renderForm({ div: scratchDiv });

      expect(screen.getByRole("columnheader", { name: "Player" })).toHaveStyle({ width: "140px" });
      expect(screen.getByRole("columnheader", { name: "1" })).toHaveStyle({ width: "40px" });
      expect(screen.getByRole("columnheader", { name: "Total" })).toHaveStyle({ width: "65px" });
      expect(screen.getByRole("columnheader", { name: "+/-" })).toHaveStyle({ width: "55px" });
    });

    it("uses a 75px Scratch column in a handicap division", () => {
      renderForm({ div: hdcpDiv });

      expect(screen.getByRole("columnheader", { name: "Scratch" })).toHaveStyle({ width: "75px" });
    });

    it("uses a 40px position column for 100 or fewer results", () => {
      const results = Array.from({ length: 100 }, (_, i) =>
        makeResult(at(players, i % players.length).id, scratchDiv.id)
      );
      renderForm({ results });

      expect(at(screen.getAllByRole("columnheader"), 0)).toHaveStyle({ width: "40px" });
    });

    it("uses a 55px position column for more than 100 results", () => {
      const results = Array.from({ length: 101 }, (_, i) =>
        makeResult(at(players, i % players.length).id, scratchDiv.id)
      );
      renderForm({ results });

      expect(at(screen.getAllByRole("columnheader"), 0)).toHaveStyle({ width: "55px" });
    });

    it("counts only the rendered division's results for the position column", () => {
      // 60 players in each division: 120 results, but only 60 in this division
      const scratch = Array.from({ length: 60 }, (_, i) =>
        makeResult(at(players, i % players.length).id, scratchDiv.id)
      );
      const hdcp = Array.from({ length: 60 }, (_, i) =>
        makeResult(at(players, i % players.length).id, hdcpDiv.id)
      );
      renderForm({ div: scratchDiv, results: [...scratch, ...hdcp] });

      expect(at(screen.getAllByRole("columnheader"), 0)).toHaveStyle({ width: "40px" });
    });

    it("uses a 55px position column when the rendered division has more than 100 results", () => {
      const hdcp = Array.from({ length: 101 }, (_, i) =>
        makeResult(at(players, i % players.length).id, hdcpDiv.id)
      );
      renderForm({ div: hdcpDiv, results: [...scratchResults, ...hdcp] });

      expect(at(screen.getAllByRole("columnheader"), 0)).toHaveStyle({ width: "55px" });
    });
  });
});
