import type {
  divEntryType,
  elimEntryType,
  playerType,
  potEntryType,
  brktEntryType,
  gridTmntEntryDataType,
  fullBrktsDataType,
  tmntMoneyType,
  dataOneTmntType,
} from "@/lib/types/types";
import type { playerEntryRow } from "./populatePlayerRows";
import {
  divEntryHdcpColName,
  entryFeeColName,
  brktsColNameEnd,
  feeColNameEnd,
  timeStampColName,
} from "./sfCreatePlayerColumns";
import {
  initDivEntry,
  initElimEntry,
  initPlayer,
  initPotEntry,
  initBrktEntry,
  defaultBrktPlayers,
} from "@/lib/db/initVals";
import { btDbUuid } from "@/lib/uuid";
import { BracketList } from "@/components/brackets/bracketListClass";
import { isValidBtDbId } from "@/lib/validation/validation";
import { MoneyDescrip, MoneyFlow } from "@prisma/client";
import { minSortOrder } from "@/lib/validation/constants";

type RowDivFee = {
  divId: string;
  fee: number;
  feeColName: string;
};

// Maps source ids to their related money rows for fast lookup while processing rows
type MoneyMaps = {
  potPrizeFund: Map<string, tmntMoneyType>;
  brktPrizeFund: Map<string, tmntMoneyType>;
  brktExpenses: Map<string, tmntMoneyType>;
  brktRefunds: Map<string, tmntMoneyType>;
  elimPrizeFund: Map<string, tmntMoneyType>;
};

// Shared read-only values needed by the extraction helper functions 
type ExtractContext = {
  eventId: string;
  squadId: string;
  div1Id: string;
  lineage: number;
  other: number;
  expenses: number;
  oneTmntData: dataOneTmntType;
  brktLists: BracketList[];
  divFeeColNames: string[];
  potFeeColNames: string[];
  brktNumColNames: string[];
  elimFeeColNames: string[];
  feeTextLength: number;
  brktTextLength: number;
  brktFeeMap: Map<string, number>;
};

// Working result object that is filled in during the single pass through grid rows
type ExtractAccumulator = {
  players: playerType[];
  divEntries: divEntryType[];
  potEntries: potEntryType[];
  brktEntries: brktEntryType[];
  elimEntries: elimEntryType[];
  moneys: tmntMoneyType[];
  feeTotals: Record<string, number>;
  expensesOut: tmntMoneyType[];
  potsOut: tmntMoneyType[];
  brktsOut: tmntMoneyType[];
  elimsOut: tmntMoneyType[];
  moneyMaps: MoneyMaps;
};

// Object used to fill in during the single pass through grid rows
const emptyResult = (): gridTmntEntryDataType => ({
  players: [],
  divEntries: [],
  potEntries: [],
  brktEntries: [],
  elimEntries: [],
  moneys: [],
});

// const feeTotals: { [key: string]: any } = {
//   // event_id: "",
//   // squad_id: "",
// };

// const getMoneyInFlows = (
//   feeTotals: { [key: string]: any },
//   oneTmntData: dataOneTmntType,
// ): tmntMoneyType[] => {

//   // create moneys object
//   const moneys: tmntMoneyType[] = [];

//   let sortOrder = minSortOrder; // start with lowest sort order
//   const justDivs = Object.keys(feeTotals).filter((key) =>
//     key.startsWith("div"),
//   );
//   const justPots = Object.keys(feeTotals).filter((key) =>
//     key.startsWith("pot"),
//   );
//   const justBrkts = Object.keys(feeTotals).filter((key) =>
//     key.startsWith("brk"),
//   );
//   const justElms = Object.keys(feeTotals).filter((key) =>
//     key.startsWith("elm"),
//   );

//   // currently only one event, one squad
//   const eventId = oneTmntData.events[0].id;
//   const squadId = oneTmntData.squads[0].id;

//   // get div fee entry totals
//   for (const key of justDivs) {
//     const divId = key.slice(0, feeColNameEnd.length * -1); // remove "_fee" from column name

//     if (moneys.length === 0) { // if no moneys yet, get added monet for event
//       const eventAddedMoney = oneTmntData.events[0].added_money;
//       const addedMoneyRow: tmntMoneyType = {
//         id: btDbUuid("mon"),
//         event_id: eventId,
//         squad_id: squadId,
//         div_id: divId,
//         descrip: MoneyDescrip.ADDED,
//         flow: MoneyFlow.IN,
//         amount: Number(eventAddedMoney),
//         pot_id: null,
//         brkt_id: null,
//         elim_id: null,
//         sort_order: sortOrder,
//       };
//       moneys.push(addedMoneyRow);
//       sortOrder++;
//     }

