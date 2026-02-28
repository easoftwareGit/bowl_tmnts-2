import axios, { AxiosError } from "axios";
import { basePotEntriesApi } from "@/lib/api/apiPaths";
import { testBasePotEntriesApi } from "../../../testApi";
import type { potEntryType } from "@/lib/types/types";
import { initPotEntry } from "@/lib/db/initVals";
import { mockPotEntriesToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import {
  deleteAllPotEntriesForDiv,
  deleteAllPotEntriesForSquad,
  deleteAllPotEntriesForTmnt,
  deletePotEntry,
  getAllPotEntriesForDiv,
  getAllPotEntriesForSquad,
  getAllPotEntriesForTmnt,
  postManyPotEntries,
  postPotEntry,  
  putPotEntry,
  extractPotEntries,
} from "@/lib/db/potEntries/dbPotEntries";
import { replaceManyPotEntries } from "@/lib/db/potEntries/dbPotEntriesReplaceMany";
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

const url = testBasePotEntriesApi.startsWith("undefined")
  ? basePotEntriesApi
  : testBasePotEntriesApi;
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

const tmntIdForMockData = 'tmt_56d916ece6b50e6293300248c6792316';
const divIdForMockData = 'div_1f42042f9ef24029a0a2d48cc276a087';
const squadIdForMockData = 'sqd_1a6c885ee19a49489960389193e8f819';

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
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: potEntryJSON,
      });
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  const rePostToDel = async () => {
    const response = await axios.get(url);
    const potEntries = response.data.potEntries;
    const foundToDel = potEntries.find(
      (p: potEntryType) => p.id === mockPotEntriesToPost[0].id
    );
    if (!foundToDel) {
      try {
        await postManyPotEntries(mockPotEntriesToPost);
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }
  };

  describe("extractPotEntries", () => {
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
    const potEntryToPost: potEntryType = {
      ...initPotEntry,
      id: "pen_008e5b64809d441c99815929cf7c66e0",
      pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
      player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
      fee: "22",
    };

    let createdPotEntry = false;

    const deletePostedPotEntry = async () => {
      const response = await axios.get(url);
      const potEntrys = response.data.potEntries;
      const toDel = potEntrys.find((p: potEntryType) => p.fee === "22");
      if (toDel) {
        try {
          const delResponse = await axios({
            method: "delete",
            withCredentials: true,
            url: potEntryUrl + toDel.id,
          });
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    };

    beforeAll(async () => {
      await deletePostedPotEntry();
    });

    beforeEach(() => {
      createdPotEntry = false;
    });

    afterEach(async () => {
      if (createdPotEntry) {
        await deletePostedPotEntry();
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

  describe("postManyPotEntries()", () => {
    let createdPotEntries = false;

    beforeAll(async () => {
      await deleteAllPotEntriesForSquad(squadIdForMockData);
    });

    beforeEach(() => {
      createdPotEntries = false;
    });

    afterEach(async () => {
      if (createdPotEntries) {
        await deleteAllPotEntriesForSquad(squadIdForMockData);
      }
    });

    afterAll(async () => {
      await deleteAllPotEntriesForSquad(squadIdForMockData);
    });

    it("should post many potEntries", async () => {
      const count = await postManyPotEntries(mockPotEntriesToPost);
      expect(count).toBe(mockPotEntriesToPost.length);
      createdPotEntries = true;
      const potEntries = await getAllPotEntriesForSquad(squadIdForMockData);
      if (!potEntries) {
        expect(true).toBeFalsy;
        return;
      }
      expect(potEntries.length).toEqual(mockPotEntriesToPost.length);
      for (let i = 0; i < mockPotEntriesToPost.length; i++) {
        expect(potEntries[i].id).toEqual(mockPotEntriesToPost[i].id);
        expect(potEntries[i].pot_id).toEqual(mockPotEntriesToPost[i].pot_id);
        // expect(potEntries[i].player_id).toEqual(
        //   mockPotEntriesToPost[i].player_id
        // );
        expect(potEntries[i].fee).toEqual(mockPotEntriesToPost[i].fee);
        if (potEntries[i].player_id === mockPotEntriesToPost[0].player_id) {          
          // nothing else to check
        } else if (potEntries[i].player_id === mockPotEntriesToPost[1].player_id) {          
        } else if (potEntries[i].player_id === mockPotEntriesToPost[2].player_id) {          
        } else if (potEntries[i].player_id === mockPotEntriesToPost[3].player_id) {          
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should return 0 if passed an empty array", async () => {
      const count = await postManyPotEntries([]);
      expect(count).toBe(0);
    });
    it('should throw error and not post many potEntries with sanitization, fee value sanitized to ""', async () => {
      try { 
        const toSanitize = cloneDeep(mockPotEntriesToPost);
        toSanitize[0].fee = "  84  ";
        await postManyPotEntries(toSanitize);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid potEntry data at index 0");
      }      
    });
    it("should throw error and not post many potEntries with invalid potEntry id item 0", async () => {
      try { 
        const invalidPotEntries = cloneDeep(mockPotEntriesToPost);
        invalidPotEntries[0].id = 'test';
        const count = await postManyPotEntries(invalidPotEntries);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid potEntry data at index 0");
      }
    });
    it("should throw error and not post many potEntries with invalid potEntry id item 1", async () => {
      try { 
        const invalidPotEntries = cloneDeep(mockPotEntriesToPost);
        invalidPotEntries[1].id = 'test';
        const count = await postManyPotEntries(invalidPotEntries);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid potEntry data at index 1");
      }
    });
    it('should throw error and not post many potEntries with sanitization, fee value sanitized to ""', async () => {
      try { 
        const toSanitize = cloneDeep(mockPotEntriesToPost);
        toSanitize[0].fee = "  84  ";
        await postManyPotEntries(toSanitize);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid potEntry data at index 0");
      }      
    });
    it("should throw error and not post many potEntries with invalid data in item 1", async () => {
      try { 
        const invalidPotEntries = cloneDeep(mockPotEntriesToPost);
        invalidPotEntries[1].fee = "-1";
        const count = await postManyPotEntries(invalidPotEntries);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid potEntry data at index 1");
      }
    });
    it("should throw error when passed an non array", async () => {
      try {
        await postManyPotEntries("not an array" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid potEntries data");
      }
    });
    it("should throw error when passed null", async () => {
      try {
        await postManyPotEntries(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid potEntries data");
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

    const putUrl = potEntryUrl + potEntryToPut.id;

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

  describe("replaceManyPotEntries()", () => {    

    const rmSquadId = squadIdForMockData
  
    let createdPotEntries = false;

    beforeAll(async () => {      
      // clean up from previous tests 
      await deleteAllPotEntriesForSquad(rmSquadId);  // also deletes all potEntries
    });

    beforeEach(() => {
      createdPotEntries = false;      
    });

    afterEach(async () => {
      if (createdPotEntries) {
        await deleteAllPotEntriesForSquad(rmSquadId);
      }
    });

    afterAll(async () => {
      await deleteAllPotEntriesForSquad(rmSquadId);
    });

    it("should update, insert, delete many potEntries", async () => {
      const toInsert: potEntryType[] = [
        {
          ...initPotEntry,
          id: 'pen_05be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          player_id: 'ply_bb1fd8bbd9e34d34a7fa90b4111c6e40',
          fee: '20'
        },
        {
          ...initPotEntry,
          id: 'pen_06be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          player_id: 'ply_bb2fd8bbd9e34d34a7fa90b4111c6e40',
          fee: '20'
        },
      ];

      const count = await postManyPotEntries(mockPotEntriesToPost);
      expect(count).toBe(mockPotEntriesToPost.length);
      createdPotEntries = true;
      const potEntries = await getAllPotEntriesForSquad(rmSquadId);
      if (!potEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(potEntries.length).toEqual(mockPotEntriesToPost.length);

      const potEntriesToUpdate = [
        {
          ...mockPotEntriesToPost[0],
          player_id: 'ply_bb0fd8bbd9e34d34a7fa90b4111c6e40',
        },
        {
          ...mockPotEntriesToPost[1],
          player_id: 'ply_a13758cff1cc4bab9d9133e661bd49b0'
        },
        {
          ...toInsert[0],
        },
        {
          ...toInsert[1],
        },
      ];

      const replaceCount = await replaceManyPotEntries(potEntriesToUpdate, rmSquadId);
      expect(replaceCount).toBe(potEntriesToUpdate.length);
      const replacedPotEntries = await getAllPotEntriesForSquad(rmSquadId);
      if (!replacedPotEntries) {
        expect(true).toBeFalsy();        
      }
      expect(replacedPotEntries.length).toEqual(potEntriesToUpdate.length);
      for (let i = 0; i < replacedPotEntries.length; i++) {
        expect(replacedPotEntries[i].pot_id).toEqual(potEntriesToUpdate[i].pot_id);
        expect(replacedPotEntries[i].fee).toEqual(potEntriesToUpdate[i].fee);
        if (replacedPotEntries[i].id === potEntriesToUpdate[0].id) {
          expect(replacedPotEntries[i].player_id).toEqual(
            potEntriesToUpdate[0].player_id
          );
        } else if (replacedPotEntries[i].id === potEntriesToUpdate[1].id) {
          expect(replacedPotEntries[i].player_id).toEqual(
            potEntriesToUpdate[1].player_id
          )
        } else if (replacedPotEntries[i].id === potEntriesToUpdate[2].id) {
          expect(replacedPotEntries[i].player_id).toEqual(
            potEntriesToUpdate[2].player_id
          )
        } else if (replacedPotEntries[i].id === potEntriesToUpdate[3].id) {
          expect(replacedPotEntries[i].player_id).toEqual(
            potEntriesToUpdate[3].player_id
          )
        } else {
          expect(true).toBefalsey();
        }
      }
    });
    it("should replace many potEntries - sanitized fee", async () => {
      const count = await postManyPotEntries(mockPotEntriesToPost);
      expect(count).toBe(mockPotEntriesToPost.length);
      createdPotEntries = true;
      const potEntries = await getAllPotEntriesForSquad(rmSquadId);
      if (!potEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(potEntries.length).toEqual(mockPotEntriesToPost.length);

      const potEntriesToUpdate = [
        {
          ...mockPotEntriesToPost[0],
          fee: '20.000'
        },
        {
          ...mockPotEntriesToPost[1],
        },
        {
          ...mockPotEntriesToPost[2],
        },
        {
          ...mockPotEntriesToPost[3],
        },
      ];

      const replaceCount = await replaceManyPotEntries(potEntriesToUpdate, rmSquadId);
      expect(replaceCount).toBe(potEntriesToUpdate.length);
      const replacedPotEntries = await getAllPotEntriesForSquad(rmSquadId);
      if (!replacedPotEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedPotEntries.length).toEqual(potEntriesToUpdate.length);
      for (let i = 0; i < replacedPotEntries.length; i++) {
        expect(replacedPotEntries[i].pot_id).toEqual(potEntriesToUpdate[i].pot_id);
        expect(replacedPotEntries[i].fee).toEqual("20");
        if (replacedPotEntries[i].id === potEntriesToUpdate[0].id) {
          expect(replacedPotEntries[i].player_id).toEqual(
            potEntriesToUpdate[0].player_id
          );
        } else if (replacedPotEntries[i].id === potEntriesToUpdate[1].id) {
          expect(replacedPotEntries[i].player_id).toEqual(
            potEntriesToUpdate[1].player_id
          )
        } else if (replacedPotEntries[i].id === potEntriesToUpdate[2].id) {
          expect(replacedPotEntries[i].player_id).toEqual(
            potEntriesToUpdate[2].player_id
          )
        } else if (replacedPotEntries[i].id === potEntriesToUpdate[3].id) {
          expect(replacedPotEntries[i].player_id).toEqual(
            potEntriesToUpdate[3].player_id
          )
        } else {
          expect(true).toBefalsey();
        }
      }
    });
    it("should return 0 when passed an empty array", async () => {
      const count = await postManyPotEntries(mockPotEntriesToPost);
      expect(count).toBe(mockPotEntriesToPost.length);
      createdPotEntries = true;
      const potEntries = await getAllPotEntriesForSquad(rmSquadId);
      if (!potEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(potEntries.length).toEqual(mockPotEntriesToPost.length);

      const replaceCount = await replaceManyPotEntries([], rmSquadId);
      expect(replaceCount).toBe(0);
      const replacedPotEntries = await getAllPotEntriesForSquad(rmSquadId);      
      if (!replacedPotEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedPotEntries.length).toEqual(0);
    });
    it("should throw an error for invalid potEntry ID in first item", async () => {
      const count = await postManyPotEntries(mockPotEntriesToPost);
      expect(count).toBe(mockPotEntriesToPost.length);
      createdPotEntries = true;
      const potEntries = await getAllPotEntriesForSquad(rmSquadId);
      if (!potEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(potEntries.length).toEqual(mockPotEntriesToPost.length);

      const potEntriesToUpdate = [
        {
          ...mockPotEntriesToPost[0],
          id: "",
        },
        {
          ...mockPotEntriesToPost[1],
        },
        {
          ...mockPotEntriesToPost[2],
        },
        {
          ...mockPotEntriesToPost[3],
        },
      ];
      await expect(
        replaceManyPotEntries(potEntriesToUpdate, rmSquadId)
      ).rejects.toThrow("Invalid potEntry data at index 0");
    });
    it("should throw an error for invalid potEntry ID in third item", async () => {
      const count = await postManyPotEntries(mockPotEntriesToPost);
      expect(count).toBe(mockPotEntriesToPost.length);
      createdPotEntries = true;
      const potEntries = await getAllPotEntriesForSquad(rmSquadId);
      if (!potEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(potEntries.length).toEqual(mockPotEntriesToPost.length);

      const potEntriesToUpdate = [
        {
          ...mockPotEntriesToPost[0],          
        },
        {
          ...mockPotEntriesToPost[1],
        },
        {
          ...mockPotEntriesToPost[2],
          id: "",
        },
        {
          ...mockPotEntriesToPost[3],
        },
      ];
      await expect(
        replaceManyPotEntries(potEntriesToUpdate, rmSquadId)
      ).rejects.toThrow("Invalid potEntry data at index 2");
    });
    it("should throw an error for invalid potEntry data in first item", async () => {
      const count = await postManyPotEntries(mockPotEntriesToPost);
      expect(count).toBe(mockPotEntriesToPost.length);
      createdPotEntries = true;
      const potEntries = await getAllPotEntriesForSquad(rmSquadId);
      if (!potEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(potEntries.length).toEqual(mockPotEntriesToPost.length);

      const potEntriesToUpdate = [
        {
          ...mockPotEntriesToPost[0],
          fee: "-1",
        },
        {
          ...mockPotEntriesToPost[1],
        },
        {
          ...mockPotEntriesToPost[2],
        },
        {
          ...mockPotEntriesToPost[3],
        },
      ];
      await expect(
        replaceManyPotEntries(potEntriesToUpdate, rmSquadId)
      ).rejects.toThrow("Invalid potEntry data at index 0");
    });
    it("should throw an error for invalid potEntry data in second item", async () => {
      const count = await postManyPotEntries(mockPotEntriesToPost);
      expect(count).toBe(mockPotEntriesToPost.length);
      createdPotEntries = true;
      const potEntries = await getAllPotEntriesForSquad(rmSquadId);
      if (!potEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(potEntries.length).toEqual(mockPotEntriesToPost.length);

      const potEntriesToUpdate = [
        {
          ...mockPotEntriesToPost[0],          
        },
        {
          ...mockPotEntriesToPost[1],
          fee: "1234567890",
        },
        {
          ...mockPotEntriesToPost[2],
        },
        {
          ...mockPotEntriesToPost[3],
        },
      ];
      await expect(
        replaceManyPotEntries(potEntriesToUpdate, rmSquadId)
      ).rejects.toThrow("Invalid potEntry data at index 1");
    });
    it("should throw an error if passed null as potEntries", async () => {
      await expect(replaceManyPotEntries(null as any, rmSquadId)).rejects.toThrow(
        "Invalid potEntries"
      );
    });
    it("should throw an error if potEntries is not an array", async () => {
      await expect(
        replaceManyPotEntries("not-an-array" as any, rmSquadId)
      ).rejects.toThrow("Invalid potEntries");
    });
    it("should throw an error if passed null as squadId", async () => {
      await expect(
        replaceManyPotEntries(mockPotEntriesToPost, null as any)
      ).rejects.toThrow("Invalid squad id");
    });
    it("should throw an error if passed invalid squadId", async () => {
      await expect(
        replaceManyPotEntries(mockPotEntriesToPost, "test")
      ).rejects.toThrow("Invalid squad id");
    });
    it("should throw an error if passed valid id, but not squad id", async () => {
      await expect(
        replaceManyPotEntries(mockPotEntriesToPost, userId)
      ).rejects.toThrow("Invalid squad id");
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

  describe("deleteAllPotEntriesForSquad()", () => {
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
      deleteAllPotEntriesForDiv(divIdForMockData);
    });

    it("should delete all potEntries for a squad", async () => {
      const deleted = await deleteAllPotEntriesForSquad(squadIdForMockData);
      expect(deleted).toBe(mockPotEntriesToPost.length);
      didDel = true;
    });
    it("should not delete all potEntries for a squad when squad id is not found", async () => {
      const deleted = await deleteAllPotEntriesForSquad(notFoundSquadId);
      expect(deleted).toBe(0);
    });
    it("should throw error and not delete all potEntries for a squad when squad id is invalid", async () => {
      try {
        await deleteAllPotEntriesForSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should throw error and not delete all potEntries for a squad when squad id is valid, but not a squad id", async () => {
      try {
        await deleteAllPotEntriesForSquad(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should not delete all potEntries for a squad when squad id is null", async () => {
      try {
        await deleteAllPotEntriesForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
  });

  describe("deleteAllPotEntriesForDiv()", () => {
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
      await deleteAllPotEntriesForSquad(squadIdForMockData);
    });

    it("should delete all potEntries for a div", async () => {
      const deleted = await deleteAllPotEntriesForDiv(divIdForMockData);
      expect(deleted).toBe(mockPotEntriesToPost.length);
      didDel = true;
    });
    it("should not delete all potEntries for a div when div id is not found", async () => {
      const deleted = await deleteAllPotEntriesForDiv(notFoundDivId);
      expect(deleted).toBe(0);
    });
    it("should throw error and not delete all potEntries for a div when div id is invalid", async () => {
      try {
        await deleteAllPotEntriesForDiv("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should throw error and not delete all potEntries for a div when div id is valid, but not a div id", async () => {
      try {
        await deleteAllPotEntriesForDiv(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should throw error and not delete all potEntries for a div when div id is null", async () => {
      try {
        await deleteAllPotEntriesForDiv(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
  });

  describe("deleteAllPotEntriesForTmnt()", () => {
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
      await deleteAllPotEntriesForSquad(squadIdForMockData);
    });

    it("should delete all potEntries for a tmnt", async () => {
      const deleted = await deleteAllPotEntriesForTmnt(tmntIdForMockData);
      expect(deleted).toBe(mockPotEntriesToPost.length);
      didDel = true;
    });
    it("should not delete all potEntries for a tmnt when tmnt id is not found", async () => {
      const deleted = await deleteAllPotEntriesForTmnt(notFoundTmntId);
      expect(deleted).toBe(0);
    });
    it("should throw error and not delete all potEntries for a tmnt when tmnt id is invalid", async () => {
      try {
        await deleteAllPotEntriesForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error and not delete all potEntries for a tmnt when tmnt id is valid, but not a tmnt id", async () => {
      try {
        await deleteAllPotEntriesForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error and not delete all potEntries for a tmnt when tmnt id is null", async () => {
      try {
        await deleteAllPotEntriesForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });
});
