import { privateApi } from "@/lib/api/axios";
import { basePotPfsApi } from "@/lib/api/apiPaths";
import { testBasePotPfsApi } from "../../../testApi";
import type { potPfType } from "@/lib/types/types";
import { initPotPf } from "@/lib/db/initVals";
import {  
  extractPotPfs,
  getAllPotPfsForPot,
  updateAllPotPfsForPot,
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

const potUrl = url + "/pot/"; 

const notFoundId = "ppf_01234567890123456789012345678901";
const notFoundPotId = "pot_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

// values for prisma/seeds.ts
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

  const restorePotPfs = async () => {
    await privateApi.delete(potUrl + pmPotId);
    const pm1JSON = JSON.stringify(pmPotPf1);
    await privateApi.post(url, pm1JSON);
    const pm2JSON = JSON.stringify(pmPotPf2);
    await privateApi.post(url, pm2JSON);
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

  describe('getAllPotPfsForPot- get all potPfs for a pot', () => {

    beforeAll(async () => {
      await restorePotPfs();
    })
    
    it('should get all potPfs for a pot', async () => {
      const potPfs = await getAllPotPfsForPot(pmPotId);
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
    it('should return empty array when pot id is not found', async () => {
      const potPfs = await getAllPotPfsForPot(notFoundPotId);
      expect(potPfs).toEqual([]);      
    })
    it('should throw error when pot id is invalid', async () => {
      await expect(getAllPotPfsForPot("test")).rejects.toThrow("Invalid pot id");
    })
    it('should throw an error when pot id is valid but not a pot id', async () => {
      await expect(getAllPotPfsForPot(userId)).rejects.toThrow("Invalid pot id");
    })
    it('should throw an error when pot id is null', async () => {
      await expect(getAllPotPfsForPot(null as any)).rejects.toThrow("Invalid pot id");
    })
  });

  describe('updateAllPotPfsForPot - update all potPfs for a pot', () => {

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

    it('should update many potPfs for a pot - change amount', async () => {
      const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      pmPotPfs[0].amount = 350;
      pmPotPfs[1].amount = 250;

      const updated = await updateAllPotPfsForPot(pmPotId, pmPotPfs);
      putMany = true;
      expect(updated.length).toBe(pmPotPfs.length);
      expect(updated[0].id).toBe(pmPotPf1.id);
      expect(updated[0].pot_id).toBe(pmPotPf1.pot_id);
      expect(updated[0].position).toBe(pmPotPf1.position);
      expect(updated[0].amount).toBe(pmPotPfs[0].amount);
      expect(updated[1].id).toBe(pmPotPf2.id);
      expect(updated[1].pot_id).toBe(pmPotPf2.pot_id);
      expect(updated[1].position).toBe(pmPotPf2.position);
      expect(updated[1].amount).toBe(pmPotPfs[1].amount);
    });
    it('should update many potPfs for a pot - add row', async () => {
      const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      pmPotPfs.push({
        ...initPotPf,
        id: "ppf_ce55c52bd60d4943bb747590a03c9734",
        pot_id: pmPotId,
        position: 3,
        amount: 100,
      });
      
      const updated = await updateAllPotPfsForPot(pmPotId, pmPotPfs);
      putMany = true;
      expect(updated.length).toBe(pmPotPfs.length);
      expect(updated[0].id).toBe(pmPotPf1.id);
      expect(updated[0].pot_id).toBe(pmPotPf1.pot_id);
      expect(updated[0].position).toBe(pmPotPf1.position);
      expect(updated[0].amount).toBe(pmPotPfs[0].amount);
      expect(updated[1].id).toBe(pmPotPf2.id);
      expect(updated[1].pot_id).toBe(pmPotPf2.pot_id);
      expect(updated[1].position).toBe(pmPotPf2.position);
      expect(updated[1].amount).toBe(pmPotPfs[1].amount);
      expect(updated[2].id).toBe(pmPotPfs[2].id);
      expect(updated[2].pot_id).toBe(pmPotPfs[2].pot_id);
      expect(updated[2].position).toBe(pmPotPfs[2].position);
      expect(updated[2].amount).toBe(pmPotPfs[2].amount);
    });
    it('should update many potPfs for a pot - change amount and delete a row', async () => {
      const pmPotPfs = cloneDeep([pmPotPf1]);
      pmPotPfs[0].amount = 400;

      const updated = await updateAllPotPfsForPot(pmPotId, pmPotPfs);
      putMany = true;
      expect(updated.length).toBe(pmPotPfs.length);
      expect(updated[0].id).toBe(pmPotPf1.id);
      expect(updated[0].pot_id).toBe(pmPotPf1.pot_id);
      expect(updated[0].position).toBe(pmPotPf1.position);
      expect(updated[0].amount).toBe(pmPotPfs[0].amount);
    });
    it('should update many potPfs for a pot - sanitize amount', async () => {
      const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      pmPotPfs[0].amount = 350.351;

      const updated = await updateAllPotPfsForPot(pmPotId, pmPotPfs);
      putMany = true;
      expect(updated.length).toBe(pmPotPfs.length);
      expect(updated[0].id).toBe(pmPotPf1.id);
      expect(updated[0].pot_id).toBe(pmPotPf1.pot_id);
      expect(updated[0].position).toBe(pmPotPf1.position);
      expect(updated[0].amount).toBe(350.35);
      expect(updated[1].id).toBe(pmPotPf2.id);
      expect(updated[1].pot_id).toBe(pmPotPf2.pot_id);
      expect(updated[1].position).toBe(pmPotPf2.position);
      expect(updated[1].amount).toBe(pmPotPfs[1].amount);
    });
    it('should update many potPfs for a pot - empty pmPotPfs', async () => {
      const pmPotPfs: potPfType[] = [];

      const updated = await updateAllPotPfsForPot(pmPotId, pmPotPfs);
      putMany = true;
      expect(updated.length).toBe(pmPotPfs.length);
    });

    it('should not update many potPfs for a pot when passed invalid data', async () => {
      const invalid = 'test';
      await expect(updateAllPotPfsForPot(pmPotId, invalid as any)).rejects.toThrow('Invalid potPfs array');
    });

    it('should not update many potPfs for a pot when id is inavlid', async () => {
      const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      pmPotPfs[0].id = "invalid_id";
      await expect(updateAllPotPfsForPot(pmPotId, pmPotPfs)).rejects.toThrow('updateAllPotPfsForPot failed: Request failed with status code 422');
    });
    it('should not update many potPfs for a pot when id is missing', async () => { 
      const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      pmPotPfs[0].id = "";
      await expect(updateAllPotPfsForPot(pmPotId, pmPotPfs)).rejects.toThrow('updateAllPotPfsForPot failed: Request failed with status code 422');
    })
    it('should not update many potPfs for a pot when id is valid, but not a potPf id', async () => { 
      const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      pmPotPfs[0].id = userId;
      await expect(updateAllPotPfsForPot(pmPotId, pmPotPfs)).rejects.toThrow('updateAllPotPfsForPot failed: Request failed with status code 422');
    })

    it('should NOT update many potPfs for a pot when pot_id is not found', async () => {      
      const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      pmPotPfs[0].pot_id = notFoundPotId;
      pmPotPfs[1].pot_id = notFoundPotId;
      await expect(updateAllPotPfsForPot(notFoundPotId, pmPotPfs)).rejects.toThrow('updateAllPotPfsForPot failed: Request failed with status code 409');
    });
    it('should NOT update many potPfs for a pot when pot_id is invalid', async () => {      
      const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      await expect(updateAllPotPfsForPot("invalid_id", pmPotPfs)).rejects.toThrow('Invalid pot id');
    });
    it('should NOT update many potPfs for a pot when pot_id is valid, but not a pot id', async () => {      
      const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      pmPotPfs[0].pot_id = userId;
      pmPotPfs[1].pot_id = userId;
      await expect(updateAllPotPfsForPot(userId, pmPotPfs)).rejects.toThrow('Invalid pot id');      
    });
    it('should NOT update many potPfs for a pot when pot_ids are valid, but not all the same ', async () => {      
      const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      pmPotPfs[0].pot_id = 'pot_89fd8f787de942a1a92aaa2df3e7c185'; // valid and found (from seeds.ts)
      await expect(updateAllPotPfsForPot(pmPotId, pmPotPfs)).rejects.toThrow('updateAllPotPfsForPot failed: Request failed with status code 422');      
    });

    it('should NOT update many potPfs for a pot when position is too low', async () => {      
      const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      pmPotPfs[0].position = 0;
      await expect(updateAllPotPfsForPot(pmPotId, pmPotPfs)).rejects.toThrow('updateAllPotPfsForPot failed: Request failed with status code 422');
    });
    it('should NOT update many potPfs for a pot when position is too high', async () => {      
      const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      pmPotPfs[0].position = maxPosition + 1;
      await expect(updateAllPotPfsForPot(pmPotId, pmPotPfs)).rejects.toThrow('updateAllPotPfsForPot failed: Request failed with status code 422');
    });
    it('should NOT update many potPfs for a pot when position is not a number', async () => {      
      const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      pmPotPfs[0].position = 'invalid' as any;
      await expect(updateAllPotPfsForPot(pmPotId, pmPotPfs)).rejects.toThrow('updateAllPotPfsForPot failed: Request failed with status code 422');
    });
    it('should NOT update many potPfs for a pot when position is not an integer', async () => {      
      const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      pmPotPfs[0].position = 1.5;
      await expect(updateAllPotPfsForPot(pmPotId, pmPotPfs)).rejects.toThrow('updateAllPotPfsForPot failed: Request failed with status code 422');
    });
    it('should NOT update many potPfs for a pot when position is out of sequence', async () => {      
      const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      pmPotPfs[1].position = 3;
      await expect(updateAllPotPfsForPot(pmPotId, pmPotPfs)).rejects.toThrow('updateAllPotPfsForPot failed: Request failed with status code 422');
    });

    it('should NOT update many potPfs for a pot when amount is too low', async () => { 
      const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      pmPotPfs[0].amount = -1;
      await expect(updateAllPotPfsForPot(pmPotId, pmPotPfs)).rejects.toThrow('updateAllPotPfsForPot failed: Request failed with status code 422');
    });
    it('should NOT update many potPfs for a pot when amount is too high', async () => { 
      const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      pmPotPfs[0].amount = maxMoney + 1;
      await expect(updateAllPotPfsForPot(pmPotId, pmPotPfs)).rejects.toThrow('updateAllPotPfsForPot failed: Request failed with status code 422');
    });
    it('should NOT update many potPfs for a pot when amount is not a number', async () => { 
      const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      pmPotPfs[0].amount = 'invalid' as any;
      await expect(updateAllPotPfsForPot(pmPotId, pmPotPfs)).rejects.toThrow('updateAllPotPfsForPot failed: Request failed with status code 422');
    });
    it('should NOT update many potPfs for a pot when amount is missing', async () => { 
      const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
      pmPotPfs[0].amount = null as any;
      await expect(updateAllPotPfsForPot(pmPotId, pmPotPfs)).rejects.toThrow('updateAllPotPfsForPot failed: Request failed with status code 422');
    });
  });  

});