//     const tmntMoneyRow: tmntMoneyType = {
//       id: btDbUuid("mon"),
//       event_id: eventId,
//       squad_id: squadId,
//       div_id: divId,
//       descrip: MoneyDescrip.ENTRIES,
//       flow: MoneyFlow.IN,
//       amount: feeTotals[key],
//       pot_id: null,
//       brkt_id: null,
//       elim_id: null,
//       sort_order: sortOrder,
//     };
//     moneys.push(tmntMoneyRow);
//     sortOrder++;
//   }
//   // get pot fee entry totals
//   for (const key of justPots) {
//     const potId = key.slice(0, feeColNameEnd.length * -1); // remove "_fee" from column name
//     const divId =
//       oneTmntData.pots.find((pot) => pot.id === potId)?.div_id ?? "";
//     if (divId) {
//       const tmntMoneyRow: tmntMoneyType = {
//         id: btDbUuid("mon"),
//         event_id: eventId,
//         squad_id: squadId,
//         div_id: divId,
//         descrip: MoneyDescrip.ENTRIES,
//         flow: MoneyFlow.IN,
//         amount: feeTotals[key],
//         pot_id: potId,
//         brkt_id: null,
//         elim_id: null,
//         sort_order: sortOrder,
//       };
//       moneys.push(tmntMoneyRow);
//       sortOrder++;
//     }
//   }
//   // get brkt fee entry totals
//   for (const key of justBrkts) {
//     const brktId = key.slice(0, feeColNameEnd.length * -1); // remove "_fee" from column name
//     const divId =
//       oneTmntData.brkts.find((brkt) => brkt.id === brktId)?.div_id ?? "";
//     if (divId) {
//       const tmntMoneyRow: tmntMoneyType = {
//         id: btDbUuid("mon"),
//         event_id: eventId,
//         squad_id: squadId,
//         div_id: divId,
//         descrip: MoneyDescrip.ENTRIES,
//         flow: MoneyFlow.IN,
//         amount: feeTotals[key],
//         pot_id: null,
//         brkt_id: brktId,
//         elim_id: null,
//         sort_order: sortOrder,
//       };
//       moneys.push(tmntMoneyRow);
//       sortOrder++;
//     }
//   }
//   // get elim fee entry totals
//   for (const key of justElms) {
//     const elimId = key.slice(0, feeColNameEnd.length * -1); // remove "_fee" from column name
//     const divId =
//       oneTmntData.elims.find((elim) => elim.id === elimId)?.div_id ?? "";
//     if (divId) {
//       const tmntMoneyRow: tmntMoneyType = {
//         id: btDbUuid("mon"),
//         event_id: eventId,
//         squad_id: squadId,
//         div_id: divId,
//         descrip: MoneyDescrip.ENTRIES,
//         flow: MoneyFlow.IN,
//         amount: feeTotals[key],
//         pot_id: null,
//         brkt_id: null,
//         elim_id: elimId,
//         sort_order: sortOrder,
//       };
//       moneys.push(tmntMoneyRow);
//       sortOrder++;
//     }
//   }
//   return moneys;
// }

/**
 * Checks that the input data is valid BEFORE extraction 
 *
 * @param {playerEntryRow[]} rows - array of playerEntryRows - data from dataGrid
 * @param {dataOneTmntType} oneTmntData - data from oneTmnt
 * @param {BracketList[]} brktLists - array of bracket lists
 * @return {boolean} - true if the input data is valid
 */
const isValidExtractInput = (
  rows: playerEntryRow[],
  oneTmntData: dataOneTmntType,
  brktLists: BracketList[],
): boolean => {
  if (!rows || !Array.isArray(rows) || rows.length === 0) return false;
  if (!brktLists || !Array.isArray(brktLists)) return false;

  if (
    !oneTmntData ||
    !oneTmntData.events ||
    oneTmntData.events.length === 0 ||
    !oneTmntData.squads ||
    oneTmntData.squads.length === 0 ||
    !oneTmntData.divs ||
    oneTmntData.divs.length === 0 ||
    !oneTmntData.pots ||
    !oneTmntData.brkts ||
    !oneTmntData.elims
  ) {
    return false;
  }

  return (
    isValidBtDbId(oneTmntData.events[0].id, "evt") &&
    isValidBtDbId(oneTmntData.squads[0].id, "sqd") &&
    isValidBtDbId(oneTmntData.divs[0].id, "div")
  );
};

