/**
 * @jest-environment node
 */
// Tests for src/app/api/divPfs/tmnt/[tmntId]/route.ts using mocked prisma.
// No database or server needed.
//
// PUT runs its queries inside prisma.$transaction(async (tx) => {...}).
// Here $transaction just calls that callback with prismaMock as tx, so
// tx.div_PF.deleteMany / createMany are the same mocks the tests check.
//
// isDivPfSaveDataType, validateDivPfs and divPfDataForPrisma are the REAL
// functions, so validation errors (400 / 422) come from the real code.
import type { Div_PF } from "@prisma/client";
import { GET, PUT } from "@/app/api/divPfs/tmnt/[tmntId]/route";
import { prismaMock } from "../../../prismaMock";
import type { divPfSaveDataType, divPfType } from "@/lib/types/types";
import { initDivPf } from "@/lib/db/initVals";
import { maxMoney, maxPosition } from "@/lib/validation/constants";
import { cloneDeep } from "lodash";

// The URL only needs to be valid; the route reads tmntId from params
const url = "http://localhost:3000/api/divPfs/tmnt";

// Next.js passes route params as a Promise; this builds the 2nd argument
const ctx = (tmntId: string) => ({ params: Promise.resolve({ tmntId }) });

const getRequest = (tmntId: string) => new Request(`${url}/${tmntId}`);

