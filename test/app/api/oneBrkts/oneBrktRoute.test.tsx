import axios, { AxiosError } from "axios";
import { baseOneBrktsApi } from "@/lib/db/apiPaths";
import { testBaseOneBrktsApi } from "../../../testApi";
import { oneBrktType } from "@/lib/types/types";
import { initOneBrkt } from "@/lib/db/initVals";
import { mockOneBrktsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { isValidBtDbId } from "@/lib/validation";
import { cloneDeep } from "lodash";
import { deleteAllOneBrktsForTmnt, postManyOneBrkts } from "@/lib/db/oneBrkts/dbOneBrkts";

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

const url = testBaseOneBrktsApi.startsWith("undefined")
  ? baseOneBrktsApi
  : testBaseOneBrktsApi;  
const oneOneBrktUrl = url + "/oneBrkt/";
const brktsUrl = url + "/brkt/";
const divUrl = url + "/div/";
const manyUrl = url + "/many";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

const notFoundId = "obk_01234567890123456789012345678901";
const notFoundBrktId = "brk_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";

const brktId = 'brk_5109b54c2cc44ff9a3721de42c80c8c1';
const brktId2 = 'brk_6ede2512c7d4409ca7b055505990a499';
const divId = 'div_f30aea2c534f4cfe87f4315531cef8ef';
const squadId = 'sqd_7116ce5f80164830830a7157eb093396';
const tmntId = 'tmt_fd99387c33d9c78aba290286576ddce5';
const userId = 'usr_01234567890123456789012345678901';

const divIdForMock = 'div_18997d3fd7ef4eb7ad2b53a9e93f9ce5';
const squadIdForMock = 'sqd_1234ec18b3d44c0189c83f6ac5fd4ad6';
const tmntIdForMock = 'tmt_d9b1af944d4941f65b2d2d4ac160cdea';

const testOneBrkt: oneBrktType = {
  ...initOneBrkt,
  id: "obk_e886acff5e6145f2aeb7950f9c7f9fe5",
  brkt_id: brktId,
  bindex: 99,
}

const oneBrktToFind: oneBrktType = {
  ...initOneBrkt,
  id: "obk_557f12f3875f42baa29fdbd22ee7f2f4",
  brkt_id: brktId,
  bindex: 0,
}  

const delOneOneBrkt = async (id: string) => { 
  try {
    const delResponse = await axios({
      method: "delete",
      withCredentials: true,
      url: oneOneBrktUrl + id
    });
  } catch (err) {
    if (err instanceof AxiosError) { 
      if (err.status !== 404) {
        console.log(err.message);
        return;
      }
    }
  }
}

const deletePostedOneBrkt = async () => { 
  const response = await axios.get(url);
  const oneBrkts = response.data.oneBrkts;
  const toDel = oneBrkts.find((o: oneBrktType) => o.bindex === 99);
  if (toDel) {
    await delOneOneBrkt(toDel.id);
  }
}

const resetOneBrkt = async () => { 
  // make sure test oneBrkt is reset in database
  const oneBrktJSON = JSON.stringify(testOneBrkt);
  const response = await axios({
    method: "put",
    data: oneBrktJSON,
    withCredentials: true,
    url: oneOneBrktUrl + testOneBrkt.id,
  })
}

const rePostOneBrkt = async (oneBrkt: oneBrktType) => {
  try {
    // if oneBrkt already in database, then don't re-post
    const getResponse = await axios.get(oneOneBrktUrl + oneBrkt.id);
    const found = getResponse.data.oneBrkt;
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
    const oneBrktJSON = JSON.stringify(oneBrkt);
    const response = await axios({
      method: "post",
      withCredentials: true,
      url: url,
      data: oneBrktJSON
    });    
  } catch (err) {
    if (err instanceof AxiosError) console.log(err.message);
  }
}

describe('OneBrkts - API: /api/oneBrkts', () => { 

  describe('GET /api/oneBrkts', () => {

    beforeAll(async () => {
      await deletePostedOneBrkt();
    })  

    it('should return 200 and an array of oneBrkts', async () => {
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      expect(response.data.oneBrkts).toBeDefined();
      expect(Array.isArray(response.data.oneBrkts)).toBe(true);
      // 9 rows in prisma/seed.ts
      expect(response.data.oneBrkts).toHaveLength(9)
    });
  })

  describe('GET by id /api/oneBrkts/oneBrkt/:id', () => {

    beforeAll(async () => {
      await deletePostedOneBrkt();    
    })

    it('should return 200 and the oneBrkt with the given id', async () => {
      const response = await axios.get(oneOneBrktUrl + oneBrktToFind.id);
      expect(response.status).toBe(200);
      expect(response.data.oneBrkt).toBeDefined();
      expect(response.data.oneBrkt.id).toBe(oneBrktToFind.id);
      expect(response.data.oneBrkt.brkt_id).toBe(oneBrktToFind.brkt_id);
      expect(response.data.oneBrkt.bindex).toBe(oneBrktToFind.bindex);
    });
    it('should return 404 for a non-existent id', async () => {
      try {
        await axios.get(oneOneBrktUrl + notFoundId);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("not found");
        }
      }
    });
    it('should return 404 for an invalid id', async () => {
      try {
        await axios.get(oneOneBrktUrl + "invalid_id");
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        }
      }
    });
    it('should return 404 for an valid id, but not a oneBrkt id', async () => { 
      try {
        await axios.get(oneOneBrktUrl + userId);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        }
      }
    })
  });

  describe('GET oneBrkts for a bracket /api/oneBrkts/brkt/:brkt_id', () => { 

    beforeAll(async () => { 
      await deletePostedOneBrkt();
    })

    it('should return 200 and an array of oneBrkts for a given bracket', async () => {          
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: brktsUrl + brktId,
      })
      expect(response.status).toBe(200);
      expect(response.data.oneBrkts).toBeDefined();
      expect(Array.isArray(response.data.oneBrkts)).toBe(true);
      const oneBrkts = response.data.oneBrkts;
      // 2 rows in prisma/seed.ts            
      expect(oneBrkts).toHaveLength(2);
      for (let i = 0; i < oneBrkts.length; i++) {
        const oneBrkt = oneBrkts[i];
        expect(isValidBtDbId(oneBrkt.id, "obk")).toBe(true);
        expect(oneBrkt.brkt_id).toBe(brktId);
        expect(Number.isInteger(oneBrkt.bindex)).toBe(true);
        if (i === 0) expect(oneBrkt.bindex).toBe(0);
        if (i === 1) expect(oneBrkt.bindex).toBe(1);
      }
    });
    it('should NOT get all oneBrkts when brkt_id is not valid', async () => { 
      try {
        const response = await axios({
          method: "get",
          withCredentials: true,
          url: brktsUrl + "invalid_brkt_id",
        })
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get all oneBrkts when brkt_id is valid, but not a brktId', async () => { 
      try {
        const response = await axios({
          method: "get",
          withCredentials: true,
          url: brktsUrl + userId,
        })
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should return 200 and an empty array of oneBrkts for when no linked rows', async () => {       
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: brktsUrl + notFoundBrktId,
      })
      expect(response.status).toBe(200);
      expect(response.data.oneBrkts).toBeDefined();
      expect(Array.isArray(response.data.oneBrkts)).toBe(true);
      // 0 rows 
      expect(response.data.oneBrkts).toHaveLength(0);
    })
  })  

  describe('GET oneBrkts for a div /api/oneBrkts/div/:div_id', () => { 

    beforeAll(async () => {
      await deletePostedOneBrkt();
    })

    it('should get all onebrkts for div', async () => { 
      
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: divUrl + divId
      })
      expect(response.status).toBe(200);            
      expect(response.data.oneBrkts).toBeDefined();
      expect(Array.isArray(response.data.oneBrkts)).toBe(true);
      const oneBrkts = response.data.oneBrkts;
      // 4 rows in prisma/seed.ts            
      expect(oneBrkts).toHaveLength(4);
      for (let i = 0; i < oneBrkts.length; i++) {
        const oneBrkt = oneBrkts[i];
        expect(isValidBtDbId(oneBrkt.id, "obk")).toBe(true);
        if (i === 0 || i === 1) expect(oneBrkt.brkt_id).toBe(brktId);        
        if (i === 2 || i === 3) expect(oneBrkt.brkt_id).toBe(brktId2);
        expect(Number.isInteger(oneBrkt.bindex)).toBe(true);
        if (i === 0 || i === 2) expect(oneBrkt.bindex).toBe(0);
        if (i === 1 || i === 3) expect(oneBrkt.bindex).toBe(1);
      }
    });
    it('should NOT get all oneBrkts when div id is not valid', async () => {
      try {
        const response = await axios({
          method: "get",
          withCredentials: true,
          url: divUrl + "invalid_id",
        })
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it('should NOT get all oneBrkts when div id is valid, but not a divId', async () => {
      try {
        const response = await axios({
          method: "get",
          withCredentials: true,
          url: divUrl + userId,
        })
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it('should return 200 and an empty array of oneBrkts for when no linked rows', async () => {       
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: divUrl + notFoundDivId,
      })
      expect(response.status).toBe(200);
      expect(response.data.oneBrkts).toBeDefined();
      expect(Array.isArray(response.data.oneBrkts)).toBe(true);
      // 0 rows 
      expect(response.data.oneBrkts).toHaveLength(0);
    })    
  })

  describe('GET oneBrkts for a squad /api/oneBrkts/squad/:squad_id', () => { 

    beforeAll(async () => {
      await deletePostedOneBrkt();
    })

    it('should get all onebrkts for squad', async () => { 
      
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: squadUrl + squadId
      })
      expect(response.status).toBe(200);            
      expect(response.data.oneBrkts).toBeDefined();
      expect(Array.isArray(response.data.oneBrkts)).toBe(true);
      const oneBrkts = response.data.oneBrkts;
      // 4 rows in prisma/seed.ts            
      expect(oneBrkts).toHaveLength(4);
      for (let i = 0; i < oneBrkts.length; i++) {
        const oneBrkt = oneBrkts[i];
        expect(isValidBtDbId(oneBrkt.id, "obk")).toBe(true);
        if (i === 0 || i === 1) expect(oneBrkt.brkt_id).toBe(brktId);        
        if (i === 2 || i === 3) expect(oneBrkt.brkt_id).toBe(brktId2);
        expect(Number.isInteger(oneBrkt.bindex)).toBe(true);
        if (i === 0 || i === 2) expect(oneBrkt.bindex).toBe(0);
        if (i === 1 || i === 3) expect(oneBrkt.bindex).toBe(1);
      }
    });
    it('should NOT get all oneBrkts when squad id is not valid', async () => {
      try {
        const response = await axios({
          method: "get",
          withCredentials: true,
          url: squadUrl + "invalid_id",
        })
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it('should NOT get all oneBrkts when div_id is valid, but not a divId', async () => {
      try {
        const response = await axios({
          method: "get",
          withCredentials: true,
          url: squadUrl + userId,
        })
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it('should return 200 and an empty array of oneBrkts for when no linked rows', async () => {       
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: squadUrl + notFoundSquadId,
      })
      expect(response.status).toBe(200);
      expect(response.data.oneBrkts).toBeDefined();
      expect(Array.isArray(response.data.oneBrkts)).toBe(true);
      // 0 rows 
      expect(response.data.oneBrkts).toHaveLength(0);
    })    
  })

  describe('GET oneBrkts for a tmnt /api/oneBrkts/tmnt/:tmnt_id', () => { 

    beforeAll(async () => {
      await deletePostedOneBrkt();
    })

    it('should get all onebrkts for tmnt', async () => {
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: tmntUrl + tmntId
      });
      expect(response.status).toBe(200);
      expect(response.data.oneBrkts).toBeDefined();
      expect(Array.isArray(response.data.oneBrkts)).toBe(true);
      // 4 rows in prisma/seed.ts      
      expect(response.data.oneBrkts).toHaveLength(4);
      response.data.oneBrkts.forEach((oneBrkt: oneBrktType) => {
        expect(isValidBtDbId(oneBrkt.id, "obk")).toBe(true);
        expect([brktId, brktId2]).toContain(oneBrkt.brkt_id);
        expect(Number.isInteger(oneBrkt.bindex)).toBe(true);
        expect(oneBrkt.bindex).toBeGreaterThanOrEqual(0);
        expect(oneBrkt.bindex).toBeLessThanOrEqual(1);
      });
    });
    it('should NOT get all oneBrkts when tmnt is not valid', async () => {
      try {
        const response = await axios({
          method: "get",
          withCredentials: true,
          url: tmntUrl + "invalid_tmnt_id",
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it('should NOT get all oneBrkts when tmnt_id is valid, but not a tmntId', async () => {
      try {
        const response = await axios({
          method: "get",
          withCredentials: true,
          url: tmntUrl + userId,
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it('should return 200 and an empty array of oneBrkts for when no linked rows', async () => {
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: tmntUrl + notFoundTmntId,
      });
      expect(response.status).toBe(200);
      expect(response.data.oneBrkts).toBeDefined();
      expect(Array.isArray(response.data.oneBrkts)).toBe(true);
      // 0 rows 
      expect(response.data.oneBrkts).toHaveLength(0);
    });
  })

  describe('POST /api/oneBrkts', () => { 

    const oneBrktToPost: oneBrktType = {
      ...initOneBrkt,      
      brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
      bindex: 99,
    }

    let didPost = false;

    beforeEach(async () => {
      await deletePostedOneBrkt();
    })

    beforeEach(() => { 
      didPost = false;
    })

    afterEach(async () => { 
      if (didPost) {
        await deletePostedOneBrkt();
      }
    })

    it('should create a new oneBrkt and return 201', async () => {
      const oneBrktJSON = JSON.stringify(oneBrktToPost);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: oneBrktJSON
      });
      didPost = true;
      expect(response.status).toBe(201);
      expect(response.data.oneBrkt).toBeDefined();
      expect(response.data.oneBrkt.id).toBe(oneBrktToPost.id);
      expect(response.data.oneBrkt.brkt_id).toBe(oneBrktToPost.brkt_id);
      expect(response.data.oneBrkt.bindex).toBe(oneBrktToPost.bindex);
    });
    it('should NOT create a new oneBrkt, and return 422 for missing id', async () => { 
      const invalidOneBrkt = {
        ...oneBrktToPost,
        id: "",
      }
      const oneBrktJSON = JSON.stringify(invalidOneBrkt);
      try {
        await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: oneBrktJSON
        });
      }
      catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new oneBrkt, and return 422 for invalid id', async () => { 
      const invalidOneBrkt = {
        ...oneBrktToPost,
        id: "test",
      }
      const oneBrktJSON = JSON.stringify(invalidOneBrkt);
      try {
        await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: oneBrktJSON
        });
      }
      catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new oneBrkt, and return 422 for valid id, but not a oneBrkt id', async () => { 
      const invalidOneBrkt = {
        ...oneBrktToPost,
        id: userId,
      }
      const oneBrktJSON = JSON.stringify(invalidOneBrkt);
      try {
        await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: oneBrktJSON
        });
      }
      catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new oneBrkt, and return 422 for missing brkt_id', async () => { 
      const invalidOneBrkt = {
        ...oneBrktToPost,
        brkt_id: "",
      }
      const oneBrktJSON = JSON.stringify(invalidOneBrkt);
      try {
        await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: oneBrktJSON
        });
      }
      catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new oneBrkt, and return 422 for invalid brkt_id', async () => { 
      const invalidOneBrkt = {
        ...oneBrktToPost,
        brkt_id: "test",
      }
      const oneBrktJSON = JSON.stringify(invalidOneBrkt);
      try {
        await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: oneBrktJSON
        });
      }
      catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new oneBrkt, and return 422 for valid brkt_id, but not a brkt id', async () => { 
      const invalidOneBrkt = {
        ...oneBrktToPost,
        brkt_id: userId,
      }
      const oneBrktJSON = JSON.stringify(invalidOneBrkt);
      try {
        await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: oneBrktJSON
        });
      }
      catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new oneBrkt, and return 422 for missing index', async () => { 
      const invalidOneBrkt = {
        ...oneBrktToPost,
        bindex: undefined as any, 
      }
      const oneBrktJSON = JSON.stringify(invalidOneBrkt);
      try {
        await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: oneBrktJSON
        });
      }
      catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new oneBrkt, and return 422 when index is not a number', async () => { 
      const invalidOneBrkt = {
        ...oneBrktToPost,
        bindex: 'Test' as any,
      }
      const oneBrktJSON = JSON.stringify(invalidOneBrkt);
      try {
        await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: oneBrktJSON
        });
      }
      catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new oneBrkt, and return 422 when index is not an integer', async () => { 
      const invalidOneBrkt = {
        ...oneBrktToPost,
        bindex: 1.5, 
      }
      const oneBrktJSON = JSON.stringify(invalidOneBrkt);
      try {
        await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: oneBrktJSON
        });
      }
      catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new oneBrkt, and return 422 when index is too big', async () => { 
      const invalidOneBrkt = {
        ...oneBrktToPost,
        bindex: Number.MAX_SAFE_INTEGER + 1,
      }
      const oneBrktJSON = JSON.stringify(invalidOneBrkt);
      try {
        await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: oneBrktJSON
        });
      }
      catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new oneBrkt, and return 422 when index is too small', async () => { 
      const invalidOneBrkt = {
        ...oneBrktToPost,
        bindex: -1,
      }
      const oneBrktJSON = JSON.stringify(invalidOneBrkt);
      try {
        await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: oneBrktJSON
        });
      }
      catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("missing data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
  })

  describe('POST many oneBrkts /api/oneBrkts/many', () => { 

    let createdMany = false; 
   
    beforeAll(async () => { 
      await deleteAllOneBrktsForTmnt(tmntIdForMock);
    })

    beforeEach(() => {
      createdMany = false;
    })

    afterEach(async () => {
      if (createdMany) {
        await deleteAllOneBrktsForTmnt(tmntIdForMock);
      }      
    })
  
    it('should create many oneBrkts', async () => {
      const oneBrktsJSON = JSON.stringify(mockOneBrktsToPost);
      const response = await axios({
        method: "post",
        data: oneBrktsJSON,
        withCredentials: true,
        url: manyUrl
      })
      expect(response.status).toBe(201);
      const postedOneBrkts = response.data.oneBrkts;
      createdMany = true;
      expect(postedOneBrkts.length).toBe(mockOneBrktsToPost.length);
      for (let i = 0; i < postedOneBrkts.length; i++) {
        expect(postedOneBrkts[i].id).toEqual(mockOneBrktsToPost[i].id);
        expect(postedOneBrkts[i].brkt_id).toEqual(mockOneBrktsToPost[i].brkt_id);
        expect(postedOneBrkts[i].bindex).toEqual(mockOneBrktsToPost[i].bindex);
      }
    })
    it('should not post oneBrkts with invalid data', async () => { 
      const invalidOneBrkts = cloneDeep(mockOneBrktsToPost);
      invalidOneBrkts[0].bindex = 1.5;
      const potsJSON = JSON.stringify(invalidOneBrkts);
      try {
        const response =await axios({
          method: "post",
          data: potsJSON,
          withCredentials: true,
          url: manyUrl
        });
        expect(response.status).toBe(422);
      }
      catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("invalid data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post oneBrkts with invalid data in 2nd element', async () => { 
      const invalidOneBrkts = cloneDeep(mockOneBrktsToPost);
      invalidOneBrkts[1].brkt_id = userId;
      const potsJSON = JSON.stringify(invalidOneBrkts);
      try {
        const response =await axios({
          method: "post",
          data: potsJSON,
          withCredentials: true,
          url: manyUrl
        });
        expect(response.status).toBe(422);
      }
      catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("invalid data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post oneBrkts with invalid data in 3rd element', async () => {
      const invalidOneBrkts = cloneDeep(mockOneBrktsToPost);
      invalidOneBrkts[2].id = 'test_id';
      const potsJSON = JSON.stringify(invalidOneBrkts);
      try {
        const response =await axios({
          method: "post",
          data: potsJSON,
          withCredentials: true,
          url: manyUrl
        });
        expect(response.status).toBe(422);
      }
      catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("invalid data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should return error code 422 when passed empty array', async () => { 
      const oneBrktsJSON = JSON.stringify([]);
      try {
        const response =await axios({
          method: "post",
          data: oneBrktsJSON,
          withCredentials: true,
          url: manyUrl
        });
        expect(response.status).toBe(422);
      }
      catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
          expect(err.response?.data.error).toBe("invalid data");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
  })

  // NO PUT OR PATCH for oneBrkt - user does not edit

  describe('DELETE by id /api/oneBrkts/oneBrkt/:id', () => {

    // to delete from prisma/seeds.ts
    const toDelOneBrkt = {
      ...initOneBrkt,
      id: "obk_bbae841f36244b5ab5c0ec5793820d85",
      brkt_id: "brk_d047ea07dbc6453a8a705f4bb7599ed4",
      bindex: 0,
    }

    let didDel = false

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      try {
        const oneBrktJSON = JSON.stringify(toDelOneBrkt);
        const response = await axios({
          method: 'post',
          data: oneBrktJSON,
          withCredentials: true,
          url: url
        })        
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })

    it('should delete a oneBrkt by ID', async () => {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneOneBrktUrl + toDelOneBrkt.id,
        })  
        didDel = true;
        expect(delResponse.status).toBe(200);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(200);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a oneBrkt by ID when ID is invalid', async () => { 
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneOneBrktUrl + 'test',
        })  
        expect(delResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a oneBrkt by ID when ID is not found', async () => { 
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneOneBrktUrl + notFoundId,
        })  
        expect(delResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a oneBrkt by ID when ID is valid, but not an oneBrkt id', async () => { 
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneOneBrktUrl + userId
        })  
        expect(delResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
  })

  describe('DELETE all oneBrkts for brkt by id /api/oneBrkts/brkt/:brktId', () => { 

    let didDel = false    

    beforeAll(async () => {
      await postManyOneBrkts(mockOneBrktsToPost)
    })

    beforeEach(() => {      
      didDel = false      
    })

    afterEach(async () => {
      if (!didDel) return;
      await deleteAllOneBrktsForTmnt(tmntIdForMock)
      await postManyOneBrkts(mockOneBrktsToPost)
    })

    afterAll(async () => {
      await deleteAllOneBrktsForTmnt(tmntIdForMock)
    })

    it('should delete all oneBrkts for a brkt', async () => { 
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: brktsUrl + mockOneBrktsToPost[0].brkt_id
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(mockOneBrktsToPost.length);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all oneBrkts for a brkt when brkt id is not valid', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: brktsUrl + 'test'
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all oneBrkts for a brkt when brkt id is valid, but not a brkt id', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: brktsUrl + userId
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should delete 0 oneBrkts for a brkt when brkt id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: brktsUrl + notFoundBrktId
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(0);
      } catch (err) {
        expect(true).toBeFalsy();
      }
    })    
  })

  describe('DELETE all oneBrkts for squad by id /api/oneBrkts/squad/:squadId', () => { 

    
    let didDel = false    

    beforeAll(async () => {
      await postManyOneBrkts(mockOneBrktsToPost)
    })

    beforeEach(() => {      
      didDel = false      
    })

    afterEach(async () => {
      if (!didDel) return;
      await deleteAllOneBrktsForTmnt(tmntIdForMock)
      await postManyOneBrkts(mockOneBrktsToPost)
    })

    afterAll(async () => {
      await deleteAllOneBrktsForTmnt(tmntIdForMock)
    })

    it('should delete all oneBrkts for a squad', async () => { 
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: squadUrl + squadIdForMock
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(mockOneBrktsToPost.length);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all oneBrkts for a squad when squad id is not valid', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: squadUrl + 'test'
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all oneBrkts for a squad when squad id is valid, but not a squad id', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: squadUrl + userId
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should delete 0 oneBrkts for a squad when squad id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: squadUrl + notFoundSquadId
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(0);
      } catch (err) {
        expect(true).toBeFalsy();
      }
    })    
  })

  describe('DELETE all oneBrkts for division by id /api/oneBrkts/div/:divId', () => { 
    
    let didDel = false    

    beforeAll(async () => {
      await postManyOneBrkts(mockOneBrktsToPost)
    })

    beforeEach(() => {      
      didDel = false      
    })

    afterEach(async () => {
      if (!didDel) return;
      await deleteAllOneBrktsForTmnt(tmntIdForMock)
      await postManyOneBrkts(mockOneBrktsToPost)
    })

    afterAll(async () => {
      await deleteAllOneBrktsForTmnt(tmntIdForMock)
    })

    it('should delete all oneBrkts for a division', async () => { 
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: divUrl + divIdForMock
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(mockOneBrktsToPost.length);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all oneBrkts for a div when div id is not valid', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: divUrl + 'test'
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all oneBrkts for a div when div id is valid, but not a squad id', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: divUrl + userId
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should delete 0 oneBrkts for a div when div id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: divUrl + notFoundDivId
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(0);
      } catch (err) {
        expect(true).toBeFalsy();
      }
    })    
  })

  describe('DELETE all oneBrkts for tmnt by id /api/oneBrkts/tmnt/:tmntId', () => { 

    let didDel = false    

    beforeAll(async () => {
      await postManyOneBrkts(mockOneBrktsToPost)
    })

    beforeEach(() => {      
      didDel = false      
    })

    afterEach(async () => {
      if (!didDel) return;
      await deleteAllOneBrktsForTmnt(tmntIdForMock)
      await postManyOneBrkts(mockOneBrktsToPost)
    })

    afterAll(async () => {
      await deleteAllOneBrktsForTmnt(tmntIdForMock)
    })

    it('should delete all oneBrkts for a tmnt', async () => {      
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + tmntIdForMock
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(mockOneBrktsToPost.length);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all oneBrkts for a tmnt when tmnt id is not valid', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + 'test'
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all oneBrkts for a tmnt when tmnt id is valid, but not a tmnt id', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + userId
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should delete 0 oneBrkts for a tmnt when tmnt id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + notFoundTmntId
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(0);
      } catch (err) {
        expect(true).toBeFalsy();
      }
    })    
  })

})