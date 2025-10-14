import axios, { AxiosError } from "axios";
import { baseDivEntriesApi } from "@/lib/db/apiPaths";
import { testBaseDivEntriesApi } from "../../../testApi";
import { divEntryRawWithHdcpType, divEntryType } from "@/lib/types/types";
import { initDivEntry } from "@/lib/db/initVals";
import { mockDivEntriesToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import {
  deleteAllDivEntriesForDiv,
  deleteAllDivEntriesForSquad,
  deleteAllDivEntriesForTmnt,
  deleteDivEntry,
  getAllDivEntriesForDiv,
  getAllDivEntriesForSquad,
  getAllDivEntriesForTmnt,
  postDivEntry,
  postManyDivEntries,
  putDivEntry,
  extractDivEntries,
} from "@/lib/db/divEntries/dbDivEntries";
import { replaceManyDivEntries } from "@/lib/db/divEntries/dbDivEntriesReplaceMany";
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

const url = testBaseDivEntriesApi.startsWith("undefined")
  ? baseDivEntriesApi
  : testBaseDivEntriesApi;
const divEntryUrl = url + "/divEntry/";

const divEntriesToGet = [
  {
    div: {
      hdcp_from: 230,
      hdcp_per: 0,
      int_hdcp: true,
    },
    player: {
      average: 220,
    },    
    id: "den_652fc6c5556e407291c4b5666b2dccd7",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    fee: "80",
  },
  {
    div: {
      hdcp_from: 230,
      hdcp_per: 0,
      int_hdcp: true,
    },
    player: {
      average: 221,
    },    
    id: "den_ef36111c721147f7a2bf2702056947ce",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
    fee: "80",
  },
  {
    div: {
      hdcp_from: 230,
      hdcp_per: 0,
      int_hdcp: true,
    },
    player: {
      average: 210,
    },    
    id: "den_856cce7a69644e26911e65cd02ee1b23",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
    fee: "80",
  },
  {
    div: {
      hdcp_from: 230,
      hdcp_per: 0,
      int_hdcp: true,
    },
    player: {
      average: 211,
    },    
    id: "den_4da45cadb7b84cfba255fc0ce36e9add",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    player_id: "ply_8b0fd8bbd9e34d34a7fa90b4111c6e40",
    fee: "80",
  },
];

const notFoundId = "den_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

const tmntIdToDel = "tmt_d9b1af944d4941f65b2d2d4ac160cdea";

describe("dbDivEntries", () => {
  const rePostDivEntry = async (divEntry: divEntryType) => {
    try {
      // if divEntry already in database, then don't re-post
      const getResponse = await axios.get(divEntryUrl + divEntry.id);
      const found = getResponse.data.divEntry;
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
      const divEntryJSON = JSON.stringify(divEntry);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: divEntryJSON,
      });
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  const rePostToDel = async () => {
    const response = await axios.get(url);
    const divEntries = response.data.divEntries;
    const foundToDel = divEntries.find(
      (d: divEntryType) => d.id === mockDivEntriesToPost[0].id
    );
    if (!foundToDel) {
      try {
        await postManyDivEntries(mockDivEntriesToPost);
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }
  };

  const deletePostedDivEntry = async () => {
    const response = await axios.get(url);
    const divEntries = response.data.divEntries;
    const toDel = divEntries.find((d: divEntryRawWithHdcpType) => d.fee === 82);
    if (toDel) {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: divEntryUrl + toDel.id,
        });
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }
  };

  describe("extractDivEntries", () => {
    it("should correctly map raw divEntries to divEntryType", () => {
      const rawDivEntries = [
        {
          div: {
            hdcp_from: 230,
            hdcp_per: 0.9,
            int_hdcp: true,
          },
          player: {
            average: 211,
          },
          id: "den_652fc6c5556e407291c4b5666b2dccd7",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: "80",
          extraField: "ignore me", // should be ignored
        },
      ];

      const result = extractDivEntries(rawDivEntries);

      const expected: divEntryType = {
        ...initDivEntry,
        id: "den_652fc6c5556e407291c4b5666b2dccd7",
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
        fee: "80",
        hdcp: 17,
      };

      expect(result).toEqual([expected]);
    });
    it("should fill missing fields with defaults from blankDivEntries", () => {
      const rawDivEntries = [
        {
          div: {
            hdcp_from: 230,
            hdcp_per: 0.9,
            int_hdcp: true,
          },
          player: {
            average: 211,
          },          
          id: "den_652fc6c5556e407291c4b5666b2dccd7",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: "80",          
        },
      ];

      const result = extractDivEntries(rawDivEntries);

      // every *_err field should be blank string
      expect(result[0].squad_id_err).toBe("");
      expect(result[0].div_id_err).toBe("");
      expect(result[0].player_id_err).toBe("");
      expect(result[0].player_id_err).toBe("");
    });
    it("should process multiple divEntries", () => {
      const rawDivEntries = [
        {
          div: {
            hdcp_from: 230,
            hdcp_per: 0.9,
            int_hdcp: true,
          },
          player: {
            average: 211,
          },          
          id: "den_652fc6c5556e407291c4b5666b2dccd7",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: "80",          
        },
        {
          div: {
            hdcp_from: 230,
            hdcp_per: 0.9,
            int_hdcp: true,
          },
          player: {
            average: 215,
          },          
          id: "den_752fc6c5556e407291c4b5666b2dccd7",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          player_id: "ply_99be0472be3d476ea1caa99dd05953fa",
          fee: "80",          
        },
      ];

      const result = extractDivEntries(rawDivEntries);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("den_652fc6c5556e407291c4b5666b2dccd7");
      expect(result[0].player_id).toBe("ply_88be0472be3d476ea1caa99dd05953fa");
      expect(result[0].hdcp).toBe(17);
      expect(result[1].id).toBe("den_752fc6c5556e407291c4b5666b2dccd7");
      expect(result[1].player_id).toBe("ply_99be0472be3d476ea1caa99dd05953fa");
      expect(result[1].hdcp).toBe(13);
    });
    it("should return an empty array when passed an empty array", () => {
      const result = extractDivEntries([]);
      expect(result).toEqual([]);
    });
    it("should return an empty array when passed null", () => {
      const result = extractDivEntries(null);
      expect(result).toEqual([]);
    })
    it("should return an empty when passed non array", () => {
      const result = extractDivEntries("not an array" as any);
      expect(result).toEqual([]);
    });
  });

  describe("getAllDivEntriesForTmnt()", () => {

    it("should get all divEntries for tmnt", async () => {
      const getTmntId = 'tmt_fd99387c33d9c78aba290286576ddce5';
      const divEntries = await getAllDivEntriesForTmnt(getTmntId);
      expect(divEntries).toHaveLength(4);
      if (!divEntries) return;
      for (let i = 0; i < 4; i++) {        
        if (divEntries[i].id === 'den_ef36111c721147f7a2bf2702056947ce') {
          expect(divEntries[i].player_id).toEqual('ply_be57bef21fc64d199c2f6de4408bd136');
        } else if (divEntries[i].id === 'den_856cce7a69644e26911e65cd02ee1b23') {
          expect(divEntries[i].player_id).toEqual('ply_8bc2b34cf25e4081ba6a365e89ff49d8');          
        } else if (divEntries[i].id === 'den_4da45cadb7b84cfba255fc0ce36e9add') {
          expect(divEntries[i].player_id).toEqual('ply_8b0fd8bbd9e34d34a7fa90b4111c6e40');          
        } else if (divEntries[i].id === 'den_652fc6c5556e407291c4b5666b2dccd7') {
          expect(divEntries[i].player_id).toEqual('ply_88be0472be3d476ea1caa99dd05953fa');          
        } else {
          expect(true).toBe(false);
        }        
        expect(divEntries[i].squad_id).toEqual(divEntriesToGet[i].squad_id);
        expect(divEntries[i].div_id).toEqual(divEntriesToGet[i].div_id);
        expect(divEntries[i].fee).toEqual(divEntriesToGet[i].fee);        
        expect(divEntries[i].hdcp).toEqual(0);
      }
    });
    it("should return 0 divEntries for not found tmnt", async () => {
      const divEntries = await getAllDivEntriesForTmnt(notFoundTmntId);
      expect(divEntries).toHaveLength(0);
    });
    it("should throw error if tmmt id is invalid", async () => {
      try {
        await getAllDivEntriesForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error if tmnt id is a valid id, but not a tmnt id", async () => {
      try {
        await getAllDivEntriesForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should return null if tmnt id is null", async () => {
      try {
        await getAllDivEntriesForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });

  describe("getAllDivEntriesForSquad()", () => {    
    it("should get all divEntries for squad", async () => {
      const divEntries = await getAllDivEntriesForSquad(
        divEntriesToGet[0].squad_id
      );
      expect(divEntries).toHaveLength(divEntriesToGet.length);
      if (!divEntries) return;
      for (let i = 0; i < divEntries.length; i++) {
        if (divEntries[i].id === divEntriesToGet[0].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[0].player_id);          
        } else if (divEntries[i].id === divEntriesToGet[1].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[1].player_id);          
        } else if (divEntries[i].id === divEntriesToGet[2].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[2].player_id);          
        } else if (divEntries[i].id === divEntriesToGet[3].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[3].player_id);          
        } else {
          expect(true).toBe(false);
        }
        expect(divEntries[i].squad_id).toEqual(divEntriesToGet[i].squad_id);
        expect(divEntries[i].div_id).toEqual(divEntriesToGet[i].div_id);
        expect(divEntries[i].fee).toEqual(divEntriesToGet[i].fee);
        expect(divEntries[i].hdcp).toEqual(0);
      }
    });
    it("should return 0 divEntries for not found squad", async () => {
      const divEntries = await getAllDivEntriesForSquad(notFoundSquadId);
      expect(divEntries).toHaveLength(0);
    });
    it("should return null if squad id is invalid", async () => {
      try {
        await getAllDivEntriesForSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should return null if squad id is a valid id, but not a squad id", async () => {
      try {
        await getAllDivEntriesForSquad(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should return null if squad id is null", async () => {
      try {
        await getAllDivEntriesForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
  });

  describe("getAllDivEntriesForDiv()", () => {

    it("should get all divEntries for div", async () => {
      const divEntries = await getAllDivEntriesForDiv(
        divEntriesToGet[0].div_id
      );
      expect(divEntries).toHaveLength(divEntriesToGet.length);
      if (!divEntries) return;
      for (let i = 0; i < divEntries.length; i++) {
        if (divEntries[i].id === divEntriesToGet[0].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[0].player_id);          
        } else if (divEntries[i].id === divEntriesToGet[1].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[1].player_id);          
        } else if (divEntries[i].id === divEntriesToGet[2].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[2].player_id);          
        } else if (divEntries[i].id === divEntriesToGet[3].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[3].player_id);          
        } else {
          expect(true).toBe(false);
        }
        expect(divEntries[i].squad_id).toEqual(divEntriesToGet[i].squad_id);
        expect(divEntries[i].div_id).toEqual(divEntriesToGet[i].div_id);        
        expect(divEntries[i].fee).toEqual(divEntriesToGet[i].fee);
        expect(divEntries[i].hdcp).toEqual(0);
      }
    });
    it("should return 0 divEntries for not found div", async () => {
      const divEntries = await getAllDivEntriesForDiv(notFoundDivId);
      expect(divEntries).toHaveLength(0);
    });
    it("should return null if div id is invalid", async () => {
      try {
        await getAllDivEntriesForDiv("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should return null if div id is a valid id, but not a div id", async () => {
      try {
        await getAllDivEntriesForDiv(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should return null if div id is null", async () => {
      try {
        await getAllDivEntriesForDiv(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
  });

  describe("postDivEntry()", () => {
    const divEntryToPost = {
      ...initDivEntry,
      id: "den_012fc6c5556e407291c4b5666b2dccd7",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
      fee: "82",
    };

    let createdDivEntry = false;

    beforeAll(async () => {
      await deletePostedDivEntry();
    });

    beforeEach(() => {
      createdDivEntry = false;
    });

    afterEach(async () => {
      if (createdDivEntry) {
        await deletePostedDivEntry();
      }
    });

    it("should post one divEntry", async () => {
      const postedDivEntry = await postDivEntry(divEntryToPost);
      expect(postedDivEntry).not.toBeNull();
      if (!postedDivEntry) return;
      createdDivEntry = true;
      expect(postedDivEntry.id).toEqual(divEntryToPost.id);
      expect(postedDivEntry.squad_id).toEqual(divEntryToPost.squad_id);
      expect(postedDivEntry.div_id).toEqual(divEntryToPost.div_id);
      expect(postedDivEntry.player_id).toEqual(divEntryToPost.player_id);
      expect(postedDivEntry.fee).toEqual(divEntryToPost.fee);
    });
    it("should post a sanitzed divEntry", async () => {
      const toSanitizse = {
        ...divEntryToPost,
        position: "   82  ",
      };
      const postedDivEntry = await postDivEntry(toSanitizse);
      expect(postedDivEntry).not.toBeNull();
      if (!postedDivEntry) return;
      createdDivEntry = true;
      expect(postedDivEntry.id).toEqual(toSanitizse.id);
      expect(postedDivEntry.squad_id).toEqual(toSanitizse.squad_id);
      expect(postedDivEntry.div_id).toEqual(toSanitizse.div_id);
      expect(postedDivEntry.squad_id).toEqual(toSanitizse.squad_id);
      expect(postedDivEntry.player_id).toEqual(toSanitizse.player_id);
      expect(postedDivEntry.fee).toEqual("82");
    });
    it("should throw error when post a divEntry if got invalid divEntry id", async () => {
      try {
        const invalidDivEntry = {
          ...divEntryToPost,
          id: "test",
        };
        await postDivEntry(invalidDivEntry);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid divEntry data");
      }
    });
    it("should throw error when post a divEntry if got invalid data", async () => {
      try {
        const invalidDivEntry = {
          ...divEntryToPost,
          fee: "-1",
        };
        await postDivEntry(invalidDivEntry);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "postDivEntry failed: Request failed with status code 422"
        );
      }
    });
    it("should throw error when post a divEntry when passed null", async () => {
      try {
        await postDivEntry(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid divEntry data");
      }
    });
  });

  describe("postManyDivEntries()", () => {
    let createdDivEntries = false;

    beforeAll(async () => {
      await deletePostedDivEntry();
      await deleteAllDivEntriesForTmnt(tmntIdToDel);
    });

    beforeEach(() => {
      createdDivEntries = false;
    });

    afterEach(async () => {
      if (createdDivEntries) {
        await deleteAllDivEntriesForTmnt(tmntIdToDel);
      }
    });

    afterAll(async () => {
      await deleteAllDivEntriesForTmnt(tmntIdToDel);
    });

    it("should post many divEntries", async () => {
      const count = await postManyDivEntries(mockDivEntriesToPost);
      expect(count).toEqual(mockDivEntriesToPost.length);

      const divEntries = await getAllDivEntriesForSquad(
        mockDivEntriesToPost[0].squad_id
      );
      expect(divEntries).not.toBeNull();
      if (!divEntries) return;
      createdDivEntries = true;
      expect(divEntries.length).toEqual(mockDivEntriesToPost.length);
      for (let i = 0; i < mockDivEntriesToPost.length; i++) {
        expect(divEntries[i].id).toEqual(mockDivEntriesToPost[i].id);
        expect(divEntries[i].squad_id).toEqual(
          mockDivEntriesToPost[i].squad_id
        );
        expect(divEntries[i].div_id).toEqual(mockDivEntriesToPost[i].div_id);
        expect(divEntries[i].player_id).toEqual(
          mockDivEntriesToPost[i].player_id
        );
        expect(divEntries[i].fee).toEqual(mockDivEntriesToPost[i].fee);
      }
    });
    it("should return 0 when passed an empty array", async () => {
      const count = await postManyDivEntries([]);
      expect(count).toEqual(0);
    });
    it('should throw error when post many divEntries with sanitization, fee value sanitized to ""', async () => {
      try {
        const toSanitize = cloneDeep(mockDivEntriesToPost);
        toSanitize[0].fee = "  84  ";
        await postManyDivEntries(toSanitize);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "Invalid divEntry data at index 0"
        );
      }
    });
    it("should throw error when post many divEntries with invalid data at item 1", async () => {
      try {
        const invalidDivEntries = cloneDeep(mockDivEntriesToPost);
        invalidDivEntries[1].fee = "-1";
        await postManyDivEntries(invalidDivEntries);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "Invalid divEntry data at index 1"
        );
      }
    });
    it("should throw error when post many divEntries with invalid data at item 2", async () => {
      try {
        const invalidDivEntries = cloneDeep(mockDivEntriesToPost);
        invalidDivEntries[1].player_id = "test";
        await postManyDivEntries(invalidDivEntries);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "Invalid divEntry data at index 1"
        );
      }
    });
    it("should throw error when post many divEntries when passed null", async () => {
      try {
        await postManyDivEntries(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid divEntries data");
      }
    });
    it("should throw error when post many divEntries when passed non array", async () => {
      try {
        await postManyDivEntries("testing" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid divEntries data");
      }
    });
  });

  describe("putDivEntry()", () => {
    const divEntryToPut = {
      ...initDivEntry,
      id: "den_652fc6c5556e407291c4b5666b2dccd7",
      squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
      div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
      player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
      fee: "83",
    };

    const putUrl = divEntryUrl + divEntryToPut.id;

    const resetDivEntry = {
      ...initDivEntry,
      id: "den_652fc6c5556e407291c4b5666b2dccd7",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
      player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
      fee: "80",
    };

    const doReset = async () => {
      try {
        const playerJSON = JSON.stringify(resetDivEntry);
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

    it("should put a divEntry", async () => {
      const puttedDivEntry = await putDivEntry(divEntryToPut);
      expect(puttedDivEntry).not.toBeNull();
      if (!puttedDivEntry) return;
      didPut = true;
      expect(puttedDivEntry.squad_id).toBe(divEntryToPut.squad_id);
      expect(puttedDivEntry.div_id).toBe(divEntryToPut.div_id);
      expect(puttedDivEntry.player_id).toBe(divEntryToPut.player_id);
      expect(puttedDivEntry.fee).toBe(divEntryToPut.fee);
    });
    it('should throw error when put a divEntry with sanitization, fee value sanitized to ""', async () => {
      try {
        const toSanitize = cloneDeep(divEntryToPut);
        toSanitize.fee = "  84  ";
        await putDivEntry(toSanitize);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "putDivEntry failed: Request failed with status code 422"
        );
      }
    });
    it("should throw error when put a divEntry with invalid data", async () => {
      try {
        const invalidDivEntry = {
          ...divEntryToPut,
          fee: "-1",
        };
        await putDivEntry(invalidDivEntry);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "putDivEntry failed: Request failed with status code 422"
        );
      }
    });
    it("should throw error when put a divEntry when passed null", async () => {
      try {
        await putDivEntry(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid divEntry data");
      }
    });
    it("should throw error when put a divEntry when passed non object", async () => {
      try {
        await putDivEntry("testing" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid divEntry data");
      }
    });
  });

  describe("replaceManyDivEntries()", () => {
    let createdDivEntries = false;

    beforeAll(async () => {
      await deletePostedDivEntry();
      await deleteAllDivEntriesForTmnt(tmntIdToDel);
    });

    beforeEach(() => {
      createdDivEntries = false;
    });

    afterEach(async () => {
      if (createdDivEntries) {
        await deleteAllDivEntriesForTmnt(tmntIdToDel);
      }
    });

    afterAll(async () => {
      await deleteAllDivEntriesForTmnt(tmntIdToDel);
    });

    const rmSquadId = "sqd_42be0f9d527e4081972ce8877190489d";
    const toInsert: divEntryType[] = [
      {
        ...initDivEntry,
        id: "den_05be0472be3d476ea1caa99dd05953fa",
        squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
        div_id: "div_18997d3fd7ef4eb7ad2b53a9e93f9ce5",
        player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
        fee: "64",
      },
      {
        ...initDivEntry,
        id: "den_06be0472be3d476ea1caa99dd05953fa",
        squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
        div_id: "div_367309aa1444446ea9ab23d2e4aae98f",
        player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
        fee: "64",
      },
    ];

    it("should update, insert, delete many div entries", async () => {
      const count = await postManyDivEntries(mockDivEntriesToPost);
      expect(count).toBe(mockDivEntriesToPost.length);
      createdDivEntries = true;
      const divEntries = await getAllDivEntriesForSquad(rmSquadId);
      if (!divEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(divEntries.length).toBe(mockDivEntriesToPost.length);

      const divEntriesToUpdate = [
        {
          ...mockDivEntriesToPost[0],
          fee: "83",
        },
        {
          ...mockDivEntriesToPost[1],
          fee: "83",
        },
        {
          ...toInsert[0],
        },
        {
          ...toInsert[1],
        },
      ]
      const replaceCount = await replaceManyDivEntries(divEntriesToUpdate, rmSquadId);
      expect(replaceCount).toBe(divEntriesToUpdate.length);
      const replacedDivEntries = await getAllDivEntriesForSquad(rmSquadId);
      if (!replacedDivEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedDivEntries.length).toBe(divEntriesToUpdate.length);
      for (let i = 0; i < replacedDivEntries.length; i++) {
        expect(replacedDivEntries[i].squad_id).toBe(rmSquadId);
        if (replacedDivEntries[i].id === divEntriesToUpdate[0].id) {
          expect(replacedDivEntries[i].fee).toBe(divEntriesToUpdate[0].fee);
          expect(replacedDivEntries[i].div_id).toBe(divEntriesToUpdate[0].div_id);
          expect(replacedDivEntries[i].player_id).toBe(divEntriesToUpdate[0].player_id);
        } else if (replacedDivEntries[i].id === divEntriesToUpdate[1].id) {
          expect(replacedDivEntries[i].fee).toBe(divEntriesToUpdate[1].fee);
          expect(replacedDivEntries[i].div_id).toBe(divEntriesToUpdate[1].div_id);
          expect(replacedDivEntries[i].player_id).toBe(divEntriesToUpdate[1].player_id);
        } else if (replacedDivEntries[i].id === divEntriesToUpdate[2].id) {
          expect(replacedDivEntries[i].fee).toBe(divEntriesToUpdate[2].fee);
          expect(replacedDivEntries[i].div_id).toBe(divEntriesToUpdate[2].div_id);
          expect(replacedDivEntries[i].player_id).toBe(divEntriesToUpdate[2].player_id);
        } else if (replacedDivEntries[i].id === divEntriesToUpdate[3].id) {
          expect(replacedDivEntries[i].fee).toBe(divEntriesToUpdate[3].fee);
          expect(replacedDivEntries[i].div_id).toBe(divEntriesToUpdate[3].div_id);
          expect(replacedDivEntries[i].player_id).toBe(divEntriesToUpdate[3].player_id);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should return 0 when passed empty div entries", async () => {
      const count = await postManyDivEntries(mockDivEntriesToPost);
      expect(count).toBe(mockDivEntriesToPost.length);
      createdDivEntries = true;
      const divEntries = await getAllDivEntriesForSquad(rmSquadId);
      if (!divEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(divEntries.length).toBe(mockDivEntriesToPost.length);

      const replaceCount = await replaceManyDivEntries([], rmSquadId);
      expect(replaceCount).toBe(0);
      const replacedDivEntries = await getAllDivEntriesForSquad(rmSquadId);
      if (!replacedDivEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedDivEntries.length).toEqual(0);
    });
    it('should throw error when santize fee to ""', async () => { 
      const count = await postManyDivEntries(mockDivEntriesToPost);
      expect(count).toBe(mockDivEntriesToPost.length);
      createdDivEntries = true;
      const divEntries = await getAllDivEntriesForSquad(rmSquadId);
      if (!divEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(divEntries.length).toBe(mockDivEntriesToPost.length);

      const invalidDivEntries = [
        {
          ...mockDivEntriesToPost[0],
          fee: "  83  ",
        },
        {
          ...mockDivEntriesToPost[1],
          fee: "83",
        },
        {
          ...toInsert[0],
        },
        {
          ...toInsert[1],
        },
      ]

      try {
        await replaceManyDivEntries(invalidDivEntries, rmSquadId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "Invalid divEntry data at index 0"
        );
      }
    })
    it("should update no div entries when error in data in item 0", async () => {
      const count = await postManyDivEntries(mockDivEntriesToPost);
      expect(count).toBe(mockDivEntriesToPost.length);
      createdDivEntries = true;
      const divEntries = await getAllDivEntriesForSquad(rmSquadId);
      if (!divEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(divEntries.length).toBe(mockDivEntriesToPost.length);

      const invalidDivEntries = [
        {
          ...mockDivEntriesToPost[0],
          fee: "-1",
        },
        {
          ...mockDivEntriesToPost[1],
          fee: "83",
        },
        {
          ...toInsert[0],
        },
        {
          ...toInsert[1],
        },
      ]
      try {
        await replaceManyDivEntries(invalidDivEntries, rmSquadId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "Invalid divEntry data at index 0"
        );
      }

      // const count = await postManyDivEntries(mockDivEntriesToPost);
      // createdDivEntries = true;
      // expect(count).toBe(mockDivEntriesToPost.length);
      // const postedDivEntries = await getAllDivEntriesForSquad(
      //   mockDivEntriesToPost[0].squad_id
      // );
      // if (!postedDivEntries) {
      //   expect(true).toBeFalsy();
      //   return;
      // }
      // expect(postedDivEntries.length).toBe(mockDivEntriesToPost.length);
      // // set divs edits, set eType
      // const divEntriesToUpdate = [
      //   {
      //     ...mockMultiDivEntriesToPost[0],
      //     fee: "1234567890", // error in fee
      //     eType: "u",
      //   },
      //   {
      //     ...mockMultiDivEntriesToPost[1],
      //     fee: "83",
      //     eType: "u",
      //   },
      //   {
      //     ...mockMultiDivEntriesToPost[2],
      //     eType: "d",
      //   },
      //   {
      //     ...mockMultiDivEntriesToPost[3],
      //     eType: "d",
      //   },
      //   {
      //     ...mockMultiDivEntriesToPost[4],
      //     eType: "i",
      //   },
      //   {
      //     ...mockMultiDivEntriesToPost[5],
      //     eType: "i",
      //   },
      // ];

      // const updateInfo = await putManyDivEntries(divEntriesToUpdate);
      // expect(updateInfo).toBeNull();
    });
    it("should update no div entries when error in data in item 0", async () => {
      const count = await postManyDivEntries(mockDivEntriesToPost);
      expect(count).toBe(mockDivEntriesToPost.length);
      createdDivEntries = true;
      const divEntries = await getAllDivEntriesForSquad(rmSquadId);
      if (!divEntries) {
        expect(true).toBeFalsy();
        return;
      }
      expect(divEntries.length).toBe(mockDivEntriesToPost.length);

      const invalidDivEntries = [
        {
          ...mockDivEntriesToPost[0],
          fee: "83",
        },
        {
          ...mockDivEntriesToPost[1],
          fee: "-83",
        },
        {
          ...toInsert[0],
        },
        {
          ...toInsert[1],
        },
      ]
      try {
        await replaceManyDivEntries(invalidDivEntries, rmSquadId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "Invalid divEntry data at index 1"
        );
      }
    });
    it("should throw an error if passed null as players", async () => {
      await expect(replaceManyDivEntries(null as any, rmSquadId)).rejects.toThrow(
        "Invalid divEntries"
      );
    });
    it("should throw an error if players is not an array", async () => {
      await expect(replaceManyDivEntries("not-an-array" as any, rmSquadId)).rejects.toThrow(
        "Invalid divEntries"
      );
    });
    it("should throw an error if passed null as squadId", async () => {
      await expect(replaceManyDivEntries(mockDivEntriesToPost, null as any)).rejects.toThrow(
        "Invalid squad id"
      );
    });
    it("should throw an error if passed invalid squadId", async () => {
      await expect(replaceManyDivEntries(mockDivEntriesToPost, 'test')).rejects.toThrow(
        "Invalid squad id"
      );
    });
    it("should throw an error if passed valid id, but not squad id", async () => {
      await expect(replaceManyDivEntries(mockDivEntriesToPost, userId)).rejects.toThrow(
        "Invalid squad id"
      );
    });

  });

  describe("deleteDivEntry()", () => {
    // toDel is data from prisma/seeds.ts
    const toDel = {
      ...initDivEntry,
      id: "den_a55c6cd27d1b482aa0ff248d5fb496ed",
      squad_id: "sqd_bb2de887bf274242af5d867476b029b8",
      div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
      player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
      fee: "80",
    };

    let didDel = false;

    beforeAll(async () => {
      await rePostDivEntry(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostDivEntry(toDel);
      }
    });

    it("should delete a divEntry", async () => {
      const deleted = await deleteDivEntry(toDel.id);
      expect(deleted).toBe(1);
      didDel = true;
    });
    it("should throw error when delete a divEntry when id is not found", async () => {
      try {
        await deleteDivEntry(notFoundId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "deleteDivEntry failed: Request failed with status code 404"
        );
      }
    });
    it("should throw error when delete a divEntry when id is invalid", async () => {
      try {
        await deleteDivEntry('test');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid divEntry id");
      }
    });
    it("should throw error when delete a divEntry when id is valid, but not a divEntry id", async () => {
      try {
        await deleteDivEntry(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid divEntry id");
      }
    });
    it("should throw error when delete a divEntry when id is null", async () => {
      try {
        await deleteDivEntry(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid divEntry id");
      }
    });
  });

  describe("deleteAllDivEntriesForSquad()", () => {
    let didDel = false;

    beforeAll(async () => {
      await deleteAllDivEntriesForTmnt(tmntIdToDel);
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

    it("should delete all divEntries for a squad", async () => {
      const deleted = await deleteAllDivEntriesForSquad(
        mockDivEntriesToPost[0].squad_id
      );
      expect(deleted).toBe(4);
      didDel = true;
    });
    it("should return 0 when squad id is not found", async () => {
      const deleted = await deleteAllDivEntriesForSquad(notFoundSquadId);
      expect(deleted).toBe(0);
    });
    it("should throw error when delete all divEntries for a squad when squad id is invalid", async () => {
      try {
        await deleteAllDivEntriesForSquad('test');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should throw error when delete all divEntries for a squad when squad id is valid, but not a squad id", async () => {
      try {
        await deleteAllDivEntriesForSquad(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should throw error when delete all divEntries for a squad when squad id is null", async () => {
      try {
        await deleteAllDivEntriesForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
  });

  describe("deleteAllDivEntriesForDiv()", () => {
    let didDel = false;

    beforeAll(async () => {
      await deleteAllDivEntriesForTmnt(tmntIdToDel);
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

    it("should delete all divEntries for a div", async () => {
      const deleted = await deleteAllDivEntriesForDiv(
        mockDivEntriesToPost[0].div_id
      );
      expect(deleted).toBe(2);
      didDel = true;
    });
    it("should not delete all divEntries for a div when div id is not found", async () => {
      const deleted = await deleteAllDivEntriesForDiv(notFoundDivId);
      expect(deleted).toBe(0);
    });
    it("should not delete all divEntries for a div when div id is invalid", async () => {
      try {
        await deleteAllDivEntriesForDiv(notFoundSquadId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should not delete all divEntries for a div when div id is valid, but not a div id", async () => {
      try {
        await deleteAllDivEntriesForDiv(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should not delete all divEntries for a div when div id is null", async () => {
      try {
        await deleteAllDivEntriesForDiv(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
  });

  describe("deleteAllDivEntriesForTmnt()", () => {
    let didDel = false;

    beforeAll(async () => {
      await deleteAllDivEntriesForTmnt(tmntIdToDel);
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

    it("should delete all divEntries for a tmnt", async () => {
      const deleted = await deleteAllDivEntriesForTmnt(tmntIdToDel);
      expect(deleted).toBe(mockDivEntriesToPost.length);
      didDel = true;
    });
    it("should not delete all divEntries for a tmnt when tmnt id is not found", async () => {
      const deleted = await deleteAllDivEntriesForTmnt(notFoundTmntId);
      expect(deleted).toBe(0);
    });
    it("should not delete all divEntries for a tmnt when tmnt id is invalid", async () => {
      try {
        await deleteAllDivEntriesForTmnt('test');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should not delete all divEntries for a tmnt when tmnt id is valid, but not a tmnt id", async () => {
      try {
        await deleteAllDivEntriesForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should not delete all divEntries for a tmnt when tmnt id is null", async () => {
      try {
        await deleteAllDivEntriesForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });
});
