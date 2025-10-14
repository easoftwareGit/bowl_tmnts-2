import {
  brktEntryType,
  brktSeedType,
  brktType,
  divType,
  elimEntryType,
  elimType,
  eventType,
  laneType,
  oneBrktType,
  playerType,
  potEntryType,
  potType,
  squadType,
  tmntFullDataErrType,
  tmntFullType,
  validBrktEntriesType,
  validBrktSeedsType,
  validBrktsType,
  validDivEntriesType,
  validDivsType,
  validElimEntriesType,
  validElimsType,
  validEventsType,
  validLanesType,
  validOneBrktsType,
  validPlayersType,
  validPotEntriesType,
  validPotsType,
  validSquadsType,
} from "@/lib/types/types";
import { ErrorCode, isValidBtDbId, maxMoney } from "@/lib/validation";
import { validateTmnt } from "../valildate";
import { validateEvents } from "../../events/validate";
import { validateLanes } from "../../lanes/validate";
import { validateOneBrkts } from "../../oneBrkts/valildate";
import { validatePlayers } from "../../players/validate";
import { validatePots } from "../../pots/validate";
import { validatePotEntries } from "../../potEntries/validate";
import { validateSquads } from "../../squads/validate";
import { validateBrkts } from "../../brkts/validate";
import { validateBrktEntries } from "../../brktEntries/validate";
import { validateBrktSeeds } from "../../brktSeeds/validate";
import { validateDivs } from "../../divs/validate";
import { validateDivEntries } from "../../divEntries/validate";
import { validateElims } from "../../elims/validate";
import { validateElimEntries } from "../../elimEntries/validate";

const noError: tmntFullDataErrType = {
  errorCode: ErrorCode.None,
  errorTable: "",
  errorIndex: 0,
  message: "",
};

/**
 * Generates a basic error message
 *
 * @param {ErrorCode} errorCode - error code
 * @param {string} errorTable - error table
 * @returns {string} - error message
 */
const basicErrMsg = (errorCode: ErrorCode, errorTable: string): string => {
  if (errorCode === ErrorCode.MissingData) {
    return `${errorTable} is missing data`;
  } else if (errorCode === ErrorCode.InvalidData) {
    return `${errorTable} has invalid data`;
  } else if (errorCode === ErrorCode.OtherError) {
    return `${errorTable} has an unknown error`;
  } else {
    return "";
  }
};

/**
 * Generates an advanced error message
 *
 * @param {tmntFullDataErrType} errorInfo - error information
 * @returns {string} - error message
 */
const advancedErrMsg = (errorInfo: tmntFullDataErrType): string => {
  if (errorInfo.errorCode === ErrorCode.MissingData) {
    return `${errorInfo.errorTable} has missing data at index ${errorInfo.errorIndex}`;
  } else if (errorInfo.errorCode === ErrorCode.InvalidData) {
    return `${errorInfo.errorTable} has invalid data at index ${errorInfo.errorIndex}`;
  } else if (errorInfo.errorCode === ErrorCode.OtherError) {
    return `${errorInfo.errorTable} has an unknown error at index ${errorInfo.errorIndex}`;
  } else {
    return "";
  }
};

/**
 * gets brkts error
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {tmntFullDataErrType} - error information
 */
const getBrktsError = (tmntFullData: tmntFullType): tmntFullDataErrType => {
  const brkts: brktType[] = tmntFullData.brkts;
  const divs: divType[] = tmntFullData.divs;
  const squads: squadType[] = tmntFullData.squads;
  if (!brkts || !Array.isArray(brkts)) {
    return {
      errorTable: "brkts",
      errorCode: ErrorCode.MissingData,
      errorIndex: 0,
      message: "no brkts data",
    };
  }
  // must have parents if have child data
  if (
    !divs ||
    !Array.isArray(divs) ||
    !squads ||
    !Array.isArray(squads) ||
    ((divs.length === 0 || squads.length === 0) && brkts.length > 0)
  ) {
    return {
      errorTable: "brkts",
      errorCode: ErrorCode.MissingData,
      errorIndex: 0,
      message: "no brkts parent data",
    };
  }

  // ok to have 0 brkts
  let validBrkts: validBrktsType = { brkts: [], errorCode: ErrorCode.None };
  const brktsErr: tmntFullDataErrType = {
    ...noError,
  };
  // ok to have 0 brkts
  if (brkts.length === 0) return brktsErr;

  validBrkts = validateBrkts(brkts);
  if (
    validBrkts.errorCode !== ErrorCode.None ||
    validBrkts.brkts.length !== brkts.length
  ) {
    brktsErr.errorTable = "brkts";
    brktsErr.errorCode = validBrkts.errorCode;
    if (validBrkts.brkts.length === 0) {
      brktsErr.errorIndex = 0;
    } else {
      const errorIndex = brkts.findIndex(
        (brkt) => !isValidBtDbId(brkt.id, "brk")
      );
      if (errorIndex < 0) {
        brktsErr.errorIndex = validBrkts.brkts.length;
      } else {
        brktsErr.errorIndex = errorIndex;
      }
    }
    brktsErr.message = advancedErrMsg(brktsErr);
    return brktsErr;
  }

  // validateBrkts is called without parent div or squad data
  // check parent/child relationships here
  for (let i = 0; i < brkts.length; i++) {
    const brkt = brkts[i];
    const div = divs.find((d) => d.id === brkt.div_id);
    if (!div) {
      brktsErr.errorTable = "brkts";
      brktsErr.errorCode = ErrorCode.MissingData;
      brktsErr.errorIndex = i;
      brktsErr.message =
        "brkts has no parent div at index " + brktsErr.errorIndex;
      return brktsErr;
    }
    const squad = squads.find((s) => s.id === brkt.squad_id);
    if (!squad) {
      brktsErr.errorTable = "brkts";
      brktsErr.errorCode = ErrorCode.MissingData;
      brktsErr.errorIndex = i;
      brktsErr.message =
        "brkts has no parent squad at index " + brktsErr.errorIndex;
      return brktsErr;
    }
  }
  // if got here, then no errors in brkts
  // replace brkts with sanitized brkts
  tmntFullData.brkts = validBrkts.brkts;
  return brktsErr;
};

/**
 * gets brktEntries error
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {tmntFullDataErrType} - error information
 */
