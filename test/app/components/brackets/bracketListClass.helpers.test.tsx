import {
  BracketList,
  brktListInitialDataType,
  defaultSquadGameNums,
} from "@/components/brackets/bracketListClass";
import type { playerType } from "@/lib/types/types";
import { initPlayer } from "@/lib/db/initVals";
import {
  brktId1,
  byeId,
  divId1,
  mockGames,
  mockTmntFullData,
  oneBrktId1,
  oneBrktId2,
  oneBrktId3,
  oneBrktId4,
  oneBrktId5,
  oneBrktId6,
  oneBrktId7,
  oneBrktId8,
  playerId1,
  playerId2,
  playerId3,
  squadId1,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

describe("BracketList helper methods", () => {
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

  const createBracketList = (
    initialData: brktListInitialDataType | null = initData,
    squadGameNums: number[] = defaultSquadGameNums,
  ): BracketList => {
    return new BracketList(
      brktId1,
      2,
      3,
      squadGameNums,
      byePlayer,
      initialData,
    );
  };

  describe("aliveCount", () => {
    it("returns the player's total bracket count for bracket game 1", () => {
      const brktList = createBracketList();

      /*
       * playerId1 is in all eight brackets for brktId1.
       *
       * Before bracket game 1 is completed, the player is
       * alive in every bracket entered.
       */
      expect(brktList.brackets).toHaveLength(8);
      expect(brktList.aliveCount(playerId1, 1)).toBe(8);
    });

    it("subtracts game-1 losses when getting the count for bracket game 2", () => {
      const brktList = createBracketList();

      /*
       * Set the loss information directly so this test only
       * tests aliveCount(), not the score/match calculations.
       */
      brktList.brackets[0].loserBrktGame1Ids.add(playerId1);
      brktList.brackets[2].loserBrktGame1Ids.add(playerId1);
      brktList.brackets[5].loserBrktGame1Ids.add(playerId1);

      /*
       * playerId1 started alive in 8 brackets and lost
       * bracket game 1 in 3 of them.
       */
      expect(brktList.aliveCount(playerId1, 2)).toBe(5);
    });

    it("subtracts game-1 and game-2 losses when getting the count for bracket game 3", () => {
      const brktList = createBracketList();

      brktList.brackets[0].loserBrktGame1Ids.add(playerId1);
      brktList.brackets[2].loserBrktGame1Ids.add(playerId1);
      brktList.brackets[4].loserBrktGame2Ids.add(playerId1);
      brktList.brackets[6].loserBrktGame2Ids.add(playerId1);

      /*
       * playerId1 started alive in 8 brackets.
       *
       * Lost bracket game 1 in 2 brackets.
       * Lost bracket game 2 in 2 more brackets.
       *
       * 8 - 2 - 2 = 4.
       */
      expect(brktList.aliveCount(playerId1, 3)).toBe(4);
    });

    it("does not subtract losses belonging to another player", () => {
      const brktList = createBracketList();

      brktList.brackets[0].loserBrktGame1Ids.add(playerId2);
      brktList.brackets[1].loserBrktGame2Ids.add(playerId2);

      expect(brktList.aliveCount(playerId1, 3)).toBe(8);
    });

    it.each([
      0,
      -1,
      4,
      10,
    ])(
      "returns 0 for invalid bracket game number %p",
      (brktGameNum) => {
        const brktList = createBracketList();

        expect(
          brktList.aliveCount(
            playerId1,
            brktGameNum,
          ),
        ).toBe(0);
      },
    );

    it("returns 0 when the player is not in the players map", () => {
      const brktList = createBracketList();

      const unknownPlayerId = "ply_ffffffffffffffffffffffffffffffff";

      expect(brktList.aliveCount(unknownPlayerId, 1)).toBe(0);
    });

    it("returns 0 when there is no players map", () => {
      const brktList = createBracketList(null);

      expect(brktList.playersMap).toBeNull();
      expect(brktList.aliveCount(playerId1, 1)).toBe(0);
    });

    it("returns 0 when there is no bracket index map", () => {
      const brktList = createBracketList();

      const brktListPrivate = 
        brktList as unknown as {
          _bracketIndexMap: null;
        };

      brktListPrivate._bracketIndexMap = null;

      expect(brktList.aliveCount(playerId1, 1)).toBe(0);
    });
  });

  describe("createGameScoresMap", () => {
    it("creates the game score map from game data", () => {
      const brktList = createBracketList();

      brktList.createGameScoresMap(mockGames);

      expect(brktList.gameScoreMap?.size).toBe(mockGames.length);
      expect(brktList.gameScoreMap?.get(`${playerId1}_1`)).toBe(201);
      expect(brktList.gameScoreMap?.get(`${playerId1}_2`)).toBe(202);
      expect(brktList.gameScoreMap?.get(`${playerId1}_3`)).toBe(203);
      expect(brktList.gameScoreMap?.get(`${playerId2}_1`)).toBe(210);
    });

    it("replaces an existing game score map", () => {
      const brktList = createBracketList();

      brktList.createGameScoresMap(mockGames);

      expect(brktList.gameScoreMap?.size).toBe(mockGames.length);

      const game1 = mockGames.filter((game) => game.game_num === 1);

      brktList.createGameScoresMap(game1);

      expect(brktList.gameScoreMap?.size).toBe(game1.length);
      expect(brktList.gameScoreMap?.get(`${playerId1}_1`)).toBe(201);
      expect(brktList.gameScoreMap?.has(`${playerId1}_2`)).toBe(false);
    });

    it("clears the game score map for an empty games array", () => {
      const brktList = createBracketList();

      brktList.createGameScoresMap(mockGames);

      expect(brktList.gameScoreMap?.size).toBeGreaterThan(0);

      brktList.createGameScoresMap([]);

      expect(brktList.gameScoreMap?.size).toBe(0);
    });

    it.each([
      undefined,
      null,
      {},
      "not an array",
      123,
    ])(
      "clears the game score map for invalid games: %p",
      (invalidGames) => {
        const brktList = createBracketList();

        brktList.createGameScoresMap(mockGames);

        expect(brktList.gameScoreMap?.size).toBeGreaterThan(0);

        brktList.createGameScoresMap(
          invalidGames as unknown as typeof mockGames,
        );

        expect(brktList.gameScoreMap?.size).toBe(0);
      },
    );
  });

  describe("playerBracketIdsSorted", () => {
    it("returns the player's bracket ids sorted by bracket index", () => {
      const brktList = createBracketList();
      const result = brktList.playerBracketIdsSorted(playerId1);

      expect(result).toEqual([
        oneBrktId1,
        oneBrktId2,
        oneBrktId3,
        oneBrktId4,
        oneBrktId5,
        oneBrktId6,
        oneBrktId7,
        oneBrktId8,
      ]);
    });

    it("returns the player's bracket ids sorted by bracket index when playerInfo.bracketIds scrambled", () => {
      const brktList = createBracketList();
      const playerInfo = brktList.playersMap?.get(playerId1);

      expect(playerInfo).toBeDefined();

      // Scramble the player's bracket ids.
      playerInfo!.bracketIds = [
        oneBrktId5,
        oneBrktId2,
        oneBrktId8,
        oneBrktId1,
        oneBrktId6,
        oneBrktId3,
        oneBrktId7,
        oneBrktId4,
      ];
      const result = brktList.playerBracketIdsSorted(playerId1);

      expect(result).toEqual([
        oneBrktId1,
        oneBrktId2,
        oneBrktId3,
        oneBrktId4,
        oneBrktId5,
        oneBrktId6,
        oneBrktId7,
        oneBrktId8,
      ]);
    });    

    it("returns the bracket ids sorted by bracket index for another player", () => {
      const brktList = createBracketList();
      const result = brktList.playerBracketIdsSorted(playerId2);

      expect(result).toEqual([
        oneBrktId1,
        oneBrktId2,
        oneBrktId3,
        oneBrktId4,
        oneBrktId5,
        oneBrktId6,
        oneBrktId7,
        oneBrktId8,
      ]);
    });

    it("does not change the player's original bracketIds array", () => {
      const brktList = createBracketList();
      const playerInfo = brktList.playersMap?.get(playerId1);

      expect(playerInfo).toBeDefined();

      const originalBracketIds = [
        ...(playerInfo?.bracketIds ?? []),
      ];

      brktList.playerBracketIdsSorted(playerId1);

      expect(playerInfo?.bracketIds).toEqual(originalBracketIds);
    });

    it("returns an empty array when the player is not in the players map", () => {
      const brktList = createBracketList();
      const unknownPlayerId = "ply_ffffffffffffffffffffffffffffffff";

      expect(
        brktList.playerBracketIdsSorted(
          unknownPlayerId,
        ),
      ).toEqual([]);
    });

    it("returns an empty array when there is no players map", () => {
      const brktList = createBracketList(null);

      expect(brktList.playersMap).toBeNull();
      expect(brktList.playerBracketIdsSorted(playerId1)).toEqual([]);
    });

    it("returns an empty array when there is no bracket index map", () => {
      const brktList = createBracketList();
      const brktListPrivate =
        brktList as unknown as {
          _bracketIndexMap: null;
        };

      brktListPrivate._bracketIndexMap = null;

      expect(brktList.playerBracketIdsSorted(playerId1)).toEqual([]);
    });
  });

  describe("playerEarnings", () => {
    it("returns 0 before a player has placed in a bracket", () => {
      const brktList = createBracketList();

      expect(brktList.playerEarnings(playerId1)).toBe(0);
    });

    it("adds first and second place earnings across different brackets", () => {
      const brktList = createBracketList();

      brktList.brackets[0].winnerIds.add(playerId1);
      brktList.brackets[1].winnerIds.add(playerId1);
      brktList.brackets[2].runnerUpIds.add(playerId1);

      // Two first-place prizes ($25 each) and one second-place prize ($10).
      expect(brktList.playerEarnings(playerId1)).toBe(60);
    });

    it("splits a tied first-place prize between 2 winners. combines the first-place and second-place prizes", () => {
      const brktList = createBracketList();

      brktList.brackets[0].winnerIds.add(playerId1);
      brktList.brackets[0].winnerIds.add(playerId2);

      expect(brktList.playerEarnings(playerId1)).toBe(17.5);
      expect(brktList.playerEarnings(playerId2)).toBe(17.5);
    });

    it("splits a tied first-place prize between 3 winners. combines the first-place and second-place prizes", () => {
      const brktList = createBracketList();

      brktList.brackets[0].winnerIds.add(playerId1);
      brktList.brackets[0].winnerIds.add(playerId2);
      brktList.brackets[0].winnerIds.add(playerId3);

      expect(brktList.playerEarnings(playerId1)).toBe(35/3);
      expect(brktList.playerEarnings(playerId2)).toBe(35/3);
      expect(brktList.playerEarnings(playerId3)).toBe(35/3);
    });

    it("splits a tied second-place prize between 2 runners-up", () => {
      const brktList = createBracketList();

      brktList.brackets[0].runnerUpIds.add(playerId1);
      brktList.brackets[0].runnerUpIds.add(playerId2);

      expect(brktList.playerEarnings(playerId1)).toBe(5);
      expect(brktList.playerEarnings(playerId2)).toBe(5);
    });

    it("splits a tied second-place prize between 3 runners-up", () => {
      const brktList = createBracketList();

      brktList.brackets[0].runnerUpIds.add(playerId1);
      brktList.brackets[0].runnerUpIds.add(playerId2);
      brktList.brackets[0].runnerUpIds.add(playerId3);

      expect(brktList.playerEarnings(playerId1)).toBe(10/3);
      expect(brktList.playerEarnings(playerId2)).toBe(10/3);
      expect(brktList.playerEarnings(playerId3)).toBe(10/3);
    });

    it("does not count another player's earnings", () => {
      const brktList = createBracketList();

      brktList.brackets[0].winnerIds.add(playerId2);

      expect(brktList.playerEarnings(playerId1)).toBe(0);
      expect(brktList.playerEarnings(playerId2)).toBe(25);
    });

    it("returns 0 for a player who is not in the players map", () => {
      const brktList = createBracketList();
      const unknownPlayerId = "ply_ffffffffffffffffffffffffffffffff";

      expect(brktList.playerEarnings(unknownPlayerId)).toBe(0);
    });

    it("returns 0 without initial data", () => {
      const brktList = createBracketList(null);

      expect(brktList.playerEarnings(playerId1)).toBe(0);
    });
  });

  describe("squadGameNumber", () => {
    it("returns the default squad game numbers", () => {
      const brktList = createBracketList();

      expect(brktList.squadGameNumber(1)).toBe(1);
      expect(brktList.squadGameNumber(2)).toBe(2);
      expect(brktList.squadGameNumber(3)).toBe(3);
    });

    it("returns configured squad game numbers", () => {
      const brktList = createBracketList(
        initData,
        [4, 5, 6],
      );

      expect(brktList.squadGameNumber(1)).toBe(4);
      expect(brktList.squadGameNumber(2)).toBe(5);
      expect(brktList.squadGameNumber(3)).toBe(6);
    });

    it("returns configured squad game numbers in configured order", () => {
      const brktList = createBracketList(
        initData,
        [3, 2, 1],
      );

      expect(brktList.squadGameNumber(1)).toBe(3);
      expect(brktList.squadGameNumber(2)).toBe(2);
      expect(brktList.squadGameNumber(3)).toBe(1);
    });

    it.each([
      0,
      -1,
      -10,
      4,
      10,
    ])(
      "returns -1 for invalid bracket game number %p",
      (brktGameNum) => {
        const brktList = createBracketList();

        expect(
          brktList.squadGameNumber(brktGameNum),
        ).toBe(-1);
      },
    );
  });

});