import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReportViewer from "@/app/reports/components/ReportViewer";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock("@react-pdf/renderer", () => ({
  PDFViewer: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="pdf-viewer" {...props}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/modal/waitModal", () => {
  return function MockWaitModal({
    show,
    message,
  }: {
    show: boolean;
    message: string;
  }) {
    return show ? <div data-testid="wait-modal">{message}</div> : null;
  };
});

function MockReportDocument({ onRender }: { onRender?: () => void }) {
  React.useEffect(() => {
    onRender?.();
  }, [onRender]);

  return <div data-testid="mock-report-document">Mock Report Document</div>;
}

describe("ReportViewer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const tmntId = "tmt_123";

  const report = {
    title: "Test Report",
    document: <MockReportDocument />,
  };

  it("renders the report title", async () => {
    render(<ReportViewer tmntId={tmntId} report={report} />);

    expect(screen.getByRole("heading", { name: "Test Report" })).toBeInTheDocument();
  });

  it("renders the back button", () => {
    render(<ReportViewer tmntId={tmntId} report={report} />);

    expect(
      screen.getByRole("button", { name: "Back to Run Tournament" }),
    ).toBeInTheDocument();
  });

  it("navigates back to run tournament page when back button is clicked", () => {
    render(<ReportViewer tmntId={tmntId} report={report} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Back to Run Tournament" }),
    );

    expect(pushMock).toHaveBeenCalledWith("/dataEntry/runTmnt/tmt_123");
  });

  it("renders the PDFViewer", () => {
    render(<ReportViewer tmntId={tmntId} report={report} />);

    expect(screen.getByTestId("pdf-viewer")).toBeInTheDocument();
  });

  it("renders the report document inside the PDFViewer", () => {
    render(<ReportViewer tmntId={tmntId} report={report} />);

    expect(screen.getByTestId("mock-report-document")).toBeInTheDocument();
  });

  it("shows loading modal before report finishes rendering", () => {
    function NeverRenderedReport() {
      return <div data-testid="never-rendered-report">Never Rendered</div>;
    }

    const loadingReport = {
      title: "Loading Report",
      document: <NeverRenderedReport />,
    };

    render(<ReportViewer tmntId={tmntId} report={loadingReport} />);

    expect(screen.getByTestId("wait-modal")).toHaveTextContent("Loading report...");
  });

  it("hides loading modal after report onRender runs", async () => {
    render(<ReportViewer tmntId={tmntId} report={report} />);

    await waitFor(() => {
      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
    });
  });
});