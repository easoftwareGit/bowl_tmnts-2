import { populateStandingsRows } from "@/app/results/tmnt/[tmntId]/standings/populateStandingsRows";
import { calcNumGames, getLastGameWithScores } from "@/components/tmnts/games";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { localConfig } from "@/lib/currency/const";
import { PAR } from "@/lib/validation/constants";
import {
  tgrGameKey,
  tgrHdcpKey,
  type tmntGameResult,
} from "@/lib/types/resultsTypes";
import type { divPfType, playerType } from "@/lib/types/types";
import {
  mockTmntFullData,
  mockGames,
  mockDivPfs,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

/*************************/
/* mocks for dependencies */
/*************************/
jest.mock("@/components/tmnts/games", () => ({
  calcNumGames: jest.fn(),
  getLastGameWithScores: jest.fn(),
}));

const mockedCalcNumGames = calcNumGames as jest.Mock;
const mockedLastGame = getLastGameWithScores as jest.Mock;

/********************************************/
/* fixtures built from mockTmntFullData     */
/********************************************/
const { players } = mockTmntFullData;
const [scratchDiv, hdcpDiv] = mockTmntFullData.divs;
// mock scratch division pays 212 for first and 120 for second
const justDivPfs: divPfType[] = mockDivPfs.filter(
  (pf) => pf.div_id === scratchDiv.id
);

const NUM_GAMES = 6;

// player number (1-8) -> player id from the mock
const pid = (n: number) => players[n - 1].id;
const order = (...nums: number[]) => nums.map(pid);

type AnyRecord = Record<string, unknown>;
const asRecord = (obj: unknown) => obj as AnyRecord;

const scoresFor = (playerId: string): number[] =>
  mockGames
    .filter((g) => g.player_id === playerId)
    .sort((a, b) => a.game_num - b.game_num)
    .map((g) => g.score);

// handicap per game for the mock handicap division
const hdcpPerGame = (average: number) =>
  Math.floor(hdcpDiv.hdcp_per * (hdcpDiv.hdcp_from - average));

/**
 * Builds one game result from a mock player and that player's mock scores
 * (or the scores passed in).
 */
const buildResult = (
  p: playerType,
  scores: (number | null)[] = scoresFor(p.id)
): tmntGameResult => {
  const hdcp = hdcpPerGame(p.average);
  const total = scores.reduce<number>((sum, s) => sum + (s ?? 0), 0);
  const totalHdcp = hdcp * scores.filter((s) => s != null).length;

  const result: AnyRecord = {
    player_id: p.id,
    full_name: `${p.first_name} ${p.last_name}`,
    average: p.average,
    hdcp,
    total,
    total_hdcp: totalHdcp,
    "total + Hdcp": total + totalHdcp,
  };
  scores.forEach((score, i) => {
    result[tgrGameKey(i + 1)] = score;
    result[tgrHdcpKey(i + 1)] = score == null ? null : score + hdcp;
  });
  return result as unknown as tmntGameResult;
};

// sorted by total + Hdcp, highest first, like the SQL result
const buildResults = (): tmntGameResult[] =>
  players
    .map((p) => buildResult(p))
    .sort(
      (a, b) =>
        (asRecord(b)["total + Hdcp"] as number) -
        (asRecord(a)["total + Hdcp"] as number)
    );

// total + Hdcp: p8 1666, p3 1463, p4 1398, p2 1394, p6 1382, p5 1360, p7 1349, p1 1279
const SORTED_ORDER = order(8, 3, 4, 2, 6, 5, 7, 1);

const getResult = (results: tmntGameResult[], playerNum: number) =>
  results.find((r) => r.player_id === pid(playerNum)) as tmntGameResult;

// the same results, in the order of the player numbers given
const reorder = (results: tmntGameResult[], ...nums: number[]) =>
  nums.map((n) => getResult(results, n));

// overwrite one result's "total + Hdcp", e.g. to create a tie
const setTotal = (
  results: tmntGameResult[],
  playerNum: number,
  total: number
) => {
  asRecord(getResult(results, playerNum))["total + Hdcp"] = total;
};

const makePf = (position: number, amount: number) =>
  ({
    id: `pf_${position}`,
    div_id: scratchDiv.id,
    position,
    amount,
  }) as unknown as divPfType;

const fmt = (n: number) => formatValueSymbSep2Dec(String(n), localConfig);
const NO_PRIZE = "";

describe("populateStandingsRows", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedCalcNumGames.mockReturnValue(NUM_GAMES);
    mockedLastGame.mockReturnValue(NUM_GAMES); // at the last game, so ties are calculated
  });

  describe("fixture sanity check", () => {
    it("par is 200", () => {
      expect(PAR).toBe(200);
    });

    it("every mock player has six scores, none above 300", () => {
      players.forEach((p) => {
        const scores = scoresFor(p.id);
        expect(scores).toHaveLength(NUM_GAMES);
        scores.forEach((s) => expect(s).toBeLessThanOrEqual(300));
      });
    });

    it("builds the expected order by total + Hdcp", () => {
      expect(buildResults().map((r) => r.player_id)).toEqual(SORTED_ORDER);
    });

    it("the mock scratch division has two prize funds, 212 and 120", () => {
      expect(justDivPfs.map((pf) => pf.amount)).toEqual([212, 120]);
    });

    it("the mock scratch prize funds are position 1 = 212 and position 2 = 120", () => {
      expect(justDivPfs.map((pf) => [pf.position, pf.amount])).toEqual([
        [1, 212],
        [2, 120],
      ]);
    });    
  });

  describe("row mapping", () => {
    it("returns one row per result, in order of total + Hdcp", () => {
      const rows = populateStandingsRows(buildResults(), justDivPfs);

      expect(rows).toHaveLength(players.length);
      expect(rows.map((r) => r.player_id)).toEqual(SORTED_ORDER);
    });

    it("asks calcNumGames for the number of games in the results", () => {
      const results = buildResults();
      populateStandingsRows(results, justDivPfs);

      expect(mockedCalcNumGames).toHaveBeenCalledWith(results);
    });

    it("copies the player fields from the result", () => {
      const rows = populateStandingsRows(buildResults(), justDivPfs);

      // first row is player 8: Terri Smith, average 191
      expect(rows[0]).toMatchObject({
        id: pid(8),
        player_id: pid(8),
        full_name: "Terri Smith",
        average: 191,
        hdcp: 35, // floor(0.9 * (230 - 191))
        total: 1456,
        total_hdcp: 210, // 35 * 6
        total_plus_total_hdcp: 1666,
      });
    });

    it("sets id to the player id", () => {
      const rows = populateStandingsRows(buildResults(), justDivPfs);
      rows.forEach((row) => expect(row.id).toBe(row.player_id));
    });

    it("uses 0 for total_plus_total_hdcp when the result has no 'total + Hdcp'", () => {
      const result = buildResult(players[0]);
      delete asRecord(result)["total + Hdcp"];

      const rows = populateStandingsRows([result], justDivPfs);
      expect(rows[0].total_plus_total_hdcp).toBe(0);
    });

    it("returns an empty array when there are no results", () => {
      mockedCalcNumGames.mockReturnValue(0);
      expect(populateStandingsRows([], justDivPfs)).toEqual([]);
    });
  });

  describe("sorting", () => {
    it("sorts rows by total + Hdcp when the results arrive unsorted", () => {
      const unsorted = reorder(buildResults(), 1, 2, 3, 4, 5, 6, 7, 8);
      const rows = populateStandingsRows(unsorted, justDivPfs);

      expect(rows.map((r) => r.player_id)).toEqual(SORTED_ORDER);
    });

    it("keeps the incoming order for results tied on total + Hdcp", () => {
      const results = buildResults();
      setTotal(results, 1, 1463); // player 1 ties player 3

      const p1First = reorder(results, 8, 1, 3, 4, 2, 6, 5, 7);
      const p3First = reorder(results, 8, 3, 1, 4, 2, 6, 5, 7);

      expect(
        populateStandingsRows(p1First, justDivPfs).map((r) => r.player_id)
      ).toEqual(order(8, 1, 3, 4, 2, 6, 5, 7));
      expect(
        populateStandingsRows(p3First, justDivPfs).map((r) => r.player_id)
      ).toEqual(order(8, 3, 1, 4, 2, 6, 5, 7));
    });

    it("does not modify the arrays or results passed in", () => {
      const unsorted = reorder(buildResults(), 1, 2, 3, 4, 5, 6, 7, 8);
      const reversedFunds = [...justDivPfs].reverse();
      const resultIds = unsorted.map((r) => r.player_id);
      const fundIds = reversedFunds.map((pf) => pf.id);
      const resultsBefore = JSON.stringify(unsorted);

      populateStandingsRows(unsorted, reversedFunds);

      expect(unsorted.map((r) => r.player_id)).toEqual(resultIds);
      expect(reversedFunds.map((pf) => pf.id)).toEqual(fundIds);
      expect(JSON.stringify(unsorted)).toBe(resultsBefore);
    });
  });

  describe("game and handicap columns", () => {
    it("copies every game score and game handicap score from the mock games", () => {
      const rows = populateStandingsRows(buildResults(), justDivPfs);

      // player 1: 201, 202, 203, 252, 182, 185; handicap 9 per game
      const row = asRecord(rows.find((r) => r.player_id === pid(1)));
      [201, 202, 203, 252, 182, 185].forEach((score, i) => {
        expect(row[tgrGameKey(i + 1)]).toBe(score);
        expect(row[tgrHdcpKey(i + 1)]).toBe(score + 9);
      });
    });

    it("only copies as many games as calcNumGames reports", () => {
      mockedCalcNumGames.mockReturnValue(3);
      const rows = populateStandingsRows(buildResults(), justDivPfs);

      const row = asRecord(rows.find((r) => r.player_id === pid(1)));
      expect(row[tgrGameKey(3)]).toBe(203);
      expect(row[tgrHdcpKey(3)]).toBe(212);
      expect(row).not.toHaveProperty(tgrGameKey(4));
      expect(row).not.toHaveProperty(tgrHdcpKey(4));
    });

    it("copies no game columns when calcNumGames returns 0", () => {
      mockedCalcNumGames.mockReturnValue(0);
      const rows = populateStandingsRows(buildResults(), justDivPfs);

      const row = asRecord(rows[0]);
      expect(row).not.toHaveProperty(tgrGameKey(1));
      expect(row).not.toHaveProperty(tgrHdcpKey(1));
      expect(rows[0].plus_minus).toBe("0");
    });
  });

  describe("plus_minus (versus par)", () => {
    const plusMinusOf = (playerNum: number) =>
      populateStandingsRows(buildResults(), justDivPfs).find(
        (r) => r.player_id === pid(playerNum)
      )?.plus_minus;

    it("is prefixed with + when the total is above par", () => {
      expect(plusMinusOf(8)).toBe("+256"); // 1456 - 1200
      expect(plusMinusOf(1)).toBe("+25"); // 1225 - 1200
      expect(plusMinusOf(5)).toBe("+112"); // 1312 - 1200
    });

    it("is negative when the total is below par", () => {
      expect(plusMinusOf(4)).toBe("-18"); // 1182 - 1200
      expect(plusMinusOf(7)).toBe("-7"); // 1193 - 1200
    });

    it("is '0' when the scores add up to exactly par", () => {
      const even = buildResult(players[0], Array(NUM_GAMES).fill(PAR));
      const rows = populateStandingsRows([even], justDivPfs);

      expect(rows[0].plus_minus).toBe("0");
    });

    it("skips games with no score", () => {
      // 201 + 202 + 203 + 252 = 858, minus 4 games of par (800)
      const partial = buildResult(players[0], [201, 202, 203, 252, null, null]);
      const rows = populateStandingsRows([partial], justDivPfs);

      expect(rows[0].plus_minus).toBe("+58");
      const row = asRecord(rows[0]);
      expect(row[tgrGameKey(4)]).toBe(252);
      expect(row[tgrGameKey(5)]).toBeNull();
      expect(row[tgrGameKey(6)]).toBeNull();
    });

    it("is '0' for a player with no scores at all", () => {
      const none = buildResult(players[0], Array(NUM_GAMES).fill(null));
      const rows = populateStandingsRows([none], justDivPfs);

      expect(rows[0].plus_minus).toBe("0");
    });
  });

  describe("positions", () => {
    it("gives each row its own position when there are no ties", () => {
      const rows = populateStandingsRows(buildResults(), justDivPfs);

      expect(rows.map((r) => r.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it("gives tied rows the same position and skips the next one (1, 2, 2, 4)", () => {
      const results = buildResults();
      setTotal(results, 4, 1463); // player 4 ties player 3 for second
      const rows = populateStandingsRows(results, justDivPfs);

      expect(rows.map((r) => r.position)).toEqual([1, 2, 2, 4, 5, 6, 7, 8]);
    });

    it("gives a tie for first the same position (1, 1, 3)", () => {
      const results = buildResults();
      setTotal(results, 3, 1666); // player 3 ties player 8 for first
      const rows = populateStandingsRows(results, justDivPfs);

      expect(rows.map((r) => r.position).slice(0, 4)).toEqual([1, 1, 3, 4]);
    });

    it("handles a three-way tie (2, 2, 2, 5)", () => {
      const results = buildResults();
      setTotal(results, 4, 1463);
      setTotal(results, 2, 1463);
      const rows = populateStandingsRows(results, justDivPfs);

      expect(rows.map((r) => r.position).slice(0, 5)).toEqual([1, 2, 2, 2, 5]);
    });

    it("gives every row position 1 when all totals are equal", () => {
      const results = buildResults();
      results.forEach((r) => {
        asRecord(r)["total + Hdcp"] = 1400;
      });
      const rows = populateStandingsRows(results, justDivPfs);

      rows.forEach((row) => expect(row.position).toBe(1));
    });
  });

  describe("prizes", () => {
    it("pays the top rows and leaves the rest blank", () => {
      const rows = populateStandingsRows(buildResults(), justDivPfs);

      expect(rows.map((r) => r.prize)).toEqual([
        fmt(212),
        fmt(120),
        NO_PRIZE,
        NO_PRIZE,
        NO_PRIZE,
        NO_PRIZE,
        NO_PRIZE,
        NO_PRIZE,
      ]);
    });

    it("pays prizes in position order even when the funds arrive out of order", () => {
      const rows = populateStandingsRows(
        buildResults(),
        [...justDivPfs].reverse()
      );

      expect(rows[0].prize).toBe(fmt(212));
      expect(rows[1].prize).toBe(fmt(120));
    });

    it("splits the combined prize for a tie for first", () => {
      const results = buildResults();
      setTotal(results, 3, 1666);
      const rows = populateStandingsRows(results, justDivPfs);

      // (212 + 120) / 2 = 166 each
      expect(rows[0].prize).toBe(fmt(166));
      expect(rows[1].prize).toBe(fmt(166));
      expect(rows[2].prize).toBe(NO_PRIZE);
    });

    it("only splits prize money that exists when a tie runs past the last paid place", () => {
      const results = buildResults();
      setTotal(results, 4, 1463); // tie for second, only the second prize (120) exists
      const rows = populateStandingsRows(results, justDivPfs);

      expect(rows[0].prize).toBe(fmt(212));
      expect(rows[1].prize).toBe(fmt(60));
      expect(rows[2].prize).toBe(fmt(60));
      expect(rows[3].prize).toBe(NO_PRIZE);
    });

    it("splits a tie that is exactly covered by prize funds", () => {
      const results = buildResults();
      setTotal(results, 4, 1463); // tie for second
      const threeFunds = [makePf(1, 100), makePf(2, 50), makePf(3, 30)];
      const rows = populateStandingsRows(results, threeFunds);

      // (50 + 30) / 2 = 40 each
      expect(rows[0].prize).toBe(fmt(100));
      expect(rows[1].prize).toBe(fmt(40));
      expect(rows[2].prize).toBe(fmt(40));
      expect(rows[3].prize).toBe(NO_PRIZE);
    });

    it("does not calculate ties before the last game", () => {
      mockedLastGame.mockReturnValue(4); // games 5 and 6 have no scores yet
      const results = buildResults();
      setTotal(results, 3, 1666); // tied for first, but ties are ignored for now
      const rows = populateStandingsRows(results, justDivPfs);

      expect(rows[0].prize).toBe(fmt(212));
      expect(rows[1].prize).toBe(fmt(120));
    });

    it("does not throw when there are fewer results than prize funds", () => {
      const threeFunds = [makePf(1, 100), makePf(2, 50), makePf(3, 25)];
      const twoResults = buildResults().slice(0, 2);

      expect(() => populateStandingsRows(twoResults, threeFunds)).not.toThrow();
      const rows = populateStandingsRows(twoResults, threeFunds);
      expect(rows.map((r) => r.prize)).toEqual([fmt(100), fmt(50)]);
    });

    it("leaves every prize blank when the division has no prize funds", () => {
      const rows = populateStandingsRows(buildResults(), []);

      rows.forEach((row) => expect(row.prize).toBe(NO_PRIZE));
    });

    it("leaves every prize blank when no games have been bowled", () => {
      mockedCalcNumGames.mockReturnValue(0);
      const rows = populateStandingsRows(buildResults(), justDivPfs);

      rows.forEach((row) => expect(row.prize).toBe(NO_PRIZE));
    });

    it("treats a prize fund with no amount as 0", () => {
      const noAmount = {
        id: "pf_1",
        div_id: scratchDiv.id,
        position: 1,
        amount: undefined,
      } as unknown as divPfType;
      const rows = populateStandingsRows(buildResults(), [noAmount]);

      expect(rows[0].prize).toBe(fmt(0));
    });
  });

  describe("rows, positions and prizes stay aligned when results arrive unsorted", () => {
    // Input order: p3, p1, p8, p2, p4, p5, p6, p7.
    // p3 and p8 are tied for first but NOT next to each other in the input.
    const buildUnsortedWithTie = () => {
      const results = buildResults();
      setTotal(results, 3, 1666);
      return reorder(results, 3, 1, 8, 2, 4, 5, 6, 7);
    };

    it("orders the rows by total, ties keep their incoming order", () => {
      const rows = populateStandingsRows(buildUnsortedWithTie(), justDivPfs);

      expect(rows.map((r) => r.player_id)).toEqual(order(3, 8, 4, 2, 6, 5, 7, 1));
    });

    it("gives the tied rows the tie position", () => {
      const rows = populateStandingsRows(buildUnsortedWithTie(), justDivPfs);

      expect(rows.map((r) => r.position)).toEqual([1, 1, 3, 4, 5, 6, 7, 8]);
    });

    it("splits the tied prize across the tied rows", () => {
      const rows = populateStandingsRows(buildUnsortedWithTie(), justDivPfs);

      expect(rows[0].prize).toBe(fmt(166));
      expect(rows[1].prize).toBe(fmt(166));
      expect(rows[2].prize).toBe(NO_PRIZE);
    });
  });
});