/**
 * Builds the extract context - data used by all helper functions
 *
 * @param {playerEntryRow[]} rows - array of playerEntryRows - data from dataGrid
 * @param {dataOneTmntType} oneTmntData - data from oneTmnt
 * @param {BracketList[]} brktLists - array of bracket lists
 * @return {ExtractContext} - extracted data
 */
const buildExtractContext = (
  rows: playerEntryRow[],
  oneTmntData: dataOneTmntType,
  brktLists: BracketList[],
): ExtractContext => {
  // get all unique column names from every Syncfusion grid row
  const rowKeys = Array.from(
    new Set(rows.flatMap((row) => Object.keys(row))),
  );

  const feeTextLength = feeColNameEnd.length * -1;
  const brktTextLength = brktsColNameEnd.length * -1;

  const validDivIds = new Set(
    oneTmntData.divs.map((div) => div.id),
  );
  const validPotIds = new Set(
    oneTmntData.pots.map((pot) => pot.id),
  );
  const validBrktIds = new Set(
    oneTmntData.brkts.map((brkt) => brkt.id),
  );
  const validElimIds = new Set(
    oneTmntData.elims.map((elim) => elim.id),
  );

  // get brkt fee map - fast lookup for brkt fee during row processing
  const brktFeeMap = new Map<string, number>();
  oneTmntData.brkts.forEach((brkt) => {
    brktFeeMap.set(brkt.id, Number(brkt.fee));
  });

  // build extract context
  // assum only 1 event, 1 squad
  // put all event expenses in first division (lineage, other, expenses)
  return {
    eventId: oneTmntData.events[0].id,
    squadId: oneTmntData.squads[0].id,
    div1Id: oneTmntData.divs[0].id,
    lineage: Number(oneTmntData.events[0].lineage),
    other: Number(oneTmntData.events[0].other),
    expenses: Number(oneTmntData.events[0].expenses),
    oneTmntData,
    brktLists,
    // get groups of fee column names
    divFeeColNames: rowKeys.filter((key) => {
      if (!key.startsWith("div") || !key.endsWith(feeColNameEnd)) {
        return false;
      }

      const divId = key.slice(0, feeTextLength);
      return validDivIds.has(divId);
    }),
    potFeeColNames: rowKeys.filter((key) => {
      if (!key.startsWith("pot") || !key.endsWith(feeColNameEnd)) {
        return false;
      }
      const potId = key.slice(0, feeTextLength);
      return validPotIds.has(potId);
    }),
    brktNumColNames: rowKeys.filter((key) => {
      if (!key.startsWith("brk") || !key.endsWith(brktsColNameEnd)) {
        return false;
      }
      const brktId = key.slice(0, brktTextLength);
      return validBrktIds.has(brktId);
    }),
    elimFeeColNames: rowKeys.filter((key) => {
      if (!key.startsWith("elm") || !key.endsWith(feeColNameEnd)) {
        return false;
      }
      const elimId = key.slice(0, feeTextLength);
      return validElimIds.has(elimId);
    }),    
    feeTextLength,
    brktTextLength,
    brktFeeMap,
  };
};

/**
 * Creates a money row with common fields already populated.
 * note: sort order is not set - that is done later
 *
 * @param {ExtractContext} ctx - extracted data
 * @param {string} divId - div id
 * @param {MoneyDescrip} descrip - money description
 * @param {MoneyFlow} flow - money flow
 * @param {number} [amount=0] - amount
 * @param {(string | null)} [potId=null] - pot id
 * @param {(string | null)} [brktId=null] - bracket id
 * @param {(string | null)} [elimId=null] - elim id
 * @return {tmntMoneyType} - base tmntMoneyType
 */
const createMoneyRow = (
  ctx: ExtractContext,
  divId: string,
  descrip: MoneyDescrip,
  flow: MoneyFlow,
  amount = 0,
  potId: string | null = null,
  brktId: string | null = null,
  elimId: string | null = null,
): tmntMoneyType => ({
  id: btDbUuid("mon"),
  event_id: ctx.eventId,
  squad_id: ctx.squadId,
  div_id: divId,
  descrip,
  flow,
  amount,
  pot_id: potId,
  brkt_id: brktId,
  elim_id: elimId,
  sort_order: 0,
});

