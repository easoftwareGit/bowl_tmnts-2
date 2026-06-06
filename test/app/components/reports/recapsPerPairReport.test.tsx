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

import RecapsPerPairReport from "@/app/reports/components/RecapsPerPairReport";

import {
  mockTmntFullData,
  mockByePlayer,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

describe("RecapsPerPairReport", () => {
  it("returns a Recaps Per Pair document when tournament data is valid", () => {
    const doc = RecapsPerPairReport({
      tmntFullData: mockTmntFullData,
    });

    expect(doc).toBeDefined();
    expect(doc.props.title).toBe("Recaps Per Pair");
  });

  it("returns a No Data document when tmntFullData is missing", () => {
    const doc = RecapsPerPairReport({
      tmntFullData: null as never,
    });

    expect(doc).toBeDefined();
    expect(doc.props.title).toBe("No Data");
  });

  it("returns a No Data document when required data is missing", () => {
    const invalidData = {
      ...mockTmntFullData,
      players: null,
    };

    const doc = RecapsPerPairReport({
      tmntFullData: invalidData as never,
    });

    expect(doc.props.title).toBe("No Data");
  });

  it("filters bye players without throwing", () => {
    const tmntWithBye = {
      ...mockTmntFullData,
      players: [
        ...mockTmntFullData.players,
        mockByePlayer,
      ],
    };

    const doc = RecapsPerPairReport({
      tmntFullData: tmntWithBye,
    });

    expect(doc).toBeDefined();
    expect(doc.props.title).toBe("Recaps Per Pair");
  });

  it("creates one page for lanes 29 and 30", () => {
    const doc = RecapsPerPairReport({
      tmntFullData: mockTmntFullData,
    });

    expect(doc.props.children).toHaveLength(1);
  });

  it("creates multiple pages when players span multiple lane pairs", () => {
    const tmntData = {
      ...mockTmntFullData,
      players: [
        ...mockTmntFullData.players,
        {
          ...mockTmntFullData.players[0],
          id: "ply_test_1",
          lane: 31,
          position: "A",
        },
        {
          ...mockTmntFullData.players[1],
          id: "ply_test_2",
          lane: 32,
          position: "B",
        },
      ],
      divEntries: [
        ...mockTmntFullData.divEntries,
        {
          ...mockTmntFullData.divEntries[0],
          id: "den_test_1",
          player_id: "ply_test_1",
        },
        {
          ...mockTmntFullData.divEntries[1],
          id: "den_test_2",
          player_id: "ply_test_2",
        },
      ],
    };

    const doc = RecapsPerPairReport({
      tmntFullData: tmntData,
    });

    expect(doc.props.children).toHaveLength(2);
  });
});