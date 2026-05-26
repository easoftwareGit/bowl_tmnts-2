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
  initPlayer,
  initPot,
  initSquad,
  initTmnt,
} from "@/lib/db/initVals";
import type {
  userFormType,
  bowlType,
  fullStageType,
  playerType,
  tmntFullType,
  gameType,    
} from "@/lib/types/types";
import { SquadStage } from "@prisma/client";

export const brktId1 = "brk_0123f51cc1ca4748ad5e8abab88277ea";
export const brktId2 = "brk_0123f51cc1ca4748ad5e8abab88277eb";
export const bowlId = "bwl_0123388a8fc4641a2e37233f1d6bebd1";
export const byeId = "bye_0123388a8fc4641a2e37233f1d6beab1";
export const divId1 = "div_0123cae28786485bb7a036935f0f6a0a";
export const divId2 = "div_0123cae28786485bb7a036935f0f6a0b";
export const elimId1 = "elm_01234ec07f824b0e93169ae78e8b4b1a";
export const elimId2 = "elm_01234ec07f824b0e93169ae78e8b4b1b";
export const eventId1 = "evt_012310c8493f4a218d2e2b045442974a";
export const eventId2 = "evt_012310c8493f4a218d2e2b045442974b";

export const gameId1 = "gam_0123f51cc1ca4748ad5e8abab88277ea";
export const gameId2 = "gam_0124f51cc1ca4748ad5e8abab88277ea";
export const gameId3 = "gam_0125f51cc1ca4748ad5e8abab88277ea";
export const gameId4 = "gam_0126f51cc1ca4748ad5e8abab88277ea";
export const gameId5 = "gam_0127f51cc1ca4748ad5e8abab88277ea";
export const gameId6 = "gam_0128f51cc1ca4748ad5e8abab88277ea";
export const gameId7 = "gam_0129f51cc1ca4748ad5e8abab88277ea";
export const gameId8 = "gam_012af51cc1ca4748ad5e8abab88277ea";
export const gameId9 = "gam_012bf51cc1ca4748ad5e8abab88277ea";
export const gameId10 = "gam_012cf51cc1ca4748ad5e8abab88277ea";
export const gameId11 = "gam_012df51cc1ca4748ad5e8abab88277ea";
export const gameId12 = "gam_012ef51cc1ca4748ad5e8abab88277ea";
export const gameId13 = "gam_012ff51cc1ca4748ad5e8abab88277ea";
export const gameId14 = "gam_0130f51cc1ca4748ad5e8abab88277ea";
export const gameId15 = "gam_0131f51cc1ca4748ad5e8abab88277ea";
export const gameId16 = "gam_0132f51cc1ca4748ad5e8abab88277ea";
export const gameId17 = "gam_0133f51cc1ca4748ad5e8abab88277ea";
export const gameId18 = "gam_0134f51cc1ca4748ad5e8abab88277ea";
export const gameId19 = "gam_0135f51cc1ca4748ad5e8abab88277ea";
export const gameId20 = "gam_0136f51cc1ca4748ad5e8abab88277ea";
export const gameId21 = "gam_0137f51cc1ca4748ad5e8abab88277ea";
export const gameId22 = "gam_0138f51cc1ca4748ad5e8abab88277ea";
export const gameId23 = "gam_0139f51cc1ca4748ad5e8abab88277ea";
export const gameId24 = "gam_013af51cc1ca4748ad5e8abab88277ea";
export const gameId25 = "gam_013bf51cc1ca4748ad5e8abab88277ea";
export const gameId26 = "gam_013cf51cc1ca4748ad5e8abab88277ea";
export const gameId27 = "gam_013df51cc1ca4748ad5e8abab88277ea";
export const gameId28 = "gam_013ef51cc1ca4748ad5e8abab88277ea";
export const gameId29 = "gam_013ff51cc1ca4748ad5e8abab88277ea";
export const gameId30 = "gam_0140f51cc1ca4748ad5e8abab88277ea";
export const gameId31 = "gam_0141f51cc1ca4748ad5e8abab88277ea";
export const gameId32 = "gam_0142f51cc1ca4748ad5e8abab88277ea";
export const gameId33 = "gam_0143f51cc1ca4748ad5e8abab88277ea";
export const gameId34 = "gam_0144f51cc1ca4748ad5e8abab88277ea";
export const gameId35 = "gam_0145f51cc1ca4748ad5e8abab88277ea";
export const gameId36 = "gam_0146f51cc1ca4748ad5e8abab88277ea";
export const gameId37 = "gam_0147f51cc1ca4748ad5e8abab88277ea";
export const gameId38 = "gam_0148f51cc1ca4748ad5e8abab88277ea";
export const gameId39 = "gam_0149f51cc1ca4748ad5e8abab88277ea";
export const gameId40 = "gam_014af51cc1ca4748ad5e8abab88277ea";
export const gameId41 = "gam_014bf51cc1ca4748ad5e8abab88277ea";
export const gameId42 = "gam_014cf51cc1ca4748ad5e8abab88277ea";
export const gameId43 = "gam_014df51cc1ca4748ad5e8abab88277ea";
export const gameId44 = "gam_014ef51cc1ca4748ad5e8abab88277ea";
export const gameId45 = "gam_014ff51cc1ca4748ad5e8abab88277ea";
export const gameId46 = "gam_0150f51cc1ca4748ad5e8abab88277ea";
export const gameId47 = "gam_0151f51cc1ca4748ad5e8abab88277ea";
export const gameId48 = "gam_0152f51cc1ca4748ad5e8abab88277ea";

