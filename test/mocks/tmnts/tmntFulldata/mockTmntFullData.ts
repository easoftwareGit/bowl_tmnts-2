import {
  blankBrktEntry,
  blankBrktSeed,
  blankDivEntry,
  blankElimEntry,
  blankOneBrkt,
  blankPlayer,
  blankPotEntry,
  initBrkt,
  initDiv,
  initElim,
  initEvent,
  initLane,
  initPot,
  initSquad,
  initTmnt,
} from "@/lib/db/initVals";
import { bowlType, fullStageDataType, tmntFullType } from "@/lib/types/types";
import { SquadStage } from "@prisma/client";

export const brktId1 = "brk_0123f51cc1ca4748ad5e8abab88277ea";
export const brktId2 = "brk_0123f51cc1ca4748ad5e8abab88277eb";
export const bowlId = "bwl_0123388a8fc4641a2e37233f1d6bebd1";
export const divId1 = "div_0123cae28786485bb7a036935f0f6a0a";
export const divId2 = "div_0123cae28786485bb7a036935f0f6a0b";
export const elimId1 = "elm_01234ec07f824b0e93169ae78e8b4b1a";
export const elimId2 = "elm_01234ec07f824b0e93169ae78e8b4b1b";
export const eventId1 = "evt_012310c8493f4a218d2e2b045442974a";
export const eventId2 = "evt_012310c8493f4a218d2e2b045442974b";
export const oneBrktId1 = "obk_01238f787de942a1a92aaa2df3e7c18a";
export const oneBrktId2 = "obk_01238f787de942a1a92aaa2df3e7c18b";
export const oneBrktId3 = "obk_01238f787de942a1a92aaa2df3e7c18c";
export const oneBrktId4 = "obk_01238f787de942a1a92aaa2df3e7c18d";
export const playerId1 = "ply_0123e9e6b6e4c5b9f6b7d9e7f9b6c5aa";
export const playerId2 = "ply_0123e9e6b6e4c5b9f6b7d9e7f9b6c5bb";
export const playerId3 = "ply_0123e9e6b6e4c5b9f6b7d9e7f9b6c5cc";
export const playerId4 = "ply_0123e9e6b6e4c5b9f6b7d9e7f9b6c5dd";
export const playerId5 = "ply_0123e9e6b6e4c5b9f6b7d9e7f9b6c5ee";
export const playerId6 = "ply_0123e9e6b6e4c5b9f6b7d9e7f9b6c5ff";
export const playerId7 = "ply_0123e9e6b6e4c5b9f6b7d9e7f9b6c5ab";
export const playerId8 = "ply_0123e9e6b6e4c5b9f6b7d9e7f9b6c5ac";
export const potId1 = "pot_01238f787de942a1a92aaa2df3e7c18a";
export const potId2 = "pot_01238f787de942a1a92aaa2df3e7c18b";
export const squadId1 = "sqd_012366e1174642c7a1bcec47a50f275a";
export const squadId2 = "sqd_012366e1174642c7a1bcec47a50f275b";
export const stageId1 = "stg_01238f787de942a1a92aaa2df3e7c18a";
export const stageId2 = "stg_01238f787de942a1a92aaa2df3e7c18b";
export const tmntId = "tmt_0123388a8fc4641a2e37233f1d6bebd1";
export const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";

export const mockBowl: bowlType = {
  id: bowlId,
  bowl_name: "Mock Bowl",
  city: "Somewhere",
  state: "CA",
  url: "https://www.google.com",
};

