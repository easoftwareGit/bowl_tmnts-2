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

    it("returns false when player has lost", () => {
      setup(squadGamesThrough(1));

      bracket.updateMatches();

      /*
       * Game 1:
       *
       * player 1 vs player 2 -> player 2 wins.
       */
      expect(bracket.isPlayerAlive(playerId1)).toBe(false);
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
});
