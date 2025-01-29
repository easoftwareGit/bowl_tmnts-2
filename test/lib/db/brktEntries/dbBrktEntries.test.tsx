import axios, { AxiosError } from "axios";
import { baseBrktEntriesApi } from "@/lib/db/apiPaths";
import { testBaseBrktEntriesApi } from "../../../testApi";
import { brktEntryType } from "@/lib/types/types";
import { initBrktEntry } from "@/lib/db/initVals";
import { mockBrktEntriesToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { deleteAllBrktEntriesForBrkt, deleteAllBrktEntriesForDiv, deleteAllBrktEntriesForSquad, deleteAllBrktEntriesForTmnt, deleteBrktEntry, getAllBrktEntriesForBrkt, getAllBrktEntriesForDiv, getAllBrktEntriesForSquad, getAllBrktEntriesForTmnt, getAllRawBrktEntriesForBrkt, getAllRawBrktEntriesForSquad, postBrktEntry, postManyBrktEntries, putBrktEntry } from "@/lib/db/brktEntries/dbBrktEntries";
import { cloneDeep } from "lodash";
import { dateStringToTimeStamp } from "@/lib/dateTools";

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

const url = testBaseBrktEntriesApi.startsWith("undefined")
  ? baseBrktEntriesApi
  : testBaseBrktEntriesApi;
const oneBrktEntryUrl = url + "/brktEntry/";
const oneSquadUrl = url + "/squad/";
const brktUrl = url + "/brkt/";

const brktEntriesToGet: brktEntryType[] = [
  {
    ...initBrktEntry,
    id: "ben_bc4c581d7b1c4fc99dbdbd46f4f7210a",
    brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",          
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    num_brackets: 8,
    fee: '40',
},
  {
    ...initBrktEntry,
    id: "ben_8f039ee00dfa445c9e3aee0ca9a6391b",
    brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",          
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    num_brackets: 8,
    fee: '40',
},
  {
    ...initBrktEntry,
    id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
    brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",          
    player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
    num_brackets: 8,
    fee: '40',
},
  {
    ...initBrktEntry,
    id: "ben_0a6938d0a5b94dd789bd3b8663d1ee53",
    brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",          
    player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
    num_brackets: 8,
    fee: '40',
}
]

const tmntIdForBrktEntries = 'tmt_fd99387c33d9c78aba290286576ddce5';
const squadIdForBrktEntries = 'sqd_7116ce5f80164830830a7157eb093396';
const divIdForBrktEntries = 'div_f30aea2c534f4cfe87f4315531cef8ef';
const brktIdForBrktEntries = 'brk_5109b54c2cc44ff9a3721de42c80c8c1';

const tmntIdFormMockData = 'tmt_56d916ece6b50e6293300248c6792316';
const divIdForMockData = 'div_1f42042f9ef24029a0a2d48cc276a087';
const squadIdForMockData = 'sqd_1a6c885ee19a49489960389193e8f819';
const brktIdForMockData = 'brk_aa3da3a411b346879307831b6fdadd5f';

const notFoundId = "ben_01234567890123456789012345678901";
const notFoundBrktId = "brk_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundPlayerId = "ply_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

const brkt1Id = 'brk_5109b54c2cc44ff9a3721de42c80c8c1';
const brkt2Id = 'brk_6ede2512c7d4409ca7b055505990a499';

describe('dbBrktEntries', () => { 

  const rePostBrktEntry = async (brktEntry: brktEntryType) => {
    try {
      // if brktEntry already in database, then don't re-post
      const getResponse = await axios.get(oneBrktEntryUrl + brktEntry.id);
      const found = getResponse.data.brktEntry;
      if (found) return;
    } catch (err) {
      if (err instanceof AxiosError) { 
        if (err.status !== 404) {
          console.log(err.message);
          return;
        }
      }
    }
    try {
      // if not in database, then re-post
      const brktEntryJSON = JSON.stringify(brktEntry);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: brktEntryJSON
      });    
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  }  

  const rePostToDel = async () => {
    const response = await axios.get(url);
    const brktEntries = response.data.brktEntries;
    const foundToDel = brktEntries.find(
      (b: brktEntryType) => b.id === mockBrktEntriesToPost[1].id
    );
    if (!foundToDel) {
      try {
        await postManyBrktEntries(mockBrktEntriesToPost);
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }
  }

  describe('getAllBrktEntriesForTmnt()', () => { 

    it('should get all brktEntries for tmnt', async () => { 
      const brktEntries = await getAllBrktEntriesForTmnt(tmntIdForBrktEntries);
      expect(brktEntries).toHaveLength(brktEntriesToGet.length);
      if (!brktEntries) return;
      for (let i = 0; i < brktEntries.length; i++) {
        if (brktEntries[i].id === brktEntriesToGet[0].id) { 
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[0].player_id);
        } else if (brktEntries[i].id === brktEntriesToGet[1].id) {
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[1].player_id);
        } else if (brktEntries[i].id === brktEntriesToGet[2].id) { 
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[2].player_id);
        } else if (brktEntries[i].id === brktEntriesToGet[3].id) {
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[3].player_id);
        } else {
          expect(true).toBe(false);
        }        
        expect(brktEntries[i].brkt_id === brkt1Id || brktEntries[i].brkt_id === brkt2Id).toBeTruthy();        
        expect(brktEntries[i].num_brackets).toEqual(brktEntriesToGet[i].num_brackets);
        expect(brktEntries[i].fee).toEqual(brktEntriesToGet[i].fee);
      }
    })
    it('should return 0 brktEntries for not found tmnt', async () => { 
      const brktEntries = await getAllBrktEntriesForTmnt(notFoundTmntId);
      expect(brktEntries).toHaveLength(0);
    })
    it('should return null if tmmt id is invalid', async () => { 
      const brktEntries = await getAllBrktEntriesForTmnt("test");
      expect(brktEntries).toBeNull();
    })
    it('should return null if tmnt id is a valid id, but not a tmnt id', async () => {
      const brktEntries = await getAllBrktEntriesForTmnt(notFoundSquadId);
      expect(brktEntries).toBeNull();
    }
    )
    it('should return null if tmnt id is null', async () => { 
      const brktEntries = await getAllBrktEntriesForTmnt(null as any);
      expect(brktEntries).toBeNull();
    })
    it('should return null if tmnt id is undefined', async () => { 
      const brktEntries = await getAllBrktEntriesForTmnt(undefined as any);
      expect(brktEntries).toBeNull();
    })
  })  

  describe('getAllBrktEntriesForSquad()', () => {

    it('should get all brktEntries for squad', async () => { 
      const brktEntries = await getAllBrktEntriesForSquad(squadIdForBrktEntries);  
      expect(brktEntries).toHaveLength(brktEntriesToGet.length);
      if (!brktEntries) return;
      for (let i = 0; i < brktEntries.length; i++) {
        if (brktEntries[i].id === brktEntriesToGet[0].id) { 
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[0].player_id);
        } else if (brktEntries[i].id === brktEntriesToGet[1].id) {
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[1].player_id);
        } else if (brktEntries[i].id === brktEntriesToGet[2].id) { 
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[2].player_id);
        } else if (brktEntries[i].id === brktEntriesToGet[3].id) {
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[3].player_id);
        } else {
          expect(true).toBe(false);
        }        
        expect(brktEntries[i].brkt_id === brkt1Id || brktEntries[i].brkt_id === brkt2Id).toBeTruthy();        
        expect(brktEntries[i].num_brackets).toEqual(brktEntriesToGet[i].num_brackets);        
        expect(brktEntries[i].fee).toEqual(brktEntriesToGet[i].fee);
      }
    })
    it('should return 0 brktEntries for not found squad', async () => { 
      const brktEntries = await getAllBrktEntriesForSquad(notFoundSquadId);
      expect(brktEntries).toHaveLength(0);
    })
    it('should return null if squad id is invalid', async () => { 
      const brktEntries = await getAllBrktEntriesForSquad("test");
      expect(brktEntries).toBeNull();
    })
    it('should return null if squad id is a valid id, but not a squad id', async () => {
      const brktEntries = await getAllBrktEntriesForSquad(notFoundTmntId);
      expect(brktEntries).toBeNull();
    })
    it('should return null if squad id is null', async () => { 
      const brktEntries = await getAllBrktEntriesForSquad(null as any);
      expect(brktEntries).toBeNull();
    })
    it('should return null if squad id is undefined', async () => { 
      const brktEntries = await getAllBrktEntriesForSquad(undefined as any);
      expect(brktEntries).toBeNull();
    })
  })

  describe('getAllRawBrktEntriesForSquad()', () => {

    it('should get all raw brktEntries for squad', async () => { 

      // get raw data from the database
      const rawResponse = await axios.get(oneSquadUrl + squadIdForBrktEntries);
      expect(rawResponse.status).toBe(200);        
      const rawBrktEntries = rawResponse.data.brktEntries;
      expect(rawBrktEntries).toHaveLength(4); // 2 brktEntries for brkt in prisma/seeds.ts
      for (let i = 0; i < rawBrktEntries.length; i++) {
        expect(rawBrktEntries[i].brkt_id === brktEntriesToGet[0].brkt_id || rawBrktEntries[i].brkt_id === brktEntriesToGet[1].brkt_id).toBe(true);
        expect(rawBrktEntries[i].createdAt).not.toBe(null);
        expect(rawBrktEntries[i].updatedAt).not.toBe(null);
      }      

      const brktEntries = await getAllRawBrktEntriesForSquad(squadIdForBrktEntries);  
      expect(brktEntries).toHaveLength(brktEntriesToGet.length);
      if (!brktEntries) return;
      for (let i = 0; i < brktEntries.length; i++) {
        if (brktEntries[i].id === brktEntriesToGet[0].id) { 
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[0].player_id);
        } else if (brktEntries[i].id === brktEntriesToGet[1].id) {
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[1].player_id);
        } else if (brktEntries[i].id === brktEntriesToGet[2].id) { 
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[2].player_id);
        } else if (brktEntries[i].id === brktEntriesToGet[3].id) {
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[3].player_id);
        } else {
          expect(true).toBe(false);
        }        
        expect(brktEntries[i].brkt_id === brkt1Id || brktEntries[i].brkt_id === brkt2Id).toBeTruthy();        
        expect(brktEntries[i].num_brackets).toEqual(brktEntriesToGet[i].num_brackets);        
        expect(brktEntries[i].fee).toEqual(brktEntriesToGet[i].fee);
      }
    })
    it('should return 0 brktEntries for not found squad', async () => { 
      const brktEntries = await getAllRawBrktEntriesForSquad(notFoundSquadId);
      expect(brktEntries).toHaveLength(0);
    })
    it('should return null if squad id is invalid', async () => { 
      const brktEntries = await getAllRawBrktEntriesForSquad("test");
      expect(brktEntries).toBeNull();
    })
    it('should return null if squad id is a valid id, but not a squad id', async () => {
      const brktEntries = await getAllRawBrktEntriesForSquad(notFoundTmntId);
      expect(brktEntries).toBeNull();
    })
    it('should return null if squad id is null', async () => { 
      const brktEntries = await getAllRawBrktEntriesForSquad(null as any);
      expect(brktEntries).toBeNull();
    })
    it('should return null if squad id is undefined', async () => { 
      const brktEntries = await getAllRawBrktEntriesForSquad(undefined as any);
      expect(brktEntries).toBeNull();
    })
  })

  describe('getAllBrktEntriesForDiv()', () => {

    it('should get all brktEntries for div', async () => { 
      const brktEntries = await getAllBrktEntriesForDiv(divIdForBrktEntries);  
      expect(brktEntries).toHaveLength(brktEntriesToGet.length);
      if (!brktEntries) return;
      for (let i = 0; i < brktEntries.length; i++) {
        if (brktEntries[i].id === brktEntriesToGet[0].id) { 
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[0].player_id);
        } else if (brktEntries[i].id === brktEntriesToGet[1].id) {
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[1].player_id);
        } else if (brktEntries[i].id === brktEntriesToGet[2].id) { 
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[2].player_id);
        } else if (brktEntries[i].id === brktEntriesToGet[3].id) {
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[3].player_id);
        } else {
          expect(true).toBe(false);
        }        
        expect(brktEntries[i].brkt_id === brkt1Id || brktEntries[i].brkt_id === brkt2Id).toBeTruthy();        
        expect(brktEntries[i].num_brackets).toEqual(brktEntriesToGet[i].num_brackets);        
        expect(brktEntries[i].fee).toEqual(brktEntriesToGet[i].fee);
      }
    })
    it('should return 0 brktEntries for not found div', async () => { 
      const brktEntries = await getAllBrktEntriesForDiv(notFoundDivId);
      expect(brktEntries).toHaveLength(0);
    })
    it('should return null if div id is invalid', async () => { 
      const brktEntries = await getAllBrktEntriesForDiv("test");
      expect(brktEntries).toBeNull();
    })
    it('should return null if div id is a valid id, but not a div id', async () => {
      const brktEntries = await getAllBrktEntriesForDiv(userId);
      expect(brktEntries).toBeNull();
    })
    it('should return null if div id is null', async () => { 
      const brktEntries = await getAllBrktEntriesForDiv(null as any);
      expect(brktEntries).toBeNull();
    })
    it('should return null if div id is undefined', async () => { 
      const brktEntries = await getAllBrktEntriesForDiv(undefined as any);
      expect(brktEntries).toBeNull();
    })
  })

  describe('getAllBrktEntriesForBrkt()', () => {

    it('should get all brktEntries for brkt', async () => { 
      const brktEntries = await getAllBrktEntriesForBrkt(brktIdForBrktEntries);  
      expect(brktEntries).toHaveLength(2);
      if (!brktEntries) return;
      for (let i = 0; i < brktEntries.length; i++) {
        if (brktEntries[i].id === brktEntriesToGet[0].id) { 
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[0].player_id);
        } else if (brktEntries[i].id === brktEntriesToGet[1].id) {
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[1].player_id);
        } else if (brktEntries[i].id === brktEntriesToGet[2].id) { 
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[2].player_id);
        } else if (brktEntries[i].id === brktEntriesToGet[3].id) {
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[3].player_id);
        } else {
          expect(true).toBe(false);
        }        
        expect(brktEntries[i].brkt_id === brkt1Id || brktEntries[i].brkt_id === brkt2Id).toBeTruthy();        
        expect(brktEntries[i].num_brackets).toEqual(brktEntriesToGet[i].num_brackets);        
        expect(brktEntries[i].fee).toEqual(brktEntriesToGet[i].fee);
      }
    })
    it('should return 0 brktEntries for not found brkt', async () => { 
      const brktEntries = await getAllBrktEntriesForBrkt(notFoundBrktId);
      expect(brktEntries).toHaveLength(0);
    })
    it('should return null if brkt id is invalid', async () => { 
      const brktEntries = await getAllBrktEntriesForBrkt("test");
      expect(brktEntries).toBeNull();
    })
    it('should return null if brkt id is a valid id, but not a div id', async () => {
      const brktEntries = await getAllBrktEntriesForBrkt(userId);
      expect(brktEntries).toBeNull();
    })
    it('should return null if brkt id is null', async () => { 
      const brktEntries = await getAllBrktEntriesForBrkt(null as any);
      expect(brktEntries).toBeNull();
    })
    it('should return null if brkt id is undefined', async () => { 
      const brktEntries = await getAllBrktEntriesForBrkt(undefined as any);
      expect(brktEntries).toBeNull();
    })
  })

  describe('getAllRawBrktEntriesForBrkt()', () => {

    it('should get all brktEntries for brkt', async () => {
      // get raw data from the database
      const rawResponse = await axios.get(brktUrl + brktIdForBrktEntries);
      expect(rawResponse.status).toBe(200);        
      const rawBrktEntries = rawResponse.data.brktEntries;
      expect(rawBrktEntries).toHaveLength(2); // 2 brktEntries for brkt in prisma/seeds.ts
      for (let i = 0; i < rawBrktEntries.length; i++) {
        expect(rawBrktEntries[i].brkt_id).toBe(brktIdForBrktEntries);
        expect(rawBrktEntries[i].createdAt).not.toBe(null);
        expect(rawBrktEntries[i].updatedAt).not.toBe(null);
      }      

      // get data from the function
      const brktEntries = await getAllRawBrktEntriesForBrkt(brktIdForBrktEntries);  
      expect(brktEntries).toHaveLength(2);
      if (!brktEntries) return;
      for (let i = 0; i < brktEntries.length; i++) {
        if (brktEntries[i].id === brktEntriesToGet[0].id) { 
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[0].player_id);
        } else if (brktEntries[i].id === brktEntriesToGet[1].id) {
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[1].player_id);
        } else if (brktEntries[i].id === brktEntriesToGet[2].id) { 
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[2].player_id);
        } else if (brktEntries[i].id === brktEntriesToGet[3].id) {
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[3].player_id);
        } else {
          expect(true).toBe(false);
        }        
        // all remaining fields should be the same for each brkt
        expect(brktEntries[i].brkt_id === brkt1Id || brktEntries[i].brkt_id === brkt2Id).toBeTruthy();        
        expect(brktEntries[i].num_brackets).toEqual(brktEntriesToGet[i].num_brackets);        
        expect(brktEntries[i].fee).toEqual(brktEntriesToGet[i].fee);
        expect(brktEntries[i].createdAt).toBe(dateStringToTimeStamp(rawBrktEntries[i].createdAt));
        expect(brktEntries[i].updatedAt).toBe(dateStringToTimeStamp(rawBrktEntries[i].updatedAt));
      }
    })
    it('should return 0 brktEntries for not found brkt', async () => { 
      const brktEntries = await getAllRawBrktEntriesForBrkt(notFoundBrktId);
      expect(brktEntries).toHaveLength(0);
    })
    it('should return null if brkt id is invalid', async () => { 
      const brktEntries = await getAllRawBrktEntriesForBrkt("test");
      expect(brktEntries).toBeNull();
    })
    it('should return null if brkt id is a valid id, but not a div id', async () => {
      const brktEntries = await getAllRawBrktEntriesForBrkt(userId);
      expect(brktEntries).toBeNull();
    })
    it('should return null if brkt id is null', async () => { 
      const brktEntries = await getAllRawBrktEntriesForBrkt(null as any);
      expect(brktEntries).toBeNull();
    })
    it('should return null if brkt id is undefined', async () => { 
      const brktEntries = await getAllRawBrktEntriesForBrkt(undefined as any);
      expect(brktEntries).toBeNull();
    })
  })

  describe('postBrktEntry()', () => { 

    const brktEntryToPost = {
      ...initBrktEntry,    
      id: 'ben_0123c6c5556e407291c4b5666b2dccd7',      
      brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
      player_id: 'ply_a01758cff1cc4bab9d9133e661bd49b0',
      num_brackets: 7,
      fee: '82',
    }

    let createdBrktEntry = false;

    const deletePostedBrktEntry = async () => { 
      const response = await axios.get(url);
      const brktEntrys = response.data.brktEntries;
      const toDel = brktEntrys.find((b: brktEntryType) => b.fee === '82');
      if (toDel) {
        try {
          const delResponse = await axios({
            method: "delete",
            withCredentials: true,
            url: oneBrktEntryUrl + toDel.id          
          });        
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

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

    it('should post one brktEntry', async () => { 
      const postedBrktEntry = await postBrktEntry(brktEntryToPost);
      expect(postedBrktEntry).not.toBeNull();
      if (!postedBrktEntry) return;
      createdBrktEntry = true;
      expect(postedBrktEntry.id).toEqual(brktEntryToPost.id);      
      expect(postedBrktEntry.brkt_id).toEqual(brktEntryToPost.brkt_id);
      expect(postedBrktEntry.player_id).toEqual(brktEntryToPost.player_id);
      expect(postedBrktEntry.num_brackets).toEqual(brktEntryToPost.num_brackets);
      expect(postedBrktEntry.fee).toEqual(brktEntryToPost.fee);
    })
    it('should post a sanitzed brktEntry', async () => { 
      const toSanitizse = {
        ...brktEntryToPost,
        fee: '82.000'
      }
      const postedBrktEntry = await postBrktEntry(toSanitizse);
      expect(postedBrktEntry).not.toBeNull();
      if (!postedBrktEntry) return;
      createdBrktEntry = true;
      expect(postedBrktEntry.id).toEqual(toSanitizse.id);      
      expect(postedBrktEntry.brkt_id).toEqual(toSanitizse.brkt_id);      
      expect(postedBrktEntry.player_id).toEqual(toSanitizse.player_id);
      expect(postedBrktEntry.num_brackets).toEqual(toSanitizse.num_brackets);
      expect(postedBrktEntry.fee).toEqual('82');
    })
    it('should not post a brktEntry with sanitized num_brackets (sanitized to 0)', async () => { 
      const toSanitizse = {
        ...brktEntryToPost,
        num_brackets: 1234567890
      }
      const postedBrktEntry = await postBrktEntry(toSanitizse);
      expect(postedBrktEntry).toBeNull();
    })
    it('should not post a brktEntry if got invalid data', async () => { 
      const invalidBrktEntry = {
        ...brktEntryToPost,
        fee: '-1'
      }
      const postedBrktEntry = await postBrktEntry(invalidBrktEntry);
      expect(postedBrktEntry).toBeNull();
    })
  })

  describe('postManyBrktEntries()', () => { 

    let createdBrktEntries = false;    

    beforeAll(async () => {
      await deleteAllBrktEntriesForTmnt(tmntIdFormMockData);
    })

    beforeEach(() => {
      createdBrktEntries = false;
    })

    afterEach(async () => {
      if (createdBrktEntries) {
        await deleteAllBrktEntriesForTmnt(tmntIdFormMockData);
      }
    })

    afterAll(async () => {
      await deleteAllBrktEntriesForTmnt(tmntIdFormMockData);
    })

    it('should post many brktEntries', async () => {
      const brktEntries = await postManyBrktEntries(mockBrktEntriesToPost);
      expect(brktEntries).not.toBeNull();
      if (!brktEntries) return;
      createdBrktEntries = true;
      expect(brktEntries.length).toEqual(mockBrktEntriesToPost.length);
      for (let i = 0; i < mockBrktEntriesToPost.length; i++) {
        expect(brktEntries[i].id).toEqual(mockBrktEntriesToPost[i].id);
        expect(brktEntries[i].brkt_id).toEqual(mockBrktEntriesToPost[i].brkt_id);
        expect(brktEntries[i].player_id).toEqual(mockBrktEntriesToPost[i].player_id);
        expect(brktEntries[i].num_brackets).toEqual(mockBrktEntriesToPost[i].num_brackets);
        expect(brktEntries[i].fee).toEqual(mockBrktEntriesToPost[i].fee);
      }
    })
    it('should NOT post many brktEntries with sanitization, fee value sanitized to ""', async () => {
      const toSanitize = cloneDeep(mockBrktEntriesToPost)
      toSanitize[0].fee = '  84  '      
      const brktEntries = await postManyBrktEntries(toSanitize);
      expect(brktEntries).toBeNull();
    })
    it('should not post many brktEntries with no data', async () => {
      const postedBrktEntries = await postManyBrktEntries([]);
      expect(postedBrktEntries).not.toBeNull();
      expect(postedBrktEntries).toHaveLength(0);
    })
    it('should not post many brktEntries with invalid data', async () => {
      const invalidBrktEntries = cloneDeep(mockBrktEntriesToPost);
      invalidBrktEntries[1].fee = '-1';
      const postedBrktEntrys = await postManyBrktEntries(invalidBrktEntries);
      expect(postedBrktEntrys).toBeNull();
    })    
  })    

  describe('putBrktEntry()', () => {

    const brktEntryToPut = {
      ...initBrktEntry,
      id: "ben_bc4c581d7b1c4fc99dbdbd46f4f7210a",
      brkt_id: 'brk_d537ea07dbc6453a8a705f4bb7599ed4',
      player_id: 'ply_a01758cff1cc4bab9d9133e661bd49b0',
      num_brackets: 7,
      fee: '83'
    }

    const putUrl = oneBrktEntryUrl + brktEntryToPut.id;

    const resetBrktEntry = {
      ...initBrktEntry,
      id: "ben_bc4c581d7b1c4fc99dbdbd46f4f7210a",
      brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",          
      player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
      num_brackets: 8,
      fee: '40',
    }

    const doReset = async () => {
      try {
        const playerJSON = JSON.stringify(resetBrktEntry);
        const response = await axios({
          method: "put",
          data: playerJSON,
          withCredentials: true,
          url: putUrl,
        });
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }

    let didPut = false;

    beforeAll(async () => {
      await doReset();
    });

    beforeEach(() => {
      didPut = false;
    });

    afterEach(async () => {
    if (!didPut) return;
      await doReset();
    });

    it('should put a brktEntry', async () => {
      const puttedBrktEntry = await putBrktEntry(brktEntryToPut);
      expect(puttedBrktEntry).not.toBeNull();
      if (!puttedBrktEntry) return;
      didPut = true;      
      expect(puttedBrktEntry.brkt_id).toBe(brktEntryToPut.brkt_id);
      expect(puttedBrktEntry.player_id).toBe(brktEntryToPut.player_id);
      expect(puttedBrktEntry.num_brackets).toBe(brktEntryToPut.num_brackets);
      expect(puttedBrktEntry.fee).toBe(brktEntryToPut.fee);
    })
    it('should NOT put a brktEntry with sanitization, num_brackets value sanitized to 0', async () => {
      const toSanitize = cloneDeep(brktEntryToPut)
      toSanitize.num_brackets = 1234567890
      const puttedBrktEntry = await putBrktEntry(toSanitize);
      expect(puttedBrktEntry).toBeNull();
    })
    it('should NOT put a brktEntry with sanitization, fee value sanitized to ""', async () => {
      const toSanitize = cloneDeep(brktEntryToPut)
      toSanitize.fee = '  84  '      
      const puttedBrktEntry = await putBrktEntry(toSanitize);
      expect(puttedBrktEntry).toBeNull();
    })
    it('shouyld NOT put a brktEntry with invalid data', async () => {
      const invalidBrktEntry = {
        ...brktEntryToPut,
        fee: '-1',
      }
      const puttedBrktEntry = await putBrktEntry(invalidBrktEntry);
      expect(puttedBrktEntry).toBeNull();
    })    
  })

  describe('deleteBrktEntry()', () => {

    // toDel is data from prisma/seeds.ts
    const toDel = {
      ...initBrktEntry,
      id: "ben_093a0902e01e46dbbe9f111acefc17da",
      brkt_id: "brk_d537ea07dbc6453a8a705f4bb7599ed4",          
      player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
      num_brackets: 8,
      fee: '40',
    }

    let didDel = false;

    beforeAll(async () => {     
      await rePostBrktEntry(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostBrktEntry(toDel);
      }
    });

    it('should delete a brktEntry', async () => {
      const deleted = await deleteBrktEntry(toDel.id);
      expect(deleted).toBe(1);
      didDel = true;
    })
    it('should not delete a brktEntry when id is not found', async () => {
      const deleted = await deleteBrktEntry(notFoundId);
      expect(deleted).toBe(-1);
    })
    it('should not delete a brktEntry when id is invalid', async () => {
      const deleted = await deleteBrktEntry("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete a brktEntry when id is null', async () => {
      const deleted = await deleteBrktEntry(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete a brktEntry when id is undefined', async () => {
      const deleted = await deleteBrktEntry(undefined as any);
      expect(deleted).toBe(-1);   
    })    
  })

  describe('deleteAllBrktEntriesForSquad()', () => { 

    let didDel = false;

    beforeAll(async () => {
      await rePostToDel();
    })
    
    beforeEach(async () => {
      if (didDel) {
        await rePostToDel();
      }
    });

    afterEach(async () => {
      didDel = false;
    });

    afterAll(async () => {
      // cleanup after tests      
    });

    it('should delete all brktEntries for a squad', async () => { 
      const deleted = await deleteAllBrktEntriesForSquad(squadIdForMockData);
      expect(deleted).toBe(mockBrktEntriesToPost.length);
      didDel = true;
    })
    it('should not delete all brktEntries for a squad when squad id is not found', async () => {
      const deleted = await deleteAllBrktEntriesForSquad(notFoundSquadId);
      expect(deleted).toBe(0);
    })  
    it('should not delete all brktEntries for a squad when squad id is invalid', async () => { 
      const deleted = await deleteAllBrktEntriesForSquad("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktEntries for a squad when squad id is valid, but not a squad id', async () => { 
      const deleted = await deleteAllBrktEntriesForSquad(userId);
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktEntries for a squad when squad id is null', async () => { 
      const deleted = await deleteAllBrktEntriesForSquad(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktEntries for a squad when squad id is undefined', async () => { 
      const deleted = await deleteAllBrktEntriesForSquad(undefined as any);
      expect(deleted).toBe(-1);
    })
  })

  describe('deleteAllBrktEntriesForDiv()', () => { 

    let didDel = false;

    beforeAll(async () => {
      await rePostToDel();
    })
    
    beforeEach(async () => {
      if (didDel) {
        await rePostToDel();
      }
    });

    afterEach(async () => {
      didDel = false;
    });

    afterAll(async () => {
      // cleanup after tests      
    });

    it('should delete all brktEntries for a div', async () => { 
      const deleted = await deleteAllBrktEntriesForDiv(divIdForMockData);
      expect(deleted).toBe(mockBrktEntriesToPost.length);
      didDel = true;
    })
    it('should not delete all brktEntries for a div when div id is not found', async () => {
      const deleted = await deleteAllBrktEntriesForDiv(notFoundDivId);
      expect(deleted).toBe(0);
    })  
    it('should not delete all brktEntries for a div when div id is invalid', async () => { 
      const deleted = await deleteAllBrktEntriesForDiv("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktEntries for a div when div id is valid, but not a div id', async () => { 
      const deleted = await deleteAllBrktEntriesForDiv(userId);
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktEntries for a div when div id is null', async () => { 
      const deleted = await deleteAllBrktEntriesForDiv(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktEntries for a div when div id is undefined', async () => { 
      const deleted = await deleteAllBrktEntriesForDiv(undefined as any);
      expect(deleted).toBe(-1);
    })
  })

  describe('deleteAllBrktEntriesForBrkt()', () => { 

    let didDel = false;

    beforeAll(async () => {
      await rePostToDel();
    })
    
    beforeEach(async () => {
      if (didDel) {
        await rePostToDel();
      }
    });

    afterEach(async () => {
      didDel = false;
      await deleteAllBrktEntriesForTmnt(tmntIdFormMockData)
    });

    afterAll(async () => {
      await deleteAllBrktEntriesForTmnt(tmntIdFormMockData)
    });

    it('should delete all brktEntries for a brkt', async () => { 
      const deleted = await deleteAllBrktEntriesForBrkt(brktIdForMockData);
      expect(deleted).toBe(2); // only 2 of the 4 mock brktEntries were deleted
      didDel = true;
    })
    it('should not delete all brktEntries for a brkt when brkt id is not found', async () => {
      const deleted = await deleteAllBrktEntriesForBrkt(notFoundBrktId);
      expect(deleted).toBe(0);
    })  
    it('should not delete all brktEntries for a brkt when brkt id is invalid', async () => { 
      const deleted = await deleteAllBrktEntriesForBrkt("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktEntries for a brkt when brkt id is valid, but not a brkt id', async () => { 
      const deleted = await deleteAllBrktEntriesForBrkt(userId);
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktEntries for a brkt when brkt id is null', async () => { 
      const deleted = await deleteAllBrktEntriesForBrkt(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktEntries for a brkt when brkt id is undefined', async () => { 
      const deleted = await deleteAllBrktEntriesForBrkt(undefined as any);
      expect(deleted).toBe(-1);
    })
  })

  describe('deleteAllBrktEntriesForTmnt()', () => {     

    let didDel = false;

    beforeAll(async () => {
      await rePostToDel();
    })
    
    beforeEach(async () => {
      if (didDel) {
        await rePostToDel();
      }
    });

    afterEach(async () => {
      didDel = false;
    });

    afterAll(async () => {
      deleteAllBrktEntriesForTmnt(tmntIdFormMockData)
    });

    it('should delete all brktEntries for a tmnt', async () => { 
      const deleted = await deleteAllBrktEntriesForTmnt(tmntIdFormMockData);
      expect(deleted).toBe(mockBrktEntriesToPost.length);
      didDel = true;
    })
    it('should not delete all brktEntries for a tmnt when tmnt id is not found', async () => {
      const deleted = await deleteAllBrktEntriesForTmnt(notFoundTmntId);
      expect(deleted).toBe(0);
    })  
    it('should not delete all brktEntries for a tmnt when tmnt id is invalid', async () => { 
      const deleted = await deleteAllBrktEntriesForTmnt("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktEntries for a tmnt when tmnt id is valid, but not a tmnt id', async () => { 
      const deleted = await deleteAllBrktEntriesForTmnt(userId);
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktEntries for a tmnt when tmnt id is null', async () => { 
      const deleted = await deleteAllBrktEntriesForTmnt(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktEntries for a tmnt when tmnt id is undefined', async () => { 
      const deleted = await deleteAllBrktEntriesForTmnt(undefined as any);
      expect(deleted).toBe(-1);
    })
  })

})