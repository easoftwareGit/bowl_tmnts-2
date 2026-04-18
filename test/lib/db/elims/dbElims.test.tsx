import axios, { AxiosError } from "axios";
import { baseElimsApi } from "@/lib/api/apiPaths";
import { testBaseElimsApi } from "../../../testApi";
import type { elimType } from "@/lib/types/types";
import { initElim } from "@/lib/db/initVals";
import {
  deleteElim,
  getAllElimsForSquad,
  getAllElimsForTmnt,
  postElim,
  putElim,
  extractElims,
} from "@/lib/db/elims/dbElims";
import {
  mockElimsToPost,
  mockSquadsToPost,
  mockDivsToPost,
} from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";

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
const url = process.env.NODE_ENV === "test" && testBaseElimsApi
  ? testBaseElimsApi
  : baseElimsApi;

const oneElimUrl = url + "/elim/";

const notFoundTmntId = "tmt_00000000000000000000000000000000";
const notFoundSquadId = "sqd_00000000000000000000000000000000";
const userId = "usr_01234567890123456789012345678901";

describe("dbElims", () => {
  const rePostElim = async (elim: elimType) => {
    try {
      // if elim already in database, then don't re-post
      const getResponse = await axios.get(oneElimUrl + elim.id);
      const found = getResponse.data.elim;
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
      const elimJSON = JSON.stringify(elim);
      await axios.post(url, elimJSON, { withCredentials: true });      
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  const multiElims = [
    {
      ...mockElimsToPost[0],
    },
    {
      ...mockElimsToPost[1],
    },
  ];

  describe("extractElims", () => {
    it("should return an empty array when given an empty array", () => {
      const result = extractElims([]);
      expect(result).toEqual([]);
    });

    it("should correctly map raw elims to elimType", () => {
      const rawElims = [
        {
          id: "elm_01758d99c5494efabb3b0d273cf22e7b",
          squad_id: mockSquadsToPost[0].id,
          div_id: mockDivsToPost[0].id,
          sort_order: 1,
          start: 1,
          games: 3,
          fee: '5',
          extraField: "ignore me", // should be ignored
        },
      ];

      const result = extractElims(rawElims);

      const expected: elimType = {
        ...initElim,
        id: "elm_01758d99c5494efabb3b0d273cf22e7b",
        squad_id: mockSquadsToPost[0].id,
        div_id: mockDivsToPost[0].id,
        sort_order: 1,
        start: 1,
        games: 3,
        fee: '5',
      };

      expect(result).toEqual([expected]);
    });

    it("should process multiple elims", () => {
      const rawElims = [
        {
          id: "elm_012",
          squad_id: mockSquadsToPost[0].id,
          div_id: mockDivsToPost[0].id,
          sort_order: 1,
          start: 1,
          games: 3,
          fee: '5',
        },
        {
          id: "elm_013", // change the id
          squad_id: mockSquadsToPost[0].id,
          div_id: mockDivsToPost[0].id,
          sort_order: 2, // change the sort order
          start: 4, // change the start               
          games: 3,
          fee: '5',
        },
      ];

      const result = extractElims(rawElims);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("elm_012");
      expect(result[0].start).toBe(1);
      expect(result[0].sort_order).toBe(1);
      expect(result[1].id).toBe("elm_013");
      expect(result[1].start).toBe(4);
      expect(result[1].sort_order).toBe(2);
    });
    it('should return an empty array when given null', () => {
      const result = extractElims(null);
      expect(result).toEqual([]);
    });
    it('should return an empty array when given non-array', () => {
      const result = extractElims('not an array');
      expect(result).toEqual([]);
    });
  });

  describe("getAllElimsForSquad", () => {
    // from prisma/seed.ts
    const elimsToGet: elimType[] = [
      {
        ...initElim,
        id: "elm_45d884582e7042bb95b4818ccdd9974c",
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        sort_order: 1,
        start: 1,
        games: 3,
        fee: "5",
      },
      {
        ...initElim,
        id: "elm_9d01015272b54962a375cf3c91007a12",
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        sort_order: 2,
        start: 4,
        games: 3,
        fee: "5",
      },
    ];

    it("should get all elims for squad", async () => {
      const elims = await getAllElimsForSquad(elimsToGet[0].squad_id);
      expect(elims).toHaveLength(elimsToGet.length);
      if (!elims) return;
      for (let i = 0; i < elims.length; i++) {
        expect(elims[i].id).toEqual(elimsToGet[i].id);
        expect(elims[i].squad_id).toEqual(elimsToGet[i].squad_id);
        expect(elims[i].div_id).toEqual(elimsToGet[i].div_id);
        expect(elims[i].sort_order).toEqual(elimsToGet[i].sort_order);
        expect(elims[i].start).toEqual(elimsToGet[i].start);
        expect(elims[i].games).toEqual(elimsToGet[i].games);
        expect(elims[i].fee).toEqual(elimsToGet[i].fee);
      }
    });
    it("should return 0 elims for not found squad", async () => {
      const elims = await getAllElimsForSquad(notFoundSquadId);
      expect(elims).toHaveLength(0);
    });
    it("should throw error if squad id is invalid", async () => {
      try {
        await getAllElimsForSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should return null if squad id is valid, but not a squad id", async () => {
      try {
        await getAllElimsForSquad(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should return null if squad id is null", async () => {
      try {
        await getAllElimsForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
  });

  describe("getAllElimsForTmnt", () => {
    // from prisma/seed.ts
    const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
    const elimsToGet: elimType[] = [
      {
        ...initElim,
        id: "elm_45d884582e7042bb95b4818ccdd9974c",
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        sort_order: 1,
        start: 1,
        games: 3,
        fee: "5",
      },
      {
        ...initElim,
        id: "elm_9d01015272b54962a375cf3c91007a12",
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        sort_order: 2,
        start: 4,
        games: 3,
        fee: "5",
      },
    ];

    it("should get all elims for tmnt", async () => {
      const elims = await getAllElimsForTmnt(tmntId);
      expect(elims).toHaveLength(elimsToGet.length);
      if (!elims) return;
      for (let i = 0; i < elims.length; i++) {
        expect(elims[i].id).toEqual(elimsToGet[i].id);
        expect(elims[i].squad_id).toEqual(elimsToGet[i].squad_id);
        expect(elims[i].div_id).toEqual(elimsToGet[i].div_id);
        expect(elims[i].sort_order).toEqual(elimsToGet[i].sort_order);
        expect(elims[i].start).toEqual(elimsToGet[i].start);
        expect(elims[i].games).toEqual(elimsToGet[i].games);
        expect(elims[i].fee).toEqual(elimsToGet[i].fee);
      }
    });
    it("should return 0 elims for not found tmnt", async () => {
      const elims = await getAllElimsForTmnt(notFoundTmntId);
      expect(elims).toHaveLength(0);
    });
    it("should return null if tmnt id is invalid", async () => {
      try {
        await getAllElimsForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should return null if tmnt id is valid, but not a tmnt id", async () => {
      try {
        await getAllElimsForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should return null if tmnt id is null", async () => {
      try {
        await getAllElimsForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });

  describe("postElim", () => {
    const elimToPost = {
      ...initElim,
      id: "elm_1234567890abcdef1234567890abcdef",
      squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
      div_id: "div_a9a3cae28786485bb7a036935f0f6a0a",
      start: 2,
      games: 3,
      fee: "13",
      sort_order: 13,
    };

    let createdElim = false;

    const deletePostedElim = async (elimId: string) => {
      try {
        await axios.delete(oneElimUrl + elimId, { withCredentials: true });
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    };

    beforeAll(async () => {
      await deletePostedElim(elimToPost.id);
    });

    beforeEach(() => {
      createdElim = false;
    });

    afterEach(async () => {
      if (createdElim) {
        await deletePostedElim(elimToPost.id);
      }
    });

    it("should post an elim", async () => {
      const postedElim = await postElim(elimToPost);
      expect(postedElim).not.toBeNull();
      if (!postedElim) return;
      createdElim = true;
      expect(postedElim.id).toBe(elimToPost.id);
      expect(postedElim.squad_id).toBe(elimToPost.squad_id);
      expect(postedElim.div_id).toBe(elimToPost.div_id);
      expect(postedElim.start).toBe(elimToPost.start);
      expect(postedElim.games).toBe(elimToPost.games);
      expect(postedElim.fee).toBe(elimToPost.fee);
      expect(postedElim.sort_order).toBe(elimToPost.sort_order);
    });
    it("should throw an error when trying to post a elim with invalid elim id", async () => {
      try {
        const invalidElim = {
          ...elimToPost,
          id: 'test',
        };
        await postElim(invalidElim);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elim data");
      }
    });
    it("should throw an error when passed null", async () => {
      try {
        await postElim(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elim data");
      }
    });
    it('should throw error when posting sanitized elim', async () => { 
      try {
        const invalidElim = {
          ...elimToPost,
          games: Number.MAX_SAFE_INTEGER + 1,
        };
        await postElim(invalidElim);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "postElim failed: Request failed with status code 422"
        );
      }
    })
    it("should throw an error when trying to post a elim with invalid data", async () => {
      try {
        const invalidElim = {
          ...elimToPost,
          games: Number.MAX_SAFE_INTEGER + 1,
        };
        await postElim(invalidElim);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "postElim failed: Request failed with status code 422"
        );
      }
    });
  });

  describe("putElim", () => {
    const elimToPut = {
      ...initElim,
      id: "elm_45d884582e7042bb95b4818ccdd9974c",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
      sort_order: 1,
      start: 13,
      games: 4,
      fee: "13",
    };

    const putUrl = oneElimUrl + elimToPut.id;

    const resetElim = {
      ...initElim,
      id: "elm_45d884582e7042bb95b4818ccdd9974c",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
      sort_order: 1,
      start: 1,
      games: 3,
      fee: "5",
    };

    const doReset = async () => {
      try {
        const elimJSON = JSON.stringify(resetElim);
        await axios.put(putUrl, elimJSON, { withCredentials: true });
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

    it("should put an elim", async () => {
      const puttedElim = await putElim(elimToPut);
      expect(puttedElim).not.toBeNull();
      if (!puttedElim) return;
      didPut = true;
      expect(puttedElim.id).toEqual(elimToPut.id);
      expect(puttedElim.squad_id).toEqual(elimToPut.squad_id);
      expect(puttedElim.div_id).toEqual(elimToPut.div_id);
      expect(puttedElim.fee).toEqual(elimToPut.fee);
      expect(puttedElim.start).toEqual(elimToPut.start);
      expect(puttedElim.games).toEqual(elimToPut.games);
      expect(puttedElim.sort_order).toEqual(elimToPut.sort_order);
    });
    it("should throw error when trying to put an elim with invalid sanitzied data", async () => {
      try { 
        const invalidElim = {
          ...elimToPut,
          fee: " <script>alert(1)</script> ",
        };
        await putElim(invalidElim);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "putElim failed: Request failed with status code 422"
        );
      }      
    });
    it("should throw error when trying to put an elim with invalid data", async () => {
      try { 
        const invalidElim = {
          ...elimToPut,
          fee: "-13",
        };
        await putElim(invalidElim);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "putElim failed: Request failed with status code 422"
        );
      }      
    });
    it("should throw error when passed null", async () => {
      try { 
        await putElim(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elim data")
      }      
    });
    it("should throw error when passed non object", async () => {
      try { 
        await putElim('test' as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);        
        expect((err as Error).message).toBe("Invalid elim data")        
      }      
    });
  });

  describe("deleteElim", () => {
    // toDel is data from prisma/seeds.ts
    const toDel = {
      ...initElim,
      id: "elm_4c5aad9baa7246c19e07f215561e58c4",
      squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
      div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
      sort_order: 3,
      start: 3,
      games: 4,
      fee: "10",
    };

    const nonFoundId = "elm_00000000000000000000000000000000";

    let didDel = false;

    beforeAll(async () => {
      await rePostElim(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostElim(toDel);
      }
    });

    it("should delete an elim", async () => {
      const deleted = await deleteElim(toDel.id);
      expect(deleted).toBe(1);
      didDel = true;
    });
    it("should throw error when trying to delete an elim when ID is not found", async () => {
      try {
        await deleteElim(nonFoundId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "deleteElim failed: Request failed with status code 404"
        );
      }
    });
    it("should throw error when trying to delete an elim when ID is invalid", async () => {
      try {
        await deleteElim("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elim id");
      }
    });
    it("should throw error when trying to delete an elim when ID is valid, but not an elim ID", async () => {
      try {
        await deleteElim(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elim id");
      }
    });
    it("should throw error when trying to delete an elim when ID is null", async () => {
      try {
        await deleteElim(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elim id");
      }
    });
  });

});
