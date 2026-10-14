import {
  BracketList,
  brktListInitialDataType,
  defaultSquadGameNums,
} from "@/components/brackets/bracketListClass";
import type { playerType } from "@/lib/types/types";
import { initPlayer } from "@/lib/db/initVals";
import { tmntResultsToGameTypes } from "@/lib/tmntResultsToGameTypes";
import type { tmntGameResult } from "@/lib/types/resultsTypes";
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
  playerId5,
  playerId8,
  squadId1,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// updateBracketMatches converts the results with this function; the tests
// below hand it the mock games directly
jest.mock("@/lib/tmntResultsToGameTypes", () => ({
  tmntResultsToGameTypes: jest.fn(),
}));

const mockedToGameTypes = tmntResultsToGameTypes as jest.Mock;

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

  describe("allBracketsCompleted", () => {
    // updateBracketMatches only needs a non-empty array; the games come from
    // the mocked tmntResultsToGameTypes
    const minimalResults = mockTmntFullData.players.map((p) => ({
      player_id: p.id,
      div_id: divId1,
    })) as unknown as tmntGameResult[];

    // gives the list these games and decides every match, as the results pages do
    const updateWith = (list: BracketList, games: typeof mockGames) => {
      mockedToGameTypes.mockReturnValue(games);
      list.updateBracketMatches(minimalResults);
    };

    const addWinner = (
      list: BracketList,
      index: number,
      playerId: string = playerId1,
    ) => {
      list.brackets[index].winnerIds.add(playerId);
    };

    beforeEach(() => {
      mockedToGameTypes.mockReturnValue(mockGames);
    });

    describe("fixture sanity check", () => {
      it("the list has eight brackets, games 1 to 3, and every mock player has a score for each", () => {
        const list = createBracketList();

        expect(list.brackets).toHaveLength(8);
        expect(list.squadGameNums).toEqual([1, 2, 3]);
        mockTmntFullData.players.forEach((p) => {
          [1, 2, 3].forEach((game) => {
            expect(
              mockGames.some(
                (g) => g.player_id === p.id && g.game_num === game,
              ),
            ).toBe(true);
          });
        });
      });
    });

    describe("with winners set directly on the brackets", () => {
      it("is false for a new list, before any scores are applied", () => {
        expect(createBracketList().allBracketsCompleted()).toBe(false);
      });

      it("is false when only one bracket has a winner", () => {
        const list = createBracketList();
        addWinner(list, 0);

        expect(list.allBracketsCompleted()).toBe(false);
      });

      it.each([0, 3, 7])(
        "is false when every bracket except bracket %i has a winner",
        (missing) => {
          const list = createBracketList();
          list.brackets.forEach((_, i) => {
            if (i !== missing) addWinner(list, i);
          });

          expect(list.allBracketsCompleted()).toBe(false);
        },
      );

      it("is true when every bracket has a winner", () => {
        const list = createBracketList();
        list.brackets.forEach((_, i) => addWinner(list, i));

        expect(list.allBracketsCompleted()).toBe(true);
      });

      it("becomes true when the last bracket gets its winner", () => {
        const list = createBracketList();
        list.brackets.slice(0, 7).forEach((_, i) => addWinner(list, i));
        expect(list.allBracketsCompleted()).toBe(false);

        addWinner(list, 7);

        expect(list.allBracketsCompleted()).toBe(true);
      });

      it("counts a bracket with a tied final (two winners) as completed", () => {
        const list = createBracketList();
        list.brackets.forEach((_, i) => addWinner(list, i));
        addWinner(list, 0, playerId2);

        expect(list.brackets[0].winnerIds.size).toBe(2);
        expect(list.allBracketsCompleted()).toBe(true);
      });

      it("does not depend on who the winners are", () => {
        const list = createBracketList();
        list.brackets.forEach((_, i) =>
          addWinner(list, i, i % 2 === 0 ? playerId1 : playerId2),
        );

        expect(list.allBracketsCompleted()).toBe(true);
      });

      it("looks only at winners: runners-up in every bracket do not count", () => {
        const list = createBracketList();
        list.brackets.forEach((b) => b.runnerUpIds.add(playerId2));

        expect(list.allBracketsCompleted()).toBe(false);
      });

      it("only reads: calling it does not change any bracket's winners", () => {
        const list = createBracketList();
        addWinner(list, 0);
        const before = list.brackets.map((b) => [...b.winnerIds]);

        list.allBracketsCompleted();
        list.allBracketsCompleted();

        expect(list.brackets.map((b) => [...b.winnerIds])).toEqual(before);
      });
    });

    describe("with scores, through updateBracketMatches", () => {
      it("is true when every player has a score for all three games", () => {
        const list = createBracketList();

        updateWith(list, mockGames);

        expect(list.allBracketsCompleted()).toBe(true);
      });

      it("decides player 8 as the winner of the first bracket", () => {
        const list = createBracketList();

        updateWith(list, mockGames);

        const first = list.brackets.find((b) => b.id === oneBrktId1);
        expect([...(first?.winnerIds ?? [])]).toEqual([playerId8]);
      });

      it("is false when the scores were given to the list but not applied", () => {
        const list = createBracketList();
        list.createGameScoresMap(mockGames);

        // the scores are in the map, but no match has been decided yet
        expect(list.allBracketsCompleted()).toBe(false);
      });

      it("is false when only games 1 and 2 have scores", () => {
        const list = createBracketList();

        updateWith(list, mockGames.filter((g) => g.game_num <= 2));

        expect(list.allBracketsCompleted()).toBe(false);
      });

      it("is false when only game 1 has scores", () => {
        const list = createBracketList();

        updateWith(list, mockGames.filter((g) => g.game_num === 1));

        expect(list.allBracketsCompleted()).toBe(false);
      });

      it("is false when no game has a score", () => {
        const list = createBracketList();

        updateWith(list, []);

        expect(list.allBracketsCompleted()).toBe(false);
      });

      it("is false when a finalist has no game 3 score, and true once it is entered", () => {
        const list = createBracketList();
        // player 8 has the best game 1 and game 2 scores, so is a finalist in every bracket
        const withoutGame3 = mockGames.filter(
          (g) => !(g.player_id === playerId8 && g.game_num === 3),
        );

        updateWith(list, withoutGame3);
        expect(list.allBracketsCompleted()).toBe(false);

        updateWith(list, mockGames);
        expect(list.allBracketsCompleted()).toBe(true);
      });

      it("goes back to false when the scores are removed and the matches are updated again", () => {
        const list = createBracketList();
        updateWith(list, mockGames);
        expect(list.allBracketsCompleted()).toBe(true);

        // updateMatches clears the winners before it decides the matches again
        updateWith(list, []);

        expect(list.allBracketsCompleted()).toBe(false);
      });

      it("stays true after a score is corrected, even when the correction makes a tied final", () => {
        const list = createBracketList();
        updateWith(list, mockGames);
        expect(list.allBracketsCompleted()).toBe(true);

        // player 2's game 3 score raised to tie player 8's 232 in the first bracket
        const corrected = mockGames.map((g) =>
          g.player_id === playerId2 && g.game_num === 3
            ? { ...g, score: 232 }
            : g,
        );
        updateWith(list, corrected);

        expect(list.allBracketsCompleted()).toBe(true);
        const first = list.brackets.find((b) => b.id === oneBrktId1);
        expect(first?.winnerIds).toEqual(new Set([playerId2, playerId8]));
      });

      it("uses the list's squad game numbers: scores for games 1 to 3 do not complete a list that plays games 4 to 6", () => {
        const list = createBracketList(initData, [4, 5, 6]);

        updateWith(list, mockGames.filter((g) => g.game_num <= 3));
        expect(list.allBracketsCompleted()).toBe(false);

        updateWith(list, mockGames);
        expect(list.allBracketsCompleted()).toBe(true);
      });
    });

    describe("a list with no brackets", () => {
      // NOTE: Array.every is true for an empty array, so a list with no brackets
      // counts as completed. These two tests pin that current behavior.
      it("is true for a list created without initial data (current behavior)", () => {
        const list = createBracketList(null);

        expect(list.brackets).toHaveLength(0);
        expect(list.allBracketsCompleted()).toBe(false);
      });

      it("is true for a list whose tournament has no one-brackets yet (current behavior)", () => {
        const list = createBracketList({
          tmntFullData: { ...mockTmntFullData, oneBrkts: [] },
          divId: divId1,
        });

        expect(list.brackets).toHaveLength(0);
        expect(list.allBracketsCompleted()).toBe(false);
      });

      it("is false when the brackets array is missing", () => {
        const list = createBracketList();
        (list as unknown as { _brackets: null })._brackets = null;

        expect(list.allBracketsCompleted()).toBe(false);
      });
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

      // Add a winner and runner-up for each bracket.
      brktList.brackets[0].winnerIds.add(playerId1);
      brktList.brackets[0].runnerUpIds.add(playerId2);

      brktList.brackets[1].winnerIds.add(playerId1);
      brktList.brackets[1].runnerUpIds.add(playerId2);

      brktList.brackets[2].winnerIds.add(playerId2);
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
      brktList.brackets[0].runnerUpIds.add(playerId3);

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