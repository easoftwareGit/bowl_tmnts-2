import { tmntResultsToGameTypes } from "@/lib/tmntResultsToGameTypes";
import type { TmntGameResult } from "@/lib/types/resultsTypes";
import type { gameType } from "@/lib/types/types";
import {
  divId1,
  mockTmntFullData,
  playerId1,
  playerId2,
} from "../mocks/tmnts/tmntFullData/mockTmntFullData";

describe("tmntResultsToGameTypes", () => {
  const mockTmntResults: TmntGameResult[] = [
    {
      player_id: playerId1,
      div_id: divId1,
      div_name: "Division 1",
      sort_order: 1,
      tmnt_name: mockTmntFullData.tmnt.tmnt_name,
      start_date: "2025-09-01",

      full_name: "John Doe",
      average: 200,
      hdcp: 10,
      total: 645,

      "Game 1": 210,
      "Game 1 + Hdcp": 220,
      "Game 2": 215,
      "Game 2 + Hdcp": 225,
      "Game 3": 220,
      "Game 3 + Hdcp": 230,
    },
    {
      player_id: playerId2,
      div_id: divId1,
      div_name: "Division 1",
      sort_order: 1,
      tmnt_name: mockTmntFullData.tmnt.tmnt_name,
      start_date: "2025-09-01",

      full_name: "Jane Doe",
      average: 190,
      hdcp: 15,
      total: 600,

      "Game 1": 190,
      "Game 1 + Hdcp": 205,
      "Game 2": 200,
      "Game 2 + Hdcp": 215,
      "Game 3": 210,
      "Game 3 + Hdcp": 225,
    },
  ];

  /**
   * Remove id and squad_id because tmntResultsToGameType()
   * generates placeholder values for these fields.
   *
   * The values relevant to the conversion are:
   * player_id, game_num, and score.
   */
  const getTestableGameValues = (
    games: gameType[],
  ) => {
    return games.map((game) => ({
      player_id: game.player_id,
      game_num: game.game_num,
      score: game.score,
    }));
  };

  it("returns an empty array when tmntResults is empty", () => {
    const result = tmntResultsToGameTypes([]);

    expect(result).toEqual([]);
  });

  it("creates one gameType item for each game for each player", () => {
    const result = tmntResultsToGameTypes(mockTmntResults);

    // 2 players x 3 games = 6 gameType items
    expect(result).toHaveLength(6);
  });

  it("converts the tournament results to gameType values", () => {
    const result = tmntResultsToGameTypes(mockTmntResults);

    expect(getTestableGameValues(result)).toEqual([
      {
        player_id: playerId1,
        game_num: 1,
        score: 210,
      },
      {
        player_id: playerId1,
        game_num: 2,
        score: 215,
      },
      {
        player_id: playerId1,
        game_num: 3,
        score: 220,
      },
      {
        player_id: playerId2,
        game_num: 1,
        score: 190,
      },
      {
        player_id: playerId2,
        game_num: 2,
        score: 200,
      },
      {
        player_id: playerId2,
        game_num: 3,
        score: 210,
      },
    ]);
  });

  it("does not use the handicap game scores", () => {
    const result = tmntResultsToGameTypes(mockTmntResults);

    const scores = result.map((game) => game.score);

    expect(scores).toEqual([
      210,
      215,
      220,
      190,
      200,
      210,
    ]);

    expect(scores).not.toContain(225);
    expect(scores).not.toContain(230);
  });
});

describe("data guard", () => {
  it("returns an empty array when tmntResults is undefined", () => {
    const result = tmntResultsToGameTypes(
      undefined as unknown as TmntGameResult[],
    );

    expect(result).toEqual([]);
  });

  it("returns an empty array when tmntResults is null", () => {
    const result = tmntResultsToGameTypes(
      null as unknown as TmntGameResult[],
    );

    expect(result).toEqual([]);
  });

  it("returns an empty array when tmntResults is not an array", () => {
    const result = tmntResultsToGameTypes(
      {} as unknown as TmntGameResult[],
    );

    expect(result).toEqual([]);
  });

  it("returns an empty array when tmntResults is an empty array", () => {
    const result = tmntResultsToGameTypes([]);

    expect(result).toEqual([]);
  });
});