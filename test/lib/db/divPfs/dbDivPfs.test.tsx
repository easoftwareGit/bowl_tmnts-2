import { privateApi } from "@/lib/api/axios";
import { baseDivPfsApi } from "@/lib/api/apiPaths";
import { testBaseDivPfsApi } from "../../../testApi";
import type {
  divPfSaveDataType,
  divPfType,
  tmntDivPfSaveDataType,
} from "@/lib/types/types";
import { initDivPf } from "@/lib/db/initVals";
import {  
  extractDivPfs,
  getAllDivPfsForTmnt,
  updateAllDivPfsForTmnt,
} from "@/lib/db/divPfs/dbDivPfs";
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
const url = process.env.NODE_ENV === "test" && testBaseDivPfsApi
  ? testBaseDivPfsApi
  : baseDivPfsApi;  

const tmntUrl = url + "/tmnt/"; 

const notFoundId = "dpf_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

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

describe("dbDivPfs", () => { 

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

  describe('extractDivPfs', () => { 
    it('should extract divPfs from a div', () => {
      const rawDivPfs = [
        {
          id: "dpf_01234567890123456789012345678901",
          div_id: "div_01234567890123456789012345678901",
          position: "1",
          amount: "1234.56",
        },
        {
          id: "dpf_01234567890123456789012345678902",
          div_id: "div_01234567890123456789012345678901",
          position: "2",
          amount: "234.56",
        },
      ]
      const divPfs = extractDivPfs(rawDivPfs);
      expect(divPfs.length).toBe(rawDivPfs.length);
      expect(divPfs[0].id).toBe("dpf_01234567890123456789012345678901");
      expect(divPfs[0].div_id).toBe("div_01234567890123456789012345678901");
      expect(divPfs[0].position).toBe(1);
      expect(divPfs[0].amount).toBe(1234.56);
      expect(divPfs[1].id).toBe("dpf_01234567890123456789012345678902");
      expect(divPfs[1].div_id).toBe("div_01234567890123456789012345678901");
      expect(divPfs[1].position).toBe(2);
      expect(divPfs[1].amount).toBe(234.56);
    });
    it('should return empty array if no divPfs', () => {
      const divPfs = extractDivPfs([]);
      expect(divPfs).toEqual([]);
    });
    it('should return empty array if divPfs is null', () => {
      const divPfs = extractDivPfs(null as any);
      expect(divPfs).toEqual([]); 
    })
    it('should return empty array if divPfs is not an array', () => {
      const divPfs = extractDivPfs({} as any);
      expect(divPfs).toEqual([]);
    })
  })

  describe('getAllDivPfsForTmnt- get all divPfs for a tmnt', () => { 

    beforeAll(async () => {
      await restoreDivPfs();
    })
    
    it('should get all divPfs for a tmnt', async () => {
      const divPfs = await getAllDivPfsForTmnt(pmTmntId);
      expect(divPfs.length).toBe(2);
      expect(divPfs[0].id).toBe(pmDivPf1.id);
      expect(divPfs[0].div_id).toBe(pmDivPf1.div_id);
      expect(divPfs[0].position).toBe(pmDivPf1.position);
      expect(divPfs[0].amount).toBe(pmDivPf1.amount);
      expect(divPfs[1].id).toBe(pmDivPf2.id);
      expect(divPfs[1].div_id).toBe(pmDivPf2.div_id);
      expect(divPfs[1].position).toBe(pmDivPf2.position);
      expect(divPfs[1].amount).toBe(pmDivPf2.amount);
    })
    it('should return empty array when tmntId is not found', async () => {
      const divPfs = await getAllDivPfsForTmnt(notFoundTmntId);
      expect(divPfs).toEqual([]);      
    })
    it('should throw error when tmntId is invalid', async () => {
      await expect(getAllDivPfsForTmnt("test")).rejects.toThrow("Invalid tmnt id");
    })
    it('should throw an error when tmntId is valid but not a tmnt id', async () => {
      await expect(getAllDivPfsForTmnt(userId)).rejects.toThrow("Invalid tmnt id");
    })
    it('should throw an error when tmntId is null', async () => {
      await expect(getAllDivPfsForTmnt(null as any)).rejects.toThrow("Invalid tmnt id");
    })
  })

  describe('updateAllDivPfsForTmnt - update all divPfs for a tmnt', () => {

    const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);

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

    it('should update many divPfs for a tmnt - change amount', async () => {      
      const testDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      testDivPfs[0].amount = 350;
      testDivPfs[1].amount = 250;

      const toSave: tmntDivPfSaveDataType = {
        divPfData: testDivPfs,
        divIds: validDivIds,
        tmntId: pmTmntId
      }
      const updated = await updateAllDivPfsForTmnt(toSave);

      putMany = true;
      expect(updated.length).toBe(testDivPfs.length);
      expect(updated[0].id).toBe(pmDivPf1.id);
      expect(updated[0].div_id).toBe(pmDivPf1.div_id);
      expect(updated[0].position).toBe(pmDivPf1.position);
      expect(updated[0].amount).toBe(testDivPfs[0].amount);
      expect(updated[1].id).toBe(pmDivPf2.id);
      expect(updated[1].div_id).toBe(pmDivPf2.div_id);
      expect(updated[1].position).toBe(pmDivPf2.position);
      expect(updated[1].amount).toBe(testDivPfs[1].amount);
    });
    it('should update many divPfs for a div - add row', async () => {      
      const testDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      testDivPfs.push({
        ...initDivPf,
        id: "dpf_ce55c52bd60d4943bb747590a03c9734",
        div_id: pmDivId,
        position: 3,
        amount: 100,
      });
      
      const toSave: tmntDivPfSaveDataType = {
        divPfData: testDivPfs,
        divIds: validDivIds,
        tmntId: pmTmntId
      }
      const updated = await updateAllDivPfsForTmnt(toSave);

      putMany = true;
      expect(updated.length).toBe(testDivPfs.length);
      expect(updated[0].id).toBe(pmDivPf1.id);
      expect(updated[0].div_id).toBe(pmDivPf1.div_id);
      expect(updated[0].position).toBe(pmDivPf1.position);
      expect(updated[0].amount).toBe(testDivPfs[0].amount);
      expect(updated[1].id).toBe(pmDivPf2.id);
      expect(updated[1].div_id).toBe(pmDivPf2.div_id);
      expect(updated[1].position).toBe(pmDivPf2.position);
      expect(updated[1].amount).toBe(testDivPfs[1].amount);
      expect(updated[2].id).toBe(testDivPfs[2].id);
      expect(updated[2].div_id).toBe(testDivPfs[2].div_id);
      expect(updated[2].position).toBe(testDivPfs[2].position);
      expect(updated[2].amount).toBe(testDivPfs[2].amount);
    });
    it('should update many divPfs for a tmnt - change amount and delete a row', async () => {
      const testDivPfs = cloneDeep([pmDivPf1]);
      testDivPfs[0].amount = 400;

      const toSave: tmntDivPfSaveDataType = {
        divPfData: testDivPfs,
        divIds: validDivIds,
        tmntId: pmTmntId
      }
      const updated = await updateAllDivPfsForTmnt(toSave);

      putMany = true;
      expect(updated.length).toBe(testDivPfs.length);
      expect(updated[0].id).toBe(pmDivPf1.id);
      expect(updated[0].div_id).toBe(pmDivPf1.div_id);
      expect(updated[0].position).toBe(pmDivPf1.position);
      expect(updated[0].amount).toBe(testDivPfs[0].amount);
    });
    it('should update many divPfs for a tmnt - sanitize amount', async () => {
      const testDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      testDivPfs[0].amount = 350.351;

      const toSave: tmntDivPfSaveDataType = {
        divPfData: testDivPfs,
        divIds: validDivIds,
        tmntId: pmTmntId
      }
      const updated = await updateAllDivPfsForTmnt(toSave);

      putMany = true;
      expect(updated.length).toBe(pmDivPfs.length);
      expect(updated[0].id).toBe(pmDivPf1.id);
      expect(updated[0].div_id).toBe(pmDivPf1.div_id);
      expect(updated[0].position).toBe(pmDivPf1.position);
      expect(updated[0].amount).toBe(350.35);
      expect(updated[1].id).toBe(pmDivPf2.id);
      expect(updated[1].div_id).toBe(pmDivPf2.div_id);
      expect(updated[1].position).toBe(pmDivPf2.position);
      expect(updated[1].amount).toBe(pmDivPf2.amount);
    });
    it('should update many divPfs for a tmnt - empty divPfs', async () => {
      const pmDivPf2: divPfType[] = [];

      const toSave: tmntDivPfSaveDataType = {
        divPfData: pmDivPf2,
        divIds: validDivIds,
        tmntId: pmTmntId
      }
      const updated = await updateAllDivPfsForTmnt(toSave);

      putMany = true;
      expect(updated.length).toBe(0); // array was empty

      const noDivPfs = await getAllDivPfsForTmnt(pmTmntId);
      expect(noDivPfs.length).toBe(0); // all divPfs were deleted
    });

    it('should not update many divPfs for a tmnt when tmntId is invalid', async () => {      
      const toSave: tmntDivPfSaveDataType = {
        divPfData: pmDivPfs,
        divIds: validDivIds,
        tmntId: 'test',
      }      
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('Invalid tmnt id');
    });
    it('should not update many divPfs for a tmnt when tmntId is null', async () => {      
      const toSave: tmntDivPfSaveDataType = {
        divPfData: pmDivPfs,
        divIds: validDivIds,
        tmntId: null as any,
      }            
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('Invalid tmnt id');
    });
    it('should not update many divPfs for a tmnt when tmntId is an id, but not a tmnt id', async () => {      
      const toSave: tmntDivPfSaveDataType = {
        divPfData: pmDivPfs,
        divIds: validDivIds,
        tmntId: userId,
      }
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('Invalid tmnt id');
    });
    it('should NOT update many divPfs for a tmnt when tmntId is not found', async () => {      
      const toSave: tmntDivPfSaveDataType = {
        divPfData: pmDivPfs,
        divIds: validDivIds,
        tmntId: notFoundTmntId,
      }      
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('updateAllDivPfsForTmnt failed: Request failed with status code 409');
    });

    it('should not update many divPfs for a tmnt when divIds is not an array', async () => {            
      const toSave: tmntDivPfSaveDataType = {
        divPfData: pmDivPfs,
        divIds: pmDivPf1 as any,
        tmntId: pmTmntId,
      }      
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('Invalid divIds array');
    });
    it('should not update many divPfs for a tmnt when divIds is null', async () => {            
      const toSave: tmntDivPfSaveDataType = {
        divPfData: pmDivPfs,
        divIds: null as any,
        tmntId: pmTmntId,
      }
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('Invalid divIds array');
    });
    it('should not update many divPfs for a tmnt when divPfs is not an array', async () => {            
      const toSave: tmntDivPfSaveDataType = {
        divPfData: pmDivPf1 as any,
        divIds: validDivIds,
        tmntId: pmTmntId,
      }
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('Invalid divPfs array');
    });
    it('should not update many divPfs for a tmnt when divPfs is null', async () => {            
      const toSave: tmntDivPfSaveDataType = {
        divPfData: null as any,
        divIds: validDivIds,
        tmntId: pmTmntId,
      }
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('Invalid divPfs array');
    });

    it('should not update many divPfs for a tmnt when divIds has invalid id', async () => {      
      const toSave: tmntDivPfSaveDataType = {
        divPfData: pmDivPfs,
        divIds: ['test'],
        tmntId: pmTmntId,
      }
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('updateAllDivPfsForTmnt failed: Request failed with status code 422');      
    });
    it('should not update many divPfs for a tmnt when divIds has non string id', async () => {      
      const toSave: tmntDivPfSaveDataType = {
        divPfData: pmDivPfs,
        divIds: [123] as any,
        tmntId: pmTmntId,
      }
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('updateAllDivPfsForTmnt failed: Request failed with status code 400');
    });
    it('should not update many divPfs for a tmnt when divIds are ids, but not div ids', async () => {
      const toSave: tmntDivPfSaveDataType = {
        divPfData: pmDivPfs,
        divIds: [userId],
        tmntId: pmTmntId,
      }      
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('updateAllDivPfsForTmnt failed: Request failed with status code 422');
    });
    it('should NOT update many divPfs for a div when div_ids in pmDivPfs not in divIds', async () => {      
      const toSave: tmntDivPfSaveDataType = {
        divPfData: pmDivPfs,
        divIds: [notFoundDivId],
        tmntId: pmTmntId,
      }                 
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('updateAllDivPfsForTmnt failed: Request failed with status code 422');
    });

    it('should NOT update many divPfs for a div when div_id is valid, but not a div id', async () => {      
      const invalidDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      invalidDivPfs[0].div_id = userId;   
      const toSave: tmntDivPfSaveDataType = {
        divPfData: invalidDivPfs,
        divIds: validDivIds,
        tmntId: pmTmntId,
      }                   
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('updateAllDivPfsForTmnt failed: Request failed with status code 422');
    });
    it('should NOT update many divPfs for a div when div_id is valid, but not in divIds', async () => {      
      const invalidDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      invalidDivPfs[0].div_id = notFoundDivId;
      const toSave: tmntDivPfSaveDataType = {
        divPfData: invalidDivPfs,
        divIds: validDivIds,
        tmntId: pmTmntId,
      }                   
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('updateAllDivPfsForTmnt failed: Request failed with status code 422');      
    });

    it('should NOT update many divPfs for a div when position is too low', async () => {      
      const invalidDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      invalidDivPfs[0].position = 0;
      const toSave: tmntDivPfSaveDataType = {
        divPfData: invalidDivPfs,
        divIds: validDivIds,
        tmntId: pmTmntId,
      }                   
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('updateAllDivPfsForTmnt failed: Request failed with status code 422');      
    });
    it('should NOT update many divPfs for a div when position is too high', async () => {      
      const invalidDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      invalidDivPfs[0].position = maxPosition + 1;
      const toSave: tmntDivPfSaveDataType = {
        divPfData: invalidDivPfs,
        divIds: validDivIds,
        tmntId: pmTmntId,
      }                   
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('updateAllDivPfsForTmnt failed: Request failed with status code 422');      
    });
    it('should NOT update many divPfs for a div when position is not a number', async () => {      
      const invalidDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      invalidDivPfs[0].position = 'test' as any;
      const toSave: tmntDivPfSaveDataType = {
        divPfData: invalidDivPfs,
        divIds: validDivIds,
        tmntId: pmTmntId,
      }                   
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('updateAllDivPfsForTmnt failed: Request failed with status code 400');      
    });
    it('should NOT update many divPfs for a div when position is not an integer', async () => {      
      const invalidDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      invalidDivPfs[0].position = 1.5;
      const toSave: tmntDivPfSaveDataType = {
        divPfData: invalidDivPfs,
        divIds: validDivIds,
        tmntId: pmTmntId,
      }                   
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('updateAllDivPfsForTmnt failed: Request failed with status code 422');      
    });
    it('should NOT update many divPfs for a div when position is out of sequence', async () => {      
      const invalidDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      invalidDivPfs[0].position = 3;
      const toSave: tmntDivPfSaveDataType = {
        divPfData: invalidDivPfs,
        divIds: validDivIds,
        tmntId: pmTmntId,
      }                   
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('updateAllDivPfsForTmnt failed: Request failed with status code 422');      
    });
    it('should NOT update many divPfs for a div when position is missing', async () => {      
      const invalidDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      invalidDivPfs[0].position = null as any;
      const toSave: tmntDivPfSaveDataType = {
        divPfData: invalidDivPfs,
        divIds: validDivIds,
        tmntId: pmTmntId,
      }                   
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('updateAllDivPfsForTmnt failed: Request failed with status code 400');      
    });

    it('should NOT update many divPfs for a div when amount is too low', async () => { 
      const invalidDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      invalidDivPfs[0].amount = 0;
      const toSave: tmntDivPfSaveDataType = {
        divPfData: invalidDivPfs,
        divIds: validDivIds,
        tmntId: pmTmntId,
      }                   
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('updateAllDivPfsForTmnt failed: Request failed with status code 422');      
    });
    it('should NOT update many divPfs for a div when amount is too high', async () => { 
      const invalidDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      invalidDivPfs[0].amount = maxMoney + 1;
      const toSave: tmntDivPfSaveDataType = {
        divPfData: invalidDivPfs,
        divIds: validDivIds,
        tmntId: pmTmntId,
      }                   
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('updateAllDivPfsForTmnt failed: Request failed with status code 422');      
    });
    it('should NOT update many divPfs for a div when amount is not a number', async () => { 
      const invalidDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      invalidDivPfs[0].amount = 'test' as any;
      const toSave: tmntDivPfSaveDataType = {
        divPfData: invalidDivPfs,
        divIds: validDivIds,
        tmntId: pmTmntId,
      }                   
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('updateAllDivPfsForTmnt failed: Request failed with status code 400');      
    });
    it('should NOT update many divPfs for a div when amount is missing', async () => { 
      const invalidDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      invalidDivPfs[0].amount = null as any;
      const toSave: tmntDivPfSaveDataType = {
        divPfData: invalidDivPfs,
        divIds: validDivIds,
        tmntId: pmTmntId,
      }                   
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('updateAllDivPfsForTmnt failed: Request failed with status code 400');
    });
    it('should NOT update many divPfs for a div when amount is not decending', async () => { 
      const invalidDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      invalidDivPfs[1].amount = invalidDivPfs[0].amount + 1;
      const toSave: tmntDivPfSaveDataType = {
        divPfData: invalidDivPfs,
        divIds: validDivIds,
        tmntId: pmTmntId,
      }                   
      await expect(updateAllDivPfsForTmnt(toSave)).rejects.toThrow('updateAllDivPfsForTmnt failed: Request failed with status code 422');      
    });
  });    

  describe('updateAllDivPfsForTmnt - update all divPfs for a tmnt - two divs', () => {

    const testTmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
    const testDivId1 = "div_578834e04e5e4885bbae79229d8b96e8";
    const testDivId2 = "div_fe72ab97edf8407186c8e6df7f7fb741";
    const testDivPf1 = {
      ...initDivPf,
      id: "dpf_2516979e653f441b92646e7885cb3a50",
      div_id: testDivId1,
      position: 1,
      amount: 250,
    }
    const testDivPf2 = {
      id: "dpf_2526979e653f441b92646e7885cb3a50",
      div_id: testDivId1,
      position: 2,
      amount: 150,
    }
    const testDivPf3 = {
      id: "dpf_2536979e653f441b92646e7885cb3a50",
      div_id: testDivId2,
      position: 1,
      amount: 275,
    }
    const testDivPf4 = {
      id: "dpf_2546979e653f441b92646e7885cb3a50",
      div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
      position: 2,
      amount: 175,
    }
    const testDivIds: string[] = [testDivId1, testDivId2];
    const testDivPfs = [testDivPf1, testDivPf2, testDivPf3, testDivPf4];

    const restoreTestDivPfs = async () => {
      await privateApi.delete(tmntUrl + testTmntId);
      const restorePmDivPfs = cloneDeep(testDivPfs);
      const restoreDivIds = cloneDeep(testDivIds); 
      const restoreData: divPfSaveDataType = {
        divPfData: restorePmDivPfs,
        divIds: restoreDivIds
      }
      const restoreJSON = JSON.stringify(restoreData);
      await privateApi.put(tmntUrl + testTmntId, restoreJSON);
    }

    beforeEach(async () => {
      await restoreTestDivPfs();
    });

    afterEach(async () => {
      await restoreTestDivPfs();
    });

    it('should update many divPfs for a div', async () => {

      const toUpdateDivPfs = cloneDeep(testDivPfs);
      toUpdateDivPfs[0].amount = 300;
      toUpdateDivPfs[1].amount = 200;
      toUpdateDivPfs[2].amount = 325;
      toUpdateDivPfs[3].amount = 225;

      const toSave: tmntDivPfSaveDataType = {
        divPfData: toUpdateDivPfs,
        divIds: testDivIds,
        tmntId: testTmntId,
      }                   
      const updated = await updateAllDivPfsForTmnt(toSave);
      expect(updated.length).toBe(toUpdateDivPfs.length);
      expect(updated[0].id).toBe(testDivPf1.id);
      expect(updated[0].div_id).toBe(testDivPf1.div_id);
      expect(updated[0].amount).toBe(toUpdateDivPfs[0].amount);
      expect(updated[0].position).toBe(testDivPf1.position);
      expect(updated[1].id).toBe(testDivPf2.id);
      expect(updated[1].div_id).toBe(testDivPf2.div_id);
      expect(updated[1].amount).toBe(toUpdateDivPfs[1].amount);
      expect(updated[1].position).toBe(testDivPf2.position);
      expect(updated[2].id).toBe(testDivPf3.id);
      expect(updated[2].div_id).toBe(testDivPf3.div_id);
      expect(updated[2].amount).toBe(toUpdateDivPfs[2].amount);
      expect(updated[2].position).toBe(testDivPf3.position);
      expect(updated[3].id).toBe(testDivPf4.id);
      expect(updated[3].div_id).toBe(testDivPf4.div_id);
      expect(updated[3].amount).toBe(toUpdateDivPfs[3].amount);
      expect(updated[3].position).toBe(testDivPf4.position);      
    });
  });

})