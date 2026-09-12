import { Bracket } from "@/components/brackets/bracketClass";
import {
  BracketList,
  brktListInitialDataType,
  initBrktCountsType,
} from "@/components/brackets/bracketListClass";
import { createByePlayer } from "../../../../src/components/brackets/byePlayer";
import {
  squadId1,
  playerId8,
  mockTmntFullData,
  brktId1,
  brktId2,
  divId1,
  oneBrktId1,
  oneBrktId2,
  oneBrktId3,
  oneBrktId8,
  oneBrktId9,
  oneBrktId16,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";

describe("BracketList constructor", () => {

  describe("no different gameNumbers, no byePlayer, no initialData", () => {
    const testBracketList = new BracketList("test", 2, 3);

    it("should initialize with an empty brackets array when constructed", () => {
      expect(testBracketList.brackets).toHaveLength(0);
    });
    it("brktCounts should return empty values when constructed", () => {
      const result: initBrktCountsType = testBracketList.brktCounts;
      expect(result.forFullValues).toHaveLength(0);
      expect(result.forOneByeValues).toHaveLength(0);
    });
    it("should return the correct # of games", () => {
      const result = testBracketList.games;
      expect(result).toBe(3);
    });
    it("should return the correct # of players per match", () => {
      const result = testBracketList.playersPerMatch;
      expect(result).toBe(2);
    });
    it("should return the correct # of players per bracket", () => {
      const result = testBracketList.playersPerBrkt;
      expect(result).toBe(8);
    });
    it("should initialize with a null bracket index map when constructed", () => {
      expect(testBracketList.bracketIndexMap).toBeNull();
    });
  });

  describe("passed different gameNumbers, no byePlayer, no initialData", () => {
    it("should return the bracketList with different gameNumbers", () => {
      const gameNumbers = [4, 5, 6];
      const games456Brkt = new BracketList("test", 2, 3, gameNumbers);
      expect(games456Brkt.squadGameNums).toEqual(gameNumbers);
    });
  });

  describe("passed byePlayer, no different gameNumbers, no initialData", () => {
    it("should use valid unique squad game numbers", () => {
      const gameNumbers = [4, 5, 6];

      const games456Brkt = new BracketList(
        "test",
        2,
        3,
        gameNumbers,
      );

      expect(games456Brkt.squadGameNums).toEqual(
        gameNumbers,
      );
    });    
  });

  describe("passed different gameNumbers, byePlayer, passed initialData", () => {
    
    it("should return the bracketList with byePlayer and a filled list of brackets", () => {
      const byePlayer = createByePlayer(squadId1);        
      const initData: brktListInitialDataType = {        
        tmntFullData: mockTmntFullData,
        divId: divId1,
      };
      const brktList = new BracketList(
        brktId1,
        2,
        3,
        undefined,
        byePlayer,
        initData,
      );
      expect(brktList).not.toBeUndefined();
      expect(brktList).not.toBeNull();
      if (brktList == null) {
        throw new Error("brktList is null");
      }
      expect(brktList.byePlayer.id).toBe(byePlayer.id);
      expect(brktList.byePlayer.squad_id).toBe(squadId1);
      expect(brktList.brackets).toHaveLength(8);
      expect(brktList.fullCount).toBe(8);
      expect(brktList.oneByeCount).toBe(0);
      expect(brktList.playersWithRefunds).toBe(false);
      expect(brktList.totalBrackets).toBe(8);
      expect(brktList.totalEntries).toBe(8 * 8 - brktList.oneByeCount); // 8 brackets, 8 players per bracket
      expect(brktList.bracketIndexMap).not.toBeNull();
      expect(brktList.bracketIndexMap?.size).toBe(8);
      brktList.brackets.forEach((bracket, index) => {
        expect(brktList.bracketIndexMap?.get(bracket.id)).toBe(index);
      });
      expect(brktList.playersMap).not.toBeNull();
      if (brktList.playersMap == null) {
        throw new Error("brktList.playersMap is null");
      }
      expect(brktList.playersMap?.size).toBe(8);
      brktList.playersMap.forEach((playerInfo, playerId) => {
        expect(playerInfo.bracketIds).toHaveLength(8);
        expect(playerInfo.bracketIds).toContain(oneBrktId1);
        expect(playerInfo.bracketIds).toContain(oneBrktId8);
      })
    });

    it("should return the bracketList with byePlayer, 3 byePlayer entries and a filled list of brackets", () => {      
      const tmntWithByes = cloneDeep(mockTmntFullData);      
      // add 3 byePlayer entries - replace playerId8 with a byePlayer 3 times
      const byePlayer = createByePlayer(squadId1);
      let byeSeed = tmntWithByes.brktSeeds.find(
        (seed) => seed.one_brkt_id === oneBrktId1 && seed.player_id === playerId8,
      )
      if (byeSeed) {
        byeSeed.player_id = byePlayer.id;        
      }
      byeSeed = tmntWithByes.brktSeeds.find(
        (seed) => seed.one_brkt_id === oneBrktId2 && seed.player_id === playerId8,
      )
      if (byeSeed) {
        byeSeed.player_id = byePlayer.id;        
      }
      byeSeed = tmntWithByes.brktSeeds.find(
        (seed) => seed.one_brkt_id === oneBrktId3 && seed.player_id === playerId8,
      )
      if (byeSeed) {
        byeSeed.player_id = byePlayer.id;        
      }

      const initData: brktListInitialDataType = {
        tmntFullData: tmntWithByes,
        divId: divId1,
      };
      const brktList = new BracketList(
        brktId1,
        2,
        3,
        undefined,
        byePlayer,
        initData,
      );
      expect(brktList.byePlayer.id).toBe(byePlayer.id);
      expect(brktList.byePlayer.squad_id).toBe(squadId1);
      expect(brktList.brackets).toHaveLength(8);
      expect(brktList.fullCount).toBe(5);
      expect(brktList.oneByeCount).toBe(3);
      expect(brktList.playersWithRefunds).toBe(false);
      expect(brktList.totalBrackets).toBe(8);
      expect(brktList.totalEntries).toBe(8 * 8 - brktList.oneByeCount); // 8 brackets, 8 players per bracket

      expect(brktList.bracketIndexMap).not.toBeNull();
      expect(brktList.bracketIndexMap?.size).toBe(8);
      brktList.brackets.forEach((bracket, index) => {
        expect(brktList.bracketIndexMap?.get(bracket.id)).toBe(index);
      });
    });

    it("should create a bracket index map from the initial brackets", () => {
      const initData: brktListInitialDataType = {
        tmntFullData: mockTmntFullData,
        divId: divId1,
      };
      const brktList = new BracketList(
        brktId1,
        2,
        3,
        undefined,
        undefined,
        initData,
      );

      expect(brktList.bracketIndexMap).not.toBeNull();
      expect(brktList.bracketIndexMap?.size).toBe(8);

      brktList.brackets.forEach((bracket, index) => {
        expect(brktList.bracketIndexMap?.get(bracket.id)).toBe(index);
      });
    });

    it("should create a players map from the initial brackets", () => {

      const initData: brktListInitialDataType = {        
        tmntFullData: mockTmntFullData,
        divId: divId1,
      };
      const brktList = new BracketList(
        brktId1,
        2,
        3,
        undefined,
        undefined,
        initData,
      );

      expect(brktList.playersMap).not.toBeNull();

      // mock TmntFullData has 8 players in it, all in brackets
      expect(brktList.playersMap?.size).toBe(mockTmntFullData.players.length);

      mockTmntFullData.players.forEach((player) => {
        expect(brktList.playersMap?.has(player.id)).toBe(true);
        const playerInfo = brktList.playersMap?.get(player.id);
        expect(playerInfo?.first_name).toBe(player.first_name);
        expect(playerInfo?.last_name).toBe(player.last_name);
        expect(playerInfo?.average).toBe(player.average);
        expect(playerInfo?.bracketIds).toHaveLength(8);
        expect(playerInfo?.bracketIds).toContain(oneBrktId1);
        expect(playerInfo?.bracketIds).toContain(oneBrktId8);
      });
    });

    it("should create a players map from the initial brackets - bracket 2", () => {

      const initData: brktListInitialDataType = {        
        tmntFullData: mockTmntFullData,
        divId: divId1,
      };
      const brkt2 = mockTmntFullData.brkts[1];
      const game1 = brkt2.start;
      const gameNums = [game1, game1 + 1, game1 + 2];
      const brktList = new BracketList(
        brktId2,
        2,
        3,
        gameNums,
        undefined,
        initData,
      );

      expect(brktList.playersMap).not.toBeNull();

      // mock TmntFullData has 8 players in it, all in brackets
      expect(brktList.playersMap?.size).toBe(mockTmntFullData.players.length);

      mockTmntFullData.players.forEach((player) => {
        expect(brktList.playersMap?.has(player.id)).toBe(true);
        const playerInfo = brktList.playersMap?.get(player.id);
        expect(playerInfo?.first_name).toBe(player.first_name);
        expect(playerInfo?.last_name).toBe(player.last_name);
        expect(playerInfo?.average).toBe(player.average);
        expect(playerInfo?.bracketIds).toHaveLength(8);
        expect(playerInfo?.bracketIds).toContain(oneBrktId9);
        expect(playerInfo?.bracketIds).toContain(oneBrktId16);
      });
    });

  });

  describe("invalid squad game numbers", () => {
    it("should throw when squadGameNumbers has fewer values than games", () => {
      expect(() => {
        new BracketList(
          "test",
          2,
          3,
          [1, 2],
        );
      }).toThrow(
        "BracketList - squadGameNums.length !== games.",
      );
    });

    it("should throw when squadGameNumbers has more values than games", () => {
      expect(() => {
        new BracketList(
          "test",
          2,
          3,
          [1, 2, 3, 4],
        );
      }).toThrow(
        "BracketList - squadGameNums.length !== games.",
      );
    });

    it("should throw when squadGameNumbers contains duplicate values", () => {
      expect(() => {
        new BracketList(
          "test",
          2,
          3,
          [1, 2, 2],
        );
      }).toThrow(
        "BracketList - squadGameNums not unique.",
      );
    });
  });  
});
