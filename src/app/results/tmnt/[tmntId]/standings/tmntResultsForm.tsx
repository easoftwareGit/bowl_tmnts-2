"use client";

import "@/lib/syncfusion-license";

import { calcNumGames } from "./createResultsColumns";
import { ColumnDirective, ColumnsDirective, GridComponent, RowDataBoundEventArgs } from "@syncfusion/ej2-react-grids";
import { createResultsColumns } from "./createResultsColumns";
import { TmntGameResult, TmntResultsGridRow } from "@/lib/types/resultsTypes";
import { sfGridBorderWidth, sfRowHeight } from "@/lib/syncfusionTools";

const populateRows = (tmntResults: TmntGameResult[]): TmntResultsGridRow[] => {
  const pRows: TmntResultsGridRow[] = [];
  const numGames = calcNumGames(tmntResults);

  tmntResults.forEach((result) => {
    const pRow: TmntResultsGridRow = {
      id: result.player_id,
      player_id: result.player_id,
      full_name: result.full_name,
      average: result.average,
      hdcp: result.hdcp,
      total: result.total,      
      total_hdcp: result.hdcp * numGames,
      total_plus_total_hdcp: result["total + Hdcp"] ?? 0,  
      plus_minus: "",
    };

    let plusMinus = 0;
    for (let game = 1; game <= numGames; game++) {
      const gameCol = `Game ${game}` as const;
      const gameHdcpCol = `Game ${game} + Hdcp` as const;

      pRow[gameCol] = result[gameCol];
      pRow[gameHdcpCol] = result[gameHdcpCol];

      if (result[gameCol]) {
        plusMinus += (result[gameCol] - 200);
      }
    }

    pRow.plus_minus = (plusMinus > 0)
      ? `+${plusMinus}`
      : (plusMinus < 0) ? `-${plusMinus}` : "0";

    pRows.push(pRow);
  });

  return pRows;
};

// const gridBorderWidth = 2;
// const gridScrollbarWidth = 17; // enable if vertical scrollbar appears

const calcGridWidth = (columns: { width?: string }[]): number => {
  return columns.reduce((total, col) => {
    const width = Number.parseInt(col.width ?? "0", 10);
    return total + (Number.isNaN(width) ? 0 : width);
  }, 0) + sfGridBorderWidth; // + gridBorderWidth, removes bottom scrollbar
  // + sfGridScrollbarWidth if needed
};

interface ChildProps { 
  divid: string;
  tmntResults: TmntGameResult[];
  cashers?: number;
}

const TmntResultsForm: React.FC<ChildProps> = ({
  divid,
  tmntResults,
  cashers = 0
}) => {   
  
  const justDiv = tmntResults.filter(result => result.div_id === divid);
  let maxHdcp = 0;
  if (justDiv && justDiv.length > 0) {
    maxHdcp = Math.max(...justDiv.map(result => result.hdcp));
  } 
  const rows = populateRows(justDiv);
  const columns = createResultsColumns(justDiv, maxHdcp);
  const gridWidth = calcGridWidth(columns);

  /**
   * used to put a bottom border under the last casher's row
   *
   * @param {RowDataBoundEventArgs} args
   */
  const rowDataBound = (args: RowDataBoundEventArgs) => {
    const rowData = args.data as TmntResultsGridRow;
    if (cashers > 0 && rowData.id === rows[cashers - 1]?.id) {
      args.row?.classList.add("separator-row");
    }
  };  

  return (
    <>
      <div
        data-testid="ResultsOuterWrapper"
        className="tmnt-results-grid-outer"
      >      
        <div
          data-testid="ResultsInnerWrapper"
          className="tmnt-results-grid-inner"
        >
          <GridComponent
            id="tmntResultsGrid"
            allowPaging={false}
            allowSorting={false}
            dataSource={rows}
            gridLines="None"
            readOnly={true}
            rowDataBound={rowDataBound}
            rowHeight={sfRowHeight}
            width={gridWidth}
          >
            <ColumnsDirective>
              {columns.map((col) => (
                <ColumnDirective key={col.field} {...col} />
              ))}
            </ColumnsDirective>
          </GridComponent>
        </div>
      </div>
    </>
  )
}

export default TmntResultsForm;