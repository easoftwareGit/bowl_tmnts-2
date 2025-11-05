import { extractDataFromRows, extractFullBrktsData } from "@/app/dataEntry/playersForm/extractData";
import { gridTmntEntryDataType } from "@/lib/types/types";
import {
  brkt1FeeColName,
  brkt1NumColName,
  brkt1TimeStartColName,
  brkt2FeeColName,
  brkt2NumColName,
  brkt2TimeStartColName,
  mockDataOneTmnt,
  validRows,
} from "../../../mocks/tmnts/playerEntries/mockPlayerEntries";
import { isValidBtDbId } from "@/lib/validation";
import { calcHandicap } from "@/app/api/divEntries/calcHdcp";
import { BracketList } from "@/components/brackets/bracketListClass";
import { brktId1, brktId2, playerId1, playerId2, playerId3, playerId4, playerId5, playerId6, playerId7, playerId8 } from "../../../mocks/tmnts/tmntFulldata/mockTmntFullData";
import { defaultBrktGames, defaultPlayersPerMatch } from "@/lib/db/initVals";
import { Bracket } from "@/components/brackets/bracketClass";

const squadId = "sqd_0123456789abcdef0123456789abcdef";

describe("extractData", () => {

  describe("extractDataFromRows", () => {
    it("should return valid and populated data", () => {
      const result = extractDataFromRows(validRows, squadId);
      const tmntEntriesData = result as gridTmntEntryDataType;

      expect(tmntEntriesData.players.length).toBe(6);
      expect(tmntEntriesData.divEntries.length).toBe(7);
      expect(tmntEntriesData.potEntries.length).toBe(5);
      expect(tmntEntriesData.brktEntries.length).toBe(4);
      expect(tmntEntriesData.elimEntries.length).toBe(4);
    });
  });

  describe("extract correct players data from rows", () => {
    it("should return valid and populated data for players", () => {
      const result = extractDataFromRows(
        validRows,
        "sqd_0123456789abcdef0123456789abcdef"
      );
      const tmntEntriesData = result as gridTmntEntryDataType;

      expect(tmntEntriesData.players.length).toBe(6);
      for (let i = 0; i < tmntEntriesData.players.length; i++) {
        expect(tmntEntriesData.players[i].id).toBe(validRows[i].id);
        expect(tmntEntriesData.players[i].first_name).toBe(
          validRows[i].first_name
        );
        expect(tmntEntriesData.players[i].last_name).toBe(
          validRows[i].last_name
        );
        expect(tmntEntriesData.players[i].average).toBe(validRows[i].average);
        expect(tmntEntriesData.players[i].lane).toBe(validRows[i].lane);
        expect(tmntEntriesData.players[i].position).toBe(validRows[i].position);
      }
    });
  });

  describe("extract correct div entries data from rows", () => {
    it("should return valid and populated data for divs", () => {
      const result = extractDataFromRows(
        validRows,
        "sqd_0123456789abcdef0123456789abcdef"
      );
      const tmntEntriesData = result as gridTmntEntryDataType;

      expect(tmntEntriesData.divEntries.length).toBe(7);
      for (let i = 0; i < tmntEntriesData.divEntries.length; i++) {
        expect(isValidBtDbId(tmntEntriesData.divEntries[i].id, "den")).toBe(true);
        expect(tmntEntriesData.divEntries[i].squad_id).toBe(squadId);
        expect(tmntEntriesData.divEntries[i].fee).toBe("85");
        if (i === 0) {
          expect(tmntEntriesData.divEntries[i].div_id).toBe(
            mockDataOneTmnt.divs[0].id
          );
          expect(tmntEntriesData.divEntries[i].player_id).toBe(validRows[0].id);
          expect(tmntEntriesData.divEntries[i].hdcp).toBe(0);
        } else if (i === 1) {
          expect(tmntEntriesData.divEntries[i].div_id).toBe(
            mockDataOneTmnt.divs[0].id
          );
          expect(tmntEntriesData.divEntries[i].player_id).toBe(validRows[2].id);
          expect(tmntEntriesData.divEntries[i].hdcp).toBe(0);
        } else if (i === 2) {
          expect(tmntEntriesData.divEntries[i].div_id).toBe(
            mockDataOneTmnt.divs[1].id
          );
          expect(tmntEntriesData.divEntries[i].player_id).toBe(validRows[2].id);
          const hdcp = calcHandicap(
            validRows[2].average,
            mockDataOneTmnt.divs[1].hdcp_from,
            mockDataOneTmnt.divs[1].hdcp_per,
            mockDataOneTmnt.divs[1].int_hdcp
          );
          expect(tmntEntriesData.divEntries[i].hdcp).toBe(hdcp);
        } else if (i === 3) {
          expect(tmntEntriesData.divEntries[i].div_id).toBe(
            mockDataOneTmnt.divs[0].id
          );
          expect(tmntEntriesData.divEntries[i].player_id).toBe(validRows[3].id);
          expect(tmntEntriesData.divEntries[i].hdcp).toBe(0);
        } else if (i === 4) {
          expect(tmntEntriesData.divEntries[i].div_id).toBe(
            mockDataOneTmnt.divs[1].id
          );
          expect(tmntEntriesData.divEntries[i].player_id).toBe(validRows[3].id);
          const hdcp = calcHandicap(
            validRows[3].average,
            mockDataOneTmnt.divs[1].hdcp_from,
            mockDataOneTmnt.divs[1].hdcp_per,
            mockDataOneTmnt.divs[1].int_hdcp
          );
          expect(tmntEntriesData.divEntries[i].hdcp).toBe(hdcp);
        } else if (i === 5) {
          expect(tmntEntriesData.divEntries[i].div_id).toBe(
            mockDataOneTmnt.divs[0].id
          );
          expect(tmntEntriesData.divEntries[i].player_id).toBe(validRows[4].id);
          expect(tmntEntriesData.divEntries[i].hdcp).toBe(0);
        } else if (i === 6) {
          expect(tmntEntriesData.divEntries[i].div_id).toBe(
            mockDataOneTmnt.divs[0].id
          );
          expect(tmntEntriesData.divEntries[i].player_id).toBe(validRows[5].id);
          expect(tmntEntriesData.divEntries[i].hdcp).toBe(0);
        }
      }
    });
  });

  describe("extract correct pot entries data from rows", () => {
    it("should return valid and populated data for pots", () => {
      const result = extractDataFromRows(
        validRows,
        "sqd_0123456789abcdef0123456789abcdef"
      );
      const tmntEntriesData = result as gridTmntEntryDataType;

      expect(tmntEntriesData.potEntries.length).toBe(5);
      for (let i = 0; i < tmntEntriesData.potEntries.length; i++) {
        expect(isValidBtDbId(tmntEntriesData.potEntries[i].id, "pen")).toBe(true);
        if (i === 0) {
          expect(tmntEntriesData.potEntries[i].player_id).toBe(validRows[0].id);
        } else if (i === 1) {
          expect(tmntEntriesData.potEntries[i].fee).toBe(
            mockDataOneTmnt.pots[0].fee
          );
          expect(tmntEntriesData.potEntries[i].player_id).toBe(validRows[2].id);
        } else if (i === 2) {
          expect(tmntEntriesData.potEntries[i].fee).toBe(
            mockDataOneTmnt.pots[1].fee
          );
          expect(tmntEntriesData.potEntries[i].player_id).toBe(validRows[2].id);
        } else if (i === 3) {
          expect(tmntEntriesData.potEntries[i].fee).toBe(
            mockDataOneTmnt.pots[0].fee
          );
          expect(tmntEntriesData.potEntries[i].player_id).toBe(validRows[3].id);
        } else if (i === 4) {
          expect(tmntEntriesData.potEntries[i].fee).toBe(
            mockDataOneTmnt.pots[1].fee
          );
          expect(tmntEntriesData.potEntries[i].player_id).toBe(validRows[3].id);
        }
      }
    });
  });

  describe("extract correct brkt entries data from rows", () => {
    it("should return valid and populated data for brkts", () => {
      const result = extractDataFromRows(
        validRows,
        "sqd_0123456789abcdef0123456789abcdef"
      );
      const tmntEntriesData = result as gridTmntEntryDataType;

      expect(tmntEntriesData.brktEntries.length).toBe(4);
      for (let i = 0; i < tmntEntriesData.brktEntries.length; i++) {
        expect(isValidBtDbId(tmntEntriesData.brktEntries[i].id, "ben")).toBe(
          true
        );
        if (i === 0) {
          expect(tmntEntriesData.brktEntries[i].brkt_id).toBe(
            mockDataOneTmnt.brkts[0].id
          );
          expect(tmntEntriesData.brktEntries[i].player_id).toBe(
            validRows[0].id
          );
          expect(tmntEntriesData.brktEntries[i].num_brackets).toBe(
            validRows[0][brkt1NumColName]
          );
          expect(tmntEntriesData.brktEntries[i].fee).toBe(
            validRows[0][brkt1FeeColName] + ""
          );
          expect(tmntEntriesData.brktEntries[i].time_stamp).toBe(
            validRows[0][brkt1TimeStartColName]
          );
        } else if (i === 1) {
          expect(tmntEntriesData.brktEntries[i].brkt_id).toBe(
            mockDataOneTmnt.brkts[1].id
          );
          expect(tmntEntriesData.brktEntries[i].player_id).toBe(
            validRows[0].id
          );
          expect(tmntEntriesData.brktEntries[i].num_brackets).toBe(
            validRows[0][brkt2NumColName]
          );
          expect(tmntEntriesData.brktEntries[i].fee).toBe(
            validRows[0][brkt2FeeColName] + ""
          );
          expect(tmntEntriesData.brktEntries[i].time_stamp).toBe(
            validRows[0][brkt2TimeStartColName]
          );
        } else if (i === 2) {
          expect(tmntEntriesData.brktEntries[i].brkt_id).toBe(
            mockDataOneTmnt.brkts[0].id
          );
          expect(tmntEntriesData.brktEntries[i].player_id).toBe(
            validRows[4].id
          );
          expect(tmntEntriesData.brktEntries[i].num_brackets).toBe(
            validRows[4][brkt1NumColName]
          );
          expect(tmntEntriesData.brktEntries[i].fee).toBe(
            validRows[4][brkt1FeeColName] + ""
          );
          expect(tmntEntriesData.brktEntries[i].time_stamp).toBe(
            validRows[4][brkt1TimeStartColName]
          );
        } else if (i === 3) {
          expect(tmntEntriesData.brktEntries[i].brkt_id).toBe(
            mockDataOneTmnt.brkts[1].id
          );
          expect(tmntEntriesData.brktEntries[i].player_id).toBe(
            validRows[4].id
          );
          expect(tmntEntriesData.brktEntries[i].num_brackets).toBe(
            validRows[4][brkt2NumColName]
          );
          expect(tmntEntriesData.brktEntries[i].fee).toBe(
            validRows[4][brkt2FeeColName] + ""
          );
          expect(tmntEntriesData.brktEntries[i].time_stamp).toBe(
            validRows[4][brkt2TimeStartColName]
          );
        }
      }
    });
  });

  describe("extract correct elim entries data from rows", () => {
    it("should return valid and populated data for elim", () => {
      const result = extractDataFromRows(
        validRows,
        "sqd_0123456789abcdef0123456789abcdef"
      );
      const tmntEntriesData = result as gridTmntEntryDataType;

      expect(tmntEntriesData.elimEntries.length).toBe(4);
      for (let i = 0; i < tmntEntriesData.elimEntries.length; i++) {
        expect(isValidBtDbId(tmntEntriesData.elimEntries[i].id, "een")).toBe(
          true
        );
        if (i === 0) {
          expect(tmntEntriesData.elimEntries[i].elim_id).toBe(
            mockDataOneTmnt.elims[0].id
          );
          expect(tmntEntriesData.elimEntries[i].player_id).toBe(
            validRows[0].id
          );
          expect(tmntEntriesData.elimEntries[i].fee).toBe(
            mockDataOneTmnt.elims[0].fee + ""
          );
        } else if (i === 1) {
          expect(tmntEntriesData.elimEntries[i].elim_id).toBe(
            mockDataOneTmnt.elims[1].id
          );
          expect(tmntEntriesData.elimEntries[i].player_id).toBe(
            validRows[0].id
          );
          expect(tmntEntriesData.elimEntries[i].fee).toBe(
            mockDataOneTmnt.elims[1].fee + ""
          );
        } else if (i === 2) {
          expect(tmntEntriesData.elimEntries[i].elim_id).toBe(
            mockDataOneTmnt.elims[0].id
          );
          expect(tmntEntriesData.elimEntries[i].player_id).toBe(
            validRows[5].id
          );
          expect(tmntEntriesData.elimEntries[i].fee).toBe(
            mockDataOneTmnt.elims[0].fee + ""
          );
        } else if (i === 3) {
          expect(tmntEntriesData.elimEntries[i].elim_id).toBe(
            mockDataOneTmnt.elims[1].id
          );
          expect(tmntEntriesData.elimEntries[i].player_id).toBe(
            validRows[5].id
          );
          expect(tmntEntriesData.elimEntries[i].fee).toBe(
            mockDataOneTmnt.elims[1].fee + ""
          );
        }
      }
    });
  });

  describe("extractFullBrktsData", () => { 

    const createMockBrktLists = (): BracketList[] => {
      const brktLists: BracketList[] = [];
      const brktList1 = new BracketList(
        brktId1,
        defaultPlayersPerMatch,
        defaultBrktGames,
      );
      const brkt1 = new Bracket(brktList1, brktId1);
      brkt1.addPlayer(playerId1);
      brkt1.addPlayer(playerId2);
      brkt1.addPlayer(playerId3);
      brkt1.addPlayer(playerId4);
      brkt1.addPlayer(playerId5);
      brkt1.addPlayer(playerId6);
      brkt1.addPlayer(playerId7);
      brkt1.addPlayer(playerId8);
      brktList1.brackets.push(brkt1);
      const brkt2 = new Bracket(brktList1, brktId1);
      brkt2.addPlayer(playerId1);
      brkt2.addPlayer(playerId2);
      brkt2.addPlayer(playerId3);
      brkt2.addPlayer(playerId4);
      brkt2.addPlayer(playerId5);
      brkt2.addPlayer(playerId6);
      brkt2.addPlayer(playerId7);
      brkt2.addPlayer(playerId8);
      brktList1.brackets.push(brkt2);
      brktLists.push(brktList1);

      const brktList2 = new BracketList(
        brktId2,
        defaultPlayersPerMatch,
        defaultBrktGames,
      );
      const brkt3 = new Bracket(brktList2, brktId2);
      brkt3.addPlayer(playerId1);
      brkt3.addPlayer(playerId2);
      brkt3.addPlayer(playerId3);
      brkt3.addPlayer(playerId4);
      brkt3.addPlayer(playerId5);
      brkt3.addPlayer(playerId6);
      brkt3.addPlayer(playerId7);
      brkt3.addPlayer(playerId8);
      brktList2.brackets.push(brkt3);
      const brkt4 = new Bracket(brktList2, brktId2);
      brkt4.addPlayer(playerId1);
      brkt4.addPlayer(playerId2);
      brkt4.addPlayer(playerId3);
      brkt4.addPlayer(playerId4);
      brkt4.addPlayer(playerId5);
      brkt4.addPlayer(playerId6);
      brkt4.addPlayer(playerId7);
      brkt4.addPlayer(playerId8);
      brktList2.brackets.push(brkt4);
      brktLists.push(brktList2);

      return brktLists;      
    }

    it("should return expected structure when passed valid mock data", () => {
      const mockLists = createMockBrktLists();
      const result = extractFullBrktsData(mockLists);

      expect(result).toHaveProperty("oneBrkts");
      expect(result).toHaveProperty("brktSeeds");
      expect(Array.isArray(result.oneBrkts)).toBe(true);
      expect(Array.isArray(result.brktSeeds)).toBe(true);
      expect(result.oneBrkts.length).toBe(4);
      expect(result.brktSeeds.length).toBe(32);

      expect(isValidBtDbId(result.oneBrkts[0].id, "obk")).toBe(true);
      expect(result.oneBrkts[0].brkt_id).toBe(brktId1);
      expect(result.oneBrkts[0].bindex).toBe(0);
      expect(isValidBtDbId(result.oneBrkts[1].id, "obk")).toBe(true);
      expect(result.oneBrkts[1].brkt_id).toBe(brktId1);
      expect(result.oneBrkts[1].bindex).toBe(1);
      expect(isValidBtDbId(result.oneBrkts[2].id, "obk")).toBe(true);
      expect(result.oneBrkts[2].brkt_id).toBe(brktId2);
      expect(result.oneBrkts[2].bindex).toBe(0);
      expect(isValidBtDbId(result.oneBrkts[3].id, "obk")).toBe(true);
      expect(result.oneBrkts[3].brkt_id).toBe(brktId2);
      expect(result.oneBrkts[3].bindex).toBe(1);

      expect(result.brktSeeds[0].one_brkt_id).toBe(result.oneBrkts[0].id);
      expect(result.brktSeeds[0].seed).toBe(0);
      expect(result.brktSeeds[0].player_id).toBe(playerId1);
      expect(result.brktSeeds[1].one_brkt_id).toBe(result.oneBrkts[0].id);
      expect(result.brktSeeds[1].seed).toBe(1);
      expect(result.brktSeeds[1].player_id).toBe(playerId2);
      expect(result.brktSeeds[2].one_brkt_id).toBe(result.oneBrkts[0].id);
      expect(result.brktSeeds[2].seed).toBe(2);
      expect(result.brktSeeds[2].player_id).toBe(playerId3);
      expect(result.brktSeeds[3].one_brkt_id).toBe(result.oneBrkts[0].id);
      expect(result.brktSeeds[3].seed).toBe(3);
      expect(result.brktSeeds[3].player_id).toBe(playerId4);
      expect(result.brktSeeds[4].one_brkt_id).toBe(result.oneBrkts[0].id);
      expect(result.brktSeeds[4].seed).toBe(4);
      expect(result.brktSeeds[4].player_id).toBe(playerId5);
      expect(result.brktSeeds[5].one_brkt_id).toBe(result.oneBrkts[0].id);
      expect(result.brktSeeds[5].seed).toBe(5);
      expect(result.brktSeeds[5].player_id).toBe(playerId6);
      expect(result.brktSeeds[6].one_brkt_id).toBe(result.oneBrkts[0].id);
      expect(result.brktSeeds[6].seed).toBe(6);
      expect(result.brktSeeds[6].player_id).toBe(playerId7);
      expect(result.brktSeeds[7].one_brkt_id).toBe(result.oneBrkts[0].id);
      expect(result.brktSeeds[7].seed).toBe(7);
      expect(result.brktSeeds[7].player_id).toBe(playerId8);

      expect(result.brktSeeds[8].one_brkt_id).toBe(result.oneBrkts[1].id);
      expect(result.brktSeeds[8].seed).toBe(0);
      expect(result.brktSeeds[8].player_id).toBe(playerId1);
      expect(result.brktSeeds[9].one_brkt_id).toBe(result.oneBrkts[1].id);
      expect(result.brktSeeds[9].seed).toBe(1);
      expect(result.brktSeeds[9].player_id).toBe(playerId2);
      expect(result.brktSeeds[10].one_brkt_id).toBe(result.oneBrkts[1].id);
      expect(result.brktSeeds[10].seed).toBe(2);
      expect(result.brktSeeds[10].player_id).toBe(playerId3);
      expect(result.brktSeeds[11].one_brkt_id).toBe(result.oneBrkts[1].id);
      expect(result.brktSeeds[11].seed).toBe(3);
      expect(result.brktSeeds[11].player_id).toBe(playerId4);
      expect(result.brktSeeds[12].one_brkt_id).toBe(result.oneBrkts[1].id);
      expect(result.brktSeeds[12].seed).toBe(4);
      expect(result.brktSeeds[12].player_id).toBe(playerId5);
      expect(result.brktSeeds[13].one_brkt_id).toBe(result.oneBrkts[1].id);
      expect(result.brktSeeds[13].seed).toBe(5);
      expect(result.brktSeeds[13].player_id).toBe(playerId6);
      expect(result.brktSeeds[14].one_brkt_id).toBe(result.oneBrkts[1].id);
      expect(result.brktSeeds[14].seed).toBe(6);
      expect(result.brktSeeds[14].player_id).toBe(playerId7);
      expect(result.brktSeeds[15].one_brkt_id).toBe(result.oneBrkts[1].id);
      expect(result.brktSeeds[15].seed).toBe(7);
      expect(result.brktSeeds[15].player_id).toBe(playerId8);

      expect(result.brktSeeds[16].one_brkt_id).toBe(result.oneBrkts[2].id);
      expect(result.brktSeeds[16].seed).toBe(0);
      expect(result.brktSeeds[16].player_id).toBe(playerId1);
      expect(result.brktSeeds[17].one_brkt_id).toBe(result.oneBrkts[2].id);
      expect(result.brktSeeds[17].seed).toBe(1);
      expect(result.brktSeeds[17].player_id).toBe(playerId2);
      expect(result.brktSeeds[18].one_brkt_id).toBe(result.oneBrkts[2].id);
      expect(result.brktSeeds[18].seed).toBe(2);
      expect(result.brktSeeds[18].player_id).toBe(playerId3);
      expect(result.brktSeeds[19].one_brkt_id).toBe(result.oneBrkts[2].id);
      expect(result.brktSeeds[19].seed).toBe(3);
      expect(result.brktSeeds[19].player_id).toBe(playerId4);
      expect(result.brktSeeds[20].one_brkt_id).toBe(result.oneBrkts[2].id);
      expect(result.brktSeeds[20].seed).toBe(4);
      expect(result.brktSeeds[20].player_id).toBe(playerId5);
      expect(result.brktSeeds[21].one_brkt_id).toBe(result.oneBrkts[2].id);
      expect(result.brktSeeds[21].seed).toBe(5);
      expect(result.brktSeeds[21].player_id).toBe(playerId6);
      expect(result.brktSeeds[22].one_brkt_id).toBe(result.oneBrkts[2].id);
      expect(result.brktSeeds[22].seed).toBe(6);
      expect(result.brktSeeds[22].player_id).toBe(playerId7);
      expect(result.brktSeeds[23].one_brkt_id).toBe(result.oneBrkts[2].id);
      expect(result.brktSeeds[23].seed).toBe(7);
      expect(result.brktSeeds[23].player_id).toBe(playerId8);

      expect(result.brktSeeds[24].one_brkt_id).toBe(result.oneBrkts[3].id);
      expect(result.brktSeeds[24].seed).toBe(0);
      expect(result.brktSeeds[24].player_id).toBe(playerId1);
      expect(result.brktSeeds[25].one_brkt_id).toBe(result.oneBrkts[3].id);
      expect(result.brktSeeds[25].seed).toBe(1);
      expect(result.brktSeeds[25].player_id).toBe(playerId2);
      expect(result.brktSeeds[26].one_brkt_id).toBe(result.oneBrkts[3].id);
      expect(result.brktSeeds[26].seed).toBe(2);
      expect(result.brktSeeds[26].player_id).toBe(playerId3);
      expect(result.brktSeeds[27].one_brkt_id).toBe(result.oneBrkts[3].id);
      expect(result.brktSeeds[27].seed).toBe(3);
      expect(result.brktSeeds[27].player_id).toBe(playerId4);
      expect(result.brktSeeds[28].one_brkt_id).toBe(result.oneBrkts[3].id);
      expect(result.brktSeeds[28].seed).toBe(4);
      expect(result.brktSeeds[28].player_id).toBe(playerId5);
      expect(result.brktSeeds[29].one_brkt_id).toBe(result.oneBrkts[3].id);
      expect(result.brktSeeds[29].seed).toBe(5);
      expect(result.brktSeeds[29].player_id).toBe(playerId6);
      expect(result.brktSeeds[30].one_brkt_id).toBe(result.oneBrkts[3].id);
      expect(result.brktSeeds[30].seed).toBe(6);
      expect(result.brktSeeds[30].player_id).toBe(playerId7);
      expect(result.brktSeeds[31].one_brkt_id).toBe(result.oneBrkts[3].id);
      expect(result.brktSeeds[31].seed).toBe(7);
      expect(result.brktSeeds[31].player_id).toBe(playerId8);
    });

    it("should return empty arrays when parameter is null", () => {
      const result = extractFullBrktsData(null as unknown as BracketList[]);
      expect(result).toEqual({
        oneBrkts: [],
        brktSeeds: [],
      });
    });
    it("should return empty arrays when parameter is not an array", () => {
      const result = extractFullBrktsData({} as unknown as BracketList[]);
      expect(result).toEqual({
        oneBrkts: [],
        brktSeeds: [],
      });
    });
    it("should return empty arrays when parameter is an empty array", () => {
      const result = extractFullBrktsData([]);
      expect(result).toEqual({
        oneBrkts: [],
        brktSeeds: [],
      });
    });
    it("should return empty arrays when an exception is thrown", () => {
      // simulate a malformed object that will throw when accessing brackets
      const badInput = [{ brackets: null }] as unknown as BracketList[];
      const result = extractFullBrktsData(badInput);
      expect(result).toEqual({
        oneBrkts: [],
        brktSeeds: [],
      });
    });
    // it("returns expected structure when passed valid mock data", () => {
    //   const mockLists = createMockBrktLists();
    //   const result = extractFullBrktsData(mockLists);

    //   expect(result).toHaveProperty("oneBrkts");
    //   expect(result).toHaveProperty("brktSeeds");
    //   expect(Array.isArray(result.oneBrkts)).toBe(true);
    //   expect(Array.isArray(result.brktSeeds)).toBe(true);
    //   expect(result.oneBrkts.length).toBeGreaterThan(0);
    //   expect(result.brktSeeds.length).toBeGreaterThan(0);
    // });
    // it("creates consistent one_brkt_id across seeds of the same bracket", () => {
    //   const mockLists = createMockBrktLists();
    //   const result = extractFullBrktsData(mockLists);

    //   // Every set of seeds in one bracket should share the same one_brkt_id
    //   const oneBrktIds = new Set(result.brktSeeds.map((s) => s.one_brkt_id));
    //   expect(oneBrktIds.size).toBe(result.oneBrkts.length);
    // });
    // it("calls btDbUuid for each bracket", () => {
    //   const mockLists = createMockBrktLists();
    //   extractFullBrktsData(mockLists);

    //   // Verify btDbUuid called once per bracket
    //   const totalBrkts = mockLists.reduce(
    //     (count, list) => count + list.brackets.length,
    //     0
    //   );
    //   expect(btDbUuid).toHaveBeenCalledTimes(totalBrkts);
    //   expect(btDbUuid).toHaveBeenCalledWith("obk");
    // });
    // it("handles multiple BracketLists and accumulates data correctly", () => {
    //   const mockLists = [...createMockBrktLists(), ...createMockBrktLists()];
    //   const result = extractFullBrktsData(mockLists);

    //   // Validate accumulation
    //   expect(result.oneBrkts.length).toBeGreaterThan(1);
    //   expect(result.brktSeeds.length).toBeGreaterThan(result.oneBrkts.length);
    // });    
  });
});
