import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { cloneDeep } from "lodash";
import PotGames from "@/app/results/tmnt/[tmntId]/pots/potGames";
import PlayerNameWithScore from "@/app/results/tmnt/[tmntId]/pots/playerNameWithScore";
import { missingDataError } from "@/app/results/tmnt/[tmntId]/brackets/player/[playerId]/playerBrktData";
import { potGameResults, potResultsRowType } from "@/lib/results/pots/potResults";
import { divType, potPfType, potType, tmntFullType } from "@/lib/types/types";
import { mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// ---------------------------------------------------------------------------
// mocks
// ---------------------------------------------------------------------------

// control the game results so the tests do not depend on scoring logic
jest.mock("@/lib/results/pots/potResults", () => ({
  potGameResults: jest.fn(),
}));

// simple stand in for the player name + score cell (tested on its own)
jest.mock("@/app/results/tmnt/[tmntId]/pots/playerNameWithScore", () => {
  const { createElement } = jest.requireActual<typeof import("react")>("react");
  return {
    __esModule: true,
    default: jest.fn((props: { row: { player_id: string } }) =>
      createElement("span", { "data-testid": "player-name-with-score" }, props.row.player_id)
    ),
  };
});

// render error messages in a known element
jest.mock("@/app/results/tmnt/[tmntId]/brackets/player/[playerId]/playerBrktData", () => {
  const { createElement } = jest.requireActual<typeof import("react")>("react");
  return {
    missingDataError: jest.fn((msg: string) =>
      createElement("div", { "data-testid": "missing-data-error" }, msg)
    ),
  };
});

const mockPotGameResults = potGameResults as jest.MockedFunction<typeof potGameResults>;
const mockPlayerNameWithScore = PlayerNameWithScore as unknown as jest.Mock;
const mockMissingDataError = missingDataError as jest.MockedFunction<typeof missingDataError>;

type gameResultsType = ReturnType<typeof potGameResults>;

// ---------------------------------------------------------------------------
// test data
// ---------------------------------------------------------------------------

describe("PotGames", () => {
  let tmntFullData: tmntFullType;
  let pot: potType;
  let otherPot: potType;
  let potDiv: divType;
  let potPfs: potPfType[];
  let potResultsRows: potResultsRowType[];
  let gameResults: gameResultsType;
  const numGames = 3;

  const makeRow = (
    player_id: string,
    score: number,
    hdcp: number
  ): potResultsRowType =>
    ({
      player_id,
      score,
      hdcp,
      scoreWithHdcp: score + hdcp,
    } as potResultsRowType);

  const makePotPf = (id: string, pot_id: string, amount: number): potPfType =>
    ({ id, pot_id, amount } as potPfType);

  // sets hdcp_per on the div used by the pot
  const setPotDivHdcp = (hdcp_per: number) => {
    tmntFullData.divs = tmntFullData.divs.map((d) =>
      d.id === pot.div_id ? { ...d, hdcp_per } : d
    );
  };

  const renderPotGames = (
    overrides: Partial<React.ComponentProps<typeof PotGames>> = {}
  ) =>
    render(
      <PotGames
        pot_id={pot.id}
        tmntFullData={tmntFullData}
        potResultsRows={potResultsRows}
        potPfs={potPfs}
        numGames={numGames}
        {...overrides}
      />
    );

  beforeEach(() => {
    jest.clearAllMocks();

    tmntFullData = cloneDeep(mockTmntFullData);
    pot = tmntFullData.pots[0];
    otherPot = tmntFullData.pots[1];
    potDiv = tmntFullData.divs.find((d) => d.id === pot.div_id)!;

    const p1 = tmntFullData.players[0].id;
    const p2 = tmntFullData.players[1].id;

    potResultsRows = [makeRow(p1, 200, 15), makeRow(p2, 190, 20)];

    // deliberately out of order; includes a prize fund for another pot
    potPfs = [
      makePotPf("ppf_test_low", pot.id, 250),
      makePotPf("ppf_test_high", pot.id, 1000),
      makePotPf("ppf_test_other", otherPot.id, 777),
      makePotPf("ppf_test_mid", pot.id, 500),
    ];

    gameResults = [
      { gameNum: 1, rows: [makeRow(p1, 220, 15), makeRow(p2, 200, 20)] },
      { gameNum: 2, rows: [makeRow(p2, 210, 20)] },
      { gameNum: 3, rows: [makeRow(p1, 230, 15), makeRow(p2, 180, 20)] },
    ] as gameResultsType;

    mockPotGameResults.mockReturnValue(gameResults);
  });

  // -------------------------------------------------------------------------
  it("has test data the tests rely on", () => {
    expect(potDiv).toBeDefined();
    expect(otherPot.id).not.toBe(pot.id);
    expect(tmntFullData.players.length).toBeGreaterThanOrEqual(2);
  });

  // -------------------------------------------------------------------------
  describe("missing data errors", () => {
    const expectError = (msg: string) => {
      expect(screen.getByTestId("missing-data-error")).toHaveTextContent(msg);
      expect(mockMissingDataError).toHaveBeenCalledWith(msg);
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(mockPotGameResults).not.toHaveBeenCalled();
    };

    it("returns an error when pot_id is missing", () => {
      renderPotGames({ pot_id: "" });
      expectError("No pot id");
    });

    it("returns an error when tmntFullData is missing", () => {
      renderPotGames({ tmntFullData: null as unknown as tmntFullType });
      expectError("No tournament data");
    });

    it("returns an error when potResultsRows is missing", () => {
      renderPotGames({ potResultsRows: null as unknown as potResultsRowType[] });
      expectError("No pot results rows");
    });

    it("returns an error when potPfs is missing", () => {
      renderPotGames({ potPfs: null as unknown as potPfType[] });
      expectError("No pot prize funds");
    });

    it("returns an error when numGames is 0", () => {
      renderPotGames({ numGames: 0 });
      expectError("No number of games");
    });

    it("returns an error when the pot is not found", () => {
      const badId = "pot_00000000000000000000000000000000";
      renderPotGames({ pot_id: badId });
      expectError("Could not find pot. Id: " + badId);
    });

    it("returns an error when the pot's div is not found", () => {
      tmntFullData.divs = tmntFullData.divs.filter((d) => d.id !== pot.div_id);
      renderPotGames();
      expectError("Could not find div. Id: " + pot.div_id);
    });

    it("returns an error when potPfs is empty", () => {
      renderPotGames({ potPfs: [] });
      expectError("No pot prize fund");
    });

    it("returns an error when no prize funds match the pot", () => {
      renderPotGames({
        potPfs: [makePotPf("ppf_test_other", otherPot.id, 777)],
      });
      expectError("No pot prize fund");
    });
  });

  // -------------------------------------------------------------------------
  describe("render layout", () => {
    it("renders the scroll container and the columns row", () => {
      renderPotGames();
      expect(screen.getByTestId("pots-columns-scroll")).toHaveClass("overflow-x-auto");
      expect(screen.getByTestId("pot-columns-row")).toHaveClass(
        "d-flex",
        "flex-nowrap",
        "align-items-start"
      );
    });

    it("renders one payout table plus one table per game", () => {
      renderPotGames();
      expect(screen.getAllByRole("table")).toHaveLength(1 + gameResults.length);
      expect(mockMissingDataError).not.toHaveBeenCalled();
    });

    it("renders only the payout table when there are no game results", () => {
      mockPotGameResults.mockReturnValue([] as gameResultsType);
      renderPotGames();
      expect(screen.getAllByRole("table")).toHaveLength(1);
      expect(screen.getByRole("columnheader", { name: "Game $" })).toBeInTheDocument();
      expect(screen.queryByTestId("pot-game-1")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  describe("render payout table", () => {
    // the payout table is always the first table
    const getPayoutTable = () => screen.getAllByRole("table")[0];

    it("renders the 'Game $' header with an 80px width", () => {
      renderPotGames();
      const header = screen.getByRole("columnheader", { name: "Game $" });
      expect(header).toHaveStyle({ width: "80px" });
      expect(header).toHaveClass("text-center", "align-middle");
    });

    it("renders only the prize funds for this pot, highest to lowest", () => {
      renderPotGames();
      const cells = within(getPayoutTable()).getAllByRole("cell");
      expect(cells).toHaveLength(3);
      expect(cells[0]).toHaveTextContent("$1,000.00");
      expect(cells[1]).toHaveTextContent("$500.00");
      expect(cells[2]).toHaveTextContent("$250.00");
      expect(within(getPayoutTable()).queryByText("$777.00")).not.toBeInTheDocument();
    });

    it("styles the payout amounts as success text", () => {
      renderPotGames();
      const cells = within(getPayoutTable()).getAllByRole("cell");
      cells.forEach((cell) => {
        expect(cell).toHaveClass("text-center", "align-middle", "text-success");
      });
    });

    it("renders a single prize fund", () => {
      renderPotGames({ potPfs: [makePotPf("ppf_test_one", pot.id, 125)] });
      const cells = within(getPayoutTable()).getAllByRole("cell");
      expect(cells).toHaveLength(1);
      expect(cells[0]).toHaveTextContent("$125.00");
    });

    it("does not change the order of the potPfs prop", () => {
      const before = potPfs.map((pf) => pf.id);
      renderPotGames();
      expect(potPfs.map((pf) => pf.id)).toEqual(before);
    });
  });

  // -------------------------------------------------------------------------
  describe("render game tables", () => {
    it("calls potGameResults with the props", () => {
      renderPotGames();
      expect(mockPotGameResults).toHaveBeenCalledTimes(1);
      expect(mockPotGameResults).toHaveBeenCalledWith(
        pot.id,
        tmntFullData,
        potResultsRows,
        numGames
      );
    });

    it("renders a header for each game", () => {
      renderPotGames();
      gameResults.forEach(({ gameNum }) => {
        const table = screen.getByTestId(`pot-game-${gameNum}`);
        expect(
          within(table).getByRole("columnheader", { name: `Game ${gameNum}` })
        ).toBeInTheDocument();
      });
    });

    it("renders one row per result row in each game", () => {
      renderPotGames();
      gameResults.forEach(({ gameNum, rows }) => {
        const table = screen.getByTestId(`pot-game-${gameNum}`);
        const cells = within(table).getAllByRole("cell");
        expect(cells).toHaveLength(rows.length);
        rows.forEach((row, i) => {
          expect(cells[i]).toHaveTextContent(row.player_id);
        });
      });
    });

    it("renders a PlayerNameWithScore for every row", () => {
      renderPotGames();
      const totalRows = gameResults.reduce((sum, g) => sum + g.rows.length, 0);
      expect(screen.getAllByTestId("player-name-with-score")).toHaveLength(totalRows);
      expect(mockPlayerNameWithScore).toHaveBeenCalledTimes(totalRows);
    });

    it("passes row, tmntFullData and the pot's div to PlayerNameWithScore", () => {
      renderPotGames();
      const allRows = gameResults.flatMap((g) => g.rows);
      allRows.forEach((row, i) => {
        const props = mockPlayerNameWithScore.mock.calls[i][0];
        expect(props.row).toBe(row);
        expect(props.tmntFullData).toBe(tmntFullData);
        expect(props.div.id).toBe(pot.div_id);
      });
    });

    it("uses 240px wide game cells when the div has a handicap", () => {
      setPotDivHdcp(0.9);
      renderPotGames();
      const cells = within(screen.getByTestId("pot-game-1")).getAllByRole("cell");
      cells.forEach((cell) => {
        expect(cell).toHaveStyle({ width: "240px" });
        expect(cell).toHaveClass("align-middle");
      });
    });

    it("uses 180px wide game cells when the div is scratch", () => {
      setPotDivHdcp(0);
      renderPotGames();
      const cells = within(screen.getByTestId("pot-game-1")).getAllByRole("cell");
      cells.forEach((cell) => {
        expect(cell).toHaveStyle({ width: "180px" });
      });
    });

    it("renders game tables in the order returned by potGameResults", () => {
      renderPotGames();
      const tables = screen.getAllByRole("table");
      expect(tables[1]).toHaveAttribute("data-testid", "pot-game-1");
      expect(tables[2]).toHaveAttribute("data-testid", "pot-game-2");
      expect(tables[3]).toHaveAttribute("data-testid", "pot-game-3");
    });
  });
});