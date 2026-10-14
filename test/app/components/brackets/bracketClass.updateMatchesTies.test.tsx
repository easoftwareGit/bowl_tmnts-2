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

    describe("game 1 ties", () => {

      describe('match 0 ties', () => {
        it("advances both players in match 0 when game 1 is tied - through game 1", () => {
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
          expect(tiesBracket.semiFinalTies).toEqual(new Set());
          expect(tiesBracket.runnerUpIds).toEqual(new Set());
          expect(tiesBracket.winnerIds).toEqual(new Set());
        });

        it("through game 3, PlayerId2 wins match 4, Game 2", () => {
          const tieGames = cloneDeep(squadGamesThrough(3));

          // Tie first-round matches 0.
          setGameScore(tieGames, playerId1, 1, 210);
          setGameScore(tieGames, playerId2, 1, 210);
          createTiesBrktList(tieGames);

          tiesBracket.updateMatches();

          expect(
            tiesBracket.loserBrktGame1Ids,
          ).toEqual(
            new Set([
              playerId3,
              playerId5,
              playerId7,
            ]),
          );
          expect(
            tiesBracket.loserBrktGame2Ids,
          ).toEqual(
            new Set([
              playerId1,
              playerId4,
              playerId6,
            ]),
          );
          expect(tiesBracket.semiFinalTies).toEqual(new Set());
          expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId2]));
          expect(tiesBracket.winnerIds).toEqual(new Set([playerId8]));
          
          expect(tiesBracket.loserBrktGame1Ids.has(playerId2)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId2)).toBe(false);
          expect(tiesBracket.loserBrktGame1Ids.has(playerId8)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId8)).toBe(false);
        });

        it("through game 3 PlayerId1 wins match 4 Game 2", () => {
          const tieGames = cloneDeep(squadGamesThrough(3));

          // Tie first-round matches 0.
          setGameScore(tieGames, playerId1, 1, 210);
          setGameScore(tieGames, playerId2, 1, 210);
          setGameScore(tieGames, playerId1, 2, 230);
          createTiesBrktList(tieGames);

          tiesBracket.updateMatches();

          expect(
            tiesBracket.loserBrktGame1Ids,
          ).toEqual(
            new Set([
              playerId3,
              playerId5,
              playerId7,
            ]),
          );
          expect(
            tiesBracket.loserBrktGame2Ids,
          ).toEqual(
            new Set([
              playerId2,
              playerId4,
              playerId6,
            ]),
          );
          expect(tiesBracket.semiFinalTies).toEqual(new Set());
          expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId1]));
          expect(tiesBracket.winnerIds).toEqual(new Set([playerId8]));

          expect(tiesBracket.loserBrktGame1Ids.has(playerId1)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId1)).toBe(false);
          expect(tiesBracket.loserBrktGame1Ids.has(playerId8)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId8)).toBe(false);
        });

        it("through game 3 PlayerId4 wins match 4, Game 2", () => {
          const tieGames = cloneDeep(squadGamesThrough(3));

          // Tie first-round matches 0.
          setGameScore(tieGames, playerId1, 1, 210);
          setGameScore(tieGames, playerId2, 1, 210);
          setGameScore(tieGames, playerId1, 2, 199);
          setGameScore(tieGames, playerId2, 2, 198);
          createTiesBrktList(tieGames);

          tiesBracket.updateMatches();

          expect(
            tiesBracket.loserBrktGame1Ids,
          ).toEqual(
            new Set([
              playerId3,
              playerId5,
              playerId7,
            ]),
          );
          expect(
            tiesBracket.loserBrktGame2Ids,
          ).toEqual(
            new Set([
              playerId1,
              playerId2,              
              playerId6,
            ]),
          );
          expect(tiesBracket.semiFinalTies).toEqual(new Set());
          expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId4]));
          expect(tiesBracket.winnerIds).toEqual(new Set([playerId8]));

          expect(tiesBracket.loserBrktGame1Ids.has(playerId4)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId4)).toBe(false);
          expect(tiesBracket.loserBrktGame1Ids.has(playerId8)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId8)).toBe(false);
        });
      });

      describe('match 1 ties', () => {
        it("advances both players in match 1 when game 1 is tied - through game 1", () => {
          const tieGames = cloneDeep(squadGamesThrough(1));

          // Tie first-round matches 1.
          setGameScore(tieGames, playerId3, 1, 205);
          setGameScore(tieGames, playerId4, 1, 205);
          createTiesBrktList(tieGames);

          tiesBracket.updateMatches();

          /*
          * Both player 3 and player 4 should advance from
          * their first-round match.
          *
          * Neither player should be recorded as a game-1 loser.
          */
          expect(tiesBracket.loserBrktGame1Ids.has(playerId3)).toBe(false);
          expect(tiesBracket.loserBrktGame1Ids.has(playerId4)).toBe(false);
          expect(tiesBracket.loserBrktGame1Ids.size).toBe(3);
          expect(tiesBracket.loserBrktGame2Ids).toEqual(new Set());
          expect(tiesBracket.semiFinalTies).toEqual(new Set());
          expect(tiesBracket.runnerUpIds).toEqual(new Set());
          expect(tiesBracket.winnerIds).toEqual(new Set());
        });

        it("through game 3 PlayerId3 wins match 4, Game 2", () => {
          const tieGames = cloneDeep(squadGamesThrough(3));

          // Tie first-round matches 0.
          setGameScore(tieGames, playerId3, 1, 205);
          setGameScore(tieGames, playerId4, 1, 205);
          setGameScore(tieGames, playerId3, 2, 215);
          createTiesBrktList(tieGames);

          tiesBracket.updateMatches();

          expect(
            tiesBracket.loserBrktGame1Ids,
          ).toEqual(
            new Set([
              playerId1,              
              playerId5,
              playerId7,
            ]),
          );
          expect(
            tiesBracket.loserBrktGame2Ids,
          ).toEqual(
            new Set([
              playerId2,
              playerId4,
              playerId6,
            ]),
          );
          expect(tiesBracket.semiFinalTies).toEqual(new Set());
          expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId3]));
          expect(tiesBracket.winnerIds).toEqual(new Set([playerId8]));

          expect(tiesBracket.loserBrktGame1Ids.has(playerId3)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId3)).toBe(false);
          expect(tiesBracket.loserBrktGame1Ids.has(playerId8)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId8)).toBe(false);
        });

        it("through game 3 PlayerId4 wins match 4, Game 2", () => {
          const tieGames = cloneDeep(squadGamesThrough(3));

          // Tie first-round matches 2.
          setGameScore(tieGames, playerId3, 1, 210);
          setGameScore(tieGames, playerId4, 1, 210);
          setGameScore(tieGames, playerId4, 2, 216);
          createTiesBrktList(tieGames);

          tiesBracket.updateMatches();

          expect(
            tiesBracket.loserBrktGame1Ids,
          ).toEqual(
            new Set([
              playerId1,
              playerId5,
              playerId7,
            ]),
          );
          expect(
            tiesBracket.loserBrktGame2Ids,
          ).toEqual(
            new Set([
              playerId2,
              playerId3,
              playerId6,
            ]),
          );
          expect(tiesBracket.semiFinalTies).toEqual(new Set());
          expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId4]));
          expect(tiesBracket.winnerIds).toEqual(new Set([playerId8]));

          expect(tiesBracket.loserBrktGame1Ids.has(playerId4)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId4)).toBe(false);
          expect(tiesBracket.loserBrktGame1Ids.has(playerId8)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId8)).toBe(false);
        });

        it("through game 3 PlayerId2 wins match 4, Game 2", () => {
          const tieGames = cloneDeep(squadGamesThrough(3));

          // Tie first-round matches 0.
          setGameScore(tieGames, playerId3, 1, 210);
          setGameScore(tieGames, playerId4, 1, 210);
          setGameScore(tieGames, playerId3, 2, 199);
          setGameScore(tieGames, playerId4, 2, 198);
          createTiesBrktList(tieGames);

          tiesBracket.updateMatches();

          expect(
            tiesBracket.loserBrktGame1Ids,
          ).toEqual(
            new Set([
              playerId1,
              playerId5,
              playerId7,
            ]),
          );
          expect(
            tiesBracket.loserBrktGame2Ids,
          ).toEqual(
            new Set([
              playerId3,
              playerId4,              
              playerId6,
            ]),
          );
          expect(tiesBracket.semiFinalTies).toEqual(new Set());
          expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId2]));
          expect(tiesBracket.winnerIds).toEqual(new Set([playerId8]));

          expect(tiesBracket.loserBrktGame1Ids.has(playerId2)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId2)).toBe(false);
          expect(tiesBracket.loserBrktGame1Ids.has(playerId8)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId8)).toBe(false);
        });
      });      

      describe('match 2 ties', () => {
        it("advances both players in match 2 when game 1 is tied - through game 1", () => {
          const tieGames = cloneDeep(squadGamesThrough(1));

          // Tie first-round matches 0.
          setGameScore(tieGames, playerId5, 1, 225);
          setGameScore(tieGames, playerId6, 1, 225);
          createTiesBrktList(tieGames);

          tiesBracket.updateMatches();

          /*
          * Both player 5 and player 6 should advance from
          * their first-round match.
          *
          * Neither player should be recorded as a game-1 loser.
          */
          expect(tiesBracket.loserBrktGame1Ids.has(playerId5)).toBe(false);
          expect(tiesBracket.loserBrktGame1Ids.has(playerId6)).toBe(false);
          expect(tiesBracket.loserBrktGame1Ids.size).toBe(3);
          expect(tiesBracket.loserBrktGame2Ids).toEqual(new Set());
          expect(tiesBracket.semiFinalTies).toEqual(new Set());
          expect(tiesBracket.runnerUpIds).toEqual(new Set());
          expect(tiesBracket.winnerIds).toEqual(new Set());
        });

        it("through game 3 PlayerId5 wins match 5, Game 2", () => {
          const tieGames = cloneDeep(squadGamesThrough(3));

          // Tie first-round matches 0.
          setGameScore(tieGames, playerId5, 1, 225);
          setGameScore(tieGames, playerId6, 1, 225);
          setGameScore(tieGames, playerId5, 2, 235);
          createTiesBrktList(tieGames);

          tiesBracket.updateMatches();

          expect(
            tiesBracket.loserBrktGame1Ids,
          ).toEqual(
            new Set([
              playerId1,              
              playerId3,
              playerId7,
            ]),
          );
          expect(
            tiesBracket.loserBrktGame2Ids,
          ).toEqual(
            new Set([
              playerId4,
              playerId6,
              playerId8,              
            ]),            
          );
          expect(tiesBracket.semiFinalTies).toEqual(new Set());
          expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId2]));
          expect(tiesBracket.winnerIds).toEqual(new Set([playerId5]));

          expect(tiesBracket.loserBrktGame1Ids.has(playerId2)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId2)).toBe(false);
          expect(tiesBracket.loserBrktGame1Ids.has(playerId5)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId5)).toBe(false);
        });

        it("through game 3 PlayerId6 wins match 5, Game 2", () => {
          const tieGames = cloneDeep(squadGamesThrough(3));

          // Tie first-round matches 0.
          setGameScore(tieGames, playerId5, 1, 225);
          setGameScore(tieGames, playerId6, 1, 225);
          setGameScore(tieGames, playerId6, 2, 235);
          createTiesBrktList(tieGames);

          tiesBracket.updateMatches();

          expect(
            tiesBracket.loserBrktGame1Ids,
          ).toEqual(
            new Set([
              playerId1,
              playerId3,
              playerId7,
            ]),
          );
          expect(
            tiesBracket.loserBrktGame2Ids,
          ).toEqual(
            new Set([
              playerId4,
              playerId5,
              playerId8,
            ]),
          );
          expect(tiesBracket.semiFinalTies).toEqual(new Set());
          expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId2]));
          expect(tiesBracket.winnerIds).toEqual(new Set([playerId6]));

          expect(tiesBracket.loserBrktGame1Ids.has(playerId2)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId2)).toBe(false);
          expect(tiesBracket.loserBrktGame1Ids.has(playerId6)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId6)).toBe(false);
        });

        it("through game 3 PlayerId8 wins match 5, Game 2", () => {
          const tieGames = cloneDeep(squadGamesThrough(3));

          // Tie first-round matches 0.
          setGameScore(tieGames, playerId5, 1, 225);
          setGameScore(tieGames, playerId6, 1, 225);
          setGameScore(tieGames, playerId5, 2, 199);
          setGameScore(tieGames, playerId6, 2, 198);
          createTiesBrktList(tieGames);

          tiesBracket.updateMatches();

          expect(
            tiesBracket.loserBrktGame1Ids,
          ).toEqual(
            new Set([
              playerId1,
              playerId3,
              playerId7,
            ]),
          );
          expect(
            tiesBracket.loserBrktGame2Ids,
          ).toEqual(
            new Set([
              playerId4,
              playerId5,              
              playerId6,
            ]),
          );
          expect(tiesBracket.semiFinalTies).toEqual(new Set());
          expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId2]));
          expect(tiesBracket.winnerIds).toEqual(new Set([playerId8]));

          expect(tiesBracket.loserBrktGame1Ids.has(playerId2)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId2)).toBe(false);
          expect(tiesBracket.loserBrktGame1Ids.has(playerId8)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId8)).toBe(false);
        });
      });     

      describe('match 3 ties', () => {
        it("advances both players in match 1 when game 1 is tied - through game 1", () => {
          const tieGames = cloneDeep(squadGamesThrough(1));

          // Tie first-round matches 3.
          setGameScore(tieGames, playerId7, 1, 230);
          setGameScore(tieGames, playerId8, 1, 230);
          createTiesBrktList(tieGames);

          tiesBracket.updateMatches();

          /*
          * Both player 7 and player 8 should advance from
          * their first-round match.
          *
          * Neither player should be recorded as a game-1 loser.
          */
          expect(tiesBracket.loserBrktGame1Ids.has(playerId7)).toBe(false);
          expect(tiesBracket.loserBrktGame1Ids.has(playerId8)).toBe(false);
          expect(tiesBracket.loserBrktGame1Ids.size).toBe(3);
          expect(tiesBracket.loserBrktGame2Ids).toEqual(new Set());
          expect(tiesBracket.semiFinalTies).toEqual(new Set());
          expect(tiesBracket.runnerUpIds).toEqual(new Set());
          expect(tiesBracket.winnerIds).toEqual(new Set());
        });

        it("through game 3 PlayerId7 wins match 5, Game 2", () => {
          const tieGames = cloneDeep(squadGamesThrough(3));

          // Tie first-round matches 0.
          setGameScore(tieGames, playerId7, 1, 225);
          setGameScore(tieGames, playerId8, 1, 225);
          setGameScore(tieGames, playerId7, 2, 235);
          createTiesBrktList(tieGames);

          tiesBracket.updateMatches();

          expect(
            tiesBracket.loserBrktGame1Ids,
          ).toEqual(
            new Set([
              playerId1,              
              playerId3,
              playerId5,
            ]),
          );
          expect(
            tiesBracket.loserBrktGame2Ids,
          ).toEqual(
            new Set([
              playerId4,
              playerId6,
              playerId8,              
            ]),
          );
          expect(tiesBracket.semiFinalTies).toEqual(new Set());
          expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId7]));
          expect(tiesBracket.winnerIds).toEqual(new Set([playerId2]));

          expect(tiesBracket.loserBrktGame1Ids.has(playerId2)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId2)).toBe(false);
          expect(tiesBracket.loserBrktGame1Ids.has(playerId7)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId7)).toBe(false);
        });

        it("through game 3 PlayerId8 wins match 5, Game 2", () => {
          const tieGames = cloneDeep(squadGamesThrough(3));

          // Tie first-round matches 0.
          setGameScore(tieGames, playerId7, 1, 225);
          setGameScore(tieGames, playerId8, 1, 225);
          setGameScore(tieGames, playerId8, 2, 235);
          createTiesBrktList(tieGames);

          tiesBracket.updateMatches();

          expect(
            tiesBracket.loserBrktGame1Ids,
          ).toEqual(
            new Set([
              playerId1,
              playerId3,
              playerId5,
            ]),
          );
          expect(
            tiesBracket.loserBrktGame2Ids,
          ).toEqual(
            new Set([
              playerId4,
              playerId6,
              playerId7,
            ]),
          );
          expect(tiesBracket.semiFinalTies).toEqual(new Set());
          expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId2]));
          expect(tiesBracket.winnerIds).toEqual(new Set([playerId8]));

          expect(tiesBracket.loserBrktGame1Ids.has(playerId2)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId2)).toBe(false);
          expect(tiesBracket.loserBrktGame1Ids.has(playerId8)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId8)).toBe(false);
        });

        it("through game 3 PlayerId6 wins match 6, Game 2", () => {
          const tieGames = cloneDeep(squadGamesThrough(3));

          // Tie first-round matches 0.
          setGameScore(tieGames, playerId7, 1, 225);
          setGameScore(tieGames, playerId8, 1, 225);
          setGameScore(tieGames, playerId7, 2, 199);
          setGameScore(tieGames, playerId8, 2, 198);
          createTiesBrktList(tieGames);

          tiesBracket.updateMatches();

          expect(
            tiesBracket.loserBrktGame1Ids,
          ).toEqual(
            new Set([
              playerId1,
              playerId3,
              playerId5,
            ]),
          );
          expect(
            tiesBracket.loserBrktGame2Ids,
          ).toEqual(
            new Set([
              playerId4,
              playerId7,              
              playerId8,
            ]),
          );
          expect(tiesBracket.semiFinalTies).toEqual(new Set());
          expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId2]));
          expect(tiesBracket.winnerIds).toEqual(new Set([playerId6]));

          expect(tiesBracket.loserBrktGame1Ids.has(playerId2)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId2)).toBe(false);
          expect(tiesBracket.loserBrktGame1Ids.has(playerId6)).toBe(false);
          expect(tiesBracket.loserBrktGame2Ids.has(playerId6)).toBe(false);
        });
      });     

    });

    describe('game 1 ties: matches 0 and 1 tie - 1 player wins match 4', () => { 

      it("PlayerId1 wins match 4 and advances to match 6", () => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie both first-round matches feeding into match 4.
        setGameScore(tieGames, playerId1, 1, 210);
        setGameScore(tieGames, playerId2, 1, 210);
        setGameScore(tieGames, playerId3, 1, 205);
        setGameScore(tieGames, playerId4, 1, 205);

        // PlayerId1 has the highest game 2 score in match 4.
        setGameScore(tieGames, playerId1, 2, 240);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([playerId5, playerId7]),
        );
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set([
            playerId2,
            playerId3,
            playerId4,
            playerId6,
          ]),
        );
        expect(tiesBracket.semiFinalTies).toEqual(new Set());
        expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId1]));
        expect(tiesBracket.winnerIds).toEqual(new Set([playerId8]));
      });

      it("PlayerId2 wins match 4 and advances to match 6", () => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie both first-round matches feeding into match 4.
        setGameScore(tieGames, playerId1, 1, 210);
        setGameScore(tieGames, playerId2, 1, 210);
        setGameScore(tieGames, playerId3, 1, 205);
        setGameScore(tieGames, playerId4, 1, 205);

        // PlayerId2 has the highest game 2 score in match 4.
        setGameScore(tieGames, playerId2, 2, 240);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([playerId5, playerId7]),
        );
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set([
            playerId1,
            playerId3,
            playerId4,
            playerId6,
          ]),
        );
        expect(tiesBracket.semiFinalTies).toEqual(new Set());
        expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId2]));
        expect(tiesBracket.winnerIds).toEqual(new Set([playerId8]));
      });

      it("PlayerId3 wins match 4 and advances to match 6", () => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie both first-round matches feeding into match 4.
        setGameScore(tieGames, playerId1, 1, 210);
        setGameScore(tieGames, playerId2, 1, 210);
        setGameScore(tieGames, playerId3, 1, 205);
        setGameScore(tieGames, playerId4, 1, 205);

        // PlayerId3 has the highest game 2 score in match 4.
        setGameScore(tieGames, playerId3, 2, 240);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([playerId5, playerId7]),
        );
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set([
            playerId1,
            playerId2,
            playerId4,
            playerId6,
          ]),
        );
        expect(tiesBracket.semiFinalTies).toEqual(new Set());
        expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId3]));
        expect(tiesBracket.winnerIds).toEqual(new Set([playerId8]));
      });

      it("PlayerId4 wins match 4 and advances to match 6", () => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie both first-round matches feeding into match 4.
        setGameScore(tieGames, playerId1, 1, 210);
        setGameScore(tieGames, playerId2, 1, 210);
        setGameScore(tieGames, playerId3, 1, 205);
        setGameScore(tieGames, playerId4, 1, 205);

        // PlayerId4 has the highest game 2 score in match 4.
        setGameScore(tieGames, playerId4, 2, 240);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([playerId5, playerId7]),
        );
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set([
            playerId1,
            playerId2,
            playerId3,
            playerId6,
          ]),
        );
        expect(tiesBracket.semiFinalTies).toEqual(new Set());
        expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId4]));
        expect(tiesBracket.winnerIds).toEqual(new Set([playerId8]));
      });
    });     

    describe("game 1 ties: matches 0 and 1 tie, followed by a tie in match 4", () => {
      it.each([
        {
          name: "PlayerId1 > PlayerId8 > PlayerId2",
          tiedPlayerId: playerId2,
          player1Score: 240,
          tiedPlayerScore: 220,
          player8Score: 230,
          winnerId: playerId1,
          runnerUpId: playerId8,
          game2LoserIds: [playerId2, playerId3, playerId4, playerId6],
        },
        {
          name: "PlayerId1 > PlayerId2 > PlayerId8",
          tiedPlayerId: playerId2,
          player1Score: 240,
          tiedPlayerScore: 230,
          player8Score: 220,
          winnerId: playerId1,
          runnerUpId: playerId8,
          game2LoserIds: [playerId2, playerId3, playerId4, playerId6],
        },
        {
          name: "PlayerId8 > PlayerId1 > PlayerId2",
          tiedPlayerId: playerId2,
          player1Score: 230,
          tiedPlayerScore: 220,
          player8Score: 240,
          winnerId: playerId8,
          runnerUpId: playerId1,
          game2LoserIds: [playerId2, playerId3, playerId4, playerId6],
        },
        {
          name: "PlayerId2 > PlayerId8 > PlayerId1",
          tiedPlayerId: playerId2,
          player1Score: 220,
          tiedPlayerScore: 240,
          player8Score: 230,
          winnerId: playerId2,
          runnerUpId: playerId8,
          game2LoserIds: [playerId1, playerId3, playerId4, playerId6],
        },
        {
          name: "PlayerId2 > PlayerId1 > PlayerId8",
          tiedPlayerId: playerId2,
          player1Score: 230,
          tiedPlayerScore: 240,
          player8Score: 220,
          winnerId: playerId2,
          runnerUpId: playerId8,
          game2LoserIds: [playerId1, playerId3, playerId4, playerId6],
        },
        {
          name: "PlayerId8 > PlayerId2 > PlayerId1",
          tiedPlayerId: playerId2,
          player1Score: 220,
          tiedPlayerScore: 230,
          player8Score: 240,
          winnerId: playerId8,
          runnerUpId: playerId2,
          game2LoserIds: [playerId1, playerId3, playerId4, playerId6],
        },
        {
          name: "PlayerId1 > PlayerId8 > PlayerId3",
          tiedPlayerId: playerId3,
          player1Score: 240,
          tiedPlayerScore: 220,
          player8Score: 230,
          winnerId: playerId1,
          runnerUpId: playerId8,
          game2LoserIds: [playerId2, playerId3, playerId4, playerId6],
        },
        {
          name: "PlayerId1 > PlayerId3 > PlayerId8",
          tiedPlayerId: playerId3,
          player1Score: 240,
          tiedPlayerScore: 230,
          player8Score: 220,
          winnerId: playerId1,
          runnerUpId: playerId8,
          game2LoserIds: [playerId2, playerId3, playerId4, playerId6],
        },
        {
          name: "PlayerId8 > PlayerId1 > PlayerId3",
          tiedPlayerId: playerId3,
          player1Score: 230,
          tiedPlayerScore: 220,
          player8Score: 240,
          winnerId: playerId8,
          runnerUpId: playerId1,
          game2LoserIds: [playerId2, playerId3, playerId4, playerId6],
        },
      ])("$name", ({
        tiedPlayerId,
        player1Score,
        tiedPlayerScore,
        player8Score,
        winnerId,
        runnerUpId,
        game2LoserIds,
      }) => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie both first-round matches feeding into match 4.
        setGameScore(tieGames, playerId1, 1, 210);
        setGameScore(tieGames, playerId2, 1, 210);
        setGameScore(tieGames, playerId3, 1, 205);
        setGameScore(tieGames, playerId4, 1, 205);

        // Give all four semifinalists a baseline score, then
        // tie PlayerId1 and the selected player for the high score.
        
        setGameScore(tieGames, playerId2, 2, 187);
        setGameScore(tieGames, playerId3, 2, 188);
        setGameScore(tieGames, playerId4, 2, 189);

        setGameScore(tieGames, playerId1, 2, 240);
        setGameScore(tieGames, tiedPlayerId, 2, 240);

        // Resolve the semifinal tie and final using game 3 scores.
        setGameScore(tieGames, playerId1, 3, player1Score);
        setGameScore(tieGames, tiedPlayerId, 3, tiedPlayerScore);
        setGameScore(tieGames, playerId8, 3, player8Score);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        // All four players from matches 0 and 1 advanced.
        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([playerId5, playerId7]),
        );

        // Includes the lower game 3 scorer from the tied semifinal.
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set(game2LoserIds),
        );

        // Preserve which players tied in match 4.
        expect(tiesBracket.semiFinalTies).toEqual(
          new Set([playerId1, tiedPlayerId]),
        );

        expect(tiesBracket.runnerUpIds).toEqual(
          new Set([runnerUpId]),
        );
        expect(tiesBracket.winnerIds).toEqual(
          new Set([winnerId]),
        );
      });
    });

    describe("matches 0 and 1 tied, followed by three players tied in match 4", () => {
      it.each([
        {
          name: "1) PlayerId1 wins; PlayerId8 is runner-up",
          player1Score: 250,
          player2Score: 220,
          player3Score: 220,
          player8Score: 240,
          winnerId: playerId1,
          runnerUpId: playerId8,
          game2LoserIds: [playerId2, playerId3, playerId4, playerId6],
        },
        {
          name: "2) PlayerId8 wins; PlayerId1 is runner-up",
          player1Score: 240,
          player2Score: 220,
          player3Score: 220,
          player8Score: 250,
          winnerId: playerId8,
          runnerUpId: playerId1,
          game2LoserIds: [playerId2, playerId3, playerId4, playerId6],
        },
        {
          name: "3) PlayerId2 wins; PlayerId8 is runner-up",
          player1Score: 220,
          player2Score: 250,
          player3Score: 220,
          player8Score: 240,
          winnerId: playerId2,
          runnerUpId: playerId8,
          game2LoserIds: [playerId1, playerId3, playerId4, playerId6],
        },
        {
          name: "4) PlayerId8 wins; PlayerId2 is runner-up",
          player1Score: 220,
          player2Score: 240,
          player3Score: 220,
          player8Score: 250,
          winnerId: playerId8,
          runnerUpId: playerId2,
          game2LoserIds: [playerId1, playerId3, playerId4, playerId6],
        },
        {
          name: "5) PlayerId3 wins; PlayerId8 is runner-up",
          player1Score: 220,
          player2Score: 220,
          player3Score: 250,
          player8Score: 240,
          winnerId: playerId3,
          runnerUpId: playerId8,
          game2LoserIds: [playerId1, playerId2, playerId4, playerId6],
        },
        {
          name: "6) PlayerId8 wins; PlayerId3 is runner-up",
          player1Score: 220,
          player2Score: 220,
          player3Score: 240,
          player8Score: 250,
          winnerId: playerId8,
          runnerUpId: playerId3,
          game2LoserIds: [playerId1, playerId2, playerId4, playerId6],
        },
      ])("$name", ({
        player1Score,
        player2Score,
        player3Score,
        player8Score,
        winnerId,
        runnerUpId,
        game2LoserIds,
      }) => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie both first-round matches feeding into match 4.
        setGameScore(tieGames, playerId1, 1, 210);
        setGameScore(tieGames, playerId2, 1, 210);
        setGameScore(tieGames, playerId3, 1, 205);
        setGameScore(tieGames, playerId4, 1, 205);

        // Three players tie for the highest score in match 4.
        // PlayerId4 loses in game 2.
        setGameScore(tieGames, playerId1, 2, 240);
        setGameScore(tieGames, playerId2, 2, 240);
        setGameScore(tieGames, playerId3, 2, 240);
        setGameScore(tieGames, playerId4, 2, 200);

        // Game 3 resolves the three-player semifinal tie
        // and determines the winner of match 6.
        setGameScore(tieGames, playerId1, 3, player1Score);
        setGameScore(tieGames, playerId2, 3, player2Score);
        setGameScore(tieGames, playerId3, 3, player3Score);
        setGameScore(tieGames, playerId8, 3, player8Score);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        // All four players from matches 0 and 1 advanced.
        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([playerId5, playerId7]),
        );

        // Includes both players who lose the semifinal
        // tiebreak using their game 3 scores.
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set(game2LoserIds),
        );

        // Preserve all three players who tied in match 4.
        expect(tiesBracket.semiFinalTies).toEqual(
          new Set([playerId1, playerId2, playerId3]),
        );

        expect(tiesBracket.runnerUpIds).toEqual(
          new Set([runnerUpId]),
        );
        expect(tiesBracket.winnerIds).toEqual(
          new Set([winnerId]),
        );
      });
    });

    describe("matches 0 and 1 tied, followed by three players tied in match 4, followed by a tie in match 6", () => {
      it.each([
        {
          name: "PlayerId1 = PlayerId2 > PlayerId8 > PlayerId3",
          player1Score: 250,
          player2Score: 250,
          player3Score: 220,
          player8Score: 240,
          winnerIds: [playerId1, playerId2],
          runnerUpIds: [playerId8],
          game2LoserIds: [playerId3, playerId4, playerId6],
        },
        {
          name: "PlayerId1 = PlayerId2 > PlayerId3 > PlayerId8",
          player1Score: 250,
          player2Score: 250,
          player3Score: 240,
          player8Score: 220,
          winnerIds: [playerId1, playerId2],
          runnerUpIds: [playerId8],
          game2LoserIds: [playerId3, playerId4, playerId6],
        },
        {
          name: "PlayerId8 > PlayerId1 = PlayerId2 > PlayerId3",
          player1Score: 240,
          player2Score: 240,
          player3Score: 220,
          player8Score: 250,
          winnerIds: [playerId8],
          runnerUpIds: [playerId1, playerId2],
          game2LoserIds: [playerId3, playerId4, playerId6],
        },
        {
          name: "PlayerId2 = PlayerId3 > PlayerId8 > PlayerId1",
          player1Score: 220,
          player2Score: 250,
          player3Score: 250,
          player8Score: 240,
          winnerIds: [playerId2, playerId3],
          runnerUpIds: [playerId8],
          game2LoserIds: [playerId1, playerId4, playerId6],
        },
        {
          name: "PlayerId2 = PlayerId3 > PlayerId1 > PlayerId8",
          player1Score: 240,
          player2Score: 250,
          player3Score: 250,
          player8Score: 220,
          winnerIds: [playerId2, playerId3],
          runnerUpIds: [playerId8],
          game2LoserIds: [playerId1, playerId4, playerId6],
        },
        {
          name: "PlayerId8 > PlayerId2 = PlayerId3 > PlayerId1",
          player1Score: 220,
          player2Score: 240,
          player3Score: 240,
          player8Score: 250,
          winnerIds: [playerId8],
          runnerUpIds: [playerId2, playerId3],
          game2LoserIds: [playerId1, playerId4, playerId6],
        },
      ])("$name", ({
        player1Score,
        player2Score,
        player3Score,
        player8Score,
        winnerIds,
        runnerUpIds,
        game2LoserIds,
      }) => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie both first-round matches feeding into match 4.
        setGameScore(tieGames, playerId1, 1, 210);
        setGameScore(tieGames, playerId2, 1, 210);
        setGameScore(tieGames, playerId3, 1, 205);
        setGameScore(tieGames, playerId4, 1, 205);

        // Three players tie for the highest score in match 4.
        // PlayerId4 loses in game 2.
        setGameScore(tieGames, playerId1, 2, 240);
        setGameScore(tieGames, playerId2, 2, 240);
        setGameScore(tieGames, playerId3, 2, 240);
        setGameScore(tieGames, playerId4, 2, 200);

        // Game 3 leaves two players from match 4 tied.
        // They share either first place or runner-up.
        setGameScore(tieGames, playerId1, 3, player1Score);
        setGameScore(tieGames, playerId2, 3, player2Score);
        setGameScore(tieGames, playerId3, 3, player3Score);
        setGameScore(tieGames, playerId8, 3, player8Score);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        // All four players from matches 0 and 1 advanced.
        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([playerId5, playerId7]),
        );

        // Includes the lowest game 3 scorer from the
        // three-player semifinal tie.
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set(game2LoserIds),
        );

        // Preserve all three players who tied in match 4.
        expect(tiesBracket.semiFinalTies).toEqual(
          new Set([playerId1, playerId2, playerId3]),
        );

        expect(tiesBracket.runnerUpIds).toEqual(new Set(runnerUpIds));
        expect(tiesBracket.winnerIds).toEqual(new Set(winnerIds));
      });
    }); 
    
    describe("matches 0 and 1 tied, followed by four players tied in match 4, followed by ties in match 6", () => {
      it.each([
        {
          name: "1) PlayerId1 = PlayerId2 > PlayerId8 > PlayerId3 = PlayerId4",
          player1Score: 250,
          player2Score: 250,
          player3Score: 220,
          player4Score: 220,
          player8Score: 240,
          winnerIds: [playerId1, playerId2],
          runnerUpIds: [playerId8],
          game2LoserIds: [playerId3, playerId4, playerId6],
        },
        {
          name: "2) PlayerId1 = PlayerId2 > PlayerId3 = PlayerId4 > PlayerId8",
          player1Score: 250,
          player2Score: 250,
          player3Score: 240,
          player4Score: 240,
          player8Score: 220,
          winnerIds: [playerId1, playerId2],
          runnerUpIds: [playerId8],
          game2LoserIds: [playerId3, playerId4, playerId6],
        },
        {
          name: "3) PlayerId1 = PlayerId2 = PlayerId3 > PlayerId8 > PlayerId4",
          player1Score: 250,
          player2Score: 250,
          player3Score: 250,
          player4Score: 220,
          player8Score: 240,
          winnerIds: [playerId1, playerId2, playerId3],
          runnerUpIds: [playerId8],
          game2LoserIds: [playerId4, playerId6],
        },
        {
          name: "4) PlayerId1 = PlayerId2 = PlayerId3 > PlayerId4 > PlayerId8",
          player1Score: 250,
          player2Score: 250,
          player3Score: 250,
          player4Score: 240,
          player8Score: 220,
          winnerIds: [playerId1, playerId2, playerId3],
          runnerUpIds: [playerId8],
          game2LoserIds: [playerId4, playerId6],
        },
        {
          name: "5) PlayerId8 > PlayerId1 = PlayerId2 > PlayerId3 = PlayerId4",
          player1Score: 240,
          player2Score: 240,
          player3Score: 220,
          player4Score: 220,
          player8Score: 250,
          winnerIds: [playerId8],
          runnerUpIds: [playerId1, playerId2],
          game2LoserIds: [playerId3, playerId4, playerId6],
        },
        {
          name: "6) PlayerId8 > PlayerId1 = PlayerId2 = PlayerId3 > PlayerId4",
          player1Score: 240,
          player2Score: 240,
          player3Score: 240,
          player4Score: 220,
          player8Score: 250,
          winnerIds: [playerId8],
          runnerUpIds: [playerId1, playerId2, playerId3],
          game2LoserIds: [playerId4, playerId6],
        },
        {
          name: "7) PlayerId1 = PlayerId2 = PlayerId3 = PlayerId4 > PlayerId8",
          player1Score: 250,
          player2Score: 250,
          player3Score: 250,
          player4Score: 250,
          player8Score: 240,
          winnerIds: [playerId1, playerId2, playerId3, playerId4],
          runnerUpIds: [playerId8],
          game2LoserIds: [playerId6],
        },
        {
          name: "8) PlayerId8 > PlayerId1 = PlayerId2 = PlayerId3 = PlayerId4",
          player1Score: 240,
          player2Score: 240,
          player3Score: 240,
          player4Score: 240,
          player8Score: 250,
          winnerIds: [playerId8],
          runnerUpIds: [playerId1, playerId2, playerId3, playerId4],
          game2LoserIds: [playerId6],
        },
      ])("$name", ({
        player1Score,
        player2Score,
        player3Score,
        player4Score,
        player8Score,
        winnerIds,
        runnerUpIds,
        game2LoserIds,
      }) => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie both first-round matches feeding into match 4.
        setGameScore(tieGames, playerId1, 1, 210);
        setGameScore(tieGames, playerId2, 1, 210);
        setGameScore(tieGames, playerId3, 1, 205);
        setGameScore(tieGames, playerId4, 1, 205);

        // All four players tie in match 4 and advance to match 6.
        setGameScore(tieGames, playerId1, 2, 240);
        setGameScore(tieGames, playerId2, 2, 240);
        setGameScore(tieGames, playerId3, 2, 240);
        setGameScore(tieGames, playerId4, 2, 240);

        // Game 3 resolves semifinal placements and determines
        // which players share the winner or runner-up position.
        setGameScore(tieGames, playerId1, 3, player1Score);
        setGameScore(tieGames, playerId2, 3, player2Score);
        setGameScore(tieGames, playerId3, 3, player3Score);
        setGameScore(tieGames, playerId4, 3, player4Score);
        setGameScore(tieGames, playerId8, 3, player8Score);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        // No player from matches 0 or 1 lost in game 1.
        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([playerId5, playerId7]),
        );

        // Includes players below the highest game 3 score
        // within the tied match 4 group.
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set(game2LoserIds),
        );

        // Preserve all four players who tied in match 4.
        expect(tiesBracket.semiFinalTies).toEqual(
          new Set([
            playerId1,
            playerId2,
            playerId3,
            playerId4,
          ]),
        );

        expect(tiesBracket.runnerUpIds).toEqual(
          new Set(runnerUpIds),
        );
        expect(tiesBracket.winnerIds).toEqual(
          new Set(winnerIds),
        );
      });
    });    

    describe('game 1 ties: matches 2 and 3 tie - 1 player wins match 5', () => { 

      it("PlayerId5 wins match 5 and advances to match 6", () => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie both first-round matches feeding into match 5.
        setGameScore(tieGames, playerId5, 1, 210);
        setGameScore(tieGames, playerId6, 1, 210);
        setGameScore(tieGames, playerId7, 1, 205);
        setGameScore(tieGames, playerId8, 1, 205);

        // PlayerId5 has the highest game 2 score in match 5.
        setGameScore(tieGames, playerId5, 2, 240);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([playerId1, playerId3]),
        );
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set([
            playerId4,
            playerId6,
            playerId7,
            playerId8,            
          ]),
        );
        expect(tiesBracket.semiFinalTies).toEqual(new Set());
        expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId2]));
        expect(tiesBracket.winnerIds).toEqual(new Set([playerId5]));
      });

      it("PlayerId6 wins match 4 and advances to match 6", () => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie both first-round matches feeding into match 5.
        setGameScore(tieGames, playerId5, 1, 210);
        setGameScore(tieGames, playerId6, 1, 210);
        setGameScore(tieGames, playerId7, 1, 205);
        setGameScore(tieGames, playerId8, 1, 205);

        // PlayerId6 has the highest game 2 score in match 5.
        setGameScore(tieGames, playerId6, 2, 240);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([playerId1, playerId3]),
        );
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set([
            playerId4,
            playerId5,
            playerId7,
            playerId8,            
          ]),
        );
        expect(tiesBracket.semiFinalTies).toEqual(new Set());
        expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId2]));
        expect(tiesBracket.winnerIds).toEqual(new Set([playerId6]));
      });

      it("PlayerId7 wins match 4 and advances to match 6", () => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie both first-round matches feeding into match 5.
        setGameScore(tieGames, playerId5, 1, 210);
        setGameScore(tieGames, playerId6, 1, 210);
        setGameScore(tieGames, playerId7, 1, 205);
        setGameScore(tieGames, playerId8, 1, 205);

        // PlayerId7 has the highest game 2 score in match 5.
        setGameScore(tieGames, playerId7, 2, 240);
        setGameScore(tieGames, playerId7, 3, 240); // to win match 6

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([playerId1, playerId3]),
        );
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set([
            playerId4,
            playerId5,
            playerId6,
            playerId8,            
          ]),
        );
        expect(tiesBracket.semiFinalTies).toEqual(new Set());
        expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId2]));
        expect(tiesBracket.winnerIds).toEqual(new Set([playerId7]));
      });

      it("PlayerId8 wins match 4 and advances to match 6", () => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie both first-round matches feeding into match 5.
        setGameScore(tieGames, playerId5, 1, 210);
        setGameScore(tieGames, playerId6, 1, 210);
        setGameScore(tieGames, playerId7, 1, 205);
        setGameScore(tieGames, playerId8, 1, 205);

        // PlayerId8 has the highest game 2 score in match 5.
        setGameScore(tieGames, playerId8, 2, 240);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([playerId1, playerId3]),
        );
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set([
            playerId4,
            playerId5,
            playerId6,
            playerId7,            
          ]),
        );
        expect(tiesBracket.semiFinalTies).toEqual(new Set());
        expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId2]));
        expect(tiesBracket.winnerIds).toEqual(new Set([playerId8]));
      });
    });     

    describe("matches 2 and 3 tied, followed by three players tied in match 5", () => {
      it.each([
        {
          name: "1) PlayerId5 wins; PlayerId2 is runner-up",
          player5Score: 250,
          player6Score: 220,
          player7Score: 220,
          player2Score: 240,
          winnerId: playerId5,
          runnerUpId: playerId2,
          game2LoserIds: [playerId4, playerId6, playerId7, playerId8],
        },
        {
          name: "2) PlayerId2 wins; PlayerId5 is runner-up",
          player5Score: 240,
          player6Score: 220,
          player7Score: 220,
          player2Score: 250,
          winnerId: playerId2,
          runnerUpId: playerId5,
          game2LoserIds: [playerId4, playerId6, playerId7, playerId8],
        },
        {
          name: "3) PlayerId6 wins; PlayerId2 is runner-up",
          player5Score: 220,
          player6Score: 250,
          player7Score: 220,
          player2Score: 240,
          winnerId: playerId6,
          runnerUpId: playerId2,
          game2LoserIds: [playerId4, playerId5, playerId7, playerId8],
        },
        {
          name: "4) PlayerId2 wins; PlayerId6 is runner-up",
          player5Score: 220,
          player6Score: 240,
          player7Score: 220,
          player2Score: 250,
          winnerId: playerId2,
          runnerUpId: playerId6,
          game2LoserIds: [playerId4, playerId5, playerId7, playerId8],
        },
        {
          name: "5) PlayerId7 wins; PlayerId2 is runner-up",
          player5Score: 220,
          player6Score: 220,
          player7Score: 250,
          player2Score: 240,
          winnerId: playerId7,
          runnerUpId: playerId2,
          game2LoserIds: [playerId4, playerId5, playerId6, playerId8],
        },
        {
          name: "6) PlayerId2 wins; PlayerId7 is runner-up",
          player5Score: 220,
          player6Score: 220,
          player7Score: 240,
          player2Score: 250,
          winnerId: playerId2,
          runnerUpId: playerId7,
          game2LoserIds: [playerId4, playerId5, playerId6, playerId8],
        },
      ])("$name", ({
        player5Score,
        player6Score,
        player7Score,
        player2Score,
        winnerId,
        runnerUpId,
        game2LoserIds,
      }) => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie both first-round matches feeding into match 5.
        setGameScore(tieGames, playerId5, 1, 210);
        setGameScore(tieGames, playerId6, 1, 210);
        setGameScore(tieGames, playerId7, 1, 205);
        setGameScore(tieGames, playerId8, 1, 205);

        // Three players tie for the highest score in match 5.
        // PlayerId8 loses in game 2.
        setGameScore(tieGames, playerId5, 2, 240);
        setGameScore(tieGames, playerId6, 2, 240);
        setGameScore(tieGames, playerId7, 2, 240);
        setGameScore(tieGames, playerId8, 2, 200);

        // Game 3 resolves the three-player semifinal tie
        // and determines the winner of match 6.
        setGameScore(tieGames, playerId5, 3, player5Score);
        setGameScore(tieGames, playerId6, 3, player6Score);
        setGameScore(tieGames, playerId7, 3, player7Score);
        setGameScore(tieGames, playerId2, 3, player2Score);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        // All four players from matches 2 and 3 advanced.
        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([playerId1, playerId3]),
        );

        // Includes both players who lose the semifinal
        // tiebreak using their game 3 scores.
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set(game2LoserIds),
        );

        // Preserve all three players who tied in match 5.
        expect(tiesBracket.semiFinalTies).toEqual(
          new Set([playerId5, playerId6, playerId7]),
        );

        expect(tiesBracket.runnerUpIds).toEqual(
          new Set([runnerUpId]),
        );
        expect(tiesBracket.winnerIds).toEqual(
          new Set([winnerId]),
        );
      });
    });

    describe("matches 2 and 3 tied, followed by three players tied in match 5, followed by a tie in match 6", () => {
      it.each([
        {
          name: "PlayerId5 = PlayerId6 > PlayerId2 > PlayerId7",
          player5Score: 250,
          player6Score: 250,
          player7Score: 220,
          player2Score: 240,
          winnerIds: [playerId5, playerId6],
          runnerUpIds: [playerId2],
          game2LoserIds: [playerId4, playerId7, playerId8],
        },
        {
          name: "PlayerId5 = PlayerId6 > PlayerId7 > PlayerId2",
          player5Score: 250,
          player6Score: 250,
          player7Score: 240,
          player2Score: 220,
          winnerIds: [playerId5, playerId6],
          runnerUpIds: [playerId2],
          game2LoserIds: [playerId4, playerId7, playerId8],
        },
        {
          name: "PlayerId2 > PlayerId5 = PlayerId6 > PlayerId7",
          player5Score: 240,
          player6Score: 240,
          player7Score: 220,
          player2Score: 250,
          winnerIds: [playerId2],
          runnerUpIds: [playerId5, playerId6],
          game2LoserIds: [playerId4, playerId7, playerId8],
        },
        {
          name: "PlayerId6 = PlayerId7 > PlayerId2 > PlayerId5",
          player5Score: 220,
          player6Score: 250,
          player7Score: 250,
          player2Score: 240,
          winnerIds: [playerId6, playerId7],
          runnerUpIds: [playerId2],
          game2LoserIds: [playerId4, playerId5, playerId8],
        },
        {
          name: "PlayerId6 = PlayerId7 > PlayerId5 > PlayerId2",
          player5Score: 240,
          player6Score: 250,
          player7Score: 250,
          player2Score: 220,
          winnerIds: [playerId6, playerId7],
          runnerUpIds: [playerId2],
          game2LoserIds: [playerId4, playerId5, playerId8],
        },
        {
          name: "PlayerId2 > PlayerId6 = PlayerId7 > PlayerId5",
          player5Score: 220,
          player6Score: 240,
          player7Score: 240,
          player2Score: 250,
          winnerIds: [playerId2],
          runnerUpIds: [playerId6, playerId7],
          game2LoserIds: [playerId4, playerId5, playerId8],
        },
      ])("$name", ({
        player5Score,
        player6Score,
        player7Score,
        player2Score,
        winnerIds,
        runnerUpIds,
        game2LoserIds,
      }) => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie both first-round matches feeding into match 5.
        setGameScore(tieGames, playerId5, 1, 210);
        setGameScore(tieGames, playerId6, 1, 210);
        setGameScore(tieGames, playerId7, 1, 205);
        setGameScore(tieGames, playerId8, 1, 205);

        // Three players tie for the highest score in match 5.
        // PlayerId8 loses in game 2.
        setGameScore(tieGames, playerId5, 2, 240);
        setGameScore(tieGames, playerId6, 2, 240);
        setGameScore(tieGames, playerId7, 2, 240);
        setGameScore(tieGames, playerId8, 2, 200);

        // Game 3 leaves two players from match 5 tied.
        // They share either first place or runner-up.
        setGameScore(tieGames, playerId5, 3, player5Score);
        setGameScore(tieGames, playerId6, 3, player6Score);
        setGameScore(tieGames, playerId7, 3, player7Score);
        setGameScore(tieGames, playerId2, 3, player2Score);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        // All four players from matches 2 and 3 advanced.
        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([playerId1, playerId3]),
        );

        // Includes the lowest game 3 scorer from the
        // three-player semifinal tie.
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set(game2LoserIds),
        );

        // Preserve all three players who tied in match 5.
        expect(tiesBracket.semiFinalTies).toEqual(
          new Set([playerId5, playerId6, playerId7]),
        );

        expect(tiesBracket.runnerUpIds).toEqual(
          new Set(runnerUpIds),
        );
        expect(tiesBracket.winnerIds).toEqual(
          new Set(winnerIds),
        );
      });
    });

    describe("matches 2 and 3 tied, followed by four players tied in match 5, followed by ties in match 6", () => {
      it.each([
        {
          name: "1) PlayerId5 = PlayerId6 > PlayerId2 > PlayerId7 = PlayerId8",
          player5Score: 250,
          player6Score: 250,
          player7Score: 220,
          player8Score: 220,
          player2Score: 240,
          winnerIds: [playerId5, playerId6],
          runnerUpIds: [playerId2],
          game2LoserIds: [playerId4, playerId7, playerId8],
        },
        {
          name: "2) PlayerId5 = PlayerId6 > PlayerId7 = PlayerId8 > PlayerId2",
          player5Score: 250,
          player6Score: 250,
          player7Score: 240,
          player8Score: 240,
          player2Score: 220,
          winnerIds: [playerId5, playerId6],
          runnerUpIds: [playerId2],
          game2LoserIds: [playerId4, playerId7, playerId8],
        },
        {
          name: "3) PlayerId5 = PlayerId6 = PlayerId7 > PlayerId2 > PlayerId8",
          player5Score: 250,
          player6Score: 250,
          player7Score: 250,
          player8Score: 220,
          player2Score: 240,
          winnerIds: [playerId5, playerId6, playerId7],
          runnerUpIds: [playerId2],
          game2LoserIds: [playerId4, playerId8],
        },
        {
          name: "4) PlayerId5 = PlayerId6 = PlayerId7 > PlayerId8 > PlayerId2",
          player5Score: 250,
          player6Score: 250,
          player7Score: 250,
          player8Score: 240,
          player2Score: 220,
          winnerIds: [playerId5, playerId6, playerId7],
          runnerUpIds: [playerId2],
          game2LoserIds: [playerId4, playerId8],
        },
        {
          name: "5) PlayerId2 > PlayerId5 = PlayerId6 > PlayerId7 = PlayerId8",
          player5Score: 240,
          player6Score: 240,
          player7Score: 220,
          player8Score: 220,
          player2Score: 250,
          winnerIds: [playerId2],
          runnerUpIds: [playerId5, playerId6],
          game2LoserIds: [playerId4, playerId7, playerId8],
        },
        {
          name: "6) PlayerId2 > PlayerId5 = PlayerId6 = PlayerId7 > PlayerId8",
          player5Score: 240,
          player6Score: 240,
          player7Score: 240,
          player8Score: 220,
          player2Score: 250,
          winnerIds: [playerId2],
          runnerUpIds: [playerId5, playerId6, playerId7],
          game2LoserIds: [playerId4, playerId8],
        },
        {
          name: "7) PlayerId5 = PlayerId6 = PlayerId7 = PlayerId8 > PlayerId2",
          player5Score: 250,
          player6Score: 250,
          player7Score: 250,
          player8Score: 250,
          player2Score: 240,
          winnerIds: [playerId5, playerId6, playerId7, playerId8],
          runnerUpIds: [playerId2],
          game2LoserIds: [playerId4],
        },
        {
          name: "8) PlayerId2 > PlayerId5 = PlayerId6 = PlayerId7 = PlayerId8",
          player5Score: 240,
          player6Score: 240,
          player7Score: 240,
          player8Score: 240,
          player2Score: 250,
          winnerIds: [playerId2],
          runnerUpIds: [playerId5, playerId6, playerId7, playerId8],
          game2LoserIds: [playerId4],
        },
      ])("$name", ({
        player5Score,
        player6Score,
        player7Score,
        player8Score,
        player2Score,
        winnerIds,
        runnerUpIds,
        game2LoserIds,
      }) => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie both first-round matches feeding into match 5.
        setGameScore(tieGames, playerId5, 1, 210);
        setGameScore(tieGames, playerId6, 1, 210);
        setGameScore(tieGames, playerId7, 1, 205);
        setGameScore(tieGames, playerId8, 1, 205);

        // All four players tie in match 5 and advance to match 6.
        setGameScore(tieGames, playerId5, 2, 240);
        setGameScore(tieGames, playerId6, 2, 240);
        setGameScore(tieGames, playerId7, 2, 240);
        setGameScore(tieGames, playerId8, 2, 240);

        // Game 3 resolves semifinal placements and determines
        // which players share the winner or runner-up position.
        setGameScore(tieGames, playerId5, 3, player5Score);
        setGameScore(tieGames, playerId6, 3, player6Score);
        setGameScore(tieGames, playerId7, 3, player7Score);
        setGameScore(tieGames, playerId8, 3, player8Score);
        setGameScore(tieGames, playerId2, 3, player2Score);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        // No player from matches 2 or 3 lost in game 1.
        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([playerId1, playerId3]),
        );

        // Includes players below the highest game 3 score
        // within the tied match 5 group.
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set(game2LoserIds),
        );

        // Preserve all four players who tied in match 5.
        expect(tiesBracket.semiFinalTies).toEqual(
          new Set([
            playerId5,
            playerId6,
            playerId7,
            playerId8,
          ]),
        );

        expect(tiesBracket.runnerUpIds).toEqual(
          new Set(runnerUpIds),
        );
        expect(tiesBracket.winnerIds).toEqual(
          new Set(winnerIds),
        );
      });
    });

    describe("game 2 ties", () => {
      
      describe("match 4 ties", () => {
        it("PlayerId2 wins match 6 after tying PlayerId4 in match 4", () => {
          const tieGames = cloneDeep(squadGamesThrough(3));

          // Tie match 4 so both players advance to the final.
          setGameScore(tieGames, playerId2, 2, 211);
          setGameScore(tieGames, playerId4, 2, 211);

          // Game 3: PlayerId2 > PlayerId8 > PlayerId4.
          setGameScore(tieGames, playerId2, 3, 240);
          setGameScore(tieGames, playerId4, 3, 220);
          setGameScore(tieGames, playerId8, 3, 230);

          createTiesBrktList(tieGames);
          tiesBracket.updateMatches();

          expect(tiesBracket.loserBrktGame1Ids).toEqual(
            new Set([
              playerId1,
              playerId3,
              playerId5,
              playerId7,
            ]),
          );

          // PlayerId4 loses the semifinal tiebreak using game 3.
          expect(tiesBracket.loserBrktGame2Ids).toEqual(
            new Set([playerId4, playerId6]),
          );
          expect(tiesBracket.semiFinalTies).toEqual(
            new Set([playerId2, playerId4]),
          );
          expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId8]));
          expect(tiesBracket.winnerIds).toEqual(new Set([playerId2]));
        });

        it("PlayerId4 wins match 6 after tying PlayerId2 in match 4", () => {
          const tieGames = cloneDeep(squadGamesThrough(3));

          // Tie match 4 so both players advance to the final.
          setGameScore(tieGames, playerId2, 2, 211);
          setGameScore(tieGames, playerId4, 2, 211);

          // Game 3: PlayerId4 > PlayerId8 > PlayerId2.
          setGameScore(tieGames, playerId2, 3, 220);
          setGameScore(tieGames, playerId4, 3, 240);
          setGameScore(tieGames, playerId8, 3, 230);

          createTiesBrktList(tieGames);
          tiesBracket.updateMatches();

          expect(tiesBracket.loserBrktGame1Ids).toEqual(
            new Set([
              playerId1,
              playerId3,
              playerId5,
              playerId7,
            ]),
          );

          // PlayerId2 loses the semifinal tiebreak using game 3.
          expect(tiesBracket.loserBrktGame2Ids).toEqual(
            new Set([playerId2, playerId6]),
          );
          expect(tiesBracket.semiFinalTies).toEqual(
            new Set([playerId2, playerId4]),
          );
          expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId8]));
          expect(tiesBracket.winnerIds).toEqual(new Set([playerId4]));
        });

        it("PlayerId8 wins match 6 and PlayerId2 is runner-up when PlayerId8 > PlayerId2 > PlayerId4", () => {
          const tieGames = cloneDeep(squadGamesThrough(3));

          // Tie match 4 so both players advance to the final.
          setGameScore(tieGames, playerId2, 2, 211);
          setGameScore(tieGames, playerId4, 2, 211);

          // Game 3: PlayerId8 > PlayerId2 > PlayerId4.
          setGameScore(tieGames, playerId2, 3, 230);
          setGameScore(tieGames, playerId4, 3, 220);
          setGameScore(tieGames, playerId8, 3, 240);

          createTiesBrktList(tieGames);
          tiesBracket.updateMatches();

          expect(tiesBracket.loserBrktGame1Ids).toEqual(
            new Set([
              playerId1,
              playerId3,
              playerId5,
              playerId7,
            ]),
          );

          // PlayerId2 wins the semifinal tiebreak but loses the final.
          expect(tiesBracket.loserBrktGame2Ids).toEqual(
            new Set([playerId4, playerId6]),
          );
          expect(tiesBracket.semiFinalTies).toEqual(
            new Set([playerId2, playerId4]),
          );
          expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId2]));
          expect(tiesBracket.winnerIds).toEqual(new Set([playerId8]));
        });

        it("PlayerId8 wins match 6 and PlayerId4 is runner-up when PlayerId8 > PlayerId4 > PlayerId2", () => {
          const tieGames = cloneDeep(squadGamesThrough(3));

          // Tie match 4 so both players advance to the final.
          setGameScore(tieGames, playerId2, 2, 211);
          setGameScore(tieGames, playerId4, 2, 211);

          // Game 3: PlayerId8 > PlayerId4 > PlayerId2.
          setGameScore(tieGames, playerId2, 3, 220);
          setGameScore(tieGames, playerId4, 3, 230);
          setGameScore(tieGames, playerId8, 3, 240);

          createTiesBrktList(tieGames);
          tiesBracket.updateMatches();

          expect(tiesBracket.loserBrktGame1Ids).toEqual(
            new Set([
              playerId1,
              playerId3,
              playerId5,
              playerId7,
            ]),
          );

          // PlayerId4 wins the semifinal tiebreak but loses the final.
          expect(tiesBracket.loserBrktGame2Ids).toEqual(
            new Set([playerId2, playerId6]),
          );
          expect(tiesBracket.semiFinalTies).toEqual(
            new Set([playerId2, playerId4]),
          );
          expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId4]));
          expect(tiesBracket.winnerIds).toEqual(new Set([playerId8]));
        });
      });

      describe("match 5 ties", () => {
        it("PlayerId6 wins match 6 after tying PlayerId8 in match 5", () => {
          const tieGames = cloneDeep(squadGamesThrough(3));

          // Tie match 5 so both players advance to the final.
          setGameScore(tieGames, playerId6, 2, 231);
          setGameScore(tieGames, playerId8, 2, 231);

          // Game 3: PlayerId6 > PlayerId2 > PlayerId8.
          setGameScore(tieGames, playerId6, 3, 240);
          setGameScore(tieGames, playerId2, 3, 230);
          setGameScore(tieGames, playerId8, 3, 220);

          createTiesBrktList(tieGames);
          tiesBracket.updateMatches();

          expect(tiesBracket.loserBrktGame1Ids).toEqual(
            new Set([
              playerId1,
              playerId3,
              playerId5,
              playerId7,
            ]),
          );

          // PlayerId8 loses the semifinal tiebreak using game 3.
          expect(tiesBracket.loserBrktGame2Ids).toEqual(
            new Set([playerId4, playerId8]),
          );
          expect(tiesBracket.semiFinalTies).toEqual(
            new Set([playerId6, playerId8]),
          );
          expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId2]));
          expect(tiesBracket.winnerIds).toEqual(new Set([playerId6]));
        });

        it("PlayerId8 wins match 6 after tying PlayerId6 in match 5", () => {
          const tieGames = cloneDeep(squadGamesThrough(3));

          // Tie match 5 so both players advance to the final.
          setGameScore(tieGames, playerId6, 2, 231);
          setGameScore(tieGames, playerId8, 2, 231);

          // Game 3: PlayerId8 > PlayerId2 > PlayerId6.
          setGameScore(tieGames, playerId8, 3, 240);
          setGameScore(tieGames, playerId2, 3, 230);
          setGameScore(tieGames, playerId6, 3, 220);

          createTiesBrktList(tieGames);
          tiesBracket.updateMatches();

          expect(tiesBracket.loserBrktGame1Ids).toEqual(
            new Set([
              playerId1,
              playerId3,
              playerId5,
              playerId7,
            ]),
          );

          // PlayerId6 loses the semifinal tiebreak using game 3.
          expect(tiesBracket.loserBrktGame2Ids).toEqual(
            new Set([playerId4, playerId6]),
          );
          expect(tiesBracket.semiFinalTies).toEqual(
            new Set([playerId6, playerId8]),
          );
          expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId2]));
          expect(tiesBracket.winnerIds).toEqual(new Set([playerId8]));
        });

        it("PlayerId2 wins match 6 and PlayerId6 is runner-up when PlayerId2 > PlayerId6 > PlayerId8", () => {
          const tieGames = cloneDeep(squadGamesThrough(3));

          // Tie match 5 so both players advance to the final.
          setGameScore(tieGames, playerId6, 2, 231);
          setGameScore(tieGames, playerId8, 2, 231);

          // Game 3: PlayerId2 > PlayerId6 > PlayerId8.
          setGameScore(tieGames, playerId2, 3, 240);
          setGameScore(tieGames, playerId6, 3, 230);
          setGameScore(tieGames, playerId8, 3, 220);

          createTiesBrktList(tieGames);
          tiesBracket.updateMatches();

          expect(tiesBracket.loserBrktGame1Ids).toEqual(
            new Set([
              playerId1,
              playerId3,
              playerId5,
              playerId7,
            ]),
          );

          // PlayerId6 wins the semifinal tiebreak but loses the final.
          expect(tiesBracket.loserBrktGame2Ids).toEqual(
            new Set([playerId4, playerId8]),
          );
          expect(tiesBracket.semiFinalTies).toEqual(
            new Set([playerId6, playerId8]),
          );
          expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId6]));
          expect(tiesBracket.winnerIds).toEqual(new Set([playerId2]));
        });

        it("PlayerId2 wins match 6 and PlayerId8 is runner-up when PlayerId2 > PlayerId8 > PlayerId6", () => {
          const tieGames = cloneDeep(squadGamesThrough(3));

          // Tie match 5 so both players advance to the final.
          setGameScore(tieGames, playerId6, 2, 231);
          setGameScore(tieGames, playerId8, 2, 231);

          // Game 3: PlayerId2 > PlayerId8 > PlayerId6.
          setGameScore(tieGames, playerId2, 3, 240);
          setGameScore(tieGames, playerId8, 3, 230);
          setGameScore(tieGames, playerId6, 3, 220);

          createTiesBrktList(tieGames);
          tiesBracket.updateMatches();

          expect(tiesBracket.loserBrktGame1Ids).toEqual(
            new Set([
              playerId1,
              playerId3,
              playerId5,
              playerId7,
            ]),
          );

          // PlayerId8 wins the semifinal tiebreak but loses the final.
          expect(tiesBracket.loserBrktGame2Ids).toEqual(
            new Set([playerId4, playerId6]),
          );
          expect(tiesBracket.semiFinalTies).toEqual(
            new Set([playerId6, playerId8]),
          );
          expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId8]));
          expect(tiesBracket.winnerIds).toEqual(new Set([playerId2]));
        });
      });      
    });

    describe("game 3 ties", () => { 

      it("PlayerId2 and PlayerId8 tie match 6", () => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie match 6 so both players win.
        setGameScore(tieGames, playerId2, 3, 235);
        setGameScore(tieGames, playerId8, 3, 235);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([
            playerId1,
            playerId3,
            playerId5,
            playerId7,
          ]),
        );

        // PlayerId4 loses the semifinal tiebreak using game 3.
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set([playerId4, playerId6]),
        );
        expect(tiesBracket.semiFinalTies).toEqual(new Set([]));
        expect(tiesBracket.runnerUpIds).toEqual(new Set([]));
        expect(tiesBracket.winnerIds).toEqual(
          new Set([playerId2, playerId8]),
        );
      });

      it("PlayerId2 and PlayerId4 tie in match 4, and all players tie PlayerId8 in match 6", () => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie match 4 so both players advance to the final.
        setGameScore(tieGames, playerId2, 2, 220);
        setGameScore(tieGames, playerId4, 2, 220);

        setGameScore(tieGames, playerId2, 3, 235);
        setGameScore(tieGames, playerId4, 3, 235);
        setGameScore(tieGames, playerId8, 3, 235);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([
            playerId1,
            playerId3,
            playerId5,
            playerId7,
          ]),
        );

        // PlayerId4 loses the semifinal tiebreak using game 3.
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set([playerId6]),
        );
        expect(tiesBracket.semiFinalTies).toEqual(new Set([playerId2, playerId4]));
        expect(tiesBracket.runnerUpIds).toEqual(new Set([]));
        expect(tiesBracket.winnerIds).toEqual(
          new Set([playerId2, playerId4, playerId8]),
        );
      });

      it("PlayerId2 and PlayerId4 tie in match 4, PlayerId8 win in match 6, PlayerId2 runner up", () => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie match 4 so both players advance to the final.
        setGameScore(tieGames, playerId2, 2, 220);
        setGameScore(tieGames, playerId4, 2, 220);

        setGameScore(tieGames, playerId2, 3, 230);
        setGameScore(tieGames, playerId4, 3, 210);
        setGameScore(tieGames, playerId8, 3, 235);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([
            playerId1,
            playerId3,
            playerId5,
            playerId7,
          ]),
        );

        // PlayerId4 loses the semifinal tiebreak using game 3.
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set([playerId4, playerId6]),
        );
        expect(tiesBracket.semiFinalTies).toEqual(new Set([playerId2, playerId4]));
        expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId2]));
        expect(tiesBracket.winnerIds).toEqual(new Set([playerId8]));
      });

      it("PlayerId2 and PlayerId4 tie in match 4, PlayerId2 win in match 6, PlayerId8 runner up", () => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie match 4 so both players advance to the final.
        setGameScore(tieGames, playerId2, 2, 220);
        setGameScore(tieGames, playerId4, 2, 220);

        setGameScore(tieGames, playerId2, 3, 240);
        setGameScore(tieGames, playerId4, 3, 239);
        setGameScore(tieGames, playerId8, 3, 235);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([
            playerId1,
            playerId3,
            playerId5,
            playerId7,
          ]),
        );

        // PlayerId4 loses the semifinal tiebreak using game 3.
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set([playerId4, playerId6]),
        );
        expect(tiesBracket.semiFinalTies).toEqual(new Set([playerId2, playerId4]));
        expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId8]));
        expect(tiesBracket.winnerIds).toEqual(new Set([playerId2]));
      });

      it("PlayerId6 and PlayerId8 tie in match 5, and all players tie PlayerId2 in match 6", () => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie match 4 so both players advance to the final.
        setGameScore(tieGames, playerId6, 2, 220);
        setGameScore(tieGames, playerId8, 2, 220);

        setGameScore(tieGames, playerId2, 3, 235);
        setGameScore(tieGames, playerId6, 3, 235);
        setGameScore(tieGames, playerId8, 3, 235);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([
            playerId1,
            playerId3,
            playerId5,
            playerId7,
          ]),
        );

        // PlayerId4 loses the semifinal tiebreak using game 3.
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set([playerId4]),
        );
        expect(tiesBracket.semiFinalTies).toEqual(new Set([playerId6, playerId8]));
        expect(tiesBracket.runnerUpIds).toEqual(new Set([]));
        expect(tiesBracket.winnerIds).toEqual(
          new Set([playerId2, playerId6, playerId8]),
        );
      });

      it("PlayerId6 and PlayerId8 tie in match 4, PlayerId2 win in match 6, PlayerId8 runner up", () => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie match 4 so both players advance to the final.
        setGameScore(tieGames, playerId6, 2, 220);
        setGameScore(tieGames, playerId8, 2, 220);

        setGameScore(tieGames, playerId2, 3, 240);
        setGameScore(tieGames, playerId6, 3, 223);
        setGameScore(tieGames, playerId8, 3, 235);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([
            playerId1,
            playerId3,
            playerId5,
            playerId7,
          ]),
        );

        // PlayerId4 loses the semifinal tiebreak using game 3.
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set([playerId4, playerId6]),
        );
        expect(tiesBracket.semiFinalTies).toEqual(new Set([playerId6, playerId8]));
        expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId8]));
        expect(tiesBracket.winnerIds).toEqual(new Set([playerId2]));
      });

      it("PlayerId6 and PlayerId8 tie in match 4, PlayerId8 win in match 6, PlayerId2 runner up", () => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        // Tie match 4 so both players advance to the final.
        setGameScore(tieGames, playerId6, 2, 220);
        setGameScore(tieGames, playerId8, 2, 220);

        setGameScore(tieGames, playerId2, 3, 230);
        setGameScore(tieGames, playerId6, 3, 223);
        setGameScore(tieGames, playerId8, 3, 235);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        expect(tiesBracket.loserBrktGame1Ids).toEqual(
          new Set([
            playerId1,
            playerId3,
            playerId5,
            playerId7,
          ]),
        );

        // PlayerId4 loses the semifinal tiebreak using game 3.
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set([playerId4, playerId6]),
        );
        expect(tiesBracket.semiFinalTies).toEqual(new Set([playerId6, playerId8]));
        expect(tiesBracket.runnerUpIds).toEqual(new Set([playerId2]));
        expect(tiesBracket.winnerIds).toEqual(new Set([playerId8]));
      });

      it("Every match is a tie", () => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        setGameScore(tieGames, playerId1, 1, 210);
        setGameScore(tieGames, playerId2, 1, 210);
        setGameScore(tieGames, playerId3, 1, 210);
        setGameScore(tieGames, playerId4, 1, 210);
        setGameScore(tieGames, playerId5, 1, 210);
        setGameScore(tieGames, playerId6, 1, 210);
        setGameScore(tieGames, playerId7, 1, 210);
        setGameScore(tieGames, playerId8, 1, 210);

        setGameScore(tieGames, playerId1, 2, 220);
        setGameScore(tieGames, playerId2, 2, 220);
        setGameScore(tieGames, playerId3, 2, 220);
        setGameScore(tieGames, playerId4, 2, 220);
        setGameScore(tieGames, playerId5, 2, 220);
        setGameScore(tieGames, playerId6, 2, 220);
        setGameScore(tieGames, playerId7, 2, 220);
        setGameScore(tieGames, playerId8, 2, 220);

        setGameScore(tieGames, playerId1, 3, 230);
        setGameScore(tieGames, playerId2, 3, 230);
        setGameScore(tieGames, playerId3, 3, 230);
        setGameScore(tieGames, playerId4, 3, 230);
        setGameScore(tieGames, playerId5, 3, 230);
        setGameScore(tieGames, playerId6, 3, 230);
        setGameScore(tieGames, playerId7, 3, 230);
        setGameScore(tieGames, playerId8, 3, 230);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        expect(tiesBracket.loserBrktGame1Ids).toEqual(new Set([]));
        expect(tiesBracket.loserBrktGame2Ids).toEqual(new Set([]));
        expect(tiesBracket.semiFinalTies).toEqual(
          new Set([
            playerId1,
            playerId2,
            playerId3,
            playerId4,
            playerId5,
            playerId6,
            playerId7,
            playerId8
          ]),
        );
        expect(tiesBracket.runnerUpIds).toEqual(new Set([]));
        expect(tiesBracket.winnerIds).toEqual(
          new Set([
            playerId1,
            playerId2,
            playerId3,
            playerId4,
            playerId5,
            playerId6,
            playerId7,
            playerId8
          ]),
        );
      });

      it("Every match is a tie, until PlayerId1 has high game game 3", () => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        setGameScore(tieGames, playerId1, 1, 210);
        setGameScore(tieGames, playerId2, 1, 210);
        setGameScore(tieGames, playerId3, 1, 210);
        setGameScore(tieGames, playerId4, 1, 210);
        setGameScore(tieGames, playerId5, 1, 210);
        setGameScore(tieGames, playerId6, 1, 210);
        setGameScore(tieGames, playerId7, 1, 210);
        setGameScore(tieGames, playerId8, 1, 210);

        setGameScore(tieGames, playerId1, 2, 220);
        setGameScore(tieGames, playerId2, 2, 220);
        setGameScore(tieGames, playerId3, 2, 220);
        setGameScore(tieGames, playerId4, 2, 220);
        setGameScore(tieGames, playerId5, 2, 220);
        setGameScore(tieGames, playerId6, 2, 220);
        setGameScore(tieGames, playerId7, 2, 220);
        setGameScore(tieGames, playerId8, 2, 220);

        setGameScore(tieGames, playerId1, 3, 240);
        setGameScore(tieGames, playerId2, 3, 230);
        setGameScore(tieGames, playerId3, 3, 230);
        setGameScore(tieGames, playerId4, 3, 230);
        setGameScore(tieGames, playerId5, 3, 230);
        setGameScore(tieGames, playerId6, 3, 230);
        setGameScore(tieGames, playerId7, 3, 230);
        setGameScore(tieGames, playerId8, 3, 230);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        expect(tiesBracket.loserBrktGame1Ids).toEqual(new Set([]));
        expect(tiesBracket.loserBrktGame2Ids).toEqual(
          new Set([
            playerId2,
            playerId3,
            playerId4,
          ])
        );
        expect(tiesBracket.semiFinalTies).toEqual(
          new Set([
            playerId1,
            playerId2,
            playerId3,
            playerId4,
            playerId5,
            playerId6,
            playerId7,
            playerId8
          ]),
        );
        expect(tiesBracket.runnerUpIds).toEqual(
          new Set([
            playerId5,
            playerId6,
            playerId7,
            playerId8
          ])
        );
        expect(tiesBracket.winnerIds).toEqual(new Set([playerId1]));
      });

      it("Every match is a tie, until PlayerId1 has low game game 3", () => {
        const tieGames = cloneDeep(squadGamesThrough(3));

        setGameScore(tieGames, playerId1, 1, 210);
        setGameScore(tieGames, playerId2, 1, 210);
        setGameScore(tieGames, playerId3, 1, 210);
        setGameScore(tieGames, playerId4, 1, 210);
        setGameScore(tieGames, playerId5, 1, 210);
        setGameScore(tieGames, playerId6, 1, 210);
        setGameScore(tieGames, playerId7, 1, 210);
        setGameScore(tieGames, playerId8, 1, 210);

        setGameScore(tieGames, playerId1, 2, 220);
        setGameScore(tieGames, playerId2, 2, 220);
        setGameScore(tieGames, playerId3, 2, 220);
        setGameScore(tieGames, playerId4, 2, 220);
        setGameScore(tieGames, playerId5, 2, 220);
        setGameScore(tieGames, playerId6, 2, 220);
        setGameScore(tieGames, playerId7, 2, 220);
        setGameScore(tieGames, playerId8, 2, 220);

        setGameScore(tieGames, playerId1, 3, 200);
        setGameScore(tieGames, playerId2, 3, 230);
        setGameScore(tieGames, playerId3, 3, 230);
        setGameScore(tieGames, playerId4, 3, 230);
        setGameScore(tieGames, playerId5, 3, 230);
        setGameScore(tieGames, playerId6, 3, 230);
        setGameScore(tieGames, playerId7, 3, 230);
        setGameScore(tieGames, playerId8, 3, 230);

        createTiesBrktList(tieGames);
        tiesBracket.updateMatches();

        expect(tiesBracket.loserBrktGame1Ids).toEqual(new Set([]));
        expect(tiesBracket.loserBrktGame2Ids).toEqual(new Set([playerId1]));        
        expect(tiesBracket.semiFinalTies).toEqual(
          new Set([
            playerId1,
            playerId2,
            playerId3,
            playerId4,
            playerId5,
            playerId6,
            playerId7,
            playerId8
          ]),
        );
        expect(tiesBracket.runnerUpIds).toEqual(new Set([]));
        expect(tiesBracket.winnerIds).toEqual(
          new Set([          
            playerId2,
            playerId3,
            playerId4,
            playerId5,
            playerId6,
            playerId7,
            playerId8
          ]),
        );
      });

    });
  });

});