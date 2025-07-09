import axios, { AxiosError } from "axios";
import { brktSeedsApi } from "@/lib/db/apiPaths";
import { testBrktSeedsApi } from "../../../testApi";
import { defaultBrktPlayers } from "@/lib/db/initVals";
import { mockBrktSeedsToPost, mockOneBrktsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { cloneDeep } from "lodash";
import { deleteAllBrktSeedsForBrkt, deleteAllBrktSeedsForDiv, deleteAllBrktSeedsForOneBrkt, deleteAllBrktSeedsForSquad, deleteAllBrktSeedsForTmnt, getAllBrktSeedsForBrkt, getAllBrktSeedsForDiv, getAllBrktSeedsForOneBrkt, getAllBrktSeedsForSquad, getAllBrktSeedsForTmnt, getBrktSeed, postManyBrktSeeds } from "@/lib/db/brktSeeds/dbBrktSeeds";
import { deleteOneBrkt, postOneBrkt } from "@/lib/db/oneBrkts/dbOneBrkts";

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
const oneBrktSeedUrl = url + "/brktSeed/";
const brktsUrl = url + "/brkt/";
const divUrl = url + "/div/";
const manyUrl = url + "/many";
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
const newYearsEveOneBrktId = 'obk_103f595981364b77af163624528bdfda';

const brktId = 'brk_5109b54c2cc44ff9a3721de42c80c8c1';
const brktId2 = 'brk_6ede2512c7d4409ca7b055505990a499';
const divId = 'div_f30aea2c534f4cfe87f4315531cef8ef';
const oneBrktId = 'obk_557f12f3875f42baa29fdbd22ee7f2f4';
const playerId = 'ply_88be0472be3d476ea1caa99dd05953fa';
const squadId = 'sqd_7116ce5f80164830830a7157eb093396';
const tmntId = 'tmt_fd99387c33d9c78aba290286576ddce5';
const userId = 'usr_01234567890123456789012345678901';

const brktIdForMock = 'brk_12344698f47e4d64935547923e2bdbfb';
const divIdForMock = 'div_18997d3fd7ef4eb7ad2b53a9e93f9ce5';
const squadIdForMock = "sqd_1234ec18b3d44c0189c83f6ac5fd4ad6";
const tmntIdForMock = "tmt_d9b1af944d4941f65b2d2d4ac160cdea";

// const fromSeedsTs: brktSeedType[] = [
//   {
//     ...initBrktSeed,
//     one_brkt_id: "obk_103f595981364b77af163624528bdfda",
//     seed: 0,
//     player_id: "ply_da674926088d4f739c69c2c72a465ccd",
//   },
//   {
//     ...initBrktSeed,
//     one_brkt_id: "obk_103f595981364b77af163624528bdfda",
//     seed: 1,
//     player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
//   },
//   {
//     ...initBrktSeed,
//     one_brkt_id: "obk_6d6b6dd2e83242ac96b5a9298e21ae66",
//     seed: 0,
//     player_id: "ply_b830099ed18a4e9da06e345ec2320848",
//   },
// ];

// const repopBrktSeeds: brktSeedType[] = [...mockBrktSeedsToPost, ...fromSeedsTs];

describe('dbBrktSeeds', () => {
  
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

  describe('getAllBrktSeedsForTmnt()', () => { 

    it('should get all brktSeeds for a tmnt', async () => {      
      const brktSeeds = await getAllBrktSeedsForTmnt(tmntId);
      expect(brktSeeds).toBeDefined();  
      if (brktSeeds === null) return;
      expect(Array.isArray(brktSeeds)).toBe(true);
      // 16 rows in prisma/seed.ts      
      expect(brktSeeds).toHaveLength(16)
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
    })
    it('should return 0 brktSeeds for a non-existent tmnt', async () => {      
      const brktSeeds = await getAllBrktSeedsForTmnt(notFoundTmntId);
      expect(brktSeeds).toBeDefined();  
      if (brktSeeds === null) return;
      expect(Array.isArray(brktSeeds)).toBe(true);
      expect(brktSeeds).toHaveLength(0);
    })
    it('should return null if tmnt id is invalid', async () => { 
      const brktSeeds = await getAllBrktSeedsForTmnt('test');
      expect(brktSeeds).toBe(null);
    })
    it('should return null if tmnt id is valid, but not a tmnt id', async () => { 
      const brktSeeds = await getAllBrktSeedsForTmnt(userId);
      expect(brktSeeds).toBe(null);
    })
    it('should return null if tmnt id is undefined', async () => { 
      const brktSeeds = await getAllBrktSeedsForTmnt(undefined as any);
      expect(brktSeeds).toBe(null);
    })
    it('should return null if tmnt id is null', async () => { 
      const brktSeeds = await getAllBrktSeedsForTmnt(null as any);
      expect(brktSeeds).toBe(null);
    })
  })

  describe('getAllBrktSeedsForSquad()', () => { 

    it('should get all brktSeeds for a squad', async () => {      
      const brktSeeds = await getAllBrktSeedsForSquad(squadId);
      expect(brktSeeds).toBeDefined();  
      if (brktSeeds === null) return;
      expect(Array.isArray(brktSeeds)).toBe(true);
      // 16 rows in prisma/seed.ts      
      expect(brktSeeds).toHaveLength(16)
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
    })
    it('should return 0 brktSeeds for a non-existent squad', async () => {      
      const brktSeeds = await getAllBrktSeedsForSquad(notFoundSquadId);
      expect(brktSeeds).toBeDefined();  
      if (brktSeeds === null) return;
      expect(Array.isArray(brktSeeds)).toBe(true);
      expect(brktSeeds).toHaveLength(0);
    })
    it('should return null if squad id is invalid', async () => { 
      const brktSeeds = await getAllBrktSeedsForSquad('test');
      expect(brktSeeds).toBe(null);
    })
    it('should return null if squad id is valid, but not a squad id', async () => { 
      const brktSeeds = await getAllBrktSeedsForSquad(userId);
      expect(brktSeeds).toBe(null);
    })
    it('should return null if squad id is undefined', async () => { 
      const brktSeeds = await getAllBrktSeedsForSquad(undefined as any);
      expect(brktSeeds).toBe(null);
    })
    it('should return null if squad id is null', async () => { 
      const brktSeeds = await getAllBrktSeedsForSquad(null as any);
      expect(brktSeeds).toBe(null);
    })
  })

  describe('getAllOneBrktsForDiv()', () => { 

    it('should get all brktSeeds for a div', async () => {      
      const brktSeeds = await getAllBrktSeedsForDiv(divId);
      expect(brktSeeds).toBeDefined();  
      if (brktSeeds === null) return;
      expect(Array.isArray(brktSeeds)).toBe(true);
      // 16 rows in prisma/seed.ts      
      expect(brktSeeds).toHaveLength(16)
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
    })
    it('should return 0 brktSeeds for a non-existent div', async () => {      
      const brktSeeds = await getAllBrktSeedsForDiv(notFoundDivId);
      expect(brktSeeds).toBeDefined();  
      if (brktSeeds === null) return;
      expect(Array.isArray(brktSeeds)).toBe(true);
      expect(brktSeeds).toHaveLength(0);
    })
    it('should return null if div id is invalid', async () => { 
      const brktSeeds = await getAllBrktSeedsForDiv('test');
      expect(brktSeeds).toBe(null);
    })
    it('should return null if div id is valid, but not a div id', async () => { 
      const brktSeeds = await getAllBrktSeedsForDiv(userId);
      expect(brktSeeds).toBe(null);
    })
    it('should return null if div id is undefined', async () => { 
      const brktSeeds = await getAllBrktSeedsForDiv(undefined as any);
      expect(brktSeeds).toBe(null);
    })
    it('should return null if div id is null', async () => { 
      const brktSeeds = await getAllBrktSeedsForDiv(null as any);
      expect(brktSeeds).toBe(null);
    })
  })
  
  describe('getAllBrktSeedsForBrkt()', () => { 

    it('should get all brktSeeds for a div', async () => {      
      const brktSeeds = await getAllBrktSeedsForBrkt(goldPinkOneBrktId2);
      expect(brktSeeds).toBeDefined();  
      if (brktSeeds === null) return;
      expect(Array.isArray(brktSeeds)).toBe(true);
      // 16 rows in prisma/seed.ts      
      expect(brktSeeds).toHaveLength(16)
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
    })
    it('should return 0 brktSeeds for a non-existent brkt', async () => {      
      const brktSeeds = await getAllBrktSeedsForBrkt(notFoundBrktId);
      expect(brktSeeds).toBeDefined();  
      if (brktSeeds === null) return;
      expect(Array.isArray(brktSeeds)).toBe(true);
      expect(brktSeeds).toHaveLength(0);
    })
    it('should return null if brkt id is invalid', async () => { 
      const brktSeeds = await getAllBrktSeedsForBrkt('test');
      expect(brktSeeds).toBe(null);
    })
    it('should return null if brkt id is valid, but not a brkt id', async () => { 
      const brktSeeds = await getAllBrktSeedsForBrkt(userId);
      expect(brktSeeds).toBe(null);
    })
    it('should return null if brkt id is undefined', async () => { 
      const brktSeeds = await getAllBrktSeedsForBrkt(undefined as any);
      expect(brktSeeds).toBe(null);
    })
    it('should return null if brkt id is null', async () => { 
      const brktSeeds = await getAllBrktSeedsForBrkt(null as any);
      expect(brktSeeds).toBe(null);
    })
  })  

  describe('getAllBrktSeedsForOneBrkt()', () => { 

    it('should get all brktSeeds for a div', async () => {      
      const brktSeeds = await getAllBrktSeedsForOneBrkt(oneBrktId);
      expect(brktSeeds).toBeDefined();  
      if (brktSeeds === null) return;
      expect(Array.isArray(brktSeeds)).toBe(true);
      // 8 rows in prisma/seed.ts      
      expect(brktSeeds).toHaveLength(8)            
      expect(brktSeeds[0].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[0].seed).toBe(0);
      expect(brktSeeds[1].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[1].seed).toBe(1);
      expect(brktSeeds[6].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[6].seed).toBe(6);
      expect(brktSeeds[7].one_brkt_id).toBe(goldPinkOneBrktId1);
      expect(brktSeeds[7].seed).toBe(7);
    })
    it('should return 0 brktSeeds for a non-existent oneBrktId', async () => {      
      const brktSeeds = await getAllBrktSeedsForOneBrkt(notFoundOneBrktId);
      expect(brktSeeds).toBeDefined();  
      if (brktSeeds === null) return;
      expect(Array.isArray(brktSeeds)).toBe(true);
      expect(brktSeeds).toHaveLength(0);
    })
    it('should return null if oneBrkt id is invalid', async () => { 
      const brktSeeds = await getAllBrktSeedsForOneBrkt('test');
      expect(brktSeeds).toBe(null);
    })
    it('should return null if oneBrkt id is valid, but not a oneBrkt id', async () => { 
      const brktSeeds = await getAllBrktSeedsForOneBrkt(userId);
      expect(brktSeeds).toBe(null);
    })
    it('should return null if oneBrkt id is undefined', async () => { 
      const brktSeeds = await getAllBrktSeedsForOneBrkt(undefined as any);
      expect(brktSeeds).toBe(null);
    })
    it('should return null if oneBrkt id is null', async () => { 
      const brktSeeds = await getAllBrktSeedsForOneBrkt(null as any);
      expect(brktSeeds).toBe(null);
    })
  })  

  describe('getBrktSeed()', () => { 
    const validOneBrktId = 'obk_103f595981364b77af163624528bdfda';    
    it('should get a brktSeed', async () => {      
      const brktSeed = await getBrktSeed(goldPinkOneBrktId2, 0);
      expect(brktSeed).toBeDefined();  
      if (brktSeed === null) return;                 
      expect(brktSeed.one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeed.seed).toBe(0);
      expect(brktSeed.player_id).toBe(playerId);
    })
    it('should get a brktSeed when seed is a valid integer sting', async () => {      
      const brktSeed = await getBrktSeed(goldPinkOneBrktId2, '0');
      expect(brktSeed).toBeDefined();  
      if (brktSeed === null) return;                 
      expect(brktSeed.one_brkt_id).toBe(goldPinkOneBrktId2);
      expect(brktSeed.seed).toBe(0);
      expect(brktSeed.player_id).toBe(playerId);
    })
    it('should return null for a non-existent oneBrktid-seed pair - oneBrktid', async () => {      
      const brktSeed = await getBrktSeed(notFoundOneBrktId, 0);
      expect(brktSeed).toBeNull();
    })
    it('should return null for a non-existent oneBrktid-seed pair - seed', async () => {      
      
      const brktSeed = await getBrktSeed(validOneBrktId, 7);
      expect(brktSeed).toBeNull();
    })
    it('should return null if oneBrktid-seed pair has invalid oneBrktid', async () => { 
      const brktSeed = await getBrktSeed('test', 0);
      expect(brktSeed).toBe(null);
    })
    it('should return null if oneBrktid-seed pair has valid oneBrktid, but not a oneBrktId', async () => { 
      const brktSeed = await getBrktSeed(userId, 0);
      expect(brktSeed).toBe(null);
    })
    it('should return null if oneBrktid-seed pair has undefined oneBrktid', async () => {
      const brktSeed = await getBrktSeed(undefined as any, 0);
      expect(brktSeed).toBe(null);
    });
    it('should return null if oneBrktid-seed pair has null oneBrktid', async () => {
      const brktSeed = await getBrktSeed(null as any, 0);
      expect(brktSeed).toBe(null);
    })
    it('should return null if oneBrktid-seed pair has invalid seed', async () => {
      const brktSeed = await getBrktSeed(validOneBrktId, 'test');
      expect(brktSeed).toBe(null);
    });
    it('should return null if oneBrktid-seed pair has valid seed, but not an integer', async () => { 
      const brktSeed = await getBrktSeed(validOneBrktId, 1.5);
      expect(brktSeed).toBe(null);
    })
    it('shoudl return null if oneBrktid-seed pair has seed too low', async () => { 
      const brktSeed = await getBrktSeed(validOneBrktId, -1);
      expect(brktSeed).toBe(null);
    })
    it('shoudl return null if oneBrktid-seed pair has seed too high', async () => { 
      const brktSeed = await getBrktSeed(validOneBrktId, defaultBrktPlayers);
      expect(brktSeed).toBe(null);
    })
    it('should return null if oneBrktid-seed pair has undefined seed', async () => {
      const brktSeed = await getBrktSeed(validOneBrktId, undefined as any);
      expect(brktSeed).toBe(null);
    });
    it('should return null if oneBrktid-seed pair has null seed', async () => {
      const brktSeed = await getBrktSeed(validOneBrktId, null as any);
      expect(brktSeed).toBe(null);
    })
  })  

  describe('postManyBrktSeeds()', () => { 
    let createdMany = false;
    beforeAll(async () => {
      // deletes all mock brktSeeds too
      await deleteOneBrkt(mockOneBrktsToPost[0].id);
      await postOneBrkt(mockOneBrktsToPost[0]);
    })
    beforeEach(() => {
      createdMany = false;
    })
    afterEach(async () => {
      if (createdMany) {
        await deleteMockBrktSeeds();
      }
    })
    afterAll(async () => {      
      // deletes all mock brktSeeds too
      await deleteOneBrkt(mockOneBrktsToPost[0].id);
    })
    
    it('should post many brktSeeds', async () => {
      const brktSeeds = await postManyBrktSeeds(mockBrktSeedsToPost);
      expect(brktSeeds).not.toBeNull();
      if (!brktSeeds) return;
      createdMany = true;
      expect(brktSeeds.length).toEqual(mockBrktSeedsToPost.length);
      for (let i = 0; i < mockBrktSeedsToPost.length; i++) {       
        // all brktSeeds should have the same one_brkt_id
        expect(brktSeeds[i].one_brkt_id).toEqual(mockBrktSeedsToPost[0].one_brkt_id);
        if (brktSeeds[i].seed === 0) {
          expect(brktSeeds[i].player_id).toEqual(mockBrktSeedsToPost[0].player_id);
        } else if (brktSeeds[i].seed === 1) {
          expect(brktSeeds[i].player_id).toEqual(mockBrktSeedsToPost[1].player_id);
        } else if (brktSeeds[i].seed === 2) {
          expect(brktSeeds[i].player_id).toEqual(mockBrktSeedsToPost[2].player_id);
        } else if (brktSeeds[i].seed === 3) {
          expect(brktSeeds[i].player_id).toEqual(mockBrktSeedsToPost[3].player_id);
        } else if (brktSeeds[i].seed === 4) {
          expect(brktSeeds[i].player_id).toEqual(mockBrktSeedsToPost[4].player_id);
        } else if (brktSeeds[i].seed === 5) {
          expect(brktSeeds[i].player_id).toEqual(mockBrktSeedsToPost[5].player_id);
        } else if (brktSeeds[i].seed === 6) {
          expect(brktSeeds[i].player_id).toEqual(mockBrktSeedsToPost[6].player_id);
        } else if (brktSeeds[i].seed === 7) {
          expect(brktSeeds[i].player_id).toEqual(mockBrktSeedsToPost[7].player_id);
        }
      }
    })
    // see test\app\api\brktSeeds\validate_brktSeeds.test.tsx
    // for full testing of sanitation and validation
    it('should NOT post many brktSeeds with sanitation, seed value sanitized to undefined', async () => { 
      const toSanitize = cloneDeep(mockBrktSeedsToPost);
      toSanitize[0].seed = Number.MAX_SAFE_INTEGER + 1;
      const brktSeeds = await postManyBrktSeeds(toSanitize);
      expect(brktSeeds).toBeNull();
    })
    it('should not post many brktSeeds with no data', async () => {
      const brktSeeds = await postManyBrktSeeds([]);
      expect(brktSeeds).not.toBeNull();
      expect(brktSeeds).toHaveLength(0);
    })
    it('should not post many brktSeeds with invalid data', async () => {
      const invalidBrktSeeds = cloneDeep(mockBrktSeedsToPost);
      invalidBrktSeeds[1].one_brkt_id = userId;
      const brktSeeds = await postManyBrktSeeds(invalidBrktSeeds);
      expect(brktSeeds).toBeNull();
    })
  })

  describe('deleteAllBrktSeedsForOneBrkt()', () => { 

    let deletedMany = false;
    beforeAll(async () => {
      // deletes all mock brktSeeds too
      await deleteOneBrkt(mockOneBrktsToPost[0].id);
      await postOneBrkt(mockOneBrktsToPost[0]);
      await postManyBrktSeeds(mockBrktSeedsToPost);
    })
    beforeEach(() => {
      deletedMany = false;
    })
    afterEach(async () => {
      if (deletedMany) {
        await postManyBrktSeeds(mockBrktSeedsToPost);
      }
    })
    afterAll(async () => {
      // deletes all mock brktSeeds too
      await deleteOneBrkt(mockOneBrktsToPost[0].id);
    })

    it('should delete all brktSeeds for oneBrkt', async () => {       
      const deletedCount = await deleteAllBrktSeedsForOneBrkt(mockBrktSeedsToPost[0].one_brkt_id);
      expect(deletedCount).toBe(mockBrktSeedsToPost.length);
      deletedMany = true;
    })
    it('should not delete all brktSeeds for oneBrkt when oneBrkt id is invalid', async () => { 
      const deletedCount = await deleteAllBrktSeedsForOneBrkt('test');
      expect(deletedCount).toBe(-1);
    })
    it('should not delete all brktSeeds for oneBrkt when oneBrkt id is valid, but not a oneBrkt id', async () => {
      const deletedCount = await deleteAllBrktSeedsForOneBrkt(userId);
      expect(deletedCount).toBe(-1);      
    })
    it('should not delete all brktSeeds for oneBrkt when oneBrkt id is not found', async () => { 
      const deletedCount = await deleteAllBrktSeedsForOneBrkt(notFoundOneBrktId);
      expect(deletedCount).toBe(0);
    })
    it('should not delete all brktSeeds for oneBrkt when oneBrkt id is null', async () => {
      const deletedCount = await deleteAllBrktSeedsForOneBrkt(null as any);
      expect(deletedCount).toBe(-1);      
    })
    it('should not delete all brktSeeds for oneBrkt when oneBrkt id is undefined', async () => {
      const deletedCount = await deleteAllBrktSeedsForOneBrkt(undefined as any);
      expect(deletedCount).toBe(-1);      
    })
  })

  describe('deleteAllBrktSeedsForBrkt()', () => { 

    let deletedMany = false;
    beforeAll(async () => {
      // deletes all mock brktSeeds too
      await deleteOneBrkt(mockOneBrktsToPost[0].id);
      await postOneBrkt(mockOneBrktsToPost[0]);
      await postManyBrktSeeds(mockBrktSeedsToPost);
    })
    beforeEach(() => {
      deletedMany = false;
    })
    afterEach(async () => {
      if (deletedMany) {
        await postManyBrktSeeds(mockBrktSeedsToPost);
      }
    })
    afterAll(async () => {
      // deletes all mock brktSeeds too
      await deleteOneBrkt(mockOneBrktsToPost[0].id);
    })

    it('should delete all brktSeeds for brkt', async () => {       
      const deletedCount = await deleteAllBrktSeedsForBrkt(brktIdForMock);
      expect(deletedCount).toBe(mockBrktSeedsToPost.length);
      deletedMany = true;
    })
    it('should not delete all brktSeeds for brkt when brkt id is invalid', async () => { 
      const deletedCount = await deleteAllBrktSeedsForBrkt('test');
      expect(deletedCount).toBe(-1);
    })
    it('should not delete all brktSeeds for brkt when brkt id is valid, but not a brkt id', async () => {
      const deletedCount = await deleteAllBrktSeedsForBrkt(userId);
      expect(deletedCount).toBe(-1);      
    })
    it('should not delete all brktSeeds for brkt when brkt id is not found', async () => { 
      const deletedCount = await deleteAllBrktSeedsForBrkt(notFoundBrktId);
      expect(deletedCount).toBe(0);
    })
    it('should not delete all brktSeeds for brkt when brkt id is null', async () => {
      const deletedCount = await deleteAllBrktSeedsForBrkt(null as any);
      expect(deletedCount).toBe(-1);      
    })
    it('should not delete all brktSeeds for brkt when brkt id is undefined', async () => {
      const deletedCount = await deleteAllBrktSeedsForBrkt(undefined as any);
      expect(deletedCount).toBe(-1);      
    })
  })

  describe('deleteAllOneBrktsForDiv()', () => { 

    let deletedMany = false;
    beforeAll(async () => {
      // deletes all mock brktSeeds too
      await deleteOneBrkt(mockOneBrktsToPost[0].id);
      await postOneBrkt(mockOneBrktsToPost[0]);
      await postManyBrktSeeds(mockBrktSeedsToPost);
    })
    beforeEach(() => {
      deletedMany = false;
    })
    afterEach(async () => {
      if (deletedMany) {
        await postManyBrktSeeds(mockBrktSeedsToPost);
      }
    })
    afterAll(async () => {
      // deletes all mock brktSeeds too
      await deleteOneBrkt(mockOneBrktsToPost[0].id);
    })

    it('should delete all brktSeeds for div', async () => { 
      const deletedCount = await deleteAllBrktSeedsForDiv(divIdForMock);
      deletedMany = true;      
      expect(deletedCount).toBe(mockBrktSeedsToPost.length);      
    })
    it('should not delete all brktSeeds for div when div id is invalid', async () => { 
      const deletedCount = await deleteAllBrktSeedsForDiv('test');
      expect(deletedCount).toBe(-1);
    })
    it('should not delete all brktSeeds for div when div id is valid, but not a tmnt id', async () => {
      const deletedCount = await deleteAllBrktSeedsForDiv(userId);
      expect(deletedCount).toBe(-1);      
    })
    it('should not delete all brktSeeds for div when div id is not found', async () => {
      const deletedCount = await deleteAllBrktSeedsForDiv(notFoundDivId);
      expect(deletedCount).toBe(0);
    });
    it('should not delete all brktSeeds for div when div id is null', async () => {
      const deletedCount = await deleteAllBrktSeedsForDiv(null as any);
      expect(deletedCount).toBe(-1);      
    })
    it('should not delete all brktSeeds for div when div id is undefined', async () => {
      const deletedCount = await deleteAllBrktSeedsForDiv(undefined as any);
      expect(deletedCount).toBe(-1);      
    })
  })

  describe('deleteAllBrktSeedsForSquad()', () => { 

    let deletedMany = false;
    beforeAll(async () => {
      // deletes all mock brktSeeds too
      await deleteOneBrkt(mockOneBrktsToPost[0].id);
      await postOneBrkt(mockOneBrktsToPost[0]);
      await postManyBrktSeeds(mockBrktSeedsToPost);
    })
    beforeEach(() => {
      deletedMany = false;
    })
    afterEach(async () => {
      if (deletedMany) {
        await postManyBrktSeeds(mockBrktSeedsToPost);
      }
    })
    afterAll(async () => {
      // deletes all mock brktSeeds too
      await deleteOneBrkt(mockOneBrktsToPost[0].id);
    })

    it('should delete all brktSeeds for squad', async () => { 
      const deletedCount = await deleteAllBrktSeedsForSquad(squadIdForMock);
      deletedMany = true;      
      expect(deletedCount).toBe(mockBrktSeedsToPost.length);      
    })
    it('should not delete all brktSeeds for squad when squad id is invalid', async () => { 
      const deletedCount = await deleteAllBrktSeedsForSquad('test');
      expect(deletedCount).toBe(-1);
    })
    it('should not delete all brktSeeds for squad when squad id is valid, but not a squad id', async () => {
      const deletedCount = await deleteAllBrktSeedsForSquad(userId);
      expect(deletedCount).toBe(-1);      
    })
    it('should not delete all brktSeeds for squad when squad id is not found', async () => {
      const deletedCount = await deleteAllBrktSeedsForSquad(notFoundSquadId);
      expect(deletedCount).toBe(0);
    });
    it('should not delete all brktSeeds for squad when squad id is null', async () => {
      const deletedCount = await deleteAllBrktSeedsForSquad(null as any);
      expect(deletedCount).toBe(-1);      
    })
    it('should not delete all brktSeeds for squad when squad id is undefined', async () => {
      const deletedCount = await deleteAllBrktSeedsForSquad(undefined as any);
      expect(deletedCount).toBe(-1);
    });
  })

  describe('deleteAllBrktSeedsForTmnt()', () => { 

    let deletedMany = false;
    beforeAll(async () => {
      // deletes all mock brktSeeds too
      await deleteOneBrkt(mockOneBrktsToPost[0].id);
      await postOneBrkt(mockOneBrktsToPost[0]);
      await postManyBrktSeeds(mockBrktSeedsToPost);
    })
    beforeEach(() => {
      deletedMany = false;
    })
    afterEach(async () => {
      if (deletedMany) {
        await postManyBrktSeeds(mockBrktSeedsToPost);
      }
    })
    afterAll(async () => {
      // deletes all mock brktSeeds too
      await deleteOneBrkt(mockOneBrktsToPost[0].id);
    })

    it('should delete all brktSeeds for tmnt', async () => { 
      const deletedCount = await deleteAllBrktSeedsForTmnt(tmntIdForMock);
      deletedMany = true;      
      expect(deletedCount).toBe(mockBrktSeedsToPost.length);      
    })
    it('should not delete all brktSeeds for tmnt when tmnt id is invalid', async () => { 
      const deletedCount = await deleteAllBrktSeedsForTmnt('test');
      expect(deletedCount).toBe(-1);
    })
    it('should not delete all brktSeeds for tmnt when tmnt id is valid, but not a tmnt id', async () => {
      const deletedCount = await deleteAllBrktSeedsForTmnt(userId);
      expect(deletedCount).toBe(-1);      
    })
    it('should not delete all brktSeeds for tmnt when tmnt id is not found', async () => {
      const deletedCount = await deleteAllBrktSeedsForTmnt(notFoundTmntId);
      expect(deletedCount).toBe(0);
    });
    it('should not delete all brktSeeds for tmnt when tmnt id is null', async () => {
      const deletedCount = await deleteAllBrktSeedsForTmnt(null as any);
      expect(deletedCount).toBe(-1);      
    })
    it('should not delete all brktSeeds for tmnt when tmnt id is undefined', async () => {
      const deletedCount = await deleteAllBrktSeedsForTmnt(undefined as any);
      expect(deletedCount).toBe(-1);
    });
  })

})