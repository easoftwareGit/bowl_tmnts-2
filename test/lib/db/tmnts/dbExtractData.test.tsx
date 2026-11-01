
import {
  blankBrktSeed,
  blankDiv,
  initBrkt,
  initDivEntry,
  initElim,
  initElimEntry,
  initEvent,
  initLane,
  initOneBrkt,
  initPlayer,
  initPot,
  initPotEntry,
  initSquad,
} from "@/lib/db/initVals";
import {
  extractBrktEntries,
  extractBrkts,
  extractBrktSeeds,
  extractDivEntries,
  extractDivs,
  extractElimEntries,
  extractElims,
  extractEvents,
  extractLanes,
  extractOneBrkts,
  extractPlayers,
  extractPotEntries,
  extractPots,
  extractSquads,
  extractTmntMoneys,
} from "@/lib/db/tmnts/dbExtractData";
import {
  brktDataFromPrismaType,
  brktEntryType,
  brktSeedType,
  brktType,
  divEntryType,
  elimEntryType,
  elimType,
  eventType,
  laneType,
  oneBrktType,
  playerType,
  potCategoriesTypes,
  potEntryType,
  potType,
  squadType,
} from "@/lib/types/types";
import {
  brktId1,
  divId1,
  divId2,
  elimId1,
  elimId2,
  eventId1,
  eventId2,
  laneId1,
  laneId2,
  oneBrktId1,  
  penId1,  
  penId2,  
  playerId1,  
  playerId2,  
  potId1,  
  potId2,  
  squadId1,
  squadId2,
  tmntId
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

describe('extractData', () => {

  describe("extractBrktEntries()", () => {
    
    it("should correctly map raw brktEntries to extractBrktEntries", () => {

      const rawBrktEntries: brktDataFromPrismaType = {
        id: "brk_1234567890abcdef1234567890abcdef",
        div_id: "div_1234567890abcdef1234567890abcdef",
        squad_id: "squ_1234567890abcdef1234567890abcdef",
        fee: "5",
        start: 1,
        games: 3,
        players: 8,
        first: "25",
        second: "10",
        admin: "5",
        sort_order: 1,
        createdAt: "2025-10-24T20:38:34.850Z",
        updatedAt: "2025-10-24T20:38:34.850Z",
        brkt_entries: [
          {
            id: "ben_1234567890abcdef1234567890abcdef",
            brkt_id: "brk_1234567890abcdef1234567890abcdef",
            player_id: "ply_1234567890abcdef1234567890abcdef",
            num_brackets: 10,
            time_stamp: "2026-03-19T01:45:18.741Z",
            createdAt: "2026-03-19T01:45:18.741Z",
            updatedAt: "2026-03-19T01:45:18.741Z",
            brkt_refunds: {
              brkt_entry_id: "ben_1234567890abcdef1234567890abcdef",
              num_refunds: 2,
              createdAt: "2026-03-19T01:45:18.741Z",
              updatedAt: "2026-03-19T01:45:18.741Z",
            },
          },
          {
            id: "ben_abcdef1234567890abcdef1234567890",
            brkt_id: "brk_1234567890abcdef1234567890abcdef",
            player_id: "ply_abcdef1234567890abcdef1234567890",
            num_brackets: 2,
            time_stamp: "2026-03-19T01:45:18.741Z",
            createdAt: "2026-03-19T01:45:18.741Z",
            updatedAt: "2026-03-19T01:45:18.741Z",
            brkt_refunds: null,
          }
        ],
        one_brkts: [],
      }

      const expectedBrktEntries: brktEntryType[] = [
        {
          id: "ben_1234567890abcdef1234567890abcdef",
          brkt_id: "brk_1234567890abcdef1234567890abcdef",
          player_id: "ply_1234567890abcdef1234567890abcdef",
          num_brackets: 10,
          time_stamp: 1773884718741,
          fee: "50",
          num_refunds: 2,
        },
        {
          id: "ben_abcdef1234567890abcdef1234567890",
          brkt_id: "brk_1234567890abcdef1234567890abcdef",
          player_id: "ply_abcdef1234567890abcdef1234567890",
          num_brackets: 2,
          time_stamp: 1773884718741,
          fee: "10",
          num_refunds: 0,
        }
      ]

      const result = extractBrktEntries(rawBrktEntries);
      expect(result).toEqual(expectedBrktEntries);
    });

    it("should correctly map raw brktEntries with timestamp is not a string date to extractBrktEntries", () => {

      const rawBrktEntries2: brktDataFromPrismaType = {
        id: "brk_1234567890abcdef1234567890abcdef",
        div_id: "div_1234567890abcdef1234567890abcdef",
        squad_id: "squ_1234567890abcdef1234567890abcdef",
        fee: "5",
        start: 1,
        games: 3,
        players: 8,
        first: "25",
        second: "10",
        admin: "5",
        sort_order: 1,
        createdAt: "2025-10-24T20:38:34.850Z",
        updatedAt: "2025-10-24T20:38:34.850Z",
        brkt_entries: [
          {
            id: "ben_1234567890abcdef1234567890abcdef",
            brkt_id: "brk_1234567890abcdef1234567890abcdef",
            player_id: "ply_1234567890abcdef1234567890abcdef",
            num_brackets: 10,
            time_stamp: "Time stamp",
            createdAt: "2026-03-19T01:45:18.741Z",
            updatedAt: "2026-03-19T01:45:18.741Z",
            brkt_refunds: null,
          },
        ],
        one_brkts: [],
      }

      const expectedBrktEntries: brktEntryType[] = [
        {
          id: "ben_1234567890abcdef1234567890abcdef",
          brkt_id: "brk_1234567890abcdef1234567890abcdef",
          player_id: "ply_1234567890abcdef1234567890abcdef",
          num_brackets: 10,
          time_stamp: 0,
          fee: "50",
          num_refunds: 0,
        },
      ]

      const result = extractBrktEntries(rawBrktEntries2);
      expect(result).toEqual(expectedBrktEntries);
    })

    it("should return an empty array when passed null", () => {
      const result = extractBrktEntries(null);
      expect(result).toEqual([]);
    });

    it("should return an empty array when passed non brktDataFromPrismaType", () => {

      const rawBrktEntries = {
        id: "brk_1234567890abcdef1234567890abcdef",
        div_id: "div_1234567890abcdef1234567890abcdef",
        squad_id: "squ_1234567890abcdef1234567890abcdef",
        fee: "5",
        start: 1,
        games: 3,        
        first: "25",
        second: "10",
        admin: "5",
        sort_order: 1,
        createdAt: "2025-10-24T20:38:34.850Z",
        updatedAt: "2025-10-24T20:38:34.850Z",
        brkt_entries: [
          {
            id: "ben_1234567890abcdef1234567890abcdef",
            brkt_id: "brk_1234567890abcdef1234567890abcdef",
            player_id: "ply_1234567890abcdef1234567890abcdef",
            num_brackets: 10,
            time_stamp: "Time stamp",
            createdAt: "2026-03-19T01:45:18.741Z",
            updatedAt: "2026-03-19T01:45:18.741Z",
            brkt_refunds: null,
          },
        ],
        one_brkts: [],
      }

      let result = extractBrktEntries("not an array");
      expect(result).toEqual([]);

      result = extractBrktEntries(rawBrktEntries);
      expect(result).toEqual([]);
    });
  });

  describe("extractBrkts()", () => {
    it("should return an empty array when given an empty array", () => {
      const result = extractBrkts([]);
      expect(result).toEqual([]);
    });
    it("should correctly map raw brkts to brktType", () => {
      const rawBrkts = [
        {
          ...initBrkt,
          id: "brk_123",
          div_id: "div_123",
          squad_id: "sqd_123",
          fee: "5",
          start: 1,
          games: 3,
          players: 8,
          first: "25",
          second: "10",
          admin: "5",
          sort_order: 1,
          extraField: "ignore me", // should be ignored
        },
      ];

      const result = extractBrkts(rawBrkts);

      const expected: brktType = {
        ...initBrkt,
        id: "brk_123",
        div_id: "div_123",
        squad_id: "sqd_123",
        fee: "5",
        start: 1,
        games: 3,
        players: 8,
        first: "25",
        second: "10",
        admin: "5",
        fsa: "40",
        sort_order: 1,
      };

      expect(result).toEqual([expected]);
    });
    it("should process multiple brkts", () => {
      const rawBrkts = [
        {
          ...initBrkt,
          id: "brk_123",
          div_id: "div_123",
          squad_id: "sqd_123",
          fee: "5",
          start: 1,
          games: 3,
          players: 8,
          first: "25",
          second: "10",
          admin: "5",
          sort_order: 1,
        },
        {
          ...initBrkt,
          id: "brk_124",
          div_id: "div_123",
          squad_id: "sqd_123",
          fee: "5",
          start: 4,
          games: 3,
          players: 8,
          first: "25",
          second: "10",
          admin: "5",
          sort_order: 2,
        },
      ];

      const result = extractBrkts(rawBrkts);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("brk_123");
      expect(result[0].start).toBe(1);
      expect(result[1].id).toBe("brk_124");
      expect(result[1].start).toBe(4);
    });
    it("should return empty array when given null", () => {
      const result = extractBrkts(null);
      expect(result).toEqual([]);
    });
    it("should return empty array when given non-array", () => {
      const result = extractBrkts("not an array");
      expect(result).toEqual([]);
    });
  });
  
  describe("extractBrktSeeds", () => {
    it("should return an empty array when given an empty array", () => {
      const result = extractBrktSeeds([]);
      expect(result).toEqual([]);
    });

    it("should correctly map raw brktSeeds to brktSeedType", () => {
      const rawBrktSeeds = [
        {
          one_brkt_id: "obk_b0b2bc5682f042269cf0aaa8c32b25b8",
          seed: 0,
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          extraField: "ignore me",
        },
      ];

      const result = extractBrktSeeds(rawBrktSeeds);

      const expected: brktSeedType = {
        ...blankBrktSeed,
        one_brkt_id: "obk_b0b2bc5682f042269cf0aaa8c32b25b8",
        seed: 0,
        player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
      };

      expect(result).toEqual([expected]);
    });

    it("should process multiple brktSeeds", () => {
      const rawBrktSeeds = [
        {
          one_brkt_id: "obk_b0b2bc5682f042269cf0aaa8c32b25b8",
          seed: 0,
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
        },
        {
          one_brkt_id: "obk_b0b2bc5682f042269cf0aaa8c32b25b8",
          seed: 1,
          player_id: "ply_12be0472be3d476ea1caa99dd05953fa",
        },
      ];

      const result = extractBrktSeeds(rawBrktSeeds);

      expect(result).toHaveLength(2);
      expect(result[0].seed).toBe(0);
      expect(result[1].seed).toBe(1);
    });

    it("should return an empty array when given null", () => {
      const result = extractBrktSeeds(null);
      expect(result).toEqual([]);
    });

    it("should return an empty array when given non-array", () => {
      const result = extractBrktSeeds("not an array");
      expect(result).toEqual([]);
    });
  });

  describe("extractDivEntries", () => {
    it("should correctly map raw divEntries to divEntryType", () => {
      const rawDivEntries = [
        {
          div: {
            hdcp_from: 230,
            hdcp_per: 0.9,
            int_hdcp: true,
          },
          player: {
            average: 211,
          },
          id: "den_652fc6c5556e407291c4b5666b2dccd7",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: "80",
          extraField: "ignore me",
        },
      ];

      const result = extractDivEntries(rawDivEntries);

      const expected: divEntryType = {
        ...initDivEntry,
        id: "den_652fc6c5556e407291c4b5666b2dccd7",
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
        fee: "80",
        hdcp: 17,
      };

      expect(result).toEqual([expected]);
    });

    it("should fill missing fields with defaults from blankDivEntries", () => {
      const rawDivEntries = [
        {
          div: {
            hdcp_from: 230,
            hdcp_per: 0.9,
            int_hdcp: true,
          },
          player: {
            average: 211,
          },
          id: "den_652fc6c5556e407291c4b5666b2dccd7",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: "80",
        },
      ];

      const result = extractDivEntries(rawDivEntries);

      expect(result[0].squad_id_err).toBe("");
      expect(result[0].div_id_err).toBe("");
      expect(result[0].player_id_err).toBe("");
      expect(result[0].player_id_err).toBe("");
    });

    it("should process multiple divEntries", () => {
      const rawDivEntries = [
        {
          div: {
            hdcp_from: 230,
            hdcp_per: 0.9,
            int_hdcp: true,
          },
          player: {
            average: 211,
          },
          id: "den_652fc6c5556e407291c4b5666b2dccd7",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: "80",
        },
        {
          div: {
            hdcp_from: 230,
            hdcp_per: 0.9,
            int_hdcp: true,
          },
          player: {
            average: 215,
          },
          id: "den_752fc6c5556e407291c4b5666b2dccd7",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          player_id: "ply_99be0472be3d476ea1caa99dd05953fa",
          fee: "80",
        },
      ];

      const result = extractDivEntries(rawDivEntries);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("den_652fc6c5556e407291c4b5666b2dccd7");
      expect(result[0].player_id).toBe("ply_88be0472be3d476ea1caa99dd05953fa");
      expect(result[0].hdcp).toBe(17);
      expect(result[1].id).toBe("den_752fc6c5556e407291c4b5666b2dccd7");
      expect(result[1].player_id).toBe("ply_99be0472be3d476ea1caa99dd05953fa");
      expect(result[1].hdcp).toBe(13);
    });

    it("should return an empty array when passed an empty array", () => {
      const result = extractDivEntries([]);
      expect(result).toEqual([]);
    });

    it("should return an empty array when passed null", () => {
      const result = extractDivEntries(null);
      expect(result).toEqual([]);
    });

    it("should return an empty when passed non array", () => {
      const result = extractDivEntries("not an array" as any);
      expect(result).toEqual([]);
    });
  });

  describe("extractDivs", () => {
    it("should map a single div correctly", () => {
      const rawDivs = [
        {
          id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          tmnt_id: tmntId,
          div_name: "Division A",
          hdcp_per: 0.75,
          hdcp_from: 230,
          int_hdcp: true,
          hdcp_for: "Game",
          sort_order: 1,
          extraField: "ignore me",
        },
      ];

      const result = extractDivs(rawDivs);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ...blankDiv,
        id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        tmnt_id: tmntId,
        div_name: "Division A",
        tab_title: "Division A",
        hdcp_per: 0.75,
        hdcp_per_str: "75.00",
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 1,
      });
    });

    it("should process multiple divs", () => {
      const rawDivs = [
        {
          id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          tmnt_id: tmntId,
          div_name: "Division A",
          hdcp_per: 0.75,
          hdcp_from: 230,
          int_hdcp: true,
          hdcp_for: "Game",
          sort_order: 1,
          extraField: "ignore me",
        },
        {
          id: "div_030aea2c534f4cfe87f4315531cef8ef",
          tmnt_id: tmntId,
          div_name: "Division B",
          hdcp_per: 0,
          hdcp_from: 230,
          int_hdcp: true,
          hdcp_for: "Game",
          sort_order: 2,
          extraField: "ignore me",
        },
      ];

      const result = extractDivs(rawDivs);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("div_f30aea2c534f4cfe87f4315531cef8ef");
      expect(result[0].div_name).toBe("Division A");
      expect(result[0].hdcp_per).toBe(0.75);

      expect(result[1].id).toBe("div_030aea2c534f4cfe87f4315531cef8ef");
      expect(result[1].div_name).toBe("Division B");
      expect(result[1].hdcp_per).toBe(0);
    });

    it("should return empty array when passed empty array", () => {
      const result = extractDivs([]);
      expect(result).toEqual([]);
    });

    it("should return empty array when passed null", () => {
      const result = extractDivs(null as any);
      expect(result).toEqual([]);
    });

    it("should return empty array when passed non array", () => {
      const result = extractDivs("not an array" as any);
      expect(result).toEqual([]);
    });
  });

  describe("extractElimEntries", () => {
    it("should return an empty array when given an empty array", () => {
      const result = extractElimEntries([]);
      expect(result).toEqual([]);
    });

    it("should correctly map raw elimEntries to elimEntriesType", () => {
      const rawElimEntries = [
        {
          id: "een_23d6f8f1de844604a8828d4bb8a5a910",
          elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: 5,
          extraField: "ignore me",
        },
      ];

      const result = extractElimEntries(rawElimEntries);

      const expected: elimEntryType = {
        ...initElimEntry,
        id: "een_23d6f8f1de844604a8828d4bb8a5a910",
        elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
        player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
        fee: "5",
      };

      expect(result).toEqual([expected]);
    });

    it("should fill missing fields with defaults from blankElimEntry", () => {
      const rawElimEntries = [
        {
          id: "een_23d6f8f1de844604a8828d4bb8a5a910",
          elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: 5,
        },
      ];

      const result = extractElimEntries(rawElimEntries);

      expect(result[0].elim_id_err).toBe("");
      expect(result[0].player_id_err).toBe("");
      expect(result[0].fee_err).toBe("");
    });

    it("should process multiple players", () => {
      const rawElimEntries = [
        {
          id: "een_23d6f8f1de844604a8828d4bb8a5a910",
          elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: 5,
        },
        {
          id: "een_23d6f8f1de844604a8828d4bb8a5a910",
          elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
          player_id: "ply_99be0472be3d476ea1caa99dd05953fa",
          fee: 5,
        },
      ];

      const result = extractElimEntries(rawElimEntries);

      expect(result).toHaveLength(2);
      expect(result[0].player_id).toBe("ply_88be0472be3d476ea1caa99dd05953fa");
      expect(result[1].player_id).toBe("ply_99be0472be3d476ea1caa99dd05953fa");
    });

    it("should return an empty array when given null", () => {
      const result = extractElimEntries(null);
      expect(result).toEqual([]);
    });

    it("should return an empty array when given a non-array", () => {
      const result = extractElimEntries("not an array");
      expect(result).toEqual([]);
    });
  });

  describe("extractElims", () => {
    it("should return an empty array when given an empty array", () => {
      const result = extractElims([]);
      expect(result).toEqual([]);
    });

    it("should correctly map raw elims to elimType", () => {
      const rawElims = [
        {
          id: elimId1,
          squad_id: squadId1,
          div_id: divId1,
          sort_order: 1,
          start: 1,
          games: 3,
          fee: '5',
          extraField: "ignore me", // should be ignored
        },
      ];

      const result = extractElims(rawElims);

      const expected: elimType = {
        ...initElim,
        id: elimId1,
        squad_id: squadId1,
        div_id: divId1,
        sort_order: 1,
        start: 1,
        games: 3,
        fee: '5',
      };

      expect(result).toEqual([expected]);
    });

    it("should process multiple elims", () => {
      const rawElims = [
        {
          id: elimId1,
          squad_id: squadId1,
          div_id: divId1,
          sort_order: 1,
          start: 1,
          games: 3,
          fee: '5',
        },
        {
          id: elimId2, // change the id
          squad_id: squadId1,
          div_id: divId1,
          sort_order: 2, // change the sort order
          start: 4, // change the start               
          games: 3,
          fee: '5',
        },
      ];

      const result = extractElims(rawElims);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(elimId1);
      expect(result[0].start).toBe(1);
      expect(result[0].sort_order).toBe(1);
      expect(result[1].id).toBe(elimId2);
      expect(result[1].start).toBe(4);
      expect(result[1].sort_order).toBe(2);
    });
    it('should return an empty array when given null', () => {
      const result = extractElims(null);
      expect(result).toEqual([]);
    });
    it('should return an empty array when given non-array', () => {
      const result = extractElims('not an array');
      expect(result).toEqual([]);
    });
  });

  describe("extractEvents()", () => {
    it("should return an empty array of events when given an empty array", () => {
      const result = extractEvents([]);
      expect(result).toEqual([]);
    });

    it("should correctly extract events when given an array of events", () => {
      const rawEvents = [
        {
          ...initEvent,
          id: eventId1,
          tmnt_id: tmntId,
          event_name: "Test Event",
          team_size: 1,
          games: 5,
          entry_fee: "100",
          lineage: "15",
          prize_fund: "78",
          other: "2",
          expenses: "5",
          added_money: "0",
          lpox: "100",
          sort_order: 1,
          extraField: "ignore me",
        },
      ];

      const result = extractEvents(rawEvents);

      const expectedEvent: eventType = {
        ...initEvent,
        id: eventId1,
        tmnt_id: tmntId,
        event_name: "Test Event",
        tab_title: "Test Event",
        team_size: 1,
        games: 5,
        entry_fee: "100",
        lineage: "15",
        prize_fund: "78",
        other: "2",
        expenses: "5",
        added_money: "0",
        lpox: "100",
        sort_order: 1,
      };

      expect(result).toEqual([expectedEvent]);
    });

    it("should process multiple events correctly", () => {
      const rawEvents = [
        {
          ...initEvent,
          id: eventId1,
          tmnt_id: tmntId,
          event_name: "Test Event",
          team_size: 1,
          games: 5,
          entry_fee: "100",
          lineage: "15",
          prize_fund: "78",
          other: "2",
          expenses: "5",
          added_money: "0",
          lpox: "100",
          sort_order: 1,
          extraField: "ignore me",
        },
        {
          ...initEvent,
          id: eventId2,
          tmnt_id: tmntId,
          event_name: "Test Event 2",
          team_size: 2,
          games: 5,
          entry_fee: "200",
          lineage: "30",
          prize_fund: "156",
          other: "4",
          expenses: "10",
          added_money: "0",
          lpox: "200",
          sort_order: 2,
          extraField: "ignore me",
        },
      ];

      const result = extractEvents(rawEvents);

      expect(result).toHaveLength(2);

      expect(result[0].id).toBe(eventId1);
      expect(result[0].event_name).toBe("Test Event");
      expect(result[0].team_size).toBe(1);
      expect(result[0].entry_fee).toBe("100");
      expect(result[0].lineage).toBe("15");
      expect(result[0].prize_fund).toBe("78");
      expect(result[0].other).toBe("2");
      expect(result[0].expenses).toBe("5");
      expect(result[0].lpox).toBe("100");
      expect(result[0].sort_order).toBe(1);

      expect(result[1].id).toBe(eventId2);
      expect(result[1].event_name).toBe("Test Event 2");
      expect(result[1].team_size).toBe(2);
      expect(result[1].entry_fee).toBe("200");
      expect(result[1].lineage).toBe("30");
      expect(result[1].prize_fund).toBe("156");
      expect(result[1].other).toBe("4");
      expect(result[1].expenses).toBe("10");
      expect(result[1].lpox).toBe("200");
      expect(result[1].sort_order).toBe(2);
    });

    it("should return an empty array when given null", () => {
      const result = extractEvents(null);
      expect(result).toEqual([]);
    });

    it("should return an empty array when given a non-array", () => {
      const result = extractEvents("not an array");
      expect(result).toEqual([]);
    });
  });

  describe("extractLanes()", () => {
    it("should return an empty array when given an empty array", () => {
      const squads = extractLanes([]);
      expect(squads).toEqual([]);
    });

    it("should correctly extract lanes when given array of lanes", () => {
      const rawLanes = [
        {
          id: laneId1,
          squad_id: squadId1,
          lane_number: 1,
          in_use: true,
          extraField: "ignore me",
        },
      ];

      const result = extractLanes(rawLanes);

      const expectedLane: laneType = {
        ...initLane,
        id: laneId1,
        squad_id: squadId1,
        lane_number: 1,
        in_use: true,
      };

      expect(result).toEqual([expectedLane]);
    });

    it("should replace multiple lanes corectly", () => {
      const rawLanes = [
        {
          id: laneId1,
          squad_id: squadId1,
          lane_number: 1,
          in_use: true,
          extraField: "ignore me",
        },
        {
          id: laneId2,
          squad_id: squadId1,
          lane_number: 2,
          in_use: true,
          extraField: "ignore me",
        },
      ];

      const result = extractLanes(rawLanes);

      expect(result).toHaveLength(2);
      expect(result[0].id).toEqual(laneId1);
      expect(result[0].lane_number).toEqual(1);
      expect(result[1].id).toEqual(laneId2);
      expect(result[1].lane_number).toEqual(2);
    });

    it("should return an empty array when given null", () => {
      const result = extractLanes(null);
      expect(result).toEqual([]);
    });

    it("should return an empty array when given a non-array", () => {
      const result = extractLanes("not an array");
      expect(result).toEqual([]);
    });
  });

  describe("extractOneBrkts", () => {
    it("should return an empty array when given an empty array", () => {
      const result = extractOneBrkts([]);
      expect(result).toEqual([]);
    });

    it("should correctly map raw oneBrkts to extractOneBrkts", () => {
      const rawOneBrkt = [
        {
          id: oneBrktId1,
          brkt_id: brktId1,
          bindex: 0,
          extraField: "ignore me",
        },
      ];

      const result = extractOneBrkts(rawOneBrkt);

      const expected: oneBrktType = {
        ...initOneBrkt,
        id: oneBrktId1,
        brkt_id: brktId1,
        bindex: 0,
      };

      expect(result).toEqual([expected]);
    });

    it("should process multiple oneBrkts", () => {
      const rawOneBrkt = [
        {
          id: oneBrktId1,
          brkt_id: brktId1,
          bindex: 0,
        },
        {
          id: oneBrktId1,
          brkt_id: brktId1,
          bindex: 1,
        },
      ];

      const result = extractOneBrkts(rawOneBrkt);

      expect(result).toHaveLength(2);
      expect(result[0].bindex).toBe(0);
      expect(result[1].bindex).toBe(1);
    });

    it("should return an empty array when given null", () => {
      const result = extractOneBrkts(null);
      expect(result).toEqual([]);
    });

    it("should return an empty array when given a non array", () => {
      const result = extractOneBrkts("not an array");
      expect(result).toEqual([]);
    });
  });

  describe("extractPlayers", () => {
    it("should return an empty array when given an empty array", () => {
      const result = extractPlayers([]);
      expect(result).toEqual([]);
    });

    it("should correctly map raw players to playerType", () => {
      const rawPlayers = [
        {
          id: playerId1,
          squad_id: squadId1,
          first_name: "John",
          last_name: "Doe",
          average: 200,
          lane: 12,
          position: "A",
          extraField: "ignore me",
        },
      ];

      const result = extractPlayers(rawPlayers);

      const expected: playerType = {
        ...initPlayer,
        id: playerId1,
        squad_id: squadId1,
        first_name: "John",
        last_name: "Doe",
        average: 200,
        lane: 12,
        position: "A",
      };

      expect(result).toEqual([expected]);
    });

    it("should fill missing fields with defaults from blankPlayer", () => {
      const rawPlayers = [
        {
          id: playerId1,
          squad_id: squadId1,
          first_name: "Alice",
          last_name: "Smith",
          average: 180,
          lane: 5,
          position: "B",
        },
      ];

      const result = extractPlayers(rawPlayers);

      expect(result[0].first_name_err).toBe("");
      expect(result[0].last_name_err).toBe("");
      expect(result[0].average_err).toBe("");
      expect(result[0].lane_err).toBe("");
      expect(result[0].position_err).toBe("");
    });

    it("should process multiple players", () => {
      const rawPlayers = [
        {
          id: playerId1,
          squad_id: squadId1,
          first_name: "Bob",
          last_name: "Lee",
          average: 190,
          lane: 1,
          position: "C",
        },
        {
          id: playerId2,
          squad_id: squadId1,
          first_name: "Carol",
          last_name: "White",
          average: 170,
          lane: 2,
          position: "D",
        },
      ];

      const result = extractPlayers(rawPlayers);

      expect(result).toHaveLength(2);
      expect(result[0].first_name).toBe("Bob");
      expect(result[1].first_name).toBe("Carol");
    });
  });

  describe("extractPotEntries", () => {

    it("should return an empty array when given an empty array", () => {
      const result = extractPotEntries([]);
      expect(result).toEqual([]);
    });

    it("should correctly map raw potEntries to potEntryType", () => {
      const rawPotEntries = [
        {
          id: penId1,
          pot_id: potId1,
          player_id: playerId1,
          fee: 20,
          extraField: "ignore me", // should be ignored
        },
      ];

      const result = extractPotEntries(rawPotEntries);

      const expected: potEntryType = {
        ...initPotEntry,
        id: penId1,
        pot_id: potId1,
        player_id: playerId1,
        fee: '20',
      };

      expect(result).toEqual([expected]);
    });
    it("should fill missing fields with defaults from blankPotEntry", () => {
      const rawPotEntries = [
        {
          id: penId1,
          pot_id: potId1,
          player_id: playerId1,
          fee: 20,
        },
      ];

      const result = extractPotEntries(rawPotEntries);

      // every *_err field should be blank string
      expect(result[0].pot_id_err).toBe("");
      expect(result[0].player_id_err).toBe("");
      expect(result[0].fee_err).toBe("");
    });
    it("should process multiple potEntries", () => {
      const rawPotEntries = [
        {
          id: penId1,
          pot_id: potId1,
          player_id: playerId1,
          fee: 20,
        },
        {
          id: penId2,
          pot_id: potId1,
          player_id: playerId2,
          fee: 20,
        },
      ];

      const result = extractPotEntries(rawPotEntries);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(penId1);
      expect(result[0].player_id).toBe(playerId1);
      expect(result[1].id).toBe(penId2);
      expect(result[1].player_id).toBe(playerId2);
    });
    it('should return an empty array when given null', () => {
      const result = extractPotEntries(null);
      expect(result).toEqual([]);
    });
    it('should return an empty array when given a non-array', () => {
      const result = extractPotEntries('not an array');
      expect(result).toEqual([]);
    })
  });

  describe("extractPots", () => {
    it("should return an empty array when given an empty array", () => {
      const result = extractPots([]);
      expect(result).toEqual([]);
    });

    it("should correctly map raw pots to potType", () => {
      const rawPots = [
        {
          id: potId1,
          div_id: divId1,
          squad_id: squadId1,
          pot_type: "Game" as potCategoriesTypes,
          fee: "20",
          sort_order: 1,
          extraField: "ignore me",
        },
      ];

      const result = extractPots(rawPots);

      const expected: potType = {
        ...initPot,
        id: potId1,
        div_id: divId1,
        squad_id: squadId1,
        pot_type: "Game" as potCategoriesTypes,
        fee: "20",
        sort_order: 1,
      };

      expect(result).toEqual([expected]);
    });

    it("should fill missing fields with defaults from blankPot", () => {
      const rawPots = [
        {
          id: potId1,
          squad_id: squadId1,
          div_id: divId1,
          sort_order: 1,
          fee: "20",
          pot_type: "Game" as potCategoriesTypes,
        },
      ];

      const result = extractPots(rawPots);

      expect(result[0].pot_type_err).toBe("");
      expect(result[0].div_err).toBe("");
      expect(result[0].fee_err).toBe("");
      expect(result[0].errClassName).toBe("");
    });

    it("should process multiple pots", () => {
      const rawPots = [
        {
          id: potId1,
          squad_id: squadId1,
          div_id: divId1,
          sort_order: 1,
          fee: "20",
          pot_type: "Game" as potCategoriesTypes,
        },
        {
          id: potId2,
          squad_id: squadId1,
          div_id: divId2,
          sort_order: 1,
          fee: "20",
          pot_type: "Game" as potCategoriesTypes,
        },
      ];

      const result = extractPots(rawPots);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(potId1);
      expect(result[0].div_id).toBe(divId1);
      expect(result[1].id).toBe(potId2);
      expect(result[1].div_id).toBe(divId2);
    });

    it("should return an empty array if given null", () => {
      const result = extractPots(null);
      expect(result).toEqual([]);
    });

    it("should return an empty array if given a non array", () => {
      const result = extractPots("not an array");
      expect(result).toEqual([]);
    });
  });

  describe("extractSquads()", () => {
    it("should return an empty array when given an empty array", () => {
      const squads = extractSquads([]);
      expect(squads).toEqual([]);
    });

    it("should correctly extract squads when given array of squads", () => {
      const rawSquads = [
        {
          id: squadId1,
          event_id: eventId1,
          squad_name: "A Squad",
          squad_date: "2022-08-21T07:00:00.000Z",
          squad_time: "10:00 AM",
          games: 6,
          lane_count: 10,
          starting_lane: 1,
          sort_order: 1,
          extraField: "ignore me",
        },
      ];

      const result = extractSquads(rawSquads);

      const expectedSquad: squadType = {
        ...initSquad,
        id: squadId1,
        event_id: eventId1,
        squad_name: "A Squad",
        tab_title: "A Squad",
        squad_date_str: "2022-08-21",
        squad_time: "10:00 AM",
        games: 6,
        lane_count: 10,
        starting_lane: 1,
        sort_order: 1,
      };

      expect(result).toEqual([expectedSquad]);
    });

    it("should process multiple squads correctly", () => {
      const rawSquads = [
        {
          id: squadId1,
          event_id: eventId1,
          squad_name: "A Squad",
          squad_date: "2022-08-21T07:00:00.000Z",
          squad_time: "10:00 AM",
          games: 6,
          lane_count: 10,
          starting_lane: 1,
          sort_order: 1,
          extraField: "ignore me",
        },
        {
          id: squadId2,
          event_id: eventId1,
          squad_name: "B Squad",
          squad_date: "2022-08-21T07:00:00.000Z",
          squad_time: "11:00 AM",
          games: 6,
          lane_count: 10,
          starting_lane: 1,
          sort_order: 2,
          extraField: "ignore me",
        },
      ];

      const result = extractSquads(rawSquads);

      expect(result).toHaveLength(2);

      expect(result[0].id).toBe(squadId1);
      expect(result[0].squad_name).toBe("A Squad");
      expect(result[0].squad_time).toBe("10:00 AM");
      expect(result[0].sort_order).toBe(1);

      expect(result[1].id).toBe(squadId2);
      expect(result[1].squad_name).toBe("B Squad");
      expect(result[1].squad_time).toBe("11:00 AM");
      expect(result[1].sort_order).toBe(2);
    });

    it("should return an empty array when given null", () => {
      const result = extractSquads(null);
      expect(result).toEqual([]);
    });

    it("should return an empty array when given a non-array", () => {
      const result = extractSquads("not an array");
      expect(result).toEqual([]);
    });
  });

  describe("extractTntMoneys()", () => {
    it("should return an empty array when given an empty array", () => {
      const tntMoneys = extractTmntMoneys([]);
      expect(tntMoneys).toEqual([]);
    });
  });

})