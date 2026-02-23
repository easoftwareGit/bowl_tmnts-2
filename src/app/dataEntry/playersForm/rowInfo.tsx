import type { tmntFullType } from "@/lib/types/types";
import {
  brktsColNameEnd,
  entryFeeColName,
  entryNumBrktsColName,
  feeColNameEnd,
  getElimFee,
  getPotFee,
  isValidFee,  
} from "./createColumns";
import { GridRowModel } from "@mui/x-data-grid";
import { fullName, getBrktOrElimName, getDivName, getPotShortName } from "@/lib/getName";
import { maxAverage, maxBrackets, maxMoney } from "@/lib/validation/validation";
import { BracketList } from "@/components/brackets/bracketListClass";
import { defaultBrktPlayers } from "@/lib/db/initVals";
import type { playerEntryRow } from "./populateRows";

export const validPosChars = /^[a-zA-Z1-9]+$/;

export type errInfoType = {
  id: string;
  msg: string;
};

export enum CheckType {
  PRELIM,
  FINAL,
}

/**
 * gets the name of a player on a row, or lane position or row number
 *
 * @param {playerEntryRow[]} rows - array of playerEntryRows
 * @param {GridRowModel} currRow - current row
 * @returns {string} - name of player, or "player at Lane position" or "player on row"
 */
