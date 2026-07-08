import { privateApi } from "@/lib/api/axios";
import { baseDivPfsApi } from "@/lib/api/apiPaths";
import { testBaseDivPfsApi } from "../../../testApi";
import type { divPfType } from "@/lib/types/types";
import { initDivPf } from "@/lib/db/initVals";
import {  
  extractDivPfs,
  getAllDivPfsForDiv,
  updateAllDivPfsForDiv,
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

const divUrl = url + "/div/"; 

const notFoundId = "dpf_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

// values for prisma/seeds.ts
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

  const restoreDivPfs = async () => {
    await privateApi.delete(divUrl + pmDivId);      
    const pm1JSON = JSON.stringify(pmDivPf1);
    await privateApi.post(url, pm1JSON);
    const pm2JSON = JSON.stringify(pmDivPf2);
    await privateApi.post(url, pm2JSON);
  }

  // describe('extractDivPfs', () => { 
  //   it('should extract divPfs from a div', () => {
  //     const rawDivPfs = [
  //       {
  //         id: "dpf_01234567890123456789012345678901",
  //         div_id: "div_01234567890123456789012345678901",
  //         position: "1",
  //         amount: "1234.56",
  //       },
  //       {
  //         id: "dpf_01234567890123456789012345678902",
  //         div_id: "div_01234567890123456789012345678901",
  //         position: "2",
  //         amount: "234.56",
  //       },
  //     ]
  //     const divPfs = extractDivPfs(rawDivPfs);
  //     expect(divPfs.length).toBe(rawDivPfs.length);
  //     expect(divPfs[0].id).toBe("dpf_01234567890123456789012345678901");
  //     expect(divPfs[0].div_id).toBe("div_01234567890123456789012345678901");
  //     expect(divPfs[0].position).toBe(1);
  //     expect(divPfs[0].amount).toBe(1234.56);
  //     expect(divPfs[1].id).toBe("dpf_01234567890123456789012345678902");
  //     expect(divPfs[1].div_id).toBe("div_01234567890123456789012345678901");
  //     expect(divPfs[1].position).toBe(2);
  //     expect(divPfs[1].amount).toBe(234.56);
  //   });
  //   it('should return empty array if no divPfs', () => {
  //     const divPfs = extractDivPfs([]);
  //     expect(divPfs).toEqual([]);
  //   });
  //   it('should return empty array if divPfs is null', () => {
  //     const divPfs = extractDivPfs(null as any);
  //     expect(divPfs).toEqual([]); 
  //   })
  //   it('should return empty array if divPfs is not an array', () => {
  //     const divPfs = extractDivPfs({} as any);
  //     expect(divPfs).toEqual([]);
  //   })
  // })

  // describe('getAllDivPfsForDiv- get all divPfs for a div', () => { 

  //   beforeAll(async () => {
  //     await restoreDivPfs();
  //   })
    
  //   it('should get all divPfs for a div', async () => {
  //     const divPfs = await getAllDivPfsForDiv(pmDivId);
  //     expect(divPfs.length).toBe(2);
  //     expect(divPfs[0].id).toBe(pmDivPf1.id);
  //     expect(divPfs[0].div_id).toBe(pmDivPf1.div_id);
  //     expect(divPfs[0].position).toBe(pmDivPf1.position);
  //     expect(divPfs[0].amount).toBe(pmDivPf1.amount);
  //     expect(divPfs[1].id).toBe(pmDivPf2.id);
  //     expect(divPfs[1].div_id).toBe(pmDivPf2.div_id);
  //     expect(divPfs[1].position).toBe(pmDivPf2.position);
  //     expect(divPfs[1].amount).toBe(pmDivPf2.amount);
  //   })
  //   it('should return empty array when div id is not found', async () => {
  //     const divPfs = await getAllDivPfsForDiv(notFoundDivId);
  //     expect(divPfs).toEqual([]);      
  //   })
  //   it('should throw error when div id is invalid', async () => {
  //     await expect(getAllDivPfsForDiv("test")).rejects.toThrow("Invalid div id");
  //   })
  //   it('should throw an error when div id is valid but not a div id', async () => {
  //     await expect(getAllDivPfsForDiv(userId)).rejects.toThrow("Invalid div id");
  //   })
  //   it('should throw an error when div id is null', async () => {
  //     await expect(getAllDivPfsForDiv(null as any)).rejects.toThrow("Invalid div id");
  //   })
  // })

  describe('updateAllDivPfsForDiv - update all divPfs for a div', () => {

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

    it('should update many divPfs for a div - change amount', async () => {
      const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      pmDivPfs[0].amount = 350;
      pmDivPfs[1].amount = 250;

      const updated = await updateAllDivPfsForDiv(pmDivId, pmDivPfs);
      putMany = true;
      expect(updated.length).toBe(pmDivPfs.length);
      expect(updated[0].id).toBe(pmDivPf1.id);
      expect(updated[0].div_id).toBe(pmDivPf1.div_id);
      expect(updated[0].position).toBe(pmDivPf1.position);
      expect(updated[0].amount).toBe(pmDivPfs[0].amount);
      expect(updated[1].id).toBe(pmDivPf2.id);
      expect(updated[1].div_id).toBe(pmDivPf2.div_id);
      expect(updated[1].position).toBe(pmDivPf2.position);
      expect(updated[1].amount).toBe(pmDivPfs[1].amount);
    });
    it('should update many divPfs for a div - add row', async () => {
      const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      pmDivPfs.push({
        ...initDivPf,
        id: "dpf_ce55c52bd60d4943bb747590a03c9734",
        div_id: pmDivId,
        position: 3,
        amount: 100,
      });
      
      const updated = await updateAllDivPfsForDiv(pmDivId, pmDivPfs);
      putMany = true;
      expect(updated.length).toBe(pmDivPfs.length);
      expect(updated[0].id).toBe(pmDivPf1.id);
      expect(updated[0].div_id).toBe(pmDivPf1.div_id);
      expect(updated[0].position).toBe(pmDivPf1.position);
      expect(updated[0].amount).toBe(pmDivPfs[0].amount);
      expect(updated[1].id).toBe(pmDivPf2.id);
      expect(updated[1].div_id).toBe(pmDivPf2.div_id);
      expect(updated[1].position).toBe(pmDivPf2.position);
      expect(updated[1].amount).toBe(pmDivPfs[1].amount);
      expect(updated[2].id).toBe(pmDivPfs[2].id);
      expect(updated[2].div_id).toBe(pmDivPfs[2].div_id);
      expect(updated[2].position).toBe(pmDivPfs[2].position);
      expect(updated[2].amount).toBe(pmDivPfs[2].amount);
    });
    it('should update many divPfs for a div - change amount and delete a row', async () => {
      const pmDivPfs = cloneDeep([pmDivPf1]);
      pmDivPfs[0].amount = 400;

      const updated = await updateAllDivPfsForDiv(pmDivId, pmDivPfs);
      putMany = true;
      expect(updated.length).toBe(pmDivPfs.length);
      expect(updated[0].id).toBe(pmDivPf1.id);
      expect(updated[0].div_id).toBe(pmDivPf1.div_id);
      expect(updated[0].position).toBe(pmDivPf1.position);
      expect(updated[0].amount).toBe(pmDivPfs[0].amount);
    });
    it('should update many divPfs for a div - sanitize amount', async () => {
      const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      pmDivPfs[0].amount = 350.351;

      const updated = await updateAllDivPfsForDiv(pmDivId, pmDivPfs);
      putMany = true;
      expect(updated.length).toBe(pmDivPfs.length);
      expect(updated[0].id).toBe(pmDivPf1.id);
      expect(updated[0].div_id).toBe(pmDivPf1.div_id);
      expect(updated[0].position).toBe(pmDivPf1.position);
      expect(updated[0].amount).toBe(350.35);
      expect(updated[1].id).toBe(pmDivPf2.id);
      expect(updated[1].div_id).toBe(pmDivPf2.div_id);
      expect(updated[1].position).toBe(pmDivPf2.position);
      expect(updated[1].amount).toBe(pmDivPfs[1].amount);
    });
    it('should update many divPfs for a div - empty pmDivPfs', async () => {
      const pmDivPfs: divPfType[] = [];

      const updated = await updateAllDivPfsForDiv(pmDivId, pmDivPfs);
      putMany = true;
      expect(updated.length).toBe(pmDivPfs.length);
    });

    it('should not update many divPfs for a div whne passed invalid data', async () => {
      const invalid = 'test';
      await expect(updateAllDivPfsForDiv(pmDivId, invalid as any)).rejects.toThrow('Invalid divPfs array');
    });

    it('should not update many divPfs for a div when id is inavlid', async () => {
      const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      pmDivPfs[0].id = "invalid_id";
      await expect(updateAllDivPfsForDiv(pmDivId, pmDivPfs)).rejects.toThrow('updateAllDivPfsForDiv failed: Request failed with status code 422');
    });
    it('should not update many divPfs for a div when id is missing', async () => { 
      const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      pmDivPfs[0].id = "";
      await expect(updateAllDivPfsForDiv(pmDivId, pmDivPfs)).rejects.toThrow('updateAllDivPfsForDiv failed: Request failed with status code 422');
    })
    it('should not update many divPfs for a div when id is valid, but not a divPf id', async () => { 
      const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      pmDivPfs[0].id = userId;
      await expect(updateAllDivPfsForDiv(pmDivId, pmDivPfs)).rejects.toThrow('updateAllDivPfsForDiv failed: Request failed with status code 422');
    })

    it('should NOT update many divPfs for a div when div_id is not found', async () => {      
      const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      pmDivPfs[0].div_id = notFoundDivId;
      pmDivPfs[1].div_id = notFoundDivId;
      await expect(updateAllDivPfsForDiv(notFoundDivId, pmDivPfs)).rejects.toThrow('updateAllDivPfsForDiv failed: Request failed with status code 409');
    });
    it('should NOT update many divPfs for a div when div_id is invalid', async () => {      
      const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      await expect(updateAllDivPfsForDiv("invalid_id", pmDivPfs)).rejects.toThrow('Invalid div id');
    });
    it('should NOT update many divPfs for a div when div_id is valid, but not a div id', async () => {      
      const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      pmDivPfs[0].div_id = userId;
      pmDivPfs[1].div_id = userId;
      await expect(updateAllDivPfsForDiv(userId, pmDivPfs)).rejects.toThrow('Invalid div id');      
    });
    it('should NOT update many divPfs for a div when div_ids are valid, but not all the same ', async () => {      
      const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      pmDivPfs[0].div_id = 'div_99a3cae28786485bb7a036935f0f6a0a'; // valid and found (from seeds.ts)
      await expect(updateAllDivPfsForDiv(pmDivId, pmDivPfs)).rejects.toThrow('updateAllDivPfsForDiv failed: Request failed with status code 422');      
    });

    it('should NOT update many divPfs for a div when position is too low', async () => {      
      const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      pmDivPfs[0].position = 0;
      await expect(updateAllDivPfsForDiv(pmDivId, pmDivPfs)).rejects.toThrow('updateAllDivPfsForDiv failed: Request failed with status code 422');
    });
    it('should NOT update many divPfs for a div when position is too high', async () => {      
      const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      pmDivPfs[0].position = maxPosition + 1;
      await expect(updateAllDivPfsForDiv(pmDivId, pmDivPfs)).rejects.toThrow('updateAllDivPfsForDiv failed: Request failed with status code 422');
    });
    it('should NOT update many divPfs for a div when position is not a number', async () => {      
      const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      pmDivPfs[0].position = 'invalid' as any;
      await expect(updateAllDivPfsForDiv(pmDivId, pmDivPfs)).rejects.toThrow('updateAllDivPfsForDiv failed: Request failed with status code 422');
    });
    it('should NOT update many divPfs for a div when position is not an integer', async () => {      
      const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      pmDivPfs[0].position = 1.5;
      await expect(updateAllDivPfsForDiv(pmDivId, pmDivPfs)).rejects.toThrow('updateAllDivPfsForDiv failed: Request failed with status code 422');
    });
    it('should NOT update many divPfs for a div when position is out of sequence', async () => {      
      const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      pmDivPfs[1].position = 3;
      await expect(updateAllDivPfsForDiv(pmDivId, pmDivPfs)).rejects.toThrow('updateAllDivPfsForDiv failed: Request failed with status code 422');
    });

    it('should NOT update many divPfs for a div when amount is too low', async () => { 
      const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      pmDivPfs[0].amount = -1;
      await expect(updateAllDivPfsForDiv(pmDivId, pmDivPfs)).rejects.toThrow('updateAllDivPfsForDiv failed: Request failed with status code 422');
    });
    it('should NOT update many divPfs for a div when amount is too high', async () => { 
      const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      pmDivPfs[0].amount = maxMoney + 1;
      await expect(updateAllDivPfsForDiv(pmDivId, pmDivPfs)).rejects.toThrow('updateAllDivPfsForDiv failed: Request failed with status code 422');
    });
    it('should NOT update many divPfs for a div when amount is not a number', async () => { 
      const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      pmDivPfs[0].amount = 'invalid' as any;
      await expect(updateAllDivPfsForDiv(pmDivId, pmDivPfs)).rejects.toThrow('updateAllDivPfsForDiv failed: Request failed with status code 422');
    });
    it('should NOT update many divPfs for a div when amount is missing', async () => { 
      const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
      pmDivPfs[0].amount = null as any;
      await expect(updateAllDivPfsForDiv(pmDivId, pmDivPfs)).rejects.toThrow('updateAllDivPfsForDiv failed: Request failed with status code 422');
    });
  });  
})