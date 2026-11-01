import { startOfDayFromString } from "@/lib/dateTools";
import type {
  brktDataType,
  brktEntryDataType,
  brktEntryType,
  brktType,
  divDataType,
  divEntryDataType,
  divEntryType,
  divType,
  elimDataType,
  elimEntryDataType,
  elimEntryType,
  elimType,
  eventDataType,
  eventType,
  playerDataType,
  playerType,
  potDataType,
  potEntryDataType,
  potEntryType,
  potType,
  squadDataType,
  squadType,
  tmntDataType,
  tmntFullDataForPrismaType,
  tmntFullType,
  tmntMoneyDataType,
  tmntMoneyType,
  tmntType,
} from "@/lib/types/types";

/**
 * Result of a conversion: either the converted data, or an error message
 * saying what failed. Check `ok` before using `data`.
 */
export type ConvertResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const ok = <T>(data: T): ConvertResult<T> => ({ ok: true, data });

const fail = (error: string): ConvertResult<never> => ({ ok: false, error });

const isObject = (value: unknown): value is object =>
  value !== null && typeof value === "object";

/**
 * Returns " (id xxx)" for an item with a string id, or "" otherwise.
 * Used to make error messages easier to trace back to a row.
 */
const idLabel = (item: unknown): string => {
  if (isObject(item) && "id" in item && typeof item.id === "string") {
    return ` (id ${item.id})`;
  }
  return "";
};

/**
 * Converts every item in an array. All-or-nothing: stops at the first item
 * that fails and returns an error naming the collection, index and id,
 * e.g. "squads[2] (id sqd_123...): invalid squad_date_str".
 *
 * @param {string} label - collection name used in error messages
 * @param {T[]} items - items to convert
 * @param {(item: T) => ConvertResult<R>} convert - converter for one item
 * @returns {ConvertResult<R[]>} - all converted items, or the first error
 */
const convertAll = <T, R>(
  label: string,
  items: T[],
  convert: (item: T) => ConvertResult<R>,
): ConvertResult<R[]> => {
  if (!Array.isArray(items)) return fail(`${label}: not an array`);
  const converted: R[] = [];
  for (let i = 0; i < items.length; i++) {
    const result = convert(items[i]);
    if (!result.ok) {
      return fail(`${label}[${i}]${idLabel(items[i])}: ${result.error}`);
    }
    converted.push(result.data);
  }
  return ok(converted);
};

/**
 * Converts brktEntry to brktEntryDataType
 *
 * @param {brktEntryType} brktEntry - brktEntry to convert
 * @returns {ConvertResult<brktEntryDataType>} - converted brktEntry or error
 */
const brktEntryDataForPrisma = (
  brktEntry: brktEntryType,
): ConvertResult<brktEntryDataType> => {
  if (!isObject(brktEntry)) return fail("not an object");
  // new Date(null) is 1970-01-01, not an error, so reject null/undefined first
  if (brktEntry.time_stamp == null) return fail("missing time_stamp");
  const timeStamp = new Date(brktEntry.time_stamp);
  // new Date("garbage") does not throw; it returns an Invalid Date (NaN time)
  if (Number.isNaN(timeStamp.getTime())) return fail("invalid time_stamp");
  // DO NOT INCLUDE FEE
  return ok({
    id: brktEntry.id,
    brkt_id: brktEntry.brkt_id,
    player_id: brktEntry.player_id,
    num_brackets: brktEntry.num_brackets,
    num_refunds: brktEntry.num_refunds,
    time_stamp: timeStamp,
  });
};

/**
 * Converts brkt to brktDataType
 *
 * @param {brktType} brkt - brkt to convert
 * @returns {ConvertResult<brktDataType>} - converted brkt or error
 */
