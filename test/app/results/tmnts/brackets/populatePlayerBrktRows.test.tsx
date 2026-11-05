// test/app/results/tmnts/brackets/populatePlayerBrktRows.test.tsx
// tests src/app/results/tmnt/[tmntId]/brackets/populatePlayerBrktRows.tsx
import { populatePlayerBrktRows } from "@/app/results/tmnt/[tmntId]/brackets/populatePlayerBrktRows";
import { updateAllBracketMatches } from "@/app/results/tmnt/[tmntId]/brackets/updateAllBracketMatches";
import { calcNumGames } from "@/components/tmnts/games";
import { BracketList } from "@/components/brackets/bracketListClass";
import type { brktListRecord } from "@/components/brackets/buildBrktLists";
import { tmntResultsToGameTypes } from "@/lib/tmntResultsToGameTypes";
import { lastFirst } from "@/lib/getName";
import { defaultPlayersPerMatch } from "@/lib/db/initVals";
import { tgrGameKey, tgrHdcpKey, type tmntGameResult } from "@/lib/types/resultsTypes";
import {
  mockTmntFullData,
  mockGames,
  brktId1,
  brktId2,
  divId1,
  divId2,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

/*************************/
/* mocks for dependencies */
/*************************/

jest.mock(
  "@/app/results/tmnt/[tmntId]/brackets/updateAllBracketMatches",
  () => ({
    updateAllBracketMatches: jest.fn(),
  })
);

jest.mock("@/components/tmnts/games", () => ({
  ...jest.requireActual<Record<string, unknown>>("@/components/tmnts/games"),
  calcNumGames: jest.fn(),
}));

// used by BracketList in the integration tests
jest.mock("@/lib/tmntResultsToGameTypes", () => ({
  tmntResultsToGameTypes: jest.fn(),
}));

const mockedUpdateAll = jest.mocked(updateAllBracketMatches);
const mockedCalcNumGames = jest.mocked(calcNumGames);
const mockedToGameTypes = jest.mocked(tmntResultsToGameTypes);

const { updateAllBracketMatches: actualUpdateAll } = jest.requireActual<{
  updateAllBracketMatches: typeof updateAllBracketMatches;
}>("@/app/results/tmnt/[tmntId]/brackets/updateAllBracketMatches");

/*********************************************/
/* helpers that keep "possibly undefined" out */
/*********************************************/

/**
 * Gets the item at an index, or throws if there is none.
 *
 * @param {T[]} items - array to read from
 * @param {number} index - index of the item
 * @returns {T} the item at the index
 */
const getAt = <T,>(items: readonly T[], index: number): T => {
  const item = items[index];
  if (item === undefined) {
    throw new Error(`No item at index ${String(index)}`);
  }
  return item;
};

/**
 * Finds the first item that matches, or throws if none does.
 *
 * @param {T[]} items - array to search
 * @param {(item: T) => boolean} match - test for the wanted item
 * @param {string} what - name of the item, for the error message
 * @returns {T} the matching item
 */
const findOrThrow = <T,>(
  items: readonly T[],
  match: (item: T) => boolean,
  what: string
): T => {
  const item = items.find(match);
  if (item === undefined) {
    throw new Error(`No ${what} found`);
  }
  return item;
};

/**
 * Gets a bracket list from a record, or throws if it is not there.
 *
 * @param {brktListRecord} record - bracket list record
 * @param {string} id - bracket id
 * @returns {BracketList} the bracket list
 */
const listIn = (record: brktListRecord, id: string): BracketList => {
  const list = record[id];
  if (list === undefined) {
    throw new Error(`No bracket list for ${id}`);
  }
  return list;
};

/********************************************/
/* fixtures built from mockTmntFullData     */
/********************************************/
const { players, brkts } = mockTmntFullData;
const NUM_GAMES = 6;

// player number (1-8) -> player from the mock
const player = (n: number) => getAt(players, n - 1);
const pid = (n: number) => player(n).id;
const order = (...nums: number[]) => nums.map(pid);

type Row = Record<string, unknown>;

const scoresFor = (playerId: string): number[] =>
  mockGames
    .filter((g) => g.player_id === playerId)
    .sort((a, b) => a.game_num - b.game_num)
    .map((g) => g.score);

// one game result for a mock player in a mock division. The game scores are
// the same in every division; only the handicap values change
const makeResult = (
  n: number,
  divId: string = divId1,
  scores: number[] = scoresFor(pid(n))
): tmntGameResult => {
  const p = player(n);
  const div = findOrThrow(mockTmntFullData.divs, (d) => d.id === divId, "division");
  const hdcp =
    div.hdcp_per > 0
      ? Math.floor(div.hdcp_per * (div.hdcp_from - p.average))
      : 0;
  const total = scores.reduce((sum, s) => sum + s, 0);
  const totalHdcp = hdcp * scores.length;

  const result: Row = {
    player_id: p.id,
    div_id: div.id,
    div_name: div.div_name,
    sort_order: div.sort_order,
    tmnt_name: mockTmntFullData.tmnt.tmnt_name,
    start_date: mockTmntFullData.tmnt.start_date_str,
    full_name: `${p.first_name} ${p.last_name}`,
    average: p.average,
    hdcp,
    total,
    total_hdcp: totalHdcp,
    "total + Hdcp": total + totalHdcp,
  };
  scores.forEach((score, i) => {
    result[tgrGameKey(i + 1)] = score;
    result[tgrHdcpKey(i + 1)] = score + hdcp;
  });
  return result as unknown as tmntGameResult;
};

const allResults = players.map((_, i) => makeResult(i + 1));

// rows come back typed; the tests read them as plain records
const run = (results: tmntGameResult[], record: brktListRecord): Row[] =>
  populatePlayerBrktRows(results, record);

const firstRow = (rows: Row[]): Row => getAt(rows, 0);

const rowFor = (rows: Row[], n: number): Row =>
  findOrThrow(rows, (r) => r.player_id === pid(n), `row for player ${String(n)}`);

/*****************************/
/* unit tests: fake lists    */
/*****************************/
type FakePlayer = {
  first_name: string;
  last_name: string;
  lane: number;
  bracketIds: string[];
};

// a fake player built from a mock player
const fakePlayer = (n: number, bracketIds: string[] = []): FakePlayer => ({
  first_name: player(n).first_name,
  last_name: player(n).last_name,
  lane: player(n).lane,
  bracketIds,
});

type FakeBracketOpts = { alive?: boolean; cash?: boolean };

const makeBracket = ({ alive = true, cash = false }: FakeBracketOpts = {}) => ({
  isPlayerAlive: jest.fn(() => alive),
  isPlayerFirstOrSecond: jest.fn(() => cash),
});

type FakeListOpts = {
  players?: Record<string, FakePlayer>;
  brackets?: ReturnType<typeof makeBracket>[];
  bracketIndexes?: Record<string, number>;
  playersMapNull?: boolean;
  indexMapNull?: boolean;
  divId?: string; // division of the list's bracket definition
  noBrkt?: boolean; // no bracket definition at all
};

const makeFakeList = ({
  players: fakePlayers = {},
  brackets: fakeBrackets = [],
  bracketIndexes = {},
  playersMapNull = false,
  indexMapNull = false,
  divId = divId1,
  noBrkt = false,
}: FakeListOpts = {}) =>
  ({
    playersMap: playersMapNull ? null : new Map(Object.entries(fakePlayers)),
    bracketIndexMap: indexMapNull
      ? null
      : new Map(Object.entries(bracketIndexes)),
    brackets: fakeBrackets,
    brkt: noBrkt ? undefined : { div_id: divId },
  }) as unknown as BracketList;

// a list with one player in one bracket
const singlePlayerList = (
  n: number,
  bracket: ReturnType<typeof makeBracket>
) =>
  makeFakeList({
    players: { [pid(n)]: fakePlayer(n, ["b0"]) },
    brackets: [bracket],
    bracketIndexes: { b0: 0 },
  });

describe("populatePlayerBrktRows", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUpdateAll.mockReset();
    mockedCalcNumGames.mockReturnValue(NUM_GAMES);
    mockedToGameTypes.mockReturnValue(mockGames);
  });

  describe("fixture sanity check", () => {
    it("mock tournament has two brackets and eight players", () => {
      expect(brkts).toHaveLength(2);
      expect(players).toHaveLength(8);
    });

    it("both mock brackets are in the first division, which is not the second", () => {
      expect(getAt(brkts, 0).div_id).toBe(divId1);
      expect(getAt(brkts, 1).div_id).toBe(divId1);
      expect(divId2).not.toBe(divId1);
    });

    it("player 1 scored 201, 202, 203, 252, 182, 185 in the mock games", () => {
      expect(scoresFor(pid(1))).toEqual([201, 202, 203, 252, 182, 185]);
    });

    it("builds a scratch result for player 1 with no handicap", () => {
      const r = makeResult(1, divId1) as unknown as Row;

      expect(r.hdcp).toBe(0);
      expect(r.total).toBe(1225);
      expect(r.total_hdcp).toBe(0);
      expect(r["total + Hdcp"]).toBe(1225);
      expect(r["Game 1 + Hdcp"]).toBe(201);
    });

    it("builds a handicap result for player 1 with the same scores and a handicap", () => {
      const r = makeResult(1, divId2) as unknown as Row;

      // mock average 220, hdcp_per 0.9, hdcp_from 230: floor(0.9 * 10) = 9 per game
      expect(r.hdcp).toBe(9);
      expect(r.total).toBe(1225);
      expect(r.total_hdcp).toBe(54);
      expect(r["total + Hdcp"]).toBe(1279);
      expect(r["Game 1"]).toBe(201);
      expect(r["Game 1 + Hdcp"]).toBe(210);
    });
  });

  describe("updating the bracket matches", () => {
    it("updates the bracket matches once, with the same record and results objects", () => {
      const record: brktListRecord = { [brktId1]: makeFakeList() };

      run(allResults, record);

      expect(mockedUpdateAll).toHaveBeenCalledTimes(1);
      const [recordArg, resultsArg] = getAt(mockedUpdateAll.mock.calls, 0);
      expect(recordArg).toBe(record);
      expect(resultsArg).toBe(allResults);
    });

    it("updates the bracket matches even when the record is empty", () => {
      run(allResults, {});

      expect(mockedUpdateAll).toHaveBeenCalledTimes(1);
    });

    it("builds the rows from the brackets as they are after the update", () => {
      // the bracket only reports the player as alive and cashing once the
      // matches have been updated, so the row shows whether the update ran first
      let updated = false;
      const bracket = {
        isPlayerAlive: jest.fn(() => updated),
        isPlayerFirstOrSecond: jest.fn(() => updated),
      };
      mockedUpdateAll.mockImplementation(() => {
        updated = true;
      });

      const rows = run([], { [brktId1]: singlePlayerList(1, bracket) });

      expect(firstRow(rows).in).toBe(1);
      expect(firstRow(rows).cash).toBe("$");
    });
  });

  describe("empty and not-ready lists", () => {
    it("returns an empty array for an empty record", () => {
      expect(run(allResults, {})).toEqual([]);
    });

    it("skips a list whose playersMap is null", () => {
      const record = {
        [brktId1]: makeFakeList({
          playersMapNull: true,
          bracketIndexes: { b0: 0 },
        }),
      };

      expect(run(allResults, record)).toEqual([]);
    });

    it("skips a list whose bracketIndexMap is null", () => {
      const record = {
        [brktId1]: makeFakeList({
          players: { [pid(1)]: fakePlayer(1) },
          indexMapNull: true,
        }),
      };

      expect(run(allResults, record)).toEqual([]);
    });

    it("skips a list that has no bracket definition, even when its maps are ready", () => {
      const record = {
        [brktId1]: makeFakeList({
          players: { [pid(1)]: fakePlayer(1) },
          noBrkt: true,
        }),
      };

      expect(run(allResults, record)).toEqual([]);
    });

    it("builds rows from the ready lists and skips the others in the same record", () => {
      const record = {
        noPlayersMap: makeFakeList({ playersMapNull: true }),
        noIndexMap: makeFakeList({
          players: { [pid(3)]: fakePlayer(3) },
          indexMapNull: true,
        }),
        noBrkt: makeFakeList({
          players: { [pid(2)]: fakePlayer(2) },
          noBrkt: true,
        }),
        [brktId1]: makeFakeList({ players: { [pid(1)]: fakePlayer(1) } }),
      };

      const rows = run(allResults, record);

      expect(rows).toHaveLength(1);
      expect(firstRow(rows).player_id).toBe(pid(1));
    });

    it("does not ask calcNumGames about a list that is skipped", () => {
      const record = {
        noPlayersMap: makeFakeList({ playersMapNull: true }),
        noBrkt: makeFakeList({
          players: { [pid(2)]: fakePlayer(2) },
          noBrkt: true,
        }),
      };

      run(allResults, record);

      expect(mockedCalcNumGames).not.toHaveBeenCalled();
    });

    it("returns no rows when the list has no players", () => {
      expect(run(allResults, { [brktId1]: makeFakeList() })).toEqual([]);
    });

    it("returns rows with no game columns when there are no results", () => {
      mockedCalcNumGames.mockReturnValue(0);
      const record = {
        [brktId1]: makeFakeList({ players: { [pid(1)]: fakePlayer(1) } }),
      };

      const rows = run([], record);

      expect(rows).toHaveLength(1);
      expect(firstRow(rows)).not.toHaveProperty("Game 1");
    });
  });

  describe("row fields", () => {
    it("creates a row per player with the id, name, lane and starting values", () => {
      const record = {
        [brktId1]: makeFakeList({ players: { [pid(1)]: fakePlayer(1) } }),
      };

      const rows = run([], record);

      expect(rows).toHaveLength(1);
      expect(firstRow(rows)).toEqual({
        id: pid(1),
        player_id: pid(1),
        last_first: lastFirst(player(1).first_name, player(1).last_name),
        lane: player(1).lane,
        in: 0,
        cash: "",
      });
    });

    it("sets id to the player id on every row", () => {
      const record = {
        [brktId1]: makeFakeList({
          players: { [pid(1)]: fakePlayer(1), [pid(2)]: fakePlayer(2) },
        }),
      };

      const rows = run([], record);

      expect(rows).toHaveLength(2);
      rows.forEach((row) => {
        expect(row.id).toBe(row.player_id);
      });
    });

    it("creates one row for each player in the list", () => {
      const fakePlayers = Object.fromEntries(
        players.map((_, i) => [pid(i + 1), fakePlayer(i + 1)])
      );

      const rows = run(allResults, {
        [brktId1]: makeFakeList({ players: fakePlayers }),
      });

      expect(rows).toHaveLength(8);
      expect(rows.map((r) => r.player_id).sort()).toEqual(
        players.map((p) => p.id).sort()
      );
    });
  });

  describe("game columns", () => {
    const recordWithPlayer1 = () => ({
      [brktId1]: makeFakeList({ players: { [pid(1)]: fakePlayer(1) } }),
    });

    it("copies each game score from the player's result", () => {
      const rows = run(allResults, recordWithPlayer1());

      [201, 202, 203, 252, 182, 185].forEach((score, i) => {
        expect(firstRow(rows)[`Game ${String(i + 1)}`]).toBe(score);
      });
    });

    it("only copies as many games as calcNumGames reports", () => {
      mockedCalcNumGames.mockReturnValue(3);

      const rows = run(allResults, recordWithPlayer1());

      expect(firstRow(rows)["Game 3"]).toBe(203);
      expect(firstRow(rows)).not.toHaveProperty("Game 4");
      expect(firstRow(rows)).not.toHaveProperty("Game 6");
    });

    it("copies only the game columns, not the handicap or total fields of the result", () => {
      const record = {
        [brktId2]: makeFakeList({
          players: { [pid(1)]: fakePlayer(1) },
          divId: divId2,
        }),
      };

      const rows = run([makeResult(1, divId2)], record);

      expect(firstRow(rows)["Game 1"]).toBe(201);
      [
        "Game 1 + Hdcp",
        "hdcp",
        "total",
        "total_hdcp",
        "total + Hdcp",
        "full_name",
        "average",
      ].forEach((key) => {
        expect(firstRow(rows)).not.toHaveProperty(key);
      });
    });

    it("leaves the game columns off a player who has no result", () => {
      const rows = run([makeResult(2)], recordWithPlayer1());

      expect(rows).toHaveLength(1);
      expect(firstRow(rows)).not.toHaveProperty("Game 1");
    });

    it("asks calcNumGames about only the results of this list's players", () => {
      run(allResults, recordWithPlayer1());

      expect(mockedCalcNumGames).toHaveBeenCalledTimes(1);
      const [arg] = getAt(mockedCalcNumGames.mock.calls, 0);
      expect(arg.map((r) => r.player_id)).toEqual([pid(1)]);
    });

    it("asks calcNumGames once for each ready list", () => {
      const record = {
        [brktId1]: makeFakeList({ players: { [pid(1)]: fakePlayer(1) } }),
        [brktId2]: makeFakeList({ players: { [pid(2)]: fakePlayer(2) } }),
        notReady: makeFakeList({ playersMapNull: true }),
      };

      run(allResults, record);

      expect(mockedCalcNumGames).toHaveBeenCalledTimes(2);
    });
  });

  describe("the list's division", () => {
    const listFor = (divId: string, n = 1) =>
      makeFakeList({
        players: { [pid(n)]: fakePlayer(n) },
        divId,
      });

    const SCORES = [201, 202, 203, 252, 182, 185];

    // player 1 has one result in each division: same scores, different handicap
    const scratchResult1 = () => makeResult(1, divId1);
    const hdcpResult1 = () => makeResult(1, divId2);

    it.each([
      ["scratch result first", () => [scratchResult1(), hdcpResult1()]],
      ["handicap result first", () => [hdcpResult1(), scratchResult1()]],
    ])(
      "gives the same game scores from either division's list, whatever the order of the results (%s)",
      (_label, getResults) => {
        const results = getResults();

        const rowDiv1 = firstRow(run(results, { [brktId1]: listFor(divId1) }));
        const rowDiv2 = firstRow(run(results, { [brktId2]: listFor(divId2) }));

        SCORES.forEach((score, i) => {
          expect(rowDiv1[`Game ${String(i + 1)}`]).toBe(score);
          expect(rowDiv2[`Game ${String(i + 1)}`]).toBe(score);
        });
      }
    );

    it("gives the same row for a list with only its own division's result as with both results", () => {
      const onlyScratch = run([scratchResult1()], { [brktId1]: listFor(divId1) });
      const both = run([scratchResult1(), hdcpResult1()], {
        [brktId1]: listFor(divId1),
      });

      expect(both).toEqual(onlyScratch);
    });

    it("does not put handicap values on the row, in either division", () => {
      const results = [scratchResult1(), hdcpResult1()];

      const rowsDiv1 = run(results, { [brktId1]: listFor(divId1) });
      const rowsDiv2 = run(results, { [brktId2]: listFor(divId2) });

      expect(rowsDiv1).toHaveLength(1);
      expect(rowsDiv2).toHaveLength(1);
      [...rowsDiv1, ...rowsDiv2].forEach((row) => {
        expect(row).not.toHaveProperty("Game 1 + Hdcp");
        expect(row).not.toHaveProperty("hdcp");
        expect(row).not.toHaveProperty("total_hdcp");
        expect(row).not.toHaveProperty("total + Hdcp");
      });
    });

    it.each([
      ["the scratch list", divId1],
      ["the handicap list", divId2],
    ])(
      "asks calcNumGames about only the results of the division of %s",
      (_label, divId) => {
        run([scratchResult1(), hdcpResult1()], { [brktId1]: listFor(divId) });

        const [arg] = getAt(mockedCalcNumGames.mock.calls, 0);
        expect(arg).toHaveLength(1);
        expect(getAt(arg, 0).div_id).toBe(divId);
      }
    );

    it("asks calcNumGames about no results when none are in the list's division", () => {
      run([hdcpResult1()], { [brktId1]: listFor(divId1) });

      expect(mockedCalcNumGames).toHaveBeenCalledWith([]);
    });

    it("leaves the game columns off a player whose only result is in another division", () => {
      const rows = run([hdcpResult1()], { [brktId1]: listFor(divId1) });

      expect(rows).toHaveLength(1);
      expect(firstRow(rows)).not.toHaveProperty("Game 1");
    });

    it("creates one row for a player in two divisions, with the same scores whichever list runs last", () => {
      const results = [scratchResult1(), hdcpResult1()];
      const scratchFirst = run(results, {
        [brktId1]: listFor(divId1),
        [brktId2]: listFor(divId2),
      });
      const hdcpFirst = run(results, {
        [brktId2]: listFor(divId2),
        [brktId1]: listFor(divId1),
      });

      expect(scratchFirst).toHaveLength(1);
      expect(hdcpFirst).toHaveLength(1);
      expect(scratchFirst).toEqual(hdcpFirst);
      expect(firstRow(scratchFirst)["Game 1"]).toBe(201);
    });

    it("keeps the earlier list's scores when the later division has no result for the player", () => {
      const rows = run([scratchResult1()], {
        [brktId1]: listFor(divId1),
        [brktId2]: listFor(divId2),
      });

      expect(rows).toHaveLength(1);
      expect(firstRow(rows)["Game 1"]).toBe(201);
    });

    it("gives each list's players the scores of their own result", () => {
      const results = [makeResult(1, divId1), makeResult(2, divId2)];
      const record = {
        [brktId1]: listFor(divId1, 1),
        [brktId2]: listFor(divId2, 2),
      };

      const rows = run(results, record);

      // player 1: 201 scratch; player 2: game 1 score from the mock
      expect(rowFor(rows, 1)["Game 1"]).toBe(201);
      expect(rowFor(rows, 2)["Game 1"]).toBe(getAt(scoresFor(pid(2)), 0));
    });

    it("does not give a player the scores of a division the player's list is not in", () => {
      // player 1's list is division 1; only division 2 has a result for player 1
      const results = [hdcpResult1()];
      const record = {
        [brktId1]: listFor(divId1, 1),
        [brktId2]: listFor(divId2, 2),
      };

      const rows = run(results, record);

      expect(rowFor(rows, 1)).not.toHaveProperty("Game 1");
    });
  });

  describe("counting the brackets a player is still in", () => {
    it("counts a bracket the player is alive in, including the bracket at index 0", () => {
      // index 0 is falsy, so it must not be treated as missing
      const rows = run([], {
        [brktId1]: singlePlayerList(1, makeBracket({ alive: true })),
      });

      expect(firstRow(rows).in).toBe(1);
    });

    it("does not count a bracket the player has lost in", () => {
      const rows = run([], {
        [brktId1]: singlePlayerList(1, makeBracket({ alive: false })),
      });

      expect(firstRow(rows).in).toBe(0);
    });

    it("counts only the brackets the player is alive in", () => {
      const record = {
        [brktId1]: makeFakeList({
          players: { [pid(1)]: fakePlayer(1, ["b0", "b1", "b2"]) },
          brackets: [
            makeBracket({ alive: true }),
            makeBracket({ alive: false }),
            makeBracket({ alive: true }),
          ],
          bracketIndexes: { b0: 0, b1: 1, b2: 2 },
        }),
      };

      expect(firstRow(run([], record)).in).toBe(2);
    });

    it("adds up the brackets across the lists the player is in", () => {
      const record = {
        [brktId1]: makeFakeList({
          players: { [pid(1)]: fakePlayer(1, ["a0", "a1"]) },
          brackets: [makeBracket(), makeBracket()],
          bracketIndexes: { a0: 0, a1: 1 },
        }),
        [brktId2]: makeFakeList({
          players: { [pid(1)]: fakePlayer(1, ["b0"]) },
          brackets: [makeBracket()],
          bracketIndexes: { b0: 0 },
        }),
      };

      const rows = run([], record);

      expect(rows).toHaveLength(1);
      expect(firstRow(rows).in).toBe(3);
    });

    it("asks each bracket about this player", () => {
      const bracket = makeBracket();

      run([], { [brktId1]: singlePlayerList(1, bracket) });

      expect(bracket.isPlayerAlive).toHaveBeenCalledWith(pid(1));
      expect(bracket.isPlayerFirstOrSecond).toHaveBeenCalledWith(pid(1));
    });

    it("only asks the brackets the player is in", () => {
      const inBracket = makeBracket();
      const otherBracket = makeBracket();
      const record = {
        [brktId1]: makeFakeList({
          players: { [pid(1)]: fakePlayer(1, ["b0"]) },
          brackets: [inBracket, otherBracket],
          bracketIndexes: { b0: 0, b1: 1 },
        }),
      };

      run([], record);

      expect(inBracket.isPlayerAlive).toHaveBeenCalledTimes(1);
      expect(otherBracket.isPlayerAlive).not.toHaveBeenCalled();
      expect(otherBracket.isPlayerFirstOrSecond).not.toHaveBeenCalled();
    });

    it("ignores a bracket id that is not in the index map", () => {
      const record = {
        [brktId1]: makeFakeList({
          players: { [pid(1)]: fakePlayer(1, ["unknown_bracket"]) },
          brackets: [makeBracket()],
          bracketIndexes: { b0: 0 },
        }),
      };

      const rows = run([], record);

      expect(firstRow(rows).in).toBe(0);
      expect(firstRow(rows).cash).toBe("");
    });

    it("ignores an index that has no bracket, without throwing", () => {
      const record = {
        [brktId1]: makeFakeList({
          players: { [pid(1)]: fakePlayer(1, ["b5"]) },
          brackets: [makeBracket()],
          bracketIndexes: { b5: 5 },
        }),
      };

      const rows = run([], record);

      expect(firstRow(rows).in).toBe(0);
      expect(firstRow(rows).cash).toBe("");
    });

    it("gives 0 for a player who is in no brackets", () => {
      const record = {
        [brktId1]: makeFakeList({
          players: { [pid(1)]: fakePlayer(1, []) },
          brackets: [makeBracket()],
          bracketIndexes: { b0: 0 },
        }),
      };

      expect(firstRow(run([], record)).in).toBe(0);
    });
  });

  describe("cash marker", () => {
    it("shows $ when the player is first or second in a bracket", () => {
      const rows = run([], {
        [brktId1]: singlePlayerList(1, makeBracket({ cash: true })),
      });

      expect(firstRow(rows).cash).toBe("$");
    });

    it("shows nothing when the player is not first or second", () => {
      const rows = run([], {
        [brktId1]: singlePlayerList(1, makeBracket({ cash: false })),
      });

      expect(firstRow(rows).cash).toBe("");
    });

    it("keeps the $ when a later bracket is not a cash for the player", () => {
      const record = {
        [brktId1]: makeFakeList({
          players: { [pid(1)]: fakePlayer(1, ["b0", "b1"]) },
          brackets: [makeBracket({ cash: true }), makeBracket({ cash: false })],
          bracketIndexes: { b0: 0, b1: 1 },
        }),
      };

      expect(firstRow(run([], record)).cash).toBe("$");
    });

    it("keeps the $ from an earlier list when a later list is not a cash", () => {
      const record = {
        [brktId1]: singlePlayerList(1, makeBracket({ cash: true })),
        [brktId2]: singlePlayerList(1, makeBracket({ cash: false })),
      };

      expect(firstRow(run([], record)).cash).toBe("$");
    });

    it("counts a player as in and as a cash for the same bracket", () => {
      const rows = run([], {
        [brktId1]: singlePlayerList(1, makeBracket({ alive: true, cash: true })),
      });

      expect(firstRow(rows).in).toBe(1);
      expect(firstRow(rows).cash).toBe("$");
    });

    it("shows $ for a player who cashed but is no longer alive", () => {
      const rows = run([], {
        [brktId1]: singlePlayerList(1, makeBracket({ alive: false, cash: true })),
      });

      expect(firstRow(rows).in).toBe(0);
      expect(firstRow(rows).cash).toBe("$");
    });

    it("marks only the players who cash", () => {
      const record = {
        [brktId1]: makeFakeList({
          players: {
            [pid(1)]: fakePlayer(1, ["b0"]),
            [pid(2)]: fakePlayer(2, ["b1"]),
          },
          brackets: [makeBracket({ cash: true }), makeBracket({ cash: false })],
          bracketIndexes: { b0: 0, b1: 1 },
        }),
      };

      const rows = run([], record);

      expect(rowFor(rows, 1).cash).toBe("$");
      expect(rowFor(rows, 2).cash).toBe("");
    });
  });

  describe("a player in more than one list", () => {
    const twoLists = () => ({
      [brktId1]: makeFakeList({ players: { [pid(1)]: fakePlayer(1) } }),
      [brktId2]: makeFakeList({ players: { [pid(1)]: fakePlayer(1) } }),
    });

    it("creates one row, not one per list", () => {
      expect(run(allResults, twoLists())).toHaveLength(1);
    });

    it("keeps the game scores on the single row", () => {
      const rows = run(allResults, twoLists());

      expect(firstRow(rows)["Game 1"]).toBe(201);
      expect(firstRow(rows)["Game 6"]).toBe(185);
    });

    it("keeps the lane from the first list the player is in", () => {
      const record = {
        [brktId1]: makeFakeList({
          players: { [pid(1)]: { ...fakePlayer(1), lane: 11 } },
        }),
        [brktId2]: makeFakeList({
          players: { [pid(1)]: { ...fakePlayer(1), lane: 22 } },
        }),
      };

      expect(firstRow(run([], record)).lane).toBe(11);
    });

    it("creates rows for the players that are only in one of the lists", () => {
      const record = {
        [brktId1]: makeFakeList({
          players: { [pid(1)]: fakePlayer(1), [pid(2)]: fakePlayer(2) },
        }),
        [brktId2]: makeFakeList({
          players: { [pid(1)]: fakePlayer(1), [pid(3)]: fakePlayer(3) },
        }),
      };

      const rows = run(allResults, record);

      expect(rows.map((r) => r.player_id).sort()).toEqual(
        order(1, 2, 3).sort()
      );
    });
  });

  describe("sorting", () => {
    const rowsInOrderOf = (fakePlayers: Record<string, FakePlayer>) =>
      run([], { [brktId1]: makeFakeList({ players: fakePlayers }) }).map(
        (r) => r.player_id
      );

    it("sorts by last name, then first name", () => {
      const fakePlayers = Object.fromEntries(
        players.map((_, i) => [pid(i + 1), fakePlayer(i + 1)])
      );

      // Jane, Jill, Joe, John Doe, then Terri, Tina, Tom, Tony Smith
      expect(rowsInOrderOf(fakePlayers)).toEqual(order(2, 4, 3, 1, 8, 7, 5, 6));
    });

    it("sorts by lane when the names are the same", () => {
      const sam = (lane: number): FakePlayer => ({
        first_name: "Sam",
        last_name: "Lee",
        lane,
        bracketIds: [],
      });
      const fakePlayers = {
        ply_lane9: sam(9),
        ply_lane2: sam(2),
        ply_lane30: sam(30),
      };

      // numeric, not string, order: 2, 9, 30
      expect(rowsInOrderOf(fakePlayers)).toEqual([
        "ply_lane2",
        "ply_lane9",
        "ply_lane30",
      ]);
    });

    it("ignores upper and lower case in the names, then sorts by lane", () => {
      const fakePlayers = {
        ply_upper: { first_name: "Sam", last_name: "Lee", lane: 8, bracketIds: [] },
        ply_lower: { first_name: "sam", last_name: "lee", lane: 3, bracketIds: [] },
      };

      expect(rowsInOrderOf(fakePlayers)).toEqual(["ply_lower", "ply_upper"]);
    });

    it("sorts by name before lane", () => {
      const fakePlayers = {
        ply_zed: { first_name: "Zed", last_name: "Adams", lane: 30, bracketIds: [] },
        ply_sam: { first_name: "Sam", last_name: "Lee", lane: 1, bracketIds: [] },
      };

      expect(rowsInOrderOf(fakePlayers)).toEqual(["ply_zed", "ply_sam"]);
    });

    it("sorts the rows of every list together", () => {
      const record = {
        [brktId1]: makeFakeList({
          players: { [pid(5)]: fakePlayer(5), [pid(2)]: fakePlayer(2) },
        }),
        [brktId2]: makeFakeList({
          players: { [pid(8)]: fakePlayer(8), [pid(1)]: fakePlayer(1) },
        }),
      };

      expect(run([], record).map((r) => r.player_id)).toEqual(order(2, 1, 8, 5));
    });
  });

  describe("inputs", () => {
    it("does not change the results array", () => {
      const results = [...allResults];
      const ids = results.map((r) => r.player_id);
      const before = JSON.stringify(results);
      const record = {
        [brktId1]: makeFakeList({ players: { [pid(1)]: fakePlayer(1) } }),
      };

      run(results, record);

      expect(results.map((r) => r.player_id)).toEqual(ids);
      expect(JSON.stringify(results)).toBe(before);
    });

    it("returns a new array each time", () => {
      const record = {
        [brktId1]: makeFakeList({ players: { [pid(1)]: fakePlayer(1) } }),
      };

      const first = run(allResults, record);
      const second = run(allResults, record);

      expect(first).not.toBe(second);
      expect(first).toEqual(second);
    });
  });

  /*****************************************************/
  /* integration tests: real BracketList from the mock */
  /*****************************************************/
  describe("with real bracket lists built from the mock tournament", () => {
    // squad game numbers for a bracket: start .. start + games - 1
    const buildList = (brktIndex: number) => {
      const brkt = getAt(brkts, brktIndex);
      const gameNums = Array.from({ length: brkt.games }, (_, i) => brkt.start + i);
      return new BracketList(
        brkt.id,
        defaultPlayersPerMatch,
        brkt.games,
        gameNums,
        undefined,
        { tmntFullData: mockTmntFullData, divId: brkt.div_id }
      );
    };

    const buildRecord = (): brktListRecord => ({
      [brktId1]: buildList(0),
      [brktId2]: buildList(1),
    });

    // the real function, so the bracket results are decided from the mock scores
    beforeEach(() => {
      mockedUpdateAll.mockImplementation(actualUpdateAll);
    });

    // expectations worked out from the brackets themselves
    const allBrackets = (record: brktListRecord) =>
      Object.values(record).flatMap((list) => list.brackets);

    const expectedIn = (record: brktListRecord, id: string) =>
      allBrackets(record).filter(
        (b) =>
          b.hasPlayer(id) &&
          !b.loserBrktGame1Ids.has(id) &&
          !b.loserBrktGame2Ids.has(id)
      ).length;

    const expectedCash = (record: brktListRecord, id: string) =>
      allBrackets(record).some(
        (b) => b.winnerIds.has(id) || b.runnerUpIds.has(id)
      )
        ? "$"
        : "";

    it("builds lists that are ready", () => {
      const list1 = listIn(buildRecord(), brktId1);

      expect(list1.playersMap).not.toBeNull();
      expect(list1.bracketIndexMap).not.toBeNull();
      expect(list1.playersMap?.size).toBe(8);
    });

    it("builds lists whose bracket definition has the division the results are filtered by", () => {
      const record = buildRecord();

      expect(listIn(record, brktId1).brkt?.div_id).toBe(divId1);
      expect(listIn(record, brktId2).brkt?.div_id).toBe(divId1);
    });

    it("creates one row per mock player, even though each is in both lists", () => {
      const rows = run(allResults, buildRecord());

      expect(rows).toHaveLength(8);
      expect(rows.map((r) => r.player_id).sort()).toEqual(
        players.map((p) => p.id).sort()
      );
    });

    it("sorts the rows by name: Jane, Jill, Joe, John, Terri, Tina, Tom, Tony", () => {
      const rows = run(allResults, buildRecord());

      expect(rows.map((r) => r.player_id)).toEqual(order(2, 4, 3, 1, 8, 7, 5, 6));
    });

    it("fills in the names and lanes from the lists' players", () => {
      const record = buildRecord();
      const playersMap = listIn(record, brktId1).playersMap;
      const rows = run(allResults, record);

      expect(rows).toHaveLength(8);
      rows.forEach((row) => {
        const p = findOrThrow(players, (pl) => pl.id === row.player_id, "player");
        expect(row.last_first).toBe(lastFirst(p.first_name, p.last_name));
        expect(row.lane).toBe(playersMap?.get(p.id)?.lane);
        expect(typeof row.lane).toBe("number");
      });
    });

    it("copies the six game scores from the mock games onto every row", () => {
      const rows = run(allResults, buildRecord());

      expect(rows).toHaveLength(8);
      rows.forEach((row) => {
        const scores = scoresFor(String(row.player_id));
        expect(scores).toHaveLength(NUM_GAMES);
        scores.forEach((score, i) => {
          expect(row[`Game ${String(i + 1)}`]).toBe(score);
        });
      });
      expect(rowFor(rows, 8)["Game 4"]).toBe(263);
    });

    it("leaves off the game columns when the results are all in another division", () => {
      const otherDivResults = players.map((_, i) => makeResult(i + 1, divId2));

      const rows = run(otherDivResults, buildRecord());

      expect(rows).toHaveLength(8);
      rows.forEach((row) => {
        expect(row).not.toHaveProperty("Game 1");
      });
    });

    it("marks the finalists of the first bracket of each list with a $", () => {
      const rows = run(allResults, buildRecord());

      // list 1 final: player 8 beats player 2; list 2 final: player 8 beats player 3
      expect(rowFor(rows, 8).cash).toBe("$");
      expect(rowFor(rows, 2).cash).toBe("$");
      expect(rowFor(rows, 3).cash).toBe("$");
    });

    it("marks a player with a $ exactly when the player won or was runner up in some bracket", () => {
      const record = buildRecord();
      const rows = run(allResults, record);

      expect(rows).toHaveLength(8);
      rows.forEach((row) => {
        expect(row.cash).toBe(expectedCash(record, String(row.player_id)));
      });
    });

    it("counts the brackets each player is still alive in", () => {
      const record = buildRecord();
      const rows = run(allResults, record);

      expect(rows).toHaveLength(8);
      rows.forEach((row) => {
        expect(row.in).toBe(expectedIn(record, String(row.player_id)));
      });
      // player 8 won the first bracket of each list, so is alive in at least two
      expect(rowFor(rows, 8).in).toBeGreaterThanOrEqual(2);
    });

    it("gives the same rows when run twice", () => {
      const record = buildRecord();

      const first = run(allResults, record);
      const second = run(allResults, record);

      expect(second).toEqual(first);
    });

    it("shows every player in all of their brackets, and no $, before any game is bowled", () => {
      mockedToGameTypes.mockReturnValue([]);
      mockedCalcNumGames.mockReturnValue(0);
      const record = buildRecord();

      const rows = run([], record);

      expect(rows).toHaveLength(8);
      rows.forEach((row) => {
        expect(row.cash).toBe("");
        expect(row.in).toBe(expectedIn(record, String(row.player_id)));
        expect(row.in).toBeGreaterThan(0);
        expect(row).not.toHaveProperty("Game 1");
      });
    });
  });
});
