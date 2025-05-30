import { brktType, divType, elimType, potType } from "@/lib/types/types";
import { maxAverage, maxBrackets, maxMoney } from "@/lib/validation";
import {
  GridColDef,
  GridEditInputCell,
  GridRenderCellParams,
  GridRowModel,
  GridRowModesModel,
} from "@mui/x-data-grid";
import { currencyFormatter } from "@/lib/currency/formatValue";
import { getBrktOrElimName } from "@/lib/getName";
import { convertToString } from "@/lib/convert";
import { validAverage } from "@/app/api/players/validate";
import { sanitize } from "@/lib/sanitize";

export const brktsColNameEnd = "_brkts";
export const feeColNameEnd = "_fee";
export const hdcpColNameEnd = "_hdcp";
export const intHdcpColNameEnd = "_intHdcp";
export const refundsColNameEnd = "_refunds";
export const timeStampColNameEnd = "_timeStamp";
export const feeColWidth = 95;

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
 * @returns {integer | null} - integer or null
 */
export const getOnlyIntegerOrNull = (value: number) => {
  if ((!value || isNaN(value) || typeof value === 'string') && value !== 0) return null;  
  return Math.trunc(value);
};

/**
 * checks if the value a valid bowling average
 *
 * @param {number} value - value to validate
 * @returns {boolean} - true if value is valid
 */
export const isValidAverage = (value: number) => {
  if (value === null || isNaN(value)) return false;
  return value >= 0 && value <= maxAverage;
};

/**
 * gets the css class name for the value cell
 *
 * @param {number} value - current average value
 * @returns {string} - css class name
 */
export const applyAverageCellColor = (value: number) => {
  if (!value) return "";
  if (!isValidAverage(value)) return "cellError";
  return "";
};

/**
 * gets the position, only first char of value passed
 *
 * @param {string} value - postion value
 * @returns {string} - position
 */
export const getPosition = (value: string) => {
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
export const formatIntZeroAsBlank = (value: number) => {
  if (!value || value === 0) return "";
  return value.toString();
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

  const firstNameSettter = (value: string, row: GridRowModel) => { 
    if (!value) return row;
    let firstName = sanitize(value)
    return {
      ...row,
      first_name: firstName
    }
  }

  const lastNameSettter = (value: string, row: GridRowModel) => { 
    if (!value) return row;
    let lastName = sanitize(value)
    return {
      ...row,
      last_name: lastName
    }
  }

  const setHdcps = (value: number, row: GridRowModesModel) => {
    const average = value ? Math.trunc(Number(value)) : 0;
    if (!validAverage(average)) return row;

    let newRow = { ...row };
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
        average: average,
        [divHdcpName]: hdcp,
      } as typeof playerEntryData;
    });
    return newRow;
  };

  const isValidLane = (value: number) => value >= minLane && value <= maxLane;
  const applyLaneCellColor = (value: number) => {
    if (
      value === null ||
      value === undefined ||
      (typeof value === "string" && (value as string) === "")
    )
      return "";
    if (typeof value !== "number" || !isValidLane(value)) return "cellError";
    return "";
  };
  const setLaneAndLanePos = (value: number, row: GridRowModel) => {
    let lane = (value) ? Math.trunc(value) : null;
    if (lane === 0) lane = null;
    const position = row.position;
    const lanePos = (lane && isValidLane(lane) && position) ? lane + "-" + position : "";
    return {
      ...row,
      lane,
      lanePos,
    };
  };
  const setPositionAndLanePos = (value: string, row: GridRowModel) => {
    const lane = (row.lane && isValidLane(row.lane)) ? row.lane : null;
    let position = value ? value.toString() : null;
    if (position && position.length >= 1) {
      position = position[0] === " " ? null : position[0];
    }
    const lanePos = lane && position ? lane + "-" + position : "";
    return {
      ...row,
      position,
      lanePos,
    };
  };

  const playersColumns: GridColDef[] = [
    {
      field: "first_name",
      headerName: "First Name",
      description: "First Name",
      headerClassName: "playersHeader",
      editable: true,
      width: 120,
      valueSetter: firstNameSettter
    },
    {
      field: "last_name",
      headerName: "Last Name",
      description: "Last Name",
      headerClassName: "playersHeader",
      editable: true,
      width: 120,
      valueSetter: lastNameSettter
    },
    {
      field: "average",
      headerName: "Average",
      description: "Average",
      headerClassName: "playersHeader",
      headerAlign: "center",
      editable: true,
      width: 80,
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
      valueGetter: (value: any) =>
        Math.round((Number(value) + Number.EPSILON) * 100) / 100,
      valueSetter: setHdcps,
    },
    {
      field: "lane",
      headerName: "Lane #",
      description: "Lane #",
      headerClassName: "playersHeader",
      headerAlign: "center",
      editable: true,
      width: 70,
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
      headerClassName: "playersHeader",
      headerAlign: "center",
      editable: true,
      width: 80,
      align: "center",
      valueGetter: getPosition,
      valueSetter: setPositionAndLanePos,
    },
    {
      field: "lanePos",
      headerName: "Lane-Pos",
      description: "Lane Position",
      headerClassName: "playersHeader",
      headerAlign: "center",
      width: 80,
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

const formatFee = (value: number) => {
  if (!value) return "";
  if (isNaN(value)) return currencyFormatter.format(0);
  const roundedValue = Math.round((value) * 100) / 100
  return currencyFormatter.format(roundedValue);
};

const formatFeeBlankAsZero = (value: number) => {
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

  const isValidDivFee = (value: number) => value >= 0 && value <= maxMoney;
  const applyDivFeeCellColor = (value: number) => {
    if (
      value === null ||
      value === undefined ||
      (typeof value === "string" && (value as string) === "") ||
      (typeof value === "number" && isNaN(value))
    )
      return "";
    if (typeof value !== "number" || !isValidDivFee(value)) return "cellError";
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
      headerClassName: "divsHeader",
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
      valueGetter: (value: any) => Math.round((Number(value) + Number.EPSILON) * 100) / 100,
      valueParser: (value: any) => value.replace("$", ""),      
      valueFormatter: formatFee,
    };
    divColumns.push(feeColumn);    
    const hdcpColumn: GridColDef = {
      field: divEntryHdcpColName(div.id),
      headerName: "HDCP",
      description: "HDCP",
      headerClassName: "divsHeader",
      headerAlign: "center",
      type: "number",
      width: 80,
      align: "center",      
      valueFormatter: formatHdcp,       
      disableExport: div.int_hdcp, // cant export Hdcp column, so stick intHdcp value here
    };
    divColumns.push(hdcpColumn);
  });
  return divColumns;
};

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
 * @param {number} value - pot or elim entry fee
 * @param {number} fee - pot or elim fee
 * @returns {boolean} - true if entry fee === 0 || entry fee === fee
 */
