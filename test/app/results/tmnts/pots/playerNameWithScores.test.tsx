// test/app/results/tmnts/pots/playerNameWithScores.test.tsx
// tests for src/app/results/tmnt/[tmntId]/pots/playerNameWithScore.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { cloneDeep } from "lodash";
import PlayerNameWithScore from "@/app/results/tmnt/[tmntId]/pots/playerNameWithScore";
import { getPlayerName } from "@/lib/getName";
import { potResultsRowType } from "@/lib/results/pots/potResults";
import { divType, playerType, tmntFullType } from "@/lib/types/types";
import { FIGURE_SPACE } from "@/lib/validation/constants";
import { mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// keep figure spaces when checking text; toHaveTextContent collapses
// whitespace by default and JS treats \u2007 as whitespace
const exact = { normalizeWhitespace: false };

// index into an array without "possibly undefined" (noUncheckedIndexedAccess)
const getAt = <T,>(arr: T[], index: number, what: string): T => {
  const item = arr[index];
  if (item === undefined) {
    throw new Error(`mock data has no ${what} at index ${String(index)}`);
  }
  return item;
};

describe("PlayerNameWithScore", () => {
  let tmntFullData: tmntFullType;
  let scratchDiv: divType; // mock divs[0]: "Scratch", hdcp_per 0
  let hdcpDiv: divType; // mock divs[1]: "HDCP", hdcp_per 0.9
  let player: playerType;
  let playerName: string;

  // a row with game scores entered: 200 + 15 = 215
  const makeRow = (overrides: Partial<potResultsRowType> = {}): potResultsRowType => ({
    player_id: player.id,
    div_id: hdcpDiv.id,
    gameNum: 1,
    score: 200,
    hdcp: 15,
    scoreWithHdcp: 215,
    prizeMoney: null,
    ...overrides,
  });

  // a row for a game whose scores have not been entered yet
  const notEnteredRow = (): potResultsRowType =>
    makeRow({ score: null, hdcp: null, scoreWithHdcp: null });

  const renderRow = (row: potResultsRowType, div: divType) =>
    render(<PlayerNameWithScore row={row} tmntFullData={tmntFullData} div={div} />);

  beforeEach(() => {
    tmntFullData = cloneDeep(mockTmntFullData);
    scratchDiv = getAt(tmntFullData.divs, 0, "div");
    hdcpDiv = getAt(tmntFullData.divs, 1, "div");
    player = getAt(tmntFullData.players, 0, "player");
    playerName = getPlayerName(tmntFullData.players, player.id);
  });

  // getByText matches an element's own text nodes, so:
  //  - getByText("215") finds the score span (its child span is ignored)
  //  - getByText("(200 + 15)") finds the breakdown span

  describe("mock data", () => {
    it("has a scratch div and a handicap div", () => {
      expect(scratchDiv.div_name).toBe("Scratch");
      expect(scratchDiv.hdcp_per).toBe(0);
      expect(hdcpDiv.div_name).toBe("HDCP");
      expect(hdcpDiv.hdcp_per).toBe(0.9);
    });
  });

  describe("render player name", () => {
    it("renders the player name from tmntFullData.players", () => {
      renderRow(makeRow(), hdcpDiv);
      expect(playerName).not.toBe("");
      expect(screen.getByText(playerName)).toBeInTheDocument();
    });

    it("renders the player name in a scratch div", () => {
      renderRow(makeRow({ hdcp: 0, scoreWithHdcp: 200 }), scratchDiv);
      expect(screen.getByText(playerName)).toBeInTheDocument();
    });

    it("renders the name for a different player", () => {
      const other = getAt(tmntFullData.players, 1, "player");
      const otherName = getPlayerName(tmntFullData.players, other.id);
      expect(otherName).not.toBe(playerName);
      renderRow(makeRow({ player_id: other.id }), hdcpDiv);
      expect(screen.getByText(otherName)).toBeInTheDocument();
      expect(screen.queryByText(playerName)).not.toBeInTheDocument();
    });

    it("still renders the score when the player id is not found", () => {
      renderRow(makeRow({ player_id: "ply_00000000000000000000000000000000" }), hdcpDiv);
      expect(screen.queryByText(playerName)).not.toBeInTheDocument();
      expect(screen.getByText("215")).toBeInTheDocument();
    });
  });

  describe("render a game with scores not entered", () => {
    it("renders the name and no score in a handicap div", () => {
      renderRow(notEnteredRow(), hdcpDiv);
      expect(screen.getByText(playerName)).toBeInTheDocument();
      expect(screen.queryByText(/\d/)).not.toBeInTheDocument();
      expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
    });

    it("renders the name and no score in a scratch div", () => {
      renderRow({ ...notEnteredRow(), div_id: scratchDiv.id }, scratchDiv);
      expect(screen.getByText(playerName)).toBeInTheDocument();
      expect(screen.queryByText(/\d/)).not.toBeInTheDocument();
    });

    it("does not add a figure space when scores are not entered", () => {
      renderRow(notEnteredRow(), hdcpDiv);
      expect(screen.getByText(playerName)).not.toHaveTextContent(FIGURE_SPACE, exact);
      expect(screen.queryByText(new RegExp(FIGURE_SPACE))).not.toBeInTheDocument();
    });
  });

  describe("render score with handicap", () => {
    it("renders scoreWithHdcp in a span that does not wrap", () => {
      renderRow(makeRow(), hdcpDiv);
      const scoreSpan = screen.getByText("215");
      expect(scoreSpan).toHaveClass("ms-auto", "ps-2", "text-nowrap");
      expect(scoreSpan).toHaveTextContent(/^215 \(200 \+ 15\)$/, exact);
    });

    it("renders scoreWithHdcp in a scratch div", () => {
      renderRow(makeRow({ hdcp: 0, scoreWithHdcp: 200 }), scratchDiv);
      const scoreSpan = screen.getByText("200");
      expect(scoreSpan).toHaveClass("ms-auto", "ps-2", "text-nowrap");
      expect(scoreSpan).toHaveTextContent(/^200$/, exact);
    });

    it("renders a scoreWithHdcp of 0", () => {
      renderRow(makeRow({ score: 0, hdcp: 0, scoreWithHdcp: 0 }), scratchDiv);
      expect(screen.getByText("0")).toHaveTextContent(/^0$/, exact);
    });
  });

  describe("render handicap breakdown", () => {
    it("renders (score + hdcp) when div has handicap and score is not null", () => {
      renderRow(makeRow(), hdcpDiv);
      const breakdown = screen.getByText("(200 + 15)");
      expect(breakdown).toHaveClass("small");
      expect(breakdown).toHaveTextContent(/^ \(200 \+ 15\)$/, exact);
    });

    it("renders the breakdown for any hdcp_per above 0", () => {
      renderRow(makeRow(), { ...hdcpDiv, hdcp_per: 0.01 });
      expect(screen.getByText("(200 + 15)")).toBeInTheDocument();
    });

    it("renders the breakdown for a 100% handicap div", () => {
      renderRow(makeRow(), { ...hdcpDiv, hdcp_per: 1 });
      expect(screen.getByText("(200 + 15)")).toBeInTheDocument();
    });

    it("does not render the breakdown in a scratch div, even when the row has a hdcp", () => {
      renderRow(makeRow(), scratchDiv);
      expect(screen.queryByText("(200 + 15)")).not.toBeInTheDocument();
      expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
      expect(screen.getByText("215")).toHaveTextContent(/^215$/, exact);
    });

    it("does not render the breakdown when hdcp is null", () => {
      renderRow(makeRow({ hdcp: null }), hdcpDiv);
      expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
      expect(screen.getByText("215")).toHaveTextContent(/^215$/, exact);
    });

    it("does not render the breakdown when score is null", () => {
      renderRow(makeRow({ score: null }), hdcpDiv);
      expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
      expect(screen.getByText("215")).toHaveTextContent(/^215$/, exact);
    });

    it("renders the breakdown when score is 0", () => {
      renderRow(makeRow({ score: 0, hdcp: 25, scoreWithHdcp: 25 }), hdcpDiv);
      // 1 digit score is padded to 3 digits with 2 figure spaces
      expect(screen.getByText("( 0 + 25)")).toHaveTextContent(
        new RegExp(`^ \\(${FIGURE_SPACE}{2}0 \\+ 25\\)$`),
        exact
      );
    });
  });

  // a figure space is the width of one digit. the score is padded at the
  // start to 3 digits, and a 1 digit hdcp gets one figure space after ")",
  // so every breakdown is the same width and lines up in the column.
  // the default text matcher turns figure spaces into normal spaces and
  // trims the ends, so getByText("( 99 + 15)") finds "(\u200799 + 15)".
  describe("render score padding", () => {
    it("does not pad a 3 digit score with a 2 digit hdcp: (200 + 15)", () => {
      renderRow(makeRow({ score: 200, hdcp: 15, scoreWithHdcp: 215 }), hdcpDiv);
      expect(screen.getByText("(200 + 15)")).toHaveTextContent(/^ \(200 \+ 15\)$/, exact);
    });

    it("pads only the hdcp for a 3 digit score with a 1 digit hdcp: (210 + 9)", () => {
      renderRow(makeRow({ score: 210, hdcp: 9, scoreWithHdcp: 219 }), hdcpDiv);
      expect(screen.getByText("(210 + 9)")).toHaveTextContent(
        new RegExp(`^ \\(210 \\+ 9\\)${FIGURE_SPACE}$`),
        exact
      );
    });

    it("pads a 2 digit score with 1 figure space: (99 + 15)", () => {
      renderRow(makeRow({ score: 99, hdcp: 15, scoreWithHdcp: 114 }), hdcpDiv);
      expect(screen.getByText("( 99 + 15)")).toHaveTextContent(
        new RegExp(`^ \\(${FIGURE_SPACE}99 \\+ 15\\)$`),
        exact
      );
    });

    it("pads both a 2 digit score and a 1 digit hdcp: (95 + 7)", () => {
      renderRow(makeRow({ score: 95, hdcp: 7, scoreWithHdcp: 102 }), hdcpDiv);
      expect(screen.getByText("( 95 + 7)")).toHaveTextContent(
        new RegExp(`^ \\(${FIGURE_SPACE}95 \\+ 7\\)${FIGURE_SPACE}$`),
        exact
      );
    });

    it("pads a 1 digit score with 2 figure spaces: (0 + 25)", () => {
      renderRow(makeRow({ score: 0, hdcp: 25, scoreWithHdcp: 25 }), hdcpDiv);
      expect(screen.getByText("( 0 + 25)")).toHaveTextContent(
        new RegExp(`^ \\(${FIGURE_SPACE}{2}0 \\+ 25\\)$`),
        exact
      );
    });

    it("pads both a 1 digit score and a 1 digit hdcp: (0 + 9)", () => {
      renderRow(makeRow({ score: 0, hdcp: 9, scoreWithHdcp: 9 }), hdcpDiv);
      expect(screen.getByText("( 0 + 9)")).toHaveTextContent(
        new RegExp(`^ \\(${FIGURE_SPACE}{2}0 \\+ 9\\)${FIGURE_SPACE}$`),
        exact
      );
    });

    it("gives every breakdown the same number of characters", () => {
      const rows: potResultsRowType[] = [
        makeRow({ player_id: "ply_a", score: 200, hdcp: 15, scoreWithHdcp: 215 }),
        makeRow({ player_id: "ply_b", score: 210, hdcp: 9, scoreWithHdcp: 219 }),
        makeRow({ player_id: "ply_c", score: 99, hdcp: 15, scoreWithHdcp: 114 }),
        makeRow({ player_id: "ply_d", score: 95, hdcp: 7, scoreWithHdcp: 102 }),
        makeRow({ player_id: "ply_e", score: 0, hdcp: 25, scoreWithHdcp: 25 }),
        makeRow({ player_id: "ply_f", score: 0, hdcp: 9, scoreWithHdcp: 9 }),
      ];
      render(
        <>
          {rows.map((row) => (
            <PlayerNameWithScore
              key={row.player_id}
              row={row}
              tmntFullData={tmntFullData}
              div={hdcpDiv}
            />
          ))}
        </>
      );
      // " (" + 3 digits + " + " + 2 digits + ")" = 11 characters
      const breakdowns = screen.getAllByText(/\+/);
      expect(breakdowns).toHaveLength(rows.length);
      breakdowns.forEach((breakdown) => {
        expect(breakdown).toHaveTextContent(/^.{11}$/u, exact);
      });
    });
  });

  describe("render hdcp figure space padding", () => {
    it("adds a figure space when hdcp is a single digit", () => {
      renderRow(makeRow({ hdcp: 7, scoreWithHdcp: 207 }), hdcpDiv);
      expect(screen.getByText("(200 + 7)")).toHaveTextContent(
        new RegExp(`^ \\(200 \\+ 7\\)${FIGURE_SPACE}$`),
        exact
      );
    });

    it("adds a figure space when hdcp is 9", () => {
      renderRow(makeRow({ hdcp: 9, scoreWithHdcp: 209 }), hdcpDiv);
      expect(screen.getByText("(200 + 9)")).toHaveTextContent(
        new RegExp(`^ \\(200 \\+ 9\\)${FIGURE_SPACE}$`),
        exact
      );
    });

    it("adds a figure space when hdcp is 0", () => {
      renderRow(makeRow({ hdcp: 0, scoreWithHdcp: 200 }), hdcpDiv);
      expect(screen.getByText("(200 + 0)")).toHaveTextContent(
        new RegExp(`^ \\(200 \\+ 0\\)${FIGURE_SPACE}$`),
        exact
      );
    });

    it("does not add a figure space when hdcp is 10", () => {
      renderRow(makeRow({ hdcp: 10, scoreWithHdcp: 210 }), hdcpDiv);
      expect(screen.getByText("(200 + 10)")).toHaveTextContent(/^ \(200 \+ 10\)$/, exact);
    });

    it("does not add a figure space when hdcp is 2+ digits", () => {
      renderRow(makeRow({ score: 180, hdcp: 45, scoreWithHdcp: 225 }), hdcpDiv);
      expect(screen.getByText("(180 + 45)")).toHaveTextContent(/^ \(180 \+ 45\)$/, exact);
    });

    it("does not add a figure space in a scratch div, even with a single digit hdcp", () => {
      renderRow(makeRow({ hdcp: 5, scoreWithHdcp: 205 }), scratchDiv);
      expect(screen.getByText("205")).toHaveTextContent(/^205$/, exact);
    });

    it("does not add a figure space when hdcp is null", () => {
      renderRow(makeRow({ hdcp: null }), hdcpDiv);
      expect(screen.getByText("215")).toHaveTextContent(/^215$/, exact);
    });

    it("does not add a figure space when score is null, even with a single digit hdcp", () => {
      renderRow(makeRow({ score: null, hdcp: 5, scoreWithHdcp: 205 }), hdcpDiv);
      expect(screen.getByText("205")).toHaveTextContent(/^205$/, exact);
    });
  });
});


// // test/app/results/tmnts/pots/playerNameWithScores.test.tsx
// // tests for src/app/results/tmnt/[tmntId]/pots/playerNameWithScore.tsx
// import React from "react";
// import { render, screen } from "@testing-library/react";
// import "@testing-library/jest-dom";
// import { cloneDeep } from "lodash";
// import PlayerNameWithScore from "@/app/results/tmnt/[tmntId]/pots/playerNameWithScore";
// import { getPlayerName } from "@/lib/getName";
// import { potResultsRowType } from "@/lib/results/pots/potResults";
// import { divType, tmntFullType } from "@/lib/types/types";
// import { mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
// import { FIGURE_SPACE } from "@/lib/validation/constants";

// // keep figure spaces when checking text; toHaveTextContent collapses
// // whitespace by default and JS treats \u2007 (constant FIGURE_SPACE) as whitespace
// const exact = { normalizeWhitespace: false };

// describe("PlayerNameWithScore", () => {
//   let tmntFullData: tmntFullType;
//   let hdcpDiv: divType;
//   let scratchDiv: divType;
//   let playerId: string;
//   let playerName: string;

//   // builds a row with only the fields the component reads
//   const makeRow = (overrides: Partial<potResultsRowType> = {}): potResultsRowType =>
//     ({
//       player_id: playerId,
//       score: 200,
//       hdcp: 15,
//       scoreWithHdcp: 215,
//       ...overrides,
//     } as potResultsRowType);

//   beforeEach(() => {
//     tmntFullData = cloneDeep(mockTmntFullData);
//     playerId = tmntFullData.players[0].id;
//     playerName = getPlayerName(tmntFullData.players, playerId);
//     hdcpDiv = { ...cloneDeep(tmntFullData.divs[0]), hdcp_per: 0.9 };
//     scratchDiv = { ...cloneDeep(tmntFullData.divs[0]), hdcp_per: 0 };
//   });

//   // getByText matches an element's own text nodes, so:
//   //  - getByText("215") finds the score span (its child span is ignored)
//   //  - getByText("(200 + 15)") finds the breakdown span

//   describe("render player name", () => {
//     it("renders the player name from tmntFullData.players", () => {
//       render(
//         <PlayerNameWithScore row={makeRow()} tmntFullData={tmntFullData} div={hdcpDiv} />
//       );
//       expect(playerName).not.toBe("");
//       expect(screen.getByText(playerName)).toBeInTheDocument();
//     });

//     it("renders the name for a different player", () => {
//       const otherId = tmntFullData.players[1].id;
//       const otherName = getPlayerName(tmntFullData.players, otherId);
//       render(
//         <PlayerNameWithScore
//           row={makeRow({ player_id: otherId })}
//           tmntFullData={tmntFullData}
//           div={hdcpDiv}
//         />
//       );
//       expect(screen.getByText(otherName)).toBeInTheDocument();
//       expect(screen.queryByText(playerName)).not.toBeInTheDocument();
//     });

//     it("does not crash when the player id is not found", () => {
//       render(
//         <PlayerNameWithScore
//           row={makeRow({ player_id: "ply_00000000000000000000000000000000" })}
//           tmntFullData={tmntFullData}
//           div={hdcpDiv}
//         />
//       );
//       expect(screen.getByText("215")).toBeInTheDocument();
//     });
//   });

//   describe("render score with handicap", () => {
//     it("renders scoreWithHdcp in a span that does not wrap", () => {
//       render(
//         <PlayerNameWithScore row={makeRow()} tmntFullData={tmntFullData} div={hdcpDiv} />
//       );
//       const scoreSpan = screen.getByText("215");
//       expect(scoreSpan).toHaveClass("ms-auto", "ps-2", "text-nowrap");
//       expect(scoreSpan).toHaveTextContent(/^215 \(200 \+ 15\)$/, exact);
//     });

//     it("renders only scoreWithHdcp in a scratch division", () => {
//       const row = makeRow({ score: 200, hdcp: 0, scoreWithHdcp: 200 });
//       render(
//         <PlayerNameWithScore row={row} tmntFullData={tmntFullData} div={scratchDiv} />
//       );
//       expect(screen.getByText("200")).toHaveTextContent(/^200$/, exact);
//     });
//   });

//   describe("render handicap breakdown", () => {
//     it("renders (score + hdcp) when div has handicap and score is not null", () => {
//       render(
//         <PlayerNameWithScore row={makeRow()} tmntFullData={tmntFullData} div={hdcpDiv} />
//       );
//       const breakdown = screen.getByText("(200 + 15)");
//       expect(breakdown).toHaveClass("small");
//       expect(breakdown).toHaveTextContent(/^ \(200 \+ 15\)$/, exact);
//     });

//     it("does not render the breakdown when div hdcp_per is 0", () => {
//       render(
//         <PlayerNameWithScore row={makeRow()} tmntFullData={tmntFullData} div={scratchDiv} />
//       );
//       expect(screen.queryByText("(200 + 15)")).not.toBeInTheDocument();
//       expect(screen.getByText("215")).toHaveTextContent(/^215$/, exact);
//     });

//     it("does not render the breakdown when score is null", () => {
//       const row = makeRow({ score: null } as unknown as Partial<potResultsRowType>);
//       render(
//         <PlayerNameWithScore row={row} tmntFullData={tmntFullData} div={hdcpDiv} />
//       );
//       expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
//       expect(screen.getByText("215")).toHaveTextContent(/^215$/, exact);
//     });

//     it("does not render the breakdown when score is undefined", () => {
//       const row = makeRow({ score: undefined } as unknown as Partial<potResultsRowType>);
//       render(
//         <PlayerNameWithScore row={row} tmntFullData={tmntFullData} div={hdcpDiv} />
//       );
//       expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
//     });

//     it("renders the breakdown when score is 0", () => {
//       const row = makeRow({ score: 0, hdcp: 25, scoreWithHdcp: 25 });
//       render(
//         <PlayerNameWithScore row={row} tmntFullData={tmntFullData} div={hdcpDiv} />
//       );
//       expect(screen.getByText("(0 + 25)")).toHaveTextContent(/^ \(0 \+ 25\)$/, exact);
//     });
//   });

//   describe("render figure space padding", () => {
//     it("adds a figure space when hdcp is a single digit", () => {
//       const row = makeRow({ score: 200, hdcp: 7, scoreWithHdcp: 207 });
//       render(
//         <PlayerNameWithScore row={row} tmntFullData={tmntFullData} div={hdcpDiv} />
//       );
//       expect(screen.getByText("(200 + 7)")).toHaveTextContent(
//         new RegExp(`^ \\(200 \\+ 7\\)${FIGURE_SPACE}$`),
//         exact
//       );
//     });

//     it("adds a figure space when hdcp is 0", () => {
//       const row = makeRow({ score: 200, hdcp: 0, scoreWithHdcp: 200 });
//       render(
//         <PlayerNameWithScore row={row} tmntFullData={tmntFullData} div={hdcpDiv} />
//       );
//       expect(screen.getByText("(200 + 0)")).toHaveTextContent(
//         new RegExp(`^ \\(200 \\+ 0\\)${FIGURE_SPACE}$`),
//         exact
//       );
//     });

//     it("does not add a figure space when hdcp is 10", () => {
//       const row = makeRow({ score: 200, hdcp: 10, scoreWithHdcp: 210 });
//       render(
//         <PlayerNameWithScore row={row} tmntFullData={tmntFullData} div={hdcpDiv} />
//       );
//       expect(screen.getByText("(200 + 10)")).toHaveTextContent(/^ \(200 \+ 10\)$/, exact);
//     });

//     it("does not add a figure space when hdcp is 2+ digits", () => {
//       const row = makeRow({ score: 180, hdcp: 45, scoreWithHdcp: 225 });
//       render(
//         <PlayerNameWithScore row={row} tmntFullData={tmntFullData} div={hdcpDiv} />
//       );
//       expect(screen.getByText("(180 + 45)")).toHaveTextContent(/^ \(180 \+ 45\)$/, exact);
//     });

//     it("does not add a figure space when hdcp is null", () => {
//       const row = makeRow({ hdcp: null } as unknown as Partial<potResultsRowType>);
//       render(
//         <PlayerNameWithScore row={row} tmntFullData={tmntFullData} div={hdcpDiv} />
//       );
//       expect(screen.getByText("(200 + )")).toHaveTextContent(/^ \(200 \+ \)$/, exact);
//     });

//     it("does not render a figure space in a scratch div, even with a single digit hdcp", () => {
//       const row = makeRow({ score: 200, hdcp: 5, scoreWithHdcp: 205 });
//       render(
//         <PlayerNameWithScore row={row} tmntFullData={tmntFullData} div={scratchDiv} />
//       );
//       expect(screen.getByText("205")).toHaveTextContent(/^205$/, exact);
//     });
//   });
// });

