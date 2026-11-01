// Tests for src/lib/db/stages/dbStages.ts using a mocked axios instance module.
// No database or server needed.
import { AxiosError, AxiosHeaders } from "axios";
import { publicApi, privateApi } from "@/lib/api/axios";
import { baseStagesApi } from "@/lib/api/apiPaths";
import { testBaseStagesApi } from "../../../testApi";
import type { fullStageType, tmntFullType } from "@/lib/types/types";
import {
  getFullStageForSquad,
  getJustStage,
  getJustStageOverride,
  postFullStage,
  patchJustStage,
  patchJustStageOverride,
  postInitialStageForSquad,
} from "@/lib/db/stages/dbStages";
import { SquadStage } from "@prisma/client";
import { linkedInitTmntFullData } from "@/lib/db/initVals";
import { isValidBtDbId } from "@/lib/validation/validation";
import { maxReasonLength } from "@/lib/validation/constants";
import { cloneDeep } from "lodash";

// Replace the axios instances with mock functions each test can control
jest.mock("@/lib/api/axios", () => ({
  publicApi: { get: jest.fn() },
  privateApi: { post: jest.fn(), patch: jest.fn() },
}));
const mockGet = publicApi.get as jest.Mock;
const mockPost = privateApi.post as jest.Mock;
const mockPatch = privateApi.patch as jest.Mock;

// same url logic as dbStages.ts; only used to check what was called
const url = process.env.NODE_ENV === "test" && testBaseStagesApi
  ? testBaseStagesApi
  : baseStagesApi;
const stageUrl = url + "/stage/";
const squadUrl = url + "/squad/";

const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const eventId = "evt_cb97b73cb538418ab993fc867f860510";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const stageId = "stg_c5f562c4c4304d919ac43fead73123e2";
const notFoundStageId = "stg_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";

// A real AxiosError, like axios rejects with for a non-2xx response.
// dbStages checks `err instanceof AxiosError` to turn a 422 into
// "Invalid ... data", so a plain Error with the same fields will not do.
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

// from prisma/seed.ts
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

const testOverrideStage: fullStageType = {
  ...testStage,
  stage: "ENTRIES",
  stage_override_enabled: true,
  stage_override_at: "2022-10-23T12:00:00.000Z",
  stage_override_reason: "Test override reason",
};

const toPostStage: fullStageType = {
  id: "stg_1a2b3c4d5e6f40718293a4b5c6d7e8f9",
  squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
  stage: "DEFINE",
  stage_set_at: "",
  scores_started_at: null,
  stage_override_enabled: false,
  stage_override_at: null,
  stage_override_reason: "",
};

const setAt = "2026-10-27T12:00:00.000Z";

// linkedInitTmntFullData is an object, not a function; clone it so the
// shared init value is not changed
const validFullTmnt: tmntFullType = cloneDeep(linkedInitTmntFullData);
validFullTmnt.tmnt.id = tmntId;
validFullTmnt.events[0].tmnt_id = tmntId;
validFullTmnt.events[0].id = eventId;
validFullTmnt.squads[0].event_id = eventId;
validFullTmnt.squads[0].id = squadId;