/**
 * initalize accumulator - create empty arrays that that will be filled 
 * during row processing 
 *
 * @param {playerEntryRow[]} rows - array of playerEntryRows - data from dataGrid
 * @param {ExtractContext} ctx - extracted data
 * @return {ExtractAccumulator} - accumulator
 */
const initAccumulator = (
  rows: playerEntryRow[],
  ctx: ExtractContext,
): ExtractAccumulator => {
  const feeTotals: Record<string, number> = {};

  const rowKeys = Array.from(
    new Set(rows.flatMap((row) => Object.keys(row))),
  );

  rowKeys.forEach((key) => {
    if (key.endsWith(feeColNameEnd)) {
      feeTotals[key] = 0;
    }
  });

  const acc: ExtractAccumulator = {
    players: [],
    divEntries: [],
    potEntries: [],
    brktEntries: [],
    elimEntries: [],
    moneys: [],
    feeTotals,
    expensesOut: [],
    potsOut: [],
    brktsOut: [],
    elimsOut: [],
    moneyMaps: {
      potPrizeFund: new Map(),
      brktPrizeFund: new Map(),
      brktExpenses: new Map(),
      brktRefunds: new Map(),
      elimPrizeFund: new Map(),
    },
  };

  // event level out flows
  acc.expensesOut.push(
    createMoneyRow(ctx, ctx.div1Id, MoneyDescrip.LINEAGE, MoneyFlow.OUT),
    createMoneyRow(ctx, ctx.div1Id, MoneyDescrip.OTHER, MoneyFlow.OUT),
    createMoneyRow(ctx, ctx.div1Id, MoneyDescrip.EXPENSES, MoneyFlow.OUT),
    createMoneyRow(ctx, ctx.div1Id, MoneyDescrip.PRIZEFUND, MoneyFlow.OUT),
  );

  // pot out flows
  ctx.potFeeColNames.forEach((feeColName) => {
    const potId = feeColName.slice(0, ctx.feeTextLength);
    const divId =
      ctx.oneTmntData.pots.find((pot) => pot.id === potId)?.div_id ??
      ctx.div1Id;

    const prizeFundRow = createMoneyRow(
      ctx,
      divId,
      MoneyDescrip.PRIZEFUND,
      MoneyFlow.OUT,
      0,
      potId,
    );

    const expensesRow = createMoneyRow(
      ctx,
      divId,
      MoneyDescrip.EXPENSES,
      MoneyFlow.OUT,
      0,
      potId,
    );

    acc.potsOut.push(prizeFundRow, expensesRow);
    acc.moneyMaps.potPrizeFund.set(potId, prizeFundRow);
  });

  // bracket out flows
  ctx.brktNumColNames.forEach((brktNumColName) => {
    const brktId = brktNumColName.slice(0, ctx.brktTextLength);
    const divId =
      ctx.oneTmntData.brkts.find((brkt) => brkt.id === brktId)?.div_id ??
      ctx.div1Id;

    const prizeFundRow = createMoneyRow(
      ctx,
      divId,
      MoneyDescrip.PRIZEFUND,
      MoneyFlow.OUT,
      0,
      null,
      brktId,
    );

    const expensesRow = createMoneyRow(
      ctx,
      divId,
      MoneyDescrip.EXPENSES,
      MoneyFlow.OUT,
      0,
      null,
      brktId,
    );

    const refundsRow = createMoneyRow(
      ctx,
      divId,
      MoneyDescrip.REFUNDS,
      MoneyFlow.OUT,
      0,
      null,
      brktId,
    );

    acc.brktsOut.push(prizeFundRow, expensesRow, refundsRow);
    acc.moneyMaps.brktPrizeFund.set(brktId, prizeFundRow);
    acc.moneyMaps.brktExpenses.set(brktId, expensesRow);
    acc.moneyMaps.brktRefunds.set(brktId, refundsRow);
  });

  // elim out flows
  ctx.elimFeeColNames.forEach((feeColName) => {
    const elimId = feeColName.slice(0, ctx.feeTextLength);
    const divId =
      ctx.oneTmntData.elims.find((elim) => elim.id === elimId)?.div_id ??
      ctx.div1Id;

    const prizeFundRow = createMoneyRow(
      ctx,
      divId,
      MoneyDescrip.PRIZEFUND,
      MoneyFlow.OUT,
      0,
      null,
      null,
      elimId,
    );

    const expensesRow = createMoneyRow(
      ctx,
      divId,
      MoneyDescrip.EXPENSES,
      MoneyFlow.OUT,
      0,
      null,
      null,
      elimId,
    );

    acc.elimsOut.push(prizeFundRow, expensesRow);
    acc.moneyMaps.elimPrizeFund.set(elimId, prizeFundRow);
  });

  return acc;
};

