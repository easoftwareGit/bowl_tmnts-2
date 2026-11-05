// test/app/components/tmnts/tmnt_games.test.tsx
// tests for src/components/tmnts/games.ts
import {
  calcNumGames,
  getGameNums,
  getLastGameWithScores,
} from "@/components/tmnts/games";
import type { tmntGameResult } from "@/lib/types/resultsTypes";
import {
  mockGames,
  mockTmntFullData,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

/** number of games in the mock tournament (6 per player in mockGames) */
const numMockGames = Math.max(...mockGames.map((game) => game.game_num));

/**
 * The property name games.ts uses for a game's score.
 * Typed as `Game ${number}` (not string) so it can index tmntGameResult.
 */
const gameKey = (gameNum: number): `Game ${number}` => `Game ${gameNum}`;

/**
 * Creates tournament game results from the tournament mock data.
 *
 * Each player gets one tmntGameResult containing "Game 1" through
 * "Game <maxGameNum>". Every call returns new objects, so tests can
 * change the rows without affecting other tests.
 *
 * @param {number} maxGameNum - last game to include, defaults to all games
 * @returns {tmntGameResult[]} one row per mock player, in player order
 */
const createTmntResults = (maxGameNum = numMockGames): tmntGameResult[] => {
  const div = mockTmntFullData.divs[0];
  if (!div) {
    throw new Error("mockTmntFullData has no divisions");
  }

  return mockTmntFullData.players.map((player) => {
    const divEntry = mockTmntFullData.divEntries.find(
      (entry) => entry.player_id === player.id,
    );
    if (!divEntry) {
      throw new Error(`Division entry not found for player ${player.id}`);
    }

    const playerGames = mockGames.filter(
      (game) => game.player_id === player.id && game.game_num <= maxGameNum,
    );

    const gameScores = Object.fromEntries(
      playerGames.map((game) => [gameKey(game.game_num), game.score ?? 0]),
    );

    const total = playerGames.reduce(
      (sum, game) => sum + (game.score ?? 0),
      0,
    );

    return {
      player_id: player.id,
      div_id: divEntry.div_id,
      div_name: div.div_name,
      sort_order: div.sort_order,
      tmnt_name: mockTmntFullData.tmnt.tmnt_name,
      start_date: mockTmntFullData.tmnt.start_date_str,
      full_name: `${player.first_name} ${player.last_name}`,
      average: player.average ?? 0,
      hdcp: 0,
      total,
      ...gameScores,
    } as unknown as tmntGameResult;
  });
};

/** Returns the row at index, failing the test if it does not exist. */
const resultAt = (
  tmntResults: tmntGameResult[],
  index: number,
): tmntGameResult => {
  const result = tmntResults[index];
  if (!result) {
    throw new Error(`No tournament result at index ${index}`);
  }
  return result;
};

/** Marks a game as not bowled yet (null score) for one row. */
const clearGame = (result: tmntGameResult, gameNum: number): void => {
  result[gameKey(gameNum)] = null as unknown as number;
};

/** Marks a game as not bowled yet (null score) for every row. */
const clearGameForAll = (
  tmntResults: tmntGameResult[],
  gameNum: number,
): void => {
  tmntResults.forEach((result) => clearGame(result, gameNum));
};

describe("games", () => {
  describe("mock data", () => {
    // guards the assumptions the tests below are built on
    it("has 6 games for every player", () => {
      expect(numMockGames).toBe(6);
      mockTmntFullData.players.forEach((player) => {
        const playerGames = mockGames.filter(
          (game) => game.player_id === player.id,
        );
        expect(playerGames).toHaveLength(numMockGames);
      });
    });

    it("builds one result row per player, with a score for every game", () => {
      const tmntResults = createTmntResults();

      expect(tmntResults).toHaveLength(mockTmntFullData.players.length);
      tmntResults.forEach((result) => {
        for (let gameNum = 1; gameNum <= numMockGames; gameNum++) {
          expect(result[gameKey(gameNum)]).not.toBeNull();
          expect(result[gameKey(gameNum)]).toBeDefined();
        }
      });
    });
  });

  describe("calcNumGames", () => {
    it("returns 0 for an empty tournament results array", () => {
      expect(calcNumGames([])).toBe(0);
    });

    it("returns 0 for null or undefined tournament results", () => {
      expect(calcNumGames(null as unknown as tmntGameResult[])).toBe(0);
      expect(calcNumGames(undefined as unknown as tmntGameResult[])).toBe(0);
    });

    it("returns 6 when the tournament has 6 games", () => {
      expect(calcNumGames(createTmntResults())).toBe(6);
    });

    it("returns 3 when the tournament has 3 games", () => {
      expect(calcNumGames(createTmntResults(3))).toBe(3);
    });

    it("ignores the non-game properties on a result row", () => {
      const result = resultAt(createTmntResults(), 0);

      // the row has more keys than games, but only the games are counted
      expect(Object.keys(result).length).toBeGreaterThan(numMockGames);
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("hdcp");
      expect(calcNumGames([result])).toBe(numMockGames);
    });

    it("does not count Game N + Hdcp properties", () => {
      const tmntResults = createTmntResults();
      const firstResult = resultAt(tmntResults, 0);
      firstResult["Game 1 + Hdcp"] = firstResult["Game 1"] ?? 0;
      firstResult["Game 2 + Hdcp"] = firstResult["Game 2"] ?? 0;

      expect(calcNumGames(tmntResults)).toBe(6);
    });

    it("only counts keys that are exactly 'Game <number>'", () => {
      const result = {
        "Game 1": 200,
        "Game 2": 210,
        Game: 0,
        "game 3": 0,
        "Game 3a": 0,
        "Game 1.5": 0,
        "Game -4": 0,
        "Game  5": 0,
        " Game 6": 0,
        "Total Game 7": 0,
      } as unknown as tmntGameResult;

      expect(calcNumGames([result])).toBe(2);
    });

    it("counts games with two digit numbers", () => {
      const result = Object.fromEntries(
        Array.from({ length: 10 }, (_, index) => [gameKey(index + 1), 200]),
      ) as unknown as tmntGameResult;

      expect(calcNumGames([result])).toBe(10);
    });

    it("counts the games on the first row only", () => {
      /*
       * Every row is expected to have the same game keys, so only the
       * first row is checked. A first row with fewer games decides the
       * count, even when later rows have more.
       */
      const tmntResults = [
        resultAt(createTmntResults(3), 0),
        ...createTmntResults(),
      ];

      expect(calcNumGames(tmntResults)).toBe(3);
    });
  });

  describe("getGameNums", () => {
    it("returns an empty array for an empty tournament results array", () => {
      expect(getGameNums([])).toEqual([]);
    });

    it("returns an empty array for null or undefined tournament results", () => {
      expect(getGameNums(null as unknown as tmntGameResult[])).toEqual([]);
      expect(getGameNums(undefined as unknown as tmntGameResult[])).toEqual(
        [],
      );
    });

    it("returns game numbers 1 through 6 for a six-game tournament", () => {
      expect(getGameNums(createTmntResults())).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it("returns game numbers 1 through 3 for a three-game tournament", () => {
      expect(getGameNums(createTmntResults(3))).toEqual([1, 2, 3]);
    });

    it("returns game numbers in numeric order past game 9", () => {
      const result = Object.fromEntries(
        Array.from({ length: 10 }, (_, index) => [gameKey(index + 1), 200]),
      ) as unknown as tmntGameResult;

      expect(getGameNums([result])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it("does not include Game N + Hdcp properties", () => {
      const tmntResults = createTmntResults();
      const firstResult = resultAt(tmntResults, 0);
      firstResult["Game 1 + Hdcp"] = firstResult["Game 1"] ?? 0;
      firstResult["Game 2 + Hdcp"] = firstResult["Game 2"] ?? 0;

      expect(getGameNums(tmntResults)).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });

  describe("getLastGameWithScores", () => {
    it("returns 6 when all 6 games have scores", () => {
      expect(getLastGameWithScores(createTmntResults())).toBe(6);
    });

    it("returns 3 when all 3 games of a three-game tournament have scores", () => {
      expect(getLastGameWithScores(createTmntResults(3))).toBe(3);
    });

    it.each([
      { gameNum: 2, expected: 1 },
      { gameNum: 3, expected: 2 },
      { gameNum: 4, expected: 3 },
      { gameNum: 5, expected: 4 },
      { gameNum: 6, expected: 5 },
    ])(
      "returns $expected when no players have a Game $gameNum score or later",
      ({ gameNum, expected }) => {
        const tmntResults = createTmntResults();
        for (let game = gameNum; game <= numMockGames; game++) {
          clearGameForAll(tmntResults, game);
        }

        expect(getLastGameWithScores(tmntResults)).toBe(expected);
      },
    );

    it("stops at the first game with no scores, even if later games have scores", () => {
      const tmntResults = createTmntResults();
      clearGameForAll(tmntResults, 4);

      // Game 5 and Game 6 still have scores
      tmntResults.forEach((result) => {
        expect(result["Game 5"]).not.toBeNull();
        expect(result["Game 6"]).not.toBeNull();
      });

      expect(getLastGameWithScores(tmntResults)).toBe(3);
    });

    it("continues when only some players are missing a game score", () => {
      const tmntResults = createTmntResults();
      // one player has not entered Game 4 yet
      clearGame(resultAt(tmntResults, 0), 4);

      expect(getLastGameWithScores(tmntResults)).toBe(6);
    });

    it("returns 4 when all players have Game 3 scores and only one player has a Game 4 score", () => {
      const tmntResults = createTmntResults();

      // remove Game 4 scores for every player except the first player
      tmntResults.slice(1).forEach((result) => clearGame(result, 4));
      // no players have entered Game 5 or Game 6 scores
      clearGameForAll(tmntResults, 5);
      clearGameForAll(tmntResults, 6);

      expect(getLastGameWithScores(tmntResults)).toBe(4);
    });

    it("returns 6 when only the last player has a Game 6 score", () => {
      const tmntResults = createTmntResults();
      tmntResults
        .slice(0, -1)
        .forEach((result) => clearGame(result, 6));

      expect(getLastGameWithScores(tmntResults)).toBe(6);
    });

    it("treats a score of 0 as a score", () => {
      const tmntResults = createTmntResults();
      clearGameForAll(tmntResults, 6);
      // the only Game 5 score is 0
      clearGameForAll(tmntResults, 5);
      resultAt(tmntResults, 0)["Game 5"] = 0;

      expect(getLastGameWithScores(tmntResults)).toBe(5);
    });

    it("returns 0 when no players have a Game 1 score", () => {
      const tmntResults = createTmntResults();
      clearGameForAll(tmntResults, 1);

      expect(getLastGameWithScores(tmntResults)).toBe(0);
    });

    it("returns 1 when Game 1 is the only game with scores", () => {
      const tmntResults = createTmntResults();
      for (let game = 2; game <= numMockGames; game++) {
        clearGameForAll(tmntResults, game);
      }

      expect(getLastGameWithScores(tmntResults)).toBe(1);
    });

    it("returns 0 when no games have scores", () => {
      const tmntResults = createTmntResults();
      for (let game = 1; game <= numMockGames; game++) {
        clearGameForAll(tmntResults, game);
      }

      expect(getLastGameWithScores(tmntResults)).toBe(0);
    });

    it("returns 0 for an empty tournament results array", () => {
      expect(getLastGameWithScores([])).toBe(0);
    });

    it("returns 0 for null or undefined tournament results", () => {
      expect(getLastGameWithScores(null as unknown as tmntGameResult[])).toBe(0);
      expect(
        getLastGameWithScores(undefined as unknown as tmntGameResult[]),
      ).toBe(0);
    });

    it("treats an undefined score as not bowled", () => {
      const tmntResults = createTmntResults();
      tmntResults.forEach((result) => {
        result["Game 4"] = undefined as unknown as number;
      });

      expect(getLastGameWithScores(tmntResults)).toBe(3);
    });

    it("treats a missing Game N property as not bowled", () => {
      /*
       * The first row still has "Game 4", so calcNumGames counts 6 games,
       * but its score is null and no other row has the property at all.
       */
      const tmntResults = createTmntResults();
      clearGame(resultAt(tmntResults, 0), 4);
      tmntResults.slice(1).forEach((result) => {
        delete result["Game 4"];
      });

      expect(getLastGameWithScores(tmntResults)).toBe(3);
    });

    it("does not change the tournament results", () => {
      const tmntResults = createTmntResults();
      clearGameForAll(tmntResults, 5);
      const before = JSON.parse(JSON.stringify(tmntResults)) as unknown;

      getLastGameWithScores(tmntResults);

      expect(tmntResults).toEqual(before);
    });
  });
});