describe("dbStages", () => {
  beforeEach(() => {
    // jest config does not auto-reset mocks
    mockGet.mockReset();
    mockPost.mockReset();
    mockPatch.mockReset();
  });

  describe("getFullStageForSquad()", () => {
    it("should return a stage", async () => {
      mockGet.mockResolvedValue({ data: { stage: testStage } });

      const fullStage = await getFullStageForSquad(testStage.squad_id);

      expect(fullStage).toEqual(testStage);
    });

    it("should call the squad url once with the public api", async () => {
      mockGet.mockResolvedValue({ data: { stage: testStage } });

      await getFullStageForSquad(testStage.squad_id);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(squadUrl + testStage.squad_id);
      expect(mockPost).not.toHaveBeenCalled();
      expect(mockPatch).not.toHaveBeenCalled();
    });

    it("should throw error if squad id does not exist", async () => {
      mockGet.mockRejectedValue(axiosError(404));

      await expect(getFullStageForSquad(notFoundSquadId)).rejects.toThrow(
        new Error("getFullStageForSquad failed: Request failed with status code 404")
      );
    });

    it("should throw error when the API call fails", async () => {
      mockGet.mockRejectedValue(axiosError(500));

      await expect(getFullStageForSquad(squadId)).rejects.toThrow(
        new Error("getFullStageForSquad failed: Request failed with status code 500")
      );
    });

    it.each([
      ["invalid", "testing"],
      ["valid, but not a squad id", stageId],
      ["null", null as unknown as string],
      ["undefined", undefined as unknown as string],
    ])("should throw error if squad id is %s", async (_desc, id) => {
      await expect(getFullStageForSquad(id)).rejects.toThrow(
        new Error("Invalid squad id")
      );
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe("getJustStage()", () => {
    const justStageFrom = (stage: fullStageType) => ({
      id: stage.id,
      squad_id: stage.squad_id,
      stage: stage.stage,
      stage_set_at: stage.stage_set_at,
      scores_started_at: stage.scores_started_at,
    });

    it("should return justStage when passed squad id", async () => {
      mockGet.mockResolvedValue({ data: { stage: testStage } });

      const justStage = await getJustStage(validFullTmnt.squads[0].id);

      expect(justStage).toEqual(justStageFrom(testStage));
      expect(mockGet).toHaveBeenCalledWith(squadUrl + squadId);
    });

    it("should return justStage when passed full tmnt", async () => {
      mockGet.mockResolvedValue({ data: { stage: testStage } });

      const justStage = await getJustStage(validFullTmnt);

      expect(justStage).toEqual(justStageFrom(testStage));
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(squadUrl + squadId);
    });

    it("should return only the justStage fields", async () => {
      mockGet.mockResolvedValue({ data: { stage: testOverrideStage } });

      const justStage = await getJustStage(squadId);

      expect(justStage).not.toHaveProperty("stage_override_enabled");
      expect(justStage).not.toHaveProperty("stage_override_at");
      expect(justStage).not.toHaveProperty("stage_override_reason");
    });

    it("should throw error if squad id does not exist", async () => {
      mockGet.mockRejectedValue(axiosError(404));

      await expect(getJustStage(notFoundSquadId)).rejects.toThrow(
        new Error(
          "getJustStage failed: getFullStageForSquad failed: Request failed with status code 404"
        )
      );
    });

    it.each([
      ["a stage id that does not exist", notFoundStageId],
      ["invalid", "testing"],
      ["valid, but not a squad id", testStage.id],
    ])("should throw error if squad id is %s", async (_desc, id) => {
      await expect(getJustStage(id)).rejects.toThrow(
        new Error("getJustStage failed: Invalid squad id")
      );
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should throw error if passed non tournament object", async () => {
      await expect(
        getJustStage(validFullTmnt.events[0] as unknown as tmntFullType)
      ).rejects.toThrow(new Error("Invalid squad id"));
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should throw error if full tmnt has no squads", async () => {
      const noSquadsTmnt = { ...validFullTmnt, squads: [] };

      await expect(getJustStage(noSquadsTmnt)).rejects.toThrow(
        new Error("Invalid squad id")
      );
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should throw error if passed null or undefined", async () => {
      await expect(getJustStage(null as unknown as string)).rejects.toThrow(
        new Error("Invalid squad id")
      );
      await expect(getJustStage(undefined as unknown as string)).rejects.toThrow(
        new Error("Invalid squad id")
      );
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe("getJustStageOverride()", () => {
    const justStageOverrideFrom = (stage: fullStageType) => ({
      id: stage.id,
      squad_id: stage.squad_id,
      stage_override_enabled: stage.stage_override_enabled,
      stage_override_at: stage.stage_override_at,
      stage_override_reason: stage.stage_override_reason,
    });

    it("should return justStageOverride when passed squadId", async () => {
      mockGet.mockResolvedValue({ data: { stage: testStage } });

      const justStage = await getJustStageOverride(validFullTmnt.squads[0].id);

      expect(justStage).toEqual(justStageOverrideFrom(testStage));
      expect(mockGet).toHaveBeenCalledWith(squadUrl + squadId);
    });

    it("should return justStageOverride when passed full tmnt", async () => {
      mockGet.mockResolvedValue({ data: { stage: testStage } });

      const justStage = await getJustStageOverride(validFullTmnt);

      expect(justStage).toEqual(justStageOverrideFrom(testStage));
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(squadUrl + squadId);
    });

    it("should get stage override for squad with override data", async () => {
      mockGet.mockResolvedValue({ data: { stage: testOverrideStage } });

      const justStage = await getJustStageOverride(squadId);

      expect(justStage).toEqual(justStageOverrideFrom(testOverrideStage));
      expect(justStage).not.toHaveProperty("stage");
      expect(justStage).not.toHaveProperty("stage_set_at");
      expect(justStage).not.toHaveProperty("scores_started_at");
    });

    it("should throw error if squad id does not exist", async () => {
      mockGet.mockRejectedValue(axiosError(404));

      await expect(getJustStageOverride(notFoundSquadId)).rejects.toThrow(
        new Error(
          "getJustStageOverride failed: getFullStageForSquad failed: Request failed with status code 404"
        )
      );
    });

    it.each([
      ["invalid", "testing"],
      ["valid, but not a squad id", testStage.id],
    ])("should throw error if squad id is %s", async (_desc, id) => {
      await expect(getJustStageOverride(id)).rejects.toThrow(
        new Error("getJustStageOverride failed: Invalid squad id")
      );
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should throw error if passed non tournament object", async () => {
      await expect(
        getJustStageOverride(validFullTmnt.events[0] as unknown as tmntFullType)
      ).rejects.toThrow(new Error("Invalid squad id"));
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should throw error if passed null or undefined", async () => {
      await expect(
        getJustStageOverride(null as unknown as string)
      ).rejects.toThrow(new Error("Invalid squad id"));
      await expect(
        getJustStageOverride(undefined as unknown as string)
      ).rejects.toThrow(new Error("Invalid squad id"));
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe("postFullStage()", () => {
    it("should post a full stage", async () => {
      const posted: fullStageType = { ...toPostStage, stage_set_at: setAt };
      mockPost.mockResolvedValue({ data: { stage: posted } });

      const postedStage = await postFullStage(toPostStage);

      expect(postedStage).toEqual(posted);
    });

    it("should post the stage as JSON to the base url with the private api", async () => {
      mockPost.mockResolvedValue({ data: { stage: toPostStage } });

      await postFullStage(toPostStage);

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith(url, JSON.stringify(toPostStage));
      expect(mockGet).not.toHaveBeenCalled();
      expect(mockPatch).not.toHaveBeenCalled();
    });

    it("should post a full stage - all fields, returns the dates the route set", async () => {
      const dateStr = "2022-01-01T00:00:00.000Z";
      const allStageFields: fullStageType = {
        ...toPostStage,
        stage: SquadStage.SCORES,
        stage_set_at: dateStr,
        scores_started_at: dateStr,
        stage_override_enabled: true,
        stage_override_at: dateStr,
        stage_override_reason: "test reason",
      };
      // the route ignores the dates passed in and sets its own
      const posted: fullStageType = {
        ...allStageFields,
        stage_set_at: setAt,
        scores_started_at: setAt,
        stage_override_at: setAt,
      };
      mockPost.mockResolvedValue({ data: { stage: posted } });

      const postedStage = await postFullStage(allStageFields);

      expect(postedStage).toEqual(posted);
      expect(mockPost).toHaveBeenCalledWith(url, JSON.stringify(allStageFields));
    });

    it("should post a full stage when sanitized", async () => {
      const sanitizedStage: fullStageType = {
        ...toPostStage,
        stage: SquadStage.SCORES,
        stage_override_enabled: true,
        stage_override_reason: "<sccript>   test  reason   </script>",
      };
      // the route sanitizes the reason before saving
      const posted: fullStageType = {
        ...sanitizedStage,
        stage_set_at: setAt,
        scores_started_at: setAt,
        stage_override_at: setAt,
        stage_override_reason: "test reason",
      };
      mockPost.mockResolvedValue({ data: { stage: posted } });

      const postedStage = await postFullStage(sanitizedStage);

      expect(postedStage.stage_override_reason).toBe("test reason");
    });

    it("should throw error when the squad does not exist", async () => {
      mockPost.mockRejectedValue(axiosError(409));

      await expect(postFullStage(toPostStage)).rejects.toThrow(
        new Error("postFullStage failed: Request failed with status code 409")
      );
    });

    it("should throw error when the API call fails", async () => {
      mockPost.mockRejectedValue(axiosError(500));

      await expect(postFullStage(toPostStage)).rejects.toThrow(
        new Error("postFullStage failed: Request failed with status code 500")
      );
    });

    describe("invalid args - throws before calling the API", () => {
      it.each([
        ["id is missing", { id: null }],
        ["id is invalid", { id: "test" }],
        ["id is valid, but not a stage id", { id: squadId }],
      ])("should NOT post a full stage when %s", async (_desc, override) => {
        const invalidStage = {
          ...toPostStage,
          ...override,
        } as unknown as fullStageType;

        await expect(postFullStage(invalidStage)).rejects.toThrow(
          new Error("Invalid stage data")
        );
        expect(mockPost).not.toHaveBeenCalled();
      });

      it("should NOT post when stage is null", async () => {
        await expect(
          postFullStage(null as unknown as fullStageType)
        ).rejects.toThrow(new Error("Invalid stage data"));
        expect(mockPost).not.toHaveBeenCalled();
      });
    });

    // The route validates the rest. With mocks, these cases become 422
    // rejections, which postFullStage turns into "Invalid stage data".
    describe("invalid data - route rejects with 422", () => {
      it.each([
        ["squad id is missing", { squad_id: null }],
        ["squad id is invalid", { squad_id: "test" }],
        ["squad id is valid, but not a squad id", { squad_id: userId }],
        ["stage is missing", { stage: null }],
        ["stage is invalid", { stage: "test" }],
        ["stage_override_enabled is missing", { stage_override_enabled: null }],
        ["stage_override_enabled is invalid", { stage_override_enabled: "test" }],
        [
          "stage_override_enabled = true and stage_override_reason is missing",
          { stage_override_enabled: true, stage_override_reason: null },
        ],
        [
          "stage_override_enabled = true and stage_override_reason is blank",
          { stage_override_enabled: true, stage_override_reason: "" },
        ],
        [
          "stage_override_enabled = true and stage_override_reason is too long",
          {
            stage_override_enabled: true,
            stage_override_reason: "a".repeat(maxReasonLength + 1),
          },
        ],
        [
          "stage_override_enabled = false and stage_override_reason is not blank",
          { stage_override_enabled: false, stage_override_reason: "testing" },
        ],
      ])("should NOT post a full stage when %s", async (_desc, override) => {
        const invalidStage = {
          ...toPostStage,
          ...override,
        } as unknown as fullStageType;
        mockPost.mockRejectedValue(axiosError(422));

        await expect(postFullStage(invalidStage)).rejects.toThrow(
          new Error("Invalid stage data")
        );
        expect(mockPost).toHaveBeenCalledTimes(1);
        expect(mockPost).toHaveBeenCalledWith(url, JSON.stringify(invalidStage));
      });
    });
  });

  describe("postInitialStageForSquad()", () => {
    it("should post an initial full stage", async () => {
      // echo back what was posted, with the date the route sets
      mockPost.mockImplementation(async (_url: string, body: string) => ({
        data: { stage: { ...JSON.parse(body), stage_set_at: setAt } },
      }));

      const initialStage = await postInitialStageForSquad(toPostStage.squad_id);

      expect(isValidBtDbId(initialStage.id, "stg")).toBe(true);
      expect(initialStage.squad_id).toBe(toPostStage.squad_id);
      expect(initialStage.stage).toBe(SquadStage.DEFINE);
      expect(initialStage.stage_set_at).toBe(setAt);
      expect(initialStage.scores_started_at).toBeNull();
      expect(initialStage.stage_override_enabled).toBe(false);
      expect(initialStage.stage_override_at).toBeNull();
      expect(initialStage.stage_override_reason).toBe("");
    });

    it("should post a new DEFINE stage for the squad to the base url", async () => {
      mockPost.mockResolvedValue({ data: { stage: toPostStage } });

      await postInitialStageForSquad(toPostStage.squad_id);

      expect(mockPost).toHaveBeenCalledTimes(1);
      const [postUrl, body] = mockPost.mock.calls[0];
      expect(postUrl).toBe(url);
      const posted: fullStageType = JSON.parse(body);
      expect(isValidBtDbId(posted.id, "stg")).toBe(true);
      expect(posted.squad_id).toBe(toPostStage.squad_id);
      expect(posted.stage).toBe(SquadStage.DEFINE);
      expect(posted.stage_override_enabled).toBe(false);
    });

    it("should post a different stage id each time", async () => {
      mockPost.mockResolvedValue({ data: { stage: toPostStage } });

      await postInitialStageForSquad(toPostStage.squad_id);
      await postInitialStageForSquad(toPostStage.squad_id);

      const id1 = JSON.parse(mockPost.mock.calls[0][1]).id;
      const id2 = JSON.parse(mockPost.mock.calls[1][1]).id;
      expect(id1).not.toBe(id2);
    });

    it("should throw error when the API call fails", async () => {
      mockPost.mockRejectedValue(axiosError(500));

      await expect(
        postInitialStageForSquad(toPostStage.squad_id)
      ).rejects.toThrow(
        new Error("postFullStage failed: Request failed with status code 500")
      );
    });

    it.each([
      ["null", null as unknown as string],
      ["invalid", "test"],
      ["valid, but not a squad id", userId],
    ])("should NOT post initial full stage when squad id is %s", async (_desc, id) => {
      await expect(postInitialStageForSquad(id)).rejects.toThrow(
        new Error("Invalid squad id")
      );
      expect(mockPost).not.toHaveBeenCalled();
    });
  });

  describe("patchJustStage()", () => {
    it("should patch a justStage", async () => {
      mockPatch.mockResolvedValue({
        data: {
          stage: { ...testStage, stage: SquadStage.ENTRIES, stage_set_at: setAt },
        },
      });

      const patchedStage = await patchJustStage(testStage.id, SquadStage.ENTRIES);

      expect(patchedStage).toEqual({
        id: testStage.id,
        squad_id: testStage.squad_id,
        stage: SquadStage.ENTRIES,
        stage_set_at: setAt,
        scores_started_at: null,
      });
    });

    it("should patch a justStage - stage = SCORES", async () => {
      mockPatch.mockResolvedValue({
        data: {
          stage: {
            ...testStage,
            stage: SquadStage.SCORES,
            stage_set_at: setAt,
            scores_started_at: setAt,
          },
        },
      });

      const patchedStage = await patchJustStage(testStage.id, SquadStage.SCORES);

      expect(patchedStage.stage).toBe(SquadStage.SCORES);
      expect(patchedStage.stage_set_at).toBe(setAt);
      expect(patchedStage.scores_started_at).toBe(setAt);
    });

    it("should patch only id and stage to the stage url with the private api", async () => {
      mockPatch.mockResolvedValue({ data: { stage: testStage } });

      await patchJustStage(testStage.id, SquadStage.ENTRIES);

      expect(mockPatch).toHaveBeenCalledTimes(1);
      expect(mockPatch).toHaveBeenCalledWith(
        stageUrl + testStage.id,
        JSON.stringify({ id: testStage.id, stage: SquadStage.ENTRIES })
      );
      expect(mockGet).not.toHaveBeenCalled();
      expect(mockPost).not.toHaveBeenCalled();
    });

    it("should return only the justStage fields", async () => {
      mockPatch.mockResolvedValue({ data: { stage: testOverrideStage } });

      const patchedStage = await patchJustStage(testStage.id, SquadStage.ENTRIES);

      expect(patchedStage).not.toHaveProperty("stage_override_enabled");
      expect(patchedStage).not.toHaveProperty("stage_override_at");
      expect(patchedStage).not.toHaveProperty("stage_override_reason");
    });

    it("should throw error when stage id does not exist", async () => {
      mockPatch.mockRejectedValue(axiosError(404));

      await expect(
        patchJustStage(notFoundStageId, SquadStage.ENTRIES)
      ).rejects.toThrow(
        new Error("patchJustStage failed: Request failed with status code 404")
      );
    });

    it("should throw error when route rejects with 422", async () => {
      mockPatch.mockRejectedValue(axiosError(422));

      await expect(
        patchJustStage(testStage.id, SquadStage.ENTRIES)
      ).rejects.toThrow(new Error("Invalid justStage data"));
    });

    it("should throw error when the API call fails", async () => {
      mockPatch.mockRejectedValue(axiosError(500));

      await expect(
        patchJustStage(testStage.id, SquadStage.ENTRIES)
      ).rejects.toThrow(
        new Error("patchJustStage failed: Request failed with status code 500")
      );
    });

    it.each([
      ["id is missing", null as unknown as string, SquadStage.ENTRIES],
      ["id is invalid", "test", SquadStage.ENTRIES],
      ["id is valid, but not a stage id", userId, SquadStage.ENTRIES],
      ["stage is invalid", testStage.id, "test" as SquadStage],
      ["stage is missing", testStage.id, null as unknown as SquadStage],
    ])("should not patch a justStage when %s", async (_desc, id, stage) => {
      await expect(patchJustStage(id, stage)).rejects.toThrow(
        new Error("Invalid justStage data")
      );
      expect(mockPatch).not.toHaveBeenCalled();
    });
  });

  describe("patchJustStageOverride()", () => {
    const testReason = "testing reason";

    describe("setting stage_override_enabled to true", () => {
      it("should patch a justStageOverride", async () => {
        mockPatch.mockResolvedValue({
          data: {
            stage: {
              ...testStage,
              stage_override_enabled: true,
              stage_override_at: setAt,
              stage_override_reason: testReason,
            },
          },
        });

        const patchedStage = await patchJustStageOverride(
          testStage.id,
          true,
          testReason
        );

        expect(patchedStage).toEqual({
          id: testStage.id,
          squad_id: testStage.squad_id,
          stage_override_enabled: true,
          stage_override_at: setAt,
          stage_override_reason: testReason,
        });
      });

      it("should patch id, enabled and reason to the stage url with the private api", async () => {
        mockPatch.mockResolvedValue({ data: { stage: testOverrideStage } });

        await patchJustStageOverride(testStage.id, true, testReason);

        expect(mockPatch).toHaveBeenCalledTimes(1);
        expect(mockPatch).toHaveBeenCalledWith(
          stageUrl + testStage.id,
          JSON.stringify({
            id: testStage.id,
            stage_override_enabled: true,
            stage_override_reason: testReason,
          })
        );
      });

      it("should return only the justStageOverride fields", async () => {
        mockPatch.mockResolvedValue({ data: { stage: testOverrideStage } });

        const patchedStage = await patchJustStageOverride(
          testStage.id,
          true,
          testReason
        );

        expect(patchedStage).not.toHaveProperty("stage");
        expect(patchedStage).not.toHaveProperty("stage_set_at");
        expect(patchedStage).not.toHaveProperty("scores_started_at");
      });

      it.each([
        ["id is missing", null as unknown as string, testReason],
        ["id is invalid", "test", testReason],
        ["id is valid, but not a stage id", userId, testReason],
        ["reason is missing", stageId, null as unknown as string],
      ])("should not patch a justStageOverride when %s", async (_desc, id, reason) => {
        await expect(patchJustStageOverride(id, true, reason)).rejects.toThrow(
          new Error("Invalid justStageOverride data")
        );
        expect(mockPatch).not.toHaveBeenCalled();
      });

      it("should not patch a justStageOverride when enabled is missing", async () => {
        await expect(
          patchJustStageOverride(stageId, null as unknown as boolean, testReason)
        ).rejects.toThrow(new Error("Invalid justStageOverride data"));
        expect(mockPatch).not.toHaveBeenCalled();
      });

      it("should not patch a justStageOverride when reason is too long (route rejects with 422)", async () => {
        const longReason = "a".repeat(maxReasonLength + 1);
        mockPatch.mockRejectedValue(axiosError(422));

        await expect(
          patchJustStageOverride(testStage.id, true, longReason)
        ).rejects.toThrow(new Error("Invalid justStageOverride data"));
        expect(mockPatch).toHaveBeenCalledWith(
          stageUrl + testStage.id,
          JSON.stringify({
            id: testStage.id,
            stage_override_enabled: true,
            stage_override_reason: longReason,
          })
        );
      });

      it("should not patch a justStageOverride when enabled = true, but reason is blank (route rejects with 422)", async () => {
        mockPatch.mockRejectedValue(axiosError(422));

        await expect(
          patchJustStageOverride(testStage.id, true, "")
        ).rejects.toThrow(new Error("Invalid justStageOverride data"));
      });

      it("should throw error when stage id does not exist", async () => {
        mockPatch.mockRejectedValue(axiosError(404));

        await expect(
          patchJustStageOverride(notFoundStageId, true, testReason)
        ).rejects.toThrow(
          new Error("patchJustStageOverride failed: Request failed with status code 404")
        );
      });

      it("should throw error when the API call fails", async () => {
        mockPatch.mockRejectedValue(axiosError(500));

        await expect(
          patchJustStageOverride(testStage.id, true, testReason)
        ).rejects.toThrow(
          new Error("patchJustStageOverride failed: Request failed with status code 500")
        );
      });
    });

    describe("setting stage_override_enabled to false", () => {
      const clearedStage: fullStageType = {
        ...testOverrideStage,
        stage_override_enabled: false,
        stage_override_at: null,
        stage_override_reason: "",
      };

      it("should patch a justStageOverride", async () => {
        mockPatch.mockResolvedValue({ data: { stage: clearedStage } });

        const patchedStage = await patchJustStageOverride(testStage.id, false, "");

        expect(patchedStage).toEqual({
          id: testStage.id,
          squad_id: testStage.squad_id,
          stage_override_enabled: false,
          stage_override_at: null,
          stage_override_reason: "",
        });
        expect(mockPatch).toHaveBeenCalledWith(
          stageUrl + testStage.id,
          JSON.stringify({
            id: testStage.id,
            stage_override_enabled: false,
            stage_override_reason: "",
          })
        );
      });

      // dbStages sends "" as the reason whenever enabled is false,
      // so a non blank reason never reaches the route
      it("should patch a justStageOverride setting enabled to false, reason ignored", async () => {
        mockPatch.mockResolvedValue({ data: { stage: clearedStage } });

        const patchedStage = await patchJustStageOverride(
          testStage.id,
          false,
          "ignore me"
        );

        expect(patchedStage.stage_override_enabled).toBe(false);
        expect(patchedStage.stage_override_at).toBeNull();
        expect(patchedStage.stage_override_reason).toBe("");
        expect(mockPatch).toHaveBeenCalledWith(
          stageUrl + testStage.id,
          JSON.stringify({
            id: testStage.id,
            stage_override_enabled: false,
            stage_override_reason: "",
          })
        );
      });
    });
  });
});
