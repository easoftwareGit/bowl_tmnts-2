import { Bracket } from "@/components/brackets/bracketClass";
import { BracketList, brktListInitialDataType } from "@/components/brackets/bracketListClass";
import {
  brktId1,
  byeId,
  divId1,
  mockGames,
  mockTmntFullData,
  playerId1,
  playerId2,
  playerId3,
  playerId4,
  playerId5,
  playerId6,
  playerId7,
  playerId8,
  squadId1,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import type { gameType, playerType } from "@/lib/types/types";
import { BracketMatch } from "@/components/brackets/bracketMatchClass";
import { initPlayer } from "@/lib/db/initVals";
import { cloneDeep } from "lodash";

describe("Bracket.updateMatches", () => {

  let brktList: BracketList;
  let bracket: Bracket;
  let bracketMatch: BracketMatch | undefined;    

  const byePlayer: playerType = {
    ...initPlayer,
    id: byeId,
    squad_id: squadId1,
    first_name: 'Bye',
    average: 0,
  }

  const initData: brktListInitialDataType = {        
    tmntFullData: mockTmntFullData,
    divId: divId1,
  };

  const setup = (
    testGames: gameType[],
    squadGameNums: number[] = [1, 2, 3],    
  ): void => {
    brktList = new BracketList(
      brktId1,
      2,
      3,
      squadGameNums,
      byePlayer,
      initData,
    );

    brktList.createGameScoresMap(testGames);

    bracket = brktList.brackets[0];
    bracketMatch = bracket.match;
  };
    
  /**
   * Creates game data containing only the requested bracket games.
   */
  const squadGamesThrough = (lastGame: number): gameType[] => {
    return mockGames.filter((game) => game.game_num <= lastGame);
  };

  const setGameScore = (
    games: typeof mockGames,
    playerId: string,
    squadGameNum: number,
    score: number,
  ): void => {
    const game = games.find(
      (game) =>
        game.player_id === playerId &&
        game.game_num === squadGameNum,
    );

    if (game === undefined) {
      throw new Error(
        `Game ${squadGameNum} not found for player ${playerId}.`,
      );
    }

    game.score = score;
  };

  /**
   * Creates game data using different squad game numbers.
   *
   * For example, an offset of 3 changes:
   *
   *   squad game 1 -> squad game 4
   *   squad game 2 -> squad game 5
   *   squad game 3 -> squad game 6
   *
   * Player scores remain unchanged.
   */
  const shiftSquadGameNums = (
    games: gameType[],
    offset: number,
  ): gameType[] => {
    return games.map((game) => ({
      ...game,
      game_num:
        game.game_num + offset,
    }));
  };

  describe('updateMatches - no ties', () => {

    it("calculates results when only game 1 is complete", () => {
      setup(squadGamesThrough(1));

      bracket.updateMatches();

      expect(
        bracket.loserBrktGame1Ids,
      ).toEqual(
        new Set([
          playerId1,
          playerId3,
          playerId5,
          playerId7,
        ]),
      );

      expect(bracket.loserBrktGame2Ids).toEqual(new Set());
      expect(bracket.runnerUpIds).toEqual(new Set());
      expect(bracket.winnerIds).toEqual(new Set());
      expect(bracket.semiFinalTies).toEqual(new Set());
    });

    it("calculates results when games 1 and 2 are complete", () => {
      setup(squadGamesThrough(2));

      bracket.updateMatches();

      expect(
        bracket.loserBrktGame1Ids,
      ).toEqual(
        new Set([
          playerId1,
          playerId3,
          playerId5,
          playerId7,
        ]),
      );

      expect(
        bracket.loserBrktGame2Ids,
      ).toEqual(
        new Set([
          playerId4,
          playerId6,
        ]),
      );

      expect(bracket.runnerUpIds).toEqual(new Set());
      expect(bracket.winnerIds).toEqual(new Set());
      expect(bracket.semiFinalTies).toEqual(new Set());
    });

    it("calculates the bracket after all three games are complete", () => {
      setup(squadGamesThrough(3));

      bracket.updateMatches();

      /*
      * Game 1:
      *
      * 1 vs 2 -> 2
      * 3 vs 4 -> 4
      * 5 vs 6 -> 6
      * 7 vs 8 -> 8
      *
      * Game 2:
      *
      * 2 vs 4 -> 2
      * 6 vs 8 -> 8
      *
      * Game 3:
      *
      * 2 vs 8 -> 8
      */

      expect(
        bracket.loserBrktGame1Ids,
      ).toEqual(
        new Set([
          playerId1,
          playerId3,
          playerId5,
          playerId7,
        ]),
      );

      expect(
        bracket.loserBrktGame2Ids,
      ).toEqual(
        new Set([
          playerId4,
          playerId6,
        ]),
      );

      expect(bracket.runnerUpIds).toEqual(new Set([playerId2]));
      expect(bracket.winnerIds).toEqual(new Set([playerId8]));
      expect(bracket.semiFinalTies).toEqual(new Set());
    });

    it("calculates results when bracket games use squad games 4, 5, and 6", () => {
      /*
      * The bracket still has three bracket games:
      *
      * bracket game 1 -> squad game 4
      * bracket game 2 -> squad game 5
      * bracket game 3 -> squad game 6
      *
      * The scores are the same as the normal
      * 1, 2, 3 test, so the bracket results
      * should also be the same.
      */
      const testGames = shiftSquadGameNums(squadGamesThrough(3), 3);
      setup(testGames, [4, 5, 6]);

      bracket.updateMatches();

      expect(
        bracket.loserBrktGame1Ids,
      ).toEqual(
        new Set([
          playerId1,
          playerId3,
          playerId5,
          playerId7,
        ]),
      );

      expect(
        bracket.loserBrktGame2Ids,
      ).toEqual(
        new Set([
          playerId4,
          playerId6,
        ]),
      );

      expect(bracket.runnerUpIds).toEqual(new Set([playerId2]));
      expect(bracket.winnerIds).toEqual(new Set([playerId8]));
      expect(bracket.semiFinalTies).toEqual(new Set());
    });

    it("calculates results using odd squad games 1, 3, and 5", () => {
      setup(mockGames, [1, 3, 5]);

      bracket.updateMatches();

      expect(bracket.loserBrktGame1Ids).toEqual(
        new Set([playerId1, playerId3, playerId5, playerId7]),
      );
      expect(bracket.loserBrktGame2Ids).toEqual(
        new Set([playerId4, playerId6]),
      );
      expect(bracket.runnerUpIds).toEqual(new Set([playerId2]));
      expect(bracket.winnerIds).toEqual(new Set([playerId8]));
      expect(bracket.semiFinalTies).toEqual(new Set());
    });

    it("calculates results using even squad games 2, 4, and 6", () => {
      setup(mockGames, [2, 4, 6]);

      bracket.updateMatches();

      expect(bracket.loserBrktGame1Ids).toEqual(
        new Set([playerId1, playerId3, playerId6, playerId7]),
      );
      expect(bracket.loserBrktGame2Ids).toEqual(
        new Set([playerId4, playerId5]),
      );
      expect(bracket.runnerUpIds).toEqual(new Set([playerId2]));
      expect(bracket.winnerIds).toEqual(new Set([playerId8]));
      expect(bracket.semiFinalTies).toEqual(new Set());
    });

    it("calculates results using reverse squad games 3, 2, and 1", () => {
      setup(mockGames, [3, 2, 1]);

      bracket.updateMatches();

      expect(bracket.loserBrktGame1Ids).toEqual(
        new Set([playerId1, playerId3, playerId6, playerId7]),
      );
      expect(bracket.loserBrktGame2Ids).toEqual(
        new Set([playerId4, playerId5]),
      );
      expect(bracket.runnerUpIds).toEqual(new Set([playerId2]));
      expect(bracket.winnerIds).toEqual(new Set([playerId8]));
      expect(bracket.semiFinalTies).toEqual(new Set());
    });

    it("calculates results using reverse squad games 6, 5, and 4", () => {
      setup(mockGames, [6, 5, 4]);

      bracket.updateMatches();

      expect(bracket.loserBrktGame1Ids).toEqual(
        new Set([playerId1, playerId4, playerId6, playerId7]),
      );
      expect(bracket.loserBrktGame2Ids).toEqual(
        new Set([playerId2, playerId5]),
      );
      expect(bracket.runnerUpIds).toEqual(new Set([playerId8]));
      expect(bracket.winnerIds).toEqual(new Set([playerId3]),
      );
      expect(bracket.semiFinalTies).toEqual(new Set());
    });

  });

  describe('updateMatches - ties', () => {
    let tiesBrktList: BracketList;
    let tiesBracket: Bracket;    

    const createTiesBrktList = (
      testGames: typeof mockGames,
      squadGameNums: number[] = [1, 2, 3],
    ): void => {
      const tiesInitData:
        brktListInitialDataType = {
          tmntFullData: mockTmntFullData,
          divId: divId1,
        };

      tiesBrktList =
        new BracketList(
          brktId1,
          2, // two players per match
          3, // three bracket games
          squadGameNums,
          undefined, // no bye player
          tiesInitData,
        );

      tiesBrktList.createGameScoresMap(testGames);
      tiesBracket =tiesBrktList.brackets[0];
    };

    it("advances both players when game 1 is tied", () => {
      const tieGames = cloneDeep(squadGamesThrough(1));

      // Tie first-round matches 0.
      setGameScore(tieGames, playerId1, 1, 210);
      setGameScore(tieGames, playerId2, 1, 210);
      createTiesBrktList(tieGames);

      tiesBracket.updateMatches();

      /*
       * Both player 1 and player 2 should advance from
       * their first-round match.
       *
       * Neither player should be recorded as a game-1 loser.
       */
      expect(tiesBracket.loserBrktGame1Ids.has(playerId1)).toBe(false);
      expect(tiesBracket.loserBrktGame1Ids.has(playerId2)).toBe(false);
      expect(tiesBracket.loserBrktGame1Ids.size).toBe(3);
      expect(tiesBracket.loserBrktGame2Ids).toEqual(new Set());            
    });

    it("records all players in a tied semifinal", () => {  
      /*
       * Normal first-round winners on this side are:
       *
       * player 2
       * player 4
       *
       * Give them equal game-2 scores.
       */
      const tieGames = cloneDeep(squadGamesThrough(2));

      // Tie second-round match 4.
      setGameScore(tieGames, playerId2, 2, 216);
      setGameScore(tieGames, playerId4, 2, 216);
      createTiesBrktList(tieGames);

      tiesBracket.updateMatches();

      expect(tiesBracket.semiFinalTies).toEqual(
        new Set([
          playerId2,
          playerId4,
        ]),
      );

      /*
       * Neither tied semifinalist has lost.
       */
      expect(tiesBracket.loserBrktGame2Ids.has(playerId2)).toBe(false);
      expect(tiesBracket.loserBrktGame2Ids.has(playerId4)).toBe(false);
      expect(tiesBracket.loserBrktGame1Ids.has(playerId2)).toBe(false);
      expect(tiesBracket.loserBrktGame1Ids.has(playerId4)).toBe(false);    
    });
    
    it("records multiple winners when the final is tied", () => {
      /*
       * With the normal scores the finalists are:
       *
       * player 2
       * player 8
       *
       * Give both players the same game-3 score.
       */
      const tieGames = cloneDeep(squadGamesThrough(3));

      // Tie second-round match 6.
      setGameScore(tieGames, playerId2, 3, 226);
      setGameScore(tieGames, playerId8, 3, 226);
      createTiesBrktList(tieGames);

      tiesBracket.updateMatches();

      expect(
        tiesBracket.loserBrktGame1Ids,
      ).toEqual(
        new Set([
          playerId1,
          playerId3,
          playerId5,
          playerId7,
        ]),
      );

      expect(
        tiesBracket.loserBrktGame2Ids,
      ).toEqual(
        new Set([
          playerId4,
          playerId6,
        ]),
      );
      
      expect(tiesBracket.winnerIds).toEqual(
        new Set([
          playerId2,
          playerId8,
        ]),
      );

      expect(tiesBracket.runnerUpIds).toEqual(new Set());
      expect(tiesBracket.semiFinalTies).toEqual(new Set());

      /*
       * Neither tied semifinalist has lost.
       */
      expect(tiesBracket.loserBrktGame1Ids.has(playerId2)).toBe(false);
      expect(tiesBracket.loserBrktGame2Ids.has(playerId2)).toBe(false);
      expect(tiesBracket.loserBrktGame1Ids.has(playerId8)).toBe(false);
      expect(tiesBracket.loserBrktGame2Ids.has(playerId8)).toBe(false);
    });

    type FinalTieCase = {
      name: string;
      tieBothSemifinals: boolean;
      finalScores: [number, number, number, number]; // players 2, 4, 6, 8
      game2Losers: string[];
      winners: string[];
      runnersUp: string[];
      semifinalTies: string[];
    };

    const finalTieCases: FinalTieCase[] = [
      {
        name: "records three winners when all finalists tie",
        tieBothSemifinals: false,
        finalScores: [230, 230, 0, 230],
        game2Losers: [playerId6],
        winners: [playerId2, playerId4, playerId8],
        runnersUp: [],
        semifinalTies: [playerId2, playerId4],
      },
      {
        name: "makes the non-tied semifinalist the winner",
        tieBothSemifinals: false,
        finalScores: [220, 230, 0, 240],
        game2Losers: [playerId2, playerId6],
        winners: [playerId8],
        runnersUp: [playerId4],
        semifinalTies: [playerId2, playerId4],
      },
      {
        name: "makes one tied semifinalist the winner",
        tieBothSemifinals: false,
        finalScores: [240, 220, 0, 230],
        game2Losers: [playerId4, playerId6],
        winners: [playerId2],
        runnersUp: [playerId8],
        semifinalTies: [playerId2, playerId4],
      },
      {
        name: "makes both tied semifinalists winners when they tie for the high final score",
        tieBothSemifinals: false,
        finalScores: [240, 240, 0, 230],
        game2Losers: [playerId6],
        winners: [playerId2, playerId4],
        runnersUp: [playerId8],
        semifinalTies: [playerId2, playerId4],
      },
      {
        name: "resolves both semifinal ties without awarding second to the winner's semifinal opponent",
        tieBothSemifinals: true,
        finalScores: [207, 206, 205, 204],
        game2Losers: [playerId4, playerId8],
        winners: [playerId2],
        runnersUp: [playerId6],
        semifinalTies: [playerId2, playerId4, playerId6, playerId8],
      },
      {
        name: "records two winners and one runner-up after both semifinals tie",
        tieBothSemifinals: true,
        finalScores: [207, 207, 205, 204],
        game2Losers: [playerId8],
        winners: [playerId2, playerId4],
        runnersUp: [playerId6],
        semifinalTies: [playerId2, playerId4, playerId6, playerId8],
      },
      {
        name: "records two winners and two runners-up after both semifinals tie",
        tieBothSemifinals: true,
        finalScores: [207, 207, 205, 205],
        game2Losers: [],
        winners: [playerId2, playerId4],
        runnersUp: [playerId6, playerId8],
        semifinalTies: [playerId2, playerId4, playerId6, playerId8],
      },
    ];

    it.each(finalTieCases)("$name", ({
      tieBothSemifinals,
      finalScores,
      game2Losers,
      winners,
      runnersUp,
      semifinalTies,
    }) => {
      const tieGames = cloneDeep(squadGamesThrough(3));

      // Players 2 and 4 won their game-1 matches.
      setGameScore(tieGames, playerId2, 2, 216);
      setGameScore(tieGames, playerId4, 2, 216);

      if (tieBothSemifinals) {
        // Players 6 and 8 won their game-1 matches.
        setGameScore(tieGames, playerId6, 2, 231);
        setGameScore(tieGames, playerId8, 2, 231);
      }

      const [player2Score, player4Score, player6Score, player8Score] =
        finalScores;

      setGameScore(tieGames, playerId2, 3, player2Score);
      setGameScore(tieGames, playerId4, 3, player4Score);
      setGameScore(tieGames, playerId6, 3, player6Score);
      setGameScore(tieGames, playerId8, 3, player8Score);

      createTiesBrktList(tieGames);
      tiesBracket.updateMatches();

      expect(tiesBracket.loserBrktGame1Ids).toEqual(
        new Set([playerId1, playerId3, playerId5, playerId7]),
      );
      expect(tiesBracket.semiFinalTies).toEqual(new Set(semifinalTies));
      expect(tiesBracket.loserBrktGame2Ids).toEqual(new Set(game2Losers));
      expect(tiesBracket.winnerIds).toEqual(new Set(winners));
      expect(tiesBracket.runnerUpIds).toEqual(new Set(runnersUp));
    });    

  });

  // describe('updateMatches - score corrections', () => {

  //   it("recalculates the bracket after an earlier score is corrected", () => {
  //     /*
  //     * First calculation uses the normal scores.
  //     *
  //     * Game 1:
  //     *
  //     * player 1 vs player 2 -> player 2 wins
  //     * player 3 vs player 4 -> player 4 wins
  //     * player 5 vs player 6 -> player 6 wins
  //     * player 7 vs player 8 -> player 8 wins
  //     *
  //     * Game 2:
  //     *
  //     * player 2 vs player 4 -> player 2 wins
  //     * player 6 vs player 8 -> player 8 wins
  //     *
  //     * Game 3:
  //     *
  //     * player 2 vs player 8 -> player 8 wins
  //     */
  //     const initialGames = cloneDeep(squadGamesThrough(3));
  //     setup(initialGames);
  //     bracket.updateMatches();

  //     expect(
  //       bracket.loserBrktGame1Ids,
  //     ).toEqual(
  //       new Set([
  //         playerId1,
  //         playerId3,
  //         playerId5,
  //         playerId7,
  //       ]),
  //     );

  //     expect(
  //       bracket.loserBrktGame2Ids,
  //     ).toEqual(
  //       new Set([
  //         playerId4,
  //         playerId6,
  //       ]),
  //     );

  //     expect(bracket.winnerIds).toEqual(new Set([playerId8]));
  //     expect(bracket.runnerUpIds).toEqual(new Set([playerId2]));

  //     /*
  //     * Correct player 7's game-1 score.
  //     *
  //     * Original:
  //     *
  //     * player 7 = 190
  //     * player 8 = 230
  //     *
  //     * Corrected:
  //     *
  //     * player 7 = 290
  //     * player 8 = 230
  //     *
  //     * Player 7 now advances instead of player 8.
  //     *
  //     * The bottom half of the bracket becomes:
  //     *
  //     * Game 1:
  //     *
  //     * player 5 vs player 6 -> player 6 wins
  //     * player 7 vs player 8 -> player 7 wins
  //     *
  //     * Game 2:
  //     *
  //     * player 6 vs player 7 -> player 6 wins
  //     *
  //     * Game 3:
  //     *
  //     * player 2 vs player 6 -> player 6 wins
  //     */
  //     setGameScore(initialGames, playerId7, 1, 290);
  //     brktList.createGameScoresMap(initialGames);
  //     bracket.updateMatches();

  //     /*
  //     * updateMatches() should have cleared the old
  //     * results before recalculating.
  //     *
  //     * Player 7 is no longer a game-1 loser.
  //     * Player 8 is now a game-1 loser.
  //     */
  //     expect(
  //       bracket.loserBrktGame1Ids,
  //     ).toEqual(
  //       new Set([
  //         playerId1,
  //         playerId3,
  //         playerId5,
  //         playerId8,
  //       ]),
  //     );

  //     /*
  //     * Game-2 losers are player 4 and player 7.
  //     *
  //     * Player 7 advanced from game 1 after the
  //     * score correction, but then lost game 2
  //     * to player 6.
  //     */
  //     expect(
  //       bracket.loserBrktGame2Ids,
  //     ).toEqual(
  //       new Set([
  //         playerId4,
  //         playerId7,
  //       ]),
  //     );

  //     expect(bracket.runnerUpIds).toEqual(new Set([playerId2]));
  //     expect(bracket.winnerIds).toEqual(new Set([playerId6]));
  //     expect(bracket.semiFinalTies).toEqual(new Set());
  //   });    

  //   it("removes old semifinal tie data when scores are corrected", () => {
  //     /*
  //      * First calculation:
  //      *
  //      * player 2 and player 4 tie in semifinal.
  //      */
  //     const tiedGames = cloneDeep(squadGamesThrough(3))

  //     setGameScore(tiedGames, playerId2, 2, 216);
  //     setGameScore(tiedGames, playerId4, 2, 216);

  //     setup(tiedGames);

  //     bracket.updateMatches();

  //     expect(bracket.semiFinalTies).toEqual(
  //       new Set([
  //         playerId2,
  //         playerId4,
  //       ]),
  //     );

  //     /*
  //      * Correct player 4's score so the semifinal is
  //      * no longer tied.
  //      */
  //     setGameScore(tiedGames, playerId4, 2, 206);

  //     brktList.createGameScoresMap(tiedGames);

  //     bracket.updateMatches();

  //     expect(bracket.semiFinalTies).toEqual(new Set());      
  //     expect(bracket.loserBrktGame1Ids.has(playerId4)).toBe(false);
  //     expect(bracket.loserBrktGame2Ids.has(playerId4)).toBe(true);
  //     expect(bracket.runnerUpIds.has(playerId2)).toBe(true);
  //   });

  // });  
});