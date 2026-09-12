import { privateApi } from "@/lib/api/axios";
import { AxiosError } from "axios";
import { basePotPfsApi } from "@/lib/api/apiPaths";
import { testBasePotPfsApi } from "../../../testApi";
import type { potPfDataType, potPfSaveDataType, potPfType } from "@/lib/types/types";
import { initPotPf } from "@/lib/db/initVals";
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
const url = process.env.NODE_ENV === "test" && testBasePotPfsApi
  ? testBasePotPfsApi
  : basePotPfsApi;

const onePotPfUrl = url + "/potPf/";
const tmntUrl = url + "/tmnt/"; 

const notFoundId = "ppf_01234567890123456789012345678901";
const notFoundPotId = "pot_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

describe('PotPfs - GETs and POST API: /api/potPfs', () => {

  const testPotPf: potPfType = {
    ...initPotPf,
    id: "ppf_59eac0c17bf74348b44041e97469ad76",
    pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
    position: 1,
    amount: 50,
  }

  describe('GET - API: API: /api/potPfs/potPf/:id', () => {

    // beforeAll(async () => {
    //   await deletePostedPotPf(potPfToPost.id);
    // });

    it('should get all potPfs', async () => {
      const response = await privateApi.get(url);
      expect(response.status).toBe(200);
      // 15 rows in prisma/seed.ts
      expect(response.data.potPfs).toHaveLength(15);
      const potPfs: potPfType[] = response.data.potPfs;
      potPfs.forEach((potPf: potPfType) => {
        expect(potPf.pot_id).not.toBeNull();
        expect(potPf.position).not.toBeNull();
        expect(potPf.amount).not.toBeNull();
      })
    });
  })

  describe('GET by ID - API: API: /api/potPfs/potPf/:id', () => {

    // beforeAll(async () => {
    //   await deletePostedPotPf(potPfToPost.id);
    // });

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

  describe('GET all potPfs for a tmnt - API: /api/potPfs/tmnt/:tmntId', () => {    

    it('should get all potPfs for a tournament - one pot in tournament', async () => {
      // const values taken from prisma/seed.ts
      const tmntId = 'tmt_fd99387c33d9c78aba290286576ddce5';
      const potId = 'pot_b2a7b02d761b4f5ab5438be84f642c3b';

      const response = await privateApi.get(tmntUrl + tmntId, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      // 2 potPf rows for tmnt in prisma/seed.ts
      expect(response.data.potPfs).toHaveLength(2);
      const potPfs: potPfType[] = response.data.potPfs;
      // query in /api/potPfs/tmnt/[tmntId] GET sorts by position
      for (let i = 0; i < potPfs.length; i++) {
        expect(potPfs[i].pot_id).toBe(potId);
        expect(potPfs[i].position).toBe(i + 1);
        expect(potPfs[i].amount).not.toBeNull();
      }
    });
    it('should get all potPfs for a tournament - two divs, 4 pots in tournament', async () => {
      // const values taken from prisma/seed.ts
      const tmntId = 'tmt_fe8ac53dad0f400abe6354210a8f4cd1';
      const potIds: string[] = [
        'pot_761fb6d8a9a04cb4b3372e212da2a3b0',
        'pot_771fb6d8a9a04cb4b3372e212da2a3b0',
        'pot_781fb6d8a9a04cb4b3372e212da2a3b0',
        'pot_791fb6d8a9a04cb4b3372e212da2a3b0',
      ] 

      const response = await privateApi.get(tmntUrl + tmntId, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      // 8 potPf rows for tmnt in prisma/seed.ts
      expect(response.data.potPfs).toHaveLength(8);
      const potPfs: potPfType[] = response.data.potPfs;
      // query in /api/potPfs/tmnt/[tmntId] GET sorts by position

      expect(potPfs[0].pot_id).toBe(potIds[0]);
      expect(potPfs[0].position).toBe(1);
      expect(potPfs[0].amount).not.toBeNull();

      expect(potPfs[1].pot_id).toBe(potIds[0]);
      expect(potPfs[1].position).toBe(2);
      expect(potPfs[1].amount).not.toBeNull();

      expect(potPfs[2].pot_id).toBe(potIds[1]);
      expect(potPfs[2].position).toBe(1);
      expect(potPfs[2].amount).not.toBeNull();

      expect(potPfs[3].pot_id).toBe(potIds[1]);
      expect(potPfs[3].position).toBe(2);
      expect(potPfs[3].amount).not.toBeNull();

      expect(potPfs[4].pot_id).toBe(potIds[2]);
      expect(potPfs[4].position).toBe(1);
      expect(potPfs[4].amount).not.toBeNull();

      expect(potPfs[5].pot_id).toBe(potIds[2]);
      expect(potPfs[5].position).toBe(2);
      expect(potPfs[5].amount).not.toBeNull();

      expect(potPfs[6].pot_id).toBe(potIds[3]);
      expect(potPfs[6].position).toBe(1);
      expect(potPfs[6].amount).not.toBeNull();

      expect(potPfs[7].pot_id).toBe(potIds[3]);
      expect(potPfs[7].position).toBe(2);
      expect(potPfs[7].amount).not.toBeNull();

    });
    it('should return status 200 when tmntId is not found', async () => {
      const response = await privateApi.get(tmntUrl + notFoundTmntId, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      expect(response.data.potPfs).toHaveLength(0);
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

  describe('PUT many potPfs API: /api/potPfs/tmnt/:tmntId', () => { 

    describe('should update many potPfs for a tournament - 1 pot', () => {
      // values for prisma/seeds.ts      
      const pmTmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
      const pmPotId = "pot_b2a7b02d761b4f5ab5438be84f642c3b";
      const pmPotPf1 = {
        ...initPotPf,
        id: "ppf_59eac0c17bf74348b44041e97469ad76",
        pot_id: pmPotId,
        position: 1,
        amount: 50,
      }
      const pmPotPf2 = {
        ...initPotPf,
        id: "ppf_0fed31aae5374e6690b6535ced1ebff5",
        pot_id: pmPotId,
        position: 2,
        amount: 10,
      }

      const validPotIds: string[] = [pmPotId];

      const restorePotPfs = async () => {
        await privateApi.delete(tmntUrl + pmTmntId);
        const restorePmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        const restorePotIds = cloneDeep(validPotIds); 
        const restoreData: potPfSaveDataType = {
          potPfData: restorePmPotPfs,
          potIds: restorePotIds
        }
        const restoreJSON = JSON.stringify(restoreData);
        await privateApi.put(tmntUrl + pmTmntId, restoreJSON);
      }

      let putMany = false;

      beforeAll(async () => {
        await restorePotPfs();
      })

      afterEach(async () => {
        if (putMany) {
          await restorePotPfs();
        }
        putMany = false;
      })

      it('should update many potPfs for a tournament - 1 pot - change amount', async () => {
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].amount = 35;
        pmPotPfs[1].amount = 25;

        const validData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
        }
        const potPfJSON = JSON.stringify(validData);

        const response = await privateApi.put(tmntUrl + pmTmntId, potPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmPotPfs.length);
        expect(response.data.potPfs).toHaveLength(pmPotPfs.length);
        const puttedPotPfs = response.data.potPfs;
        expect(puttedPotPfs[0].amount).toBe(pmPotPfs[0].amount);
        expect(puttedPotPfs[1].amount).toBe(pmPotPfs[1].amount);
      });
      it('should update many potPfs for a tournament - 1 pot - add row', async () => {
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs.push({
          ...initPotPf,          
          id: "ppf_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          pot_id: pmPotId,
          position: 3,
          amount: 5,
        });
        
        const validData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
        }
        const potPfJSON = JSON.stringify(validData);

        const response = await privateApi.put(tmntUrl + pmTmntId, potPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmPotPfs.length);
        expect(response.data.potPfs).toHaveLength(pmPotPfs.length);
        const puttedPotPfs = response.data.potPfs;
        expect(puttedPotPfs[0].amount).toBe(pmPotPfs[0].amount);
        expect(puttedPotPfs[1].amount).toBe(pmPotPfs[1].amount);
        expect(puttedPotPfs[2].amount).toBe(pmPotPfs[2].amount);
      })
      it('should update many potPfs for a tournament - 1 pot - change amount and delete a row', async () => {
        const pmPotPfs = cloneDeep([pmPotPf1]);
        pmPotPfs[0].amount = 400;
        
        const validData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
        }
        const potPfJSON = JSON.stringify(validData);
        
        const response = await privateApi.put(tmntUrl + pmTmntId, potPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmPotPfs.length);
        expect(response.data.potPfs).toHaveLength(pmPotPfs.length);
        const puttedPotPfs = response.data.potPfs;
        expect(puttedPotPfs[0].amount).toBe(pmPotPfs[0].amount);
      })
      it('should update many potPfs for a tournament - 1 pot - sanitize amount', async () => {
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].amount = 350.351;
        
        const validData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
        }
        const potPfJSON = JSON.stringify(validData);
        
        const response = await privateApi.put(tmntUrl + pmTmntId, potPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmPotPfs.length);
        expect(response.data.potPfs).toHaveLength(pmPotPfs.length);
        const puttedPotPfs = response.data.potPfs;
        expect(puttedPotPfs[0].amount).toBe(350.35);
        expect(puttedPotPfs[1].amount).toBe(pmPotPfs[1].amount);
      });
      it('should update many potPfs for a tournament - 1 pot - empty pmPotPfs', async () => {
        const pmPotPfs: potPfDataType[] = [];

        const validData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
        }
        const potPfJSON = JSON.stringify(validData);

        const response = await privateApi.put(tmntUrl + pmTmntId, potPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmPotPfs.length);
        expect(response.data.potPfs).toHaveLength(pmPotPfs.length);
      });
    });
    
    describe('should update many potPfs for a tournament - 2 divs, 4 pots', () => { 
      // values for prisma/seeds.ts      
      const pmTmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
      const pmPotId1 = "pot_761fb6d8a9a04cb4b3372e212da2a3b0";
      const pmPotId2 = "pot_771fb6d8a9a04cb4b3372e212da2a3b0";
      const pmPotId3 = "pot_781fb6d8a9a04cb4b3372e212da2a3b0";
      const pmPotId4 = "pot_791fb6d8a9a04cb4b3372e212da2a3b0";
      const pnPotPf1 = {
        ...initPotPf,
        id: "ppf_560a2316645844bb9bdeb094911b9e9d",
        pot_id: pmPotId1,
        position: 1,
        amount: 75,
      }
      const pnPotPf2 = {
        ...initPotPf,
        id: "ppf_840e009bd5bd4e4aa389ddd02df50f23",
        pot_id: pmPotId1,
        position: 2,
        amount: 15,
      }
      const pnPotPf3 = {
        ...initPotPf,
        id: "ppf_7e7d7dca4de74085b609030192aa15a5",
        pot_id: pmPotId2,
        position: 1,
        amount: 40,
      }
      const pnPotPf4 = {
        ...initPotPf,
        id: "ppf_b14d1847af30480aa4123594b0072cb1",
        pot_id: pmPotId2,
        position: 2,
        amount: 10,
      }
      const pnPotPf5 = {
        ...initPotPf,
        id: "ppf_7e44498e84034bc1a080bfff569680bb",
        pot_id: pmPotId3,
        position: 1,
        amount: 80,
      }
      const pnPotPf6 = {
        ...initPotPf,
        id: "ppf_9032c654c42240d78eeea91de320049f",
        pot_id: pmPotId3,
        position: 2,
        amount: 20,        
      }
      const pnPotPf7 = {
        ...initPotPf,
        id: "ppf_094a1a974e034940b847bef5b67a4b63",
        pot_id: pmPotId4,
        position: 1,
        amount: 40,        
      }
      const pnPotPf8 = {
        ...initPotPf,
        id: "ppf_710eda589d3f4106abe78006195e328a",
        pot_id: pmPotId4,
        position: 2,
        amount: 10,        
      }

      const valildPotIds: string[] = [pmPotId1, pmPotId2, pmPotId3, pmPotId4];      

      const restorePotPfs = async () => {
        await privateApi.delete(tmntUrl + pmTmntId);
        const restorePmPotPfs = cloneDeep([pnPotPf1, pnPotPf2, pnPotPf3, pnPotPf4, pnPotPf5, pnPotPf6, pnPotPf7, pnPotPf8]);
        const restorePotIds = cloneDeep(valildPotIds);
        const restoreData: potPfSaveDataType = {
          potPfData: restorePmPotPfs,
          potIds: restorePotIds
        }
        const restoreJSON = JSON.stringify(restoreData);
        await privateApi.put(tmntUrl + pmTmntId, restoreJSON);   
      }

      let putMany = false;

      beforeAll(async () => {
        await restorePotPfs();
      })

      afterEach(async () => {
        if (putMany) {
          await restorePotPfs();
        }
        putMany = false;
      })

      it('should update many potPfs for a tournament - 2 divs, 4 pots - change amount 1 pot', async () => {

        const pmPotsPfs = cloneDeep([pnPotPf1, pnPotPf2, pnPotPf3, pnPotPf4, pnPotPf5, pnPotPf6, pnPotPf7, pnPotPf8]);
        pmPotsPfs[0].amount = 350;
        pmPotsPfs[1].amount = 250;

        const validData: potPfSaveDataType = {
          potPfData: pmPotsPfs,
          potIds: valildPotIds
        }        
        const potPfJSON = JSON.stringify(validData);

        const response = await privateApi.put(tmntUrl + pmTmntId, potPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pmPotsPfs.length);
        expect(response.data.potPfs).toHaveLength(pmPotsPfs.length);
        const puttedPotPfs = response.data.potPfs;
        
        for (let i = 0; i < pmPotsPfs.length; i++) {
          expect(puttedPotPfs[i].id).toBe(pmPotsPfs[i].id);
          expect(puttedPotPfs[i].pot_id).toBe(pmPotsPfs[i].pot_id);
          expect(puttedPotPfs[i].amount).toBe(pmPotsPfs[i].amount);
          expect(puttedPotPfs[i].position).toBe(pmPotsPfs[i].position);          
        }
      });
      it('should update many potPfs for a tournament - 2 divs, 4 pots - add row', async () => {
        const pnPotPfs = cloneDeep([pnPotPf1, pnPotPf2]);
        pnPotPfs.push({
          ...initPotPf,          
          id: "ppf_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          pot_id: pmPotId1,
          position: 3,
          amount: 10,
        });
        pnPotPfs.push(pnPotPf3, pnPotPf4);
        
        const validData: potPfSaveDataType = {
          potPfData: pnPotPfs,
          potIds: valildPotIds
        }        
        const potPfJSON = JSON.stringify(validData);

        const response = await privateApi.put(tmntUrl + pmTmntId, potPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pnPotPfs.length);
        expect(response.data.potPfs).toHaveLength(pnPotPfs.length);
        const puttedPotPfs = response.data.potPfs;
        for (let i = 0; i < pnPotPfs.length; i++) {
          expect(puttedPotPfs[i].id).toBe(pnPotPfs[i].id);
          expect(puttedPotPfs[i].pot_id).toBe(pnPotPfs[i].pot_id);
          expect(puttedPotPfs[i].amount).toBe(pnPotPfs[i].amount);
          expect(puttedPotPfs[i].position).toBe(pnPotPfs[i].position);          
        }
      });
      it('should update many potPfs for a tournament - 2 divs, 4 pots - change amount and delete a row', async () => {
        const pnPotPfs = cloneDeep([pnPotPf1, pnPotPf2, pnPotPf3]);
        pnPotPfs[2].amount = 400;
        
        const validData: potPfSaveDataType = {
          potPfData: pnPotPfs,
          potIds: valildPotIds
        }        
        const potPfJSON = JSON.stringify(validData);
        
        const response = await privateApi.put(tmntUrl + pmTmntId, potPfJSON);
        expect(response.status).toBe(200);
        putMany = true;
        expect(response.data.count).toBe(pnPotPfs.length);
        expect(response.data.potPfs).toHaveLength(pnPotPfs.length);
        const puttedPotPfs = response.data.potPfs;
        for (let i = 0; i < pnPotPfs.length; i++) {
          expect(puttedPotPfs[i].id).toBe(pnPotPfs[i].id);
          expect(puttedPotPfs[i].pot_id).toBe(pnPotPfs[i].pot_id);
          expect(puttedPotPfs[i].amount).toBe(pnPotPfs[i].amount);
          expect(puttedPotPfs[i].position).toBe(pnPotPfs[i].position);          
        }
      });
    })

    describe('should update many potPfs for a tournament with errors', () => { 
      // values for prisma/seeds.ts      
      const pmTmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
      const pmPotId = "pot_b2a7b02d761b4f5ab5438be84f642c3b";
      const pmPotPf1 = {
        ...initPotPf,
        id: "ppf_59eac0c17bf74348b44041e97469ad76",
        pot_id: pmPotId,
        position: 1,
        amount: 300,
      }
      const pmPotPf2 = {
        ...initPotPf,
        id: "ppf_0fed31aae5374e6690b6535ced1ebff5",
        pot_id: pmPotId,
        position: 2,
        amount: 200,
      }

      const validPotIds: string[] = [pmPotId];

      it('should NOT update many potPfs for a tournament when potPfData is not an array', async () => {
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].amount = 350;
        pmPotPfs[1].amount = 250;

        const validData: potPfSaveDataType = {
          potPfData: pmPotPf2 as any,
          potIds: validPotIds
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
      it('should NOT update many potPfs for a tournament when potPfData is not formatted correctly', async () => {
        const invalidPmPotPf1 = {
          id: "ppf_ce55c52bd60d4943bb747590a03c9732",
          position: 1,
          amount: 300,
        }
        const validPmPotPf2 = {
          ...initPotPf,
          id: "ppf_ce55c52bd60d4943bb747590a03c9733",
          pot_id: pmPotId,
          position: 2,
          amount: 200,
        }

        const invalidPotPfs = [invalidPmPotPf1, validPmPotPf2];
        const validData: potPfSaveDataType = {
          potPfData: invalidPotPfs as any,
          potIds: validPotIds
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
      it('should NOT update many potPfs for a tournament when potIds is not an array', async () => {
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].amount = 350;
        pmPotPfs[1].amount = 250;

        const validData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: pmPotPfs as any
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
      it('should NOT update many potPfs for a tournament when potIds is not an array of strings', async () => {
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].amount = 350;
        pmPotPfs[1].amount = 250;

        const notStringPotIds = [123];

        const validData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: notStringPotIds as any
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
            
      it('should NOT update many potPfs for a tournament when tmntId is not found', async () => { 
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].amount = 350;
        pmPotPfs[1].amount = 250;

        const validData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
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
      it('should NOT update many potPfs for a tournament when id is invalid', async () => { 
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].id = 'test';

        const invalidData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
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
      it('should NOT update many potPfs for a tournament when id is missing', async () => { 
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].id = null as any;

        const invalidData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          // not a string triggers a 400 return from isPotPfsaveDataType return false
          expect(response.status).toBe(400);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(400);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many potPfs for a tournament when id is valid, but not a potPf id', async () => { 
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].id = userId;

        const invalidData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
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

      it('should NOT update many potPfs for a tournament when pot_id is invalid', async () => { 
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].pot_id = 'test';

        const invalidData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
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
      it('should NOT update many potPfs for a tournament when pot_id is missing', async () => { 
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].pot_id = null as any;

        const invalidData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          // not a string triggers a 400 return from isPotPfsaveDataType return false
          expect(response.status).toBe(400);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(400);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many potPfs for a tournament when pot_id is valid, but not a pot id', async () => { 
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].pot_id = userId;

        const invalidData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
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
      it('should NOT update many potPfs for a tournament when all pot id are not in valid list', async () => {       
        const pmOtherPotId = "pot_99a3cae28786485bb7a036935f0f6a0a"; // valid and found (from seeds.ts)
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].pot_id = pmOtherPotId;

        const invalidData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
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

      it('should NOT update many potPfs for a tournament when position is too low', async () => { 
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].position = 0;

        const invalidData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
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
      it('should NOT update many potPfs for a tournament when position is too high', async () => { 
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].position = maxPosition + 1;

        const invalidData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
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
      it('should NOT update many potPfs for a tournament when position is not a number', async () => { 
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].position = "test" as any;

        const invalidData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          // not a number triggers a 400 return from isPotPfsaveDataType return false
          expect(response.status).toBe(400);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(400);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many potPfs for a tournament when position is not an integer', async () => { 
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].position = 1.5;

        const invalidData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
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
      it('should NOT update many potPfs for a tournament - 1 pot - when 1st position is not 1', async () => { 
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].position = 4;
        pmPotPfs[1].position = 5;

        const invalidData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
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
      it('should NOT update many potPfs for a tournament - 1 pot - when position is not in squence', async () => { 
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[1].position = 4;

        const invalidData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
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
      it('should NOT update many potPfs for a tournament when position is missing', async () => { 
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].position = null as any;

        const invalidData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
        }        
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          // not a number triggers a 400 return from isPotPfsaveDataType return false
          expect(response.status).toBe(400);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(400);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })

      it('should NOT update many potPfs for a tournament when amount is too low', async () => { 
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].amount = -1;

        const invalidData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
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
      it('should NOT update many potPfs for a tournament when amount is too high', async () => {
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].amount = maxMoney + 1;

        const invalidData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
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
      it('should NOT update many potPfs for a tournament when amount is decreasing', async () => {
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[1].amount = pmPotPfs[0].amount + 1;

        const invalidData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
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
      it('should NOT update many potPfs for a tournament when amount is not a number', async () => { 
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].amount = 'test' as any;

        const invalidData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
        }
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          // not a number triggers a 400 return from isPotPfsaveDataType return false
          expect(response.status).toBe(400);
        } catch (err) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(400);
          } else {
            expect(true).toBeFalsy();
          }
        }
      })
      it('should NOT update many potPfs for a tournament when amount is missing', async () => { 
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].amount = null as any;

        const invalidData: potPfSaveDataType = {
          potPfData: pmPotPfs,
          potIds: validPotIds
        }
        const invalidJSON = JSON.stringify(invalidData);
        try {
          const response = await privateApi.put(tmntUrl + pmTmntId, invalidJSON);
          // not a number triggers a 400 return from isPotPfsaveDataType return false
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

  describe('DELETE by tmnt_id, all potPfs for a tmnt - API: /api/potPfs/tmnt/:tmntId', () => { 

    // values for prisma/seeds.ts
    const delTmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
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
      await privateApi.delete(tmntUrl + delTmntId);
      const restorePmPotPfs = cloneDeep([delPotPf1, delPotPf2]);
      const restorePotIds = [delPotId]; 
      const restoreData: potPfSaveDataType = {
        potPfData: restorePmPotPfs,
        potIds: restorePotIds
      }
      const restoreJSON = JSON.stringify(restoreData);
      await privateApi.put(tmntUrl + delTmntId, restoreJSON);
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

    it('should delete all potPfs for a tmnt by tmntId', async () => {
      const response = await privateApi.delete(tmntUrl + delTmntId);
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(2);
      didDel = true;
    })
    it('should NOT delete all potPfs for a tmnt by tmntId when tmntId is valid, but not found', async () => {
      const response = await privateApi.delete(tmntUrl + notFoundTmntId);
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(0);
    })    
    it('should NOT delete all potPfs for a tmnt by tmntId when tmntId is invalid', async () => {
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
    it('should NOT delete all potPfs for a tmnt by tmntId when tmntId is valid, but not a tmnt ID', async () => {
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