import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { cloneDeep } from "lodash";
import PlayerNameWithScore from "@/app/results/tmnt/[tmntId]/pots/playerNameWithScore";
import { getPlayerName } from "@/lib/getName";
import { potResultsRowType } from "@/lib/results/pots/potResults";
import { divType, tmntFullType } from "@/lib/types/types";
import { mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

const FIGURE_SPACE = "\u2007";

// keep figure spaces when checking text; toHaveTextContent collapses
// whitespace by default and JS treats \u2007 as whitespace
const exact = { normalizeWhitespace: false };

describe("PlayerNameWithScore", () => {
  let tmntFullData: tmntFullType;
  let hdcpDiv: divType;
  let scratchDiv: divType;
  let playerId: string;
  let playerName: string;

  // builds a row with only the fields the component reads
  const makeRow = (overrides: Partial<potResultsRowType> = {}): potResultsRowType =>
    ({
      player_id: playerId,
      score: 200,
      hdcp: 15,
      scoreWithHdcp: 215,
      ...overrides,
    } as potResultsRowType);

  beforeEach(() => {
    tmntFullData = cloneDeep(mockTmntFullData);
    playerId = tmntFullData.players[0].id;
    playerName = getPlayerName(tmntFullData.players, playerId);
    hdcpDiv = { ...cloneDeep(tmntFullData.divs[0]), hdcp_per: 0.9 };
    scratchDiv = { ...cloneDeep(tmntFullData.divs[0]), hdcp_per: 0 };
  });

  // getByText matches an element's own text nodes, so:
  //  - getByText("215") finds the score span (its child span is ignored)
  //  - getByText("(200 + 15)") finds the breakdown span

  describe("render player name", () => {
    it("renders the player name from tmntFullData.players", () => {
      render(
        <PlayerNameWithScore row={makeRow()} tmntFullData={tmntFullData} div={hdcpDiv} />
      );
      expect(playerName).not.toBe("");
      expect(screen.getByText(playerName)).toBeInTheDocument();
    });

    it("renders the name for a different player", () => {
      const otherId = tmntFullData.players[1].id;
      const otherName = getPlayerName(tmntFullData.players, otherId);
      render(
        <PlayerNameWithScore
          row={makeRow({ player_id: otherId })}
          tmntFullData={tmntFullData}
          div={hdcpDiv}
        />
      );
      expect(screen.getByText(otherName)).toBeInTheDocument();
      expect(screen.queryByText(playerName)).not.toBeInTheDocument();
    });

    it("does not crash when the player id is not found", () => {
      render(
        <PlayerNameWithScore
          row={makeRow({ player_id: "ply_00000000000000000000000000000000" })}
          tmntFullData={tmntFullData}
          div={hdcpDiv}
        />
      );
      expect(screen.getByText("215")).toBeInTheDocument();
    });
  });

  describe("render score with handicap", () => {
    it("renders scoreWithHdcp in a span that does not wrap", () => {
      render(
        <PlayerNameWithScore row={makeRow()} tmntFullData={tmntFullData} div={hdcpDiv} />
      );
      const scoreSpan = screen.getByText("215");
      expect(scoreSpan).toHaveClass("ms-auto", "ps-2", "text-nowrap");
      expect(scoreSpan).toHaveTextContent(/^215 \(200 \+ 15\)$/, exact);
    });

    it("renders only scoreWithHdcp in a scratch division", () => {
      const row = makeRow({ score: 200, hdcp: 0, scoreWithHdcp: 200 });
      render(
        <PlayerNameWithScore row={row} tmntFullData={tmntFullData} div={scratchDiv} />
      );
      expect(screen.getByText("200")).toHaveTextContent(/^200$/, exact);
    });
  });

  describe("render handicap breakdown", () => {
    it("renders (score + hdcp) when div has handicap and score is not null", () => {
      render(
        <PlayerNameWithScore row={makeRow()} tmntFullData={tmntFullData} div={hdcpDiv} />
      );
      const breakdown = screen.getByText("(200 + 15)");
      expect(breakdown).toHaveClass("small");
      expect(breakdown).toHaveTextContent(/^ \(200 \+ 15\)$/, exact);
    });

    it("does not render the breakdown when div hdcp_per is 0", () => {
      render(
        <PlayerNameWithScore row={makeRow()} tmntFullData={tmntFullData} div={scratchDiv} />
      );
      expect(screen.queryByText("(200 + 15)")).not.toBeInTheDocument();
      expect(screen.getByText("215")).toHaveTextContent(/^215$/, exact);
    });

    it("does not render the breakdown when score is null", () => {
      const row = makeRow({ score: null } as unknown as Partial<potResultsRowType>);
      render(
        <PlayerNameWithScore row={row} tmntFullData={tmntFullData} div={hdcpDiv} />
      );
      expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
      expect(screen.getByText("215")).toHaveTextContent(/^215$/, exact);
    });

    it("does not render the breakdown when score is undefined", () => {
      const row = makeRow({ score: undefined } as unknown as Partial<potResultsRowType>);
      render(
        <PlayerNameWithScore row={row} tmntFullData={tmntFullData} div={hdcpDiv} />
      );
      expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
    });

    it("renders the breakdown when score is 0", () => {
      const row = makeRow({ score: 0, hdcp: 25, scoreWithHdcp: 25 });
      render(
        <PlayerNameWithScore row={row} tmntFullData={tmntFullData} div={hdcpDiv} />
      );
      expect(screen.getByText("(0 + 25)")).toHaveTextContent(/^ \(0 \+ 25\)$/, exact);
    });
  });

  describe("render figure space padding", () => {
    it("adds a figure space when hdcp is a single digit", () => {
      const row = makeRow({ score: 200, hdcp: 7, scoreWithHdcp: 207 });
      render(
        <PlayerNameWithScore row={row} tmntFullData={tmntFullData} div={hdcpDiv} />
      );
      expect(screen.getByText("(200 + 7)")).toHaveTextContent(
        new RegExp(`^ \\(200 \\+ 7\\)${FIGURE_SPACE}$`),
        exact
      );
    });

    it("adds a figure space when hdcp is 0", () => {
      const row = makeRow({ score: 200, hdcp: 0, scoreWithHdcp: 200 });
      render(
        <PlayerNameWithScore row={row} tmntFullData={tmntFullData} div={hdcpDiv} />
      );
      expect(screen.getByText("(200 + 0)")).toHaveTextContent(
        new RegExp(`^ \\(200 \\+ 0\\)${FIGURE_SPACE}$`),
        exact
      );
    });

    it("does not add a figure space when hdcp is 10", () => {
      const row = makeRow({ score: 200, hdcp: 10, scoreWithHdcp: 210 });
      render(
        <PlayerNameWithScore row={row} tmntFullData={tmntFullData} div={hdcpDiv} />
      );
      expect(screen.getByText("(200 + 10)")).toHaveTextContent(/^ \(200 \+ 10\)$/, exact);
    });

    it("does not add a figure space when hdcp is 2+ digits", () => {
      const row = makeRow({ score: 180, hdcp: 45, scoreWithHdcp: 225 });
      render(
        <PlayerNameWithScore row={row} tmntFullData={tmntFullData} div={hdcpDiv} />
      );
      expect(screen.getByText("(180 + 45)")).toHaveTextContent(/^ \(180 \+ 45\)$/, exact);
    });

    it("does not add a figure space when hdcp is null", () => {
      const row = makeRow({ hdcp: null } as unknown as Partial<potResultsRowType>);
      render(
        <PlayerNameWithScore row={row} tmntFullData={tmntFullData} div={hdcpDiv} />
      );
      expect(screen.getByText("(200 + )")).toHaveTextContent(/^ \(200 \+ \)$/, exact);
    });

    it("does not render a figure space in a scratch div, even with a single digit hdcp", () => {
      const row = makeRow({ score: 200, hdcp: 5, scoreWithHdcp: 205 });
      render(
        <PlayerNameWithScore row={row} tmntFullData={tmntFullData} div={scratchDiv} />
      );
      expect(screen.getByText("205")).toHaveTextContent(/^205$/, exact);
    });
  });
});