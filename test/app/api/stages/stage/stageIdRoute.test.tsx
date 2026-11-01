/**
 * @jest-environment node
 */
// Tests for src/app/api/stages/stage/[id]/route.ts using mocked prisma.
// No database or server needed.
import { PATCH } from "@/app/api/stages/stage/[id]/route";
import { prismaMock } from "../../../../prismaMock";
import { maxReasonLength } from "@/lib/validation/constants";
import { SquadStage } from "@prisma/client";

// The URL only needs to be valid; no server is running
const url = "http://localhost:3000/api/stages/stage/";

// from prisma/seed.ts
const stageId = "stg_c5f562c4c4304d919ac43fead73123e2";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const notFoundStageId = "stg_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

// the route uses new Date() for all stage dates; freeze the clock
const fixedNow = new Date("2026-10-26T12:00:00.000Z");
const fixedNowStr = fixedNow.toISOString();

// a date passed in by the caller; the route should ignore it
const aDateStr = "2022-01-01T00:00:00.000Z";

// the row prisma "has" before the patch: DEFINE stage, no override
const existingRow = {
  id: stageId,
  squad_id: squadId,
  stage: SquadStage.DEFINE,
  stage_set_at: new Date("2022-10-23T12:00:00.000Z"),
  scores_started_at: null,
  stage_override_enabled: false,
  stage_override_at: null,
  stage_override_reason: "",
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-01-01T00:00:00.000Z"),
};

// builds a PATCH request with a JSON body, plus the route's params arg
const patchRequest = (body: unknown, id: string = stageId) =>
  PATCH(
    new Request(url + id, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }),
    { params: Promise.resolve({ id }) }
  );

// the args the route passed to prisma.stage.update()
type updateArgs = { where: { id: string }; data: Record<string, unknown> };
const sentArgs = (): updateArgs =>
  (prismaMock.stage.update as unknown as jest.Mock).mock.calls[0][0];
const sentData = () => sentArgs().data;

// compare dates as ISO strings, whether a Date object or a string
const toIso = (value: unknown) =>
  value === null || value === undefined
    ? value
    : new Date(value as string | Date).toISOString();

beforeEach(() => {
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

  // stage.update merges the patch data into the existing row
  (prismaMock.stage.update as unknown as jest.Mock).mockImplementation(
    (args: updateArgs) =>
      Promise.resolve({ ...existingRow, id: args.where.id, ...args.data })
  );
});

afterEach(() => {
  jest.useRealTimers();
});

