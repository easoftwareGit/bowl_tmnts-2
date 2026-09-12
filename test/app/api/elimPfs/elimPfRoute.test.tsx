import { privateApi } from "@/lib/api/axios";
import { AxiosError } from "axios";
import { baseElimPfsApi } from "@/lib/api/apiPaths";
import { testBaseElimPfsApi } from "../../../testApi";
import type { elimPfDataType, elimPfSaveDataType, elimPfType } from "@/lib/types/types";
import { initElimPf } from "@/lib/db/initVals";
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
const url = process.env.NODE_ENV === "test" && testBaseElimPfsApi
  ? testBaseElimPfsApi
  : baseElimPfsApi;

const oneElimPfUrl = url + "/elimPf/";
const tmntUrl = url + "/tmnt/";

const notFoundId = "epf_01234567890123456789012345678901";
const notFoundElimId = "elm_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

describe('ElimPfs - GETs and POST API: /api/elimPfs', () => {

  const testElimPf: elimPfType = {
    ...initElimPf,
    id: "epf_42c133340c174d05ba7098930e2f0f90",
    elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
    position: 1,
    amount: 30,
  }

  describe('GET - API: API: /api/elimPfs/elimPf/:id', () => {

    // beforeAll(async () => {
    //   await deletePostedElimPf(elimPfToPost.id);
    // });

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

    // beforeAll(async () => {
    //   await deletePostedElimPf(elimPfToPost.id);
    // });

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

  describe('GET all elimPfs for a tmnt - API: /api/elimPfs/tmnt/:tmntId', () => {    

    it('should get all elimPfs for a tournament - two divs in tournament', async () => {
      // const values taken from prisma/seed.ts
      const tmntId = 'tmt_fe8ac53dad0f400abe6354210a8f4cd1';
      const elimIds: string[] = [
        'elm_c01077494c2d4d9da166d697c08c28d2',
        'elm_c02077494c2d4d9da166d697c08c28d2',
        'elm_c03077494c2d4d9da166d697c08c28d2',
        'elm_c04077494c2d4d9da166d697c08c28d2'
      ] 

      const response = await privateApi.get(tmntUrl + tmntId, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      // 4 elimPf rows for tmnt in prisma/seed.ts
      expect(response.data.elimPfs).toHaveLength(8);
      const elimPfs: elimPfType[] = response.data.elimPfs;
      // query in /api/elimPf/tmnt/[tmntId] GET sorts by position

      expect(elimPfs[0].elim_id).toBe(elimIds[0]);
      expect(elimPfs[0].position).toBe(1);
      expect(elimPfs[0].amount).not.toBeNull();

      expect(elimPfs[1].elim_id).toBe(elimIds[0]);
      expect(elimPfs[1].position).toBe(2);
      expect(elimPfs[1].amount).not.toBeNull();

      expect(elimPfs[2].elim_id).toBe(elimIds[1]);
      expect(elimPfs[2].position).toBe(1);
      expect(elimPfs[2].amount).not.toBeNull();

      expect(elimPfs[3].elim_id).toBe(elimIds[1]);
      expect(elimPfs[3].position).toBe(2);
      expect(elimPfs[3].amount).not.toBeNull();

      expect(elimPfs[4].elim_id).toBe(elimIds[2]);
      expect(elimPfs[4].position).toBe(1);
      expect(elimPfs[4].amount).not.toBeNull();

      expect(elimPfs[5].elim_id).toBe(elimIds[2]);
      expect(elimPfs[5].position).toBe(2);
      expect(elimPfs[5].amount).not.toBeNull();

      expect(elimPfs[6].elim_id).toBe(elimIds[3]);
      expect(elimPfs[6].position).toBe(1);
      expect(elimPfs[6].amount).not.toBeNull();

      expect(elimPfs[7].elim_id).toBe(elimIds[3]);
      expect(elimPfs[7].position).toBe(2);
      expect(elimPfs[7].amount).not.toBeNull();
    });
    it('should return status 200 when tmntId is not found', async () => {
      const response = await privateApi.get(tmntUrl + notFoundTmntId, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      expect(response.data.elimPfs).toHaveLength(0);
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
 
  describe('PUT many elimPfs API: /api/elimPfs/tmnt/:tmntId', () => {

    describe('should update many elimPfs for a tournament - 1 elim', () => {
      // values for prisma/seeds.ts      
      const pmTmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
      const pmElimId = "elm_45d884582e7042bb95b4818ccdd9974c";
      const pmElimPf1 = {
        ...initElimPf,
        id: "epf_59eac0c17bf74348b44041e97469ad76",
        elim_id: pmElimId,
        position: 1,
        amount: 50,
      }
      const pmElimPf2 = {
        ...initElimPf,
        id: "epf_0fed31aae5374e6690b6535ced1ebff5",
        elim_id: pmElimId,
        position: 2,
        amount: 20,
      }

      const validElimIds: string[] = [pmElimId];

      const restoreElimPfs = async () => {
        await privateApi.delete(tmntUrl + pmTmntId);
        const restorePmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        const restoreElimIds = cloneDeep(validElimIds); 
        const restoreData: elimPfSaveDataType = {
          elimPfData: restorePmElimPfs,
          elimIds: restoreElimIds
        }
        const restoreJSON = JSON.stringify(restoreData);
        await privateApi.put(tmntUrl + pmTmntId, restoreJSON);
      }

      let putMany = false;

      beforeAll(async () => {
        await restoreElimPfs();
      })

      afterEach(async () => {
        if (putMany) {
          await restoreElimPfs();
        }
        putMany = false;
      })

      it('should update many elimPfs for a tournament - 1 div - change amount', async () => {
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].amount = 350;
        pmElimPfs[1].amount = 250;

        const validData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
        }
        const elimPfJSON = JSON.stringify(validData);

        const response = await privateApi.put(tmntUrl + pmTmntId, elimPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmElimPfs.length);
        expect(response.data.elimPfs).toHaveLength(pmElimPfs.length);
        const puttedElimPfs = response.data.elimPfs;
        expect(puttedElimPfs[0].amount).toBe(pmElimPfs[0].amount);
        expect(puttedElimPfs[1].amount).toBe(pmElimPfs[1].amount);
      });
      it('should update many elimPfs for a tournament - 1 div - add row', async () => {
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs.push({
          ...initElimPf,          
          id: "epf_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          elim_id: pmElimId,
          position: 3,
          amount: 10,
        });
        
        const validData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
        }
        const elimPfJSON = JSON.stringify(validData);

        const response = await privateApi.put(tmntUrl + pmTmntId, elimPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmElimPfs.length);
        expect(response.data.elimPfs).toHaveLength(pmElimPfs.length);
        const puttedElimPfs = response.data.elimPfs;
        expect(puttedElimPfs[0].amount).toBe(pmElimPfs[0].amount);
        expect(puttedElimPfs[1].amount).toBe(pmElimPfs[1].amount);
        expect(puttedElimPfs[2].amount).toBe(pmElimPfs[2].amount);
      })
      it('should update many elimPfs for a tournament - 1 div - change amount and delete a row', async () => {
        const pmElimPfs = cloneDeep([pmElimPf1]);
        pmElimPfs[0].amount = 400;
        
        const validData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
        }
        const elimPfJSON = JSON.stringify(validData);
        
        const response = await privateApi.put(tmntUrl + pmTmntId, elimPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmElimPfs.length);
        expect(response.data.elimPfs).toHaveLength(pmElimPfs.length);
        const puttedElimPfs = response.data.elimPfs;
        expect(puttedElimPfs[0].amount).toBe(pmElimPfs[0].amount);
      })
      it('should update many elimPfs for a tournament - 1 div - sanitize amount', async () => {
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].amount = 350.351;
        
        const validData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
        }
        const elimPfJSON = JSON.stringify(validData);
        
        const response = await privateApi.put(tmntUrl + pmTmntId, elimPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmElimPfs.length);
        expect(response.data.elimPfs).toHaveLength(pmElimPfs.length);
        const puttedElimPfs = response.data.elimPfs;
        expect(puttedElimPfs[0].amount).toBe(350.35);
        expect(puttedElimPfs[1].amount).toBe(pmElimPfs[1].amount);
      });
      it('should update many elimPfs for a tournament - 1 div - empty pmElimPfs', async () => {
        const pmElimPfs: elimPfDataType[] = [];

        const validData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
        }
        const elimPfJSON = JSON.stringify(validData);

        const response = await privateApi.put(tmntUrl + pmTmntId, elimPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmElimPfs.length);
        expect(response.data.elimPfs).toHaveLength(pmElimPfs.length);
      });
    });

    describe('should update many elimPfs for a tournament - 2 divs, 4 elims', () => { 
      // values for prisma/seeds.ts      
      const pmTmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
      const pmElimId1 = "elm_c01077494c2d4d9da166d697c08c28d2";
      const pmElimId2 = "elm_c02077494c2d4d9da166d697c08c28d2";
      const pmElimId3 = "elm_c03077494c2d4d9da166d697c08c28d2";
      const pmElimId4 = "elm_c04077494c2d4d9da166d697c08c28d2";
      const pmElimPf1 = {
        ...initElimPf,
        id: "epf_094a1a974e034940b847bef5b67a4b63",
        elim_id: pmElimId1,
        position: 1,
        amount: 60,
      }
      const pmElimPf2 = {
        ...initElimPf,
        id: "epf_710eda589d3f4106abe78006195e328a",
        elim_id: pmElimId1,
        position: 2,
        amount: 30,
      }
      const pmElimPf3 = {
        ...initElimPf,
        id: "epf_7e44498e84034bc1a080bfff569680bb",
        elim_id: pmElimId2,
        position: 1,
        amount: 60,
      }
      const pmElimPf4 = {
        ...initElimPf,
        id: "epf_9032c654c42240d78eeea91de320049f",
        elim_id: pmElimId2,
        position: 2,
        amount: 30,
      }
      const pmElimPf5 = {
        ...initElimPf,
        id: "epf_7e7d7dca4de74085b609030192aa15a5",
        elim_id: pmElimId3,
        position: 1,
        amount: 60,        
      }
      const pmElimPf6 = {
        ...initElimPf,
        id: "epf_b14d1847af30480aa4123594b0072cb1",
        elim_id: pmElimId3,
        position: 2,
        amount: 30,        
      }
      const pmElimPf7 = {
        ...initElimPf,
        id: "epf_560a2316645844bb9bdeb094911b9e9d",
        elim_id: pmElimId4,
        position: 1,
        amount: 40,        
      }
      const pmElimPf8 = {
        ...initElimPf,
        id: "epf_840e009bd5bd4e4aa389ddd02df50f23",
        elim_id: pmElimId4,
        position: 2,
        amount: 15,     
      }
      const validElimIds: string[] = [pmElimId1, pmElimId2, pmElimId3, pmElimId4];

      const restoreElimPfs = async () => {
        await privateApi.delete(tmntUrl + pmTmntId);
        const restorePmElimPfs = cloneDeep([pmElimPf1, pmElimPf2, pmElimPf3, pmElimPf4, pmElimPf5, pmElimPf6, pmElimPf7, pmElimPf8]);
        const restoreElimIds = cloneDeep(validElimIds);
        const restoreData: elimPfSaveDataType = {
          elimPfData: restorePmElimPfs,
          elimIds: restoreElimIds
        }
        const restoreJSON = JSON.stringify(restoreData);
        await privateApi.put(tmntUrl + pmTmntId, restoreJSON);    
      }

      let putMany = false;

      beforeAll(async () => {
        await restoreElimPfs();
      })

      afterEach(async () => {
        if (putMany) {
          await restoreElimPfs();
        }
        putMany = false;
      })

      it('should update many elimPfs for a tournament - 2 divs - change amount 1 div', async () => {

        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2, pmElimPf3, pmElimPf4, pmElimPf5, pmElimPf6, pmElimPf7, pmElimPf8]);
        pmElimPfs[0].amount = 350;
        pmElimPfs[1].amount = 250;

        const validData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
        }        
        const elimPfJSON = JSON.stringify(validData);

        const response = await privateApi.put(tmntUrl + pmTmntId, elimPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmElimPfs.length);
        expect(response.data.elimPfs).toHaveLength(pmElimPfs.length);
        const puttedElimPfs = response.data.elimPfs;
        
        for (let i = 0; i < pmElimPfs.length; i++) {
          expect(puttedElimPfs[i].id).toBe(pmElimPfs[i].id);
          expect(puttedElimPfs[i].elim_id).toBe(pmElimPfs[i].elim_id);
          expect(puttedElimPfs[i].amount).toBe(pmElimPfs[i].amount);
          expect(puttedElimPfs[i].position).toBe(pmElimPfs[i].position);          
        }
      });
      it('should update many elimPfs for a tournament - 2 divs - add row', async () => {
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2, pmElimPf3, pmElimPf4, pmElimPf5, pmElimPf6, pmElimPf7, pmElimPf8]);
        pmElimPfs.push({
          ...initElimPf,          
          id: "epf_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          elim_id: pmElimId1,
          position: 3,
          amount: 10,
        });
                
        const validData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
        }        
        const elimPfJSON = JSON.stringify(validData);

        const response = await privateApi.put(tmntUrl + pmTmntId, elimPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmElimPfs.length);
        expect(response.data.elimPfs).toHaveLength(pmElimPfs.length);
        const puttedElimPfs = response.data.elimPfs;

        // sort by elim_id and position like the PUT request
        const sortedElimPfs = pmElimPfs.toSorted((a, b) => {
          const elimCompare = a.elim_id.localeCompare(b.elim_id);
          if (elimCompare !== 0) {
            return elimCompare;
          }
          return a.position! - b.position!;
        });

        for (let i = 0; i < sortedElimPfs.length; i++) {
          expect(puttedElimPfs[i].id).toBe(sortedElimPfs[i].id);
          expect(puttedElimPfs[i].elim_id).toBe(sortedElimPfs[i].elim_id);
          expect(puttedElimPfs[i].amount).toBe(sortedElimPfs[i].amount);
          expect(puttedElimPfs[i].position).toBe(sortedElimPfs[i].position);          
        }
      });
      it('should update many elimPfs for a tournament - 2 divs - change amount and delete a row', async () => {
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2, pmElimPf3, pmElimPf4, pmElimPf5, pmElimPf6, pmElimPf7, pmElimPf8]);
        pmElimPfs[2].amount = 400;
        
        const validData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
        }        
        const elimPfJSON = JSON.stringify(validData);
        
        const response = await privateApi.put(tmntUrl + pmTmntId, elimPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmElimPfs.length);
        expect(response.data.elimPfs).toHaveLength(pmElimPfs.length);
        const puttedElimPfs = response.data.elimPfs;
        for (let i = 0; i < pmElimPfs.length; i++) {
          expect(puttedElimPfs[i].id).toBe(pmElimPfs[i].id);
          expect(puttedElimPfs[i].elim_id).toBe(pmElimPfs[i].elim_id);
          expect(puttedElimPfs[i].amount).toBe(pmElimPfs[i].amount);
          expect(puttedElimPfs[i].position).toBe(pmElimPfs[i].position);          
        }
      });
    })

    describe('should update many elimPfs for a tournament with errors', () => { 
      const pmTmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
      const pmElimId = "elm_45d884582e7042bb95b4818ccdd9974c";
      const pmElimPf1 = {
        ...initElimPf,
        id: "epf_59eac0c17bf74348b44041e97469ad76",
        elim_id: pmElimId,
        position: 1,
        amount: 50,
      }
      const pmElimPf2 = {
        ...initElimPf,
        id: "epf_0fed31aae5374e6690b6535ced1ebff5",
        elim_id: pmElimId,
        position: 2,
        amount: 20,
      }

      const validElimIds: string[] = [pmElimId];

      it('should NOT update many elimPfs for a tournament when elimPfData is not an array', async () => {
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].amount = 350;
        pmElimPfs[1].amount = 250;

        const validData: elimPfSaveDataType = {
          elimPfData: pmElimPf2 as any,
          elimIds: validElimIds
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
      it('should NOT update many elimPfs for a tournament when elimPfData is not formatted correctly', async () => {
        const invalidPmElimPf1 = {
          id: "dpf_ce55c52bd60d4943bb747590a03c9732",
          position: 1,
          amount: 300,
        }
        const validPmElimPf2 = {
          ...initElimPf,
          id: "dpf_ce55c52bd60d4943bb747590a03c9733",
          elim_id: pmElimId,
          position: 2,
          amount: 200,
        }

        const invalidElimPfs = [invalidPmElimPf1, validPmElimPf2];
        const validData: elimPfSaveDataType = {
          elimPfData: invalidElimPfs as any,
          elimIds: validElimIds
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
      it('should NOT update many elimPfs for a tournament when divIds is not an array', async () => {
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].amount = 350;
        pmElimPfs[1].amount = 250;

        const validData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: pmElimPfs as any
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
      it('should NOT update many elimPfs for a tournament when divIds is not an array of strings', async () => {
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].amount = 350;
        pmElimPfs[1].amount = 250;

        const notStringDivIds = [123];

        const validData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: notStringDivIds as any
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
            
      it('should NOT update many elimPfs for a tournament when tmntId is not found', async () => { 
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].amount = 350;
        pmElimPfs[1].amount = 250;

        const validData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
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
      it('should NOT update many elimPfs for a tournament when id is invalid', async () => { 
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].id = 'test';

        const invalidData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
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
      it('should NOT update many elimPfs for a tournament when id is missing', async () => { 
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].id = null as any;

        const invalidData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          // not a string triggers a 400 return from isElimPfSaveDataType return false
          expect(response.status).toBe(400);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(400);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many elimPfs for a tournament when id is valid, but not a elimPf id', async () => { 
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].id = userId;

        const invalidData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
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

      it('should NOT update many elimPfs for a tournament when elim_id is invalid', async () => { 
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].elim_id = 'test';

        const invalidData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
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
      it('should NOT update many elimPfs for a tournament when elim_id is missing', async () => { 
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].elim_id = null as any;

        const invalidData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          // not a string triggers a 400 return from isElimPfSaveDataType return false
          expect(response.status).toBe(400);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(400);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many elimPfs for a tournament when elim_id is valid, but not a div id', async () => { 
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].elim_id = userId;

        const invalidData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
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
      it('should NOT update many elimPfs for a tournament when all div id are not in valid list', async () => {       
        const pmOtherDivId = "div_99a3cae28786485bb7a036935f0f6a0a"; // valid and found (from seeds.ts)
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].elim_id = pmOtherDivId;

        const invalidData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
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

      it('should NOT update many elimPfs for a tournament when position is too low', async () => { 
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].position = 0;

        const invalidData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
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
      it('should NOT update many elimPfs for a tournament when position is too high', async () => { 
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].position = maxPosition + 1;

        const invalidData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
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
      it('should NOT update many elimPfs for a tournament when position is not a number', async () => { 
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].position = "test" as any;

        const invalidData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          // not a number triggers a 400 return from isElimPfSaveDataType return false
          expect(response.status).toBe(400);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(400);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many elimPfs for a tournament when position is not an integer', async () => { 
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].position = 1.5;

        const invalidData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
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
      it('should NOT update many elimPfs for a tournament - 1 div - when 1st position is not 1', async () => { 
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].position = 4;
        pmElimPfs[1].position = 5;

        const invalidData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
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
      it('should NOT update many elimPfs for a tournament - 1 div - when position is not in squence', async () => { 
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[1].position = 4;

        const invalidData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
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
      it('should NOT update many elimPfs for a tournament when position is missing', async () => { 
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].position = null as any;

        const invalidData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          // not a number triggers a 400 return from isElimPfSaveDataType return false
          expect(response.status).toBe(400);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(400);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })

      it('should NOT update many elimPfs for a tournament when amount is too low', async () => { 
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].amount = -1;

        const invalidData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
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
      it('should NOT update many elimPfs for a tournament when amount is too high', async () => {
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].amount = maxMoney + 1;

        const invalidData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
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
      it('should NOT update many elimPfs for a tournament when amount is decreasing', async () => {
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[1].amount = pmElimPfs[0].amount + 1;

        const invalidData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
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
      it('should NOT update many elimPfs for a tournament when amount is not a number', async () => { 
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].amount = 'test' as any;

        const invalidData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
        }
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          // not a number triggers a 400 return from isElimPfSaveDataType return false
          expect(response.status).toBe(400);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(400);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many elimPfs for a tournament when amount is missing', async () => { 
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].amount = null as any;

        const invalidData: elimPfSaveDataType = {
          elimPfData: pmElimPfs,
          elimIds: validElimIds
        }
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          // not a number triggers a 400 return from isElimPfSaveDataType return false
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

  describe('DELETE by tmnt_id, all elimPfs for a tmnt - API: /api/elimPfs/tmnt/:tmntId', () => { 

    // values for prisma/seeds.ts
    const delTmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
    const delElimId = "elm_45d884582e7042bb95b4818ccdd9974c";
    const delElimPf1 = {
      ...initElimPf,
      id: "epf_59eac0c17bf74348b44041e97469ad76",
      elim_id: delElimId,
      position: 1,
      amount: 50,
    }
    const delElimPf2 = {
      ...initElimPf,
      id: "epf_0fed31aae5374e6690b6535ced1ebff5",
      elim_id: delElimId,
      position: 2,
      amount: 20,
    }
    const restoreElimPfs = async () => {
      await privateApi.delete(tmntUrl + delTmntId);
      const restorePmElimPfs = cloneDeep([delElimPf1, delElimPf2]);
      const restoreElimIds = [delElimId]; 
      const restoreData: elimPfSaveDataType = {
        elimPfData: restorePmElimPfs,
        elimIds: restoreElimIds
      }
      const restoreJSON = JSON.stringify(restoreData);
      await privateApi.put(tmntUrl + delTmntId, restoreJSON);
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

    it('should delete all elimPfs for an tmnt by tmntId', async () => {
      const response = await privateApi.delete(tmntUrl + delTmntId);
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(2);
      didDel = true;
    })
    it('should NOT delete all elimPfs for an tmnt by tmntId when tmntId is valid, but not found', async () => {
      const response = await privateApi.delete(tmntUrl + notFoundTmntId);
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(0);
    })    
    it('should NOT delete all elimPfs for an tmnt by tmntId when tmntId is invalid', async () => {
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
    it('should NOT delete all elimPfs for an tmnt by tmntId when tmntId is valid, but not a tmnt ID', async () => {
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