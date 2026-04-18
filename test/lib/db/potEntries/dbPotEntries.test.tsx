import axios, { AxiosError } from "axios";
import { basePotEntriesApi } from "@/lib/api/apiPaths";
import { testBasePotEntriesApi } from "../../../testApi";
import type { potEntryType } from "@/lib/types/types";
import { initPotEntry } from "@/lib/db/initVals";
import {
  deletePotEntry,
  getAllPotEntriesForDiv,
  getAllPotEntriesForSquad,
  getAllPotEntriesForTmnt,
  postPotEntry,  
  putPotEntry,
  extractPotEntries,
} from "@/lib/db/potEntries/dbPotEntries";
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
const url = process.env.NODE_ENV === "test" && testBasePotEntriesApi
  ? testBasePotEntriesApi
  : basePotEntriesApi;

const potEntryUrl = url + "/potEntry/";

const potEntriesToGet: potEntryType[] = [
  {
    ...initPotEntry,
    id: "pen_648e5b64809d441c99815929cf7c66e0",
    pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    fee: "20",
  },
  {
    ...initPotEntry,
    id: "pen_4aea7a841d464fb1b7b07c66a5b08cde",
    pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
    player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
    fee: "20",
  },
  {
    ...initPotEntry,
    id: "pen_4d9729b59b844d448be85e4cb61ba47a",
    pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
    player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
    fee: "20",
  },
  {
    ...initPotEntry,
    id: "pen_6bbbeae1989b4bdaa6880c873cbe02ba",
    pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
    player_id: "ply_8b0fd8bbd9e34d34a7fa90b4111c6e40",
    fee: "20",
  },
];

const potEntryToPost: potEntryType = {
  ...initPotEntry,
  id: "pen_1234567890abcdef1234567890abcdef",
  pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
  player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
  fee: "22",
};

const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const divId = "div_f30aea2c534f4cfe87f4315531cef8ef";

const notFoundId = "pen_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

