import { AxiosError } from "axios";
import { publicApi, privateApi } from "@/lib/api/axios";
import { baseElimEntriesApi } from "@/lib/api/apiPaths";
import { testBaseElimEntriesApi } from "../../../testApi";
import type { elimEntryType } from "@/lib/types/types";
import { initElimEntry } from "@/lib/db/initVals";
import {
  deleteElimEntry,
  getAllElimEntriesForElim,
  getAllElimEntriesForDiv,
  getAllElimEntriesForSquad,
  getAllElimEntriesForTmnt,
  postElimEntry,
  putElimEntry,
  extractElimEntries,
} from "@/lib/db/elimEntries/dbElimEntries";
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

const url = testBaseElimEntriesApi.startsWith("undefined")
  ? baseElimEntriesApi
  : testBaseElimEntriesApi;

const oneElimEntryUrl = url + "/elimEntry/";

const elimEntriesToGet: elimEntryType[] = [
  {
    ...initElimEntry,
    id: "een_23d6f8f1de844604a8828d4bb8a5a910",
    elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    fee: "5",
  },
  {
    ...initElimEntry,
    id: "een_e50663d4292145e6895ece1c0105dd3a",
    elim_id: "elm_9d01015272b54962a375cf3c91007a12",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    fee: "5",
  },
  {
    ...initElimEntry,
    id: "een_ffce2d50515541259f25b19257898074",
    elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
    player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
    fee: "5",
  },
  {
    ...initElimEntry,
    id: "een_1aa013df98094a03aa79995bc1c6dd9f",
    elim_id: "elm_9d01015272b54962a375cf3c91007a12",
    player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
    fee: "5",
  },
];

const tmntIdForElimEntries = "tmt_fd99387c33d9c78aba290286576ddce5";
const squadIdForElimEntries = "sqd_7116ce5f80164830830a7157eb093396";
const divIdForElimEntries = "div_f30aea2c534f4cfe87f4315531cef8ef";
const elimIdForElimEntries = "elm_45d884582e7042bb95b4818ccdd9974c";

const notFoundId = "een_01234567890123456789012345678901";
const notFoundElimId = "elm_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

const elim1Id = "elm_45d884582e7042bb95b4818ccdd9974c";
const elim2Id = "elm_9d01015272b54962a375cf3c91007a12";

