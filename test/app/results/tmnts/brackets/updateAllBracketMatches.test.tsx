import { updateAllBracketMatches } from "@/app/results/tmnt/[tmntId]/brackets/updateAllBracketMatches";
import { BracketList } from "@/components/brackets/bracketListClass";
import type { brktListRecord } from "@/components/brackets/buildBrktLists";
import { tmntResultsToGameTypes } from "@/lib/tmntResultsToGameTypes";
import { defaultPlayersPerMatch } from "@/lib/db/initVals";
import type { tmntGameResult } from "@/lib/types/resultsTypes";
import {
  mockTmntFullData,
  mockGames,
  brktId1,
  brktId2,
  divId1,
  playerId2,
  playerId3,
  playerId4,
  playerId6,
  playerId8,
  oneBrktId1,
  oneBrktId9,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// Only the integration tests below reach this function. It is mocked so the
// bracket lists are fed the mock game scores directly.
jest.mock("@/lib/tmntResultsToGameTypes", () => ({
  tmntResultsToGameTypes: jest.fn(),
}));

const mockedToGameTypes = tmntResultsToGameTypes as jest.Mock;

/********************************************/
/* fixtures built from mockTmntFullData     */
/********************************************/
const { players, brkts } = mockTmntFullData;

// updateAllBracketMatches only passes the results along, so minimal results will do
const tmntResults = players.map((p) => ({
  player_id: p.id,
  div_id: divId1,
})) as unknown as tmntGameResult[];

/*****************************/
/* unit tests: fake lists    */
/*****************************/
type FakeListOpts = {
  playersMap?: Map<string, unknown> | null;
  bracketIndexMap?: Map<string, unknown> | null;
};

const makeFakeList = ({
  playersMap = new Map([["ply_1", {}]]),
  bracketIndexMap = new Map([["obk_1", 0]]),
}: FakeListOpts = {}) => {
  const updateBracketMatches = jest.fn();
  const list = {
    playersMap,
    bracketIndexMap,
    updateBracketMatches,
  } as unknown as BracketList;
  return { list, updateBracketMatches };
};

describe("updateAllBracketMatches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedToGameTypes.mockReturnValue(mockGames);
  });

  describe("fixture sanity check", () => {
    it("mock tournament has two brackets in the same division", () => {
      expect(brkts).toHaveLength(2);
      expect(brkts[0].id).toBe(brktId1);
      expect(brkts[1].id).toBe(brktId2);
      expect(brkts[0].div_id).toBe(divId1);
      expect(brkts[1].div_id).toBe(divId1);
    });
  });

  describe("updating the lists", () => {
    it("calls updateBracketMatches on a list that has both maps", () => {
      const { list, updateBracketMatches } = makeFakeList();

      updateAllBracketMatches({ [brktId1]: list }, tmntResults);

      expect(updateBracketMatches).toHaveBeenCalledTimes(1);
    });

    it("passes the same results array, and nothing else, to the list", () => {
      const { list, updateBracketMatches } = makeFakeList();

      updateAllBracketMatches({ [brktId1]: list }, tmntResults);

      expect(updateBracketMatches).toHaveBeenCalledWith(tmntResults);
      expect(updateBracketMatches.mock.calls[0]).toHaveLength(1);
      expect(updateBracketMatches.mock.calls[0][0]).toBe(tmntResults);
    });

    it("calls updateBracketMatches once on every list in the record", () => {
      const first = makeFakeList();
      const second = makeFakeList();

      updateAllBracketMatches(
        { [brktId1]: first.list, [brktId2]: second.list },
        tmntResults
      );

      expect(first.updateBracketMatches).toHaveBeenCalledTimes(1);
      expect(second.updateBracketMatches).toHaveBeenCalledTimes(1);
      expect(second.updateBracketMatches).toHaveBeenCalledWith(tmntResults);
    });

    it("updates the lists in the order they appear in the record", () => {
      const callOrder: string[] = [];
      const first = makeFakeList();
      const second = makeFakeList();
      first.updateBracketMatches.mockImplementation(() => callOrder.push("first"));
      second.updateBracketMatches.mockImplementation(() => callOrder.push("second"));

      updateAllBracketMatches(
        { [brktId1]: first.list, [brktId2]: second.list },
        tmntResults
      );

      expect(callOrder).toEqual(["first", "second"]);
    });

    it("returns undefined", () => {
      const { list } = makeFakeList();

      expect(
        updateAllBracketMatches({ [brktId1]: list }, tmntResults)
      ).toBeUndefined();
    });

    it("does nothing, and does not throw, when the record is empty", () => {
      expect(() => updateAllBracketMatches({}, tmntResults)).not.toThrow();
    });

    it("passes an empty results array through to the list", () => {
      const { list, updateBracketMatches } = makeFakeList();
      const noResults: tmntGameResult[] = [];

      updateAllBracketMatches({ [brktId1]: list }, noResults);

      expect(updateBracketMatches).toHaveBeenCalledWith(noResults);
    });

    it("leaves the record itself unchanged", () => {
      const first = makeFakeList();
      const second = makeFakeList();
      const record: brktListRecord = {
        [brktId1]: first.list,
        [brktId2]: second.list,
      };

      updateAllBracketMatches(record, tmntResults);

      expect(Object.keys(record)).toEqual([brktId1, brktId2]);
      expect(record[brktId1]).toBe(first.list);
      expect(record[brktId2]).toBe(second.list);
    });
  });

  describe("skipping lists that are not ready", () => {
    it("skips a list whose playersMap is null", () => {
      const { list, updateBracketMatches } = makeFakeList({ playersMap: null });

      updateAllBracketMatches({ [brktId1]: list }, tmntResults);

      expect(updateBracketMatches).not.toHaveBeenCalled();
    });

    it("skips a list whose bracketIndexMap is null", () => {
      const { list, updateBracketMatches } = makeFakeList({
        bracketIndexMap: null,
      });

      updateAllBracketMatches({ [brktId1]: list }, tmntResults);

      expect(updateBracketMatches).not.toHaveBeenCalled();
    });

    it("skips a list when both maps are null", () => {
      const { list, updateBracketMatches } = makeFakeList({
        playersMap: null,
        bracketIndexMap: null,
      });

      updateAllBracketMatches({ [brktId1]: list }, tmntResults);

      expect(updateBracketMatches).not.toHaveBeenCalled();
    });

    it("updates the ready lists and skips the others in the same record", () => {
      const ready = makeFakeList();
      const noPlayers = makeFakeList({ playersMap: null });
      const noIndex = makeFakeList({ bracketIndexMap: null });
      const alsoReady = makeFakeList();

      updateAllBracketMatches(
        {
          [brktId1]: ready.list,
          noPlayers: noPlayers.list,
          noIndex: noIndex.list,
          [brktId2]: alsoReady.list,
        },
        tmntResults
      );

      expect(ready.updateBracketMatches).toHaveBeenCalledTimes(1);
      expect(alsoReady.updateBracketMatches).toHaveBeenCalledTimes(1);
      expect(noPlayers.updateBracketMatches).not.toHaveBeenCalled();
      expect(noIndex.updateBracketMatches).not.toHaveBeenCalled();
    });

    it("still calls a list whose maps are empty, because only null is checked here", () => {
      // an empty playersMap is handled inside BracketList.updateBracketMatches
      const { list, updateBracketMatches } = makeFakeList({
        playersMap: new Map(),
        bracketIndexMap: new Map(),
      });

      updateAllBracketMatches({ [brktId1]: list }, tmntResults);

      expect(updateBracketMatches).toHaveBeenCalledTimes(1);
    });
  });

  describe("errors", () => {
    it("lets an error from a list propagate, and does not update the lists after it", () => {
      const failing = makeFakeList();
      const after = makeFakeList();
      failing.updateBracketMatches.mockImplementation(() => {
        throw new Error("gameScoreMap is null");
      });

      expect(() =>
        updateAllBracketMatches(
          { [brktId1]: failing.list, [brktId2]: after.list },
          tmntResults
        )
      ).toThrow("gameScoreMap is null");
      expect(after.updateBracketMatches).not.toHaveBeenCalled();
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

    const getBracket = (list: BracketList, id: string) =>
      list.brackets.find((b) => b.id === id);

    it("builds lists that are ready to be updated", () => {
      const record = buildRecord();

      expect(record[brktId1].playersMap).not.toBeNull();
      expect(record[brktId1].bracketIndexMap).not.toBeNull();
      expect(record[brktId1].brackets).toHaveLength(8);
      expect(record[brktId2].brackets).toHaveLength(8);
    });

    it("calls updateBracketMatches on every ready list with the results", () => {
      const record = buildRecord();
      const spy1 = jest.spyOn(record[brktId1], "updateBracketMatches");
      const spy2 = jest.spyOn(record[brktId2], "updateBracketMatches");

      updateAllBracketMatches(record, tmntResults);

      expect(spy1).toHaveBeenCalledWith(tmntResults);
      expect(spy2).toHaveBeenCalledWith(tmntResults);
    });

    it("updates the matches of every bracket in every list from the mock game scores", () => {
      const record = buildRecord();
      const first = getBracket(record[brktId1], oneBrktId1);
      const second = getBracket(record[brktId2], oneBrktId9);

      // nothing is decided before the update
      expect(first?.winnerIds.size).toBe(0);
      expect(second?.winnerIds.size).toBe(0);

      updateAllBracketMatches(record, tmntResults);

      // bracket game scores 1-3 (first list): player 8 beats player 2 in the final
      expect([...(first?.winnerIds ?? [])]).toEqual([playerId8]);
      expect([...(first?.runnerUpIds ?? [])]).toEqual([playerId2]);
      // bracket game scores 4-6 (second list): player 8 beats player 3 in the final
      expect([...(second?.winnerIds ?? [])]).toEqual([playerId8]);
      expect([...(second?.runnerUpIds ?? [])]).toEqual([playerId3]);
    });

    it("builds the game score map for each list from the converted results", () => {
      const record = buildRecord();

      updateAllBracketMatches(record, tmntResults);

      expect(mockedToGameTypes).toHaveBeenCalledTimes(2);
      expect(mockedToGameTypes).toHaveBeenCalledWith(tmntResults);
      expect(record[brktId1].gameScoreMap?.size).toBeGreaterThan(0);
    });

    it("skips a real list that was created without initial data", () => {
      const record = buildRecord();
      const emptyList = new BracketList(brktId1, defaultPlayersPerMatch);
      const spy = jest.spyOn(emptyList, "updateBracketMatches");
      expect(emptyList.playersMap).toBeNull();

      updateAllBracketMatches(
        { ...record, empty: emptyList },
        tmntResults
      );

      expect(spy).not.toHaveBeenCalled();
      // the ready lists were still updated
      expect(
        getBracket(record[brktId1], oneBrktId1)?.winnerIds.size
      ).toBe(1);
    });

    it("skips a real list whose tournament has no oneBrkts yet", () => {
      const noOneBrkts = { ...mockTmntFullData, oneBrkts: [] };
      const list = new BracketList(
        brkts[0].id,
        defaultPlayersPerMatch,
        brkts[0].games,
        gameNumsFor(0),
        undefined,
        { tmntFullData: noOneBrkts, divId: brkts[0].div_id }
      );
      const spy = jest.spyOn(list, "updateBracketMatches");
      expect(list.playersMap).toBeNull();
      expect(list.bracketIndexMap).toBeNull();

      updateAllBracketMatches({ [brktId1]: list }, tmntResults);

      expect(spy).not.toHaveBeenCalled();
    });

    it("can be run twice with the same results and gives the same placements", () => {
      const record = buildRecord();
      const bracket = getBracket(record[brktId1], oneBrktId1);

      updateAllBracketMatches(record, tmntResults);
      updateAllBracketMatches(record, tmntResults);

      expect([...(bracket?.winnerIds ?? [])]).toEqual([playerId8]);
      expect([...(bracket?.runnerUpIds ?? [])]).toEqual([playerId2]);
    });

    it("decides no placements before game 3 has been bowled", () => {
      mockedToGameTypes.mockReturnValue(mockGames.filter((g) => g.game_num <= 2));
      const record = buildRecord();
      const first = getBracket(record[brktId1], oneBrktId1);

      updateAllBracketMatches(record, tmntResults);

      // the final has no scores yet, so updateFinalPlacements returns early
      expect(first?.winnerIds.size).toBe(0);
      expect(first?.runnerUpIds.size).toBe(0);
    });

    it("makes both finalists winners, and no runner-up, when the final is tied", () => {
      // player 2's game 3 score raised from 212 to 232, tying player 8
      mockedToGameTypes.mockReturnValue(
        mockGames.map((g) =>
          g.player_id === playerId2 && g.game_num === 3 ? { ...g, score: 232 } : g
        )
      );
      const record = buildRecord();
      const first = getBracket(record[brktId1], oneBrktId1);

      updateAllBracketMatches(record, tmntResults);

      expect(first?.winnerIds).toEqual(new Set([playerId2, playerId8]));
      expect(first?.runnerUpIds.size).toBe(0);
    });

    describe("a tie in game 2 (game 3 is the tie breaker)", () => {
      // The first list uses squad games 1-3, so game_num 2 is bracket game 2
      // (the semifinals) and game_num 3 is bracket game 3 (the final).
      type ScoreChange = { playerId: string; gameNum: number; score: number };

      const withScores = (changes: ScoreChange[]) =>
        mockGames.map((g) => {
          const change = changes.find(
            (c) => c.playerId === g.player_id && c.gameNum === g.game_num
          );
          return change ? { ...g, score: change.score } : g;
        });

      const game3 = (scores: [string, number][]): ScoreChange[] =>
        scores.map(([playerId, score]) => ({ playerId, gameNum: 3, score }));

      // semifinal match 4 is player 2 (211) vs player 4: player 4 now ties at 211
      const tieMatch4: ScoreChange[] = [
        { playerId: playerId4, gameNum: 2, score: 211 },
      ];
      // semifinal match 5 is player 6 vs player 8 (231): player 6 now ties at 231
      const tieMatch5: ScoreChange[] = [
        { playerId: playerId6, gameNum: 2, score: 231 },
      ];

      type TieCase = {
        name: string;
        changes: ScoreChange[];
        tied: string[]; // players tied in game 2
        lostOutright: string[]; // lost the other semifinal outright
        winners: string[];
        runnerUps: string[];
        tieBreakLosers: string[]; // lost the game 3 tie breaker
        notLosers: string[]; // must not be in _loserBrktGame2Ids
      };

      const cases: TieCase[] = [
        // players 2 and 4 tie in game 2; player 8 won the other semifinal
        {
          name: "2 and 4 tie, player 2 high in game 3 (2 > 4 > 8): 2 wins, 8 is runner up, 4 loses the tie breaker",
          changes: [
            ...tieMatch4,
            ...game3([[playerId2, 240], [playerId4, 230], [playerId8, 220]]),
          ],
          tied: [playerId2, playerId4],
          lostOutright: [playerId6],
          winners: [playerId2],
          runnerUps: [playerId8],
          tieBreakLosers: [playerId4],
          notLosers: [playerId2, playerId8],
        },
        {
          name: "2 and 4 tie, player 4 high in game 3 (4 > 2 > 8): 4 wins, 8 is runner up, 2 loses the tie breaker",
          changes: [
            ...tieMatch4,
            ...game3([[playerId4, 240], [playerId2, 230], [playerId8, 220]]),
          ],
          tied: [playerId2, playerId4],
          lostOutright: [playerId6],
          winners: [playerId4],
          runnerUps: [playerId8],
          tieBreakLosers: [playerId2],
          notLosers: [playerId4, playerId8],
        },
        {
          name: "2 and 4 tie, player 8 high in game 3 (8 > 2 > 4): 8 wins, 2 is runner up, 4 loses the tie breaker",
          changes: [
            ...tieMatch4,
            ...game3([[playerId8, 240], [playerId2, 230], [playerId4, 220]]),
          ],
          tied: [playerId2, playerId4],
          lostOutright: [playerId6],
          winners: [playerId8],
          runnerUps: [playerId2],
          tieBreakLosers: [playerId4],
          notLosers: [playerId2, playerId8],
        },
        {
          name: "2 and 4 tie, player 8 high in game 3 and 2 and 4 tie again (8 > 2 = 4): 8 wins, 2 and 4 are runners up, neither loses",
          changes: [
            ...tieMatch4,
            ...game3([[playerId8, 240], [playerId2, 230], [playerId4, 230]]),
          ],
          tied: [playerId2, playerId4],
          lostOutright: [playerId6],
          winners: [playerId8],
          runnerUps: [playerId2, playerId4],
          tieBreakLosers: [],
          notLosers: [playerId2, playerId4, playerId8],
        },

        // players 6 and 8 tie in game 2; player 2 won the other semifinal
        {
          name: "6 and 8 tie, player 6 high in game 3 (6 > 8 > 2): 6 wins, 2 is runner up, 8 loses the tie breaker",
          changes: [
            ...tieMatch5,
            ...game3([[playerId6, 240], [playerId8, 230], [playerId2, 220]]),
          ],
          tied: [playerId6, playerId8],
          lostOutright: [playerId4],
          winners: [playerId6],
          runnerUps: [playerId2],
          tieBreakLosers: [playerId8],
          notLosers: [playerId6, playerId2],
        },
        {
          name: "6 and 8 tie, player 8 high in game 3 (8 > 6 > 2): 8 wins, 2 is runner up, 6 loses the tie breaker",
          changes: [
            ...tieMatch5,
            ...game3([[playerId8, 240], [playerId6, 230], [playerId2, 220]]),
          ],
          tied: [playerId6, playerId8],
          lostOutright: [playerId4],
          winners: [playerId8],
          runnerUps: [playerId2],
          tieBreakLosers: [playerId6],
          notLosers: [playerId8, playerId2],
        },
        {
          name: "6 and 8 tie, player 2 high in game 3 (2 > 6 > 8): 2 wins, 6 is runner up, 8 loses the tie breaker",
          changes: [
            ...tieMatch5,
            ...game3([[playerId2, 240], [playerId6, 230], [playerId8, 220]]),
          ],
          tied: [playerId6, playerId8],
          lostOutright: [playerId4],
          winners: [playerId2],
          runnerUps: [playerId6],
          tieBreakLosers: [playerId8],
          notLosers: [playerId2, playerId6],
        },
        {
          name: "6 and 8 tie, player 2 high in game 3 and 6 and 8 tie again (2 > 6 = 8): 2 wins, 6 and 8 are runners up, neither loses",
          changes: [
            ...tieMatch5,
            ...game3([[playerId2, 240], [playerId6, 230], [playerId8, 230]]),
          ],
          tied: [playerId6, playerId8],
          lostOutright: [playerId4],
          winners: [playerId2],
          runnerUps: [playerId6, playerId8],
          tieBreakLosers: [],
          notLosers: [playerId2, playerId6, playerId8],
        },
      ];

      it.each(cases)(
        "$name",
        ({
          changes,
          tied,
          lostOutright,
          winners,
          runnerUps,
          tieBreakLosers,
          notLosers,
        }) => {
          mockedToGameTypes.mockReturnValue(withScores(changes));
          const record = buildRecord();
          const bracket = getBracket(record[brktId1], oneBrktId1);

          updateAllBracketMatches(record, tmntResults);

          expect(bracket?.winnerIds).toEqual(new Set(winners));
          expect(bracket?.runnerUpIds).toEqual(new Set(runnerUps));
          expect(bracket?.semiFinalTies).toEqual(new Set(tied));
          [...lostOutright, ...tieBreakLosers].forEach((id) => {
            expect(bracket?.loserBrktGame2Ids.has(id)).toBe(true);
          });
          notLosers.forEach((id) => {
            expect(bracket?.loserBrktGame2Ids.has(id)).toBe(false);
          });
        }
      );

      it("records the tie, but decides nothing and loses no tied player, before game 3 is bowled", () => {
        mockedToGameTypes.mockReturnValue(
          withScores(tieMatch4).filter((g) => g.game_num <= 2)
        );
        const record = buildRecord();
        const bracket = getBracket(record[brktId1], oneBrktId1);

        updateAllBracketMatches(record, tmntResults);

        expect(bracket?.semiFinalTies).toEqual(new Set([playerId2, playerId4]));
        expect(bracket?.winnerIds.size).toBe(0);
        expect(bracket?.runnerUpIds.size).toBe(0);
        expect(bracket?.loserBrktGame2Ids.has(playerId2)).toBe(false);
        expect(bracket?.loserBrktGame2Ids.has(playerId4)).toBe(false);
        // the other semifinal was decided outright
        expect(bracket?.loserBrktGame2Ids.has(playerId6)).toBe(true);
      });

      it("has no semifinal ties when neither semifinal is tied", () => {
        const record = buildRecord();
        const bracket = getBracket(record[brktId1], oneBrktId1);

        updateAllBracketMatches(record, tmntResults);

        expect(bracket?.semiFinalTies.size).toBe(0);
      });

      it("clears the tie results when updated again with scores that are no longer tied", () => {
        mockedToGameTypes.mockReturnValue(
          withScores([
            ...tieMatch4,
            ...game3([[playerId2, 240], [playerId4, 230], [playerId8, 220]]),
          ])
        );
        const record = buildRecord();
        const bracket = getBracket(record[brktId1], oneBrktId1);

        updateAllBracketMatches(record, tmntResults);
        expect(bracket?.winnerIds).toEqual(new Set([playerId2]));

        // back to the original scores: player 8 beats player 2 in the final
        mockedToGameTypes.mockReturnValue(mockGames);
        updateAllBracketMatches(record, tmntResults);

        expect(bracket?.semiFinalTies.size).toBe(0);
        expect(bracket?.winnerIds).toEqual(new Set([playerId8]));
        expect(bracket?.runnerUpIds).toEqual(new Set([playerId2]));
      });
    }); 
  });

});
