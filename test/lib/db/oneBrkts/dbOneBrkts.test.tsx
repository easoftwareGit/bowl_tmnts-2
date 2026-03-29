import { AxiosError } from "axios";
import { publicApi, privateApi } from "@/lib/api/axios";
import { baseOneBrktsApi } from "@/lib/api/apiPaths";
import { testBaseOneBrktsApi } from "../../../testApi";
import type { oneBrktType } from "@/lib/types/types";
import { initOneBrkt } from "@/lib/db/initVals";
import {
  deleteOneBrkt,
  extractOneBrkts,
  getAllOneBrktsForBrkt,
  getAllOneBrktsForDiv,
  getAllOneBrktsForSquad,
  getAllOneBrktsForTmnt,
  getOneBrkt,
  postOneBrkt,
} from "@/lib/db/oneBrkts/dbOneBrkts";
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
const divId = "div_f30aea2c534f4cfe87f4315531cef8ef";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const userId = "usr_01234567890123456789012345678901";

const notFoundId = "obk_01234567890123456789012345678901";
const notFoundBrktId = "brk_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";

describe("dbOneBrkts", () => {
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
          extraField: "ignore me",
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

    it("should return an empty array when given null", () => {
      const result = extractOneBrkts(null);
      expect(result).toEqual([]);
    });

    it("should return an empty array when given a non array", () => {
      const result = extractOneBrkts("not an array");
      expect(result).toEqual([]);
    });
  });

  describe("getAllOneBrktsForTmnt()", () => {
    it("should get all oneBrkts for tournament", async () => {
      const oneBrkts = await getAllOneBrktsForTmnt(tmntId);

      expect(oneBrkts).toHaveLength(oneBrktsToGet.length);

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
    });

    it("should return 0 oneBrkts for not found tournament", async () => {
      const oneBrkts = await getAllOneBrktsForTmnt(notFoundTmntId);
      expect(oneBrkts).toHaveLength(0);
    });

    it("should throw error if tmnt id is invalid", async () => {
      await expect(getAllOneBrktsForTmnt("test")).rejects.toThrow(
        "Invalid tmnt id"
      );
    });

    it("should throw error if tmnt id is a valid id, but not a tmnt id", async () => {
      await expect(getAllOneBrktsForTmnt(userId)).rejects.toThrow(
        "Invalid tmnt id"
      );
    });

    it("should throw error if tmnt id is null", async () => {
      await expect(getAllOneBrktsForTmnt(null as any)).rejects.toThrow(
        "Invalid tmnt id"
      );
    });
  });

  describe("getAllOneBrktsForSquad()", () => {
    it("should get all oneBrkts for squad", async () => {
      const oneBrkts = await getAllOneBrktsForSquad(squadId);

      expect(oneBrkts).toHaveLength(oneBrktsToGet.length);

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
    });

    it("should return 0 oneBrkts for not found squad", async () => {
      const oneBrkts = await getAllOneBrktsForSquad(notFoundSquadId);
      expect(oneBrkts).toHaveLength(0);
    });

    it("should throw error if squad id is invalid", async () => {
      await expect(getAllOneBrktsForSquad("test")).rejects.toThrow(
        "Invalid squad id"
      );
    });

    it("should throw error if squad id is a valid id, but not a squad id", async () => {
      await expect(getAllOneBrktsForSquad(userId)).rejects.toThrow(
        "Invalid squad id"
      );
    });

    it("should throw error if squad id is null", async () => {
      await expect(getAllOneBrktsForSquad(null as any)).rejects.toThrow(
        "Invalid squad id"
      );
    });
  });

  describe("getAllOneBrktsForDiv()", () => {
    it("should get all oneBrkts for division", async () => {
      const oneBrkts = await getAllOneBrktsForDiv(divId);

      expect(oneBrkts).toHaveLength(oneBrktsToGet.length);

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
    });

    it("should return 0 oneBrkts for not found div", async () => {
      const oneBrkts = await getAllOneBrktsForDiv(notFoundDivId);
      expect(oneBrkts).toHaveLength(0);
    });

    it("should throw error if div id is invalid", async () => {
      await expect(getAllOneBrktsForDiv("test")).rejects.toThrow(
        "Invalid div id"
      );
    });

    it("should throw error if div id is a valid id, but not a div id", async () => {
      await expect(getAllOneBrktsForDiv(userId)).rejects.toThrow(
        "Invalid div id"
      );
    });

    it("should throw error if div id is null", async () => {
      await expect(getAllOneBrktsForDiv(null as any)).rejects.toThrow(
        "Invalid div id"
      );
    });
  });

  describe("getAllOneBrktsForBrkt()", () => {
    it("should get all oneBrkts for bracket", async () => {
      const oneBrkts = await getAllOneBrktsForBrkt(brktId);

      expect(oneBrkts).toHaveLength(2);

      for (let i = 0; i < oneBrkts.length; i++) {
        if (oneBrkts[i].id === oneBrktsToGet[0].id) {
          expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[0].bindex);
        } else if (oneBrkts[i].id === oneBrktsToGet[1].id) {
          expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[1].bindex);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should return 0 oneBrkts for not found bracket", async () => {
      const oneBrkts = await getAllOneBrktsForBrkt(notFoundBrktId);
      expect(oneBrkts).toHaveLength(0);
    });

    it("should throw error if brkt id is invalid", async () => {
      await expect(getAllOneBrktsForBrkt("test")).rejects.toThrow(
        "Invalid brkt id"
      );
    });

    it("should throw error if brkt id is a valid id, but not a brkt id", async () => {
      await expect(getAllOneBrktsForBrkt(userId)).rejects.toThrow(
        "Invalid brkt id"
      );
    });

    it("should throw error if brkt id is null", async () => {
      await expect(getAllOneBrktsForBrkt(null as any)).rejects.toThrow(
        "Invalid brkt id"
      );
    });
  });

  describe("getOneBrkt()", () => {
    it("should get one oneBrkt", async () => {
      const oneBrkt = await getOneBrkt(oneBrktsToGet[0].id);

      expect(oneBrkt.id).toEqual(oneBrktsToGet[0].id);
      expect(oneBrkt.brkt_id).toEqual(oneBrktsToGet[0].brkt_id);
      expect(oneBrkt.bindex).toEqual(oneBrktsToGet[0].bindex);
    });

    it("should throw error if oneBrkts for not found oneBrkt", async () => {
      await expect(getOneBrkt(notFoundId)).rejects.toThrow(
        "getOneBrkt failed: Request failed with status code 404"
      );
    });

    it("should throw error if oneBrkt id is invalid", async () => {
      await expect(getOneBrkt("test")).rejects.toThrow("Invalid oneBrkt id");
    });

    it("should throw error if oneBrkt id is a valid id, but not a oneBrkt id", async () => {
      await expect(getOneBrkt(userId)).rejects.toThrow("Invalid oneBrkt id");
    });

    it("should throw error if oneBrkt id is null", async () => {
      await expect(getOneBrkt(null as any)).rejects.toThrow(
        "Invalid oneBrkt id"
      );
    });
  });

  describe("postOneBrkt()", () => {
    const oneBrktToPost: oneBrktType = {
      ...initOneBrkt,
      id: "obk_0123c6c5556e407291c4b5666b2dccd7",
      brkt_id: "brk_aa3da3a411b346879307831b6fdadd5f",
      bindex: 99,
    };

    let createdOneBrkt = false;

    const deletePostedOneBrkt = async () => {
      const response = await publicApi.get(url);
      const oneBrkts = response.data?.oneBrkts ?? [];
      const toDel = oneBrkts.find(
        (o: oneBrktType) => o.id === oneBrktToPost.id
      );

      if (toDel) {
        try {
          await privateApi.delete(oneBrktsUrl + toDel.id);
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    };

    beforeAll(async () => {
      await deletePostedOneBrkt();
    });

    beforeEach(() => {
      createdOneBrkt = false;
    });

    afterEach(async () => {
      if (createdOneBrkt) {
        await deletePostedOneBrkt();
      }
    });

    it("should post one oneBrkt", async () => {
      const postedOneBrkt = await postOneBrkt(oneBrktToPost);
      createdOneBrkt = true;

      expect(postedOneBrkt).not.toBeNull();
      expect(postedOneBrkt.id).toEqual(oneBrktToPost.id);
      expect(postedOneBrkt.brkt_id).toEqual(oneBrktToPost.brkt_id);
      expect(postedOneBrkt.bindex).toEqual(oneBrktToPost.bindex);
    });

    // see test\app\api\oneBrkts\validate_oneBrkts.test.tsx
    // for full testing of sanitation and validation
    it("should not post a oneBrkt with sanitized index (sanitized to undefined)", async () => {
      const toSanitize = cloneDeep(oneBrktToPost);
      toSanitize.bindex = Number.MAX_SAFE_INTEGER + 1;

      await expect(postOneBrkt(toSanitize)).rejects.toThrow(
        "postOneBrkt failed: Request failed with status code 422"
      );
    });

    it("should not post a oneBrkt if got invalid data", async () => {
      const invalidOneBrkt = cloneDeep(oneBrktToPost);
      invalidOneBrkt.brkt_id = userId;

      await expect(postOneBrkt(invalidOneBrkt)).rejects.toThrow(
        "postOneBrkt failed: Request failed with status code 422"
      );
    });

    it("should throw error if oneBrkt is null", async () => {
      await expect(postOneBrkt(null as any)).rejects.toThrow(
        "Invalid oneBrkt data"
      );
    });

    it("should throw error if oneBrkt is not an object", async () => {
      await expect(postOneBrkt("test" as any)).rejects.toThrow(
        "Invalid oneBrkt data"
      );
    });
  });

  describe("deleteOneBrkt()", () => {
    const toDel: oneBrktType = {
      ...initOneBrkt,
      id: "obk_bbae841f36244b5ab5c0ec5793820d85",
      brkt_id: "brk_d047ea07dbc6453a8a705f4bb7599ed4",
      bindex: 0,
    };

    const rePostOneBrkt = async (oneBrkt: oneBrktType) => {
      try {
        const getResponse = await publicApi.get(oneBrktsUrl + oneBrkt.id);
        const found = getResponse.data?.oneBrkt;
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
        const oneBrktJSON = JSON.stringify(oneBrkt);
        await privateApi.post(url, oneBrktJSON);
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    };

    let didDel = false;

    beforeAll(async () => {
      await rePostOneBrkt(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostOneBrkt(toDel);
      }
    });

    it("should delete a oneBrkt", async () => {
      const deleted = await deleteOneBrkt(toDel.id);
      didDel = true;
      expect(deleted).toBe(1);
    });

    it("should retrun 0 when trying to delete a oneBrkt when ID is not found", async () => {
      const deleted = await deleteOneBrkt(notFoundId);
      didDel = true;
      expect(deleted).toBe(0);
    });

    it("should throw error when trying to delete a oneBrkt when id is invalid", async () => {
      await expect(deleteOneBrkt("test")).rejects.toThrow("Invalid oneBrkt id");
    });

    it("should throw error when trying to delete a oneBrkt when id is valid, but not a oneBrkt id", async () => {
      await expect(deleteOneBrkt(userId)).rejects.toThrow(
        "Invalid oneBrkt id"
      );
    });

    it("should throw error when trying to delete a oneBrkt when id is null", async () => {
      await expect(deleteOneBrkt(null as any)).rejects.toThrow(
        "Invalid oneBrkt id"
      );
    });
  });
});

// import axios, { AxiosError } from "axios";
// import { baseOneBrktsApi } from "@/lib/api/apiPaths";
// import { testBaseOneBrktsApi } from "../../../testApi";
// import type { oneBrktType } from "@/lib/types/types";
// import { initOneBrkt } from "@/lib/db/initVals";
// import { mockOneBrktsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
// import {
//   deleteOneBrkt,
//   extractOneBrkts,  
//   getAllOneBrktsForBrkt,
//   getAllOneBrktsForDiv,
//   getAllOneBrktsForSquad,
//   getAllOneBrktsForTmnt,
//   getOneBrkt,
//   postOneBrkt,
// } from "@/lib/db/oneBrkts/dbOneBrkts";
// import { cloneDeep } from "lodash";

// // before running this test, run the following commands in the terminal:
// // 1) clear and re-seed the database
// //    a) clear the database
// //       npx prisma db push --force-reset
// //    b) re-seed
// //       npx prisma db seed
// //    if just need to re-seed, then only need step 1b
// // 2) make sure the server is running
// //    in the VS activity bar,
// //      a) click on "Run and Debug" (Ctrl+Shift+D)
// //      b) at the top of the window, click on the drop-down arrow
// //      c) select "Node.js: debug server-side"
// //      d) directly to the left of the drop down select, click the green play button
// //         This will start the server in debug mode.

// const url = testBaseOneBrktsApi.startsWith("undefined")
//   ? baseOneBrktsApi
//   : testBaseOneBrktsApi;
// const oneBrktsUrl = url + "/oneBrkt/";

// const oneBrktsToGet: oneBrktType[] = [
//   {
//     id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
//     brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
//     bindex: 0,
//   },
//   {
//     id: "obk_5423c16d58a948748f32c7c72c632297",
//     brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
//     bindex: 1,
//   },
//   {
//     id: "obk_8d500123a07d46f9bb23db61e74ffc1b",
//     brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",
//     bindex: 0,
//   },
//   {
//     id: "obk_4ba9e037c86e494eb272efcd989dc9d0",
//     brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",
//     bindex: 1,
//   },
// ];

// const brktId = "brk_5109b54c2cc44ff9a3721de42c80c8c1";
// const brktId2 = "brk_6ede2512c7d4409ca7b055505990a499";
// const divId = "div_f30aea2c534f4cfe87f4315531cef8ef";
// const squadId = "sqd_7116ce5f80164830830a7157eb093396";
// const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
// const userId = "usr_01234567890123456789012345678901";

// const notFoundId = "obk_01234567890123456789012345678901";
// const notFoundBrktId = "brk_01234567890123456789012345678901";
// const notFoundDivId = "div_01234567890123456789012345678901";
// const notFoundSquadId = "sqd_01234567890123456789012345678901";
// const notFoundTmntId = "tmt_01234567890123456789012345678901";

// describe("dbOneBrkts", () => {

//   describe("extractOneBrkts", () => {
//     it("should return an empty array when given an empty array", () => {
//       const result = extractOneBrkts([]);
//       expect(result).toEqual([]);
//     });
//     it("should correctly map raw oneBrkts to extractOneBrkts", () => {
//       const rawOneBrkt = [
//         {
//           id: "obk_2291bb31e72b4dc6b6fe9e76d135493d",
//           brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
//           bindex: 0,
//           extraField: "ignore me", // should be ignored
//         },
//       ];

//       const result = extractOneBrkts(rawOneBrkt);

//       const expected: oneBrktType = {
//         ...initOneBrkt,
//         id: "obk_2291bb31e72b4dc6b6fe9e76d135493d",
//         brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
//         bindex: 0,
//       };

//       expect(result).toEqual([expected]);
//     });
//     it("should process multiple oneBrkts", () => {
//       const rawOneBrkt = [
//         {
//           id: "obk_2291bb31e72b4dc6b6fe9e76d135493d",
//           brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
//           bindex: 0,
//         },
//         {
//           id: "obk_2291bb31e72b4dc6b6fe9e76d135493d",
//           brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
//           bindex: 1,
//         },
//       ];

//       const result = extractOneBrkts(rawOneBrkt);

//       expect(result).toHaveLength(2);
//       expect(result[0].bindex).toBe(0);            
//       expect(result[1].bindex).toBe(1);      
//     });
//     it('should return an empty array when given null', () => {
//       const result = extractOneBrkts(null);
//       expect(result).toEqual([]);
//     });
//     it('should return an empty array when given a non array', () => {
//       const result = extractOneBrkts('not an array');
//       expect(result).toEqual([]);
//     })
//   });

//   describe('getAllOneBrktsForTmnt()', () => {

//     it('should get all oneBrkts for tournament', async () => {
//       const oneBrkts = await getAllOneBrktsForTmnt(tmntId);
//       expect(oneBrkts).toHaveLength(oneBrktsToGet.length);
//       if (!oneBrkts) return;
//       for (let i = 0; i < oneBrkts.length; i++) {
//         if (oneBrkts[i].id === oneBrktsToGet[0].id) {
//           expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[0].bindex);
//         } else if (oneBrkts[i].id === oneBrktsToGet[1].id) {
//           expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[1].bindex);
//         } else if (oneBrkts[i].id === oneBrktsToGet[2].id) {
//           expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[2].bindex);
//         } else if (oneBrkts[i].id === oneBrktsToGet[3].id) {
//           expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[3].bindex);
//         } else {
//           expect(true).toBeFalsy();
//         }
//       }
//     })
//     it('should return 0 oneBrkts for not found tournament', async () => {
//       const oneBrkts = await getAllOneBrktsForTmnt(notFoundTmntId);
//       expect(oneBrkts).toHaveLength(0);
//     })
//     it('should throw error if tmnt id is invalid', async () => {
//       try {
//         await getAllOneBrktsForTmnt("test");
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe("Invalid tmnt id");
//       }
//     })
//     it('should throw error if tmnt id is a valid id, but not a tmnt id', async () => {
//       try {
//         await getAllOneBrktsForTmnt(userId);
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe("Invalid tmnt id");
//       }
//     })
//     it('should throw error if tmnt id is null', async () => {
//       try {
//         await getAllOneBrktsForTmnt(null as any);
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe("Invalid tmnt id");
//       }
//     })
//   })

//   describe('getAllOneBrktsForSquad()', () => {

//     it('should get all oneBrkts for squad', async () => {
//       const oneBrkts = await getAllOneBrktsForSquad(squadId);
//       expect(oneBrkts).toHaveLength(oneBrktsToGet.length);
//       if (!oneBrkts) return;
//       for (let i = 0; i < oneBrkts.length; i++) {
//         if (oneBrkts[i].id === oneBrktsToGet[0].id) {
//           expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[0].bindex);
//         } else if (oneBrkts[i].id === oneBrktsToGet[1].id) {
//           expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[1].bindex);
//         } else if (oneBrkts[i].id === oneBrktsToGet[2].id) {
//           expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[2].bindex);
//         } else if (oneBrkts[i].id === oneBrktsToGet[3].id) {
//           expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[3].bindex);
//         } else {
//           expect(true).toBeFalsy();
//         }
//       }
//     })
//     it('should return 0 oneBrkts for not found squad', async () => {
//       const oneBrkts = await getAllOneBrktsForSquad(notFoundSquadId);
//       expect(oneBrkts).toHaveLength(0);
//     })
//     it('should throw error if squad id is invalid', async () => {
//       try {
//         await getAllOneBrktsForSquad("test");
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe("Invalid squad id");
//       }
//     })
//     it('should throw error if squad id is a valid id, but not a squad id', async () => {
//       try {
//         await getAllOneBrktsForSquad(userId);
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe("Invalid squad id");
//       }
//     })
//     it('should throw error if squad id is null', async () => {
//       try {
//         await getAllOneBrktsForSquad(null as any);
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe("Invalid squad id");
//       }
//     })
//   })

//   describe('getAllOneBrktsForDiv()', () => {

//     it('should get all oneBrkts for division', async () => {
//       const oneBrkts = await getAllOneBrktsForDiv(divId);
//       expect(oneBrkts).toHaveLength(oneBrktsToGet.length);
//       if (!oneBrkts) return;
//       for (let i = 0; i < oneBrkts.length; i++) {
//         if (oneBrkts[i].id === oneBrktsToGet[0].id) {
//           expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[0].bindex);
//         } else if (oneBrkts[i].id === oneBrktsToGet[1].id) {
//           expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[1].bindex);
//         } else if (oneBrkts[i].id === oneBrktsToGet[2].id) {
//           expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[2].bindex);
//         } else if (oneBrkts[i].id === oneBrktsToGet[3].id) {
//           expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[3].bindex);
//         } else {
//           expect(true).toBeFalsy();
//         }
//       }
//     })
//     it('should return 0 oneBrkts for not found div', async () => {
//       const oneBrkts = await getAllOneBrktsForDiv(notFoundDivId);
//       expect(oneBrkts).toHaveLength(0);
//     })
//     it('should throw error if div id is invalid', async () => {
//       try {
//         await getAllOneBrktsForDiv("test");
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe("Invalid div id");
//       }
//     })
//     it('should throw error if div id is a valid id, but not a div id', async () => {
//       try {
//         await getAllOneBrktsForDiv(userId);
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe("Invalid div id");
//       }
//     })
//     it('should throw error if div id is null', async () => {
//       try {
//         await getAllOneBrktsForDiv(null as any);
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe("Invalid div id");
//       }
//     })
//   })

//   describe('getAllOneBrktsForBrkt()', () => {

//     it('should get all oneBrkts for bracket', async () => {
//       const oneBrkts = await getAllOneBrktsForBrkt(brktId);
//       expect(oneBrkts).toHaveLength(2);
//       if (!oneBrkts) return;
//       for (let i = 0; i < oneBrkts.length; i++) {
//         if (oneBrkts[i].id === oneBrktsToGet[0].id) {
//           expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[0].bindex);
//         } else if (oneBrkts[i].id === oneBrktsToGet[1].id) {
//           expect(oneBrkts[i].bindex).toEqual(oneBrktsToGet[1].bindex);
//         } else {
//           expect(true).toBeFalsy();
//         }
//       }
//     })
//     it('should return 0 oneBrkts for not found bracket', async () => {
//       const oneBrkts = await getAllOneBrktsForBrkt(notFoundBrktId);
//       expect(oneBrkts).toHaveLength(0);
//     })
//     it('should throw error if brkt id is invalid', async () => {
//       try {
//         await getAllOneBrktsForBrkt("test");
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe("Invalid brkt id");
//       }
//     })
//     it('should throw error if brkt id is a valid id, but not a brkt id', async () => {
//       try {
//         await getAllOneBrktsForBrkt(userId);
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe("Invalid brkt id");
//       }
//     })
//     it('should throw error if brkt id is null', async () => {
//       try {
//         await getAllOneBrktsForBrkt(null as any);
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe("Invalid brkt id");
//       }
//     })
//   })

//   describe('getOneBrkt()', () => { 

//     it('should get one oneBrkt', async () => {
//       const oneBrkt = await getOneBrkt(oneBrktsToGet[0].id);      
//       if (!oneBrkt) return;      
//       expect(oneBrkt.id).toEqual(oneBrktsToGet[0].id);
//       expect(oneBrkt.brkt_id).toEqual(oneBrktsToGet[0].brkt_id);
//       expect(oneBrkt.bindex).toEqual(oneBrktsToGet[0].bindex);      
//     })
//     it('should throw error if oneBrkts for not found oneBrkt', async () => { 
//       try {
//         await getOneBrkt(notFoundId);
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe("getOneBrkt failed: Request failed with status code 404");
//       }
//     })
//     it('should throw error if oneBrkt id is invalid', async () => { 
//       try {
//         await getOneBrkt("test");
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe("Invalid oneBrkt id");
//       }
//     })
//     it('should throw error if oneBrkt id is a valid id, but not a oneBrkt id', async () => { 
//       try {
//         await getOneBrkt(userId);
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe("Invalid oneBrkt id");
//       }
//     })
//     it('should throw error if oneBrkt id is null', async () => { 
//       try {
//         await getOneBrkt(null as any);
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe("Invalid oneBrkt id");
//       }
//     })
//   })

//   describe("postOneBrkt()", () => {
//     const oneBrktToPost = {
//       ...initOneBrkt,
//       id: 'obk_0123c6c5556e407291c4b5666b2dccd7',
//       brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
//       bindex: 99,
//     }

//     let createdOneBrkt = false;

//     const deletePostedOneBrkt = async () => {
//       const response = await axios.get(url);
//       const oneBrkts = response.data.oneBrkts;
//       const toDel = oneBrkts.find((o: oneBrktType) => o.id === 'obk_0123c6c5556e407291c4b5666b2dccd7');
//       if (toDel) {
//         try {
//           const delResponse = await axios({
//             method: "delete",
//             withCredentials: true,
//             url: oneBrktsUrl + toDel.id
//           });
//         } catch (err) {
//           if (err instanceof AxiosError) console.log(err.message);
//         }
//       }
//     }
//     beforeAll(async () => {
//       await deletePostedOneBrkt();
//     })
//     beforeEach(() => {
//       createdOneBrkt = false;
//     })
//     afterEach(async () => {
//       if (createdOneBrkt) {
//         await deletePostedOneBrkt();
//       }
//     })

//     it('should post one oneBrkt', async () => {
//       const postedOneBrkt = await postOneBrkt(oneBrktToPost);
//       expect(postedOneBrkt).not.toBeNull();
//       if (!postedOneBrkt) return;
//       createdOneBrkt = true;
//       expect(postedOneBrkt.id).toEqual(oneBrktToPost.id);
//       expect(postedOneBrkt.brkt_id).toEqual(oneBrktToPost.brkt_id);
//       expect(postedOneBrkt.bindex).toEqual(oneBrktToPost.bindex);
//     })
//     // see test\app\api\oneBrkts\validate_oneBrkts.test.tsx
//     // for full testing of sanitation and validation
//     it('should not post a oneBrkt with sanitized index (sanitized to undefined)', async () => {
//       try { 
//         const toSanitizse = cloneDeep(oneBrktToPost);
//         toSanitizse.bindex = Number.MAX_SAFE_INTEGER + 1;
//         await postOneBrkt(toSanitizse);
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe(
//           "postOneBrkt failed: Request failed with status code 422"
//         );
//       }      
//     })
//     it('should not post a oneBrkt if got invalid data', async () => {
//       try {
//         const invalidOneBrkt = cloneDeep(oneBrktToPost);
//         invalidOneBrkt.brkt_id = userId;
//         await postOneBrkt(invalidOneBrkt);
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe(
//           "postOneBrkt failed: Request failed with status code 422"
//         );
//       }
//     })
//     it('should throw error if oneBrkt is null', async () => { 
//       try {
//         await postOneBrkt(null as any);
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe("Invalid oneBrkt data");
//       }
//     })
//     it('should throw error if oneBrkt is not an object', async () => { 
//       try {
//         await postOneBrkt("test" as any);
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe("Invalid oneBrkt data");
//       }
//     })
//   });

//   describe("deleteOneBrkt()", () => {
//     // toDel is data from prisma/seeds.ts
//     const toDel = {
//       ...initOneBrkt,
//       id: "obk_bbae841f36244b5ab5c0ec5793820d85",
//       brkt_id: "brk_d047ea07dbc6453a8a705f4bb7599ed4",
//       bindex: 0,
//     }

//     const rePostOneBrkt = async (oneBrkt: oneBrktType) => {
//       try {
//         // if lane already in database, then don't re-post
//         const getResponse = await axios.get(oneBrktsUrl + oneBrkt.id);
//         const found = getResponse.data?.oneBrkt;
//         if (found) return;
//       } catch (err) {
//         if (err instanceof AxiosError) {
//           if (err.status !== 404) {
//             console.log(err.message);
//             return;
//           }
//         }
//       }

//       try {
//         // if not in database, then re-post
//         const oneBrktJSON = JSON.stringify(oneBrkt);
//         await axios.post(url, oneBrktJSON, { withCredentials: true });
//       } catch (err) {
//         if (err instanceof AxiosError) console.log(err.message);
//       }
//     };

//     let didDel = false;

//     beforeAll(async () => {
//       await rePostOneBrkt(toDel);
//     });

//     beforeEach(() => {
//       didDel = false;
//     });

//     afterEach(async () => {
//       if (!didDel) {
//         await rePostOneBrkt(toDel);
//       }
//     });

//     it("should delete a oneBrkt", async () => {
//       const deleted = await deleteOneBrkt(toDel.id);
//       didDel = true;
//       expect(deleted).toBe(1);
//     });
//     it("should retrun 0 when trying to delete a oneBrkt when ID is not found", async () => {
//       const deleted = await deleteOneBrkt(notFoundId);
//       didDel = true;
//       expect(deleted).toBe(0);
//     });
//     it("should throw error when trying to delete a oneBrkt when id is invalid", async () => {
//       try {
//         await deleteOneBrkt("test");
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe("Invalid oneBrkt id");
//       }
//     });
//     it("should throw error when trying to delete a oneBrkt when id is valid, but not a oneBrkt id", async () => {
//       try {
//         await deleteOneBrkt(userId);
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe("Invalid oneBrkt id");
//       }
//     });
//     it("should throw error when trying to delete a oneBrkt when id is null", async () => {
//       try {
//         await deleteOneBrkt(null as any);
//       } catch (err) {
//         expect(err).toBeInstanceOf(Error);
//         expect((err as Error).message).toBe("Invalid oneBrkt id");
//       }
//     });

//   })
// });
