import {
  calcNumGames,
  createResultsColumns2,
  nonGameColCount,
  tmntResultsData,
} from "@/app/results/tmnt/[tmntId]/createResultsColumns";

describe("createResultsColumns2", () => {
  describe("tmntResultsData", () => {
    it("contains the expected default values", () => {
      expect(tmntResultsData).toEqual({
        id: "",
        player_id: "",
        full_name: "",
        average: 0,
        hdcp: 0,
        total: 0,
        total_hdcp: 0,
        total_plus_total_hdcp: 0,
      });
    });
  });

  describe("nonGameColCount", () => {
    it("has the expected value", () => {
      expect(nonGameColCount).toBe(11);
    });
  });

  describe("calcNumGames", () => {
    it("returns 0 when tmntResults is null", () => {
      expect(calcNumGames(null as never)).toBe(0);
    });

    it("returns 0 when tmntResults is undefined", () => {
      expect(calcNumGames(undefined as never)).toBe(0);
    });

    it("returns 0 when tmntResults is empty", () => {
      expect(calcNumGames([])).toBe(0);
    });

    it("returns the correct number of games", () => {
      const tmntResults = [
        {
          id: "1",
          full_name: "John Doe",
          total: 1200,
          "Game 1": 200,
          "Game 2": 201,
          "Game 3": 202,
          "Game 4": 203,
          "Game 5": 204,
          "Game 6": 205,
        },
      ];

      expect(calcNumGames(tmntResults as never)).toBe(6);
    });

    it("ignores non-game fields", () => {
      const tmntResults = [
        {
          id: "1",
          full_name: "John Doe",
          total: 1200,
          average: 200,
          hdcp: 10,
          something_else: 999,
          "Game 1": 200,
          "Game 2": 201,
        },
      ];

      expect(calcNumGames(tmntResults as never)).toBe(2);
    });

    it("ignores incorrectly formatted game fields", () => {
      const tmntResults = [
        {
          id: "1",
          "Game1": 200,
          "game 2": 201,
          "GAME 3": 202,
          "Game A": 203,
          "Game 1": 204,
          "Game 2": 205,
        },
      ];

      expect(calcNumGames(tmntResults as never)).toBe(2);
    });
  });

  describe("createResultsColumns2", () => {
    const mockResults = [
      {
        id: "1",
        player_id: "player1",
        full_name: "John Doe",
        average: 220,
        hdcp: 30,
        total: 1230,
        total_hdcp: 180,
        total_plus_total_hdcp: 1410,
        "Game 1": 200,
        "Game 2": 205,
        "Game 3": 210,
        "Game 4": 195,
        "Game 5": 215,
        "Game 6": 205,
      },
    ];

    it("returns an empty array when tmntResults is empty", () => {
      const result = createResultsColumns2([], 0);

      expect(result).toEqual([]);
    });

    it("returns an empty array when tmntResults is null", () => {
      const result = createResultsColumns2(null as never, 0);

      expect(result).toEqual([]);
    });

    it("creates the correct columns when maxHdcp is 0", () => {
      const result = createResultsColumns2(mockResults, 0);

      expect(result.map((col) => col.field)).toEqual([
        "full_name",
        "Game 1",
        "Game 2",
        "Game 3",
        "Game 4",
        "Game 5",
        "Game 6",
        "total",
      ]);
    });

    it("creates the correct columns when maxHdcp is greater than 0", () => {
      const result = createResultsColumns2(mockResults, 1);

      expect(result.map((col) => col.field)).toEqual([
        "full_name",
        "average",
        "hdcp",
        "Game 1",
        "Game 2",
        "Game 3",
        "Game 4",
        "Game 5",
        "Game 6",
        "total",
        "total_hdcp",
        "total_plus_total_hdcp",
      ]);
    });

    it("creates the player column correctly", () => {
      const result = createResultsColumns2(mockResults, 0);

      expect(result[0]).toEqual({
        field: "full_name",
        headerText: "Player",
        width: "150",
        textAlign: "Left",
        isPrimaryKey: true,
        allowEditing: false,
        customAttributes: { class: "column-header" },
      });
    });

    it("creates the average column correctly", () => {
      const result = createResultsColumns2(mockResults, 10);

      const averageColumn = result.find(
        (col) => col.field === "average"
      );

      expect(averageColumn).toEqual({
        field: "average",
        headerText: "Avg",
        width: "80",
        textAlign: "Right",
        allowEditing: false,
        type: "number",
        customAttributes: { class: "column-header" },
      });
    });

    it("creates the hdcp column correctly", () => {
      const result = createResultsColumns2(mockResults, 10);

      const hdcpColumn = result.find(
        (col) => col.field === "hdcp"
      );

      expect(hdcpColumn).toEqual({
        field: "hdcp",
        headerText: "HDCP",
        width: "80",
        textAlign: "Right",
        allowEditing: false,
        type: "number",
        customAttributes: { class: "column-header" },
      });
    });

    it("creates the total column correctly", () => {
      const result = createResultsColumns2(mockResults, 0);

      const totalColumn = result.find(
        (col) => col.field === "total"
      );

      expect(totalColumn).toEqual({
        field: "total",
        headerText: "Total",
        width: "90",
        textAlign: "Right",
        allowEditing: false,
        type: "number",
        customAttributes: { class: "column-header" },
      });
    });

    it("creates the total hdcp column correctly", () => {
      const result = createResultsColumns2(mockResults, 10);

      const totalHdcpColumn = result.find(
        (col) => col.field === "total_hdcp"
      );

      expect(totalHdcpColumn).toEqual({
        field: "total_hdcp",
        headerText: "Total + HDCP",
        width: "120",
        textAlign: "Right",
        allowEditing: false,
        type: "number",
        customAttributes: { class: "column-header" },
      });
    });

    it("creates the total plus total hdcp column correctly", () => {
      const result = createResultsColumns2(mockResults, 10);

      const totalPlusTotalHdcpColumn = result.find(
        (col) => col.field === "total_plus_total_hdcp"
      );

      expect(totalPlusTotalHdcpColumn).toEqual({
        field: "total_plus_total_hdcp",
        headerText: "Total + HDCP",
        width: "120",
        textAlign: "Right",
        allowEditing: false,
        type: "number",
        customAttributes: { class: "column-header" },
      });
    });

    it("creates all game columns correctly", () => {
      const result = createResultsColumns2(mockResults, 0);

      const gameColumns = result.filter((col) =>
        col.field?.startsWith("Game ")
      );

      expect(gameColumns).toHaveLength(6);

      gameColumns.forEach((col, index) => {
        const gameNum = index + 1;

        expect(col).toEqual({
          field: `Game ${gameNum}`,
          headerText: `Game ${gameNum}`,
          width: "90",
          textAlign: "Right",
          type: "number",
          allowEditing: false,
          customAttributes: { class: "column-header" },
        });
      });
    });

    it("creates the correct number of columns when maxHdcp is 0", () => {
      const result = createResultsColumns2(mockResults, 0);

      // player + 6 games + total
      expect(result).toHaveLength(8);
    });

    it("creates the correct number of columns when maxHdcp is greater than 0", () => {
      const result = createResultsColumns2(mockResults, 10);

      // player + avg + hdcp + 6 games + total + total_hdcp + total_plus_total_hdcp
      expect(result).toHaveLength(12);
    });

    it("supports a single game", () => {
      const oneGameResults = [
        {
          id: "1",
          full_name: "John Doe",
          total: 200,
          "Game 1": 200,
        },
      ];

      const result = createResultsColumns2(oneGameResults, 0);

      expect(result.map((col) => col.field)).toEqual([
        "full_name",
        "Game 1",
        "total",
      ]);
    });

    it("supports many games", () => {
      const manyGamesResults = [
        {
          id: "1",
          full_name: "John Doe",
          total: 1000,
          "Game 1": 100,
          "Game 2": 101,
          "Game 3": 102,
          "Game 4": 103,
          "Game 5": 104,
          "Game 6": 105,
          "Game 7": 106,
          "Game 8": 107,
          "Game 9": 108,
          "Game 10": 109,
        },
      ];

      const result = createResultsColumns2(manyGamesResults, 0);

      const gameColumns = result.filter((col) =>
        col.field?.startsWith("Game ")
      );

      expect(gameColumns).toHaveLength(10);

      expect(gameColumns[9].field).toBe("Game 10");
    });
  });
});