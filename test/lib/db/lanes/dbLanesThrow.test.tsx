import { publicApi, privateApi } from "@/lib/api/axios";
import { baseLanesApi } from "@/lib/api/apiPaths";
import { testBaseLanesApi } from "../../../testApi";
import type { laneType } from "@/lib/types/types";
import {
  deleteLane,
  getAllLanesForSquad,
  getAllLanesForTmnt,
  postLane,
} from "@/lib/db/lanes/dbLanes";

jest.mock("@/lib/api/axios", () => ({
  publicApi: {
    get: jest.fn(),
  },
  privateApi: {
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const url = testBaseLanesApi.startsWith("undefined")
  ? baseLanesApi
  : testBaseLanesApi;
const laneUrl = url + "/lane/";

const laneId = "lan_255dd3b8755f4dea956445e7a3511d91";
const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";

const mockedPublicApi = publicApi as jest.Mocked<typeof publicApi>;
const mockedPrivateApi = privateApi as jest.Mocked<typeof privateApi>;

const manyLanes: laneType[] = [
  {
    id: "lan_20c24199328447f8bbe95c05e1b84601",
    lane_number: 1,
    squad_id: "sqd_20c24199328447f8bbe95c05e1b84645",
    in_use: true,
  },
  {
    id: "lan_20c24199328447f8bbe95c05e1b84602",
    lane_number: 2,
    squad_id: "sqd_20c24199328447f8bbe95c05e1b84645",
    in_use: true,
  },
];

const validLane: laneType = {
  ...manyLanes[0],
};

describe("non standard throw cases", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllLanesForSquad - non standard throw cases", () => {
    it("should return empty array when response.data has no lanes", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      });

      await expect(getAllLanesForSquad(squadId)).resolves.toEqual([]);

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(squadId)
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllLanesForSquad(squadId)).rejects.toThrow(
        "getAllLanesForSquad failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllLanesForSquad(squadId)).rejects.toThrow(
        "getAllLanesForSquad failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllLanesForTmnt - non standard throw cases", () => {
    it("should return empty array when response.data has no lanes", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      });

      await expect(getAllLanesForTmnt(tmntId)).resolves.toEqual([]);

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId)
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllLanesForTmnt(tmntId)).rejects.toThrow(
        "getAllLanesForTmnt failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllLanesForTmnt(tmntId)).rejects.toThrow(
        "getAllLanesForTmnt failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("postLane - non standard throw cases", () => {
    it("should throw an error when response.data.lane is missing", async () => {
      mockedPrivateApi.post.mockResolvedValueOnce({
        data: {},
      });

      await expect(postLane(validLane)).rejects.toThrow("Error posting lane");

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validLane)
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postLane(validLane)).rejects.toThrow(
        "postLane failed: Network Error"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce("testing 123");

      await expect(postLane(validLane)).rejects.toThrow(
        "postLane failed: testing 123"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteLane - non standard throw cases", () => {
    it("should throw an error when response.data.count is missing", async () => {
      mockedPrivateApi.delete.mockResolvedValueOnce({
        data: {},
      });

      await expect(deleteLane(laneId)).rejects.toThrow("Error deleting lane");

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(laneUrl + laneId);
    });

    it("should throw with custom message if privateApi.delete rejects", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteLane(laneId)).rejects.toThrow(
        "deleteLane failed: Network Error"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.delete rejects with non-error", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteLane(laneId)).rejects.toThrow(
        "deleteLane failed: testing 123"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });
  });
});
