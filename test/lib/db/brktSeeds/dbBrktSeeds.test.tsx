import axios from "axios";
import { brktSeedsApi } from "@/lib/db/apiPaths";
import { testBrktSeedsApi } from "../../../testApi";
import { defaultBrktPlayers, initBrktSeed } from "@/lib/db/initVals";
import {
  mockBrktSeedsToPost,
  mockOneBrktsToPost,
} from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import {
  deleteAllBrktSeedsForBrkt,
  deleteAllBrktSeedsForDiv,
  deleteAllBrktSeedsForOneBrkt,
  deleteAllBrktSeedsForSquad,
  deleteAllBrktSeedsForTmnt,
  getAllBrktSeedsForBrkt,
  getAllBrktSeedsForDiv,
  getAllBrktSeedsForOneBrkt,
  getAllBrktSeedsForSquad,
  getAllBrktSeedsForTmnt,
  getBrktSeed,
  postManyBrktSeeds,
  extractBrktSeeds,
} from "@/lib/db/brktSeeds/dbBrktSeeds";
import { replaceManyBrktSeeds } from "@/lib/db/brktSeeds/dbBrktSeedsReplaceMany";
import { deleteAllOneBrktsForSquad, deleteOneBrkt, postOneBrkt } from "@/lib/db/oneBrkts/dbOneBrkts";
import { cloneDeep } from "lodash";
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

const url = testBrktSeedsApi.startsWith("undefined")
  ? brktSeedsApi
  : testBrktSeedsApi;
const oneBrktUrl = url + "/oneBrkt/";

const notFoundOneBrktId = "obk_01234567890123456789012345678901";
const notFoundBrktId = "brk_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";

const mockOneBrktSquadId = "sqd_1234ec18b3d44c0189c83f6ac5fd4ad6";
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

const brktIdForMock = "brk_12344698f47e4d64935547923e2bdbfb";
const divIdForMock = "div_18997d3fd7ef4eb7ad2b53a9e93f9ce5";
const squadIdForMock = "sqd_1234ec18b3d44c0189c83f6ac5fd4ad6";
const tmntIdForMock = "tmt_d9b1af944d4941f65b2d2d4ac160cdea";

