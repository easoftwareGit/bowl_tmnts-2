import { entryFeeColName, entryNumBrktsColName } from "@/app/dataEntry/playersForm/createColumns";
import { todayStr } from "@/lib/dateTools";
import { blankBrktEntry, blankElimEntry, initBrkt, initDiv, initDivEntry, initElim, initEvent, initLane, initPlayer, initPot, initPotEntry, initSquad, initTmnt } from "@/lib/db/initVals";
import { brktEntryType, brktType, dataOneTmntType, divEntryType, divType, elimEntryType, elimType, eventType, laneType, pairsOfLanesType, playerType, potEntryType, potType, squadType, tmntType } from "@/lib/types/types";

export const mockTmnt: tmntType = {
  ...initTmnt,
  id: "tmt_1234387c33d9c78aba290286576ddce5",
  user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
  tmnt_name: "Test Tournament",
  bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
  start_date_str: todayStr,
  end_date_str: todayStr,
};

export const mockEvents: eventType[] = [
  {
    ...initEvent,
    id: "evt_1234b73cb538418ab993fc867f860510",
    tmnt_id: "tmt_1234387c33d9c78aba290286576ddce5",
    event_name: "Singles",
    team_size: 1,
    games: 6,
    entry_fee: "80",
    lineage: "18",
    prize_fund: "55",
    other: "2",
    expenses: "5",
    added_money: "0",
    lpox: "80",
    sort_order: 1,
  },
];

export const mockDivs: divType[] = [
  {
    ...initDiv,
    id: "div_000134e04e5e4885bbae79229d8b96e8",
    tmnt_id: "tmt_1234387c33d9c78aba290286576ddce5",
    div_name: "Scratch",
    tab_title: 'Scratch',
    hdcp_per: 0,
    hdcp_per_str: '0.00',
    hdcp_from: 0,
    int_hdcp: true, 
    hdcp_for: 'Game',
    sort_order: 1,
  },
  {
    ...initDiv,
    id: "div_000234e04e5e4885bbae79229d8b96e8",
    tmnt_id: "tmt_1234387c33d9c78aba290286576ddce5",
    div_name: "Handicap",
    tab_title: "Handicap",
    hdcp_per: 0.9,
    hdcp_per_str: '90.00',
    hdcp_from: 230,
    int_hdcp: true, 
    hdcp_for: 'Game',
    sort_order: 2,
  }
]

export const mockSquads: squadType[] = [
  {
    ...initSquad,
    id: "sqd_1234ce5f80164830830a7157eb093396",
    event_id: "evt_1234b73cb538418ab993fc867f860510",
    squad_name: "Squad 1",
    tab_title: "Squad 1",
    squad_date_str: todayStr,
    squad_time: null,
    games: 6,
    lane_count: 12,
    starting_lane: 1,
    sort_order: 1,
  }
]

export const mockLanes: laneType[] = [
  {
    ...initLane,
    id: "lan_0001c5cc04f6463d89f24e6e19a12601",
    lane_number: 1,
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
  },
  {
    ...initLane,
    id: "lan_0002c5cc04f6463d89f24e6e19a12601",
    lane_number: 2,
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
  },
  {
    ...initLane,
    id: "lan_0003c5cc04f6463d89f24e6e19a12601",
    lane_number: 3,
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
  },
  {
    ...initLane,
    id: "lan_0004c5cc04f6463d89f24e6e19a12601",
    lane_number: 4,
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
  },
  {
    ...initLane,
    id: "lan_0005c5cc04f6463d89f24e6e19a12601",
    lane_number: 5,
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
  },
  {
    ...initLane,
    id: "lan_0006c5cc04f6463d89f24e6e19a12601",
    lane_number: 6,
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
  },
  {
    ...initLane,
    id: "lan_0007c5cc04f6463d89f24e6e19a12601",
    lane_number: 7,
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
  },
  {
    ...initLane,
    id: "lan_0008c5cc04f6463d89f24e6e19a12601",
    lane_number: 8,
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
  },
  {
    ...initLane,
    id: "lan_0009c5cc04f6463d89f24e6e19a12601",
    lane_number: 9,
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
  },
  {
    ...initLane,
    id: "lan_0010c5cc04f6463d89f24e6e19a12601",
    lane_number: 10,
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
  },
  {
    ...initLane,
    id: "lan_0011c5cc04f6463d89f24e6e19a12601",
    lane_number: 11,
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
  },
  {
    ...initLane,
    id: "lan_0012c5cc04f6463d89f24e6e19a12601",
    lane_number: 12,
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
  },
]

