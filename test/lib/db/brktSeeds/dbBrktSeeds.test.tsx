import { defaultBrktPlayers, blankBrktSeed } from "@/lib/db/initVals";
import {
  getAllBrktSeedsForBrkt,
  getAllBrktSeedsForDiv,
  getAllBrktSeedsForOneBrkt,
  getAllBrktSeedsForSquad,
  getAllBrktSeedsForTmnt,
  getBrktSeed,
  extractBrktSeeds,
} from "@/lib/db/brktSeeds/dbBrktSeeds";
import type { brktSeedType } from "@/lib/types/types";

// before running this test, run the following commands in the terminal:
// 1) clear and re-seed the database
//    a) clear the database
//       npx prisma db push --force-reset
//    b) re-seed
//       npx prisma db seed
//    if just need to re-seed, then only need step 1b
// 2) make sure the server is running
//    in the VS activity bar,
//      a) click on "Run and Debug" (Ctrl+Shift+D)
//      b) at the top of the window, click on the drop-down arrow
//      c) select "Node.js: debug server-side"
//      d) directly to the left of the drop down select, click the green play button
//         This will start the server in debug mode.

const notFoundOneBrktId = "obk_01234567890123456789012345678901";
const notFoundBrktId = "brk_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";

const goldPinkOneBrktId1 = "obk_557f12f3875f42baa29fdbd22ee7f2f4";
const goldPinkOneBrktId2 = "obk_5423c16d58a948748f32c7c72c632297";
const goldPinkOneBrktId3 = "obk_8d500123a07d46f9bb23db61e74ffc1b";
const goldPinkOneBrktId4 = "obk_4ba9e037c86e494eb272efcd989dc9d0";

const brktId = "brk_5109b54c2cc44ff9a3721de42c80c8c1";
const divId = "div_f30aea2c534f4cfe87f4315531cef8ef";
const oneBrktId = "obk_557f12f3875f42baa29fdbd22ee7f2f4";
const playerId = "ply_88be0472be3d476ea1caa99dd05953fa";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const userId = "usr_01234567890123456789012345678901";

