import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

jest.mock("@react-pdf/renderer", () => ({
  PDFViewer: ({ children }: React.PropsWithChildren) => (
    <div data-testid="pdf-viewer">{children}</div>
  ),
}));

const dispatchMock = jest.fn();
let mockTmntFullData: unknown = null;
let mockLoadStatus = "idle";
let mockError: string | null = null;

jest.mock("react-redux", () => ({
  useDispatch: () => dispatchMock,
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({
      tmntFullData: {
        tmntFullData: mockTmntFullData,
        loadStatus: mockLoadStatus,
        error: mockError,
      },
    }),
}));

const fetchTmntFullDataMock = jest.fn((tmntId: string) => ({
  type: "tmntFullData/fetchTmntFullData",
  payload: tmntId,
}));

jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => ({
  fetchTmntFullData: (tmntId: string) => fetchTmntFullDataMock(tmntId),
  getTmntFullDataLoadStatus: (state: any) => state.tmntFullData.loadStatus,
  getTmntFullDataError: (state: any) => state.tmntFullData.error,
}));

const getReportDocumentMock = jest.fn();

jest.mock("@/app/reports/components/getReportDocument", () => ({
  getReportDocument: (...args: unknown[]) => getReportDocumentMock(...args),
}));

jest.mock("@/app/reports/components/ReportViewer", () => {
  return function MockReportViewer({
    tmntId,
    report,
  }: {
    tmntId: string;
    report: { title: string };
  }) {
    return (
      <div data-testid="report-viewer">
        ReportViewer {tmntId} {report.title}
      </div>
    );
  };
});

import ReportDataContainer from "@/app/reports/components/ReportDataContainer";
import { mockTmntFullData as baseMockTmntFullData } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

describe("ReportDataContainer", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockTmntFullData = null;
    mockLoadStatus = "idle";
    mockError = null;

    getReportDocumentMock.mockReturnValue({
      title: "Test Report",
      document: <div>Mock Report Document</div>,
    });
  });

  it("shows loading message when tournament data is loading", () => {
    mockLoadStatus = "loading";

    render(
      <ReportDataContainer
        tmntId="tmt_123"
        reportId="recapsPerPair"
      />,
    );

    expect(screen.getByText("Loading report data...")).toBeInTheDocument();
  });

  it("shows error message when tournament data has an error", () => {
    mockError = "Test error";

    render(
      <ReportDataContainer
        tmntId="tmt_123"
        reportId="recapsPerPair"
      />,
    );

    expect(screen.getByText("Error loading report: Test error")).toBeInTheDocument();
  });

  it("shows no data message when tournament data is missing", () => {
    render(
      <ReportDataContainer
        tmntId="tmt_123"
        reportId="recapsPerPair"
      />,
    );

    expect(screen.getByText("No tournament data found.")).toBeInTheDocument();
  });

  it("dispatches fetchTmntFullData when tournament data is missing", async () => {
    render(
      <ReportDataContainer
        tmntId="tmt_123"
        reportId="recapsPerPair"
      />,
    );

    await waitFor(() => {
      expect(fetchTmntFullDataMock).toHaveBeenCalledWith("tmt_123");
    });
    expect(dispatchMock).toHaveBeenCalledWith({
      type: "tmntFullData/fetchTmntFullData",
      payload: "tmt_123",
    });
  });

  it("dispatches fetchTmntFullData when loaded tournament id does not match tmntId", async () => {
    mockTmntFullData = {
      ...baseMockTmntFullData,
      tmnt: {
        ...baseMockTmntFullData.tmnt,
        id: "tmt_different",
      },
    };

    render(
      <ReportDataContainer
        tmntId="tmt_123"
        reportId="recapsPerPair"
      />,
    );

    await waitFor(() => {
      expect(fetchTmntFullDataMock).toHaveBeenCalledWith("tmt_123");
    });
  });

  it("does not dispatch fetchTmntFullData when tmntId is empty", async () => {
    render(
      <ReportDataContainer
        tmntId=""
        reportId="recapsPerPair"
      />,
    );

    await waitFor(() => {
      expect(fetchTmntFullDataMock).not.toHaveBeenCalled();
    });
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it("renders ReportViewer when tournament data is loaded", () => {
    mockTmntFullData = baseMockTmntFullData;

    render(
      <ReportDataContainer
        tmntId={baseMockTmntFullData.tmnt.id}
        reportId="recapsPerPair"
      />,
    );

    expect(screen.getByTestId("report-viewer")).toBeInTheDocument();
  });

  it("calls getReportDocument with reportId and tournament data", () => {
    mockTmntFullData = baseMockTmntFullData;

    render(
      <ReportDataContainer
        tmntId={baseMockTmntFullData.tmnt.id}
        reportId="recapsPerPair"
      />,
    );

    expect(getReportDocumentMock).toHaveBeenCalledWith(
      "recapsPerPair",
      baseMockTmntFullData,
    );
  });

  it("passes tmntId and report to ReportViewer", () => {
    mockTmntFullData = baseMockTmntFullData;

    render(
      <ReportDataContainer
        tmntId={baseMockTmntFullData.tmnt.id}
        reportId="recapsPerPair"
      />,
    );

    expect(screen.getByText(
      `ReportViewer ${baseMockTmntFullData.tmnt.id} Test Report`,
    )).toBeInTheDocument();
  });
});