describe("dbPotEntries", () => {
  const rePostPotEntry = async (potEntry: potEntryType) => {
    try {
      // if potEntry already in database, then don't re-post
      const getResponse = await axios.get(potEntryUrl + potEntry.id);
      const found = getResponse.data.potEntry;
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
      const potEntryJSON = JSON.stringify(potEntry);
      await axios.post(url, potEntryJSON, { withCredentials: true });
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  const deletePostedPotEntry = async (id: string) => {
    try {
      axios.delete(potEntryUrl + id, { withCredentials: true });
    } catch (err) {
      if (err instanceof Error) console.log(err.message);
    }
  }

  describe("extractPotEntries", () => {

    beforeAll(async () => {
      await deletePostedPotEntry(potEntryToPost.id);
    });

    it("should return an empty array when given an empty array", () => {
      const result = extractPotEntries([]);
      expect(result).toEqual([]);
    });

    it("should correctly map raw potEntries to potEntryType", () => {
      const rawPotEntries = [
        {
          id: 'pen_123',
          pot_id: 'pot_123',
          player_id: 'ply_123',
          fee: 20,
          extraField: "ignore me", // should be ignored
        },
      ];

      const result = extractPotEntries(rawPotEntries);

      const expected: potEntryType = {
        ...initPotEntry,
        id: "pen_123",
        pot_id: 'pot_123',
        player_id: 'ply_123',
        fee: '20',
      };

      expect(result).toEqual([expected]);
    });
    it("should fill missing fields with defaults from blankPotEntry", () => {
      const rawPotEntries = [
        {
          id: 'pen_123',
          pot_id: 'pot_123',
          player_id: 'ply_123',
          fee: 20,
        },
      ];

      const result = extractPotEntries(rawPotEntries);

      // every *_err field should be blank string
      expect(result[0].pot_id_err).toBe("");
      expect(result[0].player_id_err).toBe("");
      expect(result[0].fee_err).toBe("");
    });
    it("should process multiple potEntries", () => {
      const rawPotEntries = [
        {
          id: 'pen_123',
          pot_id: 'pot_123',
          player_id: 'ply_123',
          fee: 20,
        },
        {
          id: 'pen_124',
          pot_id: 'pot_123',
          player_id: 'ply_124',
          fee: 20,
        },
      ];

      const result = extractPotEntries(rawPotEntries);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("pen_123");
      expect(result[0].player_id).toBe("ply_123");
      expect(result[1].id).toBe("pen_124");
      expect(result[1].player_id).toBe("ply_124");
    });
    it('should return an empty array when given null', () => {
      const result = extractPotEntries(null);
      expect(result).toEqual([]);
    });
    it('should return an empty array when given a non-array', () => {
      const result = extractPotEntries('not an array');
      expect(result).toEqual([]);
    })
  });

  describe("getAllPotEntriesForTmnt()", () => {

    beforeAll(async () => {
      await deletePostedPotEntry(potEntryToPost.id);
    });

    it("should get all potEntries for tmnt", async () => {
      const potEntries = await getAllPotEntriesForTmnt(tmntId);
      expect(potEntries).toHaveLength(potEntriesToGet.length);
      if (!potEntries) return;
      for (let i = 0; i < potEntries.length; i++) {
        if (potEntries[i].id === potEntriesToGet[0].id) {
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[0].player_id);
        } else if (potEntries[i].id === potEntriesToGet[1].id) {
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[1].player_id);
        } else if (potEntries[i].id === potEntriesToGet[2].id) {
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[2].player_id);
        } else if (potEntries[i].id === potEntriesToGet[3].id) {
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[3].player_id);
        } else {
          expect(true).toBe(false);
        }
        expect(potEntries[i].pot_id).toEqual(potEntriesToGet[i].pot_id);
        expect(potEntries[i].fee).toEqual(potEntriesToGet[i].fee);
      }
    });
    it("should return 0 potEntries for not found tmnt", async () => {
      const potEntries = await getAllPotEntriesForTmnt(notFoundTmntId);
      expect(potEntries).toHaveLength(0);
    });
    it("should throw error if tmmt id is invalid", async () => {
      try {
        await getAllPotEntriesForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error if tmnt id is a valid id, but not a tmnt id", async () => {
      try {
        await getAllPotEntriesForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error if tmnt id is null", async () => {
      try {
        await getAllPotEntriesForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });

  describe("getAllPotEntriesForDiv()", () => {

    beforeAll(async () => {
      await deletePostedPotEntry(potEntryToPost.id);
    });

    it("should get all potEntries for div", async () => {
      const potEntries = await getAllPotEntriesForDiv(divId);
      expect(potEntries).toHaveLength(potEntriesToGet.length);
      if (!potEntries) return;
      for (let i = 0; i < potEntries.length; i++) {
        if (potEntries[i].id === potEntriesToGet[0].id) {
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[0].player_id);
        } else if (potEntries[i].id === potEntriesToGet[1].id) {
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[1].player_id);
        } else if (potEntries[i].id === potEntriesToGet[2].id) {
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[2].player_id);
        } else if (potEntries[i].id === potEntriesToGet[3].id) {
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[3].player_id);
        } else {
          expect(true).toBe(false);
        }
        expect(potEntries[i].pot_id).toEqual(potEntriesToGet[i].pot_id);
        expect(potEntries[i].fee).toEqual(potEntriesToGet[i].fee);
      }
    });
    it("should return 0 potEntries for not found div", async () => {
      const potEntries = await getAllPotEntriesForDiv(notFoundDivId);
      expect(potEntries).toHaveLength(0);
    });
    it("should throw error if div id is invalid", async () => {
      try {
        await getAllPotEntriesForDiv("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should throw error if div id is a valid id, but not a div id", async () => {
      try {
        await getAllPotEntriesForDiv(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should throw error if div id is null", async () => {
      try {
        await getAllPotEntriesForDiv(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
  });
  
  describe("getAllPotEntriesForSquad()", () => {

    beforeAll(async () => {
      await deletePostedPotEntry(potEntryToPost.id);
    });

    it("should get all potEntries for squad", async () => {
      const potEntries = await getAllPotEntriesForSquad(squadId);
      expect(potEntries).toHaveLength(potEntriesToGet.length);
      if (!potEntries) return;
      for (let i = 0; i < potEntries.length; i++) {
        // all pot_id's and fee's should be the same
        expect(potEntries[i].pot_id).toEqual(potEntriesToGet[0].pot_id);
        expect(potEntries[i].fee).toEqual(potEntriesToGet[0].fee);
        if (potEntries[i].id === potEntriesToGet[0].id) {
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[0].player_id);
        } else if (potEntries[i].id === potEntriesToGet[1].id) {
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[1].player_id);
        } else if (potEntries[i].id === potEntriesToGet[2].id) {
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[2].player_id);
        } else if (potEntries[i].id === potEntriesToGet[3].id) {
          expect(potEntries[i].player_id).toEqual(potEntriesToGet[3].player_id);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should return 0 potEntries for not found squad", async () => {
      const potEntries = await getAllPotEntriesForSquad(notFoundSquadId);
      expect(potEntries).toHaveLength(0);
    });
    it("should throw error if squad id is invalid", async () => {
      try {
        await getAllPotEntriesForSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should throw error if squad id is a valid id, but not a squad id", async () => {
      try {
        await getAllPotEntriesForSquad(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should throw error if squad id is null", async () => {
      try {
        await getAllPotEntriesForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
  });

  describe("postPotEntry()", () => {

    let createdPotEntry = false;

    beforeAll(async () => {
      await deletePostedPotEntry(potEntryToPost.id);
    });

    beforeEach(() => {
      createdPotEntry = false;
    });

    afterEach(async () => {
      if (createdPotEntry) {
        await deletePostedPotEntry(potEntryToPost.id);
      }
    });

    it("should post one potEntry", async () => {
      const postedPotEntry = await postPotEntry(potEntryToPost);
      expect(postedPotEntry).not.toBeNull();
      if (!postedPotEntry) return;
      createdPotEntry = true;
      expect(postedPotEntry.id).toEqual(potEntryToPost.id);
      expect(postedPotEntry.pot_id).toEqual(potEntryToPost.pot_id);
      expect(postedPotEntry.player_id).toEqual(potEntryToPost.player_id);
      expect(postedPotEntry.fee).toEqual(potEntryToPost.fee);
    });
    it("should post a sanitzed potEntry", async () => {
      const toSanitizse = {
        ...potEntryToPost,
        fee: "22.000",
      };
      const postedPotEntry = await postPotEntry(toSanitizse);
      expect(postedPotEntry).not.toBeNull();
      if (!postedPotEntry) return;
      createdPotEntry = true;
      expect(postedPotEntry.id).toEqual(toSanitizse.id);
      expect(postedPotEntry.pot_id).toEqual(toSanitizse.pot_id);
      expect(postedPotEntry.player_id).toEqual(toSanitizse.player_id);
      expect(postedPotEntry.fee).toEqual("22");
    });
    it("should throw error and not post a potEntry if got invalid data", async () => {
      try {
        const invalidPotEntry = {
          ...potEntryToPost,
          fee: "-1",
        };
        await postPotEntry(invalidPotEntry);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "postPotEntry failed: Request failed with status code 422"
        );
      }
    });
    it("should throw error when post a potEntry if got null", async () => {
      try {
        await postPotEntry(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid potEntry data");
      }
    });
    it("should throw error when post a potEntry if got not an object", async () => {
      try {
        await postPotEntry("test" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid potEntry data");
      }
    });
  });

  describe("putPotEntry()", () => {
    const potEntryToPut = {
      ...initPotEntry,
      id: "pen_648e5b64809d441c99815929cf7c66e0",
      pot_id: "pot_791fb6d8a9a04cb4b3372e212da2a3b0",
      player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
      fee: "23",
    };    

    const resetPotEntry = {
      ...initPotEntry,
      id: "pen_648e5b64809d441c99815929cf7c66e0",
      pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
      player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
      fee: "20",
    };

    const doReset = async () => {
      try {
        const playerJSON = JSON.stringify(resetPotEntry);
        await axios.put(potEntryUrl + potEntryToPut.id, playerJSON, {
          withCredentials: true,
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

    it("should put a potEntry", async () => {
      const puttedPotEntry = await putPotEntry(potEntryToPut);
      expect(puttedPotEntry).not.toBeNull();
      if (!puttedPotEntry) return;
      didPut = true;
      expect(puttedPotEntry.pot_id).toBe(potEntryToPut.pot_id);
      expect(puttedPotEntry.player_id).toBe(potEntryToPut.player_id);
      expect(puttedPotEntry.fee).toBe(potEntryToPut.fee);
    });
    it('should throw error and not put a potEntry with sanitization, fee value sanitized to ""', async () => {
      try {
        const toSanitize = cloneDeep(potEntryToPut);
        toSanitize.fee = "  23  ";
        await putPotEntry(toSanitize);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "putPotEntry failed: Request failed with status code 422"
        );
      }
    });
    it("shouyld throw error and not put a potEntry with invalid potEntry id", async () => {
      try {
        const invalidPotEntry = {
          ...potEntryToPut,
          id: "test",
        };
        await putPotEntry(invalidPotEntry);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid potEntry data");
      }
    });
    it("shouyld throw error and not put a potEntry with invalid data", async () => {
      try {
        const invalidPotEntry = {
          ...potEntryToPut,
          fee: "-1",
        };
        await putPotEntry(invalidPotEntry);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "putPotEntry failed: Request failed with status code 422"
        );
      }
    });
    it("shouyld throw error and not put a potEntry when passed null", async () => {
      try {
        await putPotEntry(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid potEntry data");
      }
    });
    it("shouyld throw error put a potEntry when passed a non object", async () => {
      try {
        await putPotEntry("test" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid potEntry data");
      }
    });
  });

  describe("deletePotEntry()", () => {
    // toDel is data from prisma/seeds.ts
    const toDel = {
      ...initPotEntry,
      id: "pen_8c8b607b7ebb4e84a0753307afce256e",
      pot_id: "pot_791fb6d8a9a04cb4b3372e212da2a3b0",
      player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
      fee: "20",
    };

    let didDel = false;

    beforeAll(async () => {
      await rePostPotEntry(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostPotEntry(toDel);
      }
    });

    it("should delete a potEntry", async () => {
      const deleted = await deletePotEntry(toDel.id);
      expect(deleted).toBe(1);
      didDel = true;
    });
    it('should throw error and not delete a potEntry when id is not found', async () => {
      try { 
        await deletePotEntry(notFoundId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('deletePotEntry failed: Request failed with status code 404');
      }
    })
    it("should throw error and not delete a potEntry when id is invalid", async () => {
      try {
        await deletePotEntry("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid potEntry id");
      }
    });
    it("should throw error and not delete a potEntry when id is valid, but not a potEntry id", async () => {
      try {
        await deletePotEntry(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid potEntry id");
      }
    });
    it("should throw error and not delete a potEntry when id is null", async () => {
      try {
        await deletePotEntry(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid potEntry id");
      }
    });
  });

});
