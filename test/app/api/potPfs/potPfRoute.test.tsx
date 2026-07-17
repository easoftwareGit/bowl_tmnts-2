import { privateApi } from "@/lib/api/axios";
import { AxiosError } from "axios";
import { basePotPfsApi } from "@/lib/api/apiPaths";
import { testBasePotPfsApi } from "../../../testApi";
import type { potPfType } from "@/lib/types/types";
import { initPotPf } from "@/lib/db/initVals";
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
const url = process.env.NODE_ENV === "test" && testBasePotPfsApi
  ? testBasePotPfsApi
  : basePotPfsApi;

const onePotPfUrl = url + "/potPf/";
const potUrl = url + "/pot/"; 

const notFoundId = "ppf_01234567890123456789012345678901";
const notFoundPotId = "pot_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

describe('PotPfs - GETs and POST API: /api/potPfs', () => {

  const testPotPf: potPfType = {
    ...initPotPf,
    id: "ppf_59eac0c17bf74348b44041e97469ad76",
    pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
    position: 1,
    amount: 50,
  }

  const potPfToPost: potPfType = {
    ...initPotPf,
    id: "ppf_4e048257e14a462a9b3f8aca6077a432",
    pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
    position: 100,
    amount: 500,
  }

  const deletePostedPotPf = async (potPfId: string) => {
    try {
      await privateApi.delete(onePotPfUrl + potPfId);
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  }  

  describe('GET - API: API: /api/potPfs/potPf/:id', () => {

    beforeAll(async () => {
      await deletePostedPotPf(potPfToPost.id);
    });

    it('should get all potPfs', async () => {
      const response = await privateApi.get(url);
      expect(response.status).toBe(200);
      // 13 rows in prisma/seed.ts
      expect(response.data.potPfs).toHaveLength(13);
      const potPfs: potPfType[] = response.data.potPfs;
      potPfs.forEach((potPf: potPfType) => {
        expect(potPf.pot_id).not.toBeNull();
        expect(potPf.position).not.toBeNull();
        expect(potPf.amount).not.toBeNull();
      })
    });
  })

  describe('GET by ID - API: API: /api/potPfs/potPf/:id', () => {

    beforeAll(async () => {
      await deletePostedPotPf(potPfToPost.id);
    });

    it('should get one potPf', async () => {
      const response = await privateApi.get(onePotPfUrl + testPotPf.id);
      expect(response.status).toBe(200);
      // the "GET" returns json'ed data, so decimal values return as strings
      const potPf: potPfType = response.data.potPf;
      expect(potPf.id).toBe(testPotPf.id);
      expect(potPf.pot_id).toBe(testPotPf.pot_id);
      expect(potPf.position).toBe(testPotPf.position);
      expect(Number(potPf.amount)).toBe(testPotPf.amount);
    });
    it('should not get one potPf when ID is invalid', async () => {
      try {
        const response = await privateApi.get(onePotPfUrl + "/test");
        expect(true).toBeFalsy();
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it('should not get one potPf when ID is valid, but not a potPf ID', async () => {
      try {
        const response = await privateApi.get(onePotPfUrl + userId);
        expect(true).toBeFalsy();
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get one potPf when ID is not found', async () => {
      try {
        const response = await privateApi.get(onePotPfUrl + notFoundId);
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

  describe('GET all potPfs for a pot - API: /api/potPfs/pot/:potId', () => {

    beforeAll(async () => {
      await deletePostedPotPf(potPfToPost.id);
    });

    it('should get all potPfs for a pot', async () => {
      // const values taken from prisma/seed.ts
      const potId = "pot_89fd8f787de942a1a92aaa2df3e7c185";

      const response = await privateApi.get(potUrl + potId, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      // 2 potPf rows for tmnt in prisma/seed.ts
      expect(response.data.potPfs).toHaveLength(2);
      const potPfs: potPfType[] = response.data.potPfs;
      // query in /api/potPfs/pot GET sorts by position
      for (let i = 0; i < potPfs.length; i++) {
        expect(potPfs[i].pot_id).toBe(potId);
        expect(potPfs[i].position).toBe(i + 1);
        expect(potPfs[i].amount).not.toBeNull();
      }
    });
    it('should return status 200 when pot id is not found', async () => {
      const response = await privateApi.get(potUrl + notFoundPotId, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      expect(response.data.potPfs).toHaveLength(0);
    });
    it('should return status 404 when potId is invalid', async () => {
      try {
        const response = await privateApi.get(potUrl + 'invalid', {
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
    it('should return starus 404 when potId is valid, but not a pot id', async () => {
      try {
        const response = await privateApi.get(potUrl + userId, {
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

  describe('POST one potPf API: /api/potPfs', () => {

    let createdPotPf = false;

    beforeAll(async () => {
      await deletePostedPotPf(potPfToPost.id);
    })

    beforeEach(() => {
      createdPotPf = false;
    })

    afterEach(async () => {
      if (createdPotPf) {
        await deletePostedPotPf(potPfToPost.id);
      }
    })

    it('should create a new potPf', async () => {
      const potPfJSON = JSON.stringify(potPfToPost);
      const response = await privateApi.post(url, potPfJSON);
      expect(response.status).toBe(201);
      // the "POST" returns json'ed data, so decimal values return as strings
      const postedPotPf = response.data.potPf;
      createdPotPf = true;
      expect(postedPotPf.id).toEqual(potPfToPost.id);
      expect(postedPotPf.pot_id).toEqual(potPfToPost.pot_id);
      expect(Number(postedPotPf.position)).toEqual(potPfToPost.position);
      expect(Number(postedPotPf.amount)).toEqual(potPfToPost.amount);
    })
    
    it('should NOT create a new potPf when ID is blank', async () => {
      const invalidPotPf = {
        ...potPfToPost,
        id: "",
      }
      const invalidJSON = JSON.stringify(invalidPotPf);
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
    it('should NOT create a new potPf when ID is invalid', async () => {
      const invalidPotPf = {
        ...potPfToPost,
        id: "test",
      }
      const invalidJSON = JSON.stringify(invalidPotPf);
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
    it('should NOT create a new potPf when ID is valid, but not a potPf ID', async () => {
      const invalidPotPf = {
        ...potPfToPost,
        id: userId,
      }
      const invalidJSON = JSON.stringify(invalidPotPf);
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
    it('should NOT create a new potPf when pot_id is blank', async () => {
      const invalidPotPf = {
        ...potPfToPost,
        pot_id: "",
      }
      const invalidJSON = JSON.stringify(invalidPotPf);
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
    it('should NOT create a new potPf when pot_id is invalid', async () => {
      const invalidPotPf = {
        ...potPfToPost,
        pot_id: "test",
      }
      const invalidJSON = JSON.stringify(invalidPotPf);
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
    it('should NOT create a new potPf when pot_id is valid, but not an pot ID', async () => {
      const invalidPotPf = {
        ...potPfToPost,
        pot_id: userId,
      }
      const invalidJSON = JSON.stringify(invalidPotPf);
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
    it('should NOT create a new potPf when position is null', async () => {
      const invalidPotPf = {
        ...potPfToPost,
        position: null as any,
      }
      const invalidJSON = JSON.stringify(invalidPotPf);
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
    it('should NOT create a new potPf when position is too low', async () => {
      const invalidPotPf = {
        ...potPfToPost,
        position: 0,
      }
      const invalidJSON = JSON.stringify(invalidPotPf);
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
    it('should NOT create a new potPf when position is too high', async () => {
      const invalidPotPf = {
        ...potPfToPost,
        position: maxPosition + 1,
      }
      const invalidJSON = JSON.stringify(invalidPotPf);
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
    it('should NOT create a new potPf when position is not a number', async () => {
      const invalidPotPf = {
        ...potPfToPost,
        position: "test",
      }
      const invalidJSON = JSON.stringify(invalidPotPf);
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
    it('should NOT create a new potPf when position is not an integer', async () => {
      const invalidPotPf = {
        ...potPfToPost,
        position: 1.5,
      }
      const invalidJSON = JSON.stringify(invalidPotPf);
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
    it('should NOT create a new potPf when amount is null', async () => {
      const invalidPotPf = {
        ...potPfToPost,
        amount: null as any,
      }
      const invalidJSON = JSON.stringify(invalidPotPf);
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
    it('should NOT create a new potPf when amount is too low', async () => {
      const invalidPotPf = {
        ...potPfToPost,
        amount: -1,
      }
      const invalidJSON = JSON.stringify(invalidPotPf);
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
    it('should NOT create a new potPf when amount is too high', async () => {
      const invalidPotPf = {
        ...potPfToPost,
        amount: maxMoney + 1,
      }
      const invalidJSON = JSON.stringify(invalidPotPf);
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
    it('should NOT create a new potPf when amount is not a number', async () => {
      const invalidPotPf = {
        ...potPfToPost,
        amount: "test",
      }
      const invalidJSON = JSON.stringify(invalidPotPf);
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

  describe('PATCH by ID - API: /api/potPfs/potPf/:id', () => {

    const toPatchId = 'ppf_af2a95c8c1e348acbaccf306f54a6087';
    
    const toPatch = {
      ...initPotPf,
      id: toPatchId,
      pot_id: "pot_ab80213899ea424b938f52a062deacfe",
      position: 20,
      amount: 1234,
    }

    const resetPatched = async () => {
      // make sure toPatch is reset in database
      const potPfJSON = JSON.stringify(toPatch);
      await privateApi.put(onePotPfUrl + toPatch.id, potPfJSON);
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

    it('should patch position when patching a potPf by ID', async () => {
      const patchPotPf = {
        id: toPatchId,
        position: 321,
      }
      const potPfJSON = JSON.stringify(patchPotPf);
      const response = await privateApi.patch(onePotPfUrl + patchPotPf.id, potPfJSON);
      const patchedPotPf = response.data.potPf;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(Number(patchedPotPf.position)).toEqual(patchPotPf.position);
    })

    it('should patch amount when patching a potPf by ID', async () => {
      const patchPotPf = {
        id: toPatchId,
        amount: 4321,
      }
      const potPfJSON = JSON.stringify(patchPotPf);
      const response = await privateApi.patch(onePotPfUrl + patchPotPf.id, potPfJSON);
      const patchedPotPf = response.data.potPf;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(Number(patchedPotPf.amount)).toEqual(patchPotPf.amount);
    })

    it('should not patch potPf by ID when just passing in ID', async () => {
      try {
        const invalidJSON = JSON.stringify({
          id: toPatchId,
        })
        const response = await privateApi.patch(onePotPfUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch potPf by ID when ID is invalid', async () => {
      try {
        const invalidJSON = JSON.stringify({
          position: 321,
        })
        const response = await privateApi.patch(onePotPfUrl + 'test', invalidJSON)
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch potPf by ID when ID is valid, but not found', async () => {
      try {
        const invalidJSON = JSON.stringify({
          position: 321,
        })
        const response = await privateApi.patch(onePotPfUrl + notFoundId, invalidJSON)
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch potPf by ID when ID is valid, but not a potPf id', async () => {
      try {
        const invalidJSON = JSON.stringify({
          position: 321,
        })
        const response = await privateApi.patch(onePotPfUrl + userId, invalidJSON)
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should NOT patch pot_id when patching a potPf by ID', async () => {
      try {
        const invalidJSON = JSON.stringify({
          id: toPatchId,
          pot_id: testPotPf.pot_id,
        })
        const response = await privateApi.patch(onePotPfUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch pot_id when patching a potPf by ID when pot_id is invalid', async () => {
      try {
        const invalidJSON = JSON.stringify({
          pot_id: 'test',
        })
        const response = await privateApi.patch(onePotPfUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch pot_id when patching a potPf by ID when pot_id is valid, but not a pot id', async () => {
      try {
        const invalidJSON = JSON.stringify({
          pot_id: userId,
        })
        const response = await privateApi.patch(onePotPfUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should not patch position when patching a potPf by ID when position is too low', async () => {
      try {
        const invalidJSON = JSON.stringify({
          position: 0,
        })
        const response = await privateApi.patch(onePotPfUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch position when patching a potPf by ID when position is too high', async () => {
      try {
        const invalidJSON = JSON.stringify({
          position: maxPosition + 1,
        })
        const response = await privateApi.patch(onePotPfUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch position when patching a potPf by ID when position is not a number', async () => {
      try {
        const invalidJSON = JSON.stringify({
          position: 'test',
        })
        const response = await privateApi.patch(onePotPfUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch position when patching a potPf by ID when position is not an integer', async () => {
      try {
        const invalidJSON = JSON.stringify({
          position: 1.5,
        })
        const response = await privateApi.patch(onePotPfUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })


    it('should not patch amount when patching a potPf by ID when amount is too low', async () => {
      try {
        const invalidJSON = JSON.stringify({
          amount: -1,
        })
        const response = await privateApi.patch(onePotPfUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch amount when patching a potPf by ID when amount is too high', async () => {
      try {
        const invalidJSON = JSON.stringify({
          amount: maxMoney + 1,
        })
        const response = await privateApi.patch(onePotPfUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch amount when patching a potPf by ID when amount is not a number', async () => {
      try {
        const invalidJSON = JSON.stringify({
          amount: 'test',
        })
        const response = await privateApi.patch(onePotPfUrl + toPatchId, invalidJSON)
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

  describe('DELETE by ID - API: /api/potPfs/potPf/:id', () => { 

    const toDelPotPf = {
      ...initPotPf,
      id: "ppf_af2a95c8c1e348acbaccf306f54a6087",
      pot_id: "pot_ab80213899ea424b938f52a062deacfe",
      position: 1,
      amount: 100,
    }

    let didDel = false

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      // if deleted potPf, add potPf back
      try {
        const potPfJSON = JSON.stringify(toDelPotPf);
        await privateApi.post(url, potPfJSON);
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })

    it('should delete a potPf by ID', async () => {
      try {
        const response = await privateApi.delete(onePotPfUrl + toDelPotPf.id)
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
    it('should NOT delete a potPf by ID when ID is valid, but not found', async () => {
      const response = await privateApi.delete(onePotPfUrl + notFoundId);
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(0);
    })    
    it('should NOT delete a potPf by ID when ID is invalid', async () => {
      try {
        const response = await privateApi.delete(onePotPfUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a potPf by ID when ID is valid, but not a potPf ID', async () => {
      try {
        const response = await privateApi.delete(onePotPfUrl + userId);
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
  
  describe('DELETE by by pot_id, all potPfs for a pot - API: /api/potPfs/potPf/:id', () => { 

    // values for prisma/seeds.ts
    const delPotId = "pot_b2a7b02d761b4f5ab5438be84f642c3b";
    const delPotPf1 = {
      ...initPotPf,
      id: "ppf_59eac0c17bf74348b44041e97469ad76",
      pot_id: delPotId,
      position: 1,
      amount: 50,
    }
    const delPotPf2 = {
      ...initPotPf,
      id: "ppf_0fed31aae5374e6690b6535ced1ebff5",
      pot_id: delPotId,
      position: 2,
      amount: 10,
    }
    const restorePotPfs = async () => {
      await privateApi.delete(potUrl + delPotId);      
      const del1JSON = JSON.stringify(delPotPf1);
      await privateApi.post(url, del1JSON);
      const del2JSON = JSON.stringify(delPotPf2);
      await privateApi.post(url, del2JSON);
    }

    let didDel = false

    beforeAll(async () => {
      await restorePotPfs();
    })

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      // if deleted potPfs, add them back
      await restorePotPfs();
    })

    it('should delete all potPfs for a pot by pot_id', async () => {
      const response = await privateApi.delete(potUrl + delPotId);
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(2);
      didDel = true;
    })
    it('should NOT delete all potPfs for a pot by pot_id when pot_id is valid, but not found', async () => {
      const response = await privateApi.delete(potUrl + notFoundPotId);
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(0);
    })    
    it('should NOT delete all potPfs for a pot by pot_id when pot_id is invalid', async () => {
      try {
        const response = await privateApi.delete(potUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all potPfs for a pot by pot_id when pot_id is valid, but not a pot ID', async () => {
      try {        
        const response = await privateApi.delete(potUrl + userId);
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