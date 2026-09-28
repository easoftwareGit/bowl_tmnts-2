import { Bracket } from "@/components/brackets/bracketClass";
import type { BracketList } from "@/components/brackets/bracketListClass";
import { defaultBrktGames } from "@/lib/db/initVals";
import {
  mockTmntFullData,
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
import { cloneDeep } from "lodash";

describe("BracketClass - populateBracket", () => {
  /**
   * Creates a bracket with the minimum parent data needed
   * to determine the number of players in the bracket.
   *
   * Bracket gets its number of games from its parent BracketList.
   */
  const createBracket = (fee: number = 5): Bracket => {
    const bracket = new Bracket();

    bracket.parent = {
      games: defaultBrktGames,
      brkt: {
        fee,
      },
    } as unknown as BracketList;

    return bracket;
  };

  const getBracketSeeds = () => {
    return cloneDeep(
      mockTmntFullData.brktSeeds.filter(
        (seed) => seed.one_brkt_id === oneBrktId1,
      ),
    );
  };

  it("should populate the bracket with players in seed order", () => {
    const bracket = createBracket();
    const brktSeeds = getBracketSeeds();

    bracket.populateBracket(brktSeeds);

    expect(bracket.players).toEqual([
      playerId1,
      playerId2,
      playerId3,
      playerId4,
      playerId5,
      playerId6,
      playerId7,
      playerId8,
    ]);
  });

  it("should calculate prize amounts after populating a full bracket", () => {
    const bracket = createBracket(5);
    const brktSeeds = getBracketSeeds();

    bracket.populateBracket(brktSeeds);

    expect(bracket.hasByePlayer()).toBe(false);
    expect(bracket.winnerAmount).toBe(25);
    expect(bracket.runnerUpAmount).toBe(10);
  });

  it("should calculate prize amounts after populating a bracket with a bye", () => {
    const bracket = createBracket(5);
    const brktSeeds = getBracketSeeds();

    brktSeeds[7].player_id = Bracket.byePlayerId;

    bracket.populateBracket(brktSeeds);

    expect(bracket.hasByePlayer()).toBe(true);
    expect(bracket.winnerAmount).toBe(20);
    expect(bracket.runnerUpAmount).toBe(10);
  });  

  it("should calculate prize amounts using the bracket fee", () => {
    const bracket = createBracket(10);

    bracket.populateBracket(getBracketSeeds());

    expect(bracket.winnerAmount).toBe(50);
    expect(bracket.runnerUpAmount).toBe(20);
  });

  it("should sort bracket seeds before populating the bracket", () => {
    const bracket = createBracket();
    const brktSeeds = getBracketSeeds().reverse();

    bracket.populateBracket(brktSeeds);

    expect(bracket.players).toEqual([
      playerId1,
      playerId2,
      playerId3,
      playerId4,
      playerId5,
      playerId6,
      playerId7,
      playerId8,
    ]);
  });

  it("should populate the bracket as four first-round matches", () => {
    const bracket = createBracket();

    bracket.populateBracket(
      getBracketSeeds(),
    );

    expect(
      bracket.players.slice(0, 2),
    ).toEqual([
      playerId1,
      playerId2,
    ]);

    expect(
      bracket.players.slice(2, 4),
    ).toEqual([
      playerId3,
      playerId4,
    ]);

    expect(
      bracket.players.slice(4, 6),
    ).toEqual([
      playerId5,
      playerId6,
    ]);

    expect(
      bracket.players.slice(6, 8),
    ).toEqual([
      playerId7,
      playerId8,
    ]);
  });

  it("should make the bracket full after populating all seeds", () => {
    const bracket = createBracket();
    bracket.populateBracket(getBracketSeeds());

    expect(
      bracket.players,
    ).toHaveLength(
      bracket.playersPerBracket,
    );

    expect(bracket.isFull).toBe(true);
    expect(bracket.numEmptySpots()).toBe(0);
  });

  it("should NOT populate when there are too few bracket seeds", () => {
    const bracket = createBracket();
    const brktSeeds = getBracketSeeds().slice(0, 7);

    bracket.populateBracket(brktSeeds);

    expect(bracket.players).toEqual([]);
  });

  it("should NOT populate when there are too many bracket seeds", () => {
    const bracket = createBracket();
    const seeds = getBracketSeeds();

    const brktSeeds = [
      ...seeds,
      seeds[0],
    ];

    bracket.populateBracket(brktSeeds);

    expect(bracket.players).toEqual([]);
  });

  it("should NOT populate when bracket seeds is empty", () => {
    const bracket = createBracket();

    bracket.populateBracket([]);

    expect(bracket.players).toEqual([]);
  });

  it("should NOT populate when bracket seeds is null", () => {
    const bracket = createBracket();

    bracket.populateBracket(null as any);

    expect(bracket.players).toEqual([]);
  });

  it("should NOT populate when bracket seeds is not an array", () => {
    const bracket = createBracket();

    bracket.populateBracket({} as any);

    expect(bracket.players).toEqual([]);
  });

  it("should NOT populate when bracket seeds contain a duplicate seed", () => {
    const bracket = createBracket();
    const brktSeeds = getBracketSeeds();

    brktSeeds[7].seed = brktSeeds[6].seed;
    bracket.populateBracket(brktSeeds);

    expect(bracket.players).toEqual([]);
  });

  it("should NOT populate when a bracket seed is less than zero", () => {
    const bracket = createBracket();
    const brktSeeds = getBracketSeeds();

    brktSeeds[0].seed = -1;
    bracket.populateBracket(brktSeeds);

    expect(bracket.players).toEqual([]);
  });

  it("should NOT populate when a bracket seed is greater than seven", () => {
    const bracket = createBracket();
    const brktSeeds = getBracketSeeds();

    brktSeeds[7].seed = 8;
    bracket.populateBracket(brktSeeds);

    expect(bracket.players).toEqual([]);
  });

  it("should NOT populate when bracket seeds contain a duplicate player", () => {
    const bracket = createBracket();
    const brktSeeds = getBracketSeeds();

    brktSeeds[7].player_id = brktSeeds[6].player_id;
    bracket.populateBracket(brktSeeds);

    expect(bracket.players).toEqual([]);
  });

});
