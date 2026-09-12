import { Bracket } from "@/components/brackets/bracketClass";
import { BracketMatch } from "@/components/brackets/bracketMatchClass";
import {
  byeId,
  brktId1,
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
  divId1,
  oneBrktId1,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";
import {
  BracketList,
  brktListInitialDataType,
} from "@/components/brackets/bracketListClass";
import { gameType, playerType } from "@/lib/types/types";
import { initPlayer } from "@/lib/db/initVals";

describe("BracketMatch.getPlayersForPosition()", () => {
  let brktList: BracketList;
  let bracket: Bracket;
  let bracketMatch: BracketMatch | undefined;
  let testGames: gameType[];

  const oneBrkt = mockTmntFullData.oneBrkts[0];

  const byePlayer: playerType = {
    ...initPlayer,
    id: byeId,
    first_name: "Bye",
    average: 0,
  };

  const createBracketList = (
    games: gameType[],
    tmntFullData = mockTmntFullData,
    bye: playerType | undefined = undefined,
    squadGameNums: number[] = [1, 2, 3],
  ): BracketList => {
    const initData: brktListInitialDataType = {
      tmntFullData,
      divId: divId1,
    };

    const list = new BracketList(brktId1, 2, 3, squadGameNums, bye, initData);

    list.createGameScoresMap(games);

    return list;
  };

  /**
   * Remaps the squad game numbers while keeping
   * the existing player scores unchanged.
   *
   * Example:
   *
   *   [4, 5, 6]
   *
   * changes:
   *
   *   game 1 -> game 4
   *   game 2 -> game 5
   *   game 3 -> game 6
   */
  const remapSquadGameNums = (
    games: gameType[],
    squadGameNums: number[],
  ): gameType[] => {
    return games.map((game) => ({
      ...game,
      game_num: squadGameNums[game.game_num - 1],
    }));
  };

  const setGameScore = (
    games: gameType[],
    playerId: string,
    squadGameNum: number,
    score: number,
  ): void => {
    const game = games.find(
      (game) => game.player_id === playerId && game.game_num === squadGameNum,
    );

    if (game === undefined) {
      throw new Error(`Game ${squadGameNum} not found for player ${playerId}.`);
    }

    game.score = score;
  };

  beforeEach(() => {
    testGames = cloneDeep(mockGames);

    brktList = createBracketList(testGames);

    bracket = brktList.brackets[0];
    bracketMatch = bracket.match;
  });

  describe("first round matches", () => {
    it("returns the seeded player for each position in match 0", () => {
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;

      expect(bracketMatch.getPlayersForPosition(0, 0)).toEqual([playerId1]);
      expect(bracketMatch.getPlayersForPosition(0, 1)).toEqual([playerId2]);
    });

    it("returns the seeded player for each position in match 1", () => {
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;

      expect(bracketMatch.getPlayersForPosition(1, 0)).toEqual([playerId3]);
      expect(bracketMatch.getPlayersForPosition(1, 1)).toEqual([playerId4]);
    });

    it("returns the seeded player for each position in match 2", () => {
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;

      expect(bracketMatch.getPlayersForPosition(2, 0)).toEqual([playerId5]);
      expect(bracketMatch.getPlayersForPosition(2, 1)).toEqual([playerId6]);
    });

    it("returns the seeded player for each position in match 3", () => {
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;

      expect(bracketMatch.getPlayersForPosition(3, 0)).toEqual([playerId7]);
      expect(bracketMatch.getPlayersForPosition(3, 1)).toEqual([playerId8]);
    });
  });

  describe("second round matches", () => {
    it("returns the winner of match 0 for position 0 of match 4", () => {
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;

      expect(bracketMatch.getPlayersForPosition(4, 0)).toEqual([playerId2]);
    });

    it("returns the winner of match 1 for position 1 of match 4", () => {
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;

      expect(bracketMatch.getPlayersForPosition(4, 1)).toEqual([playerId4]);
    });

    it("returns the winner of match 2 for position 0 of match 5", () => {
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;

      expect(bracketMatch.getPlayersForPosition(5, 0)).toEqual([playerId6]);
    });

    it("returns the winner of match 3 for position 1 of match 5", () => {
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;

      expect(bracketMatch.getPlayersForPosition(5, 1)).toEqual([playerId8]);
    });
  });

  describe("final match", () => {
    it("returns the winner of match 4 for position 0", () => {
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;

      expect(bracketMatch.getPlayersForPosition(6, 0)).toEqual([playerId2]);
    });

    it("returns the winner of match 5 for position 1", () => {
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;

      expect(bracketMatch.getPlayersForPosition(6, 1)).toEqual([playerId8]);
    });
  });

  describe("ties", () => {
    it("returns both players for a second-round position when the prior match is tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Tie match 0.
      setGameScore(tieGames, playerId1, 1, 210);
      setGameScore(tieGames, playerId2, 1, 210);

      const tiesBrktList = createBracketList(tieGames);
      const tiesBracketMatch = tiesBrktList.brackets[0].match;

      expect(tiesBracketMatch).not.toBeUndefined();
      if (tiesBracketMatch == null) return;

      expect(tiesBracketMatch.getPlayersForPosition(4, 0)).toEqual([
        playerId1,
        playerId2,
      ]);
    });

    it("returns both players for the other position when the prior match is tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Tie match 1.
      setGameScore(tieGames, playerId3, 1, 205);
      setGameScore(tieGames, playerId4, 1, 205);

      const tiesBrktList = createBracketList(tieGames);
      const tiesBracketMatch = tiesBrktList.brackets[0].match;

      expect(tiesBracketMatch).not.toBeUndefined();
      if (tiesBracketMatch == null) return;

      expect(tiesBracketMatch.getPlayersForPosition(4, 1)).toEqual([
        playerId3,
        playerId4,
      ]);
    });

    it("returns both players for final position 0 when match 4 is tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Normal match 4 players are playerId2 and playerId4.
      setGameScore(tieGames, playerId2, 2, 211);
      setGameScore(tieGames, playerId4, 2, 211);

      const tiesBrktList = createBracketList(tieGames);
      const tiesBracketMatch = tiesBrktList.brackets[0].match;

      expect(tiesBracketMatch).not.toBeUndefined();
      if (tiesBracketMatch == null) return;

      expect(tiesBracketMatch.getPlayersForPosition(6, 0)).toEqual([
        playerId2,
        playerId4,
      ]);
    });

    it("returns both players for final position 1 when match 5 is tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Normal match 5 players are playerId5 and playerId8.
      setGameScore(tieGames, playerId6, 2, 221);
      setGameScore(tieGames, playerId8, 2, 221);

      const tiesBrktList = createBracketList(tieGames);
      const tiesBracketMatch = tiesBrktList.brackets[0].match;

      expect(tiesBracketMatch).not.toBeUndefined();
      if (tiesBracketMatch == null) return;

      expect(tiesBracketMatch.getPlayersForPosition(6, 1)).toEqual([
        playerId6,
        playerId8,
      ]);
    });

    it("returns four players for final position 0 when matches 0, 1, and 4 are tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Tie match 0.
      setGameScore(tieGames, playerId1, 1, 210);
      setGameScore(tieGames, playerId2, 1, 210);

      // Tie match 1.
      setGameScore(tieGames, playerId3, 1, 205);
      setGameScore(tieGames, playerId4, 1, 205);

      // All four players tie in match 4.
      [
        playerId1,
        playerId2,
        playerId3,
        playerId4,
      ].forEach((playerId) => {
        setGameScore(
          tieGames,
          playerId,
          2,
          220,
        );
      });

      const tiesBrktList = createBracketList(tieGames);
      const tiesBracketMatch = tiesBrktList.brackets[0].match;

      expect(tiesBracketMatch).not.toBeUndefined();
      if (tiesBracketMatch == null) return;

      expect(tiesBracketMatch.getPlayersForPosition(6, 0)).toEqual([
        playerId1,
        playerId2,
        playerId3,
        playerId4,
      ]);
    });

    it("returns four players for final position 1 when matches 2, 3, and 5 are tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Tie match 2.
      setGameScore(tieGames, playerId5, 1, 225);
      setGameScore(tieGames, playerId6, 1, 225);

      // Tie match 3.
      setGameScore(tieGames, playerId7, 1, 230);
      setGameScore(tieGames, playerId8, 1, 230);

      // All four players tie in match 5.
      [
        playerId5,
        playerId6,
        playerId7,
        playerId8,
      ].forEach((playerId) => {
        setGameScore(
          tieGames,
          playerId,
          2,
          220,
        );
      });

      const tiesBrktList = createBracketList(tieGames);
      const tiesBracketMatch = tiesBrktList.brackets[0].match;

      expect(tiesBracketMatch).not.toBeUndefined();
      if (tiesBracketMatch == null) return;

      expect(tiesBracketMatch.getPlayersForPosition(6, 1)).toEqual([
        playerId5,
        playerId6,
        playerId7,
        playerId8,
      ]);
    });
  });

  describe("incomplete prior matches", () => {
    it("returns an empty array when a prior first-round match is incomplete", () => {
      const partialGames = cloneDeep(
        mockGames.filter(
          (game) =>
            !(
              game.player_id === playerId2 &&
              game.game_num === 1
            ),
        ),
      );

      const partialBrktList = createBracketList(partialGames);
      const partialBracketMatch = partialBrktList.brackets[0].match;

      expect(partialBracketMatch).not.toBeUndefined();
      if (partialBracketMatch == null) return;

      expect(
        partialBracketMatch.getPlayersForPosition(4, 0),
      ).toEqual([]);
    });

    it("returns an empty array for a final position when the prior second-round match is incomplete", () => {
      const partialGames = cloneDeep(
        mockGames.filter(
          (game) =>
            !(
              game.player_id === playerId4 &&
              game.game_num === 2
            ),
        ),
      );

      const partialBrktList = createBracketList(partialGames);
      const partialBracketMatch = partialBrktList.brackets[0].match;

      expect(partialBracketMatch).not.toBeUndefined();
      if (partialBracketMatch == null) return;

      expect(
        partialBracketMatch.getPlayersForPosition(6, 0),
      ).toEqual([]);
    });
  });

  describe("squad game number mapping", () => {

    it("uses squad games 4, 5, and 6 for bracket games 1, 2, and 3", () => {
      const remappedGames =
        remapSquadGameNums(
          cloneDeep(mockGames),
          [4, 5, 6],
        );

      const mappedBrktList =
        createBracketList(
          remappedGames,
          mockTmntFullData,
          undefined,
          [4, 5, 6],
        );

      const mappedBracketMatch = mappedBrktList.brackets[0].match;

      expect(mappedBracketMatch).not.toBeUndefined();

      if (mappedBracketMatch == null) return;

      expect(
        mappedBracketMatch
          .getPlayersForPosition(
            4,
            0,
          ),
      ).toEqual([playerId2]);

      expect(
        mappedBracketMatch
          .getPlayersForPosition(
            4,
            1,
          ),
      ).toEqual([playerId4]);

      expect(
        mappedBracketMatch
          .getPlayersForPosition(
            5,
            0,
          ),
      ).toEqual([playerId6]);

      expect(
        mappedBracketMatch
          .getPlayersForPosition(
            5,
            1,
          ),
      ).toEqual([playerId8]);

      expect(
        mappedBracketMatch
          .getPlayersForPosition(
            6,
            0,
          ),
      ).toEqual([playerId2]);

      expect(
        mappedBracketMatch
          .getPlayersForPosition(
            6,
            1,
          ),
      ).toEqual([playerId8]);
    });

    // it("supports non-consecutive squad game numbers", () => {
    //   const remappedGames =
    //     remapSquadGameNums(
    //       cloneDeep(mockGames),
    //       [2, 4, 6],
    //     );

    //   const mappedBrktList =
    //     createBracketList(
    //       remappedGames,
    //       mockTmntFullData,
    //       undefined,
    //       [2, 4, 6],
    //     );

    //   const mappedBracketMatch = mappedBrktList.brackets[0].match;

    //   expect(mappedBracketMatch).not.toBeUndefined();

    //   if (mappedBracketMatch == null) return;

    //   expect(
    //     mappedBracketMatch
    //       .getPlayersForPosition(
    //         4,
    //         0,
    //       ),
    //   ).toEqual([playerId2]);

    //   expect(
    //     mappedBracketMatch
    //       .getPlayersForPosition(
    //         5,
    //         1,
    //       ),
    //   ).toEqual([playerId8]);

    //   expect(
    //     mappedBracketMatch
    //       .getPlayersForPosition(
    //         6,
    //         0,
    //       ),
    //   ).toEqual([playerId2]);

    //   expect(
    //     mappedBracketMatch
    //       .getPlayersForPosition(
    //         6,
    //         1,
    //       ),
    //   ).toEqual([playerId8]);
    // });

    // it("supports squad game numbers that are not in ascending order", () => {
    //   const remappedGames =
    //     remapSquadGameNums(
    //       cloneDeep(mockGames),
    //       [3, 2, 1],
    //     );

    //   const mappedBrktList =
    //     createBracketList(
    //       remappedGames,
    //       mockTmntFullData,
    //       undefined,
    //       [3, 2, 1],
    //     );

    //   const mappedBracketMatch = mappedBrktList.brackets[0].match;

    //   expect(mappedBracketMatch).not.toBeUndefined();

    //   if (mappedBracketMatch == null) return;

    //   expect(
    //     mappedBracketMatch
    //       .getPlayersForPosition(
    //         4,
    //         0,
    //       ),
    //   ).toEqual([playerId2]);

    //   expect(
    //     mappedBracketMatch
    //       .getPlayersForPosition(
    //         4,
    //         1,
    //       ),
    //   ).toEqual([playerId4]);

    //   expect(
    //     mappedBracketMatch
    //       .getPlayersForPosition(
    //         6,
    //         0,
    //       ),
    //   ).toEqual([playerId2]);

    //   expect(
    //     mappedBracketMatch
    //       .getPlayersForPosition(
    //         6,
    //         1,
    //       ),
    //   ).toEqual([playerId8]);
    // });

  });

  describe("bye player", () => {
    it("returns the bye player in its original first-round position", () => {
      const byeTmntData = cloneDeep(mockTmntFullData);

      const byeSeed = byeTmntData.brktSeeds.find(
        (seed) =>
          seed.one_brkt_id === oneBrktId1 &&
          seed.player_id === playerId1,
      );

      expect(byeSeed).not.toBeUndefined();
      if (byeSeed == null) return;

      byeSeed.player_id = byeId;

      const byeBrktList = createBracketList(
        cloneDeep(mockGames),
        byeTmntData,
        byePlayer,
      );

      const byeBracketMatch = byeBrktList.brackets[0].match;

      expect(byeBracketMatch).not.toBeUndefined();
      if (byeBracketMatch == null) return;

      expect(
        byeBracketMatch.getPlayersForPosition(0, 0),
      ).toEqual([byeId]);
    });

    it("advances the non-bye player from a first-round match", () => {
      const byeTmntData = cloneDeep(mockTmntFullData);

      const byeSeed = byeTmntData.brktSeeds.find(
        (seed) =>
          seed.one_brkt_id === oneBrktId1 &&
          seed.player_id === playerId1,
      );

      expect(byeSeed).not.toBeUndefined();
      if (byeSeed == null) return;

      byeSeed.player_id = byeId;

      const byeBrktList = createBracketList(
        cloneDeep(mockGames),
        byeTmntData,
        byePlayer,
      );

      const byeBracketMatch = byeBrktList.brackets[0].match;

      expect(byeBracketMatch).not.toBeUndefined();
      if (byeBracketMatch == null) return;

      expect(
        byeBracketMatch.getPlayersForPosition(4, 0),
      ).toEqual([playerId2]);
    });
  });
});
