import {
  Bracket,
  playerStatusValues,
} from "@/components/brackets/bracketClass";
import type { BracketList } from "@/components/brackets/bracketListClass";
import { defaultBrktGames } from "@/lib/db/initVals";
import type {
  matchNumberType,
  matchResultType,
  matchSeedInfoType,
} from "@/components/brackets/bracketMatchClass";
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

type PlayerMatchInfoType = {
  brktGameNum: number;
  playerId: string;
  playerInfo: matchSeedInfoType;
  matchInfo: matchSeedInfoType[];
  matchNumber: matchNumberType;
  matchPlayers: string[];
};

/**
 * Test-only view of Bracket's private methods.
 *
 * This keeps all TypeScript casts needed to test private methods
 * in one place. Production code still treats these methods as private.
 */
type BracketPrivate = {
  getPlayerMatchInfo: (
    playerId: string,
    brktGameNum: number,
  ) => PlayerMatchInfoType | undefined;

  getPlayerMatchNumber: (
    playerId: string,
    brktGameNum: number,
  ) => matchNumberType | undefined;

  updatePlayerSets: (
    pmi: PlayerMatchInfoType,
  ) => void;
};

describe("Bracket Class - getPlayerStatus", () => {
  const fullPlayers = [
    playerId1,
    playerId2,
    playerId3,
    playerId4,
    playerId5,
    playerId6,
    playerId7,
    playerId8,
  ];

  const addPlayersToBracket = (
    bracket: Bracket,
    players: string[],
  ): void => {
    if (
      players.length > 0 &&
      players.length % 2 === 0
    ) {
      for (let i = 0; i < players.length; i += 2) {
        bracket.addMatch([
          players[i],
          players[i + 1],
        ]);
      }
    }
  };

  const createBracketParent = (): BracketList => {
    return {
      games: defaultBrktGames,
    } as BracketList;
  };  

  const createBracket = (): Bracket => {
    const bracket = new Bracket(
      oneBrktId1,
    );

    bracket.parent = createBracketParent();

    addPlayersToBracket(
      bracket,
      fullPlayers,
    );

    return bracket;
  };

  const createMatchSeedInfo = (
    playerId: string,
    total: number | undefined,
    result: matchResultType,
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
    matchNumber: matchNumberType,
  ): PlayerMatchInfoType => {
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

  /**
   * Get test-only access to Bracket's private methods.
   */
  const getPrivateBracket = (
    bracket: Bracket,
  ): BracketPrivate => {
    return bracket as unknown as BracketPrivate;
  };

  /**
   * Spy on private getPlayerMatchInfo().
   */
  const spyOnGetPlayerMatchInfo = (
    bracket: Bracket,
  ) => {
    return jest.spyOn(
      getPrivateBracket(bracket),
      "getPlayerMatchInfo",
    );
  };

  /**
   * Spy on private getPlayerMatchNumber().
   */
  const spyOnGetPlayerMatchNumber = (
    bracket: Bracket,
  ) => {
    return jest.spyOn(
      getPrivateBracket(bracket),
      "getPlayerMatchNumber",
    );
  };

  /**
   * Spy on private updatePlayerSets().
   *
   * Unless mockImplementation() is used by a test,
   * the real private method still runs.
   */
  const spyOnUpdatePlayerSets = (
    bracket: Bracket,
  ) => {
    return jest.spyOn(
      getPrivateBracket(bracket),
      "updatePlayerSets",
    );
  };

  /**
   * Mock getPlayerMatchInfo() using player id + game number.
   *
   * This is easier to maintain than a long chain of
   * mockReturnValueOnce() calls, especially when a test calls
   * getPlayerStatus() for several players.
   */
  const mockPlayerMatchInfo = (
    bracket: Bracket,
    playerMatchInfos: PlayerMatchInfoType[],
  ): void => {
    const pmiMap = new Map<
      string,
      PlayerMatchInfoType
    >();

    playerMatchInfos.forEach((pmi) => {
      pmiMap.set(
        `${pmi.playerId}-${pmi.brktGameNum}`,
        pmi,
      );
    });

    spyOnGetPlayerMatchInfo(
      bracket,
    ).mockImplementation(
      (
        playerId: string,
        gameNum: number,
      ): PlayerMatchInfoType | undefined => {
        return pmiMap.get(
          `${playerId}-${gameNum}`,
        );
      },
    );
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("basic status", () => {
    it("returns NOT_IN_BRACKET when player is not in bracket", () => {
      const bracket = createBracket();

      const getPlayerMatchInfoSpy =
        spyOnGetPlayerMatchInfo(
          bracket,
        );

      const getPlayerMatchNumberSpy =
        spyOnGetPlayerMatchNumber(
          bracket,
        );

      const updatePlayerSetsSpy =
        spyOnUpdatePlayerSets(
          bracket,
        );

      expect(
        bracket.getPlayerStatus(
          "player-not-in-bracket",
        ),
      ).toBe(
        playerStatusValues.NOT_IN_BRACKET,
      );

      expect(
        getPlayerMatchInfoSpy,
      ).not.toHaveBeenCalled();

      expect(
        getPlayerMatchNumberSpy,
      ).not.toHaveBeenCalled();

      expect(
        updatePlayerSetsSpy,
      ).not.toHaveBeenCalled();
    });

    it("returns IN_BRACKET when game 1 match info is not available", () => {
      const bracket = createBracket();

      spyOnGetPlayerMatchInfo(
        bracket,
      ).mockReturnValue(undefined);

      expect(
        bracket.getPlayerStatus(
          playerId1,
        ),
      ).toBe(
        playerStatusValues.IN_BRACKET,
      );
    });

    it("returns IN_BRACKET when game 1 does not have a result yet", () => {
      const bracket = createBracket();

      const player1 =
        createMatchSeedInfo(
          playerId1,
          undefined,
          undefined,
        );

      const player2 =
        createMatchSeedInfo(
          playerId2,
          undefined,
          undefined,
        );

      mockPlayerMatchInfo(
        bracket,
        [
          createPlayerMatchInfo(
            1,
            player1,
            [
              player1,
              player2,
            ],
            0,
          ),
        ],
      );

      expect(
        bracket.getPlayerStatus(
          playerId1,
        ),
      ).toBe(
        playerStatusValues.IN_BRACKET,
      );
    });
  });

  describe("game 1", () => {
    it("returns LOSER when player loses game 1", () => {
      const bracket = createBracket();

      const player1 =
        createMatchSeedInfo(
          playerId1,
          200,
          "L",
        );

      const player2 =
        createMatchSeedInfo(
          playerId2,
          210,
          "W",
        );

      mockPlayerMatchInfo(
        bracket,
        [
          createPlayerMatchInfo(
            1,
            player1,
            [
              player1,
              player2,
            ],
            0,
          ),
        ],
      );

      const updatePlayerSetsSpy =
        spyOnUpdatePlayerSets(
          bracket,
        );

      expect(
        bracket.getPlayerStatus(
          playerId1,
        ),
      ).toBe(
        playerStatusValues.LOSER,
      );

      expect(
        updatePlayerSetsSpy,
      ).toHaveBeenCalledTimes(1);
    });

    it("returns IN_BRACKET when player wins game 1 and game 2 is not available", () => {
      const bracket = createBracket();

      const player1 =
        createMatchSeedInfo(
          playerId1,
          210,
          "W",
        );

      const player2 =
        createMatchSeedInfo(
          playerId2,
          200,
          "L",
        );

      mockPlayerMatchInfo(
        bracket,
        [
          createPlayerMatchInfo(
            1,
            player1,
            [
              player1,
              player2,
            ],
            0,
          ),
        ],
      );

      expect(
        bracket.getPlayerStatus(
          playerId1,
        ),
      ).toBe(
        playerStatusValues.IN_BRACKET,
      );
    });

    it("returns IN_BRACKET when game 1 is tied and game 2 is not available", () => {
      const bracket = createBracket();

      const player1 =
        createMatchSeedInfo(
          playerId1,
          210,
          "T",
        );

      const player2 =
        createMatchSeedInfo(
          playerId2,
          210,
          "T",
        );

      mockPlayerMatchInfo(
        bracket,
        [
          createPlayerMatchInfo(
            1,
            player1,
            [
              player1,
              player2,
            ],
            0,
          ),
        ],
      );

      expect(
        bracket.getPlayerStatus(
          playerId1,
        ),
      ).toBe(
        playerStatusValues.IN_BRACKET,
      );
    });
  });

  describe("game 2 - semifinal", () => {
    it("returns LOSER when player loses semifinal", () => {
      const bracket = createBracket();

      const game1Player1 =
        createMatchSeedInfo(
          playerId1,
          220,
          "W",
        );

      const game1Player2 =
        createMatchSeedInfo(
          playerId2,
          210,
          "L",
        );

      const semiPlayer1 =
        createMatchSeedInfo(
          playerId1,
          220,
          "L",
        );

      const semiPlayer3 =
        createMatchSeedInfo(
          playerId3,
          230,
          "W",
        );

      mockPlayerMatchInfo(
        bracket,
        [
          createPlayerMatchInfo(
            1,
            game1Player1,
            [
              game1Player1,
              game1Player2,
            ],
            0,
          ),
          createPlayerMatchInfo(
            2,
            semiPlayer1,
            [
              semiPlayer1,
              semiPlayer3,
            ],
            4,
          ),
        ],
      );

      expect(
        bracket.getPlayerStatus(
          playerId1,
        ),
      ).toBe(
        playerStatusValues.LOSER,
      );
    });

    it("returns IN_BRACKET when player wins semifinal and final is not available", () => {
      const bracket = createBracket();

      const game1Player1 =
        createMatchSeedInfo(
          playerId1,
          220,
          "W",
        );

      const game1Player2 =
        createMatchSeedInfo(
          playerId2,
          210,
          "L",
        );

      const semiPlayer1 =
        createMatchSeedInfo(
          playerId1,
          230,
          "W",
        );

      const semiPlayer3 =
        createMatchSeedInfo(
          playerId3,
          220,
          "L",
        );

      mockPlayerMatchInfo(
        bracket,
        [
          createPlayerMatchInfo(
            1,
            game1Player1,
            [
              game1Player1,
              game1Player2,
            ],
            0,
          ),
          createPlayerMatchInfo(
            2,
            semiPlayer1,
            [
              semiPlayer1,
              semiPlayer3,
            ],
            4,
          ),
        ],
      );

      expect(
        bracket.getPlayerStatus(
          playerId1,
        ),
      ).toBe(
        playerStatusValues.IN_BRACKET,
      );
    });

    it("returns IN_BRACKET after semifinal tie when final is not available", () => {
      const bracket = createBracket();

      const game1Player5 =
        createMatchSeedInfo(
          playerId5,
          220,
          "W",
        );

      const game1Player6 =
        createMatchSeedInfo(
          playerId6,
          210,
          "L",
        );

      const semiPlayer5 =
        createMatchSeedInfo(
          playerId5,
          230,
          "T",
        );

      const semiPlayer7 =
        createMatchSeedInfo(
          playerId7,
          230,
          "T",
        );

      mockPlayerMatchInfo(
        bracket,
        [
          createPlayerMatchInfo(
            1,
            game1Player5,
            [
              game1Player5,
              game1Player6,
            ],
            2,
          ),
          createPlayerMatchInfo(
            2,
            semiPlayer5,
            [
              semiPlayer5,
              semiPlayer7,
            ],
            5,
          ),
        ],
      );

      expect(
        bracket.getPlayerStatus(
          playerId5,
        ),
      ).toBe(
        playerStatusValues.IN_BRACKET,
      );
    });
  });

  describe("normal final", () => {
    it("returns WINNER when player wins final", () => {
      const bracket = createBracket();

      const game1Player1 =
        createMatchSeedInfo(
          playerId1,
          220,
          "W",
        );

      const game1Player2 =
        createMatchSeedInfo(
          playerId2,
          210,
          "L",
        );

      const semiPlayer1 =
        createMatchSeedInfo(
          playerId1,
          230,
          "W",
        );

      const semiPlayer3 =
        createMatchSeedInfo(
          playerId3,
          220,
          "L",
        );

      const finalPlayer1 =
        createMatchSeedInfo(
          playerId1,
          240,
          "W",
        );

      const finalPlayer5 =
        createMatchSeedInfo(
          playerId5,
          230,
          "L",
        );

      mockPlayerMatchInfo(
        bracket,
        [
          createPlayerMatchInfo(
            1,
            game1Player1,
            [
              game1Player1,
              game1Player2,
            ],
            0,
          ),
          createPlayerMatchInfo(
            2,
            semiPlayer1,
            [
              semiPlayer1,
              semiPlayer3,
            ],
            4,
          ),
          createPlayerMatchInfo(
            3,
            finalPlayer1,
            [
              finalPlayer1,
              finalPlayer5,
            ],
            6,
          ),
        ],
      );

      expect(
        bracket.getPlayerStatus(
          playerId1,
        ),
      ).toBe(
        playerStatusValues.WINNER,
      );
    });

    it("returns RUNNER_UP when player loses final", () => {
      const bracket = createBracket();

      const game1Player1 =
        createMatchSeedInfo(
          playerId1,
          220,
          "W",
        );

      const game1Player2 =
        createMatchSeedInfo(
          playerId2,
          210,
          "L",
        );

      const semiPlayer1 =
        createMatchSeedInfo(
          playerId1,
          230,
          "W",
        );

      const semiPlayer3 =
        createMatchSeedInfo(
          playerId3,
          220,
          "L",
        );

      const finalPlayer1 =
        createMatchSeedInfo(
          playerId1,
          230,
          "L",
        );

      const finalPlayer5 =
        createMatchSeedInfo(
          playerId5,
          240,
          "W",
        );

      mockPlayerMatchInfo(
        bracket,
        [
          createPlayerMatchInfo(
            1,
            game1Player1,
            [
              game1Player1,
              game1Player2,
            ],
            0,
          ),
          createPlayerMatchInfo(
            2,
            semiPlayer1,
            [
              semiPlayer1,
              semiPlayer3,
            ],
            4,
          ),
          createPlayerMatchInfo(
            3,
            finalPlayer1,
            [
              finalPlayer1,
              finalPlayer5,
            ],
            6,
          ),
        ],
      );

      expect(
        bracket.getPlayerStatus(
          playerId1,
        ),
      ).toBe(
        playerStatusValues.RUNNER_UP,
      );
    });

    it("returns WINNER for both players when final is tied", () => {
      const bracket = createBracket();

      const game1Player1 =
        createMatchSeedInfo(
          playerId1,
          220,
          "W",
        );

      const game1Player2 =
        createMatchSeedInfo(
          playerId2,
          210,
          "L",
        );

      const semiPlayer1 =
        createMatchSeedInfo(
          playerId1,
          230,
          "W",
        );

      const semiPlayer3 =
        createMatchSeedInfo(
          playerId3,
          220,
          "L",
        );

      const game1Player5 =
        createMatchSeedInfo(
          playerId5,
          220,
          "W",
        );

      const game1Player6 =
        createMatchSeedInfo(
          playerId6,
          210,
          "L",
        );

      const semiPlayer5 =
        createMatchSeedInfo(
          playerId5,
          230,
          "W",
        );

      const semiPlayer7 =
        createMatchSeedInfo(
          playerId7,
          220,
          "L",
        );

      const finalPlayer1 =
        createMatchSeedInfo(
          playerId1,
          240,
          "T",
        );

      const finalPlayer5 =
        createMatchSeedInfo(
          playerId5,
          240,
          "T",
        );

      const finalInfo = [
        finalPlayer1,
        finalPlayer5,
      ];

      mockPlayerMatchInfo(
        bracket,
        [
          createPlayerMatchInfo(
            1,
            game1Player1,
            [
              game1Player1,
              game1Player2,
            ],
            0,
          ),
          createPlayerMatchInfo(
            2,
            semiPlayer1,
            [
              semiPlayer1,
              semiPlayer3,
            ],
            4,
          ),
          createPlayerMatchInfo(
            3,
            finalPlayer1,
            finalInfo,
            6,
          ),

          createPlayerMatchInfo(
            1,
            game1Player5,
            [
              game1Player5,
              game1Player6,
            ],
            2,
          ),
          createPlayerMatchInfo(
            2,
            semiPlayer5,
            [
              semiPlayer5,
              semiPlayer7,
            ],
            5,
          ),
          createPlayerMatchInfo(
            3,
            finalPlayer5,
            finalInfo,
            6,
          ),
        ],
      );

      expect(
        bracket.getPlayerStatus(
          playerId1,
        ),
      ).toBe(
        playerStatusValues.WINNER,
      );

      expect(
        bracket.getPlayerStatus(
          playerId5,
        ),
      ).toBe(
        playerStatusValues.WINNER,
      );
    });
  });

  describe("final after tie in match 5", () => {
    it("returns RUNNER_UP for both match 5 players when they tie behind match 4 winner", () => {
      const bracket = createBracket();

      const game1Player5 =
        createMatchSeedInfo(
          playerId5,
          220,
          "W",
        );

      const game1Player6 =
        createMatchSeedInfo(
          playerId6,
          210,
          "L",
        );

      const semiPlayer5 =
        createMatchSeedInfo(
          playerId5,
          220,
          "T",
        );

      const semiPlayer7 =
        createMatchSeedInfo(
          playerId7,
          220,
          "T",
        );

      const game1Player1 =
        createMatchSeedInfo(
          playerId1,
          220,
          "W",
        );

      const game1Player2 =
        createMatchSeedInfo(
          playerId2,
          210,
          "L",
        );

      const semiPlayer1 =
        createMatchSeedInfo(
          playerId1,
          230,
          "W",
        );

      const semiPlayer3 =
        createMatchSeedInfo(
          playerId3,
          220,
          "L",
        );

      const finalPlayer1 =
        createMatchSeedInfo(
          playerId1,
          240,
          "W",
        );

      const finalPlayer5 =
        createMatchSeedInfo(
          playerId5,
          230,
          "L",
        );

      const finalPlayer7 =
        createMatchSeedInfo(
          playerId7,
          230,
          "L",
        );

      const finalInfo = [
        finalPlayer1,
        finalPlayer5,
        finalPlayer7,
      ];

      mockPlayerMatchInfo(
        bracket,
        [
          createPlayerMatchInfo(
            1,
            game1Player5,
            [
              game1Player5,
              game1Player6,
            ],
            2,
          ),
          createPlayerMatchInfo(
            2,
            semiPlayer5,
            [
              semiPlayer5,
              semiPlayer7,
            ],
            5,
          ),

          createPlayerMatchInfo(
            1,
            game1Player1,
            [
              game1Player1,
              game1Player2,
            ],
            0,
          ),
          createPlayerMatchInfo(
            2,
            semiPlayer1,
            [
              semiPlayer1,
              semiPlayer3,
            ],
            4,
          ),
          createPlayerMatchInfo(
            3,
            finalPlayer1,
            finalInfo,
            6,
          ),
        ],
      );

      // First record the semifinal tie.
      expect(
        bracket.getPlayerStatus(
          playerId5,
        ),
      ).toBe(
        playerStatusValues.IN_BRACKET,
      );

      // Processing the winner determines the final
      // status of the other finalists.
      expect(
        bracket.getPlayerStatus(
          playerId1,
        ),
      ).toBe(
        playerStatusValues.WINNER,
      );

      expect(
        bracket.getPlayerStatus(
          playerId5,
        ),
      ).toBe(
        playerStatusValues.RUNNER_UP,
      );

      expect(
        bracket.getPlayerStatus(
          playerId7,
        ),
      ).toBe(
        playerStatusValues.RUNNER_UP,
      );
    });

    it("returns RUNNER_UP for high match 5 player and LOSER for other match 5 player", () => {
      const bracket = createBracket();

      const game1Player5 =
        createMatchSeedInfo(
          playerId5,
          220,
          "W",
        );

      const game1Player6 =
        createMatchSeedInfo(
          playerId6,
          210,
          "L",
        );

      const semiPlayer5 =
        createMatchSeedInfo(
          playerId5,
          220,
          "T",
        );

      const semiPlayer7 =
        createMatchSeedInfo(
          playerId7,
          220,
          "T",
        );

      const game1Player1 =
        createMatchSeedInfo(
          playerId1,
          220,
          "W",
        );

      const game1Player2 =
        createMatchSeedInfo(
          playerId2,
          210,
          "L",
        );

      const semiPlayer1 =
        createMatchSeedInfo(
          playerId1,
          230,
          "W",
        );

      const semiPlayer3 =
        createMatchSeedInfo(
          playerId3,
          220,
          "L",
        );

      const finalPlayer1 =
        createMatchSeedInfo(
          playerId1,
          240,
          "W",
        );

      const finalPlayer5 =
        createMatchSeedInfo(
          playerId5,
          230,
          "L",
        );

      const finalPlayer7 =
        createMatchSeedInfo(
          playerId7,
          220,
          "L",
        );

      const finalInfo = [
        finalPlayer1,
        finalPlayer5,
        finalPlayer7,
      ];

      mockPlayerMatchInfo(
        bracket,
        [
          createPlayerMatchInfo(
            1,
            game1Player5,
            [
              game1Player5,
              game1Player6,
            ],
            2,
          ),
          createPlayerMatchInfo(
            2,
            semiPlayer5,
            [
              semiPlayer5,
              semiPlayer7,
            ],
            5,
          ),

          createPlayerMatchInfo(
            1,
            game1Player1,
            [
              game1Player1,
              game1Player2,
            ],
            0,
          ),
          createPlayerMatchInfo(
            2,
            semiPlayer1,
            [
              semiPlayer1,
              semiPlayer3,
            ],
            4,
          ),
          createPlayerMatchInfo(
            3,
            finalPlayer1,
            finalInfo,
            6,
          ),
        ],
      );

      // Record the semifinal tie first.
      expect(
        bracket.getPlayerStatus(
          playerId5,
        ),
      ).toBe(
        playerStatusValues.IN_BRACKET,
      );

      expect(
        bracket.getPlayerStatus(
          playerId1,
        ),
      ).toBe(
        playerStatusValues.WINNER,
      );

      expect(
        bracket.getPlayerStatus(
          playerId5,
        ),
      ).toBe(
        playerStatusValues.RUNNER_UP,
      );

      expect(
        bracket.getPlayerStatus(
          playerId7,
        ),
      ).toBe(
        playerStatusValues.LOSER,
      );
    });

    it("returns RUNNER_UP for match 4 player when match 5 player wins", () => {
      const bracket = createBracket();

      const game1Player5 =
        createMatchSeedInfo(
          playerId5,
          220,
          "W",
        );

      const game1Player6 =
        createMatchSeedInfo(
          playerId6,
          210,
          "L",
        );

      const semiPlayer5 =
        createMatchSeedInfo(
          playerId5,
          220,
          "T",
        );

      const semiPlayer7 =
        createMatchSeedInfo(
          playerId7,
          220,
          "T",
        );

      const finalPlayer1 =
        createMatchSeedInfo(
          playerId1,
          220,
          "L",
        );

      const finalPlayer5 =
        createMatchSeedInfo(
          playerId5,
          240,
          "W",
        );

      const finalPlayer7 =
        createMatchSeedInfo(
          playerId7,
          230,
          "L",
        );

      const finalInfo = [
        finalPlayer1,
        finalPlayer5,
        finalPlayer7,
      ];

      mockPlayerMatchInfo(
        bracket,
        [
          createPlayerMatchInfo(
            1,
            game1Player5,
            [
              game1Player5,
              game1Player6,
            ],
            2,
          ),
          createPlayerMatchInfo(
            2,
            semiPlayer5,
            [
              semiPlayer5,
              semiPlayer7,
            ],
            5,
          ),
          createPlayerMatchInfo(
            3,
            finalPlayer5,
            finalInfo,
            6,
          ),
        ],
      );

      expect(
        bracket.getPlayerStatus(
          playerId5,
        ),
      ).toBe(
        playerStatusValues.WINNER,
      );

      expect(
        bracket.getPlayerStatus(
          playerId1,
        ),
      ).toBe(
        playerStatusValues.RUNNER_UP,
      );

      expect(
        bracket.getPlayerStatus(
          playerId7,
        ),
      ).toBe(
        playerStatusValues.LOSER,
      );
    });

    it("returns WINNER for both tied match 5 players and LOSER for match 4 player", () => {
      const bracket = createBracket();

      const game1Player1 =
        createMatchSeedInfo(
          playerId1,
          221,
          "W",
        );
      const game1Player2 =
        createMatchSeedInfo(
          playerId2,
          199,
          "L",
        );

      const game1Player5 =
        createMatchSeedInfo(
          playerId5,
          220,
          "W",
        );
      const game1Player6 =
        createMatchSeedInfo(
          playerId6,
          210,
          "L",
        );

      const game1Player7 =
        createMatchSeedInfo(
          playerId7,
          220,
          "W",
        );
      const game1Player8 =
        createMatchSeedInfo(
          playerId8,
          210,
          "L",
        );

      const semiPlayer1 =
        createMatchSeedInfo(
          playerId1,
          222,
          "W",
        );
      const semiPlayer3 =
        createMatchSeedInfo(
          playerId3,
          189,
          "L",
        );

      
      const semiPlayer5 =
        createMatchSeedInfo(
          playerId5,
          220,
          "T",
        );

      const semiPlayer7 =
        createMatchSeedInfo(
          playerId7,
          220,
          "T",
        );

      const finalPlayer1 =
        createMatchSeedInfo(
          playerId1,
          230,
          "L",
        );

      const finalPlayer5 =
        createMatchSeedInfo(
          playerId5,
          240,
          "T",
        );

      const finalPlayer7 =
        createMatchSeedInfo(
          playerId7,
          240,
          "T",
        );

      const finalInfo = [
        finalPlayer1,
        finalPlayer5,
        finalPlayer7,
      ];

      mockPlayerMatchInfo(
        bracket,
        [
          createPlayerMatchInfo(
            1,
            game1Player5,
            [
              game1Player5,
              game1Player6,
            ],
            2,
          ),
          createPlayerMatchInfo(
            2,
            semiPlayer5,
            [
              semiPlayer5,
              semiPlayer7,
            ],
            5,
          ),
          createPlayerMatchInfo(
            3,
            finalPlayer5,
            finalInfo,
            6,
          ),

          createPlayerMatchInfo(
            1,
            game1Player7,
            [
              game1Player7,
              game1Player8,
            ],
            3,
          ),
          createPlayerMatchInfo(
            2,
            semiPlayer7,
            [
              semiPlayer5,
              semiPlayer7,
            ],
            5,
          ),
          createPlayerMatchInfo(
            3,
            finalPlayer7,
            finalInfo,
            6,
          ),
          createPlayerMatchInfo(
            1,
            game1Player1,
            [
              game1Player1,
              game1Player2,
            ],
            0,
          ),
          createPlayerMatchInfo(
            2,
            semiPlayer1,
            [
              semiPlayer1,
              semiPlayer3,
            ],
            4,
          ),
          createPlayerMatchInfo(
            3,
            finalPlayer1,
            finalInfo,
            6,
          ),
        ],
      );

      expect(
        bracket.getPlayerStatus(
          playerId5,
        ),
      ).toBe(
        playerStatusValues.WINNER,
      );

      expect(
        bracket.getPlayerStatus(
          playerId7,
        ),
      ).toBe(
        playerStatusValues.WINNER,
      );

      expect(
        bracket.getPlayerStatus(
          playerId1,
        ),
      ).toBe(
        playerStatusValues.RUNNER_UP,
      );
    });

    it("returns WINNER for all three finalists when all three tie", () => {
      const bracket = createBracket();

      const game1Player1 =
        createMatchSeedInfo(
          playerId1,
          220,
          "W",
        );

      const game1Player2 =
        createMatchSeedInfo(
          playerId2,
          210,
          "L",
        );

      const semiPlayer1 =
        createMatchSeedInfo(
          playerId1,
          230,
          "W",
        );

      const semiPlayer3 =
        createMatchSeedInfo(
          playerId3,
          220,
          "L",
        );

      const game1Player5 =
        createMatchSeedInfo(
          playerId5,
          220,
          "W",
        );

      const game1Player6 =
        createMatchSeedInfo(
          playerId6,
          210,
          "L",
        );

      const game1Player7 =
        createMatchSeedInfo(
          playerId7,
          220,
          "W",
        );

      const game1Player8 =
        createMatchSeedInfo(
          playerId8,
          210,
          "L",
        );

      const semiPlayer5 =
        createMatchSeedInfo(
          playerId5,
          220,
          "T",
        );

      const semiPlayer7 =
        createMatchSeedInfo(
          playerId7,
          220,
          "T",
        );

      const finalPlayer1 =
        createMatchSeedInfo(
          playerId1,
          240,
          "T",
        );

      const finalPlayer5 =
        createMatchSeedInfo(
          playerId5,
          240,
          "T",
        );

      const finalPlayer7 =
        createMatchSeedInfo(
          playerId7,
          240,
          "T",
        );

      const finalInfo = [
        finalPlayer1,
        finalPlayer5,
        finalPlayer7,
      ];

      mockPlayerMatchInfo(
        bracket,
        [
          createPlayerMatchInfo(
            1,
            game1Player1,
            [
              game1Player1,
              game1Player2,
            ],
            0,
          ),
          createPlayerMatchInfo(
            2,
            semiPlayer1,
            [
              semiPlayer1,
              semiPlayer3,
            ],
            4,
          ),
          createPlayerMatchInfo(
            3,
            finalPlayer1,
            finalInfo,
            6,
          ),

          createPlayerMatchInfo(
            1,
            game1Player5,
            [
              game1Player5,
              game1Player6,
            ],
            2,
          ),
          createPlayerMatchInfo(
            2,
            semiPlayer5,
            [
              semiPlayer5,
              semiPlayer7,
            ],
            5,
          ),
          createPlayerMatchInfo(
            3,
            finalPlayer5,
            finalInfo,
            6,
          ),

          createPlayerMatchInfo(
            1,
            game1Player7,
            [
              game1Player7,
              game1Player8,
            ],
            3,
          ),
          createPlayerMatchInfo(
            2,
            semiPlayer7,
            [
              semiPlayer5,
              semiPlayer7,
            ],
            5,
          ),
          createPlayerMatchInfo(
            3,
            finalPlayer7,
            finalInfo,
            6,
          ),
        ],
      );

      expect(
        bracket.getPlayerStatus(
          playerId1,
        ),
      ).toBe(
        playerStatusValues.WINNER,
      );

      expect(
        bracket.getPlayerStatus(
          playerId5,
        ),
      ).toBe(
        playerStatusValues.WINNER,
      );

      expect(
        bracket.getPlayerStatus(
          playerId7,
        ),
      ).toBe(
        playerStatusValues.WINNER,
      );
    });
  });
});