describe("dbElimEntries", () => {
  const rePostElimEntry = async (elimEntry: elimEntryType) => {
    try {
      const getResponse = await publicApi.get(oneElimEntryUrl + elimEntry.id);
      const found = getResponse.data?.elimEntry;
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
      const elimEntryJSON = JSON.stringify(elimEntry);
      await privateApi.post(url, elimEntryJSON);
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  const expectElimEntriesToMatch = (
    elimEntries: elimEntryType[],
    expected: elimEntryType[]
  ) => {
    expect(elimEntries).toHaveLength(expected.length);

    for (const elimEntry of elimEntries) {
      const expectedEntry = expected.find((e) => e.id === elimEntry.id);
      expect(expectedEntry).toBeDefined();

      expect(elimEntry.player_id).toEqual(expectedEntry?.player_id);
      expect(elimEntry.fee).toEqual(expectedEntry?.fee);
      expect(
        elimEntry.elim_id === elim1Id || elimEntry.elim_id === elim2Id
      ).toBeTruthy();
    }
  };

  describe("extractElimEntries", () => {
    it("should return an empty array when given an empty array", () => {
      const result = extractElimEntries([]);
      expect(result).toEqual([]);
    });

    it("should correctly map raw elimEntries to elimEntriesType", () => {
      const rawElimEntries = [
        {
          id: "een_23d6f8f1de844604a8828d4bb8a5a910",
          elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: 5,
          extraField: "ignore me",
        },
      ];

      const result = extractElimEntries(rawElimEntries);

      const expected: elimEntryType = {
        ...initElimEntry,
        id: "een_23d6f8f1de844604a8828d4bb8a5a910",
        elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
        player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
        fee: "5",
      };

      expect(result).toEqual([expected]);
    });

    it("should fill missing fields with defaults from blankElimEntry", () => {
      const rawElimEntries = [
        {
          id: "een_23d6f8f1de844604a8828d4bb8a5a910",
          elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: 5,
        },
      ];

      const result = extractElimEntries(rawElimEntries);

      expect(result[0].elim_id_err).toBe("");
      expect(result[0].player_id_err).toBe("");
      expect(result[0].fee_err).toBe("");
    });

    it("should process multiple players", () => {
      const rawElimEntries = [
        {
          id: "een_23d6f8f1de844604a8828d4bb8a5a910",
          elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: 5,
        },
        {
          id: "een_23d6f8f1de844604a8828d4bb8a5a910",
          elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
          player_id: "ply_99be0472be3d476ea1caa99dd05953fa",
          fee: 5,
        },
      ];

      const result = extractElimEntries(rawElimEntries);

      expect(result).toHaveLength(2);
      expect(result[0].player_id).toBe("ply_88be0472be3d476ea1caa99dd05953fa");
      expect(result[1].player_id).toBe("ply_99be0472be3d476ea1caa99dd05953fa");
    });

    it("should return an empty array when given null", () => {
      const result = extractElimEntries(null);
      expect(result).toEqual([]);
    });

    it("should return an empty array when given a non-array", () => {
      const result = extractElimEntries("not an array");
      expect(result).toEqual([]);
    });
  });

  describe("getAllElimEntriesForTmnt()", () => {
    it("should get all elimEntries for tmnt", async () => {
      const elimEntries = await getAllElimEntriesForTmnt(tmntIdForElimEntries);
      expectElimEntriesToMatch(elimEntries, elimEntriesToGet);
    });

    it("should return 0 elimEntries for not found tmnt", async () => {
      const elimEntries = await getAllElimEntriesForTmnt(notFoundTmntId);
      expect(elimEntries).toHaveLength(0);
    });

    it("should return null if tmmt id is invalid", async () => {
      try {
        await getAllElimEntriesForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });

    it("should return null if tmnt id is a valid id, but not a tmnt id", async () => {
      try {
        await getAllElimEntriesForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });

    it("should return null if tmnt id is null", async () => {
      try {
        await getAllElimEntriesForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });

  describe("getAllElimEntriesForSquad()", () => {
    it("should get all elimEntries for squad", async () => {
      const elimEntries = await getAllElimEntriesForSquad(
        squadIdForElimEntries
      );
      expectElimEntriesToMatch(elimEntries, elimEntriesToGet);
    });

    it("should return 0 elimEntries for not found squad", async () => {
      const elimEntries = await getAllElimEntriesForSquad(notFoundSquadId);
      expect(elimEntries).toHaveLength(0);
    });

    it("should return null if squad id is invalid", async () => {
      try {
        await getAllElimEntriesForSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });

    it("should return null if squad id is a valid id, but not a squad id", async () => {
      try {
        await getAllElimEntriesForSquad(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });

    it("should return null if squad id is null", async () => {
      try {
        await getAllElimEntriesForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
  });

  describe("getAllElimEntriesForDiv()", () => {
    it("should get all elimEntries for div", async () => {
      const elimEntries = await getAllElimEntriesForDiv(divIdForElimEntries);
      expectElimEntriesToMatch(elimEntries, elimEntriesToGet);
    });

    it("should return 0 elimEntries for not found div", async () => {
      const elimEntries = await getAllElimEntriesForDiv(notFoundDivId);
      expect(elimEntries).toHaveLength(0);
    });

    it("should return null if div id is invalid", async () => {
      try {
        await getAllElimEntriesForDiv("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });

    it("should return null if div id is a valid id, but not a div id", async () => {
      try {
        await getAllElimEntriesForDiv(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });

    it("should return null if div id is null", async () => {
      try {
        await getAllElimEntriesForDiv(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
  });

  describe("getAllElimEntriesForElim()", () => {
    it("should get all elimEntries for elim", async () => {
      const elimEntries = await getAllElimEntriesForElim(elimIdForElimEntries);
      expect(elimEntries).toHaveLength(2);

      for (const elimEntry of elimEntries) {
        const expectedEntry = elimEntriesToGet.find((e) => e.id === elimEntry.id);
        expect(expectedEntry).toBeDefined();
        expect(elimEntry.player_id).toEqual(expectedEntry?.player_id);
        expect(
          elimEntry.elim_id === elim1Id || elimEntry.elim_id === elim2Id
        ).toBeTruthy();
        expect(elimEntry.fee).toEqual(expectedEntry?.fee);
      }
    });

    it("should return 0 elimEntries for not found elim", async () => {
      const elimEntries = await getAllElimEntriesForElim(notFoundElimId);
      expect(elimEntries).toHaveLength(0);
    });

    it("should return null if elim id is invalid", async () => {
      try {
        await getAllElimEntriesForElim("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elim id");
      }
    });

    it("should return null if elim id is a valid id, but not a div id", async () => {
      try {
        await getAllElimEntriesForElim(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elim id");
      }
    });

    it("should return null if elim id is null", async () => {
      try {
        await getAllElimEntriesForElim(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elim id");
      }
    });
  });

  describe("postElimEntry()", () => {
    const elimEntryToPost = {
      ...initElimEntry,
      id: "een_012346c5556e407291c4b5666b2dccd7",
      elim_id: "elm_b4c3939adca140898b1912b75b3725f8",
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
      fee: "3",
    };

    let createdElimEntry = false;

    const deletePostedElimEntry = async () => {
      try {
        await privateApi.delete(oneElimEntryUrl + elimEntryToPost.id);
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    };

    beforeAll(async () => {
      await deletePostedElimEntry();
    });

    beforeEach(() => {
      createdElimEntry = false;
    });

    afterEach(async () => {
      if (createdElimEntry) {
        await deletePostedElimEntry();
      }
    });

    it("should post one elimEntry", async () => {
      const postedElimEntry = await postElimEntry(elimEntryToPost);
      expect(postedElimEntry).not.toBeNull();
      createdElimEntry = true;
      expect(postedElimEntry.id).toEqual(elimEntryToPost.id);
      expect(postedElimEntry.elim_id).toEqual(elimEntryToPost.elim_id);
      expect(postedElimEntry.player_id).toEqual(elimEntryToPost.player_id);
      expect(postedElimEntry.fee).toEqual(elimEntryToPost.fee);
    });

    it("should post a sanitzed elimEntry", async () => {
      const toSanitizse = {
        ...elimEntryToPost,
        fee: "3.000",
      };

      const postedElimEntry = await postElimEntry(toSanitizse);
      expect(postedElimEntry).not.toBeNull();
      createdElimEntry = true;
      expect(postedElimEntry.id).toEqual(toSanitizse.id);
      expect(postedElimEntry.elim_id).toEqual(toSanitizse.elim_id);
      expect(postedElimEntry.player_id).toEqual(toSanitizse.player_id);
      expect(postedElimEntry.fee).toEqual("3");
    });

    it("should throw error when trying to post a elimEntry if got invalid elimEntry id", async () => {
      try {
        const invalidElimEntry = {
          ...elimEntryToPost,
          id: "test",
        };
        await postElimEntry(invalidElimEntry);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elimEntry data");
      }
    });

    it("should throw error when trying to post a elimEntry if got invalid data", async () => {
      try {
        const invalidElimEntry = {
          ...elimEntryToPost,
          fee: "-1",
        };
        await postElimEntry(invalidElimEntry);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "postElimEntry failed: Request failed with status code 422"
        );
      }
    });

    it("should throw error when trying to post a elimEntry if got null", async () => {
      try {
        await postElimEntry(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elimEntry data");
      }
    });
  });

  describe("putElimEntry()", () => {
    const elimEntryToPut = {
      ...initElimEntry,
      id: "een_23d6f8f1de844604a8828d4bb8a5a910",
      elim_id: "elm_b4c3939adca140898b1912b75b3725f8",
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
      fee: "3",
    };

    const putUrl = oneElimEntryUrl + elimEntryToPut.id;

    const resetElimEntry = {
      ...initElimEntry,
      id: "een_23d6f8f1de844604a8828d4bb8a5a910",
      elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
      player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
      fee: "5",
    };

    const doReset = async () => {
      try {
        const elimEntryJSON = JSON.stringify(resetElimEntry);
        await privateApi.put(putUrl, elimEntryJSON);
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
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

    it("should put a elimEntry", async () => {
      const puttedElimEntry = await putElimEntry(elimEntryToPut);
      expect(puttedElimEntry).not.toBeNull();
      if (!puttedElimEntry) return;
      didPut = true;
      expect(puttedElimEntry.elim_id).toBe(elimEntryToPut.elim_id);
      expect(puttedElimEntry.player_id).toBe(elimEntryToPut.player_id);
      expect(puttedElimEntry.fee).toBe(elimEntryToPut.fee);
    });

    it('should throw error when trying to put a elimEntry with sanitization, fee value sanitized to ""', async () => {
      try {
        const toSanitize = cloneDeep(elimEntryToPut);
        toSanitize.fee = "  3  ";
        await putElimEntry(toSanitize);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "putElimEntry failed: Request failed with status code 422"
        );
      }
    });

    it("should throw error when trying to put a elimEntry with invalid data", async () => {
      try {
        const invalidElimEntry = {
          ...elimEntryToPut,
          fee: "-1",
        };
        await putElimEntry(invalidElimEntry);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "putElimEntry failed: Request failed with status code 422"
        );
      }
    });

    it("should throw error when trying to put a elimEntry with non object passed", async () => {
      try {
        await putElimEntry("not an object" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elimEntry data");
      }
    });

    it("should throw error when trying to put a elimEntry with null passed", async () => {
      try {
        await putElimEntry(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elimEntry data");
      }
    });
  });

  describe("deleteElimEntry()", () => {
    const toDel = {
      ...initElimEntry,
      id: "een_19f158c6cc0d4f619227fbc24a885bab",
      elim_id: "elm_a47a4ec07f824b0e93169ae78e8b4b1e",
      player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
      fee: "5",
    };

    let didDel = false;

    beforeAll(async () => {
      await rePostElimEntry(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostElimEntry(toDel);
      }
    });

    it("should delete a elimEntry", async () => {
      const deleted = await deleteElimEntry(toDel.id);
      expect(deleted).toBe(1);
      didDel = true;
    });

    it("should throw error and not delete a elimEntry when id is not found", async () => {
      try {
        await deleteElimEntry(notFoundId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "deleteElimEntry failed: Request failed with status code 404"
        );
      }
    });

    it("should throw error and not delete a elimEntry when id is invalid", async () => {
      try {
        await deleteElimEntry("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elimEntry id");
      }
    });

    it("should throw error and not delete a elimEntry when id is valid, but not an elimEntry id", async () => {
      try {
        await deleteElimEntry(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elimEntry id");
      }
    });

    it("should throw error and not delete a elimEntry when id is null", async () => {
      try {
        await deleteElimEntry(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elimEntry id");
      }
    });
  });
});