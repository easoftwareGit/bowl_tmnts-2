import { dataOneTmntType } from "@/lib/types/types"
import { entryFeeColName, entryNumBrktsColName, getElimFee, getPotFee, isValidFee, playerEntryData } from "./createColumns"
import { GridRowModel } from "@mui/x-data-grid";
import { fullName } from "@/lib/getName";
import { maxBrackets, maxMoney } from "@/lib/validation";

export type errInfoType = {
  id: string;
  msg: string;
}

/**
 * gets the name of a player on a row, or lane position or row number
 * 
 * @param {typeof playerEntryData[]} rows - array of playerEntryData
 * @param {GridRowModel} currRow - current row
 * @returns {string} - name of player, or "player at Lane position" or "player on row" 
 */
export const getRowPlayerName = (rows: typeof playerEntryData[], currRow: GridRowModel) => {
  let name = fullName(currRow.first_name, currRow.last_name);
  if (name === "") {
    if (currRow.lanePos !== "") {
      name = "player at Lane position " + currRow.lanePos;
    } else {
      const index = rows.findIndex((row) => row.index === currRow.id);
      name = "player on row " + (index + 1);
    }
  }
  return name;
};

/**
 * gets an error message if a player's fee(s) for a division(s) is/are invalid
 * 
 * @param {typeof playerEntryData} row - current row
 * @param {dataOneTmntType} tmntData - current tournament data 
 * @param {string} errPlayer - name of player
 * @param {number} i - row's index
 * @returns - error message if got an error or empty string
 */
const validDivs = (row: typeof playerEntryData, tmntData: dataOneTmntType, errPlayer: string, i: number): string => {
  let errMsg = '';
  for (const div of tmntData.divs) {
    const feeColName = entryFeeColName(div.id);
    let fee = (row[feeColName] || 0)
    if (!isNaN(fee)) { 
      fee = Number(fee);
    }
    if (typeof fee !== 'number' || fee < 0 || fee > maxMoney) {
      errMsg = "Invalid Fee for " + errPlayer + " in row " + (i + 1);
      break;
    }
  }
  return errMsg;
}

/**
 * gets an error message if a player's pot fee(s) is/are invalid
 * 
 * @param {typeof playerEntryData} row - current row
 * @param {dataOneTmntType} tmntData - current tournament data 
 * @param {string} errPlayer - name of player
 * @param {number} i - row's index
 * @returns - error message if got an error or empty string
 */
const validPots = (row: typeof playerEntryData, tmntData: dataOneTmntType, errPlayer: string, i: number): string => {
  let errMsg = '';
  for (const pot of tmntData.pots) {
    const feeColName = entryFeeColName(pot.id);
    const potFee = getPotFee(tmntData.pots, pot.id);
    if (potFee === 0) {
      errMsg =
        "Missing Pot Fee for " + row[feeColName] + " in row " + (i + 1);
      break;
    }
    if (!isValidFee((row[feeColName] || 0), potFee)) {
      errMsg = "Invalid Pot Fee for " + errPlayer + " in row " + (i + 1);
      break;
    }
  }
  return errMsg;
}

/**
 * gets an error message if a player's bracket(s) is/are invalid
 * 
 * @param {typeof playerEntryData} row - current row
 * @param {dataOneTmntType} tmntData - current tournament data 
 * @param {string} errPlayer - name of player
 * @param {number} i - row's index
 * @returns - error message if got an error or empty string
 */
const validBrkts = (row: typeof playerEntryData, tmntData: dataOneTmntType, errPlayer: string, i: number): string => {
  let errMsg = '';
  for (const brkt of tmntData.brkts) {
    const numBrktsColumnName = entryNumBrktsColName(brkt.id);
    if (!(!row[numBrktsColumnName] || row[numBrktsColumnName] === 0)) {
      if (row[numBrktsColumnName] < 0) {
        errMsg =
          "Number of brackets is less than 0 for " +
          errPlayer +
          " in row " +
          (i + 1);
      } else if (row[numBrktsColumnName] > maxBrackets) {
        errMsg =
          "Number of brackets is more than " +
          maxBrackets +
          " for " +
          errPlayer +
          " in row " +
          (i + 1);
      }
    }
  }
  return errMsg;
}

/**
 * gets an error message if a player's elim(s) fee(s) is/are invalid
 * 
 * @param {typeof playerEntryData} row - current row
 * @param {dataOneTmntType} tmntData - current tournament data 
 * @param {string} errPlayer - name of player
 * @param {number} i - row's index
 * @returns - error message if got an error or empty string
 */
