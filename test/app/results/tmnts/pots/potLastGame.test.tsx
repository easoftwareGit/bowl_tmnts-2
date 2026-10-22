import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { cloneDeep } from "lodash";
import PotLastGame from "@/app/results/tmnt/[tmntId]/pots/potLastGame";
import PlayerNameWithScore from "@/app/results/tmnt/[tmntId]/pots/playerNameWithScore";
import { missingDataError } from "@/app/results/tmnt/[tmntId]/brackets/player/[playerId]/playerBrktData";
import { potLastGameResults, potResultsRowType } from "@/lib/results/pots/potResults";
import { divType, potPfType, potType, tmntFullType } from "@/lib/types/types";
import { mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// ---------------------------------------------------------------------------
// mocks
// ---------------------------------------------------------------------------

// control the last game results so the tests do not depend on scoring logic
jest.mock("@/lib/results/pots/potResults", () => ({
  potLastGameResults: jest.fn(),
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

const mockPotLastGameResults = potLastGameResults as jest.MockedFunction<
  typeof potLastGameResults
>;
const mockPlayerNameWithScore = PlayerNameWithScore as unknown as jest.Mock;
const mockMissingDataError = missingDataError as jest.MockedFunction<typeof missingDataError>;

type lastGameResultsType = ReturnType<typeof potLastGameResults>;

// ---------------------------------------------------------------------------
// test data
// ---------------------------------------------------------------------------

describe("PotLastGame", () => {
  let tmntFullData: tmntFullType;
  let pot: potType;
  let otherPot: potType;
  let potDiv: divType;
  let potPfs: potPfType[];
  let potResultsRows: potResultsRowType[];
  let lastGameResults: lastGameResultsType;
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

  // the payout table is always the first table
  const getPayoutTable = () => screen.getAllByRole("table")[0];

  const renderPotLastGame = (
    overrides: Partial<React.ComponentProps<typeof PotLastGame>> = {}
  ) =>
    render(
      <PotLastGame
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

    lastGameResults = [
      makeRow(p1, 230, 15),
      makeRow(p2, 180, 20),
    ] as lastGameResultsType;

    mockPotLastGameResults.mockReturnValue(lastGameResults);
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
      expect(mockPotLastGameResults).not.toHaveBeenCalled();
    };

    it("returns an error when pot_id is missing", () => {
      renderPotLastGame({ pot_id: "" });
      expectError("No pot id");
    });

    it("returns an error when tmntFullData is missing", () => {
      renderPotLastGame({ tmntFullData: null as unknown as tmntFullType });
      expectError("No tournament data");
    });

    it("returns an error when potResultsRows is missing", () => {
      renderPotLastGame({ potResultsRows: null as unknown as potResultsRowType[] });
      expectError("No pot results rows");
    });

    it("returns an error when potPfs is missing", () => {
      renderPotLastGame({ potPfs: null as unknown as potPfType[] });
      expectError("No pot prize funds");
    });

    it("returns an error when numGames is 0", () => {
      renderPotLastGame({ numGames: 0 });
      expectError("No number of games");
    });

    it("returns an error when the pot is not found", () => {
      const badId = "pot_00000000000000000000000000000000";
      renderPotLastGame({ pot_id: badId });
      expectError("Could not find pot. Id: " + badId);
    });

    it("returns an error when the pot's div is not found", () => {
      tmntFullData.divs = tmntFullData.divs.filter((d) => d.id !== pot.div_id);
      renderPotLastGame();
      expectError("Could not find div. Id: " + pot.div_id);
    });

    it("returns an error when potPfs is empty", () => {
      renderPotLastGame({ potPfs: [] });
      expectError("No pot prize fund");
    });

    it("returns an error when no prize funds match the pot", () => {
      renderPotLastGame({
        potPfs: [makePotPf("ppf_test_other", otherPot.id, 777)],
      });
      expectError("No pot prize fund");
    });
  });

  // -------------------------------------------------------------------------
  describe("render layout", () => {
    it("renders the scroll container and the columns row", () => {
      renderPotLastGame();
      expect(screen.getByTestId("pots-columns-scroll")).toHaveClass("overflow-x-auto");
      expect(screen.getByTestId("pot-columns-row")).toHaveClass(
        "d-flex",
        "flex-nowrap",
        "align-items-start"
      );
    });

    it("renders the payout table and the last game table", () => {
      renderPotLastGame();
      const tables = screen.getAllByRole("table");
      expect(tables).toHaveLength(2);
      expect(tables[1]).toHaveAttribute("data-testid", "pot-last-game");
      expect(mockMissingDataError).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  describe("render payout table", () => {
    it("renders the 'Game $' header with an 80px width", () => {
      renderPotLastGame();
      const header = screen.getByRole("columnheader", { name: "Game $" });
      expect(header).toHaveStyle({ width: "80px" });
      expect(header).toHaveClass("text-center", "align-middle");
    });

    it("renders only the prize funds for this pot, highest to lowest", () => {
      renderPotLastGame();
      const cells = within(getPayoutTable()).getAllByRole("cell");
      expect(cells).toHaveLength(3);
      expect(cells[0]).toHaveTextContent("$1,000.00");
      expect(cells[1]).toHaveTextContent("$500.00");
      expect(cells[2]).toHaveTextContent("$250.00");
      expect(within(getPayoutTable()).queryByText("$777.00")).not.toBeInTheDocument();
    });

    it("styles the payout amounts as success text", () => {
      renderPotLastGame();
      const cells = within(getPayoutTable()).getAllByRole("cell");
      cells.forEach((cell) => {
        expect(cell).toHaveClass("text-center", "align-middle", "text-success");
      });
    });

    it("renders a single prize fund", () => {
      renderPotLastGame({ potPfs: [makePotPf("ppf_test_one", pot.id, 125)] });
      const cells = within(getPayoutTable()).getAllByRole("cell");
      expect(cells).toHaveLength(1);
      expect(cells[0]).toHaveTextContent("$125.00");
    });

    it("does not change the order of the potPfs prop", () => {
      const before = potPfs.map((pf) => pf.id);
      renderPotLastGame();
      expect(potPfs.map((pf) => pf.id)).toEqual(before);
    });
  });

  // -------------------------------------------------------------------------
  describe("render last game table", () => {
    it("calls potLastGameResults with the props", () => {
      renderPotLastGame();
      expect(mockPotLastGameResults).toHaveBeenCalledTimes(1);
      expect(mockPotLastGameResults).toHaveBeenCalledWith(
        pot.id,
        tmntFullData,
        potResultsRows,
        numGames
      );
    });

    it("renders the header for the last game number", () => {
      renderPotLastGame();
      const table = screen.getByTestId("pot-last-game");
      expect(
        within(table).getByRole("columnheader", { name: `Game ${numGames}` })
      ).toBeInTheDocument();
    });

    it("uses numGames in the header", () => {
      renderPotLastGame({ numGames: 6 });
      const table = screen.getByTestId("pot-last-game");
      expect(within(table).getByRole("columnheader", { name: "Game 6" })).toBeInTheDocument();
      expect(mockPotLastGameResults).toHaveBeenCalledWith(
        pot.id,
        tmntFullData,
        potResultsRows,
        6
      );
    });

    it("renders one row per last game result, in order", () => {
      renderPotLastGame();
      const cells = within(screen.getByTestId("pot-last-game")).getAllByRole("cell");
      expect(cells).toHaveLength(lastGameResults.length);
      lastGameResults.forEach((row, i) => {
        expect(cells[i]).toHaveTextContent(row.player_id);
      });
    });

    it("renders a header and no rows when there are no last game results", () => {
      mockPotLastGameResults.mockReturnValue([] as lastGameResultsType);
      renderPotLastGame();
      const table = screen.getByTestId("pot-last-game");
      expect(
        within(table).getByRole("columnheader", { name: `Game ${numGames}` })
      ).toBeInTheDocument();
      expect(within(table).queryAllByRole("cell")).toHaveLength(0);
      expect(mockPlayerNameWithScore).not.toHaveBeenCalled();
    });

    it("renders a PlayerNameWithScore for every row", () => {
      renderPotLastGame();
      expect(screen.getAllByTestId("player-name-with-score")).toHaveLength(
        lastGameResults.length
      );
      expect(mockPlayerNameWithScore).toHaveBeenCalledTimes(lastGameResults.length);
    });

    it("passes row, tmntFullData and the pot's div to PlayerNameWithScore", () => {
      renderPotLastGame();
      lastGameResults.forEach((row, i) => {
        const props = mockPlayerNameWithScore.mock.calls[i][0];
        expect(props.row).toBe(row);
        expect(props.tmntFullData).toBe(tmntFullData);
        expect(props.div.id).toBe(pot.div_id);
      });
    });

    it("uses 240px wide cells when the div has a handicap", () => {
      setPotDivHdcp(0.9);
      renderPotLastGame();
      const cells = within(screen.getByTestId("pot-last-game")).getAllByRole("cell");
      cells.forEach((cell) => {
        expect(cell).toHaveStyle({ width: "240px" });
        expect(cell).toHaveClass("align-middle");
      });
    });

    it("uses 180px wide cells when the div is scratch", () => {
      setPotDivHdcp(0);
      renderPotLastGame();
      const cells = within(screen.getByTestId("pot-last-game")).getAllByRole("cell");
      cells.forEach((cell) => {
        expect(cell).toHaveStyle({ width: "180px" });
      });
    });
  });
});