const brktDataForPrisma = (brkt: brktType): ConvertResult<brktDataType> => {
  if (!isObject(brkt)) return fail("not an object");
  // note: NO fsa in brktDataType
  return ok({
    id: brkt.id,
    div_id: brkt.div_id,
    squad_id: brkt.squad_id,
    fee: brkt.fee,
    start: brkt.start,
    games: brkt.games,
    players: brkt.players,
    first: brkt.first,
    second: brkt.second,
    admin: brkt.admin,
    sort_order: brkt.sort_order,
  });
};

/**
 * Converts div to divDataType
 *
 * @param {divType} div - div to convert
 * @returns {ConvertResult<divDataType>} - converted div or error
 */
const divDataForPrisma = (div: divType): ConvertResult<divDataType> => {
  if (!isObject(div)) return fail("not an object");
  return ok({
    id: div.id,
    tmnt_id: div.tmnt_id,
    div_name: div.div_name,
    hdcp_per: div.hdcp_per,
    hdcp_from: div.hdcp_from,
    int_hdcp: div.int_hdcp,
    hdcp_for: div.hdcp_for,
    sort_order: div.sort_order,
  });
};

/**
 * Converts divEntry to divEntryDataType
 *
 * @param {divEntryType} divEntry - divEntry to convert
 * @returns {ConvertResult<divEntryDataType>} - converted divEntry or error
 */
const divEntryDataForPrisma = (
  divEntry: divEntryType,
): ConvertResult<divEntryDataType> => {
  if (!isObject(divEntry)) return fail("not an object");
  return ok({
    id: divEntry.id,
    squad_id: divEntry.squad_id,
    div_id: divEntry.div_id,
    player_id: divEntry.player_id,
    fee: divEntry.fee,
  });
};

/**
 * Converts elim to elimDataType
 *
 * @param {elimType} elim - elim to convert
 * @returns {ConvertResult<elimDataType>} - converted elim or error
 */
const elimDataForPrisma = (elim: elimType): ConvertResult<elimDataType> => {
  if (!isObject(elim)) return fail("not an object");
  return ok({
    id: elim.id,
    div_id: elim.div_id,
    squad_id: elim.squad_id,
    start: elim.start,
    games: elim.games,
    fee: elim.fee,
    sort_order: elim.sort_order,
  });
};

/**
 * Converts elimEntry to elimEntryDataType
 *
 * @param {elimEntryType} elimEntry - elimEntry to convert
 * @returns {ConvertResult<elimEntryDataType>} - converted elimEntry or error
 */
const elimEntryDataForPrisma = (
  elimEntry: elimEntryType,
): ConvertResult<elimEntryDataType> => {
  if (!isObject(elimEntry)) return fail("not an object");
  return ok({
    id: elimEntry.id,
    elim_id: elimEntry.elim_id,
    player_id: elimEntry.player_id,
    fee: elimEntry.fee,
  });
};

/**
 * Converts event to eventDataType
 *
 * @param {eventType} event - event to convert
 * @returns {ConvertResult<eventDataType>} - converted event or error
 */
const eventDataForPrisma = (event: eventType): ConvertResult<eventDataType> => {
  if (!isObject(event)) return fail("not an object");
  return ok({
    id: event.id,
    tmnt_id: event.tmnt_id,
    event_name: event.event_name,
    team_size: event.team_size,
    games: event.games,
    entry_fee: event.entry_fee,
    lineage: event.lineage,
    prize_fund: event.prize_fund,
    other: event.other,
    expenses: event.expenses,
    added_money: event.added_money,
    sort_order: event.sort_order,
  });
};

/**
 * Converts player to playerDataType
 *
 * @param {playerType} player - player to convert
 * @returns {ConvertResult<playerDataType>} - converted player or error
 */
const playerDataForPrisma = (player: playerType): ConvertResult<playerDataType> => {
  if (!isObject(player)) return fail("not an object");
  return ok({
    id: player.id,
    squad_id: player.squad_id,
    first_name: player.first_name,
    last_name: player.last_name,
    average: player.average,
    lane: player.lane,
    position: player.position,
  });
};

