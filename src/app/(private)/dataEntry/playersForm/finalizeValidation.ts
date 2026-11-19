import type { playerEntryRow } from "./populatePlayerRows";
import type { tmntFullType, errInfoType } from "@/lib/types/types";
import { entryFeeColName, entryNumBrktsColName } from "./sfCreatePlayerColumns";
import { getBrktOrElimName, getPotShortName } from "@/lib/getName";

type ValidateFinalizeArgs = {
  rows: playerEntryRow[];
  tmntData: tmntFullType;
};

const hasValue = (value: unknown): boolean =>
  value !== undefined && value !== null && String(value).trim() !== "";

const hasPositiveNumber = (value: unknown): boolean => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0;
};

/**
 * Validates the rows to be finalized
 * 
 * @param {ValidateFinalizeArgs} -
 *  - rows - rows to be finalized
 *  - tmntData - tmnt full data 
 * @returns {errInfoType | null} - error info object if got an error, null for no error
 */
export const validateFinalizeRows = ({
  rows,
  tmntData,
}: ValidateFinalizeArgs): errInfoType | null => {

  let rowCount = 0;
  for (const row of rows) {
    rowCount += 1;
    const playerName = `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim();

    /**********************
     * player information *
     **********************/
    if (!hasValue(row.first_name)) {
      return {
        id: row.id,
        column: "first_name",
        msg: playerName
          ? `Can't finalize. Player ${playerName || row.id} is missing First Name.`
          : `Can't finalize. Player in row ${rowCount} is missing First Name.`,
      };
    }

    if (!hasValue(row.last_name)) {
      return {
        id: row.id,
        column: "last_name",
        msg: playerName
          ? `Can't finalize. Player ${playerName || row.id} is missing Last Name.`
          : `Can't finalize. Player in row ${rowCount} is missing Last Name.`,
      };
    }

    if (!hasValue(row.lane)) {
      return {
        id: row.id,
        column: "lane",
        msg: `Can't finalize. Player ${playerName} is missing Lane.`,
      };
    }

    if (!hasValue(row.position)) {
      return {
        id: row.id,
        column: "position",
        msg: `Can't finalize. Player ${playerName} is missing Position.`,
      };
    }

    /******************************
     * division entry information *
     ******************************/
    // get a map of entered divisions
    const playerDivMap = new Map<string, number>();
    for (const div of tmntData.divs) {
      if (hasPositiveNumber(row[entryFeeColName(div.id)])) { 
        playerDivMap.set(div.id, div.hdcp_per);
      }
    }
    if (playerDivMap.size === 0) {
      return {
        id: row.id,
        column: entryFeeColName(tmntData.divs[0]?.id ?? ""),
        msg: `Can't finalize. Player ${playerName} is not entered in any divisions.`,
      };
    }
    const needsAve = Array.from(playerDivMap.values()).some(
      (hdcpPer) => hdcpPer > 0
    );
    if (needsAve && !hasPositiveNumber(row.average)) {
      return {
        id: row.id,
        column: "average",
        msg: `Can't finalize. Player ${playerName} needs an Average because one entered division uses handicap.`,
      };
    }

    /******** 
     * pots *
    ********/        
    for (const pot of tmntData.pots) {
      if (hasPositiveNumber(row[entryFeeColName(pot.id)])) {
        if (!(playerDivMap.has(pot.div_id))) {
          let divName = tmntData.divs.find((div) => div.id === pot.div_id)?.div_name;
          return {
            id: row.id,
            column: entryFeeColName(pot.id),
            msg: `Can't finalize. Player ${playerName} must be entered in division ${divName} to enter pot ${getPotShortName(pot, tmntData.divs)}.`,
          }
        }
      }
    }

    /************ 
     * brackets *
    ************/
    for (const brkt of tmntData.brkts) {
      if (hasPositiveNumber(row[entryNumBrktsColName(brkt.id)])) {
        if (!(playerDivMap.has(brkt.div_id))) {
          let divName = tmntData.divs.find((div) => div.id === brkt.div_id)?.div_name;
          return {
            id: row.id,
            column: entryNumBrktsColName(brkt.id),
            msg: `Can't finalize. Player ${playerName} must be entered in division ${divName} to enter bracket ${getBrktOrElimName(brkt, tmntData.divs)}.`,
          }
        }
      }
    }

    /*************** 
     * eliminators *
    ****************/
    for (const elim of tmntData.elims) {
      if (hasPositiveNumber(row[entryFeeColName(elim.id)])) {
        if (!(playerDivMap.has(elim.div_id))) {
          let divName = tmntData.divs.find((div) => div.id === elim.div_id)?.div_name;
          return {
            id: row.id,
            column: entryFeeColName(elim.id),
            msg: `Can't finalize. Player ${playerName} must be entered in division ${divName} to enter eliminator ${getBrktOrElimName(elim, tmntData.divs)}.`,
          }
        }
      }
    }
  }

  return null;
};