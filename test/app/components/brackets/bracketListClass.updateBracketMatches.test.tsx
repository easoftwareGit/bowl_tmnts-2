import {
  BracketList,
  brktListInitialDataType,
  defaultSquadGameNums,
} from "@/components/brackets/bracketListClass";
import { Bracket, playerStatusValues } from "@/components/brackets/bracketClass";
import {
  brktId1,
  byeId,
  divId1,
  mockGames,
  mockTmntFullData,
  playerId1,
  playerId2,
  squadId1,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import type {
  gameType,
  playerType,
} from "@/lib/types/types";
import type { tmntGameResult } from "@/lib/types/resultsTypes";
import { initPlayer } from "@/lib/db/initVals";

describe("BracketList.updateBracketMatches", () => {
  const byePlayer: playerType = {
    ...initPlayer,
    id: byeId,
    squad_id: squadId1,
    first_name: "Bye",
    average: 0,
  };

  const initData: brktListInitialDataType = {
    tmntFullData: mockTmntFullData,
    divId: divId1,
  };

  /**
   * Tournament results used to update the bracket game scores.
   *
   * Only the player id and Game N properties are important to
   * updateBracketMatches(), but complete TmntGameResult objects
   * are created to satisfy the type.
   */
  const mockTmntResults: tmntGameResult[] = [
    {
      player_id: playerId1,
      div_id: divId1,
      div_name: "Division 1",
      sort_order: 1,
      tmnt_name: mockTmntFullData.tmnt.tmnt_name,
      start_date: "2025-09-01",
      full_name: "Player One",
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
      full_name: "Player Two",
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

  const createBracketList = (
    initialData: brktListInitialDataType | null = initData,
    squadGameNums: number[] = defaultSquadGameNums,
  ): BracketList => {
    return new BracketList(
      brktId1,
      2,
      3,
      squadGameNums,
      byePlayer,
      initialData,
    );
  };

  /**
   * Creates game data containing only games through the
   * requested game number.
   */
  const gamesThrough = (lastGame: number): gameType[] => {
    return mockGames.filter((game) => game.game_num <= lastGame);
  };

  const mockSixGameTmntResults: tmntGameResult[] =
    mockTmntResults.map((result) => ({
      ...result,
      "Game 4": result.player_id === playerId1
        ? 225
        : 215,
      "Game 4 + Hdcp": result.player_id === playerId1
        ? 235
        : 230,
      "Game 5": result.player_id === playerId1
        ? 230
        : 220,
      "Game 5 + Hdcp": result.player_id === playerId1
        ? 240
        : 235,
      "Game 6": result.player_id === playerId1
        ? 235
        : 225,
      "Game 6 + Hdcp": result.player_id === playerId1
        ? 245
        : 240,
    }));  

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('updateBracketMatches', () => { 

    it("calls updateMatches once for every bracket", () => {
      const brktList = createBracketList();

      /*
      * updateBracketMatches() requires an existing game score
      * map before it will process the new tournament results.
      */
      brktList.createGameScoresMap(gamesThrough(3));

      const updateMatchesSpy = jest.spyOn(
        Bracket.prototype,
        "updateMatches",
      );

      brktList.updateBracketMatches(mockTmntResults);

      expect(brktList.brackets.length).toBeGreaterThan(0);
      expect(updateMatchesSpy).toHaveBeenCalledTimes(brktList.brackets.length);
    });

    it("replaces the game score map with scores from tmntResults", () => {
      const brktList = createBracketList();

      brktList.createGameScoresMap(gamesThrough(3));
      brktList.updateBracketMatches(mockTmntResults);

      expect(
        brktList.gameScoreMap?.get(
          `${playerId1}_1`,
        ),
      ).toBe(210);

      expect(
        brktList.gameScoreMap?.get(
          `${playerId1}_2`,
        ),
      ).toBe(215);

      expect(
        brktList.gameScoreMap?.get(
          `${playerId1}_3`,
        ),
      ).toBe(220);

      expect(
        brktList.gameScoreMap?.get(
          `${playerId2}_1`,
        ),
      ).toBe(190);

      expect(
        brktList.gameScoreMap?.get(
          `${playerId2}_2`,
        ),
      ).toBe(200);

      expect(
        brktList.gameScoreMap?.get(
          `${playerId2}_3`,
        ),
      ).toBe(210);
    });

    it("brackets get the number of games from the parent BracketList", () => {
      const brktList = createBracketList();

      expect(brktList.games).toBe(3);
      expect(brktList.brackets.length).toBeGreaterThan(0);

      brktList.brackets.forEach((bracket) => {
        expect(bracket.games).toBe(brktList.games);
      });
    });

    it("uses the configured squad game numbers when updating bracket matches", () => {
      const brktList = createBracketList(
        initData,
        [4, 5, 6],
      );

      brktList.createGameScoresMap(gamesThrough(3));

      const getMatchInfoSpies = brktList.brackets.map(
        (bracket) =>
          jest.spyOn(
            bracket.match!,
            "getMatchInfo",
          ),
      );

      brktList.updateBracketMatches(mockTmntResults);

      const squadGameNums = getMatchInfoSpies.flatMap(
        (spy) =>
          spy.mock.calls.map(
            (call) => call[1],
          ),
      );

      expect(squadGameNums).toContain(4);
      expect(squadGameNums).toContain(5);
      expect(squadGameNums).toContain(6);

      expect(squadGameNums).not.toContain(1);
      expect(squadGameNums).not.toContain(2);
      expect(squadGameNums).not.toContain(3);
    });

    it("uses squad games 4, 5, and 6 for bracket games 1, 2, and 3", () => {
      const brktList = createBracketList(
        initData,
        [4, 5, 6],
      );

      brktList.createGameScoresMap(gamesThrough(3));

      const getMatchInfoSpies = brktList.brackets.map(
        (bracket) =>
          jest.spyOn(
            bracket.match!,
            "getMatchInfo",
          ),
      );

      brktList.updateBracketMatches(
        mockSixGameTmntResults,
      );

      const squadGameNums = getMatchInfoSpies.flatMap(
        (spy) =>
          spy.mock.calls.map(
            (call) => call[1],
          ),
      );

      expect(squadGameNums).toContain(4);
      expect(squadGameNums).toContain(5);
      expect(squadGameNums).toContain(6);

      expect(squadGameNums).not.toContain(1);
      expect(squadGameNums).not.toContain(2);
      expect(squadGameNums).not.toContain(3);
    });

    it("uses squad game numbers in the configured order", () => {
      const brktList = createBracketList(
        initData,
        [3, 2, 1],
      );

      brktList.createGameScoresMap(gamesThrough(3));

      const getMatchInfoSpies = brktList.brackets.map(
        (bracket) =>
          jest.spyOn(
            bracket.match!,
            "getMatchInfo",
          ),
      );

      brktList.updateBracketMatches(mockTmntResults);

      const squadGameNums = getMatchInfoSpies.flatMap(
        (spy) =>
          spy.mock.calls.map(
            (call) => call[1],
          ),
      );

      expect(squadGameNums).toContain(3);
      expect(squadGameNums).toContain(2);
      expect(squadGameNums).toContain(1);
    });
    
    it("maps bracket games to squad games in the configured order", () => {
      const brktList = createBracketList(
        initData,
        [3, 2, 1],
      );

      brktList.createGameScoresMap(gamesThrough(3));

      const bracket = brktList.brackets[0];

      const squadGameNumberSpy = jest.spyOn(
        brktList,
        "squadGameNumber",
      );

      /*
      * Prevent getPlayerStatus() from doing additional bracket
      * calculations that are not relevant to this test.
      */
      jest.spyOn(
        bracket,
        "getPlayerStatus",
      ).mockReturnValue(
        playerStatusValues.IN_BRACKET,
      );

      bracket.updateMatches();

      /*
      * updateMatches() must request all three bracket game numbers.
      *
      * Do not test the exact call count/order here because
      * BracketMatch calculations can also call squadGameNumber().
      */
      expect(
        squadGameNumberSpy,
      ).toHaveBeenCalledWith(1);

      expect(
        squadGameNumberSpy,
      ).toHaveBeenCalledWith(2);

      expect(
        squadGameNumberSpy,
      ).toHaveBeenCalledWith(3);

      /*
      * Verify the configured bracket-game-to-squad-game mapping.
      */
      expect(brktList.squadGameNumber(1)).toBe(3);
      expect(brktList.squadGameNumber(2)).toBe(2);
      expect(brktList.squadGameNumber(3)).toBe(1);
    });    
  });

  describe("data guard", () => {

    it.each([
      undefined,
      null,
      {},
      "not an array",
      123,
    ])(
      "returns for invalid tmntResults: %p",
      (invalidInput) => {
        const brktList = createBracketList();

        brktList.createGameScoresMap(gamesThrough(1));

        const updateMatchesSpy = jest.spyOn(
          Bracket.prototype,
          "updateMatches",
        );

        brktList.updateBracketMatches(
          invalidInput as unknown as tmntGameResult[],
        );

        expect(updateMatchesSpy).not.toHaveBeenCalled();
      },
    );

    it("updates every bracket when tmntResults is an empty array", () => {
      const brktList = createBracketList();

      brktList.createGameScoresMap(gamesThrough(1));

      const updateMatchesSpy = jest.spyOn(
        Bracket.prototype,
        "updateMatches",
      );

      brktList.updateBracketMatches([]);

      expect(updateMatchesSpy).toHaveBeenCalledTimes(
        brktList.brackets.length,
      );
    });

    it("clears game scores when tmntResults is an empty array", () => {
      const brktList = createBracketList();

      brktList.createGameScoresMap(gamesThrough(1));

      expect(
        brktList.gameScoreMap?.size,
      ).toBeGreaterThan(0);

      brktList.updateBracketMatches([]);

      expect(brktList.gameScoreMap?.size).toBe(0);
    });

    it("returns when there are no brackets", () => {
      const brktList = createBracketList(null);

      /*
      * updateBracketMatches() checks the brackets after
      * validating tmntResults, so valid results are required
      * to reach the no-brackets guard.
      */
      const updateMatchesSpy = jest.spyOn(
        Bracket.prototype,
        "updateMatches",
      );

      brktList.updateBracketMatches(mockTmntResults);

      expect(brktList.brackets).toHaveLength(0);

      expect(updateMatchesSpy).not.toHaveBeenCalled();
    });

    it("updates brackets when the existing game score map is empty", () => {
      const brktList = createBracketList();

      const updateMatchesSpy = jest.spyOn(
        Bracket.prototype,
        "updateMatches",
      );

      /*
      * The constructor initializes the brackets and players map,
      * but no game scores have been added yet.
      */
      expect(brktList.brackets.length).toBeGreaterThan(0);
      expect(brktList.gameScoreMap?.size).toBe(0);
      expect(brktList.playersMap).not.toBeNull();

      brktList.updateBracketMatches(mockTmntResults);

      /*
      * updateBracketMatches() creates a new game score map from
      * tmntResults, so an initially empty map does not prevent
      * the brackets from being recalculated.
      */
      expect(brktList.gameScoreMap?.size).toBeGreaterThan(0);

      expect(updateMatchesSpy).toHaveBeenCalledTimes(
        brktList.brackets.length,
      );
    });

    it("does not update brackets when the players map is empty", () => {
      /*
      * This test requires a BracketList with brackets and game
      * scores, but without a players map.
      *
      * Because the normal constructor creates the players map
      * when initialData is supplied, temporarily replace the
      * players map with an empty Map for this guard-clause test.
      */
      const brktList = createBracketList();

      brktList.createGameScoresMap(gamesThrough(1));

      const brktListPrivate =
        brktList as unknown as {
          _playersMap: Map<string, playerType>;
        };

      brktListPrivate._playersMap = new Map();

      const updateMatchesSpy = jest.spyOn(
        Bracket.prototype,
        "updateMatches",
      );

      brktList.updateBracketMatches(mockTmntResults);

      expect(updateMatchesSpy).not.toHaveBeenCalled();
    });
  });

});
