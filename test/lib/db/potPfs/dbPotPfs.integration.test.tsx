import { privateApi } from "@/lib/api/axios";
import { basePotPfsApi } from "@/lib/api/apiPaths";
import { testBasePotPfsApi } from "../../../testApi";
import type { potPfSaveDataType, potPfType, tmntPotPfSaveDataType } from "@/lib/types/types";
import { initPotPf } from "@/lib/db/initVals";
import {  
  extractPotPfs,
  getAllPotPfsForTmnt,
  updateAllPotPfsForTmnt,
} from "@/lib/db/potPfs/dbPotPfs";
import { cloneDeep } from "lodash";
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

const tmntUrl = url + "/tmnt/"; 

const notFoundId = "ppf_01234567890123456789012345678901";
const notFoundPotId = "pot_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

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

describe("dbPotPfs", () => {

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

  describe('extractPotPfs', () => {
    it('should extract potPfs from a pot', () => {
      const rawPotPfs = [
        {
          id: "ppf_01234567890123456789012345678901",
          pot_id: "pot_01234567890123456789012345678901",
          position: "1",
          amount: "1234.56",
        },
        {
          id: "ppf_01234567890123456789012345678902",
          pot_id: "pot_01234567890123456789012345678901",
          position: "2",
          amount: "234.56",
        },
      ]
      const potPfs = extractPotPfs(rawPotPfs);
      expect(potPfs.length).toBe(rawPotPfs.length);
      expect(potPfs[0].id).toBe("ppf_01234567890123456789012345678901");
      expect(potPfs[0].pot_id).toBe("pot_01234567890123456789012345678901");
      expect(potPfs[0].position).toBe(1);
      expect(potPfs[0].amount).toBe(1234.56);
      expect(potPfs[1].id).toBe("ppf_01234567890123456789012345678902");
      expect(potPfs[1].pot_id).toBe("pot_01234567890123456789012345678901");
      expect(potPfs[1].position).toBe(2);
      expect(potPfs[1].amount).toBe(234.56);
    });
    it('should return empty array if no potPfs', () => {
      const potPfs = extractPotPfs([]);
      expect(potPfs).toEqual([]);
    });
    it('should return empty array if potPfs is null', () => {
      const potPfs = extractPotPfs(null as any);
      expect(potPfs).toEqual([]);
    })
    it('should return empty array if potPfs is not an array', () => {
      const potPfs = extractPotPfs({} as any);
      expect(potPfs).toEqual([]);
    })
  });

  describe('getAllPotPfsForTmnt- get all potPfs for a tmnt', () => {

    beforeAll(async () => {
      await restorePotPfs();
    })
    
    it('should get all potPfs for a tmnt', async () => {
      const potPfs = await getAllPotPfsForTmnt(pmTmntId);
      expect(potPfs.length).toBe(2);
      expect(potPfs[0].id).toBe(pmPotPf1.id);
      expect(potPfs[0].pot_id).toBe(pmPotPf1.pot_id);
      expect(potPfs[0].position).toBe(pmPotPf1.position);
      expect(potPfs[0].amount).toBe(pmPotPf1.amount);
      expect(potPfs[1].id).toBe(pmPotPf2.id);
      expect(potPfs[1].pot_id).toBe(pmPotPf2.pot_id);
      expect(potPfs[1].position).toBe(pmPotPf2.position);
      expect(potPfs[1].amount).toBe(pmPotPf2.amount);
    })
    it('should return empty array when tmnt id is not found', async () => {
      const potPfs = await getAllPotPfsForTmnt(notFoundTmntId);
      expect(potPfs).toEqual([]);      
    })
    it('should throw error when tmnt id is invalid', async () => {
      await expect(getAllPotPfsForTmnt("test")).rejects.toThrow("Invalid tmnt id");
    })
    it('should throw an error when tmnt id is valid but not a pot id', async () => {
      await expect(getAllPotPfsForTmnt(userId)).rejects.toThrow("Invalid tmnt id");
    })
    it('should throw an error when tmnt id is null', async () => {
      await expect(getAllPotPfsForTmnt(null as any)).rejects.toThrow("Invalid tmnt id");
    })
  });

  describe('updateAllPotPfsForTmnt - update all potPfs for a tmnt', () => {

    const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);

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

    it('should update many potPfs for a tmnt - change amount', async () => {      
      const testPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      testPotPfs[0].amount = 350;
      testPotPfs[1].amount = 250;

      const toSave: tmntPotPfSaveDataType = {
        potPfData: testPotPfs,
        potIds: validPotIds,
        tmntId: pmTmntId
      };
      const updated = await updateAllPotPfsForTmnt(toSave);
      
      putMany = true;
      expect(updated.length).toBe(testPotPfs.length);
      expect(updated[0].id).toBe(pmPotPf1.id);
      expect(updated[0].pot_id).toBe(pmPotPf1.pot_id);
      expect(updated[0].position).toBe(pmPotPf1.position);
      expect(updated[0].amount).toBe(testPotPfs[0].amount);
      expect(updated[1].id).toBe(pmPotPf2.id);
      expect(updated[1].pot_id).toBe(pmPotPf2.pot_id);
      expect(updated[1].position).toBe(pmPotPf2.position);
      expect(updated[1].amount).toBe(testPotPfs[1].amount);
    });
    it('should update many potPfs for a tmnt - add row', async () => {      
      const testPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      testPotPfs.push({
        ...initPotPf,        
        id: "ppf_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        pot_id: pmPotId,
        position: 3,
        amount: 10,
      });
      
      const toSave: tmntPotPfSaveDataType = {
        potPfData: testPotPfs,
        potIds: validPotIds,
        tmntId: pmTmntId
      };
      const updated = await updateAllPotPfsForTmnt(toSave);
      
      putMany = true;
      expect(updated.length).toBe(testPotPfs.length);
      expect(updated[0].id).toBe(pmPotPf1.id);
      expect(updated[0].pot_id).toBe(pmPotPf1.pot_id);
      expect(updated[0].position).toBe(pmPotPf1.position);
      expect(updated[0].amount).toBe(testPotPfs[0].amount);
      expect(updated[1].id).toBe(pmPotPf2.id);
      expect(updated[1].pot_id).toBe(pmPotPf2.pot_id);
      expect(updated[1].position).toBe(pmPotPf2.position);
      expect(updated[1].amount).toBe(testPotPfs[1].amount);
      expect(updated[2].id).toBe(testPotPfs[2].id);
      expect(updated[2].pot_id).toBe(testPotPfs[2].pot_id);
      expect(updated[2].position).toBe(testPotPfs[2].position);
      expect(updated[2].amount).toBe(testPotPfs[2].amount);
    });
    it('should update many potPfs for a tmnt - change amount and delete a row', async () => {
      const testPotPfs = cloneDeep([pmPotPf1]);
      testPotPfs[0].amount = 400;

      const toSave: tmntPotPfSaveDataType = {
        potPfData: testPotPfs,
        potIds: validPotIds,
        tmntId: pmTmntId
      };
      const updated = await updateAllPotPfsForTmnt(toSave);
      
      putMany = true;
      expect(updated.length).toBe(testPotPfs.length);
      expect(updated[0].id).toBe(pmPotPf1.id);
      expect(updated[0].pot_id).toBe(pmPotPf1.pot_id);
      expect(updated[0].position).toBe(pmPotPf1.position);
      expect(updated[0].amount).toBe(testPotPfs[0].amount);
    });
    it('should update many potPfs for a tmnt - sanitize amount', async () => {
      const testPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      testPotPfs[0].amount = 350.351;

      const toSave: tmntPotPfSaveDataType = {
        potPfData: testPotPfs,
        potIds: validPotIds,
        tmntId: pmTmntId
      };
      const updated = await updateAllPotPfsForTmnt(toSave);
      
      putMany = true;
      expect(updated.length).toBe(pmPotPfs.length);
      expect(updated[0].id).toBe(pmPotPf1.id);
      expect(updated[0].pot_id).toBe(pmPotPf1.pot_id);
      expect(updated[0].position).toBe(pmPotPf1.position);
      expect(updated[0].amount).toBe(350.35);
      expect(updated[1].id).toBe(pmPotPf2.id);
      expect(updated[1].pot_id).toBe(pmPotPf2.pot_id);
      expect(updated[1].position).toBe(pmPotPf2.position);
      expect(updated[1].amount).toBe(pmPotPf2.amount);
    });
    it('should update many potPfs for a tmnt - empty potPfs', async () => {
      const pmPotPf2: potPfType[] = [];

      const toSave: tmntPotPfSaveDataType = {
        potPfData: pmPotPf2,
        potIds: validPotIds,
        tmntId: pmTmntId
      };
      const updated = await updateAllPotPfsForTmnt(toSave);

      putMany = true;
      expect(updated.length).toBe(0); // array was empty

      const noPotPfs = await getAllPotPfsForTmnt(pmTmntId);
      expect(noPotPfs.length).toBe(0); // all potPfs were deleted
    });

    it('should not update many potPfs for a tmnt when tmntId is invalid', async () => {
      const toSave: tmntPotPfSaveDataType = {
        potPfData: pmPotPfs,
        potIds: validPotIds,
        tmntId: 'test'
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('Invalid tmnt id');
    });
    it('should not update many potPfs for a tmnt when tmntId is null', async () => {      
      const toSave: tmntPotPfSaveDataType = {
        potPfData: pmPotPfs,
        potIds: validPotIds,
        tmntId: null as any
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('Invalid tmnt id');
    });
    it('should not update many potPfs for a tmnt when tmntId is an id, but not a tmnt id', async () => {      
      const toSave: tmntPotPfSaveDataType = {
        potPfData: pmPotPfs,
        potIds: validPotIds,
        tmntId: userId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('Invalid tmnt id');
    });
    it('should NOT update many potPfs for a tmnt when tmntId is not found', async () => {      
      const toSave: tmntPotPfSaveDataType = {
        potPfData: pmPotPfs,
        potIds: validPotIds,
        tmntId: notFoundTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('updateAllPotPfsForTmnt failed: Request failed with status code 409');      
    });

    it('should not update many potPfs for a tmnt when potIds is not an array', async () => {
      const toSave: tmntPotPfSaveDataType = {
        potPfData: pmPotPfs,
        potIds: pmPotPfs as any,
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('updateAllPotPfsForTmnt failed: Request failed with status code 400');
    });
    it('should not update many potPfs for a tmnt when potIds is null', async () => {            
      const toSave: tmntPotPfSaveDataType = {
        potPfData: pmPotPfs,
        potIds: null as any,
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('Invalid potIds array');
    });

    it('should not update many potPfs for a tmnt when potPfs is not an array', async () => {            
      const toSave: tmntPotPfSaveDataType = {
        potPfData: pmPotPf1 as any,
        potIds: validPotIds,
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('Invalid potPfs array');
    });
    it('should not update many potPfs for a tmnt when potPfs is null', async () => {            
      const toSave: tmntPotPfSaveDataType = {
        potPfData: null as any,
        potIds: validPotIds,
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('Invalid potPfs array');
    });

    it('should not update many potPfs for a tmnt when potIds has invalid id', async () => {      
      const toSave: tmntPotPfSaveDataType = {
        potPfData: pmPotPfs,
        potIds: ['test'],
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('updateAllPotPfsForTmnt failed: Request failed with status code 422');
    });
    it('should not update many potPfs for a tmnt when potIds has non string id', async () => {            
      const toSave: tmntPotPfSaveDataType = {
        potPfData: pmPotPfs,
        potIds: [123] as any,
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('updateAllPotPfsForTmnt failed: Request failed with status code 400');
    });
    it('should not update many potPfs for a tmnt when potIds are ids, but not pot ids', async () => {      
      const toSave: tmntPotPfSaveDataType = {
        potPfData: pmPotPfs,
        potIds: [userId],
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('updateAllPotPfsForTmnt failed: Request failed with status code 422');
    });

    it('should NOT update many potPfs for a tmnt when pot_ids in pmPotPfs not in potIds', async () => {            
      const toSave: tmntPotPfSaveDataType = {
        potPfData: pmPotPfs,
        potIds: [notFoundPotId],
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('updateAllPotPfsForTmnt failed: Request failed with status code 422');
    });
    it('should NOT update many potPfs for a tmnt when pot_ids in pmPotPfs not in potIds', async () => {            
      const toSave: tmntPotPfSaveDataType = {
        potPfData: pmPotPfs,
        potIds: [userId],
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('updateAllPotPfsForTmnt failed: Request failed with status code 422');
    });

    it('should NOT update many potPfs for a tmnt when pot_id is valid, but not a pot id', async () => {      
      const invalidPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      invalidPotPfs[0].pot_id = userId;      
      const toSave: tmntPotPfSaveDataType = {
        potPfData: invalidPotPfs,
        potIds: validPotIds,
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('updateAllPotPfsForTmnt failed: Request failed with status code 422');      
    });
    it('should NOT update many potPfs for a tmnt when pot_id is valid, but not in potIds', async () => {      
      const invalidPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      invalidPotPfs[0].pot_id = userId;
      const toSave: tmntPotPfSaveDataType = {
        potPfData: invalidPotPfs,
        potIds: validPotIds,
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('updateAllPotPfsForTmnt failed: Request failed with status code 422');      
    });

    it('should NOT update many potPfs for a tmnt when position is too low', async () => {      
      const invalidPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      invalidPotPfs[0].position = 0;
      const toSave: tmntPotPfSaveDataType = {
        potPfData: invalidPotPfs,
        potIds: validPotIds,
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('updateAllPotPfsForTmnt failed: Request failed with status code 422');
    });
    it('should NOT update many potPfs for a tmnt when position is too high', async () => {      
      const invalidPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      invalidPotPfs[0].position = maxPosition + 1;
      const toSave: tmntPotPfSaveDataType = {
        potPfData: invalidPotPfs,
        potIds: validPotIds,
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('updateAllPotPfsForTmnt failed: Request failed with status code 422');
    });
    it('should NOT update many potPfs for a tmnt when position is not a number', async () => {      
      const invalidPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      invalidPotPfs[0].position = 'test' as any;
      const toSave: tmntPotPfSaveDataType = {
        potPfData: invalidPotPfs,
        potIds: validPotIds,
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('updateAllPotPfsForTmnt failed: Request failed with status code 400');
    });
    it('should NOT update many potPfs for a tmnt when position is not an integer', async () => {      
      const invalidPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      invalidPotPfs[0].position = 1.5;
      const toSave: tmntPotPfSaveDataType = {
        potPfData: invalidPotPfs,
        potIds: validPotIds,
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('updateAllPotPfsForTmnt failed: Request failed with status code 422');
    });
    it('should NOT update many potPfs for a tmnt when position is out of sequence', async () => {      
      const invalidPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      invalidPotPfs[0].position = 3;
      const toSave: tmntPotPfSaveDataType = {
        potPfData: invalidPotPfs,
        potIds: validPotIds,
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('updateAllPotPfsForTmnt failed: Request failed with status code 422');
    });
    it('should NOT update many potPfs for a tmnt when position is missing', async () => {      
      const invalidPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      invalidPotPfs[0].position = null as any;
      const toSave: tmntPotPfSaveDataType = {
        potPfData: invalidPotPfs,
        potIds: validPotIds,
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('updateAllPotPfsForTmnt failed: Request failed with status code 400');
    });

    it('should NOT update many potPfs for a tmnt when amount is too low', async () => { 
      const invalidPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      invalidPotPfs[0].amount = 0;
      const toSave: tmntPotPfSaveDataType = {
        potPfData: invalidPotPfs,
        potIds: validPotIds,
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('updateAllPotPfsForTmnt failed: Request failed with status code 422');
    });
    it('should NOT update many potPfs for a tmnt when amount is too high', async () => { 
      const invalidPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      invalidPotPfs[0].amount = maxMoney + 1;
      const toSave: tmntPotPfSaveDataType = {
        potPfData: invalidPotPfs,
        potIds: validPotIds,
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('updateAllPotPfsForTmnt failed: Request failed with status code 422');
    });
    it('should NOT update many potPfs for a tmnt when amount is not a number', async () => { 
      const invalidPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      invalidPotPfs[0].amount = 'test' as any;
      const toSave: tmntPotPfSaveDataType = {
        potPfData: invalidPotPfs,
        potIds: validPotIds,
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('updateAllPotPfsForTmnt failed: Request failed with status code 400');
    });
    it('should NOT update many potPfs for a tmnt when amount is missing', async () => { 
      const invalidPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      invalidPotPfs[0].amount = null as any;
      const toSave: tmntPotPfSaveDataType = {
        potPfData: invalidPotPfs,
        potIds: validPotIds,
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('updateAllPotPfsForTmnt failed: Request failed with status code 400');
    });
    it('should NOT update many potPfs for a tmnt when amount is not decending', async () => { 
      const invalidPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      invalidPotPfs[1].amount = invalidPotPfs[0].amount + 1;
      const toSave: tmntPotPfSaveDataType = {
        potPfData: invalidPotPfs,
        potIds: validPotIds,
        tmntId: pmTmntId
      };
      await expect(updateAllPotPfsForTmnt(toSave)).rejects.toThrow('updateAllPotPfsForTmnt failed: Request failed with status code 422');
    });
  });    

  describe('updateAllPotPfsForTmnt - update all potPfs for a tmnt - two pots', () => {

    const testTmntId = "tmt_d237a388a8fc4641a2e37233f1d6bebd";
    const testPotId1 = "pot_89fd8f787de942a1a92aaa2df3e7c185";
    const testPotId2 = "pot_aa5268ed78ad4a1599675b6a85d193b3";
    const testPotPf1 = {
      ...initPotPf,
      id: "ppf_42c133340c174d05ba7098930e2f0f90",
      pot_id: testPotId1,
      position: 1,
      amount: 70,
    }
    const testPotPf2 = {
      id: "ppf_97594d1f0f7043c48dacec19091d1494",
      pot_id: testPotId1,
      position: 2,
      amount: 25,
    }
    const testPotPf3 = {
      id: "ppf_87415abe7ca444d898f14568961578bb",
      pot_id: testPotId2,
      position: 1,
      amount: 55,
    }
    const testPotPf4 = {
      id: "ppf_0d402ea969a448278c68f5fbfdc70cfe",
      pot_id: testPotId2,
      position: 2,
      amount: 20,
    }
    const testPotIds: string[] = [testPotId1, testPotId2];
    const testPotPfs = [testPotPf1, testPotPf2, testPotPf3, testPotPf4];

    const restoreTestPotPfs = async () => {
      await privateApi.delete(tmntUrl + testTmntId);
      const restorePmPotPfs = cloneDeep(testPotPfs);
      const restorePotIds = cloneDeep(testPotIds); 
      const restoreData: potPfSaveDataType = {
        potPfData: restorePmPotPfs,
        potIds: restorePotIds
      }
      const restoreJSON = JSON.stringify(restoreData);
      await privateApi.put(tmntUrl + testTmntId, restoreJSON);
    }

    beforeEach(async () => {
      await restoreTestPotPfs();
    });

    afterEach(async () => {
      await restoreTestPotPfs();
    });

    it('should update many potPfs for a tmnt', async () => {

      const toUpdatePotPfs = cloneDeep(testPotPfs);
      toUpdatePotPfs[0].amount = 300;
      toUpdatePotPfs[1].amount = 200;
      toUpdatePotPfs[2].amount = 325;
      toUpdatePotPfs[3].amount = 225;

      const toSave: tmntPotPfSaveDataType = {
        potPfData: toUpdatePotPfs,
        potIds: testPotIds,
        tmntId: testTmntId
      };

      const updated = await updateAllPotPfsForTmnt(toSave);
      expect(updated.length).toBe(toUpdatePotPfs.length);
      expect(updated[0].id).toBe(testPotPf1.id);
      expect(updated[0].pot_id).toBe(testPotPf1.pot_id);
      expect(updated[0].amount).toBe(toUpdatePotPfs[0].amount);
      expect(updated[0].position).toBe(testPotPf1.position);
      expect(updated[1].id).toBe(testPotPf2.id);
      expect(updated[1].pot_id).toBe(testPotPf2.pot_id);
      expect(updated[1].amount).toBe(toUpdatePotPfs[1].amount);
      expect(updated[1].position).toBe(testPotPf2.position);
      expect(updated[2].id).toBe(testPotPf3.id);
      expect(updated[2].pot_id).toBe(testPotPf3.pot_id);
      expect(updated[2].amount).toBe(toUpdatePotPfs[2].amount);
      expect(updated[2].position).toBe(testPotPf3.position);
      expect(updated[3].id).toBe(testPotPf4.id);
      expect(updated[3].pot_id).toBe(testPotPf4.pot_id);
      expect(updated[3].amount).toBe(toUpdatePotPfs[3].amount);
      expect(updated[3].position).toBe(testPotPf4.position);      
    });
  });

});