const validElims = (row: typeof playerEntryData, tmntData: dataOneTmntType, errPlayer: string, i: number): string => {
  let errMsg = '';
  for (const elim of tmntData.elims) {      
    const feeColName = entryFeeColName(elim.id);
    const elimFee = getElimFee(tmntData.elims, elim.id);
    if (elimFee === 0) {
      errMsg = 
        "Missing Eliminator Fee for " +
        row[feeColName] +
        " in row " +
        (i + 1);
      break;
    }        
    if (!isValidFee((row[feeColName] || 0), elimFee)) {
      errMsg =
        "Invalid Eliminator Fee for " + errPlayer + " in row " + (i + 1);
      break;
    }
  }
  return errMsg;
}

/**
 * finds the next error in the rows
 * 
 * @param {typeof playerEntryData[]} rows - array of playerEntryData
 * @param {dataOneTmntType} tmntData - current tournament data
 * @returns {errInfoType} - error info object - if no error, id = "", errMsg = ""
 */
export const findNextError = (rows: typeof playerEntryData[], tmntData: dataOneTmntType ): errInfoType => {
  
  let errId = "";
  let errMsg = "";
  const squadMinLane = tmntData.lanes[0]?.lane_number;
  const squadMaxLane = tmntData.lanes[tmntData.lanes.length - 1]?.lane_number;
  // use: for (let i = 0; i < rows.length; i++) { here, because need i
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    errId = row.id;
    if (!row.first_name || row.first_name === "") {
      errMsg = "Missing First Name in row " + (i + 1);
      break;
    } else if (!row.last_name || row.last_name === "") {
      errMsg = "Missing Last Name in row " + (i + 1);
      break;
    }
    const errPlayer = getRowPlayerName(rows, row);
    if (
      !row.lane ||
      row.lane === 0 ||
      row.lane < squadMinLane ||
      row.lane > squadMaxLane
    ) {
      errMsg = "Invalid Lane for " + errPlayer + " in row " + (i + 1);
      break;
    }
    if (!row.position || row.position === "") {
      errMsg = "Missing Position for " + errPlayer + " in row " + (i + 1);
      break;
    }
    errMsg = validDivs(row, tmntData, errPlayer, i);
    if (errMsg !== "") break;
    errMsg = validPots(row, tmntData, errPlayer, i);
    if (errMsg !== "") break;
    errMsg = validBrkts(row, tmntData, errPlayer, i);
    if (errMsg !== "") break;
    errMsg = validElims(row, tmntData, errPlayer, i);
    if (errMsg !== "") break;
  }
  return { id: errId, msg: errMsg };  
}

/**
 * finds the next error in the rows when user wants to save
 * 
 * @param {typeof playerEntryData[]} rows - array of playerEntryData
 * @param {dataOneTmntType} tmntData - current tournament data
 * @returns {errInfoType} - error info object - if no error, id = "", errMsg = ""
 */
export const getCanSaveErr = (rows: typeof playerEntryData[], tmntData: dataOneTmntType): errInfoType => { 

  // all rows must have
  // - first name or last name
  // - first name + last name must be unique
  // - if got lane, must be valid
  // - if got div entries, must be a valid fee
  // - if got pot entryies, must be valid
  // - if got brkt entries, must be valid
  // - if got elim entryies, must be valid

  let errId = "";
  let errMsg = "";
  const names = new Set<string>();
  const squadMinLane = tmntData.lanes[0]?.lane_number;
  const squadMaxLane = tmntData.lanes[tmntData.lanes.length - 1]?.lane_number;
  // use: for (let i = 0; i < rows.length; i++) { here, because need i
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    errId = row.id;
    if (!row.first_name || row.first_name === "") {
      errMsg = "Missing First Name in row " + (i + 1);
      break;
    }
    if (!row.last_name || row.last_name === "") {
      errMsg = "Missing Last Name in row " + (i + 1);
      break;
    }
    const name = fullName(row.first_name, row.last_name);
    if (names.has(name)) {
      errMsg = "Duplicate Player Name in row " + (i + 1);
      break;
    }
    names.add(name);
    const errPlayer = getRowPlayerName(rows, row);
    if (
      row.lane && (
        row.lane === 0 ||
        row.lane < squadMinLane ||
        row.lane > squadMaxLane)
    ) {
      errMsg = "Invalid Lane for " + errPlayer + " in row " + (i + 1);
      break;
    }
    errMsg = validDivs(row, tmntData, errPlayer, i);
    if (errMsg !== "") break;
    errMsg = validPots(row, tmntData, errPlayer, i);
    if (errMsg !== "") break;
    errMsg = validBrkts(row, tmntData, errPlayer, i);
    if (errMsg !== "") break;
    errMsg = validElims(row, tmntData, errPlayer, i);
    if (errMsg !== "") break;
  } 
  return { id: errId, msg: errMsg }; 
}