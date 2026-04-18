import { AxiosError } from "axios";
import { publicApi, privateApi } from "@/lib/api/axios";
import { baseSquadsApi } from "@/lib/api/apiPaths";
import { testBaseSquadsApi } from "../../../testApi";
import type { squadType } from "@/lib/types/types";
import { initSquad } from "@/lib/db/initVals";
import {
  deleteSquad,
  getAllSquadsForTmnt,
  getAllOneBrktsAndSeedsForSquad,
  postSquad,
  putSquad,
  extractSquads,
} from "@/lib/db/squads/dbSquads";
import { startOfDayFromString } from "@/lib/dateTools";
import { mockCurData } from "../../../mocks/tmnts/playerEntries/mockOneSquadEntries";
import { cloneDeep } from "lodash";

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
const url = process.env.NODE_ENV === "test" && testBaseSquadsApi
  ? testBaseSquadsApi
  : baseSquadsApi;

const squadUrl = url + "/squad/";

const normalizeApiPath = (path: string): string => {
  if (path.startsWith("/api/")) return path.slice(4);
  if (path === "/api") return "";
  return path;
};

const apiUrl = normalizeApiPath(url);
const apiSquadUrl = normalizeApiPath(squadUrl);

const notFoundTmntId = "tmt_00000000000000000000000000000000";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const obsSquadId = "sqd_7116ce5f80164830830a7157eb093396";
const goldPinOneBrktId1 = "obk_557f12f3875f42baa29fdbd22ee7f2f4";
const goldPinOneBrktId2 = "obk_5423c16d58a948748f32c7c72c632297";
const goldPinOneBrktId3 = "obk_8d500123a07d46f9bb23db61e74ffc1b";
const goldPinOneBrktId4 = "obk_4ba9e037c86e494eb272efcd989dc9d0";

const eventId = "evt_cb97b73cb538418ab993fc867f860510";
const userId = "usr_01234567890123456789012345678901";

const squadToReset = {
  ...initSquad,
  id: obsSquadId,
  event_id: eventId,
  squad_name: "Squad 1",
  squad_date: startOfDayFromString("2022-10-23") as Date,
  squad_date_str: "2022-10-23",
  squad_time: null,
  games: 6,
  lane_count: 12,
  starting_lane: 29,
  sort_order: 1,
};

const resetSquad = async (squad: squadType) => {
  try {
    const squadJSON = JSON.stringify(squad);
    await privateApi.put(apiSquadUrl + squad.id, squadJSON);
  } catch (err) {
    if (err instanceof AxiosError) console.log(err.message);
  }
};

