import axios, { AxiosError } from "axios";
import { baseBrktEntriesApi } from "@/lib/api/apiPaths";
import { testBaseBrktEntriesApi } from "../../../testApi";
import { initBrktEntry } from "@/lib/db/initVals";
import type { brktEntryType } from "@/lib/types/types";
import { cloneDeep } from "lodash";
import { compareAsc } from "date-fns";
import { maxDate, minDate } from "@/lib/validation/constants";
import { toValidDateOrNull } from "@/lib/dateTools";

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
const url = process.env.NODE_ENV === "test" && testBaseBrktEntriesApi
  ? testBaseBrktEntriesApi
  : baseBrktEntriesApi;  

const oneBrktEntryUrl = url + "/brktEntry/";
const brktUrl = url + "/brkt/";
const divUrl = url + "/div/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/"; 

describe("BrktEntries - API's: /api/brktEntries", () => { 

  const testBrktEntry = {
    ...initBrktEntry,
    id: "ben_bc4c581d7b1c4fc99dbdbd46f4f7210a",
    brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    num_brackets: 8,
    num_refunds: 2,
    fee: '40',
    time_stamp: new Date("2024-01-01").getTime(),
  }
  const noRefundsBrktEntry = {
    ...initBrktEntry,
    id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
    brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
    player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
    num_brackets: 8,          
    fee: '40',
    time_stamp: new Date("2024-01-01").getTime(),
  }

  const tmntIdForBrktEntries = 'tmt_fd99387c33d9c78aba290286576ddce5';
  const squadIdForBrktEntries = 'sqd_7116ce5f80164830830a7157eb093396';
  const divIdForBrktEntries = 'div_f30aea2c534f4cfe87f4315531cef8ef';
  const brktIdForBrktEntries = 'brk_5109b54c2cc44ff9a3721de42c80c8c1';

  const notFoundId = "ben_01234567890123456789012345678901";
  const notFoundBrktId = "brk_01234567890123456789012345678901";
  const notFoundDivId = "div_01234567890123456789012345678901";  
  const notFoundSquadId = "sqd_01234567890123456789012345678901";
  const notFoundTmntId = "tmt_01234567890123456789012345678901";
  const userId = "usr_01234567890123456789012345678901";

  const brkt1Id = 'brk_5109b54c2cc44ff9a3721de42c80c8c1';
  const brkt2Id = 'brk_6ede2512c7d4409ca7b055505990a499';
  const player1Id = 'ply_88be0472be3d476ea1caa99dd05953fa';

  const deletePostedBrktEntry = async () => {
    const response = await axios.get(url);
    const brktEntries = response.data.brktEntries;
    const toDel = brktEntries.find((b: brktEntryType) => b.num_brackets === 17);
    if (toDel) {
      try {
        await axios.delete(oneBrktEntryUrl + toDel.id, {
          withCredentials: true
        });
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }
  }

  describe('GET', () => { 

    beforeAll(async () => {
      await deletePostedBrktEntry();
    })

    it('should get all brktEntries', async () => {
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      // 53 rows currently in prisma/seed.ts
      expect(response.data.brktEntries).toHaveLength(53);
    })
  })

  describe('GET one brktEntry API: /api/brktEntries/brktEntry/:id', () => { 

    it('should get one brktEntry by ID when brkt entry has a refund', async () => {
      const urlToUse = oneBrktEntryUrl + testBrktEntry.id;
      const response = await axios.get(urlToUse);
      expect(response.status).toBe(200);        
      const brktEntry = response.data.brktEntry;
      expect(brktEntry.id).toEqual(testBrktEntry.id);        
      expect(brktEntry.brkt_id).toEqual(testBrktEntry.brkt_id);
      expect(brktEntry.player_id).toEqual(testBrktEntry.player_id);
      expect(brktEntry.num_brackets).toEqual(testBrktEntry.num_brackets);
      expect(brktEntry.brkt_refunds.num_refunds).toEqual(testBrktEntry.num_refunds)
      expect(Number(brktEntry.brkt.fee) * brktEntry.num_brackets).toEqual(Number(testBrktEntry.fee));
    })
    it('should get one brktEntry by ID when brkt entry has NO refund', async () => {
      const urlToUse = oneBrktEntryUrl + noRefundsBrktEntry.id;
      const response = await axios.get(urlToUse);
      expect(response.status).toBe(200);        
      const brktEntry = response.data.brktEntry;
      expect(brktEntry.id).toEqual(noRefundsBrktEntry.id);        
      expect(brktEntry.brkt_id).toEqual(noRefundsBrktEntry.brkt_id);
      expect(brktEntry.player_id).toEqual(noRefundsBrktEntry.player_id);
      expect(brktEntry.num_brackets).toEqual(noRefundsBrktEntry.num_brackets);
      expect(brktEntry.brkt_refunds).toBeNull();
      expect(Number(brktEntry.brkt.fee) * brktEntry.num_brackets).toEqual(Number(noRefundsBrktEntry.fee));
    })
    it('should not get one brktEntry by ID when id is invalid', async () => {
      try {
        const response = await axios.get(oneBrktEntryUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get one brktEntry by ID when id is valid, but not a brktEntry id', async () => {
      try {
        const response = await axios.get(oneBrktEntryUrl + userId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get one brktEntry by ID when id is not found', async () => {
      try {
        const response = await axios.get(oneBrktEntryUrl + notFoundId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
  })

  describe('GET all brktEntries for one div API: /api/brktEntries/div/:divId', () => { 

    beforeAll(async () => {
      await deletePostedBrktEntry();
    })

    it('should get all brktEntries for one div', async () => { 
      const response = await axios.get(divUrl + divIdForBrktEntries);
      expect(response.status).toBe(200);        
      const brktEntries = response.data.brktEntries;
      expect(brktEntries).toHaveLength(4); // 4 brktEntries for div in prisma/seeds.ts
      for (let i = 0; i < brktEntries.length; i++) {        
        expect(brktEntries[i].brkt_id === brkt1Id || brktEntries[i].brkt_id === brkt2Id).toBeTruthy();
        expect(Number(brktEntries[i].brkt.fee)).toBeGreaterThan(0);
        if (brktEntries[i].player_id === player1Id) {
          expect(brktEntries[i].brkt_refunds.num_refunds).toBe(2);
        } else { 
          expect(brktEntries[i].brkt_refunds).toBeNull;
        }
        expect(toValidDateOrNull(brktEntries[i].time_stamp)).not.toBeNull();
      }      
    })
    it('should not get all brktEntries for one div when divId is invalid', async () => {
      try {
        const response = await axios.get(divUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get all brktEntries for one div when divId is valid, but not a div id', async () => {
      try {
        const response = await axios.get(divUrl + userId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get all brktEntries for one div when divId is not found', async () => {
      const response = await axios.get(divUrl + notFoundDivId);
      expect(response.status).toBe(200);
      const brktEntries = response.data.brktEntries;
      expect(brktEntries).toHaveLength(0);
    })    
  })

  describe('GET all brktEntries for one squad API: /api/brktEntries/squad/:squadId', () => { 

    beforeAll(async () => {
      await deletePostedBrktEntry();
    })

    it('should get all brktEntries for one squad', async () => { 
      const response = await axios.get(squadUrl + squadIdForBrktEntries);
      expect(response.status).toBe(200);
      const brktEntries = response.data.brktEntries;
      expect(brktEntries).toHaveLength(4); // 4 brktEntries for squad in prisma/seeds.ts
      for (let i = 0; i < brktEntries.length; i++) {
        expect(brktEntries[i].brkt_id === brkt1Id || brktEntries[i].brkt_id === brkt2Id).toBeTruthy();
        expect(Number(brktEntries[i].brkt.fee)).toBeGreaterThan(0);
        if (brktEntries[i].player_id === player1Id) {
          expect(brktEntries[i].brkt_refunds.num_refunds).toBe(2);
        } else { 
          expect(brktEntries[i].num_refunds).toBeNull;
        }
        expect(toValidDateOrNull(brktEntries[i].time_stamp)).not.toBeNull();
      }      
    })
    it('should not get all brktEntries for one squad when squadId is invalid', async () => {
      try {
        const response = await axios.get(squadUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get all brktEntries for one squad when squadId is valid, but not a div id', async () => {
      try {
        const response = await axios.get(squadUrl + userId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get all brktEntries for one squad when squadId is not found', async () => {
      const response = await axios.get(squadUrl + notFoundSquadId);
      expect(response.status).toBe(200);
      const brktEntries = response.data.brktEntries;
      expect(brktEntries).toHaveLength(0);
    })    
  })

  describe('GET all brktEntries for one brkt API: /api/brktEntries/brkt/:brktId', () => { 

    beforeAll(async () => {
      await deletePostedBrktEntry();
    })

    it('should get all brktEntries for one brkt', async () => { 
      const response = await axios.get(brktUrl + brktIdForBrktEntries);
      expect(response.status).toBe(200);        
      const brktEntries = response.data.brktEntries;
      expect(brktEntries).toHaveLength(2); // 2 brktEntries for brkt in prisma/seeds.ts
      for (let i = 0; i < brktEntries.length; i++) {
        expect(brktEntries[i].brkt_id).toBe(brktIdForBrktEntries);
        expect(Number(brktEntries[i].brkt.fee)).toBeGreaterThan(0);
        if (brktEntries[i].player_id === player1Id) {
          expect(brktEntries[i].brkt_refunds.num_refunds).toBe(2);
        } else { 
          expect(brktEntries[i].num_refunds).toBeNull;
        }
        expect(toValidDateOrNull(brktEntries[i].time_stamp)).not.toBeNull();
      }      
    })
    it('should not get all brktEntries for one brkt when brktId is invalid', async () => {
      try {
        const response = await axios.get(brktUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get all brktEntries for one brkt when brktId is valid, but not a div id', async () => {
      try {
        const response = await axios.get(brktUrl + userId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get all brktEntries for one brkt when brktId is not found', async () => {
      const response = await axios.get(brktUrl + notFoundBrktId);
      expect(response.status).toBe(200);
      const brktEntries = response.data.brktEntries;
      expect(brktEntries).toHaveLength(0);
    })        
  })

  describe('GET all brktEntries for one tmnt API: /api/brktEntries/tmnt/:tmntId', () => { 

    beforeAll(async () => {
      await deletePostedBrktEntry();
    })

    it('should get all brktEntries for one tmnt', async () => { 
      const response = await axios.get(tmntUrl + tmntIdForBrktEntries);
      expect(response.status).toBe(200);        
      const brktEntries = response.data.brktEntries;
      expect(brktEntries).toHaveLength(4); // 4 brktEntries for tmnt in prisma/seeds.ts
      for (let i = 0; i < brktEntries.length; i++) {
        expect(brktEntries[i].brkt_id === brkt1Id || brktEntries[i].brkt_id === brkt2Id).toBeTruthy();
        expect(Number(brktEntries[i].brkt.fee)).toBeGreaterThan(0);
        if (brktEntries[i].player_id === player1Id) {
          expect(brktEntries[i].brkt_refunds.num_refunds).toBe(2);
        } else { 
          expect(brktEntries[i].num_refunds).toBeNull;
        }
        expect(toValidDateOrNull(brktEntries[i].time_stamp)).not.toBeNull();
      }      
    })
    it('should not get all brktEntries for one tmnt when tmntId is invalid', async () => {
      try {
        const response = await axios.get(tmntUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get all brktEntries for one tmnt when tmntId is valid, but not a div id', async () => {
      try {
        const response = await axios.get(tmntUrl + userId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get all brktEntries for one tmnt when tmntId is not found', async () => {
      const response = await axios.get(tmntUrl + notFoundTmntId);
      expect(response.status).toBe(200);
      const brktEntries = response.data.brktEntries;
      expect(brktEntries).toHaveLength(0);
    })    
  })

  describe('POST one brktEntry API: /api/brktEntries', () => { 
    
    const brktEntryToPost: brktEntryType = {
      ...initBrktEntry,  
      id: 'ben_0000e3ceb07541bd94bf9ddec146b5ef',
      brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
      player_id: 'ply_91c5aa1c14644e03b6735abd1480ee32',
      num_brackets: 17,      
      fee: '83'
    }

    let createdBrktEntry = false;

    beforeAll(async () => {
      await deletePostedBrktEntry();
    })

    beforeEach(() => {
      createdBrktEntry = false;
    })

    afterEach(async () => {
      if (createdBrktEntry) {
        await deletePostedBrktEntry();
      }      
    })

    it('should post one brktEntry with NO refunds', async () => {
      const brktEntryJSON = JSON.stringify(brktEntryToPost);
      const response = await axios.post(url, brktEntryJSON, {
        withCredentials: true
      });
      expect(response.status).toBe(201);
      createdBrktEntry = true;
      const brktEntry = response.data.brktEntry;
      expect(brktEntry.id).toEqual(brktEntryToPost.id);      
      expect(brktEntry.brkt_id).toEqual(brktEntryToPost.brkt_id);
      expect(brktEntry.player_id).toEqual(brktEntryToPost.player_id);
      expect(brktEntry.num_brackets).toEqual(brktEntryToPost.num_brackets);
      expect(brktEntry.num_refunds).toBeUndefined();      
      // expect(Number(brktEntry.fee)).toEqual(Number(brktEntryToPost.fee));
      expect(brktEntry.time_stamp).not.toBeNull();
      expect(compareAsc(brktEntry.time_stamp, brktEntryToPost.time_stamp)).toBe(0);
    })
    it('should post one brktEntry with refunds', async () => {
      const refundBrkt = cloneDeep(brktEntryToPost);
      refundBrkt.id = 'ben_0000f3ceb07541bd94bf9ddec146b5ef',
      refundBrkt.brkt_id = 'brk_37345eb6049946ad83feb9fdbb43a307',
      refundBrkt.num_refunds = 3;
      const brktEntryJSON = JSON.stringify(refundBrkt);
      const response = await axios.post(url, brktEntryJSON, {
        withCredentials: true
      });
      expect(response.status).toBe(201);
      createdBrktEntry = true;
      const brktEntry = response.data.brktEntry;
      expect(brktEntry.id).toEqual(refundBrkt.id);      
      expect(brktEntry.brkt_id).toEqual(refundBrkt.brkt_id);
      expect(brktEntry.player_id).toEqual(refundBrkt.player_id);
      expect(brktEntry.num_brackets).toEqual(refundBrkt.num_brackets);
      expect(brktEntry.brkt_refunds.num_refunds).toEqual(refundBrkt.num_refunds);
      // expect(Number(brktEntry.fee)).toEqual(Number(brktEntryToPost.fee));
      expect(brktEntry.time_stamp).not.toBeNull();
      expect(compareAsc(brktEntry.time_stamp, brktEntryToPost.time_stamp)).toBe(0);
    })
    it('should NOT post a sanitized brktEntry (saninted num_brackets = 0)', async () => { 
      const toSanitize = {
        ...brktEntryToPost,
        num_brackets: 1234567890
      }
      const toSanitizeJSON = JSON.stringify(toSanitize);
      try {
      const response = await axios.post(url, toSanitizeJSON, {
        withCredentials: true
      });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
    it('should NOT post a sanitized brktEntry (saninted fee = "")', async () => { 
      const toSanitize = {
        ...brktEntryToPost,
        fee: '   83  ',        
      }
      const toSanitizeJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios.post(url, toSanitizeJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
    it('should not post one brktEntry when id is blank', async () => {
      const invalidBrktEntry = {
        ...brktEntryToPost,
        id: ''
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
    it('should not post one brktEntry when brkt_id is blank', async () => {
      const invalidBrktEntry = {
        ...brktEntryToPost,
        brkt_id: ''
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not post one brktEntry when player_id is blank', async () => {
      const invalidBrktEntry = {
        ...brktEntryToPost,
        player_id: ''
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not post one brktEntry when num_brackets is null', async () => {
      const invalidBrktEntry = {
        ...brktEntryToPost,
        num_brackets: null as any
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })    
    it('should not post one brktEntry when fee is blank', async () => {
      const invalidBrktEntry = {
        ...brktEntryToPost,
        fee: ''
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
    it('should not post one brktEntry when id is invalid', async () => {
      const invalidBrktEntry = {
        ...brktEntryToPost,
        id: 'test'
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not post one brktEntry when id is valid, but not a brktEntry id', async () => {
      const invalidBrktEntry = {
        ...brktEntryToPost,
        id: userId
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not post one brktEntry when brkt_id is invalid', async () => {
      const invalidBrktEntry = {
        ...brktEntryToPost,
        brkt_id: 'test'
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not post one brktEntry when brkt_id is valid, bit not a div id', async () => {
      const invalidBrktEntry = {
        ...brktEntryToPost,
        brkt_id: userId
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not post one brktEntry when player_id is invalid', async () => {
      const invalidBrktEntry = {
        ...brktEntryToPost,
        player_id: 'test'
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post one brktEntry when player_id is valid, but not a player id', async () => {
      const invalidBrktEntry = {
        ...brktEntryToPost,
        player_id: userId
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post one brktEntry when num_brackets is too low', async () => {
      const invalidBrktEntry = {
        ...brktEntryToPost,
        num_brackets: -1
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post one brktEntry when num_brackets is too high', async () => {
      const invalidBrktEntry = {
        ...brktEntryToPost,
        num_brackets: 1234567890
      } 
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      } 
    })
    it('should not post one brktEntry when num_refunds is too low', async () => {
      const invalidBrktEntry = {
        ...brktEntryToPost,
        num_refunds: -1
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post one brktEntry when num_refunds is too high', async () => {
      const invalidBrktEntry = {
        ...brktEntryToPost,
        num_refunds: 1234567890
      } 
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      } 
    })
    it('should not post one brktEntry when num_refunds > num_brackets', async () => {
      const invalidBrktEntry = {
        ...brktEntryToPost,
        num_refunds: 123
      } 
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      } 
    })
    it('should not post one brktEntry when fee is too low', async () => {
      const invalidBrktEntry = {
        ...brktEntryToPost,
        fee: '-1'
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post one brktEntry when fee is too high', async () => {
      const invalidBrktEntry = {
        ...brktEntryToPost,
        fee: '1234567890'
      } 
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      } 
    })
    it('should not post one brktEntry when time_stamp is invalid', async () => {
      createdBrktEntry = true;
      const invalidBrktEntry = {
        ...brktEntryToPost,
        time_stamp: 'abc'
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);         
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }       
    })
    it('should not post one brktEntry when time_stamp is too low', async () => {
      const invalidBrktEntry = {
        ...brktEntryToPost,
        time_stamp: minDate.getTime() - 1
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post one brktEntry when time_stamp is too high', async () => {
      const invalidBrktEntry = {
        ...brktEntryToPost,
        time_stamp: maxDate.getTime() + 1
      } 
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      } 
    })
  })

  describe('PUT one brktEntry API: /api/brktEntries/brktEntry/:id', () => { 

    const putBrktEntry = {
      ...testBrktEntry,      
      brkt_id: 'brk_3e6bf51cc1ca4748ad5e8abab88277e0',
      player_id: 'ply_8b0fd8bbd9e34d34a7fa90b4111c6e40',
      num_brackets: 7,
      fee: '83',
      time_stamp: 1739259269537
    }

    const resetBrktEntry = async () => {
      // make sure test player is reset in database
      const brktEntryJSON = JSON.stringify(testBrktEntry);
      await axios.put(oneBrktEntryUrl + testBrktEntry.id, brktEntryJSON, {
        withCredentials: true
      })      
    }

    let didPut = false;

    beforeAll(async () => {
      await resetBrktEntry()
    })

    beforeEach(() => {
      didPut = false;
    })

    afterEach(async () => {
      if (didPut) {        
        await resetBrktEntry()
      }      
    })

    it('should update a brktEntry by ID, no changes to num_refunds', async () => {
      const brktEntryJSON = JSON.stringify(putBrktEntry);
      const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, brktEntryJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPut = true;
      const puttedBrktEntry = response.data.brktEntry;
      // did not update squad_id      
      expect(puttedBrktEntry.brkt_id).toBe(putBrktEntry.brkt_id);
      expect(puttedBrktEntry.player_id).toBe(putBrktEntry.player_id);
      expect(puttedBrktEntry.num_brackets).toBe(putBrktEntry.num_brackets);
      expect(puttedBrktEntry.num_refunds).toBe(putBrktEntry.num_refunds);
      expect(compareAsc(puttedBrktEntry.time_stamp, putBrktEntry.time_stamp)).toBe(0);
    })
    it('should update a brktEntry by ID, with changes to num_refunds', async () => {
      const putWithNumRefunds = cloneDeep(putBrktEntry);
      putWithNumRefunds.num_refunds = 1;
      const brktEntryJSON = JSON.stringify(putWithNumRefunds);
      const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, brktEntryJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPut = true;
      const puttedBrktEntry = response.data.brktEntry;
      // did not update squad_id      
      expect(puttedBrktEntry.brkt_id).toBe(putWithNumRefunds.brkt_id);
      expect(puttedBrktEntry.player_id).toBe(putWithNumRefunds.player_id);
      expect(puttedBrktEntry.num_brackets).toBe(putWithNumRefunds.num_brackets);
      expect(puttedBrktEntry.num_refunds).toBe(putWithNumRefunds.num_refunds);
      expect(compareAsc(puttedBrktEntry.time_stamp, putWithNumRefunds.time_stamp)).toBe(0);
    })
    it('should update a brktEntry by ID, with deleting num_refunds, then update and add num_refunds', async () => {
      const putWithNoNumRefunds = cloneDeep(putBrktEntry);
      putWithNoNumRefunds.num_refunds = 0;
      const brktEntryJSON = JSON.stringify(putWithNoNumRefunds);
      const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, brktEntryJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPut = true;
      const puttedBrktEntry = response.data.brktEntry;
      // did not update squad_id      
      expect(puttedBrktEntry.brkt_id).toBe(putWithNoNumRefunds.brkt_id);
      expect(puttedBrktEntry.player_id).toBe(putWithNoNumRefunds.player_id);
      expect(puttedBrktEntry.num_brackets).toBe(putWithNoNumRefunds.num_brackets);
      expect(puttedBrktEntry.num_refunds).toBeUndefined();
      expect(compareAsc(puttedBrktEntry.time_stamp, putWithNoNumRefunds.time_stamp)).toBe(0);

      const putWithAddNumRefunds = cloneDeep(putBrktEntry);
      putWithAddNumRefunds.num_refunds = 2;
      const brktEntryJSON2 = JSON.stringify(putWithAddNumRefunds);
      const response2 = await axios.put(oneBrktEntryUrl + testBrktEntry.id, brktEntryJSON2, {
        withCredentials: true
      })
      expect(response2.status).toBe(200);
      didPut = true;
      const puttedBrktEntry2 = response2.data.brktEntry;
      // did not update squad_id      
      expect(puttedBrktEntry2.brkt_id).toBe(putWithAddNumRefunds.brkt_id);
      expect(puttedBrktEntry2.player_id).toBe(putWithAddNumRefunds.player_id);
      expect(puttedBrktEntry2.num_brackets).toBe(putWithAddNumRefunds.num_brackets);
      expect(puttedBrktEntry2.num_refunds).toBe(putWithAddNumRefunds.num_refunds);
      expect(compareAsc(puttedBrktEntry2.time_stamp, putWithAddNumRefunds.time_stamp)).toBe(0);
    })
    it('should update a sanitized brktEntry by ID', async () => { 
      const toSanitize = {
        ...putBrktEntry,
        fee: '83.000',
      }
      const toSanitizeJSON = JSON.stringify(toSanitize);
      const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, toSanitizeJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPut = true;
      const puttedBrktEntry = response.data.brktEntry;      
      expect(puttedBrktEntry.brkt_id).toBe(putBrktEntry.brkt_id);
      expect(puttedBrktEntry.player_id).toBe(putBrktEntry.player_id);
      expect(compareAsc(puttedBrktEntry.time_stamp, putBrktEntry.time_stamp)).toBe(0);
    })
    it('should not update a brktEntry by ID when brkt_id is blank', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        brkt_id: ''
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not update a brktEntry by ID when player_id is blank', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        player_id: ''
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not update a brktEntry by ID when num_brackets is null', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        num_brackets: null as any,
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not update a brktEntry by ID when num_brackets is too low', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        num_brackets: -1
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
    it('should not update a brktEntry by ID when num_brackets is too high', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        num_brackets: 1234567890
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not update a brktEntry by ID when num_brackets is not a number', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        num_brackets: 'not a number' as any
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
    it('should not update a brktEntry by ID when num_brackets is not an integer', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        num_brackets: 1.2
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
    it('should not update a brktEntry by ID when fee is blank', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        fee: ''
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not update a brktEntry by ID when fee is too low', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        fee: '-1'
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
    it('should not update a brktEntry by ID when fee is too high', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        fee: '1234567890'
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not update a brktEntry by ID when fee is not a number', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        fee: 'not a number'
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
    it('should not update a brktEntry by ID when time_stamp is too low', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        time_stamp: -8.65e15 - 1
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
    it('should not update a brktEntry by ID when time_stamp is too high', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        time_stamp: 8.65e15 + 1
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not update a brktEntry by ID when time_stamp is invalid', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        time_stamp: 'abc'
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
    it('should not update a brktEntry by ID when time_stamp is null', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        time_stamp: null as any,
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not update a brktEntry by ID when time_stamp is null', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        time_stamp: null as any,
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not update a brktEntry by ID when time_stamp is too low', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        time_stamp: -8.65e15 - 1
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
    it('should not update a brktEntry by ID when time_stamp is too high', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        time_stamp: 8.65e15 + 1
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not update a brktEntry by ID when time_stamp is invalid', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        time_stamp: 'abc' as any
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.put(oneBrktEntryUrl + testBrktEntry.id, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
  })

  describe('PATCH one brktEntry API: /api/brktEntries/brktEntry/:id', () => { 

    const toPatch = {
      id: testBrktEntry.id,
    }
    
    const doResetBrktEntry = async () => {
      try {
        const brktEntryJSON = JSON.stringify(testBrktEntry);
        await axios.put(oneBrktEntryUrl + testBrktEntry.id, brktEntryJSON, {
          withCredentials: true
        });
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }

    let didPatch = false;

    beforeAll(async () => {
      await doResetBrktEntry()
    })

    beforeEach(() => {
      didPatch = false;
    })

    afterEach(async () => {
      if (didPatch) {
        await doResetBrktEntry();
      }
    })

    it('should patch brkt_id in a brktEntry by ID', async () => { 
      const toPatchedBrktId = 'brk_3e6bf51cc1ca4748ad5e8abab88277e0'
      const patchBrktEntry = {
        ...toPatch,
        brkt_id: toPatchedBrktId,
      }
      const brktEntryJSON = JSON.stringify(patchBrktEntry);
      const response = await axios.patch(oneBrktEntryUrl + toPatch.id, brktEntryJSON, {
        withCredentials: true,
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedBrktEntry = response.data.brktEntry;
      expect(patchedBrktEntry.id).toBe(toPatch.id);
      expect(patchedBrktEntry.brkt_id).toBe(toPatchedBrktId);      
    })
    it('should patch player_id in a brktEntry by ID', async () => { 
      const toPatchedPlayerId = 'ply_a01758cff1cc4bab9d9133e661bd49b0'
      const patchBrktEntry = {
        ...toPatch,
        player_id: toPatchedPlayerId,
      }
      const brktEntryJSON = JSON.stringify(patchBrktEntry);
      const response = await axios.patch(oneBrktEntryUrl + toPatch.id, brktEntryJSON, {
        withCredentials: true,
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedBrktEntry = response.data.brktEntry;
      expect(patchedBrktEntry.id).toBe(toPatch.id);
      expect(patchedBrktEntry.player_id).toBe(toPatchedPlayerId);      
    })      
    it('should patch num_brackets in a brktEntry by ID', async () => { 
      const toPatchNumBrackets = 7
      const patchBrktEntry = {
        ...toPatch,
        num_brackets: toPatchNumBrackets,
      }
      const brktEntryJSON = JSON.stringify(patchBrktEntry);
      const response = await axios.patch(oneBrktEntryUrl + toPatch.id, brktEntryJSON, {
        withCredentials: true,
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedBrktEntry = response.data.brktEntry;
      expect(patchedBrktEntry.id).toBe(toPatch.id);
      expect(patchedBrktEntry.num_brackets).toBe(toPatchNumBrackets);      
    })
    it('should patch num_refunds - update, in a brktEntry by ID', async () => { 
      const toPatchNumRefunds = 1
      const patchBrktEntry = {
        ...toPatch,
        num_refunds: toPatchNumRefunds,
      }
      const brktEntryJSON = JSON.stringify(patchBrktEntry);
      const response = await axios.patch(oneBrktEntryUrl + toPatch.id, brktEntryJSON, {
        withCredentials: true,
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedBrktEntry = response.data.brktEntry;
      expect(patchedBrktEntry.id).toBe(toPatch.id);
      expect(patchedBrktEntry.num_refunds).toBe(toPatchNumRefunds);
    })
    it('should patch num_refunds - delete, in a brktEntry by ID', async () => { 
      const toPatchNumRefunds = 0
      const patchBrktEntry = {
        ...toPatch,
        num_refunds: toPatchNumRefunds,
      }
      const brktEntryJSON = JSON.stringify(patchBrktEntry);
      const response = await axios.patch(oneBrktEntryUrl + toPatch.id, brktEntryJSON, {
        withCredentials: true,
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedBrktEntry = response.data.brktEntry;
      expect(patchedBrktEntry.id).toBe(toPatch.id);
      expect(patchedBrktEntry.num_refunds).toBeUndefined();
    })
    it('should patch num_refunds - delete, in a brktEntry by ID', async () => { 
      const toPatchNumRefunds = 1
      const patchBrktEntry = {        
        id: noRefundsBrktEntry.id,
        num_refunds: toPatchNumRefunds,
      }
      const brktEntryJSON = JSON.stringify(patchBrktEntry);
      const response = await axios.patch(oneBrktEntryUrl + toPatch.id, brktEntryJSON, {
        withCredentials: true,
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedBrktEntry = response.data.brktEntry;
      expect(patchedBrktEntry.id).toBe(toPatch.id);
      expect(patchedBrktEntry.num_refunds).toBe(toPatchNumRefunds);
    })
    it('should patch time_stamp in a brktEntry by ID', async () => {       
      const patchBrktEntry = {
        ...toPatch,
        time_stamp: 1739259269537
      }
      const brktEntryJSON = JSON.stringify(patchBrktEntry);
      const response = await axios.patch(oneBrktEntryUrl + toPatch.id, brktEntryJSON, {
        withCredentials: true,
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedBrktEntry = response.data.brktEntry;
      expect(patchedBrktEntry.id).toBe(toPatch.id);
      expect(compareAsc(patchedBrktEntry.time_stamp, patchBrktEntry.time_stamp)).toBe(0);
    })
    it('should not patch a brktEntry by ID when brkt_id is blank', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        brkt_id: ''
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.patch(oneBrktEntryUrl + toPatch.id, invalidJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })  
    it('should not patch a brktEntry by ID when brkt_id is valid, but not a div id', async () => { 
      const invalidBrktEntry = {
        ...toPatch,
        brkt_id: userId
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.patch(oneBrktEntryUrl + toPatch.id, invalidJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
    it('should not patch a brktEntry by ID when brkt_id is invalid', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        brkt_id: 'test'
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.patch(oneBrktEntryUrl + toPatch.id, invalidJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
    it('should not patch a brktEntry by ID when brkt_id is valid, but not a div id', async () => { 
      const invalidBrktEntry = {
        ...toPatch,
        brkt_id: userId
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.patch(oneBrktEntryUrl + toPatch.id, invalidJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not patch a brktEntry by ID when player_id is blank', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        player_id: ''
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.patch(oneBrktEntryUrl + toPatch.id, invalidJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }       
    })
    it('should not patch a brktEntry by ID when player_id is invalid', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        player_id: 'test'
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.patch(oneBrktEntryUrl + toPatch.id, invalidJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })      
    it('should not patch a brktEntry by ID when player_id is valid, but not a player id', async () => { 
      const invalidBrktEntry = {
        ...toPatch,
        player_id: userId
      }
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.patch(oneBrktEntryUrl + toPatch.id, invalidJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not patch a brktEntry by ID when num_brackets is too low', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        num_brackets: -1
      } 
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.patch(oneBrktEntryUrl + toPatch.id, invalidJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not patch a brktEntry by ID when num_brackets is too high', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        num_brackets: 1234567890
      } 
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.patch(oneBrktEntryUrl + toPatch.id, invalidJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not patch a brktEntry by ID when num_brackets is not a number', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        num_brackets: 'abc' as any
      } 
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.patch(oneBrktEntryUrl + toPatch.id, invalidJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not patch a brktEntry by ID when num_brackets is not an integer', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        num_brackets: 2.3
      } 
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.patch(oneBrktEntryUrl + toPatch.id, invalidJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not patch a brktEntry by ID when num_refunds is too low', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        num_refunds: -1
      } 
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.patch(oneBrktEntryUrl + toPatch.id, invalidJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not patch a brktEntry by ID when num_refunds is too high', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        num_refunds: 1234567890
      } 
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.patch(oneBrktEntryUrl + toPatch.id, invalidJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not patch a brktEntry by ID when num_refunds is more than num_brackets', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        num_refunds: 123
      } 
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.patch(oneBrktEntryUrl + toPatch.id, invalidJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not patch a brktEntry by ID when num_refunds is not a number', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        num_refunds: 'abc' as any
      } 
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.patch(oneBrktEntryUrl + toPatch.id, invalidJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not patch a brktEntry by ID when num_refunds is not an integer', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        num_refunds: 2.3
      } 
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.patch(oneBrktEntryUrl + toPatch.id, invalidJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not patch a brktEntry by ID when time_stamp is null', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        time_stamp: null as any,
      } 
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.patch(oneBrktEntryUrl + toPatch.id, invalidJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not patch a brktEntry by ID when time_stamp is too low', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        time_stamp: -8.65e15 - 1
      } 
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.patch(oneBrktEntryUrl + toPatch.id, invalidJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not patch a brktEntry by ID when time_stamp is too high', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        time_stamp: 8.65e15 + 1
      } 
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.patch(oneBrktEntryUrl + toPatch.id, invalidJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not patch a brktEntry by ID when time_stamp is not a number', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        time_stamp: 'abc' as any
      } 
      const invalidJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios.patch(oneBrktEntryUrl + toPatch.id, invalidJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
  })

  describe('DELETE by ID - API: /api/brktEntries/brktEntry/:id', () => { 

    // from prisma/seeds.ts
    const toDelBrktEntry = {
      ...initBrktEntry,
      id: "ben_093a0902e01e46dbbe9f111acefc17da",
      brkt_id: "brk_12344698f47e4d64935547923e2bdbfb",          
      player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
      num_brackets: 8,
      fee: '40',
    }

    let didDel = false

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      // if deleted brktEntry, add event back
      try {
        const brktEntryJSON = JSON.stringify(toDelBrktEntry);
        await axios.post(url, brktEntryJSON, {
          withCredentials: true,
        })
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })

    it('should delete a brktEntry by ID', async () => { 
      const response = await axios.delete(oneBrktEntryUrl + toDelBrktEntry.id, {
        withCredentials: true,
      })
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(1);
      didDel = true;
    })
    it(('should NOT delete a brktEntry by ID when ID is invalid'), async () => {
      try {
        const response = await axios.delete(oneBrktEntryUrl + "invalid_id", {
          withCredentials: true,
        })
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a brktEntry by ID when id is valid, bit noy a brktEntry id', async () => {
      try {
        const response = await axios.delete(oneBrktEntryUrl + userId, {
          withCredentials: true,
        })
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a brktEntry by ID when id is not found', async () => {
      try {
        const response = await axios.delete(oneBrktEntryUrl + notFoundId, {
          withCredentials: true,
        })
        expect(response.status).toBe(200);
        expect(response.data.count).toBe(0);
      } catch (err) {
        expect(true).toBeFalsy();
      }
    })
  })

})