import { playerEntryData } from "@/app/dataEntry/playersForm/createColumns";
import {
  // allEntriesOneSquadType,
  brktEntryType,
  dataOneSquadEntriesType,
  divEntryType,
  elimEntryType,
  oneBrktType,
  playerType,
  potEntryType,
  putManyEntriesReturnType,
  tmntEntryBrktEntryType,
  tmntEntryDivEntryType,
  tmntEntryElimEntryType,
  tmntEntryPlayerType,
  tmntEntryPotEntryType,
  updatedEntriesCountsType,
} from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";
// import { allEntriesAllErrors, allEntriesNoUpdates, errorUpdate, initPlayer, noUpdates } from "../initVals";
import { extractDataFromRows } from "@/app/dataEntry/playersForm/extractData";
// import { putManyPlayers } from "../players/dbPlayers";
// import { putManyDivEntries } from "../divEntries/dbDivEntries";
// import { putManyPotEntries } from "../potEntries/dbPotEntries";
// import { putManyBrktEntries } from "../brktEntries/dbBrktEntries";
// import { putManyElimEntries } from "../elimEntries/dbElimEntries";
import { cloneDeep } from "lodash";
import { btDbUuid } from "@/lib/uuid";
// import { BracketList } from "@/components/brackets/bracketListClass";
// import { replaceOneBrktRows } from "../oneBrkts/dbOneBrkts";

/**
 * get players to update, insert and delete
 *
 * @param {playerType[]} editedPlayers - array of edited players
 * @param {playerType[]} origPlayers - array of original players
 * @returns {tmntEntryPlayerType[]} - array of players to save
 */
const getPlayersToSave = (
  editedPlayers: playerType[],
  origPlayers: playerType[]
) => {
  const toSave: tmntEntryPlayerType[] = [];
  if (
    !editedPlayers ||
    editedPlayers.length === 0 ||
    !origPlayers ||
    origPlayers.length === 0
  )
    return toSave;
  // get deleted players
  origPlayers.forEach((origPlayer: playerType) => {
    if (isValidBtDbId(origPlayer.id, "ply")) {
      const foundPlayer = editedPlayers.find(
        (player) => player.id === origPlayer.id
      );
      if (!foundPlayer) {
        const playerToDel: tmntEntryPlayerType = {
          ...origPlayer,
          eType: "d",
        };
        toSave.push(playerToDel);
      }
    }
  });
  // get edited and inserted players
  editedPlayers.forEach((editedPlayer: playerType) => {
    if (isValidBtDbId(editedPlayer.id, "ply")) {
      const foundPlayer = origPlayers.find(
        (player) => player.id === editedPlayer.id
      );
      if (foundPlayer) {
        // if player has been edited
        if (JSON.stringify(foundPlayer) !== JSON.stringify(editedPlayer)) {
          const playerToUpdate: tmntEntryPlayerType = {
            ...editedPlayer,
            eType: "u",
          };
          toSave.push(playerToUpdate);
        }
      } else {
        // an inserted player
        const playerToAdd: tmntEntryPlayerType = {
          ...editedPlayer,
          eType: "i",
        };
        toSave.push(playerToAdd);
      }
    }
  });
  return toSave;
};

/**
 * get divEntries to update, insert and delete
 *
 * @param {divEntryType[]} editedDivEntries - array of edited divEntries
 * @param {divEntryType[]} origDivEntries - array of original divEntries
 * @returns {tmntEntryDivEntryType[]} - array of divEntries to save
 */