// builds a PUT request with a JSON body
const putRequest = (tmntId: string, body: unknown) =>
  new Request(`${url}/${tmntId}`, {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

// NextResponse.json() converts Date objects to ISO strings
const toJson = <T,>(data: T) => JSON.parse(JSON.stringify(data));

// first argument of the first call to a mock
const firstArg = (fn: unknown) => (fn as jest.Mock).mock.calls[0][0];

const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

// a Div_PF row as prisma would return it. GET passes rows straight through,
// so amount is a plain number here instead of a Prisma Decimal.
const dbDivPf = (
  id: string,
  div_id: string,
  position: number,
  amount: number
): Div_PF => ({
  id,
  div_id,
  position,
  amount: amount as unknown as Div_PF["amount"],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
});

// what tx.div_PF.createMany sends to the "db" for each row
const sentFields = (divPfs: divPfType[]) =>
  divPfs.map((dpf) => ({
    id: dpf.id,
    div_id: dpf.div_id,
    position: dpf.position,
    amount: dpf.amount,
  }));

beforeEach(() => {
  // interactive transaction: run the route's callback with prismaMock as tx
  prismaMock.$transaction.mockImplementation(((
    cb: (tx: typeof prismaMock) => Promise<unknown>
  ) => cb(prismaMock)) as never);
  prismaMock.div_PF.deleteMany.mockResolvedValue({ count: 0 });
});

describe("DivPfs - API: /api/divPfs/tmnt/:tmntId", () => {
  // ---------------------------------------------------------------- GET
  describe("GET all divPfs for a tmnt", () => {
    it("should get all divPfs for a tournament - one div in tournament", async () => {
      const tmntId = "tmt_d237a388a8fc4641a2e37233f1d6bebd";
      const divId = "div_99a3cae28786485bb7a036935f0f6a0a";
      const rows = Array.from({ length: 9 }, (_, i) =>
        dbDivPf(
          `dpf_00000000000000000000000000000${(i + 1).toString().padStart(3, "0")}`,
          divId,
          i + 1,
          (9 - i) * 10
        )
      );
      prismaMock.div_PF.findMany.mockResolvedValue(rows);

      const response = await GET(getRequest(tmntId), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.divPfs).toHaveLength(9);
      expect(body.divPfs).toEqual(toJson(rows));
      for (let i = 0; i < body.divPfs.length; i++) {
        expect(body.divPfs[i].div_id).toBe(divId);
        expect(body.divPfs[i].position).toBe(i + 1);
      }
    });

    it("should get all divPfs for a tournament - two divs in tournament", async () => {
      const tmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
      const divIds = [
        "div_578834e04e5e4885bbae79229d8b96e8",
        "div_fe72ab97edf8407186c8e6df7f7fb741",
      ];
      // already in route order: div_id, then position
      const rows = [
        dbDivPf("dpf_2516979e653f441b92646e7885cb3a50", divIds[0], 1, 250),
        dbDivPf("dpf_2526979e653f441b92646e7885cb3a50", divIds[0], 2, 150),
        dbDivPf("dpf_2536979e653f441b92646e7885cb3a50", divIds[1], 1, 275),
        dbDivPf("dpf_2546979e653f441b92646e7885cb3a50", divIds[1], 2, 175),
      ];
      prismaMock.div_PF.findMany.mockResolvedValue(rows);

      const response = await GET(getRequest(tmntId), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.divPfs).toEqual(toJson(rows));
    });

    it("should query divPfs by tmnt, sorted by div_id then position", async () => {
      const tmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
      prismaMock.div_PF.findMany.mockResolvedValue([]);

      await GET(getRequest(tmntId), ctx(tmntId));

      expect(prismaMock.div_PF.findMany).toHaveBeenCalledWith({
        where: { div: { tmnt_id: tmntId } },
        orderBy: [{ div_id: "asc" }, { position: "asc" }],
      });
    });

    it("should return status 200 and no divPfs when tmntId is not found", async () => {
      prismaMock.div_PF.findMany.mockResolvedValue([]);

      const response = await GET(getRequest(notFoundTmntId), ctx(notFoundTmntId));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.divPfs).toHaveLength(0);
    });

    it.each([
      { desc: "tmntId is invalid", id: "invalid" },
      { desc: "tmntId is valid, but not a tmnt id", id: userId },
    ])("should return 404 when $desc", async ({ id }) => {
      const response = await GET(getRequest(id), ctx(id));

      expect(response.status).toBe(404);
      expect(prismaMock.div_PF.findMany).not.toHaveBeenCalled();
    });

    it("should return 500 when the database throws", async () => {
      const tmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
      prismaMock.div_PF.findMany.mockRejectedValue(new Error("connection failed"));

      const response = await GET(getRequest(tmntId), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({
        message: "error getting divPfs for tournament - connection failed",
      });
    });
  });

  // ---------------------------------------------------------------- PUT
  describe("PUT many divPfs for a tmnt", () => {
    // PUTs a valid body, mocks createMany's count, and returns status + body
    const putValid = async (
      tmntId: string,
      divPfs: divPfType[],
      divIds: string[]
    ) => {
      prismaMock.div_PF.createMany.mockResolvedValue({ count: divPfs.length });
      const data: divPfSaveDataType = { divPfData: divPfs, divIds };
      const response = await PUT(putRequest(tmntId, data), ctx(tmntId));
      return { status: response.status, body: await response.json() };
    };

    describe("1 div", () => {
      const pmTmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
      const pmDivId = "div_f30aea2c534f4cfe87f4315531cef8ef";
      const pmDivPf1: divPfType = {
        ...initDivPf,
        id: "dpf_ce55c52bd60d4943bb747590a03c9732",
        div_id: pmDivId,
        position: 1,
        amount: 300,
      };
      const pmDivPf2: divPfType = {
        ...initDivPf,
        id: "dpf_ce55c52bd60d4943bb747590a03c9733",
        div_id: pmDivId,
        position: 2,
        amount: 200,
      };
      const validDivIds = [pmDivId];

      it("should delete then create divPfs in one transaction", async () => {
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);

        const { status, body } = await putValid(pmTmntId, pmDivPfs, validDivIds);

        expect(status).toBe(200);
        expect(body.message).toBe("divPfs replaced");
        expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
        expect(prismaMock.div_PF.deleteMany).toHaveBeenCalledWith({
          where: { div: { tmnt_id: pmTmntId } },
        });
        // delete runs before create
        expect(
          prismaMock.div_PF.deleteMany.mock.invocationCallOrder[0]
        ).toBeLessThan(prismaMock.div_PF.createMany.mock.invocationCallOrder[0]);
        // the rows sent to the "db" are the rows returned
        expect(prismaMock.div_PF.createMany).toHaveBeenCalledWith({
          data: body.divPfs,
        });
      });

      it("should update many divPfs - change amount", async () => {
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].amount = 350;
        pmDivPfs[1].amount = 250;

        const { status, body } = await putValid(pmTmntId, pmDivPfs, validDivIds);

        expect(status).toBe(200);
        expect(body.count).toBe(pmDivPfs.length);
        expect(body.divPfs).toMatchObject(sentFields(pmDivPfs));
      });

      it("should update many divPfs - add row", async () => {
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs.push({
          ...initDivPf,
          id: "dpf_ce55c52bd60d4943bb747590a03c9734",
          div_id: pmDivId,
          position: 3,
          amount: 100,
        });

        const { status, body } = await putValid(pmTmntId, pmDivPfs, validDivIds);

        expect(status).toBe(200);
        expect(body.count).toBe(3);
        expect(body.divPfs).toMatchObject(sentFields(pmDivPfs));
      });

      it("should update many divPfs - change amount and delete a row", async () => {
        const pmDivPfs = cloneDeep([pmDivPf1]);
        pmDivPfs[0].amount = 400;

        const { status, body } = await putValid(pmTmntId, pmDivPfs, validDivIds);

        expect(status).toBe(200);
        expect(body.count).toBe(1);
        expect(body.divPfs).toMatchObject(sentFields(pmDivPfs));
      });

      it("should update many divPfs - sanitize amount", async () => {
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs[0].amount = 350.351;

        const { status, body } = await putValid(pmTmntId, pmDivPfs, validDivIds);

        expect(status).toBe(200);
        expect(body.divPfs[0].amount).toBe(350.35);
        expect(body.divPfs[1].amount).toBe(pmDivPfs[1].amount);
        // the sanitized amount is what was sent to the "db"
        const sent = firstArg(prismaMock.div_PF.createMany) as {
          data: { amount: number }[];
        };
        expect(sent.data[0].amount).toBe(350.35);
      });

      it("should update many divPfs - empty divPfs deletes all rows", async () => {
        const { status, body } = await putValid(pmTmntId, [], validDivIds);

        expect(status).toBe(200);
        expect(body.count).toBe(0);
        expect(body.divPfs).toHaveLength(0);
        expect(prismaMock.div_PF.deleteMany).toHaveBeenCalledTimes(1);
        expect(prismaMock.div_PF.createMany).toHaveBeenCalledWith({ data: [] });
      });
    });

    describe("2 divs", () => {
      const pmTmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
      const pmDivId1 = "div_578834e04e5e4885bbae79229d8b96e8";
      const pmDivId2 = "div_fe72ab97edf8407186c8e6df7f7fb741";
      const pmDivPf1: divPfType = {
        ...initDivPf,
        id: "dpf_2516979e653f441b92646e7885cb3a50",
        div_id: pmDivId1,
        position: 1,
        amount: 250,
      };
      const pmDivPf2: divPfType = {
        ...initDivPf,
        id: "dpf_2526979e653f441b92646e7885cb3a50",
        div_id: pmDivId1,
        position: 2,
        amount: 150,
      };
      const pmDivPf3: divPfType = {
        ...initDivPf,
        id: "dpf_2536979e653f441b92646e7885cb3a50",
        div_id: pmDivId2,
        position: 1,
        amount: 275,
      };
      const pmDivPf4: divPfType = {
        ...initDivPf,
        id: "dpf_2546979e653f441b92646e7885cb3a50",
        div_id: pmDivId2,
        position: 2,
        amount: 175,
      };
      const validDivIds = [pmDivId1, pmDivId2];

      it("should update many divPfs - change amount 1 div", async () => {
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2, pmDivPf3, pmDivPf4]);
        pmDivPfs[0].amount = 350;
        pmDivPfs[1].amount = 250;

        const { status, body } = await putValid(pmTmntId, pmDivPfs, validDivIds);

        expect(status).toBe(200);
        expect(body.count).toBe(4);
        expect(body.divPfs).toMatchObject(sentFields(pmDivPfs));
      });

      it("should update many divPfs - add row", async () => {
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2]);
        pmDivPfs.push({
          ...initDivPf,
          id: "dpf_2556979e653f441b92646e7885cb3a50",
          div_id: pmDivId1,
          position: 3,
          amount: 100,
        });
        pmDivPfs.push(cloneDeep(pmDivPf3), cloneDeep(pmDivPf4));

        const { status, body } = await putValid(pmTmntId, pmDivPfs, validDivIds);

        expect(status).toBe(200);
        expect(body.count).toBe(5);
        expect(body.divPfs).toMatchObject(sentFields(pmDivPfs));
      });

      it("should update many divPfs - change amount and delete a row", async () => {
        const pmDivPfs = cloneDeep([pmDivPf1, pmDivPf2, pmDivPf3]);
        pmDivPfs[2].amount = 400;

        const { status, body } = await putValid(pmTmntId, pmDivPfs, validDivIds);

        expect(status).toBe(200);
        expect(body.count).toBe(3);
        expect(body.divPfs).toMatchObject(sentFields(pmDivPfs));
      });
    });

    describe("errors", () => {
      const pmTmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
      const pmDivId = "div_f30aea2c534f4cfe87f4315531cef8ef";
      const pmDivPf1: divPfType = {
        ...initDivPf,
        id: "dpf_ce55c52bd60d4943bb747590a03c9732",
        div_id: pmDivId,
        position: 1,
        amount: 300,
      };
      const pmDivPf2: divPfType = {
        ...initDivPf,
        id: "dpf_ce55c52bd60d4943bb747590a03c9733",
        div_id: pmDivId,
        position: 2,
        amount: 200,
      };
      const validDivIds = [pmDivId];
      const validData = (): divPfSaveDataType => ({
        divPfData: cloneDeep([pmDivPf1, pmDivPf2]),
        divIds: cloneDeep(validDivIds),
      });

      // valid data with one field of the 1st divPf replaced
      const withField = (field: string, value: unknown) => {
        const data = validData();
        return {
          ...data,
          divPfData: [{ ...data.divPfData[0], [field]: value }, data.divPfData[1]],
        };
      };

      // PUTs a body and checks the status and that nothing was saved
      const expectRejected = async (
        body: unknown,
        status: number,
        tmntId = pmTmntId
      ) => {
        const response = await PUT(putRequest(tmntId, body), ctx(tmntId));
        expect(response.status).toBe(status);
        expect(prismaMock.$transaction).not.toHaveBeenCalled();
      };

      it.each([
        { desc: "tmntId is invalid", id: "invalid" },
        { desc: "tmntId is valid, but not a tmnt id", id: userId },
      ])("should return 404 when $desc", async ({ id }) => {
        await expectRejected(validData(), 404, id);
      });

      // ---- 400: isDivPfSaveDataType fails
      it("should return 400 when divPfData is not an array", async () => {
        await expectRejected({ ...validData(), divPfData: pmDivPf2 }, 400);
      });

      it("should return 400 when divPfData is not formatted correctly", async () => {
        const invalidPmDivPf1 = {
          id: "dpf_ce55c52bd60d4943bb747590a03c9732",
          position: 1,
          amount: 300,
        };
        await expectRejected(
          { ...validData(), divPfData: [invalidPmDivPf1, pmDivPf2] },
          400
        );
      });

      it("should return 400 when divIds is not an array", async () => {
        const data = validData();
        await expectRejected({ ...data, divIds: data.divPfData }, 400);
      });

      it("should return 400 when divIds is not an array of strings", async () => {
        await expectRejected({ ...validData(), divIds: [123] }, 400);
      });

      it("should return 500 when the body is not JSON", async () => {
        const response = await PUT(
          new Request(`${url}/${pmTmntId}`, { method: "PUT", body: "not json" }),
          ctx(pmTmntId)
        );
        // request.json() throws a SyntaxError, which standardCatchReturn maps to 500
        expect(response.status).toBe(500);
        expect(prismaMock.$transaction).not.toHaveBeenCalled();
      });

      // runs the same test once for each field set to null
      it.each(["id", "div_id", "position", "amount"])(
        "should return 400 when %s is missing",
        async (field) => {
          await expectRejected(withField(field, null), 400);
        }
      );

      it.each(["position", "amount"])(
        "should return 400 when %s is not a number",
        async (field) => {
          await expectRejected(withField(field, "test"), 400);
        }
      );

      // ---- 422: validateDivPfs fails
      it.each([
        { desc: "id is invalid", field: "id", value: "test" },
        { desc: "id is valid, but not a divPf id", field: "id", value: userId },
        { desc: "div_id is invalid", field: "div_id", value: "test" },
        { desc: "div_id is valid, but not a div id", field: "div_id", value: userId },
        {
          desc: "div_id is not in the valid div id list",
          field: "div_id",
          value: "div_99a3cae28786485bb7a036935f0f6a0a",
        },
        { desc: "position is too low", field: "position", value: 0 },
        { desc: "position is too high", field: "position", value: maxPosition + 1 },
        { desc: "position is not an integer", field: "position", value: 1.5 },
        { desc: "amount is too low", field: "amount", value: -1 },
        { desc: "amount is too high", field: "amount", value: maxMoney + 1 },
      ])("should return 422 when $desc", async ({ field, value }) => {
        await expectRejected(withField(field, value), 422);
      });

      it("should return 422 when 1st position is not 1", async () => {
        const data = validData();
        data.divPfData[0].position = 4;
        data.divPfData[1].position = 5;
        await expectRejected(data, 422);
      });

      it("should return 422 when position is not in sequence", async () => {
        const data = validData();
        data.divPfData[1].position = 4;
        await expectRejected(data, 422);
      });

      it("should return 422 when amount is not decreasing", async () => {
        const data = validData();
        // 1st amount is 300 (pmDivPf1), so the 2nd is higher than the 1st
        data.divPfData[1].amount = 301;
        await expectRejected(data, 422);
      });

      // ---- database errors
      it("should return 409 when tmntId is not found (div foreign key fails)", async () => {
        // with a real db, createMany fails the div_id foreign key (P2003)
        // because the divs do not belong to a tmnt that exists
        prismaMock.div_PF.createMany.mockRejectedValue({ code: "P2003" });

        const response = await PUT(
          putRequest(notFoundTmntId, validData()),
          ctx(notFoundTmntId)
        );

        expect(response.status).toBe(409);
      });

      it("should return 409 when a div_id / position pair is duplicated", async () => {
        prismaMock.div_PF.createMany.mockRejectedValue({ code: "P2002" });

        const response = await PUT(putRequest(pmTmntId, validData()), ctx(pmTmntId));

        expect(response.status).toBe(409);
      });

      it("should return 500 when the delete throws", async () => {
        prismaMock.div_PF.deleteMany.mockRejectedValue(new Error("connection failed"));

        const response = await PUT(putRequest(pmTmntId, validData()), ctx(pmTmntId));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          message: "error replacing divPfs for tournament - connection failed",
        });
        expect(prismaMock.div_PF.createMany).not.toHaveBeenCalled();
      });

      it("should return 500 when the transaction throws", async () => {
        prismaMock.$transaction.mockRejectedValue(new Error("connection failed"));

        const response = await PUT(putRequest(pmTmntId, validData()), ctx(pmTmntId));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          message: "error replacing divPfs for tournament - connection failed",
        });
      });
    });
  });
});