describe("dbBrktSeeds", () => {
  const deleteMockBrktSeeds = async () => {
    try {
      const response = await axios({
        method: "delete",
        withCredentials: true,
        url: oneBrktUrl + mockBrktSeedsToPost[0].one_brkt_id,
      });
      return response.status === 200 ? response.data.deleted.count : -1;
    } catch (err) {
      return -1;
    }
  };

  describe("extractBrktSeeds", () => {
    it("should return an empty array when given an empty array", () => {
      const result = extractBrktSeeds([]);
      expect(result).toEqual([]);
    });
    it("should correctly map raw brktSeeds to brktSeedType", () => {
      const rawBrktSeeds= [
        {
          one_brkt_id: 'obk_b0b2bc5682f042269cf0aaa8c32b25b8',
          seed: 0,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          extraField: "ignore me", // should be ignored
        },
      ];

      const result = extractBrktSeeds(rawBrktSeeds);

      const expected: brktSeedType = {
        ...initBrktSeed,
        one_brkt_id: 'obk_b0b2bc5682f042269cf0aaa8c32b25b8',
        seed: 0,
        player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
      };

      expect(result).toEqual([expected]);
    });
    it("should process multiple brktSeeds", () => {
      const rawBrktSeeds = [
        {
          one_brkt_id: 'obk_b0b2bc5682f042269cf0aaa8c32b25b8',
          seed: 0,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        },
        {
          one_brkt_id: 'obk_b0b2bc5682f042269cf0aaa8c32b25b8',
          seed: 1,
          player_id: 'ply_12be0472be3d476ea1caa99dd05953fa',
        },
      ];

      const result = extractBrktSeeds(rawBrktSeeds);

      expect(result).toHaveLength(2);
      expect(result[0].seed).toBe(0);
      expect(result[1].seed).toBe(1);
    });
    it('should return an empty array when given null', () => {
      const result = extractBrktSeeds(null);
      expect(result).toEqual([]);
    });
    it('should return an empty array when given non-array', () => {
      const result = extractBrktSeeds('not an array');
      expect(result).toEqual([]);
    });
  });  

  describe("getAllBrktSeedsForTmnt()", () => {
    it("should get all brktSeeds for a tmnt", async () => {
      const brktSeeds = await getAllBrktSeedsForTmnt(tmntId);
      expect(brktSeeds).toBeDefined();
      if (brktSeeds === null) return;
      expect(Array.isArray(brktSeeds)).toBe(true);
      // 32 rows in prisma/seed.ts
      expect(brktSeeds).toHaveLength(32);
      // 8 brktSeeds for each of the 4 oneBrkts
      // sorts goldPinkOneBrktId4, 2, 1, 3
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
      if (brktSeeds === null) return;
      expect(Array.isArray(brktSeeds)).toBe(true);
      expect(brktSeeds).toHaveLength(0);
    });
    it("should throw error if tmnt id is invalid", async () => {
      try {
        await getAllBrktSeedsForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should return null if tmnt id is valid, but not a tmnt id", async () => {
      try {
        await getAllBrktSeedsForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should return null if tmnt id is null", async () => {
      try {
        await getAllBrktSeedsForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });

  describe("getAllBrktSeedsForSquad()", () => {
    it("should get all brktSeeds for a squad", async () => {
      const brktSeeds = await getAllBrktSeedsForSquad(squadId);
      expect(brktSeeds).toBeDefined();
      if (brktSeeds === null) return;
      expect(Array.isArray(brktSeeds)).toBe(true);
      // 32 rows in prisma/seed.ts
      expect(brktSeeds).toHaveLength(32);
      // 8 brktSeeds for each of the 4 oneBrkts
      // sorts goldPinkOneBrktId4, 2, 1, 3
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
      if (brktSeeds === null) return;
      expect(Array.isArray(brktSeeds)).toBe(true);
      expect(brktSeeds).toHaveLength(0);
    });
    it("should return null if squad id is invalid", async () => {
      try {
        await getAllBrktSeedsForSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should return null if squad id is valid, but not a squad id", async () => {
      try {
        await getAllBrktSeedsForSquad(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should return null if squad id is null", async () => {
      try {
        await getAllBrktSeedsForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
  });

  describe("getAllOneBrktsForDiv()", () => {
    it("should get all brktSeeds for a div", async () => {
      const brktSeeds = await getAllBrktSeedsForDiv(divId);
      expect(brktSeeds).toBeDefined();
      if (brktSeeds === null) return;
      expect(Array.isArray(brktSeeds)).toBe(true);
      // 32 rows in prisma/seed.ts
      expect(brktSeeds).toHaveLength(32);
      // 8 brktSeeds for each of the 4 oneBrkts
      // sorts goldPinkOneBrktId4, 2, 1, 3
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
      if (brktSeeds === null) return;
      expect(Array.isArray(brktSeeds)).toBe(true);
      expect(brktSeeds).toHaveLength(0);
    });
    it("should return null if div id is invalid", async () => {
      try {
        await getAllBrktSeedsForDiv("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should return null if div id is valid, but not a div id", async () => {
      try {
        await getAllBrktSeedsForDiv(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should return null if div id is null", async () => {
      try {
        await getAllBrktSeedsForDiv(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
  });

  describe("getAllBrktSeedsForBrkt()", () => {
    it("should get all brktSeeds for a brkt", async () => {
      const brktSeeds = await getAllBrktSeedsForBrkt(brktId);
      expect(brktSeeds).toBeDefined();
      if (brktSeeds === null) return;
      expect(Array.isArray(brktSeeds)).toBe(true);
      // 16 rows in prisma/seed.ts
      expect(brktSeeds).toHaveLength(16);
      // 2 brktSeeds for each of the 8 oneBrkts
      // goldPinkOneBrktId2 sorts before goldPinkOneBrktId1
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
      if (brktSeeds === null) return;
      expect(Array.isArray(brktSeeds)).toBe(true);
      expect(brktSeeds).toHaveLength(0);
    });
    it("should return null if brkt id is invalid", async () => {
      try {
        await getAllBrktSeedsForBrkt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    });
    it("should return null if brkt id is valid, but not a brkt id", async () => {
      try {
        await getAllBrktSeedsForBrkt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    });
    it("should return null if brkt id is null", async () => {
      try {
        await getAllBrktSeedsForBrkt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    });
  });

  describe("getAllBrktSeedsForOneBrkt()", () => {
    it("should get all brktSeeds for a div", async () => {
      const brktSeeds = await getAllBrktSeedsForOneBrkt(oneBrktId);
      expect(brktSeeds).toBeDefined();
      if (brktSeeds === null) return;
      expect(Array.isArray(brktSeeds)).toBe(true);
      // 8 rows in prisma/seed.ts
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
      if (brktSeeds === null) return;
      expect(Array.isArray(brktSeeds)).toBe(true);
      expect(brktSeeds).toHaveLength(0);
    });
    it("should return null if oneBrkt id is invalid", async () => {
      try {
        await getAllBrktSeedsForOneBrkt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrkt id");
      }
    });
    it("should return null if oneBrkt id is valid, but not a oneBrkt id", async () => {
      try {
        await getAllBrktSeedsForOneBrkt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrkt id");
      }
    });
    it("should return null if oneBrkt id is null", async () => {
      try {
        await getAllBrktSeedsForOneBrkt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrkt id");
      }
    });
  });

  describe("getBrktSeed()", () => {
    const validOneBrktId = "obk_103f595981364b77af163624528bdfda";
    it("should get a brktSeed", async () => {
      const brktSeed = await getBrktSeed(goldPinkOneBrktId2, 0);
      expect(brktSeed).toBeDefined();
      if (brktSeed === null) return;
      expect(brktSeed.one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeed.seed).toBe(0);
      expect(brktSeed.player_id).toBe(playerId);
    });
    it("should get a brktSeed when seed is a valid integer sting", async () => {
      const brktSeed = await getBrktSeed(goldPinkOneBrktId2, "0");
      expect(brktSeed).toBeDefined();
      if (brktSeed === null) return;
      expect(brktSeed.one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeed.seed).toBe(0);
      expect(brktSeed.player_id).toBe(playerId);
    });
    it("should return null for a non-existent oneBrktid-seed pair - oneBrktid", async () => {
      try {
        await getBrktSeed(notFoundOneBrktId, 0);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "getBrktSeed failed: Request failed with status code 404"
        );
      }
    });
    it("should return null for a non-existent oneBrktid-seed pair - seed", async () => {
      try {
        await getBrktSeed(validOneBrktId, 7);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "getBrktSeed failed: Request failed with status code 404"
        );
      }
    });
    it("should return null if oneBrktid-seed pair has invalid oneBrktid", async () => {
      try {
        await getBrktSeed("test", 0);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrktId or seed");
      }
    });
    it("should return null if oneBrktid-seed pair has valid oneBrktid, but not a oneBrktId", async () => {
      try {
        await getBrktSeed(userId, 0);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrktId or seed");
      }
    });
    it("should return null if oneBrktid-seed pair has null oneBrktid", async () => {
      try {
        await getBrktSeed(null as any, 0);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrktId or seed");
      }
    });
    it("should return null if oneBrktid-seed pair has invalid seed", async () => {
      try {
        await getBrktSeed(validOneBrktId, "test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrktId or seed");
      }
    });
    it("should return null if oneBrktid-seed pair has valid seed, but not an integer", async () => {
      try {
        await getBrktSeed(validOneBrktId, 1.5);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrktId or seed");
      }
    });
    it("should return null if oneBrktid-seed pair has seed too low", async () => {
      try {
        await getBrktSeed(validOneBrktId, -1);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrktId or seed");
      }
    });
    it("shoudl return null if oneBrktid-seed pair has seed too high", async () => {
      try {
        await getBrktSeed(validOneBrktId, defaultBrktPlayers);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrktId or seed");
      }
    });
    it("should return null if oneBrktid-seed pair has null seed", async () => {
      try {
        await getBrktSeed(validOneBrktId, null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrktId or seed");
      }
    });
  });

  describe("postManyBrktSeeds()", () => {    
    let createdMany = false;

    beforeAll(async () => {
      // deletes all mock brktSeeds too
      await deleteAllOneBrktsForSquad(mockOneBrktSquadId);      
      await postOneBrkt(mockOneBrktsToPost[0]);
    });
    beforeEach(() => {
      createdMany = false;
    });
    afterEach(async () => {
      if (createdMany) {
        await deleteMockBrktSeeds();
      }
    });
    afterAll(async () => {
      // deletes all mock brktSeeds too      
      await deleteAllOneBrktsForSquad(mockOneBrktSquadId);
    });

    it("should post many brktSeeds", async () => {
      const count = await postManyBrktSeeds(mockBrktSeedsToPost);
      expect(count).toBe(mockBrktSeedsToPost.length);
      createdMany = true;

      const brktSeeds = await getAllBrktSeedsForOneBrkt(
        mockBrktSeedsToPost[0].one_brkt_id
      );
      expect(brktSeeds).not.toBeNull();
      if (!brktSeeds) return;
      expect(brktSeeds.length).toEqual(mockBrktSeedsToPost.length);
      for (let i = 0; i < mockBrktSeedsToPost.length; i++) {
        // all brktSeeds should have the same one_brkt_id
        expect(brktSeeds[i].one_brkt_id).toEqual(
          mockBrktSeedsToPost[0].one_brkt_id
        );
        if (brktSeeds[i].seed === 0) {
          expect(brktSeeds[i].player_id).toEqual(
            mockBrktSeedsToPost[0].player_id
          );
        } else if (brktSeeds[i].seed === 1) {
          expect(brktSeeds[i].player_id).toEqual(
            mockBrktSeedsToPost[1].player_id
          );
        } else if (brktSeeds[i].seed === 2) {
          expect(brktSeeds[i].player_id).toEqual(
            mockBrktSeedsToPost[2].player_id
          );
        } else if (brktSeeds[i].seed === 3) {
          expect(brktSeeds[i].player_id).toEqual(
            mockBrktSeedsToPost[3].player_id
          );
        } else if (brktSeeds[i].seed === 4) {
          expect(brktSeeds[i].player_id).toEqual(
            mockBrktSeedsToPost[4].player_id
          );
        } else if (brktSeeds[i].seed === 5) {
          expect(brktSeeds[i].player_id).toEqual(
            mockBrktSeedsToPost[5].player_id
          );
        } else if (brktSeeds[i].seed === 6) {
          expect(brktSeeds[i].player_id).toEqual(
            mockBrktSeedsToPost[6].player_id
          );
        } else if (brktSeeds[i].seed === 7) {
          expect(brktSeeds[i].player_id).toEqual(
            mockBrktSeedsToPost[7].player_id
          );
        }
      }
    });
    it("should return 0 when passed and empty array", async () => {
      const count = await postManyBrktSeeds([]);
      expect(count).toBe(0);
    });
    // see test\app\api\brktSeeds\validate_brktSeeds.test.tsx
    // for full testing of sanitation and validation
    it("should NOT post many brktSeeds with sanitation, seed value sanitized to undefined", async () => {
      try {
        const toSanitize = cloneDeep(mockBrktSeedsToPost);
        toSanitize[0].seed = Number.MAX_SAFE_INTEGER + 1;
        await postManyBrktSeeds(toSanitize);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brktSeed data at index 0");
      }
    });
    it("should throw an error when post many brktSeeds with invalid data in second item", async () => {
      try {
        const invalidBrktSeeds = cloneDeep(mockBrktSeedsToPost);
        invalidBrktSeeds[1].one_brkt_id = userId;
        await postManyBrktSeeds(invalidBrktSeeds);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brktSeed data at index 1");
      }
    });
    it("should throw an error when post many brktSeeds with invalid data in thord item", async () => {
      try {
        const invalidBrktSeeds = cloneDeep(mockBrktSeedsToPost);
        invalidBrktSeeds[2].player_id = userId;
        await postManyBrktSeeds(invalidBrktSeeds);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brktSeed data at index 2");
      }
    });
    it("should throw an error when post many brktSeeds with pass a non-array", async () => {
      try {
        await postManyBrktSeeds("not an array" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brktSeeds data");
      }
    });
    it("should throw an error when post many brktSeeds with pass null", async () => {
      try {
        await postManyBrktSeeds(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brktSeeds data");
      }
    });
  });

  describe("replaceManyBrktSeedRows()", () => {    

    let createdMany = false;
    beforeAll(async () => {
      // deletes all mock brktSeeds too
      await deleteAllOneBrktsForSquad(mockOneBrktSquadId);      
      await postOneBrkt(mockOneBrktsToPost[0]);
    });
    beforeEach(() => {
      createdMany = false;
    });
    afterEach(async () => {
      if (createdMany) {
        await deleteMockBrktSeeds();
      }
    });
    afterAll(async () => {
      // deletes all mock brktSeeds too
      await deleteAllOneBrktsForSquad(mockOneBrktSquadId);      
    });

    it("should replace brktSeeds for oneBrkt - no brktSeeds yet", async () => {
      const replacedCount = await replaceManyBrktSeeds(
        mockBrktSeedsToPost,
        mockOneBrktSquadId
      );
      expect(replacedCount).toBe(mockBrktSeedsToPost.length);
      createdMany = true;
    });
    it("should replace brktSeeds for a squad - replacing brktSeeds", async () => {
      const replacedCount = await replaceManyBrktSeeds(
        mockBrktSeedsToPost,
        mockOneBrktSquadId
      );
      expect(replacedCount).toBe(mockBrktSeedsToPost.length);
      createdMany = true;
      const mockBrktSeedsToPost2 = cloneDeep(mockBrktSeedsToPost);
      mockBrktSeedsToPost2[0].player_id =
        "ply_a01758cff1cc4bab9d9133e661bd49b0";
      mockBrktSeedsToPost2[1].player_id =
        "ply_a02758cff1cc4bab9d9133e661bd49b0";
      mockBrktSeedsToPost2[2].player_id =
        "ply_a03758cff1cc4bab9d9133e661bd49b0";
      mockBrktSeedsToPost2[3].player_id =
        "ply_a04758cff1cc4bab9d9133e661bd49b0";
      mockBrktSeedsToPost2[4].player_id =
        "ply_a05758cff1cc4bab9d9133e661bd49b0";
      mockBrktSeedsToPost2[5].player_id =
        "ply_a06758cff1cc4bab9d9133e661bd49b0";
      mockBrktSeedsToPost2[6].player_id =
        "ply_a07758cff1cc4bab9d9133e661bd49b0";
      mockBrktSeedsToPost2[7].player_id =
        "ply_a08758cff1cc4bab9d9133e661bd49b0";
      const replacedCount2 = await replaceManyBrktSeeds(
        mockBrktSeedsToPost2,
        mockOneBrktSquadId
      );
      expect(replacedCount2).toBe(mockBrktSeedsToPost.length);
      const replaced = await getAllBrktSeedsForSquad(mockOneBrktSquadId);
      if (!replaced) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replaced).toHaveLength(mockBrktSeedsToPost.length);
      for (let i = 0; i < mockBrktSeedsToPost.length; i++) {
        if (replaced[i].seed === 0) {
          expect(replaced[i].player_id).toEqual(
            mockBrktSeedsToPost2[0].player_id
          );
        } else if (replaced[i].seed === 1) {
          expect(replaced[i].player_id).toEqual(
            mockBrktSeedsToPost2[1].player_id
          );
        } else if (replaced[i].seed === 2) {
          expect(replaced[i].player_id).toEqual(
            mockBrktSeedsToPost2[2].player_id
          );
        } else if (replaced[i].seed === 3) {
          expect(replaced[i].player_id).toEqual(
            mockBrktSeedsToPost2[3].player_id
          );
        } else if (replaced[i].seed === 4) {
          expect(replaced[i].player_id).toEqual(
            mockBrktSeedsToPost2[4].player_id
          );
        } else if (replaced[i].seed === 5) {
          expect(replaced[i].player_id).toEqual(
            mockBrktSeedsToPost2[5].player_id
          );
        } else if (replaced[i].seed === 6) {
          expect(replaced[i].player_id).toEqual(
            mockBrktSeedsToPost2[6].player_id
          );
        } else if (replaced[i].seed === 7) {
          expect(replaced[i].player_id).toEqual(
            mockBrktSeedsToPost2[7].player_id
          );
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should return 0 when passed an empty array", async () => {
      const replacedCount = await replaceManyBrktSeeds(
        mockBrktSeedsToPost,
        mockOneBrktSquadId
      );
      expect(replacedCount).toBe(mockBrktSeedsToPost.length);
      createdMany = true;
      const brktSeeds = await getAllBrktSeedsForSquad(mockOneBrktSquadId);
      if (!brktSeeds) {
        expect(true).toBeFalsy();
        return;
      }
      expect(brktSeeds.length).toEqual(mockBrktSeedsToPost.length);

      const replaceCount = await replaceManyBrktSeeds([], mockOneBrktSquadId);
      expect(replaceCount).toBe(0);
      const replacedBrktSeeds = await getAllBrktSeedsForSquad(
        mockOneBrktSquadId
      );
      if (!replacedBrktSeeds) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedBrktSeeds.length).toEqual(0);
    });
    it("should throw an error if passed null as brktSeeds", async () => {
      await expect(
        replaceManyBrktSeeds(null as any, mockOneBrktSquadId)
      ).rejects.toThrow("Invalid brktSeeds provided");
    });
    it("should throw an error if brktSeeds is not an array", async () => {
      await expect(
        replaceManyBrktSeeds("not-an-array" as any, mockOneBrktSquadId)
      ).rejects.toThrow("Invalid brktSeeds provided");
    });
    it("should throw an error if passed null as squadId", async () => {
      await expect(
        replaceManyBrktSeeds(mockBrktSeedsToPost, null as any)
      ).rejects.toThrow("Invalid squad id");
    });
    it("should throw an error if passed invalid squadId", async () => {
      await expect(
        replaceManyBrktSeeds(mockBrktSeedsToPost, "test")
      ).rejects.toThrow("Invalid squad id");
    });
    it("should throw an error if passed valid id, but not squad id", async () => {
      await expect(
        replaceManyBrktSeeds(mockBrktSeedsToPost, tmntId)
      ).rejects.toThrow("Invalid squad id");
    });
  });

  describe("deleteAllBrktSeedsForOneBrkt()", () => {
    let deletedMany = false;
    beforeAll(async () => {
      // deletes all mock brktSeeds too
      await deleteAllOneBrktsForSquad(mockOneBrktSquadId);  
      // await deleteOneBrkt(mockOneBrktsToPost[0].id);
      await postOneBrkt(mockOneBrktsToPost[0]);
      await postManyBrktSeeds(mockBrktSeedsToPost);
    });
    beforeEach(() => {
      deletedMany = false;
    });
    afterEach(async () => {
      if (deletedMany) {
        await postManyBrktSeeds(mockBrktSeedsToPost);
      }
    });
    afterAll(async () => {
      // deletes all mock brktSeeds too
      await deleteAllOneBrktsForSquad(mockOneBrktSquadId);  
      // await deleteOneBrkt(mockOneBrktsToPost[0].id);
    });

    it("should delete all brktSeeds for oneBrkt", async () => {
      const deletedCount = await deleteAllBrktSeedsForOneBrkt(
        mockBrktSeedsToPost[0].one_brkt_id
      );
      expect(deletedCount).toBe(mockBrktSeedsToPost.length);
      deletedMany = true;
    });
    it("should delete 0 brktSeeds for oneBrkt when oneBrkt id is not found", async () => {
      const deletedCount = await deleteAllBrktSeedsForOneBrkt(
        notFoundOneBrktId
      );
      expect(deletedCount).toBe(0);
    });
    it("should throw an error when oneBrkt id is invalid", async () => {
      try {
        await deleteAllBrktSeedsForOneBrkt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrkt id");
      }
    });
    it("should throw an error when oneBrkt id is valid, but not a squad id", async () => {
      try {
        await deleteAllBrktSeedsForOneBrkt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrkt id");
      }
    });
    it("should throw an error when oneBrkt id is null", async () => {
      try {
        await deleteAllBrktSeedsForOneBrkt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrkt id");
      }
    });
  });

  describe("deleteAllBrktSeedsForBrkt()", () => {
    let deletedMany = false;
    beforeAll(async () => {
      // deletes all mock brktSeeds too
      await deleteAllOneBrktsForSquad(mockOneBrktSquadId);  
      // await deleteOneBrkt(mockOneBrktsToPost[0].id);
      await postOneBrkt(mockOneBrktsToPost[0]);
      await postManyBrktSeeds(mockBrktSeedsToPost);
    });
    beforeEach(() => {
      deletedMany = false;
    });
    afterEach(async () => {
      if (deletedMany) {
        await postManyBrktSeeds(mockBrktSeedsToPost);
      }
    });
    afterAll(async () => {
      // deletes all mock brktSeeds too
      await deleteAllOneBrktsForSquad(mockOneBrktSquadId);  
      // await deleteOneBrkt(mockOneBrktsToPost[0].id);
    });

    it("should delete all brktSeeds for brkt", async () => {
      const deletedCount = await deleteAllBrktSeedsForBrkt(brktIdForMock);
      expect(deletedCount).toBe(mockBrktSeedsToPost.length);
      deletedMany = true;
    });
    it("should delete 0 brktSeeds for brkt when brkt id is not found", async () => {
      const deletedCount = await deleteAllBrktSeedsForBrkt(notFoundBrktId);
      expect(deletedCount).toBe(0);
    });
    it("should throw an error when brkt id is invalid", async () => {
      try {
        await deleteAllBrktSeedsForBrkt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    });
    it("should throw an error when brkt id is valid, but not a squad id", async () => {
      try {
        await deleteAllBrktSeedsForBrkt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    });
    it("should throw an error when brkt id is null", async () => {
      try {
        await deleteAllBrktSeedsForBrkt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    });
  });

  describe("deleteAllOneBrktsForDiv()", () => {
    let deletedMany = false;
    beforeAll(async () => {
      // deletes all mock brktSeeds too
      await deleteAllOneBrktsForSquad(mockOneBrktSquadId);  
      // await deleteOneBrkt(mockOneBrktsToPost[0].id);
      await postOneBrkt(mockOneBrktsToPost[0]);
      await postManyBrktSeeds(mockBrktSeedsToPost);
    });
    beforeEach(() => {
      deletedMany = false;
    });
    afterEach(async () => {
      if (deletedMany) {
        await postManyBrktSeeds(mockBrktSeedsToPost);
      }
    });
    afterAll(async () => {
      // deletes all mock brktSeeds too
      await deleteAllOneBrktsForSquad(mockOneBrktSquadId);  
      // await deleteOneBrkt(mockOneBrktsToPost[0].id);
    });

    it("should delete all brktSeeds for div", async () => {
      const deletedCount = await deleteAllBrktSeedsForDiv(divIdForMock);
      deletedMany = true;
      expect(deletedCount).toBe(mockBrktSeedsToPost.length);
    });
    it("should delete 0 brktSeeds for div when div id is not found", async () => {
      const deletedCount = await deleteAllBrktSeedsForDiv(notFoundDivId);
      expect(deletedCount).toBe(0);
    });
    it("should throw an error when div id is invalid", async () => {
      try {
        await deleteAllBrktSeedsForDiv("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should throw an error when div id is valid, but not a squad id", async () => {
      try {
        await deleteAllBrktSeedsForDiv(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should throw an error when div id is null", async () => {
      try {
        await deleteAllBrktSeedsForDiv(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
  });

  describe("deleteAllBrktSeedsForSquad()", () => {
    let deletedMany = false;
    beforeAll(async () => {
      // deletes all mock brktSeeds too
      await deleteAllOneBrktsForSquad(mockOneBrktSquadId);  
      // await deleteOneBrkt(mockOneBrktsToPost[0].id);
      await postOneBrkt(mockOneBrktsToPost[0]);
      await postManyBrktSeeds(mockBrktSeedsToPost);
    });
    beforeEach(() => {
      deletedMany = false;
    });
    afterEach(async () => {
      if (deletedMany) {
        await postManyBrktSeeds(mockBrktSeedsToPost);
      }
    });
    afterAll(async () => {
      // deletes all mock brktSeeds too
      await deleteAllOneBrktsForSquad(mockOneBrktSquadId);  
      // await deleteOneBrkt(mockOneBrktsToPost[0].id);
    });

    it("should delete all brktSeeds for squad", async () => {
      const deletedCount = await deleteAllBrktSeedsForSquad(squadIdForMock);
      deletedMany = true;
      expect(deletedCount).toBe(mockBrktSeedsToPost.length);
    });
    it("should delete 0 brktSeeds for squad when squad id is not found", async () => {
      const deletedCount = await deleteAllBrktSeedsForSquad(notFoundSquadId);
      expect(deletedCount).toBe(0);
    });
    it("should throw an error when squad id is invalid", async () => {
      try {
        await deleteAllBrktSeedsForSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should throw an error when squad id is valid, but not a squad id", async () => {
      try {
        await deleteAllBrktSeedsForSquad(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should throw an error when squad id is null", async () => {
      try {
        await deleteAllBrktSeedsForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
  });

  describe("deleteAllBrktSeedsForTmnt()", () => {
    let deletedMany = false;
    beforeAll(async () => {
      // deletes all mock brktSeeds too
      await deleteAllOneBrktsForSquad(mockOneBrktSquadId);  
      // await deleteOneBrkt(mockOneBrktsToPost[0].id);
      await postOneBrkt(mockOneBrktsToPost[0]);
      await postManyBrktSeeds(mockBrktSeedsToPost);
    });
    beforeEach(() => {
      deletedMany = false;
    });
    afterEach(async () => {
      if (deletedMany) {
        await postManyBrktSeeds(mockBrktSeedsToPost);
      }
    });
    afterAll(async () => {
      // deletes all mock brktSeeds too
      await deleteAllOneBrktsForSquad(mockOneBrktSquadId);  
      // await deleteOneBrkt(mockOneBrktsToPost[0].id);
    });

    it("should delete all brktSeeds for tmnt", async () => {
      const deletedCount = await deleteAllBrktSeedsForTmnt(tmntIdForMock);
      deletedMany = true;
      expect(deletedCount).toBe(mockBrktSeedsToPost.length);
    });
    it("should delete 0 brktSeeds for tmnt when tmnt id is not found", async () => {
      const deletedCount = await deleteAllBrktSeedsForTmnt(notFoundTmntId);
      expect(deletedCount).toBe(0);
    });
    it("should throw an error when tmnt id is invalid", async () => {
      try {
        await deleteAllBrktSeedsForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw an error when tmnt id is valid, but not a tmnt id", async () => {
      try {
        await deleteAllBrktSeedsForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw an error when tmnt id is null", async () => {
      try {
        await deleteAllBrktSeedsForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });
});