export const mockPairs: pairsOfLanesType[] = [
  {
    left_id: mockLanes[0].id,
    left_lane: mockLanes[0].lane_number,
    right_id: mockLanes[1].id,
    right_lane: mockLanes[1].lane_number,
    in_use: true
  },
  {
    left_id: mockLanes[2].id,
    left_lane: mockLanes[2].lane_number,
    right_id: mockLanes[3].id,
    right_lane: mockLanes[3].lane_number,
    in_use: true
  },
  {
    left_id: mockLanes[4].id,
    left_lane: mockLanes[4].lane_number,
    right_id: mockLanes[5].id,
    right_lane: mockLanes[5].lane_number,
    in_use: true
  },
  {
    left_id: mockLanes[6].id,
    left_lane: mockLanes[6].lane_number,
    right_id: mockLanes[7].id,
    right_lane: mockLanes[7].lane_number,
    in_use: true
  },
  {
    left_id: mockLanes[8].id,
    left_lane: mockLanes[8].lane_number,
    right_id: mockLanes[9].id,
    right_lane: mockLanes[9].lane_number,
    in_use: true
  },
  {
    left_id: mockLanes[10].id,
    left_lane: mockLanes[10].lane_number,
    right_id: mockLanes[11].id,
    right_lane: mockLanes[11].lane_number,
    in_use: true
  }
]

export const mockPots: potType[] = [
  {
    ...initPot,
    id: "pot_0001b02d761b4f5ab5438be84f642c3b",
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
    div_id: "div_000134e04e5e4885bbae79229d8b96e8",
    sort_order: 1,
    fee: '20',
    pot_type: "Game",
  },
  {
    ...initPot,
    id: "pot_0002b02d761b4f5ab5438be84f642c3b",
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
    div_id: "div_000234e04e5e4885bbae79229d8b96e8",
    sort_order: 2,
    fee: '20',
    pot_type: "Game",
  },
]

export const mockBrkts: brktType[] = [
  {
    ...initBrkt,
    id: "brk_0001b54c2cc44ff9a3721de42c80c8c1",
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
    div_id: "div_000134e04e5e4885bbae79229d8b96e8",
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
    id: "brk_0002b54c2cc44ff9a3721de42c80c8c1",
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
    div_id: "div_000134e04e5e4885bbae79229d8b96e8",
    sort_order: 2,
    start: 4,
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
    id: "brk_0003b54c2cc44ff9a3721de42c80c8c1",
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
    div_id: "div_000234e04e5e4885bbae79229d8b96e8",
    sort_order: 3,
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
    id: "brk_0004b54c2cc44ff9a3721de42c80c8c1",
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
    div_id: "div_000234e04e5e4885bbae79229d8b96e8",
    sort_order: 4,
    start: 4,
    games: 3,
    players: 8,
    fee: '5',
    first: '25',
    second: '10',
    admin: '5',
    fsa: '40',
  },
]

export const mockElims: elimType[] = [
  {
    ...initElim,
    id: "elm_000184582e7042bb95b4818ccdd9974c",
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
    div_id: "div_000134e04e5e4885bbae79229d8b96e8",
    sort_order: 1,
    start: 1,
    games: 3,
    fee: '5',
  },
  {
    ...initElim,
    id: "elm_000284582e7042bb95b4818ccdd9974c",
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
    div_id: "div_000134e04e5e4885bbae79229d8b96e8",
    sort_order: 2,
    start: 4,
    games: 3,
    fee: '5',
  },
  {
    ...initElim,
    id: "elm_000384582e7042bb95b4818ccdd9974c",
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
    div_id: "div_000234e04e5e4885bbae79229d8b96e8",
    sort_order: 3,
    start: 1,
    games: 3,
    fee: '5',
  },
  {
    ...initElim,
    id: "elm_000484582e7042bb95b4818ccdd9974c",
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
    div_id: "div_000234e04e5e4885bbae79229d8b96e8",
    sort_order: 4,
    start: 4,
    games: 3,
    fee: '5',
  },
]

export const mockPlayers: playerType[] = [
  {
    ...initPlayer,
    id: "ply_000184582e7042bb95b4818ccdd9974c",
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
    first_name: "John",
    last_name: "Smith",
    average: 200,
    lane: 1,
    position: "A",
  },
  {
    ...initPlayer,
    id: "ply_000284582e7042bb95b4818ccdd9974c",
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
    first_name: "Jane",
    last_name: "Doe",
    average: 201,
    lane: 1,
    position: "B",
  },
  {
    ...initPlayer,
    id: "ply_000384582e7042bb95b4818ccdd9974c",
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
    first_name: "Bob",
    last_name: "White",
    average: 202,
    lane: 2,
    position: "A",
  },
  {
    ...initPlayer,
    id: "ply_000484582e7042bb95b4818ccdd9974c",
    squad_id: "sqd_1234ce5f80164830830a7157eb093396",
    first_name: "Tom",
    last_name: "Jones",
    average: 203,
    lane: 2,
    position: "B",
  },
]

