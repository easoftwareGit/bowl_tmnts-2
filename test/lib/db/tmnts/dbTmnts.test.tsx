// Tests for src/lib/db/tmnts/dbTmnts.ts using a mocked axios instance module.
// No database or server needed.
import { AxiosError, AxiosHeaders } from "axios";
import { publicApi, privateApi } from "@/lib/api/axios";
import { baseTmntsApi } from "@/lib/api/apiPaths";
import { testBaseTmntsApi } from "../../../testApi";
import type { tmntFullType } from "@/lib/types/types";
import { blankTmnt, linkedInitTmntFullData } from "@/lib/db/initVals";
import {
  deleteTmnt,
  getTmnt,
  getTmnts,
  getTmntYears,
  getUserTmnts,
  replaceTmntFullData,
  replaceTmntEntriesData,
  exportedForTesting,
  getTmntFullData,
} from "@/lib/db/tmnts/dbTmnts";
import {
  extractBrktEntries,
  extractBrkts,
  extractBrktSeeds,
  extractDivEntries,
  extractDivs,
  extractElimEntries,
  extractElims,
  extractEvents,
  extractLanes,
  extractOneBrkts,
  extractPlayers,
  extractPotEntries,
  extractPots,
  extractSquads,
  extractTmntMoneys,
} from "@/lib/db/tmnts/dbExtractData";
import { todayYearStr } from "@/lib/dateTools";
import { mockTmntFullData } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";
import { SquadStage } from "@prisma/client";

const { getTmntsForYear, getUpcomingTmnts } = exportedForTesting;

// Replace the axios instances with mock functions each test can control
jest.mock("@/lib/api/axios", () => ({
  publicApi: { get: jest.fn() },
  privateApi: { put: jest.fn(), delete: jest.fn() },
}));
const mockGet = publicApi.get as jest.Mock;
const mockPut = privateApi.put as jest.Mock;
const mockDelete = privateApi.delete as jest.Mock;

// The extract functions turn db rows into app types and have their own
// tests. Here they hand back what they are given, so these tests only
// check how getTmntFullData walks the data and puts it together.
jest.mock("@/lib/db/tmnts/dbExtractData", () => ({
  extractBrktEntries: jest.fn(),
  extractBrkts: jest.fn(),
  extractBrktSeeds: jest.fn(),
  extractDivEntries: jest.fn(),
  extractDivs: jest.fn(),
  extractElimEntries: jest.fn(),
  extractElims: jest.fn(),
  extractEvents: jest.fn(),
  extractLanes: jest.fn(),
  extractOneBrkts: jest.fn(),
  extractPlayers: jest.fn(),
  extractPotEntries: jest.fn(),
  extractPots: jest.fn(),
  extractSquads: jest.fn(),
  extractTmntMoneys: jest.fn(),
}));

// every extract function that takes an array of rows
const rowExtractMocks = [
  extractBrkts,
  extractBrktSeeds,
  extractDivEntries,
  extractDivs,
  extractElimEntries,
  extractElims,
  extractEvents,
  extractLanes,
  extractOneBrkts,
  extractPlayers,
  extractPotEntries,
  extractPots,
  extractSquads,
  extractTmntMoneys,
].map((fn) => fn as jest.Mock);
// extractBrktEntries takes the whole brkt row
const mockExtractBrktEntries = extractBrktEntries as jest.Mock;

// same url logic as dbTmnts.ts; only used to check what was called
const url = process.env.NODE_ENV === "test" && testBaseTmntsApi
  ? testBaseTmntsApi
  : baseTmntsApi;
const fullUrl = url + "/full/";
const fullEntriesUrl = url + "/fullEntries/";
const tmntUrl = url + "/tmnt/";
const userUrl = url + "/user/";
const yearsUrl = url + "/years/";
const upcomingUrl = url + "/upcoming";
const resultsUrl = url + "/results/";

// A real AxiosError, like axios rejects with for a non-2xx response.
const axiosError = (status: number) =>
  new AxiosError(
    `Request failed with status code ${status}`,
    status >= 500 ? "ERR_BAD_RESPONSE" : "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      status,
      statusText: "",
      data: {},
      headers: {},
      config: { headers: new AxiosHeaders() },
    }
  );

const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const notFoundId = "tmt_00000000000000000000000000000000";
const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
const notFoundUserId = "usr_00000000000000000000000000000000";
const gpBowlId = "bwl_561540bd64974da9abdd97765fdb3659";

const apiBowl = {
  bowl_name: "Earl Anthony's Dublin Bowl",
  city: "Dublin",
  state: "CA",
  url: "https://www.earlanthonysdublinbowl.com",
};

// what the tmnt api sends back for one tmnt (dates are full ISO strings)
const apiTmnt = {
  id: tmntId,
  user_id: userId,
  bowl_id: gpBowlId,
  tmnt_name: "Gold Pin",
  start_date: "2022-10-23T00:00:00.000Z",
  end_date: "2022-10-24T00:00:00.000Z",
  bowl: apiBowl,
};

// what the list apis send back
const apiTmntList = [
  {
    id: "tmt_ce35f0c119aa49fd9b89aa86cb980a6a",
    user_id: userId,
    tmnt_name: "Year End Classic",
    start_date: "2026-12-31T00:00:00.000Z",
    bowl: apiBowl,
  },
  {
    id: tmntId,
    user_id: userId,
    tmnt_name: "Gold Pin",
    start_date: "2022-10-23T00:00:00.000Z",
    bowl: {
      bowl_name: "Yosemite Lanes",
      city: "Modesto",
      state: "CA",
      url: "http://yosemitelanes.com",
    },
  },
];

const expectedTmntList = [
  {
    id: apiTmntList[0].id,
    user_id: userId,
    tmnt_name: apiTmntList[0].tmnt_name,
    start_date_str: "2026-12-31",
    bowl: apiTmntList[0].bowl,
  },
  {
    id: apiTmntList[1].id,
    user_id: userId,
    tmnt_name: apiTmntList[1].tmnt_name,
    start_date_str: "2022-10-23",
    bowl: apiTmntList[1].bowl,
  },
];

