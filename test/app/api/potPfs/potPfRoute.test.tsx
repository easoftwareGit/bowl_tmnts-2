/**
 * @jest-environment node
 */
// Tests for src/app/api/potPfs/tmnt/[tmntId]/route.ts using mocked prisma.
// No database or server needed.
//
// PUT runs its queries inside prisma.$transaction(async (tx) => {...}).
// Here $transaction just calls that callback with prismaMock as tx, so
// tx.pot_PF.deleteMany / createMany are the same mocks the tests check.
//
// isPotPfSaveDataType, validatePotPfs and potPfDataForPrisma are the REAL
// functions, so validation errors (400 / 422) come from the real code.
import type { Pot_PF } from "@prisma/client";
import { GET, PUT } from "@/app/api/potPfs/tmnt/[tmntId]/route";
import { prismaMock } from "../../../prismaMock";
import type { potPfSaveDataType, potPfType } from "@/lib/types/types";
import { initPotPf } from "@/lib/db/initVals";
import { maxMoney, maxPosition } from "@/lib/validation/constants";
import { cloneDeep } from "lodash";

// The URL only needs to be valid; the route reads tmntId from params
const url = "http://localhost:3000/api/potPfs/tmnt";

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
const notFoundPotId = "pot_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

// an Pot_PF row as prisma would return it. GET passes rows straight through,
// so amount is a plain number here instead of a Prisma Decimal.
const dbPotPf = (
  id: string,
  pot_id: string,
  position: number,
  amount: number
): Pot_PF => ({
  id,
  pot_id,
  position,
  amount: amount as unknown as Pot_PF["amount"],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
});

// what tx.pot_PF.createMany sends to the "db" for each row
const sentFields = (potPfs: potPfType[]) =>
  potPfs.map((ppf) => ({
    id: ppf.id,
    pot_id: ppf.pot_id,
    position: ppf.position,
    amount: ppf.amount,
  }));

beforeEach(() => {
  // interactive transaction: run the route's callback with prismaMock as tx
  prismaMock.$transaction.mockImplementation(((
    cb: (tx: typeof prismaMock) => Promise<unknown>
  ) => cb(prismaMock)) as never);
  prismaMock.pot_PF.deleteMany.mockResolvedValue({ count: 0 });
});

