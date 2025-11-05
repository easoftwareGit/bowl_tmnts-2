import { divEntryHdcpColName, entryFeeColName, entryNumBrktsColName, timeStampColName } from "@/app/dataEntry/playersForm/createColumns";
import { initBrkt, initDiv, initDivEntry, initElim, initElimEntry, initEvent, initLane, initPlayer, initPot, initPotEntry, initBrktEntry, initSquad, initTmnt } from "@/lib/db/initVals";
import { brktSeedType, dataOneSquadEntriesType, dataOneTmntType, oneBrktType } from "@/lib/types/types";
import { brktId1, brktId2, oneBrktId1, oneBrktId2, oneBrktId3, oneBrktId4, playerId1, playerId2, playerId3, playerId4, playerId5, playerId6, playerId7, playerId8 } from "../tmntFulldata/mockTmntFullData";

const timeStamp = new Date().getTime();
export const mockOrigData: dataOneSquadEntriesType = {
  squadId: "sqd_0123456789abcdef0123456789abcdef",
  players: [
    {
      ...initPlayer,
      id: "ply_0123456789abcdef0123456789abcdef",
      squad_id: "sqd_0123456789abcdef0123456789abcdef",
      first_name: 'Amy',
      last_name: 'Davis',
      average: 212,
      lane: 29,
      position: 'Y',  
    },
    {
      ...initPlayer,
      id: 'ply_0133456789abcdef0123456789abcdef',
      squad_id: "sqd_0123456789abcdef0123456789abcdef",
      first_name: 'Betty',
      last_name: 'Smith',
      average: 205,
      lane: 30,
      position: 'Z',    
    },
    {
      ...initPlayer,
      id: 'ply_0143456789abcdef0123456789abcdef',
      squad_id: "sqd_0123456789abcdef0123456789abcdef",
      first_name: 'Carol',
      last_name: 'Johnson',
      average: 210,
      lane: 31,
      position: 'Y',    
    },
    {
      ...initPlayer,
      id: 'ply_0153456789abcdef0123456789abcdef',
      squad_id: "sqd_0123456789abcdef0123456789abcdef",
      first_name: 'Debbie',
      last_name: 'Brown',
      average: 205,
      lane: 32,
      position: 'Z',    
    },
    {
      ...initPlayer,
      id: 'ply_0163456789abcdef0123456789abcdef',
      squad_id: "sqd_0123456789abcdef0123456789abcdef",
      first_name: 'Ella',
      last_name: 'Taylor',
      average: 195,
      lane: 33,
      position: 'Y',    
    },
    {
      ...initPlayer,
      id: 'ply_0173456789abcdef0123456789abcdef',
      squad_id: "sqd_0123456789abcdef0123456789abcdef",
      first_name: 'Fanny',
      last_name: 'Anderson',
      average: 215,
      lane: 34,
      position: 'Z',    
    }
  ],
  divEntries: [
    {
      ...initDivEntry,
      id: "den_0123456789abcdef0123456789abcdef",
      squad_id: 'sqd_0123456789abcdef0123456789abcdef',
      div_id: 'div_0123456789abcdef0123456789abcdef',
      player_id: 'ply_0123456789abcdef0123456789abcdef',
      fee: '85',
      hdcp: 0,
    },
    {
      ...initDivEntry,
      id: "den_0133456789abcdef0123456789abcdef",
      squad_id: 'sqd_0123456789abcdef0123456789abcdef',
      div_id: 'div_0123456789abcdef0123456789abcdef',
      player_id: 'ply_0143456789abcdef0123456789abcdef',
      fee: '85',
      hdcp: 0,
    },
    {
      ...initDivEntry,
      id: "den_0143456789abcdef0123456789abcdef",
      squad_id: 'sqd_0123456789abcdef0123456789abcdef',
      div_id: 'div_0123456789abcdef0123456789abcdef',
      player_id: 'ply_0153456789abcdef0123456789abcdef',
      fee: '85',
      hdcp: 0,
    },
    {
      ...initDivEntry,
      id: "den_0153456789abcdef0123456789abcdef",
      squad_id: 'sqd_0123456789abcdef0123456789abcdef',
      div_id: 'div_0123456789abcdef0123456789abcdef',
      player_id: 'ply_0163456789abcdef0123456789abcdef',
      fee: '85',
      hdcp: 0,
    },
    {
      ...initDivEntry,
      id: "den_0163456789abcdef0123456789abcdef",
      squad_id: 'sqd_0123456789abcdef0123456789abcdef',
      div_id: 'div_0123456789abcdef0123456789abcdef',
      player_id: 'ply_0173456789abcdef0123456789abcdef',
      fee: '85',
      hdcp: 0,
    }
  ],
  potEntries: [
    {
      ...initPotEntry,
      id: "pen_0123456789abcdef0123456789abcdef",
      pot_id: 'pot_0123456789abcdef0123456789abcdef',
      player_id: 'ply_0123456789abcdef0123456789abcdef',
      fee: '20',
    },
    {
      ...initPotEntry,
      id: "pen_0133456789abcdef0123456789abcdef",
      pot_id: 'pot_0123456789abcdef0123456789abcdef',
      player_id: 'ply_0143456789abcdef0123456789abcdef',
      fee: '20',
    },
    {
      ...initPotEntry,
      id: "pen_0143456789abcdef0123456789abcdef",
      pot_id: 'pot_0123456789abcdef0123456789abcdef',
      player_id: 'ply_0153456789abcdef0123456789abcdef',
      fee: '20',
    }
  ],
  brktEntries: [
    {
      ...initBrktEntry,
      id: "ben_0123456789abcdef0123456789abcdef",
      brkt_id: 'brk_0123456789abcdef0123456789abcdef',
      player_id: 'ply_0123456789abcdef0123456789abcdef',
      num_brackets: 4,
      fee: '20',
      time_stamp: timeStamp,
    },
    {
      ...initBrktEntry,
      id: "ben_0133456789abcdef0123456789abcdef",
      brkt_id: 'brk_0133456789abcdef0123456789abcdef',
      player_id: 'ply_0123456789abcdef0123456789abcdef',
      num_brackets: 4,
      fee: '20',
      time_stamp: timeStamp,
    }, 
    {
      ...initBrktEntry,
      id: "ben_0143456789abcdef0123456789abcdef",
      brkt_id: 'brk_0123456789abcdef0123456789abcdef',
      player_id: 'ply_0163456789abcdef0123456789abcdef',
      num_brackets: 6,
      fee: '30',
      time_stamp: timeStamp,
    },
    {
      ...initBrktEntry,
      id: "ben_0153456789abcdef0123456789abcdef",
      brkt_id: 'brk_0133456789abcdef0123456789abcdef',
      player_id: 'ply_0163456789abcdef0123456789abcdef',
      num_brackets: 6,
      fee: '30',
      time_stamp: timeStamp,
    }
  ],
  brktLists: [],
  elimEntries: [
    {
      ...initElimEntry,
      id: "een_0123456789abcdef0123456789abcdef",
      elim_id: 'elm_0123456789abcdef0123456789abcdef',
      player_id: 'ply_0123456789abcdef0123456789abcdef',
      fee: '5',
    },
    {
      ...initElimEntry,
      id: "een_0133456789abcdef0123456789abcdef",
      elim_id: 'elm_0133456789abcdef0123456789abcdef',
      player_id: 'ply_0123456789abcdef0123456789abcdef',
      fee: '5',
    },
    {
      ...initElimEntry,
      id: "een_0143456789abcdef0123456789abcdef",
      elim_id: 'elm_0123456789abcdef0123456789abcdef',
      player_id: 'ply_0173456789abcdef0123456789abcdef',
      fee: '5',
    },
    {
      ...initElimEntry,
      id: "een_0153456789abcdef0123456789abcdef",
      elim_id: 'elm_0133456789abcdef0123456789abcdef',
      player_id: 'ply_0173456789abcdef0123456789abcdef',
      fee: '5',
    }
  ]
}

