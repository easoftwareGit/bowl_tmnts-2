/**
 * @jest-environment node
 */
// Tests for src/app/api/stages/squad/[squadId]/route.ts using mocked prisma.
// No database or server needed.
import { GET } from "@/app/api/stages/squad/[squadId]/route";
import { prismaMock } from "../../../../prismaMock";
import { SquadStage } from "@prisma/client";

// The URL only needs to be valid; no server is running
const url = "http://localhost:3000/api/stages/squad/";

const notFoundSquadId = "sqd_01234567890123456789012345678901";
const aStageId = "stg_01234567890123456789012345678901";

// fixed dates for the rows prisma "returns"
const dates = {
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-01-01T00:00:00.000Z"),
};

// from prisma/seed.ts
const testStageRow = {
  id: "stg_c5f562c4c4304d919ac43fead73123e2",
  squad_id: "sqd_7116ce5f80164830830a7157eb093396",
  stage: SquadStage.DEFINE,
  stage_set_at: new Date("2022-10-23T12:00:00.000Z"),
  scores_started_at: null,
  stage_override_enabled: false,
  stage_override_at: null,
  stage_override_reason: "",
  ...dates,
};
const wholeTmntStageRow = {
  id: "stg_124dd9efc30f4352b691dfd93d1e284e",
  squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
  stage: SquadStage.SCORES,
  stage_set_at: new Date("2024-07-01T00:00:00.000Z"),
  scores_started_at: null,
  stage_override_enabled: false,
  stage_override_at: null,
  stage_override_reason: "",
  ...dates,
};

// calls GET with the route's params arg
const getRequest = (squadId: string) =>
  GET(new Request(url + squadId), {
    params: Promise.resolve({ squadId }),
  });

describe("Stages - API: /api/stages", () => {
  describe("GET one stage from squad API: /api/stages/squad/:squadId", () => {
    it("should get one stage", async () => {
      prismaMock.stage.findMany.mockResolvedValue([testStageRow]);

      const response = await getRequest(testStageRow.squad_id);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(prismaMock.stage.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.stage.findMany).toHaveBeenCalledWith({
        where: { squad_id: testStageRow.squad_id },
      });

      const gotStage = body.stage;
      expect(gotStage.id).toBe(testStageRow.id);
      expect(gotStage.squad_id).toBe(testStageRow.squad_id);
      expect(gotStage.stage).toBe(SquadStage.DEFINE);
      expect(gotStage.stage_set_at).toBe("2022-10-23T12:00:00.000Z");
      expect(gotStage.scores_started_at).toBeNull();
      expect(gotStage.stage_override_enabled).toBe(false);
      expect(gotStage.stage_override_at).toBeNull();
      expect(
        gotStage.stage_override_reason === "" ||
          gotStage.stage_override_reason === null
      ).toBe(true);
    });

    it("should get one stage - Whole tmnt", async () => {
      prismaMock.stage.findMany.mockResolvedValue([wholeTmntStageRow]);

      const response = await getRequest(wholeTmntStageRow.squad_id);
      const body = await response.json();

      expect(response.status).toBe(200);
      const gotStage = body.stage;
      expect(gotStage.id).toBe(wholeTmntStageRow.id);
      expect(gotStage.squad_id).toBe(wholeTmntStageRow.squad_id);
      expect(gotStage.stage).toBe(SquadStage.SCORES);
      expect(gotStage.stage_set_at).toBe("2024-07-01T00:00:00.000Z");
      expect(gotStage.scores_started_at).toBeNull();
      expect(gotStage.stage_override_enabled).toBe(false);
      expect(gotStage.stage_override_at).toBeNull();
      expect(
        gotStage.stage_override_reason === "" ||
          gotStage.stage_override_reason === null
      ).toBe(true);
    });

    it("should get an edited stage", async () => {
      const dateStr = "2025-09-01T00:00:00.000Z";
      const editedRow = {
        ...testStageRow,
        stage: SquadStage.SCORES,
        stage_set_at: new Date(dateStr),
        scores_started_at: new Date(dateStr),
        stage_override_enabled: true,
        stage_override_at: new Date(dateStr),
        stage_override_reason: "test reason",
      };
      prismaMock.stage.findMany.mockResolvedValue([editedRow]);

      const response = await getRequest(editedRow.squad_id);
      const body = await response.json();

      expect(response.status).toBe(200);
      const gotStage = body.stage;
      expect(gotStage.id).toBe(editedRow.id);
      expect(gotStage.squad_id).toBe(editedRow.squad_id);
      expect(gotStage.stage).toBe(SquadStage.SCORES);
      expect(gotStage.stage_set_at).toBe(dateStr);
      expect(gotStage.scores_started_at).toBe(dateStr);
      expect(gotStage.stage_override_enabled).toBe(true);
      expect(gotStage.stage_override_at).toBe(dateStr);
      expect(gotStage.stage_override_reason).toBe("test reason");
    });

    it("should return the first stage when more than one is found", async () => {
      const secondRow = { ...testStageRow, id: aStageId };
      prismaMock.stage.findMany.mockResolvedValue([testStageRow, secondRow]);

      const response = await getRequest(testStageRow.squad_id);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.stage.id).toBe(testStageRow.id);
    });

    it("should NOT get a stage when squad ID is invalid", async () => {
      const response = await getRequest("test");
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ error: "invalid request" });
      expect(prismaMock.stage.findMany).not.toHaveBeenCalled();
    });

    it("should NOT get a stage when ID is valid, but not a squad ID", async () => {
      const response = await getRequest(aStageId);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ error: "invalid request" });
      expect(prismaMock.stage.findMany).not.toHaveBeenCalled();
    });

    it("should NOT get a stage when squad ID is not found", async () => {
      prismaMock.stage.findMany.mockResolvedValue([]);

      const response = await getRequest(notFoundSquadId);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ error: "not found" });
      expect(prismaMock.stage.findMany).toHaveBeenCalledWith({
        where: { squad_id: notFoundSquadId },
      });
    });

    it("should NOT get a stage when prisma returns null", async () => {
      prismaMock.stage.findMany.mockResolvedValue(null as never);

      const response = await getRequest(notFoundSquadId);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ error: "not found" });
    });

    it("should return 500 when prisma throws", async () => {
      prismaMock.stage.findMany.mockRejectedValue(
        new Error("connection failed")
      );

      const response = await getRequest(testStageRow.squad_id);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({
        message: "error getting stages for squad - connection failed",
      });
    });
  });
});