const getBrktEntriesError = (
  tmntFullData: tmntFullType
): tmntFullDataErrType => {
  let brktEntries: brktEntryType[] = tmntFullData.brktEntries;
  const brkts: brktType[] = tmntFullData.brkts;
  const players: playerType[] = tmntFullData.players;

  if (!brktEntries || !Array.isArray(brktEntries)) {
    return {
      errorTable: "brktEntries",
      errorCode: ErrorCode.MissingData,
      errorIndex: 0,
      message: "no brktEntries data",
    };
  }
  // must have parent if have child data
  if (
    !brkts ||
    !Array.isArray(brkts) ||
    (brkts.length === 0 && brktEntries.length > 0)
  ) {
    return {
      errorTable: "brktEntries",
      errorCode: ErrorCode.MissingData,
      errorIndex: 0,
      message: "no brktEntries parent data",
    };
  }

  // ok to have 0 brktEntries
  let validBrktEntries: validBrktEntriesType = {
    brktEntries: [],
    errorCode: ErrorCode.None,
  };
  const brktEntriesErr: tmntFullDataErrType = {
    ...noError,
  };
  // ok to have 0 brktEntries
  if (brktEntries.length === 0) return brktEntriesErr;

  // remove any brktEntries with 0 num_brackets
  brktEntries = brktEntries.filter((brktEntry) => brktEntry.num_brackets > 0);
  // if no brktEntries left, then no error
  if (brktEntries.length === 0) {
    tmntFullData.brktEntries = [];
    return brktEntriesErr;
  }

  validBrktEntries = validateBrktEntries(brktEntries);
  if (
    validBrktEntries.errorCode !== ErrorCode.None ||
    validBrktEntries.brktEntries.length !== brktEntries.length
  ) {
    brktEntriesErr.errorTable = "brktEntries";
    brktEntriesErr.errorCode = validBrktEntries.errorCode;
    if (validBrktEntries.brktEntries.length === 0) {
      brktEntriesErr.errorIndex = 0;
    } else {
      const errorIndex = brktEntries.findIndex(
        (brktEntry) => !isValidBtDbId(brktEntry.id, "ben")
      );
      if (errorIndex < 0) {
        brktEntriesErr.errorIndex = validBrktEntries.brktEntries.length;
      } else {
        brktEntriesErr.errorIndex = errorIndex;
      }
    }
    brktEntriesErr.message = advancedErrMsg(brktEntriesErr);
    return brktEntriesErr;
  }
  // validateBrktEntries is called without parent brkt data
  // check parent/child relationships here
  for (let i = 0; i < brktEntries.length; i++) {
    const brktEntry = brktEntries[i];
    let brktFee = 0;
    const brkt = brkts.find((b) => b.id === brktEntry.brkt_id);
    if (!brkt) {
      brktEntriesErr.errorTable = "brktEntries";
      brktEntriesErr.errorCode = ErrorCode.MissingData;
      brktEntriesErr.errorIndex = i;
      brktEntriesErr.message =
        "brktEntries has no parent brkt at index " + brktEntriesErr.errorIndex;
      return brktEntriesErr;
    } else {
      brktFee = Number(brkt.fee); // already tested for valid money
    }
    const player = players.find((p) => p.id === brktEntry.player_id);
    if (!player) {
      brktEntriesErr.errorTable = "brktEntries";
      brktEntriesErr.errorCode = ErrorCode.MissingData;
      brktEntriesErr.errorIndex = i;
      brktEntriesErr.message =
        "brktEntries has no parent player at index " +
        brktEntriesErr.errorIndex;
      return brktEntriesErr;
    }
  }
  // if got here, then no errors in brktEntries
  // replace brktEntries with sanitized brktEntries
  tmntFullData.brktEntries = validBrktEntries.brktEntries;
  return brktEntriesErr;
};

/**
 * gets brktSeeds error
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {tmntFullDataErrType} - error information
 */
const getBrktSeedsError = (tmntFullData: tmntFullType): tmntFullDataErrType => {
  const brktSeeds: brktSeedType[] = tmntFullData.brktSeeds;
  const oneBrkts: oneBrktType[] = tmntFullData.oneBrkts;
  const brkts: brktType[] = tmntFullData.brkts;
  const brktEntries: brktEntryType[] = tmntFullData.brktEntries;
  const players: playerType[] = tmntFullData.players;

  if (!brktSeeds || !Array.isArray(brktSeeds)) {
    return {
      errorTable: "brktSeeds",
      errorCode: ErrorCode.MissingData,
      errorIndex: 0,
      message: "no brktSeeds data",
    };
  }
  if (
    (!brkts ||
      !Array.isArray(brkts) ||
      brkts.length === 0 ||
      !brktEntries ||
      !Array.isArray(brktEntries) ||
      brktEntries.length === 0 ||
      !oneBrkts ||
      !Array.isArray(oneBrkts) ||
      oneBrkts.length === 0) &&
    brktSeeds.length > 0
  ) {
    return {
      errorTable: "brktSeeds",
      errorCode: ErrorCode.MissingData,
      errorIndex: 0,
      message: "no brktSeeds parent data",
    };
  }
  if (oneBrkts.length > 0 && brktSeeds.length === 0) {
    return {
      errorTable: "brktSeeds",
      errorCode: ErrorCode.MissingData,
      errorIndex: 0,
      message: "no brktSeeds child data",
    };
  }

  let validBrktSeeds: validBrktSeedsType = {
    brktSeeds: [],
    errorCode: ErrorCode.None,
  };
  const brktSeedsErr: tmntFullDataErrType = {
    ...noError,
  };
  if (brktSeeds.length === 0) return brktSeedsErr;

  validBrktSeeds = validateBrktSeeds(brktSeeds);
  if (
    validBrktSeeds.errorCode !== ErrorCode.None ||
    validBrktSeeds.brktSeeds.length !== brktSeeds.length
  ) {
    brktSeedsErr.errorTable = "brktSeeds";
    brktSeedsErr.errorCode = validBrktSeeds.errorCode;
    if (validBrktSeeds.brktSeeds.length === 0) {
      brktSeedsErr.errorIndex = 0;
    } else {
      const errorIndex = brktSeeds.findIndex(
        (brktSeed) => !isValidBtDbId(brktSeed.one_brkt_id, "obk")
      );
      if (errorIndex < 0) {
        brktSeedsErr.errorIndex = validBrktSeeds.brktSeeds.length;
      } else {
        brktSeedsErr.errorIndex = errorIndex;
      }
    }
    brktSeedsErr.message = advancedErrMsg(brktSeedsErr);
    return brktSeedsErr;
  }
  // validateBrktSeeds is called without parent oneBrkt data
  // check parent/child relationships here
  for (let i = 0; i < brktSeeds.length; i++) {
    const brktSeed = brktSeeds[i];
    const oneBrkt = oneBrkts.find((b) => b.id === brktSeed.one_brkt_id);
    if (!oneBrkt) {
      brktSeedsErr.errorTable = "brktSeeds";
      brktSeedsErr.errorCode = ErrorCode.MissingData;
      brktSeedsErr.errorIndex = i;
      brktSeedsErr.message =
        "brktSeeds has no parent oneBrkt at index " + brktSeedsErr.errorIndex;
      return brktSeedsErr;
    }
    const player = players.find((p) => p.id === brktSeed.player_id);
    if (!player) {
      brktSeedsErr.errorTable = "brktSeeds";
      brktSeedsErr.errorCode = ErrorCode.MissingData;
      brktSeedsErr.errorIndex = i;
      brktSeedsErr.message =
        "brktSeeds has no parent player at index " + brktSeedsErr.errorIndex;
      return brktSeedsErr;
    }
  }
  // do not need to replace brktSeeds with sanitized brktSeeds
  // brktSeeds has no user input, sanitized data will be valid or not saved
  // tmntFullData.brktSeeds = validBrktSeeds.brktSeeds;
  return brktSeedsErr;
};

