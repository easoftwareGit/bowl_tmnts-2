import React from "react";
import { render, screen } from "@testing-library/react";

const useParamsMock = jest.fn();

jest.mock("next/navigation", () => ({
  useParams: () => useParamsMock(),
}));

jest.mock("@/app/reports/components/ReportDataContainer", () => {
  return function MockReportDataContainer({
    tmntId,
    reportId,
  }: {
    tmntId: string;
    reportId: string;
  }) {
    return (
      <div data-testid="report-data-container">
        tmntId: {tmntId}, reportId: {reportId}
      </div>
    );
  };
});

import ReportPage from "@/app/reports/[tmntId]/[reportId]/page";

describe("ReportPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useParamsMock.mockReturnValue({
      tmntId: "tmt_123",
      reportId: "recapsPerPair",
    });
  });

  it("renders ReportDataContainer", () => {
    render(<ReportPage />);

    expect(screen.getByTestId("report-data-container")).toBeInTheDocument();
  });

  it("passes tmntId from route params to ReportDataContainer", () => {
    render(<ReportPage />);

    expect(screen.getByText(/tmntId: tmt_123/i)).toBeInTheDocument();
  });

  it("passes reportId from route params to ReportDataContainer", () => {
    render(<ReportPage />);

    expect(screen.getByText(/reportId: recapsPerPair/i)).toBeInTheDocument();
  });

  it("handles a different reportId", () => {
    useParamsMock.mockReturnValue({
      tmntId: "tmt_456",
      reportId: "gridScores",
    });

    render(<ReportPage />);

    expect(
      screen.getByText(/tmntId: tmt_456, reportId: gridScores/i),
    ).toBeInTheDocument();
  });
});