import type {
  tmntDataType,
  eventDataType,
  divDataType,
  squadDataType,
  fullStageDataType,
  laneDataType,
  potDataType,
  brktDataType,
  fullBrktsDataType,
  elimDataType,
  playerDataType,
  divEntryDataType,
  potEntryDataType,
  elimEntryDataType,
  HdcpForTypes,
  potCategoriesTypes,
  oneBrktType,
  brktSeedType,
  brktRefundType,
  brktDataFromPrismaType,
} from "@/lib/types/types";

import { SquadStage } from "@prisma/client";

/* --------------------------------------------------
   basic helpers
-------------------------------------------------- */

const isObject = (obj: unknown): obj is Record<string, unknown> => {
  return !!obj && typeof obj === "object" && !Array.isArray(obj);
};

const isString = (val: unknown): val is string => typeof val === "string";

const isNumber = (val: unknown): val is number =>
  typeof val === "number" && !Number.isNaN(val);

const isBoolean = (val: unknown): val is boolean => typeof val === "boolean";

const isDate = (val: unknown): val is Date =>
  val instanceof Date && !Number.isNaN(val.getTime());

const isNull = (val: unknown): val is null => val === null;

const isOptionalString = (val: unknown): val is string | undefined =>
  typeof val === "undefined" || typeof val === "string";

const isOptionalUnknown = (val: unknown): val is undefined =>
  typeof val === "undefined";

const isNullableDate = (val: unknown): val is Date | null =>
  isDate(val) || isNull(val);

const isNullableString = (val: unknown): val is string | null =>
  isString(val) || isNull(val);


/* --------------------------------------------------
   type guards
-------------------------------------------------- */

export const isBrktData = (obj: unknown): obj is brktDataType => {
  if (!isObject(obj)) return false;

  return (
    isString(obj.id) &&
    isString(obj.div_id) &&
    isString(obj.squad_id) &&
    isString(obj.fee) &&
    isNumber(obj.start) &&
    isNumber(obj.games) &&
    isNumber(obj.players) &&
    isString(obj.first) &&
    isString(obj.second) &&
    isString(obj.admin) &&
    isNumber(obj.sort_order)
  );
};

export const isBrktDataFromPrisma = (obj: unknown): obj is brktDataFromPrismaType => {
  if (!isObject(obj)) return false;

  return (
    isString(obj.id) &&
    isString(obj.div_id) &&
    isString(obj.squad_id) &&
    isString(obj.fee) &&
    isNumber(obj.start) &&
    isNumber(obj.games) &&
    isNumber(obj.players) &&
    isString(obj.first) &&
    isString(obj.second) &&
    isString(obj.admin) &&
    isNumber(obj.sort_order) &&
    // additional properties for prisma
    isString(obj.createdAt) &&
    isString(obj.updatedAt) &&
    Array.isArray(obj.brkt_entries) &&
    Array.isArray(obj.one_brkts)
  );
}

export const isBrktEntryData = (obj: unknown): obj is brktDataFromPrismaType => {
  if (!isObject(obj)) return false;

  return (
    isString(obj.id) &&
    isString(obj.brkt_id) &&
    isString(obj.player_id) &&
    isNumber(obj.num_brackets) &&
    isNumber(obj.num_refunds) &&
    isDate(obj.time_stamp)
    // additional properties for 
  );
};

export const isBrktRefund = (obj: unknown): obj is brktRefundType => {
  if (!isObject(obj)) return false; 

  return (
    isString(obj.brkt_entry_id) &&
    isNumber(obj.num_refunds)
  );
};

export const isBrktSeed = (obj: unknown): obj is brktSeedType => {
  if (!isObject(obj)) return false; 

  return (
    isString(obj.one_brkt_id) &&
    isNumber(obj.seed) &&
    isString(obj.player_id)
  );
};

export const isDivData = (obj: unknown): obj is divDataType => {
  if (!isObject(obj)) return false;

  return (
    isString(obj.id) &&
    isString(obj.tmnt_id) &&
    isString(obj.div_name) &&
    isNumber(obj.hdcp_per) &&
    isNumber(obj.hdcp_from) &&
    isBoolean(obj.int_hdcp) &&
    isHdcpForType(obj.hdcp_for) &&
    isNumber(obj.sort_order)
  );
};

export const isDivEntryData = (obj: unknown): obj is divEntryDataType => {
  if (!isObject(obj)) return false;

  return (
    isString(obj.id) &&
    isString(obj.squad_id) &&
    isString(obj.div_id) &&
    isString(obj.player_id) &&
    isString(obj.fee)
  );
};

export const isElimData = (obj: unknown): obj is elimDataType => {
  if (!isObject(obj)) return false;

  return (
    isString(obj.id) &&
    isString(obj.div_id) &&
    isString(obj.squad_id) &&
    isString(obj.fee) &&
    isNumber(obj.start) &&
    isNumber(obj.games) &&
    isNumber(obj.sort_order)
  );
};

