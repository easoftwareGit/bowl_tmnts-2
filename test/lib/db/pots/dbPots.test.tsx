import axios, { AxiosError } from "axios";
import { basePotsApi } from "@/lib/db/apiPaths";
import { testBasePotsApi } from "../../../testApi";
import type { potCategoriesTypes, potType } from "@/lib/types/types";
import { initPot } from "@/lib/db/initVals";
import { mockPotsToPost} from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import {
  deleteAllPotsForDiv,
  deleteAllPotsForSquad,
  deleteAllPotsForTmnt,
  deletePot,
  getAllPotsForSquad,
  getAllPotsForTmnt,
  postManyPots,
  postPot,
  putPot,
  extractPots,
} from "@/lib/db/pots/dbPots";
import { cloneDeep } from "lodash";
import { replaceManyPots } from "@/lib/db/pots/dbPotsReplaceMany";

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

const notFoundDivId = 'div_00000000000000000000000000000000';
const notFoundTmntId = "tmt_00000000000000000000000000000000";
const notFoundSquadId = "sqd_00000000000000000000000000000000";
const userId = "usr_01234567890123456789012345678901";

describe("dbPots", () => {
  const rePostPot = async (pot: potType) => {
    try {
      // if pot already in database, then don't re-post
      const getResponse = await axios.get(potUrl + pot.id);
      const found = getResponse.data.pot;
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
      const potJSON = JSON.stringify(pot);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: potJSON,
      });
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  const rePostToDel = async (multiPots: potType[]) => {
    const response = await axios.get(url);
    const pots = response.data.pots;
    // find first test pot
    const foundToDel = pots.find((p: potType) => p.id === multiPots[0].id);
    if (!foundToDel) {
      try {
        await postManyPots(multiPots);
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
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
          id: 'pot_123',
          div_id: 'div_123',  
          squad_id: 'sqd_123',
          pot_type: 'Game' as potCategoriesTypes,
          fee: '20',  
          sort_order: 1,
          extraField: "ignore me", // should be ignored
        },
      ];

      const result = extractPots(rawPots);

      const expected: potType = {
        ...initPot,
        id: 'pot_123',
        div_id: 'div_123',  
        squad_id: 'sqd_123',
        pot_type: 'Game' as potCategoriesTypes,
        fee: '20',  
        sort_order: 1,
      };

      expect(result).toEqual([expected]);
    });

    it("should fill missing fields with defaults from blankPot", () => {
      const rawPots = [
        {
          id: "pot_123",
          squad_id: 'sqd_123',
          div_id: 'div_123',
          sort_order: 1,
          fee: '20',
          pot_type: "Game" as potCategoriesTypes,
        }
      ];

      const result = extractPots(rawPots);

      // every *_err field should be blank string
      expect(result[0].pot_type_err).toBe("");
      expect(result[0].div_err).toBe("");
      expect(result[0].fee_err).toBe("");
      expect(result[0].errClassName).toBe("");
    });

    it("should process multiple pots", () => {
      const rawPots = [
        {
          id: "pot_123",
          squad_id: 'sqd_123',
          div_id: 'div_123',
          sort_order: 1,
          fee: '20',
          pot_type: "Game" as potCategoriesTypes,
        },
        {
          id: "pot_124",
          squad_id: 'sqd_123',
          div_id: 'div_124',
          sort_order: 1,
          fee: '20',
          pot_type: "Game" as potCategoriesTypes,
        }
      ];

      const result = extractPots(rawPots);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("pot_123");
      expect(result[0].div_id).toBe("div_123");
      expect(result[1].id).toBe("pot_124");
      expect(result[1].div_id).toBe("div_124");
    });
    it('should return an empty array if given null', () => {
      const result = extractPots(null);
      expect(result).toEqual([]);
    });
    it('should return an empty array if given a non array', () => {
      const result = extractPots('not an array');
      expect(result).toEqual([]);
    });
  });

  describe("getAllPotsForSquad", () => {
    // from prisma/seed.ts
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
      if (!pots) return;
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
    })
  });

  describe("getAllPotsForTmnt", () => {
    // from prisma/seed.ts
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
      if (!pots) return;
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
    })
  });

  describe("postPot", () => {
    const deletePostedPot = async () => {
      const response = await axios.get(url);
      const pots = response.data.pots;
      const toDel = pots.find((p: potType) => p.sort_order === 13);
      if (toDel) {
        try {
          const delResponse = await axios({
            method: "delete",
            withCredentials: true,
            url: potUrl + toDel.id,
          });
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    };

    const potToPost = {
      ...initPot,
      squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
      div_id: "div_66d39a83d7a84a8c85d28d8d1b2c7a90",
      sort_order: 13,
      fee: "13",
      pot_type: "Game" as potCategoriesTypes,
    };

    let createdPot = false;

    beforeAll(async () => {
      await deletePostedPot();
    });

    beforeEach(() => {
      createdPot = false;
    });

    afterEach(async () => {
      if (createdPot) {
        await deletePostedPot();
      }
    });

    it("should post a pot", async () => {
      const postedPot = await postPot(potToPost);
      expect(postedPot).not.toBeNull();
      if (!postedPot) return;
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
      }
      catch (err) {
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
      }
      catch (err) {
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

  describe("postManyPots", () => {
    let createdPots = false;
    
    const pmTmntId = 'tmt_d9b1af944d4941f65b2d2d4ac160cdea'
    beforeAll(async () => {
      // remove any old test data
      await deleteAllPotsForTmnt(pmTmntId);
    });

    beforeEach(() => {
      createdPots = false;
    });

    afterEach(async () => {
      if (createdPots) {
        await deleteAllPotsForTmnt(pmTmntId);
      }
    });

    afterAll(async () => {
      await deleteAllPotsForTmnt(pmTmntId);
    });

    it("should post many pots", async () => {
      const count = await postManyPots(mockPotsToPost);
      expect(count).toBe(mockPotsToPost.length);
      createdPots = true;
      const postedPots = await getAllPotsForTmnt(pmTmntId);
      if (!postedPots) {
        expect(true).toBeFalsy();
        return;
      }
      expect(postedPots.length).toBe(mockPotsToPost.length);
      for (let i = 0; i < postedPots.length; i++) {
        if (postedPots[i].id === mockPotsToPost[0].id) {
          expect(postedPots[i].squad_id).toBe(mockPotsToPost[0].squad_id);
          expect(postedPots[i].div_id).toBe(mockPotsToPost[0].div_id);
          expect(postedPots[i].fee).toBe(mockPotsToPost[0].fee);
          expect(postedPots[i].pot_type).toBe(mockPotsToPost[0].pot_type);
          expect(postedPots[i].sort_order).toBe(mockPotsToPost[0].sort_order);
        } else if (postedPots[i].id === mockPotsToPost[1].id) {
          expect(postedPots[i].squad_id).toBe(mockPotsToPost[1].squad_id);
          expect(postedPots[i].div_id).toBe(mockPotsToPost[1].div_id);
          expect(postedPots[i].fee).toBe(mockPotsToPost[1].fee);
          expect(postedPots[i].pot_type).toBe(mockPotsToPost[1].pot_type);
          expect(postedPots[i].sort_order).toBe(mockPotsToPost[1].sort_order);
        } else if (postedPots[i].id === mockPotsToPost[2].id) {
          expect(postedPots[i].squad_id).toBe(mockPotsToPost[2].squad_id);
          expect(postedPots[i].div_id).toBe(mockPotsToPost[2].div_id);
          expect(postedPots[i].fee).toBe(mockPotsToPost[2].fee);
          expect(postedPots[i].pot_type).toBe(mockPotsToPost[2].pot_type);
          expect(postedPots[i].sort_order).toBe(mockPotsToPost[2].sort_order);
        } else { 
          expect(true).toBeFalsy();
        }         
      } 
    });
    it("should post sanitized pots", async () => {
      const toSanitize = [
        {
          ...mockPotsToPost[0],
          pot_type: "<script>Game</script>" as potCategoriesTypes,
        },
        {
          ...mockPotsToPost[1],
          pot_type: "   Last Game  ***  " as potCategoriesTypes,
        },
        {
          ...mockPotsToPost[2],
        },
      ];
      const count = await postManyPots(toSanitize);
      expect(count).toBe(toSanitize.length);
      createdPots = true;
      const postedPots = await getAllPotsForSquad(mockPotsToPost[0].squad_id);
      if (!postedPots) {
        expect(true).toBeFalsy();
        return;
      }
      expect(postedPots.length).toBe(toSanitize.length);
      for (let i = 0; i < postedPots.length; i++) {
        if (postedPots[i].id === toSanitize[0].id) {
          expect(postedPots[i].squad_id).toBe(toSanitize[0].squad_id);
          expect(postedPots[i].div_id).toBe(toSanitize[0].div_id);
          expect(postedPots[i].fee).toBe(toSanitize[0].fee);
          expect(postedPots[i].pot_type).toBe('Game');
          expect(postedPots[i].sort_order).toBe(toSanitize[0].sort_order);
        } else if (postedPots[i].id === toSanitize[1].id) {
          expect(postedPots[i].squad_id).toBe(toSanitize[1].squad_id);
          expect(postedPots[i].div_id).toBe(toSanitize[1].div_id);
          expect(postedPots[i].fee).toBe(toSanitize[1].fee);
          expect(postedPots[i].pot_type).toBe('Last Game');
          expect(postedPots[i].sort_order).toBe(toSanitize[1].sort_order);
        } else if (postedPots[i].id === toSanitize[2].id) {
          expect(postedPots[i].squad_id).toBe(toSanitize[2].squad_id);
          expect(postedPots[i].div_id).toBe(toSanitize[2].div_id);
          expect(postedPots[i].fee).toBe(toSanitize[2].fee);
          expect(postedPots[i].pot_type).toBe(toSanitize[2].pot_type);
          expect(postedPots[i].sort_order).toBe(toSanitize[2].sort_order);
        } else { 
          expect(true).toBeFalsy();
        }         
      }
    });
    it("should return 0 when passed an empty array", async () => {
      const count = await postManyPots([]);
      expect(count).toBe(0);
    });
    it("should throw error when invalid pot id in first item", async () => {
      try {
        const invalidPots = cloneDeep(mockPotsToPost);
        invalidPots[0].id = "test";
        await postManyPots(invalidPots);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid pot data at index 0");
      }
    });
    it("should throw error when with invalid pot id in second item", async () => {
      try {
        const invalidPots = cloneDeep(mockPotsToPost);
        invalidPots[1].id = "test";
        await postManyPots(invalidPots);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid pot data at index 1");
      }
    });
    it("should throw error when trying to post many pots with invalid data in first item", async () => {
      try {
        const invalidPots = cloneDeep(mockPotsToPost);
        invalidPots[0].fee = '-13';
        await postManyPots(invalidPots);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid pot data at index 0");
      }
    });
    it("should throw error when trying to post many pots with invalid data in second item", async () => {
      try {
        const invalidPots = cloneDeep(mockPotsToPost);
        invalidPots[1].pot_type = 'test' as potCategoriesTypes;
        await postManyPots(invalidPots);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid pot data at index 1");
      }
    });
    it("should throw error when passed an non array", async () => {
      try {
        await postManyPots("not an array" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid pots data");
      }
    });
    it("should throw error when passed null", async () => {
      try {
        await postManyPots(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid pots data");
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
        const response = await axios({
          method: "put",
          data: potJSON,
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

    it("should put a pot", async () => {
      const sanitziedPot = cloneDeep(potToPut);
      sanitziedPot.pot_type = '   Series *****' as potCategoriesTypes;
      const puttedPot = await putPot(sanitziedPot);
      expect(puttedPot).not.toBeNull();
      if (!puttedPot) return;
      didPut = true;
      expect(puttedPot.id).toEqual(potToPut.id);
      expect(puttedPot.squad_id).toEqual(potToPut.squad_id);
      expect(puttedPot.div_id).toEqual(potToPut.div_id);
      expect(puttedPot.fee).toEqual(potToPut.fee);
      expect(puttedPot.pot_type).toEqual('Series');
      expect(puttedPot.sort_order).toEqual(potToPut.sort_order);
    });
    it("should put a pot with sanitized data", async () => {
      const puttedPot = await putPot(potToPut);
      expect(puttedPot).not.toBeNull();
      if (!puttedPot) return;
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

  describe("replaceManyPots()", () => {
    // const rmSquadId = "sqd_853edbcc963745b091829e3eadfcf064";
    // const rmTmntId = "tmt_2d494e9bb51f4b9abba428c3f37131c9";
    const rmTmntId = 'tmt_d9b1af944d4941f65b2d2d4ac160cdea';
    const rmSquadId = "sqd_42be0f9d527e4081972ce8877190489d";
    let createdPots = false;

    beforeAll(async () => {
      await deleteAllPotsForTmnt(rmTmntId);
    });

    beforeEach(() => {
      createdPots = false;
      // Reset the mocks before each test to ensure test isolation
    });

    afterEach(async () => {
      if (createdPots) {
        await deleteAllPotsForTmnt(rmTmntId);
      }
    });    

    it("should update, insert, delete many players", async () => {
      const toInsert: potType[] = [
        {
          ...initPot, 
          id: "pot_04758d99c5494efabb3b0d273cf22e7a",
          squad_id: rmSquadId,
          div_id: 'div_18997d3fd7ef4eb7ad2b53a9e93f9ce5',
          sort_order: 13,
          fee: '50',
          pot_type: "Series" as potCategoriesTypes,
        },
      ];

      const count = await postManyPots(mockPotsToPost);
      expect(count).toBe(mockPotsToPost.length);
      createdPots = true;
      const pots = await getAllPotsForSquad(
        mockPotsToPost[0].squad_id
      );
      if (!pots) {
        expect(true).toBeFalsy();
        return;
      }
      expect(pots.length).toEqual(mockPotsToPost.length);

      const potsToUpdate = [
        {
          ...mockPotsToPost[0],
          fee: '40',
        },
        {
          ...toInsert[0],
        },
      ];

      const replaceCount = await replaceManyPots(potsToUpdate, rmSquadId);
      expect(replaceCount).toBe(potsToUpdate.length);
      const replacedPots = await getAllPotsForSquad(rmSquadId);
      if (!replacedPots) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedPots.length).toEqual(potsToUpdate.length);
      for (let i = 0; i < replacedPots.length; i++) {
        expect(replacedPots[i].squad_id).toEqual(potsToUpdate[i].squad_id);
        expect(replacedPots[i].div_id).toEqual(potsToUpdate[i].div_id);
        if (replacedPots[i].id === potsToUpdate[0].id) {
          expect(replacedPots[i].fee).toEqual(potsToUpdate[0].fee);
          expect(replacedPots[i].pot_type).toEqual(potsToUpdate[0].pot_type);
          expect(replacedPots[i].sort_order).toEqual(
            potsToUpdate[0].sort_order
          );
        } else if (replacedPots[i].id === potsToUpdate[1].id) {
          expect(replacedPots[i].fee).toEqual(potsToUpdate[1].fee);
          expect(replacedPots[i].pot_type).toEqual(potsToUpdate[1].pot_type);
          expect(replacedPots[i].sort_order).toEqual(
            potsToUpdate[1].sort_order
          );
        } else {
          expect(true).toBefalsey();
        }
      }
    });
    it("should replace many pots - sanitized fee and pot type", async () => {
      const count = await postManyPots(mockPotsToPost);
      expect(count).toBe(mockPotsToPost.length);
      createdPots = true;
      const pots = await getAllPotsForSquad(rmSquadId);
      if (!pots) {
        expect(true).toBeFalsy();
        return;
      }
      expect(pots.length).toEqual(mockPotsToPost.length);

      const potsToUpdate = [
        {
          ...mockPotsToPost[0],
          pot_type: "<script>Game</script>" as potCategoriesTypes, 
          fee: "25.000",
        },
        {
          ...mockPotsToPost[1],
        },
      ];

      const replaceCount = await replaceManyPots(potsToUpdate, rmSquadId);
      expect(replaceCount).toBe(potsToUpdate.length);
      const replacedPots = await getAllPotsForSquad(rmSquadId);
      if (!replacedPots) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedPots.length).toEqual(potsToUpdate.length);
      for (let i = 0; i < replacedPots.length; i++) {
        expect(replacedPots[i].squad_id).toEqual(potsToUpdate[i].squad_id);
        expect(replacedPots[i].div_id).toEqual(potsToUpdate[i].div_id);
        if (replacedPots[i].id === potsToUpdate[0].id) {
          expect(replacedPots[i].fee).toEqual('25');
          expect(replacedPots[i].pot_type).toEqual('Game');
          expect(replacedPots[i].sort_order).toEqual(
            potsToUpdate[0].sort_order
          );
        } else if (replacedPots[i].id === potsToUpdate[1].id) {
          expect(replacedPots[i].fee).toEqual(potsToUpdate[1].fee);
          expect(replacedPots[i].pot_type).toEqual(potsToUpdate[1].pot_type);
          expect(replacedPots[i].sort_order).toEqual(
            potsToUpdate[1].sort_order
          );
        } else {
          expect(true).toBefalsey();
        }
      }
    });
    it("should return 0 when passed an empty array", async () => {
      const count = await postManyPots(mockPotsToPost);
      expect(count).toBe(mockPotsToPost.length);
      createdPots = true;
      const pots = await getAllPotsForSquad(rmSquadId);
      if (!pots) {
        expect(true).toBeFalsy();
        return;
      }
      expect(pots.length).toEqual(mockPotsToPost.length);

      const replaceCount = await replaceManyPots([], rmSquadId);
      expect(replaceCount).toBe(0);
      const replacedPots = await getAllPotsForSquad(rmSquadId);
      if (!replacedPots) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedPots.length).toEqual(0);
    });
    it("should throw an error for invalid pot ID in first item", async () => {
      const count = await postManyPots(mockPotsToPost);
      expect(count).toBe(mockPotsToPost.length);
      createdPots = true;
      const pots = await getAllPotsForSquad(rmSquadId);
      if (!pots) {
        expect(true).toBeFalsy();
        return;
      }
      expect(pots.length).toEqual(mockPotsToPost.length);

      const potsToUpdate = [
        {
          ...mockPotsToPost[0],
          id: "",
        },
        {
          ...mockPotsToPost[1],
        },
      ];
      await expect(
        replaceManyPots(potsToUpdate, rmSquadId)
      ).rejects.toThrow("Invalid pot data at index 0");
    });
    it("should throw an error for invalid pot ID in second item", async () => {
      const count = await postManyPots(mockPotsToPost);
      expect(count).toBe(mockPotsToPost.length);
      createdPots = true;
      const pots = await getAllPotsForSquad(rmSquadId);
      if (!pots) {
        expect(true).toBeFalsy();
        return;
      }
      expect(pots.length).toEqual(mockPotsToPost.length);

      const potsToUpdate = [
        {
          ...mockPotsToPost[0],          
        },
        {
          ...mockPotsToPost[1],
          id: "",
        },
      ];
      await expect(
        replaceManyPots(potsToUpdate, rmSquadId)
      ).rejects.toThrow("Invalid pot data at index 1");
    });
    it("should throw an error for invalid pot data in first item", async () => {
      const count = await postManyPots(mockPotsToPost);
      expect(count).toBe(mockPotsToPost.length);
      createdPots = true;
      const pots = await getAllPotsForSquad(rmSquadId);
      if (!pots) {
        expect(true).toBeFalsy();
        return;
      }
      expect(pots.length).toEqual(mockPotsToPost.length);

      const potsToUpdate = [
        {
          ...mockPotsToPost[0],
          fee: "-1",
        },
        {
          ...mockPotsToPost[1],
        },
      ];
      await expect(
        replaceManyPots(potsToUpdate, rmSquadId)
      ).rejects.toThrow("Invalid pot data at index 0");
    });
    it("should throw an error for invalid pot data in first item", async () => {
      const count = await postManyPots(mockPotsToPost);
      expect(count).toBe(mockPotsToPost.length);
      createdPots = true;
      const pots = await getAllPotsForSquad(rmSquadId);
      if (!pots) {
        expect(true).toBeFalsy();
        return;
      }
      expect(pots.length).toEqual(mockPotsToPost.length);

      const potsToUpdate = [
        {
          ...mockPotsToPost[0],          
        },
        {
          ...mockPotsToPost[1],
          pot_type: "" as potCategoriesTypes, 
        },
      ];
      await expect(
        replaceManyPots(potsToUpdate, rmSquadId)
      ).rejects.toThrow("Invalid pot data at index 1");
    });
    it("should throw an error if passed null as pots", async () => {
      await expect(replaceManyPots(null as any, rmSquadId)).rejects.toThrow(
        "Invalid pots"
      );
    });
    it("should throw an error if pots is not an array", async () => {
      await expect(
        replaceManyPots("not-an-array" as any, rmSquadId)
      ).rejects.toThrow("Invalid pots");
    });
    it("should throw an error if passed null as squadId", async () => {
      await expect(
        replaceManyPots(mockPotsToPost, null as any)
      ).rejects.toThrow("Invalid squad id");
    });
    it("should throw an error if passed invalid squadId", async () => {
      await expect(
        replaceManyPots(mockPotsToPost, "test")
      ).rejects.toThrow("Invalid squad id");
    });
    it("should throw an error if passed valid id, but not squad id", async () => {
      await expect(
        replaceManyPots(mockPotsToPost, userId)
      ).rejects.toThrow("Invalid squad id");
    });
  });

  describe("deletePot", () => {
    // toDel is data from prisma/seeds.ts
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
          `deletePot failed: Request failed with status code 404`
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

  describe("deleteAllPotsForDiv", () => {
    const multiPots = [
      {
        ...mockPotsToPost[0],
      },
      {
        ...mockPotsToPost[1],
      },
      {
        ...mockPotsToPost[2],
      },
    ];

    let didDel = false;

    beforeAll(async () => {
      // cleanup before tests      
      await deleteAllPotsForDiv(multiPots[0].div_id);
      // setup for tests
      await rePostToDel(multiPots);
    });

    beforeEach(async () => {
      if (didDel) {
        await rePostToDel(multiPots);
      }
    });

    afterEach(async () => {
      didDel = false;
    });

    afterAll(async () => {      
      await deleteAllPotsForDiv(multiPots[0].div_id);
    });

    it("should delete all pots for a squad", async () => {
      const deleted = await deleteAllPotsForSquad(multiPots[0].squad_id);
      expect(deleted).toBe(multiPots.length);
      didDel = true;
    });
    it("should NOT delete all pots for a squad when ID is not found", async () => {            
      const deleted = await deleteAllPotsForSquad(notFoundSquadId);
      expect(deleted).toBe(0);
    });
    it("should throw error when trying to delete all pots for a squad when ID is invalid", async () => {
      try {
        await deleteAllPotsForSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should throw error when trying to delete all pots for a squad when ID is valid, but not a squad ID", async () => {
      try {
        await deleteAllPotsForSquad(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should throw error when trying to delete all pots for a squad when ID is null", async () => {
      try {
        await deleteAllPotsForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
  });

  describe("deleteAllPotsForSquad", () => {    
    const multiPots = [
      {
        ...mockPotsToPost[0],
      },
      {
        ...mockPotsToPost[1],
      },
      {
        ...mockPotsToPost[2],
      },
    ];

    let didDel = false;

    beforeAll(async () => {
      // cleanup before tests
      await deleteAllPotsForSquad(multiPots[0].squad_id);
      // setup for tests
      await rePostToDel(multiPots);
    });

    beforeEach(async () => {
      if (didDel) {
        await rePostToDel(multiPots);
      }
    });

    afterEach(async () => {
      didDel = false;
    });

    afterAll(async () => {
      await deleteAllPotsForSquad(multiPots[0].squad_id);
    });

    it("should delete all pots for a div", async () => {
      const deleted = await deleteAllPotsForDiv(multiPots[0].div_id);
      expect(deleted).toBe(multiPots.length);
      didDel = true;
    });
    it("should NOT delete all pots for a div when ID is not found", async () => {
      const deleted = await deleteAllPotsForDiv(notFoundDivId);
      expect(deleted).toBe(0);
    });
    it("should throw error when trying to delete all pots for a div when ID is invalid", async () => {
      try {
        await deleteAllPotsForDiv("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should throw error when trying to delete all pots for a div when ID is valid, but not a div ID", async () => {
      try {
        await deleteAllPotsForDiv(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should throw error when trying to delete all pots for a div when ID is null", async () => {
      try {
        await deleteAllPotsForDiv(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
  });

  describe("deleteAllPotsForTmnt", () => {
    // const toDelTmntId = 'tmt_2d494e9bb51f4b9abba428c3f37131c9'
    const toDelTmntId = 'tmt_d9b1af944d4941f65b2d2d4ac160cdea'
    const multiPots = [
      {
        ...mockPotsToPost[0],
      },
      {
        ...mockPotsToPost[1],
      },
      {
        ...mockPotsToPost[2],
      },
    ];

    let didDel = false;

    beforeAll(async () => {
      // cleanup before tests
      await deleteAllPotsForSquad(multiPots[0].squad_id);
      // setup for tests
      await rePostToDel(multiPots);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) return;
      await rePostToDel(multiPots);
    });

    afterAll(async () => {
      await deleteAllPotsForSquad(multiPots[0].squad_id);
    });

    it("should delete all pots for a tmnt", async () => {
      const deleted = await deleteAllPotsForTmnt(toDelTmntId);
      didDel = true;
      expect(deleted).toBe(multiPots.length);
    });
    it("should NOT delete all pots for a tmnt when ID is not found", async () => {
      const deleted = await deleteAllPotsForTmnt(notFoundTmntId);
      expect(deleted).toBe(0);
    });
    it("should throw error when trying to delete all pots for a tmnt when ID is invalid", async () => {
      try {
        await deleteAllPotsForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error when trying to delete all pots for a tmnt when ID is valid, but not a tmnt ID", async () => {
      try {
        await deleteAllPotsForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error when trying to delete all pots for a tmnt when ID is null", async () => {
      try {
        await deleteAllPotsForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });
});
