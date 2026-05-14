export type GameNum = `Game ${number}`;
export type GameHdcp = `Game ${number} + Hdcp`;

export type TmntGameResult = {
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

export type TmntResultsGridRow = {
  id: string;
  player_id: string;
  full_name: string;
  average: number;
  hdcp: number;
  total: number;
  total_hdcp: number;
  total_plus_total_hdcp: number;

  [key: GameNum]: number;
  [key: GameHdcp]: number;
};