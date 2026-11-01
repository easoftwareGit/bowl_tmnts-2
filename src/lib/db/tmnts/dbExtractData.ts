import type {
  brktDataFromPrismaType,
  brktEntryType,
  brktSeedType,
  brktType,
  divEntryType,
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
  tmntMoneyType
} from "@/lib/types/types";
import {
  blankBrkt,
  blankBrktEntry,
  blankBrktSeed,
  blankDiv,
  blankDivEntry,
  blankElim,
  blankElimEntry,
  blankEvent,
  blankLane,
  blankOneBrkt,
  blankPlayer,
  blankPot,
  blankPotEntry,
  blankSquad,
  blankTmntMoney
} from "../initVals";
import { isBrktDataFromPrisma } from "@/lib/validation/typeGuards";
import { calcHandicap } from "../helpers";
import { removeTimeFromISODateStr } from "@/lib/dateTools";

/**
 * Extracts brkt entries from prisma data
 * 
 * @param {unknown} brkt - brkt data from prisma
 * @returns {brktEntryType[]} - array of brkt entries 
 */
export const extractBrktEntries = (brkt: unknown): brktEntryType[] => {
  if (!isBrktDataFromPrisma(brkt)) return [];

  const parseTimestamp = (value: unknown): number | undefined => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? undefined : date.getTime();
    }
    return undefined;
  };

  const typedBrkt = brkt as brktDataFromPrismaType;
  const hasRefundObjs = typedBrkt.brkt_entries.some(
    (entry) => entry.brkt_refunds != null
  );

  return typedBrkt.brkt_entries.map((brktEntry) => {
    const brktFeeNum = Number(typedBrkt?.fee);

    return {
      ...blankBrktEntry,
      id: brktEntry.id ?? "",
      brkt_id: brktEntry.brkt_id ?? "",
      player_id: brktEntry.player_id ?? "",
      num_brackets: brktEntry.num_brackets ?? 0,
      num_refunds: hasRefundObjs ? brktEntry.brkt_refunds?.num_refunds ?? 0 : 0,
      fee: brktEntry.num_brackets > 0 ? String(brktFeeNum * brktEntry.num_brackets) : "",
      time_stamp: parseTimestamp(brktEntry.time_stamp) ?? 0,
    };
  })
}

/**
 * extract brkt data from GET API response
 *
 * @param {any} brkts - array of brkts from GET API response
 * @returns {brktType[]} - array of brkts
 */
export const extractBrkts = (brkts: any): brktType[] => {
  if (!brkts || !Array.isArray(brkts)) return [];

  return brkts.map((brkt: any) => ({
    ...blankBrkt,
    id: brkt.id,
    squad_id: brkt.squad_id,
    div_id: brkt.div_id,
    start: brkt.start,
    games: brkt.games,
    players: brkt.players,
    fee: brkt.fee,
    first: brkt.first,
    second: brkt.second,
    admin: brkt.admin,
    fsa: (Number(brkt.fee) * brkt.players).toString(),
    sort_order: brkt.sort_order,
  }));
};

/**
 * extracts brktSeeds from API response
 *
 * @param {any} brktSeeds - array of brktSeeds from GET API response
 * @returns {brktSeedType[]} - array of brktSeeds with extracted data
 */
export const extractBrktSeeds = (brktSeeds: any): brktSeedType[] => {
  if (!brktSeeds || !Array.isArray(brktSeeds)) return [];
  return brktSeeds.map((brktSeed: any) => ({
    ...blankBrktSeed,
    one_brkt_id: brktSeed.one_brkt_id,
    seed: brktSeed.seed,
    player_id: brktSeed.player_id,
  }));
};

/**
 * Extract div entries from GET API response
 *
 * @param {any} divEntries - array of divEntries from GET API response
 * @returns {divEntryType[]} - array of divEntries with extracted data
 */
export const extractDivEntries = (divEntries: any): divEntryType[] => {
  if (!divEntries || !Array.isArray(divEntries)) return [];

  return divEntries.map((divEntry: any) => ({
    ...blankDivEntry,
    id: divEntry.id,
    squad_id: divEntry.squad_id,
    div_id: divEntry.div_id,
    player_id: divEntry.player_id,
    fee: divEntry.fee + "",
    hdcp: calcHandicap(
      divEntry.player.average,
      divEntry.div.hdcp_from,
      divEntry.div.hdcp_per,
      divEntry.div.int_hdcp
    ),
  }));
};

/**
 * extract div data from GET API response
 *
 * @param {any} divs - array of divs from GET API response
 * @returns {divType[]} - array of divs
 */
export const extractDivs = (divs: any): divType[] => {
  if (!divs || !Array.isArray(divs)) return [];
  return divs.map((div: any) => ({ 
    ...blankDiv,
    id: div.id,
    tmnt_id: div.tmnt_id,
    div_name: div.div_name,
    tab_title: div.div_name,
    hdcp_per: div.hdcp_per,
    hdcp_per_str: (div.hdcp_per * 100).toFixed(2),
    hdcp_from: div.hdcp_from,
    int_hdcp: div.int_hdcp,
    hdcp_for: div.hdcp_for,
    sort_order: div.sort_order,    
  }));
};

/**
 * extract elim entries from GET API response
 * 
 * @param {any} elimEntries - array of elimEntries from GET API response
 * @returns {elimEntryType[]} - array of elimEntries 
 */
export const extractElimEntries = (elimEntries: any): elimEntryType[] => {
  if (!elimEntries || !Array.isArray(elimEntries)) return [];

  return elimEntries.map((elimEntry: any) => ({
    ...blankElimEntry,
    id: elimEntry.id,
    elim_id: elimEntry.elim_id,
    player_id: elimEntry.player_id,
    fee: elimEntry.fee + "",
  }));
};

