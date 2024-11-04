import { defaultHdcpPer, initBrkt, initDiv, initElim, initEvent, initLane, initPot, initSquad, initTmnt } from "@/lib/db/initVals";
import { brktType, divType, elimType, eventType, laneType, pairsOfLanesType, potType, squadType, tmntType } from "@/lib/types/types";
import { startOfToday } from "date-fns";

export const mockSDTmnt: tmntType = {
  ...initTmnt,
  id: "tmt_1234387c33d9c78aba290286576ddce5",
  user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
  tmnt_name: "Test Tournament",
  bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
  start_date: startOfToday(),
  end_date: startOfToday(),
};

export const mockSDEvents: eventType[] = [
  {
    ...initEvent,
    id: "evt_1234b73cb538418ab993fc867f860510",
    tmnt_id: "tmt_1234387c33d9c78aba290286576ddce5",
    tab_title: "Singles",
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
  {
    ...initEvent,
    id: "evt_1234b73cb538418ab993fc867f860511",
    tmnt_id: "tmt_1234387c33d9c78aba290286576ddce5",
    tab_title: "Doubles",
    event_name: "Doubles",
    team_size: 2,
    games: 4,
    entry_fee: "90",
    lineage: "24",
    prize_fund: "61",
    other: "2",
    expenses: "3",
    added_money: "100",
    lpox: "90",
    sort_order: 2,
  }
];

export const mockSDDivs: divType[] = [
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

export const mockSDSquads: squadType[] = [
  {
    ...initSquad,
    id: "sqd_1234ce5f80164830830a7157eb093396",
    event_id: "evt_1234b73cb538418ab993fc867f860510",
    squad_name: "A Squad",
    tab_title: "A Squad",
    squad_date: startOfToday(),
    squad_time: '08:00 AM',
    games: 6,
    lane_count: 12,
    starting_lane: 1,
    sort_order: 1,
  },
  {
    ...initSquad,
    id: "sqd_1234ce5f80164830830a7157eb093397",
    event_id: "evt_1234b73cb538418ab993fc867f860511",
    squad_name: "B Squad",
    tab_title: "B Squad",
    squad_date: startOfToday(),
    squad_time: '11:00 AM',
    games: 4,
    lane_count: 12,
    starting_lane: 1,
    sort_order: 2,    
  }
]

export const mockSDLanes: laneType[] = [
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
  {
    ...initLane,
    id: "lan_a001c5cc04f6463d89f24e6e19a12601",
    lane_number: 1,
    squad_id: "sqd_1234ce5f80164830830a7157eb093397",
  },
  {
    ...initLane,
    id: "lan_a002c5cc04f6463d89f24e6e19a12601",
    lane_number: 2,
    squad_id: "sqd_1234ce5f80164830830a7157eb093397",
  },
  {
    ...initLane,
    id: "lan_a003c5cc04f6463d89f24e6e19a12601",
    lane_number: 3,
    squad_id: "sqd_1234ce5f80164830830a7157eb093397",
  },
  {
    ...initLane,
    id: "lan_a004c5cc04f6463d89f24e6e19a12601",
    lane_number: 4,
    squad_id: "sqd_1234ce5f80164830830a7157eb093397",
  },
  {
    ...initLane,
    id: "lan_a005c5cc04f6463d89f24e6e19a12601",
    lane_number: 5,
    squad_id: "sqd_1234ce5f80164830830a7157eb093397",
  },
  {
    ...initLane,
    id: "lan_a006c5cc04f6463d89f24e6e19a12601",
    lane_number: 6,
    squad_id: "sqd_1234ce5f80164830830a7157eb093397",
  },
  {
    ...initLane,
    id: "lan_a007c5cc04f6463d89f24e6e19a12601",
    lane_number: 7,
    squad_id: "sqd_1234ce5f80164830830a7157eb093397",
  },
  {
    ...initLane,
    id: "lan_a008c5cc04f6463d89f24e6e19a12601",
    lane_number: 8,
    squad_id: "sqd_1234ce5f80164830830a7157eb093397",
  },
  {
    ...initLane,
    id: "lan_a009c5cc04f6463d89f24e6e19a12601",
    lane_number: 9,
    squad_id: "sqd_1234ce5f80164830830a7157eb093397",
  },
  {
    ...initLane,
    id: "lan_a010c5cc04f6463d89f24e6e19a12601",
    lane_number: 10,
    squad_id: "sqd_1234ce5f80164830830a7157eb093397",
  },
  {
    ...initLane,
    id: "lan_a011c5cc04f6463d89f24e6e19a12601",
    lane_number: 11,
    squad_id: "sqd_1234ce5f80164830830a7157eb093397",
  },
  {
    ...initLane,
    id: "lan_a012c5cc04f6463d89f24e6e19a12601",
    lane_number: 12,
    squad_id: "sqd_1234ce5f80164830830a7157eb093397",
  },
]

export const mockSDPairs: pairsOfLanesType[] = [
  {
    left_id: mockSDLanes[0].id,
    left_lane: mockSDLanes[0].lane_number,
    right_id: mockSDLanes[1].id,
    right_lane: mockSDLanes[1].lane_number,
    in_use: true
  },
  {
    left_id: mockSDLanes[2].id,
    left_lane: mockSDLanes[2].lane_number,
    right_id: mockSDLanes[3].id,
    right_lane: mockSDLanes[3].lane_number,
    in_use: true
  },
  {
    left_id: mockSDLanes[4].id,
    left_lane: mockSDLanes[4].lane_number,
    right_id: mockSDLanes[5].id,
    right_lane: mockSDLanes[5].lane_number,
    in_use: true
  },
  {
    left_id: mockSDLanes[6].id,
    left_lane: mockSDLanes[6].lane_number,
    right_id: mockSDLanes[7].id,
    right_lane: mockSDLanes[7].lane_number,
    in_use: true
  },
  {
    left_id: mockSDLanes[8].id,
    left_lane: mockSDLanes[8].lane_number,
    right_id: mockSDLanes[9].id,
    right_lane: mockSDLanes[9].lane_number,
    in_use: true
  },
  {
    left_id: mockSDLanes[10].id,
    left_lane: mockSDLanes[10].lane_number,
    right_id: mockSDLanes[11].id,
    right_lane: mockSDLanes[11].lane_number,
    in_use: true
  }
]

export const mockSDPots: potType[] = [
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

export const mockSDBrkts: brktType[] = [
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

export const mockSDElims: elimType[] = [
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