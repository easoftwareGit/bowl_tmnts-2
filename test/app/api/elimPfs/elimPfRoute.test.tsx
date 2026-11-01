/**
 * @jest-environment node
 */
// Tests for src/app/api/elimPfs/tmnt/[tmntId]/route.ts using mocked prisma.
// No database or server needed.
//
// PUT runs its queries inside prisma.$transaction(async (tx) => {...}).
// Here $transaction just calls that callback with prismaMock as tx, so
// tx.elim_PF.deleteMany / createMany are the same mocks the tests check.
//
// isElimPfSaveDataType, validateElimPfs and elimPfDataForPrisma are the REAL
// functions, so validation errors (400 / 422) come from the real code.
import type { Elim_PF } from "@prisma/client";
import { GET, PUT } from "@/app/api/elimPfs/tmnt/[tmntId]/route";
import { prismaMock } from "../../../prismaMock";
import type { elimPfSaveDataType, elimPfType } from "@/lib/types/types";
import { initElimPf } from "@/lib/db/initVals";
import { maxMoney, maxPosition } from "@/lib/validation/constants";
import { cloneDeep } from "lodash";

// The URL only needs to be valid; the route reads tmntId from params
const url = "http://localhost:3000/api/elimPfs/tmnt";

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
const notFoundElimId = "elm_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

// an Elim_PF row as prisma would return it. GET passes rows straight through,
// so amount is a plain number here instead of a Prisma Decimal.
const dbElimPf = (
  id: string,
  elim_id: string,
  position: number,
  amount: number
): Elim_PF => ({
  id,
  elim_id,
  position,
  amount: amount as unknown as Elim_PF["amount"],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
});

// what tx.elim_PF.createMany sends to the "db" for each row
const sentFields = (elimPfs: elimPfType[]) =>
  elimPfs.map((epf) => ({
    id: epf.id,
    elim_id: epf.elim_id,
    position: epf.position,
    amount: epf.amount,
  }));

beforeEach(() => {
  // interactive transaction: run the route's callback with prismaMock as tx
  prismaMock.$transaction.mockImplementation(((
    cb: (tx: typeof prismaMock) => Promise<unknown>
  ) => cb(prismaMock)) as never);
  prismaMock.elim_PF.deleteMany.mockResolvedValue({ count: 0 });
});