/**
 * gets divs error
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {tmntFullDataErrType} - error information
 */
const getDivsError = (tmntFullData: tmntFullType): tmntFullDataErrType => {
  const divs = tmntFullData.divs;
  const tmnt = tmntFullData.tmnt;
  if (!divs || !Array.isArray(divs) || divs.length === 0) {
    return {
      errorCode: ErrorCode.MissingData,
      errorTable: "divs",
      errorIndex: 0,
      message: "no divs data",
    };
  }
  let validDivs: validDivsType = { divs: [], errorCode: ErrorCode.None };
  const divsErr: tmntFullDataErrType = {
    ...noError,
  };
  validDivs = validateDivs(divs);
  if (
    validDivs.errorCode !== ErrorCode.None ||
    validDivs.divs.length !== divs.length
  ) {
    divsErr.errorTable = "divs";
    divsErr.errorCode = validDivs.errorCode;
    if (validDivs.divs.length === 0) {
      divsErr.errorIndex = 0;
    } else {
      const errorIndex = divs.findIndex((div) => !isValidBtDbId(div.id, "div"));
      if (errorIndex < 0) {
        divsErr.errorIndex = validDivs.divs.length;
      } else {
        divsErr.errorIndex = errorIndex;
      }
    }
    divsErr.message = advancedErrMsg(divsErr);
    return divsErr;
  }
  // validateDivs is called without parent div data
  // check parent/child relationships here
  for (let i = 0; i < divs.length; i++) {
    const div = divs[i];
    if (div.tmnt_id !== tmnt.id) {
      divsErr.errorTable = "divs";
      divsErr.errorCode = ErrorCode.MissingData;
      divsErr.errorIndex = i;
      divsErr.message =
        "divs has no parent tmnt at index " + divsErr.errorIndex;
      return divsErr;
    }
  }
  // if got here, then no errors in divs
  // replace divs with sanitized divs
  tmntFullData.divs = validDivs.divs;
  return divsErr;
};

/**
 * gets divEntries error
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {tmntFullDataErrType} - error information
 */
const getDivEntriesError = (
  tmntFullData: tmntFullType
): tmntFullDataErrType => {
  let divEntries = tmntFullData.divEntries;
  const divs = tmntFullData.divs;
  const players = tmntFullData.players;
  const squads = tmntFullData.squads;

  if (!divEntries || !Array.isArray(divEntries)) {
    return {
      errorTable: "divEntries",
      errorCode: ErrorCode.MissingData,
      errorIndex: 0,
      message: "no divEntries data",
    };
  }
  // must have parent if have child data
  if (
    !divs ||
    !Array.isArray(divs) ||
    (divs.length === 0 && divEntries.length > 0)
  ) {
    return {
      errorTable: "divEntries",
      errorCode: ErrorCode.MissingData,
      errorIndex: 0,
      message: "no divEntries parent data",
    };
  }

  // ok to have 0 divEntries
  let validDivEntries: validDivEntriesType = {
    divEntries: [],
    errorCode: ErrorCode.None,
  };
  const divEntriesErr: tmntFullDataErrType = {
    ...noError,
  };
  // ok to have 0 divEntries
  if (divEntries.length === 0) return divEntriesErr;
  // remove divEntries with null/blank fee
  divEntries = divEntries.filter(
    (divEntry) => divEntry.fee != null && divEntry.fee !== ""
  );
  // if no brktEntries left, then no error
  if (divEntries.length === 0) {
    tmntFullData.divEntries = [];
    return divEntriesErr;
  }

  validDivEntries = validateDivEntries(divEntries);
  if (
    validDivEntries.errorCode !== ErrorCode.None ||
    validDivEntries.divEntries.length !== divEntries.length
  ) {
    divEntriesErr.errorTable = "divEntries";
    divEntriesErr.errorCode = validDivEntries.errorCode;
    if (validDivEntries.divEntries.length === 0) {
      divEntriesErr.errorIndex = 0;
    } else {
      const errorIndex = divEntries.findIndex(
        (divEntry) => !isValidBtDbId(divEntry.id, "den")
      );
      if (errorIndex < 0) {
        divEntriesErr.errorIndex = validDivEntries.divEntries.length;
      } else {
        divEntriesErr.errorIndex = errorIndex;
      }
    }
    divEntriesErr.message = advancedErrMsg(divEntriesErr);
    return divEntriesErr;
  }
  // validateDivEntries is called without parent div data
  // check parent/child relationships here
  for (let i = 0; i < divEntries.length; i++) {
    const divEntry = divEntries[i];
    const squad = squads.find((s) => s.id === divEntry.squad_id);
    if (!squad) {
      divEntriesErr.errorTable = "divEntries";
      divEntriesErr.errorCode = ErrorCode.MissingData;
      divEntriesErr.errorIndex = i;
      divEntriesErr.message =
        "divEntries has no parent squad at index " + divEntriesErr.errorIndex;
      return divEntriesErr;
    }
    const div = divs.find((d) => d.id === divEntry.div_id);
    if (!div) {
      divEntriesErr.errorTable = "divEntries";
      divEntriesErr.errorCode = ErrorCode.MissingData;
      divEntriesErr.errorIndex = i;
      divEntriesErr.message =
        "divEntries has no parent div at index " + divEntriesErr.errorIndex;
      return divEntriesErr;
    }
    const player = players.find((p) => p.id === divEntry.player_id);
    if (!player) {
      divEntriesErr.errorTable = "divEntries";
      divEntriesErr.errorCode = ErrorCode.MissingData;
      divEntriesErr.errorIndex = i;
      divEntriesErr.message =
        "divEntries has no parent player at index " + divEntriesErr.errorIndex;
      return divEntriesErr;
    }
  }
  // if got here, then no errors in divEntries
  // replace divEntries with sanitized divEntries
  tmntFullData.divEntries = validDivEntries.divEntries;
  return divEntriesErr;
};

