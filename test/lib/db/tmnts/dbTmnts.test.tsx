import axios, { AxiosError } from "axios";
import { baseBowlsApi, baseTmntsApi } from "@/lib/api/apiPaths";
import { testBaseBowlsApi, testBaseTmntsApi } from "../../../testApi";
import type { tmntType } from "@/lib/types/types";
import { initTmnt } from "@/lib/db/initVals";
import {
  deleteTmnt,
  getTmnt,
  getTmnts,
  getTmntYears,
  getUserTmnts,
  postTmnt,
  putTmnt,
  exportedForTesting,
  getTmntFullData,
} from "@/lib/db/tmnts/dbTmnts";
import { todayStr } from "@/lib/dateTools";
import { mockBowl, mockTmntFullData } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { replaceTmntFullData, replaceTmntEntriesData } from "@/lib/db/tmnts/dbTmntsReplace";
import { cloneDeep } from "lodash";
import { postBowl } from "@/lib/db/bowls/dbBowls";
import { SquadStage } from "@prisma/client";

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
const tmntUrl = url + "/tmnt/";

const bowlUrl = testBaseBowlsApi.startsWith("undefined")
  ? baseBowlsApi
  : testBaseBowlsApi;

const notFoundId = "tmt_00000000000000000000000000000000";
const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
const notFoundUserId = "usr_00000000000000000000000000000000";

