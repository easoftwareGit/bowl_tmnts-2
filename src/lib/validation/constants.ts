export const maxFirstNameLength = 15;
export const maxLastNameLength = 20;
export const maxEmailLength = 254;
export const maxPhoneLength = 20;
export const maxPasswordLength = 20;

export const maxBowlNameLemgth = 30;
export const maxCityLength = 25;
export const maxStateLength = 10;
export const maxUrlLength = 2048; 

export const maxToHashLength = 72;
export const bcryptLength = 60; // https://www.npmjs.com/package/bcrypt

export const maxTmntNameLength = 30;
export const maxEventLength = 20;
export const maxReasonLength = 100;

export const minTeamSize = 1;
export const maxTeamSize = 5;
export const minGames = 1;
export const maxGames = 99;
export const minStartLane = 1;
export const maxStartLane = 199;
export const minLaneCount = 2;
export const maxLaneCount = 200;
export const maxBrackets = 999;
export const maxEvents = 10;
export const minHdcpPer = 0;
export const maxHdcpPer = 1.25;
export const minHdcpFrom = 0;
export const maxHdcpFrom = 300;
export const zeroAmount = 0;
export const minFee = 1;
export const maxScore = 300;
export const maxMoney = 999999;
export const maxAverage = maxScore;
export const minElimEntryFee = 0.01;
export const minBrktEntryFee = 0.01;

export const minSortOrder = 1;
export const maxSortOrder = 1000000;

export const minYear = 1900;
export const maxYear = 2200;
export const minDate = new Date(Date.UTC(minYear, 0, 1, 0, 0, 0, 0));
export const maxDate = new Date(Date.UTC(maxYear, 11, 31, 23, 59, 59, 999));

export const minLane = 1;

// 8.64.15 is max date per
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date
export const minTimeStamp = -8.64e15;
export const maxTimeStamp = 8.64e15;

export const idTypeLength = 3; // length of id type, e.g. usr, bwl, div, pot, elm, brk
export const idTypeSeparator = "_"; // separator between id type and id
export const idTypeSeparatorLength = 1; // length of id type separator, e.g
export const uuidLength = 32; // length of a uuid without hyphens, e.g. 123e4567e89b12d3a456426655440000
export const baseIdLength = idTypeLength + idTypeSeparatorLength + uuidLength; // length of a base id, e.g. usr_123e4567e89b12d3a456426655440000
