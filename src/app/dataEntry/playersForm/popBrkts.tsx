"use client";
import React, { useState, useEffect } from "react";
import { DataGrid, GridRowModesModel, GridRowsProp } from "@mui/x-data-grid";
import { GridColDef } from "@mui/x-data-grid";
import { cloneDeep } from "lodash";
import { playerEntryData } from "./createColumns";
import { Bracket } from "@/components/brackets/bracketClass";

// Al: 10
// Bob: 8
// Curt: 6
// Don: 7
// Ed: 6
// Fred: 4
// Greg: 6
// Hal: 10
// Ian: 8 ===== problem here!

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
  }
}

interface ChildProps {  
  popBrkts: Bracket[];  
  entryRows: (typeof playerEntryData)[];
}

const PopBracketsGrid: React.FC<ChildProps> = ({
  popBrkts,
  entryRows,
}) => { 

  interface brktRowType {
    [key: string]: string;
  }
  const brktRowObj: brktRowType = {}; 
  const [rows, setRows] = useState<(typeof brktRowObj)[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);

  useEffect(() => {
    
    const playerFirstName = (playerId: string): string => {
      const playerRow = entryRows.find(row => row.id === playerId);
      return playerRow ? playerRow.first_name : '';
    }

    const createColumns = (): GridColDef[] => { 
      const brktCols: GridColDef[] = []              
      for (let i = 0; i < popBrkts.length; i++) {        
        const col: GridColDef = {
          field: 'bracket_' + i,         
          headerName: 'Bracket ' + (i + 1),
          type: 'string',
        }
        brktCols.push(col);        
      }
      return brktCols;
    }
    const createRows = (): brktRowType[] => {
      const brktRows: brktRowType[] = []
      const emptyBrktRow: brktRowType = {}
      emptyBrktRow['id'] = '' 
      for (let i = 0; i < popBrkts.length; i++) { 
        // const brktRow: brktRowType = {};
        // const brkt = popBrkts[i];
        emptyBrktRow['bracket_' + i] = ''        
      }

      for (let r = 0; r < 8; r++) {  // only 8 players per bracket
        const brktRow = cloneDeep(emptyBrktRow);
        brktRow['id'] = r + '';
        for (let i = 0; i < popBrkts.length; i++) {
          const brkt = popBrkts[i];
          if (r < brkt.players.length) {
            brktRow['bracket_' + i] = playerFirstName(brkt.players[r]);
          }          
        }
        brktRows.push(brktRow);
      }
      return brktRows;
    }

    setRows(createRows());
    setColumns(createColumns());
  }, [popBrkts, entryRows]);

  return (
    <>
      <DataGrid
        rows={rows}
        columns={columns}
        rowHeight={25}
        columnHeaderHeight={25}
        hideFooter
      />      
    </>
  );
}

export default PopBracketsGrid