describe("dbTmnts", () => {

  const postMockBowl = async () => {
    try { 
      await postBowl(mockBowl);        
    } catch (err) { 
      // do nothing
    }
  }

  const deleteMockTmnt = async () => {
    try { 
      await deleteTmnt(mockTmntFullData.tmnt.id);
    } catch (err) { 
      // do nothing        
    }
  }

  const deleteMockBowl = async () => {
    try {         
      await axios.delete(bowlUrl + "/bowl/" + mockBowl.id, {
        withCredentials: true,
      });
    } catch (err) { 
      // do nothing        
    }
  }

  describe("getTmnt", () => {
    // from prisma/seeds.ts
    const tmntToGet = {
      ...initTmnt,
      id: "tmt_fd99387c33d9c78aba290286576ddce5",
      user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
      tmnt_name: "Gold Pin",
      bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
      start_date_str: "2022-10-23",
      end_date_str: "2022-10-23",
    };

    it("should get a single tmnt", async () => {
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
    });
    it("should throw error when trying to get a tmnt that does not exist", async () => {
      try {
        await getTmnt(notFoundId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "getTmnt failed: Request failed with status code 404"
        );
      }
    });
    it("should throw error if tmmt id is invalid", async () => {
      try {
        await getTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error if tmnt id is a valid id, but not a tmnt id", async () => {
      try {
        await getTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error if tmnt id is null", async () => {
      try {
        await getTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });

  describe("getUserTmnts", () => {
    it("should get user's tmnts", async () => {
      const userTmnts = await getUserTmnts(userId);
      // 10 tmnt rows for user in prisma/seed.ts
      expect(userTmnts).toHaveLength(11);
      if (!userTmnts) return;
      expect(userTmnts[0].user_id).toBe(userId);
      expect(userTmnts[10].user_id).toBe(userId);
      // tmnts sorted by date, newest to oldest
      expect(userTmnts[0].id).toBe("tmt_ce35f0c119aa49fd9b89aa86cb980a6a");
      expect(userTmnts[0].start_date_str).toBe("2026-12-31");
      expect(userTmnts[1].id).toBe("tmt_e134ac14c5234d708d26037ae812ac33");
      expect(userTmnts[1].start_date_str).toBe("2026-08-19");
      expect(userTmnts[2].id).toBe("tmt_2d494e9bb51f4b9abba428c3f37131c9");
      expect(userTmnts[2].start_date_str).toBe("2024-12-20");
      expect(userTmnts[3].id).toBe("tmt_a237a388a8fc4641a2e37233f1d6bebd");
      expect(userTmnts[3].start_date_str).toBe("2024-12-01");
      expect(userTmnts[4].id).toBe("tmt_d237a388a8fc4641a2e37233f1d6bebd");
      expect(userTmnts[4].start_date_str).toBe("2024-07-01");
      expect(userTmnts[5].id).toBe("tmt_9a34a65584f94f548f5ce3b3becbca19");
      expect(userTmnts[5].start_date_str).toBe("2024-01-05");
      expect(userTmnts[6].id).toBe("tmt_fe8ac53dad0f400abe6354210a8f4cd1");
      expect(userTmnts[6].start_date_str).toBe("2023-12-31");
      expect(userTmnts[7].id).toBe("tmt_718fe20f53dd4e539692c6c64f991bbe");
      expect(userTmnts[7].start_date_str).toBe("2023-12-20");
      expect(userTmnts[8].id).toBe("tmt_467e51d71659d2e412cbc64a0d19ecb4");
      expect(userTmnts[8].start_date_str).toBe("2023-09-16");
      expect(userTmnts[9].id).toBe("tmt_a78f073789cc0f8a9a0de8c6e273eab1");
      expect(userTmnts[9].start_date_str).toBe("2023-01-02");
      expect(userTmnts[10].id).toBe("tmt_fd99387c33d9c78aba290286576ddce5");
      expect(userTmnts[10].start_date_str).toBe("2022-10-23");

      expect(userTmnts[0].bowls).not.toBeNull();
    });
    it("should not get user tmnts when user has no tmnts", async () => {
      const userTmnts = await getUserTmnts(notFoundUserId);
      expect(userTmnts).toHaveLength(0);
    });
    it("should throw error if user id is invalid", async () => {
      try {
        await getUserTmnts("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid user id");
      }
    });
    it("should not get user tmnts when user id is valid, but not a user id", async () => {
      try {
        await getUserTmnts(notFoundId); // tmnt id
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid user id");
      }
    });
    it("should throw error if user id is null", async () => {
      try {
        await getUserTmnts(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid user id");
      }
    });
  });

  describe("getTmntYears", () => {
    it("should get list tmnt years", async () => {
      const years = await getTmntYears();
      expect(years).not.toBeNull();
      if (!years) return;
      expect(years.length).toBeGreaterThan(1);
      for (let i = 0; i < years.length - 1; i++) {
        expect(Number(years[i].year)).toBeGreaterThan(
          Number(years[i + 1].year)
        );
      }
    });
  });

  describe("getTmnts() - upcomining tmnts", () => {
    it("should get all upcoming tmnts - getTmnts()", async () => {
      const tmnts = await getTmnts(""); // get upcoming tmnts
      expect(tmnts).not.toBeNull();
      if (!tmnts) return;
      // 2 rows for results in prisma/seed.ts
      expect(tmnts).toHaveLength(2);
      expect(tmnts[0].bowls).not.toBeNull();
      expect(tmnts[0].start_date_str).toBe("2026-08-19");
      expect(tmnts[1].bowls).not.toBeNull();
      expect(tmnts[1].start_date_str).toBe("2026-12-31");
    });
    it("should get all upcoming tmnts - getUpcomingTmnts()", async () => {
      const tmnts = await getUpcomingTmnts();
      expect(tmnts).not.toBeNull();
      if (!tmnts) return;
      // 2 rows for results in prisma/seed.ts
      expect(tmnts).toHaveLength(2);
      expect(tmnts[0].bowls).not.toBeNull();
      expect(tmnts[0].start_date_str).toBe("2026-08-19");
      expect(tmnts[1].bowls).not.toBeNull();
      expect(tmnts[1].start_date_str).toBe("2026-12-31");
    });
    it("should get all upcoming tmnts take 1", async () => {
      const tmnts = await getTmnts("", 0, 1); // get upcoming tmnts
      expect(tmnts).not.toBeNull();
      if (!tmnts) return;
      // 1 rows for results in prisma/seed.ts
      expect(tmnts).toHaveLength(1);
      expect(tmnts[0].bowls).not.toBeNull();
      expect(tmnts[0].start_date_str).toBe("2026-08-19");
    });
    it("should get all upcoming tmnts skip 1, take 1", async () => {
      const tmnts = await getTmnts("", 1, 1); // get upcoming tmnts
      expect(tmnts).not.toBeNull();
      if (!tmnts) return;
      // 1 rows for results in prisma/seed.ts
      expect(tmnts).toHaveLength(1);
      expect(tmnts[0].bowls).not.toBeNull();
      expect(tmnts[0].start_date_str).toBe("2026-12-31");
    });
    it("should get all upcoming tmnts - ignore invalid skip and take", async () => {
      const tmnts = await getTmnts("", -1, 1.1); // get upcoming tmnts
      expect(tmnts).not.toBeNull();
      if (!tmnts) return;
      // 2 rows for results in prisma/seed.ts
      expect(tmnts).toHaveLength(2);
      expect(tmnts[0].bowls).not.toBeNull();
      expect(tmnts[0].start_date_str).toBe("2026-08-19");
      expect(tmnts[1].bowls).not.toBeNull();
      expect(tmnts[1].start_date_str).toBe("2026-12-31");
    });
    it("should throw error if year is null", async () => {
      try {
        await getTmnts(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid year");
      }
    });
  });

  describe("getTmnts() - for a year", () => {
    it("should get tmnt results for year 2023 - getTmnts()", async () => {
      const tmnts = await getTmnts("2023");
      expect(tmnts).not.toBeNull();
      if (!tmnts) return;
      // 5 rows for 2023 tmnts in prisma/seed.ts
      expect(tmnts).toHaveLength(5);
      expect(tmnts[0].bowls).not.toBeNull();
      expect(tmnts[0].start_date_str).toBe("2023-12-31");
    });
    it("should get tmnt results for year 2023 - getTmntsForYear()", async () => {
      const tmnts = await getTmntsForYear("2023");
      expect(tmnts).not.toBeNull();
      if (!tmnts) return;
      // 5 rows for 2023 tmnts in prisma/seed.ts
      expect(tmnts).toHaveLength(5);
      expect(tmnts[0].bowls).not.toBeNull();
      expect(tmnts[0].start_date_str).toBe("2023-12-31");
    });
    it("should get tmnt results for year 2022 - getTmntsForYear()", async () => {
      const tmnts = await getTmntsForYear("2022");
      expect(tmnts).not.toBeNull();
      if (!tmnts) return;
      // 3 rows for 2022 tmnts in prisma/seed.ts
      expect(tmnts).toHaveLength(3);
      expect(tmnts[0].start_date_str).toBe("2022-10-23");
    });
    it("should get tmnt results for year 2022 - getTmnts()", async () => {
      const tmnts = await getTmnts("2022");
      expect(tmnts).not.toBeNull();
      if (!tmnts) return;
      // 3 rows for 2022 tmnts in prisma/seed.ts
      expect(tmnts).toHaveLength(3);
      expect(tmnts[0].start_date_str).toBe("2022-10-23");
    });
    it("should get tmnt results for year 2001 - getTmntsForYear()", async () => {
      const tmnts = await getTmntsForYear("2001");
      expect(tmnts).not.toBeNull();
      if (!tmnts) return;
      // 0 rows for 2001 tmnts in prisma/seed.ts
      expect(tmnts).toHaveLength(0);
    });
    it("should get tmnt results for year 2001 - getTmnts()", async () => {
      const tmnts = await getTmnts("2001");
      expect(tmnts).not.toBeNull();
      if (!tmnts) return;
      // 0 rows for 2001 tmnts in prisma/seed.ts
      expect(tmnts).toHaveLength(0);
    });
    it("should throw error if year is invalid", async () => {
      try {
        await getTmnts("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid year");
      }
    });
  });

  describe("getTmntFullData", () => {
    it("should get a tmnt and its full data - Full Tournament", async () => {

      const fullTmntId = "tmt_d237a388a8fc4641a2e37233f1d6bebd";
      const fullBowlId = "bwl_561540bd64974da9abdd97765fdb3659";
      const fullDivId = "div_99a3cae28786485bb7a036935f0f6a0a";
      const fullEventId = "evt_4ff710c8493f4a218d2e2b045442974a";
      const fullSquadId = "sqd_8e4266e1174642c7a1bcec47a50f275f";
      const fullStageId = 'stg_124dd9efc30f4352b691dfd93d1e284e';

      const tmntFullData = await getTmntFullData(fullTmntId);
      expect(tmntFullData).not.toBeNull();
      if (!tmntFullData) return;
      expect(tmntFullData.tmnt.id).toBe(fullTmntId);
      expect(tmntFullData.tmnt.tmnt_name).toBe("Full Tournament");
      expect(tmntFullData.tmnt.bowls).not.toBeNull();
      expect(tmntFullData.tmnt.bowl_id).toBe(fullBowlId);
      expect(tmntFullData.tmnt.bowls.bowl_name).toBe(
        "Earl Anthony's Dublin Bowl"
      );
      expect(tmntFullData.tmnt.bowls.city).toBe("Dublin");
      expect(tmntFullData.tmnt.bowls.state).toBe("CA");
      expect(tmntFullData.tmnt.bowls.url).toBe(
        "https://www.earlanthonysdublinbowl.com"
      );

      const events = tmntFullData.events;
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe(fullEventId);
      expect(events[0].tmnt_id).toBe(fullTmntId);
      expect(events[0].event_name).toBe("Singles");
      expect(events[0].team_size).toBe(1);
      expect(events[0].games).toBe(6);
      expect(events[0].entry_fee).toBe("90");
      expect(events[0].lineage).toBe("21");
      expect(events[0].prize_fund).toBe("62");
      expect(events[0].other).toBe("2");
      expect(events[0].expenses).toBe("5");
      expect(events[0].added_money).toBe("0");
      expect(events[0].lpox).toBe("90");
      expect(events[0].sort_order).toBe(1);

      const divs = tmntFullData.divs;
      expect(divs).toHaveLength(1);
      expect(divs[0].id).toBe(fullDivId);
      expect(divs[0].div_name).toBe("Scratch");
      expect(divs[0].hdcp_per).toBe(0);
      expect(divs[0].hdcp_from).toBe(230);
      expect(divs[0].int_hdcp).toBe(true);
      expect(divs[0].hdcp_for).toBe("Game");
      expect(divs[0].sort_order).toBe(1);

      const divEntries = tmntFullData.divEntries;
      expect(divEntries).toHaveLength(36);
      for (let d = 0; d < 36; d++) {
        const idNum = (d + 1).toString().padStart(2, "0");
        const id = `den_a${idNum}631c1c94d4627bde16fad72e5e5d4`;
        const playerId = `ply_a${idNum}758cff1cc4bab9d9133e661bd49b0`;
        expect(divEntries[d].id).toBe(id);
        expect(divEntries[d].div_id).toBe(fullDivId);
        expect(divEntries[d].squad_id).toBe(fullSquadId);
        expect(divEntries[d].player_id).toBe(playerId);
        expect(divEntries[d].fee).toBe("90");
        expect(divEntries[d].hdcp).toBe(0);
      }

      const squads = tmntFullData.squads;
      expect(squads).toHaveLength(1);
      expect(squads[0].id).toBe(fullSquadId);
      expect(squads[0].event_id).toBe(fullEventId);
      expect(squads[0].squad_name).toBe("Squad 1");
      expect(squads[0].games).toBe(6);
      expect(squads[0].lane_count).toBe(12);
      expect(squads[0].starting_lane).toBe(29);
      expect(squads[0].sort_order).toBe(1);

      const squad = tmntFullData.stage;
      expect(squad).not.toBeNull();
      if (!squad) return;
      expect(squad.id).toBe(fullStageId);
      expect(squad.squad_id).toBe(fullSquadId);
      expect(squad.stage).toBe(SquadStage.ENTRIES);
      expect(squad.stage_set_at).toBe('2024-07-01T00:00:00.000Z');
      expect(squad.scores_started_at).toBe(null);
      expect(squad.stage_override_enabled).toBe(false);
      expect(squad.stage_override_reason).toBe(null);          

      const lanes = tmntFullData.lanes;
      expect(lanes).toHaveLength(12);
      expect(lanes[0].id).toBe("lan_ab019d9e6b6e4c5b9f6b7d9e7f9b6c5d");
      expect(lanes[0].squad_id).toBe(fullSquadId);
      expect(lanes[0].lane_number).toBe(29);
      expect(lanes[0].in_use).toBe(true);
      expect(lanes[1].id).toBe("lan_ab029d9e6b6e4c5b9f6b7d9e7f9b6c5d");
      expect(lanes[1].squad_id).toBe(fullSquadId);
      expect(lanes[1].lane_number).toBe(30);
      expect(lanes[1].in_use).toBe(true);
      expect(lanes[2].id).toBe("lan_ab039d9e6b6e4c5b9f6b7d9e7f9b6c5d");
      expect(lanes[2].squad_id).toBe(fullSquadId);
      expect(lanes[2].lane_number).toBe(31);
      expect(lanes[2].in_use).toBe(true);
      expect(lanes[3].id).toBe("lan_ab049d9e6b6e4c5b9f6b7d9e7f9b6c5d");
      expect(lanes[3].squad_id).toBe(fullSquadId);
      expect(lanes[3].lane_number).toBe(32);
      expect(lanes[3].in_use).toBe(true);
      expect(lanes[4].id).toBe("lan_ab059d9e6b6e4c5b9f6b7d9e7f9b6c5d");
      expect(lanes[4].squad_id).toBe(fullSquadId);
      expect(lanes[4].lane_number).toBe(33);
      expect(lanes[4].in_use).toBe(true);
      expect(lanes[5].id).toBe("lan_ab069d9e6b6e4c5b9f6b7d9e7f9b6c5d");
      expect(lanes[5].squad_id).toBe(fullSquadId);
      expect(lanes[5].lane_number).toBe(34);
      expect(lanes[5].in_use).toBe(true);
      expect(lanes[6].id).toBe("lan_ab079d9e6b6e4c5b9f6b7d9e7f9b6c5d");
      expect(lanes[6].squad_id).toBe(fullSquadId);
      expect(lanes[6].lane_number).toBe(35);
      expect(lanes[6].in_use).toBe(true);
      expect(lanes[7].id).toBe("lan_ab089d9e6b6e4c5b9f6b7d9e7f9b6c5d");
      expect(lanes[7].squad_id).toBe(fullSquadId);
      expect(lanes[7].lane_number).toBe(36);
      expect(lanes[7].in_use).toBe(true);
      expect(lanes[8].id).toBe("lan_ab099d9e6b6e4c5b9f6b7d9e7f9b6c5d");
      expect(lanes[8].squad_id).toBe(fullSquadId);
      expect(lanes[8].lane_number).toBe(37);
      expect(lanes[8].in_use).toBe(true);
      expect(lanes[9].id).toBe("lan_ab109d9e6b6e4c5b9f6b7d9e7f9b6c5d");
      expect(lanes[9].squad_id).toBe(fullSquadId);
      expect(lanes[9].lane_number).toBe(38);
      expect(lanes[9].in_use).toBe(true);
      expect(lanes[10].id).toBe("lan_ab119d9e6b6e4c5b9f6b7d9e7f9b6c5d");
      expect(lanes[10].squad_id).toBe(fullSquadId);
      expect(lanes[10].lane_number).toBe(39);
      expect(lanes[10].in_use).toBe(true);
      expect(lanes[11].id).toBe("lan_ab129d9e6b6e4c5b9f6b7d9e7f9b6c5d");
      expect(lanes[11].squad_id).toBe(fullSquadId);
      expect(lanes[11].lane_number).toBe(40);
      expect(lanes[11].in_use).toBe(true);

      const pots = tmntFullData.pots;
      expect(pots.length).toBe(1);
      expect(pots[0].id).toBe("pot_89fd8f787de942a1a92aaa2df3e7c185");
      expect(pots[0].squad_id).toBe(fullSquadId);
      expect(pots[0].div_id).toBe(fullDivId);
      expect(pots[0].fee).toBe("20");
      expect(pots[0].pot_type).toBe("Game");
      expect(pots[0].sort_order).toBe(1);

      const potEntries = tmntFullData.potEntries;
      expect(potEntries).toHaveLength(30);
      for (let i = 0; i < 30; i++) {
        expect(potEntries[i].fee).toBe("20");
        expect(potEntries[i].player_id).not.toBeNull();
      }

      const brkts = tmntFullData.brkts;
      expect(brkts.length).toBe(2);
      for (let i = 0; i < brkts.length; i++) {
        expect(brkts[i].squad_id).toBe(fullSquadId);
        expect(brkts[i].div_id).toBe(fullDivId);
        expect(brkts[i].games).toBe(3);
        expect(brkts[i].players).toBe(8);
        expect(brkts[i].fee).toBe("5");
        expect(brkts[i].first).toBe("25");
        expect(brkts[i].second).toBe("10");
        expect(brkts[i].admin).toBe("5");
        expect(brkts[i].fsa).toBe("40");
        if (brkts[i].id === "brk_3e6bf51cc1ca4748ad5e8abab88277e0") {
          expect(brkts[i].start).toBe(1);
          expect(brkts[i].sort_order).toBe(1);
        } else if (brkts[i].id === "brk_fd88cd2f5a164e8c8f758daae18bfc83") {
          expect(brkts[i].start).toBe(4);
          expect(brkts[i].sort_order).toBe(2);
        } else {
          expect(true).toBeFalsy();
        }
      }
      const brktEntries = tmntFullData.brktEntries;
      for (let i = 0; i < brktEntries.length; i++) {
        if (brktEntries[i].id === "ben_c0126ba58d3f4a7d950101a5674ce595") {
          expect(brktEntries[i].num_brackets).toBe(10);
          expect(brktEntries[i].player_id).toBe(
            "ply_a01758cff1cc4bab9d9133e661bd49b0"
          );
          expect(brktEntries[i].fee).toBe(50);
          expect(brktEntries[i].num_refunds).toBeUndefined();
        } else if (
          brktEntries[i].id === "ben_c0226ba58d3f4a7d950101a5674ce595"
        ) {
          expect(brktEntries[i].num_brackets).toBe(10);
          expect(brktEntries[i].player_id).toBe(
            "ply_a01758cff1cc4bab9d9133e661bd49b0"
          );
          expect(brktEntries[i].fee).toBe(50);
          expect(brktEntries[i].num_refunds).toBeUndefined();
        } else if (
          brktEntries[i].id === "ben_c0326ba58d3f4a7d950101a5674ce595"
        ) {
          expect(brktEntries[i].num_brackets).toBe(8);
          expect(brktEntries[i].player_id).toBe(
            "ply_a02758cff1cc4bab9d9133e661bd49b0"
          );
          expect(brktEntries[i].fee).toBe(40);
          expect(brktEntries[i].num_refunds).toBeUndefined();
        } else if (
          brktEntries[i].id === "ben_c2126ba58d3f4a7d950101a5674ce595"
        ) {
          expect(brktEntries[i].num_brackets).toBe(21);
          expect(brktEntries[i].player_id).toBe(
            "ply_a11758cff1cc4bab9d9133e661bd49b0"
          );
          expect(brktEntries[i].fee).toBe(105);
          expect(brktEntries[i].num_refunds).toBe(4);        
        } else if (
          brktEntries[i].id === "ben_c2226ba58d3f4a7d950101a5674ce595"
        ) {
          expect(brktEntries[i].num_brackets).toBe(21);
          expect(brktEntries[i].player_id).toBe(
            "ply_a11758cff1cc4bab9d9133e661bd49b0"
          )  
          expect(brktEntries[i].fee).toBe(105);
          expect(brktEntries[i].num_refunds).toBe(4);
        } else {
          expect(brktEntries[i].num_brackets).toBeGreaterThan(0);
          expect(brktEntries[i].player_id).not.toBeNull();
          expect(brktEntries[i].fee).toBeGreaterThan(0);
          expect(brktEntries[i].num_refunds).toBeUndefined();
        }
      }

      const elims = tmntFullData.elims;
      expect(elims.length).toBe(2);
      for (let i = 0; i < 2; i++) {
        expect(elims[i].squad_id).toBe(fullSquadId);
        expect(elims[i].div_id).toBe(fullDivId);
        expect(elims[i].games).toBe(3);
        expect(elims[i].fee).toBe("5");
        if (elims[i].id === "elm_c47a4ec07f824b0e93169ae78e8b4b1e") {
          expect(elims[i].start).toBe(1);
          expect(elims[i].sort_order).toBe(1);
        } else if (elims[i].id === "elm_461eece3c50241e9925e9a520730ac7e") {
          expect(elims[i].start).toBe(4);
          expect(elims[i].sort_order).toBe(2);
        } else {
          expect(true).toBeFalsy();
        }
      }

      const elimEntries = tmntFullData.elimEntries;
      for (let i = 0; i < elimEntries.length; i++) {
        expect(elimEntries[i].player_id).not.toBeNull();
        expect([
          "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
          "elm_461eece3c50241e9925e9a520730ac7e",
        ]).toContain(elimEntries[i].elim_id);
        expect(elimEntries[i].fee).toBe("5");
      }

      const players = tmntFullData.players;
      expect(players.length).toBe(36);
      for (let p = 0; p < 36; p++) {
        const lane = 29 + Math.floor(p / 3);
        expect(players[p].lane).toBe(lane);

        const positions = ["A", "B", "C", "D", "E", "F"];
        const position = positions[p % 6];
        expect(players[p].position).toBe(position);

        const idNum = (p + 1).toString().padStart(2, "0");
        const id = `ply_a${idNum}758cff1cc4bab9d9133e661bd49b0`;
        expect(players[p].id).toBe(id);

        expect(players[p].first_name).not.toBeNull();
        expect(players[p].last_name).not.toBeNull();
        expect(players[p].average).toBeGreaterThan(190);
        expect(players[p].average).toBeLessThan(231);
      }
    });
    it("should get a tmnt and its configuration - Yosemite 6 Gamer", async () => {
      const fullTmntId = "tmt_56d916ece6b50e6293300248c6792316";
      const fullBowlId = "bwl_8b4a5c35ad1247049532ff53a12def0a";
      const tmntFullData = await getTmntFullData(fullTmntId);
      expect(tmntFullData).not.toBeNull();
      if (!tmntFullData) return;
      expect(tmntFullData.tmnt.id).toBe(fullTmntId);
      expect(tmntFullData.tmnt.tmnt_name).toBe("Yosemite 6 Gamer");
      expect(tmntFullData.tmnt.bowls).not.toBeNull();
      expect(tmntFullData.tmnt.bowl_id).toBe(fullBowlId);
      expect(tmntFullData.tmnt.bowls.bowl_name).toBe("Yosemite Lanes");
      expect(tmntFullData.tmnt.bowls.city).toBe("Modesto");
      expect(tmntFullData.tmnt.bowls.state).toBe("CA");
      expect(tmntFullData.tmnt.bowls.url).toBe("http://yosemitelanes.com");

      const events = tmntFullData.events;
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe("evt_dadfd0e9c11a4aacb87084f1609a0afd");
      expect(events[0].tmnt_id).toBe(fullTmntId);
      expect(events[0].event_name).toBe("Singles");
      expect(events[0].team_size).toBe(1);
      expect(events[0].games).toBe(6);
      expect(events[0].entry_fee).toBe("60");
      expect(events[0].lineage).toBe("15");
      expect(events[0].prize_fund).toBe("45");
      expect(events[0].other).toBe("0");
      expect(events[0].expenses).toBe("0");
      expect(events[0].added_money).toBe("0");
      expect(events[0].lpox).toBe("60");
      expect(events[0].sort_order).toBe(1);

      const divs = tmntFullData.divs;
      expect(divs).toHaveLength(2);
      expect(divs[0].id).toBe("div_1f42042f9ef24029a0a2d48cc276a087");
      expect(divs[0].div_name).toBe("Scratch");
      expect(divs[0].hdcp_per).toBe(0);
      expect(divs[0].hdcp_from).toBe(230);
      expect(divs[0].int_hdcp).toBe(true);
      expect(divs[0].hdcp_for).toBe("Game");
      expect(divs[0].sort_order).toBe(1);
      expect(divs[1].id).toBe("div_29b9225d8dd44a4eae276f8bde855729");
      expect(divs[1].div_name).toBe("50+ Scratch");
      expect(divs[1].hdcp_per).toBe(0);
      expect(divs[1].hdcp_from).toBe(230);
      expect(divs[1].int_hdcp).toBe(true);
      expect(divs[1].hdcp_for).toBe("Game");
      expect(divs[1].sort_order).toBe(2);

      const squads = tmntFullData.squads;
      expect(squads).toHaveLength(1);
      expect(squads[0].id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(squads[0].event_id).toBe("evt_dadfd0e9c11a4aacb87084f1609a0afd");
      expect(squads[0].squad_name).toBe("Squad 1");
      expect(squads[0].games).toBe(6);
      expect(squads[0].lane_count).toBe(24);
      expect(squads[0].starting_lane).toBe(9);
      expect(squads[0].sort_order).toBe(1);

      const lanes = tmntFullData.lanes;
      expect(lanes).toHaveLength(24);
      expect(lanes[0].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a126a2");
      expect(lanes[0].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[0].lane_number).toBe(9);
      expect(lanes[0].in_use).toBe(true);
      expect(lanes[1].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11234");
      expect(lanes[1].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[1].lane_number).toBe(10);
      expect(lanes[1].in_use).toBe(true);
      expect(lanes[2].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11235");
      expect(lanes[2].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[2].lane_number).toBe(11);
      expect(lanes[2].in_use).toBe(true);
      expect(lanes[3].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11236");
      expect(lanes[3].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[3].lane_number).toBe(12);
      expect(lanes[3].in_use).toBe(true);
      expect(lanes[4].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11237");
      expect(lanes[4].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[4].lane_number).toBe(13);
      expect(lanes[4].in_use).toBe(true);
      expect(lanes[5].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11238");
      expect(lanes[5].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[5].lane_number).toBe(14);
      expect(lanes[5].in_use).toBe(true);
      expect(lanes[6].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11239");
      expect(lanes[6].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[6].lane_number).toBe(15);
      expect(lanes[6].in_use).toBe(true);
      expect(lanes[7].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11240");
      expect(lanes[7].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[7].lane_number).toBe(16);
      expect(lanes[7].in_use).toBe(true);
      expect(lanes[8].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11241");
      expect(lanes[8].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[8].lane_number).toBe(17);
      expect(lanes[8].in_use).toBe(true);
      expect(lanes[9].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11242");
      expect(lanes[9].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[9].lane_number).toBe(18);
      expect(lanes[9].in_use).toBe(true);
      expect(lanes[10].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11243");
      expect(lanes[10].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[10].lane_number).toBe(19);
      expect(lanes[10].in_use).toBe(true);
      expect(lanes[11].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11244");
      expect(lanes[11].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[11].lane_number).toBe(20);
      expect(lanes[11].in_use).toBe(true);
      expect(lanes[12].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11245");
      expect(lanes[12].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[12].lane_number).toBe(21);
      expect(lanes[12].in_use).toBe(true);
      expect(lanes[13].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11246");
      expect(lanes[13].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[13].lane_number).toBe(22);
      expect(lanes[13].in_use).toBe(true);
      expect(lanes[14].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11247");
      expect(lanes[14].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[14].lane_number).toBe(23);
      expect(lanes[14].in_use).toBe(true);
      expect(lanes[15].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11248");
      expect(lanes[15].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[15].lane_number).toBe(24);
      expect(lanes[15].in_use).toBe(true);
      expect(lanes[16].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11249");
      expect(lanes[16].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[16].lane_number).toBe(25);
      expect(lanes[16].in_use).toBe(true);
      expect(lanes[17].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11250");
      expect(lanes[17].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[17].lane_number).toBe(26);
      expect(lanes[17].in_use).toBe(true);
      expect(lanes[18].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11251");
      expect(lanes[18].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[18].lane_number).toBe(27);
      expect(lanes[18].in_use).toBe(true);
      expect(lanes[19].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11252");
      expect(lanes[19].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[19].lane_number).toBe(28);
      expect(lanes[19].in_use).toBe(true);
      expect(lanes[20].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11253");
      expect(lanes[20].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[20].lane_number).toBe(29);
      expect(lanes[20].in_use).toBe(true);
      expect(lanes[21].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11254");
      expect(lanes[21].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[21].lane_number).toBe(30);
      expect(lanes[21].in_use).toBe(true);
      expect(lanes[22].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11255");
      expect(lanes[22].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[22].lane_number).toBe(31);
      expect(lanes[22].in_use).toBe(true);
      expect(lanes[23].id).toBe("lan_4e24c5cc04f6463d89f24e6e19a11256");
      expect(lanes[23].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(lanes[23].lane_number).toBe(32);
      expect(lanes[23].in_use).toBe(true);

      const pots = tmntFullData.pots;
      expect(pots.length).toBe(2);
      expect(pots[0].id).toBe("pot_98b3a008619b43e493abf17d9f462a65");
      expect(pots[0].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(pots[0].div_id).toBe("div_1f42042f9ef24029a0a2d48cc276a087");
      expect(pots[0].fee).toBe("10");
      expect(pots[0].pot_type).toBe("Game");
      expect(pots[0].sort_order).toBe(1);
      expect(pots[1].id).toBe("pot_ab80213899ea424b938f52a062deacfe");
      expect(pots[1].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
      expect(pots[1].div_id).toBe("div_1f42042f9ef24029a0a2d48cc276a087");
      expect(pots[1].fee).toBe("10");
      expect(pots[1].pot_type).toBe("Last Game");
      expect(pots[1].sort_order).toBe(2);

      const brkts = tmntFullData.brkts;
      expect(brkts.length).toBe(2);
      for (let i = 0; i < brkts.length; i++) {
        expect(brkts[i].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
        expect(brkts[i].div_id).toBe("div_1f42042f9ef24029a0a2d48cc276a087");
        expect(brkts[i].games).toBe(3);
        expect(brkts[i].players).toBe(8);
        expect(brkts[i].fee).toBe("5");
        expect(brkts[i].first).toBe("25");
        expect(brkts[i].second).toBe("10");
        expect(brkts[i].admin).toBe("5");
      }
      if (brkts[0].id === "brk_aa3da3a411b346879307831b6fdadd5f") {
        expect(brkts[0].start).toBe(1);
        expect(brkts[1].start).toBe(4);
        expect(brkts[0].sort_order).toBe(1);
        expect(brkts[1].sort_order).toBe(2);
      } else if (brkts[0].id === "brk_37345eb6049946ad83feb9fdbb43a307") {
        expect(brkts[0].start).toBe(4);
        expect(brkts[1].start).toBe(1);
        expect(brkts[0].sort_order).toBe(2);
        expect(brkts[1].sort_order).toBe(1);
      } else {
        expect(true).toBeFalsy();
      }

      const elims = tmntFullData.elims;
      expect(elims.length).toBe(2);
      for (let i = 0; i < brkts.length; i++) {
        expect(elims[i].squad_id).toBe("sqd_1a6c885ee19a49489960389193e8f819");
        expect(elims[i].div_id).toBe("div_1f42042f9ef24029a0a2d48cc276a087");
        expect(brkts[i].games).toBe(3);
        expect(brkts[i].fee).toBe("5");
      }
      if (elims[0].id === "elm_b4c3939adca140898b1912b75b3725f8") {
        expect(elims[0].start).toBe(1);
        expect(elims[1].start).toBe(4);
        expect(elims[0].sort_order).toBe(1);
        expect(elims[1].sort_order).toBe(2);
      } else if (elims[0].id === "elm_4f176545e4294a0292732cccada91b9d") {
        expect(elims[0].start).toBe(4);
        expect(elims[1].start).toBe(1);
        expect(elims[0].sort_order).toBe(2);
        expect(elims[1].sort_order).toBe(1);
      } else {
        expect(true).toBeFalsy();
      }
    });
    it("should throw error if tmnt id is invalid", async () => {
      try {
        await getTmntFullData("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it('should throw error if tmnt id is a valid id, but not found in db', async () => { 
      try {
        await getTmntFullData(notFoundId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("getTmntFullData failed: Request failed with status code 404");
      } 
    })
    it("should throw error if tmnt id is a valid id, but not a tmnt id", async () => {
      try {
        await getTmntFullData(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error if tmnt id is null", async () => {
      try {
        await getTmntFullData(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });

    describe("getTmntFullData - invalid child data", () => { 

      const postMockTmnt = async () => {
        try { 
          const tmntJSON = JSON.stringify(mockTmntFullData.tmnt);
          await axios.post(url, tmntJSON, {
            withCredentials: true,
          });      
        } catch (err) { 
          // do nothing
        }
      }

      const postMockDivs = async () => {
        try {
          const divsJSON = JSON.stringify(mockTmntFullData.divs);
          await axios.post(url, divsJSON, {
            withCredentials: true,
          });      
        } catch (err) { 
          // do nothing
        }
      }

      const postMockEvents = async () => {
        try {
          const eventsJSON = JSON.stringify(mockTmntFullData.events);
          await axios.post(url, eventsJSON, {
            withCredentials: true,
          });      
        } catch (err) { 
          // do nothing
        }
      }

      const postMockSquads = async () => {
        try {
          const squadsJSON = JSON.stringify(mockTmntFullData.squads);
          await axios.post(url, squadsJSON, {
            withCredentials: true,
          });      
        } catch (err) { 
          // do nothing
        }        
      }

      const postMockLanes = async () => {
        try {
          const lanesJSON = JSON.stringify(mockTmntFullData.lanes);
          await axios.post(url, lanesJSON, {
            withCredentials: true,
          });      
        } catch (err) { 
          // do nothing
        }
      }      

      beforeAll(async () => {
        await deleteMockTmnt();  // also deletes mock divs, events, squads and lanes 
        await deleteMockBowl(); 
        await postMockBowl();
        await postMockTmnt(); 
      })

      beforeEach(async () => {
        postMockTmnt();
      })

      afterEach(async () => {
        await deleteMockTmnt();   // also deletes mock divs, events, squads and lanes
      })

      afterAll(async () => {        
        await deleteMockBowl();
      })

      it('should throw error if tmnt has no div(s)', async () => {
        try {
          await postMockEvents();
          await postMockSquads();
          await postMockLanes();
          await getTmntFullData(mockTmntFullData.tmnt.id);
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
          expect((err as Error).message).toContain("missing required child data");
          expect((err as Error).message).toContain("Div");          
        }
      })
      it('should throw error if tmnt has no event(s)', async () => {
        try {
          await postMockDivs();
          // squads is a child of events, lanes is a child of squads
          await getTmntFullData(mockTmntFullData.tmnt.id);
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
          expect((err as Error).message).toContain("missing required child data");
          expect((err as Error).message).toContain("Event");
        }
      })
      it('should throw error if tmnt has no squad(s)', async () => {
        try {
          await postMockDivs();
          await postMockEvents();
          // lanes is a child of squads
          await getTmntFullData(mockTmntFullData.tmnt.id);
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
          expect((err as Error).message).toContain("missing required child data");
          expect((err as Error).message).toContain("Squad");
        }
      })
      it('should throw error if tmnt has no lane(s)', async () => {
        try {
          await postMockDivs();
          await postMockEvents();
          await postMockSquads();
          await getTmntFullData(mockTmntFullData.tmnt.id);
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
          expect((err as Error).message).toContain("missing required child data");
          expect((err as Error).message).toContain("Lane");
        }
      })
    })
  });

  describe('replaceTmntFullData()', () => {
    
    let replacedTmnt = false;

    beforeAll(async () => {
      await deleteMockTmnt();
      await deleteMockBowl();
      await postMockBowl();
    });

    beforeEach(() => {
      replacedTmnt = false;
    });

    afterEach(async () => {
      if (replacedTmnt) {
        await deleteMockTmnt();
      }
    });

    afterAll(async () => {
      await deleteMockTmnt();
      await deleteMockBowl();
    })

    it('returns a boolean success flag', async () => {
      const toReplace = cloneDeep(mockTmntFullData);
      toReplace.brktEntries = [];
      toReplace.brktSeeds = [];
      toReplace.brkts = [];
      toReplace.divEntries = [];
      toReplace.elimEntries = [];
      toReplace.elims = [];
      toReplace.oneBrkts = [];
      toReplace.potEntries = [];
      toReplace.pots = [];
      const result = await replaceTmntFullData(toReplace);      
      expect(typeof result).toBe("boolean");
    })
    it('should replace a tmnt - just core four: events, divs, squads and lanes', async () => {
      const toReplace = cloneDeep(mockTmntFullData);
      toReplace.brktEntries = [];
      toReplace.brktSeeds = [];
      toReplace.brkts = [];
      toReplace.divEntries = [];
      toReplace.elimEntries = [];
      toReplace.elims = [];
      toReplace.oneBrkts = [];
      toReplace.potEntries = [];
      toReplace.pots = [];

      const result = await replaceTmntFullData(toReplace);      
      expect(result).toBe(true);
    })
    it('should replace a tmnt - core four + pots, brkts and elims', async () => {
      const toReplace = cloneDeep(mockTmntFullData);
      toReplace.brktEntries = [];
      toReplace.brktSeeds = [];
      toReplace.divEntries = [];
      toReplace.elimEntries = [];
      toReplace.oneBrkts = [];
      toReplace.potEntries = [];

      const result = await replaceTmntFullData(toReplace);
      expect(result).toBe(true);
    })
    it('replaces a full tmnt - tmnt not in database', async () => {
      const result = await replaceTmntFullData(mockTmntFullData)
      expect(result).toBe(true);
      replacedTmnt = true;

      const tmnt = await getTmnt(mockTmntFullData.tmnt.id);
      expect(tmnt).toEqual(mockTmntFullData.tmnt);
    });
    it('replaces a full tmnt - tmnt in database', async () => {
      const result = await replaceTmntFullData(mockTmntFullData)
      expect(result).toBe(true);
      replacedTmnt = true;

      const editedTmnt = cloneDeep(mockTmntFullData);
      editedTmnt.tmnt.tmnt_name = "Edited Tmnt";
      editedTmnt.events[0].event_name = "Edited Event";
      editedTmnt.divs[0].div_name = "Edited Div";
      editedTmnt.squads[0].squad_name = "Edited Squad";
      const result2 = await replaceTmntFullData(editedTmnt);
      expect(result2).toBe(true);

      const tmnt = await getTmnt(editedTmnt.tmnt.id);
      expect(tmnt).toEqual(editedTmnt.tmnt);
    });
    it("should throw error when post a tmnt if invalid tmnt id", async () => {
      try {
        const invalidTmnt = cloneDeep(mockTmntFullData);
        invalidTmnt.tmnt.id = "invalid id";
        await replaceTmntFullData(invalidTmnt);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("tmnt has invalid data");
      }
    });
    it("should throw error when post a tmnt if got invalid data", async () => {
      try {
        const invalidTmnt = cloneDeep(mockTmntFullData);
        invalidTmnt.tmnt.tmnt_name = "";
        await replaceTmntFullData(invalidTmnt);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('tmnt is missing data');
      }
    });
    it("should throw error when post a tmnt if passed null", async () => {
      try {
        await replaceTmntFullData(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("invalid tmntFullData data");
      }
    });
    it("should throw error when post a tmnt if passed non object", async () => {
      try {
        await replaceTmntFullData("test" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("invalid tmntFullData data");
      }
    });
  });

  describe('replaceTmntFullEntriesData()', () => { 
    
    const postMockTmntNoEntries = async (): Promise<boolean> => {
      // tmnt data without entries data
      const toReplace = cloneDeep(mockTmntFullData);
      toReplace.brktEntries = [];
      toReplace.brktSeeds = [];
      toReplace.divEntries = [];
      toReplace.elimEntries = [];
      toReplace.oneBrkts = [];
      toReplace.potEntries = [];
      try {
        return await replaceTmntFullData(toReplace);
      } catch (err) {
        // do nothing
        throw err;
      }
    }

    let replacedTmnt = false;

    beforeAll(async () => {
      await deleteMockTmnt();
      await deleteMockBowl();
      await postMockBowl(); 
      await postMockTmntNoEntries();
    });

    beforeEach(async () => {      
      replacedTmnt = false;

      const success = await postMockTmntNoEntries();
      if (success) {
        replacedTmnt = true;
      }
    });

    afterEach(async () => {
      if (replacedTmnt) {
        await deleteMockTmnt();
        // await postMockTmntNoEntries();
      }
    });

    afterAll(async () => {
      await deleteMockTmnt();
      await deleteMockBowl();
    })

    // it('should replace a tmnt entries - all entries data', async () => {
    //   await postMockTmntNoEntries();
    //   replacedTmnt = true;

    //   const toReplace = cloneDeep(mockTmntFullData);
    //   const before = Date.now();

    //   const result = await replaceTmntEntriesData(toReplace);

    //   const after = Date.now();
    //   const twoMinutes = 2 * 60 * 1000;

    //   expect(result.success).toBe(true);
    //   expect(result.stage).not.toBeNull();

    //   const puttedStage = result.stage;
    //   const stageSetAtMs = new Date(puttedStage.stage_set_at).getTime();
    //   expect(puttedStage.id).toBe(toReplace.stage.id);
    //   expect(puttedStage.squad_id).toBe(toReplace.stage.squad_id);
    //   expect(puttedStage.stage).toBe(toReplace.stage.stage);
      
    //   expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
    //   expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);

    //   expect(puttedStage.stage_override_enabled).toBe(toReplace.stage.stage_override_enabled);
    //   expect(puttedStage.stage_override_at).toBe(toReplace.stage.stage_override_at);
    //   expect(puttedStage.stage_override_reason).toBe(toReplace.stage.stage_override_reason);

    //   const players = await getAllPlayersForTmnt(toReplace.tmnt.id);
    //   expect(players.length).toEqual(toReplace.players.length);
    //   for (let i = 0; i < players.length; i++) {
    //     const foundPlayer = toReplace.players.find(p => p.id === players[i].id);
    //     expect(foundPlayer).not.toBeUndefined();
    //     expect(foundPlayer?.squad_id).toBe(toReplace.players[i].squad_id);
    //     if (foundPlayer?.id === toReplace.players[0].id) {
    //       expect(foundPlayer?.first_name).toBe(toReplace.players[0].first_name);
    //       expect(foundPlayer?.last_name).toBe(toReplace.players[0].last_name);
    //       expect(foundPlayer?.average).toBe(toReplace.players[0].average);
    //       expect(foundPlayer?.lane).toBe(toReplace.players[0].lane);
    //       expect(foundPlayer?.position).toBe(toReplace.players[0].position);
    //     } else if (foundPlayer?.id === toReplace.players[1].id) {
    //       expect(foundPlayer?.first_name).toBe(toReplace.players[1].first_name);
    //       expect(foundPlayer?.last_name).toBe(toReplace.players[1].last_name);
    //       expect(foundPlayer?.average).toBe(toReplace.players[1].average);
    //       expect(foundPlayer?.lane).toBe(toReplace.players[1].lane);
    //       expect(foundPlayer?.position).toBe(toReplace.players[1].position);
    //     } else if (foundPlayer?.id === toReplace.players[2].id) {
    //       expect(foundPlayer?.first_name).toBe(toReplace.players[2].first_name);
    //       expect(foundPlayer?.last_name).toBe(toReplace.players[2].last_name);
    //       expect(foundPlayer?.average).toBe(toReplace.players[2].average);
    //       expect(foundPlayer?.lane).toBe(toReplace.players[2].lane);
    //       expect(foundPlayer?.position).toBe(toReplace.players[2].position);
    //     } else if (foundPlayer?.id === toReplace.players[3].id) {
    //       expect(foundPlayer?.first_name).toBe(toReplace.players[3].first_name);
    //       expect(foundPlayer?.last_name).toBe(toReplace.players[3].last_name);
    //       expect(foundPlayer?.average).toBe(toReplace.players[3].average);
    //       expect(foundPlayer?.lane).toBe(toReplace.players[3].lane);
    //       expect(foundPlayer?.position).toBe(toReplace.players[3].position);
    //     } else { 
    //       expect(false).toBe(true);
    //     }
    //   }
    //   const divEntries = await getAllDivEntriesForTmnt(toReplace.tmnt.id);
    //   expect(divEntries.length).toEqual(toReplace.divEntries.length);
    //   for (let i = 0; i < divEntries.length; i++) {
    //     const foundDivEntry = toReplace.divEntries.find(d => d.id === divEntries[i].id);
    //     expect(foundDivEntry).not.toBeUndefined();
    //     expect(foundDivEntry?.squad_id).toBe(toReplace.divEntries[i].squad_id);
    //     expect(foundDivEntry?.div_id).toBe(toReplace.divEntries[i].div_id);
    //     if (foundDivEntry?.id === toReplace.divEntries[0].id) {
    //       expect(foundDivEntry?.fee).toBe(toReplace.divEntries[0].fee);
    //       expect(foundDivEntry?.player_id).toBe(toReplace.divEntries[0].player_id);
    //     } else if (foundDivEntry?.id === toReplace.divEntries[1].id) {
    //       expect(foundDivEntry?.fee).toBe(toReplace.divEntries[1].fee);
    //       expect(foundDivEntry?.player_id).toBe(toReplace.divEntries[1].player_id);
    //     } else if (foundDivEntry?.id === toReplace.divEntries[2].id) {
    //       expect(foundDivEntry?.fee).toBe(toReplace.divEntries[2].fee);
    //       expect(foundDivEntry?.player_id).toBe(toReplace.divEntries[2].player_id);
    //     } else if (foundDivEntry?.id === toReplace.divEntries[3].id) {
    //       expect(foundDivEntry?.fee).toBe(toReplace.divEntries[3].fee);
    //       expect(foundDivEntry?.player_id).toBe(toReplace.divEntries[3].player_id);
    //     } else { 
    //       expect(false).toBe(true);
    //     }
    //   }
    //   const potEntries = await getAllPotEntriesForTmnt(toReplace.tmnt.id);
    //   expect(potEntries.length).toEqual(toReplace.potEntries.length);
    //   for (let i = 0; i < potEntries.length; i++) {
    //     const foundPotEntry = toReplace.potEntries.find(p => p.id === potEntries[i].id);
    //     expect(foundPotEntry).not.toBeUndefined();        
    //     expect(foundPotEntry?.pot_id).toBe(toReplace.potEntries[i].pot_id);
    //     if (foundPotEntry?.id === toReplace.potEntries[0].id) {
    //       expect(foundPotEntry?.fee).toBe(toReplace.potEntries[0].fee);
    //       expect(foundPotEntry?.player_id).toBe(toReplace.potEntries[0].player_id);
    //     } else if (foundPotEntry?.id === toReplace.potEntries[1].id) {
    //       expect(foundPotEntry?.fee).toBe(toReplace.potEntries[1].fee);
    //       expect(foundPotEntry?.player_id).toBe(toReplace.potEntries[1].player_id);
    //     } else if (foundPotEntry?.id === toReplace.potEntries[2].id) {
    //       expect(foundPotEntry?.fee).toBe(toReplace.potEntries[2].fee);
    //       expect(foundPotEntry?.player_id).toBe(toReplace.potEntries[2].player_id);
    //     } else if (foundPotEntry?.id === toReplace.potEntries[3].id) {
    //       expect(foundPotEntry?.fee).toBe(toReplace.potEntries[3].fee);
    //       expect(foundPotEntry?.player_id).toBe(toReplace.potEntries[3].player_id);
    //     } else {
    //       expect(false).toBe(true);
    //     }
    //   }
    //   const brktEntries = await getAllBrktEntriesForTmnt(toReplace.tmnt.id);
    //   expect(brktEntries.length).toEqual(toReplace.brktEntries.length);
    //   for (let i = 0; i < brktEntries.length; i++) {
    //     const foundBrktEntry = toReplace.brktEntries.find(b => b.id === brktEntries[i].id);
    //     expect(foundBrktEntry).not.toBeUndefined();
    //     if (foundBrktEntry?.id === toReplace.brktEntries[0].id) {
    //       expect(foundBrktEntry?.brkt_id).toBe(toReplace.brktEntries[0].brkt_id);
    //       expect(foundBrktEntry?.player_id).toBe(toReplace.brktEntries[0].player_id);
    //       expect(foundBrktEntry?.num_brackets).toBe(toReplace.brktEntries[0].num_brackets);
    //       expect(foundBrktEntry?.time_stamp).toBe(toReplace.brktEntries[0].time_stamp);
    //     } else if (foundBrktEntry?.id === toReplace.brktEntries[1].id) {
    //       expect(foundBrktEntry?.brkt_id).toBe(toReplace.brktEntries[1].brkt_id);
    //       expect(foundBrktEntry?.player_id).toBe(toReplace.brktEntries[1].player_id);
    //       expect(foundBrktEntry?.num_brackets).toBe(toReplace.brktEntries[1].num_brackets);
    //       expect(foundBrktEntry?.time_stamp).toBe(toReplace.brktEntries[1].time_stamp);
    //     } else if (foundBrktEntry?.id === toReplace.brktEntries[2].id) {
    //       expect(foundBrktEntry?.brkt_id).toBe(toReplace.brktEntries[2].brkt_id);
    //       expect(foundBrktEntry?.player_id).toBe(toReplace.brktEntries[2].player_id);
    //       expect(foundBrktEntry?.num_brackets).toBe(toReplace.brktEntries[2].num_brackets);
    //       expect(foundBrktEntry?.time_stamp).toBe(toReplace.brktEntries[2].time_stamp);
    //     } else if (foundBrktEntry?.id === toReplace.brktEntries[3].id) {
    //       expect(foundBrktEntry?.brkt_id).toBe(toReplace.brktEntries[3].brkt_id);
    //       expect(foundBrktEntry?.player_id).toBe(toReplace.brktEntries[3].player_id);
    //       expect(foundBrktEntry?.num_brackets).toBe(toReplace.brktEntries[3].num_brackets);
    //       expect(foundBrktEntry?.time_stamp).toBe(toReplace.brktEntries[3].time_stamp);
    //     } else { 
    //       expect(false).toBe(true);
    //     }
    //   }
    //   const oneBrkts = await getAllOneBrktsForTmnt(toReplace.tmnt.id);
    //   expect(oneBrkts.length).toEqual(toReplace.oneBrkts.length);
    //   for (let i = 0; i < oneBrkts.length; i++) {
    //     const foundOneBrkt = toReplace.oneBrkts.find(o => o.id === oneBrkts[i].id);
    //     expect(foundOneBrkt).not.toBeUndefined();
    //     if (foundOneBrkt?.id === toReplace.oneBrkts[0].id) {
    //       expect(foundOneBrkt?.brkt_id).toBe(toReplace.oneBrkts[0].brkt_id);
    //       expect(foundOneBrkt?.bindex).toBe(toReplace.oneBrkts[0].bindex);
    //     } else if (foundOneBrkt?.id === toReplace.oneBrkts[1].id) {
    //       expect(foundOneBrkt?.brkt_id).toBe(toReplace.oneBrkts[1].brkt_id);
    //       expect(foundOneBrkt?.bindex).toBe(toReplace.oneBrkts[1].bindex);
    //     } else { 
    //       expect(false).toBe(true);
    //     }
    //   }
    //   const brktSeeds = await getAllBrktSeedsForTmnt(toReplace.tmnt.id);
    //   expect(brktSeeds.length).toEqual(toReplace.brktSeeds.length);
    //   for (let i = 0; i < brktSeeds.length; i++) {
    //     const foundBrktSeed = toReplace.brktSeeds.find(b => b.one_brkt_id === brktSeeds[i].one_brkt_id && b.seed === brktSeeds[i].seed);
    //     expect(foundBrktSeed).not.toBeUndefined();
    //     if (foundBrktSeed?.one_brkt_id === toReplace.brktSeeds[0].one_brkt_id && foundBrktSeed?.seed === toReplace.brktSeeds[0].seed) {
    //       expect(foundBrktSeed?.player_id).toBe(toReplace.brktSeeds[0].player_id);
    //     } else if (foundBrktSeed?.one_brkt_id === toReplace.brktSeeds[1].one_brkt_id && foundBrktSeed?.seed === toReplace.brktSeeds[1].seed) {
    //       expect(foundBrktSeed?.player_id).toBe(toReplace.brktSeeds[1].player_id);
    //     } else if (foundBrktSeed?.one_brkt_id === toReplace.brktSeeds[2].one_brkt_id && foundBrktSeed?.seed === toReplace.brktSeeds[2].seed) {
    //       expect(foundBrktSeed?.player_id).toBe(toReplace.brktSeeds[2].player_id);
    //     } else if (foundBrktSeed?.one_brkt_id === toReplace.brktSeeds[3].one_brkt_id && foundBrktSeed?.seed === toReplace.brktSeeds[3].seed) {
    //       expect(foundBrktSeed?.player_id).toBe(toReplace.brktSeeds[3].player_id);
    //     } else if (foundBrktSeed?.one_brkt_id === toReplace.brktSeeds[4].one_brkt_id && foundBrktSeed?.seed === toReplace.brktSeeds[4].seed) {
    //       expect(foundBrktSeed?.player_id).toBe(toReplace.brktSeeds[4].player_id);
    //     } else if (foundBrktSeed?.one_brkt_id === toReplace.brktSeeds[5].one_brkt_id && foundBrktSeed?.seed === toReplace.brktSeeds[5].seed) {
    //       expect(foundBrktSeed?.player_id).toBe(toReplace.brktSeeds[5].player_id);
    //     } else if (foundBrktSeed?.one_brkt_id === toReplace.brktSeeds[6].one_brkt_id && foundBrktSeed?.seed === toReplace.brktSeeds[6].seed) {
    //       expect(foundBrktSeed?.player_id).toBe(toReplace.brktSeeds[6].player_id);
    //     } else if (foundBrktSeed?.one_brkt_id === toReplace.brktSeeds[7].one_brkt_id && foundBrktSeed?.seed === toReplace.brktSeeds[7].seed) {
    //       expect(foundBrktSeed?.player_id).toBe(toReplace.brktSeeds[7].player_id);
    //     } else { 
    //       expect(false).toBe(true);
    //     }
    //   }
    //   const elimEntries = await getAllElimEntriesForTmnt(toReplace.tmnt.id);
    //   expect(elimEntries.length).toEqual(toReplace.elimEntries.length);
    //   for (let i = 0; i < elimEntries.length; i++) {
    //     const foundElimEntry = toReplace.elimEntries.find(e => e.id === elimEntries[i].id);
    //     expect(foundElimEntry).not.toBeUndefined();
    //     if (foundElimEntry?.id === toReplace.elimEntries[0].id) {
    //       expect(foundElimEntry?.elim_id).toBe(toReplace.elimEntries[0].elim_id);
    //       expect(foundElimEntry?.player_id).toBe(toReplace.elimEntries[0].player_id);
    //       expect(foundElimEntry?.fee).toBe(toReplace.elimEntries[0].fee);
    //     } else if (foundElimEntry?.id === toReplace.elimEntries[1].id) {
    //       expect(foundElimEntry?.elim_id).toBe(toReplace.elimEntries[1].elim_id);
    //       expect(foundElimEntry?.player_id).toBe(toReplace.elimEntries[1].player_id);
    //       expect(foundElimEntry?.fee).toBe(toReplace.elimEntries[1].fee);
    //     } else if (foundElimEntry?.id === toReplace.elimEntries[2].id) {
    //       expect(foundElimEntry?.elim_id).toBe(toReplace.elimEntries[2].elim_id);
    //       expect(foundElimEntry?.player_id).toBe(toReplace.elimEntries[2].player_id);
    //       expect(foundElimEntry?.fee).toBe(toReplace.elimEntries[2].fee);
    //     } else if (foundElimEntry?.id === toReplace.elimEntries[3].id) {
    //       expect(foundElimEntry?.elim_id).toBe(toReplace.elimEntries[3].elim_id);
    //       expect(foundElimEntry?.player_id).toBe(toReplace.elimEntries[3].player_id);
    //       expect(foundElimEntry?.fee).toBe(toReplace.elimEntries[3].fee);
    //     } else {
    //       expect(false).toBe(true);
    //     }
    //   }
    // });
    // it('should replace a tmnt entries - no entries data', async () => {
    //   const toReplace = cloneDeep(mockTmntFullData);
    //   toReplace.brktEntries = [];
    //   toReplace.brktSeeds = [];
    //   toReplace.divEntries = [];
    //   toReplace.elimEntries = [];
    //   toReplace.oneBrkts = [];
    //   toReplace.potEntries = [];
    //   toReplace.players = [];

    //   const before = Date.now();

    //   const result = await replaceTmntEntriesData(toReplace);
    //   expect(result.success).toBe(true);
      
    //   const after = Date.now();
    //   const twoMinutes = 2 * 60 * 1000;
      
    //   expect(result.stage).not.toBeNull();
    //   const puttedStage = result.stage;
    //   const stageSetAtMs = new Date(puttedStage.stage_set_at).getTime();
    //   expect(puttedStage.id).toBe(toReplace.stage.id);
    //   expect(puttedStage.squad_id).toBe(toReplace.stage.squad_id);
    //   expect(puttedStage.stage).toBe(toReplace.stage.stage);
      
    //   expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
    //   expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);

    //   expect(puttedStage.stage_override_enabled).toBe(toReplace.stage.stage_override_enabled);
    //   expect(puttedStage.stage_override_at).toBe(toReplace.stage.stage_override_at);
    //   expect(puttedStage.stage_override_reason).toBe(toReplace.stage.stage_override_reason);

    //   expect(result.success).toBe(true);
    //   const playerResult = await getAllPlayersForTmnt(toReplace.tmnt.id);
    //   expect(playerResult.length).toEqual(toReplace.players.length);
    //   const divEntriesResult = await getAllDivEntriesForTmnt(toReplace.tmnt.id);
    //   expect(divEntriesResult.length).toEqual(toReplace.divEntries.length);
    //   const potEntriesResult = await getAllPotEntriesForTmnt(toReplace.tmnt.id);
    //   expect(potEntriesResult.length).toEqual(toReplace.potEntries.length);
    //   const brktEntriesResult = await getAllBrktEntriesForTmnt(toReplace.tmnt.id);
    //   expect(brktEntriesResult.length).toEqual(toReplace.brktEntries.length);
    //   const elimEntriesResult = await getAllElimEntriesForTmnt(toReplace.tmnt.id);
    //   expect(elimEntriesResult.length).toEqual(toReplace.elimEntries.length);
    //   const oneBrktsResult = await getAllOneBrktsForTmnt(toReplace.tmnt.id);
    //   expect(oneBrktsResult.length).toEqual(toReplace.oneBrkts.length);
    //   const brktSeedsResult = await getAllBrktSeedsForTmnt(toReplace.tmnt.id);
    //   expect(brktSeedsResult.length).toEqual(toReplace.brktSeeds.length);
    // });
    // it('should replace a tmnt entries - all entries data; stage = SCORES', async () => {
    //   await postMockTmntNoEntries();
    //   replacedTmnt = true;

    //   const toReplace = cloneDeep(mockTmntFullData);
    //   toReplace.stage.stage = SquadStage.SCORES;

    //   const before = Date.now();

    //   const result = await replaceTmntEntriesData(toReplace);

    //   const after = Date.now();
    //   const twoMinutes = 2 * 60 * 1000;

    //   expect(result.success).toBe(true);
    //   expect(result.stage).not.toBeNull();

    //   const puttedStage = result.stage;
    //   const stageSetAtMs = new Date(puttedStage.stage_set_at).getTime();
    //   const scoresSetAtMs = new Date(puttedStage.scores_started_at!).getTime();
      
    //   expect(puttedStage.scores_started_at).not.toBeNull();
    //   expect(puttedStage.id).toBe(toReplace.stage.id);
    //   expect(puttedStage.squad_id).toBe(toReplace.stage.squad_id);
    //   expect(puttedStage.stage).toBe(toReplace.stage.stage);
      
    //   expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
    //   expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);
    //   expect(scoresSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
    //   expect(scoresSetAtMs).toBeLessThanOrEqual(after + twoMinutes);

    //   expect(puttedStage.stage_override_enabled).toBe(toReplace.stage.stage_override_enabled);
    //   expect(puttedStage.stage_override_at).toBe(toReplace.stage.stage_override_at);
    //   expect(puttedStage.stage_override_reason).toBe(toReplace.stage.stage_override_reason);
    // });
    it('should replace a tmnt entries - all entries dat; stage = ENTRIES and stage_override_enabled = true', async () => {
      await postMockTmntNoEntries();
      replacedTmnt = true;

      const toReplace = cloneDeep(mockTmntFullData);
      toReplace.stage.stage = SquadStage.ENTRIES;
      toReplace.stage.stage_override_enabled = true;
      toReplace.stage.stage_override_reason = 'override reason';

      const before = Date.now();

      const result = await replaceTmntEntriesData(toReplace);

      const after = Date.now();
      const twoMinutes = 2 * 60 * 1000;

      expect(result.success).toBe(true);
      expect(result.stage).not.toBeNull();

      const puttedStage = result.stage;
      const stageSetAtMs = new Date(puttedStage.stage_set_at).getTime();
      const overrideSetAtMs = new Date(puttedStage.stage_override_at!).getTime();

      expect(puttedStage.id).toBe(toReplace.stage.id);
      expect(puttedStage.squad_id).toBe(toReplace.stage.squad_id);
      expect(puttedStage.stage).toBe(toReplace.stage.stage);
      
      expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);
      expect(overrideSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(overrideSetAtMs).toBeLessThanOrEqual(after + twoMinutes);

      expect(puttedStage.stage_override_enabled).toBe(toReplace.stage.stage_override_enabled);
      expect(puttedStage.stage_override_reason).toBe(toReplace.stage.stage_override_reason);
    });
    // it('should throw error when post tmnt entries - tmnt not in database', async () => {
    //   try {
    //     const notInDbTmnt = cloneDeep(mockTmntFullData);
    //     notInDbTmnt.tmnt.id = 'tmt_00000000000000000000000000000000';                              
    //     // parent table, child tables not in database for grandchild tables
    //     const result = await replaceTmntEntriesData(mockTmntFullData)
    //   } catch (err) {
    //     expect(err).toBeInstanceOf(Error);
    //     expect((err as Error).message).toBe("replaceTmntFullEntriesData failed: Request failed with status code 409");
    //   }
    // });
    // it('replaces a full tmnt - tmnt in database', async () => {
    //   const result = await replaceTmntFullData(mockTmntFullData) // create tmnt full data
    //   expect(result).toBe(true);
    //   replacedTmnt = true;

    //   const tmntEntries = cloneDeep(mockTmntFullData);
    //   // values that will not update
    //   tmntEntries.tmnt.tmnt_name = 'DoNotUpdate';
    //   tmntEntries.events[0].event_name = 'DoNotUpdate';
    //   tmntEntries.divs[0].div_name = 'DoNotUpdate';
    //   tmntEntries.squads[0].squad_name = 'DoNotUpdate';
    //   tmntEntries.lanes[0].lane_number = 100;
    //   tmntEntries.pots[0].pot_type = 'Series';
    //   tmntEntries.brkts[0].start = 2;
    //   tmntEntries.elims[0].start = 2;
    //   // values that will update
    //   tmntEntries.players[0].first_name = 'Updated';
    //   tmntEntries.players[0].last_name = 'ThisToo';
    //   tmntEntries.players.push(
    //     {
    //       ...initPlayer,
    //       id: playerId5,
    //       squad_id: tmntEntries.squads[0].id,
    //       first_name: 'New',
    //       last_name: 'Player',
    //       average: 199,
    //       lane: 29,
    //       position: 'Z',
    //     }
    //   )
    //   tmntEntries.divEntries[0].fee = '100';        
    //   tmntEntries.potEntries[0].player_id = playerId5;
    //   tmntEntries.brktEntries[0].num_brackets = 100;      
    //   tmntEntries.oneBrkts[0].bindex = 7;
    //   tmntEntries.brktSeeds[0].seed = 7;
    //   tmntEntries.elimEntries[0].player_id = playerId5;

    //   const before = Date.now();

    //   const result2 = await replaceTmntEntriesData(tmntEntries);
    //   expect(result2.success).toBe(true);

    //   const after = Date.now();
    //   const twoMinutes = 2 * 60 * 1000;
      
    //   expect(result2.stage).not.toBeNull();
    //   const puttedStage = result2.stage;
    //   const stageSetAtMs = new Date(puttedStage.stage_set_at).getTime();
    //   expect(puttedStage.id).toBe(tmntEntries.stage.id);
    //   expect(puttedStage.squad_id).toBe(tmntEntries.stage.squad_id);
    //   expect(puttedStage.stage).toBe(tmntEntries.stage.stage);
      
    //   expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
    //   expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);

    //   expect(puttedStage.stage_override_enabled).toBe(tmntEntries.stage.stage_override_enabled);
    //   expect(puttedStage.stage_override_at).toBe(tmntEntries.stage.stage_override_at);
    //   expect(puttedStage.stage_override_reason).toBe(tmntEntries.stage.stage_override_reason);

    //   const postedEntries = await getTmntFullData(tmntEntries.tmnt.id);
    //   // non updated values
    //   expect(postedEntries.tmnt.tmnt_name).toBe(mockTmntFullData.tmnt.tmnt_name);
    //   expect(postedEntries.events[0].event_name).toBe(mockTmntFullData.events[0].event_name);
    //   for (let i = 0; i < postedEntries.divs.length; i++) {
    //     if (postedEntries.divs[i].id === mockTmntFullData.divs[0].id) {
    //       expect(postedEntries.divs[i].div_name).toBe(mockTmntFullData.divs[0].div_name);
    //     }
    //   }
    //   expect(postedEntries.squads[0].squad_name).toBe(mockTmntFullData.squads[0].squad_name);
    //   for (let i = 0; i < postedEntries.lanes.length; i++) {
    //     if (postedEntries.lanes[i].id === mockTmntFullData.lanes[0].id) {
    //       expect(postedEntries.lanes[i].lane_number).toBe(mockTmntFullData.lanes[0].lane_number);
    //     }
    //   }
    //   for (let i = 0; i < postedEntries.pots.length; i++) {
    //     if (postedEntries.pots[i].id === mockTmntFullData.pots[0].id) {
    //       expect(postedEntries.pots[i].pot_type).toBe(mockTmntFullData.pots[0].pot_type);
    //     }
    //   }
    //   for (let i = 0; i < postedEntries.brkts.length; i++) {
    //     if (postedEntries.brkts[i].id === mockTmntFullData.brkts[0].id) {
    //       expect(postedEntries.brkts[i].start).toBe(mockTmntFullData.brkts[0].start);
    //     }
    //   }
    //   for (let i = 0; i < postedEntries.elims.length; i++) {
    //     if (postedEntries.elims[i].id === mockTmntFullData.elims[0].id) {
    //       expect(postedEntries.elims[i].start).toBe(mockTmntFullData.elims[0].start);
    //     }
    //   }      
    //   // updated values
    //   for (let i = 0; i < postedEntries.players.length; i++) {
    //     if (postedEntries.players[i].id === tmntEntries.players[0].id) {
    //       expect(postedEntries.players[i].first_name).toBe('Updated');
    //       expect(postedEntries.players[i].last_name).toBe('ThisToo');          
    //     }
    //   }
    //   for (let i = 0; i < postedEntries.divEntries.length; i++) {
    //     if (postedEntries.divEntries[i].id === tmntEntries.divEntries[0].id) {
    //       expect(postedEntries.divEntries[i].fee).toBe('100')
    //     }
    //   }
    //   for (let i = 0; i < postedEntries.potEntries.length; i++) {
    //     if (postedEntries.potEntries[i].id === tmntEntries.potEntries[0].id) {          
    //       expect(postedEntries.potEntries[i].player_id).toBe(playerId5);
    //     }
    //   }
    //   for (let i = 0; i < postedEntries.brktEntries.length; i++) {
    //     if (postedEntries.brktEntries[i].id === tmntEntries.brktEntries[0].id) {
    //       expect(postedEntries.brktEntries[i].num_brackets).toBe(100);
    //     }
    //   }
    //   for (let i = 0; i < postedEntries.oneBrkts.length; i++) {
    //     if (postedEntries.oneBrkts[i].id === tmntEntries.oneBrkts[0].id) {
    //       expect(postedEntries.oneBrkts[i].bindex).toBe(7);
    //     }
    //   }
    //   for (let i = 0; i < postedEntries.brktSeeds.length; i++) {
    //     if (postedEntries.brktSeeds[i].seed === 7) {
    //       expect(postedEntries.brktSeeds[i].player_id).toBe(tmntEntries.brktSeeds[0].player_id);
    //     }
    //   }
    //   for (let i = 0; i < postedEntries.elimEntries.length; i++) {
    //     if (postedEntries.elimEntries[i].player_id === tmntEntries.elimEntries[0].player_id) {
    //       expect(postedEntries.elimEntries[i].player_id).toBe(playerId5);
    //     }
    //   }
    // });
    // it("should throw error when post tmnt entries if invalid tmnt id", async () => {
    //   try {
    //     const invalidTmnt = cloneDeep(mockTmntFullData);
    //     invalidTmnt.divEntries[0].id = "invalid id";
    //     await replaceTmntEntriesData(invalidTmnt);
    //   } catch (err) {
    //     expect(err).toBeInstanceOf(Error);
    //     expect((err as Error).message).toBe("divEntries has missing data at index 0");
    //   }
    // });
    // it("should throw error when post tmnt entries if got invalid data", async () => {
    //   try {
    //     const invalidTmnt = cloneDeep(mockTmntFullData);
    //     invalidTmnt.players[0].first_name = "";
    //     await replaceTmntEntriesData(invalidTmnt);
    //   } catch (err) {
    //     expect(err).toBeInstanceOf(Error);
    //     expect((err as Error).message).toBe('players has missing data at index 0');
    //   }
    // });
    // it("should throw error when post tmnt entries if passed null", async () => {
    //   try {
    //     await replaceTmntEntriesData(null as any);
    //   } catch (err) {
    //     expect(err).toBeInstanceOf(Error);
    //     expect((err as Error).message).toBe("invalid tmntFullData data");
    //   }
    // });
    // it("should throw error when post tmnt entries if passed non object", async () => {
    //   try {
    //     await replaceTmntEntriesData("test" as any);
    //   } catch (err) {
    //     expect(err).toBeInstanceOf(Error);
    //     expect((err as Error).message).toBe("invalid tmntFullData data");
    //   }
    // });
    // it("should throw error when post tmnt entries if squad is empty", async () => {
    //   try {
    //     const invalidTmnt = cloneDeep(mockTmntFullData);
    //     invalidTmnt.squads = [];
    //     await replaceTmntEntriesData(invalidTmnt);
    //   } catch (err) {
    //     expect(err).toBeInstanceOf(Error);
    //     expect((err as Error).message).toBe("no squads data");
    //   }
    // });
    // it("should throw error when post tmnt entries if squad is invalid", async () => {
    //   try {
    //     const invalidTmnt = cloneDeep(mockTmntFullData);
    //     invalidTmnt.squads[0].id = "invalid id";
    //     await replaceTmntEntriesData(invalidTmnt);
    //   } catch (err) {
    //     expect(err).toBeInstanceOf(Error);
    //     expect((err as Error).message).toBe("squads has missing data at index 0");
    //   }
    // });
  })

  describe("postTmnt", () => {
    const tmntToPost = {
      ...initTmnt,
      user_id: userId,
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
            url: tmntUrl + toDel.id,
          });
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    };

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
    it("should throw error when post a tmnt if invalid tmnt id", async () => {
      try {
        const invalidTmnt = cloneDeep(tmntToPost);
        invalidTmnt.id = "invalid id";
        await postTmnt(invalidTmnt);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt data");
      }
    });
    it("should throw error when post a tmnt if got invalid data", async () => {
      try {
        const invalidTmnt = cloneDeep(tmntToPost);
        invalidTmnt.tmnt_name = " ";
        await postTmnt(invalidTmnt);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "postTmnt failed: Request failed with status code 422"
        );
      }
    });
    it("should throw error when post a tmnt if passed null", async () => {
      try {
        await postTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt data");
      }
    });
    it("should throw error when post a tmnt if passed non object", async () => {
      try {
        await postTmnt("test" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt data");
      }
    });
  });

  describe("putTmnt", () => {
    const tmntToPut = {
      ...initTmnt,
      id: "tmt_fd99387c33d9c78aba290286576ddce5",
      user_id: userId,
      tmnt_name: "Test Tournament",
      bowl_id: "bwl_8b4a5c35ad1247049532ff53a12def0a",
      start_date_str: todayStr,
      end_date_str: todayStr,
    };

    const putUrl = tmntUrl + tmntToPut.id;

    const resetTmnt = {
      ...initTmnt,
      id: "tmt_fd99387c33d9c78aba290286576ddce5",
      user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
      tmnt_name: "Gold Pin",
      bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
      start_date_str: "2022-10-23",
      end_date_str: "2022-10-23",
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
    it("should thorw error when trying to put a tmnt when passed an invalid tmnt id", async () => {
      try {
        const invalidTmnt = cloneDeep(tmntToPut);
        invalidTmnt.id = "test";
        await putTmnt(invalidTmnt);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt data");
      }
    });
    it("should throw error when trying to put a tmnt with invalid data", async () => {
      try {
        const invalidTmnt = cloneDeep(tmntToPut);
        invalidTmnt.tmnt_name = "";
        await putTmnt(invalidTmnt);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "putTmnt failed: Request failed with status code 422"
        );
      }
    });
    it("should thorw error when trying to put a tmnt when passed null", async () => {
      try {
        await putTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt data");
      }
    });
    it("should thorw error when trying to put a tmnt when passed non object", async () => {
      try {
        await putTmnt("test" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt data");
      }
    });
  });

  describe("deleteTmnt", () => {
    // toDel is data from prisma/seeds.ts
    const toDel = {
      ...initTmnt,
      id: "tmt_e134ac14c5234d708d26037ae812ac33",
      user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
      tmnt_name: "Gold Pin",
      bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
      start_date_str: "2026-08-19",
      end_date_str: "2026-08-19",
    };

    const rePostToDel = async () => {
      const response = await axios.get(url);
      const tmnts = response.data.tmnts;
      const foundToDel = tmnts.find((t: tmntType) => t.id === toDel.id);
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
    };

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

    it("should delete a tmnt by ID", async () => {
      const deletedTmnt = await deleteTmnt(toDel.id);
      expect(deletedTmnt).toBe(1);
      didDel = true;
    });
    it("should throw error when trying to delete a tmnt when id is not found", async () => {
      try {
        await deleteTmnt(notFoundId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "deleteTmnt failed: Request failed with status code 404"
        );
      }
    });
    it("should throw error when trying to delete a tmnt when id is invalid", async () => {
      try {
        await deleteTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error when trying to delete a tmnt when id is valid, but not a tmnt id", async () => {
      try {
        await deleteTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error when trying to delete a tmnt when id is null", async () => {
      try {
        await deleteTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });

});
