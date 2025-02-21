import {  
  dataOneSquadEntriesType,
  divEntryType,
  editedOneSquadEntriesType,
  elimEntryType,
  playerType,
  potEntryType,
  brktEntryType,
  tmntEntryBrktEntryType,
  tmntEntryDivEntryType,
  tmntEntryElimEntryType,
  tmntEntryPlayerType,
  tmntEntryPotEntryType,
} from "@/lib/types/types";
import {
  // createdColName,
  divEntryHdcpColName,
  entryFeeColName,
  playerEntryData,
  timeStampColName,
  // updatedColName,
} from "./createColumns";
import {  
  blankElimEntry,  
  blankPotEntry,  
  initDivEntry,
  initElimEntry,
  initPlayer,
  initPotEntry,
  initBrktEntry,  
} from "@/lib/db/initVals";

/**
 * extarcts data from rows in grid
 *
 * DATA IS ASSUMED TO BE VALID
 *
 * @param {typeof playerEntryData[]} rows - array of playerEntryData in data grid
 * @returns {dataOneSquadEntriesType} - dataOneSquadEntriesType object
 */
export const extractDataFromRows = (
  rows: (typeof playerEntryData)[],
  squadId: string
): dataOneSquadEntriesType => {
  const players: playerType[] = [];
  const divEntries: divEntryType[] = [];
  const potEntries: potEntryType[] = [];
  const brktEntries: brktEntryType[] = [];
  const elimEntries: elimEntryType[] = [];

  if (!rows || rows.length === 0)
    return {
      squadId,
      players: players,
      divEntries: divEntries,
      potEntries: potEntries,
      brktEntries: brktEntries,
      elimEntries: elimEntries,
    };

  const divFeeColNames = Object.keys(rows[0]).filter(
    (key) => key.startsWith("div") && key.endsWith("_fee")
  );
  const potFeeColNames = Object.keys(rows[0]).filter(
    (key) => key.startsWith("pot") && key.endsWith("_fee")
  );
  const brktNumColNames = Object.keys(rows[0]).filter(
    (key) => key.startsWith("brk") && key.endsWith("_name")
  );
  const elimFeeColNames = Object.keys(rows[0]).filter(
    (key) => key.startsWith("elm") && key.endsWith("_fee")
  );

  rows.forEach((row) => {
    players.push({
      ...initPlayer,
      id: row.player_id,
      squad_id: squadId,
      first_name: row.first_name,
      last_name: row.last_name,
      average: row.average,
      lane: row.lane,
      position: row.position,
    });

    divFeeColNames.forEach((feeColName) => {
      if (row[feeColName]) {
        const divId = feeColName.slice(0, -4); // remove "-fee" from column name
        let feeForRow = row[feeColName];
        if (feeForRow === undefined || feeForRow === null || feeForRow === "") { 
          feeForRow = '0';
        }
        divEntries.push({
          ...initDivEntry,
          div_id: divId,
          squad_id: squadId,
          player_id: row.player_id,        
          fee: feeForRow,
          hdcp: row[divEntryHdcpColName(divId)],
        });
      }
    });
    potFeeColNames.forEach((feeColName) => {
      if (row[feeColName]) {
        const potId = feeColName.slice(0, -4); // remove "-fee" from column name
        potEntries.push({
          ...initPotEntry,
          pot_id: potId,
          player_id: row.player_id,
          fee: row[feeColName],
        });
      }
    });
    brktNumColNames.forEach((brktNumColName) => {
      if (row[brktNumColName]) {
        const brktId = brktNumColName.slice(0, -5); // remove "-name" from column name
        brktEntries.push({
          ...initBrktEntry,
          brkt_id: brktId,
          player_id: row.player_id,
          num_brackets: row[brktNumColName],
          fee: row[entryFeeColName(brktId)],
          time_stamp: row[timeStampColName(brktId)],
        });
      }
    });
    elimFeeColNames.forEach((feeColName) => {
      if (row[feeColName]) {
        const elimId = feeColName.slice(0, -4); // remove "-fee" from column name
        elimEntries.push({
          ...initElimEntry,
          elim_id: elimId,
          player_id: row.player_id,
          fee: row[feeColName],
        });
      }
    });
  });
  return {
    squadId,
    players: players,
    divEntries: divEntries,
    potEntries: potEntries,
    brktEntries: brktEntries,
    elimEntries: elimEntries,
  };
};

