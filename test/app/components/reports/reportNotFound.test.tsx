import React from "react";

jest.mock("@react-pdf/renderer", () => ({
  Document: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="pdf-document" {...props}>
      {children}
    </div>
  ),
  Page: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="pdf-page" {...props}>
      {children}
    </div>
  ),
  Text: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <span {...props}>{children}</span>
  ),
  View: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div {...props}>{children}</div>
  ),
  StyleSheet: {
    create: <T extends Record<string, unknown>>(styles: T): T => styles,
  },
}));

import ReportNotFound from "@/app/reports/components/ReportNotFound";

describe("ReportNotFound", () => {

  it("returns a document", () => {
    const doc = ReportNotFound({
      reportId: "badReport",
    });

    expect(doc).toBeDefined();
  });

  it("uses the correct document title", () => {
    const doc = ReportNotFound({
      reportId: "badReport",
    });

    expect(doc.props.title).toBe("Report Not Found");
  });

  it("creates a single page", () => {
    const doc = ReportNotFound({
      reportId: "badReport",
    });

    expect(doc.props.children).toBeDefined();
  });

  it("accepts any report id", () => {
    const doc = ReportNotFound({
      reportId: "recapsPerPair",
    });

    expect(doc).toBeDefined();
    expect(doc.props.title).toBe("Report Not Found");
  });

  it("handles an empty report id", () => {
    const doc = ReportNotFound({
      reportId: "",
    });

    expect(doc).toBeDefined();
    expect(doc.props.title).toBe("Report Not Found");
  });

  it("handles a long report id", () => {
    const doc = ReportNotFound({
      reportId:
        "thisIsAVeryLongInvalidReportIdThatShouldStillRenderCorrectly",
    });

    expect(doc).toBeDefined();
    expect(doc.props.title).toBe("Report Not Found");
  });

  it("handles special characters in report id", () => {
    const doc = ReportNotFound({
      reportId: "!@#$%^&*()",
    });

    expect(doc).toBeDefined();
    expect(doc.props.title).toBe("Report Not Found");
  });

});