export const isElimEntryData = (obj: unknown): obj is elimEntryDataType => {
  if (!isObject(obj)) return false;

  return (
    isString(obj.id) &&
    isString(obj.elim_id) &&
    isString(obj.player_id) &&
    isString(obj.fee)
  );
};

export const isEventData = (obj: unknown): obj is eventDataType => {
  if (!isObject(obj)) return false;

  return (
    isString(obj.tmnt_id) &&
    isString(obj.event_name) &&
    isNumber(obj.team_size) &&
    isNumber(obj.games) &&
    isString(obj.entry_fee) &&
    isString(obj.lineage) &&
    isString(obj.prize_fund) &&
    isString(obj.other) &&
    isString(obj.expenses) &&
    isString(obj.added_money) &&
    isNumber(obj.sort_order) &&
    (isOptionalUnknown(obj.id) || isString(obj.id))
  );
};

export const isFullBrktsData = (obj: unknown): obj is fullBrktsDataType => {
  if (!isObject(obj)) return false;

  return (
    Array.isArray(obj.oneBrkts) &&
    obj.oneBrkts.every(isOneBrkt) &&
    Array.isArray(obj.brktSeeds) &&
    obj.brktSeeds.every(isBrktSeed)
  );
};

export const isFullStageData = (obj: unknown): obj is fullStageDataType => {
  if (!isObject(obj)) return false;

  return (
    isString(obj.id) &&
    isString(obj.squad_id) &&
    isSquadStage(obj.stage) &&
    isDate(obj.stage_set_at) &&
    isNullableDate(obj.scores_started_at) &&
    isBoolean(obj.stage_override_enabled) &&
    isNullableDate(obj.stage_override_at) &&
    isString(obj.stage_override_reason)
  );
};

const hdcpForValues: readonly HdcpForTypes[] = ["Game", "Series"] as const;

export const isHdcpForType = (val: unknown): val is HdcpForTypes => {
  return typeof val === "string" && hdcpForValues.includes(val as HdcpForTypes);
};

export const isLaneData = (obj: unknown): obj is laneDataType => {
  if (!isObject(obj)) return false;

  return (
    isString(obj.id) &&
    isString(obj.squad_id) &&
    isNumber(obj.lane_number) &&
    isBoolean(obj.in_use)
  );
};

export const isOneBrkt = (obj: unknown): obj is oneBrktType => {
  if (!isObject(obj)) return false; 

  return (
    isString(obj.id) &&
    isString(obj.brkt_id) &&
    isNumber(obj.bindex)
  );
};

export const isPlayerData = (obj: unknown): obj is playerDataType => {
  if (!isObject(obj)) return false;

  return (
    isString(obj.squad_id) &&
    isString(obj.first_name) &&
    isString(obj.last_name) &&
    isNumber(obj.average) &&
    isNumber(obj.lane) &&
    isString(obj.position) &&
    (isOptionalUnknown(obj.id) || isString(obj.id))
  );
};

const potCategoryValues: readonly potCategoriesTypes[] = [
  "Game",
  "Last Game",
  "Series",
  "",
] as const;

export const isPotCategoryType = (val: unknown): val is potCategoriesTypes => {
  return typeof val === "string" && potCategoryValues.includes(val as potCategoriesTypes);
};

export const isPotData = (obj: unknown): obj is potDataType => {
  if (!isObject(obj)) return false;

  return (
    isString(obj.id) &&
    isString(obj.div_id) &&
    isString(obj.squad_id) &&
    isPotCategoryType(obj.pot_type) &&
    isString(obj.fee) &&
    isNumber(obj.sort_order)
  );
};

export const isPotEntryData = (obj: unknown): obj is potEntryDataType => {
  if (!isObject(obj)) return false;

  return (
    isString(obj.id) &&
    isString(obj.pot_id) &&
    isString(obj.player_id) &&
    isString(obj.fee)
  );
};

export const isSquadData = (obj: unknown): obj is squadDataType => {
  if (!isObject(obj)) return false;

  return (
    isString(obj.id) &&
    isString(obj.event_id) &&
    isString(obj.squad_name) &&
    isNumber(obj.games) &&
    isNumber(obj.lane_count) &&
    isNumber(obj.starting_lane) &&
    isDate(obj.squad_date) &&
    isNullableString(obj.squad_time) &&
    isNumber(obj.sort_order)
  );
};

export const isSquadStage = (val: unknown): val is SquadStage => {
  return Object.values(SquadStage).includes(val as SquadStage);
};

export const isTmntData = (obj: unknown): obj is tmntDataType => {
  if (!isObject(obj)) return false;

  return (
    isString(obj.id) &&
    isString(obj.tmnt_name) &&
    isDate(obj.start_date) &&
    isDate(obj.end_date) &&
    isString(obj.user_id) &&
    isString(obj.bowl_id)
  );
};