/**
 * gets elims error
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {tmntFullDataErrType} - error information
 */
const getElimsError = (tmntFullData: tmntFullType): tmntFullDataErrType => {
  const elims: elimType[] = tmntFullData.elims;
  const divs: divType[] = tmntFullData.divs;
  const squads: squadType[] = tmntFullData.squads;
  if (!elims || !Array.isArray(elims)) {
    return {
      errorCode: ErrorCode.MissingData,
      errorTable: "elims",
      errorIndex: 0,
      message: "no elims data",
    };
  }
  // must have parents if have child data
  if (
    !divs ||
    !Array.isArray(divs) ||
    !squads ||
    !Array.isArray(squads) ||
    ((divs.length === 0 || squads.length === 0) && elims.length > 0)
  ) {
    return {
      errorTable: "elims",
      errorCode: ErrorCode.MissingData,
      errorIndex: 0,
      message: "no elims parent data",
    };
  }

  // ok to have 0 elims
  let validElims: validElimsType = { elims: [], errorCode: ErrorCode.None };
  const elimsErr: tmntFullDataErrType = {
    ...noError,
  };
  // ok to have 0 elims
  if (elims.length === 0) return elimsErr;

  validElims = validateElims(elims);
  if (
    validElims.errorCode !== ErrorCode.None ||
    validElims.elims.length !== elims.length
  ) {
    elimsErr.errorTable = "elims";
    elimsErr.errorCode = validElims.errorCode;
    if (validElims.elims.length === 0) {
      elimsErr.errorIndex = 0;
    } else {
      const errorIndex = elims.findIndex(
        (elim) => !isValidBtDbId(elim.id, "elm")
      );
      if (errorIndex < 0) {
        elimsErr.errorIndex = validElims.elims.length;
      } else {
        elimsErr.errorIndex = errorIndex;
      }
    }
    elimsErr.message = advancedErrMsg(elimsErr);
    return elimsErr;
  }
  // validateElims is called without parent div or squad data
  // check parent/child relationships here
  for (let i = 0; i < elims.length; i++) {
    const elim = elims[i];
    const div = divs.find((d) => d.id === elim.div_id);
    if (!div) {
      elimsErr.errorTable = "elims";
      elimsErr.errorCode = ErrorCode.MissingData;
      elimsErr.errorIndex = i;
      elimsErr.message =
        "elims has no parent div at index " + elimsErr.errorIndex;
      return elimsErr;
    }
    const squad = squads.find((s) => s.id === elim.squad_id);
    if (!squad) {
      elimsErr.errorTable = "elims";
      elimsErr.errorCode = ErrorCode.MissingData;
      elimsErr.errorIndex = i;
      elimsErr.message =
        "elims has no parent squad at index " + elimsErr.errorIndex;
      return elimsErr;
    }
  }
  // if got here, then no errors in elims
  // replace elims with sanitized elims
  tmntFullData.elims = validElims.elims;
  return elimsErr;
};

/**
 * gets elimEntries error
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {tmntFullDataErrType} - error information
 */
const getElimEntriesError = (
  tmntFullData: tmntFullType
): tmntFullDataErrType => {
  let elimEntries: elimEntryType[] = tmntFullData.elimEntries;
  const elims: elimType[] = tmntFullData.elims;
  const players: playerType[] = tmntFullData.players;

  if (!elimEntries || !Array.isArray(elimEntries)) {
    return {
      errorTable: "elimEntries",
      errorCode: ErrorCode.MissingData,
      errorIndex: 0,
      message: "no elimEntries data",
    };
  }
  // must have parent if have child data
  if (
    !elims ||
    !Array.isArray(elims) ||
    (elims.length === 0 && elimEntries.length > 0)
  ) {
    return {
      errorTable: "elimEntries",
      errorCode: ErrorCode.MissingData,
      errorIndex: 0,
      message: "no elimEntries parent data",
    };
  }
  // ok to have 0 elimEntries
  let validElimEntries: validElimEntriesType = {
    elimEntries: [],
    errorCode: ErrorCode.None,
  };
  const elimEntriesErr: tmntFullDataErrType = {
    ...noError,
  };
  // ok to have 0 elimEntries
  if (elimEntries.length === 0) return elimEntriesErr;
  // remove any elimEntries with null or blanmk fee
  elimEntries = elimEntries.filter(
    (elimEntry) => elimEntry.fee != null && elimEntry.fee !== ""
  );
  // if no elimEntries left, then no error
  if (elimEntries.length === 0) {
    tmntFullData.elimEntries = [];
    return elimEntriesErr;
  }

  validElimEntries = validateElimEntries(elimEntries);
  if (
    validElimEntries.errorCode !== ErrorCode.None ||
    validElimEntries.elimEntries.length !== elimEntries.length
  ) {
    elimEntriesErr.errorTable = "elimEntries";
    elimEntriesErr.errorCode = validElimEntries.errorCode;
    if (validElimEntries.elimEntries.length === 0) {
      elimEntriesErr.errorIndex = 0;
    } else {
      const errorIndex = elimEntries.findIndex(
        (elimEntry) => !isValidBtDbId(elimEntry.id, "een")
      );
      if (errorIndex < 0) {
        elimEntriesErr.errorIndex = validElimEntries.elimEntries.length;
      } else {
        elimEntriesErr.errorIndex = errorIndex;
      }
    }
    elimEntriesErr.message = advancedErrMsg(elimEntriesErr);
    return elimEntriesErr;
  }
  // validateElimEntries is called without parent elim data
  // check parent/child relationships here
  for (let i = 0; i < elimEntries.length; i++) {
    const elimEntry = elimEntries[i];
    const elim = elims.find((e) => e.id === elimEntry.elim_id);
    if (!elim) {
      elimEntriesErr.errorTable = "elimEntries";
      elimEntriesErr.errorCode = ErrorCode.MissingData;
      elimEntriesErr.errorIndex = i;
      elimEntriesErr.message =
        "elimEntries has no parent elim at index " + elimEntriesErr.errorIndex;
      return elimEntriesErr;
    }
    const player = players.find((p) => p.id === elimEntry.player_id);
    if (!player) {
      elimEntriesErr.errorTable = "elimEntries";
      elimEntriesErr.errorCode = ErrorCode.MissingData;
      elimEntriesErr.errorIndex = i;
      elimEntriesErr.message =
        "elimEntries has no parent player at index " +
        elimEntriesErr.errorIndex;
      return elimEntriesErr;
    }
    if (elimEntry.fee !== elim.fee) {
      elimEntriesErr.errorTable = "elimEntries";
      elimEntriesErr.errorCode = ErrorCode.InvalidData;
      elimEntriesErr.errorIndex = i;
      elimEntriesErr.message =
        "elimEntries has invalid data at index " + elimEntriesErr.errorIndex;
      return elimEntriesErr;
    }
  }
  // if got here, then no errors in elimEntries
  // replace elimEntries with sanitized elimEntries
  tmntFullData.elimEntries = validElimEntries.elimEntries;
  return elimEntriesErr;
};

