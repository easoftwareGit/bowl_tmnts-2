import type { syncfusionColumnDef } from "@/lib/types/types";
import type { TmntGameResult } from "@/lib/types/resultsTypes";
import { TotalPlusTotalHdcpName } from "@/lib/validation/constants";

const playerNameWidth = "150";
const aveWidth = "70"
const hdcpWidth = "85"
const gameWidth = "65"
const plusMinusWidth = "75"
const totalWidth = "80"
const totalHdcpWidth = "110"
const totalPlusTotalHdcpWidth = "120"

export const tmntResultsData: { [key: string]: any } = {  
  id: "",
  player_id: "",
  full_name: "",
  average: 0,
  hdcp: 0,
  total: 0,
  total_hdcp: 0,
  total_plus_total_hdcp: 0
};

// player_id, div_id, div_name, sort_order, tmnt_name, start_date, full_name, average, hdcp, total, total_hdcp
export const nonGameColCount = 11;

export const calcNumGames = (tmntResults: TmntGameResult[]): number => {
  if (!tmntResults || tmntResults.length === 0) return 0;

  return Object.keys(tmntResults[0]).filter((key) =>
    /^Game \d+$/.test(key)
  ).length;
};

export const createResultsColumns = (tmntResults: any[], maxHdcp: number): syncfusionColumnDef[] => {
 
  const playerColumns: syncfusionColumnDef[] = [
    {
      field: "full_name",
      headerText: "Player",
      width: playerNameWidth,
      textAlign: "Left",
      isPrimaryKey: true,
      allowEditing: false,
      customAttributes: { class: "column-header" },
    }    
  ];

  const aveAndHdcpColumns: syncfusionColumnDef[] = [
    {
      field: "average",
      // field: TotalHdcpName,
      headerText: "Avg",
      width: aveWidth,
      textAlign: "Right",
      allowEditing: false,
      type: "number",
      customAttributes: { class: "column-header" },
    },
    {
      field: "hdcp",
      headerText: "HDCP",
      width: hdcpWidth,
      textAlign: "Right",
      allowEditing: false,
      type: "number",
      customAttributes: { class: "column-header" },
    }
  ];

  const totalColumn: syncfusionColumnDef[] = [
    {
      field: "total",
      headerText: "Total",
      width: totalWidth,
      textAlign: "Right",
      allowEditing: false,
      type: "number",
      customAttributes: { class: "column-header" },
    }
  ];

  const totalHdcpColumn: syncfusionColumnDef[] = [
    {
      field: 'total_hdcp',
      headerText: "Total HDCP",
      width: totalHdcpWidth,
      textAlign: "Right",
      allowEditing: false,
      type: "number",
      customAttributes: { class: "column-header" },
    }  
  ];
  
  const totalPlusTotalHdcpColumn: syncfusionColumnDef[] = [
    {
      field: TotalPlusTotalHdcpName,
      // field: TotalHdcpName,
      headerText: "Total + HDCP",
      width: totalPlusTotalHdcpWidth,
      textAlign: "Right",
      allowEditing: false,
      type: "number",
      customAttributes: { class: "column-header" },
    }
  ];

  const plusMinusColumn: syncfusionColumnDef[] = [
    {
      field: "plus_minus",
      headerText: "+/-",
      width: plusMinusWidth,
      textAlign: "Right",
      allowEditing: false,
      type: "string",
      customAttributes: { class: "column-header" },
    }
  ]

  const gameColumns: syncfusionColumnDef[] = []
  if (!tmntResults || tmntResults.length === 0) return gameColumns
    
  const numGames = calcNumGames(tmntResults); 
  for (let game = 1; game <= numGames; game++) {
    // const gameNum = "Gm " + (game)
    const gameCol: syncfusionColumnDef = {
      field: "Game " + (game),
      headerText: "G " + (game),                  
      width: gameWidth,
      textAlign: "Right",
      type: "number",
      allowEditing: false,
      customAttributes: { class: "column-header" },
    }
    gameColumns.push(gameCol)
  }

  return (maxHdcp > 0)
    ? [...playerColumns, ...aveAndHdcpColumns, ...gameColumns, ...totalColumn, ...totalHdcpColumn, ...totalPlusTotalHdcpColumn]
    : [...playerColumns, ...gameColumns, ...totalColumn, ...plusMinusColumn];
}