export const mockDataOneTmnt: dataOneTmntType = {
  tmnt: {
    ...initTmnt,    
    id: "tmt_0123456789abcdef0123456789abcdef",
    user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
    tmnt_name: "Mock Tournament",
    bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
  },
  events: [{    
    ...initEvent,
    id: "evt_0123456789abcdef0123456789abcdef",
    tmnt_id: "tmt_0123456789abcdef0123456789abcdef",
    event_name: "Singles",
    team_size: 1,
    games: 6,
    entry_fee: '85',
    lineage: '21',
    prize_fund: '57',
    other: '2',
    expenses: '5',
    added_money: '0',
    lpox: '85',
    sort_order: 1,
  }],
  divs: [
    {     
      ...initDiv,
      id: "div_0123456789abcdef0123456789abcdef",
      tmnt_id: "tmt_0123456789abcdef0123456789abcdef",
      div_name: "Scratch",
      hdcp_per: 0,
      hdcp_from: 230,
      int_hdcp: true,
      hdcp_for: "Game",
      sort_order: 1,
    },
    {
      ...initDiv,
      id: "div_0133456789abcdef0123456789abcdef",
      tmnt_id: "tmt_0123456789abcdef0123456789abcdef",
      div_name: "Handicap",
      hdcp_per: 0.9,
      hdcp_from: 230,
      int_hdcp: true,
      hdcp_for: "Game",
      sort_order: 2,
    }
  ],
  squads: [{ 
    ...initSquad,
    id: "sqd_0123456789abcdef0123456789abcdef",
    event_id: "evt_0123456789abcdef0123456789abcdef",
    squad_name: "Squad 1",        
    squad_time: null,
    games: 6,
    lane_count: 12,
    starting_lane: 29,
    sort_order: 1,
  }],
  lanes: [
    {
      ...initLane,
      id: "lan_0123456789abcdef0123456789abcdef",
      lane_number: 29,
      squad_id: "sqd_0123456789abcdef0123456789abcdef",
      in_use: true,
    },
    {
      ...initLane,
      id: "lan_0133456789abcdef0123456789abcdef",
      lane_number: 30,
      squad_id: "sqd_0123456789abcdef0123456789abcdef",
      in_use: true,          
    },
    {
      ...initLane,
      id: "lan_0143456789abcdef0123456789abcdef",
      lane_number: 31,
      squad_id: "sqd_0123456789abcdef0123456789abcdef",
      in_use: true,
    },
    {
      ...initLane,
      id: "lan_0153456789abcdef0123456789abcdef",
      lane_number: 32,
      squad_id: "sqd_0123456789abcdef0123456789abcdef",
      in_use: true,
    },
  ],
  pots: [
    { 
      ...initPot,
      id: "pot_0123456789abcdef0123456789abcdef",
      squad_id: "sqd_0123456789abcdef0123456789abcdef",
      div_id: "div_0123456789abcdef0123456789abcdef",
      sort_order: 1,
      fee: '20',
      pot_type: "Game",
    },
    { 
      ...initPot,
      id: "pot_0133456789abcdef0123456789abcdef",
      squad_id: "sqd_0123456789abcdef0123456789abcdef",
      div_id: "div_0133456789abcdef0123456789abcdef",
      sort_order: 2,
      fee: '20',
      pot_type: "Game",
    },
  ],
  brkts: [
    {
      ...initBrkt,
      id: "brk_0123456789abcdef0123456789abcdef",
      squad_id: "sqd_0123456789abcdef0123456789abcdef",
      div_id: "div_0123456789abcdef0123456789abcdef",
      sort_order: 1,
      start: 1,
      games: 3,
      players: 8,
      fee: '5',
      first: '25',
      second: '10',
      admin: '5',  
      fsa: '40',
    },
    {
      ...initBrkt,
      id: "brk_0133456789abcdef0123456789abcdef",
      squad_id: "sqd_0123456789abcdef0123456789abcdef",
      div_id: "div_0123456789abcdef0123456789abcdef",
      sort_order: 2,
      start: 4,
      games: 3,
      players: 8,
      fee: '5',
      first: '25',
      second: '10',
      admin: '5',  
      fsa: '40',
    }
  ],
  elims: [
    {
      ...initElim,
      id: "elm_0123456789abcdef0123456789abcdef",
      squad_id: "sqd_0123456789abcdef0123456789abcdef",
      div_id: "div_0123456789abcdef0123456789abcdef",
      sort_order: 1,
      start: 1,
      games: 3,
      fee: '5',  
    },
    {
      ...initElim,
      id: "elm_0133456789abcdef0123456789abcdef",
      squad_id: "sqd_0123456789abcdef0123456789abcdef",
      div_id: "div_0123456789abcdef0123456789abcdef",
      sort_order: 2,
      start: 4,
      games: 3,
      fee: '5',  
    }
  ]
};
const div1FeeColName = entryFeeColName(mockDataOneTmnt.divs[0].id);
const div2FeeColName = entryFeeColName(mockDataOneTmnt.divs[1].id);
const hdcp1ColName = divEntryHdcpColName(mockDataOneTmnt.divs[0].id);
const hdcp2ColName = divEntryHdcpColName(mockDataOneTmnt.divs[1].id);
const pot1FeeColName = entryFeeColName(mockDataOneTmnt.pots[0].id);
const pot2FeeColName = entryFeeColName(mockDataOneTmnt.pots[1].id);
export const brkt1NumColName = entryNumBrktsColName(mockDataOneTmnt.brkts[0].id);    
export const brkt1FeeColName = entryFeeColName(mockDataOneTmnt.brkts[0].id);
export const brkt1TimeStartColName = timeStampColName(mockDataOneTmnt.brkts[0].id);
export const brkt2NumColName = entryNumBrktsColName(mockDataOneTmnt.brkts[1].id);
export const brkt2FeeColName = entryFeeColName(mockDataOneTmnt.brkts[1].id);
export const brkt2TimeStartColName = timeStampColName(mockDataOneTmnt.brkts[1].id);
const elim1FeeColName = entryFeeColName(mockDataOneTmnt.elims[0].id);
const elim2FeeColName = entryFeeColName(mockDataOneTmnt.elims[1].id);