const getDivEntriesToSave = (
  editedDivEntries: divEntryType[],
  origDivEntries: divEntryType[]
) => {
  const toSave: tmntEntryDivEntryType[] = [];
  if (!editedDivEntries || editedDivEntries.length === 0 || !origDivEntries)
    return toSave;

  origDivEntries.forEach((origDivEntry: divEntryType) => {
    if (isValidBtDbId(origDivEntry.id, "den")) {
      const foundDivEntry = editedDivEntries.find(
        (divEntry) =>
          divEntry.div_id === origDivEntry.div_id &&
          divEntry.player_id === origDivEntry.player_id
      );
      if (!foundDivEntry) {
        const divEntryToDel: tmntEntryDivEntryType = {
          ...origDivEntry,
          eType: "d",
        };
        toSave.push(divEntryToDel);
      }
    }
  });

  editedDivEntries.forEach((editedDivEntry: divEntryType) => {
    const foundDivEntry = origDivEntries.find(
      (divEntry) =>
        divEntry.div_id === editedDivEntry.div_id &&
        divEntry.player_id === editedDivEntry.player_id
    );
    if (foundDivEntry) {
      // if divEntry has been edited, extracted edited divEntry has a default
      // id, so compare w/o id's. also, when divEntry is updated, query
      // searches for div_id and player_id, not id, so no need to compare id's
      if (
        JSON.stringify({ ...foundDivEntry, id: "" }) !==
        JSON.stringify({ ...editedDivEntry, id: "" })
      ) {
        const divEntryToUpdate: tmntEntryDivEntryType = {
          ...editedDivEntry,
          id: foundDivEntry.id,
          eType: "u",
        };
        toSave.push(divEntryToUpdate);
      }
    } else {
      const divEntryToAdd: tmntEntryDivEntryType = {
        ...editedDivEntry,
        id: btDbUuid("den"), // get new id # for inserted divEntry rows
        eType: "i",
      };
      toSave.push(divEntryToAdd);
    }
  });

  return toSave;
};

/**
 * get potEntries to update, insert and delete
 *
 * @param {potEntryType[]} editedPotEntries - array of edited potEntries
 * @param {potEntryType[]} origPotEntries - array of original potEntries
 * @param {string} squadId - id of squad
 * @returns - array of potEntries to save
 */
const getPotEntriesToSave = (
  editedPotEntries: potEntryType[],
  origPotEntries: potEntryType[],
  squadId: string
) => {
  const toSave: tmntEntryPotEntryType[] = [];
  if (!editedPotEntries || editedPotEntries.length === 0 || !origPotEntries)
    return toSave;

  origPotEntries.forEach((origPotEntry: potEntryType) => {
    if (isValidBtDbId(origPotEntry.id, "pen")) {
      const foundPotEntry = editedPotEntries.find(
        (potEntry) =>
          potEntry.pot_id === origPotEntry.pot_id &&
          potEntry.player_id === origPotEntry.player_id
      );
      if (!foundPotEntry) {
        const potEntryToDel: tmntEntryPotEntryType = {
          ...origPotEntry,
          eType: "d",
        };
        toSave.push(potEntryToDel);
      }
    }
  });
  editedPotEntries.forEach((editedPotEntry: potEntryType) => {
    if (isValidBtDbId(editedPotEntry.id, "pen")) {
      const foundPotEntry = origPotEntries.find(
        (potEntry) =>
          potEntry.pot_id === editedPotEntry.pot_id &&
          potEntry.player_id === editedPotEntry.player_id
      );
      if (foundPotEntry) {
        if (
          JSON.stringify({ ...foundPotEntry, id: "" }) !==
          JSON.stringify({ ...editedPotEntry, id: "" })
        ) {
          const potEntryToUpdate: tmntEntryPotEntryType = {
            ...editedPotEntry,
            id: foundPotEntry.id,
            eType: "u",
          };
          toSave.push(potEntryToUpdate);
        }
      } else {
        const potEntryToAdd: tmntEntryPotEntryType = {
          ...editedPotEntry,
          id: btDbUuid("pen"), // get new id # for inserted potEntry rows
          eType: "i",
        };
        toSave.push(potEntryToAdd);
      }
    }
  });
  return toSave;
};

/**
 * get brktEntries to update, insert and delete
 *
 * @param {brktEntryType[]} editedBrktEntries - array of edited brktEntries
 * @param {brktEntryType[]} origBrktEntries - array of original brktEntries
 * @returns {tmntEntryBrktEntryType[]} - array of brktEntries to save
 */
