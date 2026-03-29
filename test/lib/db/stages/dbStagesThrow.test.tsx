import { publicApi, privateApi } from "@/lib/api/axios";
import { baseStagesApi } from "@/lib/api/apiPaths";
import { testBaseStagesApi } from "../../../testApi";
import type { fullStageType } from "@/lib/types/types";
import {
  getFullStageForSquad,
  getJustStage,
  getJustStageOverride,
  postFullStage,
  patchJustStage,
  patchJustStageOverride,
  deleteFullStage,
  postInitialStageForSquad,
} from "@/lib/db/stages/dbStages";
import { mockStageToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { SquadStage } from "@prisma/client";

jest.mock("@/lib/api/axios", () => ({
  publicApi: {
    get: jest.fn(),
  },
  privateApi: {
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedPublicApi = publicApi as jest.Mocked<typeof publicApi>;
const mockedPrivateApi = privateApi as jest.Mocked<typeof privateApi>;

const rawUrl = testBaseStagesApi.startsWith("undefined")
  ? baseStagesApi
  : testBaseStagesApi;

const normalizeApiPath = (path: string): string => {
  if (path.startsWith("/api/")) return path.replace(/^\/api/, "");
  if (path === "/api") return "/";
  return path;
};

const url = normalizeApiPath(rawUrl);
const stageUrl = `${url}/stage/`;

const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const stageId = "stg_c5f562c4c4304d919ac43fead73123e2";

describe("non standard throw cases", () => {
  // describe("getFullStageForSquad - non standard throw cases", () => {
  //   afterEach(() => {
  //     jest.restoreAllMocks();
  //     jest.clearAllMocks();
  //   });

  //   it("should return null when response.data.stage is missing", async () => {
  //     mockedPublicApi.get.mockResolvedValueOnce({
  //       data: {},
  //     } as any);

  //     await expect(getFullStageForSquad(squadId)).resolves.toBeNull();

  //     expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
  //     expect(mockedPublicApi.get).toHaveBeenCalledWith(
  //       expect.stringContaining(squadId)
  //     );
  //   });

  //   it("should throw with custom message if publicApi.get rejects", async () => {
  //     mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

  //     await expect(getFullStageForSquad(squadId)).rejects.toThrow(
  //       "getFullStageForSquad failed: Network Error"
  //     );

  //     expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
  //   });

  //   it("should throw an error when publicApi.get rejects with non-error", async () => {
  //     mockedPublicApi.get.mockRejectedValueOnce("testing 123");

  //     await expect(getFullStageForSquad(squadId)).rejects.toThrow(
  //       "getFullStageForSquad failed: testing 123"
  //     );

  //     expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
  //   });
  // });

  describe("getFullStageForSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw when response.data.stage is missing", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(getFullStageForSquad(squadId)).rejects.toThrow(
        "getFullStageForSquad failed: Error fetching stage"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(squadId)
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getFullStageForSquad(squadId)).rejects.toThrow(
        "getFullStageForSquad failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getFullStageForSquad(squadId)).rejects.toThrow(
        "getFullStageForSquad failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getJustStage - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should return null when response.data.stage is missing", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      } as any);
      
      await expect(getJustStage(squadId)).rejects.toThrow(
        "getJustStage failed: getFullStageForSquad failed: Error fetching stage"
      );      

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(squadId)
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getJustStage(squadId)).rejects.toThrow(
        "getJustStage failed: getFullStageForSquad failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getJustStage(squadId)).rejects.toThrow(
        "getJustStage failed: getFullStageForSquad failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getJustStageOverride - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should return null when response.data.stage is missing", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(getJustStageOverride(squadId)).rejects.toThrow(
        "getJustStageOverride failed: getFullStageForSquad failed: Error fetching stage"
      );      

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(squadId)
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getJustStageOverride(squadId)).rejects.toThrow(
        "getJustStageOverride failed: getFullStageForSquad failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getJustStageOverride(squadId)).rejects.toThrow(
        "getJustStageOverride failed: getFullStageForSquad failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("postFullStage - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.data.stage is missing", async () => {
      mockedPrivateApi.post.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(postFullStage(mockStageToPost)).rejects.toThrow(
        "postFullStage failed: Error posting stage"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(mockStageToPost)
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postFullStage(mockStageToPost)).rejects.toThrow(
        "postFullStage failed: Network Error"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce("testing 123");

      await expect(postFullStage(mockStageToPost)).rejects.toThrow(
        "postFullStage failed: testing 123"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("postFullStage with validFullStage - non standard throw cases", () => {
    const validFullStage: fullStageType = {
      id: mockStageToPost.id,
      squad_id: mockStageToPost.squad_id,
      stage: mockStageToPost.stage,
      stage_set_at: mockStageToPost.stage_set_at,
      scores_started_at: mockStageToPost.scores_started_at,
      stage_override_enabled: mockStageToPost.stage_override_enabled,
      stage_override_at: mockStageToPost.stage_override_at,
      stage_override_reason: mockStageToPost.stage_override_reason,
    };

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.data.stage is missing", async () => {
      mockedPrivateApi.post.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(postFullStage(validFullStage)).rejects.toThrow(
        "postFullStage failed: Error posting stage"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validFullStage)
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postFullStage(validFullStage)).rejects.toThrow(
        "postFullStage failed: Network Error"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce("testing 123");

      await expect(postFullStage(validFullStage)).rejects.toThrow(
        "postFullStage failed: testing 123"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("postInitialStageForSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.data.stage is missing", async () => {
      mockedPrivateApi.post.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(postInitialStageForSquad(squadId)).rejects.toThrow(
        "postFullStage failed: Error posting stage"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);

      const [calledUrl, calledBody] = mockedPrivateApi.post.mock.calls[0];
      expect(calledUrl).toBe(url);

      const posted = JSON.parse(calledBody as string);

      expect(posted).toEqual(
        expect.objectContaining({
          squad_id: squadId,
          stage: "DEFINE",
          stage_override_enabled: false,
          stage_override_reason: "",
        })
      );

      expect(posted.id).toEqual(expect.stringMatching(/^stg_/));
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postInitialStageForSquad(squadId)).rejects.toThrow(
        "postFullStage failed: Network Error"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce("testing 123");

      await expect(postInitialStageForSquad(squadId)).rejects.toThrow(
        "postFullStage failed: testing 123"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("patchJustStage - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.data.stage is missing", async () => {
      mockedPrivateApi.patch.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(
        patchJustStage(stageId, SquadStage.ENTRIES)
      ).rejects.toThrow("patchJustStage failed: Error patching justStage");

      expect(mockedPrivateApi.patch).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.patch).toHaveBeenCalledWith(
        stageUrl + stageId,
        JSON.stringify({ id: stageId, stage: SquadStage.ENTRIES })
      );
    });

    it("should throw with custom message if privateApi.patch rejects", async () => {
      mockedPrivateApi.patch.mockRejectedValueOnce(new Error("Network Error"));

      await expect(
        patchJustStage(stageId, SquadStage.ENTRIES)
      ).rejects.toThrow("patchJustStage failed: Network Error");

      expect(mockedPrivateApi.patch).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.patch rejects with non-error", async () => {
      mockedPrivateApi.patch.mockRejectedValueOnce("testing 123");

      await expect(
        patchJustStage(stageId, SquadStage.ENTRIES)
      ).rejects.toThrow("patchJustStage failed: testing 123");

      expect(mockedPrivateApi.patch).toHaveBeenCalledTimes(1);
    });
  });

  describe("patchJustStageOverride - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.data.stage is missing", async () => {
      mockedPrivateApi.patch.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(
        patchJustStageOverride(stageId, true, "testing")
      ).rejects.toThrow(
        "patchJustStageOverride failed: Error patching justStageOverride"
      );

      expect(mockedPrivateApi.patch).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.patch).toHaveBeenCalledWith(
        stageUrl + stageId,
        JSON.stringify({
          id: stageId,
          stage_override_enabled: true,
          stage_override_reason: "testing",
        })
      );
    });

    it("should throw with custom message if privateApi.patch rejects", async () => {
      mockedPrivateApi.patch.mockRejectedValueOnce(new Error("Network Error"));

      await expect(
        patchJustStageOverride(stageId, true, "testing")
      ).rejects.toThrow("patchJustStageOverride failed: Network Error");

      expect(mockedPrivateApi.patch).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.patch rejects with non-error", async () => {
      mockedPrivateApi.patch.mockRejectedValueOnce("testing 123");

      await expect(
        patchJustStageOverride(stageId, true, "testing")
      ).rejects.toThrow("patchJustStageOverride failed: testing 123");

      expect(mockedPrivateApi.patch).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteFullStage - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.data.count is missing", async () => {
      mockedPrivateApi.delete.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(deleteFullStage(stageId)).rejects.toThrow(
        "deleteFullStage failed: Error deleting stage"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(stageUrl + stageId);
    });

    it("should throw with custom message if privateApi.delete rejects", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteFullStage(stageId)).rejects.toThrow(
        "deleteFullStage failed: Network Error"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.delete rejects with non-error", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteFullStage(stageId)).rejects.toThrow(
        "deleteFullStage failed: testing 123"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });
  });
});
