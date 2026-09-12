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

      expect(bracket.loserIds).toEqual(
        new Set([
          playerId1,
          playerId3,
          playerId5,
          playerId7,
        ]),
      );

      expect(bracket.runnerUpIds).toEqual(new Set());
      expect(bracket.winnerIds).toEqual(new Set());
      expect(bracket.semiFinalTies).toEqual(new Set());
    });

    it("calculates results when games 1 and 2 are complete", () => {
      setup(squadGamesThrough(2));

      bracket.updateMatches();

      expect(bracket.loserIds).toEqual(
        new Set([
          playerId1,
          playerId3,
          playerId4,
          playerId5,
          playerId6,
          playerId7,
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
      * 5 vs 6 -> 5
      * 7 vs 8 -> 8
      *
      * Game 2:
      *
      * 2 vs 4 -> 2
      * 5 vs 8 -> 8
      *
      * Game 3:
      *
      * 2 vs 8 -> 8
      */

      expect(bracket.loserIds).toEqual(
        new Set([
          playerId1,
          playerId3,
          playerId4,
          playerId5,
          playerId6,
          playerId7,
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
        bracket.loserIds,
      ).toEqual(
        new Set([
          playerId1,
          playerId3,
          playerId4,
          playerId5,
          playerId6,
          playerId7,
        ]),
      );

      expect(bracket.runnerUpIds).toEqual(new Set([playerId2]));
      expect(bracket.winnerIds).toEqual(new Set([playerId8]));
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
      expect(tiesBracket.loserIds.has(playerId1)).toBe(false);
      expect(tiesBracket.loserIds.has(playerId2)).toBe(false);
      expect(tiesBracket.loserIds.size).toBe(3); // losers from match 1, 2, 3
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
      expect(tiesBracket.loserIds.has(playerId2)).toBe(false);
      expect(tiesBracket.loserIds.has(playerId4)).toBe(false);
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

      expect(tiesBracket.loserIds).toEqual(
        new Set([
          playerId1,
          playerId3,
          playerId4,
          playerId5,
          playerId6,
          playerId7,
        ]),
      );      

      expect(tiesBracket.winnerIds).toEqual(
        new Set([
          playerId2,
          playerId8,
        ]),
      );

      expect(tiesBracket.runnerUpIds).toEqual(new Set());

      expect(tiesBracket.semiFinalTies).toEqual(
        new Set(),
      );

      /*
       * Neither tied semifinalist has lost.
       */
      expect(tiesBracket.loserIds.has(playerId2)).toBe(false);
      expect(tiesBracket.loserIds.has(playerId8)).toBe(false);
    });

  });

  describe('updateMatches - score corrections', () => {
    
    it("recalculates the bracket after an earlier score is corrected", () => {
      /*
       * First calculation uses the normal scores.
       *
       * Final:
       *
       * player 4 vs player 8
       *
       * player 8 wins.
       */      
      const initialGames = cloneDeep(squadGamesThrough(3))
      setup(initialGames);

      bracket.updateMatches();

      expect(bracket.loserIds).toEqual(
        new Set([
          playerId1,
          playerId3,
          playerId4,
          playerId5,
          playerId6,
          playerId7,
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
       * This changes who advances through the bottom
       * portion of the bracket.
       */
      setGameScore(initialGames, playerId7, 1, 290);

      brktList.createGameScoresMap(initialGames);

      bracket.updateMatches();

      expect(bracket.loserIds).toEqual(
        new Set([
          playerId1,
          playerId3,
          playerId4,
          playerId5,
          playerId7,
          playerId8,
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
      expect(bracket.loserIds.has(playerId4)).toBe(true);
      expect(bracket.runnerUpIds.has(playerId2)).toBe(true);
    });

  });  
});