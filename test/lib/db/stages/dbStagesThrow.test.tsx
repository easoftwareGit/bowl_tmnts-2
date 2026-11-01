import { AxiosError, AxiosHeaders } from "axios";
import { publicApi, privateApi } from "@/lib/api/axios";
import { baseStagesApi } from "@/lib/api/apiPaths";
import { testBaseStagesApi } from "../../../testApi";
import type { fullStageType } from "@/lib/types/types";
import {
  getFullStageForSquad,
  getJustStage,
  getJustStageOverride,
  postFullStage,
  postInitialStageForSquad,
  patchJustStage,
  patchJustStageOverride,
} from "@/lib/db/stages/dbStages";
import { SquadStage } from "@prisma/client";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  publicApi: {
    get: jest.fn(),
  },
  privateApi: {
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockPublicGet = publicApi.get as jest.Mock;
const mockPrivatePost = privateApi.post as jest.Mock;
const mockPrivatePatch = privateApi.patch as jest.Mock;

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseStagesApi
  ? testBaseStagesApi
  : baseStagesApi;

const stageUrl = url + "/stage/";
const squadUrl = url + "/squad/";

const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const stageId = "stg_c5f562c4c4304d919ac43fead73123e2";

const testStage: fullStageType = {
  id: stageId,
  squad_id: squadId,
  stage: "DEFINE",
  stage_set_at: "2022-10-23T12:00:00.000Z",
  scores_started_at: null,
  stage_override_enabled: false,
  stage_override_at: null,
  stage_override_reason: "",
};

// a real AxiosError, so `err instanceof AxiosError` in dbStages is true
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

// looks like an AxiosError, but is not an instance of it
const fakeAxiosError = (status: number) =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    name: "AxiosError",
    isAxiosError: true,
    response: { status, data: {} },
  });

