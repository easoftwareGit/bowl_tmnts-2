import axios, { AxiosError } from "axios";
import { baseElimsApi } from "@/lib/db/apiPaths";
import { testBaseElimsApi } from "../../../testApi";
import { elimType } from "@/lib/types/types";
import { initElim } from "@/lib/db/initVals";
import {
  deleteAllElimsForDiv,
  deleteAllElimsForSquad,
  deleteAllElimsForTmnt,
  deleteElim,
  getAllElimsForSquad,
  getAllElimsForTmnt,
  postElim,
  postManyElims,
  putElim,
  extractElims,
} from "@/lib/db/elims/dbElims";
import {
  mockElimsToPost,
  mockSquadsToPost,
  tmntToDelId,
  mockDivsToPost,
} from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import {
  deleteAllSquadsForTmnt,  
  postManySquads,
  postSquad,
} from "@/lib/db/squads/dbSquads";
import {
  deleteAllDivsForTmnt,  
  postDiv,
  postManyDivs,
} from "@/lib/db/divs/dbDivs";
import { cloneDeep } from "lodash";
import { replaceManyElims } from "@/lib/db/elims/dbElimsReplaceMany";

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

const url = testBaseElimsApi.startsWith("undefined")
  ? baseElimsApi
  : testBaseElimsApi;
const oneElimUrl = url + "/elim/";