const getBrktEntriesToSave = (
  editedBrktEntries: brktEntryType[],
  origBrktEntries: brktEntryType[]
) => {
  const toSave: tmntEntryBrktEntryType[] = [];
  if (!editedBrktEntries || editedBrktEntries.length === 0 || !origBrktEntries)
    return toSave;

  origBrktEntries.forEach((origBrktEntry: brktEntryType) => {
    if (isValidBtDbId(origBrktEntry.id, "ben")) {
      const foundBrktEntry = editedBrktEntries.find(
        (brktEntry) =>
          brktEntry.brkt_id === origBrktEntry.brkt_id &&
          brktEntry.player_id === origBrktEntry.player_id
      );
      if (!foundBrktEntry) {
        const brktEntryToDel: tmntEntryBrktEntryType = {
          ...origBrktEntry,
          eType: "d",
        };
        toSave.push(brktEntryToDel);
      }
    }
  });

  editedBrktEntries.forEach((editedBrktEntry: brktEntryType) => {
    if (isValidBtDbId(editedBrktEntry.id, "ben")) {
      const foundBrktEntry = origBrktEntries.find(
        (brktEntry) =>
          brktEntry.brkt_id === editedBrktEntry.brkt_id &&
          brktEntry.player_id === editedBrktEntry.player_id
      );
      if (foundBrktEntry) {
        if (
          JSON.stringify({ ...foundBrktEntry, id: "" }) !==
          JSON.stringify({ ...editedBrktEntry, id: "" })
        ) {
          const brktEntryToUpdate: tmntEntryBrktEntryType = {
            ...editedBrktEntry,
            id: foundBrktEntry.id,
            eType: "u",
          };
          toSave.push(brktEntryToUpdate);
        }
      } else {
        const brktEntryToAdd: tmntEntryBrktEntryType = {
          ...editedBrktEntry,
          id: btDbUuid("ben"), // get new id # for inserted brktEntry rows
          eType: "i",
        };
        toSave.push(brktEntryToAdd);
      }
    }
  });

  return toSave;
};

/**
 * get elimEntries to update, insert and delete
 *
 * @param {elimEntryType[]} editedElimEntries - array of edited elimEntries
 * @param {elimEntryType[]} origElimEntries - array of original elimEntries
 * @returns {tmntEntryElimEntryType[]} - array of elimEntries to save
 */
const getElimEntriesToSave = (
  editedElimEntries: elimEntryType[],
  origElimEntries: elimEntryType[]
) => {
  const toSave: tmntEntryElimEntryType[] = [];
  if (!editedElimEntries || editedElimEntries.length === 0 || !origElimEntries)
    return toSave;

  origElimEntries.forEach((origElimEntry: elimEntryType) => {
    if (isValidBtDbId(origElimEntry.id, "een")) {
      const foundElimEntry = editedElimEntries.find(
        (elimEntry) =>
          elimEntry.elim_id === origElimEntry.elim_id &&
          elimEntry.player_id === origElimEntry.player_id
      );
      if (!foundElimEntry) {
        const elimEntryToDel: tmntEntryElimEntryType = {
          ...origElimEntry,
          eType: "d",
        };
        toSave.push(elimEntryToDel);
      }
    }
  });

  editedElimEntries.forEach((editedElimEntry: elimEntryType) => {
    if (isValidBtDbId(editedElimEntry.id, "een")) {
      const foundElimEntry = origElimEntries.find(
        (elimEntry) =>
          elimEntry.elim_id === editedElimEntry.elim_id &&
          elimEntry.player_id === editedElimEntry.player_id
      );
      if (foundElimEntry) {
        if (
          JSON.stringify({ ...foundElimEntry, id: "" }) !==
          JSON.stringify({ ...editedElimEntry, id: "" })
        ) {
          const elimEntryToUpdate: tmntEntryElimEntryType = {
            ...editedElimEntry,
            id: foundElimEntry.id,
            eType: "u",
          };
          toSave.push(elimEntryToUpdate);
        }
      } else {
        const elimEntryToAdd: tmntEntryElimEntryType = {
          ...editedElimEntry,
          id: btDbUuid("een"), // get new id # for inserted elimEntry rows
          eType: "i",
        };
        toSave.push(elimEntryToAdd);
      }
    }
  });

  return toSave;
};

/**
 * checks if there are any negative update counts
 *
 * @param updateCounts - count of updates for each type
 * @returns - true if any of the counts are negative
 */
export const gotUpdateErrors = (updateCounts: putManyEntriesReturnType) => {
  if (!updateCounts) return true;
  // check for negative values
  if (
    updateCounts.players.deletes < 0 ||
    updateCounts.players.updates < 0 ||
    updateCounts.players.inserts < 0 ||
    updateCounts.divEntries.deletes < 0 ||
    updateCounts.divEntries.updates < 0 ||
    updateCounts.divEntries.inserts < 0 ||
    updateCounts.potEntries.deletes < 0 ||
    updateCounts.potEntries.updates < 0 ||
    updateCounts.potEntries.inserts < 0 ||
    updateCounts.brktEntries.deletes < 0 ||
    updateCounts.brktEntries.updates < 0 ||
    updateCounts.brktEntries.inserts < 0 ||
    updateCounts.elimEntries.deletes < 0 ||
    updateCounts.elimEntries.updates < 0 ||
    updateCounts.elimEntries.inserts < 0
  ) {
    return true;
  }
  return false;
};

