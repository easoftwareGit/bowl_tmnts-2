import type { syncfusionColumnDef } from "@/lib/types/types";
import { calcNumGames } from "@/app/results/tmnt/[tmntId]/standings/createResultsColumns";

const laneWidth = "75"
const gameWidth = "65"
const lastNameWidth = "130"
const firstNameWidth = "130"
const inWidth = "60"
const cashWidth = "60"

export const tmntResultsData: { [key: string]: any } = {  
  id: "",
  player_id: "",
  last_name: "",
  first_name: "",
  in: 0,
  lane: 0,
};

export const createBracketColumns = (tmntResults: any[]): syncfusionColumnDef[] => {

  const laneColumn: syncfusionColumnDef[] = [
    {
      field: "lane",
      headerText: "Lane",
      width: laneWidth,
      textAlign: "Right",
      allowEditing: false,
      allowSorting: true,
      type: "number",
      customAttributes: { class: "column-header" },
    },    
  ];

  const playerColumns: syncfusionColumnDef[] = [
    {
      field: "last_name",
      headerText: "Last Name",
      width: lastNameWidth,
      textAlign: "Left",
      allowEditing: false,
      allowSorting: true,
      customAttributes: { class: "column-header" },
    },
    {
      field: "first_name",
      headerText: "First Name",
      width: firstNameWidth,
      textAlign: "Left",
      allowEditing: false,
      allowSorting: true,
      customAttributes: { class: "column-header" },
    },
  ];

  const inColumn: syncfusionColumnDef[] = [
    {
      field: "in",
      headerText: "In",      
      width: inWidth,
      textAlign: "Right",
      allowEditing: false,
      allowSorting: false,
      type: "number",      
      customAttributes: { class: "column-header" },
    },    
  ];

  const cashedColumn: syncfusionColumnDef[] = [
    {
      field: "cash",
      headerText: "$",
      headerTextAlign: "Center",
      width: cashWidth,
      textAlign: "Center",
      allowEditing: false,
      allowSorting: false,
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
      allowSorting: false,
      customAttributes: { class: "column-header" },
    }
    gameColumns.push(gameCol)
  }

  return [...laneColumn, ...playerColumns, ...cashedColumn, ...gameColumns, ...inColumn];
};