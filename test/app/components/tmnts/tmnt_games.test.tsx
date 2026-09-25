import {
  calcNumGames,
  getGameNums,
  getLastGameWithScores,
} from "@/components/tmnts/games";
import { tmntGameResult } from "@/lib/types/resultsTypes";
import {
  mockGames,
  mockTmntFullData,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";

/**
 * Creates tournament game results from the tournament mock data.
 *
 * Each player gets one TmntGameResult containing Game 1 through Game 6.
 */
const createTmntResults = (): tmntGameResult[] => {
  const div = mockTmntFullData.divs[0];

  return mockTmntFullData.players.map((player) => {
    const divEntry = mockTmntFullData.divEntries.find(
      (entry) => entry.player_id === player.id,
    );

    if (!divEntry) {
      throw new Error(`Division entry not found for player ${player.id}`);
    }

    const playerGames = mockGames.filter(
      (game) => game.player_id === player.id,
    );

    const gameScores = Object.fromEntries(
      playerGames.map((game) => [
        `Game ${game.game_num}`,
        game.score,
      ]),
    );

    const total = playerGames.reduce(
      (sum, game) => sum + game.score,
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
      average: player.average,
      hdcp: 0,
      total,
      ...gameScores,
    } as tmntGameResult;
  });
};

describe("games", () => {
  describe("calcNumGames", () => {
    it("returns 0 for an empty tournament results array", () => {
      expect(calcNumGames([])).toBe(0);
    });

    it("returns 6 when the tournament has 6 games", () => {
      const tmntResults = createTmntResults();

      expect(calcNumGames(tmntResults)).toBe(6);
    });

    it("only counts Game N properties", () => {
      const tmntResults = createTmntResults();

      /*
       * TmntGameResult also contains properties such as:
       *
       * player_id
       * total
       * hdcp
       *
       * calcNumGames should only count properties matching
       * "Game <number>".
       */
      expect(calcNumGames(tmntResults)).toBe(6);
    });

    it("does not count Game N + Hdcp properties", () => {
      const tmntResults = createTmntResults();
      tmntResults[0]["Game 1 + Hdcp"] = tmntResults[0]["Game 1"];
      tmntResults[0]["Game 2 + Hdcp"] = tmntResults[0]["Game 2"];

      expect(calcNumGames(tmntResults)).toBe(6);
    });
  });

  describe("getGameNums", () => {
    it("returns an empty array for an empty tournament results array", () => {
      expect(getGameNums([])).toEqual([]);
    });

    it("returns game numbers 1 through 6 for a six-game tournament", () => {
      const tmntResults = createTmntResults();

      expect(getGameNums(tmntResults)).toEqual([
        1,
        2,
        3,
        4,
        5,
        6,
      ]);
    });

    it("returns one game number for each game in the tournament results", () => {
      const tmntResults = createTmntResults();

      const gameNums = getGameNums(tmntResults);

      expect(gameNums).toHaveLength(calcNumGames(tmntResults));
    });

    it("does not include Game N + Hdcp properties", () => {
      const tmntResults = cloneDeep(createTmntResults());

      tmntResults[0]["Game 1 + Hdcp"] = tmntResults[0]["Game 1"];
      tmntResults[0]["Game 2 + Hdcp"] = tmntResults[0]["Game 2"];

      expect(getGameNums(tmntResults)).toEqual([
        1,
        2,
        3,
        4,
        5,
        6,
      ]);
    });
  });

  describe("getLastGameWithScores", () => {
    it("returns 6 when all 6 games have scores", () => {
      const tmntResults = createTmntResults();

      expect(getLastGameWithScores(tmntResults)).toBe(6);
    });

    it("returns 3 when no players have a Game 4 score", () => {
      const tmntResults = cloneDeep(createTmntResults());

      tmntResults.forEach((result) => {
        result["Game 4"] = null as unknown as number;
      });

      expect(getLastGameWithScores(tmntResults)).toBe(3);
    });

    it("returns 1 when no players have a Game 2 score", () => {
      const tmntResults = cloneDeep(createTmntResults());

      tmntResults.forEach((result) => {
        result["Game 2"] = null as unknown as number;
      });

      expect(getLastGameWithScores(tmntResults)).toBe(1);
    });

    it("continues when only some players are missing a game score", () => {
      const tmntResults = cloneDeep(createTmntResults());

      /*
       * One player has not entered Game 4 yet.
       *
       * The current implementation considers Game 4 to have
       * scores as long as at least one player has a score.
       */
      tmntResults[0]["Game 4"] = null as unknown as number;

      expect(getLastGameWithScores(tmntResults)).toBe(6);
    });

    it("stops at the first game having no scores", () => {
      const tmntResults = cloneDeep(createTmntResults());

      /*
       * Remove all Game 4 scores.
       *
       * Game 5 and Game 6 still contain scores, but the function
       * should stop when it reaches Game 4.
       */
      tmntResults.forEach((result) => {
        result["Game 4"] = null as unknown as number;
      });

      expect(getLastGameWithScores(tmntResults)).toBe(3);
    });

    it("returns 4 when all players have Game 3 scores and only one player has a Game 4 score", () => {
      const tmntResults = cloneDeep(createTmntResults());

      /*
      * Remove Game 4 scores for every player except the first player.
      */
      for (let i = 1; i < tmntResults.length; i++) {
        tmntResults[i]["Game 4"] = null as unknown as number;
      }

      /*
      * No players have entered Game 5 or Game 6 scores.
      */
      tmntResults.forEach((result) => {
        result["Game 5"] = null as unknown as number;
        result["Game 6"] = null as unknown as number;
      });

      expect(getLastGameWithScores(tmntResults)).toBe(4);
    });    
  });
});