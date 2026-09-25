/* 
  NOTE - these tests are for private functions in the Bracket Class
  before running these tests, make sure to change the functions to public
*/
import { Bracket } from "@/components/brackets/bracketClass";
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

describe("Bracket Class - getPlayerMatchInfo", () => {

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