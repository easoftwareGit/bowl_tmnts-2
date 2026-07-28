import { privateApi } from "@/lib/api/axios";
import { baseElimPfsApi } from "@/lib/api/apiPaths";
import { testBaseElimPfsApi } from "../../../testApi";
import type { elimPfType } from "@/lib/types/types";
import { initElimPf } from "@/lib/db/initVals";
import {  
  extractElimPfs,
  getAllElimPfsForElim,
  updateAllElimPfsForElim,
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

const elimUrl = url + "/elim/"; 

const notFoundId = "epf_01234567890123456789012345678901";
const notFoundElimId = "elm_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

// values for prisma/seeds.ts
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

  const restoreElimPfs = async () => {
    await privateApi.delete(elimUrl + pmElimId);
    const pm1JSON = JSON.stringify(pmElimPf1);
    await privateApi.post(url, pm1JSON);
    const pm2JSON = JSON.stringify(pmElimPf2);
    await privateApi.post(url, pm2JSON);
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

  describe('getAllElimPfsForElim- get all elimPfs for an elim', () => {

    beforeAll(async () => {
      await restoreElimPfs();
    })
    
    it('should get all elimPfs for an elim', async () => {
      const elimPfs = await getAllElimPfsForElim(pmElimId);
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
    it('should return empty array when elim id is not found', async () => {
      const elimPfs = await getAllElimPfsForElim(notFoundElimId);
      expect(elimPfs).toEqual([]);      
    })
    it('should throw error when elim id is invalid', async () => {
      await expect(getAllElimPfsForElim("test")).rejects.toThrow("Invalid elim id");
    })
    it('should throw an error when elim id is valid but not an elim id', async () => {
      await expect(getAllElimPfsForElim(userId)).rejects.toThrow("Invalid elim id");
    })
    it('should throw an error when elim id is null', async () => {
      await expect(getAllElimPfsForElim(null as any)).rejects.toThrow("Invalid elim id");
    })
  });

  describe('updateAllElimPfsForElim - update all elimPfs for an elim', () => {

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

    it('should update many elimPfs for an elim - change amount', async () => {
      const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      pmElimPfs[0].amount = 350;
      pmElimPfs[1].amount = 250;

      const updated = await updateAllElimPfsForElim(pmElimId, pmElimPfs);
      putMany = true;
      expect(updated.length).toBe(pmElimPfs.length);
      expect(updated[0].id).toBe(pmElimPf1.id);
      expect(updated[0].elim_id).toBe(pmElimPf1.elim_id);
      expect(updated[0].position).toBe(pmElimPf1.position);
      expect(updated[0].amount).toBe(pmElimPfs[0].amount);
      expect(updated[1].id).toBe(pmElimPf2.id);
      expect(updated[1].elim_id).toBe(pmElimPf2.elim_id);
      expect(updated[1].position).toBe(pmElimPf2.position);
      expect(updated[1].amount).toBe(pmElimPfs[1].amount);
    });
    it('should update many elimPfs for an elim - add row', async () => {
      const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      pmElimPfs.push({
        ...initElimPf,
        id: "epf_ce55c52bd60d4943bb747590a03c9734",
        elim_id: pmElimId,
        position: pmElimPfs.length + 1,
        amount: 10,
      });
      
      const updated = await updateAllElimPfsForElim(pmElimId, pmElimPfs);
      putMany = true;
      expect(updated.length).toBe(pmElimPfs.length);
      expect(updated[0].id).toBe(pmElimPf1.id);
      expect(updated[0].elim_id).toBe(pmElimPf1.elim_id);
      expect(updated[0].position).toBe(pmElimPf1.position);
      expect(updated[0].amount).toBe(pmElimPfs[0].amount);
      expect(updated[1].id).toBe(pmElimPf2.id);
      expect(updated[1].elim_id).toBe(pmElimPf2.elim_id);
      expect(updated[1].position).toBe(pmElimPf2.position);
      expect(updated[1].amount).toBe(pmElimPfs[1].amount);
      expect(updated[2].id).toBe(pmElimPfs[2].id);
      expect(updated[2].elim_id).toBe(pmElimPfs[2].elim_id);
      expect(updated[2].position).toBe(pmElimPfs[2].position);
      expect(updated[2].amount).toBe(pmElimPfs[2].amount);
    });
    it('should update many elimPfs for an elim - change amount and delete a row', async () => {
      const pmElimPfs = cloneDeep([pmElimPf1]);
      pmElimPfs[0].amount = 400;

      const updated = await updateAllElimPfsForElim(pmElimId, pmElimPfs);
      putMany = true;
      expect(updated.length).toBe(pmElimPfs.length);
      expect(updated[0].id).toBe(pmElimPf1.id);
      expect(updated[0].elim_id).toBe(pmElimPf1.elim_id);
      expect(updated[0].position).toBe(pmElimPf1.position);
      expect(updated[0].amount).toBe(pmElimPfs[0].amount);
    });
    it('should update many elimPfs for an elim - sanitize amount', async () => {
      const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      pmElimPfs[0].amount = 350.351;

      const updated = await updateAllElimPfsForElim(pmElimId, pmElimPfs);
      putMany = true;
      expect(updated.length).toBe(pmElimPfs.length);
      expect(updated[0].id).toBe(pmElimPf1.id);
      expect(updated[0].elim_id).toBe(pmElimPf1.elim_id);
      expect(updated[0].position).toBe(pmElimPf1.position);
      expect(updated[0].amount).toBe(350.35);
      expect(updated[1].id).toBe(pmElimPf2.id);
      expect(updated[1].elim_id).toBe(pmElimPf2.elim_id);
      expect(updated[1].position).toBe(pmElimPf2.position);
      expect(updated[1].amount).toBe(pmElimPfs[1].amount);
    });
    it('should update many elimPfs for an elim - empty pmElimPfs', async () => {
      const pmElimPfs: elimPfType[] = [];

      const updated = await updateAllElimPfsForElim(pmElimId, pmElimPfs);
      putMany = true;
      expect(updated.length).toBe(pmElimPfs.length);
    });

    it('should not update many elimPfs for an elim when passed invalid data', async () => {
      const invalid = 'test';
      await expect(updateAllElimPfsForElim(pmElimId, invalid as any)).rejects.toThrow('Invalid elimPfs array');
    });

    it('should not update many elimPfs for an elim when id is inavlid', async () => {
      const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      pmElimPfs[0].id = "invalid_id";
      await expect(updateAllElimPfsForElim(pmElimId, pmElimPfs)).rejects.toThrow('updateAllElimPfsForElim failed: Request failed with status code 422');
    });
    it('should not update many elimPfs for an elim when id is missing', async () => { 
      const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      pmElimPfs[0].id = "";
      await expect(updateAllElimPfsForElim(pmElimId, pmElimPfs)).rejects.toThrow('updateAllElimPfsForElim failed: Request failed with status code 422');
    })
    it('should not update many elimPfs for an elim when id is valid, but not a elimPf id', async () => { 
      const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      pmElimPfs[0].id = userId;
      await expect(updateAllElimPfsForElim(pmElimId, pmElimPfs)).rejects.toThrow('updateAllElimPfsForElim failed: Request failed with status code 422');
    })

    it('should NOT update many elimPfs for an elim when elim_id is not found', async () => {      
      const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      pmElimPfs[0].elim_id = notFoundElimId;
      pmElimPfs[1].elim_id = notFoundElimId;
      await expect(updateAllElimPfsForElim(notFoundElimId, pmElimPfs)).rejects.toThrow('updateAllElimPfsForElim failed: Request failed with status code 409');
    });
    it('should NOT update many elimPfs for an elim when elim_id is invalid', async () => {      
      const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      await expect(updateAllElimPfsForElim("invalid_id", pmElimPfs)).rejects.toThrow('Invalid elim id');
    });
    it('should NOT update many elimPfs for an elim when elim_id is valid, but not an elim id', async () => {      
      const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      pmElimPfs[0].elim_id = userId;
      pmElimPfs[1].elim_id = userId;
      await expect(updateAllElimPfsForElim(userId, pmElimPfs)).rejects.toThrow('Invalid elim id');      
    });
    it('should NOT update many elimPfs for an elim when elim_ids are valid, but not all the same ', async () => {      
      const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      pmElimPfs[0].elim_id = 'elm_c47a4ec07f824b0e93169ae78e8b4b1e'; // valid and found (from seeds.ts)
      await expect(updateAllElimPfsForElim(pmElimId, pmElimPfs)).rejects.toThrow('updateAllElimPfsForElim failed: Request failed with status code 422');      
    });

    it('should NOT update many elimPfs for an elim when position is too low', async () => {      
      const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      pmElimPfs[0].position = 0;
      await expect(updateAllElimPfsForElim(pmElimId, pmElimPfs)).rejects.toThrow('updateAllElimPfsForElim failed: Request failed with status code 422');
    });
    it('should NOT update many elimPfs for an elim when position is too high', async () => {      
      const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      pmElimPfs[0].position = maxPosition + 1;
      await expect(updateAllElimPfsForElim(pmElimId, pmElimPfs)).rejects.toThrow('updateAllElimPfsForElim failed: Request failed with status code 422');
    });
    it('should NOT update many elimPfs for an elim when position is not a number', async () => {      
      const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      pmElimPfs[0].position = 'invalid' as any;
      await expect(updateAllElimPfsForElim(pmElimId, pmElimPfs)).rejects.toThrow('updateAllElimPfsForElim failed: Request failed with status code 422');
    });
    it('should NOT update many elimPfs for an elim when position is not an integer', async () => {      
      const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      pmElimPfs[0].position = 1.5;
      await expect(updateAllElimPfsForElim(pmElimId, pmElimPfs)).rejects.toThrow('updateAllElimPfsForElim failed: Request failed with status code 422');
    });
    it('should NOT update many elimPfs for an elim when position is out of sequence', async () => {      
      const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      pmElimPfs[1].position = 3;
      await expect(updateAllElimPfsForElim(pmElimId, pmElimPfs)).rejects.toThrow('updateAllElimPfsForElim failed: Request failed with status code 422');
    });

    it('should NOT update many elimPfs for an elim when amount is too low', async () => { 
      const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      pmElimPfs[0].amount = -1;
      await expect(updateAllElimPfsForElim(pmElimId, pmElimPfs)).rejects.toThrow('updateAllElimPfsForElim failed: Request failed with status code 422');
    });
    it('should NOT update many elimPfs for an elim when amount is too high', async () => { 
      const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      pmElimPfs[0].amount = maxMoney + 1;
      await expect(updateAllElimPfsForElim(pmElimId, pmElimPfs)).rejects.toThrow('updateAllElimPfsForElim failed: Request failed with status code 422');
    });
    it('should NOT update many elimPfs for an elim when amount is not a number', async () => { 
      const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      pmElimPfs[0].amount = 'invalid' as any;
      await expect(updateAllElimPfsForElim(pmElimId, pmElimPfs)).rejects.toThrow('updateAllElimPfsForElim failed: Request failed with status code 422');
    });
    it('should NOT update many elimPfs for an elim when amount is missing', async () => { 
      const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
      pmElimPfs[0].amount = null as any;
      await expect(updateAllElimPfsForElim(pmElimId, pmElimPfs)).rejects.toThrow('updateAllElimPfsForElim failed: Request failed with status code 422');
    });
  });  

});