export const isValidFee = (value: number, fee: number) => {
  if (value === null || value === undefined) return true;
  if (isNaN(value)) return false;
  if (typeof value !== "number") value = Number(value);
  return value === 0 || value === fee ? true : false;
};

const applyPotOrElimFeeCellColor = (value: number, fee: number) => {
  if (!value) return "";
  if (!isValidFee(value, fee)) return "cellError";
  return "";
};

/**
 * creates columns for pot section of entries grid
 * 
 * @param {potType[]} pots - array of tournament pots to create columns for
 * @returns {GridColDef[]} - array of column definitions for pot section
 */
export const createPotEntryColumns = (pots: potType[]): GridColDef[] => {
  const potColumns: GridColDef[] = [];
  pots.forEach((pot) => {
    const feeColumn: GridColDef = {
      field: entryFeeColName(pot.id),
      headerName: pot.pot_type,
      description: pot.pot_type,
      headerClassName: "potsHeader",
      headerAlign: "center",
      type: "number",
      width: feeColWidth,
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
      valueGetter: (value: any) =>
        Math.round((Number(value) + Number.EPSILON) * 100) / 100,
      valueParser: (value: any) => value.replace("$", ""),
      valueFormatter: formatFee,
    };
    potColumns.push(feeColumn);
  });
  return potColumns;
};

export const entryNumBrktsColName = (id: string) => id + brktsColNameEnd;
export const entryNumRefundsColName = (id: string) => id + refundsColNameEnd;

const validBrkts = (value: number) => value >= 0 && value <= maxBrackets;
const applyNumBrktsCellColor = (value: number) => {
  if (!value) return "";
  if (!validBrkts(value)) return "cellError";
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
  let feePerBrkt = 0;

  const setBrktColsValues = (
    value: number,
    row: GridRowModel,
    column: GridColDef
  ) => {
    const numBrkts = value ? Math.trunc(Number(value)) : 0;
    if (!validBrkts(numBrkts)) return row;
    const brktId = column.field.slice(0, -5); // remove '_name'
    const feeName = entryFeeColName(brktId);  // get fee per brkt field name
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
      headerClassName: "brktsHeader",
      width: 110,
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
      headerClassName: "brktsHeader",
      width: feeColWidth,
      align: "right",
      valueFormatter: formatFee,
    };
    brktColumns.push(feeForbrktsColumn);
  });

  return brktColumns;
};

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
  const elimColumns: GridColDef[] = [];
  elims.forEach((elim) => {
    const feeColumn: GridColDef = {
      field: entryFeeColName(elim.id),
      headerName: getBrktOrElimName(elim, divs),
      description: getBrktOrElimName(elim, divs),
      headerClassName: "elimsHeader",
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
      valueGetter: (value: any) =>
        Math.round((Number(value) + Number.EPSILON) * 100) / 100,
      valueParser: (value: any) => value.replace("$", ""),
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
  const totalColumn: GridColDef[] = [
    {
      field: "feeTotal", // don't end with "fee"
      headerName: "Total Fee",
      description: "Total Fee",
      headerClassName: "totalHeader",
      headerAlign: "center",
      width: feeColWidth,
      align: "right",
      valueFormatter: formatFeeBlankAsZero,
    },
  ];
  return totalColumn;
};