describe("Stages - API: /api/stages", () => {
  describe("PATCH by ID - API: /api/stages/stage/:id", () => {
    it("should patch a stage - just stage", async () => {
      const response = await patchRequest({ stage: SquadStage.ENTRIES });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(prismaMock.stage.update).toHaveBeenCalledTimes(1);
      expect(sentArgs().where).toEqual({ id: stageId });

      // only the stage and its server-set date are sent
      const sent = sentData();
      expect(Object.keys(sent).sort()).toEqual(["stage", "stage_set_at"]);
      expect(sent.stage).toBe(SquadStage.ENTRIES);
      expect(toIso(sent.stage_set_at)).toBe(fixedNowStr);

      expect(body.stage.id).toBe(stageId);
      expect(body.stage.squad_id).toBe(squadId);
      expect(body.stage.stage).toBe(SquadStage.ENTRIES);
      expect(body.stage.stage_set_at).toBe(fixedNowStr);
      expect(body.stage.scores_started_at).toBeNull();
      expect(body.stage.stage_override_enabled).toBe(false);
      expect(body.stage.stage_override_at).toBeNull();
      expect(body.stage.stage_override_reason).toBe("");
    });

    it('should patch a stage - just stage when stage = "SCORES"', async () => {
      const response = await patchRequest({ stage: SquadStage.SCORES });
      const body = await response.json();

      expect(response.status).toBe(200);
      const sent = sentData();
      expect(Object.keys(sent).sort()).toEqual([
        "scores_started_at",
        "stage",
        "stage_set_at",
      ]);
      expect(sent.stage).toBe(SquadStage.SCORES);
      expect(toIso(sent.stage_set_at)).toBe(fixedNowStr);
      expect(toIso(sent.scores_started_at)).toBe(fixedNowStr);

      expect(body.stage.stage).toBe(SquadStage.SCORES);
      expect(body.stage.stage_set_at).toBe(fixedNowStr);
      expect(body.stage.scores_started_at).toBe(fixedNowStr);
      expect(body.stage.stage_override_enabled).toBe(false);
      expect(body.stage.stage_override_at).toBeNull();
    });

    // runs the same test once for each stage that is not SCORES
    it.each([SquadStage.DEFINE, SquadStage.ENTRIES, SquadStage.FINISHED])(
      "should set stage_set_at, but not scores_started_at, when stage is %s",
      async (stage) => {
        const response = await patchRequest({ stage });

        expect(response.status).toBe(200);
        const sent = sentData();
        expect(sent.stage).toBe(stage);
        expect(toIso(sent.stage_set_at)).toBe(fixedNowStr);
        expect(sent).not.toHaveProperty("scores_started_at");
      }
    );

    it("should patch a stage - just stage_override_enabled = true", async () => {
      const response = await patchRequest({
        stage_override_enabled: true,
        stage_override_reason: "test reason",
      });
      const body = await response.json();

      expect(response.status).toBe(200);
      const sent = sentData();
      expect(Object.keys(sent).sort()).toEqual([
        "stage_override_at",
        "stage_override_enabled",
        "stage_override_reason",
      ]);
      expect(sent.stage_override_enabled).toBe(true);
      expect(toIso(sent.stage_override_at)).toBe(fixedNowStr);
      expect(sent.stage_override_reason).toBe("test reason");

      expect(body.stage.squad_id).toBe(squadId);
      expect(body.stage.stage).toBe(SquadStage.DEFINE);
      expect(body.stage.stage_override_enabled).toBe(true);
      expect(body.stage.stage_override_at).toBe(fixedNowStr);
      expect(body.stage.stage_override_reason).toBe("test reason");
    });

    it("should patch a stage - just stage_override_enabled = false, clears override date and reason", async () => {
      const response = await patchRequest({ stage_override_enabled: false });
      const body = await response.json();

      expect(response.status).toBe(200);
      const sent = sentData();
      expect(Object.keys(sent).sort()).toEqual([
        "stage_override_at",
        "stage_override_enabled",
        "stage_override_reason",
      ]);
      expect(sent.stage_override_enabled).toBe(false);
      expect(sent.stage_override_at).toBeNull();
      expect(sent.stage_override_reason).toBe("");

      expect(body.stage.stage_override_enabled).toBe(false);
      expect(body.stage.stage_override_at).toBeNull();
      expect(body.stage.stage_override_reason).toBe("");
    });

    it("should patch a full stage, and ignore dates", async () => {
      const response = await patchRequest({
        stage: SquadStage.SCORES,
        stage_set_at: aDateStr,
        scores_started_at: aDateStr,
        stage_override_enabled: true,
        stage_override_at: aDateStr,
        stage_override_reason: "test reason 3",
      });
      const body = await response.json();

      expect(response.status).toBe(200);
      const sent = sentData();
      expect(sent.stage).toBe(SquadStage.SCORES);
      expect(toIso(sent.stage_set_at)).toBe(fixedNowStr);
      expect(toIso(sent.scores_started_at)).toBe(fixedNowStr);
      expect(sent.stage_override_enabled).toBe(true);
      expect(toIso(sent.stage_override_at)).toBe(fixedNowStr);
      expect(sent.stage_override_reason).toBe("test reason 3");

      expect(body.stage.stage).toBe(SquadStage.SCORES);
      expect(body.stage.stage_set_at).toBe(fixedNowStr);
      expect(body.stage.scores_started_at).toBe(fixedNowStr);
      expect(body.stage.stage_override_enabled).toBe(true);
      expect(body.stage.stage_override_at).toBe(fixedNowStr);
      expect(body.stage.stage_override_reason).toBe("test reason 3");
    });

    it("should not send id or squad_id to prisma when they are in the body", async () => {
      const response = await patchRequest({
        id: notFoundStageId,
        squad_id: "sqd_01234567890123456789012345678901",
        stage: SquadStage.ENTRIES,
      });

      expect(response.status).toBe(200);
      expect(sentArgs().where).toEqual({ id: stageId });
      expect(sentData()).not.toHaveProperty("id");
      expect(sentData()).not.toHaveProperty("squad_id");
    });

    it("should patch a stage with stage_override_reason sanitized", async () => {
      const response = await patchRequest({
        stage_override_enabled: true,
        stage_override_reason: "     test  reason    ",
      });
      const body = await response.json();

      expect(response.status).toBe(200);
      // the real check: the route sent SANITIZED data to the database
      expect(sentData().stage_override_reason).toBe("test reason");
      expect(body.stage.stage_override_reason).toBe("test reason");
    });

    // runs the same test once for each body with nothing patchable
    it.each<[string, Record<string, unknown>]>([
      ["just passing in ID", { id: stageId }],
      ["just passing in squad_id", { squad_id: squadId }],
      ["just passing in dates", { stage_set_at: aDateStr, stage_override_at: aDateStr }],
      ["body is empty", {}],
    ])("should not patch stage by ID when %s", async (_desc, toPatch) => {
      const response = await patchRequest(toPatch);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toEqual({ error: "no data to patch" });
      expect(prismaMock.stage.update).not.toHaveBeenCalled();
    });

    // runs the same test once for each invalid id
    it.each<[string, string]>([
      ["ID is invalid", "test"],
      ["ID is valid, but not a stage id", userId],
      ["ID is a squad id", squadId],
    ])("should not patch stage by ID when %s", async (_desc, id) => {
      const response = await patchRequest({ stage: SquadStage.DEFINE }, id);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ error: "invalid request" });
      expect(prismaMock.stage.update).not.toHaveBeenCalled();
    });

    it("should not patch stage by ID when ID is valid, but not found", async () => {
      // record not found; standardCatchReturn only checks err.code
      prismaMock.stage.update.mockRejectedValue({ code: "P2025" });

      const response = await patchRequest(
        { stage: SquadStage.DEFINE },
        notFoundStageId
      );

      expect(response.status).toBe(404);
      expect(sentArgs().where).toEqual({ id: notFoundStageId });
    });

    // runs the same test once for each invalid value
    it.each<[string, Record<string, unknown>]>([
      ["stage is null", { stage: null }],
      ["stage is invalid", { stage: "test" }],
      [
        "stage_override_enabled is not included and stage_override_reason is valid",
        { stage_override_reason: "test reason" },
      ],
      [
        "stage_override_enabled is invalid",
        { stage_override_enabled: "test", stage_override_reason: "test reason" },
      ],
      [
        "stage_override_enabled = TRUE and stage_override_reason is missing",
        { stage_override_enabled: true },
      ],
      [
        "stage_override_enabled = TRUE and stage_override_reason is null",
        { stage_override_enabled: true, stage_override_reason: null },
      ],
      [
        "stage_override_enabled = TRUE and stage_override_reason is blank",
        { stage_override_enabled: true, stage_override_reason: "" },
      ],
      [
        "stage_override_enabled = TRUE and stage_override_reason is sanitized to blank",
        { stage_override_enabled: true, stage_override_reason: "<script>test</script>" },
      ],
      [
        "stage_override_enabled = TRUE and stage_override_reason is too long",
        {
          stage_override_enabled: true,
          stage_override_reason: "a".repeat(maxReasonLength + 1),
        },
      ],
      [
        "stage_override_enabled = FALSE and stage_override_reason is valid",
        { stage_override_enabled: false, stage_override_reason: "test reason" },
      ],
    ])("should NOT patch a stage when %s", async (_desc, toPatch) => {
      const response = await patchRequest(toPatch);
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body.error).toMatch(/^(missing data|invalid data)$/);
      expect(prismaMock.stage.update).not.toHaveBeenCalled();
    });

    it("should return 422 'missing data' when stage is null", async () => {
      const response = await patchRequest({ stage: null });
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body).toEqual({ error: "missing data" });
    });

    it("should return 422 'invalid data' when stage is invalid", async () => {
      const response = await patchRequest({ stage: "test" });
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body).toEqual({ error: "invalid data" });
    });

    it("should return 500 when the database throws", async () => {
      prismaMock.stage.update.mockRejectedValue(new Error("connection failed"));

      const response = await patchRequest({ stage: SquadStage.ENTRIES });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ message: "error patching stage - connection failed" });
    });

    it("should return 500 when the request body is not valid JSON", async () => {
      const response = await PATCH(
        new Request(url + stageId, {
          method: "PATCH",
          body: "not json",
          headers: { "Content-Type": "application/json" },
        }),
        { params: Promise.resolve({ id: stageId }) }
      );

      expect(response.status).toBe(500);
      expect(prismaMock.stage.update).not.toHaveBeenCalled();
    });
  });
});
