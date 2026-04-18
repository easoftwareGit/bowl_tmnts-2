import axios, { AxiosError } from "axios";
import { baseElimEntriesApi } from "@/lib/api/apiPaths";
import { testBaseElimEntriesApi } from "../../../testApi";
import { initElimEntry } from "@/lib/db/initVals";
import type { elimEntryType } from "@/lib/types/types";

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
const url = process.env.NODE_ENV === "test" && testBaseElimEntriesApi
  ? testBaseElimEntriesApi
  : baseElimEntriesApi;

const oneElimEntryUrl = url + "/elimEntry/";
const elimUrl = url + "/elim/";
const divUrl = url + "/div/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/"; 

describe("ElimEntries - API's: /api/elimEntries", () => { 

  const testElimEntry = {
    ...initElimEntry,
    id: "een_23d6f8f1de844604a8828d4bb8a5a910",
    elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    fee: '5',
  }

  const elimEntryToPost: elimEntryType = {
    ...initElimEntry,
    id: 'een_1234567890abcdef1234567890abcdef',
    elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
    player_id: 'ply_bb0fd8bbd9e34d34a7fa90b4111c6e40',
    fee: '3'
  }

  const tmntIdForElimEntries = 'tmt_fd99387c33d9c78aba290286576ddce5';
  const squadIdForElimEntries = 'sqd_7116ce5f80164830830a7157eb093396';
  const divIdForElimEntries = 'div_f30aea2c534f4cfe87f4315531cef8ef';
  const elimIdForElimEntries = 'elm_45d884582e7042bb95b4818ccdd9974c';

  const notFoundId = "een_01234567890123456789012345678901";
  const notFoundElimId = "elm_01234567890123456789012345678901";
  const notFoundDivId = "div_01234567890123456789012345678901";
  const notFoundSquadId = "sqd_01234567890123456789012345678901";
  const notFoundTmntId = "tmt_01234567890123456789012345678901";
  const userId = "usr_01234567890123456789012345678901";

  const elim1Id = 'elm_45d884582e7042bb95b4818ccdd9974c';
  const elim2Id = 'elm_9d01015272b54962a375cf3c91007a12';

  const deletePostedElimEntry = async () => {
    try {
      await axios.delete(oneElimEntryUrl + elimEntryToPost.id, {withCredentials: true});
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  }

  describe('GET', () => { 

    beforeAll(async () => {
      await deletePostedElimEntry();
    })

    it('should get all elimEntries', async () => {
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      // 45 rows in prisma/seed.ts
      expect(response.data.elimEntries).toHaveLength(45);
    })
  })

  describe('GET one elimEntry API: /api/elimEntries/elimEntry/:id', () => {

    it('should get one elimEntry by ID', async () => {
      try {
        const urlToUse = oneElimEntryUrl + testElimEntry.id;
        const response = await axios.get(urlToUse);
        expect(response.status).toBe(200);
        const elimEntry = response.data.elimEntry;
        expect(elimEntry.id).toEqual(testElimEntry.id);
        expect(elimEntry.elim_id).toEqual(testElimEntry.elim_id);
        expect(elimEntry.player_id).toEqual(testElimEntry.player_id);
        expect(elimEntry.fee).toEqual(testElimEntry.fee);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get one elimEntry by ID when id is invalid', async () => {
      try {
        const response = await axios.get(oneElimEntryUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get one elimEntry by ID when id is valid, but not a elimEntry id', async () => {
      try {
        const response = await axios.get(oneElimEntryUrl + userId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get one elimEntry by ID when id is not found', async () => {
      try {
        const response = await axios.get(oneElimEntryUrl + notFoundId);
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

  describe('GET all elimEntries for one div API: /api/elimEntries/div/:divId', () => {

    beforeAll(async () => {
      await deletePostedElimEntry();
    })

    it('should get all elimEntries for one div', async () => {
      const response = await axios.get(divUrl + divIdForElimEntries);
      expect(response.status).toBe(200);
      const elimEntries = response.data.elimEntries;
      expect(elimEntries).toHaveLength(4); // 4 elimEntries for div in prisma/seeds.ts
      for (let i = 0; i < elimEntries.length; i++) {
        expect(elimEntries[i].elim_id === elim1Id || elimEntries[i].elim_id === elim2Id).toBeTruthy();
      }
    })
    it('should not get all elimEntries for one div when divId is invalid', async () => {
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
    it('should not get all elimEntries for one div when divId is valid, but not a div id', async () => {
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
    it('should not get all elimEntries for one div when divId is not found', async () => {
      const response = await axios.get(divUrl + notFoundDivId);
      expect(response.status).toBe(200);
      const elimEntries = response.data.elimEntries;
      expect(elimEntries).toHaveLength(0);
    })
  })

  describe('GET all elimEntries for one squad API: /api/elimEntries/squad/:squadId', () => {

    beforeAll(async () => {
      await deletePostedElimEntry();
    })

    it('should get all elimEntries for one squad', async () => {
      const response = await axios.get(squadUrl + squadIdForElimEntries);
      expect(response.status).toBe(200);
      const elimEntries = response.data.elimEntries;
      expect(elimEntries).toHaveLength(4); // 4 elimEntries for squad in prisma/seeds.ts
      for (let i = 0; i < elimEntries.length; i++) {
        expect(elimEntries[i].elim_id === elim1Id || elimEntries[i].elim_id === elim2Id).toBeTruthy();
      }
    })
    it('should not get all elimEntries for one squad when squadId is invalid', async () => {
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
    it('should not get all elimEntries for one squad when squadId is valid, but not a div id', async () => {
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
    it('should not get all elimEntries for one squad when squadId is not found', async () => {
      const response = await axios.get(squadUrl + notFoundSquadId);
      expect(response.status).toBe(200);
      const elimEntries = response.data.elimEntries;
      expect(elimEntries).toHaveLength(0);
    })
  })

  describe('GET all elimEntries for one brkt API: /api/elimEntries/brkt/:brktId', () => {

    beforeAll(async () => {
      await deletePostedElimEntry();
    })

    it('should get all elimEntries for one brkt', async () => {
      const response = await axios.get(elimUrl + elimIdForElimEntries);
      expect(response.status).toBe(200);
      const elimEntries = response.data.elimEntries;
      expect(elimEntries).toHaveLength(2); // 2 elimEntries for brkt in prisma/seeds.ts
      for (let i = 0; i < elimEntries.length; i++) {
        expect(elimEntries[i].elim_id).toBe(elimIdForElimEntries);
      }
    })
    it('should not get all elimEntries for one brkt when brktId is invalid', async () => {
      try {
        const response = await axios.get(elimUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get all elimEntries for one brkt when brktId is valid, but not a div id', async () => {
      try {
        const response = await axios.get(elimUrl + userId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get all elimEntries for one brkt when brktId is not found', async () => {
      const response = await axios.get(elimUrl + notFoundElimId);
      expect(response.status).toBe(200);
      const elimEntries = response.data.elimEntries;
      expect(elimEntries).toHaveLength(0);
    })
  })

  describe('GET all elimEntries for one tmnt API: /api/elimEntries/tmnt/:tmntId', () => {

    beforeAll(async () => {
      await deletePostedElimEntry();
    })

    it('should get all elimEntries for one tmnt', async () => {
      const response = await axios.get(tmntUrl + tmntIdForElimEntries);
      expect(response.status).toBe(200);
      const elimEntries = response.data.elimEntries;
      expect(elimEntries).toHaveLength(4); // 4 elimEntries for tmnt in prisma/seeds.ts
      for (let i = 0; i < elimEntries.length; i++) {
        expect(elimEntries[i].elim_id === elim1Id || elimEntries[i].elim_id === elim2Id).toBeTruthy();
      }
    })
    it('should not get all elimEntries for one tmnt when tmntId is invalid', async () => {
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
    it('should not get all elimEntries for one tmnt when tmntId is valid, but not a div id', async () => {
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
    it('should not get all elimEntries for one tmnt when tmntId is not found', async () => {
      const response = await axios.get(tmntUrl + notFoundTmntId);
      expect(response.status).toBe(200);
      const elimEntries = response.data.elimEntries;
      expect(elimEntries).toHaveLength(0);
    })
  })

  describe('POST one elimEntry API: /api/elimEntries', () => {
    
    let createdElimEntry = false;

    beforeAll(async () => {
      await deletePostedElimEntry();
    })

    beforeEach(() => {
      createdElimEntry = false;
    })

    afterEach(async () => {
      if (createdElimEntry) {
        await deletePostedElimEntry();
      }
    })

    afterAll(async () => {
      await deletePostedElimEntry();
    })

    it('should post one elimEntry', async () => {
      const elimEntryJSON = JSON.stringify(elimEntryToPost);
      const response = await axios.post(url, elimEntryJSON, { withCredentials: true });
      expect(response.status).toBe(201);
      createdElimEntry = true;
      const elimEntry = response.data.elimEntry;
      expect(elimEntry.id).toEqual(elimEntryToPost.id);
      expect(elimEntry.elim_id).toEqual(elimEntryToPost.elim_id);
      expect(elimEntry.player_id).toEqual(elimEntryToPost.player_id);
      expect(elimEntry.fee).toEqual(elimEntryToPost.fee);
    })
    it('should NOT post a sanitized elimEntry (saninted fee = "")', async () => {
      const toSanitize = {
        ...elimEntryToPost,
        fee: '   3  ',
      }
      const elimEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios.post(url, elimEntryJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post one elimEntry when id is blank', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        id: ''
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post one elimEntry when elim_id is blank', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        elim_id: ''
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post one elimEntry when player_id is blank', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        player_id: ''
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post one elimEntry when fee is blank', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        fee: ''
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post one elimEntry when id is invalid', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        id: 'test'
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post one elimEntry when id is valid, but not a elimEntry id', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        id: userId
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post one elimEntry when elim_id is invalid', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        elim_id: 'test'
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post one elimEntry when elim_id is valid, bit not a elim id', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        elim_id: userId
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post one elimEntry when player_id is invalid', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        player_id: 'test'
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post one elimEntry when player_id is valid, but not a player id', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        player_id: userId
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post one elimEntry when fee is too low', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        fee: '-1'
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post one elimEntry when fee is too high', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        fee: '1234567890'
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
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

  describe('PUT one elimEntry API: /api/elimEntries/elimEntry/:id', () => { 

    const resetElimEntry = async () => {
      // make sure test player is reset in database
      const elimEntryJSON = JSON.stringify(testElimEntry);
      await axios.put(oneElimEntryUrl + testElimEntry.id, elimEntryJSON, {
        withCredentials: true
      });
    }

    const putElimEntry = {
      ...testElimEntry,      
      elim_id: 'elm_c47a4ec07f824b0e93169ae78e8b4b1e',
      player_id: 'ply_8b0fd8bbd9e34d34a7fa90b4111c6e40',      
      fee: '3'
    }

    let didPut = false;

    beforeAll(async () => {
      await resetElimEntry()
    })

    beforeEach(() => {
      didPut = false;
    })

    afterEach(async () => {
      if (didPut) {        
        await resetElimEntry()
      }      
    })

    it('should update a elimEntry by ID', async () => {
      const elimEntryJSON = JSON.stringify(putElimEntry);
      const response = await axios.put(oneElimEntryUrl + testElimEntry.id, elimEntryJSON, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      didPut = true;
      const puttedElimEntry = response.data.elimEntry;
      // did not update squad_id      
      expect(puttedElimEntry.elim_id).toBe(putElimEntry.elim_id);
      expect(puttedElimEntry.player_id).toBe(putElimEntry.player_id);      
      expect(puttedElimEntry.fee).toBe(putElimEntry.fee);
    })
    it('should update a sanitized elimEntry by ID', async () => { 
      const toSanitize = {
        ...putElimEntry,
        fee: '3.000',
      }
      const elimEntryJSON = JSON.stringify(toSanitize);
      const response = await axios.put(oneElimEntryUrl + testElimEntry.id, elimEntryJSON, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      didPut = true;
      const puttedElimEntry = response.data.elimEntry;      
      expect(puttedElimEntry.elim_id).toBe(putElimEntry.elim_id);
      expect(puttedElimEntry.player_id).toBe(putElimEntry.player_id);
      expect(puttedElimEntry.fee).toBe(putElimEntry.fee);
    })
    it('should not update a elimEntry by ID when elim_id is blank', async () => {
      const invalidElimEntry = {
        ...putElimEntry,
        elim_id: ''
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.put(oneElimEntryUrl + testElimEntry.id, invalidJSON, {
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
    it('should not update a elimEntry by ID when player_id is blank', async () => {
      const invalidElimEntry = {
        ...putElimEntry,
        player_id: ''
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.put(oneElimEntryUrl + testElimEntry.id, invalidJSON, {
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
    it('should not update a elimEntry by ID when fee is blank', async () => {
      const invalidElimEntry = {
        ...putElimEntry,
        fee: ''
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.put(oneElimEntryUrl + testElimEntry.id, invalidJSON, {
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
    it('should not update a elimEntry by ID when fee is too low', async () => {
      const invalidElimEntry = {
        ...putElimEntry,
        fee: '-1'
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.put(oneElimEntryUrl + testElimEntry.id, invalidJSON, {
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
    it('should not update a elimEntry by ID when fee is too high', async () => {
      const invalidElimEntry = {
        ...putElimEntry,
        fee: '1234567890'
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.put(oneElimEntryUrl + testElimEntry.id, invalidJSON, {
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
    it('should not update a elimEntry by ID when fee is not a number', async () => {
      const invalidElimEntry = {
        ...putElimEntry,
        fee: 'not a number'
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.put(oneElimEntryUrl + testElimEntry.id, invalidJSON, {
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

  describe('PATCH one elimEntry API: /api/elimEntries/elimEntry/:id', () => { 

    const toPatch = {
      id: testElimEntry.id,
    }
    
    const doResetElimEntry = async () => {
      try {
        const playerJSON = JSON.stringify(testElimEntry);
        await axios.patch(oneElimEntryUrl + testElimEntry.id, playerJSON, {
          withCredentials: true
        })
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }

    let didPatch = false;

    beforeAll(async () => {
      await doResetElimEntry();
    })

    beforeEach(() => {
      didPatch = false;
    })

    afterEach(async () => {
      if (didPatch) {
        await doResetElimEntry();
      }
    })

    it('should patch elim_id in a elimEntry by ID', async () => { 
      const toPatchedElimId = 'elm_c47a4ec07f824b0e93169ae78e8b4b1e'
      const patchElimEntry = {
        ...toPatch,
        elim_id: toPatchedElimId,
      }
      const elimEntryJSON = JSON.stringify(patchElimEntry);
      const response = await axios.patch(oneElimEntryUrl + toPatch.id, elimEntryJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedElimEntry = response.data.elimEntry;
      expect(patchedElimEntry.id).toBe(toPatch.id);
      expect(patchedElimEntry.elim_id).toBe(toPatchedElimId);      
    })
    it('should patch player_id in a elimEntry by ID', async () => { 
      const toPatchedPlayerId = 'ply_a01758cff1cc4bab9d9133e661bd49b0'
      const patchElimEntry = {
        ...toPatch,
        player_id: toPatchedPlayerId,
      }
      const elimEntryJSON = JSON.stringify(patchElimEntry);
      const response = await axios.patch(oneElimEntryUrl + toPatch.id, elimEntryJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedElimEntry = response.data.elimEntry;
      expect(patchedElimEntry.id).toBe(toPatch.id);
      expect(patchedElimEntry.player_id).toBe(toPatchedPlayerId);      
    })      
    it('should patch fee in a elimEntry by ID', async () => { 
      const toPatchedFee = '3'
      const patchElimEntry = {
        ...toPatch,
        fee: toPatchedFee,
      }
      const elimEntryJSON = JSON.stringify(patchElimEntry);
      const response = await axios.patch(oneElimEntryUrl + toPatch.id, elimEntryJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedElimEntry = response.data.elimEntry;
      expect(patchedElimEntry.id).toBe(toPatch.id);
      expect(patchedElimEntry.fee).toBe(toPatchedFee);      
    })
    it('should not patch a elimEntry by ID when elim_id is blank', async () => {
      const invalidElimEntry = {
        ...toPatch,
        elim_id: ''
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.patch(oneElimEntryUrl + toPatch.id, invalidJSON, {
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
    it('should not patch a elimEntry by ID when elim_id is valid, but not a div id', async () => { 
      const invalidElimEntry = {
        ...toPatch,
        elim_id: userId
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.patch(oneElimEntryUrl + toPatch.id, invalidJSON, {
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
    it('should not patch a elimEntry by ID when elim_id is invalid', async () => {
      const invalidElimEntry = {
        ...toPatch,
        elim_id: 'test'
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.patch(oneElimEntryUrl + toPatch.id, invalidJSON, {
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
    it('should not patch a elimEntry by ID when elim_id is valid, but not a div id', async () => { 
      const invalidElimEntry = {
        ...toPatch,
        elim_id: userId
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.patch(oneElimEntryUrl + toPatch.id, invalidJSON, {
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
    it('should not patch a elimEntry by ID when player_id is blank', async () => {
      const invalidElimEntry = {
        ...toPatch,
        player_id: ''
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.patch(oneElimEntryUrl + toPatch.id, invalidJSON, {
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
    it('should not patch a elimEntry by ID when player_id is invalid', async () => {
      const invalidElimEntry = {
        ...toPatch,
        player_id: 'test'
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.patch(oneElimEntryUrl + toPatch.id, invalidJSON, {
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
    it('should not patch a elimEntry by ID when player_id is valid, but not a player id', async () => { 
      const invalidElimEntry = {
        ...toPatch,
        player_id: userId
      }
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.patch(oneElimEntryUrl + toPatch.id, invalidJSON, {
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
    it('should not patch a elimEntry by ID when fee is blank', async () => {
      const invalidElimEntry = {
        ...toPatch,
        fee: ''
      } 
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.patch(oneElimEntryUrl + toPatch.id, invalidJSON, {
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
    it('should not patch a elimEntry by ID when fee is too low', async () => {
      const invalidElimEntry = {
        ...toPatch,
        fee: '-1'
      } 
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.patch(oneElimEntryUrl + toPatch.id, invalidJSON, {
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
    it('should not patch a elimEntry by ID when fee is too high', async () => {
      const invalidElimEntry = {
        ...toPatch,
        fee: '1234567890'
      } 
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.patch(oneElimEntryUrl + toPatch.id, invalidJSON, {
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
    it('should not patch a elimEntry by ID when fee is not a number', async () => {
      const invalidElimEntry = {
        ...toPatch,
        fee: 'abc'
      } 
      const invalidJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios.patch(oneElimEntryUrl + toPatch.id, invalidJSON, {
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

  describe('DELETE by ID - API: /api/elimEntries/elimEntry/:id', () => { 

    // from prisma/seeds.ts
    const toDelElimEntry = {
      ...initElimEntry,
      id: "een_19f158c6cc0d4f619227fbc24a885bab",
      elim_id: "elm_a47a4ec07f824b0e93169ae78e8b4b1e",
      player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
      fee: '5',
    }

    let didDel = false

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      // if deleted event, add event back
      try {
        const playerJSON = JSON.stringify(toDelElimEntry);
        await axios.post(url, playerJSON, { withCredentials: true });
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })

    it('should delete a elimEntry by ID', async () => { 
      const response = await axios.delete(oneElimEntryUrl + toDelElimEntry.id, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      didDel = true;
    })
    it(('should NOT delete a elimEntry by ID when ID is invalid'), async () => {
      try {
        const response = await axios.delete(oneElimEntryUrl + "invalid_id", {          
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
    it('should NOT delete a elimEntry by ID when id is valid, but not a elimEntry id', async () => {
      try {
        const response = await axios.delete(oneElimEntryUrl + userId, {          
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
    it('should NOT delete a elimEntry by ID when id is not found', async () => {
      const response = await axios.delete(oneElimEntryUrl + notFoundId, {          
        withCredentials: true
      });
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(0);
    })
  })

})