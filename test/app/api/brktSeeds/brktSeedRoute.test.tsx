import axios, { AxiosError } from "axios";
import { brktSeedsApi } from "@/lib/api/apiPaths";
import { testBrktSeedsApi } from "../../../testApi";
import type { brktSeedType } from "@/lib/types/types";
import { defaultBrktPlayers, initBrktSeed } from "@/lib/db/initVals";
import { mockBrktSeedsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { cloneDeep } from "lodash";

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

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBrktSeedsApi
  ? testBrktSeedsApi
  : brktSeedsApi;

const brktSeedUrl = url + "/brktSeed/";
const brktUrl = url + "/brkt/";
const divUrl = url + "/div/";
const oneBrktUrl = url + "/oneBrkt/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

const notFoundOneBrktId = "obk_01234567890123456789012345678901";
const notFoundBrktId = "brk_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";

const goldPinkOneBrktId1 = 'obk_557f12f3875f42baa29fdbd22ee7f2f4';
const goldPinkOneBrktId2 = 'obk_5423c16d58a948748f32c7c72c632297';
const goldPinkOneBrktId3 = 'obk_8d500123a07d46f9bb23db61e74ffc1b';
const goldPinkOneBrktId4 = 'obk_4ba9e037c86e494eb272efcd989dc9d0';
const newYearsEveOneBrktId = "obk_103f595981364b77af163624528bdfda";

const brktId = "brk_5109b54c2cc44ff9a3721de42c80c8c1";
const divId = "div_f30aea2c534f4cfe87f4315531cef8ef";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const userId = "usr_01234567890123456789012345678901";

describe("brktSeeds - API: /api/brktSeed", () => {
  const delOneBrktSeed = async (oneBrktId: string, seed: number) => {
    const delUrl = brktSeedUrl + oneBrktId + "/" + seed;
    try {
      await axios.delete(delUrl, { withCredentials: true });
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.status !== 404) {
          console.log(err.message);
          return;
        }
      }
    }
  };

  const deletePostedBrktSeed = async () => {
    const response = await axios.get(url);
    const brktSeeds = response.data.brktSeeds;
    const toDel = brktSeeds.find(
      (b: brktSeedType) =>
        b.one_brkt_id === newYearsEveOneBrktId && b.seed === 7
    );
    if (toDel) {
      await delOneBrktSeed(toDel.one_brkt_id, toDel.seed);
    }
  };

  describe("GET /api/brktSeed", () => {
    it('should return 200 and an array of brktSeeds', async () => {
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      expect(response.data.brktSeeds).toBeDefined();
      expect(Array.isArray(response.data.brktSeeds)).toBe(true);
      // 35 rows in prisma/seed.ts
      expect(response.data.brktSeeds).toHaveLength(35);
      for (let i = 0; i < response.data.brktSeeds.length; i++) {
        expect(response.data.brktSeeds[i].one_brkt_id).toBeDefined();
        expect(response.data.brktSeeds[i].one_brkt_id.startsWith("obk_")).toBeTruthy();
        expect(response.data.brktSeeds[i].seed).toBeDefined();
        expect(response.data.brktSeeds[i].seed).toBeGreaterThanOrEqual(0)
        expect(response.data.brktSeeds[i].seed).toBeLessThanOrEqual(7)
        expect(response.data.brktSeeds[i].player_id).toBeDefined();
        expect(response.data.brktSeeds[i].player_id.startsWith("ply_")).toBeTruthy();
      }
    });
  });

  describe("GET by one_brkt_id + seed /api/brktSeed/:oneBrktId/:seed", () => {
    // from prisma/seed.ts
    const toGet = {
      ...initBrktSeed,
      one_brkt_id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
      seed: 0,
      player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
    }
    it('should return 200 and the brktSeed with given one_brkt_id and seed', async () => {
      const testUrl = brktSeedUrl + toGet.one_brkt_id + "/" + toGet.seed
      const response = await axios.get(testUrl);
      expect(response.status).toBe(200);
      expect(response.data.brktSeed).toBeDefined();
      expect(response.data.brktSeed.one_brkt_id).toBe(toGet.one_brkt_id);
      expect(response.data.brktSeed.seed).toBe(toGet.seed);
      expect(response.data.brktSeed.player_id).toBe(toGet.player_id);
    })
    it('should return 404 for invalid one_brkt_id', async () => {
      try {
        const testUrl = brktSeedUrl + 'invalid_id' + "/" + toGet.seed
        await axios.get(testUrl);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        }
      }
    })
    it('should return 404 for valid one_brkt_id, but not a one brktid', async () => {
      try {
        const testUrl = brktSeedUrl + divId + "/" + toGet.seed
        await axios.get(testUrl);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        }
      }
    })
    it('should return 404 for invalid seed', async () => {
      try {
        const testUrl = brktSeedUrl + toGet.one_brkt_id + "/invalid_seed"
        await axios.get(testUrl);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        }
      }
    })
    it('should return 404 for seed too low', async () => {
      try {
        const testUrl = brktSeedUrl + toGet.one_brkt_id + "/-1"
        await axios.get(testUrl);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        }
      }
    })
    it('should return 404 for seed too high', async () => {
      try {
        const testUrl = brktSeedUrl + toGet.one_brkt_id + "/" + defaultBrktPlayers;
        await axios.get(testUrl);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        }
      }
    })
    it('should return 404 for when obe_brktid + seed it not found', async () => {
      try {
        const testUrl = brktSeedUrl + notFoundOneBrktId + "/" + toGet.seed
        await axios.get(testUrl);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("not found");
        }
      }
    })
    it('should return 404 for when one_brkt_id + seed is not found (seed not found)', async () => {
      // prima/seed.ts only inserts 2 brktSeed rows for newYearsEve
      try {
        const testUrl = brktSeedUrl + newYearsEveOneBrktId + "/" + 2
        await axios.get(testUrl);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("not found");
        }
      }
    })
  });

  describe("GET brktsSeeds for a oneBrkt /api/brktsSeeds/oneBrkt/:oneBrktId", () => {
    beforeAll(async () => {
      await deletePostedBrktSeed();
    })
    it('should get all brktsSeeds for a oneBrkt', async () => {
      const response = await axios.get(oneBrktUrl + goldPinkOneBrktId1);
      expect(response.status).toBe(200);
      expect(response.data.brktSeeds).toBeDefined();
      expect(Array.isArray(response.data.brktSeeds)).toBe(true);
      // 8 rows in prisma/seed.ts
      expect(response.data.brktSeeds).toHaveLength(8);
      for (let i = 0; i < response.data.brktSeeds.length; i++) {
        expect(response.data.brktSeeds[i].seed).toBe(i);
      }
    })
    it('should return 404 for invalid oneBrktId', async () => {
      try {
        const testUrl = oneBrktUrl + 'test';
        const response = await axios.get(testUrl);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        }
      }
    })
    it('should return 404 when valid id, but not a oneBrkt id', async () => {
      try {
        const testUrl = oneBrktUrl + userId;
        const response = await axios.get(testUrl);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        }
      }
    })
    it('should return 200 and an empty array if no brktsSeeds for oneBrkt', async () => {
      const response = await axios.get(oneBrktUrl + notFoundOneBrktId);
      expect(response.status).toBe(200);
      expect(response.data.brktSeeds).toBeDefined();
      expect(Array.isArray(response.data.brktSeeds)).toBe(true);
      expect(response.data.brktSeeds).toHaveLength(0);
    })
  });

  describe("GET brktSeeds for a bracket /api/brktSeeds/brkt/:brktId", () => {
    beforeAll(async () => {
      await deletePostedBrktSeed();
    })
    it('should get all brktSeeds for a bracket', async () => {
      const response = await axios.get(brktUrl + brktId);
      expect(response.status).toBe(200);
      expect(response.data.brktSeeds).toBeDefined();
      expect(Array.isArray(response.data.brktSeeds)).toBe(true);
      // 16 rows in prisma/seed.ts
      expect(response.data.brktSeeds).toHaveLength(16);
      // 2 brktSeeds for each of the 8 oneBrkts
      // goldPinkOneBrktId2 sorts before goldPinkOneBrktId1
      expect(response.data.brktSeeds[0].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(response.data.brktSeeds[0].seed).toBe(0);
      expect(response.data.brktSeeds[1].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(response.data.brktSeeds[1].seed).toBe(1);
      expect(response.data.brktSeeds[6].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(response.data.brktSeeds[6].seed).toBe(6);
      expect(response.data.brktSeeds[7].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(response.data.brktSeeds[7].seed).toBe(7);
      expect(response.data.brktSeeds[8].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(response.data.brktSeeds[8].seed).toBe(0);
      expect(response.data.brktSeeds[9].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(response.data.brktSeeds[9].seed).toBe(1);
      expect(response.data.brktSeeds[14].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(response.data.brktSeeds[14].seed).toBe(6);
      expect(response.data.brktSeeds[15].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(response.data.brktSeeds[15].seed).toBe(7);
    })
    it('should return 404 for invalid brktId', async () => {
      try {
        const testUrl = brktUrl + 'test';
        const response = await axios.get(testUrl);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        }
      }
    })
    it('should return 404 when valid id, but not a brkt id', async () => {
      try {
        const testUrl = brktUrl + userId;
        const response = await axios.get(testUrl);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        }
      }
    })
    it('should return 200 and an empty array if no brktsSeeds for brkt', async () => {
      const response = await axios.get(brktUrl + notFoundBrktId);
      expect(response.status).toBe(200);
      expect(response.data.brktSeeds).toBeDefined();
      expect(Array.isArray(response.data.brktSeeds)).toBe(true);
      expect(response.data.brktSeeds).toHaveLength(0);
    })
  });

  describe("GET brktSeeds for a division /api/brktSeeds/divs/:divId", () => {
    beforeAll(async () => {
      await deletePostedBrktSeed();
    })
    it('should get all brktSeeds for a div', async () => {
      const response = await axios.get(divUrl + divId);
      expect(response.status).toBe(200);
      expect(response.data.brktSeeds).toBeDefined();
      expect(Array.isArray(response.data.brktSeeds)).toBe(true);
      // 32 rows in prisma/seed.ts      
      expect(response.data.brktSeeds).toHaveLength(32)
      // 8 brktSeeds for each of the 4 oneBrkts
      // sorts goldPinkOneBrktId4, 2, 1, 3
      expect(response.data.brktSeeds[0].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(response.data.brktSeeds[0].seed).toBe(0);
      expect(response.data.brktSeeds[1].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(response.data.brktSeeds[1].seed).toBe(1);
      expect(response.data.brktSeeds[6].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(response.data.brktSeeds[6].seed).toBe(6);
      expect(response.data.brktSeeds[7].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(response.data.brktSeeds[7].seed).toBe(7);

      expect(response.data.brktSeeds[8].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(response.data.brktSeeds[8].seed).toBe(0);
      expect(response.data.brktSeeds[9].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(response.data.brktSeeds[9].seed).toBe(1);
      expect(response.data.brktSeeds[14].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(response.data.brktSeeds[14].seed).toBe(6);
      expect(response.data.brktSeeds[15].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(response.data.brktSeeds[15].seed).toBe(7);    

      expect(response.data.brktSeeds[16].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(response.data.brktSeeds[16].seed).toBe(0);
      expect(response.data.brktSeeds[17].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(response.data.brktSeeds[17].seed).toBe(1);
      expect(response.data.brktSeeds[22].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(response.data.brktSeeds[22].seed).toBe(6);
      expect(response.data.brktSeeds[23].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(response.data.brktSeeds[23].seed).toBe(7);

      expect(response.data.brktSeeds[24].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(response.data.brktSeeds[24].seed).toBe(0);
      expect(response.data.brktSeeds[25].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(response.data.brktSeeds[25].seed).toBe(1);
      expect(response.data.brktSeeds[30].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(response.data.brktSeeds[30].seed).toBe(6);
      expect(response.data.brktSeeds[31].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(response.data.brktSeeds[31].seed).toBe(7);    
    })
    it('should return 404 for invalid divId', async () => {
      try {
        const testUrl = divUrl + 'test';
        const response = await axios.get(testUrl);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        }
      }
    })
    it('should return 404 when valid id, but not a div id', async () => {
      try {
        const testUrl = divUrl + userId;
        const response = await axios.get(testUrl);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        }
      }
    })
    it('should return 200 and an empty array if no brktsSeeds for div', async () => {
      const response = await axios.get(divUrl + notFoundDivId);
      expect(response.status).toBe(200);
      expect(response.data.brktSeeds).toBeDefined();
      expect(Array.isArray(response.data.brktSeeds)).toBe(true);
      expect(response.data.brktSeeds).toHaveLength(0);
    })
  });

  describe("GET brktSeeds for a squad /api/brktSeeds/squad/:squadId", () => {
    beforeAll(async () => {
      await deletePostedBrktSeed();
    })
    it('should get all brktSeeds for a squad', async () => {
      const response = await axios.get(squadUrl + squadId);
      expect(response.status).toBe(200);
      expect(response.data.brktSeeds).toBeDefined();
      expect(Array.isArray(response.data.brktSeeds)).toBe(true);
      // 32 rows in prisma/seed.ts      
      expect(response.data.brktSeeds).toHaveLength(32)
      // 8 brktSeeds for each of the 4 oneBrkts
      // sorts goldPinkOneBrktId4, 2, 1, 3
      expect(response.data.brktSeeds[0].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(response.data.brktSeeds[0].seed).toBe(0);
      expect(response.data.brktSeeds[1].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(response.data.brktSeeds[1].seed).toBe(1);
      expect(response.data.brktSeeds[6].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(response.data.brktSeeds[6].seed).toBe(6);
      expect(response.data.brktSeeds[7].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(response.data.brktSeeds[7].seed).toBe(7);

      expect(response.data.brktSeeds[8].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(response.data.brktSeeds[8].seed).toBe(0);
      expect(response.data.brktSeeds[9].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(response.data.brktSeeds[9].seed).toBe(1);
      expect(response.data.brktSeeds[14].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(response.data.brktSeeds[14].seed).toBe(6);
      expect(response.data.brktSeeds[15].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(response.data.brktSeeds[15].seed).toBe(7);    

      expect(response.data.brktSeeds[16].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(response.data.brktSeeds[16].seed).toBe(0);
      expect(response.data.brktSeeds[17].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(response.data.brktSeeds[17].seed).toBe(1);
      expect(response.data.brktSeeds[22].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(response.data.brktSeeds[22].seed).toBe(6);
      expect(response.data.brktSeeds[23].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(response.data.brktSeeds[23].seed).toBe(7);

      expect(response.data.brktSeeds[24].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(response.data.brktSeeds[24].seed).toBe(0);
      expect(response.data.brktSeeds[25].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(response.data.brktSeeds[25].seed).toBe(1);
      expect(response.data.brktSeeds[30].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(response.data.brktSeeds[30].seed).toBe(6);
      expect(response.data.brktSeeds[31].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(response.data.brktSeeds[31].seed).toBe(7);    
    })
    it('should return 404 for invalid squadId', async () => {
      try {
        const testUrl = squadUrl + 'test';
        const response = await axios.get(testUrl);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        }
      }
    })
    it('should return 404 when valid id, but not a squad id', async () => {
      try {
        const testUrl = squadUrl + userId;
        const response = await axios.get(testUrl);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        }
      }
    })
    it('should return 200 and an empty array if no brktsSeeds for squad', async () => {
      const response = await axios.get(squadUrl + notFoundSquadId);
      expect(response.status).toBe(200);
      expect(response.data.brktSeeds).toBeDefined();
      expect(Array.isArray(response.data.brktSeeds)).toBe(true);
      expect(response.data.brktSeeds).toHaveLength(0);
    })
  });

  describe("GET brktSeeds for a tournament /api/brktSeeds/tmnt/:tmntId", () => {
    beforeAll(async () => {
      await deletePostedBrktSeed();
    })
    it('should get all brktSeeds for a tmnt', async () => {
      const response = await axios.get(tmntUrl + tmntId);
      expect(response.status).toBe(200);
      expect(response.data.brktSeeds).toBeDefined();
      expect(Array.isArray(response.data.brktSeeds)).toBe(true);
      // 32 rows in prisma/seed.ts      
      expect(response.data.brktSeeds).toHaveLength(32)
      // 8 brktSeeds for each of the 4 oneBrkts
      // sorts goldPinkOneBrktId4, 2, 1, 3
      expect(response.data.brktSeeds[0].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(response.data.brktSeeds[0].seed).toBe(0);
      expect(response.data.brktSeeds[1].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(response.data.brktSeeds[1].seed).toBe(1);
      expect(response.data.brktSeeds[6].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(response.data.brktSeeds[6].seed).toBe(6);
      expect(response.data.brktSeeds[7].one_brkt_id).toBe(goldPinkOneBrktId4);
      expect(response.data.brktSeeds[7].seed).toBe(7);

      expect(response.data.brktSeeds[8].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(response.data.brktSeeds[8].seed).toBe(0);
      expect(response.data.brktSeeds[9].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(response.data.brktSeeds[9].seed).toBe(1);
      expect(response.data.brktSeeds[14].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(response.data.brktSeeds[14].seed).toBe(6);
      expect(response.data.brktSeeds[15].one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(response.data.brktSeeds[15].seed).toBe(7);    

      expect(response.data.brktSeeds[16].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(response.data.brktSeeds[16].seed).toBe(0);
      expect(response.data.brktSeeds[17].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(response.data.brktSeeds[17].seed).toBe(1);
      expect(response.data.brktSeeds[22].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(response.data.brktSeeds[22].seed).toBe(6);
      expect(response.data.brktSeeds[23].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(response.data.brktSeeds[23].seed).toBe(7);

      expect(response.data.brktSeeds[24].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(response.data.brktSeeds[24].seed).toBe(0);
      expect(response.data.brktSeeds[25].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(response.data.brktSeeds[25].seed).toBe(1);
      expect(response.data.brktSeeds[30].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(response.data.brktSeeds[30].seed).toBe(6);
      expect(response.data.brktSeeds[31].one_brkt_id).toBe(goldPinkOneBrktId3);
      expect(response.data.brktSeeds[31].seed).toBe(7);    
    })
    it('should return 404 for invalid tmntId', async () => {
      try {
        const testUrl = tmntUrl + 'test';
        const response = await axios.get(testUrl);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        }
      }
    })
    it('should return 404 when valid id, but not a tmnt id', async () => {
      try {
        const testUrl = tmntUrl + userId;
        const response = await axios.get(testUrl);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        }
      }
    })
    it('should return 200 and an empty array if no brktsSeeds for tmnt', async () => {
      const response = await axios.get(tmntUrl + notFoundTmntId);
      expect(response.status).toBe(200);
      expect(response.data.brktSeeds).toBeDefined();
      expect(Array.isArray(response.data.brktSeeds)).toBe(true);
      expect(response.data.brktSeeds).toHaveLength(0);
    })
  });

  describe("POST one brktSeed API: /api/brktSeeds", () => {
    const brktSeedToPost: brktSeedType = {
      ...initBrktSeed,
      one_brkt_id: newYearsEveOneBrktId,
      seed: 7,
      player_id: mockBrktSeedsToPost[0].player_id,
    }
    let didPost = false;
    beforeEach(async () => {
      await deletePostedBrktSeed();
    })
    beforeEach(() => {
      didPost = false;
    })
    afterEach(async () => {
      if (didPost) {
        await deletePostedBrktSeed();
      }
    })
    it('should create a new brktSeed and return 201', async () => {
      const brktSeedJSON = JSON.stringify(brktSeedToPost);
      const response = await axios.post(url, brktSeedJSON, {
        withCredentials: true,
      });
      didPost = true;
      expect(response.status).toBe(201);
      expect(response.data.brktSeed).toBeDefined();
      expect(response.data.brktSeed.one_brkt_id).toBe(brktSeedToPost.one_brkt_id);
      expect(response.data.brktSeed.seed).toBe(brktSeedToPost.seed);
      expect(response.data.brktSeed.player_id).toBe(brktSeedToPost.player_id);
    })
    it('should not create a new brktSeed and return 422 for blank oneBrktId', async () => {
      const invalidBrktSeed = cloneDeep(brktSeedToPost);
      invalidBrktSeed.one_brkt_id = '';
      const invalidJSON = JSON.stringify(invalidBrktSeed);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not create a new brktSeed and return 422 for missing oneBrktId', async () => {
      const invalidBrktSeed = cloneDeep(brktSeedToPost);
      invalidBrktSeed.one_brkt_id = undefined as any;
      const invalidJSON = JSON.stringify(invalidBrktSeed);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not create a new brktSeed and return 422 for invalid oneBrktId', async () => {
      const invalidBrktSeed = cloneDeep(brktSeedToPost);
      invalidBrktSeed.one_brkt_id = 'test';
      const invalidJSON = JSON.stringify(invalidBrktSeed);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not create a new brktSeed and return 422 for valid id, but not a oneBrkt id', async () => {
      const invalidBrktSeed = cloneDeep(brktSeedToPost);
      invalidBrktSeed.one_brkt_id = userId;
      const invalidJSON = JSON.stringify(invalidBrktSeed);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not create a new brktSeed and return 422 for missing seed', async () => {
      const invalidBrktSeed = cloneDeep(brktSeedToPost);
      invalidBrktSeed.seed = undefined as any;
      const invalidJSON = JSON.stringify(invalidBrktSeed);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not create a new brktSeed and return 422 when seed is not a number', async () => {
      const invalidBrktSeed = cloneDeep(brktSeedToPost);
      invalidBrktSeed.seed = 'test' as any;
      const invalidJSON = JSON.stringify(invalidBrktSeed);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not create a new brktSeed and return 422 when seed is not an integer', async () => {
      const invalidBrktSeed = cloneDeep(brktSeedToPost);
      invalidBrktSeed.seed = 1.5;
      const invalidJSON = JSON.stringify(invalidBrktSeed);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not create a new brktSeed and return 422 when seed is too low', async () => {
      const invalidBrktSeed = cloneDeep(brktSeedToPost);
      invalidBrktSeed.seed = -1;
      const invalidJSON = JSON.stringify(invalidBrktSeed);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not create a new brktSeed and return 422 when seed is too high', async () => {
      const invalidBrktSeed = cloneDeep(brktSeedToPost);
      invalidBrktSeed.seed = defaultBrktPlayers;
      const invalidJSON = JSON.stringify(invalidBrktSeed);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not create a new brktSeed and return 422 for missing player id', async () => {
      const invalidBrktSeed = cloneDeep(brktSeedToPost);
      invalidBrktSeed.player_id = undefined as any;
      const invalidJSON = JSON.stringify(invalidBrktSeed);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not create a new brktSeed and return 422 for blank playerId', async () => {
      const invalidBrktSeed = cloneDeep(brktSeedToPost);
      invalidBrktSeed.player_id = '';
      const invalidJSON = JSON.stringify(invalidBrktSeed);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not create a new brktSeed and return 422 for invalid player id', async () => {
      const invalidBrktSeed = cloneDeep(brktSeedToPost);
      invalidBrktSeed.player_id = 'test';
      const invalidJSON = JSON.stringify(invalidBrktSeed);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not create a new brktSeed and return 422 for valid id, but not a player id', async () => {
      const invalidBrktSeed = cloneDeep(brktSeedToPost);
      invalidBrktSeed.player_id = userId;
      const invalidJSON = JSON.stringify(invalidBrktSeed);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
  });

  describe("DELETE by one_brkt_id + seed /api/brktSeed/:oneBrktId/:seed", () => {
    // to delete from prisma/seeds.ts
    const toDelBrktSeed = {
      ...initBrktSeed,
      one_brkt_id: "obk_6d6b6dd2e83242ac96b5a9298e21ae66",
      seed: 0,
      player_id: 'ply_b830099ed18a4e9da06e345ec2320848',
    }
    let didDel = false

    const repostToDel = async () => {

      try { 
        // delete if exists
        await axios.delete(brktSeedUrl + toDelBrktSeed.one_brkt_id + "/" + toDelBrktSeed.seed, {
          withCredentials: true
        })
        const oneBrktSeedJSON = JSON.stringify(toDelBrktSeed);
        await axios.post(url, oneBrktSeedJSON, {
          withCredentials: true
        })        
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    }

    beforeAll(async () => {
      await repostToDel();
    })
    beforeEach(() => {
      didDel = false;
    })
    afterEach(async () => {
      if (!didDel) return;
      await repostToDel();
    })
    afterAll(async () => {
      await repostToDel();
    })
    it('should delete a brktSeed by one_brkt_id + seed', async () => {
      const toDelUrl = brktSeedUrl + toDelBrktSeed.one_brkt_id + "/" + toDelBrktSeed.seed
      const response = await axios.delete(toDelUrl, {
        withCredentials: true
      });
      didDel = true;
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(1);
    })
    it('should not delete a brktSeed by one_brkt_id + seed when not found', async () => {
      const toDelUrl = brktSeedUrl + notFoundOneBrktId + "/" + toDelBrktSeed.seed
      const response = await axios.delete(toDelUrl, {
        withCredentials: true
      });
      didDel = true;
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(0);
    })
    it('should not delete a brktSeed by one_brkt_id + seed when one_brkt_id is invalid', async () => {
      try {
        const toDelUrl = brktSeedUrl + "test" + "/" + toDelBrktSeed.seed
        const response = await axios.delete(toDelUrl, {
          withCredentials: true
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not delete a brktSeed by one_brkt_id + seed when one_brkt_id is not a vlaid oneBrktId', async () => {
      try {
        const invalidBrktSee = cloneDeep(toDelBrktSeed);
        invalidBrktSee.seed = 'test' as any;
        const toDelUrl = brktSeedUrl + userId + "/" + toDelBrktSeed.seed
        const response = await axios.delete(toDelUrl, {
          withCredentials: true
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not delete a brktSeed by one_brkt_id + seed when seed is not a number', async () => {
      try {
        const invalidBrktSee = cloneDeep(toDelBrktSeed);
        invalidBrktSee.seed = 'test' as any;
        const toDelUrl = brktSeedUrl + toDelBrktSeed.one_brkt_id + "/" + 'test'
        const response = await axios.delete(toDelUrl, {
          withCredentials: true
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not delete a brktSeed by one_brkt_id + seed when seed is not an integer', async () => {
      try {
        const invalidBrktSee = cloneDeep(toDelBrktSeed);
        invalidBrktSee.seed = 1.5;
        const toDelUrl = brktSeedUrl + toDelBrktSeed.one_brkt_id + "/" + invalidBrktSee.seed
        const response = await axios.delete(toDelUrl, {
          withCredentials: true
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not delete a brktSeed by one_brkt_id + seed when seed is too low', async () => {
      try {
        const invalidBrktSee = cloneDeep(toDelBrktSeed);
        invalidBrktSee.seed = -1;
        const toDelUrl = brktSeedUrl + toDelBrktSeed.one_brkt_id + "/" + invalidBrktSee.seed
        const response = await axios.delete(toDelUrl, {
          withCredentials: true
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not delete a brktSeed by one_brkt_id + seed when seed is too high', async () => {
      try {
        const invalidBrktSee = cloneDeep(toDelBrktSeed);
        invalidBrktSee.seed = defaultBrktPlayers;
        const toDelUrl = brktSeedUrl + toDelBrktSeed.one_brkt_id + "/" + invalidBrktSee.seed
        const response = await axios.delete(toDelUrl, {
          withCredentials: true
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
  });

});
