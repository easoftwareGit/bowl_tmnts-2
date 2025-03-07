import axios, { AxiosError } from "axios";
import { baseTmntsApi } from "@/lib/db/apiPaths";
import { testBaseTmntsApi } from "../../../testApi";
import { dataOneTmntType, allDataOneTmntType, ioDataError, tmntType } from "@/lib/types/types";
import { blankDataOneTmnt, initTmnt } from "@/lib/db/initVals";
import { deleteTmnt, getTmnt, getTmnts, getTmntYears, getUserTmnts, postTmnt, putTmnt, exportedForTesting, getAllDataForTmnt, deleteAllDataForTmnt } from "@/lib/db/tmnts/dbTmnts";
import { compareAsc } from "date-fns";
import { removeTimeFromISODateStr, todayStr } from "@/lib/dateTools";
import { mockTmnt, mockEvents, mockDivs, mockSquads, mockLanes, mockPots, mockBrkts, mockElims } from "../../../mocks/tmnts/newTmnt/mockNewTmnt";
import { saveAllDataOneTmnt } from "@/lib/db/oneTmnt/dbOneTmnt";
import { deleteAllTmntElims } from "@/lib/db/elims/dbElims";
import { deleteAllTmntBrkts } from "@/lib/db/brkts/dbBrkts";
import { deleteAllTmntPots } from "@/lib/db/pots/dbPots";
import { deleteAllTmntLanes } from "@/lib/db/lanes/dbLanes";
import { deleteAllTmntSquads } from "@/lib/db/squads/dbSquads";
import { deleteAllTmntDivs } from "@/lib/db/divs/dbDivs";
import { deleteAllTmntEvents } from "@/lib/db/events/dbEvents";
import { cloneDeep } from "lodash";
const { getTmntsForYear, getUpcomingTmnts } = exportedForTesting;

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

const url = testBaseTmntsApi.startsWith("undefined")
  ? baseTmntsApi
  : testBaseTmntsApi;
const oneTmntUrl = url + "/tmnt/";

const notFoundId = "tmt_00000000000000000000000000000000";
const user1Id = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
const notFoundUserId = "usr_00000000000000000000000000000000";
  