/**
 * gets events error
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {tmntFullDataErrType} - error information
 */
const getEventsError = (tmntFullData: tmntFullType): tmntFullDataErrType => {
  const events = tmntFullData.events;
  const tmnt = tmntFullData.tmnt;
  if (!events || !Array.isArray(events) || events.length === 0) {
    return {
      errorCode: ErrorCode.MissingData,
      errorTable: "events",
      errorIndex: 0,
      message: "no events data",
    };
  }
  let validEvents: validEventsType = { events: [], errorCode: ErrorCode.None };
  const eventsErr: tmntFullDataErrType = {
    ...noError,
  };
  validEvents = validateEvents(events);
  if (
    validEvents.errorCode !== ErrorCode.None ||
    validEvents.events.length !== events.length
  ) {
    eventsErr.errorTable = "events";
    eventsErr.errorCode = validEvents.errorCode;
    if (validEvents.events.length === 0) {
      eventsErr.errorIndex = 0;
    } else {
      const errorIndex = events.findIndex(
        (event) => !isValidBtDbId(event.id, "evt")
      );
      if (errorIndex < 0) {
        eventsErr.errorIndex = validEvents.events.length;
      } else {
        eventsErr.errorIndex = errorIndex;
      }
    }
    eventsErr.message = advancedErrMsg(eventsErr);
    return eventsErr;
  }
  // validateEvents is called without parent tmnt data
  // check parent/child relationships here
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    if (event.tmnt_id !== tmnt.id) {
      eventsErr.errorTable = "events";
      eventsErr.errorCode = ErrorCode.MissingData;
      eventsErr.errorIndex = i;
      eventsErr.message =
        "events has no parent tmnt at index " + eventsErr.errorIndex;
      return eventsErr;
    }
  }
  // if got here, then no errors in events
  // replace events with sanitized events
  tmntFullData.events = validEvents.events;
  return eventsErr;
};

/**
 * gets lanes error
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {tmntFullDataErrType} - error information
 */
const getLanesError = (tmntFullData: tmntFullType): tmntFullDataErrType => {
  let lanes: laneType[] = tmntFullData.lanes;
  const squads: squadType[] = tmntFullData.squads;
  if (!lanes || !Array.isArray(lanes) || lanes.length === 0) {
    return {
      errorTable: "lanes",
      errorCode: ErrorCode.MissingData,
      errorIndex: 0,
      message: "no lanes data",
    };
  }
  // must have parent if have child data
  if (
    !squads ||
    !Array.isArray(squads) ||
    (squads.length === 0 && lanes.length > 0)
  ) {
    return {
      errorTable: "lanes",
      errorCode: ErrorCode.MissingData,
      errorIndex: 0,
      message: "no lanes parent data",
    };
  }

  let validLanes: validLanesType = { lanes: [], errorCode: ErrorCode.None };
  const lanesErr: tmntFullDataErrType = {
    ...noError,
  };
  validLanes = validateLanes(lanes);
  if (
    validLanes.errorCode !== ErrorCode.None ||
    validLanes.lanes.length !== lanes.length
  ) {
    lanesErr.errorTable = "lanes";
    lanesErr.errorCode = validLanes.errorCode;
    if (validLanes.lanes.length === 0) {
      lanesErr.errorIndex = 0;
    } else {
      const errorIndex = lanes.findIndex(
        (lane) => !isValidBtDbId(lane.id, "lan")
      );
      if (errorIndex < 0) {
        lanesErr.errorIndex = validLanes.lanes.length;
      } else {
        lanesErr.errorIndex = errorIndex;
      }
    }
    lanesErr.message = advancedErrMsg(lanesErr);
    return lanesErr;
  }
  // validateLanes is called without parent squad data
  // check parent/child relationships here
  for (let i = 0; i < lanes.length; i++) {
    const lane = lanes[i];
    const squad = squads.find((s) => s.id === lane.squad_id);
    if (!squad) {
      lanesErr.errorTable = "lanes";
      lanesErr.errorCode = ErrorCode.MissingData;
      lanesErr.errorIndex = i;
      lanesErr.message =
        "lanes has no parent squad at index " + lanesErr.errorIndex;
      return lanesErr;
    }
  }
  // if got here, then no errors in lanes
  // replace lanes with sanitized lanes
  tmntFullData.lanes = validLanes.lanes;
  return lanesErr;
};

/**
 * gets oneBrkts error
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {tmntFullDataErrType} - error information
 */
