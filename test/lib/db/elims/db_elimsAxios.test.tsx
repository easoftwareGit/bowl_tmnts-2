import axios, { AxiosError } from "axios";
import { baseElimsApi } from "@/lib/db/apiPaths";
import { testBaseElimsApi } from "../../../testApi";
import { elimType } from "@/lib/types/types";
import { initElim } from "@/lib/db/initVals";
import { deleteAllDivElims, deleteAllSquadElims, deleteAllTmntElims, deleteElim, getAllElimsForTmnt, postElim, postManyElims, putElim } from "@/lib/db/elims/elimsAxios";
import { mockElimsToPost, mockSquadsToPost, mockDivs, tmntToDelId } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { deleteAllTmntSquads, deleteSquad, postManySquads, postSquad } from "@/lib/db/squads/squadsAxios";
import { deleteAllTmntDivs, deleteDiv, postDiv, postManyDivs } from "@/lib/db/divs/divsAxios";

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

const url = testBaseElimsApi.startsWith("undefined")
  ? baseElimsApi
  : testBaseElimsApi;
const oneElimUrl = url + "/elim/";
  
const notFoundTmntId = 'tmt_00000000000000000000000000000000';

describe('elimsAxios', () => { 

  const rePostElim = async (elim: elimType) => {
    try {
      // if elim already in database, then don't re-post
      const getResponse = await axios.get(oneElimUrl + elim.id);
      const found = getResponse.data.elim;
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
      const elimJSON = JSON.stringify(elim);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: elimJSON
      });    
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  }  

  describe('getAllElimsForTmnt', () => { 

    // from prisma/seed.ts
    const tmntId = 'tmt_fd99387c33d9c78aba290286576ddce5';
    const elimsToGet: elimType[] = [
      {
        ...initElim,
        id: "elm_45d884582e7042bb95b4818ccdd9974c",
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        sort_order: 1,
        start: 1,
        games: 3,
        fee: '5',
      },
      {
        ...initElim,
        id: "elm_9d01015272b54962a375cf3c91007a12",
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        sort_order: 2,
        start: 4,
        games: 3,
        fee: '5',
      }
    ]

    it('should get all elims for tmnt', async () => { 
      const elims = await getAllElimsForTmnt(tmntId);
      expect(elims).toHaveLength(elimsToGet.length);
      if (!elims) return;
      for (let i = 0; i < elims.length; i++) {
        expect(elims[i].id).toEqual(elimsToGet[i].id);
        expect(elims[i].squad_id).toEqual(elimsToGet[i].squad_id);
        expect(elims[i].div_id).toEqual(elimsToGet[i].div_id);
        expect(elims[i].sort_order).toEqual(elimsToGet[i].sort_order);
        expect(elims[i].start).toEqual(elimsToGet[i].start);
        expect(elims[i].games).toEqual(elimsToGet[i].games);
        expect(elims[i].fee).toEqual(elimsToGet[i].fee);
      }      
    })
    it("should return 0 elims for not found tmnt", async () => { 
      const elims = await getAllElimsForTmnt(notFoundTmntId);
      expect(elims).toHaveLength(0);
    })
    it('should return null if tmnt id is invalid', async () => { 
      const elims = await getAllElimsForTmnt('test');
      expect(elims).toBeNull();
    })
    it('should return null if tmnt id is valid, but not a tmnt id', async () => { 
      const elims = await getAllElimsForTmnt(elimsToGet[0].id);
      expect(elims).toBeNull();
    })

  })

  describe('postElim', () => {

    const elimToPost = {
      ...initElim,    
      squad_id: 'sqd_3397da1adc014cf58c44e07c19914f72',
      div_id: 'div_66d39a83d7a84a8c85d28d8d1b2c7a90',
      start: 1,
      games: 3,
      fee: '13',
      sort_order: 13
    }

    let createdElim = false;

    const deletePostedElim = async () => { 
      const response = await axios.get(url);
      const elims = response.data.elims;
      const toDel = elims.find((e: elimType) => e.sort_order === 13);
      if (toDel) {
        try {
          const delResponse = await axios({
            method: "delete",
            withCredentials: true,
            url: oneElimUrl + toDel.id          
          });               
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    beforeAll(async () => { 
      await deletePostedElim();
    })

    beforeEach(() => {
      createdElim = false;
    })

    afterEach(async () => {
      if (createdElim) {
        await deletePostedElim();
      }
    })

    it('should post an elim', async () => { 
      const postedElim = await postElim(elimToPost);
      expect(postedElim).not.toBeNull();
      if(!postedElim) return;
      createdElim = true
      expect(postedElim.id).toBe(elimToPost.id);
      expect(postedElim.squad_id).toBe(elimToPost.squad_id);
      expect(postedElim.div_id).toBe(elimToPost.div_id);    
      expect(postedElim.start).toBe(elimToPost.start);
      expect(postedElim.games).toBe(elimToPost.games);
      expect(postedElim.fee).toBe(elimToPost.fee);    
      expect(postedElim.sort_order).toBe(elimToPost.sort_order);    
    })
    it('should NOT post a elim with invalid data', async () => { 
      const invalidElim = {
        ...elimToPost,
        games: -1,
      }
      const postedElim = await postElim(invalidElim);
      expect(postedElim).toBeNull();
    })

  })

  describe('postManyElims', () => { 

    let createdElims = false;    

    beforeAll(async () => { 
      
      // remove any old test data
      await deleteAllTmntElims(tmntToDelId); 
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);

      // make sure test squads in database
      await postManyDivs(mockDivs);
      await postManySquads(mockSquadsToPost);       
    })

    beforeEach(() => {
      createdElims = false;
    })

    afterEach(async () => {
      if (createdElims) {
        await deleteAllTmntElims(tmntToDelId);
      }      
    })

    afterAll(async () => {
      await deleteAllTmntElims(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
    })

    it('should post many elims', async () => { 
      const postedElims = await postManyElims(mockElimsToPost);
      expect(postedElims).not.toBeNull();
      if (!postedElims) return;
      createdElims = true;
      expect(postedElims.length).toBe(mockElimsToPost.length);
      for (let i = 0; i < postedElims.length; i++) {
        expect(postedElims[i].id).toEqual(mockElimsToPost[i].id);
        expect(postedElims[i].squad_id).toEqual(mockElimsToPost[i].squad_id);
        expect(postedElims[i].div_id).toEqual(mockElimsToPost[i].div_id);
        expect(postedElims[i].start).toEqual(mockElimsToPost[i].start);
        expect(postedElims[i].games).toEqual(mockElimsToPost[i].games);
        expect(postedElims[i].fee).toEqual(mockElimsToPost[i].fee);
        expect(postedElims[i].sort_order).toEqual(mockElimsToPost[i].sort_order);        
      }
    })
    // no text values to sanitize
    it('should not post many elims with no data', async () => { 
      const postedElims = await postManyElims([]);
      expect(postedElims).not.toBeNull();
      expect(postedElims).toHaveLength(0);
    })
    it('should NOT post many elims with invalid data', async () => { 
      const invalidElims = [
        {
          ...mockElimsToPost[0],
          games: -1
        },
        {
          ...mockElimsToPost[1],
        },
        {
          ...mockElimsToPost[2],
        },
        {
          ...mockElimsToPost[3],
        },
      ]
      const postedElims = await postManyElims(invalidElims);
      expect(postedElims).toBeNull();
    })
  })

  describe('putElim', () => { 

    const elimToPut = {
      ...initElim,
      id: "elm_45d884582e7042bb95b4818ccdd9974c",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
      sort_order: 1,
      start: 13,
      games: 4,
      fee: '13',
    }

    const putUrl = oneElimUrl + elimToPut.id;

    const resetElim = {
      ...initElim,
      id: "elm_45d884582e7042bb95b4818ccdd9974c",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
      sort_order: 1,
      start: 1,
      games: 3,
      fee: '5',
    }

    const doReset = async () => {
      try {
        const potJSON = JSON.stringify(resetElim);
        const response = await axios({
          method: "put",
          data: potJSON,
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

    it('should put an elim', async () => {
      const puttedElim = await putElim(elimToPut);
      expect(puttedElim).not.toBeNull();
      if (!puttedElim) return;
      didPut = true;
      expect(puttedElim.id).toEqual(elimToPut.id);
      expect(puttedElim.squad_id).toEqual(elimToPut.squad_id);
      expect(puttedElim.div_id).toEqual(elimToPut.div_id);
      expect(puttedElim.fee).toEqual(elimToPut.fee);
      expect(puttedElim.start).toEqual(elimToPut.start);
      expect(puttedElim.games).toEqual(elimToPut.games);
      expect(puttedElim.sort_order).toEqual(elimToPut.sort_order);      
    });
    it('should not put an elim with invalid data', async () => { 
      const invalidElim = {
        ...elimToPut,
        fee: '-13',
      }
      const puttedElim = await putElim(invalidElim);
      expect(puttedElim).toBeNull();
    })

  })

  describe('deleteElim', () => { 

    // toDel is data from prisma/seeds.ts
    const toDel = {
      ...initElim,
      id: "elm_4c5aad9baa7246c19e07f215561e58c4",
      squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
      div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
      sort_order: 3,
      start: 3,
      games: 4,
      fee: '10',
    }

    const nonFoundId = "elm_00000000000000000000000000000000";
    
    let didDel = false;

    beforeAll(async () => {     
      await rePostElim(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostElim(toDel);
      }
    });

    it("should delete an elim", async () => {
      const deleted = await deleteElim(toDel.id);      
      expect(deleted).toBe(1);
      didDel = true;
    });
    it("should NOT delete an elim when ID is not found", async () => {
      const deleted = await deleteElim(nonFoundId);
      expect(deleted).toBe(-1);
    });
    it("should NOT delete an elim when ID is invalid", async () => {
      const deleted = await deleteElim('test');
      expect(deleted).toBe(-1);
    });
    it('should NOT delete an elim when ID is valid, but not an elim ID', async () => { 
      const deleted = await deleteElim(toDel.squad_id);
      expect(deleted).toBe(-1);
    })
    it('should not delete an elim when ID is blank', async () => {
      const deleted = await deleteElim('');
      expect(deleted).toBe(-1);
    })
    it('should not delete an elim when ID is null', async () => {
      const deleted = await deleteElim(null as any);
      expect(deleted).toBe(-1);
    })

  })

  describe('deleteAllSquadElims', () => { 

    const multiElims = [
      {
        ...mockElimsToPost[0],
      },
      {
        ...mockElimsToPost[1],
      },
    ]

    const rePostToDel = async () => {
      const response = await axios.get(url);
      const elims = response.data.elims;
      // find first test elim
      const foundToDel = elims.find(
        (e: elimType) => e.id === multiElims[0].id
      );
      if (!foundToDel) {
        try {
          await postManyElims(multiElims);
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    let didDel = false;

    beforeAll(async () => {
      // cleanup before tests
      await deleteAllSquadElims(multiElims[0].squad_id);
      await deleteSquad(mockSquadsToPost[0].id);
      await deleteDiv(mockDivs[0].id);
      // setup for tests
      await postDiv(mockDivs[0]);
      await postSquad(mockSquadsToPost[0])
      await rePostToDel();
    });

    beforeEach(async () => {
      if (didDel) {
        await rePostToDel();
      }
    });

    afterEach(async () => {
      didDel = false;
    });

    afterAll(async () => {
      await deleteAllSquadElims(multiElims[0].squad_id);
      await deleteSquad(mockSquadsToPost[0].id);
      await deleteDiv(mockDivs[0].id);
    });

    it('should delete all elims for a squad', async () => {
      const deleted = await deleteAllSquadElims(multiElims[0].squad_id);
      expect(deleted).toBe(multiElims.length);
      didDel = true;
    })
    it('should NOT delete all elims for a squad when ID is invalid', async () => {
      const deleted = await deleteAllSquadElims('test');
      expect(deleted).toBe(-1);
    })
    it('should NOT delete all elims for a squad when ID is not found', async () => {
      const deleted = await deleteAllSquadElims('sqd_00000000000000000000000000000000');
      expect(deleted).toBe(0);
    })
    it('should NOT delete all elims for a squad when ID is valid, but not a squad ID', async () => {
      const deleted = await deleteAllSquadElims(mockElimsToPost[0].id);
      expect(deleted).toBe(-1);
    })

  })

  describe('deleteAllDivElims', () => { 

    const multiElims = [
      {
        ...mockElimsToPost[0],
      },
      {
        ...mockElimsToPost[1],
      },
    ]

    const rePostToDel = async () => {
      const response = await axios.get(url);
      const elims = response.data.elims;
      // find first test elim
      const foundToDel = elims.find(
        (e: elimType) => e.id === multiElims[0].id
      );
      if (!foundToDel) {
        try {
          await postManyElims(multiElims);
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    let didDel = false;

    beforeAll(async () => {
      // cleanup before tests
      await deleteAllSquadElims(multiElims[0].squad_id);
      await deleteSquad(mockSquadsToPost[0].id);
      await deleteDiv(mockDivs[0].id);
      // setup for tests
      await postDiv(mockDivs[0]);
      await postSquad(mockSquadsToPost[0])
      await rePostToDel();
    });

    beforeEach(async () => {
      if (didDel) {
        await rePostToDel();
      }
    });

    afterEach(async () => {
      didDel = false;
    });

    afterAll(async () => {
      await deleteAllSquadElims(multiElims[0].squad_id);
      await deleteSquad(mockSquadsToPost[0].id);
      await deleteDiv(mockDivs[0].id);
    });

    it('should delete all elims for a div', async () => {
      const deleted = await deleteAllDivElims(multiElims[0].div_id);
      expect(deleted).toBe(multiElims.length);
      didDel = true;
    })
    it('should NOT delete all elims for a div when ID is invalid', async () => {
      const deleted = await deleteAllDivElims('test');
      expect(deleted).toBe(-1);
    })
    it('should NOT delete all elims for a div when ID is not found', async () => {
      const deleted = await deleteAllDivElims('div_00000000000000000000000000000000');
      expect(deleted).toBe(0);
    })
    it('should NOT delete all elims for a div when ID is valid, but not a squad ID', async () => {
      const deleted = await deleteAllDivElims(mockElimsToPost[0].id);
      expect(deleted).toBe(-1);
    })

  })

  describe('deleteAllTmntBrkts', () => { 

    const toDelDivs = [...mockDivs]
    const toDelSquads = [...mockSquadsToPost]
    const toDelElims = [...mockElimsToPost]

    let didDel = false

    beforeAll(async () => {
      // cleanup before tests
      await deleteAllSquadElims(toDelSquads[0].id);
      await deleteAllSquadElims(toDelSquads[1].id);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
      // setup for tests
      await postManyDivs(toDelDivs);
      await postManySquads(toDelSquads);
      await postManyElims(toDelElims);
    })

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      await deleteAllSquadElims(toDelSquads[0].id);
      await deleteAllSquadElims(toDelSquads[1].id);
    })

    afterAll(async () => {
      await deleteAllSquadElims(toDelSquads[0].id);
      await deleteAllSquadElims(toDelSquads[1].id);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
    })

    it('should delete all elims for a tmnt', async () => {
      const deleted = await deleteAllTmntElims(tmntToDelId);
      didDel = true;
      expect(deleted).toBe(toDelElims.length);
    })
    it('should NOT delete all elims for a tmnt when ID is invalid', async () => {
      const deleted = await deleteAllTmntElims('test');
      expect(deleted).toBe(-1);
    })
    it('should NOT delete all elims for a tmnt when tmnt ID is not found', async () => {
      const deleted = await deleteAllTmntElims(notFoundTmntId);
      expect(deleted).toBe(0);
    })
    it('should NOT delete all elims for a tmnt when tmnt ID is valid, but not a tmnt id', async () => {
      const deleted = await deleteAllTmntElims(toDelElims[0].id);
      expect(deleted).toBe(-1);
    })

  })

})