const validRow = {
  id: 'ply_0123456789abcdef0123456789abcdef',
  first_name: 'Amy',
  last_name: 'Davis',
  average: 212,
  lane: 29,
  position: 'Y',
  [div1FeeColName]: 85,
  [hdcp1ColName]: 0,
  [pot1FeeColName]: 20,  
  [brkt1NumColName]: 4,
  [brkt1FeeColName]: 20,
  [brkt1TimeStartColName]: new Date("2025-01-01").getTime(),
  [brkt2NumColName]: 40,
  [brkt2FeeColName]: 20,
  [brkt2TimeStartColName]: new Date("2025-01-02").getTime(),
  [elim1FeeColName]: 5,
  [elim2FeeColName]: 5,
  feeTotal: 155
}
const validRow2 = {
  id: 'ply_0133456789abcdef0123456789abcdef',
  first_name: 'Betty',
  last_name: 'Smith',
  average: 205,
  lane: 30,
  position: 'Z',    
  feeTotal: 0
}
const validRow3 = {
  id: 'ply_0143456789abcdef0123456789abcdef',
  first_name: 'Carol',
  last_name: 'Johnson',
  average: 210,
  lane: 31,
  position: 'Y',
  [div1FeeColName]: 85,
  [hdcp1ColName]: 0,
  [div2FeeColName]: 85,
  [hdcp2ColName]: 18,
  [pot1FeeColName]: 20,
  [pot2FeeColName]: 20,
  feeTotal: 105
}
const validRow4 = {
  id: 'ply_0153456789abcdef0123456789abcdef',
  first_name: 'Debbie',
  last_name: 'Brown',
  average: 205,
  lane: 32,
  position: 'Z',
  [div1FeeColName]: 85,
  [hdcp1ColName]: 0,
  [div2FeeColName]: 85,
  [hdcp2ColName]: 22,
  [pot1FeeColName]: 20,
  [pot2FeeColName]: 20,
  feeTotal: 105
}
const validRow5 = {
  id: 'ply_0163456789abcdef0123456789abcdef',
  first_name: 'Ella',
  last_name: 'Taylor',
  average: 195,
  lane: 33,
  position: 'Y',
  [div1FeeColName]: 85,
  [hdcp1ColName]: 0,
  [brkt1NumColName]: 6,
  [brkt1FeeColName]: 30,
  [brkt1TimeStartColName]: new Date("2025-01-01").getTime(),
  [brkt2NumColName]: 6,
  [brkt2FeeColName]: 30,
  [brkt2TimeStartColName]: new Date("2025-01-02").getTime(),
  feeTotal: 145
}
const validRow6 = {
  id: 'ply_0173456789abcdef0123456789abcdef',
  first_name: 'Fanny',
  last_name: 'Anderson',
  average: 215,
  lane: 34,
  position: 'Z',
  [div1FeeColName]: 85,
  [hdcp1ColName]: 0,
  [elim1FeeColName]: 5,
  [elim2FeeColName]: 5,
  feeTotal: 95
}

