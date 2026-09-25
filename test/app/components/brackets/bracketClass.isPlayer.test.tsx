import {
  Bracket,
} from "@/components/brackets/bracketClass";
import {
  BracketList,
  brktListInitialDataType,
} from "@/components/brackets/bracketListClass";
import {
  brktId1,
  byeId,
  divId1,
  mockGames,
  mockTmntFullData,
  playerId1,
  playerId2,
  playerId4,
  playerId8,
  squadId1,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import type {
  gameType,
  playerType,
} from "@/lib/types/types";
import { initPlayer } from "@/lib/db/initVals";
import { cloneDeep } from "lodash";

describe("Bracket.isPlayer", () => {
  let brktList: BracketList;
  let bracket: Bracket;

  const byePlayer: playerType = {
    ...initPlayer,
    id: byeId,
    squad_id: squadId1,
    first_name: "Bye",
    average: 0,
  };

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
  };

  /**
   * Creates game data through the requested squad game number.
   */
  const squadGamesThrough = (
    lastSquadGameNum: number,
  ): gameType[] => {
    return mockGames.filter((game) => game.game_num <= lastSquadGameNum);
  };

  /**
   * Sets the score for one player's squad game.
   */
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

  describe("isPlayerAlive", () => {
    it("returns false when player is not in bracket", () => {
      setup([]);

      expect(bracket.isPlayerAlive("ply_not_in_bracket")).toBe(false);
    });

    it("returns true when player is still alive in bracket", () => {
      setup([]);

      /*
       * No games have been calculated, so player 2
       * is in the bracket and has not lost.
       */
      expect(bracket.isPlayerAlive(playerId2)).toBe(true);
    });

    it("returns false when player loses game 1", () => {
      setup(squadGamesThrough(1));

      bracket.updateMatches();

      /*
      * Game 1:
      *
      * player 1 vs player 2 -> player 2 wins.
      *
      * Player 1 should be recorded as a game-1 loser.
      */
      expect(bracket.isPlayerAlive(playerId1)).toBe(false);
      expect(bracket.loserBrktGame1Ids.has(playerId1)).toBe(true);
      expect(bracket.loserBrktGame2Ids.has(playerId1)).toBe(false);
    });

    it("returns false when player loses game 2", () => {
      setup(squadGamesThrough(2));

      bracket.updateMatches();

      /*
      * Game 2:
      *
      * player 2 vs player 4 -> player 2 wins.
      *
      * Player 4 should be recorded as a game-2 loser.
      */
      expect(bracket.isPlayerAlive(playerId4)).toBe(false);
      expect(bracket.loserBrktGame1Ids.has(playerId4)).toBe(false);
      expect(bracket.loserBrktGame2Ids.has(playerId4)).toBe(true);
    });

    it("returns true when player is runner-up", () => {
      setup(squadGamesThrough(3));

      bracket.updateMatches();

      /*
       * Normal bracket result:
       *
       * player 8 = winner
       * player 2 = runner-up
       */
      expect(bracket.isPlayerAlive(playerId2)).toBe(true);
    });

    it("returns true when player is winner", () => {
      setup(squadGamesThrough(3));

      bracket.updateMatches();

      expect(bracket.isPlayerAlive(playerId8)).toBe(true);
    });

    it("returns true for both players when they tie - game 1 match 0", () => {
      const tieGames = cloneDeep(squadGamesThrough(1));

      setGameScore(tieGames, playerId1, 1, 226);
      setGameScore(tieGames, playerId2, 1, 226);

      setup(tieGames);

      bracket.updateMatches();
      expect(bracket.isPlayerAlive(playerId1)).toBe(true);
      expect(bracket.isPlayerAlive(playerId2)).toBe(true);
    });

    it("returns true for both players when they tie - game 2 match 4", () => {
      const tieGames = cloneDeep(squadGamesThrough(2));

      setGameScore(tieGames, playerId2, 2, 227);
      setGameScore(tieGames, playerId4, 2, 227);

      setup(tieGames);

      bracket.updateMatches();
      expect(bracket.isPlayerAlive(playerId2)).toBe(true);
      expect(bracket.isPlayerAlive(playerId4)).toBe(true);
    });

  });

  describe("isPlayerFirstOrSecond", () => {
    it("returns false when player is not in bracket", () => {
      setup([]);

      expect(
        bracket.isPlayerFirstOrSecond(
          "ply_not_in_bracket",
        ),
      ).toBe(false);
    });

    it("returns false when player is still alive but has not finished first or second", () => {
      setup([]);

      /*
       * Player 2 is in the bracket but the bracket
       * has not been completed.
       */
      expect(bracket.isPlayerAlive(playerId2)).toBe(true);
      expect(bracket.isPlayerFirstOrSecond(playerId2)).toBe(false);
    });

    it("returns false when player has lost", () => {
      setup(squadGamesThrough(3));

      bracket.updateMatches();

      expect(bracket.isPlayerFirstOrSecond(playerId1)).toBe(false);
    });

    it("returns true when player is runner-up", () => {
      setup(squadGamesThrough(3));

      bracket.updateMatches();

      expect(bracket.isPlayerFirstOrSecond(playerId2)).toBe(true);
    });

    it("returns true when player is winner", () => {
      setup(squadGamesThrough(3));

      bracket.updateMatches();

      expect(bracket.isPlayerFirstOrSecond(playerId8)).toBe(true);
    });

    it("returns true for both winners when final is tied", () => {
      const tieGames = cloneDeep(squadGamesThrough(3));

      /*
       * Normal finalists are player 2 and player 8.
       * Give both players the same game-3 score.
       */
      setGameScore(tieGames, playerId2, 3, 226);
      setGameScore(tieGames, playerId8, 3, 226);

      setup(tieGames);

      bracket.updateMatches();

      expect(bracket.isPlayerFirstOrSecond(playerId2)).toBe(true);
      expect(bracket.isPlayerFirstOrSecond(playerId8)).toBe(true);
    });
  });

  describe("isPlayerInBracketGame2", () => {
    it("returns true when player has not lost bracket game 1", () => {
      setup(squadGamesThrough(1));
      bracket.updateMatches();

      /*
      * Game 1:
      *
      * player 1 vs player 2 -> player 2 wins.
      *
      * Player 2 advances to bracket game 2.
      */
      expect(bracket.loserBrktGame1Ids.has(playerId2)).toBe(false);
      expect(bracket.isPlayerInBracketGame2(playerId2)).toBe(true);
    });

    it("returns false when player loses bracket game 1", () => {
      setup(squadGamesThrough(1));
      bracket.updateMatches();

      /*
      * Game 1:
      *
      * player 1 vs player 2 -> player 2 wins.
      *
      * Player 1 does not advance to bracket game 2.
      */
      expect(bracket.loserBrktGame1Ids.has(playerId1)).toBe(true);
      expect(bracket.isPlayerInBracketGame2(playerId1)).toBe(false);
    });

    it("returns true for both players when bracket game 1 is tied", () => {
      const tieGames = cloneDeep(squadGamesThrough(1));

      /*
      * Tie game-1 match 0.
      *
      * Both players advance to bracket game 2.
      */
      setGameScore(tieGames, playerId1, 1, 226);
      setGameScore(tieGames, playerId2, 1, 226);
      setup(tieGames);

      bracket.updateMatches();

      expect(bracket.loserBrktGame1Ids.has(playerId1)).toBe(false);
      expect(bracket.loserBrktGame1Ids.has(playerId2)).toBe(false);

      expect(bracket.isPlayerInBracketGame2(playerId1)).toBe(true);
      expect(bracket.isPlayerInBracketGame2(playerId2)).toBe(true);
    });
  });

  describe("isPlayerInBrktGame3", () => {
    it("returns true when player advances through bracket games 1 and 2", () => {
      setup(squadGamesThrough(2));
      bracket.updateMatches();

      /*
      * Game 1:
      *
      * player 1 vs player 2 -> player 2 wins.
      *
      * Game 2:
      *
      * player 2 vs player 4 -> player 2 wins.
      *
      * Player 2 advances to bracket game 3.
      */
      expect(bracket.loserBrktGame1Ids.has(playerId2)).toBe(false);
      expect(bracket.loserBrktGame2Ids.has(playerId2)).toBe(false);
      expect(bracket.isPlayerInBrktGame3(playerId2)).toBe(true);
    });

    it("returns false when player loses bracket game 1", () => {
      setup(squadGamesThrough(2));
      bracket.updateMatches();

      /*
      * Game 1:
      *
      * player 1 vs player 2 -> player 2 wins.
      *
      * Player 1 never reaches bracket game 2,
      * so cannot reach bracket game 3.
      */
      expect(bracket.loserBrktGame1Ids.has(playerId1)).toBe(true);
      expect(bracket.isPlayerInBrktGame3(playerId1) ).toBe(false);
    });

    it("returns false when player loses bracket game 2", () => {
      setup(squadGamesThrough(2));
      bracket.updateMatches();

      /*
      * Game 1:
      *
      * player 3 vs player 4 -> player 4 wins.
      *
      * Game 2:
      *
      * player 2 vs player 4 -> player 2 wins.
      *
      * Player 4 reached bracket game 2,
      * but does not advance to bracket game 3.
      */
      expect(bracket.loserBrktGame1Ids.has(playerId4)).toBe(false);
      expect(bracket.loserBrktGame2Ids.has(playerId4)).toBe(true);
      expect(bracket.isPlayerInBrktGame3(playerId4)).toBe(false);
    });

    it("returns true for both players when bracket game 2 is tied", () => {
      const tieGames = cloneDeep(squadGamesThrough(2));

      /*
      * Normal game-1 winners are:
      *
      * player 2
      * player 4
      *
      * Tie their game-2 semifinal.
      *
      * Both players advance to bracket game 3.
      */
      setGameScore(tieGames, playerId2, 2, 227);
      setGameScore(tieGames, playerId4, 2, 227);

      setup(tieGames);
      bracket.updateMatches();

      expect(bracket.loserBrktGame2Ids.has(playerId2)).toBe(false);
      expect(bracket.loserBrktGame2Ids.has(playerId4)).toBe(false);
      expect(bracket.isPlayerInBrktGame3(playerId2)).toBe(true);
      expect(bracket.isPlayerInBrktGame3(playerId4)).toBe(true);
    });
  });  
});
