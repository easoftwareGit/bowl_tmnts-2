import { publicApi, privateApi } from "@/lib/api/axios";
import { baseBrktEntriesApi } from "@/lib/api/apiPaths";
import { testBaseBrktEntriesApi } from "../../../testApi";
import type { brktDataFromPrismaType, brktEntryType } from "@/lib/types/types";
import { initBrktEntry } from "@/lib/db/initVals";
import {
  deleteBrktEntry,
  extractBrktEntries2,
  getAllBrktEntriesForTmnt,
  postBrktEntry,
  putBrktEntry,
} from "@/lib/db/brktEntries/dbBrktEntries";
import { maxDate, minDate } from "@/lib/validation/constants";
import { compareAsc } from "date-fns";
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

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseBrktEntriesApi
  ? testBaseBrktEntriesApi
  : baseBrktEntriesApi;

const oneBrktEntryUrl = url + "/brktEntry/"; 

const brktEntriesToGet: brktEntryType[] = [
  {
    ...initBrktEntry,
    id: "ben_bc4c581d7b1c4fc99dbdbd46f4f7210a",
    brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    num_brackets: 8,
    num_refunds: 2,
    fee: "40",
    time_stamp: 1739259269537,
  },
  {
    ...initBrktEntry,
    id: "ben_8f039ee00dfa445c9e3aee0ca9a6391b",
    brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    num_brackets: 8,
    num_refunds: 2,
    fee: "40",
    time_stamp: 1739259269537,
  },
  {
    ...initBrktEntry,
    id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
    brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
    player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
    num_brackets: 8,
    num_refunds: 0,
    fee: "40",
    time_stamp: 1739259269537,
  },
  {
    ...initBrktEntry,
    id: "ben_0a6938d0a5b94dd789bd3b8663d1ee53",
    brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",
    player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
    num_brackets: 8,
    num_refunds: 0,
    fee: "40",
    time_stamp: 1739259269537,
  },
];

const tmntIdForBrktEntries = "tmt_fd99387c33d9c78aba290286576ddce5";
const squadIdForBrktEntries = "sqd_7116ce5f80164830830a7157eb093396";
const divIdForBrktEntries = "div_f30aea2c534f4cfe87f4315531cef8ef";
const brktIdForBrktEntries = "brk_5109b54c2cc44ff9a3721de42c80c8c1";

const notFoundId = "ben_01234567890123456789012345678901";
const notFoundBrktId = "brk_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

const brkt1Id = "brk_5109b54c2cc44ff9a3721de42c80c8c1";
const brkt2Id = "brk_6ede2512c7d4409ca7b055505990a499";

type GetBrktEntriesResponse = {
  brktEntries?: brktEntryType[];
};

type GetOneBrktEntryResponse = {
  brktEntry?: brktEntryType;
};

