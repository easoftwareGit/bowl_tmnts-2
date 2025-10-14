import axios, { AxiosError } from "axios";
import { baseDivEntriesApi } from "@/lib/db/apiPaths";
import { testBaseDivEntriesApi } from "../../../testApi";
import { initDiv, initDivEntry } from "@/lib/db/initVals";
import { divEntryRawWithHdcpType, divEntryType, HdcpForTypes } from "@/lib/types/types";
import { mockDivEntriesToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { deleteAllDivEntriesForTmnt, getAllDivEntriesForSquad, getAllDivEntriesForTmnt, postManyDivEntries } from "@/lib/db/divEntries/dbDivEntries";
import { cloneDeep } from "lodash";
import { putDiv } from "@/lib/db/divs/dbDivs";

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
    id: "den_652fc6c5556e407291c4b5666b2dccd7",      
    squad_id: 'sqd_7116ce5f80164830830a7157eb093396',
    div_id: 'div_f30aea2c534f4cfe87f4315531cef8ef',
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
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

  const notFoundId = "den_01234567890123456789012345678901";
  const notFoundDivId = "div_01234567890123456789012345678901";
  const notFoundPlayerId = "ply_01234567890123456789012345678901";
  const notFoundSquadId = "sqd_01234567890123456789012345678901";
  const notFoundTmntId = "tmt_01234567890123456789012345678901";
  const userId = "usr_01234567890123456789012345678901";

  const deletePostedDivEntry = async () => {
    const response = await axios.get(url);
    const divEntries = response.data.divEntries;
    const toDel = divEntries.find((d: divEntryRawWithHdcpType) => d.fee === 83);
    if (toDel) {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneDivEntryUrl + toDel.id
        });
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }
  }

  describe('GET', () => { 

    beforeAll(async () => {
      await deletePostedDivEntry();
    })

    it('should get all divEntries', async () => {
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      // 49 rows in prisma/seed.ts
      expect(response.data.divEntries).toHaveLength(49);
    })
  })

  describe('GET one divEntry API: /api/divEntries/divEntry/:id', () => { 

    describe('GET one divEntry by ID sucess with different div data', () => { 

      beforeAll(async () => {
        await deletePostedDivEntry();
        await putDiv(div);
      })

      afterEach(async () => {
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
          expect(divEntry.hdcp).toEqual(testDivEntry.hdcp);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(404);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })      
      it('should get one divEntry by ID when div hdcp is not 0', async () => {
        try {
          const hdcpDiv = {
            ...div,
            hdcp_per: 0.85,
          }
          await putDiv(hdcpDiv);

          const urlToUse = oneDivEntryUrl + testDivEntry.id;
          const response = await axios.get(urlToUse);
          expect(response.status).toBe(200);        
          const divEntry = response.data.divEntry;
          expect(divEntry.id).toEqual(testDivEntry.id);
          expect(divEntry.hdcp).toEqual(8);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(404);
          } else {
            expect(true).toBeFalsy();
          }
        }        
      })
      it('should get one divEntry by ID when div hdcp is not 0 and hdcp is int_hdcp is false', async () => {
        try {
          const hdcpDiv = {
            ...div,
            hdcp_per: 0.85,
            int_hdcp: false,
          }
          await putDiv(hdcpDiv);

          const urlToUse = oneDivEntryUrl + testDivEntry.id;
          const response = await axios.get(urlToUse);
          expect(response.status).toBe(200);        
          const divEntry = response.data.divEntry;
          expect(divEntry.id).toEqual(testDivEntry.id);
          expect(divEntry.hdcp).toEqual(8.5);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(404);
          } else {
            expect(true).toBeFalsy();
          }
        }        
      })      
    })

    describe('GET one divEntry by ID failures', () => { 
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

  })

  describe('GET all divEntries for one div API: /api/divEntries/div/:divId', () => { 

    describe('GET all divEntries for one div success', () => { 
      beforeAll(async () => {
        await deletePostedDivEntry();
        await putDiv(div);
      })

      afterEach(async () => {
        await putDiv(div);
      })

      it('should get all divEntries for one div', async () => { 
        const response = await axios.get(divUrl + testDivEntry.div_id);
        expect(response.status).toBe(200);        
        const divEntries = response.data.divEntries;
        expect(divEntries).toHaveLength(4); // 4 divEntries for div in prisma/seeds.ts
        for (let i = 0; i < divEntries.length; i++) {
          expect(divEntries[i].div_id).toEqual(testDivEntry.div_id);
        }      
      })
      it('should get all divEntries for one div when div hdcp is 0', async () => {
        const response = await axios.get(divUrl + testDivEntry.div_id);
        expect(response.status).toBe(200);        
        const divEntries = response.data.divEntries;
        expect(divEntries).toHaveLength(4); // 4 divEntries for div in prisma/seeds.ts
        // get the only divEntry for testDivEntry
        const onePlayerDivEntry = divEntries.filter((divEntry: divEntryType) => divEntry.player_id === testDivEntry.player_id)[0];
        expect(onePlayerDivEntry.hdcp).toEqual(0);
      })
      it('should get all divEntries for one div when div hdcp is not 0', async () => {
        const hdcpDiv = {
          ...div,
          hdcp_per: 0.85,
        }
        await putDiv(hdcpDiv);
        const response = await axios.get(divUrl + testDivEntry.div_id);
        expect(response.status).toBe(200);        
        const divEntries = response.data.divEntries;
        expect(divEntries).toHaveLength(4); // 4 divEntries for div in prisma/seeds.ts
        // get the only divEntry for testDivEntry
        const onePlayerDivEntry = divEntries.filter((divEntry: divEntryType) => divEntry.player_id === testDivEntry.player_id)[0];
        expect(onePlayerDivEntry.hdcp).toEqual(8);
      })
      it('should get all divEntries for one div when div hdcp is not 0 and hdcp is int_hdcp is false', async () => {
        const hdcpDiv = {
          ...div,
          hdcp_per: 0.85,
          int_hdcp: false,
        }
        await putDiv(hdcpDiv);
        const response = await axios.get(divUrl + testDivEntry.div_id);
        expect(response.status).toBe(200);        
        const divEntries = response.data.divEntries;
        expect(divEntries).toHaveLength(4); // 4 divEntries for div in prisma/seeds.ts
        // get the only divEntry for testDivEntry
        const onePlayerDivEntry = divEntries.filter((divEntry: divEntryType) => divEntry.player_id === testDivEntry.player_id)[0];
        expect(onePlayerDivEntry.hdcp).toEqual(8.5);
      })
      it('should not get all divEntries for one div when divId is not found', async () => {
        const response = await axios.get(divUrl + notFoundDivId);
        expect(response.status).toBe(200);
        const divEntries = response.data.divEntries;
        expect(divEntries).toHaveLength(0);
      })          
    })

    describe('GET all divEntries for one div failures', () => { 
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
  })

  describe('GET all divEntries for one squad API: /api/divEntries/squad/:squadId', () => { 

    describe('GET all divEntries for one squad success', () => { 
      beforeAll(async () => {
        await deletePostedDivEntry();
        await putDiv(div);
      })

      afterEach(async () => {
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
      it('should get all divEntries for one squad when div hdcp is 0', async () => {
        const response = await axios.get(squadUrl + squadIdForDivEntries);
        expect(response.status).toBe(200);        
        const divEntries = response.data.divEntries;
        expect(divEntries).toHaveLength(4); // 4 divEntries for div in prisma/seeds.ts
        // get the only divEntry for testDivEntry
        const onePlayerDivEntry = divEntries.filter((divEntry: divEntryType) => divEntry.player_id === testDivEntry.player_id)[0];
        expect(onePlayerDivEntry.hdcp).toEqual(0);
      })
      it('should get all divEntries for one squad when div hdcp is not 0', async () => {
        const hdcpDiv = {
          ...div,
          hdcp_per: 0.85,
        }
        await putDiv(hdcpDiv);
        const response = await axios.get(squadUrl + squadIdForDivEntries);
        expect(response.status).toBe(200);        
        const divEntries = response.data.divEntries;
        expect(divEntries).toHaveLength(4); // 4 divEntries for div in prisma/seeds.ts
        // get the only divEntry for testDivEntry
        const onePlayerDivEntry = divEntries.filter((divEntry: divEntryType) => divEntry.player_id === testDivEntry.player_id)[0];
        expect(onePlayerDivEntry.hdcp).toEqual(8);
      })
      it('should get all divEntries for one squad when div hdcp is not 0 and hdcp is int_hdcp is false', async () => {
        const hdcpDiv = {
          ...div,
          hdcp_per: 0.85,
          int_hdcp: false,
        }
        await putDiv(hdcpDiv);
        const response = await axios.get(squadUrl + squadIdForDivEntries);
        expect(response.status).toBe(200);        
        const divEntries = response.data.divEntries;
        expect(divEntries).toHaveLength(4); // 4 divEntries for div in prisma/seeds.ts
        // get the only divEntry for testDivEntry
        const onePlayerDivEntry = divEntries.filter((divEntry: divEntryType) => divEntry.player_id === testDivEntry.player_id)[0];
        expect(onePlayerDivEntry.hdcp).toEqual(8.5);
      })
      it('should not get all divEntries for one squad when squadId is not found', async () => {
        const response = await axios.get(squadUrl + notFoundSquadId);
        expect(response.status).toBe(200);
        const divEntries = response.data.divEntries;
        expect(divEntries).toHaveLength(0);
      })          
    })

    describe('GET all divEntries for one squad failures', () => { 
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
  })

  describe('GET all divEntries for one tmnt API: /api/divEntries/tmnt/:tmntId', () => { 

    describe('GET all divEntries for one tmnt success', () => { 

      beforeAll(async () => {
        await deletePostedDivEntry();
        await putDiv(div);
      })

      afterEach(async () => {
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

      it('should get all divEntries for one tmnt when div hdcp is 0', async () => {        
        const response = await axios.get(tmntUrl + tmntIdForDivEntries);
        expect(response.status).toBe(200);        
        const divEntries = response.data.divEntries;
        expect(divEntries).toHaveLength(4); // 4 divEntries for div in prisma/seeds.ts
        // get the only divEntry for testDivEntry
        const onePlayerDivEntry = divEntries.filter((divEntry: divEntryType) => divEntry.player_id === testDivEntry.player_id)[0];
        expect(onePlayerDivEntry.hdcp).toEqual(0);
      })
      it('should get all divEntries for one tmnt when div hdcp is not 0', async () => {
        const hdcpDiv = {
          ...div,
          hdcp_per: 0.85,
        }
        await putDiv(hdcpDiv);        
        const response = await axios.get(tmntUrl + tmntIdForDivEntries);
        expect(response.status).toBe(200);        
        const divEntries = response.data.divEntries;
        expect(divEntries).toHaveLength(4); // 4 divEntries for div in prisma/seeds.ts
        // get the only divEntry for testDivEntry
        const onePlayerDivEntry = divEntries.filter((divEntry: divEntryType) => divEntry.player_id === testDivEntry.player_id)[0];
        expect(onePlayerDivEntry.hdcp).toEqual(8);
      })
      it('should get all divEntries for one tmnt when div hdcp is not 0 and hdcp is int_hdcp is false', async () => {
        const hdcpDiv = {
          ...div,
          hdcp_per: 0.85,
          int_hdcp: false,
        }
        await putDiv(hdcpDiv);
        const response = await axios.get(tmntUrl + tmntIdForDivEntries);        
        expect(response.status).toBe(200);        
        const divEntries = response.data.divEntries;
        expect(divEntries).toHaveLength(4); // 4 divEntries for div in prisma/seeds.ts
        // get the only divEntry for testDivEntry
        const onePlayerDivEntry = divEntries.filter((divEntry: divEntryType) => divEntry.player_id === testDivEntry.player_id)[0];
        expect(onePlayerDivEntry.hdcp).toEqual(8.5);
      })
      it('should not get all divEntries for one tmnt when tmntId is not found', async () => {        
        const response = await axios.get(tmntUrl + notFoundTmntId);
        expect(response.status).toBe(200);
        const divEntries = response.data.divEntries;
        expect(divEntries).toHaveLength(0);
      })          
    })

    describe('GET all divEntries for one tmnt failures', () => { 
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
  })

  describe('POST one divEntry API: /api/divEntries', () => { 
    
    const divEntryToPost: divEntryType = {
      ...initDivEntry,     
      squad_id: 'sqd_7116ce5f80164830830a7157eb093396',
      div_id: 'div_f30aea2c534f4cfe87f4315531cef8ef',
      player_id: 'ply_bb0fd8bbd9e34d34a7fa90b4111c6e40',
      fee: '83'
    }

    let createdDivEntry = false;

    beforeAll(async () => {
      await deletePostedDivEntry();
    })

    beforeEach(() => {
      createdDivEntry = false;
    })

    afterEach(async () => {
      if (createdDivEntry) {
        await deletePostedDivEntry();
      }      
    })

    it('should post one divEntry', async () => {
      const divPlayerJSON = JSON.stringify(divEntryToPost);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: divPlayerJSON
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
    it('should NOT post a sanitized divEntry (saninted fee = "")', async () => { 
      const toSanitize = {
        ...divEntryToPost,
        fee: '   83  ',        
      }
      const divEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: divEntryJSON
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
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: divEntryJSON
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
    it('should not post one divEntry when squad_id is blank', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        squad_id: ''
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: divEntryJSON
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
    it('should not post one divEntry when div_id is blank', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        div_id: ''
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: divEntryJSON
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
    it('should not post one divEntry when player_id is blank', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        player_id: ''
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: divEntryJSON
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
    it('should not post one divEntry when fee is blank', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        fee: ''
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: divEntryJSON
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
    it('should not post one divEntry when id is invalid', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        id: 'test'
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: divEntryJSON
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
    it('should not post one divEntry when id is valid, but not a divEntry id', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        id: userId
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: divEntryJSON
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
    it('should not post one divEntry when squad_id is invalid', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        squad_id: 'test'
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: divEntryJSON
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
    it('should not post one divEntry when squad_id is valid, but not a squad id', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        squad_id: userId
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: divEntryJSON
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
    it('should not post one divEntry when div_id is invalid', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        div_id: 'test'
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: divEntryJSON
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
    it('should not post one divEntry when div_id is valid, bit not a div id', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        div_id: userId
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: divEntryJSON
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
    it('should not post one divEntry when player_id is invalid', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        player_id: 'test'
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: divEntryJSON
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
    it('should not post one divEntry when player_id is valid, but not a player id', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        player_id: userId
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: divEntryJSON
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
    it('should not post one divEntry when fee is too low', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        fee: '-1'
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: divEntryJSON
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
    it('should not post one divEntry when fee is too high', async () => {
      const invalidDivEntry = {
        ...divEntryToPost,
        fee: '1234567890'
      } 
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: divEntryJSON
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

  describe('POST many divEntries for one tmnt API: /api/divEntries/many', () => { 

    let createdDivEntries = false;    

    beforeAll(async () => { 
      await deleteAllDivEntriesForTmnt(tmntIdForMulti);
    })

    beforeEach(() => {
      createdDivEntries = false;
    })

    afterEach(async () => {
      if (createdDivEntries) {
        await deleteAllDivEntriesForTmnt(tmntIdForMulti);
      }      
    })

    it('should create many divEntries', async () => {      
      const divEntryJSON = JSON.stringify(mockDivEntriesToPost);
      const response = await axios({
        method: "post",
        data: divEntryJSON,
        withCredentials: true,
        url: manyUrl,        
      })
      expect(response.status).toBe(201);
      createdDivEntries = true;
      expect(response.data.count).toBe(mockDivEntriesToPost.length);

      const postedDivEntries = await getAllDivEntriesForSquad(mockDivEntriesToPost[0].squad_id);      
      expect(response.status).toBe(201);      
      if (!postedDivEntries) {
        expect(true).toBeFalsy();
        return
      }
      expect(postedDivEntries).not.toBeNull();
      expect(postedDivEntries.length).toBe(mockDivEntriesToPost.length);
      for (let i = 0; i < mockDivEntriesToPost.length; i++) {
        expect(postedDivEntries[i].id).toBe(mockDivEntriesToPost[i].id);
        expect(postedDivEntries[i].squad_id).toBe(mockDivEntriesToPost[i].squad_id);
        expect(postedDivEntries[i].div_id).toBe(mockDivEntriesToPost[i].div_id);
        expect(postedDivEntries[i].player_id).toBe(mockDivEntriesToPost[i].player_id);
        expect(postedDivEntries[i].fee).toBe(mockDivEntriesToPost[i].fee);        
      }
    })
    it('should return 0 if passed an empty array', async () => { 
      const divEntryJSON = JSON.stringify([]);
      const response = await axios({
        method: "post",
        data: divEntryJSON,
        withCredentials: true,
        url: manyUrl,        
      })
      expect(response.status).toBe(200);      
      expect(response.data.count).toBe(0);
    })
    it('should NOT create many divEntries with sanitzied data, fee sanitized to ""', async () => { 
      const toSanitize = cloneDeep(mockDivEntriesToPost);
      toSanitize[0].fee = '   84  ';      
      const divEntryJSON = JSON.stringify(toSanitize);      
      try {
        const response = await axios({
          method: "post",
          data: divEntryJSON,
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
    it('shold NOT create many divEntries with blank ids', async () => {
      const toSanitize = cloneDeep(mockDivEntriesToPost);      
      toSanitize[1].id = '';
      const divEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: divEntryJSON,
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
    it('should NOT create many divEntries with blank squad_id', async () => {
      const toSanitize = cloneDeep(mockDivEntriesToPost);      
      toSanitize[1].squad_id = '';
      const divEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: divEntryJSON,
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
    it('should NOT create many divEntries with blank div_id', async () => {
      const toSanitize = cloneDeep(mockDivEntriesToPost);      
      toSanitize[1].div_id = '';
      const divEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: divEntryJSON,
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
    it('should NOT create many divEntries with blank player_id', async () => {
      const toSanitize = cloneDeep(mockDivEntriesToPost);      
      toSanitize[1].player_id = '';
      const divEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: divEntryJSON,
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
    it('should NOT create many divEntries with blank fee', async () => {
      const toSanitize = cloneDeep(mockDivEntriesToPost);      
      toSanitize[1].fee = '';
      const divEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: divEntryJSON,
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
    it('should NOT create many divEntries with invalid id', async () => {
      const toSanitize = cloneDeep(mockDivEntriesToPost);      
      toSanitize[1].id = 'test';
      const divEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: divEntryJSON,
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
    it('should NOT create many divEntries with valid id, but not a divEntry id', async () => {
      const toSanitize = cloneDeep(mockDivEntriesToPost);      
      toSanitize[1].id = userId;
      const divEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: divEntryJSON,
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
    it('should NOT create many divEntries with invalid squad_id', async () => { 
      const toSanitize = cloneDeep(mockDivEntriesToPost);      
      toSanitize[1].squad_id = 'test';
      const divEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: divEntryJSON,
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
    it('should NOT create many divEntries with valid squad_id, but not a squad id', async () => {
      const toSanitize = cloneDeep(mockDivEntriesToPost);      
      toSanitize[1].squad_id = userId;
      const divEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: divEntryJSON,
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
    it('should NOT create many divEntries with invalid div_id', async () => {
      const toSanitize = cloneDeep(mockDivEntriesToPost);      
      toSanitize[1].div_id = 'test';
      const divEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: divEntryJSON,
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
    it('should NOT create many divEntries with valid div_id, but not a div id', async () => {
      const toSanitize = cloneDeep(mockDivEntriesToPost);      
      toSanitize[1].div_id = userId;
      const divEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: divEntryJSON,
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
    it('should NOT create many divEntries with invalid player_id', async () => {
      const toSanitize = cloneDeep(mockDivEntriesToPost);      
      toSanitize[1].player_id = 'test';
      const divEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: divEntryJSON,
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
    it('should NOT create many divEntries with valid player_id, but not a player id', async () => {
      const toSanitize = cloneDeep(mockDivEntriesToPost);      
      toSanitize[1].player_id = userId;
      const divEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: divEntryJSON,
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
    it('should NOT create many divEntries when fee to too low', async () => {
      const toSanitize = cloneDeep(mockDivEntriesToPost);      
      toSanitize[1].fee = '-1';
      const divEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: divEntryJSON,
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
    it('should NOT create many divEntries when fee to too high', async () => {
      const toSanitize = cloneDeep(mockDivEntriesToPost);
      toSanitize[1].fee = '9999999999';
      const divEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: divEntryJSON,
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

  describe('PUT many divEntries - API: /api/divEntries/many', () => { 

    let createdDivEntries = false;

    const divEntriesToDelTmntId = 'tmt_d9b1af944d4941f65b2d2d4ac160cdea';

    beforeAll(async () => {
      await deleteAllDivEntriesForTmnt(divEntriesToDelTmntId);
    })

    beforeEach(() => {
      createdDivEntries = false;
    })

    afterEach(async () => {
      if (createdDivEntries) {
        await deleteAllDivEntriesForTmnt(divEntriesToDelTmntId);
      }      
    })

    afterAll(async () => {
      await deleteAllDivEntriesForTmnt(divEntriesToDelTmntId);
    })

    const mockMultiDivEntriesToPost = cloneDeep(mockDivEntriesToPost);

    it('should update many divEntries - just update 1 player 2 div entry', async () => {
      const divEntryJSON = JSON.stringify(mockMultiDivEntriesToPost);
      const response = await axios({
        method: "post",
        data: divEntryJSON,
        withCredentials: true,
        url: manyUrl,        
      })
      expect(response.status).toBe(201);
      createdDivEntries = true;
      expect(response.data.count).toBe(mockMultiDivEntriesToPost.length);
      const postedDivEntries = await getAllDivEntriesForSquad(mockMultiDivEntriesToPost[0].squad_id);
      if (!postedDivEntries) {
        expect(true).toBeFalsy();
        return
      }            
      expect(postedDivEntries.length).toBe(mockMultiDivEntriesToPost.length);
      
      // change fee 
      // change average, add eType = 'u'
      const divEntriesToUpdate = [
        {
          ...mockMultiDivEntriesToPost[0],
          fee: '83',
          eType: "u",
        },
        {
          ...mockMultiDivEntriesToPost[1],
          fee: '63',
          eType: "u",
        },
      ]
      const toUpdateJSON = JSON.stringify(divEntriesToUpdate) 
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
    })
    it('should update many divEntries - just update 2 player 1 div entry', async () => {
      const divEntryJSON = JSON.stringify(mockMultiDivEntriesToPost);
      const response = await axios({
        method: "post",
        data: divEntryJSON,
        withCredentials: true,
        url: manyUrl,        
      })
      expect(response.status).toBe(201);
      createdDivEntries = true;
      expect(response.data.count).toBe(mockMultiDivEntriesToPost.length);
      const postedDivEntries = await getAllDivEntriesForSquad(mockMultiDivEntriesToPost[0].squad_id);
      if (!postedDivEntries) {
        expect(true).toBeFalsy();
        return
      }            
      expect(postedDivEntries.length).toBe(mockMultiDivEntriesToPost.length);
      // change fee 
      // change average, add eType = 'u'
      const divEntriesToUpdate = [
        {
          ...mockMultiDivEntriesToPost[0],
          fee: '83',
          eType: "u",
        },
        {
          ...mockMultiDivEntriesToPost[2],
          fee: '83',
          eType: "u",
        },
      ]
      const toUpdateJSON = JSON.stringify(divEntriesToUpdate) 
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
    })
    it('should update many divEntries - just update 2 player 2 div entry', async () => {
      const divEntryJSON = JSON.stringify(mockMultiDivEntriesToPost);
      const response = await axios({
        method: "post",
        data: divEntryJSON,
        withCredentials: true,
        url: manyUrl,        
      })
      expect(response.status).toBe(201);
      createdDivEntries = true;
      expect(response.data.count).toBe(mockMultiDivEntriesToPost.length);
      const postedDivEntries = await getAllDivEntriesForSquad(mockMultiDivEntriesToPost[0].squad_id);
      if (!postedDivEntries) {
        expect(true).toBeFalsy();
        return
      }            
      expect(postedDivEntries.length).toBe(mockMultiDivEntriesToPost.length);
      // change fee 
      // change average, add eType = 'u'
      const divEntriesToUpdate = [
        {
          ...mockMultiDivEntriesToPost[0],
          fee: '83',
          eType: "u",
        },
        {
          ...mockMultiDivEntriesToPost[1],
          fee: '83',
          eType: "u",
        },
        {
          ...mockMultiDivEntriesToPost[2],
          fee: '63',
          eType: "u",
        },
        {
          ...mockMultiDivEntriesToPost[3],
          fee: '63',
          eType: "u",
        },
      ]
      const toUpdateJSON = JSON.stringify(divEntriesToUpdate) 
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
    })
    it('should insert many divEntries - just insert 1 player 2 div entries', async () => { 
      createdDivEntries = true;
      // add eType = 'u'
      const divEntriesToInsert = [
        {
          ...mockMultiDivEntriesToPost[0],          
          eType: "i",
        },
        {
          ...mockMultiDivEntriesToPost[1],          
          eType: "i",
        },
      ]
      const toUpdateJSON = JSON.stringify(divEntriesToInsert) 
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })

      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.inserts).toBe(2);
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.deletes).toBe(0);     
    })
    it('should insert many divEntries - just insert 2 player 1 div entries', async () => { 
      createdDivEntries = true;
      // add eType = 'u'
      const divEntriesToInsert = [
        {
          ...mockMultiDivEntriesToPost[0],          
          eType: "i",
        },
        {
          ...mockMultiDivEntriesToPost[2],          
          eType: "i",
        },
      ]
      const toUpdateJSON = JSON.stringify(divEntriesToInsert) 
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })

      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.inserts).toBe(2);
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.deletes).toBe(0);      
    })
    it('should insert many divEntries - just insert 2 player 2 div entries', async () => { 
      createdDivEntries = true;
      // add eType = 'u'
      const divEntriesToInsert = [
        {
          ...mockMultiDivEntriesToPost[0],          
          eType: "i",
        },
        {
          ...mockMultiDivEntriesToPost[1],          
          eType: "i",
        },
        {
          ...mockMultiDivEntriesToPost[2],          
          eType: "i",
        },
        {
          ...mockMultiDivEntriesToPost[3],          
          eType: "i",
        },
      ]
      const toUpdateJSON = JSON.stringify(divEntriesToInsert) 
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })

      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.inserts).toBe(4);
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.deletes).toBe(0);      
    })
    it('should delete many divEntries - just delete 1 player 2 div entry', async () => {
      const divEntryJSON = JSON.stringify(mockMultiDivEntriesToPost);
      const response = await axios({
        method: "post",
        data: divEntryJSON,
        withCredentials: true,
        url: manyUrl,        
      })
      expect(response.status).toBe(201);
      createdDivEntries = true;
      expect(response.data.count).toBe(mockMultiDivEntriesToPost.length);
      const postedDivEntries = await getAllDivEntriesForSquad(mockMultiDivEntriesToPost[0].squad_id);
      if (!postedDivEntries) {
        expect(true).toBeFalsy();
        return
      }            
      expect(postedDivEntries.length).toBe(mockMultiDivEntriesToPost.length);
      // set eType = 'd'
      const divEntriesToUpdate = [
        {
          ...mockMultiDivEntriesToPost[0],          
          eType: "d",
        },
        {
          ...mockMultiDivEntriesToPost[2],          
          eType: "d",
        },
      ]
      const toUpdateJSON = JSON.stringify(divEntriesToUpdate) 
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })

      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.deletes).toBe(2);
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.inserts).toBe(0);      
    })
    it('should delete many divEntries - just delete 2 player 1 div entry', async () => {
      const divEntryJSON = JSON.stringify(mockMultiDivEntriesToPost);
      const response = await axios({
        method: "post",
        data: divEntryJSON,
        withCredentials: true,
        url: manyUrl,        
      })
      expect(response.status).toBe(201);
      createdDivEntries = true;
      expect(response.data.count).toBe(mockMultiDivEntriesToPost.length);
      const postedDivEntries = await getAllDivEntriesForSquad(mockMultiDivEntriesToPost[0].squad_id);
      if (!postedDivEntries) {
        expect(true).toBeFalsy();
        return
      }            
      expect(postedDivEntries.length).toBe(mockMultiDivEntriesToPost.length);
      // set eType = 'd'
      const divEntriesToUpdate = [
        {
          ...mockMultiDivEntriesToPost[0],          
          eType: "d",
        },
        {
          ...mockMultiDivEntriesToPost[2],          
          eType: "d",
        },
      ]
      const toUpdateJSON = JSON.stringify(divEntriesToUpdate) 
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })

      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.deletes).toBe(2);
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.inserts).toBe(0);      
    })
    it('should delete many divEntries - just delete 2 player 2 div entry', async () => {
      const divEntryJSON = JSON.stringify(mockMultiDivEntriesToPost);
      const response = await axios({
        method: "post",
        data: divEntryJSON,
        withCredentials: true,
        url: manyUrl,        
      })
      expect(response.status).toBe(201);
      createdDivEntries = true;
      expect(response.data.count).toBe(mockMultiDivEntriesToPost.length);
      const postedDivEntries = await getAllDivEntriesForSquad(mockMultiDivEntriesToPost[0].squad_id);
      if (!postedDivEntries) {
        expect(true).toBeFalsy();
        return
      }            
      expect(postedDivEntries.length).toBe(mockMultiDivEntriesToPost.length);
      // set eType = 'd'
      const divEntriesToUpdate = [
        {
          ...mockMultiDivEntriesToPost[0],          
          eType: "d",
        },
        {
          ...mockMultiDivEntriesToPost[1],          
          eType: "d",
        },
        {
          ...mockMultiDivEntriesToPost[2],          
          eType: "d",
        },
        {
          ...mockMultiDivEntriesToPost[3],          
          eType: "d",
        },
      ]
      const toUpdateJSON = JSON.stringify(divEntriesToUpdate) 
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })

      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.deletes).toBe(4);
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.inserts).toBe(0);      
    })
    it('should update, insert and delete many divEntries', async () => {
      const divEntryJSON = JSON.stringify(mockDivEntriesToPost);
      const response = await axios({
        method: "post",
        data: divEntryJSON,
        withCredentials: true,
        url: manyUrl,        
      })
      expect(response.status).toBe(201);
      createdDivEntries = true;
      expect(response.data.count).toBe(mockMultiDivEntriesToPost.length);
      const postedDivEntries = await getAllDivEntriesForSquad(mockMultiDivEntriesToPost[0].squad_id);
      if (!postedDivEntries) {
        expect(true).toBeFalsy();
        return
      }            
      expect(postedDivEntries.length).toBe(mockMultiDivEntriesToPost.length);
      // set divs edits, set eType
      const divEntriesToUpdate = [
        {
          ...mockMultiDivEntriesToPost[0],          
          fee: '83',
          eType: "u",
        },
        {
          ...mockMultiDivEntriesToPost[1],          
          fee: '83',
          eType: "u",
        },
        {
          ...mockMultiDivEntriesToPost[2],          
          eType: "d",
        },
        {
          ...mockMultiDivEntriesToPost[3],          
          eType: "d",
        },
        {
          ...initDivEntry,
          id: "den_05be0472be3d476ea1caa99dd05953fa",
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          div_id: 'div_18997d3fd7ef4eb7ad2b53a9e93f9ce5',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          fee: '83',
          eType: "i"
        },
        {
          ...initDivEntry,
          id: "den_06be0472be3d476ea1caa99dd05953fa",
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          div_id: 'div_367309aa1444446ea9ab23d2e4aae98f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          fee: '83',
          eType: "i"
        },
      ]
      const toUpdateJSON = JSON.stringify(divEntriesToUpdate) 
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })

      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.deletes).toBe(2);
      expect(updateInfo.updates).toBe(2);
      expect(updateInfo.inserts).toBe(2);      
    })
    it('should NOT update, insert and delete many divEntries with invalid data', async () => {
      const divEntryJSON = JSON.stringify(mockDivEntriesToPost);
      const response = await axios({
        method: "post",
        data: divEntryJSON,
        withCredentials: true,
        url: manyUrl,        
      })
      expect(response.status).toBe(201);
      createdDivEntries = true;
      expect(response.data.count).toBe(mockMultiDivEntriesToPost.length);
      const postedDivEntries = await getAllDivEntriesForSquad(mockMultiDivEntriesToPost[0].squad_id);
      if (!postedDivEntries) {
        expect(true).toBeFalsy();
        return
      }            
      expect(postedDivEntries.length).toBe(mockMultiDivEntriesToPost.length);
      // set divs edits, set eType
      const divEntriesToUpdate = [
        {
          ...mockMultiDivEntriesToPost[0],          
          fee: '1234567890',
          eType: "u",
        },
        {
          ...mockMultiDivEntriesToPost[1],          
          fee: '83',
          eType: "d",
        },
        {
          ...mockMultiDivEntriesToPost[2],          
          eType: "d",
        },
        {
          ...mockMultiDivEntriesToPost[3],          
          eType: "d",
        },
        {
          ...initDivEntry,
          id: "den_03be0472be3d476ea1caa99dd05953fa",
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          div_id: 'div_18997d3fd7ef4eb7ad2b53a9e93f9ce5',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          fee: '83',
          eType: "i"
        },
        {
          ...initDivEntry,
          id: "den_04be0472be3d476ea1caa99dd05953fa",
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          div_id: 'div_367309aa1444446ea9ab23d2e4aae98f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          fee: '83',
          eType: "i"
        },
      ]
      const toUpdateJSON = JSON.stringify(divEntriesToUpdate) 
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
    })

  })

  describe('PUT one divEntry API: /api/divEntries/divEntry/:id', () => { 

    const resetDivEntry = async () => {
      // make sure test player is reset in database
      const divEntryJSON = JSON.stringify(testDivEntry);
      const putResponse = await axios({
        method: "put",
        data: divEntryJSON,
        withCredentials: true,
        url: oneDivEntryUrl + testDivEntry.id,
      })
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
      await resetDivEntry()
    })

    beforeEach(() => {
      didPut = false;
    })

    afterEach(async () => {
      if (didPut) {        
        await resetDivEntry()
      }      
    })

    it('should update a divEntry by ID', async () => {
      const divEntryJSON = JSON.stringify(putDivEntry);
      const response = await axios({
        method: "put",
        data: divEntryJSON,
        withCredentials: true,
        url: oneDivEntryUrl + testDivEntry.id,
      });
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
      const response = await axios({
        method: "put",
        data: divEntryJSON,
        withCredentials: true,
        url: oneDivEntryUrl + testDivEntry.id,
      });
      expect(response.status).toBe(200);
      didPut = true;
      const puttedDivEntry = response.data.divEntry;
      expect(puttedDivEntry.squad_id).toBe(putDivEntry.squad_id);
      expect(puttedDivEntry.div_id).toBe(putDivEntry.div_id);
      expect(puttedDivEntry.player_id).toBe(putDivEntry.player_id);
      expect(puttedDivEntry.fee).toBe(putDivEntry.fee);
    })
    it('should not update a divEntry by ID when squad_id is blank', async () => {
      const invalidDivEntry = {
        ...putDivEntry,
        squad_id: ''
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "put",
          data: divEntryJSON,
          withCredentials: true,
          url: oneDivEntryUrl + testDivEntry.id,
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
    it('should not update a divEntry by ID when div_id is blank', async () => {
      const invalidDivEntry = {
        ...putDivEntry,
        div_id: ''
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "put",
          data: divEntryJSON,
          withCredentials: true,
          url: oneDivEntryUrl + testDivEntry.id,
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
    it('should not update a divEntry by ID when player_id is blank', async () => {
      const invalidDivEntry = {
        ...putDivEntry,
        player_id: ''
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "put",
          data: divEntryJSON,
          withCredentials: true,
          url: oneDivEntryUrl + testDivEntry.id,
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
    it('should not update a divEntry by ID when fee is blank', async () => {
      const invalidDivEntry = {
        ...putDivEntry,
        fee: ''
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "put",
          data: divEntryJSON,
          withCredentials: true,
          url: oneDivEntryUrl + testDivEntry.id,
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
    it('should not update a divEntry by ID when fee is too low', async () => {
      const invalidDivEntry = {
        ...putDivEntry,
        fee: '-1'
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "put",
          data: divEntryJSON,
          withCredentials: true,
          url: oneDivEntryUrl + testDivEntry.id,
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
    it('should not update a divEntry by ID when fee is too high', async () => {
      const invalidDivEntry = {
        ...putDivEntry,
        fee: '1234567890'
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "put",
          data: divEntryJSON,
          withCredentials: true,
          url: oneDivEntryUrl + testDivEntry.id,
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
    it('should not update a divEntry by ID when fee is not a number', async () => {
      const invalidDivEntry = {
        ...putDivEntry,
        fee: 'not a number'
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "put",
          data: divEntryJSON,
          withCredentials: true,
          url: oneDivEntryUrl + testDivEntry.id,
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

  describe('PATCH one divEntry API: /api/divEntries/divEntry/:id', () => { 

    const toPatch = {
      id: testDivEntry.id,
    }
    
    const doResetDivEntry = async () => {
      try {
        const playerJSON = JSON.stringify(testDivEntry);
        const putResponse = await axios({
          method: "patch",
          data: playerJSON,
          withCredentials: true,
          url: oneDivEntryUrl + testDivEntry.id,
        })
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }

    let didPatch = false;

    beforeAll(async () => {
      await doResetDivEntry
    })

    beforeEach(() => {
      didPatch = false;
    })

    afterEach(async () => {
      if (didPatch) {
        await doResetDivEntry();
      }
    })

    it('should patch squad_id in a divEntry by ID', async () => { 
      const toPatchSquadId = 'sqd_1a6c885ee19a49489960389193e8f819'
      const patchDivEntry = {
        ...toPatch,
        squad_id: toPatchSquadId,
      }
      const divEntryJSON = JSON.stringify(patchDivEntry);
      const response = await axios({
        method: "patch",
        data: divEntryJSON,
        withCredentials: true,
        url: oneDivEntryUrl + toPatch.id,
      });
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
      const response = await axios({
        method: "patch",
        data: divEntryJSON,
        withCredentials: true,
        url: oneDivEntryUrl + toPatch.id,
      });
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
      const response = await axios({
        method: "patch",
        data: divEntryJSON,
        withCredentials: true,
        url: oneDivEntryUrl + toPatch.id,
      });
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
      const response = await axios({
        method: "patch",
        data: divEntryJSON,
        withCredentials: true,
        url: oneDivEntryUrl + toPatch.id,
      });
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedDivEntry = response.data.divEntry;
      expect(patchedDivEntry.id).toBe(toPatch.id);
      expect(patchedDivEntry.fee).toBe(toPatchedFee);      
    })
    it('should not patch a divEntry by ID when squad_id is blank', async () => {
      const invalidDivEntry = {
        ...toPatch,
        squad_id: ''
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "patch",
          data: divEntryJSON,
          withCredentials: true,
          url: oneDivEntryUrl + toPatch.id,
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
    it('should not patch a divEntry by ID when squad_id is invalid', async () => {
      const invalidDivEntry = {
        ...toPatch,
        squad_id: 'test'
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "patch",
          data: divEntryJSON,
          withCredentials: true,
          url: oneDivEntryUrl + toPatch.id,
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
    it('should not patch a divEntry by ID when div_id is blank', async () => {
      const invalidDivEntry = {
        ...toPatch,
        div_id: ''
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "patch",
          data: divEntryJSON,
          withCredentials: true,
          url: oneDivEntryUrl + toPatch.id,
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
    it('should not patch a divEntry by ID when div_id is valid, but not a div id', async () => { 
      const invalidDivEntry = {
        ...toPatch,
        div_id: userId
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "patch",
          data: divEntryJSON,
          withCredentials: true,
          url: oneDivEntryUrl + toPatch.id,
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
    it('should not patch a divEntry by ID when div_id is invalid', async () => {
      const invalidDivEntry = {
        ...toPatch,
        div_id: 'test'
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "patch",
          data: divEntryJSON,
          withCredentials: true,
          url: oneDivEntryUrl + toPatch.id,
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
    it('should not patch a divEntry by ID when div_id is valid, but not a div id', async () => { 
      const invalidDivEntry = {
        ...toPatch,
        div_id: userId
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "patch",
          data: divEntryJSON,
          withCredentials: true,
          url: oneDivEntryUrl + toPatch.id,
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
    it('should not patch a divEntry by ID when player_id is blank', async () => {
      const invalidDivEntry = {
        ...toPatch,
        player_id: ''
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "patch",
          data: divEntryJSON,
          withCredentials: true,
          url: oneDivEntryUrl + toPatch.id,
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
    it('should not patch a divEntry by ID when player_id is invalid', async () => {
      const invalidDivEntry = {
        ...toPatch,
        player_id: 'test'
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "patch",
          data: divEntryJSON,
          withCredentials: true,
          url: oneDivEntryUrl + toPatch.id,
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
    it('should not patch a divEntry by ID when player_id is valid, but not a player id', async () => { 
      const invalidDivEntry = {
        ...toPatch,
        player_id: userId
      }
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "patch",
          data: divEntryJSON,
          withCredentials: true,
          url: oneDivEntryUrl + toPatch.id,
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
    it('should not patch a divEntry by ID when fee is blank', async () => {
      const invalidDivEntry = {
        ...toPatch,
        fee: ''
      } 
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "patch",
          data: divEntryJSON,
          withCredentials: true,
          url: oneDivEntryUrl + toPatch.id,
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
    it('should not patch a divEntry by ID when fee is too low', async () => {
      const invalidDivEntry = {
        ...toPatch,
        fee: '-1'
      } 
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "patch",
          data: divEntryJSON,
          withCredentials: true,
          url: oneDivEntryUrl + toPatch.id,
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
    it('should not patch a divEntry by ID when fee is too high', async () => {
      const invalidDivEntry = {
        ...toPatch,
        fee: '1234567890'
      } 
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "patch",
          data: divEntryJSON,
          withCredentials: true,
          url: oneDivEntryUrl + toPatch.id,
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
    it('should not patch a divEntry by ID when fee is not a number', async () => {
      const invalidDivEntry = {
        ...toPatch,
        fee: 'abc'
      } 
      const divEntryJSON = JSON.stringify(invalidDivEntry);
      try {
        const response = await axios({
          method: "patch",
          data: divEntryJSON,
          withCredentials: true,
          url: oneDivEntryUrl + toPatch.id,
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
        const playerJSON = JSON.stringify(toDelDivEntry);
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

    it('should delete a divEntry by ID', async () => { 
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: oneDivEntryUrl + toDelDivEntry.id,
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
    it(('should NOT delete a divEntry by ID when ID is invalid'), async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: oneDivEntryUrl + "invalid_id",
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
    it('should NOT delete a divEntry by ID when id is valid, bit noy a divEntry id', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: oneDivEntryUrl + userId,
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
    it('should NOT delete a divEntry by ID when id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: oneDivEntryUrl + notFoundId,
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

  describe('DELETE all divEntries for one div - API: /api/divEntries/div/:div_id', () => { 
    
    const divIdForDivEntries = mockDivEntriesToPost[0].div_id

    beforeAll(async () => { 
      await deleteAllDivEntriesForTmnt(tmntIdForMulti)
    })

    beforeEach(async () => {
      await postManyDivEntries(mockDivEntriesToPost)
    })

    afterEach(async () => {
      await deleteAllDivEntriesForTmnt(tmntIdForMulti)
    })

    it('should delete all divEntries for one div', async () => { 
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: divUrl + divIdForDivEntries
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(2);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all divEntries for one div when ID is invalid', async () => {
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
    it('should NOT delete all divEntries for one div when ID valid, but not a div ID', async () => {
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
    it('should delete 0 divEntries for a div when div id is not found', async () => {
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

  describe('DELETE all divEntries for one squad - API: /api/divEntries/squad/:squad_id', () => { 
    
    const squadIdForDivEntries = mockDivEntriesToPost[0].squad_id

    beforeAll(async () => { 
      await deleteAllDivEntriesForTmnt(tmntIdForMulti)
    })

    beforeEach(async () => {
      await postManyDivEntries(mockDivEntriesToPost)
    })

    afterEach(async () => {
      await deleteAllDivEntriesForTmnt(tmntIdForMulti)
    })

    it('should delete all divEntries for one squad', async () => { 
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: squadUrl + squadIdForDivEntries
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(4);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all divEntries for one squad when ID is invalid', async () => {
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
    it('should NOT delete all divEntries for one squad when ID valid, but not a squad ID', async () => {
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
    it('should delete 0 divEntries for a squad when squad id is not found', async () => {
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

  describe('DELETE all divEntries for one tmnt - API: /api/divEntries/tmnt/:tmnt_id', () => { 
    
    beforeAll(async () => {
      await postManyDivEntries(mockDivEntriesToPost);
    })

    afterAll(async () => {
      await deleteAllDivEntriesForTmnt(tmntIdForMulti);
    })

    it('should delete all divEntries for a tmnt', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + tmntIdForMulti
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(mockDivEntriesToPost.length);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all divEntries for a tmnt when tmnt id is not valid', async () => {
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
    it('should NOT delete all divEntries for a tmnt when tmnt id is valid, but not a squad id', async () => {
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
    it('should delete 0 divEntries for a tmnt when tmnt id is not found', async () => {
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