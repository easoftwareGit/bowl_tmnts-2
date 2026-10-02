import { populateStandingsRows } from "@/app/results/tmnt/[tmntId]/standings/populateStandingsRows";
import type { tmntGameResult } from "@/lib/types/resultsTypes";
import {
  tgrGameKey,
  tgrHdcpKey,
  totalPlusHdcpSqlName,
} from "@/lib/types/resultsTypes";
import type { gameType } from "@/lib/types/types";
import {
  divId1,
  mockDivPfs,
  mockGames,
  mockTmntFullData,
  playerId1,
  playerId2,
  playerId3,
  playerId5,
  playerId7,
  playerId8,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";

describe("populateResultRows", () => {
  /**
   * Creates tournament results from the mock tournament data.
   *
   * Results are sorted from highest to lowest by "total + Hdcp",
   * matching the order populateResultRows expects.
   */
  const createTmntResults = (
    games: gameType[] = mockGames,
  ): tmntGameResult[] => {
    const tmntResults: tmntGameResult[] =
      mockTmntFullData.players.map((player) => {
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
          (sum, game) =>
            sum + game.score,
          0,
        );

        const result: tmntGameResult = {
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
          total_hdcp: 0,
          [totalPlusHdcpSqlName]: total,
        };

        playerGames.forEach((game) => {
          result[tgrGameKey(game.game_num)] = game.score;
          result[tgrHdcpKey(game.game_num)] = game.score;
        });

        return result;
      });

    return tmntResults.sort(
      (a, b) =>
        (b[totalPlusHdcpSqlName] ?? 0) -
        (a[totalPlusHdcpSqlName] ?? 0),
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
    const playerGames = games.filter((game) => game.player_id === playerId);

    const firstFiveTotal = playerGames
      .filter((game) => game.game_num <= 5)
      .reduce((sum, game) => sum + game.score, 0);

    const game6 = playerGames.find((game) => game.game_num === 6);

    if (!game6) {
      throw new Error(
        `Game 6 not found for player ${playerId}`,
      );
    }

    game6.score = newTotal - firstFiveTotal;
  };

  describe("data guards", () => {
    it("returns an empty array when tournament results are empty", () => {
      expect(
        populateStandingsRows(
          [],
          mockDivPfs,
        ),
      ).toEqual([]);
    });
  });

  describe("row population", () => {
    it("populates a result row from tournament results", () => {
      const tmntResults = createTmntResults();
      const rows = populateStandingsRows(tmntResults, mockDivPfs);

      /*
       * Player 8 has the highest total in mockGames:
       *
       * 230 + 231 + 232 + 263 + 261 + 239
       * = 1456
       */
      const row = rows[0];

      expect(row.id).toBe(playerId8);
      expect(row.player_id).toBe(playerId8);
      expect(row.position).toBe(1);
      expect(row.total).toBe(1456);
      expect(row.total_hdcp).toBe(0);
      expect(row.total_plus_total_hdcp).toBe(1456);
      expect(row.prize).toBe("$212.00");
    });

    it("copies all game scores into the result row", () => {
      const tmntResults = createTmntResults();
      const rows = populateStandingsRows(tmntResults, mockDivPfs);
      const row = rows.find((row) => row.player_id === playerId8);

      expect(row).toBeDefined();

      expect(row?.["Game 1"]).toBe(230);
      expect(row?.["Game 2"]).toBe(231);
      expect(row?.["Game 3"]).toBe(232);
      expect(row?.["Game 4"]).toBe(263);
      expect(row?.["Game 5"]).toBe(261);
      expect(row?.["Game 6"]).toBe(239);

      expect(row?.["Game 1 + Hdcp"]).toBe(230);
      expect(row?.["Game 6 + Hdcp"]).toBe(239);
    });

    it("calculates a positive plus-minus value", () => {
      const tmntResults = createTmntResults();
      const rows = populateStandingsRows(tmntResults, mockDivPfs);
      const row = rows.find((row) => row.player_id === playerId8);

      /*
       * Player 8 total = 1456.
       *
       * Six games at 200 = 1200.
       *
       * 1456 - 1200 = +256.
       */
      expect(row?.plus_minus).toBe("+256");
    });

    it("calculates a negative plus-minus value", () => {
      const tmntResults = createTmntResults();
      const rows = populateStandingsRows(tmntResults, mockDivPfs);

      /*
       * Player 7 total = 1193.
       *
       * Six games at 200 = 1200.
       *
       * 1193 - 1200 = -7.
       */
      const row = rows.find((row) => row.total === 1193);

      expect(row?.plus_minus).toBe("-7");
    });

    it("calculates a 0 or even plus-minus value", () => {
      const games = cloneDeep(mockGames);
      setPlayerTotal(games, playerId7, 1200);
      const tmntResults = createTmntResults(games);
      const rows = populateStandingsRows(tmntResults, mockDivPfs);

      /*
       * Player 7 total = 1200.
       *
       * Six games at 200 = 1200.
       *
       * 1200 - 1200 = 0.
       */
      const row = rows.find((row) => row.total === 1200);

      expect(row?.plus_minus).toBe("0");
    });    
  });

  describe("positions and prizes", () => {
    it("populates positions and prizes when there are no ties", () => {
      const tmntResults = createTmntResults();

      const rows = populateStandingsRows(tmntResults, mockDivPfs);

      expect(rows.map((row) => row.position)).toEqual([
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
      ]);

      expect(rows[0].player_id).toBe(playerId8);
      expect(rows[0].prize).toBe("$212.00");
      expect(rows[1].player_id).toBe(playerId5);
      expect(rows[1].prize).toBe("$120.00");
    });

    it("populates positions and prizes for a two-way tie for first", () => {
      const games = cloneDeep(mockGames);

      /*
       * Player 8 originally has the highest
       * total of 1456.
       *
       * Change player 1 to 1456 so players
       * 1 and 8 tie for first.
       *
       * Positions:
       *
       * 1, 1, 3, 4, 5, 6, 7, 8
       *
       * Prize money:
       *
       * ($212 + $120) / 2 = $166 each.
       */
      setPlayerTotal(games, playerId1, 1456);
      const tmntResults = createTmntResults(games);
      const rows = populateStandingsRows(tmntResults, mockDivPfs);

      expect(rows.map((row) => row.position)).toEqual([
        1,
        1,
        3,
        4,
        5,
        6,
        7,
        8,
      ]);

      expect(rows[0].prize).toBe("$166.00");
      expect(rows[1].prize).toBe("$166.00");
    });

    it("populates positions and prizes for a three-way tie for first", () => {
      const games = cloneDeep(mockGames);

      /*
       * Change players 1 and 2 to 1456 so
       * they tie with player 8 for first.
       *
       * Positions:
       *
       * 1, 1, 1, 4, 5, 6, 7, 8
       *
       * Prize money:
       *
       * ($212 + $120) / 3 = $110.67 each.
       */
      setPlayerTotal(games, playerId1, 1456);
      setPlayerTotal(games, playerId2, 1456);
      const tmntResults = createTmntResults(games);
      const rows = populateStandingsRows(tmntResults, mockDivPfs);

      expect(rows.map((row) => row.position)).toEqual([
        1,
        1,
        1,
        4,
        5,
        6,
        7,
        8,
      ]);

      expect(rows[0].prize).toBe("$110.66");
      expect(rows[1].prize).toBe("$110.66");
      expect(rows[2].prize).toBe("$110.66");  
    });

    it("populates positions and prizes for a two-way tie for second", () => {
      const games = cloneDeep(mockGames);

      /*
       * Player 8 remains first with 1456.
       *
       * Player 5 has 1312.
       * Change player 3 to 1312 so players
       * 3 and 5 tie for second.
       *
       * Positions:
       *
       * 1, 2, 2, 4, 5, 6, 7, 8
       *
       * First prize = $212.
       * Second prize is split:
       *
       * $120 / 2 = $60 each.
       */
      setPlayerTotal(games, playerId3, 1312, );
      const tmntResults = createTmntResults(games);
      const rows = populateStandingsRows(tmntResults, mockDivPfs);

      expect(rows.map((row) => row.position)).toEqual([
        1,
        2,
        2,
        4,
        5,
        6,
        7,
        8,
      ]);

      expect(rows[0].prize).toBe("$212.00");
      expect(rows[1].prize).toBe("$60.00");
      expect(rows[2].prize).toBe("$60.00");
    });

    it("does not split prizes for a tie before the last game has scores", () => {
      const games = cloneDeep(mockGames);

      /*
      * Create a two-way tie for first.
      *
      * Player 8 originally has the highest total of 1456.
      * Change player 1 to 1456 so players 1 and 8
      * tie for first.
      */
      setPlayerTotal(games, playerId1, 1456);

      const tmntResults = createTmntResults(games);

      /*
      * Remove all Game 6 scores.
      *
      * Keep the Game 6 properties so calcNumGames()
      * still recognizes this as a six-game tournament.
      *
      * Because Game 6 has not started, prize money
      * should not be split for ties.
      */
      tmntResults.forEach((result) => {
        result["Game 6"] = null as unknown as number;
        result["Game 6 + Hdcp"] = null as unknown as number;
      });

      const rows = populateStandingsRows(tmntResults, mockDivPfs);

      /*
      * Positions still reflect the tie.
      */
      expect(rows.map((row) => row.position)).toEqual([
        1,
        1,
        3,
        4,
        5,
        6,
        7,
        8,
      ]);

      /*
      * Game 6 has not started, so prize money
      * is not split for the tie.
      */
      expect(rows[0].prize).toBe("$212.00");
      expect(rows[1].prize).toBe("$120.00");
    });    

    it("splits prizes for a tie when one player has a score for the last game", () => {
      const games = cloneDeep(mockGames);

      /*
      * Create a two-way tie for first.
      *
      * Player 8 originally has the highest total of 1456.
      * Change player 1 to 1456 so players 1 and 8
      * tie for first.
      */
      setPlayerTotal(games, playerId1, 1456);

      const tmntResults = createTmntResults(games);

      /*
      * Remove Game 6 scores for every player except
      * the first player in the results.
      *
      * One Game 6 score means the last game has started,
      * so prize money should now be split for ties.
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

      const rows = populateStandingsRows(tmntResults, mockDivPfs);

      expect(rows.map((row) => row.position)).toEqual([
        1,
        1,
        3,
        4,
        5,
        6,
        7,
        8,
      ]);

      /*
      * Game 6 has started, so first and second
      * place prize money is split between the
      * two tied players.
      *
      * ($212 + $120) / 2 = $166 each.
      */
      expect(rows[0].prize).toBe("$166.00");
      expect(rows[1].prize).toBe("$166.00");
    });    
  });
});