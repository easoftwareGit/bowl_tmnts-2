import {
  createBracketIndexMap,
  createGameScoreMap,  
  createPlayersMap,  
  getGameScoreKey,
} from "@/components/brackets/bracketMaps";
import {
  mockGames,
  brktId1,
  mockTmntFullData,
  oneBrktId1,
  oneBrktId2,
  oneBrktId3,
  oneBrktId4,
  oneBrktId5,
  oneBrktId6,
  oneBrktId7,
  oneBrktId8,
  playerId1,
  playerId2,
  playerId3,
  playerId4,
  playerId5,
  playerId6,
  playerId7,
  playerId8,  
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { calcHandicap } from "@/lib/db/divEntries/calcHdcp";
import { populatePlayerRows } from "@/app/dataEntry/playersForm/populatePlayerRows";
import { Bracket } from "@/components/brackets/bracketClass";
import cloneDeep from "lodash/cloneDeep";

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

  describe("createPlayersMap", () => {

    const bracketIds = [
      oneBrktId1,
      oneBrktId2,
      oneBrktId3,
      oneBrktId4,
      oneBrktId5,
      oneBrktId6,
      oneBrktId7,
      oneBrktId8,
    ];

    const playerBrackets = [
      playerId1,
      playerId2,
      playerId3,
      playerId4,
      playerId5,
      playerId6,
      playerId7,
      playerId8,
    ].map((playerId) => ({
      playerId,
      bracketIds,
    }));

    describe("scratch division", () => {
      it("creates one map entry for every player", () => {
        const playerRows = populatePlayerRows(mockTmntFullData);

        const playerMap = createPlayersMap(
          playerRows,
          mockTmntFullData.divEntries,
          mockTmntFullData.divs[0],
          playerBrackets,
        );

        expect(playerMap.size).toBe(playerRows.length);
      });

      it("maps every player to a handicap of 0", () => {
        const playerRows = populatePlayerRows(mockTmntFullData);

        const playerMap = createPlayersMap(
          playerRows,
          mockTmntFullData.divEntries,
          mockTmntFullData.divs[0],
          playerBrackets,
        );

        playerRows.forEach((player) => {
          expect(
            playerMap.get(player.id)?.hdcp,
          ).toBe(0);
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

      it("maps every player to the correct handicap", () => {
        const playerRows = populatePlayerRows(hdcpTmntData);

        const playerMap = createPlayersMap(
          playerRows,
          hdcpTmntData.divEntries,
          hdcpDiv,
          playerBrackets,
        );

        playerRows.forEach((player) => {
          const expectedHdcp = calcHandicap(
            player.average,
            hdcpDiv.hdcp_from,
            hdcpDiv.hdcp_per,
            hdcpDiv.int_hdcp,
          );

          expect(
            playerMap.get(player.id)?.hdcp,
          ).toBe(expectedHdcp);
        });
      });
    });

    describe("general tests", () => {
      it("uses the player id as the map key", () => {
        const playerRows = populatePlayerRows(mockTmntFullData);

        const playerMap = createPlayersMap(
          playerRows,
          mockTmntFullData.divEntries,
          mockTmntFullData.divs[0],
          playerBrackets,
        );

        playerRows.forEach((player) => {
          expect(
            playerMap.has(player.id),
          ).toBe(true);
        });
      });

      it("maps every player to the correct player info", () => {
        const playerRows = populatePlayerRows(mockTmntFullData);

        const playerMap = createPlayersMap(
          playerRows,
          mockTmntFullData.divEntries,
          mockTmntFullData.divs[0],
          playerBrackets,
        );

        playerRows.forEach((player) => {
          expect(
            playerMap.get(player.id),
          ).toEqual({
            first_name: player.first_name,
            last_name: player.last_name,
            average: player.average,
            hdcp: 0,
            bracketIds,
            lane: player.lane,
          });
        });
      });

      it("maps every player to the correct bracket ids", () => {
        const playerRows = populatePlayerRows(mockTmntFullData);

        const playerMap = createPlayersMap(
          playerRows,
          mockTmntFullData.divEntries,
          mockTmntFullData.divs[0],
          playerBrackets,
        );

        playerRows.forEach((player) => {
          expect(
            playerMap.get(player.id)?.bracketIds,
          ).toEqual(bracketIds);
        });
      });

      it("throws an error when a player has no division entry", () => {
        const playerRows = populatePlayerRows(mockTmntFullData);

        const missingPlayer = playerRows[0];

        const divEntriesWithoutPlayer =
          mockTmntFullData.divEntries.filter(
            (entry) =>
              entry.player_id !==
              missingPlayer.id,
          );

        expect(() =>
          createPlayersMap(
            playerRows,
            divEntriesWithoutPlayer,
            mockTmntFullData.divs[0],
            playerBrackets,
          ),
        ).toThrow(
          `Division entry not found for player ${missingPlayer.id}.`,
        );
      });

      it("throws an error when a player has no bracket ids", () => {
        const playerRows = populatePlayerRows(mockTmntFullData);

        const missingPlayer = playerRows[0];

        const playerBracketsWithoutPlayer =
          playerBrackets.filter(
            (bracket) =>
              bracket.playerId !==
              missingPlayer.id,
          );

        expect(() =>
          createPlayersMap(
            playerRows,
            mockTmntFullData.divEntries,
            mockTmntFullData.divs[0],
            playerBracketsWithoutPlayer,
          ),
        ).toThrow(
          `Bracket Ids not found for player ${missingPlayer.id}.`,
        );
      });

      it("returns an empty map when given no players", () => {
        const playerMap = createPlayersMap(
          [],
          mockTmntFullData.divEntries,
          mockTmntFullData.divs[0],
          playerBrackets,
        );

        expect(playerMap).toBeInstanceOf(Map);
        expect(playerMap.size).toBe(0);
      });
    });
  });

  describe("createBracketIndexMap", () => {
    const brackets = mockTmntFullData.oneBrkts.map(
      (oneBrkt) => new Bracket(oneBrkt.id),
    );

    it("creates one map entry for every bracket", () => {
      const bracketMap = createBracketIndexMap(brackets);

      expect(bracketMap.size).toBe(mockTmntFullData.oneBrkts.length);
    });

    it("uses the bracket id as the map key", () => {
      const bracketMap = createBracketIndexMap(brackets);

      mockTmntFullData.oneBrkts.forEach(
        (bracket) => {
          expect(
            bracketMap.has(bracket.id),
          ).toBe(true);
        },
      );
    });

    it("maps each bracket id to the correct array index", () => {
      const bracketMap = createBracketIndexMap(brackets);

      mockTmntFullData.oneBrkts.forEach(
        (bracket, index) => {
          expect(
            bracketMap.get(bracket.id),
          ).toBe(index);
        },
      );
    });

    it("returns an empty map when given no brackets", () => {
      const bracketMap = createBracketIndexMap([]);

      expect(bracketMap).toBeInstanceOf(Map);
      expect(bracketMap.size).toBe(0);
    });
  });  
});