const setPlayerEditType = (origData: playerType[], extractedData: playerType[]):tmntEntryPlayerType[] => {
  
  const tePlayers: tmntEntryPlayerType[] = [];
  // players
  // get deleted players
  origData.forEach((player) => {
    const found = extractedData.find((p) => p.id === player.id);
    if (!found) {
      const deletedPlayer = {
        ...player,
        eType: "d",
      };
      tePlayers.push(deletedPlayer);
    }
  });
  // get updated or new players
  extractedData.forEach((player) => {
    const foundOrig = origData.find((p) => p.id === player.id);
    if (foundOrig) {
      // player in original data
      // if changed data, then mark row as updated
      if (JSON.stringify(player) !== JSON.stringify(foundOrig)) {
        const updatedPlayer = {
          ...player,
          eType: "u",
        };
        tePlayers.push(updatedPlayer);
      }
    } else { // a new player
      const newPlayer = {
        ...player,
        eType: "i",
      };
      tePlayers.push(newPlayer);
    }
  });
  return tePlayers
}

const setDivEntryEditType = (origData: divEntryType[], extractedData: divEntryType[], squadId: string):tmntEntryDivEntryType[] => {
  
  const teDivEntries: tmntEntryDivEntryType[] = [];
  origData.forEach((divEntry) => {
    const found = extractedData.find(
      (de) =>
        de.player_id === divEntry.player_id &&
        de.div_id === divEntry.div_id &&
        de.squad_id === squadId
    );
    if (!found) {
      const deletedDivEntry = {
        ...divEntry,
        eType: "d",
      };
      teDivEntries.push(deletedDivEntry);
    }    
  });
  // get updated or new divEntries
  extractedData.forEach((divEntry) => {
    const foundOrig = origData.find(
      (de) =>
        de.player_id === divEntry.player_id &&
        de.div_id === divEntry.div_id &&
        de.squad_id === squadId
    );
    if (foundOrig) {
      // player in original data
      // if changed data, then mark row as updated
      if (JSON.stringify(divEntry) !== JSON.stringify(foundOrig)) {
        const updatedDivEntry = {
          ...divEntry,
          eType: "u",
        };
        teDivEntries.push(updatedDivEntry);
      }
    } else { // a new player
      const newDivEntry = {
        ...divEntry,
        eType: "i",
      };
      teDivEntries.push(newDivEntry);
    }
  });
  return teDivEntries
}

const setPotEntryEditType = (origData: potEntryType[], extractedData: potEntryType[]): tmntEntryPotEntryType[] => { 

  const tePotEntries: tmntEntryPotEntryType[] = [];
  
  origData.forEach((potEntry) => {
    const found = extractedData.find(
      (pe) =>
        pe.player_id === potEntry.player_id &&
        pe.pot_id === potEntry.pot_id
    );
    if (!found) {
      const deletedPotEntry = {        
        ...blankPotEntry,
        pot_id: potEntry.pot_id,
        player_id: potEntry.player_id,
        fee: potEntry.fee,
        eType: "d",
      };
      tePotEntries.push(deletedPotEntry);
    }
  })
  // get updated or new potEntries
  extractedData.forEach((potEntry) => {
    const foundOrig = origData.find(
      (pe) =>
        pe.player_id === potEntry.player_id &&
        pe.pot_id === potEntry.pot_id
    );
    if (foundOrig) {
      // player in original data
      // if changed data, then mark row as updated
      if (JSON.stringify(potEntry) !== JSON.stringify(foundOrig)) {
        const updatedPotEntry = {
          ...blankPotEntry,
          pot_id: potEntry.pot_id,
          player_id: potEntry.player_id,
          fee: potEntry.fee,  
          eType: "u",
        };
        tePotEntries.push(updatedPotEntry);
      }
    } else { // a new player
      const newPotEntry = {
        ...blankPotEntry,
        pot_id: potEntry.pot_id,
        player_id: potEntry.player_id,
        fee: potEntry.fee,
        eType: "i",
      };
      tePotEntries.push(newPotEntry);
    }
  })
  return tePotEntries;
}

