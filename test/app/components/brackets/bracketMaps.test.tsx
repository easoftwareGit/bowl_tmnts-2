import {
  createGameScoreMap,
  createPlayerMap,  
  getGameScoreKey,
} from "@/components/brackets/bracketMaps";
import { mockGames, mockTmntFullData } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { calcHandicap } from "@/lib/db/divEntries/calcHdcp";
import cloneDeep from "lodash/cloneDeep";
import { populatePlayerRows } from "@/app/dataEntry/playersForm/populatePlayerRows";

describe("bracketMaps", () => {

  describe("getGameScoreKey", () => {
    it("creates a key from the player id and game number", () => {
      const game = mockGames[0];

      const result = getGameScoreKey(
        game.player_id,
        game.game_num,
      );

      expect(result).toBe(`${game.player_id}_${game.game_num}`);
    });

    it("creates different keys for different games for the same player", () => {
      const game1 = mockGames[0];
      const game2 = mockGames[1];

      const key1 = getGameScoreKey(
        game1.player_id,
        game1.game_num,
      );

      const key2 = getGameScoreKey(
        game2.player_id,
        game2.game_num,
      );

      expect(key1).not.toBe(key2);
    });

    it("creates different keys for different players in the same game", () => {
      const player1Game1 = mockGames[0];
      const player2Game1 = mockGames[6];

      const key1 = getGameScoreKey(
        player1Game1.player_id,
        player1Game1.game_num,
      );

      const key2 = getGameScoreKey(
        player2Game1.player_id,
        player2Game1.game_num,
      );

      expect(key1).not.toBe(key2);
    });
  });

  describe("createGameScoreMap", () => {
    it("creates one map entry for every game", () => {
      const gameMap = createGameScoreMap(mockGames);

      expect(gameMap.size).toBe(mockGames.length);
    });

    it("maps each player/game key to the correct score", () => {
      const gameMap = createGameScoreMap(mockGames);

      mockGames.forEach((game) => {
        const key = getGameScoreKey(
          game.player_id,
          game.game_num,
        );

        expect(gameMap.get(key)).toBe(game.score);
      });
    });

    it("returns an empty map when given an empty games array", () => {
      const gameMap = createGameScoreMap([]);

      expect(gameMap).toBeInstanceOf(Map);
      expect(gameMap.size).toBe(0);
    });
  });

  describe("scratch division", () => {
    it("creates one map entry for every player", () => {
      const playerRows = populatePlayerRows(mockTmntFullData);
      const playerMap = createPlayerMap(
        playerRows,
        mockTmntFullData.divEntries,
        mockTmntFullData.divs[0],
      );

      // only 1 divsion, no need to filter by division
      expect(playerMap.size).toBe(mockTmntFullData.divEntries.length);
    });

    it("maps every player to a handicap of 0", () => {
      const playerRows = populatePlayerRows(mockTmntFullData);
      const playerMap = createPlayerMap(
        playerRows,
        mockTmntFullData.divEntries,
        mockTmntFullData.divs[0],
      );

      mockTmntFullData.players.forEach((player) => {
        expect(playerMap.get(player.id)?.hdcp).toBe(0);
      });
    });
  });  

  describe("handicap division", () => {
    const hdcpTmntData = cloneDeep(mockTmntFullData);
    const hdcpDiv = hdcpTmntData.divs[0];
    hdcpDiv.div_name = "HDCP";
    hdcpDiv.hdcp_per = 0.9;
    hdcpDiv.hdcp_from = 230;
    hdcpDiv.int_hdcp = true;
    hdcpDiv.hdcp_for = "Game";

    it("creates one map entry for every player", () => {
      const playerRows = populatePlayerRows(hdcpTmntData);
      const hdcpMap = createPlayerMap(
        playerRows,
        hdcpTmntData.divEntries,
        hdcpDiv,
      );

      // only 1 divsion, no need to filter by division
      expect(hdcpMap.size).toBe(hdcpTmntData.divEntries.length); 
    });

    it("maps every player to the correct handicap", () => {
      const playerRows = populatePlayerRows(hdcpTmntData);
      const hdcpMap = createPlayerMap(
        playerRows,
        hdcpTmntData.divEntries,
        hdcpDiv,
      );

      hdcpTmntData.players.forEach((player) => {
        const expectedHdcp = calcHandicap(
          player.average,
          hdcpDiv.hdcp_from,
          hdcpDiv.hdcp_per,
          hdcpDiv.int_hdcp,
          hdcpDiv.hdcp_for,
        );
        expect(hdcpMap.get(player.id)?.hdcp).toBe(expectedHdcp);
      });
    });

    it("throws an error when a player has no division entry", () => {
      const playerRows = populatePlayerRows(hdcpTmntData);
      const missingPlayerDivEntries = hdcpTmntData.divEntries.slice(1);
      const missingPlayer = hdcpTmntData.players[0];
      expect(() =>
        createPlayerMap(playerRows, missingPlayerDivEntries, hdcpDiv),
      ).toThrow(
        `Division entry not found for player ${missingPlayer.id}.`,
      );
    });
  });    

  describe("createPlayerMap", () => {
    const hdcpTmntData = cloneDeep(mockTmntFullData);
    const hdcpDiv = hdcpTmntData.divs[0];

    hdcpDiv.div_name = "HDCP";
    hdcpDiv.hdcp_per = 0.9;
    hdcpDiv.hdcp_from = 230;
    hdcpDiv.int_hdcp = true;
    hdcpDiv.hdcp_for = "Game";

    it("creates one map entry for every player", () => {
      const playerRows = populatePlayerRows(hdcpTmntData);

      const playerMap = createPlayerMap(
        playerRows,
        hdcpTmntData.divEntries,
        hdcpDiv,
      );

      expect(playerMap.size).toBe(playerRows.length);
    });

    it("uses the player id as the map key", () => {
      const playerRows = populatePlayerRows(hdcpTmntData);

      const playerMap = createPlayerMap(
        playerRows,
        hdcpTmntData.divEntries,
        hdcpDiv,
      );

      playerRows.forEach((player) => {
        expect(playerMap.has(player.id)).toBe(
          true,
        );
      });
    });

    it("maps every player to the correct bracket player object", () => {
      const playerRows = populatePlayerRows(hdcpTmntData);

      const playerMap = createPlayerMap(
        playerRows,
        hdcpTmntData.divEntries,
        hdcpDiv,
      );

      playerRows.forEach((player) => {
        const expectedHdcp = calcHandicap(
          player.average,
          hdcpDiv.hdcp_from,
          hdcpDiv.hdcp_per,
          hdcpDiv.int_hdcp,
        );

        expect(playerMap.get(player.id)).toEqual({
          id: player.id,
          first_name: player.first_name,
          last_name: player.last_name,
          average: player.average,
          hdcp: expectedHdcp,
        });
      });
    });

    it("maps scratch-division players to a handicap of 0", () => {
      const playerRows = populatePlayerRows(
        mockTmntFullData,
      );
      const scratchDiv =
        mockTmntFullData.divs[0];

      const playerMap = createPlayerMap(
        playerRows,
        mockTmntFullData.divEntries,
        scratchDiv,
      );

      playerRows.forEach((player) => {
        expect(
          playerMap.get(player.id),
        ).toEqual({
          id: player.id,
          first_name: player.first_name,
          last_name: player.last_name,
          average: player.average,
          hdcp: 0,
        });
      });
    });

    it("throws an error when a player has no division entry", () => {
      const playerRows = populatePlayerRows(hdcpTmntData);
      const missingPlayer = playerRows[0];

      const divEntriesWithoutPlayer =
        hdcpTmntData.divEntries.filter(
          (entry) =>
            entry.player_id !==
            missingPlayer.id,
        );

      expect(() =>
        createPlayerMap(
          playerRows,
          divEntriesWithoutPlayer,
          hdcpDiv,
        ),
      ).toThrow(
        `Division entry not found for player ${missingPlayer.id}.`,
      );
    });

    it("returns an empty map when given no players", () => {
      const playerMap = createPlayerMap(
        [],
        hdcpTmntData.divEntries,
        hdcpDiv,
      );

      expect(playerMap).toBeInstanceOf(Map);
      expect(playerMap.size).toBe(0);
    });
  });

});