/**
 * Converts pot to potDataType
 *
 * @param {potType} pot - pot to convert
 * @returns {ConvertResult<potDataType>} - converted pot or error
 */
const potDataForPrisma = (pot: potType): ConvertResult<potDataType> => {
  if (!isObject(pot)) return fail("not an object");
  return ok({
    id: pot.id,
    squad_id: pot.squad_id,
    div_id: pot.div_id,
    fee: pot.fee,
    pot_type: pot.pot_type,
    sort_order: pot.sort_order,
  });
};

/**
 * Converts potEntry to potEntryDataType
 *
 * @param {potEntryType} potEntry - potEntry to convert
 * @returns {ConvertResult<potEntryDataType>} - converted potEntry or error
 */
const potEntryDataForPrisma = (
  potEntry: potEntryType,
): ConvertResult<potEntryDataType> => {
  if (!isObject(potEntry)) return fail("not an object");
  return ok({
    id: potEntry.id,
    pot_id: potEntry.pot_id,
    player_id: potEntry.player_id,
    fee: potEntry.fee,
  });
};

/**
 * Converts a squad to squad data for prisma
 *
 * @param {squadType} squad - squad to convert
 * @returns {ConvertResult<squadDataType>} - converted squad or error
 */
const squadDataForPrisma = (squad: squadType): ConvertResult<squadDataType> => {
  if (!isObject(squad)) return fail("not an object");
  if (typeof squad.squad_date_str !== "string") {
    return fail("squad_date_str is not a string");
  }
  const squadDate = startOfDayFromString(squad.squad_date_str);
  if (!squadDate) return fail("invalid squad_date_str");
  return ok({
    id: squad.id,
    event_id: squad.event_id,
    squad_name: squad.squad_name,
    games: squad.games,
    lane_count: squad.lane_count,
    starting_lane: squad.starting_lane,
    squad_date: squadDate,
    squad_time: squad.squad_time,
    sort_order: squad.sort_order,
  });
};

/**
 * Converts tmntMoney to tmntMoneyDataType
 *
 * @param {tmntMoneyType} tmntMoney - tmntMoney to convert
 * @returns {ConvertResult<tmntMoneyDataType>} - converted tmntMoney or error
 */
const tmntMoneyDataForPrisma = (
  tmntMoney: tmntMoneyType,
): ConvertResult<tmntMoneyDataType> => {
  if (!isObject(tmntMoney)) return fail("not an object");
  return ok({
    id: tmntMoney.id,
    event_id: tmntMoney.event_id,
    squad_id: tmntMoney.squad_id,
    div_id: tmntMoney.div_id,
    descrip: tmntMoney.descrip,
    flow: tmntMoney.flow,
    amount: tmntMoney.amount || 0,
    pot_id: tmntMoney.pot_id,
    brkt_id: tmntMoney.brkt_id,
    elim_id: tmntMoney.elim_id,
    sort_order: tmntMoney.sort_order,
  });
};

/**
 * Converts tournament data for prisma, with an error message on failure
 *
 * @param {tmntType} tmnt - tournament data to convert
 * @returns {ConvertResult<tmntDataType>} - converted tmnt or error
 */
const tmntDataResult = (tmnt: tmntType): ConvertResult<tmntDataType> => {
  if (!isObject(tmnt)) return fail("not an object");
  if (typeof tmnt.start_date_str !== "string") {
    return fail("start_date_str is not a string");
  }
  if (typeof tmnt.end_date_str !== "string") {
    return fail("end_date_str is not a string");
  }
  const startDate = startOfDayFromString(tmnt.start_date_str);
  if (!startDate) return fail("invalid start_date_str");
  const endDate = startOfDayFromString(tmnt.end_date_str);
  if (!endDate) return fail("invalid end_date_str");
  return ok({
    id: tmnt.id,
    tmnt_name: tmnt.tmnt_name,
    start_date: startDate,
    end_date: endDate,
    user_id: tmnt.user_id,
    bowl_id: tmnt.bowl_id,
  });
};

