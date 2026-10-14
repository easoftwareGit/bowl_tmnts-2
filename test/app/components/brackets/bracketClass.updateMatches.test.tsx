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

  describe('updateMatches - score corrections', () => {

    it("recalculates the bracket after an earlier score is corrected", () => {
      /*
      * First calculation uses the normal scores.
      *
      * Game 1:
      *
      * player 1 vs player 2 -> player 2 wins
      * player 3 vs player 4 -> player 4 wins
      * player 5 vs player 6 -> player 6 wins
      * player 7 vs player 8 -> player 8 wins
      *
      * Game 2:
      *
      * player 2 vs player 4 -> player 2 wins
      * player 6 vs player 8 -> player 8 wins
      *
      * Game 3:
      *
      * player 2 vs player 8 -> player 8 wins
      */
      const initialGames = cloneDeep(squadGamesThrough(3));
      setup(initialGames);
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

      expect(bracket.winnerIds).toEqual(new Set([playerId8]));
      expect(bracket.runnerUpIds).toEqual(new Set([playerId2]));

      /*
      * Correct player 7's game-1 score.
      *
      * Original:
      *
      * player 7 = 190
      * player 8 = 230
      *
      * Corrected:
      *
      * player 7 = 290
      * player 8 = 230
      *
      * Player 7 now advances instead of player 8.
      *
      * The bottom half of the bracket becomes:
      *
      * Game 1:
      *
      * player 5 vs player 6 -> player 6 wins
      * player 7 vs player 8 -> player 7 wins
      *
      * Game 2:
      *
      * player 6 vs player 7 -> player 6 wins
      *
      * Game 3:
      *
      * player 2 vs player 6 -> player 6 wins
      */
      setGameScore(initialGames, playerId7, 1, 290);
      brktList.createGameScoresMap(initialGames);
      bracket.updateMatches();

      /*
      * updateMatches() should have cleared the old
      * results before recalculating.
      *
      * Player 7 is no longer a game-1 loser.
      * Player 8 is now a game-1 loser.
      */
      expect(
        bracket.loserBrktGame1Ids,
      ).toEqual(
        new Set([
          playerId1,
          playerId3,
          playerId5,
          playerId8,
        ]),
      );

      /*
      * Game-2 losers are player 4 and player 7.
      *
      * Player 7 advanced from game 1 after the
      * score correction, but then lost game 2
      * to player 6.
      */
      expect(
        bracket.loserBrktGame2Ids,
      ).toEqual(
        new Set([
          playerId4,
          playerId7,
        ]),
      );

      expect(bracket.runnerUpIds).toEqual(new Set([playerId2]));
      expect(bracket.winnerIds).toEqual(new Set([playerId6]));
      expect(bracket.semiFinalTies).toEqual(new Set());
    });    

    it("removes old semifinal tie data when scores are corrected", () => {
      /*
       * First calculation:
       *
       * player 2 and player 4 tie in semifinal.
       */
      const tiedGames = cloneDeep(squadGamesThrough(3))

      setGameScore(tiedGames, playerId2, 2, 216);
      setGameScore(tiedGames, playerId4, 2, 216);

      setup(tiedGames);

      bracket.updateMatches();

      expect(bracket.semiFinalTies).toEqual(
        new Set([
          playerId2,
          playerId4,
        ]),
      );

      /*
       * Correct player 4's score so the semifinal is
       * no longer tied.
       */
      setGameScore(tiedGames, playerId4, 2, 206);

      brktList.createGameScoresMap(tiedGames);

      bracket.updateMatches();

      expect(bracket.semiFinalTies).toEqual(new Set());      
      expect(bracket.loserBrktGame1Ids.has(playerId4)).toBe(false);
      expect(bracket.loserBrktGame2Ids.has(playerId4)).toBe(true);
      expect(bracket.runnerUpIds.has(playerId2)).toBe(true);
    });

  });  
});