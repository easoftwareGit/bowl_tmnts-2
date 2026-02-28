import axios, { AxiosError } from "axios";
import { baseOneBrktsApi } from "@/lib/api/apiPaths";
import { testBaseOneBrktsApi } from "../../../testApi";
import type { oneBrktType } from "@/lib/types/types";
import { initOneBrkt } from "@/lib/db/initVals";
import { mockOneBrktsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import {
  deleteAllOneBrktsForBrkt,
  deleteAllOneBrktsForDiv,
  deleteAllOneBrktsForSquad,
  deleteAllOneBrktsForTmnt,  
  extractOneBrkts,  
  getAllOneBrktsForBrkt,
  getAllOneBrktsForDiv,
  getAllOneBrktsForSquad,
  getAllOneBrktsForTmnt,
  getOneBrkt,
  postManyOneBrkts,
  postOneBrkt,
} from "@/lib/db/oneBrkts/dbOneBrkts";
import { replaceManyOneBrkts } from "@/lib/db/oneBrkts/dbOneBrktsReplaceMany";
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

const url = testBaseOneBrktsApi.startsWith("undefined")
  ? baseOneBrktsApi
  : testBaseOneBrktsApi;
const oneBrktsUrl = url + "/oneBrkt/";

const oneBrktsToGet: oneBrktType[] = [
  {
    id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
    brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
    bindex: 0,
  },
  {
    id: "obk_5423c16d58a948748f32c7c72c632297",
    brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
    bindex: 1,
  },
  {
    id: "obk_8d500123a07d46f9bb23db61e74ffc1b",
    brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",
    bindex: 0,
  },
  {
    id: "obk_4ba9e037c86e494eb272efcd989dc9d0",
    brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",
    bindex: 1,
  },
];

const brktId = "brk_5109b54c2cc44ff9a3721de42c80c8c1";
const brktId2 = "brk_6ede2512c7d4409ca7b055505990a499";
const divId = "div_f30aea2c534f4cfe87f4315531cef8ef";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const userId = "usr_01234567890123456789012345678901";

const notFoundId = "obk_01234567890123456789012345678901";
const notFoundBrktId = "brk_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";

const divIdForMock = 'div_18997d3fd7ef4eb7ad2b53a9e93f9ce5';
const squadIdForMock = "sqd_1234ec18b3d44c0189c83f6ac5fd4ad6";
const tmntIdForMock = "tmt_d9b1af944d4941f65b2d2d4ac160cdea";

describe("dbOneBrkts", () => {

  const rePostToDel = async () => {
    const response = await axios.get(url);
    const oneBrkts = response.data.oneBrkts;
    const foundToDel = oneBrkts.find(
      (o: oneBrktType) => o.id === mockOneBrktsToPost[0].id
    );
    if (!foundToDel) {
      try {
        await postManyOneBrkts(mockOneBrktsToPost);
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }
  };

  describe("extractOneBrkts", () => {
    it("should return an empty array when given an empty array", () => {
      const result = extractOneBrkts([]);
      expect(result).toEqual([]);
    });
    it("should correctly map raw oneBrkts to extractOneBrkts", () => {
      const rawOneBrkt = [
        {
          id: "obk_2291bb31e72b4dc6b6fe9e76d135493d",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          bindex: 0,
          extraField: "ignore me", // should be ignored
        },
      ];

      const result = extractOneBrkts(rawOneBrkt);

      const expected: oneBrktType = {
        ...initOneBrkt,
        id: "obk_2291bb31e72b4dc6b6fe9e76d135493d",
        brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
        bindex: 0,
      };

      expect(result).toEqual([expected]);
    });
    it("should process multiple oneBrkts", () => {
      const rawOneBrkt = [
        {
          id: "obk_2291bb31e72b4dc6b6fe9e76d135493d",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          bindex: 0,
        },
        {
          id: "obk_2291bb31e72b4dc6b6fe9e76d135493d",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          bindex: 1,
        },
      ];

      const result = extractOneBrkts(rawOneBrkt);

      expect(result).toHaveLength(2);
      expect(result[0].bindex).toBe(0);            
      expect(result[1].bindex).toBe(1);      
    });
    it('should return an empty array when given null', () => {
      const result = extractOneBrkts(null);
      expect(result).toEqual([]);
    });
    it('should return an empty array when given a non array', () => {
      const result = extractOneBrkts('not an array');
      expect(result).toEqual([]);
    })
  });

  describe('getAllOneBrktsForTmnt()', () => {

    it('should get all oneBrkts for tournament', async () => {
      const oneBrkts = await getAllOneBrktsForTmnt(tmntId);
      expect(oneBrkts).toHaveLength(oneBrktsToGet.length);
      if (!oneBrkts) return;
      for (let i = 0; i < oneBrkts.length; i++) {
        if (oneBrkts[i].id === oneBrktsToGet[0].id) {
          expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[0].bindex);
        } else if (oneBrkts[i].id === oneBrktsToGet[1].id) {
          expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[1].bindex);
        } else if (oneBrkts[i].id === oneBrktsToGet[2].id) {
          expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[2].bindex);
        } else if (oneBrkts[i].id === oneBrktsToGet[3].id) {
          expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[3].bindex);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should return 0 oneBrkts for not found tournament', async () => {
      const oneBrkts = await getAllOneBrktsForTmnt(notFoundTmntId);
      expect(oneBrkts).toHaveLength(0);
    })
    it('should throw error if tmnt id is invalid', async () => {
      try {
        await getAllOneBrktsForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    })
    it('should throw error if tmnt id is a valid id, but not a tmnt id', async () => {
      try {
        await getAllOneBrktsForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    })
    it('should throw error if tmnt id is null', async () => {
      try {
        await getAllOneBrktsForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    })
  })

  describe('getAllOneBrktsForSquad()', () => {

    it('should get all oneBrkts for squad', async () => {
      const oneBrkts = await getAllOneBrktsForSquad(squadId);
      expect(oneBrkts).toHaveLength(oneBrktsToGet.length);
      if (!oneBrkts) return;
      for (let i = 0; i < oneBrkts.length; i++) {
        if (oneBrkts[i].id === oneBrktsToGet[0].id) {
          expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[0].bindex);
        } else if (oneBrkts[i].id === oneBrktsToGet[1].id) {
          expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[1].bindex);
        } else if (oneBrkts[i].id === oneBrktsToGet[2].id) {
          expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[2].bindex);
        } else if (oneBrkts[i].id === oneBrktsToGet[3].id) {
          expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[3].bindex);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should return 0 oneBrkts for not found squad', async () => {
      const oneBrkts = await getAllOneBrktsForSquad(notFoundSquadId);
      expect(oneBrkts).toHaveLength(0);
    })
    it('should throw error if squad id is invalid', async () => {
      try {
        await getAllOneBrktsForSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })
    it('should throw error if squad id is a valid id, but not a squad id', async () => {
      try {
        await getAllOneBrktsForSquad(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })
    it('should throw error if squad id is null', async () => {
      try {
        await getAllOneBrktsForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })
  })

  describe('getAllOneBrktsForDiv()', () => {

    it('should get all oneBrkts for division', async () => {
      const oneBrkts = await getAllOneBrktsForDiv(divId);
      expect(oneBrkts).toHaveLength(oneBrktsToGet.length);
      if (!oneBrkts) return;
      for (let i = 0; i < oneBrkts.length; i++) {
        if (oneBrkts[i].id === oneBrktsToGet[0].id) {
          expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[0].bindex);
        } else if (oneBrkts[i].id === oneBrktsToGet[1].id) {
          expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[1].bindex);
        } else if (oneBrkts[i].id === oneBrktsToGet[2].id) {
          expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[2].bindex);
        } else if (oneBrkts[i].id === oneBrktsToGet[3].id) {
          expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[3].bindex);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should return 0 oneBrkts for not found div', async () => {
      const oneBrkts = await getAllOneBrktsForDiv(notFoundDivId);
      expect(oneBrkts).toHaveLength(0);
    })
    it('should throw error if div id is invalid', async () => {
      try {
        await getAllOneBrktsForDiv("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    })
    it('should throw error if div id is a valid id, but not a div id', async () => {
      try {
        await getAllOneBrktsForDiv(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    })
    it('should throw error if div id is null', async () => {
      try {
        await getAllOneBrktsForDiv(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    })
  })

  describe('getAllOneBrktsForBrkt()', () => {

    it('should get all oneBrkts for bracket', async () => {
      const oneBrkts = await getAllOneBrktsForBrkt(brktId);
      expect(oneBrkts).toHaveLength(2);
      if (!oneBrkts) return;
      for (let i = 0; i < oneBrkts.length; i++) {
        if (oneBrkts[i].id === oneBrktsToGet[0].id) {
          expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[0].bindex);
        } else if (oneBrkts[i].id === oneBrktsToGet[1].id) {
          expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[1].bindex);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should return 0 oneBrkts for not found bracket', async () => {
      const oneBrkts = await getAllOneBrktsForBrkt(notFoundBrktId);
      expect(oneBrkts).toHaveLength(0);
    })
    it('should throw error if brkt id is invalid', async () => {
      try {
        await getAllOneBrktsForBrkt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    })
    it('should throw error if brkt id is a valid id, but not a brkt id', async () => {
      try {
        await getAllOneBrktsForBrkt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    })
    it('should throw error if brkt id is null', async () => {
      try {
        await getAllOneBrktsForBrkt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    })
  })

  describe('getOneBrkt()', () => { 

    it('should get one oneBrkt', async () => {
      const oneBrkt = await getOneBrkt(oneBrktsToGet[0].id);      
      if (!oneBrkt) return;      
      expect(oneBrkt.id).toEqual(oneBrktsToGet[0].id);
      expect(oneBrkt.brkt_id).toEqual(oneBrktsToGet[0].brkt_id);
      expect(oneBrkt.bindex).toEqual(oneBrktsToGet[0].bindex);      
    })
    it('should throw error if oneBrkts for not found oneBrkt', async () => { 
      try {
        await getOneBrkt(notFoundId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("getOneBrkt failed: Request failed with status code 404");
      }
    })
    it('should throw error if oneBrkt id is invalid', async () => { 
      try {
        await getOneBrkt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrkt id");
      }
    })
    it('should throw error if oneBrkt id is a valid id, but not a oneBrkt id', async () => { 
      try {
        await getOneBrkt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrkt id");
      }
    })
    it('should throw error if oneBrkt id is null', async () => { 
      try {
        await getOneBrkt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrkt id");
      }
    })
  })

  describe("postOneBrkt()", () => {
    const oneBrktToPost = {
      ...initOneBrkt,
      id: 'obk_0123c6c5556e407291c4b5666b2dccd7',
      brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
      bindex: 99,
    }

    let createdOneBrkt = false;

    const deletePostedOneBrkt = async () => {
      const response = await axios.get(url);
      const oneBrkts = response.data.oneBrkts;
      const toDel = oneBrkts.find((o: oneBrktType) => o.id === 'obk_0123c6c5556e407291c4b5666b2dccd7');
      if (toDel) {
        try {
          const delResponse = await axios({
            method: "delete",
            withCredentials: true,
            url: oneBrktsUrl + toDel.id
          });
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }
    beforeAll(async () => {
      await deletePostedOneBrkt();
    })
    beforeEach(() => {
      createdOneBrkt = false;
    })
    afterEach(async () => {
      if (createdOneBrkt) {
        await deletePostedOneBrkt();
      }
    })

    it('should post one oneBrkt', async () => {
      const postedOneBrkt = await postOneBrkt(oneBrktToPost);
      expect(postedOneBrkt).not.toBeNull();
      if (!postedOneBrkt) return;
      createdOneBrkt = true;
      expect(postedOneBrkt.id).toEqual(oneBrktToPost.id);
      expect(postedOneBrkt.brkt_id).toEqual(oneBrktToPost.brkt_id);
      expect(postedOneBrkt.bindex).toEqual(oneBrktToPost.bindex);
    })
    // see test\app\api\oneBrkts\validate_oneBrkts.test.tsx
    // for full testing of sanitation and validation
    it('should not post a oneBrkt with sanitized index (sanitized to undefined)', async () => {
      try { 
        const toSanitizse = cloneDeep(oneBrktToPost);
        toSanitizse.bindex = Number.MAX_SAFE_INTEGER + 1;
        await postOneBrkt(toSanitizse);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "postOneBrkt failed: Request failed with status code 422"
        );
      }      
    })
    it('should not post a oneBrkt if got invalid data', async () => {
      try {
        const invalidOneBrkt = cloneDeep(oneBrktToPost);
        invalidOneBrkt.brkt_id = userId;
        await postOneBrkt(invalidOneBrkt);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "postOneBrkt failed: Request failed with status code 422"
        );
      }
    })
    it('should throw error if oneBrkt is null', async () => { 
      try {
        await postOneBrkt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrkt data");
      }
    })
    it('should throw error if oneBrkt is not an object', async () => { 
      try {
        await postOneBrkt("test" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrkt data");
      }
    })
  });

  describe("postManyOneBrkts()", () => {

    let createdMany = false;
    beforeAll(async () => {
      await deleteAllOneBrktsForTmnt(tmntIdForMock);
    })
    beforeEach(() => {
      createdMany = false;
    })
    afterEach(async () => {
      if (createdMany) {
        await deleteAllOneBrktsForTmnt(tmntIdForMock);
      }
    })
    afterAll(async () => {
      await deleteAllOneBrktsForTmnt(tmntIdForMock);
    })
    it('should post many oneBrkts', async () => {
      const postedCount = await postManyOneBrkts(mockOneBrktsToPost);
      expect(postedCount).toBe(mockOneBrktsToPost.length);
      createdMany = true;

      const oneBrkts = await getAllOneBrktsForBrkt(mockOneBrktsToPost[0].brkt_id);
      expect(oneBrkts).not.toBeNull();
      if (!oneBrkts) return;
      expect(oneBrkts.length).toEqual(mockOneBrktsToPost.length);
      for (let i = 0; i < mockOneBrktsToPost.length; i++) {
        expect(oneBrkts[i].id).toEqual(mockOneBrktsToPost[i].id);
        if (oneBrkts[i].id === mockOneBrktsToPost[0].id) {
          expect(oneBrkts[i].bindex).toEqual(mockOneBrktsToPost[0].bindex);
        } else if (oneBrkts[i].id === mockOneBrktsToPost[1].id) {
          expect(oneBrkts[i].bindex).toEqual(mockOneBrktsToPost[1].bindex);
        } else if (oneBrkts[i].id === mockOneBrktsToPost[2].id) {
          expect(oneBrkts[i].bindex).toEqual(mockOneBrktsToPost[2].bindex);
        } else if (oneBrkts[i].id === mockOneBrktsToPost[3].id) {
          expect(oneBrkts[i].bindex).toEqual(mockOneBrktsToPost[3].bindex);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should return 0 when pased and empty array', async () => {
      const postedCount = await postManyOneBrkts([]);
      expect(postedCount).toBe(0);
    })
    // see test\app\api\oneBrkts\validate_oneBrkts.test.tsx
    // for full testing of sanitation and validation
    it('should NOT post many oneBrkts with sanitization, fee value sanitized to ""', async () => {
      try {
        const toSanitize = cloneDeep(mockOneBrktsToPost)
        toSanitize[0].bindex = Number.MAX_SAFE_INTEGER + 1;
        await postManyOneBrkts(toSanitize);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrkt data at index 0");
      }      
    })
    it('should not post many oneBrkts with no data', async () => {
      const postedCount = await postManyOneBrkts([]);
      expect(postedCount).toBe(0);
    })
    it('should throw error if post many oneBrkts with invalid oneBrkt id in first item', async () => {
      try {
        const invalidOneBrkts = cloneDeep(mockOneBrktsToPost);
        invalidOneBrkts[0].id = 'test';
        await postManyOneBrkts(invalidOneBrkts);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrkt data at index 0");
      }
    });
    it('should throw error if post many oneBrkts with invalid oneBrkt id in second item', async () => {
      try {
        const invalidOneBrkts = cloneDeep(mockOneBrktsToPost);
        invalidOneBrkts[1].id = 'test';
        await postManyOneBrkts(invalidOneBrkts);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrkt data at index 1");
      }
    })
    it('should throw error if post many oneBrkts with invalid oneBrkt data in first item', async () => {
      try {
        const invalidOneBrkts = cloneDeep(mockOneBrktsToPost);
        invalidOneBrkts[0].brkt_id = 'test';
        await postManyOneBrkts(invalidOneBrkts);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrkt data at index 0");
      }
    });
    it('should throw error if post many oneBrkts when passed null', async () => {
      try {
        await postManyOneBrkts(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrkts data");
      }
    })
    it('should throw error when passed a non array', async () => {
      try {
        await postManyOneBrkts(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid oneBrkts data");
      }
    })
  });

  describe("replaceManyOneBrkts()", () => { 
    const rmSquadId = 'sqd_1234ec18b3d44c0189c83f6ac5fd4ad6';

    let createdMany = false;
    beforeAll(async () => {
      await deleteAllOneBrktsForSquad(rmSquadId);      
    })
    beforeEach(() => {
      createdMany = false;
    })
    afterEach(async () => {
      if (createdMany) {
        await deleteAllOneBrktsForSquad(rmSquadId);
      }
    })
    afterAll(async () => {
      await deleteAllOneBrktsForSquad(rmSquadId);      
    })

    it("should update, insert, delete many oneBrkts", async () => {
      const toInsert: oneBrktType[] = [
        {
          ...initOneBrkt,
          id: 'obk_b4b2bc5682f042269cf0aaa8c32b25b8',
          brkt_id: 'brk_12344698f47e4d64935547923e2bdbfb',
          bindex: 6,
        },
        {
          ...initOneBrkt,
          id: 'obk_b5b2bc5682f042269cf0aaa8c32b25b8',
          brkt_id: 'brk_12344698f47e4d64935547923e2bdbfb',
          bindex: 7,
        },
      ];
      const count = await postManyOneBrkts(mockOneBrktsToPost);
      expect(count).toBe(mockOneBrktsToPost.length);
      createdMany = true;
      const oneBrkts = await getAllOneBrktsForSquad(rmSquadId);
      if (!oneBrkts) {
        expect(true).toBeFalsy();
        return;
      }
      expect(oneBrkts.length).toEqual(mockOneBrktsToPost.length);

      const oneBrktsToUpdate = [
        {
          ...mockOneBrktsToPost[0],
          bindex: 0,
        },
        {
          ...mockOneBrktsToPost[1],
          bindex: 1,
        },
        {
          ...toInsert[0],          
        },
        {
          ...toInsert[1],          
        },
      ]

      const replacedCount = await replaceManyOneBrkts(oneBrktsToUpdate, rmSquadId);
      expect(replacedCount).toBe(oneBrktsToUpdate.length);
      const replacedOneBrkts = await getAllOneBrktsForSquad(rmSquadId);
      if (!replacedOneBrkts) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedOneBrkts.length).toEqual(oneBrktsToUpdate.length);
      for (let i = 0; i < replacedOneBrkts.length; i++) {
        if (replacedOneBrkts[i].id === oneBrktsToUpdate[0].id) {
          expect(replacedOneBrkts[i].bindex).toEqual(oneBrktsToUpdate[0].bindex);
        } else if (replacedOneBrkts[i].id === oneBrktsToUpdate[1].id) {
          expect(replacedOneBrkts[i].bindex).toEqual(oneBrktsToUpdate[1].bindex);
        } else if (replacedOneBrkts[i].id === oneBrktsToUpdate[2].id) {
          expect(replacedOneBrkts[i].bindex).toEqual(oneBrktsToUpdate[2].bindex);
        } else if (replacedOneBrkts[i].id === oneBrktsToUpdate[3].id) {
          expect(replacedOneBrkts[i].bindex).toEqual(oneBrktsToUpdate[3].bindex);
        } else { 
          expect(true).toBeFalsy();
        }
      }
    })
    it("should return 0 when passed an empty array", async () => { 
      const count = await postManyOneBrkts(mockOneBrktsToPost);
      expect(count).toBe(mockOneBrktsToPost.length);
      createdMany = true;
      const oneBrkts = await getAllOneBrktsForSquad(rmSquadId);
      if (!oneBrkts) {
        expect(true).toBeFalsy();
        return;
      }
      expect(oneBrkts.length).toEqual(mockOneBrktsToPost.length);

      const replacedCount = await replaceManyOneBrkts([], rmSquadId);
      expect(replacedCount).toBe(0);
      const replacedOneBrkts = await getAllOneBrktsForSquad(rmSquadId);
      if (!replacedOneBrkts) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedOneBrkts.length).toEqual(0);
    })  
    it('should throw error when sanitize values to invalid values', async () => { 
      const count = await postManyOneBrkts(mockOneBrktsToPost);
      expect(count).toBe(mockOneBrktsToPost.length);
      createdMany = true;
      const oneBrkts = await getAllOneBrktsForSquad(rmSquadId);
      if (!oneBrkts) {
        expect(true).toBeFalsy();
        return;
      }
      expect(oneBrkts.length).toEqual(mockOneBrktsToPost.length);

      const oneBrktsToUpdate = [
        {
          ...mockOneBrktsToPost[0],
          bindex: Number.MAX_SAFE_INTEGER + 1,
        },
        {
          ...mockOneBrktsToPost[1],
          bindex: 1,
        },
      ]
      await expect(
        replaceManyOneBrkts(oneBrktsToUpdate, rmSquadId)
      ).rejects.toThrow("Invalid oneBrkt data at index 0");
    })
    it("should throw an error for invalid oneBrkt ID in first item", async () => { 
      const count = await postManyOneBrkts(mockOneBrktsToPost);
      expect(count).toBe(mockOneBrktsToPost.length);
      createdMany = true;
      const oneBrkts = await getAllOneBrktsForSquad(rmSquadId);
      if (!oneBrkts) {
        expect(true).toBeFalsy();
        return;
      }
      expect(oneBrkts.length).toEqual(mockOneBrktsToPost.length);
      
      const oneBrktsToUpdate = [
        {
          ...mockOneBrktsToPost[0],
          id: 'invalid',
        },
        {
          ...mockOneBrktsToPost[1],          
        },
      ]
      await expect(
        replaceManyOneBrkts(oneBrktsToUpdate, rmSquadId)
      ).rejects.toThrow("Invalid oneBrkt data at index 0");
    })
    it("should throw an error for invalid oneBrkt ID in second item", async () => { 
      const count = await postManyOneBrkts(mockOneBrktsToPost);
      expect(count).toBe(mockOneBrktsToPost.length);
      createdMany = true;
      const oneBrkts = await getAllOneBrktsForSquad(rmSquadId);
      if (!oneBrkts) {
        expect(true).toBeFalsy();
        return;
      }
      expect(oneBrkts.length).toEqual(mockOneBrktsToPost.length);
      
      const oneBrktsToUpdate = [
        {
          ...mockOneBrktsToPost[0],          
        },
        {
          ...mockOneBrktsToPost[1],
          id: 'invalid',
        },
      ]
      await expect(
        replaceManyOneBrkts(oneBrktsToUpdate, rmSquadId)
      ).rejects.toThrow("Invalid oneBrkt data at index 1");
    })
    it("should throw an error for invalid oneBrkt data in first item", async () => { 
      const count = await postManyOneBrkts(mockOneBrktsToPost);
      expect(count).toBe(mockOneBrktsToPost.length);
      createdMany = true;
      const oneBrkts = await getAllOneBrktsForSquad(rmSquadId);
      if (!oneBrkts) {
        expect(true).toBeFalsy();
        return;
      }
      expect(oneBrkts.length).toEqual(mockOneBrktsToPost.length);
      
      const oneBrktsToUpdate = [
        {
          ...mockOneBrktsToPost[0],
          brkt_id: 'invalid',
        },
        {
          ...mockOneBrktsToPost[1],          
        },
      ]
      await expect(
        replaceManyOneBrkts(oneBrktsToUpdate, rmSquadId)
      ).rejects.toThrow("Invalid oneBrkt data at index 0");
    })
    it("should throw an error for invalid oneBrkt ID in second item", async () => { 
      const count = await postManyOneBrkts(mockOneBrktsToPost);
      expect(count).toBe(mockOneBrktsToPost.length);
      createdMany = true;
      const oneBrkts = await getAllOneBrktsForSquad(rmSquadId);
      if (!oneBrkts) {
        expect(true).toBeFalsy();
        return;
      }
      expect(oneBrkts.length).toEqual(mockOneBrktsToPost.length);
      
      const oneBrktsToUpdate = [
        {
          ...mockOneBrktsToPost[0],          
        },
        {
          ...mockOneBrktsToPost[1],
          bindex: -1,
        },
      ]
      await expect(
        replaceManyOneBrkts(oneBrktsToUpdate, rmSquadId)
      ).rejects.toThrow("Invalid oneBrkt data at index 1");
    })
    it("should throw an error if passed null as oneBrkts", async () => {
      await expect(replaceManyOneBrkts(null as any, rmSquadId)).rejects.toThrow(
        "Invalid oneBrkts"
      );
    });
    it("should throw an error if oneBrkts is not an array", async () => {
      await expect(
        replaceManyOneBrkts("not-an-array" as any, rmSquadId)
      ).rejects.toThrow("Invalid oneBrkts");
    });
    it("should throw an error if passed null as squadId", async () => {
      await expect(
        replaceManyOneBrkts(mockOneBrktsToPost, null as any)
      ).rejects.toThrow("Invalid squad id");
    });
    it("should throw an error if passed invalid squadId", async () => {
      await expect(
        replaceManyOneBrkts(mockOneBrktsToPost, "test")
      ).rejects.toThrow("Invalid squad id");
    });
    it("should throw an error if passed valid id, but not squad id", async () => {
      await expect(
        replaceManyOneBrkts(mockOneBrktsToPost, userId)
      ).rejects.toThrow("Invalid squad id");
    });
  })

  describe("deleteAllOneBrktsForBrkt()", () => {
    let didDel = false;

    beforeAll(async () => {
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
      await deleteAllOneBrktsForTmnt(tmntIdForMock);      
    });

    it("should delete all oneBrkts for a brkt", async () => {
      const deleted = await deleteAllOneBrktsForBrkt(mockOneBrktsToPost[0].brkt_id);
      expect(deleted).toBe(mockOneBrktsToPost.length);
      didDel = true;
    });
    it("should not delete all oneBrkts for a brkt when brkt id is not found", async () => {
      const deleted = await deleteAllOneBrktsForBrkt(notFoundBrktId);
      expect(deleted).toBe(0);
    });
    it("should throw an error for delete all oneBrkts for a brkt when brkt id is invalid", async () => {
      try {
        await deleteAllOneBrktsForBrkt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    });
    it("should throw error for delete all oneBrkts for a brkt when brkt id is valid, but not a brkt id", async () => {
      try {
        await deleteAllOneBrktsForBrkt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    });
    it("should throw error for delete all oneBrkts for a brkt when brkt id is null", async () => {
      try {
        await deleteAllOneBrktsForBrkt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    });    
  });

  describe("deleteAllOneBrktsForDiv()", () => {
    let didDel = false;

    beforeAll(async () => {
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
      await deleteAllOneBrktsForTmnt(tmntIdForMock);
    });

    it("should delete all oneBrkts for a div", async () => {
      const deleted = await deleteAllOneBrktsForDiv(divIdForMock);      
      expect(deleted).toBe(mockOneBrktsToPost.length);
      didDel = true;
    });
    it("should not delete all oneBrkts for a div when div id is not found", async () => {
      const deleted = await deleteAllOneBrktsForDiv(notFoundDivId);
      expect(deleted).toBe(0);
    });
    it("should throw error for delete all oneBrkts for a div when div id is invalid", async () => {
      try {
        await deleteAllOneBrktsForDiv("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should throw error for delete all oneBrkts for a div when div id is valid, but not a brkt id", async () => {
      try {
        await deleteAllOneBrktsForDiv(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should throw error for delete all oneBrkts for a div when div id is null", async () => {
      try {
        await deleteAllOneBrktsForDiv(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
  });

  describe("deleteAllOneBrktsForSquad()", () => {
    let didDel = false;

    beforeAll(async () => {
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
      deleteAllOneBrktsForTmnt(tmntIdForMock);
    });

    it("should delete all oneBrkts for a squad", async () => {
      const deleted = await deleteAllOneBrktsForSquad(squadIdForMock);
      expect(deleted).toBe(mockOneBrktsToPost.length);
      didDel = true;
    });
    it("should not delete all oneBrkts for a squad when squad id is not found", async () => {
      const deleted = await deleteAllOneBrktsForSquad(notFoundSquadId);
      expect(deleted).toBe(0);
    });
    it("should throw error for delete all oneBrkts for a squad when squad id is invalid", async () => {
      try {
        await deleteAllOneBrktsForSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should throw error for delete all oneBrkts for a squad when squad id is valid, but not a brkt id", async () => {
      try {
        await deleteAllOneBrktsForSquad(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should throw error for delete all oneBrkts for a squad when squad id is null", async () => {
      try {
        await deleteAllOneBrktsForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
  });
  
  describe("deleteAllOneBrktsForTmnt()", () => {
    let didDel = false;

    beforeAll(async () => {
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
      await deleteAllOneBrktsForTmnt(tmntIdForMock);
    });

    it("should delete all oneBrkts for a tmnt", async () => {
      const deleted = await deleteAllOneBrktsForTmnt(tmntIdForMock);
      expect(deleted).toBe(mockOneBrktsToPost.length);
      didDel = true;
    });
    it("should not delete all oneBrkts for a tmnt when tmnt id is not found", async () => {
      const deleted = await deleteAllOneBrktsForTmnt(notFoundTmntId);
      expect(deleted).toBe(0);
    });
    it("should throw error for delete all oneBrkts for a tmnt when tmnt id is invalid", async () => {
      try {
        await deleteAllOneBrktsForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error for delete all oneBrkts for a tmnt when tmnt id is valid, but not a tmnt id", async () => {
      try {
        await deleteAllOneBrktsForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error for delete all oneBrkts for a tmnt when tmnt id is null", async () => {
      try {
        await deleteAllOneBrktsForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });
});