describe("dbBrktSeeds", () => {
  describe("extractBrktSeeds", () => {
    it("should return an empty array when given an empty array", () => {
      const result = extractBrktSeeds([]);
      expect(result).toEqual([]);
    });

    it("should correctly map raw brktSeeds to brktSeedType", () => {
      const rawBrktSeeds = [
        {
          one_brkt_id: "obk_b0b2bc5682f042269cf0aaa8c32b25b8",
          seed: 0,
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          extraField: "ignore me",
        },
      ];

      const result = extractBrktSeeds(rawBrktSeeds);

      const expected: brktSeedType = {
        ...blankBrktSeed,
        one_brkt_id: "obk_b0b2bc5682f042269cf0aaa8c32b25b8",
        seed: 0,
        player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
      };

      expect(result).toEqual([expected]);
    });

    it("should process multiple brktSeeds", () => {
      const rawBrktSeeds = [
        {
          one_brkt_id: "obk_b0b2bc5682f042269cf0aaa8c32b25b8",
          seed: 0,
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
        },
        {
          one_brkt_id: "obk_b0b2bc5682f042269cf0aaa8c32b25b8",
          seed: 1,
          player_id: "ply_12be0472be3d476ea1caa99dd05953fa",
        },
      ];

      const result = extractBrktSeeds(rawBrktSeeds);

      expect(result).toHaveLength(2);
      expect(result[0].seed).toBe(0);
      expect(result[1].seed).toBe(1);
    });

    it("should return an empty array when given null", () => {
      const result = extractBrktSeeds(null);
      expect(result).toEqual([]);
    });

    it("should return an empty array when given non-array", () => {
      const result = extractBrktSeeds("not an array");
      expect(result).toEqual([]);
    });
  });

  describe("getAllBrktSeedsForTmnt()", () => {
    it("should get all brktSeeds for a tmnt", async () => {
      const brktSeeds = await getAllBrktSeedsForTmnt(tmntId);

      expect(brktSeeds).toBeDefined();
      expect(Array.isArray(brktSeeds)).toBe(true);
      expect(brktSeeds).toHaveLength(32);

      expect(brktSeeds[0].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(brktSeeds[0].seed).toBe(0);
      expect(brktSeeds[1].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(brktSeeds[1].seed).toBe(1);
      expect(brktSeeds[6].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(brktSeeds[6].seed).toBe(6);
      expect(brktSeeds[7].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(brktSeeds[7].seed).toBe(7);

      expect(brktSeeds[8].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeeds[8].seed).toBe(0);
      expect(brktSeeds[9].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeeds[9].seed).toBe(1);
      expect(brktSeeds[14].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeeds[14].seed).toBe(6);
      expect(brktSeeds[15].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeeds[15].seed).toBe(7);

      expect(brktSeeds[16].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[16].seed).toBe(0);
      expect(brktSeeds[17].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[17].seed).toBe(1);
      expect(brktSeeds[22].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[22].seed).toBe(6);
      expect(brktSeeds[23].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[23].seed).toBe(7);

      expect(brktSeeds[24].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(brktSeeds[24].seed).toBe(0);
      expect(brktSeeds[25].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(brktSeeds[25].seed).toBe(1);
      expect(brktSeeds[30].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(brktSeeds[30].seed).toBe(6);
      expect(brktSeeds[31].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(brktSeeds[31].seed).toBe(7);
    });

    it("should return 0 brktSeeds for a non-existent tmnt", async () => {
      const brktSeeds = await getAllBrktSeedsForTmnt(notFoundTmntId);

      expect(brktSeeds).toBeDefined();
      expect(Array.isArray(brktSeeds)).toBe(true);
      expect(brktSeeds).toHaveLength(0);
    });

    it("should throw error if tmnt id is invalid", async () => {
      await expect(getAllBrktSeedsForTmnt("test")).rejects.toThrow(
        "Invalid tmnt id"
      );
    });

    it("should throw error if tmnt id is valid, but not a tmnt id", async () => {
      await expect(getAllBrktSeedsForTmnt(userId)).rejects.toThrow(
        "Invalid tmnt id"
      );
    });

    it("should throw error if tmnt id is null", async () => {
      await expect(getAllBrktSeedsForTmnt(null as any)).rejects.toThrow(
        "Invalid tmnt id"
      );
    });
  });

  describe("getAllBrktSeedsForSquad()", () => {
    it("should get all brktSeeds for a squad", async () => {
      const brktSeeds = await getAllBrktSeedsForSquad(squadId);

      expect(brktSeeds).toBeDefined();
      expect(Array.isArray(brktSeeds)).toBe(true);
      expect(brktSeeds).toHaveLength(32);
      if (!brktSeeds) {
        return;
      }

      expect(brktSeeds[0].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(brktSeeds[0].seed).toBe(0);
      expect(brktSeeds[1].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(brktSeeds[1].seed).toBe(1);
      expect(brktSeeds[6].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(brktSeeds[6].seed).toBe(6);
      expect(brktSeeds[7].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(brktSeeds[7].seed).toBe(7);

      expect(brktSeeds[8].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeeds[8].seed).toBe(0);
      expect(brktSeeds[9].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeeds[9].seed).toBe(1);
      expect(brktSeeds[14].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeeds[14].seed).toBe(6);
      expect(brktSeeds[15].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeeds[15].seed).toBe(7);

      expect(brktSeeds[16].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[16].seed).toBe(0);
      expect(brktSeeds[17].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[17].seed).toBe(1);
      expect(brktSeeds[22].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[22].seed).toBe(6);
      expect(brktSeeds[23].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[23].seed).toBe(7);

      expect(brktSeeds[24].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(brktSeeds[24].seed).toBe(0);
      expect(brktSeeds[25].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(brktSeeds[25].seed).toBe(1);
      expect(brktSeeds[30].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(brktSeeds[30].seed).toBe(6);
      expect(brktSeeds[31].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(brktSeeds[31].seed).toBe(7);
    });

    it("should return 0 brktSeeds for a non-existent squad", async () => {
      const brktSeeds = await getAllBrktSeedsForSquad(notFoundSquadId);

      expect(brktSeeds).toBeDefined();
      expect(Array.isArray(brktSeeds)).toBe(true);
      expect(brktSeeds).toHaveLength(0);
    });

    it("should throw error if squad id is invalid", async () => {
      await expect(getAllBrktSeedsForSquad("test")).rejects.toThrow(
        "Invalid squad id"
      );
    });

    it("should throw error if squad id is valid, but not a squad id", async () => {
      await expect(getAllBrktSeedsForSquad(userId)).rejects.toThrow(
        "Invalid squad id"
      );
    });

    it("should throw error if squad id is null", async () => {
      await expect(getAllBrktSeedsForSquad(null as any)).rejects.toThrow(
        "Invalid squad id"
      );
    });
  });

  describe("getAllOneBrktsForDiv()", () => {
    it("should get all brktSeeds for a div", async () => {
      const brktSeeds = await getAllBrktSeedsForDiv(divId);

      expect(brktSeeds).toBeDefined();
      expect(Array.isArray(brktSeeds)).toBe(true);
      expect(brktSeeds).toHaveLength(32);

      expect(brktSeeds[0].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(brktSeeds[0].seed).toBe(0);
      expect(brktSeeds[1].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(brktSeeds[1].seed).toBe(1);
      expect(brktSeeds[6].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(brktSeeds[6].seed).toBe(6);
      expect(brktSeeds[7].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(brktSeeds[7].seed).toBe(7);

      expect(brktSeeds[8].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeeds[8].seed).toBe(0);
      expect(brktSeeds[9].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeeds[9].seed).toBe(1);
      expect(brktSeeds[14].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeeds[14].seed).toBe(6);
      expect(brktSeeds[15].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeeds[15].seed).toBe(7);

      expect(brktSeeds[16].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[16].seed).toBe(0);
      expect(brktSeeds[17].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[17].seed).toBe(1);
      expect(brktSeeds[22].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[22].seed).toBe(6);
      expect(brktSeeds[23].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[23].seed).toBe(7);

      expect(brktSeeds[24].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(brktSeeds[24].seed).toBe(0);
      expect(brktSeeds[25].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(brktSeeds[25].seed).toBe(1);
      expect(brktSeeds[30].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(brktSeeds[30].seed).toBe(6);
      expect(brktSeeds[31].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(brktSeeds[31].seed).toBe(7);
    });

    it("should return 0 brktSeeds for a non-existent div", async () => {
      const brktSeeds = await getAllBrktSeedsForDiv(notFoundDivId);

      expect(brktSeeds).toBeDefined();
      expect(Array.isArray(brktSeeds)).toBe(true);
      expect(brktSeeds).toHaveLength(0);
    });

    it("should throw error if div id is invalid", async () => {
      await expect(getAllBrktSeedsForDiv("test")).rejects.toThrow(
        "Invalid div id"
      );
    });

    it("should throw error if div id is valid, but not a div id", async () => {
      await expect(getAllBrktSeedsForDiv(userId)).rejects.toThrow(
        "Invalid div id"
      );
    });

    it("should throw error if div id is null", async () => {
      await expect(getAllBrktSeedsForDiv(null as any)).rejects.toThrow(
        "Invalid div id"
      );
    });
  });

  describe("getAllBrktSeedsForBrkt()", () => {
    it("should get all brktSeeds for a brkt", async () => {
      const brktSeeds = await getAllBrktSeedsForBrkt(brktId);

      expect(brktSeeds).toBeDefined();
      expect(Array.isArray(brktSeeds)).toBe(true);
      expect(brktSeeds).toHaveLength(16);

      expect(brktSeeds[0].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeeds[0].seed).toBe(0);
      expect(brktSeeds[1].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeeds[1].seed).toBe(1);
      expect(brktSeeds[6].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeeds[6].seed).toBe(6);
      expect(brktSeeds[7].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeeds[7].seed).toBe(7);

      expect(brktSeeds[8].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[8].seed).toBe(0);
      expect(brktSeeds[9].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[9].seed).toBe(1);
      expect(brktSeeds[14].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[14].seed).toBe(6);
      expect(brktSeeds[15].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[15].seed).toBe(7);
    });

    it("should return 0 brktSeeds for a non-existent brkt", async () => {
      const brktSeeds = await getAllBrktSeedsForBrkt(notFoundBrktId);

      expect(brktSeeds).toBeDefined();
      expect(Array.isArray(brktSeeds)).toBe(true);
      expect(brktSeeds).toHaveLength(0);
    });

    it("should throw error if brkt id is invalid", async () => {
      await expect(getAllBrktSeedsForBrkt("test")).rejects.toThrow(
        "Invalid brkt id"
      );
    });

    it("should throw error if brkt id is valid, but not a brkt id", async () => {
      await expect(getAllBrktSeedsForBrkt(userId)).rejects.toThrow(
        "Invalid brkt id"
      );
    });

    it("should throw error if brkt id is null", async () => {
      await expect(getAllBrktSeedsForBrkt(null as any)).rejects.toThrow(
        "Invalid brkt id"
      );
    });
  });

  describe("getAllBrktSeedsForOneBrkt()", () => {
    it("should get all brktSeeds for a div", async () => {
      const brktSeeds = await getAllBrktSeedsForOneBrkt(oneBrktId);

      expect(brktSeeds).toBeDefined();
      expect(Array.isArray(brktSeeds)).toBe(true);
      expect(brktSeeds).toHaveLength(8);

      expect(brktSeeds[0].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[0].seed).toBe(0);
      expect(brktSeeds[1].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[1].seed).toBe(1);
      expect(brktSeeds[6].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[6].seed).toBe(6);
      expect(brktSeeds[7].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[7].seed).toBe(7);
    });

    it("should return 0 brktSeeds for a non-existent oneBrktId", async () => {
      const brktSeeds = await getAllBrktSeedsForOneBrkt(notFoundOneBrktId);

      expect(brktSeeds).toBeDefined();
      expect(Array.isArray(brktSeeds)).toBe(true);
      expect(brktSeeds).toHaveLength(0);
    });

    it("should throw error if oneBrkt id is invalid", async () => {
      await expect(getAllBrktSeedsForOneBrkt("test")).rejects.toThrow(
        "Invalid oneBrkt id"
      );
    });

    it("should throw error if oneBrkt id is valid, but not a oneBrkt id", async () => {
      await expect(getAllBrktSeedsForOneBrkt(userId)).rejects.toThrow(
        "Invalid oneBrkt id"
      );
    });

    it("should throw error if oneBrkt id is null", async () => {
      await expect(getAllBrktSeedsForOneBrkt(null as any)).rejects.toThrow(
        "Invalid oneBrkt id"
      );
    });
  });

  describe("getBrktSeed()", () => {
    const validOneBrktId = "obk_103f595981364b77af163624528bdfda";

    it("should get a brktSeed", async () => {
      const brktSeed = await getBrktSeed(goldPinkOneBrktId2, 0);

      expect(brktSeed).toBeDefined();
      expect(brktSeed.one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeed.seed).toBe(0);
      expect(brktSeed.player_id).toBe(playerId);
    });

    it("should get a brktSeed when seed is a valid integer sting", async () => {
      const brktSeed = await getBrktSeed(goldPinkOneBrktId2, "0");

      expect(brktSeed).toBeDefined();
      expect(brktSeed.one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeed.seed).toBe(0);
      expect(brktSeed.player_id).toBe(playerId);
    });

    it("should throw for a non-existent oneBrktid-seed pair - oneBrktid", async () => {
      await expect(getBrktSeed(notFoundOneBrktId, 0)).rejects.toThrow(
        "getBrktSeed failed: Request failed with status code 404"
      );
    });

    it("should throw for a non-existent oneBrktid-seed pair - seed", async () => {
      await expect(getBrktSeed(validOneBrktId, 7)).rejects.toThrow(
        "getBrktSeed failed: Request failed with status code 404"
      );
    });

    it("should throw if oneBrktid-seed pair has invalid oneBrktid", async () => {
      await expect(getBrktSeed("test", 0)).rejects.toThrow(
        "Invalid oneBrktId or seed"
      );
    });

    it("should throw if oneBrktid-seed pair has valid oneBrktid, but not a oneBrktId", async () => {
      await expect(getBrktSeed(userId, 0)).rejects.toThrow(
        "Invalid oneBrktId or seed"
      );
    });

    it("should throw if oneBrktid-seed pair has null oneBrktid", async () => {
      await expect(getBrktSeed(null as any, 0)).rejects.toThrow(
        "Invalid oneBrktId or seed"
      );
    });

    it("should throw if oneBrktid-seed pair has invalid seed", async () => {
      await expect(getBrktSeed(validOneBrktId, "test")).rejects.toThrow(
        "Invalid oneBrktId or seed"
      );
    });

    it("should throw if oneBrktid-seed pair has valid seed, but not an integer", async () => {
      await expect(getBrktSeed(validOneBrktId, 1.5)).rejects.toThrow(
        "Invalid oneBrktId or seed"
      );
    });

    it("should throw if oneBrktid-seed pair has seed too low", async () => {
      await expect(getBrktSeed(validOneBrktId, -1)).rejects.toThrow(
        "Invalid oneBrktId or seed"
      );
    });

    it("shoudl throw if oneBrktid-seed pair has seed too high", async () => {
      await expect(getBrktSeed(validOneBrktId, defaultBrktPlayers)).rejects.toThrow(
        "Invalid oneBrktId or seed"
      );
    });

    it("should throw if oneBrktid-seed pair has null seed", async () => {
      await expect(getBrktSeed(validOneBrktId, null as any)).rejects.toThrow(
        "Invalid oneBrktId or seed"
      );
    });
  });
});