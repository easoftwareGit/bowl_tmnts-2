import { Bracket } from "@/components/brackets/bracketClass";
import type { BracketList } from "@/components/brackets/bracketListClass";
import {
  byeId,
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
import { brktSeedType } from "@/lib/types/types";

describe("BracketClass - parent", () => {
  describe("set parent", () => {
    it("sets the parent", () => {
      const bracket = new Bracket(oneBrktId1);

      const parent = {
        games: 3,
      } as BracketList;

      bracket.parent = parent;

      expect(bracket.parent).toBe(parent);
    });

    it("sets the parent to undefined", () => {
      const bracket = new Bracket(oneBrktId1);

      const parent = {
        games: 3,
      } as BracketList;

      bracket.parent = parent;
      expect(bracket.parent).toBe(parent);

      bracket.parent = undefined;

      expect(bracket.parent).toBeUndefined();
    });

    it("creates a new BracketMatch when parent has gameScoreMap and playersMap", () => {
      const bracket = new Bracket(oneBrktId1);

      const originalMatch = bracket.match;

      const parent = {
        games: 3,
        gameScoreMap: new Map(),
        playersMap: new Map(),
      } as unknown as BracketList;

      bracket.parent = parent;

      expect(bracket.match).toBeDefined();
      expect(bracket.match).not.toBe(originalMatch);
    });

    it("does not create a new BracketMatch when parent gameScoreMap is null", () => {
      const bracket = new Bracket(oneBrktId1);

      const originalMatch = bracket.match;

      const parent = {
        games: 3,
        gameScoreMap: null,
        playersMap: new Map(),
      } as unknown as BracketList;

      bracket.parent = parent;

      expect(bracket.match).toBe(originalMatch);
    });

    it("does not create a new BracketMatch when parent playersMap is null", () => {
      const bracket = new Bracket(oneBrktId1);

      const originalMatch = bracket.match;

      const parent = {
        games: 3,
        gameScoreMap: new Map(),
        playersMap: null,
      } as unknown as BracketList;

      bracket.parent = parent;

      expect(bracket.match).toBe(originalMatch);
    });

    it("sets prize amounts for a full bracket", () => {
      const bracket = new Bracket(oneBrktId1);

      const parent = {
        games: 3,
        gameScoreMap: new Map(),
        playersMap: new Map(),
        brkt: {
          fee: 5,
        },
      } as unknown as BracketList;
      bracket.parent = parent;

      const seeds: brktSeedType[] = [
        {
          one_brkt_id: oneBrktId1,
          seed: 0,
          player_id: playerId1,
        },
        {
          one_brkt_id: oneBrktId1,
          seed: 1,
          player_id: playerId2,
        },
        {
          one_brkt_id: oneBrktId1,
          seed: 2,
          player_id: playerId3,
        },
        {
          one_brkt_id: oneBrktId1,
          seed: 3,
          player_id: playerId4,
        },
        {
          one_brkt_id: oneBrktId1,
          seed: 4,
          player_id: playerId5,
        },
        {
          one_brkt_id: oneBrktId1,
          seed: 5,
          player_id: playerId6,
        },
        {
          one_brkt_id: oneBrktId1,
          seed: 6,
          player_id: playerId7,
        },
        {
          one_brkt_id: oneBrktId1,
          seed: 7,
          player_id: playerId8,
        },
      ];
      bracket.populateBracket(seeds);

      expect(bracket.hasByePlayer()).toBe(false);

      /*
       * Full 8-player bracket:
       *
       * 1 fee -> admin
       * 2 fees -> runner up
       * 5 fees -> winner
       */
      expect(bracket.runnerUpAmount).toBe(10);
      expect(bracket.winnerAmount).toBe(25);
    });

    it("sets prize amounts for a bracket with a bye player", () => {
      const bracket = new Bracket(oneBrktId1);

      const parent = {
        games: 3,
        gameScoreMap: new Map(),
        playersMap: new Map(),
        brkt: {
          fee: 5,
        },
      } as unknown as BracketList;
      bracket.parent = parent;

      const seeds: brktSeedType[] = [
        {
          one_brkt_id: oneBrktId1,
          seed: 0,
          player_id: playerId1,
        },
        {
          one_brkt_id: oneBrktId1,
          seed: 1,
          player_id: playerId2,
        },
        {
          one_brkt_id: oneBrktId1,
          seed: 2,
          player_id: playerId3,
        },
        {
          one_brkt_id: oneBrktId1,
          seed: 3,
          player_id: playerId4,
        },
        {
          one_brkt_id: oneBrktId1,
          seed: 4,
          player_id: playerId5,
        },
        {
          one_brkt_id: oneBrktId1,
          seed: 5,
          player_id: playerId6,
        },
        {
          one_brkt_id: oneBrktId1,
          seed: 6,
          player_id: playerId7,
        },
        {
          one_brkt_id: oneBrktId1,
          seed: 7,
          player_id: byeId,
        },
      ];
      bracket.populateBracket(seeds);

      expect(bracket.hasByePlayer()).toBe(true);

      /*
      * 7-player bracket with one bye:
      *
      * 1 fee -> admin
      * 2 fees -> runner up
      * 4 fees -> winner
      *
      * $5 * 2 = $10 runner up
      * $5 * 4 = $20 winner
      */
      expect(bracket.runnerUpAmount).toBe(10);
      expect(bracket.winnerAmount).toBe(20);
    });

    it("does not set prize amounts when bracket fee is invalid", () => {
      const bracket = new Bracket(oneBrktId1);

      const parent = {
        games: 3,
        gameScoreMap: new Map(),
        playersMap: new Map(),
        brkt: {
          fee: null,
        },
      } as unknown as BracketList;

      bracket.parent = parent;

      expect(bracket.runnerUpAmount).toBe(0);
      expect(bracket.winnerAmount).toBe(0);
    });

    it("does not set prize amounts when parent bracket is undefined", () => {
      const bracket = new Bracket(oneBrktId1);

      const parent = {
        games: 3,
        gameScoreMap: new Map(),
        playersMap: new Map(),
        brkt: undefined,
      } as unknown as BracketList;

      bracket.parent = parent;

      expect(bracket.runnerUpAmount).toBe(0);
      expect(bracket.winnerAmount).toBe(0);
    });
  });
});