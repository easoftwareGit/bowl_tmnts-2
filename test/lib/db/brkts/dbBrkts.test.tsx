import axios, { AxiosError } from "axios";
import { baseBrktsApi } from "@/lib/api/apiPaths";
import { testBaseBrktsApi } from "../../../testApi";
import type { brktType } from "@/lib/types/types";
import { initBrkt } from "@/lib/db/initVals";
import { mockTmntFullData } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import {
  deleteBrkt,
  getAllBrktsForSquad,
  getAllBrktsForTmnt,
  postBrkt,
  putBrkt,
  extractBrkts,
  getAllBrktsForDiv,
} from "@/lib/db/brkts/dbBrkts";

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

const url = testBaseBrktsApi.startsWith("undefined")
  ? baseBrktsApi
  : testBaseBrktsApi;
const oneBrktUrl = url + "/brkt/";

const divId = "div_f30aea2c534f4cfe87f4315531cef8ef";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";

const notFoundDivId = "div_00000000000000000000000000000000";
const notFoundSquadId = "sqd_00000000000000000000000000000000";
const notFoundTmntId = "tmt_00000000000000000000000000000000";

const brktsToGet: brktType[] = [
  {
    ...initBrkt,
    id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    sort_order: 1,
    start: 1,
    games: 3,
    players: 8,
    fee: "5",
    first: "25",
    second: "10",
    admin: "5",
    fsa: "40",
  },
  {
    ...initBrkt,
    id: "brk_6ede2512c7d4409ca7b055505990a499",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    sort_order: 2,
    start: 4,
    games: 3,
    players: 8,
    fee: "5",
    first: "25",
    second: "10",
    admin: "5",
    fsa: "40",
  },
];

const multiBrkts = [
  {
    ...mockTmntFullData.brkts[0],
  },
  {
    ...mockTmntFullData.brkts[1],
  },
];

