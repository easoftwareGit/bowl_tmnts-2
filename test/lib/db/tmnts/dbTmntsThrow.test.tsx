import { AxiosError, AxiosHeaders } from "axios";
import { publicApi, privateApi } from "@/lib/api/axios";
import { baseTmntsApi } from "@/lib/api/apiPaths";
import { testBaseTmntsApi } from "../../../testApi";
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
import { todayYearStr } from "@/lib/dateTools";
import { mockTmntFullData } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";

const { getTmntsForYear, getUpcomingTmnts } = exportedForTesting;

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  publicApi: {
    get: jest.fn(),
  },
  privateApi: {
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockPublicGet = publicApi.get as jest.Mock;
const mockPrivatePut = privateApi.put as jest.Mock;
const mockPrivateDelete = privateApi.delete as jest.Mock;

// If running tests AND a test URL is defined, use it; otherwise use the app API path
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

// a real AxiosError, like axios rejects with for a non-2xx response
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
const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";

describe("non standard throw cases", () => {
  beforeEach(() => {
    // mockReset also clears mockResolvedValue implementations,
    // clearAllMocks only clears the call history
    mockPublicGet.mockReset();
    mockPrivatePut.mockReset();
    mockPrivateDelete.mockReset();
  });

  describe("getTmnt - non standard throw cases", () => {
    it("should throw an error when response.data.tmnt is missing", async () => {
      mockPublicGet.mockResolvedValue({
        data: {},
      });

      await expect(getTmnt(tmntId)).rejects.toThrow(
        "getTmnt failed: Missing tmnt data"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
      expect(mockPublicGet).toHaveBeenCalledWith(tmntUrl + tmntId);
    });

    it("should throw an error when response.data is null", async () => {
      mockPublicGet.mockResolvedValue({
        data: null,
      });

      await expect(getTmnt(tmntId)).rejects.toThrow(
        "getTmnt failed: Missing tmnt data"
      );
    });

    it("should throw an error when response.data.tmnt has no bowl", async () => {
      mockPublicGet.mockResolvedValue({
        data: {
          tmnt: {
            id: tmntId,
            user_id: userId,
            tmnt_name: "Gold Pin",
            start_date: "2022-10-23T00:00:00.000Z",
            end_date: "2022-10-23T00:00:00.000Z",
          },
        },
      });

      await expect(getTmnt(tmntId)).rejects.toThrow(/^getTmnt failed: .*bowl_name/);
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockPublicGet.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getTmnt(tmntId)).rejects.toThrow(
        "getTmnt failed: Network Error"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockPublicGet.mockRejectedValueOnce("testing 123");

      await expect(getTmnt(tmntId)).rejects.toThrow(
        "getTmnt failed: testing 123"
      );
    });
  });

  describe("getUserTmnts - non standard throw cases", () => {
    it("should throw an error when response.data.tmnts is missing", async () => {
      mockPublicGet.mockResolvedValue({
        data: {},
      });

      await expect(getUserTmnts(userId)).rejects.toThrow(
        "getUserTmnts failed: Missing tmnts data"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
      expect(mockPublicGet).toHaveBeenCalledWith(userUrl + userId);
    });

    it("should throw an error when response.data is null", async () => {
      mockPublicGet.mockResolvedValue({
        data: null,
      });

      await expect(getUserTmnts(userId)).rejects.toThrow(
        "getUserTmnts failed: Missing tmnts data"
      );
    });

    it("should throw an error when response.data.tmnts is not an array", async () => {
      mockPublicGet.mockResolvedValue({
        data: { tmnts: "not an array" },
      });

      await expect(getUserTmnts(userId)).rejects.toThrow(
        /^getUserTmnts failed: .*is not a function/
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockPublicGet.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getUserTmnts(userId)).rejects.toThrow(
        "getUserTmnts failed: Network Error"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockPublicGet.mockRejectedValueOnce("testing 123");

      await expect(getUserTmnts(userId)).rejects.toThrow(
        "getUserTmnts failed: testing 123"
      );
    });
  });

  describe("getTmntYears - non standard throw cases", () => {
    it("should throw an error when response.data.years is missing", async () => {
      mockPublicGet.mockResolvedValue({
        data: {},
      });

      await expect(getTmntYears()).rejects.toThrow(
        "getTmntYears failed: Missing years data"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
      expect(mockPublicGet).toHaveBeenCalledWith(yearsUrl + todayYearStr);
    });

    it("should throw an error when response.data is null", async () => {
      mockPublicGet.mockResolvedValue({
        data: null,
      });

      await expect(getTmntYears()).rejects.toThrow(
        "getTmntYears failed: Missing years data"
      );
    });

    // getTmntYears has no try / catch, so a reject is passed on as is
    it("should pass on the error if publicApi.get rejects", async () => {
      const err = new Error("Network Error");
      mockPublicGet.mockRejectedValueOnce(err);

      await expect(getTmntYears()).rejects.toBe(err);

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
    });

    it("should pass on the value when publicApi.get rejects with non-error", async () => {
      mockPublicGet.mockRejectedValueOnce("testing 123");

      await expect(getTmntYears()).rejects.toBe("testing 123");
    });
  });

  describe("getTmntsForYear - non standard throw cases", () => {
    it("should throw an error when response.data.tmnts is missing", async () => {
      mockPublicGet.mockResolvedValue({
        data: {},
      });

      await expect(getTmntsForYear("2023")).rejects.toThrow(
        "getTmntsForYear failed: Missing tournaments data for year 2023"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
      expect(mockPublicGet).toHaveBeenCalledWith(resultsUrl + "2023", { params: {} });
    });

    it("should throw an error when response.data is null", async () => {
      mockPublicGet.mockResolvedValue({
        data: null,
      });

      await expect(getTmnts("2023")).rejects.toThrow(
        "getTmntsForYear failed: Missing tournaments data for year 2023"
      );
    });

    it("should throw an error when response.data.tmnts is not an array", async () => {
      mockPublicGet.mockResolvedValue({
        data: { tmnts: "not an array" },
      });

      await expect(getTmntsForYear("2023")).rejects.toThrow(
        /^getTmntsForYear failed: .*is not a function/
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockPublicGet.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getTmnts("2023")).rejects.toThrow(
        "getTmntsForYear failed: Network Error"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockPublicGet.mockRejectedValueOnce("testing 123");

      await expect(getTmntsForYear("2023")).rejects.toThrow(
        "getTmntsForYear failed: testing 123"
      );
    });
  });

  describe("getUpcomingTmnts - non standard throw cases", () => {
    it("should throw an error when response.data.tmnts is missing", async () => {
      mockPublicGet.mockResolvedValue({
        data: {},
      });

      await expect(getUpcomingTmnts()).rejects.toThrow(
        "getUpcomingTmnts failed: Missing upcoming tournaments data"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
      expect(mockPublicGet).toHaveBeenCalledWith(upcomingUrl, { params: {} });
    });

    it("should throw an error when response.data is null", async () => {
      mockPublicGet.mockResolvedValue({
        data: null,
      });

      await expect(getTmnts("")).rejects.toThrow(
        "getUpcomingTmnts failed: Missing upcoming tournaments data"
      );
    });

    it("should throw an error when response.data.tmnts is not an array", async () => {
      mockPublicGet.mockResolvedValue({
        data: { tmnts: "not an array" },
      });

      await expect(getUpcomingTmnts()).rejects.toThrow(
        /^getUpcomingTmnts failed: .*is not a function/
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockPublicGet.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getTmnts("")).rejects.toThrow(
        "getUpcomingTmnts failed: Network Error"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockPublicGet.mockRejectedValueOnce("testing 123");

      await expect(getUpcomingTmnts()).rejects.toThrow(
        "getUpcomingTmnts failed: testing 123"
      );
    });
  });

  describe("getTmntFullData - non standard throw cases", () => {
    it("should throw an error when response.data.tmntFullData is missing", async () => {
      mockPublicGet.mockResolvedValue({
        data: {},
      });

      await expect(getTmntFullData(tmntId)).rejects.toThrow(
        "getTmntFullData failed: Missing tmntFullData"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
      expect(mockPublicGet).toHaveBeenCalledWith(fullUrl + tmntId);
    });

    it("should throw an error when response.data is null", async () => {
      mockPublicGet.mockResolvedValue({
        data: null,
      });

      await expect(getTmntFullData(tmntId)).rejects.toThrow(
        "getTmntFullData failed: Missing tmntFullData"
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockPublicGet.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getTmntFullData(tmntId)).rejects.toThrow(
        "getTmntFullData failed: Network Error"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockPublicGet.mockRejectedValueOnce("testing 123");

      await expect(getTmntFullData(tmntId)).rejects.toThrow(
        "getTmntFullData failed: testing 123"
      );
    });

    it("should throw with a custom message if publicApi.get rejects with a 404 AxiosError", async () => {
      mockPublicGet.mockRejectedValueOnce(axiosError(404));

      await expect(getTmntFullData(tmntId)).rejects.toThrow(
        "getTmntFullData failed: Request failed with status code 404"
      );
    });

    // only the api call is in the try / catch; reading the data is not,
    // so bad data throws the plain TypeError, without "getTmntFullData failed"
    it("should throw a TypeError when response.data.tmntFullData has no bowl", async () => {
      mockPublicGet.mockResolvedValue({
        data: {
          tmntFullData: {
            id: tmntId,
            user_id: userId,
            tmnt_name: "Gold Pin",
            start_date: "2022-10-23T00:00:00.000Z",
            end_date: "2022-10-23T00:00:00.000Z",
            divs: [],
            events: [],
          },
        },
      });

      await expect(getTmntFullData(tmntId)).rejects.toThrow(TypeError);
    });
  });

  describe("replaceTmntFullData - non standard throw cases", () => {
    it("should throw an error when response.data.success is missing", async () => {
      mockPrivatePut.mockResolvedValue({
        data: {},
      });
      const toReplace = cloneDeep(mockTmntFullData);

      await expect(replaceTmntFullData(toReplace)).rejects.toThrow(
        "replaceTmntFullData failed: Error replacing full tmnt"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
      expect(mockPrivatePut).toHaveBeenCalledWith(
        fullUrl + toReplace.tmnt.id,
        JSON.stringify(toReplace)
      );
    });

    it("should throw an error when response.data is null", async () => {
      mockPrivatePut.mockResolvedValue({
        data: null,
      });

      await expect(replaceTmntFullData(cloneDeep(mockTmntFullData))).rejects.toThrow(
        "replaceTmntFullData failed: Error replacing full tmnt"
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockPrivatePut.mockRejectedValueOnce(new Error("Network Error"));

      await expect(replaceTmntFullData(cloneDeep(mockTmntFullData))).rejects.toThrow(
        "replaceTmntFullData failed: Network Error"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockPrivatePut.mockRejectedValueOnce("testing 123");

      await expect(replaceTmntFullData(cloneDeep(mockTmntFullData))).rejects.toThrow(
        "replaceTmntFullData failed: testing 123"
      );
    });

    it("should pass on the message when privateApi.put rejects with a 422 AxiosError", async () => {
      mockPrivatePut.mockRejectedValueOnce(axiosError(422));

      await expect(replaceTmntFullData(cloneDeep(mockTmntFullData))).rejects.toThrow(
        "replaceTmntFullData failed: Request failed with status code 422"
      );
    });

    it("should pass on the message when privateApi.put rejects with an AxiosError with no response", async () => {
      mockPrivatePut.mockRejectedValueOnce(
        new AxiosError("Network Error", "ERR_NETWORK")
      );

      await expect(replaceTmntFullData(cloneDeep(mockTmntFullData))).rejects.toThrow(
        "replaceTmntFullData failed: Network Error"
      );
    });
  });

  describe("replaceTmntEntriesData - non standard throw cases", () => {
    // the message prefix is replaceTmntFullEntriesData, not the function name
    it("should throw an error when response.data.success and stage are missing", async () => {
      mockPrivatePut.mockResolvedValue({
        data: {},
      });
      const toReplace = cloneDeep(mockTmntFullData);

      await expect(replaceTmntEntriesData(toReplace)).rejects.toThrow(
        "replaceTmntFullEntriesData failed: Error replacing full tmnt entries"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
      expect(mockPrivatePut).toHaveBeenCalledWith(
        fullEntriesUrl + toReplace.tmnt.id,
        expect.any(String)
      );
    });

    it("should throw an error when response.data is null", async () => {
      mockPrivatePut.mockResolvedValue({
        data: null,
      });

      await expect(replaceTmntEntriesData(cloneDeep(mockTmntFullData))).rejects.toThrow(
        "replaceTmntFullEntriesData failed: Error replacing full tmnt entries"
      );
    });

    it("should throw an error when response.data.stage is missing", async () => {
      mockPrivatePut.mockResolvedValue({
        data: { success: true },
      });

      await expect(replaceTmntEntriesData(cloneDeep(mockTmntFullData))).rejects.toThrow(
        "replaceTmntFullEntriesData failed: Error replacing full tmnt entries"
      );
    });

    it("should throw an error when response.data.success is false", async () => {
      mockPrivatePut.mockResolvedValue({
        data: { success: false, stage: mockTmntFullData.stage },
      });

      await expect(replaceTmntEntriesData(cloneDeep(mockTmntFullData))).rejects.toThrow(
        "replaceTmntFullEntriesData failed: Error replacing full tmnt entries"
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockPrivatePut.mockRejectedValueOnce(new Error("Network Error"));

      await expect(replaceTmntEntriesData(cloneDeep(mockTmntFullData))).rejects.toThrow(
        "replaceTmntFullEntriesData failed: Network Error"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockPrivatePut.mockRejectedValueOnce("testing 123");

      await expect(replaceTmntEntriesData(cloneDeep(mockTmntFullData))).rejects.toThrow(
        "replaceTmntFullEntriesData failed: testing 123"
      );
    });

    it("should pass on the message when privateApi.put rejects with a 422 AxiosError", async () => {
      mockPrivatePut.mockRejectedValueOnce(axiosError(422));

      await expect(replaceTmntEntriesData(cloneDeep(mockTmntFullData))).rejects.toThrow(
        "replaceTmntFullEntriesData failed: Request failed with status code 422"
      );
    });
  });

  describe("deleteTmnt - non standard throw cases", () => {
    it("should throw an error when response.data.count is missing", async () => {
      mockPrivateDelete.mockResolvedValue({
        data: {},
      });

      await expect(deleteTmnt(tmntId)).rejects.toThrow(
        "deleteTmnt failed: Error deleting tmnt"
      );

      expect(mockPrivateDelete).toHaveBeenCalledTimes(1);
      expect(mockPrivateDelete).toHaveBeenCalledWith(tmntUrl + tmntId);
    });

    it("should throw an error when response.data is null", async () => {
      mockPrivateDelete.mockResolvedValue({
        data: null,
      });

      await expect(deleteTmnt(tmntId)).rejects.toThrow(
        "deleteTmnt failed: Error deleting tmnt"
      );
    });

    it("should throw an error when response.data.count is not a number", async () => {
      mockPrivateDelete.mockResolvedValue({
        data: { count: "1" },
      });

      await expect(deleteTmnt(tmntId)).rejects.toThrow(
        "deleteTmnt failed: Error deleting tmnt"
      );
    });

    it("should throw with custom message if privateApi.delete rejects", async () => {
      mockPrivateDelete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteTmnt(tmntId)).rejects.toThrow(
        "deleteTmnt failed: Network Error"
      );

      expect(mockPrivateDelete).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.delete rejects with non-error", async () => {
      mockPrivateDelete.mockRejectedValueOnce("testing 123");

      await expect(deleteTmnt(tmntId)).rejects.toThrow(
        "deleteTmnt failed: testing 123"
      );
    });
  });
});
