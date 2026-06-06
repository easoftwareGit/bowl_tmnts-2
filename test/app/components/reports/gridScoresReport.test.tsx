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

import GridScoresReport from "@/app/reports/components/GridScoresReport";

import {
  mockTmntFullData,
  mockByePlayer,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

describe("GridScoresReport", () => {

  it("returns a document when tournament data is valid", () => {
    const doc = GridScoresReport({
      tmntFullData: mockTmntFullData,
    });

    expect(doc).toBeDefined();
    expect(doc.props.title).toBe("Grid Scores");
  });

  it("returns No Data document when tmntFullData is missing", () => {
    const doc = GridScoresReport({
      tmntFullData: null as never,
    });

    expect(doc).toBeDefined();
    expect(doc.props.title).toBe("No Data");
  });

  it("returns No Data document when players are missing", () => {
    const invalidData = {
      ...mockTmntFullData,
      players: null,
    };

    const doc = GridScoresReport({
      tmntFullData: invalidData as never,
    });

    expect(doc.props.title).toBe("No Data");
  });

  it("handles bye players", () => {
    const tmntWithBye = {
      ...mockTmntFullData,
      players: [
        ...mockTmntFullData.players,
        mockByePlayer,
      ],
    };

    const doc = GridScoresReport({
      tmntFullData: tmntWithBye,
    });

    expect(doc).toBeDefined();
    expect(doc.props.title).toBe("Grid Scores");
  });

  it("creates one page for the mock tournament", () => {
    const doc = GridScoresReport({
      tmntFullData: mockTmntFullData,
    });

    expect(Array.isArray(doc.props.children)).toBe(true);
    expect(doc.props.children).toHaveLength(1);
  });

  it("creates multiple pages when more than 41 players exist", () => {
    const extraPlayers = Array.from({ length: 50 }, (_, i) => ({
      ...mockTmntFullData.players[0],
      id: `ply_extra_${i}`,
      first_name: `Extra${i}`,
    }));

    const tmntData = {
      ...mockTmntFullData,
      players: [
        ...mockTmntFullData.players,
        ...extraPlayers,
      ],
    };

    const doc = GridScoresReport({
      tmntFullData: tmntData,
    });

    expect(doc.props.children.length).toBeGreaterThan(1);
  });

  it("preserves onRender prop", () => {
    const onRender = jest.fn();

    const doc = GridScoresReport({
      tmntFullData: mockTmntFullData,
      onRender,
    });

    expect(doc.props.onRender).toBe(onRender);
  });

  it("handles a tournament with only one player", () => {
    const tmntData = {
      ...mockTmntFullData,
      players: [mockTmntFullData.players[0]],
    };

    const doc = GridScoresReport({
      tmntFullData: tmntData,
    });

    expect(doc).toBeDefined();
    expect(doc.props.children).toHaveLength(1);
  });

  it("handles long player names without throwing", () => {
    const tmntData = {
      ...mockTmntFullData,
      players: [
        {
          ...mockTmntFullData.players[0],
          first_name: "ThisIsAnExtremelyLongFirstName",
          last_name: "ThisIsAnExtremelyLongLastName",
        },
      ],
    };

    const doc = GridScoresReport({
      tmntFullData: tmntData,
    });

    expect(doc).toBeDefined();
  });

});