/**
 * get total number of updates
 *
 * @param {putManyEntriesReturnType} updateInfo - object of update counts and values to update
 * @returns {number} - total number of updates, -1 if errors
 */
export const getTotalUpdated = (updateInfo: putManyEntriesReturnType) => {
  if (!updateInfo) return 0;
  if (gotUpdateErrors(updateInfo)) return -1;
  return (
    updateInfo.players.deletes +
    updateInfo.players.updates +
    updateInfo.players.inserts +
    updateInfo.divEntries.deletes +
    updateInfo.divEntries.updates +
    updateInfo.divEntries.inserts +
    updateInfo.potEntries.deletes +
    updateInfo.potEntries.updates +
    updateInfo.potEntries.inserts +
    updateInfo.brktEntries.deletes +
    updateInfo.brktEntries.updates +
    updateInfo.brktEntries.inserts +
    updateInfo.elimEntries.deletes +
    updateInfo.elimEntries.updates +
    updateInfo.elimEntries.inserts
  );
};

/**
 * updated players array after saving
 * pass the return value to the reducer in allEntriesOneSquadSlice
 *
 * @param {tmntEntryPlayerType[]} playersToSave - array of saved players
 * @param {allEntriesOneSquadType} allEntries - object with current and original data
 * @returns {playerType[] | null} - updated players array or null
 */
const updateCurrentPlayers = (
  playersToSave: tmntEntryPlayerType[],
  allEntries: allEntriesOneSquadType
): playerType[] | null => {
  if (!playersToSave || !allEntries) return null;
  if (playersToSave.length === 0) return [];

  let updatedPlayers = [...allEntries.curData.players];

  // deletes
  const toDelete = playersToSave.filter((player) => player.eType === "d");
  toDelete.forEach((player: tmntEntryPlayerType) => {
    const curIndex = updatedPlayers.findIndex(
      (curPlayer) => curPlayer.id === player.id
    );
    if (curIndex !== -1) {
      updatedPlayers.splice(curIndex, 1);
    }
  });

  // updates
  const toUpdate = playersToSave.filter((player) => player.eType === "u");
  toUpdate.forEach((player: tmntEntryPlayerType) => {
    const curIndex = updatedPlayers.findIndex(
      (curPlayer) => curPlayer.id === player.id
    );
    if (curIndex !== -1) {
      updatedPlayers[curIndex] = {
        ...allEntries.curData.players[curIndex],
        ...player,
      };
    }
  });

  // inserts
  const toInsert = playersToSave.filter((player) => player.eType === "i");
  toInsert.forEach((player: tmntEntryPlayerType) => {
    const { eType, ...insPlayer } = player;
    updatedPlayers.push(insPlayer);
  });

  try {
    allEntries.curData.players = updatedPlayers;
  } catch (error) {
    console.log("error: ", error);
  }
  return updatedPlayers;
};

/**
 * updated divEntries array after saving
 * pass the return value to the reducer in allEntriesOneSquadSlice
 *
 * @param {tmntEntryDivEntryType[]} divEntriesToSave - array of saved divEntries
 * @param {allEntriesOneSquadType} allEntries - object with current and original data
 * @returns {divEntryType[] | null} - updated divEntries array or null
 */
