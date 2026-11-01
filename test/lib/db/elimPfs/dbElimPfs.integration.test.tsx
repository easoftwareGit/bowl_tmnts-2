import { privateApi } from "@/lib/api/axios";
import { baseElimPfsApi } from "@/lib/api/apiPaths";
import { testBaseElimPfsApi } from "../../../testApi";
import type { elimPfSaveDataType, elimPfType, tmntElimPfSaveDataType } from "@/lib/types/types";
import { initElimPf } from "@/lib/db/initVals";
import {  
  extractElimPfs,
  getAllElimPfsForTmnt,
  updateAllElimPfsForTmnt,
} from "@/lib/db/elimPfs/dbElimPfs";
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
const url = process.env.NODE_ENV === "test" && testBaseElimPfsApi
  ? testBaseElimPfsApi
  : baseElimPfsApi;  

const tmntUrl = url + "/tmnt/"; 

const notFoundId = "epf_01234567890123456789012345678901";
const notFoundElimId = "elm_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

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

describe("dbElimPfs", () => {

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

  describe('extractElimPfs', () => {
    it('should extract elimPfs from an elim', () => {
      const rawElimPfs = [
        {
          id: "epf_01234567890123456789012345678901",
          elim_id: "elm_01234567890123456789012345678901",
          position: "1",
          amount: "1234.56",
        },
        {
          id: "epf_01234567890123456789012345678902",
          elim_id: "elm_01234567890123456789012345678901",
          position: "2",
          amount: "234.56",
        },
      ]
      const elimPfs = extractElimPfs(rawElimPfs);
      expect(elimPfs.length).toBe(rawElimPfs.length);
      expect(elimPfs[0].id).toBe("epf_01234567890123456789012345678901");
      expect(elimPfs[0].elim_id).toBe("elm_01234567890123456789012345678901");
      expect(elimPfs[0].position).toBe(1);
      expect(elimPfs[0].amount).toBe(1234.56);
      expect(elimPfs[1].id).toBe("epf_01234567890123456789012345678902");
      expect(elimPfs[1].elim_id).toBe("elm_01234567890123456789012345678901");
      expect(elimPfs[1].position).toBe(2);
      expect(elimPfs[1].amount).toBe(234.56);
    });
    it('should return empty array if no elimPfs', () => {
      const elimPfs = extractElimPfs([]);
      expect(elimPfs).toEqual([]);
    });
    it('should return empty array if elimPfs is null', () => {
      const elimPfs = extractElimPfs(null as any);
      expect(elimPfs).toEqual([]);
    })
    it('should return empty array if elimPfs is not an array', () => {
      const elimPfs = extractElimPfs({} as any);
      expect(elimPfs).toEqual([]);
    })
  });

  describe('getAllElimPfsForTmnt- get all elimPfs for a tmnt', () => { 

    beforeAll(async () => {
      await restoreElimPfs();
    })
    
    it('should get all elimPfs for a tmnt', async () => {
      const elimPfs = await getAllElimPfsForTmnt(pmTmntId);
      expect(elimPfs.length).toBe(2);
      expect(elimPfs[0].id).toBe(pmElimPf1.id);
      expect(elimPfs[0].elim_id).toBe(pmElimPf1.elim_id);
      expect(elimPfs[0].position).toBe(pmElimPf1.position);
      expect(elimPfs[0].amount).toBe(pmElimPf1.amount);
      expect(elimPfs[1].id).toBe(pmElimPf2.id);
      expect(elimPfs[1].elim_id).toBe(pmElimPf2.elim_id);
      expect(elimPfs[1].position).toBe(pmElimPf2.position);
      expect(elimPfs[1].amount).toBe(pmElimPf2.amount);
    })
    it('should return empty array when tmntId is not found', async () => {
      const elimPfs = await getAllElimPfsForTmnt(notFoundTmntId);
      expect(elimPfs).toEqual([]);      
    })
    it('should throw error when tmntId is invalid', async () => {
      await expect(getAllElimPfsForTmnt("test")).rejects.toThrow("Invalid tmnt id");
    })
    it('should throw an error when tmntId is valid but not a tmnt id', async () => {
      await expect(getAllElimPfsForTmnt(userId)).rejects.toThrow("Invalid tmnt id");
    })
    it('should throw an error when tmntId is null', async () => {
      await expect(getAllElimPfsForTmnt(null as any)).rejects.toThrow("Invalid tmnt id");
    })
  })

  describe('updateAllElimPfsForTmnt - update all elimPfs for a tmnt', () => {

    const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);

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

    it('should update many elimPfs for a tmnt - change amount', async () => {      
      const testElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      testElimPfs[0].amount = 350;
      testElimPfs[1].amount = 250;

      const toSave: tmntElimPfSaveDataType = {
        elimPfData: testElimPfs,
        elimIds: validElimIds,
        tmntId: pmTmntId
      };
      const updated = await updateAllElimPfsForTmnt(toSave);

      putMany = true;
      expect(updated.length).toBe(testElimPfs.length);
      expect(updated[0].id).toBe(pmElimPf1.id);
      expect(updated[0].elim_id).toBe(pmElimPf1.elim_id);
      expect(updated[0].position).toBe(pmElimPf1.position);
      expect(updated[0].amount).toBe(testElimPfs[0].amount);
      expect(updated[1].id).toBe(pmElimPf2.id);
      expect(updated[1].elim_id).toBe(pmElimPf2.elim_id);
      expect(updated[1].position).toBe(pmElimPf2.position);
      expect(updated[1].amount).toBe(testElimPfs[1].amount);
    });
    it('should update many elimPfs for a elim - add row', async () => {      
      const testElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      testElimPfs.push({
        ...initElimPf,        
        id: "epf_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        elim_id: pmElimId,
        position: 3,
        amount: 10,
      });
      
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: testElimPfs,
        elimIds: validElimIds,
        tmntId: pmTmntId
      };
      const updated = await updateAllElimPfsForTmnt(toSave);

      putMany = true;
      expect(updated.length).toBe(testElimPfs.length);
      expect(updated[0].id).toBe(pmElimPf1.id);
      expect(updated[0].elim_id).toBe(pmElimPf1.elim_id);
      expect(updated[0].position).toBe(pmElimPf1.position);
      expect(updated[0].amount).toBe(testElimPfs[0].amount);
      expect(updated[1].id).toBe(pmElimPf2.id);
      expect(updated[1].elim_id).toBe(pmElimPf2.elim_id);
      expect(updated[1].position).toBe(pmElimPf2.position);
      expect(updated[1].amount).toBe(testElimPfs[1].amount);
      expect(updated[2].id).toBe(testElimPfs[2].id);
      expect(updated[2].elim_id).toBe(testElimPfs[2].elim_id);
      expect(updated[2].position).toBe(testElimPfs[2].position);
      expect(updated[2].amount).toBe(testElimPfs[2].amount);
    });
    it('should update many elimPfs for a tmnt - change amount and delete a row', async () => {
      const testElimPfs = cloneDeep([pmElimPf1]);
      testElimPfs[0].amount = 400;

      const toSave: tmntElimPfSaveDataType = {
        elimPfData: testElimPfs,
        elimIds: validElimIds,
        tmntId: pmTmntId
      };
      const updated = await updateAllElimPfsForTmnt(toSave);
      putMany = true;
      expect(updated.length).toBe(testElimPfs.length);
      expect(updated[0].id).toBe(pmElimPf1.id);
      expect(updated[0].elim_id).toBe(pmElimPf1.elim_id);
      expect(updated[0].position).toBe(pmElimPf1.position);
      expect(updated[0].amount).toBe(testElimPfs[0].amount);
    });
    it('should update many elimPfs for a tmnt - sanitize amount', async () => {
      const testElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      testElimPfs[0].amount = 350.351;

      const toSave: tmntElimPfSaveDataType = {
        elimPfData: testElimPfs,
        elimIds: validElimIds,
        tmntId: pmTmntId
      };
      const updated = await updateAllElimPfsForTmnt(toSave);

      putMany = true;
      expect(updated.length).toBe(pmElimPfs.length);
      expect(updated[0].id).toBe(pmElimPf1.id);
      expect(updated[0].elim_id).toBe(pmElimPf1.elim_id);
      expect(updated[0].position).toBe(pmElimPf1.position);
      expect(updated[0].amount).toBe(350.35);
      expect(updated[1].id).toBe(pmElimPf2.id);
      expect(updated[1].elim_id).toBe(pmElimPf2.elim_id);
      expect(updated[1].position).toBe(pmElimPf2.position);
      expect(updated[1].amount).toBe(pmElimPf2.amount);
    });
    it('should update many elimPfs for a tmnt - empty elimPfs', async () => {
      const pmElimPf2: elimPfType[] = [];

      const toSave: tmntElimPfSaveDataType = {
        elimPfData: pmElimPf2,
        elimIds: validElimIds,
        tmntId: pmTmntId
      };
      const updated = await updateAllElimPfsForTmnt(toSave);

      putMany = true;
      expect(updated.length).toBe(0); // array was empty

      const noElimPfs = await getAllElimPfsForTmnt(pmTmntId);
      expect(noElimPfs.length).toBe(0); // all elimPfs were deleted
    });

    it('should not update many elimPfs for a tmnt when tmntId is invalid', async () => {
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: pmElimPfs,
        elimIds: validElimIds,
        tmntId: 'test',
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('Invalid tmnt id');
    });
    it('should not update many elimPfs for a tmnt when tmntId is null', async () => {      
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: pmElimPfs,
        elimIds: validElimIds,
        tmntId: null as any,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('Invalid tmnt id');
    });
    it('should not update many elimPfs for a tmnt when tmntId is an id, but not a tmnt id', async () => {      
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: pmElimPfs,
        elimIds: validElimIds,
        tmntId: userId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('Invalid tmnt id');
    });
    it('should NOT update many elimPfs for a tmnt when tmntId is not found', async () => {      
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: pmElimPfs,
        elimIds: validElimIds,
        tmntId: notFoundTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('updateAllElimPfsForTmnt failed: Request failed with status code 409');      
    });

    it('should not update many elimPfs for a tmnt when elimIds is not an array', async () => {            
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: pmElimPfs,
        elimIds: pmElimPf1 as any,
        tmntId: pmTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('Invalid elimIds array');
    });
    it('should not update many elimPfs for a tmnt when elimIds is null', async () => {            
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: pmElimPfs,
        elimIds: null as any,
        tmntId: pmTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('Invalid elimIds array');
    });

    it('should not update many elimPfs for a tmnt when elimPfs is not an array', async () => {            
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: pmElimPf1 as any,
        elimIds: validElimIds,
        tmntId: pmTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('Invalid elimPfs array');
    });
    it('should not update many elimPfs for a tmnt when elimPfs is null', async () => {            
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: null as any,
        elimIds: validElimIds,
        tmntId: pmTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('Invalid elimPfs array');
    });

    it('should not update many elimPfs for a tmnt when elimIds has invalid id', async () => {      
      const invalid = ['test'];
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: pmElimPfs,
        elimIds: invalid,
        tmntId: pmTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('updateAllElimPfsForTmnt failed: Request failed with status code 422');
    });
    it('should not update many elimPfs for a tmnt when elimIds has non string id', async () => {      
      const invalid = [123];
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: pmElimPfs,
        elimIds: invalid as any,
        tmntId: pmTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('updateAllElimPfsForTmnt failed: Request failed with status code 400');
    });
    it('should not update many elimPfs for a tmnt when elimIds are ids, but not elim ids', async () => {
      const invalid = [userId];
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: pmElimPfs,
        elimIds: invalid,
        tmntId: pmTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('updateAllElimPfsForTmnt failed: Request failed with status code 422');
    });

    it('should NOT update many elimPfs for a elim when elim_ids in pmElimPfs not in elimIds', async () => {      
      const missingElimIds = [notFoundElimId];      
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: pmElimPfs,
        elimIds: missingElimIds,
        tmntId: pmTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('updateAllElimPfsForTmnt failed: Request failed with status code 422');
    });
    it('should NOT update many elimPfs for a elim when elim_ids in pmElimPfs not in elimIds', async () => {      
      const missingElimIds = [notFoundElimId];      
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: pmElimPfs,
        elimIds: missingElimIds,
        tmntId: pmTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('updateAllElimPfsForTmnt failed: Request failed with status code 422');
    });

    it('should NOT update many elimPfs for a elim when elim_id is valid, but not a elim id', async () => {      
      const invalidElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      invalidElimPfs[0].elim_id = userId;    
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: invalidElimPfs,
        elimIds: validElimIds,
        tmntId: pmTmntId,
      }               
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('updateAllElimPfsForTmnt failed: Request failed with status code 422');      
    });
    it('should NOT update many elimPfs for a elim when elim_id is valid, but not in elimIds', async () => {      
      const invalidElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      invalidElimPfs[0].elim_id = notFoundElimId;
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: invalidElimPfs,
        elimIds: validElimIds,
        tmntId: pmTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('updateAllElimPfsForTmnt failed: Request failed with status code 422');      
    });

    it('should NOT update many elimPfs for a elim when position is too low', async () => {      
      const invalidElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      invalidElimPfs[0].position = 0;
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: invalidElimPfs,
        elimIds: validElimIds,
        tmntId: pmTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('updateAllElimPfsForTmnt failed: Request failed with status code 422');
    });
    it('should NOT update many elimPfs for a elim when position is too high', async () => {      
      const invalidElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      invalidElimPfs[0].position = maxPosition + 1;
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: invalidElimPfs,
        elimIds: validElimIds,
        tmntId: pmTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('updateAllElimPfsForTmnt failed: Request failed with status code 422');
    });
    it('should NOT update many elimPfs for a elim when position is not a number', async () => {      
      const invalidElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      invalidElimPfs[0].position = 'test' as any;
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: invalidElimPfs,
        elimIds: validElimIds,
        tmntId: pmTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('updateAllElimPfsForTmnt failed: Request failed with status code 400');
    });
    it('should NOT update many elimPfs for a elim when position is not an integer', async () => {      
      const invalidElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      invalidElimPfs[0].position = 1.5;
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: invalidElimPfs,
        elimIds: validElimIds,
        tmntId: pmTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('updateAllElimPfsForTmnt failed: Request failed with status code 422');
    });
    it('should NOT update many elimPfs for a elim when position is out of sequence', async () => {      
      const invalidElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      invalidElimPfs[0].position = 3;
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: invalidElimPfs,
        elimIds: validElimIds,
        tmntId: pmTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('updateAllElimPfsForTmnt failed: Request failed with status code 422');
    });
    it('should NOT update many elimPfs for a elim when position is missing', async () => {      
      const invalidElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      invalidElimPfs[0].position = null as any;
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: invalidElimPfs,
        elimIds: validElimIds,
        tmntId: pmTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('updateAllElimPfsForTmnt failed: Request failed with status code 400');
    });

    it('should NOT update many elimPfs for a elim when amount is too low', async () => { 
      const invalidElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      invalidElimPfs[0].amount = 0;
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: invalidElimPfs,
        elimIds: validElimIds,
        tmntId: pmTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('updateAllElimPfsForTmnt failed: Request failed with status code 422');
    });
    it('should NOT update many elimPfs for a elim when amount is too high', async () => { 
      const invalidElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      invalidElimPfs[0].amount = maxMoney + 1;
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: invalidElimPfs,
        elimIds: validElimIds,
        tmntId: pmTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('updateAllElimPfsForTmnt failed: Request failed with status code 422');
    });
    it('should NOT update many elimPfs for a elim when amount is not a number', async () => { 
      const invalidElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      invalidElimPfs[0].amount = 'test' as any;
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: invalidElimPfs,
        elimIds: validElimIds,
        tmntId: pmTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('updateAllElimPfsForTmnt failed: Request failed with status code 400');
    });
    it('should NOT update many elimPfs for a elim when amount is missing', async () => { 
      const invalidElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      invalidElimPfs[0].amount = null as any;
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: invalidElimPfs,
        elimIds: validElimIds,
        tmntId: pmTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('updateAllElimPfsForTmnt failed: Request failed with status code 400');
    });
    it('should NOT update many elimPfs for a elim when amount is not decending', async () => { 
      const invalidElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      invalidElimPfs[1].amount = invalidElimPfs[0].amount + 1;
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: invalidElimPfs,
        elimIds: validElimIds,
        tmntId: pmTmntId,
      };
      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow('updateAllElimPfsForTmnt failed: Request failed with status code 422');
    });
  });    

  describe('updateAllElimPfsForTmnt - update all elimPfs for a tmnt - two elims', () => {

    // values for prisma/seeds.ts      
    const testTmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
    const testElimId1 = "elm_c01077494c2d4d9da166d697c08c28d2";
    const testElimId2 = "elm_c02077494c2d4d9da166d697c08c28d2";
    const testElimId3 = "elm_c03077494c2d4d9da166d697c08c28d2";
    const testElimId4 = "elm_c04077494c2d4d9da166d697c08c28d2";
    const testElimPf1 = {
      ...initElimPf,
      id: "epf_094a1a974e034940b847bef5b67a4b63",
      elim_id: testElimId1,
      position: 1,
      amount: 60,
    }
    const testElimPf2 = {
      ...initElimPf,
      id: "epf_710eda589d3f4106abe78006195e328a",
      elim_id: testElimId1,
      position: 2,
      amount: 30,
    }
    const testElimPf3 = {
      ...initElimPf,
      id: "epf_7e44498e84034bc1a080bfff569680bb",
      elim_id: testElimId2,
      position: 1,
      amount: 60,
    }
    const testElimPf4 = {
      ...initElimPf,
      id: "epf_9032c654c42240d78eeea91de320049f",
      elim_id: testElimId2,
      position: 2,
      amount: 30,
    }
    const testElimPf5 = {
      ...initElimPf,
      id: "epf_7e7d7dca4de74085b609030192aa15a5",
      elim_id: testElimId3,
      position: 1,
      amount: 60,        
    }
    const testElimPf6 = {
      ...initElimPf,
      id: "epf_b14d1847af30480aa4123594b0072cb1",
      elim_id: testElimId3,
      position: 2,
      amount: 30,        
    }
    const testElimPf7 = {
      ...initElimPf,
      id: "epf_560a2316645844bb9bdeb094911b9e9d",
      elim_id: testElimId4,
      position: 1,
      amount: 40,        
    }
    const testElimPf8 = {
      ...initElimPf,
      id: "epf_840e009bd5bd4e4aa389ddd02df50f23",
      elim_id: testElimId4,
      position: 2,
      amount: 15,     
    }
    const testElimIds: string[] = [testElimId1, testElimId2, testElimId3, testElimId4];
    const testElimPfs = [testElimPf1, testElimPf2, testElimPf3, testElimPf4, testElimPf5, testElimPf6, testElimPf7, testElimPf8];

    const restoreTestElimPfs = async () => {
      await privateApi.delete(tmntUrl + testTmntId);
      const restorePmElimPfs = cloneDeep(testElimPfs);
      const restoreElimIds = cloneDeep(testElimIds); 
      const restoreData: elimPfSaveDataType = {
        elimPfData: restorePmElimPfs,
        elimIds: restoreElimIds
      }
      const restoreJSON = JSON.stringify(restoreData);
      await privateApi.put(tmntUrl + testTmntId, restoreJSON);
    }

    beforeEach(async () => {
      await restoreTestElimPfs();
    });

    afterEach(async () => {
      await restoreTestElimPfs();
    });

    it('should update many elimPfs for a elim', async () => {

      const toUpdateElimPfs = cloneDeep(testElimPfs);
      toUpdateElimPfs[0].amount = 30;
      toUpdateElimPfs[1].amount = 20;
      toUpdateElimPfs[2].amount = 25;
      toUpdateElimPfs[3].amount = 15;
      toUpdateElimPfs[4].amount = 45;
      toUpdateElimPfs[5].amount = 35;
      toUpdateElimPfs[6].amount = 20;
      toUpdateElimPfs[7].amount = 5;

      const toSave: tmntElimPfSaveDataType = {
        elimPfData: toUpdateElimPfs,
        elimIds: testElimIds,
        tmntId: testTmntId,
      };

      const updated = await updateAllElimPfsForTmnt(toSave);
      expect(updated.length).toBe(toUpdateElimPfs.length);
      expect(updated[0].id).toBe(testElimPf1.id);
      expect(updated[0].elim_id).toBe(testElimPf1.elim_id);
      expect(updated[0].amount).toBe(toUpdateElimPfs[0].amount);
      expect(updated[0].position).toBe(testElimPf1.position);
      expect(updated[1].id).toBe(testElimPf2.id);
      expect(updated[1].elim_id).toBe(testElimPf2.elim_id);
      expect(updated[1].amount).toBe(toUpdateElimPfs[1].amount);
      expect(updated[1].position).toBe(testElimPf2.position);
      expect(updated[2].id).toBe(testElimPf3.id);
      expect(updated[2].elim_id).toBe(testElimPf3.elim_id);
      expect(updated[2].amount).toBe(toUpdateElimPfs[2].amount);
      expect(updated[2].position).toBe(testElimPf3.position);
      expect(updated[3].id).toBe(testElimPf4.id);
      expect(updated[3].elim_id).toBe(testElimPf4.elim_id);
      expect(updated[3].amount).toBe(toUpdateElimPfs[3].amount);
      expect(updated[3].position).toBe(testElimPf4.position);
      expect(updated[4].id).toBe(testElimPf5.id);
      expect(updated[4].elim_id).toBe(testElimPf5.elim_id);
      expect(updated[4].amount).toBe(toUpdateElimPfs[4].amount);
      expect(updated[4].position).toBe(testElimPf5.position);
      expect(updated[5].id).toBe(testElimPf6.id);
      expect(updated[5].elim_id).toBe(testElimPf6.elim_id);
      expect(updated[5].amount).toBe(toUpdateElimPfs[5].amount);
      expect(updated[5].position).toBe(testElimPf6.position);
      expect(updated[6].id).toBe(testElimPf7.id);
      expect(updated[6].elim_id).toBe(testElimPf7.elim_id);
      expect(updated[6].amount).toBe(toUpdateElimPfs[6].amount);
      expect(updated[6].position).toBe(testElimPf7.position);
      expect(updated[7].id).toBe(testElimPf8.id);
      expect(updated[7].elim_id).toBe(testElimPf8.elim_id);
      expect(updated[7].amount).toBe(toUpdateElimPfs[7].amount);
      expect(updated[7].position).toBe(testElimPf8.position);
    });
  });

});
