import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import TmntStandingsForm from "@/app/results/tmnt/[tmntId]/standings/tmntStandingsForm";
import { populateStandingsRows } from "@/app/results/tmnt/[tmntId]/standings/populateStandingsRows";
import { getGameNums } from "@/components/tmnts/games";
import type {
  tmntGameResult,
  tmntStandingsTableRow,
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
jest.mock(
  "@/app/results/tmnt/[tmntId]/standings/populateStandingsRows",
  () => ({
    populateStandingsRows: jest.fn(),
  })
);

jest.mock("@/components/tmnts/games", () => ({
  getGameNums: jest.fn(),
}));

const mockedPopulate = populateStandingsRows as jest.Mock;
const mockedGetGameNums = getGameNums as jest.Mock;

/********************************************/
/* fixtures built from mockTmntFullData     */
/********************************************/
const { players } = mockTmntFullData;
const [scratchDiv, hdcpDiv]: divDataType[] = mockTmntFullData.divs;
const GAME_NUMS = [1, 2, 3, 4, 5, 6];

// player number (1-8) -> player id from the mock
const pid = (n: number) => players[n - 1].id;
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

const signed = (n: number) => (n > 0 ? `+${n}` : String(n));

type RowOverrides = Record<number, Record<string, unknown>>;

/**
 * Builds standings rows (one per mock player, in mock player order) from
 * the mock players and mock game scores.
 * For a scratch division total_plus_total_hdcp equals total.
 */
const buildRows = (
  gotHdcp: boolean,
  prizes: string[],
  overrides: RowOverrides = {}
): tmntStandingsTableRow[] => {
  const rows = players.map((p) => {
    const scores = scoresFor(p.id);
    const total = scores.reduce((sum, s) => sum + s, 0);
    const totalHdcp = hdcpPerGame(p.average) * scores.length;
    const row: Record<string, unknown> = {
      player_id: p.id,
      full_name: fullName(p),
      total,
      total_plus_total_hdcp: gotHdcp ? total + totalHdcp : total,
      plus_minus: signed(total - p.average * scores.length),
      position: "",
      prize: "",
    };
    scores.forEach((score, i) => {
      row[`Game ${i + 1}`] = score;
    });
    return row;
  });

  // position and prize come from the ranking by total_plus_total_hdcp
  [...rows]
    .sort(
      (a, b) =>
        (b.total_plus_total_hdcp as number) -
        (a.total_plus_total_hdcp as number)
    )
    .forEach((row, rank) => {
      row.position = String(rank + 1);
      row.prize = prizes[rank] ?? "";
    });

  // apply overrides after ranking so the displayed position/prize stay put
  return rows.map((row, i) => ({
    ...row,
    ...(overrides[i + 1] ?? {}),
  })) as unknown as tmntStandingsTableRow[];
};

const makeResult = (playerId: string, divId: string) =>
  ({ player_id: playerId, div_id: divId }) as unknown as tmntGameResult;

const makePf = (id: string, divId: string, position: number, amount: number) =>
  ({ id, div_id: divId, position, amount }) as unknown as divPfType;

const scratchResults = players.map((p) => makeResult(p.id, scratchDiv.id));
const hdcpResults = players.map((p) => makeResult(p.id, hdcpDiv.id));
const allResults = [...scratchResults, ...hdcpResults];

// scratch division prize funds come straight from the mock
const scratchPfs = mockDivPfs.filter((pf) => pf.div_id === scratchDiv.id);
// the mock has no prize funds for the handicap division
const hdcpPfs = [makePf(divPfId3, hdcpDiv.id, 1, 5000)];
const allPfs = [...mockDivPfs, ...hdcpPfs];

const scratchPrizes = scratchPfs.map((pf) => `$${pf.amount}`);
const hdcpPrizes = hdcpPfs.map((pf) => `$${pf.amount}`);

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
    rows ?? buildRows(isHdcp, isHdcp ? hdcpPrizes : scratchPrizes);

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
  buildRows(true, hdcpPrizes, overrides);

const getBodyRows = () => screen.getAllByRole("row").slice(1);

const cellTexts = (row: HTMLElement) =>
  within(row)
    .getAllByRole("cell")
    .map((cell) => cell.textContent);

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
        scores.forEach((s) => expect(s).toBeLessThanOrEqual(300));
      });
    });

    it("builds the expected totals from the mock games", () => {
      const rows = buildRows(true, []);
      const byId = (n: number) =>
        rows.find((r) => r.player_id === pid(n)) as unknown as Record<string, number>;

      // player 8: 230 + 231 + 232 + 263 + 261 + 239
      expect(byId(8).total).toBe(1456);
      // player 8 average 191 -> (230 - 191) * 0.9 = 35 per game
      expect(byId(8).total_plus_total_hdcp).toBe(1456 + 35 * 6);
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
    it("renders Player, game numbers, Total, +/- and Prize headers", () => {
      renderForm({ div: scratchDiv });

      expect(screen.getByRole("button", { name: "Player" })).toBeInTheDocument();
      GAME_NUMS.forEach((n) => {
        expect(
          screen.getByRole("columnheader", { name: String(n) })
        ).toBeInTheDocument();
      });
      expect(screen.getByRole("button", { name: "Total" })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: "+/-" })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: "Prize" })).toBeInTheDocument();
    });

    it("does not render the Scratch header", () => {
      renderForm({ div: scratchDiv });

      expect(screen.queryByRole("button", { name: "Scratch" })).not.toBeInTheDocument();
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
    it("renders the Scratch header and no +/- header", () => {
      renderForm({ div: hdcpDiv });

      expect(screen.getByRole("button", { name: "Scratch" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Total" })).toBeInTheDocument();
      expect(screen.queryByRole("columnheader", { name: "+/-" })).not.toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: "Prize" })).toBeInTheDocument();
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
      expect(cellTexts(getBodyRows()[0])).toEqual([
        "1",
        "Terri Smith",
        "230",
        "231",
        "232",
        "263",
        "261",
        "239",
        "1456", // total_plus_total_hdcp, same as total for scratch
        "+310", // 1456 - (191 * 6)
        "$212",
      ]);
    });

    it("renders the scratch total, then the handicap total, and no plus/minus for a handicap division", () => {
      renderForm({ div: hdcpDiv });

      expect(cellTexts(getBodyRows()[0])).toEqual([
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
        "$5000",
      ]);
    });

    it("links each total to the player's detail page", () => {
      renderForm({ div: scratchDiv });

      const firstRow = getBodyRows()[0];
      expect(within(firstRow).getByRole("link", { name: "1456" })).toHaveAttribute(
        "href",
        `/results/tmnt/${tmntId}/standings/div/${scratchDiv.id}/player/${pid(8)}`
      );
    });

    it("uses the division id of the rendered division in the player links", () => {
      renderForm({ div: hdcpDiv });

      const firstRow = getBodyRows()[0];
      expect(within(firstRow).getByRole("link")).toHaveAttribute(
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

    it("breaks name ties by total_plus_total_hdcp when sorting by player", () => {
      // players 2 and 4 now share a name; player 4 has the higher total
      renderForm({
        div: hdcpDiv,
        rows: hdcpRows({ 4: { full_name: fullName(players[1]) } }),
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

    it("treats a missing scratch total as 0 when sorting by scratch", () => {
      // player 8 has the highest total_plus_total_hdcp but no scratch total
      renderForm({
        div: hdcpDiv,
        rows: hdcpRows({ 8: { total: undefined } }),
      });

      fireEvent.click(screen.getByRole("button", { name: "Scratch" }));
      const playerOrder = getPlayerOrder();
      expect(playerOrder[playerOrder.length - 1]).toBe(pid(8));
    });

    it("returns to the total sort when Total is clicked after another sort", () => {
      renderForm({ div: hdcpDiv, rows: hdcpRows() });

      fireEvent.click(screen.getByRole("button", { name: "Scratch" }));
      expect(getPlayerOrder()).toEqual(order(8, 5, 3, 2, 6, 1, 7, 4));

      fireEvent.click(screen.getByRole("button", { name: "Total" }));
      expect(getPlayerOrder()).toEqual(order(8, 3, 4, 2, 6, 5, 7, 1));
    });

    it("sorts a scratch division by total by default", () => {
      renderForm({ div: scratchDiv });
      expect(getPlayerOrder()).toEqual(order(8, 5, 3, 2, 6, 1, 7, 4));
    });
  });

  describe("cut row", () => {
    it("marks the row after the last paid position with the cut-row class", () => {
      renderForm({ div: scratchDiv });

      // 2 prize funds for the scratch division: the cut line is under the 2nd row
      const rows = getBodyRows();
      expect(rows[0]).not.toHaveClass("cut-row");
      expect(rows[1]).toHaveClass("cut-row");
      expect(rows[2]).not.toHaveClass("cut-row");
      expect(rows[7]).not.toHaveClass("cut-row");
    });

    it("bases the cut row on the rendered division's prize funds only", () => {
      renderForm({ div: hdcpDiv });

      // 1 prize fund for the handicap division: the cut line is under the 1st row
      const rows = getBodyRows();
      expect(rows[0]).toHaveClass("cut-row");
      expect(rows[1]).not.toHaveClass("cut-row");
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
      [0, "90px"],
      [999, "90px"],
      [1000, "130px"],
      [9999, "130px"],
      [10000, "180px"],
    ])("sets the Prize column width for a first prize of %i to %s", (amount, width) => {
      renderForm({
        div: scratchDiv,
        divPfs: [makePf(divPfId3, scratchDiv.id, 1, amount)],
      });

      expect(screen.getByRole("columnheader", { name: "Prize" })).toHaveStyle({ width });
    });

    it("uses the default Prize column width when the division has no prize funds", () => {
      renderForm({ div: scratchDiv, divPfs: [] });

      expect(screen.getByRole("columnheader", { name: "Prize" })).toHaveStyle({
        width: "90px",
      });
    });

    it("uses a 40px position column for 100 or fewer results", () => {
      const results = Array.from({ length: 100 }, (_, i) =>
        makeResult(players[i % players.length].id, scratchDiv.id)
      );
      renderForm({ results });

      expect(screen.getAllByRole("columnheader")[0]).toHaveStyle({ width: "40px" });
    });

    it("uses a 55px position column for more than 100 results", () => {
      const results = Array.from({ length: 101 }, (_, i) =>
        makeResult(players[i % players.length].id, scratchDiv.id)
      );
      renderForm({ results });

      expect(screen.getAllByRole("columnheader")[0]).toHaveStyle({ width: "55px" });
    });
  });
});
