import { brktEntryType, brktType, divEntryType, divType, elimEntryType, elimType, gameType, laneType, playerType, potCategoriesTypes, potEntryType, potType, squadType } from "@/lib/types/types";
import { startOfDayFromString, todayStr } from "@/lib/dateTools";
import { Squad } from "@prisma/client";
import { initBrkt, initBrktEntry, initDiv, initDivEntry, initElimEntry, initGame, initPlayer, initPot, initPotEntry, initSquad } from "@/lib/db/initVals";

export const tmntToDelId = 'tmt_467e51d71659d2e412cbc64a0d19ecb4'

export const mockDivs: divType[] = [
  {
    id: "div_018834e04e5e4885bbae79229d8b96e8",
    tmnt_id: tmntToDelId,
    div_name: "Scratch",
    div_name_err: "",
    tab_title: "Scratch",
    hdcp_per: 0,
    hdcp_per_str: "0.00",
    hdcp_per_err: "",
    hdcp_from: 230,
    int_hdcp: false,
    hdcp_for: "Series",
    hdcp_from_err: "",
    sort_order: 1,
    errClassName: "",
  },
  {
    id: "div_02b1cd5dee0542038a1244fc2978e862",
    tmnt_id: tmntToDelId,
    div_name: "Hdcp",
    div_name_err: "",
    tab_title: "Hdcp",
    hdcp_per: 1,
    hdcp_per_str: "100.00",
    hdcp_per_err: "",
    hdcp_from: 230,
    hdcp_from_err: "",
    int_hdcp: true,
    hdcp_for: "Game",
    sort_order: 2,
    errClassName: "",
  }
]

export const mockDivsToPost: divType[] = [
  {
    ...initDiv,
    id: "div_1f42042f9ef24029a0a2d48cc276a088", // changed last digit to make unique
    tmnt_id: tmntToDelId,
    div_name: "Scratch",
    hdcp_per: 0,
    hdcp_from: 230,
    int_hdcp: true, 
    hdcp_for: 'Game',
    sort_order: 11,
  },
  {
    ...initDiv,
    id: "div_29b9225d8dd44a4eae276f8bde855728", // changed last digit to make unique
    tmnt_id: tmntToDelId,
    div_name: "50+ Scratch",
    hdcp_per: 0,
    hdcp_from: 230,
    int_hdcp: true, 
    hdcp_for: 'Game',
    sort_order: 12,
  }
]

export const mockSquads: squadType[] = [
  {
    id: "sqd_e214ede16c5c46a4950e9a48bfeef61a",
    event_id: "evt_6ff6774e94884658be5bdebc68a6aa7c",    
    event_id_err: '',
    tab_title: "Singles",
    squad_name: "Singles",
    squad_name_err: "",
    games: 3,
    games_err: "",
    lane_count: 20,
    lane_count_err: "",
    starting_lane: 1,
    starting_lane_err: "",    
    squad_date_str: todayStr,
    squad_date_err: "",
    squad_time: "10:00",
    squad_time_err: "",
    sort_order: 1,
    errClassName: "",       
  },
  {
    id: "sqd_c14918f162ac4acfa3ade3fdf90f17b6",
    event_id: "evt_20235232fd444241ace86e6e58b01ad8",    
    event_id_err: "",
    tab_title: "Doubles",
    squad_name: "Doubles",
    squad_name_err: "",
    games: 3,
    games_err: "",
    lane_count: 10,
    lane_count_err: "",
    starting_lane: 1,
    starting_lane_err: "",    
    squad_date_str: todayStr,
    squad_date_err: "",
    squad_time: "12:30",
    squad_time_err: "",
    sort_order: 2,
    errClassName: "",
  },
]

