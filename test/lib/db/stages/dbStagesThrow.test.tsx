import axios from "axios";
import { baseStagesApi } from "@/lib/api/apiPaths";
import { testBaseStagesApi } from "../../../testApi";
import type { justStageType, justStageOverrideType, fullStageType } from "@/lib/types/types";
import {
  getFullStageForSquad,  
  getJustStage,
  getJustStageOverride,
  postFullStage,
  patchJustStage,
  patchJustStageOverride,
  deleteFullStage,
  postInitialStageForSquad
} from "@/lib/db/stages/dbStages";
import { mockStageToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { SquadStage } from "@prisma/client";

const url = testBaseStagesApi.startsWith("undefined")
  ? baseStagesApi
  : testBaseStagesApi;
const stageUrl = url + "/stage/";

const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const stageId = "stg_c5f562c4c4304d919ac43fead73123e2";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("non standard throw cases", () => { 

  describe("getFullStageForSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getFullStageForSquad(squadId)).rejects.toThrow(
        "Unexpected status 500 when fetching stage"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(squadId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getFullStageForSquad(squadId)).rejects.toThrow(
        "getFullStageForSquad failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getFullStageForSquad(squadId)).rejects.toThrow(
        "getFullStageForSquad failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("postFullStage - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postFullStage(mockStageToPost)).rejects.toThrow(
        "Error posting stage"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(mockStageToPost),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postFullStage(mockStageToPost)).rejects.toThrow(
        "postFullStage failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postFullStage(mockStageToPost)).rejects.toThrow(
        "postFullStage failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  })

  describe("postFullStage - non standard throw cases", () => {

    const validFullStage: fullStageType = {
      id: mockStageToPost.id,
      squad_id: mockStageToPost.squad_id,
      stage: mockStageToPost.stage,
      stage_set_at: mockStageToPost.stage_set_at,
      scores_started_at: mockStageToPost.scores_started_at,
      stage_override_enabled: mockStageToPost.stage_override_enabled,
      stage_override_at: mockStageToPost.stage_override_at,
      stage_override_reason: mockStageToPost.stage_override_reason
    };

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(postFullStage(validFullStage)).rejects.toThrow("Error posting stage");

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validFullStage),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postFullStage(validFullStage)).rejects.toThrow(
        "postFullStage failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postFullStage(validFullStage)).rejects.toThrow(
        "postFullStage failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("postInitialStageForSquad - non standard throw cases", () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {

      mockedAxios.post.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(postInitialStageForSquad(squadId)).rejects.toThrow("Error posting stage");

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);

      const [calledUrl, calledBody, calledConfig] = mockedAxios.post.mock.calls[0];
      expect(calledUrl).toBe(url);
      expect(calledConfig).toEqual({ withCredentials: true });

      // calledBody is JSON.stringify(fullStage)
      const posted = JSON.parse(calledBody as string);

      expect(posted).toEqual(
        expect.objectContaining({
          squad_id: squadId,
          stage: "DEFINE", // enum serializes to string
          stage_override_enabled: false,
          stage_override_reason: "",
        })
      );

      // id is generated, just assert it looks like a stage id
      expect(posted.id).toEqual(expect.stringMatching(/^stg_/));      
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postInitialStageForSquad(squadId)).rejects.toThrow(
        "postFullStage failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postInitialStageForSquad(squadId)).rejects.toThrow(
        "postFullStage failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("patchJustStage - non standard throw cases", () => {
    
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.patch.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(patchJustStage(stageId, SquadStage.ENTRIES)).rejects.toThrow("Error patching justStage");

      expect(mockedAxios.patch).toHaveBeenCalledTimes(1);
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        stageUrl + stageId,
        JSON.stringify({id: stageId, stage: SquadStage.ENTRIES}),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.patch.mockRejectedValueOnce(new Error("Network Error"));

      await expect(patchJustStage(stageId, SquadStage.ENTRIES)).rejects.toThrow(
        "patchJustStage failed: Network Error"
      );

      expect(mockedAxios.patch).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.patch.mockRejectedValueOnce("testing 123");

      await expect(patchJustStage(stageId, SquadStage.ENTRIES)).rejects.toThrow(
        "patchJustStage failed: testing 123"
      );

      expect(mockedAxios.patch).toHaveBeenCalledTimes(1);
    });
  });

  describe("patchJustStageOverride - non standard throw cases", () => {
    
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.patch.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(patchJustStageOverride(stageId, true, 'testing')).rejects.toThrow("Error patching justStage");

      expect(mockedAxios.patch).toHaveBeenCalledTimes(1);
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        stageUrl + stageId,
        JSON.stringify({
          id: stageId,
          stage_override_enabled: true,
          stage_override_reason: 'testing'            
        }),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.patch.mockRejectedValueOnce(new Error("Network Error"));

      await expect(patchJustStageOverride(stageId, true, 'testing')).rejects.toThrow(
        "patchJustStageOverride failed: Network Error"
      );

      expect(mockedAxios.patch).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.patch.mockRejectedValueOnce("testing 123");

      await expect(patchJustStageOverride(stageId, true, 'testing')).rejects.toThrow(
        "patchJustStageOverride failed: testing 123"
      );

      expect(mockedAxios.patch).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteFullStage - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteFullStage(stageId)).rejects.toThrow(
        "Error deleting stage"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(stageUrl + stageId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteFullStage(stageId)).rejects.toThrow(
        "deleteFullStage failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteFullStage(stageId)).rejects.toThrow(
        "deleteFullStage failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

})