/**
 * process a player - convert one row from data grid into a player
 *
 * @param {playerEntryRow} row - playerEntryRow object - one row from data grid
 * @param {ExtractAccumulator} acc - accumulator
 * @param {ExtractContext} ctx - context
 */
const processPlayer = (
  row: playerEntryRow,
  acc: ExtractAccumulator,
  ctx: ExtractContext,
): void => {
  acc.players.push({
    ...initPlayer,
    id: row.id,
    squad_id: ctx.squadId,
    first_name: row.first_name,
    last_name: row.last_name,
    average: row.average,
    lane: row.lane,
    position: row.position,
  });
};

/**
 * process division entries for one player, one row from data grid
 *
 * @param {playerEntryRow} row - playerEntryRow object - one row from data grid
 * @param {ExtractAccumulator} acc - accumulator
 * @param {ExtractContext} ctx - context
 * @return {RowDivFee[]} - array of RowDivFee
 */
const processDivEntries = (
  row: playerEntryRow,
  acc: ExtractAccumulator,
  ctx: ExtractContext,
): RowDivFee[] => {
  const rowDivFees: RowDivFee[] = [];

  // for each division fee column
  ctx.divFeeColNames.forEach((feeColName) => {
    const rawFee = row[feeColName]; // get raw div entry fee

    if (rawFee == null || rawFee === "") return;

    const divId = feeColName.slice(0, ctx.feeTextLength); // get division id
    const fee = Number(rawFee) || 0;

    // add division entry
    acc.divEntries.push({
      ...initDivEntry,
      id: btDbUuid("den"),
      div_id: divId,
      squad_id: ctx.squadId,
      player_id: row.id,
      fee: String(fee),
      hdcp: row[divEntryHdcpColName(divId)],
    });

    // save the fee for later calculations
    rowDivFees.push({
      divId,
      fee,
      feeColName,
    });
  });

  return rowDivFees;
};

/**
 * update division money out flow for one player, one row from the data grid
 *
 * @param {RowDivFee[]} rowDivFees - array of RowDivFee
 * @param {ExtractAccumulator} acc - accumulator
 * @param {ExtractContext} ctx - context
 * @return {void}
 */
const updateDivisionMoneyOut = (
  rowDivFees: RowDivFee[],
  acc: ExtractAccumulator,
  ctx: ExtractContext,
): void => {
  if (rowDivFees.length === 0) return;

  const lineageIndex = 0;
  const otherIndex = 1;
  const expensesIndex = 2;
  const prizeFundIndex = 3;

  // find highest division fee paid by the payer
  const highestDivFee = rowDivFees.reduce<RowDivFee | null>(
    (highest, current) => {
      if (!highest) return current;
      return current.fee > highest.fee ? current : highest;
    },
    null,
  );

  // update out flows for event, only pay these once, not per division
  acc.expensesOut[lineageIndex].amount! += ctx.lineage;
  acc.expensesOut[otherIndex].amount! += ctx.other;
  acc.expensesOut[expensesIndex].amount! += ctx.expenses;

  let gotExpenses = false;
  // update out flows for divisions
  rowDivFees.forEach((rowDivFee) => {
    // if the division fee is the highest paid by the player
    if (rowDivFee.fee === highestDivFee?.fee && !gotExpenses) {
      // save just the prize fund portion of the div entry fee 
      acc.expensesOut[prizeFundIndex].amount! +=
        rowDivFee.fee - (ctx.lineage + ctx.other + ctx.expenses);
      gotExpenses = true;
    } else {
      // else not highest fee paid, use whole div entry fee for prize fun
      acc.expensesOut[prizeFundIndex].amount! += rowDivFee.fee;
    }
  });
};

/**
 * process pot entries for one player, one row from data grid
 *
 * @param {playerEntryRow} row - playerEntryRow object - one row from data grid
 * @param {ExtractAccumulator} acc - accumulator
 * @param {ExtractContext} ctx - context
 */