export const mockPrismaSquads: Squad[] = [
  {
    id: "sqd_42be0f9d527e4081972ce8877190489d",
    event_id: "evt_06055deb80674bd592a357a4716d8ef2",
    squad_name: "A Squad",
    squad_date: startOfDayFromString('2022-08-21') as Date,
    squad_time: '10:00 AM',
    games: 6,
    lane_count: 24,
    starting_lane: 1,
    sort_order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sqd_796c768572574019a6fa79b3b1c8fa57",
    event_id: "evt_06055deb80674bd592a357a4716d8ef2",
    squad_name: "B Squad",
    squad_date: startOfDayFromString('2022-08-21') as Date,
    squad_time: '02:00 PM',
    games: 6,
    lane_count: 24, 
    starting_lane: 1,
    sort_order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
]

export const mockSquadsToEdit: squadType[] = [
  {
    ...initSquad, 
    id: "sqd_3397da1adc014cf58c44e07c19914f01",
    event_id: "evt_bd63777a6aee43be8372e4d008c1d6d0",
    squad_name: "Squad 1",
    squad_date_str: '2023-03-01',
    squad_time: '08:00 AM',
    games: 6,
    lane_count: 24,
    starting_lane: 1,
    sort_order: 1,
  },
  {
    ...initSquad, 
    id: "sqd_3397da1adc014cf58c44e07c19914f02",
    event_id: "evt_bd63777a6aee43be8372e4d008c1d6d0",
    squad_name: "Squad 2",
    squad_date_str: '2023-03-01',
    squad_time: '01:00 PM',
    games: 6,
    lane_count: 24,
    starting_lane: 1,
    sort_order: 2,
  },
  {
    ...initSquad, 
    id: "sqd_3397da1adc014cf58c44e07c19914f03",
    event_id: "evt_bd63777a6aee43be8372e4d008c1d6d0",
    squad_name: "Squad 3",
    squad_date_str: '2023-03-01',
    squad_time: '07:00 PM',
    games: 6,
    lane_count: 24,
    starting_lane: 1,
    sort_order: 3,
  },
]

export const mockSquadsToPost: squadType[] = [
  {
    ...initSquad,    
    id: 'sqd_20c24199328447f8bbe95c05e1b84645', // added 1 to last digit
    squad_name: 'Test 1',
    event_id: "evt_bd63777a6aee43be8372e4d008c1d6d0",    
    squad_date_str: '2022-08-01',
    squad_time: '10:00 AM',
    games: 6,
    lane_count: 10, 
    starting_lane: 11,
    sort_order: 1,
  },
  {
    ...initSquad,    
    id: 'sqd_20c24199328447f8bbe95c05e1b84646', // added 2 to last digit
    squad_name: 'Test 2',
    event_id: "evt_bd63777a6aee43be8372e4d008c1d6d0",
    squad_date_str: '2022-08-01',
    squad_time: '03:00 PM',
    games: 6,
    lane_count: 12, 
    starting_lane: 1,
    sort_order: 1,
  },
]

export const mockLanes: laneType[] = [
  {
    id: '1',
    lane_number: 1,
    squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a',
    in_use: true,
  },
  {
    id: '2',
    lane_number: 2,
    squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a',
    in_use: true,
  },
  {
    id: '3',
    lane_number: 3,
    squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a',
    in_use: true,
  },
  {
    id: '4',
    lane_number: 4,
    squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a',
    in_use: true,
  },
  {
    id: '5',
    lane_number: 5,
    squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a',
    in_use: true,
  },
  {
    id: '6',
    lane_number: 6,
    squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a',
    in_use: true,
  },
  {
    id: '7',
    lane_number: 7,
    squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a', 
    in_use: true,
  },
  {
    id: '8',
    lane_number: 8,
    squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a',
    in_use: true,
  },
  {
    id: '9',
    lane_number: 9,
    squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a',
    in_use: true,
  },
  {
    id: '10',
    lane_number: 10,
    squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a',
    in_use: true,
  },
  {
    id: '11',
    lane_number: 11,
    squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a',
    in_use: true,
  },
  {
    id: '12',
    lane_number: 12,
    squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a',
    in_use: true,
  },
  {
    id: '13',
    lane_number: 13,
    squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a',    
    in_use: true,
  },
  {
    id: '14',
    lane_number: 14,
    squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a',
    in_use: true,
  },
  {
    id: '15',
    lane_number: 15,
    squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a',
    in_use: true,
  },
  {
    id: '16',
    lane_number: 16,
    squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a',
    in_use: true,
  },
  {
    id: '17',
    lane_number: 17,
    squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a',
    in_use: true,
  },
  {
    id: '18',
    lane_number: 18,
    squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a',
    in_use: true,
  },
  {
    id: '19',
    lane_number: 19,
    squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a',
    in_use: true,
  },
  {
    id: '20',
    lane_number: 20,
    squad_id: 'sqd_e214ede16c5c46a4950e9a48bfeef61a', 
    in_use: true,
  },
  {
    id: '21',
    lane_number: 1,
    squad_id: 'sqd_c14918f162ac4acfa3ade3fdf90f17b6',
    in_use: true,
  },
  {
    id: '22',
    lane_number: 2,
    squad_id: 'sqd_c14918f162ac4acfa3ade3fdf90f17b6',
    in_use: true,
  },
  {
    id: '23',
    lane_number: 3,
    squad_id: 'sqd_c14918f162ac4acfa3ade3fdf90f17b6',
    in_use: true,
  },
  {
    id: '24',
    lane_number: 4,
    squad_id: 'sqd_c14918f162ac4acfa3ade3fdf90f17b6',
    in_use: true,
  },
  {
    id: '25',
    lane_number: 5,
    squad_id: 'sqd_c14918f162ac4acfa3ade3fdf90f17b6',
    in_use: true,
  },
  {
    id: '26',
    lane_number: 6,
    squad_id: 'sqd_c14918f162ac4acfa3ade3fdf90f17b6',
    in_use: true,
  },
  {
    id: '27',
    lane_number: 7,
    squad_id: 'sqd_c14918f162ac4acfa3ade3fdf90f17b6',
    in_use: true,
  },
  {
    id: '28',
    lane_number: 8,
    squad_id: 'sqd_c14918f162ac4acfa3ade3fdf90f17b6',
    in_use: true,
  },
  {
    id: '29',
    lane_number: 9,
    squad_id: 'sqd_c14918f162ac4acfa3ade3fdf90f17b6',
    in_use: true,
  },
  {
    id: '30',
    lane_number: 10,
    squad_id: 'sqd_c14918f162ac4acfa3ade3fdf90f17b6',
    in_use: true,
  }
]

export const mockLanesToEdit: laneType[] = [
  {
    id: 'lan_20c24199328447f8bbe95c05e1b84601',
    lane_number: 1,
    squad_id: 'sqd_20c24199328447f8bbe95c05e1b84645',
    in_use: true,
  },
  {
    id: 'lan_20c24199328447f8bbe95c05e1b84602',
    lane_number: 2,
    squad_id: 'sqd_20c24199328447f8bbe95c05e1b84645',
    in_use: true,
  },
  {
    id: 'lan_20c24199328447f8bbe95c05e1b84603',
    lane_number: 3,
    squad_id: 'sqd_20c24199328447f8bbe95c05e1b84645',
    in_use: true,
  },
  {
    id: 'lan_20c24199328447f8bbe95c05e1b84604',
    lane_number: 4,
    squad_id: 'sqd_20c24199328447f8bbe95c05e1b84645',
    in_use: true,
  },
]

export const mockLanesToPost: laneType[] = [
  {
    id: 'lan_20c24199328447f8bbe95c05e1b84601',
    lane_number: 1,
    squad_id: 'sqd_20c24199328447f8bbe95c05e1b84645',
    in_use: true,
  },
  {
    id: 'lan_20c24199328447f8bbe95c05e1b84602',
    lane_number: 2,
    squad_id: 'sqd_20c24199328447f8bbe95c05e1b84645',
    in_use: true,
  },
  {
    id: 'lan_20c24199328447f8bbe95c05e1b84603',
    lane_number: 3,
    squad_id: 'sqd_20c24199328447f8bbe95c05e1b84645',
    in_use: true,
  },
  {
    id: 'lan_20c24199328447f8bbe95c05e1b84604',
    lane_number: 4,
    squad_id: 'sqd_20c24199328447f8bbe95c05e1b84645',
    in_use: true,
  },
  {
    id: 'lan_20c24199328447f8bbe95c05e1b84605',
    lane_number: 5,
    squad_id: 'sqd_20c24199328447f8bbe95c05e1b84646',
    in_use: true,
  },
  {
    id: 'lan_20c24199328447f8bbe95c05e1b84606',
    lane_number: 6,
    squad_id: 'sqd_20c24199328447f8bbe95c05e1b84646',
    in_use: true,
  },
  {
    id: 'lan_20c24199328447f8bbe95c05e1b84607',
    lane_number: 7,
    squad_id: 'sqd_20c24199328447f8bbe95c05e1b84646', 
    in_use: true,
  },
  {
    id: 'lan_20c24199328447f8bbe95c05e1b84608',
    lane_number: 8,
    squad_id: 'sqd_20c24199328447f8bbe95c05e1b84646',
    in_use: true,
  },
]

export const mockPotsToPost: potType[] = [
  {
    ...initPot, 
    id: "pot_01758d99c5494efabb3b0d273cf22e7a",
    squad_id: mockSquadsToPost[0].id,
    div_id: mockDivs[0].id,
    sort_order: 1,
    fee: '20',
    pot_type: "Game" as potCategoriesTypes,
  },
  {
    ...initPot, 
    id: "pot_02758d99c5494efabb3b0d273cf22e7a",
    squad_id: mockSquadsToPost[0].id,
    div_id: mockDivs[0].id,
    sort_order: 2,
    fee: '10',
    pot_type: "Last Game" as potCategoriesTypes,
  },
  {
    ...initPot, 
    id: "pot_03758d99c5494efabb3b0d273cf22e7a",
    squad_id: mockSquadsToPost[0].id,
    div_id: mockDivs[0].id,
    sort_order: 3,
    fee: '5',
    pot_type: "Series" as potCategoriesTypes,
  },
  {
    ...initPot, 
    id: "pot_04758d99c5494efabb3b0d273cf22e7a",
    squad_id: mockSquadsToPost[1].id,
    div_id: mockDivs[1].id,
    sort_order: 4,
    fee: '20',
    pot_type: "Game" as potCategoriesTypes,
  },
  {
    ...initPot, 
    id: "pot_05758d99c5494efabb3b0d273cf22e7a",
    squad_id: mockSquadsToPost[1].id,
    div_id: mockDivs[1].id,
    sort_order: 5,
    fee: '10',
    pot_type: "Last Game" as potCategoriesTypes,
  },
  {
    ...initPot, 
    id: "pot_06758d99c5494efabb3b0d273cf22e7a",
    squad_id: mockSquadsToPost[1].id,
    div_id: mockDivs[1].id,
    sort_order: 6,
    fee: '5',
    pot_type: "Series" as potCategoriesTypes,
  },
]

export const mockBrktsToPost: brktType[] = [
  {
    ...initBrkt,
    id: "brk_01758d99c5494efabb3b0d273cf22e7a",
    squad_id: mockSquadsToPost[0].id,
    div_id: mockDivsToPost[0].id,
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
    id: "brk_02758d99c5494efabb3b0d273cf22e7a",
    squad_id: mockSquadsToPost[0].id,
    div_id: mockDivsToPost[0].id,
    sort_order: 1,
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
    id: "brk_03758d99c5494efabb3b0d273cf22e7a",
    squad_id: mockSquadsToPost[1].id,
    div_id: mockDivsToPost[1].id,
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
    id: "brk_04758d99c5494efabb3b0d273cf22e7a",
    squad_id: mockSquadsToPost[1].id,
    div_id: mockDivsToPost[1].id,
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

export const mockElimsToPost: elimType[] = [
  {
    ...initBrkt,
    id: "elm_01758d99c5494efabb3b0d273cf22e7b",
    squad_id: mockSquadsToPost[0].id,
    div_id: mockDivsToPost[0].id,
    sort_order: 1,
    start: 1,
    games: 3,
    fee: '5',
  },
  {
    ...initBrkt,
    id: "elm_02758d99c5494efabb3b0d273cf22e7b",
    squad_id: mockSquadsToPost[0].id,
    div_id: mockDivsToPost[0].id,
    sort_order: 2,
    start: 4,
    games: 3,
    fee: '5',
  },
  {
    ...initBrkt,
    id: "elm_03758d99c5494efabb3b0d273cf22e7b",
    squad_id: mockSquadsToPost[1].id,
    div_id: mockDivsToPost[1].id,
    sort_order: 3,
    start: 3,
    games: 3,
    fee: '5',
  },
  {
    ...initBrkt,
    id: "elm_04758d99c5494efabb3b0d273cf22e7b",
    squad_id: mockSquadsToPost[1].id,
    div_id: mockDivsToPost[1].id,
    sort_order: 4,
    start: 4,
    games: 3,
    fee: '5',
  },
]

export const mockPlayersToPost: playerType[] = [
  {
    ...initPlayer,
    id: "ply_01be0472be3d476ea1caa99dd05953fa",
    squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
    first_name: "John",
    last_name: "Doe",
    average: 220,
    lane: 3,
    position: 'A',   
  },
  {
    ...initPlayer,
    id: "ply_02be0472be3d476ea1caa99dd05953fa",
    squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
    first_name: "James",
    last_name: "Bennett",
    average: 221,
    lane: 3,
    position: 'B',
  },
  {
    ...initPlayer,
    id: "ply_03be0472be3d476ea1caa99dd05953fa",
    squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
    first_name: "Olivia",
    last_name: "Morgan",
    average: 210,
    lane: 4,
    position: 'A',
  },
  {
    ...initPlayer,
    id: "ply_04be0472be3d476ea1caa99dd05953fa",
    squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
    first_name: "William", 
    last_name: "Harris",
    average: 211,
    lane: 4,
    position: 'B',
  }
]

export const mockDivEntriesToPost: divEntryType[] = [
  {
    ...initDivEntry,
    id: "den_01be0472be3d476ea1caa99dd05953fa",
    squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
    div_id: 'div_18997d3fd7ef4eb7ad2b53a9e93f9ce5',
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
    fee: '84',
  },
  {
    ...initDivEntry,
    id: "den_02be0472be3d476ea1caa99dd05953fa",
    squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
    div_id: 'div_367309aa1444446ea9ab23d2e4aae98f',
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
    fee: '84',
  },
  {
    ...initDivEntry,
    id: "den_03be0472be3d476ea1caa99dd05953fa",
    squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
    div_id: 'div_18997d3fd7ef4eb7ad2b53a9e93f9ce5',
    player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
    fee: '84',
  },
  {
    ...initDivEntry,
    id: "den_04be0472be3d476ea1caa99dd05953fa",
    squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
    div_id: 'div_367309aa1444446ea9ab23d2e4aae98f',
    player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
    fee: '84',
  },
]

export const mockPotEntriesToPost: potEntryType[] = [
  {
    ...initPotEntry,
    id: 'pen_01be0472be3d476ea1caa99dd05953fa',
    pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
    fee: '20'
  },
  {
    ...initPotEntry,
    id: 'pen_02be0472be3d476ea1caa99dd05953fa',
    pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
    player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
    fee: '20'
  },
  {
    ...initPotEntry,
    id: 'pen_03be0472be3d476ea1caa99dd05953fa',
    pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
    player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
    fee: '20'
  },
  {
    ...initPotEntry,
    id: 'pen_04be0472be3d476ea1caa99dd05953fa',
    pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
    player_id: 'ply_8b0fd8bbd9e34d34a7fa90b4111c6e40',
    fee: '20'
  },
]

export const mockBrktEntriesToPost: brktEntryType[] = [
  {
    ...initBrktEntry,
    id: 'ben_01ce0472be3d476ea1caa99dd05953fa',
    brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
    num_brackets: 4,
    fee: '20',
    time_stamp: new Date().getTime(),
  },
  {
    ...initBrktEntry,
    id: 'ben_02ce0472be3d476ea1caa99dd05953fa',
    brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
    player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
    num_brackets: 4,
    fee: '20',
    time_stamp: new Date().getTime(),
  },
  {
    ...initBrktEntry,
    id: 'ben_03ce0472be3d476ea1caa99dd05953fa',
    brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
    player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
    num_brackets: 4,
    fee: '20',
    time_stamp: new Date().getTime(),
  },
  {
    ...initBrktEntry,
    id: 'ben_04ce0472be3d476ea1caa99dd05953fa',
    brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
    player_id: 'ply_8b0fd8bbd9e34d34a7fa90b4111c6e40',
    num_brackets: 4,
    fee: '20',
    time_stamp: new Date().getTime(),
  },
]

export const mockElimEntriesToPost: elimEntryType[] = [
  {
    ...initElimEntry,
    id: 'een_01de0472be3d476ea1caa99dd05953fa',
    elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
    fee: '5'
  },
  {
    ...initElimEntry,
    id: 'een_02de0472be3d476ea1caa99dd05953fa',
    elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
    fee: '5'
  },
  {
    ...initElimEntry,
    id: 'een_03de0472be3d476ea1caa99dd05953fa',
    elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
    player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
    fee: '5'
  },
  {
    ...initElimEntry,
    id: 'een_04de0472be3d476ea1caa99dd05953fa',
    elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
    player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
    fee: '5'
  },
]

export const mockGamesToPost: gameType[] = [
  {
    ...initGame,
    id: 'gam_01de0472be3d476ea1caa99dd05953fa',
    squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',  
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
    game_num: 1,
    score: 201,
  },
  {
    ...initGame,
    id: 'gam_02de0472be3d476ea1caa99dd05953fa',
    squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',  
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
    game_num: 2,
    score: 202,
  },
  {
    ...initGame,
    id: 'gam_03de0472be3d476ea1caa99dd05953fa',
    squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',  
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
    game_num: 3,
    score: 203,
  },
  {
    ...initGame,
    id: 'gam_04de0472be3d476ea1caa99dd05953fa',
    squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',  
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
    game_num: 4,
    score: 204,
  },
  {
    ...initGame,
    id: 'gam_05de0472be3d476ea1caa99dd05953fa',
    squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',  
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
    game_num: 5,
    score: 205,
  },
  {
    ...initGame,
    id: 'gam_06de0472be3d476ea1caa99dd05953fa',
    squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',  
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
    game_num: 6,
    score: 206,
  },
]