export const getRowPlayerName = (
  rows: playerEntryRow[],
  currRow: GridRowModel
) => {
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
 * checks if the average is valid
 *
 * @param {playerEntryRow} row - current row of playerEntryRow in data grid
 * @param {string} errPlayer - name of player
 * @param {number} i - row's index
 * @param {CheckType} checkType - type of check (Prelim or Final)
 * @returns {string} - error message if got an error or empty string
 */
const validAverage = (
  row: playerEntryRow,
  errPlayer: string,
  i: number,
  checkType: CheckType
): string => {
  if (
    row.average == null ||
    (typeof row.average === "number" && row.average === 0)
  ) {
    return checkType === CheckType.PRELIM
      ? ""
      : "Missing Average for " + errPlayer + " in row " + (i + 1);
  }
  return typeof row.average !== "number" ||
    !Number.isInteger(row.average) ||
    row.average < 0 ||
    row.average > maxAverage
    ? "Invalid Average for " + errPlayer + " in row " + (i + 1)
    : "";
};

/**
 * checks if the lane is valid
 *
 * @param {playerEntryRow} row - current row of playerEntryRow in data grid
 * @param {number} minLane - minimum lane number
 * @param {number} maxLane - maximum lane number
 * @param {string} errPlayer - name of player
 * @param {number} i - row's index
 * @param {CheckType} checkType - type of check (Prelim or Final)
 * @returns {string} - error message if got an error or empty string
 */
const validLane = (
  row: playerEntryRow,
  minLane: number,
  maxLane: number,
  errPlayer: string,
  i: number,
  checkType: CheckType
): string => {
  if (row.lane == null || (typeof row.lane === "number" && row.lane === 0)) {
    return checkType === CheckType.PRELIM
      ? ""
      : "Missing Lane for " + errPlayer + " in row " + (i + 1);
  }
  return typeof row.lane !== "number" ||
    !Number.isInteger(row.lane) ||
    row.lane < minLane ||
    row.lane > maxLane
      ? "Invalid Lane for " + errPlayer + " in row " + (i + 1)
      : "";
};

/**
 * checks if the position is blank or valid
 *
 * @param {playerEntryRow} row - current row of playerEntryRow in data grid
 * @param {string} errPlayer - name of player
 * @param {number} i - row's index
 * @param {CheckType} checkType - type of check (Prelim or Final)
 * @returns {string} - error message if got an error or empty string
 */
const validPosition = (
  row: playerEntryRow,
  errPlayer: string,
  i: number,
  checkType: CheckType
): string => {
  if (row.position == null || row.position === "") {
    return checkType === CheckType.PRELIM
      ? ""
      : "Missing Position for " + errPlayer + " in row " + (i + 1);
  }
  return !row.position ||
    row.position.length !== 1 ||
    !validPosChars.test(row.position[0])
    ? "Invalid Position for " + errPlayer + " in row " + (i + 1)
    : "";
};

/**
 * gets an error message if a player's fee(s) for a division(s) is/are invalid
 *
 * @param {playerEntryRow} row - current row
 * @param {tmntFullType} tmntData - current tournament data
 * @param {string} errPlayer - name of player
 * @param {number} i - row's index
 * @param {CheckType} checkType - type of check (Prelim or Final)
 * @returns - error message if got an error or empty string
 */
const validDivs = (
  row: playerEntryRow,
  tmntData: tmntFullType,
  errPlayer: string,
  i: number,
  checkType: CheckType
): string => {
  let errMsg = "";
  let gotDiv = false;
  for (const div of tmntData.divs) {
    const feeColName = entryFeeColName(div.id);
    let feeNumber = 0; // if null treat as 0
    if (row[feeColName] != null) {
      feeNumber = Number(row[feeColName]); // row[feeColName] might be a string
      if (Number.isNaN(feeNumber)) {
        feeNumber = -1; // -1 is invalid
      }
    }
    if (feeNumber < 0 || feeNumber > maxMoney) {
      errMsg = "Invalid Fee for " + errPlayer + " in row " + (i + 1);
      break;
    } else if (feeNumber > 0) {  // must have a fee > 0 to have a division entry
      gotDiv = true;
    }
  }
  // returns error if found error, or "" if no error and checkType is Prelim
  if (errMsg !== "" || checkType === CheckType.PRELIM) return errMsg;
  // if check type is Final, returns error if no fee in any division
  return !gotDiv
    ? "Missing Division Fee for " + errPlayer + " in row " + (i + 1)
    : "";
};

/**
 * gets an error message if a player's pot fee(s) is/are invalid
 *
 * @param {playerEntryRow} row - current row
 * @param {tmntFullType} tmntData - current tournament data
 * @param {string[]} playerDivIds - player's division ids
 * @param {string} errPlayer - name of player
 * @param {number} i - row's index
 * @returns - error message if got an error or empty string
 */
const validPots = (
  row: playerEntryRow,
  tmntData: tmntFullType,
  playerDivIds: string[],
  errPlayer: string,
  i: number
): string => {
  let errMsg = "";
  for (const pot of tmntData.pots) {
    const feeColName = entryFeeColName(pot.id);
    const potFee = getPotFee(tmntData.pots, pot.id);
    const potShortName = getPotShortName(pot, tmntData.divs);
    if (!isValidFee(row[feeColName] || 0, potFee)) {
      errMsg = `Invalid pot fee in ${potShortName} for ${errPlayer} in row ${i + 1}`;
      break;
    }
    // if got a pot entry, check if player has a div entry
    // player can't enter hdcp pots if not in hdcp division
    if (row[feeColName] && row[feeColName] > 0) {
      const potDivId = pot.div_id;
      if (!playerDivIds.includes(potDivId)) {
        errMsg = `${errPlayer} is not entered in the division for pot ${potShortName} in row ${i + 1}`;
        break;
      }
    }
  }
  return errMsg;
};

/**
 * gets an error message if a player's bracket(s) is/are invalid
 *
 * @param {playerEntryRow} row - current row
 * @param {tmntFullType} tmntData - current tournament data
 * @param {string[]} playerDivIds - player's division ids
 * @param {string} errPlayer - name of player
 * @param {number} i - row's index
 * @returns - error message if got an error or empty string
 */
const validBrkts = (
  row: playerEntryRow,
  tmntData: tmntFullType,
  playerDivIds: string[],
  errPlayer: string,
  i: number
): string => {
  let errMsg = "";
  for (const brkt of tmntData.brkts) {
    const numBrktsColumnName = entryNumBrktsColName(brkt.id);
    const brktName = getBrktOrElimName(brkt, tmntData.divs);
    if (!(!row[numBrktsColumnName] || row[numBrktsColumnName] === 0)) {
      if (row[numBrktsColumnName] < 0) {
        errMsg = `Number of brackets in ${brktName} is less than 0 for ${errPlayer} in row ${
          i + 1
        }`;
        break;
      } else if (row[numBrktsColumnName] > maxBrackets) {
        errMsg = `Number of brackets in ${brktName} is more than ${maxBrackets} for ${errPlayer} in row ${
          i + 1
        }`;
        break;
      }
      // if got a brkt entry, check if player has a div entry
      // player can't enter hdcp brkts if not in hdcp division
      if (row[numBrktsColumnName] && row[numBrktsColumnName] > 0) {
        const brktDivId = brkt.div_id;
        const divFeeColName = entryFeeColName(brktDivId);
        if (!row[divFeeColName] || row[divFeeColName] === 0) {
          if (!playerDivIds.includes(brktDivId)) {
            const brktName = getBrktOrElimName(brkt, tmntData.divs);            
            errMsg = `${errPlayer} is not entered in the division for bracket ${brktName} in row ${i + 1}`;
            break;
          }
        }
      }
    }
  }
  return errMsg;
};

/**
 * gets an error message if a player's elim(s) fee(s) is/are invalid
 *
 * @param {playerEntryRow} row - current row
 * @param {tmntFullType} tmntData - current tournament data
 * @param {string[]} playerDivIds - player's division ids
 * @param {string} errPlayer - name of player
 * @param {number} i - row's index
 * @returns - error message if got an error or empty string
 */
const validElims = (
  row: playerEntryRow,
  tmntData: tmntFullType,
  playerDivIds: string[],
  errPlayer: string,
  i: number
): string => {
  let errMsg = "";
  for (const elim of tmntData.elims) {
    const feeColName = entryFeeColName(elim.id);
    const elimFee = getElimFee(tmntData.elims, elim.id);
    const elimName = getBrktOrElimName(elim, tmntData.divs);
    if (!isValidFee(row[feeColName] || 0, elimFee)) {
      errMsg = `Invalid eliminator fee in ${elimName} for ${errPlayer} in row ${(i + 1)}`;
      break;
    }
    // if got an elim entry, check if player has a div entry
    // player can't enter hdcp elims if not in hdcp division
    if (row[feeColName] && row[feeColName] > 0) {
      const elimDivId = elim.div_id;
      if (!playerDivIds.includes(elimDivId)) {
        errMsg = `${errPlayer} is not entered in the division for eliminator ${elimName} in row ${
          i + 1
        }`;
        break;
      }
    }
  }
  return errMsg;
};

/**
 * finds the next error in the rows
 *
 * @param {playerEntryRow[]} rows - array of playerEntryRows
 * @param {tmntFullType} tmntData - current tournament data
 * @param {CheckType} checkType - type of check (Prelim or Final)
 * @returns {errInfoType} - error info object - if no error, id = "", errMsg = ""
 */
export const findNextError = (
  rows: playerEntryRow[],
  tmntData: tmntFullType,
  checkType: CheckType
): errInfoType => {
  // for prelim check, all rows must have:
  // - first name AND last name
  // - first name + last name must be unique
  // - if got an average, must be valid
  // - if got lane, must be valid
  // - if got position, must be valid
  // - if got div entries, must be a valid fee
  // - if got pot entryies, must be valid
  // - if got brkt entries, must be valid
  // - if got elim entryies, must be valid
  // for final check, all rows must have:
  // - first name AND last name
  // - first name + last name must be unique
  // - average must be valid
  // - lane must be valid
  // - position must be valid
  // - if got div entries, must be a valid fee
  // - if got pot entryies, must be valid
  // - if got brkt entries, must be valid
  // - if got elim entryies, must be valid

  if (!rows || (rows.length === 0 && checkType === CheckType.FINAL)) {
    return { id: "none", msg: "No players in the tournament" };
  }
  if (!tmntData || !tmntData.tmnt) {
    return { id: "none", msg: "No tournament data" };
  }
  if (!tmntData.events || tmntData.events.length === 0) {
    return { id: "none", msg: "No event in the tournament" };
  }
  if (!tmntData.divs || tmntData.divs.length === 0) {
    return { id: "none", msg: "No divison in the tournament" };
  }
  if (!tmntData.squads || tmntData.squads.length === 0) {
    return { id: "none", msg: "No squad in the tournament" };
  }
  if (!tmntData.lanes || tmntData.lanes.length === 0) {
    return { id: "none", msg: "No lanes in the tournament" };
  }

  let errId = "";
  let errMsg = "";
  const names = new Set<string>();
  const lanePos = new Set<string>();
  const squadMinLane = tmntData.lanes[0]?.lane_number;
  const squadMaxLane = tmntData.lanes[tmntData.lanes.length - 1]?.lane_number;

  // use: for (let i = 0; i < rows.length; i++) { here, because need i to break
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
    // const name = fullName(row.first_name, row.last_name);
    const nameKey = fullName(row.first_name, row.last_name).trim().toLowerCase();
    if (names.has(nameKey)) {
      const name = fullName(row.first_name, row.last_name);
      errMsg = `Duplicate Player Name "${name}" in row ${i + 1}`;
      break;
    }
    names.add(nameKey);
    const errPlayer = getRowPlayerName(rows, row);
    errMsg = validAverage(row, errPlayer, i, checkType);
    if (errMsg !== "") break;
    errMsg = validLane(
      row,
      squadMinLane,
      squadMaxLane,
      errPlayer,
      i,
      checkType
    );
    if (errMsg !== "") break;
    errMsg = validPosition(row, errPlayer, i, checkType);
    if (errMsg !== "") break;
    // only check lane/position when CheckType is FINAL
    if (checkType === CheckType.FINAL) {
      const lanePosKey = `${row.lane}-${String(row.position).toUpperCase()}`;
      if (lanePos.has(lanePosKey)) {      
        errMsg = `Duplicate Lane/Position ${lanePosKey} in row ${i + 1}`
        break;
      }
      lanePos.add(lanePosKey);      
    }
    if (errMsg !== "") break;
    errMsg = validDivs(row, tmntData, errPlayer, i, checkType);
    if (errMsg !== "") break;

    // get the list of division the player has entered
    const playerDivIds: string[] = [];
    for (const div of tmntData.divs) {
      const feeColName = entryFeeColName(div.id);
      if (row[feeColName] != null) { 
        const feeNumber = Number(row[feeColName]); // row[feeColName] might be a string
        if (!Number.isNaN(feeNumber) && feeNumber !== 0) { 
          if (!playerDivIds.includes(div.id)) {
            playerDivIds.push(div.id);  
          } 
        }
      }
    }

    errMsg = validPots(row, tmntData, playerDivIds, errPlayer, i);
    if (errMsg !== "") break;
    errMsg = validBrkts(row, tmntData, playerDivIds, errPlayer, i);
    if (errMsg !== "") break;
    errMsg = validElims(row, tmntData, playerDivIds, errPlayer, i);
    if (errMsg !== "") break;
  }
  return { id: errId, msg: errMsg };
};

