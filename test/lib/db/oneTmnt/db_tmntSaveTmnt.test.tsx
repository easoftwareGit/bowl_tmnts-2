import axios, { AxiosError } from "axios";
import { baseTmntsApi } from "@/lib/db/apiPaths";
import { testBaseTmntsApi } from "../../../testApi";
import { tmntSaveTmnt } from "@/lib/db/oneTmnt/oneTmnt";
import { mockTmnt } from "../../../mocks/tmnts/newTmnt/mockNewTmnt";
import { blankTmnt, initTmnt } from "@/lib/db/initVals";
import { tmntType } from "@/lib/types/types";
import { deleteTmnt, putTmnt } from "@/lib/db/tmnts/tmntsAxios";
import { btDbUuid } from "@/lib/uuid";
import { compareAsc } from "date-fns";
import { startOfDayFromString } from "@/lib/dateTools";

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

describe("save just tmnt data", () => { 

  const url = testBaseTmntsApi.startsWith("undefined")
    ? baseTmntsApi
    : testBaseTmntsApi;

  const userId = 'usr_5bcefb5d314fff1ff5da6521a2fa7bde';
  
  describe("new tournament", () => {
    const origTmnt = { ...blankTmnt };    
    let createdTmnt = false;
  
    const delTestTmnt = async () => {
      try {
        const response = await axios.get(url);
        const tmnts = response.data.tmnts;
        const toDel = tmnts.find(
          (t: tmntType) => t.tmnt_name === mockTmnt.tmnt_name
        );
        if (toDel) {
          await deleteTmnt(toDel.id);
        }
      } catch (error) {
        if (error instanceof AxiosError) console.log(error.message);
      }
    };
  
    beforeAll(async () => {
      await delTestTmnt();
    });
  
    beforeEach(() => {
      createdTmnt = false;
    });
  
    afterEach(async () => {
      if (createdTmnt) {
        await delTestTmnt();
      }
    });

    it("should post the tournament", async () => {          
      const newTmnt = {
        ...mockTmnt,
        id: btDbUuid("tmt"),        
        user_id: userId
      };      

      const result = await tmntSaveTmnt(origTmnt, newTmnt); 
      expect(result).not.toBeNull();
      createdTmnt = true;
      const postedTmnt = result as tmntType;
      expect(postedTmnt.id).toBe(newTmnt.id);
      expect(postedTmnt.tmnt_name).toBe(newTmnt.tmnt_name);
      expect(postedTmnt.user_id).toBe(newTmnt.user_id);
      expect(postedTmnt.bowl_id).toBe(newTmnt.bowl_id);
      const postedStartDate = new Date(postedTmnt.start_date);
      const postedEndDate = new Date(postedTmnt.end_date);
      expect(compareAsc(postedStartDate, newTmnt.start_date)).toBe(0);
      expect(compareAsc(postedEndDate, newTmnt.end_date)).toBe(0);

      const allTmntsResponse = await axios.get(url);
      const allTmnts = allTmntsResponse.data.tmnts;
      // 10 tmnts in prisma/seeds.ts
      expect(allTmnts.length).toBe(11); // created, not updated
    });

    it("should return false when tmnt data is invalid", async () => {
      const newTmnt = {
        ...mockTmnt,
        id: btDbUuid("tmt"),
        tmnt_name: "",
      };
      const result = await tmntSaveTmnt(origTmnt, newTmnt);      
      expect(result).toBeNull();
    });
  });

  describe("edited tournament", () => {
    // from prisma/seeds.ts
    const resetTmnt = {
      ...initTmnt,
      id: "tmt_fd99387c33d9c78aba290286576ddce5",
      user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
      tmnt_name: "Gold Pin",
      bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
      start_date: startOfDayFromString("2022-10-23") as Date,
      end_date: startOfDayFromString("2022-10-23") as Date,
    };

    const origTmnt = {
      ...initTmnt,      
      id: "tmt_fd99387c33d9c78aba290286576ddce5",
      user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
      tmnt_name: "Some Name",
      bowl_id: "bwl_8b4a5c35ad1247049532ff53a12def0a",
      start_date: startOfDayFromString("2022-09-23") as Date,
      end_date: startOfDayFromString("2022-09-23") as Date,
    };     

    let putted = false;

    const doResetTmnt = async () => {
      await putTmnt(resetTmnt);
    };

    beforeAll(async () => { 
      await doResetTmnt();      
    })

    beforeEach(() => {
      putted = false;
    });

    afterEach(async () => {
      if (putted) {
        await doResetTmnt();
      }
    });    

    it("should call tmntPutTmnt and return true when data is valid", async () => {
      const toPutTmnt = {
        ...resetTmnt,
        tmnt_name: "Test Tournament",
        bowl_id: "bwl_8b4a5c35ad1247049532ff53a12def0a",
        start_date: startOfDayFromString("2021-09-22") as Date,
        end_date: startOfDayFromString("2021-09-22") as Date,
      };      
      const result = await tmntSaveTmnt(origTmnt, toPutTmnt);
      expect(result).not.toBeNull();
      putted = true;
      const postedTmnt = result as tmntType;
      expect(postedTmnt.id).toBe(toPutTmnt.id);
      expect(postedTmnt.tmnt_name).toBe(toPutTmnt.tmnt_name);
      expect(postedTmnt.user_id).toBe(toPutTmnt.user_id);
      expect(postedTmnt.bowl_id).toBe(toPutTmnt.bowl_id);
      const postedStartDate = new Date(postedTmnt.start_date);
      const postedEndDate = new Date(postedTmnt.end_date);
      expect(compareAsc(postedStartDate, toPutTmnt.start_date)).toBe(0);
      expect(compareAsc(postedEndDate, toPutTmnt.end_date)).toBe(0);

      const allTmntsResponse = await axios.get(url);
      const allTmnts = allTmntsResponse.data.tmnts;
      // 10 tmnts in prisma/seeds.ts
      expect(allTmnts.length).toBe(10); // updated, not created      
    });

    it("should return false when data is invalid", async () => {
      const invalidTmnt = {
        ...resetTmnt,
        tmnt_name: "",
      };
      const result = await tmntSaveTmnt(origTmnt, invalidTmnt);      
      expect(result).toBeNull();
    });
  });  

  describe('unedited tournament', () => {
    const putTmnt = {
      ...initTmnt,
      id: "tmt_fd99387c33d9c78aba290286576ddce5",
      user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
      tmnt_name: "Gold Pin",
      bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
      start_date: startOfDayFromString("2022-10-23") as Date,
      end_date: startOfDayFromString("2022-10-23") as Date,
    };
    const origTmnt = {
      ...putTmnt,      
    }
    
    it('should return tmnt for unedited tournament', async () => { 
      const result = await tmntSaveTmnt(origTmnt, putTmnt);
      expect(result).not.toBeNull();
      const postedTmnt = result as tmntType;
    })
  })

})