const setBrktEntryEditType = (origData: brktEntryType[], extractedData: brktEntryType[]): tmntEntryBrktEntryType[] => {

  const teBrktEntries: tmntEntryBrktEntryType[] = [];
  origData.forEach((brktEntry) => {
    const found = extractedData.find(
      (be) =>
        be.player_id === brktEntry.player_id &&
        be.brkt_id === brktEntry.brkt_id
    );
    if (!found) {
      const deletedBrktEntry = {
        ...brktEntry,
        eType: "d",
      };
      teBrktEntries.push(deletedBrktEntry);
    }
  })
  // get updated or new bracketEntries
  extractedData.forEach((brktEntry) => {
    const foundOrig = origData.find(
      (be) =>
        be.player_id === brktEntry.player_id &&
        be.brkt_id === brktEntry.brkt_id
    );
    if (foundOrig) {
      // player in original data
      // if changed data, then mark row as updated
      if (JSON.stringify(brktEntry) !== JSON.stringify(foundOrig)) {
        const updatedBrktEntry = {
          ...brktEntry,
          eType: "u",
        };
        teBrktEntries.push(updatedBrktEntry);
      }
    } else { // a new player
      const newBrktEntry = {
        ...brktEntry,
        eType: "i",
      };
      teBrktEntries.push(newBrktEntry);
    }
  })
  return teBrktEntries
}

const setElimEntryEditType = (origData: elimEntryType[], extractedData: elimEntryType[]): tmntEntryElimEntryType[] => {

  const teElimEntries: tmntEntryElimEntryType[] = [];

  origData.forEach((elimEntry) => {
    const found = extractedData.find(
      (ee) =>
        ee.player_id === elimEntry.player_id &&
        ee.elim_id === elimEntry.elim_id
    );
    if (!found) {
      const deletedElimEntry = {
        ...blankElimEntry,
        elim_id: elimEntry.elim_id,
        player_id: elimEntry.player_id,
        fee: elimEntry.fee,
        eType: "d",
      };
      teElimEntries.push(deletedElimEntry);
    }
  })
  // get updated or new elimEntries
  extractedData.forEach((elimEntry) => {
    const foundOrig = origData.find(
      (ee) =>
        ee.player_id === elimEntry.player_id &&
        ee.elim_id === elimEntry.elim_id
    );
    if (foundOrig) {
      // player in original data
      // if changed data, then mark row as updated
      if (JSON.stringify(elimEntry) !== JSON.stringify(foundOrig)) {
        const updatedElimEntry = {
          ...blankElimEntry,
          elim_id: elimEntry.elim_id,
          player_id: elimEntry.player_id,
          fee: elimEntry.fee,  
          eType: "u",
        };
        teElimEntries.push(updatedElimEntry);
      }
    } else { // a new player
      const newElimEntry = {
        ...blankElimEntry,
        elim_id: elimEntry.elim_id,
        player_id: elimEntry.player_id,
        fee: elimEntry.fee,
        eType: "i",
      };
      teElimEntries.push(newElimEntry);
    }
  })
  return teElimEntries
}

export const setEditTypes = (
  origData: dataOneSquadEntriesType,
  extractedData: dataOneSquadEntriesType  
): editedOneSquadEntriesType => {
  const editedData: editedOneSquadEntriesType = {
    squadId: extractedData.squadId,
    players: [],
    divEntries: [],
    potEntries: [],
    brktEntries: [],
    elimEntries: [],
  };

  editedData.players = setPlayerEditType(origData.players, extractedData.players);  
  editedData.divEntries = setDivEntryEditType(origData.divEntries, extractedData.divEntries, extractedData.squadId);
  editedData.potEntries = setPotEntryEditType(origData.potEntries, extractedData.potEntries);  
  editedData.brktEntries = setBrktEntryEditType(origData.brktEntries, extractedData.brktEntries);
  editedData.elimEntries = setElimEntryEditType(origData.elimEntries, extractedData.elimEntries);
  return editedData;
};

export const exportedForTesting = {
  setPlayerEditType,
  setDivEntryEditType, 
  setPotEntryEditType,
  setBrktEntryEditType,
  setElimEntryEditType
}