const processPotEntries = (
  row: playerEntryRow,
  acc: ExtractAccumulator,
  ctx: ExtractContext,
): void => {
  // for each pot fee column
  ctx.potFeeColNames.forEach((feeColName) => {
    const rawFee = row[feeColName]; // get raw pot entry fee

    if (!rawFee) return;

    const potId = feeColName.slice(0, ctx.feeTextLength); // get pot id
    const fee = Number(rawFee) || 0;

    // add pot entry
    acc.potEntries.push({
      ...initPotEntry,
      id: btDbUuid("pen"),
      pot_id: potId,
      player_id: row.id,
      fee: String(rawFee),
    });

    // update the pot prize fund total
    const potPrizeFundRow = acc.moneyMaps.potPrizeFund.get(potId);
    if (potPrizeFundRow) {
      potPrizeFundRow.amount! += fee;
    }
  });
};

/**
 * calculate brkt prize fund for one player for set of brackets
 *
 * @param {number} numBrkts - number of brackets for player
 * @param {number} numRefunds - number of refunds for player
 * @param {number} fee - bracket fee for player
 * @return {number} - prize fund for player for the bracket
 */
const calcBrktPrizeFund = (
  numBrkts: number,
  numRefunds: number,
  fee: number,
): number => {
  // formual is (EnteredBrackets) * (percent of entry to prize fund) * (fee per entry)
  return (
    (numBrkts - numRefunds) *
    ((defaultBrktPlayers - 1) / defaultBrktPlayers) *
    fee
  );
};

/**
 * calculate brkt expenses for one player for one set of brackets
 *
 * @param {number} numBrkts - number of brackets for player
 * @param {number} numRefunds - number of refunds for player
 * @param {number} fee - bracket fee for player
 * @return {number} - expenses for player for the set of bracket
 */
const calcBrktExpenses = (
  numBrkts: number,
  numRefunds: number,
  fee: number,
): number => {
  // formual is (EnteredBrackets) * (percent of entry to expenses) * (fee per entry)
  return (numBrkts - numRefunds) * (1 / defaultBrktPlayers) * fee;
}

/**
 * process bracket entries for one player for one set of brackets
 *
 * @param {playerEntryRow} row - playerEntryRow - one row from data grid
 * @param {ExtractAccumulator} acc - accumulator
 * @param {ExtractContext} ctx - context
 * @return {void}
 */
const processBracketEntries = (
  row: playerEntryRow,
  acc: ExtractAccumulator,
  ctx: ExtractContext,
): void => {
  // for each bracket fee column
  ctx.brktNumColNames.forEach((brktNumColName) => {
    const rawNumBrkts = row[brktNumColName];  // get raw number of brackets

    if (!rawNumBrkts) return;

    const brktId = brktNumColName.slice(0, ctx.brktTextLength); // get bracket id
    const brktList = ctx.brktLists.find((list) => list.brktId === brktId); // get bracket list
    const fee = ctx.brktFeeMap.get(brktId) ?? 0;  // get bracket fee
    const numBrkts = Number(rawNumBrkts) || 0;  

    // calculate number of refunds
    let numRefunds = 0;
    if (brktList && numBrkts > brktList.totalBrackets) {
      numRefunds = numBrkts - brktList.totalBrackets;
    }

    // add bracket entry
    acc.brktEntries.push({
      ...initBrktEntry,
      id: btDbUuid("ben"),
      brkt_id: brktId,
      player_id: row.id,
      num_brackets: numBrkts,
      num_refunds: numRefunds,
      fee: String(row[entryFeeColName(brktId)]),
      time_stamp: row[timeStampColName(brktId)],
    });

    // update the bracket prize fund total
    const prizeFundRow = acc.moneyMaps.brktPrizeFund.get(brktId);
    if (prizeFundRow) {
      prizeFundRow.amount! += calcBrktPrizeFund(numBrkts, numRefunds, fee);
    }

    // update the bracket expenses total
    const expensesRow = acc.moneyMaps.brktExpenses.get(brktId);
    if (expensesRow) {
      expensesRow.amount! += calcBrktExpenses(numBrkts, numRefunds, fee);
    }

    // update the bracket refunds total
    if (numRefunds > 0) {
      const refundsRow = acc.moneyMaps.brktRefunds.get(brktId);
      if (refundsRow) {
        refundsRow.amount! += numRefunds * fee;
      }
    }
  });
};

/**
 * process eliminator entries for one player, one row from data grid
 *
 * @param {playerEntryRow} row - playerEntryRow - one row from data grid
 * @param {ExtractAccumulator} acc - accumulator
 * @param {ExtractContext} ctx - context
 */
