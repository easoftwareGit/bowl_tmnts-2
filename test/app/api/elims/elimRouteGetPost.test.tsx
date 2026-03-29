import axios, { AxiosError } from "axios";
import { baseElimsApi } from "@/lib/api/apiPaths";
import { testBaseElimsApi } from "../../../testApi";
import type { elimType } from "@/lib/types/types";
import { initElim } from "@/lib/db/initVals";

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
const squadUrl = url + "/squad/";
const divUrl = url + "/div/";
const tmntUrl = url + "/tmnt/";

const notFoundId = "elm_01234567890123456789012345678901";
const nonElimId = "usr_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";

const tmntElimId1 = 'elm_45d884582e7042bb95b4818ccdd9974c';
const tmntElimId2 = 'elm_9d01015272b54962a375cf3c91007a12';

describe("Elims - API: /api/elims", () => {
  const testElim: elimType = {
    ...initElim,
    id: "elm_45d884582e7042bb95b4818ccdd9974c",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    start: 1,
    games: 3,
    fee: "5",
    sort_order: 1,
  };

  const elimToPost: elimType = {
    ...initElim, 
    id: "elm_1234567890abcdef1234567890abcdef",
    squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
    div_id: "div_66d39a83d7a84a8c85d28d8d1b2c7a90",
    start: 4,
    games: 3,
    fee: "13",
    sort_order: 13,
  };

  const deletePostedElim = async (elimId: string) => { 
    try {
      await axios.delete(oneElimUrl + elimId, {
        withCredentials: true
      })
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  }

  describe("GET", () => {

    beforeAll(async () => {
      await deletePostedElim(elimToPost.id);
    });

    it("should get all elims", async () => {
      const response = await axios.get(url, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      // 13 rows in prisma/seed.ts
      expect(response.data.elims).toHaveLength(13);
    });

  });

  describe("GET by ID - API: /api/elim/elim/:id", () => {

    it("should get elim by ID", async () => {
      const response = await axios.get(oneElimUrl + testElim.id);
      expect(response.status).toBe(200);
      const elim = response.data.elim;
      expect(elim.id).toBe(testElim.id);
      expect(elim.squad_id).toBe(testElim.squad_id);
      expect(elim.div_id).toBe(testElim.div_id);
      expect(elim.start).toBe(testElim.start);
      expect(elim.games).toBe(testElim.games);
      expect(elim.fee).toBe(testElim.fee);
      expect(elim.sort_order).toBe(testElim.sort_order);
    });
    it("should NOT get elim by ID when ID is invalid", async () => {
      try {
        const response = await axios.get(oneElimUrl + "invalid");
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT get elim by ID when ID is not found", async () => {
      try {
        const response = await axios.get(oneElimUrl + notFoundId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT get elim by ID when ID is valid, but not an elim ID", async () => {
      try {
        const response = await axios.get(oneElimUrl + nonElimId);
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

  describe("GET elims for squad API: /api/elims/squad/:id", () => {

    beforeAll(async () => {
      await deletePostedElim(elimToPost.id);
    });

    it("should get all elims for squad", async () => {
      // const values taken from prisma/seed.ts
      const multiElimSquadId = "sqd_7116ce5f80164830830a7157eb093396";
      const squadElimId1 = "elm_45d884582e7042bb95b4818ccdd9974c";
      const squadElimId2 = "elm_9d01015272b54962a375cf3c91007a12";
      
      const response = await axios.get(squadUrl + multiElimSquadId, {
        withCredentials: true
      });

      expect(response.status).toBe(200);
      // 2 rows for squad in prisma/seed.ts
      expect(response.data.elims).toHaveLength(2);
      const elims: elimType[] = response.data.elims;
      // query in /api/pots/squad/ GET sorts by sort_order
      expect(elims[0].id).toBe(squadElimId1);
      expect(elims[1].id).toBe(squadElimId2);
    });
    it('should return code 200 if no elims for squad found, 0 rows returned', async () => {     
      const response = await axios.get(squadUrl + notFoundSquadId);
      expect(response.status).toBe(200);
      expect(response.data.elims).toHaveLength(0);
    })
    it('should NOT get all elims for squad when squad ID is invalid', async () => {
      try {
        const response = await axios.get(squadUrl + 'invalid');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get all elims for squad when squad ID id valid, but not an elim ID', async () => { 
      try {
        const response = await axios.get(squadUrl + nonElimId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

  });

  describe("GET elims for div API: /api/elims/div/:id", () => {

    beforeAll(async () => {
      await deletePostedElim(elimToPost.id);
    });

    it("should get all elims for div", async () => {
      // const values taken from prisma/seed.ts
      const multiElimDivId = "div_f30aea2c534f4cfe87f4315531cef8ef";
      const divElimId1 = "elm_45d884582e7042bb95b4818ccdd9974c";
      const divElimId2 = "elm_9d01015272b54962a375cf3c91007a12";
      
      const response = await axios.get(divUrl + multiElimDivId, { withCredentials: true });      
      expect(response.status).toBe(200);
      // 2 rows for squad in prisma/seed.ts
      expect(response.data.elims).toHaveLength(2);
      const elims: elimType[] = response.data.elims;
      // query in /api/pots/div/ GET sorts by sort_order
      expect(elims[0].id).toBe(divElimId1);
      expect(elims[1].id).toBe(divElimId2);
    });
    it('should NOT get all elims for div when div ID is invalid', async () => {
      try {        
        const response = await axios.get(divUrl + 'invalid');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should return code 200 if no elims for div found, 0 rows returned', async () => {     
      const response = await axios.get(divUrl + notFoundDivId, {withCredentials: true})
      expect(response.status).toBe(200);
      expect(response.data.elims).toHaveLength(0);
    })
    it('should NOT get all elims for div when div ID id valid, but not a div ID', async () => { 
      try {
        const response = await axios.get(divUrl + nonElimId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

  });

  describe('GET elims for tmnt API: /api/elims/tmnt/:tmntId', () => { 

    const tmntId = 'tmt_fd99387c33d9c78aba290286576ddce5';

    beforeAll(async () => {
      await deletePostedElim(elimToPost.id);
    })

    it('should get all elims for tmnt', async () => { 
      const response = await axios.get(tmntUrl + tmntId, { withCredentials: true });      
      // 2 rows for squad for event for tmnt in prisma/seed.ts
      expect(response.data.elims).toHaveLength(2);
      const elims: elimType[] = response.data.elims;
      // query in /api/elims/tmnt/ GET sorts by sort_order
      expect(elims[0].id).toBe(tmntElimId1);
      expect(elims[1].id).toBe(tmntElimId2);
    })
    it('should return code 200 if no elims for tmnt found, 0 rows returned', async () => {     
      const response = await axios.get(tmntUrl + notFoundTmntId, { withCredentials: true });      
      expect(response.status).toBe(200);
      expect(response.data.elims).toHaveLength(0);
    })
    it('should NOT get all elims for tmnt when ID is invalid', async () => {
      try {
        const response = await axios.get(tmntUrl + 'test', { withCredentials: true }); 
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get all elims for tmnt when ID is valid id, not a valid tmnt id', async () => {
      try {
        const response = await axios.get(tmntUrl + nonElimId, { withCredentials: true }); 
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

  })

  describe("POST", () => {

    let createdElim = false;

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

    it("should create a new elim", async () => {
      const elimJSON = JSON.stringify(elimToPost);
      const response = await axios.post(url, elimJSON, { withCredentials: true });
      expect(response.status).toBe(201);
      const postedElim = response.data.elim;
      createdElim = true;
      expect(postedElim.div_id).toBe(elimToPost.div_id);
      expect(postedElim.squad_id).toBe(elimToPost.squad_id);
      expect(postedElim.div_id).toBe(elimToPost.div_id);
      expect(postedElim.start).toBe(elimToPost.start);
      expect(postedElim.games).toBe(elimToPost.games);
      expect(postedElim.fee).toBe(elimToPost.fee);
      expect(postedElim.sort_order).toBe(elimToPost.sort_order);
    });
    it("should create new elim with sanitzied values", async () => {
      const toSanitizeElim = {
        ...elimToPost,
        fee: "5.460",
      };
      const elimJSON = JSON.stringify(toSanitizeElim);
      const response = await axios.post(url, elimJSON, { withCredentials: true });
      expect(response.status).toBe(201);
      const postedElim = response.data.elim;
      createdElim = true;
      expect(postedElim.fee).toBe("5.46");
    });
    it("should NOT create a new elim when squad_id is blank", async () => {
      const invalidElim = {
        ...elimToPost,
        squad_id: "",
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create a new elim when div_id is blank", async () => {
      const invalidElim = {
        ...elimToPost,
        div_id: "",
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create a new elim when start is null", async () => {
      const invalidElim = {
        ...elimToPost,
        start: null,
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create a new elim when games is null", async () => {
      const invalidElim = {
        ...elimToPost,
        games: null,
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create a new elim when fee is blank", async () => {
      const invalidElim = {
        ...elimToPost,
        fee: "",
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create a new elim when sort_order is null", async () => {
      const invalidElim = {
        ...elimToPost,
        sort_order: null,
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create a new elim when squad_id is not a valid squad id", async () => {
      const invalidElim = {
        ...elimToPost,
        squad_id: notFoundId, // a valid elim id, not a squad id
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create a new elim when div_id is not a valid div id", async () => {
      const invalidElim = {
        ...elimToPost,
        div_id: notFoundId, // a valid elim id, not a div id
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create new elim when start is too low", async () => {
      const invalidElim = {
        ...elimToPost,
        start: 0,
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create new elim when start is too high", async () => {
      const invalidElim = {
        ...elimToPost,
        start: 100,
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create new elim when start is not an integer", async () => {
      const invalidElim = {
        ...elimToPost,
        start: 1.5,
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create new elim when start is not a number", async () => {
      const invalidElim = {
        ...elimToPost,
        start: "abc",
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create new elim when games is too low", async () => {
      const invalidElim = {
        ...elimToPost,
        games: 0,
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create new elim when games is too high", async () => {
      const invalidElim = {
        ...elimToPost,
        games: 100,
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create new elim when games is not an integer", async () => {
      const invalidElim = {
        ...elimToPost,
        games: 1.5,
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create new elim when games is not a number", async () => {
      const invalidElim = {
        ...elimToPost,
        games: "abc",
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create new elim when fee is too low", async () => {
      const invalidElim = {
        ...elimToPost,
        fee: "0",
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create new elim when fee is too high", async () => {
      const invalidElim = {
        ...elimToPost,
        fee: "1234567",
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create new elim when fee is not a number", async () => {
      const invalidElim = {
        ...elimToPost,
        fee: "abc",
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create new elim when sort_order is too low", async () => {
      const invalidElim = {
        ...elimToPost,
        sort_order: 0,
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create new elim when sort_order is too high", async () => {
      const invalidElim = {
        ...elimToPost,
        sort_order: 1234567,
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create new elim when sort_order is not an integer", async () => {
      const invalidElim = {
        ...elimToPost,
        sort_order: 1.5,
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create new elim when sort_order is not a number", async () => {
      const invalidElim = {
        ...elimToPost,
        sort_order: "abc",
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT create new pot when div_id + pot_type is not unique", async () => {
      const invalidElim = {
        ...elimToPost,
        div_id: testElim.div_id,
        start: testElim.start,
        games: testElim.games,
      };
      const invalidJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
  });

});
