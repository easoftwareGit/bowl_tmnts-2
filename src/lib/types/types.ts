import { ErrorCode } from "../validation"

export type roleTypes = "ADMIN" | "DIRECTOR" | "USER"

export type idTypes = 'usr' | 'bwl' | 'tmt' | 'evt' | 'div' | 'sqd' | 'lan' | 'hdc' | 'pot' | 'brk' | 'elm' | 'ply' | 'den' | 'pen' | 'ben' | 'een' | 'gam' | 'bib'

export type userType = {
  id: string
  email: string
  password: string
  password_hash: string
  first_name: string
  last_name: string
  phone: string
  role: roleTypes
}

export type bowlType = {
  id: string,
  bowl_name: string,  
  city: string,
  state: string,
  url: string
}

export type YearObj = {
  year: string,
}

export type BowlInTmntData = {  
  bowl_name: string;
  city: string;
  state: string;
  url: string;
}

export type tmntsListType = {
  id: string; 
  user_id: string;
	tmnt_name: string; 
	start_date_str: string; 
  bowls: BowlInTmntData,  
}

export type tmntType = {
  id: string,
  user_id: string,
  tmnt_name: string,
  tmnt_name_err: string,
  bowl_id: string,
  bowls: BowlInTmntData
  bowl_id_err: string,
  start_date_str: string,  
  start_date_err: string,
  end_date_str: string,
  end_date_err: string,
}

export type tmntDataType = {
  id: string
  tmnt_name: string
  start_date: Date
  end_date: Date
  user_id: string
  bowl_id: string      
}

export type lpoxValidTypes = "is-valid" | "is-invalid" | "";

export type eventType = {
  id: string,
  tmnt_id: string,
  tab_title: string,
  event_name: string,
  event_name_err: string,
  team_size: number,
  team_size_err: string,
  games: number,
  games_err: string,
  entry_fee: string,
  entry_fee_err: string,
  lineage: string,
  lineage_err: string,
  prize_fund: string,
  prize_fund_err: string,
  other: string,
  other_err: string,
  expenses: string,
  expenses_err: string,
  added_money: string,
  added_money_err: string,
  lpox: string,
  lpox_valid: lpoxValidTypes,
  lpox_err: string,
  sort_order: number,
  errClassName: string,  
}

// NO lpox in eventDataType
export type eventDataType = {
  tmnt_id: string,
  event_name: string,
  team_size: number,
  games: number,
  entry_fee: string,
  lineage: string,
  prize_fund: string,
  other: string,
  expenses: string,
  added_money: string,      
  sort_order: number,
  id?: string
}

export type validEventsType = {
  events: eventType[],
  errorCode: ErrorCode
}

export type HdcpForTypes = "Game" | "Series";

export type divType = {
  id: string,
  tmnt_id: string,
  div_name: string,
  div_name_err: string,
  tab_title: string,
  hdcp_per: number,
  hdcp_per_str: string,
  hdcp_per_err: string,
  hdcp_from: number,
  hdcp_from_err: string,
  int_hdcp: boolean,
  hdcp_for: HdcpForTypes,
  sort_order: number,
  errClassName: string,
}

export type divDataType = {
  id: string;
  tmnt_id: string;
  div_name: string;
  hdcp_per: number;
  hdcp_from: number;
  int_hdcp: boolean;
  hdcp_for: HdcpForTypes;
  sort_order: number;      
};

export type validDivsType = {
  divs: divType[],  
  errorCode: ErrorCode
}

export type squadType = {
  id: string,
  event_id: string,  
  event_id_err: string,
  tab_title: string,
  squad_name: string,
  squad_name_err: string,  
  games: number,  
  games_err: string,
  lane_count: number,
  lane_count_err: string,
  starting_lane: number,
  starting_lane_err: string,  
  squad_date_str: string,
  squad_date_err: string,
  squad_time: string | null,
  squad_time_err: string,
  sort_order: number,
  errClassName: string,  
}
  
export type squadDataType = {
  id: string,
  event_id: string,            
  squad_name: string,      
  games: number,        
  lane_count: number,      
  starting_lane: number,      
  squad_date: Date,      
  squad_time: string | null,       
  sort_order: number,      
}

export type validSquadsType = {
  squads: squadType[],  
  errorCode: ErrorCode
}

export type laneType = {  
  id: string,
  lane_number: number,
  squad_id: string,  
  in_use: boolean,
}

export type laneDataType = {
  id: string,
  squad_id: string,
  lane_number: number,   
  in_use: boolean,
}

export type validLanesType = {
  lanes: laneType[],
  errorCode: ErrorCode
}