const processElimEntries = (
  row: playerEntryRow,
  acc: ExtractAccumulator,
  ctx: ExtractContext,
): void => {
  // for each eliminator fee column
  ctx.elimFeeColNames.forEach((feeColName) => {
    const rawFee = row[feeColName]; // get raw elim entry fee

    if (!rawFee) return;

    const elimId = feeColName.slice(0, ctx.feeTextLength); // get eliminator id
    const fee = Number(rawFee) || 0;

    // add elim entry
    acc.elimEntries.push({
      ...initElimEntry,
      id: btDbUuid("een"),
      elim_id: elimId,
      player_id: row.id,
      fee: String(rawFee),
    });

    // update the eliminator prize fund
    const elimPrizeFundRow = acc.moneyMaps.elimPrizeFund.get(elimId);
    if (elimPrizeFundRow) {
      elimPrizeFundRow.amount! += fee;
    }
  });
};

/**
 * keep running totals for eveny fee column in the data grid
 *
 * @param {playerEntryRow} row - playerEntryRow - one row from data grid
 * @param {ExtractAccumulator} acc - accumulator
 */
const updateFeeTotals = (
  row: playerEntryRow,
  acc: ExtractAccumulator,
): void => {
  Object.keys(acc.feeTotals).forEach((key) => {
    const amount = Number(row[key]);
    const fee = Number.isFinite(amount) ? amount : 0;
    acc.feeTotals[key] += fee;
  });
};

/**
 * creates money in flows after all rows from the data grid have been processed
 *
 * @param {Record<string, number>} feeTotals - fee totals
 * @param {ExtractContext} ctx - context
 * @return {tmntMoneyType[]} - money in flows 
 */
const getMoneyInFlows = (
  feeTotals: Record<string, number>,
  ctx: ExtractContext,
): tmntMoneyType[] => {
  const moneys: tmntMoneyType[] = [];

  let sortOrder = minSortOrder; // start with lowest sort order

  // get groups of fees by type
  const justDivs = Object.keys(feeTotals).filter((key) =>
    key.startsWith("div"),
  );
  const justPots = Object.keys(feeTotals).filter((key) =>
    key.startsWith("pot"),
  );
  const justBrkts = Object.keys(feeTotals).filter((key) =>
    key.startsWith("brk"),
  );
  const justElms = Object.keys(feeTotals).filter((key) =>
    key.startsWith("elm"),
  );

  // for the division entries
  justDivs.forEach((key) => {
    const divId = key.slice(0, ctx.feeTextLength);  // get division id

    // if at the beginning, add the added money in flow
    // keep this inside the division loop becuase it need the first div id
    if (moneys.length === 0) {
      moneys.push({
        ...createMoneyRow(
          ctx,
          divId,
          MoneyDescrip.ADDED,
          MoneyFlow.IN,
          Number(ctx.oneTmntData.events[0].added_money),
        ),
        sort_order: sortOrder,
      });
      sortOrder++;
    }

    // add the division entries in flow
    moneys.push({
      ...createMoneyRow(
        ctx,
        divId,
        MoneyDescrip.ENTRIES,
        MoneyFlow.IN,
        feeTotals[key],
      ),
      sort_order: sortOrder,
    });
    sortOrder++;
  });

  // for the pot entries
  justPots.forEach((key) => {
    // get the id's
    const potId = key.slice(0, ctx.feeTextLength); 
    const divId =
      ctx.oneTmntData.pots.find((pot) => pot.id === potId)?.div_id ?? "";

    if (!divId) return;

    // add the pot entries in flow
    moneys.push({
      ...createMoneyRow(
        ctx,
        divId,
        MoneyDescrip.ENTRIES,
        MoneyFlow.IN,
        feeTotals[key],
        potId,
      ),
      sort_order: sortOrder,
    });
    sortOrder++;
  });

  // for the bracket entries
  justBrkts.forEach((key) => {
    // get the id's
    const brktId = key.slice(0, ctx.feeTextLength);
    const divId =
      ctx.oneTmntData.brkts.find((brkt) => brkt.id === brktId)?.div_id ?? "";

    if (!divId) return;

    // add the bracket entries in flow
    moneys.push({
      ...createMoneyRow(
        ctx,
        divId,
        MoneyDescrip.ENTRIES,
        MoneyFlow.IN,
        feeTotals[key],
        null,
        brktId,
      ),
      sort_order: sortOrder,
    });
    sortOrder++;
  });

  // for the eliminator entries
  justElms.forEach((key) => {
    // get the id's
    const elimId = key.slice(0, ctx.feeTextLength);
    const divId =
      ctx.oneTmntData.elims.find((elim) => elim.id === elimId)?.div_id ?? "";

    if (!divId) return;

    // add the eliminator entries in flow
    moneys.push({
      ...createMoneyRow(
        ctx,
        divId,
        MoneyDescrip.ENTRIES,
        MoneyFlow.IN,
        feeTotals[key],
        null,
        null,
        elimId,
      ),
      sort_order: sortOrder,
    });
    sortOrder++;
  });

  return moneys;
};

