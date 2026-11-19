import React from "react";
import { getDefaultNormalizer, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
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

const FIGURE_SPACE = " ";

// keep figure spaces when checking text; toHaveTextContent collapses
// whitespace by default and JS treats   as whitespace
const exact = { normalizeWhitespace: false };

// the &nbsp; placeholder is trimmed away by default text matching
const nbspOptions = {
  normalizer: getDefaultNormalizer({ trim: false, collapseWhitespace: false }),
};
const getNbspSpan = () => screen.getByText(" ", nbspOptions);
const queryNbspSpan = () => screen.queryByText(" ", nbspOptions);

// noUncheckedIndexedAccess: fail loudly if the mock data changes
const findDiv = (hasHdcp: boolean): divType => {
  const div = mockTmntFullData.divs.find((d) => d.hdcp_per > 0 === hasHdcp);
  if (!div) throw new Error(`mock data has no ${hasHdcp ? "handicap" : "scratch"} div`);
  return div;
};
const firstPlayer = mockTmntFullData.players[0];
if (!firstPlayer) throw new Error("mock data has no players");

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
 *
 * gameNum is the tournament game number, so an elim that starts at
 * game 4 uses the game 4, 5 and 6 columns (start sets the first one).
 */
type rowValues = {
  games: (number | null)[];
  alive: (boolean | null)[];
  // null when there is no handicap (scratch event)
  hdcp?: number | null;
  start?: number;
};

describe("ElimGame", () => {
  // the mock divs are only read, never changed, so no clone is needed
  const hdcpDiv = findDiv(true);
  const scratchDiv = findDiv(false);

  const makeRow = ({ games, alive, hdcp = 15, start = 1 }: rowValues): elimResults => {
    if (games.length !== alive.length) {
      throw new Error("games and alive must have the same length");
    }
    const row: Record<string, unknown> = {
      position: null,
      player_id: firstPlayer.id,
      full_name: "Test Player",
      hdcp,
      prize: null,
    };
    games.forEach((game, i) => {
      const gameNum = start + i;
      row[tgrGameKey(gameNum)] = game;
      row[tgrHdcpKey(gameNum)] = game == null ? null : game + (hdcp ?? 0);
      row[erAliveKey(gameNum)] = alive[i];
    });
    return row as unknown as elimResults;
  };

  // not eliminated; game 1 = 205, game 2 = 200 + 15 = 215, game 3 = 225
  const advancedRow = () =>
    makeRow({ games: [190, 200, 210], alive: [true, true, true] });

  it("uses a handicap div and a scratch div from the mock data", () => {
    expect(hdcpDiv.hdcp_per).toBeGreaterThan(0);
    expect(scratchDiv.hdcp_per).toBe(0);
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
      // no breakdown and no figure space, even though hdcp < 10
      expect(screen.getByText("200")).toHaveTextContent(/^200$/, exact);
    });

    it("renders only the score in a scratch event where hdcp is null", () => {
      const row = makeRow({ games: [190, 200, 210], alive: [true, true, true], hdcp: null });
      render(<ElimGame row={row} elimDiv={scratchDiv} gameNum={2} />);
      expect(screen.getByText("200")).toHaveTextContent(/^200$/, exact);
      expect(screen.getByRole("img", { name: "Advanced" })).toBeInTheDocument();
    });

    it("renders no score, breakdown or status when the game has not been bowled", () => {
      const row = makeRow({ games: [190, null, null], alive: [true, null, null] });
      render(<ElimGame row={row} elimDiv={hdcpDiv} gameNum={2} />);
      expect(screen.queryByText(/\d/)).not.toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(getNbspSpan()).toHaveClass("pe-2");
    });

    it("uses the tournament game number for an elim that starts after game 1", () => {
      // like mock elims[1]: games 4-6
      const row = makeRow({ games: [190, 200, 210], alive: [true, false, null], start: 4 });
      render(<ElimGame row={row} elimDiv={hdcpDiv} gameNum={5} />);
      expect(screen.getByText("215")).toBeInTheDocument();
      expect(screen.getByText("(200 + 15)")).toBeInTheDocument();
      expect(screen.getByRole("img", { name: "Eliminated" })).toBeInTheDocument();
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

    it("does not render the breakdown when the game has not been bowled", () => {
      const row = makeRow({ games: [190, null, null], alive: [true, null, null] });
      render(<ElimGame row={row} elimDiv={hdcpDiv} gameNum={2} />);
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

    it.each([0, 7, 9])("adds a figure space when hdcp is %i", (hdcp) => {
      renderWithHdcp(hdcp);
      expect(screen.getByText(`(200 + ${String(hdcp)})`)).toHaveTextContent(
        new RegExp(`^ \\(200 \\+ ${String(hdcp)}\\)${FIGURE_SPACE}$`),
        exact
      );
    });

    it.each([10, 45, 100])("does not add a figure space when hdcp is %i", (hdcp) => {
      renderWithHdcp(hdcp);
      expect(screen.getByText(`(200 + ${String(hdcp)})`)).toHaveTextContent(
        new RegExp(`^ \\(200 \\+ ${String(hdcp)}\\)$`),
        exact
      );
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
      expect(getNbspSpan()).toHaveClass("pe-2");
    });

    it("shows the status inside the score span, after the score", () => {
      render(<ElimGame row={advancedRow()} elimDiv={hdcpDiv} gameNum={2} />);
      const scoreSpan = screen.getByText("215");
      expect(within(scoreSpan).getByRole("img", { name: "Advanced" })).toBeInTheDocument();
      expect(scoreSpan).toHaveTextContent(/^215 \(200 \+ 15\)$/, exact);
    });

    it.each([
      [true, "Advanced"],
      [false, "Eliminated"],
    ])("shows the status in a scratch division (alive %s: %s)", (alive, status) => {
      const row = makeRow({ games: [190, 200, null], alive: [true, alive, null], hdcp: 0 });
      render(<ElimGame row={row} elimDiv={scratchDiv} gameNum={2} />);
      const scoreSpan = screen.getByText("200");
      expect(within(scoreSpan).getByRole("img", { name: status })).toBeInTheDocument();
      expect(scoreSpan).toHaveTextContent(/^200$/, exact);
    });

    describe("uses the status for gameNum", () => {
      const eliminatedGame1 = () =>
        makeRow({ games: [190, null, null], alive: [false, null, null] });
      const eliminatedGame2 = () =>
        makeRow({ games: [190, 200, null], alive: [true, false, null] });

      it.each([1, 2, 3])("not eliminated: game %i shows Advanced", (gameNum) => {
        render(<ElimGame row={advancedRow()} elimDiv={hdcpDiv} gameNum={gameNum} />);
        expect(screen.getAllByRole("img")).toHaveLength(1);
        expect(screen.getByRole("img", { name: "Advanced" })).toBeInTheDocument();
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
        expect(getNbspSpan()).toBeInTheDocument();
      });

      it("eliminated in game 1: game 1 shows Eliminated", () => {
        render(<ElimGame row={eliminatedGame1()} elimDiv={hdcpDiv} gameNum={1} />);
        expect(screen.getAllByRole("img")).toHaveLength(1);
        expect(screen.getByRole("img", { name: "Eliminated" })).toBeInTheDocument();
      });

      it.each([2, 3])(
        "eliminated in game 1: game %i shows no score and no status",
        (gameNum) => {
          render(<ElimGame row={eliminatedGame1()} elimDiv={hdcpDiv} gameNum={gameNum} />);
          expect(screen.queryByText(/\d/)).not.toBeInTheDocument();
          expect(screen.queryByRole("img")).not.toBeInTheDocument();
          expect(getNbspSpan()).toBeInTheDocument();
        }
      );
    });
  });
});
