import type {
  divPfEntryRow,
  divPfType,
  elimPfEntryRow,
  elimPfType,
  potPfEntryRow,
  potPfType,
  prizeFundEntryRow,
  prizeFundType,
} from "@/lib/types/types";

/*************
 * divisions *
 *************/

/**
 * Converts a division prize fund to a generic prize fund.
 *
 * @param {divPfType} divPf - division prize fund
 * @returns {prizeFundType} - generic prize fund
 */
export const divPfToPrizeFund = (
  divPf: divPfType,
): prizeFundType => {
  return {
    id: divPf.id,
    parent_id: divPf.div_id,
    position: divPf.position,
    amount: divPf.amount,
  };
};

/**
 * Converts an array of division prize funds to generic prize funds.
 *
 * @param {divPfType[]} divPfs - division prize funds
 * @returns {prizeFundType[]} - generic prize funds
 */
export const divPfsToPrizeFunds = (
  divPfs: divPfType[],
): prizeFundType[] => {
  return divPfs.map(divPfToPrizeFund);
};

/**
 * Converts a generic prize-fund entry row to a division prize-fund entry row.
 *
 * @param {prizeFundEntryRow} pfRow - generic prize-fund entry row
 * @returns {divPfEntryRow} - division prize-fund entry row
 */
export const pfEntryRowToDivPfEntryRow = (
  pfRow: prizeFundEntryRow,
): divPfEntryRow => {
  return {
    id: pfRow.id,
    div_id: pfRow.parent_id,
    position: pfRow.position,
    amount: pfRow.amount,
    percentage: pfRow.percentage,
  };
};

/**
 * Converts generic prize-fund entry rows to division prize-fund entry rows.
 *
 * @param {prizeFundEntryRow[]} pfRows - generic prize-fund entry rows
 * @returns {divPfEntryRow[]} - division prize-fund entry rows
 */
export const pfEntryRowsToDivPfEntryRows = (
  pfRows: prizeFundEntryRow[],
): divPfEntryRow[] => {
  return pfRows.map(pfEntryRowToDivPfEntryRow);
};

/**
 * Converts a division prize-fund entry row to a generic prize-fund entry row.
 *
 * @param {divPfEntryRow} divPfRow - division prize-fund entry row
 * @returns {prizeFundEntryRow} - generic prize-fund entry row
 */
export const divPfEntryRowToPrizeFundEntryRow = (
  divPfRow: divPfEntryRow,
): prizeFundEntryRow => {
  return {
    id: divPfRow.id,
    parent_id: divPfRow.div_id,
    position: divPfRow.position,
    amount: divPfRow.amount,
    percentage: divPfRow.percentage,
  };
};

/**
 * Converts division prize-fund entry rows to generic prize-fund entry rows.
 *
 * @param {divPfEntryRow[]} divPfRows - division prize-fund entry rows
 * @returns {prizeFundEntryRow[]} - generic prize-fund entry rows
 */
export const divPfEntryRowsToPrizeFundEntryRows = (
  divPfRows: divPfEntryRow[],
): prizeFundEntryRow[] => {
  return divPfRows.map(divPfEntryRowToPrizeFundEntryRow);
};

/**
 * Converts a generic prize-fund entry row to a division prize-fund entry row.
 *
 * @param {prizeFundEntryRow} pfRow - generic prize-fund entry row
 * @returns {divPfEntryRow} - division prize-fund entry row
 */
export const prizeFundEntryRowToDivPfEntryRow = (
  pfRow: prizeFundEntryRow,
): divPfEntryRow => {
  return {
    id: pfRow.id,
    div_id: pfRow.parent_id,
    position: pfRow.position,
    amount: pfRow.amount,
    percentage: pfRow.percentage,
  };
};

/**
 * Converts generic prize-fund entry rows to division prize-fund entry rows.
 *
 * @param {prizeFundEntryRow[]} pfRows - generic prize-fund entry rows
 * @returns {divPfEntryRow[]} - division prize-fund entry rows
 */
export const prizeFundEntryRowsToDivPfEntryRows = (
  pfRows: prizeFundEntryRow[],
): divPfEntryRow[] => {
  return pfRows.map(prizeFundEntryRowToDivPfEntryRow);
};

