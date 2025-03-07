import axios, { AxiosError } from "axios";
import { basePotsApi } from "@/lib/db/apiPaths";
import { testBasePotsApi } from "../../../testApi";
import { potCategoriesTypes, potType } from "@/lib/types/types";
import { initPot } from "@/lib/db/initVals";
import { mockDivs, mockPotsToPost, mockSquadsToPost, tmntToDelId } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { deleteAllDivPots, deleteAllSquadPots, deleteAllTmntPots, deletePot, getAllPotsForTmnt, postManyPots, postPot, putPot } from "@/lib/db/pots/dbPots";
import { deleteAllTmntSquads, deleteSquad, postManySquads, postSquad } from "@/lib/db/squads/dbSquads";
import { deleteAllTmntDivs, deleteDiv, postDiv, postManyDivs } from "@/lib/db/divs/dbDivs";

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

const url = testBasePotsApi.startsWith("undefined")
  ? basePotsApi
  : testBasePotsApi;   
const onePotUrl = url + "/pot/";    

const notFoundTmntId = 'tmt_00000000000000000000000000000000';

describe('dbPots', () => { 

  const rePostPot = async (pot: potType) => {
    try {
      // if pot already in database, then don't re-post
      const getResponse = await axios.get(onePotUrl + pot.id);
      const found = getResponse.data.pot;
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
      const potJSON = JSON.stringify(pot);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: potJSON
      });    
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  }  

  describe('getAllPotsForTmnt', () => { 

    // from prisma/seed.ts
    const tmntId = 'tmt_56d916ece6b50e6293300248c6792316';
    const potsToGet: potType[] = [
      {
        ...initPot,
        id: "pot_98b3a008619b43e493abf17d9f462a65",
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 1,
        fee: '10',
        pot_type: "Game",
      }, 
      {
        ...initPot,
        id: "pot_ab80213899ea424b938f52a062deacfe",
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 2,
        fee: '10',
        pot_type: "Last Game",
      }
    ]

    it('should get all pots for tmnt', async () => { 
      const pots = await getAllPotsForTmnt(tmntId);
      expect(pots).toHaveLength(potsToGet.length);
      if (!pots) return;
      for (let i = 0; i < potsToGet.length; i++) {
        expect(pots[i].id).toEqual(potsToGet[i].id);
        expect(pots[i].squad_id).toEqual(potsToGet[i].squad_id);
        expect(pots[i].div_id).toEqual(potsToGet[i].div_id);
        expect(pots[i].sort_order).toEqual(potsToGet[i].sort_order);
        expect(pots[i].fee).toEqual(potsToGet[i].fee);
        expect(pots[i].pot_type).toEqual(potsToGet[i].pot_type);
      }
    })
    it("should return 0 pots for not found tmnt", async () => { 
      const pots = await getAllPotsForTmnt(notFoundTmntId);
      expect(pots).toHaveLength(0);
    })
    it('should return null if tmnt id is invalid', async () => { 
      const pots = await getAllPotsForTmnt('test');
      expect(pots).toBeNull();
    })
    it('should return null if tmnt id is valid, but not a tmnt id', async () => { 
      const pots = await getAllPotsForTmnt(potsToGet[0].id);
      expect(pots).toBeNull();
    })
  })

  describe('postPot', () => { 

    const deletePostedPot = async () => { 
      const response = await axios.get(url);
      const pots = response.data.pots;
      const toDel = pots.find((p: potType) => p.sort_order === 13);
      if (toDel) {
        try {
          const delResponse = await axios({
            method: "delete",
            withCredentials: true,
            url: onePotUrl + toDel.id          
          });        
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    const potToPost = {
      ...initPot,    
      squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
      div_id: "div_66d39a83d7a84a8c85d28d8d1b2c7a90",
      sort_order: 13,
      fee: '13',
      pot_type: "Game" as potCategoriesTypes,
    }

    let createdPot = false;

    beforeAll(async () => { 
      await deletePostedPot();
    })

    beforeEach(() => {
      createdPot = false;
    })

    afterEach(async () => {
      if (createdPot) {
        await deletePostedPot();
      }
    })

    it('should post a pot', async () => { 
      const postedPot = await postPot(potToPost);
      expect(postedPot).not.toBeNull();
      if (!postedPot) return;
      createdPot = true;
      expect(postedPot.id).toBe(potToPost.id);
      expect(postedPot.squad_id).toBe(potToPost.squad_id);
      expect(postedPot.div_id).toBe(potToPost.div_id);
      expect(postedPot.fee).toBe(potToPost.fee);
      expect(postedPot.pot_type).toBe(potToPost.pot_type);
      expect(postedPot.sort_order).toBe(potToPost.sort_order);    
    })
    it('should NOT post a pot with invalid data', async () => { 
      const invalidPot = {
        ...potToPost,
        fee: '-13',
      }
      const postedPot = await postPot(invalidPot);
      expect(postedPot).toBeNull();
    })
  })

  describe('postManyPots', () => { 

    let createdPots = false;    

    beforeAll(async () => { 
      
      // remove any old test data
      await deleteAllTmntPots(tmntToDelId); 
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);

      // make sure test squads in database
      await postManyDivs(mockDivs);
      await postManySquads(mockSquadsToPost);       
    })

    beforeEach(() => {
      createdPots = false;
    })

    afterEach(async () => {
      if (createdPots) {
        await deleteAllTmntPots(tmntToDelId);
      }      
    })

    afterAll(async () => {
      await deleteAllTmntPots(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
    })

    it('should post many pots', async () => { 
      const postedPots = await postManyPots(mockPotsToPost);
      expect(postedPots).not.toBeNull();
      if (!postedPots) return;
      createdPots = true;
      expect(postedPots.length).toBe(mockPotsToPost.length);
      for (let i = 0; i < postedPots.length; i++) {
        expect(postedPots[i].id).toEqual(mockPotsToPost[i].id);
        expect(postedPots[i].squad_id).toEqual(mockPotsToPost[i].squad_id);
        expect(postedPots[i].div_id).toEqual(mockPotsToPost[i].div_id);
        expect(postedPots[i].fee).toEqual(mockPotsToPost[i].fee);
        expect(postedPots[i].pot_type).toEqual(mockPotsToPost[i].pot_type);
        expect(postedPots[i].sort_order).toEqual(mockPotsToPost[i].sort_order);        
      }
    })
    it('should post sanitized pots', async () => { 
      const toSanitize = [
        {
          ...mockPotsToPost[0],
          pot_type: '<script>Game</script>' as potCategoriesTypes,       
        },
        {
          ...mockPotsToPost[1],
          pot_type: '   Last Game  ***  ' as potCategoriesTypes,
        },
        {
          ...mockPotsToPost[2],          
        },
      ]
      const postedPots = await postManyPots(toSanitize);
      expect(postedPots).not.toBeNull();
      if (!postedPots) return;
      createdPots = true;
      expect(postedPots.length).toBe(toSanitize.length);
      for (let i = 0; i < postedPots.length; i++) {
        expect(postedPots[i].pot_type).toEqual(mockPotsToPost[i].pot_type);        
      }      
    })
    it('should not post many pots with no data', async () => { 
      const postedPots = await postManyPots([]);
      expect(postedPots).not.toBeNull();
      expect(postedPots).toHaveLength(0);
    })
    it('should not post many pots with invalid data', async () => { 
      const invalidPots = [
        {
          ...mockPotsToPost[0],
          fee: '-13',
        },
        {
          ...mockPotsToPost[1],          
        },
        {
          ...mockPotsToPost[2],
        },
      ]
      const postedLanes = await postManyPots(invalidPots);
      expect(postedLanes).toBeNull();
    })
  })

  describe('putPot', () => { 

    const potToPut = {
      ...initPot,
      id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
      sort_order: 13,
      fee: '13',
      pot_type: "Last Game" as potCategoriesTypes,
    }

    const putUrl = onePotUrl + potToPut.id;

    const resetPot = {
      ...initPot,
      id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
      sort_order: 1,
      fee: '20',
      pot_type: "Game" as potCategoriesTypes,
    }

    const doReset = async () => {
      try {
        const potJSON = JSON.stringify(resetPot);
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

    it('should put a pot', async () => {
      const puttedPot = await putPot(potToPut);
      expect(puttedPot).not.toBeNull();
      if (!puttedPot) return;
      didPut = true;
      expect(puttedPot.id).toEqual(potToPut.id);
      expect(puttedPot.squad_id).toEqual(potToPut.squad_id);
      expect(puttedPot.div_id).toEqual(potToPut.div_id);
      expect(puttedPot.fee).toEqual(potToPut.fee);
      expect(puttedPot.pot_type).toEqual(potToPut.pot_type);
      expect(puttedPot.sort_order).toEqual(potToPut.sort_order);      
    });
    it('should not put a pot with invalid data', async () => { 
      const invalidPot = {
        ...potToPut,
        fee: '-13',
      }
      const puttedLane = await putPot(invalidPot);
      expect(puttedLane).toBeNull();
    })

  })

  describe('deletePot', () => { 

    // toDel is data from prisma/seeds.ts
    const toDel = {
      ...initPot,
      id: "pot_e3758d99c5494efabb3b0d273cf22e7a",
      squad_id: "sqd_bb2de887bf274242af5d867476b029b8",
      div_id: "div_29b9225d8dd44a4eae276f8bde855729",
      sort_order: 1,
      fee: '20',
      pot_type: "Game" as potCategoriesTypes,
    }

    const nonFoundId = "pot_00000000000000000000000000000000";
    
    let didDel = false;

    beforeAll(async () => {     
      await rePostPot(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostPot(toDel);
      }
    });

    it("should delete a pot", async () => {
      const deleted = await deletePot(toDel.id);      
      expect(deleted).toBe(1);
      didDel = true;
    });
    it("should NOT delete a pot when ID is not found", async () => {
      const deleted = await deletePot(nonFoundId);
      expect(deleted).toBe(-1);
    });
    it("should NOT delete a pot when ID is invalid", async () => {
      const deleted = await deletePot('test');
      expect(deleted).toBe(-1);
    });
    it('should NOT delete a pot when ID is valid, but not a pot ID', async () => { 
      const deleted = await deletePot(toDel.squad_id);
      expect(deleted).toBe(-1);
    })
    it('should not delete a pot when ID is blank', async () => {
      const deleted = await deletePot('');
      expect(deleted).toBe(-1);
    })
    it('should not delete a pot when ID is null', async () => {
      const deleted = await deletePot(null as any);
      expect(deleted).toBe(-1);
    })

  })

  describe('deleteAllSquadPots', () => { 

    const multiPots = [
      {
        ...mockPotsToPost[0],
      },
      {
        ...mockPotsToPost[1],
      },
      {
        ...mockPotsToPost[2],
      },
    ]

    const rePostToDel = async () => {
      const response = await axios.get(url);
      const pots = response.data.pots;
      // find first test pot
      const foundToDel = pots.find(
        (p: potType) => p.id === multiPots[0].id
      );
      if (!foundToDel) {
        try {
          await postManyPots(multiPots);
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    let didDel = false;

    beforeAll(async () => {
      // cleanup before tests
      await deleteAllSquadPots(multiPots[0].squad_id);
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
      await deleteAllSquadPots(multiPots[0].squad_id);
      await deleteSquad(mockSquadsToPost[0].id);
      await deleteDiv(mockDivs[0].id);
    });

    it('should delete all pots for a squad', async () => {
      const deleted = await deleteAllSquadPots(multiPots[0].squad_id);
      expect(deleted).toBe(multiPots.length);
      didDel = true;
    })
    it('should NOT delete all pots for a squad when ID is invalid', async () => {
      const deleted = await deleteAllSquadPots('test');
      expect(deleted).toBe(-1);
    })
    it('should NOT delete all pots for a squad when ID is not found', async () => {
      const deleted = await deleteAllSquadPots('sqd_00000000000000000000000000000000');
      expect(deleted).toBe(0);
    })
    it('should NOT delete all pots for a squad when ID is valid, but not a squad ID', async () => {
      const deleted = await deleteAllSquadPots(mockPotsToPost[0].id);
      expect(deleted).toBe(-1);
    })

  })

  describe('deleteAllDivPots', () => { 

    const multiPots = [
      {
        ...mockPotsToPost[0],
      },
      {
        ...mockPotsToPost[1],
      },
      {
        ...mockPotsToPost[2],
      },
    ]

    const rePostToDel = async () => {
      const response = await axios.get(url);
      const pots = response.data.pots;
      // find first test pot
      const foundToDel = pots.find(
        (p: potType) => p.id === multiPots[0].id
      );
      if (!foundToDel) {
        try {
          await postManyPots(multiPots);
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    let didDel = false;

    beforeAll(async () => {
      // cleanup before tests
      await deleteAllDivPots(multiPots[0].div_id);
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
      await deleteAllDivPots(multiPots[0].div_id);
      await deleteSquad(mockSquadsToPost[0].id);
      await deleteDiv(mockDivs[0].id);
    });

    it('should delete all pots for a div', async () => {
      const deleted = await deleteAllDivPots(multiPots[0].div_id);
      expect(deleted).toBe(3);
      didDel = true;
    })
    it('should NOT delete all pots for a div when ID is invalid', async () => {
      const deleted = await deleteAllDivPots('test');
      expect(deleted).toBe(-1);
    })
    it('should NOT delete all pots for a div when ID is not found', async () => {
      const deleted = await deleteAllDivPots('div_00000000000000000000000000000000');
      expect(deleted).toBe(0);
    })
    it('should NOT delete all pots for a div when ID is valid, but not a div ID', async () => {
      const deleted = await deleteAllDivPots(mockPotsToPost[0].id);
      expect(deleted).toBe(-1);
    })

  })  

  describe('deleteAllTmntPots', () => { 
    const toDelDivs = [...mockDivs]
    const toDelSquads = [...mockSquadsToPost]
    const toDelPots = [...mockPotsToPost]

    let didDel = false

    beforeAll(async () => {
      // cleanup before tests
      await deleteAllSquadPots(toDelSquads[0].id);
      await deleteAllSquadPots(toDelSquads[1].id);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
      // setup for tests
      await postManyDivs(toDelDivs);
      await postManySquads(toDelSquads);
      await postManyPots(toDelPots);
    })

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      await deleteAllSquadPots(toDelSquads[0].id);
      await deleteAllSquadPots(toDelSquads[1].id);
    })

    afterAll(async () => {
      await deleteAllSquadPots(toDelSquads[0].id);
      await deleteAllSquadPots(toDelSquads[1].id);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
    })

    it('should delete all pots for a tmnt', async () => {
      const deleted = await deleteAllTmntPots(tmntToDelId);
      didDel = true;
      expect(deleted).toBe(toDelPots.length);
    })
    it('should NOT delete all pots for a tmnt when ID is invalid', async () => {
      const deleted = await deleteAllTmntPots('test');
      expect(deleted).toBe(-1);
    })
    it('should NOT delete all pots for a tmnt when tmnt ID is not found', async () => {
      const deleted = await deleteAllTmntPots(notFoundTmntId);
      expect(deleted).toBe(0);
    })
    it('should NOT delete all pots for a tmnt when tmnt ID is valid, but not a tmnt id', async () => {
      const deleted = await deleteAllTmntPots(toDelPots[0].id);
      expect(deleted).toBe(-1);
    })

  })

})