describe("dbBrktEntries", () => {
  const rePostBrktEntry = async (brktEntry: brktEntryType) => {
    try {
      const getResponse = await publicApi.get<GetOneBrktEntryResponse>(
        oneBrktEntryUrl + brktEntry.id
      );
      if (getResponse.data?.brktEntry) return;
    } catch {
      // continue and re-post
    }

    try {
      await privateApi.post(url, JSON.stringify(brktEntry));
    } catch {
      // do nothing
    }
  };

  // describe("extractBrktEntries", () => {
  //   it("should correctly map raw brktEntries to extractBrktEntries", () => {
  //     const rawBrktEntry = [
  //       {
  //         id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
  //         brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
  //         player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
  //         num_brackets: 8,
  //         time_stamp: "2025-10-24T20:38:34.850Z",
  //         extraField: "ignore me",
  //         brkt: {
  //           fee: "5",
  //         },
  //         brkt_refunds: null,
  //       },
  //     ];

  //     const result = extractBrktEntries(rawBrktEntry);

  //     const expected: brktEntryType = {
  //       ...initBrktEntry,
  //       id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
  //       brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
  //       player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
  //       num_brackets: 8,
  //       fee: "40",
  //       num_refunds: 0,
  //       time_stamp: 1761338314850,
  //     };

  //     expect(result).toEqual([expected]);
  //   });

  //   it("should correctly map raw brktEntries with refunds to extractBrktEntries", () => {
  //     const rawBrktEntry = [
  //       {
  //         id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
  //         brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
  //         player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
  //         num_brackets: 8,
  //         time_stamp: "2025-10-24T20:38:34.850Z",
  //         extraField: "ignore me",
  //         brkt: {
  //           fee: "5",
  //         },
  //         brkt_refunds: {
  //           num_refunds: 2,
  //         },
  //       },
  //     ];

  //     const result = extractBrktEntries(rawBrktEntry);

  //     const expected: brktEntryType = {
  //       ...initBrktEntry,
  //       id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
  //       brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
  //       player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
  //       num_brackets: 8,
  //       fee: "40",
  //       num_refunds: 2,
  //       time_stamp: 1761338314850,
  //     };

  //     expect(result).toEqual([expected]);
  //   });

  //   it("should correctly map raw brktEntries with timestamp as text to extractBrktEntries", () => {
  //     const rawBrktEntry = [
  //       {
  //         id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
  //         brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
  //         player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
  //         num_brackets: 8,
  //         time_stamp: "2025-10-24T20:38:34.850Z",
  //         extraField: "ignore me",
  //         brkt: {
  //           fee: "5",
  //         },
  //         brkt_refunds: null,
  //       },
  //     ];

  //     const result = extractBrktEntries(rawBrktEntry);

  //     const expected: brktEntryType = {
  //       ...initBrktEntry,
  //       id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
  //       brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
  //       player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
  //       num_brackets: 8,
  //       fee: "40",
  //       num_refunds: 0,
  //       time_stamp: 1761338314850,
  //     };

  //     expect(result).toEqual([expected]);
  //   });

  //   it("should correctly map raw brktEntries with timestamp is not a string date to extractBrktEntries", () => {
  //     const rawBrktEntry = [
  //       {
  //         id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
  //         brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
  //         player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
  //         num_brackets: 8,
  //         time_stamp: "something else",
  //         extraField: "ignore me",
  //         brkt: {
  //           fee: "5",
  //         },
  //         brkt_refunds: null,
  //       },
  //     ];

  //     const result = extractBrktEntries(rawBrktEntry);

  //     const expected: brktEntryType = {
  //       ...initBrktEntry,
  //       id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
  //       brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
  //       player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
  //       num_brackets: 8,
  //       fee: "40",
  //       num_refunds: 0,
  //       time_stamp: 0,
  //     };

  //     expect(result).toEqual([expected]);
  //   });

  //   it("should process multiple brktEntries", () => {
  //     const rawBrktEntry = [
  //       {
  //         ...initBrktEntry,
  //         id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
  //         brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
  //         player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
  //         num_brackets: 8,
  //         time_stamp: "2025-10-24T20:38:34.850Z",
  //         brkt: {
  //           fee: "5",
  //         },
  //         brkt_refunds: null,
  //       },
  //       {
  //         ...initBrktEntry,
  //         id: "ben_2291bb31e72b4dc6b6fe9e76d135493e",
  //         brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
  //         player_id: "ply_ce57bef21fc64d199c2f6de4408bd136",
  //         num_brackets: 10,
  //         time_stamp: "2025-10-24T20:38:34.990Z",
  //         brkt: {
  //           fee: "5",
  //         },
  //         brkt_refunds: {
  //           num_refunds: 2,
  //         },
  //       },
  //     ];

  //     const result = extractBrktEntries(rawBrktEntry);

  //     expect(result).toHaveLength(2);
  //     expect(result[0].num_brackets).toBe(8);
  //     expect(result[0].fee).toBe("40");
  //     expect(result[0].num_refunds).toBe(0);
  //     expect(result[1].num_brackets).toBe(10);
  //     expect(result[1].fee).toBe("50");
  //     expect(result[1].num_refunds).toBe(2);
  //   });

  //   it("should return an empty array when given an empty array", () => {
  //     const result = extractBrktEntries([]);
  //     expect(result).toEqual([]);
  //   });

  //   it("should return an empty array when given null", () => {
  //     const result = extractBrktEntries(null);
  //     expect(result).toEqual([]);
  //   });

  //   it("should return an empty array when given a non array", () => {
  //     const result = extractBrktEntries("not an array");
  //     expect(result).toEqual([]);
  //   });
  // });

  describe("extractBrktEntries2()", () => {
    
    it("should correctly map raw brktEntries to extractBrktEntries2", () => {

      const rawBrktEntries2: brktDataFromPrismaType = {
        id: "brk_1234567890abcdef1234567890abcdef",
        div_id: "div_1234567890abcdef1234567890abcdef",
        squad_id: "squ_1234567890abcdef1234567890abcdef",
        fee: "5",
        start: 1,
        games: 3,
        players: 8,
        first: "25",
        second: "10",
        admin: "5",
        sort_order: 1,
        createdAt: "2025-10-24T20:38:34.850Z",
        updatedAt: "2025-10-24T20:38:34.850Z",
        brkt_entries: [
          {
            id: "ben_1234567890abcdef1234567890abcdef",
            brkt_id: "brk_1234567890abcdef1234567890abcdef",
            player_id: "ply_1234567890abcdef1234567890abcdef",
            num_brackets: 10,
            time_stamp: "2026-03-19T01:45:18.741Z",
            createdAt: "2026-03-19T01:45:18.741Z",
            updatedAt: "2026-03-19T01:45:18.741Z",
            brkt_refunds: {
              brkt_entry_id: "ben_1234567890abcdef1234567890abcdef",
              num_refunds: 2,
              createdAt: "2026-03-19T01:45:18.741Z",
              updatedAt: "2026-03-19T01:45:18.741Z",
            },
          },
          {
            id: "ben_abcdef1234567890abcdef1234567890",
            brkt_id: "brk_1234567890abcdef1234567890abcdef",
            player_id: "ply_abcdef1234567890abcdef1234567890",
            num_brackets: 2,
            time_stamp: "2026-03-19T01:45:18.741Z",
            createdAt: "2026-03-19T01:45:18.741Z",
            updatedAt: "2026-03-19T01:45:18.741Z",
            brkt_refunds: null,
          }        
        ],
        one_brkts: [],
      }

      const expectedBrktEntries: brktEntryType[] = [
        {
          id: "ben_1234567890abcdef1234567890abcdef",
          brkt_id: "brk_1234567890abcdef1234567890abcdef",
          player_id: "ply_1234567890abcdef1234567890abcdef",
          num_brackets: 10,
          time_stamp: 1773884718741,
          fee: "50",
          num_refunds: 2,
        },
        {
          id: "ben_abcdef1234567890abcdef1234567890",
          brkt_id: "brk_1234567890abcdef1234567890abcdef",
          player_id: "ply_abcdef1234567890abcdef1234567890",
          num_brackets: 2,
          time_stamp: 1773884718741,
          fee: "10",
          num_refunds: 0,
        }
      ]

      const result = extractBrktEntries2(rawBrktEntries2);
      expect(result).toEqual(expectedBrktEntries);
    });

    it("should correctly map raw brktEntries with timestamp is not a string date to extractBrktEntries", () => { 

      const rawBrktEntries2: brktDataFromPrismaType = {
        id: "brk_1234567890abcdef1234567890abcdef",
        div_id: "div_1234567890abcdef1234567890abcdef",
        squad_id: "squ_1234567890abcdef1234567890abcdef",
        fee: "5",
        start: 1,
        games: 3,
        players: 8,
        first: "25",
        second: "10",
        admin: "5",
        sort_order: 1,
        createdAt: "2025-10-24T20:38:34.850Z",
        updatedAt: "2025-10-24T20:38:34.850Z",
        brkt_entries: [
          {
            id: "ben_1234567890abcdef1234567890abcdef",
            brkt_id: "brk_1234567890abcdef1234567890abcdef",
            player_id: "ply_1234567890abcdef1234567890abcdef",
            num_brackets: 10,
            time_stamp: "Time stamp",
            createdAt: "2026-03-19T01:45:18.741Z",
            updatedAt: "2026-03-19T01:45:18.741Z",
            brkt_refunds: null,
          },
        ],
        one_brkts: [],
      }      

      const expectedBrktEntries: brktEntryType[] = [
        {
          id: "ben_1234567890abcdef1234567890abcdef",
          brkt_id: "brk_1234567890abcdef1234567890abcdef",
          player_id: "ply_1234567890abcdef1234567890abcdef",
          num_brackets: 10,
          time_stamp: 0,
          fee: "50",
          num_refunds: 0,
        },
      ]

      const result = extractBrktEntries2(rawBrktEntries2);
      expect(result).toEqual(expectedBrktEntries);
    })

    it("should return an empty array when passed null", () => {
      const result = extractBrktEntries2(null);
      expect(result).toEqual([]);
    });

    it("should return an empty array when passed non brktDataFromPrismaType", () => {

      const rawBrktEntries2 = {
        id: "brk_1234567890abcdef1234567890abcdef",
        div_id: "div_1234567890abcdef1234567890abcdef",
        squad_id: "squ_1234567890abcdef1234567890abcdef",
        fee: "5",
        start: 1,
        games: 3,
        // players: 8,   NO PLAYERS property
        first: "25",
        second: "10",
        admin: "5",
        sort_order: 1,
        createdAt: "2025-10-24T20:38:34.850Z",
        updatedAt: "2025-10-24T20:38:34.850Z",
        brkt_entries: [
          {
            id: "ben_1234567890abcdef1234567890abcdef",
            brkt_id: "brk_1234567890abcdef1234567890abcdef",
            player_id: "ply_1234567890abcdef1234567890abcdef",
            num_brackets: 10,
            time_stamp: "Time stamp",
            createdAt: "2026-03-19T01:45:18.741Z",
            updatedAt: "2026-03-19T01:45:18.741Z",
            brkt_refunds: null,
          },
        ],
        one_brkts: [],
      }      

      let result = extractBrktEntries2("not an array");
      expect(result).toEqual([]);      

      result = extractBrktEntries2(rawBrktEntries2);
      expect(result).toEqual([]);
    });
  });

  describe("getAllBrktEntriesForTmnt()", () => {
    it("should get all brktEntries for tournament", async () => {
      const brktEntries = await getAllBrktEntriesForTmnt(tmntIdForBrktEntries);
      expect(brktEntries).toHaveLength(brktEntriesToGet.length);

      for (let i = 0; i < brktEntries.length; i++) {
        expect(
          brktEntries[i].brkt_id === brkt1Id ||
            brktEntries[i].brkt_id === brkt2Id
        ).toBeTruthy();
        expect(brktEntries[i].num_brackets).toEqual(
          brktEntriesToGet[i].num_brackets
        );
        expect(brktEntries[i].fee).toEqual(brktEntriesToGet[i].fee);
        expect(compareAsc(brktEntries[i].time_stamp, minDate)).toBe(1);
        expect(compareAsc(brktEntries[i].time_stamp, maxDate)).toBe(-1);
      }
    });

    it("should return 0 brktEntries for not found tournament", async () => {
      const brktEntries = await getAllBrktEntriesForTmnt(notFoundTmntId);
      expect(brktEntries).toHaveLength(0);
    });

    it("should throw error if tmnt id is invalid", async () => {
      await expect(getAllBrktEntriesForTmnt("test")).rejects.toThrow(
        "Invalid tmnt id"
      );
    });

    it("should throw if tmnt id is a valid id, but not a tmnt id", async () => {
      await expect(getAllBrktEntriesForTmnt(userId)).rejects.toThrow(
        "Invalid tmnt id"
      );
    });

    it("should throw if tmnt id is null", async () => {
      await expect(getAllBrktEntriesForTmnt(null as any)).rejects.toThrow(
        "Invalid tmnt id"
      );
    });
  });

  // describe("getAllBrktEntriesForSquad()", () => {
  //   it("should get all brktEntries for squad", async () => {
  //     const brktEntries = await getAllBrktEntriesForSquad(
  //       squadIdForBrktEntries
  //     );
  //     expect(brktEntries).toHaveLength(brktEntriesToGet.length);

  //     if (!brktEntries) {
  //       expect(true).toBeFalsy();
  //       return;
  //     }
  //     for (let i = 0; i < brktEntries.length; i++) {
  //       expect(
  //         brktEntries[i].brkt_id === brkt1Id ||
  //           brktEntries[i].brkt_id === brkt2Id
  //       ).toBeTruthy();
  //       expect(brktEntries[i].num_brackets).toEqual(
  //         brktEntriesToGet[i].num_brackets
  //       );
  //       expect(brktEntries[i].fee).toEqual(brktEntriesToGet[i].fee);
  //       expect(compareAsc(brktEntries[i].time_stamp, minDate)).toBe(1);
  //       expect(compareAsc(brktEntries[i].time_stamp, maxDate)).toBe(-1);
  //     }
  //   });

  //   it("should return 0 brktEntries for not found squad", async () => {
  //     const brktEntries = await getAllBrktEntriesForSquad(notFoundSquadId);
  //     expect(brktEntries).toHaveLength(0);
  //   });

  //   it("should throw if squad id is invalid", async () => {
  //     await expect(getAllBrktEntriesForSquad("test")).rejects.toThrow(
  //       "Invalid squad id"
  //     );
  //   });

  //   it("should throw if squad id is a valid id, but not a squad id", async () => {
  //     await expect(getAllBrktEntriesForSquad(userId)).rejects.toThrow(
  //       "Invalid squad id"
  //     );
  //   });

  //   it("should throw if squad id is null", async () => {
  //     await expect(getAllBrktEntriesForSquad(null as any)).rejects.toThrow(
  //       "Invalid squad id"
  //     );
  //   });
  // });

  // describe("getAllBrktEntriesForDiv()", () => {
  //   it("should get all brktEntries for div", async () => {
  //     const brktEntries = await getAllBrktEntriesForDiv(divIdForBrktEntries);
  //     expect(brktEntries).toHaveLength(brktEntriesToGet.length);

  //     if (!brktEntries) {
  //       expect(true).toBeFalsy();
  //       return;
  //     }
  //     for (let i = 0; i < brktEntries.length; i++) {
  //       expect(
  //         brktEntries[i].brkt_id === brkt1Id ||
  //           brktEntries[i].brkt_id === brkt2Id
  //       ).toBeTruthy();
  //       expect(brktEntries[i].num_brackets).toEqual(
  //         brktEntriesToGet[i].num_brackets
  //       );
  //       expect(brktEntries[i].fee).toEqual(brktEntriesToGet[i].fee);
  //       expect(compareAsc(brktEntries[i].time_stamp, minDate)).toBe(1);
  //       expect(compareAsc(brktEntries[i].time_stamp, maxDate)).toBe(-1);
  //     }
  //   });

  //   it("should return 0 brktEntries for not found div", async () => {
  //     const brktEntries = await getAllBrktEntriesForDiv(notFoundDivId);
  //     expect(brktEntries).toHaveLength(0);
  //   });

  //   it("should throw if div id is invalid", async () => {
  //     await expect(getAllBrktEntriesForDiv("test")).rejects.toThrow(
  //       "Invalid div id"
  //     );
  //   });

  //   it("should throw if div id is a valid id, but not a div id", async () => {
  //     await expect(getAllBrktEntriesForDiv(userId)).rejects.toThrow(
  //       "Invalid div id"
  //     );
  //   });

  //   it("should throw if div id is null", async () => {
  //     await expect(getAllBrktEntriesForDiv(null as any)).rejects.toThrow(
  //       "Invalid div id"
  //     );
  //   });
  // });

  // describe("getAllBrktEntriesForBrkt()", () => {
  //   it("should get all brktEntries for brkt", async () => {
  //     const brktEntries = await getAllBrktEntriesForBrkt(brktIdForBrktEntries);
  //     expect(brktEntries).toHaveLength(2);

  //     if (!brktEntries) {              
  //       expect(true).toBeFalsy();
  //       return;
  //     }
  //     for (let i = 0; i < brktEntries.length; i++) {
  //       expect(
  //         brktEntries[i].brkt_id === brkt1Id ||
  //           brktEntries[i].brkt_id === brkt2Id
  //       ).toBeTruthy();
  //       expect(compareAsc(brktEntries[i].time_stamp, minDate)).toBe(1);
  //       expect(compareAsc(brktEntries[i].time_stamp, maxDate)).toBe(-1);
  //     }
  //   });

  //   it("should return 0 brktEntries for not found brkt", async () => {
  //     const brktEntries = await getAllBrktEntriesForBrkt(notFoundBrktId);
  //     expect(brktEntries).toHaveLength(0);
  //   });

  //   it("should throw if brkt id is invalid", async () => {
  //     await expect(getAllBrktEntriesForBrkt("test")).rejects.toThrow(
  //       "Invalid brkt id"
  //     );
  //   });

  //   it("should throw if brkt id is a valid id, but not a brkt id", async () => {
  //     await expect(getAllBrktEntriesForBrkt(userId)).rejects.toThrow(
  //       "Invalid brkt id"
  //     );
  //   });

  //   it("should throw if brkt id is null", async () => {
  //     await expect(getAllBrktEntriesForBrkt(null as any)).rejects.toThrow(
  //       "Invalid brkt id"
  //     );
  //   });
  // });

  describe("postBrktEntry()", () => {
    const brktEntryToPost: brktEntryType = {
      ...initBrktEntry,
      id: "ben_0123c6c5556e407291c4b5666b2dccd7",
      brkt_id: "brk_aa3da3a411b346879307831b6fdadd5f",
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
      num_brackets: 7,
      num_refunds: 1,
      fee: "45",
      time_stamp: 1739259269537,
    };

    let createdBrktEntry = false;

    const deletePostedBrktEntry = async () => {
      const response = await publicApi.get<GetBrktEntriesResponse>(url);
      const brktEntries = response.data.brktEntries ?? [];
      const toDel = brktEntries.find(
        (b) => b.id === "ben_0123c6c5556e407291c4b5666b2dccd7"
      );

      if (toDel) {
        try {
          await privateApi.delete(oneBrktEntryUrl + toDel.id);
        } catch {
          // do nothing
        }
      }
    };

    beforeAll(async () => {
      await deletePostedBrktEntry();
    });

    beforeEach(() => {
      createdBrktEntry = false;
    });

    afterEach(async () => {
      if (createdBrktEntry) {
        await deletePostedBrktEntry();
      }
    });

    it("should post one brktEntry", async () => {
      const postedBrktEntry = await postBrktEntry(brktEntryToPost);
      createdBrktEntry = true;

      expect(postedBrktEntry.id).toEqual(brktEntryToPost.id);
      expect(postedBrktEntry.brkt_id).toEqual(brktEntryToPost.brkt_id);
      expect(postedBrktEntry.player_id).toEqual(brktEntryToPost.player_id);
      expect(postedBrktEntry.num_brackets).toEqual(brktEntryToPost.num_brackets);
      expect(postedBrktEntry.num_refunds).toEqual(brktEntryToPost.num_refunds);
      expect(compareAsc(postedBrktEntry.time_stamp, minDate)).toBe(1);
      expect(compareAsc(postedBrktEntry.time_stamp, maxDate)).toBe(-1);
    });

    it("should post one brktEntry with no refunds", async () => {
      const noRefundBrktEntry = cloneDeep(brktEntryToPost);
      noRefundBrktEntry.num_refunds = 0;

      const postedBrktEntry = await postBrktEntry(noRefundBrktEntry);
      createdBrktEntry = true;

      expect(postedBrktEntry.id).toEqual(noRefundBrktEntry.id);
      expect(postedBrktEntry.brkt_id).toEqual(noRefundBrktEntry.brkt_id);
      expect(postedBrktEntry.player_id).toEqual(noRefundBrktEntry.player_id);
      expect(postedBrktEntry.num_brackets).toEqual(
        noRefundBrktEntry.num_brackets
      );
      expect(postedBrktEntry.num_refunds).toBe(0);
      expect(compareAsc(postedBrktEntry.time_stamp, minDate)).toBe(1);
      expect(compareAsc(postedBrktEntry.time_stamp, maxDate)).toBe(-1);
    });

    it("should not post a brktEntry with sanitized num_brackets (sanitized to 0)", async () => {
      const toSanitize = {
        ...brktEntryToPost,
        num_brackets: 1234567890,
      };

      await expect(postBrktEntry(toSanitize)).rejects.toThrow(
        "postBrktEntry failed: Request failed with status code 422"
      );
    });

    it("should not post a brktEntry if got invalid data", async () => {
      const invalidBrktEntry = {
        ...brktEntryToPost,
        fee: "-1",
      };

      await expect(postBrktEntry(invalidBrktEntry)).rejects.toThrow(
        "postBrktEntry failed: Request failed with status code 422"
      );
    });
  });

  describe("putBrktEntry()", () => {
    const brktEntryToPut: brktEntryType = {
      ...initBrktEntry,
      id: "ben_bc4c581d7b1c4fc99dbdbd46f4f7210a",
      brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
      player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
      num_brackets: 7,
      num_refunds: 2,
      fee: "45",
      time_stamp: new Date("2023-01-01").getTime(),
    };

    const putUrl = oneBrktEntryUrl + brktEntryToPut.id;

    const resetBrktEntry: brktEntryType = {
      ...initBrktEntry,
      id: "ben_bc4c581d7b1c4fc99dbdbd46f4f7210a",
      brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
      player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
      num_brackets: 8,
      num_refunds: 2,
      fee: "40",
      time_stamp: 1739259269537,
    };

    const doReset = async () => {
      try {
        await privateApi.put(putUrl, JSON.stringify(resetBrktEntry));
      } catch {
        // do nothing
      }
    };

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

    it("should put a brktEntry - no change to num_refunds", async () => {
      const puttedBrktEntry = await putBrktEntry(brktEntryToPut);
      didPut = true;

      expect(puttedBrktEntry.brkt_id).toBe(brktEntryToPut.brkt_id);
      expect(puttedBrktEntry.player_id).toBe(brktEntryToPut.player_id);
      expect(puttedBrktEntry.num_brackets).toBe(brktEntryToPut.num_brackets);
      expect(puttedBrktEntry.num_refunds).toBe(brktEntryToPut.num_refunds);
      expect(compareAsc(puttedBrktEntry.time_stamp, minDate)).toBe(1);
      expect(compareAsc(puttedBrktEntry.time_stamp, maxDate)).toBe(-1);
    });

    it("should put a brktEntry - change num_refunds to 1", async () => {
      const tempBrktEntry = cloneDeep(brktEntryToPut);
      tempBrktEntry.num_refunds = 1;

      const puttedBrktEntry = await putBrktEntry(tempBrktEntry);
      didPut = true;

      expect(puttedBrktEntry.brkt_id).toBe(tempBrktEntry.brkt_id);
      expect(puttedBrktEntry.player_id).toBe(tempBrktEntry.player_id);
      expect(puttedBrktEntry.num_brackets).toBe(tempBrktEntry.num_brackets);
      expect(puttedBrktEntry.num_refunds).toBe(tempBrktEntry.num_refunds);
      expect(compareAsc(puttedBrktEntry.time_stamp, minDate)).toBe(1);
      expect(compareAsc(puttedBrktEntry.time_stamp, maxDate)).toBe(-1);
    });

    it("should put a brktEntry - change num_refunds to 0", async () => {
      const tempBrktEntry = cloneDeep(brktEntryToPut);
      tempBrktEntry.num_refunds = 0;

      const puttedBrktEntry = await putBrktEntry(tempBrktEntry);
      didPut = true;

      expect(puttedBrktEntry.brkt_id).toBe(tempBrktEntry.brkt_id);
      expect(puttedBrktEntry.player_id).toBe(tempBrktEntry.player_id);
      expect(puttedBrktEntry.num_brackets).toBe(tempBrktEntry.num_brackets);
      expect(puttedBrktEntry.num_refunds).toBe(0);
      expect(compareAsc(puttedBrktEntry.time_stamp, minDate)).toBe(1);
      expect(compareAsc(puttedBrktEntry.time_stamp, maxDate)).toBe(-1);
    });

    it("should throw error when brktEntry with sanitization, num_brackets value sanitized to 0", async () => {
      const toSanitize = cloneDeep(brktEntryToPut);
      toSanitize.num_brackets = 1234567890;

      await expect(putBrktEntry(toSanitize)).rejects.toThrow(
        "putBrktEntry failed: Request failed with status code 422"
      );
    });

    it('should throw error when brktEntry with sanitization, fee value sanitized to ""', async () => {
      const toSanitize = cloneDeep(brktEntryToPut);
      toSanitize.fee = "  84  ";

      await expect(putBrktEntry(toSanitize)).rejects.toThrow(
        "putBrktEntry failed: Request failed with status code 422"
      );
    });

    it("should throw error when brktEntry with invalid data", async () => {
      const invalidBrktEntry = cloneDeep(brktEntryToPut);
      invalidBrktEntry.fee = "-1";

      await expect(putBrktEntry(invalidBrktEntry)).rejects.toThrow(
        "putBrktEntry failed: Request failed with status code 422"
      );
    });
  });

  describe("deleteBrktEntry()", () => {
    const toDel: brktEntryType = {
      ...initBrktEntry,
      id: "ben_093a0902e01e46dbbe9f111acefc17da",
      brkt_id: "brk_12344698f47e4d64935547923e2bdbfb",
      player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
      num_brackets: 8,
      num_refunds: 2,
      fee: "40",
      time_stamp: 1739259269537,
    };

    let didDel = false;

    beforeAll(async () => {
      await rePostBrktEntry(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (didDel) {
        await rePostBrktEntry(toDel);
      }
    });

    it("should delete a brktEntry", async () => {
      const deleted = await deleteBrktEntry(toDel.id);
      expect(deleted).toBe(1);
      didDel = true;
    });

    it("should return 0 and not delete a brktEntry when id is not found", async () => {
      const deleted = await deleteBrktEntry(notFoundId);
      expect(deleted).toBe(0);
    });

    it("should throw error and not delete a brktEntry when id is invalid", async () => {
      await expect(deleteBrktEntry("test")).rejects.toThrow(
        "Invalid brktEntry id"
      );
    });

    it("should throw error and not delete a brktEntry when id is valid, but not a brktEntry id", async () => {
      await expect(deleteBrktEntry(userId)).rejects.toThrow(
        "Invalid brktEntry id"
      );
    });

    it("should throw error and not delete a brktEntry when id is null", async () => {
      await expect(deleteBrktEntry(null as any)).rejects.toThrow(
        "Invalid brktEntry id"
      );
    });
  });
});