/********
 * pots *
 ********/

/**
 * Converts a pot prize fund to a generic prize fund.
 *
 * @param {potPfType} potPf - pot prize fund
 * @returns {prizeFundType} - generic prize fund
 */
export const potPfToPrizeFund = (
  potPf: potPfType,
): prizeFundType => {
  return {
    id: potPf.id,
    parent_id: potPf.pot_id,
    position: potPf.position,
    amount: potPf.amount,
  };
};

/**
 * Converts an array of pot prize funds to generic prize funds.
 *
 * @param {potPfType[]} potPfs - pot prize funds
 * @returns {prizeFundType[]} - generic prize funds
 */
export const potPfsToPrizeFunds = (
  potPfs: potPfType[],
): prizeFundType[] => {
  return potPfs.map(potPfToPrizeFund);
};

/**
 * Converts a generic prize-fund entry row to a pot prize-fund entry row.
 *
 * @param {prizeFundEntryRow} pfRow - generic prize-fund entry row
 * @returns {potPfEntryRow} - pot prize-fund entry row
 */
export const pfEntryRowToPotPfEntryRow = (
  pfRow: prizeFundEntryRow,
): potPfEntryRow => {
  return {
    id: pfRow.id,
    pot_id: pfRow.parent_id,
    position: pfRow.position,
    amount: pfRow.amount,
    percentage: pfRow.percentage,
  };
};

/**
 * Converts generic prize-fund entry rows to pot prize-fund entry rows.
 *
 * @param {prizeFundEntryRow[]} pfRows - generic prize-fund entry rows
 * @returns {potPfEntryRow[]} - pot prize-fund entry rows
 */
export const pfEntryRowsToPotPfEntryRows = (
  pfRows: prizeFundEntryRow[],
): potPfEntryRow[] => {
  return pfRows.map(pfEntryRowToPotPfEntryRow);
};

/**
 * Converts a pot prize-fund entry row to a generic prize-fund entry row.
 *
 * @param {potPfEntryRow} potPfRow - pot prize-fund entry row
 * @returns {prizeFundEntryRow} - generic prize-fund entry row
 */
export const potPfEntryRowToPrizeFundEntryRow = (
  potPfRow: potPfEntryRow,
): prizeFundEntryRow => {
  return {
    id: potPfRow.id,
    parent_id: potPfRow.pot_id,
    position: potPfRow.position,
    amount: potPfRow.amount,
    percentage: potPfRow.percentage,
  };
};

/**
 * Converts pot prize-fund entry rows to generic prize-fund entry rows.
 *
 * @param {potPfEntryRow[]} potPfRows - pot prize-fund entry rows
 * @returns {prizeFundEntryRow[]} - generic prize-fund entry rows
 */
export const potPfEntryRowsToPrizeFundEntryRows = (
  potPfRows: potPfEntryRow[],
): prizeFundEntryRow[] => {
  return potPfRows.map(potPfEntryRowToPrizeFundEntryRow);
};

/**
 * Converts a generic prize-fund entry row to a pot prize-fund entry row.
 *
 * @param {prizeFundEntryRow} pfRow - generic prize-fund entry row
 * @returns {potPfEntryRow} - pot prize-fund entry row
 */
export const prizeFundEntryRowToPotPfEntryRow = (
  pfRow: prizeFundEntryRow,
): potPfEntryRow => {
  return {
    id: pfRow.id,
    pot_id: pfRow.parent_id,
    position: pfRow.position,
    amount: pfRow.amount,
    percentage: pfRow.percentage,
  };
};

/**
 * Converts generic prize-fund entry rows to pot prize-fund entry rows.
 *
 * @param {prizeFundEntryRow[]} pfRows - generic prize-fund entry rows
 * @returns {potPfEntryRow[]} - pot prize-fund entry rows
 */
export const prizeFundEntryRowsToPotPfEntryRows = (
  pfRows: prizeFundEntryRow[],
): potPfEntryRow[] => {
  return pfRows.map(prizeFundEntryRowToPotPfEntryRow);
};

/***************
 * eliminators *
 ***************/

