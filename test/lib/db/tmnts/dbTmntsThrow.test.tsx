import { publicApi, privateApi } from "@/lib/api/axios";
import { baseTmntsApi } from "@/lib/api/apiPaths";
import { testBaseTmntsApi } from "../../../testApi";
import type { tmntFullType, tmntType } from "@/lib/types/types";
import { blankTmnt } from "@/lib/db/initVals";
import {
  getTmnt,
  getTmntYears,
  getUserTmnts,
  exportedForTesting,
  getTmntFullData,
  postTmnt,
  putTmnt,
  deleteTmnt,
  replaceTmntFullData,
  replaceTmntEntriesData,
} from "@/lib/db/tmnts/dbTmnts";
import { mockTmntFullData } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

const { getTmntsForYear, getUpcomingTmnts } = exportedForTesting;

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseTmntsApi
  ? testBaseTmntsApi
  : baseTmntsApi;

const tmntUrl = url + "/tmnt/";

jest.mock("@/lib/api/axios", () => ({
  publicApi: {
    get: jest.fn(),
  },
  privateApi: {
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedPublicApi = publicApi as jest.Mocked<typeof publicApi>;
const mockedPrivateApi = privateApi as jest.Mocked<typeof privateApi>;

const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";

const validTmnt: tmntType = {
  ...blankTmnt,
  id: "tmt_1234387c33d9c78aba290286576ddce5",
  user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
  tmnt_name: "Test Tournament",
  bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
  start_date_str: "2025-01-31",
  end_date_str: "2025-01-31",
};

describe("non standard throw cases", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getTmnt - non standard throw cases", () => {
    it("should throw an error when response.data.tmnt is missing", async () => {
      mockedPublicApi.get.mockResolvedValue({
        data: {},
      } as any);

      await expect(getTmnt(tmntId)).rejects.toThrow(
        "getTmnt failed: Missing tmnt data",
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId),
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getTmnt(tmntId)).rejects.toThrow(
        "getTmnt failed: Network Error",
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getTmnt(tmntId)).rejects.toThrow(
        "getTmnt failed: testing 123",
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getUserTmnts - non standard throw cases", () => {
    it("should throw an error when response.data.tmnts is missing", async () => {
      mockedPublicApi.get.mockResolvedValue({
        data: {},
      } as any);

      await expect(getUserTmnts(userId)).rejects.toThrow(
        "getUserTmnts failed: Missing tmnts data",
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(userId),
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getUserTmnts(userId)).rejects.toThrow(
        "getUserTmnts failed: Network Error",
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getUserTmnts(userId)).rejects.toThrow(
        "getUserTmnts failed: testing 123",
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getTmntYears - non standard throw cases", () => {
    it("should throw an error when response.data.years is missing", async () => {
      mockedPublicApi.get.mockResolvedValue({
        data: {},
      } as any);

      await expect(getTmntYears()).rejects.toThrow(
        "getTmntYears failed: Missing years data",
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining("years"),
      );
    });

    it("should reject if publicApi.get rejects with Error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getTmntYears()).rejects.toThrow("Network Error");

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should reject if publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getTmntYears()).rejects.toBe("testing 123");

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getTmntsForYear - non standard throw cases", () => {
    it("should throw an error when year is invalid", async () => {
      await expect(getTmntsForYear("abcd")).rejects.toThrow("Invalid year");
      expect(mockedPublicApi.get).not.toHaveBeenCalled();
    });

    it("should throw an error when response.data.tmnts is missing", async () => {
      mockedPublicApi.get.mockResolvedValue({
        data: {},
      } as any);

      await expect(getTmntsForYear("2024")).rejects.toThrow(
        "getTmntsForYear failed: Missing tournaments data for year 2024",
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining("2024"),
        expect.objectContaining({ params: {} }),
      );
    });

    it("should throw if publicApi.get rejects with Error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getTmntsForYear("2024")).rejects.toThrow(
        "getTmntsForYear failed: Network Error",
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw if publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getTmntsForYear("2024")).rejects.toThrow(
        "getTmntsForYear failed: testing 123",
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getUpcomingTmnts - non standard throw cases", () => {
    it("should throw an error when response.data.tmnts is missing", async () => {
      mockedPublicApi.get.mockResolvedValue({
        data: {},
      } as any);

      await expect(getUpcomingTmnts()).rejects.toThrow(
        "getUpcomingTmnts failed: Missing upcoming tournaments data",
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining("upcoming"),
        expect.objectContaining({ params: {} }),
      );
    });

    it("should throw if publicApi.get rejects with Error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getUpcomingTmnts()).rejects.toThrow(
        "getUpcomingTmnts failed: Network Error",
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw if publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getUpcomingTmnts()).rejects.toThrow(
        "getUpcomingTmnts failed: testing 123",
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getTmntFullData - non standard throw cases", () => {
    it("should throw an error when response.data.tmntFullData is missing", async () => {
      mockedPublicApi.get.mockResolvedValue({
        data: {},
      } as any);

      await expect(getTmntFullData(tmntId)).rejects.toThrow(
        "getTmntFullData failed: Missing tmntFullData",
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId),
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getTmntFullData(tmntId)).rejects.toThrow(
        "getTmntFullData failed: Network Error",
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getTmntFullData(tmntId)).rejects.toThrow(
        "getTmntFullData failed: testing 123",
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("postTmnt - non standard throw cases", () => {
    it("should throw an error when response.data.tmnt is missing", async () => {
      mockedPrivateApi.post.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(postTmnt(validTmnt)).rejects.toThrow("postTmnt failed: Error posting tmnt");

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validTmnt),
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postTmnt(validTmnt)).rejects.toThrow(
        "postTmnt failed: Network Error",
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce("testing 123");

      await expect(postTmnt(validTmnt)).rejects.toThrow(
        "postTmnt failed: testing 123",
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("putTmnt - non standard throw cases", () => {
    it("should throw an error when response.data.tmnt is missing", async () => {
      mockedPrivateApi.put.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(putTmnt(validTmnt)).rejects.toThrow("putTmnt failed: Error putting tmnt");

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        tmntUrl + validTmnt.id,
        JSON.stringify(validTmnt),
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putTmnt(validTmnt)).rejects.toThrow(
        "putTmnt failed: Network Error",
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce("testing 123");

      await expect(putTmnt(validTmnt)).rejects.toThrow(
        "putTmnt failed: testing 123",
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("replaceTmntFullData - non standard throw cases", () => {
    const validFullTmnt: tmntFullType = mockTmntFullData;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should throw when privateApi.put rejects", async () => {
      mockedPrivateApi.put.mockRejectedValue(new Error("network fail"));

      await expect(replaceTmntFullData(validFullTmnt)).rejects.toThrow(
        "replaceTmntFullData failed: network fail",
      );
    });

    it("should throw when response.data.success is missing", async () => {
      mockedPrivateApi.put.mockResolvedValue({ data: {} } as any);

      await expect(replaceTmntFullData(validFullTmnt)).rejects.toThrow(
        "replaceTmntFullData failed: Error replacing full tmnt",
      );
    });

    it("should throw when response.data.success !== true", async () => {
      mockedPrivateApi.put.mockResolvedValue({
        data: { success: false },
      } as any);

      await expect(replaceTmntFullData(validFullTmnt)).rejects.toThrow(
        "replaceTmntFullData failed: Error replacing full tmnt",
      );
    });
  });

  describe("replaceTmntFullEntriesData - non standard throw cases", () => {
    const validFullTmnt: tmntFullType = mockTmntFullData;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should throw when privateApi.put rejects", async () => {
      mockedPrivateApi.put.mockRejectedValue(new Error("network fail"));

      await expect(replaceTmntEntriesData(validFullTmnt)).rejects.toThrow(
        "replaceTmntFullEntriesData failed: network fail",
      );
    });

    it("should throw when response.data.success is missing", async () => {
      mockedPrivateApi.put.mockResolvedValue({ data: {} } as any);

      await expect(replaceTmntEntriesData(validFullTmnt)).rejects.toThrow(
        "replaceTmntFullEntriesData failed: Error replacing full tmnt entries",
      );
    });

    it("should throw when response.data.success !== true", async () => {
      mockedPrivateApi.put.mockResolvedValue({
        data: { success: false },
      } as any);

      await expect(replaceTmntEntriesData(validFullTmnt)).rejects.toThrow(
        "replaceTmntFullEntriesData failed: Error replacing full tmnt entries",
      );
    });

    it("should throw when response.data.stage is missing", async () => {
      mockedPrivateApi.put.mockResolvedValue({
        data: { success: true },
      } as any);

      await expect(replaceTmntEntriesData(validFullTmnt)).rejects.toThrow(
        "replaceTmntFullEntriesData failed: Error replacing full tmnt entries",
      );
    });
  });

  describe("deleteTmnt - non standard throw cases", () => {
    it("should throw an error when response.data.count is missing", async () => {
      mockedPrivateApi.delete.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(deleteTmnt(tmntId)).rejects.toThrow(
        "deleteTmnt failed: Error deleting tmnt",
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(tmntUrl + tmntId);
    });

    it("should throw with custom message if privateApi.delete rejects", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteTmnt(tmntId)).rejects.toThrow(
        "deleteTmnt failed: Network Error",
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.delete rejects with non-error", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteTmnt(tmntId)).rejects.toThrow(
        "deleteTmnt failed: testing 123",
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });
  });
});