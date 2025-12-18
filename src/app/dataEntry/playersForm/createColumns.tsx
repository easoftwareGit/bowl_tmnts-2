import { brktType, divType, elimType, potType } from "@/lib/types/types";
import { maxAverage, maxBrackets, maxMoney } from "@/lib/validation";
import {
  GridColDef,
  GridEditInputCell,  
  GridRowModel,
  GridRowModesModel,
} from "@mui/x-data-grid";
import { currencyFormatter } from "@/lib/currency/formatValue";
import { getBrktOrElimName, getDivName, getPotShortName } from "@/lib/getName";
import { convertToString } from "@/lib/convert";
import { validAverage } from "@/app/api/players/validate";
import { sanitize } from "@/lib/sanitize";
import { validPosChars } from "./rowInfo";
import { isTouchDevice } from "@/lib/mobileDevices/mobileDevices";
import styles from './grid.module.css';

export const brktsColNameEnd = "_brkts";
export const feeColNameEnd = "_fee";
export const hdcpColNameEnd = "_hdcp";
export const intHdcpColNameEnd = "_intHdcp";
export const refundsColNameEnd = "_refunds";
export const timeStampColNameEnd = "_timeStamp";

export const feeColWidthTouch = 125;
export const feeColWidthNoTouch = 95;

export const playerEntryData: { [key: string]: any } = {
  id: "",
  player_id: "",
  first_name: "",
  last_name: "",
  average: 0,
  lane: 0,
  position: "",
  lanePos: "",
};

/**
 * gets the integer part of a number
 *
 * @param {number} value value to get integer from
 * @returns {number | null} - integer or null
 */
export const getOnlyIntegerOrNull = (value: number): number | null  => {
  if ((!value || isNaN(value) || typeof value === 'string') && value !== 0) return null;  
  return Math.trunc(value);
};

/**
 * checks if the value a valid bowling average
 *
 * @param {number} value - value to validate
 * @returns {boolean} - true if value is valid
 */
export const isValidAverage = (value: number): boolean => {
  if (typeof value != "number" || Number.isNaN(value)) return false;
  return value >= 0 && value <= maxAverage;
};

/**
 * gets the css class name for the value cell
 *
 * @param {number} value - current average value
 * @returns {string} - css class name
 */
export const applyAverageCellColor = (value: number): string => {
  if (!value) return "";  
  if (!isValidAverage(value)) return styles.cellError;
  return "";
};

/**
 * gets the position, only first char of value passed
 *
 * @param {string} value - postion value
 * @returns {string} - position
 */
export const getPosition = (value: string): string => {
  if (!value) return "";
  const strValue = convertToString(value);
  if (strValue.length > 0) return strValue[0];
  return "";
};

/**
 * formats value to string or empty string
 *
 * @param {number} value - value to format
 * @returns {string} - formatted value or empty string
 */
export const formatIntZeroAsBlank = (value: number): string => {
  if (!value || value === 0) return "";
  return value.toString();
};

/**
 * Ensures a numeric value, rounded to 2 decimal places.
 * Returns 0 if value is NaN or invalid.
 * 
 * @param {any} value - params object
 * @returns {number} - rounded value
 */