const updateCurrentDivEntries = (
  divEntriesToSave: tmntEntryDivEntryType[],
  allEntries: allEntriesOneSquadType
): divEntryType[] | null => {
  if (!divEntriesToSave || !allEntries) return null;
  if (divEntriesToSave.length === 0) return [];

  let updatedDivEntries = [...allEntries.curData.divEntries];

  // deletes
  const toDelete = divEntriesToSave.filter(
    (divEntry) => divEntry.eType === "d"
  );
  toDelete.forEach((divEntry: tmntEntryDivEntryType) => {
    const curIndex = updatedDivEntries.findIndex(
      (curDivEntry) =>
        divEntry.div_id === curDivEntry.div_id &&
        divEntry.player_id === curDivEntry.player_id
    );
    if (curIndex !== -1) {
      updatedDivEntries.splice(curIndex, 1);
    }
  });

  // updates
  const toUpdate = divEntriesToSave.filter(
    (divEntry) => divEntry.eType === "u"
  );
  toUpdate.forEach((divEntry: tmntEntryDivEntryType) => {
    const curIndex = updatedDivEntries.findIndex(
      (curDivEntry) =>
        divEntry.div_id === curDivEntry.div_id &&
        divEntry.player_id === curDivEntry.player_id
    );
    if (curIndex !== -1) {
      updatedDivEntries[curIndex] = {
        ...updatedDivEntries[curIndex],
        fee: divEntry.fee,
      };
    }
  });

  // inserts
  const toInsert = divEntriesToSave.filter(
    (divEntry) => divEntry.eType === "i"
  );
  toInsert.forEach((divEntry: tmntEntryDivEntryType) => {
    const { eType, ...insDivEntry } = divEntry;
    updatedDivEntries.push(insDivEntry);
  });

  return updatedDivEntries;
};

/**
 * updated potEntries array after saving
 * pass the return value to the reducer in allEntriesOneSquadSlice
 *
 * @param {tmntEntryPotEntryType[]} potEntriesToSave - array of saved potEntries
 * @param {allEntriesOneSquadType} allEntries - object with current and original data
 * @returns {potEntryType[] | null} - updated potEntries array or null
 */
const updateCurrentPotEntries = (
  potEntriesToSave: tmntEntryPotEntryType[],
  allEntries: allEntriesOneSquadType
): potEntryType[] | null => {
  if (!potEntriesToSave || !allEntries) return null;
  if (potEntriesToSave.length === 0) return [];

  let updatedPotEntries = [...allEntries.curData.potEntries];

  // deletes
  const toDelete = potEntriesToSave.filter(
    (potEntry) => potEntry.eType === "d"
  );
  toDelete.forEach((potEntry: tmntEntryPotEntryType) => {
    const curIndex = updatedPotEntries.findIndex(
      (curPotEntry) =>
        potEntry.pot_id === curPotEntry.pot_id &&
        potEntry.player_id === curPotEntry.player_id
    );
    if (curIndex !== -1) {
      updatedPotEntries.splice(curIndex, 1);
    }
  });

  // updates
  const toUpdate = potEntriesToSave.filter(
    (potEntry) => potEntry.eType === "u"
  );
  toUpdate.forEach((potEntry: tmntEntryPotEntryType) => {
    const curIndex = updatedPotEntries.findIndex(
      (curPotEntry) =>
        potEntry.pot_id === curPotEntry.pot_id &&
        potEntry.player_id === curPotEntry.player_id
    );
    if (curIndex !== -1) {
      updatedPotEntries[curIndex] = {
        ...updatedPotEntries[curIndex],
        fee: potEntry.fee,
      };
    }
  });

  // inserts
  const toInsert = potEntriesToSave.filter(
    (potEntry) => potEntry.eType === "i"
  );
  toInsert.forEach((potEntry: tmntEntryPotEntryType) => {
    const { eType, ...insPotEntry } = potEntry;
    updatedPotEntries.push(insPotEntry);
  });

  return updatedPotEntries;
};

/**
 * updated brktEntries array after saving
 *
 * @param {tmntEntryPotEntryType[]} brktEntriesToSave - array of saved brktEntries
 * @param {allEntriesOneSquadType} allEntries - object with current and original data
 * @returns {brktEntryType[] | null} - updated brktEntries array or null
 */
