"use client";
import React, { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

export const BGNumberedColCount = 10;
export const initBGNumbedColNames: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
export const brktColTitle = 'Brackets'
export const toFillColTitle = 'To Fill'
export const initBGColNames: string[] = [brktColTitle, ...initBGNumbedColNames, toFillColTitle]
export type BGRowValueType = {
  id: number;
  brktInfo: string;
  v1: number | null;
  v2: number | null;
  v3: number | null;
  v4: number | null;
  v5: number | null;
  v6: number | null;
  v7: number | null;
  v8: number | null;
  v9: number | null;
  v10: number | null;
  toFill: number;
}

export type BGDataType = {
  forFullValues: (number | null)[];  
  forOneByeValues: (number | null)[];    
}

interface ChildProps {    
  brktGridData: BGDataType
}

export const initForFullValues: BGRowValueType = {
  id: 1,
  brktInfo: "For Full",
  v1: null,
  v2: null,
  v3: null,
  v4: null,
  v5: null,
  v6: null,
  v7: null,
  v8: null,
  v9: null,
  v10: null,
  toFill: 0
}
export const initForOneByeValues: BGRowValueType = {
  ...initForFullValues,
  id: 2,
  brktInfo: "For 1 Bye",  
}
const initRows: BGRowValueType[] = [initForFullValues, initForOneByeValues];

const BracketGrid: React.FC<ChildProps> = ({
  brktGridData
}) => {
  
  const [rows, setRows] = useState<BGRowValueType[]>(initRows);  
  const [colNames, setColNames] = useState<string[]>(initBGColNames);  

  const createInitCols = (): GridColDef[] => { 
    const initCols: GridColDef[] = [
      {
        field: "brktInfo",
        headerName: colNames[0],
        disableColumnMenu: true,
        disableReorder: true,
        filterable: false,
        sortable: false,
        hideSortIcons: true,
        resizable: false,
        width: 100,
        headerClassName: "toFillHeader",
        cellClassName: "toFillHeader",
      },  
    ]
    for (let i = 1; i <= BGNumberedColCount; i++) {
      initCols.push({
        field: 'v' + i.toString(),
        headerName: colNames[i],
        disableColumnMenu: true,
        disableReorder: true,
        filterable: false,
        sortable: false,
        hideSortIcons: true,
        resizable: false,
        align: "center",
        headerAlign: "center",
        width: 55,
        headerClassName: "toFillHeader",
      });      
    }
    initCols.push({
      field: "toFill",
      headerName: colNames[BGNumberedColCount + 1],
      disableColumnMenu: true,
      disableReorder: true,
      filterable: false,
      sortable: false,
      hideSortIcons: true,
      resizable: false,
      align: "center",
      headerAlign: "center",
      width: 75,
      headerClassName: "toFillHeader",      
    })
    return initCols 
  }

  const columns: GridColDef[] = createInitCols();

  useEffect(() => {

    if (!brktGridData
      || !brktGridData.forFullValues
      || !brktGridData.forOneByeValues
      || brktGridData.forFullValues.length === 0)
    {
      return;       
    }
    const updatedRows: BGRowValueType[] = initRows.map(obj => ({ ...obj }));
    const updatedColNames: string[] = [];

    // lmc = length - count
    const lmc = brktGridData.forFullValues.length - BGNumberedColCount;     
    let j = (lmc < 0) ? 0 : lmc;
    let v = 1;
    for (let i = 0; i < BGNumberedColCount; i++) {
      const colTitle = j + 1 + '';
      updatedColNames.push(colTitle);
      
      const propName = 'v' + v.toString();
      if (j < brktGridData.forFullValues.length) {
        (updatedRows[0] as any)[propName] = brktGridData.forFullValues[j];
        (updatedRows[1] as any)[propName] = brktGridData.forOneByeValues[j];
      }
      v++;
      j++;
    }

    // sum the array, return 0 if all null
    let toFillFull: number | null =
      brktGridData.forFullValues.reduce((acc, val) => acc !== null ? (val !== null
        ? acc + val : acc)
        : 0, 0);
    let toFillBye: number | null =
      brktGridData.forOneByeValues.reduce((acc, val) => acc !== null
        ? (val !== null ? acc + val : acc)
        : 0, 0);    
    updatedRows[0].toFill = toFillFull ?? 0;    
    updatedRows[1].toFill = toFillBye ?? 0;

    setRows(updatedRows);    
    setColNames([brktColTitle, ...updatedColNames, toFillColTitle]); 
  }, [brktGridData]);    

  return (
    <div>
      <DataGrid
        rows={rows}
        columns={columns}
        rowHeight={25}
        columnHeaderHeight={25}
        hideFooter        
      />
    </div>
  );
};

export default BracketGrid;