const getOneBrktsError = (tmntFullData: tmntFullType): tmntFullDataErrType => {
  let oneBrkts: oneBrktType[] = tmntFullData.oneBrkts;
  const brkts: brktType[] = tmntFullData.brkts;

  if (!oneBrkts || !Array.isArray(oneBrkts)) {
    return {
      errorTable: "oneBrkts",
      errorCode: ErrorCode.MissingData,
      errorIndex: 0,
      message: "no oneBrkts data",
    };
  }
  // must have parent if have child data
  if (
    !brkts ||
    !Array.isArray(brkts) ||
    (brkts.length === 0 && oneBrkts.length > 0)
  ) {
    return {
      errorTable: "oneBrkts",
      errorCode: ErrorCode.MissingData,
      errorIndex: 0,
      message: "no oneBrkts parent data",
    };
  }

  // ok to have 0 oneBrkts
  let validOneBrkts: validOneBrktsType = {
    oneBrkts: [],
    errorCode: ErrorCode.None,
  };
  const oneBrktsErr: tmntFullDataErrType = {
    ...noError,
  };
  // ok to have 0 oneBrkts
  if (oneBrkts.length === 0) return oneBrktsErr;

  validOneBrkts = validateOneBrkts(oneBrkts);
  if (
    validOneBrkts.errorCode !== ErrorCode.None ||
    validOneBrkts.oneBrkts.length !== oneBrkts.length
  ) {
    oneBrktsErr.errorTable = "oneBrkts";
    oneBrktsErr.errorCode = validOneBrkts.errorCode;
    if (validOneBrkts.oneBrkts.length === 0) {
      oneBrktsErr.errorIndex = 0;
    } else {
      const errorIndex = oneBrkts.findIndex(
        (oneBrkt) => !isValidBtDbId(oneBrkt.id, "obk")
      );
      if (errorIndex < 0) {
        oneBrktsErr.errorIndex = validOneBrkts.oneBrkts.length;
      } else {
        oneBrktsErr.errorIndex = errorIndex;
      }
    }
    oneBrktsErr.message = advancedErrMsg(oneBrktsErr);
    return oneBrktsErr;
  }
  // validatePotEntries is called without parent brkt data
  // check parent/child relationships here
  for (let i = 0; i < oneBrkts.length; i++) {
    const oneBrkt = oneBrkts[i];
    const brkt = brkts.find((b) => b.id === oneBrkt.brkt_id);
    if (!brkt) {
      oneBrktsErr.errorTable = "oneBrkts";
      oneBrktsErr.errorCode = ErrorCode.MissingData;
      oneBrktsErr.errorIndex = i;
      oneBrktsErr.message =
        "oneBrkts has no parent brkt at index " + oneBrktsErr.errorIndex;
      return oneBrktsErr;
    }
  }
  // if got here, then no errors in oneBrkts
  // replace oneBrkts with sanitized oneBrkts
  tmntFullData.oneBrkts = validOneBrkts.oneBrkts;
  return oneBrktsErr;
};

/**
 * gets players error
 *
 * @param {tmntFullDataErrType} tmntFullData -
 * @returns {tmntFullDataErrType} - error information
 */
const getPlayersError = (tmntFullData: tmntFullType): tmntFullDataErrType => {
  const players: playerType[] = tmntFullData.players;
  const squads: squadType[] = tmntFullData.squads;

  if (!players || !Array.isArray(players)) {
    return {
      errorTable: "players",
      errorCode: ErrorCode.MissingData,
      errorIndex: 0,
      message: "no players data",
    };
  }
  // must have parent if have child data
  if (
    !squads ||
    !Array.isArray(squads) ||
    (squads.length === 0 && players.length > 0)
  ) {
    return {
      errorTable: "players",
      errorCode: ErrorCode.MissingData,
      errorIndex: 0,
      message: "no players parent data",
    };
  }

  // ok to have 0 players
  let validPlayers: validPlayersType = {
    players: [],
    errorCode: ErrorCode.None,
  };
  const playersErr: tmntFullDataErrType = {
    ...noError,
  };
  // ok to have 0 players
  if (players.length === 0) return playersErr;

  validPlayers = validatePlayers(players);
  if (
    validPlayers.errorCode !== ErrorCode.None ||
    validPlayers.players.length !== players.length
  ) {
    playersErr.errorTable = "players";
    playersErr.errorCode = validPlayers.errorCode;
    if (validPlayers.players.length === 0) {
      playersErr.errorIndex = 0;
    } else {
      const errorIndex = players.findIndex(
        (player) => !isValidBtDbId(player.id, "ply")
      );
      if (errorIndex < 0) {
        playersErr.errorIndex = validPlayers.players.length;
      } else {
        playersErr.errorIndex = errorIndex;
      }
    }
    playersErr.message = advancedErrMsg(playersErr);
    return playersErr;
  }
  // validatePlayers is called without parent squad data
  // check parent/child relationships here
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const squad = squads.find((s) => s.id === player.squad_id);
    if (!squad) {
      playersErr.errorTable = "players";
      playersErr.errorCode = ErrorCode.MissingData;
      playersErr.errorIndex = i;
      playersErr.message =
        "players has no parent squad at index " + playersErr.errorIndex;
      return playersErr;
    }
  }
  // if got here, then no errors in players
  // replace players with sanitized players
  tmntFullData.players = validPlayers.players;
  return playersErr;
};

/**
 * gets pots error
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {tmntFullDataErrType} - error information
 */
const getPotsError = (tmntFullData: tmntFullType): tmntFullDataErrType => {
  const pots: potType[] = tmntFullData.pots;
  const divs: divType[] = tmntFullData.divs;
  const squads: squadType[] = tmntFullData.squads;
  if (!pots || !Array.isArray(pots)) {
    return {
      errorCode: ErrorCode.MissingData,
      errorTable: "pots",
      errorIndex: 0,
      message: "no pots data",
    };
  }
  // must have parents if have child data
  if (
    !divs ||
    !Array.isArray(divs) ||
    !squads ||
    !Array.isArray(squads) ||
    ((divs.length === 0 || squads.length === 0) && pots.length > 0)
  ) {
    return {
      errorTable: "pots",
      errorCode: ErrorCode.MissingData,
      errorIndex: 0,
      message: "no pots parent data",
    };
  }

  // ok to have 0 pots
  let validPots: validPotsType = { pots: [], errorCode: ErrorCode.None };
  const potsErr: tmntFullDataErrType = {
    ...noError,
  };
  // ok to have 0 pots
  if (pots.length === 0) return potsErr;

  validPots = validatePots(pots);
  if (
    validPots.errorCode !== ErrorCode.None ||
    validPots.pots.length !== pots.length
  ) {
    potsErr.errorTable = "pots";
    potsErr.errorCode = validPots.errorCode;
    if (validPots.pots.length === 0) {
      potsErr.errorIndex = 0;
    } else {
      const errorIndex = pots.findIndex((pot) => !isValidBtDbId(pot.id, "pot"));
      if (errorIndex < 0) {
        potsErr.errorIndex = validPots.pots.length;
      } else {
        potsErr.errorIndex = errorIndex;
      }
    }
    potsErr.message = advancedErrMsg(potsErr);
    return potsErr;
  }
  // validatePots is called without parent div or squad data
  // check parent/child relationships here
  for (let i = 0; i < pots.length; i++) {
    const pot = pots[i];
    const div = divs.find((d) => d.id === pot.div_id);
    if (!div) {
      potsErr.errorTable = "pots";
      potsErr.errorCode = ErrorCode.MissingData;
      potsErr.errorIndex = i;
      potsErr.message = "pots has no parent div at index " + potsErr.errorIndex;
      return potsErr;
    }
    const squad = squads.find((s) => s.id === pot.squad_id);
    if (!squad) {
      potsErr.errorTable = "pots";
      potsErr.errorCode = ErrorCode.MissingData;
      potsErr.errorIndex = i;
      potsErr.message =
        "pots has no parent squad at index " + potsErr.errorIndex;
      return potsErr;
    }
  }
  // if got here, then no errors in pots
  // replace pots with sanitized pots
  tmntFullData.pots = validPots.pots;
  return potsErr;
};

