import { BracketList, brktListInitialDataType, defaultSquadGameNums } from "@/components/brackets/bracketListClass";
import { populatePlayerRows } from "@/app/dataEntry/playersForm/populatePlayerRows";
import {
  brktId1,
  mockTmntFullData,
  mockByePlayer,
  divId1,
  mockGames,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";
import { calcHandicap } from "@/lib/db/divEntries/calcHdcp";

describe("bracketList class - create maps", () => {
  
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
    it('should create a empty gameScoreMap if passed null', () => {
      const testBracketList = new BracketList("test", 2, 3);

      testBracketList.createGameScoresMap(null as any);
      if (testBracketList.gameScoreMap == null) {
        throw new Error('gameScoreMap is null or undefined');
      };
      expect(testBracketList.gameScoreMap.size).toBe(0);
    });
    it('should create a empty gameScoreMap if passed a non array', () => {
      const testBracketList = new BracketList("test", 2, 3);

      testBracketList.createGameScoresMap(mockTmntFullData as any);
      if (testBracketList.gameScoreMap == null) {
        throw new Error('gameScoreMap is null or undefined');
      };
      expect(testBracketList.gameScoreMap.size).toBe(0);
    })
    it('should create a empty gameScoreMap if passed an empty array', () => {
      const testBracketList = new BracketList("test", 2, 3);
      testBracketList.createGameScoresMap([]);
      if (testBracketList.gameScoreMap == null) {
        throw new Error('gameScoreMap is null or undefined');
      };
      expect(testBracketList.gameScoreMap.size).toBe(0);
    })
    it('should create a empty gameScoreMap when re-creating afet valid data', () => {
      const testBracketList = new BracketList("test", 2, 3);
      testBracketList.createGameScoresMap(mockGames);

      const result = testBracketList.gameScoreMap;
      if (result === null) {
        throw new Error('gameScoreMap is null');
      };
      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(mockGames.length);

      testBracketList.createGameScoresMap([]);
      if (testBracketList.gameScoreMap == null) {
        throw new Error('gameScoreMap is null or undefined');
      };
      expect(testBracketList.gameScoreMap.size).toBe(0);
    });
  });

  /***************************************
  * createPlayersMap is private.         *
  * change to public before testing      *
  * change to private back after testing *
  ***************************************/
  
  describe("createPlayersMap - now private", () => {

    // BracketList.getPlayerBbrktIds is a private method
    // this getPlayerBbrktIds does the same thing
    const getPlayerBbrktIds = (brktList: BracketList, playerId: string) => {
      return brktList.brackets
        .filter((brkt) => brkt.hasPlayer(playerId))
        .map((brkt) => brkt.id);      
    }

    it("creates the player map for a scratch division", () => {
      const initBrktData: brktListInitialDataType = {
        tmntFullData: mockTmntFullData,
        divId: divId1,
      }
      const testBracketList = new BracketList(
        brktId1,
        2,
        3,
        defaultSquadGameNums,
        mockByePlayer,
        initBrktData,
      );

      const brkt1PlayerIds = new Set(
        mockTmntFullData.brktEntries
          .filter((brktEntry) => brktEntry.brkt_id === brktId1)
          .map((brktEntry) => brktEntry.player_id),
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

      const result = testBracketList.playersMap;

      if (result === null) {
        throw new Error("playerMap is null");
      }

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(brkt1PlayerRows.length);

      brkt1PlayerRows.forEach((player) => {
        const resultPlayer = result.get(player.id);

        if (resultPlayer === undefined) {
          throw new Error(
            `Player ${player.id} not found in playerMap`,
          );
        }

        expect(resultPlayer).toEqual({
          first_name: player.first_name,
          last_name: player.last_name,
          average: player.average,
          hdcp: 0,
          lane: player.lane,
          bracketIds: getPlayerBbrktIds(testBracketList, player.id),
        });
      });
    });

    it("creates the player map for a handicap division", () => {
      const hdcpTmntData = cloneDeep(mockTmntFullData);

      const hdcpDiv = hdcpTmntData.divs[0];

      hdcpDiv.div_name = "HDCP";
      hdcpDiv.hdcp_per = 0.9;
      hdcpDiv.hdcp_from = 230;
      hdcpDiv.int_hdcp = true;
      hdcpDiv.hdcp_for = "Game";

      const testBracketList = new BracketList(
        brktId1,
        2,
        3,
      );

      const brkt1PlayerIds = new Set(
        hdcpTmntData.brktEntries
          .filter((brktEntry) => brktEntry.brkt_id === brktId1)
          .map((brktEntry) => brktEntry.player_id),
      );

      const playerRows = populatePlayerRows(hdcpTmntData);

      const brkt1PlayerRows =
        playerRows.filter((playerRow) =>
          brkt1PlayerIds.has(playerRow.id),
        );

      testBracketList.addBrktEntries(brkt1PlayerRows);

      testBracketList.createPlayersMap(
        hdcpTmntData.divEntries,
        hdcpDiv,
      );

      const result = testBracketList.playersMap;

      if (result === null) {
        throw new Error("playerMap is null");
      }

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(brkt1PlayerRows.length);

      brkt1PlayerRows.forEach((player) => {
        const resultPlayer = result.get(player.id);

        if (resultPlayer === undefined) {
          throw new Error(
            `Player ${player.id} not found in playerMap`,
          );
        }

        const expectedHdcp = calcHandicap(
          player.average,
          hdcpDiv.hdcp_from,
          hdcpDiv.hdcp_per,
          hdcpDiv.int_hdcp,
          hdcpDiv.hdcp_for,
        );

        expect(resultPlayer).toEqual({
          first_name: player.first_name,
          last_name: player.last_name,
          average: player.average,
          hdcp: expectedHdcp,
          lane: player.lane,
          bracketIds: getPlayerBbrktIds(testBracketList, player.id),
        });
      });
    });

    it("returns null if no bracket player entries", () => {
      const testBracketList = new BracketList(
        brktId1,
        2,
        3,
      );

      testBracketList.createPlayersMap(
        mockTmntFullData.divEntries,
        mockTmntFullData.divs[0],
      );

      expect(testBracketList.playersMap).toBeNull();
    });

    it("returns null if divEntries is null", () => {
      const testBracketList = new BracketList(
        brktId1,
        2,
        3,
      );

      const playerRows = populatePlayerRows(mockTmntFullData);

      testBracketList.addBrktEntries(playerRows);

      testBracketList.createPlayersMap(
        null as any,
        mockTmntFullData.divs[0],
      );

      expect(testBracketList.playersMap).toBeNull();
    });

    it("returns null if divEntries is not an array", () => {
      const testBracketList = new BracketList(
        brktId1,
        2,
        3,
      );

      const playerRows = populatePlayerRows(mockTmntFullData);

      testBracketList.addBrktEntries(playerRows);

      testBracketList.createPlayersMap(
        mockTmntFullData as any,
        mockTmntFullData.divs[0],
      );

      expect(
        testBracketList.playersMap,
      ).toBeNull();
    });

    it("returns null if no divEntries", () => {
      const testBracketList = new BracketList(
        brktId1,
        2,
        3,
      );

      const playerRows = populatePlayerRows(mockTmntFullData);

      testBracketList.addBrktEntries(playerRows);

      testBracketList.createPlayersMap(
        [],
        mockTmntFullData.divs[0],
      );

      expect(testBracketList.playersMap).toBeNull();
    });

    it("returns null if div is null", () => {
      const testBracketList = new BracketList(
        brktId1,
        2,
        3,
      );

      const playerRows = populatePlayerRows(mockTmntFullData);

      testBracketList.addBrktEntries(playerRows);

      testBracketList.createPlayersMap(
        mockTmntFullData.divEntries,
        null as any,
      );

      expect(testBracketList.playersMap).toBeNull();
    });
  });

});