const updateCurrentBrktEntries = (
  brktEntriesToSave: tmntEntryBrktEntryType[],
  allEntries: allEntriesOneSquadType
): brktEntryType[] | null => {
  if (!brktEntriesToSave || !allEntries) return null;
  if (brktEntriesToSave.length === 0) return [];

  let updatedBrktEntries = [...allEntries.curData.brktEntries];

  // deletes
  const toDelete = brktEntriesToSave.filter(
    (brktEntry) => brktEntry.eType === "d"
  );
  toDelete.forEach((brktEntry: tmntEntryBrktEntryType) => {
    const curIndex = updatedBrktEntries.findIndex(
      (curBrktEntry) =>
        brktEntry.brkt_id === curBrktEntry.brkt_id &&
        brktEntry.player_id === curBrktEntry.player_id
    );
    if (curIndex !== -1) {
      updatedBrktEntries.splice(curIndex, 1);
    }
  });

  // updates
  const toUpdate = brktEntriesToSave.filter(
    (brktEntry) => brktEntry.eType === "u"
  );
  toUpdate.forEach((brktEntry: tmntEntryBrktEntryType) => {
    const curIndex = updatedBrktEntries.findIndex(
      (curBrktEntry) =>
        brktEntry.brkt_id === curBrktEntry.brkt_id &&
        brktEntry.player_id === curBrktEntry.player_id
    );
    if (curIndex !== -1) {
      updatedBrktEntries[curIndex] = {
        ...updatedBrktEntries[curIndex],
        num_brackets: brktEntry.num_brackets,
        fee: brktEntry.fee,
        time_stamp: brktEntry.time_stamp,
      };
    }
  });

  // inserts
  const toInsert = brktEntriesToSave.filter(
    (brktEntry) => brktEntry.eType === "i"
  );
  toInsert.forEach((brktEntry: tmntEntryBrktEntryType) => {
    const { eType, ...insBrktEntry } = brktEntry;
    updatedBrktEntries.push(insBrktEntry);
  });

  return updatedBrktEntries;
};

/**
 * update current elimEntries array and original elimEntries array after saving
 *
 * @param {tmntEntryElimEntryType[]} elimEntriesToSave - array of saved elimEntries
 * @param {allEntriesOneSquadType} allEntries - object with current and original data
 * @returns {elimEntryType[] | null} - updated elimEntries array or null
 */
const updateCurrentElimEntries = (
  elimEntriesToSave: tmntEntryElimEntryType[],
  allEntries: allEntriesOneSquadType
): elimEntryType[] | null => {
  if (!elimEntriesToSave || !allEntries) return null;
  if (elimEntriesToSave.length === 0) return [];

  let updatedElimEntries = [...allEntries.curData.elimEntries];

  // deletes
  const toDelete = elimEntriesToSave.filter(
    (elimEntry) => elimEntry.eType === "d"
  );
  toDelete.forEach((elimEntry: tmntEntryElimEntryType) => {
    const curIndex = updatedElimEntries.findIndex(
      (curElimEntry) =>
        elimEntry.elim_id === curElimEntry.elim_id &&
        elimEntry.player_id === curElimEntry.player_id
    );
    if (curIndex !== -1) {
      updatedElimEntries.splice(curIndex, 1);
    }
  });

  // updates
  const toUpdate = elimEntriesToSave.filter(
    (elimEntry) => elimEntry.eType === "u"
  );
  toUpdate.forEach((elimEntry: tmntEntryElimEntryType) => {
    const curIndex = updatedElimEntries.findIndex(
      (curElimEntry) =>
        elimEntry.elim_id === curElimEntry.elim_id &&
        elimEntry.player_id === curElimEntry.player_id
    );
    if (curIndex !== -1) {
      updatedElimEntries[curIndex] = {
        ...updatedElimEntries[curIndex],
        fee: elimEntry.fee,
      };
    }
  });

  // inserts
  const toInsert = elimEntriesToSave.filter(
    (elimEntry) => elimEntry.eType === "i"
  );
  toInsert.forEach((elimEntry: tmntEntryElimEntryType) => {
    const { eType, ...insElimEntry } = elimEntry;
    updatedElimEntries.push(insElimEntry);
  });

  return updatedElimEntries;
};

/**
 * save all entries
 *
 * @param {playerEntryData[]} rows - array of playerEntryData from grid
 * @param {allEntriesOneSquadType} allEntries - object with current and original data
 * @returns {putManyEntriesReturnType} - object of update counts, and data that was updated
 */
