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
} from "@/lib/db/initVals";
import { btDbUuid } from "@/lib/uuid";
import { BracketList } from "@/components/brackets/bracketListClass";
import { isValidBtDbId } from "@/lib/validation/validation";
import { MoneyDescrip, MoneyFlow } from "@prisma/client";
import { minSortOrder } from "@/lib/validation/constants";

const isFeeColumn = (colName: string): boolean =>
  colName.endsWith(feeColNameEnd);

export const totalsData: { [key: string]: any } = {
  // event_id: "",
  // squad_id: "",
};

/**
 * extarcts data from rows in grid
 *
 * @param {playerEntryRow[]} rows - array of  in data grid
 * @param {dataOneTmntType} tmntData -  tmnt data (see types.ts for details)
 * @param {BracketList[]} brktLists - array of BracketLists
 * @returns {gridTmntEntryDataType} - gridTmntEntryDataType object
 */
export const extractDataFromRows = (
  rows: playerEntryRow[],
  tmntData: dataOneTmntType,
  brktLists: BracketList[],
): gridTmntEntryDataType => {
  const emptyResult = (): gridTmntEntryDataType => ({
    players: [],
    divEntries: [],
    potEntries: [],
    brktEntries: [],
    elimEntries: [],
    moneys: [],
  });
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return emptyResult();
  }

  // Validate tmntData
  if (
    !tmntData ||
    !tmntData.events ||
    tmntData.events.length === 0 ||
    !tmntData.squads ||
    tmntData.squads.length === 0 ||
    !tmntData.pots ||
    !tmntData.brkts ||
    !tmntData.elims
  ) {
    return emptyResult();
  }
  const eventId = tmntData.events[0].id;
  if (!isValidBtDbId(eventId, "evt")) {
    return emptyResult();
  }
  const squadId = tmntData.squads[0].id;
  if (!isValidBtDbId(squadId, "sqd")) {
    return emptyResult();
  }

  // Validate brktLists (empty array allowed)
  if (!brktLists || !Array.isArray(brktLists)) {
    return emptyResult();
  }

  const players: playerType[] = [];
  const divEntries: divEntryType[] = [];
  const potEntries: potEntryType[] = [];
  const brktEntries: brktEntryType[] = [];
  const elimEntries: elimEntryType[] = [];
  const moneys: tmntMoneyType[] = [];

  // inits all fee columns: div, pot, brkt, and elim fee columns
  // totalsData.event_id = eventId;
  // totalsData.squad_id = squadId;
  for (const key of Object.keys(rows[0])) {
    if (key.endsWith(feeColNameEnd)) {
      totalsData[key] = 0;
    }
  }
  // totalsData.event_id = eventId;

  rows.forEach((row) => {
    const divFeeColNames = Object.keys(row).filter(
      (key) => key.startsWith("div") && key.endsWith(feeColNameEnd),
    );
    const potFeeColNames = Object.keys(row).filter(
      (key) => key.startsWith("pot") && key.endsWith(feeColNameEnd),
    );
    const brktNumColNames = Object.keys(row).filter(
      (key) => key.startsWith("brk") && key.endsWith(brktsColNameEnd),
    );
    const elimFeeColNames = Object.keys(row).filter(
      (key) => key.startsWith("elm") && key.endsWith(feeColNameEnd),
    );

    players.push({
      ...initPlayer,
      id: row.id,
      squad_id: squadId,
      first_name: row.first_name,
      last_name: row.last_name,
      average: row.average,
      lane: row.lane,
      position: row.position,
    });

    const feeTextLength = feeColNameEnd.length * -1;
    const brktTextLength = brktsColNameEnd.length * -1;

    divFeeColNames.forEach((feeColName) => {
      if (row[feeColName]) {
        const divId = feeColName.slice(0, feeTextLength); // remove "_fee" from column name
        let feeForRow = row[feeColName];
        if (feeForRow === undefined || feeForRow === null || feeForRow === "") {
          feeForRow = "0";
        }
        divEntries.push({
          ...initDivEntry,
          id: btDbUuid("den"),
          div_id: divId,
          squad_id: squadId,
          player_id: row.id,
          fee: feeForRow + "",
          hdcp: row[divEntryHdcpColName(divId)],
        });
      }
    });

    potFeeColNames.forEach((feeColName) => {
      if (row[feeColName]) {
        const potId = feeColName.slice(0, feeTextLength); // remove "_fee" from column name
        potEntries.push({
          ...initPotEntry,
          id: btDbUuid("pen"),
          pot_id: potId,
          player_id: row.id,
          fee: row[feeColName] + "",
        });
      }
    });

    brktNumColNames.forEach((brktNumColName) => {
      const brktId = brktNumColName.slice(0, brktTextLength); // remove "_brkts" from column name
      const brktList = brktLists.find((list) => list.brktId === brktId);

      if (row[brktNumColName]) {
        if (brktList && row[brktNumColName] > brktList.totalBrackets) {
          brktEntries.push({
            ...initBrktEntry,
            id: btDbUuid("ben"),
            brkt_id: brktId,
            player_id: row.id,
            num_brackets: row[brktNumColName],
            num_refunds: row[brktNumColName] - brktList.totalBrackets,
            fee: row[entryFeeColName(brktId)] + "",
            time_stamp: row[timeStampColName(brktId)],
          });
        } else {
          brktEntries.push({
            ...initBrktEntry,
            id: btDbUuid("ben"),
            brkt_id: brktId,
            player_id: row.id,
            num_brackets: row[brktNumColName],
            fee: row[entryFeeColName(brktId)] + "",
            time_stamp: row[timeStampColName(brktId)],
          });
        }
      }
    });

    elimFeeColNames.forEach((feeColName) => {
      if (row[feeColName]) {
        const elimId = feeColName.slice(0, feeTextLength); // remove "_fee" from column name
        elimEntries.push({
          ...initElimEntry,
          id: btDbUuid("een"),
          elim_id: elimId,
          player_id: row.id,
          fee: row[feeColName] + "",
        });
      }
    });

    // update fee totals
    for (const key of Object.keys(totalsData)) {
      // for each fee column
      const amount = Number(row[key]); // get amount in a fee column
      const fee = Number.isFinite(amount) ? amount : 0; // make sure got a valid value
      totalsData[key] += fee; // add fee to total
    }
  });

  // create moneys object
  let sortOrder = minSortOrder + 1; // sort_order starts at 2. 1 is for ADDED

  const justDivs = Object.keys(totalsData).filter((key) =>
    key.startsWith("div"),
  );
  const justPots = Object.keys(totalsData).filter((key) =>
    key.startsWith("pot"),
  );
  const justBrkts = Object.keys(totalsData).filter((key) =>
    key.startsWith("brk"),
  );
  const justElms = Object.keys(totalsData).filter((key) =>
    key.startsWith("elm"),
  );

  for (const key of justDivs) {
    const divId = key.slice(0, feeColNameEnd.length * -1); // remove "_fee" from column name
    const tmntMoneyRow: tmntMoneyType = {
      id: btDbUuid("mon"),
      event_id: eventId,
      squad_id: squadId,
      div_id: divId,
      descrip: MoneyDescrip.ENTRIES,
      flow: MoneyFlow.IN,
      amount: totalsData[key],
      pot_id: null,
      brkt_id: null,
      elim_id: null,
      sort_order: sortOrder,
    };
    moneys.push(tmntMoneyRow);
    sortOrder++;
  }
  for (const key of justPots) {
    const potId = key.slice(0, feeColNameEnd.length * -1); // remove "_fee" from column name
    const divId = tmntData.pots.find((pot) => pot.id === potId)?.div_id ?? "";
    if (divId) { 
      const tmntMoneyRow: tmntMoneyType = {
        id: btDbUuid("mon"),
        event_id: eventId,
        squad_id: squadId,
        div_id: divId,
        descrip: MoneyDescrip.ENTRIES,
        flow: MoneyFlow.IN,
        amount: totalsData[key],
        pot_id: potId,
        brkt_id: null,
        elim_id: null,
        sort_order: sortOrder,
      };
      moneys.push(tmntMoneyRow);
      sortOrder++;
    }
  }
  for (const key of justBrkts) {
    const brktId = key.slice(0, feeColNameEnd.length * -1); // remove "_fee" from column name
    const divId = tmntData.brkts.find((brkt) => brkt.id === brktId)?.div_id ?? "";
    if (divId) { 
      const tmntMoneyRow: tmntMoneyType = {
        id: btDbUuid("mon"),
        event_id: eventId,
        squad_id: squadId,
        div_id: divId,
        descrip: MoneyDescrip.ENTRIES,
        flow: MoneyFlow.IN,
        amount: totalsData[key],
        pot_id: null,
        brkt_id: brktId,
        elim_id: null,
        sort_order: sortOrder,
      };
      moneys.push(tmntMoneyRow);
      sortOrder++;
    }
  }
  for (const key of justElms) {
    const elimId = key.slice(0, feeColNameEnd.length * -1); // remove "_fee" from column name
    const divId = tmntData.elims.find((elim) => elim.id === elimId)?.div_id ?? "";
    if (divId) { 
      const tmntMoneyRow: tmntMoneyType = {
        id: btDbUuid("mon"),
        event_id: eventId,
        squad_id: squadId,
        div_id: divId,
        descrip: MoneyDescrip.ENTRIES,
        flow: MoneyFlow.IN,
        amount: totalsData[key],
        pot_id: null,
        brkt_id: null,
        elim_id: elimId,
        sort_order: sortOrder,
      };
      moneys.push(tmntMoneyRow);
      sortOrder++;
    }
  }

  return {
    players: players,
    divEntries: divEntries,
    potEntries: potEntries,
    brktEntries: brktEntries,
    elimEntries: elimEntries,
    moneys: moneys,
  };
};

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
