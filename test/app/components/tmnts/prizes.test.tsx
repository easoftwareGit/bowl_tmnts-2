import { calcPositions, calcPrizesForDiv } from "@/components/tmnts/prizes";
import type { TmntGameResult } from "@/lib/types/resultsTypes";
import type { gameType } from "@/lib/types/types";
import {
  divId1,
  mockDivPfs,
  mockGames,
  mockTmntFullData,
  playerId1,
  playerId2,
  playerId3,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";

describe("calcPositions", () => {
  /**
   * Creates tournament results from mock tournament data.
   *
   * Results are sorted from highest to lowest by "total + Hdcp",
   * matching the order calcPositions expects.
   */
  const createTmntResults = (
    games: gameType[] = mockGames,
  ): TmntGameResult[] => {
    const tmntResults: TmntGameResult[] =
      mockTmntFullData.players.map((player) => {
        const playerGames = games
          .filter((game) => game.player_id === player.id)
          .sort((a, b) => a.game_num - b.game_num);

        const total = playerGames.reduce(
          (sum, game) => sum + game.score, 0);

        const result: TmntGameResult = {
          player_id: player.id,
          div_id: divId1,
          div_name: "Division 1",
          sort_order: 1,
          tmnt_name: mockTmntFullData.tmnt.tmnt_name,
          start_date: mockTmntFullData.tmnt.start_date_str,
          full_name: `${player.first_name} ${player.last_name}`,
          average: player.average,
          hdcp: 0,
          total,
          "total + Hdcp": total,
        };

        playerGames.forEach((game) => {
          result[`Game ${game.game_num}`] = game.score;
          result[`Game ${game.game_num} + Hdcp`] = game.score;
        });

        return result;
      });

    return tmntResults.sort(
      (a, b) => 
        (b["total + Hdcp"] ?? 0) -
        (a["total + Hdcp"] ?? 0),
    );
  };

  /**
   * Changes game 6 so the player's six-game
   * total equals newTotal.
   */
  const setPlayerTotal = (
    games: gameType[],
    playerId: string,
    newTotal: number,
  ): void => {
    const playerGames = games.filter(
      (game) => game.player_id === playerId);

    const firstFiveTotal = playerGames
      .filter((game) => game.game_num <= 5)
      .reduce((sum, game) => sum + game.score, 0);
    const game6 = playerGames.find((game) => game.game_num === 6);

    if (!game6) {
      throw new Error(`Game 6 not found for player ${playerId}`);
    }

    game6.score = newTotal - firstFiveTotal;
  };

  describe("data guards", () => {
    it("returns an empty array when tournament results are empty", () => {
      expect(calcPositions([])).toEqual([]);
    });
  });

  describe("positions without ties", () => {
    it("returns sequential positions when there are no ties", () => {
      const tmntResults = createTmntResults();

      expect(calcPositions(tmntResults)).toEqual([
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
      ]);
    });
  });

  describe("positions with ties", () => {
    it("returns the same position for a two-way tie for first", () => {
      const games = cloneDeep(mockGames);

      /*
       * Player 8 has the highest original total:
       *
       * player 8 = 1456
       *
       * Change player 1's total to 1456 so
       * players 1 and 8 tie for first.
       *
       * Expected positions:
       *
       * 1, 1, 3, 4, 5, 6, 7, 8
       */
      setPlayerTotal(games, playerId1, 1456);

      const tmntResults = createTmntResults(games);

      expect(calcPositions(tmntResults)).toEqual([
        1,
        1,
        3,
        4,
        5,
        6,
        7,
        8,
      ]);
    });

    it("returns the same position for a three-way tie for first", () => {
      const games = cloneDeep(mockGames);

      /*
       * Player 8 has the highest original total:
       *
       * player 8 = 1456
       *
       * Change players 1 and 2 to 1456 so
       * players 1, 2, and 8 tie for first.
       *
       * The next player finishes fourth.
       *
       * Expected positions:
       *
       * 1, 1, 1, 4, 5, 6, 7, 8
       */
      setPlayerTotal(games, playerId1, 1456);
      setPlayerTotal(games, playerId2, 1456);

      const tmntResults = createTmntResults(games);

      expect(calcPositions(tmntResults)).toEqual([
        1,
        1,
        1,
        4,
        5,
        6,
        7,
        8,
      ]);
    });

    it("returns the same position for a two-way tie for second", () => {
      const games = cloneDeep(mockGames);

      /*
       * Original totals:
       *
       * player 8 = 1456
       * player 5 = 1312
       * player 3 = 1300
       *
       * Change player 3's total to 1312 so
       * players 3 and 5 tie for second.
       *
       * Player 8 remains first.
       *
       * The next player finishes fourth.
       *
       * Expected positions:
       *
       * 1, 2, 2, 4, 5, 6, 7, 8
       */
      setPlayerTotal(games, playerId3, 1312);

      const tmntResults = createTmntResults(games);

      expect(calcPositions(tmntResults)).toEqual([
        1,
        2,
        2,
        4,
        5,
        6,
        7,
        8,
      ]);
    });

    it("returns the same position for a two-way tie for last", () => {
      const games = cloneDeep(mockGames);

      /*
      * Change players 1 and 2 to the same lowest total.
      *
      * They should tie for seventh place.
      *
      * Expected positions:
      *
      * 1, 2, 3, 4, 5, 6, 7, 7
      */
      setPlayerTotal(games, playerId1, 999);
      setPlayerTotal(games, playerId2, 999);

      const tmntResults = createTmntResults(games);

      expect(calcPositions(tmntResults)).toEqual([
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        7,
      ]);
    });
  });

  describe("calcPositions return value length is equal to tmntResults.length", () => {
    it("returns one position for every result when there are no ties", () => {
      const tmntResults = createTmntResults();

      const positions = calcPositions(tmntResults);

      expect(positions).toHaveLength(
        tmntResults.length,
      );
    });

    it("returns one position for every result with a two-way tie for first", () => {
      const games = cloneDeep(mockGames);

      setPlayerTotal(games, playerId1, 1456);

      const tmntResults = createTmntResults(games);
      const positions = calcPositions(tmntResults);

      expect(positions).toHaveLength(
        tmntResults.length,
      );
    });

    it("returns one position for every result with a three-way tie for first", () => {
      const games = cloneDeep(mockGames);

      setPlayerTotal(games, playerId1, 1456);
      setPlayerTotal(games, playerId2, 1456);

      const tmntResults = createTmntResults(games);
      const positions = calcPositions(tmntResults);

      expect(positions).toHaveLength(
        tmntResults.length,
      );
    });

    it("returns one position for every result with a two-way tie for second", () => {
      const games = cloneDeep(mockGames);

      setPlayerTotal(games, playerId3, 1312);

      const tmntResults = createTmntResults(games);
      const positions = calcPositions(tmntResults);

      expect(positions).toHaveLength(
        tmntResults.length,
      );
    });

    it("returns one position for every result with a two-way tie for last", () => {
      const games = cloneDeep(mockGames);

      setPlayerTotal(games, playerId1, 999);
      setPlayerTotal(games, playerId2, 999);

      const tmntResults = createTmntResults(games);
      const positions = calcPositions(tmntResults);

      expect(positions).toHaveLength(
        tmntResults.length,
      );
    });

    it("returns an empty positions array for an empty results array", () => {
      const tmntResults: TmntGameResult[] = [];

      const positions = calcPositions(tmntResults);

      expect(positions).toHaveLength(
        tmntResults.length,
      );
    });
  });
});

describe("calcPrizesForDiv", () => {
  /**
   * Creates tournament results from the mock tournament players and games.
   *
   * The returned array is sorted the same way as the database query:
   * "total + Hdcp", highest to lowest.
   *
   * Division 1 is the scratch division, so handicap is 0.
   */
  const createTmntResults = (
    games: gameType[] = mockGames,
  ): TmntGameResult[] => {
    return mockTmntFullData.players
      .map((player): TmntGameResult => {
        const playerGames = games
          .filter(
            (game) =>
              game.player_id === player.id,
          )
          .sort(
            (a, b) =>
              a.game_num - b.game_num,
          );

        const total = playerGames.reduce(
          (sum, game) => sum + game.score,
          0,
        );

        const result: TmntGameResult = {
          player_id: player.id,
          div_id: divId1,
          div_name: "Scratch",
          sort_order: 1,
          tmnt_name:
            mockTmntFullData.tmnt.tmnt_name,
          start_date:
            mockTmntFullData.tmnt.start_date_str,
          full_name: `${player.first_name} ${player.last_name}`,
          average: player.average,
          hdcp: 0,
          total,
          "total + Hdcp": total,
        };

        playerGames.forEach((game) => {
          result[`Game ${game.game_num}`] =
            game.score;

          result[
            `Game ${game.game_num} + Hdcp`
          ] = game.score;
        });

        return result;
      })
      .sort(
        (a, b) =>
          (b["total + Hdcp"] ?? 0) -
          (a["total + Hdcp"] ?? 0),
      );
  };

  /**
   * Changes one game so the player's six-game total
   * equals the requested total.
   *
   * Using game 6 keeps the rest of the mock game data unchanged.
   */
  const setPlayerTotal = (
    games: gameType[],
    playerId: string,
    newTotal: number,
  ): void => {
    const playerGames = games.filter(
      (game) => game.player_id === playerId,
    );

    const game6 = playerGames.find(
      (game) => game.game_num === 6,
    );

    if (!game6) {
      throw new Error(
        `Game 6 not found for player ${playerId}`,
      );
    }

    const firstFiveTotal = playerGames
      .filter((game) => game.game_num !== 6)
      .reduce(
        (sum, game) => sum + game.score,
        0,
      );

    game6.score = newTotal - firstFiveTotal;
  };

  describe("data guards", () => {
    it("returns an empty array when tournament results are empty", () => {
      expect(calcPrizesForDiv([], mockDivPfs)).toEqual([]);
    });

    it("returns an empty array when division prize fund is empty", () => {
      const tmntResults = createTmntResults();

      expect(calcPrizesForDiv(tmntResults, [])).toEqual([]);
    });
  });

  describe("no ties", () => {
    it("awards first and second place prizes", () => {
      const tmntResults = createTmntResults();

      /*
       * Original mock totals:
       *
       * player 8 = 1456 - first
       * player 5 = 1312 - second
       *
       * Prize fund:
       *
       * first  = $212
       * second = $120
       */

      expect(
        calcPrizesForDiv(
          tmntResults,
          mockDivPfs,
        ),
      ).toEqual([
        "$212.00",
        "$120.00",
      ]);
    });
  });

  describe("ties for first", () => {
    it("splits first and second place money for a two-way tie for first", () => {
      const games = cloneDeep(mockGames);

      /*
       * player 8 originally has the highest
       * six-game total of 1456.
       *
       * Change player 5's total to 1456,
       * producing a two-way tie for first.
       *
       * $212 + $120 = $332
       * $332 / 2 = $166
       */
      setPlayerTotal(games, playerId1, 1456);

      const tmntResults = createTmntResults(games);

      expect(tmntResults[0]["total + Hdcp"]).toBe(1456);
      expect(tmntResults[1]["total + Hdcp"]).toBe(1456);
      expect(
        calcPrizesForDiv(
          tmntResults,
          mockDivPfs,
        ),
      ).toEqual([
        "$166.00",
        "$166.00",
      ]);
    });

    it("splits available prize money for a three-way tie for first", () => {
      const games = cloneDeep(mockGames);

      /*
       * Make three players finish with 1456.
       *
       * Only two positions are paid:
       *
       * $212 + $120 = $332
       * $332 / 3 = $110.666...
       *
       * Currency formatting produces $110.67.
       */
      setPlayerTotal(games, playerId1, 1456);
      setPlayerTotal(games, playerId2, 1456);

      const tmntResults = createTmntResults(games);
      
      expect(
        tmntResults
          .slice(0, 3)
          .every(
            (result) =>
              result["total + Hdcp"] ===
              1456,
          ),
      ).toBe(true);

      expect(
        calcPrizesForDiv(
          tmntResults,
          mockDivPfs,
        ),
      ).toEqual([
        "$110.66",
        "$110.66",
        "$110.66",
      ]);
    });
  });

  describe("ties for second", () => {
    it("awards first place normally and splits second place for a two-way tie", () => {
      const games = cloneDeep(mockGames);

      /*
       * player 8 remains first with 1456.
       *
       * player 5 originally has the second
       * highest total of 1312.
       *
       * Change player 3's total to 1312,
       * producing a two-way tie for second.
       *
       * First:
       * $212
       *
       * Second:
       * $120 / 2 = $60
       */
      setPlayerTotal(games, playerId3, 1312);

      const tmntResults = createTmntResults(games);

      expect(tmntResults[0]["total + Hdcp"]).toBe(1456);
      expect(tmntResults[1]["total + Hdcp"]).toBe(1312);
      expect(tmntResults[2]["total + Hdcp"]).toBe(1312);

      expect(
        calcPrizesForDiv(
          tmntResults,
          mockDivPfs,
        ),
      ).toEqual([
        "$212.00",
        "$60.00",
        "$60.00",
      ]);
    });
  });

  describe("ties before last game", () => {
    it("does not split prizes when no players have a score for the last game", () => {
      const games = cloneDeep(mockGames);

      /*
      * Create a two-way tie for first after all six games
      * have initially been used to build the results.
      */
      setPlayerTotal(games, playerId1, 1456);

      const tmntResults = createTmntResults(games);

      /*
      * Remove all Game 6 scores from the tournament results.
      *
      * Keep the Game 6 properties so calcNumGames still
      * recognizes this as a six-game tournament.
      */
      tmntResults.forEach((result) => {
        result["Game 6"] = null as unknown as number;
        result["Game 6 + Hdcp"] = null as unknown as number;
      });

      expect(
        calcPrizesForDiv(
          tmntResults,
          mockDivPfs,
        ),
      ).toEqual([
        "$212.00",
        "$120.00",
      ]);
    });

    it("calculates ties when only one player has a score for the last game", () => {
      const games = cloneDeep(mockGames);

      /*
      * Create a two-way tie for first.
      *
      * player 8 already has a total of 1456.
      * Change player 1's total to 1456.
      */
      setPlayerTotal(games, playerId1, 1456);

      const tmntResults = createTmntResults(games);

      /*
      * Remove Game 6 scores for every player except one.
      *
      * A single Game 6 score means Game 6 has started,
      * so ties should now be calculated.
      */
      const playerWithGame6Score = tmntResults[0].player_id;

      tmntResults.forEach((result) => {
        if (result.player_id !== playerWithGame6Score) {
          result["Game 6"] =
            null as unknown as number;

          result["Game 6 + Hdcp"] =
            null as unknown as number;
        }
      });

      expect(
        calcPrizesForDiv(
          tmntResults,
          mockDivPfs,
        ),
      ).toEqual([
        "$166.00",
        "$166.00",
      ]);
    });

    it("does not calculate ties when the last game with a score is Game 4", () => {
      const games = cloneDeep(mockGames);

      setPlayerTotal(games, playerId1, 1456);

      const tmntResults = createTmntResults(games);

      /*
      * No scores have been entered for Games 5 or 6.
      *
      * The tournament still has six games, but the last
      * game having at least one score is Game 4.
      */
      tmntResults.forEach((result) => {
        result["Game 5"] = null as unknown as number;
        result["Game 5 + Hdcp"] = null as unknown as number;
        result["Game 6"] = null as unknown as number;
        result["Game 6 + Hdcp"] = null as unknown as number;
      });

      expect(
        calcPrizesForDiv(
          tmntResults,
          mockDivPfs,
        ),
      ).toEqual([
        "$212.00",
        "$120.00",
      ]);
    });    
  });  
});