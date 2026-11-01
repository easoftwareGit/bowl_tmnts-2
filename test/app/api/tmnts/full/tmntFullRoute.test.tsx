/**
 * @jest-environment node
 */
// Tests for src/app/api/tmnts/full/[id]/route.ts using mocked prisma and auth.
// No database or server needed.
//
// PUT builds an array of prisma queries and runs them with the batch form
// prisma.$transaction(queries). Here every prisma method used by PUT returns
// a name tag (e.g. "tmnt.deleteMany"), so the array passed to $transaction
// shows exactly which queries ran, and in what order.
//
// Stage rows are managed independently of the tmnt (created by the client
// after a NEW tmnt is saved, changed by the stage routes). PUT only reads
// the existing stage rows BEFORE the transaction (stage.findMany) and
// re-creates them unchanged after the squads (stage.createMany). The stage
// sent in the request body is never written.
//
// sanitizeFullTmnt, validateFullTmnt and tmntFullDataForPrisma are the REAL
// functions, so the request body must be valid full tmnt data (mockTmntFullData).
import { NextResponse } from "next/server";
import { GET, PUT } from "@/app/api/tmnts/full/[id]/route";
import { prismaMock } from "../../../../prismaMock";
import { requireDirector } from "@/lib/auth/requireDirector";
import { tmntFullDataForPrisma } from "@/app/api/tmnts/tmntDataForPrisma";
import type { tmntFullType } from "@/lib/types/types";
import { mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { SquadStage } from "@prisma/client";
import { cloneDeep } from "lodash";

// Replace the auth check with a mock function each test can control
jest.mock("@/lib/auth/requireDirector", () => ({
  requireDirector: jest.fn(),
}));
const mockRequireDirector = requireDirector as jest.MockedFunction<
  typeof requireDirector
>;

// Keep the real tmntFullDataForPrisma, but wrap it in a jest.fn so a test
// can make it return { ok: false, error } (the route's "invalid tmnt data"
// 422 branch) or change what it converted
jest.mock("@/app/api/tmnts/tmntDataForPrisma", () => {
  const actual = jest.requireActual("@/app/api/tmnts/tmntDataForPrisma");
  return { ...actual, tmntFullDataForPrisma: jest.fn() };
});
const mockTmntFullDataForPrisma = tmntFullDataForPrisma as jest.MockedFunction<
  typeof tmntFullDataForPrisma
>;
const actualTmntFullDataForPrisma = jest.requireActual(
  "@/app/api/tmnts/tmntDataForPrisma"
).tmntFullDataForPrisma as typeof tmntFullDataForPrisma;

// The URL only needs to be valid; the route reads the id from params, not the URL
const url = "http://localhost:3000/api/tmnts/full";

// Next.js passes route params as a Promise; this builds the 2nd argument
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

const getRequest = (id: string) => new Request(`${url}/${id}`);

// builds the PUT request with a JSON body
const putRequest = (id: string, body: unknown) =>
  new Request(`${url}/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

const tmntId = mockTmntFullData.tmnt.id;
const otherTmntId = "tmt_01234567890123456789012345678901"; // valid format, different tmnt
const nonTmntId = "evt_01234567890123456789012345678901"; // valid format, wrong table

const notLoggedIn = () =>
  NextResponse.json({ message: "not logged in" }, { status: 401 });
const notAuthorized = () =>
  NextResponse.json({ message: "not authorized" }, { status: 403 });

// valid full tmnt data with no brkt refunds, so each test starts from a
// known state
const baseTmnt = (): tmntFullType => {
  const data = cloneDeep(mockTmntFullData);
  data.brktEntries.forEach((be) => {
    be.num_refunds = 0;
  });
  return data;
};

// a stage row as stage.findMany returns it from the database
const setAt = new Date("2026-10-01T10:00:00.000Z");
const dbStageRow = (squadId: string, overrides: Record<string, unknown> = {}) => ({
  id: "stg_0123456789abcdef0123456789abcdef",
  squad_id: squadId,
  stage: SquadStage.DEFINE,
  stage_set_at: setAt,
  scores_started_at: null,
  stage_override_enabled: false,
  stage_override_at: null,
  stage_override_reason: "",
  ...overrides,
});

// first argument of the first call to a mock, typed loosely for checking
const firstArg = (fn: unknown) => (fn as jest.Mock).mock.calls[0][0];

// order a mock was first called in, across all mocks
const callOrder = (fn: unknown) => (fn as jest.Mock).mock.invocationCallOrder[0];

// the query array PUT passed to prisma.$transaction
const txQueries = () => firstArg(prismaMock.$transaction) as string[];

// queries that are always in the batch, in route order
const fixedQueries = [
  "tmnt.deleteMany",
  "tmnt.create",
  "event.createMany",
  "div.createMany",
  "squad.createMany",
  "stage.createMany",
  "lane.createMany",
  "pot.createMany",
  "brkt.createMany",
  "elim.createMany",
  "player.createMany",
  "div_Entry.createMany",
  "pot_Entry.createMany",
  "elim_Entry.createMany",
  "money.createMany",
];
const lastQueries = ["one_Brkt.createMany", "brkt_Seed.createMany"];

// makes each prisma method PUT uses return its own name, so the query
// array shows which call is which
const tagQueries = () => {
  const tag = (fn: unknown, name: string) =>
    (fn as jest.Mock).mockReturnValue(name);
  tag(prismaMock.tmnt.deleteMany, "tmnt.deleteMany");
  tag(prismaMock.tmnt.create, "tmnt.create");
  tag(prismaMock.event.createMany, "event.createMany");
  tag(prismaMock.div.createMany, "div.createMany");
  tag(prismaMock.squad.createMany, "squad.createMany");
  tag(prismaMock.stage.createMany, "stage.createMany");
  tag(prismaMock.lane.createMany, "lane.createMany");
  tag(prismaMock.pot.createMany, "pot.createMany");
  tag(prismaMock.brkt.createMany, "brkt.createMany");
  tag(prismaMock.elim.createMany, "elim.createMany");
  tag(prismaMock.player.createMany, "player.createMany");
  tag(prismaMock.div_Entry.createMany, "div_Entry.createMany");
  tag(prismaMock.pot_Entry.createMany, "pot_Entry.createMany");
  tag(prismaMock.elim_Entry.createMany, "elim_Entry.createMany");
  tag(prismaMock.money.createMany, "money.createMany");
  tag(prismaMock.brkt_Entry.createMany, "brkt_Entry.createMany");
  tag(prismaMock.brkt_Entry.create, "brkt_Entry.create");
  tag(prismaMock.one_Brkt.createMany, "one_Brkt.createMany");
  tag(prismaMock.brkt_Seed.createMany, "brkt_Seed.createMany");
};

beforeEach(() => {
  // these jest.fn mocks are not reset by prismaMock, so clear their calls
  // (and any leftover mock...Once values) before each test
  mockRequireDirector.mockReset();
  mockTmntFullDataForPrisma.mockReset();

  // default for every test: user is a logged-in director
  mockRequireDirector.mockResolvedValue(null);
  mockTmntFullDataForPrisma.mockImplementation(actualTmntFullDataForPrisma);

  tagQueries();
  // default: no stage rows yet (a new tmnt)
  prismaMock.stage.findMany.mockResolvedValue([]);
  // batch transaction: just resolve, the queries are only checked
  prismaMock.$transaction.mockResolvedValue([] as never);
});

describe("Tmnts - API: /api/tmnts/full/:id", () => {
  describe("GET", () => {
    // what findUnique returns; only needs to round trip through JSON
    const dbTmntFull = {
      id: tmntId,
      tmnt_name: mockTmntFullData.tmnt.tmnt_name,
      bowl: { id: mockTmntFullData.tmnt.bowl_id },
      events: [],
      divs: [],
    };

    it("should GET without checking auth", async () => {
      prismaMock.tmnt.findUnique.mockResolvedValue(dbTmntFull as never);
      mockRequireDirector.mockResolvedValue(notLoggedIn());

      const response = await GET(getRequest(tmntId), ctx(tmntId));

      // GET is public; only PUT requires a director
      expect(response.status).toBe(200);
      expect(mockRequireDirector).not.toHaveBeenCalled();
    });

    it("should GET full tmnt data", async () => {
      prismaMock.tmnt.findUnique.mockResolvedValue(dbTmntFull as never);

      const response = await GET(getRequest(tmntId), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.tmntFullData).toEqual(dbTmntFull);
      expect(prismaMock.tmnt.findUnique).toHaveBeenCalledTimes(1);
    });

    it("should query by id and include all child tables in sort order", async () => {
      prismaMock.tmnt.findUnique.mockResolvedValue(dbTmntFull as never);

      await GET(getRequest(tmntId), ctx(tmntId));

      const args = firstArg(prismaMock.tmnt.findUnique);
      expect(args.where).toEqual({ id: tmntId });
      expect(args.include.bowl).toBe(true);

      // events -> squads -> lanes, players, moneys, stage
      const squads = args.include.events.include.squads;
      expect(squads.orderBy).toEqual({ sort_order: "asc" });
      expect(squads.include.lanes.orderBy).toEqual({ lane_number: "asc" });
      expect(squads.include.players.orderBy).toEqual([
        { squad_id: "asc" },
        { lane: "asc" },
        { position: "asc" },
      ]);
      expect(squads.include.moneys.orderBy).toEqual({ sort_order: "asc" });
      expect(squads.include.stage).toBe(true);

      // divs -> brkts, div_entries, elims, pots
      const divs = args.include.divs;
      expect(divs.orderBy).toEqual({ sort_order: "asc" });
      expect(divs.include.brkts.orderBy).toEqual({ sort_order: "asc" });
      expect(divs.include.brkts.include.brkt_entries).toEqual({
        include: { brkt_refunds: true },
      });
      expect(divs.include.brkts.include.one_brkts).toEqual({
        include: { brkt_seeds: true },
      });
      expect(divs.include.div_entries.select).toEqual(
        expect.objectContaining({
          id: true,
          squad_id: true,
          div_id: true,
          player_id: true,
          fee: true,
          player: { select: { average: true } },
          div: { select: { hdcp_from: true, int_hdcp: true, hdcp_per: true } },
        })
      );
      expect(divs.include.elims).toEqual({
        include: { elim_entries: true },
        orderBy: { sort_order: "asc" },
      });
      expect(divs.include.pots).toEqual({
        include: { pot_entries: true },
        orderBy: { sort_order: "asc" },
      });
    });

    it.each([
      { desc: "ID is invalid", id: "test" },
      { desc: "ID is valid, but not a tmnt ID", id: nonTmntId },
      { desc: "ID is empty", id: "" },
    ])("should return 404 when $desc", async ({ id }) => {
      const response = await GET(getRequest(id), ctx(id));
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ error: "invalid request" });
      expect(prismaMock.tmnt.findUnique).not.toHaveBeenCalled();
    });

    it("should return 404 when the tmnt is not found", async () => {
      prismaMock.tmnt.findUnique.mockResolvedValue(null);

      const response = await GET(getRequest(otherTmntId), ctx(otherTmntId));
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ error: "not found" });
    });

    it("should return 500 when prisma throws", async () => {
      prismaMock.tmnt.findUnique.mockRejectedValue(new Error("connection failed"));

      const response = await GET(getRequest(tmntId), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ message: "error getting tmnt full data - connection failed" });
    });
  });

  describe("PUT - auth", () => {
    it("should return 401 when not logged in", async () => {
      mockRequireDirector.mockResolvedValue(notLoggedIn());

      const response = await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({ message: "not logged in" });
      expect(prismaMock.stage.findMany).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it("should return 403 when the user is not a director or admin", async () => {
      mockRequireDirector.mockResolvedValue(notAuthorized());

      const response = await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body).toEqual({ message: "not authorized" });
      expect(prismaMock.stage.findMany).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it("should check auth before validating the ID", async () => {
      mockRequireDirector.mockResolvedValue(notLoggedIn());

      const response = await PUT(putRequest("test", baseTmnt()), ctx("test"));

      // 401, not 404: auth runs first
      expect(response.status).toBe(401);
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });
  });

  describe("PUT - invalid requests", () => {
    it.each([
      { desc: "ID is invalid", id: "test" },
      { desc: "ID is valid, but not a tmnt ID", id: nonTmntId },
      { desc: "ID is empty", id: "" },
    ])("should return 404 when $desc", async ({ id }) => {
      const response = await PUT(putRequest(id, baseTmnt()), ctx(id));
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ error: "invalid request" });
      expect(prismaMock.stage.findMany).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it("should return 422 when the URL id does not match tmnt.id", async () => {
      const response = await PUT(
        putRequest(otherTmntId, baseTmnt()),
        ctx(otherTmntId)
      );
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body.error).toBe("validation failed");
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    // same invalid data as the integration test
    it.each([
      {
        desc: "invalid tmnt data",
        change: (d: tmntFullType) => { d.tmnt.tmnt_name = ""; },
      },
      {
        desc: "no events",
        change: (d: tmntFullType) => { d.events = []; },
      },
      {
        desc: "invalid events",
        change: (d: tmntFullType) => { d.events[0].id = "invalid"; },
      },
      {
        desc: "no divs",
        change: (d: tmntFullType) => { d.divs = []; },
      },
      {
        desc: "invalid divs",
        change: (d: tmntFullType) => { d.divs[0].id = "invalid"; },
      },
      {
        desc: "no squads",
        change: (d: tmntFullType) => { d.squads = []; },
      },
      {
        desc: "invalid squads",
        change: (d: tmntFullType) => { d.squads[0].id = "invalid"; },
      },
      // validateFullTmnt still checks the stage in the body, even though
      // PUT no longer writes it. If stage validation is removed from
      // validateFullTmnt, delete these two cases.
      {
        desc: "no stage",
        change: (d: tmntFullType) => {
          d.stage = null as unknown as tmntFullType["stage"];
        },
      },
      {
        desc: "invalid stage",
        change: (d: tmntFullType) => { d.stage.id = "invalid"; },
      },
      {
        desc: "no lanes",
        change: (d: tmntFullType) => { d.lanes = []; },
      },
      {
        desc: "invalid lanes",
        change: (d: tmntFullType) => { d.lanes[0].id = "invalid"; },
      },
      {
        desc: "invalid pots",
        change: (d: tmntFullType) => { d.pots[0].id = "invalid"; },
      },
      {
        desc: "invalid brkts",
        change: (d: tmntFullType) => { d.brkts[0].id = "invalid"; },
      },
      {
        desc: "invalid elims",
        change: (d: tmntFullType) => { d.elims[0].id = "invalid"; },
      },
    ])("should return 422 with $desc", async ({ change }) => {
      const invalid = baseTmnt();
      change(invalid);

      const response = await PUT(putRequest(tmntId, invalid), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body.error).toBe("validation failed");
      expect(prismaMock.stage.findMany).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });
  });

  describe("PUT - conversion for prisma fails", () => {
    // what tmntFullDataForPrisma reports for a bad row; the route passes it
    // through as "details" without reading it, so any JSON value works here
    const conversionError = {
      table: "brktEntries",
      index: 0,
      message: "invalid time_stamp",
    };
    const conversionFailed = () =>
      mockTmntFullDataForPrisma.mockReturnValueOnce({
        ok: false,
        error: conversionError,
      } as unknown as ReturnType<typeof tmntFullDataForPrisma>);

    it("should return 422 with the conversion error as details", async () => {
      conversionFailed();

      const response = await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body).toEqual({ error: "invalid tmnt data", details: conversionError });
    });

    it("should not read stages or run the transaction", async () => {
      conversionFailed();

      await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));

      expect(prismaMock.stage.findMany).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it("should convert the sanitized, validated data", async () => {
      await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));

      // called once, after validation passed, with the tmnt from the body
      expect(mockTmntFullDataForPrisma).toHaveBeenCalledTimes(1);
      expect(firstArg(mockTmntFullDataForPrisma).tmnt.id).toBe(tmntId);
    });
  });

  describe("PUT - success", () => {
    it("should PUT (replace) a full tmnt, all child, grandchild tables", async () => {
      const tmnt = baseTmnt();

      const response = await PUT(putRequest(tmntId, tmnt), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({ success: true });
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);

      // delete the tmnt (cascades to all children), then re-create it all
      expect(prismaMock.tmnt.deleteMany).toHaveBeenCalledWith({
        where: { id: tmntId },
      });
      expect(firstArg(prismaMock.tmnt.create).data).toEqual(
        expect.objectContaining({
          id: tmntId,
          tmnt_name: tmnt.tmnt.tmnt_name,
        })
      );
      expect(firstArg(prismaMock.event.createMany).data).toHaveLength(tmnt.events.length);
      expect(firstArg(prismaMock.div.createMany).data).toHaveLength(tmnt.divs.length);
      expect(firstArg(prismaMock.squad.createMany).data).toHaveLength(tmnt.squads.length);
      expect(firstArg(prismaMock.lane.createMany).data).toHaveLength(tmnt.lanes.length);
      expect(firstArg(prismaMock.pot.createMany).data).toHaveLength(tmnt.pots.length);
      expect(firstArg(prismaMock.brkt.createMany).data).toHaveLength(tmnt.brkts.length);
      expect(firstArg(prismaMock.elim.createMany).data).toHaveLength(tmnt.elims.length);
      expect(firstArg(prismaMock.player.createMany).data).toHaveLength(tmnt.players.length);
      expect(firstArg(prismaMock.div_Entry.createMany).data).toHaveLength(
        tmnt.divEntries.length
      );
      expect(firstArg(prismaMock.pot_Entry.createMany).data).toHaveLength(
        tmnt.potEntries.length
      );
      expect(firstArg(prismaMock.elim_Entry.createMany).data).toHaveLength(
        tmnt.elimEntries.length
      );
      expect(firstArg(prismaMock.money.createMany).data).toHaveLength(tmnt.moneys.length);
      expect(firstArg(prismaMock.one_Brkt.createMany).data).toHaveLength(
        tmnt.oneBrkts.length
      );
      expect(firstArg(prismaMock.brkt_Seed.createMany).data).toHaveLength(
        tmnt.brktSeeds.length
      );
    });

    it("should run all queries in one transaction, delete first, seeds last", async () => {
      await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));

      expect(txQueries()).toEqual([
        ...fixedQueries,
        "brkt_Entry.createMany",
        ...lastQueries,
      ]);
    });

    it("should not write anything outside the transaction", async () => {
      await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));

      // batch style: the queries are built, then run only by $transaction
      expect(prismaMock.tmnt.update).not.toHaveBeenCalled();
      expect(prismaMock.tmnt.delete).not.toHaveBeenCalled();
      expect(prismaMock.stage.update).not.toHaveBeenCalled();
      expect(prismaMock.stage.upsert).not.toHaveBeenCalled();
      expect(prismaMock.stage.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe("PUT - stage rows", () => {
    it("should read existing stages for the tmnt's squads", async () => {
      const tmnt = baseTmnt();

      await PUT(putRequest(tmntId, tmnt), ctx(tmntId));

      expect(prismaMock.stage.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.stage.findMany).toHaveBeenCalledWith({
        where: { squad_id: { in: tmnt.squads.map((s) => s.id) } },
      });
    });

    it("should read stages before running the transaction", async () => {
      await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));

      expect(callOrder(prismaMock.stage.findMany)).toBeLessThan(
        callOrder(prismaMock.$transaction)
      );
    });

    it("should re-create no stages for a new tmnt", async () => {
      // default beforeEach: findMany returns []
      const response = await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));

      expect(response.status).toBe(200);
      expect(prismaMock.stage.createMany).toHaveBeenCalledWith({ data: [] });
      expect(prismaMock.stage.create).not.toHaveBeenCalled();
    });

    it("should re-create existing stages unchanged when editing a tmnt", async () => {
      const tmnt = baseTmnt();
      const existing = [dbStageRow(tmnt.squads[0].id)];
      prismaMock.stage.findMany.mockResolvedValue(existing as never);

      const response = await PUT(putRequest(tmntId, tmnt), ctx(tmntId));

      expect(response.status).toBe(200);
      expect(prismaMock.stage.createMany).toHaveBeenCalledWith({ data: existing });
    });

    it("should keep stage_set_at, scores and override values from the database", async () => {
      const tmnt = baseTmnt();
      const scoresAt = new Date("2026-10-02T15:30:00.000Z");
      const overrideAt = new Date("2026-10-02T16:00:00.000Z");
      const existing = [
        dbStageRow(tmnt.squads[0].id, {
          stage: SquadStage.SCORES,
          scores_started_at: scoresAt,
          stage_override_enabled: true,
          stage_override_at: overrideAt,
          stage_override_reason: "test reason",
        }),
      ];
      prismaMock.stage.findMany.mockResolvedValue(existing as never);

      await PUT(putRequest(tmntId, tmnt), ctx(tmntId));

      const stageData = firstArg(prismaMock.stage.createMany).data;
      expect(stageData).toHaveLength(1);
      expect(stageData[0]).toEqual({
        id: existing[0].id,
        squad_id: tmnt.squads[0].id,
        stage: SquadStage.SCORES,
        stage_set_at: setAt, // NOT reset to now
        scores_started_at: scoresAt,
        stage_override_enabled: true,
        stage_override_at: overrideAt,
        stage_override_reason: "test reason",
      });
    });

    it("should ignore the stage sent in the request body", async () => {
      const tmnt = baseTmnt();
      // body stage differs from the database row in every way that matters
      tmnt.stage.id = "stg_fedcba9876543210fedcba9876543210";
      tmnt.stage.stage = SquadStage.ENTRIES;
      const existing = [dbStageRow(tmnt.squads[0].id)];
      prismaMock.stage.findMany.mockResolvedValue(existing as never);

      const response = await PUT(putRequest(tmntId, tmnt), ctx(tmntId));

      expect(response.status).toBe(200);
      expect(prismaMock.stage.create).not.toHaveBeenCalled();
      const stageData = firstArg(prismaMock.stage.createMany).data;
      expect(stageData[0].id).toBe(existing[0].id);
      expect(stageData[0].stage).toBe(SquadStage.DEFINE);
    });

    it("should re-create stages after squads and before lanes", async () => {
      await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));

      const q = txQueries();
      expect(q.indexOf("stage.createMany")).toBe(q.indexOf("squad.createMany") + 1);
      expect(q.indexOf("stage.createMany")).toBeLessThan(q.indexOf("lane.createMany"));
    });

    it("should return 500 and not run the transaction when reading stages fails", async () => {
      prismaMock.stage.findMany.mockRejectedValue(new Error("connection failed"));

      const response = await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ message: "Error replacing tmnt data - connection failed" });
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });
  });

  describe("PUT - brkt entries and refunds", () => {
    it("should createMany all brkt entries when none have refunds", async () => {
      const tmnt = baseTmnt();

      const response = await PUT(putRequest(tmntId, tmnt), ctx(tmntId));

      expect(response.status).toBe(200);
      const beData = firstArg(prismaMock.brkt_Entry.createMany).data;
      expect(beData).toHaveLength(tmnt.brktEntries.length);
      expect(beData.map((be: { id: string }) => be.id)).toEqual(
        tmnt.brktEntries.map((be) => be.id)
      );
      // time_stamp comes from the converted data, already a Date
      beData.forEach((be: { time_stamp: unknown }) => {
        expect(be.time_stamp).toBeInstanceOf(Date);
      });
      expect(prismaMock.brkt_Entry.create).not.toHaveBeenCalled();
    });

    it("should create brkt entries with refunds one at a time, with brkt_refunds", async () => {
      const tmnt = baseTmnt();
      tmnt.brktEntries[0].num_brackets = 100;
      tmnt.brktEntries[0].num_refunds = 92;
      const withRefund = tmnt.brktEntries[0];

      const response = await PUT(putRequest(tmntId, tmnt), ctx(tmntId));

      expect(response.status).toBe(200);
      // the refund entry is left out of createMany
      const beData = firstArg(prismaMock.brkt_Entry.createMany).data;
      expect(beData).toHaveLength(tmnt.brktEntries.length - 1);
      expect(beData.map((be: { id: string }) => be.id)).not.toContain(withRefund.id);

      // and created on its own, with its refund child row
      expect(prismaMock.brkt_Entry.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.brkt_Entry.create).toHaveBeenCalledWith({
        data: {
          id: withRefund.id,
          brkt_id: withRefund.brkt_id,
          player_id: withRefund.player_id,
          num_brackets: 100,
          time_stamp: expect.any(Date),
          brkt_refunds: { create: { num_refunds: 92 } },
        },
        include: { brkt_refunds: true },
      });

      // createMany, then the single create, then brkts and seeds
      expect(txQueries()).toEqual([
        ...fixedQueries,
        "brkt_Entry.createMany",
        "brkt_Entry.create",
        ...lastQueries,
      ]);
    });

    it("should skip createMany and create every brkt entry when all have refunds", async () => {
      const tmnt = baseTmnt();
      tmnt.brktEntries.forEach((be) => {
        be.num_refunds = 1;
      });

      const response = await PUT(putRequest(tmntId, tmnt), ctx(tmntId));

      expect(response.status).toBe(200);
      expect(prismaMock.brkt_Entry.createMany).not.toHaveBeenCalled();
      expect(prismaMock.brkt_Entry.create).toHaveBeenCalledTimes(
        tmnt.brktEntries.length
      );
      expect(txQueries()).toEqual([
        ...fixedQueries,
        ...tmnt.brktEntries.map(() => "brkt_Entry.create"),
        ...lastQueries,
      ]);
    });

    it("should split brkt entries using the converted data, not the request body", async () => {
      // body has no refunds; the converted data gives entry 0 a refund and
      // a fixed time_stamp, so only the converted values can produce this
      const convertedTimeStamp = new Date("2026-10-03T09:00:00.000Z");
      mockTmntFullDataForPrisma.mockImplementationOnce((data) => {
        const result = actualTmntFullDataForPrisma(data);
        if (result.ok) {
          result.data.brktEntriesData[0].num_refunds = 5;
          result.data.brktEntriesData[0].time_stamp = convertedTimeStamp;
        }
        return result;
      });
      const tmnt = baseTmnt();

      const response = await PUT(putRequest(tmntId, tmnt), ctx(tmntId));

      expect(response.status).toBe(200);
      expect(prismaMock.brkt_Entry.create).toHaveBeenCalledTimes(1);
      const created = firstArg(prismaMock.brkt_Entry.create).data;
      expect(created.id).toBe(tmnt.brktEntries[0].id);
      expect(created.time_stamp).toEqual(convertedTimeStamp);
      expect(created.brkt_refunds).toEqual({ create: { num_refunds: 5 } });
      expect(firstArg(prismaMock.brkt_Entry.createMany).data).toHaveLength(
        tmnt.brktEntries.length - 1
      );
    });
  });

  describe("PUT - errors and rollback", () => {
    it("should return 409 when the transaction hits a duplicate id (rollback)", async () => {
      // the data is valid, but the database rejects it with a unique
      // constraint error, so the whole batch transaction rolls back
      prismaMock.$transaction.mockRejectedValue({ code: "P2002" });

      const response = await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(409);
      expect(body).toEqual({ message: "Error replacing tmnt data" });
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it("should return 409 for a Prisma foreign key error", async () => {
      prismaMock.$transaction.mockRejectedValue({ code: "P2003" });

      const response = await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));

      expect(response.status).toBe(409);
    });

    it("should return 404 when a record is not found", async () => {
      prismaMock.$transaction.mockRejectedValue({ code: "P2025" });

      const response = await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ message: "Error replacing tmnt data" });
    });

    it("should return 500 when the transaction throws", async () => {
      prismaMock.$transaction.mockRejectedValue(new Error("connection failed"));

      const response = await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ message: "Error replacing tmnt data - connection failed" });
    });
  });
});


// /**
//  * @jest-environment node
//  */
// // Tests for src/app/api/tmnts/full/[id]/route.ts using mocked prisma and auth.
// // No database or server needed.
// //
// // PUT builds an array of prisma queries and runs them with the batch form
// // prisma.$transaction(queries). Here every prisma method used by PUT returns
// // a name tag (e.g. "tmnt.deleteMany"), so the array passed to $transaction
// // shows exactly which queries ran, and in what order.
// //
// // Stage rows are managed independently of the tmnt (created by the client
// // after a NEW tmnt is saved, changed by the stage routes). PUT only reads
// // the existing stage rows BEFORE the transaction (stage.findMany) and
// // re-creates them unchanged after the squads (stage.createMany). The stage
// // sent in the request body is never written.
// //
// // sanitizeFullTmnt, validateFullTmnt and tmntFullDataForPrisma are the REAL
// // functions, so the request body must be valid full tmnt data (mockTmntFullData).
// import { NextResponse } from "next/server";
// import { GET, PUT } from "@/app/api/tmnts/full/[id]/route";
// import { prismaMock } from "../../../../prismaMock";
// import { requireDirector } from "@/lib/auth/requireDirector";
// import { tmntFullDataForPrisma } from "@/app/api/tmnts/tmntDataForPrisma";
// import type { tmntFullType } from "@/lib/types/types";
// import { mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
// import { SquadStage } from "@prisma/client";
// import { cloneDeep } from "lodash";

// // Replace the auth check with a mock function each test can control
// jest.mock("@/lib/auth/requireDirector", () => ({
//   requireDirector: jest.fn(),
// }));
// const mockRequireDirector = requireDirector as jest.MockedFunction<
//   typeof requireDirector
// >;

// // Keep the real tmntFullDataForPrisma, but wrap it in a jest.fn so one test
// // can make it return null (the route's "invalid tmnt data" 404 branch)
// jest.mock("@/app/api/tmnts/tmntDataForPrisma", () => {
//   const actual = jest.requireActual("@/app/api/tmnts/tmntDataForPrisma");
//   return { ...actual, tmntFullDataForPrisma: jest.fn() };
// });
// const mockTmntFullDataForPrisma = tmntFullDataForPrisma as jest.MockedFunction<
//   typeof tmntFullDataForPrisma
// >;
// const actualTmntFullDataForPrisma = jest.requireActual(
//   "@/app/api/tmnts/tmntDataForPrisma"
// ).tmntFullDataForPrisma as typeof tmntFullDataForPrisma;

// // The URL only needs to be valid; the route reads the id from params, not the URL
// const url = "http://localhost:3000/api/tmnts/full";

// // Next.js passes route params as a Promise; this builds the 2nd argument
// const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

// const getRequest = (id: string) => new Request(`${url}/${id}`);

// // builds the PUT request with a JSON body
// const putRequest = (id: string, body: unknown) =>
//   new Request(`${url}/${id}`, {
//     method: "PUT",
//     body: JSON.stringify(body),
//     headers: { "Content-Type": "application/json" },
//   });

// const tmntId = mockTmntFullData.tmnt.id;
// const otherTmntId = "tmt_01234567890123456789012345678901"; // valid format, different tmnt
// const nonTmntId = "evt_01234567890123456789012345678901"; // valid format, wrong table

// const notLoggedIn = () =>
//   NextResponse.json({ message: "not logged in" }, { status: 401 });
// const notAuthorized = () =>
//   NextResponse.json({ message: "not authorized" }, { status: 403 });

// // valid full tmnt data with no brkt refunds, so each test starts from a
// // known state
// const baseTmnt = (): tmntFullType => {
//   const data = cloneDeep(mockTmntFullData);
//   data.brktEntries.forEach((be) => {
//     be.num_refunds = 0;
//   });
//   return data;
// };

// // a stage row as stage.findMany returns it from the database
// const setAt = new Date("2026-10-01T10:00:00.000Z");
// const dbStageRow = (squadId: string, overrides: Record<string, unknown> = {}) => ({
//   id: "stg_0123456789abcdef0123456789abcdef",
//   squad_id: squadId,
//   stage: SquadStage.DEFINE,
//   stage_set_at: setAt,
//   scores_started_at: null,
//   stage_override_enabled: false,
//   stage_override_at: null,
//   stage_override_reason: "",
//   ...overrides,
// });

// // first argument of the first call to a mock, typed loosely for checking
// const firstArg = (fn: unknown) => (fn as jest.Mock).mock.calls[0][0];

// // the query array PUT passed to prisma.$transaction
// const txQueries = () => firstArg(prismaMock.$transaction) as string[];

// // queries that are always in the batch, in route order
// const fixedQueries = [
//   "tmnt.deleteMany",
//   "tmnt.create",
//   "event.createMany",
//   "div.createMany",
//   "squad.createMany",
//   "stage.createMany",
//   "lane.createMany",
//   "pot.createMany",
//   "brkt.createMany",
//   "elim.createMany",
//   "player.createMany",
//   "div_Entry.createMany",
//   "pot_Entry.createMany",
//   "elim_Entry.createMany",
//   "money.createMany",
// ];
// const lastQueries = ["one_Brkt.createMany", "brkt_Seed.createMany"];

// // makes each prisma method PUT uses return its own name, so the query
// // array shows which call is which
// const tagQueries = () => {
//   const tag = (fn: unknown, name: string) =>
//     (fn as jest.Mock).mockReturnValue(name);
//   tag(prismaMock.tmnt.deleteMany, "tmnt.deleteMany");
//   tag(prismaMock.tmnt.create, "tmnt.create");
//   tag(prismaMock.event.createMany, "event.createMany");
//   tag(prismaMock.div.createMany, "div.createMany");
//   tag(prismaMock.squad.createMany, "squad.createMany");
//   tag(prismaMock.stage.createMany, "stage.createMany");
//   tag(prismaMock.lane.createMany, "lane.createMany");
//   tag(prismaMock.pot.createMany, "pot.createMany");
//   tag(prismaMock.brkt.createMany, "brkt.createMany");
//   tag(prismaMock.elim.createMany, "elim.createMany");
//   tag(prismaMock.player.createMany, "player.createMany");
//   tag(prismaMock.div_Entry.createMany, "div_Entry.createMany");
//   tag(prismaMock.pot_Entry.createMany, "pot_Entry.createMany");
//   tag(prismaMock.elim_Entry.createMany, "elim_Entry.createMany");
//   tag(prismaMock.money.createMany, "money.createMany");
//   tag(prismaMock.brkt_Entry.createMany, "brkt_Entry.createMany");
//   tag(prismaMock.brkt_Entry.create, "brkt_Entry.create");
//   tag(prismaMock.one_Brkt.createMany, "one_Brkt.createMany");
//   tag(prismaMock.brkt_Seed.createMany, "brkt_Seed.createMany");
// };

// beforeEach(() => {
//   // default for every test: user is a logged-in director
//   mockRequireDirector.mockResolvedValue(null);
//   mockTmntFullDataForPrisma.mockImplementation(actualTmntFullDataForPrisma);

//   tagQueries();
//   // default: no stage rows yet (a new tmnt)
//   prismaMock.stage.findMany.mockResolvedValue([]);
//   // batch transaction: just resolve, the queries are only checked
//   prismaMock.$transaction.mockResolvedValue([] as never);
// });

// describe("Tmnts - API: /api/tmnts/full/:id", () => {
//   describe("GET", () => {
//     // what findUnique returns; only needs to round trip through JSON
//     const dbTmntFull = {
//       id: tmntId,
//       tmnt_name: mockTmntFullData.tmnt.tmnt_name,
//       bowl: { id: mockTmntFullData.tmnt.bowl_id },
//       events: [],
//       divs: [],
//     };

//     it("should GET without checking auth", async () => {
//       prismaMock.tmnt.findUnique.mockResolvedValue(dbTmntFull as never);
//       mockRequireDirector.mockResolvedValue(notLoggedIn());

//       const response = await GET(getRequest(tmntId), ctx(tmntId));

//       // GET is public; only PUT requires a director
//       expect(response.status).toBe(200);
//       expect(mockRequireDirector).not.toHaveBeenCalled();
//     });

//     it("should GET full tmnt data", async () => {
//       prismaMock.tmnt.findUnique.mockResolvedValue(dbTmntFull as never);

//       const response = await GET(getRequest(tmntId), ctx(tmntId));
//       const body = await response.json();

//       expect(response.status).toBe(200);
//       expect(body.tmntFullData).toEqual(dbTmntFull);
//       expect(prismaMock.tmnt.findUnique).toHaveBeenCalledTimes(1);
//     });

//     it("should query by id and include all child tables in sort order", async () => {
//       prismaMock.tmnt.findUnique.mockResolvedValue(dbTmntFull as never);

//       await GET(getRequest(tmntId), ctx(tmntId));

//       const args = firstArg(prismaMock.tmnt.findUnique);
//       expect(args.where).toEqual({ id: tmntId });
//       expect(args.include.bowl).toBe(true);

//       // events -> squads -> lanes, players, moneys, stage
//       const squads = args.include.events.include.squads;
//       expect(squads.orderBy).toEqual({ sort_order: "asc" });
//       expect(squads.include.lanes.orderBy).toEqual({ lane_number: "asc" });
//       expect(squads.include.players.orderBy).toEqual([
//         { squad_id: "asc" },
//         { lane: "asc" },
//         { position: "asc" },
//       ]);
//       expect(squads.include.moneys.orderBy).toEqual({ sort_order: "asc" });
//       expect(squads.include.stage).toBe(true);

//       // divs -> brkts, div_entries, elims, pots
//       const divs = args.include.divs;
//       expect(divs.orderBy).toEqual({ sort_order: "asc" });
//       expect(divs.include.brkts.orderBy).toEqual({ sort_order: "asc" });
//       expect(divs.include.brkts.include.brkt_entries).toEqual({
//         include: { brkt_refunds: true },
//       });
//       expect(divs.include.brkts.include.one_brkts).toEqual({
//         include: { brkt_seeds: true },
//       });
//       expect(divs.include.div_entries.select).toEqual(
//         expect.objectContaining({
//           id: true,
//           squad_id: true,
//           div_id: true,
//           player_id: true,
//           fee: true,
//           player: { select: { average: true } },
//           div: { select: { hdcp_from: true, int_hdcp: true, hdcp_per: true } },
//         })
//       );
//       expect(divs.include.elims).toEqual({
//         include: { elim_entries: true },
//         orderBy: { sort_order: "asc" },
//       });
//       expect(divs.include.pots).toEqual({
//         include: { pot_entries: true },
//         orderBy: { sort_order: "asc" },
//       });
//     });

//     it.each([
//       { desc: "ID is invalid", id: "test" },
//       { desc: "ID is valid, but not a tmnt ID", id: nonTmntId },
//       { desc: "ID is empty", id: "" },
//     ])("should return 404 when $desc", async ({ id }) => {
//       const response = await GET(getRequest(id), ctx(id));
//       const body = await response.json();

//       expect(response.status).toBe(404);
//       expect(body).toEqual({ error: "invalid request" });
//       expect(prismaMock.tmnt.findUnique).not.toHaveBeenCalled();
//     });

//     it("should return 404 when the tmnt is not found", async () => {
//       prismaMock.tmnt.findUnique.mockResolvedValue(null);

//       const response = await GET(getRequest(otherTmntId), ctx(otherTmntId));
//       const body = await response.json();

//       expect(response.status).toBe(404);
//       expect(body).toEqual({ error: "not found" });
//     });

//     it("should return 500 when prisma throws", async () => {
//       prismaMock.tmnt.findUnique.mockRejectedValue(new Error("connection failed"));

//       const response = await GET(getRequest(tmntId), ctx(tmntId));
//       const body = await response.json();

//       expect(response.status).toBe(500);
//       expect(body).toEqual({ message: "error getting tmnt full data - connection failed" });
//     });
//   });

//   describe("PUT - auth", () => {
//     it("should return 401 when not logged in", async () => {
//       mockRequireDirector.mockResolvedValue(notLoggedIn());

//       const response = await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));
//       const body = await response.json();

//       expect(response.status).toBe(401);
//       expect(body).toEqual({ message: "not logged in" });
//       expect(prismaMock.stage.findMany).not.toHaveBeenCalled();
//       expect(prismaMock.$transaction).not.toHaveBeenCalled();
//     });

//     it("should return 403 when the user is not a director or admin", async () => {
//       mockRequireDirector.mockResolvedValue(notAuthorized());

//       const response = await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));
//       const body = await response.json();

//       expect(response.status).toBe(403);
//       expect(body).toEqual({ message: "not authorized" });
//       expect(prismaMock.stage.findMany).not.toHaveBeenCalled();
//       expect(prismaMock.$transaction).not.toHaveBeenCalled();
//     });

//     it("should check auth before validating the ID", async () => {
//       mockRequireDirector.mockResolvedValue(notLoggedIn());

//       const response = await PUT(putRequest("test", baseTmnt()), ctx("test"));

//       // 401, not 404: auth runs first
//       expect(response.status).toBe(401);
//       expect(prismaMock.$transaction).not.toHaveBeenCalled();
//     });
//   });

//   describe("PUT - invalid requests", () => {
//     it.each([
//       { desc: "ID is invalid", id: "test" },
//       { desc: "ID is valid, but not a tmnt ID", id: nonTmntId },
//       { desc: "ID is empty", id: "" },
//     ])("should return 404 when $desc", async ({ id }) => {
//       const response = await PUT(putRequest(id, baseTmnt()), ctx(id));
//       const body = await response.json();

//       expect(response.status).toBe(404);
//       expect(body).toEqual({ error: "invalid request" });
//       expect(prismaMock.stage.findMany).not.toHaveBeenCalled();
//       expect(prismaMock.$transaction).not.toHaveBeenCalled();
//     });

//     it("should return 422 when the URL id does not match tmnt.id", async () => {
//       const response = await PUT(
//         putRequest(otherTmntId, baseTmnt()),
//         ctx(otherTmntId)
//       );
//       const body = await response.json();

//       expect(response.status).toBe(422);
//       expect(body.error).toBe("validation failed");
//       expect(prismaMock.$transaction).not.toHaveBeenCalled();
//     });

//     // same invalid data as the integration test
//     it.each([
//       {
//         desc: "invalid tmnt data",
//         change: (d: tmntFullType) => { d.tmnt.tmnt_name = ""; },
//       },
//       {
//         desc: "no events",
//         change: (d: tmntFullType) => { d.events = []; },
//       },
//       {
//         desc: "invalid events",
//         change: (d: tmntFullType) => { d.events[0].id = "invalid"; },
//       },
//       {
//         desc: "no divs",
//         change: (d: tmntFullType) => { d.divs = []; },
//       },
//       {
//         desc: "invalid divs",
//         change: (d: tmntFullType) => { d.divs[0].id = "invalid"; },
//       },
//       {
//         desc: "no squads",
//         change: (d: tmntFullType) => { d.squads = []; },
//       },
//       {
//         desc: "invalid squads",
//         change: (d: tmntFullType) => { d.squads[0].id = "invalid"; },
//       },
//       // validateFullTmnt still checks the stage in the body, even though
//       // PUT no longer writes it. If stage validation is removed from
//       // validateFullTmnt, delete these two cases.
//       {
//         desc: "no stage",
//         change: (d: tmntFullType) => {
//           d.stage = null as unknown as tmntFullType["stage"];
//         },
//       },
//       {
//         desc: "invalid stage",
//         change: (d: tmntFullType) => { d.stage.id = "invalid"; },
//       },
//       {
//         desc: "no lanes",
//         change: (d: tmntFullType) => { d.lanes = []; },
//       },
//       {
//         desc: "invalid lanes",
//         change: (d: tmntFullType) => { d.lanes[0].id = "invalid"; },
//       },
//       {
//         desc: "invalid pots",
//         change: (d: tmntFullType) => { d.pots[0].id = "invalid"; },
//       },
//       {
//         desc: "invalid brkts",
//         change: (d: tmntFullType) => { d.brkts[0].id = "invalid"; },
//       },
//       {
//         desc: "invalid elims",
//         change: (d: tmntFullType) => { d.elims[0].id = "invalid"; },
//       },
//     ])("should return 422 with $desc", async ({ change }) => {
//       const invalid = baseTmnt();
//       change(invalid);

//       const response = await PUT(putRequest(tmntId, invalid), ctx(tmntId));
//       const body = await response.json();

//       expect(response.status).toBe(422);
//       expect(body.error).toBe("validation failed");
//       expect(prismaMock.stage.findMany).not.toHaveBeenCalled();
//       expect(prismaMock.$transaction).not.toHaveBeenCalled();
//     });

//     it("should return 404 when tmnt data cannot be converted for prisma", async () => {
//       mockTmntFullDataForPrisma.mockReturnValueOnce(
//         null as unknown as ReturnType<typeof tmntFullDataForPrisma>
//       );

//       const response = await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));
//       const body = await response.json();

//       expect(response.status).toBe(404);
//       expect(body).toEqual({ error: "invalid tmnt data" });
//       expect(prismaMock.stage.findMany).not.toHaveBeenCalled();
//       expect(prismaMock.$transaction).not.toHaveBeenCalled();
//     });
//   });

//   describe("PUT - success", () => {
//     it("should PUT (replace) a full tmnt, all child, grandchild tables", async () => {
//       const tmnt = baseTmnt();

//       const response = await PUT(putRequest(tmntId, tmnt), ctx(tmntId));
//       const body = await response.json();

//       expect(response.status).toBe(200);
//       expect(body).toEqual({ success: true });
//       expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);

//       // delete the tmnt (cascades to all children), then re-create it all
//       expect(prismaMock.tmnt.deleteMany).toHaveBeenCalledWith({
//         where: { id: tmntId },
//       });
//       expect(firstArg(prismaMock.tmnt.create).data).toEqual(
//         expect.objectContaining({
//           id: tmntId,
//           tmnt_name: tmnt.tmnt.tmnt_name,
//         })
//       );
//       expect(firstArg(prismaMock.event.createMany).data).toHaveLength(tmnt.events.length);
//       expect(firstArg(prismaMock.div.createMany).data).toHaveLength(tmnt.divs.length);
//       expect(firstArg(prismaMock.squad.createMany).data).toHaveLength(tmnt.squads.length);
//       expect(firstArg(prismaMock.lane.createMany).data).toHaveLength(tmnt.lanes.length);
//       expect(firstArg(prismaMock.pot.createMany).data).toHaveLength(tmnt.pots.length);
//       expect(firstArg(prismaMock.brkt.createMany).data).toHaveLength(tmnt.brkts.length);
//       expect(firstArg(prismaMock.elim.createMany).data).toHaveLength(tmnt.elims.length);
//       expect(firstArg(prismaMock.player.createMany).data).toHaveLength(tmnt.players.length);
//       expect(firstArg(prismaMock.div_Entry.createMany).data).toHaveLength(
//         tmnt.divEntries.length
//       );
//       expect(firstArg(prismaMock.pot_Entry.createMany).data).toHaveLength(
//         tmnt.potEntries.length
//       );
//       expect(firstArg(prismaMock.elim_Entry.createMany).data).toHaveLength(
//         tmnt.elimEntries.length
//       );
//       expect(firstArg(prismaMock.money.createMany).data).toHaveLength(tmnt.moneys.length);
//       expect(firstArg(prismaMock.one_Brkt.createMany).data).toHaveLength(
//         tmnt.oneBrkts.length
//       );
//       expect(firstArg(prismaMock.brkt_Seed.createMany).data).toHaveLength(
//         tmnt.brktSeeds.length
//       );
//     });

//     it("should run all queries in one transaction, delete first, seeds last", async () => {
//       await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));

//       expect(txQueries()).toEqual([
//         ...fixedQueries,
//         "brkt_Entry.createMany",
//         ...lastQueries,
//       ]);
//     });

//     it("should not write anything outside the transaction", async () => {
//       await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));

//       // batch style: the queries are built, then run only by $transaction
//       expect(prismaMock.tmnt.update).not.toHaveBeenCalled();
//       expect(prismaMock.tmnt.delete).not.toHaveBeenCalled();
//       expect(prismaMock.stage.update).not.toHaveBeenCalled();
//       expect(prismaMock.stage.upsert).not.toHaveBeenCalled();
//       expect(prismaMock.stage.deleteMany).not.toHaveBeenCalled();
//     });
//   });

//   describe("PUT - stage rows", () => {
//     it("should read existing stages for the tmnt's squads", async () => {
//       const tmnt = baseTmnt();

//       await PUT(putRequest(tmntId, tmnt), ctx(tmntId));

//       expect(prismaMock.stage.findMany).toHaveBeenCalledTimes(1);
//       expect(prismaMock.stage.findMany).toHaveBeenCalledWith({
//         where: { squad_id: { in: tmnt.squads.map((s) => s.id) } },
//       });
//     });

//     it("should read stages before running the transaction", async () => {
//       await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));

//       const readOrder = (prismaMock.stage.findMany as jest.Mock).mock
//         .invocationCallOrder[0];
//       const txOrder = (prismaMock.$transaction as jest.Mock).mock
//         .invocationCallOrder[0];
//       expect(readOrder).toBeLessThan(txOrder);
//     });

//     it("should re-create no stages for a new tmnt", async () => {
//       // default beforeEach: findMany returns []
//       const response = await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));

//       expect(response.status).toBe(200);
//       expect(prismaMock.stage.createMany).toHaveBeenCalledWith({ data: [] });
//       expect(prismaMock.stage.create).not.toHaveBeenCalled();
//     });

//     it("should re-create existing stages unchanged when editing a tmnt", async () => {
//       const tmnt = baseTmnt();
//       const existing = [dbStageRow(tmnt.squads[0].id)];
//       prismaMock.stage.findMany.mockResolvedValue(existing as never);

//       const response = await PUT(putRequest(tmntId, tmnt), ctx(tmntId));

//       expect(response.status).toBe(200);
//       expect(prismaMock.stage.createMany).toHaveBeenCalledWith({ data: existing });
//     });

//     it("should keep stage_set_at, scores and override values from the database", async () => {
//       const tmnt = baseTmnt();
//       const scoresAt = new Date("2026-10-02T15:30:00.000Z");
//       const overrideAt = new Date("2026-10-02T16:00:00.000Z");
//       const existing = [
//         dbStageRow(tmnt.squads[0].id, {
//           stage: SquadStage.SCORES,
//           scores_started_at: scoresAt,
//           stage_override_enabled: true,
//           stage_override_at: overrideAt,
//           stage_override_reason: "test reason",
//         }),
//       ];
//       prismaMock.stage.findMany.mockResolvedValue(existing as never);

//       await PUT(putRequest(tmntId, tmnt), ctx(tmntId));

//       const stageData = firstArg(prismaMock.stage.createMany).data;
//       expect(stageData).toHaveLength(1);
//       expect(stageData[0]).toEqual({
//         id: existing[0].id,
//         squad_id: tmnt.squads[0].id,
//         stage: SquadStage.SCORES,
//         stage_set_at: setAt, // NOT reset to now
//         scores_started_at: scoresAt,
//         stage_override_enabled: true,
//         stage_override_at: overrideAt,
//         stage_override_reason: "test reason",
//       });
//     });

//     it("should ignore the stage sent in the request body", async () => {
//       const tmnt = baseTmnt();
//       // body stage differs from the database row in every way that matters
//       tmnt.stage.id = "stg_fedcba9876543210fedcba9876543210";
//       tmnt.stage.stage = SquadStage.ENTRIES;
//       const existing = [dbStageRow(tmnt.squads[0].id)];
//       prismaMock.stage.findMany.mockResolvedValue(existing as never);

//       const response = await PUT(putRequest(tmntId, tmnt), ctx(tmntId));

//       expect(response.status).toBe(200);
//       expect(prismaMock.stage.create).not.toHaveBeenCalled();
//       const stageData = firstArg(prismaMock.stage.createMany).data;
//       expect(stageData[0].id).toBe(existing[0].id);
//       expect(stageData[0].stage).toBe(SquadStage.DEFINE);
//     });

//     it("should re-create stages after squads and before lanes", async () => {
//       await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));

//       const q = txQueries();
//       expect(q.indexOf("stage.createMany")).toBe(q.indexOf("squad.createMany") + 1);
//       expect(q.indexOf("stage.createMany")).toBeLessThan(q.indexOf("lane.createMany"));
//     });

//     it("should return 500 and not run the transaction when reading stages fails", async () => {
//       prismaMock.stage.findMany.mockRejectedValue(new Error("connection failed"));

//       const response = await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));
//       const body = await response.json();

//       expect(response.status).toBe(500);
//       expect(body).toEqual({ message: "Error replacing tmnt data - connection failed" });
//       expect(prismaMock.$transaction).not.toHaveBeenCalled();
//     });
//   });

//   describe("PUT - brkt entries and refunds", () => {
//     it("should createMany all brkt entries when none have refunds", async () => {
//       const tmnt = baseTmnt();

//       const response = await PUT(putRequest(tmntId, tmnt), ctx(tmntId));

//       expect(response.status).toBe(200);
//       const beData = firstArg(prismaMock.brkt_Entry.createMany).data;
//       expect(beData).toHaveLength(tmnt.brktEntries.length);
//       expect(beData.map((be: { id: string }) => be.id)).toEqual(
//         tmnt.brktEntries.map((be) => be.id)
//       );
//       // time_stamp is converted to a Date for prisma
//       beData.forEach((be: { time_stamp: unknown }) => {
//         expect(be.time_stamp).toBeInstanceOf(Date);
//       });
//       expect(prismaMock.brkt_Entry.create).not.toHaveBeenCalled();
//     });

//     it("should create brkt entries with refunds one at a time, with brkt_refunds", async () => {
//       const tmnt = baseTmnt();
//       tmnt.brktEntries[0].num_brackets = 100;
//       tmnt.brktEntries[0].num_refunds = 92;
//       const withRefund = tmnt.brktEntries[0];

//       const response = await PUT(putRequest(tmntId, tmnt), ctx(tmntId));

//       expect(response.status).toBe(200);
//       // the refund entry is left out of createMany
//       const beData = firstArg(prismaMock.brkt_Entry.createMany).data;
//       expect(beData).toHaveLength(tmnt.brktEntries.length - 1);
//       expect(beData.map((be: { id: string }) => be.id)).not.toContain(withRefund.id);

//       // and created on its own, with its refund child row
//       expect(prismaMock.brkt_Entry.create).toHaveBeenCalledTimes(1);
//       expect(prismaMock.brkt_Entry.create).toHaveBeenCalledWith({
//         data: {
//           id: withRefund.id,
//           brkt_id: withRefund.brkt_id,
//           player_id: withRefund.player_id,
//           num_brackets: 100,
//           time_stamp: expect.any(Date),
//           brkt_refunds: { create: { num_refunds: 92 } },
//         },
//         include: { brkt_refunds: true },
//       });

//       // createMany, then the single create, then brkts and seeds
//       expect(txQueries()).toEqual([
//         ...fixedQueries,
//         "brkt_Entry.createMany",
//         "brkt_Entry.create",
//         ...lastQueries,
//       ]);
//     });

//     it("should skip createMany and create every brkt entry when all have refunds", async () => {
//       const tmnt = baseTmnt();
//       tmnt.brktEntries.forEach((be) => {
//         be.num_refunds = 1;
//       });

//       const response = await PUT(putRequest(tmntId, tmnt), ctx(tmntId));

//       expect(response.status).toBe(200);
//       expect(prismaMock.brkt_Entry.createMany).not.toHaveBeenCalled();
//       expect(prismaMock.brkt_Entry.create).toHaveBeenCalledTimes(
//         tmnt.brktEntries.length
//       );
//       expect(txQueries()).toEqual([
//         ...fixedQueries,
//         ...tmnt.brktEntries.map(() => "brkt_Entry.create"),
//         ...lastQueries,
//       ]);
//     });
//   });

//   describe("PUT - errors and rollback", () => {
//     it("should return 409 when the transaction hits a duplicate id (rollback)", async () => {
//       // the data is valid, but the database rejects it with a unique
//       // constraint error, so the whole batch transaction rolls back
//       prismaMock.$transaction.mockRejectedValue({ code: "P2002" });

//       const response = await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));
//       const body = await response.json();

//       expect(response.status).toBe(409);
//       expect(body).toEqual({ message: "Error replacing tmnt data" });
//       expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
//     });

//     it("should return 409 for a Prisma foreign key error", async () => {
//       prismaMock.$transaction.mockRejectedValue({ code: "P2003" });

//       const response = await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));

//       expect(response.status).toBe(409);
//     });

//     it("should return 404 when a record is not found", async () => {
//       prismaMock.$transaction.mockRejectedValue({ code: "P2025" });

//       const response = await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));
//       const body = await response.json();

//       expect(response.status).toBe(404);
//       expect(body).toEqual({ message: "Error replacing tmnt data" });
//     });

//     it("should return 500 when the transaction throws", async () => {
//       prismaMock.$transaction.mockRejectedValue(new Error("connection failed"));

//       const response = await PUT(putRequest(tmntId, baseTmnt()), ctx(tmntId));
//       const body = await response.json();

//       expect(response.status).toBe(500);
//       expect(body).toEqual({ message: "Error replacing tmnt data - connection failed" });
//     });
//   });
// });
