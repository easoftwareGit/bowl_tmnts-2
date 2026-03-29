import axios from "axios";
import { publicApi, privateApi } from "@/lib/api/axios";
import { basePotsApi } from "@/lib/api/apiPaths";
import { testBasePotsApi } from "../../../testApi";
import type { potCategoriesTypes, potType } from "@/lib/types/types";
import { initPot } from "@/lib/db/initVals";
import {
  deletePot,
  getAllPotsForSquad,
  getAllPotsForTmnt,
  postPot,
  putPot,
  extractPots,
} from "@/lib/db/pots/dbPots";
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

const url = testBasePotsApi.startsWith("undefined")
  ? basePotsApi
  : testBasePotsApi;
const potUrl = url + "/pot/";

const notFoundTmntId = "tmt_00000000000000000000000000000000";
const notFoundSquadId = "sqd_00000000000000000000000000000000";
const userId = "usr_01234567890123456789012345678901";

const potToPost = {
  ...initPot,
  id: "pot_1234567890abcdef1234567890abcdef",
  squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
  div_id: "div_66d39a83d7a84a8c85d28d8d1b2c7a90",
  sort_order: 13,
  fee: "13",
  pot_type: "Game" as potCategoriesTypes,
};

describe("dbPots", () => {
  const rePostPot = async (pot: potType) => {
    try {
      // if pot already in database, then don't re-post
      const getResponse = await publicApi.get(potUrl + pot.id);
      const found = getResponse.data?.pot;
      if (found) return;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status !== 404) {
          console.log(err.message);
          return;
        }
      }
    }

    try {
      // if not in database, then re-post
      const potJSON = JSON.stringify(pot);
      await privateApi.post(url, potJSON);
    } catch (err) {
      if (axios.isAxiosError(err)) console.log(err.message);
    }
  };

  const deletePostedPot = async (potId: string) => {
    try {
      await privateApi.delete(potUrl + potId);
    } catch (err) {
      if (axios.isAxiosError(err)) console.log(err.message);
    }
  };

  describe("extractPots", () => {
    it("should return an empty array when given an empty array", () => {
      const result = extractPots([]);
      expect(result).toEqual([]);
    });

    it("should correctly map raw pots to potType", () => {
      const rawPots = [
        {
          id: "pot_123",
          div_id: "div_123",
          squad_id: "sqd_123",
          pot_type: "Game" as potCategoriesTypes,
          fee: "20",
          sort_order: 1,
          extraField: "ignore me",
        },
      ];

      const result = extractPots(rawPots);

      const expected: potType = {
        ...initPot,
        id: "pot_123",
        div_id: "div_123",
        squad_id: "sqd_123",
        pot_type: "Game" as potCategoriesTypes,
        fee: "20",
        sort_order: 1,
      };

      expect(result).toEqual([expected]);
    });

    it("should fill missing fields with defaults from blankPot", () => {
      const rawPots = [
        {
          id: "pot_123",
          squad_id: "sqd_123",
          div_id: "div_123",
          sort_order: 1,
          fee: "20",
          pot_type: "Game" as potCategoriesTypes,
        },
      ];

      const result = extractPots(rawPots);

      expect(result[0].pot_type_err).toBe("");
      expect(result[0].div_err).toBe("");
      expect(result[0].fee_err).toBe("");
      expect(result[0].errClassName).toBe("");
    });

    it("should process multiple pots", () => {
      const rawPots = [
        {
          id: "pot_123",
          squad_id: "sqd_123",
          div_id: "div_123",
          sort_order: 1,
          fee: "20",
          pot_type: "Game" as potCategoriesTypes,
        },
        {
          id: "pot_124",
          squad_id: "sqd_123",
          div_id: "div_124",
          sort_order: 1,
          fee: "20",
          pot_type: "Game" as potCategoriesTypes,
        },
      ];

      const result = extractPots(rawPots);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("pot_123");
      expect(result[0].div_id).toBe("div_123");
      expect(result[1].id).toBe("pot_124");
      expect(result[1].div_id).toBe("div_124");
    });

    it("should return an empty array if given null", () => {
      const result = extractPots(null);
      expect(result).toEqual([]);
    });

    it("should return an empty array if given a non array", () => {
      const result = extractPots("not an array");
      expect(result).toEqual([]);
    });
  });

  describe("getAllPotsForSquad", () => {
    const potsToGet: potType[] = [
      {
        ...initPot,
        id: "pot_98b3a008619b43e493abf17d9f462a65",
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 1,
        fee: "10",
        pot_type: "Game",
      },
      {
        ...initPot,
        id: "pot_ab80213899ea424b938f52a062deacfe",
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 2,
        fee: "10",
        pot_type: "Last Game",
      },
    ];

    it("should get all pots for squad", async () => {
      const pots = await getAllPotsForSquad(potsToGet[0].squad_id);
      expect(pots).toHaveLength(potsToGet.length);

      for (let i = 0; i < potsToGet.length; i++) {
        expect(pots[i].id).toEqual(potsToGet[i].id);
        expect(pots[i].squad_id).toEqual(potsToGet[i].squad_id);
        expect(pots[i].div_id).toEqual(potsToGet[i].div_id);
        expect(pots[i].sort_order).toEqual(potsToGet[i].sort_order);
        expect(pots[i].fee).toEqual(potsToGet[i].fee);
        expect(pots[i].pot_type).toEqual(potsToGet[i].pot_type);
      }
    });

    it("should return 0 pots for not found squad", async () => {
      const pots = await getAllPotsForSquad(notFoundSquadId);
      expect(pots).toHaveLength(0);
    });

    it("should thorw error if squad id is invalid", async () => {
      try {
        await getAllPotsForSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });

    it("should throw error if squad id is valid, but not a squad id", async () => {
      try {
        await getAllPotsForSquad(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });

    it("should throw error if squad id is null", async () => {
      try {
        await getAllPotsForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
  });

  describe("getAllPotsForTmnt", () => {
    const tmntId = "tmt_56d916ece6b50e6293300248c6792316";
    const potsToGet: potType[] = [
      {
        ...initPot,
        id: "pot_98b3a008619b43e493abf17d9f462a65",
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 1,
        fee: "10",
        pot_type: "Game",
      },
      {
        ...initPot,
        id: "pot_ab80213899ea424b938f52a062deacfe",
        squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
        div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
        sort_order: 2,
        fee: "10",
        pot_type: "Last Game",
      },
    ];

    it("should get all pots for tmnt", async () => {
      const pots = await getAllPotsForTmnt(tmntId);
      expect(pots).toHaveLength(potsToGet.length);

      for (let i = 0; i < potsToGet.length; i++) {
        expect(pots[i].id).toEqual(potsToGet[i].id);
        expect(pots[i].squad_id).toEqual(potsToGet[i].squad_id);
        expect(pots[i].div_id).toEqual(potsToGet[i].div_id);
        expect(pots[i].sort_order).toEqual(potsToGet[i].sort_order);
        expect(pots[i].fee).toEqual(potsToGet[i].fee);
        expect(pots[i].pot_type).toEqual(potsToGet[i].pot_type);
      }
    });

    it("should return 0 pots for not found tmnt", async () => {
      const pots = await getAllPotsForTmnt(notFoundTmntId);
      expect(pots).toHaveLength(0);
    });

    it("should throw error if tmnt id is invalid", async () => {
      try {
        await getAllPotsForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });

    it("should throw error if tmnt id is valid, but not a tmnt id", async () => {
      try {
        await getAllPotsForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });

    it("should throw error if tmnt id is null", async () => {
      try {
        await getAllPotsForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });

  describe("postPot", () => {
    let createdPot = false;

    beforeAll(async () => {
      await deletePostedPot(potToPost.id);
    });

    beforeEach(() => {
      createdPot = false;
    });

    afterEach(async () => {
      if (createdPot) {
        await deletePostedPot(potToPost.id);
      }
    });

    it("should post a pot", async () => {
      const postedPot = await postPot(potToPost);
      createdPot = true;

      expect(postedPot.id).toBe(potToPost.id);
      expect(postedPot.squad_id).toBe(potToPost.squad_id);
      expect(postedPot.div_id).toBe(potToPost.div_id);
      expect(postedPot.fee).toBe(potToPost.fee);
      expect(postedPot.pot_type).toBe(potToPost.pot_type);
      expect(postedPot.sort_order).toBe(potToPost.sort_order);
    });

    it("should throw error when trying to post a pot with invalid sanitized", async () => {
      try {
        const invalidPot = {
          ...potToPost,
          fee: "   20    ",
        };
        await postPot(invalidPot);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "postPot failed: Request failed with status code 422"
        );
      }
    });

    it("should throw error when trying to post a pot with invalid data", async () => {
      try {
        const invalidPot = {
          ...potToPost,
          fee: "-13",
        };
        await postPot(invalidPot);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "postPot failed: Request failed with status code 422"
        );
      }
    });

    it("should throw error when post a pot if got null", async () => {
      try {
        await postPot(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid pot data");
      }
    });

    it("should throw error when post a pot if got not an object", async () => {
      try {
        await postPot("test" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid pot data");
      }
    });
  });

  describe("putPot", () => {
    const potToPut = {
      ...initPot,
      id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
      sort_order: 13,
      fee: "13",
      pot_type: "Last Game" as potCategoriesTypes,
    };

    const putUrl = potUrl + potToPut.id;

    const resetPot = {
      ...initPot,
      id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
      sort_order: 1,
      fee: "20",
      pot_type: "Game" as potCategoriesTypes,
    };

    const doReset = async () => {
      try {
        const potJSON = JSON.stringify(resetPot);
        await privateApi.put(putUrl, potJSON);
      } catch (err) {
        if (axios.isAxiosError(err)) console.log(err.message);
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

    it("should put a pot", async () => {
      const sanitziedPot = cloneDeep(potToPut);
      sanitziedPot.pot_type = "   Series *****" as potCategoriesTypes;

      const puttedPot = await putPot(sanitziedPot);
      didPut = true;

      expect(puttedPot.id).toEqual(potToPut.id);
      expect(puttedPot.squad_id).toEqual(potToPut.squad_id);
      expect(puttedPot.div_id).toEqual(potToPut.div_id);
      expect(puttedPot.fee).toEqual(potToPut.fee);
      expect(puttedPot.pot_type).toEqual("Series");
      expect(puttedPot.sort_order).toEqual(potToPut.sort_order);
    });

    it("should put a pot with sanitized data", async () => {
      const puttedPot = await putPot(potToPut);
      didPut = true;

      expect(puttedPot.id).toEqual(potToPut.id);
      expect(puttedPot.squad_id).toEqual(potToPut.squad_id);
      expect(puttedPot.div_id).toEqual(potToPut.div_id);
      expect(puttedPot.fee).toEqual(potToPut.fee);
      expect(puttedPot.pot_type).toEqual(potToPut.pot_type);
      expect(puttedPot.sort_order).toEqual(potToPut.sort_order);
    });

    it("should throw error when trying to put a pot with invalid data", async () => {
      try {
        const invalidPot = {
          ...potToPut,
          fee: "-13",
        };
        await putPot(invalidPot);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "putPot failed: Request failed with status code 422"
        );
      }
    });

    it("should thorw error when trying to put a pot when passed null", async () => {
      try {
        await putPot(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid pot data");
      }
    });

    it("should thorw error when trying to put a pot when passed non object", async () => {
      try {
        await putPot("test" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid pot data");
      }
    });
  });

  describe("deletePot", () => {
    const toDel = {
      ...initPot,
      id: "pot_e3758d99c5494efabb3b0d273cf22e7a",
      squad_id: "sqd_853edbcc963745b091829e3eadfcf064",
      div_id: "div_621bfee84e774d5a9dc2e9b6bdc5d31c",
      sort_order: 1,
      fee: "20",
      pot_type: "Game" as potCategoriesTypes,
    };

    const nonFoundId = "pot_00000000000000000000000000000000";

    let didDel = false;

    beforeAll(async () => {
      await rePostPot(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostPot(toDel);
      }
    });

    it("should delete a pot", async () => {
      const deleted = await deletePot(toDel.id);
      expect(deleted).toBe(1);
      didDel = true;
    });

    it("should throw error when trying to delete a pot when ID is not found", async () => {
      try {
        await deletePot(nonFoundId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "deletePot failed: Request failed with status code 404"
        );
      }
    });

    it("should throw error when trying to delete a pot when ID is invalid", async () => {
      try {
        await deletePot("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid pot id");
      }
    });

    it("should throw error when trying to delete a pot when ID is valid, but not a pot ID", async () => {
      try {
        await deletePot(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid pot id");
      }
    });

    it("should not delete a pot when ID is null", async () => {
      try {
        await deletePot(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid pot id");
      }
    });
  });
});
