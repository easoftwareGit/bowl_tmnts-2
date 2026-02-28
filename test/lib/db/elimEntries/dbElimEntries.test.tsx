import axios, { AxiosError } from "axios";
import { baseElimEntriesApi } from "@/lib/api/apiPaths";
import { testBaseElimEntriesApi } from "../../../testApi";
import type { elimEntryType } from "@/lib/types/types";
import { initElimEntry } from "@/lib/db/initVals";
import { mockElimEntriesToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import {
  deleteAllElimEntriesForElim,
  deleteAllElimEntriesForDiv,
  deleteAllElimEntriesForSquad,
  deleteAllElimEntriesForTmnt,
  deleteElimEntry,
  getAllElimEntriesForElim,
  getAllElimEntriesForDiv,
  getAllElimEntriesForSquad,
  getAllElimEntriesForTmnt,
  postElimEntry,
  postManyElimEntries,
  putElimEntry,
  extractElimEntries,
} from "@/lib/db/elimEntries/dbElimEntries";
import { replaceManyElimEntries } from "@/lib/db/elimEntries/dbElimEntriesReplaceMany";
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

const tmntIdFormMockData = "tmt_56d916ece6b50e6293300248c6792316";
const divIdForMockData = "div_1f42042f9ef24029a0a2d48cc276a087";
const squadIdForMockData = "sqd_1a6c885ee19a49489960389193e8f819";
const elimIdForMockData = "elm_b4c3939adca140898b1912b75b3725f8";

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
      // if elimEntry already in database, then don't re-post
      const getResponse = await axios.get(oneElimEntryUrl + elimEntry.id);
      const found = getResponse.data.elimEntry;
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
      const elimEntryJSON = JSON.stringify(elimEntry);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: elimEntryJSON,
      });
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  const rePostToDel = async () => {
    const response = await axios.get(url);
    const elimEntries = response.data.elimEntries;
    const foundToDel = elimEntries.find(
      (e: elimEntryType) => e.id === mockElimEntriesToPost[1].id
    );
    if (!foundToDel) {
      try {
        await postManyElimEntries(mockElimEntriesToPost);
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
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
          extraField: "ignore me", // should be ignored
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

      // every *_err field should be blank string
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
    })
  });

  describe("getAllElimEntriesForTmnt()", () => {
    it("should get all elimEntries for tmnt", async () => {
      const elimEntries = await getAllElimEntriesForTmnt(tmntIdForElimEntries);
      expect(elimEntries).toHaveLength(elimEntriesToGet.length);
      if (!elimEntries) return;
      for (let i = 0; i < elimEntries.length; i++) {
        if (elimEntries[i].id === elimEntriesToGet[0].id) {
          expect(elimEntries[i].player_id).toEqual(
            elimEntriesToGet[0].player_id
          );
        } else if (elimEntries[i].id === elimEntriesToGet[1].id) {
          expect(elimEntries[i].player_id).toEqual(
            elimEntriesToGet[1].player_id
          );
        } else if (elimEntries[i].id === elimEntriesToGet[2].id) {
          expect(elimEntries[i].player_id).toEqual(
            elimEntriesToGet[2].player_id
          );
        } else if (elimEntries[i].id === elimEntriesToGet[3].id) {
          expect(elimEntries[i].player_id).toEqual(
            elimEntriesToGet[3].player_id
          );
        } else {
          expect(true).toBe(false);
        }
        expect(
          elimEntries[i].elim_id === elim1Id ||
            elimEntries[i].elim_id === elim2Id
        ).toBeTruthy();
        expect(elimEntries[i].fee).toEqual(elimEntriesToGet[i].fee);
      }
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
      expect(elimEntries).toHaveLength(elimEntriesToGet.length);
      if (!elimEntries) return;
      for (let i = 0; i < elimEntries.length; i++) {
        if (elimEntries[i].id === elimEntriesToGet[0].id) {
          expect(elimEntries[i].player_id).toEqual(
            elimEntriesToGet[0].player_id
          );
        } else if (elimEntries[i].id === elimEntriesToGet[1].id) {
          expect(elimEntries[i].player_id).toEqual(
            elimEntriesToGet[1].player_id
          );
        } else if (elimEntries[i].id === elimEntriesToGet[2].id) {
          expect(elimEntries[i].player_id).toEqual(
            elimEntriesToGet[2].player_id
          );
        } else if (elimEntries[i].id === elimEntriesToGet[3].id) {
          expect(elimEntries[i].player_id).toEqual(
            elimEntriesToGet[3].player_id
          );
        } else {
          expect(true).toBe(false);
        }
        expect(
          elimEntries[i].elim_id === elim1Id ||
            elimEntries[i].elim_id === elim2Id
        ).toBeTruthy();
        expect(elimEntries[i].fee).toEqual(elimEntriesToGet[i].fee);
      }
    });
    it("should return 0 elimEntries for not found squad", async () => {
      const elimEntries = await getAllElimEntriesForSquad(notFoundSquadId);
      expect(elimEntries).toHaveLength(0);
    });
    it("should return null if squad id is invalid", async () => {
      try {
        await getAllElimEntriesForSquad('test');
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
      expect(elimEntries).toHaveLength(elimEntriesToGet.length);
      if (!elimEntries) return;
      for (let i = 0; i < elimEntries.length; i++) {
        if (elimEntries[i].id === elimEntriesToGet[0].id) {
          expect(elimEntries[i].player_id).toEqual(
            elimEntriesToGet[0].player_id
          );
        } else if (elimEntries[i].id === elimEntriesToGet[1].id) {
          expect(elimEntries[i].player_id).toEqual(
            elimEntriesToGet[1].player_id
          );
        } else if (elimEntries[i].id === elimEntriesToGet[2].id) {
          expect(elimEntries[i].player_id).toEqual(
            elimEntriesToGet[2].player_id
          );
        } else if (elimEntries[i].id === elimEntriesToGet[3].id) {
          expect(elimEntries[i].player_id).toEqual(
            elimEntriesToGet[3].player_id
          );
        } else {
          expect(true).toBe(false);
        }
        expect(
          elimEntries[i].elim_id === elim1Id ||
            elimEntries[i].elim_id === elim2Id
        ).toBeTruthy();
        expect(elimEntries[i].fee).toEqual(elimEntriesToGet[i].fee);
      }
    });
    it("should return 0 elimEntries for not found div", async () => {
      const elimEntries = await getAllElimEntriesForDiv(notFoundDivId);
      expect(elimEntries).toHaveLength(0);
    });
    it("should return null if div id is invalid", async () => {
      try {
        await getAllElimEntriesForDiv('test');
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
      if (!elimEntries) return;
      for (let i = 0; i < elimEntries.length; i++) {
        if (elimEntries[i].id === elimEntriesToGet[0].id) {
          expect(elimEntries[i].player_id).toEqual(
            elimEntriesToGet[0].player_id
          );
        } else if (elimEntries[i].id === elimEntriesToGet[1].id) {
          expect(elimEntries[i].player_id).toEqual(
            elimEntriesToGet[1].player_id
          );
        } else if (elimEntries[i].id === elimEntriesToGet[2].id) {
          expect(elimEntries[i].player_id).toEqual(
            elimEntriesToGet[2].player_id
          );
        } else if (elimEntries[i].id === elimEntriesToGet[3].id) {
          expect(elimEntries[i].player_id).toEqual(
            elimEntriesToGet[3].player_id
          );
        } else {
          expect(true).toBe(false);
        }
        expect(
          elimEntries[i].elim_id === elim1Id ||
            elimEntries[i].elim_id === elim2Id
        ).toBeTruthy();
        expect(elimEntries[i].fee).toEqual(elimEntriesToGet[i].fee);
      }
    });
    it("should return 0 elimEntries for not found elim", async () => {
      const elimEntries = await getAllElimEntriesForElim(notFoundElimId);
      expect(elimEntries).toHaveLength(0);
    });
    it("should return null if elim id is invalid", async () => {
      try {
        await getAllElimEntriesForElim('test');
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
      const response = await axios.get(url);
      const elimEntrys = response.data.elimEntries;
      const toDel = elimEntrys.find((e: elimEntryType) => e.fee === "3");
      if (toDel) {
        try {
          const delResponse = await axios({
            method: "delete",
            withCredentials: true,
            url: oneElimEntryUrl + toDel.id,
          });
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
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
      if (!postedElimEntry) return;
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
      if (!postedElimEntry) return;
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

  describe("postManyElimEntries()", () => {
    let createdElimEntries = false;

    beforeAll(async () => {
      await deleteAllElimEntriesForTmnt(tmntIdFormMockData);
    });

    beforeEach(() => {
      createdElimEntries = false;
    });

    afterEach(async () => {
      if (createdElimEntries) {
        await deleteAllElimEntriesForTmnt(tmntIdFormMockData);
      }
    });

    afterAll(async () => {
      await deleteAllElimEntriesForTmnt(tmntIdFormMockData);
    });

    it("should post many elimEntries", async () => {
      const count = await postManyElimEntries(mockElimEntriesToPost);
      expect(count).toEqual(mockElimEntriesToPost.length);
      createdElimEntries = true;

      const elimEntries = await getAllElimEntriesForSquad(squadIdForMockData);
      if (!elimEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(elimEntries.length).toEqual(mockElimEntriesToPost.length);
      for (let i = 0; i < mockElimEntriesToPost.length; i++) {
        expect(elimEntries[i].id).toEqual(mockElimEntriesToPost[i].id);
        expect(elimEntries[i].elim_id).toEqual(
          mockElimEntriesToPost[i].elim_id
        );
        expect(elimEntries[i].player_id).toEqual(
          mockElimEntriesToPost[i].player_id
        );
        expect(elimEntries[i].fee).toEqual(mockElimEntriesToPost[i].fee);
      }
    });
    it("should return 0 when passed empty array", async () => {
      const count = await postManyElimEntries([]);
      expect(count).toEqual(0);
    });
    it('should throw error when trying to post many elimEntries with sanitization, fee value sanitized to ""', async () => {
      try {
        const toSanitize = cloneDeep(mockElimEntriesToPost);
        toSanitize[0].fee = "  3  ";
        await postManyElimEntries(toSanitize);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elimEntry data at index 0");
      }    
    });
    it('should throw error when trying to post many elimEntries with invalid data in item 1', async () => {
      try {
        const toSanitize = cloneDeep(mockElimEntriesToPost);
        toSanitize[1].fee = "-1";
        await postManyElimEntries(toSanitize);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elimEntry data at index 1");
      }    
    });
    it('should throw error when trying to post many elimEntries with invalid data in item 2', async () => {
      try {
        const toSanitize = cloneDeep(mockElimEntriesToPost);
        toSanitize[2].fee = "1234567890";
        await postManyElimEntries(toSanitize);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elimEntry data at index 2");
      }    
    });
    it("should throw error when passed a non array", async () => {
      try {
        await postManyElimEntries("not an array" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elimEntries data");
      }
    });
    it("should throw error when passed null", async () => {
      try {
        await postManyElimEntries(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elimEntries data");
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
        const playerJSON = JSON.stringify(resetElimEntry);
        const response = await axios({
          method: "put",
          data: playerJSON,
          withCredentials: true,
          url: putUrl,
        });
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
        }
        await putElimEntry(invalidElimEntry);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "putElimEntry failed: Request failed with status code 422"
        )
      }
    });
    it("should throw error when trying to put a elimEntry with non object passed", async () => {
      try {
        await putElimEntry('not an object' as any)
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elimEntry data")
      }
    });
    it("should throw error when trying to put a elimEntry with null passed", async () => {
      try {
        await putElimEntry(null as any)
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elimEntry data")
      }
    });
  });

  describe("replaceManyElimEntries", () => {
    let createdElimEntries = false;

    beforeAll(async () => {
      await deleteAllElimEntriesForTmnt(tmntIdFormMockData);
    });

    beforeEach(() => {
      createdElimEntries = false;
    });

    afterEach(async () => {
      if (createdElimEntries) {
        await deleteAllElimEntriesForTmnt(tmntIdFormMockData);
      }
    });

    afterAll(async () => {
      await deleteAllElimEntriesForTmnt(tmntIdFormMockData);
    });

    const rmSquadId = 'sqd_1a6c885ee19a49489960389193e8f819';

    it("should update, insert and delete many elimEntries", async () => {
      const toInsert: elimEntryType[] = [
        {
          ...initElimEntry,
          id: "een_03be0472be3d476ea1caa99dd05953fa",
          elim_id: "elm_b4c3939adca140898b1912b75b3725f8",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          fee: "5",
        },
        {
          ...initElimEntry,
          id: "een_04be0472be3d476ea1caa99dd05953fa",
          elim_id: "elm_4f176545e4294a0292732cccada91b9d",
          player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
          fee: "5",
        },
      ];
      const count = await postManyElimEntries(mockElimEntriesToPost);
      expect(count).toEqual(mockElimEntriesToPost.length);
      createdElimEntries = true;
      const elimEntries = await getAllElimEntriesForSquad(rmSquadId);
      expect(elimEntries).not.toBeNull();
      if (!elimEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(elimEntries.length).toBe(mockElimEntriesToPost.length);
      
      const elimEntriesToUpdate = [
        {
          ...mockElimEntriesToPost[0],
          fee: "4",          
        },
        {
          ...mockElimEntriesToPost[1],
          fee: "4",          
        },
        {
          ...toInsert[0],
        },
        {
          ...toInsert[1],
        },
      ];

      const replaceCount = await replaceManyElimEntries(elimEntriesToUpdate, rmSquadId);
      expect(replaceCount).toBe(elimEntriesToUpdate.length);
      const replacedElimEntries = await getAllElimEntriesForSquad(rmSquadId);      
      if (!replacedElimEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedElimEntries.length).toEqual(elimEntriesToUpdate.length);
      for (let i = 0; i < replacedElimEntries.length; i++) {
        if (replacedElimEntries[i].id === elimEntriesToUpdate[0].id) {
          expect(replacedElimEntries[i].fee).toEqual(elimEntriesToUpdate[0].fee);
          expect(replacedElimEntries[i].elim_id).toEqual(elimEntriesToUpdate[0].elim_id);
          expect(replacedElimEntries[i].player_id).toEqual(elimEntriesToUpdate[0].player_id);
        } else if (replacedElimEntries[i].id === elimEntriesToUpdate[1].id) {
          expect(replacedElimEntries[i].fee).toEqual(elimEntriesToUpdate[1].fee);
          expect(replacedElimEntries[i].elim_id).toEqual(elimEntriesToUpdate[1].elim_id);
          expect(replacedElimEntries[i].player_id).toEqual(elimEntriesToUpdate[1].player_id);
        } else if (replacedElimEntries[i].id === elimEntriesToUpdate[2].id) {
          expect(replacedElimEntries[i].fee).toEqual(elimEntriesToUpdate[2].fee);
          expect(replacedElimEntries[i].elim_id).toEqual(elimEntriesToUpdate[2].elim_id);
          expect(replacedElimEntries[i].player_id).toEqual(elimEntriesToUpdate[2].player_id);
        } else if (replacedElimEntries[i].id === elimEntriesToUpdate[3].id) {
          expect(replacedElimEntries[i].fee).toEqual(elimEntriesToUpdate[3].fee);
          expect(replacedElimEntries[i].elim_id).toEqual(elimEntriesToUpdate[3].elim_id);
          expect(replacedElimEntries[i].player_id).toEqual(elimEntriesToUpdate[3].player_id);
        } else { 
          expect(true).toBeFalsy();
        }
      }
    });
    it('should return 0 when passed empty array', async () => { 
      const count = await postManyElimEntries(mockElimEntriesToPost);
      expect(count).toEqual(mockElimEntriesToPost.length);
      createdElimEntries = true;
      const elimEntries = await getAllElimEntriesForSquad(rmSquadId);
      expect(elimEntries).not.toBeNull();
      if (!elimEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(elimEntries.length).toBe(mockElimEntriesToPost.length);

      const replaceCount = await replaceManyElimEntries([], rmSquadId);
      expect(replaceCount).toBe(0);
      const replacedElimEntries = await getAllElimEntriesForSquad(rmSquadId);
      if (!replacedElimEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedElimEntries.length).toEqual(0);      
    })
    it("should update no elim Entries when error in data", async () => {
      const count = await postManyElimEntries(mockElimEntriesToPost);
      expect(count).toEqual(mockElimEntriesToPost.length);
      createdElimEntries = true;
      const elimEntries = await getAllElimEntriesForSquad(rmSquadId);
      expect(elimEntries).not.toBeNull();
      if (!elimEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(elimEntries.length).toBe(mockElimEntriesToPost.length);
      const elimEntriesToUpdate = [
        {
          ...mockElimEntriesToPost[0],
          id: "test",
        },
        {
          ...mockElimEntriesToPost[1],
        },
        {
          ...mockElimEntriesToPost[2],
        },
        {
          ...mockElimEntriesToPost[3],
        },
      ];
      await expect(replaceManyElimEntries(elimEntriesToUpdate, rmSquadId)).rejects.toThrow(
        "Invalid elimEntry data at index 0"
      );
    });
    it("should update no elim Entries when error in data in second item", async () => {
      const count = await postManyElimEntries(mockElimEntriesToPost);
      expect(count).toEqual(mockElimEntriesToPost.length);
      createdElimEntries = true;
      const elimEntries = await getAllElimEntriesForSquad(rmSquadId);
      expect(elimEntries).not.toBeNull();
      if (!elimEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(elimEntries.length).toBe(mockElimEntriesToPost.length);
      const elimEntriesToUpdate = [
        {
          ...mockElimEntriesToPost[0],          
        },
        {
          ...mockElimEntriesToPost[1],
          fee: '-1'
        },
        {
          ...mockElimEntriesToPost[2],
        },
        {
          ...mockElimEntriesToPost[3],
        },
      ];
      await expect(replaceManyElimEntries(elimEntriesToUpdate, rmSquadId)).rejects.toThrow(
        "Invalid elimEntry data at index 1"
      );      
    });
    it("should throw an error if passed null as elimEntries", async () => {
      await expect(replaceManyElimEntries(null as any, rmSquadId)).rejects.toThrow(
        "Invalid elimEntries"
      );
    });
    it("should throw an error if elimEntries is not an array", async () => {
      await expect(replaceManyElimEntries("not-an-array" as any, rmSquadId)).rejects.toThrow(
        "Invalid elimEntries"
      );
    });
    it("should throw an error if passed null as squadId", async () => {
      await expect(replaceManyElimEntries(mockElimEntriesToPost, null as any)).rejects.toThrow(
        "Invalid squad id"
      );
    });
    it("should throw an error if passed invalid squadId", async () => {
      await expect(replaceManyElimEntries(mockElimEntriesToPost, 'test')).rejects.toThrow(
        "Invalid squad id"
      );
    });
    it("should throw an error if passed valid id, but not squad id", async () => {
      await expect(replaceManyElimEntries(mockElimEntriesToPost, userId)).rejects.toThrow(
        "Invalid squad id"
      );
    });

  });

  describe("deleteElimEntry()", () => {
    // toDel is data from prisma/seeds.ts
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

  describe("deleteAllElimEntriesForSquad()", () => {
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
      // cleanup after tests
    });

    it("should delete all elimEntries for a squad", async () => {
      const deleted = await deleteAllElimEntriesForSquad(squadIdForMockData);
      expect(deleted).toBe(mockElimEntriesToPost.length);
      didDel = true;
    });
    it("should not delete all elimEntries for a squad when squad id is not found", async () => {
      const deleted = await deleteAllElimEntriesForSquad(notFoundSquadId);
      expect(deleted).toBe(0);
    });
    it("should throw error and not delete all elimEntries for a squad when squad id is invalid", async () => {
      try {
        await deleteAllElimEntriesForSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should not delete all elimEntries for a squad when squad id is valid, but not a squad id", async () => {
      try {
        await deleteAllElimEntriesForSquad(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should not delete all elimEntries for a squad when squad id is null", async () => {
      try {
        await deleteAllElimEntriesForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
  });

  describe("deleteAllElimEntriesForDiv()", () => {
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
      // cleanup after tests
    });

    it("should delete all elimEntries for a div", async () => {
      const deleted = await deleteAllElimEntriesForDiv(divIdForMockData);
      expect(deleted).toBe(mockElimEntriesToPost.length);
      didDel = true;
    });
    it("should not delete all elimEntries for a div when div id is not found", async () => {
      const deleted = await deleteAllElimEntriesForDiv(notFoundDivId);
      expect(deleted).toBe(0);
    });
    it("should not delete all elimEntries for a div when div id is invalid", async () => {
      try {
        await deleteAllElimEntriesForDiv("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should not delete all elimEntries for a div when div id is valid, but not a div id", async () => {
      try {
        await deleteAllElimEntriesForDiv(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should not delete all elimEntries for a div when div id is null", async () => {
      try {
        await deleteAllElimEntriesForDiv(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
  });

  describe("deleteAllElimEntriesForBrkt()", () => {
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
      await deleteAllElimEntriesForTmnt(tmntIdFormMockData);
    });

    afterAll(async () => {
      await deleteAllElimEntriesForTmnt(tmntIdFormMockData);
    });

    it("should delete all elimEntries for a elim", async () => {
      const deleted = await deleteAllElimEntriesForElim(elimIdForMockData);
      expect(deleted).toBe(2); // only 2 of the 4 mock elimEntries were deleted
      didDel = true;
    });
    it("should not delete all elimEntries for a elim when elim id is not found", async () => {
      const deleted = await deleteAllElimEntriesForElim(notFoundElimId);
      expect(deleted).toBe(0);
    });
    it("should not delete all elimEntries for a elim when elim id is invalid", async () => {
      try {
        await deleteAllElimEntriesForElim("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elim id");
      }
    });
    it("should not delete all elimEntries for a elim when elim id is valid, but not a elim id", async () => {
      try {
        await deleteAllElimEntriesForElim(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elim id");
      }
    });
    it("should not delete all elimEntries for a elim when elim id is null", async () => {
      try {
        await deleteAllElimEntriesForElim(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elim id");
      }
    });
  });

  describe("deleteAllElimEntriesForTmnt()", () => {
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
      deleteAllElimEntriesForTmnt(tmntIdFormMockData);
    });

    it("should delete all elimEntries for a tmnt", async () => {
      const deleted = await deleteAllElimEntriesForTmnt(tmntIdFormMockData);
      expect(deleted).toBe(mockElimEntriesToPost.length);
      didDel = true;
    });
    it("should not delete all elimEntries for a tmnt when tmnt id is not found", async () => {
      const deleted = await deleteAllElimEntriesForTmnt(notFoundTmntId);
      expect(deleted).toBe(0);
    });
    it("should not delete all elimEntries for a tmnt when tmnt id is invalid", async () => {
      try {
        await deleteAllElimEntriesForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should not delete all elimEntries for a tmnt when tmnt id is valid, but not a tmnt id", async () => {
      try {
        await deleteAllElimEntriesForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should not delete all elimEntries for a tmnt when tmnt id is null", async () => {
      try {
        await deleteAllElimEntriesForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });
});
