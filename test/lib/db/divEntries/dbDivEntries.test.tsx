import axios, { AxiosError } from "axios";
import { baseDivEntriesApi } from "@/lib/db/apiPaths";
import { testBaseDivEntriesApi } from "../../../testApi";
import { divEntryRawWithHdcpType, divEntryType, divType, HdcpForTypes, playerType, tmntEntryDivEntryType } from "@/lib/types/types";
import { initDiv, initDivEntry, initPlayer } from "@/lib/db/initVals";
import { mockDivEntriesToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { deleteAllDivEntriesForDiv, deleteAllDivEntriesForSquad, deleteAllDivEntriesForTmnt, deleteDivEntry, getAllDivEntriesForDiv, getAllDivEntriesForSquad, getAllDivEntriesForTmnt, postDivEntry, postManyDivEntries, putDivEntry, putManyDivEntries } from "@/lib/db/divEntries/dbDivEntries";
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

const divEntriesToGet: divEntryType[] = [
  {
    ...initDivEntry,
    id: "den_652fc6c5556e407291c4b5666b2dccd7",                
    squad_id: 'sqd_7116ce5f80164830830a7157eb093396',
    div_id: 'div_f30aea2c534f4cfe87f4315531cef8ef',
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
    fee: '80',
  },
  {
    ...initDivEntry,
    id: "den_ef36111c721147f7a2bf2702056947ce",      
    squad_id: 'sqd_7116ce5f80164830830a7157eb093396',
    div_id: 'div_f30aea2c534f4cfe87f4315531cef8ef',
    player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
    fee: '80',
  },
  {
    ...initDivEntry,
    id: "den_856cce7a69644e26911e65cd02ee1b23",      
    squad_id: 'sqd_7116ce5f80164830830a7157eb093396',
    div_id: 'div_f30aea2c534f4cfe87f4315531cef8ef',
    player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
    fee: '80',
  },
  {
    ...initDivEntry,
    id: "den_4da45cadb7b84cfba255fc0ce36e9add",      
    squad_id: 'sqd_7116ce5f80164830830a7157eb093396',
    div_id: 'div_f30aea2c534f4cfe87f4315531cef8ef',
    player_id: 'ply_8b0fd8bbd9e34d34a7fa90b4111c6e40',
    fee: '80',
  }
]

const players: playerType[] = [
  {
    ...initPlayer,
    id: "ply_88be0472be3d476ea1caa99dd05953fa",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "John",
    last_name: "Doe",
    average: 220,
    lane: 1,
    position: "A",
  },
  {
    ...initPlayer,
    id: "ply_be57bef21fc64d199c2f6de4408bd136",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "James",
    last_name: "Bennett",
    average: 221,
    lane: 1,
    position: "B",
  },
  {
    ...initPlayer,
    id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "Olivia",
    last_name: "Morgan",
    average: 210,
    lane: 2,
    position: "C",
  },
  {
    ...initPlayer,
    id: "ply_8b0fd8bbd9e34d34a7fa90b4111c6e40",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "William",
    last_name: "Harris",
    average: 211,
    lane: 2,
    position: "D",
  }
]

const tmntIdForDivEntries = 'tmt_fd99387c33d9c78aba290286576ddce5';

const notFoundId = "den_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundPlayerId = "ply_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

const tmntIdToDel = 'tmt_d9b1af944d4941f65b2d2d4ac160cdea';

describe('dbDivEntries', () => { 

  const rePostDivEntry = async (divEntry: divEntryType) => {
    try {
      // if divEntry already in database, then don't re-post
      const getResponse = await axios.get(oneDivEntryUrl + divEntry.id);
      const found = getResponse.data.divEntry;
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
      const divEntryJSON = JSON.stringify(divEntry);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: divEntryJSON
      });    
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  }  

  const rePostToDel = async () => {
    const response = await axios.get(url);
    const divEntries = response.data.divEntries;
    const foundToDel = divEntries.find(
      (d: divEntryType) => d.id === mockDivEntriesToPost[0].id
    );
    if (!foundToDel) {
      try {
        await postManyDivEntries(mockDivEntriesToPost);
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }
  }

  const deletePostedDivEntry = async () => {
    const response = await axios.get(url);
    const divEntries = response.data.divEntries;
    const toDel = divEntries.find((d: divEntryRawWithHdcpType) => d.fee === 82);
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

  const calcHdcp = (divEntry: divEntryType, hdcpDiv: divType) => {
    const player = players.find(p => p.id === divEntry.player_id);
    if (!player) return -1;
    const hdcp = player.average < hdcpDiv.hdcp_from
      ? (hdcpDiv.int_hdcp
        ? Math.floor((hdcpDiv.hdcp_from - player.average) * hdcpDiv.hdcp_per)
        : ((hdcpDiv.hdcp_from - player.average) * hdcpDiv.hdcp_per))
      : 0;
    return hdcp;
  }

  describe('getAllDivEntriesForTmnt()', () => { 

    beforeAll(async () => {
      await deletePostedDivEntry();
      await putDiv(div);
    })

    afterEach(async () => {
      await putDiv(div);
    })

    it('should get all divEntries for tmnt', async () => { 
      const divEntries = await getAllDivEntriesForTmnt(tmntIdForDivEntries);
      expect(divEntries).toHaveLength(divEntriesToGet.length);
      if (!divEntries) return;
      for (let i = 0; i < divEntries.length; i++) {
        if (divEntries[i].id === divEntriesToGet[0].id) { 
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[0].player_id);          
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[0], div));
        } else if (divEntries[i].id === divEntriesToGet[1].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[1].player_id);          
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[1], div));
        } else if (divEntries[i].id === divEntriesToGet[2].id) { 
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[2].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[2], div));
        } else if (divEntries[i].id === divEntriesToGet[3].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[3].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[3], div));
        } else {
          expect(true).toBe(false);
        }        
        expect(divEntries[i].squad_id).toEqual(divEntriesToGet[i].squad_id);
        expect(divEntries[i].div_id).toEqual(divEntriesToGet[i].div_id);        
        expect(divEntries[i].fee).toEqual(divEntriesToGet[i].fee);
      }
    })
    it('should get all divEntries for tmnt when hdcp is not 0', async () => { 
      const hdcpDiv = {
        ...div,
        hdcp_per: 0.85,
      }
      await putDiv(hdcpDiv);      

      const divEntries = await getAllDivEntriesForTmnt(tmntIdForDivEntries);
      expect(divEntries).toHaveLength(divEntriesToGet.length);
      if (!divEntries) return;
      for (let i = 0; i < divEntries.length; i++) {
        if (divEntries[i].id === divEntriesToGet[0].id) { 
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[0].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[0], hdcpDiv));                    
        } else if (divEntries[i].id === divEntriesToGet[1].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[1].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[1], hdcpDiv));
        } else if (divEntries[i].id === divEntriesToGet[2].id) { 
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[2].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[2], hdcpDiv));
        } else if (divEntries[i].id === divEntriesToGet[3].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[3].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[3], hdcpDiv));
        } else {
          expect(true).toBe(false);
        }        
        expect(divEntries[i].squad_id).toEqual(divEntriesToGet[i].squad_id);
        expect(divEntries[i].div_id).toEqual(divEntriesToGet[i].div_id);        
        expect(divEntries[i].fee).toEqual(divEntriesToGet[i].fee);
      }
    })
    it('should get all divEntries for tmnt when hdcp is not 0 and int_hdcp = true' , async () => { 
      const hdcpDiv = {
        ...div,
        hdcp_per: 0.85,
        int_hdcp: true,
      }
      await putDiv(hdcpDiv);      

      const divEntries = await getAllDivEntriesForTmnt(tmntIdForDivEntries);
      expect(divEntries).toHaveLength(divEntriesToGet.length);
      if (!divEntries) return;
      for (let i = 0; i < divEntries.length; i++) {
        if (divEntries[i].id === divEntriesToGet[0].id) { 
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[0].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[0], hdcpDiv));
        } else if (divEntries[i].id === divEntriesToGet[1].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[1].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[1], hdcpDiv));
        } else if (divEntries[i].id === divEntriesToGet[2].id) { 
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[2].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[2], hdcpDiv));
        } else if (divEntries[i].id === divEntriesToGet[3].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[3].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[3], hdcpDiv));
        } else {
          expect(true).toBe(false);
        }        
        expect(divEntries[i].squad_id).toEqual(divEntriesToGet[i].squad_id);
        expect(divEntries[i].div_id).toEqual(divEntriesToGet[i].div_id);        
        expect(divEntries[i].fee).toEqual(divEntriesToGet[i].fee);
      }
    })
    it('should return 0 divEntries for not found tmnt', async () => { 
      const divEntries = await getAllDivEntriesForTmnt(notFoundTmntId);
      expect(divEntries).toHaveLength(0);
    })
    it('should return null if tmmt id is invalid', async () => { 
      const divEntries = await getAllDivEntriesForTmnt("test");
      expect(divEntries).toBeNull();
    })
    it('should return null if tmnt id is a valid id, but not a tmnt id', async () => {
      const divEntries = await getAllDivEntriesForTmnt(notFoundSquadId);
      expect(divEntries).toBeNull();
    }
    )
    it('should return null if tmnt id is null', async () => { 
      const divEntries = await getAllDivEntriesForTmnt(null as any);
      expect(divEntries).toBeNull();
    })
    it('should return null if tmnt id is undefined', async () => { 
      const divEntries = await getAllDivEntriesForTmnt(undefined as any);
      expect(divEntries).toBeNull();
    })
  })  

  describe('getAllDivEntriesForSquad()', () => {

    beforeAll(async () => {
      await deletePostedDivEntry();
      await putDiv(div);
    })

    afterEach(async () => {
      await putDiv(div);
    })

    it('should get all divEntries for squad', async () => { 
      const divEntries = await getAllDivEntriesForSquad(divEntriesToGet[0].squad_id);  
      expect(divEntries).toHaveLength(divEntriesToGet.length);
      if (!divEntries) return;
      for (let i = 0; i < divEntries.length; i++) {
        if (divEntries[i].id === divEntriesToGet[0].id) { 
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[0].player_id);
          expect(divEntries[i].hdcp).toEqual(divEntriesToGet[0].hdcp);
        } else if (divEntries[i].id === divEntriesToGet[1].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[1].player_id);
          expect(divEntries[i].hdcp).toEqual(divEntriesToGet[1].hdcp);
        } else if (divEntries[i].id === divEntriesToGet[2].id) { 
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[2].player_id);
          expect(divEntries[i].hdcp).toEqual(divEntriesToGet[2].hdcp);
        } else if (divEntries[i].id === divEntriesToGet[3].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[3].player_id);
          expect(divEntries[i].hdcp).toEqual(divEntriesToGet[3].hdcp);
        } else {
          expect(true).toBe(false);
        }        
        expect(divEntries[i].squad_id).toEqual(divEntriesToGet[i].squad_id);
        expect(divEntries[i].div_id).toEqual(divEntriesToGet[i].div_id);        
        expect(divEntries[i].fee).toEqual(divEntriesToGet[i].fee);
      }
    })
    it('should get all divEntries for squad when hdcp is not 0', async () => { 
      const hdcpDiv = {
        ...div,
        hdcp_per: 0.85,
      }
      await putDiv(hdcpDiv);      

      const divEntries = await getAllDivEntriesForSquad(divEntriesToGet[0].squad_id);  
      expect(divEntries).toHaveLength(divEntriesToGet.length);
      if (!divEntries) return;
      for (let i = 0; i < divEntries.length; i++) {
        if (divEntries[i].id === divEntriesToGet[0].id) { 
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[0].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[0], hdcpDiv));                    
        } else if (divEntries[i].id === divEntriesToGet[1].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[1].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[1], hdcpDiv));
        } else if (divEntries[i].id === divEntriesToGet[2].id) { 
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[2].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[2], hdcpDiv));
        } else if (divEntries[i].id === divEntriesToGet[3].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[3].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[3], hdcpDiv));
        } else {
          expect(true).toBe(false);
        }        
        expect(divEntries[i].squad_id).toEqual(divEntriesToGet[i].squad_id);
        expect(divEntries[i].div_id).toEqual(divEntriesToGet[i].div_id);        
        expect(divEntries[i].fee).toEqual(divEntriesToGet[i].fee);
      }
    })
    it('should get all divEntries for squad when hdcp is not 0 and int_hdcp = true' , async () => { 
      const hdcpDiv = {
        ...div,
        hdcp_per: 0.85,
        int_hdcp: true,
      }
      await putDiv(hdcpDiv);      

      const divEntries = await getAllDivEntriesForSquad(divEntriesToGet[0].squad_id);  
      expect(divEntries).toHaveLength(divEntriesToGet.length);
      if (!divEntries) return;
      for (let i = 0; i < divEntries.length; i++) {
        if (divEntries[i].id === divEntriesToGet[0].id) { 
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[0].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[0], hdcpDiv));
        } else if (divEntries[i].id === divEntriesToGet[1].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[1].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[1], hdcpDiv));
        } else if (divEntries[i].id === divEntriesToGet[2].id) { 
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[2].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[2], hdcpDiv));
        } else if (divEntries[i].id === divEntriesToGet[3].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[3].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[3], hdcpDiv));
        } else {
          expect(true).toBe(false);
        }        
        expect(divEntries[i].squad_id).toEqual(divEntriesToGet[i].squad_id);
        expect(divEntries[i].div_id).toEqual(divEntriesToGet[i].div_id);        
        expect(divEntries[i].fee).toEqual(divEntriesToGet[i].fee);
      }
    })
    it('should return 0 divEntries for not found squad', async () => { 
      const divEntries = await getAllDivEntriesForSquad(notFoundSquadId);
      expect(divEntries).toHaveLength(0);
    })
    it('should return null if squad id is invalid', async () => { 
      const divEntries = await getAllDivEntriesForSquad("test");
      expect(divEntries).toBeNull();
    })
    it('should return null if squad id is a valid id, but not a squad id', async () => {
      const divEntries = await getAllDivEntriesForSquad(notFoundTmntId);
      expect(divEntries).toBeNull();
    })
    it('should return null if squad id is null', async () => { 
      const divEntries = await getAllDivEntriesForSquad(null as any);
      expect(divEntries).toBeNull();
    })
    it('should return null if squad id is undefined', async () => { 
      const divEntries = await getAllDivEntriesForSquad(undefined as any);
      expect(divEntries).toBeNull();
    })
  })

  describe('getAllDivEntriesForDiv()', () => {

    beforeAll(async () => {
      await deletePostedDivEntry();
      await putDiv(div);
    })

    afterEach(async () => {
      await putDiv(div);
    })

    it('should get all divEntries for div', async () => { 
      const divEntries = await getAllDivEntriesForDiv(divEntriesToGet[0].div_id);  
      expect(divEntries).toHaveLength(divEntriesToGet.length);
      if (!divEntries) return;
      for (let i = 0; i < divEntries.length; i++) {
        if (divEntries[i].id === divEntriesToGet[0].id) { 
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[0].player_id);
          expect(divEntries[i].hdcp).toEqual(divEntriesToGet[0].hdcp);
        } else if (divEntries[i].id === divEntriesToGet[1].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[1].player_id);
          expect(divEntries[i].hdcp).toEqual(divEntriesToGet[1].hdcp);
        } else if (divEntries[i].id === divEntriesToGet[2].id) { 
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[2].player_id);
          expect(divEntries[i].hdcp).toEqual(divEntriesToGet[2].hdcp);
        } else if (divEntries[i].id === divEntriesToGet[3].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[3].player_id);
          expect(divEntries[i].hdcp).toEqual(divEntriesToGet[3].hdcp);
        } else {
          expect(true).toBe(false);
        }        
        expect(divEntries[i].squad_id).toEqual(divEntriesToGet[i].squad_id);
        expect(divEntries[i].div_id).toEqual(divEntriesToGet[i].div_id);        
        expect(divEntries[i].fee).toEqual(divEntriesToGet[i].fee);
      }
    })

    it('should get all divEntries for div when hdcp is not 0', async () => { 
      const hdcpDiv = {
        ...div,
        hdcp_per: 0.85,
      }
      await putDiv(hdcpDiv);      

      const divEntries = await getAllDivEntriesForDiv(divEntriesToGet[0].div_id);  
      expect(divEntries).toHaveLength(divEntriesToGet.length);
      if (!divEntries) return;
      for (let i = 0; i < divEntries.length; i++) {
        if (divEntries[i].id === divEntriesToGet[0].id) { 
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[0].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[0], hdcpDiv));                    
        } else if (divEntries[i].id === divEntriesToGet[1].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[1].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[1], hdcpDiv));
        } else if (divEntries[i].id === divEntriesToGet[2].id) { 
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[2].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[2], hdcpDiv));
        } else if (divEntries[i].id === divEntriesToGet[3].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[3].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[3], hdcpDiv));
        } else {
          expect(true).toBe(false);
        }        
        expect(divEntries[i].squad_id).toEqual(divEntriesToGet[i].squad_id);
        expect(divEntries[i].div_id).toEqual(divEntriesToGet[i].div_id);        
        expect(divEntries[i].fee).toEqual(divEntriesToGet[i].fee);
      }
    })
    it('should get all divEntries for div when hdcp is not 0 and int_hdcp = true' , async () => { 
      const hdcpDiv = {
        ...div,
        hdcp_per: 0.85,
        int_hdcp: true,
      }
      await putDiv(hdcpDiv);      

      const divEntries = await getAllDivEntriesForDiv(divEntriesToGet[0].div_id);  
      expect(divEntries).toHaveLength(divEntriesToGet.length);
      if (!divEntries) return;
      for (let i = 0; i < divEntries.length; i++) {
        if (divEntries[i].id === divEntriesToGet[0].id) { 
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[0].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[0], hdcpDiv));
        } else if (divEntries[i].id === divEntriesToGet[1].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[1].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[1], hdcpDiv));
        } else if (divEntries[i].id === divEntriesToGet[2].id) { 
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[2].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[2], hdcpDiv));
        } else if (divEntries[i].id === divEntriesToGet[3].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[3].player_id);
          expect(divEntries[i].hdcp).toEqual(calcHdcp(divEntriesToGet[3], hdcpDiv));
        } else {
          expect(true).toBe(false);
        }        
        expect(divEntries[i].squad_id).toEqual(divEntriesToGet[i].squad_id);
        expect(divEntries[i].div_id).toEqual(divEntriesToGet[i].div_id);        
        expect(divEntries[i].fee).toEqual(divEntriesToGet[i].fee);
      }
    })

    it('should return 0 divEntries for not found div', async () => { 
      const divEntries = await getAllDivEntriesForDiv(notFoundDivId);
      expect(divEntries).toHaveLength(0);
    })
    it('should return null if div id is invalid', async () => { 
      const divEntries = await getAllDivEntriesForDiv("test");
      expect(divEntries).toBeNull();
    })
    it('should return null if div id is a valid id, but not a div id', async () => {
      const divEntries = await getAllDivEntriesForDiv(userId);
      expect(divEntries).toBeNull();
    })
    it('should return null if div id is null', async () => { 
      const divEntries = await getAllDivEntriesForDiv(null as any);
      expect(divEntries).toBeNull();
    })
    it('should return null if div id is undefined', async () => { 
      const divEntries = await getAllDivEntriesForDiv(undefined as any);
      expect(divEntries).toBeNull();
    })
  })

  describe('postDivEntry()', () => { 

    const divEntryToPost = {
      ...initDivEntry,    
      id: 'den_012fc6c5556e407291c4b5666b2dccd7',
      squad_id: 'sqd_7116ce5f80164830830a7157eb093396',
      div_id: 'div_f30aea2c534f4cfe87f4315531cef8ef',
      player_id: 'ply_a01758cff1cc4bab9d9133e661bd49b0',
      fee: '82',
    }

    let createdDivEntry = false;

    // const deletePostedDivEntry = async () => { 
    //   const response = await axios.get(url);
    //   const divEntrys = response.data.divEntries;
    //   const toDel = divEntrys.find((d: divEntryType) => d.fee === '82');
    //   if (toDel) {
    //     try {
    //       const delResponse = await axios({
    //         method: "delete",
    //         withCredentials: true,
    //         url: oneDivEntryUrl + toDel.id          
    //       });        
    //     } catch (err) {
    //       if (err instanceof AxiosError) console.log(err.message);
    //     }
    //   }
    // }

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
      const postedDivEntry = await postDivEntry(divEntryToPost);
      expect(postedDivEntry).not.toBeNull();
      if (!postedDivEntry) return;
      createdDivEntry = true;
      expect(postedDivEntry.id).toEqual(divEntryToPost.id);
      expect(postedDivEntry.squad_id).toEqual(divEntryToPost.squad_id);
      expect(postedDivEntry.div_id).toEqual(divEntryToPost.div_id);
      expect(postedDivEntry.player_id).toEqual(divEntryToPost.player_id);
      expect(postedDivEntry.fee).toEqual(divEntryToPost.fee);
    })
    it('should post a sanitzed divEntry', async () => { 
      const toSanitizse = {
        ...divEntryToPost,
        position: '   82  '
      }
      const postedDivEntry = await postDivEntry(toSanitizse);
      expect(postedDivEntry).not.toBeNull();
      if (!postedDivEntry) return;
      createdDivEntry = true;
      expect(postedDivEntry.id).toEqual(toSanitizse.id);
      expect(postedDivEntry.squad_id).toEqual(toSanitizse.squad_id);
      expect(postedDivEntry.div_id).toEqual(toSanitizse.div_id);
      expect(postedDivEntry.squad_id).toEqual(toSanitizse.squad_id);
      expect(postedDivEntry.player_id).toEqual(toSanitizse.player_id);
      expect(postedDivEntry.fee).toEqual('82');
    })
    it('should not post a divEntry if got invalid data', async () => { 
      const invalidDivEntry = {
        ...divEntryToPost,
        fee: '-1'
      }
      const postedDivEntry = await postDivEntry(invalidDivEntry);
      expect(postedDivEntry).toBeNull();
    })
  })

  describe('postManyDivEntries()', () => { 

    let createdDivEntries = false;    

    beforeAll(async () => {
      await deletePostedDivEntry();
      await deleteAllDivEntriesForTmnt(tmntIdToDel);
    })

    beforeEach(() => {
      createdDivEntries = false;
    })

    afterEach(async () => {
      if (createdDivEntries) {
        await deleteAllDivEntriesForTmnt(tmntIdToDel);
      }
    })

    afterAll(async () => {
      await deleteAllDivEntriesForTmnt(tmntIdToDel);
    })

    it('should post many divEntries', async () => {
      const divEntries = await postManyDivEntries(mockDivEntriesToPost);
      expect(divEntries).not.toBeNull();
      if (!divEntries) return;
      createdDivEntries = true;
      expect(divEntries.length).toEqual(mockDivEntriesToPost.length);
      for (let i = 0; i < mockDivEntriesToPost.length; i++) {
        expect(divEntries[i].id).toEqual(mockDivEntriesToPost[i].id);
        expect(divEntries[i].squad_id).toEqual(mockDivEntriesToPost[i].squad_id);
        expect(divEntries[i].div_id).toEqual(mockDivEntriesToPost[i].div_id);
        expect(divEntries[i].player_id).toEqual(mockDivEntriesToPost[i].player_id);
        expect(divEntries[i].fee).toEqual(mockDivEntriesToPost[i].fee);
      }
    })
    it('should NOT post many divEntries with sanitization, fee value sanitized to ""', async () => {
      const toSanitize = cloneDeep(mockDivEntriesToPost)
      toSanitize[0].fee = '  84  '      
      const divEntries = await postManyDivEntries(toSanitize);
      expect(divEntries).toBeNull();
    })
    it('should not post many divEntries with no data', async () => {
      const postedDivEntries = await postManyDivEntries([]);
      expect(postedDivEntries).not.toBeNull();
      expect(postedDivEntries).toHaveLength(0);
    })
    it('should not post many divEntries with invalid data', async () => {
      const invalidDivEntries = cloneDeep(mockDivEntriesToPost);
      invalidDivEntries[1].fee = '-1';
      const postedPlayers = await postManyDivEntries(invalidDivEntries);
      expect(postedPlayers).toBeNull();
    })    
  })    

  describe('putDivEntry()', () => {

    const divEntryToPut = {
      ...initDivEntry,
      id: "den_652fc6c5556e407291c4b5666b2dccd7",                
      squad_id: 'sqd_1a6c885ee19a49489960389193e8f819',
      div_id: 'div_1f42042f9ef24029a0a2d48cc276a087',
      player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
      fee: '83'
    }

    const putUrl = oneDivEntryUrl + divEntryToPut.id;

    const resetDivEntry = {
      ...initDivEntry,
      id: "den_652fc6c5556e407291c4b5666b2dccd7",                
      squad_id: 'sqd_7116ce5f80164830830a7157eb093396',
      div_id: 'div_f30aea2c534f4cfe87f4315531cef8ef',
      player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
      fee: '80'
    }

    const doReset = async () => {
      try {
        const playerJSON = JSON.stringify(resetDivEntry);
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

    it('should put a divEntry', async () => {
      const puttedDivEntry = await putDivEntry(divEntryToPut);
      expect(puttedDivEntry).not.toBeNull();
      if (!puttedDivEntry) return;
      didPut = true;
      expect(puttedDivEntry.squad_id).toBe(divEntryToPut.squad_id);
      expect(puttedDivEntry.div_id).toBe(divEntryToPut.div_id);
      expect(puttedDivEntry.player_id).toBe(divEntryToPut.player_id);
      expect(puttedDivEntry.fee).toBe(divEntryToPut.fee);
    })
    it('should NOT put a divEntry with sanitization, fee value sanitized to ""', async () => {
      const toSanitize = cloneDeep(divEntryToPut)
      toSanitize.fee = '  84  '      
      const puttedDivEntry = await putDivEntry(toSanitize);
      expect(puttedDivEntry).toBeNull();
    })
    it('shouyld NOT put a divEntry with invalid data', async () => {
      const invalidDivEntry = {
        ...divEntryToPut,
        fee: '-1',
      }
      const puttedDivEntry = await putDivEntry(invalidDivEntry);
      expect(puttedDivEntry).toBeNull();
    })    
  })

  describe('putManyDivEntries()', () => { 
    let createdDivEntries = false;    

    beforeAll(async () => {
      await deletePostedDivEntry();
      await deleteAllDivEntriesForTmnt(tmntIdToDel);
    })

    beforeEach(() => {
      createdDivEntries = false;
    })

    afterEach(async () => {
      if (createdDivEntries) {
        await deleteAllDivEntriesForTmnt(tmntIdToDel);
      }
    })

    afterAll(async () => {
      await deleteAllDivEntriesForTmnt(tmntIdToDel);
    })

    const mockMultiDivEntriesToPost: divEntryType[] = [
      {
        ...mockDivEntriesToPost[0],
      },
      {
        ...mockDivEntriesToPost[1],
      },
      {
        ...mockDivEntriesToPost[2],
      },
      {
        ...mockDivEntriesToPost[3],
      },
      {
        ...initDivEntry,
        id: "den_05be0472be3d476ea1caa99dd05953fa",
        squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
        div_id: 'div_18997d3fd7ef4eb7ad2b53a9e93f9ce5',
        player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
        fee: '64',
      },
      {
        ...initDivEntry,
        id: "den_06be0472be3d476ea1caa99dd05953fa",
        squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
        div_id: 'div_367309aa1444446ea9ab23d2e4aae98f',
        player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
        fee: '64',
      },
    ]

    it('should update, insert, delete many div entries', async () => {      
      createdDivEntries = true;
      const postedDivEntries = await postManyDivEntries(mockDivEntriesToPost);
      expect(postedDivEntries).not.toBeNull();
      if (!postedDivEntries) return;
      expect(postedDivEntries.length).toBe(mockDivEntriesToPost.length);      
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
          ...mockMultiDivEntriesToPost[4],          
          eType: "i",
        },
        {
          ...mockMultiDivEntriesToPost[5],          
          eType: "i",
        },
      ]
      const updateInfo = await putManyDivEntries(divEntriesToUpdate);
      expect(updateInfo).not.toBeNull();
      if (!updateInfo) return;
      expect(updateInfo.updates).toBe(2);
      expect(updateInfo.inserts).toBe(2);
      expect(updateInfo.deletes).toBe(2);
    })
    it('should return no updates, inserts or deletes when passed empty div entries', async () => {      
      createdDivEntries = true;
      const postedDivEntries = await postManyDivEntries(mockDivEntriesToPost);
      expect(postedDivEntries).not.toBeNull();
      if (!postedDivEntries) return;
      expect(postedDivEntries.length).toBe(mockDivEntriesToPost.length);      
      // set no divs entries edits
      const divEntriesToUpdate: tmntEntryDivEntryType[] = []
      const updateInfo = await putManyDivEntries(divEntriesToUpdate);
      expect(updateInfo).not.toBeNull();
      if (!updateInfo) return;
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.inserts).toBe(0);
      expect(updateInfo.deletes).toBe(0);
    })
    it('should update no div entries when error in data', async () => {      
      createdDivEntries = true;
      const postedDivEntries = await postManyDivEntries(mockDivEntriesToPost);
      expect(postedDivEntries).not.toBeNull();
      if (!postedDivEntries) return;
      expect(postedDivEntries.length).toBe(mockDivEntriesToPost.length);      
      // set divs edits, set eType
      const divEntriesToUpdate = [
        {
          ...mockMultiDivEntriesToPost[0],          
          fee: '1234567890', // error in fee
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
          ...mockMultiDivEntriesToPost[4],          
          eType: "i",
        },
        {
          ...mockMultiDivEntriesToPost[5],          
          eType: "i",
        },
      ]
      
      const updateInfo = await putManyDivEntries(divEntriesToUpdate);
      expect(updateInfo).toBeNull();
    })
  })

  describe('deleteDivEntry()', () => {

    // toDel is data from prisma/seeds.ts
    const toDel = {
      ...initDivEntry,
      id: "den_a55c6cd27d1b482aa0ff248d5fb496ed",      
      squad_id: "sqd_bb2de887bf274242af5d867476b029b8",
      div_id: 'div_1f42042f9ef24029a0a2d48cc276a087',
      player_id: 'ply_bb0fd8bbd9e34d34a7fa90b4111c6e40',
      fee: '80'
    }

    let didDel = false;

    beforeAll(async () => {     
      await rePostDivEntry(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostDivEntry(toDel);
      }
    });

    it('should delete a divEntry', async () => {
      const deleted = await deleteDivEntry(toDel.id);
      expect(deleted).toBe(1);
      didDel = true;
    })
    it('should not delete a divEntry when id is not found', async () => {
      const deleted = await deleteDivEntry(notFoundId);
      expect(deleted).toBe(-1);
    })
    it('should not delete a divEntry when id is invalid', async () => {
      const deleted = await deleteDivEntry("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete a divEntry when id is null', async () => {
      const deleted = await deleteDivEntry(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete a divEntry when id is undefined', async () => {
      const deleted = await deleteDivEntry(undefined as any);
      expect(deleted).toBe(-1);   
    })    
  })

  describe('deleteAllDivEntriesForSquad()', () => { 

    let didDel = false;

    beforeAll(async () => {
      await deleteAllDivEntriesForTmnt(tmntIdToDel);
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

    it('should delete all divEntries for a squad', async () => { 
      const deleted = await deleteAllDivEntriesForSquad(mockDivEntriesToPost[0].squad_id);
      expect(deleted).toBe(4);
      didDel = true;
    })
    it('should not delete all divEntries for a squad when squad id is not found', async () => {
      const deleted = await deleteAllDivEntriesForSquad(notFoundSquadId);
      expect(deleted).toBe(0);
    })  
    it('should not delete all divEntries for a squad when squad id is invalid', async () => { 
      const deleted = await deleteAllDivEntriesForSquad("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete all divEntries for a squad when squad id is valid, but not a squad id', async () => { 
      const deleted = await deleteAllDivEntriesForSquad(userId);
      expect(deleted).toBe(-1);
    })
    it('should not delete all divEntries for a squad when squad id is null', async () => { 
      const deleted = await deleteAllDivEntriesForSquad(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete all divEntries for a squad when squad id is undefined', async () => { 
      const deleted = await deleteAllDivEntriesForSquad(undefined as any);
      expect(deleted).toBe(-1);
    })
  })

  describe('deleteAllDivEntriesForDiv()', () => { 

    let didDel = false;

    beforeAll(async () => {
      await deleteAllDivEntriesForTmnt(tmntIdToDel);
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

    it('should delete all divEntries for a div', async () => { 
      const deleted = await deleteAllDivEntriesForDiv(mockDivEntriesToPost[0].div_id);
      expect(deleted).toBe(2);
      didDel = true;
    })
    it('should not delete all divEntries for a div when div id is not found', async () => {
      const deleted = await deleteAllDivEntriesForDiv(notFoundDivId);
      expect(deleted).toBe(0);
    })  
    it('should not delete all divEntries for a div when div id is invalid', async () => { 
      const deleted = await deleteAllDivEntriesForDiv("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete all divEntries for a div when div id is valid, but not a div id', async () => { 
      const deleted = await deleteAllDivEntriesForDiv(userId);
      expect(deleted).toBe(-1);
    })
    it('should not delete all divEntries for a div when div id is null', async () => { 
      const deleted = await deleteAllDivEntriesForDiv(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete all divEntries for a div when div id is undefined', async () => { 
      const deleted = await deleteAllDivEntriesForDiv(undefined as any);
      expect(deleted).toBe(-1);
    })
  })

  describe('deleteAllDivEntriesForTmnt()', () => {     

    let didDel = false;

    beforeAll(async () => {
      await deleteAllDivEntriesForTmnt(tmntIdToDel);
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

    it('should delete all divEntries for a tmnt', async () => { 
      const deleted = await deleteAllDivEntriesForTmnt(tmntIdToDel);
      expect(deleted).toBe(mockDivEntriesToPost.length);
      didDel = true;
    })
    it('should not delete all divEntries for a tmnt when tmnt id is not found', async () => {
      const deleted = await deleteAllDivEntriesForTmnt(notFoundTmntId);
      expect(deleted).toBe(0);
    })  
    it('should not delete all divEntries for a tmnt when tmnt id is invalid', async () => { 
      const deleted = await deleteAllDivEntriesForTmnt("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete all divEntries for a tmnt when tmnt id is valid, but not a tmnt id', async () => { 
      const deleted = await deleteAllDivEntriesForTmnt(userId);
      expect(deleted).toBe(-1);
    })
    it('should not delete all divEntries for a tmnt when tmnt id is null', async () => { 
      const deleted = await deleteAllDivEntriesForTmnt(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete all divEntries for a tmnt when tmnt id is undefined', async () => { 
      const deleted = await deleteAllDivEntriesForTmnt(undefined as any);
      expect(deleted).toBe(-1);
    })
  })

})