export const valueGetterForMoney = (value: any): number => {  
  const num = Number(value);
  if (isNaN(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

/**
 * Parses user input (e.g. "$12.34", "15", etc.) into a float.
 * Returns 0 if input is invalid.
 * 
 * @param {any} value - value to parse
 * @returns {number} - parsed value
 */
export const valueParserForMoney = (value: any): number => {
  if (typeof value === "string") {
    const parsed = parseFloat(value.replace("$", "").trim());
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof value === "number") return value;
  return 0;
};

/**
 * create columns for player section of entries grid
 * 
 * @param {divType[]} divs - tounament divisions
 * @param {number} maxLane - maximum lane #
 * @param {number} minLane - minimum lane #
 * @returns {GridColDef[]} - array of column definitions for player section 
 */
export const createPlayerEntryColumns = (
  divs: divType[],
  maxLane: number,
  minLane: number
): GridColDef[] => {

  const isTouch = isTouchDevice();
  const averageColWidth = isTouch ? 130 : 80;
  const laneColWidth = isTouch ? 120 : 70;
  const lanePosColWidth = isTouch ? 140 : 80;
  const nameWidth = isTouch ? 150 : 120;
  const positionColWidth = isTouch ? 130 : 80;

  const firstNameSettter = (value: string, row: GridRowModel) => { 
    if (value == null) { 
      value === "";
    };
    let firstName = sanitize(value)
    return {
      ...row,
      first_name: firstName
    }
  }

  const lastNameSettter = (value: string, row: GridRowModel) => { 
    if (value == null) { 
      value === "";
    };
    let lastName = sanitize(value)
    return {
      ...row,
      last_name: lastName
    }
  }

  const setHdcps = (value: number, row: GridRowModesModel) => {
    let average = value ? Math.trunc(Number(value)) : 0;        
    if (!validAverage(average)) return row;
    let newRow = { ...row };
    let aveRowValue = average === 0 ? null : average;
    divs?.forEach((div) => {
      let hdcp = 0;
      if (div.hdcp_per > 0 && average < div.hdcp_from) {
        hdcp = (div.hdcp_from - average) * div.hdcp_per;
        if (div.int_hdcp) {
          hdcp = Math.trunc(hdcp);
        }
      }
      const divHdcpName = divEntryHdcpColName(div.id);
      newRow = {
        ...newRow,
        average: aveRowValue,
        [divHdcpName]: hdcp,
      } as typeof playerEntryData;
    });
    return newRow;
  };

  const isValidLane = (value: number) => value >= minLane && value <= maxLane;
  const applyLaneCellColor = (value: number) => {
    if (
      value == null ||      
      (typeof value === "string" && (value as string) === "")
    )
      return "";
    // if (typeof value !== "number" || !isValidLane(value)) return "cellError";
    if (typeof value !== "number" || !isValidLane(value)) return styles.cellError;
    return "";
  };
  const isValidPosition = (value: string): boolean => { 
    if (value == null || typeof value !== "string" && value === "") return false;
    return (value.length === 1 && validPosChars.test(value[0]));
  }    
  const applyPositionCellColor = (value: string) => {
    if (
      value == null ||      
      (typeof value === "string" && (value as string) === "")
    )
      return "";
    // if (typeof value !== "string" || !isValidPosition(value)) return "cellError";
    if (typeof value !== "string" || !isValidPosition(value)) return styles.cellError;
    return "";
  }
  const setLaneAndLanePos = (value: number, row: GridRowModel) => {
    let lane = (value) ? Math.trunc(value) : null;
    if (lane === 0) lane = null;
    const position = row.position;
    if (isValidLane(lane as number)) {
      if (isValidPosition(position)) {
        const lanePos = lane + "-" + position;
        return {
          ...row,
          lane,
          lanePos,
        };
      }
      return {
        ...row,
        lane,
        lanePos: "",
      };
    } else { 
      return {
        ...row,  
        lane,
        lanePos: "",
      };
    }
  };

  const setPositionAndLanePos = (value: string, row: GridRowModel) => {  

    let position = value ? value.toString()[0] : null
    if (isValidPosition(position as string)) {
      if (isValidLane(row.lane)) {
        const lanePos = row.lane + "-" + position;
        return {
          ...row,
          position,
          lanePos,
        };
      } else { 
        return {
          ...row,
          position,
          lanePos: "",
        }
      }
    } else { 
      return {
        ...row,
        position: value,
        lanePos: "",
      }
    }
  };

  const playersColumns: GridColDef[] = [
    {
      field: "first_name",
      headerName: "First Name",
      description: "First Name",      
      headerClassName: styles.playersHeader,
      editable: true,
      width: nameWidth,
      valueSetter: firstNameSettter
    },
    {
      field: "last_name",
      headerName: "Last Name",
      description: "Last Name",      
      headerClassName: styles.playersHeader,
      editable: true,
      width: nameWidth,
      valueSetter: lastNameSettter
    },
    {
      field: "average",
      headerName: "Average",
      description: "Average",
      headerClassName: styles.playersHeader,
      headerAlign: "center",
      editable: true,
      width: averageColWidth,
      type: "number",
      align: "center",
      renderEditCell: (params) => (
        <GridEditInputCell
          {...params}
          inputProps={{
            max: maxAverage,
            min: 0,
          }}
        />
      ),
      cellClassName: (params) => applyAverageCellColor(params.value as number),
      valueGetter: getOnlyIntegerOrNull,
      valueSetter: setHdcps,
    },
    {
      field: "lane",
      headerName: "Lane #",
      description: "Lane #",
      headerClassName: styles.playersHeader,
      headerAlign: "center",
      editable: true,
      width: laneColWidth,
      type: "number",
      align: "center",
      renderEditCell: (params) => (
        <GridEditInputCell
          {...params}
          inputProps={{
            max: maxLane,
            min: minLane,
          }}
        />
      ),
      cellClassName: (params) => applyLaneCellColor(params.value as number),
      valueGetter: getOnlyIntegerOrNull,      
      valueSetter: setLaneAndLanePos,      
    },
    {
      field: "position",
      headerName: "Position",
      description: "Position",
      headerClassName: styles.playersHeader,
      headerAlign: "center",
      editable: true,
      width: positionColWidth,
      align: "center",
      cellClassName: (params) => applyPositionCellColor(params.value as string),
      valueGetter: getPosition,
      valueSetter: setPositionAndLanePos,
    },
    {
      field: "lanePos",
      headerName: "Lane-Pos",
      description: "Lane Position",
      headerClassName: styles.playersHeader,
      headerAlign: "center",
      width: lanePosColWidth,
      align: "center",
    },
  ];

  return playersColumns;
};

export const entryFeeColName = (id: string) => id + feeColNameEnd;
export const divEntryHdcpColName = (div_id: string) => div_id + hdcpColNameEnd;
export const divEntryIntHdcpColName = (div_id: string) => div_id + intHdcpColNameEnd;
export const timeStampColName = (id: string) => id + timeStampColNameEnd;

/**
 * check if column name is a division entry fee column
 * NOTE: does not check for valid uuid in middle of column name
 * 
 * @param {string} colName - column name to check
 * @returns {boolean} - true if column name is a division entry fee column
 */
export const isDivEntryFeeColumnName = (colName: string): boolean => { 
  if (!colName) return false;
  return (colName.startsWith('div')
    && colName.endsWith(feeColNameEnd)) 
    ? true : false;  
}

/**
 * format entry fee
 * 
 * @param {number} value - number to format
 * @returns {string} - formatted number 
 */
const formatFee = (value: number | string): string => {
  if (value == null || value === "") return ""; 
  let numValue = 0;
  if (typeof value === "number") { 
    numValue = value;
  } else {
    numValue = Number(value);
  }
  if (isNaN(numValue)) return currencyFormatter.format(0);
  if (numValue === 0) return "";
  const roundedValue = Math.round((numValue) * 100) / 100
  return currencyFormatter.format(roundedValue);
};

/**
 * format entry fee to blank if 0, else format as currency
 * 
 * @param {number} value - number to format
 * @returns {string} - formatted number
 */
const formatFeeBlankAsZero = (value: number): string => {
  if (!value || isNaN(value)) return currencyFormatter.format(0);
  const roundedValue = Math.round((value + Number.EPSILON) * 100) / 100;
  return currencyFormatter.format(roundedValue);
};

/**
 * create columns for division section of entries grid
 * 
 * @param {divType[]} divs - tounament divisions
 * @returns {GridColDef[]} - array of column definitions for division section
 */
export const createDivEntryColumns = (divs: divType[]): GridColDef[] => {

  const isTouch = isTouchDevice();
  const feeColWidth = isTouch ? feeColWidthTouch : feeColWidthNoTouch;
  const hdcpColWidth = isTouch ? 120 : 80;

  const isValidDivFee = (value: number) => value >= 0 && value <= maxMoney;
  const applyDivFeeCellColor = (value: number) => {
    if (
      value === null ||
      value === undefined ||
      (typeof value === "string" && (value as string) === "") ||
      (typeof value === "number" && isNaN(value))
    )
      return "";
    // if (typeof value !== "number" || !isValidDivFee(value)) return "cellError";
    if (typeof value !== "number" || !isValidDivFee(value)) return styles.cellError;
    return "";
  };
  const formatHdcp = (value: number, row: GridRowModel, colDef: GridColDef) => {
    if (!value || isNaN(value)) return "0";    
    const intHdcp = colDef.disableExport // cant sum Hdcp column, so intHdcp value here
    if (intHdcp) return Math.trunc(value).toString();
    return value.toFixed(1);
  };
  
  const divColumns: GridColDef[] = [];
  divs.forEach((div) => {
    const feeColumn: GridColDef = {
      field: entryFeeColName(div.id),
      headerName: div.div_name,
      description: div.div_name,      
      headerClassName: styles.divsHeader,
      headerAlign: "right",
      type: "number",
      width: feeColWidth,
      editable: true,
      align: "right",
      renderEditCell: (params: any) => (
        <GridEditInputCell
          {...params}
          inputProps={{
            max: maxMoney,
            min: 0,
          }}
        />
      ),
      cellClassName: (params: any) => applyDivFeeCellColor(params.value as number),
      valueGetter: valueGetterForMoney,
      valueParser: valueParserForMoney,
      valueFormatter: formatFee,
    };
    divColumns.push(feeColumn);    
    const hdcpColumn: GridColDef = {
      field: divEntryHdcpColName(div.id),
      headerName: "HDCP",
      description: "HDCP",
      headerClassName: styles.divsHeader,
      headerAlign: "center",
      type: "number",
      width: hdcpColWidth,
      align: "center",      
      valueFormatter: formatHdcp,       
      disableExport: div.int_hdcp, // cant export Hdcp column, so stick intHdcp value here
    };
    divColumns.push(hdcpColumn);
  });
  return divColumns;
};

/**
 * check if column name is a pot fee column
 * NOTE: does not check for valid uuid in middle of column name
 * 
 * @param {string} colName - column name to check
 * @returns {boolean} - true if column name is a pot fee column
 */
export const isPotFeeColumnName = (colName: string): boolean => { 
  if (!colName || typeof colName !== "string") return false;
  return (colName.startsWith('pot')
    && colName.endsWith(feeColNameEnd)) 
    ? true : false;  
}

/**
 * gets the pot fee
 * 
 * @param {potType[]} pots - array of tournament pots
 * @param {string} potId - id of pot
 * @returns {number} - pot fee or 0
 */
export const getPotFee = (pots: potType[], potId: string): number => {
  if (!pots || pots.length === 0 || !potId) return 0;
  const pot = pots.find((pot) => pot.id === potId);
  return pot ? Number(pot.fee) : 0;
};

/**
 * checks if fee is valid
 * 
 * @param {number | string} value - pot or elim entry fee
 * @param {number} fee - pot or elim fee
 * @returns {boolean} - true if entry fee === 0 || entry fee === fee
 */
export const isValidFee = (value: number | string, fee: number): boolean => {
  if (value == null) return true;
  if (typeof value === "object") return false;
  const num = typeof value === "number" ? value : Number(value);
  if (isNaN(num)) return false;  
  return num === 0 || num === fee ? true : false;
};

/**
 * applies pot or elim fee cell color
 * 
 * @param {number | string} value - value to format
 * @param {number} fee - fee to check
 * @returns {string} - cell class name or "" 
 */
const applyPotOrElimFeeCellColor = (value: number | string, fee: number): string => {
  if (value == null || value === 0 || value === "0") return "";
  // if a number type
  if (typeof value === "number") {
    if (isNaN(value)) return "";
    const numValue = Number(value)  
    if (!isValidFee(numValue, fee)) return styles.cellError;
    return "";
  };
  // if a string type
  const numValue = Number(value);
  if (isNaN(numValue)) return styles.cellError; // non-numeric string → error
  if (!isValidFee(numValue, fee)) return styles.cellError;
  return "";  
};

/**
 * creates columns for pot section of entries grid
 * 
 * @param {potType[]} pots - array of tournament pots to create columns for
 * @returns {GridColDef[]} - array of column definitions for pot section
 */
export const createPotEntryColumns = (pots: potType[], divs: divType[]): GridColDef[] => {

  const isTouch = isTouchDevice();
  const potColWidth = isTouch ? 160 : 105;

  const potColumns: GridColDef[] = [];
  pots.forEach((pot) => {
    const divName = getDivName(pot.div_id, divs);
    const potHeader = getPotShortName(pot, divs);    
    const feeColumn: GridColDef = {
      field: entryFeeColName(pot.id),
      headerName: potHeader,
      description: divName + ': ' + pot.pot_type,
      headerClassName: styles.potsHeader,
      headerAlign: "right",
      type: "number",
      width: potColWidth,
      editable: true,
      align: "right",
      renderEditCell: (params: any) => (
        <GridEditInputCell
          {...params}
          inputProps={{
            max: pot.fee,
            min: 0,
          }}
        />
      ),
      cellClassName: (params: any) =>
        applyPotOrElimFeeCellColor(params.value as number, Number(pot.fee)),
      valueGetter: valueGetterForMoney,
      valueParser: valueParserForMoney,
      valueFormatter: formatFee,
    };
    potColumns.push(feeColumn);
  });
  return potColumns;
};

export const entryNumBrktsColName = (id: string) => id + brktsColNameEnd;
export const entryNumRefundsColName = (id: string) => id + refundsColNameEnd;

/**
 * check if column name is a number of brackets column
 * NOTE: does not check for valid uuid in middle of column name
 * 
 * @param {string} colName - column name to check
 * @returns {boolean} - true if column name is a number of brackets column
 */
export const isBrktsColumnName = (colName: string): boolean => { 
  if (!colName || typeof colName !== "string") return false;
  return (colName.startsWith('brk')
    && colName.endsWith(brktsColNameEnd)) 
    ? true : false;  
}

/**
 * gets the bracket id from a # of brackets entered column name
 * 
 * @param {string} colName - number brackets entered column name 
 * @returns {string} - bracket id or ""
 */
export const getBrktIdFromColName = (colName: string): string => {
  if (!isBrktsColumnName(colName)) return "";       
  const sliceLength = brktsColNameEnd.length * -1;  // *-1 because remove '_brkts'
  return colName.slice(0, sliceLength);             // remove '_brkts'  
}

const validBrkts = (value: number) => value >= 0 && value <= maxBrackets;

/**
 * applies number of brackets cell color
 * 
 * @param {number} value - value to check
 * @returns {string} - cell class name or "" 
 */
const applyNumBrktsCellColor = (value: number): string => {
  if (!value) return "";  
  if (!validBrkts(value)) return styles.cellError;
  return "";
};

/**
 * creates columns for bracket section of entries grid
 * 
 * @param {brktType[]} brkts - array of tournament brackets to create columns for
 * @param {divType[]} divs - array of tournament divisions
 * @returns {GridColDef[]} - array of column definitions for bracket section
 */
export const createBrktEntryColumns = (
  brkts: brktType[],
  divs: divType[]
): GridColDef[] => {

  const isTouch = isTouchDevice();
  const numBrktsColWidth = isTouch ? 155 : 120;
  const feeColWidth = isTouch ? feeColWidthTouch : feeColWidthNoTouch;

  let feePerBrkt = 0;

  const setBrktColsValues = (
    value: number,
    row: GridRowModel,
    column: GridColDef
  ) => {
    const numBrkts = value ? Math.trunc(Number(value)) : 0;
    if (!validBrkts(numBrkts)) return row;
    const brktId = getBrktIdFromColName(column.field);
    const feeName = entryFeeColName(brktId);           // get fee per brkt field name
    if (isNaN(numBrkts) || isNaN(feePerBrkt)) return row;
    const fee = numBrkts * feePerBrkt;
    const tsColName = timeStampColName(brktId);
    const timeStamp = new Date().getTime();
    // no column for time stamp (tsColName), but row object has the property 
    return {
      ...row,
      [column.field]: numBrkts,
      [feeName]: fee,
      [tsColName]: timeStamp,
    };
  };

  const brktColumns: GridColDef[] = [];
  brkts.forEach((brkt) => {
    feePerBrkt = brkt.fee ? Number(brkt.fee) : 0;

    const numBrktsColumn: GridColDef = {
      field: entryNumBrktsColName(brkt.id),
      headerName: getBrktOrElimName(brkt, divs),
      description: getBrktOrElimName(brkt, divs),
      headerAlign: "center",      
      headerClassName: styles.brktsHeader,
      width: numBrktsColWidth,
      editable: true,
      align: "center",
      renderEditCell: (params: any) => (
        <GridEditInputCell
          {...params}
          inputProps={{
            max: maxBrackets,
            min: 0,
          }}
        />
      ),
      cellClassName: (params: any) =>
        applyNumBrktsCellColor(params.value as number),
      valueGetter: getOnlyIntegerOrNull,
      valueSetter: setBrktColsValues,
      valueFormatter: formatIntZeroAsBlank,
    };
    brktColumns.push(numBrktsColumn);
    const feeForbrktsColumn: GridColDef = {
      field: entryFeeColName(brkt.id),
      headerName: "Fee",
      description: "Fee",
      headerAlign: "right",
      headerClassName: styles.brktsHeader,
      width: feeColWidth,
      align: "right",
      valueFormatter: formatFee,
    };
    brktColumns.push(feeForbrktsColumn);
  });

  return brktColumns;
};

/**
 * check if column name is an eliminator fee column
 * NOTE: does not check for valid uuid in middle of column name
 * 
 * @param {string} colName - column name to check
 * @returns {boolean} - true if column name is an eliminator fee column
 */
export const isElimFeeColumnName = (colName: string): boolean => { 
  if (!colName || typeof colName !== "string") return false;
  return (colName.startsWith('elm')
    && colName.endsWith(feeColNameEnd)) 
    ? true : false;  
}

/**
 * gets the eliminator fee
 * 
 * @param {elimType[]} elims - array of tournament eliminators
 * @param {string} elimId - eliminator id
 * @returns - eliminator fee
 */
export const getElimFee = (elims: elimType[], elimId: string) => {
  if (!elims || elims.length === 0 || !elimId) return 0;
  const elim = elims.find((elim) => elim.id === elimId);
  return elim ? Number(elim.fee) : 0;
};

/**
 * creates columns for eliminator section of entries grid
 * 
 * @param {elimType[]} elims - array of tournament eliminators to create columns for
 * @param {divType[]} divs - array of tournament divisions 
 * @returns {GridColDef[]} - array of column definitions for eliminator section 
 */
export const createElimEntryColumns = (
  elims: elimType[],
  divs: divType[]
): GridColDef[] => {  

  const isTouch = isTouchDevice();
  const feeColWidth = isTouch ? 160 : feeColWidthNoTouch;
  
  const elimColumns: GridColDef[] = [];
  elims.forEach((elim) => {
    const feeColumn: GridColDef = {
      field: entryFeeColName(elim.id),
      headerName: getBrktOrElimName(elim, divs),
      description: getBrktOrElimName(elim, divs),      
      headerClassName: styles.elimsHeader,
      headerAlign: "center",
      type: "number",
      width: feeColWidth,
      editable: true,
      align: "right",
      renderEditCell: (params: any) => (
        <GridEditInputCell
          {...params}
          inputProps={{
            max: elim.fee,
            min: 0,
          }}
        />
      ),
      cellClassName: (params: any) =>
        applyPotOrElimFeeCellColor(params.value as number, Number(elim.fee)),
      valueGetter: valueGetterForMoney,
      valueParser: valueParserForMoney,
      valueFormatter: formatFee,
    };
    elimColumns.push(feeColumn);
  });
  return elimColumns;
};

/**
 * creates column for fee total
 * 
 * @returns {GridColDef[]} - array of column definitions for fee total
 */
export const feeTotalColumn = (): GridColDef[] => {
  const isTouch = isTouchDevice();
  const feeColWidth = isTouch ? 160 : feeColWidthNoTouch;

  const totalColumn: GridColDef[] = [
    {
      field: "feeTotal", // don't end with "fee"
      headerName: "Total Fee",
      description: "Total Fee",      
      headerClassName: styles.totalHeader,
      headerAlign: "center",
      width: feeColWidth,
      align: "right",
      valueFormatter: formatFeeBlankAsZero,
    },
  ];
  return totalColumn;
};

export const exportedForTesting2 = {
  formatFee,  
  formatFeeBlankAsZero,
  validBrkts,
  applyPotOrElimFeeCellColor,
  applyNumBrktsCellColor,
}