export type pairsOfLanesType = {
  left_id: string,
  left_lane: number,
  right_id: string,
  right_lane: number,
  in_use: boolean,
}

export type potCategoriesTypes = "Game" | "Last Game" | "Series" | "";

export type PotCategoryObjType = {
  id: number,
  name: potCategoriesTypes,  
}

export type potType = {
  id: string,   
  div_id: string,  
  squad_id: string,
  pot_type: potCategoriesTypes,
  pot_type_err: string,     
  div_err: string,
  fee: string,
  fee_err: string,
  sort_order: number,
  errClassName: string,
}

export type potDataType = {
  id: string
  div_id: string
  squad_id: string
  pot_type: potCategoriesTypes
  fee: string
  sort_order: number      
}

export type validPotsType = {
  pots: potType[],
  errorCode: ErrorCode
}

export type brktType = {
  id: string,
  div_id: string,  
  squad_id: string,  
  div_err: string,
  start: number,  
  start_err: string,
  games: number,
  games_err: string,
  players: number,
  players_err: string,
  fee: string,
  fee_err: string,
  first: string,
  first_err: string,
  second: string,
  second_err: string,
  admin: string,
  admin_err: string,
  fsa: string,
  fsa_valid: string,
  fsa_err: string,
  sort_order: number,
  errClassName: string,
}

export type brktDataType = {
  id: string;
  div_id: string;
  squad_id: string;
  fee: string;
  start: number;
  games: number;
  players: number;
  first: string;
  second: string;
  admin: string;
  sort_order: number;  
};

export type validBrktsType = {
  brkts: brktType[],
  errorCode: ErrorCode
}

export type elimType = {
  id: string,
  div_id: string,  
  squad_id: string,   
  div_err: string,
  start: number,
  start_err: string,
  games: number,
  games_err: string,
  fee: string,
  fee_err: string,
  sort_order: number,
  errClassName: string,
}

export type validElimsType = {
  elims: elimType[],
  errorCode: ErrorCode
}

export type elimDataType = {
  id: string;
  div_id: string;
  squad_id: string;
  fee: string;
  start: number;
  games: number;
  sort_order: number;      
};

export type playerType = {
  id: string,
  squad_id: string,
  first_name: string,
  first_name_err: string,
  last_name: string,
  last_name_err: string,
  average: number,
  average_err: string,
  lane: number,
  lane_err: string,
  position: string,
  position_err: string,
}

export interface tmntEntryPlayerType extends playerType {
  eType: string,
}

export type playerDataType = {
  squad_id: string,
  first_name: string,
  last_name: string,
  average: number,
  lane: number,
  position: string,
  id?: string
}

export type validPlayersType = {
  players: playerType[],
  errorCode: ErrorCode
}

export type divEntryType = {
  id: string,
  squad_id: string,
  squad_id_err: string,
  div_id: string,
  div_id_err: string,
  player_id: string,
  player_id_err: string,
  fee: string,
  fee_err: string,    
  hdcp: number,
}

export interface tmntEntryDivEntryType extends divEntryType {
  eType: string,
}

export type divEntryPlayerType = {
  average: number,
}

export type divEntryDivType = {
  hdcp_from: number,
  hdcp_per: number,
  int_hdcp: boolean,
}

export type divEntryRawType = {
  id: string,
  squad_id: string,
  div_id: string,
  player_id: string,
  fee: number,
  player: divEntryPlayerType,
  div: divEntryDivType,
}

export type divEntryRawWithHdcpType = divEntryRawType & {
  hdcp: number,
}

export type divEntryDataType = {
  id: string,
  squad_id: string,
  div_id: string,
  player_id: string,
  fee: string,
}

export type validDivEntriesType = {
  divEntries: divEntryType[],
  errorCode: ErrorCode
}

export type potEntryType = {
  id: string,
  pot_id: string,
  pot_id_err: string,
  player_id: string,
  player_id_err: string,
  fee: string,
  fee_err: string,
}

export interface tmntEntryPotEntryType extends potEntryType {
  eType: string,
}

export type potEntryDataType = {
  id: string,
  pot_id: string,
  player_id: string,
  fee: string,
}

export type validPotEntriesType = {
  potEntries: potEntryType[],
  errorCode: ErrorCode
}

export type brktEntryType = {
  id: string,
  brkt_id: string,
  brkt_id_err: string,
  player_id: string,
  player_id_err: string,
  num_brackets: number,
  num_brackets_err: string,
  fee: string,
  fee_err: string,  
  time_stamp: number,
}

export interface tmntEntryBrktEntryType extends brktEntryType {
  eType: string,
}

export type BrktInBbrktEntryType = {
  fee: number,
}