export const mockDivEntries: divEntryType[] = [
  {
    ...initDivEntry,
    id: "den_01be0472be3d476ea1caa99dd05953fa",
    squad_id: 'sqd_1234ce5f80164830830a7157eb093396',
    div_id:'div_000134e04e5e4885bbae79229d8b96e8',
    player_id: 'ply_000184582e7042bb95b4818ccdd9974c',
    fee: '85',
  },
  {
    ...initDivEntry,
    id: "den_02be0472be3d476ea1caa99dd05953fa",
    squad_id: 'sqd_1234ce5f80164830830a7157eb093396',
    div_id:'div_000134e04e5e4885bbae79229d8b96e8',
    player_id: 'ply_000284582e7042bb95b4818ccdd9974c',
    fee: '85',
  },
  {
    ...initDivEntry,
    id: "den_03be0472be3d476ea1caa99dd05953fa",
    squad_id: 'sqd_1234ce5f80164830830a7157eb093396',
    div_id:'div_000134e04e5e4885bbae79229d8b96e8',
    player_id: 'ply_000384582e7042bb95b4818ccdd9974c',
    fee: '85',
  },
  {
    ...initDivEntry,
    id: "den_04be0472be3d476ea1caa99dd05953fa",
    squad_id: 'sqd_1234ce5f80164830830a7157eb093396',
    div_id:'div_000134e04e5e4885bbae79229d8b96e8',
    player_id: 'ply_000484582e7042bb95b4818ccdd9974c',
    fee: '85',
  },
]

export const mockPotEntries: potEntryType[] = [
  {
    ...initPotEntry,
    id: 'pen_01be0472be3d476ea1caa99dd05953fa',
    pot_id: 'pot_0001b02d761b4f5ab5438be84f642c3b',
    player_id: 'ply_000184582e7042bb95b4818ccdd9974c',
    fee: '20'
  },
  {
    ...initPotEntry,
    id: 'pen_02be0472be3d476ea1caa99dd05953fa',
    pot_id: 'pot_0002b02d761b4f5ab5438be84f642c3b',
    player_id: 'ply_000184582e7042bb95b4818ccdd9974c',
    fee: '10'
  },
  {
    ...initPotEntry,
    id: 'pen_03be0472be3d476ea1caa99dd05953fa',
    pot_id: 'pot_0001b02d761b4f5ab5438be84f642c3b',
    player_id: 'ply_000284582e7042bb95b4818ccdd9974c',
    fee: '20'
  },
  {
    ...initPotEntry,
    id: 'pen_04be0472be3d476ea1caa99dd05953fa',
    pot_id: 'pot_0002b02d761b4f5ab5438be84f642c3b',
    player_id: 'ply_000284582e7042bb95b4818ccdd9974c',
    fee: '10'
  },
]

const timeStamp = new Date().setDate(new Date().getDate() - 1)
export const mockBrktEntries: brktEntryType[] = [
  {
    ...blankBrktEntry,
    id: 'ben_01ce0472be3d476ea1caa99dd05953fa',
    brkt_id: 'brk_0001b54c2cc44ff9a3721de42c80c8c1',
    player_id: 'ply_000184582e7042bb95b4818ccdd9974c',
    num_brackets: 4,
    fee: '20',
    time_stamp: timeStamp,    
  },
  {
    ...blankBrktEntry,
    id: 'ben_02ce0472be3d476ea1caa99dd05953fa',
    brkt_id: 'brk_0002b54c2cc44ff9a3721de42c80c8c1',
    player_id: 'ply_000184582e7042bb95b4818ccdd9974c',
    num_brackets: 4,
    fee: '20',
    time_stamp: timeStamp,
  },
  {
    ...blankBrktEntry,
    id: 'ben_03ce0472be3d476ea1caa99dd05953fa',
    brkt_id: 'brk_0001b54c2cc44ff9a3721de42c80c8c1',
    player_id: 'ply_000284582e7042bb95b4818ccdd9974c',
    num_brackets: 6,
    fee: '30',
    time_stamp: timeStamp,
  },
  {
    ...blankBrktEntry,
    id: 'ben_04ce0472be3d476ea1caa99dd05953fa',
    brkt_id: 'brk_0002b54c2cc44ff9a3721de42c80c8c1',
    player_id: 'ply_000284582e7042bb95b4818ccdd9974c',
    num_brackets: 6,
    fee: '30',
    time_stamp: timeStamp,
  },
]

export const mockElimEntries: elimEntryType[] = [
  {
    ...blankElimEntry,
    id: 'een_01de0472be3d476ea1caa99dd05953fa',
    elim_id: 'elm_000184582e7042bb95b4818ccdd9974c',
    player_id: 'ply_000184582e7042bb95b4818ccdd9974c',
    fee: '5'
  },
  {
    ...blankElimEntry,
    id: 'een_02de0472be3d476ea1caa99dd05953fa',
    elim_id: 'elm_000284582e7042bb95b4818ccdd9974c',
    player_id: 'ply_000184582e7042bb95b4818ccdd9974c',
    fee: '5'
  },
  {
    ...blankElimEntry,
    id: 'een_03de0472be3d476ea1caa99dd05953fa',
    elim_id: 'elm_000184582e7042bb95b4818ccdd9974c',
    player_id: 'ply_000284582e7042bb95b4818ccdd9974c',
    fee: '5'
  },
  {
    ...blankElimEntry,
    id: 'een_04de0472be3d476ea1caa99dd05953fa',
    elim_id: 'elm_000284582e7042bb95b4818ccdd9974c',
    player_id: 'ply_000284582e7042bb95b4818ccdd9974c',
    fee: '5'
  },
]
