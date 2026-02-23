import type {    
  divEntryType,  
  elimEntryType,
  playerType,
  potEntryType,
  brktEntryType,
  gridTmntEntryDataType,
  fullBrktsDataType,
} from "@/lib/types/types";
import type { playerEntryRow } from "./populateRows";
import {
  brktsColNameEnd,
  divEntryHdcpColName,
  entryFeeColName,
  feeColNameEnd,  
  timeStampColName,  
} from "./createColumns";
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

/**
 * extarcts data from rows in grid
 *
 * @param {playerEntryRow[]} rows - array of playerEntryData in data grid
 * @param {string} squadId - squad id 
 * @param {BracketList[]} brktLists - array of BracketLists
 * @returns {gridTmntEntryDataType} - gridTmntEntryDataType object
 */
export const extractDataFromRows = (
  rows: playerEntryRow[],
  squadId: string,
  brktLists: BracketList[],
): gridTmntEntryDataType => {

  const emptyResult = (): gridTmntEntryDataType => ({
    players: [],
    divEntries: [],
    potEntries: [],
    brktEntries: [],
    elimEntries: [],
  });
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return emptyResult();
  }
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
  
  rows.forEach((row) => {
    const divFeeColNames = Object.keys(row).filter(
      (key) => key.startsWith("div") && key.endsWith(feeColNameEnd)
    );
    const potFeeColNames = Object.keys(row).filter(
      (key) => key.startsWith("pot") && key.endsWith(feeColNameEnd)
    );
    const brktNumColNames = Object.keys(row).filter(
      (key) => key.startsWith("brk") && key.endsWith(brktsColNameEnd)
    );
    const elimFeeColNames = Object.keys(row).filter(
      (key) => key.startsWith("elm") && key.endsWith(feeColNameEnd)
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
          feeForRow = '0';
        }
        divEntries.push({
          ...initDivEntry,
          id: btDbUuid('den'),
          div_id: divId,
          squad_id: squadId,
          player_id: row.id,        
          fee: feeForRow + '',
          hdcp: row[divEntryHdcpColName(divId)],
        });
      }
    });

    potFeeColNames.forEach((feeColName) => {
      if (row[feeColName]) {
        const potId = feeColName.slice(0, feeTextLength); // remove "_fee" from column name
        potEntries.push({
          ...initPotEntry,
          id: btDbUuid('pen'),
          pot_id: potId,
          player_id: row.id,
          fee: row[feeColName] + '',
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
            id: btDbUuid('ben'),
            brkt_id: brktId,
            player_id: row.id,
            num_brackets: row[brktNumColName],
            num_refunds: row[brktNumColName] - brktList.totalBrackets,
            fee: row[entryFeeColName(brktId)] + '',
            time_stamp: row[timeStampColName(brktId)],
          });           
        } else {
          brktEntries.push({
            ...initBrktEntry,
            id: btDbUuid('ben'),
            brkt_id: brktId,
            player_id: row.id,
            num_brackets: row[brktNumColName],
            fee: row[entryFeeColName(brktId)] + '',
            time_stamp: row[timeStampColName(brktId)],
          });              
        }
        // if (row[brktNumColName] > brktList.totalBrackets) {
        //   brktEntries.push({
        //     ...initBrktEntry,
        //     id: btDbUuid('ben'),
        //     brkt_id: brktId,
        //     player_id: row.id,
        //     num_brackets: row[brktNumColName],
        //     num_refunds: row[brktNumColName] - brktList.totalBrackets,
        //     fee: row[entryFeeColName(brktId)] + '',
        //     time_stamp: row[timeStampColName(brktId)],
        //   });
        // } else {
        //   brktEntries.push({
        //     ...initBrktEntry,
        //     id: btDbUuid('ben'),
        //     brkt_id: brktId,
        //     player_id: row.id,
        //     num_brackets: row[brktNumColName],
        //     fee: row[entryFeeColName(brktId)] + '',
        //     time_stamp: row[timeStampColName(brktId)],
        //   });            
      }
    });

    elimFeeColNames.forEach((feeColName) => {
      if (row[feeColName]) {
        const elimId = feeColName.slice(0, feeTextLength); // remove "_fee" from column name
        elimEntries.push({
          ...initElimEntry,
          id: btDbUuid('een'),
          elim_id: elimId,
          player_id: row.id,
          fee: row[feeColName] + '',
        });
      }
    });
  });
  return {    
    players: players,
    divEntries: divEntries,
    potEntries: potEntries,
    brktEntries: brktEntries,    
    elimEntries: elimEntries,
  };
};

export const extractFullBrktsData = (brktLists: BracketList[]): fullBrktsDataType => { 

  if (!brktLists || !Array.isArray(brktLists) || brktLists.length === 0)
    return {
      oneBrkts: [],
      brktSeeds: [],
    };

  const fbData: fullBrktsDataType = {
    oneBrkts: [],
    brktSeeds: [],
  }

  try {
    brktLists.forEach((brktList) => {
      for (let bindex = 0; bindex < brktList.brackets.length; bindex++) {        
                
        // create parent row in array of one brkts
        const one_brkt_id = btDbUuid('obk');        
        fbData.oneBrkts.push({        
          id: one_brkt_id,
          brkt_id: brktList.brktId,
          bindex: bindex
        });

        // create child rows in array of brkt seeds
        const brkt = brktList.brackets[bindex];
        for (let seed = 0; seed < brkt.players.length; seed++) {
          const player = brkt.players[seed];
          fbData.brktSeeds.push({
            one_brkt_id: one_brkt_id,
            seed: seed,
            player_id: player
          });
        };
      }
    });
    return fbData;
  } catch (error) {
    return {
      oneBrkts: [],
      brktSeeds: [],
    }
  }
}