/**
 * Converts tournament data for prisma
 *
 * Kept with its original return type so any other callers are unaffected.
 *
 * @param {tmntType} tmnt - tournament data to convert
 * @returns {tmntDataType | null} - tournament data for prisma, or null if tmnt
 *   is not an object or either date string is not a valid date
 */
export const tmntDataForPrisma = (tmnt: tmntType): tmntDataType | null => {
  const result = tmntDataResult(tmnt);
  return result.ok ? result.data : null;
};

/**
 * Converts full tournament data for prisma.
 *
 * All-or-nothing: if the tmnt, or any item in any converted collection, fails
 * to convert, returns { ok: false, error } naming the first failure, e.g.
 * "squads[2] (id sqd_123...): invalid squad_date_str". The caller never gets a
 * partial tournament.
 *
 * @param {tmntFullType} tmntFullData - full tmnt data to convert
 * @returns {ConvertResult<tmntFullDataForPrismaType>} - converted data or error
 */
export const tmntFullDataForPrisma = (
  tmntFullData: tmntFullType,
): ConvertResult<tmntFullDataForPrismaType> => {
  if (!isObject(tmntFullData)) return fail("tmnt full data: not an object");

  const tmnt = tmntDataResult(tmntFullData.tmnt);
  if (!tmnt.ok) return fail(`tmnt${idLabel(tmntFullData.tmnt)}: ${tmnt.error}`);

  const events = convertAll("events", tmntFullData.events, eventDataForPrisma);
  if (!events.ok) return events;
  const divs = convertAll("divs", tmntFullData.divs, divDataForPrisma);
  if (!divs.ok) return divs;
  const squads = convertAll("squads", tmntFullData.squads, squadDataForPrisma);
  if (!squads.ok) return squads;
  const pots = convertAll("pots", tmntFullData.pots, potDataForPrisma);
  if (!pots.ok) return pots;
  const brkts = convertAll("brkts", tmntFullData.brkts, brktDataForPrisma);
  if (!brkts.ok) return brkts;
  const elims = convertAll("elims", tmntFullData.elims, elimDataForPrisma);
  if (!elims.ok) return elims;
  const players = convertAll("players", tmntFullData.players, playerDataForPrisma);
  if (!players.ok) return players;
  const divEntries = convertAll("divEntries", tmntFullData.divEntries, divEntryDataForPrisma);
  if (!divEntries.ok) return divEntries;
  const potEntries = convertAll("potEntries", tmntFullData.potEntries, potEntryDataForPrisma);
  if (!potEntries.ok) return potEntries;
  const brktEntries = convertAll("brktEntries", tmntFullData.brktEntries, brktEntryDataForPrisma);
  if (!brktEntries.ok) return brktEntries;
  const elimEntries = convertAll("elimEntries", tmntFullData.elimEntries, elimEntryDataForPrisma);
  if (!elimEntries.ok) return elimEntries;
  const moneys = convertAll("moneys", tmntFullData.moneys, tmntMoneyDataForPrisma);
  if (!moneys.ok) return moneys;

  // stage, lanes, oneBrkts and brktSeeds do not need to be converted
  return ok({
    tmntData: tmnt.data,
    eventsData: events.data,
    divsData: divs.data,
    squadsData: squads.data,
    stageData: tmntFullData.stage,
    lanesData: tmntFullData.lanes,
    divEntriesData: divEntries.data,
    brktEntriesData: brktEntries.data,
    brktSeedsData: tmntFullData.brktSeeds,
    brktsData: brkts.data,
    oneBrktsData: tmntFullData.oneBrkts,
    potEntriesData: potEntries.data,
    potsData: pots.data,
    playersData: players.data,
    elimEntriesData: elimEntries.data,
    elimsData: elims.data,
    moneysData: moneys.data,
  });
};