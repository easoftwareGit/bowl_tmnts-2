import axios, { AxiosError } from "axios";
import { baseOneBrktsApi } from "@/lib/db/apiPaths";
import { testBaseOneBrktsApi } from "../../../testApi";
import { oneBrktType } from "@/lib/types/types";
import { initOneBrkt } from "@/lib/db/initVals";
import { mockOneBrktsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { cloneDeep } from "lodash";
import {
  deleteAllOneBrktsForBrkt,
  deleteAllOneBrktsForDiv,
  deleteAllOneBrktsForSquad,
  deleteAllOneBrktsForTmnt,
  deleteOneBrkt,
  getAllOneBrktsForBrkt,
  getAllOneBrktsForDiv,
  getAllOneBrktsForSquad,
  getAllOneBrktsForTmnt,
  getOneBrkt,
  postManyOneBrkts,
  postOneBrkt,
} from "@/lib/db/oneBrkts/dbOneBrkts";

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
const oneOneBrktsUrl = url + "/oneBrkt/";

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
    it('should return null if tmnt id is invalid', async () => {
      const oneBrkts = await getAllOneBrktsForTmnt("test");
      expect(oneBrkts).toBeNull();
    })
    it('should return null if tmnt id is a valid id, but not a tmnt id', async () => {
      const oneBrkts = await getAllOneBrktsForTmnt(userId);
      expect(oneBrkts).toBeNull();
    })
    it('should return null if tmnt id is null', async () => {
      const oneBrkts = await getAllOneBrktsForTmnt(null as any);
      expect(oneBrkts).toBeNull();
    })
    it('should return null if tmnt id is undefined', async () => {
      const oneBrkts = await getAllOneBrktsForTmnt(undefined as any);
      expect(oneBrkts).toBeNull();
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
    it('should return null if squad id is invalid', async () => {
      const oneBrkts = await getAllOneBrktsForSquad("test");
      expect(oneBrkts).toBeNull();
    })
    it('should return null if squad id is a valid id, but not a squad id', async () => {
      const oneBrkts = await getAllOneBrktsForSquad(userId);
      expect(oneBrkts).toBeNull();
    })
    it('should return null if squad id is null', async () => {
      const oneBrkts = await getAllOneBrktsForSquad(null as any);
      expect(oneBrkts).toBeNull();
    })
    it('should return null if squad id is undefined', async () => {
      const oneBrkts = await getAllOneBrktsForSquad(undefined as any);
      expect(oneBrkts).toBeNull();
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
    it('should return null if div id is invalid', async () => {
      const oneBrkts = await getAllOneBrktsForDiv("test");
      expect(oneBrkts).toBeNull();
    })
    it('should return null if div id is a valid id, but not a div id', async () => {
      const oneBrkts = await getAllOneBrktsForDiv(userId);
      expect(oneBrkts).toBeNull();
    })
    it('should return null if div id is null', async () => {
      const oneBrkts = await getAllOneBrktsForDiv(null as any);
      expect(oneBrkts).toBeNull();
    })
    it('should return null if div id is undefined', async () => {
      const oneBrkts = await getAllOneBrktsForDiv(undefined as any);
      expect(oneBrkts).toBeNull();
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
    it('should return null if brkt id is invalid', async () => {
      const oneBrkts = await getAllOneBrktsForBrkt("test");
      expect(oneBrkts).toBeNull();
    })
    it('should return null if brkt id is a valid id, but not a brkt id', async () => {
      const oneBrkts = await getAllOneBrktsForBrkt(userId);
      expect(oneBrkts).toBeNull();
    })
    it('should return null if brkt id is null', async () => {
      const oneBrkts = await getAllOneBrktsForBrkt(null as any);
      expect(oneBrkts).toBeNull();
    })
    it('should return null if brkt id is undefined', async () => {
      const oneBrkts = await getAllOneBrktsForBrkt(undefined as any);
      expect(oneBrkts).toBeNull();
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
    it('should return 0 oneBrkts for not found oneBrkt', async () => { 
      const oneBrkt = await getOneBrkt(notFoundId);
      expect(oneBrkt).toBeNull();
    })
    it('should return null if oneBrkt id is invalid', async () => { 
      const oneBrkt = await getOneBrkt("test");
      expect(oneBrkt).toBeNull();
    })
    it('should return null if oneBrkt id is a valid id, but not a oneBrkt id', async () => { 
      const oneBrkt = await getOneBrkt(userId);
      expect(oneBrkt).toBeNull();
    })
    it('should return null if oneBrkt id is null', async () => { 
      const oneBrkt = await getOneBrkt(null as any);
      expect(oneBrkt).toBeNull();
    })
    it('should return null if oneBrkt id is undefined', async () => { 
      const oneBrkt = await getOneBrkt(undefined as any);
      expect(oneBrkt).toBeNull();
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
            url: oneOneBrktsUrl + toDel.id
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
      const toSanitizse = cloneDeep(oneBrktToPost);
      toSanitizse.bindex = Number.MAX_SAFE_INTEGER + 1;
      const postedOneBrkt = await postOneBrkt(toSanitizse);
      expect(postedOneBrkt).toBeNull();
    })
    it('should not post a oneBrkt if got invalid data', async () => {
      const invalidOneBrkt = cloneDeep(oneBrktToPost);
      invalidOneBrkt.brkt_id = userId;
      const postedBrktEntry = await postOneBrkt(invalidOneBrkt);
      expect(postedBrktEntry).toBeNull();
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
      const oneBrkts = await postManyOneBrkts(mockOneBrktsToPost);
      expect(oneBrkts).not.toBeNull();
      if (!oneBrkts) return;
      createdMany = true;
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
    // see test\app\api\oneBrkts\validate_oneBrkts.test.tsx
    // for full testing of sanitation and validation
    it('should NOT post many oneBrkts with sanitization, fee value sanitized to ""', async () => {
      const toSanitize = cloneDeep(mockOneBrktsToPost)
      toSanitize[0].bindex = Number.MAX_SAFE_INTEGER + 1;
      const oneBrkts = await postManyOneBrkts(toSanitize);
      expect(oneBrkts).toBeNull();
    })
    it('should not post many oneBrkts with no data', async () => {
      const postedOneBrkts = await postManyOneBrkts([]);
      expect(postedOneBrkts).not.toBeNull();
      expect(postedOneBrkts).toHaveLength(0);
    })
    it('should not post many oneBrkts with invalid data', async () => {
      const invalidOneBrkts = cloneDeep(mockOneBrktsToPost);
      invalidOneBrkts[1].brkt_id = userId;
      const postedOneBrkts = await postManyOneBrkts(invalidOneBrkts);
      expect(postedOneBrkts).toBeNull();
    })
  });

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
    it("should not delete all oneBrkts for a brkt when brkt id is invalid", async () => {
      const deleted = await deleteAllOneBrktsForBrkt("test");
      expect(deleted).toBe(-1);
    });
    it("should not delete all oneBrkts for a brkt when brkt id is valid, but not a brkt id", async () => {
      const deleted = await deleteAllOneBrktsForBrkt(userId);
      expect(deleted).toBe(-1);
    });
    it("should not delete all oneBrkts for a brkt when brkt id is null", async () => {
      const deleted = await deleteAllOneBrktsForBrkt(null as any);
      expect(deleted).toBe(-1);
    });
    it("should not delete all oneBrkts for a brkt when brkt id is undefined", async () => {
      const deleted = await deleteAllOneBrktsForBrkt(undefined as any);
      expect(deleted).toBe(-1);
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
    it("should not delete all oneBrkts for a div when div id is invalid", async () => {
      const deleted = await deleteAllOneBrktsForDiv("test");
      expect(deleted).toBe(-1);
    });
    it("should not delete all oneBrkts for a div when div id is valid, but not a brkt id", async () => {
      const deleted = await deleteAllOneBrktsForDiv(userId);
      expect(deleted).toBe(-1);
    });
    it("should not delete all oneBrkts for a div when div id is null", async () => {
      const deleted = await deleteAllOneBrktsForDiv(null as any);
      expect(deleted).toBe(-1);
    });
    it("should not delete all oneBrkts for a div when div id is undefined", async () => {
      const deleted = await deleteAllOneBrktsForDiv(undefined as any);
      expect(deleted).toBe(-1);
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
    it("should not delete all oneBrkts for a squad when squad id is invalid", async () => {
      const deleted = await deleteAllOneBrktsForSquad("test");
      expect(deleted).toBe(-1);
    });
    it("should not delete all oneBrkts for a squad when squad id is valid, but not a brkt id", async () => {
      const deleted = await deleteAllOneBrktsForSquad(userId);
      expect(deleted).toBe(-1);
    });
    it("should not delete all oneBrkts for a squad when squad id is null", async () => {
      const deleted = await deleteAllOneBrktsForSquad(null as any);
      expect(deleted).toBe(-1);
    });
    it("should not delete all oneBrkts for a squad when squad id is undefined", async () => {
      const deleted = await deleteAllOneBrktsForSquad(undefined as any);
      expect(deleted).toBe(-1);
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
    it("should not delete all oneBrkts for a tmnt when tmnt id is invalid", async () => {
      const deleted = await deleteAllOneBrktsForTmnt("test");
      expect(deleted).toBe(-1);
    });
    it("should not delete all oneBrkts for a tmnt when tmnt id is valid, but not a tmnt id", async () => {
      const deleted = await deleteAllOneBrktsForTmnt(userId);
      expect(deleted).toBe(-1);
    });
    it("should not delete all oneBrkts for a tmnt when tmnt id is null", async () => {
      const deleted = await deleteAllOneBrktsForTmnt(null as any);
      expect(deleted).toBe(-1);
    });
    it("should not delete all oneBrkts for a tmnt when tmnt id is undefined", async () => {
      const deleted = await deleteAllOneBrktsForTmnt(undefined as any);
      expect(deleted).toBe(-1);
    });
  });
});
