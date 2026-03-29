import {
  isBrktData,
  isBrktDataFromPrisma,
  isBrktEntryData,
  isBrktRefund,
  isBrktSeed,
  isDivData,
  isDivEntryData,
  isElimData,
  isElimEntryData,
  isEventData,
  isFullBrktsData,
  isFullStageData,
  isHdcpForType,
  isLaneData,
  isOneBrkt,
  isPlayerData,
  isPotCategoryType,
  isPotData,
  isPotEntryData,
  isSquadData,
  isSquadStage,
  isTmntData,
} from "@/lib/validation/typeGuards";
import { SquadStage } from "@prisma/client";

describe("typeGuards", () => {
  describe("isHdcpForType", () => {
    it("returns true for valid HdcpForTypes", () => {
      expect(isHdcpForType("Game")).toBe(true);
      expect(isHdcpForType("Series")).toBe(true);
    });

    it("returns false for invalid HdcpForTypes", () => {
      expect(isHdcpForType("")).toBe(false);
      expect(isHdcpForType("game")).toBe(false);
      expect(isHdcpForType(1)).toBe(false);
      expect(isHdcpForType(null)).toBe(false);
    });
  });

  describe("isPotCategoryType", () => {
    it("returns true for valid potCategoriesTypes", () => {
      expect(isPotCategoryType("Game")).toBe(true);
      expect(isPotCategoryType("Last Game")).toBe(true);
      expect(isPotCategoryType("Series")).toBe(true);
      expect(isPotCategoryType("")).toBe(true);
    });

    it("returns false for invalid potCategoriesTypes", () => {
      expect(isPotCategoryType("Last")).toBe(false);
      expect(isPotCategoryType("game")).toBe(false);
      expect(isPotCategoryType(1)).toBe(false);
      expect(isPotCategoryType(null)).toBe(false);
    });
  });

  describe("isSquadStage", () => {
    it("returns true for valid SquadStage values", () => {
      expect(isSquadStage(SquadStage.DEFINE)).toBe(true);
      expect(isSquadStage(SquadStage.ENTRIES)).toBe(true);
      expect(isSquadStage(SquadStage.SCORES)).toBe(true);
      expect(isSquadStage(SquadStage.ERROR)).toBe(true);
    });

    it("returns false for invalid SquadStage values", () => {
      expect(isSquadStage("DEFINE ")).toBe(false);
      expect(isSquadStage("BAD_STAGE")).toBe(false);
      expect(isSquadStage(1)).toBe(false);
      expect(isSquadStage(null)).toBe(false);
    });
  });

  describe("isTmntData", () => {
    const validObj = {
      id: "tmt_123",
      tmnt_name: "Test Tournament",
      start_date: new Date("2025-01-01"),
      end_date: new Date("2025-01-02"),
      user_id: "usr_123",
      bowl_id: "bwl_123",
    };

    it("returns true for valid tmntDataType", () => {
      expect(isTmntData(validObj)).toBe(true);
    });

    it("returns false when a field is invalid", () => {
      expect(isTmntData({ ...validObj, start_date: "2025-01-01" })).toBe(false);
      expect(isTmntData({ ...validObj, end_date: null })).toBe(false);
      expect(isTmntData({ ...validObj, tmnt_name: 123 })).toBe(false);
    });

    it("returns false for non-objects", () => {
      expect(isTmntData(null)).toBe(false);
      expect(isTmntData([])).toBe(false);
      expect(isTmntData("x")).toBe(false);
    });
  });

  describe("isEventData", () => {
    const validObj = {
      tmnt_id: "tmt_123",
      event_name: "Singles",
      team_size: 1,
      games: 3,
      entry_fee: "50.00",
      lineage: "10.00",
      prize_fund: "30.00",
      other: "5.00",
      expenses: "5.00",
      added_money: "0.00",
      sort_order: 1,
      id: "evt_123",
    };

    it("returns true for valid eventDataType with id", () => {
      expect(isEventData(validObj)).toBe(true);
    });

    it("returns true for valid eventDataType without id", () => {
      const { id, ...withoutId } = validObj;
      expect(isEventData(withoutId)).toBe(true);
    });

    it("returns false when a field is invalid", () => {
      expect(isEventData({ ...validObj, team_size: "1" })).toBe(false);
      expect(isEventData({ ...validObj, sort_order: "1" })).toBe(false);
      expect(isEventData({ ...validObj, id: 123 })).toBe(false);
    });
  });

  describe("isDivData", () => {
    const validObj = {
      id: "div_123",
      tmnt_id: "tmt_123",
      div_name: "A Division",
      hdcp_per: 80,
      hdcp_from: 220,
      int_hdcp: true,
      hdcp_for: "Game" as const,
      sort_order: 1,
    };

    it("returns true for valid divDataType", () => {
      expect(isDivData(validObj)).toBe(true);
    });

    it("returns false when a field is invalid", () => {
      expect(isDivData({ ...validObj, int_hdcp: "true" })).toBe(false);
      expect(isDivData({ ...validObj, hdcp_for: "Bad" })).toBe(false);
      expect(isDivData({ ...validObj, hdcp_per: null })).toBe(false);
    });
  });

  describe("isSquadData", () => {
    const validObj = {
      id: "sqd_123",
      event_id: "evt_123",
      squad_name: "Morning Squad",
      games: 3,
      lane_count: 24,
      starting_lane: 1,
      squad_date: new Date("2025-02-01"),
      squad_time: "10:00",
      sort_order: 1,
    };

    it("returns true for valid squadDataType", () => {
      expect(isSquadData(validObj)).toBe(true);
    });

    it("returns true when squad_time is null", () => {
      expect(isSquadData({ ...validObj, squad_time: null })).toBe(true);
    });

    it("returns false when a field is invalid", () => {
      expect(isSquadData({ ...validObj, squad_date: "2025-02-01" })).toBe(false);
      expect(isSquadData({ ...validObj, squad_time: 1000 })).toBe(false);
      expect(isSquadData({ ...validObj, games: "3" })).toBe(false);
    });
  });

  describe("isFullStageData", () => {
    const validObj = {
      id: "stg_123",
      squad_id: "sqd_123",
      stage: SquadStage.DEFINE,
      stage_set_at: new Date("2025-02-01T10:00:00Z"),
      scores_started_at: null,
      stage_override_enabled: false,
      stage_override_at: null,
      stage_override_reason: "",
    };

    it("returns true for valid fullStageDataType", () => {
      expect(isFullStageData(validObj)).toBe(true);
    });

    it("returns true when nullable dates are actual dates", () => {
      expect(
        isFullStageData({
          ...validObj,
          scores_started_at: new Date("2025-02-01T11:00:00Z"),
          stage_override_at: new Date("2025-02-01T11:05:00Z"),
        })
      ).toBe(true);
    });

    it("returns false when a field is invalid", () => {
      expect(isFullStageData({ ...validObj, stage: "BAD_STAGE" })).toBe(false);
      expect(isFullStageData({ ...validObj, stage_set_at: "2025-02-01" })).toBe(false);
      expect(isFullStageData({ ...validObj, stage_override_enabled: "false" })).toBe(false);
    });
  });

  describe("isLaneData", () => {
    const validObj = {
      id: "lan_123",
      squad_id: "sqd_123",
      lane_number: 12,
      in_use: true,
    };

    it("returns true for valid laneDataType", () => {
      expect(isLaneData(validObj)).toBe(true);
    });

    it("returns false when a field is invalid", () => {
      expect(isLaneData({ ...validObj, lane_number: "12" })).toBe(false);
      expect(isLaneData({ ...validObj, in_use: "true" })).toBe(false);
    });
  });

  describe("isPotData", () => {
    const validObj = {
      id: "pot_123",
      div_id: "div_123",
      squad_id: "sqd_123",
      pot_type: "Game" as const,
      fee: "5.00",
      sort_order: 1,
    };

    it("returns true for valid potDataType", () => {
      expect(isPotData(validObj)).toBe(true);
    });

    it("returns false when a field is invalid", () => {
      expect(isPotData({ ...validObj, pot_type: "Bad Type" })).toBe(false);
      expect(isPotData({ ...validObj, sort_order: "1" })).toBe(false);
      expect(isPotData({ ...validObj, fee: 5 })).toBe(false);
    });
  });

  describe("isBrktData", () => {
    const validObj = {
      id: "brk_123",
      div_id: "div_123",
      squad_id: "sqd_123",
      fee: "10.00",
      start: 1,
      games: 3,
      players: 8,
      first: "60",
      second: "30",
      admin: "10",
      sort_order: 1,
    };

    it("returns true for valid brktDataType", () => {
      expect(isBrktData(validObj)).toBe(true);
    });

    it("returns false when a field is invalid", () => {
      expect(isBrktData({ ...validObj, players: "8" })).toBe(false);
      expect(isBrktData({ ...validObj, admin: 10 })).toBe(false);
    });
  });

  describe("isOneBrkt", () => {
    const validObj = {
      id: "obk_123",
      brkt_id: "brk_123",
      bindex: 0,
    };

    it("returns true for valid oneBrktType", () => {
      expect(isOneBrkt(validObj)).toBe(true);
    });

    it("returns false when a field is invalid", () => {
      expect(isOneBrkt({ ...validObj, bindex: "0" })).toBe(false);
      expect(isOneBrkt({ ...validObj, brkt_id: 123 })).toBe(false);
    });
  });

  describe("isBrktSeed", () => {
    const validObj = {
      one_brkt_id: "obk_123",
      seed: 1,
      player_id: "ply_123",
    };

    it("returns true for valid brktSeedType", () => {
      expect(isBrktSeed(validObj)).toBe(true);
    });

    it("returns false when a field is invalid", () => {
      expect(isBrktSeed({ ...validObj, seed: "1" })).toBe(false);
      expect(isBrktSeed({ ...validObj, player_id: null })).toBe(false);
    });
  });

  describe("isFullBrktsData", () => {
    const validObj = {
      oneBrkts: [
        { id: "obk_1", brkt_id: "brk_1", bindex: 0 },
        { id: "obk_2", brkt_id: "brk_1", bindex: 1 },
      ],
      brktSeeds: [
        { one_brkt_id: "obk_1", seed: 1, player_id: "ply_1" },
        { one_brkt_id: "obk_1", seed: 2, player_id: "ply_2" },
      ],
    };

    it("returns true for valid fullBrktsDataType", () => {
      expect(isFullBrktsData(validObj)).toBe(true);
    });

    it("returns false when oneBrkts contains invalid items", () => {
      expect(
        isFullBrktsData({
          ...validObj,
          oneBrkts: [{ id: "obk_1", brkt_id: "brk_1", bindex: "0" }],
        })
      ).toBe(false);
    });

    it("returns false when brktSeeds contains invalid items", () => {
      expect(
        isFullBrktsData({
          ...validObj,
          brktSeeds: [{ one_brkt_id: "obk_1", seed: "1", player_id: "ply_1" }],
        })
      ).toBe(false);
    });
  });

  describe("isElimData", () => {
    const validObj = {
      id: "elm_123",
      div_id: "div_123",
      squad_id: "sqd_123",
      fee: "10.00",
      start: 1,
      games: 3,
      sort_order: 1,
    };

    it("returns true for valid elimDataType", () => {
      expect(isElimData(validObj)).toBe(true);
    });

    it("returns false when a field is invalid", () => {
      expect(isElimData({ ...validObj, start: "1" })).toBe(false);
      expect(isElimData({ ...validObj, fee: 10 })).toBe(false);
    });
  });

  describe("isPlayerData", () => {
    const validObj = {
      id: "ply_123",
      squad_id: "sqd_123",
      first_name: "Eric",
      last_name: "Adolphson",
      average: 210,
      lane: 5,
      position: "1",
    };

    it("returns true for valid playerDataType with id", () => {
      expect(isPlayerData(validObj)).toBe(true);
    });

    it("returns true for valid playerDataType without id", () => {
      const { id, ...withoutId } = validObj;
      expect(isPlayerData(withoutId)).toBe(true);
    });

    it("returns false when a field is invalid", () => {
      expect(isPlayerData({ ...validObj, average: "210" })).toBe(false);
      expect(isPlayerData({ ...validObj, id: 123 })).toBe(false);
    });
  });

  describe("isDivEntryData", () => {
    const validObj = {
      id: "den_123",
      squad_id: "sqd_123",
      div_id: "div_123",
      player_id: "ply_123",
      fee: "50.00",
    };

    it("returns true for valid divEntryDataType", () => {
      expect(isDivEntryData(validObj)).toBe(true);
    });

    it("returns false when a field is invalid", () => {
      expect(isDivEntryData({ ...validObj, fee: 50 })).toBe(false);
      expect(isDivEntryData({ ...validObj, player_id: null })).toBe(false);
    });
  });

  describe("isPotEntryData", () => {
    const validObj = {
      id: "pen_123",
      pot_id: "pot_123",
      player_id: "ply_123",
      fee: "5.00",
    };

    it("returns true for valid potEntryDataType", () => {
      expect(isPotEntryData(validObj)).toBe(true);
    });

    it("returns false when a field is invalid", () => {
      expect(isPotEntryData({ ...validObj, pot_id: 1 })).toBe(false);
      expect(isPotEntryData({ ...validObj, fee: null })).toBe(false);
    });
  });

  describe("isBrktEntryData", () => {
    const validObj = {
      id: "ben_123",
      brkt_id: "brk_123",
      player_id: "ply_123",
      num_brackets: 2,
      num_refunds: 1,
      time_stamp: new Date("2025-03-01T10:00:00Z"),
    };

    it("returns true for valid brktEntryDataType shape", () => {
      expect(isBrktEntryData(validObj)).toBe(true);
    });

    it("returns false when a field is invalid", () => {
      expect(isBrktEntryData({ ...validObj, time_stamp: "2025-03-01" })).toBe(false);
      expect(isBrktEntryData({ ...validObj, num_brackets: "2" })).toBe(false);
    });
  });

  describe("isBrktRefund", () => {
    const validObj = {
      brkt_entry_id: "ben_123",
      num_refunds: 1,
    };

    it("returns true for valid brktRefundType", () => {
      expect(isBrktRefund(validObj)).toBe(true);
    });

    it("returns false when a field is invalid", () => {
      expect(isBrktRefund({ ...validObj, num_refunds: "1" })).toBe(false);
      expect(isBrktRefund({ ...validObj, brkt_entry_id: null })).toBe(false);
    });
  });

  describe("isElimEntryData", () => {
    const validObj = {
      id: "een_123",
      elim_id: "elm_123",
      player_id: "ply_123",
      fee: "10.00",
    };

    it("returns true for valid elimEntryDataType", () => {
      expect(isElimEntryData(validObj)).toBe(true);
    });

    it("returns false when a field is invalid", () => {
      expect(isElimEntryData({ ...validObj, elim_id: 1 })).toBe(false);
      expect(isElimEntryData({ ...validObj, fee: null })).toBe(false);
    });
  });

  describe("isBrktDataFromPrisma", () => {
    const validObj = {
      id: "brk_123",
      div_id: "div_123",
      squad_id: "sqd_123",
      fee: "10.00",
      start: 1,
      games: 3,
      players: 8,
      first: "60",
      second: "30",
      admin: "10",
      sort_order: 1,
      createdAt: "2025-03-01T10:00:00.000Z",
      updatedAt: "2025-03-01T11:00:00.000Z",
      brkt_entries: [],
      one_brkts: [],
    };

    it("returns true for valid brktDataFromPrismaType shape", () => {
      expect(isBrktDataFromPrisma(validObj)).toBe(true);
    });

    it("returns true even when nested arrays contain bad items because current guard only checks Array.isArray", () => {
      expect(
        isBrktDataFromPrisma({
          ...validObj,
          brkt_entries: [{ bad: true }],
          one_brkts: [{ bad: true }],
        })
      ).toBe(true);
    });

    it("returns false when a required prisma field is invalid", () => {
      expect(isBrktDataFromPrisma({ ...validObj, createdAt: new Date() })).toBe(false);
      expect(isBrktDataFromPrisma({ ...validObj, brkt_entries: "bad" })).toBe(false);
    });
  });
});