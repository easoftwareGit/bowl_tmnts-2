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

import RecapsPerTeamReport from "@/app/reports/components/RecapsPerTeamReport";

import {
  mockTmntFullData,
  mockByePlayer,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

describe("RecapsPerTeamReport", () => {

  it("returns a Recaps Per Team document when tournament data is valid", () => {
    const doc = RecapsPerTeamReport({
      tmntFullData: mockTmntFullData,
    });

    expect(doc).toBeDefined();
    expect(doc.props.title).toBe("Recaps Per Team");
  });

  it("returns No Data document when tmntFullData is missing", () => {
    const doc = RecapsPerTeamReport({
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

    const doc = RecapsPerTeamReport({
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

    const doc = RecapsPerTeamReport({
      tmntFullData: tmntWithBye,
    });

    expect(doc).toBeDefined();
    expect(doc.props.title).toBe("Recaps Per Team");
  });

  it("creates one page for the mock tournament", () => {
    const doc = RecapsPerTeamReport({
      tmntFullData: mockTmntFullData,
    });

    expect(Array.isArray(doc.props.children)).toBe(true);
    expect(doc.props.children).toHaveLength(1);
  });

  it("creates multiple pages when enough players exist", () => {
    const extraPlayers = Array.from({ length: 10 }, (_, i) => ({
      ...mockTmntFullData.players[0],
      id: `ply_extra_${i}`,
    }));

    const extraEntries = extraPlayers.map((player, i) => ({
      ...mockTmntFullData.divEntries[0],
      id: `den_extra_${i}`,
      player_id: player.id,
    }));

    const tmntData = {
      ...mockTmntFullData,
      players: [
        ...mockTmntFullData.players,
        ...extraPlayers,
      ],
      divEntries: [
        ...mockTmntFullData.divEntries,
        ...extraEntries,
      ],
    };

    const doc = RecapsPerTeamReport({
      tmntFullData: tmntData,
    });

    expect(doc.props.children.length).toBeGreaterThan(1);
  });

  it("renders scratch division report", () => {
    const scratchOnly = {
      ...mockTmntFullData,
      divs: [mockTmntFullData.divs[0]],
    };

    const doc = RecapsPerTeamReport({
      tmntFullData: scratchOnly,
    });

    expect(doc).toBeDefined();
    expect(doc.props.title).toBe("Recaps Per Team");
  });

  it("renders handicap division report", () => {
    const hdcpOnly = {
      ...mockTmntFullData,
      divs: [mockTmntFullData.divs[1]],
      divEntries: mockTmntFullData.divEntries.map(entry => ({
        ...entry,
        div_id: mockTmntFullData.divs[1].id,
      })),
    };

    const doc = RecapsPerTeamReport({
      tmntFullData: hdcpOnly,
    });

    expect(doc).toBeDefined();
    expect(doc.props.title).toBe("Recaps Per Team");
  });

  it("preserves onRender prop", () => {
    const onRender = jest.fn();

    const doc = RecapsPerTeamReport({
      tmntFullData: mockTmntFullData,
      onRender,
    });

    expect(doc.props.onRender).toBe(onRender);
  });

});