/**
 * returns the counts of divs, pots, brkts and elims entries
 *
 * @param {Record<string, number>} entriesCount - counts of entries in divs, pots, elims (not brkts)
 * @param {Record<string, BracketList>} allBrktsList - all brackets list, with brktEntries
 * @returns {Record<string, number>} - counts of divs, pots, brkts and elims entries
 */
export const getDivsPotsBrktsElimsCounts = (
  entriesCount: Record<string, number>,
  allBrktsList: Record<string, BracketList>
): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const key in entriesCount) {
    counts[key] = 0; // Initialize all non-bracket keys to 0
  }
  // Count the number of entries in each category
  for (const key in counts) {
    if (key.endsWith(feeColNameEnd)) {
      // divs, pots, elims
      counts[key] = entriesCount[key];
    }
  }
  // a player can enter multiple brackets, count # of players, not # entries
  for (const key in allBrktsList) {
    // brkts
    counts[key + brktsColNameEnd] = allBrktsList[key].brktEntries.length;
  }
  return counts;
};

/**
 * returns error message if any of the divs, pots, brkts or elims don't have entries
 *
 * @param {Record<string, number>} counts - counts of divs, pots, brkts and elims entries
 * @param {tmntFullType} tmntData - tournament data
 * @returns {string} - error message if any of the divs, pots, brkts don't have entries, or if divs are missing, otherwise empty string
 */
