import React from "react";
import { getDefaultNormalizer, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { cloneDeep } from "lodash";
import ElimGame from "@/app/results/tmnt/[tmntId]/elims/elimGame";
import { elimResults, erAliveKey } from "@/lib/results/elims/elimResults";
import { tgrGameKey, tgrHdcpKey } from "@/lib/types/resultsTypes";
import { divType } from "@/lib/types/types";
import { mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// render next/image as a plain img so its attributes can be checked
jest.mock("next/image", () => {
  const { createElement } = jest.requireActual<typeof import("react")>("react");
  return {
    __esModule: true,
    default: (props: {
      src: string;
      alt: string;
      title?: string;
      width: number;
      height: number;
      className?: string;
    }) =>
      createElement("img", {
        src: props.src,
        alt: props.alt,
        title: props.title,
        width: props.width,
        height: props.height,
        className: props.className,
      }),
  };
});

const FIGURE_SPACE = "\u2007";

// keep figure spaces when checking text; toHaveTextContent collapses
// whitespace by default and JS treats \u2007 as whitespace
const exact = { normalizeWhitespace: false };

// the &nbsp; placeholder is trimmed away by default text matching
const nbspOptions = {
  normalizer: getDefaultNormalizer({ trim: false, collapseWhitespace: false }),
};
const queryNbspSpan = () => screen.queryByText("\u00a0", nbspOptions);

/*
 * Rows follow the rules of buildElimResultsRows:
 *  - [Game N Alive] stays null until [Game N] is set for ALL players
 *  - once [Game N Alive] is false, every later [Game N+k Alive] is null
 *  - a game with no score has no alive status
 *
 * Example rows for 3 games:
 *  eliminated in game 1: alive [false, null, null]
 *  eliminated in game 2: alive [true,  false, null]
 *  not eliminated:       alive [true,  true,  true]
 */
type rowValues = {
  games: (number | null)[];
  alive: (boolean | null)[];
  hdcp?: number;
};

describe("ElimGame", () => {
  let hdcpDiv: divType;
  let scratchDiv: divType;

  const makeRow = ({ games, alive, hdcp = 15 }: rowValues): elimResults => {
    const row: Record<string, unknown> = {
      position: null,
      player_id: mockTmntFullData.players[0].id,
      full_name: "Test Player",
      hdcp,
      prize: null,
    };
    games.forEach((game, i) => {
      const gameNum = i + 1;
      row[tgrGameKey(gameNum)] = game;
      row[tgrHdcpKey(gameNum)] = game == null ? null : game + hdcp;
      row[erAliveKey(gameNum)] = alive[i];
    });
    return row as unknown as elimResults;
  };

  // not eliminated; game 2 is 200 + 15 = 215; the last game has no status
  const advancedRow = () =>
    makeRow({ games: [190, 200, 210], alive: [true, true, null] });

  beforeEach(() => {
    const div = cloneDeep(mockTmntFullData.divs[0]);
    hdcpDiv = { ...div, hdcp_per: 0.9 };
    scratchDiv = { ...div, hdcp_per: 0 };
  });

  // getByText matches an element's own text nodes, so:
  //  - getByText("215") finds the score span (child spans/images ignored)
  //  - getByText("(200 + 15)") finds the handicap breakdown span

  describe("render score", () => {
    it("renders the game + handicap score for gameNum only", () => {
      render(<ElimGame row={advancedRow()} elimDiv={hdcpDiv} gameNum={2} />);
      expect(screen.getByText("215")).toHaveClass("ms-auto", "ps-2", "text-nowrap");
      // game 1 (205) and game 3 (225) are not shown
      expect(screen.queryByText("205")).not.toBeInTheDocument();
      expect(screen.queryByText("225")).not.toBeInTheDocument();
    });

    it("renders only the score in a scratch division", () => {
      const row = makeRow({ games: [190, 200, 210], alive: [true, true, true], hdcp: 0 });
      render(<ElimGame row={row} elimDiv={scratchDiv} gameNum={2} />);
      expect(screen.getByText("200")).toHaveTextContent(/^200$/, exact);
    });

    it("renders no score, breakdown or status when the game has not been bowled", () => {
      const row = makeRow({ games: [190, null, null], alive: [true, null, null] });
      render(<ElimGame row={row} elimDiv={hdcpDiv} gameNum={2} />);
      expect(screen.queryByText(/\d/)).not.toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(queryNbspSpan()).toHaveClass("pe-2");
    });
  });

  // -------------------------------------------------------------------------
  describe("render handicap breakdown", () => {
    it("renders (game + hdcp) when the div has a handicap", () => {
      render(<ElimGame row={advancedRow()} elimDiv={hdcpDiv} gameNum={2} />);
      const breakdown = screen.getByText("(200 + 15)");
      expect(breakdown).toHaveClass("small");
      expect(breakdown).toHaveTextContent(/^ \(200 \+ 15\)$/, exact);
    });

    it("does not render the breakdown in a scratch division", () => {
      const row = makeRow({ games: [190, 200, 210], alive: [true, true, true], hdcp: 0 });
      render(<ElimGame row={row} elimDiv={scratchDiv} gameNum={2} />);
      expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
    });

    it("renders the breakdown when the score is 0", () => {
      const row = makeRow({ games: [190, 0, null], alive: [true, false, null], hdcp: 0 });
      render(<ElimGame row={row} elimDiv={hdcpDiv} gameNum={2} />);
      expect(screen.getByText("(0 + 0)")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  describe("render figure space padding", () => {
    const renderWithHdcp = (hdcp: number) => {
      const row = makeRow({ games: [190, 200, 210], alive: [true, true, true], hdcp });
      render(<ElimGame row={row} elimDiv={hdcpDiv} gameNum={2} />);
    };

    it("adds a figure space when hdcp is a single digit", () => {
      renderWithHdcp(7);
      expect(screen.getByText("(200 + 7)")).toHaveTextContent(
        new RegExp(`^ \\(200 \\+ 7\\)${FIGURE_SPACE}$`),
        exact
      );
    });

    it("adds a figure space when hdcp is 0", () => {
      renderWithHdcp(0);
      expect(screen.getByText("(200 + 0)")).toHaveTextContent(
        new RegExp(`^ \\(200 \\+ 0\\)${FIGURE_SPACE}$`),
        exact
      );
    });

    it("does not add a figure space when hdcp is 10", () => {
      renderWithHdcp(10);
      expect(screen.getByText("(200 + 10)")).toHaveTextContent(/^ \(200 \+ 10\)$/, exact);
    });

    it("does not add a figure space when hdcp is 2+ digits", () => {
      renderWithHdcp(45);
      expect(screen.getByText("(200 + 45)")).toHaveTextContent(/^ \(200 \+ 45\)$/, exact);
    });
  });

  // -------------------------------------------------------------------------
  describe("render elimination status", () => {
    it("shows the Advanced icon when the player advanced", () => {
      render(<ElimGame row={advancedRow()} elimDiv={hdcpDiv} gameNum={2} />);
      const icon = screen.getByRole("img", { name: "Advanced" });
      expect(icon).toHaveAttribute("src", "/check-circle-fill-success.svg");
      expect(icon).toHaveAttribute("title", "Advanced");
      expect(icon).toHaveAttribute("width", "16");
      expect(icon).toHaveAttribute("height", "16");
      expect(icon).toHaveClass("ms-1", "align-text-bottom", "fw-bold");
      expect(screen.queryByRole("img", { name: "Eliminated" })).not.toBeInTheDocument();
      expect(queryNbspSpan()).not.toBeInTheDocument();
    });

    it("shows the Eliminated icon in the game the player was eliminated", () => {
      const row = makeRow({ games: [190, 200, null], alive: [true, false, null] });
      render(<ElimGame row={row} elimDiv={hdcpDiv} gameNum={2} />);
      const icon = screen.getByRole("img", { name: "Eliminated" });
      expect(icon).toHaveAttribute("src", "/x-circle-fill-danger.svg");
      expect(icon).toHaveAttribute("title", "Eliminated");
      expect(icon).toHaveAttribute("width", "16");
      expect(icon).toHaveAttribute("height", "16");
      expect(icon).toHaveClass("ms-1", "align-text-bottom");
      expect(icon).not.toHaveClass("fw-bold");
      expect(screen.queryByRole("img", { name: "Advanced" })).not.toBeInTheDocument();
      expect(queryNbspSpan()).not.toBeInTheDocument();
    });

    it("shows the score and a blank placeholder while not all scores are entered", () => {
      // game 2 bowled but status not set until every player has a game 2 score
      const row = makeRow({ games: [190, 200, null], alive: [true, null, null] });
      render(<ElimGame row={row} elimDiv={hdcpDiv} gameNum={2} />);
      expect(screen.getByText("215")).toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(queryNbspSpan()).toHaveClass("pe-2");
    });

    it("shows the status inside the score span, after the score", () => {
      render(<ElimGame row={advancedRow()} elimDiv={hdcpDiv} gameNum={2} />);
      const scoreSpan = screen.getByText("215");
      expect(within(scoreSpan).getByRole("img", { name: "Advanced" })).toBeInTheDocument();
      expect(scoreSpan).toHaveTextContent(/^215 \(200 \+ 15\)$/, exact);
    });

    describe("uses the status for gameNum", () => {
      const eliminatedGame1 = () =>
        makeRow({ games: [190, null, null], alive: [false, null, null] });
      const eliminatedGame2 = () =>
        makeRow({ games: [190, 200, null], alive: [true, false, null] });

      it.each([
        [1, "Advanced"],
        [2, "Advanced"],
      ])("not eliminated: game %i shows %s", (gameNum, status) => {
        render(<ElimGame row={advancedRow()} elimDiv={hdcpDiv} gameNum={gameNum} />);
        expect(screen.getByRole("img", { name: status })).toBeInTheDocument();
      });

      it("not eliminated: last game shows the score and no status icon", () => {
        render(<ElimGame row={advancedRow()} elimDiv={hdcpDiv} gameNum={3} />);
        expect(screen.getByText("225")).toBeInTheDocument();
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
        expect(queryNbspSpan()).toHaveClass("pe-2");
      });

      it.each([
        [1, "Advanced"],
        [2, "Eliminated"],
      ])("eliminated in game 2: game %i shows %s", (gameNum, status) => {
        render(<ElimGame row={eliminatedGame2()} elimDiv={hdcpDiv} gameNum={gameNum} />);
        expect(screen.getAllByRole("img")).toHaveLength(1);
        expect(screen.getByRole("img", { name: status })).toBeInTheDocument();
      });

      it("eliminated in game 2: game 3 shows no score and no status", () => {
        render(<ElimGame row={eliminatedGame2()} elimDiv={hdcpDiv} gameNum={3} />);
        expect(screen.queryByText(/\d/)).not.toBeInTheDocument();
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
        expect(queryNbspSpan()).toBeInTheDocument();
      });

      it("eliminated in game 1: game 1 shows Eliminated", () => {
        render(<ElimGame row={eliminatedGame1()} elimDiv={hdcpDiv} gameNum={1} />);
        expect(screen.getByRole("img", { name: "Eliminated" })).toBeInTheDocument();
      });

      it.each([2, 3])(
        "eliminated in game 1: game %i shows no score and no status",
        (gameNum) => {
          render(<ElimGame row={eliminatedGame1()} elimDiv={hdcpDiv} gameNum={gameNum} />);
          expect(screen.queryByText(/\d/)).not.toBeInTheDocument();
          expect(screen.queryByRole("img")).not.toBeInTheDocument();
          expect(queryNbspSpan()).toBeInTheDocument();
        }
      );
    });
  });
});