describe("dbSquads", () => {
  const rePostSquad = async (squad: squadType) => {
    try {
      const getResponse = await publicApi.get(apiSquadUrl + squad.id);
      const found = getResponse.data?.squad;
      if (found) return;
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.status !== 404) {
          console.log(err.message);
          return;
        }
      }
    }

    try {
      const squadJSON = JSON.stringify(squad);
      await privateApi.post(apiUrl, squadJSON);
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  describe("extractSquads()", () => {
    it("should return an empty array when given an empty array", () => {
      const squads = extractSquads([]);
      expect(squads).toEqual([]);
    });

    it("should correctly extract squads when given array of squads", () => {
      const rawSquads = [
        {
          id: "sqd_123",
          event_id: "evt_123",
          squad_name: "A Squad",
          squad_date: "2022-08-21T07:00:00.000Z",
          squad_time: "10:00 AM",
          games: 6,
          lane_count: 10,
          starting_lane: 1,
          sort_order: 1,
          extraField: "ignore me",
        },
      ];

      const result = extractSquads(rawSquads);

      const expectedSquad: squadType = {
        ...initSquad,
        id: "sqd_123",
        event_id: "evt_123",
        squad_name: "A Squad",
        tab_title: "A Squad",
        squad_date_str: "2022-08-21",
        squad_time: "10:00 AM",
        games: 6,
        lane_count: 10,
        starting_lane: 1,
        sort_order: 1,
      };

      expect(result).toEqual([expectedSquad]);
    });

    it("should process multiple squads correctly", () => {
      const rawSquads = [
        {
          id: "sqd_123",
          event_id: "evt_123",
          squad_name: "A Squad",
          squad_date: "2022-08-21T07:00:00.000Z",
          squad_time: "10:00 AM",
          games: 6,
          lane_count: 10,
          starting_lane: 1,
          sort_order: 1,
          extraField: "ignore me",
        },
        {
          id: "sqd_456",
          event_id: "evt_123",
          squad_name: "B Squad",
          squad_date: "2022-08-21T07:00:00.000Z",
          squad_time: "11:00 AM",
          games: 6,
          lane_count: 10,
          starting_lane: 1,
          sort_order: 2,
          extraField: "ignore me",
        },
      ];

      const result = extractSquads(rawSquads);

      expect(result).toHaveLength(2);

      expect(result[0].id).toBe("sqd_123");
      expect(result[0].squad_name).toBe("A Squad");
      expect(result[0].squad_time).toBe("10:00 AM");
      expect(result[0].sort_order).toBe(1);

      expect(result[1].id).toBe("sqd_456");
      expect(result[1].squad_name).toBe("B Squad");
      expect(result[1].squad_time).toBe("11:00 AM");
      expect(result[1].sort_order).toBe(2);
    });

    it("should return an empty array when given null", () => {
      const result = extractSquads(null);
      expect(result).toEqual([]);
    });

    it("should return an empty array when given a non-array", () => {
      const result = extractSquads("not an array");
      expect(result).toEqual([]);
    });
  });

  describe("getAllSquadsForTmnt", () => {
    const tmntId = "tmt_d9b1af944d4941f65b2d2d4ac160cdea";

    const squadsToGet: squadType[] = [
      {
        ...initSquad,
        id: "sqd_42be0f9d527e4081972ce8877190489d",
        event_id: "evt_06055deb80674bd592a357a4716d8ef2",
        squad_name: "A Squad",
        squad_date_str: "2022-08-21",
        squad_time: "10:00 AM",
        games: 6,
        lane_count: 10,
        starting_lane: 1,
        sort_order: 1,
      },
      {
        ...initSquad,
        id: "sqd_796c768572574019a6fa79b3b1c8fa57",
        event_id: "evt_06055deb80674bd592a357a4716d8ef2",
        squad_name: "B Squad",
        squad_date_str: "2022-08-21",
        squad_time: "02:00 PM",
        games: 6,
        lane_count: 10,
        starting_lane: 1,
        sort_order: 2,
      },
      {
        ...initSquad,
        id: "sqd_1234ec18b3d44c0189c83f6ac5fd4ad6",
        event_id: "evt_06055deb80674bd592a357a4716d8ef2",
        squad_name: "C Squad",
        squad_date_str: "2022-08-21",
        squad_time: "04:30 PM",
        games: 3,
        lane_count: 24,
        starting_lane: 1,
        sort_order: 3,
      },
    ];

    it("gets all squads for tmnt", async () => {
      const squads = await getAllSquadsForTmnt(tmntId);

      expect(squads).toHaveLength(squadsToGet.length);

      for (let i = 0; i < squads.length; i++) {
        expect(squads[i].id).toBe(squadsToGet[i].id);
        expect(squads[i].event_id).toBe(squadsToGet[i].event_id);
        expect(squads[i].squad_name).toBe(squadsToGet[i].squad_name);
        expect(squads[i].squad_date_str).toBe(squadsToGet[i].squad_date_str);
        expect(squads[i].squad_time).toBe(squadsToGet[i].squad_time);
        expect(squads[i].games).toBe(squadsToGet[i].games);
        expect(squads[i].starting_lane).toBe(squadsToGet[i].starting_lane);
        expect(squads[i].lane_count).toBe(squadsToGet[i].lane_count);
        expect(squads[i].sort_order).toBe(squadsToGet[i].sort_order);
      }
    });

    it("should return 0 squads for not found tmnt", async () => {
      const squads = await getAllSquadsForTmnt(notFoundTmntId);
      expect(squads).toHaveLength(0);
    });

    it("should throw error if tmnt id is invalid", async () => {
      await expect(getAllSquadsForTmnt("test")).rejects.toThrow("Invalid tmnt id");
    });

    it("should throw error if tmnt id is valid, but not a tmnt id", async () => {
      await expect(getAllSquadsForTmnt(userId)).rejects.toThrow("Invalid tmnt id");
    });

    it("should throw error if tmnt id is null", async () => {
      await expect(getAllSquadsForTmnt(null as any)).rejects.toThrow("Invalid tmnt id");
    });
  });

  describe("getAllOneBrktsAndSeedsForSquad", () => {
    it("should get all brackets and seeds for a squad", async () => {
      const oneBrktsAndSeeds = await getAllOneBrktsAndSeedsForSquad(
        mockCurData.squads[0].id
      );
      expect(oneBrktsAndSeeds).not.toBeNull();
      expect(oneBrktsAndSeeds).toHaveLength(3);
    });

    it("should get all brackets and seeds for a squad (2 seperate brackets)", async () => {
      const oneBrktsAndSeeds = await getAllOneBrktsAndSeedsForSquad(obsSquadId);

      expect(oneBrktsAndSeeds).not.toBeNull();
      expect(oneBrktsAndSeeds).toHaveLength(32);

      expect(oneBrktsAndSeeds[0].one_brkt_id).toBe(goldPinOneBrktId1);
      expect(oneBrktsAndSeeds[0].seed).toBe(0);
      expect(oneBrktsAndSeeds[1].one_brkt_id).toBe(goldPinOneBrktId1);
      expect(oneBrktsAndSeeds[1].seed).toBe(1);
      expect(oneBrktsAndSeeds[6].one_brkt_id).toBe(goldPinOneBrktId1);
      expect(oneBrktsAndSeeds[6].seed).toBe(6);
      expect(oneBrktsAndSeeds[7].one_brkt_id).toBe(goldPinOneBrktId1);
      expect(oneBrktsAndSeeds[7].seed).toBe(7);

      expect(oneBrktsAndSeeds[8].one_brkt_id).toBe(goldPinOneBrktId2);
      expect(oneBrktsAndSeeds[8].seed).toBe(0);
      expect(oneBrktsAndSeeds[9].one_brkt_id).toBe(goldPinOneBrktId2);
      expect(oneBrktsAndSeeds[9].seed).toBe(1);
      expect(oneBrktsAndSeeds[14].one_brkt_id).toBe(goldPinOneBrktId2);
      expect(oneBrktsAndSeeds[14].seed).toBe(6);
      expect(oneBrktsAndSeeds[15].one_brkt_id).toBe(goldPinOneBrktId2);
      expect(oneBrktsAndSeeds[15].seed).toBe(7);

      expect(oneBrktsAndSeeds[16].one_brkt_id).toBe(goldPinOneBrktId3);
      expect(oneBrktsAndSeeds[16].seed).toBe(0);
      expect(oneBrktsAndSeeds[17].one_brkt_id).toBe(goldPinOneBrktId3);
      expect(oneBrktsAndSeeds[17].seed).toBe(1);
      expect(oneBrktsAndSeeds[22].one_brkt_id).toBe(goldPinOneBrktId3);
      expect(oneBrktsAndSeeds[22].seed).toBe(6);
      expect(oneBrktsAndSeeds[23].one_brkt_id).toBe(goldPinOneBrktId3);
      expect(oneBrktsAndSeeds[23].seed).toBe(7);

      expect(oneBrktsAndSeeds[24].one_brkt_id).toBe(goldPinOneBrktId4);
      expect(oneBrktsAndSeeds[24].seed).toBe(0);
      expect(oneBrktsAndSeeds[25].one_brkt_id).toBe(goldPinOneBrktId4);
      expect(oneBrktsAndSeeds[25].seed).toBe(1);
      expect(oneBrktsAndSeeds[30].one_brkt_id).toBe(goldPinOneBrktId4);
      expect(oneBrktsAndSeeds[30].seed).toBe(6);
      expect(oneBrktsAndSeeds[31].one_brkt_id).toBe(goldPinOneBrktId4);
      expect(oneBrktsAndSeeds[31].seed).toBe(7);
    });

    it("should return empty array if no brackets or seeds for squad", async () => {
      const oneBrktsAndSeeds = await getAllOneBrktsAndSeedsForSquad(notFoundSquadId);
      expect(oneBrktsAndSeeds).not.toBeNull();
      expect(oneBrktsAndSeeds).toHaveLength(0);
    });

    it("should throw error when squad id is invalid", async () => {
      await expect(getAllOneBrktsAndSeedsForSquad("test")).rejects.toThrow(
        "Invalid squad id"
      );
    });

    it("should throw error when squad id is valid, noy not a squad id", async () => {
      await expect(getAllOneBrktsAndSeedsForSquad(userId)).rejects.toThrow(
        "Invalid squad id"
      );
    });

    it("should throw error when squad id is null", async () => {
      await expect(getAllOneBrktsAndSeedsForSquad(null as any)).rejects.toThrow(
        "Invalid squad id"
      );
    });
  });

  describe("postSquad", () => {
    const squadToPost = {
      ...initSquad,
      squad_name: "Test Squad",
      event_id: "evt_c0b2bb31d647414a9bea003bd835f3a0",
      squad_date: startOfDayFromString("2022-08-21") as Date,
      squad_date_str: "2022-08-21",
      squad_time: "02:00 PM",
      games: 6,
      lane_count: 24,
      starting_lane: 99,
      sort_order: 1,
    };

    let createdSquad = false;

    const deletePostedSquad = async () => {
      const response = await publicApi.get(apiUrl);
      const squads = response.data?.squads ?? [];
      const toDel = squads.find((s: squadType) => s.starting_lane === 99);

      if (toDel) {
        try {
          await privateApi.delete(apiSquadUrl + toDel.id);
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    };

    beforeAll(async () => {
      await deletePostedSquad();
    });

    beforeEach(() => {
      createdSquad = false;
    });

    afterEach(async () => {
      if (createdSquad) {
        await deletePostedSquad();
      }
    });

    it("should post a squad", async () => {
      const postedSquad = await postSquad(squadToPost);
      expect(postedSquad).not.toBeNull();

      createdSquad = true;

      expect(postedSquad.id).toBe(squadToPost.id);
      expect(postedSquad.squad_name).toBe(squadToPost.squad_name);
      expect(postedSquad.event_id).toBe(squadToPost.event_id);
      expect(postedSquad.squad_date_str).toBe(squadToPost.squad_date_str);
      expect(postedSquad.squad_time).toBe(squadToPost.squad_time);
      expect(postedSquad.games).toBe(squadToPost.games);
      expect(postedSquad.lane_count).toBe(squadToPost.lane_count);
      expect(postedSquad.starting_lane).toBe(squadToPost.starting_lane);
      expect(postedSquad.sort_order).toBe(squadToPost.sort_order);
    });

    it("should post a sanitzed squad", async () => {
      const toSanitize = cloneDeep(squadToPost);
      toSanitize.squad_name = "<script>S</script>";

      const postedSquad = await postSquad(toSanitize);
      expect(postedSquad).not.toBeNull();

      createdSquad = true;

      expect(postedSquad.id).toBe(squadToPost.id);
      expect(postedSquad.squad_name).toBe("scriptSscript");
      expect(postedSquad.event_id).toBe(squadToPost.event_id);
      expect(postedSquad.squad_date_str).toBe(squadToPost.squad_date_str);
      expect(postedSquad.squad_time).toBe(squadToPost.squad_time);
      expect(postedSquad.games).toBe(squadToPost.games);
      expect(postedSquad.lane_count).toBe(squadToPost.lane_count);
      expect(postedSquad.starting_lane).toBe(squadToPost.starting_lane);
      expect(postedSquad.sort_order).toBe(squadToPost.sort_order);
    });

    it("should throw error and not post a squad with invalid data", async () => {
      const invalidSquad = cloneDeep(squadToPost);
      invalidSquad.squad_name = "";

      await expect(postSquad(invalidSquad)).rejects.toThrow(
        "postSquad failed: Request failed with status code 422"
      );
    });

    it("should throw error and not post a squad with null", async () => {
      await expect(postSquad(null as any)).rejects.toThrow("Invalid squad data");
    });

    it("should throw error and not post a squad with not an object", async () => {
      await expect(postSquad("test" as any)).rejects.toThrow("Invalid squad data");
    });
  });

  describe("putSquad", () => {
    const squadToPut = {
      ...initSquad,
      id: obsSquadId,
      event_id: eventId,
      squad_name: "Test Squad",
      squad_date: startOfDayFromString("2022-11-23") as Date,
      squad_date_str: "2022-11-23",
      squad_time: "02:00 PM",
      games: 5,
      lane_count: 14,
      starting_lane: 29,
      sort_order: 1,
    };

    let didPut = false;

    beforeAll(async () => {
      await resetSquad(squadToReset);
    });

    beforeEach(() => {
      didPut = false;
    });

    afterEach(async () => {
      if (!didPut) return;
      await resetSquad(squadToReset);
    });

    it("should put a squad", async () => {
      const puttedSquad = await putSquad(squadToPut);
      expect(puttedSquad).not.toBeNull();

      didPut = true;

      expect(puttedSquad.id).toEqual(squadToPut.id);
      expect(puttedSquad.event_id).toEqual(squadToPut.event_id);
      expect(puttedSquad.squad_name).toEqual(squadToPut.squad_name);
      expect(puttedSquad.squad_date_str).toEqual(squadToPut.squad_date_str);
      expect(puttedSquad.squad_time).toEqual(squadToPut.squad_time);
      expect(puttedSquad.games).toEqual(squadToPut.games);
      expect(puttedSquad.lane_count).toEqual(squadToPut.lane_count);
      expect(puttedSquad.starting_lane).toEqual(squadToPut.starting_lane);
      expect(puttedSquad.sort_order).toEqual(squadToPut.sort_order);
    });

    it("should put a sanitizedsquad", async () => {
      const toSanitize = cloneDeep(squadToPut);
      toSanitize.squad_name = "  ***  Testing  ***  ";

      const puttedSquad = await putSquad(toSanitize);
      expect(puttedSquad).not.toBeNull();

      didPut = true;

      expect(puttedSquad.id).toEqual(toSanitize.id);
      expect(puttedSquad.event_id).toEqual(toSanitize.event_id);
      expect(puttedSquad.squad_name).toEqual("Testing");
      expect(puttedSquad.squad_date_str).toEqual(toSanitize.squad_date_str);
      expect(puttedSquad.squad_time).toEqual(toSanitize.squad_time);
      expect(puttedSquad.games).toEqual(toSanitize.games);
      expect(puttedSquad.lane_count).toEqual(toSanitize.lane_count);
      expect(puttedSquad.starting_lane).toEqual(toSanitize.starting_lane);
      expect(puttedSquad.sort_order).toEqual(toSanitize.sort_order);
    });

    it("should thorw error when trying to put a squad with invalid squad id", async () => {
      const invalidSquad = cloneDeep(squadToPut);
      invalidSquad.id = "test";

      await expect(putSquad(invalidSquad)).rejects.toThrow("Invalid squad data");
    });

    it("should thorw error when trying to put a squad with invalid data", async () => {
      const invalidSquad = cloneDeep(squadToPut);
      invalidSquad.lane_count = 1234567890;

      await expect(putSquad(invalidSquad)).rejects.toThrow(
        "putSquad failed: Request failed with status code 422"
      );
    });

    it("should thorw error when trying to put a squad when passed null", async () => {
      await expect(putSquad(null as any)).rejects.toThrow("Invalid squad data");
    });

    it("should thorw error when trying to put a squad when passed non object", async () => {
      await expect(putSquad("test" as any)).rejects.toThrow("Invalid squad data");
    });
  });

  describe("deleteSquad", () => {
    const toDel = {
      ...initSquad,
      id: "sqd_3397da1adc014cf58c44e07c19914f72",
      event_id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
      squad_name: "Squad 3",
      squad_date: startOfDayFromString("2023-09-16") as Date,
      squad_date_str: "2023-09-16",
      squad_time: "02:00 PM",
      games: 6,
      lane_count: 24,
      starting_lane: 1,
      sort_order: 3,
    };

    const nonFoundId = "sqd_00000000000000000000000000000000";

    let didDel = false;

    beforeAll(async () => {
      await rePostSquad(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostSquad(toDel);
      }
    });

    it("should delete a squad", async () => {
      const deleted = await deleteSquad(toDel.id);
      expect(deleted).toBe(1);
      didDel = true;
    });

    it("should return zero when trying to delete a squad when ID is not found", async () => {
      const deleted = await deleteSquad(nonFoundId);
      expect(deleted).toBe(0);
    });

    it("should throw error when trying to delete a squad when id is invalid", async () => {
      await expect(deleteSquad("test")).rejects.toThrow("Invalid squad id");
    });

    it("should throw error when trying to delete a squad when id is valid, but not a squad id", async () => {
      await expect(deleteSquad(userId)).rejects.toThrow("Invalid squad id");
    });

    it("should throw error when trying to delete a squad when id is null", async () => {
      await expect(deleteSquad(null as any)).rejects.toThrow("Invalid squad id");
    });
  });
});