export const laneId1 = "lan_01239d9e6b6e4c5b9f6b7d9e7f9b6c5a";
export const laneId2 = "lan_01239d9e6b6e4c5b9f6b7d9e7f9b6c5b";
export const laneId3 = "lan_01239d9e6b6e4c5b9f6b7d9e7f9b6c5c";
export const laneId4 = "lan_01239d9e6b6e4c5b9f6b7d9e7f9b6c5d";
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
export const playerId9 = "ply_0123e9e6b6e4c5b9f6b7d9e7f9b6c5ad";
export const playerId10 = "ply_0123e9e6b6e4c5b9f6b7d9e7f9b6c5ae";
export const playerId11 = "ply_0123e9e6b6e4c5b9f6b7d9e7f9b6c5af";
export const playerId12 = "ply_0123e9e6b6e4c5b9f6b7d9e7f9b6c5ba";
export const playerId13 = "ply_0123e9e6b6e4c5b9f6b7d9e7f9b6c5bb";
export const playerId14 = "ply_0123e9e6b6e4c5b9f6b7d9e7f9b6c5bc";
export const playerId15 = "ply_0123e9e6b6e4c5b9f6b7d9e7f9b6c5bd";
export const playerId16 = "ply_0123e9e6b6e4c5b9f6b7d9e7f9b6c5be";
export const potId1 = "pot_01238f787de942a1a92aaa2df3e7c18a";
export const potId2 = "pot_01238f787de942a1a92aaa2df3e7c18b";
export const squadId1 = "sqd_012366e1174642c7a1bcec47a50f275a";
export const squadId2 = "sqd_012366e1174642c7a1bcec47a50f275b";
export const stageId1 = "stg_01238f787de942a1a92aaa2df3e7c18a";
export const stageId2 = "stg_01238f787de942a1a92aaa2df3e7c18b";
export const timeStampDate = "2026-03-19T01:45:18.741Z";
export const timeStampNumber = 1742348718741;
export const tmntId = "tmt_0123388a8fc4641a2e37233f1d6bebd1";
export const userId = "usr_0123fb5d314fff1ff5da6521a2fa7bda";

