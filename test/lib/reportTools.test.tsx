import {
  clipText,
  removeByePlayers,
  sortedDivsByOrder,
  sortedPlayersByLanePos,
  tmntHasHdcpDivs,
  tmntObjectHasData,
} from "@/lib/reportTools";
import {
  mockTmntFullData,
  mockByePlayer,
} from "../mocks/tmnts/tmntFullData/mockTmntFullData";

describe("reportTools", () => {

  describe("clipText", () => {

    it("should return original text when shorter than max length", () => {
      expect(clipText("Testing", 10)).toBe("Testing");
    });

    it("should return original text when equal to max length", () => {
      expect(clipText("Testing", 7)).toBe("Testing");
    });

    it("should clip text when longer than max length", () => {
      expect(clipText("Testing", 4)).toBe("Test");
    });

  });

  describe("removeByePlayers", () => {

    it("should remove bye players", () => {
      const players = [
        ...mockTmntFullData.players,
        mockByePlayer,
      ];

      const result = removeByePlayers(players);

      expect(result).toHaveLength(mockTmntFullData.players.length);
      expect(result.some(p => p.id.startsWith("bye"))).toBe(false);
    });

    it("should return original players when no bye player exists", () => {
      const result = removeByePlayers(mockTmntFullData.players);

      expect(result).toHaveLength(mockTmntFullData.players.length);
    });

    it("should return empty array for invalid input", () => {
      expect(removeByePlayers(null as never)).toEqual([]);
    });

  });

  describe("sortedDivsByOrder", () => {

    it("should sort divisions by sort_order", () => {
      const divs = [
        mockTmntFullData.divs[1], // order 2
        mockTmntFullData.divs[0], // order 1
      ];

      const result = sortedDivsByOrder(divs);

      expect(result[0].sort_order).toBe(1);
      expect(result[1].sort_order).toBe(2);
    });

    it("should return empty array for invalid input", () => {
      expect(sortedDivsByOrder(null as never)).toEqual([]);
    });

    it("should not modify original array", () => {
      const divs = [
        mockTmntFullData.divs[1],
        mockTmntFullData.divs[0],
      ];

      const original = [...divs];

      sortedDivsByOrder(divs);

      expect(divs).toEqual(original);
    });

  });

  describe("sortedPlayersByLanePos", () => {

    it("should sort players by lane then position", () => {
      const players = [
        mockTmntFullData.players[3], // lane 30 B
        mockTmntFullData.players[1], // lane 29 B
        mockTmntFullData.players[2], // lane 30 A
        mockTmntFullData.players[0], // lane 29 A
      ];

      const result = sortedPlayersByLanePos(players);

      expect(result[0].lane).toBe(29);
      expect(result[0].position).toBe("A");

      expect(result[1].lane).toBe(29);
      expect(result[1].position).toBe("B");

      expect(result[2].lane).toBe(30);
      expect(result[2].position).toBe("A");

      expect(result[3].lane).toBe(30);
      expect(result[3].position).toBe("B");
    });

    it("should return empty array for invalid input", () => {
      expect(sortedPlayersByLanePos(null as never)).toEqual([]);
    });

    it("should not modify original array", () => {
      const players = [
        mockTmntFullData.players[3],
        mockTmntFullData.players[0],
      ];

      const original = [...players];

      sortedPlayersByLanePos(players);

      expect(players).toEqual(original);
    });

  });

  describe("tmntHasHdcpDivs", () => {

    it("should return true when handicap division exists", () => {
      expect(tmntHasHdcpDivs(mockTmntFullData)).toBe(true);
    });

    it("should return false when no handicap divisions exist", () => {
      const tmnt = {
        ...mockTmntFullData,
        divs: mockTmntFullData.divs.map(div => ({
          ...div,
          hdcp_per: 0,
        })),
      };

      expect(tmntHasHdcpDivs(tmnt)).toBe(false);
    });

    it("should return false for invalid input", () => {
      expect(tmntHasHdcpDivs(null as never)).toBe(false);
    });

  });

  describe("tmntObjectHasData", () => {

    it("should return true for valid tournament data", () => {
      expect(tmntObjectHasData(mockTmntFullData)).toBe(true);
    });

    it("should return false when tmnt is missing", () => {
      const tmnt = {
        ...mockTmntFullData,
        tmnt: null,
      };

      expect(tmntObjectHasData(tmnt as never)).toBe(false);
    });

    it("should return false when events is missing", () => {
      const tmnt = {
        ...mockTmntFullData,
        events: null,
      };

      expect(tmntObjectHasData(tmnt as never)).toBe(false);
    });

    it("should return false when players is missing", () => {
      const tmnt = {
        ...mockTmntFullData,
        players: null,
      };

      expect(tmntObjectHasData(tmnt as never)).toBe(false);
    });

  });

});