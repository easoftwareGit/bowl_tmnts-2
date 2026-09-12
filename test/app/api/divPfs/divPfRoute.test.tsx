import { privateApi } from "@/lib/api/axios";
import { AxiosError } from "axios";
import { baseDivPfsApi } from "@/lib/api/apiPaths";
import { testBaseDivPfsApi } from "../../../testApi";
import type { divPfDataType, divPfSaveDataType, divPfType } from "@/lib/types/types";
import { initDivPf } from "@/lib/db/initVals";
import { maxMoney, maxPosition } from "@/lib/validation/constants";
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

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseDivPfsApi
  ? testBaseDivPfsApi
  : baseDivPfsApi;

const oneDivPfUrl = url + "/divPf/";
const tmntUrl = url + "/tmnt/"; 

const notFoundId = "dpf_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

describe('DivPfs - GETs and POST API: /api/divPfs', () => {

  const testDivPf: divPfType = {
    ...initDivPf,
    id: "dpf_ce55c52bd60d4943bb747590a03c9732",
    div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    position: 1,
    amount: 300,
  }

  describe('GET - API: API: /api/divPfs/divPf/:id', () => {

    it('should get all divPfs', async () => {
      const response = await privateApi.get(url);
      expect(response.status).toBe(200);
      // 16 rows in prisma/seed.ts
      expect(response.data.divPfs).toHaveLength(16);
      const divPfs: divPfType[] = response.data.divPfs;
      divPfs.forEach((divPf: divPfType) => {
        expect(divPf.div_id).not.toBeNull();
        expect(divPf.position).not.toBeNull();
        expect(divPf.amount).not.toBeNull();
      })
    });
  });

  describe('GET by ID - API: API: /api/divPfs/divPf/:id', () => {

    it('should get one divPf', async () => {
      const response = await privateApi.get(oneDivPfUrl + testDivPf.id);
      expect(response.status).toBe(200);
      // the "GET" returns json'ed data, so decimal values return as strings
      const divPf: divPfType = response.data.divPf;
      expect(divPf.id).toBe(testDivPf.id);
      expect(divPf.div_id).toBe(testDivPf.div_id);
      expect(divPf.position).toBe(testDivPf.position);
      expect(Number(divPf.amount)).toBe(testDivPf.amount);
    });
    it('should not get one divPf when ID is invalid', async () => {
      try {
        const response = await privateApi.get(oneDivPfUrl + "/test");
        expect(true).toBeFalsy();
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it('should not get one divPf when ID is valid, but not a divPf ID', async () => {
      try {
        const response = await privateApi.get(oneDivPfUrl + userId);
        expect(true).toBeFalsy();
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get one divPf when ID is not found', async () => {
      try {
        const response = await privateApi.get(oneDivPfUrl + notFoundId);
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

  describe('GET all divPfs for a tmnt - API: /api/divPfs/tmnt/:tmntId', () => {    

    it('should get all divPfs for a tournament - one div in tournament', async () => {
      // const values taken from prisma/seed.ts
      const tmntId = 'tmt_d237a388a8fc4641a2e37233f1d6bebd';
      const divId = 'div_99a3cae28786485bb7a036935f0f6a0a';

      const response = await privateApi.get(tmntUrl + tmntId, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      // 9 divPf rows for tmnt in prisma/seed.ts
      expect(response.data.divPfs).toHaveLength(9);
      const divPfs: divPfType[] = response.data.divPfs;
      // query in /api/divPfs/tmnt/[tmntId] GET sorts by position
      for (let i = 0; i < divPfs.length; i++) {
        expect(divPfs[i].div_id).toBe(divId);
        expect(divPfs[i].position).toBe(i + 1);
        expect(divPfs[i].amount).not.toBeNull();
      }
    });
    it('should get all divPfs for a tournament - two divs in tournament', async () => {
      // const values taken from prisma/seed.ts
      const tmntId = 'tmt_fe8ac53dad0f400abe6354210a8f4cd1';
      const divIds: string[] = [
        'div_578834e04e5e4885bbae79229d8b96e8',
        'div_fe72ab97edf8407186c8e6df7f7fb741',
      ] 

      const response = await privateApi.get(tmntUrl + tmntId, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      // 4 divPf rows for tmnt in prisma/seed.ts
      expect(response.data.divPfs).toHaveLength(4);
      const divPfs: divPfType[] = response.data.divPfs;
      // query in /api/divPfs/tmnt/[tmntId] GET sorts by position

      expect(divPfs[0].div_id).toBe(divIds[0]);
      expect(divPfs[0].position).toBe(1);
      expect(divPfs[0].amount).not.toBeNull();

      expect(divPfs[1].div_id).toBe(divIds[0]);
      expect(divPfs[1].position).toBe(2);
      expect(divPfs[1].amount).not.toBeNull();

      expect(divPfs[2].div_id).toBe(divIds[1]);
      expect(divPfs[2].position).toBe(1);
      expect(divPfs[2].amount).not.toBeNull();

      expect(divPfs[3].div_id).toBe(divIds[1]);
      expect(divPfs[3].position).toBe(2);
      expect(divPfs[3].amount).not.toBeNull();

    });
    it('should return status 200 when tmntId is not found', async () => {
      const response = await privateApi.get(tmntUrl + notFoundTmntId, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      expect(response.data.divPfs).toHaveLength(0);
    });
    it('should return status 404 when tmntId is invalid', async () => {
      try {
        const response = await privateApi.get(tmntUrl + 'invalid', {
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
    it('should return starus 404 when tmntId is valid, but not a tmnt id', async () => {
      try {
        const response = await privateApi.get(tmntUrl + userId, {
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

  describe('PUT many divPfs API: /api/divPfs/tmnt/:tmntId', () => {

    describe('should update many divPfs for a tournament - 1 div', () => {
      // values for prisma/seeds.ts      
      const pmTmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
      const pmDivId = "div_f30aea2c534f4cfe87f4315531cef8ef";
      const pmDivPf1 = {
        ...initDivPf,
        id: "dpf_ce55c52bd60d4943bb747590a03c9732",
        div_id: pmDivId,
        position: 1,
        amount: 300,
      }
      const pmDivPf2 = {
        ...initDivPf,
        id: "dpf_ce55c52bd60d4943bb747590a03c9733",
        div_id: pmDivId,
        position: 2,
        amount: 200,
      }

      const validDivIds: string[] = [pmDivId];

      const restoreDivPfs = async () => {
        await privateApi.delete(tmntUrl + pmTmntId);
        const restorePmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        const restoreDivIds = cloneDeep(validDivIds); 
        const restoreData: divPfSaveDataType = {
          divPfData: restorePmDivPfs,
          divIds: restoreDivIds
        }
        const restoreJSON = JSON.stringify(restoreData);
        await privateApi.put(tmntUrl + pmTmntId, restoreJSON);
      }

      let putMany = false;

      beforeAll(async () => {
        await restoreDivPfs();
      })

      afterEach(async () => {
        if (putMany) {
          await restoreDivPfs();
        }
        putMany = false;
      })

      it('should update many divPfs for a tournament - 1 div - change amount', async () => {
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].amount = 350;
        pmDivPfs[1].amount = 250;

        const validData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }
        const divPfJSON = JSON.stringify(validData);

        const response = await privateApi.put(tmntUrl + pmTmntId, divPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmDivPfs.length);
        expect(response.data.divPfs).toHaveLength(pmDivPfs.length);
        const puttedDivPfs = response.data.divPfs;
        expect(puttedDivPfs[0].amount).toBe(pmDivPfs[0].amount);
        expect(puttedDivPfs[1].amount).toBe(pmDivPfs[1].amount);
      });
      it('should update many divPfs for a tournament - 1 div - add row', async () => {
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs.push({
          ...initDivPf,
          id: "dpf_ce55c52bd60d4943bb747590a03c9734",
          div_id: pmDivId,
          position: 3,
          amount: 100,
        });
        
        const validData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }
        const divPfJSON = JSON.stringify(validData);

        const response = await privateApi.put(tmntUrl + pmTmntId, divPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmDivPfs.length);
        expect(response.data.divPfs).toHaveLength(pmDivPfs.length);
        const puttedDivPfs = response.data.divPfs;
        expect(puttedDivPfs[0].amount).toBe(pmDivPfs[0].amount);
        expect(puttedDivPfs[1].amount).toBe(pmDivPfs[1].amount);
        expect(puttedDivPfs[2].amount).toBe(pmDivPfs[2].amount);
      })
      it('should update many divPfs for a tournament - 1 div - change amount and delete a row', async () => {
        const pmDivPfs = cloneDeep([pmDivPf1]);
        pmDivPfs[0].amount = 400;
        
        const validData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }
        const divPfJSON = JSON.stringify(validData);
        
        const response = await privateApi.put(tmntUrl + pmTmntId, divPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmDivPfs.length);
        expect(response.data.divPfs).toHaveLength(pmDivPfs.length);
        const puttedDivPfs = response.data.divPfs;
        expect(puttedDivPfs[0].amount).toBe(pmDivPfs[0].amount);
      })
      it('should update many divPfs for a tournament - 1 div - sanitize amount', async () => {
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].amount = 350.351;
        
        const validData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }
        const divPfJSON = JSON.stringify(validData);
        
        const response = await privateApi.put(tmntUrl + pmTmntId, divPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmDivPfs.length);
        expect(response.data.divPfs).toHaveLength(pmDivPfs.length);
        const puttedDivPfs = response.data.divPfs;
        expect(puttedDivPfs[0].amount).toBe(350.35);
        expect(puttedDivPfs[1].amount).toBe(pmDivPfs[1].amount);
      });
      it('should update many divPfs for a tournament - 1 div - empty pmDivPfs', async () => {
        const pmDivPfs: divPfDataType[] = [];

        const validData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }
        const divPfJSON = JSON.stringify(validData);

        const response = await privateApi.put(tmntUrl + pmTmntId, divPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmDivPfs.length);
        expect(response.data.divPfs).toHaveLength(pmDivPfs.length);
      });
    });

    describe('should update many divPfs for a tournament - 2 divs', () => { 
      // values for prisma/seeds.ts      
      const pmTmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
      const pmDivId1 = "div_578834e04e5e4885bbae79229d8b96e8";
      const pmDivId2 = "div_fe72ab97edf8407186c8e6df7f7fb741";
      const pmDivPf1 = {
        ...initDivPf,
        id: "dpf_2516979e653f441b92646e7885cb3a50",
        div_id: pmDivId1,
        position: 1,
        amount: 250,
      }
      const pmDivPf2 = {
        ...initDivPf,
        id: "dpf_2526979e653f441b92646e7885cb3a50",
        div_id: pmDivId1,
        position: 2,
        amount: 150,
      }
      const pmDivPf3 = {
        ...initDivPf,
        id: "dpf_2536979e653f441b92646e7885cb3a50",
        div_id: pmDivId2,
        position: 1,
        amount: 275,
      }
      const pmDivPf4 = {
        ...initDivPf,
        id: "dpf_2546979e653f441b92646e7885cb3a50",
        div_id: pmDivId2,
        position: 2,
        amount: 175,
      }

      const validDivIds: string[] = [pmDivId1, pmDivId2];      

      const restoreDivPfs = async () => {
        await privateApi.delete(tmntUrl + pmTmntId);
        const restorePmDivPfs = cloneDeep([pmDivPf1, pmDivPf2, pmDivPf3, pmDivPf4]);
        const restoreDivIds = cloneDeep(validDivIds);
        const restoreData: divPfSaveDataType = {
          divPfData: restorePmDivPfs,
          divIds: restoreDivIds
        }
        const restoreJSON = JSON.stringify(restoreData);
        await privateApi.put(tmntUrl + pmTmntId, restoreJSON);
      }

      let putMany = false;

      beforeAll(async () => {
        await restoreDivPfs();
      })

      afterEach(async () => {
        if (putMany) {
          await restoreDivPfs();
        }
        putMany = false;
      })

      it('should update many divPfs for a tournament - 2 divs - change amount 1 div', async () => {

        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2, pmDivPf3, pmDivPf4]);
        pmDivPfs[0].amount = 350;
        pmDivPfs[1].amount = 250;

        const validData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }        
        const divPfJSON = JSON.stringify(validData);

        const response = await privateApi.put(tmntUrl + pmTmntId, divPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmDivPfs.length);
        expect(response.data.divPfs).toHaveLength(pmDivPfs.length);
        const puttedDivPfs = response.data.divPfs;
        
        for (let i = 0; i < pmDivPfs.length; i++) {
          expect(puttedDivPfs[i].id).toBe(pmDivPfs[i].id);
          expect(puttedDivPfs[i].div_id).toBe(pmDivPfs[i].div_id);
          expect(puttedDivPfs[i].amount).toBe(pmDivPfs[i].amount);
          expect(puttedDivPfs[i].position).toBe(pmDivPfs[i].position);          
        }
      });
      it('should update many divPfs for a tournament - 2 divs - add row', async () => {
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs.push({
          ...initDivPf,
          id: "dpf_2556979e653f441b92646e7885cb3a50",
          div_id: pmDivId1,
          position: 3,
          amount: 100,
        });
        pmDivPfs.push(pmDivPf3, pmDivPf4);
        
        const validData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }        
        const divPfJSON = JSON.stringify(validData);

        const response = await privateApi.put(tmntUrl + pmTmntId, divPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmDivPfs.length);
        expect(response.data.divPfs).toHaveLength(pmDivPfs.length);
        const puttedDivPfs = response.data.divPfs;
        for (let i = 0; i < pmDivPfs.length; i++) {
          expect(puttedDivPfs[i].id).toBe(pmDivPfs[i].id);
          expect(puttedDivPfs[i].div_id).toBe(pmDivPfs[i].div_id);
          expect(puttedDivPfs[i].amount).toBe(pmDivPfs[i].amount);
          expect(puttedDivPfs[i].position).toBe(pmDivPfs[i].position);          
        }
      });
      it('should update many divPfs for a tournament - 2 divs - change amount and delete a row', async () => {
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2, pmDivPf3]);
        pmDivPfs[2].amount = 400;
        
        const validData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }        
        const divPfJSON = JSON.stringify(validData);
        
        const response = await privateApi.put(tmntUrl + pmTmntId, divPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmDivPfs.length);
        expect(response.data.divPfs).toHaveLength(pmDivPfs.length);
        const puttedDivPfs = response.data.divPfs;
        for (let i = 0; i < pmDivPfs.length; i++) {
          expect(puttedDivPfs[i].id).toBe(pmDivPfs[i].id);
          expect(puttedDivPfs[i].div_id).toBe(pmDivPfs[i].div_id);
          expect(puttedDivPfs[i].amount).toBe(pmDivPfs[i].amount);
          expect(puttedDivPfs[i].position).toBe(pmDivPfs[i].position);          
        }
      });
    })

    describe('should update many divPfs for a tournament with errors', () => { 
      const pmTmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
      const pmDivId = "div_f30aea2c534f4cfe87f4315531cef8ef";
      const pmDivPf1 = {
        ...initDivPf,
        id: "dpf_ce55c52bd60d4943bb747590a03c9732",
        div_id: pmDivId,
        position: 1,
        amount: 300,
      }
      const pmDivPf2 = {
        ...initDivPf,
        id: "dpf_ce55c52bd60d4943bb747590a03c9733",
        div_id: pmDivId,
        position: 2,
        amount: 200,
      }

      const validDivIds: string[] = [pmDivId];

      it('should NOT update many divPfs for a tournament when divPfData is not an array', async () => {
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].amount = 350;
        pmDivPfs[1].amount = 250;

        const validData: divPfSaveDataType = {
          divPfData: pmDivPf2 as any,
          divIds: validDivIds
        }
        const invalidJSON = JSON.stringify(validData);

        try {
          const response = await privateApi.put(tmntUrl + notFoundTmntId, invalidJSON);
          expect(response.status).toBe(400);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(400);
          } else {
            expect(true).toBeFalsy();
          }
        }
      });
      it('should NOT update many divPfs for a tournament when divPfData is not formatted correctly', async () => {
        const invalidPmDivPf1 = {
          id: "dpf_ce55c52bd60d4943bb747590a03c9732",
          position: 1,
          amount: 300,
        }
        const validPmDivPf2 = {
          ...initDivPf,
          id: "dpf_ce55c52bd60d4943bb747590a03c9733",
          div_id: pmDivId,
          position: 2,
          amount: 200,
        }

        const invalidDivPfs = [invalidPmDivPf1, validPmDivPf2];
        const validData: divPfSaveDataType = {
          divPfData: invalidDivPfs as any,
          divIds: validDivIds
        }
        const invalidJSON = JSON.stringify(validData);

        try {
          const response = await privateApi.put(tmntUrl + notFoundTmntId, invalidJSON);
          expect(response.status).toBe(400);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(400);
          } else {
            expect(true).toBeFalsy();
          }
        }
      });
      it('should NOT update many divPfs for a tournament when divIds is not an array', async () => {
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].amount = 350;
        pmDivPfs[1].amount = 250;

        const validData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: pmDivPfs as any
        }

        const invalidJSON = JSON.stringify(validData);

        try {
          const response = await privateApi.put(tmntUrl + notFoundTmntId, invalidJSON);
          expect(response.status).toBe(400);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(400);
          } else {
            expect(true).toBeFalsy();
          }
        }
      });
      it('should NOT update many divPfs for a tournament when divIds is not an array of strings', async () => {
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].amount = 350;
        pmDivPfs[1].amount = 250;

        const notStringDivIds = [123];

        const validData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: notStringDivIds as any
        }

        const invalidJSON = JSON.stringify(validData);

        try {
          const response = await privateApi.put(tmntUrl + notFoundTmntId, invalidJSON);
          expect(response.status).toBe(400);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(400);
          } else {
            expect(true).toBeFalsy();
          }
        }
      });
            
      it('should NOT update many divPfs for a tournament when tmntId is not found', async () => { 
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].amount = 350;
        pmDivPfs[1].amount = 250;

        const validData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }        
        const invalidJSON = JSON.stringify(validData);

        try {
          const response = await privateApi.put(tmntUrl + notFoundTmntId, invalidJSON);
          expect(response.status).toBe(409);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(409);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many divPfs for a tournament when id is invalid', async () => { 
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].id = 'test';

        const invalidData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          expect(response.status).toBe(422);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(422);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many divPfs for a tournament when id is missing', async () => { 
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].id = null as any;

        const invalidData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          // not a string triggers a 400 return from isDivPfSaveDataType return false
          expect(response.status).toBe(400);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(400);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many divPfs for a tournament when id is valid, but not a divPf id', async () => { 
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].id = userId;

        const invalidData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          expect(response.status).toBe(422);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(422);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })

      it('should NOT update many divPfs for a tournament when div_id is invalid', async () => { 
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].div_id = 'test';

        const invalidData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          expect(response.status).toBe(422);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(422);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many divPfs for a tournament when div_id is missing', async () => { 
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].div_id = null as any;

        const invalidData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          // not a string triggers a 400 return from isDivPfSaveDataType return false
          expect(response.status).toBe(400);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(400);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many divPfs for a tournament when div_id is valid, but not a div id', async () => { 
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].div_id = userId;

        const invalidData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          expect(response.status).toBe(422);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(422);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many divPfs for a tournament when all div id are not in valid list', async () => {       
        const pmOtherDivId = "div_99a3cae28786485bb7a036935f0f6a0a"; // valid and found (from seeds.ts)
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].div_id = pmOtherDivId;

        const invalidData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          expect(response.status).toBe(422);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(422);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })

      it('should NOT update many divPfs for a tournament when position is too low', async () => { 
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].position = 0;

        const invalidData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          expect(response.status).toBe(422);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(422);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many divPfs for a tournament when position is too high', async () => { 
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].position = maxPosition + 1;

        const invalidData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          expect(response.status).toBe(422);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(422);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many divPfs for a tournament when position is not a number', async () => { 
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].position = "test" as any;

        const invalidData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          // not a number triggers a 400 return from isDivPfSaveDataType return false
          expect(response.status).toBe(400);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(400);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many divPfs for a tournament when position is not an integer', async () => { 
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].position = 1.5;

        const invalidData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          expect(response.status).toBe(422);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(422);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many divPfs for a tournament - 1 div - when 1st position is not 1', async () => { 
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].position = 4;
        pmDivPfs[1].position = 5;

        const invalidData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          expect(response.status).toBe(422);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(422);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many divPfs for a tournament - 1 div - when position is not in squence', async () => { 
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[1].position = 4;

        const invalidData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          expect(response.status).toBe(422);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(422);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many divPfs for a tournament when position is missing', async () => { 
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].position = null as any;

        const invalidData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          // not a number triggers a 400 return from isDivPfSaveDataType return false
          expect(response.status).toBe(400);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(400);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })

      it('should NOT update many divPfs for a tournament when amount is too low', async () => { 
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].amount = -1;

        const invalidData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          expect(response.status).toBe(422);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(422);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many divPfs for a tournament when amount is too high', async () => {
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].amount = maxMoney + 1;

        const invalidData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          expect(response.status).toBe(422);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(422);
          } else {
            expect(true).toBeFalsy();
          }
        }
      });
      it('should NOT update many divPfs for a tournament when amount is decreasing', async () => {
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[1].amount = pmDivPfs[0].amount + 1;

        const invalidData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          expect(response.status).toBe(422);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(422);
          } else {
            expect(true).toBeFalsy();
          }
        }
      });
      it('should NOT update many divPfs for a tournament when amount is not a number', async () => { 
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].amount = 'test' as any;

        const invalidData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          // not a number triggers a 400 return from isDivPfSaveDataType return false
          expect(response.status).toBe(400);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(400);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many divPfs for a tournament when amount is missing', async () => { 
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].amount = null as any;

        const invalidData: divPfSaveDataType = {
          divPfData: pmDivPfs,
          divIds: validDivIds
        }
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          // not a number triggers a 400 return from isDivPfSaveDataType return false
          expect(response.status).toBe(400);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(400);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
    })
  })

  describe('DELETE by tmnt_id, all divPfs for a tmnt - API: /api/divPfs/tmnt/:tmntId', () => { 

    // values for prisma/seeds.ts
    const delTmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
    const delDivId = "div_f30aea2c534f4cfe87f4315531cef8ef";
    const delDivPf1 = {
      ...initDivPf,
      id: "dpf_ce55c52bd60d4943bb747590a03c9732",
      div_id: delDivId,
      position: 1,
      amount: 300,
    }
    const delDivPf2 = {
      ...initDivPf,
      id: "dpf_ce55c52bd60d4943bb747590a03c9733",
      div_id: delDivId,
      position: 2,
      amount: 200,
    }
    const restoreDivPfs = async () => {
      await privateApi.delete(tmntUrl + delTmntId);
      const restorePmDivPfs = cloneDeep([delDivPf1, delDivPf2]);
      const restoreDivIds = [delDivId]; 
      const restoreData: divPfSaveDataType = {
        divPfData: restorePmDivPfs,
        divIds: restoreDivIds
      }
      const restoreJSON = JSON.stringify(restoreData);
      await privateApi.put(tmntUrl + delTmntId, restoreJSON);
    }
    
    let didDel = false

    beforeAll(async () => {
      await restoreDivPfs();
    })

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      // if deleted divPfs, add them back
      await restoreDivPfs();
    })

    it('should delete all divPfs for a tmnt by tmntId', async () => {
      const response = await privateApi.delete(tmntUrl + delTmntId);
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(2);
      didDel = true;
    })
    it('should NOT delete all divPfs for a tmnt by tmntId when tmntId is valid, but not found', async () => {
      const response = await privateApi.delete(tmntUrl + notFoundTmntId);
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(0);
    })    
    it('should NOT delete all divPfs for a tmnt by tmntId when tmntId is invalid', async () => {
      try {
        const response = await privateApi.delete(tmntUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all divPfs for a tmnt by tmntId when tmntId is valid, but not a tmnt ID', async () => {
      try {        
        const response = await privateApi.delete(tmntUrl + userId);
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