describe("dbBrkts", () => {
  const rePostBrkt = async (brkt: brktType) => {
    try {
      // if brkt already in database, then don't re-post
      const getResponse = await axios.get(oneBrktUrl + brkt.id);
      const found = getResponse.data.brkt;
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
      const brktJSON = JSON.stringify(brkt);
      await axios.post(url, brktJSON, {
        withCredentials: true,
      });
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  describe("extractBrkts()", () => {
    it("should return an empty array when given an empty array", () => {
      const result = extractBrkts([]);
      expect(result).toEqual([]);
    });
    it("should correctly map raw brkts to brktType", () => {
      const rawBrkts = [
        {
          ...initBrkt,
          id: "brk_123",
          div_id: "div_123",
          squad_id: "sqd_123",
          fee: "5",
          start: 1,
          games: 3,
          players: 8,
          first: "25",
          second: "10",
          admin: "5",
          sort_order: 1,
          extraField: "ignore me", // should be ignored
        },
      ];

      const result = extractBrkts(rawBrkts);

      const expected: brktType = {
        ...initBrkt,
        id: "brk_123",
        div_id: "div_123",
        squad_id: "sqd_123",
        fee: "5",
        start: 1,
        games: 3,
        players: 8,
        first: "25",
        second: "10",
        admin: "5",
        fsa: "40",
        sort_order: 1,
      };

      expect(result).toEqual([expected]);
    });
    it("should process multiple brkts", () => {
      const rawBrkts = [
        {
          ...initBrkt,
          id: "brk_123",
          div_id: "div_123",
          squad_id: "sqd_123",
          fee: "5",
          start: 1,
          games: 3,
          players: 8,
          first: "25",
          second: "10",
          admin: "5",
          sort_order: 1,
        },
        {
          ...initBrkt,
          id: "brk_124",
          div_id: "div_123",
          squad_id: "sqd_123",
          fee: "5",
          start: 4,
          games: 3,
          players: 8,
          first: "25",
          second: "10",
          admin: "5",
          sort_order: 2,
        },
      ];

      const result = extractBrkts(rawBrkts);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("brk_123");
      expect(result[0].start).toBe(1);
      expect(result[1].id).toBe("brk_124");
      expect(result[1].start).toBe(4);
    });
    it("should return empty array when given null", () => {
      const result = extractBrkts(null);
      expect(result).toEqual([]);
    });
    it("should return empty array when given non-array", () => {
      const result = extractBrkts("not an array");
      expect(result).toEqual([]);
    });
  });

  describe("getAllBrktsForTmnt", () => {
    it("should get all brkts for tmnt", async () => {
      const brkts = await getAllBrktsForTmnt(tmntId);
      expect(brkts).toHaveLength(brktsToGet.length);
      if (!brkts) return;
      for (let i = 0; i < brkts.length; i++) {
        expect(brkts[i].id).toEqual(brktsToGet[i].id);
        expect(brkts[i].squad_id).toEqual(brktsToGet[i].squad_id);
        expect(brkts[i].div_id).toEqual(brktsToGet[i].div_id);
        expect(brkts[i].sort_order).toEqual(brktsToGet[i].sort_order);
        expect(brkts[i].start).toEqual(brktsToGet[i].start);
        expect(brkts[i].games).toEqual(brktsToGet[i].games);
        expect(brkts[i].players).toEqual(brktsToGet[i].players);
        expect(brkts[i].fee).toEqual(brktsToGet[i].fee);
        expect(brkts[i].first).toEqual(brktsToGet[i].first);
        expect(brkts[i].second).toEqual(brktsToGet[i].second);
        expect(brkts[i].admin).toEqual(brktsToGet[i].admin);
        expect(brkts[i].fsa + "").toEqual(brktsToGet[i].fsa);
      }
    });
    it("should return 0 brkts for not found tmnt", async () => {
      const brkts = await getAllBrktsForTmnt(notFoundTmntId);
      expect(brkts).toHaveLength(0);
    });
    it("should throw error if if tmnt id is invalid", async () => {
      try {
        await getAllBrktsForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error if if tmnt id is valid, but not a tmnt id", async () => {
      try {
        await getAllBrktsForTmnt(brktsToGet[0].id);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error if if tmnt id is null", async () => {
      try {
        await getAllBrktsForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });

  describe("getAllBrktsForSquad", () => {
    it("should get all brkts for squad", async () => {
      const brkts = await getAllBrktsForSquad(squadId);
      expect(brkts).toHaveLength(brktsToGet.length);
      if (!brkts) return;
      for (let i = 0; i < brkts.length; i++) {
        expect(brkts[i].id).toEqual(brktsToGet[i].id);
        expect(brkts[i].squad_id).toEqual(brktsToGet[i].squad_id);
        expect(brkts[i].div_id).toEqual(brktsToGet[i].div_id);
        expect(brkts[i].sort_order).toEqual(brktsToGet[i].sort_order);
        expect(brkts[i].start).toEqual(brktsToGet[i].start);
        expect(brkts[i].games).toEqual(brktsToGet[i].games);
        expect(brkts[i].players).toEqual(brktsToGet[i].players);
        expect(brkts[i].fee).toEqual(brktsToGet[i].fee);
        expect(brkts[i].first).toEqual(brktsToGet[i].first);
        expect(brkts[i].second).toEqual(brktsToGet[i].second);
        expect(brkts[i].admin).toEqual(brktsToGet[i].admin);
        expect(brkts[i].fsa + "").toEqual(brktsToGet[i].fsa);
      }
    });
    it("should return 0 brkts for not found squad", async () => {
      const brkts = await getAllBrktsForSquad(notFoundSquadId);
      expect(brkts).toHaveLength(0);
    });
    it("should throw error if if squad id is invalid", async () => {
      try {
        await getAllBrktsForSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should throw error if if squad id is valid, but not a squad id", async () => {
      try {
        await getAllBrktsForSquad(brktsToGet[0].id);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should throw error if if squad id is null", async () => {
      try {
        await getAllBrktsForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
  });

  describe("getAllBrktsForDiv", () => {
    it("should get all brkts for div", async () => {
      const brkts = await getAllBrktsForDiv(divId);
      expect(brkts).toHaveLength(brktsToGet.length);
      if (!brkts) return;
      for (let i = 0; i < brkts.length; i++) {
        expect(brkts[i].id).toEqual(brktsToGet[i].id);
        expect(brkts[i].squad_id).toEqual(brktsToGet[i].squad_id);
        expect(brkts[i].div_id).toEqual(brktsToGet[i].div_id);
        expect(brkts[i].sort_order).toEqual(brktsToGet[i].sort_order);
        expect(brkts[i].start).toEqual(brktsToGet[i].start);
        expect(brkts[i].games).toEqual(brktsToGet[i].games);
        expect(brkts[i].players).toEqual(brktsToGet[i].players);
        expect(brkts[i].fee).toEqual(brktsToGet[i].fee);
        expect(brkts[i].first).toEqual(brktsToGet[i].first);
        expect(brkts[i].second).toEqual(brktsToGet[i].second);
        expect(brkts[i].admin).toEqual(brktsToGet[i].admin);
        expect(brkts[i].fsa + "").toEqual(brktsToGet[i].fsa);
      }
    });
    it("should return 0 brkts for not found div", async () => {
      const brkts = await getAllBrktsForDiv(notFoundDivId);
      expect(brkts).toHaveLength(0);
    });
    it("should throw error if if div id is invalid", async () => {
      try {
        await getAllBrktsForDiv("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should throw error if if div id is valid, but not a div id", async () => {
      try {
        await getAllBrktsForDiv(brktsToGet[0].id);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should throw error if if div id is null", async () => {
      try {
        await getAllBrktsForDiv(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
  });

  describe("postBrkt", () => {
    const brktToPost = {
      ...initBrkt,
      squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
      div_id: "div_66d39a83d7a84a8c85d28d8d1b2c7a90",
      sort_order: 1,
      start: 1,
      games: 3,
      players: 8,
      fee: "4",
      first: "20",
      second: "8",
      admin: "4",
      fsa: "32",
    };

    let createdBrkt = false;

    const deletePostedBrkt = async () => {
      const response = await axios.get(url);
      const brkts = response.data.brkts;
      const toDel = brkts.find((b: brktType) => b.fee === "4");
      if (toDel) {
        try {
          const delResponse = await axios({
            method: "delete",
            withCredentials: true,
            url: oneBrktUrl + toDel.id,
          });
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    };

    beforeAll(async () => {
      await deletePostedBrkt();
    });

    beforeEach(() => {
      createdBrkt = false;
    });

    afterEach(async () => {
      if (createdBrkt) {
        await deletePostedBrkt();
      }
    });

    it("should post a brkt", async () => {
      const postedBrkt = await postBrkt(brktToPost);
      expect(postedBrkt).not.toBeNull();
      if (!postedBrkt) return;
      createdBrkt = true;
      expect(postedBrkt.id).toBe(brktToPost.id);
      expect(postedBrkt.squad_id).toBe(brktToPost.squad_id);
      expect(postedBrkt.div_id).toBe(brktToPost.div_id);
      expect(postedBrkt.start).toBe(brktToPost.start);
      expect(postedBrkt.games).toBe(brktToPost.games);
      expect(postedBrkt.fee).toBe(brktToPost.fee);
      expect(postedBrkt.first).toBe(brktToPost.first);
      expect(postedBrkt.second).toBe(brktToPost.second);
      expect(postedBrkt.admin).toBe(brktToPost.admin);
      expect(postedBrkt.sort_order).toBe(brktToPost.sort_order);
    });
    it("should NOT post a brkt with invalid data", async () => {
      try {
        const invalidBrkt = {
          ...brktToPost,
          games: -1,
        };
        await postBrkt(invalidBrkt);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "postBrkt failed: Request failed with status code 422",
        );
      }
    });
  });

  describe("putBrkt", () => {
    const brktToPut = {
      ...initBrkt,
      id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
      sort_order: 1,
      start: 2,
      games: 3,
      players: 8,
      fee: "4",
      first: "20",
      second: "8",
      admin: "4",
      fsa: "32",
    };

    const putUrl = oneBrktUrl + brktToPut.id;

    const resetBrkt = {
      ...initBrkt,
      id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
      sort_order: 1,
      start: 1,
      games: 3,
      players: 8,
      fee: "5",
      first: "25",
      second: "10",
      admin: "5",
      fsa: "40",
    };

    const doReset = async () => {
      try {
        const brktJSON = JSON.stringify(resetBrkt);
        const response = await axios({
          method: "put",
          data: brktJSON,
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

    it("should put a brkt", async () => {
      const puttedBrkt = await putBrkt(brktToPut);
      expect(puttedBrkt).not.toBeNull();
      if (!puttedBrkt) return;
      didPut = true;
      expect(puttedBrkt.id).toEqual(brktToPut.id);
      expect(puttedBrkt.squad_id).toEqual(brktToPut.squad_id);
      expect(puttedBrkt.div_id).toEqual(brktToPut.div_id);
      expect(puttedBrkt.fee).toEqual(brktToPut.fee);
      expect(puttedBrkt.first).toEqual(brktToPut.first);
      expect(puttedBrkt.second).toEqual(brktToPut.second);
      expect(puttedBrkt.admin).toEqual(brktToPut.admin);
      // expect(puttedBrkt.fsa + "").toEqual(brktToPut.fsa);
      expect(puttedBrkt.sort_order).toEqual(brktToPut.sort_order);
    });
    it("should throw error when trying to update a brkt with invalid data", async () => {
      try {
        const invalidBrkt = {
          ...brktToPut,
          fee: "-13",
        };
        await putBrkt(invalidBrkt);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "putBrkt failed: Request failed with status code 422",
        );
      }
    });
    it("should throw error when passed a brkt with invalid id", async () => {
      try {
        const invalidBrkt = {
          ...brktToPut,
          id: "test",
        };
        await putBrkt(invalidBrkt);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt data");
      }
    });
    it("should throw error when passed null", async () => {
      try {
        await putBrkt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt data");
      }
    });
  });

  describe("deleteBrkt", () => {
    // toDel is data from prisma/seeds.ts
    const toDel = {
      ...initBrkt,
      id: "brk_400737cab3584ab7a59b7a4411da4474",
      squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
      div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
      sort_order: 3,
      start: 2,
      games: 3,
      players: 8,
      fee: "5",
      first: "25",
      second: "10",
      admin: "5",
      fsa: "40",
    };

    const notFoundId = "brk_00000000000000000000000000000000";

    let didDel = false;

    beforeAll(async () => {
      await rePostBrkt(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostBrkt(toDel);
      }
    });

    it("should delete a brkt", async () => {
      const deleted = await deleteBrkt(toDel.id);
      expect(deleted).toBe(1);
      didDel = true;
    });
    it("should throw error when a brkt when ID is not found", async () => {
      try {
        await deleteBrkt(notFoundId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "deleteBrkt failed: Request failed with status code 404",
        );
      }
    });
    it("should throw error when a brkt when ID is invalid", async () => {
      try {
        await deleteBrkt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    });
    it("should throw error when a brkt when ID is valid, but not a brkt ID", async () => {
      try {
        await deleteBrkt(tmntId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    });
    it("should throw error when a brkt when ID is blank", async () => {
      try {
        await deleteBrkt("");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    });
    it("should throw error when a brkt when ID is null", async () => {
      try {
        await deleteBrkt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt id");
      }
    });
  });

});
