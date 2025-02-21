import axios, { AxiosError } from "axios";
import { baseBrktEntriesApi } from "@/lib/db/apiPaths";
import { testBaseBrktEntriesApi } from "../../../testApi";
import { initBrktEntry } from "@/lib/db/initVals";
import { brktEntryType } from "@/lib/types/types";
import { mockBrktEntriesToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { deleteAllBrktEntriesForTmnt, postManyBrktEntries } from "@/lib/db/brktEntries/dbBrktEntries";
import { cloneDeep } from "lodash";
import { compareAsc } from "date-fns";
import { maxDate, minDate } from "@/lib/validation";
import { time } from "console";

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
const brktUrl = url + "/brkt/";
const divUrl = url + "/div/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/"; 
const manyUrl = url + "/many";

describe("BrktEntries - API's: /api/brktEntries", () => { 

  const testBrktEntry = {
    ...initBrktEntry,
    id: "ben_bc4c581d7b1c4fc99dbdbd46f4f7210a",
    brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",          
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    num_brackets: 8,
    fee: '40',
    time_stamp: new Date("2024-01-01").getTime(),
  }

  const tmntIdForMulti = 'tmt_fe8ac53dad0f400abe6354210a8f4cd1';

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

  const deletePostedBrktEntry = async () => {
    const response = await axios.get(url);
    const brktEntries = response.data.brktEntries;
    const toDel = brktEntries.find((b: brktEntryType) => b.num_brackets === 17);
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

  describe('GET', () => { 

    beforeAll(async () => {
      await deletePostedBrktEntry();
    })

    it('should get all brktEntries', async () => {
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      // 19 rows in prisma/seed.ts
      expect(response.data.brktEntries).toHaveLength(19);
    })
  })

  describe('GET one brktEntry API: /api/brktEntries/brktEntry/:id', () => { 

    it('should get one brktEntry by ID', async () => {
      try {
        const urlToUse = oneBrktEntryUrl + testBrktEntry.id;
        const response = await axios.get(urlToUse);
        expect(response.status).toBe(200);        
        const brktEntry = response.data.brktEntry;
        expect(brktEntry.id).toEqual(testBrktEntry.id);        
        expect(brktEntry.brkt_id).toEqual(testBrktEntry.brkt_id);
        expect(brktEntry.player_id).toEqual(testBrktEntry.player_id);
        expect(brktEntry.num_brackets).toEqual(testBrktEntry.num_brackets);
        expect(brktEntry.fee).toEqual(Number(testBrktEntry.fee));
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
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
        expect(brktEntries[i].fee).toBeGreaterThan(0);
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
        expect(brktEntries[i].fee).toBeGreaterThan(0);
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
        expect(brktEntries[i].fee).toBeGreaterThan(0);
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
        expect(brktEntries[i].fee).toBeGreaterThan(0);
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
      brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
      player_id: 'ply_bb0fd8bbd9e34d34a7fa90b4111c6e40',
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

    afterAll(async () => {
      await deletePostedBrktEntry();
    })

    it('should post one brktEntry', async () => {
      const divPlayerJSON = JSON.stringify(brktEntryToPost);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: divPlayerJSON
      });      
      expect(response.status).toBe(201);
      createdBrktEntry = true;
      const brktEntry = response.data.brktEntry;
      expect(brktEntry.id).toEqual(brktEntryToPost.id);      
      expect(brktEntry.brkt_id).toEqual(brktEntryToPost.brkt_id);
      expect(brktEntry.player_id).toEqual(brktEntryToPost.player_id);
      expect(brktEntry.num_brackets).toEqual(brktEntryToPost.num_brackets);
      // expect(brktEntry.fee).toEqual(brktEntryToPost.fee);
      expect(brktEntry.time_stamp).not.toBeNull();
      expect(compareAsc(brktEntry.time_stamp, brktEntryToPost.time_stamp)).toBe(0);
    })
    it('should NOT post a sanitized brktEntry (saninted num_brackets = 0)', async () => { 
      const toSanitize = {
        ...brktEntryToPost,
        num_brackets: 1234567890
      }
      const brktEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktEntryJSON
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
      const brktEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktEntryJSON
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
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktEntryJSON
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
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktEntryJSON
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
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktEntryJSON
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
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktEntryJSON
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
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktEntryJSON
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
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktEntryJSON
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
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktEntryJSON
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
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktEntryJSON
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
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktEntryJSON
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
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktEntryJSON
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
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktEntryJSON
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
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktEntryJSON
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
        fee: 1234567890
      } 
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktEntryJSON
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
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktEntryJSON
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
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktEntryJSON
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
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);         
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktEntryJSON
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
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktEntryJSON
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
        time_stamp: maxDate.getTime() + 1
      } 
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktEntryJSON
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

  describe('POST many brktEntries for one tmnt API: /api/brktEntries/many', () => { 

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

    it('should create many brktEntries', async () => {
      const brktEntryJSON = JSON.stringify(mockBrktEntriesToPost);
      const response = await axios({
        method: "post",
        data: brktEntryJSON,
        withCredentials: true,
        url: manyUrl,        
      })
      const postedBrktEntries = response.data.brktEntries;
      expect(response.status).toBe(201);
      createdBrktEntries = true;
      expect(postedBrktEntries).not.toBeNull();
      expect(postedBrktEntries.length).toBe(mockBrktEntriesToPost.length);
      for (let i = 0; i < mockBrktEntriesToPost.length; i++) {
        expect(postedBrktEntries[i].id).toBe(mockBrktEntriesToPost[i].id);        
        expect(postedBrktEntries[i].brkt_id).toBe(mockBrktEntriesToPost[i].brkt_id);
        expect(postedBrktEntries[i].player_id).toBe(mockBrktEntriesToPost[i].player_id);
        expect(postedBrktEntries[i].num_brackets).toBe(mockBrktEntriesToPost[i].num_brackets);
        // expect(postedBrktEntries[i].fee).toBe(mockBrktEntriesToPost[i].fee);        
        expect(postedBrktEntries[i].time_stamp).not.toBeNull();
        expect(compareAsc(postedBrktEntries[i].time_stamp, minDate)).toBe(1);
        expect(compareAsc(postedBrktEntries[i].time_stamp, maxDate)).toBe(-1);
      }
    })
    it('should NOT create many brktEntries with sanitzied num_brackets data, num_brackets sanitized to 0', async () => { 
      const toSanitize = cloneDeep(mockBrktEntriesToPost);
      toSanitize[0].num_brackets = 1234567890;
      const brktEntryJSON = JSON.stringify(toSanitize);      
      try {
        const response = await axios({
          method: "post",
          data: brktEntryJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many brktEntries with sanitzied data, fee sanitized to ""', async () => { 
      const toSanitize = cloneDeep(mockBrktEntriesToPost);
      toSanitize[0].fee = '   84  ';      
      const brktEntryJSON = JSON.stringify(toSanitize);      
      try {
        const response = await axios({
          method: "post",
          data: brktEntryJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('shold NOT create many brktEntries with blank ids', async () => {
      const toSanitize = cloneDeep(mockBrktEntriesToPost);      
      toSanitize[1].id = '';
      const brktEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktEntryJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many brktEntries with blank brkt_id', async () => {
      const toSanitize = cloneDeep(mockBrktEntriesToPost);      
      toSanitize[1].brkt_id = '';
      const brktEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktEntryJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many brktEntries with blank player_id', async () => {
      const toSanitize = cloneDeep(mockBrktEntriesToPost);      
      toSanitize[1].player_id = '';
      const brktEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktEntryJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many brktEntries with no num_brackets', async () => {
      const toSanitize = cloneDeep(mockBrktEntriesToPost);      
      toSanitize[1].num_brackets = null as any;
      const brktEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktEntryJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many brktEntries with blank fee', async () => {
      const toSanitize = cloneDeep(mockBrktEntriesToPost);      
      toSanitize[1].fee = '';
      const brktEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktEntryJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many brktEntries with time_stamp as null', async () => {
      const toSanitize = cloneDeep(mockBrktEntriesToPost);      
      toSanitize[1].time_stamp = null as any;
      const brktEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktEntryJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many brktEntries with invalid id', async () => {
      const toSanitize = cloneDeep(mockBrktEntriesToPost);      
      toSanitize[1].id = 'test';
      const brktEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktEntryJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many brktEntries with valid id, but not a brktEntry id', async () => {
      const toSanitize = cloneDeep(mockBrktEntriesToPost);      
      toSanitize[1].id = userId;
      const brktEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktEntryJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many brktEntries with invalid brkt_id', async () => {
      const toSanitize = cloneDeep(mockBrktEntriesToPost);      
      toSanitize[1].brkt_id = 'test';
      const brktEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktEntryJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many brktEntries with valid brkt_id, but not a div id', async () => {
      const toSanitize = cloneDeep(mockBrktEntriesToPost);      
      toSanitize[1].brkt_id = userId;
      const brktEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktEntryJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many brktEntries with invalid player_id', async () => {
      const toSanitize = cloneDeep(mockBrktEntriesToPost);      
      toSanitize[1].player_id = 'test';
      const brktEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktEntryJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many brktEntries with valid player_id, but not a player id', async () => {
      const toSanitize = cloneDeep(mockBrktEntriesToPost);      
      toSanitize[1].player_id = userId;
      const brktEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktEntryJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many brktEntries when num_brackets to too low', async () => {
      const toSanitize = cloneDeep(mockBrktEntriesToPost);      
      toSanitize[1].num_brackets = -1;
      const brktEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktEntryJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many brktEntries when num_brackets to too high', async () => {
      const toSanitize = cloneDeep(mockBrktEntriesToPost);
      toSanitize[1].num_brackets = 9999999999;
      const brktEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktEntryJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many brktEntries when fee to too low', async () => {
      const toSanitize = cloneDeep(mockBrktEntriesToPost);      
      toSanitize[1].fee = '-1';
      const brktEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktEntryJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many brktEntries when fee to too high', async () => {
      const toSanitize = cloneDeep(mockBrktEntriesToPost);
      toSanitize[1].fee = '9999999999';
      const brktEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktEntryJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many brktEntries when time_stamp to too low', async () => {
      const toSanitize = cloneDeep(mockBrktEntriesToPost);      
      toSanitize[1].time_stamp= -8.65e15 - 1;
      const brktEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktEntryJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many brktEntries when time_stamp to too high', async () => {
      const toSanitize = cloneDeep(mockBrktEntriesToPost);
      toSanitize[1].time_stamp = 8.65e15 + 1
      const brktEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktEntryJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many brktEntries when time_stamp is invalid', async () => {
      const toSanitize = cloneDeep(mockBrktEntriesToPost);      
      toSanitize[1].time_stamp= 'abc' as any;
      const brktEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktEntryJSON,
          withCredentials: true,
          url: manyUrl,        
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

  describe('PUT many brktEntries API: /api/brktEntries/many', () => {  

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

    const testBrktEntries: brktEntryType[] = [
      {
        ...initBrktEntry,
        id: 'ben_01ce0472be3d476ea1caa99dd05953fa',
        player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
        num_brackets: 4,
        fee: '20',
        time_stamp: 1739259269537,
      },
      {
        ...initBrktEntry,
        id: 'ben_02ce0472be3d476ea1caa99dd05953fa',
        player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
        num_brackets: 4,
        fee: '20',
        time_stamp: 1739259269537,
      },
      {
        ...initBrktEntry,
        id: 'ben_03ce0472be3d476ea1caa99dd05953fa',
        player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
        num_brackets: 6,
        fee: '30',
        time_stamp: 1739259269537,
      },
      {
        ...initBrktEntry,
        id: 'ben_04ce0472be3d476ea1caa99dd05953fa',
        player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
        num_brackets: 6,
        fee: '30',
        time_stamp: 1739259269537,
      },
      {
        ...initBrktEntry,
        id: 'ben_05ce0472be3d476ea1caa99dd05953fa',
        player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
        brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
        num_brackets: 8,
        fee: '40',
        time_stamp: 1739259269537,
      },
      {
        ...initBrktEntry,
        id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
        player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
        brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
        num_brackets: 8,
        fee: '40',
        time_stamp: 1739259269537,
      },
    ];

    it('should update many brktEntries - just update 1 player 2 bracket entry', async () => {
      const brktEntryJSON = JSON.stringify(testBrktEntries);
      const response = await axios({
        method: "post",
        data: brktEntryJSON,
        withCredentials: true,
        url: manyUrl,
      })
      const postedBrktEntries = response.data.brktEntries;
      expect(response.status).toBe(201);
      createdBrktEntries = true;
      expect(postedBrktEntries).not.toBeNull();
      expect(postedBrktEntries.length).toBe(testBrktEntries.length);
      
      // change number of brackets, fee, add eType = 'u'
      const brktEntriesToUpdate = [
        {
          ...testBrktEntries[0],
          num_brackets: 3,
          fee: '15',
          time_stamp: new Date("2026-01-01").getTime(),
          eType: "u",
        },
        {
          ...testBrktEntries[1],
          num_brackets: 3,
          fee: '15',
          time_stamp: new Date("2026-01-01").getTime(),
          eType: "u",
        },
      ]

      const toUpdateJSON = JSON.stringify(brktEntriesToUpdate)
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(2);
      expect(updateInfo.inserts).toBe(0);
      expect(updateInfo.deletes).toBe(0);
    });
    it('should update many brktEntries - just update 2 player 1 bracket entry', async () => {
      const brktEntryJSON = JSON.stringify(testBrktEntries);
      const response = await axios({
        method: "post",
        data: brktEntryJSON,
        withCredentials: true,
        url: manyUrl,
      })
      const postedBrktEntries = response.data.brktEntries;
      expect(response.status).toBe(201);
      createdBrktEntries = true;
      expect(postedBrktEntries).not.toBeNull();
      expect(postedBrktEntries.length).toBe(testBrktEntries.length);
      
      // change number of brackets, fee, add eType = 'u'
      const brktEntriesToUpdate = [
        {
          ...testBrktEntries[0],
          num_brackets: 3,
          fee: '15',
          eType: "u",
        },
        {
          ...testBrktEntries[2],
          num_brackets: 5,
          fee: '25',
          eType: "u",
        },
      ]

      const toUpdateJSON = JSON.stringify(brktEntriesToUpdate)
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(2);
      expect(updateInfo.inserts).toBe(0);
      expect(updateInfo.deletes).toBe(0);
    });
    it('should update many brktEntries - just update 2 player 2 bracket entry', async () => {
      const brktEntryJSON = JSON.stringify(testBrktEntries);
      const response = await axios({
        method: "post",
        data: brktEntryJSON,
        withCredentials: true,
        url: manyUrl,
      })
      const postedBrktEntries = response.data.brktEntries;
      expect(response.status).toBe(201);
      createdBrktEntries = true;
      expect(postedBrktEntries).not.toBeNull();
      expect(postedBrktEntries.length).toBe(testBrktEntries.length);
      
      // change number of brackets, fee, add eType = 'u'
      const brktEntriesToUpdate = [
        {
          ...testBrktEntries[0],
          num_brackets: 3,
          fee: '15',
          eType: "u",
        },
        {
          ...testBrktEntries[1],
          num_brackets: 3,
          fee: '15',
          eType: "u",
        },
        {
          ...testBrktEntries[2],
          num_brackets: 5,
          fee: '25',
          eType: "u",
        },
        {
          ...testBrktEntries[3],
          num_brackets: 5,
          fee: '25',
          eType: "u",
        },
      ]

      const toUpdateJSON = JSON.stringify(brktEntriesToUpdate)
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(4);
      expect(updateInfo.inserts).toBe(0);
      expect(updateInfo.deletes).toBe(0);
    });
    it('should insert many brktEntries - just insert 1 player 2 bracket entry', async () => {
      createdBrktEntries = true;
      
      // add eType = 'i'
      const brktEntriesToUpdate = [
        {
          ...testBrktEntries[0],
          eType: "i",
        },
        {
          ...testBrktEntries[1],
          eType: "i",
        },
      ]

      const toUpdateJSON = JSON.stringify(brktEntriesToUpdate)
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.inserts).toBe(2);
      expect(updateInfo.deletes).toBe(0);
    });
    it('should insert many brktEntries - just insert 2 player 1 bracket entry', async () => {
      createdBrktEntries = true;
      
      // add eType = 'i'
      const brktEntriesToUpdate = [
        {
          ...testBrktEntries[0],
          eType: "i",
        },
        {
          ...testBrktEntries[2],
          eType: "i",
        },
      ]

      const toUpdateJSON = JSON.stringify(brktEntriesToUpdate)
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.inserts).toBe(2);
      expect(updateInfo.deletes).toBe(0);
    });
    it('should insert many brktEntries - just insert 2 player 2 bracket entry', async () => {
      createdBrktEntries = true;
      
      // add eType = 'i'
      const brktEntriesToUpdate = [
        {
          ...testBrktEntries[0],
          eType: "i",
        },
        {
          ...testBrktEntries[1],
          eType: "i",
        },
        {
          ...testBrktEntries[2],
          eType: "i",
        },
        {
          ...testBrktEntries[3],
          eType: "i",
        },
      ]

      const toUpdateJSON = JSON.stringify(brktEntriesToUpdate)
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.inserts).toBe(4);
      expect(updateInfo.deletes).toBe(0);
    });
    it('should delete many brktEntries - just delete 1 player 2 bracket entry', async () => {
      const brktEntryJSON = JSON.stringify(testBrktEntries);
      const response = await axios({
        method: "post",
        data: brktEntryJSON,
        withCredentials: true,
        url: manyUrl,
      })
      const postedBrktEntries = response.data.brktEntries;
      expect(response.status).toBe(201);
      createdBrktEntries = true;
      expect(postedBrktEntries).not.toBeNull();
      expect(postedBrktEntries.length).toBe(testBrktEntries.length);
      
      // add eType = 'd'
      const brktEntriesToUpdate = [
        {
          ...testBrktEntries[0],
          eType: "d",
        },
        {
          ...testBrktEntries[1],
          eType: "d",
        },
      ]

      const toUpdateJSON = JSON.stringify(brktEntriesToUpdate)
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.inserts).toBe(0);
      expect(updateInfo.deletes).toBe(2);
    });
    it('should delete many brktEntries - just delete 2 player 1 bracket entry', async () => {
      const brktEntryJSON = JSON.stringify(testBrktEntries);
      const response = await axios({
        method: "post",
        data: brktEntryJSON,
        withCredentials: true,
        url: manyUrl,
      })
      const postedBrktEntries = response.data.brktEntries;
      expect(response.status).toBe(201);
      createdBrktEntries = true;
      expect(postedBrktEntries).not.toBeNull();
      expect(postedBrktEntries.length).toBe(testBrktEntries.length);
      
      // add eType = 'd'
      const brktEntriesToUpdate = [
        {
          ...testBrktEntries[0],
          eType: "d",
        },
        {
          ...testBrktEntries[2],
          eType: "d",
        },
      ]

      const toUpdateJSON = JSON.stringify(brktEntriesToUpdate)
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.inserts).toBe(0);
      expect(updateInfo.deletes).toBe(2);
    });
    it('should delete many brktEntries - just delete 2 player 2 bracket entry', async () => {
      const brktEntryJSON = JSON.stringify(testBrktEntries);
      const response = await axios({
        method: "post",
        data: brktEntryJSON,
        withCredentials: true,
        url: manyUrl,
      })
      const postedBrktEntries = response.data.brktEntries;
      expect(response.status).toBe(201);
      createdBrktEntries = true;
      expect(postedBrktEntries).not.toBeNull();
      expect(postedBrktEntries.length).toBe(testBrktEntries.length);
      
      // add eType = 'd'
      const brktEntriesToUpdate = [
        {
          ...testBrktEntries[0],
          eType: "d",
        },
        {
          ...testBrktEntries[1],
          eType: "d",
        },
        {
          ...testBrktEntries[2],
          eType: "d",
        },
        {
          ...testBrktEntries[3],
          eType: "d",
        },
      ]

      const toUpdateJSON = JSON.stringify(brktEntriesToUpdate)
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.inserts).toBe(0);
      expect(updateInfo.deletes).toBe(4);
    });
    it('should update, insert and delete many brktEntries', async () => {
      const multiBrktEntriesTest = [
        {
          ...testBrktEntries[0],
        },
        {
          ...testBrktEntries[1],
        },
        {
          ...testBrktEntries[2],
        },
        {
          ...testBrktEntries[3],
        },
      ]
      const potEntryJSON = JSON.stringify(multiBrktEntriesTest);
      const response = await axios({
        method: "post",
        data: potEntryJSON,
        withCredentials: true,
        url: manyUrl,
      })
      const postedBrktEntries = response.data.brktEntries;
      expect(response.status).toBe(201);
      createdBrktEntries = true;
      expect(postedBrktEntries).not.toBeNull();
      expect(postedBrktEntries.length).toBe(multiBrktEntriesTest.length);

      // set edits, set eType
      const brktEntriesToUpdate = [
        {
          ...multiBrktEntriesTest[0],
          num_brackets: 3,
          fee: '15',
          eType: "u",
        },
        {
          ...multiBrktEntriesTest[1],
          num_brackets: 3,
          fee: '15',
          eType: "u",
        },
        {
          ...multiBrktEntriesTest[2],
          eType: "d",
        },
        {
          ...multiBrktEntriesTest[3],          
          eType: "d",
        },
        {
          ...testBrktEntries[4],
          eType: "i",
        },
        {
          ...testBrktEntries[5],
          eType: "i",
        },
      ]
      const toUpdateJSON = JSON.stringify(brktEntriesToUpdate)
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(2);
      expect(updateInfo.inserts).toBe(2);
      expect(updateInfo.deletes).toBe(2);
    });
    it('should NOT update, insert and delete many brktEntries with invalid data', async () => {
      const multiBrktEntriesTest = [
        {
          ...testBrktEntries[0],
        },
        {
          ...testBrktEntries[1],
        },
        {
          ...testBrktEntries[2],
        },
        {
          ...testBrktEntries[3],
        },
      ]
      const potEntryJSON = JSON.stringify(multiBrktEntriesTest);
      const response = await axios({
        method: "post",
        data: potEntryJSON,
        withCredentials: true,
        url: manyUrl,
      })
      const postedBrktEntries = response.data.brktEntries;
      expect(response.status).toBe(201);
      createdBrktEntries = true;
      expect(postedBrktEntries).not.toBeNull();
      expect(postedBrktEntries.length).toBe(multiBrktEntriesTest.length);

      // set edits, set eType
      const brktEntriesToUpdate = [
        {
          ...multiBrktEntriesTest[0],
          num_brackets: 999999,
          fee: '4999995',
          eType: "u",
        },
        {
          ...multiBrktEntriesTest[1],
          num_brackets: 3,
          fee: '15',
          eType: "u",
        },
        {
          ...multiBrktEntriesTest[2],
          eType: "d",
        },
        {
          ...multiBrktEntriesTest[3],          
          eType: "d",
        },
        {
          ...testBrktEntries[4],
          eType: "i",
        },
        {
          ...testBrktEntries[5],
          eType: "i",
        },
      ]
      const toUpdateJSON = JSON.stringify(brktEntriesToUpdate)
      try {
        const updateResponse = await axios({
          method: "put",
          data: toUpdateJSON,
          withCredentials: true,
          url: manyUrl,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
  })

  describe('PUT one brktEntry API: /api/brktEntries/brktEntry/:id', () => { 

    const resetBrktEntry = async () => {
      // make sure test player is reset in database
      const brktEntryJSON = JSON.stringify(testBrktEntry);
      const putResponse = await axios({
        method: "put",
        data: brktEntryJSON,
        withCredentials: true,
        url: oneBrktEntryUrl + testBrktEntry.id,
      })
    }

    const putBrktEntry = {
      ...testBrktEntry,      
      brkt_id: 'brk_3e6bf51cc1ca4748ad5e8abab88277e0',
      player_id: 'ply_8b0fd8bbd9e34d34a7fa90b4111c6e40',
      num_brackets: 7,
      fee: '83',
      time_stamp: 1739259269537
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

    it('should update a brktEntry by ID', async () => {
      const brktEntryJSON = JSON.stringify(putBrktEntry);
      const response = await axios({
        method: "put",
        data: brktEntryJSON,
        withCredentials: true,
        url: oneBrktEntryUrl + testBrktEntry.id,
      });
      expect(response.status).toBe(200);
      didPut = true;
      const puttedBrktEntry = response.data.brktEntry;
      // did not update squad_id      
      expect(puttedBrktEntry.brkt_id).toBe(putBrktEntry.brkt_id);
      expect(puttedBrktEntry.player_id).toBe(putBrktEntry.player_id);
      expect(puttedBrktEntry.num_brackets).toBe(putBrktEntry.num_brackets);
      expect(compareAsc(puttedBrktEntry.time_stamp, putBrktEntry.time_stamp)).toBe(0);
    })
    it('should update a sanitized brktEntry by ID', async () => { 
      const toSanitize = {
        ...putBrktEntry,
        fee: '83.000',
      }
      const brktEntryJSON = JSON.stringify(toSanitize);
      const response = await axios({
        method: "put",
        data: brktEntryJSON,
        withCredentials: true,
        url: oneBrktEntryUrl + testBrktEntry.id,
      });
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
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "put",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + testBrktEntry.id,
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
    it('should not update a brktEntry by ID when player_id is blank', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        player_id: ''
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "put",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + testBrktEntry.id,
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
    it('should not update a brktEntry by ID when num_brackets is null', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        num_brackets: null as any,
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "put",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + testBrktEntry.id,
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
    it('should not update a brktEntry by ID when num_brackets is too low', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        num_brackets: -1
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "put",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + testBrktEntry.id,
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
    it('should not update a brktEntry by ID when num_brackets is too high', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        num_brackets: 1234567890
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "put",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + testBrktEntry.id,
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
    it('should not update a brktEntry by ID when num_brackets is not a number', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        num_brackets: 'not a number' as any
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "put",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + testBrktEntry.id,
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
    it('should not update a brktEntry by ID when num_brackets is not an integer', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        num_brackets: 1.2
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "put",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + testBrktEntry.id,
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
    it('should not update a brktEntry by ID when fee is blank', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        fee: ''
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "put",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + testBrktEntry.id,
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
    it('should not update a brktEntry by ID when fee is too low', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        fee: '-1'
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "put",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + testBrktEntry.id,
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
    it('should not update a brktEntry by ID when fee is too high', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        fee: '1234567890'
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "put",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + testBrktEntry.id,
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
    it('should not update a brktEntry by ID when fee is not a number', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        fee: 'not a number'
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "put",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + testBrktEntry.id,
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

    it('should not update a brktEntry by ID when time_stamp is too low', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        time_stamp: -8.65e15 - 1
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "put",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + testBrktEntry.id,
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
    it('should not update a brktEntry by ID when time_stamp is too high', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        time_stamp: 8.65e15 + 1
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "put",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + testBrktEntry.id,
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
    it('should not update a brktEntry by ID when time_stamp is invalid', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        time_stamp: 'abc'
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "put",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + testBrktEntry.id,
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
    it('should not update a brktEntry by ID when time_stamp is null', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        time_stamp: null as any,
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "put",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + testBrktEntry.id,
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
    it('should not update a brktEntry by ID when time_stamp is null', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        time_stamp: null as any,
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "put",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + testBrktEntry.id,
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
    it('should not update a brktEntry by ID when time_stamp is too low', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        time_stamp: -8.65e15 - 1
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "put",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + testBrktEntry.id,
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
    it('should not update a brktEntry by ID when time_stamp is too high', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        time_stamp: 8.65e15 + 1
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "put",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + testBrktEntry.id,
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
    it('should not update a brktEntry by ID when time_stamp is invalid', async () => {
      const invalidBrktEntry = {
        ...putBrktEntry,
        time_stamp: 'abc' as any
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "put",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + testBrktEntry.id,
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

  describe('PATCH one brktEntry API: /api/brktEntries/brktEntry/:id', () => { 

    const toPatch = {
      id: testBrktEntry.id,
    }
    
    const doResetBrktEntry = async () => {
      try {
        const playerJSON = JSON.stringify(testBrktEntry);
        const putResponse = await axios({
          method: "patch",
          data: playerJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + testBrktEntry.id,
        })
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }

    let didPatch = false;

    beforeAll(async () => {
      await doResetBrktEntry
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
      const response = await axios({
        method: "patch",
        data: brktEntryJSON,
        withCredentials: true,
        url: oneBrktEntryUrl + toPatch.id,
      });
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
      const response = await axios({
        method: "patch",
        data: brktEntryJSON,
        withCredentials: true,
        url: oneBrktEntryUrl + toPatch.id,
      });
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
      const response = await axios({
        method: "patch",
        data: brktEntryJSON,
        withCredentials: true,
        url: oneBrktEntryUrl + toPatch.id,
      });
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedBrktEntry = response.data.brktEntry;
      expect(patchedBrktEntry.id).toBe(toPatch.id);
      expect(patchedBrktEntry.num_brackets).toBe(toPatchNumBrackets);      
    })
    it('should patch time_stamp in a brktEntry by ID', async () => {       
      const patchBrktEntry = {
        ...toPatch,
        time_stamp: 1739259269537
      }
      const brktEntryJSON = JSON.stringify(patchBrktEntry);
      const response = await axios({
        method: "patch",
        data: brktEntryJSON,
        withCredentials: true,
        url: oneBrktEntryUrl + toPatch.id,
      });
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
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "patch",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + toPatch.id,
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
    it('should not patch a brktEntry by ID when brkt_id is valid, but not a div id', async () => { 
      const invalidBrktEntry = {
        ...toPatch,
        brkt_id: userId
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "patch",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + toPatch.id,
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
    it('should not patch a brktEntry by ID when brkt_id is invalid', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        brkt_id: 'test'
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "patch",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + toPatch.id,
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
    it('should not patch a brktEntry by ID when brkt_id is valid, but not a div id', async () => { 
      const invalidBrktEntry = {
        ...toPatch,
        brkt_id: userId
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "patch",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + toPatch.id,
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
    it('should not patch a brktEntry by ID when player_id is blank', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        player_id: ''
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "patch",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + toPatch.id,
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
    it('should not patch a brktEntry by ID when player_id is invalid', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        player_id: 'test'
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "patch",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + toPatch.id,
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
    it('should not patch a brktEntry by ID when player_id is valid, but not a player id', async () => { 
      const invalidBrktEntry = {
        ...toPatch,
        player_id: userId
      }
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "patch",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + toPatch.id,
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

    it('should not patch a brktEntry by ID when num_brackets is too low', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        num_brackets: -1
      } 
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "patch",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + toPatch.id,
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
    it('should not patch a brktEntry by ID when num_brackets is too high', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        num_brackets: 1234567890
      } 
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "patch",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + toPatch.id,
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
    it('should not patch a brktEntry by ID when num_brackets is not a number', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        num_brackets: 'abc' as any
      } 
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "patch",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + toPatch.id,
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
    it('should not patch a brktEntry by ID when num_brackets is not an integer', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        num_brackets: 2.3
      } 
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "patch",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + toPatch.id,
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
    // no error checking for fee, not included in patch
    // it('should not patch a brktEntry by ID when fee is blank', async () => {
    //   const invalidBrktEntry = {
    //     ...toPatch,
    //     fee: ''
    //   } 
    //   const brktEntryJSON = JSON.stringify(invalidBrktEntry);
    //   try {
    //     const response = await axios({
    //       method: "patch",
    //       data: brktEntryJSON,
    //       withCredentials: true,
    //       url: oneBrktEntryUrl + toPatch.id,
    //     });
    //     expect(response.status).toBe(422);
    //   } catch (err) {
    //     if (err instanceof AxiosError) {
    //       expect(err.response?.status).toBe(422);
    //     } else {
    //       expect(true).toBeFalsy();
    //     }        
    //   }
    // })
    // it('should not patch a brktEntry by ID when fee is too low', async () => {
    //   const invalidBrktEntry = {
    //     ...toPatch,
    //     fee: '-1'
    //   } 
    //   const brktEntryJSON = JSON.stringify(invalidBrktEntry);
    //   try {
    //     const response = await axios({
    //       method: "patch",
    //       data: brktEntryJSON,
    //       withCredentials: true,
    //       url: oneBrktEntryUrl + toPatch.id,
    //     });
    //     expect(response.status).toBe(422);
    //   } catch (err) {
    //     if (err instanceof AxiosError) {
    //       expect(err.response?.status).toBe(422);
    //     } else {
    //       expect(true).toBeFalsy();
    //     }        
    //   }
    // })
    // it('should not patch a brktEntry by ID when fee is too high', async () => {
    //   const invalidBrktEntry = {
    //     ...toPatch,
    //     fee: '1234567890'
    //   } 
    //   const brktEntryJSON = JSON.stringify(invalidBrktEntry);
    //   try {
    //     const response = await axios({
    //       method: "patch",
    //       data: brktEntryJSON,
    //       withCredentials: true,
    //       url: oneBrktEntryUrl + toPatch.id,
    //     });
    //     expect(response.status).toBe(422);
    //   } catch (err) {
    //     if (err instanceof AxiosError) {
    //       expect(err.response?.status).toBe(422);
    //     } else {
    //       expect(true).toBeFalsy();
    //     }        
    //   }
    // })
    // it('should not patch a brktEntry by ID when fee is not a number', async () => {
    //   const invalidBrktEntry = {
    //     ...toPatch,
    //     fee: 'abc'
    //   } 
    //   const brktEntryJSON = JSON.stringify(invalidBrktEntry);
    //   try {
    //     const response = await axios({
    //       method: "patch",
    //       data: brktEntryJSON,
    //       withCredentials: true,
    //       url: oneBrktEntryUrl + toPatch.id,
    //     });
    //     expect(response.status).toBe(422);
    //   } catch (err) {
    //     if (err instanceof AxiosError) {
    //       expect(err.response?.status).toBe(422);
    //     } else {
    //       expect(true).toBeFalsy();
    //     }        
    //   }
    // })
    it('should not patch a brktEntry by ID when time_stamp is null', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        time_stamp: null as any,
      } 
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "patch",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + toPatch.id,
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
    it('should not patch a brktEntry by ID when time_stamp is too low', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        time_stamp: -8.65e15 - 1
      } 
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "patch",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + toPatch.id,
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
    it('should not patch a brktEntry by ID when time_stamp is too high', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        time_stamp: 8.65e15 + 1
      } 
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "patch",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + toPatch.id,
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
    it('should not patch a brktEntry by ID when time_stamp is not a number', async () => {
      const invalidBrktEntry = {
        ...toPatch,
        time_stamp: 'abc' as any
      } 
      const brktEntryJSON = JSON.stringify(invalidBrktEntry);
      try {
        const response = await axios({
          method: "patch",
          data: brktEntryJSON,
          withCredentials: true,
          url: oneBrktEntryUrl + toPatch.id,
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

  describe('DELETE by ID - API: /api/brktEntries/brktEntry/:id', () => { 

    // from prisma/seeds.ts
    const toDelBrktEntry = {
      ...initBrktEntry,
      id: "ben_093a0902e01e46dbbe9f111acefc17da",
      brkt_id: "brk_d537ea07dbc6453a8a705f4bb7599ed4",          
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
      // if deleted event, add event back
      try {
        const playerJSON = JSON.stringify(toDelBrktEntry);
        const response = await axios({
          method: "post",
          data: playerJSON,
          withCredentials: true,
          url: url,
        });
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })

    it('should delete a brktEntry by ID', async () => { 
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: oneBrktEntryUrl + toDelBrktEntry.id,
        });
        expect(response.status).toBe(200);
        didDel = true;
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it(('should NOT delete a brktEntry by ID when ID is invalid'), async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: oneBrktEntryUrl + "invalid_id",
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
    it('should NOT delete a brktEntry by ID when id is valid, bit noy a brktEntry id', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: oneBrktEntryUrl + userId,
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
    it('should NOT delete a brktEntry by ID when id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: oneBrktEntryUrl + notFoundId,
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
  })

  describe('DELETE all brktEntries for one brkt - API: /api/brktEntries/brkt/:brktId', () => { 

    let didDel = false

    beforeAll(async () => {
      await postManyBrktEntries(mockBrktEntriesToPost)
    })

    beforeEach(() => {      
      didDel = false      
    })

    afterEach(async () => {
      if (!didDel) return;
      await deleteAllBrktEntriesForTmnt(tmntIdFormMockData)      
      await postManyBrktEntries(mockBrktEntriesToPost)
    })

    afterAll(async () => {
      await deleteAllBrktEntriesForTmnt(tmntIdFormMockData)
    })

    it('should delete all brktEntries for one brkt', async () => { 
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: brktUrl + brktIdForMockData
        });
        expect(response.status).toBe(200);
        didDel = true
        expect(response.data.deleted.count).toBe(2); // 2 brktEntries deleted from mock data
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all brktEntries for one brkt when ID is invalid', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: brktUrl + 'test'
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
    it('should NOT delete all brktEntries for one brkt when ID valid, but not a brkt ID', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: brktUrl + userId
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
    it('should delete 0 brktEntries for a brkt when brkt id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: brktUrl + notFoundBrktId
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(0);
      } catch (err) {
        expect(true).toBeFalsy();
      }
    })
  })

  describe('DELETE all brktEntries for one div - API: /api/brktEntries/div/:divId', () => { 
    
    let didDel = false

    beforeAll(async () => {
      await postManyBrktEntries(mockBrktEntriesToPost)
    })

    beforeEach(() => {      
      didDel = false      
    })

    afterEach(async () => {
      if (!didDel) return;
      await deleteAllBrktEntriesForTmnt(tmntIdFormMockData)      
      await postManyBrktEntries(mockBrktEntriesToPost)
    })

    afterAll(async () => {
      await deleteAllBrktEntriesForTmnt(tmntIdFormMockData)
    })

    it('should delete all brktEntries for one div', async () => { 
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: divUrl + divIdForMockData
        });
        expect(response.status).toBe(200);
        didDel = true
        expect(response.data.deleted.count).toBe(mockBrktEntriesToPost.length);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all brktEntries for one div when ID is invalid', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: divUrl + 'test'
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
    it('should NOT delete all brktEntries for one div when ID valid, but not a div ID', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: divUrl + userId
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
    it('should delete 0 brktEntries for a div when div id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: divUrl + notFoundDivId
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(0);
      } catch (err) {
        expect(true).toBeFalsy();
      }
    })
  })

  describe('DELETE all brktEntries for one squad - API: /api/brktEntries/squad/:squadId', () => {       

    let didDel = false

    beforeAll(async () => {
      await postManyBrktEntries(mockBrktEntriesToPost)
    })

    beforeEach(() => {      
      didDel = false      
    })

    afterEach(async () => {
      if (!didDel) return;
      await deleteAllBrktEntriesForTmnt(tmntIdFormMockData)      
      await postManyBrktEntries(mockBrktEntriesToPost)
    })

    afterAll(async () => {
      await deleteAllBrktEntriesForTmnt(tmntIdFormMockData)
    })

    it('should delete all brktEntries for one squad', async () => { 
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: squadUrl + squadIdForMockData
        });
        expect(response.status).toBe(200);
        didDel = true
        expect(response.data.deleted.count).toBe(mockBrktEntriesToPost.length);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all brktEntries for one squad when ID is invalid', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: squadUrl + 'test'
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
    it('should NOT delete all brktEntries for one squad when ID valid, but not a squad ID', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: squadUrl + userId
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
    it('should delete 0 brktEntries for a squad when squad id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: squadUrl + notFoundSquadId
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(0);
      } catch (err) {
        expect(true).toBeFalsy();
      }
    })
  })

  describe('DELETE all brktEntries for one tmnt - API: /api/brktEntries/tmnt/:tmntId', () => { 
    
    let didDel = false

    beforeAll(async () => {
      await postManyBrktEntries(mockBrktEntriesToPost)
    })

    beforeEach(() => {      
      didDel = false      
    })

    afterEach(async () => {
      if (!didDel) return;
      await deleteAllBrktEntriesForTmnt(tmntIdFormMockData)      
      await postManyBrktEntries(mockBrktEntriesToPost)
    })

    afterAll(async () => {
      await deleteAllBrktEntriesForTmnt(tmntIdFormMockData)
    })

    it('should delete all brktEntries for a tmnt', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + tmntIdFormMockData
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(mockBrktEntriesToPost.length);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all brktEntries for a tmnt when tmnt id is not valid', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + 'test'
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
    it('should NOT delete all brktEntries for a tmnt when tmnt id is valid, but not a squad id', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + userId
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
    it('should delete 0 brktEntries for a tmnt when tmnt id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + notFoundTmntId
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(0);
      } catch (err) {
        expect(true).toBeFalsy();
      }
    })
  })

})