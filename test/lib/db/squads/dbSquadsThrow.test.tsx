import { publicApi, privateApi } from "@/lib/api/axios";
import { baseSquadsApi } from "@/lib/api/apiPaths";
import { testBaseSquadsApi } from "../../../testApi";
import type { squadType } from "@/lib/types/types";
import { blankSquad } from "@/lib/db/initVals";
import {
  deleteSquad,
  getAllOneBrktsAndSeedsForSquad,
  getAllSquadsForTmnt,
  postSquad,
  putSquad,
} from "@/lib/db/squads/dbSquads";

const url = testBaseSquadsApi.startsWith("undefined")
  ? baseSquadsApi
  : testBaseSquadsApi;
const squadUrl = url + "/squad/";
const withSeedsUrl = url + "/withSeeds/";
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

const squadId = "sqd_3397da1adc014cf58c44e07c19914f71";
const tmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";

const manySquads: squadType[] = [
  {
    ...blankSquad,
    id: "sqd_20c24199328447f8bbe95c05e1b84645",
    squad_name: "Test 1",
    event_id: "evt_bd63777a6aee43be8372e4d008c1d6d0",
    squad_date_str: "2022-08-01",
    squad_time: "10:00 AM",
    games: 6,
    lane_count: 10,
    starting_lane: 11,
    sort_order: 1,
  },
  {
    ...blankSquad,
    id: "sqd_20c24199328447f8bbe95c05e1b84646",
    squad_name: "Test 2",
    event_id: "evt_bd63777a6aee43be8372e4d008c1d6d0",
    squad_date_str: "2022-08-01",
    squad_time: "03:00 PM",
    games: 6,
    lane_count: 12,
    starting_lane: 1,
    sort_order: 2,
  },
];

const validSquad: squadType = {
  ...manySquads[0],
};

describe("non standard throw cases", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllSquadsForTmnt - non standard throw cases", () => {
    it("should throw an error when response.data.squads is missing", async () => {
      mockedPublicApi.get.mockResolvedValue({
        data: {},
      });

      await expect(getAllSquadsForTmnt(tmntId)).rejects.toThrow(
        "getAllSquadsForTmnt failed: Error fetching squads"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(tmntUrl + tmntId);
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllSquadsForTmnt(tmntId)).rejects.toThrow(
        "getAllSquadsForTmnt failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(tmntUrl + tmntId);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllSquadsForTmnt(tmntId)).rejects.toThrow(
        "getAllSquadsForTmnt failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(tmntUrl + tmntId);
    });
  });

  describe("getAllOneBrktsAndSeedsForSquad - non standard throw cases", () => {
    it("should throw an error when response.data.oneBrktsAndSeeds is missing", async () => {
      mockedPublicApi.get.mockResolvedValue({
        data: {},
      });

      await expect(getAllOneBrktsAndSeedsForSquad(squadId)).rejects.toThrow(
        "getAllOneBrktsAndSeedsForSquad failed: Error fetching oneBrkts and seeds"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(withSeedsUrl + squadId);
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllOneBrktsAndSeedsForSquad(squadId)).rejects.toThrow(
        "getAllOneBrktsAndSeedsForSquad failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(withSeedsUrl + squadId);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllOneBrktsAndSeedsForSquad(squadId)).rejects.toThrow(
        "getAllOneBrktsAndSeedsForSquad failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(withSeedsUrl + squadId);
    });
  });

  describe("postSquad - non standard throw cases", () => {
    it("should throw an error when response.data.squad is missing", async () => {
      mockedPrivateApi.post.mockResolvedValueOnce({
        data: {},
      });

      await expect(postSquad(validSquad)).rejects.toThrow(
        "postSquad failed: Error posting squad"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validSquad)
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postSquad(validSquad)).rejects.toThrow(
        "postSquad failed: Network Error"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validSquad)
      );
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce("testing 123");

      await expect(postSquad(validSquad)).rejects.toThrow(
        "postSquad failed: testing 123"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validSquad)
      );
    });
  });

  describe("putSquad - non standard throw cases", () => {
    it("should throw an error when response.data.squad is missing", async () => {
      mockedPrivateApi.put.mockResolvedValueOnce({
        data: {},
      });

      await expect(putSquad(validSquad)).rejects.toThrow(
        "putSquad failed: Error putting squad"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        squadUrl + validSquad.id,
        JSON.stringify(validSquad)
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putSquad(validSquad)).rejects.toThrow(
        "putSquad failed: Network Error"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        squadUrl + validSquad.id,
        JSON.stringify(validSquad)
      );
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce("testing 123");

      await expect(putSquad(validSquad)).rejects.toThrow(
        "putSquad failed: testing 123"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        squadUrl + validSquad.id,
        JSON.stringify(validSquad)
      );
    });
  });

  describe("deleteSquad - non standard throw cases", () => {
    it("should throw an error when response.data.count is missing", async () => {
      mockedPrivateApi.delete.mockResolvedValueOnce({
        data: {},
      });

      await expect(deleteSquad(squadId)).rejects.toThrow(
        "deleteSquad failed: Error deleting squad"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(squadUrl + squadId);
    });

    it("should throw with custom message if privateApi.delete rejects", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteSquad(squadId)).rejects.toThrow(
        "deleteSquad failed: Network Error"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(squadUrl + squadId);
    });

    it("should throw an error when privateApi.delete rejects with non-error", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteSquad(squadId)).rejects.toThrow(
        "deleteSquad failed: testing 123"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(squadUrl + squadId);
    });
  });
});
