import axios, { AxiosError } from "axios";
import { basePotEntriesApi } from "@/lib/db/apiPaths";
import { testBasePotEntriesApi } from "../../../testApi";
import { potEntryType, tmntEntryPotEntryType } from "@/lib/types/types";
import { initPotEntry } from "@/lib/db/initVals";
import { mockPotEntriesToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";

import { cloneDeep } from "lodash";
import { deleteAllPotEntriesForDiv, deleteAllPotEntriesForSquad, deleteAllPotEntriesForTmnt, deletePotEntry, getAllPotEntriesForDiv, getAllPotEntriesForSquad, getAllPotEntriesForTmnt, postManyPotEntries, postPotEntry, putManyPotEntries, putPotEntry } from "@/lib/db/potEntries/dbPotEntries";

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

const url = testBasePotEntriesApi.startsWith("undefined")
  ? basePotEntriesApi
  : testBasePotEntriesApi;
const onePotEntryUrl = url + "/potEntry/";

const potEntriesToGet: potEntryType[] = [
  {
    ...initPotEntry,
    id: "pen_648e5b64809d441c99815929cf7c66e0",
    pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",          
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    fee: '20',
  },
  {
    ...initPotEntry,
    id: "pen_4aea7a841d464fb1b7b07c66a5b08cde",
    pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",          
    player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
    fee: '20',
  },
  {
    ...initPotEntry,
    id: "pen_4d9729b59b844d448be85e4cb61ba47a",
    pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",          
    player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
    fee: '20',
  },
  {
    ...initPotEntry,
    id: "pen_6bbbeae1989b4bdaa6880c873cbe02ba",
    pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",          
    player_id: "ply_8b0fd8bbd9e34d34a7fa90b4111c6e40",
    fee: '20',
  }
]

const tmntIdFormMockData = 'tmt_56d916ece6b50e6293300248c6792316';
const divIdForMockData = 'div_1f42042f9ef24029a0a2d48cc276a087';
const squadIdForMockData = 'sqd_1a6c885ee19a49489960389193e8f819';

const tmntIdForPotEntries = 'tmt_fd99387c33d9c78aba290286576ddce5';
const squadIdForPotEntries = 'sqd_7116ce5f80164830830a7157eb093396';
const divIdForPotEntries = 'div_f30aea2c534f4cfe87f4315531cef8ef';

const notFoundId = "pen_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundPlayerId = "ply_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

describe('dbPotEntries', () => { 

  const rePostPotEntry = async (potEntry: potEntryType) => {
    try {
      // if potEntry already in database, then don't re-post
      const getResponse = await axios.get(onePotEntryUrl + potEntry.id);
      const found = getResponse.data.potEntry;
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
      const potEntryJSON = JSON.stringify(potEntry);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: potEntryJSON
      });    
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  }  

  const rePostToDel = async () => {
    const response = await axios.get(url);
    const potEntries = response.data.potEntries;
    const foundToDel = potEntries.find(
      (p: potEntryType) => p.id === mockPotEntriesToPost[0].id
    );
    if (!foundToDel) {
      try {
        await postManyPotEntries(mockPotEntriesToPost);
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }
  }

  describe('getAllPotEntriesForTmnt()', () => { 

    it('should get all potEntries for tmnt', async () => { 
      const potEntries = await getAllPotEntriesForTmnt(tmntIdForPotEntries);
      expect(potEntries).toHaveLength(potEntriesToGet.length);
      if (!potEntries) return;
      for (let i = 0; i < potEntries.length; i++) {
        if (potEntries[i].id === potEntriesToGet[0].id) { 
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[0].player_id);
        } else if (potEntries[i].id === potEntriesToGet[1].id) {
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[1].player_id);
        } else if (potEntries[i].id === potEntriesToGet[2].id) { 
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[2].player_id);
        } else if (potEntries[i].id === potEntriesToGet[3].id) {
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[3].player_id);
        } else {
          expect(true).toBe(false);
        }                
        expect(potEntries[i].pot_id).toEqual(potEntriesToGet[i].pot_id);        
        expect(potEntries[i].fee).toEqual(potEntriesToGet[i].fee);
      }
    })
    it('should return 0 potEntries for not found tmnt', async () => { 
      const potEntries = await getAllPotEntriesForTmnt(notFoundTmntId);
      expect(potEntries).toHaveLength(0);
    })
    it('should return null if tmmt id is invalid', async () => { 
      const potEntries = await getAllPotEntriesForTmnt("test");
      expect(potEntries).toBeNull();
    })
    it('should return null if tmnt id is a valid id, but not a tmnt id', async () => {
      const potEntries = await getAllPotEntriesForTmnt(notFoundSquadId);
      expect(potEntries).toBeNull();
    }
    )
    it('should return null if tmnt id is null', async () => { 
      const potEntries = await getAllPotEntriesForTmnt(null as any);
      expect(potEntries).toBeNull();
    })
    it('should return null if tmnt id is undefined', async () => { 
      const potEntries = await getAllPotEntriesForTmnt(undefined as any);
      expect(potEntries).toBeNull();
    })
  })  

  describe('getAllPotEntriesForSquad()', () => {

    it('should get all potEntries for squad', async () => { 
      const potEntries = await getAllPotEntriesForSquad(squadIdForPotEntries);  
      expect(potEntries).toHaveLength(potEntriesToGet.length);
      if (!potEntries) return;
      for (let i = 0; i < potEntries.length; i++) {
        if (potEntries[i].id === potEntriesToGet[0].id) { 
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[0].player_id);
        } else if (potEntries[i].id === potEntriesToGet[1].id) {
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[1].player_id);
        } else if (potEntries[i].id === potEntriesToGet[2].id) { 
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[2].player_id);
        } else if (potEntries[i].id === potEntriesToGet[3].id) {
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[3].player_id);
        } else {
          expect(true).toBe(false);
        }                
        expect(potEntries[i].pot_id).toEqual(potEntriesToGet[i].pot_id);        
        expect(potEntries[i].fee).toEqual(potEntriesToGet[i].fee);
      }
    })
    it('should return 0 potEntries for not found squad', async () => { 
      const potEntries = await getAllPotEntriesForSquad(notFoundSquadId);
      expect(potEntries).toHaveLength(0);
    })
    it('should return null if squad id is invalid', async () => { 
      const potEntries = await getAllPotEntriesForSquad("test");
      expect(potEntries).toBeNull();
    })
    it('should return null if squad id is a valid id, but not a squad id', async () => {
      const potEntries = await getAllPotEntriesForSquad(notFoundTmntId);
      expect(potEntries).toBeNull();
    })
    it('should return null if squad id is null', async () => { 
      const potEntries = await getAllPotEntriesForSquad(null as any);
      expect(potEntries).toBeNull();
    })
    it('should return null if squad id is undefined', async () => { 
      const potEntries = await getAllPotEntriesForSquad(undefined as any);
      expect(potEntries).toBeNull();
    })
  })

  describe('getAllPotEntriesForDiv()', () => {

    it('should get all potEntries for div', async () => { 
      const potEntries = await getAllPotEntriesForDiv(divIdForPotEntries);  
      expect(potEntries).toHaveLength(potEntriesToGet.length);
      if (!potEntries) return;
      for (let i = 0; i < potEntries.length; i++) {
        if (potEntries[i].id === potEntriesToGet[0].id) { 
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[0].player_id);
        } else if (potEntries[i].id === potEntriesToGet[1].id) {
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[1].player_id);
        } else if (potEntries[i].id === potEntriesToGet[2].id) { 
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[2].player_id);
        } else if (potEntries[i].id === potEntriesToGet[3].id) {
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[3].player_id);
        } else {
          expect(true).toBe(false);
        }                
        expect(potEntries[i].pot_id).toEqual(potEntriesToGet[i].pot_id);        
        expect(potEntries[i].fee).toEqual(potEntriesToGet[i].fee);
      }
    })
    it('should return 0 potEntries for not found div', async () => { 
      const potEntries = await getAllPotEntriesForDiv(notFoundDivId);
      expect(potEntries).toHaveLength(0);
    })
    it('should return null if div id is invalid', async () => { 
      const potEntries = await getAllPotEntriesForDiv("test");
      expect(potEntries).toBeNull();
    })
    it('should return null if div id is a valid id, but not a div id', async () => {
      const potEntries = await getAllPotEntriesForDiv(notFoundTmntId);
      expect(potEntries).toBeNull();
    })
    it('should return null if div id is null', async () => { 
      const potEntries = await getAllPotEntriesForDiv(null as any);
      expect(potEntries).toBeNull();
    })
    it('should return null if div id is undefined', async () => { 
      const potEntries = await getAllPotEntriesForDiv(undefined as any);
      expect(potEntries).toBeNull();
    })
  })

  describe('postPotEntry()', () => { 

    const potEntryToPost: potEntryType = {
      ...initPotEntry,     
      id: "pen_008e5b64809d441c99815929cf7c66e0",
      pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",          
      player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
      fee: '22',
    }

    let createdPotEntry = false;

    const deletePostedPotEntry = async () => { 
      const response = await axios.get(url);
      const potEntrys = response.data.potEntries;
      const toDel = potEntrys.find((p: potEntryType) => p.fee === '22');
      if (toDel) {
        try {
          const delResponse = await axios({
            method: "delete",
            withCredentials: true,
            url: onePotEntryUrl + toDel.id          
          });          
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    beforeAll(async () => { 
      await deletePostedPotEntry();
    })

    beforeEach(() => {
      createdPotEntry = false;
    })

    afterEach(async () => {
      if (createdPotEntry) {
        await deletePostedPotEntry();
      }
    })

    it('should post one potEntry', async () => { 
      const postedPotEntry = await postPotEntry(potEntryToPost);
      expect(postedPotEntry).not.toBeNull();
      if (!postedPotEntry) return;
      createdPotEntry = true;
      expect(postedPotEntry.id).toEqual(potEntryToPost.id);      
      expect(postedPotEntry.pot_id).toEqual(potEntryToPost.pot_id);
      expect(postedPotEntry.player_id).toEqual(potEntryToPost.player_id);
      expect(postedPotEntry.fee).toEqual(potEntryToPost.fee);
    })
    it('should post a sanitzed potEntry', async () => { 
      const toSanitizse = {
        ...potEntryToPost,
        position: '22.000'
      }
      const postedPotEntry = await postPotEntry(toSanitizse);
      expect(postedPotEntry).not.toBeNull();
      if (!postedPotEntry) return;
      createdPotEntry = true;
      expect(postedPotEntry.id).toEqual(toSanitizse.id);
      expect(postedPotEntry.pot_id).toEqual(toSanitizse.pot_id);      
      expect(postedPotEntry.player_id).toEqual(toSanitizse.player_id);
      expect(postedPotEntry.fee).toEqual('22');
    })
    it('should not post a potEntry if got invalid data', async () => { 
      const invalidPotEntry = {
        ...potEntryToPost,
        fee: '-1'
      }
      const postedPlayer = await postPotEntry(invalidPotEntry);
      expect(postedPlayer).toBeNull();
    })
  })

  describe('postManyPotEntries()', () => { 
    let createdPotEntries = false;    

    beforeAll(async () => {
      await deleteAllPotEntriesForTmnt(tmntIdFormMockData);
    })

    beforeEach(() => {
      createdPotEntries = false;
    })

    afterEach(async () => {
      if (createdPotEntries) {
        await deleteAllPotEntriesForTmnt(tmntIdFormMockData);
      }
    })

    afterAll(async () => {
      await deleteAllPotEntriesForTmnt(tmntIdFormMockData);
    })

    it('should post many potEntries', async () => {
      const potEntries = await postManyPotEntries(mockPotEntriesToPost);
      expect(potEntries).not.toBeNull();
      if (!potEntries) return;
      createdPotEntries = true;
      expect(potEntries.length).toEqual(mockPotEntriesToPost.length);
      for (let i = 0; i < mockPotEntriesToPost.length; i++) {
        expect(potEntries[i].id).toEqual(mockPotEntriesToPost[i].id);        
        expect(potEntries[i].pot_id).toEqual(mockPotEntriesToPost[i].pot_id);
        expect(potEntries[i].player_id).toEqual(mockPotEntriesToPost[i].player_id);
        expect(potEntries[i].fee).toEqual(mockPotEntriesToPost[i].fee);
      }
    })
    it('should NOT post many potEntries with sanitization, fee value sanitized to ""', async () => {
      const toSanitize = cloneDeep(mockPotEntriesToPost)
      toSanitize[0].fee = '  84  '      
      const potEntries = await postManyPotEntries(toSanitize);
      expect(potEntries).toBeNull();
    })
    it('should not post many potEntries with no data', async () => {
      const postedPotEntries = await postManyPotEntries([]);
      expect(postedPotEntries).not.toBeNull();
      expect(postedPotEntries).toHaveLength(0);
    })
    it('should not post many potEntries with invalid data', async () => {
      const invalidPotEntries = cloneDeep(mockPotEntriesToPost);
      invalidPotEntries[1].fee = '-1';
      const postedPlayers = await postManyPotEntries(invalidPotEntries);
      expect(postedPlayers).toBeNull();
    })    
  })    

  describe('putPotEntry()', () => {

    const potEntryToPut = {
      ...initPotEntry,
      id: "pen_648e5b64809d441c99815929cf7c66e0",                  
      pot_id: 'pot_791fb6d8a9a04cb4b3372e212da2a3b0',
      player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
      fee: '23'
    }

    const putUrl = onePotEntryUrl + potEntryToPut.id;

    const resetPotEntry = {
      ...initPotEntry,
      id: "pen_648e5b64809d441c99815929cf7c66e0",
      pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",          
      player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
      fee: '20',
    }

    const doReset = async () => {
      try {
        const playerJSON = JSON.stringify(resetPotEntry);
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

    it('should put a potEntry', async () => {
      const puttedPotEntry = await putPotEntry(potEntryToPut);
      expect(puttedPotEntry).not.toBeNull();
      if (!puttedPotEntry) return;
      didPut = true;      
      expect(puttedPotEntry.pot_id).toBe(potEntryToPut.pot_id);
      expect(puttedPotEntry.player_id).toBe(potEntryToPut.player_id);
      expect(puttedPotEntry.fee).toBe(potEntryToPut.fee);
    })
    it('should NOT put a potEntry with sanitization, fee value sanitized to ""', async () => {
      const toSanitize = cloneDeep(potEntryToPut)
      toSanitize.fee = '  23  '      
      const puttedPotEntry = await putPotEntry(toSanitize);
      expect(puttedPotEntry).toBeNull();
    })
    it('shouyld NOT put a potEntry with invalid data', async () => {
      const invalidPotEntry = {
        ...potEntryToPut,
        fee: '-1',
      }
      const puttedPotEntry = await putPotEntry(invalidPotEntry);
      expect(puttedPotEntry).toBeNull();
    })    
  })

  describe('putManyPotEntries()', () => { 
    let createdPotEntries = false;    

    beforeAll(async () => {
      await deleteAllPotEntriesForTmnt(tmntIdFormMockData);
    })

    beforeEach(() => {
      createdPotEntries = false;
    })

    afterEach(async () => {
      if (createdPotEntries) {
        await deleteAllPotEntriesForTmnt(tmntIdFormMockData);
      }
    })

    afterAll(async () => {
      await deleteAllPotEntriesForTmnt(tmntIdFormMockData);
    })

    const testPotEntries = [
      {
        ...mockPotEntriesToPost[0],
      },
      {
        ...initPotEntry,
        id: 'pen_04be0472be3d476ea1caa99dd05953fa',
        pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
        player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        fee: '10'
      },
      {
        ...mockPotEntriesToPost[1],
      },
      {
        ...initPotEntry,
        id: 'pen_05be0472be3d476ea1caa99dd05953fa',
        pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
        player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        fee: '10'
      },
      {
        ...mockPotEntriesToPost[2],
      },
      {
        ...initPotEntry,
        id: 'pen_06be0472be3d476ea1caa99dd05953fa',
        pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
        player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
        fee: '10'
      },
    ]

    it('should update, insert and delete many potEntries', async () => { 
      const multiPotEntriesTest = [
        {
          ...testPotEntries[0],
        },
        {
          ...testPotEntries[1],
        },
        {
          ...testPotEntries[2],
        },
        {
          ...testPotEntries[3],
        },
      ]
      createdPotEntries = true;
      const postedPotEntries = await postManyPotEntries(multiPotEntriesTest);
      expect(postedPotEntries).not.toBeNull();
      if (!postedPotEntries) return;
      expect(postedPotEntries.length).toBe(multiPotEntriesTest.length);      

      // set edits, set eType
      const potEntriesToUpdate = [
        {
          ...multiPotEntriesTest[0],
          fee: '19',
          eType: "u",
        },
        {
          ...multiPotEntriesTest[1],
          fee: '9',
          eType: "u",
        },
        {
          ...multiPotEntriesTest[2],
          eType: "d",
        },
        {
          ...multiPotEntriesTest[3],          
          eType: "d",
        },
        {
          ...testPotEntries[4],
          eType: "i",
        },
        {
          ...testPotEntries[5],
          eType: "i",
        },
      ]
      const updateInfo = await putManyPotEntries(potEntriesToUpdate);
      expect(updateInfo).not.toBeNull();
      if (!updateInfo) return;
      expect(updateInfo.updates).toBe(2);
      expect(updateInfo.inserts).toBe(2);
      expect(updateInfo.deletes).toBe(2);
    })
    it('should return no updates, inserts or deletes when no edits are passed', async () => { 
      const multiPotEntriesTest = [
        {
          ...testPotEntries[0],
        },
        {
          ...testPotEntries[1],
        },
        {
          ...testPotEntries[2],
        },
        {
          ...testPotEntries[3],
        },
      ]
      createdPotEntries = true;
      const postedPotEntries = await postManyPotEntries(multiPotEntriesTest);
      expect(postedPotEntries).not.toBeNull();
      if (!postedPotEntries) return;
      expect(postedPotEntries.length).toBe(multiPotEntriesTest.length);      

      // set no edits
      const potEntriesToUpdate: tmntEntryPotEntryType[] = []
      const updateInfo = await putManyPotEntries(potEntriesToUpdate);
      expect(updateInfo).not.toBeNull();
      if (!updateInfo) return;
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.inserts).toBe(0);
      expect(updateInfo.deletes).toBe(0);
    })
    it('should update no pot entries when error in data', async () => { 
      const multiPotEntriesTest = [
        {
          ...testPotEntries[0],
        },
        {
          ...testPotEntries[1],
        },
        {
          ...testPotEntries[2],
        },
        {
          ...testPotEntries[3],
        },
      ]
      createdPotEntries = true;
      const postedPotEntries = await postManyPotEntries(multiPotEntriesTest);
      expect(postedPotEntries).not.toBeNull();
      if (!postedPotEntries) return;
      expect(postedPotEntries.length).toBe(multiPotEntriesTest.length);      

      // set edits, set eType
      const potEntriesToUpdate = [
        {
          ...multiPotEntriesTest[0],
          fee: '1234567890', // error in fee
          eType: "u",
        },
        {
          ...multiPotEntriesTest[1],
          fee: '9',
          eType: "u",
        },
        {
          ...multiPotEntriesTest[2],
          eType: "d",
        },
        {
          ...multiPotEntriesTest[3],          
          eType: "d",
        },
        {
          ...testPotEntries[4],
          eType: "i",
        },
        {
          ...testPotEntries[5],
          eType: "i",
        },
      ]
      const updateInfo = await putManyPotEntries(potEntriesToUpdate);
      expect(updateInfo).toBeNull();
    })
  })

  describe('deletePotEntry()', () => {

    // toDel is data from prisma/seeds.ts
    const toDel = {
      ...initPotEntry,
      id: "pen_8c8b607b7ebb4e84a0753307afce256e",
      pot_id: "pot_791fb6d8a9a04cb4b3372e212da2a3b0",          
      player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
      fee: '20'
    }

    let didDel = false;

    beforeAll(async () => {     
      await rePostPotEntry(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostPotEntry(toDel);
      }
    });

    it('should delete a potEntry', async () => {
      const deleted = await deletePotEntry(toDel.id);
      expect(deleted).toBe(1);
      didDel = true;
    })
    it('should not delete a potEntry when id is not found', async () => {
      const deleted = await deletePotEntry(notFoundId);
      expect(deleted).toBe(-1);
    })
    it('should not delete a potEntry when id is invalid', async () => {
      const deleted = await deletePotEntry("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete a potEntry when id is null', async () => {
      const deleted = await deletePotEntry(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete a potEntry when id is undefined', async () => {
      const deleted = await deletePotEntry(undefined as any);
      expect(deleted).toBe(-1);   
    })    
  })

  describe('deleteAllPotEntriesForSquad()', () => { 

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

    it('should delete all potEntries for a squad', async () => { 
      const deleted = await deleteAllPotEntriesForSquad(squadIdForMockData);
      expect(deleted).toBe(mockPotEntriesToPost.length);
      didDel = true;
    })
    it('should not delete all potEntries for a squad when squad id is not found', async () => {
      const deleted = await deleteAllPotEntriesForSquad(notFoundSquadId);
      expect(deleted).toBe(0);
    })  
    it('should not delete all potEntries for a squad when squad id is invalid', async () => { 
      const deleted = await deleteAllPotEntriesForSquad("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete all potEntries for a squad when squad id is valid, but not a squad id', async () => { 
      const deleted = await deleteAllPotEntriesForSquad(userId);
      expect(deleted).toBe(-1);
    })
    it('should not delete all potEntries for a squad when squad id is null', async () => { 
      const deleted = await deleteAllPotEntriesForSquad(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete all potEntries for a squad when squad id is undefined', async () => { 
      const deleted = await deleteAllPotEntriesForSquad(undefined as any);
      expect(deleted).toBe(-1);
    })
  })

  describe('deleteAllPotEntriesForDiv()', () => { 

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

    it('should delete all potEntries for a div', async () => { 
      const deleted = await deleteAllPotEntriesForDiv(divIdForMockData);
      expect(deleted).toBe(mockPotEntriesToPost.length);
      didDel = true;
    })
    it('should not delete all potEntries for a div when div id is not found', async () => {
      const deleted = await deleteAllPotEntriesForDiv(notFoundDivId);
      expect(deleted).toBe(0);
    })  
    it('should not delete all potEntries for a div when div id is invalid', async () => { 
      const deleted = await deleteAllPotEntriesForDiv("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete all potEntries for a div when div id is valid, but not a div id', async () => { 
      const deleted = await deleteAllPotEntriesForDiv(userId);
      expect(deleted).toBe(-1);
    })
    it('should not delete all potEntries for a div when div id is null', async () => { 
      const deleted = await deleteAllPotEntriesForDiv(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete all potEntries for a div when div id is undefined', async () => { 
      const deleted = await deleteAllPotEntriesForDiv(undefined as any);
      expect(deleted).toBe(-1);
    })
  })

  describe('deleteAllPotEntriesForTmnt()', () => {     

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

    it('should delete all potEntries for a tmnt', async () => { 
      const deleted = await deleteAllPotEntriesForTmnt(tmntIdFormMockData);
      expect(deleted).toBe(mockPotEntriesToPost.length);
      didDel = true;
    })
    it('should not delete all potEntries for a tmnt when tmnt id is not found', async () => {
      const deleted = await deleteAllPotEntriesForTmnt(notFoundTmntId);
      expect(deleted).toBe(0);
    })  
    it('should not delete all potEntries for a tmnt when tmnt id is invalid', async () => { 
      const deleted = await deleteAllPotEntriesForTmnt("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete all potEntries for a tmnt when tmnt id is valid, but not a tmnt id', async () => { 
      const deleted = await deleteAllPotEntriesForTmnt(userId);
      expect(deleted).toBe(-1);
    })
    it('should not delete all potEntries for a tmnt when tmnt id is null', async () => { 
      const deleted = await deleteAllPotEntriesForTmnt(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete all potEntries for a tmnt when tmnt id is undefined', async () => { 
      const deleted = await deleteAllPotEntriesForTmnt(undefined as any);
      expect(deleted).toBe(-1);
    })
  })

})