import {
  extractDataFromRows,
  setEditTypes,
  exportedForTesting,
} from "@/app/dataEntry/playersForm/extractData";
import {
  blankBrktEntry,
  blankElimEntry,
  blankPotEntry,
  initDivEntry,
  initPlayer,
} from "@/lib/db/initVals";
import {
  dataOneSquadEntriesType,
  editedOneSquadEntriesType,
  tmntEntryBrktEntryType,
  tmntEntryDivEntryType,
  tmntEntryElimEntryType,
  tmntEntryPlayerType,
  tmntEntryPotEntryType,
} from "@/lib/types/types";
import {
  mockPlayers,
  mockDivEntries,
  mockPotEntries,
  mockBrktEntries,
  mockElimEntries,
} from "../../../mocks/tmnts/newTmnt/mockNewTmnt";
import { validRows } from "../../../mocks/tmnts/playerEntries/mockPlayerEntries";
import { time } from "console";

const {
  setPlayerEditType,
  setDivEntryEditType,
  setPotEntryEditType,
  setBrktEntryEditType,
  setElimEntryEditType,
} = exportedForTesting;

describe("extractData", () => {
  describe("extractDataFromRows", () => {
    const squadId = "sqd_0123456789abcdef0123456789abcdef";

    it("should return valid and populated data", () => {
      const result = extractDataFromRows(validRows, squadId);
      const tmntEntriesData = result as dataOneSquadEntriesType;

      expect(tmntEntriesData.squadId).toBe(squadId);
      expect(tmntEntriesData.players.length).toBe(6);
      expect(tmntEntriesData.divEntries.length).toBe(5);
      expect(tmntEntriesData.potEntries.length).toBe(3);
      expect(tmntEntriesData.brktEntries.length).toBe(4);
      expect(tmntEntriesData.elimEntries.length).toBe(4);
    });
  });

  describe("setPlayerEditType", () => {
    it("should return just updated players", () => {
      const editedData = [
        {
          ...mockPlayers[0],
          average: 205,
        },
        {
          ...mockPlayers[1],
          position: "C",
        },
        {
          ...mockPlayers[2],
        },
        {
          ...mockPlayers[3],
        },
      ];

      const result = setPlayerEditType(mockPlayers, editedData);
      expect(result.length).toBe(2);
      const tePlayers: tmntEntryPlayerType[] = result;

      expect(tePlayers[0].eType).toBe("u");
      expect(tePlayers[0].average).toBe(205);
      expect(tePlayers[1].eType).toBe("u");
      expect(tePlayers[1].position).toBe("C");
    });
    it("should return just inserted players", () => {
      const editedData = [
        {
          ...mockPlayers[0],
        },
        {
          ...mockPlayers[1],
        },
        {
          ...mockPlayers[2],
        },
        {
          ...mockPlayers[3],
        },
        {
          ...initPlayer,
          id: "ply_000584582e7042bb95b4818ccdd9974c",
          squad_id: "sqd_1234ce5f80164830830a7157eb093396",
          first_name: "Art",
          last_name: "Green",
          average: 212,
          lane: 1,
          position: "C",
        },
        {
          ...initPlayer,
          id: "ply_000684582e7042bb95b4818ccdd9974c",
          squad_id: "sqd_1234ce5f80164830830a7157eb093396",
          first_name: "Ed",
          last_name: "Brown",
          average: 213,
          lane: 2,
          position: "C",
        },
      ];

      const result = setPlayerEditType(mockPlayers, editedData);
      expect(result.length).toBe(2);
      const tePlayers: tmntEntryPlayerType[] = result;

      expect(tePlayers[0].eType).toBe("i");
      expect(tePlayers[0].id).toBe(editedData[4].id);
      expect(tePlayers[1].eType).toBe("i");
      expect(tePlayers[1].id).toBe(editedData[5].id);
    });
    it("should return just deleted players", () => {
      const editedData = [
        {
          ...mockPlayers[0],
        },
        {
          ...mockPlayers[1],
        },
      ];

      const result = setPlayerEditType(mockPlayers, editedData);
      expect(result.length).toBe(2);
      const tePlayers: tmntEntryPlayerType[] = result;

      expect(tePlayers[0].eType).toBe("d");
      expect(tePlayers[0].id).toBe(mockPlayers[2].id);
      expect(tePlayers[1].eType).toBe("d");
      expect(tePlayers[1].id).toBe(mockPlayers[3].id);
    });
    it("should return updated, inserted and deleted players", () => {
      const editedData = [
        {
          ...mockPlayers[0],
          average: 205,
        },
        {
          ...mockPlayers[1],
          position: "C",
        },
        {
          ...initPlayer,
          id: "ply_000584582e7042bb95b4818ccdd9974c",
          squad_id: "sqd_1234ce5f80164830830a7157eb093396",
          first_name: "Art",
          last_name: "Green",
          average: 212,
          lane: 1,
          position: "C",
        },
        {
          ...initPlayer,
          id: "ply_000684582e7042bb95b4818ccdd9974c",
          squad_id: "sqd_1234ce5f80164830830a7157eb093396",
          first_name: "Ed",
          last_name: "Brown",
          average: 213,
          lane: 2,
          position: "C",
        },
      ];

      const result = setPlayerEditType(mockPlayers, editedData);
      expect(result.length).toBe(6);
      const tePlayers: tmntEntryPlayerType[] = result;

      expect(tePlayers[0].eType).toBe("d");
      expect(tePlayers[0].id).toBe(mockPlayers[2].id);
      expect(tePlayers[1].eType).toBe("d");
      expect(tePlayers[1].id).toBe(mockPlayers[3].id);

      expect(tePlayers[2].eType).toBe("u");
      expect(tePlayers[2].average).toBe(205);
      expect(tePlayers[3].eType).toBe("u");
      expect(tePlayers[3].position).toBe("C");

      expect(tePlayers[4].eType).toBe("i");
      expect(tePlayers[4].id).toBe(editedData[2].id);
      expect(tePlayers[5].eType).toBe("i");
      expect(tePlayers[5].id).toBe(editedData[3].id);
    });
  });

  describe("setDivEntryEditType", () => {
    const squadId = mockDivEntries[0].squad_id;

    it("should return just updated div entries", () => {
      const editedData = [
        {
          ...mockDivEntries[0],
          fee: "84",
        },
        {
          ...mockDivEntries[1],
          fee: "84",
        },
        {
          ...mockDivEntries[2],
        },
        {
          ...mockDivEntries[3],
        },
      ];

      const result = setDivEntryEditType(mockDivEntries, editedData, squadId);
      expect(result.length).toBe(2);
      const teDivEntries: tmntEntryDivEntryType[] = result;

      expect(teDivEntries[0].eType).toBe("u");
      expect(teDivEntries[0].fee).toBe("84");
      expect(teDivEntries[1].eType).toBe("u");
      expect(teDivEntries[1].fee).toBe("84");
    });
    it("should return just inserted div entries", () => {
      const editedData = [
        {
          ...mockDivEntries[0],
        },
        {
          ...mockDivEntries[1],
        },
        {
          ...mockDivEntries[2],
        },
        {
          ...mockDivEntries[3],
        },
        {
          ...initDivEntry,
          id: "den_05be0472be3d476ea1caa99dd05953fa",
          squad_id: "sqd_1234ce5f80164830830a7157eb093396",
          div_id: "div_000134e04e5e4885bbae79229d8b96e8",
          player_id: "ply_000584582e7042bb95b4818ccdd9974c",
          fee: "85",
        },
        {
          ...initDivEntry,
          id: "den_06be0472be3d476ea1caa99dd05953fa",
          squad_id: "sqd_1234ce5f80164830830a7157eb093396",
          div_id: "div_000134e04e5e4885bbae79229d8b96e8",
          player_id: "ply_000684582e7042bb95b4818ccdd9974c",
          fee: "85",
        },
      ];

      const result = setDivEntryEditType(mockDivEntries, editedData, squadId);
      expect(result.length).toBe(2);
      const teDivEntries: tmntEntryDivEntryType[] = result;

      expect(teDivEntries[0].eType).toBe("i");
      expect(teDivEntries[0].id).toBe(editedData[4].id);
      expect(teDivEntries[1].eType).toBe("i");
      expect(teDivEntries[1].id).toBe(editedData[5].id);
    });
    it("should return just deleted div entries", () => {
      const editedData = [
        {
          ...mockDivEntries[0],
        },
        {
          ...mockDivEntries[1],
        },
      ];

      const result = setDivEntryEditType(mockDivEntries, editedData, squadId);
      expect(result.length).toBe(2);
      const teDivEntries: tmntEntryDivEntryType[] = result;

      expect(teDivEntries[0].eType).toBe("d");
      expect(teDivEntries[0].id).toBe(mockDivEntries[2].id);
      expect(teDivEntries[1].eType).toBe("d");
      expect(teDivEntries[1].id).toBe(mockDivEntries[3].id);
    });
    it("should return updated, inserted and deleted div entries", () => {
      const editedData = [
        {
          ...mockDivEntries[0],
          fee: "84",
        },
        {
          ...mockDivEntries[1],
          fee: "84",
        },
        {
          ...initDivEntry,
          id: "den_05be0472be3d476ea1caa99dd05953fa",
          squad_id: "sqd_1234ce5f80164830830a7157eb093396",
          div_id: "div_000134e04e5e4885bbae79229d8b96e8",
          player_id: "ply_000584582e7042bb95b4818ccdd9974c",
          fee: "85",
        },
        {
          ...initDivEntry,
          id: "den_06be0472be3d476ea1caa99dd05953fa",
          squad_id: "sqd_1234ce5f80164830830a7157eb093396",
          div_id: "div_000134e04e5e4885bbae79229d8b96e8",
          player_id: "ply_000684582e7042bb95b4818ccdd9974c",
          fee: "85",
        },
      ];

      const result = setDivEntryEditType(mockDivEntries, editedData, squadId);
      expect(result.length).toBe(6);
      const teDivEntries: tmntEntryDivEntryType[] = result;

      expect(teDivEntries[0].eType).toBe("d");
      expect(teDivEntries[0].id).toBe(mockDivEntries[2].id);
      expect(teDivEntries[1].eType).toBe("d");
      expect(teDivEntries[1].id).toBe(mockDivEntries[3].id);

      expect(teDivEntries[2].eType).toBe("u");
      expect(teDivEntries[2].fee).toBe("84");
      expect(teDivEntries[3].eType).toBe("u");
      expect(teDivEntries[3].fee).toBe("84");

      expect(teDivEntries[4].eType).toBe("i");
      expect(teDivEntries[4].id).toBe(editedData[2].id);
      expect(teDivEntries[5].eType).toBe("i");
      expect(teDivEntries[5].id).toBe(editedData[3].id);
    });
  });

  describe("setPotEntryEditType()", () => {
    it("should return just updated pot entries", () => {
      const editedData = [
        {
          ...mockPotEntries[0],
          fee: "19",
        },
        {
          ...mockPotEntries[1],
          fee: "9",
        },
        {
          ...mockPotEntries[2],
        },
        {
          ...mockPotEntries[3],
        },
      ];

      const result = setPotEntryEditType(mockPotEntries, editedData);
      expect(result.length).toBe(2);
      const tePotEntries: tmntEntryPotEntryType[] = result;

      expect(tePotEntries[0].eType).toBe("u");
      expect(tePotEntries[0].fee).toBe("19");
      expect(tePotEntries[1].eType).toBe("u");
      expect(tePotEntries[1].fee).toBe("9");
    });
    it("should return just inserted pot entries", () => {
      const editedData = [
        {
          ...mockPotEntries[0],
        },
        {
          ...mockPotEntries[1],
        },
        {
          ...mockPotEntries[2],
        },
        {
          ...mockPotEntries[3],
        },
        {
          ...blankPotEntry,
          id: "pen_05be0472be3d476ea1caa99dd05953fa",
          player_id: "ply_000384582e7042bb95b4818ccdd9974c",
          pot_id: "pot_0001b02d761b4f5ab5438be84f642c3b",
          fee: "20",
        },
        {
          ...blankPotEntry,
          id: "pen_05be0472be3d476ea1caa99dd05953fa",
          player_id: "ply_000384582e7042bb95b4818ccdd9974c",
          pot_id: "pot_0002b02d761b4f5ab5438be84f642c3b",
          fee: "10",
        },
      ];

      const result = setPotEntryEditType(mockPotEntries, editedData);
      expect(result.length).toBe(2);
      const tePotEntries: tmntEntryPotEntryType[] = result;

      expect(tePotEntries[0].eType).toBe("i");
      expect(tePotEntries[0].pot_id).toBe(editedData[4].pot_id);
      expect(tePotEntries[0].player_id).toBe(editedData[4].player_id);
      expect(tePotEntries[1].eType).toBe("i");
      expect(tePotEntries[1].pot_id).toBe(editedData[5].pot_id);
      expect(tePotEntries[1].player_id).toBe(editedData[5].player_id);
    });
    it("should return just deleted pot entries", () => {
      const editedData = [
        {
          ...mockPotEntries[0],
        },
        {
          ...mockPotEntries[1],
        },
      ];

      const result = setPotEntryEditType(mockPotEntries, editedData);
      expect(result.length).toBe(2);
      const tePotEntries: tmntEntryPotEntryType[] = result;

      expect(tePotEntries[0].eType).toBe("d");
      expect(tePotEntries[0].pot_id).toBe(mockPotEntries[2].pot_id);
      expect(tePotEntries[0].player_id).toBe(mockPotEntries[2].player_id);
      expect(tePotEntries[1].eType).toBe("d");
      expect(tePotEntries[1].pot_id).toBe(mockPotEntries[3].pot_id);
      expect(tePotEntries[1].player_id).toBe(mockPotEntries[3].player_id);
    });
    it("should return updated, inserted and deleted pot entries", () => {
      const editedData = [
        {
          ...mockPotEntries[0],
          fee: "19",
        },
        {
          ...mockPotEntries[1],
          fee: "9",
        },
        {
          ...blankPotEntry,
          id: "pen_05be0472be3d476ea1caa99dd05953fa",
          player_id: "ply_000384582e7042bb95b4818ccdd9974c",
          pot_id: "pot_0001b02d761b4f5ab5438be84f642c3b",
          fee: "20",
        },
        {
          ...blankPotEntry,
          id: "pen_05be0472be3d476ea1caa99dd05953fa",
          player_id: "ply_000384582e7042bb95b4818ccdd9974c",
          pot_id: "pot_0002b02d761b4f5ab5438be84f642c3b",
          fee: "10",
        },
      ];

      const result = setPotEntryEditType(mockPotEntries, editedData);
      expect(result.length).toBe(6);
      const tePotEntries: tmntEntryPotEntryType[] = result;

      expect(tePotEntries[0].eType).toBe("d");
      expect(tePotEntries[0].pot_id).toBe(mockPotEntries[2].pot_id);
      expect(tePotEntries[0].player_id).toBe(mockPotEntries[2].player_id);
      expect(tePotEntries[1].eType).toBe("d");
      expect(tePotEntries[1].pot_id).toBe(mockPotEntries[3].pot_id);
      expect(tePotEntries[1].player_id).toBe(mockPotEntries[3].player_id);

      expect(tePotEntries[2].eType).toBe("u");
      expect(tePotEntries[2].fee).toBe("19");
      expect(tePotEntries[3].eType).toBe("u");
      expect(tePotEntries[3].fee).toBe("9");

      expect(tePotEntries[4].eType).toBe("i");
      expect(tePotEntries[4].pot_id).toBe(editedData[2].pot_id);
      expect(tePotEntries[4].player_id).toBe(editedData[2].player_id);
      expect(tePotEntries[5].eType).toBe("i");
      expect(tePotEntries[5].pot_id).toBe(editedData[3].pot_id);
      expect(tePotEntries[5].player_id).toBe(editedData[3].player_id);
    });
  });

  describe("setBrktEntryEditType", () => {
    const timeStamp = new Date().setDate(new Date().getDate() - 1);    

    it("should return just updated bracket entries", () => {
      const editedData = [
        {
          ...mockBrktEntries[0],
          num_brackets: 3,
          fee: "15",
          time_stamp: timeStamp,
        },
        {
          ...mockBrktEntries[1],
          num_brackets: 3,
          fee: "15",
          time_stamp: timeStamp,
        },
        {
          ...mockBrktEntries[2],
        },
        {
          ...mockBrktEntries[3],
        },
      ];

      const result = setBrktEntryEditType(mockBrktEntries, editedData);
      expect(result.length).toBe(2);
      const teBrktEntries: tmntEntryBrktEntryType[] = result;

      expect(teBrktEntries[0].eType).toBe("u");
      expect(teBrktEntries[0].num_brackets).toBe(3);
      expect(teBrktEntries[0].fee).toBe("15");
      expect(teBrktEntries[0].time_stamp).toBeGreaterThan(0);
      expect(teBrktEntries[1].eType).toBe("u");
      expect(teBrktEntries[1].num_brackets).toBe(3);
      expect(teBrktEntries[1].fee).toBe("15");
      expect(teBrktEntries[1].time_stamp).toBeGreaterThan(0);
      
    });
    it("should return just inserted bracket entries", () => {
      const editedData = [
        {
          ...mockBrktEntries[0],
        },
        {
          ...mockBrktEntries[1],
        },
        {
          ...mockBrktEntries[2],
        },
        {
          ...mockBrktEntries[3],
        },
        {
          ...blankBrktEntry,
          id: "ben_01ce0472be3d476ea1caa99dd05953fa",
          brkt_id: "brk_0001b54c2cc44ff9a3721de42c80c8c1",
          player_id: "ply_000384582e7042bb95b4818ccdd9974c",
          num_brackets: 4,
          fee: "20",
          time_stamp: timeStamp,
        },
        {
          ...blankBrktEntry,
          id: "ben_02ce0472be3d476ea1caa99dd05953fa",
          brkt_id: "brk_0002b54c2cc44ff9a3721de42c80c8c1",
          player_id: "ply_000384582e7042bb95b4818ccdd9974c",
          num_brackets: 4,
          fee: "20",
          time_stamp: timeStamp,
        },
      ];

      const result = setBrktEntryEditType(mockBrktEntries, editedData);
      expect(result.length).toBe(2);
      const teBrktEntries: tmntEntryBrktEntryType[] = result;

      expect(teBrktEntries[0].eType).toBe("i");
      expect(teBrktEntries[0].brkt_id).toBe(editedData[4].brkt_id);
      expect(teBrktEntries[0].player_id).toBe(editedData[4].player_id);
      expect(teBrktEntries[0].num_brackets).toBe(editedData[4].num_brackets);
      expect(teBrktEntries[0].fee).toBe(editedData[4].fee);
      expect(teBrktEntries[0].time_stamp).toBe(editedData[4].time_stamp);
      expect(teBrktEntries[1].eType).toBe("i");
      expect(teBrktEntries[1].brkt_id).toBe(editedData[5].brkt_id);
      expect(teBrktEntries[1].player_id).toBe(editedData[5].player_id);
      expect(teBrktEntries[1].num_brackets).toBe(editedData[5].num_brackets);
      expect(teBrktEntries[1].fee).toBe(editedData[5].fee);
      expect(teBrktEntries[1].time_stamp).toBe(timeStamp);
    });
    it("should return just deleted bracket entries", () => {
      const editedData = [
        {
          ...mockBrktEntries[0],
        },
        {
          ...mockBrktEntries[1],
        },
      ];

      const result = setBrktEntryEditType(mockBrktEntries, editedData);
      expect(result.length).toBe(2);
      const teBrktEntries: tmntEntryBrktEntryType[] = result;

      expect(teBrktEntries[0].eType).toBe("d");
      expect(teBrktEntries[0].brkt_id).toBe(mockBrktEntries[2].brkt_id);
      expect(teBrktEntries[0].player_id).toBe(mockBrktEntries[2].player_id);

      expect(teBrktEntries[1].eType).toBe("d");
      expect(teBrktEntries[1].brkt_id).toBe(mockBrktEntries[3].brkt_id);
      expect(teBrktEntries[1].player_id).toBe(mockBrktEntries[3].player_id);
    });
    it("should return updated, inserted and deleted bracket entries", () => {
      const editedData = [
        {
          ...mockBrktEntries[0],
          num_brackets: 3,
          fee: "15",
          time_stamp: timeStamp,
        },
        {
          ...mockBrktEntries[1],
          num_brackets: 3,
          fee: "15",
          time_stamp: timeStamp,
        },
        {
          ...blankBrktEntry,
          id: "ben_01ce0472be3d476ea1caa99dd05953fa",
          brkt_id: "brk_0001b54c2cc44ff9a3721de42c80c8c1",
          player_id: "ply_000384582e7042bb95b4818ccdd9974c",
          num_brackets: 4,
          fee: "20",
          time_stamp: timeStamp,          
        },
        {
          ...blankBrktEntry,
          id: "ben_02ce0472be3d476ea1caa99dd05953fa",
          brkt_id: "brk_0002b54c2cc44ff9a3721de42c80c8c1",
          player_id: "ply_000384582e7042bb95b4818ccdd9974c",
          num_brackets: 4,
          fee: "20",
          time_stamp: timeStamp,          
        },
      ];

      const result = setBrktEntryEditType(mockBrktEntries, editedData);
      expect(result.length).toBe(6);
      const teBrktEntries: tmntEntryBrktEntryType[] = result;

      expect(teBrktEntries[0].eType).toBe("d");
      expect(teBrktEntries[0].brkt_id).toBe(mockBrktEntries[2].brkt_id);
      expect(teBrktEntries[0].player_id).toBe(mockBrktEntries[2].player_id);      
      expect(teBrktEntries[1].eType).toBe("d");
      expect(teBrktEntries[1].brkt_id).toBe(mockBrktEntries[3].brkt_id);
      expect(teBrktEntries[1].player_id).toBe(mockBrktEntries[3].player_id);

      expect(teBrktEntries[2].eType).toBe("u");
      expect(teBrktEntries[2].num_brackets).toBe(3);
      expect(teBrktEntries[2].fee).toBe("15");
      expect(teBrktEntries[2].time_stamp).toBe(timeStamp);
      expect(teBrktEntries[3].eType).toBe("u");
      expect(teBrktEntries[3].num_brackets).toBe(3);
      expect(teBrktEntries[3].fee).toBe("15");
      expect(teBrktEntries[3].time_stamp).toBe(timeStamp);

      expect(teBrktEntries[4].eType).toBe("i");
      expect(teBrktEntries[4].brkt_id).toBe(editedData[2].brkt_id);
      expect(teBrktEntries[4].player_id).toBe(editedData[2].player_id);
      expect(teBrktEntries[5].eType).toBe("i");
      expect(teBrktEntries[5].brkt_id).toBe(editedData[3].brkt_id);
      expect(teBrktEntries[5].player_id).toBe(editedData[3].player_id);
    });
  });

  describe("setElimEntryEditType", () => {
    it("should return just updated elim entries", () => {
      const editedData = [
        {
          ...mockElimEntries[0],
          fee: "4",
        },
        {
          ...mockElimEntries[1],
          fee: "4",
        },
        {
          ...mockElimEntries[2],
        },
        {
          ...mockElimEntries[3],
        },
      ];

      const result = setElimEntryEditType(mockElimEntries, editedData);
      expect(result.length).toBe(2);
      const teElimEntries: tmntEntryElimEntryType[] = result;

      expect(teElimEntries[0].eType).toBe("u");
      expect(teElimEntries[0].fee).toBe("4");
      expect(teElimEntries[1].eType).toBe("u");
      expect(teElimEntries[1].fee).toBe("4");
    });
    it("should return just inserted elim entries", () => {
      const editedData = [
        {
          ...mockElimEntries[0],
        },
        {
          ...mockElimEntries[1],
        },
        {
          ...mockElimEntries[2],
        },
        {
          ...mockElimEntries[3],
        },
        {
          ...blankElimEntry,
          id: "een_04de0472be3d476ea1caa99dd05953fa",
          elim_id: "elm_000184582e7042bb95b4818ccdd9974c",
          player_id: "ply_000384582e7042bb95b4818ccdd9974c",
          fee: "5",
        },
        {
          ...blankElimEntry,
          id: "een_05de0472be3d476ea1caa99dd05953fa",
          elim_id: "elm_000284582e7042bb95b4818ccdd9974c",
          player_id: "ply_000384582e7042bb95b4818ccdd9974c",
          fee: "5",
        },
      ];

      const result = setElimEntryEditType(mockElimEntries, editedData);
      expect(result.length).toBe(2);
      const teElimEntries: tmntEntryElimEntryType[] = result;

      expect(teElimEntries[0].eType).toBe("i");
      expect(teElimEntries[0].fee).toBe("5");
      expect(teElimEntries[1].eType).toBe("i");
      expect(teElimEntries[1].fee).toBe("5");
    });
    it("should return just deleted elim entries", () => {
      const editedData = [
        {
          ...mockElimEntries[0],
        },
        {
          ...mockElimEntries[1],
        },
      ];

      const result = setElimEntryEditType(mockElimEntries, editedData);
      expect(result.length).toBe(2);
      const teElimEntries: tmntEntryElimEntryType[] = result;

      expect(teElimEntries[0].eType).toBe("d");
      expect(teElimEntries[0].elim_id).toBe(mockElimEntries[2].elim_id);
      expect(teElimEntries[0].player_id).toBe(mockElimEntries[2].player_id);
      expect(teElimEntries[1].eType).toBe("d");
      expect(teElimEntries[1].elim_id).toBe(mockElimEntries[3].elim_id);
      expect(teElimEntries[1].player_id).toBe(mockElimEntries[3].player_id);
    });
    it("should return just updated elim entries", () => {
      const editedData = [
        {
          ...mockElimEntries[0],
          fee: "4",
        },
        {
          ...mockElimEntries[1],
          fee: "4",
        },
        {
          ...blankElimEntry,
          id: "een_04de0472be3d476ea1caa99dd05953fa",
          elim_id: "elm_000184582e7042bb95b4818ccdd9974c",
          player_id: "ply_000384582e7042bb95b4818ccdd9974c",
          fee: "5",
        },
        {
          ...blankElimEntry,
          id: "een_05de0472be3d476ea1caa99dd05953fa",
          elim_id: "elm_000284582e7042bb95b4818ccdd9974c",
          player_id: "ply_000384582e7042bb95b4818ccdd9974c",
          fee: "5",
        },
      ];

      const result = setElimEntryEditType(mockElimEntries, editedData);
      expect(result.length).toBe(6);
      const teElimEntries: tmntEntryElimEntryType[] = result;

      expect(teElimEntries[0].eType).toBe("d");
      expect(teElimEntries[0].elim_id).toBe(mockElimEntries[2].elim_id);
      expect(teElimEntries[0].player_id).toBe(mockElimEntries[2].player_id);
      expect(teElimEntries[1].eType).toBe("d");
      expect(teElimEntries[1].elim_id).toBe(mockElimEntries[3].elim_id);
      expect(teElimEntries[1].player_id).toBe(mockElimEntries[3].player_id);

      expect(teElimEntries[2].eType).toBe("u");
      expect(teElimEntries[2].fee).toBe("4");
      expect(teElimEntries[3].eType).toBe("u");
      expect(teElimEntries[3].fee).toBe("4");

      expect(teElimEntries[4].eType).toBe("i");
      expect(teElimEntries[4].fee).toBe("5");
      expect(teElimEntries[4].elim_id).toBe(editedData[2].elim_id);
      expect(teElimEntries[4].player_id).toBe(editedData[2].player_id);
      expect(teElimEntries[5].eType).toBe("i");
      expect(teElimEntries[5].fee).toBe("5");
      expect(teElimEntries[5].elim_id).toBe(editedData[3].elim_id);
      expect(teElimEntries[5].player_id).toBe(editedData[3].player_id);
    });
  });

  describe("extractData", () => {
    const timeStamp = new Date().setDate(new Date().getDate() - 1);    
    const editedPlayerEntryData = [
      {
        ...mockPlayers[0],
        average: 205,
      },
      {
        ...mockPlayers[1],
        position: "C",
      },
      {
        ...initPlayer,
        id: "ply_000584582e7042bb95b4818ccdd9974c",
        squad_id: "sqd_1234ce5f80164830830a7157eb093396",
        first_name: "Art",
        last_name: "Green",
        average: 212,
        lane: 1,
        position: "C",
      },
      {
        ...initPlayer,
        id: "ply_000684582e7042bb95b4818ccdd9974c",
        squad_id: "sqd_1234ce5f80164830830a7157eb093396",
        first_name: "Ed",
        last_name: "Brown",
        average: 213,
        lane: 2,
        position: "C",
      },
    ];
    const editedDivEntryData = [
      {
        ...mockDivEntries[0],
        fee: "84",
      },
      {
        ...mockDivEntries[1],
        fee: "84",
      },
      {
        ...initDivEntry,
        id: "den_05be0472be3d476ea1caa99dd05953fa",
        squad_id: "sqd_1234ce5f80164830830a7157eb093396",
        div_id: "div_000134e04e5e4885bbae79229d8b96e8",
        player_id: "ply_000584582e7042bb95b4818ccdd9974c",
        fee: "85",
      },
      {
        ...initDivEntry,
        id: "den_06be0472be3d476ea1caa99dd05953fa",
        squad_id: "sqd_1234ce5f80164830830a7157eb093396",
        div_id: "div_000134e04e5e4885bbae79229d8b96e8",
        player_id: "ply_000684582e7042bb95b4818ccdd9974c",
        fee: "85",
      },
    ];
    const editedPotEntryData = [
      {
        ...mockPotEntries[0],
        fee: "19",
      },
      {
        ...mockPotEntries[1],
        fee: "9",
      },
      {
        ...blankPotEntry,
        id: "pen_05be0472be3d476ea1caa99dd05953fa",
        player_id: "ply_000384582e7042bb95b4818ccdd9974c",
        pot_id: "pot_0001b02d761b4f5ab5438be84f642c3b",
        fee: "20",
      },
      {
        ...blankPotEntry,
        id: "pen_05be0472be3d476ea1caa99dd05953fa",
        player_id: "ply_000384582e7042bb95b4818ccdd9974c",
        pot_id: "pot_0002b02d761b4f5ab5438be84f642c3b",
        fee: "10",
      },
    ];
    const editedBrktEntryData = [
      {
        ...mockBrktEntries[0],
        num_brackets: 3,
        fee: "15",
        time_stamp: timeStamp,
      },
      {
        ...mockBrktEntries[1],
        num_brackets: 3,
        fee: "15",
        time_stamp: timeStamp,
      },
      {
        ...blankBrktEntry,
        id: "ben_01ce0472be3d476ea1caa99dd05953fa",
        brkt_id: "brk_0001b54c2cc44ff9a3721de42c80c8c1",
        player_id: "ply_000384582e7042bb95b4818ccdd9974c",
        num_brackets: 4,
        fee: "20",
        time_stamp: timeStamp,        
      },
      {
        ...blankBrktEntry,
        id: "ben_02ce0472be3d476ea1caa99dd05953fa",
        brkt_id: "brk_0002b54c2cc44ff9a3721de42c80c8c1",
        player_id: "ply_000384582e7042bb95b4818ccdd9974c",
        num_brackets: 4,
        fee: "20",
        time_stamp: timeStamp,        
      },
    ];
    const editedElimEntryData = [
      {
        ...mockElimEntries[0],
        fee: "4",
      },
      {
        ...mockElimEntries[1],
        fee: "4",
      },
      {
        ...blankElimEntry,
        id: "een_04de0472be3d476ea1caa99dd05953fa",
        elim_id: "elm_000184582e7042bb95b4818ccdd9974c",
        player_id: "ply_000384582e7042bb95b4818ccdd9974c",
        fee: "5",
      },
      {
        ...blankElimEntry,
        id: "een_05de0472be3d476ea1caa99dd05953fa",
        elim_id: "elm_000284582e7042bb95b4818ccdd9974c",
        player_id: "ply_000384582e7042bb95b4818ccdd9974c",
        fee: "5",
      },
    ];

    const squadId = mockDivEntries[0].squad_id;
    const origData: dataOneSquadEntriesType = {
      squadId: squadId,
      players: mockPlayers,
      divEntries: mockDivEntries,
      potEntries: mockPotEntries,
      brktEntries: mockBrktEntries,
      elimEntries: mockElimEntries,
    };

    it("should return updated, inserted, and deleted data", () => {
      const editedData: dataOneSquadEntriesType = {
        squadId: squadId,
        players: editedPlayerEntryData,
        divEntries: editedDivEntryData,
        potEntries: editedPotEntryData,
        brktEntries: editedBrktEntryData,
        elimEntries: editedElimEntryData,
      };

      const result = setEditTypes(origData, editedData);
      const dataToSave = result as editedOneSquadEntriesType;

      expect(dataToSave.squadId).toBe(squadId);
      expect(dataToSave.players.length).toBe(6);
      expect(dataToSave.divEntries.length).toBe(6);
      expect(dataToSave.potEntries.length).toBe(6);
      expect(dataToSave.brktEntries.length).toBe(6);
      expect(dataToSave.elimEntries.length).toBe(6);
    });
    it("should return no updated data if no changes", () => {
      const result = setEditTypes(origData, origData);
      const dataToSave = result as editedOneSquadEntriesType;

      expect(dataToSave.squadId).toBe(squadId);
      expect(dataToSave.players.length).toBe(0);
      expect(dataToSave.divEntries.length).toBe(0);
      expect(dataToSave.potEntries.length).toBe(0);
      expect(dataToSave.brktEntries.length).toBe(0);
      expect(dataToSave.elimEntries.length).toBe(0);
    });
  });
});