// upcoming tmnts do not include user_id
const expectedUpcomingList = expectedTmntList.map((tmnt) => ({
  id: tmnt.id,
  tmnt_name: tmnt.tmnt_name,
  start_date_str: tmnt.start_date_str,
  bowl: tmnt.bowl,
}));

// fixed time for the stage dates replaceTmntEntriesData sets
const fixedNow = new Date("2026-10-27T12:00:00.000Z");
const fixedNowStr = fixedNow.toISOString();

beforeEach(() => {
  // jest config does not auto-reset mocks
  mockGet.mockReset();
  mockPut.mockReset();
  mockDelete.mockReset();
  rowExtractMocks.forEach((fn) => {
    fn.mockReset();
    fn.mockImplementation((rows: unknown[]) => rows);
  });
  mockExtractBrktEntries.mockReset();
  mockExtractBrktEntries.mockImplementation(
    (brkt: { brkt_entries: unknown[] }) => brkt.brkt_entries
  );
});

describe("dbTmnts", () => {
  describe("getTmnt()", () => {
    it("should get a single tmnt", async () => {
      mockGet.mockResolvedValue({ data: { tmnt: apiTmnt } });

      const gotTmnt = await getTmnt(tmntId);

      expect(gotTmnt).toEqual({
        ...blankTmnt,
        id: tmntId,
        user_id: userId,
        bowl_id: gpBowlId,
        tmnt_name: "Gold Pin",
        start_date_str: "2022-10-23",
        end_date_str: "2022-10-24",
        bowl: apiBowl,
      });
    });

    it("should call the tmnt url once with the public api", async () => {
      mockGet.mockResolvedValue({ data: { tmnt: apiTmnt } });

      await getTmnt(tmntId);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(tmntUrl + tmntId);
      expect(mockPut).not.toHaveBeenCalled();
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it("should only keep the api fields it maps", async () => {
      mockGet.mockResolvedValue({
        data: {
          tmnt: {
            ...apiTmnt,
            extra: "not kept",
            bowl: { ...apiBowl, id: gpBowlId },
          },
        },
      });

      const gotTmnt = await getTmnt(tmntId);

      expect(gotTmnt).not.toHaveProperty("extra");
      expect(gotTmnt.bowl).toEqual(apiBowl);
    });

    it("should throw error when trying to get a tmnt that does not exist", async () => {
      mockGet.mockRejectedValue(axiosError(404));

      await expect(getTmnt(notFoundId)).rejects.toThrow(
        new Error("getTmnt failed: Request failed with status code 404")
      );
    });

    it("should throw error when the response has no tmnt", async () => {
      mockGet.mockResolvedValue({ data: {} });

      await expect(getTmnt(tmntId)).rejects.toThrow(
        new Error("getTmnt failed: Missing tmnt data")
      );
    });

    it("should throw error if tmnt id is invalid", async () => {
      await expect(getTmnt("test")).rejects.toThrow(
        new Error("Invalid tmnt id")
      );
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should throw error if tmnt id is a valid id, but not a tmnt id", async () => {
      await expect(getTmnt(userId)).rejects.toThrow(
        new Error("Invalid tmnt id")
      );
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should throw error if tmnt id is null", async () => {
      await expect(getTmnt(null as unknown as string)).rejects.toThrow(
        new Error("Invalid tmnt id")
      );
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe("getUserTmnts()", () => {
    it("should get user's tmnts", async () => {
      mockGet.mockResolvedValue({ data: { tmnts: apiTmntList } });

      const userTmnts = await getUserTmnts(userId);

      expect(userTmnts).toEqual(expectedTmntList);
    });

    it("should call the user url once with the public api", async () => {
      mockGet.mockResolvedValue({ data: { tmnts: apiTmntList } });

      await getUserTmnts(userId);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(userUrl + userId);
    });

    it("should return an empty array when user has no tmnts", async () => {
      mockGet.mockResolvedValue({ data: { tmnts: [] } });

      const userTmnts = await getUserTmnts(notFoundUserId);

      expect(userTmnts).toEqual([]);
    });

    it("should throw error when the response has no tmnts", async () => {
      mockGet.mockResolvedValue({ data: {} });

      await expect(getUserTmnts(userId)).rejects.toThrow(
        new Error("getUserTmnts failed: Missing tmnts data")
      );
    });

    it("should throw error when the API call fails", async () => {
      mockGet.mockRejectedValue(axiosError(500));

      await expect(getUserTmnts(userId)).rejects.toThrow(
        new Error("getUserTmnts failed: Request failed with status code 500")
      );
    });

    it("should throw error if user id is invalid", async () => {
      await expect(getUserTmnts("test")).rejects.toThrow(
        new Error("Invalid user id")
      );
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should throw error when user id is valid, but not a user id", async () => {
      await expect(getUserTmnts(notFoundId)).rejects.toThrow(
        new Error("Invalid user id")
      );
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should throw error if user id is null", async () => {
      await expect(getUserTmnts(null as unknown as string)).rejects.toThrow(
        new Error("Invalid user id")
      );
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe("getTmntYears()", () => {
    const apiYears = [{ year: "2026" }, { year: "2024" }, { year: "2023" }];

    it("should get list of tmnt years", async () => {
      mockGet.mockResolvedValue({ data: { years: apiYears } });

      const years = await getTmntYears();

      expect(years).toEqual(apiYears);
    });

    it("should call the years url with this year", async () => {
      mockGet.mockResolvedValue({ data: { years: apiYears } });

      await getTmntYears();

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(yearsUrl + todayYearStr);
    });

    it("should throw error when the response has no years", async () => {
      mockGet.mockResolvedValue({ data: {} });

      await expect(getTmntYears()).rejects.toThrow(
        new Error("getTmntYears failed: Missing years data")
      );
    });

    it("should pass on the API error as is (no try / catch)", async () => {
      const err = axiosError(500);
      mockGet.mockRejectedValue(err);

      await expect(getTmntYears()).rejects.toBe(err);
    });
  });

  describe("getTmnts() - upcoming tmnts", () => {
    it("should get all upcoming tmnts - getTmnts()", async () => {
      mockGet.mockResolvedValue({ data: { tmnts: apiTmntList } });

      const tmnts = await getTmnts("");

      expect(tmnts).toEqual(expectedUpcomingList);
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(upcomingUrl, { params: {} });
    });

    it("should get all upcoming tmnts - getUpcomingTmnts()", async () => {
      mockGet.mockResolvedValue({ data: { tmnts: apiTmntList } });

      const tmnts = await getUpcomingTmnts();

      expect(tmnts).toEqual(expectedUpcomingList);
      expect(mockGet).toHaveBeenCalledWith(upcomingUrl, { params: {} });
    });

    it("should not include user_id in upcoming tmnts", async () => {
      mockGet.mockResolvedValue({ data: { tmnts: apiTmntList } });

      const tmnts = await getTmnts("");

      expect(tmnts[0]).not.toHaveProperty("user_id");
    });

    it("should pass skip and take", async () => {
      mockGet.mockResolvedValue({ data: { tmnts: [] } });

      await getTmnts("", 1, 1);

      expect(mockGet).toHaveBeenCalledWith(upcomingUrl, {
        params: { skip: 1, take: 1 },
      });
    });

    it("should pass skip of 0", async () => {
      mockGet.mockResolvedValue({ data: { tmnts: [] } });

      await getTmnts("", 0, 1);

      expect(mockGet).toHaveBeenCalledWith(upcomingUrl, {
        params: { skip: 0, take: 1 },
      });
    });

    it("should ignore invalid skip and take", async () => {
      mockGet.mockResolvedValue({ data: { tmnts: apiTmntList } });

      const tmnts = await getTmnts("", -1, 1.1);

      expect(tmnts).toEqual(expectedUpcomingList);
      expect(mockGet).toHaveBeenCalledWith(upcomingUrl, { params: {} });
    });

    it("should ignore take of 0 and take over 100", async () => {
      mockGet.mockResolvedValue({ data: { tmnts: [] } });

      await getUpcomingTmnts(0, 0);
      await getUpcomingTmnts(0, 101);

      expect(mockGet).toHaveBeenNthCalledWith(1, upcomingUrl, {
        params: { skip: 0 },
      });
      expect(mockGet).toHaveBeenNthCalledWith(2, upcomingUrl, {
        params: { skip: 0 },
      });
    });

    it("should allow take of 100", async () => {
      mockGet.mockResolvedValue({ data: { tmnts: [] } });

      await getUpcomingTmnts(undefined, 100);

      expect(mockGet).toHaveBeenCalledWith(upcomingUrl, {
        params: { take: 100 },
      });
    });

    it("should return an empty array when there are no upcoming tmnts", async () => {
      mockGet.mockResolvedValue({ data: { tmnts: [] } });

      const tmnts = await getTmnts("", 1, 1);

      expect(tmnts).toEqual([]);
    });

    it("should throw error when the response has no tmnts", async () => {
      mockGet.mockResolvedValue({ data: {} });

      await expect(getTmnts("")).rejects.toThrow(
        new Error("getUpcomingTmnts failed: Missing upcoming tournaments data")
      );
    });

    it("should throw error when the API call fails", async () => {
      mockGet.mockRejectedValue(axiosError(500));

      await expect(getTmnts("")).rejects.toThrow(
        new Error("getUpcomingTmnts failed: Request failed with status code 500")
      );
    });

    it("should throw error if year is null", async () => {
      await expect(getTmnts(null as unknown as string)).rejects.toThrow(
        new Error("Invalid year")
      );
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe("getTmnts() - for a year", () => {
    it("should get tmnts for year 2022 - getTmnts()", async () => {
      mockGet.mockResolvedValue({ data: { tmnts: apiTmntList } });

      const tmnts = await getTmnts("2022");

      expect(tmnts).toEqual(expectedTmntList);
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(resultsUrl + "2022", { params: {} });
    });

    it("should get tmnts for year 2022 - getTmntsForYear()", async () => {
      mockGet.mockResolvedValue({ data: { tmnts: apiTmntList } });

      const tmnts = await getTmntsForYear("2022");

      expect(tmnts).toEqual(expectedTmntList);
      expect(mockGet).toHaveBeenCalledWith(resultsUrl + "2022", { params: {} });
    });

    it("should pass skip and take", async () => {
      mockGet.mockResolvedValue({ data: { tmnts: [] } });

      await getTmnts("2023", 5, 10);

      expect(mockGet).toHaveBeenCalledWith(resultsUrl + "2023", {
        params: { skip: 5, take: 10 },
      });
    });

    it("should ignore invalid skip and take", async () => {
      mockGet.mockResolvedValue({ data: { tmnts: [] } });

      await getTmntsForYear("2023", -1, 1.1);

      expect(mockGet).toHaveBeenCalledWith(resultsUrl + "2023", { params: {} });
    });

    it("should return an empty array when there are no tmnts for the year", async () => {
      mockGet.mockResolvedValue({ data: { tmnts: [] } });

      const tmnts = await getTmnts("2001");

      expect(tmnts).toEqual([]);
    });

    it("should throw error when the response has no tmnts", async () => {
      mockGet.mockResolvedValue({ data: {} });

      await expect(getTmnts("2023")).rejects.toThrow(
        new Error("getTmntsForYear failed: Missing tournaments data for year 2023")
      );
    });

    it("should throw error when the API call fails", async () => {
      mockGet.mockRejectedValue(axiosError(500));

      await expect(getTmnts("2023")).rejects.toThrow(
        new Error("getTmntsForYear failed: Request failed with status code 500")
      );
    });

    it("should throw error if year is invalid", async () => {
      await expect(getTmnts("test")).rejects.toThrow(new Error("Invalid year"));
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should throw error if year is invalid - getTmntsForYear()", async () => {
      await expect(getTmntsForYear("test")).rejects.toThrow(
        new Error("Invalid year")
      );
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe("getTmntFullData()", () => {
    const divId1 = "div_99a3cae28786485bb7a036935f0f6a0a";
    const divId2 = "div_29b9225d8dd44a4eae276f8bde855729";
    const eventId = "evt_4ff710c8493f4a218d2e2b045442974a";
    const squadId1 = "sqd_8e4266e1174642c7a1bcec47a50f275f";
    const squadId2 = "sqd_1a6c885ee19a49489960389193e8f819";

    const stage1 = {
      id: "stg_124dd9efc30f4352b691dfd93d1e284e",
      squad_id: squadId1,
      stage: SquadStage.ENTRIES,
      stage_set_at: "2024-07-01T00:00:00.000Z",
      scores_started_at: null,
      stage_override_enabled: false,
      stage_override_at: null,
      stage_override_reason: null,
    };
    const stage2 = {
      ...stage1,
      id: "stg_c5f562c4c4304d919ac43fead73123e2",
      squad_id: squadId2,
      stage: SquadStage.SCORES,
    };

    // rows only need ids; the extract functions are mocked
    const brkt1 = {
      id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      brkt_entries: [{ id: "ben_c0126ba58d3f4a7d950101a5674ce595" }],
      one_brkts: [
        {
          id: "obk_557f12f3875f42baa29b8b3c4b9c3e01",
          brkt_seeds: [{ one_brkt_id: "obk_557f12f3875f42baa29b8b3c4b9c3e01", seed: 0 }],
        },
        {
          id: "obk_5423c16d58a948748f32c7c72c632297",
          brkt_seeds: [{ one_brkt_id: "obk_5423c16d58a948748f32c7c72c632297", seed: 0 }],
        },
      ],
    };
    const brkt2 = {
      id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      brkt_entries: [{ id: "ben_c0226ba58d3f4a7d950101a5674ce595" }],
      one_brkts: [],
    };
    const elim1 = {
      id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
      elim_entries: [{ id: "een_a01758cff1cc4bab9d9133e661bd49b0" }],
    };
    const pot1 = {
      id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
      pot_entries: [{ id: "pen_a01758cff1cc4bab9d9133e661bd49b0" }],
    };
    const div1 = {
      id: divId1,
      div_entries: [{ id: "den_a01631c1c94d4627bde16fad72e5e5d4" }],
      brkts: [brkt1, brkt2],
      elims: [elim1],
      pots: [pot1],
    };
    const div2 = {
      id: divId2,
      div_entries: [{ id: "den_a02631c1c94d4627bde16fad72e5e5d4" }],
      brkts: [],
      elims: [],
      pots: [],
    };
    const squad1 = {
      id: squadId1,
      stage: stage1,
      lanes: [
        { id: "lan_ab019d9e6b6e4c5b9f6b7d9e7f9b6c5d" },
        { id: "lan_ab029d9e6b6e4c5b9f6b7d9e7f9b6c5d" },
      ],
      players: [{ id: "ply_a01758cff1cc4bab9d9133e661bd49b0" }],
      moneys: [{ id: "mny_a01758cff1cc4bab9d9133e661bd49b0" }],
    };
    const squad2 = {
      id: squadId2,
      stage: stage2,
      lanes: [{ id: "lan_4e24c5cc04f6463d89f24e6e19a126a2" }],
      players: [{ id: "ply_a02758cff1cc4bab9d9133e661bd49b0" }],
      moneys: [],
    };
    const event1 = {
      id: eventId,
      squads: [squad1, squad2],
    };

    // what the full api sends back for a tmnt
    const apiTmntFull = {
      ...apiTmnt,
      divs: [div1, div2],
      events: [event1],
    };

    // the parts of the init value getTmntFullData starts from and keeps
    const base: tmntFullType = cloneDeep(linkedInitTmntFullData);

    it("should get the tmnt part of the full data", async () => {
      mockGet.mockResolvedValue({ data: { tmntFullData: apiTmntFull } });

      const tmntFullData = await getTmntFullData(tmntId);

      expect(tmntFullData.tmnt).toEqual({
        ...base.tmnt,
        id: tmntId,
        user_id: userId,
        bowl_id: gpBowlId,
        tmnt_name: "Gold Pin",
        start_date_str: "2022-10-23",
        end_date_str: "2022-10-24",
        bowl: { ...base.tmnt.bowl, ...apiBowl },
      });
    });

    it("should call the full url once with the public api", async () => {
      mockGet.mockResolvedValue({ data: { tmntFullData: apiTmntFull } });

      await getTmntFullData(tmntId);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(fullUrl + tmntId);
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("should replace the init divs, events, squads and lanes", async () => {
      mockGet.mockResolvedValue({ data: { tmntFullData: apiTmntFull } });

      const tmntFullData = await getTmntFullData(tmntId);

      expect(tmntFullData.divs).toEqual(apiTmntFull.divs);
      expect(tmntFullData.events).toEqual(apiTmntFull.events);
      expect(tmntFullData.squads).toEqual([squad1, squad2]);
      expect(tmntFullData.lanes).toEqual([...squad1.lanes, ...squad2.lanes]);
    });

    it("should collect the div child and grand child data from every div", async () => {
      mockGet.mockResolvedValue({ data: { tmntFullData: apiTmntFull } });

      const tmntFullData = await getTmntFullData(tmntId);

      expect(tmntFullData.divEntries).toEqual([
        ...base.divEntries,
        ...div1.div_entries,
        ...div2.div_entries,
      ]);
      expect(tmntFullData.brkts).toEqual([...base.brkts, brkt1, brkt2]);
      expect(tmntFullData.brktEntries).toEqual([
        ...base.brktEntries,
        ...brkt1.brkt_entries,
        ...brkt2.brkt_entries,
      ]);
      expect(tmntFullData.oneBrkts).toEqual([...base.oneBrkts, ...brkt1.one_brkts]);
      expect(tmntFullData.brktSeeds).toEqual([
        ...base.brktSeeds,
        ...brkt1.one_brkts[0].brkt_seeds,
        ...brkt1.one_brkts[1].brkt_seeds,
      ]);
      expect(tmntFullData.elims).toEqual([...base.elims, elim1]);
      expect(tmntFullData.elimEntries).toEqual([
        ...base.elimEntries,
        ...elim1.elim_entries,
      ]);
      expect(tmntFullData.pots).toEqual([...base.pots, pot1]);
      expect(tmntFullData.potEntries).toEqual([
        ...base.potEntries,
        ...pot1.pot_entries,
      ]);
    });

    it("should collect the squad child data from every squad", async () => {
      mockGet.mockResolvedValue({ data: { tmntFullData: apiTmntFull } });

      const tmntFullData = await getTmntFullData(tmntId);

      expect(tmntFullData.players).toEqual([
        ...base.players,
        ...squad1.players,
        ...squad2.players,
      ]);
      expect(tmntFullData.moneys).toEqual([
        ...base.moneys,
        ...squad1.moneys,
        ...squad2.moneys,
      ]);
    });

    it("should use the stage of the first squad", async () => {
      mockGet.mockResolvedValue({ data: { tmntFullData: apiTmntFull } });

      const tmntFullData = await getTmntFullData(tmntId);

      expect(tmntFullData.stage).toEqual(stage1);
    });

    it("should pass the right rows to each extract function", async () => {
      mockGet.mockResolvedValue({ data: { tmntFullData: apiTmntFull } });

      await getTmntFullData(tmntId);

      expect(extractDivs).toHaveBeenCalledTimes(1);
      expect(extractDivs).toHaveBeenCalledWith(apiTmntFull.divs);
      expect(extractDivEntries).toHaveBeenNthCalledWith(1, div1.div_entries);
      expect(extractDivEntries).toHaveBeenNthCalledWith(2, div2.div_entries);
      expect(extractBrkts).toHaveBeenNthCalledWith(1, div1.brkts);
      expect(extractBrkts).toHaveBeenNthCalledWith(2, div2.brkts);
      // extractBrktEntries gets the whole brkt row, not brkt_entries
      expect(extractBrktEntries).toHaveBeenNthCalledWith(1, brkt1);
      expect(extractBrktEntries).toHaveBeenNthCalledWith(2, brkt2);
      expect(extractOneBrkts).toHaveBeenNthCalledWith(1, brkt1.one_brkts);
      expect(extractOneBrkts).toHaveBeenNthCalledWith(2, brkt2.one_brkts);
      expect(extractBrktSeeds).toHaveBeenCalledTimes(2);
      expect(extractBrktSeeds).toHaveBeenNthCalledWith(1, brkt1.one_brkts[0].brkt_seeds);
      expect(extractBrktSeeds).toHaveBeenNthCalledWith(2, brkt1.one_brkts[1].brkt_seeds);
      expect(extractElims).toHaveBeenNthCalledWith(1, div1.elims);
      expect(extractElimEntries).toHaveBeenCalledTimes(1);
      expect(extractElimEntries).toHaveBeenCalledWith(elim1.elim_entries);
      expect(extractPots).toHaveBeenNthCalledWith(1, div1.pots);
      expect(extractPotEntries).toHaveBeenCalledTimes(1);
      expect(extractPotEntries).toHaveBeenCalledWith(pot1.pot_entries);

      expect(extractEvents).toHaveBeenCalledTimes(1);
      expect(extractEvents).toHaveBeenCalledWith(apiTmntFull.events);
      expect(extractSquads).toHaveBeenCalledWith(event1.squads);
      expect(extractLanes).toHaveBeenNthCalledWith(1, squad1.lanes);
      expect(extractLanes).toHaveBeenNthCalledWith(2, squad2.lanes);
      expect(extractPlayers).toHaveBeenNthCalledWith(1, squad1.players);
      expect(extractPlayers).toHaveBeenNthCalledWith(2, squad2.players);
      expect(extractTmntMoneys).toHaveBeenNthCalledWith(1, squad1.moneys);
      expect(extractTmntMoneys).toHaveBeenNthCalledWith(2, squad2.moneys);
    });

    it("should not change linkedInitTmntFullData", async () => {
      const before = cloneDeep(linkedInitTmntFullData);
      mockGet.mockResolvedValue({ data: { tmntFullData: apiTmntFull } });

      await getTmntFullData(tmntId);

      expect(linkedInitTmntFullData).toEqual(before);
    });

    it("should throw error if tmnt id is invalid", async () => {
      await expect(getTmntFullData("test")).rejects.toThrow(
        new Error("Invalid tmnt id")
      );
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should throw error if tmnt id is a valid id, but not found in db", async () => {
      mockGet.mockRejectedValue(axiosError(404));

      await expect(getTmntFullData(notFoundId)).rejects.toThrow(
        new Error("getTmntFullData failed: Request failed with status code 404")
      );
    });

    it("should throw error if tmnt id is a valid id, but not a tmnt id", async () => {
      await expect(getTmntFullData(userId)).rejects.toThrow(
        new Error("Invalid tmnt id")
      );
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should throw error if tmnt id is null", async () => {
      await expect(getTmntFullData(null as unknown as string)).rejects.toThrow(
        new Error("Invalid tmnt id")
      );
      expect(mockGet).not.toHaveBeenCalled();
    });

    describe("getTmntFullData - invalid child data", () => {
      const missingMsg = (missing: string) =>
        `getTmntFullData failed: tournament "${tmntId}" is missing required child data: ${missing}`;

      it("should throw error if tmnt has no div(s)", async () => {
        mockGet.mockResolvedValue({
          data: { tmntFullData: { ...apiTmntFull, divs: [] } },
        });

        await expect(getTmntFullData(tmntId)).rejects.toThrow(
          new Error(missingMsg("Div"))
        );
      });

      it("should throw error if divs is missing", async () => {
        const noDivs: Record<string, unknown> = { ...apiTmntFull };
        delete noDivs.divs;
        mockGet.mockResolvedValue({ data: { tmntFullData: noDivs } });

        await expect(getTmntFullData(tmntId)).rejects.toThrow(
          new Error(missingMsg("Div"))
        );
      });

      it("should throw error if tmnt has no event(s)", async () => {
        mockGet.mockResolvedValue({
          data: { tmntFullData: { ...apiTmntFull, events: [] } },
        });

        // no events means no squads or lanes either
        await expect(getTmntFullData(tmntId)).rejects.toThrow(
          new Error(missingMsg("Event, Squad, Lane"))
        );
      });

      it("should throw error if tmnt has no squad(s)", async () => {
        mockGet.mockResolvedValue({
          data: {
            tmntFullData: {
              ...apiTmntFull,
              events: [{ ...event1, squads: [] }],
            },
          },
        });

        await expect(getTmntFullData(tmntId)).rejects.toThrow(
          new Error(missingMsg("Squad, Lane"))
        );
      });

      it("should throw error if tmnt has no lane(s)", async () => {
        mockGet.mockResolvedValue({
          data: {
            tmntFullData: {
              ...apiTmntFull,
              events: [
                {
                  ...event1,
                  squads: [
                    { ...squad1, lanes: [] },
                    { ...squad2, lanes: [] },
                  ],
                },
              ],
            },
          },
        });

        await expect(getTmntFullData(tmntId)).rejects.toThrow(
          new Error(missingMsg("Lane"))
        );
      });

      it("should list all missing child data", async () => {
        mockGet.mockResolvedValue({
          data: { tmntFullData: { ...apiTmntFull, divs: [], events: [] } },
        });

        await expect(getTmntFullData(tmntId)).rejects.toThrow(
          new Error(missingMsg("Div, Event, Squad, Lane"))
        );
      });
    });
  });

  describe("replaceTmntFullData()", () => {
    // mockTmntFullData with only the core four: events, divs, squads, lanes
    const coreFour = (): tmntFullType => {
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
      toReplace.moneys = [];
      return toReplace;
    };

    it("returns a boolean success flag", async () => {
      mockPut.mockResolvedValue({ data: { success: true } });

      const result = await replaceTmntFullData(coreFour());

      expect(typeof result).toBe("boolean");
      expect(result).toBe(true);
    });

    it("should replace a tmnt - just core four: events, divs, squads and lanes", async () => {
      mockPut.mockResolvedValue({ data: { success: true } });
      const toReplace = coreFour();

      const result = await replaceTmntFullData(toReplace);

      expect(result).toBe(true);
      expect(mockPut).toHaveBeenCalledWith(
        fullUrl + toReplace.tmnt.id,
        JSON.stringify(toReplace)
      );
    });

    it("should replace a tmnt - core four + pots, brkts and elims", async () => {
      mockPut.mockResolvedValue({ data: { success: true } });
      const toReplace = cloneDeep(mockTmntFullData);
      toReplace.brktEntries = [];
      toReplace.brktSeeds = [];
      toReplace.divEntries = [];
      toReplace.elimEntries = [];
      toReplace.oneBrkts = [];
      toReplace.potEntries = [];

      const result = await replaceTmntFullData(toReplace);

      expect(result).toBe(true);
    });

    it("should put the full tmnt JSON to the full url with the private api", async () => {
      mockPut.mockResolvedValue({ data: { success: true } });
      const toReplace = cloneDeep(mockTmntFullData);

      const result = await replaceTmntFullData(toReplace);

      expect(result).toBe(true);
      expect(mockPut).toHaveBeenCalledTimes(1);
      // validateFullTmnt clears tab_title in the passed data, so compare
      // to toReplace after the call, not to mockTmntFullData
      expect(mockPut).toHaveBeenCalledWith(
        fullUrl + mockTmntFullData.tmnt.id,
        JSON.stringify(toReplace)
      );
      expect(mockGet).not.toHaveBeenCalled();
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it("should not change the stage dates", async () => {
      mockPut.mockResolvedValue({ data: { success: true } });
      const toReplace = cloneDeep(mockTmntFullData);

      await replaceTmntFullData(toReplace);

      expect(toReplace.stage).toEqual(mockTmntFullData.stage);
    });

    it("should throw error when the response is not a success", async () => {
      mockPut.mockResolvedValue({ data: { success: false } });

      await expect(replaceTmntFullData(cloneDeep(mockTmntFullData))).rejects.toThrow(
        new Error("replaceTmntFullData failed: Error replacing full tmnt")
      );
    });

    it("should throw error when the route answers 422", async () => {
      mockPut.mockRejectedValue(axiosError(422));

      await expect(replaceTmntFullData(cloneDeep(mockTmntFullData))).rejects.toThrow(
        new Error("replaceTmntFullData failed: Request failed with status code 422")
      );
    });

    it("should throw error when post a tmnt if invalid tmnt id", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.tmnt.id = "invalid id";

      await expect(replaceTmntFullData(invalidTmnt)).rejects.toThrow(
        "tmnt has invalid data"
      );
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("should throw error when post a tmnt if got invalid data", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.tmnt.tmnt_name = "";

      await expect(replaceTmntFullData(invalidTmnt)).rejects.toThrow(
        "tmnt is missing data"
      );
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("should throw error when post a tmnt if passed null", async () => {
      await expect(
        replaceTmntFullData(null as unknown as tmntFullType)
      ).rejects.toThrow(new Error("invalid tmntFullData data"));
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("should throw error when post a tmnt if passed non object", async () => {
      await expect(
        replaceTmntFullData("test" as unknown as tmntFullType)
      ).rejects.toThrow(new Error("invalid tmntFullData data"));
      expect(mockPut).not.toHaveBeenCalled();
    });
  });

  describe("replaceTmntEntriesData()", () => {
    beforeEach(() => {
      // fake only Date; list every other timer API in doNotFake so
      // promises and timers still work normally
      jest.useFakeTimers({
        now: fixedNow,
        doNotFake: [
          "hrtime",
          "nextTick",
          "performance",
          "queueMicrotask",
          "requestAnimationFrame",
          "cancelAnimationFrame",
          "requestIdleCallback",
          "cancelIdleCallback",
          "setImmediate",
          "clearImmediate",
          "setInterval",
          "clearInterval",
          "setTimeout",
          "clearTimeout",
        ],
      });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    // the route echoes back the stage it saved
    const putResponse = (sent: tmntFullType) => ({
      data: { success: true, stage: sent.stage },
    });

    // the tmnt data replaceTmntEntriesData sent to the api
    const sentData = (): tmntFullType => JSON.parse(mockPut.mock.calls[0][1]);

    it("should replace a tmnt entries - all entries data", async () => {
      const toReplace = cloneDeep(mockTmntFullData);
      mockPut.mockResolvedValue(putResponse(toReplace));

      const result = await replaceTmntEntriesData(toReplace);

      expect(result.success).toBe(true);
      expect(result.stage).toEqual({
        ...mockTmntFullData.stage,
        stage_set_at: fixedNowStr,
        scores_started_at:
          mockTmntFullData.stage.stage === SquadStage.SCORES ? fixedNowStr : null,
        stage_override_at: mockTmntFullData.stage.stage_override_enabled
          ? fixedNowStr
          : null,
      });
    });

    it("should put the entries JSON to the full entries url with the private api", async () => {
      const toReplace = cloneDeep(mockTmntFullData);
      mockPut.mockResolvedValue(putResponse(toReplace));

      await replaceTmntEntriesData(toReplace);

      expect(mockPut).toHaveBeenCalledTimes(1);
      expect(mockPut).toHaveBeenCalledWith(
        fullEntriesUrl + mockTmntFullData.tmnt.id,
        JSON.stringify(toReplace)
      );
      expect(mockGet).not.toHaveBeenCalled();
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it("should send the entries data unchanged and the stage with new dates", async () => {
      const toReplace = cloneDeep(mockTmntFullData);
      mockPut.mockResolvedValue(putResponse(toReplace));

      await replaceTmntEntriesData(toReplace);

      // validateFullTmnt clears tab_title in the passed data, so only the
      // entries arrays are compared to mockTmntFullData
      const sent = sentData();
      const asJson = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
      expect(sent).toEqual(asJson(toReplace));
      expect(sent.players).toEqual(asJson(mockTmntFullData.players));
      expect(sent.divEntries).toEqual(asJson(mockTmntFullData.divEntries));
      expect(sent.potEntries).toEqual(asJson(mockTmntFullData.potEntries));
      expect(sent.brktEntries).toEqual(asJson(mockTmntFullData.brktEntries));
      expect(sent.oneBrkts).toEqual(asJson(mockTmntFullData.oneBrkts));
      expect(sent.brktSeeds).toEqual(asJson(mockTmntFullData.brktSeeds));
      expect(sent.elimEntries).toEqual(asJson(mockTmntFullData.elimEntries));
      expect(sent.stage.id).toBe(mockTmntFullData.stage.id);
      expect(sent.stage.squad_id).toBe(mockTmntFullData.stage.squad_id);
      expect(sent.stage.stage).toBe(mockTmntFullData.stage.stage);
      expect(sent.stage.stage_set_at).toBe(fixedNowStr);
    });

    it("should return the response data", async () => {
      const toReplace = cloneDeep(mockTmntFullData);
      const apiStage = { ...toReplace.stage, stage_set_at: fixedNowStr };
      mockPut.mockResolvedValue({ data: { success: true, stage: apiStage } });

      const result = await replaceTmntEntriesData(toReplace);

      expect(result).toEqual({ success: true, stage: apiStage });
    });

    it("should replace a tmnt entries - no entries data", async () => {
      const toReplace = cloneDeep(mockTmntFullData);
      toReplace.brktEntries = [];
      toReplace.brktSeeds = [];
      toReplace.divEntries = [];
      toReplace.elimEntries = [];
      toReplace.oneBrkts = [];
      toReplace.potEntries = [];
      toReplace.players = [];
      mockPut.mockResolvedValue(putResponse(toReplace));

      const result = await replaceTmntEntriesData(toReplace);

      expect(result.success).toBe(true);
      const sent = sentData();
      expect(sent.players).toEqual([]);
      expect(sent.divEntries).toEqual([]);
      expect(sent.potEntries).toEqual([]);
      expect(sent.brktEntries).toEqual([]);
      expect(sent.elimEntries).toEqual([]);
      expect(sent.oneBrkts).toEqual([]);
      expect(sent.brktSeeds).toEqual([]);
    });

    it("should set stage_set_at and scores_started_at when stage = SCORES", async () => {
      const toReplace = cloneDeep(mockTmntFullData);
      toReplace.stage.stage = SquadStage.SCORES;
      toReplace.stage.stage_override_enabled = false;
      mockPut.mockResolvedValue(putResponse(toReplace));

      const result = await replaceTmntEntriesData(toReplace);

      expect(result.success).toBe(true);
      const sentStage = sentData().stage;
      expect(sentStage.stage).toBe(SquadStage.SCORES);
      expect(sentStage.stage_set_at).toBe(fixedNowStr);
      expect(sentStage.scores_started_at).toBe(fixedNowStr);
      expect(sentStage.stage_override_at).toBeNull();
    });

    it("should set stage_override_at when stage = ENTRIES and stage_override_enabled = true", async () => {
      const toReplace = cloneDeep(mockTmntFullData);
      toReplace.stage.stage = SquadStage.ENTRIES;
      toReplace.stage.stage_override_enabled = true;
      toReplace.stage.stage_override_reason = "override reason";
      mockPut.mockResolvedValue(putResponse(toReplace));

      const result = await replaceTmntEntriesData(toReplace);

      expect(result.success).toBe(true);
      const sentStage = sentData().stage;
      expect(sentStage.stage).toBe(SquadStage.ENTRIES);
      expect(sentStage.stage_set_at).toBe(fixedNowStr);
      expect(sentStage.scores_started_at).toBeNull();
      expect(sentStage.stage_override_at).toBe(fixedNowStr);
      expect(sentStage.stage_override_reason).toBe("override reason");
    });

    it("should clear scores_started_at and stage_override_at when not SCORES and no override", async () => {
      const toReplace = cloneDeep(mockTmntFullData);
      toReplace.stage.stage = SquadStage.ENTRIES;
      toReplace.stage.scores_started_at = "2020-01-01T00:00:00.000Z";
      toReplace.stage.stage_override_enabled = false;
      toReplace.stage.stage_override_at = "2020-01-01T00:00:00.000Z";
      toReplace.stage.stage_override_reason = "";
      mockPut.mockResolvedValue(putResponse(toReplace));

      await replaceTmntEntriesData(toReplace);

      const sentStage = sentData().stage;
      expect(sentStage.scores_started_at).toBeNull();
      expect(sentStage.stage_override_at).toBeNull();
    });

    it("should throw error when the response has no success", async () => {
      mockPut.mockResolvedValue({ data: { stage: mockTmntFullData.stage } });

      await expect(
        replaceTmntEntriesData(cloneDeep(mockTmntFullData))
      ).rejects.toThrow(
        new Error("replaceTmntFullEntriesData failed: Error replacing full tmnt entries")
      );
    });

    it("should throw error when the response has no stage", async () => {
      mockPut.mockResolvedValue({ data: { success: true } });

      await expect(
        replaceTmntEntriesData(cloneDeep(mockTmntFullData))
      ).rejects.toThrow(
        new Error("replaceTmntFullEntriesData failed: Error replacing full tmnt entries")
      );
    });

    it("should throw error when the route answers 422", async () => {
      mockPut.mockRejectedValue(axiosError(422));

      await expect(
        replaceTmntEntriesData(cloneDeep(mockTmntFullData))
      ).rejects.toThrow(
        new Error("replaceTmntFullEntriesData failed: Request failed with status code 422")
      );
    });

    it("should throw error when post tmnt entries - events do not belong to the tmnt", async () => {
      const notInDbTmnt = cloneDeep(mockTmntFullData);
      notInDbTmnt.tmnt.id = "tmt_00000000000000000000000000000000";

      await expect(replaceTmntEntriesData(notInDbTmnt)).rejects.toThrow(
        "events has no parent tmnt at index 0"
      );
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("should throw error when post tmnt entries if invalid div entry id", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.divEntries[0].id = "invalid id";

      await expect(replaceTmntEntriesData(invalidTmnt)).rejects.toThrow(
        "divEntries has invalid data at index 0"
      );
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("should throw error when post tmnt entries if got invalid data", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.players[0].first_name = "";

      await expect(replaceTmntEntriesData(invalidTmnt)).rejects.toThrow(
        "players has missing data at index 0"
      );
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("should throw error when post tmnt entries if passed null", async () => {
      await expect(
        replaceTmntEntriesData(null as unknown as tmntFullType)
      ).rejects.toThrow(new Error("invalid tmntFullData data"));
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("should throw error when post tmnt entries if passed non object", async () => {
      await expect(
        replaceTmntEntriesData("test" as unknown as tmntFullType)
      ).rejects.toThrow(new Error("invalid tmntFullData data"));
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("should throw error when post tmnt entries if squad is empty", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.squads = [];

      await expect(replaceTmntEntriesData(invalidTmnt)).rejects.toThrow(
        "no squads data"
      );
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("should throw error when post tmnt entries if squad is invalid", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.squads[0].id = "invalid id";

      await expect(replaceTmntEntriesData(invalidTmnt)).rejects.toThrow(
        "squads has invalid data at index 0"
      );
      expect(mockPut).not.toHaveBeenCalled();
    });
  });

  describe("deleteTmnt()", () => {
    const toDelId = "tmt_e134ac14c5234d708d26037ae812ac33";

    it("should delete a tmnt by ID", async () => {
      mockDelete.mockResolvedValue({ data: { count: 1 } });

      const deleted = await deleteTmnt(toDelId);

      expect(deleted).toBe(1);
    });

    it("should call the tmnt url once with the private api", async () => {
      mockDelete.mockResolvedValue({ data: { count: 1 } });

      await deleteTmnt(toDelId);

      expect(mockDelete).toHaveBeenCalledTimes(1);
      expect(mockDelete).toHaveBeenCalledWith(tmntUrl + toDelId);
      expect(mockGet).not.toHaveBeenCalled();
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("should return 0 when trying to delete a tmnt when id is not found", async () => {
      mockDelete.mockResolvedValue({ data: { count: 0 } });

      const deleted = await deleteTmnt(notFoundId);

      expect(deleted).toBe(0);
    });

    it("should throw error when the response has no count", async () => {
      mockDelete.mockResolvedValue({ data: {} });

      await expect(deleteTmnt(toDelId)).rejects.toThrow(
        new Error("deleteTmnt failed: Error deleting tmnt")
      );
    });

    it("should throw error when the API call fails", async () => {
      mockDelete.mockRejectedValue(axiosError(500));

      await expect(deleteTmnt(toDelId)).rejects.toThrow(
        new Error("deleteTmnt failed: Request failed with status code 500")
      );
    });

    it("should throw error when trying to delete a tmnt when id is invalid", async () => {
      await expect(deleteTmnt("test")).rejects.toThrow(
        new Error("Invalid tmnt id")
      );
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it("should throw error when trying to delete a tmnt when id is valid, but not a tmnt id", async () => {
      await expect(deleteTmnt(userId)).rejects.toThrow(
        new Error("Invalid tmnt id")
      );
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it("should throw error when trying to delete a tmnt when id is null", async () => {
      await expect(deleteTmnt(null as unknown as string)).rejects.toThrow(
        new Error("Invalid tmnt id")
      );
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });
});
