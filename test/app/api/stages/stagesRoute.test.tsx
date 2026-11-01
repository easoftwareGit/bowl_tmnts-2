/**
 * @jest-environment node
 */
// Tests for src/app/api/stages/route.ts using mocked prisma.
// No database or server needed.
import { POST } from "@/app/api/stages/route";
import { prismaMock } from "../../../prismaMock";
import { mockStageToPost, mockSquadsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import type { fullStageType } from "@/lib/types/types";
import { maxReasonLength } from "@/lib/validation/constants";
import { stageDataForPrisma } from "@/lib/db/stageMappers";
import { SquadStage } from "@prisma/client";

// Keep the real stageDataForPrisma, but wrap it in a jest.fn so a test can
// make it return null (the route's "invalid data" 422 branch)
jest.mock("@/lib/db/stageMappers", () => {
  const actual = jest.requireActual("@/lib/db/stageMappers");
  return { ...actual, stageDataForPrisma: jest.fn() };
});
const mockStageDataForPrisma = stageDataForPrisma as jest.MockedFunction<
  typeof stageDataForPrisma
>;
const actualStageDataForPrisma = jest.requireActual(
  "@/lib/db/stageMappers"
).stageDataForPrisma as typeof stageDataForPrisma;

// The URL only needs to be valid; no server is running
const url = "http://localhost:3000/api/stages";

const toPostStageId = mockStageToPost.id;
const toPostSquadId = mockSquadsToPost[0].id;

// the route uses new Date() for all stage dates; freeze the clock
const fixedNow = new Date("2026-10-26T12:00:00.000Z");
const fixedNowStr = fixedNow.toISOString();

// a date passed in by the caller; the route should ignore it
const aDateStr = "2022-01-01T00:00:00.000Z";

// fixed dates for the row prisma "returns"
const dates = {
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-01-01T00:00:00.000Z"),
};

// valid stage in DEFINE stage with no override, so each test starts from a
// known state
const baseStage: fullStageType = {
  ...mockStageToPost,
  stage: SquadStage.DEFINE,
  scores_started_at: null,
  stage_override_enabled: false,
  stage_override_at: null,
  stage_override_reason: "",
};

// builds a POST request with a JSON body
const postRequest = (body: unknown) =>
  new Request(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

// the data object the route passed to prisma.stage.create()
type sentStage = Record<string, unknown>;
const sentData = (): sentStage =>
  (prismaMock.stage.create as unknown as jest.Mock).mock.calls[0][0].data;

// stageDataForPrisma may send dates as Date objects or ISO strings;
// compare them as ISO strings either way
const toIso = (value: unknown) =>
  value === null || value === undefined
    ? value
    : new Date(value as string | Date).toISOString();

beforeEach(() => {
  // this jest.fn mock is not reset by prismaMock, so clear its calls
  // (and any leftover mock...Once values) before each test
  mockStageDataForPrisma.mockReset();
  mockStageDataForPrisma.mockImplementation(actualStageDataForPrisma);

  // fake only Date; list every other timer API in doNotFake so promises,
  // setTimeout and request.json() still work normally
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

  // stage.create echoes back what it was asked to save
  (prismaMock.stage.create as unknown as jest.Mock).mockImplementation(
    (args: { data: Record<string, unknown> }) =>
      Promise.resolve({ ...args.data, ...dates })
  );
});

afterEach(() => {
  jest.useRealTimers();
});

describe("Stages - API: /api/stages", () => {
  describe("POST", () => {
    it("should post a full stage", async () => {
      const response = await POST(postRequest(baseStage));
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(prismaMock.stage.create).toHaveBeenCalledTimes(1);

      const sent = sentData();
      expect(sent.id).toBe(baseStage.id);
      expect(sent.squad_id).toBe(baseStage.squad_id);
      expect(sent.stage).toBe(SquadStage.DEFINE);
      expect(toIso(sent.stage_set_at)).toBe(fixedNowStr);
      expect(sent.scores_started_at).toBeNull();
      expect(sent.stage_override_enabled).toBe(false);
      expect(sent.stage_override_at).toBeNull();

      expect(body.stage.id).toBe(baseStage.id);
      expect(body.stage.squad_id).toBe(baseStage.squad_id);
      expect(body.stage.stage).toBe(SquadStage.DEFINE);
      expect(body.stage.stage_set_at).toBe(fixedNowStr);
      expect(body.stage.scores_started_at).toBeNull();
      expect(body.stage.stage_override_enabled).toBe(false);
      expect(body.stage.stage_override_at).toBeNull();
    });

    it("should post a full stage - all fields", async () => {
      const allStageFields: fullStageType = {
        ...baseStage,
        stage: SquadStage.SCORES,
        stage_override_enabled: true,
        stage_override_reason: "test reason",
      };

      const response = await POST(postRequest(allStageFields));
      const body = await response.json();

      expect(response.status).toBe(201);
      const sent = sentData();
      expect(sent.id).toBe(allStageFields.id);
      expect(sent.squad_id).toBe(allStageFields.squad_id);
      expect(sent.stage).toBe(SquadStage.SCORES);
      expect(toIso(sent.stage_set_at)).toBe(fixedNowStr);
      expect(toIso(sent.scores_started_at)).toBe(fixedNowStr);
      expect(sent.stage_override_enabled).toBe(true);
      expect(toIso(sent.stage_override_at)).toBe(fixedNowStr);
      expect(sent.stage_override_reason).toBe("test reason");

      expect(body.stage.stage).toBe(SquadStage.SCORES);
      expect(body.stage.stage_set_at).toBe(fixedNowStr);
      expect(body.stage.scores_started_at).toBe(fixedNowStr);
      expect(body.stage.stage_override_enabled).toBe(true);
      expect(body.stage.stage_override_at).toBe(fixedNowStr);
      expect(body.stage.stage_override_reason).toBe("test reason");
    });

    // runs the same test once for each stage that is not SCORES
    it.each([SquadStage.DEFINE, SquadStage.ENTRIES, SquadStage.FINISHED])(
      "should set stage_set_at, but not scores_started_at, when stage is %s",
      async (stage) => {
        const response = await POST(postRequest({ ...baseStage, stage }));

        expect(response.status).toBe(201);
        const sent = sentData();
        expect(sent.stage).toBe(stage);
        expect(toIso(sent.stage_set_at)).toBe(fixedNowStr);
        expect(sent.scores_started_at).toBeNull();
      }
    );

    it("should ignore dates passed in - system sets dates", async () => {
      const ignoreDatesStage: fullStageType = {
        ...baseStage,
        stage: SquadStage.SCORES,
        stage_set_at: aDateStr,
        scores_started_at: aDateStr,
        stage_override_enabled: true,
        stage_override_at: aDateStr,
        stage_override_reason: "test reason",
      };

      const response = await POST(postRequest(ignoreDatesStage));
      const body = await response.json();

      expect(response.status).toBe(201);
      const sent = sentData();
      expect(toIso(sent.stage_set_at)).toBe(fixedNowStr);
      expect(toIso(sent.scores_started_at)).toBe(fixedNowStr);
      expect(toIso(sent.stage_override_at)).toBe(fixedNowStr);

      expect(body.stage.stage_set_at).toBe(fixedNowStr);
      expect(body.stage.scores_started_at).toBe(fixedNowStr);
      expect(body.stage.stage_override_at).toBe(fixedNowStr);
    });

    it("should clear passed in scores_started_at and stage_override_at when not SCORES and no override", async () => {
      const response = await POST(
        postRequest({
          ...baseStage,
          stage_set_at: aDateStr,
          scores_started_at: aDateStr,
          stage_override_at: aDateStr,
        })
      );

      expect(response.status).toBe(201);
      const sent = sentData();
      expect(toIso(sent.stage_set_at)).toBe(fixedNowStr);
      expect(sent.scores_started_at).toBeNull();
      expect(sent.stage_override_at).toBeNull();
    });

    it("should post a full stage with all values sanitized", async () => {
      const toSanitizeStage: fullStageType = {
        ...baseStage,
        stage: SquadStage.SCORES,
        stage_override_enabled: true,
        stage_override_reason: "     test  reason    ",
      };

      const response = await POST(postRequest(toSanitizeStage));
      const body = await response.json();

      expect(response.status).toBe(201);
      // the real check: the route sent SANITIZED data to the database
      expect(sentData().stage_override_reason).toBe("test reason");
      expect(body.stage.stage_override_reason).toBe("test reason");
    });

    // runs the same test once for each invalid value
    it.each<[string, Partial<Record<keyof fullStageType, unknown>>]>([
      ["id is missing", { id: null }],
      ["id is blank", { id: "" }],
      ["id is valid, but not a stage id", { id: toPostSquadId }],
      ["squad_id is missing", { squad_id: null }],
      ["squad_id is blank", { squad_id: "" }],
      ["squad_id is valid, but not a squad id", { squad_id: toPostStageId }],
      ["stage is missing", { stage: null }],
      ["stage is invalid", { stage: "test" }],
      ["stage_override_enabled is missing", { stage_override_enabled: null }],
      ["stage_override_enabled is invalid", { stage_override_enabled: "testing" }],
      [
        "stage_override_enabled = true and stage_override_reason is blank",
        { stage_override_enabled: true, stage_override_reason: "" },
      ],
      [
        "stage_override_enabled = true and stage_override_reason is sanitized to blank",
        { stage_override_enabled: true, stage_override_reason: "<script>test</script>" },
      ],
      [
        "stage_override_enabled = true and stage_override_reason is too long",
        {
          stage_override_enabled: true,
          stage_override_reason: "a".repeat(maxReasonLength + 1),
        },
      ],
      [
        "stage_override_enabled = false and stage_override_reason has a value",
        { stage_override_enabled: false, stage_override_reason: "test" },
      ],
    ])("should NOT post a full stage when %s", async (_desc, changes) => {
      const response = await POST(postRequest({ ...baseStage, ...changes }));
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body.error).toMatch(/^(missing data|invalid data)$/);
      expect(prismaMock.stage.create).not.toHaveBeenCalled();
    });

    it("should return 422 'missing data' when id is blank", async () => {
      const response = await POST(postRequest({ ...baseStage, id: "" }));
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body).toEqual({ error: "missing data" });
    });

    it("should return 422 'invalid data' when stage is invalid", async () => {
      const response = await POST(postRequest({ ...baseStage, stage: "test" }));
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body).toEqual({ error: "invalid data" });
    });

    it("should return 422 'missing data' when stage is null", async () => {
      const response = await POST(postRequest({ ...baseStage, stage: null }));
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body).toEqual({ error: "missing data" });
    });

    it("should return 422 'missing data' when stage is not sent", async () => {
      // JSON.stringify drops undefined, so stage is absent from the body
      const response = await POST(postRequest({ ...baseStage, stage: undefined }));
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body).toEqual({ error: "missing data" });
    });

    it("should return 422 when stageDataForPrisma returns null", async () => {
      mockStageDataForPrisma.mockReturnValueOnce(null as never);

      const response = await POST(postRequest(baseStage));
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body).toEqual({ error: "invalid data" });
      expect(prismaMock.stage.create).not.toHaveBeenCalled();
    });

    it("should return 409 when the squad is not in the database", async () => {
      // foreign key constraint; standardCatchReturn only checks err.code
      prismaMock.stage.create.mockRejectedValue({ code: "P2003" });

      const response = await POST(postRequest(baseStage));

      expect(response.status).toBe(409);
    });

    it("should return 409 when the stage id or squad_id already exists", async () => {
      prismaMock.stage.create.mockRejectedValue({ code: "P2002" });

      const response = await POST(postRequest(baseStage));

      expect(response.status).toBe(409);
    });

    it("should return 500 when the database throws", async () => {
      prismaMock.stage.create.mockRejectedValue(new Error("connection failed"));

      const response = await POST(postRequest(baseStage));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ message: "error posting stage - connection failed" });
    });

    it("should return 500 when the request body is not valid JSON", async () => {
      const response = await POST(
        new Request(url, {
          method: "POST",
          body: "not json",
          headers: { "Content-Type": "application/json" },
        })
      );

      expect(response.status).toBe(500);
      expect(prismaMock.stage.create).not.toHaveBeenCalled();
    });
  });
});