describe("PotPfs - API: /api/potPfs/tmnt/:tmntId", () => {
  // ---------------------------------------------------------------- GET
  describe("GET all potPfs for a tmnt", () => {
    it("should get all potPfs for a tournament - two divs, four pots", async () => {
      const tmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
      const potIds = [
        "pot_761fb6d8a9a04cb4b3372e212da2a3b0",
        "pot_771fb6d8a9a04cb4b3372e212da2a3b0",
        "pot_781fb6d8a9a04cb4b3372e212da2a3b0",
        "pot_791fb6d8a9a04cb4b3372e212da2a3b0",
      ];
      // already in route order: pot_id, then position
      const rows = [
        dbPotPf("ppf_560a2316645844bb9bdeb094911b9e9d", potIds[0], 1, 75),
        dbPotPf("ppf_840e009bd5bd4e4aa389ddd02df50f23", potIds[0], 2, 15),
        dbPotPf("ppf_7e7d7dca4de74085b609030192aa15a5", potIds[1], 1, 40),
        dbPotPf("ppf_b14d1847af30480aa4123594b0072cb1", potIds[1], 2, 10),
        dbPotPf("ppf_7e44498e84034bc1a080bfff569680bb", potIds[2], 1, 80),
        dbPotPf("ppf_9032c654c42240d78eeea91de320049f", potIds[2], 2, 20),
        dbPotPf("ppf_094a1a974e034940b847bef5b67a4b63", potIds[3], 1, 40),
        dbPotPf("ppf_710eda589d3f4106abe78006195e328a", potIds[3], 2, 10),
      ];
      prismaMock.pot_PF.findMany.mockResolvedValue(rows);

      const response = await GET(getRequest(tmntId), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.potPfs).toHaveLength(8);
      expect(body.potPfs).toEqual(toJson(rows));
      for (let i = 0; i < body.potPfs.length; i++) {
        expect(body.potPfs[i].pot_id).toBe(potIds[Math.floor(i / 2)]);
        expect(body.potPfs[i].position).toBe((i % 2) + 1);
      }
    });

    it("should query potPfs by tmnt, sorted by pot_id then position", async () => {
      const tmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
      prismaMock.pot_PF.findMany.mockResolvedValue([]);

      await GET(getRequest(tmntId), ctx(tmntId));

      expect(prismaMock.pot_PF.findMany).toHaveBeenCalledWith({
        where: { pot: { div: { tmnt_id: tmntId } } },
        orderBy: [{ pot_id: "asc" }, { position: "asc" }],
      });
    });

    it("should return status 200 and no potPfs when tmntId is not found", async () => {
      prismaMock.pot_PF.findMany.mockResolvedValue([]);

      const response = await GET(getRequest(notFoundTmntId), ctx(notFoundTmntId));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.potPfs).toHaveLength(0);
    });

    it.each([
      { desc: "tmntId is invalid", id: "invalid" },
      { desc: "tmntId is valid, but not a tmnt id", id: userId },
    ])("should return 404 when $desc", async ({ id }) => {
      const response = await GET(getRequest(id), ctx(id));

      expect(response.status).toBe(404);
      expect(prismaMock.pot_PF.findMany).not.toHaveBeenCalled();
    });

    it("should return 500 when the database throws", async () => {
      const tmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
      prismaMock.pot_PF.findMany.mockRejectedValue(new Error("connection failed"));

      const response = await GET(getRequest(tmntId), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({
        message: "error getting potPfs for tournament - connection failed",
      });
    });
  });

  // ---------------------------------------------------------------- PUT
  describe("PUT many potPfs for a tmnt", () => {
    // PUTs a valid body, mocks createMany's count, and returns status + body
    const putValid = async (
      tmntId: string,
      potPfs: potPfType[],
      potIds: string[]
    ) => {
      prismaMock.pot_PF.createMany.mockResolvedValue({ count: potPfs.length });
      const data: potPfSaveDataType = { potPfData: potPfs, potIds };
      const response = await PUT(putRequest(tmntId, data), ctx(tmntId));
      return { status: response.status, body: await response.json() };
    };

    describe("1 pot", () => {
      const pmTmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
      const pmPotId = "pot_b2a7b02d761b4f5ab5438be84f642c3b";
      const pmPotPf1: potPfType = {
        ...initPotPf,
        id: "ppf_59eac0c17bf74348b44041e97469ad76",
        pot_id: pmPotId,
        position: 1,
        amount: 50,
      };
      const pmPotPf2: potPfType = {
        ...initPotPf,
        id: "ppf_0fed31aae5374e6690b6535ced1ebff5",
        pot_id: pmPotId,
        position: 2,
        amount: 10,
      };
      const validPotIds = [pmPotId];

      it("should delete then create potPfs in one transaction", async () => {
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);

        const { status, body } = await putValid(pmTmntId, pmPotPfs, validPotIds);

        expect(status).toBe(200);
        expect(body.message).toBe("potPfs replaced");
        expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
        expect(prismaMock.pot_PF.deleteMany).toHaveBeenCalledWith({
          where: { pot: { div: { tmnt_id: pmTmntId } } },
        });
        // delete runs before create
        expect(
          prismaMock.pot_PF.deleteMany.mock.invocationCallOrder[0]
        ).toBeLessThan(prismaMock.pot_PF.createMany.mock.invocationCallOrder[0]);
        // the rows sent to the "db" are the rows returned
        expect(prismaMock.pot_PF.createMany).toHaveBeenCalledWith({
          data: body.potPfs,
        });
      });

      it("should update many potPfs - change amount", async () => {
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].amount = 350;
        pmPotPfs[1].amount = 250;

        const { status, body } = await putValid(pmTmntId, pmPotPfs, validPotIds);

        expect(status).toBe(200);
        expect(body.count).toBe(pmPotPfs.length);
        expect(body.potPfs).toMatchObject(sentFields(pmPotPfs));
      });

      it("should update many potPfs - add row", async () => {
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs.push({
          ...initPotPf,
          id: "ppf_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          pot_id: pmPotId,
          position: 3,
          amount: 5,
        });

        const { status, body } = await putValid(pmTmntId, pmPotPfs, validPotIds);

        expect(status).toBe(200);
        expect(body.count).toBe(3);
        expect(body.potPfs).toMatchObject(sentFields(pmPotPfs));
      });

      it("should update many potPfs - change amount and delete a row", async () => {
        const pmPotPfs = cloneDeep([pmPotPf1]);
        pmPotPfs[0].amount = 400;

        const { status, body } = await putValid(pmTmntId, pmPotPfs, validPotIds);

        expect(status).toBe(200);
        expect(body.count).toBe(1);
        expect(body.potPfs).toMatchObject(sentFields(pmPotPfs));
      });

      it("should update many potPfs - sanitize amount", async () => {
        const pmPotPfs = cloneDeep([pmPotPf1, pmPotPf2]);
        pmPotPfs[0].amount = 350.351;

        const { status, body } = await putValid(pmTmntId, pmPotPfs, validPotIds);

        expect(status).toBe(200);
        expect(body.potPfs[0].amount).toBe(350.35);
        expect(body.potPfs[1].amount).toBe(pmPotPfs[1].amount);
        // the sanitized amount is what was sent to the "db"
        const sent = firstArg(prismaMock.pot_PF.createMany) as {
          data: { amount: number }[];
        };
        expect(sent.data[0].amount).toBe(350.35);
      });

      it("should update many potPfs - empty potPfs deletes all rows", async () => {
        const { status, body } = await putValid(pmTmntId, [], validPotIds);

        expect(status).toBe(200);
        expect(body.count).toBe(0);
        expect(body.potPfs).toHaveLength(0);
        expect(prismaMock.pot_PF.deleteMany).toHaveBeenCalledTimes(1);
        expect(prismaMock.pot_PF.createMany).toHaveBeenCalledWith({ data: [] });
      });
    });

    describe("2 divs, 4 pots", () => {
      const pmTmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
      const pmPotId1 = "pot_761fb6d8a9a04cb4b3372e212da2a3b0";
      const pmPotId2 = "pot_771fb6d8a9a04cb4b3372e212da2a3b0";
      const pmPotId3 = "pot_781fb6d8a9a04cb4b3372e212da2a3b0";
      const pmPotId4 = "pot_791fb6d8a9a04cb4b3372e212da2a3b0";
      const makePf = (
        id: string,
        pot_id: string,
        position: number,
        amount: number
      ): potPfType => ({ ...initPotPf, id, pot_id, position, amount });
      const allPotPfs: potPfType[] = [
        makePf("ppf_560a2316645844bb9bdeb094911b9e9d", pmPotId1, 1, 75),
        makePf("ppf_840e009bd5bd4e4aa389ddd02df50f23", pmPotId1, 2, 15),
        makePf("ppf_7e7d7dca4de74085b609030192aa15a5", pmPotId2, 1, 40),
        makePf("ppf_b14d1847af30480aa4123594b0072cb1", pmPotId2, 2, 10),
        makePf("ppf_7e44498e84034bc1a080bfff569680bb", pmPotId3, 1, 80),
        makePf("ppf_9032c654c42240d78eeea91de320049f", pmPotId3, 2, 20),
        makePf("ppf_094a1a974e034940b847bef5b67a4b63", pmPotId4, 1, 40),
        makePf("ppf_710eda589d3f4106abe78006195e328a", pmPotId4, 2, 10),
      ];
      const validPotIds = [pmPotId1, pmPotId2, pmPotId3, pmPotId4];

      it("should update many potPfs - change amount 1 pot", async () => {
        const pmPotPfs = cloneDeep(allPotPfs);
        pmPotPfs[0].amount = 350;
        pmPotPfs[1].amount = 250;

        const { status, body } = await putValid(pmTmntId, pmPotPfs, validPotIds);

        expect(status).toBe(200);
        expect(body.count).toBe(8);
        expect(body.potPfs).toMatchObject(sentFields(pmPotPfs));
      });

      it("should update many potPfs - add row", async () => {
        const pmPotPfs = cloneDeep(allPotPfs);
        pmPotPfs.push(
          makePf("ppf_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", pmPotId1, 3, 10)
        );

        const { status, body } = await putValid(pmTmntId, pmPotPfs, validPotIds);

        expect(status).toBe(200);
        expect(body.count).toBe(9);
        // validatePotPfs returns rows sorted by pot_id, then position
        const sortedPotPfs = pmPotPfs.toSorted((a, b) => {
          const potCompare = a.pot_id.localeCompare(b.pot_id);
          if (potCompare !== 0) {
            return potCompare;
          }
          return (a.position ?? 0) - (b.position ?? 0);
        });
        expect(body.potPfs).toMatchObject(sentFields(sortedPotPfs));
      });

      it("should update many potPfs - change amount and delete a row", async () => {
        const pmPotPfs = cloneDeep(allPotPfs.slice(0, 7));
        pmPotPfs[2].amount = 400;

        const { status, body } = await putValid(pmTmntId, pmPotPfs, validPotIds);

        expect(status).toBe(200);
        expect(body.count).toBe(7);
        expect(body.potPfs).toMatchObject(sentFields(pmPotPfs));
      });
    });

    describe("errors", () => {
      const pmTmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
      const pmPotId = "pot_b2a7b02d761b4f5ab5438be84f642c3b";
      const pmPotPf1: potPfType = {
        ...initPotPf,
        id: "ppf_59eac0c17bf74348b44041e97469ad76",
        pot_id: pmPotId,
        position: 1,
        amount: 50,
      };
      const pmPotPf2: potPfType = {
        ...initPotPf,
        id: "ppf_0fed31aae5374e6690b6535ced1ebff5",
        pot_id: pmPotId,
        position: 2,
        amount: 10,
      };
      const validPotIds = [pmPotId];
      const validData = (): potPfSaveDataType => ({
        potPfData: cloneDeep([pmPotPf1, pmPotPf2]),
        potIds: cloneDeep(validPotIds),
      });

      // valid data with one field of the 1st potPf replaced
      const withField = (field: string, value: unknown) => {
        const data = validData();
        return {
          ...data,
          potPfData: [{ ...data.potPfData[0], [field]: value }, data.potPfData[1]],
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

      // ---- 400: isPotPfSaveDataType fails
      it("should return 400 when potPfData is not an array", async () => {
        await expectRejected({ ...validData(), potPfData: pmPotPf2 }, 400);
      });

      it("should return 400 when potPfData is not formatted correctly", async () => {
        const invalidPmPotPf1 = {
          id: "ppf_59eac0c17bf74348b44041e97469ad76",
          position: 1,
          amount: 50,
        };
        await expectRejected(
          { ...validData(), potPfData: [invalidPmPotPf1, pmPotPf2] },
          400
        );
      });

      it("should return 400 when potIds is not an array", async () => {
        const data = validData();
        await expectRejected({ ...data, potIds: data.potPfData }, 400);
      });

      it("should return 400 when potIds is not an array of strings", async () => {
        await expectRejected({ ...validData(), potIds: [123] }, 400);
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
      it.each(["id", "pot_id", "position", "amount"])(
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

      // ---- 422: validatePotPfs fails
      it.each([
        { desc: "id is invalid", field: "id", value: "test" },
        { desc: "id is valid, but not an potPf id", field: "id", value: userId },
        { desc: "pot_id is invalid", field: "pot_id", value: "test" },
        { desc: "pot_id is valid, but not a pot id", field: "pot_id", value: userId },
        {
          desc: "pot_id is a div id",
          field: "pot_id",
          value: "div_99a3cae28786485bb7a036935f0f6a0a",
        },
        {
          desc: "pot_id is not in the valid pot id list",
          field: "pot_id",
          value: notFoundPotId,
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
        data.potPfData[0].position = 4;
        data.potPfData[1].position = 5;
        await expectRejected(data, 422);
      });

      it("should return 422 when position is not in sequence", async () => {
        const data = validData();
        data.potPfData[1].position = 4;
        await expectRejected(data, 422);
      });

      it("should return 422 when amount is not decreasing", async () => {
        const data = validData();
        // 1st amount is 50 (pmPotPf1), so the 2nd is higher than the 1st
        data.potPfData[1].amount = 51;
        await expectRejected(data, 422);
      });

      // ---- database errors
      it("should return 409 when tmntId is not found (pot foreign key fails)", async () => {
        // with a real db, createMany fails the pot_id foreign key (P2003)
        // because the pots do not belong to a tmnt that exists
        prismaMock.pot_PF.createMany.mockRejectedValue({ code: "P2003" });

        const response = await PUT(
          putRequest(notFoundTmntId, validData()),
          ctx(notFoundTmntId)
        );

        expect(response.status).toBe(409);
      });

      it("should return 409 when an pot_id / position pair is duplicated", async () => {
        prismaMock.pot_PF.createMany.mockRejectedValue({ code: "P2002" });

        const response = await PUT(putRequest(pmTmntId, validData()), ctx(pmTmntId));

        expect(response.status).toBe(409);
      });

      it("should return 500 when the delete throws", async () => {
        prismaMock.pot_PF.deleteMany.mockRejectedValue(new Error("connection failed"));

        const response = await PUT(putRequest(pmTmntId, validData()), ctx(pmTmntId));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          message: "error replacing potPfs for tournament - connection failed",
        });
        expect(prismaMock.pot_PF.createMany).not.toHaveBeenCalled();
      });

      it("should return 500 when the transaction throws", async () => {
        prismaMock.$transaction.mockRejectedValue(new Error("connection failed"));

        const response = await PUT(putRequest(pmTmntId, validData()), ctx(pmTmntId));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          message: "error replacing potPfs for tournament - connection failed",
        });
      });
    });
  });
});
