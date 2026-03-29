import axios, { AxiosError } from "axios";
import { basePotEntriesApi } from "@/lib/api/apiPaths";
import { testBasePotEntriesApi } from "../../../testApi";
import { initPotEntry } from "@/lib/db/initVals";
import { mockPotEntriesToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import {
  getAllPotEntriesForSquad,  
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

const url = testBasePotEntriesApi.startsWith("undefined")
  ? basePotEntriesApi
  : testBasePotEntriesApi;
const onePotEntryUrl = url + "/potEntry/";
const divUrl = url + "/div/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

describe("Pot Entries - API's: /api/potEntries", () => {
  const testPotEntry = {
    ...initPotEntry,
    id: "pen_648e5b64809d441c99815929cf7c66e0",
    pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    fee: "20",
  };

  const potEntryToPost = {
    ...initPotEntry,
    id: "pen_1234567890abcdef1234567890abcdef",
    pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
    player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
    fee: "20",
  };  

  const goldPinPotId = "pot_b2a7b02d761b4f5ab5438be84f642c3b";

  const divIdForMockData = "div_1f42042f9ef24029a0a2d48cc276a087";
  const squadIdForMockData = "sqd_1a6c885ee19a49489960389193e8f819";
  const tmntIdForMockData = "tmt_56d916ece6b50e6293300248c6792316";

  const divIdForPotEntries = "div_f30aea2c534f4cfe87f4315531cef8ef";
  const tmntIdForPotEntries = "tmt_fd99387c33d9c78aba290286576ddce5";
  const squadIdForPotEntries = "sqd_7116ce5f80164830830a7157eb093396";

  const notFoundId = "pen_01234567890123456789012345678901";
  const notFoundDivId = "div_01234567890123456789012345678901";
  const notFoundPlayerId = "ply_01234567890123456789012345678901";
  const notFoundSquadId = "sqd_01234567890123456789012345678901";
  const notFoundTmntId = "tmt_01234567890123456789012345678901";
  const userId = "usr_01234567890123456789012345678901";

  const deletePostedPotEntry = async (potEntryId: string) => {
    try {
      await axios.delete(onePotEntryUrl + potEntryId, { withCredentials: true });
    } catch (err) {
      if (err instanceof Error) console.log(err.message);
    }     
  };

  describe("GET", () => {
    beforeAll(async () => {
      await deletePostedPotEntry(potEntryToPost.id);
    });

    it("should get all potEntries", async () => {
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      // 43 rows in prisma/seed.ts
      expect(response.data.potEntries).toHaveLength(43);
      for (let i = 0; i < response.data.potEntries.length; i++) {
        const potEntry = response.data.potEntries[i];
        expect(potEntry.id).toBeDefined();
        expect(potEntry.pot_id).toBeDefined();
        expect(potEntry.player_id).toBeDefined();
        expect(potEntry.fee).toBeDefined();
      }
    });
  });

  describe("GET one potEntry API: /api/potEntries/potEntry/:id", () => {

    beforeAll(async () => {
      await deletePostedPotEntry(potEntryToPost.id);
    });

    it("should get one potEntry by ID", async () => {
      try {
        const urlToUse = onePotEntryUrl + testPotEntry.id;
        const response = await axios.get(urlToUse);
        expect(response.status).toBe(200);
        const potEntry = response.data.potEntry;
        expect(potEntry.id).toEqual(testPotEntry.id);
        expect(potEntry.pot_id).toEqual(testPotEntry.pot_id);
        expect(potEntry.player_id).toEqual(testPotEntry.player_id);
        expect(potEntry.fee).toEqual(testPotEntry.fee);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not get one potEntry by ID when id is invalid", async () => {
      try {
        const response = await axios.get(onePotEntryUrl + "test");
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not get one potEntry by ID when id is valid, but not a potEntry id", async () => {
      try {
        const response = await axios.get(onePotEntryUrl + userId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not get one potEntry by ID when id is not found", async () => {
      try {
        const response = await axios.get(onePotEntryUrl + notFoundId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
  });

  describe("GET all potEntries for one div API: /api/potEntries/div/:divId", () => {
    beforeAll(async () => {
      await deletePostedPotEntry(potEntryToPost.id);
    });

    it("should get all potEntries for one div", async () => {
      const response = await axios.get(divUrl + divIdForPotEntries);
      expect(response.status).toBe(200);
      const potEntries = response.data.potEntries;
      expect(potEntries).toHaveLength(4); // 4 potEntries for div in prisma/seeds.ts
      for (let i = 0; i < potEntries.length; i++) {
        expect(potEntries[i].pot_id).toEqual(goldPinPotId);
        expect(potEntries[i].id).toBeDefined();
        expect(potEntries[i].player_id).toBeDefined();
        expect(potEntries[i].fee).toBeDefined();
      }
    });
    it("should not get all potEntries for one div when divId is invalid", async () => {
      try {
        const response = await axios.get(divUrl + "test");
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not get all potEntries for one div when divId is valid, but not a div id", async () => {
      try {
        const response = await axios.get(divUrl + userId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not get all potEntries for one div when divId is not found", async () => {
      const response = await axios.get(divUrl + notFoundDivId);
      expect(response.status).toBe(200);
      const potEntries = response.data.potEntries;
      expect(potEntries).toHaveLength(0);
    });
  });

  describe("GET all potEntries for one squad API: /api/potEntries/squad/:squadId", () => {
    beforeAll(async () => {
      await deletePostedPotEntry(potEntryToPost.id);
    });

    it("should get all potEntries for one squad", async () => {
      const response = await axios.get(squadUrl + squadIdForPotEntries);
      expect(response.status).toBe(200);
      const potEntries = response.data.potEntries;
      expect(potEntries).toHaveLength(4); // 4 potEntries for squad is prisma/seeds.ts
      for (let i = 0; i < potEntries.length; i++) {
        expect(potEntries[i].pot_id).toEqual(goldPinPotId);
        expect(potEntries[i].id).toBeDefined();
        expect(potEntries[i].player_id).toBeDefined();
        expect(potEntries[i].fee).toBeDefined();
      }
    });
    it("should not get all potEntries for one squad when squadId is invalid", async () => {
      try {
        const response = await axios.get(squadUrl + "test");
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not get all potEntries for one squad when squadId is valid, but not a div id", async () => {
      try {
        const response = await axios.get(squadUrl + userId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not get all potEntries for one squad when squadId is not found", async () => {
      const response = await axios.get(squadUrl + notFoundSquadId);
      expect(response.status).toBe(200);
      const potEntries = response.data.potEntries;
      expect(potEntries).toHaveLength(0);
    });
  });

  describe("GET all potEntries for one tmnt API: /api/potEntries/tmnt/:tmntId", () => {
    beforeAll(async () => {
      await deletePostedPotEntry(potEntryToPost.id);
    });

    it("should get all potEntries for one tmnt", async () => {
      const response = await axios.get(tmntUrl + tmntIdForPotEntries);
      expect(response.status).toBe(200);
      const potEntries = response.data.potEntries;
      expect(potEntries).toHaveLength(4); // 4 potEntries for tmnt is prisma/seeds.ts
      for (let i = 0; i < potEntries.length; i++) {
        expect(potEntries[i].pot_id).toEqual(goldPinPotId);
        expect(potEntries[i].id).toBeDefined();
        expect(potEntries[i].player_id).toBeDefined();
        expect(potEntries[i].fee).toBeDefined();
      }
    });
    it("should not get all potEntries for one tmnt when tmntId is invalid", async () => {
      try {
        const response = await axios.get(tmntUrl + "test");
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not get all potEntries for one tmnt when tmntId is valid, but not a div id", async () => {
      try {
        const response = await axios.get(tmntUrl + userId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not get all potEntries for one tmnt when tmntId is not found", async () => {
      const response = await axios.get(tmntUrl + notFoundTmntId);
      expect(response.status).toBe(200);
      const potEntries = response.data.potEntries;
      expect(potEntries).toHaveLength(0);
    });
  });

  describe("POST one potEntry API: /api/potEntries", () => {
  
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
      const potEntryJSON = JSON.stringify(potEntryToPost);
      const response = await axios.post(url, potEntryJSON, {
        withCredentials: true,
      });
      expect(response.status).toBe(201);
      createdPotEntry = true;
      const potEntry = response.data.potEntry;
      expect(potEntry.id).toEqual(potEntryToPost.id);
      expect(potEntry.pot_id).toEqual(potEntryToPost.pot_id);
      expect(potEntry.player_id).toEqual(potEntryToPost.player_id);
      expect(potEntry.fee).toEqual(potEntryToPost.fee);
    });
    it('should NOT post a sanitized potEntry (saninted fee = "")', async () => {
      const toSanitize = {
        ...potEntryToPost,
        fee: "   23  ",
      };
      const potEntryJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios.post(url, potEntryJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not post one potEntry when id is blank", async () => {
      const invalidPotEntry = {
        ...potEntryToPost,
        id: "",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not post one potEntry when pot_id is blank", async () => {
      const invalidPotEntry = {
        ...potEntryToPost,
        pot_id: "",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not post one potEntry when player_id is blank", async () => {
      const invalidPotEntry = {
        ...potEntryToPost,
        player_id: "",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not post one potEntry when fee is blank", async () => {
      const invalidPotEntry = {
        ...potEntryToPost,
        fee: "",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not post one potEntry when id is invalid", async () => {
      const invalidPotEntry = {
        ...potEntryToPost,
        id: "test",
      };
      const potEntryJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: potEntryJSON,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not post one potEntry when id is valid, but not a potEntry id", async () => {
      const invalidPotEntry = {
        ...potEntryToPost,
        id: userId,
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not post one potEntry when pot_id is invalid", async () => {
      const invalidPotEntry = {
        ...potEntryToPost,
        pot_id: "test",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not post one potEntry when pot_id is valid, bit not a pot id", async () => {
      const invalidPotEntry = {
        ...potEntryToPost,
        pot_id: userId,
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not post one potEntry when player_id is invalid", async () => {
      const invalidPotEntry = {
        ...potEntryToPost,
        player_id: "test",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not post one potEntry when player_id is valid, but not a player id", async () => {
      const invalidPotEntry = {
        ...potEntryToPost,
        player_id: userId,
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not post one potEntry when fee is too low", async () => {
      const invalidPotEntry = {
        ...potEntryToPost,
        fee: "-1",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not post one potEntry when fee is too high", async () => {
      const invalidPotEntry = {
        ...potEntryToPost,
        fee: "1234567890",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.post(url, invalidJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
  });

  describe("PUT one potEntry API: /api/potEntries/potEntry/:id", () => {
    const resetPotEntry = async () => {
      // make sure test player is reset in database
      const potEntryJSON = JSON.stringify(testPotEntry);
      await axios.put(onePotEntryUrl + testPotEntry.id, potEntryJSON,
        { withCredentials: true }
      );
    };

    const putPotEntry = {
      ...testPotEntry,
      pot_id: "pot_98b3a008619b43e493abf17d9f462a65",
      player_id: "ply_8b0fd8bbd9e34d34a7fa90b4111c6e40",
      fee: "23",
    };

    let didPut = false;

    beforeAll(async () => {
      await resetPotEntry();
    });

    beforeEach(() => {
      didPut = false;
    });

    afterEach(async () => {
      if (didPut) {
        await resetPotEntry();
      }
    });

    it("should update a potEntry by ID", async () => {
      const potEntryJSON = JSON.stringify(putPotEntry);
      const response = await axios.put(onePotEntryUrl + putPotEntry.id, potEntryJSON,
        { withCredentials: true }
      );
      expect(response.status).toBe(200);
      didPut = true;
      const puttedPotEntry = response.data.potEntry;
      expect(puttedPotEntry.pot_id).toBe(putPotEntry.pot_id);
      expect(puttedPotEntry.player_id).toBe(putPotEntry.player_id);
      expect(puttedPotEntry.fee).toBe(putPotEntry.fee);
    });
    it("should update a sanitized potEntry by ID", async () => {
      const toSanitize = {
        ...putPotEntry,
        fee: "23.000",
      };
      const potEntryJSON = JSON.stringify(toSanitize);
      const response = await axios.put(onePotEntryUrl + putPotEntry.id, potEntryJSON,
        { withCredentials: true }
      );
      expect(response.status).toBe(200);
      didPut = true;
      const puttedPotEntry = response.data.potEntry;
      expect(puttedPotEntry.pot_id).toBe(putPotEntry.pot_id);
      expect(puttedPotEntry.player_id).toBe(putPotEntry.player_id);
      expect(puttedPotEntry.fee).toBe(putPotEntry.fee);
    });
    it("should not update a potEntry by ID when pot_id is blank", async () => {
      const invalidPotEntry = {
        ...putPotEntry,
        pot_id: "",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.put(onePotEntryUrl + invalidPotEntry.id, invalidJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not update a potEntry by ID when player_id is blank", async () => {
      const invalidPotEntry = {
        ...putPotEntry,
        player_id: "",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.put(onePotEntryUrl + invalidPotEntry.id, invalidJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not update a potEntry by ID when fee is blank", async () => {
      const invalidPotEntry = {
        ...putPotEntry,
        fee: "",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.put(onePotEntryUrl + invalidPotEntry.id, invalidJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not update a potEntry by ID when fee is too low", async () => {
      const invalidPotEntry = {
        ...putPotEntry,
        fee: "-1",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.put(onePotEntryUrl + invalidPotEntry.id, invalidJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not update a potEntry by ID when fee is too high", async () => {
      const invalidPotEntry = {
        ...putPotEntry,
        fee: "1234567890",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.put(onePotEntryUrl + invalidPotEntry.id, invalidJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not update a potEntry by ID when fee is not a number", async () => {
      const invalidPotEntry = {
        ...putPotEntry,
        fee: "not a number",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.put(onePotEntryUrl + invalidPotEntry.id, invalidJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
  });

  describe("PATCH one potEntry API: /api/potEntries/potEntry/:id", () => {
    const toPatch = {
      id: testPotEntry.id,
    };

    const doResetPotEntry = async () => {
      try {
        const playerJSON = JSON.stringify(testPotEntry);
        await axios.put(onePotEntryUrl + testPotEntry.id, playerJSON, {
          withCredentials: true
        });
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    };

    let didPatch = false;

    beforeAll(async () => {
      await doResetPotEntry();
    });

    beforeEach(() => {
      didPatch = false;
    });

    afterEach(async () => {
      if (didPatch) {
        await doResetPotEntry();
      }
    });

    it("should patch pot_id in a potEntry by ID", async () => {
      const toPatchedPotId = "pot_89fd8f787de942a1a92aaa2df3e7c185";
      const patchPotEntry = {
        ...toPatch,
        pot_id: toPatchedPotId,
      };
      const potEntryJSON = JSON.stringify(patchPotEntry);
      const response = await axios.patch(onePotEntryUrl + patchPotEntry.id, potEntryJSON,
        { withCredentials: true }
      );
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedPotEntry = response.data.potEntry;
      expect(patchedPotEntry.id).toBe(toPatch.id);
      expect(patchedPotEntry.pot_id).toBe(toPatchedPotId);
    });
    it("should patch player_id in a potEntry by ID", async () => {
      const toPatchedPlayerId = "ply_a01758cff1cc4bab9d9133e661bd49b0";
      const patchPotEntry = {
        ...toPatch,
        player_id: toPatchedPlayerId,
      };
      const potEntryJSON = JSON.stringify(patchPotEntry);
      const response = await axios.patch(onePotEntryUrl + patchPotEntry.id, potEntryJSON,
        { withCredentials: true }
      );
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedPotEntry = response.data.potEntry;
      expect(patchedPotEntry.id).toBe(toPatch.id);
      expect(patchedPotEntry.player_id).toBe(toPatchedPlayerId);
    });
    it("should patch fee in a potEntry by ID", async () => {
      const toPatchedFee = "23";
      const patchPotEntry = {
        ...toPatch,
        fee: toPatchedFee,
      };
      const potEntryJSON = JSON.stringify(patchPotEntry);
      const response = await axios.patch(onePotEntryUrl + patchPotEntry.id, potEntryJSON,
        { withCredentials: true }
      );
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedPotEntry = response.data.potEntry;
      expect(patchedPotEntry.id).toBe(toPatch.id);
      expect(patchedPotEntry.fee).toBe(toPatchedFee);
    });
    it("should not patch a potEntry by ID when pot_id is blank", async () => {
      const invalidPotEntry = {
        ...toPatch,
        pot_id: "",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.patch(onePotEntryUrl + invalidPotEntry.id, invalidJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not patch a potEntry by ID when pot_id is valid, but not a div id", async () => {
      const invalidPotEntry = {
        ...toPatch,
        pot_id: userId,
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.patch(onePotEntryUrl + invalidPotEntry.id, invalidJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not patch a potEntry by ID when pot_id is invalid", async () => {
      const invalidPotEntry = {
        ...toPatch,
        pot_id: "test",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.patch(onePotEntryUrl + invalidPotEntry.id, invalidJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not patch a potEntry by ID when pot_id is valid, but not a pot id", async () => {
      const invalidPotEntry = {
        ...toPatch,
        pot_id: userId,
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.patch(onePotEntryUrl + invalidPotEntry.id, invalidJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not patch a potEntry by ID when player_id is blank", async () => {
      const invalidPotEntry = {
        ...toPatch,
        player_id: "",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.patch(onePotEntryUrl + invalidPotEntry.id, invalidJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not patch a potEntry by ID when player_id is invalid", async () => {
      const invalidPotEntry = {
        ...toPatch,
        player_id: "test",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.patch(onePotEntryUrl + invalidPotEntry.id, invalidJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not patch a potEntry by ID when player_id is valid, but not a player id", async () => {
      const invalidPotEntry = {
        ...toPatch,
        player_id: userId,
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.patch(onePotEntryUrl + invalidPotEntry.id, invalidJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not patch a potEntry by ID when fee is blank", async () => {
      const invalidPotEntry = {
        ...toPatch,
        fee: "",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.patch(onePotEntryUrl + invalidPotEntry.id, invalidJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not patch a potEntry by ID when fee is too low", async () => {
      const invalidPotEntry = {
        ...toPatch,
        fee: "-1",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.patch(onePotEntryUrl + invalidPotEntry.id, invalidJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not patch a potEntry by ID when fee is too high", async () => {
      const invalidPotEntry = {
        ...toPatch,
        fee: "1234567890",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.patch(onePotEntryUrl + invalidPotEntry.id, invalidJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should not patch a potEntry by ID when fee is not a number", async () => {
      const invalidPotEntry = {
        ...toPatch,
        fee: "abc",
      };
      const invalidJSON = JSON.stringify(invalidPotEntry);
      try {
        const response = await axios.patch(onePotEntryUrl + invalidPotEntry.id, invalidJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
  });

  describe("DELETE by ID - API: /api/potEntries/potEntry/:id", () => {
    // from prisma/seeds.ts
    const toDelPotEntry = {
      ...initPotEntry,
      id: "pen_8c8b607b7ebb4e84a0753307afce256e",
      pot_id: "pot_791fb6d8a9a04cb4b3372e212da2a3b0",
      player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
      fee: '20',
    };

    let didDel = false;

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) return;
      // if deleted event, add event back
      try {
        const potEntryJSON = JSON.stringify(toDelPotEntry);
        await axios.post(url, potEntryJSON, { withCredentials: true });
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    });

    it("should delete a potEntry by ID", async () => {
      const response = await axios.delete(onePotEntryUrl + toDelPotEntry.id,
        { withCredentials: true }
      );
      expect(response.status).toBe(200);
      didDel = true;
      expect(response.data.count).toBe(1);      
    });
    it("should return 0 when deleting a potEntry by ID when id is not found", async () => {
      const response = await axios.delete(onePotEntryUrl + notFoundId,
        { withCredentials: true }
      );
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(0);
    });
    it("should NOT delete a potEntry by ID when ID is invalid", async () => {
      try {
        const response = await axios.delete(onePotEntryUrl + "invalid_id",
          { withCredentials: true }
        );
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT delete a potEntry by ID when id is valid, bit noy a potEntry id", async () => {
      try {
        const response = await axios.delete(onePotEntryUrl + userId,
          { withCredentials: true }
        );
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
  });

});