describe("non standard throw cases", () => {
  beforeEach(() => {
    // mockReset also clears mockResolvedValue implementations,
    // clearAllMocks only clears the call history
    mockPublicGet.mockReset();
    mockPrivatePost.mockReset();
    mockPrivatePatch.mockReset();
  });

  describe("getFullStageForSquad - non standard throw cases", () => {
    it("should throw an error when response.data.stage is missing", async () => {
      mockPublicGet.mockResolvedValue({
        data: {},
      });

      await expect(getFullStageForSquad(squadId)).rejects.toThrow(
        "getFullStageForSquad failed: Error fetching stage"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
      expect(mockPublicGet).toHaveBeenCalledWith(squadUrl + squadId);
    });

    it("should throw an error when response.data.stage is null", async () => {
      mockPublicGet.mockResolvedValue({
        data: { stage: null },
      });

      await expect(getFullStageForSquad(squadId)).rejects.toThrow(
        "getFullStageForSquad failed: Error fetching stage"
      );
    });

    it("should throw an error when response.data is null", async () => {
      mockPublicGet.mockResolvedValue({
        data: null,
      });

      await expect(getFullStageForSquad(squadId)).rejects.toThrow(
        "getFullStageForSquad failed: Error fetching stage"
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockPublicGet.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getFullStageForSquad(squadId)).rejects.toThrow(
        "getFullStageForSquad failed: Network Error"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockPublicGet.mockRejectedValueOnce("testing 123");

      await expect(getFullStageForSquad(squadId)).rejects.toThrow(
        "getFullStageForSquad failed: testing 123"
      );
    });
  });

  describe("getJustStage - non standard throw cases", () => {
    it("should throw an error when response.data.stage is missing", async () => {
      mockPublicGet.mockResolvedValue({
        data: {},
      });

      await expect(getJustStage(squadId)).rejects.toThrow(
        "getJustStage failed: getFullStageForSquad failed: Error fetching stage"
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockPublicGet.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getJustStage(squadId)).rejects.toThrow(
        "getJustStage failed: getFullStageForSquad failed: Network Error"
      );
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockPublicGet.mockRejectedValueOnce("testing 123");

      await expect(getJustStage(squadId)).rejects.toThrow(
        "getJustStage failed: getFullStageForSquad failed: testing 123"
      );
    });
  });

  describe("getJustStageOverride - non standard throw cases", () => {
    it("should throw an error when response.data.stage is missing", async () => {
      mockPublicGet.mockResolvedValue({
        data: {},
      });

      await expect(getJustStageOverride(squadId)).rejects.toThrow(
        "getJustStageOverride failed: getFullStageForSquad failed: Error fetching stage"
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockPublicGet.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getJustStageOverride(squadId)).rejects.toThrow(
        "getJustStageOverride failed: getFullStageForSquad failed: Network Error"
      );
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockPublicGet.mockRejectedValueOnce("testing 123");

      await expect(getJustStageOverride(squadId)).rejects.toThrow(
        "getJustStageOverride failed: getFullStageForSquad failed: testing 123"
      );
    });
  });

  describe("postFullStage - non standard throw cases", () => {
    it("should throw an error when response.data.stage is missing", async () => {
      mockPrivatePost.mockResolvedValue({
        data: {},
      });

      await expect(postFullStage(testStage)).rejects.toThrow(
        "postFullStage failed: Error posting stage"
      );

      expect(mockPrivatePost).toHaveBeenCalledTimes(1);
      expect(mockPrivatePost).toHaveBeenCalledWith(url, JSON.stringify(testStage));
    });

    it("should throw an error when response.data is null", async () => {
      mockPrivatePost.mockResolvedValue({
        data: null,
      });

      await expect(postFullStage(testStage)).rejects.toThrow(
        "postFullStage failed: Error posting stage"
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockPrivatePost.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postFullStage(testStage)).rejects.toThrow(
        "postFullStage failed: Network Error"
      );

      expect(mockPrivatePost).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockPrivatePost.mockRejectedValueOnce("testing 123");

      await expect(postFullStage(testStage)).rejects.toThrow(
        "postFullStage failed: testing 123"
      );
    });

    it("should throw 'Invalid stage data' when privateApi.post rejects with a 422 AxiosError", async () => {
      mockPrivatePost.mockRejectedValueOnce(axiosError(422));

      await expect(postFullStage(testStage)).rejects.toThrow(
        new Error("Invalid stage data")
      );
    });

    it("should pass on the message when privateApi.post rejects with a non 422 AxiosError", async () => {
      mockPrivatePost.mockRejectedValueOnce(axiosError(400));

      await expect(postFullStage(testStage)).rejects.toThrow(
        new Error("postFullStage failed: Request failed with status code 400")
      );
    });

    it("should pass on the message when privateApi.post rejects with an AxiosError with no response", async () => {
      mockPrivatePost.mockRejectedValueOnce(
        new AxiosError("Network Error", "ERR_NETWORK")
      );

      await expect(postFullStage(testStage)).rejects.toThrow(
        new Error("postFullStage failed: Network Error")
      );
    });

    it("should NOT treat a 422 that is not an AxiosError instance as invalid data", async () => {
      mockPrivatePost.mockRejectedValueOnce(fakeAxiosError(422));

      await expect(postFullStage(testStage)).rejects.toThrow(
        new Error("postFullStage failed: Request failed with status code 422")
      );
    });
  });

  describe("postInitialStageForSquad - non standard throw cases", () => {
    it("should throw an error when response.data.stage is missing", async () => {
      mockPrivatePost.mockResolvedValue({
        data: {},
      });

      await expect(postInitialStageForSquad(squadId)).rejects.toThrow(
        "postFullStage failed: Error posting stage"
      );

      expect(mockPrivatePost).toHaveBeenCalledTimes(1);
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockPrivatePost.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postInitialStageForSquad(squadId)).rejects.toThrow(
        "postFullStage failed: Network Error"
      );
    });

    it("should throw 'Invalid stage data' when privateApi.post rejects with a 422 AxiosError", async () => {
      mockPrivatePost.mockRejectedValueOnce(axiosError(422));

      await expect(postInitialStageForSquad(squadId)).rejects.toThrow(
        new Error("Invalid stage data")
      );
    });
  });

  describe("patchJustStage - non standard throw cases", () => {
    it("should throw an error when response.data.stage is missing", async () => {
      mockPrivatePatch.mockResolvedValue({
        data: {},
      });

      await expect(patchJustStage(stageId, SquadStage.ENTRIES)).rejects.toThrow(
        "patchJustStage failed: Error patching justStage"
      );

      expect(mockPrivatePatch).toHaveBeenCalledTimes(1);
      expect(mockPrivatePatch).toHaveBeenCalledWith(
        stageUrl + stageId,
        JSON.stringify({ id: stageId, stage: SquadStage.ENTRIES })
      );
    });

    it("should throw an error when response.data is null", async () => {
      mockPrivatePatch.mockResolvedValue({
        data: null,
      });

      await expect(patchJustStage(stageId, SquadStage.ENTRIES)).rejects.toThrow(
        "patchJustStage failed: Error patching justStage"
      );
    });

    it("should throw with custom message if privateApi.patch rejects", async () => {
      mockPrivatePatch.mockRejectedValueOnce(new Error("Network Error"));

      await expect(patchJustStage(stageId, SquadStage.ENTRIES)).rejects.toThrow(
        "patchJustStage failed: Network Error"
      );
    });

    it("should throw an error when privateApi.patch rejects with non-error", async () => {
      mockPrivatePatch.mockRejectedValueOnce("testing 123");

      await expect(patchJustStage(stageId, SquadStage.ENTRIES)).rejects.toThrow(
        "patchJustStage failed: testing 123"
      );
    });

    it("should throw 'Invalid justStage data' when privateApi.patch rejects with a 422 AxiosError", async () => {
      mockPrivatePatch.mockRejectedValueOnce(axiosError(422));

      await expect(patchJustStage(stageId, SquadStage.ENTRIES)).rejects.toThrow(
        new Error("Invalid justStage data")
      );
    });

    it("should pass on the message when privateApi.patch rejects with a non 422 AxiosError", async () => {
      mockPrivatePatch.mockRejectedValueOnce(axiosError(404));

      await expect(patchJustStage(stageId, SquadStage.ENTRIES)).rejects.toThrow(
        new Error("patchJustStage failed: Request failed with status code 404")
      );
    });
  });

  describe("patchJustStageOverride - non standard throw cases", () => {
    const reason = "test reason";

    it("should throw an error when response.data.stage is missing", async () => {
      mockPrivatePatch.mockResolvedValue({
        data: {},
      });

      await expect(patchJustStageOverride(stageId, true, reason)).rejects.toThrow(
        "patchJustStageOverride failed: Error patching justStageOverride"
      );

      expect(mockPrivatePatch).toHaveBeenCalledTimes(1);
      expect(mockPrivatePatch).toHaveBeenCalledWith(
        stageUrl + stageId,
        JSON.stringify({
          id: stageId,
          stage_override_enabled: true,
          stage_override_reason: reason,
        })
      );
    });

    it("should throw an error when response.data is null", async () => {
      mockPrivatePatch.mockResolvedValue({
        data: null,
      });

      await expect(patchJustStageOverride(stageId, true, reason)).rejects.toThrow(
        "patchJustStageOverride failed: Error patching justStageOverride"
      );
    });

    it("should throw with custom message if privateApi.patch rejects", async () => {
      mockPrivatePatch.mockRejectedValueOnce(new Error("Network Error"));

      await expect(patchJustStageOverride(stageId, true, reason)).rejects.toThrow(
        "patchJustStageOverride failed: Network Error"
      );
    });

    it("should throw an error when privateApi.patch rejects with non-error", async () => {
      mockPrivatePatch.mockRejectedValueOnce("testing 123");

      await expect(patchJustStageOverride(stageId, true, reason)).rejects.toThrow(
        "patchJustStageOverride failed: testing 123"
      );
    });

    it("should throw 'Invalid justStageOverride data' when privateApi.patch rejects with a 422 AxiosError", async () => {
      mockPrivatePatch.mockRejectedValueOnce(axiosError(422));

      await expect(patchJustStageOverride(stageId, true, reason)).rejects.toThrow(
        new Error("Invalid justStageOverride data")
      );
    });

    it("should pass on the message when privateApi.patch rejects with a non 422 AxiosError", async () => {
      mockPrivatePatch.mockRejectedValueOnce(axiosError(404));

      await expect(patchJustStageOverride(stageId, true, reason)).rejects.toThrow(
        new Error("patchJustStageOverride failed: Request failed with status code 404")
      );
    });
  });
});
