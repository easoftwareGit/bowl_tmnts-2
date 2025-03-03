import { GridColDef } from "@mui/x-data-grid";

export const tmntResultsData: { [key: string]: any } = {  
  id: "",
  player_id: "",
  full_name: "",
  average: 0,
  hdcp: 0,
  total: 0,
  total_hdcp: 0
};

// player_id, div_id, div_name, sort_order, tmnt_name, start_date, full_name, average, hdcp, total, total_hdcp
export const nonGameColCount = 11;

export const calcNumGames = (tmntResults: any[]): number => { 
  if (!tmntResults || tmntResults.length === 0) return 0;
  const numProperties = Object.keys(tmntResults[0]).length;
  // 1 game = 2 columns, score and score + hdcp
  return ~~((numProperties - nonGameColCount) / 2);  
}

export const playerColumn: GridColDef[] = [
  {
    field: "full_name",
    headerName: "Name",
    description: "Name",  
    headerClassName: 'resultsHeader',
    editable: false,
    width: 150,      
  },
]

export const aveAndHdcpColumns: GridColDef[] = [
  {
    field: "average",
    headerName: "Avg",
    description: "Average",
    headerClassName: 'resultsHeader',
    editable: false,
    width: 70,
    type: "number",
    align: "center",
    headerAlign: "center",
  },
  {
    field: "hdcp",
    headerName: "HDCP",
    description: "HDCP",
    headerClassName: 'resultsHeader',
    editable: false,
    width: 70,
    type: "number",
    align: "center",
    headerAlign: "center",
  },
]

const totalColumn: GridColDef[] = [
  {
    field: "total",
    headerName: "Scratch",
    description: "Scratch Total",
    headerClassName: 'resultsHeader',    
    editable: false,
    width: 75,
    type: "number",
    align: "right",
  },
]

const totalWithHdcpColumn: GridColDef[] = [
  {
    field: "total_hdcp",
    headerName: "Total",
    description: "Total + Handicap",
    headerClassName: 'resultsHeader',
    editable: false,
    width: 75,
    type: "number",
    align: "right",
  },
]

/**
 * Creates columns for tournament results
 * 
 * @param {any[]} tmntResults - array of tournament results
 * @param {number} maxHdcp - max hdcp in results 
 * @returns {GridColDef[]} array of columns
 */
export const createResultsColumns = (tmntResults: any[], maxHdcp: number): GridColDef[] => { 

  const gameColumns: GridColDef[] = []
  if (!tmntResults || tmntResults.length === 0) return gameColumns
    
  const numGames = calcNumGames(tmntResults); 
  for (let game = 1; game <= numGames; game++) {
    const gameNum = "Game " + (game)
    const gameCol: GridColDef = {
      field: gameNum,
      headerName: game + '',  
      description: gameNum,
      headerAlign: "center",
      headerClassName: 'resultsHeader',
      width: 60,
      align: "center",
      type: "number",
      editable: false,      
    }
    gameColumns.push(gameCol)
    // if (maxHdcp > 0) { 
    //   const gameHdcpCol: GridColDef = {
    //     field: gameNum + ' + Hdcp',
    //     headerName: "G" + game + ' + HDCP',
    //     headerAlign: "center",
    //     headerClassName: 'resultsHeader',
    //     width: 100,
    //     align: "center",
    //     type: "number",
    //     editable: false,
    //   }
    //   gameColumns.push(gameHdcpCol)
    // }
  }  

  return (maxHdcp > 0)
    ? [...playerColumn, ...aveAndHdcpColumns, ...gameColumns, ...totalColumn, ...totalWithHdcpColumn]
    : [...playerColumn, ...gameColumns, ...totalColumn]
}