/**
 * finalizes the money rows
 * 
 * money IN already stored in acc.moneys. This helper appends all
 * money OUT rows, sets sort order, and adds row to acc.moneys
 *
 * @param {ExtractAccumulator} acc - accumulator
 * @returns {void}
 */
const appendMoneyOutRows = (acc: ExtractAccumulator): void => {
  let sortOrder = acc.moneys.length + 1;

  // get all the money out rows
  const moneyOutRows = [
    ...acc.expensesOut,
    ...acc.potsOut,
    ...acc.brktsOut,
    ...acc.elimsOut,
  ];

  // for each money out row, set sort order and add to acc.moneys
  moneyOutRows.forEach((moneyRow) => {
    moneyRow.sort_order = sortOrder;
    sortOrder++;
    acc.moneys.push(moneyRow);
  });
};

/**
 * extracts data from rows in grid
 *
 * @param {playerEntryRow[]} rows - array of rows in data grid
 * @param {dataOneTmntType} oneTmntData - one tournament data
 * @param {BracketList[]} brktLists - array of BracketLists
 * @returns {gridTmntEntryDataType} - extracted entry data
 */
export const extractDataFromRows = (
  rows: playerEntryRow[],
  oneTmntData: dataOneTmntType,
  brktLists: BracketList[],
): gridTmntEntryDataType => {

  // validate inputs
  if (!isValidExtractInput(rows, oneTmntData, brktLists)) {
    return emptyResult();
  }

  // build the setup objects
  const ctx = buildExtractContext(rows, oneTmntData, brktLists);
  const acc = initAccumulator(rows, ctx);

  // single pass through the grid rows
  rows.forEach((row) => {
    processPlayer(row, acc, ctx);

    // get div fees for player
    const rowDivFees = processDivEntries(row, acc, ctx);
    updateDivisionMoneyOut(rowDivFees, acc, ctx);

    // get pot, brkt, and elim entries for player
    processPotEntries(row, acc, ctx);
    processBracketEntries(row, acc, ctx);
    processElimEntries(row, acc, ctx);

    // update running totals
    updateFeeTotals(row, acc);                              
  });

  // build final money rows after row totals are complete 
  acc.moneys.push(...getMoneyInFlows(acc.feeTotals, ctx)); // add in flows
  appendMoneyOutRows(acc);                                 // add out flows

  return {
    players: acc.players,
    divEntries: acc.divEntries,
    potEntries: acc.potEntries,
    brktEntries: acc.brktEntries,
    elimEntries: acc.elimEntries,
    moneys: acc.moneys,
  };
};

/**
 * Extracts full brkts data
 *
 * @param {BracketList[]} brktLists - array of bracket lists
 * @returns {fullBrktsDataType} - full brkts data
 */
export const extractFullBrktsData = (
  brktLists: BracketList[],
): fullBrktsDataType => {
  if (!brktLists || !Array.isArray(brktLists) || brktLists.length === 0)
    return {
      oneBrkts: [],
      brktSeeds: [],
    };

  const fbData: fullBrktsDataType = {
    oneBrkts: [],
    brktSeeds: [],
  };

  try {
    brktLists.forEach((brktList) => {
      for (let bindex = 0; bindex < brktList.brackets.length; bindex++) {
        // create parent row in array of one brkts
        const one_brkt_id = btDbUuid("obk");
        fbData.oneBrkts.push({
          id: one_brkt_id,
          brkt_id: brktList.brktId,
          bindex: bindex,
        });

        // create child rows in array of brkt seeds
        const brkt = brktList.brackets[bindex];
        for (let seed = 0; seed < brkt.players.length; seed++) {
          const player = brkt.players[seed];
          fbData.brktSeeds.push({
            one_brkt_id: one_brkt_id,
            seed: seed,
            player_id: player,
          });
        }
      }
    });
    return fbData;
  } catch (error) {
    return {
      oneBrkts: [],
      brktSeeds: [],
    };
  }
};