const notFoundDivId = "div_00000000000000000000000000000000";
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
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: elimJSON,
      });
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

  const rePostToDel = async () => {
    const response = await axios.get(url);
    const elims = response.data.elims;
    // find first test elim
    const foundToDel = elims.find((e: elimType) => e.id === multiElims[0].id);
    if (!foundToDel) {
      try {
        await postManyElims(multiElims);
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }
  };

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
      squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
      div_id: "div_a9a3cae28786485bb7a036935f0f6a0a",
      start: 2,
      games: 3,
      fee: "13",
      sort_order: 13,
    };

    let createdElim = false;

    const deletePostedElim = async () => {
      const response = await axios.get(url);
      const elims = response.data.elims;
      const toDel = elims.find((e: elimType) => e.sort_order === 13);
      if (toDel) {
        try {
          const delResponse = await axios({
            method: "delete",
            withCredentials: true,
            url: oneElimUrl + toDel.id,
          });
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    };

    beforeAll(async () => {
      await deletePostedElim();
    });

    beforeEach(() => {
      createdElim = false;
    });

    afterEach(async () => {
      if (createdElim) {
        await deletePostedElim();
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

  describe("postManyElims", () => {
    let createdElims = false;

    beforeAll(async () => {
      // remove any old test data
      await deleteAllElimsForTmnt(tmntToDelId);
      await deleteAllSquadsForTmnt(tmntToDelId);
      await deleteAllDivsForTmnt(tmntToDelId);

      // make sure test squads in database
      await postManyDivs(mockDivsToPost);
      await postManySquads(mockSquadsToPost);
    });

    beforeEach(() => {
      createdElims = false;
    });

    afterEach(async () => {
      if (createdElims) {
        await deleteAllElimsForTmnt(tmntToDelId);
      }
    });

    afterAll(async () => {
      await deleteAllElimsForTmnt(tmntToDelId);
      await deleteAllSquadsForTmnt(tmntToDelId);
      await deleteAllDivsForTmnt(tmntToDelId);
    });

    it("should post many elims", async () => {
      const count = await postManyElims(mockElimsToPost);
      expect(count).toBe(mockElimsToPost.length);
      createdElims = true;
      const postedElims = await getAllElimsForTmnt(tmntToDelId);
      if (!postedElims) {
        expect(true).toBeFalsy();
        return;
      }
      expect(postedElims.length).toBe(mockElimsToPost.length);
      for (let i = 0; i < postedElims.length; i++) {
        expect(postedElims[i].id).toEqual(mockElimsToPost[i].id);
        expect(postedElims[i].squad_id).toEqual(mockElimsToPost[i].squad_id);
        expect(postedElims[i].div_id).toEqual(mockElimsToPost[i].div_id);
        expect(postedElims[i].start).toEqual(mockElimsToPost[i].start);
        expect(postedElims[i].games).toEqual(mockElimsToPost[i].games);
        expect(postedElims[i].fee).toEqual(mockElimsToPost[i].fee);
        expect(postedElims[i].sort_order).toEqual(
          mockElimsToPost[i].sort_order
        );
      }
    });
    it("should return 0 when passed an empty array", async () => {
      const count = await postManyElims([]);
      expect(count).toBe(0);
    });
    it("should throw error when data sanitized to invalid", async () => {
      try {
        const invalidPlayers = cloneDeep(mockElimsToPost);
        invalidPlayers[0].fee = '  <script>alert("xss")</script> ';
        await postManyElims(invalidPlayers);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "Invalid elim data at index 0"
        );
      }      
    });
    it("should throw error when invalid data in second item", async () => {
      try {
        const invalidPlayers = cloneDeep(mockElimsToPost);
        invalidPlayers[1].games = -1;
        await postManyElims(invalidPlayers);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "Invalid elim data at index 1"
        );
      }      
    });
    it("should throw error when invalid data in third item", async () => {
      try {
        const invalidPlayers = cloneDeep(mockElimsToPost);
        invalidPlayers[2].start = -1;
        await postManyElims(invalidPlayers);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "Invalid elim data at index 2"
        );
      }      
    });
    it("should throw error when passed a non array", async () => {
      try {
        await postManyElims("not an array" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elims data");
      }
    });
    it("should throw error when passed null", async () => {
      try {
        await postManyElims(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elims data");
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
        const potJSON = JSON.stringify(resetElim);
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

  describe("replaceManyElims()", () => {
    const rmSquadId = "sqd_20c24199328447f8bbe95c05e1b84645";
    let createdElims = false;    

    const squadElims: elimType[] = [
      {
        ...mockElimsToPost[0],        
      },
      {
        ...mockElimsToPost[1],        
      },
    ]

    beforeAll(async () => {
      // cleanup before tests
      await deleteAllElimsForTmnt(tmntToDelId);
      await deleteAllSquadsForTmnt(tmntToDelId);
      await deleteAllDivsForTmnt(tmntToDelId);

      // // setup for tests
      await postManyDivs(mockDivsToPost)
      await postManySquads(mockSquadsToPost)            
    });

    beforeEach(async () => {
      createdElims = false;
    });

    afterEach(async () => {
      if (createdElims) {
        await deleteAllElimsForTmnt(tmntToDelId);
      }      
    });

    afterAll(async () => {
      await deleteAllElimsForTmnt(tmntToDelId);
      await deleteAllSquadsForTmnt(tmntToDelId);
      await deleteAllDivsForTmnt(tmntToDelId);
    });

    it("should update, insert, delete many elims", async () => {
      const toInsert: elimType[] = [
        {
          ...initElim,
          id: "elm_c05077494c2d4d9da166d697c08c28d2",
          squad_id: "sqd_20c24199328447f8bbe95c05e1b84645",
          div_id: "div_578834e04e5e4885bbae79229d8b96e8",
          sort_order: 5,
          start: 2,
          games: 3,
          fee: '5',
        },
        {
            ...initElim,
          id: "elm_c06077494c2d4d9da166d697c08c28d2",
          squad_id: "sqd_20c24199328447f8bbe95c05e1b84645",
          div_id: "div_578834e04e5e4885bbae79229d8b96e8",
          sort_order: 6,
          start: 3,
          games: 3,
          fee: '5',
        },
      ];

      const count = await postManyElims(squadElims);
      expect(count).toBe(squadElims.length);
      createdElims = true;
      const elims = await getAllElimsForSquad(rmSquadId);
      if (!elims) {
        expect(true).toBeFalsy();
        return;
      }
      expect(elims.length).toEqual(squadElims.length);

      const elimsToUpdate = [
        {
          ...squadElims[0],
          fee: '10',
        },
        {
          ...squadElims[1],
          fee: '10',
        },
        {
          ...toInsert[0],
        },
        {
          ...toInsert[1],
        },
      ];

      const replaceCount = await replaceManyElims(elimsToUpdate, rmSquadId);
      expect(replaceCount).toBe(elimsToUpdate.length);
      const replacedPlayers = await getAllElimsForSquad(rmSquadId);
      if (!replacedPlayers) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedPlayers.length).toEqual(elimsToUpdate.length);
      for (let i = 0; i < replacedPlayers.length; i++) {
        if (replacedPlayers[i].id === elimsToUpdate[0].id) {
          expect(replacedPlayers[i].squad_id).toEqual(elimsToUpdate[0].squad_id);
          expect(replacedPlayers[i].div_id).toEqual(elimsToUpdate[0].div_id);          
          expect(replacedPlayers[i].sort_order).toEqual(elimsToUpdate[0].sort_order);          
          expect(replacedPlayers[i].start).toEqual(elimsToUpdate[0].start);
          expect(replacedPlayers[i].games).toEqual(elimsToUpdate[0].games);
          expect(replacedPlayers[i].fee).toEqual(elimsToUpdate[0].fee);
        } else if (replacedPlayers[i].id === elimsToUpdate[1].id) {
          expect(replacedPlayers[i].squad_id).toEqual(elimsToUpdate[1].squad_id);
          expect(replacedPlayers[i].div_id).toEqual(elimsToUpdate[1].div_id);          
          expect(replacedPlayers[i].sort_order).toEqual(elimsToUpdate[1].sort_order);          
          expect(replacedPlayers[i].start).toEqual(elimsToUpdate[1].start);
          expect(replacedPlayers[i].games).toEqual(elimsToUpdate[1].games);
          expect(replacedPlayers[i].fee).toEqual(elimsToUpdate[1].fee);
        } else if (replacedPlayers[i].id === elimsToUpdate[2].id) {
          expect(replacedPlayers[i].squad_id).toEqual(elimsToUpdate[2].squad_id);
          expect(replacedPlayers[i].div_id).toEqual(elimsToUpdate[2].div_id);          
          expect(replacedPlayers[i].sort_order).toEqual(elimsToUpdate[2].sort_order);          
          expect(replacedPlayers[i].start).toEqual(elimsToUpdate[2].start);
          expect(replacedPlayers[i].games).toEqual(elimsToUpdate[2].games);
          expect(replacedPlayers[i].fee).toEqual(elimsToUpdate[2].fee);
        } else if (replacedPlayers[i].id === elimsToUpdate[3].id) {
          expect(replacedPlayers[i].squad_id).toEqual(elimsToUpdate[3].squad_id);
          expect(replacedPlayers[i].div_id).toEqual(elimsToUpdate[3].div_id);          
          expect(replacedPlayers[i].sort_order).toEqual(elimsToUpdate[3].sort_order);          
          expect(replacedPlayers[i].start).toEqual(elimsToUpdate[3].start);
          expect(replacedPlayers[i].games).toEqual(elimsToUpdate[3].games);
          expect(replacedPlayers[i].fee).toEqual(elimsToUpdate[3].fee);
        } else {
          expect(true).toBefalsey();
        }
      }
    });
    it("should return 0 when passed an empty array", async () => {
      const count = await postManyElims(squadElims);
      expect(count).toBe(squadElims.length);
      createdElims = true;
      const elims = await getAllElimsForSquad(rmSquadId);
      if (!elims) {
        expect(true).toBeFalsy();
        return;
      }
      expect(elims.length).toEqual(squadElims.length);

      const replaceCount = await replaceManyElims([], rmSquadId);
      expect(replaceCount).toBe(0);
      const replacedElims = await getAllElimsForSquad(rmSquadId);
      if (!replacedElims) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedElims.length).toEqual(0);
    });
    it("should throw an error when sanitize to invalid value", async () => {
      const count = await postManyElims(squadElims);
      expect(count).toBe(squadElims.length);
      createdElims = true;
      const elims = await getAllElimsForSquad(rmSquadId);
      if (!elims) {
        expect(true).toBeFalsy();
        return;
      }
      expect(elims.length).toEqual(squadElims.length);

      const ElimsToUpdate = [
        {
          ...squadElims[0],
          fee: "<script>alert('xss')</script>",
        },
        {
          ...squadElims[1],
        },
      ];
      await expect(replaceManyElims(ElimsToUpdate, rmSquadId)).rejects.toThrow(
        "Invalid elim data at index 0"
      );
    });
    it("should throw an error for invalid player ID in first item", async () => {
      const count = await postManyElims(squadElims);
      expect(count).toBe(squadElims.length);
      createdElims = true;
      const elims = await getAllElimsForSquad(rmSquadId);
      if (!elims) {
        expect(true).toBeFalsy();
        return;
      }
      expect(elims.length).toEqual(squadElims.length);

      const ElimsToUpdate = [
        {
          ...squadElims[0],
          id: "",
        },
        {
          ...squadElims[1],
        },
      ];
      await expect(replaceManyElims(ElimsToUpdate, rmSquadId)).rejects.toThrow(
        "Invalid elim data at index 0"
      );
    });
    it("should throw an error for invalid elim ID in second item", async () => {
      const count = await postManyElims(squadElims);
      expect(count).toBe(squadElims.length);
      createdElims = true;
      const elims = await getAllElimsForSquad(rmSquadId);      
      if (!elims) {
        expect(true).toBeFalsy();
        return;
      }
      expect(elims.length).toEqual(squadElims.length);

      const elimsToUpdate = [
        {
          ...squadElims[0],
        },
        {
          ...squadElims[1],
          id: "1234567890"
        },
      ];
      await expect(replaceManyElims(elimsToUpdate, rmSquadId)).rejects.toThrow(
        "Invalid elim data at index 1"
      );
    });
    it("should throw an error for invalid elim data in first item", async () => {
      const count = await postManyElims(squadElims);
      expect(count).toBe(squadElims.length);
      createdElims = true;
      const elims = await getAllElimsForSquad(rmSquadId);
      if (!elims) {
        expect(true).toBeFalsy();
        return;
      }
      expect(elims.length).toEqual(squadElims.length);

      const ElimsToUpdate = [
        {
          ...squadElims[0],
          fee: "-1",
        },
        {
          ...squadElims[1],
        },
      ];
      await expect(replaceManyElims(ElimsToUpdate, rmSquadId)).rejects.toThrow(
        "Invalid elim data at index 0"
      );
    });
    it("should throw an error for invalid elim data in second item", async () => {
      const count = await postManyElims(squadElims);
      expect(count).toBe(squadElims.length);
      createdElims = true;
      const elims = await getAllElimsForSquad(rmSquadId);      
      if (!elims) {
        expect(true).toBeFalsy();
        return;
      }
      expect(elims.length).toEqual(squadElims.length);

      const elimsToUpdate = [
        {
          ...squadElims[0],
        },
        {
          ...squadElims[1],
          start: -1
        },
      ];
      await expect(replaceManyElims(elimsToUpdate, rmSquadId)).rejects.toThrow(
        "Invalid elim data at index 1"
      );
    });
    it("should throw an error if passed null as elims", async () => {
      await expect(replaceManyElims(null as any, rmSquadId)).rejects.toThrow(
        "Invalid elims"
      );
    });
    it("should throw an error if players is not an array", async () => {
      await expect(replaceManyElims("not-an-array" as any, rmSquadId)).rejects.toThrow(
        "Invalid elims"
      );
    });
    it("should throw an error if passed null as squadId", async () => {
      await expect(replaceManyElims(squadElims, null as any)).rejects.toThrow(
        "Invalid squad id"
      );
    });
    it("should throw an error if passed invalid squadId", async () => {
      await expect(replaceManyElims(squadElims, 'test')).rejects.toThrow(
        "Invalid squad id"
      );
    });
    it("should throw an error if passed valid id, but not squad id", async () => {
      await expect(replaceManyElims(squadElims, userId)).rejects.toThrow(
        "Invalid squad id"
      );
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

  describe("deleteAllElimsForSquad", () => {

    let didDel = false;

    beforeAll(async () => {
      // cleanup before tests
      await deleteAllElimsForTmnt(tmntToDelId);
      await deleteAllSquadsForTmnt(tmntToDelId);
      await deleteAllDivsForTmnt(tmntToDelId);
      // setup for tests
      await postDiv(mockDivsToPost[0]);
      await postSquad(mockSquadsToPost[0]);
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
      await deleteAllElimsForTmnt(tmntToDelId);
      await deleteAllSquadsForTmnt(tmntToDelId);
      await deleteAllDivsForTmnt(tmntToDelId);
    });

    it("should delete all elims for a squad", async () => {
      const deleted = await deleteAllElimsForSquad(multiElims[0].squad_id);
      expect(deleted).toBe(multiElims.length);
      didDel = true;
    });
    it("should not delete all elims for a squad when squad id is not found", async () => {
      const deleted = await deleteAllElimsForSquad(notFoundSquadId);
      expect(deleted).toBe(0);
    });
    it("should NOT delete all elims for a squad when ID is invalid", async () => {
      try {
        await deleteAllElimsForSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should NOT delete all elims for a squad when ID is valid, but not a squad ID", async () => {
      try {
        await deleteAllElimsForSquad(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should NOT delete all elims for a squad when ID is null", async () => {
      try {
        await deleteAllElimsForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })
  });

  describe("deleteAllElimsForDiv", () => {
    const multiElims = [
      {
        ...mockElimsToPost[0],
      },
      {
        ...mockElimsToPost[1],
      },
    ];

    const rePostToDel = async () => {
      const response = await axios.get(url);
      const elims = response.data.elims;
      // find first test elim
      const foundToDel = elims.find((e: elimType) => e.id === multiElims[0].id);
      if (!foundToDel) {
        try {
          await postManyElims(multiElims);
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    };

    let didDel = false;

    beforeAll(async () => {
      // cleanup before tests
      await deleteAllElimsForTmnt(tmntToDelId);
      await deleteAllSquadsForTmnt(tmntToDelId);
      await deleteAllDivsForTmnt(tmntToDelId);
      // setup for tests
      await postDiv(mockDivsToPost[0]);
      await postSquad(mockSquadsToPost[0]);
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
      await deleteAllElimsForTmnt(tmntToDelId);
      await deleteAllSquadsForTmnt(tmntToDelId);
      await deleteAllDivsForTmnt(tmntToDelId);
    });

    it("should delete all elims for a div", async () => {
      const deleted = await deleteAllElimsForDiv(multiElims[0].div_id);
      expect(deleted).toBe(multiElims.length);
      didDel = true;
    });
    it("should not delete all elims for a div when div id is not found", async () => {
      const deleted = await deleteAllElimsForDiv(notFoundDivId);
      expect(deleted).toBe(0);
    });
    it("should throw error when trying to delete all elims for a div when ID is invalid", async () => {
      try {
        await deleteAllElimsForDiv("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should NOT delete all elims for a div when ID is valid, but not a div ID", async () => {
      try {
        await deleteAllElimsForDiv(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should NOT delete all elims for a div when ID is null", async () => {
      try {
        await deleteAllElimsForDiv(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    })
  });

  describe("deleteAllElimsForTmnt", () => {    

    let didDel = false;

    beforeAll(async () => {
      // cleanup before tests
      await deleteAllElimsForTmnt(tmntToDelId);
      await deleteAllSquadsForTmnt(tmntToDelId);
      await deleteAllDivsForTmnt(tmntToDelId);
      // setup for tests
      await postDiv(mockDivsToPost[0]);
      await postSquad(mockSquadsToPost[0]);
      await rePostToDel();
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) return;
      await deleteAllElimsForTmnt(tmntToDelId);
    });

    afterAll(async () => {
      await deleteAllElimsForTmnt(tmntToDelId);
      await deleteAllSquadsForTmnt(tmntToDelId);
      await deleteAllDivsForTmnt(tmntToDelId);
    });

    it("should delete all elims for a tmnt", async () => {
      const deleted = await deleteAllElimsForTmnt(tmntToDelId);
      didDel = true;
      expect(deleted).toBe(multiElims.length);
    });
    it("should not delete all elims for a tmnt when tmnt id is not found", async () => {
      const deleted = await deleteAllElimsForTmnt(notFoundTmntId);
      expect(deleted).toBe(0);
    });
    it("should NOT delete all elims for a tmnt when ID is invalid", async () => {
      try {
        await deleteAllElimsForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should NOT delete all elims for a tmnt when tmnt ID is valid, but not a tmnt id", async () => {
      try {
        await deleteAllElimsForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should NOT delete all elims for a tmnt when ID is null", async () => {
      try {
        await deleteAllElimsForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });
});
