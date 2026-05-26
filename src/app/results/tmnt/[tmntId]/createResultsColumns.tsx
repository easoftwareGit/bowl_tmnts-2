import type { syncfusionColumnDef } from "@/lib/types/types";
import type { TmntGameResult } from "@/lib/types/resultsTypes";
import { TotalHdcpName, TotalPlusTotalHdcpName } from "@/lib/validation/constants";

const playerNameWidth = "150";
const aveHdcpWidth = "80"
const gameWidth = "90"
const totalWidth = "90"
const totalHdcpWidth = "120"

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

export const createResultsColumns2 = (tmntResults: any[], maxHdcp: number): syncfusionColumnDef[] => {
 
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
      headerText: "Avg",
      width: aveHdcpWidth,
      textAlign: "Right",
      allowEditing: false,
      type: "number",
      customAttributes: { class: "column-header" },
    },
    {
      field: "hdcp",
      headerText: "HDCP",
      width: aveHdcpWidth,
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
      field: TotalHdcpName,
      headerText: "Total + HDCP",
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
      headerText: "Total + HDCP",
      width: totalHdcpWidth,
      textAlign: "Right",
      allowEditing: false,
      type: "number",
      customAttributes: { class: "column-header" },
    }
  ];

  const gameColumns: syncfusionColumnDef[] = []
  if (!tmntResults || tmntResults.length === 0) return gameColumns
    
  const numGames = calcNumGames(tmntResults); 
  for (let game = 1; game <= numGames; game++) {
    const gameNum = "Game " + (game)
    const gameCol: syncfusionColumnDef = {
      field: gameNum,
      headerText: gameNum,                  
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
    : [...playerColumns, ...gameColumns, ...totalColumn];
}