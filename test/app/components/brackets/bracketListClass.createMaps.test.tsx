import { BracketList } from "@/components/brackets/bracketListClass";
import { populatePlayerRows } from "@/app/dataEntry/playersForm/populatePlayerRows";
import {
  brktId1,
  mockTmntFullData,
  mockGames,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { entryNumBrktsColName } from "@/app/dataEntry/playersForm/sfCreatePlayerColumns";
import { cloneDeep } from "lodash";
import { calcHandicap } from "@/lib/db/divEntries/calcHdcp";

describe("create maps", () => {
  describe('createGameScoresMap', () => {

    it('should return the gameScoreMap', () => {
      const testBracketList = new BracketList("test", 2, 3);
      testBracketList.createGameScoresMap(mockGames);

      const result = testBracketList.gameScoreMap;
      if (result === null) {
        throw new Error('gameScoreMap is null');
      };
      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(mockGames.length);
    });
    it('should not create the gameScoreMap if passed null', () => {
      const testBracketList = new BracketList("test", 2, 3);

      testBracketList.createGameScoresMap(null as any);
      expect(testBracketList.gameScoreMap).toBeNull();
    });
    it('should not create the gameScoreMap if passed a non array', () => {
      const testBracketList = new BracketList("test", 2, 3);

      testBracketList.createGameScoresMap(mockTmntFullData as any);
      expect(testBracketList.gameScoreMap).toBeNull();
    })
    it('should not create the gameScoreMap if passed an empty array', () => {
      const testBracketList = new BracketList("test", 2, 3);
      testBracketList.createGameScoresMap([]);
      expect(testBracketList.gameScoreMap).toBeNull();
    })
  });

  describe("createPlayerHdcpMap", () => {
    it("should return the playerHdcpMap - scratch division", () => {
      const testBracketList = new BracketList(brktId1, 2, 3);

      const brkt1PlayerIds = new Set(
        mockTmntFullData.brktEntries
          .filter((brktEntry) => brktEntry.brkt_id === brktId1)
          .map((brktEntry) => brktEntry.player_id),
      );
      const brkt1Players = mockTmntFullData.players.filter((player) =>
        brkt1PlayerIds.has(player.id),
      );

      const playerRows = populatePlayerRows(mockTmntFullData);
      const brkt1PlayerRows = playerRows.filter((playerRow) =>
        brkt1PlayerIds.has(playerRow.id),
      );

      testBracketList.addBrktEntries(brkt1PlayerRows);
      testBracketList.createPlayersMap(        
        mockTmntFullData.divEntries,
        mockTmntFullData.divs[0],
      );
      const result = testBracketList.playerMap;
      if (result === null) {
        throw new Error("playerHdcpMap is null");
      }
      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(brkt1Players.length);
    });

    it("should return the playerHdcpMap - hdcp division", () => {
      const hdcpTmntData = cloneDeep(mockTmntFullData);
      const hdcpDiv = hdcpTmntData.divs[0];
      hdcpDiv.div_name = "HDCP";
      hdcpDiv.hdcp_per = 0.9;
      hdcpDiv.hdcp_from = 230;
      hdcpDiv.int_hdcp = true;
      hdcpDiv.hdcp_for = "Game";      

      const testBracketList = new BracketList(brktId1, 2, 3);

      const brkt1PlayerIds = new Set(
        hdcpTmntData.brktEntries
          .filter((brktEntry) => brktEntry.brkt_id === brktId1)
          .map((brktEntry) => brktEntry.player_id),
      );
      const brkt1Players = hdcpTmntData.players.filter((player) =>
        brkt1PlayerIds.has(player.id),
      );

      const playerRows = populatePlayerRows(hdcpTmntData);
      const brkt1PlayerRows = playerRows.filter((playerRow) =>
        brkt1PlayerIds.has(playerRow.id),
      );

      testBracketList.addBrktEntries(brkt1PlayerRows);
      testBracketList.createPlayersMap(        
        hdcpTmntData.divEntries,
        hdcpTmntData.divs[0],
      );
      const result = testBracketList.playerMap;
      if (result === null) {
        throw new Error("playerHdcpMap is null");
      }
      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(brkt1Players.length);

      hdcpTmntData.players.forEach((player) => {
        const expectedPlayer = brkt1PlayerRows.find(
          (playerRow) => playerRow.id === player.id
        )
        if (expectedPlayer === undefined) {
          throw new Error("expectedPlayer is undefined");
        }
        const expectedHdcp = calcHandicap(
          player.average,
          hdcpDiv.hdcp_from,
          hdcpDiv.hdcp_per,
          hdcpDiv.int_hdcp,
          hdcpDiv.hdcp_for,
        );
        const resultPlayer = result.get(player.id);
        if (resultPlayer === undefined) {
          throw new Error("resultPlayer is undefined");
        }
        expect(resultPlayer.id).toBe(expectedPlayer.id);
        expect(resultPlayer.first_name).toBe(expectedPlayer.first_name);
        expect(resultPlayer.last_name).toBe(expectedPlayer.last_name);
        expect(resultPlayer.average).toBe(expectedPlayer.average);
        expect(result.get(player.id)?.hdcp).toBe(expectedHdcp);
      });
    });

    it('should return null if no bracket player entries', () => {
      const bracketsName = entryNumBrktsColName(brktId1)
      const testBracketList = new BracketList(bracketsName, 2, 3);

      testBracketList.createPlayersMap(
        mockTmntFullData.divEntries,
        mockTmntFullData.divs[0]
      );
      const result = testBracketList.playerMap;
      expect(result).toBeNull();
    });

    it('should return null if divEntries is null', () => {
      const bracketsName = entryNumBrktsColName(brktId1)
      const testBracketList = new BracketList(bracketsName, 2, 3);
      const playerRows = populatePlayerRows(mockTmntFullData);

      testBracketList.addBrktEntries(playerRows);

      testBracketList.createPlayersMap(
        null as any,
        mockTmntFullData.divs[0]
      );
      const result = testBracketList.playerMap;
      expect(result).toBeNull();
    });
    it('should return null if divEntries is not an array', () => {
      const bracketsName = entryNumBrktsColName(brktId1)
      const testBracketList = new BracketList(bracketsName, 2, 3);
      const playerRows = populatePlayerRows(mockTmntFullData);

      testBracketList.addBrktEntries(playerRows);

      testBracketList.createPlayersMap(
        mockTmntFullData as any,
        mockTmntFullData.divs[0]
      );
      const result = testBracketList.playerMap;
      expect(result).toBeNull();
    });
    it('should return null if no divEntries', () => {
      const bracketsName = entryNumBrktsColName(brktId1)
      const testBracketList = new BracketList(bracketsName, 2, 3);
      const playerRows = populatePlayerRows(mockTmntFullData);

      testBracketList.addBrktEntries(playerRows);

      testBracketList.createPlayersMap(
        [],
        mockTmntFullData.divs[0]
      );
      const result = testBracketList.playerMap;
      expect(result).toBeNull();
    });

    it('should return null if div is null', () => {
      const bracketsName = entryNumBrktsColName(brktId1)
      const testBracketList = new BracketList(bracketsName, 2, 3);
      const playerRows = populatePlayerRows(mockTmntFullData);

      testBracketList.addBrktEntries(playerRows);

      testBracketList.createPlayersMap(
        mockTmntFullData.divEntries,
        null as any
      );
      const result = testBracketList.playerMap;
      expect(result).toBeNull();
    });
  });
});
