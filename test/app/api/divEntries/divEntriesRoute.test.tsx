import axios, { AxiosError } from "axios";
import { baseDivEntriesApi } from "@/lib/api/apiPaths";
import { testBaseDivEntriesApi } from "../../../testApi";
import { initDiv, initDivEntry } from "@/lib/db/initVals";
import type { HdcpForTypes } from "@/lib/types/types";
import { cloneDeep } from "lodash";
import { putDiv } from "@/lib/db/divs/dbDivs";
import { isValidBtDbId } from "@/lib/validation/validation";

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

const url = testBaseDivEntriesApi.startsWith("undefined")
  ? baseDivEntriesApi
  : testBaseDivEntriesApi; 
const oneDivEntryUrl = url + "/divEntry/";
const divUrl = url + "/div/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/"; 
const manyUrl = url + "/many";

describe("DivEntries - API's: /api/divEntries", () => { 

  const testDivEntry = {
    ...initDivEntry,    
    id: "den_0123456789abcdef0123456789abcdef",
    squad_id: 'sqd_7116ce5f80164830830a7157eb093396',
    div_id: 'div_f30aea2c534f4cfe87f4315531cef8ef',
    player_id: 'ply_bb2fd8bbd9e34d34a7fa90b4111c6e40',
    fee: '80',    
    hdcp: 0,
  }

  const div = {
    ...initDiv,
    id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    tmnt_id: "tmt_fd99387c33d9c78aba290286576ddce5",
    div_name: "Scratch",
    hdcp_per: 0,
    hdcp_from: 230,
    int_hdcp: true,
    hdcp_for: "Game" as HdcpForTypes,
    sort_order: 1,
  }

  const tmntIdForMulti = 'tmt_d9b1af944d4941f65b2d2d4ac160cdea';

  const tmntIdForDivEntries = 'tmt_fd99387c33d9c78aba290286576ddce5';
  const squadIdForDivEntries = 'sqd_7116ce5f80164830830a7157eb093396';
  
  const divEntryId1 = testDivEntry.id;
  const notFoundId = "den_01234567890123456789012345678901";
  const notFoundDivId = "div_01234567890123456789012345678901";
  const notFoundPlayerId = "ply_01234567890123456789012345678901";
  const notFoundSquadId = "sqd_01234567890123456789012345678901";
  const notFoundTmntId = "tmt_01234567890123456789012345678901";
  const userId = "usr_01234567890123456789012345678901";

  const deletePostedDivEntry = async (toDelId: string) => {
    try {
      await axios.delete(oneDivEntryUrl + toDelId, { withCredentials: true });
    } catch (err) {        
      if (err instanceof AxiosError) console.log(err.message);
    }
  }

  describe('GET', () => { 

    beforeAll(async () => {
      await deletePostedDivEntry(divEntryId1);
    })

    it('should get all divEntries', async () => {
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      // 49 rows in prisma/seed.ts
      expect(response.data.divEntries).toHaveLength(49);
    })
  })

  describe('GET one divEntry API: /api/divEntries/divEntry/:id', () => { 

    beforeAll(async () => {
      await deletePostedDivEntry(divEntryId1);
      await putDiv(div);
    })

    it('should get one divEntry by ID', async () => {
      try {
        const urlToUse = oneDivEntryUrl + testDivEntry.id;
        const response = await axios.get(urlToUse);
        expect(response.status).toBe(200);        
        const divEntry = response.data.divEntry;
        expect(divEntry.id).toEqual(testDivEntry.id);
        expect(divEntry.squad_id).toEqual(testDivEntry.squad_id);
        expect(divEntry.div_id).toEqual(testDivEntry.div_id);
        expect(divEntry.player_id).toEqual(testDivEntry.player_id);
        expect(divEntry.fee + '').toEqual(testDivEntry.fee);
        // expect(divEntry.hdcp).toEqual(testDivEntry.hdcp);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })        
    it('should not get one divEntry by ID when id is invalid', async () => {
      try {
        const response = await axios.get(oneDivEntryUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get one divEntry by ID when id is valid, but not a divEntry id', async () => {
      try {
        const response = await axios.get(oneDivEntryUrl + userId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get one divEntry by ID when id is not found', async () => {
      try {
        const response = await axios.get(oneDivEntryUrl + notFoundId);
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

  describe('GET all divEntries for one div API: /api/divEntries/div/:divId', () => { 

    beforeAll(async () => {
      await deletePostedDivEntry(divEntryId1);
      await putDiv(div);
    })

    it('should get all divEntries for one div', async () => { 
      const response = await axios.get(divUrl + testDivEntry.div_id);
      expect(response.status).toBe(200);        
      const divEntries = response.data.divEntries;
      expect(divEntries).toHaveLength(4); // 4 divEntries for div in prisma/seeds.ts
      for (let i = 0; i < divEntries.length; i++) {
        expect(divEntries[i].div_id).toEqual(testDivEntry.div_id);       
        expect(divEntries[i].squad_id).toEqual(testDivEntry.squad_id);
        expect(divEntries[i].fee).toEqual('80');
        expect(isValidBtDbId(divEntries[i].player_id, 'ply')).toBe(true); 
        expect(divEntries[i].player).not.toBeNull();
        expect(divEntries[i].player).not.toBeUndefined();
      }      
    })
    it('should not get all divEntries for one div when divId is not found', async () => {
      const response = await axios.get(divUrl + notFoundDivId);
      expect(response.status).toBe(200);
      const divEntries = response.data.divEntries;
      expect(divEntries).toHaveLength(0);
    })          
    it('should not get all divEntries for one div when divId is invalid', async () => {
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
    it('should not get all divEntries for one div when divId is valid, but not a div id', async () => {
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

  })

  describe('GET all divEntries for one squad API: /api/divEntries/squad/:squadId', () => { 

    beforeAll(async () => {
      await deletePostedDivEntry(divEntryId1);
      await putDiv(div);
    })

    it('should get all divEntries for one squad', async () => { 
      const response = await axios.get(squadUrl + squadIdForDivEntries);
      expect(response.status).toBe(200);        
      const divEntries = response.data.divEntries;
      expect(divEntries).toHaveLength(4); // 4 divEntries for squad is prisma/seeds.ts
      for (let i = 0; i < divEntries.length; i++) {
        expect(divEntries[i].div_id).toEqual(testDivEntry.div_id);
      }      
    })
    it('should not get all divEntries for one squad when squadId is not found', async () => {
      const response = await axios.get(squadUrl + notFoundSquadId);
      expect(response.status).toBe(200);
      const divEntries = response.data.divEntries;
      expect(divEntries).toHaveLength(0);
    })          
    it('should not get all divEntries for one squad when squadId is invalid', async () => {
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
    it('should not get all divEntries for one squad when squadId is valid, but not a div id', async () => {
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
    
  })

  describe('GET all divEntries for one tmnt API: /api/divEntries/tmnt/:tmntId', () => { 

    beforeAll(async () => {
      await deletePostedDivEntry(divEntryId1);
      await putDiv(div);
    })

    it('should get all divEntries for one tmnt', async () => { 
      const response = await axios.get(tmntUrl + tmntIdForDivEntries);
      expect(response.status).toBe(200);        
      const divEntries = response.data.divEntries;
      expect(divEntries).toHaveLength(4); // 4 divEntries for tmnt is prisma/seeds.ts
      for (let i = 0; i < divEntries.length; i++) {
        expect(divEntries[i].div_id).toEqual(testDivEntry.div_id);
      }      
    })
    it('should not get all divEntries for one tmnt when tmntId is not found', async () => {        
      const response = await axios.get(tmntUrl + notFoundTmntId);
      expect(response.status).toBe(200);
      const divEntries = response.data.divEntries;
      expect(divEntries).toHaveLength(0);
    })          
    it('should not get all divEntries for one tmnt when tmntId is invalid', async () => {
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
    it('should not get all divEntries for one tmnt when tmntId is valid, but not a div id', async () => {
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
    
  })

  describe('POST one divEntry API: /api/divEntries', () => { 
    
    const divEntryToPost = cloneDeep(testDivEntry);

    let createdDivEntry = false;

    beforeAll(async () => {
      await deletePostedDivEntry(divEntryId1);
    })

    beforeEach(() => {
      createdDivEntry = false;
    })

    afterEach(async () => {
      if (createdDivEntry) {
        await deletePostedDivEntry(divEntryId1);
      }      
    })

    it('should post one divEntry', async () => {
      const divEntryJSON = JSON.stringify(divEntryToPost);
      const response = await axios.post(url, divEntryJSON, {
        withCredentials: true
      });      
      expect(response.status).toBe(201);
      createdDivEntry = true;
      const divEntry = response.data.divEntry;
      expect(divEntry.id).toEqual(divEntryToPost.id);
      expect(divEntry.squad_id).toEqual(divEntryToPost.squad_id);
      expect(divEntry.div_id).toEqual(divEntryToPost.div_id);
      expect(divEntry.player_id).toEqual(divEntryToPost.player_id);
      expect(divEntry.fee).toEqual(divEntryToPost.fee);
    })
    it('should post one divEntry when fee is blank, sanitized to 0', async () => {
      const toSanitize = {
        ...divEntryToPost,
        fee: ''
      }
      const divEntryJSON = JSON.stringify(toSanitize);
      const response = await axios.post(url, divEntryJSON, {
        withCredentials: true
      });      
      expect(response.status).toBe(201);
      createdDivEntry = true;
      const divEntry = response.data.divEntry;
      expect(divEntry.id).toEqual(divEntryToPost.id);
      expect(divEntry.squad_id).toEqual(divEntryToPost.squad_id);
      expect(divEntry.div_id).toEqual(divEntryToPost.div_id);
      expect(divEntry.player_id).toEqual(divEntryToPost.player_id);
      expect(divEntry.fee).toEqual('0');
    })
    it('should NOT post a sanitized divEntry (saninted fee = "")', async () => { 
      const toSanitize = {
        ...divEntryToPost,
        fee: '   83  ',        
      }
      const invalidJSON = JSON.stringify(toSanitize);
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
    it('should not post one divEntry when id is blank', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        id: ''
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should not post one divEntry when squad_id is blank', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        squad_id: ''
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should not post one divEntry when div_id is blank', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        div_id: ''
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should not post one divEntry when player_id is blank', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        player_id: ''
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should not post one divEntry when id is invalid', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        id: 'test'
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should not post one divEntry when id is valid, but not a divEntry id', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        id: userId
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should not post one divEntry when squad_id is invalid', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        squad_id: 'test'
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should not post one divEntry when squad_id is valid, but not a squad id', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        squad_id: userId
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should not post one divEntry when div_id is invalid', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        div_id: 'test'
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should not post one divEntry when div_id is valid, bit not a div id', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        div_id: userId
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should not post one divEntry when player_id is invalid', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        player_id: 'test'
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should not post one divEntry when player_id is valid, but not a player id', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        player_id: userId
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should not post one divEntry when fee is too low', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        fee: '-1'
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should not post one divEntry when fee is too high', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        fee: '1234567890'
      } 
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
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

  describe('PUT one divEntry API: /api/divEntries/divEntry/:id', () => { 

    const resetDivEntry = async () => {
      // make sure test div entry is reset in database
      const divEntryJSON = JSON.stringify(testDivEntry);
      await axios.put(oneDivEntryUrl + testDivEntry.id, divEntryJSON, {
        withCredentials: true
      });
    }

    const putDivEntry = {
      ...testDivEntry,
      squad_id: 'sqd_1a6c885ee19a49489960389193e8f819',
      div_id: 'div_99a3cae28786485bb7a036935f0f6a0a',
      player_id: 'ply_8b0fd8bbd9e34d34a7fa90b4111c6e40',
      fee: '83'
    }

    let didPut = false;

    beforeAll(async () => {
      await deletePostedDivEntry(putDivEntry.id);
      const divEntryJSON = JSON.stringify(putDivEntry);
      await axios.post(url, divEntryJSON, {
        withCredentials: true
      })
    })

    beforeEach(() => {
      didPut = false;
    })

    afterEach(async () => {
      if (didPut) {        
        await resetDivEntry()
      }      
    })

    afterAll(async () => {
      await deletePostedDivEntry(putDivEntry.id);
    })

    it('should update a divEntry by ID', async () => {
      const divEntryJSON = JSON.stringify(putDivEntry);
      const response = await axios.put(oneDivEntryUrl + testDivEntry.id, divEntryJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPut = true;
      const puttedDivEntry = response.data.divEntry;
      // did not update squad_id
      expect(puttedDivEntry.squad_id).toBe(putDivEntry.squad_id);
      expect(puttedDivEntry.div_id).toBe(putDivEntry.div_id);
      expect(puttedDivEntry.player_id).toBe(putDivEntry.player_id);
      expect(puttedDivEntry.fee).toBe(putDivEntry.fee);
    })
    it('should update a sanitized divEntry by ID', async () => { 
      const toSanitize = {
        ...putDivEntry,
        fee: '83.000',
      }
      const divEntryJSON = JSON.stringify(toSanitize);
      const response = await axios.put(oneDivEntryUrl + testDivEntry.id, divEntryJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPut = true;
      const puttedDivEntry = response.data.divEntry;
      expect(puttedDivEntry.squad_id).toBe(putDivEntry.squad_id);
      expect(puttedDivEntry.div_id).toBe(putDivEntry.div_id);
      expect(puttedDivEntry.player_id).toBe(putDivEntry.player_id);
      expect(puttedDivEntry.fee).toBe(putDivEntry.fee);
    })
    it('should update a divEntry by ID when fee is blank, sanitized to 0', async () => {
      const toSanitize = {
        ...putDivEntry,
        fee: ''
      }
      const divEntryJSON = JSON.stringify(toSanitize);
      const response = await axios.put(oneDivEntryUrl + testDivEntry.id, divEntryJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPut = true;
      const puttedDivEntry = response.data.divEntry;
      expect(puttedDivEntry.squad_id).toBe(putDivEntry.squad_id);
      expect(puttedDivEntry.div_id).toBe(putDivEntry.div_id);
      expect(puttedDivEntry.player_id).toBe(putDivEntry.player_id);
      expect(puttedDivEntry.fee).toBe('0');
    })
    it('should not update a divEntry by ID when squad_id is blank', async () => {
      const invalidDivEntry = {
        ...putDivEntry,
        squad_id: ''
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.put(oneDivEntryUrl + testDivEntry.id, invalidJSON, {
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
    it('should not update a divEntry by ID when div_id is blank', async () => {
      const invalidDivEntry = {
        ...putDivEntry,
        div_id: ''
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.put(oneDivEntryUrl + testDivEntry.id, invalidJSON, {
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
    it('should not update a divEntry by ID when player_id is blank', async () => {
      const invalidDivEntry = {
        ...putDivEntry,
        player_id: ''
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.put(oneDivEntryUrl + testDivEntry.id, invalidJSON, {
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
    it('should not update a divEntry by ID when fee is too low', async () => {
      const invalidDivEntry = {
        ...putDivEntry,
        fee: '-1'
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.put(oneDivEntryUrl + testDivEntry.id, invalidJSON, {
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
    it('should not update a divEntry by ID when fee is too high', async () => {
      const invalidDivEntry = {
        ...putDivEntry,
        fee: '1234567890'
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.put(oneDivEntryUrl + testDivEntry.id, invalidJSON, {
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
    it('should not update a divEntry by ID when fee is not a number', async () => {
      const invalidDivEntry = {
        ...putDivEntry,
        fee: 'not a number'
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.put(oneDivEntryUrl + testDivEntry.id, invalidJSON, {
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

  describe('PATCH one divEntry API: /api/divEntries/divEntry/:id', () => { 

    const toPatch = {
      id: testDivEntry.id,
    }
    
    const doResetDivEntry = async () => {
      try {
        const divEntryJSON = JSON.stringify(testDivEntry);
        await axios.put(oneDivEntryUrl + testDivEntry.id, divEntryJSON, {
          withCredentials: true
        });
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }

    let didPatch = false;

    beforeAll(async () => {
      await deletePostedDivEntry(testDivEntry.id);
      const divEntryJSON = JSON.stringify(testDivEntry);
      await axios.post(url, divEntryJSON, {
        withCredentials: true
      })
    })

    beforeEach(() => {
      didPatch = false;
    })

    afterEach(async () => {
      if (didPatch) {
        await doResetDivEntry();
      }
    })

    afterAll(async () => {
      await deletePostedDivEntry(testDivEntry.id);
    })

    it('should patch squad_id in a divEntry by ID', async () => { 
      const toPatchSquadId = 'sqd_1a6c885ee19a49489960389193e8f819'
      const patchDivEntry = {
        ...toPatch,
        squad_id: toPatchSquadId,
      }
      const divEntryJSON = JSON.stringify(patchDivEntry);
      const response = await axios.patch(oneDivEntryUrl + toPatch.id, divEntryJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedDivEntry = response.data.divEntry;
      expect(patchedDivEntry.id).toBe(toPatch.id);
      expect(patchedDivEntry.squad_id).toBe(toPatchSquadId);
    })
    it('should patch div_id in a divEntry by ID', async () => { 
      const toPatchedDivId = 'div_99a3cae28786485bb7a036935f0f6a0a'
      const patchDivEntry = {
        ...toPatch,
        div_id: toPatchedDivId,
      }
      const divEntryJSON = JSON.stringify(patchDivEntry);
      const response = await axios.patch(oneDivEntryUrl + toPatch.id, divEntryJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedDivEntry = response.data.divEntry;
      expect(patchedDivEntry.id).toBe(toPatch.id);
      expect(patchedDivEntry.div_id).toBe(toPatchedDivId);      
    })
    it('should patch player_id in a divEntry by ID', async () => { 
      const toPatchedPlayerId = 'ply_a01758cff1cc4bab9d9133e661bd49b0'
      const patchDivEntry = {
        ...toPatch,
        player_id: toPatchedPlayerId,
      }
      const divEntryJSON = JSON.stringify(patchDivEntry);
      const response = await axios.patch(oneDivEntryUrl + toPatch.id, divEntryJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedDivEntry = response.data.divEntry;
      expect(patchedDivEntry.id).toBe(toPatch.id);
      expect(patchedDivEntry.player_id).toBe(toPatchedPlayerId);      
    })      
    it('should patch fee in a divEntry by ID', async () => { 
      const toPatchedFee = '83'
      const patchDivEntry = {
        ...toPatch,
        fee: toPatchedFee,
      }
      const divEntryJSON = JSON.stringify(patchDivEntry);
      const response = await axios.patch(oneDivEntryUrl + toPatch.id, divEntryJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedDivEntry = response.data.divEntry;
      expect(patchedDivEntry.id).toBe(toPatch.id);
      expect(patchedDivEntry.fee).toBe(toPatchedFee);      
    })
    it('should patch a divEntry by ID when fee is blank, sanitized to 0', async () => {
      const toSanitize = {
        ...toPatch,
        fee: ''
      } 
      const divEntryJSON = JSON.stringify(toSanitize);
      const response = await axios.patch(oneDivEntryUrl + toPatch.id, divEntryJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedDivEntry = response.data.divEntry;
      expect(patchedDivEntry.id).toBe(toPatch.id);
      expect(patchedDivEntry.fee).toBe('0');            
    })
    it('should patch a divEntry by ID when fee is blank, sanitized to 0', async () => {
      const toPatchedFee = {
        ...toPatch,
        fee: ''
      } 
      const divEntryJSON = JSON.stringify(toPatchedFee);
      const response = await axios.patch(oneDivEntryUrl + toPatch.id, divEntryJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedDivEntry = response.data.divEntry;
      expect(patchedDivEntry.id).toBe(toPatch.id);
      expect(patchedDivEntry.fee).toBe('0');            
    })
    it('should not patch a divEntry by ID when squad_id is blank', async () => {
      const invalidDivEntry = {
        ...toPatch,
        squad_id: ''
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.patch(oneDivEntryUrl + toPatch.id, invalidJSON, {
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
    it('should not patch a divEntry by ID when squad_id is invalid', async () => {
      const invalidDivEntry = {
        ...toPatch,
        squad_id: 'test'
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.patch(oneDivEntryUrl + toPatch.id, invalidJSON, {
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
    it('should not patch a divEntry by ID when div_id is blank', async () => {
      const invalidDivEntry = {
        ...toPatch,
        div_id: ''
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.patch(oneDivEntryUrl + toPatch.id, invalidJSON, {
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
    it('should not patch a divEntry by ID when div_id is valid, but not a div id', async () => { 
      const invalidDivEntry = {
        ...toPatch,
        div_id: userId
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.patch(oneDivEntryUrl + toPatch.id, invalidJSON, {
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
    it('should not patch a divEntry by ID when div_id is invalid', async () => {
      const invalidDivEntry = {
        ...toPatch,
        div_id: 'test'
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.patch(oneDivEntryUrl + toPatch.id, invalidJSON, {
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
    it('should not patch a divEntry by ID when div_id is valid, but not a div id', async () => { 
      const invalidDivEntry = {
        ...toPatch,
        div_id: userId
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.patch(oneDivEntryUrl + toPatch.id, invalidJSON, {
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
    it('should not patch a divEntry by ID when player_id is blank', async () => {
      const invalidDivEntry = {
        ...toPatch,
        player_id: ''
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.patch(oneDivEntryUrl + toPatch.id, invalidJSON, {
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
    it('should not patch a divEntry by ID when player_id is invalid', async () => {
      const invalidDivEntry = {
        ...toPatch,
        player_id: 'test'
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.patch(oneDivEntryUrl + toPatch.id, invalidJSON, {
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
    it('should not patch a divEntry by ID when player_id is valid, but not a player id', async () => { 
      const invalidDivEntry = {
        ...toPatch,
        player_id: userId
      }
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.patch(oneDivEntryUrl + toPatch.id, invalidJSON, {
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
    it('should not patch a divEntry by ID when fee is too low', async () => {
      const invalidDivEntry = {
        ...toPatch,
        fee: '-1'
      } 
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.patch(oneDivEntryUrl + toPatch.id, invalidJSON, {
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
    it('should not patch a divEntry by ID when fee is too high', async () => {
      const invalidDivEntry = {
        ...toPatch,
        fee: '1234567890'
      } 
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.patch(oneDivEntryUrl + toPatch.id, invalidJSON, {
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
    it('should not patch a divEntry by ID when fee is not a number', async () => {
      const invalidDivEntry = {
        ...toPatch,
        fee: 'abc'
      } 
      const invalidJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios.patch(oneDivEntryUrl + toPatch.id, invalidJSON, {
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

  describe('DELETE by ID - API: /api/divEntries/divEntry/:id', () => { 

    // from prisma/seeds.ts
    const toDelDivEntry = {
      ...initDivEntry,
      id: "den_a55c6cd27d1b482aa0ff248d5fb496ed",
      squad_id: "sqd_bb2de887bf274242af5d867476b029b8",
      div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
      player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
      fee: '80',
    }

    let didDel = false

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      // if deleted event, add event back
      try {
        const divEntryJSON = JSON.stringify(toDelDivEntry);
        await axios.post(url, divEntryJSON, {
          withCredentials: true
        })
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })

    it('should delete a divEntry by ID', async () => { 
      try {
        const response = await axios.delete(oneDivEntryUrl + toDelDivEntry.id, {
          withCredentials: true
        })
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
    it(('should NOT delete a divEntry by ID when ID is invalid'), async () => {
      try {
        const response = await axios.delete(oneDivEntryUrl + "invalid_id", {
          withCredentials: true
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
    it('should NOT delete a divEntry by ID when id is valid, bit noy a divEntry id', async () => {
      try {
        const response = await axios.delete(oneDivEntryUrl + userId, {
          withCredentials: true
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
    it('should NOT delete a divEntry by ID when id is not found', async () => {
      try {
        const response = await axios.delete(oneDivEntryUrl + notFoundId, {
          withCredentials: true
        })        
        expect(response.status).toBe(200);
        expect(response.data.count).toBe(0);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(200);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
  })

})