export const mockTmntFullData: tmntFullType = {
  tmnt: {
    ...initTmnt,
    id: tmntId,
    user_id: userId,
    tmnt_name: "Mock Tournament",
    bowl_id: bowlId,
    bowls: {
      bowl_name: mockBowl.bowl_name,
      city: mockBowl.city,
      state: mockBowl.state,
      url: mockBowl.url,
    },
    start_date_str: "2025-09-01",
    end_date_str: "2025-09-01",
  },
  brktEntries: [
    {
      ...blankBrktEntry,
      id: "ben_0123111c721147f7a2bf2702056947ca",
      brkt_id: brktId1,
      player_id: playerId1,
      num_brackets: 10,
      num_refunds: 2,
      fee: "50",
    },
    {
      ...blankBrktEntry,
      id: "ben_0123111c721147f7a2bf2702056947cb",
      brkt_id: brktId1,
      player_id: playerId2,
      num_brackets: 8,
      fee: "40",
    },
    {
      ...blankBrktEntry,
      id: "ben_0123111c721147f7a2bf2702056947cc",
      brkt_id: brktId2,
      player_id: playerId1,
      num_brackets: 10,
      num_refunds: 2,
      fee: "50",
    },
    {
      ...blankBrktEntry,
      id: "ben_0123111c721147f7a2bf2702056947cd",
      brkt_id: brktId2,
      player_id: playerId2,
      num_brackets: 8,
      fee: "40",
    },
  ],
  brktSeeds: [
    {
      ...blankBrktSeed,
      one_brkt_id: oneBrktId1,
      seed: 0,
      player_id: playerId1,
    },
    {
      ...blankBrktSeed,
      one_brkt_id: oneBrktId1,
      seed: 1,
      player_id: playerId2,
    },
    {
      ...blankBrktSeed,
      one_brkt_id: oneBrktId1,
      seed: 2,
      player_id: playerId3,
    },
    {
      ...blankBrktSeed,
      one_brkt_id: oneBrktId1,
      seed: 3,
      player_id: playerId4,
    },
    {
      ...blankBrktSeed,
      one_brkt_id: oneBrktId2,
      seed: 0,
      player_id: playerId4,
    },
    {
      ...blankBrktSeed,
      one_brkt_id: oneBrktId2,
      seed: 1,
      player_id: playerId3,
    },
    {
      ...blankBrktSeed,
      one_brkt_id: oneBrktId2,
      seed: 2,
      player_id: playerId2,
    },
    {
      ...blankBrktSeed,
      one_brkt_id: oneBrktId2,
      seed: 3,
      player_id: playerId1,
    },
  ],
  brkts: [
    {
      ...initBrkt,
      id: brktId1,
      squad_id: squadId1,
      div_id: divId1,
      sort_order: 1,
      start: 1,
      games: 3,
      players: 8,
      fee: "5",
      first: "25",
      second: "10",
      admin: "5",
      fsa: "40",
    },
    {
      ...initBrkt,
      id: brktId2,
      squad_id: squadId1,
      div_id: divId1,
      sort_order: 2,
      start: 4,
      games: 3,
      players: 8,
      fee: "5",
      first: "25",
      second: "10",
      admin: "5",
      fsa: "40",
    },
  ],
  divs: [
    {
      ...initDiv,
      id: divId1,
      tmnt_id: tmntId,
      div_name: "Scratch",
      hdcp_per: 0,
      hdcp_from: 230,
      int_hdcp: true,
      hdcp_for: "Game",
      sort_order: 1,
    },
    {
      ...initDiv,
      id: divId2,
      tmnt_id: tmntId,
      div_name: "HDCP",
      hdcp_per: 0.9,
      hdcp_from: 230,
      int_hdcp: true,
      hdcp_for: "Game",
      sort_order: 2,
    },
  ],
  divEntries: [
    {
      ...blankDivEntry,
      id: "den_0123111c721147f7a2bf2702056947ca",
      squad_id: squadId1,
      div_id: divId1,
      player_id: playerId1,
      fee: "85",
    },
    {
      ...blankDivEntry,
      id: "den_0123111c721147f7a2bf2702056947cb",
      squad_id: squadId1,
      div_id: divId1,
      player_id: playerId2,
      fee: "85",
    },
    {
      ...blankDivEntry,
      id: "den_0123111c721147f7a2bf2702056947cc",
      squad_id: squadId1,
      div_id: divId1,
      player_id: playerId3,
      fee: "85",
    },
    {
      ...blankDivEntry,
      id: "den_0123111c721147f7a2bf2702056947cd",
      squad_id: squadId1,
      div_id: divId1,
      player_id: playerId4,
      fee: "85",
    },
  ],
  elimEntries: [
    {
      ...blankElimEntry,
      id: "een_0123111c721147f7a2bf2702056947ca",
      elim_id: elimId1,
      player_id: playerId1,
      fee: "5",
    },
    {
      ...blankElimEntry,
      id: "een_0123111c721147f7a2bf2702056947cb",
      elim_id: elimId1,
      player_id: playerId2,
      fee: "5",
    },
    {
      ...blankElimEntry,
      id: "een_0123111c721147f7a2bf2702056947cc",
      elim_id: elimId2,
      player_id: playerId1,
      fee: "5",
    },
    {
      ...blankElimEntry,
      id: "een_0123111c721147f7a2bf2702056947cd",
      elim_id: elimId2,
      player_id: playerId2,
      fee: "5",
    },
  ],
  elims: [
    {
      ...initElim,
      id: elimId1,
      squad_id: squadId1,
      div_id: divId1,
      sort_order: 1,
      start: 1,
      games: 3,
      fee: "5",
    },
    {
      ...initElim,
      id: elimId2,
      squad_id: squadId1,
      div_id: divId1,
      sort_order: 2,
      start: 4,
      games: 3,
      fee: "5",
    },
  ],
  events: [
    {
      ...initEvent,
      id: eventId1,
      tmnt_id: tmntId,
      event_name: "Singles",
      team_size: 1,
      games: 6,
      entry_fee: "85",
      lineage: "21",
      prize_fund: "57",
      other: "2",
      expenses: "5",
      added_money: "0",
      lpox: "85",
      sort_order: 1,
    },
  ],
  lanes: [
    {
      ...initLane,
      id: "lan_01239d9e6b6e4c5b9f6b7d9e7f9b6c5a",
      lane_number: 29,
      squad_id: squadId1,
      in_use: true,
    },
    {
      ...initLane,
      id: "lan_01239d9e6b6e4c5b9f6b7d9e7f9b6c5b",
      lane_number: 30,
      squad_id: squadId1,
      in_use: true,
    },
    {
      ...initLane,
      id: "lan_01239d9e6b6e4c5b9f6b7d9e7f9b6c5c",
      lane_number: 31,
      squad_id: squadId1,
      in_use: true,
    },
    {
      ...initLane,
      id: "lan_01239d9e6b6e4c5b9f6b7d9e7f9b6c5d",
      lane_number: 32,
      squad_id: squadId1,
      in_use: true,
    },
  ],
  oneBrkts: [
    {
      ...blankOneBrkt,
      id: oneBrktId1,
      brkt_id: brktId1,
      bindex: 0,
    },
    {
      ...blankOneBrkt,
      id: oneBrktId2,
      brkt_id: brktId1,
      bindex: 1,
    },
  ],
  players: [
    {
      ...blankPlayer,
      id: playerId1,
      squad_id: squadId1,
      first_name: "John",
      last_name: "Doe",
      average: 220,
      lane: 29,
      position: "A",
    },
    {
      ...blankPlayer,
      id: playerId2,
      squad_id: squadId1,
      first_name: "Jane",
      last_name: "Doe",
      average: 210,
      lane: 29,
      position: "B",
    },
    {
      ...blankPlayer,
      id: playerId3,
      squad_id: squadId1,
      first_name: "Joe",
      last_name: "Doe",
      average: 200,
      lane: 30,
      position: "A",
    },
    {
      ...blankPlayer,
      id: playerId4,
      squad_id: squadId1,
      first_name: "Jill",
      last_name: "Doe",
      average: 190,
      lane: 30,
      position: "B",
    },
  ],
  potEntries: [
    {
      ...blankPotEntry,
      id: "pen_0123111c721147f7a2bf2702056947ca",
      pot_id: potId1,
      player_id: playerId1,
      fee: "20",
    },
    {
      ...blankPotEntry,
      id: "pen_0123111c721147f7a2bf2702056947cb",
      pot_id: potId1,
      player_id: playerId2,
      fee: "20",
    },
    {
      ...blankPotEntry,
      id: "pen_0123111c721147f7a2bf2702056947cc",
      pot_id: potId1,
      player_id: playerId3,
      fee: "20",
    },
    {
      ...blankPotEntry,
      id: "pen_0123111c721147f7a2bf2702056947cd",
      pot_id: potId1,
      player_id: playerId4,
      fee: "20",
    },
  ],
  pots: [
    {
      ...initPot,
      id: potId1,
      squad_id: squadId1,
      div_id: divId1,
      sort_order: 1,
      fee: "20",
      pot_type: "Game",
    },
    {
      ...initPot,
      id: potId2,
      squad_id: squadId1,
      div_id: divId1,
      sort_order: 2,
      fee: "10",
      pot_type: "Last Game",
    },
  ],
  squads: [
    {
      ...initSquad,
      id: squadId1,
      event_id: eventId1,
      squad_name: "Squad 1",
      squad_date_str: "2025-09-01",
      squad_time: null,
      games: 6,
      lane_count: 4,
      starting_lane: 29,
      sort_order: 1,
    },
  ],  
};

export const mockFullTmntStage: fullStageDataType = {
  id: stageId1,
  squad_id: squadId1,
  stage: SquadStage.DEFINE,
  stage_set_at: new Date("2025-09-01T00:00:00.000Z"),
  scores_started_at: null,
  stage_override_enabled: false,
  stage_override_at: null,
  stage_override_reason: "",
}
