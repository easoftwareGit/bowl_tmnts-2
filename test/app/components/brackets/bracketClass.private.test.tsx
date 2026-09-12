/* 
  NOTE - these tests are for private functions in the Bracket Class
  before running these tests, make sure to change the functions to public
*/
import {
  Bracket,
  playerStatusValues,
} from "@/components/brackets/bracketClass";
import type { BracketList } from "@/components/brackets/bracketListClass";
import { defaultBrktGames } from "@/lib/db/initVals";
import {
  oneBrktId1,
  playerId1,
  playerId2,
  playerId3,
  playerId4,
  playerId5,
  playerId6,
  playerId7,
  playerId8,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import type { matchSeedInfoType } from "@/components/brackets/bracketMatchClass";

describe("Bracket Class - private functions", () => {
  const fullPlayers = [
    "player-1",
    "player-2",
    "player-3",
    "player-4",
    "player-5",
    "player-6",
    "player-7",
    "player-8",
  ];

  /**
   * Creates a bracket with the minimum parent data needed
   * by the Bracket class.
   *
   * Bracket gets its number of games and squad game numbers
   * from its parent BracketList.
   */
  const createBracket = (
    squadGameNums: number[] = [1, 2, 3],
  ): Bracket => {
    const bracket = new Bracket(
      oneBrktId1,
    );

    bracket.parent = {
      games: defaultBrktGames,
      gameScoreMap: null,
      playersMap: null,
      squadGameNumber: (
        brktGameNum: number,
      ): number => {
        return squadGameNums[
          brktGameNum - 1
        ];
      },
    } as unknown as BracketList;

    return bracket;
  };

  const addPlayersToBracket = (
    bracket: Bracket,
    players: string[],
  ): void => {
    if (
      players.length > 0 &&
      players.length % 2 === 0
    ) {
      for (
        let i = 0;
        i < players.length;
        i += 2
      ) {
        bracket.addMatch([
          players[i],
          players[i + 1],
        ]);
      }
    }
  };

  describe("getPlayerMatchInfo", () => {
    let bracket: Bracket;

    beforeEach(() => {
      bracket = createBracket();

      addPlayersToBracket(
        bracket,
        [
          playerId1,
          playerId2,
          playerId3,
          playerId4,
          playerId5,
          playerId6,
          playerId7,
          playerId8,
        ],
      );
    });

    it("returns undefined when player is not in the bracket", () => {
      const result = bracket.getPlayerMatchInfo(
        "player-not-in-bracket",
        1,
      );

      expect(result).toBeUndefined();
    });

    it("returns undefined when getMatchPlayers returns an empty array", () => {
      jest
        .spyOn(bracket.match!, "getMatchPlayers")
        .mockReturnValue([]);

      const result = bracket.getPlayerMatchInfo(
        playerId1,
        1,
      );

      expect(result).toBeUndefined();
    });

    it("throws when getMatchInfo throws an error", () => {
      jest
        .spyOn(bracket.match!, "getMatchInfo")
        .mockImplementation(() => {
          throw new Error("playerMap is null");
        });

      expect(() =>
        bracket.getPlayerMatchInfo(
          playerId1,
          1,
        ),
      ).toThrow("playerMap is null");
    });

    it("returns undefined when player is not found in match info", () => {
      const matchInfo: matchSeedInfoType[] = [
        {
          playerId: playerId3,
        } as matchSeedInfoType,
        {
          playerId: playerId4,
        } as matchSeedInfoType,
      ];

      jest
        .spyOn(bracket.match!, "getMatchInfo")
        .mockReturnValue(matchInfo);

      const result = bracket.getPlayerMatchInfo(
        playerId1,
        1,
      );

      expect(result).toBeUndefined();
    });

    it("returns player match info when player is found", () => {
      const matchPlayers = [
        playerId1,
        playerId2,
      ];

      const matchInfo: matchSeedInfoType[] = [
        {
          playerId: playerId1,
          result: "W",
        } as matchSeedInfoType,
        {
          playerId: playerId2,
          result: "L",
        } as matchSeedInfoType,
      ];

      jest
        .spyOn(bracket.match!, "getMatchPlayers")
        .mockReturnValue(matchPlayers);

      jest
        .spyOn(bracket.match!, "getMatchInfo")
        .mockReturnValue(matchInfo);

      const result = bracket.getPlayerMatchInfo(
        playerId1,
        1,
      );

      expect(result).toEqual({
        brktGameNum: 1,
        playerId: playerId1,
        playerInfo: matchInfo[0],
        matchInfo,
        matchNumber: 0,
        matchPlayers,
      });
    });

    it("uses squad game number mapped from bracket game number", () => {
      /*
      * This bracket uses squad games 4, 5, and 6:
      *
      * bracket game 1 -> squad game 4
      * bracket game 2 -> squad game 5
      * bracket game 3 -> squad game 6
      */
      bracket = createBracket([4, 5, 6]);

      addPlayersToBracket(
        bracket,
        [
          playerId1,
          playerId2,
          playerId3,
          playerId4,
          playerId5,
          playerId6,
          playerId7,
          playerId8,
        ],
      );

      const matchPlayers = [playerId1, playerId2];

      const matchInfo: matchSeedInfoType[] = [
        {
          playerId: playerId1,
          result: "W",
        } as matchSeedInfoType,
        {
          playerId: playerId2,
          result: "L",
        } as matchSeedInfoType,
      ];

      jest
        .spyOn(
          bracket.match!,
          "getMatchPlayers",
        )
        .mockReturnValue(matchPlayers);

      const getMatchInfoSpy = jest
        .spyOn(
          bracket.match!,
          "getMatchInfo",
        )
        .mockReturnValue(matchInfo);

      bracket.getPlayerMatchInfo(playerId1, 1);

      expect(getMatchInfoSpy).toHaveBeenCalledWith(matchPlayers, 4);
    });    

  });

  describe("getPlayerMatchNumber", () => {
    it("returns undefined when player is not in bracket", () => {
      const bracket = createBracket();

      addPlayersToBracket(bracket, fullPlayers);

      expect(
        bracket.getPlayerMatchNumber(
          "player-9",
          1,
        ),
      ).toBeUndefined();
    });

    it("returns undefined when bracket is empty", () => {
      const bracket = createBracket();

      expect(
        bracket.getPlayerMatchNumber(
          "player-1",
          1,
        ),
      ).toBeUndefined();
    });

    it("returns undefined when game number is less than 1", () => {
      const bracket = createBracket();

      addPlayersToBracket(bracket, fullPlayers);

      expect(
        bracket.getPlayerMatchNumber(
          "player-1",
          0,
        ),
      ).toBeUndefined();
    });

    it("returns undefined when game number is greater than number of games", () => {
      const bracket = createBracket();

      addPlayersToBracket(bracket, fullPlayers);

      expect(
        bracket.getPlayerMatchNumber(
          "player-1",
          defaultBrktGames + 1,
        ),
      ).toBeUndefined();
    });

    describe("game 1", () => {
      it.each([
        ["player-1", 0],
        ["player-2", 0],
        ["player-3", 1],
        ["player-4", 1],
        ["player-5", 2],
        ["player-6", 2],
        ["player-7", 3],
        ["player-8", 3],
      ])(
        "returns match %i for %s",
        (playerId, expectedMatch) => {
          const bracket = createBracket();

          addPlayersToBracket(bracket, fullPlayers);

          expect(
            bracket.getPlayerMatchNumber(
              playerId,
              1,
            ),
          ).toBe(expectedMatch);
        },
      );
    });

    describe("game 2", () => {
      it.each([
        ["player-1", 4],
        ["player-2", 4],
        ["player-3", 4],
        ["player-4", 4],
        ["player-5", 5],
        ["player-6", 5],
        ["player-7", 5],
        ["player-8", 5],
      ])(
        "returns match %i for %s",
        (playerId, expectedMatch) => {
          const bracket = createBracket();

          addPlayersToBracket(bracket, fullPlayers);

          expect(
            bracket.getPlayerMatchNumber(
              playerId,
              2,
            ),
          ).toBe(expectedMatch);
        },
      );
    });

    describe("game 3", () => {
      it.each(fullPlayers)(
        "returns match 6 for %s",
        (playerId) => {
          const bracket = createBracket();

          addPlayersToBracket(bracket, fullPlayers);

          expect(bracket.getPlayerMatchNumber(playerId, 3)).toBe(6);
        },
      );
    });
  });

  describe("playerStatus", () => {
    it("returns NOT_IN_BRACKET when player is not in bracket", () => {
      const bracket = createBracket();

      addPlayersToBracket(bracket, fullPlayers);

      expect(
        bracket.playerStatus("not-in-bracket"),
      ).toBe(playerStatusValues.NOT_IN_BRACKET);
    });

    it("returns IN_BRACKET when player is in bracket and has no result", () => {
      const bracket = createBracket();

      addPlayersToBracket(bracket, fullPlayers);

      expect(
        bracket.playerStatus("player-1"),
      ).toBe(playerStatusValues.IN_BRACKET);
    });

    it("returns LOSER after player loses a match", () => {
      const bracket = createBracket();

      addPlayersToBracket(bracket, fullPlayers);

      const matchInfo: matchSeedInfoType[] = [
        {
          playerId: "player-1",
          result: "W",
        } as matchSeedInfoType,
        {
          playerId: "player-2",
          result: "L",
        } as matchSeedInfoType,
      ];

      bracket.updatePlayerSets({
        brktGameNum: 1,
        playerId: "player-2",
        playerInfo: matchInfo[1],
        matchInfo,
        matchNumber: 0,
        matchPlayers: [
          "player-1",
          "player-2",
        ],
      });

      expect(
        bracket.playerStatus("player-2"),
      ).toBe(playerStatusValues.LOSER);
    });

    it("returns RUNNER_UP after player loses the final", () => {
      const bracket = createBracket();

      addPlayersToBracket(bracket, fullPlayers);

      const matchInfo: matchSeedInfoType[] = [
        {
          playerId: "player-1",
          result: "W",
        } as matchSeedInfoType,
        {
          playerId: "player-2",
          result: "L",
        } as matchSeedInfoType,
      ];

      bracket.updatePlayerSets({
        brktGameNum: 3,
        playerId: "player-2",
        playerInfo: matchInfo[1],
        matchInfo,
        matchNumber: 6,
        matchPlayers: [
          "player-1",
          "player-2",
        ],
      });

      expect(
        bracket.playerStatus("player-2"),
      ).toBe(playerStatusValues.RUNNER_UP);
    });

    it("returns WINNER after player wins the final", () => {
      const bracket = createBracket();

      addPlayersToBracket(bracket, fullPlayers);

      const matchInfo: matchSeedInfoType[] = [
        {
          playerId: "player-1",
          result: "W",
        } as matchSeedInfoType,
        {
          playerId: "player-2",
          result: "L",
        } as matchSeedInfoType,
      ];

      bracket.updatePlayerSets({
        brktGameNum: 3,
        playerId: "player-1",
        playerInfo: matchInfo[0],
        matchInfo,
        matchNumber: 6,
        matchPlayers: [
          "player-1",
          "player-2",
        ],
      });

      expect(
        bracket.playerStatus("player-1"),
      ).toBe(playerStatusValues.WINNER);
    });

    it("returns WINNER for both players when final is tied", () => {
      const bracket = createBracket();

      addPlayersToBracket(bracket, fullPlayers);

      const matchInfo: matchSeedInfoType[] = [
        {
          playerId: "player-1",
          result: "T",
        } as matchSeedInfoType,
        {
          playerId: "player-2",
          result: "T",
        } as matchSeedInfoType,
      ];

      bracket.updatePlayerSets({
        brktGameNum: 3,
        playerId: "player-1",
        playerInfo: matchInfo[0],
        matchInfo,
        matchNumber: 6,
        matchPlayers: [
          "player-1",
          "player-2",
        ],
      });

      bracket.updatePlayerSets({
        brktGameNum: 3,
        playerId: "player-2",
        playerInfo: matchInfo[1],
        matchInfo,
        matchNumber: 6,
        matchPlayers: [
          "player-1",
          "player-2",
        ],
      });

      expect(
        bracket.playerStatus("player-1"),
      ).toBe(playerStatusValues.WINNER);

      expect(
        bracket.playerStatus("player-2"),
      ).toBe(playerStatusValues.WINNER);

      // since a tie in the final, there is no runner up, runnerUpIds should be empty
      expect(
        bracket.runnerUpIds,
      ).toEqual(new Set());

    });

  });

  describe("updatePlayerSets", () => {

    const createMatchSeedInfo = (
      playerId: string,
      total: number,
      result: "W" | "L" | "T",
    ): matchSeedInfoType => {
      return {
        playerId,
        first_name: "",
        last_name: "",
        average: 200,
        score: total,
        hdcp: 0,
        total,
        result,
      };
    };

    const createPlayerMatchInfo = (
      brktGameNum: number,
      playerInfo: matchSeedInfoType,
      matchInfo: matchSeedInfoType[],
      matchNumber: 0 | 1 | 2 | 3 | 4 | 5 | 6,
    ) => {
      return {
        brktGameNum,
        playerId: playerInfo.playerId,
        playerInfo,
        matchInfo,
        matchNumber,
        matchPlayers: matchInfo.map(
          (info) => info.playerId,
        ),
      };
    };

    describe("games before the final", () => {
      it("does nothing when player result is undefined", () => {
        const bracket = createBracket();

        const playerInfo: matchSeedInfoType = {
          playerId: playerId1,
          first_name: "",
          last_name: "",
          average: 200,
          score: undefined,
          hdcp: 0,
          total: undefined,
          result: undefined,
        };

        bracket.updatePlayerSets({
          brktGameNum: 1,
          playerId: playerId1,
          playerInfo,
          matchInfo: [playerInfo],
          matchNumber: 0,
          matchPlayers: [playerId1],
        });

        expect(bracket.loserIds).toEqual(new Set());
        expect(bracket.semiFinalTies).toEqual(new Set());
        expect(bracket.runnerUpIds).toEqual(new Set());
        expect(bracket.winnerIds).toEqual(new Set());
      });

      it("adds player to loserIds when player loses", () => {
        const bracket = createBracket();

        const player1 = createMatchSeedInfo(playerId1, 200, "L");
        const player2 = createMatchSeedInfo(playerId2, 210, "W");

        const matchInfo = [player1, player2];

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            1,
            player1,
            matchInfo,
            0,
          ),
        );

        expect(bracket.loserIds).toEqual(new Set([playerId1]));
      });

      it("adds other player to loserIds when player wins", () => {
        const bracket = createBracket();

        const player1 = createMatchSeedInfo(playerId1, 210, "W");
        const player2 = createMatchSeedInfo(playerId2, 200, "L");

        const matchInfo = [player1, player2];

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            1,
            player1,
            matchInfo,
            0,
          ),
        );

        expect(bracket.loserIds).toEqual(new Set([playerId2]));
      });

      it("does not add players to loserIds when game 1 is tied", () => {
        const bracket = createBracket();

        const player1 = createMatchSeedInfo(playerId1, 210, "T");
        const player2 = createMatchSeedInfo(playerId2, 210, "T");

        const matchInfo = [player1, player2];

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            1,
            player1,
            matchInfo,
            0,
          ),
        );

        expect(bracket.loserIds).toEqual(new Set());
        expect(bracket.semiFinalTies).toEqual(new Set());
      });

      it("adds all tied players to semiFinalTies when semifinal is tied", () => {
        const bracket = createBracket();

        const player1 = createMatchSeedInfo(playerId1, 220, "T");
        const player2 = createMatchSeedInfo(playerId2, 220, "T");

        const matchInfo = [player1, player2];

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            2,
            player1,
            matchInfo,
            5,
          ),
        );

        expect(bracket.semiFinalTies).toEqual(
          new Set([
            playerId1,
            playerId2,
          ]),
        );

        expect(bracket.loserIds).toEqual(
          new Set(),
        );
      });
    });

    describe("normal final", () => {
      it("adds losing player to runnerUpIds", () => {
        const bracket = createBracket();

        const player1 = createMatchSeedInfo(playerId1, 220, "L");
        const player2 = createMatchSeedInfo(playerId2, 230, "W");

        const matchInfo = [player1, player2];

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            3,
            player1,
            matchInfo,
            6,
          ),
        );

        expect(bracket.runnerUpIds).toEqual(
          new Set([playerId1]),
        );
      });

      it("adds winning player to winnerIds and other player to runnerUpIds", () => {
        const bracket = createBracket();

        const player1 = createMatchSeedInfo(playerId1, 230, "W");
        const player2 = createMatchSeedInfo(playerId2, 220, "L");

        const matchInfo = [player1, player2];

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            3,
            player1,
            matchInfo,
            6,
          ),
        );

        expect(bracket.winnerIds).toEqual(new Set([playerId1]));
        expect(bracket.runnerUpIds).toEqual(new Set([playerId2]));
        expect(bracket.loserIds).toEqual(new Set());
      });

      it("adds both players to winnerIds when final is tied", () => {
        const bracket = createBracket();

        const player1 = createMatchSeedInfo(playerId1, 230, "T");
        const player2 = createMatchSeedInfo(playerId2, 230, "T");

        const matchInfo = [player1, player2];

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            3,
            player1,
            matchInfo,
            6,
          ),
        );

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            3,
            player2,
            matchInfo,
            6,
          ),
        );

        expect(bracket.winnerIds).toEqual(new Set([playerId1, playerId2]));
        expect(bracket.runnerUpIds).toEqual(new Set());
      });
    });

    describe("final after tie in match 5", () => {
      it("puts both match 5 players in runnerUpIds when they tie behind match 4 winner", () => {
        const bracket = createBracket();

        // Match 5:
        // playerId2 and playerId3 tie and both advance.
        const semi1 = createMatchSeedInfo(playerId2, 220, "T");
        const semi2 = createMatchSeedInfo(playerId3, 220, "T");

        const semiInfo = [semi1, semi2];

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            2,
            semi1,
            semiInfo,
            5,
          ),
        );

        // Match 6:
        // playerId1 wins.
        // playerId2 and playerId3 tie for second.
        const player1 = createMatchSeedInfo(playerId1, 240, "W");
        const player2 = createMatchSeedInfo(playerId2, 230, "L");
        const player3 = createMatchSeedInfo(playerId3, 230, "L");

        const finalInfo = [player1, player2, player3];

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            3,
            player1,
            finalInfo,
            6,
          ),
        );

        expect(bracket.winnerIds).toEqual(new Set([playerId1]));
        expect(bracket.runnerUpIds).toEqual(new Set([playerId2, playerId3]));
        expect(bracket.loserIds).toEqual(new Set());
      });

      it("puts high match 5 player in runnerUpIds and other match 5 player in loserIds", () => {
        const bracket = createBracket();

        // Match 5 tie.
        const semi1 = createMatchSeedInfo(playerId2, 220, "T");
        const semi2 = createMatchSeedInfo(playerId3, 220, "T");

        const semiInfo = [semi1, semi2];

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            2,
            semi1,
            semiInfo,
            5,
          ),
        );

        // Match 6:
        // playerId1 wins.
        // playerId2 is second.
        // playerId3 is loser.
        const player1 = createMatchSeedInfo(playerId1, 240, "W");
        const player2 = createMatchSeedInfo(playerId2, 230, "L");
        const player3 = createMatchSeedInfo(playerId3, 220, "L");

        const finalInfo = [player1, player2, player3];

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            3,
            player1,
            finalInfo,
            6,
          ),
        );

        expect(bracket.winnerIds).toEqual(new Set([playerId1]));
        expect(bracket.runnerUpIds).toEqual(new Set([playerId2]));
        expect(bracket.loserIds).toEqual(new Set([playerId3]));
      });

      it("puts match 4 player in runnerUpIds when match 5 player wins", () => {
        const bracket = createBracket();

        // Match 5 tie.
        const semi1 = createMatchSeedInfo(playerId2, 220, "T");
        const semi2 = createMatchSeedInfo(playerId3, 220, "T");

        const semiInfo = [semi1, semi2];

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            2,
            semi1,
            semiInfo,
            5,
          ),
        );

        // Match 6:
        // playerId2 wins.
        // playerId1 came from match 4 and finishes second.
        // playerId3 came from tied match 5 and loses.
        // playerId1 is second. even though playerId3 has a higher game score.
        //   the tie breaker is only between playerId2 and playerId3 because
        //   playerId2 and playerId3 tied in match 5, and playerId1 won match 4.
        const player1 = createMatchSeedInfo(playerId1, 220, "L");
        const player2 = createMatchSeedInfo(playerId2, 240, "W");
        const player3 = createMatchSeedInfo(playerId3, 230, "L");

        const finalInfo = [player1, player2, player3];

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            3,
            player2,
            finalInfo,
            6,
          ),
        );

        expect(bracket.winnerIds).toEqual(new Set([playerId2]));
        expect(bracket.runnerUpIds).toEqual(new Set([playerId1]));
        expect(bracket.loserIds).toEqual(new Set([playerId3]));
      });

      it("puts both tied match 5 players in winnerIds and match 4 player in runnerUpIds", () => {
        const bracket = createBracket();

        // Match 5 tie.
        const semi1 = createMatchSeedInfo(playerId2, 220, "T");
        const semi2 = createMatchSeedInfo(playerId3, 220, "T");

        const semiInfo = [semi1, semi2];

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            2,
            semi1,
            semiInfo,
            5,
          ),
        );

        // Match 6:
        // Both players from match 5 tie for first.
        // playerId1 from match 4 finishes second.
        const player1 = createMatchSeedInfo(playerId1, 230, "L");
        const player2 = createMatchSeedInfo(playerId2, 240, "T");
        const player3 = createMatchSeedInfo(playerId3, 240, "T");

        const finalInfo = [player1, player2, player3];

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            3,
            player1,
            finalInfo,
            6,
          ),
        );

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            3,
            player2,
            finalInfo,
            6,
          ),
        );

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            3,
            player3,
            finalInfo,
            6,
          ),
        );

        expect(bracket.winnerIds).toEqual(new Set([playerId2, playerId3]));
        expect(bracket.runnerUpIds).toEqual(new Set([playerId1]));
        expect(bracket.loserIds).toEqual(new Set());
      });

      it("puts both tied match 5 players in winnerIds and match 4 player in winnerIds when all three tie", () => {
        const bracket = createBracket();

        // Match 5 tie.
        const semi1 = createMatchSeedInfo(playerId2, 220, "T");
        const semi2 = createMatchSeedInfo(playerId3, 220, "T");

        const semiInfo = [semi1, semi2];

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            2,
            semi1,
            semiInfo,
            5,
          ),
        );

        // Match 6:
        // all three players from match 5 tie for first.        
        const player1 = createMatchSeedInfo(playerId1, 230, "T");
        const player2 = createMatchSeedInfo(playerId2, 230, "T");
        const player3 = createMatchSeedInfo(playerId3, 230, "T");

        const finalInfo = [player1, player2, player3];

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            3,
            player1,
            finalInfo,
            6,
          ),
        );

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            3,
            player2,
            finalInfo,
            6,
          ),
        );

        bracket.updatePlayerSets(
          createPlayerMatchInfo(
            3,
            player3,
            finalInfo,
            6,
          ),
        );

        expect(bracket.winnerIds).toEqual(
          new Set([
            playerId1,
            playerId2,
            playerId3,
          ]),
        );
        expect(bracket.runnerUpIds).toEqual(new Set());
        expect(bracket.loserIds).toEqual(new Set());
      });

    });
  });

});