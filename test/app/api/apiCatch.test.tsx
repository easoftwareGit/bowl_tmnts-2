import { NextResponse } from "next/server";
import { getErrorStatus, standardCatchReturn } from "@/app/api/apiCatch";

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

describe("errCodes", () => {
  const jsonMock = NextResponse.json as unknown as jest.Mock;

  beforeEach(() => {
    jsonMock.mockReset();
    jsonMock.mockReturnValue({ mocked: true });
  });

  describe("getErrorStatus", () => {
    it("returns 409 for P2002", () => {
      expect(getErrorStatus("P2002")).toBe(409);
    });

    it("returns 409 for P2003", () => {
      expect(getErrorStatus("P2003")).toBe(409);
    });

    it("returns 404 for P2025", () => {
      expect(getErrorStatus("P2025")).toBe(404);
    });

    it("returns 500 for unknown code", () => {
      expect(getErrorStatus("XYZ")).toBe(500);
    });

    it("returns 500 when code is undefined", () => {
      expect(getErrorStatus(undefined)).toBe(500);
    });
  });

  describe("standardCatchReturn", () => {
    it("returns 409 when error code is P2002", () => {
      const err = { code: "P2002" };

      const result = standardCatchReturn(err, "route error");

      expect(jsonMock).toHaveBeenCalledWith(
        { message: "route error" },
        { status: 409 }
      );

      expect(result).toEqual({ mocked: true });
    });

    it("returns 404 when error code is P2025", () => {
      const err = { code: "P2025" };

      standardCatchReturn(err, "not found");

      expect(jsonMock).toHaveBeenCalledWith(
        { message: "not found" },
        { status: 404 }
      );
    });

    it("returns 500 when err has no code property", () => {
      const err = { message: "boom" };

      standardCatchReturn(err, "route error");

      expect(jsonMock).toHaveBeenCalledWith(
        { message: "route error" },
        { status: 500 }
      );
    });

    it("returns 500 when err is null", () => {
      standardCatchReturn(null, "route error");

      expect(jsonMock).toHaveBeenCalledWith(
        { message: "route error" },
        { status: 500 }
      );
    });

    it("returns 500 when err is a primitive", () => {
      standardCatchReturn("boom", "route error");

      expect(jsonMock).toHaveBeenCalledWith(
        { message: "route error" },
        { status: 500 }
      );
    });

    it("returns 500 when err.code exists but is not a string", () => {
      const err = { code: 123 };

      standardCatchReturn(err, "route error");

      expect(jsonMock).toHaveBeenCalledWith(
        { message: "route error" },
        { status: 500 }
      );
    });
  });
});