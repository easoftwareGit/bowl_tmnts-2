import axios, { AxiosError } from "axios";
import { baseBrktsApi } from "@/lib/db/apiPaths";
import { testBaseBrktsApi } from "../../../testApi";
import { brktType } from "@/lib/types/types";
import { initBrkt } from "@/lib/db/initVals";
import { mockBrktsToPost, mockSquadsToPost, tmntToDelId, mockDivs } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { deleteAllDivBrkts, deleteAllSquadBrkts, deleteAllTmntBrkts, deleteBrkt, getAllBrktsForTmnt, postBrkt, postManyBrkts, putBrkt } from "@/lib/db/brkts/brktsAxios";
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

const url = testBaseBrktsApi.startsWith("undefined")
  ? baseBrktsApi
  : testBaseBrktsApi;    
const oneBrktUrl = url + "/brkt/";

const notFoundTmntId = 'tmt_00000000000000000000000000000000';

describe('brktsAxios', () => { 

  const rePostBrkt = async (brkt: brktType) => {
    try {
      // if brkt already in database, then don't re-post
      const getResponse = await axios.get(oneBrktUrl + brkt.id);
      const found = getResponse.data.brkt;
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
      const brktJSON = JSON.stringify(brkt);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: brktJSON
      });    
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  }  
  
  describe('getAllBrktsForTmnt', () => {

    // from prisma/seed.ts
    const tmntId = 'tmt_fd99387c33d9c78aba290286576ddce5';
    const brktsToGet: brktType[] = [
      {
        ...initBrkt,
        id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        sort_order: 1,
        start: 1,
        games: 3,
        players: 8,
        fee: '5',
        first: '25',
        second: '10',
        admin: '5',
        fsa: '40',
      },
      {
        ...initBrkt,
        id: "brk_6ede2512c7d4409ca7b055505990a499",
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        sort_order: 2,
        start: 4,
        games: 3,
        players: 8,
        fee: '5',
        first: '25',
        second: '10',
        admin: '5',
        fsa: '40',
      },
    ]

    it('should get all brkts for tmnt', async () => { 
      const brkts = await getAllBrktsForTmnt(tmntId);
      expect(brkts).toHaveLength(brktsToGet.length);
      if (!brkts) return;
      for (let i = 0; i < brkts.length; i++) {
        expect(brkts[i].id).toEqual(brktsToGet[i].id);
        expect(brkts[i].squad_id).toEqual(brktsToGet[i].squad_id);
        expect(brkts[i].div_id).toEqual(brktsToGet[i].div_id);
        expect(brkts[i].sort_order).toEqual(brktsToGet[i].sort_order);
        expect(brkts[i].start).toEqual(brktsToGet[i].start);
        expect(brkts[i].games).toEqual(brktsToGet[i].games);
        expect(brkts[i].players).toEqual(brktsToGet[i].players);
        expect(brkts[i].fee).toEqual(brktsToGet[i].fee);
        expect(brkts[i].first).toEqual(brktsToGet[i].first);
        expect(brkts[i].second).toEqual(brktsToGet[i].second);
        expect(brkts[i].admin).toEqual(brktsToGet[i].admin);
        expect(brkts[i].fsa).toEqual(brktsToGet[i].fsa);
      }
    })
    it("should return 0 brkts for not found tmnt", async () => { 
      const brkts = await getAllBrktsForTmnt(notFoundTmntId);
      expect(brkts).toHaveLength(0);
    })
    it('should return null if tmnt id is invalid', async () => { 
      const brkts = await getAllBrktsForTmnt('test');
      expect(brkts).toBeNull();
    })
    it('should return null if tmnt id is valid, but not a tmnt id', async () => { 
      const brkts = await getAllBrktsForTmnt(brktsToGet[0].id);
      expect(brkts).toBeNull();
    })

  })

  describe('postBrkt', () => { 

    const brktToPost = {
      ...initBrkt,    
      squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
      div_id: "div_66d39a83d7a84a8c85d28d8d1b2c7a90",
      sort_order: 1,    
      start: 1,
      games: 3,
      players: 8,
      fee: '4',
      first: '20',
      second: '8',
      admin: '4',
      fsa: '32',
    }

    let createdBrkt = false;

    const deletePostedBrbkt = async () => { 
      const response = await axios.get(url);
      const brkts = response.data.brkts;
      const toDel = brkts.find((b: brktType) => b.fee === '4');
      if (toDel) {
        try {
          const delResponse = await axios({
            method: "delete",
            withCredentials: true,
            url: oneBrktUrl + toDel.id          
          });        
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    beforeAll(async () => { 
      await deletePostedBrbkt();
    })

    beforeEach(() => {
      createdBrkt = false;
    })

    afterEach(async () => {
      if (createdBrkt) {
        await deletePostedBrbkt();
      }
    })

    it('should post a brkt', async () => { 
      const postedBrkt = await postBrkt(brktToPost);
      expect(postedBrkt).not.toBeNull();
      if(!postedBrkt) return;
      createdBrkt = true;
      expect(postedBrkt.id).toBe(brktToPost.id);
      expect(postedBrkt.squad_id).toBe(brktToPost.squad_id);
      expect(postedBrkt.div_id).toBe(brktToPost.div_id);    
      expect(postedBrkt.start).toBe(brktToPost.start);
      expect(postedBrkt.games).toBe(brktToPost.games);
      expect(postedBrkt.fee).toBe(brktToPost.fee);
      expect(postedBrkt.first).toBe(brktToPost.first);
      expect(postedBrkt.second).toBe(brktToPost.second);
      expect(postedBrkt.admin).toBe(brktToPost.admin);    
      expect(postedBrkt.sort_order).toBe(brktToPost.sort_order);    
    })
    it('should NOT post a brkt with invalid data', async () => { 
      const invalidBrkt = {
        ...brktToPost,
        games: -1,
      }
      const postedDiv = await postBrkt(invalidBrkt);
      expect(postedDiv).toBeNull();
    })

  })
  
  describe('postManyBrkts', () => { 

    let createdBrkts = false;    

    beforeAll(async () => { 
      
      // remove any old test data
      await deleteAllTmntBrkts(tmntToDelId); 
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);

      // make sure test squads in database
      await postManyDivs(mockDivs);
      await postManySquads(mockSquadsToPost);       
    })

    beforeEach(() => {
      createdBrkts = false;
    })

    afterEach(async () => {
      if (createdBrkts) {
        await deleteAllTmntBrkts(tmntToDelId);
      }      
    })

    afterAll(async () => {
      await deleteAllTmntBrkts(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
    })

    it('should post many brkts', async () => { 
      const postedBrkts = await postManyBrkts(mockBrktsToPost);
      expect(postedBrkts).not.toBeNull();
      if (!postedBrkts) return;
      createdBrkts = true;
      expect(postedBrkts.length).toBe(mockBrktsToPost.length);
      for (let i = 0; i < postedBrkts.length; i++) {
        expect(postedBrkts[i].id).toEqual(mockBrktsToPost[i].id);
        expect(postedBrkts[i].squad_id).toEqual(mockBrktsToPost[i].squad_id);
        expect(postedBrkts[i].div_id).toEqual(mockBrktsToPost[i].div_id);
        expect(postedBrkts[i].fee).toEqual(mockBrktsToPost[i].fee);
        expect(postedBrkts[i].first).toEqual(mockBrktsToPost[i].first);
        expect(postedBrkts[i].second).toEqual(mockBrktsToPost[i].second);
        expect(postedBrkts[i].admin).toEqual(mockBrktsToPost[i].admin);
        expect(postedBrkts[i].fsa).toEqual(mockBrktsToPost[i].fsa);        
        expect(postedBrkts[i].sort_order).toEqual(mockBrktsToPost[i].sort_order);        
      }
    })
    // no text values to sanitize
    it('should not post many brkts with no data', async () => { 
      const postedBrkts = await postManyBrkts([]);
      expect(postedBrkts).not.toBeNull();
      expect(postedBrkts).toHaveLength(0);
    })
    it('should NOT post many brkts with invalid data', async () => { 
      const invalidBrkts = [
        {
          ...mockBrktsToPost[0],
          games: -1
        },
        {
          ...mockBrktsToPost[1],
        },
        {
          ...mockBrktsToPost[2],
        },
        {
          ...mockBrktsToPost[3],
        },
      ]
      const postedBrkts = await postManyBrkts(invalidBrkts);
      expect(postedBrkts).toBeNull();
    })
  })

  describe('putBrkt', () => { 

    const brktToPut = {
      ...initBrkt,
      id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
      sort_order: 1,
      start: 2,
      games: 3,
      players: 8,
      fee: '4',
      first: '20',
      second: '8',
      admin: '4',
      fsa: '32',
    }

    const putUrl = oneBrktUrl + brktToPut.id;

    const resetBrkt = {
      ...initBrkt,
      id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
      sort_order: 1,
      start: 1,
      games: 3,
      players: 8,
      fee: '5',
      first: '25',
      second: '10',
      admin: '5',
      fsa: '40',
    }

    const doReset = async () => {
      try {
        const potJSON = JSON.stringify(resetBrkt);
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

    it('should put a brkt', async () => {
      const puttedBrkt = await putBrkt(brktToPut);
      expect(puttedBrkt).not.toBeNull();
      if (!puttedBrkt) return;
      didPut = true;
      expect(puttedBrkt.id).toEqual(brktToPut.id);
      expect(puttedBrkt.squad_id).toEqual(brktToPut.squad_id);
      expect(puttedBrkt.div_id).toEqual(brktToPut.div_id);
      expect(puttedBrkt.fee).toEqual(brktToPut.fee);
      expect(puttedBrkt.first).toEqual(brktToPut.first);
      expect(puttedBrkt.second).toEqual(brktToPut.second);
      expect(puttedBrkt.admin).toEqual(brktToPut.admin);
      expect(puttedBrkt.fsa).toEqual(brktToPut.fsa);
      expect(puttedBrkt.sort_order).toEqual(brktToPut.sort_order);      
    });
    it('should not put a brkt with invalid data', async () => { 
      const invalidBrkt = {
        ...brktToPut,
        fee: '-13',
      }
      const puttedBrkt = await putBrkt(invalidBrkt);
      expect(puttedBrkt).toBeNull();
    })

  })

  describe('deleteBrkt', () => { 

    // toDel is data from prisma/seeds.ts
    const toDel = {
      ...initBrkt,
      id: "brk_400737cab3584ab7a59b7a4411da4474",
      squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
      div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
      sort_order: 3,
      start: 2,
      games: 3,
      players: 8,
      fee: '5',
      first: '25',
      second: '10',
      admin: '5',
      fsa: '40',
    }

    const nonFoundId = "brk_00000000000000000000000000000000";
    
    let didDel = false;

    beforeAll(async () => {     
      await rePostBrkt(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostBrkt(toDel);
      }
    });

    it("should delete a brkt", async () => {
      const deleted = await deleteBrkt(toDel.id);      
      expect(deleted).toBe(1);
      didDel = true;
    });
    it("should NOT delete a brkt when ID is not found", async () => {
      const deleted = await deleteBrkt(nonFoundId);
      expect(deleted).toBe(-1);
    });
    it("should NOT delete a brkt when ID is invalid", async () => {
      const deleted = await deleteBrkt('test');
      expect(deleted).toBe(-1);
    });
    it('should NOT delete a brkt when ID is valid, but not a brkt ID', async () => { 
      const deleted = await deleteBrkt(toDel.squad_id);
      expect(deleted).toBe(-1);
    })
    it('should not delete a brkt when ID is blank', async () => {
      const deleted = await deleteBrkt('');
      expect(deleted).toBe(-1);
    })
    it('should not delete a brkt when ID is null', async () => {
      const deleted = await deleteBrkt(null as any);
      expect(deleted).toBe(-1);
    })

  })

  describe('deleteAllSquadBrkts', () => { 

    const multiBrkts = [
      {
        ...mockBrktsToPost[0],
      },
      {
        ...mockBrktsToPost[1],
      },
    ]

    const rePostToDel = async () => {
      const response = await axios.get(url);
      const brkts = response.data.brkts;
      // find first test brkt
      const foundToDel = brkts.find(
        (b: brktType) => b.id === multiBrkts[0].id
      );
      if (!foundToDel) {
        try {
          await postManyBrkts(multiBrkts);
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    let didDel = false;

    beforeAll(async () => {
      // cleanup before tests
      await deleteAllSquadBrkts(multiBrkts[0].squad_id);
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
      await deleteAllSquadBrkts(multiBrkts[0].squad_id);
      await deleteSquad(mockSquadsToPost[0].id);
      await deleteDiv(mockDivs[0].id);
    });

    it('should delete all brkts for a squad', async () => {
      const deleted = await deleteAllSquadBrkts(multiBrkts[0].squad_id);
      expect(deleted).toBe(multiBrkts.length);
      didDel = true;
    })
    it('should NOT delete all brkts for a squad when ID is invalid', async () => {
      const deleted = await deleteAllSquadBrkts('test');
      expect(deleted).toBe(-1);
    })
    it('should NOT delete all brkts for a squad when ID is not found', async () => {
      const deleted = await deleteAllSquadBrkts('sqd_00000000000000000000000000000000');
      expect(deleted).toBe(0);
    })
    it('should NOT delete all brkts for a squad when ID is valid, but not a squad ID', async () => {
      const deleted = await deleteAllSquadBrkts(mockBrktsToPost[0].id);
      expect(deleted).toBe(-1);
    })

  })

  describe('deleteAllDivBrkts', () => { 

    const multiBrkts = [
      {
        ...mockBrktsToPost[0],
      },
      {
        ...mockBrktsToPost[1],
      },
    ]

    const rePostToDel = async () => {
      const response = await axios.get(url);
      const brkts = response.data.brkts;
      // find first test brkt
      const foundToDel = brkts.find(
        (b: brktType) => b.id === multiBrkts[0].id
      );
      if (!foundToDel) {
        try {
          await postManyBrkts(multiBrkts);
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    let didDel = false;

    beforeAll(async () => {
      // cleanup before tests
      await deleteAllSquadBrkts(multiBrkts[0].squad_id);
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
      await deleteAllSquadBrkts(multiBrkts[0].squad_id);
      await deleteSquad(mockSquadsToPost[0].id);
      await deleteDiv(mockDivs[0].id);
    });

    it('should delete all brkts for a div', async () => {
      const deleted = await deleteAllDivBrkts(multiBrkts[0].div_id);
      expect(deleted).toBe(multiBrkts.length);
      didDel = true;
    })
    it('should NOT delete all brkts for a div when ID is invalid', async () => {
      const deleted = await deleteAllDivBrkts('test');
      expect(deleted).toBe(-1);
    })
    it('should NOT delete all brkts for a div when ID is not found', async () => {
      const deleted = await deleteAllDivBrkts('div_00000000000000000000000000000000');
      expect(deleted).toBe(0);
    })
    it('should NOT delete all brkts for a div when ID is valid, but not a squad ID', async () => {
      const deleted = await deleteAllDivBrkts(mockBrktsToPost[0].id);
      expect(deleted).toBe(-1);
    })

  })

  describe('deleteAllTmntBrkts', () => { 

    const toDelDivs = [...mockDivs]
    const toDelSquads = [...mockSquadsToPost]
    const toDelBrkts = [...mockBrktsToPost]

    let didDel = false

    beforeAll(async () => {
      // cleanup before tests
      await deleteAllSquadBrkts(toDelSquads[0].id);
      await deleteAllSquadBrkts(toDelSquads[1].id);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
      // setup for tests
      await postManyDivs(toDelDivs);
      await postManySquads(toDelSquads);
      await postManyBrkts(toDelBrkts);
    })

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      await deleteAllSquadBrkts(toDelSquads[0].id);
      await deleteAllSquadBrkts(toDelSquads[1].id);
    })

    afterAll(async () => {
      await deleteAllSquadBrkts(toDelSquads[0].id);
      await deleteAllSquadBrkts(toDelSquads[1].id);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
    })

    it('should delete all brkts for a tmnt', async () => {
      const deleted = await deleteAllTmntBrkts(tmntToDelId);
      didDel = true;
      expect(deleted).toBe(toDelBrkts.length);
    })
    it('should NOT delete all brkts for a tmnt when ID is invalid', async () => {
      const deleted = await deleteAllTmntBrkts('test');
      expect(deleted).toBe(-1);
    })
    it('should NOT delete all brkts for a tmnt when tmnt ID is not found', async () => {
      const deleted = await deleteAllTmntBrkts(notFoundTmntId);
      expect(deleted).toBe(0);
    })
    it('should NOT delete all brkts for a tmnt when tmnt ID is valid, but not a tmnt id', async () => {
      const deleted = await deleteAllTmntBrkts(toDelBrkts[0].id);
      expect(deleted).toBe(-1);
    })

  })
  
})