export const validRows = [
  {
  ...validRow
  },
  {
  ...validRow2
  },
  {
  ...validRow3
  },
  {
  ...validRow4
  },
  {
  ...validRow5
  },
  {
  ...validRow6
  }
]    

export const validOneBrkts: oneBrktType[] = [
  {
    id: oneBrktId1,
    brkt_id: brktId1,
    bindex: 0
  },
  {
    id: oneBrktId2,
    brkt_id: brktId1,
    bindex: 1
  },
  {
    id: oneBrktId3,
    brkt_id: brktId2,
    bindex: 0
  },
  {
    id: oneBrktId4,
    brkt_id: brktId2,
    bindex: 1
  },
];

export const validBrktSeeds: brktSeedType[] = [
  {
    one_brkt_id: oneBrktId1,
    seed: 0,
    player_id: playerId1,
  },
  {
    one_brkt_id: oneBrktId1,
    seed: 1,
    player_id: playerId2,
  },
  {
    one_brkt_id: oneBrktId1,
    seed: 2,
    player_id: playerId3,
  },
  {
    one_brkt_id: oneBrktId1,
    seed: 3,
    player_id: playerId4
  },
  {
    one_brkt_id: oneBrktId1,
    seed: 4,
    player_id: playerId5,
  },
  {
    one_brkt_id: oneBrktId1,
    seed: 5,
    player_id: playerId6,
  },
  {
    one_brkt_id: oneBrktId1,
    seed: 6,
    player_id: playerId7,
  },
  {
    one_brkt_id: oneBrktId1,
    seed: 7,
    player_id: playerId8,
  },
  {
    one_brkt_id: oneBrktId2,
    seed: 0,
    player_id: playerId1,
  },
  {
    one_brkt_id: oneBrktId2,
    seed: 1,
    player_id: playerId2,
  },
  {
    one_brkt_id: oneBrktId2,
    seed: 2,
    player_id: playerId3,
  },
  {
    one_brkt_id: oneBrktId2,
    seed: 3,
    player_id: playerId4
  },
  {
    one_brkt_id: oneBrktId2,
    seed: 4,
    player_id: playerId5,
  },
  {
    one_brkt_id: oneBrktId2,
    seed: 5,
    player_id: playerId6,
  },
  {
    one_brkt_id: oneBrktId2,
    seed: 6,
    player_id: playerId7,
  },
  {
    one_brkt_id: oneBrktId2,
    seed: 7,
    player_id: playerId8,
  },
  {
    one_brkt_id: oneBrktId3,
    seed: 0,
    player_id: playerId1,
  },
  {
    one_brkt_id: oneBrktId3,
    seed: 1,
    player_id: playerId2,
  },
  {
    one_brkt_id: oneBrktId3,
    seed: 2,
    player_id: playerId3,
  },
  {
    one_brkt_id: oneBrktId3,
    seed: 3,
    player_id: playerId4
  },
  {
    one_brkt_id: oneBrktId3,
    seed: 4,
    player_id: playerId5,
  },
  {
    one_brkt_id: oneBrktId3,
    seed: 5,
    player_id: playerId6,
  },
  {
    one_brkt_id: oneBrktId3,
    seed: 6,
    player_id: playerId7,
  },
  {
    one_brkt_id: oneBrktId3,
    seed: 7,
    player_id: playerId8,
  },
  {
    one_brkt_id: oneBrktId4,
    seed: 0,
    player_id: playerId1,
  },
  {
    one_brkt_id: oneBrktId4,
    seed: 1,
    player_id: playerId2,
  },
  {
    one_brkt_id: oneBrktId4,
    seed: 2,
    player_id: playerId3,
  },
  {
    one_brkt_id: oneBrktId4,
    seed: 3,
    player_id: playerId4
  },
  {
    one_brkt_id: oneBrktId4,
    seed: 4,
    player_id: playerId5,
  },
  {
    one_brkt_id: oneBrktId4,
    seed: 5,
    player_id: playerId6,
  },
  {
    one_brkt_id: oneBrktId4,
    seed: 6,
    player_id: playerId7,
  },
  {
    one_brkt_id: oneBrktId4,
    seed: 7,
    player_id: playerId8,
  },  
];