/**
 * gets potEntries error
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {tmntFullDataErrType} - error information
 */
const getPotEntriesError = (
  tmntFullData: tmntFullType
): tmntFullDataErrType => {
  let potEntries: potEntryType[] = tmntFullData.potEntries;
  const pots: potType[] = tmntFullData.pots;
  const players: playerType[] = tmntFullData.players;

  if (!potEntries || !Array.isArray(potEntries)) {
    return {
      errorTable: "potEntries",
      errorCode: ErrorCode.MissingData,
      errorIndex: 0,
      message: "no potEntries data",
    };
  }
  // must have parent if have child data
  if (
    !pots ||
    !Array.isArray(pots) ||
    (pots.length === 0 && potEntries.length > 0)
  ) {
    return {
      errorTable: "potEntries",
      errorCode: ErrorCode.MissingData,
      errorIndex: 0,
      message: "no potEntries parent data",
    };
  }

  // ok to have 0 potEntries
  let validPotEntries: validPotEntriesType = {
    potEntries: [],
    errorCode: ErrorCode.None,
  };
  const potEntriesErr: tmntFullDataErrType = {
    ...noError,
  };
  // ok to have 0 potEntries
  if (potEntries.length === 0) return potEntriesErr;
  // remove any potEntries with no/blank fee
  potEntries = potEntries.filter((potEntry) => potEntry.fee != null && potEntry.fee !== '');
  if (potEntries.length === 0) { 
    tmntFullData.potEntries = [];
    return potEntriesErr
  };

  validPotEntries = validatePotEntries(potEntries);
  if (
    validPotEntries.errorCode !== ErrorCode.None ||
    validPotEntries.potEntries.length !== potEntries.length
  ) {
    potEntriesErr.errorTable = "potEntries";
    potEntriesErr.errorCode = validPotEntries.errorCode;
    if (validPotEntries.potEntries.length === 0) {
      potEntriesErr.errorIndex = 0;
    } else {
      const errorIndex = potEntries.findIndex(
        (potEntry) => !isValidBtDbId(potEntry.id, "pen")
      );
      if (errorIndex < 0) {
        potEntriesErr.errorIndex = validPotEntries.potEntries.length;
      } else {
        potEntriesErr.errorIndex = errorIndex;
      }
    }
    potEntriesErr.message = advancedErrMsg(potEntriesErr);
    return potEntriesErr;
  }
  // validatePotEntries is called without parent pot data
  // check parent/child relationships here
  for (let i = 0; i < potEntries.length; i++) {
    const potEntry = potEntries[i];
    const pot = pots.find((p) => p.id === potEntry.pot_id);
    if (!pot) {
      potEntriesErr.errorTable = "potEntries";
      potEntriesErr.errorCode = ErrorCode.MissingData;
      potEntriesErr.errorIndex = i;
      potEntriesErr.message =
        "potEntries has no parent pot at index " + potEntriesErr.errorIndex;
      return potEntriesErr;
    }
    const player = players.find((p) => p.id === potEntry.player_id);
    if (!player) {
      potEntriesErr.errorTable = "potEntries";
      potEntriesErr.errorCode = ErrorCode.MissingData;
      potEntriesErr.errorIndex = i;
      potEntriesErr.message =
        "potEntries has no parent player at index " + potEntriesErr.errorIndex;
      return potEntriesErr;
    }
    if (potEntry.fee !== pot.fee) {
      potEntriesErr.errorTable = "potEntries";
      potEntriesErr.errorCode = ErrorCode.InvalidData;
      potEntriesErr.errorIndex = i;
      potEntriesErr.message =
        "potEntries has invalid data at index " + potEntriesErr.errorIndex;
      return potEntriesErr;
    }
  }
  // if got here, then no errors in potEntries
  // replace potEntries with sanitized potEntries
  tmntFullData.potEntries = validPotEntries.potEntries;
  return potEntriesErr;
};

/**
 * gets squads error
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {tmntFullDataErrType} - error information
 */
const getSquadsError = (tmntFullData: tmntFullType): tmntFullDataErrType => {
  const squads: squadType[] = tmntFullData.squads;
  const events: eventType[] = tmntFullData.events;
  if (!squads || !Array.isArray(squads) || squads.length === 0) {
    return {
      errorCode: ErrorCode.MissingData,
      errorTable: "squads",
      errorIndex: 0,
      message: "no squads data",
    };
  }

  let validSquads: validSquadsType = { squads: [], errorCode: ErrorCode.None };
  const squadsErr: tmntFullDataErrType = {
    ...noError,
  };
  validSquads = validateSquads(squads);
  if (
    validSquads.errorCode !== ErrorCode.None ||
    validSquads.squads.length !== squads.length
  ) {
    squadsErr.errorTable = "squads";
    squadsErr.errorCode = validSquads.errorCode;
    if (validSquads.squads.length === 0) {
      squadsErr.errorIndex = 0;
    } else {
      const errorIndex = squads.findIndex(
        (squad) => !isValidBtDbId(squad.id, "sqd")
      );
      if (errorIndex < 0) {
        squadsErr.errorIndex = validSquads.squads.length;
      } else {
        squadsErr.errorIndex = errorIndex;
      }
    }
    squadsErr.message = advancedErrMsg(squadsErr);
    return squadsErr;
  }
  // validateSquads is called without parent event data
  // check parent/child relationships here
  for (let i = 0; i < squads.length; i++) {
    const squad = squads[i];
    const event = events.find((e) => e.id === squad.event_id);
    if (!event) {
      squadsErr.errorTable = "squads";
      squadsErr.errorCode = ErrorCode.MissingData;
      squadsErr.errorIndex = i;
      squadsErr.message =
        "squads has no parent event at index " + squadsErr.errorIndex;
      return squadsErr;
    }
  }
  // if got here, then no errors in squads
  // replace squads with sanitized squads
  tmntFullData.squads = validSquads.squads;
  return squadsErr;
};