describe("ElimPfs - API: /api/elimPfs/tmnt/:tmntId", () => {
  // ---------------------------------------------------------------- GET
  describe("GET all elimPfs for a tmnt", () => {
    it("should get all elimPfs for a tournament - two divs, four elims", async () => {
      const tmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
      const elimIds = [
        "elm_c01077494c2d4d9da166d697c08c28d2",
        "elm_c02077494c2d4d9da166d697c08c28d2",
        "elm_c03077494c2d4d9da166d697c08c28d2",
        "elm_c04077494c2d4d9da166d697c08c28d2",
      ];
      // already in route order: elim_id, then position
      const rows = [
        dbElimPf("epf_094a1a974e034940b847bef5b67a4b63", elimIds[0], 1, 60),
        dbElimPf("epf_710eda589d3f4106abe78006195e328a", elimIds[0], 2, 30),
        dbElimPf("epf_7e44498e84034bc1a080bfff569680bb", elimIds[1], 1, 60),
        dbElimPf("epf_9032c654c42240d78eeea91de320049f", elimIds[1], 2, 30),
        dbElimPf("epf_7e7d7dca4de74085b609030192aa15a5", elimIds[2], 1, 60),
        dbElimPf("epf_b14d1847af30480aa4123594b0072cb1", elimIds[2], 2, 30),
        dbElimPf("epf_560a2316645844bb9bdeb094911b9e9d", elimIds[3], 1, 40),
        dbElimPf("epf_840e009bd5bd4e4aa389ddd02df50f23", elimIds[3], 2, 15),
      ];
      prismaMock.elim_PF.findMany.mockResolvedValue(rows);

      const response = await GET(getRequest(tmntId), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.elimPfs).toHaveLength(8);
      expect(body.elimPfs).toEqual(toJson(rows));
      for (let i = 0; i < body.elimPfs.length; i++) {
        expect(body.elimPfs[i].elim_id).toBe(elimIds[Math.floor(i / 2)]);
        expect(body.elimPfs[i].position).toBe((i % 2) + 1);
      }
    });

    it("should query elimPfs by tmnt, sorted by elim_id then position", async () => {
      const tmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
      prismaMock.elim_PF.findMany.mockResolvedValue([]);

      await GET(getRequest(tmntId), ctx(tmntId));

      expect(prismaMock.elim_PF.findMany).toHaveBeenCalledWith({
        where: { elim: { div: { tmnt_id: tmntId } } },
        orderBy: [{ elim_id: "asc" }, { position: "asc" }],
      });
    });

    it("should return status 200 and no elimPfs when tmntId is not found", async () => {
      prismaMock.elim_PF.findMany.mockResolvedValue([]);

      const response = await GET(getRequest(notFoundTmntId), ctx(notFoundTmntId));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.elimPfs).toHaveLength(0);
    });

    it.each([
      { desc: "tmntId is invalid", id: "invalid" },
      { desc: "tmntId is valid, but not a tmnt id", id: userId },
    ])("should return 404 when $desc", async ({ id }) => {
      const response = await GET(getRequest(id), ctx(id));

      expect(response.status).toBe(404);
      expect(prismaMock.elim_PF.findMany).not.toHaveBeenCalled();
    });

    it("should return 500 when the database throws", async () => {
      const tmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
      prismaMock.elim_PF.findMany.mockRejectedValue(new Error("connection failed"));

      const response = await GET(getRequest(tmntId), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({
        message: "error getting elimPfs for tournament - connection failed",
      });
    });
  });

  // ---------------------------------------------------------------- PUT
  describe("PUT many elimPfs for a tmnt", () => {
    // PUTs a valid body, mocks createMany's count, and returns status + body
    const putValid = async (
      tmntId: string,
      elimPfs: elimPfType[],
      elimIds: string[]
    ) => {
      prismaMock.elim_PF.createMany.mockResolvedValue({ count: elimPfs.length });
      const data: elimPfSaveDataType = { elimPfData: elimPfs, elimIds };
      const response = await PUT(putRequest(tmntId, data), ctx(tmntId));
      return { status: response.status, body: await response.json() };
    };

    describe("1 elim", () => {
      const pmTmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
      const pmElimId = "elm_45d884582e7042bb95b4818ccdd9974c";
      const pmElimPf1: elimPfType = {
        ...initElimPf,
        id: "epf_59eac0c17bf74348b44041e97469ad76",
        elim_id: pmElimId,
        position: 1,
        amount: 50,
      };
      const pmElimPf2: elimPfType = {
        ...initElimPf,
        id: "epf_0fed31aae5374e6690b6535ced1ebff5",
        elim_id: pmElimId,
        position: 2,
        amount: 20,
      };
      const validElimIds = [pmElimId];

      it("should delete then create elimPfs in one transaction", async () => {
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);

        const { status, body } = await putValid(pmTmntId, pmElimPfs, validElimIds);

        expect(status).toBe(200);
        expect(body.message).toBe("elimPfs replaced");
        expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
        expect(prismaMock.elim_PF.deleteMany).toHaveBeenCalledWith({
          where: { elim: { div: { tmnt_id: pmTmntId } } },
        });
        // delete runs before create
        expect(
          prismaMock.elim_PF.deleteMany.mock.invocationCallOrder[0]
        ).toBeLessThan(prismaMock.elim_PF.createMany.mock.invocationCallOrder[0]);
        // the rows sent to the "db" are the rows returned
        expect(prismaMock.elim_PF.createMany).toHaveBeenCalledWith({
          data: body.elimPfs,
        });
      });

      it("should update many elimPfs - change amount", async () => {
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].amount = 350;
        pmElimPfs[1].amount = 250;

        const { status, body } = await putValid(pmTmntId, pmElimPfs, validElimIds);

        expect(status).toBe(200);
        expect(body.count).toBe(pmElimPfs.length);
        expect(body.elimPfs).toMatchObject(sentFields(pmElimPfs));
      });

      it("should update many elimPfs - add row", async () => {
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs.push({
          ...initElimPf,
          id: "epf_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          elim_id: pmElimId,
          position: 3,
          amount: 10,
        });

        const { status, body } = await putValid(pmTmntId, pmElimPfs, validElimIds);

        expect(status).toBe(200);
        expect(body.count).toBe(3);
        expect(body.elimPfs).toMatchObject(sentFields(pmElimPfs));
      });

      it("should update many elimPfs - change amount and delete a row", async () => {
        const pmElimPfs = cloneDeep([pmElimPf1]);
        pmElimPfs[0].amount = 400;

        const { status, body } = await putValid(pmTmntId, pmElimPfs, validElimIds);

        expect(status).toBe(200);
        expect(body.count).toBe(1);
        expect(body.elimPfs).toMatchObject(sentFields(pmElimPfs));
      });

      it("should update many elimPfs - sanitize amount", async () => {
        const pmElimPfs = cloneDeep([pmElimPf1, pmElimPf2]);
        pmElimPfs[0].amount = 350.351;

        const { status, body } = await putValid(pmTmntId, pmElimPfs, validElimIds);

        expect(status).toBe(200);
        expect(body.elimPfs[0].amount).toBe(350.35);
        expect(body.elimPfs[1].amount).toBe(pmElimPfs[1].amount);
        // the sanitized amount is what was sent to the "db"
        const sent = firstArg(prismaMock.elim_PF.createMany) as {
          data: { amount: number }[];
        };
        expect(sent.data[0].amount).toBe(350.35);
      });

      it("should update many elimPfs - empty elimPfs deletes all rows", async () => {
        const { status, body } = await putValid(pmTmntId, [], validElimIds);

        expect(status).toBe(200);
        expect(body.count).toBe(0);
        expect(body.elimPfs).toHaveLength(0);
        expect(prismaMock.elim_PF.deleteMany).toHaveBeenCalledTimes(1);
        expect(prismaMock.elim_PF.createMany).toHaveBeenCalledWith({ data: [] });
      });
    });

    describe("2 divs, 4 elims", () => {
      const pmTmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
      const pmElimId1 = "elm_c01077494c2d4d9da166d697c08c28d2";
      const pmElimId2 = "elm_c02077494c2d4d9da166d697c08c28d2";
      const pmElimId3 = "elm_c03077494c2d4d9da166d697c08c28d2";
      const pmElimId4 = "elm_c04077494c2d4d9da166d697c08c28d2";
      const makePf = (
        id: string,
        elim_id: string,
        position: number,
        amount: number
      ): elimPfType => ({ ...initElimPf, id, elim_id, position, amount });
      const allElimPfs: elimPfType[] = [
        makePf("epf_094a1a974e034940b847bef5b67a4b63", pmElimId1, 1, 60),
        makePf("epf_710eda589d3f4106abe78006195e328a", pmElimId1, 2, 30),
        makePf("epf_7e44498e84034bc1a080bfff569680bb", pmElimId2, 1, 60),
        makePf("epf_9032c654c42240d78eeea91de320049f", pmElimId2, 2, 30),
        makePf("epf_7e7d7dca4de74085b609030192aa15a5", pmElimId3, 1, 60),
        makePf("epf_b14d1847af30480aa4123594b0072cb1", pmElimId3, 2, 30),
        makePf("epf_560a2316645844bb9bdeb094911b9e9d", pmElimId4, 1, 40),
        makePf("epf_840e009bd5bd4e4aa389ddd02df50f23", pmElimId4, 2, 15),
      ];
      const validElimIds = [pmElimId1, pmElimId2, pmElimId3, pmElimId4];

      it("should update many elimPfs - change amount 1 elim", async () => {
        const pmElimPfs = cloneDeep(allElimPfs);
        pmElimPfs[0].amount = 350;
        pmElimPfs[1].amount = 250;

        const { status, body } = await putValid(pmTmntId, pmElimPfs, validElimIds);

        expect(status).toBe(200);
        expect(body.count).toBe(8);
        expect(body.elimPfs).toMatchObject(sentFields(pmElimPfs));
      });

      it("should update many elimPfs - add row", async () => {
        const pmElimPfs = cloneDeep(allElimPfs);
        pmElimPfs.push(
          makePf("epf_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", pmElimId1, 3, 10)
        );

        const { status, body } = await putValid(pmTmntId, pmElimPfs, validElimIds);

        expect(status).toBe(200);
        expect(body.count).toBe(9);
        // validateElimPfs returns rows sorted by elim_id, then position
        const sortedElimPfs = pmElimPfs.toSorted((a, b) => {
          const elimCompare = a.elim_id.localeCompare(b.elim_id);
          if (elimCompare !== 0) {
            return elimCompare;
          }
          return (a.position ?? 0) - (b.position ?? 0);
        });
        expect(body.elimPfs).toMatchObject(sentFields(sortedElimPfs));
      });

      it("should update many elimPfs - change amount and delete a row", async () => {
        const pmElimPfs = cloneDeep(allElimPfs.slice(0, 7));
        pmElimPfs[2].amount = 400;

        const { status, body } = await putValid(pmTmntId, pmElimPfs, validElimIds);

        expect(status).toBe(200);
        expect(body.count).toBe(7);
        expect(body.elimPfs).toMatchObject(sentFields(pmElimPfs));
      });
    });

    describe("errors", () => {
      const pmTmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
      const pmElimId = "elm_45d884582e7042bb95b4818ccdd9974c";
      const pmElimPf1: elimPfType = {
        ...initElimPf,
        id: "epf_59eac0c17bf74348b44041e97469ad76",
        elim_id: pmElimId,
        position: 1,
        amount: 50,
      };
      const pmElimPf2: elimPfType = {
        ...initElimPf,
        id: "epf_0fed31aae5374e6690b6535ced1ebff5",
        elim_id: pmElimId,
        position: 2,
        amount: 20,
      };
      const validElimIds = [pmElimId];
      const validData = (): elimPfSaveDataType => ({
        elimPfData: cloneDeep([pmElimPf1, pmElimPf2]),
        elimIds: cloneDeep(validElimIds),
      });

      // valid data with one field of the 1st elimPf replaced
      const withField = (field: string, value: unknown) => {
        const data = validData();
        return {
          ...data,
          elimPfData: [{ ...data.elimPfData[0], [field]: value }, data.elimPfData[1]],
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

      // ---- 400: isElimPfSaveDataType fails
      it("should return 400 when elimPfData is not an array", async () => {
        await expectRejected({ ...validData(), elimPfData: pmElimPf2 }, 400);
      });

      it("should return 400 when elimPfData is not formatted correctly", async () => {
        const invalidPmElimPf1 = {
          id: "epf_59eac0c17bf74348b44041e97469ad76",
          position: 1,
          amount: 50,
        };
        await expectRejected(
          { ...validData(), elimPfData: [invalidPmElimPf1, pmElimPf2] },
          400
        );
      });

      it("should return 400 when elimIds is not an array", async () => {
        const data = validData();
        await expectRejected({ ...data, elimIds: data.elimPfData }, 400);
      });

      it("should return 400 when elimIds is not an array of strings", async () => {
        await expectRejected({ ...validData(), elimIds: [123] }, 400);
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
      it.each(["id", "elim_id", "position", "amount"])(
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

      // ---- 422: validateElimPfs fails
      it.each([
        { desc: "id is invalid", field: "id", value: "test" },
        { desc: "id is valid, but not an elimPf id", field: "id", value: userId },
        { desc: "elim_id is invalid", field: "elim_id", value: "test" },
        { desc: "elim_id is valid, but not an elim id", field: "elim_id", value: userId },
        {
          desc: "elim_id is a div id",
          field: "elim_id",
          value: "div_99a3cae28786485bb7a036935f0f6a0a",
        },
        {
          desc: "elim_id is not in the valid elim id list",
          field: "elim_id",
          value: notFoundElimId,
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
        data.elimPfData[0].position = 4;
        data.elimPfData[1].position = 5;
        await expectRejected(data, 422);
      });

      it("should return 422 when position is not in sequence", async () => {
        const data = validData();
        data.elimPfData[1].position = 4;
        await expectRejected(data, 422);
      });

      it("should return 422 when amount is not decreasing", async () => {
        const data = validData();
        // 1st amount is 50 (pmElimPf1), so the 2nd is higher than the 1st
        data.elimPfData[1].amount = 51;
        await expectRejected(data, 422);
      });

      // ---- database errors
      it("should return 409 when tmntId is not found (elim foreign key fails)", async () => {
        // with a real db, createMany fails the elim_id foreign key (P2003)
        // because the elims do not belong to a tmnt that exists
        prismaMock.elim_PF.createMany.mockRejectedValue({ code: "P2003" });

        const response = await PUT(
          putRequest(notFoundTmntId, validData()),
          ctx(notFoundTmntId)
        );

        expect(response.status).toBe(409);
      });

      it("should return 409 when an elim_id / position pair is duplicated", async () => {
        prismaMock.elim_PF.createMany.mockRejectedValue({ code: "P2002" });

        const response = await PUT(putRequest(pmTmntId, validData()), ctx(pmTmntId));

        expect(response.status).toBe(409);
      });

      it("should return 500 when the delete throws", async () => {
        prismaMock.elim_PF.deleteMany.mockRejectedValue(new Error("connection failed"));

        const response = await PUT(putRequest(pmTmntId, validData()), ctx(pmTmntId));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          message: "error replacing elimPfs for elim - connection failed",
        });
        expect(prismaMock.elim_PF.createMany).not.toHaveBeenCalled();
      });

      it("should return 500 when the transaction throws", async () => {
        prismaMock.$transaction.mockRejectedValue(new Error("connection failed"));

        const response = await PUT(putRequest(pmTmntId, validData()), ctx(pmTmntId));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          message: "error replacing elimPfs for elim - connection failed",
        });
      });
    });
  });
});