export const mockUser: userFormType  = {
  id: userId,
  email: "john.doe@example.com",
  first_name: "John",
  last_name: "Doe",  
  password: "Test123!",
  phone: "800-555-1234",
  role: "DIRECTOR",  
};

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
    bowl: {
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
      time_stamp: timeStampNumber,
    },
    {
      ...blankBrktEntry,
      id: "ben_0123111c721147f7a2bf2702056947cb",
      brkt_id: brktId1,
      player_id: playerId2,
      num_brackets: 8,
      fee: "40",
      time_stamp: timeStampNumber,
    },
    {
      ...blankBrktEntry,
      id: "ben_0123111c721147f7a2bf2702056947cc",
      brkt_id: brktId2,
      player_id: playerId1,
      num_brackets: 10,
      num_refunds: 2,
      fee: "50",
      time_stamp: timeStampNumber,
    },
    {
      ...blankBrktEntry,
      id: "ben_0123111c721147f7a2bf2702056947cd",
      brkt_id: brktId2,
      player_id: playerId2,
      num_brackets: 8,
      fee: "40",
      time_stamp: timeStampNumber,
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
      id: laneId1,
      lane_number: 29,
      squad_id: squadId1,
      in_use: true,
    },
    {
      ...initLane,
      id: laneId2,
      lane_number: 30,
      squad_id: squadId1,
      in_use: true,
    },
    {
      ...initLane,
      id: laneId3,
      lane_number: 31,
      squad_id: squadId1,
      in_use: true,
    },
    {
      ...initLane,
      id: laneId4,
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
    {
      ...blankPlayer,
      id: playerId5,
      squad_id: squadId1,
      first_name: "Tom",
      last_name: "Smith",
      average: 221,
      lane: 31,
      position: "A",
    },
    {
      ...blankPlayer,
      id: playerId6,
      squad_id: squadId1,
      first_name: "Tony",
      last_name: "Smith",
      average: 211,
      lane: 31,
      position: "B",
    },
    {
      ...blankPlayer,
      id: playerId7,
      squad_id: squadId1,
      first_name: "Tina",
      last_name: "Smith",
      average: 201,
      lane: 32,
      position: "A",
    },
    {
      ...blankPlayer,
      id: playerId8,
      squad_id: squadId1,
      first_name: "Terri",
      last_name: "Smith",
      average: 191,
      lane: 31,
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
  stage: {
    id: stageId1,
    squad_id: squadId1,
    stage: SquadStage.DEFINE,
    stage_set_at: "2025-09-01T00:00:00.000Z",
    scores_started_at: null,
    stage_override_enabled: false,
    stage_override_at: null,
    stage_override_reason: "",
  },
};

export const mockByePlayer: playerType = {
  ...initPlayer,
  id: byeId,
  squad_id: squadId1,
  first_name: "Bye",
  last_name: null as unknown as playerType["last_name"],
  lane: null as unknown as playerType["lane"],
  position: null as unknown as playerType["position"],
};

export const mockFullTmntStage: fullStageType = {
  id: stageId1,
  squad_id: squadId1,
  stage: SquadStage.DEFINE,
  stage_set_at: "2025-09-01T00:00:00.000Z",
  scores_started_at: null,
  stage_override_enabled: false,
  stage_override_at: null,
  stage_override_reason: "",
};

export const mockGames: gameType[] = [
  {    
    id: gameId1,
    squad_id: squadId1,
    player_id: playerId1,    
    game_num: 1,    
    score: 201,   
  },
  {    
    id: gameId2,
    squad_id: squadId1,
    player_id: playerId1,    
    game_num: 2,    
    score: 202,   
  },
  {    
    id: gameId3,
    squad_id: squadId1,
    player_id: playerId1,    
    game_num: 3,    
    score: 203,   
  },
  {    
    id: gameId4,
    squad_id: squadId1,
    player_id: playerId1,    
    game_num: 4,    
    score: 204,   
  },
  {    
    id: gameId5,
    squad_id: squadId1,
    player_id: playerId1,    
    game_num: 5,    
    score: 205,   
  },
  {    
    id: gameId6,
    squad_id: squadId1,
    player_id: playerId1,    
    game_num: 6,    
    score: 206,   
  },
  {    
    id: gameId7,
    squad_id: squadId1,
    player_id: playerId2,    
    game_num: 1,    
    score: 210,   
  },
  {    
    id: gameId8,
    squad_id: squadId1,
    player_id: playerId2,    
    game_num: 2,    
    score: 211,   
  },
  {    
    id: gameId9,
    squad_id: squadId1,
    player_id: playerId2,    
    game_num: 3,    
    score: 212,   
  },
  {    
    id: gameId10,
    squad_id: squadId1,
    player_id: playerId2,    
    game_num: 4,    
    score: 213,   
  },
  {    
    id: gameId11,
    squad_id: squadId1,
    player_id: playerId2,    
    game_num: 5,    
    score: 214,   
  },
  {    
    id: gameId12,
    squad_id: squadId1,
    player_id: playerId2,    
    game_num: 6,    
    score: 215,   
  },
  {    
    id: gameId13,
    squad_id: squadId1,
    player_id: playerId3,    
    game_num: 1,    
    score: 195,   
  },
  {    
    id: gameId14,
    squad_id: squadId1,
    player_id: playerId3,    
    game_num: 2,    
    score: 196,   
  },
  {    
    id: gameId15,
    squad_id: squadId1,
    player_id: playerId3,    
    game_num: 3,    
    score: 197,   
  },
  {    
    id: gameId16,
    squad_id: squadId1,
    player_id: playerId3,    
    game_num: 4,    
    score: 198,   
  },
  {    
    id: gameId17,
    squad_id: squadId1,
    player_id: playerId3,    
    game_num: 5,    
    score: 199,   
  },
  {    
    id: gameId18,
    squad_id: squadId1,
    player_id: playerId3,    
    game_num: 6,    
    score: 200,   
  },
  {    
    id: gameId19,
    squad_id: squadId1,
    player_id: playerId4,    
    game_num: 1,    
    score: 205,   
  },
  {    
    id: gameId20,
    squad_id: squadId1,
    player_id: playerId4,    
    game_num: 2,    
    score: 206,   
  },
  {    
    id: gameId21,
    squad_id: squadId1,
    player_id: playerId4,    
    game_num: 3,    
    score: 207,   
  },
  {    
    id: gameId22,
    squad_id: squadId1,
    player_id: playerId4,    
    game_num: 4,    
    score: 208,   
  },
  {    
    id: gameId23,
    squad_id: squadId1,
    player_id: playerId4,    
    game_num: 5,    
    score: 209,   
  },
  {    
    id: gameId24,
    squad_id: squadId1,
    player_id: playerId4,    
    game_num: 6,    
    score: 210,   
  },
  {    
    id: gameId25,
    squad_id: squadId1,
    player_id: playerId5,    
    game_num: 1,    
    score: 225,   
  },
  {    
    id: gameId26,
    squad_id: squadId1,
    player_id: playerId5,    
    game_num: 2,    
    score: 226,   
  },
  {    
    id: gameId27,
    squad_id: squadId1,
    player_id: playerId5,    
    game_num: 3,    
    score: 227,   
  },
  {    
    id: gameId28,
    squad_id: squadId1,
    player_id: playerId5,    
    game_num: 4,    
    score: 228,   
  },
  {    
    id: gameId29,
    squad_id: squadId1,
    player_id: playerId5,    
    game_num: 5,    
    score: 229,   
  },
  {    
    id: gameId30,
    squad_id: squadId1,
    player_id: playerId5,    
    game_num: 6,    
    score: 230,   
  },
  {    
    id: gameId31,
    squad_id: squadId1,
    player_id: playerId6,    
    game_num: 1,    
    score: 215,   
  },
  {    
    id: gameId32,
    squad_id: squadId1,
    player_id: playerId6,    
    game_num: 2,    
    score: 216,   
  },
  {    
    id: gameId33,
    squad_id: squadId1,
    player_id: playerId6,    
    game_num: 3,    
    score: 217,   
  },
  {    
    id: gameId34,
    squad_id: squadId1,
    player_id: playerId6,    
    game_num: 4,    
    score: 218,   
  },
  {    
    id: gameId35,
    squad_id: squadId1,
    player_id: playerId6,    
    game_num: 5,    
    score: 219,   
  },
  {    
    id: gameId36,
    squad_id: squadId1,
    player_id: playerId6,    
    game_num: 6,    
    score: 220,   
  },
  {    
    id: gameId37,
    squad_id: squadId1,
    player_id: playerId7,    
    game_num: 1,    
    score: 190,   
  },
  {    
    id: gameId38,
    squad_id: squadId1,
    player_id: playerId7,    
    game_num: 2,    
    score: 191,   
  },
  {    
    id: gameId39,
    squad_id: squadId1,
    player_id: playerId7,    
    game_num: 3,    
    score: 192,   
  },
  {    
    id: gameId40,
    squad_id: squadId1,
    player_id: playerId7,    
    game_num: 4,    
    score: 193,   
  },
  {    
    id: gameId41,
    squad_id: squadId1,
    player_id: playerId7,    
    game_num: 5,    
    score: 194,   
  },
  {    
    id: gameId42,
    squad_id: squadId1,
    player_id: playerId7,    
    game_num: 6,    
    score: 195,   
  },
  {    
    id: gameId43,
    squad_id: squadId1,
    player_id: playerId8,    
    game_num: 1,    
    score: 230,   
  },
  {    
    id: gameId44,
    squad_id: squadId1,
    player_id: playerId8,    
    game_num: 2,    
    score: 231,   
  },
  {    
    id: gameId45,
    squad_id: squadId1,
    player_id: playerId8,    
    game_num: 3,    
    score: 232,   
  },
  {    
    id: gameId46,
    squad_id: squadId1,
    player_id: playerId8,    
    game_num: 4,    
    score: 233,   
  },
  {    
    id: gameId47,
    squad_id: squadId1,
    player_id: playerId8,    
    game_num: 5,    
    score: 234,   
  },
  {    
    id: gameId48,
    squad_id: squadId1,
    player_id: playerId8,    
    game_num: 6,    
    score: 235,   
  },
]