describe("dbTmnts", () => {  

  describe('getTmnt', () => {    
    // from prisma/seeds.ts
    const tmntToGet = {
      ...initTmnt,
      id: "tmt_fd99387c33d9c78aba290286576ddce5",
      user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
      tmnt_name: "Gold Pin",
      bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
      start_date_str: '2022-10-23',
      end_date_str: '2022-10-23', 
    };

    it('should get a single tmnt', async () => {
      const gotTmnt = await getTmnt(tmntToGet.id);
      expect(gotTmnt).not.toBeNull();
      if (!gotTmnt) return;
      expect(gotTmnt.id).toBe(tmntToGet.id);
      expect(gotTmnt.user_id).toBe(tmntToGet.user_id);
      expect(gotTmnt.tmnt_name).toBe(tmntToGet.tmnt_name);
      expect(gotTmnt.bowl_id).toBe(tmntToGet.bowl_id);
      expect(gotTmnt.start_date_str).toBe(tmntToGet.start_date_str);
      expect(gotTmnt.end_date_str).toBe(tmntToGet.end_date_str);
      expect(gotTmnt.bowls).not.toBeNull();
    })
    it('should not get a tmnt that does not exist', async () => { 
      const gotTmnt = await getTmnt(notFoundId);
      expect(gotTmnt).toBeNull();      
    })
    it('should not get a tmnt when tmnt id is not valid', async () => { 
      const gotTmnt = await getTmnt("test");
      expect(gotTmnt).toBeNull();
    })
    it('should not get a tmnt when tmnt id is valid, but not a tmnt id', async () => { 
      const gotTmnt = await getTmnt(user1Id);
      expect(gotTmnt).toBeNull();
    })
  })

  describe('getUserTmnts', () => {    
    it("should get user's tmnts", async () => { 
      const userTmnts = await getUserTmnts(user1Id);
      // 10 tmnt rows for user in prisma/seed.ts
      expect(userTmnts).toHaveLength(10);     
      if (!userTmnts) return;   
      expect(userTmnts[0].user_id).toBe(user1Id);
      expect(userTmnts[8].user_id).toBe(user1Id);
      // tmnts sorted by date, newest to oldest
      expect(userTmnts[0].id).toBe('tmt_e134ac14c5234d708d26037ae812ac33')
      expect(userTmnts[0].start_date_str).toBe('2025-08-19')
      expect(userTmnts[1].id).toBe('tmt_2d494e9bb51f4b9abba428c3f37131c9')
      expect(userTmnts[1].start_date_str).toBe('2024-12-20')
      expect(userTmnts[2].id).toBe('tmt_a237a388a8fc4641a2e37233f1d6bebd')
      expect(userTmnts[2].start_date_str).toBe('2024-12-01')
      expect(userTmnts[3].id).toBe('tmt_d237a388a8fc4641a2e37233f1d6bebd')
      expect(userTmnts[3].start_date_str).toBe('2024-07-01')
      expect(userTmnts[4].id).toBe('tmt_9a34a65584f94f548f5ce3b3becbca19')
      expect(userTmnts[4].start_date_str).toBe('2024-01-05')
      expect(userTmnts[5].id).toBe('tmt_fe8ac53dad0f400abe6354210a8f4cd1')
      expect(userTmnts[5].start_date_str).toBe('2023-12-31')
      expect(userTmnts[6].id).toBe('tmt_718fe20f53dd4e539692c6c64f991bbe')
      expect(userTmnts[6].start_date_str).toBe('2023-12-20')
      expect(userTmnts[7].id).toBe('tmt_467e51d71659d2e412cbc64a0d19ecb4')
      expect(userTmnts[7].start_date_str).toBe('2023-09-16')
      expect(userTmnts[8].id).toBe('tmt_a78f073789cc0f8a9a0de8c6e273eab1')
      expect(userTmnts[8].start_date_str).toBe('2023-01-02')
      expect(userTmnts[9].id).toBe('tmt_fd99387c33d9c78aba290286576ddce5')
      expect(userTmnts[9].start_date_str).toBe('2022-10-23')

      expect(userTmnts[0].bowls).not.toBeNull();
    })
    it('should not get user tmnts when user id is not valid', async () => { 
      const userTmnts = await getUserTmnts("test");
      expect(userTmnts).toHaveLength(0);
    })
    it('should not get user tmnts when user id is valid, but not a user id', async () => { 
      const userTmnts = await getUserTmnts(notFoundId); // tmnt id
      expect(userTmnts).toHaveLength(0);
    })
    it('should not get user tmnts when user has no tmnts', async () => {
      const userTmnts = await getUserTmnts(notFoundUserId);
      expect(userTmnts).toHaveLength(0);
    })
  })

  describe('getTmntYears', () => { 
    it('should get list tmnt years', async () => {
      const years = await getTmntYears();
      expect(years).not.toBeNull();
      if (!years) return;
      expect(years.length).toBeGreaterThan(1);
      for (let i = 0; i < years.length -1; i++) {
        expect(Number(years[i].year)).toBeGreaterThan(Number(years[i+1].year));
      }
    })
  })

  describe('get upcoming tmnts', () => {
    it('should get all upcoming tmnts - getUpcomingTmnts() ', async () => {
      const tmnts = await getUpcomingTmnts() 
      expect(tmnts).not.toBeNull();
      if (!tmnts) return;
      // 1 rows for results in prisma/seed.ts
      expect(tmnts).toHaveLength(1);
      expect(tmnts[0].bowls).not.toBeNull(); 
      expect(tmnts[0].start_date_str).toBe('2025-08-19')
    })
    it('should get all upcoming tmnts - getTmnts()', async () => {
      const tmnts = await getTmnts('') // get upcoming tmnts
      expect(tmnts).not.toBeNull();
      if (!tmnts) return;
      // 1 rows for results in prisma/seed.ts
      expect(tmnts).toHaveLength(1);
      expect(tmnts[0].bowls).not.toBeNull();
      expect(tmnts[0].start_date_str).toBe('2025-08-19')
    })
  })

  describe('get tmnt results for a year', () => {    
    it('should get tmnt results for year 2023 - getTmntsForYear()', async () => { 
      const tmnts = await getTmntsForYear('2023');
      expect(tmnts).not.toBeNull();
      if (!tmnts) return;
      // 5 rows for 2023 tmnts in prisma/seed.ts
      expect(tmnts).toHaveLength(5);
      expect(tmnts[0].bowls).not.toBeNull();
      expect(tmnts[0].start_date_str).toBe('2023-12-31')
    })
    it('should get tmnt results for year 2023 - getTmnts()', async () => { 
      const tmnts = await getTmnts('2023');
      expect(tmnts).not.toBeNull();
      if (!tmnts) return;
      // 5 rows for 2023 tmnts in prisma/seed.ts
      expect(tmnts).toHaveLength(5);
      expect(tmnts[0].bowls).not.toBeNull();
      expect(tmnts[0].start_date_str).toBe('2023-12-31')
    })
    it('should get tmnt results for year 2022 - getTmntsForYear()', async () => { 
      const tmnts = await getTmntsForYear('2022');
      expect(tmnts).not.toBeNull();
      if (!tmnts) return;
      // 3 rows for 2022 tmnts in prisma/seed.ts
      expect(tmnts).toHaveLength(3);
      expect(tmnts[0].start_date_str).toBe('2022-10-23')
    })
    it('should get tmnt results for year 2022 - getTmnts()', async () => { 
      const tmnts = await getTmnts('2022');
      expect(tmnts).not.toBeNull();
      if (!tmnts) return;
      // 3 rows for 2022 tmnts in prisma/seed.ts
      expect(tmnts).toHaveLength(3);
      expect(tmnts[0].start_date_str).toBe('2022-10-23')
    })
    it('should get tmnt results for year 2001 - getTmntsForYear()', async () => { 
      const tmnts = await getTmntsForYear('2001');
      expect(tmnts).not.toBeNull();
      if (!tmnts) return;
      // 0 rows for 2001 tmnts in prisma/seed.ts
      expect(tmnts).toHaveLength(0);
    })
    it('should get tmnt results for year 2001 - getTmnts()', async () => { 
      const tmnts = await getTmnts('2001');
      expect(tmnts).not.toBeNull();
      if (!tmnts) return;
      // 0 rows for 2001 tmnts in prisma/seed.ts
      expect(tmnts).toHaveLength(0);
    })
    it('should get 0 tmnt results for invalidyear - getTmntsForYear()', async () => { 
      const tmnts = await getTmntsForYear('test');
      expect(tmnts).not.toBeNull();
      if (!tmnts) return;      
      expect(tmnts).toHaveLength(0);
    })
    it('should get 0 tmnt results for invalid year - getTmnts()', async () => { 
      const tmnts = await getTmnts('test');
      expect(tmnts).not.toBeNull();
      if (!tmnts) return;      
      expect(tmnts).toHaveLength(0);
    })
  })

  describe('getAllDataForTmnt', () => {    
    const origData = blankDataOneTmnt();    
    const curData: dataOneTmntType = {
      tmnt: mockTmnt,
      events: mockEvents,
      divs: mockDivs,
      squads: mockSquads,
      lanes: mockLanes,
      pots: mockPots,
      brkts: mockBrkts,
      elims: mockElims,
    } 
    const toSaveTmntData: allDataOneTmntType = {
      origData,
      curData,
    }

    beforeAll(async () => {
      let result: ioDataError = await saveAllDataOneTmnt(toSaveTmntData);
      if (result !== ioDataError.None) console.log('Error: ', result); 
    });

    afterAll(async () => {
      await deleteAllTmntElims(mockTmnt.id);
      await deleteAllTmntBrkts(mockTmnt.id);
      await deleteAllTmntPots(mockTmnt.id);
      await deleteAllTmntLanes(mockTmnt.id);
      await deleteAllTmntSquads(mockTmnt.id);
      await deleteAllTmntDivs(mockTmnt.id);
      await deleteAllTmntEvents(mockTmnt.id);
      await deleteTmnt(mockTmnt.id);
    });

    it('should get all data for tmnt', async () => {
      const gotTmntData = await getAllDataForTmnt(mockTmnt.id);
      expect(gotTmntData).not.toBeNull();
      if (!gotTmntData) return;
      expect(gotTmntData.tmnt.id).toBe(mockTmnt.id);
      expect(gotTmntData.tmnt.tmnt_name).toBe(mockTmnt.tmnt_name);
      expect(removeTimeFromISODateStr(gotTmntData.tmnt.start_date_str)).toBe(mockTmnt.start_date_str);
      expect(removeTimeFromISODateStr(gotTmntData.tmnt.end_date_str)).toBe(mockTmnt.end_date_str);
      expect(gotTmntData.tmnt.bowl_id).toBe(mockTmnt.bowl_id);
      expect(gotTmntData.tmnt.user_id).toBe(mockTmnt.user_id);

      expect(gotTmntData.events.length).toBe(mockEvents.length);
      for (let i = 0; i < mockEvents.length; i++) {
        expect(gotTmntData.events[i].id).toBe(mockEvents[i].id);
        expect(gotTmntData.events[i].tmnt_id).toBe(mockEvents[i].tmnt_id);        
        expect(gotTmntData.events[i].event_name).toBe(mockEvents[i].event_name);
        expect(gotTmntData.events[i].team_size).toBe(mockEvents[i].team_size);
        expect(gotTmntData.events[i].games).toBe(mockEvents[i].games);
        expect(gotTmntData.events[i].added_money).toBe(mockEvents[i].added_money);
        expect(gotTmntData.events[i].entry_fee).toBe(mockEvents[i].entry_fee);
        expect(gotTmntData.events[i].lineage).toBe(mockEvents[i].lineage);
        expect(gotTmntData.events[i].prize_fund).toBe(mockEvents[i].prize_fund);
        expect(gotTmntData.events[i].other).toBe(mockEvents[i].other);
        expect(gotTmntData.events[i].expenses).toBe(mockEvents[i].expenses);
        expect(gotTmntData.events[i].lpox).toBe(mockEvents[i].lpox);
        expect(gotTmntData.events[i].sort_order).toBe(mockEvents[i].sort_order);
      }

      expect(gotTmntData.divs.length).toBe(mockDivs.length);
      for (let i = 0; i < mockDivs.length; i++) {
        expect(gotTmntData.divs[i].id).toBe(mockDivs[i].id);
        expect(gotTmntData.divs[i].tmnt_id).toBe(mockDivs[i].tmnt_id);
        expect(gotTmntData.divs[i].div_name).toBe(mockDivs[i].div_name);
        expect(gotTmntData.divs[i].hdcp_per).toBe(mockDivs[i].hdcp_per);
        expect(gotTmntData.divs[i].hdcp_from).toBe(mockDivs[i].hdcp_from);
        expect(gotTmntData.divs[i].int_hdcp).toBe(mockDivs[i].int_hdcp);
        expect(gotTmntData.divs[i].hdcp_for).toBe(mockDivs[i].hdcp_for);
        expect(gotTmntData.divs[i].sort_order).toBe(mockDivs[i].sort_order);
      }

      expect(gotTmntData.squads.length).toBe(mockSquads.length);
      for (let i = 0; i < mockSquads.length; i++) {
        expect(gotTmntData.squads[i].id).toBe(mockSquads[i].id);
        expect(gotTmntData.squads[i].event_id).toBe(mockSquads[i].event_id);
        expect(gotTmntData.squads[i].squad_name).toBe(mockSquads[i].squad_name);
        expect(gotTmntData.squads[i].games).toBe(mockSquads[i].games);
        expect(gotTmntData.squads[i].lane_count).toBe(mockSquads[i].lane_count);
        expect(gotTmntData.squads[i].starting_lane).toBe(mockSquads[i].starting_lane);
        expect(compareAsc(gotTmntData.squads[i].squad_date_str, mockSquads[i].squad_date_str)).toBe(0);
        expect(gotTmntData.squads[i].squad_time).toBe(mockSquads[i].squad_time);
        expect(gotTmntData.squads[i].sort_order).toBe(mockSquads[i].sort_order);        
      }

      expect(gotTmntData.lanes.length).toBe(mockLanes.length);
      for (let i = 0; i < mockLanes.length; i++) {
        expect(gotTmntData.lanes[i].id).toBe(mockLanes[i].id);
        expect(gotTmntData.lanes[i].squad_id).toBe(mockLanes[i].squad_id);
        expect(gotTmntData.lanes[i].lane_number).toBe(mockLanes[i].lane_number);
        expect(gotTmntData.lanes[i].in_use).toBe(mockLanes[i].in_use);
      }

      expect(gotTmntData.pots.length).toBe(mockPots.length);
      for (let i = 0; i < mockPots.length; i++) {
        expect(gotTmntData.pots[i].id).toBe(mockPots[i].id);
        expect(gotTmntData.pots[i].div_id).toBe(mockPots[i].div_id);
        expect(gotTmntData.pots[i].squad_id).toBe(mockPots[i].squad_id);
        expect(gotTmntData.pots[i].pot_type).toBe(mockPots[i].pot_type);
        expect(gotTmntData.pots[i].fee).toBe(mockPots[i].fee);
        expect(gotTmntData.pots[i].sort_order).toBe(mockPots[i].sort_order);
      }

      expect(gotTmntData.brkts.length).toBe(mockBrkts.length);
      for (let i = 0; i < mockBrkts.length; i++) {
        expect(gotTmntData.brkts[i].id).toBe(mockBrkts[i].id);
        expect(gotTmntData.brkts[i].div_id).toBe(mockBrkts[i].div_id);
        expect(gotTmntData.brkts[i].squad_id).toBe(mockBrkts[i].squad_id);
        expect(gotTmntData.brkts[i].start).toBe(mockBrkts[i].start);
        expect(gotTmntData.brkts[i].games).toBe(mockBrkts[i].games);
        expect(gotTmntData.brkts[i].players).toBe(mockBrkts[i].players);
        expect(gotTmntData.brkts[i].fee).toBe(mockBrkts[i].fee);
        expect(gotTmntData.brkts[i].first).toBe(mockBrkts[i].first);
        expect(gotTmntData.brkts[i].second).toBe(mockBrkts[i].second);
        expect(gotTmntData.brkts[i].admin).toBe(mockBrkts[i].admin);        
        expect(gotTmntData.brkts[i].fsa + '').toBe(mockBrkts[i].fsa);
        expect(gotTmntData.brkts[i].sort_order).toBe(mockBrkts[i].sort_order);
      }

      expect(gotTmntData.elims.length).toBe(mockElims.length);
      for (let i = 0; i < mockElims.length; i++) {
        expect(gotTmntData.elims[i].id).toBe(mockElims[i].id);
        expect(gotTmntData.elims[i].div_id).toBe(mockElims[i].div_id);
        expect(gotTmntData.elims[i].squad_id).toBe(mockElims[i].squad_id);          
        expect(gotTmntData.elims[i].start).toBe(mockElims[i].start);
        expect(gotTmntData.elims[i].games).toBe(mockElims[i].games);        
        expect(gotTmntData.elims[i].fee).toBe(mockElims[i].fee);
        expect(gotTmntData.elims[i].sort_order).toBe(mockElims[i].sort_order);
      }
    })
  })

  describe("postTmnt", () => {
    const tmntToPost = {
      ...initTmnt,      
      user_id: user1Id,
      tmnt_name: "Test Tournament",
      bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
      start_date_str: todayStr,
      end_date_str: todayStr,
    };

    let createdTmnt = false;

    const deletePostedTmnt = async () => { 
      const response = await axios.get(url);
      const tmnts = response.data.tmnts;
      const toDel = tmnts.find(
        (t: tmntType) => t.tmnt_name === "Test Tournament"
      );
      if (toDel) {
        try {
          const delResponse = await axios({
            method: "delete",
            withCredentials: true,
            url: oneTmntUrl + toDel.id,
          });
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    beforeAll(async () => {
      await deletePostedTmnt();
    });

    beforeEach(() => {
      createdTmnt = false;
    });

    afterEach(async () => {
      if (createdTmnt) {
        await deletePostedTmnt();
      }
    });

    it("should post a tmnt", async () => {
      const postedTmnt = await postTmnt(tmntToPost);
      expect(postedTmnt).not.toBeNull();
      if (!postedTmnt) return;
      expect(postedTmnt).not.toBeNull();
      createdTmnt = true;
      expect(postedTmnt.id).toBe(tmntToPost.id);
      expect(postedTmnt.tmnt_name).toBe(tmntToPost.tmnt_name);
      expect(postedTmnt.user_id).toBe(tmntToPost.user_id);
      expect(postedTmnt.bowl_id).toBe(tmntToPost.bowl_id);    
      expect(postedTmnt.start_date_str).toBe(tmntToPost.start_date_str);
      expect(postedTmnt.end_date_str).toBe(tmntToPost.end_date_str);
    });

    it("should NOT post a tmnt with invalid data", async () => {
      const invalidTmnt = {
        ...tmntToPost,
        tmnt_name: "  ",
      };
      const postedTmnt = await postTmnt(invalidTmnt);
      expect(postedTmnt).toBeNull();
    });
  });  

  describe("putTmnt", () => {
    const tmntToPut = {
      ...initTmnt,
      id: "tmt_fd99387c33d9c78aba290286576ddce5",
      user_id: user1Id,
      tmnt_name: "Test Tournament",
      bowl_id: "bwl_8b4a5c35ad1247049532ff53a12def0a",
      start_date_str: todayStr,
      end_date_str: todayStr,
    };

    const putUrl = oneTmntUrl + tmntToPut.id;
    
    const resetTmnt = {
      ...initTmnt,
      id: "tmt_fd99387c33d9c78aba290286576ddce5",
      user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
      tmnt_name: "Gold Pin",
      bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
      start_date_str: '2022-10-23',
      end_date_str: '2022-10-23',
    };

    const doResetTmnt = async () => {
      const tmntJSON = JSON.stringify(resetTmnt);
      const response = await axios({
        method: "put",
        data: tmntJSON,
        withCredentials: true,
        url: putUrl,
      });
    };

    let didPut = false;

    beforeAll(async () => {
      await doResetTmnt();
    });

    beforeEach = () => {
      didPut = false;
    };

    afterEach(async () => {
      if (didPut) {
        await doResetTmnt();
      }
    });

    it("should put a tmnt", async () => {
      const puttedTmnt = await putTmnt(tmntToPut);
      expect(puttedTmnt).not.toBeNull();
      if (!puttedTmnt) return;
      didPut = true;
      expect(puttedTmnt.tmnt_name).toBe(tmntToPut.tmnt_name);
      expect(puttedTmnt.bowl_id).toBe(tmntToPut.bowl_id);
      expect(puttedTmnt.user_id).toBe(tmntToPut.user_id);
      expect(puttedTmnt.start_date_str).toBe(tmntToPut.start_date_str);
      expect(puttedTmnt.end_date_str).toBe(tmntToPut.end_date_str);
    });

    it("should NOT put a tmnt with invalid data", async () => {
      const invalidTmnt = {
        ...tmntToPut,
        tmnt_name: "",
      };
      const puttedTmnt = await putTmnt(invalidTmnt);
      expect(puttedTmnt).toBeNull();
    });
  });

  describe('deleteTmnt', () => {     
    // toDel is data from prisma/seeds.ts    
    const toDel = {
      ...initTmnt,
      id: "tmt_e134ac14c5234d708d26037ae812ac33",
      user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
      tmnt_name: "Gold Pin",
      bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
      start_date_str: '2025-08-19',
      end_date_str: '2025-08-19',
    }                             

    const rePostToDel = async () => {
      const response = await axios.get(url);
      const tmnts = response.data.tmnts;
      const foundToDel = tmnts.find(
        (t: tmntType) => t.id === toDel.id
      );
      if (!foundToDel) {
        try {
          const tmntJSON = JSON.stringify(toDel);
          const rePostedResponse = await axios({
            method: "post",
            data: tmntJSON,
            withCredentials: true,
            url: url,
          });          
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    let didDel = false;

    beforeAll(async () => {
      await rePostToDel();
    });

    beforeEach = () => {
      didDel = false;
    };

    afterEach(async () => {
      if (didDel) {
        await rePostToDel();
      } 
    });

    it('should delete a tmnt by ID', async () => {
      const deletedTmnt = await deleteTmnt(toDel.id);
      expect(deletedTmnt).toBe(true);
      didDel = true;
    });
    it('should NOT delete a tmnt that does not exist', async () => {
      const deletedTmnt = await deleteTmnt(notFoundId);  
      expect(deletedTmnt).toBe(false);
    })
  })

  describe('deleteAllDataForTmnt', () => { 
    const origData = blankDataOneTmnt();
    const curData: dataOneTmntType = {
      tmnt: mockTmnt,
      events: mockEvents,
      divs: mockDivs,
      squads: mockSquads,
      lanes: mockLanes,
      pots: mockPots,
      brkts: mockBrkts,
      elims: mockElims,
    } 
    const toSaveTmntData: allDataOneTmntType = {
      origData,
      curData,
    }

    afterEach(async () => {
      await deleteAllTmntElims(mockTmnt.id);
      await deleteAllTmntBrkts(mockTmnt.id);
      await deleteAllTmntPots(mockTmnt.id);
      await deleteAllTmntLanes(mockTmnt.id);
      await deleteAllTmntSquads(mockTmnt.id);
      await deleteAllTmntDivs(mockTmnt.id);
      await deleteAllTmntEvents(mockTmnt.id);
      await deleteTmnt(mockTmnt.id);
    });

    it('should delete all data for a tmnt', async () => { 
      let result: ioDataError = await saveAllDataOneTmnt(toSaveTmntData);
      if (result !== ioDataError.None) console.log('Error: ', result);
      expect(result).toBe(ioDataError.None);
      result = await deleteAllDataForTmnt(mockTmnt.id);
      expect(result).toBe(ioDataError.None);
    })
    it('should delete when no pots for a tmnt', async () => { 
      const noPotsTmnt = cloneDeep(toSaveTmntData)
      noPotsTmnt.curData.pots = [];
      const saveResult = await saveAllDataOneTmnt(noPotsTmnt);
      expect(saveResult).toBe(ioDataError.None);
      const delResult = await deleteAllDataForTmnt(noPotsTmnt.curData.tmnt.id);
      expect(delResult).toBe(ioDataError.None);
    })
    it('should delete when no brkts for a tmnt', async () => { 
      const noBrktsTmnt = cloneDeep(toSaveTmntData)
      noBrktsTmnt.curData.brkts = [];
      const saveResult = await saveAllDataOneTmnt(noBrktsTmnt);
      expect(saveResult).toBe(ioDataError.None);
      const delResult = await deleteAllDataForTmnt(noBrktsTmnt.curData.tmnt.id);
      expect(delResult).toBe(ioDataError.None);
    })
    it('should delete when no elims for a tmnt', async () => { 
      const noElimsTmnt = cloneDeep(toSaveTmntData)
      noElimsTmnt.curData.elims = [];
      const saveResult = await saveAllDataOneTmnt(noElimsTmnt);
      expect(saveResult).toBe(ioDataError.None);
      const delResult = await deleteAllDataForTmnt(noElimsTmnt.curData.tmnt.id);
      expect(delResult).toBe(ioDataError.None);
    })
  })

});
