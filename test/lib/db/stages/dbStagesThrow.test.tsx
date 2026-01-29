import axios from "axios";
import { baseStagesApi } from "@/lib/db/apiPaths";
import { testBaseStagesApi } from "../../../testApi";
import {  
  justStageType,
  justStageOverrideType,
} from "@/lib/types/types";
import {
  getFullStage,
  postFullStage,
  putJustStage,
  putJustStageOverride,
  deleteFullStage,
} from "@/lib/db/stages/dbStages";
import { mockStageToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";


const url = testBaseStagesApi.startsWith("undefined")
  ? baseStagesApi
  : testBaseStagesApi;
const stageUrl = url + "/stage/";

const stageId = "stg_c5f562c4c4304d919ac43fead73123e2"

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("non standard throw cases", () => { 

  describe('getFullStage - non standard throw cases', () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });
  
    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getFullStage(stageId)).rejects.toThrow(
        "Unexpected status 500 when fetching stage"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(stageId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getFullStage(stageId)).rejects.toThrow(
        "getFullStage failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getFullStage(stageId)).rejects.toThrow(
        "getFullStage failed: testing 123"
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

  describe("putJustStage - non standard throw cases", () => {

    const validJustStage: justStageType = {
      id: mockStageToPost.id,
      squad_id: mockStageToPost.squad_id,
      stage: mockStageToPost.stage,
      stage_set_at: mockStageToPost.stage_set_at,
      scores_started_at: mockStageToPost.scores_started_at,
    };

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.put.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(putJustStage(validJustStage)).rejects.toThrow("Error putting justStage");

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
      expect(mockedAxios.put).toHaveBeenCalledWith(
        stageUrl + validJustStage.id,
        JSON.stringify(validJustStage),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putJustStage(validJustStage)).rejects.toThrow(
        "putJustStage failed: Network Error"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.put.mockRejectedValueOnce("testing 123");

      await expect(putJustStage(validJustStage)).rejects.toThrow(
        "putJustStage failed: testing 123"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("putJustStageOverride - non standard throw cases", () => {

    const validJustStageOverride: justStageOverrideType = {
      id: mockStageToPost.id,
      squad_id: mockStageToPost.squad_id,
      stage_override_enabled: true,
      stage_override_at: new Date(),
      stage_override_reason: "testing",
    };    

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.put.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(putJustStageOverride(validJustStageOverride)).rejects.toThrow("Error putting justStage");

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
      expect(mockedAxios.put).toHaveBeenCalledWith(
        stageUrl + validJustStageOverride.id,
        JSON.stringify(validJustStageOverride),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putJustStageOverride(validJustStageOverride)).rejects.toThrow(
        "putJustStageOverride failed: Network Error"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.put.mockRejectedValueOnce("testing 123");

      await expect(putJustStageOverride(validJustStageOverride)).rejects.toThrow(
        "putJustStageOverride failed: testing 123"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
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