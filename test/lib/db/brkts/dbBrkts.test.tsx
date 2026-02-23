import axios, { AxiosError } from "axios";
import { baseBrktsApi } from "@/lib/db/apiPaths";
import { testBaseBrktsApi } from "../../../testApi";
import type { brktType } from "@/lib/types/types";
import { initBrkt } from "@/lib/db/initVals";
import { mockBrktsToPost, mockSquadsToPost, tmntToDelId, mockDivsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { deleteAllBrktsForDiv, deleteAllBrktsForSquad, deleteAllBrktsForTmnt, deleteBrkt, getAllBrktsForSquad, getAllBrktsForTmnt, postBrkt, postManyBrkts, putBrkt, extractBrkts } from "@/lib/db/brkts/dbBrkts";
import { deleteAllSquadsForTmnt, postManySquads, postSquad } from "@/lib/db/squads/dbSquads";
import { deleteAllDivsForTmnt, postDiv, postManyDivs } from "@/lib/db/divs/dbDivs";
import { cloneDeep } from "lodash";
import { replaceManyBrkts } from "@/lib/db/brkts/dbBrktsReplaceMany";

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

const squadId = 'sqd_7116ce5f80164830830a7157eb093396';
const tmntId = 'tmt_fd99387c33d9c78aba290286576ddce5';

const notFoundDivId = 'div_00000000000000000000000000000000';
const notFoundSquadId = 'sqd_00000000000000000000000000000000';
const notFoundTmntId = 'tmt_00000000000000000000000000000000';

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

const multiBrkts = [
  {
    ...mockBrktsToPost[0],
  },
  {
    ...mockBrktsToPost[1],
  },
]

describe('dbBrkts', () => { 

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

  describe("extractBrkts()", () => {
    it("should return an empty array when given an empty array", () => {
      const result = extractBrkts([]);
      expect(result).toEqual([]);
    });
    it("should correctly map raw brkts to brktType", () => {
      const rawBrkts = [
        {
          ...initBrkt,
          id: "brk_123",
          div_id:"div_123",
          squad_id: "sqd_123",
          fee: '5',
          start: 1,
          games: 3,
          players: 8,
          first: '25',
          second: '10',
          admin: '5',
          sort_order: 1,
          extraField: "ignore me", // should be ignored
        },
      ];

      const result = extractBrkts(rawBrkts);

      const expected: brktType = {
        ...initBrkt,
        id: "brk_123",
        div_id:"div_123",
        squad_id: "sqd_123",
        fee: '5',
        start: 1,
        games: 3,
        players: 8,
        first: '25',
        second: '10',
        admin: '5',
        fsa: '40',
        sort_order: 1,
      };

      expect(result).toEqual([expected]);
    });    
    it("should process multiple brkts", () => {
      const rawBrkts = [
        {
          ...initBrkt,
          id: "brk_123",
          div_id:"div_123",
          squad_id: "sqd_123",
          fee: '5',
          start: 1,
          games: 3,
          players: 8,
          first: '25',
          second: '10',
          admin: '5',
          sort_order: 1,          
        },
        {
          ...initBrkt,
          id: "brk_124",
          div_id:"div_123",
          squad_id: "sqd_123",
          fee: '5',
          start: 4,
          games: 3,
          players: 8,
          first: '25',
          second: '10',
          admin: '5',
          sort_order: 2,
        },
      ];

      const result = extractBrkts(rawBrkts);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("brk_123");
      expect(result[0].start).toBe(1);
      expect(result[1].id).toBe("brk_124");
      expect(result[1].start).toBe(4);
    });
    it('should return empty array when given null', () => {      
      const result = extractBrkts(null);
      expect(result).toEqual([]);
    });
    it('should return empty array when given non-array', () => {
      const result = extractBrkts('not an array');
      expect(result).toEqual([]);
    });
  });

  describe('getAllBrktsForTmnt', () => {

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
        expect(brkts[i].fsa + '').toEqual(brktsToGet[i].fsa);
      }
    })
    it("should return 0 brkts for not found tmnt", async () => { 
      const brkts = await getAllBrktsForTmnt(notFoundTmntId);
      expect(brkts).toHaveLength(0);
    })    
    it('should throw error if if tmnt id is invalid', async () => { 
      try {
        await getAllBrktsForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    })
    it('should throw error if if tmnt id is valid, but not a tmnt id', async () => { 
      try {
        await getAllBrktsForTmnt(brktsToGet[0].id);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    })
    it('should throw error if if tmnt id is null', async () => { 
      try {
        await getAllBrktsForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    })
  })

  describe('getAllBrktsForSquad', () => {

    it('should get all brkts for squad', async () => { 
      const brkts = await getAllBrktsForSquad(squadId);
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
        expect(brkts[i].fsa + '').toEqual(brktsToGet[i].fsa);
      }
    })
    it("should return 0 brkts for not found squad", async () => { 
      const brkts = await getAllBrktsForSquad(notFoundSquadId);
      expect(brkts).toHaveLength(0);
    })    
    it('should throw error if if squad id is invalid', async () => { 
      try {
        await getAllBrktsForSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })
    it('should throw error if if squad id is valid, but not a squad id', async () => { 
      try {
        await getAllBrktsForSquad(brktsToGet[0].id);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })
    it('should throw error if if squad id is null', async () => { 
      try {
        await getAllBrktsForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
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

    const deletePostedBrkt = async () => { 
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
      await deletePostedBrkt();
    })

    beforeEach(() => {
      createdBrkt = false;
    })

    afterEach(async () => {
      if (createdBrkt) {
        await deletePostedBrkt();
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
      try {
        const invalidBrkt = {
          ...brktToPost,
          games: -1,
        }
        await postBrkt(invalidBrkt);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("postBrkt failed: Request failed with status code 422");
      }
    })

  })
  
  describe('postManyBrkts', () => { 

    let createdBrkts = false;    

    beforeAll(async () => { 
      
      // remove any old test data
      // await deleteAllBrktsForTmnt(tmntToDelId); 
      await deleteAllSquadsForTmnt(tmntToDelId);
      await deleteAllDivsForTmnt(tmntToDelId);

      // make sure test squads in database
      await postManyDivs(mockDivsToPost);
      await postManySquads(mockSquadsToPost);       
    })

    beforeEach(() => {
      createdBrkts = false;
    })

    afterEach(async () => {
      if (createdBrkts) {
        await deleteAllBrktsForTmnt(tmntToDelId);
      }      
    })

    afterAll(async () => {
      // await deleteAllBrktsForTmnt(tmntToDelId);
      await deleteAllSquadsForTmnt(tmntToDelId);
      await deleteAllDivsForTmnt(tmntToDelId);
    })

    it('should post many brkts', async () => { 
      const count = await postManyBrkts(mockBrktsToPost);      
      expect(count).toBe(mockBrktsToPost.length);
      createdBrkts = true;
      // check that all brkts were posted      
      const postedBrkts = await getAllBrktsForTmnt(tmntToDelId);
      expect(postedBrkts).not.toBeNull();
      if (!postedBrkts) return;
      createdBrkts = true;
      expect(postedBrkts.length).toBe(mockBrktsToPost.length);
      for (let i = 0; i < postedBrkts.length; i++) {
        expect(postedBrkts[i].fee).toEqual(mockBrktsToPost[i].fee);
        expect(postedBrkts[i].first).toEqual(mockBrktsToPost[i].first);
        expect(postedBrkts[i].second).toEqual(mockBrktsToPost[i].second);
        expect(postedBrkts[i].admin).toEqual(mockBrktsToPost[i].admin);
        expect(postedBrkts[i].fsa + '').toEqual(mockBrktsToPost[i].fsa);        
        if (postedBrkts[i].id === mockBrktsToPost[0].id) {
          expect(postedBrkts[i].start).toEqual(mockBrktsToPost[0].start);
          expect(postedBrkts[i].squad_id).toEqual(mockBrktsToPost[0].squad_id);
          expect(postedBrkts[i].div_id).toEqual(mockBrktsToPost[0].div_id);
          expect(postedBrkts[i].sort_order).toEqual(mockBrktsToPost[0].sort_order);
        } else if (postedBrkts[i].id === mockBrktsToPost[1].id) {
          expect(postedBrkts[i].start).toEqual(mockBrktsToPost[1].start);
          expect(postedBrkts[i].squad_id).toEqual(mockBrktsToPost[1].squad_id);
          expect(postedBrkts[i].div_id).toEqual(mockBrktsToPost[1].div_id);
          expect(postedBrkts[i].sort_order).toEqual(mockBrktsToPost[1].sort_order);
        } else if (postedBrkts[i].id === mockBrktsToPost[2].id) {
          expect(postedBrkts[i].start).toEqual(mockBrktsToPost[2].start);
          expect(postedBrkts[i].squad_id).toEqual(mockBrktsToPost[2].squad_id);
          expect(postedBrkts[i].div_id).toEqual(mockBrktsToPost[2].div_id);
          expect(postedBrkts[i].sort_order).toEqual(mockBrktsToPost[2].sort_order);
        } else if (postedBrkts[i].id === mockBrktsToPost[3].id) {
          expect(postedBrkts[i].start).toEqual(mockBrktsToPost[3].start);
          expect(postedBrkts[i].squad_id).toEqual(mockBrktsToPost[3].squad_id);
          expect(postedBrkts[i].div_id).toEqual(mockBrktsToPost[3].div_id);
          expect(postedBrkts[i].sort_order).toEqual(mockBrktsToPost[3].sort_order);
        } else { 
          expect(true).toBeFalsy();
        }        
      }
    })
    // no text values to sanitize
    it('should return 0 when passed an empty array', async () => { 
      const count = await postManyBrkts([]);
      expect(count).toBe(0);
    })
    it('should throw error when posting many brkts with invalid data in first item ', async () => { 
      try {
        const invalidBrkts = cloneDeep(mockBrktsToPost);
        invalidBrkts[0].games = -1;
        await postManyBrkts(invalidBrkts);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt data at index 0");
      }
    })
    it('should throw error when posting many brkts with invalid data in second item ', async () => { 
      try {
        const invalidBrkts = cloneDeep(mockBrktsToPost);
        invalidBrkts[1].start = 0;
        await postManyBrkts(invalidBrkts);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt data at index 1");
      }
    })
    it('should throw error when passed a non-array', async () => { 
      try {
        await postManyBrkts('not an array' as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkts data");
      }
    })
    it('should throw error when passed null', async () => { 
      try {
        await postManyBrkts(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkts data");
      }
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
        const brktJSON = JSON.stringify(resetBrkt);
        const response = await axios({
          method: "put",
          data: brktJSON,
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
      expect(puttedBrkt.fsa + '').toEqual(brktToPut.fsa);
      expect(puttedBrkt.sort_order).toEqual(brktToPut.sort_order);      
    });
    it('should throw error when trying to update a brkt with invalid data', async () => { 
      try {
        const invalidBrkt = {
          ...brktToPut,
          fee: '-13',
        }
        await putBrkt(invalidBrkt);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "putBrkt failed: Request failed with status code 422"
        );
      }
    })
    it('should throw error when passed a brkt with invalid id', async () => { 
      try {
        const invalidBrkt = {
          ...brktToPut,
          id: 'test',
        }
        await putBrkt(invalidBrkt);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt data");        
      }
    })
    it('should throw error when passed null', async () => { 
      try {
        await putBrkt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt data");
      }
    })
  })

  describe('replaceManyBrkts()', () => { 

    const rmSquadId = mockBrktsToPost[0].squad_id;
    let createdBrkts = false;
  
    const manyBrktsOneSquad: brktType[] = [
      {
        ...mockBrktsToPost[0],
      },
      {
        ...mockBrktsToPost[1],
      },
    ];

    beforeAll(async () => {
      // remove any old test data      
      await deleteAllSquadsForTmnt(tmntToDelId); // deletes all brkts for squad too
      await deleteAllDivsForTmnt(tmntToDelId);

      // make sure test squads in database
      await postManyDivs(mockDivsToPost);
      await postManySquads(mockSquadsToPost);       
    });

    beforeEach(() => {
      createdBrkts = false;
      // Reset the mocks before each test to ensure test isolation
    });

    afterEach(async () => {
      if (createdBrkts) {
        await deleteAllBrktsForTmnt(tmntToDelId);
      }
    });

    afterAll(async () => {      
      await deleteAllSquadsForTmnt(tmntToDelId); // deletes all brkts for squad too
      await deleteAllDivsForTmnt(tmntToDelId);
    });
    
    it("should update, insert, delete many brkts", async () => {
      const toInsert: brktType[] = [
        {
          ...initBrkt,
          id: "brk_05758d99c5494efabb3b0d273cf22e7a",
          squad_id: rmSquadId,
          div_id: mockBrktsToPost[0].div_id,
          sort_order: 5,
          start: 2,
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
          id: "brk_06758d99c5494efabb3b0d273cf22e7a",
          squad_id: rmSquadId,
          div_id: mockBrktsToPost[0].div_id,
          sort_order: 6,
          start: 3,
          games: 3,
          players: 8,
          fee: '5',
          first: '25',
          second: '10',
          admin: '5',
          fsa: '40',
        },
      ];

      const count = await postManyBrkts(manyBrktsOneSquad);
      expect(count).toBe(manyBrktsOneSquad.length);
      createdBrkts = true;
      const brkts = await getAllBrktsForSquad(rmSquadId);
      if (!brkts) {
        expect(true).toBeFalsy();
        return;
      }
      expect(brkts.length).toEqual(manyBrktsOneSquad.length);

      const brktsToUpdate = [
        {
          ...manyBrktsOneSquad[0],
          fee: '10',
          first: '50',
          second: '20',
          admin: '10',
          fsa: '80',
        },
        {
          ...toInsert[0],
        },
        {
          ...toInsert[1],
        },
      ];

      const replaceCount = await replaceManyBrkts(brktsToUpdate, rmSquadId);
      expect(replaceCount).toBe(brktsToUpdate.length);
      const replacedBrkts = await getAllBrktsForSquad(rmSquadId);
      if (!replacedBrkts) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedBrkts.length).toEqual(brktsToUpdate.length);
      for (let i = 0; i < replacedBrkts.length; i++) {
        if (replacedBrkts[i].id === brktsToUpdate[0].id) {
          expect(replacedBrkts[i].fee).toEqual(brktsToUpdate[0].fee);
          expect(replacedBrkts[i].first).toEqual(brktsToUpdate[0].first);
          expect(replacedBrkts[i].second).toEqual(brktsToUpdate[0].second);
          expect(replacedBrkts[i].admin).toEqual(brktsToUpdate[0].admin);
          expect(replacedBrkts[i].fsa + '').toEqual(brktsToUpdate[0].fsa);
        } else if (replacedBrkts[i].id === brktsToUpdate[1].id) {
          expect(replacedBrkts[i].fee).toEqual(brktsToUpdate[1].fee);
          expect(replacedBrkts[i].first).toEqual(brktsToUpdate[1].first);
          expect(replacedBrkts[i].second).toEqual(brktsToUpdate[1].second);
          expect(replacedBrkts[i].admin).toEqual(brktsToUpdate[1].admin);
          expect(replacedBrkts[i].fsa + '').toEqual(brktsToUpdate[1].fsa);
        } else if (replacedBrkts[i].id === brktsToUpdate[2].id) {
          expect(replacedBrkts[i].fee).toEqual(brktsToUpdate[2].fee);
          expect(replacedBrkts[i].first).toEqual(brktsToUpdate[2].first);
          expect(replacedBrkts[i].second).toEqual(brktsToUpdate[2].second);
          expect(replacedBrkts[i].admin).toEqual(brktsToUpdate[2].admin);
          expect(replacedBrkts[i].fsa + '').toEqual(brktsToUpdate[2].fsa);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should return 0 when passed an empty array", async () => {
      const count = await postManyBrkts(manyBrktsOneSquad);
      expect(count).toBe(manyBrktsOneSquad.length);
      createdBrkts = true;
      const brkts = await getAllBrktsForSquad(rmSquadId);
      if (!brkts) {
        expect(true).toBeFalsy();
        return;
      }
      expect(brkts.length).toEqual(manyBrktsOneSquad.length);

      const replaceCount = await replaceManyBrkts([], rmSquadId);
      expect(replaceCount).toBe(0);
      const replacedBrkts = await getAllBrktsForSquad(rmSquadId);
      if (!replacedBrkts) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedBrkts.length).toEqual(0);
    });
    it("should throw an error for invalid brkt ID in first item", async () => {
      const count = await postManyBrkts(manyBrktsOneSquad);
      expect(count).toBe(manyBrktsOneSquad.length);
      createdBrkts = true;
      const brkts = await getAllBrktsForSquad(rmSquadId);
      if (!brkts) {
        expect(true).toBeFalsy();
        return;
      }
      expect(brkts.length).toEqual(manyBrktsOneSquad.length);

      const brktsToUpdate = [
        {
          ...manyBrktsOneSquad[0],
          id: "",
        },
        {
          ...manyBrktsOneSquad[1],
        },
      ];
      await expect(
        replaceManyBrkts(brktsToUpdate, rmSquadId)
      ).rejects.toThrow("Invalid brkt data at index 0");
    });
    it("should throw an error for invalid brkt ID in second item", async () => {
      const count = await postManyBrkts(manyBrktsOneSquad);
      expect(count).toBe(manyBrktsOneSquad.length);
      createdBrkts = true;
      const brkts = await getAllBrktsForSquad(rmSquadId);
      if (!brkts) {
        expect(true).toBeFalsy();
        return;
      }
      expect(brkts.length).toEqual(manyBrktsOneSquad.length);

      const brktsToUpdate = [
        {
          ...manyBrktsOneSquad[0],
        },
        {
          ...manyBrktsOneSquad[1],
          id: "invalid-id",
        },
      ];
      await expect(
        replaceManyBrkts(brktsToUpdate, rmSquadId)
      ).rejects.toThrow("Invalid brkt data at index 1");
    });
    it("should throw an error for invalid brkt data in first item", async () => {
      const count = await postManyBrkts(manyBrktsOneSquad);
      expect(count).toBe(manyBrktsOneSquad.length);
      createdBrkts = true;
      const brkts = await getAllBrktsForSquad(rmSquadId);
      if (!brkts) {
        expect(true).toBeFalsy();
        return;
      }
      expect(brkts.length).toEqual(manyBrktsOneSquad.length);

      const brktsToUpdate = [
        {
          ...manyBrktsOneSquad[0],
          games: -1,
        },
        {
          ...manyBrktsOneSquad[1],
        },
      ];
      await expect(
        replaceManyBrkts(brktsToUpdate, rmSquadId)
      ).rejects.toThrow("Invalid brkt data at index 0");
    });
    it("should throw an error for invalid brkt data in second item", async () => {
      const count = await postManyBrkts(manyBrktsOneSquad);
      expect(count).toBe(manyBrktsOneSquad.length);
      createdBrkts = true;
      const brkts = await getAllBrktsForSquad(rmSquadId);
      if (!brkts) {
        expect(true).toBeFalsy();
        return;
      }
      expect(brkts.length).toEqual(manyBrktsOneSquad.length);

      const brktsToUpdate = [
        {
          ...manyBrktsOneSquad[0],          
        },
        {
          ...manyBrktsOneSquad[1],
          games: 1234,
        },
      ];
      await expect(
        replaceManyBrkts(brktsToUpdate, rmSquadId)
      ).rejects.toThrow("Invalid brkt data at index 1");
    });
    it("should throw an error if passed null as brkts", async () => {
      await expect(replaceManyBrkts(null as any, rmSquadId)).rejects.toThrow(
        "Invalid brkts"
      );
    });
    it("should throw an error if brkts is not an array", async () => {
      await expect(
        replaceManyBrkts("not-an-array" as any, rmSquadId)
      ).rejects.toThrow("Invalid brkts");
    });
    it("should throw an error if passed null as squadId", async () => {
      await expect(
        replaceManyBrkts(mockBrktsToPost, null as any)
      ).rejects.toThrow("Invalid squad id");
    });
    it("should throw an error if passed invalid squadId", async () => {
      await expect(
        replaceManyBrkts(mockBrktsToPost, "test")
      ).rejects.toThrow("Invalid squad id");
    });
    it("should throw an error if passed valid id, but not squad id", async () => {
      await expect(
        replaceManyBrkts(mockBrktsToPost, tmntId)
      ).rejects.toThrow("Invalid squad id");
    });        
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

    const notFoundId = "brk_00000000000000000000000000000000";
    
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
    it("should throw error when a brkt when ID is not found", async () => {
      try {
        await deleteBrkt(notFoundId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "deleteBrkt failed: Request failed with status code 404"
        );
      }
    });
    it("should throw error when a brkt when ID is invalid", async () => {
      try {
        await deleteBrkt('test');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    });
    it('should throw error when a brkt when ID is valid, but not a brkt ID', async () => { 
      try {
        await deleteBrkt(tmntToDelId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    })
    it('should throw error when a brkt when ID is blank', async () => {
      try {
        await deleteBrkt('');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    })
    it('should throw error when a brkt when ID is null', async () => {
      try {
        await deleteBrkt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    })

  })

  describe('deleteAllSquadBrkts', () => {       

    let didDel = false;

    beforeAll(async () => {
      // cleanup before tests
      await deleteAllBrktsForTmnt(tmntToDelId);      
      await deleteAllSquadsForTmnt(tmntToDelId);
      await deleteAllDivsForTmnt(tmntToDelId);

      // // setup for tests
      await postManyDivs(mockDivsToPost)
      await postManySquads(mockSquadsToPost)
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
      await deleteAllBrktsForTmnt(tmntToDelId);      
      await deleteAllSquadsForTmnt(tmntToDelId);
      await deleteAllDivsForTmnt(tmntToDelId);
    });

    it('should delete all brkts for a squad', async () => {
      const deleted = await deleteAllBrktsForSquad(multiBrkts[0].squad_id);      
      expect(deleted).toBe(2);
      didDel = true;
    })
    it("should not delete all brkts for a squad when squad id is not found", async () => {
      const deleted = await deleteAllBrktsForSquad(notFoundSquadId);
      expect(deleted).toBe(0);
    });
    it('should throw error deleting all brkts for a squad when ID is invalid', async () => {
      try {
        await deleteAllBrktsForSquad('test');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })
    it('should NOT delete all brkts for a squad when ID is valid, but not a squad ID', async () => {
      try {
        await deleteAllBrktsForSquad(tmntToDelId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })
    it('should NOT delete all brkts for a squad when passed null', async () => {
      try {
        await deleteAllBrktsForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })
  })

  describe('deleteAllDivBrkts', () => { 
    
    let didDel = false;

    beforeAll(async () => {
      // cleanup before tests
      await deleteAllBrktsForTmnt(tmntToDelId);
      await deleteAllSquadsForTmnt(tmntToDelId);
      await deleteAllDivsForTmnt(tmntToDelId);

      // setup for tests
      await postDiv(mockDivsToPost[0]);
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
      await deleteAllBrktsForTmnt(tmntToDelId);
      await deleteAllSquadsForTmnt(tmntToDelId);
      await deleteAllDivsForTmnt(tmntToDelId);
    });

    it('should delete all brkts for a div', async () => {
      const deleted = await deleteAllBrktsForDiv(multiBrkts[0].div_id);
      expect(deleted).toBe(multiBrkts.length);
      didDel = true;
    })
    it('should not delete all brkts for a div when ID is not found', async () => {
      const deleted = await deleteAllBrktsForDiv(notFoundDivId);
      expect(deleted).toBe(0);
    })

    it('should throw error when deleting all brkts for a div when ID is invalid', async () => {
      try {
        await deleteAllBrktsForDiv('test');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    })
    it('should throw error when deleting all brkts for a div when ID is valid, but not a div ID', async () => {
      try {
        await deleteAllBrktsForDiv(mockBrktsToPost[0].id);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    })
    it('should throw error when deleting all brkts for a div when passed null', async () => {
      try {
        await deleteAllBrktsForDiv(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    })

  })

  describe('deleteAllTmntBrkts', () => { 

    const toDelDivs = [...mockDivsToPost]
    const toDelSquads = [...mockSquadsToPost]
    const toDelBrkts = [...mockBrktsToPost]

    let didDel = false

    beforeAll(async () => {
      // cleanup before tests
      await deleteAllBrktsForTmnt(tmntToDelId);      
      await deleteAllSquadsForTmnt(tmntToDelId);
      await deleteAllDivsForTmnt(tmntToDelId);

      // // setup for tests
      await postManyDivs(mockDivsToPost)
      await postManySquads(mockSquadsToPost)
      await rePostToDel();
    })

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      await deleteAllBrktsForTmnt(tmntToDelId);      
    })

    afterAll(async () => {
      await deleteAllBrktsForTmnt(tmntToDelId);
      await deleteAllSquadsForTmnt(tmntToDelId);
      await deleteAllDivsForTmnt(tmntToDelId);
    })

    it('should delete all brkts for a tmnt', async () => {
      const deleted = await deleteAllBrktsForTmnt(tmntToDelId);
      didDel = true;
      expect(deleted).toBe(multiBrkts.length);
    })
    it('should not delete all brkts for a tmnt when tmnt ID is not found', async () => {
      const count = await deleteAllBrktsForTmnt(notFoundTmntId);
      expect(count).toBe(0);
    })
    it('should throw error when deleting all brkts for a tmnt when ID is invalid', async () => {
      try {
        await deleteAllBrktsForTmnt('test');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    })
    it('should throw error when deleting all brkts for a tmnt when tmnt ID is valid, but not a tmnt id', async () => {
      try {
        await deleteAllBrktsForTmnt(toDelBrkts[0].id);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    })
    it('should throw error when deleting all brkts for a tmnt when passed null', async () => {
      try {
        await deleteAllBrktsForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    })

  })
  
})