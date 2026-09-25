import {
  buildBrktListRecords,
  type brktListRecord,
} from "@/components/brackets/buildBrktLists";
import { BracketList } from "@/components/brackets/bracketListClass";
import {
  defaultPlayersPerMatch,
  defaultBrktGames,
} from "@/lib/db/initVals";
import {
  mockTmntFullData,
  brktId1,
  brktId2,
  oneBrktId1,
  oneBrktId2,
  oneBrktId3,
  oneBrktId4,
  oneBrktId5,
  oneBrktId6,
  oneBrktId7,
  oneBrktId8,
  oneBrktId9,
  oneBrktId10,
  oneBrktId11,
  oneBrktId12,
  oneBrktId13,
  oneBrktId14,
  oneBrktId15,
  oneBrktId16,
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

describe("buildBrktListRecords", () => {
  
  describe("record creation", () => {
    it("returns a BrktListRecord with one entry for each bracket", () => {
      const result = buildBrktListRecords(mockTmntFullData);

      expect(Object.keys(result)).toHaveLength(mockTmntFullData.brkts.length);

      expect(Object.keys(result)).toEqual(
        expect.arrayContaining([
          brktId1,
          brktId2,
        ]),
      );
    });

    it("uses the bracket id as the record key", () => {
      const result = buildBrktListRecords(mockTmntFullData);

      expect(result[brktId1]).toBeDefined();
      expect(result[brktId2]).toBeDefined();
    });

    it("creates a BracketList for each bracket", () => {
      const result = buildBrktListRecords(mockTmntFullData);

      expect(result[brktId1]).toBeInstanceOf(BracketList);
      expect(result[brktId2]).toBeInstanceOf(BracketList);
    });
  });

  describe("BracketList configuration", () => {
    it("sets the bracket id", () => {
      const result = buildBrktListRecords(mockTmntFullData);

      expect(result[brktId1].brktId).toBe(brktId1);
      expect(result[brktId2].brktId).toBe(brktId2);
    });

    it("sets the default players per match", () => {
      const result = buildBrktListRecords(mockTmntFullData);

      expect(result[brktId1].playersPerMatch).toBe(
        defaultPlayersPerMatch,
      );

      expect(result[brktId2].playersPerMatch).toBe(
        defaultPlayersPerMatch,
      );
    });

    it("sets the default number of bracket games", () => {
      const result = buildBrktListRecords(mockTmntFullData);

      expect(result[brktId1].games).toBe(
        defaultBrktGames,
      );

      expect(result[brktId2].games).toBe(
        defaultBrktGames,
      );
    });

    it("creates the game numbers from the bracket start game", () => {
      const result = buildBrktListRecords(mockTmntFullData);

      expect(result[brktId1].squadGameNums).toEqual([
        1,
        2,
        3,
      ]);

      expect(result[brktId2].squadGameNums).toEqual([
        4,
        5,
        6,
      ]);
    });
  });

  describe("bracket population", () => {
    it("adds all oneBrkts belonging to brktId1", () => {
      const result = buildBrktListRecords(mockTmntFullData);

      const bracketList = result[brktId1];

      expect(bracketList.brackets).toHaveLength(8);
    });

    it("does not add oneBrkts from another bracket", () => {
      const result = buildBrktListRecords(mockTmntFullData);
            
      expect(result[brktId2].brackets).toHaveLength(8);
    });

    it("creates the brackets in bindex order", () => {
      const result = buildBrktListRecords(mockTmntFullData);

      const bracketList = result[brktId1];

      const oneBrktIds = bracketList.brackets.map(
        (bracket) => bracket.id,
      );

      expect(oneBrktIds).toEqual([
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

    it("populates the first bracket with the expected seeded players", () => {
      const result = buildBrktListRecords(mockTmntFullData);

      const firstBracket = result[brktId1].brackets[0];

      expect(firstBracket.players).toEqual([
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
  });

  describe("players map", () => {
    it("creates the players map using the bracket division", () => {
      const result = buildBrktListRecords(mockTmntFullData);

      const bracketList1 = result[brktId1];
      if (!bracketList1 || !bracketList1.playersMap) { 
        throw new Error("bracketList.playersMap is undefined");
      };

      expect(bracketList1.playersMap.size).toBe(8);

      expect(bracketList1.playersMap.has(playerId1)).toBe(true);
      expect(bracketList1.playersMap.has(playerId2)).toBe(true);
      expect(bracketList1.playersMap.has(playerId3)).toBe(true);
      expect(bracketList1.playersMap.has(playerId4)).toBe(true);
      expect(bracketList1.playersMap.has(playerId5)).toBe(true);
      expect(bracketList1.playersMap.has(playerId6)).toBe(true);
      expect(bracketList1.playersMap.has(playerId7)).toBe(true);
      expect(bracketList1.playersMap.has(playerId8)).toBe(true);

      const bracketList2 = result[brktId1];
      if (!bracketList2 || !bracketList2.playersMap) { 
        throw new Error("bracketList.playersMap is undefined");
      };

      expect(bracketList2.playersMap.size).toBe(8);

      expect(bracketList2.playersMap.has(playerId1)).toBe(true);
      expect(bracketList2.playersMap.has(playerId2)).toBe(true);
      expect(bracketList2.playersMap.has(playerId3)).toBe(true);
      expect(bracketList2.playersMap.has(playerId4)).toBe(true);
      expect(bracketList2.playersMap.has(playerId5)).toBe(true);
      expect(bracketList2.playersMap.has(playerId6)).toBe(true);
      expect(bracketList2.playersMap.has(playerId7)).toBe(true);
      expect(bracketList2.playersMap.has(playerId8)).toBe(true);

    });

    it("does not create a players map when the bracket division is not found", () => {
      const testData = cloneDeep(mockTmntFullData);

      testData.brkts[0].div_id = "div_not_found";      

      expect(() => buildBrktListRecords(testData)).toThrow(
        `No div for brkt ${testData.brkts[0].id} in buildBrktListRecords`
      );
    });
    it("does not create a players map when there are no bracket entries", () => {
      const testData = cloneDeep(mockTmntFullData);

      testData.divEntries = [];

      expect(() => buildBrktListRecords(testData)).toThrow(
        `No divEntries for brkt ${testData.brkts[0].id} in buildBrktListRecords`
      );
    });
    it("does not create a players map when there are no one brackets for the bracket", () => {
      const testData = cloneDeep(mockTmntFullData);

      testData.oneBrkts = [];

      expect(() => buildBrktListRecords(testData)).toThrow(
        `No oneBrkts for brkt ${testData.brkts[0].id} in buildBrktListRecords`
      );
    });
    it("does not create a players map when there are no bracket seeds for the bracket", () => {
      const testData = cloneDeep(mockTmntFullData);

      testData.brktSeeds = [];

      expect(() => buildBrktListRecords(testData)).toThrow(
        `No brktSeeds for brkt ${testData.brkts[0].id} in buildBrktListRecords`
      );
    });
    
    it("adds the player's bracket ids to the players map", () => {
      const result = buildBrktListRecords(mockTmntFullData);

      const bracketList = result[brktId1];

      if (!bracketList.playersMap) {
        throw new Error(
          "bracketList.playersMap is undefined",
        );
      }

      const playerInfo = bracketList.playersMap.get(playerId1);

      if (!playerInfo) {
        throw new Error(
          `Player ${playerId1} not found in playersMap`,
        );
      }

      expect(playerInfo.bracketIds).toEqual([
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
    it("only adds bracket ids belonging to the correct bracket type", () => {
      const result = buildBrktListRecords(mockTmntFullData);

      const bracketList = result[brktId2];

      if (!bracketList.playersMap) {
        throw new Error(
          "bracketList.playersMap is undefined",
        );
      }

      const playerInfo = bracketList.playersMap.get(playerId1);

      if (!playerInfo) {
        throw new Error(
          `Player ${playerId1} not found in playersMap`,
        );
      }

      expect(playerInfo.bracketIds).toEqual([
        oneBrktId9,
        oneBrktId10,
        oneBrktId11,
        oneBrktId12,
        oneBrktId13,
        oneBrktId14,
        oneBrktId15,
        oneBrktId16,
      ]);

      expect(playerInfo.bracketIds).not.toContain(
        oneBrktId1,
      );
    });        
  });

  describe("empty data", () => {
    it("returns an empty record when there are no brackets", () => {
      const testData = cloneDeep(mockTmntFullData);

      testData.brkts = [];

      const result: brktListRecord =
        buildBrktListRecords(testData);

      expect(result).toEqual({});
    });
  });
});