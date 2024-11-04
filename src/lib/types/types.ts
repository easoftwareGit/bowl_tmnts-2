import { ErrorCode } from "../validation"

export type roleTypes = "ADMIN" | "DIRECTOR" | "USER"

export type idTypes = 'usr' | 'bwl' | 'tmt' | 'evt' | 'div' | 'sqd' | 'lan' | 'hdc' | 'pot' | 'brk' | 'elm' | 'ply'

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
	start_date: Date; 
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
  start_date: Date,  
  start_date_err: string,
  end_date: Date,
  end_date_err: string,
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
  squad_date: Date,
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

export type allDataOneTmntType = {      
  origData: dataOneTmntType;
  curData: dataOneTmntType;
}

export type tmntPropsType = {
  // allDataOneTmntType: allDataOneTmntType;
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

export enum ioDataErrorsType {
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

