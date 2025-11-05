import axios, { AxiosError } from "axios";
import { baseBrktEntriesApi } from "@/lib/db/apiPaths";
import { testBaseBrktEntriesApi } from "../../../testApi";
import { brktEntryType, brktRefundType } from "@/lib/types/types";
import { initBrktEntry, initBrktRefund } from "@/lib/db/initVals";
import { mockBrktEntriesToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import {
  deleteAllBrktEntriesForBrkt,
  deleteAllBrktEntriesForDiv,
  deleteAllBrktEntriesForSquad,
  deleteAllBrktEntriesForTmnt,
  deleteBrktEntry,
  getAllBrktEntriesForBrkt,
  getAllBrktEntriesForDiv,
  getAllBrktEntriesForSquad,
  getAllBrktEntriesForTmnt,
  postBrktEntry,
  postManyBrktEntries,
  putBrktEntry,
  extractBrktEntries,
  extractBrktRefunds,
} from "@/lib/db/brktEntries/dbBrktEntries";
import { replaceManyBrktEntries } from "@/lib/db/brktEntries/dbBrktEntriesReplaceMany";
import { cloneDeep } from "lodash";
import { maxDate, minDate } from "@/lib/validation";
import { compareAsc } from "date-fns";

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

const url = testBaseBrktEntriesApi.startsWith("undefined")
  ? baseBrktEntriesApi
  : testBaseBrktEntriesApi;
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
    num_refunds: undefined as any,
    fee: "40",
    time_stamp: 1739259269537,
  },
  {
    ...initBrktEntry,
    id: "ben_0a6938d0a5b94dd789bd3b8663d1ee53",
    brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",
    player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
    num_brackets: 8,
    num_refunds: undefined as any,
    fee: "40",
    time_stamp: 1739259269537,
  },
];

const tmntIdForBrktEntries = "tmt_fd99387c33d9c78aba290286576ddce5";
const squadIdForBrktEntries = "sqd_7116ce5f80164830830a7157eb093396";
const divIdForBrktEntries = "div_f30aea2c534f4cfe87f4315531cef8ef";
const brktIdForBrktEntries = "brk_5109b54c2cc44ff9a3721de42c80c8c1";

const tmntIdFormMockData = "tmt_56d916ece6b50e6293300248c6792316";
const divIdForMockData = "div_1f42042f9ef24029a0a2d48cc276a087";
const squadIdForMockData = "sqd_1a6c885ee19a49489960389193e8f819";
const brktIdForMockData = "brk_aa3da3a411b346879307831b6fdadd5f";

const notFoundId = "ben_01234567890123456789012345678901";
const notFoundBrktId = "brk_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

const brkt1Id = "brk_5109b54c2cc44ff9a3721de42c80c8c1";
const brkt2Id = "brk_6ede2512c7d4409ca7b055505990a499";