/**
 * extract elim data from GET API response
 *
 * @param {any} elims - array of elims from GET API response
 * @returns {elimType[]} - array of elims with extracted data
 */
export const extractElims = (elims: any): elimType[] => {
  if (!elims || !Array.isArray(elims)) return [];

  return elims.map((elim: any) => ({
    ...blankElim,
    id: elim.id,
    div_id: elim.div_id,
    squad_id: elim.squad_id,
    start: elim.start,
    games: elim.games,
    fee: elim.fee,
    sort_order: elim.sort_order,
  }));
};

/**
 * extracts events from GET API response
 *
 * @param {any} events - array of events from GET API response
 * @returns {eventType[]} - array of events
 */
export const extractEvents = (events: any): eventType[] => {
  if (!events || !Array.isArray(events)) return [];

  return events.map((event: any) => ({
    ...blankEvent,
    id: event.id,
    tmnt_id: event.tmnt_id,
    event_name: event.event_name,
    tab_title: event.event_name,
    team_size: event.team_size,
    games: event.games,
    entry_fee: event.entry_fee,
    lineage: event.lineage,
    prize_fund: event.prize_fund,
    other: event.other,
    expenses: event.expenses,
    added_money: event.added_money,
    lpox: event.entry_fee, // no need to calculate, fee = lpox
    sort_order: event.sort_order,
  }));
};

/**
 * extract lanes from API response
 *
 * @param {any} lanes - lanes to be extracted
 * @returns {laneType[]} - array of lanes
 */
export const extractLanes = (lanes: any): laneType[] => {
  if (!lanes || !Array.isArray(lanes)) return [];
  return lanes.map((lane: any) => ({
    ...blankLane,
    id: lane.id,
    squad_id: lane.squad_id,
    lane_number: lane.lane_number,
    in_use: lane.in_use,
  }));
};

/**
 * Extract oneBrkts from GET API response
 *
 * @param {any} oneBrkts - array of oneBrkts from GET API response
 * @returns {oneBrktType[]} - array of oneBrkts
 */
export const extractOneBrkts = (oneBrkts: any): oneBrktType[] => {
  if (!oneBrkts || !Array.isArray(oneBrkts)) return [];

  return oneBrkts.map((oneBrkt: any) => ({
    ...blankOneBrkt,
    id: oneBrkt.id,
    brkt_id: oneBrkt.brkt_id,
    bindex: oneBrkt.bindex,
  }));
};

/**
 * extracts player data from GET API response
 *
 * @param {any} players - array of players from GET API response
 * @returns {playerType[]} - array of players with extracted data
 */
export const extractPlayers = (players: any): playerType[] => {
  return players.map((player: any) => ({
    ...blankPlayer,
    id: player.id,
    squad_id: player.squad_id,
    first_name: player.first_name,
    last_name: player.last_name,
    average: player.average,
    lane: player.lane,
    position: player.position,
  }));
};

/**
 * Extracts potEntries from GET API response
 *
 * @param {unknown} potEntries - array of potEntries from GET API response
 * @returns {potEntryType[]} - array of potEntries with extracted data
 */
export const extractPotEntries = (potEntries: unknown): potEntryType[] => {
  if (!Array.isArray(potEntries)) return [];

  return potEntries.map((potEntry: any) => ({
    ...blankPotEntry,
    id: potEntry.id,
    pot_id: potEntry.pot_id,
    player_id: potEntry.player_id,
    fee: potEntry.fee + "",
  }));
};

/**
 * extracts pots data from GET API response
 *
 * @param {any} pots - array of pots from GET API response
 * @returns {potType[]} - array of pots with extracted data
 */
export const extractPots = (pots: any): potType[] => {
  if (!pots || !Array.isArray(pots)) return [];

  return pots.map((pot: any) => ({
    ...blankPot,
    id: pot.id,
    div_id: pot.div_id,
    squad_id: pot.squad_id,
    pot_type: pot.pot_type,
    fee: pot.fee,
    sort_order: pot.sort_order,
  }));
};

/**
 * extracts squads from GET API response
 *
 * @param {any} squads - array of squads from GET API response
 * @returns {squadType[]} - array of squads
 */
export const extractSquads = (squads: any): squadType[] => {
  if (!squads || !Array.isArray(squads)) return [];
  return squads.map((squad: any) => ({
    ...blankSquad,
    id: squad.id,
    event_id: squad.event_id,
    squad_name: squad.squad_name,
    tab_title: squad.squad_name,
    games: squad.games,
    lane_count: squad.lane_count,
    starting_lane: squad.starting_lane,
    squad_date_str: removeTimeFromISODateStr(squad.squad_date),
    squad_time: squad.squad_time,
    sort_order: squad.sort_order,    
  }));
};

/**
 * extracts money data from GET API response
 *
 * @param {any} tmntMoneys - array of tmntMoneys from GET API response
 * @returns {tmntMoneyType[]} - array of players with extracted data
 */
export const extractTmntMoneys = (tmntMoneys: any): tmntMoneyType[] => {
  return tmntMoneys.map((tmntMoney: any) => ({
    ...blankTmntMoney,
    id: tmntMoney.id,
    event_id: tmntMoney.event_id,
    squad_id: tmntMoney.squad_id,
    div_id: tmntMoney.div_id,
    descrip: tmntMoney.descrip,
    flow: tmntMoney.flow,
    amount: Number(tmntMoney.amount) || 0,
    pot_id: tmntMoney.pot_id,
    brkt_id: tmntMoney.brkt_id,
    elim_id: tmntMoney.elim_id,
    sort_order: tmntMoney.sort_order
  }));
};