export type brktEntryDataType = {
  id: string,  
  brkt_id: string,
  player_id: string,
  num_brackets: number,
  time_stamp: Date,  
}

export interface brktEntriesFromPrisa extends brktEntryDataType {
  brkt: BrktInBbrktEntryType,  
}

export interface brktEntryWithFeeDataType extends brktEntryDataType {
  fee: number,
}

export type brktEntryNfType = {
  id: string,
  brkt_id: string,  
  player_id: string,  
  num_brackets: number,      
  time_stamp: number,  
}

export type brktEntryWithFeeType = brktEntryNfType & {
  fee: number,
}

export type validBrktEntriesType = {
  brktEntries: brktEntryType[],
  errorCode: ErrorCode
}

export type elimEntryType = {
  id: string,
  elim_id: string,
  elim_id_err: string,
  player_id: string,
  player_id_err: string,
  fee: string,
  fee_err: string,  
}

export interface tmntEntryElimEntryType extends elimEntryType {
  eType: string,  
}

export type elimEntryDataType = {
  id: string,  
  elim_id: string,
  player_id: string,  
  fee: string,
}

export type validElimEntriesType = {
  elimEntries: elimEntryType[],
  errorCode: ErrorCode
}
export type gameType = {
  id: string,
  squad_id: string,
  player_id: string,
  game_num: number,
  score: number
}

export type validGamesType = {
  games: gameType[],
  errorCode: ErrorCode
}

export type AcdnErrType = {
  errClassName: string,
  message: string,
}

export type dataOneTmntType = {
  tmnt: tmntType;
  events: eventType[];
  divs: divType[];
  squads: squadType[];
  lanes: laneType[];
  pots: potType[];
  brkts: brktType[];
  elims: elimType[];
}

export type dataOneSquadEntriesType = {  
  squadId: string;
  players: playerType[];
  divEntries: divEntryType[];    
  potEntries: potEntryType[];    
  brktEntries: brktEntryType[];
  elimEntries: elimEntryType[];
}

export type editedOneSquadEntriesType = {
  squadId: string;
  players: tmntEntryPlayerType[];
  divEntries: tmntEntryDivEntryType[];
  potEntries: tmntEntryPotEntryType[];  
  brktEntries: tmntEntryBrktEntryType[];
  elimEntries: tmntEntryElimEntryType[];
}

export enum tmntActions {
  None = 0,
  New = 1,
  Delete = 2,
  Edit = 3,
  Run = 4,
}

export type allDataOneTmntType = {      
  origData: dataOneTmntType;
  curData: dataOneTmntType;  
}

export type allEntriesOneSquadType = {      
  origData: dataOneSquadEntriesType;
  curData: dataOneSquadEntriesType;  
}

export type tmntFormDataType = allDataOneTmntType & {
  tmntAction: tmntActions;
}

export type tmntPropsType = {  
  tmnt: tmntType;
  setTmnt: (tmnt: tmntType) => void;
  events: eventType[];
  setEvents: (events: eventType[]) => void;
  divs: divType[];
  setDivs: (divs: divType[]) => void;
  squads: squadType[];
  setSquads: (squads: squadType[]) => void;
  lanes: laneType[];
  setLanes: (lanes: laneType[]) => void;
  pots: potType[];
  setPots: (pots: potType[]) => void;
  elims: elimType[];
  setElims: (elims: elimType[]) => void;
  brkts: brktType[];
  setBrkts: (brkts: brktType[]) => void;  
  origData: dataOneTmntType;  
}

export type putManyReturnType = {
  updates: number,
  inserts: number,
  deletes: number,
}

export type updatedEntriesCountsType = {
  players: number,
  divEntries: number,
  potEntries: number,
  brktEntries: number,
  elimEntries: number,
  total: number,
}

export type putManyEntriesReturnType = {
  players: putManyReturnType,
  divEntries: putManyReturnType,
  potEntries: putManyReturnType,
  brktEntries: putManyReturnType,
  elimEntries: putManyReturnType,  
  playersToUpdate: tmntEntryPlayerType[],
  divEntriesToUpdate: tmntEntryDivEntryType[],
  potEntriesToUpdate: tmntEntryPotEntryType[],
  brktEntriesToUpdate: tmntEntryBrktEntryType[],
  elimEntriesToUpdate: tmntEntryElimEntryType[],
}

export enum ioDataError {  
  None = 0,
  Tmnt = -1,
  Events = -2,    
  Divs = -3,
  Squads = -4,
  Lanes = -5,
  Pots = -6,
  Brkts = -7,
  Elims = -8,
  OtherError = -99,
}

export type testDateType = {
  id: number,
  sod: Date,
  eod: Date,
  gmt: Date,
}

