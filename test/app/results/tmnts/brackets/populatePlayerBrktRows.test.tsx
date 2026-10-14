import { populatePlayerBrktRows } from "@/app/results/tmnt/[tmntId]/brackets/populatePlayerBrktRows";
import { updateAllBracketMatches } from "@/app/results/tmnt/[tmntId]/brackets/updateAllBracketMatches";
import { calcNumGames } from "@/components/tmnts/games";
import { BracketList } from "@/components/brackets/bracketListClass";
import type { brktListRecord } from "@/components/brackets/buildBrktLists";
import { tmntResultsToGameTypes } from "@/lib/tmntResultsToGameTypes";
import { lastFirst } from "@/lib/getName";
import { defaultPlayersPerMatch } from "@/lib/db/initVals";
import { tgrGameKey, tgrHdcpKey, type tmntGameResult } from "@/lib/types/resultsTypes";
import type { divDataType, playerType } from "@/lib/types/types";
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

const mockedUpdateAll = updateAllBracketMatches as jest.Mock;
const mockedCalcNumGames = calcNumGames as jest.Mock;
const mockedToGameTypes = tmntResultsToGameTypes as jest.Mock;

const { updateAllBracketMatches: actualUpdateAll } = jest.requireActual<{
  updateAllBracketMatches: typeof updateAllBracketMatches;
}>("@/app/results/tmnt/[tmntId]/brackets/updateAllBracketMatches");

/********************************************/
/* fixtures built from mockTmntFullData     */
/********************************************/
const { players, brkts } = mockTmntFullData;
const NUM_GAMES = 6;

// player number (1-8) -> player id from the mock
const pid = (n: number) => players[n - 1].id;
const order = (...nums: number[]) => nums.map(pid);

type Row = Record<string, unknown>;

const scoresFor = (playerId: string): number[] =>
  mockGames
    .filter((g) => g.player_id === playerId)
    .sort((a, b) => a.game_num - b.game_num)
    .map((g) => g.score);