/**
 * validates full tmnt
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {tmntFullDataErrType} - error information
 */
export const validateFullTmnt = (
  tmntFullData: tmntFullType
): tmntFullDataErrType => {
  let fullTmntErr: tmntFullDataErrType = {
    errorCode: ErrorCode.None,
    errorTable: "",
    errorIndex: 0,
    message: "",
  };
  if (tmntFullData == null || typeof tmntFullData !== "object") {
    fullTmntErr.errorCode = ErrorCode.MissingData;
    fullTmntErr.errorTable = "tmntFullData";
    fullTmntErr.message = basicErrMsg(
      fullTmntErr.errorCode,
      fullTmntErr.errorTable
    );
    return fullTmntErr;
  }

  // validate tmnt
  fullTmntErr.errorCode = validateTmnt(tmntFullData.tmnt);
  if (fullTmntErr.errorCode !== ErrorCode.None) {
    fullTmntErr.errorTable = "tmnt";
    fullTmntErr.message = basicErrMsg(
      fullTmntErr.errorCode,
      fullTmntErr.errorTable
    );
    return fullTmntErr;
  }

  // validate events
  fullTmntErr = getEventsError(tmntFullData);
  if (fullTmntErr.errorCode !== ErrorCode.None) return fullTmntErr;

  // validate divs
  fullTmntErr = getDivsError(tmntFullData);
  if (fullTmntErr.errorCode !== ErrorCode.None) return fullTmntErr;

  // validate squads
  fullTmntErr = getSquadsError(tmntFullData);
  if (fullTmntErr.errorCode !== ErrorCode.None) return fullTmntErr;

  // validate lanes
  fullTmntErr = getLanesError(tmntFullData);
  if (fullTmntErr.errorCode !== ErrorCode.None) return fullTmntErr;

  // validate divEntries
  fullTmntErr = getDivEntriesError(tmntFullData);
  if (fullTmntErr.errorCode !== ErrorCode.None) return fullTmntErr;

  // validate brkts
  fullTmntErr = getBrktsError(tmntFullData);
  if (fullTmntErr.errorCode !== ErrorCode.None) return fullTmntErr;

  // validate brktEntries (includes brktRefunds)
  fullTmntErr = getBrktEntriesError(tmntFullData);
  if (fullTmntErr.errorCode !== ErrorCode.None) return fullTmntErr;

  // validate oneBrkts
  fullTmntErr = getOneBrktsError(tmntFullData);
  if (fullTmntErr.errorCode !== ErrorCode.None) return fullTmntErr;

  // validate brktSeeds
  fullTmntErr = getBrktSeedsError(tmntFullData);
  if (fullTmntErr.errorCode !== ErrorCode.None) return fullTmntErr;

  // validate elims
  fullTmntErr = getElimsError(tmntFullData);
  if (fullTmntErr.errorCode !== ErrorCode.None) return fullTmntErr;

  // validate elimEntries
  fullTmntErr = getElimEntriesError(tmntFullData);
  if (fullTmntErr.errorCode !== ErrorCode.None) return fullTmntErr;

  // validate pots
  fullTmntErr = getPotsError(tmntFullData);
  if (fullTmntErr.errorCode !== ErrorCode.None) return fullTmntErr;

  // validate potEntries
  fullTmntErr = getPotEntriesError(tmntFullData);
  if (fullTmntErr.errorCode !== ErrorCode.None) return fullTmntErr;

  // validate players
  fullTmntErr = getPlayersError(tmntFullData);
  if (fullTmntErr.errorCode !== ErrorCode.None) return fullTmntErr;

  return fullTmntErr;
};

/**
 * validates full tmnt entries
 *
 * NOTE: does not validate tmnt, events, divs, squads, lanes,
 * pots, brkts or divs
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {tmntFullDataErrType} - error information
 */
export const validateFullTmntEntries = (
  tmntFullData: tmntFullType
): tmntFullDataErrType => {
  let fullTmntEntriesErr: tmntFullDataErrType = {
    errorCode: ErrorCode.None,
    errorTable: "",
    errorIndex: 0,
    message: "",
  };

  if (tmntFullData == null || typeof tmntFullData !== "object") {
    fullTmntEntriesErr.errorCode = ErrorCode.MissingData;
    fullTmntEntriesErr.errorTable = "tmntFullData";
    fullTmntEntriesErr.message = basicErrMsg(
      fullTmntEntriesErr.errorCode,
      fullTmntEntriesErr.errorTable
    );
    return fullTmntEntriesErr;
  }

  // validate divEntries
  fullTmntEntriesErr = getDivEntriesError(tmntFullData);
  if (fullTmntEntriesErr.errorCode !== ErrorCode.None)
    return fullTmntEntriesErr;

  // validate brktEntries (includes brktRefunds)
  fullTmntEntriesErr = getBrktEntriesError(tmntFullData);
  if (fullTmntEntriesErr.errorCode !== ErrorCode.None)
    return fullTmntEntriesErr;

  // validate oneBrkts
  fullTmntEntriesErr = getOneBrktsError(tmntFullData);
  if (fullTmntEntriesErr.errorCode !== ErrorCode.None)
    return fullTmntEntriesErr;

  // validate brktSeeds
  fullTmntEntriesErr = getBrktSeedsError(tmntFullData);
  if (fullTmntEntriesErr.errorCode !== ErrorCode.None)
    return fullTmntEntriesErr;

  // validate elimEntries
  fullTmntEntriesErr = getElimEntriesError(tmntFullData);
  if (fullTmntEntriesErr.errorCode !== ErrorCode.None)
    return fullTmntEntriesErr;

  // validate potEntries
  fullTmntEntriesErr = getPotEntriesError(tmntFullData);
  if (fullTmntEntriesErr.errorCode !== ErrorCode.None)
    return fullTmntEntriesErr;

  // validate players
  fullTmntEntriesErr = getPlayersError(tmntFullData);
  if (fullTmntEntriesErr.errorCode !== ErrorCode.None)
    return fullTmntEntriesErr;

  return fullTmntEntriesErr;
};

export const exportedForTesting = {
  basicErrMsg,
  advancedErrMsg,
  getBrktEntriesError,
  getBrktSeedsError,
  getBrktsError,
  getDivsError,
  getDivEntriesError,
  getEventsError,
  getElimEntriesError,
  getElimsError,
  getLanesError,
  getOneBrktsError,
  getPlayersError,
  getPotsError,
  getPotEntriesError,
  getSquadsError,
};
