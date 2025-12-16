import axios, { AxiosError } from "axios";
import { baseTmntsApi } from "@/lib/db/apiPaths";
import { testBaseTmntsApi } from "../../../testApi";
import { bowlType, tmntType, YearObj } from "@/lib/types/types";
import { initBowl, initTmnt } from "@/lib/db/initVals";
import { removeTimeFromISODateStr, todayStr } from "@/lib/dateTools";
import { btDbUuid } from "@/lib/uuid";
import { isValidBtDbId } from "@/lib/validation";
import { cloneDeep } from "lodash";
import { deleteTmnt, getTmntFullData } from "@/lib/db/tmnts/dbTmnts";
import {
  mockBowl,
  mockTmntFullData,
} from "../../../mocks/tmnts/tmntFulldata/mockTmntFullData";
import { deleteBowl, postBowl } from "@/lib/db/bowls/dbBowls";

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
const fullEntriesUrl = url + "/fullEntries/";
const tmntUrl = url + "/tmnt/";
const userUrl = url + "/user/";
const yearsUrl = url + "/years/";
const allResultsUrl = url + "/results";
const resultsUrl = url + "/results/";

describe("Tmnts - API: /api/tmnts", () => {
  const tmntId = "tmt_f4d563425ba04b7dac3a97c0a90fc2c9"; // not in database
  const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
  const bowlId = "bwl_561540bd64974da9abdd97765fdb3659";

  const testTmntName = "Test Tournament";

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

  const toPatchTmnt = {
    id: testTmnt.id,
    user_id: testTmnt.user_id,
  };

  const notFoundId = "tmt_01234567890123456789012345678901";
  const notFoundBowlId = "bwl_01234567890123456789012345678901";
  const notFoundUserId = "usr_01234567890123456789012345678901";
  const nonTmntId = "evt_01234567890123456789012345678901";

  const tmnt2Id = "tmt_56d916ece6b50e6293300248c6792316";
  const bowl2Id = "bwl_8b4a5c35ad1247049532ff53a12def0a";
  const bowl3Id = "bwl_ff4cd62b03f24017beea81c1d6e047e7";
  const user1Id = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
  const user2Id = "usr_516a113083983234fc316e31fb695b85";

  const deletePostedTmnt = async () => {
    const response = await axios.get(url);
    const tmnts = response.data.tmnts;
    const toDel = tmnts.find((t: tmntType) => t.tmnt_name === testTmntName);
    if (toDel) {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + toDel.id,
        });
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }
  };

  const resetTmnt = async () => {
    // make sure test tmnt is reset in database
    const tmntJSON = JSON.stringify(testTmnt);
    const response = await axios({
      method: "put",
      data: tmntJSON,
      withCredentials: true,
      url: tmntUrl + testTmnt.id,
    });
  };

  describe('GET', () => {

    beforeAll(async () => {
      await deletePostedTmnt();
    })

    it('should get all tmnts', async () => {
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      // 14 rows in prisma/seed.ts
      expect(response.data.tmnts).toHaveLength(14);
    })

  })

  describe('GET tmnt by ID - API: API: /api/tmnts/tmnt/:id', () => {

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
      expect(tmnt.bowls).not.toBeNull();
      expect(tmnt.bowls.bowl_name).toBe(testBowl.bowl_name);
      expect(tmnt.bowls.city).toBe(testBowl.city);
      expect(tmnt.bowls.state).toBe(testBowl.state);
      expect(tmnt.bowls.url).toBe(testBowl.url);
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

    it('should get all tmnts for user', async () => {
      const response = await axios.get(userUrl + userId);
      expect(response.status).toBe(200);
      // 11 tmnt rows for user in prisma/seed.ts
      expect(response.data.tmnts).toHaveLength(11);
      const tmnts = response.data.tmnts;
      expect(tmnts[0].user_id).toBe(userId);
      expect(tmnts[10].user_id).toBe(userId);
      // tmnts sorted by date, newest to oldest      
      expect(tmnts[0].id).toBe('tmt_e134ac14c5234d708d26037ae812ac33')
      expect(removeTimeFromISODateStr(tmnts[0].start_date)).toBe('2026-08-19')
      expect(tmnts[1].id).toBe('tmt_ce35f0c119aa49fd9b89aa86cb980a6a')
      expect(removeTimeFromISODateStr(tmnts[1].start_date)).toBe('2025-12-31')
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
      // if row left over from post test, then delete it
      await deletePostedTmnt();
    })

    it('should get array of years from 2023 and older API: /api/tmnts/years/yyyy', async () => {
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: yearsUrl + '2023',
      });
      expect(response.status).toBe(200);
      expect(response.data.years).toHaveLength(2);
      const years: YearObj[] = response.data.years;
      // years sorted newest to oldest
      expect(years[0].year).toBe('2023');
      expect(years[1].year).toBe('2022');
    })
    it('should get array of all years from today and before API: /api/tmnts/years/yyyy', async () => {
      const yearStr = todayStr.substring(0, 4);
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: yearsUrl + yearStr,
      });
      expect(response.status).toBe(200);
      expect(response.data.years.length).toBeGreaterThanOrEqual(1)
      const years: YearObj[] = response.data.years;
      // years sorted newest to oldest
      for (let i = 0; i < years.length -1; i++) {
        expect(Number(years[i].year)).toBeGreaterThan(Number(years[i+1].year));
      }
    })
  })

  describe('GET all tmnt results - API: /api/tmnts/results', () => {

    beforeAll(async () => {
      // if row left over from post test, then delete it
      await deletePostedTmnt();
    })

    it('should get array of all tmnt results API: /api/tmnts/results', async () => {
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: allResultsUrl,
      });
      expect(response.status).toBe(200);
      // 13 rows for results in prisma/seed.ts
      expect(response.data.tmnts).toHaveLength(12);
      const tmnts = response.data.tmnts;
      expect(tmnts[0].bowls).not.toBeNull();
      // tmnts sorted by date newest to oldest
      expect(removeTimeFromISODateStr(tmnts[0].start_date)).toBe('2024-12-20');
    })
    it('should get array of tmnt results by year for 2022 API: /api/tmnts/results/yyyy', async () => {
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: resultsUrl + '2022',
      });
      expect(response.status).toBe(200);
      // 3 rows for results in prisma/seed.ts for 2022
      expect(response.data.tmnts).toHaveLength(3);
      const tmnts = response.data.tmnts;
      expect(tmnts[0].bowls).not.toBeNull();
      // tmnts sorted by date newest to oldest
      expect(removeTimeFromISODateStr(tmnts[0].start_date)).toBe('2022-10-23');
    })
    it('should get array of tmnt results by year for 2000 API: /api/tmnts/results/yyyy', async () => {
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: resultsUrl + '2000',
      });
      expect(response.status).toBe(200);
      // 0 rows for results in prisma/seed.ts for 2022
      expect(response.data.tmnts).toHaveLength(0);
    })
  })

  describe('GET upcoming tmnt - API: /api/tmnts/upcoming', () => {

    beforeAll(async () => {
      // if row left over from post test, then delete it
      await deletePostedTmnt();
    })

    it('should get array of upcoming tmnts API: /api/tmnts/upcoming', async () => {
      const upcomingUrl = url + "/upcoming";
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: upcomingUrl,
      });
      expect(response.status).toBe(200);
      // 1 rows for upcoming in prisma/seed.ts
      expect(response.data.tmnts).toHaveLength(2);
      const tmnts = response.data.tmnts;
      expect(tmnts[0].bowls).not.toBeNull();
      // tmnts sorted by date newest to oldest
      expect(removeTimeFromISODateStr(tmnts[0].start_date)).toBe('2026-08-19');
      expect(removeTimeFromISODateStr(tmnts[1].start_date)).toBe('2025-12-31');
    })
  })

  describe('GET tmnt full data - API: /api/tmnts/full', () => {

    beforeAll(async () => {
      // if row left over from post test, then delete it
      await deletePostedTmnt();
    })

    it('should get tmnt full data object for Full Tournament', async () => {
      const fullTmntId = 'tmt_d237a388a8fc4641a2e37233f1d6bebd';
      const fullBowlId = 'bwl_561540bd64974da9abdd97765fdb3659';
      const fullDivId = 'div_99a3cae28786485bb7a036935f0f6a0a';
      const fillEventId = 'evt_4ff710c8493f4a218d2e2b045442974a';
      const fullSquadId = 'sqd_8e4266e1174642c7a1bcec47a50f275f';

      const response = await axios({
        method: "get",
        withCredentials: true,
        url: fullUrl + fullTmntId,
      });
      expect(response.status).toBe(200);
      expect(response.data.tmntFullData).not.toBeNull();
      const tmntFullData = response.data.tmntFullData;
      expect(tmntFullData.id).toBe(fullTmntId);
      expect(tmntFullData.bowl_id).toBe(fullBowlId);
      expect(tmntFullData.tmnt_name).toBe("Full Tournament");

      // bowls
      expect(tmntFullData.bowls).not.toBeNull();
      expect(tmntFullData.bowls.id).toBe(fullBowlId);
      expect(tmntFullData.bowls.bowl_name).toBe("Earl Anthony's Dublin Bowl");
      expect(tmntFullData.bowls.city).toBe("Dublin");
      expect(tmntFullData.bowls.state).toBe("CA");
      expect(tmntFullData.bowls.url).toBe("https://www.earlanthonysdublinbowl.com");

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
        expect(tmntFullData.divs[0].brkts[i].fsa).toBe('40');
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
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].fee).toBe(105);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds).not.toBeNull();
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds.num_refunds).toBe(4)
            } else if (tmntFullData.divs[0].brkts[i].brkt_entries[j].id === 'ben_c0326ba58d3f4a7d950101a5674ce595') {
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].num_brackets).toBe(8);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].player_id).toBe('ply_a02758cff1cc4bab9d9133e661bd49b0');
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].fee).toBe(40);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds).toBeNull();
            } else {
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].player_id).not.toBeNull();
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].fee).toBeGreaterThan(0);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds).toBeNull();
            }
          }
        } else if (tmntFullData.divs[0].brkts[i].id === 'brk_fd88cd2f5a164e8c8f758daae18bfc83') {
          expect(tmntFullData.divs[0].brkts[i].start).toBe(4);
          for (let j = 0; j < 20; j++) {
            if (tmntFullData.divs[0].brkts[i].brkt_entries[j].id === 'ben_c2226ba58d3f4a7d950101a5674ce595') {
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].num_brackets).toBe(21);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].player_id).toBe('ply_a11758cff1cc4bab9d9133e661bd49b0');
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].fee).toBe(105);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds).not.toBeNull();
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds.num_refunds).toBe(4)
            } else if (tmntFullData.divs[0].brkts[i].brkt_entries[j].id === 'ben_c0426ba58d3f4a7d950101a5674ce595') {
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].num_brackets).toBe(8);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].player_id).toBe('ply_a02758cff1cc4bab9d9133e661bd49b0');
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].fee).toBe(40);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds).toBeNull();
            } else {
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].player_id).not.toBeNull();
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].fee).toBeGreaterThan(0);
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
      expect(tmntFullData.events[0].lpox).toBe('90');

      // squads
      expect(tmntFullData.events[0].squads).toHaveLength(1);
      expect(tmntFullData.events[0].squads[0].id).toBe(fullSquadId);
      expect(tmntFullData.events[0].squads[0].squad_name).toBe('Squad 1');
      expect(tmntFullData.events[0].squads[0].games).toBe(6);
      expect(tmntFullData.events[0].squads[0].lane_count).toBe(12);
      expect(tmntFullData.events[0].squads[0].starting_lane).toBe(29);

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
      expect(tmntFullData.bowls).not.toBeNull();
      expect(tmntFullData.bowls.id).toBe(yoBowlId);
      expect(tmntFullData.bowls.bowl_name).toBe("Yosemite Lanes");
      expect(tmntFullData.bowls.city).toBe("Modesto");
      expect(tmntFullData.bowls.state).toBe("CA");
      expect(tmntFullData.bowls.url).toBe("http://yosemitelanes.com");

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

      const response = await axios({
        method: "get",
        withCredentials: true,
        url: fullUrl + gpTmntId,
      });
      expect(response.status).toBe(200);
      expect(response.data.tmntFullData).not.toBeNull();
      const tmntFullData = response.data.tmntFullData;
      expect(tmntFullData.id).toBe(gpTmntId);
      expect(tmntFullData.bowl_id).toBe(gpBowlId);
      expect(tmntFullData.tmnt_name).toBe("Gold Pin");

      // bowls
      expect(tmntFullData.bowls).not.toBeNull();
      expect(tmntFullData.bowls.id).toBe(gpBowlId);
      expect(tmntFullData.bowls.bowl_name).toBe("Earl Anthony's Dublin Bowl");
      expect(tmntFullData.bowls.city).toBe("Dublin");
      expect(tmntFullData.bowls.state).toBe("CA");
      expect(tmntFullData.bowls.url).toBe("https://www.earlanthonysdublinbowl.com");
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
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].fee).toBe(40);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds).not.toBeNull();
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds.num_refunds).toBe(2)
            } else if (tmntFullData.divs[0].brkts[i].brkt_entries[j].id === 'ben_2291bb31e72b4dc6b6fe9e76d135493d') {
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].num_brackets).toBe(8);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].player_id).toBe('ply_be57bef21fc64d199c2f6de4408bd136');
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].fee).toBe(40);
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
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].fee).toBe(40);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds).not.toBeNull();
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].brkt_refunds.num_refunds).toBe(2)
            } else if (tmntFullData.divs[0].brkts[i].brkt_entries[j].id === 'ben_0a6938d0a5b94dd789bd3b8663d1ee53') {
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].num_brackets).toBe(8);
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].player_id).toBe('ply_be57bef21fc64d199c2f6de4408bd136');
              expect(tmntFullData.divs[0].brkts[i].brkt_entries[j].fee).toBe(40);
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
      expect(tmntFullData.bowls).not.toBeNull();
      expect(tmntFullData.bowls.id).toBe(justBowlId);
      expect(tmntFullData.bowls.bowl_name).toBe("Earl Anthony's Dublin Bowl");
      expect(tmntFullData.bowls.city).toBe("Dublin");
      expect(tmntFullData.bowls.state).toBe("CA");
      expect(tmntFullData.bowls.url).toBe("https://www.earlanthonysdublinbowl.com");
      expect(tmntFullData.divs).toHaveLength(0);
      expect(tmntFullData.events).toHaveLength(0);
      // no squads, lanes, pots, brkts, elims
    })
    it('should throw error if the tmnt does not exist', async () => {
      try {
        const response = await axios({
          method: "get",
          withCredentials: true,
          url: fullUrl + notFoundId,
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
    it('should throw error if the tmnt id is invalid', async () => {
      try {
        const response = await axios({
          method: "get",
          withCredentials: true,
          url: fullUrl + 'test',
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
    it('should throw error if the tmnt id is valid, but not a tmnt id', async () => {
      try {
        const response = await axios({
          method: "get",
          withCredentials: true,
          url: fullUrl + userId,
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
  })

  describe('POST', () => {

    const tmntToPost = {
      ...initTmnt,
      user_id: user1Id,
      tmnt_name: "Test Tournament",
      bowl_id: bowlId,
      start_date_str: todayStr,
      end_date_str: todayStr,
    }

    let createdTmnt = false;

    beforeAll(async () => {
      await deletePostedTmnt();
    })

    beforeEach(() => {
      createdTmnt = false;
    })

    afterEach(async () => {
      if (createdTmnt) {
        await deletePostedTmnt();
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
    it('should create a new tmnt with sanitized data', async () => {
      const toSanitizeTmnt = {
        ...tmntToPost,
        id: btDbUuid('tmt'),
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
      expect(postedTmnt.tmnt_name).toBe(tmntToPost.tmnt_name);
      expect(removeTimeFromISODateStr(postedTmnt.start_date)).toBe(tmntToPost.start_date_str);
      expect(removeTimeFromISODateStr(postedTmnt.end_date)).toBe(tmntToPost.end_date_str);
    });
  });

  describe("PUT tmnt full data - API: /api/tmnts/full/:id", () => {
    let createdTmnt = false;

    beforeAll(async () => {
      try {
        await deleteTmnt(mockTmntFullData.tmnt.id);
        await deleteBowl(mockBowl.id);
        await postBowl(mockBowl);
      } catch {
        // do nothing if cannot delete
      }
    });

    beforeEach(() => {
      createdTmnt = false;
    });

    afterEach(async () => {
      if (createdTmnt) {
        await deleteTmnt(mockTmntFullData.tmnt.id);
      }
    });

    afterAll(async () => {
      await deleteBowl(mockBowl.id);
    });

    it("should PUT (replace) a full tmnt, all child, grandchild tables", async () => {
      const tmntJSON = JSON.stringify(mockTmntFullData);
      const response = await axios.put(
        fullUrl + mockTmntFullData.tmnt.id,
        tmntJSON,
        {
          withCredentials: true,
        }
      );

      expect(response.status).toBe(200);
      createdTmnt = true;
      expect(response.data.success).toBe(true);

      const postedTmnt = await getTmntFullData(mockTmntFullData.tmnt.id);
      expect(postedTmnt).not.toBeNull();

      // required parent table - tmnt
      expect(postedTmnt.tmnt.id).toBe(mockTmntFullData.tmnt.id);
      expect(postedTmnt.tmnt.tmnt_name).toBe(mockTmntFullData.tmnt.tmnt_name);
      expect(postedTmnt.tmnt.start_date_str).toBe(
        mockTmntFullData.tmnt.start_date_str
      );
      expect(postedTmnt.tmnt.end_date_str).toBe(
        mockTmntFullData.tmnt.end_date_str
      );
      // required child tables
      // events
      expect(postedTmnt.events).toHaveLength(mockTmntFullData.events.length);
      const event = postedTmnt.events[0];
      const testEvent = mockTmntFullData.events[0];
      expect(event.id).toBe(testEvent.id);
      expect(event.tmnt_id).toBe(testEvent.tmnt_id);
      expect(event.event_name).toBe(testEvent.event_name);
      expect(event.team_size).toBe(testEvent.team_size);
      expect(event.games).toBe(testEvent.games);
      expect(event.entry_fee).toBe(testEvent.entry_fee);
      expect(event.lineage).toBe(testEvent.lineage);
      expect(event.prize_fund).toBe(testEvent.prize_fund);
      expect(event.other).toBe(testEvent.other);
      expect(event.expenses).toBe(testEvent.expenses);
      expect(event.added_money).toBe(testEvent.added_money);
      expect(event.sort_order).toBe(testEvent.sort_order);
      // divs
      expect(postedTmnt.divs).toHaveLength(mockTmntFullData.divs.length);
      const divs = postedTmnt.divs;
      const testDivs = mockTmntFullData.divs;
      for (let i = 0; i < divs.length; i++) {
        if (divs[i].id === testDivs[0].id) {
          expect(divs[i].tmnt_id).toBe(testDivs[0].tmnt_id);
          expect(divs[i].div_name).toBe(testDivs[0].div_name);
          expect(divs[i].hdcp_per).toBe(testDivs[0].hdcp_per);
          expect(divs[i].hdcp_from).toBe(testDivs[0].hdcp_from);
          expect(divs[i].int_hdcp).toBe(testDivs[0].int_hdcp);
          expect(divs[i].hdcp_for).toBe(testDivs[0].hdcp_for);
          expect(divs[i].sort_order).toBe(testDivs[0].sort_order);
        } else if (divs[i].id === testDivs[1].id) {
          expect(divs[i].tmnt_id).toBe(testDivs[1].tmnt_id);
          expect(divs[i].div_name).toBe(testDivs[1].div_name);
          expect(divs[i].hdcp_per).toBe(testDivs[1].hdcp_per);
          expect(divs[i].hdcp_from).toBe(testDivs[1].hdcp_from);
          expect(divs[i].int_hdcp).toBe(testDivs[1].int_hdcp);
          expect(divs[i].hdcp_for).toBe(testDivs[1].hdcp_for);
          expect(divs[i].sort_order).toBe(testDivs[1].sort_order);
        } else {
          expect(true).toBeFalsy();
        }
      }
      // squads
      expect(postedTmnt.squads).toHaveLength(mockTmntFullData.squads.length);
      const squad = postedTmnt.squads[0];
      const testSquad = mockTmntFullData.squads[0];
      expect(squad.id).toBe(testSquad.id);
      expect(squad.event_id).toBe(testSquad.event_id);
      expect(squad.squad_name).toBe(testSquad.squad_name);
      expect(squad.games).toBe(testSquad.games);
      expect(squad.starting_lane).toBe(testSquad.starting_lane);
      expect(squad.lane_count).toBe(testSquad.lane_count);
      expect(squad.squad_date_str).toBe(testSquad.squad_date_str);
      expect(squad.squad_time).toBe(testSquad.squad_time);
      expect(squad.sort_order).toBe(testSquad.sort_order);

      // lanes
      expect(postedTmnt.lanes).toHaveLength(mockTmntFullData.lanes.length);
      const lanes = postedTmnt.lanes;
      const testLanes = mockTmntFullData.lanes;
      for (let i = 0; i < lanes.length; i++) {
        if (lanes[i].id === testLanes[0].id) {
          expect(lanes[i].squad_id).toBe(testLanes[0].squad_id);
          expect(lanes[i].lane_number).toBe(testLanes[0].lane_number);
          expect(lanes[i].in_use).toBe(testLanes[0].in_use);
        } else if (lanes[i].id === testLanes[1].id) {
          expect(lanes[i].squad_id).toBe(testLanes[1].squad_id);
          expect(lanes[i].lane_number).toBe(testLanes[1].lane_number);
          expect(lanes[i].in_use).toBe(testLanes[1].in_use);
        } else if (lanes[i].id === testLanes[2].id) {
          expect(lanes[i].squad_id).toBe(testLanes[2].squad_id);
          expect(lanes[i].lane_number).toBe(testLanes[2].lane_number);
          expect(lanes[i].in_use).toBe(testLanes[2].in_use);
        } else if (lanes[i].id === testLanes[3].id) {
          expect(lanes[i].squad_id).toBe(testLanes[3].squad_id);
          expect(lanes[i].lane_number).toBe(testLanes[3].lane_number);
          expect(lanes[i].in_use).toBe(testLanes[3].in_use);
        } else {
          expect(true).toBeFalsy();
        }
      }

      // optional child tables
      // pots
      expect(postedTmnt.pots).toHaveLength(mockTmntFullData.pots.length);
      const pots = postedTmnt.pots;
      const testPots = mockTmntFullData.pots;
      for (let i = 0; i < pots.length; i++) {
        if (pots[i].id === testPots[0].id) {
          expect(pots[0].squad_id).toBe(testPots[0].squad_id);
          expect(pots[0].div_id).toBe(testPots[0].div_id);
          expect(pots[0].sort_order).toBe(testPots[0].sort_order);
          expect(pots[0].fee).toBe(testPots[0].fee);
          expect(pots[0].pot_type).toBe(testPots[0].pot_type);
        } else if (pots[i].id === testPots[1].id) {
          expect(pots[1].squad_id).toBe(testPots[1].squad_id);
          expect(pots[1].div_id).toBe(testPots[1].div_id);
          expect(pots[1].sort_order).toBe(testPots[1].sort_order);
          expect(pots[1].fee).toBe(testPots[1].fee);
          expect(pots[1].pot_type).toBe(testPots[1].pot_type);
        } else if (pots[i].id === testPots[2].id) {
          expect(pots[2].squad_id).toBe(testPots[2].squad_id);
          expect(pots[2].div_id).toBe(testPots[2].div_id);
          expect(pots[2].sort_order).toBe(testPots[2].sort_order);
          expect(pots[2].fee).toBe(testPots[2].fee);
          expect(pots[2].pot_type).toBe(testPots[2].pot_type);
        } else if (pots[i].id === testPots[3].id) {
          expect(pots[3].squad_id).toBe(testPots[3].squad_id);
          expect(pots[3].div_id).toBe(testPots[3].div_id);
          expect(pots[3].sort_order).toBe(testPots[3].sort_order);
          expect(pots[3].fee).toBe(testPots[3].fee);
          expect(pots[3].pot_type).toBe(testPots[3].pot_type);
        } else {
          expect(true).toBeFalsy();
        }
      }
      // brkts
      expect(postedTmnt.brkts).toHaveLength(mockTmntFullData.brkts.length);
      const brkts = postedTmnt.brkts;
      const testBrkts = mockTmntFullData.brkts;
      for (let i = 0; i < brkts.length; i++) {
        if (brkts[i].id === testBrkts[0].id) {
          expect(brkts[i].squad_id).toBe(testBrkts[0].squad_id);
          expect(brkts[i].div_id).toBe(testBrkts[0].div_id);
          expect(brkts[i].sort_order).toBe(testBrkts[0].sort_order);
          expect(brkts[i].start).toBe(testBrkts[0].start);
          expect(brkts[i].games).toBe(testBrkts[0].games);
          expect(brkts[i].players).toBe(testBrkts[0].players);
          expect(brkts[i].fee).toBe(testBrkts[0].fee);
          expect(brkts[i].first).toBe(testBrkts[0].first);
          expect(brkts[i].second).toBe(testBrkts[0].second);
          expect(brkts[i].admin).toBe(testBrkts[0].admin);
        } else if (brkts[i].id === testBrkts[1].id) {
          expect(brkts[i].squad_id).toBe(testBrkts[1].squad_id);
          expect(brkts[i].div_id).toBe(testBrkts[1].div_id);
          expect(brkts[i].sort_order).toBe(testBrkts[1].sort_order);
          expect(brkts[i].start).toBe(testBrkts[1].start);
          expect(brkts[i].games).toBe(testBrkts[1].games);
          expect(brkts[i].players).toBe(testBrkts[1].players);
          expect(brkts[i].fee).toBe(testBrkts[1].fee);
          expect(brkts[i].first).toBe(testBrkts[1].first);
          expect(brkts[i].second).toBe(testBrkts[1].second);
          expect(brkts[i].admin).toBe(testBrkts[1].admin);
        } else if (brkts[i].id === testBrkts[2].id) {
          expect(brkts[i].squad_id).toBe(testBrkts[2].squad_id);
          expect(brkts[i].div_id).toBe(testBrkts[2].div_id);
          expect(brkts[i].sort_order).toBe(testBrkts[2].sort_order);
          expect(brkts[i].start).toBe(testBrkts[2].start);
          expect(brkts[i].games).toBe(testBrkts[2].games);
          expect(brkts[i].players).toBe(testBrkts[2].players);
          expect(brkts[i].fee).toBe(testBrkts[2].fee);
          expect(brkts[i].first).toBe(testBrkts[2].first);
          expect(brkts[i].second).toBe(testBrkts[2].second);
          expect(brkts[i].admin).toBe(testBrkts[2].admin);
        } else if (brkts[i].id === testBrkts[3].id) {
          expect(brkts[i].squad_id).toBe(testBrkts[3].squad_id);
          expect(brkts[i].div_id).toBe(testBrkts[3].div_id);
          expect(brkts[i].sort_order).toBe(testBrkts[3].sort_order);
          expect(brkts[i].start).toBe(testBrkts[3].start);
          expect(brkts[i].games).toBe(testBrkts[3].games);
          expect(brkts[i].players).toBe(testBrkts[3].players);
          expect(brkts[i].fee).toBe(testBrkts[3].fee);
          expect(brkts[i].first).toBe(testBrkts[3].first);
          expect(brkts[i].second).toBe(testBrkts[3].second);
          expect(brkts[i].admin).toBe(testBrkts[3].admin);
        } else {
          expect(true).toBeFalsy();
        }
      }
      // elims
      expect(postedTmnt.elims).toHaveLength(mockTmntFullData.elims.length);
      const elims = postedTmnt.elims;
      const testElims = mockTmntFullData.elims;
      for (let i = 0; i < elims.length; i++) {
        if (elims[i].id === testElims[0].id) {
          expect(elims[i].squad_id).toBe(testElims[0].squad_id);
          expect(elims[i].div_id).toBe(testElims[0].div_id);
          expect(elims[i].sort_order).toBe(testElims[0].sort_order);
          expect(elims[i].start).toBe(testElims[0].start);
          expect(elims[i].games).toBe(testElims[0].games);
          expect(elims[i].fee).toBe(testElims[0].fee);
        } else if (elims[i].id === testElims[1].id) {
          expect(elims[i].squad_id).toBe(testElims[1].squad_id);
          expect(elims[i].div_id).toBe(testElims[1].div_id);
          expect(elims[i].sort_order).toBe(testElims[1].sort_order);
          expect(elims[i].start).toBe(testElims[1].start);
          expect(elims[i].games).toBe(testElims[1].games);
          expect(elims[i].fee).toBe(testElims[1].fee);
        } else {
          expect(true).toBeFalsy();
        }
      }

      // run tmnt grandchild / great grandchild tables
      // players
      expect(postedTmnt.players).toHaveLength(mockTmntFullData.players.length);
      const players = postedTmnt.players;
      const testPlayers = mockTmntFullData.players;
      for (let i = 0; i < players.length; i++) {
        if (players[i].id === testPlayers[0].id) {
          expect(players[i].squad_id).toBe(testPlayers[0].squad_id);
          expect(players[i].first_name).toBe(testPlayers[0].first_name);
          expect(players[i].last_name).toBe(testPlayers[0].last_name);
          expect(players[i].average).toBe(testPlayers[0].average);
          expect(players[i].lane).toBe(testPlayers[0].lane);
          expect(players[i].position).toBe(testPlayers[0].position);
        } else if (players[i].id === testPlayers[1].id) {
          expect(players[i].squad_id).toBe(testPlayers[1].squad_id);
          expect(players[i].first_name).toBe(testPlayers[1].first_name);
          expect(players[i].last_name).toBe(testPlayers[1].last_name);
          expect(players[i].average).toBe(testPlayers[1].average);
          expect(players[i].lane).toBe(testPlayers[1].lane);
          expect(players[i].position).toBe(testPlayers[1].position);
        } else if (players[i].id === testPlayers[2].id) {
          expect(players[i].squad_id).toBe(testPlayers[2].squad_id);
          expect(players[i].first_name).toBe(testPlayers[2].first_name);
          expect(players[i].last_name).toBe(testPlayers[2].last_name);
          expect(players[i].average).toBe(testPlayers[2].average);
          expect(players[i].lane).toBe(testPlayers[2].lane);
          expect(players[i].position).toBe(testPlayers[2].position);
        } else if (players[i].id === testPlayers[3].id) {
          expect(players[i].squad_id).toBe(testPlayers[3].squad_id);
          expect(players[i].first_name).toBe(testPlayers[3].first_name);
          expect(players[i].last_name).toBe(testPlayers[3].last_name);
          expect(players[i].average).toBe(testPlayers[3].average);
          expect(players[i].lane).toBe(testPlayers[3].lane);
          expect(players[i].position).toBe(testPlayers[3].position);
        } else {
          expect(true).toBeFalsy();
        }
      }
      // div entries
      expect(postedTmnt.divEntries).toHaveLength(
        mockTmntFullData.divEntries.length
      );
      const divEntries = postedTmnt.divEntries;
      const testDivEntries = mockTmntFullData.divEntries;
      for (let i = 0; i < divEntries.length; i++) {
        if (divEntries[i].id === testDivEntries[0].id) {
          expect(divEntries[i].squad_id).toBe(testDivEntries[0].squad_id);
          expect(divEntries[i].div_id).toBe(testDivEntries[0].div_id);
          expect(divEntries[i].player_id).toBe(testDivEntries[0].player_id);
          expect(divEntries[i].fee).toBe(testDivEntries[0].fee);
        } else if (divEntries[i].id === testDivEntries[1].id) {
          expect(divEntries[i].squad_id).toBe(testDivEntries[1].squad_id);
          expect(divEntries[i].div_id).toBe(testDivEntries[1].div_id);
          expect(divEntries[i].player_id).toBe(testDivEntries[1].player_id);
          expect(divEntries[i].fee).toBe(testDivEntries[1].fee);
        } else if (divEntries[i].id === testDivEntries[2].id) {
          expect(divEntries[i].squad_id).toBe(testDivEntries[2].squad_id);
          expect(divEntries[i].div_id).toBe(testDivEntries[2].div_id);
          expect(divEntries[i].player_id).toBe(testDivEntries[2].player_id);
          expect(divEntries[i].fee).toBe(testDivEntries[2].fee);
        } else if (divEntries[i].id === testDivEntries[3].id) {
          expect(divEntries[i].squad_id).toBe(testDivEntries[3].squad_id);
          expect(divEntries[i].div_id).toBe(testDivEntries[3].div_id);
          expect(divEntries[i].player_id).toBe(testDivEntries[3].player_id);
          expect(divEntries[i].fee).toBe(testDivEntries[3].fee);
        } else {
          expect(true).toBeFalsy();
        }
      }
      // potEntries
      expect(postedTmnt.potEntries).toHaveLength(
        mockTmntFullData.potEntries.length
      );
      const potEntries = postedTmnt.potEntries;
      const testPotEntries = mockTmntFullData.potEntries;
      for (let i = 0; i < potEntries.length; i++) {
        if (potEntries[i].id === testPotEntries[0].id) {
          expect(potEntries[i].pot_id).toBe(testPotEntries[0].pot_id);
          expect(potEntries[i].player_id).toBe(testPotEntries[0].player_id);
          expect(potEntries[i].fee).toBe(testPotEntries[0].fee);
        } else if (potEntries[i].id === testPotEntries[1].id) {
          expect(potEntries[i].pot_id).toBe(testPotEntries[1].pot_id);
          expect(potEntries[i].player_id).toBe(testPotEntries[1].player_id);
          expect(potEntries[i].fee).toBe(testPotEntries[1].fee);
        } else if (potEntries[i].id === testPotEntries[2].id) {
          expect(potEntries[i].pot_id).toBe(testPotEntries[2].pot_id);
          expect(potEntries[i].player_id).toBe(testPotEntries[2].player_id);
          expect(potEntries[i].fee).toBe(testPotEntries[2].fee);
        } else if (potEntries[i].id === testPotEntries[3].id) {
          expect(potEntries[i].pot_id).toBe(testPotEntries[3].pot_id);
          expect(potEntries[i].player_id).toBe(testPotEntries[3].player_id);
          expect(potEntries[i].fee).toBe(testPotEntries[3].fee);
        } else {
          expect(true).toBeFalsy();
        }
      }
      // bracketEntries
      expect(postedTmnt.brktEntries).toHaveLength(
        mockTmntFullData.brktEntries.length
      );
      const brktEntries = postedTmnt.brktEntries;
      const testBrktEntries = mockTmntFullData.brktEntries;
      for (let i = 0; i < brktEntries.length; i++) {
        if (brktEntries[i].id === testBrktEntries[0].id) {
          expect(brktEntries[i].brkt_id).toBe(testBrktEntries[0].brkt_id);
          expect(brktEntries[i].player_id).toBe(testBrktEntries[0].player_id);
          expect(brktEntries[i].num_brackets).toBe(
            testBrktEntries[0].num_brackets
          );
          expect(brktEntries[i].num_refunds).toBe(
            testBrktEntries[0].num_refunds
          );
          expect(brktEntries[i].fee + "").toBe(testBrktEntries[0].fee);
        } else if (brktEntries[i].id === testBrktEntries[1].id) {
          expect(brktEntries[i].brkt_id).toBe(testBrktEntries[1].brkt_id);
          expect(brktEntries[i].player_id).toBe(testBrktEntries[1].player_id);
          expect(brktEntries[i].num_brackets).toBe(
            testBrktEntries[1].num_brackets
          );
          expect(brktEntries[i].num_refunds).toBeUndefined();
          expect(brktEntries[i].fee + "").toBe(testBrktEntries[1].fee);
        } else if (brktEntries[i].id === testBrktEntries[2].id) {
          expect(brktEntries[i].brkt_id).toBe(testBrktEntries[2].brkt_id);
          expect(brktEntries[i].player_id).toBe(testBrktEntries[2].player_id);
          expect(brktEntries[i].num_brackets).toBe(
            testBrktEntries[2].num_brackets
          );
          expect(brktEntries[i].num_refunds).toBe(
            testBrktEntries[2].num_refunds
          );
          expect(brktEntries[i].fee + "").toBe(testBrktEntries[2].fee);
        } else if (brktEntries[i].id === testBrktEntries[3].id) {
          expect(brktEntries[i].brkt_id).toBe(testBrktEntries[3].brkt_id);
          expect(brktEntries[i].player_id).toBe(testBrktEntries[3].player_id);
          expect(brktEntries[i].num_brackets).toBe(
            testBrktEntries[3].num_brackets
          );
          expect(brktEntries[i].num_refunds).toBeUndefined();
          expect(brktEntries[i].fee + "").toBe(testBrktEntries[3].fee);
        } else {
          expect(true).toBeFalsy();
        }
      }
      // oneBrkts
      expect(postedTmnt.oneBrkts).toHaveLength(
        mockTmntFullData.oneBrkts.length
      );
      const oneBrkts = postedTmnt.oneBrkts;
      const testOneBrkts = mockTmntFullData.oneBrkts;
      for (let i = 0; i < oneBrkts.length; i++) {
        if (oneBrkts[i].id === testOneBrkts[0].id) {
          expect(oneBrkts[i].brkt_id).toBe(testOneBrkts[0].brkt_id);
          expect(oneBrkts[i].bindex).toBe(testOneBrkts[0].bindex);
        } else if (oneBrkts[i].id === testOneBrkts[1].id) {
          expect(oneBrkts[i].brkt_id).toBe(testOneBrkts[1].brkt_id);
          expect(oneBrkts[i].bindex).toBe(testOneBrkts[1].bindex);
        } else {
          expect(true).toBeFalsy();
        }
      }
      // brktSeeds
      expect(postedTmnt.brktSeeds).toHaveLength(
        mockTmntFullData.brktSeeds.length
      );
      const brktSeeds = postedTmnt.brktSeeds;
      const testBrktSeeds = mockTmntFullData.brktSeeds;
      for (let i = 0; i < brktSeeds.length; i++) {
        if (
          brktSeeds[i].one_brkt_id === testBrktSeeds[0].one_brkt_id &&
          brktSeeds[i].seed === testBrktSeeds[0].seed
        ) {
          expect(brktSeeds[i].one_brkt_id).toBe(testBrktSeeds[0].one_brkt_id);
          expect(brktSeeds[i].player_id).toBe(testBrktSeeds[0].player_id);
        } else if (
          brktSeeds[i].one_brkt_id === testBrktSeeds[1].one_brkt_id &&
          brktSeeds[i].seed === testBrktSeeds[1].seed
        ) {
          expect(brktSeeds[i].one_brkt_id).toBe(testBrktSeeds[1].one_brkt_id);
          expect(brktSeeds[i].player_id).toBe(testBrktSeeds[1].player_id);
        } else if (
          brktSeeds[i].one_brkt_id === testBrktSeeds[2].one_brkt_id &&
          brktSeeds[i].seed === testBrktSeeds[2].seed
        ) {
          expect(brktSeeds[i].one_brkt_id).toBe(testBrktSeeds[2].one_brkt_id);
          expect(brktSeeds[i].player_id).toBe(testBrktSeeds[2].player_id);
        } else if (
          brktSeeds[i].one_brkt_id === testBrktSeeds[3].one_brkt_id &&
          brktSeeds[i].seed === testBrktSeeds[3].seed
        ) {
          expect(brktSeeds[i].one_brkt_id).toBe(testBrktSeeds[3].one_brkt_id);
          expect(brktSeeds[i].player_id).toBe(testBrktSeeds[3].player_id);
        } else if (
          brktSeeds[i].one_brkt_id === testBrktSeeds[4].one_brkt_id &&
          brktSeeds[i].seed === testBrktSeeds[4].seed
        ) {
          expect(brktSeeds[i].one_brkt_id).toBe(testBrktSeeds[4].one_brkt_id);
          expect(brktSeeds[i].player_id).toBe(testBrktSeeds[4].player_id);
        } else if (
          brktSeeds[i].one_brkt_id === testBrktSeeds[5].one_brkt_id &&
          brktSeeds[i].seed === testBrktSeeds[5].seed
        ) {
          expect(brktSeeds[i].one_brkt_id).toBe(testBrktSeeds[5].one_brkt_id);
          expect(brktSeeds[i].player_id).toBe(testBrktSeeds[5].player_id);
        } else if (
          brktSeeds[i].one_brkt_id === testBrktSeeds[6].one_brkt_id &&
          brktSeeds[i].seed === testBrktSeeds[6].seed
        ) {
          expect(brktSeeds[i].one_brkt_id).toBe(testBrktSeeds[6].one_brkt_id);
          expect(brktSeeds[i].player_id).toBe(testBrktSeeds[6].player_id);
        } else if (
          brktSeeds[i].one_brkt_id === testBrktSeeds[7].one_brkt_id &&
          brktSeeds[i].seed === testBrktSeeds[7].seed
        ) {
          expect(brktSeeds[i].one_brkt_id).toBe(testBrktSeeds[7].one_brkt_id);
          expect(brktSeeds[i].player_id).toBe(testBrktSeeds[7].player_id);
        } else {
          expect(true).toBeFalsy();
        }
      }
      // elimEntries
      expect(postedTmnt.elimEntries).toHaveLength(
        mockTmntFullData.elimEntries.length
      );
      const elimEntries = postedTmnt.elimEntries;
      const testElimEntries = mockTmntFullData.elimEntries;
      for (let i = 0; i < elimEntries.length; i++) {
        if (elimEntries[i].id === testElimEntries[0].id) {
          expect(elimEntries[i].elim_id).toBe(testElimEntries[0].elim_id);
          expect(elimEntries[i].player_id).toBe(testElimEntries[0].player_id);
          expect(elimEntries[i].fee).toBe(testElimEntries[0].fee);
        } else if (elimEntries[i].id === testElimEntries[1].id) {
          expect(elimEntries[i].elim_id).toBe(testElimEntries[1].elim_id);
          expect(elimEntries[i].player_id).toBe(testElimEntries[1].player_id);
          expect(elimEntries[i].fee).toBe(testElimEntries[1].fee);
        } else if (elimEntries[i].id === testElimEntries[2].id) {
          expect(elimEntries[i].elim_id).toBe(testElimEntries[2].elim_id);
          expect(elimEntries[i].player_id).toBe(testElimEntries[2].player_id);
          expect(elimEntries[i].fee).toBe(testElimEntries[2].fee);
        } else if (elimEntries[i].id === testElimEntries[3].id) {
          expect(elimEntries[i].elim_id).toBe(testElimEntries[3].elim_id);
          expect(elimEntries[i].player_id).toBe(testElimEntries[3].player_id);
          expect(elimEntries[i].fee).toBe(testElimEntries[3].fee);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT PUT (replace) a full tmnt with invalid tmnt data", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.tmnt.tmnt_name = "";
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON,
          {
            withCredentials: true,
          }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT PUT (replace) a full tmnt with no events", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.events = [];
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON,
          {
            withCredentials: true,
          }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT PUT (replace) a full tmnt with no divs", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.divs = [];
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON,
          {
            withCredentials: true,
          }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT PUT (replace) a full tmnt with no squads", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.squads = [];
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON,
          {
            withCredentials: true,
          }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT PUT (replace) a full tmnt with no lanes", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.lanes = [];
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON,
          {
            withCredentials: true,
          }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT PUT (replace) a full tmnt with invalid pots", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.pots[0].id = 'invalid'
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON,
          {
            withCredentials: true,
          }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it('should rollback a PUT (replace) of a full tmnt', async () => {
      const tmntJSON = JSON.stringify(mockTmntFullData);
      const response = await axios.put(
        fullUrl + mockTmntFullData.tmnt.id,
        tmntJSON,
        {
          withCredentials: true,
        }
      );

      expect(response.status).toBe(200);
      createdTmnt = true;
      expect(response.data.success).toBe(true);
      const getTmntResponse1 = await axios.get(fullUrl + mockTmntFullData.tmnt.id, {
        withCredentials: true,
      });
      expect(getTmntResponse1.status).toBe(200);
      const tmntFullData1 = getTmntResponse1.data.tmntFullData;
      expect(tmntFullData1.tmnt_name).toBe(mockTmntFullData.tmnt.tmnt_name);

      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.tmnt.tmnt_name = 'Rollback';
      invalidTmnt.pots[1].id = invalidTmnt.pots[0].id; // create dupilcate id's
      const invalidTmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          invalidTmntJSON,
          {
            withCredentials: true,
          }
        );
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
      const getTmntResponse2 = await axios.get(fullUrl + mockTmntFullData.tmnt.id, {
        withCredentials: true,
      });
      expect(getTmntResponse2.status).toBe(200);
      const tmntFullData2 = getTmntResponse2.data.tmntFullData;
      expect(tmntFullData2.tmnt_name).toBe(mockTmntFullData.tmnt.tmnt_name);
    })
  });

  describe("PUT tmnt full entries data - API: /api/tmnts/full/:id", () => {
    let createdTmnt = false;

    beforeAll(async () => {
      try {
        await deleteTmnt(mockTmntFullData.tmnt.id);
        await deleteBowl(mockBowl.id)
        await postBowl(mockBowl)
      } catch {
        // do nothing if cannot delete
      }
    });

    beforeEach(() => {
      createdTmnt = false;
    });

    afterEach(async () => {
      if (createdTmnt) {
        await deleteTmnt(mockTmntFullData.tmnt.id);
      }
    });

    afterAll(async () => { 
      await deleteBowl(mockBowl.id)
    })

    it("should PUT (replace) a full tmnt, all child, grandchild tables", async () => {
      const tmntJSON = JSON.stringify(mockTmntFullData);
      const response = await axios.put(
        fullUrl + mockTmntFullData.tmnt.id,
        tmntJSON,
        {
          withCredentials: true,
        }
      );

      expect(response.status).toBe(200);
      createdTmnt = true;
      expect(response.data.success).toBe(true);

      const postedTmnt = await getTmntFullData(mockTmntFullData.tmnt.id);
      expect(postedTmnt).not.toBeNull();

      // required parent table - tmnt
      expect(postedTmnt.tmnt.id).toBe(mockTmntFullData.tmnt.id);

      const tmntEntries = cloneDeep(mockTmntFullData);
      // values that will not update
      tmntEntries.tmnt.tmnt_name = 'DoNotUpdate';
      tmntEntries.events[0].event_name = 'DoNotUpdate';
      tmntEntries.divs[0].div_name = 'DoNotUpdate';
      tmntEntries.squads[0].squad_name = 'DoNotUpdate';
      tmntEntries.lanes[0].lane_number = 100;
      tmntEntries.pots[0].pot_type = 'Series';
      tmntEntries.brkts[0].start = 2;
      tmntEntries.elims[0].start = 2;
      // values that will update
      tmntEntries.players[0].first_name = 'Updated';
      tmntEntries.players[0].last_name = 'ThisToo';
      tmntEntries.divEntries[0].fee = '100';
      tmntEntries.potEntries[0].fee = '10';
      tmntEntries.potEntries[0].pot_id = mockTmntFullData.pots[1].id;
      tmntEntries.brktEntries[0].num_brackets = 100;
      tmntEntries.oneBrkts[0].bindex = 7;
      tmntEntries.brktSeeds[0].seed = 7;
      tmntEntries.elimEntries[0].player_id = mockTmntFullData.players[2].id;

      const tmntEntriesJSON = JSON.stringify(tmntEntries);
      const response2 = await axios.put(
        fullEntriesUrl + tmntEntries.tmnt.id,
        tmntEntriesJSON,
        {
          withCredentials: true,
        }
      );

      expect(response2.status).toBe(200);
      createdTmnt = true;
      expect(response2.data.success).toBe(true);

      const postedEntries = await getTmntFullData(tmntEntries.tmnt.id);
      expect(postedEntries).not.toBeNull();

      // non updated values
      expect(postedEntries.tmnt.tmnt_name).toBe(mockTmntFullData.tmnt.tmnt_name);
      expect(postedEntries.events[0].event_name).toBe(mockTmntFullData.events[0].event_name);
      for (let i = 0; i < postedEntries.divs.length; i++) {
        if (postedEntries.divs[i].id === mockTmntFullData.divs[0].id) {
          expect(postedEntries.divs[i].div_name).toBe(mockTmntFullData.divs[0].div_name);
        }
      }
      expect(postedEntries.squads[0].squad_name).toBe(mockTmntFullData.squads[0].squad_name);
      for (let i = 0; i < postedEntries.lanes.length; i++) {
        if (postedEntries.lanes[i].id === mockTmntFullData.lanes[0].id) {
          expect(postedEntries.lanes[i].lane_number).toBe(mockTmntFullData.lanes[0].lane_number);
        }
      }
      for (let i = 0; i < postedEntries.pots.length; i++) {
        if (postedEntries.pots[i].id === mockTmntFullData.pots[0].id) {
          expect(postedEntries.pots[i].pot_type).toBe(mockTmntFullData.pots[0].pot_type);
        }
      }
      for (let i = 0; i < postedEntries.brkts.length; i++) {
        if (postedEntries.brkts[i].id === mockTmntFullData.brkts[0].id) {
          expect(postedEntries.brkts[i].start).toBe(mockTmntFullData.brkts[0].start);
        }
      }
      for (let i = 0; i < postedEntries.elims.length; i++) {
        if (postedEntries.elims[i].id === mockTmntFullData.elims[0].id) {
          expect(postedEntries.elims[i].start).toBe(mockTmntFullData.elims[0].start);
        }
      }
      // updated values
      for (let i = 0; i < postedEntries.players.length; i++) {
        if (postedEntries.players[i].id === tmntEntries.players[0].id) {
          expect(postedEntries.players[i].first_name).toBe('Updated');
          expect(postedEntries.players[i].last_name).toBe('ThisToo');
        }
      }
      for (let i = 0; i < postedEntries.divEntries.length; i++) {
        if (postedEntries.divEntries[i].id === tmntEntries.divEntries[0].id) {
          expect(postedEntries.divEntries[i].fee).toBe('100')
        }
      }
      for (let i = 0; i < postedEntries.potEntries.length; i++) {
        if (postedEntries.potEntries[i].id === tmntEntries.potEntries[0].id) {
          expect(postedEntries.potEntries[i].fee).toBe('10');
          expect(postedEntries.potEntries[i].pot_id).toBe(mockTmntFullData.pots[1].id);
        }
      }
      for (let i = 0; i < postedEntries.brktEntries.length; i++) {
        if (postedEntries.brktEntries[i].id === tmntEntries.brktEntries[0].id) {
          expect(postedEntries.brktEntries[i].num_brackets).toBe(100);
        }
      }
      for (let i = 0; i < postedEntries.oneBrkts.length; i++) {
        if (postedEntries.oneBrkts[i].id === tmntEntries.oneBrkts[0].id) {
          expect(postedEntries.oneBrkts[i].bindex).toBe(7);
        }
      }
      for (let i = 0; i < postedEntries.brktSeeds.length; i++) {
        if (
          postedEntries.brktSeeds[i].player_id === tmntEntries.brktSeeds[0].player_id &&
          postedEntries.brktSeeds[i].one_brkt_id === tmntEntries.oneBrkts[0].id
        ) {
          expect(postedEntries.brktSeeds[i].seed).toBe(7);
        }
      }
      for (let i = 0; i < postedEntries.elimEntries.length; i++) {
        if (postedEntries.elimEntries[i].player_id === tmntEntries.elimEntries[0].player_id) {
          expect(postedEntries.elimEntries[i].player_id).toBe(mockTmntFullData.players[2].id);
        }
      }
    });
    it("should NOT PUT (replace) a full tmnt entries with invalid data", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.players[0].first_name = "";
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON,
          {
            withCredentials: true,
          }
        );
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it('should rollback a PUT (replace) of a full tmnt', async () => {
      const tmntJSON = JSON.stringify(mockTmntFullData);
      const response = await axios.put(
        fullUrl + mockTmntFullData.tmnt.id,
        tmntJSON,
        {
          withCredentials: true,
        }
      );

      expect(response.status).toBe(200);
      createdTmnt = true;
      expect(response.data.success).toBe(true);
      const getTmntResponse1 = await axios.get(fullUrl + mockTmntFullData.tmnt.id, {
        withCredentials: true,
      });
      expect(getTmntResponse1.status).toBe(200);
      const tmntFullData1 = getTmntResponse1.data.tmntFullData;
      expect(tmntFullData1.tmnt_name).toBe(mockTmntFullData.tmnt.tmnt_name);

      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.players[0].first_name = 'Rollback';
      invalidTmnt.elimEntries[1].id = invalidTmnt.elimEntries[0].id; // create dupilcate id's
      const invalidTmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.put(
          fullEntriesUrl + mockTmntFullData.tmnt.id,
          invalidTmntJSON,
          {
            withCredentials: true,
          }
        );
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
      const getTmntResponse2 = await axios.get(fullUrl + mockTmntFullData.tmnt.id, {
        withCredentials: true,
      });
      expect(getTmntResponse2.status).toBe(200);
      const tmntFullData2 = getTmntResponse2.data.tmntFullData;
      expect(tmntFullData2.events[0].squads[0].players[0].first_name).toBe(mockTmntFullData.players[0].first_name);
    });
  });

  describe('PUT by ID - API: API: /api/tmnts/tmnt/:id', () => {

    const putTmnt = {
      ...testTmnt,
      tmnt_name: "Test Tournament",
      bowl_id: bowl2Id,
      user_id: user2Id,
      start_date_str: '2022-11-01',
      end_date_str: '2022-11-01',
    }

    beforeAll(async () => {
      await resetTmnt();
    })

    afterEach(async () => {
      await resetTmnt();
    })

    it('should update a tmnt by ID', async () => {
      const tmntJSON = JSON.stringify(putTmnt);
      const putResponse = await axios({
        method: "put",
        data: tmntJSON,
        withCredentials: true,
        url: tmntUrl + testTmnt.id,
      })
      const tmnt = putResponse.data.tmnt;
      expect(putResponse.status).toBe(200);
      expect(tmnt.tmnt_name).toBe(putTmnt.tmnt_name);
      expect(tmnt.bowl_id).toBe(putTmnt.bowl_id);
      // for user_id, compare to testTmnt.user_id
      expect(tmnt.user_id).toBe(testTmnt.user_id);
      expect(removeTimeFromISODateStr(tmnt.start_date)).toBe(putTmnt.start_date_str);
      expect(removeTimeFromISODateStr(tmnt.end_date)).toBe(putTmnt.end_date_str);
    })
    it('should NOT update a tmnt with when ID is invalid', async () => {
      try {
        const tmntJSON = JSON.stringify(putTmnt);
        const putResponse = await axios({
          method: "put",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl + 'test',
        })
        expect(putResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a tmnt when ID is valid, but not a tmnt ID', async () => {
      try {
        const tmntJSON = JSON.stringify(putTmnt);
        const putResponse = await axios({
          method: "put",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl + nonTmntId,
        })
        expect(putResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a tmnt by ID when ID is not found', async () => {
      try {
        const tmntJSON = JSON.stringify(putTmnt);
        const putResponse = await axios({
          method: "put",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl + notFoundId,
        })
        expect(putResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a tmnt by ID whne tmnt_name is missing', async () => {
      const invalidTmnt = {
        ...putTmnt,
        tmnt_name: "",
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const putResponse = await axios({
          method: "put",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl + testTmnt.id,
        })
        expect(putResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a tmnt by ID when bowl_id is missing', async () => {
      const invalidTmnt = {
        ...putTmnt,
        bowl_id: "",
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const putResponse = await axios({
          method: "put",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl + testTmnt.id,
        })
        expect(putResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a tmnt by ID when user_id is missing', async () => {
      const invalidTmnt = {
        ...putTmnt,
        user_id: "",
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const putResponse = await axios({
          method: "put",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl + testTmnt.id,
        })
        expect(putResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a tmnt by ID when start_date is blank', async () => {
      const invalidTmnt = {
        ...putTmnt,
        start_date_str: '',
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const putResponse = await axios({
          method: "put",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl + testTmnt.id,
        })
        expect(putResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a tmnt by ID when end_date is blank', async () => {
      const invalidTmnt = {
        ...putTmnt,
        end_date_str: null as any,
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const putResponse = await axios({
          method: "put",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl + testTmnt.id,
        })
        expect(putResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a tmnt by ID when tmnt_name is too long', async () => {
      const invalidTmnt = {
        ...putTmnt,
        tmnt_name: 'a'.repeat(256),
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const putResponse = await axios({
          method: "put",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl + testTmnt.id,
        })
      }
      catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a tmnt by ID when start_date is after end_date', async () => {
      const invalidTmnt = {
        ...putTmnt,
        start_date_str: '2022-11-04',
        end_date_str: '2022-11-02',
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const putResponse = await axios({
          method: "put",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl + testTmnt.id,
        })
        expect(putResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a tmnt by ID when bowl_id is invalid', async () => {
      const invalidTmnt = {
        ...putTmnt,
        bowl_id: 'test',
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const putResponse = await axios({
          method: "put",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl + testTmnt.id,
        })
        expect(putResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a tmnt by ID when bowl_id is valid, but not a bowl ID', async () => {
      const invalidTmnt = {
        ...putTmnt,
        bowl_id: notFoundId, // valid tmnt ID, but not a user ID
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const putResponse = await axios({
          method: "put",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl + testTmnt.id,
        })
        expect(putResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a tmnt by ID when bowl_id is not found', async () => {
      const invalidTmnt = {
        ...putTmnt,
        bowl_id: notFoundBowlId,
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const putResponse = await axios({
          method: "put",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl + testTmnt.id,
        })
        expect(putResponse.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a tmnt by ID when user_id is invalid', async () => {
      const invalidTmnt = {
        ...putTmnt,
        user_id: 'test',
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const putResponse = await axios({
          method: "put",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl + testTmnt.id,
        })
        expect(putResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a tmnt by ID when user_id is valid, but not a user ID', async () => {
      const invalidTmnt = {
        ...putTmnt,
        user_id: notFoundId, // valid tmnt ID, but not a user ID
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const putResponse = await axios({
          method: "put",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl + testTmnt.id,
        })
        expect(putResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a tmnt by ID when start_date is invalid', async () => {
      const invalidTmnt = {
        ...putTmnt,
        start_date_str: '1800-11-01',
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const putResponse = await axios({
          method: "put",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl + testTmnt.id,
        })
        expect(putResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a tmnt by ID when end_date is invalid', async () => {
      const invalidTmnt = {
        ...putTmnt,
        end_date_str: '2300-11-01',
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const putResponse = await axios({
          method: "put",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl + testTmnt.id,
        })
        expect(putResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should update a tmnt by ID with sanitized data', async () => {
      const toSanitizeTmnt = {
        ...putTmnt,
        tmnt_name: "    <script>Sample Tournament</script>   ",
      }
      const tmntJSON = JSON.stringify(toSanitizeTmnt);
      const response = await axios({
        method: "put",
        data: tmntJSON,
        withCredentials: true,
        url: tmntUrl + testTmnt.id,
      })
      expect(response.status).toBe(200);
      const puttedTmnt = response.data.tmnt;
      expect(puttedTmnt.tmnt_name).toBe('Sample Tournament');
    })

  })

  describe('PATCH by ID - API: API: /api/tmnts/tmnt/:id', () => {

    beforeAll(async () => {
      await resetTmnt();
    })

    afterEach(async () => {
      await resetTmnt();
    })

    it('should patch a tmnt tmnt_name by ID', async () => {
      const patchTmnt = {
        ...toPatchTmnt,
        tmnt_name: 'patched tmnt name',
      }
      const tmntJSON = JSON.stringify(patchTmnt);
      const patchResponse = await axios({
        method: "patch",
        data: tmntJSON,
        withCredentials: true,
        url: tmntUrl  + toPatchTmnt.id,
      })
      expect(patchResponse.status).toBe(200);
      const patchedTmnt = patchResponse.data.tmnt;
      expect(patchedTmnt.tmnt_name).toBe(patchTmnt.tmnt_name);
    })
    it('should patch a tmnt bowl_id by ID', async () => {
      const patchTmnt = {
        ...toPatchTmnt,
        bowl_id: bowl2Id,
      }
      const tmntJSON = JSON.stringify(patchTmnt);
      const patchResponse = await axios({
        method: "patch",
        data: tmntJSON,
        withCredentials: true,
        url: tmntUrl  + toPatchTmnt.id,
      })
      expect(patchResponse.status).toBe(200);
      const patchedTmnt = patchResponse.data.tmnt;
      expect(patchedTmnt.bowl_id).toBe(patchTmnt.bowl_id);
    })
    it('should patch a tmnt start_date by ID', async () => {
      const patchTmnt = {
        ...toPatchTmnt,
        start_date_str: '2022-08-22',
      }
      const tmntJSON = JSON.stringify(patchTmnt);
      const patchResponse = await axios({
        method: "patch",
        data: tmntJSON,
        withCredentials: true,
        url: tmntUrl  + toPatchTmnt.id,
      })
      expect(patchResponse.status).toBe(200);
      const patchedTmnt = patchResponse.data.tmnt;
      expect(removeTimeFromISODateStr(patchedTmnt.start_date)).toBe(patchTmnt.start_date_str);
    })
    it('should patch a tmnt end_date by ID', async () => {
      const patchTmnt = {
        ...toPatchTmnt,
        end_date_str: '2022-10-26',
      }
      const tmntJSON = JSON.stringify(patchTmnt);
      const patchResponse = await axios({
        method: "patch",
        data: tmntJSON,
        withCredentials: true,
        url: tmntUrl  + toPatchTmnt.id,
      })
      expect(patchResponse.status).toBe(200);
      const patchedTmnt = patchResponse.data.tmnt;
      expect(removeTimeFromISODateStr(patchedTmnt.end_date)).toBe(patchTmnt.end_date_str);
    })
    it('should NOT patch a tmnt user_id by ID', async () => {
      const patchTmnt = {
        ...toPatchTmnt,
        user_id: user2Id,
      }
      const tmntJSON = JSON.stringify(patchTmnt);
      const patchResponse = await axios({
        method: "patch",
        data: tmntJSON,
        withCredentials: true,
        url: tmntUrl  + toPatchTmnt.id,
      })
      expect(patchResponse.status).toBe(200);
      const patchedTmnt = patchResponse.data.tmnt;
      // for user_id, compare to blankTmnt.user_id
      expect(patchedTmnt.user_id).toBe(toPatchTmnt.user_id);
    })
    it('should NOT patch a tmnt when ID is invalid', async () => {
      try {
        const patchTmnt = {
          ...toPatchTmnt,
          tmnt_name: 'patched tmnt name',
        }
        const tmntJSON = JSON.stringify(patchTmnt);
        const patchResponse = await axios({
          method: "patch",
          data: tmntJSON,
          withCredentials: true,
          url: url + "/" + 'test',
        })
        expect(patchResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a tmnt when ID is not found', async () => {
      try {
        const patchTmnt = {
          ...toPatchTmnt,
          tmnt_name: 'patched tmnt name',
        }
        const tmntJSON = JSON.stringify(patchTmnt);
        const patchResponse = await axios({
          method: "patch",
          data: tmntJSON,
          withCredentials: true,
          url: url + "/" + notFoundId,
        })
        expect(patchResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a tmnt when ID is valid, but not a tmnt ID', async () => {
      try {
        const patchTmnt = {
          ...toPatchTmnt,
          tmnt_name: 'patched tmnt name',
        }
        const tmntJSON = JSON.stringify(patchTmnt);
        const patchResponse = await axios({
          method: "patch",
          data: tmntJSON,
          withCredentials: true,
          url: url + "/" + nonTmntId,
        })
        expect(patchResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a tmnt by ID when tmnt_name is missing', async () => {
      try {
        const patchTmnt = {
          ...toPatchTmnt,
          tmnt_name: '',
        }
        const tmntJSON = JSON.stringify(patchTmnt);
        const patchResponse = await axios({
          method: "patch",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl  + toPatchTmnt.id,
        })
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a tmnt by ID when user_id is missing', async () => {
      try {
        const patchTmnt = {
          ...toPatchTmnt,
          user_id: '',
        }
        const tmntJSON = JSON.stringify(patchTmnt);
        const patchResponse = await axios({
          method: "patch",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl  + toPatchTmnt.id,
        })
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a tmnt by ID when bowl_id is missing', async () => {
      try {
        const patchTmnt = {
          ...toPatchTmnt,
          bowl_id: '',
        }
        const tmntJSON = JSON.stringify(patchTmnt);
        const patchResponse = await axios({
          method: "patch",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl  + toPatchTmnt.id,
        })
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a tmnt by ID when start_date is blank', async () => {
      try {
        const patchTmnt = {
          ...toPatchTmnt,
          start_date_str: '',
        }
        const tmntJSON = JSON.stringify(patchTmnt);
        const patchResponse = await axios({
          method: "patch",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl  + toPatchTmnt.id,
        })
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a tmnt by ID when end_date is blank', async () => {
      try {
        const patchTmnt = {
          ...toPatchTmnt,
          end_date_str: '',
        }
        const tmntJSON = JSON.stringify(patchTmnt);
        const patchResponse = await axios({
          method: "patch",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl  + toPatchTmnt.id,
        })
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a tmnt by ID when tmnt_name is too long', async () => {
      try {
        const patchTmnt = {
          ...toPatchTmnt,
          tmnt_name: 'a'.repeat(101),
        }
        const tmntJSON = JSON.stringify(patchTmnt);
        const patchResponse = await axios({
          method: "patch",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl  + toPatchTmnt.id,
        })
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a tmnt by ID when start_date is after end_date', async () => {
      try {
        const patchTmnt = {
          ...toPatchTmnt,
          start_date_str: '2022-10-26',
        }
        const tmntJSON = JSON.stringify(patchTmnt);
        const patchResponse = await axios({
          method: "patch",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl  + toPatchTmnt.id,
        })
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a tmnt by ID when start_date is too far in the past', async () => {
      try {
        const patchTmnt = {
          ...toPatchTmnt,
          start_date_str: '1800-10-24',
        }
        const tmntJSON = JSON.stringify(patchTmnt);
        const patchResponse = await axios({
          method: "patch",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl  + toPatchTmnt.id,
        })
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a tmnt by ID when end_date is too far in the future', async () => {
      try {
        const patchTmnt = {
          ...toPatchTmnt,
          end_date_str: '2300-10-24',
        }
        const tmntJSON = JSON.stringify(patchTmnt);
        const patchResponse = await axios({
          method: "patch",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl  + toPatchTmnt.id,
        })
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a tmnt by ID when bowl_id is invalid', async () => {
      try {
        const patchTmnt = {
          ...toPatchTmnt,
          bowl_id: 'invalid',
        }
        const tmntJSON = JSON.stringify(patchTmnt);
        const patchResponse = await axios({
          method: "patch",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl  + toPatchTmnt.id,
        })
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a tmnt by ID when bowl_id is valid, but not a bowl ID', async () => {
      try {
        const patchTmnt = {
          ...toPatchTmnt,
          bowl_id: notFoundId, // tmnt id
        }
        const tmntJSON = JSON.stringify(patchTmnt);
        const patchResponse = await axios({
          method: "patch",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl  + toPatchTmnt.id,
        })
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch a tmnt by ID when bowl_id is not found', async () => {
      try {
        const patchTmnt = {
          ...toPatchTmnt,
          bowl_id: notFoundBowlId, // tmnt id
        }
        const tmntJSON = JSON.stringify(patchTmnt);
        const patchResponse = await axios({
          method: "patch",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl  + toPatchTmnt.id,
        })
        expect(patchResponse.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a tmnt by ID when user_id is invalid', async () => {
      try {
        const patchTmnt = {
          ...toPatchTmnt,
          user_id: 'invalid',
        }
        const tmntJSON = JSON.stringify(patchTmnt);
        const patchResponse = await axios({
          method: "patch",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl  + toPatchTmnt.id,
        })
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a tmnt by ID when user_id is valid, bit not a user ID', async () => {
      try {
        const patchTmnt = {
          ...toPatchTmnt,
          user_id: notFoundId, // tmnt id
        }
        const tmntJSON = JSON.stringify(patchTmnt);
        const patchResponse = await axios({
          method: "patch",
          data: tmntJSON,
          withCredentials: true,
          url: tmntUrl  + toPatchTmnt.id,
        })
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should patch a tmnt by ID whith a sanitized tmnt_name', async () => {
      const patchTmnt = {
        ...toPatchTmnt,
        tmnt_name: "    <script>Patched Tmnt Name</script>   ",
      }
      const tmntJSON = JSON.stringify(patchTmnt);
      const patchResponse = await axios({
        method: "patch",
        data: tmntJSON,
        withCredentials: true,
        url: tmntUrl  + toPatchTmnt.id,
      })
      expect(patchResponse.status).toBe(200);
      const patchedTmnt = patchResponse.data.tmnt;
      expect(patchedTmnt.tmnt_name).toBe("Patched Tmnt Name");
    })

  })

  describe('DELETE by ID - API: API: /api/tmnts/tmnt/:id', () => {

    const toDelTmnt = {
      ...initTmnt,
      id: "tmt_e134ac14c5234d708d26037ae812ac33",
      user_id: user1Id,
      tmnt_name: "Gold Pin to Delete",
      bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
      start_date_str: '2026-08-19',
      end_date_str: '2026-08-19',
    }
    
    const repostTmnt = async () => {
      const response = await axios.get(url);
      const tmnts = response.data.tmnts;
      const found = tmnts.find((t: tmntType) => t.id === toDelTmnt.id);
      if (!found) {
        try {
          const tmntJSON = JSON.stringify(toDelTmnt);
          await axios.post(url, tmntJSON, { withCredentials: true })          
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    let didDel = false

    beforeAll(async () => {
      await repostTmnt()
    })

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      await repostTmnt()
    })

    it('should delete a tmnt by ID', async () => {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + toDelTmnt.id,
        })
        didDel = true;
        expect(delResponse.status).toBe(200);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(200);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a tmnt by ID when ID is invalid', async () => {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + 'test',
        })
        expect(delResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a tmnt by ID when ID is not found', async () => {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + notFoundId,
        })
        expect(delResponse.status).toBe(200);
        expect(delResponse.data.count).toBe(0);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(200);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a tmnt by ID when ID is valid, but not a tmnt ID', async () => {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + nonTmntId,
        })
        expect(delResponse.status).toBe(404);
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
