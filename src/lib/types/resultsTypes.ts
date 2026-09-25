export type GameNum = `Game ${number}`;
export type GameHdcp = `Game ${number} + Hdcp`;

export const totalPlusHdcpSqlName = 'total + Hdcp';
// API/raw SQL name
export type tmntGameResult = {
  player_id: string;
  div_id: string;
  div_name: string;
  sort_order: number;
  tmnt_name: string;
  start_date: string;

  full_name: string;
  average: number;
  hdcp: number;
  total: number;    

  // API/raw SQL name
  "total + Hdcp"?: number;

  // dynamic game columns
  [key: GameNum]: number;
  [key: GameHdcp]: number;
};

export type tmntResultsGridRow = {
  id: string;
  player_id: string;
  full_name: string;
  average: number;
  hdcp: number;
  total: number;
  plus_minus: string;
  total_hdcp: number;
  total_plus_total_hdcp: number;

  [key: GameNum]: number;
  [key: GameHdcp]: number;
};

export type tmntStandingsTableRow = {
  id: string;
  position: number;
  player_id: string;
  full_name: string;
  average: number;
  hdcp: number;
  total: number;
  plus_minus: string;
  total_hdcp: number;
  total_plus_total_hdcp: number;
  prize: string;

  [key: GameNum]: number;
  [key: GameHdcp]: number;
};