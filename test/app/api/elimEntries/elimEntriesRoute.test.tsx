import axios, { AxiosError } from "axios";
import { baseElimEntriesApi } from "@/lib/db/apiPaths";
import { testBaseElimEntriesApi } from "../../../testApi";
import { initElimEntry } from "@/lib/db/initVals";
import { elimEntryType } from "@/lib/types/types";
import { mockElimEntriesToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { deleteAllElimEntriesForTmnt, getAllElimEntriesForSquad, postManyElimEntries } from "@/lib/db/elimEntries/dbElimEntries";
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

const url = testBaseElimEntriesApi.startsWith("undefined")
  ? baseElimEntriesApi
  : testBaseElimEntriesApi; 
const oneElimEntryUrl = url + "/elimEntry/";
const elimUrl = url + "/elim/";
const divUrl = url + "/div/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/"; 
const manyUrl = url + "/many";

describe("ElimEntries - API's: /api/elimEntries", () => { 

  const testElimEntry = {
    ...initElimEntry,
    id: "een_23d6f8f1de844604a8828d4bb8a5a910",
    elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    fee: '5',
  }

  const tmntIdForMulti = 'tmt_fe8ac53dad0f400abe6354210a8f4cd1';

  const tmntIdForElimEntries = 'tmt_fd99387c33d9c78aba290286576ddce5';
  const squadIdForElimEntries = 'sqd_7116ce5f80164830830a7157eb093396';
  const divIdForElimEntries = 'div_f30aea2c534f4cfe87f4315531cef8ef';
  const elimIdForElimEntries = 'elm_45d884582e7042bb95b4818ccdd9974c';

  const tmntIdFormMockData = 'tmt_56d916ece6b50e6293300248c6792316';
  const divIdForMockData = 'div_1f42042f9ef24029a0a2d48cc276a087';
  const squadIdForMockData = 'sqd_1a6c885ee19a49489960389193e8f819';
  const brktIdForMockData = 'brk_aa3da3a411b346879307831b6fdadd5f';

  const notFoundId = "een_01234567890123456789012345678901";
  const notFoundElimId = "elm_01234567890123456789012345678901";
  const notFoundDivId = "div_01234567890123456789012345678901";
  const notFoundPlayerId = "ply_01234567890123456789012345678901";
  const notFoundSquadId = "sqd_01234567890123456789012345678901";
  const notFoundTmntId = "tmt_01234567890123456789012345678901";
  const userId = "usr_01234567890123456789012345678901";

  const elim1Id = 'elm_45d884582e7042bb95b4818ccdd9974c';
  const elim2Id = 'elm_9d01015272b54962a375cf3c91007a12';

  const deletePostedElimEntry = async () => {
    const response = await axios.get(url);
    const elimEntries = response.data.elimEntries;
    const toDel = elimEntries.find((e: elimEntryType) => e.fee === '3');
    if (toDel) {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneElimEntryUrl + toDel.id
        });
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
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
    
    const elimEntryToPost: elimEntryType = {
      ...initElimEntry,
      elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
      player_id: 'ply_bb0fd8bbd9e34d34a7fa90b4111c6e40',
      fee: '3'
    }

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

    it('should post one elimEntry', async () => {
      const divPlayerJSON = JSON.stringify(elimEntryToPost);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: divPlayerJSON
      });
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
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: elimEntryJSON
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
    it('should not post one elimEntry when id is blank', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        id: ''
      }
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: elimEntryJSON
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
    it('should not post one elimEntry when elim_id is blank', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        elim_id: ''
      }
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: elimEntryJSON
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
    it('should not post one elimEntry when player_id is blank', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        player_id: ''
      }
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: elimEntryJSON
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
    it('should not post one elimEntry when fee is blank', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        fee: ''
      }
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: elimEntryJSON
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
    it('should not post one elimEntry when id is invalid', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        id: 'test'
      }
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: elimEntryJSON
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
    it('should not post one elimEntry when id is valid, but not a elimEntry id', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        id: userId
      }
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: elimEntryJSON
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
    it('should not post one elimEntry when elim_id is invalid', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        elim_id: 'test'
      }
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: elimEntryJSON
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
    it('should not post one elimEntry when elim_id is valid, bit not a elim id', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        elim_id: userId
      }
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: elimEntryJSON
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
    it('should not post one elimEntry when player_id is invalid', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        player_id: 'test'
      }
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: elimEntryJSON
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
    it('should not post one elimEntry when player_id is valid, but not a player id', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        player_id: userId
      }
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: elimEntryJSON
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
    it('should not post one elimEntry when fee is too low', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        fee: '-1'
      }
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: elimEntryJSON
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
    it('should not post one elimEntry when fee is too high', async () => {
      const invalidElimEntry = {
        ...elimEntryToPost,
        fee: '1234567890'
      }
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: elimEntryJSON
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

  describe('POST many elimEntries for one tmnt API: /api/elimEntries/many', () => {

    let createdElimEntries = false;

    beforeAll(async () => {
      await deleteAllElimEntriesForTmnt(tmntIdFormMockData);
    })

    beforeEach(() => {
      createdElimEntries = false;
    })

    afterEach(async () => {
      if (createdElimEntries) {
        await deleteAllElimEntriesForTmnt(tmntIdFormMockData);
      }
    })

    it('should create many elimEntries', async () => {
      const elimEntryJSON = JSON.stringify(mockElimEntriesToPost);
      const response = await axios({
        method: "post",
        data: elimEntryJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(response.status).toBe(201);
      createdElimEntries = true;
      expect(response.data.count).toBe(mockElimEntriesToPost.length);

      const postedElimEntries = await getAllElimEntriesForSquad(squadIdForMockData);
      expect(response.status).toBe(201);
      if (!postedElimEntries) {
        expect(true).toBeFalsy();
        return;
      }      
      expect(postedElimEntries.length).toBe(mockElimEntriesToPost.length);
      for (let i = 0; i < mockElimEntriesToPost.length; i++) {
        expect(postedElimEntries[i].id).toBe(mockElimEntriesToPost[i].id);
        expect(postedElimEntries[i].elim_id).toBe(mockElimEntriesToPost[i].elim_id);
        expect(postedElimEntries[i].player_id).toBe(mockElimEntriesToPost[i].player_id);
        expect(postedElimEntries[i].fee).toBe(mockElimEntriesToPost[i].fee);
      }
    })
    it('should return 0 and code 200 when passed an empty array', async () => {
      const elimEntryJSON = JSON.stringify([]);
      const response = await axios({
        method: "post",
        data: elimEntryJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(0);
    });
    it('should NOT create many elimEntries with sanitzied data, fee sanitized to ""', async () => {
      const toSanitize = cloneDeep(mockElimEntriesToPost);
      toSanitize[0].fee = '   84  ';
      const elimEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: elimEntryJSON,
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
    it('shold NOT create many elimEntries with blank ids', async () => {
      const toSanitize = cloneDeep(mockElimEntriesToPost);
      toSanitize[1].id = '';
      const elimEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: elimEntryJSON,
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
    it('should NOT create many elimEntries with blank elim_id', async () => {
      const toSanitize = cloneDeep(mockElimEntriesToPost);
      toSanitize[1].elim_id = '';
      const elimEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: elimEntryJSON,
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
    it('should NOT create many elimEntries with blank player_id', async () => {
      const toSanitize = cloneDeep(mockElimEntriesToPost);
      toSanitize[1].player_id = '';
      const elimEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: elimEntryJSON,
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
    it('should NOT create many elimEntries with blank fee', async () => {
      const toSanitize = cloneDeep(mockElimEntriesToPost);
      toSanitize[1].fee = '';
      const elimEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: elimEntryJSON,
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
    it('should NOT create many elimEntries with invalid id', async () => {
      const toSanitize = cloneDeep(mockElimEntriesToPost);
      toSanitize[1].id = 'test';
      const elimEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: elimEntryJSON,
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
    it('should NOT create many elimEntries with valid id, but not a elimEntry id', async () => {
      const toSanitize = cloneDeep(mockElimEntriesToPost);
      toSanitize[1].id = userId;
      const elimEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: elimEntryJSON,
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
    it('should NOT create many elimEntries with invalid elim_id', async () => {
      const toSanitize = cloneDeep(mockElimEntriesToPost);
      toSanitize[1].elim_id = 'test';
      const elimEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: elimEntryJSON,
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
    it('should NOT create many elimEntries with valid elim_id, but not a div id', async () => {
      const toSanitize = cloneDeep(mockElimEntriesToPost);
      toSanitize[1].elim_id = userId;
      const elimEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: elimEntryJSON,
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
    it('should NOT create many elimEntries with invalid player_id', async () => {
      const toSanitize = cloneDeep(mockElimEntriesToPost);
      toSanitize[1].player_id = 'test';
      const elimEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: elimEntryJSON,
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
    it('should NOT create many elimEntries with valid player_id, but not a player id', async () => {
      const toSanitize = cloneDeep(mockElimEntriesToPost);
      toSanitize[1].player_id = userId;
      const elimEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: elimEntryJSON,
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
    it('should NOT create many elimEntries when fee to too low', async () => {
      const toSanitize = cloneDeep(mockElimEntriesToPost);
      toSanitize[1].fee = '-1';
      const elimEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: elimEntryJSON,
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
    it('should NOT create many elimEntries when fee to too high', async () => {
      const toSanitize = cloneDeep(mockElimEntriesToPost);
      toSanitize[1].fee = '9999999999';
      const elimEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: elimEntryJSON,
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

  describe('PUT many elimEntries API: /api/elimEntries/many', () => {

    let createdElimEntries = false;

    beforeAll(async () => {
      await deleteAllElimEntriesForTmnt(tmntIdFormMockData);
    })

    beforeEach(() => {
      createdElimEntries = false;
    })

    afterEach(async () => {
      if (createdElimEntries) {
        await deleteAllElimEntriesForTmnt(tmntIdFormMockData);
      }
    })

    const testElimEntries = [
      {
        ...mockElimEntriesToPost[0],
      },
      {
        ...mockElimEntriesToPost[1],
      },
      {
        ...initElimEntry,
        id: 'een_03be0472be3d476ea1caa99dd05953fa',
        elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
        player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        fee: '5'
      },
      {
        ...initElimEntry,
        id: 'een_04be0472be3d476ea1caa99dd05953fa',
        elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
        player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        fee: '5'
      },
    ];

    it('should update many elimEntries - just update 1 player 2 elim entry', async () => {
      const potEntryJSON = JSON.stringify(testElimEntries);
      const response = await axios({
        method: "post",
        data: potEntryJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(response.status).toBe(201);
      createdElimEntries = true;
      expect(response.data.count).toBe(testElimEntries.length);
      const postedElimEntries = await getAllElimEntriesForSquad(squadIdForMockData);
      expect(response.status).toBe(201);
      if (!postedElimEntries) {
        expect(true).toBeFalsy();
        return;
      }
      // change fee, add eType = 'u'
      const elimEntriesToUpdate = [
        {
          ...testElimEntries[0],
          fee: '4',
          eType: "u",
        },
        {
          ...testElimEntries[1],
          fee: '4',
          eType: "u",
        },
      ]
      const toUpdateJSON = JSON.stringify(elimEntriesToUpdate)
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
    it('should update many elimEntries - just update 2 player 1 elim entry', async () => {
      const potEntryJSON = JSON.stringify(testElimEntries);
      const response = await axios({
        method: "post",
        data: potEntryJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(response.status).toBe(201);
      createdElimEntries = true;
      expect(response.data.count).toBe(testElimEntries.length);
      const postedElimEntries = await getAllElimEntriesForSquad(squadIdForMockData);
      expect(response.status).toBe(201);
      if (!postedElimEntries) {
        expect(true).toBeFalsy();
        return;
      }
      // change fee, add eType = 'u'
      const elimEntriesToUpdate = [
        {
          ...testElimEntries[0],
          fee: '4',
          eType: "u",
        },
        {
          ...testElimEntries[2],
          fee: '4',
          eType: "u",
        },
      ]
      const toUpdateJSON = JSON.stringify(elimEntriesToUpdate)
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
    it('should update many elimEntries - just update 2 player 2 elim entry', async () => {
      const potEntryJSON = JSON.stringify(testElimEntries);
      const response = await axios({
        method: "post",
        data: potEntryJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(response.status).toBe(201);
      createdElimEntries = true;
      expect(response.data.count).toBe(testElimEntries.length);
      const postedElimEntries = await getAllElimEntriesForSquad(squadIdForMockData);
      expect(response.status).toBe(201);
      if (!postedElimEntries) {
        expect(true).toBeFalsy();
        return;
      }
      // change fee, add eType = 'u'
      const elimEntriesToUpdate = [
        {
          ...testElimEntries[0],
          fee: '4',
          eType: "u",
        },
        {
          ...testElimEntries[1],
          fee: '4',
          eType: "u",
        },
        {
          ...testElimEntries[2],
          fee: '4',
          eType: "u",
        },
        {
          ...testElimEntries[3],
          fee: '4',
          eType: "u",
        },
      ]
      const toUpdateJSON = JSON.stringify(elimEntriesToUpdate)
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
    it('should insert many elimEntries - just insert 1 player 2 elim entry', async () => {
      createdElimEntries = true;
      // add eType = 'i'
      const elimEntriesToUpdate = [
        {
          ...testElimEntries[0],
          eType: "i",
        },
        {
          ...testElimEntries[1],
          eType: "i",
        },
      ]
      const toUpdateJSON = JSON.stringify(elimEntriesToUpdate)
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
    it('should insert many elimEntries - just insert 2 player 1 elim entry', async () => {
      createdElimEntries = true;
      // add eType = 'i'
      const elimEntriesToUpdate = [
        {
          ...testElimEntries[0],
          eType: "i",
        },
        {
          ...testElimEntries[2],
          eType: "i",
        },
      ]
      const toUpdateJSON = JSON.stringify(elimEntriesToUpdate)
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
    it('should insert many elimEntries - just insert 2 player 2 elim entry', async () => {
      createdElimEntries = true;
      // add eType = 'i'
      const elimEntriesToUpdate = [
        {
          ...testElimEntries[0],
          eType: "i",
        },
        {
          ...testElimEntries[1],
          eType: "i",
        },
        {
          ...testElimEntries[2],
          eType: "i",
        },
        {
          ...testElimEntries[3],
          eType: "i",
        },
      ]
      const toUpdateJSON = JSON.stringify(elimEntriesToUpdate)
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
    it('should delete many elimEntries - just delete 1 player 2 elim entry', async () => {
      const potEntryJSON = JSON.stringify(testElimEntries);
      const response = await axios({
        method: "post",
        data: potEntryJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(response.status).toBe(201);
      createdElimEntries = true;
      expect(response.data.count).toBe(testElimEntries.length);
      const postedElimEntries = await getAllElimEntriesForSquad(squadIdForMockData);
      expect(response.status).toBe(201);
      if (!postedElimEntries) {
        expect(true).toBeFalsy();
        return;
      }                        
      // add eType = 'd'
      const elimEntriesToUpdate = [
        {
          ...testElimEntries[0],
          eType: "d",
        },
        {
          ...testElimEntries[1],
          eType: "d",
        },
      ]
      const toUpdateJSON = JSON.stringify(elimEntriesToUpdate)
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
    it('should delete many elimEntries - just delete 1 player 2 elim entry', async () => {
      const potEntryJSON = JSON.stringify(testElimEntries);
      const response = await axios({
        method: "post",
        data: potEntryJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(response.status).toBe(201);
      createdElimEntries = true;
      expect(response.data.count).toBe(testElimEntries.length);
      const postedElimEntries = await getAllElimEntriesForSquad(squadIdForMockData);
      expect(response.status).toBe(201);
      if (!postedElimEntries) {
        expect(true).toBeFalsy();
        return;
      }
      // add eType = 'd'
      const elimEntriesToUpdate = [
        {
          ...testElimEntries[0],
          eType: "d",
        },
        {
          ...testElimEntries[2],
          eType: "d",
        },
      ]
      const toUpdateJSON = JSON.stringify(elimEntriesToUpdate)
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
    it('should delete many elimEntries - just delete 1 player 2 elim entry', async () => {
      const potEntryJSON = JSON.stringify(testElimEntries);
      const response = await axios({
        method: "post",
        data: potEntryJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(response.status).toBe(201);
      createdElimEntries = true;
      expect(response.data.count).toBe(testElimEntries.length);
      const postedElimEntries = await getAllElimEntriesForSquad(squadIdForMockData);
      expect(response.status).toBe(201);
      if (!postedElimEntries) {
        expect(true).toBeFalsy();
        return;
      }
      // add eType = 'd'
      const elimEntriesToUpdate = [
        {
          ...testElimEntries[0],
          eType: "d",
        },
        {
          ...testElimEntries[1],
          eType: "d",
        },
        {
          ...testElimEntries[2],
          eType: "d",
        },
        {
          ...testElimEntries[3],
          eType: "d",
        },
      ]
      const toUpdateJSON = JSON.stringify(elimEntriesToUpdate)
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
    it('should update, insert and delete many elimEntries', async () => {
      const potEntryJSON = JSON.stringify(testElimEntries);
      const response = await axios({
        method: "post",
        data: potEntryJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(response.status).toBe(201);
      createdElimEntries = true;
      expect(response.data.count).toBe(testElimEntries.length);
      const postedElimEntries = await getAllElimEntriesForSquad(squadIdForMockData);
      expect(response.status).toBe(201);
      if (!postedElimEntries) {
        expect(true).toBeFalsy();
        return;
      }            
      // set editsm,  eType 
      const elimEntriesToUpdate = [
        {
          ...testElimEntries[0],
          fee: '4',
          eType: "u",
        },
        {
          ...testElimEntries[1],
          fee: '4',
          eType: "u",
        },
        {
          ...testElimEntries[2],          
          eType: "d",
        },
        {
          ...testElimEntries[3],          
          eType: "d",
        },
        {
          ...initElimEntry,
          id: 'een_05de0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          fee: '5',
          eType: "i",
        },
        {
          ...initElimEntry,
          id: 'een_06de0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          fee: '5',
          eType: "i",
        },
      ]
      const toUpdateJSON = JSON.stringify(elimEntriesToUpdate)
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
    it('should NOT update many elimEntries when data is invalid', async () => {
      const potEntryJSON = JSON.stringify(testElimEntries);
      const response = await axios({
        method: "post",
        data: potEntryJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(response.status).toBe(201);
      createdElimEntries = true;
      expect(response.data.count).toBe(testElimEntries.length);
      const postedElimEntries = await getAllElimEntriesForSquad(squadIdForMockData);
      expect(response.status).toBe(201);
      if (!postedElimEntries) {
        expect(true).toBeFalsy();
        return;
      }                        
      // change fee, add eType = 'u'
      const elimEntriesToUpdate = [
        {
          ...testElimEntries[0],
          fee: '1234567890',
          eType: "u",
        },
        {
          ...testElimEntries[1],
          fee: '4',
          eType: "u",
        },
        {
          ...testElimEntries[2],          
          eType: "d",
        },
        {
          ...testElimEntries[3],          
          eType: "d",
        },
        {
          ...initElimEntry,
          id: 'een_05de0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          fee: '5',
          eType: "i",
        },
        {
          ...initElimEntry,
          id: 'een_06de0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          fee: '5',
          eType: "i",
        },
      ]
      const toUpdateJSON = JSON.stringify(elimEntriesToUpdate)
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
    
  });

  describe('PUT one elimEntry API: /api/elimEntries/elimEntry/:id', () => { 

    const resetElimEntry = async () => {
      // make sure test player is reset in database
      const elimEntryJSON = JSON.stringify(testElimEntry);
      const putResponse = await axios({
        method: "put",
        data: elimEntryJSON,
        withCredentials: true,
        url: oneElimEntryUrl + testElimEntry.id,
      })
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
      const response = await axios({
        method: "put",
        data: elimEntryJSON,
        withCredentials: true,
        url: oneElimEntryUrl + testElimEntry.id,
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
      const response = await axios({
        method: "put",
        data: elimEntryJSON,
        withCredentials: true,
        url: oneElimEntryUrl + testElimEntry.id,
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
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "put",
          data: elimEntryJSON,
          withCredentials: true,
          url: oneElimEntryUrl + testElimEntry.id,
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
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "put",
          data: elimEntryJSON,
          withCredentials: true,
          url: oneElimEntryUrl + testElimEntry.id,
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
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "put",
          data: elimEntryJSON,
          withCredentials: true,
          url: oneElimEntryUrl + testElimEntry.id,
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
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "put",
          data: elimEntryJSON,
          withCredentials: true,
          url: oneElimEntryUrl + testElimEntry.id,
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
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "put",
          data: elimEntryJSON,
          withCredentials: true,
          url: oneElimEntryUrl + testElimEntry.id,
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
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "put",
          data: elimEntryJSON,
          withCredentials: true,
          url: oneElimEntryUrl + testElimEntry.id,
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
        const putResponse = await axios({
          method: "patch",
          data: playerJSON,
          withCredentials: true,
          url: oneElimEntryUrl + testElimEntry.id,
        })
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }

    let didPatch = false;

    beforeAll(async () => {
      await doResetElimEntry
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
      const response = await axios({
        method: "patch",
        data: elimEntryJSON,
        withCredentials: true,
        url: oneElimEntryUrl + toPatch.id,
      });
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
      const response = await axios({
        method: "patch",
        data: elimEntryJSON,
        withCredentials: true,
        url: oneElimEntryUrl + toPatch.id,
      });
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
      const response = await axios({
        method: "patch",
        data: elimEntryJSON,
        withCredentials: true,
        url: oneElimEntryUrl + toPatch.id,
      });
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
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "patch",
          data: elimEntryJSON,
          withCredentials: true,
          url: oneElimEntryUrl + toPatch.id,
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
    it('should not patch a elimEntry by ID when elim_id is valid, but not a div id', async () => { 
      const invalidElimEntry = {
        ...toPatch,
        elim_id: userId
      }
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "patch",
          data: elimEntryJSON,
          withCredentials: true,
          url: oneElimEntryUrl + toPatch.id,
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
    it('should not patch a elimEntry by ID when elim_id is invalid', async () => {
      const invalidElimEntry = {
        ...toPatch,
        elim_id: 'test'
      }
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "patch",
          data: elimEntryJSON,
          withCredentials: true,
          url: oneElimEntryUrl + toPatch.id,
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
    it('should not patch a elimEntry by ID when elim_id is valid, but not a div id', async () => { 
      const invalidElimEntry = {
        ...toPatch,
        elim_id: userId
      }
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "patch",
          data: elimEntryJSON,
          withCredentials: true,
          url: oneElimEntryUrl + toPatch.id,
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
    it('should not patch a elimEntry by ID when player_id is blank', async () => {
      const invalidElimEntry = {
        ...toPatch,
        player_id: ''
      }
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "patch",
          data: elimEntryJSON,
          withCredentials: true,
          url: oneElimEntryUrl + toPatch.id,
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
    it('should not patch a elimEntry by ID when player_id is invalid', async () => {
      const invalidElimEntry = {
        ...toPatch,
        player_id: 'test'
      }
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "patch",
          data: elimEntryJSON,
          withCredentials: true,
          url: oneElimEntryUrl + toPatch.id,
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
    it('should not patch a elimEntry by ID when player_id is valid, but not a player id', async () => { 
      const invalidElimEntry = {
        ...toPatch,
        player_id: userId
      }
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "patch",
          data: elimEntryJSON,
          withCredentials: true,
          url: oneElimEntryUrl + toPatch.id,
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
    it('should not patch a elimEntry by ID when fee is blank', async () => {
      const invalidElimEntry = {
        ...toPatch,
        fee: ''
      } 
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "patch",
          data: elimEntryJSON,
          withCredentials: true,
          url: oneElimEntryUrl + toPatch.id,
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
    it('should not patch a elimEntry by ID when fee is too low', async () => {
      const invalidElimEntry = {
        ...toPatch,
        fee: '-1'
      } 
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "patch",
          data: elimEntryJSON,
          withCredentials: true,
          url: oneElimEntryUrl + toPatch.id,
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
    it('should not patch a elimEntry by ID when fee is too high', async () => {
      const invalidElimEntry = {
        ...toPatch,
        fee: '1234567890'
      } 
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "patch",
          data: elimEntryJSON,
          withCredentials: true,
          url: oneElimEntryUrl + toPatch.id,
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
    it('should not patch a elimEntry by ID when fee is not a number', async () => {
      const invalidElimEntry = {
        ...toPatch,
        fee: 'abc'
      } 
      const elimEntryJSON = JSON.stringify(invalidElimEntry);
      try {
        const response = await axios({
          method: "patch",
          data: elimEntryJSON,
          withCredentials: true,
          url: oneElimEntryUrl + toPatch.id,
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

    it('should delete a elimEntry by ID', async () => { 
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: oneElimEntryUrl + toDelElimEntry.id,
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
    it(('should NOT delete a elimEntry by ID when ID is invalid'), async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: oneElimEntryUrl + "invalid_id",
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
    it('should NOT delete a elimEntry by ID when id is valid, bit noy a elimEntry id', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: oneElimEntryUrl + userId,
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
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: oneElimEntryUrl + notFoundId,
        });
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

  describe('DELETE all elimEntries for one brkt - API: /api/elimEntries/brkt/:brktId', () => { 

    let didDel = false

    beforeAll(async () => {
      await postManyElimEntries(mockElimEntriesToPost)
    })

    beforeEach(() => {      
      didDel = false      
    })

    afterEach(async () => {
      if (!didDel) return;
      await deleteAllElimEntriesForTmnt(tmntIdFormMockData)      
      await postManyElimEntries(mockElimEntriesToPost)
    })

    afterAll(async () => {
      await deleteAllElimEntriesForTmnt(tmntIdFormMockData)
    })

    it('should delete all elimEntries for one brkt', async () => { 
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: elimUrl + brktIdForMockData
        });
        expect(response.status).toBe(200);
        didDel = true
        expect(response.data.count).toBe(2); // 2 elimEntries deleted from mock data
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all elimEntries for one brkt when ID is invalid', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: elimUrl + 'test'
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
    it('should NOT delete all elimEntries for one brkt when ID valid, but not a brkt ID', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: elimUrl + userId
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
    it('should delete 0 elimEntries for a brkt when brkt id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: elimUrl + notFoundElimId
        });
        expect(response.status).toBe(200);
        expect(response.data.count).toBe(0);
      } catch (err) {
        expect(true).toBeFalsy();
      }
    })
  })

  describe('DELETE all elimEntries for one div - API: /api/elimEntries/div/:divId', () => { 
    
    let didDel = false

    beforeAll(async () => {
      await postManyElimEntries(mockElimEntriesToPost)
    })

    beforeEach(() => {      
      didDel = false      
    })

    afterEach(async () => {
      if (!didDel) return;
      await deleteAllElimEntriesForTmnt(tmntIdFormMockData)      
      await postManyElimEntries(mockElimEntriesToPost)
    })

    afterAll(async () => {
      await deleteAllElimEntriesForTmnt(tmntIdFormMockData)
    })

    it('should delete all elimEntries for one div', async () => { 
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: divUrl + divIdForMockData
        });
        expect(response.status).toBe(200);
        didDel = true
        expect(response.data.count).toBe(mockElimEntriesToPost.length);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all elimEntries for one div when ID is invalid', async () => {
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
    it('should NOT delete all elimEntries for one div when ID valid, but not a div ID', async () => {
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
    it('should delete 0 elimEntries for a div when div id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: divUrl + notFoundDivId
        });
        expect(response.status).toBe(200);
        expect(response.data.count).toBe(0);
      } catch (err) {
        expect(true).toBeFalsy();
      }
    })
  })

  describe('DELETE all elimEntries for one squad - API: /api/elimEntries/squad/:squadId', () => {       

    let didDel = false

    beforeAll(async () => {
      await postManyElimEntries(mockElimEntriesToPost)
    })

    beforeEach(() => {      
      didDel = false      
    })

    afterEach(async () => {
      if (!didDel) return;
      await deleteAllElimEntriesForTmnt(tmntIdFormMockData)      
      await postManyElimEntries(mockElimEntriesToPost)
    })

    afterAll(async () => {
      await deleteAllElimEntriesForTmnt(tmntIdFormMockData)
    })

    it('should delete all elimEntries for one squad', async () => { 
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: squadUrl + squadIdForMockData
        });
        expect(response.status).toBe(200);
        didDel = true
        expect(response.data.count).toBe(mockElimEntriesToPost.length);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all elimEntries for one squad when ID is invalid', async () => {
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
    it('should NOT delete all elimEntries for one squad when ID valid, but not a squad ID', async () => {
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
    it('should delete 0 elimEntries for a squad when squad id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: squadUrl + notFoundSquadId
        });
        expect(response.status).toBe(200);
        expect(response.data.count).toBe(0);
      } catch (err) {
        expect(true).toBeFalsy();
      }
    })
  })

  describe('DELETE all elimEntries for one tmnt - API: /api/elimEntries/tmnt/:tmntId', () => { 
    
    let didDel = false

    beforeAll(async () => {
      await postManyElimEntries(mockElimEntriesToPost)
    })

    beforeEach(() => {      
      didDel = false      
    })

    afterEach(async () => {
      if (!didDel) return;
      await deleteAllElimEntriesForTmnt(tmntIdFormMockData)      
      await postManyElimEntries(mockElimEntriesToPost)
    })

    afterAll(async () => {
      await deleteAllElimEntriesForTmnt(tmntIdFormMockData)
    })

    it('should delete all elimEntries for a tmnt', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + tmntIdFormMockData
        });
        expect(response.status).toBe(200);
        expect(response.data.count).toBe(mockElimEntriesToPost.length);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all elimEntries for a tmnt when tmnt id is not valid', async () => {
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
    it('should NOT delete all elimEntries for a tmnt when tmnt id is valid, but not a squad id', async () => {
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
    it('should delete 0 elimEntries for a tmnt when tmnt id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + notFoundTmntId
        });
        expect(response.status).toBe(200);
        expect(response.data.count).toBe(0);
      } catch (err) {
        expect(true).toBeFalsy();
      }
    })
  })

})