describe("dbBrktEntries", () => {
  const rePostBrktEntry = async (brktEntry: brktEntryType) => {
    try {
      // if brktEntry already in database, then don't re-post
      const getResponse = await axios.get(oneBrktEntryUrl + brktEntry.id);
      const found = getResponse.data.brktEntry;
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
      const brktEntryJSON = JSON.stringify(brktEntry);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: brktEntryJSON,
      });
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  const rePostToDel = async () => {
    const response = await axios.get(url);
    const brktEntries = response.data.brktEntries;
    const foundToDel = brktEntries.find(
      (b: brktEntryType) => b.id === mockBrktEntriesToPost[1].id
    );
    if (!foundToDel) {
      try {
        await postManyBrktEntries(mockBrktEntriesToPost);
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }
  };

  describe("extractBrktEntries", () => {
    it("should return an empty array when given an empty array", () => {
      const result = extractBrktEntries([]);
      expect(result).toEqual([]);
    });
    it("should correctly map raw brktEntries to extractBrktEntries", () => {
      const rawBrktEntry = [
        {
          id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          brkt_refunds: null,
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          num_brackets: 8,
          fee: "40",
          time_stamp: 1739259269537,
          extraField: "ignore me", // should be ignored
        },
      ];

      const result = extractBrktEntries(rawBrktEntry);

      const expected: brktEntryType = {
        ...initBrktEntry,
        id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
        brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
        player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
        num_brackets: 8,
        fee: "40",
        num_refunds: undefined as any,
        time_stamp: 1739259269537,
      };

      expect(result).toEqual([expected]);
    });
    it("should correctly map raw brktEntries with refunds to extractBrktEntries", () => {
      const rawBrktEntry = [
        {
          id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          brkt_refunds: {
            brkt_entry_id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
            num_refunds: 4,
          },
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          num_brackets: 8,
          fee: "40",
          time_stamp: 1739259269537,          
          extraField: "ignore me", // should be ignored
        },
      ];

      const result = extractBrktEntries(rawBrktEntry);

      const expected: brktEntryType = {
        ...initBrktEntry,
        id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
        brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
        player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
        num_brackets: 8,
        fee: "40",
        num_refunds: 4,
        time_stamp: 1739259269537,
      };

      expect(result).toEqual([expected]);
    });
    it("should correctly map raw brktEntries with timestamp as text to extractBrktEntries", () => {
      const rawBrktEntry = [
        {
          id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          brkt_refunds: null,
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          num_brackets: 8,
          fee: "40",
          time_stamp: "2025-10-24T20:38:34.850Z",
          extraField: "ignore me", // should be ignored
        },
      ];

      const result = extractBrktEntries(rawBrktEntry);

      const expected: brktEntryType = {
        ...initBrktEntry,
        id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
        brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
        player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
        num_brackets: 8,
        fee: "40",
        num_refunds: undefined as any,
        time_stamp: 1761338314850,
      };

      expect(result).toEqual([expected]);
    });
    it("should correctly map raw brktEntries with timestamp is not a string date to extractBrktEntries", () => {
      const rawBrktEntry = [
        {
          id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          brkt_refunds: null,
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          num_brackets: 8,
          fee: "40",
          time_stamp: "Somthing else",
          extraField: "ignore me", // should be ignored
        },
      ];

      const result = extractBrktEntries(rawBrktEntry);

      const expected: brktEntryType = {
        ...initBrktEntry,
        id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
        brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
        player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
        num_brackets: 8,
        fee: "40",
        num_refunds: undefined as any,
        time_stamp: undefined as any,
      };

      expect(result).toEqual([expected]);
    });
    it("should process multiple brktEntries", () => {
      const rawBrktEntry = [
        {
          ...initBrktEntry,
          id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          brkt_refunds: null,
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          num_brackets: 8,
          fee: "40",
          time_stamp: 1739259269537,
        },
        {
          ...initBrktEntry,
          id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          brkt_refunds: {
            brkt_entry_id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
            num_refunds: 2,
          },
          player_id: "ply_ce57bef21fc64d199c2f6de4408bd136",
          num_brackets: 10,
          fee: "50",
          time_stamp: 1739259269538,
        },
      ];

      const result = extractBrktEntries(rawBrktEntry);

      expect(result).toHaveLength(2);
      expect(result[0].num_brackets).toBe(8);
      expect(result[0].fee).toBe('40');
      expect(result[0].num_refunds).toBeUndefined();
      expect(result[1].num_brackets).toBe(10);
      expect(result[1].fee).toBe('50');
      expect(result[1].num_refunds).toBe(2);
    });
    it('should return an empty array when given null', () => {
      const result = extractBrktEntries(null);
      expect(result).toEqual([]);
    });
    it('should return an empty array when given a non array', () => {
      const result = extractBrktEntries('not an array');
      expect(result).toEqual([]);
    })
  });

  describe("extractBrktRefunds", () => { 

    it("should return an empty array when given an empty array", () => {
      const result = extractBrktRefunds([]);
      expect(result).toEqual([]);
    });
    it("should correctly map raw brktRefunds to extractbrktRefunds", () => {
      const rawBrktEntry = [
        {
          id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          brkt_refunds: {
            brkt_entry_id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
            num_refunds: 2,
          },
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          num_brackets: 8,          
          fee: "40",
          time_stamp: 1739259269537,
          extraField: "ignore me", // should be ignored
        },
      ];

      const result = extractBrktRefunds(rawBrktEntry);

      const expected: brktRefundType = {
        ...initBrktRefund,
        brkt_entry_id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
        num_refunds: 2,        
      };

      expect(result).toEqual([expected]);
    });
    it("should process multiple brktEntries with refunds", () => {
      const rawBrktEntry = [
        {
          ...initBrktEntry,
          id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          brkt_refunds: {
            brkt_entry_id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
            num_refunds: 2,
          },          
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          num_brackets: 8,          
          fee: "40",
          time_stamp: 1739259269537,
        },
        {
          ...initBrktEntry,
          id: "ben_2391bb31e72b4dc6b6fe9e76d135493d",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          brkt_refunds: {
            brkt_entry_id: "ben_2391bb31e72b4dc6b6fe9e76d135493d",
            num_refunds: 4,
          },          
          player_id: "ply_ce57bef21fc64d199c2f6de4408bd136",
          num_brackets: 10,          
          fee: "50",
          time_stamp: 1739259269538,
        },
      ];

      const result = extractBrktRefunds(rawBrktEntry);

      expect(result).toHaveLength(2);      
      expect(result[0].brkt_entry_id).toBe("ben_2291bb31e72b4dc6b6fe9e76d135493d");
      expect(result[0].num_refunds).toBe(2);
      expect(result[1].brkt_entry_id).toBe("ben_2391bb31e72b4dc6b6fe9e76d135493d");
      expect(result[1].num_refunds).toBe(4);
    });
    it("should process multiple brktEntries when not all have refunds", () => {
      const rawBrktEntry = [
        {
          ...initBrktEntry,
          id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          brkt_refunds: {
            brkt_entry_id: "ben_2291bb31e72b4dc6b6fe9e76d135493d",
            num_refunds: 2,
          },
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          num_brackets: 8,          
          fee: "40",
          time_stamp: 1739259269537,
        },
        {
          ...initBrktEntry,
          id: "ben_2391bb31e72b4dc6b6fe9e76d135493d",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          brkt_refunds: null,
          player_id: "ply_ce57bef21fc64d199c2f6de4408bd137",
          num_brackets: 6,          
          fee: "50",
          time_stamp: 1739259269538,
        },
        {
          ...initBrktEntry,
          id: "ben_2491bb31e72b4dc6b6fe9e76d135493d",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          brkt_refunds: {
            brkt_entry_id: "ben_2491bb31e72b4dc6b6fe9e76d135493d",
            num_refunds: 4,
          },          
          player_id: "ply_be57bef21fc64d199c2f6de4408bd138",
          num_brackets: 10,          
          fee: "40",
          time_stamp: 1739259269539,
        },
        {
          ...initBrktEntry,
          id: "ben_2591bb31e72b4dc6b6fe9e76d135493d",
          brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
          brkt_refunds: null,
          player_id: "ply_ce57bef21fc64d199c2f6de4408bd139",
          num_brackets: 6,          
          fee: "50",
          time_stamp: 1739259269540,
        },
      ];

      const result = extractBrktRefunds(rawBrktEntry);

      expect(result).toHaveLength(2);    
      expect(result[0].brkt_entry_id).toBe("ben_2291bb31e72b4dc6b6fe9e76d135493d");
      expect(result[0].num_refunds).toBe(2);      
      expect(result[1].brkt_entry_id).toBe("ben_2491bb31e72b4dc6b6fe9e76d135493d");
      expect(result[1].num_refunds).toBe(4);
    });
    it('should return an empty array when given null', () => {
      const result = extractBrktEntries(null);
      expect(result).toEqual([]);
    });
    it('should return an empty array when given a non array', () => {
      const result = extractBrktEntries('not an array');
      expect(result).toEqual([]);
    })
  })

  describe("getAllBrktEntriesForTmnt()", () => {
    it("should get all brktEntries for tournament", async () => {
      const brktEntries = await getAllBrktEntriesForTmnt(tmntIdForBrktEntries);
      expect(brktEntries).toHaveLength(brktEntriesToGet.length);
      if (!brktEntries) return;
      for (let i = 0; i < brktEntries.length; i++) {
        if (brktEntries[i].id === brktEntriesToGet[0].id) {
          expect(brktEntries[i].player_id).toEqual(
            brktEntriesToGet[0].player_id
          );
          expect(brktEntries[i].num_refunds).toEqual(
            brktEntriesToGet[0].num_refunds
          );
        } else if (brktEntries[i].id === brktEntriesToGet[1].id) {
          expect(brktEntries[i].player_id).toEqual(
            brktEntriesToGet[1].player_id
          );
          expect(brktEntries[i].num_refunds).toEqual(
            brktEntriesToGet[1].num_refunds
          );
        } else if (brktEntries[i].id === brktEntriesToGet[2].id) {
          expect(brktEntries[i].player_id).toEqual(
            brktEntriesToGet[2].player_id
          );
          expect(brktEntries[i].num_refunds).toBeNull();
        } else if (brktEntries[i].id === brktEntriesToGet[3].id) {
          expect(brktEntries[i].player_id).toEqual(
            brktEntriesToGet[3].player_id
          );
          expect(brktEntries[i].num_refunds).toBeNull();
        } else {
          expect(true).toBe(false);
        }
        expect(
          brktEntries[i].brkt_id === brkt1Id ||
            brktEntries[i].brkt_id === brkt2Id
        ).toBeTruthy();
        expect(brktEntries[i].num_brackets).toEqual(
          brktEntriesToGet[i].num_brackets
        );
        expect(brktEntries[i].fee + "").toEqual(brktEntriesToGet[i].fee);
        expect(compareAsc(brktEntries[i].time_stamp, minDate)).toBe(1);
        expect(compareAsc(brktEntries[i].time_stamp, maxDate)).toBe(-1);
      }
    });
    it("should return 0 brktEntries for not found tournament", async () => {
      const brktEntries = await getAllBrktEntriesForTmnt(notFoundTmntId);
      expect(brktEntries).toHaveLength(0);
    });
    it("should throw error if tmnt id is invalid", async () => {
      try {
        await getAllBrktEntriesForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should return null if tmnt id is a valid id, but not a tmnt id", async () => {
      try {
        await getAllBrktEntriesForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should return null if tmnt id is null", async () => {
      try {
        await getAllBrktEntriesForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });

  describe("getAllBrktEntriesForSquad()", () => {
    it("should get all brktEntries for squad", async () => {
      const brktEntries = await getAllBrktEntriesForSquad(
        squadIdForBrktEntries
      );
      expect(brktEntries).toHaveLength(brktEntriesToGet.length);
      if (!brktEntries) return;
      for (let i = 0; i < brktEntries.length; i++) {
        if (brktEntries[i].id === brktEntriesToGet[0].id) {
          expect(brktEntries[i].player_id).toEqual(
            brktEntriesToGet[0].player_id
          );
          expect(brktEntries[i].num_refunds).toEqual(
            brktEntriesToGet[0].num_refunds
          );
        } else if (brktEntries[i].id === brktEntriesToGet[1].id) {
          expect(brktEntries[i].player_id).toEqual(
            brktEntriesToGet[1].player_id
          );
          expect(brktEntries[i].num_refunds).toEqual(
            brktEntriesToGet[1].num_refunds
          );
        } else if (brktEntries[i].id === brktEntriesToGet[2].id) {
          expect(brktEntries[i].player_id).toEqual(
            brktEntriesToGet[2].player_id
          );
          expect(brktEntries[i].num_refunds).toBeNull();
        } else if (brktEntries[i].id === brktEntriesToGet[3].id) {
          expect(brktEntries[i].player_id).toEqual(
            brktEntriesToGet[3].player_id
          );
          expect(brktEntries[i].num_refunds).toBeNull();
        } else {
          expect(true).toBe(false);
        }
        expect(
          brktEntries[i].brkt_id === brkt1Id ||
            brktEntries[i].brkt_id === brkt2Id
        ).toBeTruthy();
        expect(brktEntries[i].num_brackets).toEqual(
          brktEntriesToGet[i].num_brackets
        );
        expect(brktEntries[i].fee + "").toEqual(brktEntriesToGet[i].fee);
        expect(compareAsc(brktEntries[i].time_stamp, minDate)).toBe(1);
        expect(compareAsc(brktEntries[i].time_stamp, maxDate)).toBe(-1);
      }
    });
    it("should return 0 brktEntries for not found squad", async () => {
      const brktEntries = await getAllBrktEntriesForSquad(notFoundSquadId);
      expect(brktEntries).toHaveLength(0);
    });
    it("should return null if squad id is invalid", async () => {
      try {
        await getAllBrktEntriesForSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should return null if squad id is a valid id, but not a squad id", async () => {
      try {
        await getAllBrktEntriesForSquad(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should return null if squad id is null", async () => {
      try {
        await getAllBrktEntriesForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
  });

  describe("getAllBrktEntriesForDiv()", () => {
    it("should get all brktEntries for div", async () => {
      const brktEntries = await getAllBrktEntriesForDiv(divIdForBrktEntries);
      expect(brktEntries).toHaveLength(brktEntriesToGet.length);
      if (!brktEntries) return;
      for (let i = 0; i < brktEntries.length; i++) {
        if (brktEntries[i].id === brktEntriesToGet[0].id) {
          expect(brktEntries[i].player_id).toEqual(
            brktEntriesToGet[0].player_id
          );
          expect(brktEntries[i].num_refunds).toEqual(
            brktEntriesToGet[0].num_refunds
          );
        } else if (brktEntries[i].id === brktEntriesToGet[1].id) {
          expect(brktEntries[i].player_id).toEqual(
            brktEntriesToGet[1].player_id
          );
          expect(brktEntries[i].num_refunds).toEqual(
            brktEntriesToGet[1].num_refunds
          );
        } else if (brktEntries[i].id === brktEntriesToGet[2].id) {
          expect(brktEntries[i].player_id).toEqual(
            brktEntriesToGet[2].player_id
          );
          expect(brktEntries[i].num_refunds).toBeNull();
        } else if (brktEntries[i].id === brktEntriesToGet[3].id) {
          expect(brktEntries[i].player_id).toEqual(
            brktEntriesToGet[3].player_id
          );
          expect(brktEntries[i].num_refunds).toBeNull();
        } else {
          expect(true).toBe(false);
        }
        expect(
          brktEntries[i].brkt_id === brkt1Id ||
            brktEntries[i].brkt_id === brkt2Id
        ).toBeTruthy();
        expect(brktEntries[i].num_brackets).toEqual(
          brktEntriesToGet[i].num_brackets
        );
        expect(brktEntries[i].fee + "").toEqual(brktEntriesToGet[i].fee);
        expect(compareAsc(brktEntries[i].time_stamp, minDate)).toBe(1);
        expect(compareAsc(brktEntries[i].time_stamp, maxDate)).toBe(-1);
      }
    });
    it("should return 0 brktEntries for not found div", async () => {
      const brktEntries = await getAllBrktEntriesForDiv(notFoundDivId);
      expect(brktEntries).toHaveLength(0);
    });
    it("should return null if div id is invalid", async () => {
      try {
        await getAllBrktEntriesForDiv("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should return null if div id is a valid id, but not a div id", async () => {
      try {
        await getAllBrktEntriesForDiv(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should return null if div id is null", async () => {
      try {
        await getAllBrktEntriesForDiv(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
  });

  describe('getAllBrktEntriesForBrkt()', () => {

    it('should get all brktEntries for brkt', async () => {
      const brktEntries = await getAllBrktEntriesForBrkt(brktIdForBrktEntries);
      expect(brktEntries).toHaveLength(2);
      if (!brktEntries) return;
      for (let i = 0; i < brktEntries.length; i++) {
        if (brktEntries[i].id === brktEntriesToGet[0].id) {
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[0].player_id);
          expect(brktEntries[i].num_refunds).toEqual(brktEntriesToGet[0].num_refunds);
        } else if (brktEntries[i].id === brktEntriesToGet[1].id) {
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[1].player_id);
          expect(brktEntries[i].num_refunds).toEqual(brktEntriesToGet[1].num_refunds);
        } else if (brktEntries[i].id === brktEntriesToGet[2].id) {
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[2].player_id);
          expect(brktEntries[i].num_refunds).toBeNull()
        } else if (brktEntries[i].id === brktEntriesToGet[3].id) {
          expect(brktEntries[i].player_id).toEqual(brktEntriesToGet[3].player_id);
          expect(brktEntries[i].num_refunds).toBeNull();
        } else {
          expect(true).toBe(false);
        }
        expect(brktEntries[i].brkt_id === brkt1Id || brktEntries[i].brkt_id === brkt2Id).toBeTruthy();
        expect(brktEntries[i].num_brackets).toEqual(brktEntriesToGet[i].num_brackets);
        expect(brktEntries[i].fee + '').toEqual(brktEntriesToGet[i].fee);
        expect(compareAsc(brktEntries[i].time_stamp, minDate)).toBe(1);
        expect(compareAsc(brktEntries[i].time_stamp, maxDate)).toBe(-1);
      }
    })
    it('should return 0 brktEntries for not found brkt', async () => {
      const brktEntries = await getAllBrktEntriesForBrkt(notFoundBrktId);
      expect(brktEntries).toHaveLength(0);
    })
    it('should return null if brkt id is invalid', async () => {
      try {
        await getAllBrktEntriesForBrkt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    })
    it('should return null if brkt id is a valid id, but not a div id', async () => {
      try {
        await getAllBrktEntriesForBrkt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    })
    it('should return null if brkt id is null', async () => {
      try {
        await getAllBrktEntriesForBrkt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    })
  })

  describe('postBrktEntry()', () => {

    const brktEntryToPost = {
      ...initBrktEntry,
      id: 'ben_0123c6c5556e407291c4b5666b2dccd7',
      brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
      player_id: 'ply_a01758cff1cc4bab9d9133e661bd49b0',
      num_brackets: 7,
      num_refunds: 1,
      fee: '45',
      time_stamp: 1739259269537
    }

    let createdBrktEntry = false;

    const deletePostedBrktEntry = async () => {
      const response = await axios.get(url);
      const brktEntries = response.data.brktEntries;
      const toDel = brktEntries.find((b: brktEntryType) => b.id === 'ben_0123c6c5556e407291c4b5666b2dccd7');
      if (toDel) {
        try {
          const delResponse = await axios({
            method: "delete",
            withCredentials: true,
            url: oneBrktEntryUrl + toDel.id
          });
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    beforeAll(async () => {
      await deletePostedBrktEntry();
    })

    beforeEach(() => {
      createdBrktEntry = false;
    })

    afterEach(async () => {
      if (createdBrktEntry) {
        await deletePostedBrktEntry();
      }
    })

    it('should post one brktEntry', async () => {
      const postedBrktEntry = await postBrktEntry(brktEntryToPost);
      expect(postedBrktEntry).not.toBeNull();
      if (!postedBrktEntry) return;
      createdBrktEntry = true;
      expect(postedBrktEntry.id).toEqual(brktEntryToPost.id);
      expect(postedBrktEntry.brkt_id).toEqual(brktEntryToPost.brkt_id);
      expect(postedBrktEntry.player_id).toEqual(brktEntryToPost.player_id);
      expect(postedBrktEntry.num_brackets).toEqual(brktEntryToPost.num_brackets);
      expect(postedBrktEntry.num_refunds).toEqual(brktEntryToPost.num_refunds);
      // no fee returned
      // expect(postedBrktEntry.fee + '').toEqual(brktEntryToPost.fee);
      expect(compareAsc(postedBrktEntry.time_stamp, minDate)).toBe(1);
      expect(compareAsc(postedBrktEntry.time_stamp, maxDate)).toBe(-1);
    })
    it('should not post a brktEntry with sanitized num_brackets (sanitized to 0)', async () => {
      try { 
        const toSanitizse = {
          ...brktEntryToPost,
          num_brackets: 1234567890
        }
        await postBrktEntry(toSanitizse);
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('postBrktEntry failed: Request failed with status code 422');
      }
    })
    it('should not post a brktEntry if got invalid data', async () => {
      try { 
        const invalidBrktEntry = {
          ...brktEntryToPost,
          fee: '-1'
        }
        await postBrktEntry(invalidBrktEntry);
      }
      catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('postBrktEntry failed: Request failed with status code 422');
      }
    })
  })

  describe('postManyBrktEntries()', () => {

    let createdBrktEntries = false;

    beforeAll(async () => {
      await deleteAllBrktEntriesForTmnt(tmntIdFormMockData);
    })

    beforeEach(() => {
      createdBrktEntries = false;
    })

    afterEach(async () => {
      if (createdBrktEntries) {
        await deleteAllBrktEntriesForTmnt(tmntIdFormMockData);
      }
    })

    afterAll(async () => {
      await deleteAllBrktEntriesForTmnt(tmntIdFormMockData);
    })

    it('should post many brktEntries', async () => {
      const count = await postManyBrktEntries(mockBrktEntriesToPost);
      expect(count).toEqual(mockBrktEntriesToPost.length);
      createdBrktEntries = true;

      const brktEntries = await getAllBrktEntriesForSquad(squadIdForMockData);      
      expect(brktEntries).not.toBeNull();
      if (!brktEntries) return;
      createdBrktEntries = true;
      expect(brktEntries.length).toEqual(mockBrktEntriesToPost.length);
      for (let i = 0; i < mockBrktEntriesToPost.length; i++) {
        if (brktEntries[i].id === mockBrktEntriesToPost[0].id) {          
          expect(brktEntries[i].brkt_id).toEqual(mockBrktEntriesToPost[0].brkt_id);
          expect(brktEntries[i].player_id).toEqual(mockBrktEntriesToPost[0].player_id);
          expect(brktEntries[i].num_brackets).toEqual(mockBrktEntriesToPost[0].num_brackets);
          expect(brktEntries[i].num_refunds).toEqual(mockBrktEntriesToPost[0].num_refunds);
        } else if (brktEntries[i].id === mockBrktEntriesToPost[1].id) {          
          expect(brktEntries[i].brkt_id).toEqual(mockBrktEntriesToPost[1].brkt_id);
          expect(brktEntries[i].player_id).toEqual(mockBrktEntriesToPost[1].player_id);
          expect(brktEntries[i].num_brackets).toEqual(mockBrktEntriesToPost[1].num_brackets);
          expect(brktEntries[i].num_refunds).toBeNull();
        } else if (brktEntries[i].id === mockBrktEntriesToPost[2].id) {
          expect(brktEntries[i].brkt_id).toEqual(mockBrktEntriesToPost[2].brkt_id);
          expect(brktEntries[i].player_id).toEqual(mockBrktEntriesToPost[2].player_id);
          expect(brktEntries[i].num_brackets).toEqual(mockBrktEntriesToPost[2].num_brackets);
          expect(brktEntries[i].num_refunds).toEqual(mockBrktEntriesToPost[2].num_refunds);
        } else if (brktEntries[i].id === mockBrktEntriesToPost[3].id) {
          expect(brktEntries[i].brkt_id).toEqual(mockBrktEntriesToPost[3].brkt_id);
          expect(brktEntries[i].player_id).toEqual(mockBrktEntriesToPost[3].player_id);
          expect(brktEntries[i].num_brackets).toEqual(mockBrktEntriesToPost[3].num_brackets);
          expect(brktEntries[i].num_refunds).toBeNull();
        }
        // does not return fee
        // expect(brktEntries[i].fee).toEqual(mockBrktEntriesToPost[i].fee);
        expect(compareAsc(brktEntries[i].time_stamp, minDate)).toBe(1);
        expect(compareAsc(brktEntries[i].time_stamp, maxDate)).toBe(-1);
      }
    })
    it('should return 0 when passed an empty array', async () => {
      const count = await postManyBrktEntries([]);
      expect(count).toBe(0);
    })
    // see test\app\api\brktEntries\validate_brktEntries.test.tsx
    // for full testing of sanitation and validation
    it('should throw error when many brktEntries with sanitization, fee value sanitized to ""', async () => {
      try { 
        const toSanitize = cloneDeep(mockBrktEntriesToPost)
        toSanitize[0].fee = '  45  ';
        await postManyBrktEntries(toSanitize);
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid brktEntry data at index 0');
      }
    })
    it('should throw error when many brktEntries with invalid data', async () => {
      try { 
        const invalidBrktEntries = cloneDeep(mockBrktEntriesToPost);
        invalidBrktEntries[1].fee = '-1';
        await postManyBrktEntries(invalidBrktEntries);
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid brktEntry data at index 1');
      }
    })
    it('should throw error when pass a non-array', async () => {
      try { 
        await postManyBrktEntries('not an array' as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid brktEntries data');        
      }
    })
  })

  describe('putBrktEntry()', () => {

    const brktEntryToPut = {
      ...initBrktEntry,
      id: "ben_bc4c581d7b1c4fc99dbdbd46f4f7210a",
      brkt_id: 'brk_5109b54c2cc44ff9a3721de42c80c8c1',
      player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
      num_brackets: 7,
      num_refunds: 2,
      fee: '45',
      time_stamp: new Date('2023-01-01').getTime()
    }

    const putUrl = oneBrktEntryUrl + brktEntryToPut.id;

    const resetBrktEntry = {
      ...initBrktEntry,
      id: "ben_bc4c581d7b1c4fc99dbdbd46f4f7210a",
      brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
      player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
      num_brackets: 8,
      num_refunds: 2,
      fee: '40',
      time_stamp: 1739259269537
    }

    const doReset = async () => {
      try {
        const playerJSON = JSON.stringify(resetBrktEntry);
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

    it('should put a brktEntry - no chnage to num_refunds', async () => {
      const puttedBrktEntry = await putBrktEntry(brktEntryToPut);
      expect(puttedBrktEntry).not.toBeNull();
      if (!puttedBrktEntry) return;
      didPut = true;
      expect(puttedBrktEntry.brkt_id).toBe(brktEntryToPut.brkt_id);
      expect(puttedBrktEntry.player_id).toBe(brktEntryToPut.player_id);
      expect(puttedBrktEntry.num_brackets).toBe(brktEntryToPut.num_brackets);
      expect(puttedBrktEntry.num_refunds).toBe(brktEntryToPut.num_refunds);
      // fee not returned
      // expect(puttedBrktEntry.fee + '').toBe(brktEntryToPut.fee);
      expect(compareAsc(puttedBrktEntry.time_stamp, minDate)).toBe(1);
      expect(compareAsc(puttedBrktEntry.time_stamp, maxDate)).toBe(-1);
    })
    it('should put a brktEntry - change num_refunds to 1', async () => {
      const tempBrktEntry = cloneDeep(brktEntryToPut);
      tempBrktEntry.num_refunds = 1;
      const puttedBrktEntry = await putBrktEntry(tempBrktEntry);
      expect(puttedBrktEntry).not.toBeNull();
      if (!puttedBrktEntry) return;
      didPut = true;
      expect(puttedBrktEntry.brkt_id).toBe(tempBrktEntry.brkt_id);
      expect(puttedBrktEntry.player_id).toBe(tempBrktEntry.player_id);
      expect(puttedBrktEntry.num_brackets).toBe(tempBrktEntry.num_brackets);
      expect(puttedBrktEntry.num_refunds).toBe(tempBrktEntry.num_refunds);
      // fee not returned
      // expect(puttedBrktEntry.fee + '').toBe(brktEntryToPut.fee);
      expect(compareAsc(puttedBrktEntry.time_stamp, minDate)).toBe(1);
      expect(compareAsc(puttedBrktEntry.time_stamp, maxDate)).toBe(-1);
    })
    it('should put a brktEntry - change num_refunds to 0', async () => {
      const tempBrktEntry = cloneDeep(brktEntryToPut);
      tempBrktEntry.num_refunds = 0;
      const puttedBrktEntry = await putBrktEntry(tempBrktEntry);
      expect(puttedBrktEntry).not.toBeNull();
      if (!puttedBrktEntry) return;
      didPut = true;
      expect(puttedBrktEntry.brkt_id).toBe(tempBrktEntry.brkt_id);
      expect(puttedBrktEntry.player_id).toBe(tempBrktEntry.player_id);
      expect(puttedBrktEntry.num_brackets).toBe(tempBrktEntry.num_brackets);
      expect(puttedBrktEntry.num_refunds).toBeUndefined();
      // fee not returned
      // expect(puttedBrktEntry.fee + '').toBe(brktEntryToPut.fee);
      expect(compareAsc(puttedBrktEntry.time_stamp, minDate)).toBe(1);
      expect(compareAsc(puttedBrktEntry.time_stamp, maxDate)).toBe(-1);
    })
    // see test\app\api\brktEntries\validate_brktEntries.test.tsx
    // for full testing of sanitation and validation
    it('should throw error when brktEntry with sanitization, num_brackets value sanitized to 0', async () => {
      try {
        const toSanitize = cloneDeep(brktEntryToPut)
        toSanitize.num_brackets = 1234567890
        await putBrktEntry(toSanitize);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('putBrktEntry failed: Request failed with status code 422');
      }          
    })
    it('should throw error when brktEntry with sanitization, fee value sanitized to ""', async () => {
      try {
        const toSanitize = cloneDeep(brktEntryToPut)
        toSanitize.fee = '  84  '
        await putBrktEntry(toSanitize);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('putBrktEntry failed: Request failed with status code 422');
      }
    })
    it('shouyld throw error when brktEntry with invalid data', async () => {
      try { 
        const invalidBrktEntry = cloneDeep(brktEntryToPut);
        invalidBrktEntry.fee = '-1';
        await putBrktEntry(invalidBrktEntry);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('putBrktEntry failed: Request failed with status code 422');
      }
    })
  })

  describe('replaceManyBrktEntries()', () => {

    let createdBrktEntries = false;

    beforeAll(async () => {
      await deleteAllBrktEntriesForTmnt(tmntIdFormMockData);
    })

    beforeEach(() => {
      createdBrktEntries = false;
    })

    afterEach(async () => {
      if (createdBrktEntries) {
        await deleteAllBrktEntriesForTmnt(tmntIdFormMockData);
      }
    })

    afterAll(async () => {
      await deleteAllBrktEntriesForTmnt(tmntIdFormMockData);
    })

    const testBrktEntries: brktEntryType[] = [
      {
        ...initBrktEntry,
        id: 'ben_01ce0472be3d476ea1caa99dd05953fa',
        player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
        num_brackets: 4,
        fee: '20',
        time_stamp: 1739259269537
      },
      {
        ...initBrktEntry,
        id: 'ben_02ce0472be3d476ea1caa99dd05953fa',
        player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
        num_brackets: 4,
        fee: '20',
        time_stamp: 1739259269537
      },
      {
        ...initBrktEntry,
        id: 'ben_03ce0472be3d476ea1caa99dd05953fa',
        player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
        num_brackets: 6,
        num_refunds: 1,
        fee: '30',
        time_stamp: 1739259269537
      },
      {
        ...initBrktEntry,
        id: 'ben_04ce0472be3d476ea1caa99dd05953fa',
        player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
        num_brackets: 6,
        num_refunds: 1,
        fee: '30',
        time_stamp: 1739259269537
      },
      {
        ...initBrktEntry,
        id: 'ben_05ce0472be3d476ea1caa99dd05953fa',
        player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
        brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
        num_brackets: 8,
        num_refunds: 3,
        fee: '40',
        time_stamp: 1739259269537
      },
      {
        ...initBrktEntry,
        id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
        player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
        brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
        num_brackets: 8,
        num_refunds: 3,
        fee: '40',
        time_stamp: 1739259269537
      },
    ];

    it('should update, insert, delete many brktEntries', async () => {

      const toInsert: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: 'ben_05ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8b0fd8bbd9e34d34a7fa90b4111c6e40',
          num_brackets: 8,
          num_refunds: 2,
          fee: '40',
          time_stamp: new Date().getTime(),
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8b0fd8bbd9e34d34a7fa90b4111c6e40',
          num_brackets: 8,
          num_refunds: 2,
          fee: '40',
          time_stamp: new Date().getTime(),
        }
      ]

      const count = await postManyBrktEntries(mockBrktEntriesToPost);
      expect(count).toEqual(mockBrktEntriesToPost.length);
      createdBrktEntries = true;
      const brktEntries = await getAllBrktEntriesForSquad(squadIdForMockData);
      if (!brktEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(brktEntries.length).toEqual(mockBrktEntriesToPost.length);

      const brktEntriesToUpdate = [
        {
          ...mockBrktEntriesToPost[0],
          num_brackets: 10,
          num_refunds: 5,
          fee: '50',
        },
        {
          ...mockBrktEntriesToPost[1],
          num_brackets: 10,
          num_refunds: 5,
          fee: '50',
        },
        {
          ...toInsert[0],
        },
        {
          ...toInsert[1],
        }
      ];
      
      const putCount = await replaceManyBrktEntries(brktEntriesToUpdate, squadIdForMockData);
      expect(putCount).toEqual(brktEntriesToUpdate.length);

      const updatedBrktEntries = await getAllBrktEntriesForSquad(squadIdForMockData);
      if (!updatedBrktEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(updatedBrktEntries.length).toEqual(brktEntriesToUpdate.length);
      for (let i = 0; i < updatedBrktEntries.length; i++) {
        if (updatedBrktEntries[i].id === brktEntriesToUpdate[0].id) {
          expect(updatedBrktEntries[i].brkt_id).toEqual(brktEntriesToUpdate[0].brkt_id);
          expect(updatedBrktEntries[i].player_id).toEqual(brktEntriesToUpdate[0].player_id);
          expect(updatedBrktEntries[i].num_brackets).toEqual(brktEntriesToUpdate[0].num_brackets);
          expect(updatedBrktEntries[i].num_refunds).toEqual(brktEntriesToUpdate[0].num_refunds);
          expect(updatedBrktEntries[i].fee + '').toEqual(brktEntriesToUpdate[0].fee);
        } else if (updatedBrktEntries[i].id === brktEntriesToUpdate[1].id) {
          expect(updatedBrktEntries[i].brkt_id).toEqual(brktEntriesToUpdate[1].brkt_id);
          expect(updatedBrktEntries[i].player_id).toEqual(brktEntriesToUpdate[1].player_id);
          expect(updatedBrktEntries[i].num_brackets).toEqual(brktEntriesToUpdate[1].num_brackets);
          expect(updatedBrktEntries[i].num_refunds).toEqual(brktEntriesToUpdate[1].num_refunds);
          expect(updatedBrktEntries[i].fee + '').toEqual(brktEntriesToUpdate[1].fee);
        } else if (updatedBrktEntries[i].id === brktEntriesToUpdate[2].id) {
          expect(updatedBrktEntries[i].brkt_id).toEqual(brktEntriesToUpdate[2].brkt_id);
          expect(updatedBrktEntries[i].player_id).toEqual(brktEntriesToUpdate[2].player_id);
          expect(updatedBrktEntries[i].num_brackets).toEqual(brktEntriesToUpdate[2].num_brackets);
          expect(updatedBrktEntries[i].num_refunds).toEqual(brktEntriesToUpdate[2].num_refunds);
          expect(updatedBrktEntries[i].fee + '').toEqual(brktEntriesToUpdate[2].fee);
        } else if (updatedBrktEntries[i].id === brktEntriesToUpdate[3].id) {
          expect(updatedBrktEntries[i].brkt_id).toEqual(brktEntriesToUpdate[3].brkt_id);
          expect(updatedBrktEntries[i].player_id).toEqual(brktEntriesToUpdate[3].player_id);
          expect(updatedBrktEntries[i].num_brackets).toEqual(brktEntriesToUpdate[3].num_brackets);
          expect(updatedBrktEntries[i].num_refunds).toEqual(brktEntriesToUpdate[3].num_refunds);
          expect(updatedBrktEntries[i].fee + '').toEqual(brktEntriesToUpdate[3].fee);
        } else { 
          expect(true).toBeFalsy();
        }
      }
    });
    it('should return 0 when passsed and empty array', async () => { 
      const count = await replaceManyBrktEntries([], squadIdForMockData);
      expect(count).toEqual(0);
    })
    it('should throw error when passsed an null for brktEntries', async () => { 
      try { 
        await replaceManyBrktEntries(null as any, squadIdForMockData);
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('No brktEntries provided');        
      }      
    })
    it('should throw error when passsed a non array for brktEntries', async () => { 
      try { 
        await replaceManyBrktEntries('not an array' as any, squadIdForMockData);
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('No brktEntries provided');        
      }      
    })
    it('should throw error when passsed an invalid squadId', async () => { 
      try { 
        await replaceManyBrktEntries(mockBrktEntriesToPost, 'invalidSquadId');
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid squad id');        
      }      
    })
    it('should throw error when many brktEntries with invalid brktEntry id in 2nd entry', async () => { 
      const count = await postManyBrktEntries(mockBrktEntriesToPost);
      expect(count).toEqual(mockBrktEntriesToPost.length);
      createdBrktEntries = true;
      const brktEntries = await getAllBrktEntriesForSquad(squadIdForMockData);
      if (!brktEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(brktEntries.length).toEqual(mockBrktEntriesToPost.length);

      const brktEntriesToUpdate = [
        {
          ...mockBrktEntriesToPost[0],
        },
        {
          ...mockBrktEntriesToPost[1],
          id: 'invalidId',
        },
        {
          ...mockBrktEntriesToPost[2],          
        },
        {
          ...mockBrktEntriesToPost[3],
        }
      ];
      await expect(replaceManyBrktEntries(brktEntriesToUpdate, squadIdForMockData)).rejects.toThrow('Invalid brktEntry data at index 1');
    })
    it('should throw error when many brktEntries with sanitized data to invlaid values', async () => { 
      const count = await postManyBrktEntries(mockBrktEntriesToPost);
      expect(count).toEqual(mockBrktEntriesToPost.length);
      createdBrktEntries = true;
      const brktEntries = await getAllBrktEntriesForSquad(squadIdForMockData);
      if (!brktEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(brktEntries.length).toEqual(mockBrktEntriesToPost.length);

      const brktEntriesToUpdate = [
        {
          ...mockBrktEntriesToPost[0],
          num_brackets: 1234567890,
          num_refunds: 0,
          fee: '6172839450',
        },
        {
          ...mockBrktEntriesToPost[1],
        },
        {
          ...mockBrktEntriesToPost[2],
        },
        {
          ...mockBrktEntriesToPost[3],
        }
      ];
      await expect(replaceManyBrktEntries(brktEntriesToUpdate, squadIdForMockData)).rejects.toThrow('Invalid brktEntry data at index 0');
    })
    it('should throw error when many brktEntries with invalid data in 3rd brktEntry', async () => { 
      const count = await postManyBrktEntries(mockBrktEntriesToPost);
      expect(count).toEqual(mockBrktEntriesToPost.length);
      createdBrktEntries = true;
      const brktEntries = await getAllBrktEntriesForSquad(squadIdForMockData);
      if (!brktEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(brktEntries.length).toEqual(mockBrktEntriesToPost.length);

      const brktEntriesToUpdate = [
        {
          ...mockBrktEntriesToPost[0],
        },
        {
          ...mockBrktEntriesToPost[1],
        },
        {
          ...mockBrktEntriesToPost[2],
          player_id: 'invalidPlayerId',
        },
        {
          ...mockBrktEntriesToPost[3],
        }
      ];
      await expect(replaceManyBrktEntries(brktEntriesToUpdate, squadIdForMockData)).rejects.toThrow('Invalid brktEntry data at index 2');
    })

    // it('should update, insert and delete many brktEntries', async () => {
    //   const multiBrktEntriesTest = [
    //     {
    //       ...testBrktEntries[0],
    //     },
    //     {
    //       ...testBrktEntries[1],
    //     },
    //     {
    //       ...testBrktEntries[2],
    //     },
    //     {
    //       ...testBrktEntries[3],
    //     },
    //   ]
    //   const count = await postManyBrktEntries(multiBrktEntriesTest);
    //   expect(count).toBe(multiBrktEntriesTest.length);
    //   createdBrktEntries = true;

    //   // const postedBrktEntries = await postManyBrktEntries(multiBrktEntriesTest);
    //   // expect(postedBrktEntries).not.toBeNull();
    //   // if (!postedBrktEntries) return;
    //   // expect(postedBrktEntries.length).toBe(multiBrktEntriesTest.length);

    //   // set edits, set eType
    //   const brktEntriesToUpdate = [
    //     {
    //       ...multiBrktEntriesTest[0],
    //       num_brackets: 3,
    //       fee: '15',
    //       time_stamp: new Date('2023-01-01').getTime(),
    //       eType: "u",
    //     },
    //     {
    //       ...multiBrktEntriesTest[1],
    //       num_brackets: 3,
    //       fee: '15',
    //       time_stamp: new Date('2023-01-01').getTime(),
    //       eType: "u",
    //     },
    //     {
    //       ...multiBrktEntriesTest[2],
    //       eType: "d",
    //     },
    //     {
    //       ...multiBrktEntriesTest[3],
    //       eType: "d",
    //     },
    //     {
    //       ...testBrktEntries[4],
    //       eType: "i",
    //     },
    //     {
    //       ...testBrktEntries[5],
    //       eType: "i",
    //     },
    //   ]

    //   const updateInfo = await putManyBrktEntries(brktEntriesToUpdate);
    //   expect(updateInfo).not.toBeNull();
    //   if (!updateInfo) return;
    //   expect(updateInfo.updates).toBe(2);
    //   expect(updateInfo.inserts).toBe(2);
    //   expect(updateInfo.deletes).toBe(2);
    //   expect(updateInfo.rfUpdates).toBe(0);
    //   expect(updateInfo.rfInserts).toBe(2);
    //   // expect updateInfo.deletes to be 0,
    //   // because deleting brkyEntry row deletes brkt_refund row
    //   expect(updateInfo.rfDeletes).toBe(0);
    // })
    // see test\app\api\brktEntries\validate_brktEntries.test.tsx
    // for full testing of sanitation and validation
    // it('should return no updates, inserts or deletes when passed empty brkt entries', async () => {
    //   const multiBrktEntriesTest = [
    //     {
    //       ...testBrktEntries[0],
    //     },
    //     {
    //       ...testBrktEntries[1],
    //     },
    //     {
    //       ...testBrktEntries[2],
    //     },
    //     {
    //       ...testBrktEntries[3],
    //     },
    //   ]
    //   const count = await postManyBrktEntries(multiBrktEntriesTest);
    //   expect(count).toBe(multiBrktEntriesTest.length);
    //   createdBrktEntries = true;

    //   // createdBrktEntries = true;
    //   // const postedBrktEntries = await postManyBrktEntries(multiBrktEntriesTest);
    //   // expect(postedBrktEntries).not.toBeNull();
    //   // if (!postedBrktEntries) return;
    //   // expect(postedBrktEntries.length).toBe(multiBrktEntriesTest.length);

    //   // set empty edits
    //   const brktEntriesToUpdate: brktEntryType[] = []
    //   const updateInfo = await putManyBrktEntries(brktEntriesToUpdate);
    //   expect(updateInfo).not.toBeNull();
    //   if (!updateInfo) return;
    //   expect(updateInfo.updates).toBe(0);
    //   expect(updateInfo.inserts).toBe(0);
    //   expect(updateInfo.deletes).toBe(0);
    //   expect(updateInfo.rfUpdates).toBe(0);
    //   expect(updateInfo.rfInserts).toBe(0);
    //   expect(updateInfo.rfDeletes).toBe(0);
    //   await deleteAllBrktEntriesForTmnt(tmntIdFormMockData);
    // })
    // it('should update no brkt entries when error in data', async () => {
    //   const count = await postManyBrktEntries(testBrktEntries);
    //   expect(count).toBe(testBrktEntries.length);
    //   createdBrktEntries = true;

    //   // createdBrktEntries = true;
    //   // const postedBrktEntries = await postManyBrktEntries(testBrktEntries);
    //   // expect(postedBrktEntries).not.toBeNull();
    //   // if (!postedBrktEntries) return;
    //   // expect(postedBrktEntries.length).toBe(testBrktEntries.length);

    //   // set edits, set eType
    //   const brktEntriesToUpdate = [
    //     {
    //       ...testBrktEntries[0],
    //       num_brackets: maxBrackets + 1, // invalid num_brackets
    //       fee: '1234567890',             // invalid fee
    //       eType: "u",
    //     },
    //     {
    //       ...testBrktEntries[1],
    //       num_brackets: 3,
    //       fee: '15',
    //       eType: "u",
    //     },
    //     {
    //       ...testBrktEntries[2],
    //       eType: "d",
    //     },
    //     {
    //       ...testBrktEntries[3],
    //       eType: "d",
    //     },
    //     {
    //       ...testBrktEntries[4],
    //       eType: "i",
    //     },
    //     {
    //       ...testBrktEntries[5],
    //       eType: "i",
    //     },
    //   ]

    //   const updateInfo = await putManyBrktEntries(brktEntriesToUpdate);
    //   expect(updateInfo).toBeNull();
    // })
  })

  describe('deleteBrktEntry()', () => {

    // toDel is data from prisma/seeds.ts
    const toDel = {
      ...initBrktEntry,
      id: "ben_093a0902e01e46dbbe9f111acefc17da",
      brkt_id: "brk_12344698f47e4d64935547923e2bdbfb",
      player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
      num_brackets: 8,
      num_refunds: 2,
      fee: '40',
      time_stamp: 1739259269537
    }

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

    it('should delete a brktEntry', async () => {
      const deleted = await deleteBrktEntry(toDel.id);
      expect(deleted).toBe(1);
      didDel = true;
    })
    it('should throw error and not delete a brktEntry when id is not found', async () => {
      try { 
        await deleteBrktEntry(notFoundId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('deleteBrktEntry failed: Request failed with status code 404');
      }
    })
    it('should throw error and not delete a brktEntry when id is invalid', async () => {
      try { 
        await deleteBrktEntry("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid brktEntry id');
      }
    })
    it('should throw error and not delete a brktEntry when id is valid, but not a brktEntry id', async () => {
      try { 
        await deleteBrktEntry(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid brktEntry id');
      }
    })
    it('should throw error and not delete a brktEntry when id is null', async () => {
      try { 
        await deleteBrktEntry(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid brktEntry id');
      }
    })
  })

  describe('deleteAllBrktEntriesForSquad()', () => {

    let didDel = false;

    beforeAll(async () => {
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

    it('should delete all brktEntries for a squad', async () => {
      const deleted = await deleteAllBrktEntriesForSquad(squadIdForMockData);
      expect(deleted).toBe(mockBrktEntriesToPost.length);
      didDel = true;
    })
    it('should not delete all brktEntries for a squad when squad id is not found', async () => {
      const deleted = await deleteAllBrktEntriesForSquad(notFoundSquadId);
      expect(deleted).toBe(0);
    })
    it('should not delete all brktEntries for a squad when squad id is invalid', async () => {
      try { 
        await deleteAllBrktEntriesForSquad("test");
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid squad id');
      }      
    })
    it('should not delete all brktEntries for a squad when squad id is valid, but not a squad id', async () => {
      try { 
        await deleteAllBrktEntriesForSquad(userId);
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid squad id');
      }      
    })
    it('should not delete all brktEntries for a squad when squad id is null', async () => {
      try { 
        await deleteAllBrktEntriesForSquad(null as any);
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid squad id');
      }      
    })
  })

  describe('deleteAllBrktEntriesForDiv()', () => {

    let didDel = false;

    beforeAll(async () => {
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

    it('should delete all brktEntries for a div', async () => {
      const deleted = await deleteAllBrktEntriesForDiv(divIdForMockData);
      expect(deleted).toBe(mockBrktEntriesToPost.length);
      didDel = true;
    })
    it('should not delete all brktEntries for a div when div id is not found', async () => {
      const deleted = await deleteAllBrktEntriesForDiv(notFoundDivId);
      expect(deleted).toBe(0);
    })
    it('should not delete all brktEntries for a div when div id is invalid', async () => {
      try { 
        await deleteAllBrktEntriesForDiv("test");
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid div id');
      }      
    })
    it('should not delete all brktEntries for a div when div id is valid, but not a div id', async () => {
      try { 
        await deleteAllBrktEntriesForDiv(userId);
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid div id');
      }      
    })
    it('should not delete all brktEntries for a div when div id is null', async () => {
      try { 
        await deleteAllBrktEntriesForDiv(null as any);
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid div id');
      }      
    })
  })

  describe('deleteAllBrktEntriesForBrkt()', () => {

    let didDel = false;

    beforeAll(async () => {
      await rePostToDel();
    })

    beforeEach(async () => {
      if (didDel) {
        await rePostToDel();
      }
    });

    afterEach(async () => {
      didDel = false;
      await deleteAllBrktEntriesForTmnt(tmntIdFormMockData)
    });

    afterAll(async () => {
      await deleteAllBrktEntriesForTmnt(tmntIdFormMockData)
    });

    it('should delete all brktEntries for a brkt', async () => {
      const deleted = await deleteAllBrktEntriesForBrkt(brktIdForMockData);
      expect(deleted).toBe(2); // only 2 of the 4 mock brktEntries were deleted
      didDel = true;
    })
    it('should not delete all brktEntries for a brkt when brkt id is not found', async () => {
      const deleted = await deleteAllBrktEntriesForBrkt(notFoundBrktId);
      expect(deleted).toBe(0);
    })
    it('should not delete all brktEntries for a brkt when brkt id is invalid', async () => {
      try { 
        await deleteAllBrktEntriesForBrkt("test");
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid brkt id');
      }      
    })
    it('should not delete all brktEntries for a brkt when brkt id is valid, but not a brkt id', async () => {
      try { 
        await deleteAllBrktEntriesForBrkt(userId);
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid brkt id');
      }      
    })
    it('should not delete all brktEntries for a brkt when brkt id is null', async () => {
      try { 
        await deleteAllBrktEntriesForBrkt(null as any);
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid brkt id');
      }      
    })
  })

  describe('deleteAllBrktEntriesForTmnt()', () => {

    let didDel = false;

    beforeAll(async () => {
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
      deleteAllBrktEntriesForTmnt(tmntIdFormMockData)
    });

    it('should delete all brktEntries for a tmnt', async () => {
      const deleted = await deleteAllBrktEntriesForTmnt(tmntIdFormMockData);
      expect(deleted).toBe(mockBrktEntriesToPost.length);
      didDel = true;
    })
    it('should not delete all brktEntries for a tmnt when tmnt id is not found', async () => {
      const deleted = await deleteAllBrktEntriesForTmnt(notFoundTmntId);
      expect(deleted).toBe(0);
    })
    it('should not delete all brktEntries for a tmnt when tmnt id is invalid', async () => {
      try { 
        await deleteAllBrktEntriesForTmnt("test");
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid tmnt id');
      }      
    })
    it('should not delete all brktEntries for a tmnt when tmnt id is valid, but not a tmnt id', async () => {
      try { 
        await deleteAllBrktEntriesForTmnt(userId);
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid tmnt id');
      }      
    })
    it('should not delete all brktEntries for a tmnt when tmnt id is null', async () => {
      try { 
        await deleteAllBrktEntriesForTmnt(null as any);
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid tmnt id');
      }      
    })
  })
});