/**
 * Converts an eliminator prize fund to a generic prize fund.
 *
 * @param {elimPfType} elimPf - eliminator prize fund
 * @returns {prizeFundType} - generic prize fund
 */
export const elimPfToPrizeFund = (
  elimPf: elimPfType,
): prizeFundType => {
  return {
    id: elimPf.id,
    parent_id: elimPf.elim_id,
    position: elimPf.position,
    amount: elimPf.amount,
  };
};

/**
 * Converts eliminator prize funds to generic prize funds.
 *
 * @param {elimPfType[]} elimPfs - eliminator prize funds
 * @returns {prizeFundType[]} - generic prize funds
 */
export const elimPfsToPrizeFunds = (
  elimPfs: elimPfType[],
): prizeFundType[] => {
  return elimPfs.map(elimPfToPrizeFund);
};

/**
 * Converts a generic prize-fund entry row to an eliminator prize-fund entry row.
 *
 * @param {prizeFundEntryRow} pfRow - generic prize-fund entry row
 * @returns {elimPfEntryRow} - eliminator prize-fund entry row
 */
export const pfEntryRowToElimPfEntryRow = (
  pfRow: prizeFundEntryRow,
): elimPfEntryRow => {
  return {
    id: pfRow.id,
    elim_id: pfRow.parent_id,
    position: pfRow.position,
    amount: pfRow.amount,
    percentage: pfRow.percentage,
  };
};

/**
 * Converts generic prize-fund entry rows to eliminator prize-fund entry rows.
 *
 * @param {prizeFundEntryRow[]} pfRows - generic prize-fund entry rows
 * @returns {elimPfEntryRow[]} - eliminator prize-fund entry rows
 */
export const pfEntryRowsToElimPfEntryRows = (
  pfRows: prizeFundEntryRow[],
): elimPfEntryRow[] => {
  return pfRows.map(pfEntryRowToElimPfEntryRow);
};

/**
 * Converts a elim prize-fund entry row to a generic prize-fund entry row.
 *
 * @param {elimPfEntryRow} elimPfRow - elim prize-fund entry row
 * @returns {prizeFundEntryRow} - generic prize-fund entry row
 */
export const elimPfEntryRowToPrizeFundEntryRow = (
  elimPfRow: elimPfEntryRow,
): prizeFundEntryRow => {
  return {
    id: elimPfRow.id,
    parent_id: elimPfRow.elim_id,
    position: elimPfRow.position,
    amount: elimPfRow.amount,
    percentage: elimPfRow.percentage,
  };
};

/**
 * Converts elim prize-fund entry rows to generic prize-fund entry rows.
 *
 * @param {elimPfEntryRow[]} elimPfRows - elim prize-fund entry rows
 * @returns {prizeFundEntryRow[]} - generic prize-fund entry rows
 */
export const elimPfEntryRowsToPrizeFundEntryRows = (
  elimPfRows: elimPfEntryRow[],
): prizeFundEntryRow[] => {
  return elimPfRows.map(elimPfEntryRowToPrizeFundEntryRow);
};

/**
 * Converts a generic prize-fund entry row to an eliminator prize-fund entry row.
 *
 * @param {prizeFundEntryRow} pfRow - generic prize-fund entry row
 * @returns {elimPfEntryRow} - eliminator prize-fund entry row
 */
export const prizeFundEntryRowToElimPfEntryRow = (
  pfRow: prizeFundEntryRow,
): elimPfEntryRow => {
  return {
    id: pfRow.id,
    elim_id: pfRow.parent_id,
    position: pfRow.position,
    amount: pfRow.amount,
    percentage: pfRow.percentage,
  };
};

/**
 * Converts generic prize-fund entry rows to eliminator prize-fund entry rows.
 *
 * @param {prizeFundEntryRow[]} pfRows - generic prize-fund entry rows
 * @returns {elimPfEntryRow[]} - eliminator prize-fund entry rows
 */
export const prizeFundEntryRowsToElimPfEntryRows = (
  pfRows: prizeFundEntryRow[],
): elimPfEntryRow[] => {
  return pfRows.map(prizeFundEntryRowToElimPfEntryRow);
};