export const getDivsPotsBrktsElimsCountErrMsg = (
  counts: Record<string, number>,
  tmntData: tmntFullType
): string => {
  let errMsg = "";
  for (const key in counts) {
    if (key.startsWith("div") && counts[key] === 0) {
      const divId = key.slice(0, -feeColNameEnd.length); // remove '_fee'
      const divName = getDivName(divId, tmntData?.divs);
      errMsg = divName
        ? `No division entries for ${divName}`
        : `No division entries for unknown division ${divId}`;
      break;
    } else if (key.startsWith("pot") && counts[key] === 0) {
      const potId = key.slice(0, -feeColNameEnd.length);
      const pot = tmntData?.pots.find((p) => p.id === potId);
      errMsg = pot
        ? `No pot entries for ${pot.pot_type}`
        : `No pot entries for unknown pot ${potId}`;
      break;
    } else if (key.startsWith("elm") && counts[key] === 0) {
      const elmId = key.slice(0, -feeColNameEnd.length);
      const elim = tmntData?.elims.find((e) => e.id === elmId);
      if (elim) {
        const elimName = getBrktOrElimName(elim, tmntData?.divs);
        errMsg = `No elim entries for ${elimName}`;
      } else {
        errMsg = `No elim entries for unknown elim ${elmId}`;
      }
      break;
    } else if (
      key.endsWith(brktsColNameEnd) &&
      counts[key] < defaultBrktPlayers - 1
    ) {
      const brktId = key.slice(0, -brktsColNameEnd.length);
      const brkt = tmntData?.brkts.find((b) => b.id === brktId);
      if (brkt) {
        const brktName = getBrktOrElimName(brkt, tmntData?.divs);
        errMsg = `Not enough bracket entries for ${brktName}`;
      } else {
        errMsg = `Not enough bracket entries for unknown bracket ${brktId}`;
      }
      break;
    }
  }
  return errMsg;
};

export const exportedForTesting = {
  validAverage,
  validLane,
  validPosition,
  validDivs,
  validPots,
  validBrkts,
  validElims,
};
