import { privateApi } from "@/lib/api/axios";
import { AxiosError } from "axios";
import { baseElimPfsApi } from "@/lib/api/apiPaths";
import { testBaseElimPfsApi } from "../../../testApi";
import type { elimPfType } from "@/lib/types/types";
import { initElimPf } from "@/lib/db/initVals";
import { maxMoney, maxPosition } from "@/lib/validation/constants";

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
const url = process.env.NODE_ENV === "test" && testBaseElimPfsApi
  ? testBaseElimPfsApi
  : baseElimPfsApi;

const oneElimPfUrl = url + "/elimPf/";
const elimUrl = url + "/elim/"; 

const notFoundId = "epf_01234567890123456789012345678901";
const notFoundElimId = "elm_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

describe('ElimPfs - GETs and POST API: /api/elimPfs', () => {

  const testElimPf: elimPfType = {
    ...initElimPf,
    id: "epf_42c133340c174d05ba7098930e2f0f90",
    elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
    position: 1,
    amount: 80,
  }

  const elimPfToPost: elimPfType = {
    ...initElimPf,
    id: "epf_4e048257e14a462a9b3f8aca6077a432",
    elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
    position: 100,
    amount: 500,
  }

  const deletePostedElimPf = async (elimPfId: string) => {
    try {
      await privateApi.delete(oneElimPfUrl + elimPfId);
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  }  

  describe('GET - API: API: /api/elimPfs/elimPf/:id', () => {

    beforeAll(async () => {
      await deletePostedElimPf(elimPfToPost.id);
    });

    it('should get all elimPfs', async () => {
      const response = await privateApi.get(url);
      expect(response.status).toBe(200);
      // 19 rows in prisma/seed.ts
      expect(response.data.elimPfs).toHaveLength(19);
      const elimPfs: elimPfType[] = response.data.elimPfs;
      elimPfs.forEach((elimPf: elimPfType) => {
        expect(elimPf.elim_id).not.toBeNull();
        expect(elimPf.position).not.toBeNull();
        expect(elimPf.amount).not.toBeNull();
      })
    });
  })

  describe('GET by ID - API: API: /api/elimPfs/elimPf/:id', () => {

    beforeAll(async () => {
      await deletePostedElimPf(elimPfToPost.id);
    });

    it('should get one elimPf', async () => {
      const response = await privateApi.get(oneElimPfUrl + testElimPf.id);
      expect(response.status).toBe(200);
      // the "GET" returns json'ed data, so decimal values return as strings
      const elimPf: elimPfType = response.data.elimPf;
      expect(elimPf.id).toBe(testElimPf.id);
      expect(elimPf.elim_id).toBe(testElimPf.elim_id);
      expect(elimPf.position).toBe(testElimPf.position);
      expect(Number(elimPf.amount)).toBe(testElimPf.amount);
    });
    it('should not get one elimPf when ID is invalid', async () => {
      try {
        const response = await privateApi.get(oneElimPfUrl + "/test");
        expect(true).toBeFalsy();
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it('should not get one elimPf when ID is valid, but not an elimPf ID', async () => {
      try {
        const response = await privateApi.get(oneElimPfUrl + userId);
        expect(true).toBeFalsy();
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get one elimPf when ID is not found', async () => {
      try {
        const response = await privateApi.get(oneElimPfUrl + notFoundId);
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

  describe('GET all elimPfs for an elim - API: /api/elimPfs/elim/:elimId', () => {

    beforeAll(async () => {
      await deletePostedElimPf(elimPfToPost.id);
    });

    it('should get all elimPfs for an elim', async () => {
      // const values taken from prisma/seed.ts
      const elimId = "elm_c01077494c2d4d9da166d697c08c28d2";

      const response = await privateApi.get(elimUrl + elimId, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      // 2 elimPf rows for tmnt in prisma/seed.ts
      expect(response.data.elimPfs).toHaveLength(2);
      const elimPfs: elimPfType[] = response.data.elimPfs;
      // query in /api/elimPfs/elim GET sorts by position
      for (let i = 0; i < elimPfs.length; i++) {
        expect(elimPfs[i].elim_id).toBe(elimId);
        expect(elimPfs[i].position).toBe(i + 1);
        expect(elimPfs[i].amount).not.toBeNull();
      }
    });
    it('should return status 200 when elim id is not found', async () => {
      const response = await privateApi.get(elimUrl + notFoundElimId, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      expect(response.data.elimPfs).toHaveLength(0);
    });
    it('should return status 404 when elimId is invalid', async () => {
      try {
        const response = await privateApi.get(elimUrl + 'invalid', {
          withCredentials: true
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
    it('should return starus 404 when elimId is valid, but not an elim id', async () => {
      try {
        const response = await privateApi.get(elimUrl + userId, {
          withCredentials: true
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
  });

  describe('POST one elimPf API: /api/elimPfs', () => {

    let createdElimPf = false;

    beforeAll(async () => {
      await deletePostedElimPf(elimPfToPost.id);
    })

    beforeEach(() => {
      createdElimPf = false;
    })

    afterEach(async () => {
      if (createdElimPf) {
        await deletePostedElimPf(elimPfToPost.id);
      }
    })

    it('should create a new elimPf', async () => {
      const elimPfJSON = JSON.stringify(elimPfToPost);
      const response = await privateApi.post(url, elimPfJSON);
      expect(response.status).toBe(201);
      // the "POST" returns json'ed data, so decimal values return as strings
      const postedElimPf = response.data.elimPf;
      createdElimPf = true;
      expect(postedElimPf.id).toEqual(elimPfToPost.id);
      expect(postedElimPf.elim_id).toEqual(elimPfToPost.elim_id);
      expect(Number(postedElimPf.position)).toEqual(elimPfToPost.position);
      expect(Number(postedElimPf.amount)).toEqual(elimPfToPost.amount);
    })
    
    it('should NOT create a new elimPf when ID is blank', async () => {
      const invalidElimPf = {
        ...elimPfToPost,
        id: "",
      }
      const invalidJSON = JSON.stringify(invalidElimPf);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new elimPf when ID is invalid', async () => {
      const invalidElimPf = {
        ...elimPfToPost,
        id: "test",
      }
      const invalidJSON = JSON.stringify(invalidElimPf);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new elimPf when ID is valid, but not an elimPf ID', async () => {
      const invalidElimPf = {
        ...elimPfToPost,
        id: userId,
      }
      const invalidJSON = JSON.stringify(invalidElimPf);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new elimPf when elim_id is blank', async () => {
      const invalidElimPf = {
        ...elimPfToPost,
        elim_id: "",
      }
      const invalidJSON = JSON.stringify(invalidElimPf);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new elimPf when elim_id is invalid', async () => {
      const invalidElimPf = {
        ...elimPfToPost,
        elim_id: "test",
      }
      const invalidJSON = JSON.stringify(invalidElimPf);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new elimPf when elim_id is valid, but not an elim ID', async () => {
      const invalidElimPf = {
        ...elimPfToPost,
        elim_id: userId,
      }
      const invalidJSON = JSON.stringify(invalidElimPf);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new elimPf when position is null', async () => {
      const invalidElimPf = {
        ...elimPfToPost,
        position: null as any,
      }
      const invalidJSON = JSON.stringify(invalidElimPf);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new elimPf when position is too low', async () => {
      const invalidElimPf = {
        ...elimPfToPost,
        position: 0,
      }
      const invalidJSON = JSON.stringify(invalidElimPf);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new elimPf when position is too high', async () => {
      const invalidElimPf = {
        ...elimPfToPost,
        position: maxPosition + 1,
      }
      const invalidJSON = JSON.stringify(invalidElimPf);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new elimPf when position is not a number', async () => {
      const invalidElimPf = {
        ...elimPfToPost,
        position: "test",
      }
      const invalidJSON = JSON.stringify(invalidElimPf);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new elimPf when position is not an integer', async () => {
      const invalidElimPf = {
        ...elimPfToPost,
        position: 1.5,
      }
      const invalidJSON = JSON.stringify(invalidElimPf);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new elimPf when amount is null', async () => {
      const invalidElimPf = {
        ...elimPfToPost,
        amount: null as any,
      }
      const invalidJSON = JSON.stringify(invalidElimPf);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new elimPf when amount is too low', async () => {
      const invalidElimPf = {
        ...elimPfToPost,
        amount: -1,
      }
      const invalidJSON = JSON.stringify(invalidElimPf);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new elimPf when amount is too high', async () => {
      const invalidElimPf = {
        ...elimPfToPost,
        amount: maxMoney + 1,
      }
      const invalidJSON = JSON.stringify(invalidElimPf);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new elimPf when amount is not a number', async () => {
      const invalidElimPf = {
        ...elimPfToPost,
        amount: "test",
      }
      const invalidJSON = JSON.stringify(invalidElimPf);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
  });

  describe('PATCH by ID - API: /api/elimPfs/elimPf/:id', () => {

    const toPatchId = 'epf_710eda589d3f4106abe78006195e328a';
    
    const toPatch = {
      ...initElimPf,
      id: toPatchId,
      elim_id: "elm_c01077494c2d4d9da166d697c08c28d2",
      position: 2,
      amount: 60,
    }

    const resetPatched = async () => {
      // make sure toPatch is reset in database
      const elimPfJSON = JSON.stringify(toPatch);
      await privateApi.put(oneElimPfUrl + toPatch.id, elimPfJSON);
    }

    let didPatch = false;

    beforeAll(async () => {
      await resetPatched();
    })

    beforeEach(() => {
      didPatch = false;
    })

    afterEach(async () => {
      if (didPatch) {
        await resetPatched();
      }
    })

    it('should patch position when patching an elimPf by ID', async () => {
      const patchElimPf = {
        id: toPatchId,
        position: 321,
      }
      const elimPfJSON = JSON.stringify(patchElimPf);
      const response = await privateApi.patch(oneElimPfUrl + patchElimPf.id, elimPfJSON);
      const patchedElimPf = response.data.elimPf;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(Number(patchedElimPf.position)).toEqual(patchElimPf.position);
    })

    it('should patch amount when patching an elimPf by ID', async () => {
      const patchElimPf = {
        id: toPatchId,
        amount: 4321,
      }
      const elimPfJSON = JSON.stringify(patchElimPf);
      const response = await privateApi.patch(oneElimPfUrl + patchElimPf.id, elimPfJSON);
      const patchedElimPf = response.data.elimPf;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(Number(patchedElimPf.amount)).toEqual(patchElimPf.amount);
    })

    it('should not patch elimPf by ID when just passing in ID', async () => {
      try {
        const invalidJSON = JSON.stringify({
          id: toPatchId,
        })
        const response = await privateApi.patch(oneElimPfUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch elimPf by ID when ID is invalid', async () => {
      try {
        const invalidJSON = JSON.stringify({
          position: 321,
        })
        const response = await privateApi.patch(oneElimPfUrl + 'test', invalidJSON)
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch elimPf by ID when ID is valid, but not found', async () => {
      try {
        const invalidJSON = JSON.stringify({
          position: 321,
        })
        const response = await privateApi.patch(oneElimPfUrl + notFoundId, invalidJSON)
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch elimPf by ID when ID is valid, but not an elimPf id', async () => {
      try {
        const invalidJSON = JSON.stringify({
          position: 321,
        })
        const response = await privateApi.patch(oneElimPfUrl + userId, invalidJSON)
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should NOT patch elim_id when patching an elimPf by ID', async () => {
      try {
        const invalidJSON = JSON.stringify({
          id: toPatchId,
          elim_id: testElimPf.elim_id,
        })
        const response = await privateApi.patch(oneElimPfUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch elim_id when patching an elimPf by ID when elim_id is invalid', async () => {
      try {
        const invalidJSON = JSON.stringify({
          elim_id: 'test',
        })
        const response = await privateApi.patch(oneElimPfUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch elim_id when patching an elimPf by ID when elim_id is valid, but not an elim id', async () => {
      try {
        const invalidJSON = JSON.stringify({
          elim_id: userId,
        })
        const response = await privateApi.patch(oneElimPfUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should not patch position when patching an elimPf by ID when position is too low', async () => {
      try {
        const invalidJSON = JSON.stringify({
          position: 0,
        })
        const response = await privateApi.patch(oneElimPfUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch position when patching an elimPf by ID when position is too high', async () => {
      try {
        const invalidJSON = JSON.stringify({
          position: maxPosition + 1,
        })
        const response = await privateApi.patch(oneElimPfUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch position when patching an elimPf by ID when position is not a number', async () => {
      try {
        const invalidJSON = JSON.stringify({
          position: 'test',
        })
        const response = await privateApi.patch(oneElimPfUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch position when patching an elimPf by ID when position is not an integer', async () => {
      try {
        const invalidJSON = JSON.stringify({
          position: 1.5,
        })
        const response = await privateApi.patch(oneElimPfUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })


    it('should not patch amount when patching an elimPf by ID when amount is too low', async () => {
      try {
        const invalidJSON = JSON.stringify({
          amount: -1,
        })
        const response = await privateApi.patch(oneElimPfUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch amount when patching an elimPf by ID when amount is too high', async () => {
      try {
        const invalidJSON = JSON.stringify({
          amount: maxMoney + 1,
        })
        const response = await privateApi.patch(oneElimPfUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch amount when patching an elimPf by ID when amount is not a number', async () => {
      try {
        const invalidJSON = JSON.stringify({
          amount: 'test',
        })
        const response = await privateApi.patch(oneElimPfUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
  })

  describe('DELETE by ID - API: /api/elimPfs/elimPf/:id', () => { 

    const toDelElimPf = {
      ...initElimPf,
      id: "epf_af2a95c8c1e348acbaccf306f54a6087",
      elim_id: "elm_a47a4ec07f824b0e93169ae78e8b4b1e",
      position: 1,
      amount: 100,
    }

    let didDel = false

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      // if deleted elimPf, add elimPf back
      try {
        const elimPfJSON = JSON.stringify(toDelElimPf);
        await privateApi.post(url, elimPfJSON);
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })

    it('should delete an elimPf by ID', async () => {
      try {
        const response = await privateApi.delete(oneElimPfUrl + toDelElimPf.id)
        expect(response.status).toBe(200);
        didDel = true;
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete an elimPf by ID when ID is valid, but not found', async () => {
      const response = await privateApi.delete(oneElimPfUrl + notFoundId);
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(0);
    })    
    it('should NOT delete an elimPf by ID when ID is invalid', async () => {
      try {
        const response = await privateApi.delete(oneElimPfUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete an elimPf by ID when ID is valid, but not an elimPf ID', async () => {
      try {
        const response = await privateApi.delete(oneElimPfUrl + userId);
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
  
  describe('DELETE by by elim_id, all elimPfs for an elim - API: /api/elimPfs/elimPf/:id', () => { 

    // values for prisma/seeds.ts
    const delElimId = "elm_45d884582e7042bb95b4818ccdd9974c";
    const delElimPf1 = {
      ...initElimPf,
      id: "epf_59eac0c17bf74348b44041e97469ad76",
      elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
      position: 1,
      amount: 50,
    }
    const delElimPf2 = {
      ...initElimPf,
      id: "epf_0fed31aae5374e6690b6535ced1ebff5",
      elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
      position: 2,
      amount: 20,
    }
    const restoreElimPfs = async () => {
      await privateApi.delete(elimUrl + delElimId);      
      const del1JSON = JSON.stringify(delElimPf1);
      await privateApi.post(url, del1JSON);
      const del2JSON = JSON.stringify(delElimPf2);
      await privateApi.post(url, del2JSON);
    }

    let didDel = false

    beforeAll(async () => {
      await restoreElimPfs();
    })

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      // if deleted elimPfs, add them back
      await restoreElimPfs();
    })

    it('should delete all elimPfs for an elim by elim_id', async () => {
      const response = await privateApi.delete(elimUrl + delElimId);
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(2);
      didDel = true;
    })
    it('should NOT delete all elimPfs for an elim by elim_id when elim_id is valid, but not found', async () => {
      const response = await privateApi.delete(elimUrl + notFoundElimId);
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(0);
    })    
    it('should NOT delete all elimPfs for an elim by elim_id when elim_id is invalid', async () => {
      try {
        const response = await privateApi.delete(elimUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all elimPfs for an elim by elim_id when elim_id is valid, but not an elim ID', async () => {
      try {        
        const response = await privateApi.delete(elimUrl + userId);
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
});