export const saveEntriesData = async (
  rows: (typeof playerEntryData)[],
  allEntries: allEntriesOneSquadType
): Promise<putManyEntriesReturnType> => {
  try {
    const updateInfo: putManyEntriesReturnType = cloneDeep(allEntriesNoUpdates);
    if (
      !rows ||
      !allEntries ||
      !allEntries.curData ||
      !allEntries.origData ||
      !isValidBtDbId(allEntries.origData.squadId, "sqd")
    ) {
      return cloneDeep(allEntriesAllErrors);
    }
    if (rows.length === 0) return updateInfo;

    const extractedData: dataOneSquadEntriesType = extractDataFromRows(
      rows,
      allEntries.origData.squadId
    );
    if (!extractedData) return updateInfo;
  } catch (err) {}

  // const updateInfo: putManyEntriesReturnType = cloneDeep(allEntriesNoUpdates)
  // if (!rows ||
  //   !allEntries ||
  //   !allEntries.curData ||
  //   !allEntries.origData ||
  //   !isValidBtDbId(allEntries.origData.squadId, "sqd")
  // ) {
  //   return cloneDeep(allEntriesAllErrors)
  // }
  // if (rows.length === 0) return updateInfo;

  // const extractedData: dataOneSquadEntriesType = extractDataFromRows(rows, allEntries.origData.squadId);
  // if (!extractedData) return updateInfo;

  // updateInfo.playersToUpdate = getPlayersToSave(extractedData.players, allEntries.origData.players);
  // let updates = await putManyPlayers(updateInfo.playersToUpdate);
  // if (!updates) {
  //   updateInfo.players = errorUpdate;
  // } else {
  //   updateInfo.players = updates;
  // }

  // updateInfo.divEntriesToUpdate = getDivEntriesToSave(extractedData.divEntries, allEntries.origData.divEntries);
  // updates = await putManyDivEntries(updateInfo.divEntriesToUpdate);
  // if (!updates) {
  //   updateInfo.divEntries = errorUpdate;
  // } else {
  //   updateInfo.divEntries = updates;
  // }

  // updateInfo.potEntriesToUpdate = getPotEntriesToSave(extractedData.potEntries, allEntries.origData.potEntries, allEntries.origData.squadId);
  // updates = await putManyPotEntries(updateInfo.potEntriesToUpdate);
  // if (!updates) {
  //   updateInfo.potEntries = errorUpdate;
  // } else {
  //   updateInfo.potEntries = updates;
  // }

  // updateInfo.brktEntriesToUpdate = getBrktEntriesToSave(extractedData.brktEntries, allEntries.origData.brktEntries);
  // updates = await putManyBrktEntries(updateInfo.brktEntriesToUpdate);
  // if (!updates) {
  //   updateInfo.brktEntries = errorUpdate;
  // } else {
  //   updateInfo.brktEntries = updates;
  // }

  // updateInfo.elimEntriesToUpdate = getElimEntriesToSave(extractedData.elimEntries, allEntries.origData.elimEntries);
  // updates = await putManyElimEntries(updateInfo.elimEntriesToUpdate);
  // if (!updates) {
  //   updateInfo.elimEntries = errorUpdate;
  // } else {
  //   updateInfo.elimEntries = updates;
  // }
  // return updateInfo;
};

export const updateAllEntries = (
  updateInfo: putManyEntriesReturnType,
  allEntries: allEntriesOneSquadType
) => {
  if (!updateInfo || !allEntries || !allEntries.origData) return null;
  const allUpdates: dataOneSquadEntriesType = {
    squadId: allEntries.origData.squadId,
    players: [],
    divEntries: [],
    potEntries: [],
    brktEntries: [],
    brktLists: [],
    elimEntries: [],
  };

  const updatedPlayers = updateCurrentPlayers(
    updateInfo.playersToUpdate,
    allEntries
  );
  if (!updatedPlayers) return null;
  allUpdates.players = updatedPlayers;

  const updatedDivEntries = updateCurrentDivEntries(
    updateInfo.divEntriesToUpdate,
    allEntries
  );
  if (!updatedDivEntries) return null;
  allUpdates.divEntries = updatedDivEntries;

  const updatedPotEntries = updateCurrentPotEntries(
    updateInfo.potEntriesToUpdate,
    allEntries
  );
  if (!updatedPotEntries) return null;
  allUpdates.potEntries = updatedPotEntries;

  const updatedBrktEntries = updateCurrentBrktEntries(
    updateInfo.brktEntriesToUpdate,
    allEntries
  );
  if (!updatedBrktEntries) return null;
  allUpdates.brktEntries = updatedBrktEntries;

  const updatedElimEntries = updateCurrentElimEntries(
    updateInfo.elimEntriesToUpdate,
    allEntries
  );
  if (!updatedElimEntries) return null;
  allUpdates.elimEntries = updatedElimEntries;

  return allUpdates;
};

export const exportedForTesting = {
  getPlayersToSave,
  getDivEntriesToSave,
  getPotEntriesToSave,
  getBrktEntriesToSave,
  getElimEntriesToSave,
  updateCurrentPlayers,
  updateCurrentDivEntries,
  updateCurrentPotEntries,
  updateCurrentBrktEntries,
  updateCurrentElimEntries,
};
