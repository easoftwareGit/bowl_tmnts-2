import { getReportDocument } from "@/app/reports/components/getReportDocument";
import type { tmntFullType } from "@/lib/types/types";

jest.mock("@/app/reports/components/RecapsPerPairReport", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock("@/app/reports/components/RecapsPerTeamReport", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock("@/app/reports/components/GridScoresReport", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock("@/app/reports/components/BalanceSheetReport.tsx", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock("@/app/reports/components/ReportNotFound", () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

import RecapsPerPairReport from "@/app/reports/components/RecapsPerPairReport";
import RecapsPerTeamReport from "@/app/reports/components/RecapsPerTeamReport";
import GridScoresReport from "@/app/reports/components/GridScoresReport";
import BalanceSheetReport from "@/app/reports/components/BalanceSheetReport";
import ReportNotFound from "@/app/reports/components/ReportNotFound";

describe("getReportDocument", () => {
  const mockTmntFullData = {
    tmnt: {
      id: "tmt_123",
      tmnt_name: "Test Tournament",
    },
  } as tmntFullType;

  const mockOnRender = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns Recaps per Pair report for recapsPerPair reportId", () => {
    const result = getReportDocument(
      "recapsPerPair",
      mockTmntFullData,
      mockOnRender,
    );

    expect(result.title).toBe("Recaps per Pair");
    expect(result.document.type).toBe(RecapsPerPairReport);
    expect(result.document.props).toEqual({
      tmntFullData: mockTmntFullData,
      onRender: mockOnRender,
    });
  });

  it("returns Recaps per Team report for recapsPerTeam reportId", () => {
    const result = getReportDocument(
      "recapsPerTeam",
      mockTmntFullData,
      mockOnRender,
    );

    expect(result.title).toBe("Recaps per Team");
    expect(result.document.type).toBe(RecapsPerTeamReport);
    expect(result.document.props).toEqual({
      tmntFullData: mockTmntFullData,
      onRender: mockOnRender,
    });
  });

  it("returns Scores Grid report for scoreGrid reportId", () => {
    const result = getReportDocument(
      "scoreGrid",
      mockTmntFullData,
      mockOnRender,
    );

    expect(result.title).toBe("Scores Grid");
    expect(result.document.type).toBe(GridScoresReport);
    expect(result.document.props).toEqual({
      tmntFullData: mockTmntFullData,
      onRender: mockOnRender,
    });
  });

  it("returns Balance Sheet report for balanceSheet reportId", () => {
    const result = getReportDocument(
      "balanceSheet",
      mockTmntFullData,
      mockOnRender,
    );

    expect(result.title).toBe("Balance Sheet");
    expect(result.document.type).toBe(BalanceSheetReport);
    expect(result.document.props).toEqual({
      tmntFullData: mockTmntFullData,
      onRender: mockOnRender,
    });
  });

  it("returns Report Not Found for unknown reportId", () => {
    const result = getReportDocument(
      "badReportId",
      mockTmntFullData,
      mockOnRender,
    );

    expect(result.title).toBe("Report Not Found");
    expect(result.document.type).toBe(ReportNotFound);
    expect(result.document.props).toEqual({
      reportId: "badReportId",
    });
  });

  it("passes undefined onRender when no onRender callback is provided", () => {
    const result = getReportDocument("recapsPerPair", mockTmntFullData);

    expect(result.title).toBe("Recaps per Pair");
    expect(result.document.type).toBe(RecapsPerPairReport);
    expect(result.document.props).toEqual({
      tmntFullData: mockTmntFullData,
      onRender: undefined,
    });
  });
});