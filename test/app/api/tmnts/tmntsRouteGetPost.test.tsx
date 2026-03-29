import axios, { AxiosError } from "axios";
import { baseTmntsApi } from "@/lib/api/apiPaths";
import { testBaseTmntsApi } from "../../../testApi";
import type { bowlType, tmntType, YearObj } from "@/lib/types/types";
import { initBowl, initTmnt } from "@/lib/db/initVals";
import { removeTimeFromISODateStr, todayStr } from "@/lib/dateTools";
import { isValidBtDbId } from "@/lib/validation/validation";
import { maxYear, minYear } from "@/lib/validation/constants";

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
const fullUrl = url + "/full/";
const tmntUrl = url + "/tmnt/";
const userUrl = url + "/user/";
const yearsUrl = url + "/years/";
const allResultsUrl = url + "/results";
const resultsUrl = url + "/results/";
const upcomingUrl = url + "/upcoming";

describe("Tmnts - API: /api/tmnts", () => {
  const tmntId = "tmt_f4d563425ba04b7dac3a97c0a90fc2c9"; // not in database
  const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
  const bowlId = "bwl_561540bd64974da9abdd97765fdb3659";
  
  const testTmnt: tmntType = {
    ...initTmnt,
    id: "tmt_fd99387c33d9c78aba290286576ddce5",
    user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
    tmnt_name: "Gold Pin",
    bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
    start_date_str: "2022-10-23",
    end_date_str: "2022-10-23",
  };
  const testBowl: bowlType = {
    ...initBowl,
    id: "bwl_561540bd64974da9abdd97765fdb3659",
    bowl_name: "Earl Anthony's Dublin Bowl",
    city: "Dublin",
    state: "CA",
    url: "https://www.earlanthonysdublinbowl.com",
  };

  const notFoundId = "tmt_01234567890123456789012345678901";
  const notFoundBowlId = "bwl_01234567890123456789012345678901";
  const notFoundUserId = "usr_01234567890123456789012345678901";
  const nonTmntId = "evt_01234567890123456789012345678901";

  const user1Id = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";

  const tmntToPost = {
    ...initTmnt,
    id: "tmt_1234567890abcdef1234567890abcdef",
    user_id: user1Id,
    tmnt_name: "Test Tournament",
    bowl_id: bowlId,
    start_date_str: todayStr,
    end_date_str: todayStr,
  }

  const deletePostedTmnt = async (tmntId: string) => {

    try {
      await axios.delete(tmntUrl + tmntId, { withCredentials: true });      
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  const resetTmnt = async () => {
    try {
      // make sure test tmnt is reset in database
      const tmntJSON = JSON.stringify(testTmnt);  
      await axios.put(tmntUrl + testTmnt.id, tmntJSON, { withCredentials: true });
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  describe('GET', () => {

    beforeAll(async () => {
      await deletePostedTmnt(tmntToPost.id);
      await resetTmnt();
    })

    it('should get all tmnts', async () => {
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      // 14 rows in prisma/seed.ts
      expect(response.data.tmnts).toHaveLength(14);
    })

  })

  describe('GET tmnt by ID - API: API: /api/tmnts/tmnt/:id', () => {

    beforeAll(async () => {
      await deletePostedTmnt(tmntToPost.id);
      await resetTmnt();
    })

    it('should get a tmnt by ID', async () => {
      const urlToUse = tmntUrl + testTmnt.id;
      const response = await axios.get(urlToUse);
      const tmnt = response.data.tmnt;
      expect(response.status).toBe(200);
      expect(tmnt.id).toBe(testTmnt.id);
      expect(tmnt.tmnt_name).toBe(testTmnt.tmnt_name);
      expect(tmnt.bowl_id).toBe(testTmnt.bowl_id);
      expect(tmnt.user_id).toBe(testTmnt.user_id);
      expect(removeTimeFromISODateStr(tmnt.start_date)).toBe(testTmnt.start_date_str);
      expect(removeTimeFromISODateStr(tmnt.end_date)).toBe(testTmnt.end_date_str);
      expect(tmnt.bowl).not.toBeNull();
      expect(tmnt.bowl.bowl_name).toBe(testBowl.bowl_name);
      expect(tmnt.bowl.city).toBe(testBowl.city);
      expect(tmnt.bowl.state).toBe(testBowl.state);
      expect(tmnt.bowl.url).toBe(testBowl.url);
    })
    it('should NOT get a tmnt by ID when ID is invalid', async () => {
      try {
        const response = await axios.get(tmntUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get a tmnt by ID when ID is valid, but not a tmnt ID', async () => {
      try {
        const response = await axios.get(tmntUrl + nonTmntId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get a tmnt by ID when ID is not found', async () => {
      try {
        const response = await axios.get(tmntUrl + notFoundId);
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

  describe('GET tmnts for user - API: API: /api/tmnts/user/:userId', () => {

    beforeAll(async () => {
      await deletePostedTmnt(tmntToPost.id);
      await resetTmnt();
    })

    it('should get all tmnts for user', async () => {
      const response = await axios.get(userUrl + userId);
      expect(response.status).toBe(200);
      // 11 tmnt rows for user in prisma/seed.ts
      expect(response.data.tmnts).toHaveLength(11);
      const tmnts = response.data.tmnts;
      expect(tmnts[0].user_id).toBe(userId);
      expect(tmnts[10].user_id).toBe(userId);
      // tmnts sorted by date, newest to oldest      
      expect(tmnts[0].id).toBe('tmt_ce35f0c119aa49fd9b89aa86cb980a6a')      
      expect(removeTimeFromISODateStr(tmnts[0].start_date)).toBe('2026-12-31')
      expect(tmnts[1].id).toBe('tmt_e134ac14c5234d708d26037ae812ac33')      
      expect(removeTimeFromISODateStr(tmnts[1].start_date)).toBe('2026-08-19')
      expect(tmnts[2].id).toBe('tmt_2d494e9bb51f4b9abba428c3f37131c9')
      expect(removeTimeFromISODateStr(tmnts[2].start_date)).toBe('2024-12-20')
      expect(tmnts[3].id).toBe('tmt_a237a388a8fc4641a2e37233f1d6bebd')
      expect(removeTimeFromISODateStr(tmnts[3].start_date)).toBe('2024-12-01')
      expect(tmnts[4].id).toBe('tmt_d237a388a8fc4641a2e37233f1d6bebd')
      expect(removeTimeFromISODateStr(tmnts[4].start_date)).toBe('2024-07-01')
      expect(tmnts[5].id).toBe('tmt_9a34a65584f94f548f5ce3b3becbca19')
      expect(removeTimeFromISODateStr(tmnts[5].start_date)).toBe('2024-01-05')
      expect(tmnts[6].id).toBe('tmt_fe8ac53dad0f400abe6354210a8f4cd1')
      expect(removeTimeFromISODateStr(tmnts[6].start_date)).toBe('2023-12-31')
      expect(tmnts[7].id).toBe('tmt_718fe20f53dd4e539692c6c64f991bbe')
      expect(removeTimeFromISODateStr(tmnts[7].start_date)).toBe('2023-12-20')
      expect(tmnts[8].id).toBe('tmt_467e51d71659d2e412cbc64a0d19ecb4')
      expect(removeTimeFromISODateStr(tmnts[8].start_date)).toBe('2023-09-16')
      expect(tmnts[9].id).toBe('tmt_a78f073789cc0f8a9a0de8c6e273eab1')
      expect(removeTimeFromISODateStr(tmnts[9].start_date)).toBe('2023-01-02')
      expect(tmnts[10].id).toBe('tmt_fd99387c33d9c78aba290286576ddce5')
      expect(removeTimeFromISODateStr(tmnts[10].start_date)).toBe('2022-10-23')

      expect(tmnts[0].bowls).not.toBeNull();
    })
    it('should NOT get all tmnts for user when user_id is invalid', async () => {
      try {
        const response = await axios.get(userUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get all tmnts for user when user_id is valid, but not a user ID', async () => {
      try {
        const response = await axios.get(userUrl + tmntId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get all tmnts for user when user_id is not found', async () => {
      const response = await axios.get(userUrl + notFoundUserId);
      expect(response.status).toBe(200);
      expect(response.data.tmnts).toHaveLength(0);
    })
  })

  describe('GET list of years from tmnts - API: /api/tmnts/years/year', () => {

    beforeAll(async () => {      
      await deletePostedTmnt(tmntToPost.id);
      await resetTmnt();
    })

    it('should get array of years from 2023 and older API: /api/tmnts/years/yyyy', async () => {
      const response = await axios.get(yearsUrl + '2023');
      expect(response.status).toBe(200);
      expect(response.data.years).toHaveLength(2);
      const years: YearObj[] = response.data.years;
      // years sorted newest to oldest
      expect(years[0].year).toBe('2023');
      expect(years[1].year).toBe('2022');
    })
    it('should get array of all years from today and before API: /api/tmnts/years/yyyy', async () => {
      const yearStr = todayStr.substring(0, 4);
      const response = await axios.get(yearsUrl + yearStr);
      expect(response.status).toBe(200);
      expect(response.data.years.length).toBeGreaterThanOrEqual(1)
      const years: YearObj[] = response.data.years;
      // years sorted newest to oldest
      for (let i = 0; i < years.length -1; i++) {
        expect(Number(years[i].year)).toBeGreaterThan(Number(years[i+1].year));
      }
    })
    it('should not get array of years when year is invalid', async () => {
      try {
        const response = await axios.get(yearsUrl + 'test');
        expect(response.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get array of years when year is less than minYear', async () => {
      try {
        const response = await axios.get(yearsUrl + (minYear - 1).toString());
        expect(response.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get array of years when year is more than maxYear', async () => {
      try {
        const response = await axios.get(yearsUrl + (maxYear + 1).toString());
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

  describe('GET all tmnt results - API: /api/tmnts/results', () => {

    beforeAll(async () => {      
      await deletePostedTmnt(tmntToPost.id);
      await resetTmnt();
    })

    it('should get array of all tmnt results API: /api/tmnts/results', async () => {
      const response = await axios.get(allResultsUrl);
      expect(response.status).toBe(200);
      // 12 rows for results in prisma/seed.ts
      expect(response.data.tmnts).toHaveLength(12);
      const tmnts = response.data.tmnts;
      expect(tmnts[0].bowls).not.toBeNull();
      // tmnts sorted by date newest to oldest
      expect(removeTimeFromISODateStr(tmnts[0].start_date)).toBe('2024-12-20');
    })
    it('should get array of tmnt results by year for 2022 API: /api/tmnts/results/yyyy', async () => {
      const response = await axios.get(resultsUrl + '2022');
      expect(response.status).toBe(200);
      // 3 rows for results in prisma/seed.ts for 2022
      expect(response.data.tmnts).toHaveLength(3);
      const tmnts = response.data.tmnts;
      expect(tmnts[0].bowls).not.toBeNull();
      // tmnts sorted by date newest to oldest
      expect(removeTimeFromISODateStr(tmnts[0].start_date)).toBe('2022-10-23');
    })
    it('should get array of tmnt results by year for 2000 API: /api/tmnts/results/yyyy', async () => {
      const response = await axios.get(resultsUrl + '2000');
      expect(response.status).toBe(200);
      // 0 rows for results in prisma/seed.ts for 2022
      expect(response.data.tmnts).toHaveLength(0);
    })
    it('should not get array of tmnt results when year is invalid', async () => { 
      try {
        const response = await axios.get(resultsUrl + 'test');
        expect(response.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get array of tmnt results when year is less than minYear', async () => {
      try {
        const response = await axios.get(resultsUrl + (minYear - 1).toString());
        expect(response.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
        } else {
          expect(true).toBeFalsy();
        } 
      }
    })
    it('should not get array of tmnt results when year is more than maxYear', async () => {
      try {
        const response = await axios.get(resultsUrl + (maxYear + 1).toString());
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

  describe('GET upcoming tmnt - API: /api/tmnts/upcoming', () => {

    beforeAll(async () => {      
      await deletePostedTmnt(tmntToPost.id);
      await resetTmnt();
    })

    it('should get array of upcoming tmnts API: /api/tmnts/upcoming', async () => {
      
      const response = await axios.get(upcomingUrl);
      expect(response.status).toBe(200);
      // 1 rows for upcoming in prisma/seed.ts
      expect(response.data.tmnts).toHaveLength(2);
      const tmnts = response.data.tmnts;
      expect(tmnts[0].bowls).not.toBeNull();
      // tmnts sorted by date newest to oldest
      expect(removeTimeFromISODateStr(tmnts[0].start_date)).toBe('2026-08-19');
      expect(removeTimeFromISODateStr(tmnts[1].start_date)).toBe('2026-12-31');
    })
  })

  describe('GET tmnt full data - API: /api/tmnts/full', () => {

    beforeAll(async () => {      
      await deletePostedTmnt(tmntToPost.id);
      await resetTmnt();
    })

    it('should get tmnt full data object for Full Tournament', async () => {
      const fullTmntId = 'tmt_d237a388a8fc4641a2e37233f1d6bebd';
      const fullBowlId = 'bwl_561540bd64974da9abdd97765fdb3659';
      const fullDivId = 'div_99a3cae28786485bb7a036935f0f6a0a';
      const fillEventId = 'evt_4ff710c8493f4a218d2e2b045442974a';
      const fullSquadId = 'sqd_8e4266e1174642c7a1bcec47a50f275f';
      const fullStageId = 'stg_124dd9efc30f4352b691dfd93d1e284e';

      const response = await axios.get(fullUrl + fullTmntId);
      expect(response.status).toBe(200);
      expect(response.data.tmntFullData).not.toBeNull();
      const tmntFullData = response.data.tmntFullData;
      expect(tmntFullData.id).toBe(fullTmntId);
      expect(tmntFullData.bowl_id).toBe(fullBowlId);
      expect(tmntFullData.tmnt_name).toBe("Full Tournament");

      // bowls
      expect(tmntFullData.bowl).toBeDefined();
      expect(tmntFullData.bowl).not.toBeNull();
      expect(tmntFullData.bowl.id).toBe(fullBowlId);
      expect(tmntFullData.bowl.bowl_name).toBe("Earl Anthony's Dublin Bowl");
      expect(tmntFullData.bowl.city).toBe("Dublin");
      expect(tmntFullData.bowl.state).toBe("CA");
      expect(tmntFullData.bowl.url).toBe("https://www.earlanthonysdublinbowl.com");

      // divs
      expect(tmntFullData.divs).toHaveLength(1);
      expect(tmntFullData.divs[0].id).toBe(fullDivId);
      expect(tmntFullData.divs[0].div_name).toBe('Scratch');
      expect(tmntFullData.divs[0].hdcp_per).toBe(0);
      expect(tmntFullData.divs[0].hdcp_from).toBe(230);
      expect(tmntFullData.divs[0].int_hdcp).toBe(true);
      expect(tmntFullData.divs[0].hdcp_for).toBe('Game');

      // div entries
      expect(tmntFullData.divs[0].div_entries).toHaveLength(36);
      for (let d = 0; d < 36; d++) {
        const idNum = (d + 1).toString().padStart(2, "0");
        const id = `den_a${idNum}631c1c94d4627bde16fad72e5e5d4`;
        const playerId = `ply_a${idNum}758cff1cc4bab9d9133e661bd49b0`;
        expect(tmntFullData.divs[0].div_entries[d].id).toBe(id);
        expect(tmntFullData.divs[0].div_entries[d].div_id).toBe(fullDivId);
        expect(tmntFullData.divs[0].div_entries[d].squad_id).toBe(fullSquadId);
        expect(tmntFullData.divs[0].div_entries[d].player_id).toBe(playerId);
        expect(tmntFullData.divs[0].div_entries[d].fee).toBe('90');
        expect(tmntFullData.divs[0].div_entries[d].player.average).toBeGreaterThan(190);
        expect(tmntFullData.divs[0].div_entries[d].player.average).toBeLessThan(231);
      }

      // brackets
      expect(tmntFullData.divs[0].brkts).toHaveLength(2);
      for (let i = 0; i < 2; i++) {
        expect(tmntFullData.divs[0].brkts[i].squad_id).toBe(fullSquadId);
        expect(tmntFullData.divs[0].brkts[i].brkt_entries).toHaveLength(20);
        expect(tmntFullData.divs[0].brkts[i].admin).toBe('5');
        expect(tmntFullData.divs[0].brkts[i].first).toBe('25');
        expect(tmntFullData.divs[0].brkts[i].second).toBe('10');
        // expect(tmntFullData.divs[0].brkts[i].fsa).toBe('40');
        expect(tmntFullData.divs[0].brkts[i].games).toBe(3);
        expect(tmntFullData.divs[0].brkts[i].players).toBe(8);        

        // bracket entries and bracket refunds
        if (tmntFullData.divs[0].brkts[i].id === 'brk_3e6bf51cc1ca4748ad5e8abab88277e0') {
          expect(tmntFullData.divs[0].brkts[i].start).toBe(1);
          for (let j = 0; j < 20; j++) {
            if (tmntFullData.divs[0].brkts[i].brkt_entries[j].id === 'ben_c2126ba58d3f4a7d950101a5674ce595' ||
              tmntFullData.divs[0].brkts[i].brkt_entries[j].id === 'ben_c2226ba58d3f4a7d950101a5674ce595'
            ) {
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].num_brackets).toBe(21);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].player_id).toBe('ply_a11758cff1cc4bab9d9133e661bd49b0');
              // expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].fee).toBe(105);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds).not.toBeNull();
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds.num_refunds).toBe(4)
            } else if (tmntFullData.divs[0].brkts[i].brkt_entries[j].id === 'ben_c0326ba58d3f4a7d950101a5674ce595') {
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].num_brackets).toBe(8);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].player_id).toBe('ply_a02758cff1cc4bab9d9133e661bd49b0');
              // expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].fee).toBe(40);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds).toBeNull();
            } else {
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].player_id).not.toBeNull();
              // expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].fee).toBeGreaterThan(0);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds).toBeNull();
            }
          }
        } else if (tmntFullData.divs[0].brkts[i].id === 'brk_fd88cd2f5a164e8c8f758daae18bfc83') {
          expect(tmntFullData.divs[0].brkts[i].start).toBe(4);
          for (let j = 0; j < 20; j++) {
            if (tmntFullData.divs[0].brkts[i].brkt_entries[j].id === 'ben_c2226ba58d3f4a7d950101a5674ce595') {
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].num_brackets).toBe(21);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].player_id).toBe('ply_a11758cff1cc4bab9d9133e661bd49b0');
              // expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].fee).toBe(105);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds).not.toBeNull();
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds.num_refunds).toBe(4)
            } else if (tmntFullData.divs[0].brkts[i].brkt_entries[j].id === 'ben_c0426ba58d3f4a7d950101a5674ce595') {
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].num_brackets).toBe(8);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].player_id).toBe('ply_a02758cff1cc4bab9d9133e661bd49b0');
              // expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].fee).toBe(40);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds).toBeNull();
            } else {
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].player_id).not.toBeNull();
              // expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].fee).toBeGreaterThan(0);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds).toBeNull();
            }
          }
        } else {
          expect(true).toBeFalsy();
        }

        // one_brkts and brkt_seeds
        expect(tmntFullData.divs[0].brkts[i].one_brkts).toHaveLength(0);
      }

      // elims
      expect(tmntFullData.divs[0].elims).toHaveLength(2);
      for (let i = 0; i < 2; i++) {
        expect(tmntFullData.divs[0].elims[i].squad_id).toBe(fullSquadId);
        expect(tmntFullData.divs[0].elims[i].fee).toBe('5');
        expect(tmntFullData.divs[0].elims[i].games).toBe(3);
        expect(tmntFullData.divs[0].elims[i].player_id).not.toBeNull();

        // elim entries
        expect(tmntFullData.divs[0].elims[i].elim_entries).toHaveLength(16);
        if (tmntFullData.divs[0].elims[i].id === 'elm_c47a4ec07f824b0e93169ae78e8b4b1e') {
          expect(tmntFullData.divs[0].elims[i].start).toBe(1);
          for (let j = 0; j < 16; j++) {
            expect(tmntFullData.divs[0].elims[i].elim_entries[j].fee).toBe('5');
          }
        } else if (tmntFullData.divs[0].elims[i].id === 'elm_461eece3c50241e9925e9a520730ac7e') {
          expect(tmntFullData.divs[0].elims[i].start).toBe(4);
          for (let j = 0; j < 16; j++) {
            expect(tmntFullData.divs[0].elims[i].elim_entries[j].fee).toBe('5');
          }
        } else {
          expect(true).toBeFalsy();
        }
      }

      // pots and pot entries
      expect(tmntFullData.divs[0].pots).toHaveLength(1);
      expect(tmntFullData.divs[0].pots[0].squad_id).toBe(fullSquadId);
      expect(tmntFullData.divs[0].pots[0].id).toBe('pot_89fd8f787de942a1a92aaa2df3e7c185')
      expect(tmntFullData.divs[0].pots[0].pot_type).toBe('Game');
      expect(tmntFullData.divs[0].pots[0].fee).toBe('20');
      expect(tmntFullData.divs[0].pots[0].pot_entries).toHaveLength(30);
      for (let i = 0; i < 30; i++) {
        expect(tmntFullData.divs[0].pots[0].pot_entries[i].fee).toBe('20');
        expect(tmntFullData.divs[0].pots[0].pot_entries[i].player_id).not.toBeNull();
      }

      // events
      expect(tmntFullData.events).toHaveLength(1);
      expect(tmntFullData.events[0].id).toBe(fillEventId);
      expect(tmntFullData.events[0].event_name).toBe('Singles');
      expect(tmntFullData.events[0].team_size).toBe(1);
      expect(tmntFullData.events[0].games).toBe(6);
      expect(tmntFullData.events[0].entry_fee).toBe('90');
      expect(tmntFullData.events[0].lineage).toBe('21');
      expect(tmntFullData.events[0].prize_fund).toBe('62');
      expect(tmntFullData.events[0].other).toBe('2');
      expect(tmntFullData.events[0].expenses).toBe('5');
      expect(tmntFullData.events[0].added_money).toBe('0');
      // expect(tmntFullData.events[0].lpox).toBe('90');

      // squads
      expect(tmntFullData.events[0].squads).toHaveLength(1);
      expect(tmntFullData.events[0].squads[0].id).toBe(fullSquadId);
      expect(tmntFullData.events[0].squads[0].squad_name).toBe('Squad 1');
      expect(tmntFullData.events[0].squads[0].games).toBe(6);
      expect(tmntFullData.events[0].squads[0].lane_count).toBe(12);
      expect(tmntFullData.events[0].squads[0].starting_lane).toBe(29);

      // stage
      expect(tmntFullData.events[0].squads[0].stage).toBeDefined();
      expect(tmntFullData.events[0].squads[0].stage).not.toBeNull();
      expect(tmntFullData.events[0].squads[0].stage.id).toBe(fullStageId);
      expect(tmntFullData.events[0].squads[0].stage.squad_id).toBe(fullSquadId);  
      expect(tmntFullData.events[0].squads[0].stage.stage).toBe('ENTRIES');

      // lanes
      expect(tmntFullData.events[0].squads[0].lanes).toHaveLength(12);
      for (let l = 0; l < 12; l++) {
        expect(tmntFullData.events[0].squads[0].lanes[l].lane_number).toBe(l + 29);
        expect(tmntFullData.events[0].squads[0].lanes[l].in_use).toBe(true);
      }

      // players
      expect(tmntFullData.events[0].squads[0].players).toHaveLength(36);
      for (let p = 0; p < 36; p++) {
        const lane = 29 + Math.floor(p / 3);
        expect(tmntFullData.events[0].squads[0].players[p].lane).toBe(lane);

        const positions = ["A", "B", "C", "D", "E", "F"];
        const position = positions[p % 6];
        expect(tmntFullData.events[0].squads[0].players[p].position).toBe(position)

        const idNum = (p + 1).toString().padStart(2, "0");
        const id = `ply_a${idNum}758cff1cc4bab9d9133e661bd49b0`;
        expect(tmntFullData.events[0].squads[0].players[p].id).toBe(id);

        expect(tmntFullData.events[0].squads[0].players[p].first_name).not.toBeNull();
        expect(tmntFullData.events[0].squads[0].players[p].last_name).not.toBeNull();
        expect(tmntFullData.events[0].squads[0].players[p].average).toBeGreaterThan(190);
        expect(tmntFullData.events[0].squads[0].players[p].average).toBeLessThan(231);
        expect(tmntFullData.events[0].squads[0].players[p].usbc).toBeNull();
      }
    })
    it('should get tmnt full data object for Yosemite 6 Gamer', async () => {
      const yoTmntId = 'tmt_56d916ece6b50e6293300248c6792316';
      const yoBowlId = 'bwl_8b4a5c35ad1247049532ff53a12def0a';
      const yoSquadId = 'sqd_1a6c885ee19a49489960389193e8f819';
      const yoStageId = 'stg_510e257cbcdf494e8ca002087b31c175';

      const response = await axios({
        method: "get",
        withCredentials: true,
        url: fullUrl + yoTmntId,
      });
      expect(response.status).toBe(200);
      expect(response.data.tmntFullData).not.toBeNull();
      const tmntFullData = response.data.tmntFullData;
      expect(tmntFullData.id).toBe(yoTmntId);
      expect(tmntFullData.bowl_id).toBe(yoBowlId);
      expect(tmntFullData.tmnt_name).toBe("Yosemite 6 Gamer");

      // bowls
      expect(tmntFullData.bowl).toBeDefined();
      expect(tmntFullData.bowl).not.toBeNull();
      expect(tmntFullData.bowl.id).toBe(yoBowlId);
      expect(tmntFullData.bowl.bowl_name).toBe("Yosemite Lanes");
      expect(tmntFullData.bowl.city).toBe("Modesto");
      expect(tmntFullData.bowl.state).toBe("CA");
      expect(tmntFullData.bowl.url).toBe("http://yosemitelanes.com");

      // divs
      expect(tmntFullData.divs).toHaveLength(2);
      for (let i = 0; i < 2; i++) {
        if (tmntFullData.divs[i].id === 'div_1f42042f9ef24029a0a2d48cc276a087') {
          expect(tmntFullData.divs[i].div_name).toBe('Scratch');

          // brackets
          expect(tmntFullData.divs[i].brkts).toHaveLength(2);
          for (let j = 0; j < 2; j++) {
            expect(tmntFullData.divs[i].brkts[j].squad_id).toBe(yoSquadId);
            expect(tmntFullData.divs[i].brkts[j].admin).toBe('5');
            expect(tmntFullData.divs[i].brkts[j].first).toBe('25');
            expect(tmntFullData.divs[i].brkts[j].second).toBe('10');
            expect(tmntFullData.divs[i].brkts[j].games).toBe(3);
            expect(tmntFullData.divs[i].brkts[j].players).toBe(8);
            if (tmntFullData.divs[i].brkts[j].id === 'brk_aa3da3a411b346879307831b6fdadd5f') {
              expect(tmntFullData.divs[i].brkts[j].start).toBe(1);
            } else if (tmntFullData.divs[i].brkts[j].id === 'brk_37345eb6049946ad83feb9fdbb43a307') {
              expect(tmntFullData.divs[i].brkts[j].start).toBe(4);
            }

            // bracket entries and bracket refunds
            expect(tmntFullData.divs[0].brkts[j].brkt_entries).toHaveLength(0);

            // one_brkts and brkt_seeds
            expect(tmntFullData.divs[0].brkts[j].one_brkts).toHaveLength(0);
          }

          // elims
          expect(tmntFullData.divs[0].elims).toHaveLength(2);
          for (let j = 0; j < 2; j++) {
            expect(tmntFullData.divs[i].elims[j].squad_id).toBe(yoSquadId);
            expect(tmntFullData.divs[i].elims[j].fee).toBe('5');
            expect(tmntFullData.divs[i].elims[j].games).toBe(3);
            if (tmntFullData.divs[i].elims[j].id === 'elm_b4c3939adca140898b1912b75b3725f8') {
              expect(tmntFullData.divs[i].elims[j].start).toBe(1);
            } else if (tmntFullData.divs[i].elims[j].id === 'elm_4f176545e4294a0292732cccada91b9d') {
              expect(tmntFullData.divs[0].elims[j].start).toBe(4);
            } else {
              expect(true).toBeFalsy();
            }

            // elim entries
            expect(tmntFullData.divs[i].elims[j].elim_entries).toHaveLength(0);
          }

          // pots
          expect(tmntFullData.divs[i].pots).toHaveLength(2);
          for (let j = 0; j < 2; j++) {
            expect(tmntFullData.divs[i].pots[j].squad_id).toBe(yoSquadId);
            expect(tmntFullData.divs[i].pots[j].fee).toBe('10');
            if (tmntFullData.divs[i].pots[j].id === 'pot_98b3a008619b43e493abf17d9f462a65') {
              expect(tmntFullData.divs[i].pots[j].pot_type).toBe('Game');
            } else if (tmntFullData.divs[i].pots[j].id === 'pot_ab80213899ea424b938f52a062deacfe') {
              expect(tmntFullData.divs[i].pots[j].pot_type).toBe('Last Game');
            } else {
              expect(true).toBeFalsy();
            }

            // pot entries
            expect(tmntFullData.divs[i].pots[j].pot_entries).toHaveLength(0);
          }

        } else if (tmntFullData.divs[i].id === 'div_29b9225d8dd44a4eae276f8bde855729') {
          expect(tmntFullData.divs[i].div_name).toBe('50+ Scratch');
          expect(tmntFullData.divs[i].brkts).toHaveLength(0);
          expect(tmntFullData.divs[i].elims).toHaveLength(0);
          expect(tmntFullData.divs[i].pots).toHaveLength(0);
        } else {
          expect(true).toBeFalsy();
        }
      }

      // events
      expect(tmntFullData.events).toHaveLength(1);
      expect(tmntFullData.events[0].id).toBe('evt_dadfd0e9c11a4aacb87084f1609a0afd');
      expect(tmntFullData.events[0].event_name).toBe('Singles');
      expect(tmntFullData.events[0].games).toBe(6);
      expect(tmntFullData.events[0].entry_fee).toBe('60');
      expect(tmntFullData.events[0].lineage).toBe('15');
      expect(tmntFullData.events[0].prize_fund).toBe('45');
      expect(tmntFullData.events[0].other).toBe('0');
      expect(tmntFullData.events[0].expenses).toBe('0');
      expect(tmntFullData.events[0].added_money).toBe('0');

      // squads
      expect(tmntFullData.events[0].squads).toHaveLength(1);
      expect(tmntFullData.events[0].squads[0].id).toBe(yoSquadId);
      expect(tmntFullData.events[0].squads[0].squad_name).toBe('Squad 1');

      // stage
      expect(tmntFullData.events[0].squads[0].stage).toBeDefined();
      expect(tmntFullData.events[0].squads[0].stage).not.toBeNull();
      expect(tmntFullData.events[0].squads[0].stage.id).toBe(yoStageId)
      expect(tmntFullData.events[0].squads[0].stage.squad_id).toBe(yoSquadId);
      expect(tmntFullData.events[0].squads[0].stage.stage).toBe('DEFINE');

      // lanes
      expect(tmntFullData.events[0].squads[0].lanes).toHaveLength(24);
      for (let l = 0; l < 24; l++) {
        expect(tmntFullData.events[0].squads[0].lanes[l].lane_number).toBe(l+9);
        expect(tmntFullData.events[0].squads[0].lanes[l].in_use).toBe(true);
      }
    })
    it('should get tmnt full data object for Gold Pin Oct 23 2022 - oneBrkts, brktSeeds and bye player', async () => {
      const gpTmntId = 'tmt_fd99387c33d9c78aba290286576ddce5';
      const gpBowlId = 'bwl_561540bd64974da9abdd97765fdb3659';
      const gpSquadId = 'sqd_7116ce5f80164830830a7157eb093396';
      const gpStageId = 'stg_c5f562c4c4304d919ac43fead73123e2';

      const response = await axios.get(fullUrl + gpTmntId);
      expect(response.status).toBe(200);
      expect(response.data.tmntFullData).not.toBeNull();
      const tmntFullData = response.data.tmntFullData;
      expect(tmntFullData.id).toBe(gpTmntId);
      expect(tmntFullData.bowl_id).toBe(gpBowlId);
      expect(tmntFullData.tmnt_name).toBe("Gold Pin");

      // bowls
      expect(tmntFullData.bowl).not.toBeNull();
      expect(tmntFullData.bowl.id).toBe(gpBowlId);
      expect(tmntFullData.bowl.bowl_name).toBe("Earl Anthony's Dublin Bowl");
      expect(tmntFullData.bowl.city).toBe("Dublin");
      expect(tmntFullData.bowl.state).toBe("CA");
      expect(tmntFullData.bowl.url).toBe("https://www.earlanthonysdublinbowl.com");

      // divs
      expect(tmntFullData.divs).toHaveLength(1);
      expect(tmntFullData.divs[0].id).toBe('div_f30aea2c534f4cfe87f4315531cef8ef');
      expect(tmntFullData.divs[0].div_name).toBe('Scratch');

      // brackets
      expect(tmntFullData.divs[0].brkts).toHaveLength(2);
      for (let i = 0; i < 2; i++) {
        expect(tmntFullData.divs[0].brkts[i].squad_id).toBe(gpSquadId);
        expect(tmntFullData.divs[0].brkts[i].brkt_entries).toHaveLength(2);
        expect(tmntFullData.divs[0].brkts[i].admin).toBe('5');
        expect(tmntFullData.divs[0].brkts[i].first).toBe('25');
        expect(tmntFullData.divs[0].brkts[i].second).toBe('10');
        expect(tmntFullData.divs[0].brkts[i].games).toBe(3);
        expect(tmntFullData.divs[0].brkts[i].players).toBe(8);

        // bracket entries and bracket refunds
        if (tmntFullData.divs[0].brkts[i].id === 'brk_5109b54c2cc44ff9a3721de42c80c8c1') {
          expect(tmntFullData.divs[0].brkts[i].start).toBe(1);
          for (let j = 0; j < 2; j++) {
            if (tmntFullData.divs[0].brkts[i].brkt_entries[j].id === 'ben_bc4c581d7b1c4fc99dbdbd46f4f7210a') {
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].num_brackets).toBe(8);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].player_id).toBe('ply_88be0472be3d476ea1caa99dd05953fa');
              // expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].fee).toBe(40);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds).not.toBeNull();
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds.num_refunds).toBe(2)
            } else if (tmntFullData.divs[0].brkts[i].brkt_entries[j].id === 'ben_2291bb31e72b4dc6b6fe9e76d135493d') {
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].num_brackets).toBe(8);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].player_id).toBe('ply_be57bef21fc64d199c2f6de4408bd136');
              // expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].fee).toBe(40);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds).toBeNull();
            } else {
              expect(true).toBeFalsy();
            }
          }
        } else if (tmntFullData.divs[0].brkts[i].id === 'brk_6ede2512c7d4409ca7b055505990a499') {
          expect(tmntFullData.divs[0].brkts[i].start).toBe(4);
          for (let j = 0; j < 2; j++) {
            if (tmntFullData.divs[0].brkts[i].brkt_entries[j].id === 'ben_8f039ee00dfa445c9e3aee0ca9a6391b') {
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].num_brackets).toBe(8);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].player_id).toBe('ply_88be0472be3d476ea1caa99dd05953fa');
              // expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].fee).toBe(40);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds).not.toBeNull();
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds.num_refunds).toBe(2)
            } else if (tmntFullData.divs[0].brkts[i].brkt_entries[j].id === 'ben_0a6938d0a5b94dd789bd3b8663d1ee53') {
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].num_brackets).toBe(8);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].player_id).toBe('ply_be57bef21fc64d199c2f6de4408bd136');
              // expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].fee).toBe(40);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds).toBeNull();
            } else {
              expect(true).toBeFalsy();
            }
          }
        } else {
          expect(true).toBeFalsy();
        }

        // one_brkts and brkt_seeds
        expect(tmntFullData.divs[0].brkts[i].one_brkts).toHaveLength(2);
        if (tmntFullData.divs[0].brkts[i].id === 'brk_5109b54c2cc44ff9a3721de42c80c8c1') {
          for (let j = 0; j < 2; j++) {
            expect(tmntFullData.divs[0].brkts[i].one_brkts[j].brkt_seeds).toHaveLength(8);
            if (tmntFullData.divs[0].brkts[i].one_brkts[j].id === 'obk_557f12f3875f42baa29fdbd22ee7f2f4') {
              expect(tmntFullData.divs[0].brkts[i].one_brkts[j].bindex).toBe(0);
              for (let s = 0; s < 8; s++) {
                const playerId = tmntFullData.divs[0].brkts[i].one_brkts[j].brkt_seeds[s].player_id;
                expect(isValidBtDbId(playerId, 'ply')).toBe(true);
                expect(tmntFullData.divs[0].brkts[i].one_brkts[j].brkt_seeds[s].seed).toBeGreaterThanOrEqual(0);
                expect(tmntFullData.divs[0].brkts[i].one_brkts[j].brkt_seeds[s].seed).toBeLessThanOrEqual(7);
              }
            } else if (tmntFullData.divs[0].brkts[i].one_brkts[j].id === 'obk_5423c16d58a948748f32c7c72c632297') {
              expect(tmntFullData.divs[0].brkts[i].one_brkts[j].bindex).toBe(1);
              for (let s = 0; s < 8; s++) {
                const playerId = tmntFullData.divs[0].brkts[i].one_brkts[j].brkt_seeds[s].player_id;
                expect(isValidBtDbId(playerId, 'ply')).toBe(true);
                expect(tmntFullData.divs[0].brkts[i].one_brkts[j].brkt_seeds[s].seed).toBeGreaterThanOrEqual(0);
                expect(tmntFullData.divs[0].brkts[i].one_brkts[j].brkt_seeds[s].seed).toBeLessThanOrEqual(7);
              }
            } else {
              expect(true).toBeFalsy();
            }
          }
        } else if (tmntFullData.divs[0].brkts[i].id === 'brk_6ede2512c7d4409ca7b055505990a499') {
          for (let j = 0; j < 2; j++) {
            expect(tmntFullData.divs[0].brkts[i].one_brkts[j].brkt_seeds).toHaveLength(8);
            if (tmntFullData.divs[0].brkts[i].one_brkts[j].id === 'obk_8d500123a07d46f9bb23db61e74ffc1b') {
              expect(tmntFullData.divs[0].brkts[i].one_brkts[j].bindex).toBe(0);
              for (let s = 0; s < 8; s++) {
                const playerId = tmntFullData.divs[0].brkts[i].one_brkts[j].brkt_seeds[s].player_id;
                expect(isValidBtDbId(playerId, 'ply')).toBe(true);
                expect(tmntFullData.divs[0].brkts[i].one_brkts[j].brkt_seeds[s].seed).toBeGreaterThanOrEqual(0);
                expect(tmntFullData.divs[0].brkts[i].one_brkts[j].brkt_seeds[s].seed).toBeLessThanOrEqual(7);
              }
            } else if (tmntFullData.divs[0].brkts[i].one_brkts[j].id === 'obk_4ba9e037c86e494eb272efcd989dc9d0') {
              expect(tmntFullData.divs[0].brkts[i].one_brkts[j].bindex).toBe(1);
              for (let s = 0; s < 8; s++) {
                const playerId = tmntFullData.divs[0].brkts[i].one_brkts[j].brkt_seeds[s].player_id;
                expect(isValidBtDbId(playerId, 'ply')).toBe(true);
                expect(tmntFullData.divs[0].brkts[i].one_brkts[j].brkt_seeds[s].seed).toBeGreaterThanOrEqual(0);
                expect(tmntFullData.divs[0].brkts[i].one_brkts[j].brkt_seeds[s].seed).toBeLessThanOrEqual(7);
              }
            } else {
              expect(true).toBeFalsy();
            }
          }
        } else {
          expect(true).toBeFalsy();
        }
      }

      // elims
      expect(tmntFullData.divs[0].elims).toHaveLength(2);
      for (let i = 0; i < 2; i++) {
        expect(tmntFullData.divs[0].elims[i].squad_id).toBe(gpSquadId);
        expect(tmntFullData.divs[0].elims[i].fee).toBe('5');
        expect(tmntFullData.divs[0].elims[i].games).toBe(3);
        expect(tmntFullData.divs[0].elims[i].player_id).not.toBeNull();

        // elim entries
        expect(tmntFullData.divs[0].elims[i].elim_entries).toHaveLength(2);
        if (tmntFullData.divs[0].elims[i].id === 'elm_45d884582e7042bb95b4818ccdd9974c') {
          expect(tmntFullData.divs[0].elims[i].start).toBe(1);
          for (let j = 0; j < 2; j++) {
            expect(tmntFullData.divs[0].elims[i].elim_entries[j].fee).toBe('5');
          }
        } else if (tmntFullData.divs[0].elims[i].id === 'elm_9d01015272b54962a375cf3c91007a12') {
          expect(tmntFullData.divs[0].elims[i].start).toBe(4);
          for (let j = 0; j < 2; j++) {
            expect(tmntFullData.divs[0].elims[i].elim_entries[j].fee).toBe('5');
          }
        } else {
          expect(true).toBeFalsy();
        }
      }

      // pots and pot entries
      expect(tmntFullData.divs[0].pots).toHaveLength(1);
      expect(tmntFullData.divs[0].pots[0].squad_id).toBe(gpSquadId);
      expect(tmntFullData.divs[0].pots[0].id).toBe('pot_b2a7b02d761b4f5ab5438be84f642c3b')
      expect(tmntFullData.divs[0].pots[0].pot_type).toBe('Game');
      expect(tmntFullData.divs[0].pots[0].fee).toBe('20');
      expect(tmntFullData.divs[0].pots[0].pot_entries).toHaveLength(4);
      for (let i = 0; i < 4; i++) {
        expect(tmntFullData.divs[0].pots[0].pot_entries[i].fee).toBe('20');
        expect(tmntFullData.divs[0].pots[0].pot_entries[i].player_id).not.toBeNull();
      }

      // events
      expect(tmntFullData.events).toHaveLength(1);
      expect(tmntFullData.events[0].id).toBe('evt_cb97b73cb538418ab993fc867f860510');
      expect(tmntFullData.events[0].event_name).toBe('Singles');
      expect(tmntFullData.events[0].team_size).toBe(1);
      expect(tmntFullData.events[0].games).toBe(6);
      expect(tmntFullData.events[0].entry_fee).toBe('80');
      expect(tmntFullData.events[0].lineage).toBe('18');
      expect(tmntFullData.events[0].prize_fund).toBe('55');
      expect(tmntFullData.events[0].other).toBe('2');
      expect(tmntFullData.events[0].expenses).toBe('5');
      expect(tmntFullData.events[0].added_money).toBe('0');

      // squads
      expect(tmntFullData.events[0].squads).toHaveLength(1);
      expect(tmntFullData.events[0].squads[0].id).toBe(gpSquadId);
      expect(tmntFullData.events[0].squads[0].squad_name).toBe('Squad 1');
      expect(tmntFullData.events[0].squads[0].games).toBe(6);
      expect(tmntFullData.events[0].squads[0].lane_count).toBe(12);
      expect(tmntFullData.events[0].squads[0].starting_lane).toBe(29);

      // stage
      expect(tmntFullData.events[0].squads[0].stage).toBeDefined();
      expect(tmntFullData.events[0].squads[0].stage).not.toBeNull();
      expect(tmntFullData.events[0].squads[0].stage.id).toBe(gpStageId);
      expect(tmntFullData.events[0].squads[0].stage.squad_id).toBe(gpSquadId);
      expect(tmntFullData.events[0].squads[0].stage.stage).toBe('DEFINE');

      // lanes
      expect(tmntFullData.events[0].squads[0].lanes).toHaveLength(12);
      for (let l = 0; l < 12; l++) {
        expect(tmntFullData.events[0].squads[0].lanes[l].lane_number).toBe(l + 29);
        expect(tmntFullData.events[0].squads[0].lanes[l].in_use).toBe(true);
      }

      // players
      expect(tmntFullData.events[0].squads[0].players).toHaveLength(9);
      // 8 players, 1 bye
      for (let p = 0; p < 8; p++) {
        const lane = 1 + Math.floor(p / 4);
        expect(tmntFullData.events[0].squads[0].players[p].lane).toBe(lane);

        const positions = ["A", "B", "C", "D", "E", "F", "G", "H"];
        const position = positions[p];
        expect(tmntFullData.events[0].squads[0].players[p].position).toBe(position)

        const id = tmntFullData.events[0].squads[0].players[p].id
        expect(isValidBtDbId(id, 'ply')).toBe(true);

        expect(tmntFullData.events[0].squads[0].players[p].first_name).not.toBeNull();
        expect(tmntFullData.events[0].squads[0].players[p].last_name).not.toBeNull();
        expect(tmntFullData.events[0].squads[0].players[p].average).toBeGreaterThan(190);
        expect(tmntFullData.events[0].squads[0].players[p].average).toBeLessThan(231);
        expect(tmntFullData.events[0].squads[0].players[p].usbc).toBeNull();
      }
      const byePlayer = tmntFullData.events[0].squads[0].players[8];
      expect(isValidBtDbId(byePlayer.id, 'bye')).toBe(true);
      expect(byePlayer.average).toBe(0);
      expect(byePlayer.lane).toBeNull();
      expect(byePlayer.position).toBeNull();
      expect(byePlayer.first_name).toBe("Bye");
      expect(byePlayer.last_name).toBeNull();
      expect(byePlayer.usbc).toBeNull();
    })
    it('should return just tmnt data if not events, divs, squads, lanes, pots, brkts or elims', async () => {
      const justTmntId = 'tmt_a78f073789cc0f8a9a0de8c6e273eab1';
      const justBowlId = 'bwl_561540bd64974da9abdd97765fdb3659';

      const response = await axios({
        method: "get",
        withCredentials: true,
        url: fullUrl + justTmntId,
      });
      expect(response.status).toBe(200);
      expect(response.data.tmntFullData).not.toBeNull();
      const tmntFullData = response.data.tmntFullData;
      expect(tmntFullData.id).toBe(justTmntId);
      expect(tmntFullData.bowl_id).toBe(justBowlId);
      expect(tmntFullData.tmnt_name).toBe("Gold Pin");
      expect(tmntFullData.bowl).not.toBeNull();
      expect(tmntFullData.bowl.id).toBe(justBowlId);
      expect(tmntFullData.bowl.bowl_name).toBe("Earl Anthony's Dublin Bowl");
      expect(tmntFullData.bowl.city).toBe("Dublin");
      expect(tmntFullData.bowl.state).toBe("CA");
      expect(tmntFullData.bowl.url).toBe("https://www.earlanthonysdublinbowl.com");

      expect(tmntFullData.divs).toHaveLength(0);
      expect(tmntFullData.events).toHaveLength(0);    
      // no squads, lanes, pots, brkts, elims
    })
    it('should throw error if the tmnt does not exist', async () => {
      try {
        const response = await axios.get(fullUrl + notFoundId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should throw error if the tmnt id is invalid', async () => {
      try {
        const response = await axios.get(fullUrl + 'invalidId');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should throw error if the tmnt id is valid, but not a tmnt id', async () => {
      try {
        const response = await axios.get(fullUrl + userId);
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

  describe('POST', () => {

    let createdTmnt = false;

    beforeAll(async () => {
      await deletePostedTmnt(tmntToPost.id);
      await resetTmnt();
    })

    beforeEach(() => {
      createdTmnt = false;
    })

    afterEach(async () => {
      if (createdTmnt) {
        await deletePostedTmnt(tmntToPost.id);
      }
    })

    it('should create a new tmnt', async () => {
      const tmntJSON = JSON.stringify(tmntToPost);
      const response = await axios.post(url, tmntJSON, {
        withCredentials: true,
      });
      expect(response.status).toBe(201);
      const postedTmnt = response.data.tmnt;
      createdTmnt = true
      expect(postedTmnt.id).toBe(tmntToPost.id);
      expect(postedTmnt.tmnt_name).toBe(tmntToPost.tmnt_name);
      expect(postedTmnt.user_id).toBe(tmntToPost.user_id);
      expect(postedTmnt.bowl_id).toBe(tmntToPost.bowl_id);
      expect(removeTimeFromISODateStr(postedTmnt.start_date)).toBe(tmntToPost.start_date_str);
      expect(removeTimeFromISODateStr(postedTmnt.end_date)).toBe(tmntToPost.end_date_str);
    })
    it('should create a new tmnt with sanitized data', async () => {
      const toSanitizeTmnt = {
        ...tmntToPost,        
        tmnt_name: "    <script>" + tmntToPost.tmnt_name + "</script>   ",
      }
      const tmntJSON = JSON.stringify(toSanitizeTmnt);
      const response = await axios.post(url, tmntJSON, {
        withCredentials: true,
      });
      expect(response.status).toBe(201);
      const postedTmnt = response.data.tmnt;
      createdTmnt = true;
      expect(postedTmnt.id).toBe(toSanitizeTmnt.id); // use toSanitizeTmnt.id here
      expect(postedTmnt.tmnt_name).toBe('script' + tmntToPost.tmnt_name + 'script');
      expect(removeTimeFromISODateStr(postedTmnt.start_date)).toBe(tmntToPost.start_date_str);
      expect(removeTimeFromISODateStr(postedTmnt.end_date)).toBe(tmntToPost.end_date_str);
    });
    it('should not create a new tmnt with bowl_id that does not exist', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        bowl_id: notFoundBowlId,
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.post(url, tmntJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not create a new tmnt with user_id that does not exist', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        user_id: notFoundUserId,
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.post(url, tmntJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with missing id', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        id: "",
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.post(url, tmntJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with missing tmnt_name', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        tmnt_name: "",
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.post(url, tmntJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with missing bowl_id', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        bowl_id: "",
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.post(url, tmntJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with missing user_id', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        user_id: "",
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.post(url, tmntJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with blank start_date', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        start_date_str: '',
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.post(url, tmntJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with blank end_date', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        end_date_str: '',
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.post(url, tmntJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with non data start_date', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        start_date_str: "test",
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.post(url, tmntJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with non data end_date', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        end_date_str: "test",
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.post(url, tmntJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with tmnt_name is too long', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        tmnt_name: "a".repeat(100),
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.post(url, tmntJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with invalid start_date', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        start_date_str: '1800-01-01',
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.post(url, tmntJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with unsanitzied start_date', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        start_date_str: '<script>alert(1)</script>',
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.post(url, tmntJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with invalid end_date', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        end_date_str: '2300-01-01',
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.post(url, tmntJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with unsanitzied end_date', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        end_date_str: '<script>alert(1)</script>',
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.post(url, tmntJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with invalid bowl_id', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        bowl_id: 'invalid',
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.post(url, tmntJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with valid id, but not a bowl_id', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        bowl_id: nonTmntId,
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.post(url, tmntJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with invalid user_id', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        user_id: 'invalid',
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.post(url, tmntJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with valid id, but not a user_id', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        user_id: nonTmntId,
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.post(url, tmntJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not create a new tmnt with duplicate id', async () => {
      const tmntJSON = JSON.stringify(tmntToPost);
      const response = await axios.post(url, tmntJSON, {
        withCredentials: true,
      });
      expect(response.status).toBe(201);
      createdTmnt = true;
      try {
        const response2 = await axios.post(url, tmntJSON, {
          withCredentials: true,
        });
        expect(response2.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
  });

});
