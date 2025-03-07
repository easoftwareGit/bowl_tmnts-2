import axios, { AxiosError } from "axios";
import { baseElimEntriesApi } from "@/lib/db/apiPaths";
import { testBaseElimEntriesApi } from "../../../testApi";
import { elimEntryType } from "@/lib/types/types";
import { initElimEntry } from "@/lib/db/initVals";
import { mockElimEntriesToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { deleteAllElimEntriesForElim, deleteAllElimEntriesForDiv, deleteAllElimEntriesForSquad, deleteAllElimEntriesForTmnt, deleteElimEntry, getAllElimEntriesForElim, getAllElimEntriesForDiv, getAllElimEntriesForSquad, getAllElimEntriesForTmnt, postElimEntry, postManyElimEntries, putElimEntry, putManyElimEntries } from "@/lib/db/elimEntries/dbElimEntries";
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

const elimEntriesToGet: elimEntryType[] = [
  {
    ...initElimEntry,
    id: "een_23d6f8f1de844604a8828d4bb8a5a910",
    elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    fee: '5',
  },
  {
    ...initElimEntry,
    id: "een_e50663d4292145e6895ece1c0105dd3a",
    elim_id: "elm_9d01015272b54962a375cf3c91007a12",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    fee: '5',
  },
  {
    ...initElimEntry,
    id: "een_ffce2d50515541259f25b19257898074",
    elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
    player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
    fee: '5',
  },
  {
    ...initElimEntry,
    id: "een_1aa013df98094a03aa79995bc1c6dd9f",
    elim_id: "elm_9d01015272b54962a375cf3c91007a12",
    player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
    fee: '5',
  }
]

const tmntIdForElimEntries = 'tmt_fd99387c33d9c78aba290286576ddce5';
const squadIdForElimEntries = 'sqd_7116ce5f80164830830a7157eb093396';
const divIdForElimEntries = 'div_f30aea2c534f4cfe87f4315531cef8ef';
const elimIdForElimEntries = 'elm_45d884582e7042bb95b4818ccdd9974c';

const tmntIdFormMockData = 'tmt_56d916ece6b50e6293300248c6792316';
const divIdForMockData = 'div_1f42042f9ef24029a0a2d48cc276a087';
const squadIdForMockData = 'sqd_1a6c885ee19a49489960389193e8f819';
const elimIdForMockData = 'elm_b4c3939adca140898b1912b75b3725f8';

const notFoundId = "een_01234567890123456789012345678901";
const notFoundElimId = "elm_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundPlayerId = "ply_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

const elim1Id = 'elm_45d884582e7042bb95b4818ccdd9974c';
const elim2Id = 'elm_9d01015272b54962a375cf3c91007a12';

describe('dbElimEntries', () => { 

  const rePostElimEntry = async (elimEntry: elimEntryType) => {
    try {
      // if elimEntry already in database, then don't re-post
      const getResponse = await axios.get(oneElimEntryUrl + elimEntry.id);
      const found = getResponse.data.elimEntry;
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
      const elimEntryJSON = JSON.stringify(elimEntry);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: elimEntryJSON
      });    
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  }  

  const rePostToDel = async () => {
    const response = await axios.get(url);
    const elimEntries = response.data.elimEntries;
    const foundToDel = elimEntries.find(
      (e: elimEntryType) => e.id === mockElimEntriesToPost[1].id
    );
    if (!foundToDel) {
      try {
        await postManyElimEntries(mockElimEntriesToPost);
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }
  }

  describe('getAllElimEntriesForTmnt()', () => { 

    it('should get all elimEntries for tmnt', async () => { 
      const elimEntries = await getAllElimEntriesForTmnt(tmntIdForElimEntries);
      expect(elimEntries).toHaveLength(elimEntriesToGet.length);
      if (!elimEntries) return;
      for (let i = 0; i < elimEntries.length; i++) {
        if (elimEntries[i].id === elimEntriesToGet[0].id) { 
          expect(elimEntries[i].player_id).toEqual(elimEntriesToGet[0].player_id);
        } else if (elimEntries[i].id === elimEntriesToGet[1].id) {
          expect(elimEntries[i].player_id).toEqual(elimEntriesToGet[1].player_id);
        } else if (elimEntries[i].id === elimEntriesToGet[2].id) { 
          expect(elimEntries[i].player_id).toEqual(elimEntriesToGet[2].player_id);
        } else if (elimEntries[i].id === elimEntriesToGet[3].id) {
          expect(elimEntries[i].player_id).toEqual(elimEntriesToGet[3].player_id);
        } else {
          expect(true).toBe(false);
        }        
        expect(elimEntries[i].elim_id === elim1Id || elimEntries[i].elim_id === elim2Id).toBeTruthy();                
        expect(elimEntries[i].fee).toEqual(elimEntriesToGet[i].fee);
      }
    })
    it('should return 0 elimEntries for not found tmnt', async () => { 
      const elimEntries = await getAllElimEntriesForTmnt(notFoundTmntId);
      expect(elimEntries).toHaveLength(0);
    })
    it('should return null if tmmt id is invalid', async () => { 
      const elimEntries = await getAllElimEntriesForTmnt("test");
      expect(elimEntries).toBeNull();
    })
    it('should return null if tmnt id is a valid id, but not a tmnt id', async () => {
      const elimEntries = await getAllElimEntriesForTmnt(notFoundSquadId);
      expect(elimEntries).toBeNull();
    }
    )
    it('should return null if tmnt id is null', async () => { 
      const elimEntries = await getAllElimEntriesForTmnt(null as any);
      expect(elimEntries).toBeNull();
    })
    it('should return null if tmnt id is undefined', async () => { 
      const elimEntries = await getAllElimEntriesForTmnt(undefined as any);
      expect(elimEntries).toBeNull();
    })
  })  

  describe('getAllElimEntriesForSquad()', () => {

    it('should get all elimEntries for squad', async () => { 
      const elimEntries = await getAllElimEntriesForSquad(squadIdForElimEntries);  
      expect(elimEntries).toHaveLength(elimEntriesToGet.length);
      if (!elimEntries) return;
      for (let i = 0; i < elimEntries.length; i++) {
        if (elimEntries[i].id === elimEntriesToGet[0].id) { 
          expect(elimEntries[i].player_id).toEqual(elimEntriesToGet[0].player_id);
        } else if (elimEntries[i].id === elimEntriesToGet[1].id) {
          expect(elimEntries[i].player_id).toEqual(elimEntriesToGet[1].player_id);
        } else if (elimEntries[i].id === elimEntriesToGet[2].id) { 
          expect(elimEntries[i].player_id).toEqual(elimEntriesToGet[2].player_id);
        } else if (elimEntries[i].id === elimEntriesToGet[3].id) {
          expect(elimEntries[i].player_id).toEqual(elimEntriesToGet[3].player_id);
        } else {
          expect(true).toBe(false);
        }        
        expect(elimEntries[i].elim_id === elim1Id || elimEntries[i].elim_id === elim2Id).toBeTruthy();        
        expect(elimEntries[i].fee).toEqual(elimEntriesToGet[i].fee);
      }
    })
    it('should return 0 elimEntries for not found squad', async () => { 
      const elimEntries = await getAllElimEntriesForSquad(notFoundSquadId);
      expect(elimEntries).toHaveLength(0);
    })
    it('should return null if squad id is invalid', async () => { 
      const elimEntries = await getAllElimEntriesForSquad("test");
      expect(elimEntries).toBeNull();
    })
    it('should return null if squad id is a valid id, but not a squad id', async () => {
      const elimEntries = await getAllElimEntriesForSquad(notFoundTmntId);
      expect(elimEntries).toBeNull();
    })
    it('should return null if squad id is null', async () => { 
      const elimEntries = await getAllElimEntriesForSquad(null as any);
      expect(elimEntries).toBeNull();
    })
    it('should return null if squad id is undefined', async () => { 
      const elimEntries = await getAllElimEntriesForSquad(undefined as any);
      expect(elimEntries).toBeNull();
    })
  })

  describe('getAllElimEntriesForDiv()', () => {

    it('should get all elimEntries for div', async () => { 
      const elimEntries = await getAllElimEntriesForDiv(divIdForElimEntries);  
      expect(elimEntries).toHaveLength(elimEntriesToGet.length);
      if (!elimEntries) return;
      for (let i = 0; i < elimEntries.length; i++) {
        if (elimEntries[i].id === elimEntriesToGet[0].id) { 
          expect(elimEntries[i].player_id).toEqual(elimEntriesToGet[0].player_id);
        } else if (elimEntries[i].id === elimEntriesToGet[1].id) {
          expect(elimEntries[i].player_id).toEqual(elimEntriesToGet[1].player_id);
        } else if (elimEntries[i].id === elimEntriesToGet[2].id) { 
          expect(elimEntries[i].player_id).toEqual(elimEntriesToGet[2].player_id);
        } else if (elimEntries[i].id === elimEntriesToGet[3].id) {
          expect(elimEntries[i].player_id).toEqual(elimEntriesToGet[3].player_id);
        } else {
          expect(true).toBe(false);
        }        
        expect(elimEntries[i].elim_id === elim1Id || elimEntries[i].elim_id === elim2Id).toBeTruthy();                       
        expect(elimEntries[i].fee).toEqual(elimEntriesToGet[i].fee);
      }
    })
    it('should return 0 elimEntries for not found div', async () => { 
      const elimEntries = await getAllElimEntriesForDiv(notFoundDivId);
      expect(elimEntries).toHaveLength(0);
    })
    it('should return null if div id is invalid', async () => { 
      const elimEntries = await getAllElimEntriesForDiv("test");
      expect(elimEntries).toBeNull();
    })
    it('should return null if div id is a valid id, but not a div id', async () => {
      const elimEntries = await getAllElimEntriesForDiv(userId);
      expect(elimEntries).toBeNull();
    })
    it('should return null if div id is null', async () => { 
      const elimEntries = await getAllElimEntriesForDiv(null as any);
      expect(elimEntries).toBeNull();
    })
    it('should return null if div id is undefined', async () => { 
      const elimEntries = await getAllElimEntriesForDiv(undefined as any);
      expect(elimEntries).toBeNull();
    })
  })

  describe('getAllElimEntriesForBrkt()', () => {

    it('should get all elimEntries for elim', async () => { 
      const elimEntries = await getAllElimEntriesForElim(elimIdForElimEntries);  
      expect(elimEntries).toHaveLength(2);
      if (!elimEntries) return;
      for (let i = 0; i < elimEntries.length; i++) {
        if (elimEntries[i].id === elimEntriesToGet[0].id) { 
          expect(elimEntries[i].player_id).toEqual(elimEntriesToGet[0].player_id);
        } else if (elimEntries[i].id === elimEntriesToGet[1].id) {
          expect(elimEntries[i].player_id).toEqual(elimEntriesToGet[1].player_id);
        } else if (elimEntries[i].id === elimEntriesToGet[2].id) { 
          expect(elimEntries[i].player_id).toEqual(elimEntriesToGet[2].player_id);
        } else if (elimEntries[i].id === elimEntriesToGet[3].id) {
          expect(elimEntries[i].player_id).toEqual(elimEntriesToGet[3].player_id);
        } else {
          expect(true).toBe(false);
        }        
        expect(elimEntries[i].elim_id === elim1Id || elimEntries[i].elim_id === elim2Id).toBeTruthy();                
        expect(elimEntries[i].fee).toEqual(elimEntriesToGet[i].fee);
      }
    })
    it('should return 0 elimEntries for not found elim', async () => { 
      const elimEntries = await getAllElimEntriesForElim(notFoundElimId);
      expect(elimEntries).toHaveLength(0);
    })
    it('should return null if elim id is invalid', async () => { 
      const elimEntries = await getAllElimEntriesForElim("test");
      expect(elimEntries).toBeNull();
    })
    it('should return null if elim id is a valid id, but not a div id', async () => {
      const elimEntries = await getAllElimEntriesForElim(userId);
      expect(elimEntries).toBeNull();
    })
    it('should return null if elim id is null', async () => { 
      const elimEntries = await getAllElimEntriesForElim(null as any);
      expect(elimEntries).toBeNull();
    })
    it('should return null if elim id is undefined', async () => { 
      const elimEntries = await getAllElimEntriesForElim(undefined as any);
      expect(elimEntries).toBeNull();
    })
  })

  describe('postElimEntry()', () => { 

    const elimEntryToPost = {
      ...initElimEntry,    
      id: 'een_012346c5556e407291c4b5666b2dccd7',      
      elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
      player_id: 'ply_a01758cff1cc4bab9d9133e661bd49b0',      
      fee: '3',
    }

    let createdElimEntry = false;

    const deletePostedElimEntry = async () => { 
      const response = await axios.get(url);
      const elimEntrys = response.data.elimEntries;
      const toDel = elimEntrys.find((e: elimEntryType) => e.fee === '3');
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
      const postedElimEntry = await postElimEntry(elimEntryToPost);
      expect(postedElimEntry).not.toBeNull();
      if (!postedElimEntry) return;
      createdElimEntry = true;
      expect(postedElimEntry.id).toEqual(elimEntryToPost.id);      
      expect(postedElimEntry.elim_id).toEqual(elimEntryToPost.elim_id);
      expect(postedElimEntry.player_id).toEqual(elimEntryToPost.player_id);      
      expect(postedElimEntry.fee).toEqual(elimEntryToPost.fee);
    })
    it('should post a sanitzed elimEntry', async () => { 
      const toSanitizse = {
        ...elimEntryToPost,
        fee: '3.000'
      }
      const postedElimEntry = await postElimEntry(toSanitizse);
      expect(postedElimEntry).not.toBeNull();
      if (!postedElimEntry) return;
      createdElimEntry = true;
      expect(postedElimEntry.id).toEqual(toSanitizse.id);      
      expect(postedElimEntry.elim_id).toEqual(toSanitizse.elim_id);      
      expect(postedElimEntry.player_id).toEqual(toSanitizse.player_id);      
      expect(postedElimEntry.fee).toEqual('3');
    })
    it('should not post a elimEntry if got invalid data', async () => { 
      const invalidElimEntry = {
        ...elimEntryToPost,
        fee: '-1'
      }
      const postedElimEntry = await postElimEntry(invalidElimEntry);
      expect(postedElimEntry).toBeNull();
    })
  })

  describe('postManyElimEntries()', () => { 

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

    afterAll(async () => {
      await deleteAllElimEntriesForTmnt(tmntIdFormMockData);
    })

    it('should post many elimEntries', async () => {
      const elimEntries = await postManyElimEntries(mockElimEntriesToPost);
      expect(elimEntries).not.toBeNull();
      if (!elimEntries) return;
      createdElimEntries = true;
      expect(elimEntries.length).toEqual(mockElimEntriesToPost.length);
      for (let i = 0; i < mockElimEntriesToPost.length; i++) {
        expect(elimEntries[i].id).toEqual(mockElimEntriesToPost[i].id);
        expect(elimEntries[i].elim_id).toEqual(mockElimEntriesToPost[i].elim_id);
        expect(elimEntries[i].player_id).toEqual(mockElimEntriesToPost[i].player_id);        
        expect(elimEntries[i].fee).toEqual(mockElimEntriesToPost[i].fee);
      }
    })
    it('should NOT post many elimEntries with sanitization, fee value sanitized to ""', async () => {
      const toSanitize = cloneDeep(mockElimEntriesToPost)
      toSanitize[0].fee = '  3  '      
      const elimEntries = await postManyElimEntries(toSanitize);
      expect(elimEntries).toBeNull();
    })
    it('should not post many elimEntries with no data', async () => {
      const postedElimEntries = await postManyElimEntries([]);
      expect(postedElimEntries).not.toBeNull();
      expect(postedElimEntries).toHaveLength(0);
    })
    it('should not post many elimEntries with invalid data', async () => {
      const invalidElimEntries = cloneDeep(mockElimEntriesToPost);
      invalidElimEntries[1].fee = '-1';
      const postedElimEntrys = await postManyElimEntries(invalidElimEntries);
      expect(postedElimEntrys).toBeNull();
    })    
  })    

  describe('putElimEntry()', () => {

    const elimEntryToPut = {
      ...initElimEntry,
      id: "een_23d6f8f1de844604a8828d4bb8a5a910",
      elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
      player_id: 'ply_a01758cff1cc4bab9d9133e661bd49b0',      
      fee: '3'
    }

    const putUrl = oneElimEntryUrl + elimEntryToPut.id;

    const resetElimEntry = {
      ...initElimEntry,
      id: "een_23d6f8f1de844604a8828d4bb8a5a910",
      elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
      player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
      fee: '5',
    }

    const doReset = async () => {
      try {
        const playerJSON = JSON.stringify(resetElimEntry);
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

    it('should put a elimEntry', async () => {
      const puttedElimEntry = await putElimEntry(elimEntryToPut);
      expect(puttedElimEntry).not.toBeNull();
      if (!puttedElimEntry) return;
      didPut = true;      
      expect(puttedElimEntry.elim_id).toBe(elimEntryToPut.elim_id);
      expect(puttedElimEntry.player_id).toBe(elimEntryToPut.player_id);      
      expect(puttedElimEntry.fee).toBe(elimEntryToPut.fee);
    })
    it('should NOT put a elimEntry with sanitization, fee value sanitized to ""', async () => {
      const toSanitize = cloneDeep(elimEntryToPut)
      toSanitize.fee = '  3  '
      const puttedElimEntry = await putElimEntry(toSanitize);
      expect(puttedElimEntry).toBeNull();
    })
    it('shouyld NOT put a elimEntry with invalid data', async () => {
      const invalidElimEntry = {
        ...elimEntryToPut,
        fee: '-1',
      }
      const puttedElimEntry = await putElimEntry(invalidElimEntry);
      expect(puttedElimEntry).toBeNull();
    })    
  })

  describe('post many elimEntries', () => { 
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

    afterAll(async () => {
      await deleteAllElimEntriesForTmnt(tmntIdFormMockData);
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

    it('should update, insert and delete many elimEntries', async () => { 
      const multiBrktEntriesTest = [
        {
          ...testElimEntries[0],
        },
        {
          ...testElimEntries[1],
        },
        {
          ...testElimEntries[2],
        },
        {
          ...testElimEntries[3],
        },
      ]
      createdElimEntries = true;
      const postedElimEntries = await postManyElimEntries(multiBrktEntriesTest);
      expect(postedElimEntries).not.toBeNull();
      if (!postedElimEntries) return;
      expect(postedElimEntries.length).toBe(multiBrktEntriesTest.length);      

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
      
      const updateInfo = await putManyElimEntries(elimEntriesToUpdate);
      expect(updateInfo).not.toBeNull();
      if (!updateInfo) return;
      expect(updateInfo.updates).toBe(2);
      expect(updateInfo.inserts).toBe(2);
      expect(updateInfo.deletes).toBe(2);
    })
    it('should update no elim Entries when error in data', async () => { 
      const multiBrktEntriesTest = [
        {
          ...testElimEntries[0],
        },
        {
          ...testElimEntries[1],
        },
        {
          ...testElimEntries[2],
        },
        {
          ...testElimEntries[3],
        },
      ]
      createdElimEntries = true;
      const postedElimEntries = await postManyElimEntries(multiBrktEntriesTest);
      expect(postedElimEntries).not.toBeNull();
      if (!postedElimEntries) return;
      expect(postedElimEntries.length).toBe(multiBrktEntriesTest.length);      

      // set editsm,  eType 
      const elimEntriesToUpdate = [
        {
          ...testElimEntries[0],
          fee: '1234567890',  // error in fee
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
      
      const updateInfo = await putManyElimEntries(elimEntriesToUpdate);
      expect(updateInfo).toBeNull();
    })

  })

  describe('deleteElimEntry()', () => {

    // toDel is data from prisma/seeds.ts
    const toDel = {
      ...initElimEntry,
      id: "een_19f158c6cc0d4f619227fbc24a885bab",
      elim_id: "elm_a47a4ec07f824b0e93169ae78e8b4b1e",
      player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
      fee: '5',
    }

    let didDel = false;

    beforeAll(async () => {     
      await rePostElimEntry(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostElimEntry(toDel);
      }
    });

    it('should delete a elimEntry', async () => {
      const deleted = await deleteElimEntry(toDel.id);
      expect(deleted).toBe(1);
      didDel = true;
    })
    it('should not delete a elimEntry when id is not found', async () => {
      const deleted = await deleteElimEntry(notFoundId);
      expect(deleted).toBe(-1);
    })
    it('should not delete a elimEntry when id is invalid', async () => {
      const deleted = await deleteElimEntry("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete a elimEntry when id is null', async () => {
      const deleted = await deleteElimEntry(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete a elimEntry when id is undefined', async () => {
      const deleted = await deleteElimEntry(undefined as any);
      expect(deleted).toBe(-1);   
    })    
  })

  describe('deleteAllElimEntriesForSquad()', () => { 

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

    it('should delete all elimEntries for a squad', async () => { 
      const deleted = await deleteAllElimEntriesForSquad(squadIdForMockData);
      expect(deleted).toBe(mockElimEntriesToPost.length);
      didDel = true;
    })
    it('should not delete all elimEntries for a squad when squad id is not found', async () => {
      const deleted = await deleteAllElimEntriesForSquad(notFoundSquadId);
      expect(deleted).toBe(0);
    })  
    it('should not delete all elimEntries for a squad when squad id is invalid', async () => { 
      const deleted = await deleteAllElimEntriesForSquad("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete all elimEntries for a squad when squad id is valid, but not a squad id', async () => { 
      const deleted = await deleteAllElimEntriesForSquad(userId);
      expect(deleted).toBe(-1);
    })
    it('should not delete all elimEntries for a squad when squad id is null', async () => { 
      const deleted = await deleteAllElimEntriesForSquad(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete all elimEntries for a squad when squad id is undefined', async () => { 
      const deleted = await deleteAllElimEntriesForSquad(undefined as any);
      expect(deleted).toBe(-1);
    })
  })

  describe('deleteAllElimEntriesForDiv()', () => { 

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

    it('should delete all elimEntries for a div', async () => { 
      const deleted = await deleteAllElimEntriesForDiv(divIdForMockData);
      expect(deleted).toBe(mockElimEntriesToPost.length);
      didDel = true;
    })
    it('should not delete all elimEntries for a div when div id is not found', async () => {
      const deleted = await deleteAllElimEntriesForDiv(notFoundDivId);
      expect(deleted).toBe(0);
    })  
    it('should not delete all elimEntries for a div when div id is invalid', async () => { 
      const deleted = await deleteAllElimEntriesForDiv("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete all elimEntries for a div when div id is valid, but not a div id', async () => { 
      const deleted = await deleteAllElimEntriesForDiv(userId);
      expect(deleted).toBe(-1);
    })
    it('should not delete all elimEntries for a div when div id is null', async () => { 
      const deleted = await deleteAllElimEntriesForDiv(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete all elimEntries for a div when div id is undefined', async () => { 
      const deleted = await deleteAllElimEntriesForDiv(undefined as any);
      expect(deleted).toBe(-1);
    })
  })

  describe('deleteAllElimEntriesForBrkt()', () => { 

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
      await deleteAllElimEntriesForTmnt(tmntIdFormMockData)
    });

    afterAll(async () => {
      await deleteAllElimEntriesForTmnt(tmntIdFormMockData)
    });

    it('should delete all elimEntries for a elim', async () => { 
      const deleted = await deleteAllElimEntriesForElim(elimIdForMockData);
      expect(deleted).toBe(2); // only 2 of the 4 mock elimEntries were deleted
      didDel = true;
    })
    it('should not delete all elimEntries for a elim when elim id is not found', async () => {
      const deleted = await deleteAllElimEntriesForElim(notFoundElimId);
      expect(deleted).toBe(0);
    })  
    it('should not delete all elimEntries for a elim when elim id is invalid', async () => { 
      const deleted = await deleteAllElimEntriesForElim("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete all elimEntries for a elim when elim id is valid, but not a elim id', async () => { 
      const deleted = await deleteAllElimEntriesForElim(userId);
      expect(deleted).toBe(-1);
    })
    it('should not delete all elimEntries for a elim when elim id is null', async () => { 
      const deleted = await deleteAllElimEntriesForElim(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete all elimEntries for a elim when elim id is undefined', async () => { 
      const deleted = await deleteAllElimEntriesForElim(undefined as any);
      expect(deleted).toBe(-1);
    })
  })

  describe('deleteAllElimEntriesForTmnt()', () => {     

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
      deleteAllElimEntriesForTmnt(tmntIdFormMockData)
    });

    it('should delete all elimEntries for a tmnt', async () => { 
      const deleted = await deleteAllElimEntriesForTmnt(tmntIdFormMockData);
      expect(deleted).toBe(mockElimEntriesToPost.length);
      didDel = true;
    })
    it('should not delete all elimEntries for a tmnt when tmnt id is not found', async () => {
      const deleted = await deleteAllElimEntriesForTmnt(notFoundTmntId);
      expect(deleted).toBe(0);
    })  
    it('should not delete all elimEntries for a tmnt when tmnt id is invalid', async () => { 
      const deleted = await deleteAllElimEntriesForTmnt("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete all elimEntries for a tmnt when tmnt id is valid, but not a tmnt id', async () => { 
      const deleted = await deleteAllElimEntriesForTmnt(userId);
      expect(deleted).toBe(-1);
    })
    it('should not delete all elimEntries for a tmnt when tmnt id is null', async () => { 
      const deleted = await deleteAllElimEntriesForTmnt(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete all elimEntries for a tmnt when tmnt id is undefined', async () => { 
      const deleted = await deleteAllElimEntriesForTmnt(undefined as any);
      expect(deleted).toBe(-1);
    })
  })

})