// one game result for a mock player; scores default to the player's mock scores
// one game result for a mock player in a mock division. The game scores are
// the same in every division; only the handicap values change
const makeResult = (
  n: number,
  divId: string = divId1,
  scores: number[] = scoresFor(pid(n))
): tmntGameResult => {
  const p = players[n - 1];
  const div = (mockTmntFullData.divs as divDataType[]).find(
    (d) => d.id === divId
  ) as divDataType;
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
  populatePlayerBrktRows(results, record) as unknown as Row[];

const rowFor = (rows: Row[], n: number) =>
  rows.find((r) => r.player_id === pid(n)) as Row;

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
  first_name: players[n - 1].first_name,
  last_name: players[n - 1].last_name,
  lane: players[n - 1].lane,
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
      expect(brkts[0].div_id).toBe(divId1);
      expect(brkts[1].div_id).toBe(divId1);
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
    it("updates the bracket matches once, with the record and the results, before building rows", () => {
      const record: brktListRecord = { [brktId1]: makeFakeList() };

      run(allResults, record);

      expect(mockedUpdateAll).toHaveBeenCalledTimes(1);
      expect(mockedUpdateAll).toHaveBeenCalledWith(record, allResults);
      expect(mockedUpdateAll.mock.calls[0][0]).toBe(record);
      expect(mockedUpdateAll.mock.calls[0][1]).toBe(allResults);
    });

    it("updates the bracket matches even when the record is empty", () => {
      run(allResults, {});

      expect(mockedUpdateAll).toHaveBeenCalledTimes(1);
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
      expect(rows[0].player_id).toBe(pid(1));
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
      expect(rows[0]).not.toHaveProperty("Game 1");
    });
  });

  describe("row fields", () => {
    it("creates a row per player with the id, name, lane and starting values", () => {
      const record = {
        [brktId1]: makeFakeList({ players: { [pid(1)]: fakePlayer(1) } }),
      };

      const rows = run([], record);

      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        id: pid(1),
        player_id: pid(1),
        last_first: lastFirst(players[0].first_name, players[0].last_name),
        lane: players[0].lane,
        in: 0,
        cash: "",
      });
    });

    it("sets id to the player id", () => {
      const record = {
        [brktId1]: makeFakeList({
          players: { [pid(1)]: fakePlayer(1), [pid(2)]: fakePlayer(2) },
        }),
      };

      run([], record).forEach((row) => expect(row.id).toBe(row.player_id));
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
        expect(rows[0][`Game ${i + 1}`]).toBe(score);
      });
    });

    it("only copies as many games as calcNumGames reports", () => {
      mockedCalcNumGames.mockReturnValue(3);

      const rows = run(allResults, recordWithPlayer1());

      expect(rows[0]["Game 3"]).toBe(203);
      expect(rows[0]).not.toHaveProperty("Game 4");
      expect(rows[0]).not.toHaveProperty("Game 6");
    });

    it("copies only the game columns, not the handicap or total fields of the result", () => {
      const record = {
        [brktId2]: makeFakeList({
          players: { [pid(1)]: fakePlayer(1) },
          divId: divId2,
        }),
      };

      const rows = run([makeResult(1, divId2)], record);

      expect(rows[0]["Game 1"]).toBe(201);
      [
        "Game 1 + Hdcp",
        "hdcp",
        "total",
        "total_hdcp",
        "total + Hdcp",
        "full_name",
        "average",
      ].forEach((key) => expect(rows[0]).not.toHaveProperty(key));
    });
        
    it("leaves the game columns off a player who has no result", () => {
      const rows = run([makeResult(2)], recordWithPlayer1());

      expect(rows).toHaveLength(1);
      expect(rows[0]).not.toHaveProperty("Game 1");
    });

    it("asks calcNumGames about only the results of this list's players", () => {
      run(allResults, recordWithPlayer1());

      expect(mockedCalcNumGames).toHaveBeenCalledTimes(1);
      const arg = mockedCalcNumGames.mock.calls[0][0] as tmntGameResult[];
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
    const listFor = (
      divId: string,
      n = 1,
      extra: Partial<FakeListOpts> = {}
    ) =>
      makeFakeList({
        players: { [pid(n)]: fakePlayer(n) },
        divId,
        ...extra,
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

        const rowsDiv1 = run(results, { [brktId1]: listFor(divId1) });
        const rowsDiv2 = run(results, { [brktId2]: listFor(divId2) });

        SCORES.forEach((score, i) => {
          expect(rowsDiv1[0][`Game ${i + 1}`]).toBe(score);
          expect(rowsDiv2[0][`Game ${i + 1}`]).toBe(score);
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

        const arg = mockedCalcNumGames.mock.calls[0][0] as tmntGameResult[];
        expect(arg).toHaveLength(1);
        expect(arg[0].div_id).toBe(divId);
      }
    );

    it("asks calcNumGames about no results when none are in the list's division", () => {
      run([hdcpResult1()], { [brktId1]: listFor(divId1) });

      expect(mockedCalcNumGames).toHaveBeenCalledWith([]);
    });

    it("leaves the game columns off a player whose only result is in another division", () => {
      const rows = run([hdcpResult1()], { [brktId1]: listFor(divId1) });

      expect(rows).toHaveLength(1);
      expect(rows[0]).not.toHaveProperty("Game 1");
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
      expect(scratchFirst[0]["Game 1"]).toBe(201);
    });

    it("keeps the earlier list's scores when the later division has no result for the player", () => {
      const rows = run([scratchResult1()], {
        [brktId1]: listFor(divId1),
        [brktId2]: listFor(divId2),
      });

      expect(rows).toHaveLength(1);
      expect(rows[0]["Game 1"]).toBe(201);
    });

    it("gives each list's players the scores of their own result", () => {
      const results = [makeResult(1, divId1), makeResult(2, divId2)];
      const record = {
        [brktId1]: listFor(divId1, 1),
        [brktId2]: listFor(divId2, 2),
      };

      const rows = run(results, record);

      expect(rowFor(rows, 1)["Game 1"]).toBe(201);
      expect(rowFor(rows, 2)["Game 1"]).toBe(210);
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
    it("counts a bracket the player is alive in", () => {
      const rows = run([], {
        [brktId1]: singlePlayerList(1, makeBracket({ alive: true })),
      });

      expect(rows[0].in).toBe(1);
    });

    it("does not count a bracket the player has lost in", () => {
      const rows = run([], {
        [brktId1]: singlePlayerList(1, makeBracket({ alive: false })),
      });

      expect(rows[0].in).toBe(0);
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

      expect(run([], record)[0].in).toBe(2);
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
      expect(rows[0].in).toBe(3);
    });

    it("asks each bracket about this player", () => {
      const bracket = makeBracket();

      run([], { [brktId1]: singlePlayerList(1, bracket) });

      expect(bracket.isPlayerAlive).toHaveBeenCalledWith(pid(1));
      expect(bracket.isPlayerFirstOrSecond).toHaveBeenCalledWith(pid(1));
    });

    it("counts a player in the bracket at index 0", () => {
      // index 0 is falsy, so it must not be treated as missing
      const rows = run([], {
        [brktId1]: singlePlayerList(1, makeBracket()),
      });

      expect(rows[0].in).toBe(1);
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

      expect(rows[0].in).toBe(0);
      expect(rows[0].cash).toBe("");
    });

    it("ignores an index that has no bracket", () => {
      const record = {
        [brktId1]: makeFakeList({
          players: { [pid(1)]: fakePlayer(1, ["b5"]) },
          brackets: [makeBracket()],
          bracketIndexes: { b5: 5 },
        }),
      };

      expect(() => run([], record)).not.toThrow();
      expect(run([], record)[0].in).toBe(0);
    });

    it("gives 0 for a player who is in no brackets", () => {
      const record = {
        [brktId1]: makeFakeList({
          players: { [pid(1)]: fakePlayer(1, []) },
          brackets: [makeBracket()],
          bracketIndexes: { b0: 0 },
        }),
      };

      expect(run([], record)[0].in).toBe(0);
    });
  });

  describe("cash marker", () => {
    it("shows $ when the player is first or second in a bracket", () => {
      const rows = run([], {
        [brktId1]: singlePlayerList(1, makeBracket({ cash: true })),
      });

      expect(rows[0].cash).toBe("$");
    });

    it("shows nothing when the player is not first or second", () => {
      const rows = run([], {
        [brktId1]: singlePlayerList(1, makeBracket({ cash: false })),
      });

      expect(rows[0].cash).toBe("");
    });

    it("keeps the $ when a later bracket is not a cash for the player", () => {
      const record = {
        [brktId1]: makeFakeList({
          players: { [pid(1)]: fakePlayer(1, ["b0", "b1"]) },
          brackets: [makeBracket({ cash: true }), makeBracket({ cash: false })],
          bracketIndexes: { b0: 0, b1: 1 },
        }),
      };

      expect(run([], record)[0].cash).toBe("$");
    });

    it("keeps the $ from an earlier list when a later list is not a cash", () => {
      const record = {
        [brktId1]: singlePlayerList(1, makeBracket({ cash: true })),
        [brktId2]: singlePlayerList(1, makeBracket({ cash: false })),
      };

      expect(run([], record)[0].cash).toBe("$");
    });

    it("counts a player as in and as a cash for the same bracket", () => {
      const rows = run([], {
        [brktId1]: singlePlayerList(1, makeBracket({ alive: true, cash: true })),
      });

      expect(rows[0].in).toBe(1);
      expect(rows[0].cash).toBe("$");
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

      expect(rows[0]["Game 1"]).toBe(201);
      expect(rows[0]["Game 6"]).toBe(185);
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
    const gameNumsFor = (brktIndex: number) =>
      Array.from(
        { length: brkts[brktIndex].games },
        (_, i) => brkts[brktIndex].start + i
      );

    const buildList = (brktIndex: number) =>
      new BracketList(
        brkts[brktIndex].id,
        defaultPlayersPerMatch,
        brkts[brktIndex].games,
        gameNumsFor(brktIndex),
        undefined,
        { tmntFullData: mockTmntFullData, divId: brkts[brktIndex].div_id }
      );

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
      const record = buildRecord();

      expect(record[brktId1].playersMap).not.toBeNull();
      expect(record[brktId1].bracketIndexMap).not.toBeNull();
      expect(record[brktId1].playersMap?.size).toBe(8);
    });

    it("builds lists whose bracket definition has the division the results are filtered by", () => {
      const record = buildRecord();

      expect(record[brktId1].brkt?.div_id).toBe(divId1);
      expect(record[brktId2].brkt?.div_id).toBe(divId1);
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
      const rows = run(allResults, record);

      rows.forEach((row) => {
        const player = players.find((p) => p.id === row.player_id) as playerType;
        expect(row.last_first).toBe(lastFirst(player.first_name, player.last_name));
        expect(row.lane).toBe(record[brktId1].playersMap?.get(player.id)?.lane);
        expect(typeof row.lane).toBe("number");
      });
    });

    it("copies the six game scores from the mock games onto every row", () => {
      const rows = run(allResults, buildRecord());

      rows.forEach((row) => {
        scoresFor(row.player_id as string).forEach((score, i) => {
          expect(row[`Game ${i + 1}`]).toBe(score);
        });
      });
      expect(rowFor(rows, 8)["Game 4"]).toBe(263);
    });

    it("leaves off the game columns when the results are all in another division", () => {
      const otherDivResults = players.map((_, i) => makeResult(i + 1, divId2));

      const rows = run(otherDivResults, buildRecord());

      expect(rows).toHaveLength(8);
      rows.forEach((row) => expect(row).not.toHaveProperty("Game 1"));
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

      rows.forEach((row) => {
        expect(row.cash).toBe(expectedCash(record, row.player_id as string));
      });
    });

    it("counts the brackets each player is still alive in", () => {
      const record = buildRecord();
      const rows = run(allResults, record);

      rows.forEach((row) => {
        const id = row.player_id as string;
        expect(row.in).toBe(expectedIn(record, id));
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
        const id = row.player_id as string;
        expect(row.cash).toBe("");
        expect(row.in).toBe(expectedIn(record, id));
        expect(row.in).toBeGreaterThan(0);
        expect(row).not.toHaveProperty("Game 1");
      });
    });
  });
});


// import {
//   populatePlayerBrktRows,
// } from "@/app/results/tmnt/[tmntId]/brackets/populateBrktPlayerRows";
// import {
//   BracketList,
//   brktListInitialDataType,
// } from "@/components/brackets/bracketListClass";
// import type { brktListRecord } from "@/components/brackets/buildBrktLists";
// import type { tmntGameResult } from "@/lib/types/resultsTypes";
// import {
//   brktId1,
//   brktId2,
//   divId1,
//   mockByePlayer,
//   mockGames,
//   mockTmntFullData,
//   playerId1,
//   playerId2,
//   playerId3,
//   playerId4,
//   playerId5,
//   playerId6,
//   playerId7,
//   playerId8,
// } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// describe("populatePlayerBrktRows", () => {
//   let brktListRecords: brktListRecord;

//   const initData: brktListInitialDataType = {
//     tmntFullData: mockTmntFullData,
//     divId: divId1,
//   };

//   /**
//    * Creates the two bracket lists used by mockTmntFullData.
//    *
//    * brktId1 uses games 1, 2 and 3.
//    * brktId2 uses games 4, 5 and 6.
//    */
//   const setup = (): void => {
//     const brktList1 = new BracketList(
//       brktId1,
//       2,
//       3,
//       [1, 2, 3],
//       mockByePlayer,
//       initData,
//     );

//     const brktList2 = new BracketList(
//       brktId2,
//       2,
//       3,
//       [4, 5, 6],
//       mockByePlayer,
//       initData,
//     );

//     brktListRecords = {
//       [brktId1]: brktList1,
//       [brktId2]: brktList2,
//     };
//   };

//   /**
//    * Converts mockGames into the tournament-result format used by
//    * populatePlayerBrktRows().
//    *
//    * Only games through lastGame are included. This lets each test
//    * simulate scores being entered one game at a time.
//    */
//   const resultsThrough = (
//     lastGame: number,
//   ): tmntGameResult[] => {
//     const playerIds = [
//       playerId1,
//       playerId2,
//       playerId3,
//       playerId4,
//       playerId5,
//       playerId6,
//       playerId7,
//       playerId8,
//     ];

//     return playerIds.map((playerId) => {
//       const result = {
//         player_id: playerId,
//       } as tmntGameResult;

//       mockGames
//         .filter(
//           (game) =>
//             game.player_id === playerId &&
//             game.game_num <= lastGame,
//         )
//         .forEach((game) => {
//           const gameCol =
//             `Game ${game.game_num}` as keyof tmntGameResult;

//           (
//             result as unknown as Record<string, unknown>
//           )[gameCol] = game.score;
//         });

//       return result;
//     });
//   };

//   /**
//    * Returns one player row or throws a useful test error if
//    * populatePlayerBrktRows() did not create the row.
//    */
//   const getPlayerRow = (
//     rows: ReturnType<typeof populatePlayerBrktRows>,
//     playerId: string,
//   ) => {
//     const row = rows.find(
//       (playerRow) =>
//         playerRow.player_id === playerId,
//     );

//     if (row === undefined) {
//       throw new Error(
//         `Player row not found for ${playerId}.`,
//       );
//     }

//     return row;
//   };

//   beforeEach(() => {
//     setup();
//   });

//   it("creates one row for each player when no scores have been entered", () => {
//     const rows = populatePlayerBrktRows(
//       [],
//       brktListRecords,
//     );

//     expect(rows).toHaveLength(8);

//     expect(
//       rows.map((row) => row.player_id),
//     ).toEqual(
//       expect.arrayContaining([
//         playerId1,
//         playerId2,
//         playerId3,
//         playerId4,
//         playerId5,
//         playerId6,
//         playerId7,
//         playerId8,
//       ]),
//     );
//   });

//   it("combines the In counts from both bracket lists when no scores have been entered", () => {
//     const rows = populatePlayerBrktRows(
//       [],
//       brktListRecords,
//     );

//     /*
//      * Every player is entered in:
//      *
//      *   8 brackets for brktId1
//      * + 8 brackets for brktId2
//      * ------------------------
//      *  16 brackets total
//      */
//     rows.forEach((row) => {
//       expect(row.in).toBe(16);
//       expect(row.cash).toBe("");
//     });
//   });

//   it("does not add game columns when no scores have been entered", () => {
//     const rows = populatePlayerBrktRows(
//       [],
//       brktListRecords,
//     );

//     rows.forEach((row) => {
//       expect(row).not.toHaveProperty("Game 1");
//       expect(row).not.toHaveProperty("Game 2");
//       expect(row).not.toHaveProperty("Game 3");
//       expect(row).not.toHaveProperty("Game 4");
//       expect(row).not.toHaveProperty("Game 5");
//       expect(row).not.toHaveProperty("Game 6");
//     });
//   });

//   it("copies game 1 scores into the player rows", () => {
//     const rows = populatePlayerBrktRows(
//       resultsThrough(1),
//       brktListRecords,
//     );

//     expect(
//       getPlayerRow(rows, playerId1)["Game 1"],
//     ).toBe(201);

//     expect(
//       getPlayerRow(rows, playerId2)["Game 1"],
//     ).toBe(210);

//     expect(
//       getPlayerRow(rows, playerId3)["Game 1"],
//     ).toBe(195);

//     expect(
//       getPlayerRow(rows, playerId4)["Game 1"],
//     ).toBe(205);

//     expect(
//       getPlayerRow(rows, playerId5)["Game 1"],
//     ).toBe(225);

//     expect(
//       getPlayerRow(rows, playerId6)["Game 1"],
//     ).toBe(229);

//     expect(
//       getPlayerRow(rows, playerId7)["Game 1"],
//     ).toBe(190);

//     expect(
//       getPlayerRow(rows, playerId8)["Game 1"],
//     ).toBe(230);
//   });

//   it("does not change the second bracket list before game 4 is entered", () => {
//     const rows = populatePlayerBrktRows(
//       resultsThrough(3),
//       brktListRecords,
//     );

//     /*
//      * Games 1-3 can eliminate players from brktId1.
//      *
//      * brktId2 does not start until game 4, so every player
//      * must still have at least the 8 brktId2 entries alive.
//      */
//     rows.forEach((row) => {
//       expect(row.in).toBeGreaterThanOrEqual(8);
//     });
//   });

//   it("copies games 1 through 3 without adding games 4 through 6", () => {
//     const rows = populatePlayerBrktRows(
//       resultsThrough(3),
//       brktListRecords,
//     );

//     const player1Row = getPlayerRow(
//       rows,
//       playerId1,
//     );

//     expect(player1Row["Game 1"]).toBe(201);
//     expect(player1Row["Game 2"]).toBe(202);
//     expect(player1Row["Game 3"]).toBe(203);

//     expect(player1Row).not.toHaveProperty("Game 4");
//     expect(player1Row).not.toHaveProperty("Game 5");
//     expect(player1Row).not.toHaveProperty("Game 6");
//   });

//   it("starts updating the second bracket list when game 4 is entered", () => {
//     const rowsBeforeGame4 =
//       populatePlayerBrktRows(
//         resultsThrough(3),
//         brktListRecords,
//       );

//     /*
//      * Recreate the lists because populatePlayerBrktRows()
//      * updates their bracket state.
//      */
//     setup();

//     const rowsAfterGame4 =
//       populatePlayerBrktRows(
//         resultsThrough(4),
//         brktListRecords,
//       );

//     /*
//      * Game 4 is the first game used by brktId2.
//      * At least one player's total number of live brackets
//      * should therefore decrease.
//      */
//     const inChanged = rowsAfterGame4.some(
//       (row) => {
//         const beforeRow = getPlayerRow(
//           rowsBeforeGame4,
//           row.player_id,
//         );

//         return row.in < beforeRow.in;
//       },
//     );

//     expect(inChanged).toBe(true);
//   });

//   it("copies the new random game 4 scores into the player rows", () => {
//     const rows = populatePlayerBrktRows(
//       resultsThrough(4),
//       brktListRecords,
//     );

//     expect(
//       getPlayerRow(rows, playerId1)["Game 4"],
//     ).toBe(252);

//     expect(
//       getPlayerRow(rows, playerId2)["Game 4"],
//     ).toBe(265);

//     expect(
//       getPlayerRow(rows, playerId3)["Game 4"],
//     ).toBe(264);

//     expect(
//       getPlayerRow(rows, playerId4)["Game 4"],
//     ).toBe(181);

//     expect(
//       getPlayerRow(rows, playerId5)["Game 4"],
//     ).toBe(228);

//     expect(
//       getPlayerRow(rows, playerId6)["Game 4"],
//     ).toBe(222);

//     expect(
//       getPlayerRow(rows, playerId7)["Game 4"],
//     ).toBe(193);

//     expect(
//       getPlayerRow(rows, playerId8)["Game 4"],
//     ).toBe(263);
//   });

//   it("copies the new random game 5 scores into the player rows", () => {
//     const rows = populatePlayerBrktRows(
//       resultsThrough(5),
//       brktListRecords,
//     );

//     expect(
//       getPlayerRow(rows, playerId1)["Game 5"],
//     ).toBe(182);

//     expect(
//       getPlayerRow(rows, playerId2)["Game 5"],
//     ).toBe(202);

//     expect(
//       getPlayerRow(rows, playerId3)["Game 5"],
//     ).toBe(242);

//     expect(
//       getPlayerRow(rows, playerId4)["Game 5"],
//     ).toBe(188);

//     expect(
//       getPlayerRow(rows, playerId5)["Game 5"],
//     ).toBe(182);

//     expect(
//       getPlayerRow(rows, playerId6)["Game 5"],
//     ).toBe(183);

//     expect(
//       getPlayerRow(rows, playerId7)["Game 5"],
//     ).toBe(228);

//     expect(
//       getPlayerRow(rows, playerId8)["Game 5"],
//     ).toBe(261);
//   });

//   it("copies all six game scores into the player rows", () => {
//     const rows = populatePlayerBrktRows(
//       resultsThrough(6),
//       brktListRecords,
//     );

//     const player1Row = getPlayerRow(
//       rows,
//       playerId1,
//     );

//     expect(player1Row).toMatchObject({
//       "Game 1": 201,
//       "Game 2": 202,
//       "Game 3": 203,
//       "Game 4": 252,
//       "Game 5": 182,
//       "Game 6": 185,
//     });

//     const player8Row = getPlayerRow(
//       rows,
//       playerId8,
//     );

//     expect(player8Row).toMatchObject({
//       "Game 1": 230,
//       "Game 2": 231,
//       "Game 3": 232,
//       "Game 4": 263,
//       "Game 5": 261,
//       "Game 6": 239,
//     });
//   });

//   it("marks players who cash after completed brackets", () => {
//     const rows = populatePlayerBrktRows(
//       resultsThrough(6),
//       brktListRecords,
//     );

//     /*
//      * At least one player must finish first or second in
//      * one of the sixteen individual brackets.
//      */
//     expect(
//       rows.some((row) => row.cash === "$"),
//     ).toBe(true);
//   });

//   it("returns the rows sorted by last name and first name", () => {
//     const rows = populatePlayerBrktRows(
//       [],
//       brktListRecords,
//     );

//     expect(
//       rows.map((row) => ({
//         first_name: row.first_name,
//         last_name: row.last_name,
//       })),
//     ).toEqual([
//       {
//         first_name: "Jane",
//         last_name: "Doe",
//       },
//       {
//         first_name: "Jill",
//         last_name: "Doe",
//       },
//       {
//         first_name: "Joe",
//         last_name: "Doe",
//       },
//       {
//         first_name: "John",
//         last_name: "Doe",
//       },
//       {
//         first_name: "Terri",
//         last_name: "Smith",
//       },
//       {
//         first_name: "Tina",
//         last_name: "Smith",
//       },
//       {
//         first_name: "Tom",
//         last_name: "Smith",
//       },
//       {
//         first_name: "Tony",
//         last_name: "Smith",
//       },
//     ]);
//   });
// });

